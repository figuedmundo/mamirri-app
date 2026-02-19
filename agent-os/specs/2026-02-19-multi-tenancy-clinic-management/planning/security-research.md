# Multi-Tenancy Security Research & Recommendations

## Executive Summary

Based on OWASP guidelines, industry best practices, and analysis of the current codebase, this document outlines critical security considerations for implementing multi-tenancy in a healthcare SaaS application.

---

## 1. Multi-Tenancy Architectural Patterns

### Pattern Comparison

| Pattern                                    | Isolation Level | Complexity | Best For                          |
| ------------------------------------------ | --------------- | ---------- | --------------------------------- |
| **Shared Database + Tenant Discriminator** | Medium          | Low        | Cost-sensitive, high tenant count |
| **Shared Database + Schema Isolation**     | High            | Medium     | Compliance requirements           |
| **Database-per-Tenant**                    | Highest         | High       | Enterprise/regulated industries   |

### Recommended Approach: Shared Database + Tenant Discriminator (Application-Level)

**Rationale for Mamirri:**

- Clinic count will be low (< 100 initially)
- Need to balance security with simplicity
- PostgreSQL + Prisma ORM work well with this model
- Easier backup and maintenance than schema/database isolation

**Key Implementation:**

```prisma
// All tenant-scoped tables include clinicId
model Patient {
  id       String @id @default(cuid())
  clinicId String // Foreign key to Clinic
  clinic   Clinic @relation(fields: [clinicId], references: [id])
  // ... other fields

  @@index([clinicId]) // Critical for performance
}
```

---

## 2. Critical Security Principles (OWASP Guidelines)

### 2.1 Tenant Context Management

**NEVER trust client-supplied tenant IDs.**

**Bad (Vulnerable):**

```typescript
// DANGEROUS: Tenant ID from request parameter
@Get(':clinicId/patients')
getPatients(@Param('clinicId') clinicId: string) {
  return this.patientsService.findByClinic(clinicId); // Attacker can modify!
}
```

**Good (Secure):**

```typescript
// GOOD: Tenant ID from authenticated JWT
@Get('patients')
@UseGuards(JwtAuthGuard)
getPatients(@CurrentUser() user: UserPayload) {
  // clinicId comes from validated JWT, not user input
  return this.patientsService.findByClinic(user.clinicId);
}
```

**Requirements:**

- [ ] Add `clinicId` to JWT payload
- [ ] Add `role` to JWT payload (THERAPIST, CLINIC_OWNER, ADMIN)
- [ ] Create `CurrentUser` decorator that extracts user context
- [ ] Validate tenant exists and is active on every request

### 2.2 Data Access Layer Security

**The Golden Rule: Always include tenant filter**

Every database query MUST filter by `clinicId`. No exceptions.

**Repository Pattern with Tenant Enforcement:**

```typescript
@Injectable()
export class TenantAwareRepository<T> {
  constructor(
    private prisma: PrismaService,
    private model: string,
  ) {}

  async findById(id: string, clinicId: string): Promise<T | null> {
    return this.prisma[this.model].findFirst({
      where: {
        id,
        clinicId, // ALWAYS include tenant filter
      },
    });
  }

  async findAll(clinicId: string, options?: any): Promise<T[]> {
    return this.prisma[this.model].findMany({
      where: { clinicId },
      ...options,
    });
  }

  async create(data: any, clinicId: string): Promise<T> {
    return this.prisma[this.model].create({
      data: {
        ...data,
        clinicId, // Auto-assign tenant
      },
    });
  }
}
```

### 2.3 Preventing Cross-Tenant IDOR (Insecure Direct Object Reference)

**The Attack:**

```
GET /api/patients/123  → Returns patient 123
GET /api/patients/456  → Returns patient 456 (different clinic!)
```

**Defense Strategy:**

1. **Composite Key Lookups:** Always query by `(id, clinicId)`
2. **Generic Error Messages:** Don't reveal if resource exists in another tenant
3. **Repository Pattern:** Centralize all data access with tenant enforcement

**Implementation:**

```typescript
// ❌ WRONG - Vulnerable to IDOR
async getPatient(id: string) {
  return this.prisma.patient.findUnique({ where: { id } });
}

// ✅ CORRECT - Tenant-scoped access
async getPatient(id: string, clinicId: string) {
  const patient = await this.prisma.patient.findFirst({
    where: { id, clinicId }
  });

  if (!patient) {
    // Generic error - don't reveal if patient exists in other clinic
    throw new NotFoundException('Patient not found');
  }

  return patient;
}
```

---

## 3. Authorization Architecture

### 3.1 Role-Based Access Control (RBAC)

**Role Hierarchy:**

```
ADMIN
  └── Can manage all clinics, users, and data

CLINIC_OWNER
  └── Can manage all clinic's users and all clinic data
  └── Can invite/deactivate therapists
  └── Can view all clinic patients/cases

THERAPIST
  └── Can view/manage own patients and cases
  └── Can view all clinic patients (read-only)
  └── Can create new patients for clinic
```

### 3.2 NestJS Guard Implementation

**Roles Decorator:**

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Roles Guard:**

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**Combined Guard Approach:**

```typescript
// guards/clinic-roles.guard.ts
@Injectable()
export class ClinicRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Verify user has a clinic assigned
    if (!user.clinicId) {
      throw new ForbiddenException('User not assigned to clinic');
    }

    // 2. Check if clinic is active
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: user.clinicId },
    });

    if (!clinic || !clinic.isActive) {
      throw new ForbiddenException('Clinic is not active');
    }

    // 3. Check role permissions
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // 4. Attach clinic context to request for downstream use
    request.clinic = clinic;

    return true;
  }
}
```

### 3.3 Controller Usage

```typescript
@Controller('patients')
@UseGuards(JwtAuthGuard, ClinicRolesGuard)
export class PatientsController {
  @Get()
  @Roles('THERAPIST', 'CLINIC_OWNER')
  findAll(@CurrentUser() user: UserPayload) {
    // All queries automatically filtered by user's clinic
    return this.patientsService.findAll(user.clinicId);
  }

  @Post()
  @Roles('THERAPIST', 'CLINIC_OWNER')
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: UserPayload) {
    return this.patientsService.create(dto, user.userId, user.clinicId);
  }

  @Delete(':id')
  @Roles('CLINIC_OWNER') // Only owners can delete
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.patientsService.remove(id, user.clinicId);
  }
}
```

---

## 4. Critical Security Checklist

### Database Layer

- [ ] Add `clinicId` to all tenant-scoped tables
- [ ] Create indexes on `clinicId` for query performance
- [ ] Add foreign key constraints with `ON DELETE CASCADE`
- [ ] Implement soft delete (paranoid mode) for audit trails

### Application Layer

- [ ] Create `TenantAwareRepository` base class
- [ ] Add clinicId to JWT payload
- [ ] Create `ClinicRolesGuard` for authorization
- [ ] Implement `CurrentUser` decorator
- [ ] Add `Roles` decorator for method-level access control

### API Layer

- [ ] Remove all endpoints that accept tenant ID from parameters
- [ ] Validate clinic context on every request
- [ ] Return generic 404 (not 403) for cross-tenant access attempts
- [ ] Implement rate limiting per clinic

### Testing

- [ ] Unit tests for `ClinicRolesGuard`
- [ ] Integration tests for cross-tenant access denial
- [ ] E2E tests for complete clinic isolation
- [ ] Security tests for IDOR vulnerabilities

---

## 5. Common Pitfalls to Avoid

### 5.1 The "Admin Bypass" Bug

```typescript
// ❌ DANGEROUS - Admin can access any clinic
if (user.role === 'ADMIN' || patient.clinicId === user.clinicId) {
  return patient;
}

// ✅ CORRECT - Admin still scoped to tenant context
// Admins manage clinics via separate admin endpoints
// Regular endpoints always enforce clinicId match
```

### 5.2 The "Export/Import" Leak

```typescript
// ❌ DANGEROUS - Export includes all patients
@Get('export')
exportData() {
  return this.patientsService.findAll(); // Missing clinic filter!
}

// ✅ CORRECT - Always filter by clinic
@Get('export')
exportData(@CurrentUser() user: UserPayload) {
  return this.patientsService.findAll(user.clinicId);
}
```

### 5.3 The "Search" Leak

```typescript
// ❌ DANGEROUS - Search across all clinics
@Get('search')
search(@Query('q') query: string) {
  return this.patientsService.search(query); // Missing clinic filter!
}

// ✅ CORRECT - Search scoped to clinic
@Get('search')
search(
  @Query('q') query: string,
  @CurrentUser() user: UserPayload,
) {
  return this.patientsService.search(query, user.clinicId);
}
```

---

## 6. Testing Strategy for Tenant Isolation

### Unit Tests

```typescript
describe('TenantAwareRepository', () => {
  it('should only return patients from the specified clinic', async () => {
    // Create patients in different clinics
    const clinic1Patient = await createPatient({ clinicId: 'clinic-1' });
    const clinic2Patient = await createPatient({ clinicId: 'clinic-2' });

    // Query for clinic-1
    const results = await repository.findAll('clinic-1');

    // Should only see clinic-1's patient
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(clinic1Patient.id);
  });

  it('should return 404 for cross-tenant access attempt', async () => {
    const patient = await createPatient({ clinicId: 'clinic-1' });

    // Try to access from clinic-2 context
    await expect(repository.findById(patient.id, 'clinic-2')).rejects.toThrow(
      NotFoundException,
    );
  });
});
```

### Integration Tests

```typescript
describe('Multi-tenancy E2E', () => {
  it('should isolate data between clinics', async () => {
    // Login as therapist from clinic A
    const clinicAToken = await login('therapist-a@clinic-a.com');

    // Create patient in clinic A
    const patient = await createPatient(clinicAToken, { name: 'John' });

    // Login as therapist from clinic B
    const clinicBToken = await login('therapist-b@clinic-b.com');

    // Try to access patient from clinic A using clinic B token
    const response = await request(app)
      .get(`/patients/${patient.id}`)
      .set('Authorization', `Bearer ${clinicBToken}`);

    // Should return 404 (not 403) to avoid information leakage
    expect(response.status).toBe(404);
  });
});
```

---

## 7. Implementation Phases

### Phase 1: Schema & Core Infrastructure

1. Create `Clinic` model
2. Add `clinicId` to `User` and `Patient` models
3. Update JWT payload to include `clinicId` and `role`
4. Create base `TenantAwareRepository`

### Phase 2: Authorization Layer

1. Implement `ClinicRolesGuard`
2. Create `Roles` decorator
3. Update `CurrentUser` decorator
4. Add guards to all controllers

### Phase 3: Service Layer Updates

1. Update all services to accept `clinicId` parameter
2. Add tenant filtering to all queries
3. Update existing tests

### Phase 4: Clinic Management

1. Create Clinic CRUD endpoints (ADMIN only)
2. Implement therapist invitation flow
3. Create Clinic Admin dashboard

### Phase 5: Testing & Security Audit

1. Write tenant isolation tests
2. Perform security audit
3. Document clinic management procedures

---

## 8. References

- [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Top 10 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [CWE-639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html)

---

## Summary

**Critical Success Factors:**

1. **Trust only the JWT** - Never accept tenant IDs from user input
2. **Defense in depth** - Tenant filtering at database AND application layer
3. **Generic errors** - Don't reveal if resources exist in other tenants
4. **Comprehensive testing** - Test cross-tenant access denial at every layer
5. **Repository pattern** - Centralize tenant enforcement

**This architecture provides:**

- Strong tenant isolation
- Clear role-based access control
- Defense against common multi-tenancy attacks (IDOR, tenant impersonation)
- Maintainable and testable code structure

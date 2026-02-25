# MamirriApp - Developer Quick Reference

## Role Constants

```typescript
// apps/server/src/common/constants/roles.ts
export const ROLES = {
  ADMIN: 'ADMIN', // System superuser
  CLINIC_OWNER: 'CLINIC_OWNER', // Clinic administrator
  THERAPIST: 'THERAPIST', // Clinic staff
} as const;
```

## Quick Role Checks

### Backend (NestJS)

```typescript
import { ROLES } from '../common/constants/roles';
import { Roles } from '../common/decorators/roles.decorator';
import { ClinicRolesGuard } from '../common/guards/clinic-roles.guard';

// Protect endpoint for specific roles
@Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)
@UseGuards(JwtAuthGuard, ClinicRolesGuard)
async myEndpoint() { }

// Check role in service
if (user.role === ROLES.ADMIN) {
  // Admin bypass
}

if (user.role === ROLES.CLINIC_OWNER) {
  // Owner permissions
}
```

### Frontend (React)

```typescript
import { useClinic } from '../hooks/use-clinic';

const { isAdmin, isClinicOwner } = useClinic();

if (isAdmin) {
  // Show admin features
}

if (isClinicOwner) {
  // Show owner features
}
```

## Onboarding API

### Check Clinic Name

```http
GET /api/v1/onboarding/check-name?name=Fisioterapia%20Garcia

Response:
{
  "available": true
}
```

### Create Clinic with Admin

```http
POST /api/v1/onboarding/clinic
Content-Type: application/json

{
  "clinicName": "Fisioterapia García",
  "clinicEmail": "clinic@example.com",
  "clinicPhone": "+34 912 345 678",
  "clinicAddress": "Calle Mayor 123, Madrid",
  "adminName": "Dr. María García",
  "adminEmail": "maria@example.com",
  "adminPassword": "securePass123",
  "adminLicenseNumber": "F-12345"
}

Response:
{
  "user": { "id": "...", "role": "CLINIC_OWNER", ... },
  "clinic": { "id": "...", "name": "Fisioterapia García", ... },
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

## Invitation API

### Invite User to Clinic

```http
POST /api/v1/clinics/:clinicId/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "therapist@example.com",
  "role": "THERAPIST"  // or "CLINIC_OWNER"
}
```

### Accept Invitation

```http
POST /api/v1/auth/accept-invitation
Content-Type: application/json

{
  "token": "invitation-token-from-email",
  "name": "New User Name",
  "password": "userPassword123"
}
```

## Permission Checks

| Action           |  ADMIN   |    CLINIC_OWNER     | THERAPIST |
| ---------------- | :------: | :-----------------: | :-------: |
| Create clinic    |    ✅    | ✅ (via onboarding) |    ❌     |
| View all clinics |    ✅    |         ❌          |    ❌     |
| View own clinic  |    ✅    |         ✅          |    ✅     |
| Edit clinic      | ✅ (any) |      ✅ (own)       |    ❌     |
| Invite users     | ✅ (any) |      ✅ (own)       |    ❌     |
| Remove users     | ✅ (any) |      ✅ (own)       |    ❌     |
| Create patients  | ✅ (any) |      ✅ (own)       | ✅ (own)  |
| View patients    | ✅ (any) |      ✅ (own)       | ✅ (own)  |

## Database Queries

### Get All Clinics (ADMIN only)

```typescript
prisma.clinic.findMany({
  orderBy: { createdAt: 'desc' },
  include: {
    _count: {
      select: { users: true, patients: true },
    },
  },
});
```

### Get Clinic with Access Check

```typescript
// Admin can access any, others only their own
if (user.role !== ROLES.ADMIN && user.clinicId !== clinicId) {
  throw new ForbiddenException();
}
```

## Frontend Routes

```typescript
// Public
/login                 // Login page
/onboarding            // Create clinic flow
/onboarding/success    // Success screen
/invite/accept         // Accept invitation

// Protected
/                      // Dashboard
/pacientes             // Patients
/analisis              // Analysis
/biblioteca            // Library
/clinica               // Clinic settings (owners only)
/ajustes               // Settings
/perfil                // Profile
```

## Common Patterns

### Protect Route by Role

```typescript
// In component
const { user } = useAuth();

if (user?.role !== ROLES.CLINIC_OWNER) {
  return <Navigate to="/" />;
}
```

### Show/Hide UI by Role

```typescript
const { isClinicOwner } = useClinic();

{isClinicOwner && (
  <Button>Manage Clinic</Button>
)}
```

### Backend Service Check

```typescript
private ensureClinicAccess(clinicId: string, currentUser: CurrentUser) {
  // Admin bypass
  if (currentUser.role === ROLES.ADMIN) return;

  // Others must match
  if (currentUser.clinicId !== clinicId) {
    throw new NotFoundException('Clinic not found');
  }
}
```

## Error Responses

| Scenario                 | Status | Message                                     |
| ------------------------ | ------ | ------------------------------------------- |
| Duplicate clinic name    | 409    | "A clinic with this name already exists"    |
| Duplicate email          | 409    | "An account with this email already exists" |
| Insufficient permissions | 403    | "Insufficient permissions"                  |
| Clinic not found         | 404    | "Clinic not found"                          |
| Invalid credentials      | 401    | "Invalid credentials"                       |

## Testing

### Create Test Admin

```bash
curl -X POST http://localhost:3000/api/v1/onboarding/clinic \
  -H "Content-Type: application/json" \
  -d '{
    "clinicName": "Test Clinic",
    "clinicEmail": "test@test.com",
    "adminName": "Test Admin",
    "adminEmail": "admin@test.com",
    "adminPassword": "password123"
  }'
```

### Check Name Availability

```bash
curl "http://localhost:3000/api/v1/onboarding/check-name?name=TestClinic"
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mamirri

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# Optional: Admin seed
ADMIN_EMAIL=admin@mamirri.com
ADMIN_PASSWORD=secure-password
```

## File Locations

| Component             | Path                                                          |
| --------------------- | ------------------------------------------------------------- |
| Role constants        | `apps/server/src/common/constants/roles.ts`                   |
| Role guard            | `apps/server/src/common/guards/clinic-roles.guard.ts`         |
| Onboarding service    | `apps/server/src/modules/onboarding/onboarding.service.ts`    |
| Onboarding controller | `apps/server/src/modules/onboarding/onboarding.controller.ts` |
| Clinics service       | `apps/server/src/modules/clinics/clinics.service.ts`          |
| Onboarding page       | `apps/client/src/pages/Onboarding.tsx`                        |
| Login page            | `apps/client/src/pages/Login.tsx`                             |
| Auth hook             | `apps/client/src/hooks/use-auth.ts`                           |
| Clinic hook           | `apps/client/src/hooks/use-clinic.ts`                         |

## Quick Commands

```bash
# Seed database (includes admin if configured)
pnpm --filter server db:seed

# Reset database
pnpm --filter server db:reset

# Generate Prisma client
pnpm --filter server db:generate

# Run backend tests
pnpm --filter server test

# Run frontend
pnpm --filter client dev
```

---

**For full documentation, see:** `.documentation/roles-and-onboarding.md`

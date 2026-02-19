# Task Breakdown: Multi-Tenancy Clinic Management

## Overview

Total Tasks: 35+ tasks across 6 major groups

Complexity: HIGH - This is a foundational architecture change affecting the entire application

## Task List

### Database Layer

#### Task Group 1: Clinic Model and Core Schema

**Dependencies:** None

- [x] 1.0 Complete Clinic model and migrations
  - [x] 1.1 Write 4-6 focused tests for Clinic model
    - Test: Clinic creation with all fields
    - Test: Clinic relation to users (has_many)
    - Test: Clinic relation to patients (has_many)
    - Test: Clinic soft delete behavior (isActive flag)
    - Test: Clinic validations (name required, etc.)
  - [x] 1.2 Create `Clinic` model
    - Fields: id (cuid), name (String), address (String?), phone (String?), email (String?), isActive (Boolean, default: true), createdAt, updatedAt
    - Relations: has_many users, has_many patients
    - Follow pattern from existing models (User, Patient)
  - [x] 1.3 Create Prisma migration for Clinic table
    - Add indexes: id (primary), name (for search)
  - [x] 1.4 Add `clinicId` foreign key to User model
    - Remove deprecated `clinicName` field
    - Add relation: User belongs_to Clinic
    - Add index on clinicId
  - [x] 1.5 Add `clinicId` foreign key to Patient model
    - Add relation: Patient belongs_to Clinic
    - Add optional `primaryTherapistId` field
    - Add indexes: clinicId, therapistId, primaryTherapistId
  - [x] 1.6 Ensure database layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify migrations apply cleanly
    - Test associations work correctly

**Acceptance Criteria:**

- Clinic model created with all fields and relations
- User model updated with clinicId (clinicName removed)
- Patient model updated with clinicId and primaryTherapistId
- All 4-6 tests pass
- Migrations run successfully without errors

#### Task Group 2: Tenant-Scoped Tables Migration

**Dependencies:** Task Group 1

- [x] 2.0 Add clinicId to all tenant-scoped tables
  - [x] 2.1 Add `clinicId` to ClinicalCase model
    - ClinicalCase inherits clinic from Patient (via patient.clinicId)
    - Add relation or computed field
    - Create migration
  - [x] 2.2 Add `clinicId` to TreatmentSession model
    - Inherits from ClinicalCase
    - Create migration with index
  - [x] 2.3 Add `clinicId` to Evaluation model
    - Inherits from ClinicalCase
    - Create migration with index
  - [x] 2.4 Add `clinicId` to Session model
    - Inherits from Patient
    - Create migration with index
  - [x] 2.5 Add `clinicId` to SessionPhoto model
    - Inherits from TreatmentSession
    - Create migration with index
  - [x] 2.6 Add `clinicId` to AiAnalysis model
    - Inherits from ClinicalCase
    - Create migration with index
  - [x] 2.7 Add `clinicId` to AiFeedback model
    - Inherits from AiAnalysis
    - Create migration with index
  - [x] 2.8 Run all database migrations and verify schema

**Acceptance Criteria:**

- All tenant-scoped tables have clinicId field
- Indexes created for query performance
- Foreign key constraints in place
- Schema matches spec requirements

#### Task Group 3: PostgreSQL RLS Policies

**Dependencies:** Task Group 2

- [x] 3.0 Implement Row-Level Security policies
  - [x] 3.1 Write 4-6 tests for RLS policies
    - Test: Direct SQL query respects RLS
    - Test: Cross-tenant access blocked at DB level
    - Test: User can access own clinic data
    - Test: Admin bypass (if applicable)
  - [x] 3.2 Enable RLS on tenant-scoped tables
    - ALTER TABLE ... ENABLE ROW LEVEL SECURITY
    - ALTER TABLE ... FORCE ROW LEVEL SECURITY
    - Tables: users, patients, clinical_cases, treatment_sessions, evaluations, sessions, session_photos, ai_analyses, ai_feedbacks
  - [x] 3.3 Create RLS policies for direct clinic association
    - Users table: `clinic_id = current_setting('app.current_clinic_id')::uuid`
    - Patients table: `clinic_id = current_setting('app.current_clinic_id')::uuid`
  - [x] 3.4 Create RLS policies for indirect clinic association
    - ClinicalCase: via patient.clinic_id
    - TreatmentSession: via clinical_case.patient.clinic_id
    - Evaluation: via clinical_case.patient.clinic_id
    - Use subqueries or joins in USING clause
  - [x] 3.5 Create database function to set tenant context
    - Function: `set_tenant_context(clinic_id uuid)`
    - Sets: `SET LOCAL app.current_clinic_id = clinic_id`
  - [x] 3.6 Ensure RLS tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify policies block unauthorized access
    - Verify policies allow authorized access

**Acceptance Criteria:**

- RLS enabled on all tenant-scoped tables
- Policies prevent cross-tenant data access at database level
- Function to set tenant context works correctly
- All 4-6 RLS tests pass

### Backend Authorization Layer

#### Task Group 4: JWT and Auth Updates

**Dependencies:** Task Group 1

- [x] 4.0 Update authentication to include clinic context
  - [x] 4.1 Write 3-4 tests for JWT payload changes
    - Test: JWT contains clinicId and role
    - Test: Token refresh preserves clinic context
    - Test: Invalid clinic in token rejected
  - [x] 4.2 Update JWT payload in AuthService
    - Add `clinicId` to payload
    - Add `role` to payload
    - Update login, register, refresh methods
  - [x] 4.3 Update JWT validation in JwtStrategy
    - Extract clinicId from payload
    - Extract role from payload
    - Return full user context (userId, email, role, clinicId)
  - [x] 4.4 Update CurrentUser decorator
    - Ensure it returns clinicId and role
    - Update type definitions
  - [x] 4.5 Ensure auth tests pass
    - Run ONLY the 3-4 tests written in 4.1
    - Verify JWT contains correct claims

**Acceptance Criteria:**

- JWT payload includes clinicId and role
- CurrentUser decorator returns full context
- All 3-4 auth tests pass
- Existing auth flows still work

#### Task Group 5: Role-Based Access Control

**Dependencies:** Task Group 4

- [x] 5.0 Implement Roles decorator and ClinicRolesGuard
  - [x] 5.1 Write 5-6 tests for role-based access control
    - Test: ADMIN can access all clinics
    - Test: CLINIC_OWNER can access own clinic only
    - Test: THERAPIST can access own clinic only
    - Test: Cross-clinic access returns 404
    - Test: Missing role returns 403
    - Test: Invalid role rejected
  - [x] 5.2 Create Roles decorator
    - File: `src/common/decorators/roles.decorator.ts`
    - Usage: `@Roles('ADMIN', 'CLINIC_OWNER')`
    - Store roles in metadata using SetMetadata
  - [x] 5.3 Create ClinicRolesGuard
    - File: `src/common/guards/clinic-roles.guard.ts`
    - Implements CanActivate
    - Validates JWT is present and valid
    - Extracts role from request.user
    - Checks role against metadata requirements
    - Validates clinic is active (DB check)
    - Returns generic 404 for cross-tenant attempts
  - [x] 5.4 Create Roles enum or constant
    - Define: ADMIN, CLINIC_OWNER, THERAPIST
    - Export for use across application
  - [x] 5.5 Ensure RBAC tests pass
    - Run ONLY the 5-6 tests written in 5.1
    - Verify guard blocks unauthorized access
    - Verify guard allows authorized access

**Acceptance Criteria:**

- Roles decorator created and functional
- ClinicRolesGuard validates roles and clinic context
- Cross-tenant access returns 404 (not 403)
- All 5-6 RBAC tests pass

### API Layer

#### Task Group 6: Clinic Management Endpoints

**Dependencies:** Task Groups 1, 4, 5

- [x] 6.0 Create Clinic module and admin endpoints
  - [x] 6.1 Write 5-6 tests for clinic API endpoints
    - Test: ADMIN can create clinic
    - Test: ADMIN can list all clinics
    - Test: CLINIC_OWNER can view own clinic
    - Test: Non-owner cannot view other clinic (404)
    - Test: THERAPIST cannot create clinic (403)
    - Test: Update clinic validates fields
  - [x] 6.2 Create Clinic module structure
    - Module: `src/modules/clinics/clinics.module.ts`
    - Controller: `src/modules/clinics/clinics.controller.ts`
    - Service: `src/modules/clinics/clinics.service.ts`
    - DTOs: create-clinic.dto.ts, update-clinic.dto.ts
  - [x] 6.3 Implement POST /admin/clinics (ADMIN only)
    - Create clinic with provided details
    - Return clinic data
  - [x] 6.4 Implement GET /admin/clinics (ADMIN only)
    - List all clinics with pagination
    - Include therapist count, patient count
  - [x] 6.5 Implement GET /clinics/:id (CLINIC_OWNER+)
    - Get clinic by ID
    - Verify user belongs to clinic
    - Include related data (counts)
  - [x] 6.6 Implement PATCH /clinics/:id (CLINIC_OWNER+)
    - Update clinic settings
    - Validate ownership
  - [x] 6.7 Ensure clinic API tests pass
    - Run ONLY the 5-6 tests written in 6.1
    - Verify authorization enforced
    - Verify CRUD operations work

**Acceptance Criteria:**

- Clinic module created with controller, service, DTOs
- Admin endpoints work (create, list all)
- Clinic owner endpoints work (view, update own)
- Authorization enforced correctly
- All 5-6 API tests pass

#### Task Group 7: Therapist Invitation System

**Dependencies:** Task Group 6

- [x] 7.0 Implement invitation workflow
  - [x] 7.1 Write 6-7 tests for invitation system
    - Test: CLINIC_OWNER can invite therapist
    - Test: Invitation token generated with expiry
    - Test: Token validation on acceptance
    - Test: Expired token rejected
    - Test: Used token rejected
    - Test: User created with correct clinic and role
    - Test: Non-owner cannot invite (403)
  - [x] 7.2 Create Invitation model/entity
    - Fields: id, email, clinicId, token, expiresAt, usedAt, createdAt
    - Relations: belongs_to Clinic
    - Migration with indexes
  - [x] 7.3 Implement POST /clinics/:id/invite
    - Generate secure random token (JWT or UUID)
    - Set 24-hour expiration
    - Save invitation to database
    - Send email with invitation link
    - Use clinic owner context from JWT
  - [x] 7.4 Implement POST /auth/invite/accept (Public)
    - Validate token exists and not expired
    - Validate token not already used
    - Create user account with clinicId from invitation
    - Set default role: THERAPIST
    - Mark invitation as used
    - Log invitation acceptance
    - Return tokens (login user)
  - [x] 7.5 Create invitation email template
    - Subject: "You've been invited to join [Clinic Name]"
    - Body: Welcome message, clinic info, accept link
    - Link: `/invite/accept?token=[token]`
  - [x] 7.6 Implement GET /clinics/:id/therapists
    - List all users in clinic
    - Include role, status, join date
  - [x] 7.7 Implement PATCH /clinics/:id/therapists/:userId
    - Update therapist role (THERAPIST, CLINIC_OWNER)
    - Deactivate/reactivate therapist
    - Verify CLINIC_OWNER making request
  - [x] 7.8 Ensure invitation tests pass
    - Run ONLY the 6-7 tests written in 7.1
    - Verify full invitation flow works

**Acceptance Criteria:**

- Invitation model created with proper fields
- Invitation endpoint generates valid tokens
- Email sent with correct link
- Acceptance flow creates user correctly
- Token security enforced (expiry, one-time use)
- All 6-7 invitation tests pass

#### Task Group 8: Update Existing Services for Tenant Isolation

**Dependencies:** Task Groups 3, 4, 5

- [x] 8.0 Update all services to filter by clinicId
  - [x] 8.1 Update PatientsService
    - Add clinicId parameter to all methods
    - Filter queries by clinicId
    - Set DB tenant context before queries
    - Update create to auto-assign clinicId from user
  - [x] 8.2 Update ClinicalCasesService
    - Filter by clinicId through patient relationship
    - Validate user has access to case's clinic
  - [x] 8.3 Update SessionsService
    - Filter by clinicId
    - Validate clinic access
  - [x] 8.4 Update AiAnalysisService
    - Filter analyses by clinicId
    - Keep RAG functionality unchanged (global documents)
  - [x] 8.5 Create TenantAwareRepository base class
    - Generic repository with clinic filtering
    - Methods: findById, findAll, create, update
    - Automatic tenant context setting
  - [x] 8.6 Write 4-5 integration tests for service updates
    - Test: Service returns only own clinic data
    - Test: Cross-clinic query returns empty/not found
    - Test: Create assigns correct clinicId
    - Test: Update validates clinic ownership
  - [x] 8.7 Ensure service tests pass
    - Run ONLY the 4-5 tests written in 8.6
    - Verify tenant isolation works

**Acceptance Criteria:**

- All services updated to filter by clinicId
- TenantAwareRepository base class created
- Cross-clinic data access blocked
- All 4-5 service tests pass

### Frontend Layer

#### Task Group 9: Frontend Auth Context Updates

**Dependencies:** Task Group 4

- [x] 9.0 Update frontend authentication
  - [x] 9.1 Update AuthContext
    - Add clinicId to user state
    - Add role to user state
    - Update login/register to store new fields
    - Update type definitions
  - [x] 9.2 Update API client
    - JWT already sent in headers (no change needed)
    - Add interceptor for 403/404 handling
  - [x] 9.3 Add clinic display to header
    - Show clinic name in navbar
    - Show user role badge
  - [x] 9.4 Create useClinic hook
    - Returns current clinic context
    - Helper for checking permissions
  - [x] 9.5 Write 2-3 tests for auth context
    - Test: Context contains clinicId and role
    - Test: Login stores clinic data
    - Test: Hook returns correct clinic

**Acceptance Criteria:**

- AuthContext includes clinicId and role
- Header displays clinic name and role
- useClinic hook created
- All 2-3 frontend auth tests pass

#### Task Group 10: Clinic Dashboard UI

**Dependencies:** Task Group 9

- [x] 10.0 Create clinic management UI
  - [x] 10.1 Create ClinicOwnerDashboard page
    - Route: `/clinic/dashboard`
    - Layout: Sidebar or tabs
    - Sections: Therapists, Settings, Invitations
  - [x] 10.2 Create TherapistList component
    - Table with columns: Name, Email, Role, Status, Actions
    - Actions: Change role, Deactivate
    - Use Shadcn/UI Table component
  - [x] 10.3 Create InviteTherapistDialog
    - Email input field
    - Role selection (THERAPIST, CLINIC_OWNER)
    - Submit button with loading state
    - Success/error feedback
    - Use Shadcn/UI Dialog, Input, Select
  - [x] 10.4 Create ClinicSettings component
    - Form fields: Name, Address, Phone, Email
    - Save button
    - Validation feedback
  - [x] 10.5 Create InvitationAcceptance page
    - Route: `/invite/accept?token=...`
    - Public route (no auth required)
    - Shows: Clinic name, invitation details
    - Form: Name, Password, Confirm Password
    - Submit creates account and logs in
  - [x] 10.6 Write 3-4 tests for clinic UI
    - Test: Dashboard renders for CLINIC_OWNER
    - Test: Therapist list displays data
    - Test: Invite dialog submits correctly
    - Test: Invitation acceptance works
  - [x] 10.7 Ensure clinic UI tests pass
    - Run ONLY the 3-4 tests written in 10.6

**Acceptance Criteria:**

- Clinic dashboard page created
- Therapist management UI functional
- Invitation system UI complete
- All 3-4 UI tests pass
- Components follow Shadcn/UI patterns

### Testing & Security

#### Task Group 11: Tenant Isolation Testing

**Dependencies:** Task Groups 8, 10

- [ ] 11.0 Comprehensive tenant isolation tests
  - [x] 11.1 Write integration tests for cross-tenant access
    - Test: User A (Clinic 1) cannot access User B (Clinic 2) patient
    - Test: User A (Clinic 1) cannot access User B (Clinic 2) case
    - Test: CLINIC_OWNER can access all clinic data
    - Test: THERAPIST can access all clinic patients (read)
    - Test: THERAPIST can modify only own patients
    - Test: ADMIN can access any clinic data
  - [ ] 11.2 Write E2E tests for complete flows
    - Test: Complete invitation flow (invite → accept → login)
    - Test: Clinic setup flow (create → invite → manage)
    - Test: Data isolation verification across clinics
  - [ ] 11.3 Write security penetration tests
    - Test: Tampering with clinicId in JWT
    - Test: Accessing endpoint with wrong clinic in URL
    - Test: SQL injection attempts on clinic filters
    - Test: Brute force on invitation tokens
  - [ ] 11.4 Run all tenant isolation tests
    - Total tests: approximately 15-20
    - All must pass before deployment
  - [ ] 11.5 Document security test results
    - Summary of test coverage
    - Any vulnerabilities found and fixed

**Acceptance Criteria:**

- Comprehensive test suite covering tenant isolation
- All cross-tenant access attempts blocked
- E2E flows work correctly
- Security tests pass
- 15-20 total tests written and passing

#### Task Group 12: Final Integration and Verification

**Dependencies:** All previous groups

- [ ] 12.0 Final integration testing and cleanup
  - [x] 12.1 Verify all existing endpoints still work
    - Run existing test suites
    - Fix any regressions
  - [x] 12.2 Verify RLS policies are active
    - Check database: `\d+ tablename` for policies
    - Test bypass attempts fail
  - [ ] 12.3 Performance test with RLS enabled
    - Query response times acceptable
    - Index usage verified
  - [ ] 12.4 Documentation update
    - API documentation updated (Swagger)
    - Architecture decision record (ADR) for multi-tenancy
    - Deployment notes for RLS setup
  - [x] 12.5 Final security review
    - Review all authorization logic
    - Verify no hardcoded tenant IDs
    - Check for any bypass scenarios
  - [x] 12.6 Run full test suite
    - All tests must pass
    - No critical failures

**Acceptance Criteria:**

- No regressions in existing functionality
- RLS policies active and enforced
- Performance acceptable
- Documentation complete
- Full test suite passes

## Execution Order

Recommended implementation sequence:

1. **Database Layer** (Task Groups 1-3)
   - Clinic model and schema (Group 1)
   - Add clinicId to tenant tables (Group 2)
   - RLS policies (Group 3)

2. **Authorization Layer** (Task Groups 4-5)
   - JWT updates (Group 4)
   - Roles and guards (Group 5)

3. **API Layer** (Task Groups 6-8)
   - Clinic CRUD endpoints (Group 6)
   - Invitation system (Group 7)
   - Service updates (Group 8)

4. **Frontend Layer** (Task Groups 9-10)
   - Auth context updates (Group 9)
   - Clinic dashboard UI (Group 10)

5. **Testing & Security** (Task Groups 11-12)
   - Tenant isolation tests (Group 11)
   - Final integration (Group 12)

**Critical Path:** Groups 1 → 4 → 5 → 6 → 7 → 11

These groups must be completed in order and form the minimum viable implementation.

## Notes

- **Fresh Database**: As specified, no migration needed - will use fresh database
- **RLS Critical**: Do not skip RLS implementation - it's the final security layer
- **Testing Strategy**: Each group writes 2-8 focused tests, final groups add comprehensive isolation tests
- **No AI Changes**: KnowledgeBase/RAG functionality remains unchanged (documents are global)
- **Email Service**: May need to create EmailService if not already present

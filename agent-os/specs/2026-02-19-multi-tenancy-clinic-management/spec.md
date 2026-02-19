# Specification: Multi-Tenancy Clinic Management

## Goal

Implement multi-tenancy architecture to support multiple physiotherapy clinics, each with isolated access to their own therapists and patients, while sharing the global medical literature knowledge base.

## User Stories

- As an **ADMIN**, I want to create clinics and manage their access so that each clinic operates independently with data isolation.
- As a **CLINIC_OWNER**, I want to invite therapists to my clinic and manage their permissions so that my team can collaborate on patient care.
- As a **THERAPIST**, I want to access patients in my clinic so that I can provide treatment while ensuring patient data privacy.

## Specific Requirements

**Multi-Tenancy Architecture**

- Use shared database with tenant discriminator (`clinicId`) on all clinic-scoped tables
- Implement PostgreSQL Row-Level Security (RLS) as final enforcement layer
- Store `clinicId` and `role` in JWT payload for request context
- Use `AsyncLocalStorage` or request context for tenant propagation
- Never accept `clinicId` from client input - always derive from authenticated user

**Database Schema Updates**

- Create `Clinic` model with id, name, address, phone, email, isActive, timestamps
- Add `clinicId` foreign key to: users, patients, clinical_cases, treatment_sessions, evaluations, sessions, session_photos, ai_analyses, ai_feedbacks, insoles, footprints, posture_videos, treatment_plans
- Remove deprecated `clinicName` string field from User model
- Add `primaryTherapistId` optional field to Patient for "usual therapist" assignment
- Create RLS policies on all tenant-scoped tables using `current_setting('app.current_clinic_id')`
- Index all `clinicId` columns for query performance

**Role-Based Access Control (RBAC)**

- Implement three roles: `ADMIN`, `CLINIC_OWNER`, `THERAPIST`
- `ADMIN`: Full system access, manage all clinics, view system-wide data
- `CLINIC_OWNER`: Manage own clinic's therapists, view all clinic patients, full CRUD on clinic data
- `THERAPIST`: View all clinic patients (read), manage own patients (CRUD), create patients for clinic
- Create `ClinicRolesGuard` combining authentication + role validation
- Create `Roles` decorator for method-level access control
- Return generic 404 (not 403) for cross-tenant access attempts to prevent information leakage

**API Endpoints**

- `POST /admin/clinics` - Create clinic (ADMIN only)
- `GET /admin/clinics` - List all clinics (ADMIN only)
- `GET /clinics/:id` - Get clinic details (CLINIC_OWNER+ of that clinic)
- `PATCH /clinics/:id` - Update clinic settings (CLINIC_OWNER+ of that clinic)
- `POST /clinics/:id/invite` - Invite therapist by email (CLINIC_OWNER+)
- `GET /clinics/:id/therapists` - List clinic therapists (CLINIC_OWNER+)
- `PATCH /clinics/:id/therapists/:userId` - Update therapist role/deactivate (CLINIC_OWNER+)
- `DELETE /clinics/:id/therapists/:userId` - Remove therapist from clinic (CLINIC_OWNER+)
- `POST /auth/invite/accept` - Accept invitation and create account (public)
- Update all existing endpoints to use `clinicId` from JWT context

**Invitation Workflow**

- Generate secure, time-limited invitation tokens (24-hour expiration)
- Send invitation email with unique accept link containing token
- Validate token on acceptance, create user account with clinic assignment
- Set default role to THERAPIST for invited users
- Invalidate token after use
- Log all invitation events for audit trail

**Service Layer Updates**

- Create `TenantAwareRepository` base class for tenant-scoped queries
- Update `PatientsService` to filter by `clinicId` on all queries
- Update `ClinicalCasesService` to filter by `clinicId` through patient relationship
- Update `SessionsService` to filter by `clinicId`
- Update `AiAnalysisService` to filter analyses by `clinicId`
- Set database context before each query: `SET LOCAL app.current_clinic_id`

**Frontend Components**

- Create `ClinicAdminDashboard` page for managing clinic therapists
- Create `InviteTherapistDialog` with email input and role selection
- Create `TherapistList` component with deactivate/role change actions
- Update `AuthContext` to include `clinicId` and `role`
- Add clinic name display in header/navbar
- Create invitation acceptance page at `/invite/accept?token=...`

**Security & Testing**

- Implement RLS policies on all tenant-scoped tables
- Create comprehensive test suite for tenant isolation:
  - Unit tests for `ClinicRolesGuard`
  - Integration tests for cross-tenant access denial
  - E2E tests for complete data isolation between clinics
- Test scenarios: same user different clinic, different users same clinic, admin access
- Log all cross-tenant access attempts with user and timestamp

**AI Analysis Compatibility**

- Verify RAG analysis remains unaffected by multi-tenancy
- Documents/Embeddings tables remain global (no clinic isolation needed)
- AiAnalysis and AiFeedback tables get `clinicId` for result isolation
- Patient data anonymization happens before RAG queries (already implemented)
- No changes needed to KnowledgeBaseService or RAG pipeline

## Visual Design

No visual mockups provided. Use existing Shadcn/UI components following established patterns in the codebase:

- Use `Dialog` for invitation modal
- Use `Table` for therapist list
- Use `Card` for clinic dashboard layout
- Use `Badge` for role display
- Follow existing form patterns for clinic settings

## Existing Code to Leverage

**Auth Module** (`src/modules/auth/`)

- JWT strategy and guards already implemented
- `CurrentUser` decorator pattern established
- Refresh token and logout flow can be extended
- Extend JWT payload to include `clinicId` and `role`

**Patients Module** (`src/modules/patients/`)

- `CurrentTherapist` decorator already exists
- Service layer pattern with therapist-scoped queries established
- Extend existing patterns to use `clinicId` instead of `therapistId` for data access

**Prisma Schema** (`prisma/schema.prisma`)

- Existing relationship patterns between User-Patient-ClinicalCase
- Similar foreign key patterns to replicate for `clinicId`
- Index patterns to follow for performance

**Guards Pattern** (`src/modules/auth/guards/`)

- `JwtAuthGuard` implementation to extend
- NestJS guard pattern established with `CanActivate`
- Reflector usage for metadata-based authorization

**Email Integration**

- Use existing email service if available, or implement new `EmailService`
- Invitation emails should match existing email patterns in the app

## Out of Scope

- Billing/subscription management per clinic
- Custom clinic branding or white-labeling
- Patient self-registration by clinic
- Multi-location clinics (sub-entities under a clinic)
- Clinic-specific configuration (working hours, services offered)
- Cross-clinic patient sharing or transfers
- Database-per-tenant or schema-per-tenant isolation
- Complex ABAC (Attribute-Based Access Control) - RBAC is sufficient
- Tenant onboarding/offboarding automation (manual ADMIN process)
- Clinic analytics or reporting dashboard
- Audit log UI (logs stored in database only)

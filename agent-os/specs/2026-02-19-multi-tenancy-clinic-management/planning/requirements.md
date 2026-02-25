# Spec Requirements: Multi-Tenancy Clinic Management

## Initial Description

Possibility to add a clinic that will have therapists and patients (multi-tenancy)

This feature comes from field testing feedback (Week 9) where the need was identified to support multiple clinics/organizations, each with their own therapists and patients, rather than the current single-tenant architecture.

## Requirements Discussion

### First Round Questions

**Q1:** I assume a **Clinic** should be a first-class entity (its own database table) with a name, address, and contact info. A therapist would belong to one clinic. Is that correct, or should therapists be able to work across multiple clinics?

**Answer:** Yes, create a `Clinic` table. Therapists belong to exactly one clinic (1:N). No cross-clinic work initially. Simplest mental model for MVP.

**Q2:** I'm thinking patients should be scoped to a clinic (visible to all therapists in that clinic) rather than owned by a single therapist. Should we migrate existing patients to be clinic-scoped, or do you need patient-level therapist assignment within a clinic?

**Answer:** Patients are clinic-scoped (visible to all therapists in the clinic). Add optional `primaryTherapistId` for "who usually treats this patient." No migration needed - will use fresh database.

**Q3:** Should there be a **Clinic Owner** role who can manage therapists (invite, deactivate) and view all clinic data, separate from regular therapists who only see their own patients and cases?

**Answer:** Yes. Extend `User.role` enum: `['THERAPIST', 'CLINIC_OWNER', 'ADMIN']`.

- `THERAPIST`: View/manage own patients/cases only
- `CLINIC_OWNER`: Manage all clinic patients + invite/deactivate therapists + view all clinic data
- `ADMIN`: Reserved for app owners (can manage multiple clinics)

**Q4:** For data migration, I assume existing users with a `clinicName` field should become the first admin/therapist of a new Clinic record with that name. Should we automatically create these clinics during migration, or will you manually set up the clinic structure first?

**Answer:** No migration needed. Will dump the database and make it new (fresh start).

**Q5:** I'm assuming patients cannot belong to multiple clinics simultaneously (no cross-clinic sharing). Is that correct, or do you need to support patients who might visit different clinic locations?

**Answer:** Correct. Patients belong to exactly one clinic. No cross-clinic sharing.

**Q6:** Should the clinic context be part of the URL (e.g., `/clinic/:clinicId/patients`) or managed via user session/context after login? I'm leaning toward session-based to keep URLs clean—does that work for you?

**Answer:** Session/context-based after login. Store `currentClinicId` in JWT token or user context. URLs stay clean (`/patients`, `/cases`).

**Q7:** For the initial implementation, I assume billing/subscription management per clinic is out of scope (covered in Part 4 "Future" roadmap items). Should we just track `subscriptionStatus` and `subscriptionExpiresAt` fields on Clinic as placeholders for now?

**Answer:** No billing/subscription fields needed for now. Keep it simple.

**Q8:** Is there anything specific you DON'T want in the first version of multi-tenancy?

**Answer:** Exclude: custom clinic branding/logos, patient self-registration, multi-location clinics as sub-entities, clinic-specific configuration (working hours, services offered).

### Existing Code to Reference

No similar existing features identified for reference. This is a new architectural pattern for the codebase.

### Follow-up Questions

No follow-up questions needed. All requirements clarified and confirmed.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

#### Core Entities

1. **Clinic Model**
   - `id`: UUID primary key
   - `name`: String (required)
   - `address`: String (optional)
   - `phone`: String (optional)
   - `email`: String (optional)
   - `createdAt`: DateTime
   - `updatedAt`: DateTime
   - Relationships: has many therapists, has many patients

2. **Updated User Model**
   - `role`: Enum `['THERAPIST', 'CLINIC_OWNER', 'ADMIN']`
   - `clinicId`: Foreign key to Clinic (required)
   - Remove: `clinicName` field (was temporary string)

3. **Updated Patient Model**
   - `clinicId`: Foreign key to Clinic (required)
   - `primaryTherapistId`: Foreign key to User (optional)
   - Keep: `therapistId` for backward compatibility during transition

#### User Roles & Permissions

| Role           | Permissions                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `THERAPIST`    | View/manage own patients and cases within their clinic                                                       |
| `CLINIC_OWNER` | All therapist permissions + invite/deactivate therapists + view all clinic data + manage all clinic patients |
| `ADMIN`        | Full system access, manage multiple clinics, view all data                                                   |

#### Key Flows

1. **Clinic Creation Flow**
   - ADMIN creates clinic with name, address, contact info
   - ADMIN invites first CLINIC_OWNER via email
   - CLINIC_OWNER accepts invitation and sets up account

2. **Therapist Invitation Flow**
   - CLINIC_OWNER sends invitation email to new therapist
   - New therapist clicks link, creates account
   - Automatically assigned to inviting clinic
   - Default role: THERAPIST

3. **Patient Management Flow**
   - Any therapist in clinic can view all clinic patients
   - Patient creation automatically assigns to therapist's clinic
   - Optional `primaryTherapistId` tracks usual therapist

4. **Data Isolation**
   - Backend validates all requests against user's `clinicId`
   - Therapists cannot access patients from other clinics
   - Frontend shows clinic context in header/profile

#### API Endpoints Needed

**Clinic Management (ADMIN only)**

- `POST /clinics` - Create clinic
- `GET /clinics` - List all clinics
- `GET /clinics/:id` - Get clinic details
- `PATCH /clinics/:id` - Update clinic
- `DELETE /clinics/:id` - Delete clinic

**Therapist Management (CLINIC_OWNER and above)**

- `POST /clinics/:clinicId/invite` - Invite therapist by email
- `GET /clinics/:clinicId/therapists` - List clinic therapists
- `PATCH /clinics/:clinicId/therapists/:id` - Update therapist (change role, deactivate)
- `DELETE /clinics/:clinicId/therapists/:id` - Remove therapist from clinic

**Authentication Updates**

- Update JWT payload to include `clinicId` and `role`
- Update registration flow to handle invited therapists

#### Frontend Components Needed

1. **ClinicAdminDashboard**
   - List of clinic therapists
   - Invite new therapist button (email input)
   - Therapist actions (deactivate, change role)
   - Clinic settings form

2. **TherapistInvitationPage**
   - Public route for invitation acceptance
   - Form: name, password creation
   - Auto-assign to clinic from invitation token

3. **ClinicContextIndicator**
   - Header component showing current clinic name
   - Visible on all pages when logged in

4. **Updated Registration Flow**
   - Handle invitation tokens in URL
   - Skip clinic selection for invited therapists

### Reusability Opportunities

- **Auth Module**: Extend existing JWT auth, NestJS guards
- **User Module**: Extend existing User service
- **Patient Module**: Update queries to filter by `clinicId`
- **UI Components**: Use existing Shadcn/UI components (Dialog, Form, Table, Button)

### Scope Boundaries

**In Scope:**

- Clinic entity with CRUD operations
- Three-tier role system (THERAPIST, CLINIC_OWNER, ADMIN)
- Therapist invitation workflow (email-based)
- Clinic-scoped patient access
- JWT token includes clinic context
- Clinic admin dashboard
- Data isolation at API level
- Fresh database setup (no migration)

**Out of Scope:**

- Billing/subscription management
- Custom clinic branding/logos
- Patient self-registration
- Multi-location clinics as sub-entities
- Clinic-specific configuration (working hours, services)
- Data migration from old schema
- Cross-clinic patient sharing
- Therapists working across multiple clinics
- Clinic analytics/reporting
- Audit logs for clinic operations

### Technical Considerations

#### Multi-Tenancy Architecture Decision

**Chosen Approach: Shared Database + Application-Level Filtering + PostgreSQL RLS (Row-Level Security)**

This provides defense in depth with multiple isolation layers:

1. **JWT Context**: Clinic ID derived from authenticated user
2. **Application Guards**: Role-based access control
3. **Database RLS**: Final enforcement layer for data isolation

**Why not schema-per-tenant or database-per-tenant?**

- Clinic count expected to be low (< 100)
- Simpler backup and maintenance
- Shared medical literature (Documents/Embeddings) doesn't need isolation
- Easier migration path from current single-tenant architecture

#### Tables Requiring RLS (Clinic-Scoped)

These tables need `clinicId` column and RLS policies:

- `users` - Each therapist belongs to one clinic
- `patients` - Patients belong to a clinic
- `clinical_cases` - Inherits clinic from patient
- `treatment_sessions` - Inherits clinic from clinical case
- `evaluations` - Inherits clinic from clinical case
- `sessions` - Inherits clinic from patient
- `session_photos` - Inherits clinic from treatment session
- `ai_analyses` - Inherits clinic from clinical case
- `ai_feedbacks` - Inherits clinic from analysis
- `insoles` - Inherits clinic from clinical case
- `footprints` - Inherits clinic from evaluation
- `posture_videos` - Inherits clinic from evaluation
- `treatment_plans` - Inherits clinic from clinical case
- `treatment_plan_protocols` - Inherits clinic from treatment plan

**Tables NOT Requiring RLS (Global/Shared)**

- `documents` - Medical literature shared across all clinics
- `embeddings` - Vector embeddings of shared literature
- `clinical_categories` - Shared taxonomy
- `protocols` - Shared treatment protocols
- `bibliographic_references` - Shared citations
- `anatomical_diagrams` - Shared visual resources

#### Database Schema Changes

```prisma
// New Clinic Model
model Clinic {
  id        String   @id @default(cuid())
  name      String
  address   String?
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  therapists User[]
  patients   Patient[]

  @@map("clinics")
}

// Updated User Model
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         String    @default("THERAPIST") // THERAPIST | CLINIC_OWNER | ADMIN
  pinHash      String?
  licenseNumber String?
  phone        String?
  profilePhotoUrl String?
  specialty    String?
  yearsExperience Int?
  createdAt    DateTime  @default(now())

  // Clinic relationship (REQUIRED)
  clinicId     String
  clinic       Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  // Remove: clinicName (was temporary string field)

  patients          Patient[]
  sessions          Session[]
  treatmentSessions TreatmentSession[]
  aiAnalyses        AiAnalysis[]

  @@index([email])
  @@index([clinicId])
  @@map("users")
}

// Updated Patient Model
model Patient {
  id                    String         @id @default(cuid())
  email                 String?
  name                  String
  phone                 String
  birthDate             DateTime
  gender                String?
  occupation            String
  previousOccupation    String?
  emergencyContact      Json?
  medicalFlags          String[]
  medicalFlagsOther     String?
  referralSource        String?
  referralSourceDetails String?
  isActive              Boolean        @default(true)
  deletedAt             DateTime?
  createdAt             DateTime       @default(now())

  // Clinic relationship (NEW - REQUIRED)
  clinicId              String
  clinic                Clinic         @relation(fields: [clinicId], references: [id], onDelete: Cascade)

  // Legacy field - keep temporarily, mark for removal
  therapistId           String
  therapist             User           @relation(fields: [therapistId], references: [id], onDelete: Cascade)

  // Optional primary therapist (NEW)
  primaryTherapistId    String?

  clinicalCases         ClinicalCase[]
  sessions              Session[]

  @@index([name])
  @@index([clinicId])
  @@index([therapistId])
  @@map("patients")
}
```

#### PostgreSQL RLS Policies

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedbacks ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE patients FORCE ROW LEVEL SECURITY;
ALTER TABLE clinical_cases FORCE ROW LEVEL SECURITY;
-- ... etc for all tenant tables

-- Create policies for each table
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

CREATE POLICY tenant_isolation_patients ON patients
  FOR ALL
  USING (clinic_id = current_setting('app.current_clinic_id')::uuid);

-- Note: Tables with indirect clinic relationships use joins
CREATE POLICY tenant_isolation_clinical_cases ON clinical_cases
  FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM patients
      WHERE clinic_id = current_setting('app.current_clinic_id')::uuid
    )
  );
```

#### Security Considerations

1. **Defense in Depth**:
   - JWT contains `clinicId` and `role` (trusted source)
   - Guards validate role permissions
   - All queries filter by clinic
   - RLS provides database-level enforcement

2. **Tenant Context Management**:

   ```typescript
   // Set clinic context for each request
   await prisma.$executeRaw`SET LOCAL app.current_clinic_id = ${clinicId}`;
   ```

3. **Cross-Tenant Access Prevention**:
   - Never accept `clinicId` from request parameters
   - Always derive from authenticated JWT
   - Return generic 404 (not 403) for unauthorized access
   - Log all cross-tenant access attempts

4. **Role-Based Access Control**:
   - `ADMIN`: Full system access
   - `CLINIC_OWNER`: Manage own clinic + invite therapists
   - `THERAPIST`: View clinic data + own patients

5. **Invitation System**:
   - Time-limited secure tokens
   - One-time use only
   - Audit trail for all invitations

#### AI Analysis & Multi-Tenancy

**Important**: AI Analysis (RAG) is NOT affected by multi-tenancy because:

- Medical literature (`documents`, `embeddings`) is shared across all clinics
- Patient data is anonymized before RAG queries
- Analysis results are stored per clinical case (already clinic-scoped)
- No PII is sent to external LLM services

Only the storage of analysis results (`ai_analyses`, `ai_feedbacks`) needs clinic isolation.

#### Implementation Order

1. Database schema changes (Clinic model, User updates, Patient updates)
2. Backend: Clinic service and controller
3. Backend: Updated auth with clinic context in JWT
4. Backend: Role-based guards
5. Backend: Therapist invitation service
6. Frontend: Clinic admin dashboard
7. Frontend: Invitation acceptance page
8. Frontend: Clinic context indicator
9. Testing: Verify data isolation between clinics

#### Files to Modify

**Backend:**

- `prisma/schema.prisma` - Add Clinic model, update User and Patient
- `src/auth/` - Update JWT payload, invitation handling
- `src/users/` - Add role-based guards
- `src/clinics/` - New module (service, controller, DTOs)
- `src/patients/` - Update queries to filter by clinic

**Frontend:**

- `src/contexts/AuthContext.tsx` - Add clinic context
- `src/pages/clinic/` - New clinic admin pages
- `src/pages/auth/invite/` - Invitation acceptance page
- `src/components/layout/` - Clinic context indicator

#### Testing Strategy

- Unit tests: Clinic service, role guards
- Integration tests: API endpoints with different roles
- E2E tests: Complete invitation flow, data isolation verification

# Task Breakdown: Clinic Onboarding

## Overview

Total Tasks: 25
Estimated Duration: 2-3 days

---

## Task List

### Database Layer

#### Task Group 1: Schema Updates and Migrations

**Dependencies:** None

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 4 focused tests for Clinic model validations
    - Test name uniqueness validation
    - Test required field validations (name, email)
    - Test optional field handling (phone, address, logoUrl)
    - Test businessHours JSON structure
  - [x] 1.2 Update Clinic model with new fields
    - Fields: logoUrl (string, optional), subdomain (string, optional, unique), businessHours (JSON, optional)
    - Reuse pattern from existing Clinic model (name, address, phone, email)
  - [x] 1.3 Create migration for new columns
    - Add logo_url VARCHAR(500)
    - Add subdomain VARCHAR(100) UNIQUE
    - Add business_hours JSONB
    - Add index on name field for faster lookups
  - [x] 1.4 Verify Patient model supports nullable clinicId
    - Confirm clinicId is already nullable (solo mode support)
    - Test patient creation without clinic association
  - [x] 1.5 Ensure database layer tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify migrations run successfully
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4 tests written in 1.1 pass
- Migrations run successfully on local and staging
- Clinic model accepts all new fields
- Patient model supports solo mode (clinicId nullable)

---

### API Layer

#### Task Group 2: Clinic Management Endpoints

**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer
  - [ ] 2.1 Write 6 focused tests for clinic endpoints
    - Test GET /clinics/check-name returns availability
    - Test POST /clinics creates clinic with all fields
    - Test POST /clinics with invitations sends emails
    - Test POST /clinics/:id/migrate-solo-patients migrates data
    - Test name validation (min length, uniqueness)
    - Test authorization (only owners can migrate patients)
  - [x] 2.2 Create GET /clinics/check-name endpoint
    - Accept name query parameter
    - Validate name length (2-100 chars)
    - Check uniqueness in database
    - Return { available: boolean }
  - [x] 2.3 Extend POST /clinics endpoint
    - Accept full payload: name, email, phone, address, logoUrl, businessHours
    - Accept initialInvitations array with email and role
    - Set creator as CLINIC_OWNER
    - Send invitation emails if provided
    - Follow pattern from existing clinics controller
  - [x] 2.4 Create POST /clinics/:id/migrate-solo-patients endpoint
    - Find all patients where clinicId=null for current user
    - Update clinicId to new clinic
    - Return migrated count
    - Require CLINIC_OWNER authorization
  - [x] 2.5 Add authorization checks
    - Use existing JwtAuthGuard
    - Add ClinicOwnerGuard for migration endpoint
    - Reuse patterns from ClinicDashboard authorization
  - [x] 2.6 Ensure API layer tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify all CRUD operations work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 6 tests written in 2.1 pass
- Name availability check responds < 100ms
- Clinic creation works with and without invitations
- Migration endpoint moves patients correctly
- Authorization enforced on protected endpoints

---

### Frontend Components

#### Task Group 3: Wizard Core Components

**Dependencies:** Task Group 2

- [x] 3.0 Complete wizard core components
  - [x] 3.1 Write 4 focused tests for wizard state management
    - Test state updates when navigating steps
    - Test form data persists to localStorage
    - Test reset clears all state
    - Test step validation before navigation
  - [x] 3.2 Create ClinicOnboardingContext
    - Manage currentStep, clinicData, invitations, isLoading, error states
    - Implement localStorage persistence
    - Reuse React Context pattern from existing hooks
  - [x] 3.3 Build ProgressIndicator component
    - Display 3 steps (1-2-3) with active/completed states
    - Show checkmark for completed steps
    - Allow click to navigate back to previous steps
    - Props: currentStep, steps array with labels
  - [x] 3.4 Implement Step1Essentials component
    - Fields: name (with async validation), email, phone (optional)
    - Debounced name uniqueness check (500ms)
    - Inline validation errors
    - "Set up later" button for solo mode
    - Reuse Input component from components/ui
    - Follow Register.tsx form patterns
  - [x] 3.5 Ensure wizard core tests pass
    - Run ONLY the 4 tests written in 3.1
    - Verify state management works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4 tests written in 3.1 pass
- State persists across page refresh
- Progress indicator shows correct step
- Step 1 validates fields in real-time

---

#### Task Group 4: Wizard Steps and Branding

**Dependencies:** Task Group 3

- [x] 4.0 Complete wizard step components
  - [x] 4.1 Write 4 focused tests for step components
    - Test Step2Branding renders all fields
    - Test logo upload accepts valid images
    - Test Step3Team handles invitations
    - Test navigation between steps preserves data
  - [x] 4.2 Implement Step2Branding component
    - Fields: address (textarea), logo upload, business hours picker
    - Logo upload: drag-drop zone, preview, 2MB max
    - Business hours: time pickers with Mon-Fri 9-17 defaults
    - Skip button to jump to Step 3
    - Back button returns to Step 1
    - Reuse file upload pattern from media service
  - [x] 4.3 Implement Step3Team component
    - Fields: email input, role selector (Admin/Therapist)
    - "+ Add another" for multiple invitations
    - Skip button to complete without invitations
    - Back button returns to Step 2
    - "Create Clinic" primary button submits
    - Reuse InviteTherapistDialog patterns
  - [x] 4.4 Build LogoUpload sub-component
    - Accept image/\* files
    - Show immediate preview
    - Upload to MinIO via existing API
    - Return URL to store in form state
    - Loading state during upload
  - [x] 4.5 Ensure step component tests pass
    - Run ONLY the 4 tests written in 4.1
    - Verify all steps render and navigate correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4 tests written in 4.1 pass
- All 3 steps render with correct fields
- Logo upload works with preview
- Navigation preserves form data

---

#### Task Group 5: Solo Mode and Quick Start

**Dependencies:** Task Group 4

- [x] 5.0 Complete solo mode and quick start components
  - [x] 5.1 Write 4 focused tests for solo mode and quick start
    - Test SoloModeBanner renders when clinicId is null
    - Test clicking banner opens upgrade flow
    - Test QuickStartScreen renders 3 action cards
    - Test card navigation works correctly
  - [x] 5.2 Create SoloModeBanner component
    - Display: "You're in personal mode. Set up a clinic to unlock team features →"
    - Show only when user.clinicId is null
    - Click opens simplified clinic creation (Step 1 only)
    - Dismissible (remember preference in localStorage)
    - Add to Dashboard layout below navigation
  - [x] 5.3 Build QuickStartScreen component
    - Header: "Welcome to [Clinic Name]!" with logo if uploaded
    - 3 action cards in grid layout:
      - "Create Your First Patient" → /patients/new
      - "Invite Your Team" → opens InviteTherapistDialog
      - "Configure Settings" → /clinic
    - Card styling: icon, title, description, action button
    - "Skip for now →" link to Dashboard
    - Responsive: 3-column desktop, stacked mobile
  - [x] 5.4 Implement solo mode upgrade flow
    - Simplified wizard (Step 1 only: name, email, phone)
    - On completion: call migration endpoint
    - Show confirmation: "Moved X patients to [Clinic Name]"
    - Redirect to Dashboard
  - [x] 5.5 Ensure solo mode tests pass
    - Run ONLY the 4 tests written in 5.1
    - Verify banner shows/hides correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4 tests written in 5.1 pass
- Solo mode banner displays for users without clinic
- Quick Start screen shows after clinic creation
- Upgrade flow migrates patients successfully

---

#### Task Group 6: Integration and Routing

**Dependencies:** Task Groups 3, 4, 5

- [x] 6.0 Complete integration and routing
  - [x] 6.1 Write 3 focused tests for routing logic
    - Test new user routes to onboarding wizard
    - Test invited user routes to invitation acceptance
    - Test existing clinic user routes to dashboard
  - [x] 6.2 Create ClinicOnboardingWizard container
    - Combine all steps with state management
    - Handle step navigation (Next/Back)
    - Submit clinic creation on Step 3
    - Show success state → redirect to Quick Start
  - [x] 6.3 Add routing logic to App.tsx
    - Route /onboarding/clinic to ClinicOnboardingWizard
    - Route /onboarding/quick-start to QuickStartScreen
    - Guard: redirect to wizard if no clinic and no invitation
    - Guard: redirect to dashboard if clinic exists
    - Reuse ProtectedRoute patterns
  - [x] 6.4 Implement auth redirect integration
    - After registration: check clinicId and invitation token
    - Route accordingly (wizard, invitation, or dashboard)
    - Update useAuth hook to handle post-registration routing
  - [x] 6.5 Add success animations
    - Confetti burst on clinic creation (canvas-confetti)
    - Step transition animations (CSS transitions)
    - Loading spinners on async operations
  - [x] 6.6 Ensure integration tests pass
    - Run ONLY the 3 tests written in 6.1
    - Verify routing works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3 tests written in 6.1 pass
- Routing logic handles all user states correctly
- Success animations display smoothly
- Mobile responsive on iPad Pro

---

### Testing

#### Task Group 7: Test Review and Gap Analysis

**Dependencies:** Task Groups 1-6

- [x] 7.0 Review existing tests and fill critical gaps
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review the 4 tests written by database-engineer (Task 1.1)
    - Review the 6 tests written by api-engineer (Task 2.1)
    - Review the 4 tests written by ui-designer (Task 3.1)
    - Review the 4 tests written by ui-designer (Task 4.1)
    - Review the 4 tests written by ui-designer (Task 5.1)
    - Review the 3 tests written by integration (Task 6.1)
    - Total existing tests: 25 tests
  - [x] 7.2 Analyze test coverage gaps for clinic onboarding feature
    - Identify critical gaps in end-to-end workflows
    - Focus on: wizard completion, solo mode upgrade, invitation flow
    - Do NOT assess entire application test coverage
  - [x] 7.3 Write up to 10 additional strategic tests
    - Add E2E test: full wizard flow (Step 1-2-3 → Quick Start)
    - Add E2E test: solo mode → upgrade → patient migration
    - Add integration test: invitation bypasses wizard
    - Add component test: error handling on API failures
    - Add validation test: edge cases for name validation
    - Maximum 10 new tests to fill critical gaps
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to clinic onboarding (25 + up to 10 new)
    - Expected total: approximately 35 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 35 tests total)
- Critical user workflows for clinic onboarding are covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on clinic onboarding feature requirements

---

## Execution Order

Recommended implementation sequence:

1. **Day 1 Morning:** Database Layer (Task Group 1)
2. **Day 1 Afternoon:** API Layer (Task Group 2)
3. **Day 2 Morning:** Wizard Core (Task Group 3) + Wizard Steps (Task Group 4)
4. **Day 2 Afternoon:** Solo Mode and Quick Start (Task Group 5)
5. **Day 3 Morning:** Integration and Routing (Task Group 6)
6. **Day 3 Afternoon:** Test Review and Gap Analysis (Task Group 7)

---

## Key Files to Create/Modify

### Backend

- `apps/server/prisma/migrations/[timestamp]_add_clinic_onboarding_fields/migration.sql`
- `apps/server/src/modules/clinics/clinics.controller.ts` (extend)
- `apps/server/src/modules/clinics/clinics.service.ts` (extend)
- `apps/server/src/modules/clinics/dto/create-clinic.dto.ts` (update)
- `apps/server/src/modules/clinics/clinics.controller.spec.ts` (tests)

### Frontend

- `apps/client/src/components/clinic-onboarding/ClinicOnboardingContext.tsx`
- `apps/client/src/components/clinic-onboarding/ClinicOnboardingWizard.tsx`
- `apps/client/src/components/clinic-onboarding/components/ProgressIndicator.tsx`
- `apps/client/src/components/clinic-onboarding/steps/Step1Essentials.tsx`
- `apps/client/src/components/clinic-onboarding/steps/Step2Branding.tsx`
- `apps/client/src/components/clinic-onboarding/steps/Step3Team.tsx`
- `apps/client/src/components/clinic-onboarding/components/LogoUpload.tsx`
- `apps/client/src/components/clinic-onboarding/components/SoloModeBanner.tsx`
- `apps/client/src/components/clinic-onboarding/QuickStart/index.tsx`
- `apps/client/src/App.tsx` (routing updates)

---

**Task List Version:** 1.0  
**Created:** 2026-02-19  
**Status:** Ready for Implementation

# Spec Requirements: Clinic-First Onboarding

## Initial Description

Replace the current user-first registration flow with a clinic-first onboarding flow that follows industry standards.

**Current Problem:**

- Users register as "therapists" first, then create a clinic
- Doctors find this confusing - they think "I'm creating a clinic, not joining a platform"
- Two separate steps with unclear role assignment

**Desired Solution:**
Implement a true clinic-first onboarding flow:

1. "Create Your Clinic" - collect clinic name, email, phone, address
2. "Create Admin Account" - collect owner name, email, password, license number
3. Create clinic and admin user together in a single transaction
4. User starts as CLINIC_OWNER, not THERAPIST

## Requirements Discussion

### Core Requirements Clarified

**Flow Structure:**

- 2-step wizard: Step 1 (Clinic Info) → Step 2 (Admin Account)
- Step 1 fields: Clinic name*, clinic email*, phone, address
- Step 2 fields: Full name*, email*, password*, confirm password*, license number
- Real-time validation on clinic name availability
- Single API call creates both clinic and owner

**User Role:**

- User is created with CLINIC_OWNER role immediately
- No intermediate THERAPIST state
- User.clinicId is set from the start (never null)

**Technical Decisions:**

- Backend: New OnboardingModule (not modifying existing AuthModule/ClinicsModule)
- Database: Transaction ensures both clinic and user created together
- Frontend: New OnboardingPage component replaces Register page
- No migration needed - database can be dumped during development
- Invitation flow remains separate and unchanged

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** Current Registration Flow - Path: `apps/client/src/pages/Register.tsx`
  - Components to reuse: Form layout patterns, validation approaches, error handling
  - Backend logic: `apps/server/src/modules/auth/auth.service.ts` (registration logic)

- **Feature:** Current Clinic Creation - Path: `apps/client/src/components/clinic-onboarding/ClinicOnboardingWizard.tsx`
  - Components to reuse: Step indicator, form field patterns, logo upload (future)
  - Backend logic: `apps/server/src/modules/clinics/clinics.service.ts` (clinic creation)

- **Feature:** Invitation Acceptance - Path: `apps/client/src/pages/InvitationAcceptance.tsx`
  - Pattern to follow: Single-purpose flow, clear user expectations
  - Backend logic: `apps/server/src/modules/auth/auth.service.ts` (acceptInvitation)

**Database Schema (No Changes Needed):**

- Current schema already supports this: `apps/server/prisma/schema.prisma`
- User model has: role, clinicId, clinicName fields
- Clinic model has all needed fields

## Visual Assets

### Files Provided:

No visual assets provided. Will create mockups as part of spec.

### Mockup Requirements:

- Step 1: Clinic information form
- Step 2: Admin account creation form
- Success/completion screen
- Flow diagram showing complete user journey

## Requirements Summary

### Functional Requirements

**Step 1: Clinic Information**

- [ ] Clinic name input with real-time availability check
- [ ] Clinic email input (validated)
- [ ] Phone number input (optional)
- [ ] Address textarea (optional)
- [ ] Continue button (enabled when required fields valid)
- [ ] Visual progress indicator showing Step 1 of 2

**Step 2: Admin Account Creation**

- [ ] Full name input
- [ ] Email input with validation
- [ ] Password input with minimum length indicator
- [ ] Confirm password input with match validation
- [ ] Professional license number (optional)
- [ ] Back button to return to Step 1
- [ ] Create Clinic button (submits to API)

**Backend API:**

- [ ] POST /onboarding/clinic endpoint
- [ ] GET /onboarding/check-name endpoint for real-time validation
- [ ] Transaction: Create Clinic → Create User (CLINIC_OWNER) → Generate tokens
- [ ] Error handling: Duplicate clinic name, duplicate email, validation errors

**Success Flow:**

- [ ] On success: Auto-login user, redirect to dashboard
- [ ] Show brief success message or onboarding completion screen

### Reusability Opportunities

**Frontend Components to Reuse:**

- Card, CardHeader, CardContent, CardTitle from shadcn/ui
- Input components with existing validation styling
- Button components with loading states
- Error message display patterns from Register.tsx

**Backend Patterns to Follow:**

- AuthService.login() for token generation
- Prisma transaction patterns from clinics.service.ts
- DTO validation patterns using class-validator
- Error handling patterns (ConflictException, BadRequestException)

**Similar Features to Model After:**

- Current registration form layout and styling
- Clinic creation validation and error handling
- Invitation flow's single-purpose clarity

### Scope Boundaries

**In Scope:**

- New OnboardingModule with controller and service
- POST /onboarding/clinic endpoint
- GET /onboarding/check-name endpoint
- New OnboardingPage React component
- Step1ClinicInfo component
- Step2AdminAccount component
- Form validation (client and server-side)
- Transaction-based clinic + user creation
- Redirect /register to /onboarding
- Basic success/completion screen

**Out of Scope:**

- Email verification during onboarding (can be added later)
- Logo upload during onboarding (can be added in branding step later)
- Business hours configuration (can be added in clinic settings)
- Team invitations during onboarding (separate flow, can be done post-creation)
- Custom subdomain reservation (future white-label feature)
- Payment/subscription collection (not needed for MVP)
- Import from external systems
- Advanced validation (tax ID, business registration)

### Technical Considerations

**Integration Points:**

- Must integrate with existing AuthService for token generation
- Must use existing Prisma schema (no migrations)
- Must follow existing role system (CLINIC_OWNER from constants)
- Must be compatible with existing invitation flow

**Existing System Constraints:**

- User role enum: ADMIN, CLINIC_OWNER, THERAPIST
- Clinic model requires name, email
- User model requires email, passwordHash, name, role
- JWT token structure must match existing format

**Technology Preferences:**

- Follow existing NestJS patterns for module structure
- Use existing shadcn/ui components for consistency
- Use class-validator for DTO validation
- Use React Hook Form for form management
- Use Zod for client-side validation schemas

**Similar Code Patterns:**

- clinics.service.ts createClinic() for transaction pattern
- auth.service.ts register() for user creation pattern
- Register.tsx for form layout and validation
- ClinicOnboardingWizard.tsx for step-based UI pattern

### API Specification

**POST /onboarding/clinic**

Request Body:

```json
{
  "clinicName": "Fisioterapia García",
  "clinicEmail": "clinic@example.com",
  "clinicPhone": "+34 912 345 678",
  "clinicAddress": "Calle Mayor 123, Madrid",
  "adminName": "Dr. María García",
  "adminEmail": "maria@example.com",
  "adminPassword": "securePassword123",
  "adminLicenseNumber": "F-12345"
}
```

Response 201:

```json
{
  "user": {
    "id": "user-uuid",
    "email": "maria@example.com",
    "name": "Dr. María García",
    "role": "CLINIC_OWNER",
    "clinicId": "clinic-uuid",
    "clinicName": "Fisioterapia García"
  },
  "clinic": {
    "id": "clinic-uuid",
    "name": "Fisioterapia García",
    "email": "clinic@example.com",
    "phone": "+34 912 345 678",
    "address": "Calle Mayor 123, Madrid"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

**GET /onboarding/check-name?name={clinicName}**

Response 200:

```json
{
  "available": true
}
```

Response 200 (if taken):

```json
{
  "available": false
}
```

### Database Operations

**Transaction Flow:**

1. Check clinic name availability
2. Check admin email availability
3. Create Clinic record
4. Hash admin password
5. Create User record with:
   - role: CLINIC_OWNER
   - clinicId: newly created clinic.id
   - clinicName: clinic.name
6. Generate JWT tokens
7. Return user, clinic, and tokens

**Error Scenarios:**

- Clinic name already exists → 409 Conflict
- Admin email already exists → 409 Conflict
- Invalid clinic name (< 2 chars) → 400 Bad Request
- Invalid email format → 400 Bad Request
- Password too short (< 6 chars) → 400 Bad Request

### Frontend Flow

**URL Structure:**

- `/onboarding` - Main onboarding page (Step 1)
- `/onboarding` (with state) - Shows Step 2
- Redirect `/register` → `/onboarding`

**State Management:**

- Local component state for form data
- localStorage persistence optional (to prevent data loss on refresh)
- Step state managed in URL or component state

**Validation:**

- Real-time clinic name availability check (debounced)
- Email format validation
- Password strength indicator
- Password match validation
- Required field validation

### Success Criteria

- [ ] New users can complete clinic creation in 2 steps
- [ ] User is created as CLINIC_OWNER (not THERAPIST)
- [ ] Clinic and user are created atomically (both succeed or both fail)
- [ ] User is automatically logged in after creation
- [ ] Real-time validation prevents duplicate clinic names
- [ ] Form validation provides clear error messages
- [ ] UI clearly communicates "Create Your Clinic" mental model
- [ ] Invitation flow continues to work independently
- [ ] Old /register endpoint redirects to new flow

## Implementation Notes

**File Structure:**

Backend:

```
apps/server/src/modules/onboarding/
├── onboarding.module.ts
├── onboarding.controller.ts
├── onboarding.service.ts
├── dto/
│   └── clinic-onboarding.dto.ts
└── dto/
    └── check-name.dto.ts
```

Frontend:

```
apps/client/src/pages/
├── Onboarding.tsx
└── OnboardingSuccess.tsx

apps/client/src/components/onboarding/
├── Step1ClinicInfo.tsx
└── Step2AdminAccount.tsx
```

**Dependencies:**

- Backend: Uses existing AuthService, PrismaService
- Frontend: Uses existing UI components, API client
- No new external dependencies needed

**Testing Considerations:**

- Unit tests for OnboardingService
- API tests for /onboarding endpoints
- Component tests for form validation
- E2E test for complete flow

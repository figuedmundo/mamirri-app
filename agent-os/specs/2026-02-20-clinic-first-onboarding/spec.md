# Specification: Clinic-First Onboarding

## Goal

Replace the user-first registration flow with a clinic-first onboarding experience that aligns with industry standards and the doctor's mental model. Instead of creating a personal account then a clinic, users will create their clinic first and establish themselves as the clinic owner in a unified flow.

## User Stories

**Primary: Solo Physiotherapist Opening a Clinic**

> As a physiotherapist opening my own practice, I want to quickly set up my clinic profile so that I can start adding patients immediately without confusing account creation steps.

**Secondary: Clinic Owner from Invitation**

> As a therapist invited to join a clinic, I want to bypass clinic creation entirely and join my team immediately through the invitation flow.

**Tertiary: Returning User**

> As an existing user, I want a clear path to log in without being forced through onboarding again.

## Specific Requirements

### Two-Step Onboarding Wizard

**Step 1: Clinic Information (Required)**

- Clinic name input with real-time uniqueness validation (debounced)
- Clinic email input (required, validated format)
- Clinic phone input (optional, format validation)
- Clinic address textarea (optional)
- Clear messaging: "Step 1 of 2: Clinic Information"
- Progress indicator showing current step
- Continue button (disabled until required fields valid)
- Visual design establishes "Create Your Clinic" as primary action

**Step 2: Admin Account (Required)**

- Full name input (required)
- Email input (required, validated, uniqueness check)
- Password input (required, min 6 chars, strength indicator)
- Confirm password input (must match)
- Professional license number (optional)
- Clear messaging: "Step 2 of 2: Create Admin Account"
- Messaging: "You'll be the clinic owner with full administrative access"
- Back button to return to Step 1
- Create Clinic button (primary action)
- Loading state during submission

**Success State**

- Auto-login after successful creation
- Brief success message or redirect to dashboard
- Optional: "Welcome to [Clinic Name]" confirmation

### Backend API

**POST /onboarding/clinic**

- Accepts complete clinic and admin information
- Validates all inputs
- Checks clinic name availability
- Checks admin email availability
- Executes transaction: Create Clinic → Create User (CLINIC_OWNER)
- Generates JWT tokens
- Returns user, clinic, and authentication tokens

**GET /onboarding/check-name**

- Query parameter: name (string)
- Returns availability status
- Used for real-time validation in Step 1

### Form Validation

**Client-Side:**

- Clinic name: min 2 chars, max 100
- Email: valid format
- Phone: valid format (if provided)
- Password: min 6 chars
- Confirm password: must match

**Server-Side:**

- All client validations repeated
- Clinic name uniqueness check
- Admin email uniqueness check
- Password hashing before storage

### Routing & Entry Points

- `/onboarding` - Main onboarding page
- `/register` - Redirects to `/onboarding`
- `/login` - Unchanged
- `/invite/accept` - Unchanged (separate flow)

## Visual Design

### Step 1 Mockup

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🏥 MAMIRRI                               │
│                                                             │
│              Create Your Clinic                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STEP 1 OF 2                                        │   │
│  │  ●────○                                             │   │
│  │                                                     │   │
│  │  Clinic Information                                 │   │
│  │  Tell us about your clinic                          │   │
│  │                                                     │   │
│  │  Clinic Name *                                      │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ Fisioterapia García                          │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │  ✓ Name is available                               │   │
│  │                                                     │   │
│  │  Clinic Email *                                     │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ clinic@fisioterapia.com                      │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  Phone Number                                       │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ +34 912 345 678                              │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  Address                                            │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ Calle Mayor 123, Madrid                      │ │   │
│  │  │                                              │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Already have an account? Log in                            │
│                                                             │
│                         [ Continue → ]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Step 2 Mockup

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🏥 MAMIRRI                               │
│                                                             │
│              Create Your Clinic                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STEP 2 OF 2                                        │   │
│  │  ●────●                                             │   │
│  │                                                     │   │
│  │  Create Admin Account                               │   │
│  │  You'll be the clinic owner                         │   │
│  │                                                     │   │
│  │  Full Name *                                        │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ Dr. María García                             │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  Email Address *                                    │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ maria@example.com                            │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  Password *                                         │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ ••••••••••••                                 │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │  Must be at least 6 characters                      │   │
│  │                                                     │   │
│  │  Confirm Password *                                 │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ ••••••••••••                                 │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  Professional License Number                        │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │ F-12345                                      │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ ← Back ]              [ Create Clinic → ]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Success Screen Mockup

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🏥 MAMIRRI                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                    ✅                               │   │
│  │                                                     │   │
│  │       Welcome to Fisioterapia García!               │   │
│  │                                                     │   │
│  │  Your clinic has been created successfully.         │   │
│  │  You're now logged in as the clinic owner.          │   │
│  │                                                     │   │
│  │  [ Go to Dashboard → ]                              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flow Diagram

```
┌─────────────────┐
│   Landing Page  │
│   or /register  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Redirect to /onboarding    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Check for Invitation Token?            │
└────────┬────────────────┬───────────────┘
         │ Yes                     │ No
         ▼                          ▼
┌─────────────────┐      ┌─────────────────────────────┐
│ /invite/accept  │      │ Step 1: Clinic Information  │
│ (existing flow) │      │ - Clinic name               │
└─────────────────┘      │ - Clinic email              │
                         │ - Phone (optional)          │
                         │ - Address (optional)        │
                         └────────┬────────────────────┘
                                  │
                                  │ [Continue]
                                  ▼
                         ┌─────────────────────────────┐
                         │ Step 2: Admin Account       │
                         │ - Full name                 │
                         │ - Email                     │
                         │ - Password                  │
                         │ - Confirm password          │
                         │ - License (optional)        │
                         └────────┬────────────────────┘
                                  │
                                  │ [Create Clinic]
                                  ▼
                         ┌─────────────────────────────┐
                         │ POST /onboarding/clinic     │
                         │ Transaction:                │
                         │ 1. Create Clinic            │
                         │ 2. Create User (OWNER)      │
                         │ 3. Generate tokens          │
                         └────────┬────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────────────┐
                         │ Success Screen              │
                         │ or Auto-redirect to         │
                         │ Dashboard                   │
                         └─────────────────────────────┘
```

## Existing Code to Leverage

### Backend

**AuthService (apps/server/src/modules/auth/auth.service.ts)**

- Reuse `login()` method for token generation
- Reuse password hashing logic
- Reuse user creation patterns

**ClinicsService (apps/server/src/modules/clinics/clinics.service.ts)**

- Reuse clinic creation transaction pattern
- Reuse name availability checking
- Reuse validation logic

**Existing DTOs**

- RegisterDto for user field validation patterns
- CreateClinicDto for clinic field validation patterns

### Frontend

**Register.tsx (apps/client/src/pages/Register.tsx)**

- Reuse form layout and styling
- Reuse input components and patterns
- Reuse error handling approach
- Reuse validation feedback patterns

**ClinicOnboardingWizard.tsx**

- Reuse step indicator component
- Reuse progress visualization
- Reuse form state management patterns

**UI Components**

- Card, CardHeader, CardContent, CardTitle from shadcn/ui
- Input, Button components
- Use existing spacing (space-y-6) and sizing (h-12 text-lg) patterns

## Out of Scope

- Email verification as a blocker (can be added later)
- Logo upload during onboarding (future enhancement)
- Business hours configuration (use clinic settings)
- Team member invitations during onboarding (post-creation)
- Custom subdomain reservation (future white-label)
- Payment/subscription collection
- Import from external EMR systems
- Tax ID or business registration validation
- Phone/email verification
- Multi-step verification or CAPTCHA
- Social login options
- Tutorial or guided tour after onboarding

## Acceptance Criteria

### Must Have (MVP)

- [ ] User can complete clinic creation in 2 clear steps
- [ ] User is created as CLINIC_OWNER role immediately
- [ ] Clinic and user are created atomically (transaction)
- [ ] User is automatically logged in after creation
- [ ] Real-time validation prevents duplicate clinic names
- [ ] Form validation provides clear inline error messages
- [ ] UI clearly communicates "Create Your Clinic" mental model
- [ ] Step indicator shows progress (Step 1 of 2, Step 2 of 2)
- [ ] Back button allows returning to Step 1 from Step 2
- [ ] Password confirmation validation works
- [ ] Email format validation works
- [ ] Phone format validation works (when provided)
- [ ] /register redirects to /onboarding
- [ ] Invitation flow continues to work independently
- [ ] All required fields marked with asterisk (\*)

### Should Have

- [ ] Password strength indicator
- [ ] Clinic name availability shows checkmark/x icon
- [ ] Success screen shows clinic name
- [ ] Form data persists if user accidentally refreshes (localStorage)
- [ ] Loading states on buttons during API calls
- [ ] "Already have an account? Log in" link
- [ ] Responsive design works on mobile/tablet

### Nice to Have

- [ ] Clinic name suggestions if name is taken
- [ ] Animated transitions between steps
- [ ] Confetti or celebration animation on success
- [ ] Option to add logo during onboarding
- [ ] Autocomplete for address field

## Technical Specifications

### Component Architecture

```
Backend:
apps/server/src/modules/onboarding/
├── onboarding.module.ts
├── onboarding.controller.ts
├── onboarding.service.ts
├── dto/
│   ├── clinic-onboarding.dto.ts
│   └── check-name-query.dto.ts
└── types/
    └── onboarding-response.type.ts

Frontend:
apps/client/src/
├── pages/
│   ├── Onboarding.tsx              # Main container
│   ├── OnboardingSuccess.tsx       # Success screen
│   └── Register.tsx                # Modified to redirect
├── components/onboarding/
│   ├── Step1ClinicInfo.tsx         # Step 1 form
│   ├── Step2AdminAccount.tsx       # Step 2 form
│   ├── OnboardingLayout.tsx        # Shared layout wrapper
│   └── ProgressIndicator.tsx       # Step indicator
├── hooks/
│   └── use-onboarding.ts           # Form state management
└── api/
    └── onboarding.ts               # API calls
```

### State Management

```typescript
// Onboarding form state
interface OnboardingState {
  step: 1 | 2;
  clinicData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  adminData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    licenseNumber: string;
  };
  validation: {
    isCheckingName: boolean;
    nameAvailable: boolean | null;
    nameError: string;
  };
  isSubmitting: boolean;
  error: string | null;
}
```

### Form Validation Schema (Zod)

```typescript
// Client-side validation
const step1Schema = z.object({
  name: z
    .string()
    .min(2, 'Clinic name must be at least 2 characters')
    .max(100, 'Clinic name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhone(val), {
      message: 'Please enter a valid phone number',
    }),
  address: z.string().optional(),
});

const step2Schema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    licenseNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

## Data Model Changes

No changes required to existing schema. Current schema already supports this flow:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          String    @default("THERAPIST")
  clinicId      String?   // Nullable for solo mode, set on creation
  clinicName    String?   // Set on creation
  licenseNumber String?   // Optional
  // ... other fields
}

model Clinic {
  id        String   @id @default(cuid())
  name      String   @unique
  email     String?
  phone     String?
  address   String?
  isActive  Boolean  @default(true)
  // ... other fields
}
```

## Implementation Tasks

### Backend (Day 1)

- [ ] **BE-1:** Create OnboardingModule structure
- [ ] **BE-2:** Create ClinicOnboardingDto with validation
- [ ] **BE-3:** Create CheckNameQueryDto
- [ ] **BE-4:** Implement POST /onboarding/clinic endpoint
- [ ] **BE-5:** Implement GET /onboarding/check-name endpoint
- [ ] **BE-6:** Write unit tests for OnboardingService
- [ ] **BE-7:** Write API tests for endpoints

### Frontend - Core Components (Day 1-2)

- [ ] **FE-1:** Create OnboardingLayout component
- [ ] **FE-2:** Create ProgressIndicator component
- [ ] **FE-3:** Build Step1ClinicInfo with async validation
- [ ] **FE-4:** Build Step2AdminAccount with password confirmation
- [ ] **FE-5:** Create useOnboarding hook for state management
- [ ] **FE-6:** Build main OnboardingPage container
- [ ] **FE-7:** Create onboarding API service
- [ ] **FE-8:** Build OnboardingSuccess screen

### Frontend - Integration (Day 2)

- [ ] **FE-9:** Update Register.tsx to redirect to /onboarding
- [ ] **FE-10:** Add /onboarding route to App.tsx
- [ ] **FE-11:** Add /onboarding/success route
- [ ] **FE-12:** Ensure invitation flow bypasses onboarding
- [ ] **FE-13:** Add localStorage persistence for form data

### Testing (Day 2-3)

- [ ] **TEST-1:** Unit tests for validation schemas
- [ ] **TEST-2:** Component tests for Step1 and Step2
- [ ] **TEST-3:** Integration test: complete onboarding flow
- [ ] **TEST-4:** E2E test: registration → clinic creation → dashboard
- [ ] **TEST-5:** Test invitation bypass logic still works

## API Specifications

### POST /api/v1/onboarding/clinic

Create a new clinic with admin account.

**Request Body:**

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

**Response 201 Created:**

```json
{
  "user": {
    "id": "cuid-user-id",
    "email": "maria@example.com",
    "name": "Dr. María García",
    "role": "CLINIC_OWNER",
    "clinicId": "cuid-clinic-id",
    "clinicName": "Fisioterapia García",
    "licenseNumber": "F-12345"
  },
  "clinic": {
    "id": "cuid-clinic-id",
    "name": "Fisioterapia García",
    "email": "clinic@example.com",
    "phone": "+34 912 345 678",
    "address": "Calle Mayor 123, Madrid",
    "isActive": true,
    "createdAt": "2026-02-20T10:00:00Z"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

**Response 400 Bad Request:**

```json
{
  "statusCode": 400,
  "message": ["clinicName must be at least 2 characters"],
  "error": "Bad Request"
}
```

**Response 409 Conflict (Clinic name taken):**

```json
{
  "statusCode": 409,
  "message": "A clinic with this name already exists",
  "error": "Conflict"
}
```

**Response 409 Conflict (Email exists):**

```json
{
  "statusCode": 409,
  "message": "An account with this email already exists",
  "error": "Conflict"
}
```

### GET /api/v1/onboarding/check-name

Check if a clinic name is available.

**Query Parameters:**

- `name` (string, required): Clinic name to check

**Response 200 OK:**

```json
{
  "available": true
}
```

**Response 200 OK (Name taken):**

```json
{
  "available": false
}
```

**Response 400 Bad Request:**

```json
{
  "statusCode": 400,
  "message": "Name must be at least 2 characters",
  "error": "Bad Request"
}
```

## UI/UX Specifications

### Layout

- Centered card layout (max-width: 520px)
- Subtle gradient background (reuse from Register.tsx)
- Card shadow: `shadow-lg`
- Padding: `p-8` on desktop, `p-6` on mobile

### Progress Indicator

```
Step 1 of 2
●────○
```

- Active step: Filled circle with primary color
- Future step: Outlined circle, muted
- Completed step: Checkmark icon

### Typography

- Title: `text-2xl font-bold text-center`
- Subtitle: `text-muted-foreground text-center`
- Step label: `text-sm font-medium uppercase tracking-wide`
- Input labels: `text-sm font-medium`
- Error text: `text-sm text-destructive`
- Helper text: `text-xs text-muted-foreground`

### Buttons

- Primary: `w-full h-12 text-lg` (consistent with Register)
- Back button: Outline variant, left-aligned
- Disabled state: Opacity reduced, cursor not-allowed

### Form Fields

- Input height: `h-12`
- Input text: `text-lg`
- Spacing between fields: `space-y-4`
- Validation state: Border color changes (red for error, green for valid)
- Required indicator: Red asterisk after label

### Animations

**Step Transitions:**

- Duration: 300ms
- Easing: `ease-in-out`
- Effect: Fade with slight horizontal slide

**Loading States:**

- Button spinner on submit
- Input loading state during name check

### Responsive Breakpoints

| Breakpoint | Changes                             |
| ---------- | ----------------------------------- |
| < 640px    | Reduced padding, full-width buttons |
| 640px+     | Centered card with max-width        |

### Accessibility

- All inputs have associated labels
- Required fields marked with aria-required
- Error messages linked via aria-describedby
- Progress indicator announces step changes
- Focus visible on all interactive elements
- Keyboard navigation: Tab through fields, Enter to submit

## Testing Strategy

### Unit Tests

**OnboardingService:**

- Creates clinic and user in transaction
- Validates clinic name uniqueness
- Validates email uniqueness
- Hashes password before storage
- Returns correct role (CLINIC_OWNER)

**Validation:**

- Name validation (min length, max length)
- Email format validation
- Phone format validation (optional field)
- Password match validation

### Component Tests

**Step1ClinicInfo:**

- Renders all fields
- Continue button disabled with invalid name
- Shows loading state during name check
- Displays error for taken name
- Shows success state for available name

**Step2AdminAccount:**

- Renders all fields
- Create Clinic button disabled with invalid form
- Password match validation displays error
- Back button returns to Step 1

### Integration Tests

**Full Flow:**

- Complete 2-step wizard successfully
- Verify clinic created with correct data
- Verify user created as CLINIC_OWNER
- Verify auto-login works

**Error Scenarios:**

- Duplicate clinic name handled gracefully
- Duplicate email handled gracefully
- Network error shows appropriate message

### E2E Tests

**Scenario: New Clinic Owner:**

1. Navigate to /onboarding
2. Fill Step 1 with valid clinic info
3. Continue to Step 2
4. Fill admin account info
5. Submit form
6. Verify redirect to dashboard
7. Verify user is logged in
8. Verify clinic appears in user data

---

## Sign-off

- [ ] Product Owner Review
- [ ] Technical Lead Review
- [ ] UX Review
- [ ] QA Review

---

**Spec Version:** 1.0  
**Last Updated:** 2026-02-20  
**Author:** AI Assistant  
**Status:** Ready for Implementation

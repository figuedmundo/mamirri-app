# Specification: Clinic Onboarding

## Goal

Enable new therapists to create and configure their clinic within 2 minutes of registration through a progressive 3-step wizard, with an option to skip to "solo mode" and upgrade later.

## User Stories

- As a physiotherapist opening my own clinic, I want to quickly set up my clinic profile so that I can start adding patients and invite my assistant within minutes
- As a freelance physiotherapist, I want to skip clinic setup initially and explore the app, so that I can decide later if I need multi-user features
- As a therapist invited to join a clinic, I want to bypass clinic creation entirely and join my team immediately through the invitation flow

## Specific Requirements

**Progressive 3-Step Wizard**

- Step 1 (Required): Collect clinic name (with real-time uniqueness check), email, and optional phone
- Step 2 (Optional): Collect address, logo upload with preview, and business hours (defaults to Mon-Fri 9-17)
- Step 3 (Optional): Invite first team member with role selection (Admin/Therapist)
- Show visual progress indicator (Step 1-2-3) with completed checkmarks
- Allow navigation back to previous steps with data preserved
- Persist form state to localStorage to prevent data loss on refresh

**Solo Mode Support**

- Provide "Set up later" button on Step 1 to enter solo mode
- Display persistent banner on dashboard: "You're in personal mode. Set up a clinic to unlock team features →"
- Allow creating patients in solo mode (clinicId=null)
- Support one-click upgrade from banner that creates clinic and auto-migrates existing patients

**Quick Start Activation Screen**

- Display after successful clinic creation with celebration animation
- Show 3 action cards: "Create Your First Patient", "Invite Your Team", "Configure Settings"
- Display clinic name and logo (if uploaded) in header
- Provide "Skip for now →" option to go directly to dashboard

**Dual-Path Entry Logic**

- Check for invitation token on registration: route to InvitationAcceptance if present
- Check for existing clinicId: route to Dashboard if already assigned
- Route to Clinic Onboarding Wizard if no clinic and no invitation
- Auto-assign CLINIC_OWNER role to clinic creator

**Form Validation**

- Validate clinic name length (2-100 characters) with debounced uniqueness check
- Validate email format and phone format (when provided)
- Validate logo file size (< 2MB) and type (image/\*)
- Disable Next button until current step is valid
- Display inline error messages below each field

**Backend Integration**

- Create GET /clinics/check-name endpoint for async name validation
- Extend POST /clinics to accept full onboarding payload including invitations
- Create POST /clinics/:id/migrate-solo-patients endpoint for solo mode upgrade
- Send invitation emails immediately when invitations included in creation

**Mobile-First Design**

- Centered card layout max-width 480px
- Responsive 3-column Quick Start grid that stacks on mobile
- Touch-friendly inputs with minimum 44px tap targets
- Tested on iPad Pro (primary user device)

## Visual Design

No visual mockups provided. Follow existing app patterns:

- Use centered card layout from Register.tsx (white card, subtle gradient background)
- Reuse form input styling, button sizing (h-12 text-lg), and spacing (space-y-6)
- Progress indicator: horizontal stepper with numbered circles (●───●───○)
- Quick Start cards: 3-column grid on desktop, stacked on mobile
- Solo mode banner: full-width alert banner below navigation

## Existing Code to Leverage

**UI Components from components/ui/**

- Card, CardHeader, CardContent, CardTitle for wizard container layout
- Button for primary actions (h-12 text-lg styling) and secondary actions
- Input for form fields with existing focus and error states
- Reuse existing variant patterns (primary, secondary, outline, ghost)

**ClinicDashboard.tsx Page**

- Reuse Card layout patterns with header/content structure
- Reference TherapistList component display patterns
- Copy ClinicSettings form structure for step field arrangements
- Use existing permission checks (isAdmin, isClinicOwner)

**InviteTherapistDialog.tsx Component**

- Reuse invitation form pattern for Step 3 team invitation
- Copy email input and role selector implementation
- Use existing validation and error handling approaches
- Leverage same API service methods (clinicsApi.inviteTherapist)

**Register.tsx Page**

- Follow form validation patterns with Zod schemas
- Reuse form layout with labels and error messaging
- Copy loading state handling and button disabled states
- Use similar centering and responsive padding approaches

**InvitationAcceptance.tsx Page**

- Reference form submission patterns with error handling
- Copy authentication flow integration (login after completion)
- Use similar Card-centered layout for step container
- Follow existing routing and navigation patterns

## Out of Scope

- Payment or subscription collection during onboarding
- Tax ID, business registration number, or compliance documentation
- Custom subdomain reservation (clinicname.mamirri.app) - future white-label feature
- Video tutorials, interactive guided tours, or tooltips
- Import from external EMR systems or patient data migration
- Multi-location clinic support (single clinic per creation)
- Email verification as a blocker to onboarding completion
- Advanced branding controls (colors, fonts, custom CSS)
- Bulk team import via CSV file upload
- Clinic templates or specialty-specific preset configurations
- [ ] Sees persistent banner to upgrade to clinic
- [ ] Can one-click upgrade later with patient data preserved

### 4.3 Edge Case: Invited Team Member

> "As a therapist invited to join a clinic, I want to bypass clinic creation entirely and join my team immediately."

**Acceptance:**

- [ ] Invitation link routes to acceptance flow, not clinic creation
- [ ] Automatically associated with inviting clinic
- [ ] No option to create competing clinic

---

## 5. Functional Specifications

### 5.1 Flow Diagram

```
User Completes Registration
         │
         ▼
    Check State
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
┌────────┐ ┌─────────┐ ┌──────────┐
│  HAS   │ │   HAS   │ │    NO    │
│Invitation│ │ ClinicId │ │ Clinic   │
└────┬───┘ └────┬────┘ └────┬─────┘
     │          │           │
     ▼          ▼           ▼
┌─────────────────┐ ┌─────────────────┐
│ Invitation      │ │ Dashboard       │ │ Clinic Creation │
│ Acceptance      │ │ (Normal)        │ │ Wizard          │
│ (Existing)      │ └─────────────────┘ └────────┬────────┘
└─────────────────┘                                │
                         ┌─────────────────────────┼─────────┐
                         ▼                         ▼         ▼
                   ┌──────────┐             ┌──────────┐ ┌────────┐
                   │  Step 1  │             │  Step 2  │ │  Skip  │
                   │Essentials│────────────▶│ Branding │ │ Solo   │
                   │          │             │(Optional)│ │ Mode   │
                   └──────────┘             └────┬─────┘ └────────┘
                         │                       │
                         │                  ┌────┴────┐
                         │                  ▼         ▼
                         │            ┌──────────┐ ┌────────┐
                         │            │  Step 3  │ │ Skip   │
                         │            │   Team   │ │ to     │
                         │            │(Optional)│ │ Quick  │
                         │            └────┬─────┘ │ Start  │
                         │                 │       └────────┘
                         │            ┌────┴────┐
                         └────────────│ Step 3  │
                                      │Complete │
                                      └────┬────┘
                                           │
                                           ▼
                              ┌──────────────────────┐
                              │   Quick Start Screen │
                              │   (3 Action Cards)   │
                              └──────────────────────┘
```

### 5.2 Step 1: Essentials (Required)

**Purpose:** Collect minimum viable clinic data to create entity

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Clinic Name | text | Yes | Min 2 chars, unique (async check) |
| Email | email | Yes | Valid email format |
| Phone | tel | No | Valid phone format |

**UI Elements:**

- Progress indicator: "Step 1 of 3: Essentials"
- "Set up later →" secondary button (skip to solo mode)
- "Next" primary button (disabled until name valid)
- Real-time validation with inline errors
- Loading state on "Next" while checking name availability

**Behavior:**

- Form state persists to localStorage on field change
- Name uniqueness checked after 500ms debounce
- On submit: Create clinic with `isActive: true`, user becomes `CLINIC_OWNER`

### 5.3 Step 2: Branding (Optional)

**Purpose:** Allow professional customization (skippable)

**Fields:**
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Address | textarea | Empty | Full address for patient records |
| Logo | file | None | Max 2MB, square crop preview |
| Business Hours | JSON | Mon-Fri 9-17 | Time picker per day |

**UI Elements:**

- Progress indicator: "Step 2 of 3: Branding"
- Logo upload with drag-and-drop zone
- Immediate preview after selection
- "Skip for now →" secondary button
- "Next" primary button
- "Back" button (returns to Step 1)

**Behavior:**

- Logo uploaded to MinIO immediately, URL stored in form state
- Business hours use default values, editable
- Skipping jumps to Step 3
- Back button preserves changes

### 5.4 Step 3: Team (Optional)

**Purpose:** Invite first team member

**Fields:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| Email | email | No | Invitation recipient |
| Role | select | No | ADMIN, THERAPIST (default) |

**UI Elements:**

- Progress indicator: "Step 3 of 3: Team"
- Single invitation form (reuse InviteTherapistDialog pattern)
- "+ Add another" to invite multiple (optional enhancement)
- "Skip for now →" secondary button
- "Create Clinic" primary button
- "Back" button

**Behavior:**

- Invitations sent immediately on completion
- Uses existing ClinicInvitation system
- On submit: Show success screen → Quick Start

### 5.5 Solo Mode

**Activation:** User clicks "Set up later" on Step 1

**Dashboard Banner:**

```
┌────────────────────────────────────────────────────────────┐
│  👤 You're in personal mode                                │
│  Set up a clinic to unlock team collaboration features →   │
└────────────────────────────────────────────────────────────┘
```

**Limitations:**

- Cannot invite team members
- Cannot access ClinicDashboard settings
- Patients created have `clinicId: null`

**Upgrade Flow:**

- Click banner → Clinic Creation Wizard (Step 1 only)
- On completion: Migrate all personal patients to new clinic
- Show confirmation: "Moved X patients to [Clinic Name]"
- Banner disappears

### 5.6 Quick Start Screen

**Purpose:** Accelerate time-to-value post-creation

**Layout:** 3-column grid on desktop, stacked on mobile

**Cards:**

| Card                 | Icon     | Action                     | Primary? |
| -------------------- | -------- | -------------------------- | -------- |
| Create First Patient | UserPlus | Navigate to /patients/new  | Yes      |
| Invite Your Team     | Users    | Open InviteTherapistDialog | No       |
| Configure Settings   | Settings | Navigate to /clinic        | No       |

**Footer:** "Skip for now →" (goes to Dashboard)

**Header:** "Welcome to [Clinic Name]! 🎉" + logo preview (if uploaded)

---

## 6. Technical Specifications

### 6.1 Component Architecture

```
ClinicOnboardingWizard/ (new folder)
├── index.tsx                    # Main wizard container
├── ClinicOnboardingContext.tsx  # State management
├── steps/
│   ├── Step1Essentials.tsx      # Required fields
│   ├── Step2Branding.tsx        # Optional customization
│   ├── Step3Team.tsx            # Invitation
│   └── StepSuccess.tsx          # Completion state
├── components/
│   ├── ProgressIndicator.tsx    # Step 1-2-3 display
│   ├── LogoUpload.tsx           # File upload + preview
│   ├── BusinessHoursPicker.tsx  # Time selection
│   └── SoloModeBanner.tsx       # Dashboard banner
└── hooks/
    ├── useClinicOnboarding.ts   # Wizard logic
    └── useClinicNameCheck.ts    # Async validation

QuickStart/ (new folder)
├── index.tsx                    # Quick Start screen
├── QuickStartCard.tsx           # Individual action card
└── hooks/
    └── useQuickStart.ts         # Navigation handlers
```

### 6.2 State Management

```typescript
// ClinicOnboardingContext.tsx
interface OnboardingState {
  currentStep: 1 | 2 | 3 | 'success';
  clinicData: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    businessHours?: BusinessHours;
  };
  invitations: Array<{ email: string; role: 'ADMIN' | 'THERAPIST' }>;
  isLoading: boolean;
  error?: string;
}

type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_CLINIC_DATA'; payload: Partial<ClinicData> }
  | { type: 'ADD_INVITATION'; payload: Invitation }
  | { type: 'REMOVE_INVITATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'RESET' };
```

### 6.3 Form Validation Schema (Zod)

```typescript
// schemas/clinicOnboarding.ts
import { z } from 'zod';

export const step1Schema = z.object({
  name: z
    .string()
    .min(2, 'Clinic name must be at least 2 characters')
    .max(100, 'Clinic name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(val),
      'Please enter a valid phone number',
    ),
});

export const step2Schema = z.object({
  address: z.string().optional(),
  logoUrl: z.string().url().optional(),
  businessHours: z
    .object({
      monday: timeRangeSchema,
      tuesday: timeRangeSchema,
      // ... other days
    })
    .optional(),
});

export const step3Schema = z.object({
  invitations: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.enum(['ADMIN', 'THERAPIST']),
      }),
    )
    .optional(),
});
```

### 6.4 Routing

```typescript
// router additions
{
  path: '/onboarding/clinic',
  element: <ClinicOnboardingWizard />,
  guard: (user) => !user.clinicId && !user.hasInvitationToken,
},
{
  path: '/onboarding/quick-start',
  element: <QuickStartScreen />,
  guard: (user) => !!user.clinicId && user.isNewClinicOwner,
}
```

---

## 7. API Specifications

### 7.1 New Endpoints

#### Check Clinic Name Availability

```
GET /api/v1/clinics/check-name?name={name}

Request:
  Query: name (string, required)

Response 200:
  {
    "available": true,
    "suggestions": ["Alternative Name 1", "Alternative Name 2"] // if taken
  }

Response 400:
  {
    "error": "INVALID_NAME",
    "message": "Name must be at least 2 characters"
  }
```

#### Create Clinic with Full Data

```
POST /api/v1/clinics

Request:
  {
    "name": "Fisioterapia García",
    "email": "clinic@example.com",
    "phone": "+34 912 345 678",
    "address": "Calle Mayor 123, Madrid",
    "logoUrl": "https://minio.mamirri.app/clinics/logo-uuid.png",
    "businessHours": {
      "monday": { "open": "09:00", "close": "17:00", "closed": false },
      "tuesday": { "open": "09:00", "close": "17:00", "closed": false },
      // ...
    },
    "initialInvitations": [
      { "email": "therapist@example.com", "role": "THERAPIST" }
    ]
  }

Response 201:
  {
    "id": "uuid",
    "name": "Fisioterapia García",
    "role": "CLINIC_OWNER",
    "invitationsSent": 1
  }

Response 409:
  {
    "error": "NAME_TAKEN",
    "message": "A clinic with this name already exists"
  }
```

#### Migrate Solo Patients to Clinic

```
POST /api/v1/clinics/:id/migrate-solo-patients

Request:
  (auth required, must be clinic owner)

Response 200:
  {
    "migratedCount": 5,
    "clinicId": "uuid"
  }
```

### 7.2 Modified Endpoints

#### Get Current User

Add to existing response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "clinicId": null, // null indicates solo mode
  "clinicRole": null, // or "CLINIC_OWNER", "ADMIN", "THERAPIST"
  "hasCompletedOnboarding": false
}
```

---

## 8. UI/UX Specifications

### 8.1 Visual Design

**Layout:**

- Centered card layout (max-width: 480px)
- Subtle gradient background (reuse from Register.tsx)
- Card shadow: `shadow-lg`
- Padding: `p-8` on desktop, `p-6` on mobile

**Progress Indicator:**

```
○───●───○
1    2    3
```

- Active step: Primary color fill with white number
- Completed step: Checkmark icon, muted color
- Future steps: Outlined circle, muted text

**Typography:**

- Title: `text-2xl font-bold`
- Subtitle: `text-muted-foreground`
- Labels: `text-sm font-medium`
- Errors: `text-sm text-destructive`

**Buttons:**

- Primary: `w-full h-12 text-lg` (consistent with Register)
- Secondary: Ghost variant with arrow icon
- Back: Outline variant, left-aligned

### 8.2 Animations

**Step Transitions:**

- Duration: 300ms
- Easing: `ease-in-out`
- Effect: Slide left (forward), Slide right (backward)
- CSS: `transform: translateX(%)` with `transition-transform`

**Success State:**

- Confetti burst (use canvas-confetti library)
- Checkmark scale-up animation
- Clinic logo fade-in

**Loading States:**

- Button spinner on submit
- Skeleton loader for logo preview
- Progress bar for logo upload

### 8.3 Responsive Breakpoints

| Breakpoint | Layout Changes                                   |
| ---------- | ------------------------------------------------ |
| < 640px    | Single column, reduced padding, stacked progress |
| 640px+     | Centered card, full padding, horizontal progress |
| 1024px+    | Max-width 480px, optional sidebar illustration   |

### 8.4 Accessibility

- All inputs have associated labels
- Error messages linked via `aria-describedby`
- Progress indicator announces step changes
- Focus trap within modal/dialog
- Keyboard navigation: Tab through fields, Enter to submit
- High contrast mode support

---

## 9. Data Model Changes

### 9.1 Prisma Schema Updates

```prisma
model Clinic {
  id            String             @id @default(cuid())
  name          String             @unique
  address       String?
  phone         String?
  email         String?
  logoUrl       String?            // NEW: Clinic logo storage URL
  subdomain     String?            @unique // NEW: For future white-label
  businessHours Json?              // NEW: Operating hours per day
  isActive      Boolean            @default(true)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  users         User[]
  patients      Patient[]
  invitations   ClinicInvitation[]

  @@index([name])
  @@index([subdomain])
  @@map("clinics")
}

// Add solo mode support to Patient
model Patient {
  // ... existing fields
  clinicId   String? // Nullable for solo mode
  clinic     Clinic? @relation(fields: [clinicId], references: [id], onDelete: SetNull)
  // ...
}
```

### 9.2 Migration Script

```sql
-- Add new columns
ALTER TABLE clinics ADD COLUMN logo_url VARCHAR(500);
ALTER TABLE clinics ADD COLUMN subdomain VARCHAR(100) UNIQUE;
ALTER TABLE clinics ADD COLUMN business_hours JSONB;

-- Make clinicId nullable in patients for solo mode
-- (Already nullable in current schema - verify)

-- Index for faster name lookups
CREATE INDEX idx_clinics_name ON clinics(name);
```

---

## 10. Implementation Tasks

### 10.1 Backend (Day 1)

- [ ] **BE-1:** Add logoUrl, subdomain, businessHours to Clinic model
- [ ] **BE-2:** Create `GET /clinics/check-name` endpoint with validation
- [ ] **BE-3:** Extend `POST /clinics` to accept full onboarding payload
- [ ] **BE-4:** Create `POST /clinics/:id/migrate-solo-patients` endpoint
- [ ] **BE-5:** Update User response to include `hasCompletedOnboarding`
- [ ] **BE-6:** Add business logic to send invitations during clinic creation
- [ ] **BE-7:** Write unit tests for new endpoints

### 10.2 Frontend - Core Wizard (Day 1-2)

- [ ] **FE-1:** Create `ClinicOnboardingContext` with state management
- [ ] **FE-2:** Build `ProgressIndicator` component
- [ ] **FE-3:** Implement `Step1Essentials` with async name validation
- [ ] **FE-4:** Implement `Step2Branding` with logo upload
- [ ] **FE-5:** Implement `Step3Team` with invitation form
- [ ] **FE-6:** Create main `ClinicOnboardingWizard` container
- [ ] **FE-7:** Add routing logic in App.tsx
- [ ] **FE-8:** Implement localStorage persistence

### 10.3 Frontend - Solo Mode & Quick Start (Day 2)

- [ ] **FE-9:** Create `SoloModeBanner` component
- [ ] **FE-10:** Add banner to Dashboard layout
- [ ] **FE-11:** Implement solo-to-clinic upgrade flow
- [ ] **FE-12:** Build `QuickStartScreen` with 3 action cards
- [ ] **FE-13:** Implement post-creation redirect logic
- [ ] **FE-14:** Add patient migration UI confirmation

### 10.4 Integration & Polish (Day 2-3)

- [ ] **INT-1:** Integrate wizard with auth redirect flow
- [ ] **INT-2:** Connect to clinicsApi service
- [ ] **INT-3:** Add error handling and retry logic
- [ ] **INT-4:** Implement success animations
- [ ] **INT-5:** Add analytics tracking (segment/mixpanel)
- [ ] **INT-6:** Mobile responsiveness testing
- [ ] **INT-7:** Accessibility audit

### 10.5 Testing (Day 3)

- [ ] **TEST-1:** Unit tests for wizard state management
- [ ] **TEST-2:** Component tests for all steps
- [ ] **TEST-3:** Integration test: full onboarding flow
- [ ] **TEST-4:** E2E test: registration → clinic creation → first patient
- [ ] **TEST-5:** Test solo mode upgrade path
- [ ] **TEST-6:** Test invitation bypass logic
- [ ] **TEST-7:** Cross-browser testing

---

## 11. Testing Strategy

### 11.1 Unit Tests

**ClinicOnboardingContext:**

- State updates correctly for each action type
- Form data persists to localStorage
- Reset clears all state

**Validation:**

- Name validation (min length, uniqueness)
- Email format validation
- Phone format validation (optional field)

### 11.2 Component Tests

**Step1Essentials:**

- Renders all fields
- Next button disabled with invalid name
- Async validation shows loading state
- Error message displays for taken name

**LogoUpload:**

- Accepts valid image types
- Rejects files > 2MB
- Shows preview after selection
- Uploads to MinIO and returns URL

### 11.3 Integration Tests

**Full Wizard Flow:**

- Complete 3-step wizard successfully
- Skip Step 2 and 3, still creates clinic
- Back navigation preserves data
- Form persistence across page refresh

**Solo Mode:**

- Skip from Step 1 lands on Dashboard with banner
- Create patient without clinic
- Upgrade to clinic migrates patient

### 11.4 E2E Tests

**Scenario: New Clinic Owner:**

1. Register new account
2. Complete Step 1 (Essentials)
3. Complete Step 2 (Branding with logo)
4. Invite team member in Step 3
5. See Quick Start screen
6. Click "Create First Patient"
7. Successfully create patient in new clinic

**Scenario: Solo Practitioner:**

1. Register new account
2. Skip clinic setup
3. Verify banner shows on Dashboard
4. Create patient in solo mode
5. Click banner upgrade
6. Create clinic
7. Verify patient migrated

---

## 12. Acceptance Criteria

### 12.1 Must Have (MVP)

- [ ] User can complete 3-step wizard in under 2 minutes
- [ ] Step 1 validates name uniqueness in real-time
- [ ] User can skip Steps 2 and 3 without errors
- [ ] Clinic created with user as CLINIC_OWNER
- [ ] Quick Start screen shows after creation
- [ ] Solo mode accessible via "Set up later" button
- [ ] Solo users see persistent upgrade banner
- [ ] Invitation recipients bypass clinic creation
- [ ] All form states persist to localStorage
- [ ] Mobile responsive on iPad (mother's primary device)

### 12.2 Should Have

- [ ] Logo upload with immediate preview
- [ ] Business hours picker with defaults
- [ ] Team invitation in Step 3
- [ ] Patient auto-migration from solo mode
- [ ] Success animation with confetti
- [ ] Analytics tracking for funnel

### 12.3 Nice to Have

- [ ] Multiple team invitations in Step 3
- [ ] Clinic name suggestions if taken
- [ ] Quick Start card click tracking
- [ ] Onboarding completion email
- [ ] Tutorial tooltips on first use

---

## 13. Risks & Mitigations

| Risk                             | Impact | Likelihood | Mitigation                                            |
| -------------------------------- | ------ | ---------- | ----------------------------------------------------- |
| Users abandon wizard if too long | High   | Medium     | Progressive disclosure, skip options, <2min target    |
| Name validation delays UX        | Medium | High       | Debounce 500ms, optimistic UI, loading states         |
| Logo upload failures             | Low    | Low        | Retry logic, fallback to no logo, error messaging     |
| Solo mode confusion              | Medium | Low        | Clear banner messaging, easy upgrade path             |
| Mobile layout issues             | High   | Medium     | Test on iPad Pro (mother's device), responsive design |
| Existing users without clinic    | Medium | Medium     | Migration script, manual clinic assignment tool       |

---

## 14. Future Considerations

### 14.1 White-Label Foundation

The schema includes `subdomain` and `logoUrl` to support:

- Custom subdomain routing (clinicname.mamirri.app)
- Branded patient portals
- Custom email templates
- White-label mobile apps

### 14.2 Multi-Clinic Membership

Schema supports future enhancement:

- User can belong to multiple clinics
- Clinic switcher in navigation
- Different roles per clinic
- Cross-clinic patient search (with permissions)

### 14.3 Analytics & Optimization

Track these events for future optimization:

- Step completion rates
- Time spent per step
- Skip rates by step
- Solo mode upgrade conversion
- Quick Start card click-through rates

### 14.4 Internationalization

Prepare for i18n:

- All user-facing strings in translation files
- RTL layout support for future languages
- Locale-specific validation (phone numbers, addresses)

---

## 15. Appendix

### 15.1 Related Documentation

- [Requirements Document](./planning/requirements.md)
- [Roadmap Task 9.9](../../../product/roadmap.md)
- [Existing ClinicDashboard](../../../../../apps/client/src/pages/ClinicDashboard.tsx)
- [Invitation Flow](../../../../../apps/client/src/pages/InvitationAcceptance.tsx)
- [Prisma Schema](../../../../../apps/server/prisma/schema.prisma)

### 15.2 Dependencies

- Frontend: React Hook Form, Zod, canvas-confetti (optional)
- Backend: Existing NestJS modules, MinIO, Prisma
- Infrastructure: No new infrastructure required

### 15.3 Performance Targets

- Initial load: < 1 second
- Step transition: < 300ms
- Name validation: < 500ms debounce
- Logo upload: Progress indicator, < 5 seconds for 2MB

---

**Spec Version:** 1.0  
**Last Updated:** 2026-02-19  
**Author:** AI Assistant  
**Status:** Ready for Implementation

---

## Sign-off

- [ ] Product Owner Review
- [ ] Technical Lead Review
- [ ] UX Designer Review
- [ ] QA Review

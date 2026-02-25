# Implementation Plan: Clinic Onboarding

**Spec:** 2026-02-19-clinic-onboarding  
**Estimated Duration:** 2-3 days  
**Team:** 1-2 developers  
**Priority:** High (Roadmap Task 9.9)

---

## Sprint Overview

### Goals

1. Enable new users to create clinics within 2 minutes of registration
2. Support flexible adoption with solo mode + upgrade path
3. Achieve >75% wizard completion rate
4. Maintain code quality with comprehensive tests

### Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit test coverage >80%
- [ ] E2E tests passing
- [ ] Code review approved
- [ ] QA sign-off
- [ ] Documentation updated
- [ ] Analytics verified

---

## Day-by-Day Breakdown

### Day 1: Backend Foundation

**Morning (4h): Database & API Design**

| Task                                      | Time | Assignee | Dependencies |
| ----------------------------------------- | ---- | -------- | ------------ |
| BE-1: Update Clinic Prisma model          | 1h   | Backend  | None         |
| BE-2: Create migration script             | 30m  | Backend  | BE-1         |
| BE-3: Implement `GET /clinics/check-name` | 1.5h | Backend  | BE-2         |
| BE-4: Extend `POST /clinics` endpoint     | 1.5h | Backend  | BE-3         |

**Deliverables:**

- Migration applied to database
- Name availability endpoint working
- Clinic creation accepting full payload

**Afternoon (4h): Backend Logic & Tests**

| Task                                   | Time | Assignee | Dependencies |
| -------------------------------------- | ---- | -------- | ------------ |
| BE-5: Implement solo patient migration | 1.5h | Backend  | BE-4         |
| BE-6: Add invitation sending logic     | 1h   | Backend  | BE-4         |
| BE-7: Update User response DTO         | 30m  | Backend  | None         |
| BE-8: Write unit tests                 | 2h   | Backend  | BE-5, BE-6   |

**Deliverables:**

- All backend endpoints tested
- Migration endpoint ready
- 80%+ test coverage on new code

---

### Day 2: Frontend Wizard & Solo Mode

**Morning (4h): Core Wizard Components**

| Task                                    | Time | Assignee | Dependencies |
| --------------------------------------- | ---- | -------- | ------------ |
| FE-1: Create ClinicOnboardingContext    | 1h   | Frontend | None         |
| FE-2: Build ProgressIndicator component | 1h   | Frontend | None         |
| FE-3: Implement Step1Essentials         | 1.5h | Frontend | BE-3         |
| FE-4: Add localStorage persistence      | 30m  | Frontend | FE-1         |

**Deliverables:**

- Step 1 functional with validation
- State management working
- Form data persists across refresh

**Afternoon (4h): Steps 2-3 & Solo Mode**

| Task                          | Time | Assignee | Dependencies |
| ----------------------------- | ---- | -------- | ------------ |
| FE-5: Implement Step2Branding | 1.5h | Frontend | FE-3         |
| FE-6: Implement Step3Team     | 1h   | Frontend | FE-5         |
| FE-7: Create SoloModeBanner   | 1h   | Frontend | None         |
| FE-8: Add routing integration | 30m  | Frontend | FE-7         |

**Deliverables:**

- All 3 steps functional
- Logo upload with preview
- Solo mode banner visible

---

### Day 3: Quick Start, Integration & Testing

**Morning (4h): Quick Start & Polish**

| Task                                | Time | Assignee | Dependencies |
| ----------------------------------- | ---- | -------- | ------------ |
| FE-9: Build QuickStartScreen        | 1.5h | Frontend | FE-6         |
| FE-10: Implement upgrade flow       | 1h   | Frontend | BE-5, FE-7   |
| INT-1: Integrate with auth redirect | 1h   | Frontend | FE-8         |
| INT-2: Add success animations       | 30m  | Frontend | FE-9         |

**Deliverables:**

- Quick Start screen after creation
- Solo → Clinic upgrade working
- Full flow from registration functional

**Afternoon (4h): Testing & QA**

| Task                           | Time | Assignee | Dependencies |
| ------------------------------ | ---- | -------- | ------------ |
| TEST-1: Unit tests for context | 1h   | Frontend | FE-1         |
| TEST-2: Component tests        | 1h   | Frontend | All FE       |
| TEST-3: E2E happy path         | 1.5h | QA       | All          |
| TEST-4: Cross-browser testing  | 30m  | QA       | TEST-3       |

**Deliverables:**

- All tests passing
- E2E flow verified
- Bug fixes complete

---

## Task Details

### Backend Tasks

#### BE-1: Update Clinic Prisma Model

**Description:** Add logoUrl, subdomain, and businessHours fields to Clinic model

```prisma
model Clinic {
  // ... existing fields
  logoUrl       String?
  subdomain     String? @unique
  businessHours Json?
  // ...
}
```

**Acceptance:**

- [ ] Schema updated
- [ ] TypeScript types generated
- [ ] No breaking changes to existing queries

**Estimate:** 1h

---

#### BE-2: Create Migration Script

**Description:** Generate and apply Prisma migration

**Command:**

```bash
pnpm --filter server exec npx prisma migrate dev --name add_clinic_onboarding_fields
```

**Acceptance:**

- [ ] Migration file created
- [ ] Applied to local DB
- [ ] Applied to staging DB

**Estimate:** 30m

---

#### BE-3: Implement Name Check Endpoint

**Description:** Create GET /clinics/check-name with validation

**File:** `apps/server/src/modules/clinics/clinics.controller.ts`

```typescript
@Get('check-name')
async checkName(@Query('name') name: string) {
  const validation = this.validateClinicName(name);
  if (!validation.valid) {
    return { available: false, error: validation.error };
  }

  const available = await this.clinicsService.isNameAvailable(name);
  return {
    available,
    suggestions: available ? [] : await this.suggestNames(name)
  };
}
```

**Acceptance:**

- [ ] Validates min/max length
- [ ] Checks uniqueness
- [ ] Returns suggestions if taken
- [ ] < 100ms response time

**Estimate:** 1.5h

---

#### BE-4: Extend Clinic Creation Endpoint

**Description:** Update POST /clinics to accept full onboarding data

**Request Body:**

```typescript
interface CreateClinicDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  businessHours?: BusinessHoursDto;
  initialInvitations?: InvitationDto[];
}
```

**Acceptance:**

- [ ] Creates clinic with all fields
- [ ] Sets creator as CLINIC_OWNER
- [ ] Sends invitations if provided
- [ ] Validates all inputs

**Estimate:** 1.5h

---

#### BE-5: Solo Patient Migration

**Description:** Create endpoint to migrate patients from solo to clinic

**File:** `apps/server/src/modules/clinics/clinics.controller.ts`

```typescript
@Post(':id/migrate-solo-patients')
@UseGuards(JwtAuthGuard, ClinicOwnerGuard)
async migrateSoloPatients(@Param('id') clinicId: string, @User() user) {
  const count = await this.clinicsService.migrateSoloPatients(user.id, clinicId);
  return { migratedCount: count, clinicId };
}
```

**Acceptance:**

- [ ] Finds all patients with clinicId=null for user
- [ ] Updates to new clinicId
- [ ] Returns count migrated
- [ ] Transactional (all or nothing)

**Estimate:** 1.5h

---

#### BE-6: Invitation Integration

**Description:** Send invitations during clinic creation

**Logic:**

```typescript
if (dto.initialInvitations?.length > 0) {
  for (const invite of dto.initialInvitations) {
    await this.invitationsService.create({
      ...invite,
      clinicId: newClinic.id,
      invitedById: user.id,
    });
  }
}
```

**Acceptance:**

- [ ] Invitations created with correct tokens
- [ ] Emails sent via existing service
- [ ] Expiration dates set (7 days)

**Estimate:** 1h

---

#### BE-7: Update User DTO

**Description:** Add hasCompletedOnboarding flag to User response

```typescript
// In UserDto
hasCompletedOnboarding: boolean; // true if clinicId exists
```

**Estimate:** 30m

---

#### BE-8: Unit Tests

**Description:** Write comprehensive tests for new endpoints

**Test Files:**

- `clinics.controller.spec.ts`
- `clinics.service.spec.ts`

**Coverage:**

- [ ] Name availability check
- [ ] Clinic creation (valid/invalid)
- [ ] Patient migration
- [ ] Invitation sending
- [ ] Edge cases (empty data, duplicates)

**Estimate:** 2h

---

### Frontend Tasks

#### FE-1: Create ClinicOnboardingContext

**Description:** React Context for wizard state management

**File:** `apps/client/src/components/clinic-onboarding/ClinicOnboardingContext.tsx`

```typescript
interface OnboardingState {
  currentStep: 1 | 2 | 3 | 'success';
  clinicData: ClinicFormData;
  invitations: Invitation[];
  isLoading: boolean;
  error?: string;
}
```

**Acceptance:**

- [ ] State updates work for all actions
- [ ] Persist to localStorage
- [ ] Clear on completion

**Estimate:** 1h

---

#### FE-2: Build ProgressIndicator

**Description:** Visual step indicator component

**File:** `apps/client/src/components/clinic-onboarding/components/ProgressIndicator.tsx`

**Design:**

```
○───●───○
1    2    3
Essentials Branding Team
```

**Props:**

```typescript
interface Props {
  currentStep: number;
  steps: Array<{ label: string; completed: boolean }>;
}
```

**Acceptance:**

- [ ] Shows correct step as active
- [ ] Completed steps show checkmark
- [ ] Clickable to navigate back

**Estimate:** 1h

---

#### FE-3: Implement Step1Essentials

**Description:** Required fields form with validation

**File:** `apps/client/src/components/clinic-onboarding/steps/Step1Essentials.tsx`

**Features:**

- Clinic name with async validation
- Email field
- Optional phone
- "Set up later" skip button
- Real-time error messages

**Validation:**

```typescript
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});
```

**Acceptance:**

- [ ] Name checks availability (debounced)
- [ ] All required fields validated
- [ ] Loading state during check
- [ ] Next button disabled until valid

**Estimate:** 1.5h

---

#### FE-4: localStorage Persistence

**Description:** Save form state to prevent data loss

**Logic:**

```typescript
useEffect(() => {
  localStorage.setItem('clinicOnboarding', JSON.stringify(state));
}, [state]);

useEffect(() => {
  const saved = localStorage.getItem('clinicOnboarding');
  if (saved) dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) });
}, []);
```

**Acceptance:**

- [ ] State saves on every change
- [ ] State restores on reload
- [ ] Cleared on completion

**Estimate:** 30m

---

#### FE-5: Implement Step2Branding

**Description:** Optional clinic customization

**File:** `apps/client/src/components/clinic-onboarding/steps/Step2Branding.tsx`

**Features:**

- Address textarea
- Logo upload with drag-drop
- Business hours picker
- Skip button
- Back/Next navigation

**LogoUpload Component:**

```typescript
interface LogoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
}
```

**Acceptance:**

- [ ] Logo uploads to MinIO
- [ ] Preview shows immediately
- [ ] File size validation (2MB)
- [ ] Business hours have defaults

**Estimate:** 1.5h

---

#### FE-6: Implement Step3Team

**Description:** Team invitation form

**File:** `apps/client/src/components/clinic-onboarding/steps/Step3Team.tsx`

**Features:**

- Email input
- Role selector (Admin/Therapist)
- Add/remove invitations
- Submit to create clinic

**Acceptance:**

- [ ] Can add multiple invitations
- [ ] Validates email format
- [ ] Submit creates clinic with invites
- [ ] Shows success state

**Estimate:** 1h

---

#### FE-7: Create SoloModeBanner

**Description:** Dashboard banner for solo users

**File:** `apps/client/src/components/clinic-onboarding/components/SoloModeBanner.tsx`

**Design:**

```
┌─────────────────────────────────────────────────────┐
│  👤 You're in personal mode                         │
│  Set up a clinic to unlock team features →          │
└─────────────────────────────────────────────────────┘
```

**Acceptance:**

- [ ] Shows when user.clinicId is null
- [ ] Click opens clinic creation
- [ ] Dismissible (remember preference)

**Estimate:** 1h

---

#### FE-8: Add Routing Integration

**Description:** Wire up routes and guards

**Files:**

- `apps/client/src/App.tsx`
- `apps/client/src/components/auth/ProtectedRoute.tsx`

**Routes:**

```typescript
<Route path="/onboarding/clinic" element={<ClinicOnboardingWizard />} />
<Route path="/onboarding/quick-start" element={<QuickStartScreen />} />
```

**Guard Logic:**

```typescript
if (!user.clinicId && !hasInvitationToken) {
  return <Navigate to="/onboarding/clinic" />;
}
```

**Acceptance:**

- [ ] Post-registration redirects to wizard
- [ ] Invitation token bypasses wizard
- [ ] Existing clinic users skip to dashboard

**Estimate:** 30m

---

#### FE-9: Build QuickStartScreen

**Description:** Post-creation action cards

**File:** `apps/client/src/components/clinic-onboarding/QuickStart/index.tsx`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Welcome to [Clinic]! 🎉                            │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Create   │ │  Invite  │ │Configure │            │
│  │ Patient  │ │   Team   │ │ Settings │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│              Skip for now →                         │
└─────────────────────────────────────────────────────┘
```

**Acceptance:**

- [ ] Shows clinic name and logo
- [ ] Cards navigate correctly
- [ ] Skip goes to dashboard
- [ ] Responsive layout

**Estimate:** 1.5h

---

#### FE-10: Implement Upgrade Flow

**Description:** Solo → Clinic migration UI

**Flow:**

1. User clicks banner
2. Shows simplified wizard (Step 1 only)
3. On creation: calls migration endpoint
4. Shows confirmation with patient count

**Acceptance:**

- [ ] Banner click opens wizard
- [ ] Quick clinic creation (1 step)
- [ ] Migration API called
- [ ] Success message with count

**Estimate:** 1h

---

### Integration Tasks

#### INT-1: Auth Redirect Integration

**Description:** Hook into post-registration flow

**File:** `apps/client/src/hooks/use-auth.tsx`

**Logic:**

```typescript
const handlePostRegistration = async (user: User) => {
  if (user.clinicId) return '/dashboard';
  if (hasInvitationToken()) return '/invitation/accept';
  return '/onboarding/clinic';
};
```

**Acceptance:**

- [ ] New users go to wizard
- [ ] Invitees go to acceptance
- [ ] Existing users go to dashboard

**Estimate:** 1h

---

#### INT-2: Success Animations

**Description:** Add polish with animations

**Libraries:**

- canvas-confetti (completion celebration)
- Framer Motion (step transitions)

**Implementation:**

```typescript
// On completion
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
});
```

**Estimate:** 30m

---

### Testing Tasks

#### TEST-1: Unit Tests - Context

**Description:** Test state management

**File:** `ClinicOnboardingContext.spec.tsx`

**Tests:**

- State updates correctly
- localStorage integration
- Reset functionality

**Estimate:** 1h

---

#### TEST-2: Component Tests

**Description:** Test all wizard steps

**Files:**

- `Step1Essentials.spec.tsx`
- `Step2Branding.spec.tsx`
- `Step3Team.spec.tsx`

**Tests:**

- Rendering
- Validation
- User interactions
- Error states

**Estimate:** 1h

---

#### TEST-3: E2E Happy Path

**Description:** Full user journey test

**Scenario:**

```gherkin
Given a new user registers
When they complete clinic onboarding
Then they see the Quick Start screen
And they can create their first patient
```

**Estimate:** 1.5h

---

#### TEST-4: Cross-Browser Testing

**Description:** Verify on target devices

**Devices:**

- [ ] iPad Pro (mother's device)
- [ ] Chrome desktop
- [ ] Safari mobile
- [ ] Firefox

**Estimate:** 30m

---

## Dependencies Graph

```
BE-1 (Schema)
    ↓
BE-2 (Migration)
    ↓
BE-3 (Name Check) ────────────────────────────┐
    ↓                                           │
BE-4 (Create Clinic)                           │
    ↓                                           │
BE-5 (Migration) ──────────────────────────────┤
    ↓                                           │
BE-6 (Invitations)                             │
    ↓                                           │
BE-7 (DTO)                                     │
    ↓                                           │
BE-8 (Tests)                                   │
                                               │
FE-1 (Context)                                 │
    ↓                                          │
FE-2 (Progress)                                │
    ↓                                          │
FE-3 (Step 1) ◀────────────────────────────────┤
    ↓                                          │
FE-4 (Persistence)                             │
    ↓                                          │
FE-5 (Step 2)                                  │
    ↓                                          │
FE-6 (Step 3)                                  │
    ↓                                          │
FE-7 (Banner) ─────────────────────────────────┤
    ↓                                          │
FE-8 (Routing)                                 │
    ↓                                          │
FE-9 (Quick Start)                             │
    ↓                                          │
FE-10 (Upgrade) ◀──────────────────────────────┘
    ↓
INT-1 (Auth)
    ↓
INT-2 (Animations)
    ↓
TEST-1,2,3,4
```

---

## Risk Mitigation

### Risk: Backend API Delays

**Mitigation:** Frontend can mock API responses for parallel development

### Risk: File Upload Complexity

**Mitigation:** Reuse existing MinIO upload hook from media module

### Risk: Mobile Layout Issues

**Mitigation:** Test on iPad Pro early (Day 2 morning)

### Risk: Integration Complexity

**Mitigation:** Pair programming for auth routing changes

---

## Success Metrics Tracking

### Analytics Events

```typescript
// Track these events
analytics.track('Onboarding Started');
analytics.track('Step 1 Completed', { nameLength, hasPhone });
analytics.track('Step 2 Skipped');
analytics.track('Step 2 Completed', { hasLogo, hasAddress });
analytics.track('Step 3 Skipped');
analytics.track('Step 3 Completed', { invitationCount });
analytics.track('Onboarding Completed', { totalTime, soloMode: false });
analytics.track('Solo Mode Selected');
analytics.track('Solo Mode Upgraded');
analytics.track('Quick Start - Create Patient Clicked');
analytics.track('Quick Start - Invite Team Clicked');
analytics.track('Quick Start - Settings Clicked');
```

### Dashboard Queries

```sql
-- Completion rate
SELECT
  COUNT(*) FILTER (WHERE step = 'success') * 100.0 / COUNT(*)
FROM onboarding_events
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Average time per step
SELECT
  step,
  AVG(duration_seconds)
FROM onboarding_step_times
GROUP BY step;

-- Solo mode conversion
SELECT
  COUNT(*) FILTER (WHERE upgraded) * 100.0 / COUNT(*)
FROM solo_mode_users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## Post-Launch Checklist

- [ ] Monitor error rates (Sentry)
- [ ] Check completion rates (Analytics)
- [ ] Review user feedback (Hotjar recordings)
- [ ] Optimize based on drop-off points
- [ ] Document lessons learned
- [ ] Update onboarding guide for new users

---

**Plan Version:** 1.0  
**Created:** 2026-02-19  
**Review Date:** Post-implementation Day 3

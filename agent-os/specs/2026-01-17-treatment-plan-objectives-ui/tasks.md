# Task Breakdown: Treatment Plan Objectives UI

## Overview

Total Tasks: 18 sub-tasks across 4 task groups

## Task List

### Backend Layer

#### Task Group 1: API Endpoint for Treatment Plan Objectives

**Dependencies:** None (TreatmentPlan model already exists in Prisma schema)

- [x] 1.0 Complete backend API layer
  - [x] 1.1 Write 4 focused tests for treatment plan objectives endpoint
    - Test successful PATCH with valid objectives
    - Test 404 when treatment plan not found
    - Test 403 when accessing another therapist's treatment plan
    - Test partial update (only one objective field)
  - [x] 1.2 Create UpdateTreatmentPlanObjectivesDto
    - Fields: `therapeutic?: string`, `prophylactic?: string`, `educational?: string`
    - Location: `apps/server/src/modules/treatment-plans/dto/update-objectives.dto.ts`
    - Use class-validator decorators: `@IsString()`, `@IsOptional()`
  - [x] 1.3 Create TreatmentPlansService with updateObjectives method
    - Location: `apps/server/src/modules/treatment-plans/treatment-plans.service.ts`
    - Implement therapist-scoped access control (reference clinical-cases.service.ts pattern)
    - Use Prisma `update` with JSON field merge for objectives
  - [x] 1.4 Create TreatmentPlansController with PATCH endpoint
    - Route: `PATCH /treatment-plans/:id/objectives`
    - Location: `apps/server/src/modules/treatment-plans/treatment-plans.controller.ts`
    - Use `@ApiTags('treatment-plans')`, `@ApiBearerAuth()`, `@UseGuards(JwtAuthGuard)`
  - [x] 1.5 Create TreatmentPlansModule and register in app
    - Location: `apps/server/src/modules/treatment-plans/treatment-plans.module.ts`
    - Import PrismaModule, export service
    - Register in `app.module.ts`
  - [x] 1.6 Ensure backend tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify endpoint responds correctly

**Acceptance Criteria:**

- The 4 tests pass ✅
- `PATCH /treatment-plans/:id/objectives` updates the objectives JSON field ✅
- Proper 404/403 error responses ✅
- Swagger documentation generated ✅

---

### Frontend API Layer

#### Task Group 2: Frontend API Integration

**Dependencies:** Task Group 1

- [x] 2.0 Complete frontend API integration
  - [x] 2.1 Add UpdateTreatmentPlanObjectivesDto interface
    - Location: `apps/client/src/api/patients.ts`
    - Interface: `{ therapeutic?: string, prophylactic?: string, educational?: string }`
  - [x] 2.2 Add updateTreatmentPlanObjectives method to patientsApi
    - Method signature: `(planId: string, data: UpdateTreatmentPlanObjectivesDto) => Promise<TreatmentPlan>`
    - Use `axios.patch('/treatment-plans/${planId}/objectives', data)`
    - Follow existing `updateEvaluation` pattern
  - [x] 2.3 Verify API integration works
    - Manual test via browser devtools or simple integration test
    - Confirm request/response format matches backend

**Acceptance Criteria:**

- `patientsApi.updateTreatmentPlanObjectives()` method exists and works ✅
- Correct axios configuration and error handling ✅
- TypeScript types are correct ✅

---

### Frontend Components

#### Task Group 3: ObjectivesView Component and CaseDetailLayout Integration

**Dependencies:** Task Group 2

- [x] 3.0 Complete UI components
  - [x] 3.1 Write 6 focused tests for ObjectivesView component
    - Test renders three objective cards (therapeutic, prophylactic, educational)
    - Test displays existing objectives from clinicalCase prop
    - Test calls onObjectivesChange callback when text changes
    - Test shows empty state when all objectives are empty strings
    - Test shows saving indicator during debounce
    - Test shows error toast on save failure
  - [x] 3.2 Create ObjectiveCard sub-component
    - Location: `apps/client/src/components/patients/objectives/ObjectiveCard.tsx`
    - Props: `type: 'therapeutic' | 'prophylactic' | 'educational'`, `value: string`, `onChange: (value: string) => void`, `disabled?: boolean`
    - Render color-coded card with icon, label, textarea
    - Include disabled voice dictation button placeholder
  - [x] 3.3 Create ObjectivesView component
    - Location: `apps/client/src/components/patients/ObjectivesView.tsx`
    - Props: `clinicalCase: ClinicalCase`, `onObjectivesChange: (objectives: TreatmentObjectives) => Promise<void>`
    - Render three ObjectiveCard components in responsive grid
    - Implement empty state when all objectives are empty
    - Use `useDebounce` hook for auto-save (300ms delay)
    - Show save status indicator (idle/saving/saved/error)
  - [x] 3.4 Add handleObjectivesChange handler to CaseDetailLayout
    - Location: `apps/client/src/components/patients/CaseDetailLayout.tsx`
    - Pattern: Follow `handlePosturogramChange` implementation
    - Optimistic update to `localCase.treatmentPlan.objectives`
    - Call `patientsApi.updateTreatmentPlanObjectives()`
    - Rollback on error with toast notification
  - [x] 3.5 Add 'objectives' ViewMode and navigation tab
    - Add `'objectives'` to `ViewMode` type union (line 26)
    - Add navigation button with `Target` icon between Evaluacion and Comparar
    - Follow existing tab button styling pattern
    - Label: "Objetivos" (hidden on mobile via `hidden sm:inline`)
  - [x] 3.6 Add ObjectivesView render case to view switch
    - Add case in the view switch block (after evaluation, before comparison)
    - Pass `localCase` and `handleObjectivesChange` as props
    - Wrap in same container styling as other views
  - [x] 3.7 Implement responsive design
    - Cards stack vertically below `md` breakpoint
    - Full-width textareas on mobile
    - Touch-friendly padding (min 44px targets)
  - [x] 3.8 Ensure UI component tests pass
    - Run ONLY the 6 tests written in 3.1
    - Verify all component behaviors work correctly

**Acceptance Criteria:**

- The 6 tests pass ✅
- "Objetivos" tab appears in CaseDetailLayout navigation ✅
- Three color-coded cards render with correct styling ✅
- Auto-save works with debounce ✅
- Empty state displays when appropriate ✅
- Mobile-responsive layout works ✅

---

### Testing

#### Task Group 4: Test Review & Integration Verification

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review and verify feature integration
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review 4 backend tests from Task 1.1
    - Review 6 frontend tests from Task 3.1
    - Total existing tests: 10 tests
  - [x] 4.2 Analyze test coverage gaps for this feature only
    - Check if end-to-end flow is covered (load → edit → save → verify)
    - Identify any critical integration points missing coverage
  - [x] 4.3 Write up to 4 additional integration tests if needed
    - Existing tests cover critical flows adequately
    - No additional tests needed
  - [x] 4.4 Run feature-specific tests only
    - Backend: 146 tests passing (including 4 new treatment-plans tests)
    - Frontend: 194 tests passing (including 6 new ObjectivesView tests)
    - All critical workflows verified

**Acceptance Criteria:**

- All feature-specific tests pass (10 tests total) ✅
- End-to-end flow works: navigate → view → edit → auto-save ✅
- No regressions in existing functionality ✅

---

## Execution Order

Recommended implementation sequence:

```
1. Backend Layer (Task Group 1) ✅
   └── Creates PATCH /treatment-plans/:id/objectives endpoint

2. Frontend API Layer (Task Group 2) ✅
   └── Adds patientsApi.updateTreatmentPlanObjectives()

3. Frontend Components (Task Group 3) ✅
   └── Creates ObjectivesView and integrates into CaseDetailLayout

4. Test Review (Task Group 4) ✅
   └── Verifies integration and fills critical gaps
```

## Files to Create/Modify

### New Files

- `apps/server/src/modules/treatment-plans/treatment-plans.module.ts` ✅
- `apps/server/src/modules/treatment-plans/treatment-plans.controller.ts` ✅
- `apps/server/src/modules/treatment-plans/treatment-plans.service.ts` ✅
- `apps/server/src/modules/treatment-plans/dto/update-objectives.dto.ts` ✅
- `apps/server/src/modules/treatment-plans/treatment-plans.service.spec.ts` ✅
- `apps/client/src/components/patients/ObjectivesView.tsx` ✅
- `apps/client/src/components/patients/ObjectivesView.test.tsx` ✅
- `apps/client/src/components/patients/objectives/ObjectiveCard.tsx` ✅

### Modified Files

- `apps/server/src/app.module.ts` (register TreatmentPlansModule) ✅
- `apps/client/src/api/patients.ts` (add updateTreatmentPlanObjectives) ✅
- `apps/client/src/components/patients/CaseDetailLayout.tsx` (add objectives view mode) ✅

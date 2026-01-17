# Task Breakdown: 5-Phase Progress Visualization

## Overview

Total Tasks: 8 sub-tasks across 2 task groups

This is a lightweight feature. The UI components (PhaseProgress, SessionForm, TimelineSidebar) already render phases dynamically from props. The main work is:

1. Update backend to create 5 default phases when creating a new patient
2. Update test mock data to use 5 phases

## Task List

### Backend Layer

#### Task Group 1: Default Phases Update

**Dependencies:** None

- [x] 1.0 Complete backend default phases update
  - [x] 1.1 Define the 5 default phases array
    - Phase 1: "Inicial" - mobilizations, pain relief
    - Phase 2: "Temprana Intermedia" - begin stretching
    - Phase 3: "Intermedia" - flexibility gains
    - Phase 4: "Tardía Intermedia" - therapeutic exercises
    - Phase 5: "Avanzada" - functional strengthening
    - Each phase includes: number, name, durationWeeks (default 3), techniques[], objectives
  - [x] 1.2 Update `patients.service.ts` to use 5 default phases
    - Location: `apps/server/src/modules/patients/patients.service.ts` line 77
    - Replace `phases: []` with the 5 default phases array
    - Follow existing TreatmentPhase interface structure
  - [x] 1.3 Verify backend compiles without errors
    - Run `npm run build` in apps/server
    - Ensure no TypeScript errors

**Acceptance Criteria:**

- patients.service.ts creates TreatmentPlan with 5 phases ✅
- Each phase has correct name, number, techniques, objectives ✅
- Backend compiles successfully ✅

---

### Testing Layer

#### Task Group 2: Test Mock Data Updates

**Dependencies:** Task Group 1

- [x] 2.0 Update test mock data to 5 phases
  - [x] 2.1 Update PhaseProgress.test.tsx mockPhases
    - Location: `apps/client/src/components/patients/treatment-timeline/PhaseProgress.test.tsx`
    - Update `mockPhases` array to include all 5 phases
    - Update test expectations for phase count if hardcoded
  - [x] 2.2 Update TimelineSidebar.test.tsx mockPhases
    - Location: `apps/client/src/components/patients/treatment-timeline/TimelineSidebar.test.tsx`
    - Update mock treatmentPlan.phases to 5 phases
  - [x] 2.3 Update PatientProfile.test.tsx mockPhases
    - Location: `apps/client/src/components/patients/PatientProfile.test.tsx`
    - Update `mockPhases` array to 5 phases
  - [x] 2.4 Update other test files with phase mock data
    - CaseDetailLayout.test.tsx - update phases array in mock
    - SessionDetailView.test.tsx - update phases array in mock
    - CaseTimeline.test.tsx - update phases array in mock
  - [x] 2.5 Run all tests to verify no regressions
    - Run `npm test` in apps/client
    - Run `npm test` in apps/server
    - All tests should pass

**Acceptance Criteria:**

- All test mock data uses 5 phases consistently ✅
- All frontend tests pass (194 expected) ✅
- All backend tests pass (146 expected) ✅
- No phase-related test failures ✅

---

## Execution Order

Recommended implementation sequence:

```
1. Backend Layer (Task Group 1) ✅
   └── Update patients.service.ts to create 5 default phases

2. Testing Layer (Task Group 2) ✅
   └── Update test mock data across frontend test files
```

## Files Modified

### Backend

- `apps/server/src/modules/patients/patients.service.ts` ✅

### Frontend Tests

- `apps/client/src/components/patients/treatment-timeline/PhaseProgress.test.tsx` ✅
- `apps/client/src/components/patients/treatment-timeline/TimelineSidebar.test.tsx` ✅
- `apps/client/src/components/patients/PatientProfile.test.tsx` ✅
- `apps/client/src/components/patients/CaseDetailLayout.test.tsx` ✅
- `apps/client/src/components/patients/treatment-timeline/SessionDetailView.test.tsx` ✅
- `apps/client/src/components/patients/CaseTimeline.test.tsx` ✅

## Notes

- **No UI component changes needed** - PhaseProgress, SessionForm, TimelineSidebar already render phases dynamically
- **No database migration needed** - phases stored as JSON field
- **No TypeScript interface changes needed** - TreatmentPhase interface supports any number of phases

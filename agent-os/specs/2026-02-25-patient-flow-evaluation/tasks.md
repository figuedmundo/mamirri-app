# Task Breakdown: Patient Flow Evaluation (SOAP Restructuring)

## Overview

Total Tasks: 6 task groups, ~30 sub-tasks

## Task List

### Database & Schema

#### Task Group 1: Evaluation Model Simplification (1:N → 1:1)

**Dependencies:** None

- [x] 1.0 Complete database schema changes
- [x] 1.1 Write 4 focused tests for the new 1:1 evaluation model
  - Test: ClinicalCase has at most one Evaluation (unique constraint on clinicalCaseId)
  - Test: Evaluation can be created without a `type` field
  - Test: Patient creation creates Patient + ClinicalCase + empty Evaluation (no TreatmentPlan, no phases)
  - Test: TreatmentPlan can be created separately after case creation
  - [x] 1.2 Update Prisma schema for 1:1 Evaluation
    - Change `ClinicalCase.evaluations Evaluation[]` → `ClinicalCase.evaluation Evaluation?`
    - Add `@unique` constraint on `Evaluation.clinicalCaseId`
    - Remove the `type` field from the Evaluation model
    - Keep all other Evaluation fields (diagnosis, painScale, orthopedicTests, posturogram, avdEvaluation, voiceNotes)
  - [x] 1.3 Generate and apply Prisma migration
    - Run `npx prisma migrate dev` to generate the migration
    - Database will be dumped and recreated — no data migration needed
  - [x] 1.4 Ensure database layer tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify migration runs successfully

**Acceptance Criteria:**

- The 4 tests pass
- `ClinicalCase` has a 1:1 relation with `Evaluation`
- `Evaluation.type` field no longer exists
- Migration applies cleanly on a fresh database

### Backend Services & API

#### Task Group 2: Service Layer Updates

**Dependencies:** Task Group 1

- [x] 2.0 Complete backend service changes
- [x] 2.1 Write 5 focused tests for updated backend behavior
  - Test: `PatientsService.create()` creates Patient + ClinicalCase + empty Evaluation only (no TreatmentPlan)
  - Test: `PatientsService.findOne()` returns `clinicalCase.evaluation` (singular) instead of `clinicalCase.evaluations[]`
  - Test: `PATCH /patients/evaluations/:id` updates the single evaluation correctly
  - Test: TreatmentPlan CRUD works independently from patient creation
  - Test: Evaluation update accepts partial SOAP data (diagnosis, painScale, etc.)
  - [x] 2.2 Simplify `PatientsService.create()`
    - Remove auto-creation of TreatmentPlan with 5 phases
    - Remove auto-creation of INITIAL Evaluation type
    - Create only: Patient + ClinicalCase + empty Evaluation (no type, empty JSON fields)
    - Keep the Prisma transaction pattern
  - [x] 2.3 Update `PatientsService.findOne()` and `findAll()`
    - Change Prisma includes from `evaluations: true` → `evaluation: true`
    - Update media hydration logic (`hydratePatientMedia`) for singular evaluation
  - [x] 2.4 Update `ClinicalCasesService`
    - Change includes from `evaluations: true` → `evaluation: true`
    - Update any references to evaluation arrays
- [x] 2.5 Update DTOs and response shapes
  - Remove `type` from `UpdateEvaluationDto`
  - Update `PatientResponseDto` to reflect singular evaluation
  - Ensure evaluation PATCH endpoint works with partial SOAP-structured data
- [x] 2.6 Ensure backend tests pass
  - Run ONLY the 5 tests written in 2.1
  - Verify API endpoints return correct response shapes

**Acceptance Criteria:**

- The 5 tests pass
- Patient creation no longer auto-creates TreatmentPlan or phases
- All API responses use singular `evaluation` instead of `evaluations[]`
- Evaluation updates work with partial data

### Frontend Types & Utilities

#### Task Group 3: Type System & Utility Updates

**Dependencies:** Task Group 2

- [x] 3.0 Complete frontend type and utility changes
- [x] 3.1 Write 4 focused tests for updated utilities
  - Test: ClinicalCase type has `evaluation?: Evaluation` (not `evaluations[]`)
  - Test: Evaluation type has no `type` field
  - Test: API client correctly fetches singular evaluation
  - Test: Pain scale data extraction works from singular evaluation
- [x] 3.2 Update TypeScript types in `types/patient.ts`
  - Change `ClinicalCase.evaluations: Evaluation[]` → `ClinicalCase.evaluation?: Evaluation`
  - Remove `EvaluationType` enum (INITIAL/PROGRESS/FINAL)
  - Remove `type` field from `Evaluation` interface
  - [x] 3.3 Refactor `evaluation-utils.ts`
    - Remove `getInitialEvaluation()`, `getFinalEvaluation()`, `canCreateEvaluationOfType()`
    - Replace `getActiveEvaluation()` with a simple accessor: `clinicalCase.evaluation`
    - Update or remove `getLatestEvaluation()` — no longer needed with 1:1
  - [x] 3.4 Update API client in `api/patients.ts`
    - Update response type expectations for singular evaluation
    - Update any evaluation-related API calls
  - [x] 3.5 Ensure type and utility tests pass
    - Run ONLY the 4 tests written in 3.1
    - Verify no TypeScript compilation errors across the client

**Acceptance Criteria:**

- The 4 tests pass
- Zero TypeScript errors related to evaluation types
- All evaluation utility functions work with the 1:1 model
- API client correctly handles singular evaluation responses

### Frontend UI — SOAP Evaluation Form

#### Task Group 4: SOAP Form Components

**Dependencies:** Task Group 3

- [x] 4.0 Complete SOAP evaluation form
- [x] 4.1 Write 6 focused tests for SOAP form components
  - Test: SOAP form renders 4 sections (Subjective, Objective, Assessment, Plan)
  - Test: Section navigation switches between S/O/A/P via activeSection state
  - Test: Subjective section renders VoiceRecorder and text input
  - Test: Objective section shows pain scale by default, no tests shown until added
  - Test: "Add test" interface adds a test card to the Objective section
  - Test: Assessment section renders diagnosis fields prominently
  - [x] 4.2 Build SOAP section navigation
    - Reuse `activeSection` state pattern from current EvaluationForm
    - Change union type to `'subjective' | 'objective' | 'assessment' | 'plan'`
    - Horizontal button bar with S | O | A | P tabs
    - Single-column layout optimized for tablets (iPad + Android)
  - [x] 4.3 Build Subjective section
    - VoiceRecorder component as primary input (reuse existing component as-is)
    - Text area for chief complaint / patient history / symptoms
    - Voice dictation button prominent and always visible (60px+ touch target)
  - [x] 4.4 Build Objective section with progressive disclosure
    - Pain scale sliders always visible (reuse existing `<input type="range">` implementation)
    - "Add test" button that opens a picker/search interface
    - Adapt `LibrarySearchBar` pattern + `Select` component for the test picker
    - Available categories: Orthopedic Tests (8), Posturogram, Barthel Scale, Lawton Scale
    - Each added test renders as a collapsible card (expand to fill, collapse when done)
    - Zero tests shown by default
  - [x] 4.5 Build Assessment section (diagnosis-first)
    - Diagnosis fields prominent and easy to fill — this is the core of Issue #40
    - Diagnosis data stored in `evaluation.diagnosis` JSON field
    - Must be accessible without scrolling through tests
  - [x] 4.6 Build Plan section
    - Show prompt/disabled state when no diagnosis exists in Assessment
    - When diagnosis exists: show interface to manually add treatment phases
    - Phases addable incrementally (no fixed count)
    - Link to existing TreatmentTimeline/Cronograma components for phase visualization
- [x] 4.7 Implement auto-save with debounce
  - Reuse existing `useDebounce` pattern from current EvaluationForm
  - Auto-save on all form changes across all 4 SOAP sections
  - Touch targets: 60px for primary actions, 44px minimum for all interactive elements
- [x] 4.8 Ensure SOAP form tests pass
  - Run ONLY the 6 tests written in 4.1
  - Verify sections render and navigate correctly

**Acceptance Criteria:**

- The 6 tests pass
- SOAP form renders 4 navigable sections
- Subjective section uses voice dictation as primary input
- Objective section shows only pain scale by default, tests added on demand
- Assessment section makes diagnosis prominent and easy
- Plan section is gated by diagnosis existence
- Auto-save works across all sections
- Touch targets meet tablet size requirements

### Frontend UI — Integration & Wiring

#### Task Group 5: Component Integration

**Dependencies:** Task Group 4

- [x] 5.0 Complete integration with existing components
- [x] 5.1 Write 4 focused tests for integration points
  - Test: CaseDetailLayout renders the new SOAP form instead of the old EvaluationForm
  - Test: ComparisonBoard renders session-level pain data (not Initial vs Final evaluations)
  - Test: CaseDetailLayout passes singular evaluation to child components
  - Test: Plan section links to TreatmentTimeline for phase management
  - [x] 5.2 Update CaseDetailLayout
    - Replace old EvaluationForm import with new SOAP evaluation form
    - Pass singular `clinicalCase.evaluation` instead of `clinicalCase.evaluations`
    - Update all child component props that previously consumed evaluation arrays
  - [x] 5.3 Update ComparisonBoard
    - Remove dependency on `getInitialEvaluation()` / `getFinalEvaluation()`
    - Refactor to compare session-level pain data over time (from TreatmentSession records)
    - Show pain trend across sessions instead of Initial vs Final comparison
  - [x] 5.4 Update remaining components referencing evaluations[]
    - Update PatientProfile, CaseTimeline, and any other components using evaluation arrays
    - Update all imports of removed evaluation-utils functions
    - Ensure no broken references to `EvaluationType` enum
- [x] 5.5 Ensure integration tests pass
  - Run ONLY the 4 tests written in 5.1
  - Verify CaseDetailLayout renders correctly with the new SOAP form
  - Verify no console errors or broken component references

**Acceptance Criteria:**

- The 4 tests pass
- CaseDetailLayout correctly renders the new SOAP form
- ComparisonBoard works with session-level data
- No broken imports or references to removed evaluation utilities
- Full patient flow works: Patient → SOAP Evaluation → Diagnosis → Manual Phases

### Testing

#### Task Group 6: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps only
- [x] 6.1 Review tests from Task Groups 1-5
  - Review the 4 tests from Task Group 1 (database)
  - Review the 5 tests from Task Group 2 (backend)
  - Review the 4 tests from Task Group 3 (types/utils)
  - Review the 6 tests from Task Group 4 (SOAP form)
  - Review the 4 tests from Task Group 5 (integration)
  - Total existing tests: approximately 23 tests
- [x] 6.2 Analyze test coverage gaps for this feature only
  - Identify critical user workflows that lack test coverage
  - Focus on the diagnosis-first flow (Issue #40 resolution)
  - Check that progressive disclosure (add/remove tests) is tested
  - Verify the 1:1 evaluation model is tested end-to-end
- [x] 6.3 Write up to 8 additional strategic tests maximum
  - Focus on end-to-end workflows: patient creation → SOAP evaluation → diagnosis → add phases
  - Test the "add test" progressive disclosure flow
  - Test auto-save behavior across SOAP sections
  - Do NOT write exhaustive edge case tests
- [x] 6.4 Run feature-specific tests only
  - Run ONLY tests related to this spec (tests from 1.1, 2.1, 3.1, 4.1, 5.1, and 6.3)
  - Expected total: approximately 31 tests maximum
  - Verify critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 31 tests total)
- Diagnosis-first flow is covered end-to-end
- Progressive disclosure workflow is tested
- No more than 8 additional tests added
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. Database & Schema (Task Group 1) — Foundation; 1:1 model change
2. Backend Services & API (Task Group 2) — Simplified create flow, updated endpoints
3. Frontend Types & Utilities (Task Group 3) — Type alignment, utility cleanup
4. Frontend UI — SOAP Form (Task Group 4) — Core UI restructuring
5. Frontend UI — Integration (Task Group 5) — Wire new form into existing layout
6. Test Review & Gap Analysis (Task Group 6) — Final quality check

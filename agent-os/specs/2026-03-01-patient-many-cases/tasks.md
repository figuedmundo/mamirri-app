# Task Breakdown: Patient Can Have Many Cases

## Overview

Total Tasks: 14
Scope: Frontend-only (backend/database already support 1:N)

## Task List

### Frontend Data Layer

#### Task Group 1: API Method & Mutation Hook

**Dependencies:** None

- [x] 1.0 Complete frontend data layer for case creation
  - [x] 1.1 Write 3 focused tests for `createCase` API and `useCreateCase` hook
    - Test `patientsApi.createCase()` calls `POST /api/v1/cases` with correct body `{ patientId, title, consultationReason }`
    - Test `useCreateCase` invalidates `queryKeys.patients.lists()` and `queryKeys.patients.detail(patientId)` on success
    - Test `useCreateCase` shows destructive toast on error
  - [x] 1.2 Add `createCase` method to `patientsApi` in `apps/client/src/api/patients.ts`
    - Calls `POST /api/v1/cases` with body `{ patientId, title, consultationReason }`
    - Returns `ClinicalCase` type
    - Follow same pattern as existing `patientsApi.create()` method
  - [x] 1.3 Add `useCreateCase()` hook to `apps/client/src/hooks/use-patients.ts`
    - Clone `useCreatePatient()` pattern: `useMutation` + `queryClient.invalidateQueries` + toast
    - On success: invalidate `queryKeys.patients.lists()` and `queryKeys.patients.detail(patientId)`
    - Accept `{ patientId, title, consultationReason }` as mutation variables
    - Success toast: "Caso clínico creado correctamente"
    - Error toast: "No se pudo crear el caso clínico"
  - [x] 1.4 Ensure data layer tests pass
    - Run ONLY the 3 tests written in 1.1
    - Verify API method and hook work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3 tests written in 1.1 pass
- `patientsApi.createCase()` sends correct POST request
- `useCreateCase()` invalidates correct cache keys and shows toasts
- Follows existing hook/API patterns exactly

### Frontend Components

#### Task Group 2: Case List & Collapsible Cards

**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 2.0 Complete case list rendering with collapsible cards
  - [x] 2.1 Write 4 focused tests for case list rendering
    - Test all cases render grouped by status (active → completed → inactive)
    - Test active cases render expanded with full `ClinicalCaseCard` content
    - Test completed/inactive cases render collapsed (summary: title, date range, status badge)
    - Test clicking a collapsed case expands it to show full card content
  - [x] 2.2 Refactor PatientProfile "Casos Clínicos" section to iterate over all `clinicalCases[]`
    - Replace `clinicalCases.find(c => c.status === 'active')` with grouped iteration
    - Sort cases: active first, then completed, then inactive
    - Active cases render using existing `ClinicalCaseCard` component (no modifications to card)
    - All active cases render fully expanded if multiple exist
  - [x] 2.3 Create `CollapsedCaseRow` component for completed/inactive cases
    - Summary row: title, date range (startDate–endDate), status badge using `getStatusColor()`
    - Click handler toggles expanded state via local `useState` per case
    - When expanded, render full `ClinicalCaseCard` content
    - Inactive cases use muted styling (stone/gray tones)
    - Include chevron icon indicating expand/collapse state
  - [x] 2.4 Preserve existing navigation behavior
    - Each case card (expanded) remains clickable to navigate to `/pacientes/:id/casos/:caseId`
    - Use existing `onViewCase` callback
  - [x] 2.5 Ensure case list tests pass
    - Run ONLY the 4 tests written in 2.1
    - Verify grouping, expansion, and collapse behaviors
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4 tests written in 2.1 pass
- All clinical cases display grouped by status
- Active cases expanded, completed/inactive collapsed by default
- Collapsed rows show title, dates, status badge
- Click-to-expand works on collapsed cases
- Navigation to case detail preserved

#### Task Group 3: Case Creation Dialog & Confirmation

**Dependencies:** Task Group 1 (needs `useCreateCase` hook)

- [x] 3.0 Complete case creation dialog with confirmation prompt
  - [x] 3.1 Write 4 focused tests for case creation flow
    - Test "Nuevo Caso" button opens creation dialog
    - Test form validates title (required, 3-200 chars) and submits correctly
    - Test confirmation AlertDialog appears when active case already exists
    - Test direct submission (no confirmation) when no active case exists
  - [x] 3.2 Add "Nuevo Caso" button to "Casos Clínicos" section header
    - Place next to the `h2` "Casos Clínicos" header (PatientProfile line 326)
    - Style as secondary/outline button with Plus icon from lucide-react
    - Also add "Nuevo Caso" button inside the existing `EmptyState` component as a CTA
  - [x] 3.3 Create case creation `Dialog` in `PatientDetail.tsx`
    - Use Shadcn/UI Dialog matching `PatientForm` edit dialog pattern (lines 264-277)
    - Two fields: title (required, text input) and consultation reason (optional, textarea)
    - Client-side validation: title required, 3-200 characters
    - On submit: call `useCreateCase` mutation
    - On success: close dialog, toast shown by hook
    - On error: keep dialog open, toast shown by hook
    - Include `DialogTitle` and `DialogDescription` with `sr-only` for accessibility
  - [x] 3.4 Add confirmation AlertDialog for concurrent active cases
    - Before submit, check if `patient.clinicalCases` has any case with `status === 'active'`
    - If yes: show AlertDialog — "Este paciente ya tiene un caso activo. ¿Deseas crear uno nuevo?"
    - Follow `Ajustes.tsx` AlertDialog pattern (lines 73-102): AlertDialogHeader, Footer, Cancel, Action
    - If no active case: submit directly without confirmation
  - [x] 3.5 Ensure creation flow tests pass
    - Run ONLY the 4 tests written in 3.1
    - Verify dialog opens, validates, confirms, and submits
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4 tests written in 3.1 pass
- "Nuevo Caso" button visible in section header and empty state
- Dialog opens with title + consultation reason fields
- Client-side validation enforces title constraints
- Confirmation prompt shown only when active case exists
- Successful creation closes dialog and refreshes patient data

### Testing

#### Task Group 4: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 3 tests from data layer (Task 1.1)
    - Review the 4 tests from case list rendering (Task 2.1)
    - Review the 4 tests from case creation flow (Task 3.1)
    - Total existing tests: 11 tests
  - [x] 4.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows that lack coverage
    - Focus on integration between case creation and case list refresh
    - Do NOT assess entire application test coverage
  - [x] 4.3 Write up to 5 additional strategic tests if gaps found
    - Potential gaps: empty state renders correctly, multiple active cases all expand, cache invalidation refreshes list after creation
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases unless business-critical
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this feature (from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 11-16 tests
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 11-16 tests total)
- Critical user workflows covered: view all cases, create case, confirm concurrent case, collapse/expand
- No more than 5 additional tests added
- Testing focused exclusively on this feature's requirements

## Execution Order

Recommended implementation sequence:

1. **Task Groups 1 & 2 in parallel** — API/hook layer and case list rendering have no dependency on each other
2. **Task Group 3** — Case creation dialog depends on `useCreateCase` from Task Group 1
3. **Task Group 4** — Test review after all implementation complete

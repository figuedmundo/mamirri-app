# Task Breakdown: Biblioteca Search Hybrid Results

## Overview

Total Tasks: 4

## Task List

### API Layer

#### Task Group 1: Plan + Protocol Data Plumbing

**Dependencies:** None

- [x] 1.0 Complete API plumbing for plan protocols
  - [x] 1.1 Write 2-8 focused API tests
    - Extend existing tests in `apps/server/src/modules/library/library.service.spec.ts` for `addProtocolToPlan` + search behavior
    - Add focused tests in `apps/server/src/modules/patients/patients.service.spec.ts` to assert patient `findOne()` includes treatment plan protocol relations (after change)
    - Cover only critical cases: happy path + one key error case
  - [x] 1.2 Include plan protocols in patient fetch
    - Update `apps/server/src/modules/patients/patients.service.ts` `findOne()` to include `clinicalCases.treatmentPlan.protocols` with `protocol` details
    - Ensure payload includes `notes`, `addedAt`, and `protocol` core fields needed by UI
  - [x] 1.3 Confirm add-to-plan endpoint contract
    - Verify `POST /library/treatment-plans/:planId/protocols` behavior and errors remain stable (`201`, `404`, `409`)
    - Ensure response includes the joined `protocol` (already included by `include: { protocol: true }`)
  - [x] 1.4 Ensure API layer tests pass
    - Run ONLY the tests from 1.1 (do not run entire test suite)

**Acceptance Criteria:**

- Patient `GET /patients/:id` returns treatment plan protocols for each clinical case
- Existing library endpoints continue to return `{ protocols, ragResults }` for searches
- `POST /library/treatment-plans/:planId/protocols` works and errors match contract
- The 2-8 tests written in 1.1 pass

### Frontend Components

#### Task Group 2: Biblioteca Hybrid Results UI (Answers + Protocols)

**Dependencies:** Task Group 1

- [x] 2.0 Complete Biblioteca hybrid results UI
  - [x] 2.1 Write 2-8 focused UI tests
    - Update/add tests around `apps/client/src/components/library/LibraryDashboard.test.tsx`
    - Add a minimal test to assert Answers render when `searchResult.ragResults` is non-empty
    - Add a minimal test to assert protocol empty state does not hide Answers
  - [x] 2.2 Create an Answers component for `ragResults`
    - New component (recommended): `apps/client/src/components/library/AnswersPanel.tsx`
    - Render top 1-3 rag results with document title/author/page + snippet
    - Reuse UI patterns from `apps/client/src/components/patients/analysis/CitationsSection.tsx` (expand/collapse) and `apps/client/src/components/library/BibliographyPanel.tsx` (language toggle affordance)
  - [x] 2.3 Render Answers in the Biblioteca dashboard
    - Update `apps/client/src/components/library/LibraryDashboard.tsx` to render Answers when `searchResult` exists
    - Ensure UI labels distinguish `AI-assisted` answers vs `Protocolos sugeridos`
  - [x] 2.4 Improve search empty states
    - Keep `apps/client/src/components/library/ProtocolList.tsx` empty state
    - Add a non-blocking message in Answers area if `ragResults` is empty
  - [x] 2.5 Ensure UI tests pass
    - Run ONLY the tests from 2.1

**Acceptance Criteria:**

- Searching a simple term (e.g., "huesos") shows Answers when `ragResults` exist
- Protocol empty state does not hide Answers
- Biblioteca continues to work for category browsing and protocol modal
- The 2-8 tests written in 2.1 pass

#### Task Group 3: Add Protocol To Patient Plan UX

**Dependencies:** Task Groups 1-2

- [x] 3.0 Wire add-to-plan CTA + show attached protocols in patient case
  - [x] 3.1 Write 2-8 focused UI tests
    - Minimal test: "Add to plan" CTA visible only when Biblioteca has a plan context
    - Minimal test: patient case view renders attached protocols list when present
  - [x] 3.2 Add a way to open Biblioteca with plan context
    - Add navigation entry point from case view (recommended location: `apps/client/src/components/patients/CaseDetailLayout.tsx`)
    - Pass `planId` (and optional `caseId`) via route state or query param
  - [x] 3.3 Implement plan-context handling on Biblioteca page
    - Update `apps/client/src/pages/Biblioteca.tsx` (or LibraryDashboard props) to accept an optional `planId`
    - If no `planId`, disable/hide add-to-plan and show a short guidance message
  - [x] 3.4 Wire `useAddProtocolToPlan()` to a CTA
    - Use existing hook `apps/client/src/hooks/use-library.ts:50`
    - Place CTA in protocol detail view (recommended: `apps/client/src/components/library/ProtocolDetailModal.tsx`) and optionally in protocol cards
    - Support optional notes
  - [x] 3.5 Display attached protocols on the patient plan
    - Update patient types to include plan protocol relations (recommended: extend `apps/client/src/types/patient.ts` `TreatmentPlan`)
    - Render in an appropriate patient UI (recommended: `apps/client/src/components/patients/PatientProfile.tsx` or a dedicated small panel component)
  - [x] 3.6 Ensure UI tests pass
    - Run ONLY the tests from 3.1

**Acceptance Criteria:**

- From a patient case, therapist can open Biblioteca with plan context
- Therapist can add a protocol to the treatment plan (calls API, handles 409/404)
- Patient case view shows attached protocols (title + optional notes)
- The 2-8 tests written in 3.1 pass

### Testing

#### Task Group 4: Test Review & Gap Analysis (Feature-Only)

**Dependencies:** Task Groups 1-3

- [x] 4.0 Fill critical gaps only and verify feature workflows
  - [x] 4.1 Review tests added in 1.1, 2.1, 3.1
  - [x] 4.2 Add up to 10 additional strategic tests maximum (only if needed)
    - Focus on: add-to-plan happy path + conflict path + Answers rendering + patient plan display
  - [x] 4.3 Run feature-specific tests only
    - Run ONLY tests related to Biblioteca hybrid results and add-to-plan

**Acceptance Criteria:**

- All feature-specific tests pass
- Coverage includes: library search returns ragResults, UI renders Answers, add-to-plan works, plan displays attached protocols
- No more than 10 additional tests added in this group

## Execution Order

Recommended implementation sequence:

1. API Layer (Task Group 1)
2. Biblioteca UI (Task Group 2)
3. Add-to-plan UX (Task Group 3)
4. Test Review & Gap Analysis (Task Group 4)

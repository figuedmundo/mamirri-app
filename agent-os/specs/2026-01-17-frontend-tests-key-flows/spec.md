# Specification: Frontend Tests - Key User Flows

## Goal

Implement end-to-end (E2E) and integration tests for 4 key patient management flows using a TDD approach to ensure reliability and regression safety.

## User Stories

- As a developer, I want to run a single command to verify critical user journeys so that I can deploy with confidence.
- As a product owner, I want to ensure the "Create Patient" and "Record Session" flows work seamlessly because these are core value propositions.

## Specific Requirements

**Testing Strategy & Tooling**

- Use **Playwright** for E2E tests (needs installation/config).
- Use **Vitest + React Testing Library** for integration tests (already configured).
- Follow **TDD**: Write the test that simulates user behavior _before_ confirming/refining the logic.

**Flow 1: Create New Patient (E2E)**

- Navigate to `/patients/new`.
- Fill out `PatientForm` (Name, Age, Condition).
- Submit form.
- Verify redirect to `/patients/[id]` (Patient Profile).
- Verify "Patient Created" toast appears.

**Flow 2: Record Treatment Session (E2E/Integration)**

- Navigate to active Clinical Case.
- Click "New Session".
- Select "Phase" (e.g., Phase 1).
- Rate Pain Scale (0-10).
- Save Session.
- Verify session appears in `TreatmentTimeline`.

**Flow 3: Compare Posturogram (Integration)**

- Render `PosturogramViewer` within `CaseDetailLayout`.
- Verify presence of "Before" and "After" views.
- Interact with the comparison slider/toggle.
- Verify UI updates (images switch or overlay changes).

**Flow 4: View Patient Timeline (Integration)**

- Render `CaseDetailLayout` with a mock Clinical Case.
- Verify `TreatmentTimeline` renders correct number of phases.
- Click a specific session card.
- Verify `SessionDetailView` opens/updates with correct details.

## Visual Design

No visual assets provided. Tests should rely on:

- **Accessibility Roles:** `getByRole('button', { name: 'Save' })`
- **Text Content:** `getByText('Phase 1')`
- **Test IDs:** `data-testid` (only if semantic queries fail)

## Existing Code to Leverage

**`CaseDetailLayout.test.tsx`**

- Use as template for mocking `useParams` and `useNavigate`.
- Re-use the mock data factories found here.

**`CaseTimeline.test.tsx`**

- Reference assertions for timeline rendering logic.

**`EvaluationForm.tsx` & `PatientForm.tsx`**

- Inspect these components to identify accessible names/labels for form inputs.

## Out of Scope

- Backend API implementation (all tests will mock network requests or use a test database).
- Visual regression testing (pixel-perfect matching).
- Testing edge cases (network errors, offline mode) - focus on "Happy Path" first.

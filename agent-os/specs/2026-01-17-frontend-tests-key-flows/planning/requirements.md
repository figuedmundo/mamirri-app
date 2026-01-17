# Spec Requirements: Frontend Tests - Key User Flows

## Initial Description

Frontend tests: Key user flows (TDD approach) for Task 6.13 in Week 6: Pacientes — Evaluation & Timeline.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should focus on implementing these specific flows using TDD (writing tests first, then the integration logic): Flow 1 (Create New Patient), Flow 2 (Record Treatment Session), Flow 3 (Compare Posturogram), Flow 4 (View Patient Timeline). Is that correct?
**Answer:** Agree with the flows.

**Q2:** I assume we should write integration tests that render the page/container and simulate user interactions (clicks, inputs), mocking the backend API calls. Is this the preferred approach, or do you want E2E tests (Playwright)?
**Answer:** Yes, integration tests + E2E. We can use Playwright or chrome-devtools. Please assess which is better, and create a document explaining which one to use and how to install.

**Q3:** Since many UI components already exist, does "TDD approach" here mean wiring up the integration logic (state, API calls, navigation) by writing the test first?
**Answer:** TDD (make sure the logic of the flow is accurate).

**Q4:** If we can't do all 4 flows in this sprint, which one is the highest priority?
**Answer:** Organize the tests according to the flow, no need to rush priority, is better the flows are tested correctly.

### Existing Code to Reference

**Similar Features Identified:**

- `apps/client/src/components/patients/CaseDetailLayout.test.tsx` (Integration test example)
- `apps/client/src/components/patients/CaseTimeline.test.tsx`
- `apps/client/src/components/patients/PatientProfile.test.tsx`

### Follow-up Questions

**Follow-up 1:** For the "Assessment of Playwright vs Chrome DevTools", I will create a comparison document first. Do you have a preference for where this document should live? I propose `agent-os/specs/2026-01-17-frontend-tests-key-flows/planning/testing-strategy-assessment.md`.
**Answer:** (Implied: Proceed with assessment)

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Flow 1: Create New Patient** - Verify creation form validation, API submission, and navigation to profile.
- **Flow 2: Record Treatment Session** - Verify session form entry, pain scale interaction, and session creation.
- **Flow 3: Compare Posturogram** - Verify interactions with the comparison slider (Before/After).
- **Flow 4: View Patient Timeline** - Verify timeline rendering, phase grouping, and session selection.

### Reusability Opportunities

- Leverage existing Vitest setup for component integration tests.
- Reference `CaseDetailLayout.test.tsx` for mocking patterns.

### Scope Boundaries

**In Scope:**

- Assessment of Playwright vs Chrome DevTools for E2E.
- Implementation of E2E/Integration tests for the 4 identified flows.
- Adhering to TDD principles (Test First -> Implement/Refine).

**Out of Scope:**

- Backend API implementation (mocking APIs).
- Visual regression testing (unless part of selected E2E tool).

### Technical Considerations

- **Stack:** React 19, Vite, Vitest, React Testing Library.
- **E2E Decision:** Need to choose between Playwright and custom Chrome DevTools script. (Recommendation: Playwright is standard for E2E).
- **Mocking:** Use MSW or Vitest's `vi.mock` for API calls.

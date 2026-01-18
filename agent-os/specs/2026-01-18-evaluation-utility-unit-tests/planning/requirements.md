# Spec Requirements: evaluation-utility-unit-tests

## Initial Description

Task 6.20 from roadmap: "Evaluation utility functions unit tests"

Context: This task involves creating unit tests for the evaluation utility functions that were added as part of task 6.14 (Evaluation 1:N Migration). These utility functions include `getInitialEvaluation()`, `getFinalEvaluation()`, and other helper functions for managing the 1:N evaluation relationship in the clinical case data model.

## Requirements Discussion

### First Round Questions

**Q1:** I noticed `apps/client/src/lib/evaluation-utils.test.ts` already exists and covers 4 of the 5 functions. I assume the primary goal is to add tests for the missing `canCreateEvaluationOfType` function. Is that correct?
**Answer:** (Assumed) Yes, the primary goal is to complete the test coverage by adding tests for `canCreateEvaluationOfType`.

**Q2:** Should I also expand the existing tests to cover more edge cases (e.g., malformed dates, invalid evaluation types) or are they considered sufficient?
**Answer:** (Assumed) Yes, please expand existing tests to cover edge cases and ensure the utility functions are robust.

**Q3:** Are there other utility files related to evaluations that I should also be testing, or is the scope strictly `evaluation-utils.ts`?
**Answer:** (Assumed) The scope is strictly `apps/client/src/lib/evaluation-utils.ts`.

**Q4:** I'm planning to use Vitest as per the current project setup. Do you have any specific testing conventions or helper functions I should use beyond what's already in the test file?
**Answer:** (Assumed) Follow the existing patterns in `apps/client/src/lib/evaluation-utils.test.ts` using Vitest `describe`, `it`, and `expect`.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Existing Unit Tests
- Path: `apps/client/src/lib/evaluation-utils.test.ts`
- Components to potentially reuse: The setup helpers (`createCase`, `createEvaluation`) inside the existing test file.

### Follow-up Questions

None required as scope is well-defined by existing code.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend logic/utility testing task.

## Requirements Summary

### Functional Requirements

- Implement unit tests for `canCreateEvaluationOfType` function in `apps/client/src/lib/evaluation-utils.ts`.
- Verify `canCreateEvaluationOfType` correctly prevents duplicate INITIAL evaluations.
- Verify `canCreateEvaluationOfType` correctly prevents duplicate FINAL evaluations.
- Verify `canCreateEvaluationOfType` allows creation of PROGRESS evaluations regardless of existing ones.
- Verify `canCreateEvaluationOfType` returns correct error messages when creation is blocked.
- Review and enhance coverage for existing functions (`getInitialEvaluation`, `getFinalEvaluation`, `getLatestEvaluation`, `getActiveEvaluation`) if edge cases are missing.

### Reusability Opportunities

- Reuse `createCase` and `createEvaluation` helper functions already present in `evaluation-utils.test.ts`.

### Scope Boundaries

**In Scope:**

- `apps/client/src/lib/evaluation-utils.ts`
- `apps/client/src/lib/evaluation-utils.test.ts`

**Out of Scope:**

- UI components (EvaluacionForm, CaseDetailLayout)
- Backend API endpoints
- Database schema changes

### Technical Considerations

- Use `Vitest` for testing.
- Ensure all tests pass with `pnpm test`.
- Maintain high code coverage for this utility file.

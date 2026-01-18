# Specification: Evaluation Utility Unit Tests

## Goal

Implement comprehensive unit tests for the `canCreateEvaluationOfType` utility function and enhance edge-case coverage for existing evaluation helpers to ensure robust 1:N evaluation management.

## User Stories

- As a developer, I want to verify that `canCreateEvaluationOfType` correctly enforces business rules so that patients don't end up with duplicate Initial or Final evaluations.
- As a developer, I want to ensure all evaluation utility functions handle edge cases gracefully so that the application doesn't crash on unexpected data.

## Specific Requirements

**Test `canCreateEvaluationOfType`**

- Verify it returns `{ canCreate: true }` when no Initial evaluation exists and type is INITIAL.
- Verify it returns `{ canCreate: false, message: ... }` when an Initial evaluation already exists and type is INITIAL.
- Verify it returns `{ canCreate: true }` when no Final evaluation exists and type is FINAL.
- Verify it returns `{ canCreate: false, message: ... }` when a Final evaluation already exists and type is FINAL.
- Verify it returns `{ canCreate: true }` for PROGRESS type regardless of existing evaluations.
- Verify it handles empty/undefined evaluation arrays gracefully.

**Enhance Existing Tests**

- Verify `getInitialEvaluation` returns undefined for empty input.
- Verify `getFinalEvaluation` returns undefined for empty input.
- Verify `getLatestEvaluation` handles cases with identical dates correctly (stable sort or defined behavior).
- Verify `getActiveEvaluation` fallback logic works when only one evaluation exists.

## Visual Design

N/A - Logic only.

## Existing Code to Leverage

**`apps/client/src/lib/evaluation-utils.test.ts`**

- Use the existing `createCase` helper to generate mock `ClinicalCase` objects.
- Use the existing `createEvaluation` helper to generate mock `Evaluation` objects.
- Follow the existing `describe` / `it` / `expect` pattern using Vitest.

## Out of Scope

- Modifications to the actual `evaluation-utils.ts` logic (unless bugs are found).
- UI components (EvaluacionForm, etc.).
- Backend API tests.
- Database schema changes.

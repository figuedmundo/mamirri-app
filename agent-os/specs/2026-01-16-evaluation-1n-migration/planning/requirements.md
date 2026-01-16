# Spec Requirements: Evaluation 1:N Migration

## Initial Description

The frontend TypeScript types use a 1:1 relationship (`evaluation: Evaluation`) between `ClinicalCase` and `Evaluation`, but the Prisma database schema already supports 1:N (`evaluations: Evaluation[]`). This mismatch prevents proper handling of the doctor's clinical model which requires:

- **Evaluación Inicial**: Comprehensive baseline evaluation at treatment start
- **Evaluación Final**: Comprehensive evaluation after 15-session intervention
- **Evolución Kinésica**: Per-session progress tracking (already handled by `TreatmentSession`)

The frontend types must be updated to match the database schema and support multiple evaluations per clinical case.

## Requirements Discussion

### First Round Questions

**Q1:** Should we maintain backward compatibility with existing data that assumes a single evaluation per case?
**Answer:** Yes. Existing cases with a single evaluation should continue to work. The migration will treat the existing `evaluation` as the first item in an `evaluations` array.

**Q2:** How should the UI determine which evaluation to display/edit by default?
**Answer:** The UI should display the most recent evaluation by default, but provide a selector to switch between Initial/Progress/Final evaluations.

**Q3:** Should we add explicit helper functions to get initial/final evaluations from the array?
**Answer:** Yes. Add utility functions like `getInitialEvaluation(case)` and `getFinalEvaluation(case)` to simplify component logic.

**Q4:** The `ComparisonBoard` needs to compare Initial vs Final - should this be explicit props or derive from the array?
**Answer:** Derive from the array. The component should find evaluations with `type: 'INITIAL'` and `type: 'FINAL'` automatically.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: TreatmentSessions 1:N - Path: `apps/client/src/types/patient.ts` line 253
- Components using evaluation:
  - `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - `apps/client/src/components/patients/EvaluationForm.tsx`
  - `apps/client/src/components/patients/ComparisonBoard.tsx`
  - `apps/client/src/components/patients/PosturogramViewer.tsx`
- API layer: `apps/client/src/api/patients.ts`

### Follow-up Questions

**Follow-up 1:** Should the API response transformation happen in the API layer or in components?
**Answer:** In the API layer. The `patientsApi` should return properly typed data matching the new `evaluations: Evaluation[]` structure.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

- Update `ClinicalCase` interface to use `evaluations: Evaluation[]` instead of `evaluation: Evaluation`
- Add `type: 'INITIAL' | 'PROGRESS' | 'FINAL'` field to frontend `Evaluation` type (already in Prisma)
- Update all components that access `clinicalCase.evaluation` to use `clinicalCase.evaluations`
- Add utility functions for accessing specific evaluation types
- Update `ComparisonBoard` to derive Initial/Final from evaluations array
- Update `EvaluationForm` to support creating evaluations of different types
- Update API layer to properly map backend response to new frontend types

### Reusability Opportunities

- The pattern of accessing items by type from an array is already used for `treatmentSessions`
- Utility function pattern can mirror existing helpers in the codebase

### Scope Boundaries

**In Scope:**

- Frontend TypeScript type changes
- Component updates to use new types
- Utility functions for evaluation access
- API response mapping
- Unit test updates for affected components

**Out of Scope:**

- Database schema changes (already 1:N)
- Backend API changes (already returns array)
- New UI for evaluation type selection (separate spec)
- Recommendations feature (separate spec)

### Technical Considerations

- This is a breaking change for the frontend types
- All imports of `ClinicalCase` type will need component updates
- The change affects 4+ components that need coordinated updates
- Existing test mocks will need updates to provide `evaluations` array

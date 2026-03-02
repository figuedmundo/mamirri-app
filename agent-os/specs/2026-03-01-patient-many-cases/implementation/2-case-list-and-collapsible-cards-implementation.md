# Task Group 2 Implementation: Case List and Collapsible Cards

- Refactored `PatientProfile` to render all patient clinical cases instead of only one active case.
- Grouped rendering order is active -> completed -> inactive.
- Active cases render expanded using existing `ClinicalCaseCard`.
- Completed and inactive cases render as collapsed summary rows and expand on click.
- Added header `Nuevo Caso` button and empty-state `Nuevo Caso` call-to-action.
- Added focused UI tests in `apps/client/src/components/patients/PatientProfile.test.tsx`.

# Task Group 3 Implementation: Case Creation Dialog and Confirmation

- Added case creation flow in `PatientDetail` with a new dialog.
- Dialog fields: title (required, 3-200) and consultation reason (optional).
- Added active-case confirmation using `AlertDialog` before allowing concurrent active case creation.
- Connected UI to `useCreateCase` mutation and proper form reset/close behavior.
- Wired `onCreateCase` callback from `PatientDetail` into `PatientProfile`.
- Added focused flow tests in `apps/client/src/pages/PatientDetail.test.tsx`.

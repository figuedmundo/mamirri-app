# Task Group 1 Implementation: API Method and Hook

- Added `createCase` request DTO and `patientsApi.createCase()` in `apps/client/src/api/patients.ts`.
- Added `useCreateCase()` in `apps/client/src/hooks/use-patients.ts` with success/error toast handling.
- On success, invalidates `queryKeys.patients.lists()` and `queryKeys.patients.detail(patientId)`.
- Added focused tests in `apps/client/src/api/patients.test.ts` and `apps/client/src/hooks/use-patients.test.ts`.

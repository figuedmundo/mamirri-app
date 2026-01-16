# Implementation Report: PatientProfile Callback Wiring

## Overview

We have successfully implemented the callback handlers in `PatientProfile.tsx` to handle evaluation saving, posturogram changes, and pain scale updates. These handlers interact with the backend via `patientsApi` and provide user feedback using `useToast`.

## Changes

1.  **`apps/client/src/components/patients/PatientProfile.tsx`**:
    - Imported `patientsApi`, `useToast`, and necessary types.
    - Added `onRefresh` prop to trigger parent data refresh after updates.
    - Implemented `handleSaveEvaluation`: Updates the evaluation via API, shows toast, and refreshes data.
    - Implemented `handlePosturogramChange`: Updates the posturogram in the evaluation via API.
    - Implemented `handlePainScaleChange`: Updates the pain scale in the evaluation via API.
    - Wired `handleSaveEvaluation` to the "Nueva Evaluación" (renamed/repurposed label kept as is, but logic attached) Action Card.
    - Wired `handlePainScaleChange` to the "Nivel de Dolor" Metric Card (click to increment pain level for demo/testing).
    - Wired `handlePosturogramChange` to the "Índice Barthel" Metric Card (click to update dummy posturogram for demo/testing).

2.  **`apps/client/src/types/patient.ts`**:
    - Added `onRefresh?: () => void;` to `PatientProfileProps`.

3.  **`apps/client/src/pages/PatientDetail.tsx`**:
    - Passed `onRefresh={() => id && loadPatient(id)}` to `PatientProfile` to ensure UI updates after modifications.

4.  **`apps/client/src/components/patients/PatientProfile.test.tsx`**:
    - Created a new test file.
    - Mocked `patientsApi` and `useToast`.
    - Verified that clicking the wired elements triggers the correct API calls and toasts.

## Verification

- Ran `npm run test -- src/components/patients/PatientProfile.test.tsx` in `apps/client` directory.
- All 3 tests passed successfully.

## Next Steps

- When `EvaluationForm` is ready to be integrated into `PatientProfile` (or a modal), these handlers are ready to be passed as props (`onSave`, `onPosturogramChange`, `onPainScaleChange`).
- The temporary wiring to MetricCards can be removed once the actual UI controls are in place.

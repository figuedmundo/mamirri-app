# Task 1: CaseDetailLayout Callback Wiring

## Status: Completed

### Implementation Details

We have updated `CaseDetailLayout.tsx` to integrate the `EvaluationForm` and wire the necessary callbacks for data persistence.

#### 1. State Management

- Added `localCase` state to support optimistic UI updates.
- Added `viewMode` state (`'timeline' | 'evaluation'`) to toggle between the session timeline and the evaluation form.

#### 2. Callback Implementation

Implemented three key handlers that manage local state updates and API persistence:

- `handleSaveEvaluation`: Updates the full evaluation object.
- `handlePosturogramChange`: Updates specific posturogram data.
- `handlePainScaleChange`: Updates pain scale metrics.

All handlers follow this pattern:

1. Update `localCase` immediately (Optimistic UI).
2. Call `patientsApi.updateEvaluation` to persist data.
3. Show success/error toast notifications.

#### 3. UI Changes

- Added a toggle switch in the header:
  - **Seguimiento**: Shows the original Timeline + Session Details view.
  - **Evaluación**: Renders the `EvaluationForm` component.
- The `EvaluationForm` is passed the new callbacks, ensuring edits are saved correctly.

### Testing

- Updated `CaseDetailLayout.test.tsx` with:
  - Mocks for `patientsApi`, `useToast`, and `EvaluationForm`.
  - Tests for view mode switching.
  - Tests verifying that `handleSaveEvaluation`, `handlePosturogramChange`, and `handlePainScaleChange` correctly call the API with the expected payloads.
- All 39 tests passed.

### Files Modified

- `apps/client/src/components/patients/CaseDetailLayout.tsx`
- `apps/client/src/components/patients/CaseDetailLayout.test.tsx`

# Implementation: Pain Chart Real-time Updates

## Context

We are implementing Task Group 5: Pain Chart Real-time Updates.
The goal is to ensure `EvaluationForm` updates propagate to `CaseDetailLayout` and then to children (specifically `Cronograma` / `PainTrendChart`).

Current state:

- `CaseDetailLayout` uses `CaseTimeline` (not `Cronograma` yet).
- `EvaluationForm` allows editing pain scale.
- `handlePainScaleChange` is implemented in `CaseDetailLayout`.

## Plan

1.  **Verify Data Flow**:
    - `EvaluationForm` calls `onPainScaleChange`.
    - `CaseDetailLayout` updates `localCase` state.
    - `localCase` is passed to children.

2.  **Test Implementation**:
    - Modify `CaseDetailLayout.test.tsx` to verify this flow.
    - Since `CaseTimeline` doesn't display pain scale, we will mock it to verify it receives updated props.
    - This ensures that when `Cronograma` is integrated (Task 4/6), it will receive the correct data.

## Files to Modify

- `apps/client/src/components/patients/CaseDetailLayout.test.tsx`
  - Mock `CaseTimeline` to spy on props.
  - Add test case: `should update clinicalCase and pass to children when pain scale changes`.

- `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - (Already implemented, just verification).

## Implementation Details

We verified `CaseDetailLayout.tsx` has `handlePainScaleChange` which calls `setLocalCase`.
We verified `EvaluationForm` calls `onPainScaleChange`.
We will add a test to prove the loop is closed.

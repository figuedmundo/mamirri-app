# Spec Requirements: Wire Session Callbacks

## Initial Description

Roadmap Task 6.10: Wire callbacks: onAddSession, onEditSession, onViewSession

Wire session management callbacks from TreatmentTimeline component to CaseDetailLayout parent, enabling proper state synchronization when sessions are created, updated, deleted, or viewed.

## Requirements Discussion

### First Round Questions

**Q1:** I notice `TreatmentTimeline` already has callback props (`onSessionCreated`, `onSessionUpdated`, `onSessionDeleted`, `onViewSession`) but `CaseDetailLayout` only receives `onAddSession` and `onEditSession`. Should the session callbacks follow the same naming pattern as evaluation callbacks or simpler names?

**Answer:** Use `TreatmentTimeline`'s existing names (`onSessionCreated`, `onSessionUpdated`, `onSessionDeleted`, `onViewSession`). Past-tense naming is more accurate since callbacks fire after the action completes. `CaseDetailLayout` should adopt `TreatmentTimeline`'s interface.

**Q2:** `TreatmentTimeline` already has internal session CRUD that calls `patientsApi` directly. However, `CaseDetailLayout` uses `CaseTimeline` (older component) not `TreatmentTimeline`. Should this task replace `CaseTimeline` with `TreatmentTimeline`?

**Answer:** Yes, Option A — Replace `CaseTimeline` with `TreatmentTimeline` in `CaseDetailLayout`. `TreatmentTimeline` (task 6.2) was built specifically for session management with SessionForm modal, delete confirmation, PhaseProgress, PainTrendChart, and SessionStatsSummary. Wiring callbacks to `CaseTimeline` would duplicate work.

**Q3:** Should the parent (`CaseDetailLayout`) update its `localCase` state when sessions change, so other components re-render with updated data?

**Answer:** Yes. This matches the pattern from task 6.9 (evaluation callbacks). Parent manages `localCase` state, children trigger updates via callbacks, React re-renders all children with fresh data.

**Q4:** `onViewSession` currently passes just `sessionId`. What should it do?

**Answer:** Option A — Set `activeSessionId` in `CaseDetailLayout`. The component already manages this state and displays session details based on it. No modal or navigation needed.

**Q5:** Is there anything that should be excluded from this task?

**Answer:** Exclude:

- Voice dictation callbacks (Week 7, task 7.6)
- Media capture callbacks (Week 7, task 7.6)
- New API endpoints (existing ones suffice)
- TreatmentTimeline UI changes (already complete from task 6.2)
- onSchedule callback (already done in task 5.11)
- Export functionality (task 6.11, separate scope)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Evaluation Callbacks - Path: `apps/client/src/components/patients/CaseDetailLayout.tsx` lines 73-135
  - Pattern: `handleSaveEvaluation`, `handlePosturogramChange`, `handlePainScaleChange`
  - Shows optimistic state update with API call and toast notification
- Feature: Session CRUD in TreatmentTimeline - Path: `apps/client/src/components/patients/TreatmentTimeline.tsx` lines 83-138
  - Pattern: `handleFormSubmit`, `handleConfirmDelete` with API + parent callback
  - Already implements toast notifications and loading states

- Feature: Toast Hook - Path: `apps/client/src/hooks/use-toast.ts`
  - Used throughout for success/error notifications

- Feature: Session Types - Path: `apps/client/src/types/patient.ts`
  - `TreatmentSession` interface for type safety

### Follow-up Questions

None required - all questions answered with agreed recommendations.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a callback wiring task with no UI changes.

## Requirements Summary

### Functional Requirements

1. **Update CaseDetailLayout Interface**
   - Remove: `onAddSession?: () => void`, `onEditSession?: (sessionId: string) => void`
   - Add: `onSessionCreated?: (session: TreatmentSession) => void`
   - Add: `onSessionUpdated?: (session: TreatmentSession) => void`
   - Add: `onSessionDeleted?: (sessionId: string) => void`
   - Keep using internal `activeSessionId` state for view session

2. **Implement Callback Handlers in CaseDetailLayout**
   - `handleSessionCreated`: Add new session to `localCase.treatmentSessions` array
   - `handleSessionUpdated`: Update matching session in `localCase.treatmentSessions`
   - `handleSessionDeleted`: Remove session from `localCase.treatmentSessions`
   - View session: Set `activeSessionId` state (already exists)

3. **Replace CaseTimeline with TreatmentTimeline**
   - Remove `CaseTimeline` import and usage from `CaseDetailLayout`
   - Import and use `TreatmentTimeline` component
   - Pass `localCase` as `clinicalCase` prop
   - Wire all four callbacks to handlers
   - Remove "Nueva Sesión" button from header (TreatmentTimeline has its own)

4. **State Synchronization**
   - Parent `localCase` state updates trigger re-renders
   - Session detail view reflects changes immediately
   - Any pain/progress charts update with new session data

### Reusability Opportunities

- Reuse evaluation callback pattern from `CaseDetailLayout` lines 73-135
- Reuse `TreatmentTimeline` component as-is (no modifications needed)
- Reuse existing `patientsApi` session methods
- Reuse `useToast` pattern (already in TreatmentTimeline)

### Scope Boundaries

**In Scope:**

- Wire `onSessionCreated`, `onSessionUpdated`, `onSessionDeleted`, `onViewSession` callbacks
- Replace `CaseTimeline` with `TreatmentTimeline` in `CaseDetailLayout`
- Implement parent state update handlers
- Remove duplicate "Nueva Sesión" button from header
- Verify state synchronization works correctly

**Out of Scope:**

- Voice dictation callbacks (`onVoiceDictation`) - Week 7
- Media capture callbacks (`onCaptureFootprint`, `onCaptureVideo`) - Week 7
- New API endpoints - use existing session CRUD
- TreatmentTimeline UI/UX changes - already complete
- Export functionality (`onExport`) - task 6.11
- Schedule callback (`onSchedule`) - task 5.11, already done
- CaseTimeline component removal from codebase - keep for potential other uses

### Technical Considerations

- `TreatmentTimeline` already handles API calls internally, just needs parent state sync
- `CaseDetailLayout` manages `localCase` state - callbacks update this state
- `activeSessionId` state already exists for session selection
- No new dependencies required
- Type safety via existing `TreatmentSession` type from `types/patient.ts`
- Follow optimistic update pattern from evaluation callbacks

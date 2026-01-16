# Specification: Wire Session Callbacks

## Goal

Wire session management callbacks (`onSessionCreated`, `onSessionUpdated`, `onSessionDeleted`, `onViewSession`) from TreatmentTimeline to CaseDetailLayout, replacing CaseTimeline and enabling parent state synchronization when sessions change.

## User Stories

- As a physiotherapist, I want session changes to immediately update the case view so that I see accurate data without refreshing.
- As a physiotherapist, I want to click a session in the timeline and see its details in the main content area.

## Specific Requirements

**Replace CaseTimeline with TreatmentTimeline**

- Remove `CaseTimeline` import and JSX usage from `CaseDetailLayout`
- Import `TreatmentTimeline` from `./TreatmentTimeline`
- Pass `localCase` as `clinicalCase` prop to `TreatmentTimeline`
- Remove duplicate "Nueva Sesión" button from header (TreatmentTimeline has its own)
- Adjust layout: TreatmentTimeline replaces the left sidebar timeline section

**Update CaseDetailLayout Props Interface**

- Remove: `onAddSession?: () => void` prop
- Remove: `onEditSession?: (sessionId: string) => void` prop
- These callbacks are now handled internally via state updates
- Keep `onBack` prop for navigation

**Implement handleSessionCreated Handler**

- Create handler function that receives `TreatmentSession` parameter
- Use `setLocalCase` to add new session to `treatmentSessions` array
- Set `activeSessionId` to the new session's ID to display it immediately
- Pattern: `setLocalCase(prev => ({ ...prev, treatmentSessions: [...prev.treatmentSessions, session] }))`

**Implement handleSessionUpdated Handler**

- Create handler function that receives updated `TreatmentSession` parameter
- Use `setLocalCase` to replace matching session in `treatmentSessions` array
- Match by session ID, preserve array order
- Pattern: `setLocalCase(prev => ({ ...prev, treatmentSessions: prev.treatmentSessions.map(s => s.id === session.id ? session : s) }))`

**Implement handleSessionDeleted Handler**

- Create handler function that receives `sessionId` string parameter
- Use `setLocalCase` to filter out deleted session from `treatmentSessions` array
- If deleted session was `activeSessionId`, reset to latest remaining session or undefined
- Pattern: `setLocalCase(prev => ({ ...prev, treatmentSessions: prev.treatmentSessions.filter(s => s.id !== sessionId) }))`

**Wire onViewSession Callback**

- Pass `onViewSession` prop to TreatmentTimeline
- Handler sets `activeSessionId` state to the selected session ID
- Existing session detail view already renders based on `activeSessionId`
- No new UI needed — reuse existing session detail display logic

**State Synchronization**

- All session callbacks update `localCase` state in parent
- React re-renders session detail view, pain charts, and session count automatically
- TreatmentTimeline handles API calls and toasts internally — parent only manages state
- Follow same optimistic update pattern as evaluation callbacks (lines 73-135)

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**apps/client/src/components/patients/CaseDetailLayout.tsx**

- Lines 41-49: `localCase` state management with `useState` and `useEffect` sync
- Lines 73-95: `handleSaveEvaluation` pattern — optimistic update with `setLocalCase`
- Lines 97-135: `handlePosturogramChange` and `handlePainScaleChange` patterns
- Replicate this pattern for session callbacks

**apps/client/src/components/patients/TreatmentTimeline.tsx**

- Lines 24-30: Props interface with all four callback types already defined
- Lines 83-115: `handleFormSubmit` — calls API, shows toast, invokes parent callback
- Lines 117-138: `handleConfirmDelete` — calls API, shows toast, invokes parent callback
- Component is ready to use, no modifications needed

**apps/client/src/components/patients/CaseTimeline.tsx**

- Reference for what to replace — simpler view-only timeline
- Note `onSelectSession` prop for active session selection pattern
- Keep file in codebase (may be used elsewhere), just remove from CaseDetailLayout

**apps/client/src/types/patient.ts**

- `TreatmentSession` interface for type safety on callback parameters
- `ClinicalCase` interface with `treatmentSessions: TreatmentSession[]` array

## Out of Scope

- Voice dictation callbacks (`onVoiceDictation`) — Week 7, task 7.6
- Media capture callbacks (`onCaptureFootprint`, `onCaptureVideo`) — Week 7, task 7.6
- New API endpoints — use existing `patientsApi.addSession/updateSession/deleteSession`
- TreatmentTimeline UI/UX changes — already complete from task 6.2
- Export functionality (`onExport`) — task 6.11
- Schedule callback (`onSchedule`) — task 5.11, already done
- Deleting CaseTimeline.tsx from codebase — keep for potential other uses
- New toast notifications — TreatmentTimeline already handles toasts internally
- Backend changes — existing session endpoints are sufficient
- Test file updates — separate task if needed

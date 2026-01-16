# Task Breakdown: Wire Session Callbacks

## Overview

Total Tasks: 8
Estimated Effort: Small (single component modification)

**Feature Summary:** Wire session callbacks from TreatmentTimeline to CaseDetailLayout, replacing CaseTimeline and enabling parent state synchronization when sessions are created, updated, deleted, or viewed.

## Task List

### Frontend Component Updates

#### Task Group 1: CaseDetailLayout Callback Wiring

**Dependencies:** None (TreatmentTimeline already complete from task 6.2)

- [x] 1.0 Complete session callback wiring in CaseDetailLayout
  - [x] 1.1 Update imports and props interface
    - Remove `CaseTimeline` import
    - Add `TreatmentTimeline` import from `./TreatmentTimeline`
    - Add `TreatmentSession` type import from `../../types/patient`
    - Remove `onAddSession` and `onEditSession` from props interface
    - Keep `onBack` prop
  - [x] 1.2 Implement `handleSessionCreated` handler
    - Receives `TreatmentSession` parameter
    - Add session to `localCase.treatmentSessions` array via `setLocalCase`
    - Set `activeSessionId` to new session ID
    - Pattern: `setLocalCase(prev => ({ ...prev, treatmentSessions: [...prev.treatmentSessions, session] }))`
  - [x] 1.3 Implement `handleSessionUpdated` handler
    - Receives updated `TreatmentSession` parameter
    - Replace matching session in array by ID
    - Pattern: `setLocalCase(prev => ({ ...prev, treatmentSessions: prev.treatmentSessions.map(s => s.id === session.id ? session : s) }))`
  - [x] 1.4 Implement `handleSessionDeleted` handler
    - Receives `sessionId` string parameter
    - Filter out deleted session from array
    - If deleted was `activeSessionId`, reset to latest remaining or undefined
    - Pattern: `setLocalCase(prev => ({ ...prev, treatmentSessions: prev.treatmentSessions.filter(s => s.id !== sessionId) }))`
  - [x] 1.5 Replace CaseTimeline with TreatmentTimeline in JSX
    - Remove `<CaseTimeline>` usage
    - Add `<TreatmentTimeline>` with props:
      - `clinicalCase={localCase}`
      - `onSessionCreated={handleSessionCreated}`
      - `onSessionUpdated={handleSessionUpdated}`
      - `onSessionDeleted={handleSessionDeleted}`
      - `onViewSession={(id) => setActiveSessionId(id)}`
  - [x] 1.6 Remove duplicate "Nueva Sesión" button from header
    - Remove button JSX that uses `onAddSession` prop
    - TreatmentTimeline has its own "Nueva Sesión" button
  - [x] 1.7 Verify with lsp_diagnostics
    - Run diagnostics on CaseDetailLayout.tsx
    - Ensure no TypeScript errors
    - Verify all imports resolve correctly

**Acceptance Criteria:**

- CaseDetailLayout uses TreatmentTimeline instead of CaseTimeline
- All four callbacks (created, updated, deleted, view) are wired
- Session CRUD operations update `localCase` state
- Session detail view updates when `activeSessionId` changes
- No duplicate "Nueva Sesión" buttons
- No TypeScript errors

#### Task Group 2: Verification & Cleanup

**Dependencies:** Task Group 1

- [x] 2.0 Verify integration works correctly
  - [x] 2.1 Manual verification checklist
    - Creating a session adds it to the list and displays it
    - Updating a session reflects changes immediately
    - Deleting a session removes it from list
    - Clicking a session card displays its details
    - Session count updates correctly
  - [x] 2.2 Run existing tests
    - Run `CaseDetailLayout.test.tsx` tests
    - Run `TreatmentTimeline` tests (PhaseProgress, PainTrendChart)
    - Verify no regressions in existing functionality
  - [x] 2.3 Clean up unused props and references
    - Remove any dead code related to old `onAddSession`/`onEditSession` props
    - Verify no components pass these obsolete props to CaseDetailLayout

**Acceptance Criteria:**

- Session CRUD flows work end-to-end
- Existing tests pass
- No unused code or props remain

## Execution Order

Recommended implementation sequence:

1. **Task Group 1**: CaseDetailLayout Callback Wiring (main work)
2. **Task Group 2**: Verification & Cleanup

## Files to Modify

| File                                                       | Action | Priority |
| ---------------------------------------------------------- | ------ | -------- |
| `apps/client/src/components/patients/CaseDetailLayout.tsx` | Modify | P0       |

## Files to Reference (Read Only)

| File                                                        | Purpose                     |
| ----------------------------------------------------------- | --------------------------- |
| `apps/client/src/components/patients/TreatmentTimeline.tsx` | Callback interface to match |
| `apps/client/src/components/patients/CaseTimeline.tsx`      | Component being replaced    |
| `apps/client/src/types/patient.ts`                          | TreatmentSession type       |

## Notes

- **No TreatmentTimeline changes needed** — component already has all callback props defined
- **No API changes needed** — TreatmentTimeline handles API calls internally
- **No new tests needed** — existing CaseDetailLayout and TreatmentTimeline tests cover functionality
- **CaseTimeline.tsx stays in codebase** — may be used elsewhere, just removed from CaseDetailLayout

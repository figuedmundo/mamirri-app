# Task Breakdown: Optimize Voice Recording Flow

## Overview

Total Tasks: 12

## Task List

### Frontend Logic

#### Task Group 1: Hook Extraction

**Dependencies:** None

- [x] 1.0 Extract recording logic to custom hook
  - [x] 1.1 Write 2-4 focused tests for `useVoiceRecorder` hook
    - Test start/stop functionality
    - Test permission error handling
    - Test duration timer
  - [x] 1.2 Implement `useVoiceRecorder` hook
    - Extract state management (idle, recording, paused) from VoiceRecorder.tsx
    - Extract MediaRecorder logic and blob handling
    - Implement `autoStart` logic within the hook
    - Handle permission errors and expose them
  - [x] 1.3 Refactor `VoiceRecorder.tsx` to use `useVoiceRecorder`
    - Replace internal logic with hook usage
    - Ensure backward compatibility for existing usages (EvaluationForm, etc.)
  - [x] 1.4 Ensure hook tests pass
    - Run ONLY the tests written in 1.1

**Acceptance Criteria:**

- `useVoiceRecorder` hook handles all recording logic correctly
- Existing `VoiceRecorder` component continues to work as before
- Tests pass for hook functionality

### Frontend UI

#### Task Group 2: Non-Blocking UI Implementation

**Dependencies:** Task Group 1

- [x] 2.0 Implement Dynamic Action Sheet
  - [x] 2.1 Write 2-4 focused tests for `RecordingFloatingBar`
    - Test rendering when active
    - Test "Stop" button triggers callback
    - Test duration display updates
  - [x] 2.2 Create `RecordingFloatingBar` component
    - Fixed position (bottom-0)
    - Pulsing visual indicator
    - Large tap target for "Stop"
    - Cancel button
  - [x] 2.3 Integrate `RecordingFloatingBar` into `PatientProfile` / `CaseDetailLayout`
    - Add state to track visibility
    - Connect to `useVoiceRecorder` hook
  - [x] 2.4 Ensure UI component tests pass
    - Run ONLY the tests written in 2.1

**Acceptance Criteria:**

- `RecordingFloatingBar` appears only when recording
- "Stop" button works and is easily tappable
- UI does not block the rest of the page (allows scrolling)

### Integration & UX

#### Task Group 3: One-Tap Flow & Auto-Save

**Dependencies:** Task Group 2

- [x] 3.0 Wire up Zero-Friction Flow
  - [x] 3.1 Write 2-4 focused integration tests for the full flow
    - Test clicking "Dictar Nota" starts recording immediately
    - Test stopping recording triggers save callback
  - [x] 3.2 Update "Dictar Nota" button handler
    - Remove Dialog/Modal trigger
    - Call `startRecording` from hook immediately
    - Handle permission errors with Toast
  - [x] 3.3 Implement Auto-Save Logic
    - Create handler for `onStop` that immediately triggers transcription/save
    - Remove "Review/Confirm" step from this specific flow
    - Show "Note Saved" toast with Undo option (UI only for now)
  - [x] 3.4 Ensure integration tests pass
    - Run ONLY the tests written in 3.1

**Acceptance Criteria:**

- Clicking "Dictar Nota" starts recording instantly
- Stopping recording saves instantly without confirmation dialog
- Permission errors are shown as toasts

### Testing

#### Task Group 4: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review and finalize testing
  - [x] 4.1 Review tests from Task Groups 1-3
  - [x] 4.2 Analyze test coverage gaps for the new flow
    - Check if error states are covered
    - Check if "Undo" toast interaction is covered (if implemented)
  - [x] 4.3 Write up to 4 additional strategic tests if needed
    - Focus on the integration between `PatientProfile` and `RecordingFloatingBar`
  - [x] 4.4 Run feature-specific tests only
    - Verify the entire "Zero Friction" flow works end-to-end

**Acceptance Criteria:**

- All new components and hooks are tested
- Critical "Zero Friction" path is verified
- No regression in existing VoiceRecorder usages

## Execution Order

1. Frontend Logic (Task Group 1)
2. Frontend UI (Task Group 2)
3. Integration & UX (Task Group 3)
4. Testing (Task Group 4)

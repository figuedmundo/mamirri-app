# Task Breakdown: Voice Recorder Transcription Integration

## Overview

Total Tasks: 16 (across 4 task groups)

**Note:** This is a frontend-only integration task. Backend transcription service and API endpoints already exist and are complete (Roadmap Task 7.4). No database migrations or new API endpoints required.

## Task List

### API Client Layer

#### Task Group 1: Voice Note Upload Methods

**Dependencies:** None (backend endpoints already exist)

- [x] 1.0 Complete API client voice note methods
  - [x] 1.1 Update VoiceNote interface in `types/patient.ts`
    - Add `transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed'`
    - Add optional `transcriptionError?: string` field
    - Keep existing fields: `id`, `type`, `date`, `audioUrl`, `transcription`, `durationSeconds`
  - [x] 1.2 Add `uploadEvaluationVoiceNote` to `media.ts`
    - Parameters: `evaluationId: string`, `audioBlob: Blob`, `durationSeconds: number`
    - Follow `uploadFootprint` FormData pattern
    - Endpoint: `POST /media/evaluations/:evaluationId/voice-notes`
    - Return: `VoiceNote` with transcription status
  - [x] 1.3 Add `uploadSessionVoiceNote` to `media.ts`
    - Parameters: `sessionId: string`, `audioBlob: Blob`, `durationSeconds: number`
    - Follow `uploadSessionPhoto` FormData pattern
    - Endpoint: `POST /media/sessions/:sessionId/voice-notes`
    - Return: `VoiceNote` with transcription status
  - [x] 1.4 Add `getVoiceNoteStatus` method to `media.ts`
    - Parameters: `entityType: 'evaluation' | 'session'`, `entityId: string`, `voiceNoteId: string`
    - Used by polling hook to check transcription status
    - Return: `VoiceNote` with current status

**Acceptance Criteria:**

- All media API methods compile without TypeScript errors
- VoiceNote interface includes transcription status fields
- Methods follow existing patterns in media.ts

---

### Hooks & Utilities

#### Task Group 2: Transcription Polling Hook

**Dependencies:** Task Group 1

- [x] 2.0 Complete transcription polling hook
  - [x] 2.1 Write 4-6 focused tests for `useTranscriptionPolling`
    - Test: polling starts when voiceNoteId provided
    - Test: polling stops when status is 'completed'
    - Test: polling stops when status is 'failed'
    - Test: polling stops after max attempts (10)
    - Test: cleanup on unmount
    - Test: retry function resets polling
  - [x] 2.2 Create `useTranscriptionPolling` hook
    - File: `apps/client/src/hooks/use-transcription-polling.ts`
    - Parameters: `voiceNoteId: string | null`, `entityType: 'evaluation' | 'session'`, `entityId: string`
    - Poll interval: 3 seconds
    - Max attempts: 10 (30 seconds total)
    - Return: `{ transcription, status, error, isPolling, retry }`
  - [x] 2.3 Implement polling logic with cleanup
    - Use `useRef` for interval ID (follow `useDebounce` pattern)
    - Clear interval on unmount via `useEffect` return
    - Stop polling when status is terminal ('completed' | 'failed')
    - Increment attempt counter, stop at max
  - [x] 2.4 Ensure hook tests pass
    - Run tests for `use-transcription-polling.test.ts`
    - Verify all 4-6 tests pass

**Acceptance Criteria:**

- Hook polls at correct interval
- Polling stops on completion, failure, or max attempts
- Cleanup prevents memory leaks
- Tests pass

---

### UI Components

#### Task Group 3: TranscriptionDisplay Component

**Dependencies:** Task Group 2

- [x] 3.0 Complete TranscriptionDisplay component
  - [x] 3.1 Write 4-6 focused tests for TranscriptionDisplay
    - Test: renders spinner during 'uploading' status
    - Test: renders spinner + "Transcribiendo..." during 'pending'/'processing'
    - Test: renders transcription text + audio player when 'completed'
    - Test: renders error message + retry button when 'failed'
    - Test: "Volver a grabar" button calls onRerecord callback
  - [x] 3.2 Create TranscriptionDisplay component
    - File: `apps/client/src/components/patients/TranscriptionDisplay.tsx`
    - Props: `status`, `transcription`, `audioUrl`, `error`, `onRetry`, `onRerecord`
    - Read-only display (no editing)
  - [x] 3.3 Implement all display states
    - Uploading: Spinner + "Subiendo nota de voz..."
    - Pending/Processing: Spinner + "Transcribiendo..."
    - Completed: Transcription text in styled container + `<audio>` player
    - Failed: Audio player + error message + "Reintentar" button
  - [x] 3.4 Apply styling matching existing patterns
    - Use teal/slate color scheme from VoiceRecorder
    - Teal success backgrounds for completed state
    - Rose/red for error states
    - Use Lucide icons (Loader2 for spinner)
  - [x] 3.5 Ensure component tests pass
    - Run tests for `TranscriptionDisplay.test.tsx`
    - Verify all 4-6 tests pass

**Acceptance Criteria:**

- All states render correctly
- Audio playback works in completed state
- Callbacks fire correctly
- Styling matches existing components
- Tests pass

---

### Form Integration

#### Task Group 4: EvaluationForm & SessionForm Integration

**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete form integrations
  - [x] 4.1 Integrate voice upload in EvaluationForm
    - Replace `handleRecordingComplete` to call `uploadEvaluationVoiceNote`
    - Add state: `voiceNoteId`, `uploadStatus`
    - Track recording duration from VoiceRecorder
    - Show toast on upload error
  - [x] 4.2 Add polling and display to EvaluationForm
    - Use `useTranscriptionPolling` with uploaded voice note ID
    - Replace placeholder div with `TranscriptionDisplay` component
    - Pass retry and rerecord callbacks
    - Reset state on "Volver a grabar"
  - [x] 4.3 Add VoiceRecorder to SessionForm
    - Import VoiceRecorder component
    - Add between "Observaciones" textarea and photo capture section
    - Add state: `audioBlob`, `voiceNoteId`, `uploadStatus`
  - [x] 4.4 Integrate voice upload in SessionForm
    - On recording complete, call `uploadSessionVoiceNote`
    - Use `useTranscriptionPolling` for status
    - Add `TranscriptionDisplay` below VoiceRecorder
    - Include voice note data in form submission
  - [x] 4.5 Add error handling with toasts
    - Toast on upload failure in both forms
    - Toast on network timeout
    - Use existing `useToast` hook pattern
  - [x] 4.6 Manual integration verification
    - Test EvaluationForm: record → upload → see transcription
    - Test SessionForm: record → upload → see transcription
    - Test error states: disconnect network, verify graceful degradation
    - Test re-record flow in both forms

**Acceptance Criteria:**

- Voice recording uploads successfully in both forms
- Transcription appears after processing completes
- Error states handled gracefully with toasts
- Re-record flow resets state correctly
- Form submission includes voice note data

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: API Client Layer** - Types and upload methods (no dependencies)
2. **Task Group 2: Hooks & Utilities** - Polling hook (depends on API methods)
3. **Task Group 3: UI Components** - TranscriptionDisplay (depends on hook for testing)
4. **Task Group 4: Form Integration** - Wire everything together (depends on all above)

## Estimated Effort

| Task Group              | Estimated Time               |
| ----------------------- | ---------------------------- |
| 1. API Client           | 1-2 hours                    |
| 2. Polling Hook         | 2-3 hours                    |
| 3. TranscriptionDisplay | 2-3 hours                    |
| 4. Form Integration     | 3-4 hours                    |
| **Total**               | **8-12 hours** (~1-1.5 days) |

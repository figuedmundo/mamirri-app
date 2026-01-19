# Specification: Voice Recorder Transcription Integration

## Goal

Complete the "last mile" integration between the existing VoiceRecorder component and backend transcription service, enabling therapists to record voice notes that are automatically transcribed and displayed in clinical forms.

## User Stories

- As a physiotherapist, I want to record a voice note during an evaluation and see the transcription appear automatically so that I can document clinical findings without typing.
- As a physiotherapist, I want to record voice notes during treatment sessions so that I can capture observations hands-free while working with patients.

## Specific Requirements

**API Client Voice Note Upload**

- Add `uploadEvaluationVoiceNote(evaluationId, audioBlob, durationSeconds)` to `media.ts`
- Add `uploadSessionVoiceNote(sessionId, audioBlob, durationSeconds)` to `media.ts`
- Follow existing `uploadFootprint` and `uploadSessionPhoto` patterns for FormData construction
- Return the created `VoiceNote` object with `id`, `audioUrl`, `transcriptionStatus`

**Transcription Polling Hook**

- Create `useTranscriptionPolling` hook in `apps/client/src/hooks/`
- Poll backend every 3 seconds, maximum 10 attempts (30 seconds total)
- Accept `voiceNoteId` and `entityType` ('evaluation' | 'session') as parameters
- Return `{ transcription, status, error, retry }` state object
- Clean up interval on unmount or when polling completes

**TranscriptionDisplay Component**

- Create read-only component showing transcription text and audio playback
- States: uploading (spinner), pending (spinner + "Transcribiendo..."), completed (text + audio), failed (audio + error + retry button)
- Include "Volver a grabar" button that resets to idle state
- Use existing teal/slate color scheme matching VoiceRecorder styling
- Single responsibility: display only, no recording logic

**EvaluationForm Integration**

- On `handleRecordingComplete`, upload audio via `uploadEvaluationVoiceNote`
- Start polling for transcription status after successful upload
- Replace placeholder message with TranscriptionDisplay component
- Show toast notification on upload or transcription failure
- Store voice note ID in form state for persistence

**SessionForm Integration**

- Add VoiceRecorder component to SessionForm (currently missing)
- Place between "Observaciones" textarea and photo capture section
- Wire same upload → poll → display flow as EvaluationForm
- Include voice notes array in form submission data

**Error Handling**

- Upload failure: toast notification + keep blob in memory + retry button
- Transcription failure: show audio player + error message + "Reintentar" button
- Network timeout: graceful degradation, allow proceeding without transcription
- Use existing `useToast` hook for all error notifications

**VoiceNote Type Update**

- Update `VoiceNote` interface in `types/patient.ts` to include `transcriptionStatus`
- Add status field: `'pending' | 'processing' | 'completed' | 'failed'`
- Add optional `transcriptionError` field for failure messages

## Visual Design

No mockups provided. Follow existing patterns:

- VoiceRecorder.tsx styling (rose for recording, teal for success, slate backgrounds)
- EvaluationForm.tsx layout and spacing conventions
- Consistent use of Lucide icons and Shadcn/UI components

## Existing Code to Leverage

**VoiceRecorder Component (`apps/client/src/components/patients/VoiceRecorder.tsx`)**

- Full recording state machine: idle → recording → playback → confirming
- MediaRecorder API integration with `audio/webm` output
- Returns `Blob` via `onRecordingComplete` callback
- Existing duration tracking and formatted display

**Media API Client (`apps/client/src/api/media.ts`)**

- Follow `uploadFootprint` pattern: FormData construction, multipart headers
- Follow `uploadSessionPhoto` pattern for session-scoped uploads
- Axios instance with auth headers already configured

**useDebounce Hook (`apps/client/src/hooks/use-debounce.ts`)**

- Reference pattern for creating interval-based hooks
- Cleanup pattern with `useRef` and `useEffect` return

**EvaluationForm State Pattern (`apps/client/src/components/patients/EvaluationForm.tsx`)**

- `audioBlob` state already exists (line 94)
- Status indicator pattern: "Guardando..." / "Guardado" (lines 456-464)
- Toast integration via `useToast` hook

**Backend Endpoints (Already Complete)**

- `POST /api/v1/media/evaluations/:evaluationId/voice-notes`
- `POST /api/v1/media/sessions/:sessionId/voice-notes`
- Returns `VoiceNote` with `transcriptionStatus` field

## Out of Scope

- VoiceRecorder component rebuild or redesign
- Inline transcription text editing
- Real-time streaming transcription (speech-to-text as you speak)
- Voice commands or voice-activated controls
- Multi-language support (backend hardcoded to Spanish)
- Audio trimming or editing features
- Real-time audio waveform visualization (Web Audio API)
- Offline recording with background sync (Week 8 PWA scope)
- PatientForm or CaseDetailLayout integration
- Transcription accuracy improvements or prompt tuning

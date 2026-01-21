# Spec Requirements: Voice Recorder Transcription

## Initial Description

**From Roadmap Task 7.5:** Frontend: Voice recorder button + transcription

This task involves completing the "last mile" integration between the existing VoiceRecorder component and the backend transcription service. The VoiceRecorder UI and backend Whisper/Groq integration already exist — the gap is wiring them together: upload audio, poll for transcription status, and display results.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the main gap is completing the "last mile" integration — wiring the existing VoiceRecorder to actually upload audio and display real transcription results. Is that correct, or do you want to rebuild/redesign the VoiceRecorder component itself?
**Answer:** Confirmed. Complete the integration, NOT rebuild. VoiceRecorder.tsx is well-implemented (327 lines, full state machine, tests passing). The gap is purely wiring: upload → poll → display.

**Q2:** I'm thinking we should add real-time transcription status polling — after confirming a recording, the UI would poll the backend until transcription completes (or fails), then display the actual text. Should we also allow editing the transcription inline, or just display it read-only for MVP?
**Answer:** Implement polling, keep transcriptions read-only for MVP. Product mission emphasizes "Zero-UI Tunnel Interface" — minimal interaction. If transcription is wrong, user can re-record (already supported). Editing can be a post-MVP enhancement if field testing shows accuracy issues.

**Q3:** For integration scope, I assume we need to wire the VoiceRecorder to EvaluationForm (already integrated but not uploading) and SessionForm (not integrated yet). Are there other components that need voice dictation?
**Answer:** Confirmed. Wire to both EvaluationForm and SessionForm as specified in roadmap task 7.6. Out of scope: PatientForm (intake doesn't need voice notes), CaseDetailLayout (read-only view).

**Q4:** Should transcriptions be editable after completion?
**Answer:** No. Read-only display. "Zero-Friction" = capture reality, don't edit it. Medical notes should be immutable for legal defensibility (from mission.md: "Immutable Session Logs"). If wrong → re-record (cleaner audit trail).

**Q5:** What should happen if transcription fails?
**Answer:** Graceful degradation — keep audio, show retry option. Audio is valuable even without transcription. Backend already stores `transcriptionStatus: 'failed'` with error message. User can retry or proceed without transcription.

**Q6:** Is there anything that should be explicitly OUT of scope?
**Answer:** Yes. Out of scope: real-time streaming transcription, voice commands (Part 4), multi-language (backend hardcoded to Spanish), audio editing/trimming, real-time waveform visualization, offline recording + sync (Week 8 scope).

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Debounced auto-save with status indicator - Path: `apps/client/src/components/patients/EvaluationForm.tsx` (lines 456-464, "Guardando..." / "Guardado ✓" pattern)
- Feature: Toast notifications for errors - Path: `apps/client/src/components/patients/VoiceRecorder.tsx` (uses `useToast` hook)
- Feature: Media upload patterns - Path: `apps/client/src/api/media.ts` (uploadFootprint, uploadSessionPhoto patterns)
- Feature: Form state with blob handling - Path: `apps/client/src/components/patients/EvaluationForm.tsx` (`audioBlob` state already exists)

### Follow-up Questions

No follow-up questions needed — all requirements clarified in first round.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - No mockups provided. Implementation will follow existing VoiceRecorder UI patterns and EvaluationForm styling conventions.

## Requirements Summary

### Functional Requirements

**Core Functionality:**

- Upload recorded audio to backend via new API client methods
- Poll backend for transcription status after upload
- Display transcription result when complete (read-only)
- Handle transcription failures gracefully with retry option
- Integrate voice recording into SessionForm (currently only in EvaluationForm)

**User Actions Enabled:**

- Record voice note → Review → Confirm → See "Transcribiendo..." → See transcription text
- Play back audio after transcription completes
- Re-record if transcription is incorrect
- Retry transcription if it fails

**Data to be Managed:**

- Audio blob (temporary, client-side until upload)
- Voice note metadata (audioUrl, transcription, status, duration)
- Transcription polling state (pending, processing, completed, failed)

### Technical Implementation

**New Files to Create:**

1. `apps/client/src/hooks/useTranscriptionPolling.ts` - Polling hook for transcription status
2. `apps/client/src/components/patients/TranscriptionDisplay.tsx` - Read-only transcription display component

**Files to Modify:**

1. `apps/client/src/api/media.ts` - Add `uploadEvaluationVoiceNote` and `uploadSessionVoiceNote` methods
2. `apps/client/src/components/patients/EvaluationForm.tsx` - Wire upload + polling + display
3. `apps/client/src/components/patients/SessionForm.tsx` - Add VoiceRecorder + upload + polling + display
4. `apps/client/src/types/patient.ts` - Add VoiceNote interface if not exists

**API Endpoints (Already Exist):**

- `POST /api/v1/media/evaluations/:evaluationId/voice-notes`
- `POST /api/v1/media/sessions/:sessionId/voice-notes`

**Polling Strategy:**

- Poll every 3 seconds
- Maximum 10 attempts (30 seconds total)
- Backend cron runs every 30s, so most transcriptions complete in <5s

### Reusability Opportunities

- `useTranscriptionPolling` hook can be reused for any future voice note features
- `TranscriptionDisplay` component is generic and reusable
- Media API patterns follow existing `uploadFootprint`, `uploadSessionPhoto` conventions

### Scope Boundaries

**In Scope:**

- Add `uploadVoiceNote` methods to media.ts API client
- Create `useTranscriptionPolling` hook
- Create `TranscriptionDisplay` component
- Wire EvaluationForm: upload on confirm, poll, display
- Wire SessionForm: add VoiceRecorder + same flow
- Error/retry handling with toast notifications
- Unit tests for new hooks and components

**Out of Scope:**

- VoiceRecorder component rebuild (already complete)
- Transcription text editing
- Real-time streaming transcription (as-you-speak)
- Voice commands
- Multi-language support (backend hardcoded to Spanish)
- Audio editing/trimming
- Real-time audio waveform visualization
- Offline recording + sync (Week 8 PWA scope)

### Technical Considerations

**Integration Points:**

- Backend TranscriptionService (Groq/Whisper, already complete)
- Backend TranscriptionProcessor (cron job for async processing)
- MinIO storage for audio files
- Existing VoiceRecorder component callbacks

**Existing System Constraints:**

- Backend returns `VoiceNote` structure with `transcriptionStatus` field
- Transcription uses Spanish language (`es`) with physiotherapy vocabulary prompt
- Audio format: `audio/webm` from MediaRecorder API
- Backend timeout: 5 seconds initial, then async retry via cron

**Technology Stack:**

- React 19 + TypeScript
- Existing `useToast` hook for notifications
- Existing `mediaApi` patterns for uploads
- No new dependencies required

### UI States

**TranscriptionDisplay States:**

1. **Uploading:** Spinner + "Subiendo nota de voz..."
2. **Pending/Processing:** Spinner + "Transcribiendo..."
3. **Completed:** Transcription text + audio player + "Volver a grabar" button
4. **Failed:** Audio player + error message + "Reintentar" button
5. **Network Error:** Toast notification + retry option

### Estimated Effort

1-2 days (mostly integration work, minimal new UI components)

# Spec Requirements: Audio & Video Recording Buttons Wiring

## Initial Description

Make a list of all buttons that record audio and video, and wire their states and methods. (Roadmap Item 7.7 from Week 7: Media & Dictation)

## Requirements Discussion

### First Round Questions

**Q1:** I assume the goal is to audit and document the current state of all recording buttons, identifying any that are unwired or showing "Coming soon" placeholders. Is that correct, or are you asking me to implement missing wiring for specific buttons?

**Answer:** Proceed with full audit - document comprehensive inventory of all recording buttons, identify unwired/placeholder buttons, verify state management implementation, ensure all callbacks properly wired, and create actionable fix list.

**Q2:** I'm thinking this should focus on recording buttons identified in the Pacientes module (EvaluationForm, PatientProfile, SessionForm, ObjectiveCard, SessionDetailView). Should we also include any recording buttons in other modules (like Analisis for video analysis)?

**Answer:** Focus primarily on Pacientes module (main recording UI locations), but also check any recording interfaces in other modules to ensure consistency across the application.

**Q3:** For button states, I see components use a state machine pattern (idle → requesting → recording → preview → confirm). Should we document this existing pattern, or are you looking to standardize/enhance the state management across all recording buttons?

**Answer:** Document the existing state machine pattern used across components, verify it's correctly implemented in all recording buttons, and identify any inconsistencies that need standardization.

**Q4:** Based on the roadmap task 7.7 context (Week 7: Media & Dictation), this task appears to be a wiring verification after media infrastructure was built in 7.1-7.6. Are we looking for any specific issues like: buttons not triggering recordings, states not updating correctly, or callback methods not being called?

**Answer:** Look for all potential issues: buttons not triggering recordings, states not updating correctly, callback methods not being called, missing error handling, and any "Coming soon" placeholders.

**Q5:** I notice some recording integrations are complete (VoiceRecorder in EvaluationForm, SessionForm) while others might be placeholders. Should we prioritize the buttons that are currently not functional, or create a comprehensive inventory of all recording buttons regardless of status?

**Answer:** Create comprehensive inventory of ALL recording buttons first (functional and non-functional), then categorize them by status to identify priority fixes.

**Q6:** For the scope of this task, should we also verify the backend integration (mediaApi uploads, transcription polling), or focus only on the frontend button wiring and state management?

**Answer:** Include backend verification - recordings should flow through to mediaApi uploads and transcription polling. This is a full-stack verification.

**Q7:** Are there any specific user flows where the recording behavior is problematic or needs verification (e.g., recording during clinical evaluations vs. treatment sessions vs. quick notes)?

**Answer:** Verify recording behavior across all major flows: clinical evaluations (EvaluationForm), treatment sessions (SessionForm), quick notes (PatientProfile), objectives (ObjectiveCard), and session details (SessionDetailView).

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** VoiceRecorder component - Path: `apps/client/src/components/patients/VoiceRecorder.tsx`
  - State machine: idle → recording → playback → confirming
  - Uses MediaRecorder API with audio/webm format
  - Provides onRecordingComplete callback
- **Feature:** VideoRecorder component - Path: `apps/client/src/components/patients/VideoRecorder.tsx`
  - State machine: idle → requesting → recording → preview → confirm
  - Camera switching, duration limit (30s)
  - Provides onCapture callback with VideoMetadata
- **Feature:** CameraCapture component - Path: `apps/client/src/components/patients/CameraCapture.tsx`
  - State machine: idle → requesting → previewing → captured → error
  - Posture/footprint overlays
  - Provides onCapture callback
- **Feature:** EvaluationForm integration - Path: `apps/client/src/components/patients/EvaluationForm.tsx`
  - Comprehensive example of all recording types
  - Voice, posture, footprint (left/right), gait video
  - Shows callback wiring patterns
- **Feature:** CaseDetailLayout wiring - Path: `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - "Grabar Evolucion" button with Mic icon
  - Upload integration to evolution case
  - Manages isRecordingOpen state
- **Feature:** Transcription polling - Path: `apps/client/src/hooks/use-transcription-polling.ts`
  - Manages async transcription status
  - States: pending, processing, completed, failed
- **Feature:** Media utilities - Path: `apps/client/src/utils/media.ts`
  - getUserMedia error handling
  - Localized error messages (Spanish)
- **Feature:** Media API - Path: `apps/client/src/api/media.ts`
  - uploadEvaluationVoiceNote
  - uploadPostureVideo
  - getVoiceNoteStatus

**Backend logic to reference:** All recording components emit Blobs via callbacks; parent forms handle mediaApi uploads and transcription polling. Uploads use multipart/form-data.

### Follow-up Questions

No follow-up questions needed. Proceeding with comprehensive analysis based on codebase exploration.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Based on codebase exploration, no visual assets were uploaded. However, component structure suggests:

- Recording buttons use lucide-react icons (Mic, Camera, Video)
- States indicated by icon changes and button text (idle vs. recording vs. completed)
- Recording components are typically embedded in forms as modals or inline components
- Error states are shown via toasts or localized error messages

## Requirements Summary

### Functional Requirements

- **Inventory**: Create comprehensive list of all recording buttons across the application
- **Audio Recording**: Identify all voice dictation buttons (EvaluationForm, PatientProfile, SessionForm, ObjectiveCard, SessionDetailView)
- **Video Recording**: Identify all video recording buttons (EvaluationForm gait video, PatientProfile video)
- **Photo Capture**: Identify all photo capture buttons (EvaluationForm posture/footprint, PatientProfile huella, SessionForm photos)
- **State Verification**: Verify state machine implementation (idle → requesting → recording → preview → confirm) for each button
- **Callback Wiring**: Verify all callbacks are properly wired (onRecordingComplete, onCapture, onCancel, etc.)
- **Error Handling**: Verify getUserMedia error handling and user-friendly error messages
- **Upload Integration**: Verify mediaApi integration for all recording types
- **Transcription**: Verify transcription polling for voice notes
- **Status Indicators**: Verify button states correctly reflect recording status (idle, recording, paused, completed)

### Reusability Opportunities

- **Components to reuse**: VoiceRecorder, VideoRecorder, CameraCapture can be consistently used across all recording UI
- **State patterns**: State machine pattern can be extracted to custom hook (useRecorderState) for consistency
- **Error handling**: media.ts utility provides consistent error handling
- **API integration**: media.ts provides consistent upload patterns
- **Polling pattern**: useTranscriptionPolling can be reused for any async transcription scenarios

### Scope Boundaries

**In Scope:**

- Inventory all recording buttons in Pacientes module
- Verify state management implementation for each button
- Verify callback wiring between recording components and parent forms
- Verify error handling and user feedback
- Verify mediaApi integration for uploads
- Verify transcription polling for voice notes
- Identify any unwired or placeholder buttons
- Document findings in structured format
- Create action items for any issues found

**Out of Scope:**

- Implementing new recording features
- Modifying recording component behavior (unless broken)
- Backend API changes
- UI/UX redesign of recording interfaces
- Mobile-specific optimizations
- Testing automated recording flows (manual verification only)

### Technical Considerations

- **Tech Stack**: React 19, TypeScript, MediaRecorder API, NestJS backend
- **State Management**: Local state with useState + useRef for non-reactive objects
- **Recording Format**: audio/webm for voice, video/webm for video, JPEG for photos
- **Upload**: multipart/form-data via mediaApi
- **Transcription**: Async polling via useTranscriptionPolling hook
- **Error Messages**: Spanish localization in media.ts utility
- **Icon Library**: lucide-react (Mic, Camera, Video icons)
- **Browser APIs**: navigator.mediaDevices.getUserMedia, MediaRecorder, URL.createObjectURL

**Integration points mentioned:**

- Recording components emit Blobs via callbacks
- Parent forms handle uploads via mediaApi
- Transcription status tracked via polling hook
- Errors handled via media.ts utility

**Existing system constraints:**

- MediaRecorder API browser compatibility
- getUserMedia permission requirements
- Network connectivity for uploads
- Transcription service availability
- File size limits (30s video max for VideoRecorder)

**Similar code patterns to follow:**

- Use VoiceRecorder pattern for new audio recording buttons
- Use VideoRecorder pattern for new video recording buttons
- Use CameraCapture pattern for new photo capture buttons
- Follow EvaluationForm integration pattern for comprehensive recording UI
- Use useTranscriptionPolling for any transcription scenarios

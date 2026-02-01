# Spec Requirements: Fix Audio/Video Recording Functionality

## Initial Description

The user noticed many buttons that are supposed to record voice or video are not working. They want a list of all such buttons and to ensure they are all correctly wired to record and save audio and video.

## Requirements Discussion

### First Round Questions

**Q1:** I've identified several placeholder buttons in `PatientProfile`, `CaseDetailLayout`, and `ObjectiveCard` that show "Coming soon" toasts or have no handlers. Should all of these be fully implemented to record and save to the backend?
**Answer:** Yes, all buttons that suggest recording (audio or video) should be functional and save the data to the appropriate entities (patients, evaluations, sessions, or objectives).

**Q2:** For the "Dictar nota" button in the `PatientProfile`, where should this audio be saved? Should it create a new general note for the patient?
**Answer:** It should probably be associated with the active clinical case or create a new session if one isn't active, or simply be a voice note for the patient profile if it's a general dictation. (Assuming association with active case/session for now).

**Q3:** For the `ObjectiveCard` voice dictation, should it transcribe the audio to text and fill the textarea?
**Answer:** Yes, that is the expected behavior for "dictation".

**Q4:** Are there any specific storage or processing requirements for these new recording points that differ from the existing `EvaluationForm` and `SessionForm`?
**Answer:** No, we should use the existing `mediaApi` and `TranscriptionService` infrastructure.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Evaluation Multimedia - Path: `apps/client/src/components/patients/EvaluationForm.tsx`
- Feature: Session Voice Notes - Path: `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`
- Components to potentially reuse: `VoiceRecorder`, `VideoRecorder`, `CameraCapture`, `TranscriptionDisplay`
- Backend logic to reference: `MediaService`, `TranscriptionService`

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **PatientProfile**: "Dictar nota" and "Video" buttons must trigger recording flows.
- **CaseDetailLayout**: "Grabar Evolucion" button must trigger audio recording.
- **ObjectiveCard**: Enable voice dictation to fill objective text.
- **Consistency**: All recording UI should use the existing `VoiceRecorder` and `VideoRecorder` components.
- **Persistence**: All recordings must be uploaded to the backend via `mediaApi`.

### Reusability Opportunities

- Reuse `VoiceRecorder` and `VideoRecorder` components across all identified locations.
- Reuse `mediaApi` methods for uploading evaluation/session voice notes and posture videos.
- Reuse `useTranscriptionPolling` hook for tracking transcription progress.

### Scope Boundaries

**In Scope:**

- Wiring up all identified placeholder buttons to functional recording components.
- Ensuring backend persistence for all recordings.
- Implementing transcription-to-text for the `ObjectiveCard` dictation.

**Out of Scope:**

- Designing new recording UI (will use existing components).
- Implementing features beyond recording (e.g., advanced video editing).

### Technical Considerations

- Handle cases where no active clinical case or session exists when recording from the patient profile.
- Ensure proper permissions and error handling for camera/microphone access.
- Correctly map parameter names in `mediaApi` (fixed `durationSeconds` earlier).

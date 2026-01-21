# Spec Requirements: E2E Record Dictar Nota

## Initial Description

create a end to end to try the record of "dictar nota" lets make sure the record is saved correctly, you can use playwrith or chrome dev

## Requirements Discussion

### First Round Questions

**Q1:** Test Environment: I'm assuming we should use Playwright with a mocked microphone to simulate the recording, rather than relying on real audio hardware. Is that correct, or do you prefer a different approach?
**Answer:** suggest

**Q2:** Success Criteria: Beyond checking if the record is saved, should we also verify the transcription status? (e.g., waiting for the "Transcripción pendiente..." placeholder to change or polling the API for the finished text).
**Answer:** yes verify the transcriptoin status

**Q3:** Integration Point: Should this E2E test cover the recording within a Treatment Session (Cronograma) or in the Clinical Evaluation (EvaluacionForm)? Or both?
**Answer:** yes (both)

**Q4:** Mocking vs. Real API: For the Whisper/Groq transcription, should we mock the backend response to ensure the test is deterministic, or do you want to test the full integration with the real transcription service?
**Answer:** full integration

**Q5:** UI Interactions: I'm assuming we should test the full flow: Click Record -> Wait for duration -> Click Stop -> Click Confirm. Should we also test the "Cancel" or "Restart" functionality?
**Answer:** yes

**Q6:** Are there any specific error scenarios we should cover, such as microphone permission denial or upload failure?
**Answer:** suggest

### Existing Code to Reference

- **Similar Features Identified:**
  - Feature: Treatment Session E2E - Path: `apps/client/tests/e2e/record-session.spec.ts`
  - Feature: Voice Recorder Component - Path: `apps/client/src/components/patients/VoiceRecorder.tsx`
  - Feature: Voice Recorder Hook - Path: `apps/client/src/hooks/use-voice-recorder.ts`
  - Feature: Recording Floating Bar - Path: `apps/client/src/components/patients/RecordingFloatingBar.tsx`

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Comprehensive Voice Flow**: Test the full lifecycle of a voice note: Start Recording -> Capture Audio -> Stop -> Review (Playback) -> Confirm -> Upload -> Transcribe.
- **Multi-Point Verification**: Ensure voice dictation works in both the `EvaluacionForm` (Clinical Evaluation) and `SessionForm` (Treatment Session).
- **Transcription Polling**: The test must wait for the backend to process the audio and verify that the transcription text is eventually displayed/saved.
- **State Management**: Verify the UI updates correctly through states: `idle` -> `recording` -> `playback` -> `confirming`.
- **UI Resilience**: Test the "Cancel" and "Restart" actions during the recording and playback phases.

### Reusability Opportunities

- Reuse `CasePage` object and extend it with voice recording methods.
- Leverage existing Playwright configuration but extend it with media mocking capabilities.

### Scope Boundaries

**In Scope:**

- E2E test using Playwright.
- Mocked microphone input.
- Verification of database persistence (via UI feedback and API response).
- Verification of full integration with Groq/Whisper transcription.
- Testing Cancel/Restart flows.
- Error handling for Permission Denied.

**Out of Scope:**

- Testing with physical hardware microphones.
- Testing in browsers other than Chromium (unless requested later).
- Performance benchmarking of the transcription service.

### Technical Considerations

- **Playwright Configuration**: Needs `--use-fake-ui-for-media-stream` and `--use-fake-device-for-media-stream` launch arguments.
- **Permissions**: Must grant `microphone` permission in the browser context.
- **Predictable Input**: Use a sample `.wav` file via `--use-file-for-fake-audio-capture` for consistent transcription testing if the default fake tone is not sufficient for Whisper.
- **Polling Logic**: Implement a wait-and-retry mechanism for checking the transcription status (since it's an async background process).
- **Error Mocking**: Specifically for Suggestion #6, simulate a "Permission Denied" scenario by explicitly denying the microphone permission in a separate test case.

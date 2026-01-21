# Specification: E2E Record Dictar Nota

## Goal

Verify the "Zero-Friction" voice dictation flow through end-to-end tests, ensuring that clinical observations are recorded, reviews are possible, and transcriptions are accurately processed and persisted across all integration points.

## User Stories

- As a physiotherapist, I want to dictate notes during a session so that I can focus on manual therapy without the friction of typing.
- As a physiotherapist, I want to review my recording and see the transcription progress so that I can ensure the clinical record is accurate and complete.

## Specific Requirements

**Test Environment & Configuration**

- Use Playwright with Chromium to support `--use-fake-ui-for-media-stream` and `--use-fake-device-for-media-stream` flags.
- Grant `microphone` permissions explicitly using `browserContext.grantPermissions(['microphone'])`.
- Use a synthetic audio fixture via `--use-file-for-fake-audio-capture` to provide predictable input for Whisper transcription verification.

**Feature Coverage: Evaluation Form**

- Verify the "Dictado por voz" trigger in `EvaluacionForm` opens the `VoiceRecorder` component.
- Confirm the recording lifecycle: Start -> Pulse Indicator active -> Duration timer increments -> Stop.
- Verify playback functionality by checking the existence and source of the `<audio>` element after stopping.

**Feature Coverage: Treatment Session**

- Verify the "Grabar Evolución" button in `CaseDetailLayout` header triggers the `RecordingFloatingBar`.
- Ensure the floating bar displays the recording status and duration independently of the main page scroll.

**Transcription Integration**

- Test full integration with Groq/Whisper API; do not mock the transcription network requests.
- Verify the UI transition from "Transcripción pendiente..." to the final medical text.
- Implement a robust polling wait in the test that matches the 3-second interval of `useTranscriptionPolling`.

**Resilience & Error Handling**

- Verify the "Cancelar" action closes the recorder and prevents data from being appended to the clinical case.
- Verify "Volver a grabar" resets the recorder state and duration, allowing for a fresh capture.
- Simulate a "Permission Denied" scenario by explicitly denying microphone access and verifying the descriptive toast message.

## Existing Code to Leverage

**E2E Page Objects**

- Extend `apps/client/tests/e2e/pages/CasePage.ts` with locators for `RecordingFloatingBar` and `VoiceRecorder`.
- Reuse `mockAuth()` and `gotoDetail()` from `BasePage.ts` to set up the test context efficiently.

**Voice Logic**

- Reference `apps/client/src/hooks/use-voice-recorder.ts` for understanding the state transitions (`idle`, `recording`, `playback`, `confirming`).
- Follow the polling logic in `apps/client/src/hooks/use-transcription-polling.ts` to implement appropriate timeouts in Playwright's `expect` assertions.

**Backend Flow**

- Reference `apps/server/src/modules/media/media.service.ts` to understand how voice notes are appended to the `Evaluation` or `TreatmentSession` JSON arrays.

## Out of Scope

- Testing voice recording in Firefox or Safari due to different media mocking flag requirements.
- Verification of audio frequency or waveform visualization accuracy.
- Testing transcriptions longer than 1 minute.
- Automatic structured data extraction (e.g., parsing pain level from voice).

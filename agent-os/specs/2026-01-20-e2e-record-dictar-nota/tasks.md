# Task Breakdown: E2E Record Dictar Nota

## Overview

Total Tasks: 15

## Task List

### Infrastructure & Setup

#### Task Group 1: Playwright Configuration and Fixtures

**Dependencies:** None

- [ ] 1.0 Complete test infrastructure setup
  - [ ] 1.1 Create audio fixture file
    - Path: `apps/client/tests/e2e/fixtures/sample-physio-note.wav`
    - Content: Short audio with Spanish medical terms ("paciente con lumbalgia").
  - [ ] 1.2 Update Playwright configuration for media mocking
    - File: `apps/client/playwright.config.ts`
    - Add/Verify launch arguments: `--use-fake-ui-for-media-stream`, `--use-fake-device-for-media-stream`, `--use-file-for-fake-audio-capture`.
  - [ ] 1.3 Extend `CasePage` Object
    - File: `apps/client/tests/e2e/pages/CasePage.ts`
    - Add locators for: `VoiceRecorder` buttons (Start, Stop, Confirm, Cancel, Restart), `RecordingFloatingBar`, and `TranscriptionDisplay`.
    - Add methods: `startVoiceNote()`, `stopVoiceNote()`, `confirmVoiceNote()`, `getTranscriptionText()`.

**Acceptance Criteria:**

- Audio fixture is accessible in the filesystem.
- Playwright can launch Chromium with fake media flags.
- `CasePage` has all necessary locators for interacting with voice features.

### E2E Test Implementation

#### Task Group 2: Happy Path Tests

**Dependencies:** Task Group 1

- [ ] 2.0 Implement core functional E2E tests
  - [ ] 2.1 Write `dictate-note-evaluation.spec.ts`
    - Flow: Navigate to Evaluation -> Start Dictation -> Stop -> Confirm -> Poll for Transcription -> Verify Text.
    - Assert: "Transcripción pendiente..." transitions to the expected medical text.
  - [ ] 2.2 Write `dictate-note-session.spec.ts`
    - Flow: Open Case Detail -> Grabar Evolución (Floating Bar) -> Stop -> Confirm -> Verify presence in timeline.
    - Assert: `RecordingFloatingBar` is visible and functional during the recording phase.
  - [ ] 2.3 Ensure Happy Path tests pass
    - Run: `pnpm playwright test apps/client/tests/e2e/dictate-note-evaluation.spec.ts apps/client/tests/e2e/dictate-note-session.spec.ts`
    - Verify full integration with Groq/Whisper (real transcription).

**Acceptance Criteria:**

- Voice notes are successfully recorded and transcribed in both Evaluation and Session flows.
- Transcription polling works correctly with real backend integration.

#### Task Group 3: Resilience and Error Handling

**Dependencies:** Task Group 2

- [ ] 3.0 Implement resilience and error scenario tests
  - [ ] 3.1 Write `recorder-resilience.spec.ts`
    - Test: Cancel recording -> Verify recorder closes and no note is created.
    - Test: Restart recording (Volver a grabar) -> Verify state reset and successful re-recording.
  - [ ] 3.2 Write `recorder-permissions.spec.ts`
    - Test: Deny microphone permission -> Verify "Permiso denegado" toast message.
  - [ ] 3.3 Ensure resilience tests pass
    - Run: `pnpm playwright test apps/client/tests/e2e/recorder-resilience.spec.ts apps/client/tests/e2e/recorder-permissions.spec.ts`

**Acceptance Criteria:**

- Cancel and Restart flows behave as specified.
- Permission errors are gracefully handled with user feedback.

### Final Verification

#### Task Group 4: Test Review & Final Run

**Dependencies:** Task Groups 1-3

- [ ] 4.0 Final review and cleanup
  - [ ] 4.1 Review E2E test code for consistency with `record-session.spec.ts` pattern.
  - [ ] 4.2 Perform final full run of the new E2E suite (approx. 5-7 tests).
  - [ ] 4.3 Verify that database cleanup is handled (using test therapist account).

**Acceptance Criteria:**

- All 15 tasks completed.
- Full E2E suite passes in the local development environment.

## Execution Order

Recommended implementation sequence:

1. Infrastructure & Setup (Task Group 1)
2. Happy Path Tests (Task Group 2)
3. Resilience and Error Handling (Task Group 3)
4. Test Review & Final Run (Task Group 4)

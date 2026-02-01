# Specification: Fix Audio/Video Recording Functionality

## Overview

This specification addresses the issue of non-functional or placeholder audio/video recording buttons across the application. It aims to wire all identified recording triggers to the existing `VoiceRecorder`, `VideoRecorder`, and `mediaApi` infrastructure.

## Proposed Changes

### 1. Patient Profile (`PatientProfile.tsx` & `PatientDetail.tsx`)

- **Issue**: "Dictar nota" and "Video" buttons show "Coming soon" toasts.
- **Change**:
  - Add state to `PatientDetail.tsx` to manage recording dialogs (audio and video).
  - Implement `handleVoiceDictation` to open a dialog with `VoiceRecorder`.
  - Implement `handleCaptureVideo` to open a dialog with `VideoRecorder`.
  - Association: Since these are general patient recordings, they will be associated with the _active_ clinical case and evaluation if available, or warn the user if none is active.

### 2. Case Detail Header (`CaseDetailLayout.tsx`)

- **Issue**: "Grabar Evolucion" button has no `onClick` handler.
- **Change**:
  - Add `isRecordingOpen` state.
  - Implement `handleRecordingComplete` that calls `mediaApi.uploadEvaluationVoiceNote` using the current active evaluation ID.
  - Add a Dialog containing `VoiceRecorder` triggered by the button.

### 3. Objective Dictation (`ObjectiveCard.tsx`)

- **Issue**: Mic button is disabled and marked as "próximamente".
- **Change**:
  - Enable the Mic button.
  - Pass an `onDictate` callback to the component.
  - When clicked, open a `VoiceRecorder`.
  - Upon recording completion, upload the audio, wait for transcription, and append/set the text in the objective's textarea.

## Technical Implementation Details

### Reusing Components

- **`VoiceRecorder`**: Used for all audio recording.
- **`VideoRecorder`**: Used for posture video recording.
- **`TranscriptionDisplay`**: Used to show transcription status and results.
- **`mediaApi`**: Used for all backend communication.

### Data Association Logic

- **Evaluation Context**: Use `mediaApi.uploadEvaluationVoiceNote` or `uploadPostureVideo`.
- **Session Context**: Use `mediaApi.uploadSessionVoiceNote`.
- **Patient Context**: Default to active evaluation. If none, prompt user or create a "General" placeholder (TBD if backend supports non-entity voice notes).

## Verification Plan

1.  **Patient Profile**: Click "Dictar nota" -> Record -> Check if uploaded and transcribed.
2.  **Patient Profile**: Click "Video" -> Record -> Check if uploaded.
3.  **Case Detail**: Click "Grabar Evolución" -> Record -> Check if added to evaluation timeline.
4.  **Objectives**: Click Mic icon in therapeutic objective -> Record -> Check if text fills the textarea.

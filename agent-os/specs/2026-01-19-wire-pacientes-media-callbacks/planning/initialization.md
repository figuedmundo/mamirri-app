# Spec Initialization

## Raw Idea

From roadmap task 7.6:

> **7.6** Wire Pacientes: onVoiceDictation, onCaptureHuella, onCaptureVideo

This task involves wiring media capture callbacks (voice dictation, footprint capture, video capture) to the Pacientes module components.

## Context from Research

### Already Completed (Prior Tasks)

- **7.1** Backend: Media upload endpoint (validation, MinIO) ✅
- **7.2** Frontend: Camera capture component ✅
- **7.3** Frontend: Photo gallery per session ✅
- **7.4** Backend: Whisper integration (Groq API) ✅
- **7.5** Frontend: Voice recorder button + transcription ✅

### Current State Analysis

**VoiceRecorder Integration (onVoiceDictation)**

- `VoiceRecorder.tsx` component is complete with full state machine
- Already wired in `EvaluationForm` and `SessionForm` with transcription polling
- `TranscriptionDisplay.tsx` shows transcription results
- Backend Whisper/Groq transcription service fully operational

**Camera/Photo Capture (onCaptureHuella)**

- `CameraCapture.tsx` exists with posture overlay support
- Used for posture photos, but footprint capture uses same generic flow
- No specialized footprint overlay exists yet
- `uploadFootprint` API endpoint exists and is functional

**Video Capture (onCaptureVideo)**

- Backend `uploadPostureVideo` endpoint exists and is ready
- **NO frontend VideoRecorder component exists** - this is missing
- Storage service validates MP4, WebM, QuickTime up to 100MB

### Components to Wire

- `PacienteProfile` - Patient detail view
- `EvaluationForm` - Clinical evaluation (already has voice recorder)
- `CaseDetailLayout` - Case detail wrapper
- `SessionForm` - Treatment session form (already has voice recorder)

## Date Initialized

2026-01-19

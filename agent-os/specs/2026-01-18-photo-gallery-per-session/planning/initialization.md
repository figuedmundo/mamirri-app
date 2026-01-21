# Spec Initialization: Photo Gallery Per Session

## Raw Idea

**Source:** Roadmap Task 7.3

**Description:**
Frontend: Photo gallery per session

**Context from Roadmap:**
This is part of Week 7: Media & Dictation milestone (Milestone 3: "I can take photos and dictate notes").

Related completed tasks:

- 7.1 Backend: Media upload endpoint (validation, MinIO) - COMPLETED
- 7.2 Frontend: Camera capture component - COMPLETED

Related pending tasks:

- 7.4 Backend: Whisper integration (Groq API)
- 7.5 Frontend: Voice recorder button + transcription
- 7.6 Wire Pacientes: onVoiceDictation, onCaptureHuella, onCaptureVideo
- 7.7 Test: Dictate medical terms, verify accuracy

## Existing Infrastructure

### Camera Capture Component (Task 7.2)

- Location: `apps/client/src/components/patients/CameraCapture.tsx`
- Props: `onCapture(blob, metadata)`, `onCancel`, `overlayType`, `defaultFacingMode`
- Features: Posture overlays, camera toggle, image preview/confirmation

### Media API Service

- Location: `apps/client/src/api/media.ts`
- Methods: `uploadPatientPhoto(patientId, file)`, `uploadFootprint(evaluationId, file, type)`, `uploadPostureVideo(evaluationId, file, type, duration)`

### Media Lightbox Component

- Location: `apps/client/src/components/ui/media-lightbox.tsx`
- Features: Full-screen view, navigation arrows, keyboard support, video playback

### TreatmentSession Type

- Location: `apps/client/src/types/patient.ts`
- Fields: `id`, `clinicalCaseId`, `date`, `phaseNumber`, `procedures`, `patientResponse`, `finalPainLevel`, `observations`, `voiceNotes?`
- Note: Currently NO photos/media field in TreatmentSession interface

### Session Components

- `SessionCard.tsx` - Displays session summary in timeline
- `SessionForm.tsx` - Modal for creating/editing sessions
- `SessionDetailView.tsx` - Detailed session report view
- `TreatmentTimeline.tsx` - Orchestrator component

## Product Context

### Mission Alignment

- "Zero-Friction" Digital Clinical Assistant
- Capture clinical data through voice and vision
- Visual evolution as core vital sign
- Before vs. After comparison capability

### User Persona

- Expert Clinical Physiotherapist (45-60)
- High patient volume, hands-on work
- Data fragmentation: info lives in memory, phone gallery, paper notes
- Needs to work offline/online seamlessly

## Date

2026-01-18

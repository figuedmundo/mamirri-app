# Spec Initialization: Camera Capture Component

## Source

**Roadmap Reference:** Task 7.2 - "Frontend: Camera capture component"

## Raw Idea (from Roadmap)

Week 7 is focused on "Media & Dictation" with the following related tasks:

- **7.1** Backend: Media upload endpoint (validation, MinIO) - COMPLETE
- **7.2** Frontend: Camera capture component - THIS SPEC
- **7.3** Frontend: Photo gallery per session
- **7.4** Backend: Whisper integration (Groq API)
- **7.5** Frontend: Voice recorder button + transcription
- **7.6** Wire Pacientes: onVoiceDictation, onCaptureHuella, onCaptureVideo
- **7.7** Test: Dictate medical terms, verify accuracy

**Milestone 3 Goal:** "I can take photos and dictate notes"

## Product Context

### Mission Alignment

From `mission.md`:

- **"Zero-Friction" Digital Clinical Assistant** - camera should be frictionless to use
- **"Guided Visual Capture"** - Ghost overlays for consistent, comparable photos
- **Visual & Temporal Context** - treating visual evolution as a core vital sign
- **Before vs. After comparison** - aligning and comparing posture photos

### Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS + Shadcn/UI
- Backend: NestJS with MinIO (S3-compatible) storage
- PWA-ready (camera works in installed app)

## Existing Codebase Context

### Related Components

1. **VoiceRecorder.tsx** - Similar capture pattern (MediaRecorder API):
   - State machine: idle → recording → playback → confirming
   - Returns `Blob` via `onRecordingComplete` callback
   - Permission handling with user-friendly error messages
   - Preview before confirm pattern

2. **MediaGallery.tsx** (in product-plan) - Displays captured photos:
   - Renders thumbnails for footprints and posture videos
   - Handles lazy loading and preview interface

3. **EvaluationForm.tsx** - Will consume this component:
   - Has placeholder callbacks: `onCaptureHuella`, `onCaptureVideo`
   - Currently no image capture UI implemented

4. **PatientProfile.tsx** - Another consumer:
   - Has callback props for media capture

### Backend Ready

- `MediaController` has endpoints:
  - `POST /media/patients/:patientId/photos`
  - `POST /media/evaluations/:evaluationId/footprints`
  - `POST /media/evaluations/:evaluationId/posture-videos`
- `StorageService` handles MinIO uploads with validation

### UI Patterns

- Dialog/Modal: Radix UI via Shadcn
- Forms: Zod validation
- Toast: `useToast` hook
- Loading: Loader2 icon with animate-spin
- Buttons: Shadcn Button variants

## Technical Research Summary

### Recommended Approach

**Native implementation (getUserMedia + Canvas)** rather than react-webcam:

- No extra dependency
- Fine-grained control over constraints
- Direct error handling for permissions
- Custom processing pipeline if needed

### Key APIs

- `navigator.mediaDevices.getUserMedia()` for camera access
- Canvas API for frame capture
- `facingMode: 'environment'` for rear camera (posture photos)

### PWA Considerations

- Requires HTTPS (or localhost)
- Works in iOS Safari PWAs (since iOS 11)
- Works in Android Chrome PWAs
- Use `playsInline` attribute for iOS video element

### Permission Handling

- Check permission state first
- Handle NotAllowedError, NotFoundError, NotReadableError, etc.
- Provide clear instructions for denied permissions

## Initial Date

2026-01-18

## Status

✅ Requirements documented. Ready for spec creation.

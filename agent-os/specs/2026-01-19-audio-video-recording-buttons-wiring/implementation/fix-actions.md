# Fix Actions & Recommendations

**Date:** 2026-01-19
**Ref:** `agent-os/specs/2026-01-19-audio-video-recording-buttons-wiring/implementation/inventory-report.md`

## Critical Fixes

### 1. Fix Posture Photo Storage Logic

**Location:** `apps/client/src/components/patients/EvaluationForm.tsx`
**Issue:** The "Capturar Postura" button uses `handleCameraCapture` which calls `mediaApi.uploadFootprint`.
**Impact:** Posture photos are saved as footprints and displayed in the "Huella Plantar" section, confusing the clinical record.

**Recommended Action:**

1.  Verify backend capabilities for generic evaluation photos.
2.  If backend supports it, create `mediaApi.uploadPosturePhoto`.
3.  Update `EvaluationForm` state to include `posturePhotos` array (separate from `footprints` and `postureVideos`).
4.  Update `handleCameraCapture` to save to the correct destination based on context (Posture vs Footprint).

## Standardization Improvements

### 1. Unified Media Upload Pattern

Currently, `EvaluationForm` has separate handlers for `handleCameraCapture` (posture?) and `handleFootprintCaptureConfirm`.

- **Refactor**: Create a unified `handlePhotoUpload(blob: Blob, type: 'posture' | 'footprint')` to reduce code duplication and clarify intent.

### 2. Prop Drill Cleanup

`PatientDetail.tsx` passes `onVoiceDictation` and `onCaptureVideo` to `PatientProfile`.

- **Observation**: This is actually a good pattern (Smart Container / Dumb Presentation), but ensure `PatientProfile` doesn't accumulate too many unused props if features expand.

## Verified Items (No Action Needed)

- ✅ **VoiceRecorder Integration**: Wiring in `EvaluationForm` and `SessionForm` is correct.
- ✅ **VideoRecorder Integration**: Gait video capture is correctly wired to `uploadPostureVideo`.
- ✅ **Error Handling**: `media.ts` utilities are effectively used across all components.
- ✅ **Icons & Labels**: Consistent use of `lucide-react` and Spanish terminology.

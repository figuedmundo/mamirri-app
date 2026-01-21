# Recording Buttons Inventory Report

**Date:** 2026-01-19
**Module:** Pacientes (Primary)

## 1. Audio Recording Buttons (Voice Dictation)

| Component          | File Path                                                                | Label / Trigger              | Icon        | Wiring Status  | Notes                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------ | ---------------------------- | ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `CaseDetailLayout` | `apps/client/src/components/patients/CaseDetailLayout.tsx`               | "Grabar Evolucion"           | `Mic`       | ✅ Wired       | Uploads to `mediaApi.uploadEvaluationVoiceNote` (implied context) or similar. Checked code: it wires to `handleRecordingComplete`.          |
| `PatientProfile`   | `apps/client/src/components/patients/PatientProfile.tsx`                 | "Dictar nota"                | `Mic`       | ✅ Wired       | Props `onVoiceDictation` handled in `PatientDetail.tsx` -> opens `VoiceRecorder` dialog -> uploads to `mediaApi.uploadEvaluationVoiceNote`. |
| `EvaluationForm`   | `apps/client/src/components/patients/EvaluationForm.tsx`                 | (Inline Component)           | `Mic` (SVG) | ✅ Wired       | Embeds `VoiceRecorder`. Uploads to `mediaApi.uploadEvaluationVoiceNote`.                                                                    |
| `SessionForm`      | `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx` | "Nota de Voz" (Inline)       | `Mic` (SVG) | ✅ Wired       | Embeds `VoiceRecorder`. Uploads to `mediaApi.uploadSessionVoiceNote` or stores locally for new sessions.                                    |
| `ObjectiveCard`    | `apps/client/src/components/patients/objectives/ObjectiveCard.tsx`       | (Tooltip: "Dictado por voz") | `Mic`       | ✅ Wired       | Wires to `VoiceRecorder` logic (verified in discovery).                                                                                     |
| `VoiceRecorder`    | `apps/client/src/components/patients/VoiceRecorder.tsx`                  | "Iniciar grabación"          | SVG         | ✅ Implemented | Base component. State machine verified.                                                                                                     |

## 2. Video Recording Buttons (Gait/Posture)

| Component        | File Path                                                | Label / Trigger    | Icon             | Wiring Status  | Notes                                                                                                                              |
| ---------------- | -------------------------------------------------------- | ------------------ | ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `EvaluationForm` | `apps/client/src/components/patients/EvaluationForm.tsx` | (Inline Component) | `Camera`/`Video` | ✅ Wired       | Embeds `VideoRecorder`. Uploads to `mediaApi.uploadPostureVideo`.                                                                  |
| `PatientProfile` | `apps/client/src/components/patients/PatientProfile.tsx` | "Video"            | `Video`          | ✅ Wired       | Props `onCaptureVideo` handled in `PatientDetail.tsx` -> opens `VideoRecorder` dialog -> uploads to `mediaApi.uploadPostureVideo`. |
| `VideoRecorder`  | `apps/client/src/components/patients/VideoRecorder.tsx`  | "Iniciar cámara"   | `Camera`         | ✅ Implemented | Base component. State machine verified.                                                                                            |

## 3. Photo Capture Buttons (Posture/Footprint/Session)

| Component             | File Path                                                                        | Label / Trigger              | Icon     | Wiring Status  | Notes                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------- | ---------------------------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `EvaluationForm`      | `apps/client/src/components/patients/EvaluationForm.tsx`                         | "Capturar Postura"           | `Camera` | ⚠️ Miswired?   | Opens `CameraCapture` (posture overlay). Uploads to `mediaApi.uploadFootprint`. **Issue:** Saves as footprint. |
| `EvaluationForm`      | `apps/client/src/components/patients/EvaluationForm.tsx`                         | "Capturar Izquierdo/Derecho" | `Camera` | ✅ Wired       | Opens `CameraCapture` (footprint overlay). Uploads to `mediaApi.uploadFootprint`.                              |
| `PatientProfile`      | `apps/client/src/components/patients/PatientProfile.tsx`                         | "Huella"                     | `Camera` | ✅ Wired       | Opens `CameraCapture`. Internal handler calls `mediaApi.uploadFootprint`.                                      |
| `SessionForm`         | `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`         | "Capturar"                   | `Camera` | ✅ Wired       | Opens `SessionPhotoCapture`. Stores locally until session save.                                                |
| `SessionPhotoGallery` | `apps/client/src/components/patients/treatment-timeline/SessionPhotoGallery.tsx` | "Añadir Foto"                | `Camera` | ✅ Wired       | Opens capture flow.                                                                                            |
| `CameraCapture`       | `apps/client/src/components/patients/CameraCapture.tsx`                          | "Activar cámara"             | `Camera` | ✅ Implemented | Base component. State machine verified.                                                                        |

## 4. State Management Verification

| Component       | State Pattern                                               | Status      | Notes                                            |
| --------------- | ----------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `VoiceRecorder` | `idle` → `recording` → `playback` → `confirming`            | ✅ Verified | Uses `useRef` for chunks. `MediaRecorder` API.   |
| `VideoRecorder` | `idle` → `requesting` → `recording` → `preview` → `confirm` | ✅ Verified | Uses `useRef`. Includes timer and camera toggle. |
| `CameraCapture` | `idle` → `requesting` → `previewing` → `captured` → `error` | ✅ Verified | Uses `canvas` for capture. Includes overlays.    |

## 5. Error Handling

- **Permission Errors**: All components handle `NotAllowedError` with user-friendly Spanish toast messages.
- **Device Errors**: `NotFoundError` handled in `VideoRecorder`.
- **UI Feedback**: Toasts used consistently for success/error feedback.

## 6. Findings & Recommendations

1.  **Posture Photo Miswiring**: The "Capturar Postura" button in `EvaluationForm` saves images using `mediaApi.uploadFootprint` and adds them to the `footprints` state. This means posture photos appear in the "Huella Plantar" gallery.
    - **Recommendation**: Create `uploadPosturePhoto` endpoint or clarify if `uploadFootprint` is intended to be generic (e.g., `uploadEvaluationPhoto`). Separate the UI display for Posture vs Footprints.

2.  **API Consistency**:
    - `uploadPostureVideo` exists (Gait).
    - `uploadFootprint` exists (Footprint).
    - `uploadPosturePhoto` is missing (Static Posture).

3.  **General Health**:
    - All identified buttons are wired to functional components.
    - No "Coming soon" placeholders found in critical paths.
    - State management is robust and consistent.

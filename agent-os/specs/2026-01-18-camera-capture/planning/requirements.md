# Spec Requirements: Camera Capture Component

## Initial Description

From Roadmap Task 7.2: "Frontend: Camera capture component"

Part of Week 7 "Media & Dictation" milestone. Goal: Enable therapists to capture clinical photos (posture, footprints) during evaluations using the device camera. This is a core feature for the "Guided Visual Capture" experience described in the product mission.

**Milestone 3 Target:** "I can take photos and dictate notes"

## Requirements Discussion

### First Round Questions

**Q1:** I assume this is for capturing clinical photos (posture, footprints) as part of evaluations. Is that correct, or should it also support general patient photos?
**Answer:** Yes, primarily for clinical photos (posture, footprints) as part of evaluations. Should also support general patient profile photos via the same component with different configuration.

**Q2:** Should we create a generic `CameraCapture` component or specific variants like `PostureCameraCapture`?
**Answer:** Generic `CameraCapture` component with configuration props (overlay type, facing mode). One component serves multiple contexts.

**Q3:** Should the component include ghost overlays for guided capture?
**Answer:** Yes. Include posture silhouette overlay (4 views: anterior, posterior, left lateral, right lateral) in Phase 1. Footprint overlay deferred to later.

**Q4:** Do we need front/back camera switching?
**Answer:** Yes. Default to rear camera (`environment`) for posture photos. Include toggle button for front camera when needed.

**Q5:** Should photos auto-upload immediately or go through a review flow?
**Answer:** Review flow (Preview → Confirm), matching the VoiceRecorder pattern. User captures, previews, then confirms or retakes before the blob is returned.

**Q6:** Should the component return the Blob via callback or handle upload internally?
**Answer:** Return Blob via `onCapture` callback. Parent component handles upload context (knows patient ID, evaluation ID, which endpoint to call).

**Q7:** Should users be able to capture multiple photos in succession for 4-view posturogram?
**Answer:** Single photo per capture session. User confirms each photo individually, then can quickly re-open camera for next view. Simpler UX and matches clinical workflow (patient repositions between views).

**Q8:** What's explicitly OUT OF SCOPE?
**Answer:**

- Video recording (separate task 7.6)
- Image editing/cropping
- Footprint overlay (later phase)
- AI posture analysis (Part 2)
- Offline storage/sync (Part 4)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: VoiceRecorder - Path: `apps/client/src/components/patients/VoiceRecorder.tsx`
  - State machine pattern (idle → recording → playback → confirming)
  - Permission handling with user-friendly Spanish error messages
  - Blob callback pattern (`onRecordingComplete`)
  - Preview before confirm UX
- Feature: BodySilhouette - Path: `apps/client/src/components/patients/BodySilhouette.tsx`
  - SVG body outline that can be adapted for camera overlay
- Feature: MediaController - Path: `apps/server/src/modules/media/media.controller.ts`
  - Backend endpoints ready for uploads
  - `POST /media/patients/:patientId/photos`
  - `POST /media/evaluations/:evaluationId/footprints`

- Feature: MediaGallery - Path: `product-plan/sections/pacientes/components/MediaGallery.tsx`
  - Display pattern for captured photos

- Components to reuse: Dialog (Shadcn), Button, useToast hook

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

- Follow existing app design patterns (Shadcn/UI, Tailwind)
- Reference VoiceRecorder.tsx for UI state patterns (recording indicator, confirm/cancel buttons)
- Use teal accent color for confirm actions (matching VoiceRecorder)
- Use rose/red for recording/active states

## Requirements Summary

### Functional Requirements

**Core Capture Flow:**

- Access device camera via MediaDevices API (getUserMedia)
- Display live camera preview in component
- Capture photo via Canvas API (toDataURL as JPEG)
- Show captured photo preview with Confirm/Retake options
- Return Blob via `onCapture(blob, metadata)` callback on confirm
- Clean up camera stream on unmount or cancel

**Camera Controls:**

- Toggle between front (`user`) and rear (`environment`) facing cameras
- Default to rear camera for posture photos
- Remember camera preference during session

**Permission Handling:**

- Request camera permission on first use
- Handle denied permission with clear instructions (Spanish)
- Handle NotFoundError (no camera), NotReadableError (camera in use)
- Show permission prompt UI before attempting camera access

**Posture Overlay System:**

- Semi-transparent SVG silhouette overlay on camera preview
- Four posture views: Anterior, Posterior, Left Lateral, Right Lateral
- Overlay selector UI (tabs or buttons) to switch views
- Silhouette helps user align patient for consistent photos

**UI States:**

1. `idle` - Initial state, show "Start Camera" or permission prompt
2. `requesting` - Requesting camera permission
3. `previewing` - Live camera feed with overlay
4. `captured` - Showing captured photo, Confirm/Retake buttons
5. `error` - Permission denied or camera error

**Metadata Returned:**

```typescript
interface PhotoMetadata {
  width: number;
  height: number;
  timestamp: Date;
  facingMode: 'user' | 'environment';
  overlayType: string;
}
```

### Component API

```typescript
interface CameraCaptureProps {
  /** Called when user confirms a captured photo */
  onCapture: (blob: Blob, metadata: PhotoMetadata) => void;
  /** Called when user cancels/closes the camera */
  onCancel?: () => void;
  /** Overlay guide to show over camera preview */
  overlayType?: PostureView | 'footprint' | 'none';
  /** Initial camera facing mode */
  defaultFacingMode?: 'user' | 'environment';
  /** Additional CSS classes */
  className?: string;
}

type PostureView =
  | 'posture-anterior'
  | 'posture-posterior'
  | 'posture-lateral-left'
  | 'posture-lateral-right';
```

### Reusability Opportunities

- **VoiceRecorder pattern**: Reuse state machine approach, permission handling pattern, Blob callback interface
- **BodySilhouette SVG**: Adapt existing body outline for overlay (may need simplification)
- **Shadcn components**: Button, Dialog (if modal), useToast for errors
- **Error messages**: Match Spanish locale and tone from VoiceRecorder

### Scope Boundaries

**In Scope:**

- Photo capture via getUserMedia + Canvas
- Camera permission handling with friendly error messages
- Front/back camera switching
- Posture silhouette overlay (4 views)
- Preview → Confirm flow
- Return Blob via callback
- Responsive design (tablet-first)
- Spanish language UI
- Unit tests for component states

**Out of Scope:**

- Video recording (task 7.6 - separate spec)
- Image editing/cropping
- Footprint overlay (future phase)
- AI posture analysis (Part 2: AI Infrastructure)
- Offline storage/sync (Part 4: PWA)
- Direct upload to backend (parent handles)
- Gallery display (MediaGallery handles)

### Technical Considerations

**Browser APIs:**

- `navigator.mediaDevices.getUserMedia()` for camera access
- `navigator.permissions.query()` for permission state check
- Canvas API for frame capture (`toDataURL('image/jpeg', 0.92)`)
- `facingMode` constraint for camera selection

**PWA Requirements:**

- Must work over HTTPS (already configured)
- Use `playsInline` attribute on video element for iOS
- Handle iOS Safari PWA limitations gracefully

**Mobile Considerations:**

- Touch-friendly capture button (large tap target)
- Responsive overlay sizing
- Handle device rotation (optional, can lock to portrait)

**Performance:**

- Stop camera stream when not in use
- Clean up object URLs to prevent memory leaks
- Use appropriate JPEG quality (0.92 balance of quality/size)

**Integration Points:**

- Will be consumed by EvaluationForm (posture photos)
- Will be consumed by PatientProfile (patient photos)
- Callbacks wire to existing `onCaptureHuella`, `onCaptureVideo` props
- Backend MediaController ready for uploads

### Error Handling

| Error Type           | User Message (Spanish)                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| NotAllowedError      | "Permiso de cámara denegado. Por favor, habilita el acceso en la configuración del navegador." |
| NotFoundError        | "No se encontró ninguna cámara. Por favor, conecta una cámara e intenta de nuevo."             |
| NotReadableError     | "La cámara está en uso por otra aplicación. Por favor, cierra otras apps que usen la cámara."  |
| OverconstrainedError | "La cámara no soporta la configuración solicitada."                                            |
| SecurityError        | "Acceso a cámara bloqueado. Esta función requiere HTTPS."                                      |
| Generic              | "Error al acceder a la cámara. Por favor, intenta de nuevo."                                   |

### Acceptance Criteria

1. **Permission Flow**: User sees clear permission prompt before camera activates
2. **Camera Preview**: Live camera feed displays with correct aspect ratio
3. **Overlay Display**: Posture silhouette overlay visible and aligned on preview
4. **View Switching**: User can switch between 4 posture overlay views
5. **Camera Toggle**: User can switch between front/back cameras
6. **Photo Capture**: Tapping capture button freezes frame for review
7. **Review Flow**: User can confirm or retake captured photo
8. **Blob Callback**: On confirm, parent receives Blob and metadata
9. **Cancel Flow**: User can cancel and close camera at any point
10. **Error Handling**: Friendly Spanish error messages for all failure modes
11. **Cleanup**: Camera stream stops when component unmounts
12. **Mobile Ready**: Works on iPad Safari (primary device per mission)
13. **Responsive**: Overlay scales appropriately on different screen sizes

### Files to Create/Modify

**New Files:**

- `apps/client/src/components/patients/CameraCapture.tsx` - Main component
- `apps/client/src/components/patients/CameraCapture.test.tsx` - Unit tests
- `apps/client/src/components/patients/overlays/PostureOverlay.tsx` - SVG overlay component

**Files to Modify:**

- `apps/client/src/types/patient.ts` - Add PhotoMetadata type if needed
- `apps/client/src/components/patients/EvaluationForm.tsx` - Wire CameraCapture
- `apps/client/src/components/patients/PatientProfile.tsx` - Wire CameraCapture

# Task Breakdown: Camera Capture Component

## Overview

Total Tasks: 5 Task Groups, ~20 Sub-tasks

**Note:** This is a frontend-only feature. The backend MediaController already exists with upload endpoints. No database or API changes required.

## Task List

### Foundation Layer

#### Task Group 1: Types and Utilities

**Dependencies:** None

- [x] 1.0 Complete foundation layer
  - [x] 1.1 Add TypeScript types for camera capture
    - Add `PhotoMetadata` interface to `types/patient.ts`
    - Add `CameraCaptureState` type (`idle` | `requesting` | `previewing` | `captured` | `error`)
    - Add `PostureView` type for overlay variants
    - Add `CameraCaptureProps` interface
  - [x] 1.2 Create camera error utility
    - Create `getCameraErrorMessage(error: unknown): string` function
    - Return Spanish error messages for NotAllowedError, NotFoundError, NotReadableError, etc.
    - Follow error message pattern from VoiceRecorder.tsx
  - [x] 1.3 Verify types compile without errors
    - Run `pnpm --filter client exec tsc --noEmit`
    - Ensure no TypeScript errors in new type definitions

**Acceptance Criteria:**

- Types compile without errors
- Error utility returns appropriate Spanish messages
- Follows existing type patterns in codebase

---

### Core Component Layer

#### Task Group 2: CameraCapture Component

**Dependencies:** Task Group 1

- [x] 2.0 Complete CameraCapture component
  - [x] 2.1 Write 4-6 focused tests for CameraCapture
    - Test idle state renders start camera button
    - Test error state displays error message
    - Test captured state shows confirm/retake buttons
    - Test onCancel callback is invoked on cancel
    - Test onCapture callback receives blob and metadata on confirm
    - Mock `navigator.mediaDevices.getUserMedia`
  - [x] 2.2 Implement camera access and preview
    - Create `CameraCapture.tsx` in `components/patients/`
    - Use `getUserMedia({ video: { facingMode }, audio: false })`
    - Render `<video>` element with `autoPlay`, `playsInline`, `muted` attributes
    - Store stream in `useRef` for cleanup
    - Add cleanup effect to stop tracks on unmount
  - [x] 2.3 Implement state machine
    - Implement 5 states: `idle`, `requesting`, `previewing`, `captured`, `error`
    - Render different UI for each state
    - Follow VoiceRecorder pattern for state transitions
    - Handle permission denied → error state transition
  - [x] 2.4 Implement photo capture flow
    - Create hidden `<canvas>` element for frame capture
    - Capture frame with `canvas.toDataURL('image/jpeg', 0.92)`
    - Convert dataURL to Blob for callback
    - Freeze video on capture, show captured image
    - Implement confirm → invoke `onCapture(blob, metadata)`
    - Implement retake → resume live preview
  - [x] 2.5 Implement camera toggle
    - Add button to switch between `user` and `environment` facingMode
    - Stop current stream before switching
    - Restart stream with new facingMode
    - Show current camera mode indicator
  - [x] 2.6 Implement permission handling UI
    - Show permission prompt in `idle` state
    - Display error message in `error` state with instructions
    - Use `getCameraErrorMessage()` utility from Task 1.2
    - Add "Reintentar" button to retry camera access
  - [x] 2.7 Style component following design patterns
    - Use Shadcn Button with `variant="default"` (teal) for confirm
    - Use Shadcn Button with `variant="outline"` for retake/cancel
    - Use rose accent for active camera indicator
    - Ensure 44x44px minimum touch targets
    - Add responsive container for camera preview
  - [x] 2.8 Run CameraCapture tests
    - Run tests from 2.1 only
    - Verify all 4-6 tests pass

**Acceptance Criteria:**

- All 4-6 tests pass
- Camera access works on desktop and mobile browsers
- State machine transitions correctly
- Photo capture produces valid JPEG Blob
- Camera toggle switches between front/back
- Spanish error messages display correctly

---

### Overlay System Layer

#### Task Group 3: PostureOverlay Component

**Dependencies:** Task Group 2

- [x] 3.0 Complete PostureOverlay component
  - [x] 3.1 Write 2-4 focused tests for PostureOverlay
    - Test renders SVG with correct viewBox
    - Test anterior view shows front-facing silhouette
    - Test view prop changes rendered silhouette
    - Test overlay is semi-transparent
  - [x] 3.2 Create PostureOverlay component
    - Create `overlays/PostureOverlay.tsx` in `components/patients/`
    - Accept `view` prop: `anterior` | `posterior` | `lateral-left` | `lateral-right`
    - Render SVG with body silhouette path
    - Extract/adapt SVG path from BodySilhouette.tsx
  - [x] 3.3 Create SVG paths for each view
    - Anterior view: front-facing body outline
    - Posterior view: back-facing body outline (mirror of anterior)
    - Left Lateral view: side profile facing left
    - Right Lateral view: side profile facing right
    - Use `stroke-white/50` or similar for visibility on camera feed
  - [x] 3.4 Implement overlay selector UI
    - Add segmented button group to CameraCapture
    - Four buttons: Anterior, Posterior, Izq., Der.
    - Highlight selected view
    - Update overlay on selection
  - [x] 3.5 Integrate overlay with CameraCapture
    - Position overlay absolutely over video element
    - Scale overlay to fit video container
    - Include selected view in PhotoMetadata
  - [x] 3.6 Run PostureOverlay tests
    - Run tests from 3.1 only
    - Verify all 2-4 tests pass

**Acceptance Criteria:**

- All 2-4 tests pass
- Four posture views render correctly
- Overlay visible over camera preview
- View selector switches overlay correctly
- Overlay scales responsively

---

### Integration Layer

#### Task Group 4: Wire to Consuming Components

**Dependencies:** Task Groups 2-3

- [x] 4.0 Complete integration with existing components
  - [x] 4.1 Create media API service (if not exists)
    - Create `api/media.ts` with upload functions
    - `uploadPatientPhoto(patientId, blob)` → `POST /media/patients/:patientId/photos`
    - `uploadFootprint(evaluationId, blob, type)` → `POST /media/evaluations/:evaluationId/footprints`
    - Use existing axios instance with auth headers
  - [x] 4.2 Wire CameraCapture to EvaluationForm
    - Add camera capture trigger button in Posturogram tab
    - Open CameraCapture in dialog or inline
    - Handle `onCapture` → call media API to upload
    - Show success toast on upload complete
    - Handle upload errors with toast
  - [x] 4.3 Wire CameraCapture to PatientProfile
    - Add camera capture option for patient profile photo
    - Handle `onCapture` → call media API
    - Update patient display after successful upload
  - [x] 4.4 Verify integration manually
    - Test camera opens from EvaluationForm
    - Test camera opens from PatientProfile
    - Test photo uploads successfully
    - Test error handling shows toasts

**Acceptance Criteria:**

- CameraCapture accessible from EvaluationForm
- CameraCapture accessible from PatientProfile
- Photos upload to backend successfully
- Success/error feedback via toast notifications

---

### Testing Layer

#### Task Group 5: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-4

- [x] 5.0 Review tests and fill critical gaps
  - [x] 5.1 Review tests from Task Groups 2-3
    - Review 4-6 tests from CameraCapture (Task 2.1)
    - Review 2-4 tests from PostureOverlay (Task 3.1)
    - Total existing tests: 6-10 tests
  - [x] 5.2 Analyze test coverage gaps
    - Identify untested critical paths
    - Focus on camera permission flow
    - Focus on capture → confirm → callback flow
    - Focus on overlay view switching
  - [x] 5.3 Write up to 5 additional tests if needed
    - Add integration tests for capture flow if gaps exist
    - Test facingMode toggle behavior
    - Test cleanup on unmount
    - Do NOT write exhaustive edge case tests
  - [x] 5.4 Run all feature-specific tests
    - Run CameraCapture.test.tsx
    - Run PostureOverlay.test.tsx
    - Expected total: 8-15 tests maximum
    - Verify all tests pass

**Acceptance Criteria:**

- All 8-15 feature-specific tests pass
- Critical capture flow is covered
- Permission handling is tested
- No more than 5 additional tests added

---

## Execution Order

Recommended implementation sequence:

1. **Foundation Layer** (Task Group 1) - Types and utilities first
2. **Core Component** (Task Group 2) - Main CameraCapture component
3. **Overlay System** (Task Group 3) - PostureOverlay and view selector
4. **Integration** (Task Group 4) - Wire to EvaluationForm and PatientProfile
5. **Test Review** (Task Group 5) - Fill gaps and final verification

## Files to Create

| File                                                                   | Task Group |
| ---------------------------------------------------------------------- | ---------- |
| `apps/client/src/components/patients/CameraCapture.tsx`                | 2          |
| `apps/client/src/components/patients/CameraCapture.test.tsx`           | 2          |
| `apps/client/src/components/patients/overlays/PostureOverlay.tsx`      | 3          |
| `apps/client/src/components/patients/overlays/PostureOverlay.test.tsx` | 3          |
| `apps/client/src/api/media.ts`                                         | 4          |

## Files to Modify

| File                                                     | Task Group | Changes                                     |
| -------------------------------------------------------- | ---------- | ------------------------------------------- |
| `apps/client/src/types/patient.ts`                       | 1          | Add PhotoMetadata, CameraCaptureProps types |
| `apps/client/src/components/patients/EvaluationForm.tsx` | 4          | Add camera capture trigger                  |
| `apps/client/src/components/patients/PatientProfile.tsx` | 4          | Add camera capture option                   |

## Estimated Effort

| Task Group        | Estimated Time |
| ----------------- | -------------- |
| 1. Foundation     | 30 min         |
| 2. Core Component | 2-3 hours      |
| 3. Overlay System | 1-2 hours      |
| 4. Integration    | 1 hour         |
| 5. Test Review    | 30 min         |
| **Total**         | **5-7 hours**  |

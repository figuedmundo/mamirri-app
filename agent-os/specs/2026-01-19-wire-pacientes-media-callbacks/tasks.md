# Task Breakdown: Wire Pacientes Media Callbacks

## Overview

Total Tasks: 15

**Note:** This is a frontend-only implementation. Backend endpoints (`uploadPostureVideo`, `uploadFootprint`) already exist and are tested.

## Task List

### Foundation Layer

#### Task Group 1: Types and Interfaces

**Dependencies:** None

- [x] 1.0 Complete type definitions
  - [x] 1.1 Add VideoMetadata interface to `types/patient.ts`
    - Fields: `durationSeconds`, `facingMode`, `width`, `height`, `timestamp`, `type`
    - Follow PhotoMetadata pattern from same file
  - [x] 1.2 Add VideoRecorderState type to `types/patient.ts`
    - States: `'idle' | 'requesting' | 'recording' | 'preview' | 'confirm'`
    - Follow CameraCaptureState pattern
  - [x] 1.3 Extend PostureView union type with footprint overlays
    - Add `'footprint-left'` and `'footprint-right'` values
    - Update CameraCaptureProps overlayType to include new values
  - [x] 1.4 Add VideoRecorderProps interface
    - Props: `onCapture`, `onCancel`, `maxDuration`, `className`
    - Follow VoiceRecorderProps pattern

**Acceptance Criteria:**

- TypeScript compiles without errors
- New types are exported and available for import
- Types match existing patterns in codebase

---

### Component Layer

#### Task Group 2: VideoRecorder Component

**Dependencies:** Task Group 1

- [x] 2.0 Complete VideoRecorder component
  - [x] 2.1 Write 4-6 focused tests for VideoRecorder
    - Test initial idle state renders correctly
    - Test recording state transition and timer display
    - Test preview state shows video playback
    - Test onCapture callback receives blob and metadata
    - Test onCancel callback fires correctly
    - Test 30-second auto-stop behavior
  - [x] 2.2 Create VideoRecorder.tsx component structure
    - Implement state machine: `idle → requesting → recording → preview → confirm`
    - Reuse VoiceRecorder state pattern with RecorderState type
    - Add useRef for mediaRecorder, videoChunks, timer, videoElement
    - Include cleanup in useEffect return
  - [x] 2.3 Implement camera access and recording logic
    - Use `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`
    - Configure MediaRecorder with `video/webm` mimeType
    - Handle ondataavailable to collect video chunks
    - Handle onstop to create blob and object URL
  - [x] 2.4 Build recording UI with live preview
    - Show live camera feed during recording
    - Display duration countdown (30s → 0s)
    - Include animated recording indicator (rose pulse)
    - Add Stop/Cancel buttons matching VoiceRecorder layout
  - [x] 2.5 Implement preview and confirmation UI
    - Show video playback with controls after recording
    - Display duration and "Grabación completada" message
    - Add Confirm (teal) and Retake (outline) buttons
    - Match VoiceRecorder playback UI pattern
  - [x] 2.6 Add front/back camera toggle
    - Reuse CameraCapture toggle pattern with facingMode state
    - Stop current stream before switching cameras
    - Position toggle button in top-right corner
  - [x] 2.7 Implement permission error handling
    - Handle NotAllowedError with Spanish toast message
    - Handle NotFoundError for missing camera
    - Show retry button on error state
  - [x] 2.8 Ensure VideoRecorder tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify component renders in all states
    - Do NOT run entire test suite

**Acceptance Criteria:**

- The 4-6 tests written in 2.1 pass
- Component handles full recording lifecycle
- Camera toggle works on mobile devices
- 30-second limit enforced with auto-stop
- Spanish UI text throughout

---

#### Task Group 3: Footprint Overlay Enhancement

**Dependencies:** Task Group 1

- [x] 3.0 Complete footprint overlay
  - [x] 3.1 Write 2-4 focused tests for footprint overlay
    - Test footprint-left overlay renders correct SVG path
    - Test footprint-right overlay renders mirrored SVG path
    - Test overlay visibility and opacity
  - [x] 3.2 Create foot silhouette SVG paths
    - Design plantar (bottom) view foot outline
    - Create left foot path data
    - Create right foot path (mirror of left)
    - Use same stroke styling as posture overlays
  - [x] 3.3 Update PostureOverlay component
    - Add footprint-left and footprint-right cases to getPathForView
    - Use appropriate viewBox for foot proportions
    - Maintain semi-transparent white stroke styling
  - [x] 3.4 Add footprint overlay toggle to CameraCapture
    - Show left/right toggle when overlayType starts with 'footprint'
    - Position toggle in top bar similar to posture view selector
    - Update activeOverlay state on toggle
  - [x] 3.5 Ensure footprint overlay tests pass
    - Run ONLY the 2-4 tests written in 3.1
    - Verify overlay renders correctly

**Acceptance Criteria:**

- The 2-4 tests written in 3.1 pass
- Foot silhouettes guide user positioning
- Left/right toggle works correctly
- Overlay visible on camera preview

---

### Integration Layer

#### Task Group 4: EvaluationForm Integration

**Dependencies:** Task Groups 2, 3

- [x] 4.0 Complete EvaluationForm media integration
  - [x] 4.1 Write 3-5 focused tests for EvaluationForm media integration
    - Test VideoRecorder section renders in form
    - Test video upload triggers on capture confirm
    - Test footprint capture section renders
    - Test footprint upload triggers on capture confirm
    - Test error toast shows on upload failure
  - [x] 4.2 Add video capture section to EvaluationForm
    - Add "Video de Marcha" section header with helper text
    - Place after orthopedic tests section
    - Include VideoRecorder component with evaluation context
    - Add state for captured video reference
  - [x] 4.3 Wire video upload callback
    - Call `mediaApi.uploadPostureVideo` on VideoRecorder confirm
    - Pass evaluationId, blob, type='gait', and duration
    - Show loading spinner during upload
    - Display success/error toast notifications
    - Store returned PostureVideo in form state
  - [x] 4.4 Add footprint capture section to EvaluationForm
    - Add "Huella Plantar" section header
    - Include CameraCapture with footprint-left overlay default
    - Add state for left and right footprint captures
    - Show thumbnails of captured footprints with retake option
  - [x] 4.5 Wire footprint upload callback
    - Call `mediaApi.uploadFootprint` on CameraCapture confirm
    - Pass evaluationId, blob, and type='initial'
    - Handle both left and right foot captures
    - Display upload status with toast notifications
    - Store returned Footprint references in form state
  - [x] 4.6 Ensure EvaluationForm integration tests pass
    - Run ONLY the 3-5 tests written in 4.1
    - Verify media sections render correctly
    - Do NOT run entire test suite

**Acceptance Criteria:**

- The 3-5 tests written in 4.1 pass
- Video capture section integrated in correct position
- Footprint capture shows left/right flow
- Upload progress and errors handled gracefully
- Captured media stored in form state

---

### Testing

#### Task Group 5: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-4

- [x] 5.0 Review existing tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 2-4
    - Review the 4-6 tests from VideoRecorder (Task 2.1)
    - Review the 2-4 tests from footprint overlay (Task 3.1)
    - Review the 3-5 tests from EvaluationForm integration (Task 4.1)
    - Total existing tests: approximately 9-15 tests
  - [x] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack coverage
    - Focus on end-to-end capture → upload → display flow
    - Check permission error handling coverage
    - Verify camera toggle and duration limit edge cases
  - [x] 5.3 Write up to 6 additional strategic tests maximum
    - Add tests for identified critical gaps only
    - Focus on integration points between components
    - Test upload error recovery flow
    - Test component cleanup on unmount
  - [x] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature
    - Expected total: approximately 15-21 tests maximum
    - Verify critical workflows pass
    - Do NOT run entire application test suite
  - [x] 5.5 Run LSP diagnostics on changed files
    - Verify no TypeScript errors in new/modified files
    - Check VideoRecorder.tsx, PostureOverlay.tsx, EvaluationForm.tsx
    - Confirm types/patient.ts has no type errors

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 15-21 tests total)
- Critical capture → upload workflows covered
- No more than 6 additional tests added
- No TypeScript/LSP errors in changed files

---

## Execution Order

Recommended implementation sequence:

1. **Foundation Layer (Task Group 1)** - Types first, enables type-safe development
2. **VideoRecorder Component (Task Group 2)** - Core new component
3. **Footprint Overlay (Task Group 3)** - Can run parallel to Task 2
4. **EvaluationForm Integration (Task Group 4)** - Wire everything together
5. **Test Review & Gap Analysis (Task Group 5)** - Final verification

---

## Files to Create/Modify

| File                                                              | Action | Task Group |
| ----------------------------------------------------------------- | ------ | ---------- |
| `apps/client/src/types/patient.ts`                                | Modify | 1          |
| `apps/client/src/components/patients/VideoRecorder.tsx`           | Create | 2          |
| `apps/client/src/components/patients/overlays/PostureOverlay.tsx` | Modify | 3          |
| `apps/client/src/components/patients/CameraCapture.tsx`           | Modify | 3          |
| `apps/client/src/components/patients/EvaluationForm.tsx`          | Modify | 4          |

---

## Estimated Effort

| Task Group                               | Estimate        |
| ---------------------------------------- | --------------- |
| Task Group 1: Types                      | 30 min          |
| Task Group 2: VideoRecorder              | 3-4 hours       |
| Task Group 3: Footprint Overlay          | 1.5 hours       |
| Task Group 4: EvaluationForm Integration | 2 hours         |
| Task Group 5: Test Review                | 1 hour          |
| **Total**                                | **~8-10 hours** |

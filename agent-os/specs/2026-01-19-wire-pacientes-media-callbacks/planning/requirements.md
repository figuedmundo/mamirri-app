# Spec Requirements: Wire Pacientes Media Callbacks

## Initial Description

From roadmap task 7.6:

> **7.6** Wire Pacientes: onVoiceDictation, onCaptureHuella, onCaptureVideo

This task involves wiring media capture callbacks (voice dictation, footprint capture, video capture) to the Pacientes module components, completing the "last mile" integration between existing media components and clinical forms.

## Requirements Discussion

### First Round Questions

**Q1:** I found that voice dictation is already wired in both `EvaluationForm` and `SessionForm`. Should we mark `onVoiceDictation` as complete, or are there additional places where voice dictation should be wired?
**Answer:** Mark as complete. Voice dictation is already wired in EvaluationForm and SessionForm. No additional places needed - voice notes belong to evaluations and sessions, not patient demographics.

**Q2:** For video capture (`onCaptureVideo`), I discovered there's no frontend VideoRecorder component - the backend endpoint exists but the UI doesn't. Should we create a new VideoRecorder component or defer to a future task?
**Answer:** Create a complete `VideoRecorder.tsx` component following the VoiceRecorder pattern. The backend is ready, so completing the frontend makes this task deliverable. The component should be fully functional and production-ready, not minimal.

**Q3:** For footprint capture (`onCaptureHuella`), the current implementation uses the generic `CameraCapture` component without a specialized footprint overlay. Should we add a specialized overlay?
**Answer:** Yes, add a specialized `footprint` overlay to `CameraCapture` and wire in `EvaluationForm`. A foot silhouette overlay helps therapists position the foot consistently for before/after comparisons.

**Q4:** Which specific components need the media callbacks wired?
**Answer:**

- `EvaluationForm` - Footprint capture and Video capture (voice already done)
- `SessionForm` - Voice already done, no additional media needed
- `CaseDetailLayout` - None (orchestration wrapper only)
- `PatientForm` - None (demographics only)

**Q5:** For video capture, what's the primary use case and specifications?
**Answer:**

- Purpose: Gait and movement analysis
- Duration: 30 seconds maximum
- Format: WebM (MediaRecorder default)
- Overlays: None during recording (movement is dynamic)
- Storage: Linked to Evaluation entity

**Q6:** Is there anything that should be explicitly excluded from this task's scope?
**Answer:** Yes - video playback with slow-motion (Week 21), AI-powered gait analysis (Part 2), video trimming/editing, footprint pressure heatmap analysis (Week 19), offline video capture with sync (Week 8 PWA), real-time pose detection.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: VoiceRecorder - Path: `apps/client/src/components/patients/VoiceRecorder.tsx`
  - State machine pattern: idle → recording → playback → confirming
  - MediaRecorder API usage
  - Blob callback pattern
  - Permission error handling

- Feature: CameraCapture - Path: `apps/client/src/components/patients/CameraCapture.tsx`
  - Camera access and toggle logic
  - Overlay system with `overlayType` prop
  - Canvas-based capture
  - Preview before confirm UX

- Feature: Media API - Path: `apps/client/src/api/media.ts`
  - `uploadPostureVideo` endpoint ready
  - `uploadFootprint` endpoint ready
  - FormData construction patterns

- Feature: EvaluationForm - Path: `apps/client/src/components/patients/EvaluationForm.tsx`
  - VoiceRecorder integration pattern
  - State management for media blobs
  - Toast notifications for errors

- Feature: Backend Media Controller - Path: `apps/server/src/modules/media/media.controller.ts`
  - Video upload endpoint ready
  - Footprint upload endpoint ready
  - File validation configured (MP4, WebM, QuickTime up to 100MB)

### Follow-up Questions

**Follow-up 1:** By "minimal" VideoRecorder, do you need another session for a complete component?
**Answer:** No. "Minimal" meant feature-minimal (no slow-motion, no trimming), not incomplete. The VideoRecorder will be fully functional and production-ready in this single spec, following the VoiceRecorder pattern exactly.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Follow existing patterns:

- VoiceRecorder UI patterns (button styling, state indicators, color scheme)
- CameraCapture overlay rendering
- Teal accent (`bg-teal-600`) for primary confirm actions
- Touch-friendly button sizes (min 44x44px tap targets)

## Requirements Summary

### Functional Requirements

#### 1. Voice Dictation (`onVoiceDictation`) - COMPLETE

- Already wired in `EvaluationForm` and `SessionForm`
- TranscriptionDisplay component shows results
- Backend Whisper/Groq transcription operational
- **No additional work required**

#### 2. Video Capture (`onCaptureVideo`) - NEW COMPONENT REQUIRED

**VideoRecorder.tsx Component:**

- Full state machine: `idle → requesting → recording → preview → confirm`
- Live camera preview during recording
- Recording with MediaRecorder API (WebM format)
- Duration tracking with visual countdown
- Auto-stop at 30 seconds
- Video playback preview before confirming
- Confirm/Retake action buttons
- Front/back camera toggle
- Permission handling with Spanish error messages
- `onCapture(blob: Blob, metadata: VideoMetadata)` callback
- `onCancel()` optional callback
- Graceful error handling

**VideoMetadata Interface:**

```typescript
interface VideoMetadata {
  durationSeconds: number;
  facingMode: 'user' | 'environment';
  width: number;
  height: number;
  timestamp: Date;
}
```

**Integration in EvaluationForm:**

- Add VideoRecorder to evaluation capture section
- Upload via `mediaApi.uploadPostureVideo` on confirm
- Show upload progress and success/error states
- Store video reference in evaluation data

#### 3. Footprint Capture (`onCaptureHuella`) - OVERLAY ENHANCEMENT

**CameraCapture Overlay Enhancement:**

- Add `'footprint-left'` and `'footprint-right'` overlay types
- Create SVG foot silhouette for plantar (bottom) view
- Toggle between left/right foot
- Guide positioning for consistent capture

**Integration in EvaluationForm:**

- Add footprint capture section (if not already present)
- Use CameraCapture with footprint overlay
- Upload via `mediaApi.uploadFootprint` on confirm
- Capture both feet for complete assessment

### Reusability Opportunities

- State machine from `VoiceRecorder.tsx` → `VideoRecorder.tsx`
- Camera access logic from `CameraCapture.tsx` → `VideoRecorder.tsx`
- Overlay system in `CameraCapture.tsx` → add footprint overlays
- Upload patterns from `media.ts` API client
- Form integration patterns from `EvaluationForm.tsx`

### Scope Boundaries

**In Scope:**

- Complete VideoRecorder component (production-ready)
- Footprint overlay types for CameraCapture
- Wiring in EvaluationForm
- Upload integration with existing backend endpoints
- Error handling and loading states
- Spanish UI text

**Out of Scope:**

- Video playback with slow-motion (Week 21 - VideoAnalysis)
- AI-powered gait analysis (Part 2: AI Infrastructure)
- Video trimming or editing
- Footprint pressure heatmap analysis (Week 19 - HuellaAnalysis)
- Offline video capture with background sync (Week 8 PWA)
- Real-time pose detection during recording
- Multi-camera recording
- Video thumbnails in gallery
- Pause/resume during recording
- SessionForm video integration (not needed for treatment sessions)

### Technical Considerations

**Browser APIs:**

- `navigator.mediaDevices.getUserMedia()` for camera access
- `MediaRecorder` API for video recording
- Canvas API not needed (direct blob from MediaRecorder)

**File Handling:**

- Video format: WebM (browser native)
- Max duration: 30 seconds
- Max file size: Handled by backend (100MB limit)
- Blob passed to parent via callback

**Backend Integration:**

- Endpoints already exist and are tested
- `POST /api/v1/media/evaluations/:evaluationId/posture-videos`
- `POST /api/v1/media/evaluations/:evaluationId/footprints`

**Existing Patterns to Follow:**

- Permission error messages in Spanish (from VoiceRecorder)
- Cleanup on unmount (stop streams, clear intervals)
- useRef for media elements
- Toast notifications for errors (useToast hook)

### Component Placement in EvaluationForm

Suggested order in form:

1. Patient info header
2. Body silhouette (posturograma)
3. Orthopedic tests
4. **Footprint capture section** ← Wire here
5. **Video capture section** ← Wire here
6. Voice recorder (already wired)
7. Pain scale
8. Observations
9. Save button

### Estimated Effort

| Task                          | Estimate      |
| ----------------------------- | ------------- |
| VideoRecorder component       | 4-5 hours     |
| Footprint overlay SVG + types | 2 hours       |
| EvaluationForm wiring         | 2 hours       |
| Testing and polish            | 1 hour        |
| **Total**                     | **~10 hours** |

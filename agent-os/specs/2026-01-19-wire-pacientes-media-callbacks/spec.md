# Specification: Wire Pacientes Media Callbacks

## Goal

Complete the "last mile" integration by wiring footprint capture and video capture callbacks to the EvaluationForm, enabling therapists to capture clinical media during patient evaluations.

## User Stories

- As a physiotherapist, I want to record a gait analysis video during evaluations so that I can document movement patterns for before/after comparison.
- As a physiotherapist, I want to capture footprint photos with guided positioning so that I can ensure consistent, comparable podoscopy images.

## Specific Requirements

**VideoRecorder Component**

- Create `VideoRecorder.tsx` following the VoiceRecorder state machine pattern: `idle → requesting → recording → preview → confirm`
- Use MediaRecorder API with WebM format (browser native, no transcoding)
- Display live camera preview during recording with duration countdown
- Implement 30-second maximum duration with visual countdown and auto-stop
- Include front/back camera toggle button (reuse CameraCapture pattern)
- Show video playback preview after recording with Confirm/Retake buttons
- Handle permissions with Spanish error messages matching VoiceRecorder
- Return video via `onCapture(blob: Blob, metadata: VideoMetadata)` callback

**VideoMetadata Interface**

- Define interface with `durationSeconds`, `facingMode`, `width`, `height`, `timestamp` fields
- Add to `types/patient.ts` following existing PhotoMetadata pattern
- Include video type field for future categorization (`gait | static | dynamic`)

**Footprint Overlay Enhancement**

- Add `'footprint-left'` and `'footprint-right'` to PostureView union type
- Create SVG foot silhouette paths for plantar (bottom) view in PostureOverlay component
- Include left/right foot toggle in CameraCapture when footprint overlay is active
- Guide positioning with semi-transparent overlay matching posture overlay opacity

**EvaluationForm Video Integration**

- Add VideoRecorder component to evaluation capture section after orthopedic tests
- Wire `onCapture` callback to `mediaApi.uploadPostureVideo` with evaluation ID
- Show upload progress spinner and success/error toast notifications
- Store returned PostureVideo reference in form state for submission
- Add section header "Video de Marcha" with descriptive helper text

**EvaluationForm Footprint Integration**

- Add CameraCapture with footprint overlay to evaluation capture section
- Include left/right foot capture flow (both feet required for complete assessment)
- Wire `onCapture` callback to `mediaApi.uploadFootprint` with evaluation ID
- Show captured footprint thumbnails with retake option
- Display upload status with toast notifications on error

**Component Styling**

- Match VoiceRecorder color scheme: rose for recording state, teal for confirm actions
- Use Shadcn Button component with appropriate variants
- Ensure touch-friendly button sizes (minimum 44x44px tap targets)
- Apply consistent dark mode support using existing slate/teal patterns

**Error Handling**

- Display Spanish permission error messages (camera/microphone access)
- Show toast notifications for upload failures with retry guidance
- Handle MediaRecorder API errors gracefully with user-friendly messages
- Implement cleanup on component unmount (stop streams, clear intervals)

## Visual Design

No visual assets provided. Follow existing patterns:

- VoiceRecorder.tsx styling for recording state indicators and button placement
- CameraCapture.tsx overlay rendering and camera toggle positioning
- PostureOverlay.tsx SVG path pattern for consistent overlay appearance
- Use `bg-teal-600 hover:bg-teal-700` for primary confirm actions
- Use `bg-rose-500` with pulse animation for active recording state

## Existing Code to Leverage

**VoiceRecorder.tsx (`apps/client/src/components/patients/VoiceRecorder.tsx`)**

- Copy state machine pattern with RecorderState type and transitions
- Reuse MediaRecorder ondataavailable and onstop handlers for blob creation
- Follow timer pattern with useRef and setInterval for duration tracking
- Replicate permission error handling with Spanish toast messages
- Match cleanup pattern in useEffect return for stream and timer resources

**CameraCapture.tsx (`apps/client/src/components/patients/CameraCapture.tsx`)**

- Extract camera access logic with getUserMedia and stream management
- Reuse front/back camera toggle with facingMode state and stopCamera pattern
- Copy overlay rendering approach with absolute positioning and pointer-events-none
- Follow preview/captured state switching for video playback display
- Replicate confirm/retake button layout with gradient overlay background

**PostureOverlay.tsx (`apps/client/src/components/patients/overlays/PostureOverlay.tsx`)**

- Extend getPathForView switch statement with footprint-left and footprint-right cases
- Follow SVG viewBox and path styling conventions for consistent appearance
- Use same opacity and stroke-white styling for camera visibility
- Maintain preserveAspectRatio="xMidYMid meet" for responsive scaling

**Media API (`apps/client/src/api/media.ts`)**

- Use uploadPostureVideo pattern for video blob submission with FormData
- Follow uploadFootprint pattern for footprint image uploads
- Maintain consistent Content-Type header and axios post structure
- Return typed response (PostureVideo, Footprint) for form state storage

**Types (`apps/client/src/types/patient.ts`)**

- Add VideoMetadata interface following PhotoMetadata structure
- Extend PostureView union type with footprint overlay values
- Reference existing PostureVideo and Footprint interfaces for API responses

## Out of Scope

- Video playback with slow-motion controls (Week 21 - VideoAnalysis component)
- AI-powered gait analysis or pose detection (Part 2: AI Infrastructure)
- Video trimming, editing, or frame extraction
- Footprint pressure heatmap analysis (Week 19 - HuellaAnalysis component)
- Offline video capture with IndexedDB queue and background sync (Week 8 PWA)
- Real-time pose skeleton overlay during recording
- Pause/resume functionality during video recording
- Video thumbnail generation for gallery display
- SessionForm video integration (treatment sessions focus on hands-on work)
- Multi-camera simultaneous recording

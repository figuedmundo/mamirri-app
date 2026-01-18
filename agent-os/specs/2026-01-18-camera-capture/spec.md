# Specification: Camera Capture Component

## Goal

Enable therapists to capture clinical photos (posture, footprints, patient profile) using the device camera with guided silhouette overlays for consistent, comparable images across evaluations.

## User Stories

- As a physiotherapist, I want to capture posture photos with alignment guides so that I can ensure consistent positioning for before/after comparisons
- As a physiotherapist, I want to preview and confirm photos before saving so that I avoid uploading blurry or incorrect images
- As a physiotherapist, I want clear feedback when camera access fails so that I understand how to resolve permission issues

## Specific Requirements

**Camera Access and Preview**

- Use native `navigator.mediaDevices.getUserMedia()` API (no external dependencies)
- Display live camera feed in a responsive container with correct aspect ratio
- Default to rear camera (`facingMode: 'environment'`) for posture capture
- Include `playsInline` and `muted` attributes on video element for iOS compatibility
- Stop camera stream on component unmount to release device resources

**Front/Back Camera Toggle**

- Provide camera switch button to toggle between `user` and `environment` facing modes
- Stop current stream before switching to prevent camera lock on mobile devices
- Show current camera mode visually (icon or label)

**Posture Overlay System**

- Render semi-transparent SVG silhouette over camera preview
- Support four overlay views: Anterior, Posterior, Left Lateral, Right Lateral
- Provide view selector UI (segmented buttons) to switch between views
- Scale overlay responsively to fit different screen sizes
- Use existing SVG path pattern from BodySilhouette component as reference

**Photo Capture Flow**

- Capture frame using Canvas API with `toDataURL('image/jpeg', 0.92)`
- Freeze preview to show captured photo for review
- Display "Confirmar" (teal) and "Repetir" (outline) action buttons
- On confirm, invoke `onCapture(blob, metadata)` callback with photo data
- On retake, resume live camera preview

**Permission Handling**

- Show permission prompt UI before requesting camera access
- Display Spanish error messages for each error type (NotAllowedError, NotFoundError, etc.)
- For denied permissions, show step-by-step instructions to enable in browser settings
- Handle all errors gracefully without crashing component

**Component State Machine**

- Implement five states: `idle`, `requesting`, `previewing`, `captured`, `error`
- Follow VoiceRecorder pattern for state transitions and UI rendering
- Only one state active at a time with clear transitions

**Component API Design**

- Accept `onCapture(blob: Blob, metadata: PhotoMetadata)` callback (required)
- Accept `onCancel()` callback for close/cancel action (optional)
- Accept `overlayType` prop to configure which overlay to display
- Accept `defaultFacingMode` prop to set initial camera direction
- Return metadata including dimensions, timestamp, facingMode, and overlayType

## Visual Design

No mockups provided. Follow existing design patterns:

- Match VoiceRecorder UI patterns (button styling, state indicators, color scheme)
- Use teal accent (`bg-teal-600`) for primary confirm actions
- Use rose/red for active recording states if needed
- Use Shadcn Button component with appropriate variants
- Ensure touch-friendly button sizes (min 44x44px tap targets)

## Existing Code to Leverage

**VoiceRecorder.tsx** (`apps/client/src/components/patients/VoiceRecorder.tsx`)

- Reuse state machine pattern (`idle` → `recording` → `playback` → `confirming`)
- Copy permission error handling approach with Spanish messages
- Follow Blob callback pattern (`onRecordingComplete` → `onCapture`)
- Replicate preview-before-confirm UX flow
- Use same useRef patterns for media element and stream cleanup

**BodySilhouette.tsx** (`apps/client/src/components/patients/BodySilhouette.tsx`)

- Extract SVG path data for body outline (`d="M100 30..."`)
- Reuse viewBox dimensions (`0 0 200 450`) as baseline for overlay
- Reference anatomical point positioning for alignment guides
- Adapt stroke styling (`stroke-slate-300`) for overlay visibility on camera

**Shadcn UI Components** (`apps/client/src/components/ui/`)

- Use `Button` component with `variant="default"` (confirm) and `variant="outline"` (retake)
- Use `useToast` hook for error notifications
- Follow `cn()` utility pattern for conditional class merging

**MediaController** (`apps/server/src/modules/media/media.controller.ts`)

- Backend endpoints ready: `POST /media/patients/:patientId/photos`
- Backend endpoints ready: `POST /media/evaluations/:evaluationId/footprints`
- Parent components will handle upload using these endpoints

## Out of Scope

- Video recording (separate task 7.6 - onCaptureVideo)
- Image editing, cropping, or rotation after capture
- Footprint-specific overlay (deferred to future phase)
- AI-powered posture analysis or auto-detection
- Offline storage or IndexedDB caching of photos
- Direct upload to backend (parent component handles API calls)
- Gallery display of captured photos (MediaGallery component handles)
- Multi-photo batch capture in single session
- Device orientation lock or rotation handling
- Photo compression beyond JPEG quality setting

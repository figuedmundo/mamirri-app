# Specification: Audio & Video Recording Buttons Wiring

## Goal

Audit all recording buttons across the application to identify their current implementation status, verify proper state management and callback wiring, and document any unwired or placeholder buttons for remediation.

## User Stories

- As a developer, I want a comprehensive inventory of all recording buttons so that I can identify and fix any unwired or broken functionality
- As a QA engineer, I want verification of state management and callback wiring so that recording flows work correctly across all user interfaces

## Specific Requirements

**Comprehensive Button Inventory**

- List all audio recording (voice dictation) buttons across Pacientes module (EvaluationForm, PatientProfile, SessionForm, ObjectiveCard, SessionDetailView)
- List all video recording buttons (gait/posture analysis) in application
- List all photo capture buttons (posture, footprint, session photos)
- Check for any recording buttons in other modules (e.g., Analisis) for consistency
- Categorize each button by recording type, location, component, and current status

**State Management Verification**

- Verify state machine implementation for each recording button (idle → requesting → recording → preview/confirm)
- Ensure states update correctly when user interacts with recording components
- Verify button visual indicators reflect current recording state (idle icon, recording indicator, completed state)
- Check for state inconsistencies between similar recording buttons

**Callback Wiring Verification**

- Verify all callbacks are properly wired: onRecordingComplete, onCapture, onCancel
- Ensure parent components handle emitted Blobs from recording components
- Verify callback methods process recordings correctly (upload, save, display)
- Check for missing callback implementations or empty placeholder functions

**Error Handling Verification**

- Verify getUserMedia permission errors are handled with user-friendly Spanish messages
- Ensure error states display via toasts or localized error messages
- Verify recording components have proper error recovery (cancel, retry)
- Check for unhandled promise rejections or silent failures

**Backend Integration Verification**

- Verify mediaApi integration for all recording types (voice notes, videos, photos)
- Ensure uploads use multipart/form-data format correctly
- Verify transcription polling is enabled for voice notes
- Check for missing upload endpoints or incorrect API usage

**Placeholder and Unwired Button Identification**

- Identify any buttons showing "Coming soon" (Próximamente) toasts
- Find buttons with placeholder implementations or no-op functions
- List buttons that trigger recording components but lack callback wiring
- Document priority fixes based on button usage frequency

**Consistency Verification**

- Ensure all recording buttons use consistent icon library (lucide-react: Mic, Camera, Video)
- Verify button labels are consistent across application (Spanish terms)
- Check for duplicate or redundant recording triggers
- Ensure state machine pattern is consistent across all recording types

**Documentation**

- Document findings in structured format with file paths, component names, and status
- Create actionable fix list for any issues found
- Provide recommendations for standardizing state management patterns
- Note any patterns that could be extracted to reusable hooks

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**VoiceRecorder component (apps/client/src/components/patients/VoiceRecorder.tsx)**

- Implements state machine pattern: idle → recording → playback → confirming
- Uses MediaRecorder API with audio/webm format and provides onRecordingComplete callback
- Serves as reference pattern for all audio recording buttons

**VideoRecorder component (apps/client/src/components/patients/VideoRecorder.tsx)**

- Implements state machine pattern: idle → requesting → recording → preview → confirm
- Supports camera switching, duration limits (30s), and provides onCapture callback with VideoMetadata
- Serves as reference pattern for all video recording buttons

**CameraCapture component (apps/client/src/components/patients/CameraCapture.tsx)**

- Implements state machine pattern: idle → requesting → previewing → captured → error
- Provides posture/footprint overlays and onCapture callback
- Serves as reference pattern for all photo capture buttons

**EvaluationForm integration (apps/client/src/components/patients/EvaluationForm.tsx)**

- Demonstrates comprehensive integration of all recording types (voice, posture, footprint left/right, gait video)
- Shows proper callback wiring patterns and state management in parent component
- Reference model for multi-recording UI implementations

**Transcription polling hook (apps/client/src/hooks/use-transcription-polling.ts)**

- Manages async transcription status with states: pending, processing, completed, failed
- Provides polling pattern for voice note transcription
- Reference for any async status tracking scenarios

**Media utilities (apps/client/src/utils/media.ts)**

- Provides getUserMedia error handling with localized Spanish messages
- Consistent error handling pattern for all recording components
- Reference for implementing error handling in new recording buttons

**Media API (apps/client/src/api/media.ts)**

- Provides uploadEvaluationVoiceNote, uploadPostureVideo, getVoiceNoteStatus methods
- Consistent multipart/form-data upload pattern
- Reference for backend integration of all recording types

## Out of Scope

- Implementing new recording features or components
- Modifying recording component behavior unless broken
- Backend API changes or new endpoints
- UI/UX redesign of existing recording interfaces
- Mobile-specific optimizations or responsive design improvements
- Automated testing of recording flows (manual verification only)
- Creating new state management hooks or refactoring existing patterns

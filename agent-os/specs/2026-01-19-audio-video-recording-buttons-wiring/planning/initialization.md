# Audio & Video Recording Buttons Wiring - Initial Idea

## Task Description (Roadmap Item 7.7)

Make a list of all buttons that record audio and video, and wire their states and methods.

## Source

- Roadmap: agent-os/product/roadmap.md
- Task: 7.7 (Week 7: Media & Dictation)

## Context

Based on codebase exploration, multiple components contain recording buttons for audio (voice dictation) and video/camera capture. These buttons trigger recording components like VoiceRecorder, VideoRecorder, and CameraCapture. The task is to:

1. Inventory all recording buttons across the application
2. Document their current state management
3. Ensure proper wiring of recording states and methods
4. Identify any unwired or placeholder buttons

## Scope

- Identify all UI buttons/trigger points for audio recording (voice dictation)
- Identify all UI buttons/trigger points for video recording
- Identify all UI buttons/trigger points for photo capture
- Document state management patterns for each recording type
- Verify callback wiring between recording components and parent components
- Ensure consistent button states (idle, recording, paused, completed)
- Validate error handling and user feedback

## Notes

- Recording components exist (VoiceRecorder, VideoRecorder, CameraCapture)
- State machine pattern is used (idle → recording → preview → confirm)
- Some buttons may show "Coming soon" or be placeholders
- Integration with backend via mediaApi for uploads
- Transcription polling for voice notes

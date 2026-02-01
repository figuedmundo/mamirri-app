# Task Breakdown: Audio & Video Recording Buttons Wiring

## Overview

Total Tasks: 7 main task groups with 18 sub-tasks

## Task List

### Discovery & Inventory

#### Task Group 1: Recording Button Discovery

**Dependencies:** None

- [x] 1.0 Complete button discovery and inventory
  - [x] 1.1 Search for all audio recording buttons in Pacientes module
    - Search EvaluationForm, PatientProfile, SessionForm, ObjectiveCard, SessionDetailView
    - Look for voice dictation buttons with Mic icon
    - Look for "Dictar nota", "Nota de Voz", "Dictado por voz" labels
  - [x] 1.2 Search for all video recording buttons
    - Search EvaluationForm gait video section
    - Search PatientProfile video button
    - Look for Video icon and "Iniciar cámara" labels
  - [x] 1.3 Search for all photo capture buttons
    - Search EvaluationForm posture/footprint capture buttons
    - Search PatientProfile huella button
    - Search SessionForm photos button
    - Look for Camera icon and "Capturar", "Añadir Foto" labels
  - [x] 1.4 Check other modules for recording buttons
    - Search Analisis module for video/camera recording
    - Search any other modules for consistency
  - [x] 1.5 Document inventory findings
    - Create comprehensive list with: file path, component, button type, label, icon, current status
    - Categorize by recording type (audio, video, photo)

**Acceptance Criteria:**

- Comprehensive inventory of all recording buttons created
- Each button documented with file path, component, type, label, icon, and status

### State Management Verification

#### Task Group 2: State Machine Verification

**Dependencies:** Task Group 1

- [x] 2.0 Verify state management implementation
  - [x] 2.1 Verify state machine for each audio recording button
    - Check for idle → recording → playback → confirming states
    - Verify state transitions are triggered correctly
    - Ensure button visual indicators reflect state (Mic icon changes)
  - [x] 2.2 Verify state machine for each video recording button
    - Check for idle → requesting → recording → preview → confirm states
    - Verify state transitions are triggered correctly
    - Ensure recording indicator shows during active recording
  - [x] 2.3 Verify state machine for each photo capture button
    - Check for idle → requesting → previewing → captured → error states
    - Verify state transitions are triggered correctly
    - Ensure preview shows before confirmation
  - [x] 2.4 Check for state inconsistencies
    - Compare state machine patterns across similar button types
    - Identify any deviations from standard pattern
    - Note buttons with incomplete or broken state machines

**Acceptance Criteria:**

- All recording buttons have verified state machine implementation
- State inconsistencies documented
- Deviations from standard pattern identified

### Callback & Integration Verification

#### Task Group 3: Callback Wiring Verification

**Dependencies:** Task Group 2

- [x] 3.0 Verify callback wiring
  - [x] 3.1 Verify audio recording callbacks
    - Check onRecordingComplete callback is wired for each VoiceRecorder instance
    - Verify parent components handle emitted Blobs correctly
    - Check for missing or empty callback implementations
  - [x] 3.2 Verify video recording callbacks
    - Check onCapture callback with VideoMetadata is wired for each VideoRecorder instance
    - Verify parent components handle video Blobs correctly
    - Check for missing or empty callback implementations
  - [x] 3.3 Verify photo capture callbacks
    - Check onCapture callback is wired for each CameraCapture instance
    - Verify parent components handle image Blobs correctly
    - Check for missing or empty callback implementations
  - [x] 3.4 Verify cancel callbacks
    - Check onCancel callback is wired for all recording components
    - Verify proper cleanup (stop streams, revoke URLs)
    - Check for missing cancel handlers

**Acceptance Criteria:**

- All callbacks properly wired
- No missing or empty callback implementations
- Cancel handlers properly clean up resources

### Error Handling Verification

#### Task Group 4: Error Handling Verification

**Dependencies:** Task Group 3

- [x] 4.0 Verify error handling implementation
  - [x] 4.1 Check getUserMedia error handling
    - Verify media.ts utility is used for error handling
    - Check for localized Spanish error messages
    - Ensure permission errors are user-friendly
  - [x] 4.2 Verify error state display
    - Check for toast notifications on errors
    - Verify error states are shown to users
    - Check for silent failures or unhandled rejections
  - [x] 4.3 Verify error recovery
    - Check for retry/cancel options on errors
    - Verify users can recover from permission denied errors
    - Check for proper cleanup after errors

**Acceptance Criteria:**

- getUserMedia errors handled with localized messages
- Error states displayed via toasts
- Users can recover from errors

### Placeholder & Unwired Button Identification

#### Task Group 5: Placeholder Button Identification

**Dependencies:** Task Group 4

- [x] 5.0 Identify unwired or placeholder buttons
  - [x] 5.1 Check for "Coming soon" toasts
    - Search for "Próximamente" toast messages
    - Identify buttons that trigger placeholder toasts
    - Note placeholder implementations
  - [x] 5.2 Check for no-op functions
    - Search for empty callback implementations
    - Identify buttons with placeholder (console.log, TODO comments)
    - Note buttons that don't trigger recording components
  - [x] 5.3 Categorize by priority
    - Prioritize based on button usage frequency
    - Identify critical user flows affected
    - Create fix priority list

**Acceptance Criteria:**

- All placeholder buttons identified
- Priority categorization completed
- Critical user flows noted

### Consistency Verification

#### Task Group 6: Consistency Verification

**Dependencies:** Task Group 5

- [x] 6.0 Verify consistency across recording buttons
  - [x] 6.1 Verify icon library consistency
    - Check all buttons use lucide-react icons (Mic, Camera, Video)
    - Identify any inconsistent icon usage
  - [x] 6.2 Verify label consistency
    - Check for consistent Spanish terminology
    - Identify duplicate or redundant labels
    - Note any terminology variations
  - [x] 6.3 Verify state machine pattern consistency
    - Compare state machine patterns across recording types
    - Identify best practices to standardize
    - Note patterns that could be extracted to reusable hooks

**Acceptance Criteria:**

- Icon library usage is consistent
- Spanish terminology is consistent
- Best practices for standardization identified

### Documentation & Reporting

#### Task Group 7: Documentation & Remediation Planning

**Dependencies:** Task Groups 1-6

- [x] 7.0 Complete documentation and create fix list
  - [x] 7.1 Create comprehensive inventory report
    - Compile all findings from Task Groups 1-6
    - Format as structured markdown report
    - Include file paths, components, types, labels, status
  - [x] 7.2 Create actionable fix list
    - List all unwired or broken buttons
    - Provide specific fix recommendations for each issue
    - Include code snippets or reference patterns for fixes
  - [x] 7.3 Provide standardization recommendations
    - Suggest reusable patterns for state management
    - Recommend consistency improvements
    - Note hooks or utilities that could be extracted
  - [x] 7.4 Save report to implementation folder
    - Save inventory report to: `implementation/inventory-report.md`
    - Save fix list to: `implementation/fix-actions.md`
    - Include findings summary

**Acceptance Criteria:**

- Comprehensive inventory report created
- Actionable fix list documented
- Standardization recommendations provided
- Reports saved to implementation folder

## Execution Order

Recommended implementation sequence:

1. **Discovery & Inventory** (Task Group 1) - Find all buttons first
2. **State Management Verification** (Task Group 2) - Verify state machines
3. **Callback & Integration Verification** (Task Group 3) - Verify wiring
4. **Error Handling Verification** (Task Group 4) - Verify error handling
5. **Placeholder & Unwired Button Identification** (Task Group 5) - Find broken buttons
6. **Consistency Verification** (Task Group 6) - Check consistency
7. **Documentation & Remediation Planning** (Task Group 7) - Document everything

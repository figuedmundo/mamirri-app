# Specification: Optimize Voice Recording Flow

## Goal

Eliminate friction in the voice note creation process by removing blocking popups, enabling one-tap recording, and implementing a non-intrusive "Dynamic Action Sheet" UI that allows users to view patient context while dictating.

## User Stories

- As a physiotherapist, I want to start recording immediately when I click "Dictar Nota" so that I don't lose my train of thought.
- As a physiotherapist, I want to see patient details while recording so that I can reference specific information during dictation.
- As a physiotherapist, I want the system to automatically transcribe and save when I stop recording so that I don't have to manually confirm every note.

## Specific Requirements

**Logic Extraction (Hook)**

- Extract core recording logic from `VoiceRecorder.tsx` into a new `useVoiceRecorder` custom hook.
- Hook must expose: `startRecording`, `stopRecording`, `cancelRecording`, `isRecording`, `duration`, `audioBlob`, `error`.
- Hook must handle permission errors gracefully with specific error codes.

**Non-Blocking UI (Dynamic Action Sheet)**

- Replace the existing Modal/Dialog with a sticky bottom bar ("Dynamic Action Sheet") component.
- The bar must appear ONLY when recording is active.
- The bar must contain:
  - Visual feedback (pulsing waveform or indicator).
  - Current duration timer (MM:SS).
  - Prominent "Stop" button (primary action).
  - Subtle "Cancel" button (secondary action).
- The rest of the screen must remain interactive (scrollable).

**One-Tap Interaction**

- Clicking the main "Dictar Nota" button triggers `startRecording` immediately.
- No intermediate "Are you sure?" or "Ready to record" screens.
- If permissions are missing, show a Toast error instead of a blocking modal.

**Auto-Save Workflow**

- Action flow: `Start` -> `Dictate` -> `Stop` -> `Auto-Transcribe` -> `Auto-Save`.
- Remove the "Review/Playback" step from the default flow.
- Show a "Note Saved" toast with an "Undo" action for 5 seconds after saving.

## Visual Design

**`planning/requirements.md` (inferred from requirements)**

- **Bottom Sheet:** Fixed position at bottom of viewport (`fixed bottom-0 left-0 right-0`).
- **Pulsing Indicator:** Red pulsing circle or waveform to indicate active recording.
- **Timer:** Monospaced font for clear duration visibility.
- **Stop Button:** Large, easy-to-hit tap target (min 44x44px).

## Existing Code to Leverage

**`apps/client/src/components/patients/VoiceRecorder.tsx`**

- Reuse `MediaRecorder` setup, blob handling, and timer logic.
- Extract this logic into `useVoiceRecorder.ts`.
- Refactor the component to use the new hook for backward compatibility.

**`apps/client/src/components/patients/CaseDetailLayout.tsx`**

- This appears to be the container where the "Dictar Nota" action lives.
- Update the action handler to trigger the new non-blocking flow instead of opening a Dialog.

**`apps/client/src/components/ui/toast.tsx`**

- Use existing Toast component for permission errors and "Saved" confirmation.

## Out of Scope

- Backend transcription API changes (assume existing endpoint works).
- Offline storage persistence (unless already handled by generic recorder).
- Visual redesign of the patient profile header (other than the button behavior).
- Playback/Review UI in the bottom sheet (this is explicitly removed for speed).

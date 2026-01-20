# Spec Requirements: Optimize Voice Recording Flow

## Initial Description

when I click on Grabar evolucion and Dictar Nota, I get a popup what it says Grabar nota de voz, and another button to start recording, that is not breaking the zero friccion rule ?

## Requirements Discussion

### First Round Questions

**Q1:** I assume you want the recording to start **immediately** when "Dictar Nota" is clicked, eliminating the intermediate "Start Recording" button. Is that correct, or should we just auto-start the recording _within_ the existing popup?
**Answer:** Yes, start immediately. The `VoiceRecorder` component already supports an `autoStart` prop. We should leverage this to bypass the "idle" state when triggered from the main action button.

**Q2:** I'm thinking we should replace the Popup with a **non-blocking UI** (like a pulsing state on the button itself or a small toast/snackbar) to maintain "Zero Friction". Should we remove the popup entirely?
**Answer:** Yes, replace the Modal/Popup with an inline state or a "Dynamic Action Sheet". A modal blocks the rest of the interface. A better pattern is the "Dynamic Island" or "Bottom Sheet" approach: when recording starts, the button expands or a small, non-intrusive panel appears at the bottom, allowing the therapist to scroll and see patient details while dictating.

**Q3:** If we remove the popup, how should the user **stop** the recording? (e.g., Click the button again? A dedicated "Stop" floating button?)
**Answer:** Tap the same button (Toggle) or a prominent "Stop" button in the sticky footer. If we use a floating/sticky recording bar, a large "Stop" button is easy to hit with one hand.

**Q4:** Do you need a "Review/Play" step after recording, or should it **automatically transcribe and save** immediately after stopping to maximize speed?
**Answer:** No, prioritize "Stop -> Transcribe -> Save". Playing back audio is slow. The "Zero Friction" flow is: Dictate -> Stop -> AI Transcribes -> User edits text _if_ necessary. We can offer an "Undo" toast for 5 seconds after saving.

**Q5:** Are there any specific scenarios where the popup _should_ still appear (e.g., first-time permission request)?
**Answer:** Only for microphone permission errors.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: VoiceRecorder component - Path: `apps/client/src/components/patients/VoiceRecorder.tsx`
- Components to potentially reuse: `VoiceRecorder.tsx` handles MediaRecorder API, blob management, and duration tracking. It has an `autoStart` prop.
- Backend logic to reference: Logic exists in `PatientProfile.tsx` for triggering the current dialog.

### Follow-up Questions

**Follow-up 1:** To implement the "Dynamic Action Sheet" / non-blocking UI, should we extract the logic from `VoiceRecorder` into a `useVoiceRecorder` hook so the UI can be completely decoupled (e.g., floating footer vs inline button)?
**Answer:** (Inferred) Yes, decoupling the logic into a hook is necessary to support flexible UI placements like a floating bottom bar without duplicating the recording logic.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

- Design direction: "Dynamic Island" or "Bottom Sheet" style.
- Key interaction: One-tap start, one-tap stop.
- Feedback: Pulsing visual indicator during recording.
- Layout: Non-blocking, allowing scrolling while recording.

## Requirements Summary

### Functional Requirements

- **One-Tap Recording:** Clicking "Dictar Nota" starts recording immediately (no intermediate popup/confirm).
- **Non-Blocking Interface:** Recording UI is non-modal (likely a bottom sheet or floating bar), allowing user to view patient info while dictating.
- **Immediate Processing:** Stopping recording immediately triggers transcription and save (no "Review/Play" step by default).
- **Visual Feedback:** Clear visual indicator that recording is active (pulsing, timer).
- **Error Handling:** Graceful handling of permission errors (toast/alert).

### Reusability Opportunities

- **VoiceRecorder.tsx:** Refactor to extract logic into `useVoiceRecorder` hook.
- **Auto-start:** Leverage existing `autoStart` prop logic.

### Scope Boundaries

**In Scope:**

- Refactoring `VoiceRecorder.tsx` to separate logic (hook) from UI.
- Implementing `useVoiceRecorder` hook.
- Creating a new `RecordingFloatingBar` or updating `VoiceRecorder` to support "minimized/floating" mode.
- Updating `PatientProfile` to use the new flow (removing the Dialog).
- Implementing the "Stop -> Transcribe -> Save" auto-sequence.

**Out of Scope:**

- Changes to the actual transcription API/backend.
- Redesigning other parts of the Patient Profile.
- Offline storage (PWA) features (unless already part of the generic recorder).

### Technical Considerations

- **State Management:** Need to manage recording state globally or high enough in the tree if navigation is allowed (though likely restricted to the current page).
- **Permissions:** Browser microphone permission handling must remain robust.
- **UX Pattern:** Bottom sticky bar is preferred for mobile-friendliness (thumb zone).

# Task Breakdown: EvaluacionForm Enhancement

## Overview

Total Tasks: 24 sub-tasks across 5 task groups

**Feature Summary:** Enhance the existing `EvaluationForm.tsx` with interactive posturogram SVG, expanded orthopedic tests (8 total), voice recording UI, debounced auto-save, and improved accessibility.

## Task List

### Types & Utilities Layer

#### Task Group 1: Type Extensions and Utility Hooks ✅ COMPLETE

**Dependencies:** None

- [x] 1.0 Complete types and utilities layer
  - [x] 1.1 Write 3 focused tests for new utilities
    - Test `useDebounce` hook with mock timers (debounces callback correctly)
    - Test `useDebounce` cancels pending calls on unmount
    - Test type compatibility of extended `OrthopedicTests` interface
  - [x] 1.2 Extend `OrthopedicTests` interface in `patient.ts`
    - Add optional fields: `ott`, `patrick`, `lasegue`, `dedoSuelo`
    - Each field uses existing `TestResult` interface
    - Ensure backward compatibility (all new fields optional)
  - [x] 1.3 Create `useDebounce` hook in `hooks/use-debounce.ts`
    - Accept callback and delay (default 300ms)
    - Return debounced function
    - Cleanup pending timeout on unmount
    - Follow existing hook patterns from `use-toast.ts`
  - [x] 1.4 Create `useUnsavedChanges` hook for navigation warning
    - Track `isDirty` state
    - Add `beforeunload` event listener when dirty
    - Cleanup on unmount
  - [x] 1.5 Ensure utility tests pass
    - Run ONLY the 3 tests written in 1.1
    - Verify hooks work in isolation

**Acceptance Criteria:**

- The 3 tests from 1.1 pass
- Types compile without errors
- Hooks can be imported and used in components
- No breaking changes to existing code

---

### UI Components Layer

#### Task Group 2: Interactive Posturogram SVG Component ✅ COMPLETE

**Dependencies:** None (can run parallel to Task Group 1)

- [x] 2.0 Complete posturogram SVG component
  - [x] 2.1 Write 4 focused tests for BodySilhouette component
    - Test renders 6 clickable anatomical points
    - Test clicking point opens deviation selector
    - Test color updates based on deviation status (normal/mild/severe)
    - Test keyboard navigation (Tab + Enter/Space)
  - [x] 2.2 Create `BodySilhouette.tsx` SVG component
    - Anterior view human body silhouette (simple outline)
    - 6 interactive hotspot circles: Head, Shoulders, Spine, Pelvis, Knees, Feet
    - Position hotspots at anatomically correct locations
    - SVG should be <50KB, inline or lazy-loaded
  - [x] 2.3 Implement clickable hotspots with popover
    - Use Shadcn Popover for deviation selector on click
    - Deviation options: Normal, Anteversion, Retroversion, Kyphosis, Lordosis, Scoliosis, Valgus, Varus, etc.
    - Close popover after selection
  - [x] 2.4 Add color-coded status visualization
    - Emerald-500 circle for "normal" status
    - Amber-500 circle for mild deviations
    - Rose-500 circle for severe deviations
    - Animate color transitions (150ms ease)
  - [x] 2.5 Implement accessibility features
    - Tab navigation between points (tabIndex)
    - Enter/Space to activate
    - aria-label for each point ("Cabeza - Normal")
    - Focus visible ring (ring-2 ring-teal-500)
    - Touch targets minimum 44px
  - [x] 2.6 Ensure posturogram component tests pass
    - Run ONLY the 4 tests written in 2.1

**Acceptance Criteria:**

- The 4 tests from 2.1 pass
- SVG renders correctly on desktop and iPad
- All 6 points are clickable and update state
- Keyboard navigation works
- Touch targets meet 44px minimum

---

#### Task Group 3: Voice Recorder Component ✅ COMPLETE

**Dependencies:** None (can run parallel to Task Groups 1-2)

- [x] 3.0 Complete voice recorder component
  - [x] 3.1 Write 3 focused tests for VoiceRecorder component
    - Test renders recording button in idle state
    - Test shows timer and stop button during recording
    - Test fires `onRecordingComplete` callback with audio blob
  - [x] 3.2 Create `VoiceRecorder.tsx` component
    - Props: `onRecordingComplete(audioBlob: Blob)`, `onCancel()`
    - States: idle, recording, playback, confirming
    - Use MediaRecorder API for audio capture
    - Request microphone permission on first record click
  - [x] 3.3 Implement recording UI
    - Microphone button with pulse animation during recording
    - Timer display in MM:SS format
    - Stop button to end recording
    - Cancel button with confirmation dialog
  - [x] 3.4 Implement playback UI
    - Audio element for playback
    - Play/Pause controls
    - "Confirmar" button to fire callback
    - "Volver a grabar" button to restart
  - [x] 3.5 Add transcription placeholder
    - Display "Transcripcion pendiente..." text after confirmation
    - Placeholder for Week 7 Whisper integration
  - [x] 3.6 Handle browser compatibility and errors
    - Check `navigator.mediaDevices` availability
    - Show error toast if microphone permission denied
    - Graceful fallback message for unsupported browsers
  - [x] 3.7 Ensure voice recorder tests pass
    - Run ONLY the 3 tests written in 3.1
    - Mock MediaRecorder API in tests

**Acceptance Criteria:**

- The 3 tests from 3.1 pass
- Recording works on Chrome, Safari, Firefox
- Audio blob is captured correctly
- UI states transition smoothly
- Error handling for permission denied

---

### Integration Layer

#### Task Group 4: EvaluationForm Enhancement & Integration ✅ COMPLETE

**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete EvaluationForm enhancement
  - [x] 4.1 Write 5 focused tests for enhanced EvaluationForm
    - Test renders all 4 tabs (existing behavior)
    - Test posturogram tab shows BodySilhouette component
    - Test orthopedic tests tab shows all 8 tests
    - Test Save button calls `patientsApi.updateEvaluation`
    - Test shows "Guardando..." indicator during save
  - [x] 4.2 Integrate BodySilhouette into posturogram tab
    - Add BodySilhouette above existing dropdown grid
    - Wire clicks to `handlePosturogramChange`
    - Keep dropdown grid as fallback/detail view
    - Sync state between SVG and dropdowns
  - [x] 4.3 Expand orthopedic tests section
    - Add 4 new test cards: Ott, Patrick, Lasègue, Dedo-Suelo
    - Define configurable tests array for rendering
    - Each card: numeric input, interpretation textarea, status badge
    - Reuse existing test card styling
  - [x] 4.4 Integrate VoiceRecorder component
    - Replace voice dictation button with VoiceRecorder
    - Position in header area (existing location)
    - Wire `onRecordingComplete` to component state
    - Display placeholder transcription text
  - [x] 4.5 Implement debounced auto-save
    - Wire `onPosturogramChange` through `useDebounce` → `patientsApi.updateEvaluation`
    - Wire `onPainScaleChange` through `useDebounce` → `patientsApi.updateEvaluation`
    - Show subtle "Guardando..." text during save
    - Show "Guardado ✓" on success (fade after 2s)
    - Use `useToast` for error notifications
  - [x] 4.6 Implement form state management
    - Track `isDirty` state comparing current vs last saved
    - Disable Save button when not dirty
    - Show loading spinner on Save button during save
    - Wire Cancel button to reset to last saved state
    - Add `useUnsavedChanges` hook for navigation warning
  - [x] 4.7 Enhance pain scale accessibility
    - Add `aria-label` to each range input
    - Add `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
    - Verify touch targets are 44px minimum
    - Test with screen reader (VoiceOver)
  - [x] 4.8 Add loading and error states
    - Loading skeleton for initial data fetch
    - Error boundary for component failures
    - Retry button on save failure toast
    - Optimistic updates with rollback on error
  - [x] 4.9 Ensure integration tests pass
    - Run ONLY the 5 tests written in 4.1
    - Mock API calls in tests

**Acceptance Criteria:**

- The 5 tests from 4.1 pass
- All 4 tabs render correctly with enhancements
- BodySilhouette and dropdowns stay in sync
- All 8 orthopedic tests display and save
- Voice recording captures and stores audio
- Auto-save works with visual feedback
- Form state management prevents data loss

---

### Testing & Polish Layer

#### Task Group 5: Test Review, Responsive Polish & Gap Analysis ✅ COMPLETE

**Dependencies:** Task Groups 1-4

- [x] 5.0 Review tests and polish responsive behavior
  - [x] 5.1 Review tests from Task Groups 1-4
    - Task 1.1: 3 utility tests
    - Task 2.1: 4 posturogram tests
    - Task 3.1: 3 voice recorder tests
    - Task 4.1: 5 integration tests
    - Total existing: 15 tests
  - [x] 5.2 Identify critical workflow gaps
    - Focus on end-to-end save workflow
    - Check error recovery scenarios
    - Verify data persistence after refresh
  - [x] 5.3 Write up to 5 additional strategic tests
    - Test complete evaluation save flow (end-to-end)
    - Test error toast displays on API failure
    - Test unsaved changes warning triggers on navigation
    - Test form resets to saved state on Cancel
    - Test responsive layout on mobile viewport
  - [x] 5.4 Polish responsive design
    - Test on mobile (320px-768px): stack sections vertically
    - Test on tablet (768px-1024px): iPad landscape primary
    - Test on desktop (1024px+): current layout
    - Adjust BodySilhouette size for mobile
    - Ensure voice recorder fits mobile screen
  - [x] 5.5 Final accessibility review
    - Test keyboard navigation through entire form
    - Verify screen reader announces states correctly
    - Check color contrast ratios (4.5:1 minimum)
    - Verify focus management in popovers
  - [x] 5.6 Run all feature-specific tests
    - Run all 15 + up to 5 = maximum 20 tests
    - Do NOT run entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**

- All 15-20 feature-specific tests pass
- Form works correctly on iPad (primary use case)
- Responsive layout adapts to mobile/tablet/desktop
- Accessibility requirements met
- No console errors or warnings

---

## Execution Order

Recommended implementation sequence:

```
┌─────────────────────────────────────────────────────────┐
│ Phase 1: Foundation (Parallel)                          │
├─────────────────────────────────────────────────────────┤
│ Task Group 1: Types & Utilities    ──┐                  │
│ Task Group 2: Posturogram SVG      ──┼── Can run        │
│ Task Group 3: Voice Recorder       ──┘   in parallel    │
├─────────────────────────────────────────────────────────┤
│ Phase 2: Integration                                    │
├─────────────────────────────────────────────────────────┤
│ Task Group 4: EvaluationForm Integration                │
│   (Depends on Groups 1, 2, 3)                           │
├─────────────────────────────────────────────────────────┤
│ Phase 3: Polish                                         │
├─────────────────────────────────────────────────────────┤
│ Task Group 5: Testing & Responsive Polish               │
│   (Depends on Group 4)                                  │
└─────────────────────────────────────────────────────────┘
```

**Time Estimates:**

- Phase 1: ~2-3 days (parallel work)
- Phase 2: ~2 days
- Phase 3: ~1 day
- **Total: ~5-6 days**

---

## Files to Create/Modify

| File                                                     | Action | Task Group |
| -------------------------------------------------------- | ------ | ---------- |
| `apps/client/src/types/patient.ts`                       | Modify | 1          |
| `apps/client/src/hooks/use-debounce.ts`                  | Create | 1          |
| `apps/client/src/hooks/use-unsaved-changes.ts`           | Create | 1          |
| `apps/client/src/components/patients/BodySilhouette.tsx` | Create | 2          |
| `apps/client/src/components/patients/VoiceRecorder.tsx`  | Create | 3          |
| `apps/client/src/components/patients/EvaluationForm.tsx` | Modify | 4          |
| `apps/client/src/components/patients/__tests__/`         | Create | 1-5        |

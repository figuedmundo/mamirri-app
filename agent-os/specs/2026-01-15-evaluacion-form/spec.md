# Specification: EvaluacionForm Enhancement

## Goal

Enhance the existing `EvaluationForm.tsx` component to provide a more interactive clinical evaluation experience with a visual posturogram selector, expanded orthopedic tests, and a complete voice recording UI for future Whisper integration.

## User Stories

- As a physiotherapist, I want to click on body parts in a visual diagram to record postural deviations so that I can evaluate patients faster during consultations without navigating complex forms.
- As a physiotherapist, I want to record voice notes during evaluation so that I can capture detailed observations hands-free while examining the patient.
- As a physiotherapist, I want access to additional orthopedic tests (Ott, Patrick, Lasègue, Dedo-Suelo) so that I can perform comprehensive musculoskeletal assessments.

## Specific Requirements

**Interactive Posturogram SVG**

- Create an SVG body silhouette component (anterior view only) with 6 clickable anatomical points
- Points: Head, Shoulders, Spine, Pelvis, Knees, Feet
- Clicking a point opens a dropdown/popover to select deviation type
- Color-coded circles: emerald-500 (normal), amber-500 (mild), rose-500 (severe)
- Keyboard accessible with Tab navigation and Enter/Space activation
- Touch targets minimum 44px for iPad use
- Fallback: existing dropdown grid remains functional if SVG fails to load

**Expanded Orthopedic Tests**

- Add 4 new tests to existing 4: Ott, Patrick (FABER), Lasègue (SLR), Dedo-Suelo
- Extend `OrthopedicTests` interface in `patient.ts` with optional new test fields
- Each test: numeric result input, interpretation textarea, auto-calculated status badge
- Tests rendered from configurable array to support future enable/disable per evaluation
- Status badges: emerald (normal/1), amber (mild/2), rose (moderate+/3+)

**Voice Recording UI**

- New `VoiceRecorder` component with recording button, timer, and waveform visualization
- Use Web Audio API (MediaRecorder, getUserMedia) for audio capture
- Display recording duration in MM:SS format
- Show simple audio level meter or pulse animation during recording
- Stop/Cancel buttons with confirmation before discarding
- Audio playback controls before confirming
- Save audio as Blob to component state; fire `onVoiceDictation(audioBlob)` callback
- Display placeholder text "Transcripcion pendiente..." (actual Whisper is Week 7)

**Debounced Auto-Save**

- Create `useDebounce` hook in `apps/client/src/hooks/use-debounce.ts`
- Wire `onPosturogramChange` and `onPainScaleChange` to call `patientsApi.updateEvaluation` with 300ms debounce
- Show subtle "Guardando..." indicator during save, "Guardado" on success
- Use `useToast` for error notifications on save failure
- Implement optimistic updates with rollback on API error

**Form State Management**

- Track `isDirty` state to enable/disable Save button
- Warn user on navigation away if unsaved changes exist (beforeunload event)
- Cancel button resets form to last saved state
- Loading skeleton for initial data fetch

**Pain Scale Accessibility**

- Add `aria-label` and `aria-valuenow` to range inputs
- Ensure touch targets are 44px minimum height
- Add visible value display next to each slider (already exists, verify)

**Backend Integration Wiring**

- Wire main Save button to `patientsApi.updateEvaluation(evaluationId, data)`
- Map component state to `UpdateEvaluationDto` shape
- Handle loading state during save with disabled button and spinner
- Display success toast on save, error toast with retry option on failure

## Visual Design

No visual mockups provided. Follow existing design patterns from:

- Current `EvaluationForm.tsx` tabbed interface and card styling
- Color scheme: teal-500/600 for primary actions, slate for backgrounds
- Shadcn/UI components for buttons, inputs, dialogs

## Existing Code to Leverage

**`apps/client/src/components/patients/EvaluationForm.tsx`**

- Base component with tabbed interface (Posturograma, Tests, AVD, Dolor)
- Existing pain scale slider pattern with gradient track
- Posturogram dropdown handlers (`handlePosturogramChange`)
- AVD calculation logic (`calculateAVDTotal`)
- Keep all existing functionality; enhance rather than replace

**`apps/client/src/types/patient.ts`**

- Complete type definitions for `Evaluation`, `Posturogram`, `OrthopedicTests`, `PainScale`
- Extend `OrthopedicTests` interface with optional `ott`, `patrick`, `lasegue`, `dedoSuelo` fields
- Reuse `TestResult` interface for new tests

**`apps/client/src/api/patients.ts`**

- `patientsApi.updateEvaluation(id, data)` already exists
- `UpdateEvaluationDto` accepts posturogram, orthopedicTests, painScale, etc.
- Wire callbacks to this existing endpoint

**`apps/client/src/hooks/use-toast.ts`**

- Toast notification system already implemented
- Use for save success/error feedback
- Pattern: `toast({ title: "...", description: "..." })`

**`apps/client/src/components/patients/PatientForm.tsx`**

- Reference for manual useState + Zod validation pattern
- Follow same form state management approach
- Do not introduce React Hook Form

## Out of Scope

- Before/After comparison slider (ComparacionBoard) — separate component, Task 6.3
- 4-view posturogram capture (Anterior, Posterior, Lateral views) — Week 20, Análisis module
- Footprint (Huella) capture and analysis — Week 19, Análisis module
- Video capture and gait analysis — Week 7 + Week 21
- Whisper API integration for transcription — Week 7, Media & Dictation module
- Cronograma treatment timeline component — Task 6.2, separate spec
- PDF/report export functionality — Week 28-29
- Offline storage with IndexedDB — Week 8, PWA phase
- Multi-language toggle (EN/ES) — Week 18, Biblioteca Médica
- Creating new backend endpoints or modules — document gaps only

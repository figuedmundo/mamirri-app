# Specification: Patient Flow Evaluation (SOAP Restructuring)

## Goal

Restructure the patient evaluation flow around the SOAP clinical documentation standard (Subjective → Objective → Assessment → Plan), simplify the evaluation data model from 1:N to 1:1, remove auto-generated treatment phases, and implement progressive disclosure so the therapist only sees fields relevant to each patient — resolving Issue #40 and field testing feedback.

## User Stories

- As a physiotherapist, I want to add a diagnosis BEFORE defining treatment phases so that my clinical reasoning drives the treatment plan, not the other way around
- As a physiotherapist, I want to see only the tests relevant to my current patient so that I don't feel overwhelmed by irrelevant fields (e.g., orthopedic leg tests for a jaw patient)
- As a physiotherapist, I want to define treatment phases manually and incrementally so that the plan reflects what I actually know at each stage of treatment

## Specific Requirements

**SOAP-Based Evaluation Structure**

- Replace the current 5-tab evaluation form (Posturograma, Tests, AVD, Dolor, Multimedia) with 4 SOAP sections: Subjective, Objective, Assessment, Plan
- Subjective section: chief complaint, patient history, symptoms — voice dictation as the primary input via the existing VoiceRecorder component
- Objective section: pain scale (always visible) + an "Add test" interface for optional tests (orthopedic, posturogram, ADL scales). No tests shown by default
- Assessment section: diagnosis fields — prominent and easy to fill. This is the core clinical step that resolves Issue #40
- Plan section: treatment plan with manually-defined phases. Links to the existing TreatmentTimeline/Cronograma components
- Sections presented as expandable/collapsible areas or sequential steps, reusing the existing `activeSection` state pattern from EvaluationForm.tsx

**1:1 Evaluation Model**

- Change Prisma schema: `ClinicalCase.evaluations Evaluation[]` → `ClinicalCase.evaluation Evaluation?` with `@unique` on `clinicalCaseId`
- Remove the `type` field from the Evaluation model (no more INITIAL/PROGRESS/FINAL distinction)
- The single evaluation is a living document that evolves as the patient progresses
- Remove `getInitialEvaluation()`, `getFinalEvaluation()`, and `canCreateEvaluationOfType()` from `evaluation-utils.ts`
- Update `ComparisonBoard` to compare session-level pain data over time instead of Initial vs Final evaluation snapshots
- No data migration needed — database will be dumped and recreated (testing environment only)

**Remove Auto-Generated Treatment Phases**

- Modify `PatientsService.create()` to stop auto-creating a 5-phase TreatmentPlan when a patient is created
- Patient creation should only create: Patient + ClinicalCase + empty Evaluation (no phases, no treatment plan)
- The TreatmentPlan and its phases are created manually by the therapist after filling the Assessment (diagnosis) section
- Phases are addable incrementally — the therapist does not need to define all phases upfront

**Diagnosis-First Flow**

- The clinical flow must be: Patient → Evaluation (S → O → A → P) → where Assessment/Diagnosis comes before Plan/Phases
- The Plan section should be disabled or show a prompt until a diagnosis exists in the Assessment section
- The diagnosis field in the Assessment section must be prominent, easy to access, and not buried under optional tests

**Progressive Disclosure for Tests (Objective Section)**

- Show zero tests by default in the Objective section — only the pain scale is always visible
- Provide a "search and add" interface (reuse `LibrarySearchBar` pattern + `Select` component) where the therapist picks only the tests relevant to the current patient
- Available test categories: Orthopedic Tests (8 existing), Posturogram/Body Silhouette, Barthel Scale, Lawton Scale
- Each added test renders as a collapsible card that can be expanded to fill and collapsed when done
- Barthel + Lawton scales hidden by default — available via "Add assessment scale" action (used in ~1% of cases, mainly for insurance)
- Posturogram available as an optional add-on, not a primary section

**Tablet-Optimized UX**

- Single-column layout for the SOAP form on both iPad and Android tablets
- Touch targets minimum 60px for primary actions, 44px minimum for all interactive elements
- Voice dictation button always visible and prominent in the Subjective section
- No swipe gestures for critical actions — tap only
- Auto-save with debounce on all form changes (reuse existing debounce pattern from EvaluationForm)

## Visual Design

No visual mockups provided.

## Existing Code to Leverage

**EvaluationForm Tab Navigation Pattern**

- File: `apps/client/src/components/patients/EvaluationForm.tsx`
- Uses `activeSection` state with a union type to switch between sections via conditional rendering
- Horizontal button bar for tab navigation — adapt this pattern for SOAP section switching (S | O | A | P)
- Existing debounced auto-save pattern (`useDebounce`) should be preserved in the new form
- The refactored form replaces this component entirely but should follow the same architectural patterns

**VoiceRecorder Component**

- File: `apps/client/src/components/patients/VoiceRecorder.tsx`
- Props: `onRecordingComplete(audioBlob, duration)`, `onCancel?`, `className?`, `autoStart?`
- Already integrated with Whisper transcription — promote to the primary input method for the Subjective section
- Reuse as-is, no changes needed to the component itself

**Pain Scale Implementation**

- Slider UI in `EvaluationForm.tsx` using native `<input type="range">` for activity, rest, palpation (0-10)
- Type definition: `PainScale { activity, rest, palpation, type: 'acute' | 'chronic' }` in `apps/client/src/types/patient.ts`
- Visual display: `apps/client/src/components/patients/PainScaleDisplay.tsx` with PainBar components
- Keep as the always-visible element in the Objective section — no changes needed to the slider or display logic

**Search/Filter UI Patterns**

- `apps/client/src/components/library/LibrarySearchBar.tsx` — search input pattern with `onSearch(query)` prop; adapt for the "Add test" search interface
- `apps/client/src/components/ui/select.tsx` — Radix-based Select/ComboBox with SelectTrigger, SelectContent, SelectItem; reuse for test category picker

**PatientsService Auto-Creation Flow**

- File: `apps/server/src/modules/patients/patients.service.ts`
- Currently creates Patient + ClinicalCase + INITIAL Evaluation + TreatmentPlan (5 phases) in a single Prisma transaction
- Must be simplified: create only Patient + ClinicalCase + empty Evaluation (no type, no treatment plan, no phases)

## Out of Scope

- Patient list page or patient creation form UX changes
- Automated SMS reminders or patient engagement features
- Patient portal or home exercise programs
- Adding new orthopedic test definitions beyond the existing 8
- Mobile-native app changes (PWA only)
- AI analysis module changes
- Billing or insurance integration
- Offline sync or IndexedDB changes
- New component library additions (e.g., dedicated Accordion component — use conditional rendering pattern)
- Changes to the Biblioteca Médica or library search functionality

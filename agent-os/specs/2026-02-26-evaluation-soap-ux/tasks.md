# Task Breakdown: Evaluation SOAP UX

## Overview

Total Tasks: 4 task groups, ~20 sub-tasks

## Task List

### TypeScript Types

#### Task Group 1: Extend Diagnosis Type with Plan Fields

**Dependencies:** None

- [x] 1.0 Complete type system update
  - [x] 1.1 Write 2 focused tests for the extended Diagnosis type
    - Test: `Diagnosis` type accepts an optional `plan` object with 5 string fields
    - Test: `buildPayload()` includes `diagnosis.plan` data in the evaluation payload
  - [x] 1.2 Extend `Diagnosis` interface in `apps/client/src/types/patient.ts`
    - Add optional `plan?: TreatmentPlan` field to `Diagnosis` interface (line 146)
    - Create `TreatmentPlan` interface: `{ interventions: string; frequency: string; homeExercises: string; nextVisit: string; additionalNotes: string }`
    - No Prisma schema changes — `diagnosis` is already a `Json` column
  - [x] 1.3 Ensure type tests pass
    - Run ONLY the 2 tests written in 1.1
    - Verify zero TypeScript compilation errors across the client

**Acceptance Criteria:**

- The 2 tests pass
- `Diagnosis` interface includes optional `plan` field
- No TypeScript errors in the project

### Frontend Components — Language & UX Polish

#### Task Group 2: Spanish Labels, Persistent Labels, Section Descriptions, Pain Values, Auto-Save Indicator

**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 2.0 Complete language and UX polish
  - [x] 2.1 Write 4 focused tests for language and UX changes
    - Test: SOAP tabs render Spanish labels (`S - Subjetivo`, `O - Objetivo`, `A - Análisis`, `P - Plan`)
    - Test: Pain scale labels render as `Actividad`, `Reposo`, `Palpación` with numeric value display (e.g., `Actividad: 7/10`)
    - Test: Assessment section renders persistent `<label>` elements above each input field
    - Test: Each SOAP section renders a description line below the heading
  - [x] 2.2 Fix tab labels and section headings (ADR 008)
    - Change tab label array (line 233-238): `S - Subjective` → `S - Subjetivo`, `O - Objective` → `O - Objetivo`, `A - Assessment` → `A - Análisis`, `P - Plan` stays
    - Change `<h2>` section headings inside each panel: `Subjective` → `Subjetivo`, `Objective` → `Objetivo`, `Assessment` → `Análisis`
    - Fix mixed-language warning text in Plan section (line 442): `"...en Assessment..."` → `"...en Análisis..."`
  - [x] 2.3 Fix pain scale labels and add value display
    - Replace the `capitalize` render of raw field names (`activity`, `rest`, `palpation`) with a translation map: `{ activity: 'Actividad', rest: 'Reposo', palpation: 'Palpación' }`
    - Display current numeric value inline with each label: `Actividad: 7/10`
    - Ensure slider `className` keeps `h-11` for touch-friendly sizing
  - [x] 2.4 Add persistent labels to all input fields
    - Add `<label>` to Subjective textarea: `Motivo de consulta, historia y síntomas`
    - Add `<label>` to test search input: `Buscar prueba ortopédica`
    - Follow SessionForm pattern: `<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">`
  - [x] 2.5 Add labels and helper text to Assessment fields
    - Add persistent `<label>` above each of the 4 Assessment inputs: `Indicador funcional`, `Aspecto clínico`, `Anatomopatología`, `Consecuencias en AVD`
    - Add helper text below each label: `<p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Ej: ...</p>`
    - Helper examples: `Limitación para caminar más de 10 minutos`, `Lumbalgia mecánica con contractura paravertebral`, `Hernia discal L4-L5 con compresión radicular`, `No puede agacharse para vestirse, dificultad para conducir`
  - [x] 2.6 Add section descriptions under SOAP headings
    - Add `<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">` below each section `<h2>`
    - S: `Lo que el paciente reporta: síntomas, queja principal, historia.`
    - O: `Lo que mides: escala de dolor, pruebas clínicas, hallazgos.`
    - A: `Tu juicio clínico: diagnóstico funcional y sus consecuencias.`
    - P: `Qué harás: tratamiento, frecuencia, ejercicios, próxima cita.`
  - [x] 2.7 Add auto-save status indicator
    - Add a subtle text indicator near the "Guardar Evaluación" button
    - States: `Guardando...` (while saving), `✓ Guardado` (after success, fades after 2s), `Error al guardar` (on failure, red)
    - Use a local `saveStatus` state variable: `'idle' | 'saving' | 'saved' | 'error'`
    - Wire to existing `handleSave` and the unmount cleanup save
  - [x] 2.8 Ensure language and UX tests pass
    - Run ONLY the 4 tests written in 2.1
    - Verify all user-facing text is in Spanish
    - Verify no English labels remain in the rendered form

**Acceptance Criteria:**

- The 4 tests pass
- All tab labels, section headings, and pain labels render in Spanish
- Every input field has a visible persistent label
- Assessment fields have helper text with examples
- Each SOAP section has a description line
- Pain sliders show numeric value
- Auto-save indicator shows save status

### Frontend Components — Plan Section

#### Task Group 3: Functional Plan Section with Editable Fields

**Dependencies:** Task Group 1 (needs `TreatmentPlan` type)

- [x] 3.0 Complete functional Plan section
  - [x] 3.1 Write 4 focused tests for Plan section
    - Test: Plan section shows gating message when no diagnosis exists, with "Ir a Análisis" button
    - Test: "Ir a Análisis" button calls `setActiveSection('assessment')`
    - Test: Plan section renders 5 editable textarea fields when diagnosis exists
    - Test: Plan field changes trigger `hasPendingChangesRef.current = true` (marks for auto-save)
  - [x] 3.2 Build Plan section fields
    - Replace current static text (lines 435-452 in EvaluationForm.tsx) with 5 textarea fields
    - Each field follows the Assessment pattern: `<label>` + helper `<p>` + `<textarea>`
    - Fields: `Intervenciones planificadas`, `Frecuencia y duración`, `Ejercicios para casa`, `Próxima cita`, `Notas adicionales`
    - Each textarea uses the standard class: `w-full min-h-24 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg`
  - [x] 3.3 Add Plan state management and auto-save integration
    - Add local state for Plan fields: `const [plan, setPlan] = useState<TreatmentPlan>(...)` initialized from `activeEvaluation?.diagnosis?.plan`
    - Wire `onChange` handlers that set `hasPendingChangesRef.current = true`
    - Update `buildPayload()` to include `diagnosis: { ...diagnosis, subjective: subjectiveText, plan }` in the payload
    - Update `getCurrentSnapshot()` to include plan data for change detection
    - Hydration effect (line 69-110) must initialize plan state from `activeEvaluation.diagnosis.plan`
  - [x] 3.4 Update Plan gating behavior
    - When no diagnosis: show `Completa el diagnóstico en Análisis para poder definir el plan de tratamiento.` with a button `Ir a Análisis` that calls `setActiveSection('assessment')`
    - When diagnosis exists: show all 5 Plan fields
    - Reuse `hasDiagnosis` variable (line 218-222) for the gating check
  - [x] 3.5 Add "Ver cronograma" navigation link
    - Add an `onNavigateToTimeline?: () => void` optional prop to `EvaluationFormProps` in `types/patient.ts`
    - Render a link/button at the bottom of the Plan section: `Ver cronograma de tratamiento →`
    - On click, call `onNavigateToTimeline()` — which CaseDetailLayout wires to `setViewMode('timeline')`
    - Update CaseDetailLayout to pass `onNavigateToTimeline={() => setViewMode('timeline')}` when rendering `<EvaluationForm>`
    - Only visible when diagnosis exists
  - [x] 3.6 Ensure Plan section tests pass
    - Run ONLY the 4 tests written in 3.1
    - Verify Plan fields render, accept input, and save correctly

**Acceptance Criteria:**

- The 4 tests pass
- Plan section shows gating message with navigation button when no diagnosis
- Plan section renders 5 editable fields when diagnosis exists
- Plan data saves via auto-save and manual save
- "Ver cronograma" link navigates to timeline view
- "Ir a Análisis" button switches to Assessment section

### Testing

#### Task Group 4: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2 tests from Task Group 1 (types)
    - Review the 4 tests from Task Group 2 (language & UX)
    - Review the 4 tests from Task Group 3 (Plan section)
    - Total existing tests: approximately 10 tests
  - [x] 4.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows that lack coverage
    - Focus on the end-to-end flow: fill SOAP sections → auto-save → Plan data persists
    - Check that string references in existing `EvaluationForm.test.tsx` haven't broken due to label changes
  - [x] 4.3 Write up to 6 additional strategic tests maximum
    - Test: Full SOAP navigation flow (click through all 4 tabs, verify each renders)
    - Test: Auto-save indicator shows correct status transitions
    - Test: Plan data is included in the evaluation payload sent to onSave
    - Test: "Ver cronograma" link calls onNavigateToTimeline callback
    - Update any existing tests in `EvaluationForm.test.tsx` that reference old English strings
    - Do NOT write exhaustive edge case tests
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this spec (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 16 tests maximum
    - Verify critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 16 tests total)
- No broken string references from label changes
- SOAP form navigation, Plan section, and auto-save are covered
- No more than 6 additional tests added
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. TypeScript Types (Task Group 1) — Foundation; extend Diagnosis type
2. Language & UX Polish (Task Group 2) — Can start in parallel with Group 1; Spanish labels, persistent labels, section descriptions, auto-save indicator
3. Plan Section (Task Group 3) — Depends on Group 1 for TreatmentPlan type; functional Plan fields and navigation
4. Test Review & Gap Analysis (Task Group 4) — Final quality check after all UI changes

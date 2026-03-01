# Specification: Evaluation SOAP UX

## Goal

Fix ADR 008 language violations (English→Spanish), add persistent labels and helper text to all form fields, make the Plan section functional with editable treatment-intention fields, and add auto-save status feedback — so the therapist always knows what each field is for and can actually use every SOAP section.

## User Stories

- As a physiotherapist, I want all SOAP form labels in Spanish so that the interface matches my clinical language and I don't see English terms
- As a physiotherapist, I want to see what each field is about even after I've typed in it, so that I can review my entries without guessing which field is which
- As a physiotherapist, I want to record my treatment intentions (interventions, frequency, exercises) directly in the Plan tab so that the tab is useful instead of a dead-end

## Specific Requirements

**ADR 008 — English to Spanish Label Fixes**

- Tab labels: `S - Subjective` → `S - Subjetivo`, `O - Objective` → `O - Objetivo`, `A - Assessment` → `A - Análisis`, `P - Plan` stays the same
- Section headings inside each panel: `Subjective` → `Subjetivo`, `Objective` → `Objetivo`, `Assessment` → `Análisis`, `Plan` → `Plan`
- Pain scale labels: the raw field names `activity`, `rest`, `palpation` rendered via `.map()` must display as `Actividad`, `Reposo`, `Palpación` — use a translation map, not `capitalize`
- Mixed-language warning in Plan section: `"...en Assessment antes de..."` → `"...en Análisis antes de..."`

**Persistent Labels on All Input Fields**

- Every `<input>`, `<textarea>`, and `<select>` in the form must have a visible `<label>` element above it that remains visible after the user types
- Follow the existing SessionForm label pattern: `<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">`
- The existing `placeholder` attributes stay as secondary guidance inside the fields
- Subjective textarea label: `Motivo de consulta, historia y síntomas`
- Test search input label: `Buscar prueba ortopédica`
- Test interpretation textarea placeholder stays: `Interpretación`

**Assessment Fields — Labels with Helper Text**

- Each of the 4 Assessment fields gets a persistent label AND a helper line below the label explaining what to write
- `functionalIndicator`: Label `Indicador funcional`, helper `Ej: Limitación para caminar más de 10 minutos`
- `clinicalAspect`: Label `Aspecto clínico`, helper `Ej: Lumbalgia mecánica con contractura paravertebral`
- `anatomopathology`: Label `Anatomopatología`, helper `Ej: Hernia discal L4-L5 con compresión radicular`
- `avdConsequences`: Label `Consecuencias en AVD`, helper `Ej: No puede agacharse para vestirse, dificultad para conducir`
- Helper text styled as muted small text: `<p className="text-xs text-slate-400 dark:text-slate-500 mb-1">`

**Section Descriptions Under Each SOAP Heading**

- Add a one-line description below each section `<h2>` explaining what goes there
- S: `Lo que el paciente reporta: síntomas, queja principal, historia.`
- O: `Lo que mides: escala de dolor, pruebas clínicas, hallazgos.`
- A: `Tu juicio clínico: diagnóstico funcional y sus consecuencias.`
- P: `Qué harás: tratamiento, frecuencia, ejercicios, próxima cita.`
- Styled as muted text below the heading: `<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">`

**Pain Scale Value Display**

- Each pain slider must show the current numeric value next to its label
- Format: `Actividad: 7/10` where the number updates in real-time as the slider moves
- Use the existing `<label>` line — append the value display inline

**Plan Section — Functional with Editable Fields**

- Replace the current static-text-only Plan section (lines 435-452) with editable form fields
- When no diagnosis exists (Assessment empty): show message `Completa el diagnóstico en Análisis para poder definir el plan de tratamiento.` with a button `Ir a Análisis` that calls `setActiveSection('assessment')`
- When diagnosis exists, show these textarea fields with labels, helpers, and placeholders following the same pattern as Assessment fields:
  - `Intervenciones planificadas` — helper: `Técnicas y procedimientos a aplicar`, placeholder: `Ej: Movilización articular, ultrasonido, fortalecimiento...`
  - `Frecuencia y duración` — helper: `Sesiones por semana y duración estimada`, placeholder: `Ej: 3 veces/semana por 2 semanas, luego 2 veces/semana`
  - `Ejercicios para casa` — helper: `Programa de ejercicios domiciliarios`, placeholder: `Ej: Estiramientos cadena posterior 2x/día, 30 seg cada uno...`
  - `Próxima cita` — helper: `Foco de la siguiente sesión`, placeholder: `Ej: Reevaluar dolor, progresar fortalecimiento`
  - `Notas adicionales` — helper: `Educación, derivaciones, plan de alta`, placeholder: `Ej: Explicar ergonomía, derivar a traumatología si no mejora`
- Add a navigation link at the bottom: `Ver cronograma de tratamiento →` — on click, the parent `CaseDetailLayout` must switch `viewMode` to `'timeline'`; this requires accepting an `onNavigateToTimeline` callback prop on `EvaluationForm`

**Plan Data Storage**

- Store Plan fields inside the existing `diagnosis` JSON field as a nested `plan` object: `diagnosis.plan.interventions`, `diagnosis.plan.frequency`, `diagnosis.plan.homeExercises`, `diagnosis.plan.nextVisit`, `diagnosis.plan.additionalNotes`
- Extend the `Diagnosis` TypeScript interface with an optional `plan?: TreatmentPlan` field containing 5 string fields
- No Prisma schema changes needed — the `diagnosis` column is already `Json` type
- The `buildPayload()` function must include Plan data in the diagnosis object so auto-save covers all sections

**Auto-Save Status Indicator**

- Add a subtle inline text indicator near the "Guardar Evaluación" button
- States: `Guardando...` (while saving), `✓ Guardado` (after success, fades after 2s), `Error al guardar` (on failure, red)
- Track save status using a local state variable derived from the existing `isSaving` ref and the toast success/error callbacks
- This complements (does not replace) the existing manual save button and toast notifications

## Visual Design

No visual mockups provided.

## Existing Code to Leverage

**SessionForm Label Pattern**

- File: `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`
- Uses `<label htmlFor="..." className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">` consistently
- This is the established label pattern in the codebase — replicate it exactly in EvaluationForm
- SessionForm also demonstrates Spanish-language labels (`Fecha`, `Fase`, `Procedimientos`) confirming ADR 008 compliance elsewhere

**EvaluationForm Auto-Save Architecture**

- File: `apps/client/src/components/patients/EvaluationForm.tsx`
- Uses `snapshotRef` to track the last-saved state and `hasPendingChangesRef` to detect changes
- `buildPayload()` constructs the full `Evaluation` object from local state — Plan fields must be added here inside `diagnosis.plan`
- Cleanup effect on unmount (line 139-150) triggers a silent save if pending changes exist — Plan data will be included automatically
- The `handleSave()` function (line 190-216) already shows Spanish toasts — keep this pattern

**Diagnosis Type and Storage**

- File: `apps/client/src/types/patient.ts`, line 146
- `Diagnosis` interface has: `functionalIndicator`, `clinicalAspect`, `anatomopathology`, `avdConsequences`, `subjective?`
- Add `plan?: { interventions: string; frequency: string; homeExercises: string; nextVisit: string; additionalNotes: string }` to this interface
- The backend stores `diagnosis` as `Json` in Prisma (schema.prisma line 142) — no migration needed for adding nested fields

**CaseDetailLayout ViewMode Navigation**

- File: `apps/client/src/components/patients/CaseDetailLayout.tsx`
- Uses `viewMode` state with union type: `'timeline' | 'session-detail' | 'evaluation' | 'objectives' | 'comparison'`
- Pass `onNavigateToTimeline={() => setViewMode('timeline')}` as a new prop to `EvaluationForm`
- This enables the "Ver cronograma" link in the Plan section to navigate without internal coupling

**PatientForm Label Pattern (Shadcn)**

- File: `apps/client/src/components/patients/PatientForm.tsx`
- Uses Shadcn `<Label>` component from `@/components/ui/label`
- Either Shadcn `<Label>` or native `<label>` is acceptable — match whichever pattern is more prevalent in the patients module (SessionForm uses native `<label>`)

## Out of Scope

- Redesigning the overall form layout, tab navigation pattern, or card styling
- Adding icons, color-coded sections, or step progress indicators
- Changes to the Cronograma/TreatmentTimeline components
- Changes to the CaseDetailLayout navigation tabs or sidebar
- Backend API endpoint changes or new endpoints
- Prisma schema migrations or new database fields
- Changes to other patient components (PatientProfile, ComparisonBoard, CaseTimeline)
- Mobile-specific responsive breakpoint changes
- Adding VoiceRecorder to the Plan section (future enhancement)
- Internationalization framework (i18n) — hardcode Spanish strings per ADR 008
- Changes to test files beyond updating string references that break due to label changes

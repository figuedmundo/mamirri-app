# Spec Requirements: Evaluation SOAP UX

## Initial Description

Roadmap task 9.12 — Week 9: Field Testing ("The Truth") → Issues raised

Three issues raised during field testing of the SOAP evaluation form (implemented in task 9.11):

1. **Language violations (ADR 008):** The evaluation SOAP form is not following the language strategy — English labels appear in the UI where Spanish should be used. Specifically: tab labels ("S - Subjective", "O - Objective", "A - Assessment", "P - Plan"), section headings, and pain scale field names ("activity", "rest", "palpation").
2. **UI/UX quality:** The form needs improvement — the current implementation is bare-bones with plain inputs, no visible labels (placeholder-only), no visual hierarchy, and no guidance for the therapist. After typing in a field, the therapist cannot tell what the field is about.
3. **P-Plan tab is non-functional:** The doctor is confused about the purpose of the Plan tab — "I can't do nothing inside that tab." The Plan section only renders static text (either a warning or a redirect message), with zero interactive elements.

## Requirements Discussion

### First Round Questions

**Q1:** For the SOAP tab labels, what are the correct Spanish clinical translations?
**Answer:** Research confirmed the standard Spanish SOAP terminology in rehabilitation/physiotherapy: S - Subjetivo, O - Objetivo, A - Análisis, P - Plan. The acronym "SOAP" is used as-is worldwide including in Spanish-speaking clinical settings. For "A", the standard in rehabilitation is "Análisis" (not "Valoración" which refers to the overall evaluation process).

**Q2:** The pain scale labels currently render raw English field names. What should they be?
**Answer:** Actividad, Reposo, Palpación — confirmed by the user.

**Q3:** For the Plan tab, should it navigate to the Cronograma or embed phase creation directly?
**Answer:** The user asked "what should be done in that tab?" — research revealed that the Plan section in SOAP is NOT about treatment phases/cronograma. It captures the therapist's treatment intentions: planned interventions, frequency/duration, home exercises, next session focus, patient education, discharge criteria, and referrals. This is distinct from the Cronograma which tracks execution. The Plan section needs its own editable fields.

**Q4:** On UI/UX improvements — how far should we go?
**Answer:** User said "keep it clean" — add persistent labels, helper text for Assessment fields, pain scale value indicators, section descriptions. No heavy redesign, icons, or progress indicators.

**Q5:** The Assessment section has 4 fields (Indicador funcional, Aspecto clínico, Anatomopatología, Consecuencias AVD). Does the doctor use all 4?
**Answer:** User confirmed they all need UX improvement — "after I add text, I don't know what the field is about, all needs to be clear." Fields stay but need persistent labels with helper text explaining what to write.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: EvaluationForm — Path: `apps/client/src/components/patients/EvaluationForm.tsx` (466 lines, the primary file to modify)
- Feature: CaseDetailLayout — Path: `apps/client/src/components/patients/CaseDetailLayout.tsx` (571 lines, renders EvaluationForm)
- Feature: VoiceRecorder — Path: `apps/client/src/components/patients/VoiceRecorder.tsx` (reused in Subjective section)
- Feature: TreatmentTimeline — Path: `apps/client/src/components/patients/TreatmentTimeline.tsx` (Plan will link to this)
- Feature: Patient types — Path: `apps/client/src/types/patient.ts` (Diagnosis, PainScale, Evaluation types)
- Feature: Evaluation utilities — Path: `apps/client/src/lib/evaluation-utils.ts`
- Backend: Patients service — Path: `apps/server/src/modules/patients/patients.service.ts`
- Prisma schema — Path: `apps/server/prisma/schema.prisma` (Evaluation model, line 136)
- ADR 008 — Path: `.documentation/product/decisions/008-language-strategy-english-code-spanish-ui.md`
- Related spec: Patient Flow Evaluation — Path: `agent-os/specs/2026-02-25-patient-flow-evaluation/`

### Follow-up Questions

**Follow-up 1:** What is the purpose of the Plan section in physiotherapy SOAP notes?
**Answer:** Research from authoritative rehabilitation clinical documentation sources confirmed that the Plan section answers "What will we do next, and how?" It contains: planned interventions/procedures, treatment frequency and duration, home exercise program, next session focus, patient/family education notes, discharge plan/criteria, and referrals if needed. This is distinct from the treatment timeline (Cronograma) — Plan captures intentions, Cronograma tracks execution.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

#### FR1: Fix Language Violations (ADR 008 Compliance)

All user-facing text in the evaluation SOAP form must be in Spanish per ADR 008.

**Tab labels:**

- `S - Subjective` → `S - Subjetivo`
- `O - Objective` → `O - Objetivo`
- `A - Assessment` → `A - Análisis`
- `P - Plan` → `P - Plan` (same in both languages)

**Section headings:**

- `Subjective` → `Subjetivo`
- `Objective` → `Objetivo`
- `Assessment` → `Análisis`
- `Plan` → `Plan`

**Pain scale labels:**

- `activity` → `Actividad`
- `rest` → `Reposo`
- `palpation` → `Palpación`

**Mixed-language text:**

- `"Completa el diagnóstico en Assessment antes de definir fases del tratamiento."` → `"Completa el diagnóstico en Análisis antes de definir el plan de tratamiento."`

#### FR2: Add Persistent Labels and Helper Text

All input fields must have visible `<label>` elements that remain visible after the user types. No field should rely on placeholder-only identification.

**Subjective section:**

- Label: `Motivo de consulta, historia y síntomas`
- The existing placeholder can remain as additional guidance inside the textarea

**Objective section — Pain scale:**

- Each slider must display a persistent label AND the current numeric value
- Format: `Actividad: 7/10`, `Reposo: 3/10`, `Palpación: 5/10`

**Objective section — Tests:**

- Label for search input: `Buscar prueba ortopédica`
- Each added test card keeps its existing label

**Assessment section — All 4 fields need labels + helper text:**

| Field                 | Label (Spanish)      | Helper text                                                    |
| --------------------- | -------------------- | -------------------------------------------------------------- |
| `functionalIndicator` | Indicador funcional  | Ej: Limitación para caminar más de 10 minutos                  |
| `clinicalAspect`      | Aspecto clínico      | Ej: Lumbalgia mecánica con contractura paravertebral           |
| `anatomopathology`    | Anatomopatología     | Ej: Hernia discal L4-L5 con compresión radicular               |
| `avdConsequences`     | Consecuencias en AVD | Ej: No puede agacharse para vestirse, dificultad para conducir |

#### FR3: Add Section Descriptions

Each SOAP section must have a one-line description below the heading explaining what to fill:

- **S - Subjetivo:** "Lo que el paciente reporta: síntomas, queja principal, historia."
- **O - Objetivo:** "Lo que mides: escala de dolor, pruebas clínicas, hallazgos."
- **A - Análisis:** "Tu juicio clínico: diagnóstico funcional y sus consecuencias."
- **P - Plan:** "Qué harás: tratamiento, frecuencia, ejercicios, próxima cita."

#### FR4: Make Plan Section Functional

Replace the current static text in the Plan section with editable fields that capture the therapist's treatment intentions:

**Fields to add:**

1. **Intervenciones planificadas** (textarea, voice-dictation friendly)
   - Label: `Intervenciones planificadas`
   - Helper: `Técnicas y procedimientos a aplicar`
   - Placeholder: `Ej: Movilización articular, ultrasonido en región lumbar, ejercicios de fortalecimiento...`

2. **Frecuencia y duración** (textarea or structured inputs)
   - Label: `Frecuencia y duración`
   - Helper: `Sesiones por semana y duración estimada del tratamiento`
   - Placeholder: `Ej: 3 veces/semana por 2 semanas, luego 2 veces/semana`

3. **Ejercicios para casa** (textarea, voice-dictation friendly)
   - Label: `Ejercicios para casa`
   - Helper: `Programa de ejercicios para el paciente en casa`
   - Placeholder: `Ej: Estiramientos de cadena posterior 2 veces/día, 30 segundos cada uno...`

4. **Próxima cita** (textarea)
   - Label: `Próxima cita`
   - Helper: `Foco de la siguiente sesión`
   - Placeholder: `Ej: Reevaluar dolor, progresar ejercicios de fortalecimiento`

5. **Notas adicionales** (textarea, optional)
   - Label: `Notas adicionales`
   - Helper: `Educación al paciente, derivaciones, plan de alta`
   - Placeholder: `Ej: Explicar ergonomía en el trabajo, derivar a traumatología si no mejora en 4 semanas`

6. **Link to Cronograma** (button/link)
   - Text: `Ver cronograma de tratamiento →`
   - Action: Navigate to the treatment timeline view (set viewMode to 'timeline' in CaseDetailLayout)
   - Only visible when a diagnosis exists in Assessment

**Gating behavior:**

- When no diagnosis exists: Show a clear message "Completa el diagnóstico en Análisis para poder definir el plan de tratamiento." with a button "Ir a Análisis →" that navigates to the Assessment section.
- When diagnosis exists: Show all Plan fields as editable.

**Data storage:**

- Plan fields should be stored in the `evaluation.diagnosis` JSON field as a `plan` sub-object, or in a new top-level JSON field on the Evaluation model. The simplest approach: store as part of the diagnosis JSON since the Plan is clinically derived from the Assessment.

#### FR5: Auto-Save Feedback Indicator

Add a subtle save status indicator visible at all times:

- When auto-saving: `Guardando...` (muted text)
- After auto-save completes: `✓ Guardado` (muted text, fades after 2 seconds)
- On error: `Error al guardar` (red text)

Position: Near the manual "Guardar Evaluación" button or at the top of the form.

### Reusability Opportunities

- VoiceRecorder component — already in Subjective section, can be promoted to Plan section for voice-dictation of interventions and exercises
- Existing `useDebounce` auto-save pattern — extend with visible status indicator
- Existing `activeSection` navigation pattern — no changes needed to navigation logic
- CaseDetailLayout viewMode switching — reuse for "Ver cronograma" navigation from Plan
- Existing toast pattern — already used for save confirmation, complement with inline indicator

### Scope Boundaries

**In Scope:**

- Fix all English→Spanish language violations in EvaluationForm.tsx
- Add persistent labels above all input fields
- Add helper text for Assessment fields
- Add section descriptions for all 4 SOAP sections
- Add numeric value display to pain scale sliders
- Make Plan section functional with editable treatment intention fields
- Add auto-save status indicator
- Store Plan data in the Evaluation model
- Add "Ir a Análisis" and "Ver cronograma" navigation links

**Out of Scope:**

- Redesigning the overall form layout or navigation pattern
- Adding icons, color-coded sections, or progress indicators
- Changes to the Cronograma/TreatmentTimeline components
- Changes to the CaseDetailLayout navigation tabs
- Backend API changes (Plan data stored in existing JSON fields)
- Adding new Prisma schema fields (use existing JSON fields)
- Changes to other components (PatientProfile, ComparisonBoard, etc.)
- Mobile-specific responsive design changes
- Adding VoiceRecorder to Plan section (future enhancement)
- Test changes beyond what's needed for modified functionality

### Technical Considerations

- **Frontend-only changes:** All changes are in `EvaluationForm.tsx` (~466 lines). No backend or schema changes needed — Plan data can be stored in the existing `evaluation.diagnosis` JSON field as a nested `plan` object.
- **ADR 008 compliance:** The code variables, props, and component names stay in English. Only user-facing strings change to Spanish.
- **Auto-save compatibility:** Plan fields must integrate with the existing debounced auto-save pattern. The `buildPayload()` function needs to include Plan data in the evaluation payload.
- **Test impact:** The existing `EvaluationForm.test.tsx` references English strings like `'Guardar Evaluación'` (this is already Spanish). Tests referencing English tab labels or section headings will need updates.
- **Data shape:** Plan data should follow the same pattern as `diagnosis` — a JSON object with string fields. Suggested shape: `{ plan: { interventions: string, frequency: string, homeExercises: string, nextVisit: string, additionalNotes: string } }` stored inside `evaluation.diagnosis.plan` or as a separate `evaluation.plan` field if the backend allows arbitrary JSON fields.
- **Touch targets:** All new form elements must meet the 60px minimum for primary actions, 44px minimum for all interactive elements (tablet-first design from spec 9.11).

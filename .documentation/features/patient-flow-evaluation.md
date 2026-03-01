# Patient Flow Evaluation (SOAP)

This document explains how Mamirri handles clinical evaluation using the SOAP structure and why the flow is organized this way for day-to-day physiotherapy use.

## Use the SOAP flow in this order

Mamirri uses a diagnosis-first SOAP flow:

1. **S - Subjetivo**
2. **O - Objetivo**
3. **A - Analisis**
4. **P - Plan**

The key rule is simple: complete **Analisis** before working in **Plan**.

## What each section is for

### S - Subjetivo

Capture what the patient reports in their own words: symptoms, history, and chief complaint.

### O - Objetivo

Capture measurable findings:

- Pain scale (`Actividad`, `Reposo`, `Palpacion`, 0-10)
- Orthopedic tests added on demand (not all shown by default)
- Clinical observations recorded during examination

### A - Analisis

Document clinical reasoning and diagnosis using these fields:

- `functionalIndicator`
- `clinicalAspect`
- `anatomopathology`
- `avdConsequences`

### P - Plan

Define what will happen next. This section is for treatment intent, not session logging.

Plan includes:

- Planned interventions
- Frequency and duration
- Home exercises
- Next visit focus
- Additional notes (education, referrals, discharge notes)

## How Plan relates to Cronograma

**Plan** and **Cronograma** are related, but they are not the same thing:

- **Plan (SOAP):** what the therapist intends to do next
- **Cronograma (Timeline):** what was actually executed session by session

From the Plan tab, the therapist can jump to timeline management with **Ver cronograma de tratamiento**.

## Data model used by this flow

- One clinical case has one active evaluation (`ClinicalCase.evaluation`)
- SOAP data is stored inside `Evaluation` JSON fields
- Plan details are stored under `diagnosis.plan`

This keeps the model practical for real-world clinics where many cases do not run through full multi-evaluation cycles.

## UX decisions in the current implementation

- All user-facing SOAP labels are Spanish (ADR 008)
- Inputs use persistent labels (not placeholder-only)
- Assessment fields include helper text so context stays clear after typing
- Plan tab is actionable and no longer informational-only
- Save feedback is visible (`Guardando...`, `✓ Guardado`, `Error al guardar`)

---

**Last Modified:** 2026-02-27

**Related Documents:**

- [Language Strategy (ADR 008)](../product/decisions/008-language-strategy-english-code-spanish-ui.md)
- [Patient Journey Flow (Technical)](../technical/pacient_flow.md)
- [Patients Module Technical Specification](../technical/patients-module.md)

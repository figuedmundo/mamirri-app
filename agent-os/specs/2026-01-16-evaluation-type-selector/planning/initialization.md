# Initial Idea: Evaluation Type Selector

**Task:** 6.15 from roadmap

Add `type` field to Evaluation UI with a selector for INITIAL / FINAL evaluation types.

## Requirements

- **EvaluacionForm** should prompt user to select evaluation type when creating a new evaluation
- Display evaluation type badge in CaseDetailLayout header
- Support only two evaluation types: INITIAL and FINAL (no PROGRESS type)
- Progress tracking is done through TreatmentSession records, not full evaluations

## Clinical Context

Based on the doctor's clarification:

- Patients undergo **two formal comprehensive evaluations**: Initial (baseline) and Final (outcome)
- "Seguimiento del avance" (progress tracking) is done via per-session TreatmentSession records
- This aligns with the original flow idea from PACIENTES_FLOW.md

## Language Strategy

- Code: English (`EvaluationType`, `INITIAL`, `FINAL`)
- UI: Spanish ("Evaluación Inicial", "Evaluación Final")

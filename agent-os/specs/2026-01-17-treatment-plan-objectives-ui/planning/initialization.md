# Spec Initialization: Treatment Plan Objectives UI

## Raw Idea (From Roadmap 6.17)

> **6.17** Treatment Plan Objectives UI — Display therapeutic/prophylactic/educational goals
>
> - Add objectives section to CaseDetailLayout (Stage 2 of clinical flow)
> - Wire to `TreatmentPlan.objectives` from backend

## Context

This feature represents **Stage 2** of the 6-stage clinical flow:

1. Stage 1: Initial Evaluation (Anamnesis, Physical Exam, Posturogram)
2. **Stage 2: Treatment Plan Objectives** (Definition of therapeutic, prophylactic, and educational goals)
3. Stage 3-5: Treatment Execution (Progressive phases of intervention)
4. Stage 6: Final Evaluation and Discharge

## Current State

### Backend (Ready)

- `TreatmentPlan` Prisma model exists with `objectives: Json` field
- No dedicated endpoints for updating objectives (managed as part of ClinicalCase)

### Frontend (Partially Ready)

- `TreatmentObjectives` interface defined in `types/patient.ts`:
  ```typescript
  interface TreatmentObjectives {
    therapeutic: string;
    prophylactic: string;
    educational: string;
  }
  ```
- `CaseDetailLayout` manages clinical case view with 4 modes:
  - `timeline` (TreatmentTimeline)
  - `session-detail` (SessionDetailView)
  - `evaluation` (EvaluationForm)
  - `comparison` (ComparisonBoard)
- No dedicated "Objectives" view exists yet

## Spec Path

`agent-os/specs/2026-01-17-treatment-plan-objectives-ui/`

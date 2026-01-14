# Specification: Database Schema Patients

## Goal

Finalize and refine the Prisma database schema for the Patients module to support clinical cases, multiple evaluations, and treatment sessions with flexible data structures.

## User Stories

- As a developer, I want a robust and flexible database schema so that I can implement the Patients module features efficiently without constant schema changes.
- As a physiotherapist, I want to record an initial evaluation and subsequent progress evaluations for a single clinical case so that I can objectively demonstrate improvement over time.

## Specific Requirements

**Refine Patient & ClinicalCase Models**

- Review and confirm existing `Patient` model fields (id, personal info, therapist relation).
- Ensure `ClinicalCase` model retains `Json` fields for `pathologicalHistory` to allow flexible medical history storage.
- Ensure `ClinicalCase` supports 1:N relation with `Evaluation` (change from current 1:1).

**Update Evaluation Model Cardinality**

- Change `Evaluation` relation to be **1:N** with `ClinicalCase` (One Case -> Many Evaluations).
- Add a `type` field (String or Enum) to `Evaluation` to categorize records (e.g., 'INITIAL', 'PROGRESS', 'FINAL').
- Remove unique constraint on `clinicalCaseId` in `Evaluation` model.

**Flexible Data Types (JSON)**

- Retain `Json` data type for `orthopedicTests`, `avdEvaluation`, `diagnosis`, and `posturogram` in `Evaluation` model.
- Retain `Json` data type for `painScale` in `Evaluation` model to support rich pain mapping (location, type, intensity).
- Retain `String[]` (array) for `procedures` in `TreatmentSession` for simplicity.

**Simple Progress Tracking**

- Ensure `TreatmentSession` model uses a simple `Int` field (`finalPainLevel`) for tracking session-by-session pain progress (0-10 scale).
- Ensure `TreatmentSession` retains `phaseNumber` (Int) to align with treatment plans.

**Schema Migration**

- Create a new Prisma migration (`pnpm prisma migrate dev`) to apply these changes.
- Ensure the migration is named descriptively (e.g., `refine_patients_schema`).

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**apps/server/prisma/schema.prisma**

- Use the existing `Patient`, `ClinicalCase`, `Evaluation`, and `TreatmentSession` model definitions as the base.
- modify the relation attribute `@relation(fields: [clinicalCaseId], references: [id])` in `Evaluation` to remove `@unique`.

## Out of Scope

- Implementation of API Endpoints (Controllers/Services) for these models.
- Frontend UI integration.
- Data migration for existing production data (assuming development environment).
- Database-level `CHECK` constraints (validation will be handled at the Application layer).

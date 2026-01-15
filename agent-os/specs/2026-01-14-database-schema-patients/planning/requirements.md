# Spec Requirements: Database Schema Patients

## Initial Description

Database schema: Patient, ClinicalCase, Evaluation, TreatmentSession

## Requirements Discussion

### First Round Questions

**Q1:** Existing Schema Status: Are the current definitions in schema.prisma considered final, or is the goal of this task to review, refine, and "bless" them?
**Answer:** Review.

**Q2:** JSON vs. Relations: Should we keep fields like pathologicalHistory and orthopedicTests as Json or normalize them?
**Answer:** Yes, keep as JSON for flexibility. It is very difficult to map all possible values for diagnosis/evaluations/tests, so JSON is better.

**Q3:** Validation (Task 5.9): DB-level CHECK constraints or Application-level validation?
**Answer:** Suggestion accepted (Application-level).

**Q4:** Evaluation Cardinality: 1:1 or 1:N?
**Answer:** Requested suggestion on appropriate industry standards.

**Q5:** Treatment Procedures: String array or separate table?
**Answer:** Keep it simple (String array).

**Q6:** Pain Scale Consistency: Why is painScale Json in Evaluation but Int in Session?
**Answer:** User asked for reasoning; accepted explanation that Evaluation requires rich mapping while Session requires simple tracking.

### Follow-up Questions

**Follow-up 1:** Pain Scale distinction (Json for rich initial data, Int for session progress)?
**Answer:** Yes.

**Follow-up 2:** Evaluation Cardinality - Recommendation for 1:N to support "Before/After" comparison?
**Answer:** User asked for industry standards.
_Decision:_ We will adopt **1:N** (One Case has Many Evaluations). This is the industry standard for "Episodes of Care", allowing an Initial Evaluation, potential Re-evaluations, and a Final/Discharge Evaluation to objectively measure progress (Before vs. After).

**Follow-up 3:** Validation Strategy - Confirming Application-level (DTOs)?
**Answer:** Agree.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Refine Prisma Schema**: Update `apps/server/prisma/schema.prisma` to finalize the data structure for the "Pacientes" module.
- **Evaluation Cardinality Change**:
  - Change `ClinicalCase` ↔ `Evaluation` relation from 1:1 to **1:N**.
  - Add a discriminator field to `Evaluation` (e.g., `type` or `phase`) to identify "INITIAL", "INTERMEDIATE", "FINAL".
- **JSON Fields**:
  - Retain `Json` type for complex, variable clinical data: `pathologicalHistory` (ClinicalCase), `orthopedicTests`, `avdEvaluation`, `painScale`, `diagnosis`, `posturogram` (Evaluation).
- **Simple Arrays**:
  - Retain `procedures` in `TreatmentSession` as `String[]`.
- **Pain Tracking**:
  - `Evaluation`: Complex `Json` object (location, quality, intensity).
  - `TreatmentSession`: Simple `Int` (0-10) for `finalPainLevel`.

### Reusability Opportunities

- **Existing Schema**: The current `apps/server/prisma/schema.prisma` is the starting point.
- **Existing Patients Module**: `apps/server/src/modules/patients` structure.

### Scope Boundaries

**In Scope:**

- modifying `schema.prisma`
- Generating and applying the migration (`pnpm prisma migrate dev`)
- Updating `Patient`, `ClinicalCase`, `Evaluation`, `TreatmentSession` models if needed.

**Out of Scope:**

- Creating API endpoints (Controller/Service logic) - handled in separate tasks.
- Frontend integration.
- Data migration scripts for existing production data (assuming greenfield/dev stage).

### Technical Considerations

- **Validation**:
  - Implement validation logic in DTOs (using `class-validator`) rather than DB constraints.
  - Pain Scale: 0-10.
  - Barthel Index: 0-100.
- **Database**: PostgreSQL with `pgvector` enabled (already in stack).
- **Naming Conventions**: Follow existing PascalCase for models and camelCase for fields.

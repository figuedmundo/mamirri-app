# Task Breakdown: Database Schema Patients

## Overview

Total Tasks: 2

## Task List

### Database Layer

#### Task Group 1: Data Models and Migrations

**Dependencies:** None

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 2-8 focused tests for Evaluation model functionality
    - Limit to 2-8 highly focused tests maximum
    - Test only critical model behaviors:
      - Creating multiple evaluations for a single case (1:N relation)
      - Storing JSON data in evaluation fields
    - Skip exhaustive coverage of all methods and edge cases
  - [x] 1.2 Update Prisma Schema
    - Modify `Evaluation` model:
      - Remove `@unique` constraint from `clinicalCaseId` to allow 1:N relation
      - Add `type` field (String) to categorize evaluations ('INITIAL', 'PROGRESS', 'FINAL')
      - Ensure JSON fields (`orthopedicTests`, `avdEvaluation`, `painScale`, `diagnosis`, `posturogram`) are preserved
    - Verify `ClinicalCase` model:
      - Ensure `pathologicalHistory` is `Json`
    - Verify `TreatmentSession` model:
      - Ensure `procedures` is `String[]`
      - Ensure `finalPainLevel` is `Int`
  - [x] 1.3 Create and Apply Migration
    - Run `pnpm prisma migrate dev --name refine_patients_schema`
    - Verify migration SQL file is created correctly
    - Verify database schema is updated
  - [x] 1.4 Generate Prisma Client
    - Run `pnpm prisma generate` to update client types
  - [x] 1.5 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify migrations run successfully
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 1.1 pass
- `Evaluation` model supports multiple records per `ClinicalCase`
- `Evaluation` model has a `type` field
- JSON fields are correctly typed in Prisma Client
- Migration is successfully applied to the database

### Testing

#### Task Group 2: Test Review & Gap Analysis

**Dependencies:** Task Group 1

- [x] 2.0 Review existing tests and fill critical gaps only
  - [x] 2.1 Review tests from Task Group 1
    - Review the 2-8 tests written by database-engineer (Task 1.1)
  - [x] 2.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage (e.g., retrieving sorted evaluations by date)
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
  - [x] 2.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points (e.g., ensuring ClinicalCase includes Evaluations in query)
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 2.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1 and 2.3)
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass
- Critical user workflows (1:N evaluation storage) are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. Database Layer (Task Group 1)
2. Test Review & Gap Analysis (Task Group 2)

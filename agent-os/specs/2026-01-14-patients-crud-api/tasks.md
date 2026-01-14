# Task Breakdown: Patients CRUD API

## Overview

Total Tasks: 2

## Task List

### API Layer

#### Task Group 1: API Refactoring and Validation

**Dependencies:** None

- [x] 1.0 Complete API layer refactoring and validation
  - [x] 1.1 Write 2-8 focused tests for PatientsController and DTO validation
    - Limit to 2-8 highly focused tests maximum
    - Test only critical controller actions:
      - Creating a patient with valid/invalid data (DTO validation)
      - Accessing a patient owned by another therapist (Isolation check)
      - Returning 404 for unauthorized access
    - Skip exhaustive testing of all actions and scenarios
  - [x] 1.2 Update DTOs with Validation
    - Update `CreatePatientDto`:
      - Add `class-validator` rules for all fields
      - Enforce `age` as positive integer
      - Enforce `name` length constraints
    - Update `UpdatePatientDto`:
      - Ensure PartialType works correctly with new validation rules
    - Update/Create `UpdateEvaluationDto` (or relevant DTO for Task 5.9 validation):
      - Add validation for `painScale` (Int 0-10)
      - Add validation for `barthelIndex` (Int 0-100) if applicable
  - [x] 1.3 Refactor PatientsService for Type Safety
    - Remove `any` return types
    - Implement `PaginatedResponseDto<T>` for `findAll`
    - Ensure strict typing for all method inputs and outputs
  - [x] 1.4 Refactor PatientsController for Isolation and Responses
    - Ensure `findOne`, `update`, `remove` explicitly use `therapistId` in `where` clause
    - Verify `404 Not Found` is thrown instead of `403` for missing/unauthorized resources
    - Update `findAll` to return `PaginatedResponseDto`
  - [x] 1.5 Ensure API layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify critical CRUD operations and validation work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 1.1 pass
- DTOs prevent invalid data (pain > 10, etc.)
- API returns 404 for IDOR attempts
- `findAll` returns typed, paginated response
- `any` types removed from Service

### Testing

#### Task Group 2: Test Review & Gap Analysis

**Dependencies:** Task Group 1

- [x] 2.0 Review existing tests and fill critical gaps only
  - [x] 2.1 Review tests from Task Group 1
    - Review the 2-8 tests written by api-engineer (Task 1.1)
  - [x] 2.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to strict isolation and validation
    - Do NOT assess entire application test coverage
  - [x] 2.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points (e.g., Service <-> DB isolation)
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 2.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1 and 2.3)
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass
- Critical user workflows (isolation, validation) are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. API Layer (Task Group 1)
2. Test Review & Gap Analysis (Task Group 2)

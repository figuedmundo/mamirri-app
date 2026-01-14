# Task Breakdown: Clinical Cases CRUD API

## Overview

Total Tasks: 2

## Task List

### API Layer

#### Task Group 1: Clinical Cases Module Implementation

**Dependencies:** None

- [x] 1.0 Implement Clinical Cases Module
  - [x] 1.1 Write 2-8 focused tests for ClinicalCasesController
    - Limit to 2-8 highly focused tests maximum
    - Test only critical behaviors:
      - Creating a case for a patient owned by the therapist
      - Creating a case for a patient NOT owned by the therapist (404 check)
      - Listing cases with filters (status, patientId)
      - Accessing a single case detail with evaluations included
    - Skip exhaustive coverage of all DTO validation edge cases (covered by unit tests)
  - [x] 1.2 Create DTOs with Validation
    - `CreateClinicalCaseDto`:
      - `patientId`: UUID, required
      - `title`: String, min 3 chars, required
      - `consultationReason`: String, optional
    - `UpdateClinicalCaseDto`:
      - `status`: Enum (active/completed/inactive)
      - `title`: String, min 3 chars, optional
      - `consultationReason`: String, optional
  - [x] 1.3 Implement ClinicalCasesService
    - `create`: Transactional creation, verifying `patientId` ownership first
    - `findAll`: Paginated list with filters (`status`, `patientId`, `search`)
    - `findOne`: Detailed view with `evaluations` and `treatmentSessions` included
    - `update`: Verify ownership, update fields
    - `remove`: Verify ownership, soft delete (`deletedAt`)
  - [x] 1.4 Implement ClinicalCasesController
    - Apply `JwtAuthGuard`
    - Endpoints: `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
    - Use `CurrentTherapist` decorator for `userId`
  - [x] 1.5 Ensure API layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify module works end-to-end
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 1.1 pass
- Module is registered in `AppModule`
- CRUD operations function with strict therapist isolation (404 on unauthorized access)
- Pagination works correctly

### Testing

#### Task Group 2: Test Review & Gap Analysis

**Dependencies:** Task Group 1

- [x] 2.0 Review existing tests and fill critical gaps only
  - [x] 2.1 Review tests from Task Group 1
    - Review the 2-8 tests written by api-engineer (Task 1.1)
  - [x] 2.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to `ClinicalCase` lifecycle and ownership
    - Do NOT assess entire application test coverage
  - [x] 2.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points (e.g., verifying `evaluations` are included in `findOne`)
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 2.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1 and 2.3)
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass
- Critical user workflows are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. API Layer (Task Group 1)
2. Test Review & Gap Analysis (Task Group 2)

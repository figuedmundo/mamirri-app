# Spec Requirements: Clinical Cases CRUD API

## Initial Description

API endpoints: Clinical cases CRUD

## Requirements Discussion

### First Round Questions

**Q1:** Scope Verification: Dedicated Controller/Service or extend Patients?
**Answer:** Accepted recommendation: Dedicated `ClinicalCasesModule` with its own Controller/Service to follow Single Responsibility Principle.

**Q2:** Filtering & Status: Support filtering by status?
**Answer:** Accepted recommendation: Implement filtering by `status` (active, completed, archived) and `patientId`.

**Q3:** Creation Workflow: Nested or Flat?
**Answer:** Accepted recommendation: Flat structure (`POST /cases`) with `patientId` in body for standard REST practices.

**Q4:** Closing a Case: Strict validation or simple status update?
**Answer:** Accepted recommendation: Simple status update for MVP to maintain flexibility.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Dedicated Module**: Create `apps/server/src/modules/clinical-cases` with Controller and Service.
- **CRUD Endpoints**:
  - `POST /cases`: Create a new case (requires `patientId`).
  - `GET /cases`: List cases (support filters: `patientId`, `status`, `search`).
  - `GET /cases/:id`: Get detailed case info (include Evaluations/Sessions).
  - `PATCH /cases/:id`: Update case details (title, status, etc.).
  - `DELETE /cases/:id`: Soft delete case.
- **Therapist Isolation**: strict enforcement that a therapist can only manage cases for patients they own.
- **Filtering**: Support query params for `status` ('active', 'completed') and `patientId`.
- **Validation**:
  - `title`: Required, min length.
  - `patientId`: Required, must exist and belong to therapist.
  - `status`: Enum validation.

### Reusability Opportunities

- **Prisma Service**: Reuse existing DB connection.
- **Auth Guard**: Reuse `JwtAuthGuard` and `CurrentTherapist` decorator.
- **Pagination**: Reuse `PaginatedResponseDto` created in previous task.
- **Validation**: Reuse `class-validator` patterns.

### Scope Boundaries

**In Scope:**

- Backend API implementation only.
- Integration tests for the new module.
- DTOs and Validation.

**Out of Scope:**

- Frontend UI integration.
- "Closing" logic with strict validation (e.g., must have final eval) - deferred to later.
- Specialized analysis endpoints (handled in separate tasks).

### Technical Considerations

- **Security**: Return 404 Not Found if `patientId` or `caseId` doesn't belong to the logged-in therapist.
- **Data Integrity**: Ensure `patientId` is valid on creation.

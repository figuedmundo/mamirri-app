# Spec Requirements: Patients CRUD API

## Initial Description

API endpoints: Patients CRUD with therapist isolation

## Requirements Discussion

### First Round Questions

**Q1:** Scope Verification: Is the goal to verify/validate the existing CRUD or add missing features?
**Answer:** Verify.

**Q2:** Validation (Task 5.9): Should this be implemented here or separately?
**Answer:** User asked for suggestion.

**Q3:** Error Handling: Specific error codes for therapist isolation (404 vs 403)?
**Answer:** User asked for suggestion.

**Q4:** Pagination/Filtering: Are additional filters needed beyond search?
**Answer:** Simple for now.

### Follow-up Questions

**Follow-up 1:** Validation Strategy - Recommendation to include Task 5.9 validation (Pain scale, Barthel index) in DTOs now?
**Answer:** Proceed.

**Follow-up 2:** Error Handling - Recommendation to use 404 Not Found for IDOR prevention?
**Answer:** Proceed.

**Follow-up 3:** Refactoring Check - Recommendation to add `PaginatedResponseDto` for type safety?
**Answer:** Proceed.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Verify & Refine CRUD**: Ensure `create`, `findAll`, `findOne`, `update`, `remove` endpoints in `PatientsController` are robust.
- **Therapist Isolation**: Enforce strict checks so users can only access their own patients. Return `404 Not Found` if accessing unauthorized resources to prevent IDOR.
- **Validation**: Implement `class-validator` rules in DTOs:
  - Pain Scale: Integer 0-10.
  - Barthel Index: Integer 0-100.
  - Existing fields (name, age, etc.) should have proper constraints.
- **Pagination**: Standardize the `findAll` response with a `PaginatedResponseDto` (data, meta).

### Reusability Opportunities

- **Existing Controller/Service**: `apps/server/src/modules/patients/patients.controller.ts` and `patients.service.ts` serve as the base.
- **Prisma Service**: Use existing `PrismaService` for DB access.

### Scope Boundaries

**In Scope:**

- Updating `CreatePatientDto`, `UpdatePatientDto`, and related DTOs.
- Refactoring `PatientsService` and `PatientsController` for type safety and validation.
- Adding unit/integration tests to verify isolation and validation.

**Out of Scope:**

- New features not related to CRUD (e.g., file upload endpoints, complex reporting).
- Frontend integration (handled in separate tasks).

### Technical Considerations

- **Security**: 404 for unauthorized access.
- **Type Safety**: No `any` types in Service returns.
- **Testing**: Ensure coverage for validation failure cases and cross-user access attempts.

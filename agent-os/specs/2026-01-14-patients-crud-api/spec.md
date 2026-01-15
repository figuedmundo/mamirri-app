# Specification: Patients CRUD API

## Goal

Verify and refine the existing Patients CRUD API to ensure strict therapist data isolation, robust validation for clinical data, and standardized pagination responses.

## User Stories

- As a therapist, I want to securely manage only my own patients so that patient data privacy is guaranteed.
- As a therapist, I want the system to reject invalid clinical data (like pain scales > 10) so that my records remain accurate.
- As a developer, I want standardized API responses and error codes so that the frontend integration is consistent and predictable.

## Specific Requirements

**Therapist Isolation**

- Ensure all CRUD operations (`findOne`, `update`, `remove`) explicitly filter by `therapistId` in the database query.
- Return `404 Not Found` (instead of 403) when a user attempts to access a patient ID that does not belong to them, preventing IDOR.

**Data Validation**

- Implement `class-validator` rules for `CreatePatientDto` and `UpdatePatientDto`.
- Enforce Pain Scale validation: Integer between 0 and 10.
- Enforce Barthel Index validation: Integer between 0 and 100.
- Enforce constraints on core fields (e.g., `name` length, `age` positive integer).

**Standardized Pagination**

- Refactor `findAll` to return a typed `PaginatedResponseDto<T>` instead of `any`.
- Response structure: `{ data: Patient[], meta: { total, page, lastPage } }`.

**Refactoring & Type Safety**

- Remove `any` types from `PatientsService` methods.
- Ensure `PatientsController` methods return properly typed DTOs.

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**apps/server/src/modules/patients/patients.controller.ts**

- Existing controller methods (`create`, `findAll`, `findOne`, `update`, `remove`) will be the starting point for refactoring.

**apps/server/src/modules/patients/patients.service.ts**

- Existing service logic will be enhanced with stricter isolation checks and type definitions.

**apps/server/src/modules/patients/dto/\*.dto.ts**

- Existing DTOs will be updated with new validation decorators.

## Out of Scope

- Frontend UI components or integration.
- New features like file uploads or complex reporting endpoints.
- Authorization roles beyond "Therapist" (e.g., Admin).

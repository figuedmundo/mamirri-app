# Specification: Clinical Cases CRUD API

## Goal

Implement a dedicated backend module for managing Clinical Cases to enable therapists to track patient "Episodes of Care" independently from the patient profile, supporting lifecycle management and filtering.

## User Stories

- As a therapist, I want to create a new clinical case for a patient so that I can group related treatment sessions and evaluations.
- As a therapist, I want to filter my cases by status (active/completed) so that I can focus on current patients.
- As a therapist, I want to see a detailed view of a case including its history so that I can make informed clinical decisions.

## Specific Requirements

**Dedicated ClinicalCases Module**

- Generate a new NestJS module: `apps/server/src/modules/clinical-cases`.
- Implement `ClinicalCasesController` and `ClinicalCasesService`.

**CRUD Endpoints**

- `POST /cases`: Create a case. Body: `{ patientId: string, title: string, consultationReason?: string }`.
- `GET /cases`: List cases. Query params: `page`, `limit`, `patientId`, `status`, `search`.
- `GET /cases/:id`: Get single case. Response must include `evaluations` and `treatmentSessions`.
- `PATCH /cases/:id`: Update case. Body: `status` (active/completed/inactive), `title`, `consultationReason`.
- `DELETE /cases/:id`: Soft delete case (set `deletedAt`).

**Security & Isolation**

- Apply `JwtAuthGuard` to all endpoints.
- Enforce strict ownership: A therapist can ONLY create/read/update cases for patients THEY own.
- Return `404 Not Found` (not 403) if accessing a case/patient that doesn't belong to the user.

**Validation**

- `CreateClinicalCaseDto`:
  - `patientId`: UUID, required.
  - `title`: String, min 3 chars, required.
- `UpdateClinicalCaseDto`:
  - `status`: Enum (`active`, `completed`, `inactive`).
- Use `class-validator` decorators.

**Response Format**

- Use `PaginatedResponseDto` for the list endpoint.
- Standard JSON response for single resources.

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**apps/server/src/modules/patients/patients.service.ts**

- Reference the existing `clinicalCases` relation logic in `findOne` to see how it's currently fetched.

**apps/server/src/common/dto/paginated-response.dto.ts**

- Reuse this DTO for the `GET /cases` response.

**apps/server/src/modules/auth/guards/jwt-auth.guard.ts**

- Use for route protection.

## Out of Scope

- Frontend UI components.
- Complex state transitions (e.g., preventing closure if no final evaluation).
- File uploads (handled in Media module).

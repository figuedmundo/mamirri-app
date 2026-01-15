# Specification: Treatment Sessions CRUD

## Goal

Implement a robust API module for managing Treatment Sessions (`TreatmentSession`), enabling therapists to record, track, and finalize clinical interventions. The system must support soft deletion and enforce immutability for finalized sessions to ensure clinical data integrity.

## User Stories

- As a **Therapist**, I want to **create a new treatment session** linked to a patient's case so I can document the procedures and observations from a visit.
- As a **Therapist**, I want to **finalize a session** so that it becomes a permanent legal record that cannot be accidentally modified.
- As a **Therapist**, I want to **view all my recent sessions** across all patients so I can review my daily activity log.

## Specific Requirements

**Database Schema Updates**

- Update `TreatmentSession` model in Prisma schema to include:
  - `status`: String/Enum (Default: `DRAFT`, Values: `DRAFT`, `COMPLETED`)
  - `deletedAt`: DateTime (Nullable, for soft deletion)
- Run Prisma migration to apply changes.

**Create Session**

- Endpoint: `POST /sessions`
- Payload must include `clinicalCaseId`, `date`, `procedures`, `patientResponse`, `finalPainLevel`, `observations`.
- Automatically link `therapistId` from the authenticated user.
- Validate `clinicalCaseId` belongs to a patient owned by the therapist.

**List Sessions (Global & Contextual)**

- Endpoint: `GET /sessions` (Global list for authenticated therapist)
- Endpoint: `GET /cases/:caseId/sessions` (Contextual list for specific case)
- Support pagination (`page`, `limit`) using `PaginatedResponseDto`.
- Support filtering by `status` (e.g., show only `DRAFT` sessions).

**Update Session (Draft Only)**

- Endpoint: `PATCH /sessions/:id`
- Allow updates to all fields EXCEPT `clinicalCaseId` and `therapistId`.
- **Constraint:** Reject updates if session `status` is `COMPLETED` (HTTP 400 or 403).

**Finalize Session**

- Endpoint: `PATCH /sessions/:id/finalize`
- Action: Set `status` to `COMPLETED`.
- **Constraint:** Once completed, no further edits are allowed via the standard Update endpoint.

**Delete Session (Soft Delete)**

- Endpoint: `DELETE /sessions/:id`
- Action: Set `deletedAt` to current timestamp.
- Update all "List" and "Get" queries to exclude records where `deletedAt` is not null.

**Authorization & Security**

- Apply `JwtAuthGuard` to all endpoints.
- Ensure strict ownership: Users can only create/read/update/delete sessions linked to _their_ patients.

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**`PaginatedResponseDto`**

- Reuse `apps/server/src/common/dto/paginated-response.dto.ts` to ensure consistent pagination response structure across the API.

**`ClinicalCasesController`**

- Reference `apps/server/src/modules/clinical-cases/clinical-cases.controller.ts` for:
  - `@CurrentTherapist()` decorator usage.
  - CRUD method naming conventions (`create`, `findAll`, `findOne`, `update`, `remove`).
  - Swagger documentation decorators (`@ApiOperation`, `@ApiResponse`).

**`ClinicalCasesService`**

- Reference ownership validation logic to replicate: "Check if Clinical Case belongs to a Patient who belongs to this User."

## Out of Scope

- **Voice/Audio file uploading:** `voiceNotes` field will accept JSON but no file processing logic will be implemented yet.
- **Procedures Validation:** No validation against a medical dictionary; free-text strings are accepted.
- **Frontend Implementation:** This spec covers only the backend API and database changes.
- **Hard Deletion:** No endpoint for permanent database removal.

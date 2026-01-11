# Implementation Report: API Layer

## Status

- **Date**: 2026-01-10
- **Task Group**: 3 (Controller and Service Implementation)
- **Status**: Completed

## Changes Implemented

### 1. Patients Controller (`PatientsController`)

- Implemented standard CRUD operations:
  - `POST /patients` (Create)
  - `GET /patients` (List with pagination & search)
  - `GET /patients/:id` (Get single)
  - `PATCH /patients/:id` (Update)
  - `DELETE /patients/:id` (Soft delete)
- **Security**: Protected with `JwtAuthGuard`.
- **Validation**: Uses `ValidationPipe` (via global setup or DTOs).
- **Documentation**: Fully annotated with `@nestjs/swagger`.
- **Data Transformation**: Maps Prisma entities to `PatientResponseDto` to exclude internal fields like `therapistId`.

### 2. Patients Service (`PatientsService`)

- Implemented business logic using `PrismaService`.
- **Soft Delete**: Filters queries by `deletedAt: null` and sets `deletedAt` on removal.
- **Data Isolation**: Enforces `therapistId` checks on all operations.
- **Pagination**: Implemented `skip`/`take` logic.
- **Search**: Implemented basic search on `firstName` OR `lastName`.

### 3. Decorators

- Created `@CurrentTherapist()` decorator to extract user from request.

### 4. Module Configuration

- Updated `PatientsModule` to register Controller and Service and export Service.

### 5. Testing

- Created unit tests for `PatientsController` covering all endpoints.
- Verified:
  - `create` calls service with correct DTO and user ID.
  - `findAll` passes pagination and search params.
  - `findOne` and `update` verify ownership via service.
  - `remove` triggers soft delete.

## Verification Results

- **Tests Passed**: 6/6 tests in `patients.controller.spec.ts`.
- **Linting**: No linting errors reported in modified files (ignoring transient Prisma type issues in editor).

## Next Steps

- Proceed to Task Group 4: Global Configuration (Registering ValidationPipe).

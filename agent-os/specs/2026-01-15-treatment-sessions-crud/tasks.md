# Task Breakdown: Treatment Sessions CRUD

## Overview

Total Tasks: 2

## Task List

### Database Layer

#### Task Group 1: Data Models and Migrations

**Dependencies:** None

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 2-8 focused tests for `TreatmentSession` model functionality
    - Limit to 2-8 highly focused tests maximum
    - Test only critical model behaviors (e.g., status defaults, soft deletion flag)
    - Skip exhaustive coverage of all methods and edge cases
  - [x] 1.2 Update `TreatmentSession` model in Prisma schema
    - Add `status` (Enum/String, default: DRAFT)
    - Add `deletedAt` (DateTime, nullable)
    - Run `prisma generate`
  - [x] 1.3 Create migration for `treatment_sessions` table
    - Run `prisma migrate dev`
  - [x] 1.4 Ensure database layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify migrations run successfully
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 1.1 pass
- `TreatmentSession` model supports `status` and `deletedAt`
- Migrations run successfully

### API Layer

#### Task Group 2: API Endpoints (Sessions Module)

**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer
  - [x] 2.1 Write 2-8 focused tests for Sessions API endpoints
    - Limit to 2-8 highly focused tests maximum
    - Test only critical controller actions:
      - Create session (ownership check)
      - Finalize session (immutability check)
      - Soft delete session
    - Skip exhaustive testing of all actions and scenarios
  - [x] 2.2 Create `SessionsModule`, `SessionsController`, and `SessionsService`
    - Setup module structure
    - Implement `create` (POST /sessions)
    - Implement `findAll` (GET /sessions) and `findAllByCase` (GET /cases/:caseId/sessions)
    - Implement `findOne` (GET /sessions/:id)
    - Implement `update` (PATCH /sessions/:id) - Block updates if completed
    - Implement `finalize` (PATCH /sessions/:id/finalize)
    - Implement `remove` (DELETE /sessions/:id) - Soft delete
  - [x] 2.3 Implement authentication/authorization
    - Use `JwtAuthGuard`
    - Use `@CurrentTherapist()`
    - Enforce ownership checks (Therapist -> Patient -> Case -> Session)
  - [x] 2.4 Add API response formatting & Swagger docs
    - Use `PaginatedResponseDto`
    - Add `@ApiOperation` and `@ApiResponse` decorators
  - [x] 2.5 Ensure API layer tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify critical CRUD operations work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 2.1 pass
- All CRUD operations work as specified
- "Finalize" endpoint correctly locks the session
- Soft delete works (record remains, `deletedAt` is set)
- Contextual and Global list endpoints work correctly

## Execution Order

Recommended implementation sequence:

1. Database Layer (Task Group 1)
2. API Layer (Task Group 2)

**Note:** Frontend implementation is explicitly out of scope for this spec.

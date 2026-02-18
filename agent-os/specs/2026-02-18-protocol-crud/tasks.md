# Task Breakdown: Protocol CRUD (Admin)

## Overview

Total Tasks: 4

## Task List

### Database Layer

#### Task Group 1: Protocol Soft Delete Schema

**Dependencies:** None

- [x] 1.0 Complete Protocol soft delete schema
  - [x] 1.1 Write 2-4 focused tests for soft delete filtering behavior
    - Extend `apps/server/src/modules/library/library.service.spec.ts`:
      - Therapist protocol list/search does not return items with `deletedAt` set
      - Admin list supports `includeDeleted=true`
    - Keep tests focused on query shape and filtering only
  - [x] 1.2 Update Prisma schema for Protocol soft delete
    - Add `Protocol.deletedAt: DateTime?`
    - Add index on `deletedAt` (and consider `(categoryId, deletedAt)` if needed for list queries)
  - [x] 1.3 Create and apply migration
    - Generate Prisma migration for `deletedAt`
    - Verify migration applies cleanly locally and is reversible by Prisma migration rollback workflow
  - [x] 1.4 Ensure database-layer tests pass
    - Run ONLY the tests added/updated in 1.1 (do not run the full server test suite)

**Acceptance Criteria:**

- Prisma schema includes `Protocol.deletedAt`
- Migration exists and applies successfully
- Therapist-facing queries can filter out archived protocols
- The 2-4 tests in 1.1 pass

### API Layer

#### Task Group 2: Admin-Only Protocol CRUD Endpoints

**Dependencies:** Task Group 1

- [x] 2.0 Complete admin-only protocol CRUD API
  - [x] 2.1 Write 2-8 focused API/service tests
    - Extend `apps/server/src/modules/library/library.service.spec.ts` to cover:
      - Create protocol (happy path)
      - Update protocol (happy path)
      - Archive protocol sets `deletedAt` and excludes from therapist list/search
      - Restore protocol clears `deletedAt`
      - Add-to-plan blocks adding an archived protocol
      - One key authorization case (non-admin cannot call admin methods/paths)
  - [x] 2.2 Implement RBAC guard for admin-only actions
    - Add `@Roles('ADMIN')` decorator + RolesGuard (server-side enforcement)
    - Reuse guard wiring patterns from `apps/server/src/modules/auth/guards/jwt-auth.guard.ts`
    - Ensure JWT role claim is trusted only after signature verification (already done via JWT auth)
  - [x] 2.3 Add admin endpoints under library domain
    - `POST /api/v1/library/protocols` create
    - `PATCH /api/v1/library/protocols/:id` update
    - `DELETE /api/v1/library/protocols/:id` archive (204)
    - `POST /api/v1/library/protocols/:id/restore` restore
    - Support `includeDeleted=true` for admin list; ignore/forbid for non-admin
  - [x] 2.4 Update existing read/search behavior to respect archiving
    - Therapist list/search excludes `deletedAt != null`
    - Therapist protocol detail returns 404 for archived protocol
    - Ensure "add protocol to plan" flow checks protocol is not archived
  - [x] 2.5 Add DTO validation + Swagger annotations
    - Create DTO: title, categoryId, definition, rationale, procedure[], tags[], optional references
    - Update DTO: PartialType(CreateDto)
    - Keep error responses consistent (NotFound/Conflict/BadRequest)
  - [x] 2.6 Admin role bootstrap (dev usability)
    - Ensure there is at least one way to obtain an admin user in dev:
      - Option A: update `apps/server/prisma/seed.ts` to create an admin
      - Option B: document a manual DB update step for role=ADMIN
  - [x] 2.7 Ensure API layer tests pass
    - Run ONLY the tests added/updated in 2.1

**Acceptance Criteria:**

- Admin endpoints exist and are protected server-side (403 for non-admin)
- Archived protocols are excluded from therapist list/search/detail
- Restore re-enables protocol for therapist usage
- Add-to-plan blocks archived protocols
- DTO validation works via global ValidationPipe
- The 2-8 tests in 2.1 pass

### Frontend Components

#### Task Group 3: Admin Protocol CRUD UI

**Dependencies:** Task Group 2

- [x] 3.0 Complete admin protocol CRUD UI
  - [x] 3.1 Write 2-8 focused UI tests
    - Add a new test file for admin page (e.g., `apps/client/src/pages/AdminProtocols.test.tsx`):
      - Admin user can render the page
      - Non-admin user is blocked/redirected
      - Create protocol form validates required fields (1 key invalid case)
      - Archive shows confirmation and removes from default list
      - Toggle "Ver archivados" shows archived and enables restore
  - [x] 3.2 Add admin route and gating
    - Add `/admin/protocols` route in `apps/client/src/App.tsx`
    - Implement an admin-only gate component (new or extend existing) using `user.role`
    - Reuse auth baseline from `apps/client/src/components/auth/ProtectedRoute.tsx`
  - [x] 3.3 Create AdminProtocols page
    - List protocols with search + category filter
    - Toggle archived visibility
    - Actions per protocol: Edit, Archive/Restore
    - Reuse layout and card styling patterns from Biblioteca:
      - `apps/client/src/components/library/LibraryDashboard.tsx`
      - `apps/client/src/components/library/ProtocolList.tsx`
  - [x] 3.4 Create Protocol form UI (create/edit)
    - Use dialog pattern from `apps/client/src/pages/Patients.tsx`
    - Use zod validation pattern from `apps/client/src/components/patients/PatientForm.tsx`
    - Fields: title, category select, definition, rationale, procedure steps editor, tags
  - [x] 3.5 Wire API client + react-query hooks
    - Extend `apps/client/src/api/library.ts` with admin endpoints
    - Add hooks in `apps/client/src/hooks/use-library.ts` for create/update/archive/restore
    - Invalidate relevant cache keys in `apps/client/src/lib/query-keys.ts` (library.protocols)
    - Reuse mutation/toast patterns from `apps/client/src/hooks/use-patients.ts`
  - [x] 3.6 References linking UI (MVP)
    - Allow selecting existing references for a protocol (attach/detach)
    - Keep it admin-only; therapist continues to view references in `ProtocolDetailModal`
  - [x] 3.7 Ensure UI tests pass
    - Run ONLY the tests added/updated in 3.1

**Acceptance Criteria:**

- Admin can create/edit/archive/restore protocols from in-app UI
- Non-admin cannot access `/admin/protocols`
- Archived protocols are clearly labeled and hidden by default
- Create/edit forms validate and show field-level errors
- React-query cache invalidation keeps list/detail consistent
- The 2-8 tests in 3.1 pass

### Testing

#### Task Group 4: Test Review & Feature Verification (Feature-Only)

**Dependencies:** Task Groups 1-3

- [x] 4.0 Fill critical gaps only and verify core workflows
  - [x] 4.1 Review tests added in 1.1, 2.1, 3.1
  - [x] 4.2 Add up to 10 additional strategic tests maximum (only if needed)
    - Focus on one end-to-end happy path:
      - Admin creates protocol -> therapist sees it in Biblioteca -> admin archives -> therapist no longer sees it -> admin restores -> therapist sees it again
  - [x] 4.3 Run feature-specific tests only
    - Server: run only the library/service/controller tests updated for this spec
    - Client: run only admin protocols tests and any updated library UI tests

**Acceptance Criteria:**

- All feature-specific tests pass
- Critical workflows (admin CRUD + archive/restore + therapist visibility rules) are covered
- No more than 10 additional tests added in this group

## Execution Order

Recommended implementation sequence:

1. Database Layer (Task Group 1)
2. API Layer (Task Group 2)
3. Admin UI (Task Group 3)
4. Test Review & Verification (Task Group 4)

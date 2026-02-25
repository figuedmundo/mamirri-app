# Specification: Protocol CRUD

## Goal

Enable therapists to manage curated Biblioteca protocols in-app (create/edit/archive/restore) while keeping the main consultation workflow fast.

## User Stories

- As a therapist, I want to create and edit curated protocols so that the Biblioteca stays trustworthy and up-to-date.
- As a therapist, I want to archive and restore protocols so that I can remove outdated content without breaking existing treatment plans.
- As a therapist, I want to keep searching and viewing protocols without seeing archived content so that my consultation flow stays clean.

## Specific Requirements

**Access control**

- All protocol CRUD and archive/restore actions require authentication.
- Do not rely on client-side access checks.

**Protocol management screen**

- Provide an in-app surface for protocol management (route: `/protocolos`).
- Add the route to the app router and protect it with authentication.
- Show a list of protocols with search and category filter.
- Include a toggle to show archived protocols ("Ver archivados").
- Provide clear primary actions: "Nuevo protocolo", "Editar", "Archivar" / "Restaurar".
- Use existing UI patterns for dialogs, confirmation, and toast feedback.

**Create protocol**

- Therapist can create a protocol with: title, category, definition, rationale, procedure steps, tags, and optional references.
- Spanish-only content for now.
- Client-side validation for fast feedback; server-side validation is authoritative.
- After create, the protocol appears in the list and becomes available to the therapist (unless immediately archived).

**Edit protocol**

- Therapist can edit protocol fields (same shape as create) and manage references.
- Edits apply to future therapist views immediately (curated library improves over time).
- Display a warning in the protocol UI that past clinical history should not be rewritten by edits.

**Archive / restore (soft delete)**

- Protocol deletion is implemented as soft delete (archive) using `deletedAt`.
- Therapist-facing list/search must exclude archived protocols by default.
- Protocol list can include archived protocols and allows restore (set `deletedAt = null`).
- If an archived protocol is already attached to a treatment plan, keep it visible in plan context with an "Archivado" indicator, but block adding it to new plans.
- Use a confirmation dialog for archive actions.

**References linking (ProtocolReference)**

- Therapist can attach/detach bibliographic references to a protocol.
- MVP default: allow selecting from existing references; optionally allow creating/editing a reference in a small inline modal.
- Therapist UI continues to show references in the protocol detail modal.

**Backend API: CRUD + restore**

- Add endpoints under the existing library domain (keep consistent with existing routes):
- `POST /library/protocols` create protocol.
- `PATCH /library/protocols/:id` update protocol.
- `DELETE /library/protocols/:id` archive protocol (soft delete).
- `POST /library/protocols/:id/restore` restore protocol.
- List supports `includeDeleted=true`; standard list/search excludes deleted.

**Validation, errors, and Swagger**

- Follow existing NestJS patterns: DTO classes with class-validator and Swagger decorators.
- Reuse PartialType-based update DTO style.
- Return 201 for create, 200 for update/restore, 204 for archive.
- Use consistent NotFound/Conflict responses and user-friendly error messages.

**Data model changes (Prisma)**

- Add `Protocol.deletedAt: DateTime?` and index it for filtering.
- Ensure read/search queries filter `deletedAt: null` for therapist-facing endpoints.

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**Biblioteca UI (list + detail modal)**

- `apps/client/src/components/library/LibraryDashboard.tsx` shows the overall Biblioteca layout and how protocols are rendered.
- `apps/client/src/components/library/ProtocolList.tsx` provides the card list UI to reuse or visually align with admin lists.
- `apps/client/src/components/library/ProtocolDetailModal.tsx` shows current protocol detail sections and reference rendering.

**Frontend CRUD patterns (dialogs, confirm, validation, react-query)**

- `apps/client/src/pages/Patients.tsx` shows create/edit dialogs and a destructive confirmation flow with `AlertDialog`.
- `apps/client/src/components/patients/PatientForm.tsx` shows zod-based client validation patterns.
- `apps/client/src/hooks/use-patients.ts` shows react-query mutations, cache invalidation, and toast patterns.

**Backend soft delete + CRUD conventions**

- `apps/server/src/modules/patients/patients.controller.ts` and `apps/server/src/modules/patients/patients.service.ts` show standard CRUD routing and soft delete via `deletedAt`.
- `apps/server/src/modules/sessions/sessions.controller.ts` and `apps/server/src/modules/sessions/sessions.service.ts` show 204 soft delete and access checks.
- `apps/server/src/main.ts` shows the global `ValidationPipe` configuration (whitelist, transform, forbidNonWhitelisted).

**Auth context**

- `apps/server/src/modules/auth/auth.service.ts` signs JWT and provides authenticated user context.
- `apps/server/src/modules/auth/guards/jwt-auth.guard.ts` enforces authentication.
- `apps/client/src/components/auth/ProtectedRoute.tsx` shows current route guarding baseline.

## Out of Scope

- Editorial workflow (draft/review/publish).
- Protocol version history UI and audit trail UI.
- Bulk import/export UI.
- ClinicalCategory CRUD (categories are selectable, but managed separately).
- Multilingual protocol fields (Spanish-only for now).
- Protocol snapshot/versioning stored at plan-attach time.
- Session protocol execution snapshots/versioning storage.

# Specification: Protocol CRUD (Admin)

## Goal

Enable admins to manage curated Biblioteca protocols in-app (create/edit/archive/restore) while therapists continue to only search, view, and add protocols to treatment plans.

## User Stories

- As an admin, I want to create and edit curated protocols so that the Biblioteca stays trustworthy and up-to-date.
- As an admin, I want to archive and restore protocols so that I can remove outdated content without breaking existing treatment plans.
- As a therapist, I want to keep searching and viewing protocols without seeing archived content so that my consultation flow stays clean.

## Specific Requirements

**Admin-only access (RBAC)**

- All protocol CRUD and archive/restore actions are admin-only on the server (do not rely on UI hiding).
- Admin UI routes and actions are hidden/disabled for non-admin users.
- Role is derived from a signature-verified JWT claim (already present in auth payload); enforce with a dedicated guard.
- If a non-admin calls admin endpoints, respond with 403.

**Admin UI: Protocol management screen**

- Provide an in-app admin surface for protocols (recommended route: `/admin/protocols`).
- Add the route to the app router and protect it with authentication + admin-only gating.
- Show a list of protocols with search and category filter.
- Include a toggle to show archived protocols ("Ver archivados").
- Provide clear primary actions: "Nuevo protocolo", "Editar", "Archivar" / "Restaurar".
- Use existing UI patterns for dialogs, confirmation, and toast feedback.

**Create protocol**

- Admin can create a protocol with: title, category, definition, rationale, procedure steps, tags, and optional references.
- Spanish-only content for now.
- Client-side validation for fast feedback; server-side validation is authoritative.
- After create, the protocol appears in the admin list and becomes available to therapists (unless immediately archived).

**Edit protocol**

- Admin can edit protocol fields (same shape as create) and manage references.
- Edits apply to future therapist views immediately (curated library improves over time).
- Display a warning in admin UI that past clinical history should not be rewritten by edits.

**Archive / restore (soft delete)**

- Protocol deletion is implemented as soft delete (archive) using `deletedAt`.
- Therapist-facing list/search must exclude archived protocols by default.
- Admin list can include archived protocols and allows restore (set `deletedAt = null`).
- If an archived protocol is already attached to a treatment plan, keep it visible in plan context with an "Archivado" indicator, but block adding it to new plans.
- Use a confirmation dialog for archive actions.

**References linking (ProtocolReference)**

- Admin can attach/detach bibliographic references to a protocol.
- MVP default: allow selecting from existing references; optionally allow creating/editing a reference in a small inline modal.
- Therapist UI continues to show references in the protocol detail modal.

**Backend API: CRUD + restore**

- Add admin endpoints under the existing library domain (keep consistent with existing routes):
- `POST /library/protocols` (admin-only) create protocol.
- `PATCH /library/protocols/:id` (admin-only) update protocol.
- `DELETE /library/protocols/:id` (admin-only) archive protocol (soft delete).
- `POST /library/protocols/:id/restore` (admin-only) restore protocol.
- Admin list supports `includeDeleted=true`; therapist list/search never includes deleted.

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

**Auth context for RBAC**

- `apps/server/src/modules/auth/auth.service.ts` signs JWT with `role` in the payload.
- `apps/server/src/modules/auth/guards/jwt-auth.guard.ts` demonstrates guard usage via `Reflector` (pattern to extend for roles).
- `apps/client/src/components/auth/ProtectedRoute.tsx` shows current route guarding baseline.

## Out of Scope

- Therapist-facing protocol CRUD.
- Editorial workflow (draft/review/publish).
- Protocol version history UI and audit trail UI.
- Bulk import/export UI.
- ClinicalCategory CRUD (categories are selectable, but managed separately).
- Multilingual protocol fields (Spanish-only for now).
- Protocol snapshot/versioning stored at plan-attach time.
- Session protocol execution snapshots/versioning storage.

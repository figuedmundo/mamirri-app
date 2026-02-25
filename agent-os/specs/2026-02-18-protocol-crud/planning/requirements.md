# Spec Requirements: Protocol CRUD

## Initial Description

17.9 Protocol CRUD

## Requirements Discussion

### First Round Questions

**Q1:** I assume “Protocol CRUD” means admin-only management of the curated `Protocol` library (create/update/delete) while therapists remain read-only. Is that correct, or should therapists also be able to create/edit protocols?
**Answer:** yes ADMIN only

**Q2:** I assume scope is backend API CRUD only (no in-app admin UI), since `agent-os/specs/2026-02-18-biblioteca-search-hybrid-results/spec.md` previously marked in-app CRUD UI out of scope. Should we keep it API-only, or do you now want an admin UI too?
**Answer:** we want and UI too

**Q3:** What entities are included in “CRUD”: Protocol only, or also BibliographicReference, ClinicalCategory, and the ProtocolReference linking (attach/detach references from a protocol)?
**Answer:** please suggest the best answer for the app

**Q4:** For edits: if a protocol is already attached to treatment plans (`TreatmentPlanProtocol`), should updates immediately change what therapists see in Biblioteca/plan views, or should we freeze/snapshot protocol content once attached?
**Answer:** I think should be frezee, but please suggest and explain

**Q5:** For deletes: should deleting a protocol be hard delete, soft delete, or blocked if it’s referenced by a treatment plan (or other relations)?
**Answer:** soft delete , but again please suggest

**Q6:** Data shape: should `Protocol.definition` / `rationale` / `procedure` be treated as Spanish-first, and do you want CRUD to support bilingual fields (ES/EN) now, or keep a single canonical language for MVP?
**Answer:** lets keep in spanish for now

**Q7:** I assume basic validations: title required, categoryId required, procedure is a non-empty list, tags optional. Any constraints you want (max steps, max tag count, uniqueness like “title unique within category”)?
**Answer:** dont understand pleas explain

**Q8:** What should be out of scope for this CRUD (e.g., editorial workflow draft/review/publish, versioning, audit trail, bulk import/export UI, synonym/ontology management)?
**Answer:** please suggest

### Existing Code to Reference

No similar existing features identified for reference (user has not provided any paths yet).

### Follow-up Questions

None.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

- Admin-only: Provide in-app UI + backend API to create, update, and delete curated Protocol records (Biblioteca Medica).
- Maintain existing read/search capabilities and "add protocol to treatment plan" behavior.
- Support soft delete for protocols (recommended: `deletedAt` field) similar to Patient soft delete patterns.
- Ensure validation and consistent error responses for CRUD operations.

### Reusability Opportunities

- Potential backend reference points: existing Library module endpoints and Prisma models for Protocol/References.
- Potential frontend reference points: existing Biblioteca components and auth/ProtectedRoute patterns.

### Scope Boundaries

**In Scope:**

- Protocol CRUD (admin-only; includes UI per Q2).

**Out of Scope:**

- Pending confirmation (Q8).

### Technical Considerations

- Auth context includes a `role` field in JWT payload; role-based access control for CRUD is required for admin-only.
- Current Prisma schema includes Protocol, ClinicalCategory, BibliographicReference, ProtocolReference, and TreatmentPlanProtocol relations.
- Soft delete precedent exists in the codebase (e.g., Patient uses `deletedAt` and queries commonly filter `deletedAt: null`).

## Suggested Defaults (Agent Recommendations)

These are suggested defaults because multiple answers were "please suggest".

### Q3 Recommendation (What CRUD includes)

- Recommended in scope for 17.9: CRUD for `Protocol` + manage `ProtocolReference` linking (attach/detach references on a protocol).
- Recommended partial support: allow selecting from existing `ClinicalCategory` (no category CRUD in MVP).
- Recommended optional (nice-to-have): create/edit `BibliographicReference` in a small admin screen OR inline modal when attaching references; keep it separate from therapist UI.

### Q4 Recommendation (Freeze behavior)

- Recommended: freeze clinical history, not the protocol library.
- Concretely:
  - Protocol edits should update what therapists see in Biblioteca going forward (curated library improves over time).
  - When a protocol is executed in a treatment session, store a snapshot of steps used in the session record (so later edits do not rewrite historical care).
- If you want freeze-at-plan-attach (stricter), it likely needs schema changes (store snapshot in `TreatmentPlanProtocol` or add protocol versioning). Recommend deferring that until needed.

### Q5 Recommendation (Soft delete)

- Recommended: soft delete via `Protocol.deletedAt` (and optionally `deletedByUserId`).
- Default behavior:
  - Therapist-facing list/search excludes deleted protocols.
  - Admin list shows deleted protocols with restore action.
  - If a deleted protocol is already attached to a plan, continue displaying it (marked "Archived") but block adding it to new plans.

### Q7 Explanation + Recommendation (Constraints)

"Constraints" here means simple rules that prevent messy data and keep the UI usable.

- Recommended validations:
  - `title`: required; trim; min 3; max 120.
  - `categoryId`: required; must exist.
  - `definition`: required; max 2000.
  - `rationale`: required; max 4000.
  - `procedure`: required; 1..50 steps; each step max 500.
  - `tags`: optional; 0..10; each tag max 24; normalize to lowercase; de-dupe.
  - Uniqueness: `title` unique per category (case-insensitive) to avoid duplicates in the UI.

### Q8 Recommendation (Out of scope)

- Editorial workflow (draft/review/publish), protocol versioning UI, audit trail UI.
- Bulk import/export UI (CSV/JSON) (API later if needed).
- Multilingual protocol content (keep Spanish-only per Q6).
- Synonym/ontology engine for tags/search beyond current simple matching.
- Therapist-facing CRUD.

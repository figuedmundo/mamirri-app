# Spec Requirements: treatment-sessions-crud

## Initial Description

API endpoints: Treatment sessions CRUD

## Requirements Discussion

### First Round Questions

**Q1:** I assume we need to implement the "Immutable Session Logs" feature mentioned in the mission. The current `TreatmentSession` schema lacks a `status` field. Should I add a `status` field (e.g., `DRAFT` / `FINALIZED`) and an endpoint to "finalize" the session, which would prevent further edits?
**Answer:** Yes, add `status` field (`DRAFT` default, `COMPLETED`) and a `PATCH /:id/finalize` endpoint.

**Q2:** I'm thinking the primary way to list sessions is by Clinical Case (e.g., `GET /clinical-cases/:id/sessions`). Should I also implement a global "Get all my sessions" endpoint for the therapist?
**Answer:** Yes, implement both nested (`/cases/:id/sessions`) and global (`/sessions`) retrieval.

**Q3:** The `procedures` field is defined as a string array (`String[]`). Should we validate these against a specific list of allowed procedures, or allow free-text entries for now?
**Answer:** Free-text, as requested.

**Q4:** Week 7 covers "Media & Dictation". For this task (Week 5), I assume `voiceNotes` will just be a pass-through JSON field without special handling or file upload logic yet. Is that correct?
**Answer:** Pass-through JSON only. No media processing logic yet.

**Q5:** `Patient` supports soft-deletion, but `TreatmentSession` currently does not. Should I add `deletedAt` to `TreatmentSession` for soft deletion, or is hard deletion acceptable for MVP?
**Answer:** Yes, implement soft deletion (`deletedAt`) to match Patient model.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: ClinicalCases - Path: `apps/server/src/modules/clinical-cases/clinical-cases.controller.ts`
- Components to potentially reuse: Pattern for `@CurrentTherapist()` decorator, `PaginatedResponseDto`, and basic CRUD structure.
- Backend logic to reference: `ClinicalCasesService` for handling relation ownership checks.

### Follow-up Questions

No follow-up questions were needed as the answers provided clear direction on all architectural decisions.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Create Session:** POST `/sessions` linked to a Clinical Case.
- **List Sessions:**
  - GET `/cases/:caseId/sessions` (Contextual list)
  - GET `/sessions` (Global therapist log)
- **Retrieve Session:** GET `/sessions/:id`
- **Update Session:** PATCH `/sessions/:id` (Only allowed if status is `DRAFT`)
- **Finalize Session:** PATCH `/sessions/:id/finalize` (Sets status to `COMPLETED`, prevents further edits)
- **Delete Session:** DELETE `/sessions/:id` (Soft delete using `deletedAt`)

### Reusability Opportunities

- Reuse `PaginatedResponseDto` for list endpoints.
- Reuse `JwtAuthGuard` and `@CurrentTherapist()` for security.
- Follow `ClinicalCasesController` pattern for ownership validation (ensure session belongs to a case that belongs to a patient of the current therapist).

### Scope Boundaries

**In Scope:**

- CRUD operations for `TreatmentSession`
- `status` field management (`DRAFT` -> `COMPLETED`)
- Soft deletion logic
- Basic free-text `procedures` array storage
- Pass-through `voiceNotes` JSON storage

**Out of Scope:**

- Voice/Audio file uploading (Week 7)
- Procedures validation against a medical dictionary
- Front-end implementation (API only)

### Technical Considerations

- **Database:** Update Prisma schema to add `status` (Enum/String) and `deletedAt` (DateTime?) to `TreatmentSession`.
- **Validation:** Use `class-validator` DTOs for input validation.
- **Security:** Ensure strict ownership checks—therapist can only access sessions for their own patients.

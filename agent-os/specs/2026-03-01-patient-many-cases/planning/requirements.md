# Spec Requirements: Patient Can Have Many Cases

## Initial Description

**Source:** Roadmap task 9.14 (Week 9 - Field Testing Issues)
**Description:** Patient can have many cases

From field testing (Week 9), this was identified as a needed feature. Currently the patient-case relationship needs to support multiple clinical cases per patient, allowing therapists to manage patients who return for different conditions or treatments over time.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the primary change is frontend-only, since the backend and database already support 1:N Patient→ClinicalCase. The PatientProfile currently only renders the active case via `.find(c => c.status === 'active')`. Is that correct, or do you also want backend changes (e.g., enforce "only one active case at a time")?
**Answer:** Frontend-only. The Prisma schema (`clinicalCases ClinicalCase[]`) and backend API (`POST /cases`, `GET /cases?patientId=X`) already fully support 1:N. No backend constraint for "only one active case" — handled as a soft UX warning instead.

**Q2:** I'm thinking the PatientProfile should show a list/timeline of ALL clinical cases (active, completed, inactive) instead of just one card. Should we display them as a vertical list of cards, a tabbed view, or a timeline-style layout?
**Answer:** Vertical card list, grouped by status. Active cases at top (expanded), completed cases below (collapsed by default), inactive cases last (collapsed, muted). Consistent with existing `ClinicalCaseCard` component. Progressive disclosure — therapist sees what matters now, history accessible on click.

**Q3:** When a therapist creates a new case for a patient who already has an active case, should we automatically close/complete the existing active case, or allow multiple active cases simultaneously?
**Answer:** Allow multiple active cases simultaneously. In physiotherapy, concurrent conditions are legitimate (e.g., knee rehab + shoulder injury). When creating a new case while an active case exists, show a confirmation prompt: "Este paciente ya tiene un caso activo. ¿Deseas crear uno nuevo?" No auto-close, no enforcement.

**Q4:** I assume we need a "Nuevo Caso" button on the PatientProfile page that opens a form to create a clinical case (title + consultation reason). Should this be a dialog/modal or a separate page?
**Answer:** Dialog/modal. The `CreateClinicalCaseDto` only needs `title` + `consultationReason` — two fields, too lightweight for a separate page. Consistent with the existing `PatientForm` edit dialog pattern in `PatientDetail.tsx`. Aligns with the app's "zero-friction" philosophy.

**Q5:** Should completed/inactive cases be collapsed by default to keep the focus on the active case, or shown equally alongside active ones?
**Answer:** Collapsed by default. Active cases fully visible and expanded. Completed/inactive show a summary line (title, date range, status badge) and expand on click. Keeps the profile clean for daily use while preserving access to history.

**Q6:** Currently there's no `createCase` method in the frontend API layer. I assume we'll add one that calls `POST /api/v1/cases`. Is there any additional data to capture at creation time beyond title and consultation reason?
**Answer:** Minimal creation form — title + consultation reason only. The clinical model captures detailed data (pathological history, diagnosis, evaluation) during later workflow phases via EvaluacionForm and treatment flow. Front-loading the form would violate "zero-friction."

**Q7:** Is there anything we should explicitly NOT build as part of this task?
**Answer:** Out of scope: case archiving/soft-delete (already has status management), case merging, case transfer between therapists, bulk case operations, case duplication/templates, case reordering.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: ClinicalCaseCard — Path: `apps/client/src/components/patients/PatientProfile.tsx` (lines 394-523)
  - Components to potentially reuse: existing card layout, status colors, date formatting, evaluation display
- Feature: PatientForm edit dialog — Path: `apps/client/src/pages/PatientDetail.tsx` (lines 264-277)
  - Components to potentially reuse: Dialog/DialogContent pattern, form submission flow
- Feature: Patient API layer — Path: `apps/client/src/api/patients.ts`
  - Backend logic to reference: `patientsApi` methods pattern for the new `createCase` method
- Feature: ClinicalCases backend — Path: `apps/server/src/modules/clinical-cases/`
  - Backend logic to reference: `ClinicalCasesController.create()`, `CreateClinicalCaseDto`
- Feature: Patient hooks — Path: `apps/client/src/hooks/use-patients.ts`
  - Components to potentially reuse: React Query mutation pattern for `useCreateCase` hook

### Follow-up Questions

No follow-up questions needed — all requirements are clear.

## Visual Assets

### Files Provided:

No visual assets provided (bash check confirmed no files in `agent-os/specs/2026-03-01-patient-many-cases/planning/visuals/`).

## Requirements Summary

### Functional Requirements

- **Case list on PatientProfile:** Display ALL clinical cases for a patient, grouped by status (active → completed → inactive)
- **Active cases expanded:** Active cases render fully with existing `ClinicalCaseCard` detail (diagnosis, pain scale, objectives, treatment phases, sessions footer)
- **Completed/inactive collapsed:** Show summary line (title, date range, status badge), expandable on click
- **"Nuevo Caso" button:** Visible on PatientProfile in the "Casos Clínicos" section header
- **Case creation dialog:** Modal with two fields — title (required, 3-200 chars) and consultation reason (optional)
- **Confirmation prompt:** When creating a case while an active case exists, warn: "Este paciente ya tiene un caso activo. ¿Deseas crear uno nuevo?"
- **Frontend API method:** Add `createCase(data)` to `patientsApi` calling `POST /api/v1/cases`
- **React Query hook:** Add `useCreateCase()` mutation hook with cache invalidation on the patient query
- **No backend changes:** Database and API already support 1:N

### Reusability Opportunities

- `ClinicalCaseCard` component in `PatientProfile.tsx` — reuse for all case cards (active cases)
- `getStatusColor()` helper in `PatientProfile.tsx` — reuse for status badges
- Dialog pattern from `PatientDetail.tsx` — reuse for case creation modal
- `mapPatient()` in `api/patients.ts` — already handles `clinicalCases[]` array mapping
- Existing route `/pacientes/:id/casos/:caseId` — already supports navigating to any case by ID

### Scope Boundaries

**In Scope:**

- Case list rendering (all statuses, grouped)
- Collapsed/expandable completed and inactive cases
- "Nuevo Caso" button + creation dialog modal
- Confirmation prompt for concurrent active cases
- `createCase` frontend API method
- `useCreateCase` React Query mutation hook
- PatientProfile refactor to iterate over `clinicalCases[]` instead of `.find(active)`

**Out of Scope:**

- Backend/database changes (already 1:N)
- Case archiving/soft-delete (status management exists)
- Case merging between patients
- Case transfer between therapists
- Bulk case operations
- Case duplication/templates
- Case reordering
- Case status change UI (mark as completed/inactive) — separate task

### Technical Considerations

- **Integration points:** `POST /api/v1/cases` endpoint already exists and tested; frontend just needs to call it
- **Existing system constraints:** `CreateClinicalCaseDto` validates title (3-200 chars, required) and consultationReason (optional string)
- **Technology preferences:** Shadcn/UI Dialog component, React Query for mutations, existing Tailwind styling patterns
- **Similar code patterns to follow:** PatientForm edit dialog for modal pattern, `useUpdatePatient` for mutation hook pattern
- **Cache invalidation:** After case creation, invalidate `['patient', patientId]` query key to refresh the patient profile with new case
- **Routing:** Existing route `/pacientes/:id/casos/:caseId` already handles case detail navigation — no routing changes needed

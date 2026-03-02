# Specification: Patient Can Have Many Cases

## Goal

Enable therapists to view, manage, and create multiple clinical cases per patient from the PatientProfile page, replacing the current single-active-case display with a grouped, collapsible case list and a case creation dialog.

## User Stories

- As a therapist, I want to see all clinical cases (active, completed, inactive) for a patient so that I can review their full treatment history and manage concurrent conditions
- As a therapist, I want to create a new clinical case for an existing patient so that I can track a new condition without losing previous case data

## Specific Requirements

**Case list grouped by status on PatientProfile**

- Replace the current `clinicalCases.find(c => c.status === 'active')` single-case rendering with an iteration over all `clinicalCases[]`
- Group cases by status in display order: active → completed → inactive
- Active cases render fully expanded using the existing `ClinicalCaseCard` component (diagnosis, pain scale, objectives, treatment phases, sessions footer)
- If multiple active cases exist, all render expanded
- Each case card remains clickable to navigate to `/pacientes/:id/casos/:caseId` via the existing `onViewCase` callback

**Collapsed state for completed and inactive cases**

- Completed and inactive cases render as a summary row: title, date range (start–end), and status badge
- Click on a collapsed case expands it to show the full `ClinicalCaseCard` content
- Use local `useState` to track expanded state per case — no need for global state
- Inactive cases use muted styling (stone/gray tones consistent with `getStatusColor('inactive')`)

**"Nuevo Caso" button in section header**

- Add a button labeled "Nuevo Caso" next to the "Casos Clínicos" `h2` header in PatientProfile (line 326)
- Style as a secondary/outline button with a plus icon, consistent with existing action button patterns
- Button opens the case creation dialog

**Case creation dialog**

- Use Shadcn/UI `Dialog` component, matching the existing `PatientForm` edit dialog pattern in `PatientDetail.tsx`
- Two fields: title (required, text input) and consultation reason (optional, textarea)
- Client-side validation: title required, 3-200 characters — matching backend `CreateClinicalCaseDto` constraints
- On submit, call `patientsApi.createCase()` via the `useCreateCase` mutation hook
- On success: close dialog, show success toast, patient query cache invalidated automatically
- On error: show destructive toast with user-friendly message, keep dialog open
- Include `DialogTitle` and `DialogDescription` for screen reader accessibility

**Confirmation prompt for concurrent active cases**

- Before submitting case creation, check if `patient.clinicalCases` contains any case with `status === 'active'`
- If active case exists, show a Shadcn/UI `AlertDialog` confirmation: "Este paciente ya tiene un caso activo. ¿Deseas crear uno nuevo?"
- Use the same `AlertDialog` pattern as `Ajustes.tsx` (AlertDialogHeader, AlertDialogFooter with Cancel/Confirm actions)
- If no active case exists, submit directly without confirmation

**Frontend API method: `createCase`**

- Add `createCase` method to `patientsApi` in `apps/client/src/api/patients.ts`
- Calls `POST /api/v1/cases` with body `{ patientId, title, consultationReason }`
- Return type maps to `ClinicalCase` from the existing type definitions
- Follow the same pattern as existing `patientsApi.create()` method

**React Query mutation hook: `useCreateCase`**

- Add `useCreateCase()` to `apps/client/src/hooks/use-patients.ts`
- Follow the exact pattern of `useCreatePatient()`: `useMutation` + `queryClient.invalidateQueries` + toast notifications
- On success: invalidate `queryKeys.patients.lists()` and `queryKeys.patients.detail(patientId)` to refresh the profile
- Accept `patientId` in the mutation variables alongside `title` and `consultationReason`

**Empty state update**

- The existing `EmptyState` component in PatientProfile ("Sin casos clínicos") should remain, shown when `clinicalCases` array is empty
- Add the "Nuevo Caso" button inside the empty state as a call-to-action

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**`ClinicalCaseCard` component — `apps/client/src/components/patients/PatientProfile.tsx` (lines 394-523)**

- Fully built card with case header (title, status badge, consultation reason, dates), evaluation display (diagnosis, pain scale), treatment phases, and sessions footer
- Reuse directly for active case rendering — no modifications needed to the card itself
- `getStatusColor()` helper (lines 157-168) provides consistent status badge colors

**`AlertDialog` confirmation pattern — `apps/client/src/pages/Ajustes.tsx` (lines 73-102)**

- Existing Shadcn/UI AlertDialog with header, description, cancel, and confirm action
- Reuse this exact pattern for the "active case exists" confirmation prompt
- Spanish language labels already established (Cancelar, action verb)

**`PatientForm` edit dialog — `apps/client/src/pages/PatientDetail.tsx` (lines 264-277)**

- Dialog/DialogContent with form inside, `onOpenChange` state management
- Reuse this dialog structure for the case creation modal
- Includes `DialogTitle` and `DialogDescription` with `sr-only` for accessibility

**`useCreatePatient` hook — `apps/client/src/hooks/use-patients.ts` (lines 31-49)**

- Exact mutation hook pattern: `useMutation` + `queryClient.invalidateQueries` + success/error toasts
- Clone this pattern for `useCreateCase`, adjusting mutation function, cache keys, and toast messages

**`queryKeys.patients` — `apps/client/src/lib/query-keys.ts`**

- Established query key factory with `lists()`, `detail(id)`, `all` patterns
- No new query keys needed — case creation invalidates existing patient keys

## Out of Scope

- Backend or database schema changes (1:N relationship already exists)
- Case status change UI (marking cases as completed/inactive) — separate task
- Case archiving or soft-delete functionality
- Case merging between patients
- Case transfer between therapists
- Bulk case operations
- Case duplication or templates
- Case reordering or drag-and-drop
- Case search or filtering within a patient's case list
- Routing changes (existing `/pacientes/:id/casos/:caseId` route already works)

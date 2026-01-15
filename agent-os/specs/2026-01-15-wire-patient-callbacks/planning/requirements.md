# Spec Requirements: Wire Patient Callbacks

## Initial Description

From roadmap task 5.10:
**Wire callbacks: onView, onCreate, onEdit, onDelete**

Context: This is part of Week 5's Pacientes Core Components work, building on the components already created (PacientesList, PacienteProfile, CaseDetailLayout, CaseTimeline) and the backend API endpoints (Patients CRUD, Clinical cases CRUD, Treatment sessions CRUD).

The task is to wire up the callback functions that connect the UI components to the backend API endpoints for viewing, creating, editing, and deleting patients.

## Requirements Discussion

### Analysis of Existing Patterns

The codebase already had partial implementations:

- `onView` → Navigated to `/pacientes/${id}` (working)
- `onCreate` → Opened Dialog modal with inline form (needed refactoring)
- `onDelete` → Used browser `confirm()` (poor UX, needed replacement)
- `onEdit` → Only showed toast placeholder (not implemented)

### Implementation Decisions

**Q1:** Where should callback implementations live?
**Answer:** In parent page components (`Patients.tsx` and `PatientDetail.tsx`), following existing patterns.

**Q2:** What UI pattern for onCreate/onEdit?
**Answer:** Modal dialogs using existing Shadcn Dialog component for consistency.

**Q3:** How to handle delete confirmation?
**Answer:** Replace browser `confirm()` with custom AlertDialog for consistent styling.

**Q4:** Should there be a reusable form component?
**Answer:** Yes, created `PatientForm` component with Zod validation for DRY principle.

**Q5:** How to handle loading states?
**Answer:** Added spinner icons and disabled buttons during async operations.

**Q6:** What validation approach?
**Answer:** Client-side validation using Zod v4 schema before API calls.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Dialog component - Path: `apps/client/src/components/ui/dialog.tsx`
- Feature: Toast notifications - Path: `apps/client/src/hooks/use-toast.ts`
- Feature: Patients API - Path: `apps/client/src/api/patients.ts`
- Feature: Patient types - Path: `apps/client/src/types/patient.ts`

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- `onView`: Navigate to patient detail page
- `onCreate`: Open modal with form, create patient via API, refresh list
- `onEdit`: Open modal with pre-filled form, update patient via API, refresh data
- `onDelete`: Show confirmation dialog, delete via API, refresh list
- All operations show toast notifications for success/failure
- All operations show loading states during API calls
- Form validation before submission

### Technical Implementation

- Reusable `PatientForm` component with Zod validation
- AlertDialog for delete confirmation (replacing browser confirm)
- Loading spinners on all async operations
- Toast notifications for all outcomes
- Edit available from both Patients list and PatientDetail page

### Scope Boundaries

**In Scope:**

- Wire onView, onCreate, onEdit, onDelete callbacks
- Create reusable PatientForm component
- Add custom delete confirmation dialog
- Add loading states and validation

**Out of Scope:**

- onSchedule callback (task 5.11)
- Empty states refinement (task 5.12)
- Error handling improvements (task 5.13)
- Backend changes (already complete in 5.6)

### Files Changed

- `apps/client/src/components/patients/PatientForm.tsx` (NEW)
- `apps/client/src/pages/Patients.tsx` (UPDATED)
- `apps/client/src/pages/PatientDetail.tsx` (UPDATED)
- `apps/client/src/components/ui/dialog.tsx` (FIXED pre-existing issue)
- `apps/client/src/components/ui/alert-dialog.tsx` (ADDED via shadcn)
- `apps/client/src/components/patients/EvaluationForm.tsx` (FIXED unused var)
- `apps/client/src/components/patients/PatientProfile.tsx` (FIXED unused var)

### Dependencies Added

- `zod@^4.3.5` - Form validation library
- `@radix-ui/react-alert-dialog` (via shadcn alert-dialog)

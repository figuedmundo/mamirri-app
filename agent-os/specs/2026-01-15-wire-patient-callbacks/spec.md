# Specification: Wire Patient Callbacks

## Goal

Connect the patient UI components (PatientList, PatientProfile) to backend API endpoints by implementing fully functional onView, onCreate, onEdit, and onDelete callbacks with proper UX patterns including modal dialogs, validation, loading states, and toast notifications.

## User Stories

- As a therapist, I want to create new patients through a modal form so that I can quickly add patients without leaving the patient list.
- As a therapist, I want to edit patient information from both the list and detail views so that I can update data wherever I am in the app.
- As a therapist, I want a confirmation dialog before deleting patients so that I don't accidentally lose patient data.

## Specific Requirements

**onView Callback**

- Navigate to `/pacientes/:id` when user clicks patient card
- Use React Router's `useNavigate` hook for navigation
- Callback receives patient ID as string parameter

**onCreate Callback**

- Open modal dialog when "Nuevo Paciente" button is clicked
- Display PatientForm component in create mode inside dialog
- Close dialog and refresh patient list on successful creation
- Show success toast: "Paciente creado correctamente"
- Show error toast on failure with user-friendly message

**onEdit Callback**

- Available from both Patients list page and PatientDetail page
- Open modal dialog with PatientForm pre-filled with patient data
- Close dialog and refresh data on successful update
- Show success toast: "Paciente actualizado correctamente"
- Show error toast on failure with user-friendly message

**onDelete Callback**

- Replace browser `confirm()` with custom AlertDialog component
- Display patient name in confirmation message
- Warn that clinical cases, evaluations, and sessions will be deleted
- Show loading spinner during delete operation
- Show success toast with patient name on completion
- Refresh patient list after successful deletion

**PatientForm Component**

- Reusable form for both create and edit modes via `mode` prop
- Accept `initialData` prop for pre-filling in edit mode
- Client-side validation using Zod schema before submission
- Display field-specific error messages below inputs
- Show loading spinner on submit button during async operations
- Fields: name, age, occupation, phone, email, birthDate, address, gender

**Loading States**

- Disable submit buttons during async operations
- Show spinner icon inside submit button with "Guardando..." text
- Disable cancel button during submission to prevent UI conflicts
- Show loading spinner when initially loading patient list

**Toast Notifications**

- Use existing `useToast` hook for all notifications
- Success variant for successful operations
- Destructive variant for errors
- Spanish language for all messages

## Visual Design

No mockups provided. Follow existing Shadcn/UI patterns in codebase.

## Existing Code to Leverage

**Dialog Component (`apps/client/src/components/ui/dialog.tsx`)**

- Existing Radix-based modal dialog
- Use DialogContent, DialogHeader, DialogTitle, DialogFooter
- Matches app design system

**AlertDialog Component (`apps/client/src/components/ui/alert-dialog.tsx`)**

- Added via shadcn for delete confirmation
- Use AlertDialogAction with destructive styling for delete button
- AlertDialogCancel for cancel button

**Patients API (`apps/client/src/api/patients.ts`)**

- `patientsApi.findAll()` - List patients
- `patientsApi.create(data)` - Create patient
- `patientsApi.update(id, data)` - Update patient
- `patientsApi.delete(id)` - Delete patient

**useToast Hook (`apps/client/src/hooks/use-toast.ts`)**

- Existing toast notification system
- Supports `title`, `description`, `variant` props
- Use `variant: 'destructive'` for errors

**Patient Types (`apps/client/src/types/patient.ts`)**

- Existing Patient interface with all required fields
- PatientListProps and PatientProfileProps for component props

## Out of Scope

- onSchedule callback for Google Calendar integration (task 5.11)
- Empty states for no patients, no search results (task 5.12)
- Advanced error handling with retry logic (task 5.13)
- Backend API changes (already complete in task 5.6)
- Voice dictation integration (task 7.x)
- Photo/video capture integration (task 7.x)
- Offline support and IndexedDB sync (Part 4)
- Multi-therapist isolation logic (backend handles this)
- Patient search/filter functionality (already implemented in PatientList)
- Pagination for patient list (future enhancement)

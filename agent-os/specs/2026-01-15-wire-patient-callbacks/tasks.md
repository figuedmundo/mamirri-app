# Task Breakdown: Wire Patient Callbacks

## Overview

Total Tasks: 14
Status: ✅ COMPLETE

## Task List

### Dependencies & Setup

#### Task Group 1: Dependencies and Component Infrastructure

**Dependencies:** None

- [x] 1.0 Complete dependencies and infrastructure setup
  - [x] 1.1 Install Zod validation library
    - Add `zod@^4.3.5` to client dependencies
    - Used for client-side form validation
  - [x] 1.2 Add AlertDialog component via shadcn
    - Run `pnpm dlx shadcn@latest add alert-dialog`
    - Provides styled confirmation dialogs
  - [x] 1.3 Fix pre-existing Dialog component type issue
    - Remove unsupported `className` prop from DialogPortal
    - Ensures build passes

**Acceptance Criteria:**

- ✅ Zod installed and available for import
- ✅ AlertDialog component added to `components/ui/`
- ✅ Dialog component builds without type errors

### Frontend Components

#### Task Group 2: PatientForm Component

**Dependencies:** Task Group 1

- [x] 2.0 Complete PatientForm component
  - [x] 2.1 Create PatientForm component file
    - Path: `apps/client/src/components/patients/PatientForm.tsx`
    - Props: `mode`, `initialData`, `onSubmit`, `onCancel`
  - [x] 2.2 Implement Zod validation schema
    - Fields: name, age, occupation, phone, email, birthDate, address, gender
    - Validation rules: min lengths, email format, date validation
  - [x] 2.3 Build form UI with field-specific error display
    - Use existing Input, Label components from Shadcn
    - Show error messages below invalid fields
    - Support both create and edit modes
  - [x] 2.4 Add loading state for submit button
    - Show Loader2 spinner during async operations
    - Display "Guardando..." text while submitting
    - Disable buttons during submission

**Acceptance Criteria:**

- ✅ PatientForm renders correctly in create mode
- ✅ PatientForm pre-fills data in edit mode
- ✅ Validation errors display below fields
- ✅ Loading spinner shows during submission

#### Task Group 3: Patients Page Callbacks

**Dependencies:** Task Group 2

- [x] 3.0 Complete Patients page callback implementations
  - [x] 3.1 Implement onCreate callback
    - Open Dialog with PatientForm in create mode
    - Call `patientsApi.create()` on submit
    - Show success toast, refresh list, close dialog
  - [x] 3.2 Implement onEdit callback
    - Find patient data from state
    - Open Dialog with PatientForm pre-filled
    - Call `patientsApi.update()` on submit
    - Show success toast, refresh list, close dialog
  - [x] 3.3 Implement onDelete callback with AlertDialog
    - Replace browser `confirm()` with AlertDialog
    - Display patient name in warning message
    - Explain data deletion consequences
    - Show loading spinner during delete
    - Call `patientsApi.delete()` on confirm
  - [x] 3.4 Add loading state for patient list
    - Show spinner during initial load
    - Display "Cargando pacientes..." message

**Acceptance Criteria:**

- ✅ Create opens modal, creates patient, shows toast
- ✅ Edit opens modal with data, updates patient, shows toast
- ✅ Delete shows confirmation, deletes patient, shows toast
- ✅ Loading spinner appears during list load

#### Task Group 4: PatientDetail Page Callbacks

**Dependencies:** Task Group 2

- [x] 4.0 Complete PatientDetail page callback implementations
  - [x] 4.1 Implement onEdit callback
    - Open Dialog with PatientForm pre-filled with patient data
    - Call `patientsApi.update()` on submit
    - Show success toast, refresh patient data, close dialog
  - [x] 4.2 Add loading state for patient detail
    - Show spinner during initial load
    - Display "Cargando perfil..." message
  - [x] 4.3 Wire existing callbacks (already implemented)
    - onVoiceDictation: show placeholder toast
    - onCaptureFootprint: show placeholder toast
    - onCaptureVideo: show placeholder toast
    - onSchedule: open Google Calendar with pre-filled data

**Acceptance Criteria:**

- ✅ Edit opens modal with patient data
- ✅ Update refreshes patient profile
- ✅ Loading spinner appears during load
- ✅ All callback buttons trigger appropriate actions

### Verification

#### Task Group 5: Build Verification

**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete build verification
  - [x] 5.1 Fix any TypeScript errors
    - Remove unused `_formatDate` function in PatientProfile
    - Remove unused `_isNormal` function in EvaluationForm
  - [x] 5.2 Run production build
    - Execute `pnpm run build` in client app
    - Verify no type errors
    - Verify successful compilation
  - [x] 5.3 Verify bundle size is reasonable
    - Check output: 468KB JS, 47KB CSS (gzipped: 147KB, 8KB)

**Acceptance Criteria:**

- ✅ TypeScript compilation passes
- ✅ Build completes successfully
- ✅ No console errors or warnings

## Execution Summary

Implementation sequence completed:

1. ✅ Dependencies & Setup (Task Group 1)
2. ✅ PatientForm Component (Task Group 2)
3. ✅ Patients Page Callbacks (Task Group 3)
4. ✅ PatientDetail Page Callbacks (Task Group 4)
5. ✅ Build Verification (Task Group 5)

## Files Changed

| File                                                     | Status  | Description                       |
| -------------------------------------------------------- | ------- | --------------------------------- |
| `apps/client/src/components/patients/PatientForm.tsx`    | NEW     | Reusable form with Zod validation |
| `apps/client/src/pages/Patients.tsx`                     | UPDATED | Full CRUD callbacks with modals   |
| `apps/client/src/pages/PatientDetail.tsx`                | UPDATED | Edit callback with modal          |
| `apps/client/src/components/ui/alert-dialog.tsx`         | NEW     | Added via shadcn                  |
| `apps/client/src/components/ui/dialog.tsx`               | FIXED   | Type error fix                    |
| `apps/client/src/components/patients/PatientProfile.tsx` | FIXED   | Unused var                        |
| `apps/client/src/components/patients/EvaluationForm.tsx` | FIXED   | Unused var                        |
| `apps/client/package.json`                               | UPDATED | Added zod dependency              |

## Dependencies Added

- `zod@^4.3.5` - Form validation
- `@radix-ui/react-alert-dialog` - Via shadcn alert-dialog component

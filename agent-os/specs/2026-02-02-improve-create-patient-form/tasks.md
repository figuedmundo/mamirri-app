# Task Breakdown: Improve Create Patient Form

## Overview

Total Tasks: 12

## Task List

### Database Layer

#### Task Group 1: Data Models and Migrations

**Dependencies:** None

- [ ] 1.0 Complete database layer
  - [ ] 1.1 Write 2-8 focused tests for Patient Model functionality
    - Limit to 2-8 highly focused tests maximum
    - Test ONLY: validation of new fields (emergency contact structure), removal of age/address, and successful creation with new schema
  - [ ] 1.2 Update Patient Model in `schema.prisma`
    - Remove `age` and `address` fields
    - Add `emergencyContact` (Json)
    - Add `referralSource` (String?)
    - Add `medicalFlags` (String[] - check if array is supported or use Json)
    - _Note: PostgreSQL supports String[] arrays, but check Prisma compatibility. Fallback to Json if needed._
  - [ ] 1.3 Create migration for Patient schema update
    - Run `prisma migrate dev`
  - [ ] 1.4 Update Patient Service/DTOs
    - Update `create-patient.dto.ts` and `update-patient.dto.ts`
    - Update type definitions to match new schema
  - [ ] 1.5 Ensure database layer tests pass
    - Run ONLY the tests written in 1.1
    - Verify migration runs successfully

**Acceptance Criteria:**

- Tests in 1.1 pass
- Migration applied successfully
- Patient entity supports new fields

### Frontend Components

#### Task Group 2: UI Components (SplitDatePicker)

**Dependencies:** None

- [x] 2.0 Complete SplitDatePicker component
  - [x] 2.1 Write 2-8 focused tests for SplitDatePicker
    - Test year range generation
    - Test leap year handling (Feb 29)
    - Test value emission (ISO string)
  - [x] 2.2 Create `SplitDatePicker` component
    - Compose using 3 `Select` components (Day, Month, Year)
    - Implement internal validation (days in month)
    - Expose `onChange` prop returning Date object or ISO string
  - [x] 2.3 Ensure SplitDatePicker tests pass
    - Run ONLY the tests written in 2.1

**Acceptance Criteria:**

- SplitDatePicker handles invalid dates (e.g. Feb 31)
- Returns correct Date object

#### Task Group 3: PatientForm Refactor & Logic

**Dependencies:** Task Group 1, Task Group 2

- [ ] 3.0 Complete PatientForm refactor
  - [ ] 3.1 Write 2-8 focused tests for PatientForm logic
    - Test age calculation from birthdate
    - Test email validation (valid vs invalid)
    - Test submission with new fields
  - [ ] 3.2 Implement `zod` schema updates
    - Remove `age`, `address`
    - Add `email` validation
    - Add `emergencyContact`, `referralSource`, `medicalFlags`
  - [ ] 3.3 Refactor PatientForm layout & Logic
    - Integrate `SplitDatePicker` for birthDate
    - Display calculated age (read-only)
    - Add sections: "Datos Personales", "Contacto", "Información Médica"
    - Implement `MedicalFlags` multi-select (or checkboxes)
  - [ ] 3.4 Tablet Optimization
    - Apply `h-12` to inputs and buttons
    - Increase layout gaps
    - Ensure Dialog is responsive (full width on small screens)
  - [ ] 3.5 Ensure PatientForm tests pass
    - Run ONLY the tests written in 3.1

**Acceptance Criteria:**

- Form submits correctly with new fields
- Age is calculated automatically
- Tablet layout has larger touch targets

### Testing

#### Task Group 4: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-3

- [ ] 4.0 Review existing tests and fill critical gaps only
  - [ ] 4.1 Review tests from Task Groups 1-3
    - Review tests from 1.1, 2.1, 3.1
  - [ ] 4.2 Analyze test coverage gaps for THIS feature only
    - Check if "Medical Flags" selection is covered
    - Check if "Emergency Contact" validation is covered
  - [ ] 4.3 Write up to 10 additional strategic tests maximum
    - Integration test: Full create patient flow on frontend
  - [ ] 4.4 Run feature-specific tests only
    - Run all tests from 1.1, 2.1, 3.1, and 4.3

**Acceptance Criteria:**

- Critical flows covered
- All feature-specific tests pass

## Execution Order

1. Database Layer (Task Group 1)
2. UI Components - SplitDatePicker (Task Group 2)
3. PatientForm Refactor (Task Group 3)
4. Test Review (Task Group 4)

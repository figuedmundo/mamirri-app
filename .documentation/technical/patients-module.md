# Patients Module Technical Specification

**Module:** Patients  
**Phase:** Phase 1 (Core Clinical)  
**Last Updated:** 2026-02-27

## Overview

The Patients module is the core of the clinical system, managing patient demographics, clinical cases, SOAP evaluations, and treatment sessions. It implements a hierarchical data structure to support longitudinal patient care, following an expert-validated clinical flow.

## Clinical Model (Doctor's Model)

The module follows a SOAP-first clinical treatment flow with diagnosis before planning:

1. **S - Subjetivo:** Patient-reported symptoms and history.
2. **O - Objetivo:** Measurable findings (pain, tests, observations).
3. **A - Analisis:** Clinical reasoning and diagnosis.
4. **P - Plan:** Planned interventions, frequency, home exercises, next visit, and notes.
5. **Cronograma Execution:** Per-session tracking of what was actually done.
6. **Review and Continuity:** Progress review, comparison, and follow-up recommendations.

## Data Model (Prisma)

The database schema has been refactored to English to comply with [ADR 008](../product/decisions/008-language-strategy-english-code-spanish-ui.md).

### Entity Hierarchy

1.  **User (Therapist):** Owns all patient data.
2.  **Patient:** Basic demographics (name, age, occupation, phone, email, birthDate).
3.  **ClinicalCase:** Represents a specific condition/treatment period (e.g., "Lumbar Pain 2024").
    - **Evaluation (1:1):** Single evolving SOAP document for the case.
    - **TreatmentPlan:** Planned phases and objectives.
    - **TreatmentSessions (1:N):** Session-level execution logs.

### Key Models

```prisma
model Patient {
  id                 String   @id @default(cuid())
  name               String
  age                Int
  occupation         String
  previousOccupation String?
  address            String?
  gender             String?
  phone              String
  email              String?
  birthDate          DateTime
  isActive           Boolean  @default(true)
  deletedAt          DateTime?
  therapistId        String
  clinicalCases      ClinicalCase[]
  // ...
}

model ClinicalCase {
  id                String   @id @default(cuid())
  title             String
  status            String   // 'active' | 'completed' | 'inactive'
  startDate         DateTime
  endDate           DateTime?
  consultationReason String
  evaluation        Evaluation?
  treatmentSessions TreatmentSession[]
  treatmentPlan     TreatmentPlan?
  // ...
}
```

## Backend Architecture (NestJS)

### Controllers

| Controller                | Route                    | Description                              |
| ------------------------- | ------------------------ | ---------------------------------------- |
| `PatientsController`      | `/api/v1/patients`       | CRUD for patients, sessions, evaluations |
| `ClinicalCasesController` | `/api/v1/clinical-cases` | CRUD for clinical cases                  |

### Services

- **PatientsService:**
  - `create()`: Creates patient with initial clinical case and evaluation
  - `findAll()`: Paginated list with search filter, scoped to therapist
  - `findOne()`: Single patient with all clinical data included
  - `update()`: Partial update with birthDate conversion
  - `remove()`: Soft delete (sets `deletedAt`)
  - `addSession()`: Add treatment session to clinical case
  - `updateEvaluation()`: Update evaluation (painScale, posturogram, etc.)

- **ClinicalCasesService:**
  - `create()`: Create new clinical case for existing patient
  - `findAll()`: Paginated list with filters (patientId, status, search)
  - `findOne()`: Case with evaluation, sessions, treatment plan
  - `update()`: Update case status, title, reason
  - `remove()`: Hard delete

### Security

- Protected by `JwtAuthGuard`
- All data access scoped to `CurrentTherapist` (user ID from JWT)
- Therapist isolation enforced at service level (patients/cases owned by other therapists return 404)

## Frontend Architecture (React)

### Routes (Spanish UI)

| Route            | Component            | Description                       |
| ---------------- | -------------------- | --------------------------------- |
| `/pacientes`     | `Patients` page      | List view with CRUD operations    |
| `/pacientes/:id` | `PatientDetail` page | Profile view with edit capability |

### Components (English Code)

| Component         | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `PatientList`     | Grid of patient cards with search, filters, quick actions           |
| `PatientProfile`  | Dashboard with active case, history, action buttons                 |
| `PatientForm`     | Create/Edit form with Zod validation                                |
| `EvaluationForm`  | SOAP clinical assessment form (Subjetivo, Objetivo, Analisis, Plan) |
| `Timeline`        | Chronological view of treatment sessions                            |
| `ComparisonBoard` | Before/After visual comparison                                      |

### UI Components (Shadcn/Radix)

| Component                  | Usage                                  |
| -------------------------- | -------------------------------------- |
| `Dialog`                   | Create/Edit patient modals             |
| `AlertDialog`              | Delete confirmation with loading state |
| `Button`, `Input`, `Label` | Form elements                          |
| `Toast`                    | Success/error notifications            |

### Callbacks & State Management

| Callback             | Location                    | Action                                     |
| -------------------- | --------------------------- | ------------------------------------------ |
| `onView`             | PatientList                 | Navigate to `/pacientes/:id`               |
| `onCreate`           | PatientList                 | Open PatientForm dialog (create mode)      |
| `onEdit`             | PatientList, PatientProfile | Open PatientForm dialog (edit mode)        |
| `onDelete`           | PatientList                 | Open AlertDialog, soft delete via API      |
| `onSchedule`         | PatientList, PatientProfile | Open Google Calendar with pre-filled event |
| `onVoiceDictation`   | PatientProfile              | Placeholder for Week 7                     |
| `onCaptureFootprint` | PatientProfile              | Placeholder for Week 7                     |
| `onCaptureVideo`     | PatientProfile              | Placeholder for Week 7                     |

### Empty States

Context-aware empty states in `PatientList`:

| Scenario                | Display                                                   |
| ----------------------- | --------------------------------------------------------- |
| No patients in database | Gradient background, "Agregar Primer Paciente" CTA        |
| Search with no results  | Shows search term, "Limpiar busqueda" button              |
| Filter with no results  | Dynamic text per filter, "Ver todos los pacientes" button |

### Loading States

| Location                  | State                                         |
| ------------------------- | --------------------------------------------- |
| Initial patient list load | Centered spinner with "Cargando pacientes..." |
| Patient profile load      | Centered spinner with "Cargando perfil..."    |
| Form submission           | Button spinner with "Guardando..."            |
| Delete operation          | Button spinner with "Eliminando..."           |

### Error Handling

All API errors display toast notifications:

- **Destructive (red):** Load failures, create/update/delete errors
- **Success (default):** Create/update/delete confirmations

## API Client

The frontend uses a typed API client (`apps/client/src/api/patients.ts`):

```typescript
export const patientsApi = {
  findAll: async () => { ... },      // Returns Patient[]
  findOne: async (id) => { ... },    // Returns Patient
  create: async (data) => { ... },   // Returns Patient
  update: async (id, data) => { ... }, // Returns Patient
  delete: async (id) => { ... },     // Returns void
  addSession: async (caseId, data) => { ... },
  updateEvaluation: async (id, data) => { ... },
};
```

## Test Coverage

### Backend Unit Tests

| File                             | Tests | Coverage                                                               |
| -------------------------------- | ----- | ---------------------------------------------------------------------- |
| `patients.service.spec.ts`       | 15    | create, findAll, findOne, update, remove, addSession, updateEvaluation |
| `clinical-cases.service.spec.ts` | 15    | create, findAll, findOne, update, remove                               |

### Backend Integration Tests

| File                                 | Tests | Description                                       |
| ------------------------------------ | ----- | ------------------------------------------------- |
| `patients.integration.spec.ts`       | 2     | DB layer: create, soft delete                     |
| `patients-api.spec.ts`               | 14    | Controller: validation, therapist isolation, CRUD |
| `clinical-cases-api.spec.ts`         | 11    | Controller: CRUD, filters, status updates         |
| `clinical-cases.integration.spec.ts` | 5     | DB layer: case, evaluation, session creation      |

## Integration Points

- **Authentication:** Uses shared `AuthContext` and `axios` interceptors for JWT management
- **Calendar:** Client-side Google Calendar integration (opens template link with patient name)
- **Future AI:** Placeholders exist for Voice Dictation and Image Analysis (Week 7)

## Current Limitations

- **Media:** Image and audio capture are UI placeholders only
- **Offline:** No offline support yet (planned for Week 8)
- **Delete Undo:** Soft delete implemented but no "Undo" capability in UI

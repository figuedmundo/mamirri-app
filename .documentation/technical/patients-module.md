# Patients Module Technical Specification

**Module:** Patients  
**Phase:** Phase 1 (Core Clinical)  
**Last Updated:** 2026-01-14

## Overview

The Patients module is the core of the clinical system, managing patient demographics, clinical cases, evaluations, and treatment sessions. It implements a hierarchical data structure to support longitudinal patient care.

## Data Model (Prisma)

The database schema has been refactored to English to comply with [ADR 008](../product/decisions/008-language-strategy-english-code-spanish-ui.md).

### Entity Hierarchy

1.  **User (Therapist):** Owns all patient data.
2.  **Patient:** Basic demographics (name, age, occupation).
3.  **ClinicalCase:** Represents a specific condition/treatment period (e.g., "Lumbar Pain 2024").
    - **Evaluation:** Initial assessment (posturogram, pain scale, orthopedic tests).
    - **TreatmentPlan:** Planned phases and objectives.
    - **TreatmentSession:** Daily logs of visits (techniques, progress).

### Key Models

```prisma
model Patient {
  id            String   @id @default(cuid())
  name          String
  age           Int
  occupation    String
  phone         String
  birthDate     DateTime
  clinicalCases ClinicalCase[]
  // ...
}

model ClinicalCase {
  id          String   @id @default(cuid())
  title       String
  status      String   // 'active' | 'completed'
  evaluation  Evaluation?
  sessions    TreatmentSession[]
  // ...
}
```

## Backend Architecture (NestJS)

- **Controller:** `PatientsController` (`/api/v1/patients`)
- **Service:** `PatientsService`
  - Implements transactional creation: Creating a patient automatically creates an initial "Active Clinical Case" with empty Evaluation and Treatment Plan structures.
- **Security:**
  - Protected by `JwtAuthGuard`.
  - All data access is scoped to the `CurrentTherapist` (user ID).

## Frontend Architecture (React)

- **Routes (Spanish UI):**
  - `/pacientes` -> Renders `PatientList` component.
  - `/pacientes/:id` -> Renders `PatientProfile` component.
- **Components (English Code):**
  - `PatientList`: Searchable, filterable list of patients.
  - `PatientProfile`: Dashboard showing active case, history, and quick actions.
  - `Timeline`: Chronological view of treatment sessions.
  - `EvaluationForm`: Complex form for clinical assessment (Posturogram, Pain Scale).
  - `ComparisonBoard`: Visual comparison of "Before/After" states.

## Integration Points

- **Authentication:** Uses the shared `AuthContext` and `axios` interceptors for JWT management.
- **Calendar:** Client-side integration with Google Calendar (opens template link).
- **Future AI:** Placeholders exist for Voice Dictation (`onVoiceDictation`) and Image Analysis.

## Current Limitations

- **Media:** Image and audio capture are currently simulated (UI only).
- **Delete:** Soft delete is implemented in backend but UI might need "Undo" capability.

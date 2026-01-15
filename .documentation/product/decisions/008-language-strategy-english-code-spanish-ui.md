# ADR 008: Language Strategy - English Code, Spanish UI

**Date:** 2026-01-14  
**Status:** Accepted

## Context

The Mamirri App is being developed for a specific primary user: an expert physiotherapist whose native language is Spanish. However, the development team (and potential future contributors) operates in a global software engineering context where English is the standard.

We faced a conflict between:

1.  **User Experience (UX):** The end-user requires a Spanish interface (`/pacientes`, "Nuevo Paciente", "Historial Clínico").
2.  **Developer Experience (DX):** Code quality, maintainability, and collaboration are best served by English naming conventions (`/patients`, `createPatient`, `clinicalHistory`).

## Decision

We have decided to strictly separate the language domains:

1.  **Codebase (English):**
    - All code entities must be in English.
    - **Database Schema:** Tables (`users`, `patients`, `clinical_cases`), columns (`firstName`, `birthDate`).
    - **Backend Code:** Classes (`PatientsController`), methods (`findAll`), variables (`activeCase`).
    - **API Endpoints:** REST paths (`/api/v1/patients`, `/api/v1/auth/login`).
    - **Frontend Code:** Component names (`PatientList`, `PatientProfile`), props (`patient`, `onSave`), state variables.

2.  **User Interface (Spanish):**
    - All visible text presented to the user must be in Spanish.
    - **Browser URLs:** Frontend routes (`/pacientes`, `/pacientes/:id`).
    - **Labels & Buttons:** "Guardar", "Cancelar", "Editar Perfil".
    - **Notifications:** Toast messages ("Paciente creado correctamente").

## Consequences

### Positive

- **Maintainability:** The code follows standard international practices, making it easier for tools (linters, AI assistants) and other developers to understand.
- **Consistency:** Avoids "Spanglish" in code (e.g., `getPacientes`, `createCita`), which is error-prone and hard to read.
- **UX Alignment:** The user feels at home with a fully localized interface and URL structure.

### Negative

- **Translation Overhead:** Developers must mentally translate between the code concepts (`Patient`) and the UI representation ("Paciente") during implementation.
- **Routing Complexity:** There is a mismatch between API routes (`/patients`) and frontend routes (`/pacientes`), requiring careful attention in the API client layer.

## Implementation Example

**Frontend Route:**

```tsx
// App.tsx
<Route path="/pacientes" element={<Patients />} />
```

**API Call:**

```typescript
// api/patients.ts
export const patientsApi = {
  findAll: async () => {
    return axios.get<Patient[]>('/patients'); // Calls /api/v1/patients
  },
};
```

**Component:**

```tsx
// PatientList.tsx
export function PatientList({ patients }) {
  return <h1>Pacientes</h1>; // Renders Spanish title
}
```

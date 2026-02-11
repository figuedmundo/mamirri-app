# Milestone 2: Pacientes

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**

- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**

- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**

- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Pacientes feature — Gestión de expedientes médicos con captura por voz, fotos de antes/después y seguimiento longitudinal de cada paciente.

## Overview

The Pacientes section acts as a central clinical records system — a "Professional Athlete Logbook" for managing patient history, evaluations, and progress tracking. It uses voice AI for structured clinical admission and presents a visual timeline of the 15-session intervention model for longitudinal tracking.

**Key Functionality:**

- View and manage all patients in card-based grid layout
- Create new patients with voice dictation for clinical history (anamnesis)
- Record treatment sessions with pain scales (END 0-10) and functional independence indices (Barthel 0-100)
- View clinical case timeline with treatment phases and sessions
- Compare initial vs. final posturogram using split-slider visualization
- Edit patient information and clinical cases
- Delete patients with confirmation
- Schedule appointments via Google Calendar integration

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/pacientes/tests.md` for detailed test-writing instructions including:

- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**TDD Workflow:**

1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/pacientes/components/`:

- **PacientesList** — Grid of patient cards with search, filters, and quick actions
- **PacienteProfile** — Detailed patient view with cases history, photos, and action buttons
- **EvaluacionForm** — Form for recording clinical evaluation with posturograma, orthopedic tests
- **ComparacionBoard** — Before/After visual comparison slider for posture tracking
- **Cronograma** — Treatment sessions timeline with phase indicators
- **CaseDetailLayout** — Split layout wrapper showing clinical timeline and content
- **CaseTimeline** — Visual timeline of clinical case phases and sessions
- **PosturogramViewer** — Interactive posturogram viewer with anatomical point markers

### Data Layer

The components expect these data shapes:

```typescript
// Patient and clinical case structure
interface Paciente {
  id: string;
  nombre: string;
  edad: number;
  ocupacion: string;
  telefono: string;
  email?: string;
  fechaNacimiento: string;
  activo: boolean;
  casosClinicos: CasoClinico[];
}

interface CasoClinico {
  id: string;
  pacienteId: string;
  titulo: string;
  estado: 'activo' | 'completado' | 'inactivo';
  fechaInicio: string;
  motivoConsulta: string;
  evaluacion?: Evaluacion;
  sesionesTratamiento: SesionDeTratamiento[];
}

interface Evaluacion {
  posturograma: Posturograma;
  testOrtopedicos: TestOrtopedicos;
  escalaDolor: EscalaDolor;
  huellas: Huella[];
  videosPostura: VideoDePostura[];
}

interface SesionDeTratamiento {
  fecha: string;
  faseNumero: number;
  tecnicasAplicadas: string[];
  respuestaPaciente: string;
  dolorFinal: number; // 0-10 scale
}
```

You'll need to:

- Create API endpoints or data fetching logic for patients CRUD operations
- Connect real data to the components
- Implement voice transcription service for anamnesis and evolution notes

### Callbacks

Wire up these user actions:

- `onView(id)` — Navigate to patient profile page
- `onCreate()` — Open create patient form with voice dictation
- `onEdit(id)` — Open edit patient form
- `onDelete(id)` — Delete patient with confirmation modal
- `onSchedule(pacienteId)` — Open Google Calendar with pre-filled appointment data
- `onVoiceDictation()` — Start voice recording and AI transcription
- `onCaptureHuella()` — Open footprint capture interface
- `onCaptureVideo()` — Open posture/gait video capture
- `onSave(evaluacion)` — Save clinical evaluation data
- `onPosturogramaChange(posturograma)` — Update posturogram with marked deviations
- `onPainScaleChange(escalaDolor)` — Update pain scale values
- `onExport()` — Export comparison report (before/after)
- `onAddSession()` — Add new treatment session
- `onEditSession(id)` — Edit existing session
- `onViewSession(id)` — View session details

### Empty States

Implement empty state UI for when no records exist yet:

- **No patients yet:** Show helpful message and call-to-action when the patient list is empty
- **No active case:** Display message when patient has no active clinical case
- **Filtered empty results:** Handle cases where search or filter returns no matches
- **First-time user experience:** Guide users to create their first patient with clear CTAs

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/pacientes/README.md` — Feature overview and design intent
- `product-plan/sections/pacientes/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/pacientes/components/` — React components
- `product-plan/sections/pacientes/types.ts` — TypeScript interfaces
- `product-plan/sections/pacientes/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Create New Patient with Voice Dictation

1. User navigates to `/pacientes`
2. User clicks "Nuevo Paciente" button
3. User fills in personal information (nombre, edad, ocupacion, contacto)
4. User clicks "Iniciar Anamnesis por Voz"
5. User speaks consultation reason and medical history into microphone
6. System transcribes and structures the voice data
7. User clicks "Guardar Anamnesis"
8. **Outcome:** New patient appears in the list, clinical case automatically created with initial evaluation

### Flow 2: Record Treatment Session (Check-in)

1. User clicks on patient card to open profile
2. User sees active case with current metrics (dolor, sesiones)
3. User clicks floating action button (FAB) to add "Evolución Diaria"
4. User records pain scale (END) - actividad, reposo, palpación values (0-10)
5. User records Barthel index scores or notes
6. User clicks "Guardar Evolución"
7. **Outcome:** New treatment session appears in cronograma timeline, session number increments, pain level metric on patient card updates

### Flow 3: Compare Posturogram (Before/After)

1. User opens "Comparación" view for clinical case
2. User sees split slider with "Inicial" and "Actual" labels
3. User drags slider handle to compare postures
4. User observes deviation corrections (e.g., hipercifosis reduced)
5. User verifies symmetry indicators
6. **Outcome:** Visual comparison shows clear improvement or decline indicators, comparison can be exported

### Flow 4: View Patient Timeline

1. User clicks on patient card
2. User sees complete patient profile
3. User views CaseTimeline showing all phases and sessions
4. User clicks on a session to view details
5. **Outcome:** Session details display with applied techniques and patient response

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no patients or no cases exist
- [ ] All user actions work (create, edit, delete, view, schedule)
- [ ] Voice dictation integrates with AI transcription service
- [ ] Posturogram comparison slider functions correctly
- [ ] Pain scale and Barthel/Lawton indices are validated (0-10, 0-100 ranges)
- [ ] Treatment sessions timeline displays chronologically
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile

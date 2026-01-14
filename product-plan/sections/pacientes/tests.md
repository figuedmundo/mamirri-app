# Test Instructions: Pacientes

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Patients section is the central clinical records system acting as a "Professional Athlete Logbook" for managing patient history, evaluations, and progress tracking. It uses voice AI for structured admission and presents a visual timeline of the 15-session intervention model.

---

## User Flow Tests

### Flow 1: Admisión y Anamnesis por Voz

**Scenario:** User creates a new patient profile and records voice-dictated clinical history

#### Success Path

**Setup:**
- User is authenticated and has permission to create patients
- Device has microphone access for voice dictation

**Steps:**
1. User navigates to `/pacientes`
2. User sees "Pacientes" heading and search/filter controls
3. User clicks "Nuevo Paciente" button (primary teal button)
4. User fills in patient personal information (nombre, edad, ocupacion, contacto)
5. User clicks "Iniciar Anamnesis por Voz" button in profile
6. User speaks consultation reason, medical history into microphone
7. User clicks "Guardar Anamnesis" to transcribe and structure the data

**Expected Results:**
- [ ] New patient profile is created and appears in pacientes list
- [ ] Voice dictation UI appears with recording indicator
- [ ] Audio is transcribed and structured into clinical fields
- [ ] Success toast appears with message "Paciente creado exitosamente"
- [ ] Clinical case is automatically created with initial evaluation

#### Failure Path: Validation Error

**Setup:**
- User leaves required field empty (nombre)

**Steps:**
1. User leaves nombre field empty
2. User clicks "Guardar"

**Expected Results:**
- [ ] Validation error appears: "El nombre es obligatorio"
- [ ] Form is not submitted
- [ ] Nombre field gets focus and shows error state (red border)

#### Failure Path: Voice Dictation Error

**Setup:**
- Microphone access denied or no microphone available

**Steps:**
1. User clicks "Iniciar Anamnesis por Voz"
2. System cannot access microphone

**Expected Results:**
- [ ] Error message appears: "No se pudo acceder al micrófono. Verifica los permisos."
- [ ] Voice dictation button remains enabled for retry
- [ ] Manual text input fields are available as fallback

---

### Flow 2: Registro de Sesión (Check-in)

**Scenario:** User adds daily evolution note to active case during consultation

#### Success Path

**Setup:**
- Active case exists for a patient
- User is viewing patient profile

**Steps:**
1. User clicks on patient card to open profile
2. User sees active case with current metrics (dolor, sesiones)
3. User clicks floating action button (FAB) to add "Evolución Diaria"
4. User records pain scale (END) - actividad, reposo, palpación values (0-10)
5. User records Barthel index scores or notes
6. User clicks "Guardar Evolución"

**Expected Results:**
- [ ] New treatment session is added to clinical case
- [ ] Session appears in cronograma timeline
- [ ] Session number increments (e.g., Sesión 1 → Sesión 2)
- [ ] Success toast appears: "Evolución guardada"
- [ ] Pain level metric on patient card updates

#### Failure Path: Invalid Pain Scale Value

**Setup:**
- User enters pain value outside valid range (negative or > 10)

**Steps:**
1. User enters dolor value of 15
2. User clicks "Guardar Evolución"

**Expected Results:**
- [ ] Validation error: "La escala de dolor debe estar entre 0 y 10"
- [ ] Form prevents submission
- [ ] Error field highlighted with red border

---

### Flow 3: Evaluación Comparativa

**Scenario:** User compares initial and current posturogram to verify corrections

#### Success Path

**Setup:**
- Clinical case has initial and final evaluations
- Both evaluations have posturogram images

**Steps:**
1. User opens "Comparación" view for clinical case
2. User sees split slider with "Inicial" and "Actual" labels
3. User drags slider handle to compare postures
4. User observes deviation corrections (e.g., hipercifosis reduced)
5. User verifies symmetry indicators

**Expected Results:**
- [ ] Both posturogram images display side by side
- [ ] Slider handle moves smoothly between 0% and 100%
- [ ] Anatomical deviation markers overlay correctly on both images
- [ ] Comparison shows visual differences clearly
- [ ] Deviations list updates based on current slider position

---

## Empty State Tests

### Primary Empty State

**Scenario:** No patients exist in system (first-time use or all deleted)

**Setup:**
- Pacientes array is empty (`[]`)

**Expected Results:**
- [ ] Empty state heading is visible: "No se encontraron pacientes"
- [ ] Helpful description shows: "Intenta ajustar los filtros o agrega un nuevo paciente al sistema."
- [ ] "Nuevo Paciente" primary CTA button is visible
- [ ] User icon illustration appears centered
- [ ] No blank screen - helpful, not broken UI

### Filtered Empty State

**Scenario:** Search or filter returns no matching patients

**Setup:**
- Patients exist but search term or active filter matches none

**Expected Results:**
- [ ] Empty state message: "No se encontraron pacientes"
- [ ] Context-specific text: "Intenta ajustar los filtros o agrega un nuevo paciente al sistema."
- [ ] "Nuevo Paciente" button is visible
- [ ] Active filter shows (Todos/Activos/Recientes/Cita hoy)
- [ ] Reset filters option available (clicking "Todos" clears filter)

### Empty Active Case

**Scenario:** Patient exists but has no active clinical case

**Setup:**
- Paciente has no CasoClinico with estado 'activo'

**Expected Results:**
- [ ] "Sin caso activo actualmente" message appears in card
- [ ] Dashed border container indicates no active case
- [ ] Pain and session count metrics don't display
- [ ] "Nuevo Caso" or similar CTA is visible

---

## Component Interaction Tests

### PacientesList

**Renders correctly:**
- [ ] Displays heading "Pacientes" with subtext
- [ ] Shows all filter buttons (Todos, Activos, Recientes, Cita hoy)
- [ ] Search input field is visible with search icon
- [ ] "Nuevo Paciente" button renders with plus icon

**Filtering:**
- [ ] Clicking "Activos" filter shows only pacientes.activo === true
- [ ] Clicking "Recientes" shows patients with fechaCreacion in last 30 days
- [ ] Clicking "Cita hoy" shows patients with session scheduled today
- [ ] Clicking "Todos" shows all patients
- [ ] Active filter button has teal background, inactive has gray

**Search:**
- [ ] Typing in search filters by nombre in real-time
- [ ] Search is case-insensitive
- [ ] Clearing search shows all patients again

**Patient Card Display:**
- [ ] Shows paciente.nombre and edad
- [ ] Active/inactivo status badge displays correctly (green/gray)
- [ ] Active case title displays when exists
- [ ] Pain level color-coded: >5 shows rose, ≤5 shows emerald
- [ ] Session count displays (e.g., "8 / 15")

**User interactions:**
- [ ] Clicking patient card calls onView with patient id
- [ ] Clicking edit icon calls onEdit with patient id
- [ ] Clicking delete icon calls onDelete with patient id
- [ ] Hover effect shows border color change to teal-500/30

### PacienteProfile

**Renders correctly:**
- [ ] Displays patient personal info (nombre, edad, ocupacion, contacto)
- [ ] Shows active case with current metrics
- [ ] Lists all clinical cases in timeline
- [ ] Action buttons render with correct labels

**User interactions:**
- [ ] Clicking "Agendar en Google Calendar" calls onSchedule
- [ ] Clicking "Capturar Huella" calls onCaptureHuella
- [ ] Clicking "Capturar Video Postura" calls onCaptureVideo
- [ ] Clicking "Dictar Notas" calls onVoiceDictation
- [ ] Clicking "Editar" calls onEdit

### EvaluacionForm

**Renders correctly:**
- [ ] Displays current clinical case info
- [ ] Posturograma view shows 4 anatomical views
- [ ] Orthopedic tests (Thomas, Ely, Ober, Schober) display with inputs
- [ ] Pain scale inputs show 3 values (actividad, reposo, palpación)
- [ ] Barthel and Lawton score forms display with all sub-scores

**User interactions:**
- [ ] Clicking anatomical points toggles deviation markers
- [ ] Inputting test results updates interpretation text
- [ ] Updating pain values recalculates average or displays individual
- [ ] Clicking "Guardar" calls onSave with complete evaluacion object
- [ ] Clicking "Dictar por Voz" calls onVoiceDictation

**Validation:**
- [ ] Required fields show validation when empty
- [ ] Pain values only accept 0-10 range
- [ ] Barthel sub-scores sum matches total

### Cronograma

**Renders correctly:**
- [ ] Displays sessions in chronological order
- [ ] Phase indicators show progression (Fase 1, Fase 2, Fase 3)
- [ ] Each session shows fecha, techniques applied, and response
- [ ] Pain level displays color-coded

**User interactions:**
- [ ] Clicking session calls onViewSession
- [ ] Clicking "Añadir Sesión" calls onAddSession
- [ ] Clicking edit on session calls onEditSession
- [ ] Sessions within same phase grouped visually

---

## Edge Cases

- [ ] **Very long patient names:** Text truncates gracefully with ellipsis
- [ ] **100+ patients:** Grid layout handles large numbers without breaking
- [ ] **No active case:** Patient card shows helpful message, no broken state
- [ ] **100+ treatment sessions:** Cronograma scrolls smoothly, all sessions accessible
- [ ] **Very long voice transcription:** Scrolls or expands to show full text
- [ ] **Missing photos/videos:** UI handles missing media without broken image links
- [ ] **Transition from empty to populated:** After creating first patient, list renders correctly
- [ **Transition from populated to empty:** After deleting last patient, empty state appears
- [ **Concurrent access:** Multiple clinicians can view same patient without data conflicts
- [ ] **Spanish special characters:** Names with accents (á, é, í, ó, ú, ñ) display correctly

---

## Accessibility Checks

- [ ] All patient cards and buttons are keyboard accessible
- [ ] Form fields have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Focus moves logically after actions (e.g., after deletion, focus moves to next item)
- [ ] Voice dictation has proper ARIA announcements for recording state
- [ ] Slider controls for posturogram comparison support keyboard navigation
- [ ] Color coding (pain levels) has sufficient contrast and text indicators

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

```typescript
// Example test data - populated state
const mockPatient: Paciente = {
  id: "pac-001",
  nombre: "Juan Pérez",
  edad: 45,
  ocupacion: "Camarero",
  telefono: "+34 612 345 678",
  fechaNacimiento: "1979-03-15",
  activo: true,
  fechaCreacion: "2025-01-05",
  casosClinicos: [
    {
      id: "caso-001",
      pacienteId: "pac-001",
      titulo: "Fascitis Plantar - Pie Derecho",
      estado: "activo",
      fechaInicio: "2025-01-05",
      evaluacion: { /* ... */ },
      sesionesTratamiento: []
    }
  ]
}

// Example test data - empty states
const mockEmptyList: Paciente[] = []

const mockPatientNoActiveCase: Paciente = {
  id: "pac-002",
  nombre: "María García",
  edad: 32,
  ocupacion: "Profesora",
  telefono: "+34 678 901 234",
  fechaNacimiento: "1992-07-12",
  activo: true,
  fechaCreacion: "2024-11-20",
  casosClinicos: []
}

// Example test data - high pain level
const mockHighPainCase: CasoClinico = {
  id: "caso-999",
  pacienteId: "pac-999",
  titulo: "Dolor Lumbar Agudo",
  estado: "activo",
  evaluacion: {
    escalaDolor: {
      actividad: 9,
      reposo: 10,
      palpacion: 9,
      tipo: "agudo"
    }
  }
}
```

---

## Notes for Test Implementation

- Mock API calls to test both success and failure scenarios for patient CRUD operations
- Test each callback prop is called with correct arguments
- Verify UI updates optimistically where appropriate (immediate session count update)
- Test that loading states appear during async operations (saving, voice transcription)
- Ensure error boundaries catch and display errors gracefully
- **Always test empty states** — Pass empty arrays to verify helpful empty state UI appears (not blank screens)
- Test transitions: empty → first patient created, last patient deleted → empty state returns
- Test voice dictation mock with simulated audio files for transcription validation
- Verify Google Calendar integration triggers correct calendar URL with pre-filled data
- Test posturogram comparison slider at various positions (0%, 25%, 50%, 75%, 100%)

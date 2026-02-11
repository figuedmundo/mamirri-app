# Mamirri App — Complete Implementation Instructions

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

# Product Overview

**Product Name:** Mamirri App

**Summary:**

Una app de tablet o celulares para fisioterapeutas que captura datos por voz y fotos, analiza huellas plantares, analiza videos de posturas o caminatas tomadas por el profesional y sugiere tratamientos basados en evidencia médica, libros y artículos en cualquier idioma, presentando toda la información en español o inglés.

**Planned Sections:**

1. **Pacientes** — Gestión de expedientes médicos con captura por voz, fotos de antes/después y seguimiento longitudinal de cada paciente.

2. **Análisis** — Análisis visual de huellas plantares y videos de postura/caminata para detectar patrones y evolución objetiva.

3. **Biblioteca Médica** — Búsqueda inteligente en libros, artículos y evidencia médica global en cualquier idioma con resultados en español o inglés.

4. **Plantillas** — Sugerencias de diseño de plantillas ortopédicas personalizadas basadas en el análisis del paciente y evidencia médica.

**Data Model:**

**Core Entities:**

- Paciente — La persona que recibe tratamiento, con su historial completo
- Caso clínico — Un episodio de atención para una condición específica
- Evaluación — Sesión de diagnóstico con fotos, videos y hallazgos iniciales
- Plan de tratamiento — Plan definido por el doctor con objetivos y modalidades
- Sesión de tratamiento — Visitas donde se ejecuta el plan y se monitorea el progreso
- Huella — Imágenes de huellas plantares capturadas para análisis visual
- Video de postura — Grabaciones de caminatas o posturas para análisis biomecánico
- Plantilla — Diseños de plantillas ortopédicas personalizadas
- Referencia bibliográfica — Libros, artículos y evidencia médica consultada

**Design System:**

**Colors:**

- Primary: Teal — Used for buttons, links, key accents
- Secondary: Sky — Used for tags, highlights, secondary elements
- Neutral: Slate — Used for backgrounds, text, borders

**Typography:**

- Heading: DM Sans
- Body: DM Sans
- Mono: IBM Plex Mono

**Implementation Sequence:**

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing structure, and application shell
2. **Pacientes** — Medical record management with voice capture and patient follow-up
3. **Análisis** — Visual analysis of footprints and posture/gait videos
4. **Biblioteca Médica** — Smart search in medical literature with AI-powered results
5. **Plantillas** — Custom orthopedic insole design with AI assistance and manual precision tools

Each milestone has a dedicated instruction document in `product-plan/instructions/`.

---

# Milestone 1: Foundation

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** None

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Colors:**

- Primary: `teal` — Buttons, links, key accents
- Secondary: `sky` — Tags, highlights, secondary elements
- Neutral: `slate` — Backgrounds, text, borders

**Typography:**

- Heading: DM Sans
- Body: DM Sans
- Mono: IBM Plex Mono

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Core Entities:**

- Paciente — Patient with medical history
- CasoClinico — Treatment episode for a specific condition
- Evaluación — Diagnostic session with findings
- PlanTratamiento — Treatment plan with modalities
- SesionTratamiento — Treatment visits with progress tracking
- Huella — Footprint images for analysis
- VideoPostura — Gait/posture recordings
- Plantilla — Custom insole designs
- ReferenciaBibliografica — Medical evidence references

### 3. Routing Structure

Create placeholder routes for each section:

- `/` — Home page (session dashboard)
- `/pacientes` — Patient management
- `/analisis` — Visual analysis tools
- `/biblioteca` — Medical literature search
- `/plantillas` — Insole design tool
- `/ajustes` — Settings (language, voice, AI preferences)

### 4. Application Shell

Copy shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User menu with avatar

**Wire Up Navigation:**

Connect navigation to your routing:

- Pacientes → `/pacientes`
- Análisis → `/analisis`
- Biblioteca Médica → `/biblioteca`
- Plantillas → `/plantillas`
- Ajustes → `/ajustes`

**User Menu:**

The user menu expects:

- User name
- Avatar URL (optional)
- Logout callback

### 5. Home Page

Create initial dashboard that users see:

- "Sesiones hoy" — Patients with scheduled appointments (highlighted)
- "Pacientes recientes" — Patients seen in last week
- "+ Nuevo Paciente" — Floating action button (FAB), bottom right corner, always visible

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components
- `product-plan/product-overview.md` — Product context

## Done When

- [ ] Design tokens are configured (teal/sky/slate colors, DM Sans typography)
- [ ] Data model types are defined (all 9 core entities)
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Home page displays dashboard with sessions and recent patients
- [ ] "Nuevo Paciente" FAB is visible and functional
- [ ] Responsive on mobile (hamburger menu on mobile)

---

# Milestone 2: Pacientes

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## Goal

Implement the Pacientes feature — Gestión de expedientes médicos con captura por voz, fotos de antes/después y seguimiento longitudinal de cada paciente.

## Overview

The Pacientes section acts as a central clinical records system — a "Professional Athlete Logbook" for managing patient history, evaluations, and progress tracking. It uses voice AI for structured clinical admission and presents a visual timeline of a 15-session intervention model for longitudinal tracking.

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

- **No patients yet:** Show helpful message and call-to-action when patient list is empty
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
4. User observes deviation corrections (e.g., hiperlordosis reduced)
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

---

# Milestone 3: Análisis

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Pacientes) complete

---

## Goal

Implement the Análisis feature — Análisis visual de huellas plantares y videos de postura/caminata para detectar patrones y evolución objetiva.

## Overview

Analysis section provides objective biomechanical evaluation tools: podoscopy (footprints), posturogram (static posture), video analysis (dynamic gait), and dashboard comparing initial vs. final state to track objective progress.

**Key Functionality:**

- Upload and analyze footprints with pressure heatmaps and arch classification (plano/cavo/normal)
- Capture posturogram with 4 views (anterior, posterior, lateral) and mark anatomical deviations
- Analyze gait/posture videos with slow-motion playback and angle detection
- Compare initial vs. final evaluations with visual charts (pain reduction, functional test improvement)
- Generate comparative diagnostic reports (Inicial vs. Final)

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/analisis/tests.md` for detailed test-writing instructions including:

- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**

1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/analisis/components/`:

- **AnalisisDashboard** — Overview dashboard with case comparison and key metrics
- **EvolucionDashboard** — Progress charts comparing initial vs. final state
- **DiagnosticoComparativoCard** — Summary card showing improvement/decline indicators
- **DolorChart** — Line chart tracking pain levels over sessions
- **TestsComparativosChart** — Bar chart comparing functional test results
- **VideoAnalysis** — Video player with slow-motion and angle detection
- **PosturogramaView** — 4-view posturogram with anatomical point markers
- **HuellaAnalysis** — Footprint viewer with pressure heatmap and arch classification

### Data Layer

The components expect these data shapes:

```typescript
// Footprint analysis
interface Huella {
  id: string;
  evaluacionId: string;
  tipo: 'inicial' | 'final' | 'seguimiento';
  fecha: string;
  url: string;
  analisis?: {
    arco: 'plano' | 'cavo' | 'normal';
    presionTalon: string;
    desviacion: string;
  };
}

// Posturogram structure
interface Posturograma {
  vistaAnterior?: VistaPostural;
  vistaPosterior?: VistaPostural;
  vistaSagitalLateral?: VistaPostural;
  marcha?: string;
  cabeza?: string;
  hombros?: string;
  columna?: string;
  pelvis?: string;
  rodillas?: string;
  pies?: string;
}

// Video analysis
interface VideoDePostura {
  id: string;
  evaluacionId: string;
  tipo: 'caminata' | 'postura-estatica';
  fecha: string;
  url: string;
  duracion: number;
  observaciones: string;
  angulosDetectados?: {
    genuFlexo: number;
    inclinacionTronco: number;
    // ... other angle measurements
  };
}
```

You'll need to:

- Create API endpoints or data fetching logic for footprint, posturogram, and video data
- Implement image/video upload with file validation
- Connect real data to the components
- Implement slow-motion video playback logic
- Generate charts for progress tracking

### Callbacks

Wire up these user actions:

- `onSelectCase(id)` — Load clinical case for analysis
- `onUploadVideo(file)` — Upload and process posture/gait video
- `onUploadHuella(file)` — Upload footprint image
- `onSavePosturograma(posturograma)` — Save posturogram with marked anatomical points
- `onExportReport()` — Generate and export analysis report
- `onPlay()` / `onPause()` — Video playback controls
- `onSeek(timestamp)` — Seek to specific video timestamp
- `onToggleSlowMotion()` — Toggle slow-motion mode (0.5x, 0.25x)
- `onSelectView(viewType)` — Select posturogram view (anterior/posterior/lateral)
- `onToggleComparison()` — Toggle between initial and final comparison mode

### Empty States

Implement empty state UI for when no analysis data exists yet:

- **No case selected:** Show message to select clinical case for analysis
- **No evaluation data:** Display when case has no initial evaluation
- **No progress yet:** Show single evaluation data point when no follow-up sessions

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/analisis/README.md` — Feature overview and design intent
- `product-plan/sections/analisis/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/analisis/components/` — React components
- `product-plan/sections/analisis/types.ts` — TypeScript interfaces
- `product-plan/sections/analisis/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Analyze Footprint

1. User selects clinical case
2. User clicks "Subir Huella" button
3. User selects footprint image file (left or right foot)
4. System processes image and displays heatmap
5. User views arch classification (plano/cavo/normal)
6. **Outcome:** Footprint displays with pressure analysis, arch type labeled, symmetry comparison visible

### Flow 2: Capture Posturogram

1. User clicks "Capturar Posturograma" button
2. User uploads 4 images (anterior, posterior, lateral izquierda, lateral derecha)
3. System displays 4-view posturogram interface
4. User clicks on anatomical points (head, shoulders, spine, pelvis)
5. User drags points to correct positions
6. System auto-detects deviations (escoliosis, hiperlordosis)
7. User clicks "Guardar Posturograma"
8. **Outcome:** Posturogram saved with deviations list, ready for comparison

### Flow 3: Analyze Gait Video

1. User uploads posture/gait video
2. Video player loads with full controls
3. User clicks "Slow Motion" toggle button
4. Video plays at 0.25x or 0.5x speed
5. User observes gait phases (heel strike, toe-off, landing)
6. System detects angles (genu flexo, tronco inclination)
7. User switches to "Comparación Inicial vs. Final" mode
8. **Outcome:** Frame-by-frame analysis complete, comparison view available

### Flow 4: Generate Comparative Report

1. User opens "Evolución" dashboard
2. User views comparison cards for each metric
3. User views pain reduction chart (9/10 → 4/10)
4. User views functional test improvements (Schober: +3cm → +4cm)
5. User clicks "Generar Diagnóstico Comparativo"
6. **Outcome:** Summary text generated, report exported/downloaded, improvement indicators shown

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no analysis data exists
- [ ] All user actions work (upload, save, export, video controls)
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
- [ ] Slow-motion video playback works smoothly
- [ ] Posturogram deviation detection highlights correctly
- [ ] Charts display accurate comparisons (initial vs. final)

---

# Milestone 4: Biblioteca Médica

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## Goal

Implement the Biblioteca Médica feature — Búsqueda inteligente en libros, artículos y evidencia médica global en cualquier idioma con resultados en español o inglés.

## Overview

Biblioteca Médica is a smart clinical research assistant with natural language search, structured category navigation, and AI-powered translation between medical languages (EN/ES). It helps clinicians find protocols, anatomical references, and evidence during patient evaluation.

**Key Functionality:**

- Natural language search for protocols and medical literature
- Structured category navigation (Osteology, Myology, Elasticity Tests, etc.)
- View detailed protocol cards (Ficha Explicativa) with definition, justification, and procedure steps
- Toggle between original language (often English) and Spanish translation
- View bibliographic references with author, year, title, source
- Add references to treatment plans

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/biblioteca-medica/tests.md` for detailed test-writing instructions including:

- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**

1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/biblioteca-medica/components/`:

- **BibliotecaDashboard** — Main interface with search, categories, and results
- **SearchBar** — Prominent search input with natural language support
- **CategoryNav** — Structured category navigation (Osteology, Myology, etc.)
- **ProtocolList** — List of techniques/protocols matching search or category
- **BibliographyPanel** — Dedicated panel for formal citations and references

### Data Layer

The components expect these data shapes:

```typescript
// Protocol structure
interface Protocol {
  id: string;
  nombre: string;
  categoria: string;
  definicionES: string;
  definicionEN: string;
  justificacion: string;
  pasos: string[];
  referencias: ReferenciaBibliografica[];
}

// Reference structure
interface ReferenciaBibliografica {
  id: string;
  protocoloId: string;
  autor: string;
  año: number;
  titulo: string;
  fuente: string;
  url?: string;
  idiomaOriginal?: string;
}
```

You'll need to:

- Create API endpoints or data fetching logic for protocol/library search
- Implement natural language search with debouncing
- Connect real data to the components
- Implement translation toggle (ES/EN) logic
- Handle missing translations gracefully

### Callbacks

Wire up these user actions:

- `onSearch(query)` — Execute search with natural language query
- `onSelectCategory(category)` — Filter by category
- `onSelectProtocol(protocolId)` — View detailed protocol information
- `onToggleLanguage()` — Toggle between EN/ES translation
- `onViewReference(referenceId)` — View full bibliographic reference or open link
- `onAddToCase(protocolId)` — Add protocol reference to treatment plan

### Empty States

Implement empty state UI for when no data exists:

- **Initial state:** Show helpful welcome message with search and category options
- **No search results:** Display message when search returns no matches
- **Empty category:** Show message when selected category has no protocols yet
- **No bibliography:** Display message when protocol has no references

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/biblioteca-medica/README.md` — Feature overview and design intent
- `product-plan/sections/biblioteca-medica/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/biblioteca-medica/components/` — React components
- `product-plan/sections/biblioteca-medica/types.ts` — TypeScript interfaces
- `product-plan/sections/biblioteca-medica/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Search for Protocol

1. User navigates to `/biblioteca`
2. User sees prominent search bar
3. User types natural language query (e.g., "88-year-old patient with hiperlordosis")
4. System searches and displays matching protocols
5. User scrolls through results
6. **Outcome:** Relevant protocols displayed, user can select to view details

### Flow 2: Browse by Category

1. User sees category chips below search bar
2. User clicks "Osteology" category
3. System filters to show only osteology-related content
4. User views protocols
5. User clicks "Myology" category
6. **Outcome:** Results update immediately, only protocols in selected category display

### Flow 3: View Protocol Details (Ficha Explicativa)

1. User clicks on protocol card from search results
2. "Ficha Explicativa" modal/panel opens
3. User reads definition in Spanish
4. User sees justification for using this technique
5. User follows step-by-step procedure
6. User toggles "Ver original" switch
7. Content changes to English source language
8. **Outcome:** Full protocol information accessible, translation toggle works

### Flow 4: Add Reference to Treatment Plan

1. User finds relevant protocol during evaluation
2. User views protocol details
3. User clicks "Añadir a Plan de Tratamiento" button
4. System adds reference to clinical case
5. **Outcome:** Reference appears in treatment plan bibliography, ready for reference during sessions

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no search results or empty categories
- [ ] All user actions work (search, filter, select, toggle language)
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
- [ ] Natural language search accepts complex medical queries
- [ ] Translation toggle switches between EN and ES smoothly
- [ ] Bibliographic references format correctly and links work

---

# Milestone 5: Plantillas

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

**Note:** The Plantillas section is a full-screen workspace (no shell navigation). Ensure this is considered in your routing and layout implementation.

---

## Goal

Implement the Plantillas feature — Sugerencias de diseño de plantillas ortopédicas personalizadas basadas en el análisis del paciente y evidencia médica.

## Overview

Plantillas is a full-screen CAD-like workspace for designing custom orthopedic insoles with 3D modeling, AI automation, and biomechanical validation. It combines structural editing (sliders) with precise relief painting (brush) and integrates with patient diagnosis data.

**Key Functionality:**

- Import patient diagnosis data and auto-generate base insole model with suggested corrections
- Edit insole structure via precision sliders (arch height, heel wedge, lateral wedge)
- Paint relief zones on 3D model using brush tool (soft spots for pain points)
- View 3D model with rotate, zoom, pan controls
- Manage material layers (base, middle, top cover) with EVA density selection
- Validate biomechanical alignment with side-by-side diagnosis comparison
- Generate technical PDF spec sheet for manufacturing
- Full-screen workspace (no main app navigation while editing)

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/plantillas/tests.md` for detailed test-writing instructions including:

- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**

1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/plantillas/components/`:

- **PlantillasEditor** — Full-screen CAD workspace with 3D viewer
- **InsoleViewer3D** — Interactive 3D model with rotate/zoom/pan
- **Toolbar** — Tool switching (Slider/Brush modes) and action buttons
- **PropertiesPanel** — Sliders for structural adjustments
- **ClinicalSidePanel** — Persistent right panel displaying diagnosis and posturogram findings
- **LayerManager** — Controls for material layers (Base, Middle, Top cover)

### Data Layer

The components expect these data shapes:

```typescript
// Insole design
interface Plantilla {
  id: string;
  casoClinicoId: string;
  tipo: 'plantilla-ortopédica' | 'tobillera' | 'otro';
  material: 'corcho' | 'neopreno' | 'eva' | 'otro';
  caracteristicas?: {
    realceInterno?: number;
    soporteArco?: string;
    talonera?: string;
    alturaTotal?: number;
    tipoFijacion?: string;
    nivelInmovilizacion?: string;
    altura?: number | string;
  };
  diseño: {
    alturaArco: number;
    inclinacionTalon: number;
    zonasAlivio: ZonaAlivio[];
  };
  materiales: MaterialPlanta[];
}

interface ZonaAlivio {
  ubicacion: { x: number; y: number };
  radio: number;
  nivel: number; // 1-5 (soft to firm)
}

interface MaterialPlanta {
  capa: 'base' | 'media' | 'cubierta';
  tipo: 'EVA_rigido' | 'EVA_medio' | 'EVA_suave';
  espesor?: number;
}
```

You'll need to:

- Create API endpoints or data fetching logic for insole designs
- Implement 3D model rendering and controls (rotate, zoom, pan)
- Connect real patient diagnosis data to the editor
- Implement biomechanical validation logic
- Generate PDF generation for technical spec sheets
- Handle undo/redo history for design changes

### Callbacks

Wire up these user actions:

- `onSave(plantilla)` — Save insole design
- `onExportPDF()` — Generate and download technical spec sheet
- `onChangeProperties(properties)` — Update structural parameters via sliders
- `onPaintRelief(zona)` — Paint relief zone with brush tool
- `onToggleTool(tool)` — Switch between Slider and Brush modes
- `onSelectMaterial(layer, material)` — Select material for specific layer
- `onClose()` — Exit full-screen editor and return to navigation
- `onAddLayer()` — Add new material layer
- `onRemoveLayer(layerId)` — Remove a layer
- `onReorderLayers(orderedLayers)` — Change layer stacking order

### Empty States

Implement empty state UI for when no data exists:

- **No clinical case selected:** Show message to select case before creating insole
- **No evaluation data:** Display warning when case has no diagnosis to import
- **No layers defined:** Show message to add material layers before export

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/plantillas/README.md` — Feature overview and design intent
- `product-plan/sections/plantillas/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/plantillas/components/` — React components
- `product-plan/sections/plantillas/types.ts` — TypeScript interfaces
- `product-plan/sections/plantillas/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Import Diagnosis and Auto-Generate

1. User navigates to `/plantillas`
2. User selects clinical case from dropdown
3. User clicks "Crear Nueva Plantilla" button
4. System automatically imports diagnosis data
5. Base insole model generates with suggested corrections
6. User sees "Pie Talo" and "Pelvic Retroversion" markers on model
7. **Outcome:** Base model created with AI-suggested adjustments based on diagnosis

### Flow 2: Edit Structure with Sliders

1. User views Properties Panel with sliders
2. User adjusts "Arch Height" slider (0-20mm)
3. Model updates in real-time as slider moves
4. User adjusts "Heel Wedge" slider (0-10mm)
5. User adjusts "Lateral Wedge" for valgo/varo correction
6. User observes 3D model changes
7. **Outcome:** 3D model shows structural changes immediately, values update

### Flow 3: Paint Relief Zones with Brush

1. User toggles to "Brush" mode
2. User selects brush size from options (Small, Medium, Large)
3. User selects relief level (Soft, Medium, Firm)
4. User paints on 3D model where patient reports pain
5. User paints multiple relief zones (metatarsal, heel area)
6. **Outcome:** Relief zones appear in different color/texture, Clinical Side Panel shows zones list

### Flow 4: Biomechanical Validation

1. User views Clinical Side Panel
2. User compares insole design vs. posturogram findings
3. User checks if arch height corrects rectified lumbar spine
4. User adjusts if needed
5. User views side-by-side: foot position → lumbar alignment
6. User confirms design is biomechanically sound
7. **Outcome:** Chain alignment indicator shows (green/red) if corrections are coherent

### Flow 5: Material Selection and Export PDF

1. User opens Layer Manager
2. User sees 3 layers: Base, Middle, Top Cover
3. User selects "EVA Rígido" for Base layer
4. User selects "EVA Medio" for Middle layer
5. User selects "EVA Suave" for Top Cover
6. User clicks "Generar PDF Técnico"
7. System generates PDF with dimensions, materials, specifications
8. Download starts
9. **Outcome:** PDF downloaded with complete technical spec for manufacturing

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real patient diagnosis data
- [ ] Empty states display properly when no case selected or no layers
- [ ] All user actions work (save, export, edit structure, paint relief, toggle tools)
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] 3D viewer performs smoothly (rotate, zoom, pan)
- [ ] Slider adjustments update model in real-time without lag
- [ ] Brush tool paints relief zones correctly
- [ ] Layer manager allows material selection and reordering
- [ ] Biomechanical validation checks coherence and shows warnings
- [ ] PDF generation creates complete technical spec sheet
- [ ] Full-screen editor blocks main app navigation (as designed)
- [ ] "Cerrar" button properly returns to main navigation
- [ ] Undo/redo history works for design changes

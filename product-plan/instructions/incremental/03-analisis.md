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

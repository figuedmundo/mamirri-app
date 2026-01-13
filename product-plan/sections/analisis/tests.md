# Test Instructions: Análisis

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Analysis section provides objective biomechanical evaluation tools: podoscopy (footprints), posturogram (static posture), video analysis (dynamic gait), and dashboard comparing initial vs. final state to track objective progress.

---

## User Flow Tests

### Flow 1: Análisis de Huellas

**Scenario:** User uploads footprint image for pressure analysis

#### Success Path

**Setup:**
- Clinical case exists and is selected
- User has permission to upload images

**Steps:**
1. User navigates to `/analisis`
2. User selects clinical case from dropdown
3. User clicks "Subir Huella" button
4. User selects image file (left or right foot)
5. System processes image and displays heatmap
6. User views arch classification (plano/cavo/normal)

**Expected Results:**
- [ ] Footprint image displays with pressure heatmap overlay
- [ ] Heatmap uses color gradient (red = high pressure, blue = low pressure)
- [ ] Arch type is labeled: "Plano", "Cavo", or "Normal"
- [ ] Symmetry analysis shows comparison between left/right foot
- [ ] Pressure points list displays with zones (talón, antepie, etc.)

#### Failure Path: Invalid Image Format

**Setup:**
- User uploads non-image file (PDF, DOCX)

**Steps:**
1. User selects PDF file
2. System attempts to process

**Expected Results:**
- [ ] Error message: "Formato no válido. Solo se aceptan imágenes (JPG, PNG)."
- [ ] Upload button remains enabled for retry
- [ ] Invalid file is rejected before processing

---

### Flow 2: Posturograma Marking

**Scenario:** User captures posturogram and marks anatomical deviation points

#### Success Path

**Setup:**
- 4 posture images are available (anterior, posterior, lateral izquierda, lateral derecha)

**Steps:**
1. User clicks "Capturar Posturograma" button
2. User uploads 4 images to respective views
3. System displays 4-view posturogram interface
4. User clicks on anatomical points (head, shoulders, spine, pelvis)
5. User drags points to correct positions
6. System auto-detects deviations (escoliosis, hiperlordosis)
7. User clicks "Guardar Posturograma"

**Expected Results:**
- [ ] All 4 views display in grid layout
- [ ] Anatomical points are clickable and draggable
- [ ] Deviations list updates in real-time as points move
- [ ] Detected deviations highlight automatically (e.g., "Escoliosis detectada")
- [ ] Save button stores complete posturogram data
- [ ] Success toast: "Posturograma guardado"

#### Failure Path: Missing View

**Setup:**
- User only uploads 2 of 4 required views

**Steps:**
1. User uploads anterior and posterior views
2. User leaves laterals empty
3. User clicks "Guardar Posturograma"

**Expected Results:**
- [ ] Validation error: "Se requieren las 4 vistas del posturograma"
- [ ] Missing views are highlighted in UI
- [ ] Save is prevented until all views are provided

---

### Flow 3: Análisis de Video con Slow-Motion

**Scenario:** User analyzes gait video frame-by-frame to detect movement patterns

#### Success Path

**Setup:**
- Video file is available (MP4 or similar format)

**Steps:**
1. User clicks "Subir Video de Postura" button
2. User selects video file (marcha or postura estática)
3. Video player loads with full controls
4. User clicks "Slow Motion" toggle button
5. Video plays at 0.25x or 0.5x speed
6. User observes gait phases (heel strike, toe-off, landing)
7. User pauses to analyze specific frame
8. System detects angles (genu flexo, tronco inclination)
9. User switches to "Comparación Inicial vs. Final" mode

**Expected Results:**
- [ ] Video player displays with play/pause controls
- [ ] Speed indicator shows current playback rate (1x, 0.5x, 0.25x)
- [ ] Timeline shows frame-by-frame navigation
- [ ] Gait phase markers appear at key timestamps
- [ ] Angle detection overlays display on video
- [ ] Slow-motion maintains audio sync (if applicable)
- [ ] Comparison mode shows initial and final video side-by-side with ghosting

#### Failure Path: Corrupted Video

**Setup:**
- Uploaded video file is corrupted or unsupported codec

**Steps:**
1. User uploads file
2. System attempts to load video

**Expected Results:**
- [ ] Error message: "Video no pudo cargarse. Verifica que el archivo no esté corrupto."
- [ ] Placeholder shows or last valid video remains displayed
- [ ] Upload button remains enabled for retry

---

### Flow 4: Diagnóstico Comparativo

**Scenario:** User generates comparative report showing improvement between initial and final state

#### Success Path

**Setup:**
- Clinical case has initial and final evaluations
- Both have functional test results and pain scales

**Steps:**
1. User opens "Evolución" dashboard
2. User sees comparison cards for each metric
3. User views pain reduction chart (9/10 → 4/10)
4. User views functional test improvements (Schober: +3cm → +4cm)
5. User clicks "Generar Diagnóstico Comparativo"
6. System generates summary text

**Expected Results:**
- [ ] Pain chart shows line graph from session 1 to session 15
- [ ] Initial value and final value are clearly marked
- [ ] Functional test bar chart shows improvement trend
- [ ] Diagnostic summary text is generated
- [ ] Improvement indicators show green for positive changes, red for decline
- [ ] Export/download button provides PDF or shareable report
- [ ] Success toast: "Reporte comparativo generado"

---

## Empty State Tests

### No Clinical Case Selected

**Scenario:** User navigates to analysis section without selecting a case

**Setup:**
- No clinical case is selected for analysis

**Expected Results:**
- [ ] Empty state message: "Selecciona un caso clínico para análisis"
- [ ] Case selector dropdown is visible and enabled
- [ ] Placeholder illustration shows analysis icon
- [ ] Help text: "Elige un caso de la lista para ver evaluaciones y análisis"
- [ ] No analysis tools are enabled until case is selected

### No Evaluation Data

**Scenario:** Clinical case selected but has no initial evaluation data

**Setup:**
- CasoClinico exists but evaluacion is null or empty

**Expected Results:**
- [ ] Message: "Sin evaluación inicial disponible"
- [ ] "Crear Evaluación" CTA button is visible
- [ ] Case info displays (title, date) but analysis tools show empty state
- [ ] No broken charts or broken image placeholders

### No Progress Yet

**Scenario:** Case has initial evaluation but no follow-up sessions for comparison

**Setup:**
- Only one evaluation exists (initial), no final/intermediate data

**Expected Results:**
- [ ] Single evaluation data displays correctly
- [ ] Comparison mode shows "En progreso" instead of before/after
- [ ] Charts display single data point
- [ ] Message: "Compara inicial vs. actual cuando tengas más sesiones"
- [ ] Progress tracking shows "1 evaluación registrada"

---

## Component Interaction Tests

### AnalisisDashboard

**Renders correctly:**
- [ ] Displays case selector dropdown
- [ ] Shows summary cards (sessions, current pain, last evaluation date)
- [ ] Quick action buttons (Upload Video, Upload Huella, Create Evaluation)

**User interactions:**
- [ ] Changing case selector updates all dashboard metrics
- [ ] Clicking quick actions opens corresponding modals or forms
- [ ] Hover effects show on actionable cards

### VideoAnalysis

**Renders correctly:**
- [ ] Video player displays with full controls
- [ ] Timeline shows duration and current position
- [ ] Speed control buttons (0.25x, 0.5x, 1x, 2x) visible
- [ ] Angle detection overlays appear when analysis is complete

**User interactions:**
- [ ] Clicking play/pause toggles video state
- [ ] Dragging timeline seeks to specific timestamp
- [ ] Clicking speed buttons changes playback rate smoothly
- [ ] Toggling slow-motion maintains audio (if present)
- [ ] Hovering video shows frame analysis tools

### PosturogramaView

**Renders correctly:**
- [ ] 4 views display in grid (anterior, posterior, lateral izq, lateral der)
- [ ] Anatomical points overlay on each view
- [ ] Deviations list updates as points are dragged
- [ ] Auto-detection highlights when system identifies deviations

**User interactions:**
- [ ] Clicking on a point selects it for dragging
- [ ] Dragging point updates its coordinates
- [ ] Releasing point locks it in place
- [ ] Clicking "Auto-detect" runs detection algorithm
- [ ] Clicking "Reset" returns points to original positions

### HuellaAnalysis

**Renders correctly:**
- [ ] Footprint image displays clearly
- [ ] Heatmap overlay uses gradient colors
- [ ] Arch classification label shows (Plano/Cavo/Normal)
- [ ] Symmetry comparison panel shows left vs. right

**User interactions:**
- [ ] Hovering over footprint shows pressure values at cursor
- [ ] Clicking "Comparar Lado Izquierdo/Derecho" toggles comparison view
- [ ] Zoom controls allow magnifying specific areas

---

## Edge Cases

- [ ] **Very long videos:** Timeline scales correctly, maintains performance
- [ ] **Low-resolution images:** UI handles without blurring or stretching
- [ ] **No deviations detected:** System handles "normal" posturogram gracefully
- [ ] **100+ sessions:** Charts handle large datasets without performance issues
- [ ] **Missing comparison data:** UI shows single-point graph, not broken
- [ ] **Slow motion on audio:** Maintains sync, doesn't desync
- [ ] **Concurrent analyses:** Multiple users can analyze different cases without conflicts
- [ ] **Image/video upload limits:** Shows error when exceeding file size limits
- [ ] **Partial posturogram:** System can save with warnings for missing views
- [ ] **Angle detection failure:** Falls back gracefully to manual measurement tools

---

## Accessibility Checks

- [ ] All video controls (play, pause, speed) are keyboard accessible
- [ ] Drag-and-drop file upload has focus indicators for screen readers
- [ ] Posturogram views have alt text or labels
- [ ] Charts include textual summaries for screen readers
- [ ] Heatmap color differences have sufficient contrast with legend
- [ ] Comparison mode toggle is clearly labeled with current state
- [ ] Error messages are announced to screen readers immediately

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

```typescript
// Example test data - posturogram with deviations
const mockPosturograma: Posturograma = {
  vistaAnterior: {
    cabeza: "Lateralización derecha",
    hombros: "Derecho ascendido",
    trianguloDeTales: "Aumentado a la derecha",
    espinaIliaca: "Anterosuperior izquierda ascendida"
  },
  vistaSagitalLateral: {
    cabeza: "Anteriorizada",
    hombros: "Antepulsión (hacia adelante)",
    columnaCervical: "Hiperlordosis",
    columnaDorsal: "Hipercifosis",
    columnaLumbar: "Rectificada",
    rodillas: "Genuflexa (ligeramente flexionada)"
  },
  marcha: "Realizada con ayuda mecánica (bastón)"
}

// Example test data - pain progression
const mockPainLevels: PainLevel[] = [
  { sesion: 1, nivel: 9, fecha: "2024-05-15" },
  { sesion: 2, nivel: 8, fecha: "2024-05-20" },
  { sesion: 3, nivel: 7, fecha: "2024-06-05" },
  { sesion: 4, nivel: 6, fecha: "2024-06-20" },
  { sesion: 5, nivel: 5, fecha: "2024-07-10" },
  { sesion: 15, nivel: 4, fecha: "2024-10-15" }
]

// Example test data - functional test comparison
const mockFunctionalTests = {
  inicial: {
    schober: { resultado: "Flexión +3 cm", interpretacion: "Lumbalgia mecánica severa" },
    dedoSuelo: { resultado: "25 cm", interpretacion: "Limitación severa" }
  },
  final: {
    schober: { resultado: "Flexión +4 cm", interpretacion: "Mejora significativa" },
    dedoSuelo: { resultado: "15 cm", interpretacion: "Funcionalidad recuperada" }
  }
}

// Example test data - empty states
const mockNoEvaluations: Evaluacion | null = null
```

---

## Notes for Test Implementation

- Mock video processing APIs to test upload and analysis scenarios
- Test slow-motion functionality at various speeds
- Verify posturogram point coordinates update correctly on drag
- Test that comparison mode properly syncs two video timelines
- Ensure chart rendering handles large datasets efficiently
- Test heatmap color gradients are distinguishable (red/yellow/green/blue)
- Mock angle detection algorithms with simulated results
- Test file upload validation for formats and size limits
- **Always test empty states** — No case selected, no evaluation data, no follow-up sessions
- Test transitions: first evaluation created → progress tracking → final comparison
- Verify error handling for corrupted videos or invalid images
- Test that auto-detection doesn't overwrite user-marked points without confirmation

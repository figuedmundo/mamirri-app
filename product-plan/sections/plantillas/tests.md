# Test Instructions: Plantillas

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Plantillas is a full-screen CAD-like workspace for designing custom orthopedic insoles with 3D modeling, AI automation, and biomechanical validation. It combines structural editing (sliders) with precise relief painting (brush) and integrates with patient diagnosis data.

---

## User Flow Tests

### Flow 1: Data Import and Auto-Generation

**Scenario:** User starts new insole design and system imports patient diagnosis

#### Success Path

**Setup:**
- Clinical case has completed evaluation
- Case has posturogram findings and functional test results

**Steps:**
1. User navigates to `/plantillas` and selects clinical case
2. User clicks "Crear Nueva Plantilla" button
3. System automatically imports diagnosis data
4. Base insole model generates with suggested corrections
5. User sees "Pie Talo" and "Pelvic Retroversion" markers on model

**Expected Results:**
- [ ] Case selector is visible and functional
- [ ] Base model displays in 3D viewer
- [ ] Suggested corrections apply based on diagnosis (e.g., arch height adjustment)
- [ ] Clinical side panel shows imported diagnosis summary
- [ ] Posturogram findings display with deviations highlighted
- [ ] Model orientation shows correct foot alignment
- [ ] Success message: "Base generada desde diagnóstico"

#### Failure Path: No Evaluation Data

**Setup:**
- Selected case has no evaluation data

**Steps:**
1. User selects clinical case
2. User clicks "Crear Nueva Plantilla"
3. System attempts to import data

**Expected Results:**
- [ ] Warning message: "No hay datos de evaluación disponibles"
- [ ] Base model generates with neutral/default parameters
- [ ] Clinical side panel shows "Sin diagnóstico"
- [ ] User can still proceed with manual adjustments
- [ ] Message suggests completing evaluation first

---

### Flow 2: Hybrid Structural Editing

**Scenario:** User adjusts insole structure using precision sliders

#### Success Path

**Setup:**
- Insole model is loaded
- Slider tool mode is active

**Steps:**
1. User sees Properties Panel with sliders
2. User adjusts "Arch Height" slider (0-20mm)
3. Model updates in real-time as slider moves
4. User adjusts "Heel Wedge" slider (0-10mm)
5. User adjusts "Lateral Wedge" for valgo/varo correction
6. User observes 3D model changes

**Expected Results:**
- [ ] Sliders display with current value and min/max range
- [ ] 3D model updates smoothly during slider drag
- [ ] Values show in appropriate units (mm, degrees)
- [ ] Model cross-section view shows arch/wedge changes
- [ ] No lag or performance degradation during slider movement
- [ ] Changes can be undone (Ctrl+Z or explicit undo button)

#### Failure Path: Invalid Slider Value

**Setup:**
- User enters value outside allowed range via direct input

**Steps:**
1. User types "25" in Arch Height field (max is 20)
2. User presses Enter or moves to next field

**Expected Results:**
- [ ] Validation error: "El valor debe estar entre 0 y 20 mm"
- [ ] Value reverts to last valid value
- [ ] Field shows error state (red border)
- [ ] Model maintains previous valid configuration

---

### Flow 3: Relief Zone Painting

**Scenario:** User paints soft relief zones on insole model

#### Success Path

**Setup:**
- Brush tool mode is active
- User has identified pain points during patient evaluation

**Steps:**
1. User toggles to "Brush" mode
2. User selects brush size from options (Small, Medium, Large)
3. User selects relief level (Soft, Medium, Firm)
4. User paints on 3D model where patient reports pain
5. User paints multiple relief zones (metatarsal, heel area)
6. User observes painted areas appear in different color/texture

**Expected Results:**
- [ ] Brush cursor displays size indicator on hover
- [ ] Painting on model creates relief zone with selected properties
- [ ] Relief zone shows distinct visual (different color/texture)
- [ ] Multiple zones can be painted
- [ ] Zones can be removed (undo or delete)
- [ ] Clinical side panel shows "Zonas de alivio" list
- [ ] Relief intensity matches selection (Soft/Medium/Firm)
- [ ] 3D model updates smoothly during painting

#### Failure Path: Model Locked

**Setup:**
- Model is in locked/readonly mode

**Steps:**
1. User attempts to paint relief zone
2. User clicks on model

**Expected Results:**
- [ ] Cursor shows "locked" icon or indication
- [ ] Cannot paint on locked model
- [ ] Message: "El modelo está bloqueado. Desbloquea para editar."
- [ ] Unlock button or toggle is visible and functional

---

### Flow 4: Biomechanical Validation

**Scenario:** User validates that insole design addresses global biomechanical chain

#### Success Path

**Setup:**
- Insole design is complete
- Patient diagnosis data is loaded

**Steps:**
1. User views Clinical Side Panel
2. User compares insole design vs. posturogram findings
3. User checks if arch height corrects rectified lumbar spine
4. User adjusts if needed
5. User views side-by-side: foot position → lumbar alignment
6. User confirms design is biomechanically sound

**Expected Results:**
- [ ] Side panel displays diagnosis and insole side-by-side
- [ ] Posturogram images show (anterior, posterior, lateral)
- [ ] Insole 3D model aligns with foot position reference
- [ ] Chain alignment indicator shows (green/red) if corrections are coherent
- [ ] Connection lines highlight affected chain segments (foot → knee → pelvis → spine)
- [ ] User can toggle between different view angles for validation
- [ ] "Validar" button performs biomechanical check
- [ ] Validation results show warnings if chain is misaligned

#### Failure Path: Validation Fails

**Setup:**
- Insole corrections conflict with diagnosis

**Steps:**
1. User clicks "Validar" button
2. System checks biomechanical coherence
3. Conflict detected (e.g., arch height too high for pelvic retroversion)

**Expected Results:**
- [ ] Warning message: "Conflicto biomecánico detectado"
- [ ] Specific warning: "Altura de arco excesiva puede agravar lordosis"
- [ ] Affected areas highlight in red on model
- [ ] Suggestion displays: "Reducir arco a X mm para mejorar alineación"
- [ ] User can still save design with warning
- [ ] Warning persists until corrected

---

### Flow 5: Material Selection and Export

**Scenario:** User selects EVA materials and generates technical PDF

#### Success Path

**Setup:**
- Insole design is finalized
- Layer manager shows all layers

**Steps:**
1. User opens Layer Manager
2. User sees 3 layers: Base, Middle, Top Cover
3. User selects "EVA Rígido" for Base layer
4. User selects "EVA Medio" for Middle layer
5. User selects "EVA Suave" for Top Cover
6. User clicks "Generar PDF Técnico"
7. System generates PDF with dimensions, materials, specifications
8. Download starts

**Expected Results:**
- [ ] Layer manager displays all 3 layers in stack order
- [ ] Each layer has material dropdown with EVA options
- [ ] Layer visibility toggles work (show/hide each layer)
- [ ] Material dropdowns show: Rígido, Medio, Suave, Otro
- [ ] "Generar PDF" button is enabled
- [ ] PDF generation shows progress indicator
- [ ] Downloaded PDF contains: dimensions, material specs, layer diagram
- [ ] Success toast: "PDF técnico generado exitosamente"
- [ ] Filename includes patient ID and date

#### Failure Path: Incomplete Design

**Setup:**
- Insole design is missing required data (e.g., no base layer)

**Steps:**
1. User clicks "Generar PDF Técnico"
2. System attempts to generate PDF

**Expected Results:**
- [ ] Error message: "Diseño incompleto. Debes definir todos los materiales."
- [ ] Missing layers are highlighted
- [ ] PDF generation is prevented
- [ ] User is guided to complete missing data

---

## Empty State Tests

### No Clinical Case Selected

**Scenario:** User navigates to plantillas without selecting case

**Setup:**
- No clinical case is selected

**Expected Results:**
- [ ] Empty workspace message: "Selecciona un caso clínico para diseñar plantillas"
- [ ] Case selector dropdown is visible
- [ ] 3D viewer shows blank/placeholder state
- [ ] "Crear Nueva Plantilla" button is disabled until case selected
- [ ] Help text: "Elige un caso para importar diagnóstico y generar base"
- [ ] No tools or panels are enabled

### No Layers Defined

**Scenario:** Insole model has no material layers

**Setup:**
- Base model exists but layers array is empty

**Expected Results:**
- [ ] Layer manager shows "Sin capas definidas"
- [ ] Message: "Añade capas de material (Base, Media, Cubierta)"
- [ ] "Añadir Capa" button is visible
- [ ] Material dropdowns are not accessible until layers exist
- [ ] PDF export is disabled
- [ ] 3D model still displays but may show warning

---

## Component Interaction Tests

### PlantillasEditor

**Renders correctly:**
- [ ] Full-screen layout (no shell navigation)
- [ ] 3D viewer displays in center with toolbars
- [ ] Clinical side panel shows on right
- [ ] Toolbar shows at top or left (depending on design)
- [ ] Layer manager shows in panel or overlay

**User interactions:**
- [ ] Clicking tool buttons toggles modes (Slider/Brush)
- [ ] Clicking "Cerrar" returns to main app navigation
- [ ] Keyboard shortcuts work (Escape to close, Ctrl+Z to undo)
- [ ] Workspace is responsive on different screen sizes

### InsoleViewer3D

**Renders correctly:**
- [ ] 3D model displays with proper lighting and materials
- [ ] Rotate control allows 360° viewing
- [ ] Zoom control allows magnifying specific areas
- [ ] Pan control allows moving around model
- [ ] Reset view button returns to default camera position

**User interactions:**
- [ ] Dragging rotates model smoothly
- [ ] Scroll wheel zooms in/out
- [ ] Middle-click (or pan tool) moves model
- [ ] Double-click resets to front view
- [ ] Performance remains smooth with complex models

### PropertiesPanel

**Renders correctly:**
- [ ] Structural sliders display with labels and units
- [ ] Current values show next to sliders
- [ ] Min/max values are visible
- [ ] "Reset to Default" button available

**User interactions:**
- [ ] Dragging slider updates model in real-time
- [ ] Clicking input fields allows manual value entry
- [ ] Reset button returns values to initial/diagnostic suggestions
- [ ] Validation shows for out-of-range values

### ClinicalSidePanel

**Renders correctly:**
- [ ] Diagnosis section shows patient info and case title
- [ ] Posturogram findings display (deviations, marks)
- [ ] Functional test results show (Schober, etc.)
- [ ] "Zonas de alivio" list shows painted relief zones
- [ ] Comparison section aligns insole with diagnosis

**User interactions:**
- [ ] Section tabs can be toggled (Diagnosis / Posturogram / Tests)
- [ ] Clicking posturogram view enlarges image
- [ ] Comparison toggle switches between views
- [ ] Relief zones list shows details on hover/click

### LayerManager

**Renders correctly:**
- [ ] Layers display in stack order (bottom to top)
- [ ] Each layer shows name and material selection
- [ ] Visibility toggles (eye icon) work
- [ ] Layer reordering works (drag up/down or arrows)

**User interactions:**
- [ ] Clicking "Añadir Capa" creates new layer
- [ ] Clicking material dropdown opens EVA options
- [ ] Selecting material updates layer immediately
- [ ] Clicking delete removes layer (with confirmation)
- [ ] Dragging layers changes stack order

---

## Edge Cases

- [ ] **Very complex 3D model:** Viewer handles high polygon count without lag
- [ ] **100+ relief zones:** Performance remains acceptable
- [ ] **Undo/Redo history:** Can undo multiple steps without memory issues
- [ ] **Material incompatibility:** System warns if materials don't stack properly
- [ ] **Corrupted model file:** Error message shows, workspace doesn't crash
- [ ] **Concurrent editing:** Two users can't edit same plantilla simultaneously
- [ ] **Missing diagnosis images:** UI handles missing posturogram photos gracefully
- [ ] **Invalid dimensions:** Sliders reject extreme values that would break physics
- [ ] **PDF generation timeout:** System shows progress, doesn't hang indefinitely
- [ ] **Export to cloud vs. local:** Both download options work
- [ ] **Custom material name:** Allows user-defined names beyond standard EVA types

---

## Accessibility Checks

- [ ] All tool buttons have keyboard shortcuts (indicated in tooltip)
- [ ] Slider inputs are keyboard accessible (up/down arrows, Page Up/Down)
- [ ] 3D viewer can be navigated with keyboard (arrows for rotate, +/- for zoom)
- [ ] Layer manager can be reordered with keyboard (Tab + arrows)
- [ ] Material dropdowns are fully keyboard navigable
- [ ] Error and warning messages are announced to screen readers
- [ ] Color changes in relief painting have sufficient contrast
- [ ] Focus moves logically when closing editor (returns to case selector)
- [ ] Progress indicators (PDF generation) are announced to screen readers

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

```typescript
// Example test data - imported diagnosis
const mockDiagnosis: Diagnosis = {
  posturograma: {
    vistaSagitalLateral: {
      columnaLumbar: "Rectificada",
      pelvis: "Retroversión"
    }
  },
  testOrtopedicos: {
    thomas: { resultado: "Positivo", interpretacion: "Acortamiento flexores" },
    schober: { resultado: "+3 cm", interpretacion: "Lumbalgia mecánica" }
  }
}

// Example test data - insole design
const mockPlantilla: Plantilla = {
  id: "plant-001",
  casoClinicoId: "caso-006",
  diseño: {
    alturaArco: 12, // mm
    inclinacionTalon: 5, // mm
    zonasAlivio: [
      { ubicacion: { x: 10, y: 20 }, radio: 5, nivel: 3 } // nivel: 1=soft, 5=firm
    ]
  },
  materiales: [
    { capa: "base", tipo: "EVA_rigido", espesor: 3 },
    { capa: "media", tipo: "EVA_medio", espesor: 2 },
    { capa: "cubierta", tipo: "EVA_suave", espesor: 1.5 }
  ]
}

// Example test data - empty states
const mockNoCase: { selected: null }

const mockNoLayers: Plantilla = {
  id: "plant-002",
  casoClinicoId: "caso-001",
  materiales: []
}

// Example test data - validation conflict
const mockValidationWarning: ValidationWarning = {
  tipo: "biomecanical",
  mensaje: "Altura de arco excesiva puede agravar lordosis",
  severidad: "alta",
  sugerencia: "Reducir arco de 12mm a 8mm para mejorar alineación lumbar"
}
```

---

## Notes for Test Implementation

- Mock 3D rendering engine to test model loading, rotation, zoom, and pan
- Test slider performance with rapid movement (drag quickly back and forth)
- Mock brush tool with simulated painting coordinates
- Test layer manager with complex reorder scenarios
- Verify PDF generation creates proper file with correct content
- Test that biomechanical validation checks coherence of design
- Mock material compatibility checks (e.g., warning if mixing incompatible materials)
- Test undo/redo history with at least 10-20 steps
- Ensure 3D viewer handles missing or corrupted models gracefully
- Verify keyboard navigation works for all interactive elements
- Test that workspace state persists correctly when switching views
- **Always test empty states** — No case selected, no layers, no diagnosis data
- Test transitions: empty → case selected → editing → saving → export
- Verify that tool mode switching (Slider ↔ Brush) preserves unsaved changes
- Test that full-screen editor blocks main app navigation (as designed)
- Ensure "Cerrar" button properly returns to previous state/navigation

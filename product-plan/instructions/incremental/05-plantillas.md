# Milestone 5: Plantillas

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Pacientes) complete

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
    altura?: number;
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
6. **Outcome:** 3D model shows structural changes immediately, values update

### Flow 3: Paint Relief Zones with Brush

1. User toggles to "Brush" mode
2. User selects brush size (Small, Medium, Large)
3. User selects relief level (Soft, Medium, Firm)
4. User paints on 3D model where patient reports pain
5. User paints multiple relief zones
6. **Outcome:** Relief zones appear in different color/texture, Clinical Side Panel shows zones list

### Flow 4: Biomechanical Validation

1. User views Clinical Side Panel
2. User compares insole design vs. posturogram findings
3. User checks if arch height corrects rectified lumbar spine
4. User adjusts if needed
5. User views side-by-side: foot position → lumbar alignment
6. User clicks "Validar" button
7. **Outcome:** Validation results show warnings if chain is misaligned, or confirmation if coherent

### Flow 5: Select Materials and Export PDF

1. User opens Layer Manager
2. User selects materials for Base, Middle, and Top Cover layers
3. User selects EVA densities (Rígido, Medio, Suave)
4. User clicks "Generar PDF Técnico"
5. System generates PDF with dimensions, materials, specifications
6. Download starts
7. **Outcome:** PDF downloaded with complete technical spec for manufacturing

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

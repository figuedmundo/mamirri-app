# Plantillas

## Overview

A "Smart Biomechanical Tailor" that combines AI automation with precise manual control to design custom orthopedic insoles. It integrates directly with patient evaluation data (Posturograma, Functional Tests) to suggest evidenced-based corrections, while providing a 3D CAD-like environment for specialist to fine-tune design and ensure holistic biomechanical alignment.

## User Flows

- **Data Import:** User starts a design for a specific Patient/Case -> System automatically imports findings (e.g., "Pie Talo", "Pelvic Retroversion") and generates a base insole model.

- **Hybrid Editing:**
    - **Structural:** User adjusts global parameters (Arch Height, Heel Wedge) via precision sliders.
    - **Relief:** User utilizes a "Brush" tool to paint relief zones (soft spots) on 3D model corresponding to pain points found during palpation.

- **Biomechanical Validation:** User views 3D model alongside of patient's kinetic diagnosis (side-by-side) to ensure that insole addresses global chain (e.g., correcting foot position to aid lumbar rectification).

- **Export/Handoff:** User finalizes material selection (EVA densities) -> System generates a technical PDF spec sheet for manufacturing.

## Design Decisions

- Full-screen CAD-like workspace (no main app navigation)
- 3D model viewer with rotate, zoom, pan controls
- Split layout: Clinical side panel (diagnosis) + 3D editor (model)
- Toolbar with tool modes: Slider (structure) vs. Brush (relief)
- Layer manager for material composition (base, middle, top cover)
- Material selector dropdown/grid for EVA density selection

## Data Used

**Entities:** Plantilla, CasoClinico, Evaluacion

**From global model:** Plantilla, CasoClinico, Paciente

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- **PlantillasEditor** — Full-screen CAD workspace with 3D viewer
- **InsoleViewer3D** — Interactive 3D model with rotate/zoom/pan
- **Toolbar** — Tool switching (Slider/Brush modes) and action buttons
- **PropertiesPanel** — Sliders for structural adjustments (arch height, heel wedge)
- **ClinicalSidePanel** — Persistent right panel displaying diagnosis and posturogram findings
- **LayerManager** — Controls for material layers (Base, Middle, Top cover)

## Callback Props

| Callback | Description |
|----------|-------------|
| `onSave` | Called when user saves the insole design |
| `onExportPDF` | Called when user wants to generate technical spec sheet |
| `onChangeProperties` | Called when user adjusts structural parameters via sliders |
| `onPaintRelief` | Called when user paints relief zone with brush tool |
| `onToggleTool` | Called when user switches between Slider and Brush modes |
| `onSelectMaterial` | Called when user selects material for a layer |
| `onClose` | Called when user wants to exit full-screen editor |
| `onAddLayer` | Called when user adds new material layer |
| `onRemoveLayer` | Called when user removes a layer |
| `onReorderLayers` | Called when user changes layer stacking order |


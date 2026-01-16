# Specification: PosturogramViewer

## Goal

Enhance the existing PosturogramViewer component to provide an interactive clinical interface that combines before/after comparison with anatomical marker placement for anterior posturograms, enabling therapists to track postural deviations and verify treatment effectiveness.

## User Stories

- As a physiotherapist, I want to compare initial and current posturograms side-by-side with a draggable slider so that I can visually verify treatment progress with patients.
- As a physiotherapist, I want to click on anatomical points (head, shoulders, spine, pelvis, knees, feet) to mark postural deviations with severity levels so that I can document clinical findings efficiently.
- As a physiotherapist, I want changes to be auto-saved to the backend without manual intervention so that I can maintain focus on patient care during tablet sessions.

## Specific Requirements

**Merged Comparison and Marker Interface**

- Combine the existing BeforeAfterSlider functionality from PosturogramViewer.tsx with interactive anatomical marker placement, allowing simultaneous viewing of before/after comparison and deviation marking
- Display anterior posturogram view with 6 clickable anatomical points positioned on SVG overlay: head, shoulders, spine, pelvis, knees, feet
- Render marker colors based on severity: emerald-500 (normal), amber-500 (mild), rose-500 (severe) for quick visual scanning
- Show interactive labels with deviation type and severity on marker hover/click using accessible tooltip/popover pattern

**Anatomical Marker Interaction**

- Use Shadcn Popover component for deviation selection, replacing custom floating dropdown to improve accessibility and touch support
- Provide deviation type selection dropdown with relevant clinical options: normal, scoliosis, lordosis, kyphosis, rotation, lateralization
- Provide severity level selection: normal, mild (leve), severe (severo)
- Calculate marker coordinates relative to SVG container using getBoundingClientRect() for accurate positioning across device sizes
- Set active point state on click to trigger popover overlay at correct screen position

**Data Structure Alignment**

- Implement nested PosturalView structure for anterior view: { head, shoulders, spine, pelvis, knees, feet } each containing { deviation, severity }
- Maintain backward compatibility with EvaluationForm by initializing nested structure from flat legacy keys during migration
- Update Posturogram state using onChange handler that merges new point status into existing posturogram object
- Pass updated posturogram data to parent component via onPosturogramChange callback

**Auto-Save Integration**

- Wire marker changes to trigger debounced auto-save with 300ms delay using useDebounce hook pattern from EvaluationForm
- Call patientsApi.updateEvaluation endpoint with posturogram JSON payload on each debounced save
- Display success toast notification on successful save: "Posturograma guardado"
- Display error toast on save failure: "No se pudo guardar el posturograma. Intenta de nuevo."

**Slider Integration and Placeholder Images**

- Reuse existing BeforeAfterSlider component with draggable handle supporting mouse and touch events
- Display placeholder images for initial and current posturograms (no image capture workflow in Week 6)
- Ensure slider handle is at least 48px in size for iPad touch targets
- Provide empty state when no posturogram images are available with clear message: "No hay posturogramas disponibles"

**Accessibility Standards**

- Ensure all interactive elements have minimum 48px touch targets for iPad users
- Provide keyboard navigation for marker selection and deviation/severity dropdowns
- Use Shadcn Popover with ARIA attributes for screen reader compatibility
- Include aria-labels on all anatomical markers describing point name and current status
- Use color and text labels together for colorblind users (deviation name + severity text in tooltip)

## Visual Design

No visual assets provided. Follow existing component patterns and Shadcn/UI styling conventions.

## Existing Code to Leverage

**BodySilhouette component** — `apps/client/src/components/patients/BodySilhouette.tsx`

- Interactive SVG with 6 anatomical points and coordinate mapping logic
- Reuse marker placement pattern, getBoundingClientRect() positioning, and point status state management

**PosturogramViewer component** — `apps/client/src/components/patients/PosturogramViewer.tsx`

- Before/after slider with 76 lines of tested drag handling and image clipping
- Reuse slider logic, draggable handle with Split icon, and responsive layout

**BeforeAfterSlider component** — `apps/client/src/components/ui/BeforeAfterSlider.tsx`

- Reusable UI primitive for image comparison with touch/mouse event handling
- Use as base for slider functionality if extraction is needed for cleaner architecture

**EvaluationForm component** — `apps/client/src/components/patients/EvaluationForm.tsx`

- Debounced auto-save pattern using useDebounce hook with 300ms delay
- Reuse patientsApi.updateIntegration and toast notification pattern for data persistence

**Type definitions** — `apps/client/src/types/patient.ts`

- Posturogram, PosturalView, and DeviationStatus interfaces
- Use nested structure for type-safe marker data management across views

**UI Components** — `apps/client/src/components/ui/`

- Popover for accessible deviation selection with collision detection
- Select for deviation/severity dropdowns with keyboard navigation
- Tooltip for displaying interactive marker labels
- Badge for displaying severity levels with consistent styling

## Out of Scope

- 4-view posturogram capture (posterior and lateral views) - scheduled for Week 20
- Image upload/capture workflow for posturograms - scheduled for Week 20
- AI-powered deviation detection - scheduled for Week 20
- PosturogramImage database table creation - scheduled for Week 20
- Posterior and lateral view SVG paths and marker configurations
- Video analysis integration - scheduled for Week 21

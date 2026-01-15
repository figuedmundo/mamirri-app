# Spec Initialization: ComparacionBoard Enhancement

## Feature Description

**From Roadmap Task 6.3:** "ComparacionBoard — Before/After visual comparison slider"

**Initial Idea:**

Enhance the existing `ComparisonBoard` component to add a draggable slider-based before/after comparison mode for visual media (footprints, posturograms, posture videos). The current implementation shows side-by-side static comparison cards; the enhancement should allow therapists to interactively compare initial vs final evaluations by dragging a slider handle to reveal one image over the other.

## Current State

**Existing Components Found:**

- `apps/client/src/components/patients/ComparisonBoard.tsx` (348 lines) - Side-by-side comparison with tabs for footprints, posture, and clinical tests
- `apps/client/src/components/patients/PosturogramViewer.tsx` (76 lines) - Already implements a draggable before/after slider for posturogram images
- `apps/client/src/components/patients/MediaGallery.tsx` (92 lines) - Media thumbnail viewer

**Current ComparisonBoard Behavior:**

- Shows 3 tabs: "Huellas Plantares", "Análisis Postural", "Datos Clínicos"
- Displays before/after in separate card layouts (left: "ANTES", right: "DESPUÉS")
- No interactive slider functionality
- Footprints and videos are displayed in static side-by-side cards

## User Stories

- As a physiotherapist, I want to drag a slider to compare initial vs final footprints so that I can clearly see subtle improvements in arch height or pressure distribution
- As a physiotherapist, I want to use a slider to compare posture before and after treatment so that I can demonstrate progress visually to patients during consultations
- As a physiotherapist, I want to toggle between slider mode and side-by-side view so that I can choose the comparison style that works best for different types of clinical images

# Specification: ComparacionBoard Enhancement

## Goal

Enhance ComparisonBoard component with interactive before/after slider mode for visual comparison of footprints and posture images, alongside existing side-by-side view.

## User Stories

- As a physiotherapist, I want to drag a slider to compare initial vs final footprints so that I can clearly see subtle improvements in arch height or pressure distribution
- As a physiotherapist, I want to use a slider to compare posture before and after treatment so that I can demonstrate progress visually to patients during consultations
- As a physiotherapist, I want to toggle between slider and side-by-side views so that I can choose the comparison style that works best for different clinical scenarios

## Specific Requirements

**Before/After Slider Component**

- Extract reusable slider component from PosturogramViewer with mouse and touch drag handling
- Implement CSS clipping with overflow-hidden and width-based positioning
- Support default slider position at 50% with state management for position tracking
- Accept any image type via props with configurable labels
- Export component from ui components folder for reuse across application

**View Mode Toggle**

- Add toggle button in action bar between Export and Share buttons
- Use Split icon from lucide-React rotated 90 degrees to indicate comparison control
- Preserve current mode state in component (slider vs side-by-side)
- Apply consistent button styling with existing action bar buttons

**Slider for Footprint Images**

- Enable interactive before/after slider for footprint images in Huellas Plantares tab
- Display date labels on both initial and final images
- Reveal initial image on left side (0-50%), final image on right side (50-100%)
- Show No disponible state if footprint data is missing

**Slider for Posture Photos**

- Apply slider to static posture photos in Análisis Postural tab
- Keep videos in side-by-side view regardless of current mode toggle
- Render slider only for image media type, not video media type
- Maintain existing posture video playback controls and duration display

**Enhanced Slider Handle**

- Design circular drag handle with 48px diameter for iPad touch targets
- Add Split icon from lucide-React rotated 90 degrees inside handle
- Apply drop shadow (shadow-xl) for visibility on light and dark images
- Implement hover scale effect to 110% with transition
- Add border-2 border-white/90 for contrast on any background
- Use semi-transparent background (bg-white/95) with backdrop blur

**Extreme Position Animation**

- Trigger subtle pulse animation when slider reaches 0-5% or 95-100%
- Apply Tailwind animate-pulse class with 2-second cycle
- No animation during normal range (5-95%)
- Provide visual feedback that user has reached limit of slider movement

**Maintain Existing Tabs**

- Preserve three-tab navigation system (Huellas Plantares, Análisis Postural, Datos Clínicos)
- Keep tab switching logic and active state styling unchanged
- Maintain tab-specific content rendering patterns
- Ensure Datos Clínicos table view remains identical

**Preserve Export and Share**

- Keep onExport callback generating full comparison report
- Maintain onShare callback for sharing with patients
- Ensure both buttons work identically in slider and side-by-side modes
- Do not implement canvas-to-image screenshot capture

**Video Comparison**

- Keep videos in side-by-side cards regardless of view mode toggle
- Avoid implementing synchronized video playback or frame-by-frame comparison
- Maintain existing video player controls, scrubbing, and duration display
- Preserve video hover states and play button overlay

**Type Safety**

- Define BeforeAfterSliderProps interface with optional label props
- Use TypeScript for all component props and state
- Extend PosturogramProps pattern for type consistency
- Ensure ClinicalCase, Footprint, PostureVideo types are used correctly

## Visual Design

No visual mockups provided. Follow existing patterns from PosturogramViewer and ComparisonBoard.

## Existing Code to Leverage

**PosturogramViewer component (apps/client/src/components/patients/PosturogramViewer.tsx)**

- Extract working slider implementation with mouse and touch event handlers
- Reuse CSS clipping logic with width-based positioning on foreground image
- Leverage handle drag calculation: ((clientX - rect.left) / rect.width) \* 100
- Follow circular handle design with Split icon from lucide-React
- Apply same absolute positioning and z-index layering for handle

**ComparisonBoard component (apps/client/src/components/patients/ComparisonBoard.tsx)**

- Maintain existing three-tab navigation system with active state styling
- Reuse card container styling with border and rounded corners
- Follow action bar layout with Export and Share buttons
- Preserve date display format: new Date(item.date).toLocaleDateString()
- Keep clinical metrics table structure unchanged in Datos Clínicos tab

**MediaGallery component (apps/client/src/components/patients/MediaGallery.tsx)**

- Follow image rendering pattern with object-cover and lazy loading
- Apply hover states with border-teal-500 focus styling
- Use MediaItem interface structure for type consistency
- Maintain empty state styling with dashed border and Camera icon

**Patient types (apps/client/src/types/patient.ts)**

- Use ComparisonProps interface for component props
- Leverage Footprint type with id, url, date, analysis fields
- Reference PostureVideo type for video data structure
- Maintain ClinicalCase type for data flow

**Lucide React icons**

- Continue using Split icon from lucide-React for slider handle
- Apply consistent size prop (16-20px) across icons
- Use rotate-90 class for horizontal comparison orientation
- Follow existing icon import patterns

## Out of Scope

- New backend endpoints or API modifications
- Database schema changes or Prisma migrations
- AI-powered automatic comparison or analysis
- New media capture functionality (camera, video recording)
- Changes to PosturogramViewer component (it already has slider)
- Image alignment or homography for automatic matching
- Multi-image comparison (comparing 3+ evaluations)
- 3D comparison or overlay visualization
- Video synchronization or frame-by-frame comparison
- Annotate or draw on images during comparison
- Undo/redo for slider position
- Save slider position to database
- Canvas-to-image screenshot capture for export

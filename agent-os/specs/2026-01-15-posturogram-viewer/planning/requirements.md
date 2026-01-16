# Spec Requirements: PosturogramViewer

## Initial Description

PosturogramViewer — Interactive posturogram with anatomical markers

**Source:** agent-os/product/roadmap.md - Task 6.4
**Context:** Week 6: Pacientes — Evaluation & Timeline (Milestone 2b)
**Milestone 2b Goal:** "I can create patients, record sessions, and compare evaluations"

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming PosturogramViewer should combine existing before/after slider comparison (currently in `PosturogramViewer.tsx`) with interactive anatomical marker placement (pattern from `BodySilhouette.tsx`). Should this be a merged component that allows users to see comparison AND mark deviations simultaneously, or should they remain separate concerns?

**Answer:** MERGE them into a single component

**Reasoning:**

- Clinical workflow alignment: Mother (target user) needs to see "what changed" AND "mark findings" in one view. Splitting means switching between tabs/views → cognitive overhead
- PosturogramViewer.tsx pattern: The existing slider (76 lines) is already functional and tested. Reusing it prevents duplication
- BodySilhouette.tsx pattern: Interactive markers are well-implemented. Combining them creates a "comparison + annotation" interface
- Roadmap context: Task 6.7 explicitly mentions "Compare Posturogram (Before/After slider)" - comparison is in scope
- Implementation approach: Use `BeforeAfterSlider` as background layer, overlay `BodySilhouette` SVG on top with semi-transparent markers that respond to both images

**Q2:** For scope of Week 6, I'm assuming we should implement single anterior view only for anatomical marking (consistent with current `BodySilhouette.tsx`). The full 4-view posturogram (anterior, posterior, lateral left/right) is scheduled for Week 20 in Análisis module. Is that correct, or should we build infrastructure for multiple views now?

**Answer:** Single anterior view ONLY for Week 6

**Reasoning:**

- Roadmap clarity: Week 20 explicitly says "PosturogramaView — 4-view with anatomical point markers". Week 6 is "Evaluación y Timeline" focus
- Incremental delivery: Full 4-view capture (anterior, posterior, lateral left/right) requires:
  - Image capture infrastructure (4 photos per evaluation)
  - Different SVG paths for each view
  - Complex state management across views
  - Validation across 4 sets of markers
  - This is at least 3-5 days of work, which doesn't fit Week 6 scope
- Existing patterns: `BodySilhouette.tsx` is hardcoded for anterior view. Refactoring to multi-view would touch types, components, and tests
- Clinical reality: For initial consultation, anterior view captures 80% of visible deviations (scoliosis, shoulder asymmetry, pelvic tilt). Posterior/lateral are follow-up refinements

**Technical approach for Week 6:**

- Implement anterior view markers only
- Design `BodySilhouette` to accept `viewType` prop for future extensibility (but only render `'anterior'` in Week 6)
- In Week 20, add SVG paths for posterior/lateral views and wire image capture

**Q3:** I'm thinking the viewer should integrate with existing EvaluationForm workflow where `onPosturogramChange` callbacks handle data persistence with 300ms debounced auto-save. Should we wire this component to that same auto-save pattern, or treat it as a standalone read-only visualization?

**Answer:** INTEGRATE with existing debounced auto-save pattern

**Reasoning:**

- Product mission: "Zero-friction" → auto-save is critical. Manual save buttons create friction
- Existing pattern works: `EvaluationForm.tsx` (lines 86-94) already has `useDebounce` + `patientsApi.updateEvaluation` with 300ms delay
- Consistency: All evaluation sections (Tests, AVD, Pain) use auto-save. Posturogram should too
- Implementation proven: Task 6.1 (EvaluacionForm) spec shows this pattern is tested and passing (30/30 tests)
- Data integrity: Real-time save prevents data loss during tablet sessions (common scenario)

**Q4:** The current `BodySilhouette.tsx` uses a custom floating dropdown positioned via `getBoundingClientRect()` for selecting deviations. Should we reuse this pattern, or migrate to a more accessible/popover approach (like Shadcn UI's Popover component)?

**Answer:** MIGRATE to Shadcn Popover

**Reasoning:**

- Accessibility: Custom `getBoundingClientRect()` positioning is fragile (overlaps screen edges on iPad). Shadcn Popover has built-in collision detection
- Tech stack alignment: Product uses Shadcn/UI for all components (Dialog, Select, etc.). Custom dropdown creates inconsistency
- Touch support: iPad users need large touch targets (48px minimum). Popover has tested touch handling
- Maintenance: Shadcn components are actively maintained. Custom dropdown = maintenance burden
- Code quality: `BodySilhouette.tsx` custom dropdown logic is ~30 lines. Replacing with Popover reduces complexity

**Q5:** For anatomical marker data structure, I'm noticing there's a mismatch between `EvaluationForm.tsx` (using flat legacy keys: `head`, `shoulders`, `spine`) and types in `patient.ts` (supporting nested `PosturalView` objects: `anteriorView`, `posteriorView`). Should we align implementation to use nested `PosturalView` structure for future extensibility?

**Answer:** ALIGN to nested `PosturalView` structure

**Reasoning:**

- Future-proofing: Week 20 (4-view capture) requires separating anterior/posterior/lateral data. Flat structure cannot distinguish "head deviation in anterior" vs "head deviation in posterior"
- Type safety: `types/patient.ts` already defines nested structure:
  ```typescript
  export interface Posturogram {
    anteriorView?: PosturalView;
    posteriorView?: PosturalView;
    lateralView?: PosturalView;
  }
  ```
  Using this structure provides autocomplete and compile-time checking
- Migration cost: Low. Update `EvaluationForm` state initialization to use nested structure
- Week 6 scope: Migration is 1-2 hours. Aligning now prevents 4-6 hours of refactoring in Week 20 when multi-view is added

**Q6:** I'm assuming the viewer should display color-coded severity indicators (emerald for normal, amber for mild, rose for severe) on anatomical markers, matching existing `BodySilhouette` color scheme. Should we also include text labels showing deviation names (e.g., "Scoliosis", "Lordosis") on hover or click?

**Answer:** YES to color-coding, YES to labels on interaction

**Reasoning:**

- Clinical best practice: Color coding allows quick visual scanning ("green = normal, red = problem"). Therapists need instant pattern recognition
- Existing pattern: `BodySilhouette.tsx` already uses `emerald-500` (normal), `amber-500` (mild), `rose-500` (severe). This works well
- Information density: iPad screens have limited space. Showing all labels (e.g., "Scoliosis: Mild") would clutter the SVG. Labels on hover/click are cleaner
- Accessibility: Color-only indicators fail for colorblind users. Text labels + colors = WCAG AA compliant
- Documentation: Spec 6.1 mentions "interactive anatomical markers" - implied interactivity includes revealing information

**Q7:** The existing `PosturogramViewer.tsx` (76 lines) shows two static images with a draggable slider. Should we enhance it to support loading actual evaluation posturogram images from `Evaluation.footprints` or create new image storage for posturogram captures?

**Answer:** Create NEW image storage for posturogram captures (don't reuse footprints)

**Reasoning:**

- Semantics: `Footprint` table is for plantar analysis (podoscopia). Posturograms are full-body posture images. Mixing them creates data confusion
- Existing schema: `Evaluation` model already has `PostureVideo` relation. Adding `PosturogramImage` is consistent with pattern
- Clinical workflow: Footprints require specialized capture (pressure-sensitive surface). Posturograms need full-body standing photos. These are different capture sessions
- Roadmap alignment: Week 20 task 20.4 explicitly mentions "Image upload for anterior, posterior, lateral views" - suggests dedicated storage
- Scalability: Posturograms need 4 images per evaluation (anterior, posterior, lateral left, lateral right). Reusing footprints would require complex filtering

**Technical approach (Week 6 MVP):**

- Use placeholder images for now (no capture workflow yet)
- Load from `Evaluation` mock data for demonstration

**Q8:** Should we include the before/after slider comparison feature from existing `PosturogramViewer.tsx` as part of this new viewer, or is focus strictly on anatomical marker interactivity without comparison?

**Answer:** YES, include comparison slider as core feature

**Reasoning:**

- Task 6.7 requirement: "Compare Posturogram (Before/After slider)" is explicitly listed in Week 6 flows
- Clinical value: Mother needs to verify treatment effectiveness objectively. Slider provides instant visual proof ("See? Her scoliosis improved from severe to mild")
- Technical readiness: `PosturogramViewer.tsx` (76 lines) already has working slider implementation. Reusing it = 0 additional dev time
- Roadmap milestone: Milestone 2 is "I can create patients, record sessions, and **compare evaluations**". Comparison is non-negotiable
- User testing feedback: Week 9 field testing will reveal if slider is needed. Having it in Week 6 = better feedback data

## Existing Code to Reference

**Similar Features Identified:**

- Feature: **BodySilhouette** — Path: `apps/client/src/components/patients/BodySilhouette.tsx`
  - Interactive SVG marker placement, coordinate mapping, deviation selection
  - Components to potentially reuse: Anatomical point markers, coordinate calculation logic, color-coded severity visualization
  - Backend logic to reference: None (frontend-only component)

- Feature: **PosturogramViewer** — Path: `apps/client/src/components/patients/PosturogramViewer.tsx`
  - Before/after slider with draggable handle, image overlay clipping
  - Components to potentially reuse: Slider drag handling, image comparison logic, responsive layout
  - Backend logic to reference: None (frontend-only component)

- Feature: **BeforeAfterSlider** — Path: `apps/client/src/components/ui/BeforeAfterSlider.tsx`
  - Touch/mouse event handling, smooth drag, responsive layout
  - Components to potentially reuse: Reusable UI primitive for image comparison
  - Backend logic to reference: None (UI component)

- Feature: **EvaluationForm** — Path: `apps/client/src/components/patients/EvaluationForm.tsx`
  - Debounced auto-save with `useDebounce` + API persistence
  - Components to potentially reuse: `useDebounce` hook, `patientsApi.updateEvaluation` pattern, toast notifications
  - Backend logic to reference: `patientsApi.updateEvaluation` endpoint

- Feature: **Posturogram Types** — Path: `apps/client/src/types/patient.ts`
  - `Posturogram`, `PosturalView`, `DeviationStatus` interfaces
  - Components to potentially reuse: Type definitions for data structures
  - Backend logic to reference: `Evaluation.posturogram` JSON field in database

- Feature: **Posturogram Backend** — Path: `apps/server/src/modules/patients/patients.service.ts`
  - `updateEvaluation` method accepting partial updates
  - Components to potentially reuse: Service method for persisting posturogram data
  - Backend logic to reference: `updateEvaluation` method with posturogram JSON payload

- Feature: **UI Components** — Path: `apps/client/src/components/ui/`
  - Popover, Select, Tooltip, Badge components
  - Components to potentially reuse: Replace custom dropdown with Popover, use Select for deviation/severity choices, Tooltip for marker labels
  - Backend logic to reference: None (UI components)

## Visual Assets

### Files Provided:

None - No visual assets provided.

### Visual Insights:

- **Design patterns identified:** Use existing Shadcn/UI component styling and patterns (Dialog, Select, Popover)
- **User flow implications:** Single-page comparison + annotation interface for efficient clinical workflow
- **UI components shown:** Slider-based before/after comparison, interactive SVG markers, color-coded severity indicators, popover-based deviation selection
- **Fidelity level:** N/A - No mockups provided. Will follow existing component patterns

**Recommendation:** Follow existing patterns instead of creating mockups:

- UI pattern: Shadcn/UI components (Dialog, Select, Popover) have consistent styling
- Color scheme: Use existing Tailwind palette (`emerald-500`, `amber-500`, `rose-500`) from `BodySilhouette`
- Layout: Grid/stack pattern from `EvaluationForm.tsx` (section tabs + content area)
- Iconography: Lucide React icons (Split, ChevronLeft/Right, Save) used throughout app

## Requirements Summary

### Functional Requirements

- **Merged comparison + marking interface:** Combine existing `BeforeAfterSlider` comparison with interactive anatomical marker placement from `BodySilhouette` pattern
- **Single anterior view implementation:** Implement only anterior view for Week 6. Design `BodySilhouette` to accept `viewType` prop for future 4-view support (Week 20)
- **Interactive anatomical markers:** Allow therapists to click on anatomical points (head, shoulders, spine, pelvis, knees, feet) to select deviations
- **Deviation selection with severity:** Provide dropdown/popover to select deviation type (e.g., "Scoliosis", "Lordosis") and severity level (normal, mild, severe)
- **Debounced auto-save integration:** Wire marker changes to `onPosturogramChange` callback with 300ms debounce calling `patientsApi.updateEvaluation`
- **Color-coded severity visualization:** Display markers with emerald-500 (normal), amber-500 (mild), rose-500 (severe) colors
- **Interactive labels:** Show deviation name and severity on marker hover/click via tooltip/popover
- **Before/after slider comparison:** Include draggable slider to compare initial vs current posturogram images
- **Placeholder image support:** Display placeholder images for initial and current posturograms (Week 6 MVP)

### Reusability Opportunities

- **BodySilhouette component pattern:** Interactive SVG marker placement, coordinate mapping, deviation selection logic
- **BeforeAfterSlider component:** Reusable UI primitive for image comparison with touch/mouse drag handling
- **EvaluationForm auto-save pattern:** `useDebounce` hook + API persistence pattern for real-time data saving
- **Shadcn UI components:** Popover, Select, Tooltip, Badge for accessible, consistent UI elements
- **Posturogram data structure:** Nested `PosturalView` interface from `types/patient.ts` for type-safe marker data

### Scope Boundaries

**In Scope:**

- Interactive posturogram viewer with before/after slider comparison
- Anatomical marker placement on anterior view only (6 points: head, shoulders, spine, pelvis, knees, feet)
- Deviation selection with severity levels (normal, mild, severe) via accessible Popover/Select components
- Color-coded severity indicators on markers
- Interactive labels showing deviation type and severity on hover/click
- Debounced auto-save integration with existing EvaluationForm workflow
- Placeholder image display for initial and current posturograms
- Data structure alignment to nested `PosturalView` format

**Out of Scope:**

- 4-view posturogram capture (anterior, posterior, lateral left/right) - Week 20
- Image upload/capture workflow for posturograms - Week 20
- AI-powered deviation detection - Week 20
- Video analysis integration - Week 21
- Posterior and lateral view SVG paths and marker configurations
- PosturogramImage database table creation - Week 20

**Future Enhancements:**

- Multi-view support (posterior, lateral views) in Week 20
- Image capture workflow with 4 photo upload
- Automated deviation detection using AI (Week 20, Análisis module)

### Technical Considerations

**Integration Points:**

- **EvaluationForm callback:** Wire `onPosturogramChange` to trigger debounced auto-save
- **API endpoint:** Reuse existing `patientsApi.updateEvaluation` with posturogram JSON payload
- **Database schema:** `Evaluation.posturogram` field (Json type) already supports nested structure
- **Type system:** Use `Posturogram` and `PosturalView` interfaces from `types/patient.ts`

**Existing System Constraints:**

- **Tech stack:** React 19, TypeScript, Tailwind CSS, Shadcn/UI components
- **Accessibility:** Must use Shadcn Popover/Select for accessible dropdowns (WCAG AA compliance)
- **Touch support:** iPad users require 48px minimum touch targets for markers and dropdowns
- **Performance:** Debounced auto-save (300ms) prevents excessive API calls during marker selection
- **Color scheme:** Use existing Tailwind palette (emerald-500, amber-500, rose-500) for consistency

**Technology Preferences Stated:**

- **Component library:** Shadcn/UI for all UI elements (Popover, Select, Tooltip, Badge)
- **State management:** React hooks (useState, useEffect) for local component state
- **Form handling:** Controlled inputs with onChange handlers
- **API integration:** Existing `patientsApi.updateEvaluation` endpoint with partial updates

**Similar Code Patterns to Follow:**

- **BodySilhouette.tsx:** SVG marker placement with coordinate mapping via `getBoundingClientRect()`
- **PosturogramViewer.tsx:** Before/after slider with draggable handle and image overlay clipping
- **EvaluationForm.tsx:** Debounced auto-save pattern with `useDebounce` hook
- **apps/client/src/components/ui/popover.tsx:** Accessible popover with collision detection
- **apps/client/src/components/ui/select.tsx:** Accessible dropdown with keyboard navigation

# Spec Requirements: PacienteProfile

## Initial Description

**5.2** PacienteProfile — Detailed view with cases history, photos, action buttons

## Requirements Discussion

### First Round Questions

**Q1:** Photos Display: Should photos be shown as a horizontal scrolling gallery below the active case, a modal/lightbox when clicking "View Photos", or part of the case detail view?
**Answer:** Add a horizontal scrolling media gallery below the Active Case section. Shows thumbnails of footprints and posture videos from the active case's evaluation. Clicking a thumbnail opens a lightbox modal for full view.

**Q2:** Cases History Interaction: Should clicking on a past case navigate to CaseDetailLayout (task 5.3), or expand inline?
**Answer:** Clicking a past case navigates to `/pacientes/:id/casos/:caseId` (CaseDetailLayout from task 5.3). Current cards already have cursor-pointer and hover states, just needs onClick handler wired.

**Q3:** "Ver Expediente Completo" link: Should this navigate to CaseDetailLayout for the active case, or open a different view?
**Answer:** Navigate to CaseDetailLayout for the active case. Route: `/pacientes/:patientId/casos/:activeCaseId`.

**Q4:** Action Buttons (Voice/Footprint/Video): Should implementing actual capture functionality be part of this spec, or remain as placeholders?
**Answer:** Keep as styled placeholders with informative toasts. Update toast message to "Disponible próximamente" instead of "Simulando...". Real functionality comes in Week 7 (Media & Dictation).

**Q5:** Is there anything to exclude from this component's scope?
**Answer:** Exclude: Actual media capture implementation (Week 7), New Evaluation form functionality (Week 6, task 6.1), Create New Case flow (separate feature).

### Existing Code to Reference

**Similar Features Identified:**

- Component: `PatientProfile.tsx` - Path: `apps/client/src/components/patients/PatientProfile.tsx` (existing implementation to enhance)
- Page: `PatientDetail.tsx` - Path: `apps/client/src/pages/PatientDetail.tsx` (parent page with state management)
- Navigation pattern: `PatientList` → `handleView` → `navigate()` pattern in `apps/client/src/pages/Patients.tsx`
- Card hover states: Already implemented in past cases section
- Types: `Footprint`, `PostureVideo` in `apps/client/src/types/patient.ts`

**Patterns to Create:**

- Lightbox modal: None exists yet - will need to create or use a library
- Media gallery component: New component needed

### Follow-up Questions

None required - scope was clear from initial discussion.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - Following existing design patterns from PatientProfile.tsx and PatientList.tsx.

## Requirements Summary

### Functional Requirements

- Display horizontal scrolling media gallery showing footprints and posture videos from active case evaluation
- Implement lightbox modal for full-size media viewing when thumbnail is clicked
- Wire past case cards to navigate to CaseDetailLayout (`/pacientes/:id/casos/:caseId`)
- Wire "Ver Expediente Completo" button to navigate to active case's CaseDetailLayout
- Update placeholder action button toasts to show "Disponible próximamente"
- Display empty state when no media exists: "No hay fotos o videos capturados"

### Reusability Opportunities

- Create reusable `MediaGallery` component that can be used in other contexts (CaseDetailLayout, EvaluationForm)
- Create reusable `Lightbox` component for image/video viewing across the app
- Navigation pattern already exists and should be followed

### Scope Boundaries

**In Scope:**

- Media gallery section with thumbnails (horizontal scroll)
- Lightbox modal for full media view
- Navigation wiring for past case cards
- Navigation wiring for "Ver Expediente Completo" button
- Toast message updates for placeholder actions
- Empty state for media gallery

**Out of Scope:**

- Actual media capture implementation (Week 7)
- Voice dictation functionality (Week 7)
- New Evaluation form functionality (Week 6, task 6.1)
- Create New Case flow (separate feature)
- Backend changes (media data already available via API)

### Technical Considerations

- Media data structure: `Footprint[]` and `PostureVideo[]` nested in `Evaluation` → `ClinicalCase`
- Access pattern: `patient.clinicalCases[active].evaluation.footprints` and `.postureVideos`
- Routes to implement: `/pacientes/:patientId/casos/:caseId` (may need to add to App.tsx router)
- Consider lazy loading for media thumbnails
- Lightbox library options: react-image-lightbox, yet-another-react-lightbox, or custom implementation
- Follow existing Tailwind + Shadcn/UI styling patterns

### Implementation Effort Estimates

| Change                                                 | Effort  | Priority |
| ------------------------------------------------------ | ------- | -------- |
| Add Media Gallery section with thumbnails              | Medium  | High     |
| Add Lightbox modal for media viewing                   | Medium  | High     |
| Wire past case cards to navigate to CaseDetailLayout   | Low     | High     |
| Wire "Ver Expediente Completo" navigation              | Low     | High     |
| Update placeholder toasts to "Disponible próximamente" | Trivial | Low      |
| Add empty state for media gallery                      | Low     | Medium   |

# Spec Requirements: Treatment Plan Objectives UI

## Initial Description

From Roadmap 6.17:

> **Treatment Plan Objectives UI** — Display therapeutic/prophylactic/educational goals
>
> - Add objectives section to CaseDetailLayout (Stage 2 of clinical flow)
> - Wire to `TreatmentPlan.objectives` from backend

This feature represents **Stage 2** of the 6-stage clinical flow, where the therapist defines treatment goals after the initial evaluation.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the objectives section should be a new navigation tab in `CaseDetailLayout` (alongside Seguimiento, Evaluacion, Comparar). Is that correct, or should it be embedded within an existing view?
**Answer:** New navigation tab.

**Q2:** I'm thinking the objectives should be editable inline (text fields that auto-save). Should we use free-text fields, or structured inputs?
**Answer:** User requested suggestion. **Decision: Single text area per objective type with auto-save** (matches EvaluationForm pattern, aligns with Zero-Friction mission).

**Q3:** I assume the objectives are case-level (one set of therapeutic/prophylactic/educational goals per ClinicalCase). Is that correct?
**Answer:** Yes, case-level objectives confirmed.

**Q4:** For the initial case creation flow, should objectives be required before starting treatment sessions?
**Answer:** User requested suggestion. **Decision: Optional with contextual prompts** (therapist needs evaluation data before defining meaningful objectives; blocking creates friction).

**Q5:** Should there be a visual distinction between the three objective types?
**Answer:** User requested suggestion. **Decision: Color-coded cards with icons** (Therapeutic=emerald/Heart, Prophylactic=amber/Shield, Educational=blue/GraduationCap).

**Q6:** Is there anything that should explicitly be excluded from this feature scope?
**Answer:** User requested suggestion. **Decision: Exclude AI suggestions, version history, standalone export, templates library, per-phase objectives, approval workflow.**

### Existing Code to Reference

**Similar Features Identified:**

- Feature: EvaluationForm - Path: `apps/client/src/components/patients/EvaluationForm.tsx`
  - Uses debounced auto-save pattern
  - Section-based layout with icons
  - Voice recorder UI integration
- Feature: TreatmentTimeline - Path: `apps/client/src/components/patients/TreatmentTimeline.tsx`
  - Consumes `clinicalCase.treatmentPlan`
  - Session management patterns
- Feature: PhaseProgress - Path: `apps/client/src/components/patients/treatment-timeline/PhaseProgress.tsx`
  - Color-coded segments
  - Visual progress indicators
- Feature: CaseDetailLayout - Path: `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - Navigation tab pattern to follow
  - ViewMode state management

**Backend References:**

- TreatmentPlan Prisma model: `apps/server/prisma/schema.prisma` (line 103-115)
- TreatmentObjectives type: `apps/client/src/types/patient.ts` (line 215-219)

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - Will use existing app patterns (color-coded cards, Lucide icons, Tailwind styling).

## Requirements Summary

### Functional Requirements

**Core Features:**

- Add new "Objetivos" navigation tab to `CaseDetailLayout`
- Display three objective types: Therapeutic, Prophylactic, Educational
- Each objective type has one text area for freeform input
- Auto-save with debounce (300ms, matching EvaluationForm pattern)
- Wire to `TreatmentPlan.objectives` from backend via `patientsApi`

**Visual Design:**

- Color-coded cards with subtle backgrounds:
  - Therapeutic: `bg-emerald-50 border-emerald-200 text-emerald-700`
  - Prophylactic: `bg-amber-50 border-amber-200 text-amber-700`
  - Educational: `bg-blue-50 border-blue-200 text-blue-700`
- Icons from Lucide:
  - Therapeutic: `Heart` or `Activity`
  - Prophylactic: `Shield`
  - Educational: `GraduationCap`
- Voice dictation button placeholder (consistent with "Grabar Evolucion" pattern)

**Empty State:**

- Welcoming message: "Define los objetivos del tratamiento"
- Call-to-action button to start editing
- No blocking or warnings

**UX Behaviors:**

- Objectives are optional (no validation, no mandatory fields)
- Subtle contextual prompts in Timeline view if objectives are empty
- Mobile-responsive layout (stack cards vertically on small screens)

### Reusability Opportunities

**Components to potentially reuse:**

- `useDebounce` hook from EvaluationForm
- Card styling patterns from existing components
- Toast notifications for save feedback

**Backend patterns to follow:**

- `patientsApi.updateEvaluation()` pattern for optimistic updates
- Error handling with toast notifications

### Scope Boundaries

**In Scope:**

- New "Objetivos" tab in CaseDetailLayout navigation
- ObjectivesView component with three text areas
- Color-coded cards with icons
- Auto-save with debounce
- Empty state design
- Wire to TreatmentPlan.objectives backend field
- Mobile-responsive layout

**Out of Scope:**

- AI-powered suggestions for objectives (Part 2, Weeks 12-16)
- Version history or audit trail for changes
- Standalone export/print for objectives (included in comparison report)
- Templates library for common objectives
- Per-phase objectives (already exists in TreatmentPhase.objectives)
- Multi-user approval workflow
- Character limits or validation rules
- Mandatory field enforcement

### Technical Considerations

**Frontend:**

- Add `'objectives'` to `ViewMode` type in CaseDetailLayout
- Create `ObjectivesView.tsx` component
- Use existing `useDebounce` hook or create similar
- Follow existing toast notification patterns

**Backend:**

- Currently no dedicated endpoint for updating TreatmentPlan objectives
- Option 1: Add `PATCH /treatment-plans/:id` endpoint
- Option 2: Extend `PATCH /clinical-cases/:id` to accept nested objectives
- Recommendation: Create dedicated endpoint for cleaner separation

**State Management:**

- Local state in CaseDetailLayout (`localCase`)
- Optimistic updates with rollback on error
- Toast feedback on save success/failure

**Testing:**

- Unit tests for ObjectivesView component
- Integration tests for save/load flow
- Accessibility tests for form inputs

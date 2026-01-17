# Specification: Treatment Plan Objectives UI

## Goal

Add an "Objetivos" navigation tab to `CaseDetailLayout` that displays and allows editing of the three treatment objective types (therapeutic, prophylactic, educational), with auto-save functionality wired to the backend.

## User Stories

- As a physiotherapist, I want to define treatment objectives for a clinical case so that I have clear documented goals for the patient's therapy.
- As a physiotherapist, I want my objectives to auto-save as I type so that I don't lose my work or have to click save buttons.

## Specific Requirements

**New "Objetivos" Navigation Tab**

- Add `'objectives'` to the `ViewMode` type union in `CaseDetailLayout.tsx`
- Add new navigation button between "Evaluacion" and "Comparar" tabs
- Use `Target` icon from Lucide (aligns with "objectives" concept)
- Follow existing tab button styling with active/inactive states
- Tab label: "Objetivos" (hidden on mobile, icon-only)

**ObjectivesView Component**

- Create new component at `apps/client/src/components/patients/ObjectivesView.tsx`
- Accept `clinicalCase` prop and `onObjectivesChange` callback
- Render three color-coded card sections, one per objective type
- Use `<textarea>` elements with 4-6 rows for freeform input
- Implement loading state while fetching and saving state indicator

**Color-Coded Objective Cards**

- Therapeutic: `bg-emerald-50 border-emerald-200`, header `text-emerald-700`, icon `Heart`
- Prophylactic: `bg-amber-50 border-amber-200`, header `text-amber-700`, icon `Shield`
- Educational: `bg-blue-50 border-blue-200`, header `text-blue-700`, icon `GraduationCap`
- Cards should have `rounded-xl border p-4` styling
- Voice dictation button placeholder (disabled, for future integration)

**Auto-Save with Debounce**

- Use existing `useDebounce` hook from `hooks/use-debounce.ts`
- Debounce delay: 300ms (matching EvaluationForm pattern)
- Show save status indicator: idle, saving (spinner), saved (checkmark), error (red)
- On error: show toast notification with retry guidance

**Empty State Design**

- When all three objectives are empty, show welcoming empty state
- Message: "Define los objetivos del tratamiento"
- Subtext: "Establece las metas terapéuticas, profilácticas y educativas para este caso"
- No blocking behavior or mandatory fields

**Backend Integration**

- Add `updateTreatmentPlanObjectives` method to `patientsApi`
- Create new endpoint: `PATCH /treatment-plans/:id/objectives`
- Accept body: `{ therapeutic: string, prophylactic: string, educational: string }`
- Follow existing patterns from `updateEvaluation` and `updateSession`

**State Management**

- Use `localCase` state in `CaseDetailLayout` for optimistic updates
- Add `handleObjectivesChange` handler similar to `handlePosturogramChange`
- Update `localCase.treatmentPlan.objectives` on change
- Rollback on API error with toast notification

**Mobile Responsiveness**

- Stack cards vertically on screens below `md` breakpoint
- Full-width textareas on mobile
- Maintain touch-friendly padding (minimum 44px touch targets)

## Visual Design

No mockups provided. Follow existing app patterns:

- Card-based sections similar to EvaluationForm sections
- Color scheme matches existing emerald/amber/blue usage in PhaseProgress
- Icons from Lucide-react (already used throughout app)

## Existing Code to Leverage

**`apps/client/src/hooks/use-debounce.ts`**

- Provides `useDebounce` hook for callback debouncing
- Used by EvaluationForm for auto-save
- Reuse directly with same 300ms delay pattern

**`apps/client/src/components/patients/EvaluationForm.tsx`**

- Pattern for debounced auto-save with status indicator (lines 97-133)
- Pattern for section-based layout with icons
- Pattern for optimistic updates with toast error handling
- Reference `debouncedSavePosturogram` implementation

**`apps/client/src/components/patients/CaseDetailLayout.tsx`**

- Add new view mode to `ViewMode` type (line 26)
- Add navigation button following existing pattern (lines 247-292)
- Add case for rendering ObjectivesView in view switch (lines 302-335)
- Use existing `localCase` state for optimistic updates

**`apps/client/src/api/patients.ts`**

- Add new `updateTreatmentPlanObjectives` method following `updateEvaluation` pattern
- Use same axios instance and error handling approach
- Define `UpdateTreatmentPlanObjectivesDto` interface

**`apps/server/src/modules/clinical-cases/clinical-cases.service.ts`**

- Already includes `treatmentPlan` in `findOne` query (line 112)
- Pattern for therapist-scoped access control (lines 97-121)
- Reference for creating new treatment-plans service method

## Out of Scope

- AI-powered suggestions for objectives (Part 2, Weeks 12-16)
- Version history or audit trail for objective changes
- Standalone export/print for objectives (already included in comparison report)
- Templates library for common objective presets
- Per-phase objectives editing (already exists in TreatmentPhase.objectives)
- Multi-user approval workflow for objectives
- Character limits or validation rules on text input
- Mandatory field enforcement or form validation
- Voice dictation functionality (placeholder only, implemented in Week 7)
- Rich text formatting (bold, lists, etc.) - plain text only

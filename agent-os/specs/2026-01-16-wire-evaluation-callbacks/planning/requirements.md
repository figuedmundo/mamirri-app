# Spec Requirements: Wire Evaluation Callbacks

## Initial Description

Wire callbacks for evaluation components (onSave, onPosturogramChange, onPainScaleChange) from Week 6 evaluation components (EvaluacionForm, PosturogramViewer) to parent components.

**Source:** agent-os/product/roadmap.md task 6.9

## Requirements Discussion

### First Round Questions

**Q1:** I assume these callbacks should be passed as props from parent components (like PacienteProfile or CaseDetailLayout) to the evaluation components (EvaluacionForm, PosturogramViewer, Cronograma). Is that correct, or should we use a different communication pattern (context, events, state management)?

**Answer:** ✅ Recommended: Pass as props from parent → child components. This matches existing component definitions and is React's standard pattern. No complex state management needed for this scope.

**Q2:** For the `onSave` callback, I'm thinking it should trigger API calls to save evaluation data to the backend and potentially update the UI with success/error feedback. Should it also auto-save (debounced) or only save on explicit user action (save button)?

**Answer:** ✅ Recommended: Hybrid approach - Explicit save button + debounced auto-save (300ms). This matches existing `EvaluationForm` implementation with `useDebounce(300ms)`, gives therapists immediate feedback while preventing data loss, aligns with "Zero-Friction" mission.

**Q3:** The `onPosturogramaChange` callback - should this trigger whenever any posturogram data changes (anatomical points, images, analysis results), or only when the entire posturogram is marked as "complete/confirmed"?

**Answer:** ✅ Recommended: Trigger on any marker change + debounced (300ms). `PosturogramViewer` already uses this pattern. Therapists need real-time feedback as they click markers. 300ms debounce prevents excessive API calls.

**Q4:** For `onPainScaleChange`, I assume this should trigger when pain scale values are updated in EvaluacionForm. Should this update the database immediately, or wait until the form is saved? Should it also update the pain trend chart in Cronograma in real-time?

**Answer:** ✅ Recommended: Update database immediately (with debouncing) + real-time chart updates. Pain levels are critical clinical data - must persist reliably. Immediate updates to `PainTrendChart` in `Cronograma` provides instant visual feedback. `EvaluationForm` already implements debounced updates.

**Q5:** Should these callbacks handle their own error states and loading indicators, or should they return results and let the parent components manage UI state?

**Answer:** ✅ Recommended: Let callbacks handle their own UI state. Each component has specific error/loading needs. `EvaluationForm` already manages `saveStatus` state ('idle' | 'saving' | 'saved' | 'error'). Separation of concerns keeps components reusable.

**Q6:** I'm assuming the callbacks should be typed with TypeScript interfaces matching the Prisma schema models (Evaluation, Posturograma, etc.). Is that correct, or should we use DTOs/middleware layers?

**Answer:** ✅ Recommended: Use Prisma schema types + DTO layer for API boundary. Backend uses Prisma - frontend should match. `UpdateEvaluationDto` already exists in backend. Type safety ensures JSON structure matches between frontend/backend.

**Q7:** Should we implement optimistic UI updates (update UI immediately, rollback on error) or wait for API confirmation before updating the UI?

**Answer:** ✅ Recommended: Optimistic updates with rollback on error. Therapists feel "Zero-Friction" - instant feedback. `EvaluationForm` already implements pattern: update local state immediately, API in background. Rollback on error prevents data corruption.

**Q8:** Are there any other callbacks beyond these three that should be wired during this task (e.g., onTreatmentSessionChange, onOrthopedicTestChange)?

**Answer:** ✅ Recommended: Focus ONLY on three specified callbacks. Task scope: `onSave`, `onPosturogramaChange`, `onPainScaleChange`. Session callbacks (`onAddSession`, `onEditSession`) already exist in `Cronograma` (task 6.10). Orthopedic test changes should trigger `onSave` (not separate callback).

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** Evaluation Form with debounced auto-save
  - **Path:** `apps/client/src/components/patients/EvaluationForm.tsx`
  - **Components to potentially reuse:** `EvaluationForm` already defines callback props (`onSave`, `onPosturogramChange`, `onPainScaleChange`), uses `useDebounce(300ms)`, manages `saveStatus` state
  - **Backend logic to reference:** `patientsApi.updateEvaluation` call pattern, error handling with try/catch, toast notifications

- **Feature:** Posturogram viewer with anatomical marker auto-saving
  - **Path:** `apps/client/src/components/patients/PosturogramViewer.tsx`
  - **Components to potentially reuse:** `PosturogramViewer` with `onPosturogramChange` callback, debounced API calls, anatomical point state management
  - **Backend logic to reference:** Migration layer for legacy posturogram structures, marker update pattern

- **Feature:** Session management with CRUD callbacks
  - **Path:** `apps/client/src/components/patients/Cronograma.tsx`
  - **Components to potentially reuse:** Session callback patterns (`onSessionCreated`, `onSessionUpdated`, `onSessionDeleted`, `onViewSession`), `patientsApi` integration for mutations
  - **Backend logic to reference:** `handleFormSubmit`, `handleConfirmDelete` patterns, API service integration

- **Feature:** Parent layout component structure
  - **Path:** `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - **Components to potentially reuse:** Parent component structure for passing callbacks, session selection state management, empty state handling
  - **Backend logic to reference:** Props flow pattern, state lifting to parents

**Backend Patterns:**

- **Path:** `apps/server/src/modules/patients/patients.service.ts`
  - Evaluation update logic with therapist ownership verification, atomic transactions, JSON field handling for complex data
- **Path:** `apps/server/src/modules/patients/dto/update-evaluation.dto.ts`
  - Validation patterns (`@IsObject`, `@IsInt`), field validations (painScale 0-10, barthel 0-100)
- **Path:** `apps/server/src/common/filters/all-exceptions.filter.ts`
  - Global error formatting, Prisma error mapping (P2025 → 404), standard response structure

**Shared Hooks:**

- **Path:** `apps/client/src/hooks/use-debounce.ts`
  - 300ms debouncing implementation for callbacks and values
- **Path:** `apps/client/src/hooks/use-unsaved-changes.ts`
  - Dirty state tracking, markDirty/markClean functions, unsaved warnings

**Type Definitions:**

- **Path:** `apps/client/src/types/patient.ts`
  - `Posturogram` type with nested views (anteriorView, posteriorView, lateralView)
  - `AnatomicalPointStatus` type with deviation and severity
  - `PainScale` type with activity, rest, palpation, type fields
  - `TreatmentSession` type with phaseNumber, procedures, finalPainLevel

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

None.

## Requirements Summary

### Functional Requirements

**Callback 1: onSave**

- Save evaluation data to backend via `patientsApi.updateEvaluation`
- Handle both explicit save (button click) and debounced auto-save (300ms)
- Update UI with success/error feedback (toasts)
- Manage loading state (`saveStatus`: 'idle' | 'saving' | 'saved' | 'error')
- Triggered by:
  - Explicit "Guardar Evaluación" button click
  - Orthopedic test toggles (debounced 300ms)
  - Navigate away from form (with unsaved changes warning)

**Callback 2: onPosturogramaChange**

- Update posturogram data via `patientsApi.updateEvaluation`
- Debounced 300ms to prevent excessive API calls
- Handle anatomical point marker changes
- Handle deviation type selection (normal, left, right)
- Handle severity level changes (mild, moderate, severe)
- Provide error feedback on failed updates

**Callback 3: onPainScaleChange**

- Update pain scale data via `patientsApi.updateEvaluation`
- Debounced 300ms for API efficiency
- Update pain scale sliders (0-10) for activity, rest, palpation
- Update pain type (acute/chronic)
- Trigger real-time re-render of `PainTrendChart` in `Cronograma`
- Provide optimistic UI updates with rollback on error

**Data Flow Requirements:**

- Parent components (CaseDetailLayout, PatientProfile) pass callbacks as props to children
- Children components manage their own loading/error states
- State lifting to parents for cross-component updates (e.g., pain chart updates)
- Therapist ownership verification on backend before updates
- JSON field updates for complex data (posturograms, pain scales)

### Reusability Opportunities

**Existing Components:**

- `EvaluationForm` - Already has callback props defined, just need implementation wiring
- `PosturogramViewer` - Already has debounced update pattern
- `Cronograma` - Session callback pattern to reference
- `CaseDetailLayout` - Parent structure for callback passing

**Backend Patterns:**

- `patientsApi.updateEvaluation` - Reuse existing API endpoint
- `UpdateEvaluationDto` - Follow existing validation structure
- Ownership verification pattern - Reuse therapist check logic
- Global error filter - Automatic error handling

**Hooks and Utilities:**

- `useDebounce(300ms)` - Reuse existing debouncing hook
- `useUnsavedChanges` - Reuse dirty state tracking
- Toast notification system - Reuse existing feedback mechanism

**Similar Features to Model After:**

- Session CRUD operations in `Cronograma` - for form submission patterns
- Existing patient profile callbacks (`onEdit`, `onSchedule`, `onViewCase`) - for callback naming and structure

### Scope Boundaries

**In Scope:**

- Wire `onSave`, `onPosturogramaChange`, `onPainScaleChange` callbacks
- Implement debounced auto-save (300ms) for posturogram and pain scale changes
- Add explicit save button functionality
- Handle optimistic UI updates with rollback on error
- Manage loading states and error feedback in child components
- Update parent state to trigger cross-component re-renders (e.g., pain chart)
- Follow existing TypeScript type definitions from Prisma schema
- Use existing `patientsApi.updateEvaluation` endpoint
- Implement therapist ownership verification on backend

**Out of Scope:**

- `onAddSession`, `onEditSession`, `onViewSession` callbacks (task 6.10)
- `onVoiceDictation`, `onCaptureFootprint`, `onCaptureVideo` callbacks (Week 7)
- Separate callback for orthopedic test changes (include in `onSave`)
- New API endpoints (reuse existing `PATCH /api/v1/patients/evaluations/:id`)
- New database schema changes (use existing `Evaluation` model with JSON fields)
- State management refactoring (use existing prop pattern)
- Context or event bus implementation

**Future Enhancements Mentioned:**

- Additional evaluation-related callbacks as features expand
- Integration with Week 7 Media & Dictation features
- Potential real-time collaboration features

### Technical Considerations

**Integration Points:**

- `EvaluationForm` component (already has callback props defined)
- `PosturogramViewer` component (already has callback prop defined)
- `Cronograma` component (for pain chart updates)
- `CaseDetailLayout` parent component (for callback passing)
- `PatientProfile` parent component (for callback passing)

**Existing System Constraints:**

- Must use existing `patientsApi.updateEvaluation` endpoint
- Must follow Prisma schema types for `Evaluation`, `Posturogram`, `PainScale`
- Must maintain therapist ownership isolation
- Must use 300ms debounce pattern (existing `useDebounce` hook)
- Must handle JSON fields for complex data (posturograms, pain scales)
- Must provide optimistic UI updates with rollback

**Technology Preferences Stated:**

- TypeScript with strict typing (match Prisma schema)
- React 19 with hooks-based state management
- NestJS backend with existing service patterns
- Shadcn/UI for consistent UI components
- Tailwind CSS for styling

**Similar Code Patterns to Follow:**

- `Cronograma` session CRUD callbacks for callback structure
- `PosturogramViewer` debounced updates for timing
- `EvaluationForm` saveStatus state management
- Backend ownership verification pattern from `PatientsService`
- Global exception filter for consistent error responses
- DTO validation pattern (`UpdateEvaluationDto`)

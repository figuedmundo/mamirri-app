# Specification: Wire Evaluation Callbacks

## Goal

Wire three callback functions (onSave, onPosturogramChange, onPainScaleChange) from evaluation components to parent components to enable real-time data persistence with debounced auto-save and optimistic UI updates.

## User Stories

- As a physiotherapist, I want evaluation data to auto-save as I work so that I never lose clinical information.
- As a physiotherapist, I want real-time pain chart updates when I adjust pain scales so that I can immediately see patient progress.
- As a physiotherapist, I want explicit save buttons available so that I can confirm when evaluation is complete.

## Specific Requirements

**Callback Wiring: onSave**

- Pass `onSave` callback from parent (CaseDetailLayout, PatientProfile) to EvaluationForm component as prop
- Implement hybrid save strategy: explicit button click AND debounced auto-save (300ms)
- Auto-save triggers on orthopedic test toggles and unsaved form state changes
- Manage `saveStatus` state in child component ('idle' | 'saving' | 'saved' | 'error')
- Display loading indicators and success/error toasts via `useToast` hook
- Validate data against `UpdateEvaluationDto` structure before API call
- Optimistic UI updates with rollback on API failure

**Callback Wiring: onPosturogramChange**

- Pass `onPosturogramChange` callback from parent to PosturogramViewer component as prop
- Implement debounced API updates (300ms) on anatomical marker changes
- Trigger on deviation type selection (normal, left, right) and severity changes (mild, moderate, severe)
- Use existing `patientsApi.updateEvaluation` endpoint with posturogram JSON payload
- Handle legacy posturogram structure migration in parent component
- Show error toast on failed updates via `useToast` hook

**Callback Wiring: onPainScaleChange**

- Pass `onPainScaleChange` callback from parent to EvaluationForm component as prop
- Implement debounced API updates (300ms) on pain scale slider changes (activity, rest, palpation 0-10)
- Trigger on pain type toggle (acute/chronic)
- Update parent state to force re-render of `PainTrendChart` in Cronograma component
- Use optimistic UI updates with rollback on API error
- Ensure pain scale data matches Prisma `PainScale` type structure

**Parent Component Integration**

- Update CaseDetailLayout to accept and implement all three callback handlers
- Update PatientProfile to accept and implement callbacks when evaluation form is added
- Implement state lifting pattern: parent manages clinicalCase state, children trigger updates via callbacks
- Ensure therapist ownership verification on all API calls via existing backend pattern
- Use React state for cross-component updates (pain chart re-renders after pain scale changes)

**Error Handling and User Feedback**

- Use centralized `useToast` hook for all user notifications (success, error, loading states)
- Implement rollback logic: revert optimistic updates on API failures
- Show user-friendly error messages via global exception filter, avoid technical details
- Prevent duplicate API calls during rapid changes with 300ms debounce
- Disable save buttons while saving to prevent race conditions

**Type Safety and Validation**

- Use existing TypeScript types from `apps/client/src/types/patient.ts` (Posturogram, PainScale, Evaluation)
- Match frontend callbacks to backend `UpdateEvaluationDto` validation structure
- Maintain Prisma schema type safety for JSON fields (posturogram, painScale)
- Validate pain scale range (0-10) on both client and server side

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**apps/client/src/components/patients/EvaluationForm.tsx**

- Already defines callback props interface (`onSave`, `onPosturogramChange`, `onPainScaleChange`)
- Implements `useDebounce(300ms)` pattern for posturogram and pain scale auto-save
- Manages `saveStatus` state ('idle' | 'saving' | 'saved' | 'error') for UI feedback
- Uses `useToast` hook for success/error notifications
- Reuse existing structure, just wire callbacks to parent implementations

**apps/client/src/components/patients/PosturogramViewer.tsx**

- Already defines `onPosturogramChange` callback prop
- Implements debounced `debouncedSavePosturogram` (300ms) function
- Uses `patientsApi.updateEvaluation` with posturogram JSON payload
- Has anatomical point change handlers (`handleDeviationChange`)
- Reuse existing debounced update pattern

**apps/client/src/hooks/use-debounce.ts**

- Provides `useDebounce(callback, delay)` hook for function debouncing
- Standard 300ms delay used across components
- Reuse this exact delay for all three callbacks to maintain consistency

**apps/client/src/hooks/use-toast.ts**

- Provides `toast()` function and `useToast()` hook for notifications
- Used throughout codebase for success/error feedback
- Reuse for all user-facing notifications from callbacks

**apps/server/src/modules/patients/patients.service.ts**

- Contains `patientsApi.updateEvaluation` endpoint (`PATCH /api/v1/patients/evaluations/:id`)
- Implements therapist ownership verification before updates
- Handles JSON field updates for posturogram and painScale data
- Reuse existing endpoint, no new API endpoints needed

**apps/client/src/components/patients/Cronograma.tsx**

- Contains session callback patterns (`onSessionCreated`, `onSessionUpdated`)
- Shows how parent component handles child callbacks and state updates
- Use as reference for callback naming and implementation structure

**apps/client/src/hooks/use-unsaved-changes.ts**

- Provides dirty state tracking (`markDirty`, `markClean`)
- Used in EvaluationForm for unsaved changes warning
- Reuse for navigate-away protection when form has unsaved data

## Out of Scope

- Session callbacks (`onAddSession`, `onEditSession`, `onViewSession`) - covered in task 6.10
- Voice dictation callbacks (`onVoiceDictation`) - Week 7 feature
- Media capture callbacks (`onCaptureFootprint`, `onCaptureVideo`) - Week 7 feature
- Separate orthopedic test callback - include in `onSave` instead
- New API endpoints - reuse existing `PATCH /api/v1/patients/evaluations/:id`
- New database schema changes - use existing Evaluation model with JSON fields
- Context or event bus implementation - use existing prop-based callback pattern
- New UI components - reuse existing EvaluationForm, PosturogramViewer, Cronograma
- Real-time collaboration features - future enhancement
- Backend service refactoring - use existing PatientsService pattern

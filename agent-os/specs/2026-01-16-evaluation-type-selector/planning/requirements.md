# Spec Requirements: Evaluation Type Selector

## Initial Description

Add `type` field to Evaluation UI with a selector for INITIAL / FINAL evaluation types.

## Requirements Discussion

### First Round Questions

**Q1:** I assume when creating a new evaluation, the system should automatically default to "INITIAL" if no INITIAL evaluation exists, and "FINAL" if an INITIAL evaluation already exists. Is that correct, or should we always prompt the user to select the type?

**Answer:** Yes, auto-default with manual override option. The system should suggest the appropriate type based on existing evaluations, but allow the therapist to manually override if needed.

**Q2:** I'm thinking the type selector should be a prominent dropdown/radio button at the top of the EvaluacionForm, shown before the user starts filling out the form. Should we allow changing the evaluation type after the form has been partially filled, or should it be locked once selected?

**Answer:** Prominent top selector, locked after first data entry. User cannot change type once they've started interacting with the form to prevent data corruption.

**Q3:** For the badge display in CaseDetailLayout, I assume we should show the type badge next to the evaluation header (e.g., "Evaluación" button in the navigation should have a small badge like "Evaluación [INICIAL]" or "[FINAL]"). Is that the right location, or should it be elsewhere?

**Answer:** Dual placement for visibility - navigation badge + form header badge + comparison board labels.

**Q4:** The database schema currently supports `INITIAL`, `PROGRESS`, and `FINAL` types. Since we're only using INITIAL/FINAL in the UI, should we:

- Option A: Keep PROGRESS in DB for future use but hide it from UI
- Option B: Update the DB schema to only allow INITIAL/FINAL
- Option C: Keep everything as-is and just filter in the UI

**Answer:** Option A - Keep PROGRESS in DB for future use but hide it from UI. This maintains backward compatibility while allowing for future expansion without requiring schema migration.

**Q5:** Should there be any validation to prevent creating two INITIAL evaluations or two FINAL evaluations for the same clinical case? Or can the therapist create multiple evaluations of the same type if needed?

**Answer:** YES - Prevent duplicate INITIAL/FINAL evaluations with clear messaging. Force-create option only available for genuine edge cases (data correction needs).

### Existing Code to Reference

Based on existing codebase patterns and user input:

**Similar Features Identified:**

- Feature: VoiceRecorder component (for voice dictation integration)
  - Path: `apps/client/src/components/patients/VoiceRecorder.tsx`
  - Components to potentially reuse: Similar state management for selection flows, toast notification patterns
- Feature: Tab-based navigation (activeSection state pattern)
  - Path: `apps/client/src/components/patients/EvaluationForm.tsx`
  - Components to potentially reuse: Similar button group patterns, conditional rendering
- Feature: Badge components with conditional styling
  - Path: `apps/client/src/components/patients/CaseDetailLayout.tsx` (evaluation type badge uses similar pattern)
  - Components to potentially reuse: Badge rendering patterns, color theming logic

**Backend logic to reference:**

- Evaluation utility functions (`apps/client/src/lib/evaluation-utils.ts`)
  - Patterns: getInitialEvaluation, getFinalEvaluation, getLatestEvaluation functions for filtering evaluations array
  - Similar patterns can be applied for PROGRESS type handling if needed in the future

## Visual Assets

### Files Provided:

No visual assets provided by user.

### Visual Insights:

No visual assets to analyze.

## Requirements Summary

### Functional Requirements

**Core Feature: Evaluation Type Selector (Task 6.15)**

- EvaluacionForm must prompt user to select evaluation type when creating a new evaluation
- Display evaluation type badge in CaseDetailLayout header showing INITIAL/FINAL
- Support only two evaluation types: INITIAL and FINAL (PROGRESS reserved for future use)
- Auto-default type based on existing evaluations (INITIAL → FINAL after INITIAL exists)
- Manual override option available for therapists who need different behavior
- Lock evaluation type after user starts entering data to prevent accidental changes
- Show suggestion text for auto-defaulted type with reasoning

**Clinical Flow Alignment:**

- Follows doctor's requirement: two formal evaluations (INITIAL baseline, FINAL outcome)
- Progress tracking done through TreatmentSession records, not full evaluations
- Maintains consistency with PACIENTES_FLOW.md original Spanish documentation
- Aligns with language strategy (English code, Spanish UI)

**User Experience:**

- Clear visual distinction between INITIAL (green/emerald badge) and FINAL (blue badge)
- Type selector shown prominently at top of EvaluacionForm before clinical data entry
- Prevents accidental type changes during active data entry
- Helpful suggestions guide users based on existing case state

### Reusability Opportunities

**Components to Reuse:**

- VoiceRecorder pattern for consistent state/callback patterns
- Tab navigation pattern from existing EvaluacionForm
- Badge rendering patterns from CaseDetailLayout
- Toast notification patterns for error handling

**Backend Patterns to Reference:**

- Evaluation utility functions for filtering evaluations by type
- Similar validation pattern can be applied for PROGRESS type handling if needed

### Scope Boundaries

**In Scope:**

- EvaluationType enum with INITIAL, PROGRESS, FINAL values
- EVALUATION_TYPE_OPTIONS constant for UI (INITIAL/FINAL only)
- Auto-default logic based on existing evaluations
- Type selector UI component with card-based selection
- Evaluation type badges in CaseDetailLayout navigation and form header
- Type locking mechanism after data entry starts
- Duplicate validation function in evaluation-utils
- hasInitialEvaluation/hasFinalEvaluation helper states

**Out of Scope:**

- Database schema changes (keeping PROGRESS type in DB for future use)
- Backend API modifications
- ComparisonBoard type badge integration (deferred to future task 6.16)
- CaseRecommendations entity (deferred to future)
- Full evaluation type management (create/edit/delete workflow - deferred)

**Future Enhancements:**

- PROGRESS type exposure in UI if clinical workflow requires mid-treatment evaluations
- Multi-evaluation editing workflow with type switching
- Evaluation comparison dashboard showing all evaluations in timeline

### Technical Considerations

**Integration Points:**

- EvaluationForm component already receives `clinicalCase` prop with `evaluations` array
- CaseDetailLayout uses getActiveEvaluation utility for determining which evaluation to show
- Evaluation types stored as strings in database, validated by TypeScript enums

**Existing System Constraints:**

- Language strategy: English code, Spanish UI (ADR 008)
- Component follows existing tab navigation pattern (activeSection state)
- Voice recorder integration points maintained
- Debounced auto-save pattern preserved for posturogram and pain scale changes

**Similar Code Patterns:**

- Badge rendering: Use conditional className based on type (emerald for INITIAL, blue for FINAL)
- State management: useState for evaluation type, hasStartedDataEntry tracking
- Validation: Helper function pattern (canCreateEvaluationOfType) returns { canCreate: boolean; message?: string }
- Error handling: Toast notifications for validation failures

**Technology Stack Alignment:**

- React 19 with TypeScript for type safety
- Shadcn/UI components (Button, Badge patterns)
- Custom hooks (useDebounce, useUnsavedChanges, useToast)
- Tailwind CSS for conditional styling

**Performance Considerations:**

- Minimal state updates (only evaluation type, hasStartedDataEntry)
- Validation runs synchronously, no async overhead
- Re-renders only on type change or data entry start

# Task Breakdown: Wire Evaluation Callbacks

## Overview

Total Tasks: 12

## Task List

### Parent Component Integration

#### Task Group 1: CaseDetailLayout Callback Wiring

**Dependencies:** None

- [ ] 1.0 Complete CaseDetailLayout callback integration
  - [ ] 1.1 Write 2-3 focused tests for CaseDetailLayout callback handlers
    - Test onSave callback triggers correctly
    - Test onPosturogramChange callback updates state
    - Test onPainScaleChange callback triggers parent re-render
    - Limit to 2-3 highly focused tests maximum
    - Skip exhaustive state testing
  - [ ] 1.2 Implement handleSaveEvaluation callback
    - Call patientsApi.updateEvaluation with evaluation data
    - Manage loading state for parent component
    - Handle errors with toast notifications
    - Reuse pattern from: Cronograma handleFormSubmit
  - [ ] 1.3 Implement handlePosturogramChange callback
    - Call patientsApi.updateEvaluation with posturogram JSON payload
    - Update clinicalCase state to trigger re-renders
    - Handle errors with toast notifications
    - Use existing PosturogramViewer pattern as reference
  - [ ] 1.4 Implement handlePainScaleChange callback
    - Call patientsApi.updateEvaluation with painScale JSON payload
    - Update clinicalCase state to trigger Cronograma pain chart re-render
    - Implement optimistic UI updates with rollback logic
    - Handle errors with toast notifications
  - [ ] 1.5 Pass callbacks to EvaluationForm as props
    - onSave prop receives handleSaveEvaluation
    - onPosturogramChange prop receives handlePosturogramChange
    - onPainScaleChange prop receives handlePainScaleChange
    - Follow existing props interface from EvaluationForm
  - [ ] 1.6 Ensure CaseDetailLayout callback tests pass
    - Run ONLY the 2-3 tests written in 1.1
    - Verify callbacks trigger correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 1.1 pass
- All three callbacks implemented and passed to EvaluationForm
- Parent state updates trigger appropriate child re-renders
- Error handling displays toast notifications

#### Task Group 2: PatientProfile Callback Wiring

**Dependencies:** Task Group 1

- [ ] 2.0 Complete PatientProfile callback integration
  - [ ] 2.1 Write 2-3 focused tests for PatientProfile callback handlers
    - Test onSave callback (when evaluation form is added later)
    - Test onPosturogramChange callback integration
    - Test onPainScaleChange callback integration
    - Limit to 2-3 highly focused tests maximum
    - Skip exhaustive state testing
  - [ ] 2.2 Implement handleSaveEvaluation callback
    - Call patientsApi.updateEvaluation with evaluation data
    - Follow same pattern as CaseDetailLayout implementation
    - Handle errors with toast notifications
  - [ ] 2.3 Implement handlePosturogramChange callback
    - Follow same pattern as CaseDetailLayout implementation
    - Update clinicalCase state for child re-renders
    - Handle errors with toast notifications
  - [ ] 2.4 Implement handlePainScaleChange callback
    - Follow same pattern as CaseDetailLayout implementation
    - Update clinicalCase state for child re-renders
    - Handle errors with toast notifications
  - [ ] 2.5 Prepare callbacks for future EvaluationForm integration
    - Define callback handlers as props interface
    - Ensure type safety with TypeScript
    - Match Prisma schema types for Evaluation
  - [ ] 2.6 Ensure PatientProfile callback tests pass
    - Run ONLY the 2-3 tests written in 2.1
    - Verify callbacks trigger correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 2.1 pass
- All three callbacks implemented in PatientProfile
- Type definitions match EvaluationForm callback interface
- Ready for EvaluationForm integration in future tasks

### Child Component Updates

#### Task Group 3: EvaluationForm Callback Consumption

**Dependencies:** Task Group 1

- [ ] 3.0 Complete EvaluationForm callback wiring
  - [ ] 3.1 Write 2-3 focused tests for EvaluationForm callback usage
    - Test onSave callback is called when save button clicked
    - Test onPosturogramChange callback receives posturogram data
    - Test onPainScaleChange callback receives pain scale data
    - Limit to 2-3 highly focused tests maximum
    - Skip exhaustive component state testing
  - [ ] 3.2 Ensure callback props are properly received
    - Verify onSave prop interface matches parent implementation
    - Verify onPosturogramChange prop interface matches parent implementation
    - Verify onPainScaleChange prop interface matches parent implementation
    - Use TypeScript types from patient.ts
  - [ ] 3.3 Wire debouncedSavePosturogram to onPosturogramChange callback
    - Trigger parent callback when debounced save completes
    - Pass updated posturogram data to parent
    - Maintain existing 300ms debounce behavior
  - [ ] 3.4 Wire debouncedSavePainScale to onPainScaleChange callback
    - Trigger parent callback when debounced save completes
    - Pass updated pain scale data to parent
    - Maintain existing 300ms debounce behavior
  - [ ] 3.5 Wire handleSave to onSave callback
    - Trigger parent callback when explicit save button clicked
    - Pass full evaluation data to parent
    - Maintain existing saveStatus state management
  - [ ] 3.6 Ensure EvaluationForm callback tests pass
    - Run ONLY the 2-3 tests written in 3.1
    - Verify all three callbacks are called correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 3.1 pass
- All three callback props properly consumed
- Debounced saves trigger parent callbacks
- Explicit save button triggers parent callback
- Existing debouncing behavior maintained

#### Task Group 4: PosturogramViewer Callback Consumption

**Dependencies:** Task Group 1

- [ ] 4.0 Complete PosturogramViewer callback wiring
  - [ ] 4.1 Write 2-3 focused tests for PosturogramViewer callback usage
    - Test onPosturogramChange callback is called when markers change
    - Test debounced save triggers callback with correct data
    - Test error handling displays toast notifications
    - Limit to 2-3 highly focused tests maximum
    - Skip exhaustive component state testing
  - [ ] 4.2 Ensure callback prop is properly received
    - Verify onPosturogramChange prop interface matches parent implementation
    - Use TypeScript types from patient.ts (Posturogram)
    - Maintain existing prop interface
  - [ ] 4.3 Wire debouncedSavePosturogram to onPosturogramChange callback
    - Trigger parent callback when debounced save completes
    - Pass updated posturogram JSON to parent
    - Maintain existing 300ms debounce behavior
  - [ ] 4.4 Verify anatomical point changes trigger callback
    - Ensure marker clicks trigger debounced save
    - Ensure deviation type changes trigger debounced save
    - Ensure severity changes trigger debounced save
  - [ ] 4.5 Ensure error handling uses callback correctly
    - Verify failed API calls trigger parent callback
    - Verify toast notifications display on errors
    - Maintain existing error handling pattern
  - [ ] 4.6 Ensure PosturogramViewer callback tests pass
    - Run ONLY the 2-3 tests written in 4.1
    - Verify callback is called correctly on marker changes
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 4.1 pass
- onPosturogramChange prop properly consumed
- All anatomical point changes trigger callback
- Error handling displays toast notifications
- Existing debouncing behavior maintained

### Cross-Component State Updates

#### Task Group 5: Pain Chart Real-time Updates

**Dependencies:** Task Groups 1, 3

- [ ] 5.0 Complete pain chart re-render integration
  - [ ] 5.1 Write 2-3 focused tests for pain chart state updates
    - Test pain chart re-renders when pain scale changes
    - Test parent state update triggers Cronograma re-render
    - Test new pain data points appear in chart
    - Limit to 2-3 highly focused tests maximum
    - Skip exhaustive chart rendering testing
  - [ ] 5.2 Verify handlePainScaleChange updates parent state
    - Ensure clinicalCase state is updated with new painScale
    - Ensure Cronograma receives updated data
    - Verify PainTrendChart re-renders with new data
    - Use React state for real-time updates
  - [ ] 5.3 Test cross-component data flow
    - Verify pain scale change in EvaluationForm reaches PainTrendChart
    - Verify no manual refresh needed
    - Verify optimistic updates display immediately
  - [ ] 5.4 Ensure rollback logic works correctly
    - Verify error reverts to previous state
    - Verify toast notification displays on error
    - Verify pain chart shows original data after rollback
  - [ ] 5.5 Ensure pain chart update tests pass
    - Run ONLY the 2-3 tests written in 5.1
    - Verify pain chart updates in real-time
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 5.1 pass
- Pain chart updates in real-time when pain scale changes
- Cross-component data flow works correctly
- Rollback logic functions on errors
- No manual refresh needed for chart updates

### Error Handling and User Feedback

#### Task Group 6: Toast Notification Integration

**Dependencies:** Task Groups 1-5

- [ ] 6.0 Complete error handling and feedback integration
  - [ ] 6.1 Write 2-3 focused tests for error handling
    - Test toast notifications display on save success
    - Test toast notifications display on save errors
    - Test toast notifications display on posturogram changes
    - Limit to 2-3 highly focused tests maximum
    - Skip exhaustive error scenario testing
  - [ ] 6.2 Verify all callbacks use useToast hook
    - Ensure handleSaveEvaluation calls toast() on success
    - Ensure handleSaveEvaluation calls toast() on error
    - Ensure handlePosturogramChange calls toast() on error
    - Ensure handlePainScaleChange calls toast() on error
  - [ ] 6.3 Verify loading states disable interactions
    - Ensure save buttons disabled during API calls
    - Ensure form inputs disabled during saving (if applicable)
    - Prevent duplicate API calls with debounce
  - [ ] 6.4 Verify rollback displays error toasts
    - Ensure optimistic updates revert on error
    - Ensure error message is user-friendly
    - Avoid technical details in error messages
  - [ ] 6.5 Ensure error handling tests pass
    - Run ONLY the 2-3 tests written in 6.1
    - Verify toast notifications display correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 6.1 pass
- All callbacks display toast notifications
- Loading states prevent duplicate actions
- Rollback logic shows user-friendly errors
- Global exception filter handles errors consistently

### Testing

#### Task Group 7: Test Review & Integration Testing

**Dependencies:** Task Groups 1-6

- [ ] 7.0 Review and run integration tests
  - [ ] 7.1 Review tests from Task Groups 1-6
    - Review 2-3 tests from CaseDetailLayout (Task 1.1)
    - Review 2-3 tests from PatientProfile (Task 2.1)
    - Review 2-3 tests from EvaluationForm (Task 3.1)
    - Review 2-3 tests from PosturogramViewer (Task 4.1)
    - Review 2-3 tests from pain chart updates (Task 5.1)
    - Review 2-3 tests from error handling (Task 6.1)
    - Total existing tests: approximately 12-18 tests
  - [ ] 7.2 Analyze test coverage gaps for callback wiring
    - Identify critical callback workflows that lack test coverage
    - Focus ONLY on gaps related to callback integration
    - Prioritize parent-child communication scenarios
    - Focus on optimistic update and rollback scenarios
  - [ ] 7.3 Write up to 6 additional strategic tests maximum
    - Add maximum of 6 new tests to fill identified critical gaps
    - Focus on integration points between components
    - Test edge cases in callback error handling
    - Do NOT write comprehensive coverage for all scenarios
  - [ ] 7.4 Run feature-specific tests only
    - Run ONLY tests related to callback wiring (tests from 1.1-7.3)
    - Expected total: approximately 18-24 tests maximum
    - Verify critical callback workflows pass
  - [ ] 7.5 Manual testing of callback flows
    - Test onSave callback in CaseDetailLayout with real data
    - Test onPosturogramChange callback updates UI correctly
    - Test onPainScaleChange callback updates pain chart in real-time
    - Verify no console errors during callback execution

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 18-24 tests total)
- Critical callback workflows are covered
- No more than 6 additional tests added when filling in testing gaps
- Manual testing confirms callbacks work as expected
- Cross-component updates function correctly

## Execution Order

Recommended implementation sequence:

1. Task Group 1: CaseDetailLayout Callback Wiring (parent integration)
2. Task Group 2: PatientProfile Callback Wiring (parent integration)
3. Task Group 3: EvaluationForm Callback Consumption (child component)
4. Task Group 4: PosturogramViewer Callback Consumption (child component)
5. Task Group 5: Pain Chart Real-time Updates (cross-component integration)
6. Task Group 6: Toast Notification Integration (error handling)
7. Task Group 7: Test Review & Integration Testing (verification)

This order ensures parent components are ready before child components consume callbacks, then validates cross-component integration.

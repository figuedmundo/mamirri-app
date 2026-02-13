# Task Breakdown: AI Feedback Loop (Like/Dislike Buttons)

## Overview

Total Tasks: 5 task groups, ~25 sub-tasks

## Task List

### Database Layer

#### Task Group 1: Prisma Models & Migration

**Dependencies:** None

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 4 focused tests for AiAnalysis and AiFeedback models
  - [x] 1.2 Add `AiAnalysis` model to Prisma schema
  - [x] 1.3 Add `AiFeedback` model to Prisma schema
  - [x] 1.4 Run Prisma migration
  - [x] 1.5 Ensure database layer tests pass

**Acceptance Criteria:**

- The 4 tests pass
- Both tables created with correct columns, types, and constraints
- Unique constraint on `[aiAnalysisId, suggestionIndex]` enforced
- Cascade deletes work through the chain: ClinicalCase → AiAnalysis → AiFeedback

---

### Backend - Analysis Persistence

#### Task Group 2: Persist Analysis Results

**Dependencies:** Task Group 1

- [x] 2.0 Complete analysis persistence
  - [x] 2.1 Write 3 focused tests for analysis persistence
  - [x] 2.2 Add `analysisId` to backend interfaces and DTOs
  - [x] 2.3 Modify `AiAnalysisService.analyzeCase()` to persist results
  - [x] 2.4 Ensure persistence tests pass

**Acceptance Criteria:**

- The 3 tests pass
- Every `analyzeCase()` call creates a new `AiAnalysis` row
- Response includes `metadata.analysisId` string field
- Response shape is otherwise identical to before (backward compatible)
- Persistence failure is gracefully handled

---

### Backend - Feedback API

#### Task Group 3: Feedback Endpoints

**Dependencies:** Task Group 2

- [x] 3.0 Complete feedback API
  - [x] 3.1 Write 5 focused tests for feedback endpoints
  - [x] 3.2 Create feedback DTOs
  - [x] 3.3 Add feedback service methods to `AiAnalysisService`
  - [x] 3.4 Add feedback endpoints to `AiAnalysisController`
  - [x] 3.5 Ensure feedback API tests pass

**Acceptance Criteria:**

- The 5 tests pass
- Upsert creates or updates correctly based on unique constraint
- Delete returns 204 and removes the record
- 403 returned for unauthorized access
- 404 returned for nonexistent analysis
- Swagger docs render correctly for new endpoints

---

### Frontend

#### Task Group 4: API Client, Hook & UI Components

**Dependencies:** Task Group 3

- [x] 4.0 Complete frontend implementation
  - [x] 4.1 Write 6 focused tests for feedback UI
  - [x] 4.2 Add `analysisId` to frontend types
  - [x] 4.3 Add API client methods to `aiAnalysisApi`
  - [x] 4.4 Create `useSuggestionFeedback` hook
  - [x] 4.5 Extend `SuggestionCard` with feedback buttons
  - [x] 4.6 Add optional dislike comment textarea
  - [x] 4.7 Wire `AnalysisResultsPanel` to pass feedback props
  - [x] 4.8 Ensure frontend tests pass

**Acceptance Criteria:**

- The 6 tests pass
- Feedback buttons render on every SuggestionCard when analysisId is present
- Toggle behavior works: tap to activate, tap again to deselect, tap opposite to switch
- Comment textarea appears only on Dislike, disappears on Like/Neutral
- Optimistic updates feel instant, API failures revert with toast
- Touch targets are at least 44x44px
- No visual regressions on existing SuggestionCard layout

---

### Testing

#### Task Group 5: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-4

- [x] 5.0 Review existing tests and fill critical gaps
  - [x] 5.1 Review all tests from Task Groups 1-4
  - [x] 5.2 Identify critical workflow gaps
  - [x] 5.3 Write up to 6 additional tests to fill critical gaps
  - [x] 5.4 Run all feature-specific tests

**Acceptance Criteria:**

- All ~24 feature-specific tests pass
- Critical end-to-end feedback workflow is covered
- No more than 6 additional tests added
- Testing scoped exclusively to AI feedback loop feature

---

## Execution Order

Recommended implementation sequence:

1. **Database Layer** (Task Group 1) — Models and migration, no dependencies
2. **Analysis Persistence** (Task Group 2) — Requires models from Group 1
3. **Feedback API** (Task Group 3) — Requires persistence from Group 2
4. **Frontend** (Task Group 4) — Requires API from Group 3
5. **Test Review** (Task Group 5) — Requires all groups complete

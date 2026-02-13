# Task Breakdown: AI Suggestions UI (Cards & Citations)

## Overview

Total Tasks: 14
Feature Type: Frontend-only (no backend, no database, no API changes)
All work is in `apps/client/src/`

## Task List

### Frontend — Core Wiring

#### Task Group 1: Dialog Integration (CaseDetailLayout ↔ AnalysisResultsPanel)

**Dependencies:** None

- [x] 1.0 Complete dialog wiring between CaseDetailLayout and AnalysisResultsPanel
  - [x] 1.1 Write 4 focused tests for dialog wiring
  - [x] 1.2 Add analysis state to CaseDetailLayout
  - [x] 1.3 Wire onAnalysisComplete callback to open dialog
  - [x] 1.4 Render AnalysisResultsPanel in CaseDetailLayout
  - [x] 1.5 Ensure dialog wiring tests pass

**Acceptance Criteria:**

- Clicking "Analizar con IA" triggers the API, and the dialog opens with results
- Closing the dialog does not discard the results (kept in state)
- The `console.log` placeholder is removed
- The 4 tests from 1.1 pass

### Frontend — Component Enhancements

#### Task Group 2: Sub-Component Polish & UX Improvements

**Dependencies:** Task Group 1

- [x] 2.0 Complete component enhancements
  - [x] 2.1 Write 4 focused tests for component enhancements
  - [x] 2.2 Display citation author in CitationsSection
  - [x] 2.3 Add warning banners to AnalysisResultsPanel
  - [x] 2.4 Add re-open results state to AnalyzeButton
  - [x] 2.5 Add retry affordance on error
  - [x] 2.6 Ensure iPad-responsive dialog
  - [x] 2.7 Ensure component enhancement tests pass

**Acceptance Criteria:**

- Citations display: "Manual de Fisioterapia — Kapandji, p. 142"
- Warning banners appear in amber when backend returns warnings
- "Ver resultados" button allows re-opening without re-analyzing
- "Reintentar" button appears after analysis failure
- Dialog is usable on iPad without overflow or tiny touch targets
- The 4 tests from 2.1 pass

### Testing

#### Task Group 3: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-2

- [x] 3.0 Review existing tests and fill critical gaps only
  - [x] 3.1 Review tests from Task Groups 1-2
  - [x] 3.2 Analyze test coverage gaps for this feature only
  - [x] 3.3 Write up to 4 additional strategic tests maximum
  - [x] 3.4 Run feature-specific tests only

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 17-21 tests total)
- Critical user workflows for dialog wiring are covered
- No more than 4 additional tests added
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. Core Dialog Wiring (Task Group 1) — critical path, everything else depends on this
2. Component Enhancements (Task Group 2) — polish and UX improvements
3. Test Review & Gap Analysis (Task Group 3) — final verification

# Task Breakdown: Patient AI Analysis Refinement

## Overview

Total Tasks: 5 Task Groups, 27 Sub-tasks

## Task List

### Backend - Prompt Engineering & Data Aggregation

#### Task Group 1: System Prompt, SOAP Decomposition & Response Schema

**Dependencies:** None

- [x] 1.0 Complete prompt engineering and data aggregation layer
  - [x] 1.1 Write 4–6 focused tests for prompt building and data aggregation
    - Test that SOAP sections are decomposed into separate query strings (not a raw JSON dump)
    - Test that the therapist's Análisis section is included in the user prompt as collaborative context
    - Test that RAG chunks are limited to 5 and ordered by relevance (highest first and last)
    - Test that the system prompt JSON schema includes new fields (followUpQuestions, redFlags, differentialDiagnosis, confidenceJustification, summary)
  - [x] 1.2 Implement SOAP-aware query decomposition in DataAggregationService
    - Add transformation logic in `data-aggregation.service.ts` to split the latest evaluation into structured SOAP sections (Subjetivo, Objetivo, Análisis, Plan)
    - Each section becomes a separate data object passed to the prompt builder instead of a raw `JSON.stringify` dump
    - Reuse existing `aggregateCaseData` method — add decomposition as a post-processing step
  - [x] 1.3 Extend PromptBuilderService with SOAP-aware query methods
    - Modify `buildDiagnosisQuery` to accept decomposed SOAP sections and produce targeted symptom/finding queries
    - Update `buildTreatmentQuery` and `buildContraindicationsQuery` to use structured SOAP data
    - Add therapist's Análisis section as collaborative context in `buildUserPrompt`
  - [x] 1.4 Restructure system prompt for multi-perspective analysis
    - Rewrite `AI_ANALYSIS_SYSTEM_PROMPT` in `constants/system-prompts.ts` to cover Diagnosis, Treatment, and Safety perspectives
    - Preserve Chain-of-Thought approach but restructure steps for the new perspectives
    - Add instructions for: follow-up question generation (2–3 questions when data gaps detected), differential diagnosis reasoning (2–3 alternatives), red flag detection (cauda equina, fracture signs, cardiac, neurological), grounded confidence calibration, and layered response (summary + detail)
    - Add strict citation rules: exact quote, document title, author, page number — or "no supporting literature found"
    - Maintain Spanish-language output throughout all sections
  - [x] 1.5 Update JSON output schema in system prompt
    - Add `followUpQuestions[]` with fields: question, reason, soapSection
    - Add `redFlags[]` with fields: flag, urgency, recommendedAction
    - Add `differentialDiagnosis[]` with fields: condition, supportingEvidence, contradictingEvidence
    - Add `confidenceJustification` with fields: literatureSupport, clinicalAlignment, limitingFactors[]
    - Add `summary` field (2–3 sentence overview)
    - Keep existing fields (primarySuggestion, alternatives, citations, reasoning, metadata) unchanged
  - [x] 1.6 Implement RAG chunk optimization
    - Reduce maximum chunks from 8 to 5 in the service orchestration
    - Reorder chunks: highest-relevance at positions 1 and 5 (edges), lower-relevance in positions 2–4
    - Improve chunk labeling with source metadata (document title, section, page) in `formatRagContext`
  - [x] 1.7 Ensure prompt engineering tests pass
    - Run ONLY the 4–6 tests written in 1.1
    - Verify SOAP decomposition produces correct query structure
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 4–6 tests written in 1.1 pass
- SOAP data is decomposed into per-section queries (not raw JSON dump)
- System prompt covers Diagnosis, Treatment, and Safety perspectives with CoT preserved
- JSON output schema includes all new fields
- RAG chunks limited to 5 with edge-priority ordering
- Therapist's Análisis is included as collaborative context
- All prompt content remains in Spanish

### Backend - API Layer

#### Task Group 2: Analysis Persistence Endpoint

**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 2.0 Complete API persistence layer
  - [x] 2.1 Write 3–4 focused tests for GET endpoint
    - Test that GET `/api/v1/ai/cases/:caseId/analyses/latest` returns the most recent analysis for a case
    - Test that the endpoint returns 404 when no analysis exists for the case
    - Test that proper authentication/authorization is enforced (therapist can only access their own cases)
  - [x] 2.2 Add `findLatestByCaseId` method to AiAnalysisService
    - Query `ai_analyses` table for the most recent analysis by `clinicalCaseId`, ordered by `createdAt` desc, limit 1
    - Return the full `result` JSON along with analysis metadata (id, createdAt)
    - Follow existing Prisma query patterns in the service
  - [x] 2.3 Add GET endpoint to AiAnalysisController
    - Route: `GET /cases/:caseId/analyses/latest`
    - Follow existing endpoint patterns in `ai-analysis.controller.ts`
    - Add appropriate Swagger decorators matching existing endpoint documentation style
    - Return 200 with analysis data or 404 if none exists
    - Apply existing auth guards and therapist ownership validation
  - [x] 2.4 Ensure API persistence tests pass
    - Run ONLY the 3–4 tests written in 2.1
    - Verify the endpoint returns correct data
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3–4 tests written in 2.1 pass
- GET endpoint returns the latest analysis for a given case
- Returns 404 when no analysis exists
- Authentication and authorization enforced consistently with existing endpoints
- Response follows existing API response format conventions

### Frontend - Types & Data Layer

#### Task Group 3: Type Extension, API Client & Hooks

**Dependencies:** Task Groups 1 and 2

- [x] 3.0 Complete frontend data layer
  - [x] 3.1 Write 3–4 focused tests for data layer changes
    - Test that `useLatestAnalysis` hook fetches persisted analysis on mount when caseId is provided
    - Test that analysis state persists across simulated navigation (not lost in useState)
    - Test that the AnalysisResult type accepts new fields without breaking existing field access
  - [x] 3.2 Extend AnalysisResult type in `types/analysis.ts`
    - Add `followUpQuestions?: FollowUpQuestion[]` with fields: question, reason, soapSection
    - Add `redFlags?: RedFlag[]` with fields: flag, urgency, recommendedAction
    - Add `confidenceJustification?: ConfidenceJustification` with fields: literatureSupport, clinicalAlignment, limitingFactors[]
    - Add `differentialDiagnosis?: DifferentialDiagnosis[]` with fields: condition, supportingEvidence, contradictingEvidence
    - Add `summary?: string`
    - All new fields are optional to handle responses from the pre-update prompt gracefully
  - [x] 3.3 Add API client method for GET endpoint
    - Add `getLatestAnalysis(caseId: string)` to `api/ai-analysis.ts`
    - Follow existing API client patterns in the file
  - [x] 3.4 Create `useLatestAnalysis` TanStack Query hook
    - Use `useQuery` with the new `getLatestAnalysis` API method
    - Use `enabled` flag to fetch only when caseId is available
    - Set appropriate `staleTime` to avoid re-fetching on tab switches within the same case
    - Follow patterns from existing `use-ai-analysis.ts` hooks
  - [x] 3.5 Refactor analysis state management in CaseDetailLayout
    - Replace `useState<AnalysisResult | null>(null)` with the new `useLatestAnalysis` hook
    - Load persisted analysis automatically when opening a case that has one
    - Update `AnalyzeButton` to check for persisted results on mount (not only in-session results)
    - Ensure new analysis runs still update the displayed result (invalidate query cache on new POST)
  - [x] 3.6 Ensure frontend data layer tests pass
    - Run ONLY the 3–4 tests written in 3.1
    - Verify persisted analysis loads on case open
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3–4 tests written in 3.1 pass
- AnalysisResult type includes all new optional fields
- Persisted analysis loads automatically when opening a case
- Analysis survives page navigation and browser refresh
- New analysis runs update the displayed result via cache invalidation
- TanStack Query caching prevents unnecessary re-fetches

### Frontend - UI Components

#### Task Group 4: Analysis Results Panel Enhancements

**Dependencies:** Task Group 3

- [x] 4.0 Complete UI component enhancements
  - [x] 4.1 Write 3–5 focused tests for new UI sections
    - Test that red flags section renders above all other results when redFlags array is non-empty
    - Test that red flags section is hidden when redFlags is empty or undefined
    - Test that follow-up questions section renders with question text and SOAP section context
    - Test that summary is displayed as the first content in the results panel
  - [x] 4.2 Add summary section to AnalysisResultsPanel
    - Display the 2–3 sentence summary at the top of the results panel as a quick overview
    - Style as a distinct introductory block before the detailed sections
    - Gracefully handle missing summary (hide section if undefined)
  - [x] 4.3 Build RedFlagsSection component
    - Render prominently above all other results when red flags are present
    - Each red flag displays: flag description, urgency level (badge), and recommended action
    - Use appropriate visual urgency (color, icon) — leverage existing Shadcn/UI `Badge` and `Card` components
    - Hide entirely when no red flags detected (not "none found")
    - Follow existing section component pattern from `CitationsSection` / `PatternRecognitionSection`
  - [x] 4.4 Build FollowUpQuestionsSection component
    - Render 2–3 follow-up questions with reason and related SOAP section tag
    - Each question is a clear, actionable clinical prompt
    - Follow existing section component pattern
    - Hide when no follow-up questions present
  - [x] 4.5 Build DifferentialDiagnosisSection component
    - Display 2–3 alternative conditions considered with supporting and contradicting evidence
    - Use a card-based layout for each condition, similar to existing `SuggestionCard` pattern
    - Hide when no differential diagnosis data present
  - [x] 4.6 Add confidence justification to suggestion display
    - Make confidence score expandable — collapsed by default showing only the numeric score
    - Expanded view shows: literature support count, clinical alignment description, and limiting factors list
    - Integrate within existing suggestion rendering (primarySuggestion and alternatives)
  - [x] 4.7 Ensure UI component tests pass
    - Run ONLY the 3–5 tests written in 4.1
    - Verify all new sections render correctly with sample data
    - Verify sections hide gracefully when data is absent
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**

- The 3–5 tests written in 4.1 pass
- Red flags render prominently above other results when present, hidden when absent
- Follow-up questions display with clinical context and SOAP section tags
- Differential diagnosis shows alternatives with evidence for/against
- Confidence justification is expandable with supporting detail
- Summary provides a quick 2–3 sentence overview at the top
- All new sections follow existing component patterns and Shadcn/UI primitives
- Responsive design maintained across mobile, tablet, and desktop

### Testing

#### Task Group 5: Test Review & Gap Analysis

**Dependencies:** Task Groups 1–4

- [x] 5.0 Review existing tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 1–4
    - Review the 4–6 tests from Task Group 1 (prompt engineering)
    - Review the 3–4 tests from Task Group 2 (API persistence)
    - Review the 3–4 tests from Task Group 3 (frontend data layer)
    - Review the 3–5 tests from Task Group 4 (UI components)
    - Total existing tests: approximately 13–19 tests
  - [x] 5.2 Analyze test coverage gaps for this feature only
    - Identify critical workflows that lack coverage (e.g., end-to-end: trigger analysis → receive enriched response → persist → reload on navigation)
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
  - [x] 5.3 Write up to 8 additional strategic tests maximum
    - Focus on integration points: prompt builder + data aggregation working together, GET endpoint returning data that matches frontend type expectations
    - Test the full analysis persistence flow: POST creates → GET retrieves → frontend displays
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [x] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (from groups 1–4 plus 5.3)
    - Expected total: approximately 21–27 tests maximum
    - Do NOT run the entire application test suite
    - Verify all critical workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 21–27 tests total)
- Critical user workflows for this feature are covered
- No more than 8 additional tests added when filling gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. **Backend: Prompt Engineering & Data Aggregation** (Task Group 1) — in parallel with →
2. **Backend: API & Persistence** (Task Group 2)
3. **Frontend: Types, Hooks & API Client** (Task Group 3) — after Groups 1 & 2
4. **Frontend: UI Components** (Task Group 4) — after Group 3
5. **Testing: Review & Gap Analysis** (Task Group 5) — after Groups 1–4

> **Note:** Task Groups 1 and 2 have no dependencies on each other and can be implemented in parallel by different engineers or agents.

# Task Breakdown: AI Orchestration (Voice + Vision + RAG + LLM)

## Overview

Total Tasks: 28

## Task List

### Backend Orchestration

#### Task Group 1: Extend AiAnalysisService with Multi-Modal Aggregation

**Dependencies:** None (extends existing AiAnalysisService)

- [x] 1.0 Complete backend orchestration layer
  - [x] 1.1 Write 6 focused tests for multi-modal data aggregation
    - Test fetching all evaluations for a case
    - Test querying last 3 treatment sessions
    - Test retrieving Vision findings from evaluation records
    - Test collecting voice transcripts from voiceNotes arrays
    - Test data aggregation with missing/empty data
    - Test parallel data fetching performance
  - [x] 1.2 Create DataAggregationService
    - Method: aggregateCaseData(caseId: string) returns CaseDataAggregate
    - Fetch evaluations: all types (INITIAL, PROGRESS, FINAL)
    - Fetch sessions: last 3 ordered by date DESC
    - Extract Vision findings: posturogramResults, footprintResults JSON fields
    - Collect voice notes: flatten voiceNotes arrays from evaluations and sessions
    - Handle missing data gracefully (empty arrays, null fields)
    - Reuse pattern from AiAnalysisService.loadClinicalCase()
  - [x] 1.3 Create types/interfaces for aggregated data
    - CaseDataAggregate interface with evaluations, sessions, visionFindings, voiceTranscripts
    - VisionFinding interface (type, findings[], confidence)
    - VoiceNote interface (transcript, timestamp, source)
  - [x] 1.4 Extend AiAnalysisService.analyzeCase() to accept aggregated data
    - Add optional visionFindings parameter
    - Add optional voiceTranscripts parameter
    - Update prompt building to include new data sources
    - Ensure backward compatibility (existing calls still work)
  - [x] 1.5 Update PromptBuilderService
    - Add buildVisionContext(visionFindings) method
    - Add buildVoiceContext(voiceTranscripts) method
    - Update buildUserPrompt() to accept and include vision/voice context
    - Format vision findings as structured summary
    - Format voice transcripts as excerpt list
  - [x] 1.6 Ensure backend orchestration tests pass
    - Run ONLY the 6 tests written in 1.1
    - Verify data aggregation works with mock Prisma responses
    - Verify prompt building includes all context sources

**Acceptance Criteria:**

- The 6 tests written in 1.1 pass
- DataAggregationService fetches all required data sources
- AiAnalysisService accepts and processes vision/voice data
- Prompts include multi-modal context

---

### API Layer

#### Task Group 2: API Endpoint for Case Analysis

**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer
  - [x] 2.1 Write 5 focused tests for analysis endpoint
    - Test successful analysis with complete data
    - Test analysis with missing vision data (graceful degradation)
    - Test analysis with insufficient evaluations (button disabled scenario)
    - Test unauthorized access (different therapist)
    - Test error handling when LLM service unavailable
  - [x] 2.2 Extend AiAnalysisController
    - Add POST /api/v1/ai/cases/:caseId/analyze endpoint
    - Reuse existing POST /api/v1/ai/analysis pattern
    - Accept caseId from URL parameter
    - Validate case exists and belongs to authenticated therapist
    - Call DataAggregationService to gather context
    - Call AiAnalysisService.analyzeCase() with aggregated data
    - Return AnalysisResultDto response
  - [x] 2.3 Update AnalyzeCaseDto if needed
    - Add optional fields for vision/voice data (if passing in body)
    - Or remove if using URL parameter approach
    - Ensure Swagger documentation is accurate
  - [x] 2.4 Add response DTO for multi-modal analysis
    - Extend AnalysisResultDto or create new OrchestratedAnalysisResultDto
    - Add serviceStatus field to metadata (which services contributed)
    - Add warnings array for degradation messages
  - [x] 2.5 Implement authentication/authorization
    - Use existing JwtAuthGuard
    - Verify therapist owns the case via patient.therapistId check
    - Reuse pattern from existing analyzeCase endpoint
  - [x] 2.6 Add error handling and status codes
    - 200: Successful analysis
    - 400: Insufficient data (no evaluations)
    - 403: Unauthorized access
    - 404: Case not found
    - 503: AI service temporarily unavailable
    - Include warning headers for partial results
  - [x] 2.7 Ensure API layer tests pass
    - Run ONLY the 5 tests written in 2.1
    - Verify endpoint accepts requests and returns AnalysisResultDto
    - Verify authorization blocks unauthorized access

**Acceptance Criteria:**

- The 5 tests written in 2.1 pass
- POST /api/v1/ai/cases/:caseId/analyze endpoint works
- Proper authorization enforced
- Returns proper status codes and error messages
- Response includes service status metadata

---

### Frontend Components

#### Task Group 3: "Analyze with AI" Button Integration

**Dependencies:** Task Group 2

- [x] 3.0 Complete button integration
  - [x] 3.1 Write 4 focused tests for AnalyzeButton component
    - Test button renders when evaluations exist
    - Test button disabled when no evaluations
    - Test click triggers API call
    - Test loading state during analysis
  - [x] 3.2 Create AnalyzeButton component
    - Props: caseId, evaluationCount, onAnalysisComplete, onError
    - Use Shadcn Button with Sparkles icon
    - Show "Analyze with AI" label (or icon-only on mobile)
    - Disabled state: when evaluationCount < 1
    - Loading state: spinner + "Analyzing..." text
    - Success state: brief checkmark, then reset
    - Error state: shake animation or error tooltip
  - [x] 3.3 Add API integration hook
    - Create useCaseAnalysis(caseId) hook
    - Method: analyzeCase() returns Promise<AnalysisResult>
    - Handle loading, error, and success states
    - Use existing fetch pattern from codebase
  - [x] 3.4 Integrate button into CaseDetailLayout
    - Add to header actions area (near existing buttons)
    - Pass evaluation count from clinicalCase.evaluations.length
    - Wire onAnalysisComplete to open results panel
    - Wire onError to show toast notification
    - Follow existing button placement patterns
  - [x] 3.5 Add toast notifications
    - Success: "Analysis complete" with view button
    - Error: "Analysis failed" with retry button
    - Warning: "Partial results available" if degraded
    - Reuse existing toast hook from codebase
  - [x] 3.6 Ensure button integration tests pass
    - Run ONLY the 4 tests written in 3.1
    - Verify button renders correctly
    - Verify click triggers analysis flow

**Acceptance Criteria:**

- The 4 tests written in 3.1 pass
- Button appears in CaseDetailLayout header
- Button disabled when <1 evaluation
- Click triggers API call and shows loading state
- Toasts display on success/error

---

#### Task Group 4: AI Suggestions Display Panel

**Dependencies:** Task Group 3

- [x] 4.0 Complete suggestions UI
  - [x] 4.1 Write 6 focused tests for suggestions display
    - Test panel renders with analysis results
    - Test pattern recognized section displays
    - Test suggestion cards render with all types
    - Test citations expand/collapse
    - Test confidence badges show correct colors
    - Test empty/warning states display correctly
  - [x] 4.2 Create AnalysisResultsPanel component
    - Props: analysisResult, onClose, onRetry
    - Use Sheet or Dialog from Shadcn for slide-out panel
    - Full-height panel on desktop, modal on mobile
    - Close button in header
    - Scrollable content area
  - [x] 4.3 Create PatternRecognitionSection component
    - Display: "Pattern Recognized" heading
    - Show patternRecognized text
    - List supportingEvidence as bullet points
    - Use subtle card background
  - [x] 4.4 Create SuggestionCard component
    - Props: suggestion (type, content, confidence, rationale)
    - Type badge: diagnostic_hypothesis (blue), treatment_protocol (green), contraindication (amber)
    - Confidence chip: HIGH (green), MEDIUM (yellow), LOW (orange)
    - Content text with proper typography
    - Rationale in collapsible section or smaller text
    - Border left color based on type
  - [x] 4.5 Create CitationsSection component
    - Props: citations array
    - Each citation: book title, page number, relevance percentage
    - Expandable quote section
    - Sort by relevance descending
    - Use book/quote icons from Lucide
  - [x] 4.6 Create ServiceStatusIndicator component
    - Props: serviceStatus object
    - Green dot: all services operational
    - Yellow dot: partial (some services degraded)
    - Red dot: analysis failed
    - Tooltip on hover showing service breakdown
  - [x] 4.7 Create AnalysisDisclaimer component
    - Fixed footer in panel
    - Text: "AI-generated suggestion. Clinical judgment required."
    - Timestamp: "Generated at [time]"
    - Subtle styling (muted text, smaller font)
  - [x] 4.8 Apply styling and responsive design
    - Follow Shadcn/UI design system
    - Use existing color variables
    - Mobile: full-screen modal
    - Tablet: 2/3 width sheet
    - Desktop: 50% width sheet
    - Max-width: 800px for readability
  - [x] 4.9 Add loading and empty states
    - Loading: skeleton cards (3), pulsing animation
    - Empty: "No analysis available" with analyze button
    - Error: retry button with error message
  - [x] 4.10 Ensure suggestions UI tests pass
    - Run ONLY the 6 tests written in 4.1
    - Verify all components render correctly
    - Verify interactions work (expand, close)

**Acceptance Criteria:**

- The 6 tests written in 4.1 pass
- Panel displays pattern recognition, suggestions, citations
- Cards show correct badges and confidence levels
- Citations are expandable and sorted by relevance
- Service status indicator shows degradation state
- Disclaimer visible at bottom
- Responsive on all screen sizes

---

### Testing & Integration

#### Task Group 5: Integration and End-to-End Testing

**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete integration testing
  - [x] 5.1 Review all tests from Task Groups 1-4
    - Review 6 backend tests (1.1)
    - Review 5 API tests (2.1)
    - Review 4 button tests (3.1)
    - Review 6 UI tests (4.1)
    - Total existing: 21 tests
  - [x] 5.2 Write 8 additional integration tests
    - Test complete flow: button click → API call → results display
    - Test with real case data (integration with Prisma)
    - Test graceful degradation (mock RAG failure)
    - Test anonymization (verify PII not in LLM prompt)
    - Test response time <2.5 seconds
    - Test concurrent analysis requests (race conditions)
    - Test vision findings included in analysis context
    - Test voice transcripts included in analysis context
  - [x] 5.3 Add error scenario tests
    - Test when KnowledgeBaseService unavailable
    - Test when Gemini API rate limited
    - Test when case has no evaluations (button disabled)
    - Test when user unauthorized (403 response)
  - [x] 5.4 Run feature-specific test suite
    - Run all 29 tests (21 + 8)
    - Verify critical workflows pass
    - Verify no regressions in existing AiAnalysisService tests
  - [x] 5.5 Performance validation
    - Measure response time for 10 analysis requests
    - Verify average <2.5 seconds
    - Verify 95th percentile <3 seconds
    - Log timing breakdown

**Acceptance Criteria:**

- All 29 feature-specific tests pass
- Critical end-to-end workflows covered
- Response time targets met (<2.5s average)
- Error scenarios handled gracefully
- No regressions in existing functionality

---

## Execution Order

Recommended implementation sequence:

1. **Backend Orchestration (Task Group 1)**
   - Foundation for all other tasks
   - Extends existing AiAnalysisService
   - No frontend dependencies

2. **API Layer (Task Group 2)**
   - Exposes backend functionality via HTTP
   - Required for frontend integration
   - Can be tested independently

3. **Frontend Button (Task Group 3)**
   - User entry point for feature
   - Depends on API endpoint
   - Simple UI component

4. **Suggestions Display (Task Group 4)**
   - Depends on button to trigger
   - More complex UI components
   - Can be developed in parallel with button after API exists

5. **Integration Testing (Task Group 5)**
   - Validates complete feature
   - Finds integration gaps
   - Performance validation

---

## Key Implementation Notes

### Performance Targets

- Data aggregation: <100ms (DB queries)
- RAG retrieval: <500ms (parallel queries)
- LLM synthesis: <1500ms (with retry)
- Total response: <2500ms (target), <3000ms (max)

### Data Flow

```
User clicks "Analyze" →
  DataAggregationService.fetch() →
    [evaluations, sessions, vision, voice] in parallel →
  AiAnalysisService.analyzeCase() →
    AnonymizerService.anonymize() →
    KnowledgeBaseService.multiQueryRag() [parallel] →
    PromptBuilderService.buildPrompt() →
    Gemini.generateContent() →
    Parse response →
    Return AnalysisResult →
  Display in AnalysisResultsPanel
```

### Graceful Degradation Matrix

| Service | Failure Mode   | Behavior             | UI Indicator                    |
| ------- | -------------- | -------------------- | ------------------------------- |
| RAG     | Timeout        | LLM-only analysis    | Yellow dot: "Limited evidence"  |
| Vision  | No data        | Exclude from context | Yellow dot: "No image analysis" |
| Voice   | No transcripts | Exclude from context | Green dot (optional feature)    |
| LLM     | Timeout/Error  | Return retry option  | Red dot: "Analysis failed"      |

### Reuse Patterns

- Data fetching: Follow AiAnalysisService.loadClinicalCase() pattern
- RAG queries: Reuse KnowledgeBaseService.findSimilar() with Promise.all
- API endpoint: Copy pattern from existing POST /api/v1/ai/analysis
- Button: Use existing Shadcn Button + icon pattern
- Panel: Use Sheet component from Shadcn (like mobile navigation)
- Cards: Follow Card component pattern from Shadcn

### Files to Modify

- `apps/server/src/modules/ai-analysis/services/` - New aggregation service
- `apps/server/src/modules/ai-analysis/ai-analysis.service.ts` - Extend analyzeCase
- `apps/server/src/modules/ai-analysis/services/prompt-builder.service.ts` - Update prompts
- `apps/server/src/modules/ai-analysis/ai-analysis.controller.ts` - New endpoint
- `apps/client/src/components/patients/CaseDetailLayout.tsx` - Add button
- `apps/client/src/components/patients/` - New analysis components

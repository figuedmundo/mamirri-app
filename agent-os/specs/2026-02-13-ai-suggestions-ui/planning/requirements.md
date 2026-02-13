# Spec Requirements: AI Suggestions UI

## Initial Description

**Roadmap Task 15.4:** Frontend: Suggestions UI (cards, citations)

Display AI-generated treatment suggestions and literature citations in the frontend after a therapist clicks "Analyze with IA" on a clinical case. The backend endpoint (`POST /api/v1/ai/cases/:caseId/analyze`) is fully implemented and returns structured data including a primary suggestion, alternatives, citations from medical literature, Chain-of-Thought reasoning, and service status metadata.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the core scope is wiring the existing AnalysisResultsPanel dialog into CaseDetailLayout so it opens when analysis completes, plus polishing the existing sub-components to match the spec from 2026-02-06-ai-orchestration-voice-vision-rag. Is that correct, or do you want a complete redesign of these components?
**Answer:** Wire + polish. No redesign needed. The 6 existing components (`AnalysisResultsPanel`, `SuggestionCard`, `CitationsSection`, `PatternRecognitionSection`, `ServiceStatusIndicator`, `AnalysisDisclaimer`) are well-built and follow codebase conventions. The only gap is the wiring — `CaseDetailLayout` calls `console.log` instead of opening the panel.

**Q2:** The orchestration spec called for suggestion type badges (diagnostic_hypothesis, treatment_protocol, contraindication) on each SuggestionCard. However, the backend SuggestionDto currently has no type field — only title, description, confidence, and reasoning. Should we add a type field to the backend DTO as part of this task, or defer that and work only with what the backend currently returns?
**Answer:** Defer. Work with what the backend returns today. Adding the `type` field requires coordinated backend + LLM prompt changes — a different concern from frontend display. The `title` field already implicitly conveys suggestion type. Ship the UI first, add structured typing later if needed.

**Q3:** The current AnalysisResultsPanel uses a Dialog (modal overlay). The orchestration spec mentioned either a "scrollable panel or modal." Should we keep the dialog or switch to a side panel / dedicated view tab in CaseDetailLayout?
**Answer:** Keep the Dialog (modal). The product's primary user is a 45-60 year old therapist on an iPad. The flow is on-demand: click → review suggestions → close → continue working. This is not a persistent workspace. The dialog fits this mental model. The CaseDetailLayout is already dense, and iPad screen is too narrow for side-by-side panels.

**Q4:** The orchestration spec required graceful degradation UX: a retry button for LLM timeouts and warning indicators when vision findings are missing. The backend already returns metadata.serviceStatus and metadata.warnings. Should we implement these degradation states now?
**Answer:** Yes, include it. Low effort because the data already flows from the backend. Display `warnings[]` as alert banners inside the dialog. Add a retry button on the `useCaseAnalysis` hook's error state. This is ~30 minutes of work and critical for trust — the mission doc says "Mother trusts AI enough to use regularly."

**Q5:** The CitationsSection currently shows quote, documentTitle, pageNumber, and relevance. The backend also returns author and quoteOriginal (English original). Should we display the author and provide a toggle for the English quote?
**Answer:** Show author (adds credibility — therapist recognizes "Kapandji" or "Travell & Simons"). Defer the English original toggle — niche use case, adds UI complexity. Display format: `"Manual de Fisioterapia — Kapandji, p. 142"`. English toggle can come in task 16.7 (Explainability).

**Q6:** Is there anything explicitly excluded from this task?
**Answer:** Excluded:

- 15.5 Like/Dislike feedback (separate roadmap task, requires backend persistence)
- 15.6 End-to-end testing (separate roadmap task)
- Backend DTO changes (type field — different concern, prompt engineering risk)
- Analysis history/persistence (each analysis is ephemeral)
- Export analysis as PDF (roadmap Week 28)
- forceVision toggle in UI (backend supports it but marginal UI value)
- Re-analysis comparison / diff between two analyses (future feature)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: AI Analysis Components — Path: `apps/client/src/components/patients/analysis/`
  - `AnalysisResultsPanel.tsx` — Dialog container with ScrollArea, already imports all sub-components
  - `SuggestionCard.tsx` — Card with border-l-4 accent, confidence badge (HIGH/MEDIUM/LOW)
  - `CitationsSection.tsx` — Collapsible citation items sorted by relevance
  - `PatternRecognitionSection.tsx` — Chain-of-Thought reasoning in indigo-themed box
  - `ServiceStatusIndicator.tsx` — Green/yellow/red dot with tooltip
  - `AnalysisDisclaimer.tsx` — Footer disclaimer with timestamp
- Feature: AnalyzeButton — Path: `apps/client/src/components/patients/AnalyzeButton.tsx`
  - Triggers analysis, manages loading/success states, calls `onAnalysisComplete` callback
- Feature: Case Analysis Hook — Path: `apps/client/src/hooks/use-case-analysis.ts`
  - Manages `isAnalyzing`, `error`, `result` state via `useState`
  - Calls `aiAnalysisApi.analyzeCase(caseId)` and shows error toast on failure
- Feature: AI Analysis API Client — Path: `apps/client/src/api/ai-analysis.ts`
  - `aiAnalysisApi.analyzeCase(caseId)` → `POST /ai/cases/${caseId}/analyze`
- Feature: CaseDetailLayout — Path: `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - Already imports and renders `AnalyzeButton` at line 445
  - Uses `ViewMode` type union for tab switching (`timeline | session-detail | evaluation | objectives | comparison`)
  - `onAnalysisComplete` callback currently only `console.log`s — the wiring gap
- Feature: Frontend Types — Path: `apps/client/src/types/analysis.ts`
  - `AnalysisResult`, `Suggestion`, `Citation`, `Reasoning`, `ServiceStatus`, `AnalysisMetadata` interfaces
  - Mirrors backend `AnalysisResultDto` shape exactly
- Backend: Analysis Result DTO — Path: `apps/server/src/modules/ai-analysis/dto/analysis-result.dto.ts`
  - `AnalysisResultDto` with `primarySuggestion`, `alternatives[]`, `citations[]`, `reasoning`, `metadata`
  - `SuggestionDto`: `{ title, description, confidence: HIGH|MEDIUM|LOW, reasoning? }`
  - `CitationDto`: `{ quote, quoteOriginal?, documentTitle, author, pageNumber?, relevance: 0-1 }`
  - `MetadataDto`: `{ queryTokens, responseTokens, processingTimeMs, anonymizationApplied, translationsApplied, serviceStatus?, warnings?, visionAnalysis? }`
- Backend: Analysis Interfaces — Path: `apps/server/src/modules/ai-analysis/interfaces/analysis.interfaces.ts`

### Follow-up Questions

No follow-up questions were necessary. All scope was clarified in the first round.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A — Design should follow existing Shadcn/UI patterns from the analysis components and CaseDetailLayout. Use the indigo color palette (`text-indigo-600`, `bg-indigo-50`) for AI-related elements as established in `PatternRecognitionSection`.

## Requirements Summary

### Functional Requirements

- Wire `AnalysisResultsPanel` dialog into `CaseDetailLayout` so it opens when analysis completes (`onAnalysisComplete` callback → set state → render dialog)
- Add `isAnalysisOpen` state and `analysisResult` state to `CaseDetailLayout`
- Render `AnalysisResultsPanel` in `CaseDetailLayout` JSX with `isOpen` and `onClose` props
- Display citation `author` in `CitationsSection` alongside documentTitle and pageNumber (format: `"Title — Author, p. X"`)
- Display `metadata.warnings[]` as amber alert banners inside the `AnalysisResultsPanel` dialog when present
- Add a retry button in `AnalysisResultsPanel` or `AnalyzeButton` error state that re-triggers `analyzeCase(caseId)`
- Ensure responsive design works on iPad (primary device) — Dialog max-width and scroll behavior
- Unit tests for the new wiring (dialog opens on analysis complete, closes on dismiss, warnings render, retry works)

### Reusability Opportunities

- All 6 existing analysis components are reusable as-is — only minor polish needed
- `useCaseAnalysis` hook already manages the async state — extend with `clearResult` method
- `aiAnalysisApi` client is ready — no changes needed
- `AnalyzeButton` callback pattern (`onAnalysisComplete`) is already designed for this wiring

### Scope Boundaries

**In Scope:**

- Wiring AnalysisResultsPanel dialog into CaseDetailLayout
- Adding analysis result state management to CaseDetailLayout
- Displaying citation author in CitationsSection
- Displaying metadata.warnings as alert banners
- Adding retry button on error
- iPad-responsive dialog behavior
- Unit tests for wiring and new features

**Out of Scope:**

- Like/Dislike feedback buttons (roadmap task 15.5)
- End-to-end testing with real patient data (roadmap task 15.6)
- Backend DTO changes (adding type field to SuggestionDto)
- Analysis history/persistence (ephemeral by design)
- Export analysis as PDF (roadmap Week 28)
- forceVision toggle exposure in UI
- Re-analysis comparison / diff between analyses
- English original quote toggle (deferred to task 16.7 Explainability)
- Complete redesign of existing analysis components

### Technical Considerations

- CaseDetailLayout needs 2 new state variables: `analysisResult: AnalysisResult | null` and `isAnalysisOpen: boolean`
- The `onAnalysisComplete` callback in AnalyzeButton should set both states
- The `onClose` callback should set `isAnalysisOpen = false` (keep result in state for re-opening)
- CitationsSection needs minor change: display `citation.author` in the header line
- Warnings can use Shadcn's Alert component or a simple styled div matching the amber/yellow pattern from ServiceStatusIndicator
- Retry button can simply re-invoke `analyzeCase(caseId)` from the hook
- Existing test file `AnalysisResultsPanel.test.tsx` has 5 tests — extend with new wiring tests
- iPad viewport: ensure Dialog max-width doesn't overflow on 1024px screens
- All UI text in Spanish (matching existing codebase convention)

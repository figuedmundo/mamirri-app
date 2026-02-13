# Specification: AI Suggestions UI (Cards & Citations)

## Goal

Wire the existing AI analysis dialog and sub-components into the clinical case view so therapists see treatment suggestions with literature citations after clicking "Analizar con IA," and add graceful degradation feedback (warnings, retry) for service failures.

## User Stories

- As a physiotherapist, I want to see AI-generated treatment suggestions after analyzing a clinical case so that I can validate my reasoning with evidence-based recommendations.
- As a physiotherapist, I want to see which medical books and pages support each suggestion so that I can trust the recommendations and reference them in treatment planning.
- As a physiotherapist, I want clear visual feedback when AI services are partially available so that I understand the reliability of the results.

## Specific Requirements

**Wire AnalysisResultsPanel Dialog into CaseDetailLayout**

- Add `analysisResult` state (`AnalysisResult | null`) and `isAnalysisOpen` state (`boolean`) to `CaseDetailLayout`
- Update the existing `AnalyzeButton.onAnalysisComplete` callback to set both states (store result + open dialog)
- Render `AnalysisResultsPanel` in `CaseDetailLayout` JSX, passing `analysisResult`, `isAnalysisOpen`, and an `onClose` handler
- `onClose` sets `isAnalysisOpen = false` but preserves `analysisResult` in state so the dialog can be re-opened without re-analyzing
- Remove the existing `console.log('Analysis result:', result)` placeholder

**Add Re-Open Analysis Button**

- After a successful analysis, provide a way for the therapist to re-open the results dialog without re-triggering the API call
- Add a button or make the existing `AnalyzeButton` show a "Ver resultados" state when `analysisResult` is non-null
- Clicking re-opens the `AnalysisResultsPanel` with the cached result

**Display Metadata Warnings as Alert Banners**

- When `analysisResult.metadata.warnings` array is non-empty, render amber alert banners inside the dialog header area
- Each warning string renders as a single-line banner with an `AlertTriangle` (Lucide) icon
- Use amber color scheme consistent with the yellow state in `ServiceStatusIndicator` (`bg-amber-50 text-amber-800 border-amber-200`)
- Banners appear between the dialog header and the `PatternRecognitionSection`

**Add Retry on Error**

- When `useCaseAnalysis` hook returns an `error`, show a retry affordance in the `AnalyzeButton` component
- The retry button re-invokes `analyzeCase(caseId)` — same flow as initial analysis
- Show the error toast (already implemented) and additionally display an inline retry hint near the button

**Display Citation Author**

- Update `CitationsSection` to show the `author` field from each `Citation` object
- Display format in the collapsible header: `"{documentTitle} — {author}, p. {pageNumber}"`
- If `author` is missing or empty, fall back to showing only `documentTitle` and page number (current behavior)
- Author text uses `text-muted-foreground` styling to avoid overwhelming the document title

**iPad Responsive Dialog**

- The dialog uses `max-w-3xl h-[85vh]` — verify this doesn't overflow on iPad viewport (1024x768)
- Ensure touch targets in the dialog are minimum 44x44px (collapsible citations, close button)
- Test ScrollArea scrolling behavior with touch/swipe gestures
- On narrow viewports (< 640px), the dialog should expand to near-full-width (`max-w-[95vw]`)

**Unit Tests for Wiring**

- Test that `AnalysisResultsPanel` opens when `AnalyzeButton.onAnalysisComplete` fires with a result
- Test that closing the dialog preserves the result in state (re-openable)
- Test that warnings render as alert banners when `metadata.warnings` is non-empty
- Test that no warnings section appears when `metadata.warnings` is empty or undefined
- Follow existing test patterns in `AnalysisResultsPanel.test.tsx` (Vitest + Testing Library)
- Test only core user flows per testing standards — skip edge cases

## Visual Design

No visual mockups provided. Follow existing design conventions:

- AI-related elements use the indigo palette (`text-indigo-600`, `bg-indigo-50`) as established in `PatternRecognitionSection`
- Confidence badges use existing color map: HIGH = green, MEDIUM = yellow, LOW = orange
- Primary suggestion uses `border-l-4 border-l-blue-500`, alternatives use `border-l-slate-300`
- Warning banners use amber palette (`bg-amber-50`, `text-amber-800`, `border-amber-200`)
- All UI text in Spanish

## Existing Code to Leverage

**Analysis Components (`apps/client/src/components/patients/analysis/`)**

- 6 fully-built components: `AnalysisResultsPanel`, `SuggestionCard`, `CitationsSection`, `PatternRecognitionSection`, `ServiceStatusIndicator`, `AnalysisDisclaimer`
- All follow Shadcn/UI + Tailwind conventions with dark mode support
- `AnalysisResultsPanel` is the container — already composes all sub-components inside a `Dialog` with `ScrollArea`
- Minor polish needed: add author to `CitationsSection`, add warnings banner area to `AnalysisResultsPanel`

**AnalyzeButton (`apps/client/src/components/patients/AnalyzeButton.tsx`)**

- Handles loading state (`Loader2` spinner), success flash (`Check` icon), and disabled state (< 1 evaluation)
- Calls `useCaseAnalysis().analyzeCase(caseId)` and fires `onAnalysisComplete(result)` callback
- Extend to support a "re-open results" state when analysis was previously completed

**useCaseAnalysis Hook (`apps/client/src/hooks/use-case-analysis.ts`)**

- Manages `isAnalyzing`, `error`, `result` state via `useState`
- Calls `aiAnalysisApi.analyzeCase(caseId)` and shows error toast on failure
- Already returns the `result` — `CaseDetailLayout` just needs to consume it

**CaseDetailLayout (`apps/client/src/components/patients/CaseDetailLayout.tsx`)**

- Already imports `AnalyzeButton` and renders it in the header (line 445)
- The `onAnalysisComplete` callback currently only `console.log`s and shows a toast — replace with dialog state management
- Uses `ViewMode` union type for tab switching; the analysis dialog is orthogonal (overlay, not a tab)

**Frontend Types (`apps/client/src/types/analysis.ts`)**

- `AnalysisResult`, `Suggestion`, `Citation`, `Reasoning`, `ServiceStatus`, `AnalysisMetadata` interfaces
- Mirror the backend `AnalysisResultDto` shape exactly — no type changes needed

## Out of Scope

- Like/Dislike feedback buttons on suggestions (roadmap task 15.5, requires backend persistence)
- End-to-end testing with real patient data (roadmap task 15.6)
- Adding a `type` field to backend `SuggestionDto` (requires LLM prompt engineering changes)
- Analysis history or persistence (each analysis is ephemeral)
- Export analysis results as PDF report (roadmap Week 28)
- Exposing `forceVision` query parameter toggle in the UI
- Comparison mode between two different analyses
- English original quote toggle for translated citations (deferred to task 16.7 Explainability)
- Redesign of existing analysis components (wire + polish only)
- Backend changes of any kind

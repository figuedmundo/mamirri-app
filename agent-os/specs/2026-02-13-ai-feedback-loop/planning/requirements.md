# Spec Requirements: AI Feedback Loop (Like/Dislike Buttons)

## Initial Description

Roadmap task 15.5: "Feedback loop: Like/Dislike buttons"

Add Like/Dislike feedback buttons to AI treatment suggestions so that the therapist can indicate whether the AI's clinical recommendations were helpful or not. This is part of Week 15 (Vision & Full Analysis) and follows the completed task 15.4 (Suggestions UI with cards, citations, warning banners, and re-open/retry states).

Key context:

- The AI analysis generates treatment suggestions via RAG + Vision + Voice + LLM orchestration
- Suggestions are displayed in an `AnalysisResultsPanel` modal dialog with `SuggestionCard` components
- Each suggestion has: title, description, confidence level (HIGH/MEDIUM/LOW), and optional reasoning
- Currently, analysis results are **transient** — they are NOT persisted to the database
- No feedback models or endpoints exist yet in the Prisma schema or backend

## Requirements Discussion

### First Round Questions

**Q1:** Persistence strategy — The current analysis results are transient (not saved to DB). Should we persist the full `AnalysisResult` to a new Prisma model so we have an entity to attach feedback to, or take a lighter approach like storing only the feedback with a hash/fingerprint of the suggestion content?
**Answer:** Full persistence — create a new `AiAnalysis` Prisma model that stores the entire JSON result when analysis runs. Feedback attaches to this record. Rationale: aligns with "immutable session logs" product principle, enables "show me what the AI suggested last time", enables future analytics/explainability (tasks 16.7, 16.8), and storage cost is trivial (~2-5KB per analysis).

**Q2:** Feedback granularity — Should feedback be per-suggestion (each card gets its own thumbs up/down) or per-analysis-as-a-whole?
**Answer:** Per-suggestion. Each `SuggestionCard` gets its own thumbs up/down. Rationale: enables learning WHICH suggestions are helpful vs. noise, maps naturally to the existing UI (each card has its own header area), and provides more granular data for future prompt tuning.

**Q3:** Feedback detail level — Should feedback be just thumbs up/down, or include an optional comment field?
**Answer:** Thumbs + optional comment on Dislike only (progressive disclosure). Thumbs up requires no explanation. On Dislike, a small expandable text area appears — skippable, not mandatory. Rationale: respects "Zero-Friction" product philosophy for the 45-60 year old user, while capturing context for negative feedback that can improve prompts.

**Q4:** Feedback mutability — Should the therapist be able to change their feedback after submitting?
**Answer:** Yes, mutable with toggle behavior. Tap thumbs-up → highlighted. Tap again → deselected (neutral). Tap thumbs-down → switches to dislike. Rationale: standard UX pattern (YouTube, Spotify), mistakes happen, opinions change after clinical application, implementation is trivial (upsert).

**Q5:** Feedback visibility — Should feedback be visible only to the therapist who gave it, or should aggregated stats be surfaced?
**Answer:** Therapist-only for now. No aggregation dashboard. However, the data model should store everything needed for future aggregation (therapistId, timestamps, caseId). Dashboard deferred to Phase 5 (Week 22). Rationale: single-user product, keeps scope tight.

**Q6:** Re-analysis behavior — When the therapist runs "Analyze" again on the same case, should the old analysis + feedback be preserved or overwritten?
**Answer:** Keep history. Each analysis run creates a new `AiAnalysis` record. Old analyses + their feedback are preserved. The UI always shows the most recent analysis — no history browser needed. Rationale: aligns with "immutable session logs", enables tracking how AI suggestions evolve, storage is cheap (2-5 runs per case lifecycle).

**Q7:** Is there anything specifically out of scope?
**Answer:** Explicitly excluded:

- Fine-tuning/RLHF — no automated model retraining from feedback
- Cross-therapist feedback sharing — product is single-user
- Analytics dashboard — deferred to Phase 5
- Automated adoption tracking — detecting if suggestion was adopted into treatment plan
- Feedback on citations — only suggestions get feedback, not citations or reasoning
- Feedback on standalone vision analysis (`POST /ai/vision/analyze`)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: AI Analysis UI — Path: `apps/client/src/components/patients/analysis/`
  - `AnalysisResultsPanel.tsx` — Modal dialog that hosts all AI results (Dialog + ScrollArea pattern)
  - `SuggestionCard.tsx` — Individual suggestion card where feedback buttons will be added
  - `CitationsSection.tsx` — Section pattern for grouping related content
  - `ServiceStatusIndicator.tsx` — Small status indicators pattern
  - `AnalysisDisclaimer.tsx` — Disclaimer banner pattern
- Feature: Analysis types — Path: `apps/client/src/types/analysis.ts`
  - `Suggestion`, `AnalysisResult`, `Citation` interfaces
- Feature: Analysis hook — Path: `apps/client/src/hooks/use-case-analysis.ts`
  - `useCaseAnalysis()` hook pattern for API calls with loading/error states
- Feature: Analysis API — Path: `apps/client/src/api/ai-analysis.ts`
  - API client pattern using axios
- Feature: Backend AI module — Path: `apps/server/src/modules/ai-analysis/`
  - `ai-analysis.controller.ts` — REST controller with Swagger decorations
  - `ai-analysis.service.ts` — Orchestration service
  - `dto/analysis-result.dto.ts` — DTO pattern with `@ApiProperty` decorators
  - `interfaces/analysis.interfaces.ts` — Backend interfaces mirroring frontend types
- Feature: Prisma schema — Path: `apps/server/prisma/schema.prisma`
  - No AI models exist yet. New models needed: `AiAnalysis` + `AiFeedback`
  - Reference existing model patterns (e.g., `TreatmentSession` with `clinicalCaseId` + `therapistId` foreign keys)
- Feature: Case Detail Layout — Path: `apps/client/src/components/patients/CaseDetailLayout.tsx`
  - Host view that manages `analysisResult` state and renders `AnalysisResultsPanel`

### Follow-up Questions

No follow-up questions were needed. All requirements were clarified in the first round.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A

## Requirements Summary

### Functional Requirements

- Persist AI analysis results to a new `AiAnalysis` database model when analysis runs
- Display Like/Dislike buttons on each `SuggestionCard` (primary + alternatives)
- On Dislike, show an optional text area for the therapist to explain why
- Feedback is per-suggestion: each suggestion in an analysis can be independently rated
- Feedback is mutable: therapist can toggle between Like/Dislike/Neutral
- Each re-analysis creates a new `AiAnalysis` record (history preserved)
- UI always shows the most recent analysis result
- New backend endpoint to submit/update feedback per suggestion
- Feedback is scoped to the therapist who created it

### Reusability Opportunities

- `SuggestionCard` component — extend with feedback buttons in the card footer
- `useCaseAnalysis` hook — extend or create sibling `useSuggestionFeedback` hook
- `aiAnalysisApi` client — add `submitFeedback` method
- `AnalysisResultDto` — extend or create sibling DTOs for persistence + feedback
- Prisma model patterns from `TreatmentSession` (clinicalCaseId + therapistId FK pattern)
- Lucide React icons already used in the project (use `ThumbsUp`, `ThumbsDown` icons)
- Shadcn/UI `Button` with `variant="ghost"` for feedback toggle buttons

### Scope Boundaries

**In Scope:**

- New Prisma model: `AiAnalysis` to persist analysis results (linked to ClinicalCase + therapist)
- New Prisma model: `AiFeedback` to store per-suggestion feedback (linked to AiAnalysis)
- Backend: Persist analysis result when `analyzeCase` is called
- Backend: New endpoint to submit/update feedback for a suggestion
- Frontend: Like/Dislike toggle buttons on each `SuggestionCard`
- Frontend: Optional comment text area on Dislike (progressive disclosure)
- Frontend: Visual feedback states (highlighted thumb, neutral state)
- Frontend: Hook for feedback submission with optimistic updates

**Out of Scope:**

- Fine-tuning/RLHF from feedback data
- Cross-therapist feedback sharing
- Analytics dashboard for feedback metrics
- Automated adoption tracking (suggestion → treatment plan)
- Feedback on citations or reasoning sections
- Feedback on standalone vision analysis endpoint
- Analysis history browser UI (data is stored, but no UI to browse old analyses)

### Technical Considerations

- **Database migration required:** Two new Prisma models (`AiAnalysis`, `AiFeedback`)
- **Analysis result storage:** Store the full `AnalysisResult` JSON in a `Json` field on `AiAnalysis`
- **Suggestion indexing:** Suggestions within an analysis need stable identifiers (position-based index: 0 = primary, 1-3 = alternatives) to link feedback to specific suggestions
- **Backward compatibility:** The `analyzeCase` endpoint response shape should NOT change — persistence is a side effect, not a new return type
- **Optimistic UI:** Feedback button state should update immediately on click, with background API call
- **Existing UI components:** Shadcn/UI Card, Button, Textarea already available
- **Icons:** Lucide React `ThumbsUp`, `ThumbsDown` already bundled in the project
- **Therapist isolation:** Feedback endpoints must enforce therapist ownership (same pattern as patients CRUD)

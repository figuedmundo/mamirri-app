# Specification: AI Feedback Loop (Like/Dislike Buttons)

## Goal

Enable therapists to rate individual AI treatment suggestions with Like/Dislike buttons, persisting both the analysis results and per-suggestion feedback for future prompt improvement and traceability.

## User Stories

- As a physiotherapist, I want to indicate whether an AI suggestion was helpful so that I can contribute to improving the system's recommendations over time.
- As a physiotherapist, I want to explain why a suggestion was unhelpful so that the feedback is actionable for improving prompts.

## Specific Requirements

**AiAnalysis Prisma Model**

- New model `AiAnalysis` with fields: `id` (cuid), `clinicalCaseId` (FK to ClinicalCase), `therapistId` (FK to User), `result` (Json — stores the full `AnalysisResult` object), `createdAt` (DateTime)
- Relation: `ClinicalCase` 1:N `AiAnalysis` (multiple analyses per case, history preserved)
- Index on `clinicalCaseId` for efficient lookup of latest analysis
- Table name: `ai_analyses` (via `@@map`)
- Cascade delete when parent ClinicalCase is deleted

**AiFeedback Prisma Model**

- New model `AiFeedback` with fields: `id` (cuid), `aiAnalysisId` (FK to AiAnalysis), `suggestionIndex` (Int — 0 = primary, 1-3 = alternatives), `isPositive` (Boolean), `comment` (String?, optional), `createdAt` (DateTime), `updatedAt` (DateTime)
- Unique constraint on `[aiAnalysisId, suggestionIndex]` — one feedback per suggestion per analysis
- Table name: `ai_feedbacks` (via `@@map`)
- Cascade delete when parent AiAnalysis is deleted

**Analysis Persistence (Backend Side-Effect)**

- Modify `AiAnalysisService.analyzeCase()` to persist the `AnalysisResult` to the `AiAnalysis` model before returning it to the client
- The response shape of the `POST /ai/cases/:caseId/analyze` endpoint must NOT change — persistence is a transparent side-effect
- Return the `AiAnalysis.id` in the response metadata so the frontend can reference it when submitting feedback. Add an `analysisId` field to `AnalysisMetadata`
- If persistence fails, log the error but still return the analysis result (non-blocking)

**Feedback API Endpoint**

- New endpoint: `PUT /ai/analyses/:analysisId/suggestions/:suggestionIndex/feedback`
- Request body: `{ isPositive: boolean, comment?: string }`
- Upsert behavior: creates feedback if none exists, updates if it already exists (unique constraint on `[aiAnalysisId, suggestionIndex]`)
- Delete behavior: `DELETE /ai/analyses/:analysisId/suggestions/:suggestionIndex/feedback` removes feedback (returns to neutral state)
- Therapist isolation: verify the `AiAnalysis` belongs to the requesting therapist via the ClinicalCase ownership chain
- Swagger documentation with `@ApiTags('ai')`, `@ApiBearerAuth()`, `@UseGuards(JwtAuthGuard)`

**Frontend Feedback Buttons on SuggestionCard**

- Add a footer row to `SuggestionCard` with ThumbsUp and ThumbsDown icon buttons (from `lucide-react`)
- Buttons use Shadcn/UI `Button` with `variant="ghost"` and `size="sm"`
- Three visual states per button: neutral (default icon color), active-positive (ThumbsUp filled/highlighted in green), active-negative (ThumbsDown filled/highlighted in red)
- Toggle behavior: tap active button to deselect (neutral), tap opposite button to switch
- Minimum touch target: 44x44px for iPad accessibility
- Pass `analysisId` and `suggestionIndex` as props to `SuggestionCard` from `AnalysisResultsPanel`

**Optional Dislike Comment (Progressive Disclosure)**

- When ThumbsDown is active, a small `Textarea` (Shadcn/UI) slides in below the buttons with placeholder "Por que no fue util? (opcional)"
- The comment submits on blur or after 1 second debounce of typing
- When switching from Dislike to Like or Neutral, the comment field disappears and the stored comment is cleared
- Max length: 500 characters

**Feedback Hook and API Client**

- New hook `useSuggestionFeedback(analysisId)` that manages feedback state for all suggestions in an analysis
- Optimistic UI: button state updates immediately on click, API call fires in background
- On API failure: revert optimistic state and show error toast
- New API client methods in `aiAnalysisApi`: `submitFeedback(analysisId, suggestionIndex, body)` and `deleteFeedback(analysisId, suggestionIndex)`

**AnalysisResultsPanel Integration**

- `AnalysisResultsPanel` receives `analysisId` (from the new metadata field) and passes it to each `SuggestionCard`
- Primary suggestion gets `suggestionIndex={0}`, alternatives get `suggestionIndex={i + 1}`
- The `useCaseAnalysis` hook return type should include the `analysisId` extracted from the result metadata
- When the panel re-opens with previously-submitted feedback, buttons should reflect the persisted state (fetch feedback on mount)

## Visual Design

No visual mockups provided. Follow existing `SuggestionCard` styling patterns. Place feedback buttons in a new `CardFooter` section below the existing `CardContent`, right-aligned, with subtle separator.

## Existing Code to Leverage

**`SuggestionCard.tsx`**

- Extend with a `CardFooter` containing the feedback buttons
- Follow existing Shadcn/UI Card pattern (CardHeader, CardContent, already used)
- Add new props: `analysisId`, `suggestionIndex`, `onFeedback`

**`AiAnalysisService.analyzeCase()` (lines 74-144)**

- The persistence call should be inserted at line ~130, right before the return statement
- Use `this.prisma.aiAnalysis.create({ data: { clinicalCaseId, therapistId, result: analysisResult } })` pattern
- Wrap in try/catch so persistence failure doesn't block the analysis response

**`ai-analysis.controller.ts`**

- Add the new `PUT` and `DELETE` feedback endpoints to the existing `AiAnalysisController`
- Follow the existing Swagger decoration pattern (`@ApiOperation`, `@ApiResponse`, `@ApiParam`)
- Reuse `@CurrentTherapist()` decorator and `JwtAuthGuard` (already imported)

**Therapist ownership verification pattern**

- Follow the pattern in `data-aggregation.service.ts` (line 50): `clinicalCase.patient.therapistId !== therapistId`
- For feedback endpoints, traverse: `AiAnalysis → ClinicalCase → Patient → therapistId`

**`aiAnalysisApi` client and `useCaseAnalysis` hook**

- Add `submitFeedback` and `deleteFeedback` methods to the existing `aiAnalysisApi` object in `apps/client/src/api/ai-analysis.ts`
- Create a sibling `useSuggestionFeedback` hook following the same useState/try-catch/toast pattern from `useCaseAnalysis`

## Out of Scope

- Fine-tuning or RLHF from feedback data (no automated model retraining)
- Cross-therapist feedback sharing or visibility
- Analytics dashboard for feedback metrics (deferred to Phase 5, Week 22)
- Automated adoption tracking (detecting if suggestion was used in treatment plan)
- Feedback on citations, reasoning sections, or the analysis as a whole
- Feedback on standalone vision analysis endpoint (`POST /ai/vision/analyze`)
- Analysis history browser UI (data is stored but no UI to browse past analyses)
- Feedback pre-loading from previous analyses (fetch only current analysis feedback)

# Specification: Patient AI Analysis Refinement

## Goal

Improve AI analysis quality through prompt-level and data-aggregation enhancements that leverage the new SOAP evaluation structure, enrich the response with clinical safety checks and reasoning transparency, and fix the critical gap where analysis results are lost on page navigation.

## User Stories

- As a physiotherapist, I want the AI analysis to leverage my structured SOAP evaluation data so that suggestions are grounded in my documented clinical findings rather than a raw data dump.
- As a physiotherapist, I want to see my previous AI analysis when I reopen a patient case so that I don't lose insights and don't need to re-run the analysis.
- As a physiotherapist, I want the AI to flag urgent conditions and safety concerns so that I don't miss red flags that require immediate referral.

## Specific Requirements

**SOAP-Aware Query Decomposition**

- Replace the current `JSON.stringify(latestEval.diagnosis)` approach in `buildDiagnosisQuery` with structured, per-section RAG queries
- Map Subjetivo fields → symptom/history queries, Objetivo fields → clinical finding queries, Análisis → differential diagnosis queries, Plan → treatment approach queries
- Each SOAP section produces its own targeted RAG query, improving retrieval relevance
- Keep existing `buildTreatmentQuery` and `buildContraindicationsQuery` methods but feed them structured SOAP data instead of raw dumps
- The data-aggregation layer already fetches SOAP evaluations — add transformation logic there to decompose sections before passing to the prompt builder

**System Prompt Restructuring**

- Restructure the current 3-step CoT (Comprensión → Literatura → Síntesis) into a multi-perspective structure covering Diagnosis, Treatment, and Safety within a single LLM call
- Integrate the therapist's own "Análisis" section as collaborative context — instruct the AI to validate, challenge, or enrich the therapist's reasoning
- Add strict citation rules: the LLM must provide exact quote, document title, author, and page number — or explicitly state "no supporting literature found" rather than fabricate
- Maintain Spanish-language output throughout all new prompt sections
- Preserve the Chain-of-Thought approach — restructure the steps, don't remove them

**Follow-Up Question Generation**

- The AI generates 2–3 follow-up questions when it detects data gaps in the SOAP evaluation
- Each question includes: the question text, reason it matters, and which SOAP section it relates to
- Questions should be clinically actionable (e.g., "Was neurological screening performed?" not "Please provide more information")
- Display in a dedicated section of the results panel

**Differential Diagnosis Reasoning**

- Force the LLM to explicitly consider 2–3 alternative conditions before committing to a primary suggestion
- For each considered condition, show supporting evidence and contradicting evidence from the SOAP data and literature
- This reasoning step enriches the existing `reasoning` field rather than replacing it

**Red Flag / Referral Trigger Detection**

- The system prompt instructs the AI to check for urgent conditions: cauda equina symptoms, fracture signs, cardiac red flags, neurological deterioration, and other clinical red flags relevant to physiotherapy
- Each detected red flag includes: the flag description, urgency level, and recommended action
- Red flags must be surfaced prominently in the UI (above all other results)
- If no red flags are detected, this section is absent (not shown as "none found")

**Grounded Confidence Calibration**

- Replace the current opaque confidence score with a justified confidence object
- Include: count of supporting literature citations found, degree of alignment with documented clinical guidelines, and explicitly stated limiting factors
- The confidence justification should be expandable in the UI — collapsed by default showing only the score

**RAG Chunk Optimization**

- Reduce maximum RAG chunks from 8 to 5 to combat the "lost-in-the-middle" effect documented in the MIRAGE benchmark
- Order chunks by relevance: place highest-relevance chunks first and last (edges), lower-relevance in the middle
- Improve chunk labeling with source metadata (document title, section, page) to help the LLM attribute claims correctly

**Layered Response Structure**

- Structure the AI response in layers: a quick summary (2–3 sentences), the detailed reasoning chain, and evidence levels per claim
- The summary allows therapists to get a fast overview; the detail is available on expansion
- This affects the response JSON schema and the frontend rendering approach

**Response Schema Extension**

- Add new fields to the `AnalysisResult` type: `followUpQuestions[]`, `redFlags[]`, `confidenceJustification`, `differentialDiagnosis[]`, and `summary`
- Both the backend JSON output schema (in the system prompt) and the frontend TypeScript type must stay in sync
- The `AiAnalysis` Prisma model stores `result` as JSON — new fields persist automatically without a database migration
- No backward compatibility handling needed for the schema change (per coding standards)

**Analysis Persistence Fix**

- Create a GET endpoint (e.g., `GET /api/v1/ai/cases/:caseId/analyses/latest`) to retrieve the most recent analysis for a case — the data already exists in the `ai_analyses` table
- Replace the volatile `useState` in `useCaseAnalysis` with a TanStack Query hook that fetches from the new GET endpoint on case open
- Use TanStack Query's `staleTime` and caching to avoid re-fetching on tab switches within the same case
- The `AnalyzeButton` "view results" state should check for persisted results on mount, not only in-session results
- Follow existing endpoint patterns in `ai-analysis.controller.ts` for the new GET route

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**PromptBuilderService (`apps/server/src/modules/ai-analysis/services/prompt-builder.service.ts`)**

- Contains `buildDiagnosisQuery`, `buildTreatmentQuery`, `buildContraindicationsQuery` — extend these to accept decomposed SOAP sections instead of raw JSON
- `buildUserPrompt` orchestrates multi-modal context (RAG chunks, vision findings, voice transcripts) — extend to include therapist's Análisis section
- `buildHydeDiagnosisPrompt` and `buildHydeTreatmentPrompt` provide HyDE template patterns — follow this pattern for any new query variants
- Query methods currently trim to 500 chars — review whether this limit is still appropriate with structured SOAP inputs

**DataAggregationService (`apps/server/src/modules/ai-analysis/services/data-aggregation.service.ts`)**

- `aggregateCaseData` already fetches evaluations with SOAP data, footprints, and voice notes in parallel
- The latest evaluation is derived from the evaluations array — add SOAP decomposition logic here to split sections before they reach the prompt builder
- Returns `CaseDataAggregate` with all fields needed — no new data sources required

**System Prompt Constants (`apps/server/src/modules/ai-analysis/constants/system-prompts.ts`)**

- `AI_ANALYSIS_SYSTEM_PROMPT` defines the current 3-step CoT and JSON output schema — restructure in place
- The JSON output schema must be updated to include new response fields (followUpQuestions, redFlags, differentialDiagnosis, confidenceJustification, summary)
- All prompt content is in Spanish — new sections must follow the same language

**Analysis UI Components (`apps/client/src/components/patients/analysis/`)**

- `AnalysisResultsPanel.tsx` renders primary suggestion, alternatives, citations, and reasoning — extend with new sections for follow-up questions, red flags, differential diagnosis, and summary
- `SuggestionCard`, `CitationsSection`, `PatternRecognitionSection` are composable section components — follow this pattern for new sections
- Shadcn/UI `Card`, `Badge` components available for new UI sections; `AlertDialog` available but a simpler inline alert pattern may be better for red flags

**TanStack Query Hooks (`apps/client/src/hooks/use-ai-analysis.ts`)**

- `useAnalyzeCaseQuery` and `useSubmitFeedbackMutation` demonstrate the established data-fetching pattern — replicate for the new GET endpoint
- Replace the `useState`-based approach in `use-case-analysis.ts` with a `useQuery` hook that loads persisted analysis on mount
- Use `enabled` flag pattern to conditionally fetch only when a caseId is available

## Out of Scope

- Changing the LLM provider (staying with Gemini 3 Flash)
- Re-ingesting or modifying the knowledge base content
- Modifying the RAG retrieval pipeline (embeddings, reranking, vector database)
- Auto-triggering analysis when a SOAP evaluation is saved (keeping manual trigger)
- Building a feedback loop that uses accumulated therapist feedback to improve prompts
- Making AI suggestions more specific or prescriptive (waiting for more doctor feedback)
- Any infrastructure changes (new services, databases, or third-party integrations)
- Full analysis history or versioning (GET endpoint returns latest only)
- Database schema migrations (new fields stored in existing JSON column)
- Accordion or collapsible component creation if not already available — use existing Shadcn/UI primitives

# Spec Requirements: Patient AI Analysis Refinement

## Initial Description

Refine the Patient AI Analysis feature (built in Weeks 14-16) based on field testing feedback from Week 9. The current system orchestrates Voice + Vision + RAG + LLM (Gemini 3 Flash) to provide clinical suggestions with citations from medical textbooks. Task 9.12 (Evaluation SOAP) was recently completed, reorganizing the evaluation flow into a SOAP structure (Subjetivo, Objetivo, Análisis, Plan). The AI analysis refinement likely needs to align with this new SOAP data model and address quality/UX issues observed during real-world usage.

## Requirements Discussion

### First Round Questions

**Q1:** The current `buildDiagnosisQuery()` does a raw `JSON.stringify(latestEval.diagnosis)` to build the RAG query. With the new SOAP structure from task 9.12, each section (Subjetivo, Objetivo, Análisis, Plan) contains different clinical dimensions. Should we decompose the SOAP data into targeted RAG queries — e.g., symptoms from Subjetivo → one query, objective findings from Objetivo → another, therapist's analysis from Análisis → a third — rather than dumping everything into a single query?
**Answer:** Agree — leverage structured SOAP fields for targeted RAG queries.

**Q2:** The current system prompt produces generic suggestions ("consider X technique"). Should we push for more specific, actionable suggestions — e.g., "Based on the reduced ROM in left shoulder flexion (120°), consider mobilization grades III-IV targeting the glenohumeral joint" — by feeding structured SOAP measurements into the prompt?
**Answer:** Keep generic for now. Need more feedback from the doctor before improving prompts toward more specific suggestions. The current level of specificity is acceptable until more field data is collected.

**Q3:** The therapist's own "Análisis" section in SOAP contains their clinical reasoning. Should this be fed into the AI prompt as collaborative context — so the AI can validate, challenge, or enrich the therapist's assessment rather than starting from scratch?
**Answer:** Yes, but the user requested online research for best practices before deciding on the approach. Research was conducted (see Research Findings below). The therapist's analysis should be included as context that the AI validates and enriches, following the "collaborative intelligence" pattern found in multi-agent clinical decision support literature.

**Q4:** Should the analysis auto-trigger when a SOAP evaluation is saved, or remain manual (therapist clicks "Analyze")?
**Answer:** Keep manual. The therapist should explicitly choose when to request AI analysis.

**Q5:** The system already collects feedback (👍/👎 + comments via `AiFeedback` model). Should we build a feedback loop that uses accumulated feedback to improve prompts over time?
**Answer:** Out of scope for this iteration. Will be considered in a future task.

**Q6:** What are the current weak scenarios where the AI performs poorly? Are there specific pathologies, body regions, or clinical situations where the suggestions are less useful?
**Answer:** Agree this needs investigation — will ask the doctor for specific feedback. Not blocking this spec; the improvements proposed here are designed to improve quality broadly regardless of weak scenarios.

**Q7:** Should any of the following be considered in scope: changing LLM provider, re-ingesting the knowledge base, or modifying the RAG retrieval pipeline (embeddings, reranking)?
**Answer:** All out of scope. This refinement focuses exclusively on prompt-level and data-aggregation-level improvements. Zero infrastructure changes.

### Research Findings

Extensive online research was conducted across academic papers, open-source projects, and commercial products to inform the improvement ideas:

**Academic Sources:**

- **MedRAG (arXiv:2506.02470):** Knowledge Graph-Elicited Reasoning for medical AI — identified follow-up question generation and knowledge-graph reasoning as highest-impact improvements for clinical AI copilots
- **MIRAGE Benchmark (arXiv:2402.13178):** Found "lost-in-the-middle" effect — LLMs ignore middle chunks when given many RAG passages. Current system passes 8 chunks, which is in the danger zone

**Open-Source Projects:**

- `salihfurkaan/multi-agent-clinical-decision-support-system` — Multi-agent CDSS with differential diagnosis reasoning
- `yuki-2025/MediNotes` — SOAP + RAG integration patterns
- `Phlox`, `HealthChain`, `AI_Clinic`, `MMedAgent` — Various clinical AI implementations

**Commercial Products:**

- Wizio, AiSOAP, SOAPME.AI — Physiotherapy-specific AI assistants
- Physiopedia — Clinical reasoning reference patterns

### Existing Code to Reference

**Similar Features Identified:**

- Feature: AI Analysis Backend — Path: `apps/server/src/modules/ai-analysis/`
  - `ai-analysis.service.ts` — Main orchestration (707 lines)
  - `ai-analysis.controller.ts` — HTTP endpoints (246 lines)
  - `constants/system-prompts.ts` — System prompt + user prompt builder (95 lines)
  - `services/prompt-builder.service.ts` — Query builders, HyDE, vision/voice context (193 lines)
  - `services/data-aggregation.service.ts` — Multi-source data fetching (261 lines)
- Feature: AI Analysis Frontend — Path: `apps/client/src/`
  - `types/analysis.ts` — AnalysisResult type definition (49 lines)
  - `api/ai-analysis.ts` — API client (47 lines)
  - `hooks/use-ai-analysis.ts` — TanStack Query hooks (44 lines)
  - `hooks/use-case-analysis.ts` — useState-based hook (43 lines)
  - `components/patients/AnalyzeButton.tsx` — Trigger button (109 lines)
  - `components/patients/CaseDetailLayout.tsx` — Parent component holding analysis state (572 lines)
  - `components/patients/analysis/AnalysisResultsPanel.tsx` — Results dialog (118 lines)
- Feature: SOAP Evaluation — Path: Recently completed spec at `agent-os/specs/2026-02-26-evaluation-soap-ux/`
- Feature: Database Models — Path: `apps/server/prisma/schema.prisma`
  - `AiAnalysis` model (lines 321-335) — Already persists results to DB
  - `AiFeedback` model (lines 337-351) — Feedback collection
- Feature: AI Analysis Documentation — Path: `.documentation/technical/ai-analysis-feature-guide.md` (960 lines)

### Follow-up Questions

**Follow-up 1:** How will the UI be affected by these changes?
**Answer (Agent Analysis):** The current `AnalysisResultsPanel.tsx` renders `primarySuggestion`, `alternatives`, `citations`, and `reasoning`. New response fields will require UI additions:

- **Follow-up questions** — New section in the results panel showing AI-suggested questions the therapist could ask or investigate
- **Red flags / referral triggers** — Prominent warning section (likely a colored alert banner) for urgent conditions detected
- **Confidence justification** — Expandable section showing why the AI is confident or uncertain (literature support count, clinical alignment, limiting factors)
- **Differential diagnosis** — New section showing conditions considered and evidence for/against each
- **Layered response structure** — Summary view (quick glance) with expandable detailed reasoning + evidence levels

These are additive UI changes — no existing UI components need to be removed or restructured.

**Follow-up 2:** Will the analysis be lost after navigating away?
**Answer (Agent Investigation):** A critical gap was discovered:

- **Backend:** The `AiAnalysis` model in Prisma already persists results to the database (`result` JSON column). Results ARE saved.
- **Backend Gap:** There is NO GET endpoint to retrieve past analyses. Only `POST` (create new) and feedback endpoints exist.
- **Frontend Gap:** `useCaseAnalysis` hook and `CaseDetailLayout` store the analysis result in React `useState` — it is lost on page navigation or browser refresh.
- **Resolution Required:** Add a GET endpoint (`GET /ai/cases/:caseId/analyses/latest`) and update the frontend to load the persisted analysis when opening a case that already has one.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets to analyze.

## Requirements Summary

### Functional Requirements

#### Prompt & Response Enrichment (10 Improvements)

1. **SOAP-Aware Query Decomposition** — Decompose SOAP sections into targeted RAG queries instead of raw JSON.stringify dump. Map Subjetivo → symptom queries, Objetivo → clinical finding queries, Análisis → differential diagnosis queries, Plan → treatment approach queries.

2. **Follow-Up Question Generation** — AI generates 2-3 follow-up questions when data gaps are detected in the SOAP evaluation. Each question includes the reason it matters and which SOAP section it relates to. Based on MedRAG paper findings.

3. **Differential Diagnosis Reasoning Step** — Force the LLM to explicitly consider 2-3 alternative conditions before committing to a primary suggestion. Show evidence for and against each considered condition.

4. **Multi-Perspective Prompt Structure** — Restructure the system prompt to address Diagnosis, Treatment, and Safety perspectives within a single call, ensuring comprehensive coverage without increasing API calls.

5. **Address Lost-in-the-Middle Effect** — Limit RAG chunks to 5 (from current 8) and improve chunk labeling/ordering to combat the MIRAGE-documented phenomenon where LLMs ignore middle passages. Place highest-relevance chunks first and last.

6. **Grounded Confidence Calibration** — Tie the confidence score to concrete evidence: number of supporting citations found, alignment with documented clinical guidelines, and explicitly stated limiting factors. Replace the current opaque confidence with a justified one.

7. **Red Flag / Referral Trigger Detection** — Add safety guardrails: the AI explicitly checks for urgent conditions (e.g., cauda equina symptoms, fracture signs, cardiac red flags) and surfaces them prominently with recommended actions.

8. **Therapist's Análisis as Collaborative Context** — Include the therapist's own analysis from the SOAP "Análisis" section in the prompt, instructing the AI to validate, challenge, or enrich the therapist's reasoning rather than ignoring it.

9. **Layered Response Structure** — Structure the response in layers: a quick summary (2-3 sentences), detailed reasoning chain, and evidence levels for each claim. Allows the therapist to get a fast overview or dive deep.

10. **Citation Quality Enforcement** — Add strict rules in the system prompt preventing fabricated citations. Each citation must include exact quote, document title, author, and page number. The prompt should instruct the LLM to say "no supporting literature found" rather than fabricate.

#### Analysis Persistence (Critical Gap Fix)

11. **Backend: GET Endpoint for Past Analyses** — Create a GET endpoint (e.g., `GET /api/v1/ai/cases/:caseId/analyses/latest`) to retrieve the most recent analysis for a case. The data already exists in the `ai_analyses` table.

12. **Frontend: Load Persisted Analysis on Case Open** — When opening a case that has a previous analysis, fetch and display it automatically. Replace the volatile `useState` approach with a proper data-fetching pattern (TanStack Query) that loads from the API.

13. **Frontend: Analysis State Persistence Across Navigation** — Ensure analysis results survive page navigation and browser refresh by loading from the backend rather than relying on React component state.

### Reusability Opportunities

- Existing `AnalysisResultsPanel.tsx` can be extended with new sections (follow-up questions, red flags, differential diagnosis) without replacing the current structure
- `useCaseAnalysis` hook can be refactored to use TanStack Query (like `useAiAnalysis` already does) for proper server-state management
- The `data-aggregation.service.ts` already fetches SOAP data — the decomposition logic can be added there
- The `prompt-builder.service.ts` query builders can be extended with SOAP-aware variants
- `AnalyzeButton.tsx` already handles "view results" state — it just needs to check for persisted results on mount

### Scope Boundaries

**In Scope:**

- System prompt restructuring (multi-perspective, layered response, citation rules, red flags, confidence calibration, differential diagnosis, follow-up questions)
- SOAP-aware query decomposition in data aggregation / prompt builder
- Therapist's Análisis integration into AI prompt context
- RAG chunk count reduction (8 → 5) and ordering optimization
- Response schema extension (new fields: followUpQuestions, redFlags, confidenceJustification, differentialDiagnosis)
- GET endpoint for retrieving persisted analyses
- Frontend persistence fix (load analysis from API instead of useState)
- UI additions for new response fields (additive changes only)

**Out of Scope:**

- Changing LLM provider (staying with Gemini 3 Flash)
- Re-ingesting or modifying the knowledge base
- Modifying the RAG retrieval pipeline (embeddings, reranking, vector DB)
- Auto-triggering analysis on SOAP save (keeping manual trigger)
- Feedback loop / prompt improvement from accumulated feedback
- Making suggestions more specific (waiting for more doctor feedback)
- Any infrastructure changes

### Technical Considerations

- All improvements are at the prompt-level or data-aggregation-level — zero infrastructure changes required
- The response schema (`AnalysisResult` type in `apps/client/src/types/analysis.ts`) needs new fields added; both frontend type and backend validation must stay in sync
- The system prompt is in Spanish — all new prompt sections must maintain Spanish language output
- Current 3-step Chain-of-Thought (Comprensión → Literatura → Síntesis) will be restructured but the CoT approach should be preserved
- The GET endpoint should return the latest analysis only (not full history) to keep the initial implementation simple
- RAG chunk reduction from 8 to 5 should be validated with the doctor to ensure no quality regression
- The `AiAnalysis` Prisma model already stores the `result` as JSON — new response fields will be stored automatically without schema migration
- Frontend should use TanStack Query's caching to avoid re-fetching analysis on every tab switch within the same case

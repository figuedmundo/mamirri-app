# Specification: RAG Rerank v4 & HyDE Upgrade

## Goal

Improve retrieval precision and relevance for clinical decision support by upgrading the reranking stage to Cohere v4.0-pro and implementing Hypothetical Document Embeddings (HyDE) for complex medical queries. Additionally, improve ingestion quality by integrating Docling for layout-aware PDF parsing.

## User Stories

- As a physiotherapist, I want the AI to understand my clinical observations even when I use non-technical language, so it can find the most relevant literature.
- As a physiotherapist, I want the retrieved context to be as accurate as possible, especially when it comes to complex tables in medical textbooks.
- As a practitioner, I want the system to present multiple clinical possibilities grounded in evidence, rather than a single biased guess.

## Specific Requirements

**Cohere Rerank v4.0-pro Integration**

- Upgrade model string from `rerank-v3.5` / `rerank-multilingual-v3.0` to `rerank-v4.0-pro`.
- Use `rerank-v4.0-pro` for all reranking steps (Diagnosis, Treatment, Contraindications).
- Accept latency trade-off (~600ms) for higher medical accuracy.
- Maintain existing deduplication logic before reranking.

**HyDE (Hypothetical Document Embeddings)**

- Implement HyDE logic for "Diagnosis" and "Treatment" queries.
- Controlled by `ENABLE_HYDE` feature flag in `.env`.
- Use **Gemini 3 Flash Preview** to generate synthetic "Clinical Descriptions".
- Prompt strategy must focus on technical descriptions and differential diagnoses, avoiding single-diagnosis bias.
- Synthetic passages are used **only for vector search**; they are NOT passed to the final analysis LLM.
- Maintain Hybrid Search (BM25 + Dense) as a fallback mechanism.

**Docling Ingestion Upgrade**

- Replace `pdf-parse` in `scripts/ingest-books.ts` with a Docling-based extraction worker.
- Ensure layout-aware parsing handles tables and multi-column text correctly.
- Convert parsed content to clean Markdown before chunking.
- Maintain compatibility with current `Parent-Child` retrieval strategy.

**RAG Evaluation Updates**

- Update `knowledge-base/rag-evaluation.spec.ts` with HyDE-specific test cases (e.g., vague symptom queries).
- Measure impact of HyDE with A/B testing using the feature flag.
- Target metrics: Context Precision > 0.75, Faithfulness > 0.80.

## Existing Code to Leverage

**AiAnalysisService.executeMultiQueryRag**

- `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
- Use as the main orchestration point to insert the HyDE generation step before `findSimilar`.
- Reuse the parallel execution pattern (`Promise.all`) for generating hypothetical passages.

**KnowledgeBaseService.findSimilar**

- `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
- Update the rerank model string to `rerank-v4.0-pro`.
- Reuse existing Hybrid Search (Dense + BM25) and RRF logic.

**PromptBuilderService**

- `apps/server/src/modules/ai-analysis/services/prompt-builder.service.ts`
- Add new methods `buildHydeDiagnosisPrompt` and `buildHydeTreatmentPrompt`.
- Ensure prompts enforce "Clinical Description" style.

**withRetry Utility**

- `apps/server/src/modules/transcription/utils/retry.ts`
- Wrap all new Gemini (HyDE) and Docling API calls with this utility for robustness.

## Out of Scope

- UI changes for the Library search bar (remains keyword-based).
- Multi-query variations (limited to 1 passage per query for MVP).
- Direct Voyage AI integration (deferred).
- Changes to the frontend client.

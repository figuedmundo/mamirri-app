# Specification: RAG Rerank v4 & HyDE Upgrade

## Goal

Improve retrieval precision and relevance for clinical decision support by upgrading the reranking stage to Cohere v4.0-pro and implementing Hypothetical Document Embeddings (HyDE) for complex medical queries. Additionally, improve ingestion quality by integrating Docling for layout-aware PDF parsing.

## User Stories

- As a physiotherapist, I want the AI to understand my clinical observations even when I use non-technical language, so it can find the most relevant literature.
- As a physiotherapist, I want the retrieved context to be as accurate as possible, especially when it comes to complex tables in medical textbooks.
- As a practitioner, I want the system to present multiple clinical possibilities grounded in evidence, rather than a single biased guess.

## Specific Requirements

### 1. Cohere Rerank v4.0-pro Integration

- **Model**: Upgrade model string from `rerank-v3.5` / `rerank-multilingual-v3.0` to `rerank-v4.0-pro`.
- **Latency**: Acceptable trade-off (~600ms) for 8% higher accuracy in medical terminology.
- **Coverage**: Apply to Diagnosis, Treatment, and Contraindications queries.
- **Deduplication**: Keep the current deduplication logic before sending to reranking.

### 2. HyDE (Hypothetical Document Embeddings) Implementation

- **Logic**: For "Diagnosis" and "Treatment" queries, generate a synthetic "Clinical Description" before performing vector search.
- **Configurability**: Controlled by a feature flag `ENABLE_HYDE=true/false` in `.env`. If `false`, the system defaults to standard query-based retrieval.
- **Model**: Use **Gemini 3 Flash Preview** for generation.

- **Prompting Strategy**:
  - **Diagnosis**: "Write a technical medical passage describing the pathologies associated with these symptoms: {symptoms}. Include possible differential diagnoses."
  - **Treatment**: "Write a hypothetical clinical protocol for treating {condition}, focusing on physiotherapy evidence-based techniques."
- **Safety/Objectivity**:
  - **No Bias**: Prompts must explicitly avoid choosing a single diagnosis; they must focus on clinical descriptions.
  - **Evidence Only**: The synthetic passage is used **only for search**. It MUST NOT be passed to the final LLM analysis to avoid hallucinations.
- **Fallback**: Maintain standard Hybrid Search (BM25 + Dense) to ensure exact matches for drug names and codes (especially in the Contraindications flow, where HyDE is excluded).

### 3. Docling Ingestion Upgrade

- **Replacement**: Replace `pdf-parse` in `scripts/ingest-books.ts` with a Docling-based extraction worker.
- **Layout Awareness**: Ensure tables and multi-column medical texts are parsed into clean, structured Markdown before chunking.
- **Compatibility**: Maintain compatibility with the current `Parent-Child` retrieval strategy.

### 4. RAG Evaluation Framework

- **Updates**: Update `knowledge-base/rag-evaluation.spec.ts` to include test cases specifically designed to verify HyDE's effectiveness (e.g., vague symptom queries).
- **Thresholds**: Maintain Context Precision > 0.75 and Faithfulness > 0.80.

## Technical Architecture

### Component Diagram (Updated Flow)

1. **User Query** (Symptoms/Case)
2. **HyDE Generation** (Gemini 3 Flash) -> Synthetic Passage
3. **Vector Search** (pgvector) using _Synthetic Passage Embedding_ -> Child Chunks
4. **Hybrid Search** (TSVector) using _Original Query_ -> Extra candidates
5. **Deduplication** (Merged Results)
6. **Cohere Rerank v4.0-pro** -> Sorted Results
7. **Parent Retrieval** -> Full context for top-N results
8. **Final Analysis** (Gemini 3) -> Structured Recommendation

## Existing Code to Leverage

- `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`: Update `executeMultiQueryRag` to include the HyDE generation step.
- `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`: Update rerank model strings and ensure score mapping is compatible.
- `apps/server/scripts/ingest-books.ts`: Refactor to use Docling.

## Out of Scope

- Migrating embedding models to Voyage AI (deferred to a future sprint).
- UI changes for search bars.
- HyDE for the general "Library" search (stays keyword-based for speed).

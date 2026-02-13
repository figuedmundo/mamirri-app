# Spec Requirements: RAG Rerank v4 & HyDE Upgrade

## Initial Description

Upgrade the RAG system to Cohere Rerank v4.0-pro and implement HyDE (Hypothetical Document Embeddings) to improve retrieval quality. Integrate Docling for better PDF ingestion.

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming we want to use Cohere Rerank v4.0-pro for all current reranking steps. Would you like to use the rerank-v4.0-fast variant for any specific scenarios?
**Answer:** Use `rerank-v4.0-pro` for everything. In a medical context, Accuracy > Speed.

**Q2:** For the HyDE implementation, I'm thinking of using Gemini 1.5 Flash (Gemini 3 Flash Preview) to generate the hypothetical medical passages. Does this choice of model work for you?
**Answer:** Yes, use the latest Gemini 3 Flash Preview. It is fast and cost-effective for generating search "hooks."

**Q3:** Should HyDE be applied to all three RAG queries (Diagnosis, Treatment, and Contraindications)?
**Answer:** Apply to Diagnosis and Treatment. Exclude from Contraindications to ensure exact keyword matching for drugs and medical codes.

**Q4:** I suggest generating one hypothetical passage per query to keep latency low and costs minimal. Do you agree?
**Answer:** Agree. One high-quality passage is enough for the MVP to keep it simple and fast.

**Q5:** When providing context to the final LLM analysis, should we include the HyDE passage?
**Answer:** No. Only include real chunks from medical books to ensure advice is 100% grounded in evidence.

**Q6:** How do we handle the risk of "Confirmation Bias" with "fake" diagnosis passages?
**Answer:** We will generate "Clinical Descriptions" (technical descriptions of symptoms and differential possibilities) rather than "Fake Diagnoses." This expands the search scope rather than narrowing it.

**Q7:** How do we improve the quality of text extracted from medical books?
**Answer:** Replace the current `pdf-parse` with a Docling-based worker to handle complex layouts and tables correctly.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: RAG Orchestration - Path: `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
- Feature: Vector Search Logic - Path: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
- Feature: Prompt Formatting - Path: `apps/server/src/modules/ai-analysis/services/prompt-builder.service.ts`

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- Implement HyDE (Hypothetical Document Embeddings) for Diagnosis and Treatment queries.
- Upgrade reranking model to `rerank-v4.0-pro`.
- Implement Docling for PDF ingestion.
- Maintain Hybrid Search (BM25 + Dense) as a fallback.

### Reusability Opportunities

- Reuse `withRetry` utility for new API calls.
- Reuse existing `executeMultiQueryRag` pattern in `AiAnalysisService`.

### Scope Boundaries

**In Scope:**

- Backend integration of Cohere v4.0.
- HyDE logic for search enhancement.
- Docling ingestion pipeline upgrade.
- RAG evaluation updates to reflect new model performance.

**Out of Scope:**

- UI changes for the Library search bar (stays keyword/simple).
- Multi-query variations (keeping it to 1 passage for simplicity).
- Direct "Voyage AI" integration for this specific sprint (deferred per user request).

### Technical Considerations

- Gemini 3 Flash Preview for HyDE generation.
- Cohere SDK upgrade (ensure v7.20.0 supports v4.0-pro).
- Docling requires a Python environment/container.
- HyDE prompts must focus on "Clinical Descriptions" to avoid bias.
- **Feature Flag**: Implementation must support an `ENABLE_HYDE` environment variable (boolean) to allow A/B testing and validation of retrieval quality with and without the hypothetical generation step.

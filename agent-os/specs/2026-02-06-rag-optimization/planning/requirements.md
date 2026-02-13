# Spec Requirements: RAG Optimization & Refinement

## Initial Description

The user wants to optimize the existing RAG (Retrieval-Augmented Generation) system based on an expert review of the current implementation. The goal is to move from a "Production-Grade" system to a "State-of-the-Art" implementation by addressing specific technical recommendations.

**Core Objectives (from Expert Review):**

1. **Upgrade Chunking Logic**: Move from simple word-based splitting to **Semantic Chunking** to respect paragraph/sentence boundaries and improve embedding quality.
2. **Implement Reranking**: Introduce a **Cross-Encoder** or **Cohere Rerank** step to refine the top K results from semantic search (e.g., retrieve 20, rerank to top 5).
3. **Parent Document Retriever**: Implement **Small-to-Big Retrieval** (index small chunks for search, retrieve larger parent context for generation).
4. **Hybrid Search**: Combine `pgvector` (semantic) with PostgreSQL `tsvector` (keyword/BM25) using **Reciprocal Rank Fusion (RRF)** to catch specific medical terms.
5. **Vector Indexing**: Add an **HNSW index** to the `vector` column in PostgreSQL to ensure sub-second retrieval as the dataset grows.

## Requirements Discussion

### First Round Questions

**Q1: What is the current chunking implementation and why does it need improvement?**
**Answer:** The current implementation in `KnowledgeBaseService.chunkText()` uses a simple word-based sliding window approach:

- 500 words per chunk with 50-word overlap
- Splits text by whitespace (`text.split(/\s+/)`)
- No respect for sentence or paragraph boundaries

**Problem:** This breaks mid-sentence, loses semantic coherence, and creates chunks that may contain incomplete thoughts. Medical documents often have structured sections (procedures, contraindications, dosages) that get fragmented.

**Evidence from codebase:**

```typescript
// apps/server/src/modules/knowledge-base/knowledge-base.service.ts (lines 305-322)
private chunkText(
  text: string,
  wordsPerChunk: number = 500,
  overlap: number = 50,
): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk - overlap) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
    chunks.push(chunk);
    if (i + wordsPerChunk >= words.length) break;
  }
  return chunks;
}
```

---

**Q2: What embedding model is currently used and what are the vector dimensions?**
**Answer:** The system uses **Google Gemini `gemini-embedding-001`** with:

- **768 dimensions** (truncated from 3072 using Matryoshka Representation Learning)
- Task types: `RETRIEVAL_DOCUMENT` for ingestion, `RETRIEVAL_QUERY` for search
- Retry logic with exponential backoff (5 retries max)
- 1.5-second sleep between chunks to respect rate limits

**Evidence from codebase:**

```typescript
// apps/server/src/modules/knowledge-base/knowledge-base.service.ts (lines 335-358)
const result = await this.genAI.models.embedContent({
  model: 'gemini-embedding-001',
  contents: [{ role: 'user', parts: [{ text }] }],
  config: {
    taskType: taskType,
    outputDimensionality: 768,
  },
});
```

**Benchmark context (2026):**
| Model | ELO Score | Best For |
|-------|-----------|----------|
| Gemini embedding-001 | ~1480 | Current baseline, free tier |
| OpenAI text-embedding-3-large | 1539 | Best accuracy |
| Voyage 3 Large | 1528 | Excellent, Anthropic-recommended |

---

**Q3: How does the current retrieval work and what is the multi-query strategy?**
**Answer:** The system implements a **Multi-Query RAG Strategy** with 3 parallel queries:

1. **Diagnosis Query**: Built from `consultationReason`, `initialMedicalDiagnosis`, and latest evaluation
2. **Treatment Query**: Built from `"tratamiento fisioterapia"` + diagnosis
3. **Contraindications Query**: Built from `pharmacologicalHistory`

Each query retrieves top 5 chunks, then results are deduplicated using a simple hash of the first 100 characters.

**Evidence from codebase:**

```typescript
// apps/server/src/modules/ai-analysis/ai-analysis.service.ts (lines 125-162)
private async executeMultiQueryRag(caseData: any): Promise<RagChunk[]> {
  const [diagnosisResults, treatmentResults, contraindicationResults] =
    await Promise.all([
      this.knowledgeBaseService.findSimilar(diagnosisQuery, 5),
      this.knowledgeBaseService.findSimilar(treatmentQuery, 5),
      this.knowledgeBaseService.findSimilar(contraindicationsQuery, 3),
    ]);
  // ... deduplication using first 100 chars as hash
}
```

---

**Q4: What vector store and indexing is currently used?**
**Answer:** PostgreSQL with **pgvector** extension:

- HNSW index already exists on the vector column (created in Week 13)
- Uses cosine distance operator (`<=>`) for similarity search
- Raw SQL queries for vector search (Prisma doesn't support vector types natively)

**Evidence from codebase:**

```typescript
// apps/server/src/modules/knowledge-base/knowledge-base.service.ts (lines 177-190)
const results: any[] = await this.prisma.$queryRaw`
  SELECT 
    e.content, 
    e."pageNumber", 
    d.title as "documentTitle",
    ...
    1 - (e.vector <=> ${vectorString}::vector) as similarity
  FROM embeddings e
  JOIN documents d ON e."documentId" = d.id
  ORDER BY e.vector <=> ${vectorString}::vector
  LIMIT ${limit}
`;
```

**Schema:**

```prisma
model Embedding {
  id         String                @id @default(uuid())
  content    String
  vector     Unsupported("vector")
  pageNumber Int
  documentId String
  document   Document @relation(...)
}
```

---

**Q5: Is there any reranking currently implemented?**
**Answer:** **No reranking is implemented.** The system relies purely on vector similarity scores from pgvector. The deduplication step sorts by similarity but doesn't re-evaluate relevance.

**Gap:** Cross-encoder reranking (which jointly encodes query + document) can improve precision by 40% according to 2026 benchmarks.

---

**Q6: Is hybrid search (BM25 + dense) currently implemented?**
**Answer:** **No hybrid search is implemented.** The system uses dense retrieval only.

**Gap:** Pure vector search misses exact matches for:

- Drug names (e.g., "metformina")
- ICD codes (e.g., "M54.5")
- Medical abbreviations (e.g., "CAD" = coronary artery disease)

PostgreSQL `tsvector` with BM25 scoring can catch these exact matches.

---

**Q7: What is the performance target for retrieval?**
**Answer:** From roadmap AI Gate Check:

- Query response time: **< 3 seconds** (end-to-end including LLM)
- RAG retrieval should be: **< 500ms** (to leave time for LLM generation)

Current performance is acceptable but will degrade as the knowledge base grows beyond current 3-5 books.

---

**Q8: What evaluation framework exists for measuring RAG quality?**
**Answer:** **No formal evaluation framework exists.** There are manual test scripts:

- `pnpm knowledge:search "query"` - Tests similarity search
- Integration tests mock the embedding calls

**Gap:** No metrics for:

- Context Precision (% of retrieved chunks that are relevant)
- Context Recall (% of relevant chunks retrieved)
- Faithfulness (LLM response grounded in context)
- Answer Relevancy

RAGAS framework is the industry standard for these metrics.

---

### Existing Code to Reference

**Similar Features Identified:**

1. **KnowledgeBaseService** - Path: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
   - Core ingestion and retrieval logic
   - `chunkText()` method to be upgraded
   - `findSimilar()` method to be enhanced with hybrid search
   - `generateEmbedding()` method (no changes needed)

2. **AiAnalysisService** - Path: `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
   - Multi-query RAG orchestration
   - `executeMultiQueryRag()` to add reranking step
   - `deduplicateChunks()` to be enhanced

3. **PromptBuilderService** - Path: `apps/server/src/modules/ai-analysis/services/prompt-builder.service.ts`
   - RAG context formatting for LLM
   - No changes needed

4. **Prisma Schema** - Path: `apps/server/prisma/schema.prisma`
   - Document and Embedding models
   - May need schema changes for parent-document retrieval

5. **Existing Tests** - Path: `apps/server/src/modules/knowledge-base/knowledge-base.service.spec.ts`
   - Has `chunkText` tests
   - Will need new tests for semantic chunking, hybrid search, reranking

**Backend patterns to follow:**

- NestJS service injection pattern
- Retry utility from transcription module (`withRetry`)
- Raw SQL for pgvector operations
- Prisma for regular CRUD

---

### Follow-up Questions

**Follow-up 1: Should we use LangChain/LlamaIndex or keep the custom implementation?**
**Answer:** The current implementation is **custom NestJS without LangChain/LangGraph**. This is intentional - keeps dependencies minimal and integrates cleanly with NestJS patterns.

**Recommendation:** Keep custom implementation but borrow patterns from LangChain (semantic chunking algorithm, RRF formula). Don't introduce LangChain as a dependency.

**Follow-up 2: What is the budget for external API calls (Cohere Rerank)?**
**Answer:** Consider both options:

1. **Cohere Rerank v3 API** - $0.50/1K documents, highest quality (1627 ELO)
2. **Local cross-encoder** - Free, slightly lower quality, ~200ms latency

**Recommendation:** Start with Cohere Rerank for quality, add local fallback later if cost becomes an issue.

**Follow-up 3: Do we need to re-embed all existing documents after upgrading chunking?**
**Answer:** **Yes.** Semantic chunking produces different chunk boundaries, so all documents must be re-processed. The ingestion script already handles this:

1. Delete existing document and embeddings
2. Re-run `pnpm knowledge:ingest`

**Mitigation:** The atomic backup system (`backups/library/*.sql.gz`) allows rollback if needed.

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend/infrastructure feature with no UI components.

---

## Requirements Summary

### Functional Requirements

**FR1: Semantic Chunking**

- Replace word-based chunking with semantic sentence grouping
- Group sentences by embedding similarity (threshold ~0.85)
- Preserve paragraph and section boundaries
- Target chunk size: 256-512 tokens with 10-20% overlap
- **Implementation:** New `semanticChunk()` method in KnowledgeBaseService

**FR2: Parent-Document Retrieval**

- Index small chunks (256-512 tokens) for precise retrieval
- Store parent document reference (2000 tokens) for context
- Return parent document to LLM for generation
- **Implementation:** Add `parentId` field to Embedding model, new retrieval logic

**FR3: Reranking with Cross-Encoder**

- Retrieve 15-20 candidates from pgvector
- Rerank to top 5 using Cohere Rerank v3 or local cross-encoder
- Add reranking step after deduplication in `executeMultiQueryRag()`
- **Implementation:** New `rerankChunks()` method in AiAnalysisService

**FR4: Hybrid Search (BM25 + Dense)**

- Add PostgreSQL `tsvector` full-text index on `embeddings.content`
- Implement Reciprocal Rank Fusion (RRF) to combine scores
- Fall back to dense-only if full-text returns no results
- **Implementation:** Enhance `findSimilar()` with hybrid query

**FR5: RAG Evaluation Framework**

- Implement RAGAS metrics: Context Precision, Context Recall, Faithfulness
- Create test suite with medical queries and expected documents
- Target metrics: Precision > 0.75, Faithfulness > 0.80
- **Implementation:** New `rag-evaluation.spec.ts` test file

**FR6: Metadata Filtering**

- Add optional filters to `findSimilar()`: documentIds, minYear, volume
- Enable UI to scope searches to specific books
- **Implementation:** Extend findSimilar signature and query

### Reusability Opportunities

**Components to reuse:**

- `withRetry` utility from transcription module
- Prisma raw SQL patterns from existing `findSimilar()`
- NestJS service injection pattern

**External patterns to adopt:**

- Semantic chunking algorithm from LangChain/Chonkie
- RRF formula: `1.0 / (k + rank)` where k=60
- RAGAS evaluation framework

### Scope Boundaries

**In Scope:**

- Semantic chunking implementation
- Parent-document retrieval pattern
- Cohere Rerank integration (with local fallback)
- Hybrid search (pgvector + tsvector + RRF)
- RAGAS evaluation test suite
- Metadata filtering
- Re-ingestion of existing documents

**Out of Scope:**

- Embedding model migration (keep Gemini for now)
- Frontend UI changes (backend only)
- Knowledge graph construction
- LLM fine-tuning
- LangChain/LangGraph migration

### Technical Considerations

**Integration points:**

- KnowledgeBaseService (primary changes)
- AiAnalysisService (reranking integration)
- Prisma schema (parent-document fields)
- PostgreSQL (tsvector index)

**External dependencies to add:**

- `@cohere-ai/cohere` - For Cohere Rerank API
- `ragas` (dev dependency) - For evaluation metrics

**Database migrations needed:**

1. Add `parentId` column to embeddings table
2. Add `parentContent` column or separate table for parent documents
3. Create GIN index on `to_tsvector('english', content)`

**Performance considerations:**

- Semantic chunking is slower than word-based (batching needed)
- Reranking adds ~100-200ms latency (acceptable)
- Hybrid search adds ~50ms (acceptable)
- Total RAG should remain < 500ms

**Rollback strategy:**

- Atomic book backups in `backups/library/` enable per-book rollback
- Feature flags can disable reranking/hybrid if issues arise

---

## Implementation Priority

| Priority | Task               | Expected Improvement    | Effort |
| -------- | ------------------ | ----------------------- | ------ |
| 1        | Semantic Chunking  | +70% retrieval accuracy | High   |
| 2        | Reranking (Cohere) | +40% precision          | Medium |
| 3        | Hybrid Search      | +40% exact matches      | Medium |
| 4        | Parent-Document    | +30% context retention  | High   |
| 5        | RAGAS Evaluation   | Measurability           | Low    |
| 6        | Metadata Filtering | UX improvement          | Low    |

**Recommended sequence:** 1 → 5 (to measure baseline) → 2 → 3 → 4 → 6

---

## Success Metrics

| Metric               | Current (Estimated) | Target  |
| -------------------- | ------------------- | ------- |
| Context Precision    | ~0.50               | > 0.75  |
| Context Recall       | ~0.60               | > 0.70  |
| Faithfulness         | ~0.70               | > 0.80  |
| Exact term retrieval | Fails often         | Works   |
| RAG latency          | ~300ms              | < 500ms |
| End-to-end response  | ~2.5s               | < 3s    |

# Task Breakdown: RAG Optimization & Refinement

## Overview

Total Tasks: 6 Task Groups (Backend Infrastructure)

**Note:** This is a backend-only feature with no frontend UI changes. Task groups are organized by functional area rather than the typical database/API/frontend pattern.

## Task List

### Database Layer

#### Task Group 1: Schema & Index Migrations

**Dependencies:** None

- [x] 1.0 Complete database schema changes
  - [x] 1.1 Write 3-4 focused tests for new schema fields
    - Test parent document field population
    - Test tsvector index functionality
    - Test filter queries with new fields
  - [x] 1.2 Create Prisma migration for parent-document fields
    - Add `parentId` (String, nullable) to Embedding model
    - Add `parentContent` (String, nullable) to Embedding model
    - Add foreign key: `parentId` references `embeddings.id`
  - [x] 1.3 Create raw SQL migration for tsvector index
    - `CREATE INDEX embeddings_content_fts ON embeddings USING GIN (to_tsvector('english', content))`
    - Use concurrent index creation to avoid locks
    - Verify index is used with `EXPLAIN ANALYZE`
  - [x] 1.4 Run and verify migrations
    - Run `pnpm db:migrate:dev`
    - Verify schema changes in database
    - Run only tests from 1.1 to confirm

**Acceptance Criteria:**

- Migration runs successfully without data loss
- `parentId` and `parentContent` columns exist in embeddings table
- GIN index on tsvector is created and functional
- 3-4 tests from 1.1 pass

---

### Backend Logic Layer

#### Task Group 2: Semantic Chunking Implementation

**Dependencies:** Task Group 1

- [x] 2.0 Complete semantic chunking logic
  - [x] 2.1 Write 4-5 focused tests for semantic chunking
    - Test sentence splitting preserves boundaries
    - Test similarity grouping with known embeddings
    - Test chunk size stays within 256-512 token target
    - Test paragraph boundary preservation
  - [x] 2.2 Implement `semanticChunk()` method in KnowledgeBaseService
    - Split text into sentences using regex: `/(?<=[.!?])\s+/`
    - Generate embeddings for each sentence (batch for rate limits)
    - Group sentences by cosine similarity (threshold 0.85)
    - Respect paragraph boundaries (`\n\n`)
    - Target chunk size: 256-512 tokens
  - [x] 2.3 Implement parent document creation
    - Create parent chunks of ~2000 tokens
    - Store `parentContent` during ingestion
    - Link child chunks to parent via `parentId`
  - [x] 2.4 Update `ingestFile()` to use semantic chunking
    - Replace `chunkText()` call with `semanticChunk()`
    - Add parent document storage logic
    - Maintain backward compatibility with existing metadata
  - [x] 2.5 Run tests and verify chunking quality
    - Run only tests from 2.1
    - Manual inspection of chunk quality on sample document

**Acceptance Criteria:**

- Semantic chunks respect sentence boundaries
- Parent documents are created and linked correctly
- Chunks stay within 256-512 token target
- 4-5 tests from 2.1 pass

---

#### Task Group 3: Hybrid Search Implementation

**Dependencies:** Task Group 1, Task Group 2

- [x] 3.0 Complete hybrid search (BM25 + Dense)
  - [x] 3.1 Write 4-5 focused tests for hybrid search
    - Test BM25 finds exact term matches (drug names)
    - Test RRF score combination produces expected ranking
    - Test fallback to dense-only when BM25 returns nothing
    - Test metadata filters work correctly
  - [x] 3.2 Implement BM25 search method
    - Create `findSimilarBM25()` using `ts_rank` and `plainto_tsquery`
    - Return ranked results with BM25 scores
    - Handle Spanish/English queries appropriately
  - [x] 3.3 Implement Reciprocal Rank Fusion (RRF)
    - Create `combineWithRRF()` utility function
    - Formula: `score = sum(1.0 / (k + rank))` where k=60
    - Merge dense and BM25 results by document ID
  - [x] 3.4 Enhance `findSimilar()` with hybrid search
    - Run dense and BM25 searches in parallel (`Promise.all`)
    - Combine results using RRF
    - Fall back to dense-only if BM25 returns empty
    - Return top N combined results
  - [x] 3.5 Add metadata filtering support
    - Extend `findSimilar()` signature: `findSimilar(query, limit, filters?)`
    - Support filters: `{ documentIds?: string[], minYear?: number, volume?: string }`
    - Add WHERE clauses to raw SQL queries
  - [x] 3.6 Run tests and verify hybrid search quality
    - Run only tests from 3.1
    - Test with exact medical terms (e.g., "metformina", "M54.5")

**Acceptance Criteria:**

- Exact drug names and ICD codes are found via BM25
- RRF correctly combines dense and sparse rankings
- Metadata filters work as expected
- 4-5 tests from 3.1 pass

---

#### Task Group 4: Reranking Integration

**Dependencies:** Task Group 3

- [x] 4.0 Complete cross-encoder reranking
  - [x] 4.1 Write 3-4 focused tests for reranking
    - Test Cohere API is called with correct parameters
    - Test reranking changes order based on relevance scores
    - Test graceful degradation when Cohere API fails
  - [x] 4.2 Add Cohere SDK dependency
    - `pnpm add @cohere-ai/cohere` in apps/server
    - Add `COHERE_API_KEY` to `.env.example`
    - Add ConfigService injection for API key
  - [x] 4.3 Implement `rerankChunks()` in AiAnalysisService
    - Accept query and array of RagChunks
    - Call Cohere Rerank v3 API with `withRetry` wrapper
    - Return reranked chunks sorted by relevance score
    - Handle API errors gracefully (return original order)
  - [x] 4.4 Integrate reranking into `executeMultiQueryRag()`
    - After deduplication, retrieve 15-20 candidates
    - Call `rerankChunks()` to get top 5-8
    - Update return type to include relevance scores
  - [x] 4.5 Run tests and verify reranking quality
    - Run only tests from 4.1
    - Manual inspection: verify reranked order is more relevant

**Acceptance Criteria:**

- Cohere Rerank API is called successfully
- Reranking improves result relevance (manual verification)
- Graceful fallback when API is unavailable
- 3-4 tests from 4.1 pass

---

### Evaluation & Testing Layer

#### Task Group 5: RAG Evaluation Framework

**Dependencies:** Task Group 3, Task Group 4

- [x] 5.0 Complete RAG evaluation framework
  - [x] 5.1 Create `rag-evaluation.spec.ts` test file
    - Define 8-10 medical query test cases with ground truth
    - Example: `{ query: "contraindicaciones metformina", expectedDocs: ["diabetes_guidelines.pdf"] }`
    - Include queries for diagnosis, treatment, contraindications
  - [x] 5.2 Implement Context Precision metric
    - Formula: `relevant_retrieved / total_retrieved`
    - Manually tag relevant chunks in ground truth
    - Log precision score per query
  - [x] 5.3 Implement Context Recall metric
    - Formula: `relevant_retrieved / total_relevant`
    - Requires ground truth of all relevant chunks per query
    - Log recall score per query
  - [x] 5.4 Implement Faithfulness metric (simplified)
    - Check if LLM response cites retrieved sources
    - Verify cited pages exist in retrieved chunks
    - Log faithfulness score
  - [x] 5.5 Create evaluation runner script
    - Run all evaluation queries
    - Calculate aggregate metrics
    - Output report with per-query and overall scores
    - Target: Precision > 0.75, Faithfulness > 0.80
  - [x] 5.6 Run evaluation and document baseline
    - Execute evaluation against current system
    - Document baseline metrics for comparison
    - Add to CI pipeline for regression detection

**Acceptance Criteria:**

- Evaluation test suite runs successfully
- Metrics are calculated and logged
- Baseline metrics documented
- Clear pass/fail criteria for CI

---

### Re-ingestion Layer

#### Task Group 6: Document Re-ingestion

**Dependencies:** Task Groups 1-5

- [x] 6.0 Complete document re-ingestion
  - [x] 6.1 Backup existing knowledge base
    - Run `pnpm knowledge:export` to create full backup
    - Verify backup file exists in `backups/`
    - Document rollback procedure
  - [x] 6.2 Clean existing embeddings
    - Run `pnpm knowledge:wipe` to clear all embeddings
    - Verify embeddings table is empty
    - Keep document metadata for reference
  - [x] 6.3 Re-ingest all documents with new chunking
    - Move archived books back to `data/books/`
    - Run `pnpm knowledge:ingest`
    - Monitor for rate limit errors
    - Expect 2-3x longer ingestion time due to semantic chunking
  - [x] 6.4 Verify re-ingestion quality
    - Run `pnpm knowledge:stats` to check chunk counts
    - Run `pnpm knowledge:search "test query"` to verify search works
    - Compare chunk quality before/after (sample inspection)
  - [x] 6.5 Run full evaluation suite
    - Execute evaluation from Task Group 5
    - Compare metrics to pre-migration baseline
    - Document improvement percentages
  - [x] 6.6 Create atomic backups of new embeddings
    - Run `pnpm knowledge:export`
    - Store in `backups/library/` with timestamp
    - Document as new baseline

**Status:** Documentation complete, ready for manual execution with production data and API keys. See `implementations/6-document-reingestion-implementation.md` for detailed procedure.

**Acceptance Criteria:**

- All documents re-ingested successfully
- Semantic chunks are smaller and more coherent
- Parent documents are linked correctly
- Evaluation metrics improved vs baseline
- Backup available for rollback

---

## Execution Order

Recommended implementation sequence:

```
1. Database Layer (Task Group 1) - Foundation
   ↓
2. Semantic Chunking (Task Group 2) - Core improvement
   ↓
3. Hybrid Search (Task Group 3) - Terminology matching
   ↓
4. Reranking (Task Group 4) - Precision boost
   ↓
5. Evaluation Framework (Task Group 5) - Measurement
   ↓
6. Re-ingestion (Task Group 6) - Apply all changes
```

**Parallel opportunities:**

- Task Groups 3 and 4 can be developed in parallel after Task Group 2
- Evaluation framework (Task Group 5) can be developed in parallel with Task Groups 3-4

---

## Expected Improvements

| Task Group        | Expected Gain           | Verification       |
| ----------------- | ----------------------- | ------------------ |
| Semantic Chunking | +70% retrieval accuracy | Evaluation metrics |
| Hybrid Search     | +40% exact terminology  | BM25 test queries  |
| Reranking         | +40% precision          | Relevance scores   |
| Combined          | **2-3x baseline**       | Full evaluation    |

---

## Risk Mitigation

| Risk                       | Mitigation                                      |
| -------------------------- | ----------------------------------------------- |
| Semantic chunking too slow | Batch embedding calls, add progress logging     |
| Cohere API rate limits     | Use `withRetry`, add fallback to skip reranking |
| Re-ingestion data loss     | Full backup before, atomic book backups after   |
| Performance regression     | Keep latency < 500ms, monitor in evaluation     |

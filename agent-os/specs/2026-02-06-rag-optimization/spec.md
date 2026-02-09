# Specification: RAG Optimization & Refinement

## Goal

Upgrade the existing RAG system from "Production-Grade" to "State-of-the-Art" by implementing semantic chunking, cross-encoder reranking, hybrid search (BM25 + dense), and parent-document retrieval to achieve 2-3x improvement in retrieval quality for medical literature.

## User Stories

- As a physiotherapist, I want the AI to retrieve more relevant medical passages so that treatment suggestions are better grounded in evidence.
- As a physiotherapist, I want exact drug names and medical codes to be found so that contraindication checks are accurate.

## Specific Requirements

**Semantic Chunking**

- Replace word-based `chunkText()` with semantic sentence grouping
- Group sentences by embedding similarity using threshold ~0.85
- Preserve paragraph and section boundaries from source documents
- Target chunk size: 256-512 tokens with 10-20% overlap
- Implement as new `semanticChunk()` method in KnowledgeBaseService
- Batch embedding calls to respect Gemini API rate limits
- Expected improvement: +70% retrieval accuracy

**Parent-Document Retrieval**

- Index small chunks (256-512 tokens) for precise vector search
- Store parent document reference (2000 tokens) for LLM context
- Add `parentId` and `parentContent` fields to Embedding model
- Return parent document content to LLM for generation
- Requires Prisma schema migration and re-ingestion of all documents

**Cross-Encoder Reranking**

- Retrieve 15-20 candidates from pgvector similarity search
- Rerank to top 5 using Cohere Rerank v3 API
- Add `@cohere-ai/cohere` package as dependency
- Implement `rerankChunks()` method in AiAnalysisService
- Insert reranking step after deduplication in `executeMultiQueryRag()`
- Add ConfigService key: `COHERE_API_KEY`
- Expected improvement: +40% precision

**Hybrid Search (BM25 + Dense)**

- Add PostgreSQL `tsvector` full-text index on `embeddings.content`
- Create GIN index: `CREATE INDEX embeddings_content_fts ON embeddings USING GIN (to_tsvector('english', content))`
- Implement Reciprocal Rank Fusion (RRF) formula: `1.0 / (k + rank)` where k=60
- Combine vector similarity and BM25 scores in `findSimilar()`
- Fall back to dense-only if full-text returns no results
- Expected improvement: +40% for exact medical terminology

**RAG Evaluation Framework**

- Create `rag-evaluation.spec.ts` test file with medical query test cases
- Implement RAGAS-style metrics: Context Precision, Context Recall, Faithfulness
- Define test queries with expected document matches (ground truth)
- Target metrics: Context Precision > 0.75, Faithfulness > 0.80
- Run as part of CI pipeline for regression detection

**Metadata Filtering**

- Extend `findSimilar()` signature to accept optional filters
- Support filters: `documentIds`, `minYear`, `volume`
- Modify raw SQL query to include WHERE clauses for filters
- Enable therapists to scope searches to specific medical books

**Re-ingestion Process**

- All existing documents must be re-processed with new chunking strategy
- Use existing `pnpm knowledge:clean` then `pnpm knowledge:ingest` workflow
- Atomic backups in `backups/library/` provide rollback capability
- Document the migration process in spec implementation notes

## Visual Design

No visual assets provided - this is a backend infrastructure feature.

## Existing Code to Leverage

**KnowledgeBaseService**

- Path: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
- Contains `chunkText()` to be replaced with `semanticChunk()`
- Contains `findSimilar()` to be enhanced with hybrid search and filters
- Contains `generateEmbedding()` which remains unchanged
- Uses raw SQL via `prisma.$queryRaw` for vector operations

**AiAnalysisService**

- Path: `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
- Contains `executeMultiQueryRag()` where reranking step will be added
- Contains `deduplicateChunks()` which runs before reranking
- Uses `Promise.all` for parallel query execution pattern

**withRetry Utility**

- Path: `apps/server/src/modules/transcription/utils/retry.ts`
- Reusable retry wrapper with exponential backoff
- Already used by KnowledgeBaseService for embedding calls
- Will be used for Cohere API calls

**Existing Tests**

- Path: `apps/server/src/modules/knowledge-base/knowledge-base.service.spec.ts`
- Has existing `chunkText` tests to update for semantic chunking
- Follow same mocking patterns for new functionality

**Prisma Schema**

- Path: `apps/server/prisma/schema.prisma`
- Contains Embedding model to extend with `parentId` and `parentContent`
- Uses `Unsupported("vector")` type for pgvector compatibility

## Out of Scope

- Embedding model migration (keep Gemini `gemini-embedding-001` for now)
- Frontend UI changes (this spec is backend/infrastructure only)
- Knowledge graph construction for entity relationships
- LLM fine-tuning or prompt optimization (separate spec)
- LangChain/LangGraph framework migration (keep custom implementation)
- Real-time streaming of RAG results to frontend
- Multi-tenancy or per-user knowledge bases
- Automatic document classification or tagging
- PDF parsing improvements (use existing pdf-parse)
- Query caching or result caching layer

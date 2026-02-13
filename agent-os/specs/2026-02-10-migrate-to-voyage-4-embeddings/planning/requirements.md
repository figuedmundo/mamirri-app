# Spec Requirements: Migrate to Voyage-4-Large Embeddings

## Initial Description

The user wants to migrate the RAG embedding model from Google Gemini to Voyage-4-large due to issues with their Google account hitting limits/walls.

**Key Requirements:**

- Replace Google Gemini embeddings (`gemini-embedding-001`) with Voyage-4-large
- Voyage-4-large details:
  - 32,000 token context length
  - 1024 dimensions (default), with options for 256, 512, 2048
  - Best general-purpose and multilingual retrieval quality
  - Uses MoE (Mixture-of-Experts) architecture
  - State-of-the-art retrieval accuracy
  - 40% lower serving costs than comparable dense models
  - Supports asymmetric retrieval (documents with voyage-4-large, queries with smaller models)

**Motivation:**

- Hitting walls/limits with Google account
- Voyage-4-large offers superior retrieval quality
- Better cost efficiency
- Shared embedding space with other Voyage-4 models allows flexibility

## Requirements Discussion

### First Round Questions

**Q1:** I assume you want to completely replace Google Gemini embeddings with Voyage-4-large, not maintain both as options. Is that correct, or would you prefer a configurable provider pattern where both can coexist?

**Answer:** We should completely replace Google Gemini embeddings with Voyage-4-large. The current implementation is hitting limits and we want to migrate fully to Voyage AI. However, we should maintain a clean abstraction so future changes are easier.

**Q2:** I'm thinking we should use the Voyage TypeScript SDK (`voyageai` npm package) for direct API integration rather than using LangChain's wrapper. This gives us better control over batching, rate limiting, and model-specific features. Does that approach work for you?

**Answer:** Yes, using the Voyage TypeScript SDK directly makes sense for better control. We already have custom rate limiting logic in place, so direct SDK access will integrate better.

**Q3:** The current implementation uses 768 dimensions (Gemini), but Voyage-4-large uses 1024 dimensions by default. This requires a database migration to update the vector column. Should we also take this opportunity to implement pgvector dimension constraints for better data integrity?

**Answer:** Yes, we need to handle the dimension change. Since we're already re-indexing everything, this is the right time to add proper constraints. We should also consider if we want to use Matryoshka dimensions (256, 512, 1024, 2048) for flexibility.

**Q4:** For the migration strategy, since the embeddings table is empty/clean, I recommend a simple ALTER TABLE to change the vector dimension from 768 to 1024. This avoids table duplication and keeps things simple. Does that work?

**Answer:** Yes, that's much simpler. Since the table is clean, we can just ALTER the existing table to change the dimension. No need for table duplication or swapping.

**Q5:** I noticed Voyage-4-large supports asymmetric retrieval - using voyage-4-large for documents and a smaller model (like voyage-4-lite) for queries to save costs. Is this something you want to implement now, or stick with voyage-4-large for both documents and queries initially?

**Answer:** Let's implement asymmetric retrieval from the start. It makes sense cost-wise since queries are more frequent than document ingestion. We can use voyage-4-large for documents and voyage-4 for queries.

**Q6:** The Voyage API has different rate limits and batch constraints than Google (max 1000 texts per request, different token limits). Should we update the TokenRateLimiter to handle Voyage-specific limits, or create a new rate limiter specifically for Voyage?

**Answer:** We should update the existing TokenRateLimiter to be provider-agnostic and configure it for Voyage's limits. The abstraction is already there, we just need to adjust the parameters.

**Q7:** For environment variables, I'm thinking: `VOYAGE_API_KEY`, `VOYAGE_DOCUMENT_MODEL=voyage-4-large`, `VOYAGE_QUERY_MODEL=voyage-4`. Should we keep `GOOGLE_API_KEY` for other features (like LLM and Vision) that still use Google?

**Answer:** Yes, keep `GOOGLE_API_KEY` for LLM and Vision services. Only the embeddings should move to Voyage. The environment variables you proposed look good.

**Q8:** Are there existing features in your codebase with similar patterns we should reference? For example, how the Cohere client is integrated for reranking?

**Answer:** Yes, look at how the Cohere client is initialized in `knowledge-base.service.ts` (lines 165, 181-185). We should follow a similar pattern for the Voyage client. Also reference the existing rate limiter implementation (lines 23-142).

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** Cohere Reranking Integration - Path: `/apps/server/src/modules/knowledge-base/knowledge-base.service.ts` (lines 165-185)
- **Components to potentially reuse:** Client initialization pattern, error handling, fallback behavior
- **Backend logic to reference:** TokenRateLimiter class (lines 23-142), batch processing logic (lines 1346-1456)

**Additional References:**

- **Feature:** Google GenAI Integration - Path: `/apps/server/src/modules/knowledge-base/knowledge-base.service.ts` (lines 164, 179, 1286-1456)
- **Components to potentially reuse:** Retry logic with `withRetry`, mock embedding fallback patterns
- **Backend logic to reference:** `generateEmbedding()` method structure, `generateEmbeddingsBatch()` implementation

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

1. **Replace Google Gemini embedding provider with Voyage AI**
   - Install and configure `voyageai` npm package
   - Create VoyageEmbeddingService class following existing patterns
   - Support both single and batch embedding generation

2. **Implement Asymmetric Retrieval**
   - Use `voyage-4-large` (1024 dims) for document embeddings
   - Use `voyage-4` (1024 dims) for query embeddings
   - Both models use compatible embedding spaces

3. **Update Database Schema**
   - Change vector dimension from 768 to 1024
   - Create migration script for clean slate approach
   - Add dimension constraints to pgvector column

4. **Update Rate Limiting**
   - Configure for Voyage API limits:
     - Max 1000 texts per batch request
     - Token limits vary by model (120K for voyage-4-large, 320K for voyage-4)
   - Maintain existing TokenRateLimiter abstraction

5. **Maintain Backward Compatibility**
   - Keep `GOOGLE_API_KEY` for LLM and Vision services
   - Add new `VOYAGE_API_KEY` environment variable
   - Support mock embeddings when API key unavailable (development/testing)

6. **Update Configuration**
   - Add `VOYAGE_DOCUMENT_MODEL` (default: voyage-4-large)
   - Add `VOYAGE_QUERY_MODEL` (default: voyage-4)
   - Add `VOYAGE_API_KEY` for authentication

7. **Re-ingestion Process**
   - Update ingestion scripts to use Voyage provider
   - Document migration process for production
   - Ensure all existing documents are re-indexed

### Reusability Opportunities

1. **Client Initialization Pattern**
   - Follow Cohere client pattern from lines 165-185
   - Similar dependency injection approach
   - Consistent error handling and mock fallback

2. **Rate Limiter Enhancement**
   - Extend existing TokenRateLimiter class
   - Add Voyage-specific token estimation
   - Keep retry logic from `withRetry` utility

3. **Batch Processing**
   - Reuse batching logic from `generateEmbeddingsBatch()`
   - Adapt batch size limits for Voyage constraints
   - Maintain progress logging pattern

4. **Error Handling**
   - Follow existing pattern: try/catch with fallback
   - Use `withRetry` utility for API resilience
   - Graceful degradation to mock embeddings

### Scope Boundaries

**In Scope:**

- Voyage AI SDK integration
- Asymmetric retrieval implementation (voyage-4-large for docs, voyage-4 for queries)
- Database migration (768 → 1024 dimensions)
- Rate limiter updates for Voyage constraints
- Environment variable configuration
- Ingestion script updates
- Unit tests for new embedding service
- Integration tests for retrieval pipeline

**Out of Scope:**

- Changes to LLM generation (stays with Google Gemini)
- Changes to Vision service (stays with Google)
- Changes to Cohere reranking (already implemented)
- UI/frontend changes (backend only)
- Migration of existing embeddings (we're altering the table directly)
- Support for other Voyage models (finance, law, code-specific)

### Technical Considerations

1. **Integration Points:**
   - Replace `GoogleGenAI` embedding calls in `knowledge-base.service.ts`
   - Update `generateEmbedding()` and `generateEmbeddingsBatch()` methods
   - Maintain existing interfaces for minimal refactoring

2. **Existing System Constraints:**
   - Must work with existing pgvector PostgreSQL setup
   - Must maintain existing retry and error handling patterns
   - Must support mock embeddings for development
   - Must not break existing RAG evaluation framework

3. **Technology Preferences:**
   - Use `voyageai` npm package (official SDK)
   - TypeScript with proper typing
   - NestJS dependency injection pattern
   - Keep existing service abstractions

4. **Similar Code Patterns to Follow:**
   - Cohere client initialization (lines 165-185)
   - TokenRateLimiter implementation (lines 23-142)
   - Batch processing with retry (lines 1346-1456)
   - Mock embedding fallback (lines 1291-1294)

### Key Technical Decisions

1. **SDK Choice:** Use official `voyageai` npm package directly for maximum control
2. **Model Selection:** voyage-4-large (docs) + voyage-4 (queries) for cost/quality balance
3. **Dimension:** 1024 (default) - good balance of quality and storage
4. **Migration:** Clean slate - re-ingest all documents rather than convert
5. **Rate Limiting:** Extend existing TokenRateLimiter with Voyage-specific parameters
6. **Error Handling:** Maintain existing patterns with retry and fallback

### Performance Considerations

1. **Voyage-4-large:** 40% lower serving costs than comparable dense models
2. **Asymmetric Retrieval:** Additional savings by using smaller model for queries
3. **Batch Processing:** Voyage supports up to 1000 texts per request (vs Gemini's lower limits)
4. **Context Length:** 32K tokens for both models (vs Gemini's limits)

### Migration Checklist (For Production)

1. Set up `VOYAGE_API_KEY` environment variable
2. Backup embeddings table (safety measure)
3. Run database migration (ALTER TABLE to VECTOR(1024))
4. Deploy code changes
5. Run ingestion scripts to populate embeddings with Voyage
6. Monitor retrieval quality metrics
7. Remove backup after validation period

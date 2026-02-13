# ADR 009: Migrate to Voyage AI Embeddings

## Status

Accepted

## Context

Mamirri initially used Google Gemini (`gemini-embedding-001`) for generating text embeddings in the RAG pipeline. However, we encountered several significant issues with the Google GenAI service:

1. **Account Limitations**: Frequent "walls" and rate limits on the Google account hindered development and ingestion of large document sets.
2. **Retrieval Quality**: While competent, Gemini's 768-dimension embeddings were falling behind state-of-the-art models for specialized medical retrieval.
3. **Cost/Performance Balance**: As the library grows, the cost of high-quality retrieval needs to be optimized without sacrificing accuracy.

## Decision

We decided to migrate the embedding layer from Google Gemini to **Voyage AI**, specifically using the **Voyage-4** series.

### Key Implementation Details:

1. **Embedding Models**:
   - **Document Ingestion**: Use `voyage-4-large` (1024 dimensions) for maximum retrieval accuracy.
   - **Query Retrieval**: Use `voyage-4` (1024 dimensions) for lower latency and reduced per-query costs.
2. **Asymmetric Retrieval**: Leveraged the fact that the Voyage-4 series shares the same embedding space. This allows us to embed the "expensive" documents once with the largest model and use the "cheaper" mid-sized model for frequent user queries.
3. **Vector Dimensions**: Increased the `pgvector` column size from 768 to **1024** dimensions.
4. **Direct SDK Integration**: Used the official `voyageai` TypeScript SDK instead of generic wrappers for better control over batching (up to 1000 texts per request) and rate limiting.

## Consequences

- **Improved Accuracy**: Voyage-4-large currently holds state-of-the-art positions on various retrieval benchmarks (RTEB).
- **Cost Efficiency**: Asymmetric retrieval reduces query costs while maintaining the semantic richness of the document embeddings.
- **Migration Effort**: Existing embeddings in the database had to be wiped and re-ingested as 768-dim vectors are incompatible with 1024-dim vectors.
- **Dependency Update**: Added `voyageai` npm package to the backend.
- **Infrastructure**: Updated the `TokenRateLimiter` to support Voyage-specific token estimation (1.4x word count) and safety margins (90%).

## References

- [Voyage AI Text Embeddings Documentation](https://docs.voyageai.com/docs/embeddings)
- [Voyage-4 Series Announcement](https://blog.voyageai.com/2026/01/15/voyage-4/)

**Last Modified:** 2026-02-10

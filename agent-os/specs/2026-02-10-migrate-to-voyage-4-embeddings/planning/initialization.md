# Spec Initialization: Migrate to Voyage-4-Large Embeddings

## Raw Idea (User's Description)

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

**Potential Considerations:**

- Need to re-index all existing documents with new embeddings
- Database schema may need updates (vector dimension change from 768 to 1024)
- Rate limiting and batch processing strategies may differ
- API key management (VOYAGE_API_KEY vs GOOGLE_API_KEY)

## Spec Path

agent-os/specs/2026-02-10-migrate-to-voyage-4-embeddings

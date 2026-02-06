# Feature: RAG Optimization & Refinement

## Description

The user wants to optimize the existing RAG (Retrieval-Augmented Generation) system based on an expert review of the current implementation. The goal is to move from a "Production-Grade" system to a "State-of-the-Art" implementation by addressing specific technical recommendations.

## Core Objectives (from Expert Review)

1.  **Upgrade Chunking Logic**: Move from simple word-based splitting to **Recursive Character Splitting** to respect paragraph/sentence boundaries and improve embedding quality.
2.  **Implement Reranking**: Introduce a **Cross-Encoder** or **Cohere Rerank** step to refine the top K results from semantic search (e.g., retrieve 20, rerank to top 5).
3.  **Parent Document Retriever**: Implement **Small-to-Big Retrieval** (index small chunks for search, retrieve larger parent context for generation).
4.  **Hybrid Search**: Combine `pgvector` (semantic) with PostgreSQL `tsvector` (keyword/BM25) using **Reciprocal Rank Fusion (RRF)** to catch specific medical terms.
5.  **Vector Indexing**: Add an **HNSW index** to the `vector` column in PostgreSQL to ensure sub-second retrieval as the dataset grows.

## Roadmap Alignment

This aligns with **Week 16: AI Refinement (Buffer)** in the product roadmap, specifically:

- 16.3 Improve chunking strategy
- 16.5 Explainability (related to better context)
- Performance optimization (indexing)

## Context

The current system uses:

- `KnowledgeBaseService` for ingestion/retrieval.
- `AiAnalysisService` for orchestration.
- PostgreSQL 16 with `pgvector`.
- `gemini-embedding-001` and `gemini-3-flash`.
- Multi-query strategy is already implemented.
- Anonymization and Translation services are already in place.

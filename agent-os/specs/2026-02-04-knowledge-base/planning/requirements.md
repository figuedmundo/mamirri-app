# Spec Requirements: Knowledge Base Infrastructure (Week 12)

## Initial Description

Build the "brain" of the AI system by ingesting medical textbooks (PDFs) and making them searchable via vector embeddings.

## Requirements Discussion

### First Round Questions

**Q1:** PDF Parsing: Layout vs. Text?
**Answer:** We will use `pdf-parse` for its simplicity and robustness with text extraction. While medical texts have complex layouts, our primary goal is retrieving _content_ for the LLM context. We can accept some loss of layout fidelity in exchange for cleaner text processing. If critical tables are lost, we can revisit this later (e.g., using `unstructured` or `pdf2json`).

**Q2:** Chunking Strategy?
**Answer:** We will proceed with **500 words per chunk with a 50-word overlap**.

- **Why**: This size (approx. 600-700 tokens) fits well within standard LLM context windows while providing enough semantic context for retrieval.
- **Overlap**: Essential to ensure sentences/ideas aren't cut in half at chunk boundaries.

**Q3:** Embeddings Model?
**Answer:** We will use **Google Gemini `gemini-embedding-001`**.

- **Why**: Verified access via existing Google Pro subscription (Cost: $0/Low).
- **Dimension**: **3072 dimensions** (Standard) or reduced to 768 via config.
- **Decision**: We will configure it to output **768 dimensions** to save database space while maintaining high quality (Matryoshka Representation Learning allows this).
- **Performance**: Excellent multilingual support and huge context window (2k tokens).

**Q4:** Database Schema?
**Answer:**

- **Document Table**: Stores metadata (Title, Author, Year, FilePath).
- **Embedding Table**: Stores the vector (`vector(768)`), the text chunk content, a reference to the `Document`, and the `pageNumber` (critical for citations).
- **Citation**: The app _must_ be able to cite "Page 42 of 'Clinical Biomechanics'", so preserving page numbers during extraction is a hard requirement.

**Q5:** Ingestion Workflow?
**Answer:** **CLI Script (Developer Tool)** for now.

- **Why**: This is an admin task to "hydrate" the knowledge base. Building a full UI for upload/processing is unnecessary overhead for the MVP. We will create a script (e.g., `npm run knowledge:ingest`) that scans a local `data/books` folder.

### Existing Code to Reference

**Similar Features Identified:**

- **StorageService**: `apps/server/src/modules/storage/storage.service.ts` (File handling concepts)
- **Prisma Service**: `apps/server/src/modules/prisma/prisma.service.ts` (Database connection)
- **Groq/Whisper**: `apps/server/src/modules/transcription/transcription.service.ts` (External API integration pattern)

### Follow-up Questions

None required. The scope is clear: Build the backend infrastructure to ingest PDFs into a vector database.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **PDF Ingestion Script**: A Node.js script to read PDFs from `data/books`.
- **Text Extraction**: Extract text while preserving page numbers.
- **Chunking Logic**: Split text into 500-word chunks with overlap.
- **Vector Generation**: Call Google Gemini API (`gemini-embedding-001`) with `outputDimensionality: 768`.
- **Database Storage**: Store Document metadata and Embedding vectors (768 dimensions) in PostgreSQL.
- **Search Function**: A service method `findSimilar(query: string)` that returns relevant chunks.

### Reusability Opportunities

- Reuse `PrismaService` for database access.
- Reuse `ConfigService` for API keys (Google).
- Follow the module pattern used in `TranscriptionModule`.

### Scope Boundaries

**In Scope:**

- Backend module `KnowledgeBaseModule`.
- CLI script for ingestion.
- Prisma schema updates (`Document`, `Embedding` with `vector(768)`).
- Integration with Google Generative AI SDK (`gemini-embedding-001`).

**Out of Scope:**

- Frontend UI for searching or uploading books.
- RAG (Retrieval Augmented Generation) logic (connecting this to an LLM chat) - this comes in Week 14.
- Handling scanned PDFs (OCR) - assume text-selectable PDFs for now.

### Technical Considerations

- **Dependencies**: `pdf-parse`, `langchain` (optional, for splitting), `@google/generative-ai`.
- **Database**: Requires `pgvector` extension enabled on PostgreSQL.
- **Env Vars**: `GOOGLE_API_KEY` must be added (already present).

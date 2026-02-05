# Specification: Knowledge Base Infrastructure

## Goal

Build the "brain" of the AI system by creating a backend infrastructure to ingest, chunk, and store medical textbooks as vector embeddings in PostgreSQL using Google Gemini (`gemini-embedding-001`).

## User Stories

- As a developer, I want to run a script to ingest a folder of PDF textbooks so that they are added to the knowledge base.
- As the AI system, I want to query the database with a medical question and retrieve relevant book passages to answer accurately.
- As a developer, I want to see which book and page number a piece of information came from so I can verify citations.

## Specific Requirements

**PDF Ingestion Script**

- Create a CLI script `scripts/ingest-books.ts` runnable via `npm run knowledge:ingest`.
- Scan `data/books/*.pdf` (git-ignored folder).
- Use `pdf-parse` to extract text while attempting to preserve page breaks (or approximate them) to track page numbers.
- Skip files that have already been ingested (check by `filePath` in DB to avoid duplicates).
- Log progress: print each file processed, success/failure counts, and any parsing errors.

**Text Chunking & Metadata**

- Split extracted text into chunks of **500 words** with a **50-word overlap**.
- Each chunk object must contain:
  - `content`: The text string.
  - `pageNumber`: The starting page number of the chunk.
  - `bookId`: Reference to the parent book record.

**Vector Generation (Google Gemini)**

- Integrate `@google/generative-ai` SDK.
- Use model **`gemini-embedding-001`**.
- Configure `outputDimensionality: 768` (Matryoshka compression) to optimize storage.
- Implement rate limiting/backoff handling to respect API quotas during bulk ingestion.

**Database Schema (PostgreSQL + pgvector)**

- Enable `vector` extension in a migration.
- **`Document` Model**:
  - `id` (UUID)
  - `title` (String)
  - `author` (String, optional)
  - `filePath` (String, unique) - used for deduplication
  - `createdAt` (DateTime)
- **`Embedding` Model**:
  - `id` (UUID)
  - `content` (String - text chunk)
  - `vector` (Unsupported("vector(768)"))
  - `pageNumber` (Int)
  - `documentId` (UUID, FK to Document)
- Add HNSW index on vector column for similarity search performance

**Knowledge Base Service**

- Create `KnowledgeBaseService` in `apps/server/src/modules/knowledge-base`.
- Implement `findSimilar(query: string, limit: number = 5)`:
  - Generates vector for the query string using Google API.
  - Performs cosine similarity search using Prisma `queryRaw`.
  - Returns array of results with:
    - `content`: The text chunk
    - `pageNumber`: Page number
    - `document`: { `title`, `author`, `filePath` }
    - `similarity`: Score (0-1)

## Existing Code to Leverage

**`PrismaService`**

- Reuse `apps/server/src/prisma/prisma.service.ts` for database connections.
- Follow the pattern in `PatientsService` for injecting Prisma.

**`TranscriptionService`**

- Reuse the pattern of injecting `ConfigService` to retrieve API keys (`GOOGLE_API_KEY`), as seen in `apps/server/src/modules/transcription/transcription.service.ts`.

**`StorageService`**

- Reference `apps/server/src/modules/storage/storage.service.ts` for file handling best practices (though we are reading local files here, not S3).

## Dependencies Required

Add these packages to `apps/server/package.json`:

```bash
cd apps/server
pnpm add @google/generative-ai pdf-parse
```

## Environment Variables

Add to `.env`:

- `GOOGLE_API_KEY`: API key for Google Generative AI (gemini-embedding-001)

## Out of Scope

- Frontend UI for uploading books (CLI only for now).
- Chat interface or RAG generation logic (this spec is _only_ storage/retrieval).
- OCR for scanned PDFs (assume clean, text-selectable PDFs).
- Complex layout parsing (tables/images are ignored, focusing on text).
- Multi-tenant knowledge bases (one global library for the MVP).

## Notes

- **Page Number Tracking**: `pdf-parse` provides page information, but accuracy depends on PDF structure. Page numbers may be approximate for complex documents.
- **Error Handling**: If a PDF fails to parse, log the error and continue processing other files (don't stop entire ingestion).
- **Rate Limiting**: Use exponential backoff for Google API calls (reuse `withRetry` utility from TranscriptionService).

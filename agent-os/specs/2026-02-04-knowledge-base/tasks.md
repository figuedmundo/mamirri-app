# Task Breakdown: Knowledge Base Infrastructure (Week 12)

## Overview

Total Tasks: 10

## Task List

### Setup

#### Task Group 0: Dependencies and Configuration

**Dependencies:** None

- [x] 0.0 Complete setup
  - [x] 0.1 Install required dependencies
    - Run `cd apps/server && pnpm add @google/generative-ai pdf-parse`
  - [x] 0.2 Add npm script to `apps/server/package.json`
    - Add `"knowledge:ingest": "ts-node scripts/ingest-books.ts"` to scripts section
  - [x] 0.3 Create data directory
    - Create `apps/server/data/books/` directory
    - Add `data/books/` to `.gitignore` if not already present
  - [x] 0.4 Add GOOGLE_API_KEY to environment
    - Document that `GOOGLE_API_KEY` should be added to `.env`
    - Follow pattern from TranscriptionService for ConfigService usage

**Acceptance Criteria:**

- Dependencies are installed in apps/server
- `npm run knowledge:ingest` script is available
- Data directory exists and is git-ignored

### Database Layer

#### Task Group 1: Data Models and Migrations

**Dependencies:** Task Group 0

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 2-8 focused tests for Document and Embedding models
    - Test creation of Document record
    - Test creation of Embedding record
    - Test association between Document and Embedding
  - [x] 1.2 Enable pgvector extension
    - Create migration to enable `vector` extension if not exists
  - [x] 1.3 Create Document and Embedding models
    - Document: id, title, author, filePath, createdAt
    - Embedding: id, content, vector (768), pageNumber, documentId
    - Add index for vector similarity search (hnsw or ivfflat)
  - [x] 1.4 Ensure database layer tests pass
    - Run ONLY the tests written in 1.1
    - Verify migrations run successfully

**Acceptance Criteria:**

- Models creation and associations work
- `vector` extension is enabled in Postgres
- Migrations apply successfully

### Backend Logic

#### Task Group 2: Knowledge Base Service & Ingestion

**Dependencies:** Task Groups 0-1

- [x] 2.0 Complete Knowledge Base Service
  - [x] 2.1 Write 2-8 focused tests for ingestion logic
    - Test PDF text extraction (mock pdf-parse)
    - Test chunking logic (500 words/50 overlap)
    - Test embedding generation call (mock Google API)
  - [x] 2.2 Implement KnowledgeBaseService
    - Method: `ingestFile(filePath)`
    - Method: `findSimilar(query, limit)`
    - Integration with `@google/generative-ai`
  - [x] 2.3 Implement PDF Ingestion Script
    - Create `scripts/ingest-books.ts`
    - Scan `data/books` folder
    - Call service for processing
  - [x] 2.4 Ensure backend tests pass
    - Run ONLY tests from 2.1
    - Verify embedding generation (mocked) and storage

**Acceptance Criteria:**

- Script can read a PDF and store chunks in DB
- `findSimilar` returns relevant chunks
- Google API is called correctly with `gemini-embedding-001`

### Verification

#### Task Group 3: Integration Verification

**Dependencies:** Task Groups 0-2

- [x] 3.0 Verify End-to-End Flow
  - [x] 3.1 Manual Test: Ingest a sample PDF
    - Place a PDF in `data/books`
    - Run `npm run knowledge:ingest`
    - Check DB for records
  - [x] 3.2 Manual Test: Semantic Search
    - Create a temporary script `scripts/test-search.ts`
    - Query for a concept from the book
    - Verify returned chunks match expected content

**Acceptance Criteria:**

- Real PDF ingestion works
- Real search returns semantically relevant results

## Execution Order

1. Setup (Task Group 0)
2. Database Layer (Task Group 1)
3. Backend Logic (Task Group 2)
4. Verification (Task Group 3)

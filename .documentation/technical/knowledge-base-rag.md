# Retrieval-Augmented Generation (RAG) and Knowledge Base

Mamirri uses Retrieval-Augmented Generation (RAG) to provide clinically relevant suggestions based on medical literature. This ensures that AI responses aren't just generic but are grounded in specific, cited medical books.

## What is RAG?

RAG is a technique that gives an AI model access to external data (like PDFs of medical books) to improve its accuracy. Instead of relying solely on what the model learned during its initial training, it "retrieves" relevant passages from a library before "generating" an answer.

Think of it like an open-book exam:

1. **Search**: The AI looks through the library for the most relevant pages.
2. **Read**: It reads those specific pages.
3. **Answer**: It answers the question using only the information it found.

## How Mamirri uses RAG

Mamirri uses a sophisticated Clinical Knowledge Engineering (CKE) approach to building its library. This process is divided into two main phases: Ingestion and Retrieval.

### Phase 1: Ingestion (Knowledge Engineering)

The ingestion process is decoupled to ensure high-quality data and allow for **Human-in-the-Loop (HITL)** curation.

#### Step 1: Conversion (PDF → Markdown)

First, we convert raw PDF files into a clean, reviewable Markdown format.

1.  **Input**: Place PDF files in `apps/server/data/library/temporal/`.
2.  **Extraction**: The system uses **IBM Docling** to extract text from the PDF.
3.  **Metadata Extraction**: **Gemini 3 Flash** identifies the Title, Author, Volume, and Year.
4.  **Staging**: The result is saved as a Markdown file in `apps/server/data/library/temporal/`.

#### Step 2: Human-in-the-Loop Curation (CRITICAL)

Before vectorizing the book, a human expert should review the Markdown file in `temporal/` and apply **CKE Tags**. This is the single most important step for search quality.

##### A. File Archetypes (The Book's Role)

Add a YAML header at the very top of the file to define the book's clinical role. This affects search weighting (e.g., Practical books get boosted for "How-to" questions).

```yaml
---
title: "The Physiotherapist's Pocketbook"
author: 'Kenyon & Kenyon'
archetype: PRACTICAL # OPTIONS: PRACTICAL, ACADEMIC, ATLAS, CASE_STUDY, GENERAL
specialty: physiotherapy
---
```

| Archetype      | Description                                       | AI Search Weight                                |
| :------------- | :------------------------------------------------ | :---------------------------------------------- |
| **PRACTICAL**  | Pocketbooks, treatment guides, "cheat sheets".    | **Boosted by 20%** for action-oriented queries. |
| **ACADEMIC**   | Deep physiology, anatomy theory, large textbooks. | Primary source for "Why" and mechanisms.        |
| **CASE_STUDY** | Detailed patient scenarios and outcomes.          | Boosted for symptom-matching queries.           |
| **ATLAS**      | High density of structural/anatomical data.       | Used for physical/spatial relationships.        |

##### B. Manual Control Tags (The Overrides)

Use HTML comments to fix specific pages or sections.

- **`<!-- chunk: exclude -->` (Noise Control)**: Wrap this around pages with zero clinical value (Preface, Author list, Index, Bibliography). The system will physically delete this content before it touches the database.
- **`<!-- chunk: merge -->` (Cohesion Control)**: Use this to "glue" related text together into a single unbreakable chunk. Essential for keeping a medical definition next to its data table.
- **`<!-- section: [TYPE] -->` (Clinical Label)**: Tag a specific section as a `clinical-case` or `protocol` to help the Reranker identify high-value data.

**Example of a perfectly curated section:**

```markdown
<!-- section: clinical-case -->
<!-- chunk: merge -->

### Case Study: L5 Radiculopathy

A 45-year-old male presents with acute lower back pain...
[...Table of symptoms...]
The outcome after manual therapy was...

<!-- chunk: end -->
<!-- section: end -->

<!-- chunk: exclude -->

## Index of Authors

Abbott, R. 12, 45...

<!-- chunk: end -->
```

#### Step 3: Final Ingestion (Markdown → Vector DB)

Once the Markdown is curated, process it into vectors:

1.  **Parsing**: The system reads your manual tags and filters out the `exclude` blocks.
2.  **Tagging**: Chunks inside a `section` tag are labeled in the database.
3.  **Embedding**: Text is converted to 1024-dim vectors using **Voyage AI**.
4.  **Storage**: Vectors and metadata (including Archetypes) are saved to PostgreSQL.

---

### Phase 2: Retrieval (Finding the Answer)

When a therapist needs a suggestion or searches the library:

1.  **Query Transformation (HyDE)**: If `ENABLE_HYDE=true`, the system uses **Gemini 3 Flash** to generate a hypothetical "ideal" clinical description based on the query. This improves retrieval for vague symptom descriptions.
    - **Diagnosis & Treatment**: Both use HyDE for expanded context.
    - **Contraindications**: Always uses the original query to ensure strict keyword matching for safety.
2.  **Query Embedding**: Mamirri converts the search query (or the HyDE synthetic document) into a vector using **Voyage AI** (`voyage-4`, 1024 dim).
    - **Asymmetric Retrieval**: We use a higher-quality model (`voyage-4-large`) for indexing documents and a cost-optimized, compatible model (`voyage-4`) for user queries.
3.  **Hybrid Search**: Combines two retrieval methods for better results:
    - **Dense (Vector) Search**: Finds semantically similar chunks using cosine similarity.
    - **Sparse (BM25) Search**: Finds exact keyword matches using PostgreSQL full-text search.
4.  **Reciprocal Rank Fusion (RRF)**: Merges results from both methods using the formula `score = 1/(k + rank)` where k=60.
5.  **Reranking**: If `COHERE_API_KEY` is configured, results are reranked using **Cohere Rerank v4.0-pro**. This model is specifically trained for cross-encoder reranking, providing a massive boost in precision by evaluating the actual relationship between the query and each chunk.
6.  **Context**: The top-ranked chunks are provided to the AI to generate a grounded response with citations (title and page number).

#### Search Architecture

```
Query: "dolor lumbar vago"
         │
         ├── HyDE (Gemini 3 Flash) ─── Synthetic Passage
         │                               │
         ├── Dense Search <──────────────┘
         │   (semantic similarity)       │
         │                               ├── RRF Fusion ── Rerank (Cohere v4) ── Top K Results
         └── BM25 Search ───────────────┘
             (exact keywords)
```

## Operational Commands

You can manage the knowledge base using these commands from the project root:

| Command                                      | Description                                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm knowledge:convert`                     | (Default) High-fidelity extraction using IBM Docling OCR for complex medical textbooks.                   |
| `pnpm knowledge:convert -- --engine=pymupdf` | Fast, rule-based extraction (legacy fallback).                                                            |
| `pnpm knowledge:convert -- --pages=1,10`     | Converts only a specific page range (useful for testing quality).                                         |
| `pnpm knowledge:ingest`                      | Ingests Markdown files from `data/library/temporal/` into the Vector DB. (Default: naive chunking).       |
| `pnpm knowledge:batch-status`                | Checks status of async batch ingestion jobs and downloads results when ready.                             |
| `pnpm knowledge:search "query"`              | Performs a semantic search across all ingested books (Raw).                                               |
| `pnpm knowledge:rag "query"`                 | Performs the FULL AI retrieval pipeline (HyDE + Translation + Rerank).                                    |
| `pnpm knowledge:list`                        | Displays a clean list of all ingested books with their ID, Title, Volume, and File Path.                  |
| `pnpm knowledge:update "ID" --options`       | Manually corrects or updates a book's metadata (title, author, volume, edition, year).                    |
| `pnpm knowledge:clean "ID or filename.pdf"`  | Removes a specific book and its embeddings from the database to allow re-ingestion.                       |
| `pnpm knowledge:backup`                      | **Full System Backup**: Creates a timestamped SQL dump of the entire database (Patients, Users, Library). |
| `pnpm knowledge:export`                      | **Library Export**: Polymorphic command to export all books or a single book (see Migration section).     |
| `pnpm knowledge:restore "path/to/file.sql"`  | Restores the database from a backup file (Warning: Overwrites current data).                              |

| `pnpm knowledge:stats` | Displays technical database statistics (total chunks per book). |
| `pnpm knowledge:wipe` | **DANGER**: Wipes all books and vectors from the database (useful before a clean import). |

### Migration & Data Protection

Mamirri uses a multi-tiered backup strategy to protect expensive vector data and ensure system-wide recoverability.

#### 1. Full System Backup

Saves the entire application state, including Patient records, Clinical Cases, User profiles, and the entire Medical Library. Use this for disaster recovery.

```bash
pnpm knowledge:backup
```

_Creates: `backups/full_db_[TIMESTAMP].sql.gz`\_

#### 2. Library-wide Export (Migration)

Saves **only** the vectorized books (documents and embeddings). This is ideal for moving your medical knowledge base to a different environment (e.g., from dev to production) without including sensitive patient data.

```bash
pnpm knowledge:export
```

_Creates: `backups/library/library_all_[TIMESTAMP].sql.gz`\_

#### 3. Atomic Book Backups (Standalone)

Creates a standalone backup of a **single book** and its associated embeddings. This is the most granular level of backup, allowing you to share or move individual textbooks.

```bash
# Export using the Document ID
pnpm knowledge:export 550e8400-e29b-41d4-a716-446655440000

# Export using the original File Path
pnpm knowledge:export data/library/markdowns/anatomy_atlas.md
```

_Creates: `backups/library/[Book_Title].sql.gz`_

#### 4. Smart Restore / Import

The `knowledge:import` (or `knowledge:restore`) command automatically handles both full system backups and library-only exports, including support for compressed (`.gz`) files.

```bash
# To list available backups
pnpm knowledge:restore

# To restore a specific file
pnpm knowledge:import "backups/library/Anatomia_Tomo1.sql.gz"
```

_Note: Full restores will overwrite current data, while library-only imports will append to the existing library if IDs do not conflict._

### Adding books to the library

1.  **Place PDFs**: Put your PDF files in `apps/server/data/library/temporal/`.
2.  **Convert**: Run the conversion script to generate Markdown.
    ```bash
    pnpm knowledge:convert
    ```
3.  **Review**: Check the generated files in `apps/server/data/library/temporal/`. You can edit the YAML frontmatter (Title, Author, Year) if needed.
4.  **Ingest**: Run the ingestion command to vectorize.

    ```bash
    # Default: Naive chunking (Synchronous - use for small files)
    pnpm knowledge:ingest

    # Batch API Mode (Recommended for large libraries)
    # Bypasses rate limits and uses 33% discount
    pnpm knowledge:ingest -- --batch

    # Optional: Semantic chunking (Can be combined with --batch)
    pnpm knowledge:ingest -- --semantic-chunking

    # Power User: Batch Mode + Semantic Chunking (Best Quality & Reliability)
    pnpm knowledge:ingest -- --batch --semantic-chunking
    ```

5.  **Check Batch Status**: If you used `--batch`, check progress later (processing can take up to 12 hours).
    ```bash
    pnpm knowledge:batch-status
    ```

### API Quota Considerations

**Google Gemini** (LLM/Vision) uses the standard free tier limits.
**Voyage AI** (Embeddings) offers a generous free tier but with distinct limits:

| Limit                     | Free Tier (Sync) | Batch API (Async) | Paid Tier |
| ------------------------- | ---------------- | ----------------- | --------- |
| Requests per minute (RPM) | 3                | **Unlimited**     | 2,000+    |
| Tokens per minute (TPM)   | 10,000           | **Unlimited**     | 3M+       |
| Total Tokens (Life)       | 200 Million      | 200 Million       | Unlimited |

**Recommendation:**
ALWAYS use `pnpm knowledge:ingest -- --batch` for ingesting books. This uses the Async Batch API which bypasses the strict 10k TPM limit and prevents "Rate Limit Exceeded" errors.

### Managing the Library

To see exactly what books are in your database and get their unique IDs:

```bash
pnpm knowledge:list
```

To manually correct a book's metadata (e.g., if the AI missed a Volume or Edition):

```bash
pnpm knowledge:update "BOOK_ID_OR_FILEPATH" --volume "Tomo 1" --edition "5th Ed"
```

### Verifying Ingestion

To see a summary of what is currently in your vector database:

```bash
pnpm knowledge:stats
```

To test that the AI can actually "understand" the content:

```bash
pnpm knowledge:search "huesos del carpo"
```

### Clinical Retrieval Pipeline (The "Brain")

When a user asks a clinical question, the system uses a high-sophistication pipeline to ensure accuracy across languages:

1.  **Input**: Spanish query (e.g., _"fascitis plantar"_).
2.  **Cross-Lingual Normalization**:
    - **HyDE (Primary)**: If `ENABLE_HYDE=true`, generates a 4,000+ character hypothetical clinical document **in English**. This bridges the gap between Spanish user terminology and deep English medical literature.
    - **Translation (Fallback)**: If HyDE is disabled or fails, the system performs direct Spanish $\rightarrow$ English technical translation.
3.  **Deduplicated Retrieval**:
    - Fetches 8 candidates per query (Total ~24 chunks).
    - **Deduplication**: Automatically groups results by `parentId`. We only show the single most relevant chunk from any given parent section to ensure diversity and avoid redundant results.
4.  **Cohere Rerank v4-pro**: Re-evaluates all chunks against the original query using a multilingual cross-encoder for the final top 8.

#### CLI Testing

Use the following command to test the full "Brain" logic:

```bash
pnpm --filter server knowledge:rag "your query"
```

## Troubleshooting Failures

If an ingestion is interrupted (e.g., due to rate limits or internet failure):

1.  **Auto-Cleanup**: The system is designed to automatically delete the partial "Document" record if the process crashes. Running `pnpm knowledge:ingest` again will restart the book from the beginning.
2.  **Manual Reset**: If a book seems corrupted or incomplete in search results, you can force a reset by running:
    ```bash
    pnpm knowledge:clean "Latarjet_Ruiz_Liard_Anatomia_Humana_5a_E.pdf"
    ```
    Then, run `pnpm knowledge:ingest` to process it again.

## Technical Stack

- **Vector Storage**: PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)
- **Embeddings Model**: Voyage AI (`voyage-4-large` 1024-dim for docs, `voyage-4` for queries)
- **Metadata Orchestration**: Google Gemini 3 (`gemini-3-flash-preview`)
- **Query Transformation**: HyDE (Hypothetical Document Embeddings) via Gemini 3 Flash
- **PDF Extraction**: **IBM Docling** (Computer Vision & OCR) or **PyMuPDF4LLM** (Fast fallback)
- **Database Layer**: Prisma (using `Unsupported("vector(1024)")` for vector types)
- **Indexing**: HNSW (Hierarchical Navigable Small World) for fast similarity searches.
- **Optimization**: Matryoshka Representation Learning (MRL) for efficient 768-dim storage.
- **Hybrid Search**: BM25 (PostgreSQL tsvector) + Dense vectors with RRF fusion
- **Reranking**: Cohere Rerank API (**v4.0-pro**)

## Environment Variables

| Variable         | Required | Description                                                        |
| :--------------- | :------- | :----------------------------------------------------------------- |
| `VOYAGE_API_KEY` | Yes      | Voyage AI API key for embeddings and batch ingestion               |
| `COHERE_API_KEY` | No       | Cohere API key for **v4.0-pro** reranking (highly recommended)     |
| `ENABLE_HYDE`    | No       | Set to `true` to enable HyDE query transformation (default: false) |

### Advanced Configuration (Voyage AI)

These variables control how the system batches requests to Voyage AI.

| Variable                      | Default  | Description                                                                                                                                                  |
| :---------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VOYAGE_REALTIME_BATCH_LIMIT` | `1000`   | **Sync API Limit**: Max chunks per single HTTP request to `/v1/embeddings`.<br>_(Note: System automatically reduces this dynamically to respect TPM limits)_ |
| `VOYAGE_JOB_FILE_LIMIT`       | `100000` | **Async Batch Limit**: Max chunks per JSONL file uploaded to `/v1/batches`.<br>Used only when running with `--batch`.                                        |
| `VOYAGE_RATE_LIMIT_TPM`       | `10000`  | **Safety Cap**: Max Tokens Per Minute for Sync API.<br>Used to throttle real-time ingestion on Free Tier.                                                    |

Without `COHERE_API_KEY`, the system falls back to RRF-only ranking. Without `ENABLE_HYDE`, the system uses the raw user query.

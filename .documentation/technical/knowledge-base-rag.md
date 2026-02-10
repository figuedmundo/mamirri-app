# Retrieval-Augmented Generation (RAG) and Knowledge Base

Mamirri uses Retrieval-Augmented Generation (RAG) to provide clinically relevant suggestions based on medical literature. This ensures that AI responses aren't just generic but are grounded in specific, cited medical books.

## What is RAG?

RAG is a technique that gives an AI model access to external data (like PDFs of medical books) to improve its accuracy. Instead of relying solely on what the model learned during its initial training, it "retrieves" relevant passages from a library before "generating" an answer.

Think of it like an open-book exam:

1. **Search**: The AI looks through the library for the most relevant pages.
2. **Read**: It reads those specific pages.
3. **Answer**: It answers the question using only the information it found.

## How Mamirri uses RAG

The process is divided into two main phases: Ingestion and Retrieval.

### Phase 1: Ingestion (Building the Library)

The ingestion process is decoupled into two steps to ensure high-quality data and allow for manual review.

#### Step 1: Conversion (PDF → Markdown)

First, we convert raw PDF files into a clean, reviewable Markdown format.

1.  **Input**: Place PDF files in `apps/server/data/pdfs/`.
2.  **Extraction**: The system uses **PyMuPDF4LLM** to extract text from the PDF. This tool is optimized for RAG, preserving layout, tables, and headers better than standard extractors.
3.  **Metadata Extraction**: **Gemini 3 Flash** analyzes the first few pages to extract:
    - Title
    - Author
    - Volume / Edition
    - Publication Year
4.  **Staging**: The result is saved as a Markdown file in `apps/server/data/markdowns/`.
    - **Frontmatter**: A YAML header containing the extracted metadata (which you can manually edit if needed).
    - **Content**: The full text of the book in Markdown.
5.  **Archive**: The original PDF is moved to `apps/server/data/archive/pdfs/`.

#### Step 2: Ingestion (Markdown → Vector DB)

Once the Markdown files are in the staging area (`data/markdowns/`), they are processed into vectors.

1.  **Input**: Reads `.md` files from `apps/server/data/markdowns/`.
2.  **Chunking**: Breaks the text into chunks.
    - **Naive Chunking** (default): ~500 words with overlap.
    - **Semantic Chunking** (opt-in): Uses embeddings to find topic boundaries.
3.  **Embedding**: Converts chunks to vectors using **Google Gemini** (`gemini-embedding-001`, 768 dim).
4.  **Storage**: Saves vectors to PostgreSQL (`pgvector`).
5.  **Finalizing**:
    - Moves the Markdown file to the final library folder: `apps/server/data/books/`.
    - Creates an **Atomic Backup** (`.sql.gz`) of the newly ingested book in `backups/library/`.

#### Chunking Strategy Comparison

| Strategy              | Embeddings per Book | API Quota Needed        | Best For                               |
| --------------------- | ------------------- | ----------------------- | -------------------------------------- |
| **Naive** (default)   | ~800-1,000          | Fits free tier (1K/day) | Most use cases, hobby projects         |
| **Semantic** (opt-in) | ~25,000-30,000      | Requires paid tier      | Production with high-quality retrieval |

**Why the difference?** Semantic chunking embeds every sentence to calculate similarity scores between adjacent sentences, then groups similar sentences into coherent chunks. This produces better topical boundaries but consumes ~30x more API quota.

### Phase 2: Retrieval (Finding the Answer)

When a therapist needs a suggestion or searches the library:

1. **Query Transformation (HyDE)**: If `ENABLE_HYDE=true`, the system uses **Gemini 3 Flash** to generate a hypothetical "ideal" clinical description based on the query. This improves retrieval for vague symptom descriptions.
   - **Diagnosis & Treatment**: Both use HyDE for expanded context.
   - **Contraindications**: Always uses the original query to ensure strict keyword matching for safety.
2. **Query Embedding**: Mamirri converts the search query (or the HyDE synthetic document) into a vector.
   - **Task Type**: We use `RETRIEVAL_QUERY` for the search term to ensure the best semantic match against indexed documents.
3. **Hybrid Search**: Combines two retrieval methods for better results:
   - **Dense (Vector) Search**: Finds semantically similar chunks using cosine similarity.
   - **Sparse (BM25) Search**: Finds exact keyword matches using PostgreSQL full-text search.
4. **Reciprocal Rank Fusion (RRF)**: Merges results from both methods using the formula `score = 1/(k + rank)` where k=60.
5. **Reranking**: If `COHERE_API_KEY` is configured, results are reranked using **Cohere Rerank v4.0-pro**. This model is specifically trained for cross-encoder reranking, providing a massive boost in precision by evaluating the actual relationship between the query and each chunk.
6. **Context**: The top-ranked chunks are provided to the AI to generate a grounded response with citations (title and page number).

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

| Command                                        | Description                                                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `pnpm knowledge:convert`                       | (Default) High-fidelity extraction using IBM Docling OCR for complex medical textbooks.                         |
| `pnpm knowledge:convert -- --engine=pymupdf`   | Fast, rule-based extraction (legacy fallback).                                                                  |
| `pnpm knowledge:convert -- --pages=1,10`       | Converts only a specific page range (useful for testing quality).                                               |
| `pnpm knowledge:ingest`                        | Ingests Markdown files from `data/markdowns/` into the Vector DB. (Default: naive chunking).                    |
| `pnpm knowledge:ingest -- --semantic-chunking` | Uses **semantic chunking** for higher-quality retrieval. Requires paid API tier or multiple days of free quota. |
| `pnpm knowledge:search "query"`                | Performs a semantic search across all ingested books.                                                           |
| `pnpm knowledge:list`                          | Displays a clean list of all ingested books with their ID, Title, Volume, and File Path.                        |
| `pnpm knowledge:update "ID" --options`         | Manually corrects or updates a book's metadata (title, author, volume, edition, year).                          |
| `pnpm knowledge:clean "ID or filename.pdf"`    | Removes a specific book and its embeddings from the database to allow re-ingestion.                             |
| `pnpm knowledge:backup`                        | Creates a timestamped SQL backup of the entire vector database in the `backups/` folder.                        |
| `pnpm knowledge:restore "path/to/file.sql"`    | Restores the database from a backup file (Warning: Overwrites current data).                                    |
| `pnpm knowledge:stats`                         | Displays technical database statistics (total chunks per book).                                                 |
| `pnpm knowledge:wipe`                          | **DANGER**: Wipes all books and vectors from the database (useful before a clean import).                       |

### Migration & Data Protection

Mamirri uses a high-performance, atomic backup strategy to protect expensive vector data while minimizing disk usage.

#### 1. Individual "Atomic" Book Backups

When you run `pnpm knowledge:ingest`, the system automatically creates a compressed `.sql.gz` file for **each specific book** in `backups/library/`.

- **Benefit**: You only back up each book once. If you add 1,000 books, you have 1,000 small files instead of one giant 10GB file.

#### 2. Full System Backup

Saves everything (Library + Patients + Users) into a compressed file.

```bash
pnpm knowledge:backup
```

#### 3. Selective Multi-Book Export

Saves **all** currently ingested books into one compressed file.

```bash
pnpm knowledge:export
```

#### 4. Smart Restore / Import

The `knowledge:import` command automatically handles both compressed (`.gz`) and standard SQL files.

```bash
pnpm knowledge:import "backups/library/Anatomia_Tomo1.sql.gz"
```

#### 2. Export Library Only (Migration)

Saves **only** the vectorized books and metadata. Perfect for moving your library to production.

```bash
pnpm knowledge:export
```

#### 3. Import Library

**Crucial**: Always ensure your database schema is up to date before importing data.

```bash
# 1. Sync the schema (Migrations)
pnpm db:deploy

# 2. Import the data
pnpm knowledge:import "backups/your_file.sql"
```

If you use a `library_only_...` file, it will append those books to your database without touching existing patients/users.

#### 4. Clean Slate Import

If you want to replace your current library with a new one:

```bash
pnpm knowledge:wipe
pnpm knowledge:import "backups/your_file.sql"
```

To see a list of available backups:

```bash
pnpm knowledge:restore
```

### Adding books to the library

1.  **Place PDFs**: Put your PDF files in `apps/server/data/pdfs/`.
2.  **Convert**: Run the conversion script to generate Markdown.
    ```bash
    pnpm knowledge:convert
    ```
3.  **Review**: Check the generated files in `apps/server/data/markdowns/`. You can edit the YAML frontmatter (Title, Author, Year) if needed.
4.  **Ingest**: Run the ingestion command to vectorize.

    ```bash
    # Default: Naive chunking
    pnpm knowledge:ingest

    # Optional: Semantic chunking
    pnpm knowledge:ingest -- --semantic-chunking
    ```

### API Quota Considerations

Google Gemini's free tier has strict limits. Mamirri now includes a **Dual Rate Limiter** to protect against these limits automatically.

| Limit                     | Free Tier | Paid Tier |
| ------------------------- | --------- | --------- |
| Requests per minute (RPM) | 100       | 1,000+    |
| Tokens per minute (TPM)   | 30,000    | Unlimited |
| Requests per day (RPD)    | 1,000     | Unlimited |

**How the System Protects You:**

1.  **RPM Protection**: Tracks the number of requests (including batches) and enforces a delay if you approach 100 requests/minute.
2.  **TPM Protection**: Tracks token usage and pauses ingestion if you approach 30,000 tokens/minute.
3.  **Adaptive Batching**: For batch operations (like Semantic Chunking), the system automatically adds delays (approx. 7-8s) between batches to stay safely within the 100 RPM limit.

**Note on Speed**: Ingestion may feel slower due to these safety delays, but it ensures the process completes without crashing.

#### Recommended Approach by Use Case

| Use Case                         | Chunking Strategy | Quota Needed                 |
| -------------------------------- | ----------------- | ---------------------------- |
| Hobby project                    | Naive (default)   | ~800/book, fits free tier    |
| Small clinic (1-2 books)         | Naive             | Free tier works              |
| Large library (10+ books)        | Naive             | Free tier over multiple days |
| Production with quality priority | Semantic          | Paid tier ($1-5/month)       |

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
- **Embeddings Model**: Google Gemini (`gemini-embedding-001` - Latest 2025 Model)
- **Metadata Orchestration**: Google Gemini 3 (`gemini-3-flash-preview`)
- **Query Transformation**: HyDE (Hypothetical Document Embeddings) via Gemini 3 Flash
- **PDF Extraction**: **IBM Docling** (Computer Vision & OCR) or **PyMuPDF4LLM** (Fast fallback)
- **Database Layer**: Prisma (using `Unsupported("vector(768)")` for vector types)
- **Indexing**: HNSW (Hierarchical Navigable Small World) for fast similarity searches.
- **Optimization**: Matryoshka Representation Learning (MRL) for efficient 768-dim storage.
- **Hybrid Search**: BM25 (PostgreSQL tsvector) + Dense vectors with RRF fusion
- **Reranking**: Cohere Rerank API (**v4.0-pro**)

## Environment Variables

| Variable         | Required | Description                                                        |
| ---------------- | -------- | ------------------------------------------------------------------ |
| `GOOGLE_API_KEY` | Yes      | Google Gemini API key for embeddings and HyDE generation           |
| `COHERE_API_KEY` | No       | Cohere API key for **v4.0-pro** reranking (highly recommended)     |
| `ENABLE_HYDE`    | No       | Set to `true` to enable HyDE query transformation (default: false) |

Without `COHERE_API_KEY`, the system falls back to RRF-only ranking. Without `ENABLE_HYDE`, the system uses the raw user query.

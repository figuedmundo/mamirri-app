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

Before the AI can search books, they must be processed into a format it can understand:

1. **Extraction**: Mamirri reads PDF files from `apps/server/data/books`.
2. **Chunking**: Large books are broken down into smaller "chunks" of about 500 words. This ensures the AI can pinpoint specific sections rather than reading an entire chapter.
3. **Embedding**: Each chunk is converted into a list of numbers called a "vector" using Google Gemini's latest `gemini-embedding-001` model (released in 2025).
   - **Task Type**: We use `RETRIEVAL_DOCUMENT` during ingestion to optimize the vector for being searched.
   - **Dimensionality**: We use **768 dimensions** (truncated from 3072). This utilizes Matryoshka Representation Learning (MRL) to save 75% database space with virtually no loss in search quality.
4. **Storage**: These vectors are stored in a PostgreSQL database using the `pgvector` extension.

### Phase 2: Retrieval (Finding the Answer)

When a therapist needs a suggestion or searches the library:

1. **Query Embedding**: Mamirri converts the search query (e.g., "huesos del cráneo") into a vector.
   - **Task Type**: We use `RETRIEVAL_QUERY` for the search term to ensure the best semantic match against indexed documents.
2. **Semantic Search**: It compares this query vector against all the vectors in the database.
3. **Ranking**: It finds the chunks with the most similar meaning using **Cosine Similarity** (`<=>` operator in pgvector).
4. **Context**: These relevant chunks are then provided to the AI to generate a grounded response with citations (title and page number).

## Operational Commands

You can manage the knowledge base using these commands from the project root:

| Command                                     | Description                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm knowledge:ingest`                     | Scans `apps/server/data/books/*.pdf` and generates embeddings for new files. AI automatically extracts Title, Author, Volume, and Edition. |
| `pnpm knowledge:search "query"`             | Performs a semantic search across all ingested books.                                                                                      |
| `pnpm knowledge:list`                       | Displays a clean list of all ingested books with their ID, Title, Volume, and File Path.                                                   |
| `pnpm knowledge:update "ID" --options`      | Manually corrects or updates a book's metadata (title, author, volume, edition, year).                                                     |
| `pnpm knowledge:clean "ID or filename.pdf"` | Removes a specific book and its embeddings from the database to allow re-ingestion.                                                        |
| `pnpm knowledge:backup`                     | Creates a timestamped SQL backup of the entire vector database in the `backups/` folder.                                                   |
| `pnpm knowledge:restore "path/to/file.sql"` | Restores the database from a backup file (Warning: Overwrites current data).                                                               |
| `pnpm knowledge:stats`                      | Displays technical database statistics (total chunks per book).                                                                            |
| `pnpm knowledge:wipe`                       | **DANGER**: Wipes all books and vectors from the database (useful before a clean import).                                                  |

### Migration & Data Protection

Vectorizing books is expensive (quota/time). Use these commands to move your library between environments (e.g., from Local to Production) without affecting other data like patients or users.

#### 1. Full System Backup (Safest)

Saves everything (Library + Patients + Users). Use this for general security.

```bash
pnpm knowledge:backup
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

1. Place your PDF files in `apps/server/data/books/`.
2. Ensure you have a valid `GOOGLE_API_KEY` in your `.env` file.
3. Run the ingestion command:
   ```bash
   pnpm knowledge:ingest
   ```

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
- **PDF Extraction**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Database Layer**: Prisma (using `Unsupported("vector(768)")` for vector types)
- **Indexing**: HNSW (Hierarchical Navigable Small World) for fast similarity searches.
- **Optimization**: Matryoshka Representation Learning (MRL) for efficient 768-dim storage.

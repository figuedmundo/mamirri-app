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

| Command                               | Description                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm knowledge:ingest`               | Scans `apps/server/data/books/*.pdf` and generates embeddings for new files.        |
| `pnpm knowledge:search "query"`       | Performs a semantic search across all ingested books.                               |
| `pnpm knowledge:stats`                | Displays the total number of chunks and page ranges for each ingested book.         |
| `pnpm knowledge:clean "filename.pdf"` | Removes a specific book and its embeddings from the database to allow re-ingestion. |

### Adding books to the library

1. Place your PDF files in `apps/server/data/books/`.
2. Ensure you have a valid `GOOGLE_API_KEY` in your `.env` file.
3. Run the ingestion command:
   ```bash
   pnpm knowledge:ingest
   ```

The script automatically skips files that have already been processed to avoid duplicates.

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
- **PDF Extraction**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Database Layer**: Prisma (using `Unsupported("vector(768)")` for vector types)
- **Indexing**: HNSW (Hierarchical Navigable Small World) for fast similarity searches.
- **Optimization**: Matryoshka Representation Learning (MRL) for efficient 768-dim storage.

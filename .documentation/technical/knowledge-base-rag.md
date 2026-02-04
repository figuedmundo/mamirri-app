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
3. **Embedding**: Each chunk is converted into a list of numbers called a "vector" using Google Gemini's `gemini-embedding-001` model. This vector represents the _meaning_ of the text.
4. **Storage**: These vectors are stored in a PostgreSQL database using the `pgvector` extension.

### Phase 2: Retrieval (Finding the Answer)

When a therapist needs a suggestion or searches the library:

1. **Query Embedding**: Mamirri converts the search query (e.g., "huesos del cráneo") into a vector.
2. **Semantic Search**: It compares this query vector against all the vectors in the database.
3. **Ranking**: It finds the chunks with the most similar meaning (using cosine similarity).
4. **Context**: These relevant chunks are then provided to the AI to generate a grounded response with citations (title and page number).

## How to add books to the library

To ingest new medical books into the system:

1. Place your PDF files in `apps/server/data/books/`.
2. Ensure you have a valid `GOOGLE_API_KEY` in your `.env` file.
3. Run the ingestion command:
   ```bash
   cd apps/server
   npm run knowledge:ingest
   ```

The script will automatically skip files that have already been processed to avoid duplicates.

## Technical Stack

- **Vector Storage**: PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)
- **Embeddings Model**: Google Gemini (`gemini-embedding-001`)
- **PDF Extraction**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Database Layer**: Prisma (using `Unsupported("vector(768)")` for vector types)
- **Indexing**: HNSW (Hierarchical Navigable Small World) for fast similarity searches.

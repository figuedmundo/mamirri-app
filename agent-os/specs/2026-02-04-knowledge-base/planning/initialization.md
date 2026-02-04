# Feature: Knowledge Base Infrastructure (Week 12)

## Goal

Build the "brain" of the AI system by ingesting medical textbooks (PDFs) and making them searchable via vector embeddings.

## Core Requirements

1.  **PDF Ingestion**: Script to parse PDF files from a local directory.
2.  **Chunking**: Split text into meaningful segments (e.g., 500 words with overlap) to preserve context.
3.  **Metadata Extraction**: Extract Title, Chapter, Section, and Page Number where possible.
4.  **Vector Database Setup**: Enable `pgvector` in PostgreSQL and define the schema for storing embeddings.
5.  **Embeddings Generation**: Use an embedding model (e.g., OpenAI `text-embedding-3-small` or similar) to convert text chunks into vectors.
6.  **Search Test**: A simple script to query the database with a natural language question and retrieve relevant chunks.

## Context from Roadmap (Week 12-13)

- **12.1** Research: PDF extraction tools.
- **12.2** Chunking strategy design.
- **12.3** Metadata schema.
- **12.4** Manual test: Extract 1 book.
- **12.5** Ingestion script.
- **13.1-13.6** Vector DB setup and population.

## Constraints

- **No Copyrighted Material in Repo**: PDFs must be stored in a git-ignored folder (e.g., `data/books`).
- **Tech Stack**: NestJS (backend), Prisma (ORM), PostgreSQL + pgvector.

# System Architecture

## Overview

PhysioCopilot uses a modular monolith architecture built with:

- **Frontend:** React + Vite + Shadcn/UI
- **Backend:** NestJS + Prisma ORM
- **Database:** PostgreSQL (with pgvector extension)
- **AI Infrastructure:** Google Gemini 3 Flash (Embeddings + Vision + Orchestration)
- **Knowledge Base:** RAG-based literature retrieval with pgvector
- **Anonymization:** Reversible PII-stripping service
- **Translation:** Bidirectional EN-ES medical terminology service
- **Storage:** MinIO (S3-compatible)
- **Cache:** Redis
- **Logging:** Structured JSON (NestJS + React)

## Infrastructure Orchestration

The project uses a **Docker-Native** initialization strategy. This ensures that infrastructure dependencies are not just running, but also correctly configured and seeded before the application layer starts.

### Component Roles

1. **PostgreSQL (`physio_db`)**:
   - Stores all relational data.
   - Includes `pgvector` for upcoming AI features.
   - Uses `scripts/init-db.sql` for low-level database creation.

2. **MinIO (`physio_storage`)**:
   - Handles large file storage (medical images, audio transcripts).
   - Orchestrated by `physio_provisioner` which creates the `physio-media` bucket and sets access policies.

3. **Backend Server (`physio_server`)**:
   - The primary application logic container.
   - **Entrypoint Responsibilities**:
     - Migrations: Automatically executes `prisma migrate deploy` on boot.
     - Seeding: Executes `prisma db seed` to ensure a default `THERAPIST` user exists.
     - Health Tracking: Blocks until the database is ready to accept connections.
   - **Global Configuration**:
     - `ValidationPipe`: Enabled globally with `whitelist: true` to enforce DTO validation rules.
     - `AllExceptionsFilter`: Standardizes error responses across the API.

4. **Redis (`physio_cache`)**:
   - Placeholder for future session management and caching.

## Data Layer (Prisma 7)

The application uses **Driver Adapters** (`@prisma/adapter-pg`) to manage runtime database connections. This separates CLI configuration (in `prisma.config.ts`) from application runtime, improving portability and control over connection pools.

### Data Management Patterns

- **Knowledge Base (RAG)**: Medical books are ingested, chunked, and stored as vectors in PostgreSQL. Semantic search uses cosine similarity via `pgvector` to retrieve relevant clinical context for AI suggestions.
- **AI Analysis Pipeline**: Orchestrates a multi-step flow:
  1. **Anonymization**: Strips PII (Name, Email, Phone) and calculates age from birthdates.
  2. **Multi-Query RAG**: Executes 3 parallel searches for diagnosis, treatment, and contraindications.
  3. **Reasoning**: Uses Gemini 3 Flash with Chain-of-Thought prompting in Spanish.
  4. **Translation**: Automatically translates English literature citations to Spanish.
  5. **Rehydration**: Restores patient names in the final response for the therapist.
- **Soft Deletes**: Critical entities (like `Patient`) implement soft deletes using a `deletedAt` timestamp.
- **Tenant Isolation**: Data access is strictly scoped to the authenticated user (`therapistId`). Service layers enforce this isolation in all queries.

---

**Last Updated:** 2026-02-05

# Spec Requirements: Implement Voyage Batch API

## Initial Description

The user wants to implement the **Async Batch API** for Voyage AI ingestion to handle large medical books without hitting the token rate limits of the Free Tier (10,000 TPM / 3 RPM).

**Key Drivers:**

- **Rate Limits:** The Free Tier has strict limits (10k TPM) which makes synchronous ingestion of large books impossible or incredibly slow.
- **Batch API Benefits:**
  - Bypasses per-minute rate limits.
  - 33% cost discount.
  - Allows uploading huge files (up to 100K inputs).
  - 12-hour turnaround time (acceptable for ingestion).
- **Goal:** "Flawless" execution for book ingestion using the 200M free tokens efficiently.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should add a `--batch` flag to the `ingest` command to toggle this mode?

**Answer:** Yes, a `--batch` flag is a good idea. We will support two ingestion styles:

1. **Synchronous (Real-time)**: Default mode. Respects strict Free Tier limits (3 RPM / 10k TPM). Best for small updates.
2. **Asynchronous (Batch)**: Triggered via `--batch`. Bypasses per-minute limits using the Batch API. Best for large bulk ingestion.

**Q2:** For the "wait" part, should the script exit after submission and print the batch ID, or should it poll until completion (up to 12 hours)?

**Answer:** The script should **submit and exit**. It will provide a `batch_id` and instructions to check status later (e.g., via a new command like `pnpm knowledge:batch-status <id>`). This avoids keeping a process running for 12 hours.

**Q3:** Where should we store the `batch_id` and mapping metadata?

**Answer:** Store it in a local JSON file (e.g., `data/batch-jobs.json`). This keeps the database schema clean of transient job data for this MVP/Free Tier flow.

**Q4:** For mapping results back, I plan to use the chunk's UUID as the `custom_id` in the JSONL. Does this work for you?

**Answer:** Yes, that is the recommended approach. Using the chunk's UUID as `custom_id` allows perfect mapping back to the database records when processing results.

**Clarification on `VOYAGE_MAX_BATCH_SIZE`:**

- **`VOYAGE_SYNC_MAX_BATCH_SIZE` (1000)**: Limit for a single synchronous API call (`/v1/embeddings`). Used in default mode.
- **`VOYAGE_ASYNC_MAX_BATCH_SIZE` (100,000)**: Limit for a single asynchronous batch job file. Used in batch mode.
  We will rename/clarify these constants to avoid confusion.

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** `ingest.ts` script - Path: `apps/server/scripts/ingest.ts`
- **Feature:** `VoyageEmbeddingService` - Path: `apps/server/src/modules/knowledge-base/services/voyage-embedding.service.ts`

## Requirements Summary

### Functional Requirements

1.  **Dual Ingestion Modes:**
    - Support default synchronous ingestion (carefully rate-limited).
    - Support asynchronous batch ingestion via `--batch` flag.
2.  **Batch Workflow:**
    - Generate chunks from Markdown.
    - Create JSONL file with `custom_id` = chunk UUID.
    - Upload JSONL to Voyage Files API.
    - Create Batch Job via Voyage Batches API.
    - Save batch metadata (ID, status, file paths) to local JSON.
    - Exit and inform user.
3.  **Status Check Command:**
    - New command `pnpm knowledge:batch-check` (or similar).
    - Checks status of pending batches.
    - If complete, downloads results, maps vectors to DB, and updates status.
4.  **Configuration Clarity:**
    - Rename `VOYAGE_MAX_BATCH_SIZE` to `VOYAGE_SYNC_MAX_BATCH_SIZE`.
    - Add `VOYAGE_ASYNC_MAX_BATCH_SIZE` constant.

### Scope Boundaries

**In Scope:**

- Updating `ingest.ts` to handle `--batch`.
- Updating `VoyageEmbeddingService` with batch methods.
- Creating a local JSON store for batch metadata.
- Creating a new script/command for checking batch status.

**Out of Scope:**

- Database schema changes for batch tracking (using local file instead).
- Complex UI for batch management (CLI only).

### Technical Considerations

- **Free Tier Constraints:** strict 3 RPM / 10k TPM for sync calls. Batch API bypasses this.
- **Data Persistence:** Local `data/batch-jobs.json` must be preserved between runs.
- **Error Handling:** Must handle API failures during upload/create gracefullly.

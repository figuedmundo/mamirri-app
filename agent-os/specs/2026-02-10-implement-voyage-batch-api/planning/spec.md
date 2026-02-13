# Specification: Implement Voyage Batch API

## Goal

Implement support for Voyage AI's Asynchronous Batch Inference API to allow "flawless" ingestion of large medical books on the Free Tier, bypassing the strict 10k TPM / 3 RPM rate limits.

## User Stories

- As a developer, I want to ingest large books using the `--batch` flag so that I don't hit rate limit errors.
- As a developer, I want to submit a batch job and exit immediately so I don't have to keep a process running for 12 hours.
- As a developer, I want to check the status of my batch jobs and automatically process results when they are ready.

## Specific Requirements

**Dual Ingestion Modes**

- Update `ingest.ts` to accept a `--batch` flag.
- **Default (Sync):** Continue using the existing rate-limited logic (carefully tuned for 10k TPM).
- **Batch (Async):** Switch to the new batch workflow when the flag is present.

**VoyageEmbeddingService Updates**

- Implement `createBatchJob(texts: string[], metadata: any[])`:
  - Generate JSONL string/file.
  - Upload file via `POST /v1/files`.
  - Create batch via `POST /v1/batches`.
  - Return batch ID.
- Implement `checkBatchStatus(batchId: string)`:
  - Call `GET /v1/batches/{id}`.
- Implement `retrieveBatchResults(outputFileId: string)`:
  - Download content, parse JSONL, return map of `custom_id` -> `vector`.

**Batch Metadata Management**

- Create a simple persistence layer using `apps/server/data/batch-jobs.json`.
- Store: `batchId`, `inputFileId`, `status`, `createdAt`, `bookTitle`, `chunkCount`.
- Allow resuming/checking status based on this file.

**Batch Status Command**

- Create a new script `scripts/batch-status.ts`.
- Command: `pnpm knowledge:batch-status [batchId]`.
- Logic:
  - If `batchId` provided, check that specific batch.
  - If no ID, check all "pending" batches in `batch-jobs.json`.
  - If a batch is `completed`:
    - Download results.
    - Update `embeddings` table in Postgres using `custom_id` (UUID) to map vectors.
    - Mark batch as `processed` in JSON.

**Configuration Updates**

- Rename `VOYAGE_MAX_BATCH_SIZE` -> `VOYAGE_REALTIME_BATCH_LIMIT` (default 1000). This limits items per single HTTP request.
- Add `VOYAGE_JOB_FILE_LIMIT` (default 100,000). This limits items per asynchronous batch job file.

## Existing Code to Leverage

**`VoyageEmbeddingService`**

- Extend this service with new methods (`createBatchJob`, `checkBatchStatus`).
- Reuse the existing `VoyageAIClient` initialization.

**`ingest.ts`**

- Modify the main loop to collect all chunks first, then decide whether to call `generateDocumentEmbeddingsBatch` (sync) or `createBatchJob` (async).

**`TokenRateLimiter`**

- Keep this for the sync path. It's working well for small updates.

## Out of Scope

- Database schema changes for batch tracking (using local file).
- Webhooks for completion notification (using polling/manual check).
- UI integration for batch status (CLI only).

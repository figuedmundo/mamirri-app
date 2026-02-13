# Task Breakdown: Implement Voyage Batch API

## Overview

Total Tasks: 4 task groups with 15 sub-tasks.

## Task List

### Backend Layer - Service & Config

#### Task Group 1: Configuration & Service Updates

**Dependencies:** None

- [ ] 1.0 Update configuration and service structure
  - [ ] 1.1 Update `voyage.config.ts`
    - Rename `maxBatchSize` to `realtimeBatchLimit` (default 1000)
    - Add `jobFileLimit` (default 100,000)
    - Update type definitions
  - [ ] 1.2 Update `VoyageEmbeddingService` class properties
    - Reflect config changes in class properties
    - Add types for Batch API responses (`BatchJob`, `BatchStatus`, etc.)
  - [ ] 1.3 Implement `createBatchJob` method in `VoyageEmbeddingService`
    - Generate JSONL content from inputs (`custom_id` = UUID, `input` = text)
    - Save temporary JSONL file
    - Call `POST /v1/files` to upload
    - Call `POST /v1/batches` to submit
    - Return batch object
  - [ ] 1.4 Implement `checkBatchStatus` method
    - Call `GET /v1/batches/{batchId}`
    - Return status object
  - [ ] 1.5 Implement `retrieveBatchResults` method
    - Call `GET /v1/files/{outputFileId}/content`
    - Parse JSONL output
    - Return map of `custom_id` -> `vector`
  - [ ] 1.6 Ensure existing tests pass with config changes
    - Update `voyage-embedding.service.spec.ts` to use new config names

**Acceptance Criteria:**

- Config variables are renamed and clear
- Service methods for Batch API are implemented and type-safe
- Existing tests pass

### Ingestion Logic

#### Task Group 2: CLI Ingestion Updates

**Dependencies:** Task Group 1

- [ ] 2.0 Update `ingest.ts` for Dual Mode
  - [ ] 2.1 Add command line argument parsing
    - Detect `--batch` flag
  - [ ] 2.2 Refactor ingestion loop
    - Collect ALL chunks in memory first (or stream to temp file)
    - If `--batch`: accumulate chunks until `VOYAGE_JOB_FILE_LIMIT`
    - If no flag: process in small batches using `VOYAGE_REALTIME_BATCH_LIMIT` (existing logic)
  - [ ] 2.3 Implement Batch Submission flow
    - Generate UUIDs for all chunks PRE-submission
    - Create `Document` and empty `Embedding` records in DB (so we have IDs to map back to)
    - Call `createBatchJob` with chunk texts and IDs
  - [ ] 2.4 Implement Local State Persistence
    - Create/Update `data/batch-jobs.json`
    - Store: `batchId`, `bookTitle`, `status: 'pending'`, `chunkCount`, `timestamp`
    - Log instructions to user: "Batch submitted. Run `pnpm knowledge:batch-status` later."

**Acceptance Criteria:**

- `pnpm knowledge:ingest` works as before (real-time)
- `pnpm knowledge:ingest --batch` submits a job and exits
- `batch-jobs.json` is created/updated correctly
- Database records are created with empty vectors (waiting for update)

### Batch Management

#### Task Group 3: Batch Status & Processing Script

**Dependencies:** Task Group 2

- [ ] 3.0 Create `scripts/batch-status.ts`
  - [ ] 3.1 Implement "List Pending" logic
    - Read `data/batch-jobs.json`
    - Check status of all 'pending' jobs via `checkBatchStatus`
    - Update JSON file with new statuses
  - [ ] 3.2 Implement "Process Completed" logic
    - If status is 'completed', call `retrieveBatchResults`
    - Iterate through results
    - UPDATE `embeddings` table: SET `vector` = result WHERE `id` = `custom_id`
    - Mark job as 'processed' in JSON
  - [ ] 3.3 Add CLI Command
    - Register `pnpm knowledge:batch-status` in `package.json`
  - [ ] 3.4 Handle Errors
    - If batch failed, log error to JSON and console
    - Clean up temporary files

**Acceptance Criteria:**

- Command lists status of pending jobs
- Automatically downloads and inserts vectors for completed jobs
- Updates local JSON state accurately

### Verification

#### Task Group 4: End-to-End Verification

**Dependencies:** Task Groups 1-3

- [x] 4.0 Verify the complete flow
  - [x] 4.1 Test Real-time Ingestion
  - [x] 4.2 Test Batch Submission
  - [x] 4.3 Test Batch Processing (Mock/Dry Run)

**Acceptance Criteria:**

- Both modes function correctly
- No regression in existing functionality

## Execution Order

1. Service & Config (Task Group 1)
2. CLI Ingestion (Task Group 2)
3. Batch Management (Task Group 3)
4. Verification (Task Group 4)

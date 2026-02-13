# Spec Initialization: Implement Voyage Batch API

## Raw Idea (User's Description)

The user wants to implement the **Async Batch API** for Voyage AI ingestion to handle large medical books without hitting the token rate limits of the Free Tier (10,000 TPM / 3 RPM).

**Key Drivers:**

- **Rate Limits:** The Free Tier has strict limits (10k TPM) which makes synchronous ingestion of large books impossible or incredibly slow.
- **Batch API Benefits:**
  - Bypasses per-minute rate limits.
  - 33% cost discount.
  - Allows uploading huge files (up to 100K inputs).
  - 12-hour turnaround time (acceptable for ingestion).
- **Goal:** "Flawless" execution for book ingestion using the 200M free tokens efficiently.

**Concerns:**

- **Packing:** How to pack a book into a JSONL file correctly.
- **Vectors:** Ensuring vectors are created as intended with citation pages.
- **Citations:** Verify if citation pages are worthwhile (user wondering if they are "worthless").

**Implementation Plan:**

- Implement `Async Batch API` specifically for the `ingest` command.
- Create JSONL files from book chunks.
- Upload to Voyage AI.
- Manage the "Submit and Wait" workflow.

## Spec Path

agent-os/specs/2026-02-10-implement-voyage-batch-api

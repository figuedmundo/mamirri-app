# Task Group 6: Document Re-ingestion Implementation

## Status: Ready for Execution

This task group requires manual execution with production data and API keys.
All prerequisite task groups (1-5) have been implemented.

## Pre-requisites Verified

- [x] Schema migration applied (Task Group 1)
- [x] Semantic chunking implemented (Task Group 2)
- [x] Hybrid search implemented (Task Group 3)
- [x] Reranking implemented (Task Group 4)
- [x] Evaluation framework ready (Task Group 5)

## Re-ingestion Procedure

### Step 1: Create Backup

```bash
# Export current knowledge base
pnpm --filter server knowledge:export

# Verify backup exists
ls -la backups/library/
```

Expected output: Timestamped `.sql.gz` file in backups directory.

### Step 2: Clear Existing Embeddings

```bash
# WARNING: This deletes all embeddings
pnpm --filter server knowledge:wipe
```

Or manually via SQL:

```sql
-- Keep document metadata, delete only embeddings
DELETE FROM embeddings;
```

### Step 3: Re-ingest Documents

```bash
# Move books from archive to data/library/originals/ if needed
# Then run ingestion with semantic chunking (default)
pnpm --filter server knowledge:ingest
```

**Expected behavior:**

- Semantic chunking creates smaller, coherent chunks (256-512 tokens)
- Parent documents created and linked via parentId
- Progress logged every 10 chunks
- Rate limiting: 1.5s between embeddings, 2s between sentence batches

**Estimated time:** 2-3x longer than previous ingestion due to:

- Sentence-level embedding for similarity calculation
- Additional API calls for parent chunk embeddings

### Step 4: Verify Re-ingestion

```bash
# Check embedding count
pnpm --filter server knowledge:stats

# Test search functionality
pnpm --filter server knowledge:search "fascitis plantar tratamiento"
```

**Verification checklist:**

- [ ] Embedding count is reasonable (should be MORE than before due to smaller chunks)
- [ ] Parent chunks exist (check `parentId IS NOT NULL` count)
- [ ] Search returns relevant results
- [ ] Hybrid search works (exact terms like "metformina" found)

### Step 5: Run Evaluation

```bash
# Remove .skip from rag-evaluation.spec.ts temporarily
# Then run:
pnpm --filter server test -- src/modules/knowledge-base/rag-evaluation.spec.ts
```

Compare metrics to baseline:
| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Context Precision | ~0.50 | TBD | >0.75 |
| Context Recall | ~0.60 | TBD | >0.70 |
| Faithfulness | ~0.70 | TBD | >0.80 |

### Step 6: Create New Backup

```bash
# Export the new knowledge base with semantic chunks
pnpm --filter server knowledge:export
```

## Rollback Procedure

If re-ingestion fails or metrics degrade:

```bash
# 1. Wipe failed embeddings
pnpm --filter server knowledge:wipe

# 2. Restore from backup
# Find the most recent backup
ls -la backups/library/

# 3. Restore using the restore script
./scripts/restore-knowledge.sh backups/library/[backup-file].sql.gz
```

Or manually:

```bash
gunzip -c backups/library/[backup-file].sql.gz | docker exec -i physio_db psql -U physio_user -d physio_db
```

## Environment Requirements

Ensure these are set in `.env`:

```
GOOGLE_API_KEY=your-google-api-key  # For embeddings
COHERE_API_KEY=your-cohere-api-key  # For reranking (optional)
```

## Notes

- Re-ingestion is a one-time operation per document set
- Future document additions will automatically use semantic chunking
- The old `chunkText()` method is kept as fallback
- Hybrid search uses the GIN index created in Task Group 1

## Files Modified

This task group is documentation-only. No code changes required.
The implementation is complete in Task Groups 1-5.

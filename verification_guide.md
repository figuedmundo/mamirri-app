# How to Verify Database Integrity

I have created a dedicated verification script `knowledge:verify` that checks if the ingested chunks in your database match the expected chunks from your Markdown files.

## Automated Verification

Run this command:

```bash
pnpm knowledge:verify
```

### What it does:

1.  Reads all Markdown files in `apps/server/data/markdowns`.
2.  Simulates the chunking process (using the same math as the ingestion service).
3.  Queries the database to count actual stored chunks.
4.  Compares Expected vs. Found and reports a percentage.

### Example Output

```
🔍 Verifying 1 books in knowledge base...

✅ [100.0%] Anatomía Humana
   Expected: ~1326 chunks (221 parents + 1105 children)
   Found:    1326 chunks
---
```

## Manual SQL Verification

If you want to inspect the data yourself, you can run these SQL queries directly in your database:

### 1. Count Chunks per Document

```sql
SELECT
    d.title,
    COUNT(e.id) as total_chunks,
    COUNT(CASE WHEN e."parentId" IS NULL THEN 1 END) as parent_chunks,
    COUNT(CASE WHEN e."parentId" IS NOT NULL THEN 1 END) as child_chunks
FROM documents d
JOIN embeddings e ON d.id = e."documentId"
GROUP BY d.title;
```

### 2. Check Page Number Distribution

To ensure page numbers were parsed correctly (and aren't all "1"):

```sql
SELECT
    d.title,
    MIN("pageNumber") as min_page,
    MAX("pageNumber") as max_page,
    COUNT(DISTINCT "pageNumber") as distinct_pages
FROM embeddings e
JOIN documents d ON e."documentId" = d.id
GROUP BY d.title;
```

### 3. Find Duplicates (if any)

```sql
SELECT content, COUNT(*)
FROM embeddings
GROUP BY content
HAVING COUNT(*) > 1;
```

_(Note: Some overlap is normal in child chunks, but exact duplicates shouldn't happen often)._

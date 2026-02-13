# Specification: Fix RAG Page Number Citations

## Overview

Enable accurate page number citations in AI responses by fixing the ingestion pipeline to parse `<!-- PAGE_NUMBER: X -->` delimiters in Markdown files and passing this context to the LLM.

## Problem

The current RAG system fails to provide page number citations because:

1.  **Ingestion Failure:** `knowledge-base.service.ts` reads the entire file as a single string, ignoring page markers.
2.  **Hardcoded Data:** The database stores `1` as the page number for all chunks.
3.  **Missing Context:** The Prompt Builder (`prompt-builder.service.ts`) does not include page numbers in the context sent to the AI.

## Solution Architecture

### 1. Ingestion Logic Update (`knowledge-base.service.ts`)

Instead of processing the file as a raw string, we will introduce a **Page-Aware Processing Pipeline**:

1.  **Parse Pages:** Split the input Markdown by the `<!-- PAGE_NUMBER: X -->` delimiter into a structure:

    ```typescript
    interface Page {
      content: string;
      pageNumber: number;
    }
    ```

2.  **Page-Aware Chunking:** Update chunking functions to respect page boundaries.
    - **Naive Chunking:** Iterate through pages and create chunks. If a chunk spans a page boundary, assign the page number based on the majority of content (or start).
    - **Semantic Chunking:** Map each sentence to its source page number before grouping them into semantic chunks.

3.  **Database Storage:**
    - Update the `INSERT` query to use the correct `pageNumber` for each chunk.

### 2. Prompt Builder Update (`prompt-builder.service.ts`)

- **Update Context Format:**
  - Modify `formatRagContext` to include the page number in the citation block.
  - **New Format:**
    ```
    ### Fuente 1
    **Documento:** Anatomía Humana
    **Autor:** Latarjet
    **Página:** 42
    **Relevancia:** 95%
    ...
    ```

## Implementation Plan

### Step 1: Update Ingestion Service

- [ ] Modify `ingestMarkdown` to parse `<!-- PAGE_NUMBER: X -->`.
- [ ] Refactor `chunkText` (Naive) to accept `Page[]` and return chunk objects with page numbers.
- [ ] Refactor `semanticChunk` (Advanced) to accept `Page[]` and map sentences to page numbers.
- [ ] Update `INSERT` queries to use the correct `pageNumber`.

### Step 2: Update Prompt Builder

- [ ] Modify `formatRagContext` in `prompt-builder.service.ts` to include `**Página:** ${chunk.pageNumber}`.

### Step 3: Verification

- [ ] Ingest a test book.
- [ ] Verify database entries have correct page numbers (not just 1).
- [ ] Run a test query and verify the AI response includes correct citations.

## Data Structures

### Page Interface

```typescript
interface Page {
  pageNumber: number;
  content: string;
}
```

### Chunk Interface (New)

```typescript
interface DocumentChunk {
  content: string;
  pageNumber: number;
}
```

## Security & Privacy

No changes to security or privacy. Page numbers are public metadata of the document.

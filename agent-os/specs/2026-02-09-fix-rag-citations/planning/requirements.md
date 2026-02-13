# Spec Requirements: 2026-02-09-fix-rag-citations

## Initial Description

Enable accurate page number citations in AI responses by fixing the ingestion pipeline to parse `<!-- PAGE_NUMBER: X -->` delimiters and passing this context to the LLM.

## Requirements Discussion

### Core Changes

**1. Ingestion Service (knowledge-base.service.ts):**

- **Split by Pages:** Instead of reading the whole file as a string, parse it into an array of page objects: `Array<{ content: string, pageNumber: number }>`.
- **Update `chunkText` (Naive):**
  - Iterate through pages.
  - Create chunks that respect page boundaries where possible.
  - If a chunk spans multiple pages, assign the page number of the _start_ of the chunk (or the majority page).
- **Update `semanticChunk` (Advanced):**
  - Map each sentence to its source page number.
  - When grouping sentences into semantic chunks, determine the page number based on the constituent sentences.
- **Database Insert:**
  - Pass the correct `pageNumber` to the `INSERT INTO embeddings` query.

**2. Prompt Builder (prompt-builder.service.ts):**

- **Update Context Format:**
  - Modify `formatRagContext` to include the page number in the citation block.
  - Format: `**Página:** ${chunk.pageNumber}`.

### Technical Considerations

- **Database Schema:** The `embeddings` table already has a `pageNumber` column (verified in code analysis). No schema changes required.
- **Existing Patterns:** `knowledge-base.service.ts` already has chunking logic; we are refactoring it, not rewriting from scratch.
- **Performance:** Parsing by page adds minimal overhead. Semantic chunking will need careful implementation to map sentences back to pages without losing performance.

## Requirements Summary

### Functional Requirements

- AI responses must include accurate page number citations.
- Ingestion process must correctly extract page numbers from Markdown files.
- Vector database must store the correct page number for each text chunk.

### Scope Boundaries

**In Scope:**

- Backend ingestion logic (`knowledge-base.service.ts`).
- Prompt construction logic (`prompt-builder.service.ts`).

**Out of Scope:**

- Frontend changes.
- PDF-to-Markdown conversion logic (upstream process).

### Visual Assets

N/A (Backend logic only).

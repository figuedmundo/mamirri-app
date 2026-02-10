# RAG Citations & Page-Aware Ingestion Fix

## Problem

The current RAG system fails to provide page number citations because:

1. Ingestion logic (knowledge-base.service.ts) ignores `<!-- PAGE_NUMBER: X -->` markers in Markdown files.
2. Database storage hardcodes page numbers to 1.
3. Prompt Builder (prompt-builder.service.ts) does not include page numbers in the context sent to the AI.

## Goal

Enable accurate page number citations in AI responses by making the ingestion pipeline "Page-Aware" and passing this context to the LLM.

## Scope

1.  **Update Ingestion Logic (knowledge-base.service.ts):**
    - Parse `<!-- PAGE_NUMBER: X -->` delimiters to create a `Page[]` structure.
    - Update `chunkText` (Naive) to respect page boundaries.
    - Update `semanticChunk` (Advanced) to track page numbers for each sentence.
    - Store correct page numbers in the `embeddings` table.

2.  **Update Prompt Builder (prompt-builder.service.ts):**
    - Modify `formatRagContext` to include `**Página:** ${chunk.pageNumber}` in the AI context.

## Exclusions

- Changing the PDF-to-Markdown conversion logic (we assume Markdown inputs are already correct).
- Frontend changes.

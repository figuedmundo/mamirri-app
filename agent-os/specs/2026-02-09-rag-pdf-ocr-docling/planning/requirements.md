# Spec Requirements: RAG PDF Processing Upgrade with Docling OCR

## Initial Description

Migrate the PDF ingestion pipeline from PyMuPDF4LLM to Docling to handle complex medical textbooks.

- Current issue: PyMuPDF4LLM is rule-based and struggles with complex layouts (columns, tables) and scanned book pages (images).
- Proposed solution: Use Docling (IBM) which uses computer vision for layout analysis and OCR.
- Goal: High-quality Markdown extraction from medical textbooks (often image-heavy PDFs).
- Scope:
  - Create a new Docling worker/service (Python).
  - Integrate with `knowledge:convert` command.
  - Ensure compatibility with existing Markdown ingestion flow.
  - Verify resource usage (Docling models are heavy).

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should run Docling as a separate microservice (Docker container) or worker process since it requires Python and heavy dependencies (Torch/PyTorch). Is that correct?
**Answer:** Yes, separate worker service.

**Q2:** I'm thinking we should maintain the "Intermediate Markdown" step we just built. The flow would be: PDF -> Docling Service -> Markdown Staging -> Review -> Ingest. Should we stick to this decoupled flow?
**Answer:** Yes, keep PDF -> Markdown (Review) -> Ingest.

**Q3:** Docling can be resource-intensive (CPU/RAM). Do we need to worry about hardware constraints?
**Answer:** User will run conversions on local machine (more powerful) instead of server.

**Q4:** For the `knowledge:convert` command, should we add a flag like `--engine=docling`?
**Answer:** Yes, keep both approaches. Do not remove PyMuPDF.

### Existing Code to Reference

No similar existing features identified for reference (apps/workers is empty).

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **New Worker Service:** Create a standalone Python service/worker (`apps/workers/docling`) that exposes an API (HTTP or simple script execution) to accept a PDF path and return Markdown using Docling.
- **Integration:** Update `knowledge:convert` command to support a new flag `--engine=docling` (defaulting to `pymupdf` if omitted, or vice-versa as preferred).
- **Execution Environment:** The Docling worker will primarily run locally on the developer's machine for heavy lifting, but the architecture should support containerization (Docker) for future server deployment if needed.
- **Output Format:** Must match the current Markdown output format (including the custom `<!-- PAGE_NUMBER: X -->` markers we just added) to ensure seamless integration with the `knowledge:ingest` step.

### Reusability Opportunities

- Reuse the existing `apps/server/scripts/convert-books.ts` script logic for file handling, metadata extraction (Gemini), and frontmatter generation.
- Reuse `extract-pdf.py` patterns for argument parsing if we decide to wrap Docling in a CLI script initially.

### Scope Boundaries

**In Scope:**

- Creating `apps/workers/docling` with `poetry` or `pip` setup.
- Implementing the Docling extraction logic with page marker injection.
- Modifying `convert-books.ts` to switch engines based on flag.
- Updating `package.json` to support the new workflow.

**Out of Scope:**

- Real-time OCR on the production server (inference happens locally during ingestion phase).
- Replacing PyMuPDF entirely (it stays as a lightweight fallback).

### Technical Considerations

- **Docling Dependencies:** Requires PyTorch and decent RAM. Ensure `.gitignore` handles the heavy virtual environment and model weights properly.
- **Performance:** Docling is slower than PyMuPDF. Progress bars/logging should be verbose.
- **Page Markers:** Critical to replicate the `<!-- PAGE_NUMBER: N -->` logic in the Docling pipeline to maintain citation capability.

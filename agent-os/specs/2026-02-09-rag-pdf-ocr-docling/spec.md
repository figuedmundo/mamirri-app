# Specification: RAG PDF Processing Upgrade with Docling OCR

## Goal

Migrate the PDF ingestion pipeline from PyMuPDF4LLM to Docling to improve Markdown extraction quality for complex medical textbooks, specifically handling intricate layouts and scanned images via computer vision and OCR.

## User Stories

- As a developer, I want to use Docling for PDF extraction so that I can accurately capture tables and complex layouts from medical textbooks.
- As a system, I want to support multiple extraction engines so that I can fall back to PyMuPDF if Docling is too slow or resource-intensive.
- As a researcher, I want the extracted Markdown to maintain page markers so that I can accurately cite sources in the RAG pipeline.

## Specific Requirements

**New Docling Worker Service**

- Create a standalone Python service in `apps/workers/docling`.
- Use `poetry` for dependency management (including `docling` and `torch`).
- Expose a simple script or API that accepts a PDF path and returns extracted Markdown.
- Implement layout analysis and OCR using Docling's computer vision models.

**Enhanced `knowledge:convert` Command**

- Update the existing conversion script to accept an `--engine` flag (options: `pymupdf`, `docling`).
- Default engine should remain `pymupdf` with `docling` as the high-quality alternative.
- Integrate the Docling worker execution into the existing `convert-books.ts` workflow.

**Markdown Page Marker Consistency**

- Replicate the `<!-- PAGE_NUMBER: X -->` marker logic in the Docling extraction pipeline.
- Ensure markers are placed at the start of each extracted page's content for citation accuracy.
- Maintain compatibility with the existing `knowledge:ingest` step.

**Local Execution Workflow**

- Optimize for local execution due to heavy hardware requirements (CPU/RAM).
- Ensure `.gitignore` correctly handles heavy model weights and virtual environments.
- Provide verbose logging and progress feedback during the conversion process.

**Integration with Metadata Extraction**

- Ensure the first 2000 characters of extraction are available for AI-based metadata extraction (Gemini).
- Preserve the frontmatter generation logic in `convert-books.ts` for consistency.

## Visual Design

(No visual assets provided)

## Existing Code to Leverage

**apps/server/scripts/convert-books.ts**

- Reuse file handling, directory structure setup, and metadata extraction logic.
- Utilize the gray-matter stringification for frontmatter generation.
- Maintain the existing archiving and staging directory flow.

**apps/server/scripts/extract-pdf.py**

- Reference argument parsing structure (PDF path, pages, output).
- Replicate the page-by-page iteration logic for marker injection.

**apps/server/src/modules/knowledge-base/knowledge-base.service.ts**

- Extend the service to include Docling extraction capabilities.
- Maintain interface compatibility for existing scripts.

## Out of Scope

- Replacing PyMuPDF entirely (it remains as a lightweight alternative).
- Real-time OCR in production (Docling is for preprocessing phase only).
- Automatic GPU acceleration setup (default to CPU-based inference).
- Web-based UI for conversion progress tracking.

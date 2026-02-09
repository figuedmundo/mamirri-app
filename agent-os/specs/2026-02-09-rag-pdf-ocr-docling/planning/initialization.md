RAG PDF Processing Upgrade with Docling OCR

Migrate the PDF ingestion pipeline from PyMuPDF4LLM to Docling to handle complex medical textbooks.

- Current issue: PyMuPDF4LLM is rule-based and struggles with complex layouts (columns, tables) and scanned book pages (images).
- Proposed solution: Use Docling (IBM) which uses computer vision for layout analysis and OCR.
- Goal: High-quality Markdown extraction from medical textbooks (often image-heavy PDFs).
- Scope:
  - Create a new Docling worker/service (Python).
  - Integrate with `knowledge:convert` command.
  - Ensure compatibility with existing Markdown ingestion flow.
  - Verify resource usage (Docling models are heavy).

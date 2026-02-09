#!/usr/bin/env python3
"""
Docling PDF to Markdown converter with page markers.

Usage:
    python main.py <pdf_path>

Output:
    JSON with keys: markdown, total_pages, pages_processed
"""

import sys
import json
from pathlib import Path

try:
    import click
    from docling.document_converter import DocumentConverter, PdfFormat
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {str(e)}"}), file=sys.stderr)
    sys.exit(1)


@click.command()
@click.argument("pdf_path", type=click.Path(exists=True))
def convert_pdf(pdf_path):
    """Convert PDF to Markdown page-by-page using split-and-convert strategy."""
    pdf_file = Path(pdf_path)
    full_markdown = ""
    processed_count = 0
    total_pages = 0

    try:
        # Initialize Docling converter once (heavy model load)
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = True
        pipeline_options.do_table_structure = True

        # Performance tweak: accelerated processing if available
        # pipeline_options.accelerator_options.num_threads = 4

        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormat(pipeline_options=pipeline_options)
            }
        )

        # Open PDF with pypdfium2 to get page count and split
        import pypdfium2 as pdfium
        import tempfile
        import os

        pdf = pdfium.PdfDocument(pdf_file)
        total_pages = len(pdf)

        print(f"DEBUG: Starting conversion of {total_pages} pages...", file=sys.stderr)

        for i in range(total_pages):
            page_num = i + 1

            # Progress log
            print(
                f"DEBUG: Processing page {page_num}/{total_pages}...", file=sys.stderr
            )

            # Create a new PDF with just this single page
            single_page_pdf = pdfium.PdfDocument.new()
            single_page_pdf.import_pages(pdf, [i])

            # Save single page to a temporary file
            with tempfile.NamedTemporaryFile(
                suffix=f"_p{page_num}.pdf", delete=False
            ) as tmp:
                single_page_pdf.save(tmp)
                tmp_path = tmp.name

            try:
                # Convert this single page
                result = converter.convert(tmp_path)
                page_md = result.document.export_to_markdown()

                # Append with marker
                full_markdown += f"\n\n<!-- PAGE_NUMBER: {page_num} -->\n\n"
                full_markdown += page_md

                processed_count += 1

            except Exception as page_err:
                print(
                    f"ERROR: Failed to convert page {page_num}: {str(page_err)}",
                    file=sys.stderr,
                )
                # We continue to next page instead of failing everything
                full_markdown += f"\n\n<!-- PAGE_NUMBER: {page_num} -->\n\n[Conversion Failed for Page {page_num}]\n"

            finally:
                # Cleanup
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                single_page_pdf.close()

        # Output JSON result
        output = {
            "markdown": full_markdown,
            "total_pages": total_pages,
            "pages_processed": processed_count,
        }

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        error_output = {"error": str(e)}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    convert_pdf()

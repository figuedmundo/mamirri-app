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
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import (
        PdfPipelineOptions,
        OcrOptions,
        OcrMacOptions,
        RapidOcrOptions,
    )
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {str(e)}"}), file=sys.stderr)
    sys.exit(1)


@click.command()
@click.argument("pdf_path", type=click.Path(exists=True))
@click.option(
    "--pages",
    nargs=2,
    type=int,
    help="Page range (start end, 1-indexed). Example: --pages 1 10",
)
def convert_pdf(pdf_path, pages):
    """
    Convert a PDF file to high-fidelity Markdown using Docling.

    This script splits the PDF into individual pages, processes each using
    IBM's Docling DocumentConverter, and injects custom PAGE_NUMBER markers.
    The result is printed to stdout as a JSON object.

    Args:
        pdf_path: Path to the input PDF file.
        pages: Optional tuple of (start, end) pages to process (1-indexed).
    """
    pdf_file = Path(pdf_path)
    full_markdown = ""
    processed_count = 0
    total_pages = 0

    try:
        # Initialize Docling converter once (heavy model load)
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = True
        pipeline_options.do_table_structure = True

        # Configure OCR engine for high quality
        import platform

        if platform.system() == "Darwin":
            # Use macOS native Vision framework via ocrmac
            pipeline_options.ocr_options = OcrMacOptions(force_full_page_ocr=True)
        else:
            # Fallback for other systems
            pipeline_options.ocr_options = RapidOcrOptions(force_full_page_ocr=True)

        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
            }
        )

        import pypdfium2 as pdfium
        import tempfile
        import os

        pdf = pdfium.PdfDocument(pdf_file)
        actual_total_pages = len(pdf)

        start_page = 1
        end_page = actual_total_pages

        if pages:
            start_page = max(1, pages[0])
            end_page = min(actual_total_pages, pages[1])

        total_pages = end_page - start_page + 1

        print(
            f"DEBUG: Starting conversion of pages {start_page} to {end_page}...",
            file=sys.stderr,
        )

        for i in range(start_page - 1, end_page):
            page_num = i + 1

            # Progress log
            print(f"DEBUG: Processing page {page_num}/{end_page}...", file=sys.stderr)

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

        # Explicitly close the main PDF document to avoid pdfium memory leak warning
        pdf.close()

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        error_output = {"error": str(e)}
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    convert_pdf()

#!/usr/bin/env python3
"""
Docling PDF to Markdown converter worker.

This script accepts a PDF file path as an argument and converts it to Markdown
using the docling library for layout-aware parsing.
"""

import sys
import argparse
from pathlib import Path
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend


def main():
    """Main function to convert PDF to Markdown."""
    parser = argparse.ArgumentParser(
        description="Convert PDF to Markdown using Docling"
    )
    parser.add_argument("pdf_path", type=str, help="Path to the PDF file to convert")
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        help="Output file path (if not provided, prints to stdout)",
    )
    parser.add_argument(
        "--table-mode",
        type=str,
        choices=["as_text", "as_html"],
        default="as_text",
        help="How to handle tables: as_text (default) or as_html",
    )

    args = parser.parse_args()

    # Validate PDF path
    pdf_path = Path(args.pdf_path)
    if not pdf_path.exists():
        print(f"Error: PDF file not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    if not pdf_path.suffix.lower() == ".pdf":
        print(f"Error: File must be a PDF: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    try:
        # Configure pipeline options for better table and multi-column handling
        pipeline_options = PdfPipelineOptions()
        pipeline_options.table_structure_options.do_cell_matching = True
        pipeline_options.table_structure_options.mode = args.table_mode

        # Initialize document converter with options
        converter = DocumentConverter(
            format_options={
                "application/pdf": PdfFormatOption(
                    pipeline_options=pipeline_options,
                )
            }
        )

        # Convert PDF to document
        print(f"Converting {pdf_path} to Markdown...", file=sys.stderr)
        result = converter.convert(str(pdf_path))

        # Get Markdown content
        markdown_content = result.document.export_to_markdown()

        # Output result
        if args.output:
            output_path = Path(args.output)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(markdown_content, encoding="utf-8")
            print(f"Successfully converted to: {output_path}", file=sys.stderr)
        else:
            print(markdown_content)

        print(f"Conversion completed successfully.", file=sys.stderr)
        sys.exit(0)

    except ImportError as e:
        print(f"Error: Missing required dependency. {e}", file=sys.stderr)
        print("Please install docling: pip install docling", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: Failed to convert PDF: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

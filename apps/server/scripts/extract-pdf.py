#!/usr/bin/env python3
"""
PDF to Markdown extraction using PyMuPDF4LLM.
Designed for large medical documents with chunked processing.

Usage:
  python extract-pdf.py <pdf_path> [--pages START END] [--output FILE]

Examples:
  python extract-pdf.py document.pdf                    # Full document to stdout
  python extract-pdf.py document.pdf --pages 0 10      # Pages 0-10 (0-indexed)
  python extract-pdf.py document.pdf --output out.md   # Save to file
"""

import sys
import json
import argparse
import pymupdf
import pymupdf4llm


def extract_pdf(
    pdf_path: str, start_page: int | None = None, end_page: int | None = None
) -> dict:
    """
    Extract PDF content as markdown with metadata.

    Args:
        pdf_path: Path to PDF file
        start_page: Starting page (0-indexed, inclusive)
        end_page: Ending page (0-indexed, inclusive)

    Returns:
        dict with 'markdown', 'total_pages', 'pages_processed'
    """
    doc = pymupdf.open(pdf_path)
    total_pages = len(doc)

    if start_page is None:
        start_page = 0
    if end_page is None:
        end_page = total_pages - 1

    start_page = max(0, min(start_page, total_pages - 1))
    end_page = max(start_page, min(end_page, total_pages - 1))

    full_markdown = ""
    processed_count = 0

    # Iterate page by page to insert page markers
    for page_num in range(start_page, end_page + 1):
        sys.stderr.write(f"Processing page {page_num + 1}/{end_page + 1}...\n")
        sys.stderr.flush()

        try:
            page_md = pymupdf4llm.to_markdown(
                doc,
                pages=[page_num],
                write_images=False,
                force_text=True,
            )
            # Add page marker visible to parser but unobtrusive
            # Using HTML comment style to be compatible with Markdown
            full_markdown += f"\n\n<!-- PAGE_NUMBER: {page_num + 1} -->\n\n"
            full_markdown += str(page_md)
            processed_count += 1
        except Exception as e:
            sys.stderr.write(f"Error processing page {page_num + 1}: {e}\n")

    doc.close()

    return {
        "markdown": full_markdown,
        "total_pages": total_pages,
        "pages_processed": processed_count,
        "start_page": start_page,
        "end_page": end_page,
    }


def main():
    parser = argparse.ArgumentParser(description="Extract PDF to Markdown")
    parser.add_argument("pdf_path", help="Path to PDF file")
    parser.add_argument(
        "--pages",
        nargs=2,
        type=int,
        metavar=("START", "END"),
        help="Page range (0-indexed, inclusive)",
    )
    parser.add_argument("--output", "-o", help="Output file (default: stdout)")
    parser.add_argument(
        "--json", action="store_true", help="Output as JSON with metadata"
    )

    args = parser.parse_args()

    start_page: int | None = args.pages[0] if args.pages else None
    end_page: int | None = args.pages[1] if args.pages else None

    result = extract_pdf(args.pdf_path, start_page, end_page)

    if args.json:
        output = json.dumps(result, ensure_ascii=False)
    else:
        output = result["markdown"]

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output)
        print(
            f"Written to {args.output} ({result['pages_processed']} pages)",
            file=sys.stderr,
        )
    else:
        print(output)


if __name__ == "__main__":
    main()

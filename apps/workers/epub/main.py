#!/usr/bin/env python3
"""
EPUB to Markdown converter using ebooklib + pandoc.
Designed for high-quality conversion of EPUB files for AI ingestion.

Usage:
    python main.py <epub_path> [--pages START END]

Output:
    JSON with keys: markdown, total_pages, pages_processed, metadata
"""

import sys
import json
import subprocess
import logging
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from bs4 import BeautifulSoup
import click

try:
    import ebooklib
    from ebooklib import epub
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {str(e)}"}), file=sys.stderr)
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


class EpubConversionError(Exception):
    """Custom exception for EPUB conversion errors."""

    pass


class EpubConverter:
    """
    Converts EPUB files to Markdown using ebooklib for parsing and pandoc for conversion.

    Best Practices:
    - Uses spine order (not arbitrary item order) for correct reading sequence
    - Pre-processes HTML with BeautifulSoup to handle images/links
    - Streams content via stdin/stdout to avoid temp files
    - Extracts metadata from Dublin Core
    """

    def __init__(self, epub_path: str):
        self.epub_path = Path(epub_path)
        self.book: Optional[epub.EpubBook] = None
        self.spine_items: List[epub.EpubItem] = []

    def load(self) -> None:
        """Load EPUB file with comprehensive error handling."""
        try:
            self.book = epub.read_epub(str(self.epub_path))
        except KeyError as e:
            raise EpubConversionError(f"Malformed EPUB container: {e}")
        except Exception as e:
            raise EpubConversionError(f"Failed to load EPUB: {e}")

        # Build spine items in reading order
        for item_id, _ in self.book.spine:
            item = self.book.get_item_with_id(item_id)
            if item and item.get_type() == ebooklib.ITEM_DOCUMENT:
                self.spine_items.append(item)

    def extract_metadata(self) -> Dict[str, str]:
        """
        Extract Dublin Core metadata from EPUB.

        Returns:
            Dictionary with title, author, language, publisher
        """
        if not self.book:
            return {"title": "Unknown", "author": "Unknown"}

        def get_meta(name: str, default: str = "") -> str:
            """Safely extract metadata field."""
            try:
                items = self.book.get_metadata("DC", name)
                if items and len(items) > 0:
                    # items is a list of tuples: [(value, {...}), ...]
                    return str(items[0][0]) if items[0][0] else default
                return default
            except Exception:
                return default

        # Get title from filename as fallback
        fallback_title = self.epub_path.stem.replace("_", " ").replace("-", " ")

        return {
            "title": get_meta("title", fallback_title) or fallback_title,
            "author": get_meta("creator", "Unknown Author"),
            "language": get_meta("language", "en"),
            "publisher": get_meta("publisher", ""),
            "description": get_meta("description", ""),
        }

    def _html_to_markdown(self, html_content: str) -> str:
        """
        Convert HTML to Markdown using pandoc via subprocess.

        Uses stdin/stdout streaming for performance (no temp files).

        Args:
            html_content: Raw HTML string

        Returns:
            Markdown string
        """
        try:
            cmd = [
                "pandoc",
                "--from",
                "html",
                "--to",
                "markdown_strict",  # Clean markdown without extensions
                "--wrap=none",  # Don't hard-wrap lines (better for chunking)
                "--strip-comments",  # Remove HTML comments
                "--quiet",  # Suppress warnings
            ]

            result = subprocess.run(
                cmd, input=html_content.encode("utf-8"), capture_output=True, check=True
            )
            return result.stdout.decode("utf-8")
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode("utf-8") if e.stderr else str(e)
            logger.error(f"Pandoc conversion failed: {error_msg}")
            raise EpubConversionError(f"Pandoc error: {error_msg}")
        except FileNotFoundError:
            raise EpubConversionError(
                "pandoc not found. Please install pandoc: https://pandoc.org/installing.html"
            )

    def _preprocess_html(self, html_content: bytes) -> str:
        """
        Pre-process HTML before pandoc conversion.

        - Removes script/style tags
        - Cleans up navigation elements

        Args:
            html_content: Raw HTML bytes

        Returns:
            Cleaned HTML string
        """
        soup = BeautifulSoup(html_content, "html.parser")

        # Remove script and style elements
        for tag in soup(["script", "style", "nav"]):
            tag.decompose()

        return str(soup)

    def convert(
        self, start_page: Optional[int] = None, end_page: Optional[int] = None
    ) -> Dict:
        """
        Convert EPUB to Markdown.

        Args:
            start_page: Starting chapter index (1-indexed, inclusive)
            end_page: Ending chapter index (1-indexed, inclusive)

        Returns:
            Dictionary with markdown, metadata, and page counts
        """
        self.load()
        metadata = self.extract_metadata()

        total_chapters = len(self.spine_items)

        # Default to all chapters
        start_idx = (start_page - 1) if start_page else 0
        end_idx = end_page if end_page else total_chapters

        # Clamp to valid range
        start_idx = max(0, min(start_idx, total_chapters - 1))
        end_idx = max(start_idx + 1, min(end_idx, total_chapters))

        chapters_to_process = self.spine_items[start_idx:end_idx]
        processed_count = 0
        full_markdown_parts = []

        logger.info(
            f"Processing {len(chapters_to_process)} chapters ({start_idx + 1}-{end_idx})..."
        )

        for i, item in enumerate(chapters_to_process):
            chapter_num = start_idx + i + 1
            logger.info(f"  Processing chapter {chapter_num}/{end_idx}...")

            try:
                # Pre-process HTML
                html_content = self._preprocess_html(item.get_content())

                # Convert to markdown
                chapter_md = self._html_to_markdown(html_content)

                # Add chapter marker (compatible with existing chunking pipeline)
                full_markdown_parts.append(
                    f"\n\n<!-- PAGE_NUMBER: {chapter_num} -->\n\n"
                )
                full_markdown_parts.append(chapter_md)

                processed_count += 1

            except Exception as e:
                logger.warning(
                    f"    Warning: Failed to process chapter {chapter_num}: {e}"
                )
                # Continue with next chapter instead of failing entirely
                full_markdown_parts.append(
                    f"\n\n<!-- PAGE_NUMBER: {chapter_num} -->\n\n"
                )
                full_markdown_parts.append(
                    f"[Error processing chapter {chapter_num}: {e}]\n"
                )

        return {
            "markdown": "".join(full_markdown_parts),
            "total_pages": len(chapters_to_process),
            "pages_processed": processed_count,
            "metadata": metadata,
        }


@click.command()
@click.argument("epub_path", type=click.Path(exists=True, readable=True))
@click.option(
    "--pages",
    nargs=2,
    type=int,
    metavar=("START", "END"),
    help="Page range (chapter numbers, 1-indexed). Example: --pages 1 10",
)
@click.option(
    "--output", "-o", type=click.Path(), help="Output file (default: stdout as JSON)"
)
@click.version_option(version="1.0.0")
def main(epub_path: str, pages: Optional[Tuple[int, int]], output: Optional[str]):
    """
    Convert EPUB to Markdown using ebooklib + pandoc.

    EPUB_PATH is the path to the EPUB file to convert.

    The output is JSON containing:
    - markdown: The converted markdown content
    - total_pages: Total chapters processed
    - pages_processed: Successfully processed chapters
    - metadata: Book metadata (title, author, etc.)
    """
    start_page = pages[0] if pages else None
    end_page = pages[1] if pages else None

    try:
        converter = EpubConverter(epub_path)
        result = converter.convert(start_page=start_page, end_page=end_page)

        output_json = json.dumps(result, ensure_ascii=False, indent=2)

        if output:
            with open(output, "w", encoding="utf-8") as f:
                f.write(output_json)
            logger.info(f"Output written to: {output}")
        else:
            print(output_json)

    except EpubConversionError as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        error_result = {"error": f"Unexpected error: {str(e)}"}
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

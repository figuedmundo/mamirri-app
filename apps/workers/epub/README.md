# EPUB Worker

EPUB to Markdown conversion worker using **ebooklib** + **pandoc**.

This worker provides high-quality EPUB to Markdown conversion optimized for AI ingestion, with proper handling of reading order, metadata extraction, and chapter-based page markers.

## Why ebooklib + pandoc?

- **ebooklib**: Properly parses EPUB structure, respects spine reading order, extracts Dublin Core metadata
- **pandoc**: Industry-standard HTML→Markdown conversion, handles tables/lists/formatting better than custom parsers
- **Combined**: Best-in-class output quality for RAG/AI applications

## Setup

### 1. Install Python Dependencies

```bash
cd apps/workers/epub
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Install Pandoc

**macOS:**

```bash
brew install pandoc
```

**Ubuntu/Debian:**

```bash
sudo apt-get install pandoc
```

**Verify installation:**

```bash
pandoc --version
```

### 3. Test the Script

Convert a full EPUB:

```bash
python main.py /path/to/book.epub
```

Convert specific chapters (1-indexed):

```bash
python main.py /path/to/book.epub --pages 1 5
```

Save to file:

```bash
python main.py /path/to/book.epub -o output.json
```

## Output Format

The script outputs JSON:

```json
{
  "markdown": "# Chapter 1\n\nContent here...",
  "total_pages": 10,
  "pages_processed": 10,
  "metadata": {
    "title": "Book Title",
    "author": "Author Name",
    "language": "en",
    "publisher": "Publisher",
    "description": "Book description"
  }
}
```

## Integration with Server

The server calls this worker via:

```typescript
// In knowledge-base.service.ts
const workerDir = path.resolve(__dirname, '../../../../workers/epub');
const pythonCommand = path.join(workerDir, '.venv/bin/python');
const scriptPath = path.join(workerDir, 'main.py');

const process = spawn(pythonCommand, [scriptPath, epubPath]);
```

## Architecture Notes

### Spine vs Items

EPUB files contain a **spine** that defines the reading order. Unlike `get_items()` which returns items in arbitrary order, the spine ensures chapters are processed in the correct sequence for reading.

### Chapter-Based Page Markers

The script inserts `<!-- PAGE_NUMBER: N -->` markers before each chapter. This allows the downstream chunking pipeline to:

- Track which chapter content came from
- Maintain context for RAG retrieval
- Handle books where "pages" are really chapters

### Error Handling

- Malformed EPUBs: Catches `KeyError` from broken container.xml
- Missing chapters: Continues processing remaining chapters
- Pandoc errors: Provides clear error messages

## Comparison with PyMuPDF

| Feature        | ebooklib + pandoc           | PyMuPDF                |
| -------------- | --------------------------- | ---------------------- |
| EPUB Structure | ✅ Respects spine order     | ⚠️ May reorder content |
| Metadata       | ✅ Full Dublin Core support | ⚠️ Limited metadata    |
| HTML→Markdown  | ✅ Pandoc (best quality)    | ⚠️ Custom parser       |
| Tables/Lists   | ✅ Excellent                | ⚠️ Basic               |
| Speed          | ⚠️ Slower (subprocess)      | ✅ Faster              |

**Recommendation**: Use ebooklib + pandoc for EPUBs, PyMuPDF for PDFs.

## Troubleshooting

### "pandoc not found"

Install pandoc system-wide (not in virtualenv):

```bash
# macOS
brew install pandoc

# Linux
sudo apt-get install pandoc

# Or download from https://pandoc.org/installing.html
```

### ModuleNotFoundError

Ensure virtual environment is activated:

```bash
source apps/workers/epub/.venv/bin/activate
```

### Encoding Issues

The script assumes UTF-8 encoding. If you encounter encoding errors with specific EPUBs, the file may be corrupted or use non-standard encoding.

## License

Same as main project.

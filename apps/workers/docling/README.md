# Docling Worker

PDF to Markdown conversion worker using Docling OCR engine.

## Setup

### 1. Install Python dependencies

```bash
cd apps/workers/docling
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Test the script

Convert a full PDF:

```bash
python main.py path/to/file.pdf
```

Convert a specific page range (e.g., pages 1-10):

```bash
python main.py path/to/file.pdf --pages 1 10
```

### 3. CLI Integration

The main application calls this worker via:

```bash
pnpm knowledge:convert -- --engine=docling --pages=1,10
```

Expected output is a JSON object:

```json
{
  "markdown": "...",
  "total_pages": 10,
  "pages_processed": 10
}
```

## Notes

- Docling requires several heavy ML dependencies (accelerate, docling-ibm-models, transformers, etc.)
- Installation may take 10-20 minutes on slower systems
- On macOS, some OCR dependencies (ocrmac) require additional system libraries
- If installation times out, try installing with specific versions or using a machine with more RAM

## Troubleshooting

### Installation hangs or times out

```bash
# Try installing without cache
pip install --no-cache-dir -r requirements.txt

# Or install packages individually
pip install docling docling-ibm-models accelerate transformers
```

### Module not found errors

Ensure virtual environment is activated:

```bash
source apps/workers/docling/.venv/bin/activate
```

### Path resolution issues

The server expects `.venv` at `apps/workers/docling/.venv/bin/python`.
If you used `venv` (without dot), rename it:

```bash
mv apps/workers/docling/venv apps/workers/docling/.venv
```

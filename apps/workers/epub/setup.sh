#!/bin/bash
# Setup script for EPUB worker
# Installs Python dependencies and checks for pandoc

set -e

echo "🔧 Setting up EPUB worker..."

WORKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$WORKER_DIR"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "⚠️  Warning: pandoc is not installed."
    echo ""
    echo "Please install pandoc:"
    echo "  macOS:    brew install pandoc"
    echo "  Ubuntu:   sudo apt-get install pandoc"
    echo "  Other:    https://pandoc.org/installing.html"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Pandoc found: $(pandoc --version | head -n 1)"
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ EPUB worker setup complete!"
echo ""
echo "Test the worker:"
echo "  source .venv/bin/activate"
echo "  python main.py /path/to/book.epub"

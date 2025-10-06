![CodeExporter](https://btbwydj81v.ufs.sh/f/CWKdRkIGFoyiCnKZFbIGFoyicWVC0j1QqSvlMdI84Tu2gmaR)

# CodeExporter

Export your HTML, CSS, and JavaScript code into LLM-friendly Markdown files.

🔗 **Live App**: [https://code-exporter.netlify.app](https://code-exporter.netlify.app)

## What It Does

CodeExporter helps you share code with AI assistants like Claude and ChatGPT. Instead of pasting code that exceeds context limits, export it as properly formatted Markdown files that LLMs prefer.

## Features

- ✏️ Write HTML, CSS, and JavaScript in split-panel editors
- 👁️ Live preview as you code
- 📄 Export to Markdown format (`.html.md`, `.css.md`, `.js.md`)
- 💾 Export as code files (`.html`, `.css`, `.js`)
- ⌨️ Keyboard shortcut: `Ctrl+S` to run code

## How to Use

1. Write your code in the three editors (HTML, CSS, JavaScript)
2. Press `Ctrl+S` or click "Run Code" to preview
3. Click "Export Files" to download your code
4. Choose Markdown format for sharing with AI assistants

## Why Markdown?

LLMs handle Markdown files better than raw code pasted in chat. Markdown preserves formatting, maintains syntax highlighting context, and stays within file attachment limits.

## Tech Stack

- CodeMirror 5.65.16 - Code editors
- Split.js 1.6.5 - Resizable panels
- Vanilla JavaScript - No frameworks

## Local Development

```bash
# Clone the repo
git clone [your-repo-url]

# Open index.html in your browser
open index.html

# Or use a local server
python -m http.server 8000
```
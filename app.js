// Initialize CodeMirror editors
const htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlCode'), {
    mode: 'xml',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2
});

const cssEditor = CodeMirror.fromTextArea(document.getElementById('cssCode'), {
    mode: 'css',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2
});

const jsEditor = CodeMirror.fromTextArea(document.getElementById('jsCode'), {
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2
});

// Initialize Split.js
Split(['#leftPanel', '#middlePanel', '#rightPanel'], {
    sizes: [30, 40, 30],
    minSize: [250, 300, 250],
    gutterSize: 8,
    cursor: 'col-resize'
});

Split(['#htmlEditor', '#cssEditor', '#jsEditor'], {
    direction: 'vertical',
    sizes: [33, 33, 34],
    minSize: 50,
    gutterSize: 8,
    cursor: 'row-resize'
});

// State
let currentCode = {
    html: '',
    css: '',
    js: ''
};

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Run code and update preview
function runCode() {
    currentCode.html = htmlEditor.getValue();
    currentCode.css = cssEditor.getValue();
    currentCode.js = jsEditor.getValue();

    // Update preview
    const iframe = document.getElementById('preview-iframe');
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>${currentCode.css}</style>
        </head>
        <body>
          ${currentCode.html}
          <script>${currentCode.js}<\/script>
        </body>
        </html>
      `;

    doc.open();
    doc.write(fullHTML);
    doc.close();

    // Update markdown preview
    updateMarkdownPreview();

    showToast('Code executed successfully', 'success');
}

// Generate markdown content
function generateMarkdown(includeHtml = true, includeCss = true, includeJs = true) {
    let markdown = '';

    if (includeHtml && currentCode.html.trim()) {
        markdown += `### 🌐 HTML\n\n\`\`\`html\n${currentCode.html}\n\`\`\`\n\n`;
    }

    if (includeCss && currentCode.css.trim()) {
        markdown += `### 🎨 CSS\n\n\`\`\`css\n${currentCode.css}\n\`\`\`\n\n`;
    }

    if (includeJs && currentCode.js.trim()) {
        markdown += `### 📄 JavaScript\n\n\`\`\`javascript\n${currentCode.js}\n\`\`\`\n\n`;
    }

    return markdown;
}

// Update markdown preview
function updateMarkdownPreview() {
    const preview = document.getElementById('markdownPreview');
    const markdown = generateMarkdown();

    if (markdown.trim()) {
        preview.innerHTML = `<pre><code>${escapeHtml(markdown)}</code></pre>`;
    } else {
        preview.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📄</div>
            <div class="empty-state-text">
              Write some code and click "Run Code" to see the markdown preview
            </div>
          </div>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Download file helper
function downloadFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export functionality
function openExportModal() {
    const hasHtml = currentCode.html.trim();
    const hasCss = currentCode.css.trim();
    const hasJs = currentCode.js.trim();

    if (!hasHtml && !hasCss && !hasJs) {
        showToast('No code to export! Write some code first.', 'error');
        return;
    }

    // Update checkbox states based on available content
    const htmlCheckbox = document.getElementById('exportHtml');
    const cssCheckbox = document.getElementById('exportCss');
    const jsCheckbox = document.getElementById('exportJs');
    const htmlWrapper = document.getElementById('htmlCheckboxWrapper');
    const cssWrapper = document.getElementById('cssCheckboxWrapper');
    const jsWrapper = document.getElementById('jsCheckboxWrapper');

    htmlCheckbox.checked = hasHtml;
    cssCheckbox.checked = hasCss;
    jsCheckbox.checked = hasJs;

    htmlCheckbox.disabled = !hasHtml;
    cssCheckbox.disabled = !hasCss;
    jsCheckbox.disabled = !hasJs;

    htmlWrapper.classList.toggle('disabled', !hasHtml);
    cssWrapper.classList.toggle('disabled', !hasCss);
    jsWrapper.classList.toggle('disabled', !hasJs);

    // Set up format change listener
    setupFormatChangeListener();

    document.getElementById('exportModal').classList.add('show');
}

function setupFormatChangeListener() {
    const formatRadios = document.querySelectorAll('input[name="exportFormat"]');
    const fileSelectionSection = document.getElementById('fileSelectionSection');

    formatRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Hide file selection section when "combined" format is selected
            if (e.target.value === 'combined') {
                fileSelectionSection.style.display = 'none';
            } else {
                fileSelectionSection.style.display = 'block';
            }
        });
    });

    // Trigger initial state
    const checkedFormat = document.querySelector('input[name="exportFormat"]:checked');
    if (checkedFormat && checkedFormat.value === 'combined') {
        fileSelectionSection.style.display = 'none';
    }
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('show');
}

function performExport() {
    const projectName = sanitizeFilename(
        document.getElementById('projectName').value.trim()
    ) || 'untitled';
    const exportFormat = document.querySelector('input[name="exportFormat"]:checked').value;

    try {
        let downloadCount = 0;

        if (exportFormat === 'combined') {
            // Export combined markdown file with all available code
            const hasHtml = currentCode.html.trim();
            const hasCss = currentCode.css.trim();
            const hasJs = currentCode.js.trim();

            if (!hasHtml && !hasCss && !hasJs) {
                showToast('No code available to export!', 'error');
                return;
            }

            const combinedMd = generateMarkdown(
                hasHtml ? true : false,
                hasCss ? true : false,
                hasJs ? true : false
            );
            downloadFile(`${projectName}.code.md`, combinedMd, 'text/markdown');
            downloadCount = 1;

        } else {
            // Individual file exports (existing logic)
            const exportHtml = document.getElementById('exportHtml').checked;
            const exportCss = document.getElementById('exportCss').checked;
            const exportJs = document.getElementById('exportJs').checked;

            if (!exportHtml && !exportCss && !exportJs) {
                showToast('Please select at least one file to export!', 'error');
                return;
            }

            if (exportFormat === 'markdown') {
                // Export individual markdown files
                if (exportHtml && currentCode.html.trim()) {
                    const htmlMd = generateMarkdown(true, false, false);
                    downloadFile(`${projectName}.html.md`, htmlMd, 'text/markdown');
                    downloadCount++;
                }
                if (exportCss && currentCode.css.trim()) {
                    const cssMd = generateMarkdown(false, true, false);
                    downloadFile(`${projectName}.css.md`, cssMd, 'text/markdown');
                    downloadCount++;
                }
                if (exportJs && currentCode.js.trim()) {
                    const jsMd = generateMarkdown(false, false, true);
                    downloadFile(`${projectName}.js.md`, jsMd, 'text/markdown');
                    downloadCount++;
                }
            } else {
                // Export code files
                if (exportHtml && currentCode.html.trim()) {
                    downloadFile(`${projectName}.html`, currentCode.html, 'text/html');
                    downloadCount++;
                }
                if (exportCss && currentCode.css.trim()) {
                    downloadFile(`${projectName}.css`, currentCode.css, 'text/css');
                    downloadCount++;
                }
                if (exportJs && currentCode.js.trim()) {
                    downloadFile(`${projectName}.js`, currentCode.js, 'text/javascript');
                    downloadCount++;
                }
            }
        }

        closeExportModal();
        showToast(`${downloadCount} file(s) downloaded successfully!`, 'success');
    } catch (error) {
        showToast('Export failed: ' + error.message, 'error');
    }
}

function sanitizeFilename(name) {
    return name
        .replace(/[^a-z0-9_\-]/gi, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

// Event listeners
document.getElementById('runBtn').addEventListener('click', runCode);
document.getElementById('exportBtn').addEventListener('click', openExportModal);
document.getElementById('closeModal').addEventListener('click', closeExportModal);
document.getElementById('cancelExport').addEventListener('click', closeExportModal);
document.getElementById('confirmExport').addEventListener('click', performExport);

// Close modal when clicking outside
document.getElementById('exportModal').addEventListener('click', (e) => {
    if (e.target.id === 'exportModal') {
        closeExportModal();
    }
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        runCode();
    }
});

// Set default code examples
htmlEditor.setValue(`<div class="container">
  <h1>Hello World</h1>
  <p>Welcome to CodeExporter!</p>
</div>`);

cssEditor.setValue(`.container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  font-family: sans-serif;
}

h1 {
  color: #bee002;
  font-size: 2.5em;
}

p {
  color: #666;
  line-height: 1.6;
}`);

jsEditor.setValue(`console.log('CodeExporter loaded!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');
});`);

// Initial run
setTimeout(() => runCode(), 100);
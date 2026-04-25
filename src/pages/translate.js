export async function renderTranslate(root) {
  let languages = [];
  try {
    const res = await fetch('/api/translate/languages');
    languages = await res.json();
  } catch (e) {
    languages = ['English', 'Hindi', 'Telugu', 'Kannada', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia', 'Urdu'];
  }

  root.innerHTML = `
    <div class="page-container fade-in">
      <div class="page-step-label">Language Tools</div>
      <h1 class="page-title">Document Translator & Summarizer</h1>
      <p class="page-subtitle">Translate legal documents across 12 Indian languages or get instant AI summaries. Upload PDF or paste text.</p>

      <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #374151; display: block; margin-bottom: 6px;">Source Language</label>
          <select class="input" id="src-lang">
            <option value="">Auto-detect</option>
            ${languages.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
        </div>
        <div style="display: flex; align-items: flex-end; padding-bottom: 4px;">
          <button style="background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #9ca3af;" onclick="swapLanguages()">⇄</button>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #374151; display: block; margin-bottom: 6px;">Target Language</label>
          <select class="input" id="tgt-lang">
            ${languages.map(l => `<option value="${l}" ${l === 'Hindi' ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="translate-grid">
        <div class="translate-panel">
          <h3 style="font-size: 0.82rem; font-weight: 700; margin-bottom: 8px;">Source Text</h3>

          <div id="pdf-drop-zone" style="border: 2px dashed #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 10px; cursor: pointer; text-align: center; transition: all 200ms;">
            <input type="file" id="pdf-file-input" accept=".pdf,.txt,.doc" style="display: none;" />
            <p style="font-size: 0.78rem; color: #9ca3af; margin: 0;"><strong style="color:#6366f1;">Upload PDF/TXT</strong> — click or drag & drop</p>
            <p style="font-size: 0.65rem; color: #d1d5db; margin-top: 2px;">Extracts text automatically for translation or summarization</p>
          </div>
          <div id="pdf-status" style="display:none;margin-bottom:8px;"></div>

          <textarea class="textarea" id="translate-input" rows="10" placeholder="Paste your legal document, court notice, complaint, or any text here..."></textarea>
        </div>
        <div class="translate-panel">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; margin: 0;">Output</h3>
            <div id="output-mode-label" style="font-size:0.6rem;font-weight:700;padding:2px 10px;border-radius:10px;background:#6366f112;color:#6366f1;text-transform:uppercase;"></div>
          </div>
          <div class="translate-output" id="translate-output" style="min-height: 200px; color: #6b7280;">Translation or summary will appear here...</div>
        </div>
      </div>

      <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="translate-btn">Translate</button>
        <button class="btn btn-secondary" id="translate-stream-btn">Translate (Streaming)</button>
        <button class="btn btn-secondary" id="summarize-btn" style="background:#7c3aed;color:white;border-color:#7c3aed;">Summarize Document</button>
        <button class="btn btn-secondary" id="copy-translation">Copy Output</button>
      </div>

      <div style="margin-top: 16px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.82rem; color: #6b7280;">
        <strong>Tips:</strong> Legal section numbers (like "Section 498A IPC") are preserved in translations. Upload a PDF to extract text instantly. Use "Summarize" to get a plain-language breakdown of any legal document.
      </div>
    </div>
  `;

  // PDF upload handlers
  const dropZone = document.getElementById('pdf-drop-zone');
  const fileInput = document.getElementById('pdf-file-input');
  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#6366f1'; dropZone.style.background = '#f5f3ff'; });
  dropZone?.addEventListener('dragleave', () => { dropZone.style.borderColor = '#e5e7eb'; dropZone.style.background = 'transparent'; });
  dropZone?.addEventListener('drop', e => { e.preventDefault(); dropZone.style.borderColor = '#e5e7eb'; dropZone.style.background = 'transparent'; handlePdfUpload(e.dataTransfer.files[0]); });
  fileInput?.addEventListener('change', e => handlePdfUpload(e.target.files[0]));

  // Button handlers
  document.getElementById('translate-btn')?.addEventListener('click', translateNormal);
  document.getElementById('translate-stream-btn')?.addEventListener('click', translateStreaming);
  document.getElementById('summarize-btn')?.addEventListener('click', summarizeDocument);
  document.getElementById('copy-translation')?.addEventListener('click', () => {
    const text = document.getElementById('translate-output')?.textContent || '';
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('copy-translation');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Output'; }, 2000);
  });

  window.swapLanguages = () => {
    const src = document.getElementById('src-lang');
    const tgt = document.getElementById('tgt-lang');
    const tmp = src.value;
    src.value = tgt.value;
    tgt.value = tmp || 'English';
  };
}

async function handlePdfUpload(file) {
  if (!file) return;
  const status = document.getElementById('pdf-status');
  const input = document.getElementById('translate-input');
  status.style.display = 'block';

  if (file.name.endsWith('.txt')) {
    status.innerHTML = '<p style="font-size:0.75rem;color:#6366f1;">Reading text file...</p>';
    const text = await file.text();
    input.value = text;
    status.innerHTML = `<p style="font-size:0.75rem;color:#059669;">✓ Loaded ${file.name} (${text.length} chars)</p>`;
    return;
  }

  if (!file.name.endsWith('.pdf')) {
    status.innerHTML = '<p style="font-size:0.75rem;color:#dc2626;">Only PDF and TXT files are supported.</p>';
    return;
  }

  status.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="loading-spinner" style="width:14px;height:14px;border-width:2px;"></div><span style="font-size:0.75rem;color:#6366f1;">Extracting text from PDF...</span></div>';

  try {
    // Dynamic import pdfjs-dist (no worker — runs on main thread, fine for legal docs)
    const pdfjsLib = await import('pdfjs-dist');
    const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    input.value = fullText.trim();
    status.innerHTML = `<p style="font-size:0.75rem;color:#059669;">✓ Extracted ${pdf.numPages} pages from ${file.name} (${fullText.length} chars)</p>`;
  } catch (err) {
    status.innerHTML = `<p style="font-size:0.75rem;color:#dc2626;">PDF extraction failed: ${err.message}</p>`;
  }
}

async function translateNormal() {
  const text = document.getElementById('translate-input')?.value.trim();
  const sourceLang = document.getElementById('src-lang')?.value;
  const targetLang = document.getElementById('tgt-lang')?.value;
  const output = document.getElementById('translate-output');
  const label = document.getElementById('output-mode-label');

  if (!text) { alert('Please enter text to translate.'); return; }
  if (!targetLang) { alert('Please select a target language.'); return; }

  const btn = document.getElementById('translate-btn');
  btn.disabled = true; btn.textContent = 'Translating...'; output.textContent = 'Translating...';
  if (label) label.textContent = 'Translation';

  try {
    const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, sourceLang, targetLang }) });
    const data = await res.json();
    output.textContent = data.translated || 'No translation returned.';
  } catch (err) { output.textContent = `Error: ${err.message}`; }

  btn.disabled = false; btn.textContent = 'Translate';
}

async function translateStreaming() {
  const text = document.getElementById('translate-input')?.value.trim();
  const sourceLang = document.getElementById('src-lang')?.value;
  const targetLang = document.getElementById('tgt-lang')?.value;
  const output = document.getElementById('translate-output');
  const label = document.getElementById('output-mode-label');

  if (!text) { alert('Please enter text to translate.'); return; }
  if (!targetLang) { alert('Please select a target language.'); return; }

  const btn = document.getElementById('translate-stream-btn');
  btn.disabled = true; btn.textContent = 'Translating...'; output.textContent = '';
  if (label) label.textContent = 'Translation (Streaming)';

  try {
    const response = await fetch('/api/translate/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, sourceLang, targetLang }) });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try { const data = JSON.parse(line.slice(6)); if (data.type === 'token') output.textContent += data.data; } catch (e) {}
      }
    }
  } catch (err) { output.textContent += `\n\nError: ${err.message}`; }

  btn.disabled = false; btn.textContent = 'Translate (Streaming)';
}

async function summarizeDocument() {
  const text = document.getElementById('translate-input')?.value.trim();
  const output = document.getElementById('translate-output');
  const label = document.getElementById('output-mode-label');

  if (!text || text.length < 20) { alert('Please enter or upload a document to summarize (at least a few sentences).'); return; }

  const btn = document.getElementById('summarize-btn');
  btn.disabled = true; btn.textContent = 'Summarizing...';
  output.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div><span style="color:#6b7280;">Generating summary...</span></div>';
  if (label) label.textContent = 'Summary';

  try {
    const res = await fetch('/api/translate/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.error) { output.textContent = `Error: ${data.error}`; }
    else {
      const s = data.summary;
      let html = '';
      if (s.title) html += `<p style="font-size:1rem;font-weight:800;color:#111827;margin-bottom:8px;">${s.title}</p>`;
      if (s.document_type) html += `<span style="font-size:0.6rem;font-weight:700;padding:2px 10px;border-radius:10px;background:#6366f112;color:#6366f1;text-transform:uppercase;">${s.document_type}</span><br><br>`;
      if (s.plain_summary) html += `<p style="font-size:0.85rem;color:#374151;line-height:1.7;margin-bottom:14px;">${s.plain_summary}</p>`;
      if (s.key_points?.length) {
        html += `<p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#059669;margin-bottom:6px;">Key Points</p>`;
        html += s.key_points.map((p, i) => `<div style="display:flex;align-items:start;gap:8px;margin-bottom:6px;"><span style="width:20px;height:20px;border-radius:50%;background:#f0fdf4;border:1px solid #bbf7d0;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:#059669;flex-shrink:0;">${i + 1}</span><span style="font-size:0.8rem;color:#374151;line-height:1.5;">${p}</span></div>`).join('');
      }
      if (s.legal_terms?.length) {
        html += `<div style="margin-top:14px;"><p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6366f1;margin-bottom:6px;">Legal Terms Explained</p>`;
        html += s.legal_terms.map(t => `<div style="padding:8px 12px;background:#f5f3ff;border:1px solid #e9d5ff;border-radius:8px;margin-bottom:4px;"><strong style="font-size:0.78rem;color:#7c3aed;">${t.term}</strong><span style="font-size:0.75rem;color:#374151;margin-left:6px;">${t.meaning}</span></div>`).join('');
        html += '</div>';
      }
      if (s.action_required) html += `<div style="margin-top:14px;padding:12px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;"><p style="font-size:0.6rem;font-weight:700;color:#d97706;margin-bottom:2px;">ACTION REQUIRED</p><p style="font-size:0.8rem;color:#374151;">${s.action_required}</p></div>`;
      output.innerHTML = html || '<p>Summary generated.</p>';
    }
  } catch (err) { output.textContent = `Error: ${err.message}`; }

  btn.disabled = false; btn.textContent = 'Summarize Document';
  btn.style.background = '#7c3aed'; btn.style.color = 'white';
}

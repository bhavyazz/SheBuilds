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
      <h1 class="page-title">Document Translator</h1>
      <p class="page-subtitle">Translate legal documents across 12 Indian languages. Legal terms are preserved with simple explanations.</p>

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
          <textarea class="textarea" id="translate-input" rows="10" placeholder="Paste your legal document, court notice, complaint, or any text here..."></textarea>
        </div>
        <div class="translate-panel">
          <h3 style="font-size: 0.82rem; font-weight: 700; margin-bottom: 8px;">Translation</h3>
          <div class="translate-output" id="translate-output" style="min-height: 200px; color: #6b7280;">Translation will appear here...</div>
        </div>
      </div>

      <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="translate-btn">Translate</button>
        <button class="btn btn-secondary" id="translate-stream-btn">Translate (Streaming)</button>
        <button class="btn btn-secondary" id="copy-translation">Copy Translation</button>
      </div>

      <div style="margin-top: 16px; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.82rem; color: #6b7280;">
        <strong>Tip:</strong> Legal section numbers (like "Section 498A IPC") are preserved as-is in translations.
      </div>
    </div>
  `;

  document.getElementById('translate-btn')?.addEventListener('click', translateNormal);
  document.getElementById('translate-stream-btn')?.addEventListener('click', translateStreaming);
  document.getElementById('copy-translation')?.addEventListener('click', () => {
    const text = document.getElementById('translate-output')?.textContent || '';
    navigator.clipboard.writeText(text);
    document.getElementById('copy-translation').textContent = 'Copied!';
    setTimeout(() => { document.getElementById('copy-translation').textContent = 'Copy Translation'; }, 2000);
  });

  window.swapLanguages = () => {
    const src = document.getElementById('src-lang');
    const tgt = document.getElementById('tgt-lang');
    const tmp = src.value;
    src.value = tgt.value;
    tgt.value = tmp || 'English';
  };
}

async function translateNormal() {
  const text = document.getElementById('translate-input')?.value.trim();
  const sourceLang = document.getElementById('src-lang')?.value;
  const targetLang = document.getElementById('tgt-lang')?.value;
  const output = document.getElementById('translate-output');

  if (!text) { alert('Please enter text to translate.'); return; }
  if (!targetLang) { alert('Please select a target language.'); return; }

  const btn = document.getElementById('translate-btn');
  btn.disabled = true; btn.textContent = 'Translating...'; output.textContent = 'Translating...';

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

  if (!text) { alert('Please enter text to translate.'); return; }
  if (!targetLang) { alert('Please select a target language.'); return; }

  const btn = document.getElementById('translate-stream-btn');
  btn.disabled = true; btn.textContent = 'Translating...'; output.textContent = '';

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

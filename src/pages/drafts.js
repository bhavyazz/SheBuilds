export function renderDrafts(root) {
  root.innerHTML = `
    <div class="page-container fade-in">
      <div class="page-step-label">Document Generator</div>
      <h1 class="page-title">Complaint Draft Generator</h1>
      <p class="page-subtitle">Generate formal complaint drafts ready for review. Always consult a lawyer before filing.</p>

      <div class="card" style="padding: 28px;">
        <div style="margin-bottom: 16px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #374151; display: block; margin-bottom: 6px;">Document Type</label>
          <select class="input" id="draft-type">
            <option value="">— Select type —</option>
            <option value="police_complaint">Police Complaint / FIR Application</option>
            <option value="dv_application">Domestic Violence Application (PWDVA 2005)</option>
            <option value="posh_complaint">Workplace Harassment Complaint (POSH Act)</option>
            <option value="legal_notice">Legal Notice</option>
            <option value="maintenance_application">Maintenance Application (Section 125 CrPC)</option>
            <option value="rti_application">RTI Application</option>
          </select>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="font-size: 0.75rem; font-weight: 600; color: #374151; display: block; margin-bottom: 6px;">Details of Your Situation</label>
          <textarea class="textarea" id="draft-details" rows="6" placeholder="Describe your situation with as much detail as possible. Include dates, names, locations, and what happened.">${window.NyayaState?.caseContext || ''}</textarea>
        </div>

        <button class="btn btn-primary" id="draft-generate">Generate Draft</button>
      </div>

      <div id="draft-output"></div>

      <div style="margin-top: 16px; padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; font-size: 0.82rem; color: #92400e;">
        <strong>Disclaimer:</strong> This is a draft template for reference purposes only. Please review with a qualified advocate before submission. Call NALSA at 15100 for free legal aid.
      </div>
    </div>
  `;

  document.getElementById('draft-generate')?.addEventListener('click', generateDraft);
}

async function generateDraft() {
  const type = document.getElementById('draft-type').value;
  const details = document.getElementById('draft-details').value.trim();
  const output = document.getElementById('draft-output');

  if (!type) { alert('Please select a document type.'); return; }
  if (!details || details.length < 20) { alert('Please describe your situation in more detail.'); return; }

  const btn = document.getElementById('draft-generate');
  btn.disabled = true;
  btn.textContent = 'Generating...';
  output.innerHTML = `<div class="card" style="text-align: center; padding: 32px;"><div class="loading-spinner" style="margin: 0 auto 12px;"></div><p style="color: #6b7280;">Generating your draft...</p></div>`;

  try {
    const res = await fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, details }),
    });
    const data = await res.json();

    output.innerHTML = `
      <div class="draft-output">${escapeHtml(data.draft || 'No draft generated.')}</div>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <button class="btn btn-secondary" id="copy-draft">Copy to Clipboard</button>
        <button class="btn btn-secondary" id="download-draft">Download as Text</button>
      </div>
    `;

    document.getElementById('copy-draft')?.addEventListener('click', () => {
      navigator.clipboard.writeText(data.draft || '');
      document.getElementById('copy-draft').textContent = 'Copied!';
      setTimeout(() => { document.getElementById('copy-draft').textContent = 'Copy to Clipboard'; }, 2000);
    });

    document.getElementById('download-draft')?.addEventListener('click', () => {
      const blob = new Blob([data.draft || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${type}_draft.txt`; a.click();
      URL.revokeObjectURL(url);
    });
  } catch (err) {
    output.innerHTML = `<div class="card" style="color: #dc2626;">Error: ${err.message}</div>`;
  }

  btn.disabled = false;
  btn.textContent = 'Generate Draft';
}

function escapeHtml(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

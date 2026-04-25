/* ═══════════════════════════════════════════════════════════════
   Case Analysis Dashboard — Upload, Tabs, Precedents detail
   Agents pipeline moved to deploy-agents.js
   ═══════════════════════════════════════════════════════════════ */

const CASE_TABS = [
  { id: 'upload', label: 'Upload Case', icon: 'U' },
  { id: 'overview', label: 'Overview', icon: 'O' },
  { id: 'risk', label: 'Risk Analysis', icon: 'R' },
  { id: 'strength', label: 'Case Strength', icon: 'S' },
  { id: 'precedents', label: 'Precedents', icon: 'P' },
  { id: 'timeline', label: 'Timeline', icon: 'T' },
  { id: 'evidence', label: 'Evidence', icon: 'E' },
];

const COURTS = [
  { id: 'district', name: 'District Court' },
  { id: 'family', name: 'Family Court' },
  { id: 'sessions', name: 'Sessions Court' },
  { id: 'high_court', name: 'High Court' },
  { id: 'supreme_court', name: 'Supreme Court' },
  { id: 'consumer', name: 'Consumer Forum' },
  { id: 'labour', name: 'Labour Court' },
];

let state = {
  caseText: '',
  activeTab: 'upload',
  tabData: {},
  tabLoading: {},
  selectedCourt: 'district',
  selectedPrecedent: null,
  evidenceFiles: [],
  uploadError: '',
};

export function renderAgents(root) {
  root.innerHTML = `<div class="page-container fade-in" id="case-root"></div>`;
  render();
}

function render() {
  const root = document.getElementById('case-root');
  if (!root) return;

  root.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px;">
      <div>
        <p class="page-step-label">Case Intelligence</p>
        <h1 class="page-title">Case Analysis Dashboard</h1>
        <p class="page-subtitle" style="margin-bottom: 0;">Upload a case document or describe your situation. AI analyzes risk, strength, precedents, and timeline.</p>
      </div>
      ${state.caseText ? `
        <div style="display: flex; gap: 8px;">
          <span style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 0.68rem; font-weight: 600; color: #166534;">Case Loaded</span>
          <button class="btn btn-primary" onclick="navigateTo('deploy-agents')" style="font-size: 0.78rem; padding: 6px 16px;">Deploy Agents</button>
        </div>
      ` : ''}
    </div>

    <div class="tab-bar" id="case-tabs">
      ${CASE_TABS.map(t => `
        <button class="tab-btn ${state.activeTab === t.id ? 'active' : ''} ${!state.caseText && t.id !== 'upload' ? 'disabled-tab' : ''}" data-tab="${t.id}" ${!state.caseText && t.id !== 'upload' ? 'disabled' : ''}>
          ${t.label}
        </button>
      `).join('')}
    </div>

    <div id="tab-content" style="margin-top: 16px;"></div>

    ${state.selectedPrecedent ? renderPrecedentDetail() : ''}
  `;

  root.querySelectorAll('.tab-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      state.selectedPrecedent = null;
      render();
      if (btn.dataset.tab !== 'upload' && !state.tabData[btn.dataset.tab] && !state.tabLoading[btn.dataset.tab]) {
        loadTab(btn.dataset.tab);
      }
    });
  });

  renderTabContent();
}

function renderTabContent() {
  const container = document.getElementById('tab-content');
  if (!container) return;

  if (state.activeTab === 'upload') {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <div class="feature-icon-box" style="width: 56px; height: 56px; font-size: 1.2rem; margin: 0 auto 16px;">D</div>
        <h3 style="font-size: 1.1rem; margin-bottom: 4px;">Upload Case Document</h3>
        <p style="font-size: 0.82rem; color: #6b7280; margin-bottom: 24px;">Upload FIR, complaint, petition, or any legal document — or describe your case below</p>

        <div style="border: 2px dashed #e5e7eb; border-radius: 16px; padding: 32px; margin-bottom: 20px; cursor: pointer; transition: all 200ms;" id="drop-zone">
          <input type="file" id="file-input" accept=".txt,.pdf,.doc,.docx" style="display: none;" />
          <p style="font-size: 0.85rem; color: #9ca3af;"><strong>Click to upload</strong> or drag and drop</p>
          <p style="font-size: 0.72rem; color: #d1d5db; margin-top: 4px;">Supports .txt, .pdf, .doc files</p>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div style="flex: 1; height: 1px; background: #e5e7eb;"></div>
          <span style="font-size: 0.72rem; color: #9ca3af; font-weight: 600;">OR DESCRIBE YOUR CASE</span>
          <div style="flex: 1; height: 1px; background: #e5e7eb;"></div>
        </div>

        <textarea class="textarea" id="case-textarea" rows="6" placeholder="Describe your situation in detail. Include dates, names (you can use initials), locations, and what happened..." style="text-align: left;">${state.caseText}</textarea>

        <button class="btn btn-primary" id="load-case-btn" style="margin-top: 16px; width: 100%; padding: 14px;">
          Load Case and Begin Analysis
        </button>
      </div>
    `;

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    dropZone?.addEventListener('click', () => fileInput?.click());
    dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#111827'; });
    dropZone?.addEventListener('dragleave', () => { dropZone.style.borderColor = '#e5e7eb'; });
    dropZone?.addEventListener('drop', (e) => { e.preventDefault(); dropZone.style.borderColor = '#e5e7eb'; handleFile(e.dataTransfer.files[0]); });
    fileInput?.addEventListener('change', (e) => handleFile(e.target.files[0]));

    document.getElementById('load-case-btn')?.addEventListener('click', () => {
      const ta = document.getElementById('case-textarea');
      if (ta?.value.trim().length < 10) return alert('Please describe your case in more detail.');
      state.caseText = ta.value.trim();
      window.NyayaState.caseContext = state.caseText;
      state.activeTab = 'overview';
      render();
      loadTab('overview');
    });
    return;
  }

  if (state.activeTab === 'evidence') {
    container.innerHTML = `<div class="card slide-up" style="padding: 24px;">${renderEvidence()}</div>`;
    return;
  }

  const data = state.tabData[state.activeTab];
  const loading = state.tabLoading[state.activeTab];

  if (loading) {
    container.innerHTML = `<div class="card" style="text-align: center; padding: 40px;"><div class="loading-spinner" style="margin: 0 auto 12px;"></div><p style="font-size: 0.82rem; color: #6b7280;">Analyzing ${state.activeTab}...</p></div>`;
    return;
  }

  if (!data) { loadTab(state.activeTab); return; }

  if (data._error) {
    const tab = state.activeTab;
    container.innerHTML = `<div class="card" style="text-align:center;padding:40px;">
      <div class="feature-icon-box" style="width:48px;height:48px;font-size:1rem;margin:0 auto 12px;background:#dc2626;">!</div>
      <p style="font-size:0.88rem;font-weight:600;color:#111827;margin-bottom:6px;">Analysis Failed</p>
      <p style="font-size:0.78rem;color:#6b7280;max-width:400px;margin:0 auto 16px;line-height:1.5;">${data._error}</p>
      <button class="btn btn-primary" style="font-size:0.78rem;" id="retry-tab-btn">Retry Analysis</button>
    </div>`;
    document.getElementById('retry-tab-btn')?.addEventListener('click', () => {
      delete state.tabData[tab];
      loadTab(tab);
    });
    return;
  }

  container.innerHTML = `<div class="card slide-up" style="padding: 24px;">${renderTabData(state.activeTab, data)}</div>`;
}

function renderTabData(tab, data) {
  switch (tab) {
    case 'overview': return renderOverview(data);
    case 'risk': return renderRisk(data);
    case 'strength': return renderStrength(data);
    case 'precedents': return renderPrecedents(data);
    case 'timeline': return renderTimeline(data);
    case 'evidence': return renderEvidence();
    default: return '<p>No data</p>';
  }
}

function renderOverview(d) {
  return `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
      <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1;">Case Overview</span>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="padding: 12px; background: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6;">
        <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px;">Case Type</p>
        <p style="font-size: 0.88rem; font-weight: 700; color: #111827;">${d.case_type || 'Unknown'}</p>
      </div>
      <div style="padding: 12px; background: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6;">
        <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px;">Jurisdiction</p>
        <p style="font-size: 0.88rem; font-weight: 700; color: #111827;">${d.jurisdiction || 'TBD'}</p>
      </div>
    </div>
    <p style="font-size: 0.88rem; color: #374151; line-height: 1.7; margin-bottom: 16px;">${d.summary || ''}</p>
    ${d.applicable_acts?.length ? `<div style="margin-bottom: 12px;"><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 6px;">Applicable Laws</p><div style="display: flex; flex-wrap: wrap; gap: 4px;">${d.applicable_acts.map(a => `<span class="law-tag">${a}</span>`).join('')}</div></div>` : ''}
    ${d.ipc_sections?.length ? `<div><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #dc2626; margin-bottom: 6px;">IPC Sections</p><div style="display: flex; flex-wrap: wrap; gap: 4px;">${d.ipc_sections.map(s => `<span class="law-tag" style="background: #fef2f2; color: #991b1b; border-color: #fecaca;">${s}</span>`).join('')}</div></div>` : ''}
    ${d.key_facts?.length ? `<div style="margin-top: 12px;"><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 6px;">Key Facts</p>${d.key_facts.map(f => `<div class="key-factor">${f}</div>`).join('')}</div>` : ''}
  `;
}

function renderRisk(d) {
  const riskColor = d.overall_risk === 'critical' ? '#dc2626' : d.overall_risk === 'high' ? '#d97706' : d.overall_risk === 'medium' ? '#6366f1' : '#10b981';
  const score = d.risk_score || 50;
  return `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
      <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${riskColor};">Risk Assessment</span>
    </div>
    <div style="display: flex; align-items: end; gap: 12px; margin-bottom: 16px;">
      <span style="font-size: 3rem; font-weight: 900; color: ${riskColor}; line-height: 1;">${score}%</span>
      <span style="font-size: 0.92rem; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px;">${d.overall_risk || 'medium'} Risk</span>
    </div>
    <div style="height: 10px; background: #f3f4f6; border-radius: 5px; overflow: hidden; margin-bottom: 20px;">
      <div style="height: 100%; width: ${score}%; background: ${riskColor}; border-radius: 5px; transition: width 1.5s ease-out;"></div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;">
      ${['physical_safety', 'legal_risk', 'financial_risk', 'emotional_risk'].map(k => {
        const r = d[k]; if (!r) return '';
        const c = r.level === 'critical' ? '#dc2626' : r.level === 'high' ? '#d97706' : r.level === 'medium' ? '#6366f1' : '#10b981';
        return `<div style="padding: 12px; border-radius: 10px; border: 1px solid ${c}20; background: ${c}05;"><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: ${c}; margin-bottom: 4px;">${k.replace(/_/g, ' ')}</p><span style="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: ${c}15; color: ${c};">${r.level}</span>${(r.factors || []).map(f => `<p style="font-size: 0.72rem; color: #6b7280; margin-top: 6px;">- ${f}</p>`).join('')}</div>`;
      }).join('')}
    </div>
    ${d.protective_measures?.length ? `<div><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #059669; margin-bottom: 6px;">Protective Measures</p>${d.protective_measures.map(m => `<div class="key-factor" style="border-left: 2px solid #059669; border-radius: 0 10px 10px 0;">${m}</div>`).join('')}</div>` : ''}
  `;
}

function renderStrength(d) {
  const sColor = d.overall_strength === 'very_strong' ? '#059669' : d.overall_strength === 'strong' ? '#10b981' : d.overall_strength === 'moderate' ? '#d97706' : '#dc2626';
  return `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
      <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${sColor};">Case Strength</span>
      <span style="font-size: 0.68rem; font-weight: 700; padding: 3px 12px; border-radius: 12px; background: ${sColor}15; color: ${sColor}; text-transform: uppercase;">${d.overall_strength || 'moderate'} — ${d.strength_score || 50}%</span>
    </div>
    <p style="font-size: 0.88rem; color: #374151; line-height: 1.6; margin-bottom: 16px;">${d.legal_merit || ''}</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="padding: 14px; border-radius: 12px; border: 1px solid #bbf7d0; background: #f0fdf4;"><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 6px;">Strengths</p>${(d.strengths || []).map(s => `<p style="font-size: 0.78rem; color: #166534; margin: 4px 0;">- ${s}</p>`).join('')}</div>
      <div style="padding: 14px; border-radius: 12px; border: 1px solid #fecaca; background: #fef2f2;"><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: #dc2626; margin-bottom: 6px;">Weaknesses</p>${(d.weaknesses || []).map(w => `<p style="font-size: 0.78rem; color: #991b1b; margin: 4px 0;">- ${w}</p>`).join('')}</div>
    </div>
    ${d.evidence_needed?.length ? `<div><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; margin-bottom: 6px;">Evidence Needed</p>${d.evidence_needed.map(e => `<div class="key-factor">${e}</div>`).join('')}</div>` : ''}
  `;
}

function renderPrecedents(d) {
  return `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
      <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1;">Similar Precedents</span>
      <span style="font-size: 0.62rem; color: #9ca3af;">${(d.precedents||[]).length} cases found</span>
    </div>
    ${d.legal_trend ? `<p style="font-size: 0.85rem; color: #374151; line-height: 1.6; margin-bottom: 16px; padding: 12px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px;"><strong>Legal Trend:</strong> ${d.legal_trend}</p>` : ''}
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${(d.precedents || []).map((p, i) => {
        const oc = p.outcome === 'favorable' ? '#059669' : p.outcome === 'unfavorable' ? '#dc2626' : '#d97706';
        return `<div class="precedent-card" style="padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; transition: all 200ms;" onclick="window._selectPrecedent && window._selectPrecedent(${i})">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: #111827;">${p.case_name}</span>
            <span style="font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: ${oc}15; color: ${oc}; text-transform: uppercase;">${p.outcome || 'mixed'}</span>
          </div>
          <p style="font-size: 0.68rem; color: #9ca3af; margin-bottom: 6px;">${p.court || ''} | ${p.year || ''}</p>
          <p style="font-size: 0.78rem; color: #374151; line-height: 1.5;">${p.key_ruling || ''}</p>
          <p style="font-size: 0.68rem; color: #6366f1; margin-top: 6px; font-weight: 500;">Click to view full details →</p>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderPrecedentDetail() {
  const p = state.selectedPrecedent;
  if (!p) return '';
  const oc = p.outcome === 'favorable' ? '#059669' : p.outcome === 'unfavorable' ? '#dc2626' : '#d97706';
  return `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px;" id="precedent-overlay">
      <div style="background: white; border-radius: 20px; max-width: 640px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div>
            <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 4px;">Case Precedent</p>
            <h2 style="font-size: 1.2rem; font-weight: 800;">${p.case_name}</h2>
          </div>
          <button style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #9ca3af; padding: 4px;" onclick="window._closePrecedent && window._closePrecedent()">✕</button>
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          <span style="font-size: 0.68rem; padding: 3px 10px; border-radius: 12px; background: #f3f4f6; color: #374151; font-weight: 600;">${p.court || 'Court not specified'}</span>
          <span style="font-size: 0.68rem; padding: 3px 10px; border-radius: 12px; background: #f3f4f6; color: #374151; font-weight: 600;">${p.year || 'Year not specified'}</span>
          <span style="font-size: 0.68rem; padding: 3px 10px; border-radius: 12px; background: ${oc}15; color: ${oc}; font-weight: 700; text-transform: uppercase;">${p.outcome || 'mixed'}</span>
        </div>
        <div style="margin-bottom: 16px;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 6px;">Key Ruling</p>
          <p style="font-size: 0.88rem; color: #374151; line-height: 1.7; padding: 12px; background: #f9fafb; border-radius: 10px;">${p.key_ruling || ''}</p>
        </div>
        <div style="margin-bottom: 16px;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 6px;">Relevance to Your Case</p>
          <p style="font-size: 0.85rem; color: #374151; line-height: 1.6;">${p.relevance || ''}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" onclick="navigateTo('chat')" style="font-size: 0.78rem;">Discuss this case</button>
          <button class="btn btn-secondary" onclick="window._closePrecedent && window._closePrecedent()" style="font-size: 0.78rem;">Close</button>
        </div>
      </div>
    </div>
  `;
}

function renderTimeline(d) {
  const statusColors = { immediate: '#dc2626', short_term: '#d97706', medium_term: '#6366f1', long_term: '#9ca3af' };
  return `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #111827;">Legal Timeline</span>
      <span style="font-size: 0.68rem; color: #6b7280;">Est: ${d.total_estimated_duration || 'TBD'}</span>
    </div>

    <div style="margin-bottom: 16px;">
      <label style="font-size: 0.68rem; font-weight: 600; color: #6b7280; display: block; margin-bottom: 6px;">Select Court Type (affects timeline)</label>
      <select class="input" id="court-select" style="max-width: 280px;">
        ${COURTS.map(c => `<option value="${c.id}" ${state.selectedCourt === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </div>

    <div style="position: relative; padding-left: 24px;">
      <div style="position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: #e5e7eb;"></div>
      ${(d.phases || []).map((p) => {
        const c = statusColors[p.status] || '#6b7280';
        return `<div style="position: relative; margin-bottom: 20px;">
          <div style="position: absolute; left: -20px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: ${c}; border: 2px solid white; box-shadow: 0 0 0 2px ${c}40;"></div>
          <div style="padding: 14px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: #111827;">${p.phase}</span>
              <span style="font-size: 0.6rem; font-weight: 600; padding: 2px 8px; border-radius: 12px; background: ${c}10; color: ${c};">${p.duration}</span>
            </div>
            ${(p.actions || []).map(a => `<p style="font-size: 0.78rem; color: #6b7280; margin: 3px 0;">→ ${a}</p>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    ${d.critical_deadlines?.length ? `<div style="margin-top: 12px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;"><p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: #991b1b; margin-bottom: 4px;">Critical Deadlines</p>${d.critical_deadlines.map(dl => `<p style="font-size: 0.78rem; color: #991b1b;">- ${dl}</p>`).join('')}</div>` : ''}
  `;
}

/* ── Data Loading ──────────────────────────────────────── */

function getFullCaseContext() {
  let ctx = state.caseText;
  if (state.evidenceFiles.length) {
    const evidenceTexts = state.evidenceFiles
      .filter(f => f.extractedText)
      .map(f => `[Evidence: ${f.filename}]\n${f.extractedText}`)
      .join('\n\n');
    if (evidenceTexts) {
      ctx += '\n\n--- SUPPORTING EVIDENCE ---\n\n' + evidenceTexts;
    }
  }
  return ctx;
}

async function loadTab(tab) {
  state.tabLoading[tab] = true;
  render();

  try {
    const body = { tab, caseDescription: getFullCaseContext() };
    if (tab === 'timeline') body.court = state.selectedCourt;
    const res = await fetch('/api/agents/tab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (json.error) {
      state.tabData[tab] = { _error: json.error };
    } else if (!json.data || Object.keys(json.data).length === 0) {
      state.tabData[tab] = { _error: 'AI returned empty results. This may be due to API rate limits. Please try again in a few minutes.' };
    } else {
      state.tabData[tab] = json.data;
    }
  } catch (e) {
    state.tabData[tab] = { _error: `Network error: ${e.message}` };
  }
  state.tabLoading[tab] = false;
  render();

  // Court change handler for timeline
  if (tab === 'timeline') {
    document.getElementById('court-select')?.addEventListener('change', (e) => {
      state.selectedCourt = e.target.value;
      delete state.tabData['timeline'];
      loadTab('timeline');
    });
  }
}

function reloadAllTabs() {
  state.tabData = {};
  state.tabLoading = {};
  const currentTab = state.activeTab;
  if (currentTab !== 'upload' && currentTab !== 'evidence') {
    loadTab(currentTab);
  }
}

async function handleFile(file) {
  if (!file) return;
  const ta = document.getElementById('case-textarea');
  const dropZone = document.getElementById('drop-zone');
  if (!ta) return;

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    state.uploadError = 'File too large (max 10MB).';
    if (dropZone) dropZone.innerHTML = `<p style="color:#dc2626;font-size:0.82rem;">${state.uploadError}</p>`;
    return;
  }

  if (file.name.endsWith('.txt')) {
    const reader = new FileReader();
    reader.onload = (e) => { ta.value = e.target.result; state.uploadError = ''; };
    reader.readAsText(file);
    return;
  }

  if (dropZone) dropZone.innerHTML = `<div class="loading-spinner" style="margin:0 auto 8px;"></div><p style="font-size:0.82rem;color:#6b7280;">Extracting text from ${file.name}...</p>`;

  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/extract-text', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || data.error) {
      state.uploadError = data.error || 'Upload failed.';
      if (dropZone) dropZone.innerHTML = `<p style="color:#dc2626;font-size:0.82rem;">${state.uploadError}</p><button class="btn btn-secondary" style="margin-top:8px;font-size:0.72rem;" onclick="document.getElementById('file-input')?.click()">Try Again</button>`;
      return;
    }
    if (data.warning && !data.text) {
      if (dropZone) dropZone.innerHTML = `<p style="color:#d97706;font-size:0.82rem;">${data.warning}</p>`;
      return;
    }
    ta.value = data.text || '';
    state.uploadError = '';
    if (dropZone) dropZone.innerHTML = `<p style="color:#059669;font-size:0.82rem;font-weight:600;">Extracted from ${data.filename || file.name}${data.pages ? ` (${data.pages} pages)` : ''}</p>${data.warning ? `<p style="font-size:0.72rem;color:#d97706;margin-top:4px;">${data.warning}</p>` : ''}`;
  } catch (err) {
    state.uploadError = err.message;
    if (dropZone) dropZone.innerHTML = `<p style="color:#dc2626;font-size:0.82rem;">Failed: ${err.message}</p><button class="btn btn-secondary" style="margin-top:8px;font-size:0.72rem;" onclick="document.getElementById('file-input')?.click()">Retry</button>`;
  }
}

function renderEvidence() {
  setTimeout(bindEvidenceHandlers, 50);
  const hasText = state.evidenceFiles.some(f => f.extractedText);
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:0.78rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#6366f1;">Evidence Files</span>
        <span style="font-size:0.62rem;color:#9ca3af;">${state.evidenceFiles.length} file(s)</span>
      </div>
      ${hasText ? `<button class="btn btn-primary" style="font-size:0.72rem;padding:6px 14px;" onclick="window._reanalyzeWithEvidence()">Re-Analyze with Evidence</button>` : ''}
    </div>
    <div style="border:2px dashed #e5e7eb;border-radius:16px;padding:28px;text-align:center;cursor:pointer;margin-bottom:16px;transition:all 200ms;" id="evidence-drop">
      <input type="file" id="evidence-input" multiple accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.webp" style="display:none;" />
      <p style="font-size:0.85rem;color:#9ca3af;"><strong>Click to upload evidence</strong> or drag and drop</p>
      <p style="font-size:0.72rem;color:#d1d5db;margin-top:4px;">PDF, TXT, DOC, JPG, PNG — up to 10 files, 10MB each</p>
    </div>
    <div id="evidence-status"></div>
    ${state.evidenceFiles.length ? `<div style="display:flex;flex-direction:column;gap:8px;">
      ${state.evidenceFiles.map((f, i) => `<div style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:white;">
        <div style="width:32px;height:32px;border-radius:8px;background:${f.type==='image'?'#dbeafe':'#eef2ff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="font-size:0.65rem;font-weight:800;color:${f.type==='image'?'#2563eb':'#6366f1'};">${f.type==='image'?'IMG':f.filename?.split('.').pop()?.toUpperCase()||'F'}</span></div>
        <div style="flex:1;min-width:0;"><p style="font-size:0.82rem;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.filename}</p><p style="font-size:0.68rem;color:#9ca3af;">${(f.size/1024).toFixed(1)} KB${f.pages?' / '+f.pages+' pages':''}${f.extractedText?' / text extracted':''}</p></div>
        <button style="background:none;border:none;color:#d1d5db;cursor:pointer;font-size:0.9rem;padding:4px;" onclick="window._removeEvidence(${i})">✕</button>
      </div>`).join('')}
    </div>` : ''}
  `;
}

function bindEvidenceHandlers() {
  const drop = document.getElementById('evidence-drop');
  const input = document.getElementById('evidence-input');
  if (!drop || !input) return;
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.borderColor = '#6366f1'; });
  drop.addEventListener('dragleave', () => { drop.style.borderColor = '#e5e7eb'; });
  drop.addEventListener('drop', e => { e.preventDefault(); drop.style.borderColor = '#e5e7eb'; uploadEvidence(e.dataTransfer.files); });
  input.addEventListener('change', e => uploadEvidence(e.target.files));
}

async function uploadEvidence(fileList) {
  if (!fileList || !fileList.length) return;
  const statusEl = document.getElementById('evidence-status');
  if (statusEl) statusEl.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div><span style="font-size:0.78rem;color:#6b7280;">Uploading ${fileList.length} file(s)...</span></div>`;
  try {
    const fd = new FormData();
    for (const f of fileList) fd.append('files', f);
    const res = await fetch('/api/upload/evidence', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || data.error) { if (statusEl) statusEl.innerHTML = `<p style="color:#dc2626;font-size:0.78rem;margin-bottom:12px;">${data.error}</p>`; return; }
    state.evidenceFiles.push(...(data.files || []));
    // Clear all cached analysis so next tab visit re-analyzes with evidence
    state.tabData = {};
    if (statusEl) statusEl.innerHTML = `<p style="color:#059669;font-size:0.78rem;margin-bottom:12px;">Uploaded ${data.count} file(s). Click "Re-Analyze with Evidence" to update all analysis.</p>`;
    render();
    state.activeTab = 'evidence';
    render();
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<p style="color:#dc2626;font-size:0.78rem;margin-bottom:12px;">Upload failed: ${err.message}</p>`;
  }
}

window._removeEvidence = (idx) => {
  state.evidenceFiles.splice(idx, 1);
  state.tabData = {}; // Clear cache to re-analyze without this evidence
  render();
  state.activeTab = 'evidence';
  render();
};

window._reanalyzeWithEvidence = () => {
  state.tabData = {};
  state.activeTab = 'overview';
  render();
  loadTab('overview');
};

// Precedent detail handlers
window._selectPrecedent = (idx) => {
  const precs = state.tabData?.precedents?.precedents;
  if (precs && precs[idx]) {
    state.selectedPrecedent = precs[idx];
    render();
  }
};
window._closePrecedent = () => {
  state.selectedPrecedent = null;
  render();
};

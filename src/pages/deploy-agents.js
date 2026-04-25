/* Nexus-style staged Deploy Agents page */
const STAGES = ['input', 'agents', 'graph', 'debate', 'insights'];
const STAGE_LABELS = { input: 'Case Input', agents: 'Agent Analysis', graph: 'Knowledge Graph', debate: 'Agent Debate', insights: 'Final Insights' };
let selectedNode = null;

let S = { caseText: '', stage: 'input', stageIdx: 0, meta: '', domains: [], findings: [], debate: null, synthesis: null, status: '', running: false };

export function renderDeployAgents(root) {
  if (window.NyayaState?.caseContext && !S.caseText) S.caseText = window.NyayaState.caseContext;
  root.innerHTML = `<div class="page-container fade-in" id="dp-root"></div>`;
  draw();
}

function draw() {
  const r = document.getElementById('dp-root');
  if (!r) return;
  r.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
      <div>
        <p class="page-step-label">Multi-Agent Reasoning System</p>
        <h1 class="page-title">Deploy Expert Agents</h1>
      </div>
      ${S.stage !== 'input' ? `<div style="display:flex;gap:6px;">${STAGES.map((s, i) => {
    const done = i < S.stageIdx, active = s === S.stage;
    const bg = done ? '#059669' : active ? '#111827' : '#e5e7eb';
    const fg = done || active ? '#fff' : '#9ca3af';
    return `<button style="width:32px;height:32px;border-radius:50%;background:${bg};color:${fg};border:none;font-size:0.65rem;font-weight:800;cursor:pointer;" onclick="window._goStage&&window._goStage('${s}',${i})">${i + 1}</button>`;
  }).join('')}</div>` : ''}
    </div>
    ${S.status ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;"><div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div><span style="font-size:0.78rem;color:#6b7280;">${S.status}</span></div>` : ''}
    <div id="stage-content"></div>`;
  const c = document.getElementById('stage-content');
  if (!c) return;
  switch (S.stage) {
    case 'input': c.innerHTML = renderInput(); bindInput(); break;
    case 'agents': c.innerHTML = renderAgents(); break;
    case 'graph': c.innerHTML = renderGraph(); break;
    case 'debate': c.innerHTML = renderDebate(); break;
    case 'insights': c.innerHTML = renderInsights(); break;
  }
}

window._goStage = (s, i) => { if (i <= S.stageIdx) { S.stage = s; draw(); } };

function renderInput() {
  return `<div class="card" style="padding:32px;max-width:640px;">
    <div class="feature-icon-box" style="width:48px;height:48px;font-size:1rem;margin-bottom:16px;">1</div>
    <h3 style="font-size:1.1rem;margin-bottom:4px;">Describe Your Case</h3>
    <p style="font-size:0.78rem;color:#6b7280;margin-bottom:16px;">6 specialized AI agents will analyze from Legal, Financial, Psychological, Social, Rights, and Procedural perspectives.</p>
    <textarea class="textarea" id="dp-input" rows="6" placeholder="Describe your situation in detail...">${S.caseText}</textarea>
    <button class="btn btn-primary" id="dp-go" style="margin-top:14px;width:100%;padding:14px;">Deploy Expert Agents</button>
  </div>`;
}

function bindInput() {
  document.getElementById('dp-go')?.addEventListener('click', startPipeline);
}

function renderAgents() {
  return `<div style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
    <div><p class="page-step-label">Stage 2 of 5</p><h2 style="font-size:1.1rem;">Agent Analysis</h2></div>
    ${S.meta ? `<span style="font-size:0.68rem;color:#6b7280;max-width:340px;text-align:right;line-height:1.4;">${S.meta}</span>` : ''}
  </div>
  <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:16px;">${S.domains.map(d => `<span class="domain-tag" style="background:${d.color};">${d.name}</span>`).join('')}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">
    ${S.domains.map(d => {
    const f = S.findings.find(x => x.domain === d.id);
    if (!f) return `<div class="card" style="padding:20px;border-left:3px solid ${d.color};"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:28px;height:28px;border-radius:8px;background:${d.color}15;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:${d.color};">${d.name.charAt(0)}</div><span style="font-weight:700;font-size:0.82rem;">${d.name}</span></div><div style="display:flex;align-items:center;gap:6px;"><div class="loading-spinner" style="width:14px;height:14px;border-width:2px;"></div><span style="font-size:0.72rem;color:#9ca3af;">Analyzing...</span></div></div>`;
    const rc = f.risk_level === 'critical' ? '#dc2626' : f.risk_level === 'high' ? '#d97706' : f.risk_level === 'medium' ? '#6366f1' : '#10b981';
    const conf = f.confidence || (f.priority_score ? f.priority_score / 100 : 0.7);
    return `<div class="card" style="padding:20px;border-left:3px solid ${d.color};cursor:pointer;" onclick="this.querySelector('.agent-detail').style.display=this.querySelector('.agent-detail').style.display==='none'?'block':'none'">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:${d.color}15;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:${d.color};">${d.name.charAt(0)}</div>
          <span style="font-weight:700;font-size:0.82rem;">${f.agent_name || d.name}</span>
          <span style="margin-left:auto;font-size:0.58rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${rc}12;color:${rc};text-transform:uppercase;">${f.risk_level || 'medium'}</span>
        </div>
        <p style="font-size:0.75rem;color:#4b5563;line-height:1.5;margin-bottom:8px;">${f.stance || ''}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:0.6rem;font-weight:700;color:#9ca3af;text-transform:uppercase;">Confidence</span><span style="font-size:0.62rem;font-weight:700;color:${d.color};">${Math.round(conf * 100)}%</span></div>
        <div style="height:4px;background:#f3f4f6;border-radius:2px;overflow:hidden;"><div style="height:100%;width:${conf * 100}%;background:${d.color};border-radius:2px;transition:width 1s ease;"></div></div>
        <div class="agent-detail" style="display:none;margin-top:12px;border-top:1px solid #f3f4f6;padding-top:10px;">
          <p style="font-size:0.6rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Key Insights</p>
          ${(f.key_insights || []).map(k => `<div class="key-factor">${k}</div>`).join('')}
          ${f.prediction ? `<div style="margin-top:8px;padding:10px;background:${d.color}08;border:1px solid ${d.color}20;border-radius:10px;"><p style="font-size:0.6rem;font-weight:700;color:${d.color};margin-bottom:2px;">Prediction</p><p style="font-size:0.75rem;color:#374151;">${f.prediction}</p></div>` : ''}
        </div>
        <p style="font-size:0.62rem;color:#d1d5db;margin-top:8px;">Click to expand</p>
      </div>`;
  }).join('')}
  </div>
  ${!S.running && S.findings.length >= S.domains.length ? `<div style="text-align:center;margin-top:20px;"><button class="btn btn-primary" onclick="window._goStage('graph',2);S_stageIdx(2);">Continue to Knowledge Graph →</button></div>` : ''}`;
}

function renderGraph() {
  const w = 600, h = 500, n = S.domains.length, cx = w / 2, cy = h / 2 - 10, r = 170;
  const nodes = S.domains.map((d, i) => ({ ...d, x: cx + r * Math.cos(2 * Math.PI * i / n - Math.PI / 2), y: cy + r * Math.sin(2 * Math.PI * i / n - Math.PI / 2) }));
  const links = [];
  const relColors = { conflicts: '#ef4444', challenges: '#f59e0b', agrees: '#10b981', supports: '#3b82f6' };
  const relDash = { conflicts: '8 4', challenges: '6 3', agrees: '', supports: '' };
  if (S.debate?.relationships?.length) {
    S.debate.relationships.forEach(r => { links.push({ from: r.from, to: r.to, type: r.type, reason: r.reason }); });
  } else if (S.debate) {
    (S.debate.conflicts || []).forEach(c => { if (c.agent_a && c.agent_b) links.push({ from: c.agent_a, to: c.agent_b, type: 'conflicts', reason: c.incompatibility || '' }); });
    (S.debate.cross_domain_chains || []).forEach(ch => { (ch.chain || []).forEach((c, i, a) => { if (i < a.length - 1) links.push({ from: c.domain, to: a[i + 1].domain, type: 'supports', reason: '' }); }); });
  }
  // If still no links but we have findings, generate relationship lines between all agents
  if (!links.length && S.findings.length > 1) {
    for (let i = 0; i < S.findings.length; i++) {
      for (let j = i + 1; j < S.findings.length; j++) {
        const a = S.findings[i], b = S.findings[j];
        const sameRisk = a.risk_level === b.risk_level;
        links.push({ from: a.domain, to: b.domain, type: sameRisk ? 'agrees' : 'challenges', reason: '' });
      }
    }
  }
  const selF = selectedNode ? S.findings.find(f => f.domain === selectedNode) : null;
  const selD = selectedNode ? S.domains.find(d => d.id === selectedNode) : null;
  setTimeout(() => { nodes.forEach(nd => { document.getElementById('gn-' + nd.id)?.addEventListener('click', () => { selectedNode = selectedNode === nd.id ? null : nd.id; draw(); S.stage = 'graph'; draw(); }); }); }, 50);
  return `<div style="margin-bottom:12px;"><p class="page-step-label">Stage 3 of 5</p><h2 style="font-size:1.1rem;">Knowledge Graph</h2><p style="font-size:0.78rem;color:#6b7280;">Click any node to see that agent's analysis.</p></div>
  <div style="display:grid;grid-template-columns:${selF ? '1fr 320px' : '1fr'};gap:16px;margin-bottom:16px;">
    <div class="card" style="padding:20px;">
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;">
        ${links.map(l => { const a = nodes.find(x => x.id === l.from), b = nodes.find(x => x.id === l.to); if (!a || !b) return ''; const c = relColors[l.type] || '#9ca3af'; const dash = relDash[l.type] || ''; return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${c}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="0.6"/>${l.reason ? `<text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 6}" text-anchor="middle" style="font-size:7px;fill:${c};font-weight:600;">${l.type}</text>` : ''}`; }).join('')}
        ${nodes.map(nd => { const sel = nd.id === selectedNode; return `<g id="gn-${nd.id}" style="cursor:pointer;"><circle cx="${nd.x}" cy="${nd.y}" r="${sel ? 36 : 30}" fill="${sel ? nd.color : 'white'}" stroke="${nd.color}" stroke-width="3" style="filter:drop-shadow(0 3px 10px ${nd.color}40);transition:all .2s;"/><text x="${nd.x}" y="${nd.y + 5}" text-anchor="middle" dominant-baseline="middle" style="font-size:${sel ? 16 : 14}px;font-weight:800;fill:${sel ? 'white' : nd.color};">${nd.name.charAt(0)}</text><text x="${nd.x}" y="${nd.y + 50}" text-anchor="middle" style="font-size:10px;font-weight:600;fill:#374151;">${nd.name}</text></g>`; }).join('')}
        <g transform="translate(16,${h - 24})"><line x1="0" y1="0" x2="16" y2="0" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 4"/><text x="20" y="4" style="font-size:9px;fill:#9ca3af;">Conflict</text><line x1="80" y1="0" x2="96" y2="0" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 3"/><text x="100" y="4" style="font-size:9px;fill:#9ca3af;">Challenge</text><line x1="170" y1="0" x2="186" y2="0" stroke="#10b981" stroke-width="2"/><text x="190" y="4" style="font-size:9px;fill:#9ca3af;">Agrees</text><line x1="240" y1="0" x2="256" y2="0" stroke="#3b82f6" stroke-width="2"/><text x="260" y="4" style="font-size:9px;fill:#9ca3af;">Supports</text></g>
      </svg>
    </div>
    ${selF && selD ? `<div class="card" style="padding:18px;border-left:3px solid ${selD.color};align-self:start;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="width:28px;height:28px;border-radius:8px;background:${selD.color};color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;">${selD.name.charAt(0)}</div><span style="font-weight:700;font-size:0.88rem;">${selF.agent_name || selD.name}</span></div>
      <p style="font-size:0.78rem;color:#374151;line-height:1.5;margin-bottom:10px;">${selF.stance || ''}</p>
      <p style="font-size:0.6rem;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:4px;">Key Insights</p>
      ${(selF.key_insights || []).map(k => `<div class="key-factor">${k}</div>`).join('')}
      ${selF.prediction ? `<div style="margin-top:10px;padding:10px;background:${selD.color}08;border:1px solid ${selD.color}20;border-radius:10px;"><p style="font-size:0.6rem;font-weight:700;color:${selD.color};margin-bottom:2px;">Prediction</p><p style="font-size:0.75rem;color:#374151;">${selF.prediction}</p></div>` : ''}
    </div>`: ''}
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
    <div class="card" style="padding:14px;text-align:center;"><p style="font-size:1.4rem;font-weight:900;color:#111827;">${S.findings.length}</p><p style="font-size:0.68rem;color:#9ca3af;font-weight:600;">Agents</p></div>
    <div class="card" style="padding:14px;text-align:center;"><p style="font-size:1.4rem;font-weight:900;color:#ef4444;">${(S.debate?.conflicts || []).length}</p><p style="font-size:0.68rem;color:#9ca3af;font-weight:600;">Conflicts</p></div>
    <div class="card" style="padding:14px;text-align:center;"><p style="font-size:1.4rem;font-weight:900;color:#3b82f6;">${(S.debate?.cross_domain_chains || []).length}</p><p style="font-size:0.68rem;color:#9ca3af;font-weight:600;">Chains</p></div>
  </div>
  ${S.debate ? `<div style="text-align:center;"><button class="btn btn-primary" onclick="window._goStage('debate',3);S_stageIdx(3);">Continue to Debate →</button></div>` : ''}`;
}

function renderDebate() {
  const d = S.debate; if (!d) return '<p style="color:#9ca3af;">Debate data loading...</p>';
  const hasRounds = d.rounds && d.rounds.length > 0;
  function bub(agent, text, resp, isEven) {
    const ag = S.domains.find(x => x.id === agent) || { color: '#6b7280', name: agent || '?' };
    const rAg = resp ? S.domains.find(x => x.id === resp) : null;
    return `<div style="display:flex;gap:10px;margin-bottom:14px;max-width:85%;${isEven ? 'margin-left:auto;flex-direction:row-reverse;' : ''}">
      <div style="width:36px;height:36px;border-radius:50%;background:${ag.color};color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;flex-shrink:0;">${ag.name.charAt(0)}</div>
      <div style="flex:1;"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;${isEven ? 'justify-content:flex-end;' : ''}"><p style="font-size:0.68rem;font-weight:700;color:${ag.color};">${ag.name}</p>${rAg ? `<span style="font-size:0.58rem;color:#9ca3af;">replying to <span style="color:${rAg.color};font-weight:600;">${rAg.name}</span></span>` : ''}</div>
        <div style="padding:14px 16px;background:${isEven ? '#f9fafb' : ag.color + '06'};border:1px solid ${isEven ? '#e5e7eb' : ag.color + '18'};border-radius:${isEven ? '16px 3px 16px 16px' : '3px 16px 16px 16px'};"><p style="font-size:0.85rem;color:#1f2937;line-height:1.6;">${text}</p></div></div></div>`;
  }
  let html = '';
  if (hasRounds) {
    html = d.rounds.map((rd, ri) => `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;"><span style="width:26px;height:26px;border-radius:50%;background:#111827;color:white;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:800;">${rd.round || ri + 1}</span><span style="font-size:0.85rem;font-weight:700;color:#111827;">${rd.title || 'Round ' + (ri + 1)}</span></div>${(rd.exchanges || []).map((ex, ei) => bub(ex.agent, ex.says, ex.responds_to, ei % 2 === 1)).join('')}</div>`).join('');
  } else {
    (d.conflicts || []).forEach(c => {
      html += bub(c.agent_a, c.claim_a, null, false);
      html += bub(c.agent_b, c.claim_b, c.agent_a, true);
      if (c.incompatibility) { const sc = c.severity === 'critical' ? '#dc2626' : '#d97706'; html += `<div style="text-align:center;margin:12px 0;"><div style="display:inline-block;padding:8px 16px;background:${sc}08;border:1px solid ${sc}20;border-radius:20px;"><p style="font-size:0.62rem;font-weight:700;color:${sc};text-transform:uppercase;">Unresolved</p><p style="font-size:0.78rem;color:#374151;">${c.incompatibility}</p></div></div>`; }
    });
  }
  return `<div style="margin-bottom:16px;"><p class="page-step-label" style="color:#f43f5e;">Stage 4 of 5</p><h2 style="font-size:1.1rem;">Agent Debate</h2><p style="font-size:0.78rem;color:#6b7280;">${hasRounds ? d.rounds.length + ' rounds of deliberation between ' + S.domains.length + ' experts' : 'Agents argue positions and find conflicts'}.</p></div>
  <div class="card" style="padding:24px;margin-bottom:16px;">${html}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
    <div class="card" style="padding:16px;border-left:3px solid #059669;"><p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;color:#059669;margin-bottom:8px;">Where Agents Agreed</p>${(d.consensus_points || []).map(p => `<p style="font-size:0.78rem;color:#374151;padding:6px 8px;background:#f0fdf4;border-radius:8px;margin-bottom:4px;">${p}</p>`).join('')}</div>
    <div class="card" style="padding:16px;border-left:3px solid #d97706;"><p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;color:#d97706;margin-bottom:8px;">Blind Spots</p>${(d.blind_spots || []).map(b => `<p style="font-size:0.78rem;color:#374151;padding:6px 8px;background:#fffbeb;border-radius:8px;margin-bottom:4px;">${b}</p>`).join('')}</div>
  </div>
  ${(d.cross_domain_chains || []).length ? `<div class="card" style="padding:16px;margin-bottom:16px;"><p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#2563eb;margin-bottom:10px;">Causal Chains</p>${(d.cross_domain_chains || []).map(ch => `<div style="margin-bottom:12px;"><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">${(ch.chain || []).map((c, i, a) => { const di = S.domains.find(x => x.id === c.domain) || { color: '#6b7280' }; return `<span style="display:flex;align-items:center;gap:3px;"><span class="domain-tag" style="background:${di.color};font-size:0.6rem;">${c.domain}</span>${i < a.length - 1 ? '<span style="color:#9ca3af;">\u2192</span>' : ''}</span>`; }).join('')}</div>${(ch.chain || []).map((c, i) => `<p style="font-size:0.75rem;color:#374151;margin:2px 0;padding-left:${i * 12}px;">\u2192 ${c.claim}</p>`).join('')}${ch.non_obvious_insight ? `<p style="font-size:0.75rem;color:#2563eb;font-weight:600;margin-top:4px;">${ch.non_obvious_insight}</p>` : ''}</div>`).join('')}</div>` : ''}
  ${S.synthesis ? `<div style="text-align:center;"><button class="btn btn-primary" onclick="window._goStage('insights',4);S_stageIdx(4);">View Final Insights \u2192</button></div>` : ''}`;
}


function renderInsights() {
  const s = S.synthesis; if (!s) return '<p style="color:#9ca3af;">Generating insights...</p>';
  const sevC = s.severity === 'critical' ? '#dc2626' : s.severity === 'urgent' ? '#d97706' : '#6366f1';
  const lawsHTML = s.key_laws?.length ? `<div style="margin-bottom:16px;"><p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#6366f1;margin-bottom:8px;">Applicable Laws</p><div style="display:flex;flex-wrap:wrap;gap:4px;">${s.key_laws.map(l => `<span class="law-tag">${l.name} ${l.section || ''}</span>`).join('')}</div></div>` : '';
  const actionsHTML = (s.immediate_actions || []).map((a, i) => `<div style="display:flex;align-items:start;gap:10px;margin-bottom:8px;"><span style="width:24px;height:24px;border-radius:50%;background:#f0fdf4;border:1px solid #bbf7d0;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#059669;flex-shrink:0;">${i + 1}</span><span style="font-size:0.85rem;color:#374151;line-height:1.5;">${a}</span></div>`).join('');
  const noteHTML = s.empowerment_note ? `<div style="padding:16px;background:#f5f3ff;border:1px solid #e9d5ff;border-radius:12px;"><p style="font-size:0.85rem;color:#7c3aed;line-height:1.6;">${s.empowerment_note}</p></div>` : '';
  return `<div style="margin-bottom:16px;"><p class="page-step-label" style="color:#d97706;">Stage 5 of 5</p><h2 style="font-size:1.1rem;">Final Assessment</h2></div><div class="card" style="margin-bottom:16px;overflow:hidden;"><div style="padding:24px;background:linear-gradient(135deg,${sevC}08,${sevC}02);border-bottom:1px solid ${sevC}15;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><div style="width:40px;height:40px;border-radius:12px;background:${sevC};color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;">!</div><div><p style="font-size:0.62rem;font-weight:700;color:${sevC};text-transform:uppercase;letter-spacing:1px;">Severity: ${s.severity || 'urgent'}</p><p style="font-size:1rem;font-weight:800;">${S.findings.length} Agents Analyzed</p></div></div><p style="font-size:0.92rem;color:#374151;line-height:1.7;">${s.overall_assessment || ''}</p></div><div style="padding:24px;">${lawsHTML}<div style="margin-bottom:16px;"><p style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#059669;margin-bottom:8px;">Immediate Actions</p>${actionsHTML}</div>${noteHTML}</div></div><div class="card" style="text-align:center;padding:28px;"><h3 style="font-size:1rem;margin-bottom:4px;">Analysis Complete</h3><p style="font-size:0.78rem;color:#6b7280;margin-bottom:14px;">${S.findings.length} agents / ${(S.debate?.conflicts || []).length} conflicts / ${(S.debate?.cross_domain_chains || []).length} chains</p><div style="display:flex;gap:8px;justify-content:center;"><button class="btn btn-primary" onclick="navigateTo('chat')">Discuss with AI Chat</button><button class="btn btn-secondary" onclick="navigateTo('drafts')">Generate Complaint</button></div></div>`;
}

/* Pipeline */
async function startPipeline() {
  const input = document.getElementById('dp-input');
  const text = input?.value.trim();
  if (!text || text.length < 10) return alert('Please describe your situation in more detail.');
  S.caseText = text; S.running = true; S.stage = 'agents'; S.stageIdx = 1;
  S.meta = ''; S.domains = []; S.findings = []; S.debate = null; S.synthesis = null; S.status = 'Starting pipeline...';
  window.NyayaState.caseContext = text;
  draw();
  try {
    const res = await fetch('/api/agents/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseDescription: text }) });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try { handleEvent(JSON.parse(line.slice(6))); } catch (e) { }
      }
    }
  } catch (err) { S.status = `Error: ${err.message} `; draw(); }
  S.running = false;
}

function handleEvent(ev) {
  switch (ev.type) {
    case 'stage': S.status = ev.message; draw(); break;
    case 'domains_selected': S.domains = ev.domains; S.meta = ev.reasoning || ''; draw(); break;
    case 'agent_complete': if (ev.finding) S.findings.push(ev.finding); draw(); break;
    case 'debate': S.debate = ev.debate; S.stageIdx = Math.max(S.stageIdx, 2); draw(); break;
    case 'synthesis': S.synthesis = ev.synthesis; S.status = ''; S.stageIdx = 4; draw(); break;
    case 'done': S.status = ''; S.running = false; draw(); break;
    case 'error': S.status = `Error: ${ev.message} `; draw(); break;
  }
}

// Allow stage navigation from graph/debate buttons
window.S_stageIdx = (i) => { S.stageIdx = Math.max(S.stageIdx, i); S.stage = STAGES[i]; draw(); };

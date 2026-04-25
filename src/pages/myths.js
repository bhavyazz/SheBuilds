/* ═══════════════════════════════════════════════════════════════
   Myth Buster — Interactive, searchable, shareable
   ═══════════════════════════════════════════════════════════════ */

export async function renderMyths(root) {
  root.innerHTML = `
    <div class="page-container fade-in">
      <div class="page-step-label">Legal Awareness</div>
      <h1 class="page-title">Legal Myth Buster</h1>
      <p class="page-subtitle">Common misconceptions about women's legal rights in India. Test your knowledge and learn the truth.</p>

      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1; min-width: 200px;">
          <input class="input" id="myth-search" placeholder="Search myths..." style="padding: 10px 16px;" />
        </div>
        <div id="myth-score" style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.72rem; color: #9ca3af;">Score:</span>
          <span id="score-display" style="font-size: 0.88rem; font-weight: 800; color: #111827;">0 / 0</span>
        </div>
      </div>

      <!-- AI Myth Checker -->
      <div class="card" style="padding: 20px; margin-bottom: 20px; border-left: 3px solid #6366f1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <div class="feature-icon-box" style="width: 28px; height: 28px; font-size: 0.65rem; margin-bottom: 0; background: #6366f1;">AI</div>
          <span style="font-size: 0.82rem; font-weight: 700;">Ask AI — Is this a myth?</span>
        </div>
        <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 10px;">Type any legal statement and AI will tell you if it's a myth or fact under Indian law.</p>
        <div style="display: flex; gap: 8px;">
          <input class="input" id="ai-myth-input" placeholder="e.g. A woman can't own property in India" style="flex: 1;" />
          <button class="btn btn-primary" id="ai-myth-btn" style="white-space: nowrap;">Check</button>
        </div>
        <div id="ai-myth-result" style="margin-top: 12px;"></div>
      </div>

      <div class="tab-bar" id="myth-tabs"></div>
      <div id="myths-list"><div class="loading-spinner" style="margin: 40px auto;"></div></div>
    </div>
  `;

  try {
    const res = await fetch('/api/data/myths');
    const myths = await res.json();
    renderMythCards(myths);
  } catch (err) {
    document.getElementById('myths-list').innerHTML = `<p style="color: #dc2626;">Failed to load.</p>`;
  }

  // AI Myth Checker
  document.getElementById('ai-myth-btn')?.addEventListener('click', checkMythWithAI);
  document.getElementById('ai-myth-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkMythWithAI();
  });
}

async function checkMythWithAI() {
  const input = document.getElementById('ai-myth-input');
  const result = document.getElementById('ai-myth-result');
  const btn = document.getElementById('ai-myth-btn');
  const statement = input?.value.trim();
  if (!statement || statement.length < 5) return alert('Please type a legal statement to check.');

  btn.disabled = true;
  btn.textContent = 'Checking...';
  result.innerHTML = `<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 8px 0;"></div>`;

  try {
    const res = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Is this statement a legal myth or fact under Indian law? Statement: "${statement}"

Reply in this exact format:
VERDICT: [MYTH or FACT]
EXPLANATION: [2-3 sentence explanation citing specific Indian laws or sections]
CORRECT POSITION: [What the law actually says]`
        }]
      }),
    });

    const reader = res.body?.getReader?.();
    if (!reader) {
      result.innerHTML = `<p style="font-size: 0.78rem; color: #dc2626;">Streaming not supported.</p>`;
      btn.disabled = false;
      btn.textContent = 'Check';
      return;
    }

    let fullText = '';
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
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') fullText += data.data;
        } catch (e) {}
      }
    }

    // Parse the result
    const isMyth = fullText.toUpperCase().includes('VERDICT: MYTH') || fullText.toUpperCase().includes('VERDICT:MYTH');
    const bgColor = isMyth ? '#fef2f2' : '#f0fdf4';
    const borderColor = isMyth ? '#fecaca' : '#bbf7d0';
    const textColor = isMyth ? '#991b1b' : '#166534';
    const label = isMyth ? 'MYTH' : 'FACT';

    result.innerHTML = `
      <div style="padding: 14px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <span style="font-size: 0.6rem; font-weight: 800; padding: 3px 10px; border-radius: 6px; background: ${textColor}; color: white; text-transform: uppercase;">${label}</span>
          <span style="font-size: 0.75rem; font-weight: 600; color: ${textColor};">"${statement}"</span>
        </div>
        <p style="font-size: 0.82rem; color: #374151; line-height: 1.6;">${fullText.replace(/VERDICT:?\s*(MYTH|FACT)/gi, '').replace(/EXPLANATION:?\s*/gi, '').replace(/CORRECT POSITION:?\s*/gi, '<br><strong>Correct Position:</strong> ').trim()}</p>
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<p style="font-size: 0.78rem; color: #dc2626;">Error: ${err.message}</p>`;
  }

  btn.disabled = false;
  btn.textContent = 'Check';
}

function renderMythCards(myths) {
  const categories = ['All', ...new Set(myths.map(m => m.category))];
  let activeCategory = 'All';
  let searchTerm = '';
  let revealed = new Set();
  let guesses = {};

  const tabs = document.getElementById('myth-tabs');
  const list = document.getElementById('myths-list');

  function renderAll() {
    // Tabs
    tabs.innerHTML = categories.map(c => `
      <button class="tab-btn ${activeCategory === c ? 'active' : ''}" data-cat="${c}">${c}${c !== 'All' ? ` (${myths.filter(m => m.category === c).length})` : ''}</button>
    `).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeCategory = btn.dataset.cat; renderAll(); });
    });

    // Filter
    let filtered = activeCategory === 'All' ? myths : myths.filter(m => m.category === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(m => m.myth.toLowerCase().includes(q) || m.fact.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }

    // Score
    const totalRevealed = revealed.size;
    const correctGuesses = Object.values(guesses).filter(g => g === true).length;
    document.getElementById('score-display').textContent = `${correctGuesses} / ${totalRevealed}`;

    // Cards
    list.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px;">
        ${filtered.map(m => {
          const isRevealed = revealed.has(m.id);
          const guess = guesses[m.id];
          const catColor = getCategoryColor(m.category);

          return `
            <div class="myth-card ${isRevealed ? 'revealed' : ''}" id="myth-${m.id}" style="border-left: 3px solid ${catColor};">
              <div class="myth-card-header" style="padding: 18px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                    <span style="font-size: 0.58rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: ${catColor}10; color: ${catColor}; text-transform: uppercase;">${m.category}</span>
                    <span style="font-size: 0.58rem; color: #d1d5db;">#${m.id}</span>
                  </div>
                  <p class="myth-text" style="font-size: 0.88rem; font-weight: 600; line-height: 1.5; color: #111827;">"${m.myth}"</p>
                </div>
              </div>

              ${!isRevealed ? `
                <div style="padding: 0 18px 18px;">
                  <p style="font-size: 0.72rem; color: #6b7280; margin-bottom: 10px;">Do you think this is true or false?</p>
                  <div style="display: flex; gap: 8px;">
                    <button class="myth-guess-btn" data-id="${m.id}" data-ans="true" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; cursor: pointer; font-family: inherit; font-size: 0.78rem; font-weight: 600; color: #374151; transition: all 150ms;">True</button>
                    <button class="myth-guess-btn" data-id="${m.id}" data-ans="false" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; cursor: pointer; font-family: inherit; font-size: 0.78rem; font-weight: 600; color: #374151; transition: all 150ms;">False (Myth)</button>
                  </div>
                </div>
              ` : `
                <div class="myth-card-body" style="display: block; padding: 0 18px 18px; border-top: 1px solid #f3f4f6; padding-top: 14px;">
                  ${guess !== undefined ? `
                    <div style="padding: 8px 12px; border-radius: 10px; margin-bottom: 10px; ${guess ? 'background: #f0fdf4; border: 1px solid #bbf7d0;' : 'background: #fef2f2; border: 1px solid #fecaca;'}">
                      <p style="font-size: 0.72rem; font-weight: 600; color: ${guess ? '#166534' : '#991b1b'};">${guess ? 'Correct! This is indeed a myth.' : 'Not quite — this is actually a myth.'}</p>
                    </div>
                  ` : ''}
                  <div style="padding: 12px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 10px; margin-bottom: 10px;">
                    <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; color: #059669; margin-bottom: 4px;">The Facts</p>
                    <p style="font-size: 0.82rem; color: #374151; line-height: 1.6;">${m.fact}</p>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary" style="font-size: 0.72rem; padding: 6px 12px;" onclick="window._shareMythFn && window._shareMythFn(${m.id})">Share</button>
                    <button class="btn btn-secondary" style="font-size: 0.72rem; padding: 6px 12px;" onclick="navigateTo('chat')">Ask AI about this</button>
                  </div>
                </div>
              `}
            </div>
          `;
        }).join('')}
      </div>

      ${filtered.length === 0 ? `<div class="card" style="text-align: center; padding: 32px; color: #9ca3af;">No myths match your search.</div>` : ''}

      ${totalRevealed > 0 ? `
        <div style="margin-top: 24px; padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; text-align: center;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 4px;">Your Score</p>
          <p style="font-size: 2rem; font-weight: 900; color: #111827;">${correctGuesses} / ${totalRevealed}</p>
          <p style="font-size: 0.78rem; color: #6b7280;">${correctGuesses === totalRevealed ? 'Perfect score! You know your rights well.' : correctGuesses > totalRevealed / 2 ? 'Good knowledge! Keep learning.' : 'Many common myths caught you — share this page to spread awareness.'}</p>
          ${totalRevealed >= 5 ? `<button class="btn btn-primary" style="margin-top: 12px; font-size: 0.78rem;" onclick="revealed.clear(); guesses = {}; renderAll();">Reset Quiz</button>` : ''}
        </div>
      ` : ''}
    `;

    // Bind guess buttons
    list.querySelectorAll('.myth-guess-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const ans = btn.dataset.ans;
        guesses[id] = (ans === 'false'); // "false" means they correctly identified it as a myth
        revealed.add(id);
        renderAll();
      });
    });

    // Bind search
    document.getElementById('myth-search')?.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderAll();
    });

    // Share function
    window._shareMythFn = (id) => {
      const myth = myths.find(m => m.id === id);
      if (!myth) return;
      const text = `Legal Myth Buster:\n\nMyth: "${myth.myth}"\n\nFact: ${myth.fact}\n\n— NyayaSahaya`;
      if (navigator.share) {
        navigator.share({ title: 'Legal Myth Busted', text }).catch(() => {});
      } else {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
      }
    };
  }

  renderAll();
}

function getCategoryColor(cat) {
  const colors = {
    'Police & FIR': '#dc2626',
    'Property': '#059669',
    'Domestic Violence': '#e11d48',
    'Workplace': '#7c3aed',
    'Divorce & Maintenance': '#d97706',
    'Sexual Assault': '#991b1b',
    'Cybercrime': '#6366f1',
    'Child Custody': '#06b6d4',
    'Dowry': '#b91c1c',
    'Legal Aid': '#10b981',
  };
  return colors[cat] || '#6b7280';
}

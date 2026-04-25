/* ═══════════════════════════════════════════════════════════════
   Know Your Rights — Redesigned, clean, structured
   ═══════════════════════════════════════════════════════════════ */

export async function renderRights(root) {
  root.innerHTML = `
    <div class="page-container fade-in">
      <div class="page-step-label">Legal Knowledge</div>
      <h1 class="page-title">Know Your Rights</h1>
      <p class="page-subtitle">Understand your legal protections across 7 key domains. Every right listed is backed by Indian law.</p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin-bottom: 24px;" id="rights-nav"></div>

      <div id="rights-list">
        <div class="loading-spinner" style="margin: 40px auto;"></div>
      </div>
    </div>
  `;

  try {
    const res = await fetch('/api/data/rights');
    const rights = await res.json();
    renderRightsCards(rights);
  } catch (err) {
    document.getElementById('rights-list').innerHTML = `<p style="color: #dc2626;">Failed to load. Is the server running?</p>`;
  }
}

function renderRightsCards(rights) {
  const nav = document.getElementById('rights-nav');
  const container = document.getElementById('rights-list');

  // Quick-nav chips
  nav.innerHTML = rights.map((r, i) => `
    <button class="rights-nav-chip" onclick="document.getElementById('rights-card-${i}')?.scrollIntoView({behavior:'smooth', block:'start'})" style="
      display: flex; align-items: center; gap: 6px; padding: 10px 12px;
      background: white; border: 1px solid #e5e7eb; border-radius: 12px;
      cursor: pointer; transition: all 150ms; font-family: inherit; font-size: 0.75rem; font-weight: 600; color: #374151;
      border-left: 3px solid ${r.color};
    ">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${r.color}; flex-shrink: 0;"></span>
      ${r.title}
    </button>
  `).join('');

  container.innerHTML = rights.map((r, i) => `
    <div class="rights-card" id="rights-card-${i}" style="margin-bottom: 16px; border-left: 3px solid ${r.color};">
      <div class="rights-card-header" onclick="document.getElementById('rights-card-${i}').classList.toggle('expanded')">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: ${r.color}10; border: 1px solid ${r.color}25; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-weight: 800; font-size: 0.85rem; color: ${r.color};">${r.title.charAt(0)}</span>
        </div>
        <div class="rights-card-info">
          <h3>${r.title}</h3>
          <p>${r.summary}</p>
        </div>
        <span class="rights-card-chevron">▼</span>
      </div>
      <div class="rights-card-body">
        <!-- Applicable Laws -->
        <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 10px;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 8px;">Applicable Laws</p>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${r.laws.map(l => `<span class="law-tag" title="${l.name}">${l.shortName}</span>`).join('')}
          </div>
        </div>

        <!-- Your Rights -->
        <div style="margin-bottom: 16px;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #059669; margin-bottom: 8px;">Your Rights</p>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${r.rights.map((right, ri) => `
              <div style="display: flex; align-items: start; gap: 10px; padding: 10px 12px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 10px;">
                <span style="width: 20px; height: 20px; border-radius: 50%; background: #059669; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; flex-shrink: 0; margin-top: 1px;">${ri + 1}</span>
                <p style="font-size: 0.82rem; color: #166534; line-height: 1.5;">${right}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Step by Step -->
        <div style="margin-bottom: 16px;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin-bottom: 8px;">Step-by-Step Action Plan</p>
          <div style="position: relative; padding-left: 20px;">
            <div style="position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: #e5e7eb;"></div>
            ${r.steps.map((step, si) => `
              <div style="position: relative; margin-bottom: 12px;">
                <div style="position: absolute; left: -16px; top: 3px; width: 12px; height: 12px; border-radius: 50%; background: #6366f1; border: 2px solid white; box-shadow: 0 0 0 2px #c7d2fe;"></div>
                <p style="font-size: 0.82rem; color: #374151; line-height: 1.5; padding: 8px 12px; background: #f9fafb; border-radius: 8px;">${step}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Evidence -->
        <div style="margin-bottom: 16px;">
          <p style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; margin-bottom: 8px;">Evidence to Preserve</p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${r.evidence.map(e => `<span style="padding: 5px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 20px; font-size: 0.75rem; color: #92400e; font-weight: 500;">${e}</span>`).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="navigateTo('chat')" style="font-size: 0.78rem; padding: 8px 16px;">
            Ask about ${r.title}
          </button>
          <button class="btn btn-secondary" onclick="navigateTo('drafts')" style="font-size: 0.78rem; padding: 8px 16px;">
            Generate Complaint
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

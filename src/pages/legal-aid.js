/* ═══════════════════════════════════════════════════════════════
   Legal Aid Directory — with custom emergency contacts
   ═══════════════════════════════════════════════════════════════ */

export async function renderLegalAid(root) {
  root.innerHTML = `
    <div class="page-container fade-in">
      <div class="page-step-label">Support Network</div>
      <h1 class="page-title">Legal Aid Directory</h1>
      <p class="page-subtitle">Verified helplines, organizations, and online portals. Add your own emergency contacts below.</p>
      <div class="tab-bar" id="aid-tabs"></div>
      <div id="aid-content"><div class="loading-spinner" style="margin: 40px auto;"></div></div>
    </div>
  `;

  try {
    const res = await fetch('/api/data/legal-aid');
    const data = await res.json();
    renderAidContent(data);
  } catch (err) {
    document.getElementById('aid-content').innerHTML = `<p style="color: #dc2626;">Failed to load.</p>`;
  }
}

function renderAidContent(data) {
  const tabs = document.getElementById('aid-tabs');
  const content = document.getElementById('aid-content');

  const sections = [
    { id: 'emergency', label: 'Emergency', data: data.emergency },
    { id: 'my-contacts', label: 'My Contacts', data: null },
    { id: 'national', label: 'National Bodies', data: data.national },
    { id: 'ngos', label: 'NGOs', data: data.ngos },
    { id: 'states', label: 'State Commissions', data: data.state_commissions },
    { id: 'portals', label: 'Online Portals', data: data.online_portals },
  ];

  let activeTab = 'emergency';

  function renderTabs() {
    tabs.innerHTML = sections.map(s => `
      <button class="tab-btn ${activeTab === s.id ? 'active' : ''}" data-tab="${s.id}">${s.label}${s.id === 'my-contacts' ? ` (${getCustomContacts().length})` : ''}</button>
    `).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeTab = btn.dataset.tab; renderTabs(); renderSection(); });
    });
  }

  function renderSection() {
    const section = sections.find(s => s.id === activeTab);
    if (!section) return;

    if (activeTab === 'my-contacts') {
      renderMyContacts();
      return;
    }

    if (activeTab === 'emergency' || activeTab === 'national' || activeTab === 'ngos') {
      content.innerHTML = `<div class="card-grid">${section.data.map(item => `
        <div class="resource-card">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <span style="font-weight: 800; font-size: 0.75rem; color: #374151;">${(item.name || '').charAt(0)}</span>
          </div>
          <div class="resource-name">${item.name}</div>
          <div class="resource-desc">${item.description || ''}</div>
          ${item.location ? `<p style="font-size: 0.78rem; color: #6b7280; margin-bottom: 8px;">${item.location}</p>` : ''}
          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            ${item.number || item.phone ? `<a href="tel:${item.number || item.phone}" class="resource-phone">${item.number || item.phone}</a>` : ''}
            ${item.website ? `<a href="${item.website}" target="_blank" class="resource-link">Website →</a>` : ''}
          </div>
          ${item.services ? `<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 4px;">${item.services.map(s => `<span style="padding: 2px 8px; background: #f3f4f6; border-radius: 12px; font-size: 0.68rem; color: #6b7280;">${s}</span>`).join('')}</div>` : ''}
        </div>
      `).join('')}</div>`;
    } else if (activeTab === 'states') {
      content.innerHTML = `<div class="card-grid">${section.data.map(item => `
        <div class="resource-card">
          <div class="resource-name">${item.state}</div>
          <div class="resource-desc">${item.name}</div>
          <div style="margin-top: 8px;">
            ${item.website ? `<a href="${item.website}" target="_blank" class="resource-link">Website →</a>` : ''}
            ${item.phone ? `<a href="tel:${item.phone}" class="resource-phone" style="margin-left: 8px;">${item.phone}</a>` : ''}
          </div>
        </div>
      `).join('')}</div>`;
    } else if (activeTab === 'portals') {
      content.innerHTML = `<div class="card-grid">${section.data.map(item => `
        <div class="resource-card">
          <div class="resource-name">${item.name}</div>
          <div class="resource-desc">${item.description}</div>
          <a href="${item.url}" target="_blank" class="btn btn-secondary" style="margin-top: 10px; font-size: 0.78rem;">Visit Portal →</a>
        </div>
      `).join('')}</div>`;
    }
  }

  function renderMyContacts() {
    const contacts = getCustomContacts();
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div class="card" style="padding: 20px;">
          <h3 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 12px;">Add Emergency Contact</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 10px; align-items: end;">
            <div>
              <label style="font-size: 0.68rem; font-weight: 600; color: #6b7280; display: block; margin-bottom: 4px;">Name</label>
              <input class="input" id="ec-name" placeholder="Contact name" />
            </div>
            <div>
              <label style="font-size: 0.68rem; font-weight: 600; color: #6b7280; display: block; margin-bottom: 4px;">Phone Number</label>
              <input class="input" id="ec-phone" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label style="font-size: 0.68rem; font-weight: 600; color: #6b7280; display: block; margin-bottom: 4px;">Relationship</label>
              <select class="input" id="ec-relation">
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="lawyer">Lawyer</option>
                <option value="counselor">Counselor</option>
                <option value="ngo">NGO Worker</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button class="btn btn-primary" id="ec-add-btn" style="padding: 10px 20px;">Add</button>
          </div>
        </div>
      </div>

      ${contacts.length === 0 ? `
        <div class="card" style="text-align: center; padding: 32px; color: #9ca3af;">
          <p style="font-size: 0.88rem; margin-bottom: 4px;">No custom contacts yet</p>
          <p style="font-size: 0.75rem;">Add trusted people you can reach in an emergency</p>
        </div>
      ` : `
        <div class="card-grid">
          ${contacts.map((c, i) => {
            const relColor = c.relation === 'lawyer' ? '#6366f1' : c.relation === 'counselor' ? '#8b5cf6' : c.relation === 'ngo' ? '#10b981' : '#374151';
            return `
              <div class="resource-card" style="position: relative;">
                <button style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: #d1d5db; cursor: pointer; font-size: 0.9rem;" onclick="window._deleteContact && window._deleteContact(${i})">✕</button>
                <div class="resource-name">${c.name}</div>
                <span style="font-size: 0.65rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; background: ${relColor}10; color: ${relColor}; text-transform: uppercase;">${c.relation}</span>
                <div style="margin-top: 10px;">
                  <a href="tel:${c.phone}" class="resource-phone">${c.phone}</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    document.getElementById('ec-add-btn')?.addEventListener('click', () => {
      const name = document.getElementById('ec-name')?.value.trim();
      const phone = document.getElementById('ec-phone')?.value.trim();
      const relation = document.getElementById('ec-relation')?.value;
      if (!name || !phone) return alert('Please enter both name and phone number.');
      const contacts = getCustomContacts();
      contacts.push({ name, phone, relation });
      saveCustomContacts(contacts);
      renderTabs();
      renderMyContacts();
    });

    window._deleteContact = (idx) => {
      const contacts = getCustomContacts();
      contacts.splice(idx, 1);
      saveCustomContacts(contacts);
      renderTabs();
      renderMyContacts();
    };
  }

  renderTabs();
  renderSection();
}

function getCustomContacts() {
  try { return JSON.parse(localStorage.getItem('nyaya_emergency') || '[]'); }
  catch { return []; }
}

function saveCustomContacts(contacts) {
  localStorage.setItem('nyaya_emergency', JSON.stringify(contacts));
  window.NyayaState.customEmergency = contacts;
}

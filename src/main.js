/* ═══════════════════════════════════════════════════════════════
   NyayaSahaya — Main Application
   Auth, routing, shared state, emoji-free professional UI
   ═══════════════════════════════════════════════════════════════ */
import './styles/index.css';
import { renderHome } from './pages/home.js';
import { renderChat } from './pages/chat.js';
import { renderAgents } from './pages/agents.js';
import { renderDeployAgents } from './pages/deploy-agents.js';
import { renderRights } from './pages/rights.js';
import { renderLegalAid } from './pages/legal-aid.js';
import { renderDrafts } from './pages/drafts.js';
import { renderMyths } from './pages/myths.js';
import { renderTranslate } from './pages/translate.js';

/* ── Shared global state ──────────────────────────────────── */
window.NyayaState = {
  authenticated: false,
  user: null,
  caseContext: null, // Persists case analysis context for chat
  customEmergency: JSON.parse(localStorage.getItem('nyaya_emergency') || '[]'),
};

const ROUTES = {
  home:           { name: 'Home',             icon: 'H',  render: renderHome,         section: 'main' },
  chat:           { name: 'AI Chat',          icon: 'C',  render: renderChat,         section: 'main' },
  agents:         { name: 'Case Analysis',    icon: 'A',  render: renderAgents,       section: 'main' },
  'deploy-agents':{ name: 'Deploy Agents',    icon: 'D',  render: renderDeployAgents, section: 'main' },
  rights:         { name: 'Know Your Rights', icon: 'R',  render: renderRights,       section: 'resources' },
  'legal-aid':    { name: 'Legal Aid',        icon: 'L',  render: renderLegalAid,     section: 'resources' },
  myths:          { name: 'Myth Buster',      icon: 'M',  render: renderMyths,        section: 'resources' },
  drafts:         { name: 'Draft Generator',  icon: 'G',  render: renderDrafts,       section: 'tools' },
  translate:      { name: 'Translator',       icon: 'T',  render: renderTranslate,    section: 'tools' },
};

let currentPage = 'home';
let sidebarOpen = false;

function buildLayout() {
  const app = document.getElementById('app');

  // Check if authenticated
  if (!window.NyayaState.authenticated && currentPage === 'home') {
    renderAuthGate(app);
    return;
  }

  app.innerHTML = `
    <!-- Mobile Header -->
    <div class="mobile-header">
      <button class="hamburger" id="hamburger-btn">III</button>
      <span class="mobile-brand">NyayaSahaya</span>
    </div>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">NS</div>
        <div class="brand-text">
          <h1>NyayaSahaya</h1>
          <div class="brand-sub">Legal Intelligence Platform</div>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="nav-section-label">Main</div>
        ${['home', 'chat', 'agents', 'deploy-agents'].map(id => navItem(id)).join('')}

        <div class="nav-section-label">Resources</div>
        ${['rights', 'legal-aid', 'myths'].map(id => navItem(id)).join('')}

        <div class="nav-section-label">Tools</div>
        ${['drafts', 'translate'].map(id => navItem(id)).join('')}
      </div>

      <div class="sidebar-emergency">
        ${window.NyayaState.user ? `
          <div style="padding: 8px 14px; margin-bottom: 8px; font-size: 0.72rem; color: #6b7280;">
            Signed in as <strong>${window.NyayaState.user}</strong>
          </div>
        ` : ''}
        <button class="emergency-btn" id="emergency-sidebar-btn">
          Emergency Helplines
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <div id="page-root"></div>
    </main>
  `;

  // Bind nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.page);
      closeSidebar();
    });
  });

  document.getElementById('hamburger-btn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
  document.getElementById('emergency-sidebar-btn').addEventListener('click', () => { navigateTo('legal-aid'); closeSidebar(); });

  renderPage();
}

/* ── Auth Gate ─────────────────────────────────────────────── */
function renderAuthGate(app) {
  app.innerHTML = `
    <div class="auth-gate fade-in">
      <div class="auth-card">
        <div class="brand-icon" style="width: 48px; height: 48px; font-size: 1.1rem; margin: 0 auto 16px;">NS</div>
        <h1 style="font-size: 1.5rem; text-align: center; margin-bottom: 4px;">NyayaSahaya</h1>
        <p style="font-size: 0.78rem; color: #6b7280; text-align: center; margin-bottom: 32px;">Legal Intelligence Platform for Women</p>

        <div id="auth-form">
          <div style="margin-bottom: 12px;">
            <label style="font-size: 0.75rem; font-weight: 600; color: #374151; display: block; margin-bottom: 4px;">Email</label>
            <input class="input" id="auth-email" type="email" placeholder="your@email.com" />
          </div>
          <div style="margin-bottom: 16px;">
            <label style="font-size: 0.75rem; font-weight: 600; color: #374151; display: block; margin-bottom: 4px;">Password</label>
            <input class="input" id="auth-password" type="password" placeholder="Enter password" />
          </div>
          <button class="btn btn-primary" id="auth-login-btn" style="width: 100%; padding: 12px; margin-bottom: 8px;">
            Sign In
          </button>
          <button class="btn btn-secondary" id="auth-signup-btn" style="width: 100%; padding: 12px; margin-bottom: 16px;">
            Create Account
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="flex: 1; height: 1px; background: #e5e7eb;"></div>
          <span style="font-size: 0.68rem; color: #9ca3af;">or</span>
          <div style="flex: 1; height: 1px; background: #e5e7eb;"></div>
        </div>

        <button class="btn" id="auth-anon-btn" style="width: 100%; padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; color: #374151;">
          Continue Anonymously
        </button>
        <p style="font-size: 0.65rem; color: #9ca3af; text-align: center; margin-top: 8px;">
          No data stored. Your privacy is protected.
        </p>

        <div style="margin-top: 24px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; text-align: center;">
          <p style="font-size: 0.72rem; color: #991b1b; margin-bottom: 6px;"><strong>In immediate danger?</strong></p>
          <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
            <a href="tel:112" style="font-size: 0.68rem; padding: 4px 10px; background: white; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; text-decoration: none; font-weight: 600;">Police: 112</a>
            <a href="tel:181" style="font-size: 0.68rem; padding: 4px 10px; background: white; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; text-decoration: none; font-weight: 600;">Women: 181</a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('auth-login-btn').addEventListener('click', () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if (!email || !password) return alert('Please enter email and password.');
    window.NyayaState.authenticated = true;
    window.NyayaState.user = email.split('@')[0];
    localStorage.setItem('nyaya_user', window.NyayaState.user);
    buildLayout();
  });

  document.getElementById('auth-signup-btn').addEventListener('click', () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if (!email || !password) return alert('Please enter email and password.');
    if (password.length < 6) return alert('Password must be at least 6 characters.');
    window.NyayaState.authenticated = true;
    window.NyayaState.user = email.split('@')[0];
    localStorage.setItem('nyaya_user', window.NyayaState.user);
    buildLayout();
  });

  document.getElementById('auth-anon-btn').addEventListener('click', () => {
    window.NyayaState.authenticated = true;
    window.NyayaState.user = null;
    buildLayout();
  });
}

function navItem(id) {
  const route = ROUTES[id];
  const iconLetter = route.icon;
  return `
    <div class="nav-item ${currentPage === id ? 'active' : ''}" data-page="${id}">
      <span class="nav-icon-letter">${iconLetter}</span>
      ${route.name}
    </div>
  `;
}

function navigateTo(page) {
  if (!ROUTES[page]) return;
  currentPage = page;
  window.history.pushState({ page }, '', `#${page}`);
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  renderPage();
}

window.navigateTo = navigateTo;

function renderPage() {
  const root = document.getElementById('page-root');
  if (!root) return;
  const route = ROUTES[currentPage];
  if (route?.render) route.render(root);
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  document.getElementById('sidebar').classList.toggle('open', sidebarOpen);
  document.getElementById('sidebar-overlay').classList.toggle('open', sidebarOpen);
}

function closeSidebar() {
  sidebarOpen = false;
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
}

// Panic button
document.getElementById('panic-btn').addEventListener('click', () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace('https://www.google.com');
});

// Back/forward
window.addEventListener('popstate', (e) => {
  if (e.state?.page) {
    currentPage = e.state.page;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === currentPage);
    });
    renderPage();
  }
});

// Restore session
const savedUser = localStorage.getItem('nyaya_user');
if (savedUser) {
  window.NyayaState.authenticated = true;
  window.NyayaState.user = savedUser;
}

// Init from hash
const hash = window.location.hash.slice(1);
if (ROUTES[hash]) currentPage = hash;
buildLayout();

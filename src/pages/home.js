export function renderHome(root) {
  root.innerHTML = `
    <div class="fade-in" style="min-height: 100vh; display: flex; flex-direction: column;">
      <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px;">
        <div style="max-width: 640px; width: 100%;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div class="hero-badge">Free / Anonymous / No Login Required</div>
            <h1 style="font-size: 2.8rem; font-weight: 900; letter-spacing: -1.5px; line-height: 1.05; margin-bottom: 16px;">
              Know your rights.<br/>
              <span style="color: #9ca3af;">Take your power back.</span>
            </h1>
            <p style="font-size: 0.95rem; color: #6b7280; max-width: 460px; margin: 0 auto 28px; line-height: 1.6;">
              AI-powered legal intelligence platform for women in India. Describe your situation — get rights, steps, and resources in plain language.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="navigateTo('chat')" style="padding: 12px 28px;">Start Chatting</button>
              <button class="btn btn-secondary" onclick="navigateTo('agents')">Analyze My Case</button>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 0.72rem; color: #9ca3af; margin-bottom: 10px;">Common situations:</p>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
              ${['My husband is abusive','Harassed at workplace','Property rights as daughter','Want to file for divorce','Private photos shared online','Dowry demands from in-laws'].map(t => `
                <button class="topic-pill" onclick="navigateTo('chat')">${t}</button>
              `).join('')}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 48px;">
            <div class="feature-card" onclick="navigateTo('chat')" style="text-align: left;">
              <div class="feature-icon-box">C</div>
              <h3 style="font-size: 0.82rem; font-weight: 700; margin-bottom: 3px;">AI Legal Chat</h3>
              <p style="font-size: 0.72rem; color: #6b7280; line-height: 1.5;">Plain-language legal guidance with step-by-step action plans</p>
            </div>
            <div class="feature-card" onclick="navigateTo('agents')" style="text-align: left;">
              <div class="feature-icon-box">A</div>
              <h3 style="font-size: 0.82rem; font-weight: 700; margin-bottom: 3px;">Case Intelligence</h3>
              <p style="font-size: 0.72rem; color: #6b7280; line-height: 1.5;">Upload documents, analyze risk, find precedents</p>
            </div>
            <div class="feature-card" onclick="navigateTo('deploy-agents')" style="text-align: left;">
              <div class="feature-icon-box">D</div>
              <h3 style="font-size: 0.82rem; font-weight: 700; margin-bottom: 3px;">Deploy Agents</h3>
              <p style="font-size: 0.72rem; color: #6b7280; line-height: 1.5;">6 expert AI agents debate your case from every angle</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px;">
            <div class="feature-card" onclick="navigateTo('rights')" style="text-align: left;">
              <div class="feature-icon-box" style="background: #059669;">R</div>
              <h3 style="font-size: 0.78rem; font-weight: 700; margin-bottom: 2px;">Know Rights</h3>
              <p style="font-size: 0.68rem; color: #6b7280;">7 legal domains</p>
            </div>
            <div class="feature-card" onclick="navigateTo('drafts')" style="text-align: left;">
              <div class="feature-icon-box" style="background: #d97706;">G</div>
              <h3 style="font-size: 0.78rem; font-weight: 700; margin-bottom: 2px;">Draft Docs</h3>
              <p style="font-size: 0.68rem; color: #6b7280;">Generate complaints</p>
            </div>
            <div class="feature-card" onclick="navigateTo('translate')" style="text-align: left;">
              <div class="feature-icon-box" style="background: #6366f1;">T</div>
              <h3 style="font-size: 0.78rem; font-weight: 700; margin-bottom: 2px;">Translator</h3>
              <p style="font-size: 0.68rem; color: #6b7280;">12 Indian languages</p>
            </div>
            <div class="feature-card" onclick="navigateTo('myths')" style="text-align: left;">
              <div class="feature-icon-box" style="background: #8b5cf6;">M</div>
              <h3 style="font-size: 0.78rem; font-weight: 700; margin-bottom: 2px;">Myth Buster</h3>
              <p style="font-size: 0.68rem; color: #6b7280;">Legal myths debunked</p>
            </div>
          </div>
        </div>
      </main>

      <div style="padding: 16px 24px; border-top: 1px solid #f3f4f6; text-align: center; background: #fff;">
        <p style="font-size: 0.72rem; color: #9ca3af; margin-bottom: 8px;">In immediate danger?</p>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <a href="tel:112" class="emergency-contact-btn">Police: 112</a>
          <a href="tel:181" class="emergency-contact-btn">Women's Helpline: 181</a>
          <a href="tel:14490" class="emergency-contact-btn">NCW: 14490</a>
          <a href="tel:15100" class="emergency-contact-btn">NALSA: 15100</a>
        </div>
      </div>

      <footer style="padding: 12px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="font-size: 0.68rem; color: #d1d5db;">Powered by Groq / Multi-Agent AI / Privacy First</p>
      </footer>
    </div>
  `;
}

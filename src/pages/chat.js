/* ═══════════════════════════════════════════════════════════════
   Chat Page — Retains case context, emoji-free, SSE streaming
   ═══════════════════════════════════════════════════════════════ */

let messages = [];
let isStreaming = false;
let contextApplied = false;

const STARTERS = [
  { text: 'My husband is being abusive and I don\'t know what to do' },
  { text: 'I\'m being sexually harassed at work by my boss' },
  { text: 'My brothers are denying me my share of family property' },
  { text: 'I want to file for divorce — what are my rights?' },
  { text: 'Someone is sharing my private photos online' },
  { text: 'My in-laws are demanding more dowry and threatening me' },
];

export function renderChat(root) {
  root.innerHTML = `<div class="chat-container" id="chat-container"></div>`;

  // If navigated from insights "Discuss with AI" button, force send context
  if (window.NyayaState?.sendToChat) {
    window.NyayaState.sendToChat = false;
    contextApplied = false;
    messages = [];
  }

  // Apply case context if available and not yet applied
  if (window.NyayaState?.caseContext && !contextApplied && messages.length === 0) {
    contextApplied = true;
    const ctx = window.NyayaState.caseContext;
    messages.push({
      role: 'user',
      content: `I've already analyzed my case. Here's the context:\n\n${ctx}\n\nPlease use this information to help me. What are my legal options?`
    });
    renderChatUI();
    streamResponse();
    return;
  }

  renderChatUI();
}

function renderChatUI() {
  const container = document.getElementById('chat-container');
  if (!container) return;

  if (messages.length === 0) {
    const hasContext = !!window.NyayaState?.caseContext;
    container.innerHTML = `
      <div class="chat-welcome">
        <div style="margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: #111827; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span style="color: white; font-size: 0.9rem; font-weight: 800;">NS</span>
          </div>
          <h2>How can I help you?</h2>
          <p>Describe your situation in your own words. I'll identify your legal rights and guide you step by step.</p>
          ${hasContext ? `
            <div style="margin-top: 12px; padding: 12px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; max-width: 480px;">
              <p style="font-size: 0.75rem; color: #4f46e5; font-weight: 600; margin-bottom: 4px;">Case context available</p>
              <p style="font-size: 0.72rem; color: #6b7280;">Your case analysis data will be used to provide personalized guidance.</p>
              <button class="btn btn-primary" id="use-context-btn" style="margin-top: 8px; font-size: 0.78rem; padding: 8px 16px;">
                Continue with analyzed case
              </button>
            </div>
          ` : ''}
        </div>
        <div class="starter-prompts">
          ${STARTERS.map((s, i) => `
            <button class="starter-btn" data-idx="${i}">${s.text}</button>
          `).join('')}
        </div>
      </div>
      ${chatInputHTML()}
    `;
    container.querySelectorAll('.starter-btn').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(STARTERS[btn.dataset.idx].text));
    });
    document.getElementById('use-context-btn')?.addEventListener('click', () => {
      contextApplied = true;
      const ctx = window.NyayaState.caseContext;
      sendMessage(`I've already analyzed my case. Here's the situation:\n\n${ctx}\n\nBased on this, what are my legal options and what should I do first?`);
    });
  } else {
    container.innerHTML = `
      <div class="chat-messages" id="chat-messages">
        ${messages.map(m => renderMessage(m)).join('')}
        ${isStreaming ? '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>' : ''}
      </div>
      ${chatInputHTML()}
    `;
    const msgContainer = document.getElementById('chat-messages');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

    document.getElementById('new-chat-btn')?.addEventListener('click', () => {
      messages = [];
      contextApplied = false;
      renderChatUI();
    });
  }

  bindInput();
}

function chatInputHTML() {
  return `
    <div class="chat-input-area">
      <div class="chat-input-wrap">
        <input type="text" class="chat-input" id="chat-input" placeholder="Describe your situation..." ${isStreaming ? 'disabled' : ''} />
        <button class="chat-send-btn" id="chat-send" ${isStreaming ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
        </button>
      </div>
      ${messages.length > 0 ? `<div style="text-align: center; margin-top: 6px;"><button style="background: none; border: none; color: #d1d5db; font-size: 0.68rem; cursor: pointer; font-family: inherit;" id="new-chat-btn">New conversation</button></div>` : ''}
    </div>
  `;
}

function bindInput() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
      e.preventDefault();
      sendMessage(input.value.trim());
    }
  });
  sendBtn?.addEventListener('click', () => {
    if (!isStreaming) sendMessage(document.getElementById('chat-input')?.value.trim());
  });
  input?.focus();
}

function renderMessage(msg) {
  if (msg.role === 'user') {
    return `<div class="message user">${escapeHtml(msg.content)}</div>`;
  }
  let emergencyHtml = '';
  if (msg.emergency) {
    emergencyHtml = `
      <div class="emergency-banner">
        <h3>Your safety comes first</h3>
        <div class="emergency-contacts">
          ${msg.emergency.contacts.map(c => `<a href="tel:${c.number}" class="emergency-contact-btn">${c.name}: ${c.number}</a>`).join('')}
        </div>
      </div>
    `;
  }
  return `<div class="message assistant">${emergencyHtml}<div class="msg-content">${renderMarkdown(msg.content)}</div></div>`;
}

async function streamResponse() {
  const assistantMsg = { role: 'assistant', content: '', emergency: null };
  messages.push(assistantMsg);
  isStreaming = true;
  renderChatUI();

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })) }),
    });

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
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'emergency') assistantMsg.emergency = data.data;
          else if (data.type === 'token') { assistantMsg.content += data.data; updateLastMessage(assistantMsg); }
          else if (data.type === 'error') { assistantMsg.content += `\n\nError: ${data.data}`; updateLastMessage(assistantMsg); }
        } catch (e) {}
      }
    }
  } catch (err) {
    assistantMsg.content = `Connection error: ${err.message}. Check that the server is running.`;
    updateLastMessage(assistantMsg);
  }

  isStreaming = false;
  renderChatUI();
}

async function sendMessage(text) {
  if (!text || isStreaming) return;
  messages.push({ role: 'user', content: text });
  await streamResponse();
}

function updateLastMessage(msg) {
  const msgContainer = document.getElementById('chat-messages');
  if (!msgContainer) return;
  const allMsgs = msgContainer.querySelectorAll('.message');
  const lastMsg = allMsgs[allMsgs.length - 1];
  if (lastMsg?.classList.contains('assistant')) {
    let emergencyHtml = '';
    if (msg.emergency) {
      emergencyHtml = `<div class="emergency-banner"><h3>Your safety comes first</h3><div class="emergency-contacts">${msg.emergency.contacts.map(c => `<a href="tel:${c.number}" class="emergency-contact-btn">${c.name}: ${c.number}</a>`).join('')}</div></div>`;
    }
    lastMsg.innerHTML = `${emergencyHtml}<div class="msg-content">${renderMarkdown(msg.content)}</div>`;
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
}

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)/, '<p>$1')
    .replace(/(.+)$/, '$1</p>');
}

function escapeHtml(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

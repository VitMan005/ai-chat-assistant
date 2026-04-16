const STORAGE_KEY = 'openrouter_api_key';
const MODEL_KEY = 'openrouter_model';

const setupScreen = document.getElementById('setup-screen');
const chatScreen = document.getElementById('chat-screen');
const apiKeyInput = document.getElementById('api-key-input');
const startBtn = document.getElementById('start-btn');
const keyError = document.getElementById('key-error');
const modelSelect = document.getElementById('model-select');
const modelBadge = document.getElementById('model-badge');
const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const backBtn = document.getElementById('back-btn');
const clearBtn = document.getElementById('clear-btn');

let messages = []; // conversation history
let isLoading = false;

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  const savedModel = localStorage.getItem(MODEL_KEY);
  if (savedModel) modelSelect.value = savedModel;
  if (savedKey) {
    enterChat(savedKey);
  }
}

// ── Setup screen ──────────────────────────────────────────────────────────────
startBtn.addEventListener('click', handleStart);
apiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleStart();
});

async function handleStart() {
  const key = apiKeyInput.value.trim();
  keyError.textContent = '';
  if (!key) {
    keyError.textContent = 'Please enter your API key.';
    return;
  }
  startBtn.disabled = true;
  startBtn.textContent = 'Checking...';
  const valid = await validateKey(key);
  startBtn.disabled = false;
  startBtn.textContent = 'Start Chatting →';
  if (!valid) {
    keyError.textContent = 'Invalid API key. Please check and try again.';
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  localStorage.setItem(MODEL_KEY, modelSelect.value);
  enterChat(key);
}

async function validateKey(key) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Chat screen ───────────────────────────────────────────────────────────────
function enterChat(key) {
  window._apiKey = key;
  modelBadge.textContent = modelSelect.value;
  setupScreen.classList.remove('active');
  chatScreen.classList.add('active');
  messages = [];
  renderWelcome();
}

backBtn.addEventListener('click', () => {
  chatScreen.classList.remove('active');
  setupScreen.classList.add('active');
});

clearBtn.addEventListener('click', () => {
  messages = [];
  messagesEl.innerHTML = '';
  renderWelcome();
});

function renderWelcome() {
  messagesEl.innerHTML = '';
  addBubble('assistant', 'Hey! I\'m your AI assistant. How can I help you today?');
}

// ── Messaging ─────────────────────────────────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  userInput.value = '';
  userInput.style.height = 'auto';
  isLoading = true;
  sendBtn.disabled = true;

  messages.push({ role: 'user', content: text });
  addBubble('user', text);

  const loadingBubble = addBubble('assistant', 'Thinking…', true);

  try {
    const reply = await callOpenRouter();
    loadingBubble.classList.remove('loading');
    loadingBubble.textContent = reply;
    messages.push({ role: 'assistant', content: reply });
  } catch (err) {
    loadingBubble.classList.remove('loading');
    loadingBubble.textContent = '⚠️ Error: ' + err.message;
  }

  isLoading = false;
  sendBtn.disabled = false;
  scrollToBottom();
}

async function callOpenRouter() {
  const model = localStorage.getItem(MODEL_KEY) || 'openai/gpt-4o-mini';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${window._apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'AI Chat Assistant'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function addBubble(role, text, loading = false) {
  const msgEl = document.createElement('div');
  msgEl.className = `message ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (loading ? ' loading' : '');
  bubble.textContent = text;
  msgEl.appendChild(bubble);
  messagesEl.appendChild(msgEl);
  scrollToBottom();
  return bubble;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

init();

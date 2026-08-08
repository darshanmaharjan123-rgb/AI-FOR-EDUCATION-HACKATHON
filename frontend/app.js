/* ============================================================
   Outdoor Learning — app.js (v2.0)
   Multi-page SPA, Gemini AI, Learning Games, Profile, Analytics
   ============================================================ */

'use strict';

// ── GEMINI API CONFIGURATION ───────────────────────────────
// Built-in Gemini API key (or customize in Profile Settings)
const GEMINI_API_KEY = 'AIzaSyD-bPPLaCPbYFPU4T3t-9BgIu-6Hm6z9v4';
const GEMINI_MODEL   = 'gemini-2.0-flash';

function getGeminiApiKey() {
  const storedKey = Store.get('gemini_api_key');
  if (storedKey && storedKey.trim()) return storedKey.trim();
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') return GEMINI_API_KEY;
  return '';
}

// ── APP STATE ──────────────────────────────────────────────
const AppState = {
  currentPage: 'home',
  currentUser: null,
  chatHistory: [],
  lastAIMessage: "Hello! I'm Outdoor Learning powered by Gemini. How can I help you learn today?",
  gameScores: [],
  activeGame: null,
  get isLoggedIn() { return !!this.currentUser; }
};

// ── LOCAL STORAGE HELPERS ──────────────────────────────────
const Store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(`clarity_${key}`)); } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem(`clarity_${key}`, JSON.stringify(val)); } catch {}
  },
  remove(key) { localStorage.removeItem(`clarity_${key}`); }
};

// ── DOM READY ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAppData();
  initRouter();
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initVoiceOrb();
  initWaveformBars();
  initChatDemo();
  initAuthForms();
  initAccessibilityToggle();
  initCounterAnimations();
  initProfile();
  initAvatarPicker();
  updateAuthUI();
  refreshAnalytics();
  refreshGameCards();
  initGeminiStatus();
  initDarkMode();
});

// ═══════════════════════════════════════════════════════════
//  ROUTER
// ═══════════════════════════════════════════════════════════
function initRouter() {
  // Load from hash on startup
  const hash = window.location.hash.replace('#page-', '').replace('#', '');
  const validPages = ['home', 'dashboard', 'games', 'profile'];
  if (validPages.includes(hash)) {
    navigateTo(hash, true);
  } else {
    navigateTo('home', true);
  }

  window.addEventListener('popstate', () => {
    const h = window.location.hash.replace('#page-', '').replace('#', '');
    if (validPages.includes(h)) navigateTo(h, true);
  });
}

window.navigateTo = function(page, skipHistory = false) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => {
    p.classList.remove('active');
    p.classList.add('fade-out');
  });

  const target = document.getElementById(`page-${page}`);
  if (!target) return;

  setTimeout(() => {
    pages.forEach(p => p.classList.remove('fade-out'));
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 200);

  AppState.currentPage = page;
  if (!skipHistory) {
    window.history.pushState({}, '', `#page-${page}`);
  }

  // Update nav active state
  document.querySelectorAll('.page-nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.id === `nav-${page}`) link.classList.add('active');
  });

  // Page-specific init
  if (page === 'dashboard') {
    refreshAnalytics();
    setTimeout(initWeeklyChart, 100);
    setTimeout(() => {
      document.querySelectorAll('.progress-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') || '0%';
      });
    }, 300);
  }
  if (page === 'profile') {
    loadProfilePage();
    refreshAchievements();
  }
  if (page === 'games') {
    refreshGameCards();
    refreshGameHistory();
  }
};

window.navigateToSection = function(sectionId) {
  if (AppState.currentPage !== 'home') {
    navigateTo('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  } else {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// ═══════════════════════════════════════════════════════════
//  NAVBAR
// ═══════════════════════════════════════════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Smooth scroll for anchor links on home page
  document.querySelectorAll('a[href^="#"]:not([onclick])').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target && AppState.currentPage === 'home') {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  MOBILE NAV
// ═══════════════════════════════════════════════════════════
function initMobileNav() {
  const btn   = document.getElementById('hamburger-btn');
  const nav   = document.getElementById('mobile-nav');
  const close = document.getElementById('mobile-nav-close');

  function openNav() {
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  window.closeMobileNav = function () {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', openNav);
  close.addEventListener('click', closeMobileNav);
  nav.addEventListener('click', e => { if (e.target === nav) closeMobileNav(); });
}

// ═══════════════════════════════════════════════════════════
//  AUTH UI
// ═══════════════════════════════════════════════════════════
function updateAuthUI() {
  const user = AppState.currentUser;
  const navAuthOut  = document.getElementById('nav-auth-out');
  const navAuthIn   = document.getElementById('nav-auth-in');
  const mobileAuthOut = document.getElementById('mobile-auth-out');
  const mobileAuthIn  = document.getElementById('mobile-auth-in');
  const navAvatar   = document.getElementById('nav-avatar');
  const navUsername = document.getElementById('nav-username');

  if (user) {
    if (navAuthOut)   navAuthOut.style.display  = 'none';
    if (navAuthIn)    navAuthIn.style.display   = 'flex';
    if (mobileAuthOut) mobileAuthOut.style.display = 'none';
    if (mobileAuthIn)  mobileAuthIn.style.display  = 'block';
    if (navAvatar)    navAvatar.textContent = user.avatar || '🧑';
    if (navUsername)  navUsername.textContent = user.name?.split(' ')[0] || 'User';
  } else {
    if (navAuthOut)   navAuthOut.style.display  = 'list-item';
    if (navAuthIn)    navAuthIn.style.display   = 'none';
    if (mobileAuthOut) mobileAuthOut.style.display = 'block';
    if (mobileAuthIn)  mobileAuthIn.style.display  = 'none';
  }
}

// ═══════════════════════════════════════════════════════════
//  AUTH FORMS
// ═══════════════════════════════════════════════════════════
function initAuthForms() {
  const signupForm = document.getElementById('signup-form');
  const signinForm = document.getElementById('signin-form');

  signupForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass  = document.getElementById('signup-password').value;
    const role  = document.getElementById('signup-role').value;

    if (!name || !email || !pass || !role) {
      showToast('⚠️ Please fill in all fields', 'warn'); return;
    }
    if (pass.length < 8) {
      showToast('⚠️ Password must be at least 8 characters', 'warn'); return;
    }

    const user = {
      name, email, role,
      avatar: '🧑',
      bio: '',
      subjects: ['math'],
      joinedAt: new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
      preferences: { rate: 1, pitch: 1, screenReader: true }
    };

    // Check if user exists
    const existing = Store.get('users') || {};
    if (existing[email]) {
      showToast('⚠️ Account already exists. Please sign in.', 'warn'); return;
    }
    existing[email] = { ...user, password: pass };
    Store.set('users', existing);

    AppState.currentUser = user;
    Store.set('currentUser', user);
    updateAuthUI();
    showToast(`🎉 Welcome to Outdoor Learning, ${name}!`, 'success');
    signupForm.reset();
    setTimeout(() => navigateTo('dashboard'), 1500);
  });

  signinForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const pass  = document.getElementById('signin-password').value;

    if (!email || !pass) {
      showToast('⚠️ Please enter your email and password', 'warn'); return;
    }

    const users = Store.get('users') || {};
    const user  = users[email];

    if (!user || user.password !== pass) {
      showToast('❌ Invalid email or password', 'error'); return;
    }

    const { password: _, ...userData } = user;
    AppState.currentUser = userData;
    Store.set('currentUser', userData);
    updateAuthUI();
    showToast(`🚀 Welcome back, ${userData.name?.split(' ')[0]}!`, 'success');
    setTimeout(() => navigateTo('dashboard'), 1000);
  });

  document.getElementById('google-signin-btn')?.addEventListener('click', () =>
    showToast('🔵 Google OAuth — connect your backend to enable!', 'info'));

  document.getElementById('github-signin-btn')?.addEventListener('click', () =>
    showToast('⚫ GitHub OAuth — connect your backend to enable!', 'info'));

  document.getElementById('voice-login-btn')?.addEventListener('click', () => {
    showToast('🎙️ Voice authentication — say your passphrase...', 'info');
    setTimeout(() => {
      demoLoginUser();
      showToast('✅ Voice verified! Welcome back!', 'success');
    }, 2500);
  });
}

function demoLoginUser() {
  const demo = {
    name: 'Demo User', email: 'demo@outdoorlearning.com', role: 'student',
    avatar: '🧑‍💻', bio: 'Learning with Outdoor Learning!', subjects: ['math','science'],
    joinedAt: new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
    preferences: { rate: 1, pitch: 1, screenReader: true }
  };
  AppState.currentUser = demo;
  Store.set('currentUser', demo);
  updateAuthUI();
}

function loadAppData() {
  const savedUser = Store.get('currentUser');
  if (savedUser) {
    AppState.currentUser = savedUser;
  }
  AppState.gameScores = Store.get('gameScores') || [];
}

window.logoutUser = function() {
  AppState.currentUser = null;
  Store.remove('currentUser');
  updateAuthUI();
  navigateTo('home');
  showToast('👋 Signed out. See you soon!', 'info');
};

window.confirmResetData = function() {
  if (confirm('Are you sure? This will erase all your game scores and learning data.')) {
    AppState.gameScores = [];
    Store.remove('gameScores');
    refreshAnalytics();
    refreshGameCards();
    showToast('🗑️ Learning data reset.', 'warn');
  }
};

// ═══════════════════════════════════════════════════════════
//  GEMINI AI CHAT
// ═══════════════════════════════════════════════════════════
function initGeminiStatus() {
  const dot = document.getElementById('ai-status-dot');
  if (!dot) return;
  const apiKey = getGeminiApiKey();
  const hasKey = !!apiKey;
  dot.style.background = hasKey ? '#4ECDC4' : '#FFB300';
  dot.title = hasKey ? 'Gemini AI Connected (Live)' : 'Smart AI Tutor (Add key in Profile for live Gemini)';
}

// ═══════════════════════════════════════════════════════════
//  DARK MODE
// ═══════════════════════════════════════════════════════════
function initDarkMode() {
  const btn = document.getElementById('dark-mode-toggle');
  const icon = document.getElementById('dm-icon');
  if (!btn) return;

  // Restore saved preference (or detect OS preference)
  const saved = localStorage.getItem('outdoor-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  applyTheme(isDark);

  btn.addEventListener('click', () => {
    const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!currentlyDark);
    localStorage.setItem('outdoor-theme', !currentlyDark ? 'dark' : 'light');
  });

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (icon) icon.textContent = dark ? '☀️' : '🌙';
    btn.title = dark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

async function callGeminiAPI(userMessage) {
  const apiKey = getGeminiApiKey();
  const hasKey = !!apiKey;

  if (!hasKey) {
    return generateSmartFallback(userMessage);
  }

  const systemPrompt = `You are Outdoor Learning, a voice-first AI tutor designed for accessibility and inclusive education.
Your mission is to make learning accessible to everyone, including visually impaired students.
- Give clear, structured, educational explanations.
- Use the Socratic method to guide understanding.
- For math/science, break down problems step by step.
- For diagrams or charts described by the user, provide vivid spatial audio descriptions.
- Keep responses focused, educational, and encouraging.
- Format answers with clear sections when appropriate.
- Never refuse an educational question.`;

  const messages = [
    { role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] },
    ...AppState.chatHistory.slice(-6).map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }))
  ];

  messages.push({ role: 'user', parts: [{ text: userMessage }] });

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.9
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API HTTP ${response.status}. Falling back to Smart AI Tutor engine.`);
      return generateSmartFallback(userMessage);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) return reply;
    return generateSmartFallback(userMessage);
  } catch (err) {
    console.warn('Gemini API call failed, using smart fallback engine:', err);
    return generateSmartFallback(userMessage);
  }
}

function generateSmartFallback(input) {
  const q = input.trim().toLowerCase();

  // 1. Direct Arithmetic & Math evaluation (e.g., "2+2=?", "10 * 5", "what is 15 + 35", "100 / 4")
  const exprCandidate = q
    .replace(/[\=\?]/g, '')
    .replace(/what\s+is|calculate|solve|how\s+much\s+is|evaluate/gi, '')
    .trim();

  if (/^[\d\s\+\-\*\/\%\^\.\(\)]+$/.test(exprCandidate) && /\d/.test(exprCandidate)) {
    try {
      const sanitized = exprCandidate.replace(/\^/g, '**');
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return `🔢 **Math Solution:**\n\n**Expression:** \`${exprCandidate}\`  \n**Result:** **${result}**\n\nNeed a step-by-step breakdown or another calculation? Just ask!`;
      }
    } catch (e) {}
  }

  // 2. Specific Science & General Questions
  if (/\bphotosynthesis\b/.test(q)) {
    return `🌿 **Photosynthesis Explanation:**\n\nPhotosynthesis is the biological process where green plants, algae, and cyanobacteria convert light energy (usually from the Sun) into chemical energy (glucose).\n\n**Chemical Equation:**\n\`6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\`\n\n**Key Steps:**\n1. **Light Reactions:** Chlorophyll in chloroplasts absorbs light and splits water molecules, releasing oxygen.\n2. **Calvin Cycle (Dark Reactions):** Carbon dioxide is converted into glucose for cellular energy.`;
  }
  if (/\bdna\b/.test(q)) {
    return `🧬 **DNA (Deoxyribonucleic Acid):**\n\nDNA is the hereditary material in humans and almost all other organisms.\n\n**Key Characteristics:**\n• **Double Helix Structure:** Discovered by Watson, Crick, and Franklin in 1953.\n• **Base Pairs:** Adenine (A) pairs with Thymine (T), Cytosine (C) pairs with Guanine (G).\n• **Function:** Stores genetic instructions required for building and maintaining living organisms.`;
  }
  if (/\bgravity\b/.test(q)) {
    return `🍏 **Gravity Explanation:**\n\nGravity is one of the four fundamental forces of nature. It pulls objects with mass toward each other.\n\n**Key Formulas & Values:**\n• **Acceleration due to gravity on Earth (g):** ~9.81 m/s²\n• **Newton's Law of Universal Gravitation:** \`F = G * (m1 * m2) / r²\`\n• **Einstein's General Relativity:** Describes gravity not as a force, but as the curvature of spacetime caused by mass and energy.`;
  }

  // 3. General Math Topic Detection
  if (/\b(math|algebra|equation|calculus|geometry|fraction|derivative|integral|sum|factor|prime|triangle|quadratic|polynomial|matrix|vector|add|subtract|multiply|divide|square|root)\b/.test(q)) {
    return `📐 **Mathematics Breakdown:**\n\nTo solve mathematical problems accurately:\n1. **Identify Given Data:** List all variables and known values.\n2. **Select Formula/Theorem:** Choose the appropriate relationship or equation.\n3. **Calculate Step-by-Step:** Perform operations carefully.\n\nProvide the exact math equation or numbers and I will solve it for you!`;
  }

  // 4. Science / Biology Topic Detection
  if (/\b(biology|cell|photosynthesis|dna|gene|evolution|ecosystem|atom|molecule|chemical|physics|force|energy|gravity|wave|light|electricity|organ|tissue|protein|enzyme)\b/.test(q)) {
    return `🔬 **Scientific Explanation:**\n\nScience helps us systematically understand how the universe works.\n\n• **Observation & Hypothesis:** Formulating testable questions.\n• **Experimental Evidence:** Collecting data to confirm physical laws.\n• **Core Principle:** Matter and energy are conserved in all chemical and physical reactions.\n\nAsk me about any specific experiment, equation, or organism!`;
  }

  // 5. History Topic Detection
  if (/\b(history|war|revolution|empire|civilization|ancient|medieval|century|president|king|queen|battle|treaty|independence|colonial|industrial)\b/.test(q)) {
    return `🌍 **Historical Perspective:**\n\nUnderstanding historical events requires examining:\n- **Causes:** Political, economic, and social catalysts.\n- **Key Figures:** Leaders, visionaries, and impacted communities.\n- **Legacy:** How the outcome shapes our modern world.\n\nName a specific war, historical figure, or era you want to explore!`;
  }

  // 6. Literature & Language Topic Detection
  if (/\b(literature|poem|novel|character|theme|metaphor|symbolism|author|shakespeare|story|essay|grammar|writing|sentence|vocabulary)\b/.test(q)) {
    return `📖 **Literary & Language Analysis:**\n\nWhen analyzing literary works:\n- **Theme:** What overarching message is the author conveying?\n- **Literary Devices:** Look for metaphors, allegories, and symbolism.\n- **Tone & Voice:** Notice how language shapes mood and emotional impact.`;
  }

  // 7. Visual Chart / Diagram Description
  if (/\b(chart|graph|diagram|describe|explain|show|picture|image|visual|bar|pie|plot|figure)\b/.test(q)) {
    return `📊 **Visual-to-Audio Description Assistant:**\n\nI can create detailed spatial audio descriptions of visual content!\n- Tell me the type of visual (bar chart, pie chart, diagram, equation...)\n- What data or information does it show?\n- What are the labels, axes, or key elements?\n\n**I'll then provide:**\n✅ A complete spatial audio description\n✅ Key trends and patterns highlighted\n✅ What the visual means in context\n✅ Follow-up explanations of any concepts shown\n\nDescribe what you see and I'll paint the picture with words!`;
  }

  // General/Default
  const general = [
    `That's a great question! As your AI tutor, I'm here to help you understand this thoroughly.\n\n**Learning Approach:**\nLet's build understanding from the ground up:\n1. **Foundation** — What do you already know about this topic?\n2. **Core Concept** — The essential idea explained simply\n3. **Details** — Diving deeper with examples\n4. **Application** — How you can use this knowledge\n\nCould you give me a bit more context about what specifically you'd like to learn? The more specific your question, the more targeted and helpful my explanation can be!`,
    `Excellent question! Education is most powerful when it connects new ideas to existing knowledge.\n\n**Thinking About It:**\nEvery complex topic becomes manageable when broken into smaller pieces:\n\n• **Start with WHY** — Understanding purpose makes the WHAT easier to remember\n• **Connect to real life** — Abstract concepts become concrete with examples\n• **Ask follow-up questions** — Curiosity is the engine of learning\n\nTell me more specifically what you're trying to understand, and I'll guide you through it step by step with clear, accessible explanations!`
  ];
  return general[Math.floor(Math.random() * general.length)];
}

function initChatDemo() {
  const micBtn   = document.getElementById('chat-mic-btn');
  const sendBtn  = document.getElementById('chat-send-btn');
  const input    = document.getElementById('chat-input');
  const speakBtn = document.getElementById('demo-speak-btn');
  const statusTxt = document.getElementById('voice-status-text');
  const statusSub = document.getElementById('voice-status-sub');

  if (!sendBtn) return;

  let isRecording = false;

  async function sendMessage(text) {
    if (!text.trim()) return;
    addChatMessage(text, 'user');
    AppState.chatHistory.push({ role: 'user', text });
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'msg ai';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="msg-avatar ai-avatar" aria-hidden="true">🤖</div>
      <div class="msg-bubble ai-bubble" aria-label="Gemini is thinking">
        <span style="display:flex;gap:6px;align-items:center;padding:4px 0">
          <span class="typing-dot" style="animation-delay:0s"></span>
          <span class="typing-dot" style="animation-delay:0.15s"></span>
          <span class="typing-dot" style="animation-delay:0.3s"></span>
          <span style="font-size:0.78rem;color:#8B5E40;margin-left:4px">Gemini is thinking...</span>
        </span>
      </div>`;
    const msgs = document.getElementById('chat-messages');
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const response = await callGeminiAPI(text);
      typing.remove();
      addChatMessage(response, 'ai');
      AppState.chatHistory.push({ role: 'ai', text: response });
      AppState.lastAIMessage = response;

      // Log activity
      addActivity('🤖', `Asked AI: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`);

      // Auto speak
      if (window.speechSynthesis) speakText(response);
    } catch (err) {
      typing.remove();
      const errMsg = `I'm having trouble connecting to Gemini AI right now. ${err.message.includes('API key') ? 'Please check your API key configuration.' : 'Please try again in a moment!'}\n\nIn the meantime, try rephrasing your question — I'll do my best to help!`;
      addChatMessage(errMsg, 'ai');
      showToast('⚠️ Gemini connection issue — check API key', 'warn');
    }

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  function addChatMessage(text, role) {
    const msgs = document.getElementById('chat-messages');
    if (!msgs) return;
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;
    const avatar = document.createElement('div');
    avatar.className = `msg-avatar ${role}-avatar`;
    avatar.textContent = role === 'ai' ? '🤖' : (AppState.currentUser?.avatar || '👤');
    avatar.setAttribute('aria-hidden', 'true');
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${role}-bubble`;
    bubble.setAttribute('role', 'article');
    // Convert markdown-ish to HTML
    bubble.innerHTML = formatChatText(text);
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function formatChatText(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p style="margin-top:8px">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); } });

  // Mic button (simulated voice with Web Speech API if available)
  micBtn?.addEventListener('click', () => {
    isRecording = !isRecording;
    micBtn.classList.toggle('recording', isRecording);
    micBtn.setAttribute('aria-label', isRecording ? 'Stop recording' : 'Start voice recording');

    if (statusTxt) statusTxt.textContent = isRecording ? 'Listening...' : 'Ready to Listen';
    if (statusSub) statusSub.textContent = isRecording ? 'Speak your question clearly' : 'Click the microphone to begin';

    if (isRecording) {
      showToast('🎤 Microphone active — speak now!', 'info');

      // Try real Web Speech API
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (input) input.value = transcript;
          isRecording = false;
          micBtn.classList.remove('recording');
          if (statusTxt) statusTxt.textContent = 'Ready to Listen';
          if (statusSub) statusSub.textContent = 'Click the microphone to begin';
          sendMessage(transcript);
        };
        recognition.onerror = () => {
          isRecording = false;
          micBtn.classList.remove('recording');
          if (statusTxt) statusTxt.textContent = 'Ready to Listen';
          showToast('⚠️ Voice recognition not available in this browser', 'warn');
        };
        recognition.start();
      } else {
        // Fallback: simulated
        setTimeout(() => {
          if (!isRecording) return;
          isRecording = false;
          micBtn.classList.remove('recording');
          if (statusTxt) statusTxt.textContent = 'Processing...';
          const simQ = [
            'Can you explain what a quadratic equation is?',
            'Describe the process of photosynthesis step by step.',
            'What caused World War 1?',
            'How does DNA replication work?',
          ];
          const q = simQ[Math.floor(Math.random() * simQ.length)];
          setTimeout(() => {
            if (statusTxt) statusTxt.textContent = 'Ready to Listen';
            if (statusSub) statusSub.textContent = 'Click the microphone to begin';
            sendMessage(q);
          }, 600);
        }, 3500);
      }
    }
  });

  // Speak last response
  speakBtn?.addEventListener('click', () => {
    if (window.speechSynthesis) {
      speakText(AppState.lastAIMessage);
      showToast('🔊 Playing audio response...', 'info');
    } else {
      showToast('⚠️ Text-to-speech not supported in this browser', 'warn');
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  TEXT TO SPEECH
// ═══════════════════════════════════════════════════════════
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
  const rateSlider   = document.getElementById('speech-rate-slider');
  const pitchSlider  = document.getElementById('speech-pitch-slider');
  const volumeSlider = document.getElementById('speech-volume-slider');

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate   = rateSlider   ? parseFloat(rateSlider.value)   : 1;
  utterance.pitch  = pitchSlider  ? parseFloat(pitchSlider.value)  : 1;
  utterance.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.9;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || voices[0];
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  window.speechSynthesis.getVoices();
}

// ═══════════════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════════════
function refreshAnalytics() {
  const scores = AppState.gameScores;

  // Metrics
  const gamesPlayed = scores.length;
  const avgScore = gamesPlayed ? Math.round(scores.reduce((a, b) => a + b.score, 0) / gamesPlayed) : null;
  const hoursEst = (scores.reduce((a, b) => a + (b.duration || 5), 0) / 60).toFixed(1);
  const streak = calculateStreak();

  const mh = document.getElementById('metric-hours');
  if (mh) mh.innerHTML = `${hoursEst}<span style="font-size:1.2rem">h</span>`;

  const ms = document.getElementById('metric-score');
  if (ms) ms.textContent = avgScore !== null ? `${avgScore}%` : '–';

  const mg = document.getElementById('metric-games');
  if (mg) mg.textContent = gamesPlayed;

  const mst = document.getElementById('metric-streak');
  if (mst) mst.textContent = streak;

  const mhtxt = document.getElementById('metric-hours-trend');
  if (mhtxt) mhtxt.textContent = gamesPlayed > 0 ? '↑ Keep going!' : 'Start learning!';

  const mstxt = document.getElementById('metric-score-trend');
  if (mstxt) mstxt.textContent = avgScore !== null ? (avgScore >= 80 ? '🏆 Excellent!' : avgScore >= 60 ? '📈 Good progress!' : '📚 Keep practicing!') : 'Play a game to start';

  const mgtxt = document.getElementById('metric-games-trend');
  if (mgtxt) mgtxt.textContent = gamesPlayed >= 5 ? '🌟 Level up!' : `${5 - gamesPlayed} more to badge!`;

  const msttxt = document.getElementById('metric-streak-trend');
  if (msttxt) msttxt.textContent = streak >= 7 ? '🏆 Amazing streak!' : streak > 0 ? '🔥 Keep it up!' : 'Come back daily!';

  // Donut center
  const dc = document.getElementById('donut-center-num');
  if (dc) dc.textContent = gamesPlayed || '–';

  // Subject breakdown
  const subjects = { math: 0, science: 0, history: 0, general: 0 };
  scores.forEach(s => { if (subjects.hasOwnProperty(s.subject)) subjects[s.subject]++; });
  const total = Object.values(subjects).reduce((a, b) => a + b, 0) || 1;

  const pct = key => total > 0 ? `${Math.round(subjects[key] / total * 100)}%` : '–';
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl('legend-math', pct('math'));
  setEl('legend-science', pct('science'));
  setEl('legend-history', pct('history'));
  setEl('legend-general', pct('general'));

  // Progress bars — per subject avg score
  const subjectScores = { math: [], science: [], history: [], general: [] };
  scores.forEach(s => { if (subjectScores[s.subject]) subjectScores[s.subject].push(s.score); });

  const avgOrDash = arr => arr.length ? `${Math.round(arr.reduce((a,b)=>a+b,0)/arr.length)}%` : '–';
  const widthOrZero = arr => arr.length ? `${Math.round(arr.reduce((a,b)=>a+b,0)/arr.length)}%` : '0%';

  const pbars = [
    { labelId: 'prog-algebra',  barId: 'pbar-algebra',  subject: 'math' },
    { labelId: 'prog-bio',      barId: 'pbar-bio',      subject: 'science' },
    { labelId: 'prog-history',  barId: 'pbar-history',  subject: 'history' },
    { labelId: 'prog-lit',      barId: 'pbar-lit',      subject: 'general' },
  ];
  pbars.forEach(({ labelId, barId, subject }) => {
    const arr = subjectScores[subject];
    const labelEl = document.getElementById(labelId);
    const barEl   = document.getElementById(barId);
    if (labelEl) labelEl.textContent = avgOrDash(arr);
    if (barEl)   barEl.style.width   = widthOrZero(arr);
  });
}

function calculateStreak() {
  if (!AppState.gameScores.length) return 0;
  const dates = [...new Set(AppState.gameScores.map(s => s.date?.split('T')[0]))].sort().reverse();
  if (!dates[0]) return 0;
  let streak = 0;
  let expected = new Date();
  expected.setHours(0,0,0,0);
  for (const d of dates) {
    const dateObj = new Date(d);
    if (dateObj.toDateString() === expected.toDateString()) {
      streak++;
      expected.setDate(expected.getDate() - 1);
    } else break;
  }
  return streak;
}

function initWeeklyChart() {
  const chart = document.getElementById('weekly-chart');
  if (!chart) return;
  chart.innerHTML = '';

  const scores = AppState.gameScores.slice(-7);
  if (scores.length === 0) {
    chart.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:140px;color:#8B5E40;font-size:0.88rem">Play games to see your chart!</div>';
    return;
  }

  scores.forEach((s, i) => {
    const group = document.createElement('div');
    group.className = 'bar-group';
    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'display:flex;gap:3px;align-items:flex-end;width:100%;height:140px';

    const b1 = document.createElement('div');
    b1.className = 'bar bar-orange';
    b1.style.cssText = `width:50%;height:0%;transition:height 1.2s ${i * 0.1}s cubic-bezier(0.34,1.56,0.64,1)`;
    b1.setAttribute('title', `${s.gameName}: ${s.score}%`);

    const b2 = document.createElement('div');
    b2.className = 'bar bar-green';
    b2.style.cssText = `width:50%;height:0%;transition:height 1.2s ${i * 0.1 + 0.05}s cubic-bezier(0.34,1.56,0.64,1)`;
    b2.setAttribute('title', `Accuracy: ${s.accuracy || s.score}%`);

    barWrap.appendChild(b1);
    barWrap.appendChild(b2);

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = s.gameName?.substring(0, 4) || 'Game';

    group.appendChild(barWrap);
    group.appendChild(label);
    chart.appendChild(group);

    setTimeout(() => {
      b1.style.height = `${s.score}%`;
      b2.style.height = `${s.accuracy || s.score}%`;
    }, 100);
  });
}

// ═══════════════════════════════════════════════════════════
//  ACTIVITY FEED
// ═══════════════════════════════════════════════════════════
function addActivity(icon, message) {
  const activities = Store.get('activities') || [];
  activities.unshift({ icon, message, time: new Date().toISOString() });
  if (activities.length > 20) activities.pop();
  Store.set('activities', activities);
  renderActivityFeed();
}

function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  const activities = Store.get('activities') || [];
  if (!activities.length) {
    feed.innerHTML = `<div class="activity-empty"><span>🎮</span><p>No activity yet. Play some games or chat with the AI tutor!</p><button class="btn-sm btn-sm-primary" onclick="navigateTo('games')" style="margin-top:8px">Start Playing</button></div>`;
    return;
  }
  feed.innerHTML = activities.slice(0, 8).map(a => `
    <div class="activity-item">
      <span class="activity-icon">${a.icon}</span>
      <div class="activity-content">
        <span class="activity-text">${a.message}</span>
        <span class="activity-time">${timeAgo(a.time)}</span>
      </div>
    </div>`).join('');
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ═══════════════════════════════════════════════════════════
//  LEARNING GAMES
// ═══════════════════════════════════════════════════════════

// ─── GAME DATA ─────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  // Math
  { q: 'What is the value of π (pi) to two decimal places?', opts: ['3.14', '3.16', '3.12', '3.18'], answer: 0, subject: 'math' },
  { q: 'What is the square root of 144?', opts: ['11', '12', '13', '14'], answer: 1, subject: 'math' },
  { q: 'What is 15% of 200?', opts: ['25', '30', '35', '40'], answer: 1, subject: 'math' },
  { q: 'If a triangle has angles 90° and 45°, what is the third angle?', opts: ['30°', '45°', '60°', '90°'], answer: 1, subject: 'math' },
  // Science
  { q: 'What is the chemical formula for water?', opts: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 0, subject: 'science' },
  { q: 'Which planet is closest to the Sun?', opts: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2, subject: 'science' },
  { q: 'What organelle is known as the powerhouse of the cell?', opts: ['Nucleus', 'Ribosome', 'Lysosome', 'Mitochondria'], answer: 3, subject: 'science' },
  { q: 'What is the speed of light (approx)?', opts: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '200,000 km/s'], answer: 0, subject: 'science' },
  // History
  { q: 'In which year did World War II end?', opts: ['1943', '1944', '1945', '1946'], answer: 2, subject: 'history' },
  { q: 'Who was the first President of the United States?', opts: ['John Adams', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin'], answer: 2, subject: 'history' },
  { q: 'The Great Wall of China was primarily built during which dynasty?', opts: ['Tang', 'Ming', 'Han', 'Qin'], answer: 1, subject: 'history' },
  { q: 'In which year did the Berlin Wall fall?', opts: ['1987', '1988', '1989', '1990'], answer: 2, subject: 'history' },
  // General
  { q: 'What is the largest ocean on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3, subject: 'general' },
  { q: 'How many sides does a hexagon have?', opts: ['5', '6', '7', '8'], answer: 1, subject: 'general' },
  { q: 'What is the capital of Japan?', opts: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], answer: 2, subject: 'general' },
  { q: 'Which gas do plants absorb for photosynthesis?', opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], answer: 1, subject: 'general' },
];

const FLASHCARDS = [
  { term: 'Photosynthesis', def: 'The process by which plants convert sunlight, water, and CO₂ into glucose and oxygen.', subject: 'science' },
  { term: 'Mitosis', def: 'Cell division producing two identical daughter cells with the same number of chromosomes as the parent.', subject: 'science' },
  { term: 'Quadratic Formula', def: 'x = (−b ± √(b²−4ac)) / 2a — finds roots of any quadratic equation ax² + bx + c = 0', subject: 'math' },
  { term: 'Pythagorean Theorem', def: 'In a right triangle, a² + b² = c², where c is the hypotenuse.', subject: 'math' },
  { term: 'The Renaissance', def: 'A cultural movement (14th–17th century) that revived interest in classical art, science, and literature.', subject: 'history' },
  { term: 'Osmosis', def: 'Movement of water molecules through a semipermeable membrane from low to high solute concentration.', subject: 'science' },
  { term: 'Newton\'s First Law', def: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a net force.', subject: 'science' },
  { term: 'Democracy', def: 'A system of government where power is vested in the people, exercised directly or through elected representatives.', subject: 'history' },
  { term: 'Metaphor', def: 'A figure of speech that directly refers to one thing by mentioning another, implying a comparison.', subject: 'general' },
  { term: 'Evolution', def: 'The change in heritable characteristics of populations over successive generations through natural selection.', subject: 'science' },
  { term: 'Prime Number', def: 'A natural number greater than 1 that has no positive divisors other than 1 and itself.', subject: 'math' },
  { term: 'Gravity', def: 'The force of attraction between objects with mass — described by Newton and refined by Einstein\'s general relativity.', subject: 'science' },
];

const SCRAMBLE_WORDS = [
  { scrambled: 'SLOMABETIM', word: 'METABOLISM', hint: 'Chemical processes in living organisms', subject: 'science' },
  { scrambled: 'ARBOGTILE', word: 'LOGARITHM', hint: 'Inverse of exponential function in math', subject: 'math' },
  { scrambled: 'DOCOMRYCE', word: 'DEMOCRACY', hint: 'Government by the people', subject: 'history' },
  { scrambled: 'YLLCOPEHO', word: 'POLYCHOLY', hint: 'Not a real word... try PSYCHOLOGY', subject: 'general' },
  { scrambled: 'SPETHISYONS', word: 'PHOTOSYNTHESIS', hint: 'How plants make food from sunlight', subject: 'science' },
  { scrambled: 'NEQAOUIST', word: 'EQUATIONS', hint: 'Mathematical statements with an equals sign', subject: 'math' },
  { scrambled: 'OLUEVINTO', word: 'REVOLUTION', hint: 'A major political or social change', subject: 'history' },
  { scrambled: 'RYOVALBUCA', word: 'VOCABULARY', hint: 'All the words a person knows', subject: 'general' },
];

const TRUE_FALSE = [
  { stmt: 'The Sun is a star.', answer: true, subject: 'science' },
  { stmt: 'Humans have 206 bones in their adult body.', answer: true, subject: 'science' },
  { stmt: 'The Great Wall of China is visible from space with the naked eye.', answer: false, subject: 'history' },
  { stmt: 'Water boils at 100°C at sea level.', answer: true, subject: 'science' },
  { stmt: 'Shakespeare wrote "Pride and Prejudice".', answer: false, subject: 'general' },
  { stmt: 'A negative times a negative equals a positive.', answer: true, subject: 'math' },
  { stmt: 'The Amazon River is the longest river in the world.', answer: false, subject: 'general' },
  { stmt: 'Diamonds are made of carbon.', answer: true, subject: 'science' },
  { stmt: 'World War I started in 1914.', answer: true, subject: 'history' },
  { stmt: 'The sum of angles in a triangle is always 180°.', answer: true, subject: 'math' },
  { stmt: 'Bats are blind.', answer: false, subject: 'science' },
  { stmt: 'Neil Armstrong walked on the Moon in 1969.', answer: true, subject: 'history' },
  { stmt: 'Light travels slower than sound.', answer: false, subject: 'science' },
  { stmt: 'The Sahara is the world\'s largest desert.', answer: false, subject: 'general' },
  { stmt: 'Pi is exactly equal to 22/7.', answer: false, subject: 'math' },
];

// ─── GAME LAUNCHER ─────────────────────────────────────────
window.startGame = function(type) {
  const overlay = document.getElementById('game-overlay');
  const modal   = document.getElementById('game-modal');
  if (!overlay || !modal) return;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  AppState.activeGame = { type, startTime: Date.now() };

  switch (type) {
    case 'quiz':      renderQuizGame(modal); break;
    case 'flashcard': renderFlashcardGame(modal); break;
    case 'scramble':  renderScrambleGame(modal); break;
    case 'truefalse': renderTrueFalseGame(modal); break;
  }
};

function closeGame() {
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
  AppState.activeGame = null;
}

function recordGameScore(gameType, gameName, score, accuracy, subject, duration) {
  const record = {
    type: gameType,
    gameName,
    score: Math.round(score),
    accuracy: Math.round(accuracy),
    subject,
    duration,
    date: new Date().toISOString()
  };
  AppState.gameScores.push(record);
  if (AppState.gameScores.length > 100) AppState.gameScores.shift();
  Store.set('gameScores', AppState.gameScores);
  addActivity('🎮', `Played ${gameName} — scored ${Math.round(score)}%`);
  refreshAnalytics();
  refreshGameCards();
  refreshAchievements();
  checkAchievements();
}

// ─── QUIZ GAME ─────────────────────────────────────────────
function renderQuizGame(modal) {
  const questions = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  let current = 0, score = 0, answered = false;

  function render() {
    if (current >= questions.length) {
      showQuizResult(score, questions.length, modal);
      return;
    }
    const q = questions[current];
    const pct = Math.round((current / questions.length) * 100);

    modal.innerHTML = `
      <div class="game-header">
        <button class="game-close-btn" onclick="closeGame()" aria-label="Close game">✕</button>
        <div class="game-title-row">
          <span class="game-emoji">🧠</span>
          <h2>Quick Quiz</h2>
        </div>
        <div class="game-progress-bar-wrap">
          <div class="game-progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="game-meta">
          <span>Question ${current + 1} of ${questions.length}</span>
          <span class="game-score-live">Score: ${score}/${current}</span>
        </div>
      </div>
      <div class="game-body">
        <div class="quiz-subject-tag">${q.subject.toUpperCase()}</div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options" id="quiz-options">
          ${q.opts.map((opt, i) => `
            <button class="quiz-option" id="quiz-opt-${i}" onclick="selectQuizOption(${i})" data-idx="${i}">
              <span class="opt-letter">${String.fromCharCode(65+i)}</span>
              <span>${opt}</span>
            </button>`).join('')}
        </div>
      </div>`;

    // Expose to global for onclick
    window.selectQuizOption = function(idx) {
      if (answered) return;
      answered = true;
      const correct = idx === q.answer;
      if (correct) score++;

      document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.answer) btn.classList.add('correct');
        else if (i === idx && !correct) btn.classList.add('wrong');
      });

      const feedback = document.createElement('div');
      feedback.className = `quiz-feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`;
      feedback.innerHTML = correct ? '✅ Correct! Great job!' : `❌ Not quite — the answer is <strong>${q.opts[q.answer]}</strong>`;
      modal.querySelector('.game-body').appendChild(feedback);

      setTimeout(() => {
        current++;
        answered = false;
        render();
      }, 1800);
    };
  }

  render();
}

function showQuizResult(score, total, modal) {
  const pct = Math.round((score / total) * 100);
  const duration = Math.round((Date.now() - AppState.activeGame.startTime) / 60000);
  recordGameScore('quiz', 'Quiz', pct, pct, 'general', duration || 1);

  const medal = pct >= 90 ? '🥇' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '📚';
  const msg = pct >= 90 ? 'Outstanding! You\'re a genius!' : pct >= 70 ? 'Great work! Keep it up!' : pct >= 50 ? 'Good effort! Practice makes perfect.' : 'Keep studying — you\'ve got this!';

  modal.innerHTML = `
    <div class="game-header">
      <button class="game-close-btn" onclick="closeGame()" aria-label="Close">✕</button>
      <div class="game-title-row"><span class="game-emoji">🏆</span><h2>Quiz Complete!</h2></div>
    </div>
    <div class="game-result">
      <div class="result-medal">${medal}</div>
      <div class="result-score-big">${pct}%</div>
      <div class="result-details">${score} / ${total} correct</div>
      <div class="result-msg">${msg}</div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startGame('quiz')">🔄 Play Again</button>
        <button class="btn-secondary" onclick="navigateTo('dashboard');closeGame()">📊 See Analytics</button>
      </div>
    </div>`;
}

// ─── FLASHCARD GAME ─────────────────────────────────────────
function renderFlashcardGame(modal) {
  const cards = [...FLASHCARDS].sort(() => Math.random() - 0.5);
  let current = 0, flipped = false, mastered = 0;

  function render() {
    if (current >= cards.length) {
      showFlashcardResult(mastered, cards.length, modal);
      return;
    }
    const card = cards[current];

    modal.innerHTML = `
      <div class="game-header">
        <button class="game-close-btn" onclick="closeGame()">✕</button>
        <div class="game-title-row"><span class="game-emoji">🃏</span><h2>Flashcard Flip</h2></div>
        <div class="game-progress-bar-wrap">
          <div class="game-progress-bar" style="width:${Math.round(current/cards.length*100)}%"></div>
        </div>
        <div class="game-meta">
          <span>Card ${current + 1} of ${cards.length}</span>
          <span class="game-score-live">Mastered: ${mastered}</span>
        </div>
      </div>
      <div class="game-body" style="display:flex;flex-direction:column;align-items:center;gap:20px">
        <div class="quiz-subject-tag">${card.subject.toUpperCase()}</div>
        <div class="flashcard-scene" id="flashcard-scene" onclick="flipCard()" title="Click to flip">
          <div class="flashcard-inner" id="flashcard-inner">
            <div class="flashcard-front">
              <div class="flashcard-label">📖 Term</div>
              <div class="flashcard-term">${card.term}</div>
              <div class="flashcard-hint">Click to reveal definition →</div>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-label">💡 Definition</div>
              <div class="flashcard-def">${card.def}</div>
            </div>
          </div>
        </div>
        <div class="flashcard-actions" id="flashcard-actions" style="display:none;gap:12px;justify-content:center;width:100%">
          <button class="btn-secondary" onclick="rateCard('again')" style="flex:1;max-width:140px">🔄 Again</button>
          <button class="btn-primary" onclick="rateCard('mastered')" style="flex:1;max-width:140px">✅ Mastered</button>
        </div>
        <div id="flip-hint" style="font-size:0.8rem;color:#8B5E40">👆 Click the card to flip</div>
      </div>`;

    flipped = false;

    window.flipCard = function() {
      const inner = document.getElementById('flashcard-inner');
      const hint  = document.getElementById('flip-hint');
      const actions = document.getElementById('flashcard-actions');
      if (!flipped) {
        inner.classList.add('flipped');
        flipped = true;
        if (actions) actions.style.display = 'flex';
        if (hint) hint.style.display = 'none';
      }
    };

    window.rateCard = function(rating) {
      if (rating === 'mastered') mastered++;
      current++;
      flipped = false;
      render();
    };
  }

  render();
}

function showFlashcardResult(mastered, total, modal) {
  const pct = Math.round(mastered / total * 100);
  const duration = Math.round((Date.now() - AppState.activeGame.startTime) / 60000);
  recordGameScore('flashcard', 'Flashcards', pct, pct, 'science', duration || 1);

  modal.innerHTML = `
    <div class="game-header">
      <button class="game-close-btn" onclick="closeGame()">✕</button>
      <div class="game-title-row"><span class="game-emoji">🃏</span><h2>Study Complete!</h2></div>
    </div>
    <div class="game-result">
      <div class="result-medal">${pct >= 80 ? '⭐' : '📚'}</div>
      <div class="result-score-big">${mastered}/${total}</div>
      <div class="result-details">Cards mastered</div>
      <div class="result-msg">${pct >= 80 ? 'Excellent retention!' : pct >= 50 ? 'Good progress! Review the ones you missed.' : 'Keep studying — repetition is key!'}</div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startGame('flashcard')">🔄 Study Again</button>
        <button class="btn-secondary" onclick="navigateTo('dashboard');closeGame()">📊 See Analytics</button>
      </div>
    </div>`;
}

// ─── WORD SCRAMBLE ─────────────────────────────────────────
function renderScrambleGame(modal) {
  const words = [...SCRAMBLE_WORDS].sort(() => Math.random() - 0.5).slice(0, 6);
  let current = 0, score = 0, wrongCount = 0;

  function render() {
    if (current >= words.length) {
      showScrambleResult(score, words.length, modal);
      return;
    }
    const w = words[current];

    modal.innerHTML = `
      <div class="game-header">
        <button class="game-close-btn" onclick="closeGame()">✕</button>
        <div class="game-title-row"><span class="game-emoji">🔤</span><h2>Word Scramble</h2></div>
        <div class="game-progress-bar-wrap">
          <div class="game-progress-bar" style="width:${Math.round(current/words.length*100)}%"></div>
        </div>
        <div class="game-meta">
          <span>Word ${current + 1} of ${words.length}</span>
          <span class="game-score-live">Score: ${score}</span>
        </div>
      </div>
      <div class="game-body" style="display:flex;flex-direction:column;align-items:center;gap:20px">
        <div class="quiz-subject-tag">${w.subject.toUpperCase()}</div>
        <div class="scramble-hint">💡 ${w.hint}</div>
        <div class="scramble-letters">${w.scrambled.split('').map(l => `<span class="scramble-letter">${l}</span>`).join('')}</div>
        <div style="display:flex;gap:12px;align-items:center;width:100%;max-width:360px">
          <input class="form-input" type="text" id="scramble-input" placeholder="Type your answer..." autocomplete="off"
            style="flex:1;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"
            onkeydown="if(event.key==='Enter')checkScramble()" aria-label="Type unscrambled word" />
          <button class="btn-primary" onclick="checkScramble()" style="white-space:nowrap">Check ✓</button>
        </div>
        <div id="scramble-feedback" style="height:28px;font-size:0.9rem"></div>
        <button class="btn-secondary" onclick="skipScramble()" style="font-size:0.82rem">Skip →</button>
      </div>`;

    setTimeout(() => document.getElementById('scramble-input')?.focus(), 100);

    window.checkScramble = function() {
      const val = (document.getElementById('scramble-input')?.value || '').toUpperCase().trim();
      const fb  = document.getElementById('scramble-feedback');
      if (val === w.word) {
        score++;
        if (fb) { fb.textContent = '✅ Correct!'; fb.style.color = '#4ECDC4'; }
        setTimeout(() => { current++; render(); }, 900);
      } else {
        wrongCount++;
        if (fb) { fb.textContent = `❌ Try again! (${wrongCount} attempt${wrongCount > 1 ? 's' : ''})`; fb.style.color = '#FF4B4B'; }
        if (wrongCount >= 3) {
          if (fb) { fb.innerHTML = `💡 Answer: <strong>${w.word}</strong>`; fb.style.color = '#FFB300'; }
          setTimeout(() => { current++; wrongCount = 0; render(); }, 2000);
        }
      }
    };

    window.skipScramble = function() {
      wrongCount = 0;
      current++;
      render();
    };
  }

  render();
}

function showScrambleResult(score, total, modal) {
  const pct = Math.round(score / total * 100);
  const duration = Math.round((Date.now() - AppState.activeGame.startTime) / 60000);
  recordGameScore('scramble', 'Scramble', pct, pct, 'general', duration || 1);

  modal.innerHTML = `
    <div class="game-header">
      <button class="game-close-btn" onclick="closeGame()">✕</button>
      <div class="game-title-row"><span class="game-emoji">🔤</span><h2>Scramble Done!</h2></div>
    </div>
    <div class="game-result">
      <div class="result-medal">${pct >= 80 ? '🥇' : pct >= 50 ? '🥈' : '📚'}</div>
      <div class="result-score-big">${pct}%</div>
      <div class="result-details">${score} of ${total} words unscrambled</div>
      <div class="result-msg">${pct >= 80 ? 'Vocabulary master!' : 'Keep building your vocabulary!'}</div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startGame('scramble')">🔄 Play Again</button>
        <button class="btn-secondary" onclick="navigateTo('dashboard');closeGame()">📊 See Analytics</button>
      </div>
    </div>`;
}

// ─── TRUE OR FALSE ─────────────────────────────────────────
function renderTrueFalseGame(modal) {
  const questions = [...TRUE_FALSE].sort(() => Math.random() - 0.5);
  let current = 0, score = 0, timer, timeLeft = 5;

  function render() {
    if (current >= questions.length) {
      clearInterval(timer);
      showTrueFalseResult(score, questions.length, modal);
      return;
    }
    const q = questions[current];
    timeLeft = 5;

    modal.innerHTML = `
      <div class="game-header">
        <button class="game-close-btn" onclick="clearInterval(window._tfTimer);closeGame()">✕</button>
        <div class="game-title-row"><span class="game-emoji">⚡</span><h2>True or False</h2></div>
        <div class="game-progress-bar-wrap">
          <div class="game-progress-bar" style="width:${Math.round(current/questions.length*100)}%"></div>
        </div>
        <div class="game-meta">
          <span>Question ${current + 1} of ${questions.length}</span>
          <span class="game-score-live">Score: ${score}</span>
        </div>
      </div>
      <div class="game-body" style="display:flex;flex-direction:column;align-items:center;gap:24px">
        <div class="quiz-subject-tag">${q.subject.toUpperCase()}</div>
        <div class="tf-timer-ring">
          <div class="tf-timer-num" id="tf-timer">${timeLeft}</div>
        </div>
        <div class="tf-statement">"${q.stmt}"</div>
        <div id="tf-feedback" style="height:28px;font-size:1rem;font-weight:600"></div>
        <div class="tf-buttons">
          <button class="tf-btn tf-true" onclick="answerTF(true)" id="tf-true-btn">
            ✅ True
          </button>
          <button class="tf-btn tf-false" onclick="answerTF(false)" id="tf-false-btn">
            ❌ False
          </button>
        </div>
      </div>`;

    timer = setInterval(() => {
      timeLeft--;
      const el = document.getElementById('tf-timer');
      if (el) { el.textContent = timeLeft; if (timeLeft <= 2) el.style.color = '#FF4B4B'; }
      if (timeLeft <= 0) {
        clearInterval(timer);
        timeoutTF(q);
      }
    }, 1000);
    window._tfTimer = timer;

    window.answerTF = function(answer) {
      clearInterval(timer);
      const correct = answer === q.answer;
      if (correct) score++;
      document.getElementById('tf-true-btn')?.setAttribute('disabled', 'true');
      document.getElementById('tf-false-btn')?.setAttribute('disabled', 'true');
      const fb = document.getElementById('tf-feedback');
      if (fb) { fb.textContent = correct ? '✅ Correct!' : `❌ It was ${q.answer ? 'TRUE' : 'FALSE'}`; fb.style.color = correct ? '#4ECDC4' : '#FF4B4B'; }
      setTimeout(() => { current++; render(); }, 1200);
    };

    function timeoutTF(q) {
      const fb = document.getElementById('tf-feedback');
      if (fb) { fb.textContent = `⏰ Time up! Answer: ${q.answer ? 'TRUE' : 'FALSE'}`; fb.style.color = '#FFB300'; }
      setTimeout(() => { current++; render(); }, 1500);
    }
  }

  render();
}

function showTrueFalseResult(score, total, modal) {
  const pct = Math.round(score / total * 100);
  const duration = Math.round((Date.now() - AppState.activeGame.startTime) / 60000);
  recordGameScore('truefalse', 'True/False', pct, pct, 'general', duration || 1);

  modal.innerHTML = `
    <div class="game-header">
      <button class="game-close-btn" onclick="closeGame()">✕</button>
      <div class="game-title-row"><span class="game-emoji">⚡</span><h2>Speed Round Done!</h2></div>
    </div>
    <div class="game-result">
      <div class="result-medal">${pct >= 80 ? '⚡' : pct >= 60 ? '🥈' : '📚'}</div>
      <div class="result-score-big">${pct}%</div>
      <div class="result-details">${score} of ${total} correct</div>
      <div class="result-msg">${pct >= 80 ? 'Lightning fast and accurate!' : pct >= 60 ? 'Good reflexes!' : 'Speed comes with practice!'}</div>
      <div class="result-actions">
        <button class="btn-primary" onclick="startGame('truefalse')">🔄 Play Again</button>
        <button class="btn-secondary" onclick="navigateTo('dashboard');closeGame()">📊 See Analytics</button>
      </div>
    </div>`;
}

function refreshGameCards() {
  const scores = AppState.gameScores;
  const gameTypes = ['quiz', 'flashcard', 'scramble', 'truefalse'];
  const typeToKey = { quiz:'Quiz', flashcard:'Flashcards', scramble:'Scramble', truefalse:'True/False' };

  gameTypes.forEach(type => {
    const typeScores = scores.filter(s => s.type === type);
    const best = typeScores.length ? Math.max(...typeScores.map(s => s.score)) : null;
    const plays = typeScores.length;

    const bestEl  = document.getElementById(`best-${type}`);
    const playsEl = document.getElementById(`plays-${type}`);
    if (bestEl)  bestEl.textContent  = best !== null ? `Best: ${best}%` : 'Best: –';
    if (playsEl) playsEl.textContent = `Plays: ${plays}`;
  });
}

function refreshGameHistory() {
  const list = document.getElementById('game-history-list');
  if (!list) return;
  const scores = [...AppState.gameScores].reverse().slice(0, 10);
  if (!scores.length) {
    list.innerHTML = `<div class="activity-empty"><span>🎮</span><p>No games played yet. Pick a game above and start learning!</p></div>`;
    return;
  }
  const medal = pct => pct >= 90 ? '🥇' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '📚';
  list.innerHTML = scores.map(s => `
    <div class="game-history-item">
      <span class="game-history-medal">${medal(s.score)}</span>
      <div class="game-history-info">
        <span class="game-history-name">${s.gameName}</span>
        <span class="game-history-subject">${s.subject}</span>
      </div>
      <div class="game-history-score" style="color:${s.score>=70?'#4ECDC4':s.score>=50?'#FFB300':'#FF4B4B'}">${s.score}%</div>
      <div class="game-history-time">${timeAgo(s.date)}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════
//  PROFILE PAGE
// ═══════════════════════════════════════════════════════════
const AVATARS = ['🧑', '👦', '👧', '👨', '👩', '👴', '👵', '🧑‍💻', '👨‍🎓', '👩‍🎓',
  '👨‍🏫', '👩‍🏫', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🦸', '🦹', '🧙', '🧝', '🧟',
  '🐱', '🐶', '🦊', '🐼', '🦁', '🐸', '🐧', '🦋', '🌟', '🚀'];

function initAvatarPicker() {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;
  grid.innerHTML = AVATARS.map((av, i) => `
    <button class="avatar-option" data-avatar="${av}" onclick="selectAvatar('${av}')" aria-label="Select avatar ${av}" id="av-${i}">
      ${av}
    </button>`).join('');
}

window.selectAvatar = function(av) {
  document.querySelectorAll('.avatar-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.avatar === av);
  });
  const display = document.getElementById('profile-avatar-display');
  const navAvatar = document.getElementById('nav-avatar');
  if (display) display.textContent = av;
  if (navAvatar) navAvatar.textContent = av;
  if (AppState.currentUser) {
    AppState.currentUser.avatar = av;
    Store.set('currentUser', AppState.currentUser);
    const users = Store.get('users') || {};
    if (users[AppState.currentUser.email]) {
      users[AppState.currentUser.email].avatar = av;
      Store.set('users', users);
    }
  }
};

function initProfile() {
  const form = document.getElementById('profile-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!AppState.currentUser) { showToast('⚠️ Please sign in first', 'warn'); return; }

    const name  = document.getElementById('profile-name')?.value.trim();
    const role  = document.getElementById('profile-role-edit')?.value;
    const bio   = document.getElementById('profile-bio')?.value.trim();
    const chips = [...document.querySelectorAll('.subject-chip.active')].map(c => c.dataset.subject);

    AppState.currentUser = { ...AppState.currentUser, name: name || AppState.currentUser.name, role: role || AppState.currentUser.role, bio, subjects: chips };
    Store.set('currentUser', AppState.currentUser);

    // Save Gemini API key setting
    const keyInput = document.getElementById('pref-gemini-key');
    if (keyInput) {
      const keyVal = keyInput.value.trim();
      if (keyVal) Store.set('gemini_api_key', keyVal);
      else Store.remove('gemini_api_key');
      initGeminiStatus();
    }

    const users = Store.get('users') || {};
    if (users[AppState.currentUser.email]) {
      Object.assign(users[AppState.currentUser.email], AppState.currentUser);
      Store.set('users', users);
    }

    updateAuthUI();
    loadProfilePage();
    showToast('✅ Profile saved!', 'success');
    addActivity('👤', 'Updated profile');
  });

  // Subject chips
  document.querySelectorAll('.subject-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  // Preference toggles
  ['pref-sr-toggle', 'pref-notif-toggle'].forEach(id => {
    const toggle = document.getElementById(id);
    toggle?.addEventListener('click', () => {
      const active = toggle.classList.toggle('active');
      toggle.setAttribute('aria-checked', active.toString());
    });
  });

  // Key input change handler
  document.getElementById('pref-gemini-key')?.addEventListener('change', e => {
    const val = e.target.value.trim();
    if (val) Store.set('gemini_api_key', val);
    else Store.remove('gemini_api_key');
    initGeminiStatus();
  });
}

function loadProfilePage() {
  const user = AppState.currentUser;
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

  // Load Gemini API Key input value
  const keyInput = document.getElementById('pref-gemini-key');
  if (keyInput) keyInput.value = Store.get('gemini_api_key') || '';

  if (user) {
    setEl('profile-avatar-display', user.avatar || '🧑');
    setEl('profile-name-display', user.name || 'Your Name');
    setEl('profile-role-display', user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student');
    setEl('profile-joined-display', `Joined ${user.joinedAt || 'today'}`);
    setVal('profile-name', user.name);
    setVal('profile-email-show', user.email);
    setVal('profile-bio', user.bio);

    const roleSelect = document.getElementById('profile-role-edit');
    if (roleSelect) roleSelect.value = user.role || 'student';

    // Mark selected avatar
    document.querySelectorAll('.avatar-option').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.avatar === (user.avatar || '🧑'));
    });

    // Subject chips
    const subjects = user.subjects || [];
    document.querySelectorAll('.subject-chip').forEach(chip => {
      chip.classList.toggle('active', subjects.includes(chip.dataset.subject));
    });
  } else {
    setEl('profile-name-display', 'Guest User');
    setEl('profile-role-display', 'Not signed in');
    setEl('profile-joined-display', 'Sign in to save your profile');
  }
}

function refreshAchievements() {
  const scores = AppState.gameScores;
  const streak = calculateStreak();
  const chatCount = (Store.get('activities') || []).filter(a => a.icon === '🤖').length;

  const checks = {
    'first-game':   scores.length >= 1,
    'perfect-score': scores.some(s => s.score === 100),
    'streak-3':     streak >= 3,
    'games-5':      scores.length >= 5,
    'ai-chat':      chatCount >= 1,
    'streak-7':     streak >= 7,
  };

  Object.entries(checks).forEach(([achievement, earned]) => {
    const el = document.querySelector(`[data-achievement="${achievement}"]`);
    if (el) {
      el.classList.toggle('locked', !earned);
      el.classList.toggle('earned', earned);
    }
  });
}

function checkAchievements() {
  const scores = AppState.gameScores;
  const earned = Store.get('earnedAchievements') || [];

  const checks = [
    { key: 'first-game', label: '🎮 First Game!', cond: scores.length === 1 },
    { key: 'perfect-score', label: '💯 Perfect Score!', cond: scores.some(s => s.score === 100) },
    { key: 'games-5', label: '⭐ 5 Games Played!', cond: scores.length === 5 },
    { key: 'games-5', label: '⭐ 5 Games Played!', cond: scores.length === 5 },
  ];

  checks.forEach(({ key, label, cond }) => {
    if (cond && !earned.includes(key)) {
      earned.push(key);
      Store.set('earnedAchievements', earned);
      showToast(`🏅 Achievement Unlocked: ${label}`, 'success');
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════════════════════════
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════
//  HERO VOICE ORB
// ═══════════════════════════════════════════════════════════
function initVoiceOrb() {
  const orb = document.getElementById('hero-orb-btn');
  if (!orb) return;
  let isListening = false;
  orb.addEventListener('click', () => {
    isListening = !isListening;
    orb.classList.toggle('listening', isListening);
    orb.textContent = isListening ? '🔊' : '🎙️';
    orb.setAttribute('aria-label', isListening ? 'Stop listening' : 'Activate voice mode');
    if (isListening) {
      showToast('🎙️ Listening... Speak now!', 'info');
      setTimeout(() => {
        isListening = false;
        orb.classList.remove('listening');
        orb.textContent = '🎙️';
        showToast('✅ Got it! Taking you to the AI tutor...', 'success');
        setTimeout(() => navigateTo('dashboard'), 1000);
      }, 3000);
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  WAVEFORM BARS
// ═══════════════════════════════════════════════════════════
function initWaveformBars() {
  const container = document.getElementById('waveform-bars');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    bar.style.height = `${Math.random() * 70 + 15}%`;
    bar.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
    bar.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(bar);
  }
}

// ═══════════════════════════════════════════════════════════
//  ACCESSIBILITY TOGGLE
// ═══════════════════════════════════════════════════════════
function initAccessibilityToggle() {
  const toggle = document.getElementById('accessibility-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const active = toggle.classList.toggle('active');
    toggle.setAttribute('aria-checked', active.toString());
    showToast(active ? '♿ Screen reader mode enabled' : '♿ Screen reader mode disabled', 'info');
  });
  toggle.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); } });
}

// ═══════════════════════════════════════════════════════════
//  COUNTER ANIMATIONS
// ═══════════════════════════════════════════════════════════
function initCounterAnimations() {
  const counters = [
    { id: 'stat-users', end: 2400, suffix: '+' },
    { id: 'stat-accuracy', end: 97, suffix: '%' },
    { id: 'stat-sessions', end: 18, suffix: 'K+' },
  ];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const cfg = counters.find(c => c.id === el.id);
      if (!cfg) return;
      let val = 0;
      const step = cfg.end / (1500 / 16);
      const timer = setInterval(() => {
        val += step;
        if (val >= cfg.end) { val = cfg.end; clearInterval(timer); }
        el.textContent = `${Math.floor(val)}${cfg.suffix}`;
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => { const el = document.getElementById(c.id); if (el) observer.observe(el); });
}

// ═══════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = {
    info:    { border: '#FF6B35' },
    success: { border: '#4ECDC4' },
    warn:    { border: '#FFB300' },
    error:   { border: '#FF4B4B' },
  };
  const cfg = colors[type] || colors.info;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderLeftColor = cfg.border;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s reverse both';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ═══════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.altKey && e.key === 'm') { e.preventDefault(); document.getElementById('chat-mic-btn')?.click(); }
  if (e.altKey && e.key === 's') { e.preventDefault(); document.getElementById('demo-speak-btn')?.click(); }
  if (e.key === 'Escape') {
    if (typeof closeMobileNav === 'function') closeMobileNav();
    window.speechSynthesis?.cancel();
    closeGame();
  }
});

// ═══════════════════════════════════════════════════════════
//  PREFERS-REDUCED-MOTION
// ═══════════════════════════════════════════════════════════
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.waveform-bar, .wave-ring, .hero-bg-blob, .float-card').forEach(el => {
    el.style.animation = 'none';
  });
}

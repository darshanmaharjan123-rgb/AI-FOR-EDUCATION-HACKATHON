/* ============================================================
   ClarityAI — app.js
   Interactive functionality, animations, voice demo
   ============================================================ */

'use strict';

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initVoiceOrb();
  initWaveformBars();
  initWeeklyChart();
  initProgressBars();
  initChatDemo();
  initUploadZone();
  initAuthForms();
  initAccessibilityToggle();
  initCounterAnimations();
  animateProgressBars();
});

// ── 1. NAVBAR ──────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveNav();
  }, { passive: true });

  // Smooth click scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Active nav highlight
  function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }
}

// ── 2. MOBILE NAV ──────────────────────────────────────────
function initMobileNav() {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.getElementById('mobile-nav');
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

// ── 3. SCROLL REVEAL ───────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── 4. HERO VOICE ORB ──────────────────────────────────────
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
        orb.setAttribute('aria-label', 'Activate voice mode');
        showToast('✅ Got it! Processing your question...', 'success');
      }, 4000);
    }
  });
}

// ── 5. WAVEFORM BARS ───────────────────────────────────────
function initWaveformBars() {
  const container = document.getElementById('waveform-bars');
  if (!container) return;

  const barCount = 28;
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    const height = Math.random() * 70 + 15;
    bar.style.height = `${height}%`;
    bar.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
    bar.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(bar);
  }
}

// ── 6. WEEKLY BAR CHART ────────────────────────────────────
function initWeeklyChart() {
  const chart = document.getElementById('weekly-chart');
  if (!chart) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const comprehension = [72, 85, 78, 91, 88, 65, 94];
  const engagement   = [60, 75, 82, 70, 85, 55, 90];

  days.forEach((day, i) => {
    const group = document.createElement('div');
    group.className = 'bar-group';

    // Two bars side-by-side
    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'display:flex;gap:3px;align-items:flex-end;width:100%;height:140px';

    const b1 = document.createElement('div');
    b1.className = 'bar bar-orange';
    b1.style.cssText = `width:50%;height:0%;transition:height 1.2s ${i * 0.1}s cubic-bezier(0.34,1.56,0.64,1)`;
    b1.setAttribute('data-value', `${comprehension[i]}%`);
    b1.setAttribute('title', `${day}: Comprehension ${comprehension[i]}%`);
    b1.setAttribute('role', 'img');
    b1.setAttribute('aria-label', `${day} comprehension ${comprehension[i]}%`);

    const b2 = document.createElement('div');
    b2.className = 'bar bar-green';
    b2.style.cssText = `width:50%;height:0%;transition:height 1.2s ${i * 0.1 + 0.05}s cubic-bezier(0.34,1.56,0.64,1)`;
    b2.setAttribute('data-value', `${engagement[i]}%`);
    b2.setAttribute('title', `${day}: Engagement ${engagement[i]}%`);
    b2.setAttribute('role', 'img');
    b2.setAttribute('aria-label', `${day} engagement ${engagement[i]}%`);

    barWrap.appendChild(b1);
    barWrap.appendChild(b2);

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = day;

    group.appendChild(barWrap);
    group.appendChild(label);
    chart.appendChild(group);

    // Animate on scroll into view
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        b1.style.height = `${comprehension[i]}%`;
        b2.style.height = `${engagement[i]}%`;
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(chart);
  });
}

// ── 7. PROGRESS BARS ───────────────────────────────────────
function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-bar-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        setTimeout(() => {
          target.style.width = target.getAttribute('data-width');
        }, 200);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}

function initProgressBars() {
  // Just ensures bars start at 0
  document.querySelectorAll('.progress-bar-fill').forEach(bar => {
    bar.style.width = '0%';
  });
}

// ── 8. CHAT DEMO ───────────────────────────────────────────
function initChatDemo() {
  const micBtn   = document.getElementById('chat-mic-btn');
  const sendBtn  = document.getElementById('chat-send-btn');
  const input    = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  const speakBtn = document.getElementById('demo-speak-btn');
  const statusTxt = document.getElementById('voice-status-text');
  const statusSub = document.getElementById('voice-status-sub');

  let lastAIMessage = "Hello! I'm ClarityAI. How can I help you today?";
  let isRecording = false;

  const aiResponses = [
    "That's a great question! Let me describe this concept in a way that's easy to visualize with your mind's ear. Imagine a graph where time flows left to right along the horizontal axis, while the value being measured rises and falls along the vertical axis...",
    "I'll guide you through this step by step. First, let's understand the big picture, then we'll zoom into each component. Think of it like exploring a room — we'll start at the door, move along the walls, and work our way to the center...",
    "Excellent! This is actually a fascinating topic. The data shows a clear upward trend — starting from a baseline at the left, rising steeply in the middle where most activity clusters, then plateauing toward the right as the system reaches equilibrium...",
    "Of course! Let me break this down into bite-sized pieces. Imagine you're holding a musical instrument — each part has a specific role. The first component acts like the mouthpiece, the second like the body, and the third like the keys that control the sound...",
    "That's a really insightful observation! You're picking up on a pattern that many students miss. The relationship here is inversely proportional — as one value increases, the other decreases at the same rate, creating a perfect mirror-image effect...",
  ];

  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = `msg-avatar ${role}-avatar`;
    avatar.textContent = role === 'ai' ? '🤖' : '👤';
    avatar.setAttribute('aria-hidden', 'true');

    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${role}-bubble`;
    bubble.setAttribute('role', 'article');
    bubble.innerHTML = text;

    if (role === 'ai') lastAIMessage = text;

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'msg ai';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="msg-avatar ai-avatar" aria-hidden="true">🤖</div>
      <div class="msg-bubble ai-bubble" aria-label="ClarityAI is thinking">
        <span style="display:flex;gap:4px;align-items:center">
          <span style="width:7px;height:7px;background:#FF6B35;border-radius:50%;animation:pulseDot 0.8s 0s infinite"></span>
          <span style="width:7px;height:7px;background:#FFB300;border-radius:50%;animation:pulseDot 0.8s 0.15s infinite"></span>
          <span style="width:7px;height:7px;background:#4ECDC4;border-radius:50%;animation:pulseDot 0.8s 0.3s infinite"></span>
        </span>
      </div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      addMessage(response, 'ai');
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();

      // Auto speak the response
      if (window.speechSynthesis) speakText(response);
    }, 1200 + Math.random() * 800);
  }

  sendBtn.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });

  // Mic button toggle
  micBtn.addEventListener('click', () => {
    isRecording = !isRecording;
    micBtn.classList.toggle('recording', isRecording);
    micBtn.setAttribute('aria-label', isRecording ? 'Stop recording' : 'Start voice recording');
    statusTxt.textContent = isRecording ? 'Listening...' : 'Ready to Listen';
    statusSub.textContent = isRecording ? 'Speak your question clearly' : 'Click the microphone to begin';

    if (isRecording) {
      showToast('🎤 Microphone active — speak now!', 'info');
      setTimeout(() => {
        if (isRecording) {
          isRecording = false;
          micBtn.classList.remove('recording');
          statusTxt.textContent = 'Processing...';
          statusSub.textContent = 'Analyzing your speech';
          const simulatedQuestions = [
            'Can you explain what a bell curve represents?',
            'Describe the photosynthesis process step by step.',
            'What does the slope of a graph represent?',
            'How does DNA replication work?',
          ];
          const q = simulatedQuestions[Math.floor(Math.random() * simulatedQuestions.length)];
          setTimeout(() => {
            statusTxt.textContent = 'Ready to Listen';
            statusSub.textContent = 'Click the microphone to begin';
            sendMessage(q);
          }, 800);
        }
      }, 3000);
    }
  });

  // Speak last AI response
  speakBtn.addEventListener('click', () => {
    if (window.speechSynthesis) {
      speakText(lastAIMessage);
      showToast('🔊 Playing audio response...', 'info');
    } else {
      showToast('⚠️ Text-to-speech not supported in this browser', 'warn');
    }
  });
}

// ── 9. TEXT TO SPEECH ──────────────────────────────────────
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const rateSlider   = document.getElementById('speech-rate-slider');
  const pitchSlider  = document.getElementById('speech-pitch-slider');
  const volumeSlider = document.getElementById('speech-volume-slider');

  const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
  utterance.rate   = rateSlider   ? parseFloat(rateSlider.value)   : 1;
  utterance.pitch  = pitchSlider  ? parseFloat(pitchSlider.value)  : 1;
  utterance.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.9;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || voices[0];
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

// ── 10. UPLOAD ZONE ────────────────────────────────────────
function initUploadZone() {
  const zone      = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const results   = document.getElementById('upload-results');
  if (!zone) return;

  // Click to open
  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  // Drag events
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => handleFiles(fileInput.files));

  function handleFiles(files) {
    [...files].forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`⚠️ ${file.name} exceeds 10MB limit`, 'warn');
        return;
      }
      showToast(`📤 Uploading ${file.name}...`, 'info');
      createUploadCard(file);
    });
  }

  function createUploadCard(file) {
    const ext  = file.name.split('.').pop().toUpperCase();
    const card = document.createElement('div');
    card.className = 'result-card reveal';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="result-header">
        <span class="result-type">📄 ${ext} — ${file.name.length > 24 ? file.name.substring(0, 24) + '…' : file.name}</span>
        <span class="result-status" style="background:rgba(255,179,0,0.12);color:#FFB300">⏳ Processing</span>
      </div>
      <p class="result-desc" style="color:#aaa">Analyzing content and generating spatial audio description...</p>
      <div class="result-actions">
        <button class="btn-sm btn-sm-ghost" aria-label="Cancel upload">✕ Cancel</button>
      </div>`;

    results.prepend(card);
    requestAnimationFrame(() => card.classList.add('visible'));

    // Simulate AI processing
    setTimeout(() => {
      card.querySelector('.result-status').innerHTML = '✅ Described';
      card.querySelector('.result-status').style.cssText = 'background:rgba(78,205,196,0.12);color:#4ECDC4';
      card.querySelector('.result-desc').style.color = '';
      card.querySelector('.result-desc').textContent = `"This ${ext} document contains rich educational content. The primary visual element shows a structured layout with labeled components. Key areas have been identified and converted to detailed spatial audio descriptions..."`;
      card.querySelector('.result-actions').innerHTML = `
        <button class="btn-sm btn-sm-primary" aria-label="Play audio description">🔊 Play Audio</button>
        <button class="btn-sm btn-sm-ghost" aria-label="Read text description">📄 Read Text</button>`;

      card.querySelectorAll('.btn-sm-primary').forEach(b => {
        b.addEventListener('click', () => {
          showToast('🔊 Playing audio description...', 'info');
          speakText(card.querySelector('.result-desc').textContent);
        });
      });

      showToast(`✅ ${file.name} — audio description ready!`, 'success');
    }, 2500 + Math.random() * 1500);
  }
}

// ── 11. AUTH FORMS ─────────────────────────────────────────
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

    showToast('🎉 Account created! Welcome to ClarityAI!', 'success');
    signupForm.reset();
  });

  signinForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const pass  = document.getElementById('signin-password').value;

    if (!email || !pass) {
      showToast('⚠️ Please enter your email and password', 'warn'); return;
    }

    showToast('🚀 Signing in...', 'info');
    setTimeout(() => showToast('✅ Welcome back! Redirecting to dashboard...', 'success'), 1200);
  });

  document.getElementById('google-signin-btn')?.addEventListener('click', () =>
    showToast('🔵 Google OAuth — connect your backend!', 'info'));

  document.getElementById('github-signin-btn')?.addEventListener('click', () =>
    showToast('⚫ GitHub OAuth — connect your backend!', 'info'));

  document.getElementById('voice-login-btn')?.addEventListener('click', () => {
    showToast('🎙️ Voice authentication — say your passphrase...', 'info');
    setTimeout(() => showToast('✅ Voice verified! Welcome back!', 'success'), 3000);
  });
}

// ── 12. ACCESSIBILITY TOGGLE ───────────────────────────────
function initAccessibilityToggle() {
  const toggle = document.getElementById('accessibility-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isActive = toggle.classList.toggle('active');
    toggle.setAttribute('aria-checked', isActive.toString());
    showToast(
      isActive ? '♿ Screen reader mode enabled' : '♿ Screen reader mode disabled',
      'info'
    );
  });

  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
  });
}

// ── 13. COUNTER ANIMATIONS ─────────────────────────────────
function initCounterAnimations() {
  const counters = [
    { id: 'stat-users',     end: 2400, suffix: '+', prefix: '' },
    { id: 'stat-accuracy',  end: 97,   suffix: '%', prefix: '' },
    { id: 'stat-sessions',  end: 18,   suffix: 'K+', prefix: '' },
  ];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const cfg = counters.find(c => c.id === el.id);
      if (!cfg) return;

      let start = 0;
      const duration = 1500;
      const step = cfg.end / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= cfg.end) { start = cfg.end; clearInterval(timer); }
        el.textContent = `${cfg.prefix}${Math.floor(start)}${cfg.suffix}`;
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) observer.observe(el);
  });
}

// ── 14. TOAST NOTIFICATIONS ────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    info:    { border: '#FF6B35', icon: 'ℹ️' },
    success: { border: '#4ECDC4', icon: '✅' },
    warn:    { border: '#FFB300', icon: '⚠️' },
    error:   { border: '#FF4B4B', icon: '❌' },
  };

  const cfg = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderLeftColor = cfg.border;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${cfg.icon}</span>
    <span>${message}</span>`;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s reverse both';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── 15. KEYBOARD SHORTCUTS ─────────────────────────────────
document.addEventListener('keydown', e => {
  // Alt+M = toggle mic
  if (e.altKey && e.key === 'm') {
    e.preventDefault();
    document.getElementById('chat-mic-btn')?.click();
  }
  // Alt+S = speak last response
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    document.getElementById('demo-speak-btn')?.click();
  }
  // Escape = close mobile nav
  if (e.key === 'Escape') {
    if (typeof closeMobileNav === 'function') closeMobileNav();
    window.speechSynthesis?.cancel();
  }
});

// ── 16. PREFERS-REDUCED-MOTION ─────────────────────────────
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[style*="animation"], .waveform-bar, .wave-ring, .hero-bg-blob, .float-card').forEach(el => {
    el.style.animation = 'none';
  });
}

// ── 17. VOICES PRELOAD ─────────────────────────────────────
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  window.speechSynthesis.getVoices(); // trigger load
}

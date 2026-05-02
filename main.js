/* ============================================================
   NAMITA SHASTRI v3.0 — Main JS
   js/main.js
   ============================================================ */

/* ── BOOT LOADER ────────────────────────────────────────────── */
const BOOT_MSGS = [
  'INITIALIZING SYSTEMS...',
  'LOADING NEURAL INTERFACE...',
  'SYNCING AI/ML MODULES...',
  'COMPILING SKILLS MATRIX...',
  'MOUNTING BACKEND SERVICES...',
  'QUANTUM HANDSHAKE...',
  'BOOT COMPLETE — WELCOME TO NS://'
];

(function bootLoader() {
  const statusEl = document.getElementById('loader-status');
  const loaderEl = document.getElementById('loader');
  let i = 0;
  const iv = setInterval(() => {
    i++;
    if (i < BOOT_MSGS.length) statusEl.textContent = BOOT_MSGS[i];
    if (i >= BOOT_MSGS.length - 1) {
      clearInterval(iv);
      setTimeout(() => {
        loaderEl.style.transition = 'opacity 0.6s ease';
        loaderEl.style.opacity = '0';
        setTimeout(() => { loaderEl.style.display = 'none'; initAll(); }, 650);
      }, 400);
    }
  }, 340);
})();

/* ── INIT ALL ───────────────────────────────────────────────── */
function initAll() {
  initCursor();
  initNavbar();
  initHamburger();
  initTypewriter();
  initHeroCounters();
  initSkillBars();
  initScrollReveal();
  initTiltCards();
  initTerminal();
  initParallax();
  initGlitch();
  initScanSweep();
  initHoverPulse();
}

/* ── CUSTOM CURSOR ──────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;
  let tx = -100, ty = -100, cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';
  });
  (function trailLoop() {
    cx += (tx - cx) * 0.13;
    cy += (ty - cy) * 0.13;
    trail.style.left = cx + 'px';
    trail.style.top  = cy + 'px';
    requestAnimationFrame(trailLoop);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,.glass-card,.stat-card,.otag,.tilt-card,.cert-card,input')) {
      cursor.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,.glass-card,.stat-card,.otag,.tilt-card,.cert-card,input')) {
      cursor.classList.remove('hover');
    }
  });
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActive();
  });
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-links').classList.remove('open');
    });
  });
  function updateActive() {
    let current = '';
    document.querySelectorAll('section[id]').forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
}

/* ── HAMBURGER ──────────────────────────────────────────────── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) links.classList.remove('open');
  });
}

/* ── TYPEWRITER ─────────────────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'CSE Student @ ITM SLS Baroda University',
    'AI/ML Explorer',
    'Backend Builder',
    'CodeOrbit Co-Head',
    'Tech Speaker',
    'Quantum Computing Enthusiast',
    'Future Systems Architect'
  ];
  let pi = 0, ci = 0, del = false;
  function tick() {
    const p = phrases[pi];
    if (!del) {
      el.textContent = p.substring(0, ++ci);
      if (ci >= p.length) { del = true; setTimeout(tick, 1600); return; }
      setTimeout(tick, 60);
    } else {
      el.textContent = p.substring(0, --ci);
      if (ci <= 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 380); return; }
      setTimeout(tick, 35);
    }
  }
  tick();
}

/* ── COUNTERS ───────────────────────────────────────────────── */
function initHeroCounters() {
  document.querySelectorAll('#hero .stat-value[data-target]').forEach(runCounter);
}
function runCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const isFloat = el.dataset.float === 'true';
  const steps   = 60;
  let cur       = 0;
  const inc     = target / steps;
  const iv = setInterval(() => {
    cur = Math.min(cur + inc, target);
    el.textContent = isFloat ? cur.toFixed(2) : Math.round(cur);
    if (cur >= target) clearInterval(iv);
  }, 1400 / steps);
}

/* ── SKILL BARS ─────────────────────────────────────────────── */
function initSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(f => {
    f.dataset.targetWidth = (f.dataset.w || '0') + '%';
    f.style.width = '0%';
  });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.skill-fill').forEach((f, i) => {
        setTimeout(() => { f.style.width = f.dataset.targetWidth; }, i * 85);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.skill-panel').forEach(p => obs.observe(p));
}

/* ── SCROLL REVEAL ──────────────────────────────────────────── */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  // Capture delays before observer modifies anything
  const delayMap = new Map();
  items.forEach(item => {
    const s = item.getAttribute('style') || '';
    const m = s.match(/animation-delay\s*:\s*([\d.]+)s/);
    delayMap.set(item, m ? parseFloat(m[1]) * 1000 : 0);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = delayMap.get(entry.target) || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
        // Run any achievement counters
        entry.target.querySelectorAll('[data-target]').forEach(el => {
          if (!el.closest('#hero')) runCounter(el);
        });
      }, delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -10px 0px' });

  items.forEach(item => obs.observe(item));
}

/* ── TILT CARDS ─────────────────────────────────────────────── */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rX = ((e.clientY - r.top)  / r.height - 0.5) * -10;
      const rY = ((e.clientX - r.left) / r.width  - 0.5) *  10;
      card.style.transform = `perspective(700px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* ── TERMINAL ───────────────────────────────────────────────── */
function initTerminal() {
  const input   = document.getElementById('term-input');
  const sendBtn = document.getElementById('term-send');
  const log     = document.getElementById('term-log');
  const body    = document.getElementById('term-body');
  if (!input || !sendBtn || !log || !body) return;

  const COMMANDS = {
    skills:       '[ DATA ] Skills: Java · Python · C++ · AI/ML · DSA · COA · Backend · REST APIs · Flask · SQL',
    certificates: '[ DATA ] Certs: Python ✓ | AI/ML ✓ | Web Dev ✓ | Leadership ✓ | Data Analytics ⟳ | Quantum ◎',
    leadership:   '[ DATA ] Co-Head @ CodeOrbit | Tech Speaker | Digital Marketing Lead | Mentor',
    goals:        '[ DATA ] Goals: AI Research → Backend Systems → Quantum Computing → Systems Architecture',
    github:       '[ LINK ] GitHub → https://github.com/namitashastri',
    linkedin:     '[ LINK ] LinkedIn → https://linkedin.com/in/namitashastri',
    about:        '[ DATA ] Namita Shastri — CSE Student | AI/ML Explorer | Backend Builder | 9.96 CPI | CodeOrbit Co-Head',
    help:         '[ HELP ] Commands: skills · certificates · leadership · goals · github · linkedin · about · clear',
    clear:        '__CLEAR__'
  };

  const FALLBACK = [
    '[ TX ] Message encoded & queued — namita@university.edu',
    '[ OK ] Transmission received. Namita will respond within 24 hrs.',
    '[ OK ] Signal confirmed. Connection established.',
    '[ INFO ] Open for internships, research & collaboration. Talk soon!',
    '[ OK ] NamitaOS: Thanks for reaching out! 🚀'
  ];
  let fbIdx = 0;

  function send() {
    const raw = input.value.trim();
    if (!raw) return;
    input.value = '';

    appendLine(`<span class="term-prompt">visitor@NS:~$</span><span style="color:#e0f4ff"> ${escHtml(raw)}</span>`, 'term-user-line');

    const key = raw.toLowerCase().trim();
    const res = COMMANDS[key];

    setTimeout(() => {
      if (res === '__CLEAR__') {
        log.innerHTML = '';
      } else if (res) {
        appendLine(res, 'term-response');
      } else {
        appendLine(FALLBACK[fbIdx++ % FALLBACK.length], 'term-response');
      }
      body.scrollTop = body.scrollHeight;
    }, 500);

    body.scrollTop = body.scrollHeight;
  }

  function appendLine(html, cls) {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    log.appendChild(d);
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── MOUSE PARALLAX (floating code) ────────────────────────── */
function initParallax() {
  document.addEventListener('mousemove', e => {
    const rx = (e.clientX / window.innerWidth  - 0.5) * 20;
    const ry = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelectorAll('.float-code').forEach((el, i) => {
      const f = i % 2 === 0 ? 1 : -1;
      el.style.transform = `translate(${rx * f * 0.3}px, ${ry * f * 0.3}px)`;
    });
  });
}

/* ── GLITCH PULSE ───────────────────────────────────────────── */
function initGlitch() {
  const el = document.querySelector('.hero-name.glitch');
  if (!el) return;
  setInterval(() => {
    if (Math.random() > 0.87) {
      el.style.textShadow = '2px 0 #00f5ff, -2px 0 #f0abfc';
      setTimeout(() => { el.style.textShadow = ''; }, 90);
    }
  }, 180);
}

/* ── SCAN SWEEP ─────────────────────────────────────────────── */
function initScanSweep() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('scan-sweep');
      setTimeout(() => el.classList.add('scanning'), 50);
      setTimeout(() => el.classList.remove('scanning'), 700);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.section-title').forEach(t => obs.observe(t));
}

/* ── HOVER PULSE (button charge effect) ────────────────────── */
function initHoverPulse() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = btn.classList.contains('btn-primary')
        ? '0 0 20px rgba(0,245,255,0.5), 0 0 40px rgba(0,245,255,0.2)'
        : btn.classList.contains('btn-secondary')
        ? '0 0 20px rgba(168,85,247,0.5)'
        : '0 0 15px rgba(224,244,255,0.2)';
    });
    btn.addEventListener('mouseleave', () => { btn.style.boxShadow = ''; });
  });

  // Card neon border trace on hover
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'border-color 0.2s, box-shadow 0.3s, transform 0.3s';
    });
  });
}
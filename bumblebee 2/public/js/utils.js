// ============================================
// BUMBLEBEE LOUNGE — Shared Utilities
// ============================================

// === CURSOR (desktop only) ===
export function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor || !ring) return;
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    setTimeout(() => {
      ring.style.left = e.clientX + 'px';
      ring.style.top  = e.clientY + 'px';
    }, 80);
  });
  document.querySelectorAll('a,button,select,input,textarea').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width='14px'; cursor.style.height='14px'; ring.style.width='52px'; ring.style.height='52px'; });
    el.addEventListener('mouseleave', () => { cursor.style.width='8px';  cursor.style.height='8px';  ring.style.width='36px'; ring.style.height='36px'; });
  });
}

// === NAVBAR SCROLL ===
export function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (!nav.classList.contains('solid')) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
}

// === MOBILE HAMBURGER ===
export function initHamburger() {
  const btn    = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  if (!btn || !drawer) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    drawer.classList.toggle('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  });
  // close on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// === SCROLL REVEAL ===
export function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => obs.observe(el));
}

// === TOAST ===
export function showToast(message, type = 'success', duration = 3500) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { if(toast.parentNode) toast.remove(); }, duration);
}

// === LANGUAGE ===
const LANG_KEY = 'bb_lang';
export function getLang() { return localStorage.getItem(LANG_KEY) || 'fr'; }

export function setLang(lang, translations) {
  localStorage.setItem(LANG_KEY, lang);
  document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-lang]').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  if (translations) applyTranslations(lang, translations);
}

export function applyTranslations(lang, translations) {
  const t = translations[lang] || translations['fr'];
  if (!t) return;
  for (const [id, val] of Object.entries(t)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  }
}

export function initLang(translations) {
  const lang = getLang();
  document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
  if (translations) applyTranslations(lang, translations);
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.addEventListener('click', () => setLang(btn.dataset.lang, translations));
  });
}

// === MODAL ===
export function openModal(id) { document.getElementById(id)?.classList.add('show'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }
export function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  });
}

// === SOUND (admin notifications) ===
export function playNotificationSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

// === DATE / TIME HELPERS ===
export function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-DZ', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}
export function formatTime(d) {
  return new Date(d).toLocaleTimeString('fr-DZ', { hour:'2-digit', minute:'2-digit' });
}
export function todayStr() { return new Date().toISOString().split('T')[0]; }

// === NAVBAR HTML (reusable snippet) ===
export function renderNavbar(activePage = '') {
  const pages = [
    ['home','Accueil','home.html'],
    ['menu','Menu','menu.html'],
    ['hookah','Chicha','hookah.html'],
    ['reservation','Réservation','reservation.html'],
    ['contact','Contact','contact.html'],
  ];
  const links = pages.map(([key,label,href]) =>
    `<li><a href="${href}" ${activePage===key?'class="active"':''}>${label}</a></li>`
  ).join('');
  const drawerLinks = pages.map(([key,label,href]) =>
    `<a href="${href}" ${activePage===key?'class="active"':''}>${label}</a>`
  ).join('');
  return `
  <div class="cursor" id="cursor"></div>
  <div class="cursor-ring" id="cursorRing"></div>
  <nav class="navbar solid" id="navbar">
    <a href="home.html" class="nav-logo">Bumble<span>bee</span></a>
    <ul class="nav-links">${links}</ul>
    <div class="nav-right">
      <div class="lang-nav">
        <button data-lang="fr">FR</button>
        <button data-lang="en">EN</button>
        <button data-lang="ar">AR</button>
      </div>
      <a href="order.html" class="nav-cta">Commander</a>
    </div>
    <button class="nav-hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="mobile-drawer" id="mobileDrawer">
    ${drawerLinks}
    <a href="order.html" class="drawer-cta">Commander</a>
    <div class="drawer-langs">
      <button data-lang="fr">FR</button>
      <button data-lang="en">EN</button>
      <button data-lang="ar">AR</button>
    </div>
  </div>`;
}

// === FOOTER HTML ===
export function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-logo">Bumble<span>bee</span></div>
    <div class="footer-copy">© 2025 Bumblebee Lounge · Djelfa, Algérie</div>
    <div class="footer-links">
      <a href="https://wa.me/213778097833" target="_blank">WhatsApp</a>
      <a href="contact.html">Contact</a>
      <a href="../admin/login.html">Admin</a>
    </div>
  </footer>`;
}

// === INIT ALL (call once per page) ===
export function initPage(activePage = '', translations = null) {
  initCursor();
  initNavbar();
  initHamburger();
  initReveal();
  initModals();
  if (translations) initLang(translations);
}
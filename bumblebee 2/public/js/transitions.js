// ============================================
// BUMBLEBEE LOUNGE — Page Transitions & Parallax
// ============================================

// === PAGE TRANSITION OVERLAY ===
function createOverlay() {
  if (document.getElementById('bb-transition')) return;
  const overlay = document.createElement('div');
  overlay.id = 'bb-transition';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: #050505;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
    display: flex; align-items: center; justify-content: center;
  `;
  overlay.innerHTML = `
    <div style="
      font-family: 'Cormorant Garamond', serif;
      font-size: 2rem; font-weight: 300;
      letter-spacing: 0.4em; text-transform: uppercase;
      color: #c9a84c; opacity: 0;
      transition: opacity 0.3s ease;
    " id="bb-transition-logo">Bumble<em style="font-style:italic">bee</em></div>
  `;
  document.body.appendChild(overlay);
}

// === TRANSITION OUT (leave page) ===
function transitionOut(href) {
  createOverlay();
  const overlay = document.getElementById('bb-transition');
  const logo = document.getElementById('bb-transition-logo');
  overlay.style.pointerEvents = 'all';
  overlay.style.opacity = '1';
  setTimeout(() => { if (logo) logo.style.opacity = '1'; }, 150);
  setTimeout(() => { window.location.href = href; }, 500);
}

// === TRANSITION IN (enter page) ===
function transitionIn() {
  createOverlay();
  const overlay = document.getElementById('bb-transition');
  const logo = document.getElementById('bb-transition-logo');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'all';
  if (logo) logo.style.opacity = '1';
  requestAnimationFrame(() => {
    setTimeout(() => {
      overlay.style.opacity = '0';
      if (logo) logo.style.opacity = '0';
      setTimeout(() => {
        overlay.style.pointerEvents = 'none';
      }, 400);
    }, 200);
  });
}

// === INTERCEPT ALL LINKS ===
export function initTransitions() {
  transitionIn();
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('https://wa.me')) return;
    if (link.target === '_blank') return;
    if (href.startsWith('#')) return;
    e.preventDefault();
    transitionOut(href);
  });
}

// === PARALLAX BACKGROUND ===
export function initParallax() {
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}

// === FLOATING PARTICLES (gold dust) ===
export function initParticles(canvasId = 'particles') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H + H;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.y < -10 || this.life > this.maxLife) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) {
    const p = new Particle();
    p.y = Math.random() * H;
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// === SMOKE EFFECT (for landing page) ===
export function initSmoke(canvasId = 'smoke') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, puffs = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Puff {
    constructor() { this.reset(); }
    reset() {
      this.x = W * 0.5 + (Math.random() - 0.5) * 100;
      this.y = H * 0.75 + Math.random() * 40;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.7 + 0.3);
      this.r = Math.random() * 50 + 25;
      this.life = 0;
      this.maxLife = Math.random() * 180 + 120;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.life++; this.r += 0.12;
      if (this.life > this.maxLife) this.reset();
    }
    draw() {
      const p = this.life / this.maxLife;
      const alpha = (p < 0.2 ? p / 0.2 : p < 0.8 ? 1 : (1 - p) / 0.2) * 0.1;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, `rgba(201,168,76,${alpha})`);
      g.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 50; i++) {
    const p = new Puff();
    p.life = Math.random() * p.maxLife;
    puffs.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    puffs.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}
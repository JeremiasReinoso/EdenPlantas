(function () {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────── */
  const CFG = { minDuration: 3000, fadeDelay: 700 };

  /* ── ESTADO ───────────────────────────────────────── */
  let cur = 0, tar = 0, raf = null;
  let pageLoaded = false, animDone = false;
  const t0 = Date.now();

  /* ── HELPERS ──────────────────────────────────────── */

/* ── PROGRESO ─────────────────────────────────────── */
  function setPct(p) {
    cur = Math.min(Math.round(p), 100);
    const bar = document.getElementById('loaderBar');
    const pct = document.getElementById('loaderPct');
    if (bar) bar.style.width = cur + '%';
    if (pct) pct.textContent = cur + '%';
  }
  function animPct() {
    if (cur < tar) {
      setPct(cur + Math.max(0.3, (tar - cur) * 0.06));
      raf = requestAnimationFrame(animPct);
    }
  }
  function advanceTo(p) {
    tar = Math.min(p, 100);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(animPct);
  }

  const milestones = [5, 15, 28, 42, 55, 68, 80, 88, 94];
  let mi = 0;
  function tick() {
    if (mi >= milestones.length) return;
    advanceTo(milestones[mi++]);
    if (mi < milestones.length) setTimeout(tick, 180 + Math.random() * 150);
  }

  /* ── CIERRE ───────────────────────────────────────── */
  function finish() {
    if (!pageLoaded || !animDone) return;
    const rem = Math.max(0, CFG.minDuration - (Date.now() - t0));
    setTimeout(() => {
      advanceTo(100);
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if (!loader) return;
        loader.classList.add('is-done');
        setTimeout(() => loader.remove(), 1050);
      }, CFG.fadeDelay);
    }, rem);
  }

  window.addEventListener('load', () => { pageLoaded = true; finish(); });
  setTimeout(() => { pageLoaded = true; animDone = true; finish(); }, 9500);

  /* ════════════════════════════════════════════════════
     CONSTRUCCIÓN DEL HTML INTERNO DEL LOADER
  ════════════════════════════════════════════════════ */
  function buildHTML() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    loader.innerHTML = '';

    const center = document.createElement('div');
    center.className = 'ldr-center';
    center.innerHTML = `
      <div class="ldr-emblem">
        <div class="ldr-glow-ring"></div>
        <img
          class="ldr-logo-img"
          src="Logo Eden Plantas.png"
          alt="Eden Plantas"
          draggable="false"
        />
      </div>
      <div class="ldr-brand">Eden Plantas</div>
      <div class="ldr-tagline">Vivero · El Bolsón</div>
      <div class="ldr-bar-wrap">
        <div class="ldr-bar-track">
          <div id="loaderBar"></div>
        </div>
        <span id="loaderPct">0%</span>
      </div>
    `;
    loader.appendChild(center);
  }

  /* ── INIT ─────────────────────────────────────────── */
  buildHTML();
  setPct(0);
  setTimeout(tick, 280);
  animDone = true;

})();
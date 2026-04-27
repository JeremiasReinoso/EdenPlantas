(function () {
  'use strict';

  /* ── CONFIG ───────────────────────────────────────── */
  const CFG = { minDuration: 3000, fadeDelay: 700 };

  /* ── ESTADO ───────────────────────────────────────── */
  let cur = 0, tar = 0, raf = null;
  let pageLoaded = false, animDone = false;
  const t0 = Date.now();

  /* ── HELPERS ──────────────────────────────────────── */
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }
  function cssVar(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

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
      setPct(cur + Math.max(0.4, (tar - cur) * 0.07));
      raf = requestAnimationFrame(animPct);
    }
  }
  function advanceTo(p) {
    tar = Math.min(p, 100);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(animPct);
  }

  const milestones = [10, 22, 35, 50, 63, 76, 87, 92];
  let mi = 0;
  function tick() {
    if (mi >= milestones.length) return;
    advanceTo(milestones[mi++]);
    if (mi < milestones.length) setTimeout(tick, 230 + Math.random() * 220);
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
     CONSTRUCCIÓN DE LA ENREDADERA SVG
     Dibuja tallos, ramas, hojas y flores que crecen
     desde los bordes y esquinas cubriendo la pantalla.
  ════════════════════════════════════════════════════ */
  function buildVine() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const vc  = cssVar('--vc')  || '#3dda66';
    const vd  = cssVar('--vd')  || '#1a6b35';
    const ll  = cssVar('--ll')  || '#9fffc0';
    const fc  = cssVar('--fc')  || '#f9c74f';
    const fce = cssVar('--fce') || '#f77f00';

    /* ── Crear SVG ── */
    const svg = svgEl('svg', {
      id: 'vine-svg',
      viewBox: `0 0 ${W} ${H}`,
      preserveAspectRatio: 'xMidYMid slice',
    });
    loader.prepend(svg);

    /* ── Anima un path con stroke-dashoffset ── */
    function drawPath(path, len, dur, delay) {
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.4,0,0.15,1)`;
        path.style.strokeDashoffset = 0;
      }, delay);
    }

    /* ── Tallo curvo genérico ── */
    function stem(d, w, delay, dur, opacity) {
      const p = svgEl('path', {
        d, class:'vp',
        'stroke-width': w,
        opacity: opacity || 1,
      });
      svg.appendChild(p);
      drawPath(p, 2200, dur || 2000, delay);
      return p;
    }

    /* ── Hoja ── */
    function leaf(cx, cy, angle, size, flip, delay) {
      const g = svgEl('g', {
        class: 'vl',
        transform: `translate(${cx},${cy}) rotate(${angle}) scale(${flip?-1:1},1)`,
      });
      const s = size;
      // cuerpo
      const body = svgEl('path', {
        d: `M0,0 C${s*0.25},${-s*0.75} ${s*1.05},${-s*0.65} ${s*1.35},0 C${s*1.05},${s*0.65} ${s*0.25},${s*0.75} 0,0`,
        fill: vc, stroke: vd, 'stroke-width':'0.8', opacity:'0.92',
      });
      // vena
      const vein = svgEl('path', {
        d:`M0,0 L${s*1.1},0`, fill:'none', stroke:vd, 'stroke-width':'0.7', opacity:'0.55',
      });
      // brillo
      const shine = svgEl('ellipse', {
        cx:s*0.35, cy:-s*0.24, rx:s*0.2, ry:s*0.11, fill:ll, opacity:'0.38',
      });
      g.appendChild(body); g.appendChild(vein); g.appendChild(shine);
      svg.appendChild(g);
      setTimeout(() => g.classList.add('on'), delay);
      return g;
    }

    /* ── Flor ── */
    function flower(cx, cy, size, delay, isLast) {
      const g = svgEl('g', { class:'vf', transform:`translate(${cx},${cy})` });
      if (isLast) g.id = 'last-flower';
      const petals = 7;
      for (let i = 0; i < petals; i++) {
        const a = (360/petals)*i * Math.PI/180;
        const px = Math.cos(a)*size*1.05, py = Math.sin(a)*size*1.05;
        const pe = svgEl('ellipse', {
          cx:px, cy:py, rx:size*0.62, ry:size*0.38,
          transform:`rotate(${(360/petals)*i},${px},${py})`,
          fill:fc, opacity:'0.93',
        });
        g.appendChild(pe);
      }
      const c1 = svgEl('circle', { cx:0, cy:0, r:size*0.5, fill:fce });
      const c2 = svgEl('circle', { cx:-size*0.16, cy:-size*0.16, r:size*0.17, fill:'#ffe066', opacity:'0.7' });
      g.appendChild(c1); g.appendChild(c2);
      svg.appendChild(g);
      setTimeout(() => {
        g.classList.add('on');
        if (isLast) {
          g.addEventListener('animationend', () => {
            animDone = true;
            finish();
          }, { once: true });
        }
      }, delay);
      return g;
    }

    /* ── Zarcillo ── */
    function curl(cx, cy, delay) {
      const p = svgEl('path', {
        class:'vz',
        d:`M${cx},${cy} C${cx+14},${cy-22} ${cx+28},${cy-10} ${cx+18},${cy+8} C${cx+8},${cy+22} ${cx},${cy+12} ${cx+7},${cy+2}`,
        'stroke-width':'1.4',
        'stroke-dasharray':'120',
        'stroke-dashoffset':'120',
      });
      svg.appendChild(p);
      setTimeout(() => {
        p.classList.add('on');
        p.style.transition = 'stroke-dashoffset 0.7s ease';
        p.style.strokeDashoffset = '0';
      }, delay);
    }

    /* ════════════════════════════════════════════════
       TALLOS PRINCIPALES
       Crecen desde las cuatro esquinas y el centro
    ════════════════════════════════════════════════ */

    // Esquina inferior-izquierda → sube y se curva hacia el centro
    stem(`M-5,${H+5} C40,${H*0.88} 70,${H*0.72} 95,${H*0.55}
          C118,${H*0.40} 80,${H*0.25} 110,${H*0.12}
          C130,${H*0.04} 170,0 200,-5`,
      4.5, 100, 2400);

    // Esquina inferior-derecha → sube
    stem(`M${W+5},${H+5} C${W-40},${H*0.88} ${W-70},${H*0.72} ${W-95},${H*0.55}
          C${W-118},${H*0.40} ${W-80},${H*0.25} ${W-110},${H*0.12}
          C${W-130},${H*0.04} ${W-170},0 ${W-200},-5`,
      4.5, 200, 2400);

    // Centro inferior → sube recto con ondas
    stem(`M${W/2},${H+5} C${W/2-20},${H*0.8} ${W/2+20},${H*0.6} ${W/2},${H*0.42}
          C${W/2-15},${H*0.28} ${W/2+10},${H*0.15} ${W/2},-5`,
      3, 400, 2200, 0.55);

    // Esquina superior-izquierda → baja
    stem(`M-5,-5 C50,${H*0.08} 40,${H*0.22} 70,${H*0.35}
          C95,${H*0.47} 60,${H*0.60} 85,${H*0.72}`,
      3, 600, 1800, 0.7);

    // Esquina superior-derecha → baja
    stem(`M${W+5},-5 C${W-50},${H*0.08} ${W-40},${H*0.22} ${W-70},${H*0.35}
          C${W-95},${H*0.47} ${W-60},${H*0.60} ${W-85},${H*0.72}`,
      3, 700, 1800, 0.7);

    /* ════════════════════════════════════════════════
       RAMAS LATERALES del tallo izquierdo
    ════════════════════════════════════════════════ */
    const leftBranches = [
      { cx:88,  cy:H*0.52, dx:55,  dy:-60, delay:900  },
      { cx:97,  cy:H*0.38, dx:-60, dy:-50, delay:1100 },
      { cx:106, cy:H*0.24, dx:65,  dy:-45, delay:1300 },
      { cx:80,  cy:H*0.64, dx:-55, dy:-55, delay:750  },
      { cx:115, cy:H*0.14, dx:-50, dy:-38, delay:1480 },
    ];
    leftBranches.forEach(({cx,cy,dx,dy,delay}, i) => {
      const ex = cx+dx, ey = cy+dy;
      stem(`M${cx},${cy} C${cx+dx*0.35},${cy+dy*0.25} ${cx+dx*0.75},${cy+dy*0.7} ${ex},${ey}`,
        2, delay, 550);
      const ang = Math.atan2(dy,dx)*180/Math.PI;
      leaf(ex, ey, ang-28, 17+rnd(-2,4), false, delay+520);
      leaf(ex, ey, ang+32, 14+rnd(-2,3), true,  delay+660);
      if (i % 2 === 0) flower(ex+(dx>0?22:-22), ey-16, 8+rnd(0,3), delay+900, false);
      curl(ex-10, ey-10, delay+700);
    });

    /* ════════════════════════════════════════════════
       RAMAS LATERALES del tallo derecho
    ════════════════════════════════════════════════ */
    const rightBranches = [
      { cx:W-88,  cy:H*0.52, dx:-55, dy:-60, delay:1000 },
      { cx:W-97,  cy:H*0.38, dx:60,  dy:-50, delay:1200 },
      { cx:W-106, cy:H*0.24, dx:-65, dy:-45, delay:1400 },
      { cx:W-80,  cy:H*0.64, dx:55,  dy:-55, delay:820  },
      { cx:W-115, cy:H*0.14, dx:50,  dy:-38, delay:1560 },
    ];
    rightBranches.forEach(({cx,cy,dx,dy,delay}, i) => {
      const ex = cx+dx, ey = cy+dy;
      stem(`M${cx},${cy} C${cx+dx*0.35},${cy+dy*0.25} ${cx+dx*0.75},${cy+dy*0.7} ${ex},${ey}`,
        2, delay, 550);
      const ang = Math.atan2(dy,dx)*180/Math.PI;
      leaf(ex, ey, ang-28, 17+rnd(-2,4), false, delay+520);
      leaf(ex, ey, ang+32, 14+rnd(-2,3), true,  delay+660);
      if (i % 2 === 0) flower(ex+(dx>0?22:-22), ey-16, 8+rnd(0,3), delay+900, false);
      curl(ex+10, ey-10, delay+700);
    });

    /* ════════════════════════════════════════════════
       RAMAS HORIZONTALES que atraviesan la pantalla
    ════════════════════════════════════════════════ */
    [
      { y:H*0.78, delay:1650 },
      { y:H*0.52, delay:1850 },
      { y:H*0.28, delay:2050 },
    ].forEach(({y, delay}) => {
      // rama izq→centro
      stem(`M0,${y} C${W*0.15},${y-40} ${W*0.3},${y+30} ${W*0.48},${y}`,
        1.8, delay, 900, 0.65);
      // rama der→centro
      stem(`M${W},${y} C${W*0.85},${y-40} ${W*0.7},${y+30} ${W*0.52},${y}`,
        1.8, delay+80, 900, 0.65);

      // hojas colgantes a lo largo de la rama horizontal
      for (let i = 1; i < 5; i++) {
        const lx = W * (0.1 + i * 0.18);
        const hang = svgEl('path', {
          class:'vp', 'stroke-width':'1.2', opacity:'0.65',
          d:`M${lx},${y} C${lx+5},${y+18} ${lx-4},${y+34} ${lx+8},${y+48}`,
        });
        svg.appendChild(hang);
        drawPath(hang, 150, 400, delay + 600 + i*70);
        leaf(lx+8, y+48, 70+rnd(-15,15), 12+rnd(-2,3), i%2===0, delay+950+i*70);
      }
    });

    /* ════════════════════════════════════════════════
       FLORES GRANDES en posiciones clave
    ════════════════════════════════════════════════ */
    flower(170,  H*0.10, 11, 1900, false);
    flower(W-165,H*0.10, 10, 2000, false);
    flower(110,  H*0.76, 10, 1600, false);
    flower(W-110,H*0.76, 10, 1700, false);

    /* Última flor — su animationend dispara el cierre */
    flower(W/2, H*0.5-80, 13, 2400, true);

    /* ════════════════════════════════════════════════
       PARTÍCULAS FLOTANTES (spores)
    ════════════════════════════════════════════════ */
    const sporeData = [
      {l:'7%', w:3,dur:7,del:0.4},{l:'19%',w:2,dur:9,del:1.1},
      {l:'31%',w:3,dur:6,del:0.7},{l:'46%',w:2,dur:11,del:0.2},
      {l:'57%',w:3,dur:8,del:1.7},{l:'70%',w:2,dur:10,del:0.5},
      {l:'83%',w:3,dur:7,del:1.3},{l:'91%',w:2,dur:9,del:0.3},
      {l:'24%',w:2,dur:13,del:2 },{l:'75%',w:3,dur:11,del:0.8},
      {l:'50%',w:2,dur:8, del:3 },{l:'63%',w:3,dur:10,del:1.4},
    ];
    sporeData.forEach(({l,w,dur,del}) => {
      const s = document.createElement('div');
      s.className = 'spore';
      s.style.cssText = `left:${l};width:${w}px;height:${w}px;
        bottom:-10px;
        --sx:${rnd(-18,22)}px;
        animation-duration:${dur}s;
        animation-delay:${del}s;`;
      loader.appendChild(s);
    });

    /* Fallback: si animationend no dispara en 4s, cierra igual */
    setTimeout(() => { animDone = true; finish(); }, 4200);
  }

  /* ════════════════════════════════════════════════════
     CONSTRUCCIÓN DEL HTML INTERNO DEL LOADER
  ════════════════════════════════════════════════════ */
  function buildHTML() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // Vaciar contenido anterior (vine-wrap, loader-text-wrap, etc.)
    loader.innerHTML = '';

    // Centro
    const center = document.createElement('div');
    center.className = 'ldr-center';
    center.innerHTML = `
      <div class="ldr-emblem">
        <svg class="ldr-plant-svg" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Raíces -->
          <path d="M29 52 C24 54 19 56 14 54" stroke="var(--vd)" stroke-width="2" stroke-linecap="round"/>
          <path d="M29 52 C34 54 39 56 44 54" stroke="var(--vd)" stroke-width="2" stroke-linecap="round"/>
          <path d="M29 52 L29 58"             stroke="var(--vd)" stroke-width="2" stroke-linecap="round"/>
          <!-- Tallo -->
          <path d="M29 52 C29 52 29 34 29 22" stroke="var(--vc)" stroke-width="2.8" stroke-linecap="round"/>
          <!-- Hoja grande izquierda -->
          <path d="M29 34 C22 27 11 25 8 18 C13 13 24 18 29 27" fill="var(--vc)" opacity="0.95"/>
          <!-- Vena izquierda -->
          <path d="M29 30 L12 20" stroke="var(--vd)" stroke-width="0.9" opacity="0.6" stroke-linecap="round"/>
          <!-- Hoja grande derecha -->
          <path d="M29 28 C36 21 47 19 50 12 C45 7 34 12 29 21" fill="var(--vc)" opacity="0.78"/>
          <!-- Vena derecha -->
          <path d="M29 25 L46 14" stroke="var(--vd)" stroke-width="0.9" opacity="0.5" stroke-linecap="round"/>
          <!-- Hoja pequeña izquierda -->
          <path d="M29 22 C23 16 15 15 12 9 C17 6 25 10 29 17" fill="var(--ll)" opacity="0.65"/>
          <!-- Flor -->
          <circle cx="29" cy="12" r="5"   fill="#f9c74f"/>
          <circle cx="29" cy="12" r="2.8" fill="#f77f00"/>
          <circle cx="27.5" cy="10.5" r="1.2" fill="#ffe066" opacity="0.7"/>
          <!-- Pétalos -->
          <ellipse cx="29" cy="6.5" rx="2.2" ry="1.5" fill="#f9c74f" opacity="0.85"/>
          <ellipse cx="29" cy="17.5" rx="2.2" ry="1.5" fill="#f9c74f" opacity="0.85"/>
          <ellipse cx="23.5" cy="12" rx="1.5" ry="2.2" fill="#f9c74f" opacity="0.85"/>
          <ellipse cx="34.5" cy="12" rx="1.5" ry="2.2" fill="#f9c74f" opacity="0.85"/>
        </svg>
      </div>
      <div class="ldr-brand">Eden Plantas</div>
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
  document.addEventListener('DOMContentLoaded', function () {
    buildHTML();
    setPct(0);
    setTimeout(buildVine, 60);
    setTimeout(tick, 280);
  });

})();
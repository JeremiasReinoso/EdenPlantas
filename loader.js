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

    const svg = svgEl('svg', {
      id: 'vine-svg',
      viewBox: `0 0 ${W} ${H}`,
      preserveAspectRatio: 'xMidYMid slice',
    });
    loader.prepend(svg);

    function drawPath(path, len, dur, delay) {
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.4,0,0.15,1)`;
        path.style.strokeDashoffset = 0;
      }, delay);
    }

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

    function leaf(cx, cy, angle, size, flip, delay) {
      const g = svgEl('g', {
        class: 'vl',
        transform: `translate(${cx},${cy}) rotate(${angle}) scale(${flip?-1:1},1)`,
      });
      const s = size;
      const body = svgEl('path', {
        d: `M0,0 C${s*0.25},${-s*0.75} ${s*1.05},${-s*0.65} ${s*1.35},0 C${s*1.05},${s*0.65} ${s*0.25},${s*0.75} 0,0`,
        fill: vc, stroke: vd, 'stroke-width':'0.8', opacity:'0.92',
      });
      const vein = svgEl('path', {
        d:`M0,0 L${s*1.1},0`, fill:'none', stroke:vd, 'stroke-width':'0.7', opacity:'0.55',
      });
      const shine = svgEl('ellipse', {
        cx:s*0.35, cy:-s*0.24, rx:s*0.2, ry:s*0.11, fill:ll, opacity:'0.38',
      });
      g.appendChild(body); g.appendChild(vein); g.appendChild(shine);
      svg.appendChild(g);
      setTimeout(() => g.classList.add('on'), delay);
      return g;
    }

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

    stem(`M-5,${H+5} C40,${H*0.88} 70,${H*0.72} 95,${H*0.55}
          C118,${H*0.40} 80,${H*0.25} 110,${H*0.12}
          C130,${H*0.04} 170,0 200,-5`,
      4.5, 100, 2400);

    stem(`M${W+5},${H+5} C${W-40},${H*0.88} ${W-70},${H*0.72} ${W-95},${H*0.55}
          C${W-118},${H*0.40} ${W-80},${H*0.25} ${W-110},${H*0.12}
          C${W-130},${H*0.04} ${W-170},0 ${W-200},-5`,
      4.5, 200, 2400);

    stem(`M${W/2},${H+5} C${W/2-20},${H*0.8} ${W/2+20},${H*0.6} ${W/2},${H*0.42}
          C${W/2-15},${H*0.28} ${W/2+10},${H*0.15} ${W/2},-5`,
      3, 400, 2200, 0.55);

    stem(`M-5,-5 C50,${H*0.08} 40,${H*0.22} 70,${H*0.35}
          C95,${H*0.47} 60,${H*0.60} 85,${H*0.72}`,
      3, 600, 1800, 0.7);

    stem(`M${W+5},-5 C${W-50},${H*0.08} ${W-40},${H*0.22} ${W-70},${H*0.35}
          C${W-95},${H*0.47} ${W-60},${H*0.60} ${W-85},${H*0.72}`,
      3, 700, 1800, 0.7);

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

    [
      { y:H*0.78, delay:1650 },
      { y:H*0.52, delay:1850 },
      { y:H*0.28, delay:2050 },
    ].forEach(({y, delay}) => {
      stem(`M0,${y} C${W*0.15},${y-40} ${W*0.3},${y+30} ${W*0.48},${y}`,
        1.8, delay, 900, 0.65);
      stem(`M${W},${y} C${W*0.85},${y-40} ${W*0.7},${y+30} ${W*0.52},${y}`,
        1.8, delay+80, 900, 0.65);

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

    flower(170,  H*0.10, 11, 1900, false);
    flower(W-165,H*0.10, 10, 2000, false);
    flower(110,  H*0.76, 10, 1600, false);
    flower(W-110,H*0.76, 10, 1700, false);

    flower(W/2, H*0.5-80, 13, 2400, true);

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

    setTimeout(() => { animDone = true; finish(); }, 4200);
  }

  /* ════════════════════════════════════════════════════
     CONSTRUCCIÓN DEL HTML INTERNO DEL LOADER
     — Ahora usa la imagen real del logo —
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
  setTimeout(buildVine, 60);
  setTimeout(tick, 280);

})();
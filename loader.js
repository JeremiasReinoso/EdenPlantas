(function () {

  /* ── CONFIGURACIÓN ────────────────────────────────── */
  const CONFIG = {
    minDuration:  2600,   // ms mínimo visible (para ver la animación completa)
    fadeDelay:    500,    // ms extra antes de desvanecer (post bloom final)
  };

  /* ── REFERENCIAS AL DOM ───────────────────────────── */
  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPct = document.getElementById('loaderPct');

  if (!loader || !loaderBar || !loaderPct) return;

  /* ── ESTADO ───────────────────────────────────────── */
  let currentProgress = 0;
  let pageLoaded      = false;
  let animationDone   = false;
  let startTime       = Date.now();
  let rafId           = null;
  let targetProgress  = 0;

  /* ── ACTUALIZAR BARRA Y PORCENTAJE ───────────────── */
  function setProgress(pct) {
    currentProgress = Math.min(Math.round(pct), 100);
    loaderBar.style.width = currentProgress + '%';
    loaderPct.textContent = currentProgress + '%';
  }

  /* ── ANIMACIÓN SUAVE CON RAF ─────────────────────── */
  function animateToTarget() {
    if (currentProgress < targetProgress) {
      const diff = targetProgress - currentProgress;
      const step = Math.max(0.5, diff * 0.05);
      setProgress(currentProgress + step);
      rafId = requestAnimationFrame(animateToTarget);
    } else {
      cancelAnimationFrame(rafId);
    }
  }

  function advanceTo(pct) {
    targetProgress = Math.min(pct, 100);
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animateToTarget);
  }

  /* ── SIMULAR PROGRESO GRADUAL ────────────────────── */
  const milestones = [15, 28, 42, 58, 72, 85, 90];
  let mIndex = 0;

  function tick() {
    if (mIndex >= milestones.length) return;
    advanceTo(milestones[mIndex]);
    mIndex++;
    if (mIndex < milestones.length) {
      setTimeout(tick, 200 + Math.random() * 250);
    }
  }

  /* ── CERRAR EL LOADER ─────────────────────────────── */
  function finishLoading() {
    if (!pageLoaded || !animationDone) return;

    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, CONFIG.minDuration - elapsed);

    setTimeout(() => {
      advanceTo(100);

      setTimeout(() => {
        loader.classList.add('is-done');

        setTimeout(() => {
          loader.remove();
          // Mostrar el body (que puede estar oculto con opacity)
          document.body.style.opacity = '1';
          document.body.style.visibility = 'visible';
        }, 800);

      }, CONFIG.fadeDelay);

    }, remaining);
  }

  /* ── PÁGINA CARGADA ──────────────────────────────── */
  window.addEventListener('load', function () {
    pageLoaded = true;
    finishLoading();
  });

  /* ── ANIMACIÓN CSS TERMINADA ─────────────────────── */
  const lastFlower = loader.querySelector('.flower-c');

  if (lastFlower) {
    lastFlower.addEventListener('animationend', function () {
      animationDone = true;
      finishLoading();
    }, { once: true });
  } else {
    setTimeout(() => {
      animationDone = true;
      finishLoading();
    }, CONFIG.minDuration);
  }

  /* ── FALLBACK DE SEGURIDAD ───────────────────────── */
  setTimeout(() => {
    pageLoaded    = true;
    animationDone = true;
    finishLoading();
  }, 8000);

  /* ── INICIAR PROGRESO ────────────────────────────── */
  setProgress(0);
  setTimeout(tick, 300);

})();
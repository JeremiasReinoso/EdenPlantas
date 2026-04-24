/* ════════════════════════════════════════════════════
   loader.js — Lógica de la pantalla de carga
   ════════════════════════════════════════════════════
   Cómo funciona:
   1. Simula progreso (o usa window.onload como trigger)
   2. Actualiza la barra y el porcentaje en pantalla
   3. Al llegar al 100%, espera que la animación termine
      y luego desvanece el loader mostrando el contenido
   ════════════════════════════════════════════════════ */

(function () {

  /* ── CONFIGURACIÓN ────────────────────────────────
     Podés cambiar estas variables para adaptar el loader
  ─────────────────────────────────────────────────── */
  const CONFIG = {
    minDuration:    2400,   // ms mínimo que se muestra el loader (para ver la animación)
    progressSteps:  18,     // cantidad de pasos de la barra de progreso
    stepInterval:   110,    // ms entre cada paso de progreso (aprox)
    fadeDelay:      400,    // ms extra de espera antes de desvanecer (contempla el bloom final)
  };

  /* ── REFERENCIAS AL DOM ──────────────────────────── */
  const loader      = document.getElementById('loader');
  const loaderBar   = document.getElementById('loaderBar');
  const loaderPct   = document.getElementById('loaderPct');
  const mainContent = document.getElementById('mainContent');

  if (!loader || !loaderBar || !loaderPct || !mainContent) return;

  /* ── ESTADO INTERNO ──────────────────────────────── */
  let currentProgress = 0;   // 0–100
  let pageLoaded      = false;
  let animationDone   = false;
  let startTime       = Date.now();

  /* ── ACTUALIZAR BARRA Y PORCENTAJE ───────────────── */
  function setProgress(pct) {
    currentProgress = Math.min(Math.round(pct), 100);
    loaderBar.style.width  = currentProgress + '%';
    loaderPct.textContent  = currentProgress + '%';
  }

  /* ── AVANZAR LA BARRA GRADUALMENTE ──────────────────
     Incrementa en pasos no uniformes para que parezca
     real (rápido al principio, lento al final).
  ─────────────────────────────────────────────────── */
  let stepCount = 0;

  function advanceProgress() {
    if (currentProgress >= 90) return;   // el último 10% se reserva para window.onload

    // Pasos con velocidad variable: rápido, luego se frena
    const speed = stepCount < 6 ? 7 : stepCount < 12 ? 4 : 2;
    setProgress(currentProgress + speed);
    stepCount++;

    if (currentProgress < 90) {
      setTimeout(advanceProgress, CONFIG.stepInterval + Math.random() * 60);
    }
  }

  /* ── FINALIZAR CARGA ─────────────────────────────── */
  function finishLoading() {
    if (!pageLoaded || !animationDone) return;   // esperamos ambas condiciones

    // Aseguramos que el tiempo mínimo de visualización se cumpla
    const elapsed     = Date.now() - startTime;
    const remaining   = Math.max(0, CONFIG.minDuration - elapsed);

    setTimeout(() => {
      // Completar barra al 100%
      setProgress(100);

      // Pequeña pausa para que se vea el 100% y el bloom final de flores
      setTimeout(() => {
        // Desvanecer el loader
        loader.classList.add('is-done');

        // Después de la transición CSS (0.75s), ocultar del DOM y mostrar contenido
        setTimeout(() => {
          loader.remove();
          mainContent.removeAttribute('hidden');
        }, 800);

      }, CONFIG.fadeDelay);

    }, remaining);
  }

  /* ── LISTENER: PÁGINA CARGADA ────────────────────── */
  window.addEventListener('load', function () {
    pageLoaded = true;
    setProgress(100);   // llevamos la barra al 100% inmediatamente
    finishLoading();
  });

  /* ── LISTENER: ANIMACIÓN CSS TERMINADA ───────────────
     Esperamos a que el último flower bloom termine
     (aprox 2s de delay + 0.55s de duración = ~2.55s)
  ─────────────────────────────────────────────────── */
  const lastFlower = loader.querySelector('.flower-c');

  if (lastFlower) {
    lastFlower.addEventListener('animationend', function () {
      animationDone = true;
      finishLoading();
    }, { once: true });
  } else {
    // Fallback si no encuentra el elemento
    setTimeout(() => {
      animationDone = true;
      finishLoading();
    }, CONFIG.minDuration);
  }

  /* ── FALLBACK DE SEGURIDAD ───────────────────────────
     Si por alguna razón ni la página ni la animación
     disparan los eventos, forzamos el cierre a los 6s.
  ─────────────────────────────────────────────────── */
  setTimeout(() => {
    pageLoaded    = true;
    animationDone = true;
    finishLoading();
  }, 6000);

  /* ── ARRANCAR LA BARRA DE PROGRESO ──────────────── */
  setTimeout(advanceProgress, 300);   // pequeño delay inicial antes de arrancar

})();
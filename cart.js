/* ============================================================
   cart.js — Lógica del carrito de compras para Eden Plantas
   ============================================================
   Estructura:
   1. Estado y persistencia (localStorage)
   2. Funciones CRUD del carrito
   3. Renderizado del panel lateral
   4. Event listeners
   ============================================================ */

// ─── 1. ESTADO Y PERSISTENCIA ───────────────────────────────

/**
 * Carga el carrito desde localStorage.
 * Si no existe aún, devuelve un array vacío.
 */
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("edenCart")) || [];
  } catch {
    return [];
  }
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCart(cart) {
  localStorage.setItem("edenCart", JSON.stringify(cart));
}

// Estado reactivo — único punto de verdad del carrito
let cart = loadCart();


// ─── 2. FUNCIONES CRUD DEL CARRITO ──────────────────────────

/**
 * Agrega un producto al carrito.
 * Si ya existe (mismo id), incrementa la cantidad.
 * @param {{ id, name, price, image }} product
 */
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showCartFeedback(product.name);
  openCartPanel();
}

/**
 * Incrementa en 1 la cantidad de un item por su id.
 */
function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (item) { item.qty += 1; saveCart(cart); updateCartUI(); }
}

/**
 * Decrementa en 1 la cantidad. Si llega a 0, elimina el item.
 */
function decreaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  updateCartUI();
}

/**
 * Elimina completamente un producto del carrito por id.
 */
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  updateCartUI();
}

/**
 * Vacía el carrito por completo.
 */
function clearCart() {
  cart = [];
  saveCart(cart);
  updateCartUI();
}

/**
 * Calcula el total de unidades en el carrito (para el badge).
 */
function getTotalItems() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

/**
 * Calcula el precio total del carrito.
 */
function getTotalPrice() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/**
 * Formatea un número como moneda argentina.
 */
function formatPrice(n) {
  return "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 0 });
}


// ─── 3. RENDERIZADO DEL PANEL LATERAL ───────────────────────

/**
 * Actualiza el badge del ícono de carrito en el navbar.
 * Oculta el badge si está en 0.
 */
function updateBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  const total = getTotalItems();
  badge.textContent = total;
  badge.style.display = total > 0 ? "flex" : "none";
}

/**
 * Renderiza la lista de items dentro del panel del carrito.
 */
function renderCartPanel() {
  const list = document.getElementById("cartItemsList");
  const totalEl = document.getElementById("cartTotal");
  const emptyMsg = document.getElementById("cartEmpty");
  const footer = document.getElementById("cartFooter");
  if (!list) return;

  list.innerHTML = "";

  if (cart.length === 0) {
    emptyMsg && (emptyMsg.style.display = "flex");
    footer && (footer.style.display = "none");
    return;
  }

  emptyMsg && (emptyMsg.style.display = "none");
  footer && (footer.style.display = "block");

  cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-item-img">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}">`
          : `<div class="cart-item-img-placeholder"></div>`}
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Disminuir cantidad">−</button>
          <span class="cart-qty-value">${item.qty}</span>
          <button class="cart-qty-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
      <button class="cart-remove-btn" data-action="remove" data-id="${item.id}" aria-label="Eliminar ${item.name}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    `;
    list.appendChild(li);
  });

  if (totalEl) totalEl.textContent = formatPrice(getTotalPrice());
}

/**
 * Actualiza todo el UI del carrito: badge + panel.
 */
function updateCartUI() {
  updateBadge();
  renderCartPanel();
}

/**
 * Abre el panel lateral del carrito.
 */
function openCartPanel() {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  panel?.classList.add("open");
  overlay?.classList.add("visible");
  document.body.style.overflow = "hidden";
}

/**
 * Cierra el panel lateral del carrito.
 */
function closeCartPanel() {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  panel?.classList.remove("open");
  overlay?.classList.remove("visible");
  document.body.style.overflow = "";
}

/**
 * Muestra un pequeño toast de confirmación al agregar un producto.
 */
function showCartFeedback(name) {
  let toast = document.getElementById("cartToast");
  if (!toast) return;
  toast.textContent = `✓ "${name}" agregado`;
  toast.classList.add("visible");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove("visible"), 2200);
}


// ─── 4. INYECCIÓN DEL HTML DEL CARRITO ──────────────────────

/**
 * Crea e inyecta en el DOM todos los elementos del carrito:
 * - Ícono en navbar
 * - Panel lateral
 * - Overlay
 * - Toast de feedback
 */
function injectCartUI() {
  // Ícono en navbar
  const nav = document.querySelector(".main-nav");
  if (nav) {
    const cartBtn = document.createElement("button");
    cartBtn.id = "cartToggleBtn";
    cartBtn.className = "cart-icon-btn";
    cartBtn.setAttribute("aria-label", "Abrir carrito");
    cartBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <span class="cart-badge" id="cartBadge" style="display:none">0</span>
    `;
    // Insertar antes del theme-toggle si existe
    const themeBtn = nav.querySelector(".theme-toggle");
    themeBtn ? nav.insertBefore(cartBtn, themeBtn) : nav.appendChild(cartBtn);
  }

  // Panel lateral
  const panel = document.createElement("aside");
  panel.id = "cartPanel";
  panel.className = "cart-panel";
  panel.setAttribute("aria-label", "Carrito de compras");
  panel.innerHTML = `
    <div class="cart-panel-header">
      <h2>Tu carrito</h2>
      <button id="cartCloseBtn" class="cart-close-btn" aria-label="Cerrar carrito">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div id="cartEmpty" class="cart-empty">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M8 8h6l8 32h24l6-24H18"/>
        <circle cx="26" cy="52" r="3"/>
        <circle cx="42" cy="52" r="3"/>
      </svg>
      <p>Tu carrito está vacío</p>
    </div>
    <ul id="cartItemsList" class="cart-items-list"></ul>
    <div id="cartFooter" class="cart-footer" style="display:none">
      <div class="cart-total-row">
        <span>Total</span>
        <strong id="cartTotal">$0</strong>
      </div>
      <a id="cartWhatsapp" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary ripple-btn cart-checkout-btn">
        Consultar por WhatsApp
      </a>
      <button id="cartClearBtn" class="cart-clear-btn">Vaciar carrito</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Overlay (fondo oscuro)
  const overlay = document.createElement("div");
  overlay.id = "cartOverlay";
  overlay.className = "cart-overlay";
  document.body.appendChild(overlay);

  // Toast de feedback
  const toast = document.createElement("div");
  toast.id = "cartToast";
  toast.className = "cart-toast";
  document.body.appendChild(toast);
}


// ─── 5. EVENT LISTENERS ─────────────────────────────────────

/**
 * Registra todos los eventos del carrito:
 * abrir/cerrar panel, clicks en items, vaciar, WhatsApp.
 */
function bindCartEvents() {
  // Abrir panel
  document.getElementById("cartToggleBtn")?.addEventListener("click", openCartPanel);

  // Cerrar panel
  document.getElementById("cartCloseBtn")?.addEventListener("click", closeCartPanel);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCartPanel);

  // Tecla Escape cierra el panel
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeCartPanel();
  });

  // Delegación de eventos en la lista de items (increase / decrease / remove)
  document.getElementById("cartItemsList")?.addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "increase") increaseQty(id);
    else if (action === "decrease") decreaseQty(id);
    else if (action === "remove") removeFromCart(id);
  });

  // Vaciar carrito
  document.getElementById("cartClearBtn")?.addEventListener("click", () => {
    if (confirm("¿Vaciar el carrito?")) clearCart();
  });

  // Botón WhatsApp — construye el mensaje con los items actuales
  document.getElementById("cartFooter")?.addEventListener("click", e => {
    if (e.target.closest("#cartWhatsapp")) {
      const msg = buildWhatsappMessage();
      document.getElementById("cartWhatsapp").href =
        `https://wa.me/549244312022?text=${encodeURIComponent(msg)}`;
    }
  });
}

/**
 * Construye el mensaje de WhatsApp con el detalle del carrito.
 */
function buildWhatsappMessage() {
  let msg = "Hola! Me gustaría consultar por los siguientes productos de Eden Plantas:\n\n";
  cart.forEach(item => {
    msg += `• ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}\n`;
  });
  msg += `\nTotal: ${formatPrice(getTotalPrice())}`;
  return msg;
}


// ─── 6. CONECTAR TARJETAS EXISTENTES ────────────────────────

/**
 * Agrega el botón "Agregar al carrito" a cada .card existente en el sitio.
 * Los datos del producto se leen de los atributos data-* de la tarjeta,
 * o se infieren del contenido del DOM si no están presentes.
 */
function bindProductCards() {
  document.querySelectorAll(".category-grid .card.media-card").forEach((card, index) => {
    // Evitar procesar dos veces
    if (card.dataset.cartBound) return;
    card.dataset.cartBound = "true";

    // Leer o inferir datos del producto
    const nameEl = card.querySelector("h3");
    const imgEl  = card.querySelector("img");

    const product = {
      id:    card.dataset.cartId    || `card-${index}`,
      name:  card.dataset.cartName  || nameEl?.textContent?.trim() || `Producto ${index + 1}`,
      price: parseInt(card.dataset.cartPrice) || 0,
      image: card.dataset.cartImage || imgEl?.src || null,
    };

    // Crear botón "Agregar"
    const addBtn = document.createElement("button");
    addBtn.className = "card-add-btn ripple-btn";
    addBtn.setAttribute("aria-label", `Agregar ${product.name} al carrito`);
    addBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Agregar
    `;

    addBtn.addEventListener("click", e => {
      e.preventDefault(); // evitar seguir el href del <a>
      e.stopPropagation();
      addToCart(product);

      // Animación visual de feedback en el botón
      addBtn.classList.add("added");
      setTimeout(() => addBtn.classList.remove("added"), 700);
    });

    // Insertar el botón dentro del card-content
    const cardContent = card.querySelector(".card-content");
    if (cardContent) cardContent.appendChild(addBtn);
  });
}


// ─── 7. INICIALIZACIÓN ──────────────────────────────────────

/**
 * Punto de entrada principal.
 * Espera a que el DOM esté listo para inyectar UI y eventos.
 */
function initCart() {
  injectCartUI();
  bindCartEvents();
  bindProductCards();
  updateCartUI(); // Renderiza estado inicial desde localStorage
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCart);
} else {
  initCart();
}
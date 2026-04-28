# Estructura Base Reutilizable - Páginas de Productos

## 📋 Documentación de Estructura

Esta es la estructura base implementada para las 4 páginas de productos del vivero Eden Plantas:
- **BolsaCultivos.html** - Bolsas para cultivos
- **PlantasInterior.html** - Plantas para interior
- **PlantasExterior.html** - Plantas para exterior
- **Macetasyaccesorios.html** - Macetas y accesorios

---

## 🎨 Componentes Compartidos

### CSS
- **product-pages.css** - Estilos base para todas las páginas internas
  - Variables de tema neon verde oscuro
  - Estilos de header, hero, grid, beneficios, CTA y footer
  - Responsive design completo
  - Animaciones de reveal y parallax

### JavaScript
- **app.js** - Funcionalidades interactivas (menu, parallax, reveal, etc.)
- **loader.js** - Animación de carga
- **Font Awesome 5.15.3** - Iconos

---

## 🔧 Cómo Personalizar Cada Página

### 1. Header
```html
<!-- Cambiar solo el URL del WhatsApp -->
<a href="https://wa.me/[NUMERO]?text=[MENSAJE]" 
   target="_blank" class="whatsapp-btn ripple-btn">
  <i class="fab fa-whatsapp"></i> WhatsApp
</a>
```

### 2. Hero Section
```html
<!-- Personalizar: -->
<!-- - style="background-image: url('[NUEVA_URL]');" en .hero-bg -->
<!-- - .kicker: categoría (ej: "Interior", "Exterior") -->
<!-- - h1: título principal -->
<!-- - p: descripción -->
<!-- - URLs de WhatsApp en los botones -->

<div class="hero-bg parallax-layer" 
     data-parallax-speed="0.12" 
     style="background-image: url('https://images.unsplash.com/...');"></div>

<p class="kicker">Categoría</p>
<h1>Título Principal</h1>
<p>Descripción del contenido...</p>
```

### 3. Grid de Productos
```html
<!-- Duplicar .card.media-card para más productos -->
<!-- Cambiar: -->
<!-- - img src y alt -->
<!-- - h3 (nombre) -->
<!-- - p (descripción) -->
<!-- - precio -->

<a href="#" class="card media-card reveal">
  <div class="image-placeholder">
    <img src="URL_IMAGEN" alt="Nombre">
  </div>
  <div class="card-content">
    <h3>Nombre Producto</h3>
    <p>Descripción del producto...</p>
    <p style="font-weight: 600; color: var(--neon); margin-top: 0.8rem;">$PRECIO</p>
  </div>
</a>
```

### 4. Sección de Beneficios
```html
<!-- Personalizar los 3 beneficios principales -->
<!-- Cambiar: -->
<!-- - .icon: número (01-03) -->
<!-- - h3: título beneficio -->
<!-- - p: descripción -->

<article class="card benefit-card reveal">
  <span class="icon">01</span>
  <h3>Beneficio Principal</h3>
  <p>Descripción detallada del beneficio...</p>
</article>
```

### 5. CTA Final
```html
<!-- Personalizar llamada a acción final -->
<!-- Cambiar: -->
<!-- - h2: headline -->
<!-- - p: descripción -->
<!-- - href: URL de WhatsApp -->

<h2>Texto principal</h2>
<p>Descripción complementaria...</p>
<a href="https://wa.me/[NUMERO]?text=[MENSAJE]" 
   target="_blank" class="btn btn-primary ripple-btn">
  <i class="fab fa-whatsapp"></i> Contactar
</a>
```

---

## 📱 Estructura Responsive

- **Mobile** (<640px): Stack vertical, hero más pequeño
- **Tablet** (640-1024px): Grid de 2-3 columnas
- **Desktop** (>1024px): Grid de 3 columnas optimizado

El CSS maneja todos los breakpoints automáticamente.

---

## 🌈 Tema y Colores

Variables CSS disponibles en product-pages.css:
```css
--bg: #06110a              /* Fondo principal */
--bg-soft: #0a1810         /* Fondo suave */
--card: rgba(10, 24, 16, 0.62)  /* Fondo tarjetas */
--text: #ecfff0            /* Texto principal */
--text-soft: #adc7b4       /* Texto secundario */
--neon: #4dff7f            /* Verde neon */
--neon-soft: rgba(77, 255, 127, 0.28)  /* Verde neon suave */
```

---

## 🚀 Características Implementadas

✅ **Header** con logo + botón volver + WhatsApp
✅ **Hero section** con parallax, overlay y partículas
✅ **Grid responsive** de productos (auto-ajuste 3 columnas)
✅ **Tarjetas** con hover effects, borders neon, animaciones
✅ **Sección beneficios** con 3 items destacados
✅ **CTA final** con llamada a WhatsApp
✅ **Footer** con links a redes sociales
✅ **Modo oscuro** forzado (tema neon)
✅ **Loader** elegante con animación
✅ **Reveal animations** en scroll
✅ **Cursor neon** personalizado
✅ **Ripple effects** en botones
✅ **Totalmente responsive** mobile-first

---

## 📁 Rutas de Archivos

```
EdenPlantas/
├── index.html
├── app.js
├── loader.js
├── style.css
├── cart.css
├── loader.css
├── product-pages.css        ← NUEVO
└── Productos/
    ├── BolsaCultivos.html
    ├── PlantasInterior.html
    ├── PlantasExterior.html
    └── Macetasyaccesorios.html
```

---

## 🎯 Instrucciones Rápidas para Nueva Página

1. Copiar una página existente (ej: PlantasInterior.html)
2. Cambiar título en `<title>` y `<meta>`
3. Actualizar `.kicker`, `h1` y descripción en hero
4. Cambiar imagen de hero en `style="background-image: url(...)"`
5. Reemplazar productos en el grid
6. Personalizar beneficios (3 items)
7. Actualizar CTA final
8. Cambiar URLs de WhatsApp según corresponda
9. Verificar rutas relativas (`../`)

---

## 🔗 Integración con Index

Los links del index.html ya apuntan correctamente:
```html
<a href="Productos/PlantasInterior.html">...</a>
<a href="Productos/PlantasExterior.html">...</a>
<a href="Productos/BolsaCultivos.html">...</a>
<a href="Productos/Macetasyaccesorios.html">...</a>
```

El back button en cada página vuelve a:
```html
<a href="../index.html" class="back-btn">Volver</a>
```

---

## 💡 Tips

- Mantener consistencia visual: usar siempre 6 productos en el grid
- Las imágenes son de placeholder (unsplash) - reemplazar con propias
- Los precios son ejemplos - actualizar según catálogo real
- URLs de WhatsApp incluyen mensaje pre-llenado - personalizar
- El loader se ejecuta automáticamente desde loader.js
- Las animaciones funcionan sin configuración adicional

---

## 🎨 Personalización Avanzada

### Cambiar colores neon:
Editar en `product-pages.css`:
```css
--neon: #4dff7f;              /* Cambiar este color */
--neon-soft: rgba(77, 255, 127, 0.28);
```

### Ajustar velocidad de parallax:
```html
<div class="hero-bg parallax-layer" data-parallax-speed="0.12">
```
Incrementar/decrementar el valor (0.12)

### Modificar columnas del grid:
En `product-pages.css`, cambiar `grid-template-columns`

---

Versión: 1.0 | Creado: Abril 2026 | Eden Plantas Vivero

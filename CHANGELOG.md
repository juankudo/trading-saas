# 📜 Registro de Versiones (Changelog) — Trading Journal Pro

Todas las modificaciones, mejoras y correcciones notables de Trading Journal Pro están documentadas en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y adhiere al versionado semántico.

---

## [v3.3.0] - 2026-11-02

### 🎯 Nueva Métrica: Objetivos Alcanzados & Distribución
- **Recuadro Ejecutivo en Dashboard & Métricas:**
  - Nueva tarjeta con 3 mini KPIs superiores: *Operaciones*, *Profit factor* y *R:R medio*.
  - *Distribución*: barra horizontal segmentada tricolor (Ganadas en verde esmeralda, Breakeven en índigo y Pérdidas en rojo) con contadores individuales.
  - *Objetivos alcanzados*: desglose detallado con barras de progreso e indicadores de porcentaje y conteo para `TP1`, `TP2`, `TP3` y `SL`.
- **Estructura Reorganizada y Balanceada (3 Columnas + Matriz 2x2):**
  - La fila previa de 4 tarjetas comprimidas se organizó en una distribución óptima:
    - 1 Columna para el nuevo recuadro de *Objetivos & Distribución*.
    - 2 Columnas para una matriz 2×2 con las 4 tarjetas de desglose (*Activo/Par*, *Sesión*, *Tendencia*, *Día de la semana*), aumentando su anchura y confort de lectura sin perder ninguna información ni saturar la pantalla.
  - Pleno soporte en Modo Oscuro y Modo Claro (`html.light`).

---

## [v3.2.0] - 2026-11-02

### 🎯 Nueva Sección Dedicada: Metas
- **Pestaña "Metas":**
  - Añadida en la barra de navegación situada inmediatamente después de *"Dashboard & Métricas"* (`<i class="fa-solid fa-bullseye"></i> Metas`).
- **Desacoplamiento y Limpieza del Dashboard:**
  - El panel de objetivos de cuenta (challenge prop firm, metas personales, drawdown máximo, regla de consistencia, días mínimos de trading, días rentables y retiros) se traslada a su propia sección dedicada (`#section-goals`), liberando al *Dashboard & Métricas* para enfocarse en la curva de equidad y estadísticas operativas.
- **Visibilidad Dinámica Inteligente:**
  - Si una cuenta no tiene metas fijadas (o se deshabilitan), la pestaña *"Metas"* se oculta automáticamente sin ocupar espacio en la navegación.
  - Al configurar o activar una meta en la cuenta activa, la pestaña *"Metas"* se hace visible en tiempo real.

---

## [v3.1.2] - 2026-11-02

### 🎨 Mejoras Visuales y Optimización de Tarjetas Mensuales
- **Optimización de Espaciado y Tipografía:**
  - Se elevaron las métricas internas de la tarjeta mensual mediante `leading-none mb-1` e interlineados compactos `leading-tight`.
  - La fila inferior de *"Operaciones"* y *"PF"* fue redimensionada a `text-[11px] sm:text-xs text-gray-400` con cifras destacadas en `text-gray-200 font-semibold` y un relleno de resguardo inferior (`pb-0.5`).
  - Se eliminó el desborde donde el número de operaciones y profit factor quedaban superpuestos sobre el borde inferior redondeado.
- **Relación de Aspecto Adaptativa de la Grilla:**
  - `fitMonthlyCalendarGrid()` ahora calcula una relación entre `1.95` y `2.45`, expandiendo las tarjetas a lo ancho para aprovechar el espacio libre a la derecha en laptops y monitores.
  - Se optimizó la reserva inferior a `36px` y se redujeron los márgenes verticales entre filas (`--monthly-grid-gap: clamp(0.35rem, 0.8vh, 0.65rem)`), ganando altura útil sin provocar scrollbar.

---

## [v3.1.1] - 2026-11-02

### 🔍 Restauración de Zoom e Inspección Flotante (Estilo v30)
- **Efecto Hover Zoom con Protección de Pantalla:**
  - Restaurado el aumento de tarjeta `transform: scale(1.25, 1.16)` con sombras profundas `0 20px 42px rgba(0, 0, 0, 0.65)`.
  - Anclaje direccional (`transform-origin`):
    - Fila inferior (Sep a Dic): `bottom center` (y `bottom right` para Diciembre), creciendo exclusivamente hacia arriba para jamás empujar el margen inferior ni generar scroll.
    - Fila superior (Ene a Abr): `top center` (y esquinas `top left`/`top right`).
    - Columnas exteriores (1 y 4): ancladas hacia el interior.
- **Panel Flotante de Inspección 2x2:**
  - Panel amplio (`calc(250% + gap)`) con 4 cuadrantes oscuros (`#161b22` / `bg-gray-950`): *Mejor Trade*, *Mejor Día*, *Mejor Sesión*, y *Distribución*.
  - Despliegue inteligente hacia arriba en filas 2 y 3 (Mayo a Diciembre) y hacia abajo en fila 1 (Enero a Abril).

---

## [v3.1.0] - 2026-11-02

### 📱 Ajustes de Navbar y Encabezado
- **Menú de Guía:** Integración del botón *"Tutoriales"* dentro del desplegable *"Guía"* para unificar la barra de navegación.
- **Encabezado y CTA:** Eliminación de enlaces redundantes de redes en el header (conservados en el footer) para dar máxima visibilidad al botón de *"Comenzar 14 Días Gratis"*.
- **Widget de Usuario:** Ocultamiento del correo electrónico en texto visible del navbar, pasando a tooltip en contenedor para mantener en una sola línea todos los controles y botones.

---

## [v3.0.0] - 2026-10-31

### 🚀 Lanzamiento Trading Journal Pro SaaS (Base v30)
- **Infraestructura SaaS:** Integración con backend Supabase (Auth, RLS, sincronización en tiempo real).
- **Pasarelas de Pago:**
  - Integración con Lemon Squeezy (Merchant of Record para tarjetas de crédito/débito globales).
  - Integración con NOWPayments (pagos en criptomonedas USDT/BTC).
- **Laboratorio de Backtesting Pro:** Módulo avanzado de simulación de operativas históricas con curvas de equidad y control de riesgo.
- **Auditoría de Fondeo:** Control estricto de drawdown diario y reglas para prop firms.
- **Cumplimiento Legal:** Términos de Servicio, Política de Privacidad, Descargo de Responsabilidad y Política de Reembolso integrados.
- **Automatización de Contenido:** Suite de agentes autónomos y renderizador de videos explicativos y promocionales.

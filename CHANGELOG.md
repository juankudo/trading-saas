# 📜 Registro de Versiones (Changelog) — Trading Journal Pro

Todas las modificaciones, mejoras y correcciones notables de Trading Journal Pro están documentadas en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y adhiere al versionado semántico.

---

## [v3.4.1] - 2026-11-02

### 🛠️ Corrección y Optimización Visual: Calendario Diario
- **Ajuste Completo de Días y Semanas (Sin Pérdida de Datos):**
  - Se rediseñó la geometría de las celdas y filas semanales con alturas compactas (`min-height: 48px`, márgenes e interlineados optimizados), permitiendo que meses de 5 semanas (como Octubre) y meses de 6 semanas (como Noviembre) quepan íntegramente en la pantalla.
  - Se eliminó el recorte forzado (`overflow: hidden`) y se agregó resguardo con desplazamiento seguro (`overflow-y: auto`) para que ninguna operación o día quede oculto bajo ninguna resolución.
- **Corrección de Truncamiento en Nombres de Meses:**
  - Se amplió el ancho del panel lateral a `148px` para que nombres largos como *"Noviembre"* y *"Septiembre"* se visualicen sin cortes en el selector.
- **Barra Superior de Título y Métricas Mensuales:**
  - Incorporado en la cabecera del calendario el nombre del mes y año en curso (*ej. Noviembre 2026*) junto a un resumen con retorno total monetario ($), porcentaje neto (%) y total de operaciones del mes.
- **Corrección de Formato Monetario Negativo:**
  - Implementado `formatSignedDollar()` para que las pérdidas muestren la convención estándar `-$25.00` en lugar de `$-25.00`.

---

## [v3.4.0] - 2026-11-02

### 📅 Nueva Sección: Calendario Diario (Estilo TradeZella)
- **Pestaña de Navegación "Calendario Diario":**
  - Situada inmediatamente a la derecha de *"Rendimiento por mes"* con acceso dinámico al ingresar a una cuenta real o sesión de backtesting.
- **Filtro Lateral Limpio:**
  - Panel izquierdo con selectores directos de *Mes* y *Año* más botones de avance/retroceso rápido (*Ant.* / *Sig.*), iniciando por defecto en el mes activo en curso.
- **Columna de Resumen Semanal:**
  - Muestra en el lateral izquierdo de la cuadrícula el desglose por semanas (*Semana 1*, *Semana 2*, etc.) con resultado monetario ($), porcentaje neto (%) y conteo de operaciones.
- **Cuadrícula de 7 Días (Lunes a Domingo):**
  - Estructura completa de la semana bursátil e integral con celdas adaptativas que destacan días ganadores (verde esmeralda), perdedores (rojo) y neutrales (índigo) con ganancia en $ y %, más operaciones cerradas.
- **Modal Interactivo de Análisis de Operaciones:**
  - Al hacer clic sobre cualquier día con operaciones, se abre una ventana modal con el análisis técnico y operativo del trade:
    - Ficha de la orden, par, resultado en $ y %, y estado de salida.
    - Secciones ANTES y DESPUÉS con notas, confluencias, capturas ampliables con lightbox y enlace directo a TradingView.
    - Pestañas superiores para alternar rápidamente entre trades si en la jornada hubo más de una entrada.
- **Ajuste Perfecto en Pantalla (Regla Sin Scroll):**
  - Motor responsivo `fitDailyCalendarGrid()` que distribuye las semanas equitativamente dentro de la altura de la ventana gráfica, garantizando que todo el mes sea visible de un solo vistazo.
- **Soporte de Tema Claro y Oscuro:**
  - Adaptación cromática completa en `html.light`.

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

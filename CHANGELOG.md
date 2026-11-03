# 📜 Registro de Versiones (Changelog) — Trading Journal Pro

Todas las modificaciones, mejoras y correcciones notables de Trading Journal Pro están documentadas en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y adhiere al versionado semántico.

---

## [v3.6.0] - 2026-11-03

### 🏆 Reglas de Simulación de Fondeo Integradas en Dashboard (Exclusivo Backtesting)
- **Visualización Superior en Dashboard & Métricas (`app.html`):**
  - Se reubicó el contenedor `#fondeo-panel` directamente en la cabecera de la sección **Dashboard & Métricas** (`#section-dashboard`), ubicándose sobre los controles de balance y gráficas para sesiones de evaluación.
- **Aislamiento y Filtro Estricto por Modalidad (`js/app.js`):**
  - **Solo Backtesting en Modo Fondeo:** Las tarjetas de fase, drawdown diario/máximo, consistencia, días mínimos y retiros simulados se despliegan únicamente cuando `currentMode === "backtesting"` y la sesión tiene `mode === "fondeo"`.
  - **Trading Libre Limpio:** Si la sesión de backtesting es de trading libre, el panel se oculta y vacía automáticamente, manteniendo la vista despejada.
  - **Cuentas Reales 100% Inalteradas:** Las cuentas reales no muestran jamás este panel. Conservan su pestaña dedicada *"Metas"*, el panel de objetivos (`#account-goal-panel`), su rendimiento por mes, calendario diario y navegación original sin ninguna interferencia.
  - **Tolerancia a Fallos:** Incorporación de bloques `try/catch` defensivos en el renderizado de reglas para blindar el flujo de navegación de la aplicación ante cualquier imprevisto.

---

## [v3.5.9] - 2026-11-03

### 🔄 Reversión y Restauración de Estabilidad en la Aplicación
- **Restauración de la Navegación y Vistas de la App (`js/app.js` y `app.html`):**
  - Se deshicieron las modificaciones introducidas en el cálculo de fechas de backtesting y la reubicación del panel de fondeo que provocaban interferencias entre Cuentas Reales y Backtesting.
  - Se restauró el funcionamiento original y estable de:
    1. **Navegación al Dashboard:** Al hacer clic en *"Métricas"* en una cuenta real o en *"Empezar"* en una sesión de backtesting, la vista transiciona de forma inmediata al Dashboard & Métricas sin quedar bloqueada en la lista de cuentas/sesiones.
    2. **Rendimiento por Mes:** La sección vuelve a renderizar correctamente todos los meses y estadísticas históricas.
    3. **Calendario Diario:** Se restablece la visualización sincronizada del mes actual con el indicador de fecha presente (*"Hoy"*).
    4. **Separación de Modos:** Cuentas Reales y Backtesting conservan su comportamiento original aislado.
- **Preservación Integral de la Landing Page (`index.html`):**
  - Se mantuvieron al 100% las mejoras de la landing page: el nuevo auto-tour guiado con celebración de cuenta fondeada aprobada, la sección de precios compacta de ancho completo (3 tarjetas lado a lado con banner de funcionalidades sin scroll) y la duración de la prueba a 7 días.

---

## [v3.5.8] - 2026-11-03

### 🏷️ Actualización de Nombres de Pestañas en Showcase Interactivo
- **Normalización de Nombres en la Demo de la Landing Page (`index.html`):**
  - **Pestaña 1:** Se actualizó de `"1. Dashboard & Equidad"` a `"1. Dashboard & Métricas"`, alineándola con el nombre oficial de la plataforma.
  - **Pestaña 3:** Se actualizó de `"3. Calendario Mensual"` a `"3. Rendimiento Mensual"`, homogeneizando los títulos de navegación tanto en escritorio como en móviles y barras de progreso story.

---

## [v3.5.7] - 2026-11-03

### 💎 Rediseño Responsivo y Compacto de Tarjetas de Precios (Full-Width)
- **Eliminación de la Tarjeta Estirada Verticalmente:**
  - Se reemplazó el contenedor estrecho y alargado (`max-w-md`) de la sección de precios (`#precios`), el cual requería hacer scroll vertical para ver el botón de acción, la garantía y las insignias de pago.
- **Distribución Horizontal de 3 Planes Lado a Lado (`max-w-5xl`):**
  - Se distribuyen en 3 columnas en escritorio (`md:grid-cols-3`):
    1. **1 Mes ($19/mes):** Opción mensual flexible sin ataduras.
    2. **3 Meses ($16/mes · -15%):** Plan destacado con borde esmeralda e insignia `"⭐ Más Elegido"`.
    3. **12 Meses ($13/mes · -30%):** Opción anual con insignia `"🚀 Mejor Valor"` y ahorro de $72.
  - Cada tarjeta cuenta con su propio botón de acción directo `"Comenzar 7 Días"`, vinculando la selección del ciclo preferido.
- **Banner Horizontal Unificado de Funcionalidades:**
  - Debajo de las 3 tarjetas se integró un banner de ancho completo con las 8 características Pro en 4 columnas (`lg:grid-cols-4`), demostrando con claridad que todos los ciclos tienen acceso al 100% de la plataforma desbloqueada sin muros de pago entre planes.
  - Incluye la garantía de prueba de 7 días y los métodos de pago aceptados (Visa, Mastercard, USDT).
- **Ajuste en una Sola Pantalla (No Scroll):**
  - La altura total de la sección de precios se redujo más de un 55%, logrando que el título, los 3 planes, precios, botones, lista de funcionalidades y garantías queden completamente visibles en pantalla en monitores y laptops estándar sin requerir scroll.
- **Optimización Responsive para Celulares:**
  - En móviles las 3 tarjetas se presentan en formato compacto y ligero (~115px cada una), evitando el scroll repetitivo y manteniendo un flujo limpio y táctil para cualquier dispositivo.
- **Consistencia en Pagos:**
  - Actualización del texto descriptivo mensual en `js/payments.js` a 7 días de prueba.

---

## [v3.5.6] - 2026-11-03

### 🎬 Recorrido Narrativo Auto-Tour del Showcase y Duración de Prueba a 7 Días
- **Narrativa Continua del Auto-Tour en la Landing Page:**
  - El recorrido guiado automático del showcase se reestructuró para contar una historia completa y fluida:
    1. **Fase 1 (A Ciegas - Caos):** Muestra el estado inicial con curva descendente roja, drawdown descontrolado y diagnóstico de revenge trading.
    2. **Fase 2 (15 Trades - Filtros):** Transiciona a la optimización, eliminando sesiones tóxicas (Asia) y mostrando la recuperación del drawdown.
    3. **Fase 3 (Bitácora Pro - Consistencia):** Activa la operativa con checklist institucional y ejecuta la simulación de trades en vivo (US30 y XAUUSD) elevando la equidad y acumulando +$4,850.
    4. **Pestañas 2 y 3 (Trades y Calendario):** Recorre el registro detallado con checklist visual y el mapa de calor mensual.
    5. **Pestaña 4 (Auditoría de Fondeo & Clímax):** Avanza por las reglas de evaluación hasta alcanzar la meta (+10.20%), desplegando el estatus `"👑 CUENTA FONDEADA APROBADA"`, confeti y la ventana de felicitaciones oficial de cuenta fondeada.
- **Pausa Inteligente Exclusiva por Clic o Salida del Viewport:**
  - Se eliminó la pausa por `mouseenter`, `mouseleave` y `touchstart`. La animación ya no se interrumpe al mover el cursor sobre la demo.
  - La auto-animación se detiene **únicamente** cuando el usuario interactúa explícitamente haciendo clic sobre controles/pestañas, o cuando se realiza scroll hacia abajo dejando de ver el showcase en la pantalla (se reanuda automáticamente al regresar al campo de visión).
- **Actualización de Prueba Gratuita a 7 Días:**
  - Se ajustó el período de prueba gratuita de 14 días a **7 días** de forma unificada en todo el sistema:
    - **Frontend & Landing Page (`index.html`):** Barra superior, encabezados, tarjetas de precios, preguntas frecuentes, garantías y modal de registro.
    - **App & Checkout Dual (`app.html`):** Pastilla de usuario, banner de solo lectura, modal de checkout y herramienta sandbox de restablecimiento.
    - **Lógica de Autenticación & Pagos (`js/auth.js`, `js/payments.js`, `js/supabase-client.js`):** Cálculo de `trial_ends_at` con `7 * 24 * 60 * 60 * 1000` y etiquetas descriptivas.
    - **Esquema de Base de Datos (`supabase_schema.sql`):** Trigger de nuevas suscripciones configurado con `now() + interval '7 days'`.

---

## [v3.5.5] - 2026-11-03

### 📅 Fecha de Referencia Histórica en Calendario Diario (Solo Backtesting)
- **Apertura Contextual en Calendario Diario:**
  - En el modo Backtesting, el mes y año iniciales del **Calendario Diario** ahora se calculan mediante la función `getBacktestSessionReferenceDate`:
    1. Si la sesión cuenta con operaciones, se sitúa automáticamente en el mes y año del **último trade registrado**.
    2. Si aún no cuenta con operaciones, toma como referencia la **fecha de inicio configurada o la fecha de creación de la sesión**.
  - Se elimina la apertura por defecto en la fecha del sistema real (ej. Noviembre 2026) que mostraba calendarios vacíos al simular datos de otros periodos.
- **Sincronización con Rendimiento por Mes:**
  - El selector de año de **Rendimiento por mes** también adopta la fecha contextual del backtest para mantener coherencia en todas las vistas temporales.
- **Inactivación de la Etiqueta 'Hoy' en Simulaciones Históricas:**
  - La insignia `"Hoy"` se restringe exclusivamente al modo de Cuentas Reales, evitando destacar días anacrónicos sobre simulaciones pasadas.
- **Cuentas Reales Inalteradas:**
  - Las Cuentas Reales siguen abriéndose en el mes y año presente con el indicador `"Hoy"` activo.

---

## [v3.5.4] - 2026-11-03

### 🏆 Reglas de Simulación de Fondeo Integradas en Dashboard (Solo Backtesting)
- **Restauración del Panel de Fondeo en Dashboard & Métricas:**
  - El panel completo de desafíos de fondeo (`#fondeo-panel`), con sus tarjetas de métricas de fase, drawdown diario/máximo, días mínimos, consistencia, historial de fases y retiros simulados, vuelve a mostrarse directamente en la parte superior de la sección **Dashboard & Métricas** en backtesting.
- **Filtro Exclusivo por Tipo de Sesión:**
  - Solo se visualiza en sesiones configuradas bajo **Simulación de fondeo**.
  - Si la sesión es de **Trading libre**, el panel de reglas permanece 100% oculto, preservando una visualización limpia enfocada en estadísticas y curva de balance.
  - La navegación de backtesting prescinde de la pestaña externa de "Metas", centralizando todo en el dashboard.
- **Integridad de Cuentas Reales Preservada:**
  - Las cuentas reales continúan operando exactamente como lo hacían: sus metas y reglas de prueba/fondeada/instantánea permanecen agrupadas en la pestaña dedicada *"Metas"*, sin alterar el dashboard de cuentas reales.

---

## [v3.5.3] - 2026-11-03

### 🕒 Unificación y Normalización Canónica de Nombres de Sesiones
- **Normalización Canónica de Sesiones (`normalizeSessionName`):**
  - Se unificaron los nombres de sesiones en desuso y abreviaturas hacia sus nombres canónicos actuales:
    - `"NY"`, `"new york"`, `"newyork"` $\rightarrow$ `"New York"`
    - `"London"`, `"londres"` $\rightarrow$ `"Londres"`
    - `"Pre London"`, `"pre-london"` $\rightarrow$ `"Pre Londres"`
    - `"Pre NY"`, `"pre-ny"`, `"pre new york"` $\rightarrow$ `"Pre New York"`
    - `"Asia"`, `"asian"`, `"asiatica"` $\rightarrow$ `"Asia"`
- **Migración y Sanitización Automática de Registros Históricos (`migrateLegacySessionNames`):**
  - Al cargar la bitácora (`loadDataForMode`), se analizan los trades almacenados (cuentas reales, backtesting y métricas globales) y se migran automáticamente los registros antiguos hacia las sesiones oficiales.
  - La sincronización en memoria, almacenamiento IndexedDB y guardado en la nube se ejecutan de manera transparente.
- **Consolidación en "Efectividad por Sesión" y Dashboard:**
  - El desglose de métricas por sesión agrupa ahora todas las operaciones bajo la sesión normalizada, eliminando filas divididas o duplicadas (ej. reuniendo las métricas de `NY` y `New York` en una sola fila consolidada de `New York`, e integrando `London` y `Londres` en `Londres`).
  - Tanto la tabla de registro de trades como la galería y los filtros de sesión utilizan el valor canónico normalizado.

---

## [v3.5.2] - 2026-11-03

### 🧹 Eliminación en Cascada de Balances de Cuentas Borradas
- **Eliminación en Cascada de Registros de Balance:**
  - Al borrar una cuenta real, ahora se eliminan automáticamente todos sus registros y columnas en el historial de **Seguimiento de Balances**.
  - Si un registro histórico contenía únicamente la cuenta eliminada, la fila completa se descarta de forma limpia tanto en el almacenamiento local como en la nube.
- **Saneamiento Automático de Cuentas Huérfanas:**
  - Se incorporó la función `cleanOrphanBalanceHistory()` que purga de forma reactiva cualquier rastro de cuentas previamente borradas (ej. cuentas de fases superadas o eliminadas como *Fondeo PropXP Fase 2*).
  - La tabla de seguimiento de balances ahora construye sus columnas exclusivamente a partir de las cuentas reales activas (`getRealBalanceHistoryAccounts`).

---

## [v3.5.1] - 2026-11-03

### 📋 Registro de Trades: Orden Cronológico Inverso (Trades más Recientes Primero)
- **Visualización Descendente en Registro de Trades:**
  - Las operaciones en la tabla de la bitácora ahora se presentan en orden cronológico inverso (los trades más nuevos y recientes aparecen en la primera fila superior).
  - Integridad histórica preservada: el cálculo acumulativo de rendimiento (`ACUMULADO`) y balance proyectado (`BALANCE`) se procesa cronológicamente antes de la inversión, garantizando que cada trade conserve su balance y resultado acumulado histórico exacto.
  - Optimización de rendimiento DOM: renderizado de filas por lote (`map().join("")`), eliminando re-parseos innecesarios en la tabla.

---

## [v3.5.0] - 2026-11-02

### 🎯 Eliminación de KPIs Duplicados: Profit Factor y R:R Concentrados en 'Objetivos & Distribución'
- **Remoción de Duplicados en la Fila Superior de KPIs:**
  - Se eliminaron las tarjetas redundantes de *"Profit Factor"* y *"Promedio RR"* de la barra superior de métricas del Dashboard.
  - Ambas métricas se concentran exclusivamente en el bloque contiguo de *"Objetivos & Distribución"*, evitando duplicación de datos innecesaria.
- **Cuadrícula Superior Rediseñada a 4 Métricas Clave:**
  - La fila superior ahora se organiza en una cuadrícula simétrica de 4 KPIs (`grid-cols-2 lg:grid-cols-4 gap-4`):
    1. Retorno Total
    2. Efectividad Global (con desglose de trades Ganados / Perdidos / BE)
    3. Max Drawdown
    4. Mejor / Peor Trade
  - Mayor amplitud visual, legibilidad optimizada y diseño equilibrado en todas las resoluciones.

---

## [v3.4.9] - 2026-11-02

### 📐 Cuadrícula de 4 Tarjetas por Fila, Marquesina en Nombres Largos y Balances Simplificados
- **Cuadrícula Optimizada para 4 Tarjetas por Fila:**
  - Se actualizó la cuadrícula principal de cuentas a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.
  - Se eliminó el espacio vacío excesivo en el interior de cada tarjeta reduciendo el ancho y compactando el espaciado interno (`gap-x-2`, `p-3.5 sm:p-4`), permitiendo acomodar 4 tarjetas por fila en pantallas de escritorio.
- **Efecto Marquesina Suave en Nombres Extensos al Pasar el Cursor:**
  - Los nombres largos se muestran recortados con puntos suspensivos (`...`) por defecto.
  - Al posar el cursor sobre la tarjeta, si el texto excede el ancho disponible, se desplaza suavemente de derecha a izquierda revelando el nombre completo y pausando en los extremos sin desbordar ni romper la tarjeta (`overflow-hidden`).
- **Simplificación Inteligente de Balances Iniciales Redondos:**
  - Se implementó la función `formatCompactBalance`: los balances redondos en miles o millones se presentan de forma compacta (ej. `1000` -> `1k`, `2500` -> `2.5k`, `3000` -> `3k`, `1000000` -> `1M`), manteniendo el valor exacto accesible en el tooltip al pasar el cursor.

---

## [v3.4.8] - 2026-11-02

### 🗂️ Tarjetas de Cuenta Compactas: Menú de Ajustes ⋮ y Micro-Chips de Reglas en un Renglón
- **Eliminación del Encabezado 'Cuentas sin agrupar':**
  - Se eliminó la etiqueta divisoria intermedia *"CUENTAS SIN AGRUPAR"* en la vista principal de cuentas reales.
  - Las tarjetas de cuenta ahora se posicionan inmediatamente debajo de la barra de acciones superior, elevando el contenido y logrando una interfaz mucho más limpia, compacta y directa.
- **Nombre de la Cuenta en la Cabecera Superior (Junto al Menú ⋮):**
  - El nombre de la cuenta ahora se ubica en la fila superior como título principal destacado (`font-bold text-white text-base`), perfectamente alineado a la izquierda del botón de ajustes `⋮`.
  - Se eliminó la fila de *"Nombre:"* de la cuadrícula de métricas, elevando todos los datos una fila completa y reduciendo notablemente la longitud vertical de la tarjeta.
  - Protección anticolisión: con `truncate min-w-0`, `gap-2.5` y `shrink-0`, los nombres extensos se cortan elegantemente con puntos suspensivos sin tocar jamás los tres puntos, manteniendo su tooltip completo al posar el ratón.
- **Menú de Ajustes Desplegable (`⋮`) en Tarjetas de Cuenta:**
  - Se reemplazaron los botones separados de edición y borrado por un botón de ajustes vertical (`⋮` / `fa-ellipsis-vertical`) situado en la esquina superior derecha de cada tarjeta individual.
  - Al pulsar el botón se despliega un menú flotante estilizado con las opciones *"Editar"* y *"Borrar"*, con cierre automático al hacer clic fuera y aislamiento de eventos.
- **Optimización de Espacio y Reducción de Altura:**
  - Se redujo el espaciado superior y la cuadrícula de datos subió aprovechando el espacio recuperado, reduciendo sustancialmente la longitud de las tarjetas para una visualización más limpia y armónica.
- **Micro-Chips de Reglas Limitados Estrictamente a un Renglón:**
  - Las reglas activas de cada cuenta ahora se condensan en micro-chips en una sola línea horizontal (`no-scrollbar`) que no produce saltos de línea ni deforma la altura de la tarjeta.
  - Cada regla cuenta con su icono representativo específico (`📊` consistencia, `📅` días de trading, `📈` días rentables, `🛡️` pérdida diaria) y un tooltip explicativo completo al posar el cursor.
- **Soporte Completo de Modo Claro y Oscuro:**
  - Adaptación cuidada de contrastes, bordes y hover para el menú desplegable de ajustes en ambos esquemas de color.

---

## [v3.4.7] - 2026-11-02

### 👤 Pastillas Dinámicas de Usuario: Tiempo Contraído y Email Desplegable
- **Pastilla de Tiempo/Plan con Icono de Reloj Contraído:**
  - El badge de prueba y suscripción (`#app-user-badge`) ahora permanece contraído por defecto mostrando únicamente el icono representativo (`🕒` reloj en prueba, `👑` corona en Pro o `🔒` candado en solo lectura).
  - Al posar el cursor (`hover`), el tiempo restante o estado del plan (ej. *"Prueba: 8d"*) se despliega suavemente hacia la derecha con microanimación fluida.
- **Pastilla de Usuario con Despliegue de Email desde el Icono:**
  - El icono de usuario (`👤`) ahora se encuentra encapsulado en una pastilla interactiva (`#app-user-pill`).
  - Al pasar el cursor sobre el icono de usuario, el correo electrónico del trader registrado se expande suavemente desde el icono con elipsis segura para evitar cualquier salto o desborde.
- **Microinteracciones Homogéneas:**
  - Todo el bloque superior de usuario y las herramientas inferiores comparten la misma convención de diseño basada en pastillas expandibles al hover (`.nav-pill-expandable`).

---

## [v3.4.6] - 2026-11-02

### 🧭 Reorganización de Cabecera y Pastillas Dinámicas de Barra de Herramientas
- **Centrado Perfecto de Cambio de Modo (Cuenta Real / Backtesting):**
  - Se estructuró la fila superior del encabezado en una cuadrícula simétrica (`1fr auto 1fr`) que garantiza el centrado horizontal matemático del selector de operativas en cualquier resolución de pantalla.
- **Elevación del Registro de Usuario al Encabezado:**
  - El menú de usuario con badge de prueba/plan y botón de cierre de sesión (`#app-user-menu-container`) se trasladó al extremo derecho de la primera fila, despejando la barra de herramientas inferior.
- **Compresión y Expansión Dinámica de Suscripción y Sincronización:**
  - El botón de *Suscripción* se comprimió a un elegante botón pastilla con el icono de diamante (`💎`) que despliega suavemente el texto *"Suscripción"* al pasar el cursor (`hover`) con microtransición fluida.
  - El indicador de *Sincronización en la nube* se condensó a un icono de check (`✓`) que revela el estado *"Sincronizado"* al acercar el cursor sin saltos de línea ni provocar desplazamientos (`nowrap` y `overflow-hidden`).
  - Total compatibilidad visual en Modo Oscuro y Modo Claro.

---

## [v3.4.5] - 2026-11-02

### 📅 Rendimiento por Mes: Eliminación de Desplazamiento y Salto en Meses Superiores
- **Eliminación del Crecimiento Hacia Abajo en Fila Superior (Ene - Abr):**
  - Se eliminó el factor de aumento forzado (`transform: scale(1.25, 1.16)`) con anclaje superior que expandía las tarjetas de la primera fila hacia abajo y las superponía sobre la segunda fila.
  - La interacción hover ahora aplica una elevación sutil y fluida (`transform: translateY(-2px)`) con iluminación de contorno y sombra profunda, manteniendo las tarjetas fijas en su celda de grilla.
- **Despliegue Flotante Suave sin Desplazamiento de Layout:**
  - El panel de inspección 2x2 (`Mejor trade`, `Mejor día`, `Mejor sesión`, `Distribución`) ya no se expande mediante animación de altura variable que empujaba hacia abajo; ahora aparece mediante desvanecimiento y microdesplazamiento suave (`opacity` y `translateY`).
  - Para la fila 1 (Enero a Abril), el panel se posiciona limpiamente debajo de la tarjeta sin rebasar el límite inferior de la pantalla ni provocar saltos.
  - Para las filas 2 y 3 (Mayo a Diciembre), el panel se eleva suavemente hacia arriba.
- **Prevención de Scrollbar Shift Global:**
  - Se incorporó `scrollbar-gutter: stable` a nivel `html` para blindar el viewport contra desplazamientos laterales si un contenedor abre o cierra contenido flotante.

---

## [v3.4.4] - 2026-11-02

### 🌐 Sincronización Global desde Seguimiento de Balances
- **Ocultamiento de Metas en Seguimiento de Balances:**
  - La pestaña *"Metas"* ahora se oculta de forma estricta tanto en *"Tus Cuentas"* como en *"Seguimiento de balances"*, asegurando que solo aparezca al estar dentro de una cuenta particular que tenga metas fijadas.
- **Acceso a Métricas Globales en Todas las Secciones:**
  - Al ingresar a *"Seguimiento de balances"*, se activa en segundo plano la vista de **Métricas Globales** con sincronización automática de todas las cuentas reales.
  - El usuario puede navegar directamente a las demás pestañas (*Dashboard & Métricas*, *Rendimiento por mes*, *Calendario Diario*, *Registro de Trades* y *Galería & Análisis*) y visualizar de inmediato las estadísticas globales consolidadas.
  - Al regresar a *"Tus Cuentas"*, se restablece el estado para mantener limpia la pantalla de selección inicial.

---

## [v3.4.3] - 2026-11-02

### 🎯 Visibilidad Contextual de Metas
- **Ocultamiento Estricto en Selección de Cuentas y Vista Global:**
  - La pestaña *"Metas"* ahora permanece completamente oculta mientras el usuario esté en *"Tus Cuentas"* (pantalla principal de selección de cuentas/sesiones) o en *"Métricas globales"*, evitando inconsistencias ya que las metas son exclusivas de cada cuenta individual.
  - Al ingresar a una cuenta con metas configuradas, la pestaña se activa automáticamente en tiempo real.

---

## [v3.4.2] - 2026-11-02

### 📊 Reorganización Ejecutiva del Dashboard
- **Objetivos & Distribución al lado de la Gráfica de Equidad:**
  - Se trasladó la tarjeta de *Objetivos & Distribución* a la fila superior junto a la gráfica de *Evolución de la Cuenta ($)* (`lg:col-span-1`), sustituyendo el antiguo gráfico circular y reuniendo en un mismo plano la curva de rendimiento y los objetivos clave (Operaciones, Profit factor, R:R medio, Distribución y TP1/TP2/TP3/SL).
- **Fila Panorámica de 4 Columnas para Efectividades:**
  - Las 4 tarjetas de desglose (*Activo/Par*, *Sesión*, *Tendencia*, *Día de la semana*) ahora se distribuyen en una fila equilibrada de 4 columnas a todo lo ancho de la pantalla (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

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

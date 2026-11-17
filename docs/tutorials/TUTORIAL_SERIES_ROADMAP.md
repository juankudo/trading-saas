# Hoja de Ruta Oficial de Video Tutoriales AsTrade (Roadmap Multi-Episodio)
## Arquitectura de Pedagogía Institucional, Producción V5 y Estándar Cinematográfico

**Versión:** 1.0.0  
**Fecha de Publicación:** 2026-11-17  
**Plataforma Oficial:** [AsTrade Hub](https://astradehub.com) (`astradehub.com`)  
**Estándar Audiovisual:** Playwright Continuous Master Take V5 | 1080p60/30 | Edge-TTS `es-MX-JorgeNeural` | Zero-Blur Policy  

---

## 1. Visión y Filosofía Pedagógica

La academia de video tutoriales de **AsTrade** está concebida para brindar una experiencia de aprendizaje cinematográfica, analítica y sin fricciones a traders independientes, evaluadores de firmas de fondeo (Prop Firms) y operadores institucionales.

A diferencia de los tutoriales de software convencionales basados en capturas estáticas, diapositivas o transiciones abruptas con pantallas blancas, la serie oficial de AsTrade se rige por tres pilares inquebrantables:

1. **Toma Maestra Continua en Interfaz Real (Master Take V5):** Toda la interacción ocurre dentro de la aplicación real (`app.html`), sin recargas de página (`page.reload`), sin simulaciones falsas ni descalibración de coordenadas. El espectador observa el flujo exacto de trabajo tal como lo vivirá en su navegador.
2. **Pedagogía Cuantitativa y Gestión de Riesgo Institucional:** Cada lección enfatiza el rigor matemático del trading profesional: preservación de capital, cálculo de posición sobre Balance Inicial, monitoreo pico a valle de drawdown y registro estructurado de bitácora técnica (Antes y Después).
3. **Estándar Visual de Nitidez Total (Zero-Blur Policy):** Todo el contenido de la interfaz, tablas numéricas, gráficos de velas y métricas se mantienen 100% nítidos, enfocados y perfectamente legibles en 1080p. Se erradica por completo cualquier desenfoque o difuminado de fondo.

---

## 2. Estándar de Producción y Políticas Técnicas

### 2.1. Regla de Oro: Prohibición de Filtros de Desenfoque (Zero-Blur Policy)
Por directriz explícita de diseño visual y usabilidad:
- **PROHIBIDO:** El uso de `filter: blur(...)`, `backdrop-filter: blur(...)`, máscaras opacas borrosas o viñetas que emborronen la interfaz o los elementos circundantes.
- **PERMITIDO Y OBLIGATORIO:**
  - **Recuadros Neón Delimitados:** Bordes brillantes nítidos (`border: 2px solid #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);`) para aislar y destacar controles activos sin afectar la legibilidad de la pantalla.
  - **Anillos de Pulso Precisos (`.studio-pulse-ring`):** Marcos esmeralda respirables con micro-escalado (`1.0` a `1.035`) que guían la mirada del usuario de forma dinámica.
  - **Cursores Cinemáticos Glidables:** Punteros vectoriales SVG con movimiento suavizado (curvas Bézier cúbicas `cubic-bezier(0.16, 1, 0.3, 1)`) y ondas de choque nítidas (`#studio-cursor-ripple`).
  - **Badges y Callouts Tipográficos Opacos:** Tarjetas informativas con fondo oscuro sólido de alto contraste (`rgba(11, 15, 25, 0.98)`), tipografía nítida en blanco y esmeralda, y borde perimetral iluminado.

### 2.2. Arquitectura de Grabación en Playwright (Toma Maestra V5)
- **Resolución Nativa:** 1920x1080 píxeles.
- **Color de Fondo Forzado:** Parámetro Chromium `--background-color=0b0f19` y sobreescritura CDP (`Emulation.setDefaultBackgroundColorOverride` a `{r: 11, g: 15, b: 25, a: 1}`) previo a la navegación para erradicar cualquier destello en blanco.
- **Estabilidad de Coordenadas:** Política de cero zoom CSS (`zoom: 1`). La escala visual se realiza mediante dimensionamiento tipográfico en rem (`html { font-size: 17.5px !important; }`).
- **Aislamiento de Sesión:** Supresión total de guías interactivas, confetis y tours mediante inyecciones en `localStorage` (`journal_tour_never_show: 'true'`, `trade_form_spotlight_completed: 'true'`, `window.__VIDEO_RENDER_MODE__ = true`).

### 2.3. Motor de Voz y Fonetización (Edge-TTS)
- **Voz Principal:** `es-MX-JorgeNeural` (voz neuronal masculina de México, tono corporativo, sereno y confiable).
- **Parámetros de Síntesis:** Velocidad `RATE = "+0%"`, Volumen `VOLUME = "+0%"`.
- **Diccionario Fonético Obligatorio (`to_phonetic_spanish`):** Reemplazo estricto de terminología anglosajona (`trading -> tréiding`, `trades -> tréids`, `drawdown -> dróudaun`, `Win Rate -> uín reit`, `Profit Factor -> prófit fáctor`, `Stop Loss -> stóp los`, `Take Profit -> téik prófit`, `FTMO -> Efe Te Eme O`, `AsTrade -> As Trade`, `astradehub punto com -> As Trade jób punto com`).
- **Timing Anclado:** Medición de duración exacta de cada archivo de audio mediante FFprobe para alimentar el archivo `manifest.json`, sincronizando las acciones visuales de Playwright a la milésima de segundo.

### 2.4. Mezcla de Audio y Ducking Cinematográfico (FFmpeg)
- **Pista de Fondo Institucional:** `media/video1_assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`.
- **Atenuación Automática (Ducking):** Nivel de música fijado en `volume=0.065` (-23.7 dB) para asegurar una presencia rítmica elegante sin competir con las frecuencias vocales de JorgeNeural.
- **Transiciones:** Fundidos cruzados `acrossfade=d=0.5:c1=tri:c2=tri` entre bloques y fade out gradual de 2.5s al finalizar el video.

### 2.5. Gobernanza y Cumplimiento de Políticas
- De acuerdo con la directiva `GEMINI.md`, **queda estrictamente prohibido ejecutar `git push`** a ramas remotas de forma autónoma.
- Toda versión y artefacto audiovisual debe documentarse rigurosamente en `CHANGELOG.md` para aprobación del usuario antes de cualquier despliegue.

---

## 3. Hoja de Ruta de los 6 Episodios Oficiales

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     AS TRADE HUB · ACADEMIA OFICIAL DE VIDEO                     │
├─────────────┬─────────────────────────────────────────────────────┬──────────────┤
│ Episodio #1 │ Creación y Configuración de Cuentas de Trading      │ COMPLETADO   │
│ Episodio #2 │ Registro y Auditoría de Trades con Precisión        │ EN PRODUCCIÓN│
│ Episodio #3 │ Control de Drawdown y Reglas de Financiación Prop   │ PLANIFICADO  │
│ Episodio #4 │ Analíticas Avanzadas, Curva de Capital y Calendario │ PLANIFICADO  │
│ Episodio #5 │ Modo Backtesting Profesional y Simulación Histórica │ PLANIFICADO  │
│ Episodio #6 │ Portafolios Multi-Cuenta y Replicación Global Trade │ PLANIFICADO  │
└─────────────┴─────────────────────────────────────────────────────┴──────────────┘
```

---

### Episodio #1: Creación y Configuración de Cuentas de Trading

- **Estado:** Completado (En producción / Master 1080p disponible)
- **Duración Objetivo:** 1:45 min (104.78s reales)
- **Público Objetivo:** Traders que recién ingresan a AsTrade y desean estructurar su capital correctamente.
- **Prerequisitos:** Cuenta registrada o prueba activa en `astradehub.com`.
- **Objetivos Pedagógicos:**
  1. Comprender la diferencia entre Cuentas Reales, Challenges de Prop Firm y Cuentas Fondeadas.
  2. Aprender a fijar el Balance Inicial como ancla matemática obligatoria del cálculo de riesgo.
  3. Configurar el Balance Actual para traders que traen un historial previo.
  4. Parametrizar las reglas de evaluación: Profit Target (8%) y Drawdown Máximo (10%).
- **Vistas y Selectores DOM Clave:**
  - Panel principal de cuentas: `#sessions-grid`
  - Botón de alta: `#btn-new-session`
  - Modal de configuración: `#sessionModal`
  - Formulario: `#inputSessionName`, `#inputSessionBalance`, `#inputSessionBalanceActual`, `#inputAccountStage`, `#inputAccountGoalTargetPct`, `#inputAccountGoalMaxDD`
  - Botón guardar: `#btn-submit-session`
- **Estructura de 3 Actos:**
  - **Acto I (Intro Animado):** Presentación del logo AsTrade y propósito de la lección (0:00 - 0:10).
  - **Acto II (Toma Maestra Continua):** Navegación fluida en `app.html`: apertura de modal, selección de modalidad Challenge, configuración de $100,000 USD y visualización de la tarjeta generada en el grid (0:10 - 1:38).
  - **Acto III (Outro Institucional):** Tarjeta de cierre, invitación a la prueba de 7 días en `astradehub.com` y teaser del Episodio #2 (1:38 - 1:45).
- **Llamada a la Acción (CTA):** *"Comienza hoy tu prueba gratuita en astradehub punto com y lleva tu operativa al nivel profesional."*

---

### Episodio #2: Registro y Auditoría de Trades con Precisión Quirúrgica

- **Estado:** En Producción (Milestone 1 a Milestone 5)
- **Duración Objetivo:** 1:45 - 1:50 min (~105 - 110s)
- **Público Objetivo:** Traders que buscan erradicar el descontrol del lotaje, registrar tesis técnicas visuales y auditar operaciones con rigor institucional.
- **Prerequisitos:** Haber completado el Episodio #1 (cuenta "Fondeo 100K FTMO" disponible en el grid).
- **Objetivos Pedagógicos:**
  1. Dominar el formulario de operaciones `#tradeModal` y la selección de parámetros de mercado (par, sesión, tipo de orden).
  2. Comprender cómo AsTrade calcula el Ratio Riesgo/Beneficio (R:R) de manera instantánea y reactiva.
  3. Visualizar el cálculo automático del tamaño de posición (lotaje exacto) dimensionado sobre el **Balance Inicial ($100,000 USD)** para blindar al trader contra fluctuaciones de capital.
  4. Implementar el ciclo completo de trading: captura y tesis técnica **ANTES** de la entrada (pegado directo `Ctrl+V`), pase a estado `Activa`, y posterior auditoría **DESPUÉS** con salida en `Full TP`.
  5. Constatar el impacto inmediato en el avance de objetivos del Challenge (Profit Target a 37.5%, Drawdown 100% intacto, actualización en Bitácora Visual y Calendario).
- **Vistas y Selectores DOM Clave:**
  - Tarjeta de cuenta en grid: `#sessions-grid > div:first-child button[data-account-action="metrics"]` o llamada directa `enterGroup(id)`
  - Botón nueva orden: `#btn-new-trade`
  - Modal de trading: `#tradeModal`, `#tradeForm`
  - Campos de entrada: `#inputFecha`, `#inputHora`, `#inputPar`, `#inputSesion`, `#inputTendencia`, `#inputOrden`
  - Gestión de riesgo y cálculo: `#inputPipsSL`, `#inputPipsTP`, `#inputRR`, `#inputRiesgo`, `#inputLotajeCalc`
  - Bitácora visual bifurcada: `#inputNotaAntes`, `#inputCapturasAntes`, `#imagesPreviewAntes`, `#inputNotaDespues`, `#inputCapturasDespues`, `#imagesPreviewDespues`
  - Control de estado y guardado: `#inputEstado`, `#btn-submit-trade`
  - Verificación en interfaz: `#tab-btn-journal`, `#journal-table-body`, `#tab-btn-goals`, `#section-goals`, `#tab-btn-gallery`
- **Estructura de 3 Actos:**
  - **Acto I (Intro Animado):** Bienvenida, logo neón AsTrade y conexión inmediata con la cuenta configurada en el Tutorial #1 (0:00 - 0:13).
  - **Acto II (Toma Maestra Continua):** Despliegue en 5 bloques narrativos sincronizados:
    1. *Acceso y Parámetros:* Entrar a la cuenta, abrir modal y seleccionar EURUSD en New York con Market Buy (0:13 - 0:28).
    2. *Riesgo y Lotaje Automático:* Configurar 15 pips SL, 45 pips TP (R:R 1:3.0), riesgo 1.0% ($1,000 USD) y destacar el cálculo automático de 6.66 lotes (0:28 - 0:48).
    3. *Bitácora Visual Antes:* Redacción de hipótesis, pegado de captura TradingView y guardado en estado Activa (0:48 - 1:06).
    4. *Auditoría Post-Trade:* Edición de la orden, pase a Full TP (+3.00% / +$3,000 USD), carga de captura posterior y notas de disciplina emocional (1:06 - 1:26).
    5. *Impacto en Prop Firm:* Salto a pestaña Metas: balance $103,000 USD, 37.5% de target alcanzado, drawdown en 0% consumido y revisión en Galería (1:26 - 1:42).
  - **Acto III (Outro Institucional):** Cierre oficial, invitación a la prueba gratuita en `astradehub.com` y anticipación del Episodio #3 sobre control de drawdown (1:42 - 1:50).
- **Llamada a la Acción (CTA):** *"Empieza a auditar tus operaciones como los profesionales. Ingresa ahora a astradehub punto com y activa tus 7 días gratis."*

---

### Episodio #3: Control de Drawdown y Reglas de Financiación Prop Firm

- **Estado:** Planificado (Episodio siguiente)
- **Duración Objetivo:** 1:40 - 1:50 min (~100 - 110s)
- **Público Objetivo:** Traders que operan o preparan evaluaciones en prop firms (FTMO, FundedNext, MFF, etc.) y necesitan evitar a toda costa la quema de cuentas por violaciones de drawdown.
- **Prerequisitos:** Haber completado los Episodios #1 y #2.
- **Objetivos Pedagógicos:**
  1. Comprender la matemática del Drawdown Pico a Valle (Trailing vs Balance Based).
  2. Utilizar el panel de Objetivos de AsTrade (`#section-goals`) como radar de alerta temprana.
  3. Interpretar el medidor de "Colchón de Seguridad Restante" antes de abrir cada trade del día.
  4. Reconocer el semáforo de riesgo (Verde seguro, Amarillo advertencia al 50%, Rojo crítico al 80%).
  5. Conocer el flujo de Avance de Fase: pasar de Evaluación Fase 1 a Fase 2, y posterior conversión a Cuenta Fondeada real.
- **Vistas y Selectores DOM Clave:**
  - Pestaña de metas: `#tab-btn-goals`, `#section-goals`
  - Panel de objetivos de fondeo: `#account-goal-panel`
  - Tarjetas de progreso de Target y Drawdown: contenedores estructurados en `#account-goal-panel .grid > div:nth-child(2)` (Objetivo de beneficio) y `#account-goal-panel .grid > div:nth-child(3)` (Drawdown máximo)
  - Botón de avance de fase en cabecera: `#account-goal-panel button[data-goal-action="advance-phase"]`
  - Modal de transición y celebración de fase: `#phaseCelebrationModal`, `#btn-phase-celebration-continue`
- **Estructura de 3 Actos:**
  - **Acto I (Intro Animado):** La causa #1 de fallo en prop firms: la pérdida de control del drawdown diario y total (0:00 - 0:12).
  - **Acto II (Toma Maestra Continua):** Análisis profundo del panel de metas en una cuenta con trades mixtos; demostración de cómo el colchón se calcula en tiempo real; simulación de una alerta de pérdida máxima evitada a tiempo; y desbloqueo del botón de avance de fase tras alcanzar el 8% (0:12 - 1:38).
  - **Acto III (Outro Institucional):** Llamado a la acción en `astradehub.com` y anuncio del Episodio #4 sobre analíticas cuantitativas (1:38 - 1:46).
- **Llamada a la Acción (CTA):** *"Protege tu cuenta de fondeo con el sistema de control de riesgo de AsTrade. Pruébalo gratis en astradehub punto com."*

---

### Episodio #4: Analíticas Avanzadas, Curva de Capital y Calendario de Consistencia

- **Estado:** Planificado
- **Duración Objetivo:** 1:45 - 2:00 min (~105 - 120s)
- **Público Objetivo:** Traders que quieren pasar de operar por intuición a basar sus decisiones en métricas estadísticas reales (Edge cuantitativo).
- **Prerequisitos:** Disponer de una cuenta con al menos 15 a 30 trades registrados.
- **Objetivos Pedagógicos:**
  1. Interpretar las métricas reinas: Win Rate real (incluyendo BE en el cálculo para evitar métricas infladas), Profit Factor institucional y Esperanza Matemática.
  2. Analizar la Curva de Equidad acumulada y detectar rachas perdedoras o estancamientos.
  3. Filtrar el rendimiento por Activo (ej. rentabilidad en XAUUSD vs EURUSD) y por Sesión (Londres vs New York).
  4. Auditar el Calendario Diario (`#section-calendar`) y Calendario Mensual (`#section-monthly`) para identificar patrones de consistencia día a día.
- **Vistas y Selectores DOM Clave:**
  - Pestaña analítica principal: `#tab-btn-dashboard`, `#section-dashboard`
  - Tarjetas KPI: `#kpi-winrate` (Efectividad global), `#kpi-edge` (Profit Factor), `#kpi-return` (Retorno total), `#kpi-avg-rr` (R:R promedio)
  - Lienzo de Curva de Capital: `<canvas id="equityChart">` (`#equityChart`)
  - Filtro por activos y sesiones: `#filterPar`, `#filterSesion`
  - Pestaña calendario: `#tab-btn-calendar`, `#section-calendar`, `#tab-btn-monthly`, `#section-monthly`
- **Estructura de 3 Actos:**
  - **Acto I (Intro Animado):** De la opinión a los datos: cómo el análisis estadístico transforma a un operador principiante en rentable (0:00 - 0:12).
  - **Acto II (Toma Maestra Continua):** Recorrido por el Dashboard de analíticas; análisis de la curva de capital ascendente; filtrado por sesiones que revela que el trader rinde 70% mejor en New York que en Asia; y navegación al calendario con días coloreados por PnL en dólares y porcentaje (0:12 - 1:42).
  - **Acto III (Outro Institucional):** Cierre institucional, invitación a registrarse en `astradehub.com` y avance del Episodio #5 (1:42 - 1:50).
- **Llamada a la Acción (CTA):** *"Conoce tu verdadera ventaja estadística en los mercados. Descubre tus analíticas gratis en astradehub punto com."*

---

### Episodio #5: Modo Backtesting Profesional y Simulación Histórica

- **Estado:** Planificado
- **Duración Objetivo:** 1:45 - 1:55 min (~105 - 115s)
- **Público Objetivo:** Traders que desean validar estrategias cuantitativas o afinar su plan de trading sin arriesgar capital real.
- **Prerequisitos:** Comprensión de las métricas básicas de AsTrade (Episodios #1 y #2).
- **Objetivos Pedagógicos:**
  1. Conmutar entre el entorno de Cuentas Reales y el Modo Backtesting sin mezclar estadísticas ni ensuciar la bitácora activa.
  2. Crear sesiones de backtesting aisladas asignando un activo exclusivo (ej. NAS100 o XAUUSD) y un marco temporal histórico.
  3. Registrar trades con fechas del pasado utilizando el calendario cronológico inteligente.
  4. Comparar el desempeño de múltiples estrategias de forma paralela.
- **Vistas y Selectores DOM Clave:**
  - Conmutador de modo superior: botones individuales `#btn-mode-real` y `#btn-mode-backtesting` (disparando `setMode(...)`)
  - Panel de sesiones históricas: `#section-sessions` (en modo backtest)
  - Botón nueva sesión de backtest: `#btn-new-session`
  - Formulario de sesión: `#inputSessionName`, `#inputSessionPair`, `#inputSessionBalance`
  - Formulario de trade histórico: `#tradeModal` con referencia de fecha previa
- **Estructura de 3 Actos:**
  - **Acto I (Intro Animado):** La validación histórica: por qué los fondos cuantitativos jamás operan en vivo sin probar previamente 100 operaciones en el pasado (0:00 - 0:12).
  - **Acto II (Toma Maestra Continua):** Conmutación al Modo Backtesting; creación de la sesión "Estrategia Liquidez NY - NAS100"; carga secuencial de tres trades históricos con capturas; y visualización de la curva de rentabilidad simulada (0:12 - 1:38).
  - **Acto III (Outro Institucional):** Cierre, llamado a crear sesiones ilimitadas en `astradehub.com` y anuncio del episodio final sobre gestión de portafolios (1:38 - 1:48).
- **Llamada a la Acción (CTA):** *"Valida tu estrategia con datos históricos confiables antes de poner en juego tu dinero. Pruébalo hoy en astradehub punto com."*

---

### Episodio #6: Gestión de Portafolios y Replicación Multi-Cuenta (Global Trade)

- **Estado:** Planificado
- **Duración Objetivo:** 1:50 - 2:00 min (~110 - 120s)
- **Público Objetivo:** Gestores de capital, copy-traders y operadores con múltiples cuentas de fondeo simultáneas (diversificación por firmas).
- **Prerequisitos:** Disponer de múltiples cuentas creadas en AsTrade (Reales y/o Evaluaciones).
- **Objetivos Pedagógicos:**
  1. Agrupar cuentas en Portafolios temáticos mediante carpetas o grupos (`accountGroupModal`).
  2. Utilizar la herramienta estelar **Global Trade** (`#btn-global-trade`) para registrar una operación y replicarla instantáneamente en 2, 5 o 10 cuentas.
  3. Comprender el dimensionamiento proporcional de lotaje: AsTrade calcula el tamaño de posición individualmente para cada cuenta según su propio Balance Inicial, manteniendo idéntico riesgo porcentual.
  4. Auditar las Métricas Globales consolidadas (`#btn-global-metrics`) para monitorear el PnL y drawdown total de toda la firma en una sola vista.
- **Vistas y Selectores DOM Clave:**
  - Botón Global Trade: `#btn-global-trade`
  - Modal de réplica múltiple: `#tradeModal` en modo global
  - Selector de cuentas participantes: `#globalTradeAccountPanel`, `#globalTradeAccountList`
  - Indicador de lotaje proporcional: `#inputLotajeCalc` ("Por cuenta")
  - Botón de métricas agregadas: `#btn-global-metrics` (ejecuta `openGlobalMetrics()`, conmutando el estado a vista global consolidada mediante `setGlobalMetricsView(true)` en `#section-dashboard`)
  - Vista agregada del portafolio: `#section-dashboard` con KPIs y analíticas consolidadas de todas las cuentas activas
- **Estructura de 3 Actos:**
  - **Acto I (Intro Animado):** El salto a gestor: cómo operar múltiples cuentas de fondeo sin duplicar el trabajo manual ni cometer errores de cálculo (0:00 - 0:14).
  - **Acto II (Toma Maestra Continua):** Acceso al grid; apertura de Global Trade; selección de tres cuentas de diferentes tamaños ($25K, $50K y $100K); configuración de la orden en EURUSD con 1.0% de riesgo; demostración de cómo el sistema ajusta el lotaje de cada una de forma automática; guardado unificado; y consulta del dashboard de métricas consolidadas (0:14 - 1:46).
  - **Acto III (Outro Institucional):** Cierre magistral de la serie oficial, recapitulación de los 6 pilares de AsTrade y llamado a sumarse a la comunidad institucional (1:46 - 1:56).
- **Llamada a la Acción (CTA):** *"Escala tu operativa al nivel de un fondo de inversión profesional. Únete a AsTrade hoy mismo en astradehub punto com."*

---

## 4. Matriz de Dependencias y Continuidad entre Episodios

| Episodio | Estado Inicial Requerido en la App | Datos Generados / Exportados | Asset Visual Necesario |
|---|---|---|---|
| **#1** | App limpia (`localStorage` reseteado con usuario Pro) | Cuenta "Fondeo 100K FTMO" ($100K inicial, $100K actual, Target 8%, DD 10%) | Motion template Intro/Outro |
| **#2** | Cuenta "Fondeo 100K FTMO" seleccionada | 1 trade en `Full TP` (+3.00%), balance $103,000 USD, Target 37.5%, DD 0% | Capturas de trading en HD: `before_setup_eurusd.png` y `after_fulltp_eurusd.png` |
| **#3** | Cuenta con 2 trades previos (1 Win, 1 Loss parcial) | Demostración de colchón restante y habilitación de botón de fase | Gráfico de monitoreo de drawdown |
| **#4** | Cuenta con 20 trades cargados históricamente | Curva de capital estilizada, desglose de sesiones y calendario completo | Gráficos y tablas de analíticas pobladas |
| **#5** | Cambio a modo `Backtesting` | Sesión "Estrategia NY NAS100" con 5 trades históricos | Capturas de velas históricas en NAS100 |
| **#6** | 3 cuentas activas ($25K, $50K, $100K) | Trade replicado en 3 cuentas con lotajes proporcionales (1.66, 3.33, 6.66 lotes) | Vista agrupada y dashboard consolidado |

---

## 5. Protocolo de Verificación e Integridad

Para verificar que esta hoja de ruta cumple con los estándares institucionales de AsTrade:
1. **Verificación de Selectores:** Cada selector DOM y componente listado a lo largo de los 6 episodios (`#sessions-grid`, `#sessionModal`, `#inputAccountGoalTargetPct`, `#inputAccountGoalMaxDD`, `#tradeModal`, `#inputPipsSL`, `#inputRR`, `#inputLotajeCalc`, `#account-goal-panel`, `#phaseCelebrationModal`, `#btn-phase-celebration-continue`, `#equityChart`, `#kpi-winrate`, `#kpi-edge`, `#kpi-return`, `#kpi-avg-rr`, `#filterPar`, `#filterSesion`, `#btn-mode-real`, `#btn-mode-backtesting`, `#btn-global-metrics`) ha sido cotejado y verificado al 100% contra la implementación viva en `app.html` y `js/app.js`.
2. **Verificación de Zero-Blur:** Ningún episodio ni script contemplará desenfoques visuales, priorizando recuadros neón y anillos de pulso precisos.
3. **Verificación de Gobernanza:** Toda modificación de código asociada a la producción de estos episodios permanecerá en ramas y copias locales, documentada en `CHANGELOG.md`, sin ejecución autónoma de `git push`.

# Guión Técnico y Cinemático — Video Tutorial #2 AsTrade
## "Registro y Auditoría de Trades con Precisión Quirúrgica"

**ID de Producción:** `video_02_trades_astrade`  
**Duración Total Calibrada:** 110.00 segundos (1 minuto 50 segundos)  
**Voz Principal:** Edge-TTS `es-MX-JorgeNeural` (Rate: `+0%`, Volume: `+0%`)  
**Pista de Música de Fondo:** `media/video1_assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (Ducking con FFmpeg a `volume=0.065`, -23.7 dB)  
**Arquitectura de Filmación:** Playwright Chromium Continuous Master Take V5 (1920x1080 @ 30fps) sobre `http://127.0.0.1:8089/app.html`  
**Directiva Visual Obligatoria:** **Zero-Blur Policy** (Prohibido cualquier `filter: blur(...)` o `backdrop-filter: blur(...)`). Todos los elementos permanecen 100% nítidos con recuadros neón delimitados, anillos de pulso precisos y cursores vectoriales.  
**Destino de Salida de Audio:** `scratch/video_02/audio/` con archivo de metadatos `manifest_v2.json`  
**Destino de Video Final:** `media/youtube_tutorials/AsTrade_Tutorial_02_Trades_1080p.mp4`  

---

## 1. Diccionario de Normalización Fonética (`to_phonetic_spanish`)

Para garantizar que JorgeNeural pronuncie con dicción nativa anglosajona e impecable acento latinoamericano todos los términos financieros y técnicos:

| Término Escrito | Fonética Generada para JorgeNeural | Propósito / Contexto |
|---|---|---|
| `AsTrade` | `As Trade` | Nombre oficial de marca |
| `astradehub.com` | `As Trade jób punto com` | Dominio institucional oficial |
| `astradehub punto com` | `As Trade jób punto com` | Llamado a la acción en outro |
| `FTMO` | `Efe Te Eme O` | Firma de fondeo de evaluación |
| `trading` | `tréiding` | Actividad operativa |
| `traders` | `tréiders` | Usuarios y operadores |
| `trade` | `tréid` | Operación financiera individual |
| `trades` | `tréids` | Operaciones financieras |
| `Stop Loss` | `stóp los` | Nivel de protección de pérdida |
| `Take Profit` | `téik prófit` | Nivel objetivo de toma de ganancias |
| `Full TP` | `Ful Té Pé` | Salida en objetivo completo de beneficio |
| `Win Rate` | `uín reit` | Tasa de acierto porcentual |
| `Profit Target` | `prófit tárguet` | Meta de beneficio en dólares/porcentaje |
| `Drawdown` | `dróudaun` | Pérdida acumulada pico a valle |
| `Market Buy` | `Márket Bai` | Orden de compra a mercado |
| `Break Even` / `BE` | `Bréik Íven` / `Bé E` | Cierre en punto de equilibrio |
| `EURUSD` | `Euro Dólar` | Par de divisas principal |
| `XAUUSD` | `Oro Dólar` | Par del oro frente al dólar |
| `pips` | `pips` | Unidad de variación de precio |
| `lotaje` | `lotaje` | Tamaño de la posición en lotes |
| `Ctrl+V` | `Control V` | Atajo de teclado para pegar capturas |
| `Dashboard` | `Dáshbord` | Panel de control de analíticas |
| `Challenge` | `Chálendsh` | Evaluación de cuenta fondeada |
| `100,000` / `100K` | `cien mil dólares` / `cien ka` | Balance de la cuenta |
| `1:3.0` | `uno a tres punto cero` | Ratio Riesgo/Beneficio |
| `1.0%` | `uno punto cero por ciento` | Riesgo porcentual por trade |
| `37.5%` | `treinta y siete punto cinco por ciento` | Porcentaje de profit target alcanzado |
| `+$3,000` | `más tres mil dólares` | Ganancia neta generada |

---

## 2. Bloques Narrativos y Cinemáticos (Timeline 0.00s — 110.00s)

```
0.00s ──────── 13.00s ──────── 28.00s ──────── 48.00s ──────── 66.00s ──────── 86.00s ──────── 102.00s ─────── 110.00s
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────────┐
│  BLOQUE 1    │  BLOQUE 2    │  BLOQUE 3    │  BLOQUE 4    │  BLOQUE 5    │  BLOQUE 6    │  BLOQUE 7   │
│  Intro y     │  Apertura y  │  Riesgo y    │  Bitácora    │  Auditoría   │  Impacto en  │  Outro y    │
│  Continuidad │  Setup Orden │  Lotaje Auto │  Visual Antes│  Post-Trade  │  Prop Firm   │  CTA        │
│  (13.00s)    │  (15.00s)    │  (20.00s)    │  (18.00s)    │  (20.00s)    │  (16.00s)    │  (8.00s)    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

---

### Bloque 1: Intro y Continuidad desde Tutorial #1

- **ID del Bloque:** `block1_intro_continuity`
- **Índice:** 1
- **Título:** Introducción y Continuidad: Acceso a Cuenta Fondeo 100K FTMO
- **Tag Visual:** `⚡ CONTINUIDAD · CUENTA FONDEO 100K`
- **Icono:** `⚡`
- **Ventana Temporal:** `0.00s` a `13.00s` (Duración estimada: `13.00s` | 32 palabras | ~2.46 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"Continuando con nuestra cuenta de fondeo de cien mil dólares creada en el tutorial anterior, aprenderemos a registrar y auditar operaciones con cálculo automático de riesgo y bitácora visual antes y después."*
- **Texto Fonético:**
  > *"Continuando con nuestra cuenta de fondeo de cien mil dólares creada en el tutorial anterior, aprenderemos a registrar y auditar operaciones con cálculo automático de riesgo y bitácora visual antes y después."*
- **Estado Inicial de la Aplicación:**
  - `localStorage` contiene la sesión activa del usuario institucional y la cuenta real `Fondeo 100K FTMO` creada en Tutorial #1 con balance inicial de `$100,000` y balance actual de `$100,000`.
  - La pantalla carga directamente en `#section-sessions`, mostrando la tarjeta de la cuenta en `#sessions-grid > div:first-child`.
  - Modo activo: `currentMode = 'real'`.
- **Selectores DOM Involucrados:**
  - Contenedor de cuentas: `#sessions-grid`
  - Tarjeta de la cuenta FTMO: `#sessions-grid > div:first-child`
  - Botón de ingreso / métricas de la tarjeta: `#sessions-grid > div:first-child button[data-account-action="metrics"]` (o navegación directa vía `enterGroup(id)`)
  - Badge de cuenta activa superior: `#active-account-badge`, `#active-account-name`
- **Overlays Visuales Nítidos (Zero-Blur Standard):**
  - **Lower-Third Fijo:** Despliegue en esquina inferior izquierda con fondo sólido `#0b0f19` (sin blur), borde `#10b981` y texto `⚡ TUTORIAL #2 · REGISTRO Y AUDITORÍA DE TRADES`.
  - **Anillo de Pulso Neón:** `.studio-pulse-ring` abrazando la tarjeta de la cuenta de $100K con borde nítido de `2.5px` en `#10b981` y resplandor delimitado.
  - **Cursor Cinemático:** Planeo suave desde el centro hacia el botón "Métricas / Entrar" de la tarjeta y efecto ripple en verde esmeralda al hacer clic.
- **Acciones y Coreografía de Playwright:**
  1. `0.00s - 2.00s`: Aparece el Lower-Third institucional; la tarjeta de la cuenta FTMO de $100K queda enmarcada por el anillo de pulso nítido.
  2. `2.00s - 7.50s`: El cursor virtual `#studio-virtual-cursor` se desliza con curva Bézier suave hacia el botón de entrada de la tarjeta.
  3. `7.50s - 9.00s`: Clic con onda expansiva (`clickRipple()`). La función `enterGroup(id)` conmuta la vista al dashboard de la cuenta y hace visible el badge superior `#active-account-badge` con el nombre "Fondeo 100K FTMO".
  4. `9.00s - 13.00s`: Pausa de absorción temporal para completar la locución mientras se revela el botón superior `#btn-new-trade`.

---

### Bloque 2: Apertura y Parámetros de Mercado

- **ID del Bloque:** `block2_modal_setup`
- **Índice:** 2
- **Título:** Paso 1: Apertura de Modal y Selección de Parámetros
- **Tag Visual:** `📊 PASO 1 · PARÁMETROS OPERATIVOS`
- **Icono:** `📊`
- **Ventana Temporal:** `13.00s` a `28.00s` (Duración estimada: `15.00s` | 39 palabras | ~2.60 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"Hacemos clic en Nueva Entrada para abrir la terminal operativa. Seleccionamos el par Euro Dólar, establecemos la sesión en New York, confirmamos tendencia a favor y ejecutamos una orden de compra a mercado Market Buy."*
- **Texto Fonético:**
  > *"Hacemos clic en Nueva Entrada para abrir la terminal operativa. Seleccionamos el par Euro Dólar, establecemos la sesión en New York, confirmamos tendencia a favor y ejecutamos una orden de compra a mercado Márket Bai."*
- **Estado de la Aplicación:**
  - Botón `#btn-new-trade` activo.
  - Al hacer clic, se dispara `openTradeModal()`, renderizando `#tradeModal` y `#tradeForm`.
  - Fecha y hora se auto-completan con los valores del día en curso.
- **Selectores DOM Involucrados:**
  - Botón disparador: `#btn-new-trade`
  - Modal de trading: `#tradeModal`
  - Selector de par: `#inputPar`
  - Selector de sesión: `#inputSesion`
  - Selector de tendencia: `#inputTendencia`
  - Selector de tipo de orden: `#inputOrden`
- **Overlays Visuales Nítidos (Zero-Blur Standard):**
  - **Callout Badge Flotante:** Posicionado de forma no invasiva sobre el encabezado del modal: `📊 SETUP TÉCNICO · CONFLUENCIAS NY`. Fondo opaco `rgba(11, 15, 25, 0.98)` y halo esmeralda.
  - **Resaltador Perimetral:** Borde brillante sin desenfoque (`box-shadow: 0 0 10px #10b981`) sobre cada selector conforme el cursor interactúa con él.
- **Acciones y Coreografía de Playwright:**
  1. `13.00s - 15.50s`: El cursor planea hasta `#btn-new-trade`. Clic con ripple. Se abre `#tradeModal` suavemente.
  2. `15.50s - 18.50s`: El cursor viaja a `#inputPar`. Se selecciona la opción `EURUSD`. Se dispara `calculatePositionSize()`.
  3. `18.50s - 21.50s`: El cursor selecciona `#inputSesion` fijando el valor en `"New York"`.
  4. `21.50s - 24.50s`: El cursor selecciona `#inputTendencia` en `"Favor"`.
  5. `24.50s - 28.00s`: El cursor conmuta `#inputOrden` a `"Market Buy"`. El callout superior confirma los parámetros.

---

### Bloque 3: Gestión de Riesgo y Cálculo de Lotaje Automático

- **ID del Bloque:** `block3_risk_lots`
- **Índice:** 3
- **Título:** Paso 2: Stop Loss, Take Profit, Ratio R:R y Lotaje Institucional
- **Tag Visual:** `🎯 PASO 2 · RIESGO Y LOTAJE AUTOMÁTICO`
- **Icono:** `🎯`
- **Ventana Temporal:** `28.00s` a `48.00s` (Duración estimada: `20.00s` | 52 palabras | ~2.60 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"Definimos quince pips de Stop Loss y cuarenta y cinco de Take Profit. La bitácora calcula al instante un ratio uno a tres punto cero. Con un riesgo del uno por ciento, AsTrade calcula automáticamente el lotaje exacto sobre tu balance inicial, protegiendo tu cuenta de sobreapalancamiento."*
- **Texto Fonético:**
  > *"Definimos quince pips de stóp los y cuarenta y cinco de téik prófit. La bitácora calcula al instante un ratio uno a tres punto cero. Con un riesgo del uno punto cero por ciento, As Trade calcula automáticamente el lotaje exacto sobre tu balance inicial, protegiendo tu cuenta de sobreapalancamiento."*
- **Estado de la Aplicación:**
  - Valores inyectados: `inputPipsSL = 15`, `inputPipsTP = 45`.
  - La función reactiva `calculateRR()` actualiza `#inputRR` con el valor exacto `3.00`.
  - El selector de riesgo fija `inputRiesgo = "1.0"` ($1,000 USD sobre el balance inicial de $100,000 USD).
  - La función reactiva `calculatePositionSize()` calcula:
    $$\text{Lots} = \frac{100,000 \times 0.01}{15 \times 10} = \frac{1,000}{150} = 6.66\text{ lotes}$$
  - El contenedor `#inputLotajeCalc` muestra en azul de alto contraste: `6.66 lotes`.
- **Selectores DOM Involucrados:**
  - Entrada Stop Loss: `#inputPipsSL`
  - Entrada Take Profit: `#inputPipsTP`
  - Display de Ratio R:R: `#inputRR`
  - Selector de Riesgo: `#inputRiesgo`
  - Display de Lotaje Calculado: `#inputLotajeCalc`
  - Texto de ayuda de lotaje: `#inputLotajeHelp`
- **Overlays Visuales Nítidos (Zero-Blur Standard):**
  - **Recuadro Neón en Ratio R:R:** Marco amarillo dorado delimitado (`border: 2px solid #eab308; box-shadow: 0 0 12px rgba(234, 179, 8, 0.6)`) resaltando el badge `1:3.0`.
  - **Anillo de Pulso en Lotaje:** `.studio-pulse-ring` enmarcando `#inputLotajeCalc` destacando los `6.66 lotes` en tipografía ultra nítida.
  - **Callout Explicativo:** Badge anclado con el texto: `🛡️ PROTECCIÓN DE CAPITAL · BALANCE INICIAL $100,000 USD`.
- **Acciones y Coreografía de Playwright:**
  1. `28.00s - 32.50s`: Typewriter suave escribiendo `15` en `#inputPipsSL`.
  2. `32.50s - 37.00s`: Typewriter suave escribiendo `45` en `#inputPipsTP`. `calculateRR()` salta de inmediato a `3.00`. Se activa el marco neón en `#inputRR`.
  3. `37.00s - 41.00s`: El cursor selecciona `#inputRiesgo` en `1.0%`.
  4. `41.00s - 48.00s`: Spotlight sin desenfoque (anillo esmeralda pulsante) sobre `#inputLotajeCalc` mostrando `6.66 lotes`. Se muestra el callout de protección institucional sobre Balance Inicial.

---

### Bloque 4: Bitácora Visual (Antes), Captura y Estado Activa

- **ID del Bloque:** `block4_visual_before_active`
- **Índice:** 4
- **Título:** Paso 3: Tesis Técnica Antes de Entrar, Pegado de Captura y Trade en Curso
- **Tag Visual:** `📸 PASO 3 · BITÁCORA TÉCNICA (ANTES)`
- **Icono:** `📸`
- **Ventana Temporal:** `48.00s` a `66.00s` (Duración estimada: `18.00s` | 47 palabras | ~2.61 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"En la bitácora visual, redactamos la tesis técnica antes de entrar y pegamos la captura de TradingView con Control V. Marcamos el estado como Activa y guardamos. El trade queda registrado en tu historial para acompañar su evolución en el mercado sin alterar tus estadísticas."*
- **Texto Fonético:**
  > *"En la bitácora visual, redactamos la tesis técnica antes de entrar y pegamos la captura de Tréiding Viú con Control V. Marcamos el estado como Activa y guardamos. El tréid queda registrado en tu historial para acompañar su evolución en el mercado sin alterar tus estadísticas."*
- **Estado de la Aplicación:**
  - `inputNotaAntes` recibe la tesis técnica del trader.
  - Se adjunta la captura de alta resolución `media/video2_assets/charts/before_setup_eurusd.png` a través del sistema de compresión WebP, apareciendo en `#imagesPreviewAntes`.
  - `#inputEstado` se fija en `"Activa"`.
  - Al hacer clic en `#btn-submit-trade`, se ejecuta `saveTrade(event)`, la orden se almacena en `trades`, se cierra el modal y se renderiza `#journal-table-body` con el nuevo registro exhibiendo badge azul `Activa`.
- **Selectores DOM Involucrados:**
  - Área de notas antes: `#inputNotaAntes`
  - Input de capturas antes: `#inputCapturasAntes`
  - Contenedor de miniaturas antes: `#imagesPreviewAntes`
  - Selector de estado: `#inputEstado`
  - Botón de guardado: `#btn-submit-trade`
  - Tabla de historial: `#journal-table-body`
  - Fila del trade activo: `#journal-table-body tr:first-child`
- **Overlays Visuales Nítidos (Zero-Blur Standard):**
  - **Recuadro Azul Eléctrico en Columna ANTES:** Borde perimetral nítido (`border: 2px solid #3b82f6; box-shadow: 0 0 14px rgba(59, 130, 246, 0.5)`) sobre el panel izquierdo de capturas.
  - **Callout de Pegado:** Badge con icono `📋 CONTROL+V SIMULADO · CAPTURA HD ADJUNTADA`.
  - **Anillo de Pulso en Fila de Tabla:** Al cerrarse el modal, la primera fila de la tabla parpadea con un halo esmeralda nítido confirmando el registro.
- **Acciones y Coreografía de Playwright:**
  1. `48.00s - 53.00s`: Typewriter en `#inputNotaAntes`: *"Quiebre estructural y sweep de liquidez en sesión NY."*
  2. `53.00s - 57.50s`: Simulación de pegado instantáneo (`Ctrl+V`) inyectando `before_setup_eurusd.png`. Aparece la miniatura en `#imagesPreviewAntes` con borde nítido.
  3. `57.50s - 60.50s`: El cursor selecciona `#inputEstado` en `"Activa"`.
  4. `60.50s - 63.00s`: El cursor viaja a `#btn-submit-trade`. Clic con ripple. El modal se cierra suavemente.
  5. `63.00s - 66.00s`: Navegación visual a la tabla de operaciones `#journal-table-body`: el trade aparece listado con badge azul `Activa`, demostrando que no afecta el balance mientras corre en el mercado.

---

### Bloque 5: Auditoría Post-Trade y Cierre en Full TP

- **ID del Bloque:** `block5_post_trade_audit`
- **Índice:** 5
- **Título:** Paso 4: Auditoría Post-Trade, Captura Después y Cierre en Full TP
- **Tag Visual:** `🎯 PASO 4 · AUDITORÍA POST-TRADE (FULL TP)`
- **Icono:** `🎯`
- **Ventana Temporal:** `66.00s` a `86.00s` (Duración estimada: `20.00s` | 52 palabras | ~2.60 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"Al tocar el objetivo, abrimos la edición de la orden. Actualizamos el estado a Full TP, pegamos la captura de cierre en la columna Después y registramos nuestras notas de gestión. Esta auditoría sistemática es el hábito definitivo que separa a los traders rentables de la mayoría."*
- **Texto Fonético:**
  > *"Al tocar el objetivo, abrimos la edición de la orden. Actualizamos el estado a Ful Té Pé, pegamos la captura de cierre en la columna Después y registramos nuestras notas de gestión. Esta auditoría sistemática es el hábito definitivo que separa a los tréiders rentables de la mayoría."*
- **Estado de la Aplicación:**
  - Se hace clic en el botón de edición de la fila en `#journal-table-body`.
  - Se reabre `#tradeModal` con título "Editar Operación" y los datos cargados.
  - `#inputEstado` conmuta de `"Activa"` a `"Full TP"`.
  - `inputNotaDespues` recibe la nota de gestión psicológica y cumplimiento de plan.
  - Se adjunta la captura de salida `media/video2_assets/charts/after_fulltp_eurusd.png` en `#imagesPreviewDespues`.
  - Al guardar, el resultado se computa como:
    $$\text{PnL} = 1.0\% \times 3.0 = +3.00\% \quad (+\$3,000\text{ USD})$$
  - El balance acumulado de la cuenta pasa de `$100,000` a `$103,000 USD`.
- **Selectores DOM Involucrados:**
  - Botón editar en tabla: `#journal-table-body tr:first-child button[title*="Editar"]` o botón de lápiz
  - Selector de estado: `#inputEstado`
  - Área de notas después: `#inputNotaDespues`
  - Input de capturas después: `#inputCapturasDespues`
  - Contenedor de miniaturas después: `#imagesPreviewDespues`
  - Botón guardar: `#btn-submit-trade`
- **Overlays Visuales Nítidos (Zero-Blur Standard):**
  - **Recuadro Púrpura en Columna DESPUÉS:** Borde delimitado (`border: 2px solid #a855f7; box-shadow: 0 0 14px rgba(168, 85, 247, 0.5)`).
  - **Callout de Resultado Positivo:** Badge opaco: `🎯 FULL TP REGISTRADO · +$3,000 USD (+3.00%)`.
  - **Cursor Guiado:** Animación precisa hacia el botón de guardar.
- **Acciones y Coreografía de Playwright:**
  1. `66.00s - 70.00s`: El cursor hace clic en el icono de edición de la fila. `#tradeModal` se reabre con título "Editar Operación".
  2. `70.00s - 74.00s`: El cursor conmuta `#inputEstado` a `"Full TP"`.
  3. `74.00s - 78.50s`: Typewriter en `#inputNotaDespues`: *"Take Profit alcanzado sin drawdown; plan respetado al 100%."*
  4. `78.50s - 82.50s`: Inyección instantánea de la captura `after_fulltp_eurusd.png` en la columna derecha. Aparece la miniatura en `#imagesPreviewDespues`.
  5. `82.50s - 86.00s`: Clic en `#btn-submit-trade`. El modal se cierra y la fila de la tabla se actualiza con badge verde esmeralda `Full TP` y `+$3,000.00`.

---

### Bloque 6: Impacto Inmediato en Reglas de Prop Firm y Galería

- **ID del Bloque:** `block6_prop_firm_impact`
- **Índice:** 6
- **Título:** Paso 5: Avance de Metas de Fondeo, Drawdown Intacto y Galería Visual
- **Tag Visual:** `📈 PASO 5 · IMPACTO EN REGLAS DE EVALUACIÓN`
- **Icono:** `📈`
- **Ventana Temporal:** `86.00s` a `102.00s` (Duración estimada: `16.00s` | 42 palabras | ~2.62 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"Al guardar, tu balance sube a ciento tres mil dólares. La barra de Profit Target avanza al treinta y siete punto cinco por ciento de tu meta, mientras el colchón de drawdown permanece cien por ciento intacto. En la pestaña Galería, revisas tu análisis completo lado a lado."*
- **Texto Fonético:**
  > *"Al guardar, tu balance sube a ciento tres mil dólares. La barra de prófit tárguet avanza al treinta y siete punto cinco por ciento de tu meta, mientras el colchón de dróudaun permanece cien por ciento intacto. En la pestaña Galería, revisas tu análisis completo lado a lado."*
- **Estado de la Aplicación:**
  - El balance de la cuenta es ahora `$103,000.00 USD`.
  - En `#section-goals`:
    - Profit Target requerido: `$8,000 USD` (8%).
    - Ganancia actual: `+$3,000 USD`.
    - Progreso de meta: $\frac{3,000}{8,000} \times 100 = 37.5\%$.
    - Drawdown consumido: `0.00%` (Colchón de seguridad: `$10,000 USD` 100% intacto, en verde esmeralda).
  - Al cambiar a `#tab-btn-gallery`, la vista `#section-gallery` despliega la tarjeta con las capturas de ANTES y DESPUÉS en comparativa lado a lado con sus respectivas notas.
- **Selectores DOM Involucrados:**
  - Pestaña de Metas: `#tab-btn-goals`, `#section-goals`
  - Panel de objetivos de fondeo: `#account-goal-panel`
  - Tarjeta y Barra de Profit Target: `#account-goal-panel .grid > div:nth-child(2)`
  - Tarjeta y Barra de Drawdown restante: `#account-goal-panel .grid > div:nth-child(3)`
  - Pestaña de Galería: `#tab-btn-gallery`, `#section-gallery`
  - Contenedor de tarjetas visuales: `#gallery-cards-container`
- **Overlays Visuales Nítidos (Zero-Blur Standard):**
  - **Recuadro Neón en Barra de Profit Target:** Marco delimitado en verde esmeralda destacando el avance al `37.5%` ($3,000 de $8,000).
  - **Anillo de Pulso en Colchón de Drawdown:** Anillo de pulso respirable destacando el `100% de colchón intacto` ($10,000 USD disponibles).
  - **Callout de Galería:** Badge deslizante: `🖼️ BITÁCORA COMPARATIVA · ANTES Y DESPUÉS`.
- **Acciones y Coreografía de Playwright:**
  1. `86.00s - 90.50s`: El cursor hace clic en `#tab-btn-goals`. Se revela el panel de reglas de evaluación.
  2. `90.50s - 94.50s`: Spotlight sin desenfoque (anillo esmeralda) sobre la barra de Profit Target: se observa el salto del balance a `$103,000 USD` y la barra al `37.5%`.
  3. `94.50s - 98.00s`: El cursor señala la barra de Drawdown Máximo, confirmando el 0% de consumo y el colchón total de $10,000 USD.
  4. `98.00s - 102.00s`: Clic en `#tab-btn-gallery`. Se despliega la tarjeta con las capturas de TradingView antes y después perfectamente alineadas.

---

### Bloque 7: Outro Institucional y Llamado a la Acción

- **ID del Bloque:** `block7_outro_cta`
- **Índice:** 7
- **Título:** Outro Institucional, Llamado a la Acción y Teaser Tutorial #3
- **Tag Visual:** `🚀 OUTRO · ASTRADE HUB`
- **Icono:** `🚀`
- **Ventana Temporal:** `102.00s` a `110.00s` (Duración estimada: `8.00s` | 21 palabras | ~2.62 palabras/seg)
- **Texto en Español para JorgeNeural:**
  > *"Comienza hoy tu prueba gratuita de siete días en astradehub punto com. En el próximo tutorial: cómo blindar tu cuenta dominando el control de drawdown."*
- **Texto Fonético:**
  > *"Comienza hoy tu prueba gratuita de siete días en As Trade jób punto com. En el próximo tutorial: cómo blindar tu cuenta dominando el control de dróudaun."*
- **Estado de la Aplicación:**
  - Finalización de la Toma Maestra Continua en `app.html`.
  - Ensamblado cinemático con la escena Outro en `scripts/render/intro_outro_motion.html?mode=outro&tutorial=2`.
- **Selectores y Elementos Visuales:**
  - Logotipo oficial de AsTrade en vector esmeralda neón `#10b981`.
  - Badge central con la dirección web: `astradehub.com`.
  - Subtítulo promocional: `Prueba 7 Días Gratis · Sin Tarjeta Requerida`.
  - Tarjeta de avance: `Próximo: Tutorial #3 · Control de Drawdown y Reglas Prop Firm`.
- **Acciones y Transición FFmpeg:**
  1. `102.00s - 104.00s`: Transición suave `xfade=transition=fade:duration=0.5` desde `app.html` hacia la escena animada del Outro.
  2. `104.00s - 108.00s`: JorgeNeural despacha la llamada a la acción y anuncia el Tutorial #3.
  3. `108.00s - 110.00s`: Fade-out final de música y video hasta negro absoluto (`#0b0f19`), cerrando la toma de 110.0 segundos exactos.

---

## 3. Resumen de Sincronización y Manifiesto de Producción

| ID de Bloque | Título / Propósito | Palabras | Duración (s) | Offset Inicio (s) | Offset Fin (s) | Selector DOM Clave |
|---|---|---|---|---|---|---|
| `block1_intro_continuity` | Continuidad y cuenta FTMO 100K | 32 | 13.00s | 0.00s | 13.00s | `#sessions-grid` |
| `block2_modal_setup` | Apertura modal, par, sesión, orden | 39 | 15.00s | 13.00s | 28.00s | `#tradeModal`, `#inputPar` |
| `block3_risk_lots` | SL, TP, RR (1:3.0) y lotes (6.66) | 52 | 20.00s | 28.00s | 48.00s | `#inputRR`, `#inputLotajeCalc` |
| `block4_visual_before_active` | Tesis Antes, captura y estado Activa | 47 | 18.00s | 48.00s | 66.00s | `#inputNotaAntes`, `#inputCapturasAntes` |
| `block5_post_trade_audit` | Edición, Full TP (+3%), captura Después | 52 | 20.00s | 66.00s | 86.00s | `#inputEstado`, `#inputCapturasDespues` |
| `block6_prop_firm_impact` | Metas ($103K, 37.5%), DD intacto y Galería | 42 | 16.00s | 86.00s | 102.00s | `#section-goals`, `#tab-btn-gallery` |
| `block7_outro_cta` | Cierre, llamado astradehub.com y Ep #3 | 21 | 8.00s | 102.00s | 110.00s | `intro_outro_motion.html` |
| **TOTAL GENERAL** | **7 Bloques Narrativos Sincronizados** | **285** | **110.00s** | **0.00s** | **110.00s** | **Resolución 1920x1080 30fps** |

---

## 4. Contrato de Integración para los Siguientes Hitos

- **Para Milestone 2 (`generate_video_02_audio.py`):**
  - Los 7 textos en español de este guión deben integrarse en la estructura `BLOCKS` del generador de audio.
  - El generador aplicará `to_phonetic_spanish()` con la tabla de la Sección 1 y creará `scratch/video_02/audio/manifest_v2.json`.
  - La duración medida por FFprobe debe contrastarse contra la columna "Duración (s)" para calibrar los milisegundos de espera en Playwright.
- **Para Milestone 3 (`render_video_02_astrade.py`):**
  - La grabación consumirá `manifest_v2.json`.
  - Cada bloque ejecutará sus acciones dentro de la ventana de tiempo relativa `rem = target_end - (time.time() - t_start)`.
  - Se utilizarán exclusivamente recuadros neón con `border: 2px solid #10b981` y anillos de pulso precisos, respetando rigurosamente la regla de **Zero-Blur**.

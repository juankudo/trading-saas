# 📜 Registro de Versiones (Changelog) — AsTrade

Todas las modificaciones, mejoras y correcciones notables de AsTrade están documentadas en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y adhiere al versionado semántico.

---

## [v3.9.6] - 2026-11-20

### 🌐 Localización Reactiva de Métricas Globales, Tabla de Balances, Guías, Pastilla de Sincronización y Tarjetas de Cuentas
- **Pastilla de Sincronización en la Nube Reactiva (`js/cloud-storage.js`):**
  - Desacoplado el paso de cadenas literales en español (`'Sincronizado'`, `'Sincronizando...'`, `'Error de sincronización'`) en las llamadas a `updateCloudSyncIndicator`.
  - Vinculación declarativa con `data-i18n` y `data-i18n-title`, permitiendo que el estado de sincronización refleje inmediatamente el idioma activo (`Synced` / `Sincronizado`, `Synced with cloud` / `Sincronizado con la nube`, `Syncing with cloud...` / `Sincronizando con la nube...`) tanto al cargar la app como al alternar el idioma en caliente sin recargar.
- **Selector de Modo en Barra Superior (`app.html`):**
  - Etiquetado de los botones de modo con `data-i18n="nav.mode_real"` y `data-i18n="nav.mode_backtesting"`, traduciendo con precisión `"Cuenta Real"` a `"Live Account"` y preservando la terminología técnica institucional.
- **Localización Completa de Tarjetas de Cuentas (`js/app.js` & `js/i18n.js`):**
  - Sub-etiquetas de objetivos y fases traducidas: `"Objetivo 8% · F1"` a `"Target 8% · P1"`, `"DD máx 10%"` a `"Max DD 10%"`, y `"usado"` a `"used"`.
  - Estados de cuentas fondeadas e instantáneas: `"Retirable"` traducido dinámicamente a `"Withdrawable"`.
  - Encabezado de chips de cumplimiento de reglas de evaluación: `"Reglas:"` traducido a `"Rules:"`.
- **Localización Completa de Descripciones y Tooltips del Menú Guía y Barra de Herramientas (`app.html`, `js/app.js`, `js/i18n.js`):**
  - Tooltips de navegación totalmente reactivos: Guía (`Guides & interactive help`), Calculadora (`Open Lot Size Calculator in new tab`), Suscripción (`View plans & subscription`), Sincronización en la nube (`Synced with cloud` / `Syncing with cloud...`) y Reinicio de entorno (`Reset Environment`).
  - Menú desplegable de Guía traducido al 100%: "Tour General" (`General Tour`), "Entrada y Post-Análisis" (`Entry & Post-Analysis`) y "Tutoriales en Video" (`Video Tutorials`) con descripciones operativas completas y enlaces oficiales a YouTube.
  - Pasos del tour guiado de formulario (`showFormStep`) y ciclo de vida de operaciones (`tradeLifecycleModal`) totalmente sincronizados con botones "Next", "Back", "Understood!" y "Done!".
  - Pastilla de usuario y suscripción en el Navbar traducida dinámicamente (`User: <email>`, `7-day Trial`, `Trial: <días>d`, `Read-Only`, `Pro Active`).
- **Badge Reactivo de Métricas Globales (`js/app.js`):**
  - Implementado enlace dinámico `data-i18n="tabs.global_metrics"` en `#active-account-name` y `data-i18n-title` en `#active-account-badge`.
  - El badge superior en la barra de pestañas responde instantáneamente a cambios de idioma en caliente (`Global Metrics` en inglés, `Métricas globales` en español), tanto en la vista de Dashboard/Métricas como en Seguimiento de Balances.
- **Localización Completa de Tabla de Balances Históricos (`js/app.js` & `js/i18n.js`):**
  - Encabezados de columnas traducidos bilingüemente: "Fecha" (`Date`) y "Acciones" (`Actions`).
  - Agrupadores de cuentas traducidos: "Sin grupo" (`Ungrouped`), "Total del grupo" (`Group Total`) y fallback "Grupo" (`Group`).
  - Mensajes de estado vacío y pistas operativas bilingües (`balance.no_records_hint`, `balance.empty`, `balance.partial_note`).
  - Tooltips de acciones traducidos: "Editar registro" (`Edit record`) y "Eliminar registro" (`Delete record`).
- **Cache-Busting de Recursos Estáticos (`app.html` & `calculadora/index.html`):**
  - Incorporado versionado dinámico (`?v=3.9.6`) en enlaces de estilos CSS (`css/styles.css?v=3.9.6`) y scripts de internacionalización (`js/i18n.js?v=3.9.6`, `js/app.js?v=3.9.6`).
  - Evita inconsistencias de renderizado por caché del navegador del cliente, garantizando la aplicación inmediata de estilos de alto contraste en Modo Claro de la Calculadora y traducciones reactivas.
- **Normalización de Estilo en Acciones de Sesión:**
  - Ajustado `"New Group"` con Title Case consistente en inglés para alinearse con `Bulk Entry`, `Global Metrics` y `New Account +`.

---

## [v3.9.5] - 2026-11-20

### 🌐 Internacionalización Completa Bilingüe (ES / EN) & Submarca AsTrade Calculator
- **Lanzamiento de Submarca Oficial "AsTrade Calculator":**
  - Creación del nuevo isotipo vectorial oficial (`assets/logo/astrade-calculator-mark.svg`), combinando la geometría ascendente característica de AsTrade con una retícula de calibración y punto de mira para cálculo de riesgo milimétrico.
  - Nuevo badge visual `POSITION & RISK PRO` con gradiente esmeralda AsTrade (`#059669` → `#10b981` → `#34d399`).
  - Cohesión total de marca: Renombrado de la calculadora a **AsTrade Calculator**, alineando la interfaz, metadatos, favicons y barra de navegación superior.
- **Motor Reactivo de Internacionalización Bilingüe (`js/i18n.js`):**
  - Arquitectura modular ultraligera y reactiva con diccionarios completos en español e inglés.
  - Soporte para atributos declarativos `data-i18n`, `data-i18n-placeholder`, `data-i18n-title` y `data-i18n-aria-label`.
  - Disparo de eventos desacoplados `languageChanged` para actualización inmediata de interfaces complejas y gráficos sin necesidad de recargar la página.
  - Sincronización bidireccional y persistencia unificada mediante `astrade_lang` y `app_lang` en `localStorage`, garantizando continuidad de idioma al navegar entre Landing Page (`index.html` / `en.html`), App Principal (`app.html`) y Calculadora (`calculadora/index.html`).
- **Localización Exhaustiva de Navegación, Toolbar y Sesiones (`app.html`, `js/app.js` & `js/payments.js`):**
  - **Pestañas de Navegación Localizadas:** Cobertura 100% de las subpestañas superiores: "Tus Cuentas" (`Your Accounts`), "Seguimiento de balances" (`Balance History`), "Dashboard & Métricas" (`Dashboard & Metrics`), "Metas" (`Goals`), "Registro de Trades" (`Trade Log`), "Rendimiento por mes" (`Monthly Performance`), "Calendario Diario" (`Daily Calendar`), y "Galería & Análisis" (`Gallery & Analysis`).
  - **Barra de Herramientas Dinámica:** Botón de carpeta sincronizado reactivamente con prefijos de idioma (`Carpeta: <nombre>` / `Folder: <nombre>`) y etiqueta por defecto (`Carpeta JSON` / `JSON Folder`), junto con botones y desplegables de "Exportar" (`Export`), "Respaldar (JSON)" (`Backup (JSON)`), "Data Excel (CSV)" (`Excel Data (CSV)`), e "Importar" (`Import`).
  - **Botones y Encabezados de Sesiones:** Traducción bilingüe de "Entrada múltiple" (`Bulk Entry`), "Métricas globales" (`Global Metrics`), "Editar última entrada múltiple" (`Edit Latest Bulk Entry`), "Grupos" (`Groups`), "Editar grupo" (`Edit Group`), "Cargar balances" (`Load Balances`), "Ver/Ocultar balances" (`View/Hide Balances`), "Nuevo grupo" (`New Group`) y "Nueva Cuenta" (`New Account`).
  - **Banner de Modo Solo Lectura Localizado:** Detección de idioma reactiva para el mensaje del banner de expiración de prueba o membresía y el botón de acción "Renovar Acceso Pro" (`Renew Pro Access`).
  - **Panel de Metas y Objetivos Bilingüe:** Localización de tarjetas de balance efectivo (`Effective Balance`), objetivo de beneficio (`Profit Target`), drawdown máximo (`Max Drawdown`), meta personal (`Personal Goal`), parte retirable (`Withdrawable Share`), retiro mínimo (`Next Withdrawal`), total retirado (`Total Withdrawn`), consistencia (`Consistency`), días de trading (`Trading Days`) y pérdida diaria (`Daily Loss Limit`).
  - **Respeto Estricto de Jerga Institucional:** Terminología profesional preservada en inglés (*Drawdown*, *Win Rate*, *Profit Factor*, *Breakeven*, *Prop Firm*, *Split*, *R:R*, *Pips*, *SL*, *TP*).
- **Localización Completa de AsTrade Calculator (`calculadora/index.html` & `calculadora/js/app.js`):**
  - Pill selector interactivo de idioma `🌐 ES | EN` integrado en la barra de navegación superior.
  - Traducción de todos los paneles de cálculo, tipos de instrumentos (Forex, Metales, Criptos, Índices), presets de riesgo, modales de guardado y tabla de setups.
  - Cadenas dinámicas de riesgo y copiado rápido traducidas reactivamente en tiempo real.
- **Correcciones Críticas de Estabilidad, Sintaxis y Tema Claro:**
  - **Tema Claro en AsTrade Calculator:** Incorporadas reglas dedicadas en `calculadora/css/styles.css` para `html.light`, garantizando contraste y legibilidad impecables en el título `Calculator` (`#334155`), el badge `POSITION & RISK PRO` (fondo verde menta `#ecfdf5` y texto esmeralda profundo `#047857`) y la píldora selectora de idioma.
  - **Restauración de Sintaxis en i18n (`js/i18n.js`):** Subsanadas comas dobles accidentales que causaban `SyntaxError`, asegurando la carga limpia de `window.i18n` y `window.toggleLanguage()`, con fallback defensivo al texto original del DOM ante claves inexistentes.
  - **Restauración de Ámbito en Bitácora (`js/app.js`):** Eliminada la re-declaración duplicada de `const titleBadge` en `setMode()`, restaurando el ciclo de inicialización completo de la bitácora (cuentas, trades, tours y navegación libre hacia Dashboard y Métricas).
  - **Erradicación del Logo Gigante e Icono Antiguo (`js/app.js` & `app.html`):** Subsanada la sobreescritura de clases en `setMode()` que eliminaba el contenedor `w-8 h-8` e inyectaba el icono antiguo de FontAwesome `fa-chart-line`. El isotipo SVG oficial de AsTrade permanece estrictamente acotado (32x32px) con transiciones de color dinámicas (esmeralda en Real y azul cobalto en Backtesting).
  - **Sincronización Reactiva de Títulos:** Dinamizado el título de cuentas/sesiones en `renderRealAccounts()` para responder de inmediato al selector de idioma.

---

## [v3.9.4] - 2026-11-20

### 🚀 Integración de Inicio de Sesión y Registro con Google (OAuth 2.0)
- **Activación en Supabase Auth Backend:**
  - Habilitado proveedor externo de Google con credenciales de cliente OAuth (ID y Secreto).
  - Configurada lista de URIs autorizadas (`uri_allow_list`) para `tradingjournalpro.pages.dev`, `astradehub.com` y desarrollo local.
  - Sincronización automática de usuarios Google con el trigger `handle_new_user` de Postgres (creación de perfil y activación automática de 7 días de prueba gratis).
- **Botón Google Adaptativo Bilingüe (`index.html` & `en.html`):**
  - Incorporado en modales de Iniciar Sesión ("Continuar con Google" / "Continue with Google") y Registro ("Registrarse con Google" / "Sign up with Google").
  - Logotipo oficial vectorizado de 4 colores de Google (SVG).
  - Línea divisoria elegante ("o con tu correo" / "or with email").
  - Estilos adaptativos de alta calidad (`.btn-google-auth`): fondo slate oscuro con borde sutil en Modo Oscuro, y fondo blanco puro con borde neutro `#d1d5db` y sombra suave en Modo Claro.
- **Manejador de Sesión y Callback (`app.html` & `js/supabase-client.js`):**
  - Implementación de `apiSignInWithGoogle()` y `apiHandleOAuthCallback()`.
  - Guardián inteligente en `app.html` que detecta redirecciones OAuth (`#access_token` o `?code`) sin expulsar al usuario al index.
  - Recuperación de perfil y suscripción tras la autenticación de Google, guardado en `localStorage` y limpieza estética de la URL sin recargas.

---

## [v3.9.3] - 2026-11-20

### 🎨 Corrección de Enfoque y Adaptabilidad en Modales de Autenticación
- **Solución al Desbordamiento Vertical y Recorte Superior:**
  - Sustitución de `items-center` por `overflow-y-auto` en el contenedor `#auth-modal-backdrop` y `my-auto` en la tarjeta `#auth-modal-card`, eliminando el problema de coordenadas negativas de flexbox que empujaba la parte superior fuera del viewport.
  - El botón de cierre (`X`) y el icono superior (cohete / flecha) permanecen 100% visibles y con márgenes superiores limpios en cualquier resolución de pantalla.
- **Scroll Vertical Suave y Completo:**
  - Habilitado scroll vertical libre en el contenedor modal cuando el contenido excede la altura de la ventana (pantallas de portátiles o zoom activo).
  - Adición de `backdrop.scrollTop = 0;` en `openAuthModal()` para garantizar que el modal siempre abra desde la parte superior.
- **Optimización de Proporciones y Altura:**
  - Compactación armónica de paddings (`p-5 sm:p-6`), espaciados de formulario (`space-y-3`), dimensiones de iconos (`w-10 h-10`) y checklist de contraseñas (`text-[10px]`), reduciendo la altura total en más de 85px para caber holgadamente en pantallas de 700-800px.
- **Soporte de Contraste en Modo Claro:**
  - Estilización dedicada de la clase `.auth-close-btn` en modo claro (`color: #64748b` con hover `#0f172a`), garantizando visibilidad nítida sobre la tarjeta blanca.
- **Sincronización Bilingüe:**
  - Aplicado idénticamente en [index.html](file:///c:/Users/Juan/Desktop/trading-saas/index.html) y [en.html](file:///c:/Users/Juan/Desktop/trading-saas/en.html).

---

## [v3.9.2] - 2026-11-19

### 🤖 Nueva Skill de Automatización de Contenido Social: `ai-content-automation`
- **Integración del Modelo "AI Content Automation Engine":**
  - Implementación de la skill completa en `.agents/skills/ai-content-automation/SKILL.md` aprendida a partir de la arquitectura de código abierto de generación de Shorts/Reels/TikToks autónomos.
  - Arquitectura modular desacoplada: patrón **Tools & Pipelines** (herramientas atómicas vs flujos de orquestación resilientes).
  - Pipeline de 7 pasos: Generación de guion en 3 actos (Hook, Desarrollo, CTA), consistencia visual mediante *Style Reference Chaining*, síntesis de voz en lote con Gemini TTS / Edge-TTS, alineación milimétrica con Whisper, movimiento dinámico y sincronización de velocidad con FFmpeg (`setpts` / Ken Burns), subtítulos quemados de alta retención y mezcla de música con ducking de audio.
- **Recursos Técnicos y Esquemas Incluidos:**
  - `references/schemas.py`: Modelos Pydantic para `VideoScript`, `Scene`, `ImagePrompt`, `VideoPrompt` y `AudioAlignment`.
  - `references/prompts.py`: Prompts maestros para redacción cinemática, voz y alineación, junto con presets de nicho y estilo visual optimizados para AsTrade (`trading_dark_glow`).
  - `scripts/pipeline_orchestrator.py`: Plantilla en Python para orquestar FFmpeg, Whisper y TTS.
- **Regla de Pivote de 3 Elementos:**
  - Guía para adaptar el generador a cualquier nicho continuo modificando únicamente referencias visuales, música de fondo y prompts maestros.

---

## [v3.9.1] - 2026-11-19

### 🛡️ Política Estricta de Contraseñas Seguras y Checklist Interactivo en Tiempo Real
- **Criterios de Seguridad Reforzados (5 Reglas Obligatorias):**
  - Mínimo de **10 caracteres** (ampliado desde el mínimo básico anterior de 6).
  - Al menos **1 letra mayúscula** (`A-Z`).
  - Al menos **1 letra minúscula** (`a-z`).
  - Al menos **1 número** (`0-9`).
  - Al menos **1 carácter especial o símbolo** (`!@#$%^&*()_+-=[]{};':"|,.<>/?~`).
- **Validador Centralizado de Robustez (`js/auth.js` y `js/supabase-client.js`):**
  - Implementación de `validatePasswordStrength(password)` que evalúa los 5 criterios, computa puntaje de seguridad (0 a 100%) y genera el listado de requisitos pendientes.
  - Bloqueo en cliente y en `apiSignUp()` antes de enviar peticiones a Supabase Auth si la contraseña no cumple el 100% de los criterios.
- **Experiencia de Usuario Interactiva en Modales de Registro (`index.html` y `en.html`):**
  - **Checklist en tiempo real:** 5 micro-badges que pasan instantáneamente de gris inactivo a verde esmeralda con icono `fa-circle-check` a medida que el trader escribe su contraseña.
  - **Barra de fortaleza dinámica:** Indicador visual de 3 niveles con animación suave (Rojo para Débil, Amarillo/Ámbar para Moderada, Verde Esmeralda brillante para Fuerte y Segura).
  - **Alternador de visibilidad (Eye Toggle):** Botón interactivo con iconos `fa-eye` / `fa-eye-slash` en los campos de contraseña de Login y Registro para mostrar u ocultar la clave en texto plano.
- **Auditoría Automatizada con Playwright (`scratch/test_password_policy.py`):**
  - 100% de tests superados validando detección de contraseñas débiles, estados moderados, claves fuertes y alternador de visibilidad tanto en español (`index.html`) como en inglés nativo (`en.html`).

---

## [v3.9.0] - 2026-11-19

### 🛡️ Reestructuración y Master Final del Tutorial #3 ("Control de Drawdown y Reglas Prop")
- **Sincronización con la Hoja de Ruta y Teaser del Tutorial #2:**
  - Alineación pedagógica total con el roadmap oficial (`TUTORIAL_SERIES_ROADMAP.md`) y la promesa narrativa al cierre del Tutorial #2: *"cómo blindar tu cuenta dominando el control de drawdown"*.
  - El material previo de *Laboratorio de Backtesting* fue archivado de forma segura en `scripts/render/archive_backtesting/` para su lanzamiento como **Tutorial #5**.
- **Master Final 1080p 60 FPS Renderizado en Google Colab (GPU NVIDIA T4):**
  - Generación de `AsTrade_Tutorial_03_Drawdown_1080p.mp4` (111.48s, 6.57 MB).
  - Continuidad directa con la cuenta *"Fondeo 100K Challenge"* con balance inicial $100,000 USD y actual de $103,000 USD (+3.00%).
  - Locución fonética con `es-MX-JorgeNeural` cubriendo: Por qué el Drawdown destruye cuentas, Radar de Metas (`#section-goals`), Colchón de Seguridad Restante ($10,000 USD intactos), Pérdida Diaria Máxima (5%) y Disciplina Matemática hacia la meta del 8%.
- **Kit de Publicación YouTube Actualizado (`packages/tutorial_03`):**
  - Nueva carátula minimalista técnica 1080p (`thumbnail_tutorial_03.png`) centrada en *"Blindaje y Drawdown"*.
  - Metadatos SEO (`metadata.md`) con capítulos exactos (0:00 a 1:40), descripción estructurada y etiquetas de gestión de riesgo.
  - Soporte integrado en el uploader autónomo `upload_youtube.py --tutorial 3`.
- **Auditoría Visual de Fotogramas Clave (Zero-Blur Standard):**
  - 7 fotogramas extraídos y verificados confirmando legibilidad 100% nítida de todas las tarjetas de metas y colchón de drawdown.

---

## [v3.8.9] - 2026-11-18

### 🎬 Producción y Master Final del Tutorial #3 ("Laboratorio de Backtesting Profesional")
- **Video Maestro 1080p 60 FPS Renderizado 100% Cloud:**
  - Generación de `AsTrade_Tutorial_03_Backtesting_1080p.mp4` en GPU NVIDIA T4 vía Google Colab CLI.
  - Sincronización fonética estricta con `JorgeNeural` (es-MX) en 5 bloques operativos: Conmutación a Backtesting, Creación de Sesión (`EURUSD` · $100K · Reglas de Fondeo), Registro Ágil de Trade Simulado, Curva de Equidad y Métricas de Robustez, y Verificación de Aislamiento Total.
  - Parámetros operativos institucionales impecables: **20 pips de Stop Loss**, **60 pips de Take Profit**, **5.00 lotes exactos** (con riesgo 1.0% sobre $100,000) y cierre en **Full TP** proyectando beneficio a $103,000 USD (+3.00%, R:R 1:3.00).
  - Cumplimiento estricto de la política de Marca Blanca (Zero menciones a firmas o marcas de terceros).
- **Kit de Publicación y Empaquetado Oficial (`packages/tutorial_03`):**
  - Carátula minimalista técnica en 1920x1080 Full HD (`thumbnail_tutorial_03.png`).
  - Metadatos SEO completos (`metadata.md`) con capítulos exactos (0:00 a 1:53), descripción institucional y tags.
- **Auditoría Visual de Fotogramas (Zero-Blur Standard):**
  - Verificación de 7 fotogramas clave confirmando el cierre limpio del modal de trade, visualización nítida del gráfico de equidad y datos de Cuentas Reales 100% aislados e intactos.

---

## [v3.8.8] - 2026-11-18

### 🚀 Optimización del Publicador Autónomo de YouTube (`upload_youtube.py`)
- **Procesamiento por Lotes (`--tutorial all`):**
  - Soporte para subir la serie completa de tutoriales en una sola llamada secuencial reutilizando la sesión autenticada.
- **Apertura de Navegador y Diagnóstico Unbuffered:**
  - Integración de apertura nativa del navegador en Windows con `os.startfile` para el flujo de autorización OAuth 2.0.
  - Generación de mensajes sin búfer (`flush=True`) con enlaces directos para facilitar la autenticación.
- **Registro Persistente de Publicaciones (`published_videos.json`):**
  - Registro automático del historial de subidas con ID de video, URL de YouTube, fecha/hora, visibilidad y estado de la miniatura.

---

## [v3.8.7] - 2026-11-18

### 🛡️ Política Estricta de Marca Blanca (Zero Marcas de Terceros)
- **Incorporación de la Regla de Oro #8 a la Skill Oficial (`astrade-tutorial-video`):**
  - Prohibición explícita e inquebrantable de utilizar marcas comerciales o nombres de empresas externas (como FTMO, FundedNext, MyForexFunds, etc.) en locución, textos en pantalla, carátulas, metadatos, tags o nombres de cuentas simuladas.
  - Estandarización de terminología genérica e institucional: *"Cuentas de Evaluación"*, *"Fase de Challenge"*, *"Firma de Fondeo"*, *"Reglas de Evaluación"*.
- **Saneamiento y Regeneración de Carátulas (Thumbnails 1080p):**
  - Actualización de `scripts/render/generate_youtube_thumbnails.py` reemplazando cualquier mención a marcas externas por *"Evaluación 100K & Prop Firms"* y *"REGLAS: 8% TARGET · 10% MAX DRAWDOWN"*.
  - Regeneradas y verificadas las miniaturas PNG de alta definición para Tutorial #1 y Tutorial #2.
- **Limpieza de Metadatos y Copywriting SEO:**
  - `packages/tutorial_01/metadata.md` y `packages/tutorial_02/metadata.md` 100% libres de referencias a marcas comerciales en descripciones, títulos, marcas de tiempo y etiquetas de YouTube Studio.
- **Saneamiento de Scripts de Producción:**
  - `render_video_02_astrade.py` y `generate_video_02_audio.py` actualizados con el identificador institucional de cuenta *"Fondeo 100K Challenge"*.
  - `app.html` actualizado con placeholder genérico `placeholder="Ej: Fondeo 100k Challenge"`.

---

## [v3.8.6] - 2026-11-18

### 🎬 Kit de Publicación y Automatización Oficial de YouTube
- **Generador de Miniaturas Minimalistas Técnicas (`scripts/render/generate_youtube_thumbnails.py`):**
  - Creación programática de carátulas en 1920x1080 Full HD siguiendo el estándar visual institucional de AsTrade (Zero-Blur).
  - Mockups de interfaz nítidos de alta definición con resplandores esmeralda (#10b981), branding oficial `AsTrade PRO DASHBOARD`, badge sobrio `TUTORIAL #X` y titulares técnicos limpios.
  - Generadas carátulas oficiales para **Tutorial #1** (`thumbnail_tutorial_01.png`) y **Tutorial #2** (`thumbnail_tutorial_02.png`).
- **Paquetes Oficiales de Metadatos y Copywriting SEO:**
  - `media/youtube_tutorials/packages/tutorial_01/metadata.md`: Título optimizado para CTR, descripción completa con marcas de tiempo (capítulos exactos de 0:00 a 1:43), enlaces inmutables a `https://astradehub.com` y etiquetas para YouTube Studio.
  - `media/youtube_tutorials/packages/tutorial_02/metadata.md`: Metadatos optimizados con capítulos exactos (0:00 a 2:05), resumen técnico de sizing institucional (5.00 lotes), curva de equidad (+3.00%) y tags.
- **Uploader Autónomo de YouTube (`scripts/social/upload_youtube.py`):**
  - Conexión oficial a **YouTube Data API v3** con autenticación segura OAuth 2.0.
  - Soporte de subida reanudable (*Resumable Upload*) para videos de alta definición con reporte de porcentaje en tiempo real.
  - Asignación automática de título, descripción, tags, categoría Educación (27), idioma español y subida de miniatura personalizada PNG.
  - Modo `--dry-run` para validación e inspección local sin necesidad de credenciales previas.
- **Guía Rápida de Configuración de Credenciales (`docs/GUIA_CONFIGURACION_YOUTUBE_API.md`):**
  - Tutorial paso a paso de 3 minutos para obtener `client_secrets.json` desde Google Cloud Console.
- **Integración en la Skill `astrade-tutorial-video`:**
  - Incorporada la fase de empaquetado y publicación dentro del runbook maestro de producción de tutoriales.

---

## [v3.8.5] - 2026-11-18

### 🎬 Tutorial #2 V7: Perfeccionamiento de Tendencia, Market Buy, Hora New York, Fonética Dual y Lotaje Limpio (5.00)
- **Selección Visible de Tendencia a Favor:**
  - Corrección del selector DOM en `#inputTendencia` asignando el valor exacto `'Favor'` correspondiente a las opciones nativas de `app.html`, garantizando que el campo muestre claramente *"Favor"* sin quedar vacío ni sin selección.
- **Tipo de Orden Market Buy Sincronizada:**
  - Corrección del selector al ID real `#inputOrden` (eliminando la referencia obsoleta a `#inputTipoOrden`) con valor `'Market Buy'`, logrando coincidencia visual absoluta con la narración de Jorge.
- **Hora Realista de Sesión New York (09:30 AM):**
  - Fijación explícita del campo `#inputHora` en `'09:30'`, representando con precisión la apertura institucional de Wall Street y erradicando la hora de madrugada (`02:46 AM`) previa.
- **Fonética Dual Equilibrada (Siglas en Español, Términos Técnicos en Inglés):**
  - Ajuste del motor fonético `to_phonetic_spanish()` en `generate_video_02_audio.py`:
    - **Siglas habladas en español:** `TP` ➔ *"Té Pé"*, `Full TP` ➔ *"Full Té Pé"*, `BE` ➔ *"Bé E"*, `SL` ➔ *"Ese Ele"*.
    - **Nombres técnicos completos en inglés:** `Take Profit` ➔ `/téik prófit/`, `Break Even` ➔ `/bréik íven/`, `Stop Loss` ➔ `/stóp los/`, `Market Buy` ➔ `/Márket Bai/`, `Drawdown` ➔ `/dróudaun/`.
- **Lotaje Institucional Limpio (5.00 Lotes Exactos):**
  - Sustitución de los parámetros de riesgo para eliminar cualquier cifra con carga popular o supersticiosa (como el 6.66 o el 13):
    - Stop Loss fijado en **20 pips** y Take Profit en **60 pips** (Ratio R:R 1:3.00 exacto).
    - Cálculo matemático transparente: \$1,000 USD de riesgo (1.0% de \$100,000 USD) entre (20 pips × \$10 USD/pip) = **5.00 lotes limpios**.
    - Target de ganancia: 60 pips × 5.00 lotes × \$10 USD/pip = **+\$3,000 USD (+3.00%)**, impulsando la cuenta a **\$103,000.00 USD**.
- **Calibración DOM del Selector de Lotaje:**
  - Apuntado exacto del pulso y badge al contenedor oficial `#inputLotajeCalc` con invocación reactiva a `calculateRR()` y `calculatePositionSize()`.
- **Renderizado 100% Cloud en Google Colab con GPU T4:**
  - Filmación autónoma de las 3 escenas (`intro.mp4`, `app_flow_continuous.mp4`, `outro.mp4`) y ensamble cinemático completado en 10.03 minutos con 0% de sobrecarga local.
- **Creación de la Skill Oficial de Producción Audiovisual (`astrade-tutorial-video`):**
  - Empaquetado de todo el estándar de producción, runbooks y guías técnicas en `.agents/skills/astrade-tutorial-video/` (`SKILL.md` + 4 manuales de referencia) para automatizar con máxima consistencia la generación de cualquier futuro video tutorial de AsTrade.

---

## [v3.8.4] - 2026-11-17

### 🎬 Tutorial #2 V6: Correcciones Maestras de Intro, Navegación a Registro, Curva Ascendente (+3%) e Inglés Técnico
- **Intro Cinemático Oficial y Lectura del Título (Estándar de la Serie):**
  - Implementación de la arquitectura de 3 escenas limpias (`record_intro` ➔ `record_app_flow_continuous` ➔ `record_outro`), erradicando cualquier fotograma vacío o pantalla desprovista de cuentas antes de iniciar.
  - Generación de `intro.mp3` con locución institucional de Jorge (*"Tutorial dos: Registro y Auditoría de Trades con Precisión Quirúrgica"*).
  - Ensamblado mediante disolución cruzada (*cross-dissolve* de 0.5s) con atenuación de música de fondo (ducking a 0.065).
- **Navegación Visual a la Edición de la Orden:**
  - Guion de Jorge actualizado para instruir al usuario hacia la pestaña **Registro de Trades** y mencionar los accesos rápidos de la sección de cuentas.
  - El cursor navega visiblemente a `#tab-btn-journal`, abre el diario de trading, resalta la fila del trade activo con un callout badge informativo y hace clic en el botón de edición (`fa-pen`) para abrir `#tradeModal`.
- **Corrección Matemática y Visual de la Curva de Capital (+3%):**
  - Inicialización de la cuenta FTMO 100K con `balanceActual: null` para permitir el cálculo dinámico automático de las operaciones.
  - Al cerrar la orden en *Full TP*, la gráfica `equityChart` asciende de forma continua y limpia de $100,000 a $103,000 USD (eliminando por completo la caída o parábola invertida a 100k).
  - La tarjeta KPI de *Retorno Total* se ilumina en **+3.00%** en verde esmeralda institucional.
  - El campo *Actual (Opcional)* se sincroniza a **$103,000.00 USD**.
  - En la pestaña *Metas*, la barra de *Profit Target* se sitúa en **37.5%** ($3,000 / $8,000 USD) y el *Drawdown* en **100% intacto** ($10,000 USD de colchón).
- **Normalización Fonética en Inglés Estricta:**
  - Sustitución de acrónimos literales en español por su pronunciación en inglés técnico:
    - *Full TP* pronunciado como `/Full Ti-Pi/` (erradicando *"Ful Té Pé"*).
    - *Break Even / BE* pronunciado como `/bréik íven/` y `/bi-i/` (erradicando *"Bé E"*).
    - *Stop Loss / SL* pronunciado como `/stóp los/` y `/es-el/`.
    - Preservación de la denominación natural en español de *"Entradas"* y *"Nueva Entrada"*.
- **Renderizado 100% Cloud en Google Colab con GPU T4:**
  - Filmación y codificación completadas en 9.93 minutos en la nube con 0% de uso de CPU/RAM local en la PC del usuario.

---

## [v3.8.3] - 2026-11-17

### 🎬 Tutorial #1 V6: Correcciones Maestras de Nitidez, Calibración DOM y Menú de Edición/Borrado
- **Cumplimiento Estricto Zero-Blur (Cero Desenfoques):**
  - Eliminación absoluta de filtros `backdrop-filter` y velos oscuros que provocaban pérdida de nitidez en la interfaz. Toda la aplicación se visualiza con máxima claridad y nitidez nativa a 1080p.
  - Reemplazo del velo oscuro por anillos de pulso esmeralda de alto contraste delimitados milimétricamente (`window.__pulseRingAround`).
- **Estabilización de Contenedor Modal y Calibración DOM:**
  - Anclado superior de `#sessionModal` (`padding-top: 50px`, `align-items: flex-start` y altura mínima fijada) para prevenir desplazamientos verticales al alternar entre tipos de cuenta (Real vs. Challenge / Fase de prueba).
  - Recálculo dinámico de coordenadas (`getBoundingClientRect`) con asentamiento DOM tras cada cambio de selector, eliminando cualquier desfasaje.
- **Sincronización Fonética Milimétrica con JorgeNeural:**
  - Calibración exacta de los movimientos de cursor y relleno de inputs respecto a la locución:
    - Retardo y foco en "Nueva Cuenta" únicamente cuando el narrador lo indica (4.2s - 8.5s).
    - Demostración de cuenta real y selección de Fase de prueba exactamente a los 15.5s cuando se enuncia "Para este ejemplo, seleccionamos Fase de prueba".
    - Escritura secuencial sincronizada para nombre de cuenta, balance inicial, balance actual opcional y reglas de drawdown y target.
- **Despliegue del Menú de Acciones (Editar y Borrar):**
  - Apertura interactiva del menú de tres puntos (`[data-account-action="menu-toggle"]`) en la tarjeta recién creada dentro de "Tus Cuentas".
  - Resaltado focalizado secuencial de las opciones "Editar" (modificación de saldo y reglas) y "Borrar" (eliminación segura) con sus callout badges correspondientes.
- **Renderizado 100% Cloud en Google Colab con GPU T4:**
  - Ejecución en la nube en 8.77 minutos, garantizando 0% de uso de CPU y RAM local en la máquina del usuario.

---

## [v3.8.2] - 2026-11-17

### 🎬 Tutorial #2 Completo: Registro y Auditoría de Trades en la Nube (Google Colab GPU T4)
- **Pipeline Cloud Autónomo para Tutorial #2 (`scripts/cloud/run_colab_render_video_02.py`):**
  - Migración completa del renderizado pesado de video y codificación FFmpeg a la nube mediante `google-colab-cli` con aceleración GPU T4.
  - Erradicación del cuello de botella de CPU y memoria RAM en la máquina local, reduciendo el tiempo de renderizado de horas a solo **7.47 minutos** con 0% de sobrecarga local.
  - Empaquetador liviano (`scripts/cloud/package_video_02_bundle.py`) de 6.62 MB y runner remoto (`scripts/cloud/remote_runner_video_02.py`).
- **Arquitectura de Toma Maestra Continua V5 (`scripts/render/render_video_02_astrade.py`):**
  - Filmación ininterrumpida de 110.40 segundos a 1920x1080 Full HD nativo sin recargas de página ni pantallas en blanco.
  - Flujo operativo institucional: carga de cuenta FTMO 100K, registro de trade EURUSD (15 pips SL, 45 pips TP, ratio 1:3.00, 1% de riesgo / $1,000 USD y cálculo automático de 6.66 lotes).
  - Inyección en vivo de capturas técnicas HD antes de entrar y tras alcanzar Full TP (+3.00% / +$3,000 USD).
  - Actualización automática del panel de metas: Target al 37.5% y Drawdown 100% intacto.
- **Cumplimiento Estricto Zero-Blur (Cero Difuminados):**
  - Eliminación absoluta de cualquier `filter: blur` o `backdrop-filter: blur` en `scripts/render/studio_motion_engine.js`.
  - Resaltado visual exclusivo mediante halos neón esmeralda delimitados, anillos de pulso precisos y badges tipográficos nítidos.
- **Hoja de Ruta Oficial de la Serie (`docs/tutorials/TUTORIAL_SERIES_ROADMAP.md`):**
  - Plan curricular completo estructurado en 6 episodios oficiales para la plataforma AsTrade.

---

## [v3.8.1] - 2026-11-16

### ☁️ Suite Cloud Autónoma: Integración Oficial con Google Colab CLI (`colab`)
- **Orquestador Local Autónomo (`scripts/cloud/run_colab_render.py`):**
  - Implementación de un pipeline integral que solicita una máquina virtual en Google Cloud vía `google-colab-cli` (`--gpu T4`), transfiere el paquete del proyecto directamente por WebSocket/CLI, ejecuta el renderizado y descarga el archivo MP4 final a `media/youtube_tutorials/`.
  - Apagado y desaprovisionamiento automático de la VM (`colab stop`) para garantizar cero consumo residual de cuotas.
- **Runner Remoto Headless (`scripts/cloud/remote_runner.py`):**
  - Script autónomo ejecutado en el entorno de la nube para descomprimir el proyecto, instalar paquetes silenciosamente (`playwright`, `ffmpeg`, `libasound2`, `libgbm1`), inicializar Chromium y ejecutar la **Toma Maestra Continua V5**.
- **Erradicación de Dependencia de Google Drive Web:**
  - Al transferir los archivos directamente a través de `colab upload` y `colab download`, se elimina por completo la necesidad de montar `/content/drive` en el navegador y los errores de ventanas emergentes (`credential propagation was unsuccessful`).

---

## [v3.8.0] - 2026-11-16

### 🎬 Suite de Producción V5: Arquitectura de Toma Maestra Continua (Zero White Flashes)
- **Toma Maestra Continua en Vivo (`render_video_01_astrade.py`):**
  - Erradicación definitiva de la fragmentación en navegadores independientes. Toda la operativa dentro de `app.html` (88.75s) se filma en una sola sesión continua e ininterrumpida de Chromium.
  - El modal se abre en vivo, se selecciona la modalidad Challenge, se escriben los datos de la cuenta ($100K y reglas 8%/10%) y se guarda la sesión en un flujo natural sin recargas de página ni pantallas en blanco.
  - Al hacer click en "Crear", el modal se cierra y la tarjeta institucional recién creada ya está visible y lista en el grid.
- **Calibración Matemática 1:1 del Studio Motion Engine (`studio_motion_engine.js`):**
  - Eliminación total de CSS `zoom`, erradicando el bug de doble escalado ($1.10 \times 1.10 = 1.21$) que desplazaba los recuadros de spotlight 150px fuera de posición.
  - Algoritmo de auto-clamping inteligente en `__showCalloutBadge`: voltea automáticamente de derecha a izquierda si se aproxima al borde derecho del viewport (1920px), y voltea hacia arriba si colisiona con el Lower-Third en la parte inferior ($y > 880\text{px}$).
  - Coordenadas redondeadas a píxeles exactos en spotlights, pulse rings y cursores virtuales.
- **Blindaje Físico Anti-Flash Blanco en Transiciones:**
  - Flags nativos de Chromium (`--background-color=0b0f19`), inyección CDP `setDefaultBackgroundColorOverride` y descarte preventivo de pre-roll (`-ss 0.200` y `-ss 0.150` en FFmpeg).
  - Reducción de transiciones globales a solo 2 disoluciones cinematográficas de 0.5s: Intro ➔ Toma Maestra Continua ➔ Outro.
- **Sincronización Autónoma en Google Drive:**
  - `astrade_video01_bundle.zip` y `trading_saas_bundle.zip` actualizados directamente en Google Drive.

---

## [v3.7.9] - 2026-11-16

### 🎬 Tutorial #1 V4: Enfoque Monotemático, Intro/Outro Cinemático y Remotion Skill
- **Rediseño Monotemático y Estructura Cinemática V4 (`render_video_01_astrade.py`, `generate_video_01_v3_audio.py`):**
  - Enfoque 100% exclusivo en **Creación y Configuración de Cuentas de Trading**, resolviendo la dispersión temática y la ausencia de tarjeta en el grid del video anterior.
  - Creación de **Intro Cinemático Animado** (`scripts/render/intro_outro_motion.html?mode=intro`) con logotipo vectorial oficial de AsTrade, halo neón `#10b981`, retícula cyber y tarjeta de lección Full HD.
  - Creación de **Outro Cinemático de Cierre** (`scripts/render/intro_outro_motion.html?mode=outro`) con logotipo de AsTrade, mensaje de prueba gratuita de 7 días y llamado a la acción con el dominio oficial **`astradehub.com`**.
  - Explicación visual y auditada paso a paso:
    - Despliegue de tipos de cuenta: Real (capital propio), Fase de prueba (Challenge), Fondeada e Instant.
    - Diferenciación clara entre Balance Inicial ($100,000 USD como base matemática de riesgo por trade) y Balance Actual / Saldo de Cierre opcional.
    - Configuración de reglas de fondeo: Profit Target (8% / $8,000) y Drawdown Máximo (10% / $10,000).
- **Tarjeta Institucional Visible en Grid (`#sessions-grid`):**
  - En el Bloque 4, la tarjeta de la cuenta recién creada aparece visible e interactiva en el grid con todas sus etiquetas y saldo ($100,000 USD), señalizada con flecha animada y badge, recorriendo los botones "Entrar" y "Editar", y anticipando el Tutorial #2 (Registro y auditoría de trades).
  - Corrección de escape de comillas en el selector del botón de edición para garantizar ejecución limpia en Playwright.
- **Corrección de Resolución y Eliminación Total de Bandas Grises:**
  - Viewport y grabación configurados en 1920x1080 nativo (`record_video_size={"width": 1920, "height": 1080}`, `viewport={"width": 1920, "height": 1080}`, `--window-size=1920,1080`), erradicando las franjas grises de letterboxing causadas por la disparidad previa.
  - Escala Macro-UI aplicada mediante CSS `zoom: 1.10` y `font-size: 17.5px` para mantener máxima nitidez y legibilidad en pantallas móviles y YouTube.
- **Creación de Skill Remotion (`.agents/skills/remotion/`):**
  - Análisis e indexación del tutorial de Remotion + IA en YouTube, creando la skill completa con principios de frames deterministas, `spring()`, `interpolate()`, desacoplamiento JSON y plantilla React TypeScript en `examples/astrade_intro_outro.tsx`.
- **Sincronización Autónoma en Google Drive (`gdrive`):**
  - Actualización de los paquetes `astrade_video01_bundle.zip` y `trading_saas_bundle.zip` en Google Drive del usuario sin necesidad de descargas ni subidas manuales.

---

## [v3.7.8] - 2026-11-16

### 🎬 Suite de Producción Audiovisual: Pulido Visual Radical para Tutorial #1 YouTube
- **Erradicación Absoluta de Tours y Velos Oscurecidos (`app.js`, `render_video_01_astrade.py`):**
  - Implementación de guardas globales `window.__VIDEO_RENDER_MODE__` en `startAppTour()`, `initTourAutoTrigger()`, `showFondeoCelebration()` y `launchConfetti()`.
  - Inyección preventiva de claves en `localStorage` (`journal_tour_never_show: 'true'`, `journal_tour_completed: 'true'`, `has_seen_onboarding: 'true'`, `trade_form_spotlight_completed: 'true'`).
  - Anulación por monkey-patching y reglas CSS estrictas (`#tourOverlay, #tourTooltip, #tourSvgMask, #tourHighlightRing, .tour-overlay { display: none !important; opacity: 0 !important; }`) para garantizar una pantalla 100% limpia sin sombras ni ventanas superpuestas.
- **Supresión Total de Confeti Invasivo (`studio_motion_engine.js`, `app.js`):**
  - Eliminación completa de las partículas de confeti en `window.__triggerCelebrationConfetti()` y anulación de `showFondeoCelebration` y `launchConfetti`.
  - Sustitución en el Bloque 3 por un Lower-Third institucional y nítido: `window.__showLowerThird('✅', 'CUENTA ACTIVADA', 'Fondeo $100,000 USD listo para auditar con reglas 5%/10%')`.
- **Macro-UI y Tipografía Ampliada a Escala 1.25x (`render_video_01_astrade.py`, `studio_motion_engine.js`):**
  - Viewport de filmación ajustado a `1536x864` (16:9, escala DPI 125% estándar) renderizado a 1920x1080 Full HD, logrando que botones, formularios, textos y gráficos se vean un 25% más grandes y perfectamente legibles en móviles y computadoras.
  - Tipografía base aumentada (`html { font-size: 17px !important; }`), títulos de Lower-Third a 22px bold y Callout Badges a 22px bold con fondo oscuro `rgba(11, 15, 25, 0.98)`, bordes esmeralda y desenfoque de 18px.
- **Sincronización Autónoma en Google Drive (`gdrive`):**
  - Actualización directa de los paquetes `astrade_video01_bundle.zip` y `trading_saas_bundle.zip` en la cuenta de Google Drive del usuario sin necesidad de descargas ni subidas manuales.

---

## [v3.7.7] - 2026-11-16

### 🎬 Suite de Producción Audiovisual V3: Rediseño de Calidad para Tutorial #1 YouTube
- **Fonética Anglosajona Nativa en Locución Neural (`generate_video_01_v3_audio.py`):**
  - Implementación de motor de reemplazo fonético estricto (`to_phonetic_spanish`) para que la voz institucional `es-MX-JorgeNeural` pronuncie con acento y dicción anglosajona perfecta todos los términos técnicos de trading:
    - `trading` -> `tréiding`
    - `trade` -> `tréid` | `trades` -> `tréids`
    - `trader` -> `tréider` | `traders` -> `tréiders`
    - `drawdown` -> `dróudaun`
    - `Win Rate` -> `uín reit` | `Profit Factor` -> `prófit fáctor`
    - `FTMO` -> `Efe Te Eme O` | `AsTrade` -> `As Tréid`
    - `100K` -> `cien ka` | `Challenge` -> `Chálendsh`
  - Regeneración de los 4 audios modulares (`scratch/video_01_v3/audio/`) con duración total de voz de 132.12 segundos y manifiesto V3 actualizado.
- **Erradicación Radical de Guías Interactivas y Overlays Oscurecidos (`render_video_01_astrade.py`):**
  - Inyección preventiva de banderas de supresión total en `localStorage` antes de cualquier navegación (`journal_tour_never_show: 'true'`, `journal_tour_completed: 'true'`, `lifecycle_guide_dont_show: 'true'`).
  - Activación de `window.__SMOKE_TEST__ = true` para anular disparadores automáticos (`initTourAutoTrigger`).
  - Bloqueo en CSS inyectado (`#tourOverlay, .tour-overlay, #lifecycleGuideOverlay { display: none !important; }`) y remoción forzosa del nodo DOM en cada escena.
- **Macro-UI Cinemática para Máxima Legibilidad en YouTube:**
  - Viewport de rodaje adaptado a 1680x945 (16:9) escalado internamente a 1920x1080 Full HD, logrando un aumento visual de tamaño de interfaz del ~22%.
  - Escala tipográfica ampliada: Lower-Third a 20px negrita (`#studio-lt-title`) y Callout Badges flotantes a 19px negrita (`.studio-callout-title`).
- **Confeti de Celebración Controlado (`studio_motion_engine.js`):**
  - Reducción de partículas a una ráfaga limpia de 65 proyectiles con auto-reseteo forzoso a los 1.2 segundos (`window.confetti.reset()`) para no saturar la pantalla.
- **Automatización y Empaquetado Sincronizado en Google Drive:**
  - `TradingJournalPro_VideoGenerator_Colab.ipynb` configurado con `forzar_re_renderizado = True` para evitar reuso de escenas obsoletas.
  - Paquetes `astrade_video01_bundle.zip`, `trading_saas_bundle.zip` y libreta Colab sincronizados y actualizados directamente en Google Drive vía plugin `gdrive`.

---

## [v3.7.6] - 2026-11-16

### 🌐 Internacionalización Institucional Definitiva: Página Dedicada en Inglés (`en.html`)
- **Arquitectura Dedicada de Cero Latencia (`en.html`):**
  - Creación de una página de aterrizaje nativa en inglés (`en.html`) 100% limpia, erradicando por completo el script externo inestable de Google Website Translator que causaba traducciones parciales ("Spanglish"), retrasos de red de 3 a 5 segundos y sobrescritura de textos con cada interacción de JavaScript.
  - Traducción al 100% de todo el contenido estático, dinámico y vectorial:
    - **Cabecera y Hero:** Títulos, subtítulos, barra de anuncios superior y callout interactivo *"Click, it's 100% interactive!"*.
    - **Showcase Interactivo (4 Vistas):**
      - *Pestaña 1 (Dashboard & Metrics):* Diagnósticos en vivo (`evoStagesData`), estados de evolución (A Ciegas -> Pro Journal), toasts y badges de hitos de fondeo.
      - *Pestaña 2 (Trades Registration):* 4 operaciones documentadas (XAUUSD, EURUSD, GBPJPY, US30), notas técnicas antes/después, títulos de análisis institucional, días de la semana nativos (`Thu`, `Wed`, `Tue`, `Mon`) y anotaciones SVG sobre gráficos de velas.
      - *Pestaña 3 (Monthly Performance):* Resumen anual auditado, badges de rendimiento, matriz de los 12 meses (`January` a `December`), tarjetas de mejor mes (`October`), mejor trade, mejor día y desglose de sesión.
      - *Pestaña 4 (Funding Audit):* Auditoría de cuentas de fondeo (`fundingPresetsData`: 100K 2-Phases, 50K 1-Phase, Instant 25K), simulador trade a trade, toasts de avance, y modal de celebración con confeti (*"Congratulations! Funded Account Passed"*).
    - **Bento Grid:** 6 tarjetas de superpoderes analíticos (Curva de equidad, Calculadora de lotaje dinámico, Calendario y heatmap de consistencia, Auditoría de fondeo, Galería antes/después, Desglose quirúrgico por sesión).
    - **Laboratorio Backtesting Pro:** Simulador de desafíos de fondeo (`backtestFirmsData`), comprobación de pérdida diaria, drawdown máximo, y simulador de retiros (payouts 80/20) con recibo dinámico.
    - **Calculadora de Lotaje & MT5 Cloud Sync:** Especificaciones técnicas, categorías de mercado, y pase VIP para miembros Pro.
    - **Precios & FAQ:** Tabla de precios (Mensual, Trimestral, Semestral, Anual) y acordeón completo de preguntas frecuentes traducido a inglés formal de negocios.
    - **Pie de Página & Modales Legales:** Términos de Servicio, Política de Privacidad, Política de Reembolsos y Descargo de Responsabilidad Financiera (*Risk Disclaimer*).
    - **Autenticación:** Modales de inicio de sesión, registro con 7 días gratis y recuperación de contraseña.
- **Navegación Fluida y Persistencia de Idioma:**
  - Botón toggle bidireccional en la barra de navegación:
    - En `index.html`: Muestra `🌐 EN` y redirige de forma instantánea a `en.html`.
    - En `en.html`: Muestra `🌐 ES` y redirige limpiamente a `index.html?lang=es`.
  - Detección inmediata y pre-renderizado en `<head>` para evitar parpadeos visuales (*FOUC*), sincronizado con `localStorage.getItem('astrade_lang')`.
- **Limpieza de Código:**
  - Eliminación de scripts de Google Website Translator y reglas CSS obsoletas (`.goog-te-*`).
  - Resolución del error tipográfico en la regla de consistencia del modal de celebración (`23.9% (≤ 30%) ✓ Passed`).

---

## [v3.7.5] - 2026-11-16

### 🌐 Traducción Global Efectiva a Inglés (Google Website Translator)
- **Motor Oficial de Google Website Translator Integrado (`index.html`):**
  - Implementación de traducción in-place al inglés para el 100% de los textos de la Landing Page sin deformar la maqueta, sin romper eventos de JavaScript ni desencajar tarjetas o botones.
  - Compatibilidad universal y probada en todos los navegadores (Chrome, Safari iOS, Firefox, Edge, Android) y bajo cualquier protocolo (`file:///`, `http://localhost` y `https://astrade.app`).
- **Botón Toggle Limpio en Cabecera (`#lang-toggle-btn`):**
  - Botón estilizado junto al selector de tema oscuro/claro que muestra `🌐 EN` cuando la página está en español y cambia a `🌐 ES` al traducir a inglés.
  - Blindaje con atributos `translate="no"` y `class="notranslate"` para evitar que Google confunda la abreviatura "ES" con palabras en inglés ("IS").
- **Protección Estricta de Marca y Tickers Financieros (`translate="no"` y `class="notranslate"`):**
  - Blindaje de la identidad de marca `AsTrade` en la cabecera, showcase interactivo y pie de página legal para evitar traducciones literales o fonéticas.
  - Blindaje de los tickers de divisas y materias primas (`XAUUSD`, `EURUSD`, `US30`, `GBPJPY`) y referencias de fondeo (`FTMO`).
- **Ocultación Estricta de Banners de Google (`css/styles.css`):**
  - Reglas CSS de máxima prioridad (`!important`) que suprimen en su totalidad el banner superior iframe (`.goog-te-banner-frame`), tooltips flotantes (`#goog-gt-tt`), globos y resaltados amarillos de texto (`.goog-text-highlight`).
  - Fijación de `body { top: 0 !important; position: static !important; }` para erradicar cualquier desplazamiento vertical forzado por la inyección de Google.
  - Estilos adaptados para temas oscuro y claro con transiciones fluidas.
- **Persistencia y Arquitectura de Doble Capa (`AsTradeLanguage`):**
  - Sincronización transparente con `localStorage.getItem('astrade_lang')` y cookie oficial `googtrans=/es/en`.
  - Recarga limpia e instantánea al revertir a español para garantizar la restauración del DOM original sin residuos.

---

## [v3.7.4] - 2026-11-16

### 🎬 Estudio Audiovisual V3 — Tutorial #1 AsTrade con Motion Graphics y Google Colab 1-Click
- **Motor de Motion Graphics In-Browser (`scripts/render/studio_motion_engine.js`):**
  - Incorporación de flechas vectoriales SVG auto-dibujadas con curvas Bézier suaves (`stroke-dashoffset` animado de 100% a 0%), punta elástica neón esmeralda (`#10b981`) y filtro de resplandor.
  - Implementación de anillos de foco pulsantes (`.studio-pulse-ring`) alrededor de los botones reales del DOM y badges flotantes de estilo vidrio esmerilado (*callouts*).
  - Eliminación total de deformaciones de zoom por escalado del `body`: toda la guía visual opera ahora con coordenadas físicas exactas calculadas vía `getBoundingClientRect()`.
  - Disparador de celebración con lluvia de confeti nativo (`canvas-confetti`) sincronizado al pulsar *"Crear Cuenta"*.
- **Demostración de Valor "El Después" (`scripts/render/mock_populated_data.js`):**
  - Erradicación de la pantalla vacía: inyección en memoria e IndexedDB de una cuenta de fondeo institucional activa *"Fondeo 100K FTMO"* con balance de $104,250 USD (+4.25% de avance).
  - Registro de 14 operaciones realistas (XAUUSD, EURUSD, US30) que activan la visualización del Dashboard con curva de equidad ascendente, Win Rate del 68.4%, Profit Factor de 2.35 y calendario mensual con días verdes.
- **Renderizado Cinemático Anti-Destellos en FFmpeg (`scripts/render/render_video_01_astrade.py`):**
  - Protocolo CDP (`Emulation.setDefaultBackgroundColorOverride` a `#0b0f19`) para arrancar Chromium directamente en modo oscuro antes de procesar cualquier hoja de estilo, eliminando 100% el fotograma blanco inicial.
  - Transiciones de disolución cruzada cinematográfica de 0.5s entre bloques usando filtros FFmpeg `xfade=transition=fade` y `acrossfade=d=0.5`.
  - Mezcla de música Lo-Fi a -24 dB con atenuación suave (*fade-out*) en los últimos 2.5 segundos.
- **Locución Modular V3 con Jorge Neural (`scripts/audio/generate_video_01_v3_audio.py`):**
  - Síntesis de 4 bloques modulares con Edge-TTS (`es-MX-JorgeNeural`) con dicción técnica en español neutro, alineados rigurosamente a la marca oficial **AsTrade** y al período de **7 días de prueba gratis**.
- **Libreta Google Colab 1-Click & Paquetes de Drive (`TradingJournalPro_VideoGenerator_Colab.ipynb`, `scripts/package_video_01_colab.py`):**
  - Libreta oficial actualizada para renderizar el Tutorial #1 de forma 100% autónoma en Google Colab sin consumir recursos locales.
  - Arquitectura en subproceso que elimina definitivamente el conflicto `asyncio loop` con Playwright.
  - Generación del paquete comprimido ultra-ligero `astrade_video01_bundle.zip` (5.68 MB) con todos los assets, código web, scripts y audios.
  - Reproductor HTML5 1080p integrado para previsualizar el video terminado directamente en Colab.
- **Auditoría de Calidad con Visión Artificial (`scripts/audit_video_01.py`):**
  - Script automatizado para extraer fotogramas clave y validar mediante luminancia y Gemini Vision la ausencia de fotogramas blancos y la exactitud visual.

---

## [v3.7.3] - 2026-11-16

### 🔊 Efectos de Sonido Táctiles Nativos en el Showcase (`index.html`, `css/styles.css`)
- **Motor de Audio Sintético Aislado (`ShowcaseAudio` con Web Audio API):**
  - Implementación de efectos de sonido táctiles ultra ligeros (cero latencia, generados en tiempo real sin archivos de audio externos ni descargas de red).
  - Restricción estricta y exclusiva a la sección del showcase interactivo en la landing page (`index.html`).
  - Clics táctiles discretos modulados para cambio de pestañas (`tab`), interacción con fichas y botones (`soft`) y avances de simulación (`step`).
  - Arpegio mayor armónico suave (Do6 - Mi6 - Sol6) al alcanzar y celebrar la meta de fondeo aprobada.
  - Botón de control rápido de sonido (🔊 / 🔇) incorporado en la cabecera del showcase (desktop y móvil) con persistencia de preferencia en `localStorage`.
  - Desbloqueo perezoso conforme a las directivas de reproducción automática de los navegadores.

### 🖱️ Nuevo Cursor Animado y Texto de Callout (`index.html`)
- **Actualización Visual de la Píldora de Interactividad:**
  - Sustitución del emoji de lápiz (`✏️`) por un cursor de flecha estilizado con ondas de clic concéntricas animadas (`fa-arrow-pointer` con pulso perimetral).
  - Texto actualizado con precisión a: `Haz click, es 100% interactiva!`.

---

## [v3.7.2] - 2026-11-15

### ⏱️ Fase 1: Control de Reproducción Inteligente del Showcase Interactivo (`index.html`)
- **Detección Estricta de Foco Central en Pantalla con `IntersectionObserver`:**
  - Se eliminó el arranque prematuro en la carga inicial de la página cuando el usuario aún está leyendo el titular o la cabecera superior.
  - La maqueta interactiva ahora espera a que el usuario haga scroll y quede **completamente centrada (al menos 50% visible)** en la pantalla para iniciar.
  - Al entrar en foco por primera vez, arranca **garantizadamente en $t = 0$ desde la Pestaña 1 (Dashboard & Métricas)**, asegurando que el visitante disfrute la presentación y los gráficos explicativos sin perderse nada.
  - Si el usuario hace scroll hacia arriba o hacia abajo saliendo del foco visual, el tour se **pausa automáticamente de inmediato**, congelando las barras de progreso para no desperdiciar ciclos ni avanzar desatendido.
  - Al regresar a enfocar la maqueta, la reproducción se **reanuda fluidamente** desde el punto exacto donde se congeló.

### ✏️ Fase 2: Flecha Exterior Dibujada & Énfasis de Interactividad (`index.html`, `css/styles.css`)
- **Llamado de Atención Exterior Orgánico:**
  - Incorporada píldora flotante exterior (`#showcase-interactive-callout`) con el texto: `✏️ ¡Haz clic aquí, es 100% interactiva!`.
  - Flecha curva SVG estilo rotulador dibujado a mano con trazo punteado (`stroke-dasharray="4 2.5"`) en verde esmeralda resplandeciente apuntando a los controles interactivos de la ventana.
  - Animación suave de respiración y resplandor (`callout-pulse-fade`), colocada en el espacio de aire exterior sin obstruir insignias ni titulares.
  - Al hacer clic en cualquier pestaña o control interactivo, el callout se desvanece de forma suave e irreversible (`opacity: 0, translateY`) para permitir una interacción limpia sin estorbos.

### 🔄 Fase 3: Rediseño In Situ de "Registro de Trades" y "Rendimiento Mensual" (`index.html`, `css/styles.css`)
- **Registro de Trades — Transición Deslizante In Situ:**
  - Se eliminó la tabla vertical redundante y la lista móvil sobredimensionada que empujaban el análisis técnico y los gráficos de antes/después fuera del campo visual.
  - Se implementó un selector de 4 fichas interactivas (`chip-trade-1` .. `chip-trade-4`) con estadísticas en vivo de cada operación (XAUUSD +2.14%, EURUSD -0.40%, GBPJPY +1.28%, US30 +1.82%).
  - Se incorporó la fila de bitácora oficial (`#trade-active-journal-strip`) que expone los metadatos de la operación (Fecha, Activo, Sesión, Tipo de Orden, Pips, Ratio R:R, Estado y PnL).
  - Integración de animación de deslizamiento in situ (`@keyframes trade-slide-in`, `.anim-trade-slide`): al interactuar o durante el tour automático ($t=0, 2400, 4800\text{ ms}$), la tarjeta se desliza suavemente en el mismo lugar sin que el usuario tenga que hacer scroll. Altura compactada a ~539px.
  - **Corrección de Legibilidad en Fichas Activas (Modo Oscuro & Claro):** Se eliminó el fondo verde chillón sólido que volvía ilegible el texto rojo de pérdida (`-$400.00`, `-0.40%`). Ahora la ficha seleccionada se resalta con superficie elevada, borde esmeralda con resplandor suave y tipografía de alto contraste tanto en tema oscuro como en tema claro.
- **Rendimiento Mensual — Despliegue de Mes Directo In Situ:**
  - Se eliminó por completo el bloque inferior desconectado (`#showcase-month-inspector`) que hacía la vista excesivamente larga y confusa.
  - Se integró el desglose de métricas detalladas (`.monthly-month-details`) directamente dentro de cada una de las 12 tarjetas de mes (`#month-card-1` .. `#month-card-12`), replicando con fidelidad el comportamiento nativo de la aplicación.
  - Reglas de posicionamiento inteligente adaptativo: las filas superiores se despliegan hacia abajo, las filas inferiores se despliegan hacia arriba, y las columnas se alinean para evitar desbordamientos. Altura compactada a ~483px sin necesidad de scroll.
  - **Corrección en Tema Claro (`html.light`):** Se corrigió la visualización del desplegable mensual en modo claro: fondo blanco pulido (`#ffffff`), borde esmeralda suave, tarjetas de métricas en slate claro (`#f8fafc`), títulos oscuros de alta legibilidad (`#0f172a`) y sombras suaves.

### 🏆 Fase 4: Recorrido Completo de los 4 Trades en Auditoría de Fondeo (`index.html`)
- **Secuencia Integral de la Auto-Reproducción de Fondeo:**
  - Se corrigió el motor de stories (`TAB_STORY_CONFIGS.propfirm`) que anteriormente saltaba bruscamente del Paso 1 al Paso 4, omitiendo los pasos intermedios y mostrando solo 2 operaciones antes de concluir.
  - Ahora la reproducción automática ejecuta la secuencia completa y fluida trade a trade:
    - **Paso 0 ($t = 0\text{ ms}$):** Configuración de parámetros iniciales cargados (0/5 Días, Balance $100,000, 0.0% progreso).
    - **Paso 1 ($t = 1,400\text{ ms}$):** **Trade 1 (Día 1):** XAUUSD Compra `+$2,400.00` (`+2.40%`), colchón diario intacto al 4.7% libre, progreso al 24.0%.
    - **Paso 2 ($t = 4,200\text{ ms}$):** **Trade 2 (Día 2):** US30 Compra `+$2,850.00` (`+2.85%`), supera el 50% de la meta en balance `$105,250.00`.
    - **Paso 3 ($t = 7,000\text{ ms}$):** **Trade 3 (Día 3):** Stop Loss Disciplinado `-$600.00` (`-0.60%`), demostrando en vivo la protección anti-tilt y el blindaje de capital con insignia ámbar `🛡️ PÉRDIDA CONTROLADA (SEGURO)`.
    - **Paso 4 ($t = 9,800\text{ ms}$):** **Trade 4 (Día 4):** GBPJPY Compra `+$3,100.00` (`+3.10%`), balance `$107,750.00` (77.5% de la meta), con badge de alerta `⚡ A 1 TRADE DE LA META`.
    - **Paso 5 ($t = 12,600\text{ ms}$):** **Meta Alcanzada (Día 5):** Salto final a 100% de la meta (`+$10,200.00` / `+10.20%`), 5/5 días cumplidos, insignia `👑 CUENTA FONDEADA APROBADA` y despliegue del modal de felicitaciones con trofeo animado, desglose cuantitativo y lluvia de confeti.
    - **Cierre Suave ($t = 17,800\text{ ms}$):** Cierre automático del modal de celebración mediante `closePhaseCelebrationModal()`, permitiendo un ciclo fluido de 18.5 segundos antes de retornar a la Pestaña 1.
  - Sincronización limpia entre el tour automático y la interacción manual para evitar saltos o desincronizaciones de estado.

---

## [v3.7.1] - 2026-11-15

### 🎨 Sincronización Cromática de Marca en Modo Backtesting (`app.html`, `js/app.js`)
- **Acento Dinámico de "Trade" según Modo Operativo:**
  - Se vinculó el elemento de acento con `id="main-header-trade-accent"` y clases de transición suave `transition-colors duration-200`.
  - En modo **Backtesting**, el acento `"Trade"` transmuta a **Azul Eléctrico** (`text-blue-400`), consolidando una armonía visual 100% coherente con el isotipo "A" azul y la insignia `BACKTESTING`.
  - En modo **Cuenta Real**, el acento `"Trade"` regresa suavemente a **Verde Esmeralda** (`text-emerald-400`), sincronizado con el isotipo esmeralda y el badge `PRO DASHBOARD`.

---

## [v3.7.0] - 2026-11-15

### 👑 Rebranding Oficial a "AsTrade" & Rediseño de Identidad Visual de Élite
- **Evolución de Marca a AsTrade (`index.html`, `app.html`):**
  - Adopción del nuevo nombre oficial **AsTrade** con descriptor: *"AsTrade — Plataforma de Analítica & Bitácora de Trading Profesional"*.
  - Tratamiento tipográfico con acento cromático: `As` en blanco y `Trade` en verde esmeralda (`As<span class="text-emerald-400">Trade</span>`).
- **Rediseño del Isotipo Oficial Fiel a la Referencia Visual (`assets/logo/astrade-mark.svg`):**
  - Modelado geométrico del monograma "A" compuesto por dos piezas armónicas:
    1. **Arco Arquitectónico & Pierna Derecha:** Cúpula superior suavemente redondeada con pilar derecho diagonal sólido que asienta en una base plana con esquinas suavizadas, finalizando el lado superior izquierdo con un corte en ángulo diagonal nítido.
    2. **Ola de Impulso / Barra Dinámica (S-Curve):** Cinta continua que se origina en el pie inferior izquierdo, asciende y fluye horizontalmente como una onda de tendencia alcista cruzando el contraespacio interior hacia la pierna derecha, separada de la pierna superior por una ranura negativa paralela de 20px.
  - **Tile de Aplicación & Favicon Squircle (`assets/logo/astrade-app-icon.svg`, `favicon.svg`):**
    - Contenedor squircle oscuro (`#0b0f19` a `#111827`), resplandor radial esmeralda ambiental y anillo orbital circular translúcido, fiel a la referencia a 16px/32px/64px.
  - **Adaptación Cromática Contextual en Dashboard (`js/app.js`):**
    - En modo **Cuenta Real**, el isotipo irradia gradiente Verde Esmeralda (`#059669` → `#10b981` → `#34d399`) con borde esmeralda.
    - En modo **Backtesting**, el isotipo conmuta dinámicamente a Azul Oceánico (`#1d4ed8` → `#3b82f6` → `#60a5fa`) con borde azul translúcido.
  - **Auditoría Técnica & Kit de Producción (`export_variants.py`):**
    - Puntuación 83/100 en `svg_audit.py` sin errores geométricos.
    - Generación y despliegue del set completo de favicons (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest`) y variantes monocromáticas (`black`, `white`, `mono`).
- **Actualización Integral de Puntos de Contacto:**
  - **Landing Page (`index.html`):** Nueva cabecera con el isotipo SVG, mobile showcase mockup, footer institucional y actualización del descargo de responsabilidad legal y regulatoria.
  - **Panel de Usuario (`app.html`):** Cabecera principal actualizada a `AsTrade PRO DASHBOARD` con el nuevo isotipo vectorial.
- **Continuidad y Cero Pérdida de Datos:**
  - Preservación total de las claves de almacenamiento local (`localStorage`) e infraestructura de base de datos para garantizar que las sesiones activas, cuentas de fondeo y registros de trades de los usuarios existentes se mantengan 100% intactos.

### 🐛 Corrección en Alternancia de Modo Backtesting (`app.html`, `js/app.js`)
- **Restauración de `main-header-icon` y Programación Defensiva:**
  - Se restauró el identificador `id="main-header-icon"` sobre el contenedor del nuevo logotipo en `app.html`.
  - Se añadieron comprobaciones seguras `if (mainIcon)` en `setMode()` en `js/app.js`, erradicando el error `TypeError: null` que detenía la ejecución de la función y bloqueaba la carga de las sesiones de backtest.
  - Ahora alternar entre **Cuenta Real** y **Backtesting** transiciona de forma instantánea, adaptando el título a *"Backtest Sessions"*, la pestaña a *"Tus Sesiones"*, ocultando los controles de cuenta real y renderizando todas las sesiones de simulación de forma limpia.

---

## [v3.6.7] - 2026-11-15

### 🃏 Baraja de Cartas 3D Interactiva con Rotación Fluida (3D Pricing Card Stack)
- **Escenario 3D con Perspectiva y Física Elástica (`index.html`, `css/styles.css`):**
  - Implementación de un escenario 3D (`perspective: 1200px`, `transform-style: preserve-3d`) para las 4 tarjetas de precios.
  - La tarjeta activa se sitúa al frente con escala completa, resplandor ambiental y micro-animaciones en cascada para cada una de sus características.
  - Las tarjetas secundarias reposan a los costados y detrás en capas tridimensionales con rotación sutil (`rotateY(±14deg)`), profundidad z y translucidez elegante, invitando a la exploración táctil.
  - **Ajuste de Proporciones y Altura Esbelta:** Calibración de altura a 415px (reduciendo 135px de espacio vacío vertical entre beneficios y botón de acción) para un acabado balanceado y compacto.
- **Sistema de Control Multicanal y Gestual:**
  - **Tabs Segmentadas:** 4 pestañas interactivas superiores con indicadores de ahorro y barra de progreso animada sincronizada con la auto-rotación.
  - **Clic Directo en Tarjetas:** Tocar cualquier tarjeta del fondo la traslada fluidamente hacia el frente mediante curvas de transición elástica (`spring cubic-bezier`).
  - **Flechas Flotantes Laterales:** Botones prev/next para navegación ágil de escritorio.
  - **Control Gestual Táctil (Swipe):** Detección nativa de gestos `touchstart`/`touchend` para deslizar entre planes en dispositivos móviles y tabletas.
  - **Auto-Rotación Inteligente:** Rotación automática demostrativa cada 5 segundos que se pausa temporalmente al posar el cursor y se desactiva permanentemente en el momento en que el usuario interactúa manualmente con cualquier control.
- **Micro-Animaciones en Cascada (Staggered Benefits):**
  - Cada vez que una tarjeta pasa al frente, sus 5 viñetas de valor se animan de forma secuencial y escalonada con checks luminosos.
- **Garantía Visual y Contrastes en Modo Claro / Oscuro:**
  - Estilos específicos de alto contraste para modo claro (`#ffffff`, bordes `#e2e8f0`, textos `#0f172a` y degradados de acento), asegurando legibilidad absoluta en ambos temas.

### 💳 Integración de Stripe y Nueva Estructura de 4 Planes de Precios
- **Stripe como Pasarela Oficial de Tarjetas (`index.html`, `app.html`, `js/payments.js`):**
  - Se configuró Stripe como el procesador principal para tarjetas de crédito y débito (Visa, Mastercard, Apple Pay, Google Pay) con enlaces directos de pago seguros y certificación PCI Service Provider Nivel 1.
  - Actualización de textos en FAQs, insignias de seguridad, avisos de reembolso y modales legales.
  - Actualización del entorno de simulación interactiva a *Stripe Checkout (Sandbox)*.
- **Cuatro Opciones de Suscripción con Desglose de Ahorros (`index.html`):**
  - **Mensual:** $25 USD / mes (Tarifa base flexible).
  - **Trimestral:** $70 USD ($23.33/mes &bull; Ahorras $5 USD / 7%).
  - **Semestral:** $135 USD ($22.50/mes &bull; Ahorras $15 USD / 10% &bull; *Opción Destacada*).
  - **Anual:** $250 USD ($20.83/mes &bull; Ahorras $50 USD / 17% &bull; *Mayor Ahorro*).
- **Rediseño Bento Glassmorphism & Suite SaaS Premium (`index.html`, `css/styles.css`):**
  - **Estética Glassmorphism:** Fondo translúcido con desenfoque (`backdrop-blur-xl`), bordes reactivos al cursor y resplandor ambiental (*ambient glow*) esmeralda de fondo.
  - **Jerarquía Asimétrica:** Plan Semestral ($135 USD) transformado en tarjeta Hero con borde esmeralda luminoso, elevación y botón interactivo; plan Anual ($250 USD) destacado con acentos ámbar de máximo ahorro; y planes Mensual y Trimestral con diseño sobrio y moderno.
  - **Beneficios Directos por Tarjeta:** Cada plan incorpora su propia lista de 4 a 5 viñetas de valor clave con micro-checks vectoriales estilizados.
  - **Optimización de Espacio:** Se eliminó el bloque inferior de características para dar lugar a una franja compacta de garantías (7 días de prueba, cancelación en 1 clic) y métodos de pago (Visa, Mastercard, USDT).
  - **Compatibilidad Dual:** Perfeccionamiento de contrastes y degradados tanto para Modo Oscuro como para Modo Claro.
- **Módulo de Pagos y Checkout (`js/payments.js`, `app.html`):**
  - Registro de los 4 intervalos (`month`, `quarter`, `semester`, `year`) en `PAYMENTS_CONFIG.pricing` y `PAYMENTS_CONFIG.stripe.paymentLinks`.
  - Soporte de 4 botones de selección rápida en el modal de checkout de la aplicación.

---

## [v3.6.6] - 2026-11-05

### 🔒 Unificación Completa de la Prueba Gratuita a 7 Días
- **Alineación de Autenticación y Duración de Sesión (`js/auth.js`):**
  - Se actualizó la constante central `TRIAL_DURATION_DAYS` de 14 a **7**.
  - Registro de usuarios locales configurado con expiración a 7 días y plan `"Pro Trial (7 días)"`.
- **Actualización de Pasarelas y Mensajes de Modo Solo Lectura (`js/payments.js`):**
  - Corrección de fallback de días restantes a 7 días.
  - Actualización del mensaje de aviso al vencer el período a *"Tu período de prueba de 7 días ha finalizado"*.
  - Enlace de prueba con Stripe actualizado a `test_month_7days_trial`.
- **Documentación del Esquema de Base de Datos (`supabase_schema.sql`):**
  - Comentarios del script actualizados para reflejar el intervalo de 7 días en el trigger de nuevos registros.

---

## [v3.6.5] - 2026-11-04

### 🚀 Flujo 1-Click Maestro Autónomo en Google Colab con Checkpoints & Empaquetado Ligero
- **Arquitectura 1-Click de Inicio a Fin (`TradingJournalPro_VideoGenerator_Colab.ipynb`):**
  - Consolidación del flujo en una **única celda maestra auto-suficiente** que ejecuta todo el pipeline de producción sin intervención manual:
    1. Montaje automático de Google Drive (`/content/drive/MyDrive`).
    2. Doble detección de recursos: Extrae `trading_saas_bundle.zip` o sincroniza desde `/MyDrive/trading-saas` (con fallback de clonado desde GitHub).
    3. Instalación desatendida de FFmpeg, Chromium Headless, Playwright, Edge-TTS y mutagen.
    4. Levantamiento de servidor HTTP local multi-hilo en segundo plano.
    5. Auditoría y síntesis fonética en inglés de las 30 escenas con `es-MX-JorgeNeural`.
    6. Renderizado modular con **Checkpoints Inteligentes**: Detecta videos ya generados en Drive y los salta automáticamente para ahorrar tiempo en reconexiones.
    7. **Aislamiento Total contra Conflicto de AsyncIO en Colab:** Se migró la invocación de Playwright a un subproceso desacoplado del bucle de eventos de IPython, erradicando el error `Playwright Sync API inside the asyncio loop` y garantizando compatibilidad nativa multiplataforma (Linux/Ubuntu/Colab con Chromium headless y banderas `--no-sandbox`).
    8. Mezcla Lo-Fi (-24 dB) y depósito directo de los videos MP4 1080p y miniaturas en `/MyDrive/TradingJournalPro_Tutorials_YouTube/`.
- **Script de Empaquetado Automático para Drive (`scripts/package_for_drive.py`):**
  - Genera un archivo ZIP ultra-optimizado de solo 12.8 MB (`trading_saas_bundle.zip`) que excluye artefactos temporales y librerías pesadas para subirse a Google Drive en segundos.
- **Reproductor HTML5 de Auditoría en Vivo:**
  - Selector de video integrado para reproducir cualquier tutorial en pantalla completa directamente dentro de Colab antes de publicarlo en YouTube.

---

## [v3.6.4] - 2026-11-03

### ☁️ Estudio en la Nube de Google Colab para Generación de Videos de YouTube
- **Libreta Oficial de Google Colab (`TradingJournalPro_VideoGenerator_Colab.ipynb`):**
  - Diseñada para renderizar los 5 videos tutoriales para YouTube en resolución 1080p (Full HD) de forma 100% remota en los servidores de Google, eliminando caídas de frames y carga en computadoras locales con recursos limitados.
  - **Botón Directo "Open in Colab"** integrado en el encabezado.
  - **Integración con Google Drive (`/content/drive/MyDrive/TradingJournalPro_Tutorials_YouTube/`):** Almacena automáticamente los videos MP4 finales y sus correspondientes miniaturas en alta resolución en la nube del usuario.
  - **Entorno Automático en Linux/Ubuntu:** Instalación desatendida de FFmpeg, Chromium Headless, Playwright, Edge-TTS y mutagen.
  - **Motor Modular de Grabación Sincronizada (`scripts/render/render_modular_tutorials.py`):**
    - Grabación escena por escena con duración idéntica a su locución para erradicar cualquier desincronización entre audio y video.
    - **Efecto Spotlight Profesional:** Máscara oscura al 65% con recorte y borde neón esmeralda (`#10b981`) que resalta los botones y métricas activas.
    - **Cursor Virtual & Ripple:** Puntero institucional con suavizado cúbico y animación de pulso verde en cada clic.
    - **Zoom Dinámico Pan & Zoom (1.4x a 1.6x):** Transiciones fluidas a formularios de trades, curva de equidad, calendario y panel de riesgo.
    - **Lower-Third Badges:** Tarjetas flotantes translúcidas con icono de paso y subtítulo explicativo de cada acción.
    - **Música de Fondo Lo-Fi:** Mezcla estéreo continua a -24 dB mediante bucle nativo sin saturación de memoria.
  - **Panel Interactivo de Renderizado:** Selector desplegable para renderizar tutoriales individuales (`Tutorial 1`, `Tutorial 2`, `Tutorial 3`, `Tutorial 4`, `Tutorial 5`) o la serie completa en bucle.
  - **Reproductor HTML5 Integrado:** Permite visualizar y auditar cualquier video generado en pantalla completa directamente dentro de Colab antes de descargarlo o subirlo a YouTube.
- **Sincronización Exacta de Capítulos en YouTube (`media/youtube_tutorials/GUIA_PUBLICACION_OFICIAL_YOUTUBE.md`):**
  - Ajuste de marcas de tiempo y capítulos de YouTube en los 5 tutoriales para coincidir exactamente con los audios de 2m 26s a 2m 36s de `manifest.json`.

---

## [v3.6.3] - 2026-11-03

### 🎬 Suite Oficial de Empaquetado y Publicación para YouTube
- **Diseño y Renderizado de 5 Miniaturas Oficiales en 1920x1080 PNG (`media/youtube_tutorials/thumbnails/`):**
  - Creadas con estética premium de trading institucional en fondo oscuro (`#0a0f1d`), cuadrícula técnica sutil, marcos esmeralda (`#10b981`), badges de alto impacto visual (CTR booster) y mockups flotantes de alta fidelidad:
    - `thumb_01.png`: *Onboarding y Configuración de Cuenta de Fondeo* (Badge "REGLAS 5% / 10%", tarjeta visual de cuenta $100K y reglas de evaluación).
    - `thumb_02.png`: *Registro de Trades y R:R Automático* (Badge "RATIO 1:2.5 CALCULADO", modal de orden en XAUUSD con stop loss y take profit en tiempo real).
    - `thumb_03.png`: *Laboratorio de Backtesting y Simulador de Payouts* (Badge "PROFIT SPLIT 90%", balance liquidado, desglose de cobro al trader y certificado de aprobación).
    - `thumb_04.png`: *Dashboard Institucional y Calendario de Rentabilidad* (Badge "WIN RATE 68% + DÍAS VERDES", curva de equidad ascendente y calendario mensual verde).
    - `thumb_05.png`: *Auditoría Anti-Quiebre y Blindaje de Drawdown* (Badge "PROTECCIÓN DRAWDOWN DIARIO", termómetro de drawdown con aguja indicadora y margen seguro disponible).
- **Guía Maestra Oficial de Publicación (`media/youtube_tutorials/GUIA_PUBLICACION_OFICIAL_YOUTUBE.md`):**
  - Documentación exhaustiva lista para copiar y pegar en YouTube Studio.
  - Títulos optimizados para el algoritmo (alto CTR y búsqueda orgánica en trading de prop firms).
  - Descripciones completas enriquecidas con el enlace de registro con 14 días gratis (`https://tradingjournalpro.pages.dev`), redes sociales oficiales, beneficios y llamadas a la acción.
  - 18 etiquetas / tags estratégicos seleccionados por cada uno de los 5 videos.
  - Estructura oficial de marcas de tiempo / capítulos de YouTube para habilitar capítulos automáticos.

---

## [v3.6.2] - 2026-11-03

### 🎯 Optimización de Barra de Navegación: Botón Compacto y Marquesina en Badge de Cuenta
- **Botón 'Nueva Entrada' Compacto con Despliegue Flotante hacia la Izquierda (`app.html`, `css/styles.css`, `js/app.js`):**
  - El botón `#btn-new-trade` se muestra contraído por defecto ocupando solo 34px (icono `+`).
  - Al pasar el cursor (`:hover`), se expande suavemente hacia la izquierda mostrando *"Nueva Entrada"* sobreponiéndose en una capa superior (`z-index: 30`) sin alterar el espacio del DOM ni empujar elementos.
- **Pestaña de Cuenta con Ancho Fijo y Marquesina Continua (`app.html`, `css/styles.css`, `js/app.js`):**
  - El badge `#active-account-badge` tiene un ancho fijo equilibrado de 125px.
  - Si el nombre de la cuenta o sesión supera el espacio visible, se activa una animación de marquesina continua en bucle que recorre el texto hacia la izquierda y reaparece por la derecha.
  - Al hacer hover sobre el badge, la animación se pausa y se muestra el `title` con el nombre completo.
- **Prevención de Salto de Línea en Barra de Pestañas (`app.html`):**
  - Se fijó la barra de navegación en una sola línea (`sm:flex-nowrap`) con scroll horizontal suave (`overflow-x-auto no-scrollbar`), evitando que los controles de la derecha bajen a una segunda fila.

---

## [v3.6.1] - 2026-11-03

### 📅 Apertura Contextual del Calendario Diario en Backtesting con Aislamiento Estricto
- **Apertura Referencial Inteligente en Backtesting (`js/app.js`):**
  - El Calendario Diario (`#section-calendar`) en Backtesting ahora se posiciona automáticamente en el mes y año de inicio de la sesión o en la fecha del último trade registrado, mediante la función `getBacktestEntryReferenceDate(sessionId)`.
  - Deja de abrir por defecto en el mes y año presente dentro de simulaciones históricas pasadas.
  - Se eliminó la etiqueta indicadora *"Hoy"* en las celdas del calendario para Backtesting, ya que carece de sentido en simulaciones históricas.
- **Aislamiento Total e Independencia de Cuentas Reales:**
  - Se implementó seguimiento de contexto separado (`dailyCalendarSessionContextId` para sesiones de backtesting y `dailyCalendarRealAccountContextId` para cuentas reales).
  - En **Cuentas Reales**, el Calendario Diario permanece 100% inalterado: continúa abriendo en la fecha y mes actuales del sistema con el indicador *"Hoy"* activo.
  - Ni la navegación a Dashboard & Métricas ni el Rendimiento por Mes sufren interferencias.
- **Tolerancia a Fallos y Población Defensiva:**
  - Se garantiza que el selector de mes siempre contenga sus 12 opciones completas antes de asignar valores, evitando estados vacíos o `NaN`.
  - El renderizado del calendario diario se ejecuta dentro de un bloque `try/catch` para blindar la ejecución general de la app ante cualquier eventualidad.

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

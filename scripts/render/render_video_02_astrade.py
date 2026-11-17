"""
AsTrade Studio Master Render Pipeline — Tutorial #2 (V5)
"Registro y Auditoría de Trades con Precisión Quirúrgica"
Toma Maestra Continua: Single Seamless Continuous Recording for app.html.

Key Architecture Features:
- Zero-Blur Policy: Strictly no `filter: blur(...)` or `backdrop-filter: blur(...)`.
  All elements remain 100% sharp with neon borders and solid dark backgrounds.
- Single Continuous Take: The Chromium session NEVER reloads or jumps.
- Full 7-block narrative synchronization anchored to manifest_v2.json:
    1. Bloque 1: Intro cinemática (intro_outro_motion.html?mode=intro&tutorial=2) y cuenta FTMO 100K.
    2. Bloque 2: Selección y contexto de cuenta, apertura de #tradeModal, par EURUSD, sesión New York, Market Buy.
    3. Bloque 3: Gestión de riesgo institucional, SL 15 pips, TP 45 pips (R:R 1:3.00), Riesgo 1.0% ($1,000 USD), cálculo de 6.66 lotes.
    4. Bloque 4: Evidencia gráfica antes de entrar (before_setup_eurusd.png), notas técnicas y estado Activa.
    5. Bloque 5: Auditoría post-trade, edición, conmutación a Full TP (+3.00% / +$3,000 USD), captura después (after_fulltp_eurusd.png).
    6. Bloque 6: Impacto en evaluación prop firm: balance $103,000 USD, Target al 37.5%, Drawdown 100% intacto y Galería visual.
    7. Bloque 7: Outro oficial (intro_outro_motion.html?mode=outro&tutorial=2) con astradehub.com y teaser de Tutorial #3.
- Master voice track (video_02_continuous_voice.mp3) + BGM ducking at volume=0.065.
- Output: media/youtube_tutorials/AsTrade_Tutorial_02_Trades_1080p.mp4.
"""

import os
import sys
import json
import time
import shutil
import asyncio
import subprocess
import threading
import http.server
import socketserver
import imageio_ffmpeg
from playwright.async_api import async_playwright

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch", "video_02")
AUDIO_DIR = os.path.join(SCRATCH_DIR, "audio")
SCENES_DIR = os.path.join(SCRATCH_DIR, "scenes")
OUTPUT_DIR = os.path.join(BASE_DIR, "media", "youtube_tutorials")
FINAL_MP4 = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_02_Trades_1080p.mp4")
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")

CHART_BEFORE = os.path.join(BASE_DIR, "media", "video2_assets", "charts", "before_setup_eurusd.png")
CHART_AFTER = os.path.join(BASE_DIR, "media", "video2_assets", "charts", "after_fulltp_eurusd.png")
MANIFEST_PATH = os.path.join(AUDIO_DIR, "manifest_v2.json")
MASTER_VOICE = os.path.join(AUDIO_DIR, "video_02_continuous_voice.mp3")
MOTION_ENGINE_JS = os.path.join(BASE_DIR, "scripts", "render", "studio_motion_engine.js")

PORT = 8089
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

os.makedirs(SCENES_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


# -------------------------------------------------------------
# 1. QUIET EMBEDDED HTTP SERVER
# -------------------------------------------------------------
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        try:
            super().do_GET()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass


class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def start_http_server():
    try:
        server = ThreadingHTTPServer(("127.0.0.1", PORT), QuietHandler)
        t = threading.Thread(target=server.serve_forever, daemon=True)
        t.start()
        print(f"[HTTP] Servidor local activo en http://127.0.0.1:{PORT}/")
        return server
    except Exception:
        print(f"[HTTP] Servidor en puerto {PORT} ya activo o disponible.")
        return None


# -------------------------------------------------------------
# 2. AUDIO MANIFEST HELPER
# -------------------------------------------------------------
def load_manifest():
    if not os.path.exists(MANIFEST_PATH):
        raise FileNotFoundError(f"No se encontró manifest_v2.json en: {MANIFEST_PATH}")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


# -------------------------------------------------------------
# 3. TOMA MAESTRA CONTINUA PLAYWRIGHT (110.40s)
# -------------------------------------------------------------
async def record_video_02_continuous(p, manifest):
    total_duration = manifest.get("continuous_duration_seconds", 110.4)
    raw_dir = os.path.join(SCENES_DIR, "raw_video_02")
    raw_mp4 = os.path.join(SCENES_DIR, "raw_video_02.mp4")

    if not "--force" in sys.argv and os.path.exists(raw_mp4) and os.path.getsize(raw_mp4) > 1000000:
        print(f"⏩ Checkpoint activo para grabación cruda ({raw_mp4}). Saltando Playwright...")
        return raw_mp4

    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 INICIANDO TOMA MAESTRA CONTINUA V5 ({total_duration:.2f}s)")
    print("   -> Sincronización Estricta con manifest_v2.json y JorgeNeural")
    print("   -> Cumplimiento Obligatorio: Zero-Blur Standard (Nitidez 100%)")
    print("=" * 75)

    browser = await p.chromium.launch(
        headless=True,
        args=[
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--background-color=0b0f19",
            "--window-size=1920,1080"
        ]
    )
    context = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=raw_dir,
        record_video_size={"width": 1920, "height": 1080}
    )

    # Inyección preventiva: sesión activa institucional, cero tours y tipografía nítida
    await context.add_init_script("""
        localStorage.setItem('trading_saas_user_session', JSON.stringify({
            id: 'usr_astrade_pro',
            email: 'trader@astradehub.com',
            name: 'Trader Institucional',
            plan: 'pro_monthly',
            status: 'active',
            createdAt: new Date().toISOString()
        }));

        localStorage.setItem('journal_tour_never_show', 'true');
        localStorage.setItem('journal_tour_completed', 'true');
        localStorage.setItem('has_seen_onboarding', 'true');
        localStorage.setItem('trade_form_spotlight_completed', 'true');
        localStorage.setItem('lifecycle_guide_dont_show', 'true');
        localStorage.setItem('user_lifecycle_guide_completed', 'true');
        localStorage.setItem('trading_tour_seen', 'true');
        window.__SMOKE_TEST__ = true;
        window.__smokeTestRunning = true;
        window.__VIDEO_RENDER_MODE__ = true;

        window.startAppTour = function() { return false; };
        window.initTourAutoTrigger = function() { return false; };
        window.openTradeLifecycleGuide = function() { return false; };
        window.launchConfetti = function() { return false; };
        window.showFondeoCelebration = function() { return false; };
        window.confetti = function() {};

        const cleanStyle = document.createElement('style');
        cleanStyle.id = 'studio-clean-style';
        cleanStyle.innerHTML = `
            html, body {
                background-color: #0b0f19 !important;
            }
            #tourOverlay, .tour-overlay, #tourSvgMask, #tourTooltip, #tourHighlightRing,
            #lifecycleGuideOverlay, #lifecycleGuideModal, .shepherd-element,
            .fondeo-celebration, .fondeo-confetti, #confettiCanvas {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            /* Tipografía institucional nítida para YouTube 1080p sin distorsión de coordenadas */
            html {
                font-size: 17.5px !important;
            }
            .text-xs { font-size: 0.88rem !important; }
            .text-sm { font-size: 1.02rem !important; }
            .text-base { font-size: 1.15rem !important; }
            input, select, button {
                font-size: 1.02rem !important;
            }
        `;
        if (document.head) document.head.appendChild(cleanStyle);
        else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(cleanStyle));
    """)

    page = await context.new_page()
    page.on("pageerror", lambda err: print(f"[Browser Error] {err}"))
    try:
        cdp = await context.new_cdp_session(page)
        await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
            "color": {"r": 11, "g": 15, "b": 25, "a": 1}
        })
    except Exception:
        pass

    url = f"http://127.0.0.1:{PORT}/app.html"
    await page.goto(url, wait_until="domcontentloaded")
    await asyncio.sleep(0.4)

    # Inyectar Studio Motion Engine
    with open(MOTION_ENGINE_JS, "r", encoding="utf-8") as f:
        engine_code = f.read()
    await page.evaluate(engine_code)
    await page.evaluate("window.__initStudioMotionEngine()")

    # Pre-cargar cuenta FTMO 100K y estructurar Overlays Intro/Outro dentro de app.html
    await page.evaluate(f"""async () => {{
        // 1. Inyectar Cuenta Institucional FTMO 100K
        const account = {{
            id: 1731800000000,
            name: "Fondeo 100K FTMO",
            pair: "",
            startDate: null,
            balance: 100000,
            balanceActual: 100000,
            date: new Date().toLocaleDateString('es-ES'),
            stage: "prueba",
            goal: {{
                prueba: {{
                    targetPct: 8,
                    maxDDPct: 10,
                    phases: 1,
                    phase: 1,
                    target2Pct: 5,
                    phaseStartDate: null,
                    celebratedPhase: 0
                }},
                real: {{ mode: "percent", value: 0 }},
                fondeada: {{ splitPct: 80, bufferPct: 0 }}
            }},
            withdrawals: []
        }};

        if (typeof realAccounts !== 'undefined') {{
            realAccounts.length = 0;
            realAccounts.push(account);
        }}
        if (typeof dbSet === 'function') {{
            await dbSet('trading_journal_real_accounts', [account]);
            await dbSet('trading_journal_data', []);
            await dbSet('trading_journal_real_balance_history', [{{
                id: 1,
                accountId: account.id,
                balance: 100000,
                date: new Date().toISOString()
            }}]);
        }}
        if (typeof renderGroups === 'function') {{
            renderGroups();
        }}
        if (typeof loadDataForMode === 'function') {{
            await loadDataForMode();
        }}
        if (typeof renderAll === 'function') {{
            renderAll();
        }}

        // 2. Crear Overlays Intro y Outro Iframe de Máxima Nitidez
        const introFrame = document.createElement('iframe');
        introFrame.id = 'studio-intro-frame';
        introFrame.src = 'http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=intro&tutorial=2&title=' + encodeURIComponent('Registro y Auditoría de Trades') + '&subtitle=' + encodeURIComponent('Cálculo de riesgo, ratio R:R y capturas técnicas');
        introFrame.style.cssText = 'position: fixed; top: 0; left: 0; width: 1920px; height: 1080px; border: none; z-index: 9999980; background: #0b0f19; transition: opacity 0.75s ease; opacity: 1;';
        document.body.appendChild(introFrame);

        const outroFrame = document.createElement('iframe');
        outroFrame.id = 'studio-outro-frame';
        outroFrame.src = 'about:blank';
        outroFrame.style.cssText = 'position: fixed; top: 0; left: 0; width: 1920px; height: 1080px; border: none; z-index: 9999980; background: #0b0f19; transition: opacity 0.75s ease; opacity: 0; pointer-events: none; display: none;';
        document.body.appendChild(outroFrame);
    }}""")

    # Timestamp de inicio de la coreografía
    t_start = time.time()
    blocks = manifest["blocks_by_id"]

    # =========================================================================
    # BLOQUE 1: INTRO CINEMÁTICA Y CUENTA FONDEO 100K (0.00s — 12.31s)
    # =========================================================================
    b1 = blocks["block1_intro_continuity"]
    print(f"\n⚡ [Bloque 1/7] {b1['title']} ({b1['duration_seconds']}s)...")

    # Dejar correr la animación del Intro Iframe durante los primeros 4.8s
    await asyncio.sleep(4.8)

    # Desvanecer Intro Iframe suavemente para revelar app.html y panel de cuentas
    await page.evaluate("""() => {
        const frame = document.getElementById('studio-intro-frame');
        if (frame) {
            frame.style.opacity = '0';
            setTimeout(() => { frame.style.display = 'none'; }, 750);
        }
    }""")
    await asyncio.sleep(0.8)

    # Mostrar Lower-Third y destacar la tarjeta de la cuenta FTMO 100K
    account_card = "#sessions-grid > div:first-child"
    btn_enter_card = '#sessions-grid > div:first-child button[data-account-action="metrics"]'

    await page.evaluate(f"""() => {{
        window.__showLowerThird('⚡', '{b1['tag']}', 'Acceso y Auditoría: Cuenta Fondeo 100K FTMO');
        window.__pulseRingAround('{account_card}', 8);
    }}""")
    await asyncio.sleep(1.5)

    # Deslizar cursor hacia el botón de entrada de la tarjeta
    await page.evaluate("(sel) => window.__glideCursorToElement(sel, 750)", btn_enter_card)
    await asyncio.sleep(0.9)

    # Clic con ripple para entrar a la cuenta
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.3)
    await page.evaluate("""(sel) => {
        window.__removePulseRing();
        const btn = document.querySelector(sel);
        if (btn) btn.click();
        if (typeof enterGroup === 'function') enterGroup(1731800000000);
    }""", btn_enter_card)
    await asyncio.sleep(1.0)

    # Esperar hasta fin del bloque 1 según manifest (12.31s)
    rem1 = b1["cumulative_end"] - (time.time() - t_start)
    if rem1 > 0:
        await asyncio.sleep(rem1)

    # =========================================================================
    # BLOQUE 2: APERTURA Y PARÁMETROS OPERATIVOS (12.31s — 26.42s)
    # =========================================================================
    b2 = blocks["block2_modal_setup"]
    print(f"\n📊 [Bloque 2/7] {b2['title']} ({b2['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__showLowerThird('📊', '{b2['tag']}', 'Terminal Operativa: Selección EURUSD en New York');
    }}""")
    await asyncio.sleep(0.5)

    # Planeo del cursor hacia "#btn-new-trade"
    btn_trade = "#btn-new-trade"
    await page.evaluate(f"window.__glideCursorToElement('{btn_trade}', 650)")
    await asyncio.sleep(0.8)

    # Clic para abrir el modal
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.3)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{btn_trade}');
        if (btn) btn.click();
        if (typeof openTradeModal === 'function') openTradeModal();
    }}""")
    await asyncio.sleep(0.8)

    # Callout badge flotante con parámetros
    await page.evaluate("""() => {
        window.__showCalloutBadge('#tradeModal', '📊', 'SETUP TÉCNICO', 'Confluencias de Mercado', 'EURUSD · Sesión NY · Tendencia a Favor', 'bottom');
    }""")
    await asyncio.sleep(1.2)

    # Selección de Par: EURUSD
    await page.evaluate("window.__glideCursorToElement('#inputPar', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("""() => {
        const el = document.getElementById('inputPar');
        if (el) {
            if (!Array.from(el.options).some(o => o.value === 'EURUSD')) {
                el.innerHTML += '<option value="EURUSD">EURUSD</option>';
            }
            el.value = 'EURUSD';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.2)

    # Selección de Sesión: New York
    await page.evaluate("window.__glideCursorToElement('#inputSesion', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("""() => {
        const el = document.getElementById('inputSesion');
        if (el) {
            el.value = 'New York';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.2)

    # Confirmar Tendencia a Favor
    await page.evaluate("window.__glideCursorToElement('#inputTendencia', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputTendencia');
        if (el) {
            el.value = 'Favor';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.0)

    # Tipo de orden: Market Buy
    await page.evaluate("window.__glideCursorToElement('#inputOrden', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputOrden');
        if (el) {
            el.value = 'Market Buy';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(0.8)

    # Esperar hasta fin del bloque 2 según manifest (26.42s)
    rem2 = b2["cumulative_end"] - (time.time() - t_start)
    if rem2 > 0:
        await asyncio.sleep(rem2)

    # =========================================================================
    # BLOQUE 3: RIESGO, STOP LOSS, TAKE PROFIT Y LOTAJE AUTOMÁTICO (26.42s — 46.10s)
    # =========================================================================
    b3 = blocks["block3_risk_lots"]
    print(f"\n🎯 [Bloque 3/7] {b3['title']} ({b3['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__hideCalloutBadge();
        window.__showLowerThird('🎯', '{b3['tag']}', 'SL 15 pips, TP 45 pips (R:R 1:3.0) y 6.66 Lotes');
    }}""")
    await asyncio.sleep(0.5)

    # Typewriter en Stop Loss: 15 pips
    await page.evaluate("window.__glideCursorToElement('#inputPipsSL', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("window.__typeIntoInput('#inputPipsSL', '15', 50)")
    await asyncio.sleep(1.5)

    # Typewriter en Take Profit: 45 pips
    await page.evaluate("window.__glideCursorToElement('#inputPipsTP', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("window.__typeIntoInput('#inputPipsTP', '45', 50)")
    await asyncio.sleep(1.5)

    # Resaltar Ratio R:R (1:3.00) con anillo de pulso nítido
    await page.evaluate("""() => {
        if (typeof calculateRR === 'function') calculateRR();
        window.__pulseRingAround('#inputRR', 6);
        window.__showCalloutBadge('#inputRR', '🎯', 'RATIO R:R CALCULADO', '1:3.00 Institucional', 'Objetivo de beneficio 3x sobre el riesgo', 'right');
    }""")
    await asyncio.sleep(4.5)

    # Selector de Riesgo: 1.0% ($1,000 USD sobre $100K)
    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")
    await page.evaluate("window.__glideCursorToElement('#inputRiesgo', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("""() => {
        const el = document.getElementById('inputRiesgo');
        if (el) {
            el.value = '1.0';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (typeof calculatePositionSize === 'function') calculatePositionSize();
    }""")
    await asyncio.sleep(1.0)

    # Spotlight y Callout sobre el cálculo automático de lotaje: 6.66 lotes
    await page.evaluate("""() => {
        window.__pulseRingAround('#inputLotajeCalc', 8);
        window.__showCalloutBadge('#inputLotajeCalc', '🛡️', 'LOTAJE INSTITUCIONAL', '6.66 Lotes Calculados', '1.0% ($1,000 USD) sobre Balance Inicial $100,000', 'right');
    }""")
    await asyncio.sleep(3.5)

    # Esperar hasta fin del bloque 3 según manifest (46.10s)
    rem3 = b3["cumulative_end"] - (time.time() - t_start)
    if rem3 > 0:
        await asyncio.sleep(rem3)

    # =========================================================================
    # BLOQUE 4: BITÁCORA TÉCNICA (ANTES), CAPTURA Y ESTADO ACTIVA (46.10s — 63.16s)
    # =========================================================================
    b4 = blocks["block4_visual_before_active"]
    print(f"\n📸 [Bloque 4/7] {b4['title']} ({b4['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__showLowerThird('📸', '{b4['tag']}', 'Tesis Técnica Antes de Entrar y Gráfico TradingView HD');
    }}""")
    await asyncio.sleep(0.5)

    # Typewriter en Notas Antes
    await page.evaluate("window.__glideCursorToElement('#inputNotaAntes', 500)")
    await asyncio.sleep(0.6)
    nota_antes = "Quiebre de estructura y sweep de liquidez en sesión NY."
    await page.evaluate(f"window.__typeIntoInput('#inputNotaAntes', '{nota_antes}', 38)")
    await asyncio.sleep(1.2)

    # Inyección de Captura Gráfica "Antes"
    print("   -> Inyectando captura HD Antes de entrar...")
    await page.set_input_files("#inputCapturasAntes", CHART_BEFORE)
    await asyncio.sleep(1.5)

    await page.evaluate("""() => {
        window.__showCalloutBadge('#imagesPreviewAntes', '📋', 'CAPTURA HD ADJUNTADA', 'TradingView Setup Antes', 'Estructura técnica y niveles registrados', 'right');
    }""")
    await asyncio.sleep(3.0)

    # Marcar Estado: Activa
    await page.evaluate("window.__hideCalloutBadge()")
    await page.evaluate("window.__glideCursorToElement('#inputEstado', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputEstado');
        if (el) {
            el.value = 'Activa';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.0)

    # Guardar Operación Activa
    btn_submit = "#btn-submit-trade"
    await page.evaluate(f"window.__glideCursorToElement('{btn_submit}', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{btn_submit}');
        if (btn) btn.click();
        else if (typeof saveTrade === 'function') saveTrade(new Event('submit'));
    }}""")
    await asyncio.sleep(1.2)

    # Destacar la fila del trade activo en la tabla
    row_active = "#journal-table-body tr:first-child"
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{row_active}', 6);
        window.__showCalloutBadge('{row_active}', '🔵', 'TRADE EN CURSO', 'Estado: Activa', 'Registrado en historial sin alterar estadísticas', 'bottom');
    }}""")
    await asyncio.sleep(2.0)

    # Esperar hasta fin del bloque 4 según manifest (63.16s)
    rem4 = b4["cumulative_end"] - (time.time() - t_start)
    if rem4 > 0:
        await asyncio.sleep(rem4)

    # =========================================================================
    # BLOQUE 5: AUDITORÍA POST-TRADE, CAPTURA DESPUÉS Y CIERRE FULL TP (63.16s — 81.71s)
    # =========================================================================
    b5 = blocks["block5_post_trade_audit"]
    print(f"\n🎯 [Bloque 5/7] {b5['title']} ({b5['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__showLowerThird('🎯', '{b5['tag']}', 'Auditoría Post-Trade: Cierre en Full TP (+3.00%)');
    }}""")
    await asyncio.sleep(0.5)

    # Clic en el botón de edición de la fila para reabrir modal
    btn_edit = '#journal-table-body tr:first-child button[title*="Editar"]'
    has_edit_btn = await page.evaluate("(sel) => Boolean(document.querySelector(sel))", btn_edit)
    if not has_edit_btn:
        btn_edit = "#journal-table-body tr:first-child button:has(i.fa-pen-to-square)"

    await page.evaluate("(sel) => window.__glideCursorToElement(sel, 500)", btn_edit)
    await asyncio.sleep(0.6)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""(sel) => {
        const btn = document.querySelector(sel);
        if (btn) btn.click();
        if (typeof openTradeModal === 'function' && Array.isArray(trades) && trades.length > 0) openTradeModal(trades[0].id);
    }""", btn_edit)
    await asyncio.sleep(1.2)

    # Conmutar Estado a Full TP
    await page.evaluate("window.__glideCursorToElement('#inputEstado', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputEstado');
        if (el) {
            el.value = 'Full TP';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.0)

    # Typewriter en Notas Después
    await page.evaluate("window.__glideCursorToElement('#inputNotaDespues', 500)")
    await asyncio.sleep(0.6)
    nota_despues = "Take Profit alcanzado en full target; plan de trading 100% respetado."
    await page.evaluate(f"window.__typeIntoInput('#inputNotaDespues', '{nota_despues}', 38)")
    await asyncio.sleep(1.2)

    # Inyección de Captura Gráfica "Después"
    print("   -> Inyectando captura HD Después de salir (Full TP)...")
    await page.set_input_files("#inputCapturasDespues", CHART_AFTER)
    await asyncio.sleep(1.5)

    await page.evaluate("""() => {
        window.__showCalloutBadge('#imagesPreviewDespues', '🎯', 'FULL TP AUDITADO', 'TradingView Salida HD', '+$3,000.00 USD (+3.00% de beneficio neto)', 'right');
    }""")
    await asyncio.sleep(3.0)

    # Guardar auditoría del trade
    await page.evaluate("window.__hideCalloutBadge()")
    await page.evaluate(f"window.__glideCursorToElement('{btn_submit}', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{btn_submit}');
        if (btn) btn.click();
        else if (typeof saveTrade === 'function') saveTrade(new Event('submit'));
    }}""")
    await asyncio.sleep(1.2)

    # Destacar fila actualizada en la tabla
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{row_active}', 6);
        window.__showCalloutBadge('{row_active}', '✅', 'FULL TP REGISTRADO', 'Ganancia Neta: +$3,000.00 USD', 'Balance de cuenta elevado a $103,000.00 USD', 'bottom');
    }}""")
    await asyncio.sleep(2.0)

    # Esperar hasta fin del bloque 5 según manifest (81.71s)
    rem5 = b5["cumulative_end"] - (time.time() - t_start)
    if rem5 > 0:
        await asyncio.sleep(rem5)

    # =========================================================================
    # BLOQUE 6: IMPACTO EN REGLAS DE PROP FIRM Y GALERÍA (81.71s — 100.02s)
    # =========================================================================
    b6 = blocks["block6_prop_firm_impact"]
    print(f"\n📈 [Bloque 6/7] {b6['title']} ({b6['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__showLowerThird('📈', '{b6['tag']}', 'Balance $103,000 USD · Target al 37.5% · Drawdown Intacto');
    }}""")
    await asyncio.sleep(0.5)

    # Clic en pestaña Metas / Goals
    tab_goals = "#tab-btn-goals"
    await page.evaluate(f"window.__glideCursorToElement('{tab_goals}', 500)")
    await asyncio.sleep(0.6)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_goals}');
        if (btn) btn.click();
        if (typeof renderGoals === 'function') renderGoals();
    }}""")
    await asyncio.sleep(1.2)

    # Resaltar Profit Target al 37.5%
    goal_panel = "#account-goal-panel"
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{goal_panel}', 8);
        window.__showCalloutBadge('{goal_panel}', '📈', 'PROFIT TARGET: 37.5%', '+$3,000 de $8,000 requeridos', 'Drawdown Máximo 100% intacto ($10,000 USD)', 'bottom');
    }}""")
    await asyncio.sleep(3.2)

    # Transición breve a Dashboard para confirmar impacto en métricas
    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")
    tab_dash = "#tab-btn-dashboard"
    await page.evaluate(f"window.__glideCursorToElement('{tab_dash}', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_dash}');
        if (btn) btn.click();
    }}""")
    await asyncio.sleep(1.0)
    await page.evaluate("""() => {
        window.__pulseRingAround('#dashboardBalanceActual', 6);
        window.__showCalloutBadge('#dashboardBalanceActual', '💰', 'BALANCE ACTUALIZADO', '$103,000.00 USD', 'Crecimiento de capital reflejado en tiempo real', 'bottom');
    }""")
    await asyncio.sleep(2.8)

    # Clic en pestaña Galería para mostrar comparativa lado a lado
    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")
    tab_gallery = "#tab-btn-gallery"
    await page.evaluate(f"window.__glideCursorToElement('{tab_gallery}', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_gallery}');
        if (btn) btn.click();
        if (typeof renderGalleryCards === 'function') renderGalleryCards();
    }}""")
    await asyncio.sleep(1.5)

    # Destacar tarjeta comparativa de la galería
    gallery_card = "#gallery-cards-container > div:first-child"
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{gallery_card}', 8);
        window.__showCalloutBadge('{gallery_card}', '🖼️', 'BITÁCORA COMPARATIVA', 'Antes vs Después en Alta Definición', 'Confluencias de entrada y salida registradas', 'bottom');
    }}""")
    await asyncio.sleep(2.8)

    # Esperar hasta fin del bloque 6 según manifest (100.02s)
    rem6 = b6["cumulative_end"] - (time.time() - t_start)
    if rem6 > 0:
        await asyncio.sleep(rem6)

    # =========================================================================
    # BLOQUE 7: OUTRO OFICIAL Y LLAMADO A LA ACCIÓN (100.02s — 110.34s)
    # =========================================================================
    b7 = blocks["block7_outro_cta"]
    print(f"\n🚀 [Bloque 7/7] {b7['title']} ({b7['duration_seconds']}s)...")

    # Limpiar overlays de motion engine
    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__hideLowerThird();
    }""")

    # Desplegar Outro Iframe con transición suave de opacidad y disparo fresco
    await page.evaluate(f"""() => {{
        const frame = document.getElementById('studio-outro-frame');
        if (frame) {{
            frame.src = 'http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=outro&tutorial=2';
            frame.style.display = 'block';
            frame.style.pointerEvents = 'auto';
            requestAnimationFrame(() => {{
                frame.style.opacity = '1';
            }});
        }}
    }}""")

    # Dejar reproducir la animación oficial del Outro hasta el fundido final
    await asyncio.sleep(total_duration - (time.time() - t_start) - 1.2)

    # Fundido a negro absoluto
    await page.evaluate("""() => {
        const frame = document.getElementById('studio-outro-frame');
        if (frame && frame.contentWindow && typeof frame.contentWindow.__fadeOutStage === 'function') {
            frame.contentWindow.__fadeOutStage();
        }
    }""")
    await asyncio.sleep(1.2)

    print("🏁 Grabación continua finalizada. Cerrando Chromium...")
    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se generó el archivo WebM de la toma continua.")
    raw_webm = webms[0]

    # Mux preliminar recortando 150ms de latencia inicial de WebM
    print(f"📦 Muxing de WebM preliminar ({raw_webm})...")
    pre_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "0.150",
        "-i", raw_webm,
        "-filter_complex", "[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
        "-map", "[v]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-t", f"{total_duration:.3f}",
        raw_mp4
    ]
    try:
        subprocess.run(pre_cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print("[FFmpeg WebM Mux Error]", e.stderr)
        raise
    print(f"✅ Video crudo generado: {raw_mp4} ({os.path.getsize(raw_mp4)/(1024*1024):.2f} MB)")
    return raw_mp4


# -------------------------------------------------------------
# 4. MASTER AUDIO MIX & FINAL ASSEMBLY
# -------------------------------------------------------------
def assemble_master_video(raw_video_mp4, manifest):
    total_len = manifest.get("continuous_duration_seconds", 110.4)
    print("\n" + "=" * 75)
    print("🎞️ ENSAMBLANDO VIDEO MAESTRO FINAL CON FFmpeg")
    print(f"🎙️ Voz Maestra: {MASTER_VOICE}")
    print(f"🎵 Música BGM: {BG_MUSIC} (Ducking volume=0.065)")
    print(f"🎬 Video Final: {FINAL_MP4}")
    print("=" * 75)

    if not os.path.exists(MASTER_VOICE):
        raise FileNotFoundError(f"Falta archivo de locución maestra: {MASTER_VOICE}")

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_video_mp4,
        "-i", MASTER_VOICE
    ]

    has_music = os.path.exists(BG_MUSIC)
    if has_music:
        cmd.extend(["-i", BG_MUSIC])
        music_idx = 2
    else:
        music_idx = None

    filter_complex = []
    if has_music:
        fade_out_start = max(0, total_len - 2.5)
        filter_complex.append(
            f"[{music_idx}:a]volume=0.065,afade=t=out:st={fade_out_start:.2f}:d=2.5[bgm];"
            f"[1:a][bgm]amix=inputs=2:duration=first:dropout_transition=2[a_final]"
        )
        final_audio_map = "[a_final]"
    else:
        final_audio_map = "1:a"

    cmd.extend([
        "-filter_complex", ";".join(filter_complex),
        "-map", "0:v",
        "-map", final_audio_map,
        "-c:v", "libx264", "-preset", "slow", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{total_len:.3f}",
        "-movflags", "+faststart",
        FINAL_MP4
    ])

    print("🚀 Ejecutando FFmpeg Master Assembly...")
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print("[FFmpeg Error]", p.stderr[-800:])
        raise RuntimeError(f"FFmpeg assembly failed: {p.stderr}")

    size_mb = os.path.getsize(FINAL_MP4) / (1024 * 1024)
    print("\n" + "=" * 75)
    print("🎉 VIDEO TUTORIAL #2 COMPLETADO CON ÉXITO:")
    print(f"📍 Archivo MP4: {FINAL_MP4}")
    print(f"📦 Tamaño: {size_mb:.2f} MB")
    print(f"⏱️ Duración efectiva: {total_len:.2f}s ({total_len/60:.2f} min)")
    print("🎯 Cero desenfoques: Cumplimiento 100% de la directiva de nitidez")
    print("=" * 75)
    return FINAL_MP4


# -------------------------------------------------------------
# 5. MAIN ENTRY POINT
# -------------------------------------------------------------
async def main():
    print("=" * 75)
    print("🚀 PIPELINE DE PRODUCCIÓN AUDIOVISUAL ASTRADE — TUTORIAL #2")
    print("   'Registro y Auditoría de Trades con Precisión Quirúrgica'")
    print("=" * 75)

    server = start_http_server()
    manifest = load_manifest()

    async with async_playwright() as p:
        raw_video = await record_video_02_continuous(p, manifest)

    assemble_master_video(raw_video, manifest)


if __name__ == "__main__":
    asyncio.run(main())

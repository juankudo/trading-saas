"""
AsTrade Studio Master Render Pipeline — Tutorial #2 (V6)
"Registro y Auditoría de Trades con Precisión Quirúrgica"

Arquitectura de Producción de 3 Escenas Limpias:
1. Escena 1 (Intro Cinemático): intro_outro_motion.html?mode=intro&tutorial=2
   - Muxing sincronizado con Jorge leyendo el título del tutorial.
   - Cero parpadeos ni fotogramas vacíos.
2. Escena 2 (Toma Continua en App): app.html
   - Cuenta 100K Challenge pre-cargada con balanceActual dinámico (null).
   - Zero-Blur Global: Interfaz 100% nítida, sin desenfoques de fondo.
   - Flujo operativo continuo en 6 bloques fonéticamente sincronizados:
       * Bloque 1: Vista general de Tus Cuentas y entrada a Métricas.
       * Bloque 2: Clic en Nueva Entrada, selección EURUSD, New York, Market Buy.
       * Bloque 3: Stop Loss 15 pips, Take Profit 45 pips (R:R 1:3.00), Riesgo 1.0% ($1,000 USD), cálculo de 6.66 lotes.
       * Bloque 4: Bitácora visual Antes, pegado de captura TradingView, orden Activa.
       * Bloque 5: Navegación visual a pestaña Registro de Trades, fila activa, botón editar (fa-pen), cambio a Full TP, pegado captura Después y notas.
       * Bloque 6: Visualización de impacto: gráfica de evolución subiendo limpiamente a $103,000 (+3.00%), Retorno Total en verde (+3.00%), balance actual en $103,000 USD, pestaña Metas (Target al 37.5% y DD 100% intacto) y pestaña Galería.
3. Escena 3 (Outro Institucional): intro_outro_motion.html?mode=outro&tutorial=2
   - astradehub.com y teaser del Tutorial #3.
4. Ensamble Maestro: Disolución cruzada suave de 0.5s y música de fondo atenuada (ducking volume=0.065).
"""

import os
import sys
import json
import time
import shutil
import asyncio
import base64
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
# 3. ESCENA 1: INTRO CINEMÁTICO (5.40s)
# -------------------------------------------------------------
async def record_intro(p, manifest):
    scene_id = "intro"
    intro_info = manifest.get("intro", {})
    duration = intro_info.get("duration_seconds", 5.40) + 0.8  # Margen de animación y disolución
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")
    audio_path = os.path.join(AUDIO_DIR, "intro.mp3")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 300000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    print(f"\n🎬 [1/3] Filmando Escena Intro Cinemático ({duration:.2f}s)...")
    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

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

    page = await context.new_page()
    try:
        cdp = await context.new_cdp_session(page)
        await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
            "color": {"r": 11, "g": 15, "b": 25, "a": 1}
        })
    except Exception:
        pass

    url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=intro&tutorial=2"
    await page.goto(url, wait_until="domcontentloaded")
    await asyncio.sleep(duration - 1.0)
    try:
        await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
    except Exception:
        pass
    await asyncio.sleep(1.0)

    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se encontró WebM para intro")
    raw_webm = webms[0]

    # Mux with audio and pre-roll trim
    mux_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "0.150",
        "-i", raw_webm,
        "-i", audio_path,
        "-filter_complex", "[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{duration:.3f}",
        scene_mp4
    ]
    subprocess.run(mux_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Intro completado: {scene_mp4}")
    return scene_mp4


# -------------------------------------------------------------
# 4. ESCENA 2: TOMA CONTINUA EN APP.HTML (108.62s)
# -------------------------------------------------------------
async def record_app_flow_continuous(p, manifest):
    scene_id = "app_flow_continuous"
    cont_audio = os.path.join(AUDIO_DIR, "video_02_continuous_voice.mp3")
    duration = manifest.get("continuous_duration_seconds", 108.62)
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 1000000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [2/3] Filmando Flujo Operativo Continuo en app.html ({duration:.2f}s)")
    print("   -> Cero Blur Global (Zero-Blur Standard)")
    print("   -> Sincronización Fonética con manifest_v2.json")
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

    # Inyección preventiva en localStorage
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
            *, *::before, *::after {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }
            #tourOverlay, .tour-overlay, #tourSvgMask, #tourTooltip, #tourHighlightRing,
            #lifecycleGuideOverlay, #lifecycleGuideModal, .shepherd-element,
            .fondeo-celebration, .fondeo-confetti, #confettiCanvas {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            #tradeModal, #sessionModal {
                backdrop-filter: none !important;
                background-color: rgba(5, 8, 18, 0.6) !important;
            }
            /* Tipografía nítida para YouTube 1080p */
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
    try:
        cdp = await context.new_cdp_session(page)
        await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
            "color": {"r": 11, "g": 15, "b": 25, "a": 1}
        })
    except Exception:
        pass

    url = f"http://127.0.0.1:{PORT}/app.html"
    await page.goto(url, wait_until="domcontentloaded")
    await asyncio.sleep(0.3)

    # Inyectar Motion Engine
    with open(MOTION_ENGINE_JS, "r", encoding="utf-8") as f:
        engine_code = f.read()
    await page.evaluate(engine_code)
    await page.evaluate("window.__initStudioMotionEngine()")

    # Pre-cargar cuenta 100K Challenge con balanceActual: null (para proyección dinámica de trades)
    await page.evaluate(f"""async () => {{
        const account = {{
            id: 1731800000000,
            name: "Fondeo 100K Challenge",
            pair: "",
            startDate: null,
            balance: 100000,
            balanceActual: null, // Dinámico para reflejar +3% automáticamente
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

        if (typeof dbSet === 'function') {{
            await dbSet('trading_journal_real_accounts', [account]);
            await dbSet('trading_journal_data', []);
        }}
        if (typeof realAccounts !== 'undefined') {{
            realAccounts.length = 0;
            realAccounts.push(account);
        }}
        if (typeof trades !== 'undefined') {{
            trades.length = 0;
        }}
        if (typeof loadDataForMode === 'function') {{
            await loadDataForMode();
        }}
        if (typeof renderGroups === 'function') {{
            renderGroups();
        }}
    }}""")
    await asyncio.sleep(0.4)

    t_start = time.time()
    blocks = manifest["blocks_by_id"]

    # =========================================================================
    # BLOQUE 1: CONTINUIDAD & ENTRADA A CUENTA FONDEO 100K (0.00s — 12.31s)
    # =========================================================================
    b1 = blocks["block1_intro_continuity"]
    print(f"\n⚡ [Bloque 1/6] {b1['title']} ({b1['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__showLowerThird('⚡', '{b1['tag']}', 'Acceso y Auditoría: Cuenta Fondeo 100K');
    }}""")
    await asyncio.sleep(1.0)

    account_card = "#sessions-grid > div:first-child"
    btn_enter_card = '#sessions-grid > div:first-child button[data-account-action="metrics"]'

    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{account_card}', 8);
        window.__showCalloutBadge('{account_card}', '⚡', 'CUENTA ACTIVA', 'Fondeo 100K Challenge', 'Fase 1: $100,000 USD | Target 8% | Max DD 10%', 'right');
    }}""")
    await asyncio.sleep(4.5)

    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")
    await page.evaluate("(sel) => window.__glideCursorToElement(sel, 650)", btn_enter_card)
    await asyncio.sleep(0.8)

    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.3)
    await page.evaluate("""(sel) => {
        const btn = document.querySelector(sel);
        if (btn) btn.click();
        if (typeof enterGroup === 'function') enterGroup(1731800000000);
    }""", btn_enter_card)
    await asyncio.sleep(1.0)

    rem1 = b1["cumulative_end"] - (time.time() - t_start)
    if rem1 > 0:
        await asyncio.sleep(rem1)

    # =========================================================================
    # BLOQUE 2: NUEVA ENTRADA Y PARÁMETROS OPERATIVOS (12.31s — 26.42s)
    # =========================================================================
    b2 = blocks["block2_modal_setup"]
    print(f"\n📊 [Bloque 2/6] {b2['title']} ({b2['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__showLowerThird('📊', '{b2['tag']}', 'Terminal Operativa: Selección EURUSD en New York');
    }}""")
    await asyncio.sleep(0.5)

    btn_trade = "#btn-new-trade"
    await page.evaluate(f"window.__glideCursorToElement('{btn_trade}', 600)")
    await asyncio.sleep(0.8)

    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.3)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{btn_trade}');
        if (btn) btn.click();
        if (typeof openTradeModal === 'function') openTradeModal();
    }}""")
    await asyncio.sleep(0.8)

    # Par EURUSD
    await page.evaluate("""() => {
        const elHora = document.getElementById('inputHora');
        if (elHora) {
            elHora.value = '09:30';
            elHora.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await page.evaluate("window.__glideCursorToElement('#inputPar', 450)")
    await asyncio.sleep(0.5)
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

    # Sesión New York
    await page.evaluate("window.__glideCursorToElement('#inputSesion', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputSesion');
        if (el) {
            el.value = 'New York';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.2)

    # Tendencia a Favor (opción 'Favor' en DOM)
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

    # Tipo de Orden: Market Buy (elemento '#inputOrden' en DOM)
    await page.evaluate("window.__glideCursorToElement('#inputOrden', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputOrden');
        if (el) {
            el.value = 'Market Buy';
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")

    rem2 = b2["cumulative_end"] - (time.time() - t_start)
    if rem2 > 0:
        await asyncio.sleep(rem2)

    # =========================================================================
    # BLOQUE 3: STOP LOSS, TAKE PROFIT, R:R Y LOTAJE (26.42s — 46.56s)
    # =========================================================================
    b3 = blocks["block3_risk_lots"]
    print(f"\n🎯 [Bloque 3/6] {b3['title']} ({b3['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__showLowerThird('🎯', '{b3['tag']}', 'SL 20 pips · TP 60 pips · Ratio R:R 1:3.00 · Riesgo 1.0% ($1,000 USD)');
    }}""")
    await asyncio.sleep(0.5)

    # Stop Loss: 20 pips
    await page.evaluate("window.__glideCursorToElement('#inputPipsSL', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputPipsSL');
        if (el) {
            el.value = '20';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.5)

    # Take Profit: 60 pips
    await page.evaluate("window.__glideCursorToElement('#inputPipsTP', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputPipsTP');
        if (el) {
            el.value = '60';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (typeof calculateRiskRewardLive === 'function') calculateRiskRewardLive();
    }""")
    await asyncio.sleep(2.0)

    # Riesgo 1.0%
    await page.evaluate("window.__glideCursorToElement('#inputRiesgo', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputRiesgo');
        if (el) {
            el.value = '1.0';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (typeof calculateRR === 'function') calculateRR();
        if (typeof calculatePositionSize === 'function') calculatePositionSize();
    }""")
    await asyncio.sleep(2.0)

    # Destacar cálculo de lotaje exacto (5.00 lotes sobre $100K)
    lot_selector = "#inputLotajeCalc"
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{lot_selector}', 6);
        window.__showCalloutBadge('{lot_selector}', '🧮', 'LOTAJE INSTITUCIONAL', '5.00 Lotes Calculados', '1.0% de Riesgo exacto ($1,000 USD) sobre Balance Inicial', 'right');
    }}""")
    await asyncio.sleep(4.0)

    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")

    rem3 = b3["cumulative_end"] - (time.time() - t_start)
    if rem3 > 0:
        await asyncio.sleep(rem3)

    # =========================================================================
    # BLOQUE 4: TESIS TÉCNICA ANTES, CAPTURA Y TRADE ACTIVO (46.10s — 63.16s)
    # =========================================================================
    b4 = blocks["block4_visual_before_active"]
    print(f"\n📸 [Bloque 4/6] {b4['title']} ({b4['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__showLowerThird('📸', '{b4['tag']}', 'Bitácora Visual: Tesis Antes y Captura de Setup');
    }}""")
    await asyncio.sleep(0.5)

    # Escribir tesis en Nota Antes
    await page.evaluate("window.__glideCursorToElement('#inputNotaAntes', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("""() => {
        const el = document.getElementById('inputNotaAntes');
        if (el) {
            el.value = 'Ruptura y retesteo de zona de liquidez institucional en 15M con confirmación en NY.';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(1.2)

    # Inyección de captura ANTES (TradingView)
    with open(CHART_BEFORE, "rb") as f:
        b64_before = base64.b64encode(f.read()).decode("utf-8")
    data_uri_before = f"data:image/png;base64,{b64_before}"

    await page.evaluate(f"""() => {{
        if (typeof currentUploadedImagesAntes !== 'undefined') {{
            currentUploadedImagesAntes.push('{data_uri_before}');
            if (typeof renderImagePreviewsAntes === 'function') renderImagePreviewsAntes();
        }}
    }}""")
    await asyncio.sleep(1.5)

    # Estado: Activa
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

    rem4 = b4["cumulative_end"] - (time.time() - t_start)
    if rem4 > 0:
        await asyncio.sleep(rem4)

    # =========================================================================
    # BLOQUE 5: NAVEGACIÓN VISUAL A REGISTRO DE TRADES Y EDICIÓN FULL TP (63.16s — 90.26s)
    # =========================================================================
    b5 = blocks["block5_post_trade_audit"]
    print(f"\n🎯 [Bloque 5/6] {b5['title']} ({b5['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__showLowerThird('🎯', '{b5['tag']}', 'Navegación: Pestaña Registro de Trades y Edición Full TP');
    }}""")
    await asyncio.sleep(0.5)

    # 1. Navegación visible a la pestaña "Registro de Trades"
    tab_journal = "#tab-btn-journal"
    await page.evaluate(f"window.__glideCursorToElement('{tab_journal}', 600)")
    await asyncio.sleep(0.7)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_journal}');
        if (btn) btn.click();
        if (typeof switchTab === 'function') switchTab('journal');
    }}""")
    await asyncio.sleep(1.5)

    # 2. Resaltar la fila de trade activo y el botón de edición
    row_active = "#journal-table-body tr:first-child"
    btn_edit = '#journal-table-body tr:first-child button[title*="Editar"], #journal-table-body tr:first-child button:has(i.fa-pen)'

    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{row_active}', 6);
        window.__showCalloutBadge('{row_active}', '📋', 'REGISTRO DE TRADES', 'Operación EURUSD en Curso', 'Disponible para auditar aquí o desde la sección Tus Cuentas', 'bottom');
    }}""")
    await asyncio.sleep(4.0)

    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")

    # 3. Clic en el botón de edición
    await page.evaluate(f"(sel) => window.__glideCursorToElement(sel, 500)", btn_edit)
    await asyncio.sleep(0.6)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""(sel) => {{
        const btn = document.querySelector(sel);
        if (btn) btn.click();
        else if (typeof openTradeModal === 'function' && Array.isArray(trades) && trades.length > 0) {{
            openTradeModal(trades[0].id);
        }}
    }}""", btn_edit)
    await asyncio.sleep(1.2)

    # 4. Conmutar Estado a Full TP
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

    # 5. Inyección de captura DESPUÉS (Full TP +3.00%)
    with open(CHART_AFTER, "rb") as f:
        b64_after = base64.b64encode(f.read()).decode("utf-8")
    data_uri_after = f"data:image/png;base64,{b64_after}"

    await page.evaluate(f"""() => {{
        if (typeof currentUploadedImagesDespues !== 'undefined') {{
            currentUploadedImagesDespues.push('{data_uri_after}');
            if (typeof renderImagePreviewsDespues === 'function') renderImagePreviewsDespues();
        }}
        const elNota = document.getElementById('inputNotaDespues');
        if (elNota) {{
            elNota.value = 'Objetivo alcanzado con ratio 1:3.00 exacto. Cierre limpio en New York.';
            elNota.dispatchEvent(new Event('input', {{ bubbles: true }}));
        }}
    }}""")
    await asyncio.sleep(2.0)

    # 6. Guardar auditoría post-trade
    await page.evaluate(f"window.__glideCursorToElement('{btn_submit}', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{btn_submit}');
        if (btn) btn.click();
        else if (typeof saveTrade === 'function') saveTrade(new Event('submit'));
    }}""")
    await asyncio.sleep(1.5)

    rem5 = b5["cumulative_end"] - (time.time() - t_start)
    if rem5 > 0:
        await asyncio.sleep(rem5)

    # =========================================================================
    # BLOQUE 6: IMPACTO EN REGLAS DE PROP FIRM Y BALANCE $103,000 (90.26s — 108.62s)
    # =========================================================================
    b6 = blocks["block6_prop_firm_impact"]
    print(f"\n📈 [Bloque 6/6] {b6['title']} ({b6['duration_seconds']}s)...")

    await page.evaluate(f"""() => {{
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__showLowerThird('📈', '{b6['tag']}', 'Balance $103,000 USD · Target al 37.5% · Drawdown 100% Intacto');
    }}""")
    await asyncio.sleep(0.5)

    # 1. Transición a Dashboard & Métricas para validar curva de capital
    tab_dash = "#tab-btn-dashboard"
    await page.evaluate(f"window.__glideCursorToElement('{tab_dash}', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_dash}');
        if (btn) btn.click();
        if (typeof switchTab === 'function') switchTab('dashboard');
        if (typeof updateMetricsAndCharts === 'function') updateMetricsAndCharts();
        
        // Sincronizar input visual de balance actual
        const balInp = document.getElementById('dashboardBalanceActual');
        if (balInp) balInp.value = '103000';
    }}""")
    await asyncio.sleep(1.2)

    # Resaltar Gráfica y Retorno Total en verde (+3.00%)
    chart_elem = "#equityChart"
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{chart_elem}', 8);
        window.__showCalloutBadge('{chart_elem}', '📈', 'EVOLUCIÓN DE CAPITAL', 'Retorno Total: +3.00%', 'Curva ascendente institucional de $100,000 a $103,000 USD', 'top');
    }}""")
    await asyncio.sleep(4.0)

    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")

    # 2. Clic en pestaña Metas / Goals
    tab_goals = "#tab-btn-goals"
    await page.evaluate(f"window.__glideCursorToElement('{tab_goals}', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_goals}');
        if (btn) btn.click();
        if (typeof switchTab === 'function') switchTab('goals');
        if (typeof renderGoals === 'function') renderGoals();
    }}""")
    await asyncio.sleep(1.2)

    # Resaltar Profit Target al 37.5%
    goal_panel = "#account-goal-panel"
    await page.evaluate(f"""() => {{
        window.__pulseRingAround('{goal_panel}', 8);
        window.__showCalloutBadge('{goal_panel}', '🎯', 'PROFIT TARGET: 37.5%', '+$3,000 de $8,000 USD requeridos', 'Drawdown Máximo 100% intacto ($10,000 USD de colchón)', 'bottom');
    }}""")
    await asyncio.sleep(4.0)

    await page.evaluate("""() => {
        window.__removePulseRing();
        window.__hideCalloutBadge();
    }""")

    # 3. Clic en pestaña Galería para mostrar comparativa lado a lado
    tab_gallery = "#tab-btn-gallery"
    await page.evaluate(f"window.__glideCursorToElement('{tab_gallery}', 450)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate(f"""() => {{
        const btn = document.querySelector('{tab_gallery}');
        if (btn) btn.click();
        if (typeof switchTab === 'function') switchTab('gallery');
        if (typeof renderGalleryCards === 'function') renderGalleryCards();
    }}""")
    await asyncio.sleep(2.0)

    # Mantener toma final hasta completar la duración exacta
    rem_total = duration - (time.time() - t_start)
    if rem_total > 0:
        print(f"   -> Manteniendo toma final ({rem_total:.2f}s restantes)...")
        await asyncio.sleep(rem_total)

    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se encontró WebM para el flujo continuo")
    raw_webm = webms[0]

    # Muxing con la pista de voz continua
    mux_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "0.200",  # Recorte preventivo de primer fotograma
        "-i", raw_webm,
        "-i", cont_audio,
        "-filter_complex", "[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{duration:.3f}",
        scene_mp4
    ]
    subprocess.run(mux_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Toma continua completada: {scene_mp4}")
    return scene_mp4


# -------------------------------------------------------------
# 5. ESCENA 3: OUTRO INSTITUCIONAL (10.32s)
# -------------------------------------------------------------
async def record_outro(p, manifest):
    scene_id = "outro"
    outro_info = manifest.get("outro", {})
    duration = outro_info.get("duration_seconds", 10.32) + 0.5
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")
    audio_path = os.path.join(AUDIO_DIR, "outro.mp3")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 300000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    print(f"\n🎬 [3/3] Filmando Escena Outro Cinemático ({duration:.2f}s)...")
    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

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

    page = await context.new_page()
    try:
        cdp = await context.new_cdp_session(page)
        await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
            "color": {"r": 11, "g": 15, "b": 25, "a": 1}
        })
    except Exception:
        pass

    url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=outro&tutorial=2"
    await page.goto(url, wait_until="domcontentloaded")
    await asyncio.sleep(duration - 1.0)
    try:
        await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
    except Exception:
        pass
    await asyncio.sleep(1.0)

    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se encontró WebM para outro")
    raw_webm = webms[0]

    mux_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "0.150",
        "-i", raw_webm,
        "-i", audio_path,
        "-filter_complex", "[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{duration:.3f}",
        scene_mp4
    ]
    subprocess.run(mux_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Outro completado: {scene_mp4}")
    return scene_mp4


# -------------------------------------------------------------
# 6. FINAL MASTER ASSEMBLY (2 TRANSICIONES SUAVES + BGM DUCKING)
# -------------------------------------------------------------
def assemble_final_video(intro_mp4, app_mp4, outro_mp4, manifest):
    print("\n" + "=" * 70)
    print("🎞️ ENSAMBLANDO VIDEO MAESTRO (ARQUITECTURA MASTER TAKE V6)")
    print("=" * 70)

    intro_dur = manifest.get("intro", {}).get("duration_seconds", 5.40) + 0.8
    app_dur = manifest.get("continuous_duration_seconds", 108.62)
    outro_dur = manifest.get("outro", {}).get("duration_seconds", 10.32) + 0.5
    trans_dur = 0.5

    off1 = intro_dur - trans_dur
    off2 = off1 + app_dur - trans_dur
    total_len = off2 + outro_dur

    has_music = os.path.exists(BG_MUSIC)
    music_idx = 3 if has_music else None

    filter_complex = [
        f"[0:v][1:v]xfade=transition=fade:duration={trans_dur}:offset={off1:.3f}[v01]",
        f"[v01][2:v]xfade=transition=fade:duration={trans_dur}:offset={off2:.3f}[v_master]",
        f"[0:a][1:a]acrossfade=d={trans_dur}:c1=tri:c2=tri[a01]",
        f"[a01][2:a]acrossfade=d={trans_dur}:c1=tri:c2=tri[a_scenes]"
    ]

    if has_music:
        fade_out_start = max(0, total_len - 2.5)
        filter_complex.append(
            f"[{music_idx}:a]volume=0.065,afade=t=out:st={fade_out_start:.2f}:d=2.5[bgm]"
        )
        filter_complex.append(
            f"[a_scenes][bgm]amix=inputs=2:duration=first:dropout_transition=2[a_final]"
        )
        final_audio_map = "[a_final]"
    else:
        final_audio_map = "[a_scenes]"

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", intro_mp4,
        "-i", app_mp4,
        "-i", outro_mp4
    ]
    if has_music:
        cmd.extend(["-i", BG_MUSIC])

    cmd.extend([
        "-filter_complex", ";".join(filter_complex),
        "-map", "[v_master]",
        "-map", final_audio_map,
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "17",
        "-c:a", "aac",
        "-b:a", "192k",
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
    print("=" * 75)
    return FINAL_MP4


# -------------------------------------------------------------
# 7. MAIN PIPELINE
# -------------------------------------------------------------
async def main():
    print("=" * 75)
    print("🚀 PIPELINE DE PRODUCCIÓN AUDIOVISUAL ASTRADE — TUTORIAL #2 (V6)")
    print("   'Registro y Auditoría de Trades con Precisión Quirúrgica'")
    print("=" * 75)

    server = start_http_server()
    manifest = load_manifest()

    async with async_playwright() as p:
        intro_mp4 = await record_intro(p, manifest)
        app_mp4 = await record_app_flow_continuous(p, manifest)
        outro_mp4 = await record_outro(p, manifest)

    assemble_final_video(intro_mp4, app_mp4, outro_mp4, manifest)


if __name__ == "__main__":
    asyncio.run(main())

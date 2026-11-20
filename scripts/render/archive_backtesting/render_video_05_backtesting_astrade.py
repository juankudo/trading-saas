"""
AsTrade Studio Master Render Pipeline — Tutorial #3
"Laboratorio de Backtesting Profesional y Simulación de Estrategias"

Arquitectura de Producción de 3 Escenas Limpias:
1. Escena 1 (Intro Cinemático): intro_outro_motion.html?mode=intro&tutorial=3 (~6.2s)
2. Escena 2 (Toma Continua en App): app.html (~104.5s)
   - Zero-Blur Global: Interfaz 100% nítida, sin desenfoques de fondo.
   - Sincronización fonética estricta con manifest.json (5 bloques):
       * Bloque 1: Cambio a Modo Backtesting desde el selector central.
       * Bloque 2: Creación de Sesión de Backtesting (Estrategia Liquidez NY · EURUSD · $100K).
       * Bloque 3: Registro Ágil de Trade Simulado (NY 09:30 AM, Market Buy, SL 15, TP 45, Full TP).
       * Bloque 4: Curva Histórica Proyectada, Win Rate y Métricas de Robustez.
       * Bloque 5: Aislamiento Total: Conmutación a Cuenta Real demostrando datos 100% intactos.
3. Escena 3 (Outro Institucional): intro_outro_motion.html?mode=outro&tutorial=3 (~12.0s)
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
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch", "video_03")
AUDIO_DIR = os.path.join(SCRATCH_DIR, "audio")
SCENES_DIR = os.path.join(SCRATCH_DIR, "scenes")
OUTPUT_DIR = os.path.join(BASE_DIR, "media", "youtube_tutorials")
FINAL_MP4 = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_03_Backtesting_1080p.mp4")
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")

CHART_BEFORE = os.path.join(BASE_DIR, "media", "video3_assets", "charts", "before_setup_eurusd.png")
CHART_AFTER = os.path.join(BASE_DIR, "media", "video3_assets", "charts", "after_fulltp_eurusd.png")
MANIFEST_PATH = os.path.join(AUDIO_DIR, "manifest.json")
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
        raise FileNotFoundError(f"Manifest no encontrado en: {MANIFEST_PATH}")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# -------------------------------------------------------------
# 3. ESCENA 1: INTRO CINEMÁTICO (6.2s)
# -------------------------------------------------------------
async def record_intro(p, manifest):
    scene_id = "intro_scene"
    audio_path = os.path.join(AUDIO_DIR, "intro.mp3")
    duration = 6.20
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 100000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [1/3] Filmando Escena 1: Intro Cinemático ({duration}s)")
    print("=" * 75)

    browser = await p.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-dev-shm-usage", "--background-color=0b0f19"]
    )
    context = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=raw_dir,
        record_video_size={"width": 1920, "height": 1080}
    )
    page = await context.new_page()

    url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=intro&tutorial=3"
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

    # Mux con audio de Jorge leyendo el título
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
# 4. ESCENA 2: TOMA CONTINUA EN APP.HTML (~104.5s)
# -------------------------------------------------------------
async def record_app_flow_continuous(p, manifest):
    scene_id = "app_flow_continuous"
    cont_audio = os.path.join(AUDIO_DIR, "video_03_continuous_voice.mp3")
    total_voice_dur = manifest["continuous_voice"].get("total_duration", 104.21)
    duration = total_voice_dur + 0.5  # Buffer ligero
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 1000000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [2/3] Filmando Flujo Operativo Continuo en app.html ({duration:.2f}s)")
    print("   -> Zero-Blur Global Standard")
    print("   -> Sincronización Fonética con manifest.json (5 Bloques)")
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

    # Inyección preventiva en localStorage y CSS Zero-Blur
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

        const cleanStyle = document.createElement('style');
        cleanStyle.innerHTML = `
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
            html { font-size: 17.5px !important; }
            .text-xs { font-size: 0.88rem !important; }
            .text-sm { font-size: 1.02rem !important; }
            .text-base { font-size: 1.15rem !important; }
            input, select, button { font-size: 1.02rem !important; }
        `;
        if (document.head) document.head.appendChild(cleanStyle);
        else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(cleanStyle));
    """)

    page = await context.new_page()

    # Pre-cargar cuenta real inicial
    await context.add_init_script("""
        window.__ASTRADE_V3_INIT__ = async function() {
            const realAccount = {
                id: 1731800000000,
                name: "Fondeo 100K Challenge",
                tipo: "prueba",
                balanceInicial: 100000,
                balanceActual: 103000,
                pipsMaxDD: 10,
                pipsTarget: 8,
                plataforma: "MetaTrader 5",
                fechaInicio: "2026-11-18",
                activo: true
            };

            if (typeof dbSet === 'function') {
                await dbSet('trading_journal_real_accounts', [realAccount]);
                await dbSet('trading_journal_sessions', []);
                await dbSet('trading_journal_data', []);
            }

            if (typeof realAccounts !== 'undefined') {
                realAccounts.length = 0;
                realAccounts.push(realAccount);
            }
            if (typeof backtestSessions !== 'undefined') {
                backtestSessions.length = 0;
            }
            if (typeof trades !== 'undefined') {
                trades.length = 0;
            }

            if (typeof setMode === 'function') await setMode('real');
            if (typeof renderGroups === 'function') renderGroups();
        };
    """)

    t_start = time.time()
    await page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded")
    await asyncio.sleep(0.4)

    # Inyectar motor de motion graphics y llamar a __initStudioMotionEngine
    with open(MOTION_ENGINE_JS, "r", encoding="utf-8") as f:
        engine_code = f.read()
    await page.evaluate(engine_code)
    await page.evaluate("window.__initStudioMotionEngine();")

    # Ejecutar inicialización limpia de datos
    await page.evaluate("window.__ASTRADE_V3_INIT__();")
    await asyncio.sleep(0.4)

    blocks = manifest["continuous_voice"]["blocks"]
    b1 = blocks[0]  # 0.0s -> 19.99s (Switch to Backtesting)
    b2 = blocks[1]  # 19.99s -> 42.29s (New Session Modal)
    b3 = blocks[2]  # 42.29s -> 66.51s (Simulated Trade)
    b4 = blocks[3]  # 66.51s -> 87.75s (Metrics & Equity Curve)
    b5 = blocks[4]  # 87.75s -> 104.5s (Total Isolation / Back to Real)

    print(f"🎬 [Master Take] Timeline calibrado:")
    print(f"   B1 (Switch Mode): {b1['start_seconds']}s - {b1['cumulative_end']}s")
    print(f"   B2 (New Session): {b2['start_seconds']}s - {b2['cumulative_end']}s")
    print(f"   B3 (Simulated Trade): {b3['start_seconds']}s - {b3['cumulative_end']}s")
    print(f"   B4 (Metrics Robustness): {b4['start_seconds']}s - {b4['cumulative_end']}s")
    print(f"   B5 (Total Isolation): {b5['start_seconds']}s - {b5['cumulative_end']}s")

    # ---------------------------------------------------------
    # BLOQUE 1: CAMBIO A MODO BACKTESTING (0.0s -> 19.99s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 1: {b1['title']}")
    await page.evaluate("""() => {
        window.__showLowerThird('🧪', 'PASO 1 · MODO BACKTESTING PROFESIONAL', 'Laboratorio de simulación cuantitativa totalmente aislado');
    }""")
    await asyncio.sleep(3.0)

    # Mover cursor al selector central `#btn-mode-backtesting`
    await page.evaluate("window.__glideCursorToElement('#btn-mode-backtesting', 650)")
    await asyncio.sleep(0.8)

    # Pulso esmeralda y clic en Backtesting
    await page.evaluate("window.__pulseRingAround('#btn-mode-backtesting', 6)")
    await asyncio.sleep(0.5)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        window.__removePulseRing();
        const btn = document.getElementById('btn-mode-backtesting');
        if (btn) btn.click();
        if (typeof setMode === 'function') setMode('backtesting');
    }""")
    print("   -> Conmutado a Modo Backtesting")

    # Esperar hasta Bloque 2
    rem1 = b1["cumulative_end"] - (time.time() - t_start)
    if rem1 > 0:
        await asyncio.sleep(rem1)

    # ---------------------------------------------------------
    # BLOQUE 2: CREACIÓN DE SESIÓN DE BACKTESTING (19.99s -> 42.29s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 2: {b2['title']}")
    await page.evaluate("""() => {
        window.__showLowerThird('📊', 'PASO 2 · ESTRUCTURA DE LA SESIÓN', 'Estrategia Liquidez NY · EURUSD · $100K Simulación Fondeo');
    }""")
    await asyncio.sleep(1.0)

    # Mover cursor al botón `#btn-new-session`
    await page.evaluate("window.__glideCursorToElement('#btn-new-session', 600)")
    await asyncio.sleep(0.8)

    # Pulso y clic para abrir modal de nueva sesión
    await page.evaluate("window.__pulseRingAround('#btn-new-session', 6)")
    await asyncio.sleep(0.4)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        window.__removePulseRing();
        const btn = document.getElementById('btn-new-session');
        if (btn) btn.click();
        if (typeof openSessionModal === 'function') openSessionModal();
    }""")
    print("   -> Modal Nueva Sesión abierto")
    await asyncio.sleep(1.0)

    # Rellenar nombre
    await page.evaluate("window.__typeIntoInput('#inputSessionName', 'Estrategia Liquidez NY', 45)")
    await asyncio.sleep(0.8)

    # Seleccionar activo EURUSD
    await page.evaluate("window.__glideCursorToElement('#inputSessionPair', 400)")
    await asyncio.sleep(0.4)
    await page.evaluate("""() => {
        const pairSelect = document.getElementById('inputSessionPair');
        if (pairSelect) {
            if (!Array.from(pairSelect.options).some(o => o.value === 'EURUSD')) {
                pairSelect.innerHTML += '<option value="EURUSD">EURUSD</option>';
            }
            pairSelect.value = 'EURUSD';
            pairSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""")
    await asyncio.sleep(0.8)

    # Seleccionar radio Simulación de Fondeo
    await page.evaluate("""() => {
        const radioFondeo = document.querySelector('input[name="sessionMode"][value="fondeo"]');
        if (radioFondeo) {
            radioFondeo.checked = true;
            radioFondeo.dispatchEvent(new Event('change', { bubbles: true }));
            if (typeof toggleFondeoRules === 'function') toggleFondeoRules();
        }
    }""")
    await asyncio.sleep(1.2)

    # Mover al botón Guardar Sesión
    await page.evaluate("window.__glideCursorToElement('#btn-submit-session', 600)")
    await asyncio.sleep(0.8)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        const form = document.getElementById('sessionForm');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        if (typeof saveSession === 'function') {
            const fakeEvent = { preventDefault: () => {} };
            saveSession(fakeEvent);
        }
    }""")
    print("   -> Sesión de Backtesting guardada")

    rem2 = b2["cumulative_end"] - (time.time() - t_start)
    if rem2 > 0:
        await asyncio.sleep(rem2)

    # ---------------------------------------------------------
    # BLOQUE 3: REGISTRO ÁGIL DE TRADE SIMULADO (42.29s -> 68.88s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 3: {b3['title']}")
    await page.evaluate("""() => {
        window.__showLowerThird('🎯', 'PASO 3 · REGISTRO Y SIZING HISTÓRICO', 'EURUSD · NY 09:30 AM · Market Buy · SL 20 · TP 60 · 5.00 Lotes · Full TP');
    }""")
    await asyncio.sleep(1.0)

    # Seleccionar sesión e ingresar formalmente al dashboard con enterGroup
    await page.evaluate("""() => {
        const startBtn = document.querySelector('button[data-account-action="start"]');
        if (startBtn) startBtn.click();
        if (typeof backtestSessions !== 'undefined' && backtestSessions.length > 0) {
            if (typeof enterGroup === 'function') enterGroup(backtestSessions[0].id);
        }
    }""")
    print("   -> Sesión iniciada con enterGroup() y Dashboard activo")
    await asyncio.sleep(1.2)

    # Mover cursor al botón Nueva Entrada
    await page.evaluate("window.__glideCursorToElement('#btn-new-trade', 600)")
    await asyncio.sleep(0.8)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        const btnNew = document.getElementById('btn-new-trade');
        if (btnNew) btnNew.click();
        if (typeof openTradeModal === 'function') openTradeModal();
    }""")
    print("   -> Modal Nueva Entrada abierto")
    await asyncio.sleep(1.0)

    # Rellenar parámetros del trade simulado
    await page.evaluate("""() => {
        const parInput = document.getElementById('inputPar');
        if (parInput) { parInput.value = 'EURUSD'; parInput.dispatchEvent(new Event('change', { bubbles: true })); }

        const sessInput = document.getElementById('inputSesion');
        if (sessInput) { sessInput.value = 'New York'; sessInput.dispatchEvent(new Event('change', { bubbles: true })); }

        const horaInput = document.getElementById('inputHora');
        if (horaInput) { horaInput.value = '09:30'; horaInput.dispatchEvent(new Event('input', { bubbles: true })); }

        const dirInput = document.getElementById('inputTendencia');
        if (dirInput) { dirInput.value = 'Favor'; dirInput.dispatchEvent(new Event('change', { bubbles: true })); }

        const ordenInput = document.getElementById('inputOrden');
        if (ordenInput) { ordenInput.value = 'Market Buy'; ordenInput.dispatchEvent(new Event('change', { bubbles: true })); }

        const slInput = document.getElementById('inputPipsSL');
        if (slInput) { slInput.value = '20'; slInput.dispatchEvent(new Event('input', { bubbles: true })); }

        const tpInput = document.getElementById('inputPipsTP');
        if (tpInput) { tpInput.value = '60'; tpInput.dispatchEvent(new Event('input', { bubbles: true })); }

        if (typeof calculateRR === 'function') calculateRR();

        const estadoInput = document.getElementById('inputEstado');
        if (estadoInput) { estadoInput.value = 'Full TP'; estadoInput.dispatchEvent(new Event('change', { bubbles: true })); }
    }""")
    await asyncio.sleep(2.5)

    # Mover al botón Guardar Operación
    await page.evaluate("window.__glideCursorToElement('#btn-submit-trade', 600)")
    await asyncio.sleep(0.8)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        const submitBtn = document.getElementById('btn-submit-trade');
        if (submitBtn) submitBtn.click();
        const form = document.getElementById('tradeForm');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        if (typeof saveTrade === 'function') {
            const fakeEvent = { preventDefault: () => {} };
            saveTrade(fakeEvent);
        }
        if (typeof closeTradeModal === 'function') {
            closeTradeModal();
        }
    }""")
    print("   -> Trade simulado guardado exitosamente y modal cerrado")

    rem3 = b3["cumulative_end"] - (time.time() - t_start)
    if rem3 > 0:
        await asyncio.sleep(rem3)

    # ---------------------------------------------------------
    # BLOQUE 4: CURVA HISTÓRICA Y MÉTRICAS (66.51s -> 87.75s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 4: {b4['title']}")
    await page.evaluate("""() => {
        window.__showLowerThird('📈', 'PASO 4 · AUDITORÍA DE ROBUSTEZ MATEMÁTICA', 'Curva ascendente a $103,000 USD · Win Rate 100% · DD 0.0%');
    }""")
    await asyncio.sleep(1.0)

    # Resaltar la curva de equidad
    await page.evaluate("""() => {
        const sel = document.getElementById('equityChart') ? '#equityChart' : 'canvas';
        window.__pulseRingAround(sel, 10);
        window.__glideCursorToElement(sel, 1000);
    }""")
    await asyncio.sleep(4.0)

    # Resaltar métricas cuantitativas
    await page.evaluate("""() => {
        window.__removePulseRing();
        const sel = document.querySelector('.grid-cols-2') ? '.grid-cols-2' : '.grid';
        window.__pulseRingAround(sel, 8);
    }""")
    await asyncio.sleep(4.0)
    await page.evaluate("window.__removePulseRing();")

    rem4 = b4["cumulative_end"] - (time.time() - t_start)
    if rem4 > 0:
        await asyncio.sleep(rem4)

    # ---------------------------------------------------------
    # BLOQUE 5: AISLAMIENTO TOTAL Y SEGURIDAD (87.75s -> 104.5s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 5: {b5['title']}")
    await page.evaluate("""() => {
        window.__showLowerThird('🛡️', 'PASO 5 · AISLAMIENTO Y SEGURIDAD', 'Bases de datos independientes: Cuentas Reales 100% Intactas');
    }""")
    await asyncio.sleep(1.0)

    # Mover cursor de regreso a `#btn-mode-real`
    await page.evaluate("window.__glideCursorToElement('#btn-mode-real', 700)")
    await asyncio.sleep(0.8)

    # Pulso esmeralda y clic en Cuenta Real
    await page.evaluate("window.__pulseRingAround('#btn-mode-real', 6)")
    await asyncio.sleep(0.4)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        window.__removePulseRing();
        const btnReal = document.getElementById('btn-mode-real');
        if (btnReal) btnReal.click();
        if (typeof setMode === 'function') setMode('real');
    }""")
    print("   -> Conmutado de vuelta a Cuenta Real (Aislamiento Verificado)")
    await asyncio.sleep(1.5)

    # Resaltar la tarjeta de cuenta real limpia e intacta
    await page.evaluate("""() => {
        const sel = document.querySelector('#sessions-grid > div') ? '#sessions-grid > div' : '.cursor-pointer';
        window.__pulseRingAround(sel, 8);
        window.__glideCursorToElement(sel, 800);
    }""")

    # Esperar hasta el final de la toma continua
    rem5 = duration - (time.time() - t_start)
    if rem5 > 1.0:
        await asyncio.sleep(rem5 - 1.0)

    # Fade out
    try:
        await page.evaluate("""() => {
            window.__removePulseRing();
            window.__hideLowerThird();
        }""")
    except Exception:
        pass
    await asyncio.sleep(1.0)

    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se encontró WebM para app_flow_continuous")
    raw_webm = webms[0]

    # Mux con audio continuo de Jorge
    mux_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "0.200",
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
# 5. ESCENA 3: OUTRO INSTITUCIONAL (12.0s)
# -------------------------------------------------------------
async def record_outro(p, manifest):
    scene_id = "outro_scene"
    audio_path = os.path.join(AUDIO_DIR, "outro.mp3")
    duration = 12.0
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 100000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [3/3] Filmando Escena 3: Outro Institucional ({duration}s)")
    print("=" * 75)

    browser = await p.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-dev-shm-usage", "--background-color=0b0f19"]
    )
    context = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=raw_dir,
        record_video_size={"width": 1920, "height": 1080}
    )
    page = await context.new_page()

    url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=outro&tutorial=3"
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

    # Mux con audio del outro
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
# 6. ENSAMBLE MAESTRO FFmpeg (Crossfade + Music Ducking)
# -------------------------------------------------------------
def assemble_master_video(intro_mp4, app_mp4, outro_mp4, output_mp4):
    print("\n" + "=" * 75)
    print("🎞️ ENSAMBLE MAESTRO FINAL DE TUTORIAL #3 CON FFMPEG")
    print("   -> Transición Crossfade de 0.5s")
    print("   -> Música atenuada de fondo (Ducking a 0.065)")
    print("=" * 75)

    def get_duration(mp4_path):
        cmd = [FFMPEG_EXE, "-i", mp4_path, "-hide_banner"]
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        for line in p.stderr.splitlines():
            if "Duration:" in line:
                parts = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = parts.split(":")
                return float(h) * 3600 + float(m) * 60 + float(s)
        return 10.0

    d_intro = get_duration(intro_mp4)
    d_app = get_duration(app_mp4)
    d_outro = get_duration(outro_mp4)

    offset1 = d_intro - 0.5
    offset2 = offset1 + d_app - 0.5
    total_expected = offset2 + d_outro

    print(f"   Duraciones: Intro={d_intro:.2f}s, App={d_app:.2f}s, Outro={d_outro:.2f}s")
    print(f"   Offsets de transición: Offset1={offset1:.2f}s, Offset2={offset2:.2f}s")
    print(f"   Duración total ensamblada: ~{total_expected:.2f}s")

    filter_complex = (
        f"[0:v][1:v]xfade=transition=fade:duration=0.5:offset={offset1:.3f}[v01]; "
        f"[v01][2:v]xfade=transition=fade:duration=0.5:offset={offset2:.3f},format=yuv420p[vout]; "
        f"[0:a][1:a]acrossfade=d=0.5[a01]; "
        f"[a01][2:a]acrossfade=d=0.5[voice]; "
        f"[3:a]volume=0.065[bgm]; "
        f"[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]"
    )

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", intro_mp4,
        "-i", app_mp4,
        "-i", outro_mp4,
        "-stream_loop", "-1", "-i", BG_MUSIC,
        "-filter_complex", filter_complex,
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        output_mp4
    ]

    subprocess.run(cmd, check=True)
    sz_mb = os.path.getsize(output_mp4) / (1024 * 1024)
    print("\n" + "=" * 75)
    print(f"🎉 ¡VIDEO MASTER TUTORIAL #3 ENSAMBLADO CON ÉXITO!")
    print(f"📍 Archivo Final: {output_mp4}")
    print(f"📦 Tamaño: {sz_mb:.2f} MB")
    print("=" * 75)


async def main_async():
    server = start_http_server()
    manifest = load_manifest()

    async with async_playwright() as p:
        intro_mp4 = await record_intro(p, manifest)
        app_mp4 = await record_app_flow_continuous(p, manifest)
        outro_mp4 = await record_outro(p, manifest)

    assemble_master_video(intro_mp4, app_mp4, outro_mp4, FINAL_MP4)

def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()

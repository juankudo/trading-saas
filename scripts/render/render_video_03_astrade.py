"""
AsTrade Studio Master Render Pipeline — Tutorial #3
"Control de Drawdown y Reglas de Financiación Prop"

Arquitectura de Producción de 3 Escenas Limpias:
1. Escena 1 (Intro Cinemático): intro_outro_motion.html?mode=intro&tutorial=3 (~5.0s)
2. Escena 2 (Toma Continua en App): app.html (~94.5s)
   - Zero-Blur Global: Interfaz 100% nítida, sin desenfoques de fondo.
   - Continuidad con Tutorial #2: Cuenta "Fondeo 100K Challenge" con balance $103,000 USD (+3.00%).
   - Sincronización fonética estricta con manifest.json (5 bloques):
       * Bloque 1: Peligro del Drawdown y Presentación del Dashboard.
       * Bloque 2: Navegación al Radar de Metas y Balance Efectivo ($103,000 USD).
       * Bloque 3: Auditoría del Colchón de Seguridad y Drawdown Máximo ($10,000 de margen intacto).
       * Bloque 4: Monitoreo de Pérdida Diaria Máxima (5%) y Reglas Institucionales en Semáforo Verde.
       * Bloque 5: Disciplina Matemática y Camino Hacia la Cuenta Fondeada.
3. Escena 3 (Outro Institucional): intro_outro_motion.html?mode=outro&tutorial=3 (~13.0s)
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
FINAL_MP4 = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_03_Drawdown_1080p.mp4")
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")

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
# 3. ESCENA 1: INTRO CINEMÁTICO (~5.0s)
# -------------------------------------------------------------
async def record_intro(p, manifest):
    scene_id = "intro_scene"
    audio_path = os.path.join(AUDIO_DIR, "intro.mp3")
    duration = manifest["intro"].get("duration", 4.90) + 0.3
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 100000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [1/3] Filmando Escena 1: Intro Cinemático ({duration:.2f}s)")
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
    await asyncio.sleep(duration - 0.8)
    try:
        await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
    except Exception:
        pass
    await asyncio.sleep(0.8)

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
        "-shortest",
        scene_mp4
    ]
    subprocess.run(mux_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    shutil.rmtree(raw_dir, ignore_errors=True)
    print(f"✅ Intro completado: {scene_mp4}")
    return scene_mp4


# -------------------------------------------------------------
# 4. ESCENA 2: TOMA CONTINUA EN APP.HTML (~94.5s)
# -------------------------------------------------------------
async def record_app_master_take(p, manifest):
    scene_id = "app_flow_continuous"
    cont_audio = os.path.join(AUDIO_DIR, "video_03_continuous_voice.mp3")
    total_voice_dur = manifest["continuous_voice"].get("total_duration", 94.15)
    duration = total_voice_dur + 0.5  # Buffer ligero
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 100000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [2/3] Filmando Flujo Operativo Continuo en app.html ({duration:.2f}s)")
    print("   -> Zero-Blur Global Standard")
    print("   -> Sincronización Fonética con manifest.json (5 Bloques Drawdown)")
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

    # Pre-cargar cuenta de evaluación de fondeo con $103,000 USD y trade ganado en EURUSD (+3.00%)
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
                activo: true,
                stage: "prueba",
                goal: {
                    prueba: {
                        targetPct: 8,
                        maxDDPct: 10,
                        phases: 2,
                        target2Pct: 5,
                        phase: 1
                    },
                    rules: {
                        maxDailyLossPct: 5,
                        consistencyPct: 30,
                        minTradingDays: 4
                    }
                }
            };

            const tradeNY = {
                id: 1731800100000,
                accountId: 1731800000000,
                fecha: "2026-11-18",
                hora: "09:30",
                par: "EURUSD",
                sesion: "New York",
                tendencia: "Favor",
                orden: "Market Buy",
                pipsSL: 20,
                pipsTP: 60,
                rr: 3.0,
                riesgo: 1.0,
                estado: "Full TP",
                lotaje: 5.0
            };

            if (typeof dbSet === 'function') {
                await dbSet('trading_journal_real_accounts', [realAccount]);
                await dbSet('trading_journal_sessions', []);
                await dbSet('trading_journal_data', [tradeNY]);
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
                trades.push(tradeNY);
            }

            if (typeof setMode === 'function') await setMode('real');
            if (typeof enterGroup === 'function') enterGroup(realAccount.id);
            if (typeof renderAll === 'function') renderAll();
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
    b1 = blocks[0]  # 0.0s -> 21.7s (Drawdown Danger & Continuity)
    b2 = blocks[1]  # 21.7s -> 40.54s (Goals Tab & Effective Balance)
    b3 = blocks[2]  # 40.54s -> 61.45s (Drawdown Cushion & Max DD)
    b4 = blocks[3]  # 61.45s -> 79.6s (Daily Loss & Rules Status)
    b5 = blocks[4]  # 79.6s -> 94.46s (Math Discipline & Path to Funded)

    print(f"🎬 [Master Take] Timeline calibrado (Drawdown & Goals):")
    print(f"   B1 (Drawdown Danger): {b1['start_seconds']}s - {b1['cumulative_end']}s")
    print(f"   B2 (Goals Tab Nav): {b2['start_seconds']}s - {b2['cumulative_end']}s")
    print(f"   B3 (Drawdown Cushion): {b3['start_seconds']}s - {b3['cumulative_end']}s")
    print(f"   B4 (Daily Loss & Rules): {b4['start_seconds']}s - {b4['cumulative_end']}s")
    print(f"   B5 (Math Discipline): {b5['start_seconds']}s - {b5['cumulative_end']}s")

    # ---------------------------------------------------------
    # BLOQUE 1: PELIGRO DEL DRAWDOWN Y CONTINUIDAD (0.0s -> 21.7s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 1: {b1['title']}")
    await page.evaluate("""() => {
        window.__showLowerThird('🛡️', 'PASO 1 · CONTROL DE RIESGO INSTITUCIONAL', 'La causa #1 de reprobación: violaciones de Drawdown');
    }""")
    await asyncio.sleep(2.5)

    # Mover cursor sobre el balance y la curva acumulada
    await page.evaluate("window.__glideCursorToElement('#kpi-balance', 800)")
    await asyncio.sleep(1.0)
    await page.evaluate("window.__pulseRingAround('#kpi-balance', 6)")
    await asyncio.sleep(3.0)

    # Desplazar a la curva de capital ascendente
    await page.evaluate("window.__removePulseRing();")
    await page.evaluate("window.__glideCursorToElement('#equityChart', 900)")
    await asyncio.sleep(1.0)
    await page.evaluate("window.__pulseRingAround('#equityChart', 6)")

    # Esperar hasta Bloque 2
    rem1 = b1["cumulative_end"] - (time.time() - t_start)
    if rem1 > 0:
        await asyncio.sleep(rem1)

    # ---------------------------------------------------------
    # BLOQUE 2: RADAR DE METAS Y BALANCE EFECTIVO (21.7s -> 40.54s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 2: {b2['title']}")
    await page.evaluate("window.__removePulseRing();")
    await page.evaluate("""() => {
        window.__showLowerThird('🎯', 'PASO 2 · RADAR DE METAS Y PROGRESO', 'Radar de Fondeo · Balance $103,000 USD · Target Fase 1: 37.5%');
    }""")
    await asyncio.sleep(1.0)

    # Mover cursor al botón de Metas en la barra de navegación (#tab-btn-goals)
    await page.evaluate("window.__glideCursorToElement('#tab-btn-goals', 700)")
    await asyncio.sleep(0.8)

    # Pulso y clic para cambiar a pestaña Metas
    await page.evaluate("window.__pulseRingAround('#tab-btn-goals', 6)")
    await asyncio.sleep(0.4)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.2)
    await page.evaluate("""() => {
        window.__removePulseRing();
        const btnGoals = document.getElementById('tab-btn-goals');
        if (btnGoals) btnGoals.click();
        if (typeof switchTab === 'function') switchTab('goals');
    }""")
    print("   -> Pestaña Metas activa y panel renderizado")
    await asyncio.sleep(1.2)

    # Resaltar la tarjeta de Balance Efectivo y Objetivo de Beneficio
    await page.evaluate("""() => {
        const goalPanel = document.getElementById('account-goal-panel');
        if (goalPanel) {
            const firstCard = goalPanel.querySelector('.grid > div:nth-child(1)');
            if (firstCard) window.__pulseRingAround(firstCard, 8);
        }
    }""")
    await asyncio.sleep(3.5)

    # Desplazar el cursor hacia la tarjeta de Objetivo de Beneficio (Fase 1: 37.5%)
    await page.evaluate("""() => {
        window.__removePulseRing();
        const goalPanel = document.getElementById('account-goal-panel');
        if (goalPanel) {
            const targetCard = goalPanel.querySelector('.grid > div:nth-child(2)');
            if (targetCard) {
                window.__pulseRingAround(targetCard, 8);
                window.__glideCursorToElement(targetCard, 800);
            }
        }
    }""")

    rem2 = b2["cumulative_end"] - (time.time() - t_start)
    if rem2 > 0:
        await asyncio.sleep(rem2)

    # ---------------------------------------------------------
    # BLOQUE 3: AUDITORÍA DEL COLCHÓN DE SEGURIDAD (40.54s -> 61.45s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 3: {b3['title']}")
    await page.evaluate("window.__removePulseRing();")
    await page.evaluate("""() => {
        window.__showLowerThird('📊', 'PASO 3 · COLCHÓN DE SEGURIDAD RESTANTE', 'Drawdown consumido: $0 · Colchón restante: $10,000 (10% límite)');
    }""")
    await asyncio.sleep(1.0)

    # Mover cursor a la tarjeta de Drawdown Máximo (#account-goal-panel .grid > div:nth-child(3))
    await page.evaluate("""() => {
        const goalPanel = document.getElementById('account-goal-panel');
        if (goalPanel) {
            const ddCard = goalPanel.querySelector('.grid > div:nth-child(3)');
            if (ddCard) {
                window.__glideCursorToElement(ddCard, 750);
                window.__pulseRingAround(ddCard, 10);
            }
        }
    }""")
    print("   -> Tarjeta de Drawdown Máximo y Colchón de Seguridad resaltada")
    await asyncio.sleep(5.0)

    # Inspeccionar con micro-movimiento el texto del colchón restante
    await page.evaluate("""() => {
        const goalPanel = document.getElementById('account-goal-panel');
        if (goalPanel) {
            const ddCard = goalPanel.querySelector('.grid > div:nth-child(3)');
            if (ddCard) {
                const subText = ddCard.querySelector('p.text-gray-500') || ddCard;
                window.__glideCursorToElement(subText, 500);
            }
        }
    }""")

    rem3 = b3["cumulative_end"] - (time.time() - t_start)
    if rem3 > 0:
        await asyncio.sleep(rem3)

    # ---------------------------------------------------------
    # BLOQUE 4: LÍMITE DE PÉRDIDA DIARIA Y REGLAS (61.45s -> 79.6s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 4: {b4['title']}")
    await page.evaluate("window.__removePulseRing();")
    await page.evaluate("""() => {
        window.__showLowerThird('⚡', 'PASO 4 · PÉRDIDA DIARIA Y PROTECCIÓN', 'Pérdida diaria máx: 5% · Días operados: 1/4 · Semáforo Verde Seguro');
    }""")
    await asyncio.sleep(1.0)

    # Mover cursor a la sección de reglas opcionales e institucionales
    await page.evaluate("""() => {
        const rulesWrap = document.querySelector('#account-goal-panel .border-t') || document.querySelector('#account-goal-panel');
        if (rulesWrap) {
            window.__glideCursorToElement(rulesWrap, 800);
            window.__pulseRingAround(rulesWrap, 8);
        }
    }""")
    print("   -> Reglas de protección y semáforo verde auditados")
    await asyncio.sleep(4.0)

    # Micro-enfoque en el chip de pérdida diaria
    await page.evaluate("""() => {
        const chip = document.querySelector('[title*="diaria"]') || document.querySelector('#account-goal-panel .border-t');
        if (chip) window.__glideCursorToElement(chip, 600);
    }""")

    rem4 = b4["cumulative_end"] - (time.time() - t_start)
    if rem4 > 0:
        await asyncio.sleep(rem4)

    # ---------------------------------------------------------
    # BLOQUE 5: DISCIPLINA MATEMÁTICA Y META (79.6s -> 94.46s)
    # ---------------------------------------------------------
    print(f"\n▶️ Ejecutando Bloque 5: {b5['title']}")
    await page.evaluate("window.__removePulseRing();")
    await page.evaluate("""() => {
        window.__showLowerThird('🏆', 'PASO 5 · DISCIPLINA HACIA LA META', 'Certeza matemática sin estrés · Camino claro hacia la Cuenta Fondeada');
    }""")
    await asyncio.sleep(1.0)

    # Enfoque final en el progreso de la Fase 1
    await page.evaluate("""() => {
        const targetBar = document.querySelector('#account-goal-panel .grid > div:nth-child(2)');
        if (targetBar) {
            window.__pulseRingAround(targetBar, 8);
            window.__glideCursorToElement(targetBar, 750);
        }
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
        "-ss", "0.150",
        "-i", raw_webm,
        "-i", cont_audio,
        "-filter_complex", "[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        scene_mp4
    ]
    subprocess.run(mux_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    shutil.rmtree(raw_dir, ignore_errors=True)
    print(f"✅ Toma continua completada: {scene_mp4}")
    return scene_mp4


# -------------------------------------------------------------
# 5. ESCENA 3: OUTRO INSTITUCIONAL (~13.0s)
# -------------------------------------------------------------
async def record_outro(p, manifest):
    scene_id = "outro_scene"
    audio_path = os.path.join(AUDIO_DIR, "outro.mp3")
    duration = manifest["outro"].get("duration", 13.06) + 0.3
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 100000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{scene_id}")
    shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    print("\n" + "=" * 75)
    print(f"🎬 [3/3] Filmando Escena 3: Outro Institucional ({duration:.2f}s)")
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
    await asyncio.sleep(duration - 0.8)
    try:
        await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
    except Exception:
        pass
    await asyncio.sleep(0.8)

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
        "-shortest",
        scene_mp4
    ]
    subprocess.run(mux_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    shutil.rmtree(raw_dir, ignore_errors=True)
    print(f"✅ Outro completado: {scene_mp4}")
    return scene_mp4


# -------------------------------------------------------------
# 6. ENSAMBLE MAESTRO CON FFMPEG (Crossfade 0.5s + Ducking Music)
# -------------------------------------------------------------
def assemble_master_video(intro_mp4, app_mp4, outro_mp4, manifest):
    print("\n" + "=" * 75)
    print("🎞️ ENSAMBLE MAESTRO FINAL DE TUTORIAL #3 CON FFMPEG")
    print("   -> Transición Crossfade de 0.5s")
    print("   -> Música atenuada de fondo (Ducking a 0.065)")
    print("=" * 75)

    def get_duration(fpath):
        cmd = [FFMPEG_EXE, "-i", fpath, "-hide_banner"]
        res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        for line in res.stderr.splitlines():
            if "Duration:" in line:
                part = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = part.split(":")
                return float(h) * 3600 + float(m) * 60 + float(s)
        return 0.0

    d_intro = get_duration(intro_mp4)
    d_app = get_duration(app_mp4)
    d_outro = get_duration(outro_mp4)

    offset1 = max(0.1, d_intro - 0.50)
    offset2 = max(0.1, offset1 + d_app - 0.50)
    total_dur = offset2 + d_outro

    print(f"   Duraciones: Intro={d_intro:.2f}s, App={d_app:.2f}s, Outro={d_outro:.2f}s")
    print(f"   Offsets de transición: Offset1={offset1:.2f}s, Offset2={offset2:.2f}s")
    print(f"   Duración total ensamblada: ~{total_dur:.2f}s")

    filter_complex = (
        f"[0:v][1:v]xfade=transition=fade:duration=0.50:offset={offset1:.2f}[v01];"
        f"[v01][2:v]xfade=transition=fade:duration=0.50:offset={offset2:.2f},format=yuv420p[v_final];"
        f"[0:a][1:a]acrossfade=d=0.50:c1=tri:c2=tri[a01];"
        f"[a01][2:a]acrossfade=d=0.50:c1=tri:c2=tri[a_voice];"
        f"[3:a]volume=0.065,atrim=0:{total_dur:.2f},afade=t=out:st={total_dur - 2.5:.2f}:d=2.5[a_bg];"
        f"[a_voice][a_bg]amix=inputs=2:duration=first:dropout_transition=2[a_final]"
    )

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", intro_mp4,
        "-i", app_mp4,
        "-i", outro_mp4,
        "-i", BG_MUSIC,
        "-filter_complex", filter_complex,
        "-map", "[v_final]",
        "-map", "[a_final]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        FINAL_MP4
    ]

    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    size_mb = os.path.getsize(FINAL_MP4) / (1024 * 1024)
    print("\n" + "=" * 75)
    print("🎉 ¡VIDEO MASTER TUTORIAL #3 ENSAMBLADO CON ÉXITO!")
    print(f"📍 Archivo Final: {FINAL_MP4}")
    print(f"📦 Tamaño: {size_mb:.2f} MB")
    print("=" * 75)
    return FINAL_MP4


# -------------------------------------------------------------
# 7. MAIN ORCHESTRATOR
# -------------------------------------------------------------
async def main():
    print("=" * 75)
    print("🎬 ASTRADE STUDIO — PIPELINE MAESTRO DE PRODUCCIÓN (TUTORIAL #3)")
    print("   Tema: Control de Drawdown y Reglas de Financiación Prop")
    print("=" * 75)

    server = start_http_server()
    manifest = load_manifest()

    async with async_playwright() as p:
        intro_mp4 = await record_intro(p, manifest)
        app_mp4 = await record_app_master_take(p, manifest)
        outro_mp4 = await record_outro(p, manifest)

    assemble_master_video(intro_mp4, app_mp4, outro_mp4, manifest)


if __name__ == "__main__":
    asyncio.run(main())

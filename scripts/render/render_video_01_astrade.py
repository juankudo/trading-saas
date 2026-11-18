"""
AsTrade Studio Master Render Pipeline — Tutorial #1 (V5)
Master Take Edition: Single Seamless Continuous Recording for app.html.
Features:
- Zero White Flashes: Chromium background color flags, CDP override, and pre-roll trimming.
- Continuous Take (88.75s): The browser session NEVER reloads or resets between blocks.
  Form opens in live motion, rules unfold dynamically, inputs are filled, submit closes the modal,
  and the created card is highlighted directly in the grid.
- Pixel-Perfect Motion Engine: 100% native 1920x1080 coordinates (zero CSS zoom drift),
  smart boundary clamping, and anti-collision against the Lower-Third.
- Animated Intro (9.65s) and Outro (6.38s) with official domain astradehub.com.
- Smooth 2-transition FFmpeg assembly with music ducking.
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
SCRATCH_DIR = os.path.join(BASE_DIR, "scratch", "video_01_v3")
AUDIO_DIR = os.path.join(SCRATCH_DIR, "audio")
SCENES_DIR = os.path.join(SCRATCH_DIR, "scenes")
OUTPUT_DIR = os.path.join(BASE_DIR, "media", "youtube_tutorials")
FINAL_MP4 = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_01_Onboarding_1080p.mp4")
FINAL_MP4_ALIAS = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_01_Cuentas_1080p.mp4")
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")

MOTION_ENGINE_JS = os.path.join(BASE_DIR, "scripts", "render", "studio_motion_engine.js")

PORT = 8089
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

os.makedirs(SCENES_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. QUIET HTTP SERVER
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
    except Exception as e:
        print(f"[HTTP] Servidor en puerto {PORT} ya activo o disponible.")
        return None

# -------------------------------------------------------------
# 2. AUDIO ASSETS VERIFICATION & CONCATENATION
# -------------------------------------------------------------
def prepare_continuous_audio():
    """
    Ensures that app_flow_continuous.mp3 exists by concatenating
    the 4 modular audio blocks seamlessly.
    """
    cont_audio = os.path.join(AUDIO_DIR, "app_flow_continuous.mp3")
    b1 = os.path.join(AUDIO_DIR, "block1_accounts_panel.mp3")
    b2 = os.path.join(AUDIO_DIR, "block2_account_types.mp3")
    b3 = os.path.join(AUDIO_DIR, "block3_balances_rules.mp3")
    b4 = os.path.join(AUDIO_DIR, "block4_created_card.mp3")

    for f in [b1, b2, b3, b4]:
        if not os.path.exists(f):
            raise FileNotFoundError(f"Falta archivo de audio modular: {f}")

    if not os.path.exists(cont_audio) or os.path.getsize(cont_audio) < 100000:
        print("🎙️ Concatenando audios modulares para la Toma Maestra Continua (88.75s)...")
        cmd = [
            FFMPEG_EXE, "-y",
            "-i", b1, "-i", b2, "-i", b3, "-i", b4,
            "-filter_complex", "[0:a][1:a][2:a][3:a]concat=n=4:v=0:a=1[a]",
            "-map", "[a]",
            "-b:a", "192k",
            cont_audio
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            raise RuntimeError(f"Error al concatenar audios: {res.stderr}")
        print(f"✅ Audio continuo generado: {cont_audio} ({os.path.getsize(cont_audio)/(1024*1024):.2f} MB)")
    return cont_audio

# -------------------------------------------------------------
# 3. SCENE 1: ANIMATED INTRO (9.65s)
# -------------------------------------------------------------
async def record_intro(p):
    scene_id = "intro"
    duration = 9.65
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

    url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=intro"
    await page.goto(url, wait_until="domcontentloaded")
    await asyncio.sleep(duration - 1.2)
    try:
        await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
    except Exception:
        pass
    await asyncio.sleep(1.2)

    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se encontró WebM para intro")
    raw_webm = webms[0]

    # Mux with audio and pre-roll trim (cut first 0.15s to discard any blank frame)
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
# 4. SCENE 2: MASTER CONTINUOUS TAKE IN APP.HTML (88.75s)
# -------------------------------------------------------------
async def record_app_flow_continuous(p, cont_audio_path):
    scene_id = "app_flow_continuous"
    duration = 88.75
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 1000000:
        print(f"⏩ Checkpoint activo para {scene_id}. Saltando grabación...")
        return scene_mp4

    print(f"\n🎬 [2/3] Filmando Toma Maestra Continua en app.html ({duration:.2f}s)...")
    print("   -> 1 Sola Sesión de Chromium Sin Recargas ni Pantallas en Blanco")

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

    # Inyección preventiva: sesión activa, cero tours y tipografía institucional limpia SIN CSS ZOOM
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
            #sessionModal {
                backdrop-filter: none !important;
                background-color: rgba(5, 8, 18, 0.5) !important;
                align-items: flex-start !important;
                padding-top: 50px !important;
            }
            #sessionModal > div {
                min-height: 720px !important;
                transition: none !important;
            }
            /* Tipografía institucional nítida para YouTube 1080p sin alterar coordenadas (Cero Zoom) */
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
    await asyncio.sleep(0.5)

    # Inyectar Studio Motion Engine
    with open(MOTION_ENGINE_JS, "r", encoding="utf-8") as f:
        engine_code = f.read()
    await page.evaluate(engine_code)
    await page.evaluate("window.__initStudioMotionEngine()")

    t_start = time.time()

    # -------------------------------------------------------------
    # PARTE 1: PANEL DE CUENTAS & BOTÓN NUEVA CUENTA (0.00s - 12.17s)
    # -------------------------------------------------------------
    print("   -> [Parte 1/4] Panel Tus Cuentas y Apertura de Modal...")
    await page.evaluate("""
        window.__showLowerThird('⚡', 'PASO 1: GESTIÓN DE CUENTAS', 'Panel Tus Cuentas: Centro de Mando de Capital');
    """)
    # Vista general del panel mientras Jorge habla de "Tus Cuentas" (0.0s - 4.2s)
    await asyncio.sleep(4.2)

    # Cuando Jorge dice "Para comenzar, hacemos clic en el botón Nueva Cuenta..." (4.2s - 8.5s)
    btn_selector = "#btn-new-session"
    await page.evaluate(f"""
        window.__drawAnimatedArrow({{ offsetX: 220, offsetY: 70 }}, '{btn_selector}', -0.25, 650);
        window.__pulseRingAround('{btn_selector}', 6);
        window.__showCalloutBadge('{btn_selector}', '⚡', 'GESTIÓN', 'Crear Nueva Cuenta', 'Gestor institucional de cuentas', 'bottom');
    """)
    await asyncio.sleep(3.2)

    await page.evaluate("""
        window.__clearMotionArrows();
        window.__hideCalloutBadge();
        window.__removePulseRing();
    """)
    await page.evaluate(f"window.__glideCursorToElement('{btn_selector}', 500)")
    await asyncio.sleep(0.6)

    # Click ripple y abrir modal
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.3)
    await page.evaluate(f"""
        const btn = document.querySelector('{btn_selector}');
        if (btn) btn.click();
        else if (typeof openSessionModal === 'function') openSessionModal();
    """)
    try:
        await page.wait_for_selector("#sessionModal:not(.hidden)", state="visible", timeout=2500)
    except Exception:
        await page.evaluate("if (typeof openSessionModal === 'function') openSessionModal();")
    
    # Mantener hasta el segundo 12.17
    rem1 = 12.17 - (time.time() - t_start)
    if rem1 > 0:
        await asyncio.sleep(rem1)

    # -------------------------------------------------------------
    # PARTE 2: MODALIDADES Y TIPOS DE CUENTA (12.17s - 30.58s)
    # MODAL PERMANECE ABIERTO DE FORMA CONTINUA
    # -------------------------------------------------------------
    print("   -> [Parte 2/4] Selector de Modalidades (Real, Challenge, Fondeada, Instant)...")
    await page.evaluate("""
        window.__showLowerThird('📋', 'PASO 2: MODALIDADES', 'Cuentas Reales, Challenges, Fondeadas e Instant');
    """)
    stage_sel = "#inputAccountStage"
    await page.evaluate(f"""
        window.__glideCursorToElement('{stage_sel}', 600);
        window.__pulseRingAround('{stage_sel}', 6);
        window.__showCalloutBadge('{stage_sel}', '📋', 'MODALIDAD', 'Tipos de Cuenta Soportados', 'Real, Challenge, Fondeada e Instant', 'right');
    """)
    await asyncio.sleep(4.0)

    # 4.0s: Jorge menciona "Cuentas Reales con capital propio"
    await page.evaluate("""
        window.__removePulseRing();
        window.__hideCalloutBadge();
        const el = document.querySelector('#inputAccountStage');
        if (el) {
            el.value = 'real';
            if (typeof toggleAccountStageFields === 'function') toggleAccountStageFields();
        }
    """)
    await asyncio.sleep(0.2)  # Asentamiento DOM
    await page.evaluate(f"""
        window.__pulseRingAround('{stage_sel}', 6);
        window.__showCalloutBadge('{stage_sel}', '💼', 'CAPITAL PROPIO', 'Cuenta Real', 'Auditoría de tu capital personal', 'right');
    """)
    # Jorge continúa explicando fondeadas, challenges e instant hasta ~15.5s
    await asyncio.sleep(7.5)

    # 15.5s: Jorge dice "Para este ejemplo, seleccionamos Fase de prueba"
    await page.evaluate("""
        window.__removePulseRing();
        window.__hideCalloutBadge();
        const el = document.querySelector('#inputAccountStage');
        if (el) {
            el.value = 'prueba';
            if (typeof toggleAccountStageFields === 'function') toggleAccountStageFields();
        }
    """)
    await asyncio.sleep(0.2)  # Asentamiento DOM
    await page.evaluate(f"""
        window.__pulseRingAround('{stage_sel}', 6);
        window.__showCalloutBadge('{stage_sel}', '🎯', 'SELECCIÓN: FASE DE PRUEBA', 'Evaluación / Challenge', 'Auditoría estricta de metas y límites de pérdida', 'right');
    """)
    await asyncio.sleep(2.8)

    await page.evaluate("""
        window.__removePulseRing();
        window.__hideCalloutBadge();
    """)

    rem2 = 30.58 - (time.time() - t_start)
    if rem2 > 0:
        await asyncio.sleep(rem2)

    # -------------------------------------------------------------
    # PARTE 3: BALANCES & REGLAS (30.58s - 67.32s)
    # MODAL PERMANECE ABIERTO CON CHALLENGE SELECCIONADO
    # -------------------------------------------------------------
    print("   -> [Parte 3/4] Balance Inicial vs Saldo Actual & Reglas de Fondeo...")
    await page.evaluate("""
        window.__showLowerThird('💰', 'PASO 3: BALANCES & REGLAS', 'Balance Inicial $100K vs Saldo Actual & Reglas');
    """)
    # 1. Escribir nombre: 'Fondeo 100K FTMO' (0.0s - 4.5s)
    await page.evaluate("window.__glideCursorToElement('#inputSessionName', 450)")
    await asyncio.sleep(0.4)
    await page.evaluate("window.__typeIntoInput('#inputSessionName', 'Fondeo 100K FTMO', 40)")
    await asyncio.sleep(0.5)

    # 2. Balance Inicial: $100,000 USD (4.5s - 11.5s)
    bal_el = "#inputSessionBalance"
    await page.evaluate(f"""
        window.__glideCursorToElement('{bal_el}', 450);
        window.__pulseRingAround('{bal_el}', 6);
        window.__showCalloutBadge('{bal_el}', '💰', 'CAPITAL AUDITADO', 'Balance Inicial: $100,000 USD', 'Base estricta para el cálculo de riesgo % por trade', 'right');
    """)
    await asyncio.sleep(6.5)

    # 3. Balance Actual Opcional (11.5s - 22.5s)
    bal_act_el = "#inputSessionBalanceActual"
    await page.evaluate(f"""
        window.__removePulseRing();
        window.__glideCursorToElement('{bal_act_el}', 450);
        window.__pulseRingAround('{bal_act_el}', 6);
        window.__showCalloutBadge('{bal_act_el}', '📊', 'BALANCE ACTUAL (OPCIONAL)', 'Saldo de Corte / Cierre', 'Vacío si es nueva. O tu saldo actual si venías operando.', 'right');
    """)
    await asyncio.sleep(10.5)

    # 4. Profit Target: 8% (22.5s - 27.5s)
    target_el = "#inputAccountGoalTargetPct"
    await page.evaluate(f"""
        window.__removePulseRing();
        window.__glideCursorToElement('{target_el}', 450);
        window.__pulseRingAround('{target_el}', 6);
        const tInput = document.querySelector('{target_el}');
        if (tInput) tInput.value = '8';
        window.__showCalloutBadge('{target_el}', '🎯', 'OBJETIVO', 'Profit Target: 8%', 'Meta institucional de $8,000 USD', 'right');
    """)
    await asyncio.sleep(4.8)

    # 5. Drawdown Máximo: 10% (27.5s - 32.5s)
    dd_el = "#inputAccountGoalMaxDD"
    await page.evaluate(f"""
        window.__removePulseRing();
        window.__glideCursorToElement('{dd_el}', 450);
        window.__pulseRingAround('{dd_el}', 6);
        const dInput = document.querySelector('{dd_el}');
        if (dInput) dInput.value = '10';
        window.__showCalloutBadge('{dd_el}', '🛡️', 'LÍMITES', 'Drawdown Máximo: 10%', 'Protección de capital estricta ($10,000 USD)', 'right');
    """)
    await asyncio.sleep(4.8)

    # 6. Click en "Crear" / Submit (32.5s - 36.74s)
    btn_submit = "#btn-submit-session"
    await page.evaluate(f"""
        window.__removePulseRing();
        window.__hideCalloutBadge();
        window.__glideCursorToElement('{btn_submit}', 500);
        window.__pulseRingAround('{btn_submit}', 6);
    """)
    await asyncio.sleep(1.0)
    await page.evaluate("window.__clickRipple()")
    await asyncio.sleep(0.3)
    await page.evaluate(f"""
        const btn = document.querySelector('{btn_submit}');
        if (btn) btn.click();
        else if (typeof saveSession === 'function') saveSession(new Event('submit'));
    """)
    await asyncio.sleep(0.5)
    await page.evaluate("""
        window.__removePulseRing();
        if (typeof closeSessionModal === 'function') closeSessionModal();
        window.__showLowerThird('✅', 'CUENTA ACTIVADA', 'Fondeo 100K FTMO creada con éxito');
    """)

    rem3 = 67.32 - (time.time() - t_start)
    if rem3 > 0:
        await asyncio.sleep(rem3)

    # -------------------------------------------------------------
    # PARTE 4: TARJETA INSTITUCIONAL EN EL GRID (67.32s - 88.75s)
    # MODAL YA ESTÁ CERRADO Y LA TARJETA YA ESTÁ EN EL GRID
    # -------------------------------------------------------------
    print("   -> [Parte 4/4] Tarjeta de Cuenta Creada en el Grid...")
    await page.evaluate("""
        if (typeof realAccounts !== 'undefined' && realAccounts.length === 0) {
            realAccounts.push({
                id: 1700000000001,
                name: "Fondeo 100K FTMO",
                balance: 100000,
                balanceActual: null,
                date: new Date().toLocaleDateString('es-ES'),
                stage: "prueba",
                goal: {
                    stage: "prueba",
                    targetPct: 8,
                    maxDDPct: 10,
                    dailyDDPct: 5
                },
                mt5Login: "",
                withdrawals: []
            });
            if (typeof renderGroups === 'function') renderGroups();
        }
        window.__showLowerThird('🗂️', 'PASO 4: CUENTA HABILITADA', 'Tarjeta Institucional Creada y Lista en el Grid');
    """)
    await asyncio.sleep(1.0)

    first_card = "#sessions-grid > div:first-child"
    await page.evaluate(f"""
        window.__drawAnimatedArrow({{ offsetX: 220, offsetY: 70 }}, '{first_card}', -0.25, 650);
        window.__pulseRingAround('{first_card}', 8);
        window.__showCalloutBadge('{first_card}', '⚡', 'CUENTA ACTIVA', 'Fondeo 100K FTMO', 'Saldo $100,000 USD | Target 8% | Max DD 10%', 'right');
    """)
    await asyncio.sleep(4.0)

    # Desplegar Menú de Tres Puntos (Editar y Borrar) (71.32s - 78.0s)
    menu_toggle = '#sessions-grid > div:first-child [data-account-action="menu-toggle"]'
    await page.evaluate(f"""
        window.__clearMotionArrows();
        window.__hideCalloutBadge();
        window.__removePulseRing();
        window.__glideCursorToElement('{menu_toggle}', 500);
    """)
    await asyncio.sleep(0.6)
    await page.evaluate("window.__clickRipple()")
    await page.evaluate(f"""
        const btn = document.querySelector('{menu_toggle}');
        if (btn) btn.click();
    """)
    await asyncio.sleep(0.4)

    # Resaltar "Editar"
    edit_btn = '#sessions-grid > div:first-child [data-account-action="edit"]'
    await page.evaluate(f"""
        window.__pulseRingAround('{edit_btn}', 4);
        window.__showCalloutBadge('{edit_btn}', '✏️', 'CONFIGURACIÓN', 'Editar Cuenta', 'Modifica saldo, nombre o reglas de evaluación', 'right');
    """)
    await asyncio.sleep(2.4)

    # Resaltar "Borrar"
    del_btn = '#sessions-grid > div:first-child [data-account-action="delete"]'
    await page.evaluate(f"""
        window.__removePulseRing();
        window.__pulseRingAround('{del_btn}', 4);
        window.__showCalloutBadge('{del_btn}', '🗑️', 'GESTIÓN', 'Borrar Cuenta', 'Elimina de forma segura la cuenta y sus datos', 'right');
    """)
    await asyncio.sleep(2.2)

    # Cerrar menú y volver a los botones de acción rápida
    await page.evaluate("""
        window.__removePulseRing();
        window.__hideCalloutBadge();
        document.body.click();
    """)
    await asyncio.sleep(0.4)

    quick_btn = '#sessions-grid > div:first-child [data-account-action="quick"]'
    await page.evaluate(f"""
        window.__glideCursorToElement('{quick_btn}', 500);
        window.__pulseRingAround('{quick_btn}', 4);
    """)
    await asyncio.sleep(1.8)

    # Teaser Tutorial #2
    await page.evaluate(f"""
        window.__removePulseRing();
        window.__showCalloutBadge('{first_card}', '🚀', 'PRÓXIMO TUTORIAL', 'Registro y Auditoría de Trades', 'Análisis técnico y capturas antes y después', 'right');
    """)
    await asyncio.sleep(4.0)

    # Completar duración total
    rem4 = duration - (time.time() - t_start)
    if rem4 > 0:
        print(f"   -> Manteniendo toma final ({rem4:.2f}s restantes)...")
        await asyncio.sleep(rem4)

    await page.close()
    await context.close()
    await browser.close()

    webms = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webms:
        raise RuntimeError("No se encontró WebM para app_flow_continuous")
    raw_webm = webms[0]

    print("⚙️ Muxeando video continuo con audio concatenado...")
    mux_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "0.200",
        "-i", raw_webm,
        "-i", cont_audio_path,
        "-filter_complex", "[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{duration:.3f}",
        scene_mp4
    ]
    subprocess.run(mux_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Toma continua completada: {scene_mp4} ({os.path.getsize(scene_mp4)/(1024*1024):.2f} MB)")
    return scene_mp4

# -------------------------------------------------------------
# 5. SCENE 3: ANIMATED OUTRO (6.38s)
# -------------------------------------------------------------
async def record_outro(p):
    scene_id = "outro"
    duration = 6.38
    scene_mp4 = os.path.join(SCENES_DIR, f"{scene_id}.mp4")
    audio_path = os.path.join(AUDIO_DIR, "outro.mp3")

    if not "--force" in sys.argv and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 200000:
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

    url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=outro"
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
# 6. FINAL MASTER ASSEMBLY (2 TRANSITIONS ONLY)
# -------------------------------------------------------------
def assemble_final_video(intro_mp4, app_mp4, outro_mp4):
    print("\n" + "=" * 70)
    print("🎞️ ENSAMBLANDO VIDEO MAESTRO (ARQUITECTURA MASTER TAKE V5)")
    print("=" * 70)

    scenes = [intro_mp4, app_mp4, outro_mp4]
    durations = [9.65, 88.75, 6.38]
    trans_dur = 0.5  # 0.5s smooth cross-dissolve

    # Offset 1: intro -> app (9.65 - 0.5 = 9.15s)
    off1 = durations[0] - trans_dur
    # Offset 2: app -> outro (9.15 + 88.75 - 0.5 = 97.40s)
    off2 = off1 + durations[1] - trans_dur

    total_len = off2 + durations[2]

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", intro_mp4,
        "-i", app_mp4,
        "-i", outro_mp4
    ]

    has_music = os.path.exists(BG_MUSIC)
    if has_music:
        cmd.extend(["-i", BG_MUSIC])
        music_idx = 3
    else:
        music_idx = None

    filter_complex = [
        f"[0:v][1:v]xfade=transition=fade:duration={trans_dur}:offset={off1:.3f}[v01]",
        f"[v01][2:v]xfade=transition=fade:duration={trans_dur}:offset={off2:.3f}[v_master]",
        f"[0:a][1:a]acrossfade=d={trans_dur}:c1=tri:c2=tri[a01]",
        f"[a01][2:a]acrossfade=d={trans_dur}:c1=tri:c2=tri[a_scenes]"
    ]

    if has_music:
        fade_out_start = max(0, total_len - 2.5)
        filter_complex.append(
            f"[{music_idx}:a]volume=0.065,afade=t=out:st={fade_out_start:.2f}:d=2.5[bgm];"
            f"[a_scenes][bgm]amix=inputs=2:duration=first:dropout_transition=2[a_final]"
        )
        final_audio_map = "[a_final]"
    else:
        final_audio_map = "[a_scenes]"

    cmd.extend([
        "-filter_complex", ";".join(filter_complex),
        "-map", "[v_master]",
        "-map", final_audio_map,
        "-c:v", "libx264", "-preset", "slow", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        FINAL_MP4
    ])

    print("🚀 Ejecutando FFmpeg Master Assembly...")
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print("[FFmpeg Error]", p.stderr[-800:])
        raise RuntimeError("FFmpeg assembly failed")

    size_mb = os.path.getsize(FINAL_MP4) / (1024 * 1024)
    shutil.copy2(FINAL_MP4, FINAL_MP4_ALIAS)

    print("=" * 70)
    print(f"🎉 VIDEO MAESTRO COMPLETADO CON ÉXITO:")
    print(f"📍 Archivo: {FINAL_MP4}")
    print(f"📦 Tamaño: {size_mb:.2f} MB")
    print(f"⏱️ Duración efectiva: {total_len:.2f}s ({total_len/60:.2f} min)")
    print("=" * 70)
    return FINAL_MP4

# -------------------------------------------------------------
# 7. MAIN ENTRY POINT
# -------------------------------------------------------------
async def main():
    print("=" * 70)
    print("🚀 INICIANDO RENDERIZADO MAESTRO ASTRADE — TUTORIAL #1 (V5)")
    print("🎬 Modalidad: Toma Maestra Continua (Zero White Flashes, Cero Reinicios)")
    print("=" * 70)

    server = start_http_server()
    cont_audio = prepare_continuous_audio()

    async with async_playwright() as p:
        intro_mp4 = await record_intro(p)
        app_mp4 = await record_app_flow_continuous(p, cont_audio)
        outro_mp4 = await record_outro(p)

    final_output = assemble_final_video(intro_mp4, app_mp4, outro_mp4)
    return final_output

if __name__ == "__main__":
    asyncio.run(main())

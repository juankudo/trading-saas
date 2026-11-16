"""
AsTrade Studio Master Render Pipeline — Tutorial #1 (V4)
Single-Topic Focus: Creación y Configuración de Cuentas de Trading.
Features:
- Animated Intro with AsTrade official logo, glowing neon halo, and lesson title.
- Real 1920x1080 native resolution (zero grey letterboxing borders).
- Step-by-step account configuration (Account types, Initial Balance vs Actual Balance, Fondeo rules 8%/10%).
- Account Card revealed in the grid with all badges, balance, and action buttons.
- Animated Outro with official domain astradehub.com.
- Smooth FFmpeg cross-fades and music ducking.
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
MANIFEST_PATH = os.path.join(AUDIO_DIR, "manifest_v3.json")
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
# 2. CHOREOGRAPHY PER BLOCK
# -------------------------------------------------------------
async def choreograph_block(page, block_id, duration):
    """
    Executes precise motion graphics, SVG arrow drawing, spotlights,
    typewriting, and card highlights for each scene block.
    """
    t_start = time.time()
    print(f"\n🎬 Coreografiando {block_id} (Meta: {duration:.2f}s)...")

    # In Intro and Outro, the HTML template runs its own animations
    if block_id == "intro":
        await asyncio.sleep(duration - 1.2)
        try:
            await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
        except Exception:
            pass
        await asyncio.sleep(1.2)
        print(f"✅ Bloque {block_id} completado en {time.time() - t_start:.2f}s")
        return

    if block_id == "outro":
        await asyncio.sleep(duration - 1.0)
        try:
            await page.evaluate("if (typeof window.__fadeOutStage === 'function') window.__fadeOutStage();")
        except Exception:
            pass
        await asyncio.sleep(1.0)
        print(f"✅ Bloque {block_id} completado en {time.time() - t_start:.2f}s")
        return

    # In app.html blocks, inject the motion engine
    with open(MOTION_ENGINE_JS, "r", encoding="utf-8") as f:
        engine_code = f.read()

    await page.evaluate(engine_code)
    await page.evaluate("window.__initStudioMotionEngine()")

    # Eradicate tours and overlays
    await page.evaluate("""
        const t = document.getElementById('tourOverlay');
        if (t) t.remove();
        const g = document.getElementById('lifecycleGuideModal');
        if (g) g.remove();
        const lo = document.getElementById('lifecycleGuideOverlay');
        if (lo) lo.remove();
    """)

    if block_id == "block1_accounts_panel":
        # ---------------------------------------------------------
        # BLOCK 1: Panel de Cuentas y Botón Nueva Cuenta (12.17s)
        # ---------------------------------------------------------
        await page.evaluate("""
            window.__showLowerThird('⚡', 'PASO 1: GESTIÓN DE CUENTAS', 'Panel Tus Cuentas: Centro de Mando de Capital');
        """)
        await asyncio.sleep(1.2)

        # Glide cursor towards "Nueva Cuenta"
        btn_selector = "#btn-new-session"
        await page.evaluate(f"""
            window.__drawAnimatedArrow({{ offsetX: 220, offsetY: 70 }}, '{btn_selector}', -0.25, 750);
            window.__pulseRingAround('{btn_selector}', 6);
            window.__showCalloutBadge('{btn_selector}', '⚡', 'GESTIÓN', 'Crear Nueva Cuenta', 'Auditoría institucional en 1 o 2 fases', 'bottom');
        """)
        await asyncio.sleep(4.5)

        # Clear arrow and glide cursor
        await page.evaluate("""
            window.__clearMotionArrows();
            window.__hideCalloutBadge();
            window.__removePulseRing();
        """)
        await page.evaluate(f"window.__glideCursorToElement('{btn_selector}', 600)")
        await asyncio.sleep(0.7)

        # Click ripple + open modal
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
        await asyncio.sleep(1.0)

    elif block_id == "block2_account_types":
        # ---------------------------------------------------------
        # BLOCK 2: Tipos de Cuenta y sus Diferencias (18.41s)
        # ---------------------------------------------------------
        # Ensure modal is open
        await page.evaluate("""
            if (document.getElementById('sessionModal').classList.contains('hidden')) {
                if (typeof openSessionModal === 'function') openSessionModal();
            }
            window.__showLowerThird('📋', 'PASO 2: MODALIDADES', 'Cuentas Reales, Challenges, Fondeadas e Instant');
        """)
        await asyncio.sleep(1.2)

        # Glide cursor to select #inputAccountStage
        stage_sel = "#inputAccountStage"
        await page.evaluate(f"""
            window.__glideCursorToElement('{stage_sel}', 600);
            window.__pulseRingAround('{stage_sel}', 6);
            window.__showCalloutBadge('{stage_sel}', '📋', 'MODALIDADES', 'Tipos de Cuenta Soportados', 'Real, Challenge, Fondeada e Instant', 'right');
        """)
        await asyncio.sleep(4.0)

        # Cycle visually through account types: Real
        await page.evaluate("""
            const el = document.querySelector('#inputAccountStage');
            if (el) {
                el.value = 'real';
                if (typeof toggleAccountStageFields === 'function') toggleAccountStageFields();
            }
            window.__showCalloutBadge('#inputAccountStage', '💼', 'CAPITAL PROPIO', 'Cuenta Real', 'Auditoría de tu capital personal', 'right');
        """)
        await asyncio.sleep(3.5)

        # Select "prueba" (Challenge)
        await page.evaluate("""
            const el = document.querySelector('#inputAccountStage');
            if (el) {
                el.value = 'prueba';
                if (typeof toggleAccountStageFields === 'function') toggleAccountStageFields();
            }
            window.__showCalloutBadge('#inputAccountStage', '🎯', 'SELECCIÓN: FASE DE PRUEBA', 'Evaluación / Challenge', 'Auditoría estricta de metas y límites de pérdida', 'right');
        """)
        await asyncio.sleep(4.5)

        # Clean spotlight & badge
        await page.evaluate("""
            window.__removePulseRing();
            window.__hideCalloutBadge();
        """)

    elif block_id == "block3_balances_rules":
        # ---------------------------------------------------------
        # BLOCK 3: Balance Inicial vs Saldo Actual & Reglas (36.74s)
        # ---------------------------------------------------------
        await page.evaluate("""
            if (document.getElementById('sessionModal').classList.contains('hidden')) {
                if (typeof openSessionModal === 'function') openSessionModal();
            }
            const el = document.querySelector('#inputAccountStage');
            if (el) {
                el.value = 'prueba';
                if (typeof toggleAccountStageFields === 'function') toggleAccountStageFields();
            }
            window.__showLowerThird('💰', 'PASO 3: BALANCES & REGLAS', 'Balance Inicial $100K vs Saldo Actual & Reglas');
        """)
        await asyncio.sleep(1.2)

        # 1. Type account name: 'Fondeo 100K FTMO'
        await page.evaluate("window.__glideCursorToElement('#inputSessionName', 500)")
        await asyncio.sleep(0.5)
        await page.evaluate("window.__typeIntoInput('#inputSessionName', 'Fondeo 100K FTMO', 45)")
        await asyncio.sleep(1.2)

        # 2. Spotlight Initial Balance: $100,000 USD
        bal_el = "#inputSessionBalance"
        await page.evaluate(f"""
            window.__glideCursorToElement('{bal_el}', 500);
            window.__spotlightElement('{bal_el}', 8);
            window.__showCalloutBadge('{bal_el}', '💰', 'CAPITAL AUDITADO', 'Balance Inicial: $100,000 USD', 'Base estricta para el cálculo de riesgo % por trade', 'right');
        """)
        await asyncio.sleep(6.5)

        # 3. Spotlight Balance Actual (Opcional)
        bal_act_el = "#inputSessionBalanceActual"
        await page.evaluate(f"""
            window.__hideSpotlight();
            window.__glideCursorToElement('{bal_act_el}', 500);
            window.__spotlightElement('{bal_act_el}', 8);
            window.__showCalloutBadge('{bal_act_el}', '📊', 'BALANCE ACTUAL (OPCIONAL)', 'Saldo de Corte / Cierre', 'Vacío si es nueva. O tu saldo actual si ya venías operando.', 'right');
        """)
        await asyncio.sleep(7.5)

        # 4. Profit Target: 8%
        target_el = "#inputAccountGoalTargetPct"
        await page.evaluate(f"""
            window.__hideSpotlight();
            window.__glideCursorToElement('{target_el}', 500);
            window.__spotlightElement('{target_el}', 8);
            const tInput = document.querySelector('{target_el}');
            if (tInput) tInput.value = '8';
            window.__showCalloutBadge('{target_el}', '🎯', 'OBJETIVO', 'Profit Target: 8%', 'Meta institucional de $8,000 USD', 'right');
        """)
        await asyncio.sleep(5.5)

        # 5. Drawdown Máximo: 10%
        dd_el = "#inputAccountGoalMaxDD"
        await page.evaluate(f"""
            window.__hideSpotlight();
            window.__glideCursorToElement('{dd_el}', 500);
            window.__spotlightElement('{dd_el}', 8);
            const dInput = document.querySelector('{dd_el}');
            if (dInput) dInput.value = '10';
            window.__showCalloutBadge('{dd_el}', '🛡️', 'LÍMITES', 'Drawdown Máximo: 10%', 'Protección de capital estricta ($10,000 USD)', 'right');
        """)
        await asyncio.sleep(5.5)

        # 6. Click button "Crear" / Submit
        btn_submit = "#btn-submit-session"
        await page.evaluate(f"""
            window.__hideSpotlight();
            window.__hideCalloutBadge();
            window.__glideCursorToElement('{btn_submit}', 600);
            window.__pulseRingAround('{btn_submit}', 6);
        """)
        await asyncio.sleep(1.2)
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
            window.__showLowerThird('✅', 'CUENTA ACTIVADA', 'Fondeo 100K FTMO configurada con reglas 8% / 10%');
        """)
        await asyncio.sleep(1.5)

    elif block_id == "block4_created_card":
        # ---------------------------------------------------------
        # BLOCK 4: Tarjeta de Cuenta Creada en el Grid (21.38s)
        # ---------------------------------------------------------
        # Inject created account and re-render grid
        await page.evaluate("""
            const newAcc = {
                id: 1700000000001,
                name: "Fondeo 100K FTMO",
                pair: "",
                startDate: null,
                balance: 100000,
                balanceActual: null,
                balanceActualAt: null,
                date: new Date().toLocaleDateString('es-ES'),
                stage: "prueba",
                goal: {
                    stage: "prueba",
                    targetPct: 8,
                    maxDDPct: 10,
                    dailyDDPct: 5,
                    minTradingDays: 4,
                    maxTradingDays: 30
                },
                mt5Login: "",
                withdrawals: []
            };
            if (typeof realAccounts !== 'undefined') {
                realAccounts = [newAcc];
            }
            if (typeof renderGroups === 'function') {
                renderGroups();
            }
            window.__showLowerThird('🗂️', 'PASO 4: CUENTA HABILITADA', 'Tarjeta Institucional Creada y Lista en el Grid');
        """)
        await asyncio.sleep(1.5)

        # Highlight newly created card with animated arrow and pulse ring
        first_card = "#sessions-grid > div:first-child"
        await page.evaluate(f"""
            window.__drawAnimatedArrow({{ offsetX: 220, offsetY: 70 }}, '{first_card}', -0.25, 750);
            window.__pulseRingAround('{first_card}', 10);
            window.__showCalloutBadge('{first_card}', '⚡', 'CUENTA ACTIVA', 'Fondeo 100K FTMO', 'Saldo $100,000 USD | Target 8% | Max DD 10%', 'bottom');
        """)
        await asyncio.sleep(6.5)

        # Clear arrow and glide cursor to "Entrar" button
        enter_btn = "#sessions-grid > div:first-child button"
        await page.evaluate(f"""
            window.__clearMotionArrows();
            window.__hideCalloutBadge();
            window.__removePulseRing();
            window.__glideCursorToElement('{enter_btn}', 650);
            window.__pulseRingAround('{enter_btn}', 4);
        """)
        await asyncio.sleep(3.5)

        # Glide cursor to "Editar" pencil button
        edit_btn = '#sessions-grid > div:first-child [data-account-action="edit"], #sessions-grid > div:first-child .fa-pen-to-square'
        await page.evaluate(f"""
            window.__removePulseRing();
            window.__glideCursorToElement('{edit_btn}', 550);
            window.__pulseRingAround('{edit_btn}', 4);
        """)
        await asyncio.sleep(2.5)

        # Show Callout Badge teasing Tutorial #2
        await page.evaluate(f"""
            window.__removePulseRing();
            window.__showCalloutBadge('{first_card}', '🚀', 'PRÓXIMO TUTORIAL', 'Registro y Auditoría de Trades', 'Análisis técnico y capturas antes y después', 'bottom');
        """)
        await asyncio.sleep(4.0)

    # Fill remaining scene time smoothly to match exact audio length
    elapsed = time.time() - t_start
    rem = duration - elapsed
    if rem > 0:
        print(f"   -> Manteniendo toma final ({rem:.2f}s restantes)...")
        await asyncio.sleep(rem)

    print(f"✅ Bloque {block_id} completado en {time.time() - t_start:.2f}s (Meta: {duration:.2f}s)")

# -------------------------------------------------------------
# 3. RENDER SINGLE BLOCK TO MP4
# -------------------------------------------------------------
async def record_scene_block(p, block_info):
    block_id = block_info["id"]
    duration = block_info["duration_seconds"]
    
    # Audio path resolution
    audio_file = block_info.get("audio_file") or f"{block_id}.mp3"
    audio_path = os.path.join(AUDIO_DIR, audio_file)
    if not os.path.exists(audio_path):
        raw_ap = block_info.get("audio_path", "")
        if raw_ap and os.path.exists(raw_ap):
            audio_path = raw_ap
        else:
            base_fn = os.path.basename(raw_ap) if raw_ap else f"{block_id}.mp3"
            audio_path = os.path.join(AUDIO_DIR, base_fn)
    
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio no encontrado para {block_id}: {audio_path}")

    # Checkpoint check
    scene_mp4 = os.path.join(SCENES_DIR, f"{block_id}.mp4")
    force_rerender = "--force" in sys.argv
    if not force_rerender and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 500000:
        print(f"⏩ Checkpoint activo para {block_id} ({os.path.getsize(scene_mp4)/(1024*1024):.2f} MB). Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{block_id}")
    if os.path.exists(raw_dir):
        shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    # 1920x1080 Native Setup (Eliminates all grey borders)
    launch_args = [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--font-render-hinting=none",
        "--window-size=1920,1080"
    ]
    browser = await p.chromium.launch(
        headless=True,
        args=launch_args
    )

    context = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=raw_dir,
        record_video_size={"width": 1920, "height": 1080}
    )

    # Init script: Active session + Eradicate intrusive tours + Macro-UI scale
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

        const macroStyle = document.createElement('style');
        macroStyle.id = 'studio-macro-ui-style';
        macroStyle.innerHTML = `
            #tourOverlay, .tour-overlay, #tourSvgMask, #tourTooltip, #tourHighlightRing,
            #lifecycleGuideOverlay, #lifecycleGuideModal, .shepherd-element,
            .fondeo-celebration, .fondeo-confetti, #confettiCanvas {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
            }
            html {
                font-size: 17.5px !important;
                zoom: 1.10 !important;
            }
            .text-xs { font-size: 0.88rem !important; }
            .text-sm { font-size: 1.02rem !important; }
            .text-base { font-size: 1.15rem !important; }
            input, select, button {
                font-size: 1.02rem !important;
            }
            .account-card {
                transform: scale(1.02);
            }
        `;
        if (document.head) {
            document.head.appendChild(macroStyle);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.head.appendChild(macroStyle));
        }
    """)

    page = await context.new_page()

    # Determine start URL
    if block_id == "intro":
        start_url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=intro"
    elif block_id == "outro":
        start_url = f"http://127.0.0.1:{PORT}/scripts/render/intro_outro_motion.html?mode=outro"
    else:
        start_url = f"http://127.0.0.1:{PORT}/app.html"

    await page.goto(start_url, wait_until="domcontentloaded")
    await asyncio.sleep(0.5)

    # Execute choreography
    await choreograph_block(page, block_id, duration)

    # Close to finalize WebM
    await page.close()
    await context.close()
    await browser.close()

    # Find recorded WebM
    webm_files = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webm_files:
        raise RuntimeError(f"No se encontró archivo WebM grabado para {block_id}")
    raw_webm = webm_files[0]

    # Convert to MP4 muxed with scene audio
    scene_mp4 = os.path.join(SCENES_DIR, f"{block_id}.mp4")
    print(f"⚙️ Muxeando video y audio para {block_id}...")
    
    mux_cmd = [
        FFMPEG_EXE, "-y",
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
    proc = subprocess.run(mux_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        print(f"❌ Error FFmpeg al muxear {block_id}:")
        print(proc.stderr[-1000:])
        raise RuntimeError(f"FFmpeg mux failed for {block_id}")
    print(f"   -> Creado: {scene_mp4} ({os.path.getsize(scene_mp4)/(1024*1024):.2f} MB)")
    return scene_mp4

# -------------------------------------------------------------
# 4. FINAL ASSEMBLY WITH XFADE & MUSIC DUCKING
# -------------------------------------------------------------
def assemble_final_video(scene_mp4s, manifest_blocks):
    print("\n" + "=" * 70)
    print("🎞️ ENSAMBLANDO VIDEO MAESTRO CON TRANSICIONES CINEMÁTICAS (XFADE)")
    print("=" * 70)

    n = len(scene_mp4s)
    trans_dur = 0.4  # 0.4s smooth cross-dissolve

    durations = [b["duration_seconds"] for b in manifest_blocks]
    offsets = []
    accum = 0.0
    for i in range(n - 1):
        accum += durations[i]
        offset = accum - (i + 1) * trans_dur
        offsets.append(offset)

    cmd = [FFMPEG_EXE, "-y"]
    for s in scene_mp4s:
        cmd.extend(["-i", s])

    has_music = os.path.exists(BG_MUSIC)
    if has_music:
        cmd.extend(["-i", BG_MUSIC])
        music_idx = n
    else:
        music_idx = None

    filter_parts = []
    
    # Video cross-dissolves
    last_v = "0:v"
    for i in range(1, n):
        out_v = f"v_trans_{i}"
        off = offsets[i-1]
        filter_parts.append(f"[{last_v}][{i}:v]xfade=transition=fade:duration={trans_dur}:offset={off:.3f}[{out_v}]")
        last_v = out_v

    # Audio cross-fades
    last_a = "0:a"
    for i in range(1, n):
        out_a = f"a_trans_{i}"
        filter_parts.append(f"[{last_a}][{i}:a]acrossfade=d={trans_dur}:c1=tri:c2=tri[{out_a}]")
        last_a = out_a

    # Music ducking and fade out
    total_len = accum + durations[-1] - (n - 1) * trans_dur
    if has_music:
        fade_out_start = max(0, total_len - 2.5)
        filter_parts.append(
            f"[{music_idx}:a]volume=0.065,afade=t=out:st={fade_out_start:.2f}:d=2.5[bgm];"
            f"[{last_a}][bgm]amix=inputs=2:duration=first:dropout_transition=2[a_final]"
        )
        final_audio_label = "[a_final]"
    else:
        final_audio_label = f"[{last_a}]"

    final_filter = ";".join(filter_parts)

    cmd.extend([
        "-filter_complex", final_filter,
        "-map", f"[{last_v}]",
        "-map", final_audio_label,
        "-c:v", "libx264", "-preset", "slow", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        FINAL_MP4
    ])

    print("🚀 Ejecutando FFmpeg Master Assembly...")
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
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
# 5. MAIN ENTRY POINT
# -------------------------------------------------------------
async def main():
    print("=" * 70)
    print("🚀 INICIANDO RENDERIZADO MAESTRO ASTRADE — TUTORIAL #1 (V4)")
    print("🎬 Tema: Creación y Configuración de Cuentas de Trading")
    print("=" * 70)

    # 1. Start server
    server = start_http_server()

    # 2. Load audio manifest
    if not os.path.exists(MANIFEST_PATH):
        raise FileNotFoundError(f"No se encontró el manifest de audio en {MANIFEST_PATH}.")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest_data = json.load(f)

    blocks = manifest_data["blocks"]
    print(f"📋 Total bloques a procesar: {len(blocks)}")

    scene_mp4s = []
    async with async_playwright() as p:
        for b in blocks:
            sc_mp4 = await record_scene_block(p, b)
            scene_mp4s.append(sc_mp4)

    # 3. Assemble Master Video
    final_output = assemble_final_video(scene_mp4s, blocks)
    return final_output

if __name__ == "__main__":
    asyncio.run(main())

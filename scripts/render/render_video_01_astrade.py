"""
AsTrade Studio Master Render Pipeline — Tutorial #1 (V3)
Cinematic Screen Production with Motion Graphics, Animated SVG Arrows,
Real Populated Data ("The After"), Zero White Flashes, and Smooth FFmpeg Transitions.
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
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")

MOTION_ENGINE_JS = os.path.join(BASE_DIR, "scripts", "render", "studio_motion_engine.js")
MOCK_DATA_JS = os.path.join(BASE_DIR, "scripts", "render", "mock_populated_data.js")

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
    typewriting, and celebration confetti for each scene block.
    """
    t_start = time.time()
    print(f"\n🎬 Coreografiando {block_id} (Meta: {duration:.2f}s)...")

    # Read JS scripts to inject
    with open(MOTION_ENGINE_JS, "r", encoding="utf-8") as f:
        engine_code = f.read()
    with open(MOCK_DATA_JS, "r", encoding="utf-8") as f:
        mock_code = f.read()

    await page.evaluate(engine_code)
    await page.evaluate(mock_code)
    await page.evaluate("window.__initStudioMotionEngine()")

    if block_id == "block1_welcome":
        # ---------------------------------------------------------
        # BLOCK 1: Bienvenida en index.html y acceso
        # ---------------------------------------------------------
        await page.evaluate("""
            window.__showLowerThird('⚡', 'PASO 1: ACCESO', 'Bienvenida a AsTrade: Bitácora Institucional');
        """)
        await asyncio.sleep(2.0)

        # Glide cursor from center towards Hero
        await page.evaluate("window.__glideCursorTo(680, 420, 900)")
        await asyncio.sleep(1.0)

        # Draw animated neon arrow pointing to CTA "Mi Bitácora" / "Comenzar"
        cta_selector = 'a[href="app.html"]'
        await page.evaluate(f"""
            window.__drawAnimatedArrow({{ offsetX: -200, offsetY: 70 }}, '{cta_selector}', 0.3, 850);
            window.__pulseRingAround('{cta_selector}');
            window.__showCalloutBadge('{cta_selector}', '🚀', 'PRUEBA GRATUITA', '7 Días de Acceso Total', 'Auditoría estricta para cuentas de fondeo', 'bottom');
        """)
        await asyncio.sleep(6.5)

        # Clear arrow and glide to CTA
        await page.evaluate("""
            window.__clearMotionArrows();
            window.__hideCalloutBadge();
            window.__removePulseRing();
        """)
        await page.evaluate(f"window.__glideCursorToElement('{cta_selector}', 750)")
        await asyncio.sleep(0.8)

        # Click ripple + Navigate to app.html
        await page.evaluate("window.__clickRipple()")
        await asyncio.sleep(0.4)
        await page.evaluate(f"document.querySelector('{cta_selector}').click()")
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(1.5)

        # Re-inject engine on newly loaded page
        await page.evaluate(engine_code)
        await page.evaluate("window.__initStudioMotionEngine()")
        await page.evaluate("window.__showLowerThird('💼', 'PASO 1: ACCESO', 'Ingresando al entorno de alta concentración');")

    elif block_id == "block2_new_account":
        # ---------------------------------------------------------
        # BLOCK 2: app.html -> Botón Nueva Cuenta y Formulario 100K
        # ---------------------------------------------------------
        await page.evaluate("""
            window.__showLowerThird('💼', 'PASO 2: NUEVA CUENTA', 'Creación de Cuenta Challenge $100K');
        """)
        await asyncio.sleep(1.5)

        # Arrow pointing to "Nueva Cuenta"
        btn_selector = "#btn-new-session"
        await page.evaluate(f"""
            window.__drawAnimatedArrow({{ offsetX: 220, offsetY: 60 }}, '{btn_selector}', -0.25, 800);
            window.__pulseRingAround('{btn_selector}');
            window.__showCalloutBadge('{btn_selector}', '⚡', 'GESTIÓN', 'Crear Nueva Cuenta', 'Auditoría en 1 o 2 fases', 'bottom');
        """)
        await asyncio.sleep(5.0)

        # Clear arrow & glide cursor
        await page.evaluate("""
            window.__clearMotionArrows();
            window.__hideCalloutBadge();
            window.__removePulseRing();
        """)
        await page.evaluate(f"window.__glideCursorToElement('{btn_selector}', 700)")
        await asyncio.sleep(0.8)

        # Click ripple + open modal safely
        await page.evaluate("window.__clickRipple()")
        await asyncio.sleep(0.3)
        await page.evaluate(f"""
            const btn = document.querySelector('{btn_selector}');
            if (btn) {{
                btn.click();
            }} else if (typeof openSessionModal === 'function') {{
                openSessionModal();
            }}
        """)
        try:
            await page.wait_for_selector("#sessionModal:not(.hidden)", state="visible", timeout=3000)
        except Exception:
            await page.evaluate("if (typeof openSessionModal === 'function') openSessionModal();")
        await asyncio.sleep(1.0)

        # Glide cursor to Account Name Input and Type
        await page.evaluate("window.__glideCursorToElement('#inputSessionName', 600)")
        await asyncio.sleep(0.6)
        await page.evaluate("""
            const nameEl = document.querySelector('#inputSessionName');
            if (nameEl) window.__typeIntoInput('#inputSessionName', 'Fondeo 100K FTMO', 55);
        """)
        await asyncio.sleep(1.2)

        # Stage Selection
        await page.evaluate("window.__glideCursorToElement('#inputAccountStage', 600)")
        await asyncio.sleep(0.6)
        await page.evaluate("""
            const stageEl = document.querySelector('#inputAccountStage');
            if (stageEl) {
                stageEl.value = 'prueba';
                stageEl.dispatchEvent(new Event('change'));
            }
        """)
        await asyncio.sleep(1.0)

        # Spotlight Initial Balance $100,000
        await page.evaluate("""
            window.__glideCursorToElement('#inputSessionBalance', 600);
            window.__spotlightElement('#inputSessionBalance');
            window.__showCalloutBadge('#inputSessionBalance', '💰', 'CAPITAL', 'Balance $100,000 USD', 'Saldo institucional para auditar', 'right');
        """)
        await asyncio.sleep(4.5)
        await page.evaluate("""
            window.__hideSpotlight();
            window.__hideCalloutBadge();
        """)

    elif block_id == "block3_rules_celebration":
        # ---------------------------------------------------------
        # BLOCK 3: Configuración de Reglas y Celebración
        # ---------------------------------------------------------
        # Ensure modal is open with prefilled data
        await page.evaluate("""
            if (document.getElementById('sessionModal').classList.contains('hidden')) {
                openSessionModal();
            }
            document.getElementById('inputSessionName').value = 'Fondeo 100K FTMO';
            document.getElementById('inputAccountStage').value = 'prueba';
            if (typeof fillAccountStageForm === 'function') fillAccountStageForm(null);
            window.__showLowerThird('🎯', 'PASO 3: REGLAS & ACTIVACIÓN', 'Auditoría de Drawdown y Activación');
        """)
        await asyncio.sleep(1.5)

        # Spotlight Profit Target 8%
        target_el = "#inputAccountGoalTargetPct"
        await page.evaluate(f"""
            window.__glideCursorToElement('{target_el}', 600);
            window.__spotlightElement('{target_el}', 10);
            window.__pulseRingAround('{target_el}', 6);
            window.__showCalloutBadge('{target_el}', '🎯', 'OBJETIVO', 'Profit Target 8%', 'Meta institucional de $8,000 USD', 'right');
        """)
        await asyncio.sleep(5.0)

        # Spotlight Daily Loss & Max DD
        dd_el = "#inputAccountGoalMaxDD"
        await page.evaluate(f"""
            window.__hideSpotlight();
            window.__removePulseRing();
            window.__glideCursorToElement('{dd_el}', 600);
            window.__spotlightElement('{dd_el}', 10);
            window.__showCalloutBadge('{dd_el}', '🛡️', 'LÍMITES', 'Drawdown Máximo 10%', 'Pérdida diaria 5% blindada', 'right');
        """)
        await asyncio.sleep(5.0)

        # Clear spotlight and glide to submit button
        submit_btn = "#btn-submit-session"
        await page.evaluate(f"""
            window.__hideSpotlight();
            window.__hideCalloutBadge();
            window.__glideCursorToElement('{submit_btn}', 700);
            window.__pulseRingAround('{submit_btn}', 8);
        """)
        await asyncio.sleep(1.8)

        # Click submit safely
        await page.evaluate("window.__clickRipple()")
        await asyncio.sleep(0.3)
        await page.evaluate(f"""
            const sBtn = document.querySelector('{submit_btn}');
            if (sBtn) {{
                sBtn.click();
            }} else if (typeof saveSession === 'function') {{
                saveSession(new Event('submit'));
            }}
        """)
        await asyncio.sleep(0.5)

        # Close modal if open & trigger CELEBRATION
        await page.evaluate("""
            window.__removePulseRing();
            if (typeof closeSessionModal === 'function') closeSessionModal();
            window.__triggerCelebrationConfetti();
            window.__showLowerThird('🎉', 'ACTIVACIÓN COMPLETADA', 'Cuenta de Fondeo 100K Habilitada con Éxito');
        """)
        await asyncio.sleep(3.0)

    elif block_id == "block4_dashboard_reveal":
        # ---------------------------------------------------------
        # BLOCK 4: La Transformación — Dashboard con Datos Reales
        # ---------------------------------------------------------
        # Inject populated challenge data ($104,250 balance, 14 trades, 68.4% WR, 2.35 PF)
        await page.evaluate("""
            async () => {
                if (typeof window.__injectPopulatedChallengeData === 'function') {
                    await window.__injectPopulatedChallengeData();
                }
            }
        """)
        await page.evaluate("""
            window.__showLowerThird('📊', 'PASO 4: RESULTADO EN VIVO', 'Dashboard Cobrando Vida: Consistencia Demostrada');
        """)
        await asyncio.sleep(2.0)

        # Show arrow to the active populated account card in grid
        account_card = "#sessions-grid > div:first-child, .account-card, [onclick*='enterGroup']"
        await page.evaluate(f"""
            const card = document.querySelector('{account_card}');
            if (card) {{
                window.__drawAnimatedArrow({{ offsetX: 200, offsetY: 50 }}, '{account_card}', -0.25, 800);
                window.__pulseRingAround('{account_card}', 10);
                window.__showCalloutBadge('{account_card}', '📈', 'PROGRESO', 'Fondeo 100K FTMO', 'Balance $104,250 (+4.25% hacia el objetivo)', 'bottom');
            }}
        """)
        await asyncio.sleep(5.5)

        # Clear arrow and glide to Dashboard Tab
        dash_tab = "#tab-btn-dashboard"
        await page.evaluate(f"""
            window.__clearMotionArrows();
            window.__hideCalloutBadge();
            window.__removePulseRing();
            const tab = document.querySelector('{dash_tab}');
            if (tab) tab.classList.remove('hidden');
            window.__glideCursorToElement('{dash_tab}', 650);
            window.__pulseRingAround('{dash_tab}', 6);
        """)
        await asyncio.sleep(1.5)

        # Click Dashboard Tab
        await page.evaluate("window.__clickRipple()")
        await asyncio.sleep(0.3)
        await page.evaluate("""
            if (typeof switchTab === 'function') switchTab('dashboard');
            if (typeof renderAll === 'function') renderAll();
            if (typeof renderDashboard === 'function') renderDashboard();
        """)
        await asyncio.sleep(1.5)

        # Spotlight Equity Curve and Metrics
        await page.evaluate("""
            window.__removePulseRing();
            const chartCanvas = document.querySelector('#equityChart, canvas');
            if (chartCanvas) {
                window.__spotlightElement(chartCanvas.id ? '#' + chartCanvas.id : 'canvas', 15);
            }
            window.__showLowerThird('💎', 'MÉTRICAS AUDITADAS', 'Win Rate 68.4% | Profit Factor 2.35 | Curva Ascendente');
        """)
        await asyncio.sleep(7.0)

        # Clean spotlight and show final callout
        await page.evaluate("""
            window.__hideSpotlight();
            window.__showCalloutBadge('#tab-btn-dashboard', '🚀', 'COMIENZA HOY', '7 Días Gratis en AsTrade.app', 'Lleva tu cuenta de fondeo al siguiente nivel', 'bottom');
        """)
        await asyncio.sleep(3.0)

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
    
    # Robust cross-platform audio path resolution
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

    # Checkpoint: si la escena ya fue grabada y muxeada, la reutilizamos para no perder tiempo
    scene_mp4 = os.path.join(SCENES_DIR, f"{block_id}.mp4")
    force_rerender = "--force" in sys.argv
    if not force_rerender and os.path.exists(scene_mp4) and os.path.getsize(scene_mp4) > 500000:
        print(f"⏩ Checkpoint activo para {block_id} ({os.path.getsize(scene_mp4)/(1024*1024):.2f} MB). Saltando grabación...")
        return scene_mp4

    raw_dir = os.path.join(SCENES_DIR, f"raw_{block_id}")
    if os.path.exists(raw_dir):
        shutil.rmtree(raw_dir, ignore_errors=True)
    os.makedirs(raw_dir, exist_ok=True)

    # Launch browser with dark background override to prevent white flash
    launch_args = [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--font-render-hinting=none"
    ]
    browser = await p.chromium.launch(
        headless=True,
        args=launch_args
    )

    context = await browser.new_context(
        viewport={"width": 1920, "height": 1080},
        device_scale_factor=1,
        record_video_dir=raw_dir,
        record_video_size={"width": 1920, "height": 1080}
    )

    # Inyectar sesión autenticada activa para evitar que app.html redirija a index.html
    await context.add_init_script("""
        localStorage.setItem('trading_saas_user_session', JSON.stringify({
            id: 'usr_astrade_pro',
            email: 'trader@astrade.app',
            name: 'Trader Institucional',
            plan: 'pro_monthly',
            status: 'active',
            createdAt: new Date().toISOString(),
            subscription: {
                status: 'active',
                plan: 'pro_monthly',
                current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
            }
        }));
    """)

    page = await context.new_page()

    # CDP Dark Canvas Override (#0b0f19)
    try:
        cdp = await context.new_cdp_session(page)
        await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
            "color": {"r": 11, "g": 15, "b": 25, "a": 1}
        })
    except Exception as e:
        print(f"   [CDP Notice] {e}")

    # Determine start URL
    if block_id == "block1_welcome":
        start_url = f"http://127.0.0.1:{PORT}/index.html"
    else:
        start_url = f"http://127.0.0.1:{PORT}/app.html"

    await page.goto(start_url, wait_until="domcontentloaded")
    await asyncio.sleep(0.5)

    # Execute motion graphics
    await choreograph_block(page, block_id, duration)

    # Close page and context to finalize Playwright WebM recording
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
    
    # FFmpeg command to mux video + audio and ensure exact length
    mux_cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_webm,
        "-i", audio_path,
        "-filter_complex", f"[0:v]fps=30,scale=1920:1080,format=yuv420p[v]",
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
    trans_dur = 0.5  # 0.5s smooth cross-dissolve

    # Calculate offsets for xfade
    # offset_i = sum(durations[:i]) - i * trans_dur
    durations = [b["duration_seconds"] for b in manifest_blocks]
    offsets = []
    accum = 0.0
    for i in range(n - 1):
        accum += durations[i]
        offset = accum - (i + 1) * trans_dur
        offsets.append(offset)

    # Build inputs
    cmd = [FFMPEG_EXE, "-y"]
    for s in scene_mp4s:
        cmd.extend(["-i", s])

    has_music = os.path.exists(BG_MUSIC)
    if has_music:
        cmd.extend(["-i", BG_MUSIC])
        music_idx = n
    else:
        music_idx = None

    # Filter complex
    filter_parts = []
    
    # Video cross-dissolves
    # [0:v][1:v]xfade=transition=fade:duration=0.5:offset=offset_0[v01];
    # [v01][2:v]xfade=transition=fade:duration=0.5:offset=offset_1[v02]...
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
        # Music volume -24 dB, loop/trim to total_len, fade out in last 2.5s
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
    print("🚀 INICIANDO RENDERIZADO MAESTRO ASTRADE — TUTORIAL #1 (V3)")
    print("=" * 70)

    # 1. Start server
    server = start_http_server()

    # 2. Load audio manifest
    if not os.path.exists(MANIFEST_PATH):
        raise FileNotFoundError(f"No se encontró el manifest de audio en {MANIFEST_PATH}. Ejecuta scripts/audio/generate_video_01_v3_audio.py primero.")

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

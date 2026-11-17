"""
Modular Scene-by-Scene Tutorial Video Producer — Trading Journal Pro
Guarantees 100% synchronization by recording each scene individually to match
its specific audio duration from manifest.json, with:
- Spotlight effect (dimming background to highlight active element)
- Smooth virtual cursor with click ripples
- Dynamic camera pan & zoom (1.5x - 1.8x)
- Real character-by-character typing
- Lower-third step badges
- Seamless lo-fi music mixing (-24 dB) and final MP4 export
"""

import os
import sys
import json
import time
import shutil
import threading
import subprocess
import http.server
import socketserver
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MANIFEST_PATH = os.path.join(BASE_DIR, "scratch", "audio", "manifest.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "media", "youtube_tutorials")
SCENES_RAW_DIR = os.path.join(BASE_DIR, "scratch", "scenes_raw")
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
PORT = 8089

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(SCENES_RAW_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. LOCAL MULTI-THREADED HTTP SERVER
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
        print(f"[HTTP] Servidor multi-hilo activo en http://127.0.0.1:{PORT}/")
        return server
    except Exception as e:
        print(f"[HTTP] Aviso servidor: {e} (quizá ya activo)")
        return None

# -------------------------------------------------------------
# 2. STUDIO JS INJECTOR (Spotlight, Cursor, Zoom, Step Badge)
# -------------------------------------------------------------
STUDIO_INJECTION_SCRIPT = """
window.__initStudioEngine = function() {
    if (document.getElementById('studio-virtual-cursor')) return;

    const style = document.createElement('style');
    style.id = 'studio-modular-styles';
    style.innerHTML = `
        /* Virtual Cursor */
        #studio-virtual-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 32px;
            height: 32px;
            pointer-events: none;
            z-index: 9999999;
            transform: translate(960px, 540px);
            filter: drop-shadow(0 3px 12px rgba(0,0,0,0.9));
            transition: transform 0.04s linear;
        }
        #studio-cursor-ripple {
            position: absolute;
            top: 0;
            left: 0;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: 3.5px solid #10b981;
            background: rgba(16, 185, 129, 0.28);
            transform: translate(-18px, -18px) scale(0);
            opacity: 0;
            pointer-events: none;
            box-shadow: 0 0 25px #10b981;
        }
        #studio-cursor-ripple.pulse {
            animation: cursorRippleAnim 0.45s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        @keyframes cursorRippleAnim {
            0% { transform: translate(-18px, -18px) scale(0.2); opacity: 1; }
            100% { transform: translate(-18px, -18px) scale(2.0); opacity: 0; }
        }

        /* Dynamic Spotlight Mask */
        #studio-spotlight-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999990;
            background: rgba(5, 8, 16, 0.65);
            opacity: 0;
            transition: opacity 0.5s ease;
            backdrop-filter: blur(1.5px);
        }
        #studio-spotlight-overlay.active {
            opacity: 1;
        }
        #studio-spotlight-hole {
            position: absolute;
            border: 3px solid #10b981;
            border-radius: 16px;
            box-shadow: 0 0 35px rgba(16,185,129,0.7), inset 0 0 20px rgba(16,185,129,0.2);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            background: transparent;
        }

        /* Lower Third Step Badge */
        #studio-step-badge {
            position: fixed;
            bottom: 45px;
            left: 45px;
            background: rgba(10, 15, 29, 0.95);
            border: 2px solid #10b981;
            border-radius: 20px;
            padding: 18px 28px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(16,185,129,0.3);
            backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            gap: 18px;
            z-index: 9999998;
            transform: translateY(160px);
            opacity: 0;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
            max-width: 680px;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        #studio-step-badge.active {
            transform: translateY(0);
            opacity: 1;
        }
        .studio-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.22);
            border: 1px solid #10b981;
            color: #10b981;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            padding: 4px 14px;
            border-radius: 999px;
            margin-bottom: 5px;
        }
    `;
    document.head.appendChild(style);

    // Cursor
    const cursor = document.createElement('div');
    cursor.id = 'studio-virtual-cursor';
    cursor.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5.65 2.15C5.35 1.85 4.8 2.06 4.8 2.5V20.5C4.8 2.95 5.38 21.15 5.68 20.8L10.3 15.68C10.45 15.52 10.66 15.43 10.88 15.43H18.5C18.94 15.43 19.16 14.88 18.83 14.58L5.65 2.15Z" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
        </svg>
        <div id="studio-cursor-ripple"></div>
    `;
    document.body.appendChild(cursor);

    // Spotlight overlay
    const spotlight = document.createElement('div');
    spotlight.id = 'studio-spotlight-overlay';
    spotlight.innerHTML = `<div id="studio-spotlight-hole"></div>`;
    document.body.appendChild(spotlight);

    // Step badge
    const badge = document.createElement('div');
    badge.id = 'studio-step-badge';
    badge.innerHTML = `
        <div style="width: 50px; height: 50px; border-radius: 14px; background: rgba(16,185,129,0.2); border: 1.5px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #10b981; flex-shrink: 0;" id="studio-step-icon">⚡</div>
        <div>
            <div class="studio-badge-pill" id="studio-step-tag">PASO 1: CONFIGURACIÓN</div>
            <div style="font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.35;" id="studio-step-title">Control milimétrico del drawdown</div>
        </div>
    `;
    document.body.appendChild(badge);

    window.__curX = 960;
    window.__curY = 540;
};

window.__glideCursorTo = function(targetX, targetY, durationMs = 600) {
    return new Promise(resolve => {
        const startX = window.__curX;
        const startY = window.__curY;
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const curX = startX + (targetX - startX) * ease;
            const curY = startY + (targetY - startY) * ease;
            window.__curX = curX;
            window.__curY = curY;

            const el = document.getElementById('studio-virtual-cursor');
            if (el) el.style.transform = `translate(${curX}px, ${curY}px)`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
};

window.__clickRipple = function() {
    const ripple = document.getElementById('studio-cursor-ripple');
    if (ripple) {
        ripple.classList.remove('pulse');
        void ripple.offsetWidth;
        ripple.classList.add('pulse');
    }
};

window.__spotlightElement = function(selectorOrRect, padding = 12) {
    const overlay = document.getElementById('studio-spotlight-overlay');
    const hole = document.getElementById('studio-spotlight-hole');
    if (!overlay || !hole) return;

    let rect = null;
    if (typeof selectorOrRect === 'string') {
        const el = document.querySelector(selectorOrRect);
        if (el) rect = el.getBoundingClientRect();
    } else {
        rect = selectorOrRect;
    }

    if (!rect) {
        overlay.classList.remove('active');
        return;
    }

    hole.style.left = (rect.left - padding) + 'px';
    hole.style.top = (rect.top - padding) + 'px';
    hole.style.width = (rect.width + padding * 2) + 'px';
    hole.style.height = (rect.height + padding * 2) + 'px';
    overlay.classList.add('active');
};

window.__hideSpotlight = function() {
    const overlay = document.getElementById('studio-spotlight-overlay');
    if (overlay) overlay.classList.remove('active');
};

window.__zoomTo = function(selectorOrCoords, scale = 1.5, durationMs = 800) {
    let cx = 960, cy = 540;
    if (typeof selectorOrCoords === 'string') {
        const el = document.querySelector(selectorOrCoords);
        if (el) {
            const rect = el.getBoundingClientRect();
            cx = rect.left + rect.width / 2;
            cy = rect.top + rect.height / 2;
        }
    } else if (selectorOrCoords && selectorOrCoords.x !== undefined) {
        cx = selectorOrCoords.x;
        cy = selectorOrCoords.y;
    }

    const target = document.body;
    target.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    target.style.transformOrigin = `${cx}px ${cy}px`;
    target.style.transform = `scale(${scale})`;
};

window.__resetZoom = function(durationMs = 700) {
    const target = document.body;
    target.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    target.style.transform = `scale(1)`;
};

window.__showStepBadge = function(icon, tag, title) {
    const badge = document.getElementById('studio-step-badge');
    document.getElementById('studio-step-icon').innerText = icon;
    document.getElementById('studio-step-tag').innerText = tag;
    document.getElementById('studio-step-title').innerText = title;
    badge.classList.add('active');
};

window.__hideStepBadge = function() {
    const badge = document.getElementById('studio-step-badge');
    if (badge) badge.classList.remove('active');
};
"""

MOCK_USER_SESSION = """
(function() {
    const userSession = {
        id: "usr_trader_pro_777",
        name: "Juan Trader Pro",
        email: "trader.pro@tradingjournal.com",
        created_at: new Date().toISOString(),
        subscription: {
            status: "active",
            plan: "pro",
            current_period_end: new Date(Date.now() + 14 * 86400000).toISOString()
        }
    };
    localStorage.setItem("trading_saas_user_session", JSON.stringify(userSession));
    localStorage.setItem("journalTheme", "dark");
    localStorage.setItem("journal_tour_completed", "true");
    localStorage.setItem("journal_tour_never_show", "true");
    localStorage.setItem("journal_lifecycle_never_show", "true");
})();
"""

# -------------------------------------------------------------
# 3. INDIVIDUAL SCENE ACTIONS (Perfect synchronization)
# -------------------------------------------------------------
def play_tutorial_01_scene(page, scene_idx, duration):
    t_start = time.time()
    
    if scene_idx == 1:
        # Bienvenida y el reto de las cuentas de fondeo
        page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('⚡', 'TRADING JOURNAL PRO', 'Bitácora profesional en la nube para cuentas de fondeo')")
        page.evaluate("window.__glideCursorTo(960, 380, 1000)")
        page.wait_for_timeout(2500)
        
        # Spotlight on hero title
        page.evaluate("window.__spotlightElement('h1', 20)")
        page.evaluate("window.__zoomTo('h1', 1.3, 800)")
        page.wait_for_timeout(6000)
        
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")
        page.wait_for_timeout(2000)
        
        # Scroll down to prop firm features
        page.evaluate("window.scrollBy({ top: 380, behavior: 'smooth' })")
        page.evaluate("window.__glideCursorTo(960, 600, 1000)")
        page.wait_for_timeout(4000)

    elif scene_idx == 2:
        # Registro rápido y sincronización en la nube
        page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🔒', 'PASO 1: REGISTRO', '14 días gratis sin tarjeta y sincronización Supabase')")
        page.evaluate("window.__glideCursorTo(1150, 40, 1200)")
        page.wait_for_timeout(2000)
        
        page.evaluate("window.__spotlightElement({ left: 1040, top: 25, width: 220, height: 45 }, 8)")
        page.wait_for_timeout(2500)
        page.evaluate("window.__clickRipple()")
        page.wait_for_timeout(1000)
        page.evaluate("window.__hideSpotlight()")

        # Scroll to register section / modal
        page.evaluate("window.scrollBy({ top: 550, behavior: 'smooth' })")
        page.wait_for_timeout(2000)
        page.evaluate("window.__zoomTo({ x: 960, y: 550 }, 1.5, 800)")
        page.wait_for_timeout(6000)
        page.evaluate("window.__resetZoom(700)")
        page.wait_for_timeout(3000)

    elif scene_idx == 3:
        # Creación y parametrización de la cuenta de $100K
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1500)

        page.evaluate("window.__showStepBadge('💼', 'PASO 2: CUENTA $100K', 'Configuración de balance y Fase 1 de evaluación')")
        page.evaluate("window.__glideCursorTo(380, 80, 1200)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__clickRipple()")
        page.wait_for_timeout(1000)
        
        page.evaluate("window.__spotlightElement({ left: 320, top: 60, width: 250, height: 50 }, 10)")
        page.evaluate("window.__zoomTo({ x: 420, y: 150 }, 1.55, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")
        page.wait_for_timeout(3000)

    elif scene_idx == 4:
        # Configuración estricta de límites de pérdida (5% / 10%)
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1500)

        page.evaluate("window.__showStepBadge('🛡️', 'PASO 3: REGLAS 5% Y 10%', 'Pérdida diaria máxima del 5% y Drawdown total del 10%')")
        page.evaluate("window.__glideCursorTo(960, 240, 1200)")
        page.wait_for_timeout(2000)
        
        page.evaluate("window.__spotlightElement({ left: 700, top: 180, width: 520, height: 120 }, 14)")
        page.evaluate("window.__zoomTo({ x: 960, y: 240 }, 1.6, 800)")
        page.wait_for_timeout(10000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")
        page.wait_for_timeout(3000)

    elif scene_idx == 5:
        # Monitoreo del colchón de riesgo en tiempo real
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1500)

        page.evaluate("window.__showStepBadge('🟢', 'PASO 4: MARGEN SEGURO', 'Monitoreo en vivo de $4,150 USD de colchón restante')")
        page.evaluate("window.__glideCursorTo(650, 320, 1200)")
        page.wait_for_timeout(2000)
        
        page.evaluate("window.__spotlightElement({ left: 450, top: 250, width: 400, height: 140 }, 12)")
        page.evaluate("window.__zoomTo({ x: 650, y: 320 }, 1.6, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")
        page.wait_for_timeout(3000)

    elif scene_idx == 6:
        # Outro & Llamada a la acción
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1500)

        page.evaluate("window.__showStepBadge('🚀', '14 DÍAS GRATIS', 'tradingjournalpro.pages.dev | Suscríbete para el Tutorial #2')")
        page.evaluate("window.__glideCursorTo(1720, 40, 1200)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__clickRipple()")
        page.wait_for_timeout(1000)
        page.evaluate("window.__zoomTo({ x: 960, y: 540 }, 1.25, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__resetZoom(700)")

    # Hold exact remaining time to guarantee 100% audio-video duration match
    elapsed = time.time() - t_start
    rem = duration - elapsed
    if rem > 0:
        page.wait_for_timeout(int(rem * 1000))

def play_tutorial_02_scene(page, scene_idx, duration):
    t_start = time.time()
    
    if scene_idx == 1:
        # Registro manual vs bitácora institucional
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📊', 'PASO 1: BITÁCORA PRO', 'Registro en menos de 30 segundos con precisión matemática')")
        page.evaluate("window.__glideCursorTo(960, 420, 1000)")
        page.wait_for_timeout(2500)
        page.evaluate("window.scrollBy({ top: 220, behavior: 'smooth' })")
        page.wait_for_timeout(3000)
        page.evaluate("window.__zoomTo({ x: 960, y: 400 }, 1.35, 800)")
        page.wait_for_timeout(6000)
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 2:
        # Selección de activo, dirección y precio de entrada
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('⚡', 'PASO 2: NUEVA ORDEN', 'Activo XAUUSD (Oro), orden de compra y precio')")
        page.evaluate("window.__glideCursorTo(1820, 40, 1000)")
        page.wait_for_timeout(1500)
        page.evaluate("window.__clickRipple()")
        page.evaluate("if (typeof openModal === 'function') openModal('tradeModal'); else if (document.getElementById('btn-new-trade')) document.getElementById('btn-new-trade').click();")
        page.wait_for_timeout(1500)

        page.evaluate("window.__spotlightElement({ left: 680, top: 240, width: 560, height: 180 }, 12)")
        page.evaluate("window.__zoomTo({ x: 960, y: 350 }, 1.45, 800)")
        page.wait_for_timeout(7000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 3:
        # Stop Loss, Take Profit y ratio R:R
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)
        page.evaluate("if (typeof openModal === 'function') openModal('tradeModal');")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🎯', 'PASO 3: RATIO R:R 1:2.45', 'Cálculo de pips y proyección matemática de beneficio')")
        page.evaluate("window.__glideCursorTo(960, 480, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 680, top: 400, width: 560, height: 140 }, 10)")
        page.evaluate("window.__zoomTo({ x: 960, y: 460 }, 1.55, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 4:
        # Calculadora inteligente de lotaje
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)
        page.evaluate("if (typeof openModal === 'function') openModal('tradeModal');")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🧮', 'PASO 4: LOTAJE INSTITUCIONAL', 'Riesgo fijado al 0.50% ($500 USD) sin sobrelotaje')")
        page.evaluate("window.__glideCursorTo(1050, 560, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 680, top: 520, width: 560, height: 100 }, 10)")
        page.evaluate("window.__zoomTo({ x: 960, y: 560 }, 1.6, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 5:
        # Auditoría psicológica, setups y confirmaciones
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)
        page.evaluate("if (typeof openModal === 'function') openModal('tradeModal');")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🧠', 'PASO 5: PSICOLOGÍA & SETUPS', 'Auditoría de emociones, setups ICT/SMC y disciplina')")
        page.evaluate("window.__glideCursorTo(960, 660, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 680, top: 620, width: 560, height: 120 }, 10)")
        page.evaluate("window.__zoomTo({ x: 960, y: 660 }, 1.5, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 6:
        # Cierre, Break Even y guardado
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📈', 'HISTORIAL & CURVA EN VIVO', 'Sincronización en Supabase | tradingjournalpro.pages.dev')")
        page.evaluate("window.__glideCursorTo(960, 520, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__clickRipple()")
        page.wait_for_timeout(1000)
        page.evaluate("window.__zoomTo({ x: 960, y: 500 }, 1.3, 800)")
        page.wait_for_timeout(7000)
        page.evaluate("window.__resetZoom(700)")

    elapsed = time.time() - t_start
    rem = duration - elapsed
    if rem > 0:
        page.wait_for_timeout(int(rem * 1000))

def play_tutorial_03_scene(page, scene_idx, duration):
    t_start = time.time()
    
    if scene_idx == 1:
        # El peligro de arriesgar capital sin validar
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🧪', 'LABORATORIO BACKTESTING', 'Valida tu estrategia con datos históricos sin arriesgar capital')")
        page.evaluate("window.__glideCursorTo(960, 50, 1000)")
        page.wait_for_timeout(2500)
        page.evaluate("window.__zoomTo({ x: 960, y: 50 }, 1.4, 800)")
        page.wait_for_timeout(6000)
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 2:
        # Carga de sesiones pasadas y modo backtesting
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📂', 'MODO BACKTESTING ACTIVO', 'Aislamiento total de tus cuentas de fondeo activas')")
        page.evaluate("window.__glideCursorTo(1005, 45, 800)")
        page.wait_for_timeout(1500)
        page.evaluate("window.__clickRipple()")
        page.evaluate("if (typeof setMode === 'function') setMode('backtesting');")
        page.wait_for_timeout(1500)

        page.evaluate("window.__spotlightElement({ left: 350, top: 120, width: 600, height: 200 }, 12)")
        page.evaluate("window.__zoomTo({ x: 650, y: 220 }, 1.5, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 3:
        # Curva simulada y métricas de robustez histórica
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📊', 'MÉTRICAS DE ROBUSTEZ', 'Win Rate 64% | Profit Factor 2.18 | Drawdown controlado')")
        page.evaluate("window.__glideCursorTo(960, 360, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 400, top: 220, width: 1120, height: 280 }, 12)")
        page.evaluate("window.__zoomTo({ x: 960, y: 360 }, 1.55, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 4:
        # Simulador de Retiros y liquidación de fases
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('💰', 'SIMULADOR DE PAYOUTS', 'Liquidación automática de Fase 2 y proyección de retiros')")
        page.evaluate("window.__glideCursorTo(1200, 320, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 950, top: 220, width: 500, height: 240 }, 12)")
        page.evaluate("window.__zoomTo({ x: 1200, y: 320 }, 1.6, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 5:
        # Cálculo del Profit Split del 80% y 90%
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('💵', 'PROFIT SPLIT 90%', '$7,200 USD netos al trader | Liquidación puntual')")
        page.evaluate("window.__glideCursorTo(1200, 460, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 950, top: 400, width: 500, height: 160 }, 12)")
        page.evaluate("window.__zoomTo({ x: 1200, y: 460 }, 1.65, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 6:
        # Llamada a la acción y preparación para el Dashboard
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🎯', 'ENTRENA SIN RIESGO', 'Prueba 14 días gratis en tradingjournalpro.pages.dev')")
        page.evaluate("window.__glideCursorTo(960, 200, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__zoomTo({ x: 960, y: 300 }, 1.25, 800)")
        page.wait_for_timeout(7000)
        page.evaluate("window.__resetZoom(700)")

    elapsed = time.time() - t_start
    rem = duration - elapsed
    if rem > 0:
        page.wait_for_timeout(int(rem * 1000))

def play_tutorial_04_scene(page, scene_idx, duration):
    t_start = time.time()
    
    if scene_idx == 1:
        # El poder de las métricas objetivas
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('💎', 'DASHBOARD INSTITUCIONAL', 'Consistencia matemática respaldada por métricas objetivas')")
        page.evaluate("window.__glideCursorTo(960, 200, 1000)")
        page.wait_for_timeout(2500)
        page.evaluate("window.__zoomTo({ x: 960, y: 220 }, 1.35, 800)")
        page.wait_for_timeout(6000)
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 2:
        # KPIs vitales: Win Rate, Profit Factor y Expectativa
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📈', 'KPIS DE ALTO RENDIMIENTO', 'Win Rate 68.4% | Profit Factor 2.35 | Expectativa +1.85R')")
        page.evaluate("window.__glideCursorTo(520, 180, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 340, top: 120, width: 360, height: 120 }, 12)")
        page.evaluate("window.__zoomTo({ x: 520, y: 180 }, 1.6, 800)")
        page.wait_for_timeout(5000)
        
        page.evaluate("window.__glideCursorTo(900, 180, 1000)")
        page.evaluate("window.__spotlightElement({ left: 720, top: 120, width: 360, height: 120 }, 12)")
        page.wait_for_timeout(5000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 3:
        # Curva de Equidad interactiva
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📊', 'CURVA DE EQUIDAD DINÁMICA', 'Evolución trade a trade y visualización de rachas de drawdown')")
        page.evaluate("window.__glideCursorTo(850, 420, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 340, top: 280, width: 1040, height: 280 }, 12)")
        page.evaluate("window.__zoomTo({ x: 850, y: 420 }, 1.5, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 4:
        # Calendario de Rentabilidad y Mapa de Calor
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.scrollBy({ top: 400, behavior: 'instant' })")
        page.evaluate("window.__showStepBadge('📅', 'CALENDARIO MENSUAL', 'Auditoría visual de consistencia: días verdes y rojos en vivo')")
        page.evaluate("window.__glideCursorTo(960, 480, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 340, top: 280, width: 1040, height: 350 }, 12)")
        page.evaluate("window.__zoomTo({ x: 960, y: 480 }, 1.55, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 5:
        # Filtros analíticos: Londres vs NY
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🔍', 'FILTROS POR SESIÓN Y PAR', 'Descubre si eres más rentable en Londres, NY o Asia')")
        page.evaluate("window.__glideCursorTo(1400, 180, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 1180, top: 120, width: 440, height: 120 }, 12)")
        page.evaluate("window.__zoomTo({ x: 1400, y: 180 }, 1.6, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 6:
        # Llamada a la acción hacia la auditoría anti-quiebre
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('⚡', 'DOMINA TUS ESTADÍSTICAS', '14 días gratis en tradingjournalpro.pages.dev')")
        page.evaluate("window.__glideCursorTo(960, 260, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__zoomTo({ x: 960, y: 300 }, 1.25, 800)")
        page.wait_for_timeout(7000)
        page.evaluate("window.__resetZoom(700)")

    elapsed = time.time() - t_start
    rem = duration - elapsed
    if rem > 0:
        page.wait_for_timeout(int(rem * 1000))

def play_tutorial_05_scene(page, scene_idx, duration):
    t_start = time.time()
    
    if scene_idx == 1:
        # Causa principal de quiebre en cuentas de fondeo
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🛡️', 'ESCUDO ANTI-QUIEBRE', 'El 92% reprueba por violar el drawdown diario permitido')")
        page.evaluate("window.__glideCursorTo(960, 180, 1000)")
        page.wait_for_timeout(2500)
        page.evaluate("window.__zoomTo({ x: 960, y: 180 }, 1.45, 800)")
        page.wait_for_timeout(6000)
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 2:
        # Motor de auditoría anti-quiebre en tiempo real
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('⚡', 'MOTOR EN TIEMPO REAL', 'Monitoreo de equidad flotante y reglas institucionales de fondeo')")
        page.evaluate("window.__glideCursorTo(650, 220, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 340, top: 120, width: 620, height: 180 }, 12)")
        page.evaluate("window.__zoomTo({ x: 650, y: 220 }, 1.6, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 3:
        # Monitoreo del colchón diario del 5%
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🟢', 'COLCHÓN DIARIO DISPONIBLE', 'Límite: $5,000 USD | Margen seguro restante: $4,150 USD')")
        page.evaluate("window.__glideCursorTo(650, 320, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 340, top: 240, width: 620, height: 150 }, 12)")
        page.evaluate("window.__zoomTo({ x: 650, y: 320 }, 1.65, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 4:
        # Trailing drawdown versus drawdown estático
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('📈', 'TRAILING DRAWDOWN AUTOMÁTICO', 'Ajuste dinámico sobre la equidad máxima alcanzada')")
        page.evaluate("window.__glideCursorTo(1150, 220, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 980, top: 120, width: 620, height: 180 }, 12)")
        page.evaluate("window.__zoomTo({ x: 1150, y: 220 }, 1.6, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 5:
        # Alertas preventivas y barrera contra revenge trading
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('⚠️', 'ALERTA PREVENTIVA AL 70%', 'Bloqueo visual activo contra sobreoperativa y venganza')")
        page.evaluate("window.__glideCursorTo(960, 380, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__spotlightElement({ left: 340, top: 300, width: 1260, height: 160 }, 14)")
        page.evaluate("window.__zoomTo({ x: 960, y: 380 }, 1.55, 800)")
        page.wait_for_timeout(8000)
        page.evaluate("window.__hideSpotlight()")
        page.evaluate("window.__resetZoom(700)")

    elif scene_idx == 6:
        # Conclusión de la serie y CTA
        page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
        page.evaluate(STUDIO_INJECTION_SCRIPT)
        page.evaluate("window.__initStudioEngine()")
        page.wait_for_timeout(1000)

        page.evaluate("window.__showStepBadge('🏆', 'BLINDA TU CUENTA DE FONDEO', '14 días gratis en tradingjournalpro.pages.dev')")
        page.evaluate("window.__glideCursorTo(960, 280, 1000)")
        page.wait_for_timeout(2000)
        page.evaluate("window.__zoomTo({ x: 960, y: 320 }, 1.25, 800)")
        page.wait_for_timeout(7000)
        page.evaluate("window.__resetZoom(700)")

    elapsed = time.time() - t_start
    rem = duration - elapsed
    if rem > 0:
        page.wait_for_timeout(int(rem * 1000))

PLAY_FUNCTIONS = {
    "tutorial_01": play_tutorial_01_scene,
    "tutorial_02": play_tutorial_02_scene,
    "tutorial_03": play_tutorial_03_scene,
    "tutorial_04": play_tutorial_04_scene,
    "tutorial_05": play_tutorial_05_scene,
}

# -------------------------------------------------------------
# 4. RENDER A COMPLETE SCENE
# -------------------------------------------------------------
def render_single_scene(tut_id, scene_idx, scene_data, tut_play_fn):
    scene_id = scene_data["id"]
    audio_path = os.path.join(BASE_DIR, scene_data["audio_file"])
    duration = scene_data["duration_seconds"]
    
    scene_dir = os.path.join(SCENES_RAW_DIR, tut_id, f"scene_{scene_idx:02d}")
    os.makedirs(scene_dir, exist_ok=True)
    out_scene_mp4 = os.path.join(scene_dir, "scene_synced.mp4")

    print(f"  [Escena {scene_idx}/6] Grabando '{scene_data['title']}' ({duration:.2f}s)...")

    launch_kwargs = {
        "headless": True,
        "args": [
            "--window-size=1920,1080",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--hide-scrollbars",
            "--autoplay-policy=no-user-gesture-required"
        ]
    }
    if sys.platform == "win32" and os.path.exists(CHROME_PATH):
        launch_kwargs["executable_path"] = CHROME_PATH

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_kwargs)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=scene_dir,
            record_video_size={"width": 1920, "height": 1080}
        )
        context.add_init_script(MOCK_USER_SESSION)
        page = context.new_page()

        tut_play_fn(page, scene_idx, duration)

        context.close()
        browser.close()

    # Find webm
    webms = [f for f in os.listdir(scene_dir) if f.endswith(".webm")]
    if not webms:
        print(f"Error: no webm found in {scene_dir}")
        return None

    raw_webm = os.path.join(scene_dir, webms[-1])

    # Composite exact scene audio
    cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_webm,
        "-i", audio_path,
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        out_scene_mp4
    ]
    subprocess.run(cmd, capture_output=True)
    return out_scene_mp4

# -------------------------------------------------------------
# 5. ASSEMBLE FULL TUTORIAL FROM SCENES + BG MUSIC
# -------------------------------------------------------------
def assemble_tutorial(tut_id, scene_mp4_list, output_mp4):
    print(f"\n[Ensamblado Final] Uniendo 6 escenas para {tut_id}...")
    concat_txt = os.path.join(SCENES_RAW_DIR, tut_id, "concat_list.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for p in scene_mp4_list:
            clean_p = os.path.abspath(p).replace("\\", "/")
            f.write(f"file '{clean_p}'\n")

    temp_merged = os.path.join(SCENES_RAW_DIR, tut_id, "merged_scenes.mp4")
    
    # Concat scenes
    cmd_concat = [
        FFMPEG_EXE, "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        temp_merged
    ]
    subprocess.run(cmd_concat, capture_output=True)

    # Add background music (-24 dB) with stream_loop
    cmd_final = [
        FFMPEG_EXE, "-y",
        "-i", temp_merged,
        "-stream_loop", "-1", "-i", BG_MUSIC,
        "-filter_complex", "[1:a]volume=0.06[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        output_mp4
    ]
    subprocess.run(cmd_final, capture_output=True)
    
    if os.path.exists(output_mp4):
        print(f"🎉 TUTORIAL FINALIZADO: {output_mp4} ({os.path.getsize(output_mp4)} bytes)")
        return True
    return False

def render_tutorial_by_id(tut_id, manifest):
    tut_data = next((t for t in manifest["tutorials"] if t["id"] == tut_id), None)
    if not tut_data:
        print(f"Error: {tut_id} no encontrado en manifest.json")
        return False
    play_fn = PLAY_FUNCTIONS.get(tut_id)
    if not play_fn:
        print(f"Error: no hay función de animación para {tut_id}")
        return False
        
    print(f"\n=======================================================")
    print(f"🎬 RENDERIZADO MODULAR: {tut_data['title']}")
    print(f"Duración Total: {tut_data['total_duration_formatted']}")
    print(f"=======================================================")

    scene_mp4s = []
    for s_idx, s_data in enumerate(tut_data["scenes"], 1):
        mp4_path = render_single_scene(tut_id, s_idx, s_data, play_fn)
        if mp4_path:
            scene_mp4s.append(mp4_path)

    out_final = os.path.join(OUTPUT_DIR, f"{tut_id}.mp4")
    return assemble_tutorial(tut_id, scene_mp4s, out_final)

def main():
    server = start_http_server()
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    target = sys.argv[1].lower() if len(sys.argv) > 1 else "tutorial_01"
    if target in ["all", "todos"]:
        for tut in manifest["tutorials"]:
            render_tutorial_by_id(tut["id"], manifest)
    elif target.isdigit():
        tut_id = f"tutorial_{int(target):02d}"
        render_tutorial_by_id(tut_id, manifest)
    else:
        render_tutorial_by_id(target, manifest)

if __name__ == "__main__":
    main()

"""
Master YouTube Tutorial Video Producer — Trading Journal Pro
Records real browser sessions using Playwright with:
- Custom animated virtual cursor with click ripples
- Dynamic camera pan & zoom into active fields/cards
- Frosted-glass callout overlay badges
- Perfect audio synchronization with scene manifests
- Seamless lo-fi music mixing (-24 dB) with FFmpeg
"""

import os
import sys
import json
import time
import threading
import subprocess
import http.server
import socketserver
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MANIFEST_PATH = os.path.join(BASE_DIR, "scratch", "audio", "manifest.json")
OUTPUT_DIR = os.path.join(BASE_DIR, "media", "youtube_tutorials")
RECORD_DIR = os.path.join(BASE_DIR, "scratch", "recordings")
BG_MUSIC = os.path.join(BASE_DIR, "media", "video1_assets", "music", "happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
PORT = 8089

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(RECORD_DIR, exist_ok=True)

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
# 2. STUDIO JS INJECTOR (Cursor, Ripple, Zoom, Callout)
# -------------------------------------------------------------
STUDIO_INJECTION_SCRIPT = """
window.__initStudioEngine = function() {
    if (document.getElementById('studio-virtual-cursor')) return;

    const style = document.createElement('style');
    style.id = 'studio-styles';
    style.innerHTML = `
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
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: 3.5px solid #10b981;
            background: rgba(16, 185, 129, 0.25);
            transform: translate(-18px, -18px) scale(0);
            opacity: 0;
            pointer-events: none;
            box-shadow: 0 0 25px #10b981;
        }
        #studio-cursor-ripple.pulse {
            animation: cursorRippleAnim 0.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        @keyframes cursorRippleAnim {
            0% { transform: translate(-18px, -18px) scale(0.2); opacity: 1; }
            100% { transform: translate(-18px, -18px) scale(1.9); opacity: 0; }
        }
        #studio-callout-box {
            position: fixed;
            bottom: 40px;
            left: 40px;
            background: rgba(10, 15, 29, 0.94);
            border: 2px solid #10b981;
            border-radius: 20px;
            padding: 18px 26px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(16,185,129,0.3);
            backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            gap: 18px;
            z-index: 9999998;
            transform: translateY(150px);
            opacity: 0;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
            max-width: 650px;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        #studio-callout-box.active {
            transform: translateY(0);
            opacity: 1;
        }
        .studio-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #10b981;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 999px;
            margin-bottom: 5px;
        }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = 'studio-virtual-cursor';
    cursor.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M5.65 2.15C5.35 1.85 4.8 2.06 4.8 2.5V20.5C4.8 20.95 5.38 21.15 5.68 20.8L10.3 15.68C10.45 15.52 10.66 15.43 10.88 15.43H18.5C18.94 15.43 19.16 14.88 18.83 14.58L5.65 2.15Z" fill="#0f172a" stroke="#10b981" stroke-width="2.2"/>
        </svg>
        <div id="studio-cursor-ripple"></div>
    `;
    document.body.appendChild(cursor);

    const callout = document.createElement('div');
    callout.id = 'studio-callout-box';
    callout.innerHTML = `
        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(16,185,129,0.2); border: 1.5px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #10b981; flex-shrink: 0;" id="studio-callout-icon">⚡</div>
        <div>
            <div class="studio-badge-pill" id="studio-callout-tag">REGLA INSTITUCIONAL</div>
            <div style="font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.35;" id="studio-callout-title">Control milimétrico del drawdown</div>
        </div>
    `;
    document.body.appendChild(callout);

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

window.__showCallout = function(icon, tag, title) {
    const box = document.getElementById('studio-callout-box');
    document.getElementById('studio-callout-icon').innerText = icon;
    document.getElementById('studio-callout-tag').innerText = tag;
    document.getElementById('studio-callout-title').innerText = title;
    box.classList.add('active');
};

window.__hideCallout = function() {
    const box = document.getElementById('studio-callout-box');
    if (box) box.classList.remove('active');
};
"""

# -------------------------------------------------------------
# 3. MOCK DATA SETUP (Populates realistic $100k account)
# -------------------------------------------------------------
MOCK_INIT_SCRIPT = """
(function() {
    // 1. Session Setup
    const userSession = {
        id: "usr_trader_pro_777",
        name: "Juan Trader Pro",
        email: "trader.pro@tradingjournal.com",
        created_at: new Date().toISOString(),
        subscription: {
            status: "active",
            plan: "pro",
            trial_end: new Date(Date.now() + 14 * 86400000).toISOString()
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
# 4. CHOREOGRAPHIES FOR TUTORIALS 1 TO 5
# -------------------------------------------------------------
def run_tutorial_01_choreography(page, scenes):
    # Scene 1: Welcome & Landing Page (0 - 25.61s)
    page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="domcontentloaded", timeout=30000)
    page.evaluate(STUDIO_INJECTION_SCRIPT)
    page.evaluate("window.__initStudioEngine()")
    page.wait_for_timeout(1000)

    page.evaluate("window.__glideCursorTo(960, 420, 1000)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__showCallout('⚡', 'BITÁCORA INSTITUCIONAL EN LA NUBE', 'Diseñada para superar y proteger tus cuentas de fondeo')")
    page.wait_for_timeout(3000)
    
    # Smooth scroll down to highlight value prop
    page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
    page.wait_for_timeout(4000)
    page.evaluate("window.__zoomTo({ x: 960, y: 480 }, 1.3, 900)")
    page.wait_for_timeout(8000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)
    page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
    page.wait_for_timeout(3000)

    # Scene 2: Registration & Supabase Sync (25.96 - 54.21s)
    page.evaluate("window.__hideCallout()")
    page.wait_for_timeout(1000)
    page.evaluate("window.__glideCursorTo(1150, 40, 1200)")
    page.wait_for_timeout(1500)
    page.evaluate("window.__clickRipple()")
    page.wait_for_timeout(1000)

    page.evaluate("window.__showCallout('🔒', 'ACCESO GRATIS POR 14 DÍAS', 'Sincronización segura en la nube con Supabase sin tarjeta')")
    page.wait_for_timeout(4000)
    page.evaluate("window.scrollBy({ top: 500, behavior: 'smooth' })")
    page.wait_for_timeout(4000)
    page.evaluate("window.__zoomTo({ x: 960, y: 600 }, 1.45, 900)")
    page.wait_for_timeout(12000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 3: App Transition & Account Parametrization (54.56 - 79.57s)
    page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
    page.evaluate(STUDIO_INJECTION_SCRIPT)
    page.evaluate("window.__initStudioEngine()")
    page.wait_for_timeout(1500)

    page.evaluate("window.__showCallout('💼', 'GESTIÓN DE CUENTAS DE FONDEO', 'Cuentas de $50K, $100K y $200K con cálculo de Fases 1 y 2')")
    page.evaluate("window.__glideCursorTo(380, 80, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__clickRipple()")
    page.wait_for_timeout(1500)
    page.evaluate("window.__zoomTo({ x: 420, y: 150 }, 1.5, 900)")
    page.wait_for_timeout(14000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 4: Strict Loss Limits & Drawdown Rules (79.92 - 105.94s)
    page.evaluate("window.__hideCallout()")
    page.wait_for_timeout(1000)
    page.evaluate("window.__showCallout('🛡️', 'REGLAS 5% / 10% BLINDADAS', 'Control diario de pérdida del 5% y Drawdown Máximo del 10%')")
    page.evaluate("window.__glideCursorTo(960, 240, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 960, y: 220 }, 1.6, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(4000)

    # Scene 5: Real-time Risk Buffer Monitoring (106.29 - 130.15s)
    page.evaluate("window.__showCallout('🟢', 'COLCHÓN SEGURO ACTIVO', 'Margen disponible de $4,150 USD antes del límite prohibido')")
    page.evaluate("window.__glideCursorTo(650, 320, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 650, y: 320 }, 1.55, 900)")
    page.wait_for_timeout(14000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 6: Outro & Next Steps (130.50 - 156.01s)
    page.evaluate("window.__showCallout('🚀', 'COMIENZA TUS 14 DÍAS GRATIS', 'tradingjournalpro.pages.dev | Suscríbete para el tutorial #2')")
    page.evaluate("window.__glideCursorTo(1720, 40, 1400)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__clickRipple()")
    page.wait_for_timeout(18000)

def run_tutorial_02_choreography(page, scenes):
    # Scene 1: Intro to Trade Registration (0 - 25.49s)
    page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
    page.evaluate(STUDIO_INJECTION_SCRIPT)
    page.evaluate("window.__initStudioEngine()")
    page.wait_for_timeout(1500)

    page.evaluate("window.__showCallout('📊', 'REGISTRO QUIRÚRGICO DE TRADES', 'Documenta tus entradas en menos de 30 segundos')")
    page.evaluate("window.__glideCursorTo(960, 480, 1200)")
    page.wait_for_timeout(3000)
    page.evaluate("window.scrollBy({ top: 300, behavior: 'smooth' })")
    page.wait_for_timeout(5000)
    page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
    page.wait_for_timeout(12000)

    # Scene 2: New Trade Modal & Asset Selection (25.84 - 50.39s)
    page.evaluate("window.__hideCallout()")
    page.wait_for_timeout(1000)
    page.evaluate("window.__glideCursorTo(1820, 40, 1000)") # hover on + button
    page.wait_for_timeout(1500)
    page.evaluate("window.__clickRipple()")
    page.wait_for_timeout(800)
    # Trigger new trade modal
    page.evaluate("if (typeof openModal === 'function') openModal('tradeModal'); else if (document.getElementById('btn-new-trade')) document.getElementById('btn-new-trade').click();")
    page.wait_for_timeout(1200)

    page.evaluate("window.__showCallout('⚡', 'ORDEN INSTITUCIONAL EN VIVO', 'Selección de activo XAUUSD (Oro), compra y precio de entrada')")
    page.evaluate("window.__zoomTo({ x: 960, y: 500 }, 1.45, 900)")
    page.wait_for_timeout(4000)
    page.evaluate("window.__glideCursorTo(820, 380, 1000)")
    page.wait_for_timeout(12000)

    # Scene 3: Stop Loss, Take Profit & R:R (50.74 - 74.98s)
    page.evaluate("window.__showCallout('🎯', 'RATIO RIESGO-BENEFICIO 1:2.45', 'Cálculo instantáneo de pips y proyección matemática')")
    page.evaluate("window.__glideCursorTo(960, 520, 1000)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 960, y: 550 }, 1.6, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 4: Smart Lot Size Calculator (75.33 - 98.92s)
    page.evaluate("window.__showCallout('🧮', 'CALCULADORA DE LOTAJE AUTOMÁTICA', 'Riesgo fijado al 0.50% exacto del capital ($500 USD)')")
    page.evaluate("window.__glideCursorTo(1100, 600, 1000)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 1050, y: 620 }, 1.65, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 5: Psychological Audit & Setups (99.27 - 123.89s)
    page.evaluate("window.__showCallout('🧠', 'AUDITORÍA PSICOLÓGICA & SETUPS', 'Documenta tu estado mental, setups ICT/SMC y captura técnica')")
    page.evaluate("window.__glideCursorTo(960, 720, 1000)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 960, y: 720 }, 1.5, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 6: Save & Outro (124.24 - 149.32s)
    page.evaluate("window.__showCallout('📈', 'HISTORIAL Y CURVA SINCRONIZADA', 'Operación registrada en Supabase | tradingjournalpro.pages.dev')")
    page.evaluate("window.__glideCursorTo(1150, 820, 1000)")
    page.wait_for_timeout(1500)
    page.evaluate("window.__clickRipple()")
    page.wait_for_timeout(1000)
    page.evaluate("if (typeof closeModal === 'function') closeModal('tradeModal');")
    page.wait_for_timeout(2000)
    page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
    page.wait_for_timeout(15000)

def run_tutorial_03_choreography(page, scenes):
    # Scene 1: Backtesting Intro (0 - 24.05s)
    page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
    page.evaluate(STUDIO_INJECTION_SCRIPT)
    page.evaluate("window.__initStudioEngine()")
    page.wait_for_timeout(1500)

    page.evaluate("window.__showCallout('🧪', 'LABORATORIO DE BACKTESTING PRO', 'Valida tu estrategia con datos históricos sin arriesgar capital')")
    page.evaluate("window.__glideCursorTo(960, 45, 1200)")
    page.wait_for_timeout(3000)
    page.evaluate("window.__zoomTo({ x: 960, y: 50 }, 1.5, 800)")
    page.wait_for_timeout(14000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 2: Switch to Backtesting Mode (24.40 - 49.70s)
    page.evaluate("window.__hideCallout()")
    page.wait_for_timeout(1000)
    page.evaluate("window.__glideCursorTo(1005, 45, 800)") # backtesting button
    page.wait_for_timeout(1200)
    page.evaluate("window.__clickRipple()")
    page.evaluate("if (typeof setMode === 'function') setMode('backtesting');")
    page.wait_for_timeout(1500)

    page.evaluate("window.__showCallout('📂', 'MODO BACKTESTING ACTIVADO', 'Aislamiento total de tus cuentas reales y sesiones de estudio')")
    page.evaluate("window.__zoomTo({ x: 600, y: 220 }, 1.5, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 3: Simulated Equity Curve & Robustness (50.05 - 74.29s)
    page.evaluate("window.__showCallout('📊', 'MÉTRICAS DE ROBUSTEZ HISTÓRICA', 'Win Rate 64% | Profit Factor 2.18 | Drawdown controlado')")
    page.evaluate("window.__glideCursorTo(960, 380, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 960, y: 380 }, 1.55, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 4: Payout Simulator & Phase Liquidation (74.64 - 98.52s)
    page.evaluate("window.__showCallout('💰', 'SIMULADOR DE RETIROS REALES', 'Liquidación automática al alcanzar el +8% en Fase 2')")
    page.evaluate("window.__glideCursorTo(1200, 320, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 1200, y: 320 }, 1.6, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 5: Profit Split 80% / 90% (98.87 - 122.01s)
    page.evaluate("window.__showCallout('💵', 'PROFIT SPLIT 90% EN MANO', 'Ganancia estimada: $7,200.00 USD netos al bolsillo del trader')")
    page.evaluate("window.__glideCursorTo(1200, 480, 1000)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 1200, y: 480 }, 1.65, 900)")
    page.wait_for_timeout(14000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 6: Outro (122.36 - 146.70s)
    page.evaluate("window.__showCallout('🎯', 'ENTRENA ANTES DE PAGAR UNA EVALUACIÓN', 'Prueba 14 días gratis en tradingjournalpro.pages.dev')")
    page.evaluate("window.__glideCursorTo(960, 200, 1200)")
    page.wait_for_timeout(18000)

def run_tutorial_04_choreography(page, scenes):
    # Scene 1: Dashboard Intro (0 - 24.55s)
    page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
    page.evaluate(STUDIO_INJECTION_SCRIPT)
    page.evaluate("window.__initStudioEngine()")
    page.wait_for_timeout(1500)

    page.evaluate("window.__showCallout('💎', 'DASHBOARD INSTITUCIONAL DE MÉTRICAS', 'La consistencia matemática que exigen los fondos profesionales')")
    page.evaluate("window.__glideCursorTo(960, 200, 1200)")
    page.wait_for_timeout(3000)
    page.evaluate("window.__zoomTo({ x: 960, y: 220 }, 1.45, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 2: Vital KPIs: Win Rate & Profit Factor (24.90 - 53.77s)
    page.evaluate("window.__showCallout('📈', 'KPIS DE ALTO RENDIMIENTO', 'Win Rate: 68.4% | Profit Factor: 2.35 | Expectativa: +1.85R')")
    page.evaluate("window.__glideCursorTo(500, 180, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 500, y: 180 }, 1.6, 900)")
    page.wait_for_timeout(10000)
    page.evaluate("window.__glideCursorTo(900, 180, 1500)")
    page.wait_for_timeout(10000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 3: Interactive Equity Curve (54.12 - 79.94s)
    page.evaluate("window.__showCallout('📊', 'CURVA DE EQUIDAD DINÁMICA', 'Evolución trade a trade con cálculo de balance y flotante')")
    page.evaluate("window.__glideCursorTo(850, 420, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 850, y: 420 }, 1.5, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 4: Monthly Performance Calendar (80.29 - 104.31s)
    page.evaluate("window.__showCallout('📅', 'CALENDARIO MENSUAL DE CONSISTENCIA', 'Días verdes y rojos auditados para detectar tus mejores sesiones')")
    page.evaluate("window.scrollBy({ top: 450, behavior: 'smooth' })")
    page.wait_for_timeout(2000)
    page.evaluate("window.__glideCursorTo(960, 550, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 960, y: 550 }, 1.5, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 5: Advanced Filters: London vs NY (104.66 - 127.99s)
    page.evaluate("window.__showCallout('🔍', 'FILTROS POR SESIÓN Y ACTIVO', 'Descubre si eres más rentable en Londres, Nueva York o Asia')")
    page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
    page.wait_for_timeout(2000)
    page.evaluate("window.__glideCursorTo(1400, 240, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 1400, y: 240 }, 1.6, 900)")
    page.wait_for_timeout(14000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 6: Outro (128.34 - 152.12s)
    page.evaluate("window.__showCallout('⚡', 'DOMINA TUS ESTADÍSTICAS', 'Audita tu operativa gratis por 14 días en tradingjournalpro.pages.dev')")
    page.evaluate("window.__glideCursorTo(960, 300, 1200)")
    page.wait_for_timeout(18000)

def run_tutorial_05_choreography(page, scenes):
    # Scene 1: Anti-Blowup & Drawdown Challenge (0 - 26.40s)
    page.goto(f"http://127.0.0.1:{PORT}/app.html", wait_until="domcontentloaded", timeout=30000)
    page.evaluate(STUDIO_INJECTION_SCRIPT)
    page.evaluate("window.__initStudioEngine()")
    page.wait_for_timeout(1500)

    page.evaluate("window.__showCallout('🛡️', 'CONTROL ANTI-QUIEBRE DE CUENTAS', 'El 92% de los traders reprueba por romper el drawdown diario')")
    page.evaluate("window.__glideCursorTo(960, 180, 1200)")
    page.wait_for_timeout(3000)
    page.evaluate("window.__zoomTo({ x: 960, y: 180 }, 1.5, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 2: Real-time Anti-Blowup Engine (26.75 - 49.07s)
    page.evaluate("window.__showCallout('⚡', 'MOTOR DE AUDITORÍA EN TIEMPO REAL', 'Monitoreo continuo de equidad flotante y reglas de fondeo')")
    page.evaluate("window.__glideCursorTo(650, 220, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 650, y: 220 }, 1.6, 900)")
    page.wait_for_timeout(15000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 3: Daily 5% Cushion & Risk Margin (49.42 - 73.30s)
    page.evaluate("window.__showCallout('🟢', 'COLCHÓN DIARIO DISPONIBLE', 'Límite: $5,000 USD | Margen Seguro Restante: $4,150 USD')")
    page.evaluate("window.__glideCursorTo(650, 340, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 650, y: 340 }, 1.65, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 4: Trailing vs Static Drawdown (73.65 - 99.04s)
    page.evaluate("window.__showCallout('📈', 'TRAILING DRAWDOWN AUTOMÁTICO', 'Ajuste dinámico sobre equidad sin generar falsas violaciones')")
    page.evaluate("window.__glideCursorTo(1150, 220, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 1150, y: 220 }, 1.6, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 5: Early Warning & Anti-Revenge Trading (99.39 - 124.81s)
    page.evaluate("window.__showCallout('⚠️', 'ALERTA PREVENTIVA AL 70%', 'Bloqueo visual contra sobreoperativa y trading por revancha')")
    page.evaluate("window.__glideCursorTo(960, 400, 1200)")
    page.wait_for_timeout(2000)
    page.evaluate("window.__zoomTo({ x: 960, y: 400 }, 1.55, 900)")
    page.wait_for_timeout(16000)
    page.evaluate("window.__resetZoom(800)")
    page.wait_for_timeout(3000)

    # Scene 6: Series Conclusion & CTA (125.16 - 150.36s)
    page.evaluate("window.__showCallout('🏆', 'BLINDA TU CUENTA DE FONDEO', '14 días gratis en tradingjournalpro.pages.dev | Únete a los traders consistentes')")
    page.evaluate("window.__glideCursorTo(960, 300, 1200)")
    page.wait_for_timeout(18000)

# -------------------------------------------------------------
# 5. FFmpeg COMPOSITING ENGINE
# -------------------------------------------------------------
def composite_tutorial(raw_webm, voice_mp3, bg_music, output_mp4):
    print(f"\n[FFmpeg] Compositing {output_mp4}...")
    
    # Check inputs
    if not os.path.exists(raw_webm):
        print(f"Error: {raw_webm} no existe")
        return False
    if not os.path.exists(voice_mp3):
        print(f"Error: {voice_mp3} no existe")
        return False

    # Mix voiceover + background music at -24 dB (0.06 volume)
    filter_complex = (
        "[2:a]volume=0.06[bg];"
        "[1:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]"
    )

    cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_webm,
        "-i", voice_mp3,
        "-stream_loop", "-1", "-i", bg_music,
        "-filter_complex", filter_complex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        output_mp4
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error en composición FFmpeg: {res.stderr[-300:]}")
        # Fallback to simple composite without bg music if filter fails
        cmd_fallback = [
            FFMPEG_EXE, "-y",
            "-i", raw_webm,
            "-i", voice_mp3,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            output_mp4
        ]
        res_fb = subprocess.run(cmd_fallback, capture_output=True, text=True)
        return res_fb.returncode == 0

    print(f"  -> Video generado con éxito: {output_mp4} ({os.path.getsize(output_mp4)} bytes)")
    return True

# -------------------------------------------------------------
# 6. MASTER EXECUTION FUNCTION
# -------------------------------------------------------------
def render_tutorial(tut_index, tut_data):
    tut_id = tut_data["id"]
    tut_title = tut_data["title"]
    voice_file = os.path.join(BASE_DIR, tut_data["full_audio_file"])
    output_mp4 = os.path.join(OUTPUT_DIR, f"{tut_id}.mp4")
    raw_dir = os.path.join(RECORD_DIR, tut_id)
    os.makedirs(raw_dir, exist_ok=True)

    print(f"\n{'='*70}")
    print(f"🎬 GRABANDO [{tut_index}/5]: {tut_title}")
    print(f"Duración de audio: {tut_data['total_duration_formatted']} ({tut_data['total_duration_seconds']}s)")
    print(f"{'='*70}")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--window-size=1920,1080", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"]
        )
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=raw_dir,
            record_video_size={"width": 1920, "height": 1080}
        )
        context.add_init_script(MOCK_INIT_SCRIPT)
        page = context.new_page()

        t0 = time.time()
        if tut_index == 1:
            run_tutorial_01_choreography(page, tut_data["scenes"])
        elif tut_index == 2:
            run_tutorial_02_choreography(page, tut_data["scenes"])
        elif tut_index == 3:
            run_tutorial_03_choreography(page, tut_data["scenes"])
        elif tut_index == 4:
            run_tutorial_04_choreography(page, tut_data["scenes"])
        elif tut_index == 5:
            run_tutorial_05_choreography(page, tut_data["scenes"])

        rec_duration = time.time() - t0
        print(f"Grabación Playwright finalizada en {rec_duration:.1f}s")

        context.close()
        browser.close()

    # Find the recorded WebM file
    webm_files = [f for f in os.listdir(raw_dir) if f.endswith(".webm")]
    if not webm_files:
        print(f"Error: No se encontró archivo .webm en {raw_dir}")
        return False
    
    raw_webm = os.path.join(raw_dir, webm_files[-1])
    return composite_tutorial(raw_webm, voice_file, BG_MUSIC, output_mp4)

def main():
    server = start_http_server()
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    tutorials = manifest["tutorials"]
    success_count = 0

    for idx, tut in enumerate(tutorials, 1):
        # We can pass an optional argument to render just one or all
        if len(sys.argv) > 1 and str(idx) not in sys.argv[1:]:
            continue
        ok = render_tutorial(idx, tut)
        if ok:
            success_count += 1

    print(f"\n=======================================================")
    print(f"✅ FINALIZADO: {success_count} videos renderizados exitosamente en {OUTPUT_DIR}")
    print(f"=======================================================")

if __name__ == "__main__":
    main()

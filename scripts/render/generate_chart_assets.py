"""
Generador de Gráficos de TradingView en Alta Definición (1920x1080)
Produce los assets oficiales para AsTrade Video Tutorial #2:
- media/video2_assets/charts/before_setup_eurusd.png
- media/video2_assets/charts/after_fulltp_eurusd.png

Cumple estrictamente con la política ZERO-BLUR (cero filtros de desenfoque).
Tema oscuro nativo TradingView / AsTrade (#131722 / #0b0f19).
"""

import os
import sys
from playwright.sync_api import sync_playwright
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CHARTS_DIR = os.path.join(BASE_DIR, "media", "video2_assets", "charts")
os.makedirs(CHARTS_DIR, exist_ok=True)

BEFORE_PATH = os.path.join(CHARTS_DIR, "before_setup_eurusd.png")
AFTER_PATH = os.path.join(CHARTS_DIR, "after_fulltp_eurusd.png")

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background-color: #131722;
    color: #d1d4dc;
    font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
    user-select: none;
    -webkit-font-smoothing: antialiased;
  }

  /* LAYOUT */
  #app {
    display: flex;
    flex-direction: column;
    width: 1920px;
    height: 1080px;
    background-color: #131722;
  }

  /* TOP TOOLBAR */
  #top-toolbar {
    height: 48px;
    background-color: #1e222d;
    border-bottom: 1px solid #2a2e39;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
    font-size: 14px;
    font-weight: 500;
  }
  .tb-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 4px;
    color: #d1d4dc;
    cursor: pointer;
  }
  .tb-btn.active {
    background-color: #2a2e39;
    color: #2962ff;
  }
  .tb-symbol {
    font-weight: 700;
    font-size: 15px;
    color: #f0f3fa;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tb-symbol .badge {
    background-color: #2a2e39;
    color: #787b86;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .tb-sep {
    width: 1px;
    height: 24px;
    background-color: #2a2e39;
  }
  .tb-publish {
    margin-left: auto;
    background-color: #2962ff;
    color: #ffffff;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* MAIN WORKSPACE */
  #workspace {
    display: flex;
    flex: 1;
    height: calc(1080px - 48px - 32px);
    position: relative;
  }

  /* LEFT DRAWING TOOLBAR */
  #left-toolbar {
    width: 52px;
    background-color: #1e222d;
    border-right: 1px solid #2a2e39;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    gap: 14px;
  }
  .draw-tool {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #787b86;
  }
  .draw-tool.active {
    background-color: #2a2e39;
    color: #2962ff;
    border: 1px solid #2962ff;
  }

  /* CHART AREA */
  #chart-container {
    flex: 1;
    position: relative;
    background-color: #131722;
    overflow: hidden;
  }

  /* WATERMARK */
  #watermark {
    position: absolute;
    top: 50%;
    left: 45%;
    transform: translate(-50%, -50%);
    color: #171c28;
    font-size: 140px;
    font-weight: 900;
    letter-spacing: 2px;
    pointer-events: none;
    z-index: 1;
  }

  /* AS TRADE BRAND BADGE */
  #astrade-badge {
    position: absolute;
    top: 16px;
    left: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: #1e222d;
    border: 1px solid #2a2e39;
    padding: 8px 16px;
    border-radius: 6px;
  }
  .astrade-logo {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 800;
    font-size: 15px;
    color: #10b981;
  }
  .astrade-title {
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    border-left: 1px solid #334155;
    padding-left: 10px;
  }

  /* INDICATORS OVERLAY */
  #indicators-info {
    position: absolute;
    top: 66px;
    left: 20px;
    z-index: 10;
    font-size: 12px;
    font-family: 'Consolas', monospace;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .ind-line {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(30, 34, 45, 0.85);
    padding: 2px 8px;
    border-radius: 3px;
    border-left: 3px solid;
  }

  /* RIGHT PRICE SCALE */
  #price-scale {
    width: 85px;
    background-color: #1e222d;
    border-left: 1px solid #2a2e39;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 0;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #787b86;
  }
  .price-tick {
    position: absolute;
    right: 8px;
    transform: translateY(-50%);
  }
  .price-tag-badge {
    position: absolute;
    right: 0;
    transform: translateY(-50%);
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    border-radius: 3px 0 0 3px;
    z-index: 20;
  }

  /* BOTTOM TIME SCALE */
  #time-scale {
    height: 32px;
    background-color: #1e222d;
    border-top: 1px solid #2a2e39;
    display: flex;
    align-items: center;
    padding-left: 52px;
    padding-right: 85px;
    position: relative;
    font-family: 'Consolas', monospace;
    font-size: 12px;
    color: #787b86;
  }
  .time-tick {
    position: absolute;
    transform: translateX(-50%);
  }

  /* SVG CANVAS */
  #chart-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
  }

  /* ANNOTATION BOXES */
  .anno-card {
    position: absolute;
    background-color: #1e222d;
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    z-index: 15;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
</style>
</head>
<body>
<div id="app">
  <!-- TOP TOOLBAR -->
  <div id="top-toolbar">
    <div class="tb-symbol">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2962ff" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      EURUSD
      <span class="badge">15m</span>
      <span class="badge">OANDA</span>
    </div>
    <div class="tb-sep"></div>
    <div class="tb-btn active">15m</div>
    <div class="tb-btn">1h</div>
    <div class="tb-btn">4h</div>
    <div class="tb-btn">D</div>
    <div class="tb-sep"></div>
    <div class="tb-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-4m4 4v-8m4 8v-12m4 12v-6m4 6v-10"/></svg>
      Velas Japonesas
    </div>
    <div class="tb-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      Indicadores (3)
    </div>
    <div class="tb-publish">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
      Guardar Captura
    </div>
  </div>

  <!-- WORKSPACE -->
  <div id="workspace">
    <!-- LEFT TOOLBAR -->
    <div id="left-toolbar">
      <div class="draw-tool">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>
      </div>
      <div class="draw-tool">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/></svg>
      </div>
      <div class="draw-tool">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
      </div>
      <div class="draw-tool active">
        <!-- Long Position Tool Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
      </div>
      <div class="draw-tool">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
    </div>

    <!-- MAIN CHART -->
    <div id="chart-container">
      <div id="watermark">EURUSD</div>

      <!-- BRAND BADGE -->
      <div id="astrade-badge">
        <div class="astrade-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polygon points="12 2 2 22 22 22 12 2"/></svg>
          AsTrade Bitácora
        </div>
        <div class="astrade-title" id="stage-badge-title">AUDITORÍA DE OPERACIÓN</div>
      </div>

      <!-- INDICATORS DISPLAY -->
      <div id="indicators-info">
        <div class="ind-line" style="border-color: #2962ff; color: #93c5fd;">
          EMA 20 close · <strong>1.08542</strong>
        </div>
        <div class="ind-line" style="border-color: #f59e0b; color: #fde68a;">
          EMA 50 close · <strong>1.08480</strong>
        </div>
        <div class="ind-line" style="border-color: #06b6d4; color: #a5f3fc;">
          Sesión: <strong>New York Open (13:30 - 20:00 UTC)</strong>
        </div>
      </div>

      <!-- DYNAMIC ANNOTATIONS -->
      <div id="dynamic-annotations"></div>

      <!-- SVG RENDERING -->
      <svg id="chart-svg" viewBox="0 0 1783 1000" preserveAspectRatio="none">
        <!-- Grid horizontal -->
        <g stroke="#1e222d" stroke-width="1" stroke-dasharray="2,3">
          <line x1="0" y1="100" x2="1783" y2="100" />
          <line x1="0" y1="200" x2="1783" y2="200" />
          <line x1="0" y1="300" x2="1783" y2="300" />
          <line x1="0" y1="400" x2="1783" y2="400" />
          <line x1="0" y1="500" x2="1783" y2="500" />
          <line x1="0" y1="600" x2="1783" y2="600" />
          <line x1="0" y1="700" x2="1783" y2="700" />
          <line x1="0" y1="800" x2="1783" y2="800" />
          <line x1="0" y1="900" x2="1783" y2="900" />
        </g>
        <!-- Grid vertical -->
        <g stroke="#1e222d" stroke-width="1" stroke-dasharray="2,3">
          <line x1="160" y1="0" x2="160" y2="1000" />
          <line x1="320" y1="0" x2="320" y2="1000" />
          <line x1="480" y1="0" x2="480" y2="1000" />
          <line x1="640" y1="0" x2="640" y2="1000" />
          <line x1="800" y1="0" x2="800" y2="1000" />
          <line x1="960" y1="0" x2="960" y2="1000" />
          <line x1="1120" y1="0" x2="1120" y2="1000" />
          <line x1="1280" y1="0" x2="1280" y2="1000" />
          <line x1="1440" y1="0" x2="1440" y2="1000" />
          <line x1="1600" y1="0" x2="1600" y2="1000" />
        </g>

        <!-- Volume bars at bottom -->
        <g id="volume-bars" opacity="0.45"></g>

        <!-- Dynamic elements: Candles, Long Position Tool, Support Zones -->
        <g id="chart-content"></g>
      </svg>
    </div>

    <!-- RIGHT PRICE SCALE -->
    <div id="price-scale">
      <div class="price-tick" style="top: 80px;">1.09200</div>
      <div class="price-tick" style="top: 160px;">1.09100</div>
      <div class="price-tick" style="top: 240px;">1.09000</div>
      <div class="price-tick" style="top: 320px;">1.08900</div>
      <div class="price-tick" style="top: 400px;">1.08800</div>
      <div class="price-tick" style="top: 480px;">1.08700</div>
      <div class="price-tick" style="top: 560px;">1.08600</div>
      <div class="price-tick" style="top: 640px;">1.08500</div>
      <div class="price-tick" style="top: 720px;">1.08400</div>
      <div class="price-tick" style="top: 800px;">1.08300</div>
      <div class="price-tick" style="top: 880px;">1.08200</div>

      <!-- Specific tags dynamically injected -->
      <div id="price-tags"></div>
    </div>
  </div>

  <!-- BOTTOM TIME SCALE -->
  <div id="time-scale">
    <div class="time-tick" style="left: 160px;">11:30</div>
    <div class="time-tick" style="left: 320px;">12:00</div>
    <div class="time-tick" style="left: 480px;">12:30</div>
    <div class="time-tick" style="left: 640px;">13:00</div>
    <div class="time-tick" style="left: 800px;">13:30 (NY)</div>
    <div class="time-tick" style="left: 960px;">14:00</div>
    <div class="time-tick" style="left: 1120px;">14:30</div>
    <div class="time-tick" style="left: 1280px;">15:00</div>
    <div class="time-tick" style="left: 1440px;">15:30</div>
    <div class="time-tick" style="left: 1600px;">16:00</div>
  </div>
</div>

<script>
// Price to Y mapping (1.08200 = 880px, 1.09200 = 80px)
// dy = 800px for 0.01000 pips -> 80px per 0.00100 (10 pips) -> 8px per pip
function p2y(price) {
  return 880 - (price - 1.08200) * 80000;
}

// Generate Candlestick SVG element
function renderCandle(x, open, high, low, close, width = 20) {
  const isBull = close >= open;
  const color = isBull ? '#089981' : '#f23645';
  const yOpen = p2y(open);
  const yClose = p2y(close);
  const yHigh = p2y(high);
  const yLow = p2y(low);

  const top = Math.min(yOpen, yClose);
  const bodyH = Math.max(Math.abs(yOpen - yClose), 2);

  return `
    <line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="2" />
    <rect x="${x - width/2}" y="${top}" width="${width}" height="${bodyH}" fill="${color}" rx="1" />
  `;
}

// Volume bar
function renderVol(x, height, isBull, width = 18) {
  const color = isBull ? '#089981' : '#f23645';
  return `<rect x="${x - width/2}" y="${1000 - height}" width="${width}" height="${height}" fill="${color}" />`;
}
</script>
</body>
</html>
"""

def generate_charts():
    print("=" * 70)
    print("🎨 GENERANDO ASSETS GRÁFICOS TRADINGVIEW HD (1920x1080) — ZERO-BLUR")
    print("=" * 70)

    # Candlestick base dataset (Asia/London session leading into NY Open)
    # Entry: 1.08500 at x = 860
    # SL: 1.08350 (15 pips)
    # TP: 1.08950 (45 pips)
    base_candles = [
        # (x, open, high, low, close, vol_h)
        (100, 1.08720, 1.08760, 1.08690, 1.08740, 45),
        (140, 1.08740, 1.08790, 1.08710, 1.08770, 50),
        (180, 1.08770, 1.08810, 1.08730, 1.08750, 40),
        (220, 1.08750, 1.08770, 1.08680, 1.08700, 55),
        (260, 1.08700, 1.08730, 1.08640, 1.08660, 60),
        (300, 1.08660, 1.08690, 1.08620, 1.08680, 45),
        (340, 1.08680, 1.08720, 1.08650, 1.08710, 52),
        (380, 1.08710, 1.08740, 1.08670, 1.08690, 48),
        (420, 1.08690, 1.08710, 1.08620, 1.08640, 58),
        (460, 1.08640, 1.08670, 1.08580, 1.08600, 70),
        (500, 1.08600, 1.08630, 1.08560, 1.08570, 65),
        (540, 1.08570, 1.08610, 1.08540, 1.08590, 55),
        (580, 1.08590, 1.08640, 1.08570, 1.08620, 60),
        (620, 1.08620, 1.08650, 1.08580, 1.08600, 62),
        (660, 1.08600, 1.08620, 1.08520, 1.08540, 75),
        (700, 1.08540, 1.08570, 1.08490, 1.08510, 85),
        (740, 1.08510, 1.08550, 1.08470, 1.08480, 95),
        # 780: London Low prior support established at 1.08460
        (780, 1.08480, 1.08520, 1.08460, 1.08500, 80),
        # 820: NY Open (13:30) Liquidity Sweep: Deep spike down to 1.08390 sweeping stops!
        (820, 1.08500, 1.08510, 1.08390, 1.08430, 180),
        # 860: Bullish Rejection Pinbar closing at 1.08500 -> ENTRY CANDLE (Market Buy)
        (860, 1.08430, 1.08520, 1.08400, 1.08500, 195)
    ]

    # Additional candles for the AFTER chart leading up to Full TP (1.08950)
    after_candles = [
        # 900: Follow-through green candle
        (900, 1.08500, 1.08590, 1.08490, 1.08580, 120),
        # 940: Strong impulse
        (940, 1.08580, 1.08660, 1.08560, 1.08650, 135),
        # 980: Pullback / higher low
        (980, 1.08650, 1.08680, 1.08610, 1.08630, 90),
        # 1020: Continuation green
        (1020, 1.08630, 1.08720, 1.08620, 1.08710, 115),
        # 1060: Expansion through Asia range
        (1060, 1.08710, 1.08790, 1.08690, 1.08780, 140),
        # 1100: Bullish candle
        (1100, 1.08780, 1.08840, 1.08760, 1.08830, 130),
        # 1140: Minor pause
        (1140, 1.08830, 1.08860, 1.08800, 1.08820, 85),
        # 1180: Strong momentum
        (1180, 1.08820, 1.08900, 1.08810, 1.08890, 155),
        # 1220: Surge hitting Full TP at 1.08950! High wick 1.08980
        (1220, 1.08890, 1.08980, 1.08880, 1.08960, 210),
        # 1260: Consolidation after TP hit
        (1260, 1.08960, 1.08970, 1.08910, 1.08930, 110)
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)

        # -------------------------------------------------------------
        # 1. GENERATE BEFORE CHART: before_setup_eurusd.png
        # -------------------------------------------------------------
        print("\n📸 Generando Chart 1: BEFORE Setup (EURUSD 15M)...")
        page.set_content(HTML_TEMPLATE)

        # Inject Before Setup specifics via Javascript
        page.evaluate("""({base_candles}) => {
          document.getElementById('stage-badge-title').innerText = 'TESIS TÉCNICA Y SETUP ANTES DE ENTRAR';

          // Render base candles
          let candlesHtml = '';
          let volHtml = '';
          base_candles.forEach(([x, o, h, l, c, vol]) => {
            candlesHtml += renderCandle(x, o, h, l, c);
            volHtml += renderVol(x, vol, c >= o);
          });

          // Support / Liquidity zone box (1.08460 - 1.08390)
          const ySupTop = p2y(1.08470);
          const ySupBot = p2y(1.08390);
          const supHeight = ySupBot - ySupTop;

          // TradingView Long Position Tool:
          // Entry: 1.08500 (y = 640)
          // TP: 1.08950 (y = 280, height = 360px)
          // SL: 1.08350 (y = 760, height = 120px)
          const yEntry = p2y(1.08500);
          const yTP = p2y(1.08950);
          const ySL = p2y(1.08350);
          const tpH = yEntry - yTP;
          const slH = ySL - yEntry;

          const toolHtml = `
            <!-- Support zone / SSL Sweep Zone -->
            <rect x="680" y="${ySupTop}" width="340" height="${supHeight}" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,4" rx="2" />
            <text x="690" y="${ySupTop + 16}" fill="#60a5fa" font-size="12" font-family="'Consolas', monospace" font-weight="bold">💧 SSL Sweep & Key Support (1.08460)</text>

            <!-- LONG POSITION TOOL -->
            <!-- Profit Target Zone (Green) -->
            <rect x="860" y="${yTP}" width="650" height="${tpH}" fill="#089981" fill-opacity="0.18" stroke="#089981" stroke-width="2" />
            <line x1="860" y1="${yTP}" x2="1510" y2="${yTP}" stroke="#089981" stroke-width="2.5" />

            <!-- Stop Loss Zone (Red) -->
            <rect x="860" y="${yEntry}" width="650" height="${slH}" fill="#f23645" fill-opacity="0.18" stroke="#f23645" stroke-width="2" />
            <line x1="860" y1="${ySL}" x2="1510" y2="${ySL}" stroke="#f23645" stroke-width="2.5" />

            <!-- Entry Line (White/Blue) -->
            <line x1="850" y1="${yEntry}" x2="1510" y2="${yEntry}" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="3,3" />

            <!-- Long Position Label on Box -->
            <rect x="870" y="${yEntry - 28}" width="280" height="24" fill="#1e222d" stroke="#2962ff" stroke-width="1.5" rx="3" />
            <text x="880" y="${yEntry - 12}" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif">🎯 Market Buy @ 1.08500 · 6.66 lotes</text>

            <!-- Target Header in Box -->
            <rect x="870" y="${yTP + 8}" width="360" height="26" fill="#089981" rx="3" />
            <text x="880" y="${yTP + 26}" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif">OBJETIVO: 1.08950 (+45.0 pips / +3.00%) · R:R 3.00</text>

            <!-- Stop Header in Box -->
            <rect x="870" y="${ySL - 32}" width="300" height="24" fill="#f23645" rx="3" />
            <text x="880" y="${ySL - 16}" fill="#ffffff" font-size="12" font-weight="bold" font-family="sans-serif">STOP LOSS: 1.08350 (-15.0 pips / -1.00%)</text>

            <!-- Sweep Annotation Arrow -->
            <path d="M 820 780 L 820 730" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow)" />
            <circle cx="820" cy="735" r="4" fill="#f59e0b" />
          `;

          document.getElementById('chart-content').innerHTML = candlesHtml + toolHtml;
          document.getElementById('volume-bars').innerHTML = volHtml;

          // Price tags
          document.getElementById('price-tags').innerHTML = `
            <div class="price-tag-badge" style="top: ${yTP}px; background-color: #089981;">1.08950 TP</div>
            <div class="price-tag-badge" style="top: ${yEntry}px; background-color: #2962ff;">1.08500 ENTRY</div>
            <div class="price-tag-badge" style="top: ${ySL}px; background-color: #f23645;">1.08350 SL</div>
          `;

          // Annotations Callout Cards (Zero-Blur crisp badges)
          document.getElementById('dynamic-annotations').innerHTML = `
            <div class="anno-card" style="top: 220px; left: 880px; border-left: 4px solid #10b981;">
              <div style="color: #10b981; font-size: 13px; font-weight: 800; margin-bottom: 4px;">⚡ REGLA DE RIESGO 1.0% · BALANCE $100,000 USD</div>
              <div style="color: #e2e8f0; font-size: 12px;">Riesgo Máximo: <strong>$1,000 USD</strong> (15 pips SL = 6.66 lotes)</div>
              <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">Ganancia Esperada: <strong>+$3,000 USD</strong> (45 pips TP = Ratio 1:3.0)</div>
            </div>

            <div class="anno-card" style="top: 760px; left: 520px; border-left: 4px solid #f59e0b;">
              <div style="color: #fbbf24; font-size: 12px; font-weight: 700;">💧 Tesis de Entrada:</div>
              <div style="color: #cbd5e1; font-size: 11px;">1. Quiebre de estructura y barrida de mínimos de Londres.</div>
              <div style="color: #cbd5e1; font-size: 11px;">2. Rechazo alcista en zona de demanda (1.08400).</div>
              <div style="color: #10b981; font-size: 11px; font-weight: 700;">3. Orden Market Buy confirmada a favor de tendencia NY.</div>
            </div>
          `;
        }""", {"base_candles": base_candles})

        page.screenshot(path=BEFORE_PATH, full_page=True)
        print(f"✅ Chart BEFORE guardado exitosamente: {BEFORE_PATH}")

        # -------------------------------------------------------------
        # 2. GENERATE AFTER CHART: after_fulltp_eurusd.png
        # -------------------------------------------------------------
        print("\n📸 Generando Chart 2: AFTER Full TP (EURUSD 15M)...")

        # Inject After Full TP specifics via Javascript
        all_candles = base_candles + after_candles

        page.evaluate("""({all_candles}) => {
          document.getElementById('stage-badge-title').innerText = 'AUDITORÍA POST-TRADE · CIERRE EN FULL TP (+3.00%)';

          // Render all candles
          let candlesHtml = '';
          let volHtml = '';
          all_candles.forEach(([x, o, h, l, c, vol]) => {
            candlesHtml += renderCandle(x, o, h, l, c);
            volHtml += renderVol(x, vol, c >= o);
          });

          const yEntry = p2y(1.08500);
          const yTP = p2y(1.08950);
          const ySL = p2y(1.08350);
          const tpH = yEntry - yTP;
          const slH = ySL - yEntry;

          const toolHtml = `
            <!-- Support zone / SSL Sweep Zone -->
            <rect x="680" y="${p2y(1.08470)}" width="340" height="${p2y(1.08390) - p2y(1.08470)}" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3,3" rx="2" />

            <!-- COMPLETED LONG POSITION TOOL -->
            <!-- Profit Target Zone (Full Green Victory) -->
            <rect x="860" y="${yTP}" width="420" height="${tpH}" fill="#089981" fill-opacity="0.28" stroke="#089981" stroke-width="2.5" />
            <line x1="860" y1="${yTP}" x2="1320" y2="${yTP}" stroke="#10b981" stroke-width="3" />

            <!-- Stop Loss Zone (Protected - Never touched) -->
            <rect x="860" y="${yEntry}" width="420" height="${slH}" fill="#f23645" fill-opacity="0.10" stroke="#f23645" stroke-width="1.5" stroke-dasharray="3,3" />
            <line x1="860" y1="${ySL}" x2="1280" y2="${ySL}" stroke="#f23645" stroke-width="1.5" />

            <!-- Entry Line -->
            <line x1="850" y1="${yEntry}" x2="1280" y2="${yEntry}" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2,2" />

            <!-- TP HIT BANNER ON CANDLE 1220 -->
            <circle cx="1220" cy="${yTP}" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2" />
            <line x1="1220" y1="${yTP}" x2="1220" y2="${yTP - 55}" stroke="#10b981" stroke-width="2.5" />

            <!-- Big Victory Tag at TP Exit -->
            <rect x="1100" y="${yTP - 90}" width="250" height="34" fill="#089981" stroke="#10b981" stroke-width="2" rx="4" />
            <text x="1115" y="${yTP - 68}" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif">🎯 FULL TP HIT @ 1.08950</text>
          `;

          document.getElementById('chart-content').innerHTML = candlesHtml + toolHtml;
          document.getElementById('volume-bars').innerHTML = volHtml;

          // Price tags
          document.getElementById('price-tags').innerHTML = `
            <div class="price-tag-badge" style="top: ${yTP}px; background-color: #089981; font-weight: 800;">1.08950 TP HIT</div>
            <div class="price-tag-badge" style="top: ${yEntry}px; background-color: #2962ff;">1.08500 ENTRY</div>
            <div class="price-tag-badge" style="top: ${ySL}px; background-color: #787b86;">1.08350 SL</div>
          `;

          // Post-Trade Audit Summary Badges (Zero-Blur Standard)
          document.getElementById('dynamic-annotations').innerHTML = `
            <div class="anno-card" style="top: 100px; left: 880px; border-left: 5px solid #10b981; background-color: #1a202c; border: 1px solid #10b981;">
              <div style="color: #10b981; font-size: 15px; font-weight: 900; margin-bottom: 6px;">
                ✅ AUDITORÍA DE RESULTADO: GANADORA (+3.00%)
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 12px; color: #e2e8f0;">
                <div>• PnL Neto: <strong style="color: #10b981; font-size: 13px;">+$3,000.00 USD</strong></div>
                <div>• Retorno Cuenta: <strong style="color: #10b981; font-size: 13px;">+3.00%</strong></div>
                <div>• Ratio R:R Ejecutado: <strong style="color: #eab308;">1:3.00</strong></div>
                <div>• Pips Capturados: <strong style="color: #38bdf8;">+45.0 pips</strong></div>
                <div>• Lotes Operados: <strong>6.66 lotes</strong></div>
                <div>• Drawdown Sufrido: <strong style="color: #10b981;">0.00 pips (0.0%)</strong></div>
              </div>
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #2d3748; color: #94a3b8; font-size: 11px;">
                Nuevo Balance de Cuenta: <strong style="color: #ffffff;">$103,000.00 USD</strong> | Meta Fondeo: <strong>37.5% Completada</strong>
              </div>
            </div>

            <div class="anno-card" style="top: 760px; left: 900px; border-left: 4px solid #38bdf8;">
              <div style="color: #38bdf8; font-size: 12px; font-weight: 700;">📝 Nota de Gestión Psicológica y Plan:</div>
              <div style="color: #cbd5e1; font-size: 11px;">• Plan ejecutado con 100% de disciplina institucional.</div>
              <div style="color: #cbd5e1; font-size: 11px;">• Cero intromisión en el trade ni movimiento prematuro de stop.</div>
              <div style="color: #10b981; font-size: 11px; font-weight: 700;">• Salida automática y limpia en Full TP en sesión New York.</div>
            </div>
          `;
        }""", {"all_candles": all_candles})

        page.screenshot(path=AFTER_PATH, full_page=True)
        print(f"✅ Chart AFTER guardado exitosamente: {AFTER_PATH}")

        browser.close()

    # Verify both images using PIL
    print("\n🔍 VERIFICACIÓN TÉCNICA DE IMÁGENES:")
    for name, pth in [("BEFORE", BEFORE_PATH), ("AFTER", AFTER_PATH)]:
        if not os.path.exists(pth):
            raise FileNotFoundError(f"No se encontró el archivo generado: {pth}")
        sz = os.path.getsize(pth)
        with Image.open(pth) as img:
            w, h = img.size
            fmt = img.format
        print(f"   [{name}] Path: {pth}")
        print(f"           Dimensiones: {w}x{h} px | Formato: {fmt} | Peso: {sz/1024:.2f} KB ({sz} bytes)")
        assert w == 1920 and h == 1080, f"Dimensiones incorrectas: {w}x{h}"
        assert sz > 50000, f"El archivo pesa demasiado poco ({sz} bytes)"

    print("\n" + "=" * 70)
    print("🎉 GENERACIÓN DE ASSETS GRÁFICOS COMPLETADA CON ÉXITO")
    print("=" * 70)

if __name__ == "__main__":
    generate_charts()

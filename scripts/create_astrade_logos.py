import os
import math

def create_concept_a():
    """
    Concept A: 'The Institutional Apex' (El Ápice Institucional)
    A sharp, architectural 'A' formed by precision geometric facets.
    The left and right wings converge at a modern apex, while the crossbar
    is a dynamic forward-leaning chevron representing alpha and upward trajectory.
    """
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="apex_left" x1="120" y1="420" x2="256" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="60%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
    <linearGradient id="apex_right" x1="392" y1="420" x2="256" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#065f46"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="apex_chevron" x1="170" y1="300" x2="342" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
  </defs>
  <!-- Left Ascending Pylon -->
  <path d="M256 86 L108 426 H188 L256 260 L256 86 Z" fill="url(#apex_left)"/>
  <!-- Right Descending Pylon (Creates depth and precision facet) -->
  <path d="M256 86 L256 260 L324 426 H404 L256 86 Z" fill="url(#apex_right)"/>
  <!-- Dynamic Trend Crossbar (Chevron Key) -->
  <path d="M172 328 L256 272 L340 328 L320 368 L256 324 L192 368 Z" fill="url(#apex_chevron)"/>
</svg>'''
    return svg

def create_concept_b():
    """
    Concept B: 'The Sovereign Alpha' (El Lazo Soberano A + S)
    Continuous geometric ribbon connecting an 'A' frame with an integrated 'S' curve.
    Evokes an institutional hedge fund / private prop firm seal.
    """
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="sovereign_grad" x1="90" y1="420" x2="422" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="40%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#6ee7b7"/>
    </linearGradient>
    <linearGradient id="sovereign_sub" x1="200" y1="200" x2="360" y2="360" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <!-- Outer Arch of the A -->
  <path d="M256 80 C272 80 286 90 294 106 L418 396 C424 410 414 426 398 426 H334 C322 426 312 418 306 406 L278 340 H180 L256 160 L204 290 L168 376 C162 390 148 400 134 400 H112 C96 400 86 384 92 370 L218 106 C226 90 240 80 256 80 Z" fill="url(#sovereign_grad)"/>
  <!-- Interlocking S-Wave Crossbar -->
  <path d="M192 310 C216 280 250 270 280 278 C306 286 324 308 348 316 C370 324 394 316 410 300 L426 328 C402 352 370 360 340 350 C314 340 298 320 272 312 C248 304 224 312 206 332 Z" fill="url(#sovereign_sub)"/>
</svg>'''
    return svg

def create_concept_c():
    """
    Concept C: 'The Quantitative Monogram' (El Monograma Cuantitativo)
    Minimalist, razor-clean triple chevron forming an elite 'A' that rises with stepped tiers,
    resembling a financial candlestick progression and an unmistakable modern tech letterform.
    """
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="quant_1" x1="140" y1="410" x2="372" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <linearGradient id="quant_2" x1="256" y1="100" x2="256" y2="410" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <!-- Top Apex Chevron -->
  <path d="M256 90 L346 220 H286 L256 174 L226 220 H166 Z" fill="url(#quant_2)"/>
  <!-- Middle Bar Tier (Breakout Level) -->
  <path d="M256 220 L376 300 H316 L256 260 L196 300 H136 Z" fill="url(#quant_1)"/>
  <!-- Foundation Wings -->
  <path d="M256 304 L406 412 H338 L256 348 L174 412 H106 Z" fill="url(#quant_1)"/>
</svg>'''
    return svg

def main():
    os.makedirs("assets/logo", exist_ok=True)
    with open("assets/logo/concept-a.svg", "w", encoding="utf-8") as f:
        f.write(create_concept_a())
    with open("assets/logo/concept-b.svg", "w", encoding="utf-8") as f:
        f.write(create_concept_b())
    with open("assets/logo/concept-c.svg", "w", encoding="utf-8") as f:
        f.write(create_concept_c())
    print("Logos created in assets/logo/")

if __name__ == "__main__":
    main()

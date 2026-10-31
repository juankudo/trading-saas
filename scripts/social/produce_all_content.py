"""
Master Content Factory — Producción Automatizada de Tutoriales y Shorts
Trading Journal Pro
Genera locuciones neuronales con edge_tts (Dalia), composiciones de video
y paquetes de metadatos SEO para YouTube, TikTok e Instagram.
"""

import os
import asyncio
import json
import edge_tts

VOICE = "es-MX-DaliaNeural"

# ==============================================================================
# 1. SHORT 2: Calculadora de Lotaje en Oro (XAUUSD)
# ==============================================================================
SHORT_02 = {
    "id": "short_02_calculadora_lotaje",
    "title_youtube": "Calcula tu LOTAJE exacto en ORO (XAUUSD) en 3 segundos ⚡ #Shorts",
    "title_tiktok": "No quemes tu cuenta calculando lotes a ojo ⚡ #trading #xauusd #gold",
    "title_instagram": "Cómo calcular tu lotaje exacto en Oro en 3 segundos ⚖️ #tradingtips",
    "duration": 36,
    "script": (
        "¿Sigues calculando lotes a ojo o con calculadoras lentas de internet? "
        "En el oro, un error de cero coma diez lotes te puede costar la prueba de fondeo en un solo mechazo. "
        "Con Trading Journal Pro, seleccionas tu riesgo exacto, ya sea el uno por ciento o cincuenta dólares, "
        "marcas tu stop loss en pips y la bitácora te entrega el lotaje institucional exacto al tick. "
        "Sin fallas matemáticas ni cuentas quemadas por sobreapalancamiento. "
        "Empieza catorce días gratis hoy mismo en tradingjournalpro.pages.dev."
    ),
    "cues": [
        {"time": 0.0, "text": "¿SIGUES CALCULANDO LOTES A OJO?", "scene": "danger"},
        {"time": 4.5, "text": "EN EL ORO, UN ERROR DE 0.10 TE CUESTA LA CUENTA.", "scene": "gold_volatility"},
        {"time": 10.0, "text": "CON TRADING JOURNAL PRO ELIGES TU RIESGO EXACTO (1%).", "scene": "calculator"},
        {"time": 17.5, "text": "COLOCAS TU STOP LOSS Y OBTIENES TU LOTAJE AL TICK.", "scene": "exact_lots"},
        {"time": 24.5, "text": "CERO SOBREAPALANCAMIENTO Y MÁXIMA PRECISIÓN.", "scene": "safe_badge"},
        {"time": 29.5, "text": "PRUEBA 14 DÍAS GRATIS EN TRADINGJOURNALPRO.PAGES.DEV", "scene": "cta"}
    ],
    "hashtags": ["#trading", "#xauusd", "#goldtrading", "#lotcalculator", "#cuentasdefondeo", "#propfirms", "#gestionderiesgo"],
    "cta_url": "https://tradingjournalpro.pages.dev"
}

# ==============================================================================
# 2. SHORT 3: Simulador de Retiros (Payouts 80/20)
# ==============================================================================
SHORT_03 = {
    "id": "short_03_simulador_retiros",
    "title_youtube": "Simula tu RETIRO de dinero real antes de pagar tu prueba 💰 #Shorts",
    "title_tiktok": "¿Cuánto dinero te queda en mano tras pasar una cuenta de 100K? 💰 #trading",
    "title_instagram": "Simulador de Retiros y Profit Split para Prop Firms 💵 #payout",
    "duration": 35,
    "script": (
        "¿Sabías exactamente cuánto dinero real te llevas al bolsillo al pasar tu desafío de cien mil dólares? "
        "Muchos traders solo miran pips, pero lo importante es tu dinero en mano. "
        "En el Laboratorio de Backtesting Pro de Trading Journal Pro, simulas tu solicitud de retiro con el Profit Split real del ochenta o noventa por ciento. "
        "Comprueba si tu estrategia supera las metas de fondeo antes de pagar una sola evaluación. "
        "Audita tu consistencia y prueba catorce días gratis en el enlace del perfil."
    ),
    "cues": [
        {"time": 0.0, "text": "¿CUÁNTO DINERO TE LLEVAS AL BOLSILLO EN UNA CUENTA 100K?", "scene": "money_hook"},
        {"time": 5.5, "text": "NO SOLO MIRES PIPS: SIMULA TU DINERO EN MANO.", "scene": "payout_concept"},
        {"time": 11.5, "text": "EL LABORATORIO DE BACKTESTING LIQUIDA TU PROFIT SPLIT (80/20).", "scene": "split_simulation"},
        {"time": 19.0, "text": "COMPRUEBA SI CUMPLES LAS REGLAS ANTES DE PAGAR EL DESAFÍO.", "scene": "rules_audit"},
        {"time": 26.5, "text": "AUDITA TU CONSISTENCIA 14 DÍAS GRATIS.", "scene": "cta"}
    ],
    "hashtags": ["#payout", "#tradingretiros", "#propfirms", "#backtesting", "#tradingjournal", "#cuentasdefondeo", "#finanzas"],
    "cta_url": "https://tradingjournalpro.pages.dev"
}

# ==============================================================================
# 3. YOUTUBE TUTORIAL 2: Registro de Trades y Métricas R:R
# ==============================================================================
TUTORIAL_02 = {
    "id": "tutorial_02_registro_trades",
    "title": "Cómo Registrar y Auditar Trades con Precisión Quirúrgica | Trading Journal Pro",
    "duration": 150,
    "script": (
        "Te damos la bienvenida al segundo tutorial oficial de Trading Journal Pro. "
        "Una bitácora de trading solo es efectiva si registrar una operación toma menos de treinta segundos y no interrumpe tu operativa. "
        "En este video, aprenderemos a registrar una operación completa, adjuntar tu análisis técnico y auditar el ratio riesgo-beneficio en tiempo real. "
        "Hacemos clic en el botón 'Nueva Entrada' en la esquina superior derecha. "
        "Seleccionamos el símbolo, por ejemplo XAUUSD o EURUSD, la dirección de compra o venta, y definimos el precio de entrada junto con nuestro stop loss y take profit. "
        "Observa cómo la plataforma calcula de forma instantánea la distancia en pips y proyecta tu ratio riesgo-beneficio exacto, como uno a dos coma cuatro. "
        "Además, puedes adjuntar la captura del gráfico para documentar el setup institucional y escribir notas psicológicas sobre tu ejecución. "
        "Al guardar, tu balance, tu porcentaje de ganancia y tu curva de equidad se actualizan automáticamente en Supabase y quedan respaldados en la nube. "
        "Comienza hoy a registrar tus trades con estándar institucional en tradingjournalpro.pages.dev con catorce días de prueba gratis. "
        "Suscríbete al canal para el Video 3: Laboratorio de Backtesting Pro."
    )
}

async def produce_audio(text, out_path):
    print(f"Generando locución: {out_path}...")
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(out_path)
    print(f"✔ Audio generado: {out_path} ({os.path.getsize(out_path)} bytes)")

def build_vertical_html(meta, out_file):
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0">
    <title>{meta['title_youtube']}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {{ margin: 0; padding: 0; width: 1080px; height: 1920px; background: #050811; font-family: system-ui, sans-serif; overflow: hidden; user-select: none; }}
        .glass-card {{ background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(24px); border: 2px solid rgba(51, 65, 85, 0.85); box-shadow: 0 25px 50px rgba(0,0,0,0.8); }}
        .tiktok-sub {{ text-shadow: 0 4px 12px rgba(0,0,0,0.95); -webkit-text-stroke: 1px black; }}
    </style>
</head>
<body class="relative flex flex-col justify-between p-12">
    <!-- Header -->
    <header class="relative z-20 flex items-center justify-between pt-6">
        <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-gray-950 flex items-center justify-center text-2xl font-black">
                <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
                <span class="text-2xl font-black text-white">TRADING JOURNAL <span class="text-emerald-400">PRO</span></span>
                <p class="text-sm text-gray-400 font-semibold">@tradingjournalpro</p>
            </div>
        </div>
        <div class="px-4 py-2 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 text-sm font-mono font-bold">
            PRO TIPS
        </div>
    </header>

    <!-- Main Visual Card -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center my-8">
        <div id="card-stage" class="w-[960px] glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div class="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-5xl text-emerald-400 mb-8 animate-bounce">
                <i class="fa-solid fa-bolt"></i>
            </div>
            <h2 class="text-5xl font-black text-white leading-tight mb-6">
                {meta['title_tiktok']}
            </h2>
            <div class="px-8 py-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-2xl font-mono font-bold mb-6">
                tradingjournalpro.pages.dev
            </div>
            <div class="text-xl text-gray-300 font-semibold">
                14 Días Gratis · Sin pagos hoy · Respaldo en la nube
            </div>
        </div>
    </main>

    <!-- Footer Subtitles -->
    <footer class="relative z-20 pb-8 flex flex-col items-center text-center">
        <div class="w-[980px] bg-black/90 border-2 border-yellow-400 p-6 rounded-3xl shadow-2xl mb-4">
            <p id="sub-text" class="text-3xl font-black text-yellow-300 uppercase tiktok-sub">
                {meta['cues'][0]['text']}
            </p>
        </div>
        <button onclick="toggleAudio()" id="play-btn" class="px-6 py-2.5 rounded-xl bg-emerald-500 text-gray-950 font-black text-sm flex items-center gap-2">
            <i class="fa-solid fa-play"></i> Reproducir Short
        </button>
    </footer>

    <audio id="audio" src="{meta['id']}_voice.mp3" preload="auto"></audio>
    <script>
        const audio = document.getElementById('audio');
        const sub = document.getElementById('sub-text');
        const playBtn = document.getElementById('play-btn');
        const cues = {json.dumps(meta['cues'])};

        function toggleAudio() {{
            if (audio.paused) {{
                audio.play();
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
            }} else {{
                audio.pause();
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reproducir Short';
            }}
        }}

        audio.addEventListener('timeupdate', () => {{
            const t = audio.currentTime;
            for (let i = cues.length - 1; i >= 0; i--) {{
                if (t >= cues[i].time) {{
                    sub.textContent = cues[i].text;
                    break;
                }}
            }}
        }});
    </script>
</body>
</html>"""
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✔ HTML Vertical generado: {out_file}")

async def main():
    os.makedirs("media/shorts", exist_ok=True)
    os.makedirs("media/video2_studio", exist_ok=True)
    os.makedirs("scratch/video2", exist_ok=True)

    print("=" * 70)
    print(" 🚀 FÁBRICA MULTI-AGENTE: PRODUCCIÓN EN MASA DE CONTENIDO")
    print("=" * 70)

    # 1. Producir Short 2
    s2_audio = "media/shorts/short_02_voice.mp3"
    await produce_audio(SHORT_02["script"], s2_audio)
    build_vertical_html(SHORT_02, "media/shorts/short_02_vertical.html")
    with open("media/shorts/short_02_metadata.json", "w", encoding="utf-8") as f:
        json.dump(SHORT_02, f, ensure_ascii=False, indent=2)

    # 2. Producir Short 3
    s3_audio = "media/shorts/short_03_voice.mp3"
    await produce_audio(SHORT_03["script"], s3_audio)
    build_vertical_html(SHORT_03, "media/shorts/short_03_vertical.html")
    with open("media/shorts/short_03_metadata.json", "w", encoding="utf-8") as f:
        json.dump(SHORT_03, f, ensure_ascii=False, indent=2)

    # 3. Producir Tutorial 2 YouTube
    t2_audio = "scratch/video2/video2_full_voiceover.mp3"
    await produce_audio(TUTORIAL_02["script"], t2_audio)

    t2_meta_md = f"""# Metadatos Oficiales para YouTube — Video 2

## 📌 Título del Video
> **{TUTORIAL_02['title']}**

---

## 📝 Descripción del Video (Copy & SEO)

¿Registrar operaciones te toma demasiado tiempo o interrumpe tu análisis técnico? En este segundo tutorial oficial de **Trading Journal Pro** aprenderás a registrar un trade completo en menos de 30 segundos, calcular tu ratio riesgo-beneficio exacto (R:R) y documentar tus entradas con capturas de pantalla de alta resolución.

👉 **Comienza tus 14 días gratis aquí:** https://tradingjournalpro.pages.dev

### ⏱️ Marcas de Tiempo:
- **0:00** — Importancia del registro rápido sin fricción
- **0:30** — Formulario de Nueva Entrada (Símbolo, Precio y Pips)
- **1:00** — Cálculo automático de Ratio Riesgo-Beneficio (R:R)
- **1:35** — Adjuntar Gráfico de Análisis Técnico y Notas
- **2:05** — Sincronización en vivo con Supabase y Curva de Equidad

#Trading #TradingJournal #PropFirms #XAUUSD #Forex #Backtesting #GestionDeRiesgo
"""
    with open("media/video2_studio/youtube_metadata_video2.md", "w", encoding="utf-8") as f:
        f.write(t2_meta_md)
    print("✔ Metadatos YouTube Video 2 generados.")

    print("\n" + "=" * 70)
    print(" 🎉 PRODUCCIÓN EN MASA FINALIZADA CON ÉXITO")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())

"""
Generador de Audio Modular V3 — Tutorial #1 AsTrade
Genera los 4 bloques de voz en off para el video de YouTube con Edge-TTS (es-MX-JorgeNeural)
y calcula su duracion exacta en segundos para la sincronizacion automatica.
"""

import os
import sys
import json
import asyncio
import re
import subprocess
import imageio_ffmpeg
import edge_tts

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AUDIO_DIR = os.path.join(BASE_DIR, "scratch", "video_01_v3", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

VOICE = "es-MX-JorgeNeural"
RATE = "+0%"
VOLUME = "+0%"

BLOCKS = [
    {
        "id": "intro",
        "index": 1,
        "title": "Intro Animado AsTrade",
        "tag": "INTRO: ASTRADE",
        "icon": "⚡",
        "text": (
            "Bienvenido a AsTrade. En este tutorial aprenderás a crear y configurar "
            "correctamente tus cuentas de trading paso a paso desde el primer día."
        )
    },
    {
        "id": "block1_accounts_panel",
        "index": 2,
        "title": "El Panel de Cuentas y Botón Nueva Cuenta",
        "tag": "PASO 1: GESTIÓN DE CUENTAS",
        "icon": "⚡",
        "text": (
            "Dentro de la plataforma, la pestaña Tus Cuentas es el centro de mando "
            "donde organizas tu capital. Para comenzar, hacemos clic en el botón "
            "Nueva Cuenta para abrir el gestor institucional."
        )
    },
    {
        "id": "block2_account_types",
        "index": 3,
        "title": "Tipos de Cuenta y sus Diferencias",
        "tag": "PASO 2: MODALIDADES DE CUENTA",
        "icon": "📋",
        "text": (
            "AsTrade te permite adaptar tu bitácora a cualquier modelo operativo: "
            "Cuentas Reales con capital propio, Fases de prueba o Challenges para evaluaciones de fondeo, "
            "Cuentas Fondeadas con porcentaje de retiro, o Cuentas Instantáneas. "
            "Para este ejemplo, seleccionamos Fase de prueba."
        )
    },
    {
        "id": "block3_balances_rules",
        "index": 4,
        "title": "Balance Inicial, Balance Base y Reglas",
        "tag": "PASO 3: BALANCES & REGLAS",
        "icon": "💰",
        "text": (
            "Asignamos un nombre a la cuenta y definimos el Balance Inicial, en este caso 100,000 dólares. "
            "Este valor es clave, ya que sobre él se calculará estrictamente tu porcentaje de riesgo por operación. "
            "Si comienzas una cuenta nueva, dejas el Balance Actual vacío. Pero si ya venías operándola antes de ingresar a AsTrade, "
            "puedes colocar aquí tu saldo de cierre para auditar tu progreso real sin descalibrar el cálculo de riesgo. "
            "Finalmente, activamos las reglas de tu firma: un objetivo de beneficio del 8% y un límite de drawdown máximo del 10%."
        )
    },
    {
        "id": "block4_created_card",
        "index": 5,
        "title": "Tarjeta de Cuenta Creada en el Grid",
        "tag": "PASO 4: CUENTA HABILITADA",
        "icon": "🗂️",
        "text": (
            "Al hacer clic en Crear, tu cuenta queda inmediatamente activa en tu panel. "
            "Desde su tarjeta puedes verificar tu saldo, consultar tus límites de pérdida y acceder a la operativa. "
            "En el próximo tutorial, aprenderemos a registrar y auditar tus primeros trades "
            "sobre esta cuenta con análisis técnico y capturas antes y después."
        )
    },
    {
        "id": "outro",
        "index": 6,
        "title": "Outro y Despedida",
        "tag": "OUTRO: ASTRADE",
        "icon": "🚀",
        "text": (
            "Comienza hoy tu prueba gratuita en astradehub punto com y lleva tu operativa al nivel profesional."
        )
    }
]

def get_audio_duration(file_path):
    ffprobe_cmd = [
        imageio_ffmpeg.get_ffmpeg_exe(),
        "-i", file_path,
        "-hide_banner"
    ]
    p = subprocess.run(ffprobe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    # Extract Duration: 00:00:23.45 from stderr
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 25.0

def to_phonetic_spanish(text: str) -> str:
    """
    Aplica fonetización estricta al español latinoamericano para que JorgeNeural
    pronuncie con acento nativo anglosajón todos los términos técnicos de trading.
    """
    replacements = [
        # Marcas y Enlaces
        (r'\bAsTrade\b', 'As Trade'),
        (r'\bastradehub punto com\b', 'As Trade jób punto com'),
        (r'\bastradehub\.com\b', 'As Trade jób punto com'),
        (r'\bastradehub\b', 'As Trade jób'),
        (r'\bastrade punto app\b', 'As Trade punto app'),
        (r'\bastrade\b', 'as trade'),
        (r'\bFTMO\b', 'Efe Te Eme O'),
        # Terminología de Trading con Fonética Inglesa Perfecta
        (r'\btrading\b', 'tréiding'),
        (r'\bTrading\b', 'Tréiding'),
        (r'\btraders\b', 'tréiders'),
        (r'\bTraders\b', 'Tréiders'),
        (r'\btrader\b', 'tréider'),
        (r'\bTrader\b', 'Tréider'),
        (r'\btrades\b', 'tréids'),
        (r'\bTrades\b', 'Tréids'),
        (r'\btrade\b', 'tréid'),
        (r'\bTrade\b', 'Tréid'),
        (r'\bdrawdown\b', 'dróudaun'),
        (r'\bDrawdown\b', 'Dróudaun'),
        (r'\bWin Rate\b', 'uín reit'),
        (r'\bwin rate\b', 'uín reit'),
        (r'\bProfit Factor\b', 'prófit fáctor'),
        (r'\bprofit factor\b', 'prófit fáctor'),
        (r'\bStop Loss\b', 'stóp los'),
        (r'\bstop loss\b', 'stóp los'),
        (r'\bTake Profit\b', 'téik prófit'),
        (r'\btake profit\b', 'téik prófit'),
        (r'\bChallenge\b', 'Chálendsh'),
        (r'\bchallenge\b', 'chálendsh'),
        (r'\bDashboard\b', 'Dáshbord'),
        (r'\bdashboard\b', 'dáshbord'),
        # Números, balances y porcentajes
        (r'\b100K\b', 'cien ka'),
        (r'68\.4%', 'sesenta y ocho punto cuatro por ciento'),
        (r'2\.35', 'dos punto treinta y cinco'),
        (r'8%', 'ocho por ciento'),
        (r'5%', 'cinco por ciento'),
        (r'10%', 'diez por ciento'),
    ]
    res = text
    for pattern, repl in replacements:
        res = re.sub(pattern, repl, res)
    return res

async def generate_block_audio(block):
    mp3_name = f"{block['id']}.mp3"
    mp3_path = os.path.join(AUDIO_DIR, mp3_name)
    print(f"🎙️ Generando audio: {block['id']} ({block['title']})...")
    
    # Conversión fonética profesional estricta
    spoken_text = to_phonetic_spanish(block["text"])
    print(f"   -> Fonética: \"{spoken_text[:80]}...\"")

    communicate = edge_tts.Communicate(spoken_text, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(mp3_path)
    
    dur = get_audio_duration(mp3_path)
    print(f"   -> Guardado en {mp3_name} | Duración exacta: {dur:.2f}s")
    
    block_result = dict(block)
    block_result["text_phonetic"] = spoken_text
    block_result["audio_file"] = mp3_name
    block_result["audio_path"] = f"scratch/video_01_v3/audio/{mp3_name}"
    block_result["duration_seconds"] = dur
    return block_result

async def main():
    print("=" * 70)
    print("🚀 GENERANDO AUDIOS MODULARES V3 — TUTORIAL #1 ASTRADE")
    print(f"🎙️ Voz: {VOICE} | 4 Bloques")
    print("=" * 70)

    manifest = []
    total_duration = 0.0

    for block in BLOCKS:
        res = await generate_block_audio(block)
        manifest.append(res)
        total_duration += res["duration_seconds"]

    manifest_path = os.path.join(AUDIO_DIR, "manifest_v3.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "tutorial_id": "video_01_onboarding_astrade",
            "voice": VOICE,
            "total_duration_seconds": total_duration,
            "blocks": manifest
        }, f, indent=2, ensure_ascii=False)

    print("=" * 70)
    print(f"✅ MANIFEST GENERADO: {manifest_path}")
    print(f"⏱️ DURACIÓN TOTAL DE VOZ: {total_duration:.2f}s ({total_duration/60:.2f} minutos)")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())

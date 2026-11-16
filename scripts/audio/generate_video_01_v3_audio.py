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
        "id": "block1_welcome",
        "index": 1,
        "title": "Bienvenida y Acceso a la Plataforma",
        "tag": "PASO 1: ACCESO",
        "icon": "⚡",
        "text": (
            "Si operas cuentas de fondeo o buscas superar un desafío institucional, "
            "sabes que el mayor peligro no es el mercado, sino la falta de disciplina y el descontrol del drawdown. "
            "Te damos la bienvenida a AsTrade, la bitácora profesional en la nube desarrollada específicamente "
            "para traders de futuros y forex que auditan su operativa con rigor. "
            "Olvídate de bitácoras vacías en hojas de cálculo desordenadas. "
            "En este tutorial de inicio rápido, aprenderás a activar tus 7 días de prueba gratis "
            "y a configurar tu primera cuenta de fondeo en menos de dos minutos."
        )
    },
    {
        "id": "block2_new_account",
        "index": 2,
        "title": "Apertura de Cuenta Challenge 100K",
        "tag": "PASO 2: NUEVA CUENTA",
        "icon": "💼",
        "text": (
            "Comenzamos en la sección principal de Cuentas Reales. "
            "Para dar de alta tu desafío, hacemos clic en el botón 'Nueva Cuenta'. "
            "AsTrade abrirá de inmediato el asistente de configuración guiada. "
            "Aquí asignamos un nombre a nuestra cuenta, por ejemplo, 'Fondeo 100K FTMO'. "
            "Seleccionamos el tipo de cuenta: 'Fase de prueba o Challenge', "
            "e ingresamos el balance inicial de cien mil dólares. "
            "La interfaz intuitiva mantiene cada parámetro ordenado y listo para auditoría continua."
        )
    },
    {
        "id": "block3_rules_celebration",
        "index": 3,
        "title": "Reglas de Fondeo y Activación",
        "tag": "PASO 3: REGLAS & ACTIVACIÓN",
        "icon": "🎯",
        "text": (
            "El verdadero poder de AsTrade radica en la gestión automática de las reglas de tu empresa de fondeo. "
            "Configuramos el objetivo de beneficio en 8%, "
            "definimos el límite estricto de pérdida diaria en 5% "
            "y el drawdown máximo acumulado en 10%. "
            "Al registrar estos valores, la plataforma auditará cada trade antes de que arriesgues tu capital. "
            "Guardamos la configuración y listo: tu cuenta institucional queda activada y protegida al instante."
        )
    },
    {
        "id": "block4_dashboard_reveal",
        "index": 4,
        "title": "El Resultado: Dashboard con Métricas Reales",
        "tag": "PASO 4: RESULTADO EN VIVO",
        "icon": "📊",
        "text": (
            "Observa el resultado: tu cuenta de fondeo ya está activa con métricas en tiempo real. "
            "Al pasar a la pestaña de Dashboard, AsTrade cobra vida. "
            "Visualiza tu curva de equidad con operaciones reales, una tasa de acierto del 68.4%, "
            "un factor de beneficio de 2.35 y el calendario mensual con días verdes de consistencia matemática. "
            "Así es como se audita el trading profesional. "
            "Comienza hoy mismo tus 7 días gratis en astrade punto app y lleva tu cuenta de fondeo al siguiente nivel."
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
        (r'\bastrade\b', 'as trade'),
        (r'\bastrade punto app\b', 'As Trade punto app'),
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

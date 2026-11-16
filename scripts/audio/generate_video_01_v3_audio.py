"""
Generador de Audio Modular V3 — Tutorial #1 AsTrade
Genera los 4 bloques de voz en off para el video de YouTube con Edge-TTS (es-MX-JorgeNeural)
y calcula su duracion exacta en segundos para la sincronizacion automatica.
"""

import os
import sys
import json
import asyncio
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

async def generate_block_audio(block):
    mp3_name = f"{block['id']}.mp3"
    mp3_path = os.path.join(AUDIO_DIR, mp3_name)
    print(f"🎙️ Generando audio: {block['id']} ({block['title']})...")
    
    # Substitutions for cleaner Spanish pronunciation
    spoken_text = block["text"]
    spoken_text = spoken_text.replace("FTMO", "Efe Te Eme O")
    spoken_text = spoken_text.replace("astrade punto app", "As Trade punto app")
    spoken_text = spoken_text.replace("68.4%", "sesenta y ocho punto cuatro por ciento")
    spoken_text = spoken_text.replace("2.35", "dos punto treinta y cinco")
    spoken_text = spoken_text.replace("8%", "ocho por ciento")
    spoken_text = spoken_text.replace("5%", "cinco por ciento")
    spoken_text = spoken_text.replace("10%", "diez por ciento")
    spoken_text = spoken_text.replace("100K", "cien ka")

    communicate = edge_tts.Communicate(spoken_text, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(mp3_path)
    
    dur = get_audio_duration(mp3_path)
    print(f"   -> Guardado en {mp3_name} | Duración exacta: {dur:.2f}s")
    
    block_result = dict(block)
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

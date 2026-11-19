"""
Generador de Audio Modular — Tutorial #3 AsTrade
"Laboratorio de Backtesting Profesional y Simulación de Estrategias"

Genera:
1. intro.mp3 (Locución cinemática del título: "Tutorial tres: Laboratorio de Backtesting...")
2. Bloques 1 a 5 de la toma continua en app.html ensamblados en video_03_continuous_voice.mp3
3. outro.mp3 (Llamado a la acción institucional en astradehub.com y teaser de Tutorial #4)
4. manifest.json con metadatos de sincronización fonética con JorgeNeural (es-MX).
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
AUDIO_DIR = os.path.join(BASE_DIR, "scratch", "video_03", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

VOICE = "es-MX-JorgeNeural"
RATE = "+0%"
VOLUME = "+0%"

INTRO_BLOCK = {
    "id": "intro",
    "title": "Intro Oficial — Tutorial #3",
    "text": "Tutorial tres: Laboratorio de Backtesting Profesional y Simulación de Estrategias."
}

BLOCKS = [
    {
        "id": "block1_mode_switch",
        "index": 1,
        "title": "Paso 1: Peligro de operar a ciegas y Cambio a Modo Backtesting",
        "tag": "🧪 PASO 1 · MODO BACKTESTING PROFESIONAL",
        "icon": "🧪",
        "text": (
            "Arriesgar dinero real o pagar una evaluación de fondeo sin comprobar si tu estrategia "
            "tiene ventaja estadística es apostar a ciegas. En el centro superior de AsTrade, "
            "cambiamos de Cuenta Real a Backtesting con un solo clic, ingresando a un laboratorio "
            "de simulación cuantitativa totalmente aislado."
        )
    },
    {
        "id": "block2_create_session",
        "index": 2,
        "title": "Paso 2: Creación de Sesión de Backtesting",
        "tag": "📊 PASO 2 · ESTRUCTURA DE LA SESIÓN",
        "icon": "📊",
        "text": (
            "Hacemos clic en Nueva Sesión para estructurar nuestro entorno de prueba. "
            "Nombramos la sesión Estrategia Liquidez New York, seleccionamos el activo Euro Dólar, "
            "establecemos un capital simulado de cien mil dólares y configuramos las reglas "
            "idénticas a una cuenta de evaluación. Guardamos la sesión para iniciar el testeo histórico."
        )
    },
    {
        "id": "block3_simulated_trade",
        "index": 3,
        "title": "Paso 3: Registro Ágil de Operación Simulada",
        "tag": "🎯 PASO 3 · REGISTRO Y SIZING HISTÓRICO",
        "icon": "🎯",
        "text": (
            "Dentro de la sesión, abrimos Nueva Entrada para registrar una operación histórica. "
            "En sesión New York a las nueve y media de la mañana, ejecutamos una orden de compra Market Buy "
            "a favor de la tendencia. Con veinte pips de Stop Loss y sesenta de Take Profit, "
            "la bitácora calcula un lotaje institucional de cinco lotes exactos y proyecta un cierre quirúrgico en Full TP sin presiones emocionales."
        )
    },
    {
        "id": "block4_metrics_robustness",
        "index": 4,
        "title": "Paso 4: Curva Histórica y Métricas Cuantitativas",
        "tag": "📈 PASO 4 · AUDITORÍA DE ROBUSTEZ MATEMÁTICA",
        "icon": "📈",
        "text": (
            "Al registrar nuestras operaciones, AsTrade genera instantáneamente la curva de capital proyectada "
            "y calcula tus métricas fundamentales: tasa de acierto Win Rate, Profit Factor "
            "y el máximo Drawdown histórico. Estos datos te otorgan la certeza matemática "
            "para saber si tu sistema resistirá las fases de prueba."
        )
    },
    {
        "id": "block5_total_isolation",
        "index": 5,
        "title": "Paso 5: Aislamiento Total y Seguridad de Datos",
        "tag": "🛡️ PASO 5 · AISLAMIENTO Y SEGURIDAD",
        "icon": "🛡️",
        "text": (
            "Y lo más importante: regresamos al modo Cuenta Real y verificamos que nuestras cuentas activas "
            "permanecen cien por ciento intactas. Tu laboratorio de pruebas nunca contamina tus registros "
            "oficiales de fondeo, garantizando una contabilidad limpia y profesional."
        )
    }
]

OUTRO_BLOCK = {
    "id": "outro",
    "title": "Outro Institucional, Llamado a la Acción y Teaser Tutorial #4",
    "text": (
        "Comienza hoy tu prueba gratuita de siete días en astradehub punto com. "
        "En el próximo tutorial: análisis cuantitativo avanzado en el Dashboard y Calendario de Rentabilidad."
    )
}

def to_phonetic_spanish(text: str) -> str:
    """
    Aplica normalización fonética rigurosa con dicción nativa en español para marcas y narrativa,
    y fonética anglosajona estricta (en inglés) para los términos técnicos de trading.
    """
    replacements = [
        # Marcas y Dominios
        (r'\bAsTrade\b', 'As Trade'),
        (r'\bastradehub punto com\b', 'As Trade jób punto com'),
        (r'\bastradehub\.com\b', 'As Trade jób punto com'),
        (r'\bastradehub\b', 'As Trade jób'),
        (r'\bastrade\b', 'as trade'),

        # Terminología de Plataformas y Acciones
        (r'\bTradingView\b', 'Tréiding Viú'),
        (r'\bTrading View\b', 'Tréiding Viú'),
        (r'\bCtrl\+V\b', 'Control V'),

        # Terminología de Trading con Fonética Anglosajona en Inglés Impecable
        (r'\bBacktesting\b', 'Bák-téstin'),
        (r'\bbacktesting\b', 'bák-téstin'),
        (r'\bWin Rate\b', 'Wín Réit'),
        (r'\bwin rate\b', 'wín réit'),
        (r'\bProfit Factor\b', 'Prófit Fáktor'),
        (r'\bprofit factor\b', 'prófit fáktor'),
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

        # Take Profit y TP (Nombres en inglés técnico, Siglas en español)
        (r'\bFull TP\b', 'Full Té Pé'),
        (r'\bfull tp\b', 'Full Té Pé'),
        (r'\bTP\b', 'Té Pé'),
        (r'\btp\b', 'Té Pé'),
        (r'\bTake Profit\b', 'téik prófit'),
        (r'\btake profit\b', 'téik prófit'),

        # Stop Loss y SL (Nombres en inglés técnico, Siglas en español)
        (r'\bStop Loss\b', 'stóp los'),
        (r'\bstop loss\b', 'stóp los'),
        (r'\bSL\b', 'Ese Ele'),
        (r'\bsl\b', 'Ese Ele'),

        # Break Even y BE
        (r'\bBreak Even\b', 'bréik íven'),
        (r'\bbreak even\b', 'bréik íven'),
        (r'\bBE\b', 'Bé E'),
        (r'\bbe\b', 'Bé E'),

        # Drawdown y DD
        (r'\bDrawdown\b', 'dróudaun'),
        (r'\bdrawdown\b', 'dróudaun'),
        (r'\bDD\b', 'Dé Dé'),
        (r'\bdd\b', 'Dé Dé'),

        # Órdenes de mercado
        (r'\bMarket Buy\b', 'Márket Bai'),
        (r'\bmarket buy\b', 'márket bai'),
        (r'\bMarket Sell\b', 'Márket Sel'),
        (r'\bmarket sell\b', 'márket sel'),

        # Pares y Símbolos
        (r'\bEURUSD\b', 'Euro Dólar'),
        (r'\beurusd\b', 'euro dólar'),
        (r'\bNew York\b', 'Niu Yórk'),
        (r'\bnew york\b', 'niu yórk'),

        # R:R y Sizing
        (r'\bRatio R:R\b', 'Ratio Riesgo Beneficio'),
        (r'\bR:R\b', 'Riesgo Beneficio'),
        (r'\b1:3\.00\b', 'uno a tres punto cero'),
        (r'\b1:3\b', 'uno a tres'),
    ]

    result = text
    for pattern, replacement in replacements:
        result = re.sub(pattern, replacement, result)
    return result

def get_audio_duration(file_path: str) -> float:
    """Calcula con FFmpeg la duración exacta del archivo de audio en segundos."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe,
        "-i", file_path,
        "-hide_banner"
    ]
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 15.0

async def synthesize_speech(text_phonetic: str, output_path: str):
    """Sintetiza texto a voz con edge-tts."""
    communicate = edge_tts.Communicate(text_phonetic, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(output_path)

def generate_silence_mp3(duration: float, output_path: str):
    """Genera un archivo MP3 de silencio absoluto con duración exacta."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe, "-y",
        "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo",
        "-t", f"{duration:.3f}",
        "-q:a", "2",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

def concatenate_audios_with_ffmpeg(input_files: list, output_path: str):
    """Concatena múltiples MP3s de forma lossless usando el demuxer concat de FFmpeg."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    concat_list_file = os.path.join(AUDIO_DIR, "concat_list.txt")
    with open(concat_list_file, "w", encoding="utf-8") as f:
        for fpath in input_files:
            safe_path = os.path.abspath(fpath).replace("\\", "/")
            f.write(f"file '{safe_path}'\n")

    cmd = [
        ffmpeg_exe, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_file,
        "-c", "copy",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    if os.path.exists(concat_list_file):
        os.remove(concat_list_file)

async def main_async():
    print("=" * 70)
    print("🎙️ AS-TRADE VOICE GENERATOR — TUTORIAL #3 (BACKTESTING PRO)")
    print(f"   Voz Oficial: {VOICE} | Rate: {RATE} | Volume: {VOLUME}")
    print("=" * 70)

    # 1. Generar Audio Intro
    intro_path = os.path.join(AUDIO_DIR, "intro.mp3")
    intro_phonetic = to_phonetic_spanish(INTRO_BLOCK["text"])
    print(f"🔊 Sintetizando Intro: '{intro_phonetic}'...")
    await synthesize_speech(intro_phonetic, intro_path)
    intro_dur = get_audio_duration(intro_path)
    print(f"   ✅ Intro generada: {intro_dur:.2f}s -> {intro_path}")

    # 2. Generar Audio Outro
    outro_path = os.path.join(AUDIO_DIR, "outro.mp3")
    outro_phonetic = to_phonetic_spanish(OUTRO_BLOCK["text"])
    print(f"\n🔊 Sintetizando Outro: '{outro_phonetic}'...")
    await synthesize_speech(outro_phonetic, outro_path)
    outro_dur = get_audio_duration(outro_path)
    print(f"   ✅ Outro generada: {outro_dur:.2f}s -> {outro_path}")

    # 3. Generar Bloques Continuos
    print("\n" + "─" * 70)
    print("🎬 SINTETIZANDO BLOQUES DE LA TOMA CONTINUA EN APP.HTML...")
    print("─" * 70)

    audio_segments_to_concat = []
    manifest_blocks = []
    cumulative_time = 0.0
    silence_between_blocks = 1.25  # Segundos de pausa orgánica entre acciones de interfaz

    for i, blk in enumerate(BLOCKS):
        blk_id = blk["id"]
        raw_text = blk["text"]
        phonetic_text = to_phonetic_spanish(raw_text)
        blk_audio_path = os.path.join(AUDIO_DIR, f"{blk_id}.mp3")

        print(f"\n[{i+1}/{len(BLOCKS)}] {blk['title']}")
        print(f"    Texto: {phonetic_text[:90]}...")
        await synthesize_speech(phonetic_text, blk_audio_path)
        dur = get_audio_duration(blk_audio_path)
        print(f"    Duración locución: {dur:.2f}s")

        audio_segments_to_concat.append(blk_audio_path)

        start_time = cumulative_time
        end_voice_time = start_time + dur

        # Añadir silencio entre bloques (excepto después del último)
        if i < len(BLOCKS) - 1:
            silence_path = os.path.join(AUDIO_DIR, f"silence_{i+1}.mp3")
            generate_silence_mp3(silence_between_blocks, silence_path)
            audio_segments_to_concat.append(silence_path)
            cumulative_time = end_voice_time + silence_between_blocks
        else:
            cumulative_time = end_voice_time

        manifest_blocks.append({
            "id": blk["id"],
            "index": blk["index"],
            "title": blk["title"],
            "tag": blk["tag"],
            "icon": blk["icon"],
            "text_original": raw_text,
            "text_phonetic": phonetic_text,
            "audio_file": os.path.basename(blk_audio_path),
            "start_seconds": round(start_time, 3),
            "duration_seconds": round(dur, 3),
            "end_seconds": round(end_voice_time, 3),
            "cumulative_end": round(cumulative_time, 3)
        })

    # 4. Concatenar Pista Continua
    continuous_voice_path = os.path.join(AUDIO_DIR, "video_03_continuous_voice.mp3")
    print("\n" + "─" * 70)
    print("🔗 Concatenando pista continua de voz con pausas sincronizadas...")
    concatenate_audios_with_ffmpeg(audio_segments_to_concat, continuous_voice_path)
    total_voice_dur = get_audio_duration(continuous_voice_path)
    print(f"✅ ¡Pista continua generada con éxito! Duración total: {total_voice_dur:.2f}s")

    # 5. Generar Manifest JSON
    manifest_data = {
        "tutorial_id": "tutorial_03",
        "title": "Laboratorio de Backtesting Profesional y Simulación de Estrategias",
        "voice": VOICE,
        "intro": {
            "file": "intro.mp3",
            "duration": round(intro_dur, 3),
            "text": INTRO_BLOCK["text"],
            "text_phonetic": intro_phonetic
        },
        "outro": {
            "file": "outro.mp3",
            "duration": round(outro_dur, 3),
            "text": OUTRO_BLOCK["text"],
            "text_phonetic": outro_phonetic
        },
        "continuous_voice": {
            "file": "video_03_continuous_voice.mp3",
            "total_duration": round(total_voice_dur, 3),
            "blocks": manifest_blocks
        }
    }

    manifest_path = os.path.join(AUDIO_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    print(f"📄 Manifest de sincronización guardado en: {manifest_path}")
    print("=" * 70)
    print("🎉 FASE 1 COMPLETADA CON ÉXITO")
    print("=" * 70)

def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()

"""
Generador de Audio Modular — Tutorial #3 AsTrade
"Control de Drawdown y Reglas de Financiación Prop"

Genera:
1. intro.mp3 (Locución cinemática del título: "Tutorial tres: Control de Drawdown...")
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
    "text": "Tutorial tres: Control de Drawdown y Reglas de Financiación Prop."
}

BLOCKS = [
    {
        "id": "block1_drawdown_danger",
        "index": 1,
        "title": "Paso 1: Por qué el Drawdown destruye cuentas y Continuidad",
        "tag": "🛡️ PASO 1 · CONTROL DE RIESGO INSTITUCIONAL",
        "icon": "🛡️",
        "text": (
            "Más del noventa por ciento de los traders reprueban sus evaluaciones de fondeo no por falta de aciertos, "
            "sino por violar el límite de Drawdown. Continuando con nuestra cuenta de cien mil dólares del tutorial anterior, "
            "tras asegurar tres mil dólares de beneficio en Euro Dólar, aprenderemos a blindar nuestro capital contra rachas negativas."
        )
    },
    {
        "id": "block2_goals_radar",
        "index": 2,
        "title": "Paso 2: Radar de Metas y Balance Efectivo",
        "tag": "🎯 PASO 2 · RADAR DE METAS Y PROGRESO",
        "icon": "🎯",
        "text": (
            "En la barra de navegación superior, ingresamos a la pestaña Metas. "
            "AsTrade despliega de inmediato el radar de evaluación de tu cuenta: "
            "confirmamos nuestro balance efectivo en ciento tres mil dólares "
            "y un progreso del treinta y siete punto cinco por ciento hacia el objetivo de la Fase Uno."
        )
    },
    {
        "id": "block3_drawdown_cushion",
        "index": 3,
        "title": "Paso 3: Auditoría del Colchón de Seguridad y Drawdown Máximo",
        "tag": "📊 PASO 3 · COLCHÓN DE SEGURIDAD RESTANTE",
        "icon": "📊",
        "text": (
            "En la tarjeta de Drawdown Máximo, observamos el indicador más importante para tu supervivencia: "
            "el colchón de seguridad restante. Con cero dólares de Drawdown consumido, disponemos de diez mil dólares "
            "intactos de margen frente al límite estático, y trece mil dólares de protección desde nuestro pico de capital."
        )
    },
    {
        "id": "block4_daily_loss_rules",
        "index": 4,
        "title": "Paso 4: Límite de Pérdida Diaria y Reglas Institucionales",
        "tag": "⚡ PASO 4 · PÉRDIDA DIARIA Y PROTECCIÓN",
        "icon": "⚡",
        "text": (
            "En la sección inferior auditamos las reglas de consistencia y la pérdida diaria máxima, "
            "configurada en cinco por ciento. El semáforo verde confirma que nuestra cuenta opera en zona totalmente segura, "
            "sin riesgo de quema accidental ni penalizaciones de la firma de fondeo."
        )
    },
    {
        "id": "block5_math_discipline",
        "index": 5,
        "title": "Paso 5: Disciplina Matemática y Camino a la Fondeada",
        "tag": "🏆 PASO 5 · DISCIPLINA HACIA LA META",
        "icon": "🏆",
        "text": (
            "Al conocer tu colchón exacto antes de cada jornada, eliminas la ansiedad operativa. "
            "Con cinco mil dólares restantes para alcanzar la meta del ocho por ciento, "
            "avanzamos con certeza matemática hacia la cuenta fondeada real."
        )
    }
]

OUTRO_BLOCK = {
    "id": "outro",
    "title": "Outro Institucional, Llamado a la Acción y Teaser Tutorial #4",
    "text": (
        "Comienza hoy tu prueba gratuita de siete días en astradehub punto com. "
        "En el próximo tutorial: análisis cuantitativo avanzado en el Dashboard, Curva de Capital y Calendario de Consistencia."
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

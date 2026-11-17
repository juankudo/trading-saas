"""
Generador de Audio Modular V2 — Tutorial #2 AsTrade
"Registro y Auditoría de Trades con Precisión Quirúrgica"

Genera los 7 bloques de voz en off para el video de YouTube con Edge-TTS (es-MX-JorgeNeural),
aplica el diccionario fonético de trading latinoamericano (to_phonetic_spanish),
mide con precisión milimétrica la duración con FFprobe,
ensambla la pista continua master (video_02_continuous_voice.mp3) y
genera el manifest_v2.json con metadatos de sincronización temporal.
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
AUDIO_DIR = os.path.join(BASE_DIR, "scratch", "video_02", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

VOICE = "es-MX-JorgeNeural"
RATE = "+0%"
VOLUME = "+0%"

BLOCKS = [
    {
        "id": "block1_intro_continuity",
        "index": 1,
        "title": "Introducción y Continuidad: Acceso a Cuenta Fondeo 100K FTMO",
        "tag": "⚡ CONTINUIDAD · CUENTA FONDEO 100K",
        "icon": "⚡",
        "text": (
            "Continuando con nuestra cuenta de fondeo de cien mil dólares creada en el tutorial anterior, "
            "aprenderemos a registrar y auditar operaciones con cálculo automático de riesgo "
            "y bitácora visual antes y después."
        )
    },
    {
        "id": "block2_modal_setup",
        "index": 2,
        "title": "Paso 1: Apertura de Modal y Selección de Parámetros",
        "tag": "📊 PASO 1 · PARÁMETROS OPERATIVOS",
        "icon": "📊",
        "text": (
            "Hacemos clic en Nueva Entrada para abrir la terminal operativa. "
            "Seleccionamos el par Euro Dólar, establecemos la sesión en New York, "
            "confirmamos tendencia a favor y ejecutamos una orden de compra a mercado Market Buy."
        )
    },
    {
        "id": "block3_risk_lots",
        "index": 3,
        "title": "Paso 2: Stop Loss, Take Profit, Ratio R:R y Lotaje Institucional",
        "tag": "🎯 PASO 2 · RIESGO Y LOTAJE AUTOMÁTICO",
        "icon": "🎯",
        "text": (
            "Definimos quince pips de Stop Loss y cuarenta y cinco de Take Profit. "
            "La bitácora calcula al instante un ratio uno a tres punto cero. "
            "Con un riesgo del uno por ciento, AsTrade calcula automáticamente el lotaje exacto "
            "sobre tu balance inicial, protegiendo tu cuenta de sobreapalancamiento."
        )
    },
    {
        "id": "block4_visual_before_active",
        "index": 4,
        "title": "Paso 3: Tesis Técnica Antes de Entrar, Pegado de Captura y Trade en Curso",
        "tag": "📸 PASO 3 · BITÁCORA TÉCNICA (ANTES)",
        "icon": "📸",
        "text": (
            "En la bitácora visual, redactamos la tesis técnica antes de entrar y "
            "pegamos la captura de TradingView con Control V. Marcamos el estado como Activa "
            "y guardamos. El trade queda registrado en tu historial para acompañar su evolución "
            "en el mercado sin alterar tus estadísticas."
        )
    },
    {
        "id": "block5_post_trade_audit",
        "index": 5,
        "title": "Paso 4: Auditoría Post-Trade, Captura Después y Cierre en Full TP",
        "tag": "🎯 PASO 4 · AUDITORÍA POST-TRADE (FULL TP)",
        "icon": "🎯",
        "text": (
            "Al tocar el objetivo, abrimos la edición de la orden. "
            "Actualizamos el estado a Full TP, pegamos la captura de cierre en la columna Después "
            "y registramos nuestras notas de gestión. Esta auditoría sistemática es el hábito definitivo "
            "que separa a los traders rentables de la mayoría."
        )
    },
    {
        "id": "block6_prop_firm_impact",
        "index": 6,
        "title": "Paso 5: Avance de Metas de Fondeo, Drawdown Intacto y Galería Visual",
        "tag": "📈 PASO 5 · IMPACTO EN REGLAS DE EVALUACIÓN",
        "icon": "📈",
        "text": (
            "Al guardar, tu balance sube a ciento tres mil dólares. "
            "La barra de Profit Target avanza al treinta y siete punto cinco por ciento de tu meta, "
            "mientras el colchón de drawdown permanece cien por ciento intacto. "
            "En la pestaña Galería, revisas tu análisis completo lado a lado."
        )
    },
    {
        "id": "block7_outro_cta",
        "index": 7,
        "title": "Outro Institucional, Llamado a la Acción y Teaser Tutorial #3",
        "tag": "🚀 OUTRO · ASTRADE HUB",
        "icon": "🚀",
        "text": (
            "Comienza hoy tu prueba gratuita de siete días en astradehub punto com. "
            "En el próximo tutorial: cómo blindar tu cuenta dominando el control de drawdown."
        )
    }
]


def to_phonetic_spanish(text: str) -> str:
    """
    Aplica normalización fonética rigurosa al español latinoamericano para que
    JorgeNeural pronuncie con dicción nativa y natural todos los términos
    financieros, pares de divisas, métricas y marcas.
    """
    replacements = [
        # Marcas y Dominios
        (r'\bAsTrade\b', 'As Trade'),
        (r'\bastradehub punto com\b', 'As Trade jób punto com'),
        (r'\bastradehub\.com\b', 'As Trade jób punto com'),
        (r'\bastradehub\b', 'As Trade jób'),
        (r'\bastrade\b', 'as trade'),
        (r'\bFTMO\b', 'Efe Te Eme O'),

        # Terminología de Plataformas y Acciones
        (r'\bTradingView\b', 'Tréiding Viú'),
        (r'\bTrading View\b', 'Tréiding Viú'),
        (r'\bCtrl\+V\b', 'Control V'),

        # Terminología de Trading con Fonética Anglosajona Impecable
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
        (r'\bFull TP\b', 'Ful Té Pé'),
        (r'\bfull tp\b', 'Ful Té Pé'),
        (r'\bStop Loss\b', 'stóp los'),
        (r'\bstop loss\b', 'stóp los'),
        (r'\bTake Profit\b', 'téik prófit'),
        (r'\btake profit\b', 'téik prófit'),
        (r'\bMarket Buy\b', 'Márket Bai'),
        (r'\bmarket buy\b', 'márket bai'),
        (r'\bMarket Sell\b', 'Márket Sel'),
        (r'\bmarket sell\b', 'márket sel'),
        (r'\bBreak Even\b', 'Bréik Íven'),
        (r'\bbreak even\b', 'bréik íven'),
        (r'\bBE\b', 'Bé E'),
        (r'\bWin Rate\b', 'uín reit'),
        (r'\bwin rate\b', 'uín reit'),
        (r'\bProfit Target\b', 'prófit tárguet'),
        (r'\bprofit target\b', 'prófit tárguet'),
        (r'\bProfit Factor\b', 'prófit fáctor'),
        (r'\bprofit factor\b', 'prófit fáctor'),
        (r'\bDrawdown\b', 'dróudaun'),
        (r'\bdrawdown\b', 'dróudaun'),
        (r'\bChallenge\b', 'Chálendsh'),
        (r'\bchallenge\b', 'chálendsh'),
        (r'\bDashboard\b', 'Dáshbord'),
        (r'\bdashboard\b', 'dáshbord'),

        # Restaurar marca institucional As Trade (evitar As Tréid)
        (r'\bAs Tréid\b', 'As Trade'),
        (r'\bas tréid\b', 'as trade'),

        # Pares de Divisas y Cripto
        (r'\bEURUSD\b', 'Euro Dólar'),
        (r'\bXAUUSD\b', 'Oro Dólar'),
        (r'\bGBPUSD\b', 'Libra Dólar'),

        # Números, balances y porcentajes
        (r'\buno por ciento\b', 'uno punto cero por ciento'),
        (r'\b100K\b', 'cien ka'),
        (r'\b100k\b', 'cien ka'),
        (r'\b100,000\b', 'cien mil'),
        (r'\b103,000\b', 'ciento tres mil'),
        (r'1:3\.0', 'uno a tres punto cero'),
        (r'1:3\b', 'uno a tres'),
        (r'1\.0%', 'uno punto cero por ciento'),
        (r'37\.5%', 'treinta y siete punto cinco por ciento'),
        (r'68\.4%', 'sesenta y ocho punto cuatro por ciento'),
        (r'\+\$3,000', 'más tres mil dólares'),
        (r'\$3,000', 'tres mil dólares'),
        (r'\$10,000', 'diez mil dólares'),
        (r'\$100,000', 'cien mil dólares'),
        (r'\$103,000', 'ciento tres mil dólares'),
    ]

    res = text
    for pattern, repl in replacements:
        res = re.sub(pattern, repl, res)
    return res


def get_audio_duration(file_path: str) -> float:
    """Calcula con FFprobe la duración exacta del archivo de audio en segundos."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffprobe_cmd = [
        ffmpeg_exe,
        "-i", file_path,
        "-hide_banner"
    ]
    p = subprocess.run(ffprobe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    return 15.0


def concatenate_audio_files(input_files, output_file: str):
    """Concatena los archivos MP3 en una pista continua usando FFmpeg concat demuxer."""
    concat_list_path = os.path.join(AUDIO_DIR, "concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for fpath in input_files:
            # Reemplazar backslashes para FFmpeg concat demuxer
            clean_path = fpath.replace("\\", "/")
            f.write(f"file '{clean_path}'\n")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list_path,
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        output_file
    ]
    print(f"🔗 Concatenando pista continua con FFmpeg: {output_file}")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Error concatenando audio con FFmpeg:\n{res.stderr}")

    if os.path.exists(concat_list_path):
        os.remove(concat_list_path)

    total_dur = get_audio_duration(output_file)
    print(f"✅ Pista maestra continua generada: {total_dur:.2f}s")
    return total_dur


async def generate_block_audio(block: dict) -> dict:
    mp3_name = f"{block['id']}.mp3"
    mp3_path = os.path.join(AUDIO_DIR, mp3_name)
    print(f"🎙️ Generando audio: {block['id']} ({block['title']})...")

    spoken_text = to_phonetic_spanish(block["text"])
    print(f"   -> Texto fonético: \"{spoken_text}\"")

    communicate = edge_tts.Communicate(spoken_text, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(mp3_path)

    dur = get_audio_duration(mp3_path)
    print(f"   -> Guardado: {mp3_name} | Duración: {dur:.2f}s")

    block_result = dict(block)
    block_result["text_phonetic"] = spoken_text
    block_result["audio_file"] = mp3_name
    block_result["audio_path"] = f"scratch/video_02/audio/{mp3_name}"
    block_result["audio_path_abs"] = os.path.abspath(mp3_path)
    block_result["duration_seconds"] = round(dur, 2)
    return block_result


async def main():
    print("=" * 75)
    print("🚀 GENERADOR DE AUDIO MODULAR V2 — TUTORIAL #2 ASTRADE")
    print(f"🎙️ Motor: Edge-TTS | Voz: {VOICE} | Bloques: {len(BLOCKS)}")
    print(f"📁 Directorio de salida: {AUDIO_DIR}")
    print("=" * 75)

    manifest_blocks = []
    blocks_by_id = {}
    total_duration = 0.0
    generated_files = []

    for block in BLOCKS:
        res = await generate_block_audio(block)
        start_time = round(total_duration, 2)
        end_time = round(start_time + res["duration_seconds"], 2)
        res["cumulative_start"] = start_time
        res["cumulative_end"] = end_time

        manifest_blocks.append(res)
        blocks_by_id[res["id"]] = res
        generated_files.append(res["audio_path_abs"])
        total_duration = end_time

    # Generar pista continua
    continuous_mp3_path = os.path.join(AUDIO_DIR, "video_02_continuous_voice.mp3")
    continuous_dur = concatenate_audio_files(generated_files, continuous_mp3_path)

    manifest_data = {
        "tutorial_id": "video_02_trades_astrade",
        "voice": VOICE,
        "rate": RATE,
        "volume": VOLUME,
        "total_duration_seconds": round(total_duration, 2),
        "continuous_duration_seconds": round(continuous_dur, 2),
        "continuous_audio_file": "video_02_continuous_voice.mp3",
        "continuous_audio_path": "scratch/video_02/audio/video_02_continuous_voice.mp3",
        "blocks": manifest_blocks,
        "blocks_by_id": blocks_by_id
    }

    manifest_path = os.path.join(AUDIO_DIR, "manifest_v2.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    print("=" * 75)
    print(f"✅ MANIFEST GENERADO EXITOSAMENTE: {manifest_path}")
    print(f"⏱️ DURACIÓN TOTAL DE LOCUCIÓN: {total_duration:.2f}s ({total_duration / 60:.2f} min)")
    print(f"🎵 PISTA CONTINUA MAESTRA: {continuous_mp3_path}")
    print("=" * 75)

    # Imprimir tabla resumen
    print("\nRESUMEN DE BLOQUES GENERADOS:")
    print("-" * 75)
    print(f"{'#':<3} {'ID':<28} {'DUR (s)':<8} {'INICIO':<8} {'FIN':<8}")
    print("-" * 75)
    for b in manifest_blocks:
        print(f"{b['index']:<3} {b['id']:<28} {b['duration_seconds']:<8.2f} {b['cumulative_start']:<8.2f} {b['cumulative_end']:<8.2f}")
    print("-" * 75)


if __name__ == "__main__":
    asyncio.run(main())

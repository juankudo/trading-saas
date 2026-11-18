"""
Generador de Audio Modular V2 — Tutorial #2 AsTrade (V6)
"Registro y Auditoría de Trades con Precisión Quirúrgica"

Genera:
1. intro.mp3 (Locución cinemática del título: "Tutorial dos: Registro y Auditoría de Trades...")
2. Bloques 1 a 6 de la toma continua en app.html ensamblados en video_02_continuous_voice.mp3
3. outro.mp3 (Llamado a la acción institucional en astradehub.com y teaser de Tutorial #3)
4. manifest_v2.json con metadatos de sincronización fonética con JorgeNeural (es-MX).
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

INTRO_BLOCK = {
    "id": "intro",
    "title": "Intro Oficial — Tutorial #2",
    "text": "Tutorial dos: Registro y Auditoría de Trades con Precisión Quirúrgica."
}

BLOCKS = [
    {
        "id": "block1_intro_continuity",
        "index": 1,
        "title": "Continuidad: Acceso a Cuenta Fondeo 100K FTMO",
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
            "Definimos veinte pips de Stop Loss y sesenta de Take Profit. "
            "La bitácora calcula al instante un ratio uno a tres punto cero. "
            "Con un riesgo del uno por ciento, AsTrade calcula automáticamente el lotaje exacto "
            "de cinco lotes sobre tu balance inicial, protegiendo tu cuenta de sobreapalancamiento."
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
        "title": "Paso 4: Navegación a Registro de Trades, Edición de Orden y Cierre Full TP",
        "tag": "🎯 PASO 4 · AUDITORÍA POST-TRADE (FULL TP)",
        "icon": "🎯",
        "text": (
            "Al tocar el objetivo, nos dirigimos a la pestaña Registro de Trades para auditar la orden. "
            "También dispones de accesos rápidos desde la sección de cuentas. "
            "Hacemos clic en el icono de edición, actualizamos el estado a Full TP, "
            "pegamos la captura de cierre en la columna Después y registramos nuestras notas de gestión. "
            "Esta auditoría sistemática es el hábito definitivo que separa a los traders rentables de la mayoría."
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
    }
]

OUTRO_BLOCK = {
    "id": "outro",
    "title": "Outro Institucional, Llamado a la Acción y Teaser Tutorial #3",
    "text": (
        "Comienza hoy tu prueba gratuita de siete días en astradehub punto com. "
        "En el próximo tutorial: cómo blindar tu cuenta dominando el control de drawdown."
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
        (r'\bFTMO\b', 'Efe Te Eme O'),

        # Terminología de Plataformas y Acciones
        (r'\bTradingView\b', 'Tréiding Viú'),
        (r'\bTrading View\b', 'Tréiding Viú'),
        (r'\bCtrl\+V\b', 'Control V'),

        # Terminología de Trading con Fonética Anglosajona en Inglés Impecable
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

        # Take Profit y TP (Nombres en inglés técnico, Siglas en español según directiva)
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

        # Break Even y BE (Nombres en inglés técnico, Siglas en español)
        (r'\bBreak Even\b', 'bréik íven'),
        (r'\bbreak even\b', 'bréik íven'),
        (r'\bBE\b', 'Bé E'),
        (r'\bbe\b', 'Bé E'),

        # Órdenes de mercado
        (r'\bMarket Buy\b', 'Márket Bai'),
        (r'\bmarket buy\b', 'márket bai'),
        (r'\bMarket Sell\b', 'Márket Sel'),
        (r'\bmarket sell\b', 'márket sel'),

        # Métricas y evaluación
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

        # Pares de Divisas
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


async def generate_single_audio(block: dict, out_name: str) -> dict:
    mp3_path = os.path.join(AUDIO_DIR, out_name)
    spoken_text = to_phonetic_spanish(block["text"])
    print(f"🎙️ Generando {out_name} (\"{spoken_text}\")...")

    communicate = edge_tts.Communicate(spoken_text, VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(mp3_path)

    dur = get_audio_duration(mp3_path)
    print(f"   -> Guardado: {out_name} | Duración: {dur:.2f}s")

    result = dict(block)
    result["text_phonetic"] = spoken_text
    result["audio_file"] = out_name
    result["audio_path"] = f"scratch/video_02/audio/{out_name}"
    result["audio_path_abs"] = os.path.abspath(mp3_path)
    result["duration_seconds"] = round(dur, 2)
    return result


async def main():
    print("=" * 75)
    print("🚀 GENERADOR DE AUDIO MODULAR V2 — TUTORIAL #2 ASTRADE (V6)")
    print(f"🎙️ Motor: Edge-TTS | Voz: {VOICE} | Dicción: Inglés Técnico")
    print(f"📁 Directorio de salida: {AUDIO_DIR}")
    print("=" * 75)

    # 1. Generar audio para Intro Cinemático (Escena 1)
    intro_res = await generate_single_audio(INTRO_BLOCK, "intro.mp3")

    # 2. Generar bloques de la toma continua (Escena 2: app.html)
    manifest_blocks = []
    blocks_by_id = {}
    total_continuous_dur = 0.0
    generated_files = []

    for block in BLOCKS:
        res = await generate_single_audio(block, f"{block['id']}.mp3")
        start_time = round(total_continuous_dur, 2)
        end_time = round(start_time + res["duration_seconds"], 2)
        res["cumulative_start"] = start_time
        res["cumulative_end"] = end_time

        manifest_blocks.append(res)
        blocks_by_id[res["id"]] = res
        generated_files.append(res["audio_path_abs"])
        total_continuous_dur = end_time

    # 3. Concatenar pista continua de la aplicación
    continuous_mp3_path = os.path.join(AUDIO_DIR, "video_02_continuous_voice.mp3")
    continuous_dur = concatenate_audio_files(generated_files, continuous_mp3_path)

    # 4. Generar audio para Outro Institucional (Escena 3)
    outro_res = await generate_single_audio(OUTRO_BLOCK, "outro.mp3")

    # 5. Generar manifest_v2.json
    manifest_data = {
        "tutorial_id": "video_02_trades_astrade",
        "voice": VOICE,
        "rate": RATE,
        "volume": VOLUME,
        "intro": intro_res,
        "outro": outro_res,
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
    print(f"⏱️ Intro: {intro_res['duration_seconds']}s | App Continua: {continuous_dur:.2f}s | Outro: {outro_res['duration_seconds']}s")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(main())

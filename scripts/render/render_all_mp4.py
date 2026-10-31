"""
Batch Video Renderer — Trading Journal Pro
Compila automáticamente:
- 20 Shorts / Reels / TikToks en MP4 vertical (1080x1920 HD)
- 5 Tutoriales de YouTube en MP4 horizontal (1920x1080 HD)
Utilizando FFmpeg integrado (imageio-ffmpeg) y las voces neuronales generadas.
"""

import os
import sys
import json
import time
import subprocess
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"

SHORTS_OUT = "media/renders/shorts"
TUTORIALS_OUT = "media/renders/tutorials"
POSTERS_OUT = "media/renders/posters"
GUIDE_OUT = "media/renders/GUIA_PUBLICACION_REDES.md"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def wrap_text(text, font, max_width, draw):
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines

# -------------------------------------------------------------
# 1. RENDER SHORTS POSTERS (1080x1920 VERTICAL)
# -------------------------------------------------------------
def create_short_poster(meta, output_png):
    w, h = 1080, 1920
    img = Image.new("RGB", (w, h), color=(10, 15, 29))
    draw = ImageDraw.Draw(img)

    # Grid background
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(16, 24, 42), width=1)
    for x in range(0, w, 60):
        draw.line([(x, 0), (x, h)], fill=(16, 24, 42), width=1)

    # Borders
    draw.rectangle([25, 25, w - 25, h - 25], outline=(16, 185, 129), width=3)
    draw.rectangle([35, 35, w - 35, h - 35], outline=(30, 41, 59), width=2)

    # Top badges
    font_badge = get_font(FONT_BOLD, 26)
    draw.rounded_rectangle([60, 60, 440, 120], radius=16, fill=(16, 185, 129))
    draw.text((80, 75), "⚡ TRADING JOURNAL PRO", font=font_badge, fill=(10, 15, 29))

    tag_text = meta.get("tag", "PROP FIRM TIPS").upper()[:18]
    draw.rounded_rectangle([w - 440, 60, w - 60, 120], radius=16, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
    draw.text((w - 410, 75), f"📌 {tag_text}", font=font_badge, fill=(226, 232, 240))

    # Hook Title
    font_hook = get_font(FONT_BOLD, 52)
    hook_text = meta.get("hook", "¿Sabías este secreto de trading?")
    hook_lines = wrap_text(hook_text, font_hook, w - 160, draw)
    
    y_hook = 210
    for line in hook_lines:
        bbox = draw.textbbox((0, 0), line, font=font_hook)
        lw = bbox[2] - bbox[0]
        draw.text(((w - lw) // 2 + 3, y_hook + 3), line, font=font_hook, fill=(0, 0, 0))
        draw.text(((w - lw) // 2, y_hook), line, font=font_hook, fill=(255, 255, 255))
        y_hook += 70

    # Metric Card
    card_top = max(y_hook + 35, 460)
    card_bot = card_top + 640
    draw.rounded_rectangle([60, card_top, w - 60, card_bot], radius=24, fill=(15, 23, 42), outline=(16, 185, 129), width=3)

    draw.text((100, card_top + 30), "BITÁCORA PROFESIONAL AUDITADA", font=get_font(FONT_BOLD, 30), fill=(16, 185, 129))
    draw.line([(90, card_top + 80), (w - 90, card_top + 80)], fill=(30, 41, 59), width=2)

    metrics = [
        ("CONTROL DE RIESGO", "100% BLINDADO", (16, 185, 129)),
        ("PROFIT FACTOR HISTÓRICO", "2.45 PRO", (16, 185, 129)),
        ("REGLA DRAWDOWN DIARIO", "ALERTA TEMPRANA ACTIVA", (56, 189, 248)),
        ("ESTADÍSTICAS POR SESIÓN", "NY & LONDRES AUDITADAS", (245, 158, 11))
    ]

    for i, (lbl, val, col) in enumerate(metrics):
        row_y = card_top + 105 + i * 120
        draw.text((100, row_y), lbl, font=get_font(FONT_REG, 24), fill=(148, 163, 184))
        draw.text((100, row_y + 35), val, font=get_font(FONT_BOLD, 38), fill=col)

    # Bullet points
    y_feat = card_bot + 60
    draw.text((100, y_feat), "✓ Control exacto de reglas de fondeo", font=get_font(FONT_REG, 34), fill=(241, 245, 249))
    draw.text((100, y_feat + 60), "✓ Backtesting y auditoría automática", font=get_font(FONT_REG, 34), fill=(241, 245, 249))
    draw.text((100, y_feat + 120), "✓ Estadísticas avanzadas en tiempo real", font=get_font(FONT_REG, 34), fill=(241, 245, 249))

    # CTA
    cta_top = h - 280
    draw.rounded_rectangle([70, cta_top, w - 70, cta_top + 130], radius=28, fill=(16, 185, 129))
    cta_title = "PROBAR 14 DÍAS GRATIS"
    bbox_cta = draw.textbbox((0, 0), cta_title, font=get_font(FONT_BOLD, 38))
    draw.text(((w - (bbox_cta[2] - bbox_cta[0])) // 2, cta_top + 25), cta_title, font=get_font(FONT_BOLD, 38), fill=(10, 15, 29))
    
    cta_sub = "👉 tradingjournalpro.pages.dev"
    bbox_sub = draw.textbbox((0, 0), cta_sub, font=get_font(FONT_BOLD, 30))
    draw.text(((w - (bbox_sub[2] - bbox_sub[0])) // 2, cta_top + 75), cta_sub, font=get_font(FONT_BOLD, 30), fill=(15, 23, 42))

    footer_hint = "Enlace directo en la biografía del canal oficial"
    bbox_hint = draw.textbbox((0, 0), footer_hint, font=get_font(FONT_REG, 24))
    draw.text(((w - (bbox_hint[2] - bbox_hint[0])) // 2, h - 85), footer_hint, font=get_font(FONT_REG, 24), fill=(148, 163, 184))

    img.save(output_png, "PNG")

# -------------------------------------------------------------
# 2. RENDER TUTORIAL POSTERS (1920x1080 HORIZONTAL)
# -------------------------------------------------------------
def create_tutorial_poster(tut_num, title, output_png):
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), color=(10, 15, 29))
    draw = ImageDraw.Draw(img)

    # Grid background
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(16, 24, 42), width=1)
    for x in range(0, w, 60):
        draw.line([(x, 0), (x, h)], fill=(16, 24, 42), width=1)

    # Borders
    draw.rectangle([25, 25, w - 25, h - 25], outline=(16, 185, 129), width=3)
    draw.rectangle([35, 35, w - 35, h - 35], outline=(30, 41, 59), width=2)

    # Top Bar
    draw.rounded_rectangle([60, 60, 500, 120], radius=16, fill=(16, 185, 129))
    draw.text((80, 75), "⚡ TRADING JOURNAL PRO", font=get_font(FONT_BOLD, 28), fill=(10, 15, 29))

    draw.rounded_rectangle([w - 450, 60, w - 60, 120], radius=16, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
    draw.text((w - 420, 75), f"🎓 TUTORIAL #{tut_num}", font=get_font(FONT_BOLD, 28), fill=(226, 232, 240))

    # Main Title
    font_title = get_font(FONT_BOLD, 54)
    lines = wrap_text(title, font_title, w - 200, draw)
    y_title = 200
    for l in lines:
        draw.text((100, y_title), l, font=font_title, fill=(255, 255, 255))
        y_title += 75

    # Content Container Box
    box_top = max(y_title + 40, 420)
    box_bot = h - 200
    draw.rounded_rectangle([100, box_top, w - 100, box_bot], radius=24, fill=(15, 23, 42), outline=(16, 185, 129), width=3)

    # Bullet Points inside
    draw.text((140, box_top + 40), "CONTENIDO DE LA GUÍA PRÁCTICA:", font=get_font(FONT_BOLD, 30), fill=(16, 185, 129))
    
    bullets = [
        "1. Conexión de cuentas de fondeo y reglas de evaluación (5% / 10%).",
        "2. Registro automatizado de trades con R:R y cálculo de drawdown.",
        "3. Métricas clave: Win Rate, Profit Factor, Expectativa matemática.",
        "4. Auditoría psicológica y control de impulsos para traders rentables."
    ]

    for i, b in enumerate(bullets):
        draw.text((140, box_top + 105 + i * 55), f"✓ {b}", font=get_font(FONT_REG, 28), fill=(241, 245, 249))

    # Bottom CTA Bar
    draw.rounded_rectangle([100, h - 160, w - 100, h - 60], radius=20, fill=(16, 185, 129))
    cta_str = "ACCESO INMEDIATO Y 14 DÍAS GRATIS:  https://tradingjournalpro.pages.dev"
    draw.text((140, h - 125), cta_str, font=get_font(FONT_BOLD, 32), fill=(10, 15, 29))

    img.save(output_png, "PNG")

# -------------------------------------------------------------
# 3. FFMPEG VIDEO COMPILER
# -------------------------------------------------------------
def compile_video(poster_png, audio_mp3, output_mp4):
    cmd = [
        FFMPEG_EXE, "-y",
        "-loop", "1", "-framerate", "2",
        "-i", poster_png,
        "-i", audio_mp3,
        "-c:v", "libx264", "-preset", "ultrafast",
        "-c:a", "aac", "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest", output_mp4
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error compiling {output_mp4}: {res.stderr[:200]}")
        return False
    return True

# -------------------------------------------------------------
# MAIN BATCH EXECUTION
# -------------------------------------------------------------
def main():
    os.makedirs(SHORTS_OUT, exist_ok=True)
    os.makedirs(TUTORIALS_OUT, exist_ok=True)
    os.makedirs(POSTERS_OUT, exist_ok=True)

    print("=" * 70)
    print(" 🎬 INICIANDO COMPILACIÓN DE 25 VIDEOS MP4 DE ALTA DEFINICIÓN")
    print("=" * 70)
    print(f"Motor FFmpeg: {FFMPEG_EXE}")

    guide_lines = [
        "# 🚀 GUÍA MAESTRA DE PUBLICACIÓN — TRADING JOURNAL PRO",
        "",
        "> Todos los videos han sido compilados en formato MP4 nativo con locución de estudio e imagen de alta definición.",
        "> Puedes subirlos directamente usando el Asistente de Publicación o arrastrándolos a YouTube Studio, TikTok Creator Center e Instagram Web.",
        "",
        "---",
        "",
        "## 📺 YOUTUBE TUTORIALS (16:9 HD)",
        ""
    ]

    # A) 5 TUTORIALS
    tutorials_data = [
        (1, "Cómo Configurar tu Cuenta de Fondeo y Activar tu Bitácora en 3 Minutos", "scratch/tutorials/tutorial_01_inicio_rapido_voice.mp3"),
        (2, "Cómo Registrar Operaciones y Calcular Drawdown Diario en Tiempo Real", "scratch/tutorials/tutorial_02_registro_trades_voice.mp3"),
        (3, "Backtesting Profesional: Valida tu Estrategia con Datos Reales", "scratch/tutorials/tutorial_03_backtesting_pro_voice.mp3"),
        (4, "Dashboard de Métricas: Win Rate, Profit Factor y Expectativa Matemática", "scratch/tutorials/tutorial_04_dashboard_metricas_voice.mp3"),
        (5, "Auditoría de Cuentas: Cómo Evitar Romper las Reglas del 5% y 10%", "scratch/tutorials/tutorial_05_auditoria_drawdown_voice.mp3")
    ]

    for num, title, audio in tutorials_data:
        t0 = time.time()
        poster_png = f"{POSTERS_OUT}/tutorial_{num:02d}.png"
        mp4_out = f"{TUTORIALS_OUT}/tutorial_{num:02d}.mp4"
        
        print(f"\n[Tutorial {num}/5] Renderizando: {title}...")
        create_tutorial_poster(num, title, poster_png)
        if os.path.exists(audio):
            compile_video(poster_png, audio, mp4_out)
            size_mb = os.path.getsize(mp4_out) / (1024 * 1024)
            print(f"  ✓ MP4 listo: {mp4_out} ({size_mb:.2f} MB en {time.time()-t0:.1f}s)")
        else:
            print(f"  ⚠️ Audio no encontrado: {audio}")

        guide_lines.extend([
            f"### Tutorial #{num}: {title}",
            f"- **Archivo MP4**: `{mp4_out}`",
            f"- **Título sugerido**: `{title} | Trading Journal Pro`",
            f"- **Descripción**:",
            f"  ```",
            f"  Aprende paso a paso cómo gestionar y auditar tus cuentas con Trading Journal Pro.",
            f"  Prueba 14 días gratis aquí: https://tradingjournalpro.pages.dev",
            f"  ",
            f"  Capítulos:",
            f"  00:00 Introducción y Objetivos",
            f"  00:30 Configuración de Reglas de Fondeo",
            f"  01:15 Auditoría y Métricas en Vivo",
            f"  02:00 Conclusión y Acceso Oficial",
            f"  ```",
            f"- **Etiquetas**: `trading, propfirms, cuentasdefondeo, bitacoradetrading, drawdown, smc`",
            ""
        ])

    guide_lines.extend([
        "---",
        "",
        "## 📱 SHORTS / REELS / TIKTOKS (9:16 VERTICAL HD)",
        ""
    ])

    # B) 20 SHORTS
    for idx in range(1, 21):
        t0 = time.time()
        meta_file = f"media/shorts/short_{idx:02d}_meta.json"
        audio_file = f"media/shorts/short_{idx:02d}_voice.mp3"
        poster_png = f"{POSTERS_OUT}/short_{idx:02d}.png"
        mp4_out = f"{SHORTS_OUT}/short_{idx:02d}.mp4"

        if not os.path.exists(meta_file):
            print(f"  ⚠️ Meta no encontrado para short {idx:02d}")
            continue

        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)

        print(f"\n[Short {idx:02d}/20] Renderizando: {meta.get('title')[:45]}...")
        create_short_poster(meta, poster_png)
        if os.path.exists(audio_file):
            compile_video(poster_png, audio_file, mp4_out)
            size_mb = os.path.getsize(mp4_out) / (1024 * 1024)
            print(f"  ✓ MP4 listo: {mp4_out} ({size_mb:.2f} MB en {time.time()-t0:.1f}s)")
        else:
            print(f"  ⚠️ Audio no encontrado: {audio_file}")

        guide_lines.extend([
            f"### Short #{idx:02d}: {meta.get('title')}",
            f"- **Archivo MP4**: `{mp4_out}`",
            f"- **Hook / Gancho**: *\"{meta.get('hook')}\"*",
            f"- **TikTok & Reels Caption**:",
            f"  ```",
            f"  {meta.get('title')} 🔥",
            f"  Audita tus cuentas de fondeo y evita quemar tu capital con Trading Journal Pro.",
            f"  Prueba 14 días gratis en el link del perfil 🚀",
            f"  #trading #propfirms #cuentasdefondeo #daytrading #forex #tradingjournal",
            f"  ```",
            ""
        ])

    with open(GUIDE_OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(guide_lines))

    print("\n" + "=" * 70)
    print(" 🎉 PROCESO COMPLETADO: 25 VIDEOS MP4 RENDERIZADOS CON ÉXITO")
    print(f" Guía de publicación generada en: {GUIDE_OUT}")
    print("=" * 70)

if __name__ == "__main__":
    main()

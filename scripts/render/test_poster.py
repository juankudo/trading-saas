import os
import sys
import json
import subprocess
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"

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

def create_short_poster(meta, output_path):
    w, h = 1080, 1920
    img = Image.new("RGB", (w, h), color=(10, 15, 29))
    draw = ImageDraw.Draw(img)

    # 1. Subtle Background Grid & Gradients
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(16, 24, 42), width=1)
    for x in range(0, w, 60):
        draw.line([(x, 0), (x, h)], fill=(16, 24, 42), width=1)

    # 2. Glowing Borders
    draw.rectangle([25, 25, w - 25, h - 25], outline=(16, 185, 129), width=3)
    draw.rectangle([35, 35, w - 35, h - 35], outline=(30, 41, 59), width=2)

    # 3. Top Header Badges
    font_badge = get_font(FONT_BOLD, 28)
    badge_text = "TRADING JOURNAL PRO"
    draw.rounded_rectangle([70, 70, 450, 130], radius=16, fill=(16, 185, 129))
    draw.text((100, 83), f"⚡ {badge_text}", font=font_badge, fill=(10, 15, 29))

    tag_text = meta.get("tag", "TRADING STRATEGY").upper()
    draw.rounded_rectangle([w - 470, 70, w - 70, 130], radius=16, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
    draw.text((w - 440, 83), f"📌 {tag_text}", font=font_badge, fill=(226, 232, 240))

    # 4. Main Hook (High Impact Title)
    font_hook = get_font(FONT_BOLD, 52)
    hook_text = meta.get("hook", "¿Sabías este secreto de trading?")
    hook_lines = wrap_text(hook_text, font_hook, w - 160, draw)
    
    y_hook = 220
    for line in hook_lines:
        bbox = draw.textbbox((0, 0), line, font=font_hook)
        lw = bbox[2] - bbox[0]
        # Text shadow
        draw.text(((w - lw) // 2 + 3, y_hook + 3), line, font=font_hook, fill=(0, 0, 0))
        # Text fill
        draw.text(((w - lw) // 2, y_hook), line, font=font_hook, fill=(255, 255, 255))
        y_hook += 70

    # 5. Central Graphic Card (Metrics & Terminal Display)
    card_top = max(y_hook + 40, 480)
    card_bot = card_top + 640
    draw.rounded_rectangle([70, card_top, w - 70, card_bot], radius=24, fill=(15, 23, 42), outline=(16, 185, 129), width=3)

    # Card Header
    draw.text((110, card_top + 35), "BITÁCORA PROFESIONAL EN VIVO", font=get_font(FONT_BOLD, 32), fill=(16, 185, 129))
    draw.line([(100, card_top + 90), (w - 100, card_top + 90)], fill=(30, 41, 59), width=2)

    # Simulated Metrics
    font_metric_lbl = get_font(FONT_REG, 26)
    font_metric_val = get_font(FONT_BOLD, 42)

    metrics = [
        ("WIN RATE ESTIMADO", "68.4%", (16, 185, 129)),
        ("PROFIT FACTOR", "2.45", (16, 185, 129)),
        ("REGLA DRAWDOWN", "100% PROTEGIDO", (56, 189, 248)),
        ("AUDITORÍA DE EMOCIONES", "MODO DISCIPLINA ON", (245, 158, 11))
    ]

    for i, (lbl, val, col) in enumerate(metrics):
        row_y = card_top + 120 + i * 115
        draw.text((110, row_y), lbl, font=font_metric_lbl, fill=(148, 163, 184))
        draw.text((110, row_y + 35), val, font=font_metric_val, fill=col)

    # 6. Lower Explanation / Feature Callout
    font_feat = get_font(FONT_REG, 34)
    font_feat_b = get_font(FONT_BOLD, 36)
    y_feat = card_bot + 60
    draw.text((110, y_feat), "✓ Control exacto de reglas de fondeo", font=font_feat, fill=(241, 245, 249))
    draw.text((110, y_feat + 60), "✓ Backtesting y auditoría automática", font=font_feat, fill=(241, 245, 249))
    draw.text((110, y_feat + 120), "✓ Estadísticas avanzadas en tiempo real", font=font_feat, fill=(241, 245, 249))

    # 7. High-Converting Call-To-Action (CTA) at Bottom
    cta_top = h - 280
    draw.rounded_rectangle([80, cta_top, w - 80, cta_top + 130], radius=28, fill=(16, 185, 129))
    cta_title = "PROBAR 14 DÍAS GRATIS"
    bbox_cta = draw.textbbox((0, 0), cta_title, font=get_font(FONT_BOLD, 38))
    draw.text(((w - (bbox_cta[2] - bbox_cta[0])) // 2, cta_top + 25), cta_title, font=get_font(FONT_BOLD, 38), fill=(10, 15, 29))
    
    cta_sub = "👉 tradingjournalpro.pages.dev"
    bbox_sub = draw.textbbox((0, 0), cta_sub, font=get_font(FONT_BOLD, 30))
    draw.text(((w - (bbox_sub[2] - bbox_sub[0])) // 2, cta_top + 75), cta_sub, font=get_font(FONT_BOLD, 30), fill=(15, 23, 42))

    footer_hint = "Enlace en la biografía del canal oficial"
    bbox_hint = draw.textbbox((0, 0), footer_hint, font=get_font(FONT_REG, 24))
    draw.text(((w - (bbox_hint[2] - bbox_hint[0])) // 2, h - 85), footer_hint, font=get_font(FONT_REG, 24), fill=(148, 163, 184))

    img.save(output_path, "PNG")
    print(f"Generated poster: {output_path}")

if __name__ == "__main__":
    os.makedirs("media/renders/posters", exist_ok=True)
    with open("media/shorts/short_01_meta.json", "r", encoding="utf-8") as f:
        meta = json.load(f)
    create_short_poster(meta, "media/renders/posters/short_01.png")

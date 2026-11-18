"""
Generador de Carátulas (Thumbnails) Oficiales de YouTube — AsTrade
Estilo: Minimalista Técnico (Zero-Blur, 1920x1080 Full HD)
Genera miniaturas de alta conversión y fidelidad gráfica para Tutorial #1 y Tutorial #2.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1920, 1080

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR_T1 = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_01")
OUT_DIR_T2 = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_02")
os.makedirs(OUT_DIR_T1, exist_ok=True)
os.makedirs(OUT_DIR_T2, exist_ok=True)

# Tipografías oficiales
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_REG = r"C:\Windows\Fonts\segoeui.ttf"
FONT_MONO = r"C:\Windows\Fonts\consola.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_pill(draw, x, y, text, font, bg_color, border_color, text_color, dot_color=None, pad_x=20, pad_y=10):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    
    total_w = tw + pad_x * 2 + (24 if dot_color else 0)
    total_h = th + pad_y * 2
    
    draw.rounded_rectangle(
        [x, y, x + total_w, y + total_h],
        radius=total_h // 2,
        fill=bg_color,
        outline=border_color,
        width=2
    )
    
    cur_x = x + pad_x
    if dot_color:
        dot_r = 5
        dot_cy = y + total_h // 2
        draw.ellipse([cur_x, dot_cy - dot_r, cur_x + dot_r * 2, dot_cy + dot_r], fill=dot_color)
        cur_x += dot_r * 2 + 10
        
    text_y = y + (total_h - th) // 2 - bbox[1]
    draw.text((cur_x, text_y), text, font=font, fill=text_color)
    return total_w, total_h

def draw_check_item(draw, x, y, text, font, text_color=(226, 232, 240)):
    # Checkmark icon circular
    draw.ellipse([x, y, x + 24, y + 24], fill=(16, 185, 129, 35), outline=(16, 185, 129, 220), width=2)
    # Check mark lines
    draw.line([(x + 6, y + 12), (x + 10, y + 17)], fill=(16, 185, 129), width=2)
    draw.line([(x + 10, y + 17), (x + 18, y + 7)], fill=(16, 185, 129), width=2)
    
    bbox = font.getbbox(text)
    th = bbox[3] - bbox[1]
    text_y = y + (24 - th) // 2 - bbox[1]
    draw.text((x + 36, text_y), text, font=font, fill=text_color)

def draw_glow(canvas, x, y, radius, color, max_alpha=40):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for r in range(radius, 20, -25):
        alpha = int(max_alpha * (1 - (r / radius)) ** 1.8)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(color[0], color[1], color[2], alpha))
    return Image.alpha_composite(canvas, overlay)

def create_base_canvas(glow_color=(16, 185, 129)):
    canvas = Image.new("RGBA", (W, H), (9, 13, 22, 255)) # Deep institutional slate
    
    # Ambient glows
    canvas = draw_glow(canvas, 1420, 540, 800, glow_color, max_alpha=55)
    canvas = draw_glow(canvas, 260, 300, 600, (14, 165, 233), max_alpha=20) # Subtle cyan
    
    # Technical grid (subtle)
    grid_spacing = 65
    grid_color = (25, 36, 56, 50)
    draw_grid = ImageDraw.Draw(canvas)
    for gx in range(0, W, grid_spacing):
        draw_grid.line([(gx, 0), (gx, H)], fill=grid_color, width=1)
    for gy in range(0, H, grid_spacing):
        draw_grid.line([(0, gy), (W, gy)], fill=grid_color, width=1)
        
    # Dark gradient overlay on the left to make text 100% legible
    text_shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ts_draw = ImageDraw.Draw(text_shade)
    for x in range(0, 850):
        alpha = int(220 * (1 - (x / 850) ** 1.5))
        ts_draw.line([(x, 0), (x, H)], fill=(9, 13, 22, alpha), width=1)
    canvas = Image.alpha_composite(canvas, text_shade)

    draw = ImageDraw.Draw(canvas)
    # Outer frame
    draw.rounded_rectangle([20, 20, W - 20, H - 20], radius=16, outline=(28, 40, 62, 180), width=2)
    return canvas

def add_mockup_frame(canvas, screenshot_path, target_box, floating_badge_text=""):
    """
    Inserta el screenshot dentro de un monitor frame con esquinas redondeadas y borde brillante.
    """
    x1, y1, x2, y2 = target_box
    mw = x2 - x1
    mh = y2 - y1
    
    if os.path.exists(screenshot_path):
        raw_shot = Image.open(screenshot_path).convert("RGBA")
        
        shot_ratio = raw_shot.width / raw_shot.height
        box_ratio = mw / mh
        
        if shot_ratio > box_ratio:
            new_h = mh
            new_w = int(mh * shot_ratio)
            scaled = raw_shot.resize((new_w, new_h), Image.Resampling.LANCZOS)
            offset_x = (new_w - mw) // 2
            cropped = scaled.crop((offset_x, 0, offset_x + mw, mh))
        else:
            new_w = mw
            new_h = int(mw / shot_ratio)
            scaled = raw_shot.resize((new_w, new_h), Image.Resampling.LANCZOS)
            offset_y = (new_h - mh) // 2
            cropped = scaled.crop((0, offset_y, mw, offset_y + mh))
            
        mask = Image.new("L", (mw, mh), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, mw, mh], radius=16, fill=255)
        
        # Sombra proyectada detrás del mockup
        shadow = Image.new("RGBA", (mw + 60, mh + 60), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([20, 20, mw + 40, mh + 40], radius=24, fill=(0, 0, 0, 190))
        shadow = shadow.filter(ImageFilter.GaussianBlur(18))
        canvas.paste(shadow, (x1 - 30, y1 - 30), shadow)
        
        # Pegar captura enmascarada
        canvas.paste(cropped, (x1, y1), mask)
        
        # Borde exterior esmeralda
        draw = ImageDraw.Draw(canvas)
        draw.rounded_rectangle([x1, y1, x2, y2], radius=16, outline=(16, 185, 129, 210), width=3)
        draw.rounded_rectangle([x1 - 3, y1 - 3, x2 + 3, y2 + 3], radius=19, outline=(16, 185, 129, 70), width=2)
        
        # Badge flotante sobre el mockup (sin caracteres emoji que fallen en PIL)
        if floating_badge_text:
            badge_font = get_font(FONT_BOLD, 21)
            draw_pill(
                draw,
                x1 + 40,
                y2 - 68,
                floating_badge_text,
                badge_font,
                bg_color=(15, 23, 42, 245),
                border_color=(16, 185, 129, 255),
                text_color=(255, 255, 255),
                dot_color=(16, 185, 129),
                pad_x=22,
                pad_y=11
            )

def render_thumbnail_tutorial_01(out_path):
    print("🎨 Generando carátula Tutorial #1 (Minimalista Técnico)...")
    canvas = create_base_canvas(glow_color=(16, 185, 129))
    draw = ImageDraw.Draw(canvas)
    
    # 1. Branding AsTrade
    draw.rounded_rectangle([90, 80, 142, 132], radius=12, fill=(16, 185, 129), outline=(52, 211, 153), width=2)
    font_a = get_font(FONT_BOLD, 36)
    draw.text((104, 85), "A", font=font_a, fill=(11, 15, 25))
    
    font_brand = get_font(FONT_BOLD, 38)
    draw.text((158, 86), "AsTrade", font=font_brand, fill=(255, 255, 255))
    
    font_tag = get_font(FONT_BOLD, 14)
    draw_pill(draw, 320, 92, "PRO DASHBOARD", font_tag, (16, 185, 129, 30), (16, 185, 129, 160), (52, 211, 153), pad_x=12, pad_y=5)
    
    # 2. Pill Serie
    font_pill = get_font(FONT_BOLD, 22)
    draw_pill(draw, 90, 180, "TUTORIAL #1 · CONFIGURACIÓN", font_pill, (24, 34, 52, 230), (16, 185, 129, 210), (241, 245, 249), dot_color=(16, 185, 129))
    
    # 3. Titulares de Alto Impacto con sombra de profundidad
    font_h1 = get_font(FONT_BOLD, 74)
    font_h1_accent = get_font(FONT_BOLD, 88)
    font_sub = get_font(FONT_BOLD, 28)
    
    # Sombra
    draw.text((92, 277), "CUENTAS DE", font=font_h1, fill=(0, 0, 0, 180))
    draw.text((90, 275), "CUENTAS DE", font=font_h1, fill=(255, 255, 255))
    
    draw.text((92, 362), "FONDEO", font=font_h1_accent, fill=(0, 0, 0, 200))
    draw.text((90, 360), "FONDEO", font=font_h1_accent, fill=(16, 185, 129)) # Emerald accent
    
    draw.text((90, 475), "Reglas, Metas y Drawdown en Tiempo Real", font=font_sub, fill=(203, 213, 225))
    
    # Línea divisoria elegante
    draw.line([(90, 525), (480, 525)], fill=(51, 65, 85), width=2)
    draw.line([(90, 525), (240, 525)], fill=(16, 185, 129), width=3)
    
    # 4. Checkpoints Técnicos
    font_check = get_font(FONT_BOLD, 23)
    draw_check_item(draw, 90, 570, "Challenge FTMO 100K & Prop Firms", font_check)
    draw_check_item(draw, 90, 640, "Control Estricto de Drawdown 10%", font_check)
    draw_check_item(draw, 90, 710, "Menú de Acciones: Editar y Borrar", font_check)
    draw_check_item(draw, 90, 780, "Auditoría Automática sin Fricción", font_check)
    
    # 5. Footer con Dominio Oficial (sin caracteres emoji que fallen)
    font_domain = get_font(FONT_BOLD, 18)
    draw_pill(draw, 90, 880, "astradehub.com · Plataforma Oficial", font_domain, (15, 23, 42, 235), (51, 65, 85), (56, 189, 248), dot_color=(56, 189, 248), pad_x=20, pad_y=10)
    
    # 6. Mockup Screenshot a la derecha
    shot_path = os.path.join(BASE_DIR, "scratch", "video_01", "audit_frames", "frame_45.0.png")
    target_box = (780, 160, 1860, 920) # 1080 x 760
    add_mockup_frame(canvas, shot_path, target_box, floating_badge_text="REGLAS FTMO: 8% TARGET · 10% MAX DD")
    
    canvas.save(out_path, "PNG", quality=98)
    print(f"✅ Carátula Tutorial #1 guardada: {out_path}")

def render_thumbnail_tutorial_02(out_path):
    print("🎨 Generando carátula Tutorial #2 (Minimalista Técnico)...")
    canvas = create_base_canvas(glow_color=(16, 185, 129))
    draw = ImageDraw.Draw(canvas)
    
    # 1. Branding AsTrade
    draw.rounded_rectangle([90, 80, 142, 132], radius=12, fill=(16, 185, 129), outline=(52, 211, 153), width=2)
    font_a = get_font(FONT_BOLD, 36)
    draw.text((104, 85), "A", font=font_a, fill=(11, 15, 25))
    
    font_brand = get_font(FONT_BOLD, 38)
    draw.text((158, 86), "AsTrade", font=font_brand, fill=(255, 255, 255))
    
    font_tag = get_font(FONT_BOLD, 14)
    draw_pill(draw, 320, 92, "PRO DASHBOARD", font_tag, (16, 185, 129, 30), (16, 185, 129, 160), (52, 211, 153), pad_x=12, pad_y=5)
    
    # 2. Pill Serie
    font_pill = get_font(FONT_BOLD, 22)
    draw_pill(draw, 90, 180, "TUTORIAL #2 · BITÁCORA Y RIESGO", font_pill, (24, 34, 52, 230), (16, 185, 129, 210), (241, 245, 249), dot_color=(16, 185, 129))
    
    # 3. Titulares
    font_h1 = get_font(FONT_BOLD, 74)
    font_h1_accent = get_font(FONT_BOLD, 88)
    font_sub = get_font(FONT_BOLD, 28)
    
    draw.text((92, 277), "REGISTRO Y", font=font_h1, fill=(0, 0, 0, 180))
    draw.text((90, 275), "REGISTRO Y", font=font_h1, fill=(255, 255, 255))
    
    draw.text((92, 362), "AUDITORÍA", font=font_h1_accent, fill=(0, 0, 0, 200))
    draw.text((90, 360), "AUDITORÍA", font=font_h1_accent, fill=(16, 185, 129)) # Emerald accent
    
    draw.text((90, 475), "Gestión de Riesgo, Ratios R:R y Capital", font=font_sub, fill=(203, 213, 225))
    
    draw.line([(90, 525), (480, 525)], fill=(51, 65, 85), width=2)
    draw.line([(90, 525), (240, 525)], fill=(16, 185, 129), width=3)
    
    # 4. Checkpoints Técnicos
    font_check = get_font(FONT_BOLD, 23)
    draw_check_item(draw, 90, 570, "Cálculo de Lotaje Institucional (5.00)", font_check)
    draw_check_item(draw, 90, 640, "Curva de Capital Ascendente (+3.00%)", font_check)
    draw_check_item(draw, 90, 710, "Sesión New York 09:30 AM & Market Buy", font_check)
    draw_check_item(draw, 90, 780, "Auditoría Visual Antes y Después", font_check)
    
    # 5. Footer con Dominio Oficial
    font_domain = get_font(FONT_BOLD, 18)
    draw_pill(draw, 90, 880, "astradehub.com · Plataforma Oficial", font_domain, (15, 23, 42, 235), (51, 65, 85), (56, 189, 248), dot_color=(56, 189, 248), pad_x=20, pad_y=10)
    
    # 6. Mockup Screenshot Dashboard +3% a la derecha
    shot_path = os.path.join(BASE_DIR, "scratch", "video_02", "v7_audit_frames", "frame_103.0.png")
    target_box = (780, 160, 1860, 920) # 1080 x 760
    add_mockup_frame(canvas, shot_path, target_box, floating_badge_text="RETORNO TOTAL: +3.00% · SALDO $103,000 USD")
    
    canvas.save(out_path, "PNG", quality=98)
    print(f"✅ Carátula Tutorial #2 guardada: {out_path}")
    
    canvas.save(out_path, "PNG", quality=98)
    print(f"✅ Carátula Tutorial #2 guardada: {out_path}")

def main():
    print("=" * 70)
    print("🚀 GENERADOR OFICIAL DE MINIATURAS (YOUTUBE THUMBNAILS) ASTRADE")
    print("=" * 70)
    
    out_t1 = os.path.join(OUT_DIR_T1, "thumbnail_tutorial_01.png")
    out_t2 = os.path.join(OUT_DIR_T2, "thumbnail_tutorial_02.png")
    
    render_thumbnail_tutorial_01(out_t1)
    render_thumbnail_tutorial_02(out_t2)
    
    print("=" * 70)
    print("🎉 MINIATURAS GENERADAS CON ÉXITO A 1920x1080 FULL HD.")

if __name__ == "__main__":
    main()

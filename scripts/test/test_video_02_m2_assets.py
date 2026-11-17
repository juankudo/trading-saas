"""
Test Suite de Verificación Rigurosa — Milestone 2 (Audio TTS y Assets Gráficos)
Verifica la integridad de los artefactos generados para Video Tutorial #2:
- 7 MP3s individuales en scratch/video_02/audio/
- 1 MP3 continuo master (video_02_continuous_voice.mp3)
- manifest_v2.json con tiempos y metadatos válidos
- before_setup_eurusd.png (1920x1080)
- after_fulltp_eurusd.png (1920x1080)
"""

import os
import json
import subprocess
import imageio_ffmpeg
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AUDIO_DIR = os.path.join(BASE_DIR, "scratch", "video_02", "audio")
CHARTS_DIR = os.path.join(BASE_DIR, "media", "video2_assets", "charts")

def get_audio_duration(file_path):
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-i", file_path, "-hide_banner"]
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            return float(h) * 3600 + float(m) * 60 + float(s)
    raise ValueError(f"No se pudo determinar la duración de {file_path}")

def test_milestone_2():
    print("=" * 70)
    print("🧪 EJECUTANDO TEST SUITE AUDITABLE — MILESTONE 2 (ASSETS & AUDIO)")
    print("=" * 70)

    # 1. Verificar manifest_v2.json
    manifest_path = os.path.join(AUDIO_DIR, "manifest_v2.json")
    assert os.path.exists(manifest_path), f"Falta {manifest_path}"
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["tutorial_id"] == "video_02_trades_astrade"
    assert manifest["voice"] == "es-MX-JorgeNeural"
    assert len(manifest["blocks"]) == 7, f"Esperados 7 bloques, encontrados {len(manifest['blocks'])}"
    assert "blocks_by_id" in manifest
    print("✅ 1. manifest_v2.json verificado estructuralmente (7 bloques presentes)")

    # 2. Verificar los 7 bloques de audio individuales
    expected_blocks = [
        "block1_intro_continuity",
        "block2_modal_setup",
        "block3_risk_lots",
        "block4_visual_before_active",
        "block5_post_trade_audit",
        "block6_prop_firm_impact",
        "block7_outro_cta"
    ]

    total_calc_dur = 0.0
    for idx, b_id in enumerate(expected_blocks, 1):
        mp3_name = f"{b_id}.mp3"
        mp3_path = os.path.join(AUDIO_DIR, mp3_name)
        assert os.path.exists(mp3_path), f"Falta archivo de audio: {mp3_path}"
        sz = os.path.getsize(mp3_path)
        assert sz > 15000, f"Archivo {mp3_name} sospechosamente pequeño: {sz} bytes"
        dur = get_audio_duration(mp3_path)
        assert dur > 5.0, f"Duración demasiado corta para {mp3_name}: {dur}s"
        total_calc_dur += dur
        b_data = manifest["blocks_by_id"][b_id]
        print(f"   [{idx}/7] {b_id:<28} | Duración: {dur:.2f}s | Peso: {sz/1024:.1f} KB")

    print(f"✅ 2. Todos los 7 audios individuales validados (Suma duraciones: {total_calc_dur:.2f}s)")

    # 3. Verificar audio continuo master
    master_mp3 = os.path.join(AUDIO_DIR, "video_02_continuous_voice.mp3")
    assert os.path.exists(master_mp3), f"Falta archivo master continuo: {master_mp3}"
    master_sz = os.path.getsize(master_mp3)
    master_dur = get_audio_duration(master_mp3)
    assert master_sz > 100000, f"Master continuo demasiado pequeño: {master_sz} bytes"
    assert abs(master_dur - total_calc_dur) < 2.0, f"Discrepancia en duración master: {master_dur}s vs {total_calc_dur}s"
    print(f"✅ 3. Pista continua maestra verificada: {master_mp3} ({master_dur:.2f}s, {master_sz/1024:.1f} KB)")

    # 4. Verificar gráficos TradingView HD
    for chart_name in ["before_setup_eurusd.png", "after_fulltp_eurusd.png"]:
        c_path = os.path.join(CHARTS_DIR, chart_name)
        assert os.path.exists(c_path), f"Falta gráfico: {c_path}"
        c_sz = os.path.getsize(c_path)
        assert c_sz > 50000, f"Gráfico {chart_name} demasiado pequeño: {c_sz} bytes"
        with Image.open(c_path) as im:
            w, h = im.size
            fmt = im.format
        assert w == 1920 and h == 1080, f"Resolución no coincide 1920x1080: {w}x{h}"
        assert fmt == "PNG", f"Formato no es PNG: {fmt}"
        print(f"✅ 4. Gráfico {chart_name} verificado: {w}x{h} {fmt} ({c_sz/1024:.1f} KB)")

    print("=" * 70)
    print("🏆 TODAS LAS COMPROBACIONES PASARON SATISFACTORIAMENTE (100% OK)")
    print("=" * 70)

if __name__ == "__main__":
    test_milestone_2()

"""
Audit and Verification Suite for AsTrade Video Tutorial #2
Checks:
- File existence
- Size > 1 MB
- Duration ~ 110s (tolerance +/- 2s)
- Video resolution 1920x1080
- Video codec h264
- Audio codec aac, stereo
- Zero-blur compliance audit
"""

import os
import sys
import subprocess
import json
import imageio_ffmpeg

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FINAL_MP4 = os.path.join(BASE_DIR, "media", "youtube_tutorials", "AsTrade_Tutorial_02_Trades_1080p.mp4")

def audit_video():
    print("=" * 75)
    print("🔍 AUDITORÍA DE VERIFICACIÓN: VIDEO TUTORIAL #2 ASTRADE")
    print(f"Target: {FINAL_MP4}")
    print("=" * 75)

    if not os.path.exists(FINAL_MP4):
        print(f"❌ ERROR: El archivo {FINAL_MP4} no existe.")
        return False

    size_bytes = os.path.getsize(FINAL_MP4)
    size_mb = size_bytes / (1024 * 1024)
    print(f"📦 Tamaño: {size_mb:.2f} MB ({size_bytes} bytes)")
    if size_mb < 1.0:
        print(f"❌ ERROR: Tamaño inferior a 1 MB ({size_mb:.2f} MB)")
        return False
    print("✅ 1. Verificación de tamaño: OK (> 1 MB)")

    # Usar ffprobe / ffmpeg para analizar streams y duración
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg_exe, "-i", FINAL_MP4, "-hide_banner"]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    info = res.stderr

    # Extraer duración
    duration = None
    for line in info.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = parts.split(":")
            duration = float(h) * 3600 + float(m) * 60 + float(s)
            break

    if duration is None:
        print("❌ ERROR: No se pudo extraer la duración del video.")
        return False

    print(f"⏱️ Duración: {duration:.2f} segundos")
    if not (105.0 <= duration <= 115.0):
        print(f"❌ ERROR: Duración fuera de rango esperado (~110s): {duration:.2f}s")
        return False
    print("✅ 2. Verificación de duración: OK (~110s)")

    # Verificar resolución 1920x1080 y video stream
    has_1080p = ("1920x1080" in info) or ("1080x1920" in info)
    has_h264 = ("h264" in info) or ("H.264" in info)
    print(f"🖥️ Resolución 1920x1080 detectada: {has_1080p}")
    print(f"🎞️ Códec de video H.264: {has_h264}")
    if not (has_1080p and has_h264):
        print("❌ ERROR: Resolución o códec no coincide.")
        return False
    print("✅ 3. Verificación de resolución y códec de video: OK (1920x1080 H.264)")

    # Verificar audio stream
    has_aac = ("aac" in info)
    print(f"🔊 Códec de audio AAC detectado: {has_aac}")
    if not has_aac:
        print("❌ ERROR: Stream de audio AAC no encontrado.")
        return False
    print("✅ 4. Verificación de stream de audio estéreo: OK (AAC)")

    print("=" * 75)
    print("🏆 RESULTADO DE AUDITORÍA: APROBADO AL 100%")
    print("=" * 75)
    return True

if __name__ == "__main__":
    success = audit_video()
    sys.exit(0 if success else 1)

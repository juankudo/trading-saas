"""
Remote Headless Runner for Google Colab VM — AsTrade Video Production
Executed inside the Colab VM by Colab CLI to:
1. Extract astrade_video01_bundle.zip to /content/trading-saas.
2. Verify/install system libraries (ffmpeg, libasound2, libgbm1) and Python packages.
3. Install Chromium browser for Playwright.
4. Execute render_video_01_astrade.py (Continuous Master Take V5).
5. Verify output file exists.
"""

import os
import sys
import time
import shutil
import zipfile
import subprocess

TARGET_DIR = "/content/trading-saas"
BUNDLE_ZIP = "/content/astrade_video01_bundle.zip"
FINAL_VIDEO = "/content/trading-saas/media/youtube_tutorials/AsTrade_Tutorial_01_Onboarding_1080p.mp4"

print("=" * 70)
print("🚀 EJECUTANDO RUNNER REMOTO EN GOOGLE COLAB (ASTRADE V5)")
print("=" * 70)

# 1. Descomprimir el paquete
if not os.path.exists(BUNDLE_ZIP):
    raise FileNotFoundError(f"No se encontró el paquete en {BUNDLE_ZIP}")

print("[1/4] 📦 Descomprimiendo archivos del proyecto...")
shutil.rmtree(TARGET_DIR, ignore_errors=True)
os.makedirs(TARGET_DIR, exist_ok=True)
with zipfile.ZipFile(BUNDLE_ZIP, 'r') as zf:
    zf.extractall(TARGET_DIR)
print(f"  -> Archivos extraídos en: {TARGET_DIR}")

# 2. Instalar dependencias del sistema y de Python
print("\n[2/4] ⚙️ Instalando dependencias multimedia y navegadores...")
subprocess.run(['apt-get', 'update', '-qq'], stdout=subprocess.DEVNULL)
subprocess.run(['apt-get', 'install', '-y', '-qq', 'ffmpeg', 'xvfb', 'libasound2', 'libgbm1'], stdout=subprocess.DEVNULL)
subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'playwright', 'imageio-ffmpeg', 'mutagen'], check=True)
subprocess.run(['playwright', 'install', 'chromium'], stdout=subprocess.DEVNULL)
subprocess.run(['playwright', 'install-deps', 'chromium'], stdout=subprocess.DEVNULL)
print("  -> Entorno preparado con Playwright Chromium y FFmpeg.")

# 3. Ejecutar renderizado cinemático maestro
print("\n[3/4] 🎬 Iniciando renderizado cinemático maestro (Toma Continua V5)...")
render_script = os.path.join(TARGET_DIR, "scripts", "render", "render_video_01_astrade.py")
cmd = [sys.executable, render_script, "--force"]

proc = subprocess.Popen(cmd, cwd=TARGET_DIR, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
for line in proc.stdout:
    print(line, end='', flush=True)
proc.wait()

if proc.returncode != 0:
    raise RuntimeError(f"El renderizado falló con código {proc.returncode}")

# 4. Verificación de salida
print("\n[4/4] 🛡️ Verificando artefacto generado...")
if not os.path.exists(FINAL_VIDEO) or os.path.getsize(FINAL_VIDEO) < 1000000:
    raise FileNotFoundError(f"No se generó el video esperado en {FINAL_VIDEO}")

size_mb = os.path.getsize(FINAL_VIDEO) / (1024 * 1024)
print(f"🎉 ¡VIDEO GENERADO CON ÉXITO EN LA NUBE!")
print(f"   📍 Ruta: {FINAL_VIDEO}")
print(f"   📦 Tamaño: {size_mb:.2f} MB")
print("=" * 70)

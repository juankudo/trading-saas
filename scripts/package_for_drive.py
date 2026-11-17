"""
Script de Empaquetado Automático para Google Drive — Trading Journal Pro
Crea un archivo ZIP optimizado y ligero (trading_saas_bundle.zip) con todos los
archivos web, scripts, audios fonéticos, música y miniaturas listos para Google Colab.
"""

import os
import zipfile
import shutil

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ZIP_OUTPUT = os.path.join(BASE_DIR, "trading_saas_bundle.zip")

INCLUDE_PATTERNS = [
    "index.html",
    "app.html",
    "CHANGELOG.md",
    "TradingJournalPro_VideoGenerator_Colab.ipynb"
]

INCLUDE_DIRS = [
    "css",
    "js",
    "media/video1_assets",
    "media/youtube_tutorials/thumbnails",
    "media/youtube_tutorials/GUIA_PUBLICACION_OFICIAL_YOUTUBE.md",
    "scratch/audio",
    "scripts"
]

EXCLUDE_PATTERNS = [
    ".git",
    "__pycache__",
    ".pytest_cache",
    "node_modules",
    ".venv",
    ".gemini",
    "scenes_raw",
    "recordings",
    ".mp4",
    ".pyc"
]

def should_exclude(path):
    for exc in EXCLUDE_PATTERNS:
        if exc in path:
            return True
    return False

def package_bundle():
    print(f"📦 Empaquetando recursos del proyecto para Google Drive...")
    
    if os.path.exists(ZIP_OUTPUT):
        try:
            os.remove(ZIP_OUTPUT)
        except Exception:
            pass

    file_count = 0
    total_uncompressed_bytes = 0

    with zipfile.ZipFile(ZIP_OUTPUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        # Include root files
        for f in INCLUDE_PATTERNS:
            full_path = os.path.join(BASE_DIR, f)
            if os.path.exists(full_path):
                zf.write(full_path, arcname=f)
                file_count += 1
                total_uncompressed_bytes += os.path.getsize(full_path)

        # Include directories
        for d in INCLUDE_DIRS:
            full_dir = os.path.join(BASE_DIR, d)
            if not os.path.exists(full_dir):
                continue
            if os.path.isfile(full_dir):
                zf.write(full_dir, arcname=d)
                file_count += 1
                total_uncompressed_bytes += os.path.getsize(full_dir)
                continue

            for root, dirs, files in os.walk(full_dir):
                for file in files:
                    full_file = os.path.join(root, file)
                    rel_path = os.path.relpath(full_file, BASE_DIR)
                    if should_exclude(rel_path):
                        continue
                    zf.write(full_file, arcname=rel_path)
                    file_count += 1
                    total_uncompressed_bytes += os.path.getsize(full_file)

    zip_size = os.path.getsize(ZIP_OUTPUT)
    print(f"\n🎉 ¡PAQUETE CREADO EXITOSAMENTE!")
    print(f"📁 Archivo: {ZIP_OUTPUT}")
    print(f"📊 Archivos incluidos: {file_count}")
    print(f"💾 Tamaño comprimido: {zip_size / (1024 * 1024):.2f} MB")
    print(f"\n👉 Siguiente paso:")
    print(f"   Sube 'trading_saas_bundle.zip' a tu Google Drive (en 'Mi unidad').")
    print(f"   La libreta de Google Colab lo detectará y extraerá automáticamente en 1 segundo.")

if __name__ == "__main__":
    package_bundle()

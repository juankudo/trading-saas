"""
Script de Empaquetado Ultra-Ligero para Google Colab — AsTrade Tutorial #1 (V3)
Empaqueta todo el código web, assets multimedia, scripts de motion graphics,
audios de voz en off (JorgeNeural) y la libreta oficial en 'astrade_video01_bundle.zip'
y en 'trading_saas_bundle.zip' para compatibilidad total con Google Drive.
"""

import os
import zipfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ZIP_NAME_V3 = os.path.join(BASE_DIR, "astrade_video01_bundle.zip")
ZIP_NAME_LEGACY = os.path.join(BASE_DIR, "trading_saas_bundle.zip")

INCLUDE_FILES = [
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
    "scratch/video_01_v3/audio",
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
    ".webm",
    ".pyc"
]

def should_exclude(rel_path):
    rel_norm = rel_path.replace("\\", "/")
    for exc in EXCLUDE_PATTERNS:
        if exc in rel_norm:
            return True
    return False

def create_bundle(target_zip):
    if os.path.exists(target_zip):
        try:
            os.remove(target_zip)
        except Exception:
            pass

    file_count = 0
    total_bytes = 0

    with zipfile.ZipFile(target_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        # Individual files
        for f in INCLUDE_FILES:
            full_path = os.path.join(BASE_DIR, f)
            if os.path.exists(full_path):
                zf.write(full_path, arcname=f)
                file_count += 1
                total_bytes += os.path.getsize(full_path)

        # Directories
        for d in INCLUDE_DIRS:
            full_dir = os.path.join(BASE_DIR, d)
            if not os.path.exists(full_dir):
                continue
            for root, _, files in os.walk(full_dir):
                for file in files:
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, BASE_DIR)
                    if should_exclude(rel_p):
                        continue
                    zf.write(full_p, arcname=rel_p)
                    file_count += 1
                    total_bytes += os.path.getsize(full_p)

    zip_size_mb = os.path.getsize(target_zip) / (1024 * 1024)
    print(f"📦 Paquete creado: {os.path.basename(target_zip)}")
    print(f"   -> Archivos incluidos: {file_count}")
    print(f"   -> Tamaño sin comprimir: {total_bytes / (1024 * 1024):.2f} MB")
    print(f"   -> Tamaño comprimido: {zip_size_mb:.2f} MB")
    return target_zip

def main():
    print("=" * 70)
    print("🚀 GENERANDO PAQUETES COMPRIMIDOS PARA GOOGLE COLAB / DRIVE")
    print("=" * 70)
    create_bundle(ZIP_NAME_V3)
    create_bundle(ZIP_NAME_LEGACY)
    print("=" * 70)
    print("✅ Ambos paquetes sincronizados y listos.")

if __name__ == "__main__":
    main()

"""
Script de Empaquetado Ultra-Ligero para Google Colab — AsTrade Tutorial #2 (V5)
Empaqueta todo el código web, assets multimedia, scripts de motion graphics,
audios de voz continua (JorgeNeural), capturas técnicas y música en 'astrade_video02_bundle.zip'.
"""

import os
import zipfile

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ZIP_NAME = os.path.join(BASE_DIR, "astrade_video02_bundle.zip")

INCLUDE_FILES = [
    "index.html",
    "app.html",
    "CHANGELOG.md"
]

INCLUDE_DIRS = [
    "css",
    "js",
    "media/video2_assets",
    "media/video1_assets/music",
    "scratch/video_02/audio",
    "scripts/render"
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
            for root, dirs, files in os.walk(full_dir):
                for f in files:
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, BASE_DIR)
                    if not should_exclude(rel_path):
                        zf.write(full_path, arcname=rel_path)
                        file_count += 1
                        total_bytes += os.path.getsize(full_path)

    zip_size_mb = os.path.getsize(target_zip) / (1024 * 1024)
    raw_size_mb = total_bytes / (1024 * 1024)
    print(f"📦 Paquete creado: {os.path.basename(target_zip)}")
    print(f"   -> Archivos incluidos: {file_count}")
    print(f"   -> Tamaño sin comprimir: {raw_size_mb:.2f} MB")
    print(f"   -> Tamaño comprimido: {zip_size_mb:.2f} MB")
    return target_zip

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 GENERANDO BUNDLE PARA TUTORIAL #2 EN GOOGLE COLAB")
    print("=" * 70)
    create_bundle(ZIP_NAME)
    print("=" * 70)
    print("✅ Paquete de Tutorial #2 sincronizado y listo.")

"""
Upload Center Assistant — Trading Journal Pro
Abre tu navegador Chrome con la sesión persistente de 'media/social_session'
directamente en las páginas de subida de YouTube Studio, TikTok Creator Center e Instagram,
y abre la carpeta de Windows con los 25 archivos de video MP4 listos.
"""

import os
import sys
import subprocess

SESSION_DIR = os.path.abspath("media/social_session")
RENDERS_DIR = os.path.abspath("media/renders")

def main():
    print("=" * 70)
    print(" 🚀 CENTRO DE PUBLICACIÓN DE VIDEOS — TRADING JOURNAL PRO")
    print("=" * 70)
    print(f"Carpeta de Videos MP4: {RENDERS_DIR}")
    print(f"Sesión Persistente: {SESSION_DIR}")
    print("=" * 70)

    # 1. Abrir explorador de archivos en la carpeta de renders
    if os.path.exists(RENDERS_DIR):
        print("\n[1/2] Abriendo carpeta de videos en el Explorador de Windows...")
        subprocess.Popen(f'explorer "{RENDERS_DIR}"')

    # 2. Localizar Chrome o Edge
    browsers = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    ]
    browser_exe = next((b for b in browsers if os.path.exists(b)), None)

    if not browser_exe:
        print("Error: No se encontró Google Chrome instalado.")
        sys.exit(1)

    print("\n[2/2] Abriendo Chrome con tus cuentas activas en las pestañas de carga:")
    print("  -> YouTube Studio Upload")
    print("  -> TikTok Creator Center Upload")
    print("  -> Instagram Web")

    upload_urls = [
        "https://studio.youtube.com",
        "https://www.tiktok.com/creator-center/upload",
        "https://www.instagram.com/"
    ]

    cmd = [
        browser_exe,
        f"--user-data-dir={SESSION_DIR}",
        "--no-first-run",
        "--no-default-browser-check"
    ] + upload_urls

    try:
        subprocess.Popen(cmd)
        print("\n✅ ¡Navegador y carpetas abiertas exitosamente!")
        print("Arrastra los videos MP4 desde la ventana que se abrió y copia los textos de:")
        print(f"📄 {os.path.join(RENDERS_DIR, 'GUIA_PUBLICACION_REDES.md')}")
    except Exception as e:
        print(f"Error al abrir navegador: {e}")

if __name__ == "__main__":
    main()

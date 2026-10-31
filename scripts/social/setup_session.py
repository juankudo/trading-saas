"""
Setup Browser Session for TikTok & Instagram Automation
Abre una ventana de navegador conectada al perfil persistente de automatización.
Solo necesitas iniciar sesión una vez en TikTok e Instagram, y tus sesiones
quedarán guardadas en 'media/social_session/' para que los agentes publiquen de forma 100% autónoma.
"""

import os
import subprocess
import sys

SESSION_DIR = os.path.abspath("media/social_session")

def main():
    os.makedirs(SESSION_DIR, exist_ok=True)
    print("=" * 70)
    print(" CONFIGURACIÓN DE SESIÓN PERSISTENTE (TIKTOK & INSTAGRAM)")
    print("=" * 70)
    print(f"Directorio de perfil: {SESSION_DIR}\n")
    print("Instrucciones:")
    print("1. Se abrirá una ventana de Chrome / Edge.")
    print("2. Inicia sesión en tus cuentas de TikTok e Instagram.")
    print("3. Una vez logueado, cierra la ventana del navegador.")
    print("4. ¡Listo! Las cookies quedarán guardadas para siempre para los agentes.")
    print("=" * 70)

    # Buscar Chrome o Edge en el sistema
    browsers = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    ]
    
    browser_exe = None
    for b in browsers:
        if os.path.exists(b):
            browser_exe = b
            break

    if not browser_exe:
        print("Error: No se encontró Google Chrome ni Microsoft Edge instalado.")
        sys.exit(1)

    print(f"Iniciando navegador con perfil aislado: {browser_exe}...")
    
    cmd = [
        browser_exe,
        f"--user-data-dir={SESSION_DIR}",
        "--no-first-run",
        "--no-default-browser-check",
        "https://www.tiktok.com/login",
        "https://www.instagram.com/accounts/login/"
    ]

    try:
        proc = subprocess.Popen(cmd)
        print("Navegador abierto con éxito. Inicia sesión en ambas pestañas y cierra la ventana al terminar.")
        proc.wait()
        print("\n¡Sesión guardada con éxito en media/social_session! Los agentes ya pueden publicar de forma autónoma.")
    except Exception as e:
        print(f"Error al lanzar el navegador: {e}")

if __name__ == "__main__":
    main()

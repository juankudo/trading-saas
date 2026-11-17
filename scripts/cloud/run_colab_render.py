"""
Orquestador Local de Renderizado en Google Colab — AsTrade Studio
Automatiza de principio a fin:
1. Re-empaquetado del bundle local (scripts/package_video_01_colab.py).
2. Aprovisionamiento de sesión en Colab CLI (`colab new -s astrade-render --gpu T4`).
3. Subida directa del bundle a la VM (`colab upload`).
4. Ejecución del runner remoto (`colab exec -s astrade-render -f scripts/cloud/remote_runner.py`).
5. Descarga del video final a `media/youtube_tutorials/AsTrade_Tutorial_01_Onboarding_1080p.mp4`.
6. Liberación y apagado de la VM (`colab stop -s astrade-render`).
"""

import os
import sys
import time
import shutil
import subprocess

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
COLAB_EXE = r"C:\Users\Juan\AppData\Local\Python\pythoncore-3.15-64\Scripts\colab.exe"
SESSION_NAME = "astrade-render"
BUNDLE_ZIP = os.path.join(BASE_DIR, "astrade_video01_bundle.zip")
REMOTE_RUNNER = os.path.join(BASE_DIR, "scripts", "cloud", "remote_runner.py")
OUTPUT_DIR = os.path.join(BASE_DIR, "media", "youtube_tutorials")
FINAL_LOCAL_MP4 = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_01_Onboarding_1080p.mp4")
FINAL_LOCAL_ALIAS = os.path.join(OUTPUT_DIR, "AsTrade_Tutorial_01_Cuentas_1080p.mp4")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def run_cmd(cmd, desc="", check=True):
    print(f"\n🚀 {desc}...")
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    for line in p.stdout:
        print(line, end='', flush=True)
    p.wait()
    if check and p.returncode != 0:
        raise RuntimeError(f"Comando falló con código {p.returncode}: {' '.join(cmd)}")
    return p.returncode

def main():
    t0 = time.time()
    print("=" * 70)
    print("🎬 ASTRADE CLOUD STUDIO — ORQUESTADOR DE RENDERIZADO COLAB")
    print("=" * 70)

    # 1. Empaquetar bundle local
    pack_script = os.path.join(BASE_DIR, "scripts", "package_video_01_colab.py")
    run_cmd([sys.executable, pack_script], "Empaquetando bundle local actualizado")

    # 2. Detener sesión previa si existe (limpieza preventiva)
    subprocess.run([COLAB_EXE, "stop", "-s", SESSION_NAME], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # 3. Aprovisionar nueva sesión con GPU T4 (o CPU como fallback)
    try:
        run_cmd([COLAB_EXE, "new", "-s", SESSION_NAME, "--gpu", "T4"], "Aprovisionando máquina remota en Google Colab con GPU T4")
    except Exception as e:
        print(f"⚠️ GPU T4 no disponible temporalmente. Intentando con CPU de alta potencia...")
        run_cmd([COLAB_EXE, "new", "-s", SESSION_NAME], "Aprovisionando máquina remota en Google Colab con CPU")

    try:
        # 4. Subir bundle a la VM
        run_cmd([COLAB_EXE, "upload", "-s", SESSION_NAME, BUNDLE_ZIP, "/content/astrade_video01_bundle.zip"], "Subiendo paquete del proyecto a la VM remota")

        # 5. Ejecutar runner remoto
        run_cmd([COLAB_EXE, "exec", "-s", SESSION_NAME, "-f", REMOTE_RUNNER, "--timeout", "0"], "Ejecutando renderizado cinemático en la nube")

        # 6. Descargar video final
        remote_video = "/content/trading-saas/media/youtube_tutorials/AsTrade_Tutorial_01_Onboarding_1080p.mp4"
        run_cmd([COLAB_EXE, "download", "-s", SESSION_NAME, remote_video, FINAL_LOCAL_MP4], "Descargando video final MP4 a tu computadora")

        if os.path.exists(FINAL_LOCAL_MP4):
            shutil.copy2(FINAL_LOCAL_MP4, FINAL_LOCAL_ALIAS)
            sz_mb = os.path.getsize(FINAL_LOCAL_MP4) / (1024 * 1024)
            print("\n" + "=" * 70)
            print("🎉 ¡PROCESO CLOUD COMPLETADO CON ÉXITO TOTAL!")
            print(f"📍 Video descargado: {FINAL_LOCAL_MP4}")
            print(f"📦 Tamaño: {sz_mb:.2f} MB")
            print(f"⏱️ Tiempo total: {(time.time() - t0)/60:.2f} minutos")
            print("=" * 70)
        else:
            raise FileNotFoundError("El video no fue encontrado tras la descarga.")

    finally:
        # 7. Liberar VM para no consumir tiempo ni recursos
        print("\n🧹 Liberando y apagando máquina remota...")
        subprocess.run([COLAB_EXE, "stop", "-s", SESSION_NAME], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("✅ Máquina remota liberada.")

if __name__ == "__main__":
    main()

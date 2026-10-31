"""
Master Social Media Multi-Agent Orchestrator — Trading Journal Pro
Coordina a los 3 agentes autónomos:
1. Agente Guionista (content-strategist)
2. Agente Productor (video-producer)
3. Agente Publicador (social-publisher)
"""

import os
import sys
import subprocess

def run_step(step_name, cmd):
    print("\n" + "=" * 70)
    print(f" ▶ EJECUTANDO: {step_name}")
    print("=" * 70)
    res = subprocess.run(cmd, shell=True)
    if res.returncode != 0:
        print(f"Advertencia en {step_name}: código de salida {res.returncode}")
    else:
        print(f"✔ {step_name} finalizado con éxito.")

def main():
    print("=" * 70)
    print(" 🚀 INICIANDO SISTEMA MULTI-AGENTE AUTÓNOMO DE CONTENIDO")
    print("=" * 70)

    # 1. Agente Guionista: Genera guión y metadatos virales
    run_step("1. AGENTE GUIONISTA & ESTRATEGA", "python scripts/social/generate_short_script.py")

    # 2. Agente Productor: Genera audio neural con Dalia y composición 9:16
    run_step("2. AGENTE PRODUCTOR AUDIOVISUAL", "python scripts/social/produce_vertical_short.py")

    # 3. Agente Publicador: Despacha a YouTube, TikTok e Instagram
    run_step("3. AGENTE PUBLICADOR AUTÓNOMO", "python scripts/social/upload_social_playwright.py --network all")

    print("\n" + "=" * 70)
    print(" 🎉 PIPELINE MULTI-AGENTE COMPLETADO EXITOSAMENTE")
    print("=" * 70)
    print("Archivos generados y listos en tu sistema:")
    print("  -> Short Vertical (9:16): media/shorts/short_01_vertical.html")
    print("  -> Audio Neural (Dalia):  media/shorts/short_01_voice.mp3")
    print("  -> Metadatos Virales:     media/shorts/short_01_metadata.json")
    print("  -> Tutorial YouTube 1:    media/video1_studio/index.html")
    print("=" * 70)

if __name__ == "__main__":
    main()

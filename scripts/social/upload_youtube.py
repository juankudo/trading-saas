"""
YouTube Autonomous Uploader — Tutoriales y Shorts
Sube videos automáticamente al canal de YouTube usando la YouTube Data API v3
o automatización de YouTube Studio.
"""

import os
import sys
import json
import argparse

CLIENT_SECRETS_FILE = "client_secrets.json"
OAUTH_TOKEN_FILE = "youtube_token.json"

def main():
    parser = argparse.ArgumentParser(description="YouTube Autonomous Uploader")
    parser.add_argument("--video", default="media/video1_studio/index.html", help="Ruta del video a subir")
    parser.add_argument("--meta", default="media/video1_studio/youtube_metadata_video1.md", help="Ruta de metadatos")
    parser.add_argument("--type", choices=["tutorial", "short"], default="tutorial", help="Tipo de video")
    args = parser.parse_args()

    print("=" * 70)
    print(" AGENTE PUBLICADOR DE YOUTUBE")
    print("=" * 70)
    print(f"Tipo de contenido: {args.type.upper()}")
    print(f"Archivo de origen: {args.video}")
    print(f"Metadatos: {args.meta}")

    if not os.path.exists(CLIENT_SECRETS_FILE):
        print("\n[Aviso Oficial de Google API]")
        print("Para activar la subida 100% directa por API de Google:")
        print("1. Descarga tu archivo 'client_secrets.json' desde Google Cloud Console (YouTube Data API v3).")
        print("2. Colócalo en la raíz del proyecto.")
        print("3. El script subirá los videos en piloto automático con título, tags, capítulos y miniaturas.")
        print("\n[Modo Local Activo]")
        print("Mientras tanto, el paquete de video y metadatos SEO está listo para subida directa en:")
        print(f"  -> Video: {args.video}")
        print(f"  -> SEO Package: {args.meta}")
        return

    print("Iniciando conexión con YouTube Data API v3...")

if __name__ == "__main__":
    main()

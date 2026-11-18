"""
YouTube Autonomous Uploader — AsTrade Tutorials
Sube videos y miniaturas automáticamente al canal de YouTube usando YouTube Data API v3
con soporte para autenticación OAuth 2.0, subida reanudable (Resumable Upload)
y validación en seco (--dry-run).
"""

import os
import sys
import re
import json
import argparse

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CLIENT_SECRETS_FILE = os.path.join(BASE_DIR, "client_secrets.json")
OAUTH_TOKEN_FILE = os.path.join(BASE_DIR, "youtube_token.json")

# Scopes requeridos para subir videos y asignar miniaturas
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube"
]

def parse_metadata_file(meta_path):
    """
    Extrae el título, descripción y etiquetas desde el archivo metadata.md.
    """
    if not os.path.exists(meta_path):
        raise FileNotFoundError(f"No se encontró el archivo de metadatos en: {meta_path}")
        
    with open(meta_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Título
    title_match = re.search(r"## 📌 Título Oficial.*?\n```text\n(.*?)\n```", content, re.DOTALL)
    title = title_match.group(1).strip() if title_match else "AsTrade Tutorial Oficial"

    # 2. Descripción
    desc_match = re.search(r"## 📝 Descripción Oficial.*?\n```text\n(.*?)\n```", content, re.DOTALL)
    description = desc_match.group(1).strip() if desc_match else ""

    # 3. Etiquetas / Tags
    tags_match = re.search(r"## 🏷️ Etiquetas / Tags.*?\n```text\n(.*?)\n```", content, re.DOTALL)
    if tags_match:
        tags_raw = tags_match.group(1).strip()
        tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
    else:
        tags = ["AsTrade", "Trading Journal", "Prop Firms", "Cuentas de Fondeo", "Forex"]

    return {
        "title": title,
        "description": description,
        "tags": tags
    }

def get_authenticated_service():
    """
    Obtiene o renueva la sesión autenticada de YouTube Data API v3.
    """
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    creds = None
    if os.path.exists(OAUTH_TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(OAUTH_TOKEN_FILE, SCOPES)
        except Exception:
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Renovando token de acceso de YouTube API...")
            creds.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRETS_FILE):
                raise FileNotFoundError(
                    f"Falta el archivo de credenciales de Google: {CLIENT_SECRETS_FILE}\n"
                    "Consulta la guía en docs/GUIA_CONFIGURACION_YOUTUBE_API.md para generarlo en 3 minutos."
                )
            print("🌐 Iniciando flujo de autorización en el navegador...")
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(OAUTH_TOKEN_FILE, "w", encoding="utf-8") as token_file:
            token_file.write(creds.to_json())
        print(f"🔐 Credenciales guardadas en: {OAUTH_TOKEN_FILE}")

    return build("youtube", "v3", credentials=creds)

def upload_video_to_youtube(youtube, video_path, thumb_path, meta, privacy="public"):
    """
    Ejecuta la subida reanudable del video y asigna su miniatura personalizada.
    """
    from googleapiclient.http import MediaFileUpload
    import googleapiclient.errors

    body = {
        "snippet": {
            "title": meta["title"][:100], # Límite de 100 caracteres de YouTube
            "description": meta["description"][:5000],
            "tags": meta["tags"][:50],
            "categoryId": "27", # Educación
            "defaultLanguage": "es",
            "defaultAudioLanguage": "es"
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False
        }
    }

    media_body = MediaFileUpload(video_path, chunksize=1024 * 1024 * 4, resumable=True)

    print(f"\n🚀 Subiendo video a YouTube (Visibilidad: {privacy.upper()})...")
    print(f"   📍 Archivo: {video_path}")
    print(f"   📦 Tamaño: {os.path.getsize(video_path) / (1024*1024):.2f} MB")

    insert_request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media_body
    )

    response = None
    last_progress = 0
    while response is None:
        status, response = insert_request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            if pct != last_progress:
                print(f"   -> Progreso de subida: {pct}%", end="\r", flush=True)
                last_progress = pct

    print("\n✅ ¡Video subido con éxito a YouTube!")
    video_id = response.get("id")
    video_url = f"https://youtu.be/{video_id}"
    print(f"   🔗 Enlace del Video: {video_url}")

    # Subida de Miniatura Personalizada
    if thumb_path and os.path.exists(thumb_path):
        print(f"\n🖼️ Asignando carátula / miniatura personalizada...")
        try:
            thumb_media = MediaFileUpload(thumb_path)
            youtube.thumbnails().set(
                videoId=video_id,
                media_body=thumb_media
            ).execute()
            print("✅ ¡Miniatura personalizada asignada correctamente!")
        except Exception as e:
            print(f"⚠️ No se pudo asignar la miniatura automáticamente: {e}")
            print(f"   Puedes subirla manualmente desde: {thumb_path}")

    return video_id, video_url

def main():
    parser = argparse.ArgumentParser(description="YouTube Autonomous Uploader — AsTrade")
    parser.add_argument("--tutorial", choices=["1", "2"], default="2", help="Seleccionar Tutorial (1 o 2)")
    parser.add_argument("--video", default=None, help="Ruta personalizada del video MP4")
    parser.add_argument("--meta", default=None, help="Ruta personalizada del archivo metadata.md")
    parser.add_argument("--thumb", default=None, help="Ruta personalizada de la miniatura PNG")
    parser.add_argument("--privacy", choices=["public", "unlisted", "private"], default="public", help="Visibilidad en YouTube")
    parser.add_argument("--dry-run", action="store_true", help="Validar metadatos y simular subida sin conectar a la API")
    args = parser.parse_args()

    # Asignar rutas por defecto según el tutorial seleccionado
    if args.tutorial == "1":
        default_video = os.path.join(BASE_DIR, "media", "youtube_tutorials", "AsTrade_Tutorial_01_Cuentas_1080p.mp4")
        default_meta = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_01", "metadata.md")
        default_thumb = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_01", "thumbnail_tutorial_01.png")
    else:
        default_video = os.path.join(BASE_DIR, "media", "youtube_tutorials", "AsTrade_Tutorial_02_Trades_1080p.mp4")
        default_meta = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_02", "metadata.md")
        default_thumb = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_02", "thumbnail_tutorial_02.png")

    video_path = args.video if args.video else default_video
    meta_path = args.meta if args.meta else default_meta
    thumb_path = args.thumb if args.thumb else default_thumb

    print("=" * 70)
    print("🎬 ASTRADE YOUTUBE PUBLISHER")
    print("=" * 70)
    print(f"🎯 Modo: {'SIMULACIÓN DRY-RUN' if args.dry_run else 'SUBIDA REAL API'}")
    print(f"📚 Tutorial: #{args.tutorial}")
    print(f"📍 Video MP4: {video_path} (Existe: {os.path.exists(video_path)})")
    print(f"📝 Metadatos: {meta_path} (Existe: {os.path.exists(meta_path)})")
    print(f"🖼️ Miniatura: {thumb_path} (Existe: {os.path.exists(thumb_path)})")
    print(f"🔒 Visibilidad: {args.privacy.upper()}")

    # Validar archivos
    if not os.path.exists(video_path):
        print(f"❌ Error: Archivo de video no encontrado en: {video_path}")
        return 1
    if not os.path.exists(meta_path):
        print(f"❌ Error: Archivo de metadatos no encontrado en: {meta_path}")
        return 1

    # Parsear metadatos
    meta = parse_metadata_file(meta_path)
    print("\n" + "─" * 70)
    print(f"📌 TÍTULO: {meta['title']}")
    print(f"🏷️ TAGS ({len(meta['tags'])}): {', '.join(meta['tags'][:8])}...")
    print(f"📝 DESCRIPCIÓN ({len(meta['description'])} caracteres):")
    print(meta['description'][:350] + "...\n[Ver metadata.md para texto completo]")
    print("─" * 70)

    # Modo Dry-Run o falta de credenciales
    if args.dry_run:
        print("\n✅ [DRY-RUN EXITOSO] El paquete de publicación está 100% calibrado y listo.")
        print(f"   -> Video: {os.path.getsize(video_path)/(1024*1024):.2f} MB")
        if os.path.exists(thumb_path):
            print(f"   -> Miniatura: {os.path.getsize(thumb_path)/(1024):.2f} KB")
        return 0

    if not os.path.exists(CLIENT_SECRETS_FILE):
        print("\n" + "=" * 70)
        print("⚠️ AVISO DE CONFIGURACIÓN DE YOUTUBE DATA API")
        print("=" * 70)
        print("Para realizar la subida automática directa a tu canal de YouTube:")
        print("1. Sigue la guía de 3 minutos en: docs/GUIA_CONFIGURACION_YOUTUBE_API.md")
        print("2. Descarga tu 'client_secrets.json' desde Google Cloud Console.")
        print(f"3. Colócalo en la raíz del proyecto: {CLIENT_SECRETS_FILE}")
        print("4. Vuelve a ejecutar este comando para subir en piloto automático.")
        print("\n💡 Mientras tanto, tus archivos locales están listos para subida manual:")
        print(f"   📁 Carpeta Tutorial #{args.tutorial}: {os.path.dirname(meta_path)}")
        print("=" * 70)
        return 0

    # Subida real mediante la API
    try:
        youtube = get_authenticated_service()
        upload_video_to_youtube(youtube, video_path, thumb_path, meta, privacy=args.privacy)
    except Exception as e:
        print(f"\n❌ Error durante la comunicación con YouTube API: {e}")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())

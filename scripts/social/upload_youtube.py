"""
YouTube Autonomous Uploader — AsTrade Tutorials
Sube videos y miniaturas automáticamente al canal de YouTube usando YouTube Data API v3
con soporte para autenticación OAuth 2.0, subida reanudable (Resumable Upload),
procesamiento por lotes (--tutorial all) y registro persistente de publicaciones.
"""

import os
import sys
import re
import json
import argparse
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CLIENT_SECRETS_FILE = os.path.join(BASE_DIR, "client_secrets.json")
OAUTH_TOKEN_FILE = os.path.join(BASE_DIR, "youtube_token.json")
AUTH_URL_FILE = os.path.join(BASE_DIR, "scripts", "social", "auth_url.txt")
PUBLISHED_LOG_FILE = os.path.join(BASE_DIR, "media", "youtube_tutorials", "published_videos.json")

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
    Si es la primera vez, inicia un servidor local y abre el enlace de autorización.
    """
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import (
        InstalledAppFlow,
        _ExclusiveWSGIServer,
        _WSGIRequestHandler,
        _RedirectWSGIApp
    )
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    import wsgiref.simple_server

    creds = None
    if os.path.exists(OAUTH_TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(OAUTH_TOKEN_FILE, SCOPES)
        except Exception as e:
            print(f"⚠️ Error al leer {OAUTH_TOKEN_FILE}: {e}. Se solicitará nueva autorización.", flush=True)
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("🔄 Renovando token de acceso de YouTube API con refresh_token...", flush=True)
            creds.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRETS_FILE):
                raise FileNotFoundError(
                    f"Falta el archivo de credenciales de Google: {CLIENT_SECRETS_FILE}\n"
                    "Consulta la guía en docs/GUIA_CONFIGURACION_YOUTUBE_API.md para generarlo en 3 minutos."
                )

            # Iniciar servidor WSGI en puerto efímero libre
            wsgi_app = _RedirectWSGIApp(
                "¡Autorización completada con éxito! Puedes cerrar esta pestaña y volver a la consola."
            )
            local_server = wsgiref.simple_server.make_server(
                "localhost",
                0,
                wsgi_app,
                server_class=_ExclusiveWSGIServer,
                handler_class=_WSGIRequestHandler
            )

            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            flow.redirect_uri = f"http://localhost:{local_server.server_port}/"
            auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")

            # Guardar enlace en archivo accesible
            with open(AUTH_URL_FILE, "w", encoding="utf-8") as f:
                f.write(auth_url)

            print("\n" + "=" * 70, flush=True)
            print("🔐 AUTORIZACIÓN GOOGLE OAUTH 2.0 (Paso Único)", flush=True)
            print("=" * 70, flush=True)
            print("Se ha generado el enlace de autorización para tu canal de YouTube:", flush=True)
            print(f"\n👉 {auth_url}\n", flush=True)
            print("=" * 70, flush=True)
            print(f"📁 Enlace guardado en: {AUTH_URL_FILE}", flush=True)
            print("⏳ Esperando autorización en el navegador...", flush=True)

            # Intentar abrir el navegador en Windows de forma nativa
            try:
                os.startfile(auth_url)
            except Exception:
                pass

            try:
                local_server.handle_request()
                auth_resp = wsgi_app.last_request_uri.replace("http://", "https://")
                flow.fetch_token(authorization_response=auth_resp)
                creds = flow.credentials
            finally:
                local_server.server_close()

        with open(OAUTH_TOKEN_FILE, "w", encoding="utf-8") as token_file:
            token_file.write(creds.to_json())
        print(f"🔐 Credenciales guardadas con éxito en: {OAUTH_TOKEN_FILE}", flush=True)

    return build("youtube", "v3", credentials=creds)

def upload_video_to_youtube(youtube, video_path, thumb_path, meta, privacy="public"):
    """
    Ejecuta la subida reanudable del video y asigna su miniatura personalizada.
    """
    from googleapiclient.http import MediaFileUpload

    body = {
        "snippet": {
            "title": meta["title"][:100],  # Límite de 100 caracteres de YouTube
            "description": meta["description"][:5000],
            "tags": meta["tags"][:50],
            "categoryId": "27",  # Educación
            "defaultLanguage": "es",
            "defaultAudioLanguage": "es"
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False
        }
    }

    media_body = MediaFileUpload(video_path, chunksize=1024 * 1024 * 4, resumable=True)

    print(f"\n🚀 Subiendo video a YouTube (Visibilidad: {privacy.upper()})...", flush=True)
    print(f"   📍 Archivo: {video_path}", flush=True)
    print(f"   📦 Tamaño: {os.path.getsize(video_path) / (1024*1024):.2f} MB", flush=True)

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

    print("\n✅ ¡Video subido con éxito a YouTube!", flush=True)
    video_id = response.get("id")
    video_url = f"https://youtu.be/{video_id}"
    print(f"   🔗 Enlace del Video: {video_url}", flush=True)

    # Subida de Miniatura Personalizada
    thumbnail_status = "no_file"
    if thumb_path and os.path.exists(thumb_path):
        print(f"🖼️ Asignando carátula / miniatura personalizada...", flush=True)
        try:
            thumb_media = MediaFileUpload(thumb_path)
            youtube.thumbnails().set(
                videoId=video_id,
                media_body=thumb_media
            ).execute()
            print("✅ ¡Miniatura personalizada asignada correctamente!", flush=True)
            thumbnail_status = "success"
        except Exception as e:
            print(f"⚠️ Nota sobre miniatura: {e}", flush=True)
            print(f"   (Si tu canal de YouTube aún no tiene activada la verificación telefónica para miniaturas,")
            print(f"    puedes asignarla manualmente desde YouTube Studio con: {thumb_path})", flush=True)
            thumbnail_status = "manual_required"

    return {
        "id": video_id,
        "url": video_url,
        "privacy": privacy,
        "title": meta["title"],
        "thumbnail_status": thumbnail_status,
        "timestamp": datetime.now().isoformat()
    }

def record_publication(tutorial_key, data):
    """
    Registra el historial de subida en un archivo JSON local.
    """
    history = {}
    if os.path.exists(PUBLISHED_LOG_FILE):
        try:
            with open(PUBLISHED_LOG_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = {}

    history[tutorial_key] = data

    os.makedirs(os.path.dirname(PUBLISHED_LOG_FILE), exist_ok=True)
    with open(PUBLISHED_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

def get_tutorial_paths(t_num):
    """
    Retorna rutas de video, metadatos y miniatura para un tutorial dado.
    """
    if str(t_num) == "1":
        video = os.path.join(BASE_DIR, "media", "youtube_tutorials", "AsTrade_Tutorial_01_Cuentas_1080p.mp4")
        meta = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_01", "metadata.md")
        thumb = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_01", "thumbnail_tutorial_01.png")
    elif str(t_num) == "2":
        video = os.path.join(BASE_DIR, "media", "youtube_tutorials", "AsTrade_Tutorial_02_Trades_1080p.mp4")
        meta = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_02", "metadata.md")
        thumb = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_02", "thumbnail_tutorial_02.png")
    elif str(t_num) == "3":
        video = os.path.join(BASE_DIR, "media", "youtube_tutorials", "AsTrade_Tutorial_03_Drawdown_1080p.mp4")
        meta = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_03", "metadata.md")
        thumb = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", "tutorial_03", "thumbnail_tutorial_03.png")
    else:
        video = os.path.join(BASE_DIR, "media", "youtube_tutorials", f"AsTrade_Tutorial_{t_num}_1080p.mp4")
        meta = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", f"tutorial_{t_num}", "metadata.md")
        thumb = os.path.join(BASE_DIR, "media", "youtube_tutorials", "packages", f"tutorial_{t_num}", f"thumbnail_tutorial_{t_num}.png")
    return video, meta, thumb

def main():
    parser = argparse.ArgumentParser(description="YouTube Autonomous Uploader — AsTrade")
    parser.add_argument("--tutorial", choices=["1", "2", "3", "all"], default="all", help="Seleccionar Tutorial (1, 2, 3 o all)")
    parser.add_argument("--video", default=None, help="Ruta personalizada del video MP4")
    parser.add_argument("--meta", default=None, help="Ruta personalizada del archivo metadata.md")
    parser.add_argument("--thumb", default=None, help="Ruta personalizada de la miniatura PNG")
    parser.add_argument("--privacy", choices=["public", "unlisted", "private"], default="public", help="Visibilidad en YouTube")
    parser.add_argument("--dry-run", action="store_true", help="Validar metadatos y simular subida sin conectar a la API")
    args = parser.parse_args()

    tutorials_to_process = ["1", "2", "3"] if args.tutorial == "all" else [args.tutorial]

    print("=" * 70, flush=True)
    print("🎬 ASTRADE YOUTUBE PUBLISHER", flush=True)
    print("=" * 70, flush=True)
    print(f"🎯 Modo: {'SIMULACIÓN DRY-RUN' if args.dry_run else 'SUBIDA REAL API'}", flush=True)
    print(f"📚 Tutoriales a procesar: {tutorials_to_process}", flush=True)
    print(f"🔒 Visibilidad: {args.privacy.upper()}", flush=True)
    print("=" * 70, flush=True)

    # Validar existencia previa de archivos
    tasks = []
    for t in tutorials_to_process:
        if args.video and len(tutorials_to_process) == 1:
            v, m, th = args.video, args.meta, args.thumb
        else:
            v, m, th = get_tutorial_paths(t)

        if not os.path.exists(v):
            print(f"❌ Error: Archivo de video no encontrado para Tutorial #{t}: {v}", flush=True)
            return 1
        if not os.path.exists(m):
            print(f"❌ Error: Archivo de metadatos no encontrado para Tutorial #{t}: {m}", flush=True)
            return 1

        meta = parse_metadata_file(m)
        tasks.append({
            "key": f"tutorial_{t}",
            "tutorial": t,
            "video": v,
            "meta": meta,
            "meta_path": m,
            "thumb": th
        })

    # Mostrar resumen de las tareas preparadas
    for task in tasks:
        print(f"\n📦 [Tutorial #{task['tutorial']}] {task['meta']['title']}", flush=True)
        print(f"   📍 Video: {task['video']} ({os.path.getsize(task['video'])/(1024*1024):.2f} MB)", flush=True)
        print(f"   🖼️ Miniatura: {task['thumb']} ({'Existe' if os.path.exists(task['thumb']) else 'Falta'})", flush=True)
        print(f"   🏷️ Tags: {len(task['meta']['tags'])} etiquetas institucionales", flush=True)

    if args.dry_run:
        print("\n" + "=" * 70, flush=True)
        print("✅ [DRY-RUN EXITOSO] Todos los paquetes están validados y listos para subida.", flush=True)
        print("=" * 70, flush=True)
        return 0

    if not os.path.exists(CLIENT_SECRETS_FILE):
        print("\n" + "=" * 70, flush=True)
        print("⚠️ ARCHIVO 'client_secrets.json' NO ENCONTRADO", flush=True)
        print("=" * 70, flush=True)
        print(f"Ruta esperada: {CLIENT_SECRETS_FILE}", flush=True)
        print("Consulta docs/GUIA_CONFIGURACION_YOUTUBE_API.md para descargarlo en 3 minutos.", flush=True)
        return 1

    # Obtener servicio autenticado
    try:
        youtube = get_authenticated_service()
    except Exception as e:
        print(f"\n❌ Error al autenticar con Google OAuth: {e}", flush=True)
        return 1

    # Ejecutar subida de cada tutorial
    results = []
    for task in tasks:
        print("\n" + "─" * 70, flush=True)
        print(f"📤 Procesando Tutorial #{task['tutorial']}...", flush=True)
        print("─" * 70, flush=True)
        try:
            res = upload_video_to_youtube(
                youtube=youtube,
                video_path=task["video"],
                thumb_path=task["thumb"],
                meta=task["meta"],
                privacy=args.privacy
            )
            record_publication(task["key"], res)
            results.append((task["tutorial"], res))
        except Exception as e:
            print(f"❌ Error al subir Tutorial #{task['tutorial']}: {e}", flush=True)

    # Resumen final
    print("\n" + "=" * 70, flush=True)
    print("🎉 RESUMEN DE PUBLICACIÓN EN YOUTUBE", flush=True)
    print("=" * 70, flush=True)
    for t_num, res in results:
        print(f"✅ Tutorial #{t_num}:", flush=True)
        print(f"   📌 Título: {res['title']}", flush=True)
        print(f"   🔗 URL: {res['url']}", flush=True)
        print(f"   🔒 Visibilidad: {res['privacy'].upper()}", flush=True)
        print(f"   🖼️ Miniatura: {res['thumbnail_status']}", flush=True)
    print(f"\n📁 Registro guardado en: {PUBLISHED_LOG_FILE}", flush=True)
    print("=" * 70, flush=True)

    return 0

if __name__ == "__main__":
    sys.exit(main())

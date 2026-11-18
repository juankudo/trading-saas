# 🚀 Guía Rápida: Configuración de YouTube Data API v3 (3 Minutos)

Esta guía te muestra paso a paso cómo obtener tu archivo `client_secrets.json` desde Google Cloud Console para habilitar la **subida 100% automática** de videos y carátulas a tu canal de YouTube desde la terminal.

---

## ⏱️ Paso 1: Habilitar la API en Google Cloud Console

1. Abre tu navegador e ingresa a: **[Google Cloud Console](https://console.cloud.google.com/)** con la misma cuenta de Google dueña de tu canal de YouTube.
2. Si es tu primera vez, haz clic en el selector de proyectos superior y presiona **Nuevo Proyecto** (nómbralo, por ejemplo, `AsTrade YouTube Uploader`).
3. En el menú lateral izquierdo, ve a **APIs y servicios** ➔ **Biblioteca** (o Library).
4. En el buscador escribe **`YouTube Data API v3`**.
5. Haz clic en el resultado y presiona el botón azul **Habilitar** (Enable).

---

## 🔐 Paso 2: Configurar la Pantalla de Consentimiento (OAuth)

1. En el menú lateral, haz clic en **Pantalla de consentimiento de OAuth** (OAuth consent screen).
2. Selecciona **Externo** (External) y haz clic en **Crear**.
3. Completa los campos básicos:
   - **Nombre de la aplicación:** `AsTrade YouTube Uploader`
   - **Correo de soporte al usuario:** Tu correo de Gmail.
   - **Datos de contacto del desarrollador:** Tu correo de Gmail.
4. Presiona **Guardar y continuar** (puedes omitir la sección de permisos/scopes haciendo clic directo en Guardar y continuar).
5. En la sección **Usuarios de prueba** (Test users):
   - Haz clic en **+ ADD USERS**.
   - Agrega tu dirección de Gmail (la vinculada a tu canal de YouTube).
   - Presiona **Guardar y continuar**.

---

## 🔑 Paso 3: Crear y Descargar `client_secrets.json`

1. En el menú lateral, ve a **Credenciales** (Credentials).
2. Haz clic arriba en **+ Crear credenciales** ➔ **ID de cliente de OAuth** (OAuth client ID).
3. En **Tipo de aplicación**, selecciona: **Aplicación de escritorio** (Desktop app).
4. En **Nombre**, coloca: `AsTrade CLI`.
5. Haz clic en **Crear**.
6. Aparecerá una ventana emergente. Haz clic en **Descargar JSON** (Download JSON).
7. Cambia el nombre del archivo descargado a:
   ```text
   client_secrets.json
   ```
8. Mueve este archivo a la carpeta raíz de tu proyecto:
   ```text
   C:\Users\Juan\Desktop\trading-saas\client_secrets.json
   ```

---

## 🎬 Paso 4: ¡Subir en Piloto Automático!

Una vez colocado el archivo en la raíz, ejecuta el publicador desde tu terminal:

### Subir Tutorial #1:
```powershell
python scripts/social/upload_youtube.py --tutorial 1 --privacy public
```

### Subir Tutorial #2:
```powershell
python scripts/social/upload_youtube.py --tutorial 2 --privacy public
```

> [!TIP]
> **Primera Ejecución:** Se abrirá automáticamente una ventana en tu navegador pidiendo que inicies sesión con tu cuenta de YouTube y confirmes el acceso. Una vez concedido, se generará el token seguro `youtube_token.json` y ya nunca más te volverá a pedir autorización.
>
> **Privacidad:** Si antes de publicar deseas que el video quede accesible solo para quienes tengan el link directo, usa `--privacy unlisted`.

import os
import asyncio
import edge_tts

VOICE = "es-MX-DaliaNeural"
OUTPUT_DIR = "scratch/video1"

SCENES = {
    "scene1_hook": (
        "¿Alguna vez perdiste una cuenta de fondeo por sobrelotaje o por superar el límite de pérdida diaria sin darte cuenta? "
        "En el trading institucional, la disciplina y el control milimétrico del drawdown lo son todo. "
        "Te damos la bienvenida a Trading Journal Pro, la bitácora profesional en la nube diseñada específicamente para traders que operan con empresas de fondeo y cuentas personales. "
        "En este video de inicio rápido, aprenderás a activar tu acceso gratuito de 14 días y a configurar tu primera cuenta en menos de tres minutos."
    ),
    "scene2_register": (
        "Para comenzar, nos dirigimos a tradingjournalpro punto pages punto dev. "
        "Hacemos clic en el botón 'Comenzar 14 Días Gratis'. Aquí solo ingresamos nuestro nombre, correo electrónico y una contraseña segura. "
        "No hay pagos iniciales ni cargos ocultos hoy. "
        "Al hacer clic en registrarse, nuestra cuenta queda inmediatamente habilitada con acceso total y sincronización automática en la nube mediante Supabase."
    ),
    "scene3_config_account": (
        "Una vez dentro de la bitácora, observamos un entorno diseñado para la máxima concentración. "
        "En la esquina superior encontramos la gestión de cuentas. Podemos seleccionar entre preajustes institucionales populares, como cuentas de 100 mil dólares en dos fases, 50 mil en una fase o fondeo directo. "
        "La plataforma audita en tiempo real los dos parámetros más críticos: el límite de pérdida diaria del 5% y el drawdown máximo acumulado del 10%, asegurando que nunca violes las reglas de tu desafío."
    ),
    "scene4_dashboard": (
        "En el panel principal, la curva de equidad refleja cada operación con precisión matemática. "
        "Verás tu tasa de acierto, el ratio riesgo-beneficio promedio y un calendario interactivo que resalta tus días con ganancias consistentes. "
        "Si en algún momento tu operativa se acerca a un nivel de riesgo peligroso, el sistema emitirá alertas visuales preventivas antes de que ejecutes una nueva entrada."
    ),
    "scene5_outro": (
        "Tu trading merece un estándar profesional. "
        "Comienza a auditar tu camino hacia la consistencia hoy mismo creando tu cuenta con 14 días de prueba gratis en el enlace que te dejamos en la descripción de este video. "
        "En el próximo tutorial, aprenderemos a registrar una operación paso a paso con cálculo automático de lotaje y captura técnica de gráficos. "
        "Suscríbete al canal y nos vemos en el siguiente video."
    )
}

async def generate_scene_audio(name, text):
    filepath = os.path.join(OUTPUT_DIR, f"{name}.mp3")
    print(f"Generating audio for {name} with voice {VOICE}...")
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(filepath)
    size = os.path.getsize(filepath)
    print(f"  -> Generated {filepath} ({size} bytes)")
    return filepath

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generated_files = []
    
    for name, text in SCENES.items():
        fp = await generate_scene_audio(name, text)
        generated_files.append(fp)
    
    print("\nAll individual scene audios generated successfully!")
    
    # Also generate the complete continuous narration
    full_text = " ... ".join(SCENES.values())
    full_fp = os.path.join(OUTPUT_DIR, "video1_full_voiceover.mp3")
    print(f"Generating full continuous voiceover ({full_fp})...")
    comm_full = edge_tts.Communicate(full_text, VOICE)
    await comm_full.save(full_fp)
    print(f"Full voiceover saved! ({os.path.getsize(full_fp)} bytes)")

if __name__ == "__main__":
    asyncio.run(main())

"""
Mass Content Generator — Goal Engine: 5 YouTube Tutorials & 20 Promotional Shorts
Trading Journal Pro
Generates full neural audio, vertical compositions, and publishing queue.
"""

import os
import asyncio
import json
import edge_tts

VOICE = "es-MX-DaliaNeural"

# ==============================================================================
# 5 YOUTUBE TUTORIALS (16:9)
# ==============================================================================
YOUTUBE_TUTORIALS = [
    {
        "id": "tutorial_01_inicio_rapido",
        "num": 1,
        "title": "Cómo Configurar tu Cuenta de Fondeo y Activar tu Bitácora en 3 Minutos | Trading Journal Pro",
        "script": (
            "¿Alguna vez perdiste una cuenta de fondeo por sobrelotaje o por superar el límite de pérdida diaria sin darte cuenta? "
            "En el trading institucional, la disciplina y el control milimétrico del drawdown lo son todo. "
            "Te damos la bienvenida a Trading Journal Pro, la bitácora profesional en la nube diseñada específicamente para traders que operan con empresas de fondeo y cuentas personales. "
            "En este video de inicio rápido, aprenderás a activar tu acceso gratuito de 14 días y a configurar tu primera cuenta en menos de tres minutos. "
            "Nos dirigimos a tradingjournalpro.pages.dev, hacemos clic en Comenzar 14 Días Gratis, ingresamos nombre y correo, y quedamos habilitados inmediatamente con respaldo en Supabase. "
            "Dentro de la bitácora, seleccionamos el tamaño de cuenta como cien mil dólares en dos fases, y el sistema audita en tiempo real tu pérdida diaria del cinco por ciento y drawdown máximo del diez por ciento. "
            "Comienza hoy tus catorce días de prueba gratis en el enlace de la descripción."
        ),
        "tags": ["trading", "propfirms", "tradingjournal", "drawdown", "cuentasdefondeo"]
    },
    {
        "id": "tutorial_02_registro_trades",
        "num": 2,
        "title": "Cómo Registrar y Auditar Trades con Precisión Quirúrgica | Trading Journal Pro",
        "script": (
            "Te damos la bienvenida al segundo tutorial oficial de Trading Journal Pro. "
            "Una bitácora de trading solo es efectiva si registrar una operación toma menos de treinta segundos y no interrumpe tu operativa. "
            "En este video, aprenderemos a registrar una operación completa, adjuntar tu análisis técnico y auditar el ratio riesgo-beneficio en tiempo real. "
            "Hacemos clic en el botón 'Nueva Entrada' en la esquina superior derecha. "
            "Seleccionamos el símbolo, por ejemplo XAUUSD o EURUSD, la dirección de compra o venta, y definimos el precio de entrada junto con nuestro stop loss y take profit. "
            "Observa cómo la plataforma calcula de forma instantánea la distancia en pips y proyecta tu ratio riesgo-beneficio exacto, como uno a dos coma cuatro. "
            "Además, puedes adjuntar la captura del gráfico para documentar el setup institucional y escribir notas psicológicas sobre tu ejecución. "
            "Al guardar, tu balance, tu porcentaje de ganancia y tu curva de equidad se actualizan automáticamente en Supabase y quedan respaldados en la nube. "
            "Comienza hoy a registrar tus trades con estándar institucional en tradingjournalpro.pages.dev con catorce días de prueba gratis."
        ),
        "tags": ["tradingjournal", "registrodetrades", "forex", "xauusd", "gestionderiesgo"]
    },
    {
        "id": "tutorial_03_backtesting_pro",
        "num": 3,
        "title": "Laboratorio de Backtesting Pro: Simula Desafíos y Retiros Reales | Trading Journal Pro",
        "script": (
            "Bienvenido al tercer tutorial de Trading Journal Pro. "
            "Muchos traders pagan evaluaciones costosas sin haber probado antes si su estrategia realmente cumple las reglas de la empresa de fondeo. "
            "Para solucionar esto creamos el Laboratorio de Backtesting Pro. "
            "Aquí puedes registrar tus sesiones de prueba manual seleccionando la cuenta objetivo, como Cuentas de Cien Mil Dólares en Dos Fases. "
            "A medida que anotas tus trades simulados, el motor audita en tiempo real si estás dentro del límite de pérdida diaria del cinco por ciento y drawdown máximo. "
            "Lo más potente es el Simulador de Retiros: al superar el objetivo de la fase dos, el sistema liquida tu ganancia aplicando el Profit Split del ochenta o noventa por ciento, "
            "mostrándote exactamente cuánto dinero en mano te llevarías al banco. "
            "Prueba tu estrategia en el laboratorio hoy mismo con catorce días gratis en tradingjournalpro.pages.dev."
        ),
        "tags": ["backtesting", "simuladorderetiros", "propfirm", "payout", "trading"]
    },
    {
        "id": "tutorial_04_dashboard_metricas",
        "num": 4,
        "title": "Dashboard, Métricas Clave y Calendario de Rentabilidad | Trading Journal Pro",
        "script": (
            "Bienvenido al cuarto tutorial de Trading Journal Pro. "
            "Un trader profesional no mide su éxito por una operación aislada, sino por la consistencia estadística a lo largo del tiempo. "
            "En este video analizaremos el Dashboard interactivo de la plataforma. "
            "La curva de equidad te muestra visualmente la evolución de tu capital trade a trade con cálculo de flotante. "
            "En las tarjetas superiores encuentras tu tasa de acierto, el ratio riesgo-beneficio promedio y tu factor de recuperación. "
            "Una de las herramientas favoritas de nuestros usuarios es el Calendario Mensual de Rendimiento: cada día de operativa se pinta de verde o rojo según tu resultado neto, "
            "permitiéndote detectar tus mejores días de la semana y las sesiones más rentables, ya sea Londres o Nueva York. "
            "Audita tu consistencia con estándar profesional en tradingjournalpro.pages.dev con catorce días de prueba gratis."
        ),
        "tags": ["dashboard", "curvadeequidad", "calendariotrading", "winrate", "tradingjournal"]
    },
    {
        "id": "tutorial_05_auditoria_drawdown",
        "num": 5,
        "title": "Auditoría de Fondeo Anti-Quiebre: Control Estricto de Drawdown Diario | Trading Journal Pro",
        "script": (
            "Bienvenido al quinto tutorial de Trading Journal Pro. "
            "El mayor motivo de descalificación en cuentas de fondeo es violar el límite de pérdida diaria, muchas veces por confusiones con el trailing drawdown o el flotante. "
            "En este video aprenderás cómo funciona el motor de auditoría preventiva de la plataforma. "
            "El sistema calcula de forma continua tu margen seguro disponible antes de alcanzar el menos cinco por ciento diario. "
            "Si una operación abierta o varias pérdidas consecutivas consumen más del setenta por ciento de tu margen permitido, "
            "el semáforo de riesgo pasa a color ámbar y bloquea nuevas entradas impulsivas mediante alertas visuales claras. "
            "Esto te protege del temido revenge trading y asegura que mantengas tu cuenta viva hasta la siguiente sesión. "
            "Protege tu capital y tus desafíos de fondeo hoy mismo en tradingjournalpro.pages.dev con catorce días gratis."
        ),
        "tags": ["drawdown", "gestionderiesgo", "propfirms", "controlantiquiebre", "tradingdisciplina"]
    }
]

# ==============================================================================
# 20 PROMOTIONAL SHORTS (9:16 VERTICALS)
# ==============================================================================
PROMOTIONAL_SHORTS = [
    {
        "id": "short_01",
        "num": 1,
        "hook": "¿Sabías que el 90% pierde su cuenta por este error?",
        "title": "El error del 5% que te hace PERDER tu cuenta de fondeo 🛑📉",
        "script": (
            "¿Sabías que más del noventa por ciento de los traders pierden su cuenta de fondeo por este único error? "
            "No es la estrategia, es el Drawdown Diario. "
            "Muchas empresas calculan tu límite del cinco por ciento sobre el balance más alto del día, no sobre tu capital inicial. "
            "Con Trading Journal Pro, tu bitácora audita cada operación en tiempo real y te alerta antes de tocar el límite de riesgo. "
            "Prueba catorce días gratis en el enlace del perfil."
        ),
        "tag": "Drawdown Diario"
    },
    {
        "id": "short_02",
        "num": 2,
        "hook": "¿Sigues calculando lotes a ojo o con calculadoras lentas?",
        "title": "Calcula tu LOTAJE exacto en ORO (XAUUSD) en 3 segundos ⚡",
        "script": (
            "¿Sigues calculando lotes a ojo o con calculadoras lentas de internet? "
            "En el oro, un error de cero coma diez lotes te puede costar la prueba de fondeo en un solo mechazo. "
            "Con Trading Journal Pro, seleccionas tu riesgo exacto del uno por ciento, marcas tu stop loss y obtienes el lotaje exacto al tick. "
            "Cero fallas matemáticas ni cuentas quemadas por sobreapalancamiento. Empieza catorce días gratis en tradingjournalpro.pages.dev."
        ),
        "tag": "Calculadora Oro"
    },
    {
        "id": "short_03",
        "num": 3,
        "hook": "¿Cuánto dinero te llevas al bolsillo en una cuenta de 100K?",
        "title": "Simula tu RETIRO de dinero real antes de pagar tu prueba 💰",
        "script": (
            "¿Sabías exactamente cuánto dinero real te llevas al bolsillo al pasar tu desafío de cien mil dólares? "
            "Muchos traders solo miran pips, pero lo importante es tu dinero en mano. "
            "En el Laboratorio de Backtesting Pro simulas tu solicitud de retiro con el Profit Split real del ochenta o noventa por ciento. "
            "Comprueba si cumples las reglas antes de pagar el desafío. Catorce días gratis en el enlace del perfil."
        ),
        "tag": "Simulador Retiros"
    },
    {
        "id": "short_04",
        "num": 4,
        "hook": "¿Drawdown Estático o Trailing? La trampa que pocos conocen.",
        "title": "Drawdown Estático vs Trailing: La trampa oculta de las prop firms ⚠️",
        "script": (
            "¿Sabes si tu cuenta de fondeo tiene Drawdown Estático o Trailing? "
            "El drawdown trailing sube con tus ganancias flotantes pero nunca vuelve a bajar. "
            "Si ganas dos mil dólares y la operación retrocede, quedas descalificado aunque sigas en positivo. "
            "Trading Journal Pro audita el trailing drawdown al instante para que nunca te tome por sorpresa. Pruébalo gratis en tradingjournalpro.pages.dev."
        ),
        "tag": "Trailing Drawdown"
    },
    {
        "id": "short_05",
        "num": 5,
        "hook": "Cómo pasar la Fase 1 en 10 días sin sobreapalancarte.",
        "title": "El plan exacto para pasar tu Fase 1 de $100K 🎯",
        "script": (
            "Para pasar una cuenta de cien mil dólares necesitas ocho mil de beneficio arriesgando máximo el cinco por ciento diario. "
            "Si buscas un ratio uno a dos arriesgando el cero coma cinco por ciento por trade, solo necesitas ocho operaciones ganadoras netas. "
            "El desorden es lo que te descalifica, no el mercado. Audita cada entrada con Trading Journal Pro y pasa tus pruebas con disciplina."
        ),
        "tag": "Pasar Fase 1"
    },
    {
        "id": "short_06",
        "num": 6,
        "hook": "La regla del Calendario Verde que buscan los inversores.",
        "title": "Por qué un Calendario Verde vale más que un trade millonario 📅",
        "script": (
            "Las empresas de fondeo no quieren traders que ganan diez mil dólares en un día y pierden doce mil al día siguiente. "
            "Quieren consistencia. El calendario de Trading Journal Pro resalta tus días en verde y rojo para auditar tu disciplina diaria. "
            "Cuando tu calendario muestra semanas continuas de ganancias controladas, conseguir capital es inevitable. Pruébalo gratis hoy."
        ),
        "tag": "Calendario Verde"
    },
    {
        "id": "short_07",
        "num": 7,
        "hook": "¿Haces Revenge Trading tras una pérdida? Esta app te frena.",
        "title": "El semáforo de riesgo que frena tus pérdidas por venganza 🛑",
        "script": (
            "El noventa por ciento de las cuentas quemadas ocurren en los veinte minutos posteriores a un stop loss. "
            "El trader se enoja, duplica el lotaje y viola la regla de pérdida diaria. "
            "El semáforo de riesgo de Trading Journal Pro detecta cuando consumes el setenta por ciento de tu margen y te advierte con alertas rojas preventivas. "
            "Protege tu psicología y tu capital con catorce días de prueba gratis."
        ),
        "tag": "Revenge Trading"
    },
    {
        "id": "short_08",
        "num": 8,
        "hook": "Gana dinero acertando solo el 40% de tus trades.",
        "title": "La matemática secreta del Ratio 1:2.5 en el trading 📊",
        "script": (
            "No necesitas acertar el noventa por ciento de tus operaciones para ser rentable. "
            "Con un ratio riesgo beneficio promedio de uno a dos coma cinco, si de diez operaciones pierdes seis y ganas solo cuatro, terminas con cuatro unidades de ganancia neta. "
            "Trading Journal Pro calcula tu ratio real en cada entrada para que operes con ventaja matemática. Enlace en el perfil."
        ),
        "tag": "Ratio Riesgo Beneficio"
    },
    {
        "id": "short_09",
        "num": 9,
        "hook": "Deja de usar Excel para anotar tus operaciones de trading.",
        "title": "Por qué Excel es el peor enemigo de un trader moderno ❌",
        "script": (
            "Anotar trades en una hoja de Excel es lento, se desconfigura en el celular y no calcula el drawdown diario en tiempo real. "
            "Trading Journal Pro es una aplicación web rápida en la nube que actualiza tu balance y curva de equidad en dos segundos. "
            "Accede desde cualquier dispositivo con respaldo seguro en Supabase. Catorce días gratis sin descargas."
        ),
        "tag": "Adios Excel"
    },
    {
        "id": "short_10",
        "num": 10,
        "hook": "Tus operaciones perdedoras son tu mayor mina de oro.",
        "title": "Cómo auditar tus pérdidas para no repetirlas jamás 🔍",
        "script": (
            "El trader novato borra u oculta sus trades perdedores por vergüenza. El trader profesional los analiza con lupa. "
            "En Trading Journal Pro puedes filtrar tus pérdidas por par, sesión y horario para descubrir exactamente dónde sangra tu cuenta. "
            "Elimina tus errores recurrentes y observa tu rentabilidad despegar. Comienza tu prueba gratuita hoy mismo."
        ),
        "tag": "Auditoría de Pérdidas"
    },
    {
        "id": "short_11",
        "num": 11,
        "hook": "Simula 50 operaciones en 10 minutos con el Backtesting Pro.",
        "title": "Entrena tu ojo de trader sin arriesgar un solo centavo 🧪",
        "script": (
            "¿Tienes una estrategia nueva pero no sabes si pasará las reglas de fondeo? "
            "No esperes dos semanas en el mercado en vivo. Usa el Laboratorio de Backtesting Pro de Trading Journal Pro. "
            "Registra tus entradas manuales pasadas y verifica si superas las metas de ganancia sin violar el drawdown. "
            "Entrena tu consistencia antes de arriesgar tu dinero real. Catorce días gratis en la web oficial."
        ),
        "tag": "Backtesting Pro"
    },
    {
        "id": "short_12",
        "num": 12,
        "hook": "Guarda capturas de tus gráficos en tu bitácora con 1 clic.",
        "title": "Documenta tus setups institucionales con captura de gráfico 📸",
        "script": (
            "Una entrada de trading sin gráfico es solo un número frío. "
            "Con Trading Journal Pro puedes adjuntar capturas de alta resolución de tus niveles institucionales, zonas de oferta y demanda o quiebres de estructura. "
            "Inspecciona cada detalle en pantalla completa con notas operativas. Tu historial visual siempre disponible en la nube."
        ),
        "tag": "Capturas de Gráfico"
    },
    {
        "id": "short_13",
        "num": 13,
        "hook": "Tu bitácora en la nube: PC, tablet y celular sincronizados.",
        "title": "Accede a tu trading desde cualquier dispositivo al instante ☁️",
        "script": (
            "Sin instalar pesados programas que ralentizan tu computadora. "
            "Trading Journal Pro corre directamente en la web con servidores de máxima velocidad en Cloudflare y base de datos Supabase. "
            "Registra tus trades en la computadora de tu oficina y revisa tus métricas en tu teléfono camino a casa. Pruébalo gratis en tradingjournalpro.pages.dev."
        ),
        "tag": "Cloud Sync"
    },
    {
        "id": "short_14",
        "num": 14,
        "hook": "Lo que las empresas de fondeo miran antes de darte dinero.",
        "title": "Las 3 métricas secretas que auditan los fondos de inversión 👁️",
        "script": (
            "A una empresa de fondeo no le importa si hiciste un trade espectacular de diez a uno. "
            "Lo que realmente evalúan es tu factor de recuperación, tu promedio de pérdida por operación y tu drawdown relativo. "
            "Trading Journal Pro te entrega exactamente esas métricas con diseño fintech para que operes como un profesional institucional. Enlace en el perfil."
        ),
        "tag": "Métricas Secretas"
    },
    {
        "id": "short_15",
        "num": 15,
        "hook": "Exporta tu historial auditado en CSV y demuestra consistencia.",
        "title": "Genera informes profesionales de tu operativa en 1 segundo 📑",
        "script": (
            "Si vas a solicitar una cuenta financiada o buscas socios inversores, necesitas demostrar resultados auditables. "
            "Con un solo clic en Trading Journal Pro, exportas todo tu historial en formato JSON y CSV compatible con Excel y software cuantitativo. "
            "Tus datos, tu propiedad y tu ventaja competitiva. Comienza tu prueba gratuita hoy mismo."
        ),
        "tag": "Exportar Informes"
    },
    {
        "id": "short_16",
        "num": 16,
        "hook": "14 días gratis sin cobros iniciales ni compromisos.",
        "title": "Prueba Trading Journal Pro 100% Gratis durante 14 días 🚀",
        "script": (
            "Comenzar es cero riesgo. Regístrate en tradingjournalpro.pages.dev y obtén catorce días completos de acceso ilimitado a la bitácora, la calculadora y el backtesting. "
            "Sin cargos hoy. Si decides que no es para ti, cancelas con un solo clic desde tu panel antes de que termine el plazo. "
            "Únete a los traders consistentes hoy mismo."
        ),
        "tag": "14 Días Gratis"
    },
    {
        "id": "short_17",
        "num": 17,
        "hook": "Deja de pagar mensualidades caras por bitácoras lentas.",
        "title": "La bitácora fintech más accesible del mercado 💎",
        "script": (
            "Otras plataformas cobran hasta cuarenta dólares mensuales por funciones básicas y servidores lentos. "
            "Trading Journal Pro te ofrece tecnología de punta en la nube, auditoría de fondeo y calculadora avanzada a una fracción del costo, con planes mensuales, trimestrales y anuales. "
            "Paga seguro con tarjeta o criptomonedas USDT. Enlace directo en la descripción."
        ),
        "tag": "Precio Justo"
    },
    {
        "id": "short_18",
        "num": 18,
        "hook": "El mapa de 3 pasos de novato a trader fondeado.",
        "title": "El camino paso a paso para conseguir tu primera cuenta de $100K 🗺️",
        "script": (
            "Paso uno: Define tu riesgo exacto con la calculadora de lotaje al tick. "
            "Paso dos: Audita cada trade en tu bitácora para respetar el límite de pérdida diaria. "
            "Paso tres: Valida tu consistencia durante treinta días continuos en tu calendario. "
            "Esa es la fórmula real del éxito en el trading. Comienza a construir tu camino hoy con Trading Journal Pro."
        ),
        "tag": "Mapa Fondeado"
    },
    {
        "id": "short_19",
        "num": 19,
        "hook": "¿Manejas varias cuentas de fondeo a la vez? No te confundas.",
        "title": "Cómo agrupar y auditar múltiples cuentas sin volverte loco 🗂️",
        "script": (
            "Si estás operando una cuenta de cien mil, otra de cincuenta mil y una personal, mezclar los límites de riesgo puede ser catastrófico. "
            "En Trading Journal Pro cambias de cuenta con un solo clic en la barra superior. "
            "Cada cuenta tiene su propio balance, reglas independientes de drawdown y curva de equidad aislada. Orden total para tu operativa."
        ),
        "tag": "Multi Cuentas"
    },
    {
        "id": "short_20",
        "num": 20,
        "hook": "Tu operativa merece un estándar profesional de verdad.",
        "title": "Lleva tu trading al siguiente nivel institucional hoy 👑",
        "script": (
            "El trading es uno de los negocios más competitivos del planeta. No puedes enfrentarlo con herramientas improvisadas. "
            "Trading Journal Pro te da la precisión, el control de riesgo y la infraestructura que usan los fondos profesionales. "
            "Comienza tus catorce días de prueba gratuita hoy mismo en tradingjournalpro.pages.dev. Enlace en la bio."
        ),
        "tag": "Estándar Institucional"
    }
]

async def produce_audio_safe(text, path):
    if os.path.exists(path) and os.path.getsize(path) > 10000:
        print(f"  [Cache OK] {path}")
        return path
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(path)
    print(f"  [Nuevo Audio] {path} ({os.path.getsize(path)} bytes)")
    return path

def build_vertical_composition(short_data, out_path, audio_filename):
    cues = [
        {"time": 0.0, "text": short_data["hook"].upper()},
        {"time": 5.0, "text": "LA REGLA QUE EL 90% DE TRADERS IGNORA"},
        {"time": 12.0, "text": "AUDITA TU OPERATIVA EN TIEMPO REAL"},
        {"time": 20.0, "text": "PROTEGE TU DRAWDOWN DIARIO Y PASA TUS PRUEBAS"},
        {"time": 28.0, "text": "14 DÍAS GRATIS EN TRADINGJOURNALPRO.PAGES.DEV"}
    ]

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0">
    <title>{short_data['title']}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {{ margin: 0; padding: 0; width: 1080px; height: 1920px; background: #050811; font-family: system-ui, sans-serif; overflow: hidden; user-select: none; }}
        .glass-card {{ background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(24px); border: 2px solid rgba(51, 65, 85, 0.85); box-shadow: 0 25px 50px rgba(0,0,0,0.8); }}
        .tiktok-sub {{ text-shadow: 0 4px 12px rgba(0,0,0,0.95); -webkit-text-stroke: 1px black; }}
    </style>
</head>
<body class="relative flex flex-col justify-between p-12">
    <!-- Header -->
    <header class="relative z-20 flex items-center justify-between pt-6">
        <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-gray-950 flex items-center justify-center text-2xl font-black">
                <i class="fa-solid fa-chart-line"></i>
            </div>
            <div>
                <span class="text-2xl font-black text-white">TRADING JOURNAL <span class="text-emerald-400">PRO</span></span>
                <p class="text-sm text-gray-400 font-semibold">@tradingjournalpro · Short #{short_data['num']:02d}</p>
            </div>
        </div>
        <div class="px-4 py-2 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 text-sm font-mono font-bold">
            {short_data['tag'].upper()}
        </div>
    </header>

    <!-- Main Visual Card -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center my-8">
        <div id="card-stage" class="w-[960px] glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div class="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-5xl text-emerald-400 mb-8 animate-bounce">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 class="text-5xl font-black text-white leading-tight mb-6">
                {short_data['title']}
            </h2>
            <div class="px-8 py-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-2xl font-mono font-bold mb-6">
                tradingjournalpro.pages.dev
            </div>
            <div class="text-xl text-gray-300 font-semibold">
                Bitácora Pro en la Nube · 14 Días Gratis · Sin pagos hoy
            </div>
        </div>
    </main>

    <!-- Footer Subtitles -->
    <footer class="relative z-20 pb-8 flex flex-col items-center text-center">
        <div class="w-[980px] bg-black/90 border-2 border-yellow-400 p-6 rounded-3xl shadow-2xl mb-4">
            <p id="sub-text" class="text-3xl font-black text-yellow-300 uppercase tiktok-sub">
                {short_data['hook'].upper()}
            </p>
        </div>
        <button onclick="toggleAudio()" id="play-btn" class="px-6 py-2.5 rounded-xl bg-emerald-500 text-gray-950 font-black text-sm flex items-center gap-2">
            <i class="fa-solid fa-play"></i> Reproducir Short #{short_data['num']:02d}
        </button>
    </footer>

    <audio id="audio" src="{audio_filename}" preload="auto"></audio>
    <script>
        const audio = document.getElementById('audio');
        const sub = document.getElementById('sub-text');
        const playBtn = document.getElementById('play-btn');
        const cues = {json.dumps(cues)};

        function toggleAudio() {{
            if (audio.paused) {{
                audio.play();
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
            }} else {{
                audio.pause();
                playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Reproducir Short #{short_data['num']:02d}';
            }}
        }}

        audio.addEventListener('timeupdate', () => {{
            const t = audio.currentTime;
            for (let i = cues.length - 1; i >= 0; i--) {{
                if (t >= cues[i].time) {{
                    sub.textContent = cues[i].text;
                    break;
                }}
            }}
        }});
    </script>
</body>
</html>"""
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

async def main():
    os.makedirs("media/shorts", exist_ok=True)
    os.makedirs("media/tutorials", exist_ok=True)
    os.makedirs("scratch/tutorials", exist_ok=True)

    print("=" * 70)
    print(" 🚀 GOAL ENGINE: GENERANDO 5 TUTORIALES Y 20 SHORTS VIRALES")
    print("=" * 70)

    # 1. Procesar los 5 Tutoriales de YouTube
    print("\n[Fase 1] Produciendo los 5 Tutoriales de YouTube (16:9)...")
    for tut in YOUTUBE_TUTORIALS:
        aud_path = f"scratch/tutorials/{tut['id']}_voice.mp3"
        await produce_audio_safe(tut["script"], aud_path)
        
        # Guardar metadata para YouTube
        meta_path = f"media/tutorials/{tut['id']}_meta.md"
        with open(meta_path, "w", encoding="utf-8") as f:
            f.write(f"""# YouTube Tutorial #{tut['num']}: {tut['title']}

## Título Oficial
> {tut['title']}

## Descripción Optimizada
Aprende a dominar tu operativa con Trading Journal Pro.
Enlace oficial (14 días gratis): https://tradingjournalpro.pages.dev

### Tags Oficiales:
{', '.join(tut['tags'])}
""")
        print(f"✔ Tutorial #{tut['num']} ({tut['id']}) listo.")

    # 2. Procesar los 20 Shorts Promocionales (9:16)
    print("\n[Fase 2] Produciendo los 20 Shorts Promocionales (TikTok / Reels / Shorts 9:16)...")
    queue_items = []
    
    for s in PROMOTIONAL_SHORTS:
        aud_filename = f"{s['id']}_voice.mp3"
        aud_path = os.path.join("media/shorts", aud_filename)
        await produce_audio_safe(s["script"], aud_path)
        
        html_path = os.path.join("media/shorts", f"{s['id']}_vertical.html")
        build_vertical_composition(s, html_path, aud_filename)
        
        meta_json_path = os.path.join("media/shorts", f"{s['id']}_meta.json")
        with open(meta_json_path, "w", encoding="utf-8") as f:
            json.dump(s, f, ensure_ascii=False, indent=2)

        queue_items.append({
            "id": s["id"],
            "number": s["num"],
            "title": s["title"],
            "audio": aud_path,
            "html": html_path,
            "status": "ready_to_publish",
            "channels": ["youtube_shorts", "tiktok", "instagram_reels"]
        })
        print(f"✔ Short #{s['num']:02d} ({s['tag']}) compilado.")

    # 3. Guardar la Cola Maestra de Publicación
    queue_file = "media/publish_queue.json"
    with open(queue_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_tutorials": len(YOUTUBE_TUTORIALS),
            "total_promotional_shorts": len(PROMOTIONAL_SHORTS),
            "tutorials": YOUTUBE_TUTORIALS,
            "shorts_queue": queue_items
        }, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 70)
    print(" 🎉 META 100% CUMPLIDA: 5 TUTORIALES Y 20 SHORTS GENERADOS")
    print(f" Catálogo y cola guardados en: {queue_file}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())

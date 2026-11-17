import os
import sys
import json
import asyncio
import re
import subprocess
import imageio_ffmpeg
import edge_tts

VOICE = "es-MX-JorgeNeural"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AUDIO_DIR = os.path.join(BASE_DIR, "scratch", "audio")
SCENES_DIR = os.path.join(AUDIO_DIR, "scenes")

TUTORIALS = [
    {
        "id": "tutorial_01",
        "title": "Onboarding, Registro y Configuración de Cuenta de Fondeo",
        "summary": "Guía paso a paso para crear tu cuenta en Trading Journal Pro, seleccionar el tamaño de cuenta de fondeo, configurar fases y establecer los límites de pérdida diaria del 5% y drawdown máximo del 10%.",
        "scenes": [
            {
                "scene_index": 1,
                "id": "tutorial_01_scene_01",
                "title": "Bienvenida y el reto de las cuentas de fondeo",
                "text_original": "¿Sabías que más del noventa por ciento de los traders reprueban sus evaluaciones de fondeo por no llevar una bitácora profesional y violar las reglas de drawdown sin percatarse? En el trading institucional no hay margen para la improvisación. Te damos la bienvenida a Trading Journal Pro, la plataforma en la nube diseñada específicamente para traders que operan con firmas de fondeo y cuentas privadas de alta exigencia.",
                "text_phonetic": "¿Sabías que más del noventa por ciento de los tréiders reprueban sus evaluaciones de fondeo por no llevar una bitácora profesional y violar las reglas de dróudaun sin percatarse? En el tréiding institucional no hay margen para la improvisación. Te damos la bienvenida a Tréiding Yórnal Pro, la plataforma en la nube diseñada específicamente para tréiders que operan con firmas de fondeo y cuentas privadas de alta exigencia."
            },
            {
                "scene_index": 2,
                "id": "tutorial_01_scene_02",
                "title": "Registro rápido y sincronización en la nube",
                "text_original": "Comenzar es muy sencillo y solo te tomará sesenta segundos. Ingresamos en nuestra plataforma web oficial y seleccionamos el botón de comenzar catorce días de prueba gratuita. Escribe tu nombre, tu correo electrónico y tu contraseña de seguridad. No necesitas tarjeta de crédito para iniciar hoy. Tu información se encripta y se sincroniza en tiempo real en la nube con Supabase para garantizar máxima velocidad y respaldo absoluto.",
                "text_phonetic": "Comenzar es muy sencillo y solo te tomará sesenta segundos. Ingresamos en nuestra plataforma web oficial y seleccionamos el botón de comenzar catorce días de prueba gratuita. Escribe tu nombre, tu correo electrónico y tu contraseña de seguridad. No necesitas tarjeta de crédito para iniciar hoy. Tu información se encripta y se sincroniza en tiempo real en la nube con Supabase para garantizar máxima velocidad y respaldo absoluto."
            },
            {
                "scene_index": 3,
                "id": "tutorial_01_scene_03",
                "title": "Creación y parametrización de la cuenta",
                "text_original": "Una vez dentro del panel principal, nos dirigimos a la sección de cuentas y pulsamos en añadir cuenta. Aquí podemos elegir el balance inicial según el tamaño de tu desafío, como cincuenta mil, cien mil o doscientos mil dólares. Además, seleccionas la fase actual en la que operas, ya sea Fase Uno de evaluación, Fase Dos de verificación o tu cuenta fondeada oficial con contrato activo.",
                "text_phonetic": "Una vez dentro del panel principal, nos dirigimos a la sección de cuentas y pulsamos en añadir cuenta. Aquí podemos elegir el balance inicial según el tamaño de tu desafío, como cincuenta mil, cien mil o doscientos mil dólares. Además, seleccionas la fase actual en la que operas, ya sea Fase Uno de evaluación, Fase Dos de verificación o tu cuenta fondeada oficial con contrato activo."
            },
            {
                "scene_index": 4,
                "id": "tutorial_01_scene_04",
                "title": "Configuración estricta de límites de pérdida y drawdown",
                "text_original": "Ahora parametrizamos las dos métricas que definirán tu permanencia: el límite de pérdida diaria y el drawdown total permitido. En la mayoría de empresas de fondeo, el límite diario se fija estrictamente en un cinco por ciento y el drawdown máximo acumulado en un diez por ciento. Trading Journal Pro calcula este colchón de riesgo sobre tu balance inicial o tu equidad flotante, según las condiciones de tu firma.",
                "text_phonetic": "Ahora parametrizamos las dos métricas que definirán tu permanencia: el límite de pérdida diaria y el dróudaun total permitido. En la mayoría de empresas de fondeo, el límite diario se fija estrictamente en un cinco por ciento y el dróudaun máximo acumulado en un diez por ciento. Tréiding Yórnal Pro calcula este colchón de riesgo sobre tu balance inicial o tu equidad flotante, según las condiciones de tu firma."
            },
            {
                "scene_index": 5,
                "id": "tutorial_01_scene_05",
                "title": "Monitoreo del colchón de riesgo en tiempo real",
                "text_original": "Con estos datos listos, el sistema genera tu panel de control de riesgo. Verás con exactitud cuántos dólares tienes disponibles para arriesgar en la jornada antes de recibir un aviso preventivo o tocar el margen prohibido. Este indicador visual te protege de la sobreoperativa y te obliga a respetar la gestión de riesgo que exige el estándar institucional de los traders rentables.",
                "text_phonetic": "Con estos datos listos, el sistema genera tu panel de control de riesgo. Verás con exactitud cuántos dólares tienes disponibles para arriesgar en la jornada antes de recibir un aviso preventivo o tocar el margen prohibido. Este indicador visual te protege de la sobreoperativa y te obliga a respetar la gestión de riesgo que exige el estándar institucional de los tréiders rentables."
            },
            {
                "scene_index": 6,
                "id": "tutorial_01_scene_06",
                "title": "Llamada a la acción y siguiente tutorial",
                "text_original": "Configurar tu cuenta de fondeo con parámetros precisos es el primer paso para proteger tu capital y aprobar cualquier prueba de evaluación. Activa hoy tus catorce días de acceso gratuito en el enlace de la descripción. En el próximo tutorial aprenderás a registrar y auditar cada operación en vivo con cálculo automático de lotaje y métricas avanzadas. Suscríbete y nos vemos en el siguiente video.",
                "text_phonetic": "Configurar tu cuenta de fondeo con parámetros precisos es el primer paso para proteger tu capital y aprobar cualquier prueba de evaluación. Activa hoy tus catorce días de acceso gratuito en el enlace de la descripción. En el próximo tutorial aprenderás a registrar y auditar cada operación en vivo con cálculo automático de lotaje y métricas avanzadas. Suscríbete y nos vemos en el siguiente video."
            }
        ]
    },
    {
        "id": "tutorial_02",
        "title": "Registro y Auditoría de Operaciones en Vivo",
        "summary": "Domina el formulario de nueva operación: selección de activos, precio de entrada, Stop Loss, Take Profit, cálculo automático de pips y lotaje, ratio riesgo-beneficio y notas psicológicas.",
        "scenes": [
            {
                "scene_index": 1,
                "id": "tutorial_02_scene_01",
                "title": "El registro manual versus la bitácora profesional",
                "text_original": "Muchos traders siguen anotando sus operaciones en hojas de cálculo desordenadas o simplemente confiando en la memoria. Este mal hábito impide detectar fugas de capital y errores repetitivos en tu operativa. En este tutorial aprenderás a registrar cada trade en Trading Journal Pro con precisión quirúrgica, capturando parámetros técnicos, lotaje automático y el estado emocional de tu ejecución en tiempo real.",
                "text_phonetic": "Muchos tréiders siguen anotando sus operaciones en hojas de cálculo desordenadas o simplemente confiando en la memoria. Este mal hábito impide detectar fugas de capital y errores repetitivos en tu operativa. En este tutorial aprenderás a registrar cada tréid en Tréiding Yórnal Pro con precisión quirúrgica, capturando parámetros técnicos, lotaje automático y el estado emocional de tu ejecución en tiempo real."
            },
            {
                "scene_index": 2,
                "id": "tutorial_02_scene_02",
                "title": "Selección de activo, dirección y precio de entrada",
                "text_original": "Para registrar una nueva entrada, abrimos el formulario de operación y seleccionamos el par o activo financiero, ya sea en Forex, Oro o Índices bursátiles. Definimos la dirección del trade, especificando si se trata de una orden de compra o una orden de venta. A continuación, ingresamos el precio exacto de entrada y la fecha y hora precisa de ejecución en el mercado.",
                "text_phonetic": "Para registrar una nueva entrada, abrimos el formulario de operación y seleccionamos el par o activo financiero, ya sea en Fórex, Oro o Índices bursátiles. Definimos la dirección del tréid, especificando si se trata de una orden de compra o una orden de venta. A continuación, ingresamos el precio exacto de entrada y la fecha y hora precisa de ejecución en el mercado."
            },
            {
                "scene_index": 3,
                "id": "tutorial_02_scene_03",
                "title": "Parametrización de Stop Loss, Take Profit y ratio R:R",
                "text_original": "El siguiente paso es definir los niveles de salida. Colocamos nuestro stop loss para delimitar el riesgo asumido y nuestro take profit como objetivo de beneficio. El sistema calcula en milisegundos la distancia en pips de riesgo y la proyección matemática de la relación riesgo-beneficio, permitiéndote comprobar al instante si el setup cumple con el ratio mínimo requerido por tu plan de trading.",
                "text_phonetic": "El siguiente paso es definir los niveles de salida. Colocamos nuestro stóp-los para delimitar el riesgo asumido y nuestro téik-prófit como objetivo de beneficio. El sistema calcula en milisegundos la distancia en pips de riesgo y la proyección matemática de la relación riesgo-beneficio, permitiéndote comprobar al instante si el sétap cumple con el ratio mínimo requerido por tu plan de tréiding."
            },
            {
                "scene_index": 4,
                "id": "tutorial_02_scene_04",
                "title": "Calculadora inteligente de lotaje institucional",
                "text_original": "Olvídate de cometer errores de cálculo en vivo cuando el mercado se mueve rápido. La calculadora de lotaje integrada analiza el balance actual de tu cuenta de fondeo y el porcentaje de capital que deseas arriesgar, arrojando el tamaño de lote exacto a colocar en tu terminal. Así eliminas el sobrelotaje y mantienes tu riesgo estrictamente acotado bajo cualquier condición de volatilidad.",
                "text_phonetic": "Olvídate de cometer errores de cálculo en vivo cuando el mercado se mueve rápido. La calculadora de lotaje integrada analiza el balance actual de tu cuenta de fondeo y el porcentaje de capital que deseas arriesgar, arrojando el tamaño de lote exacto a colocar en tu terminal. Así eliminas el sobrelotaje y mantienes tu riesgo estrictamente acotado bajo cualquier condición de volatilidad."
            },
            {
                "scene_index": 5,
                "id": "tutorial_02_scene_05",
                "title": "Auditoría psicológica, setups y confirmaciones técnicas",
                "text_original": "La rentabilidad a largo plazo no depende solo de números, sino de tu psicología. En la sección de auditoría cualitativa, registras el setup utilizado, las confirmaciones técnicas observadas en el gráfico y tu nivel de disciplina emocional. Puedes subir capturas de pantalla de la entrada y anotar si sentiste impaciencia, miedo o si ejecutaste tu estrategia con absoluta serenidad.",
                "text_phonetic": "La rentabilidad a largo plazo no depende solo de números, sino de tu psicología. En la sección de auditoría cualitativa, registras el sétap utilizado, las confirmaciones técnicas observadas en el gráfico y tu nivel de disciplina emocional. Puedes subir capturas de pantalla de la entrada y anotar si sentiste impaciencia, miedo o si ejecutaste tu estrategia con absoluta serenidad."
            },
            {
                "scene_index": 6,
                "id": "tutorial_02_scene_06",
                "title": "Cierre de trade, Break Even y guardado en la bitácora",
                "text_original": "Al concluir la operación, marcamos el resultado final, ajustamos si movimos a break even o si cerramos parciales. Al guardar, Trading Journal Pro recalcula tu win rate, actualiza tu curva de balance y sincroniza tu historial en la nube. Domina el arte del registro profesional activando tu prueba gratuita hoy mismo en el enlace de abajo. Nos vemos en el próximo tutorial.",
                "text_phonetic": "Al concluir la operación, marcamos el resultado final, ajustamos si movimos a bréik-íven o si cerramos parciales. Al guardar, Tréiding Yórnal Pro recalcula tu uín-reit, actualiza tu curva de balance y sincroniza tu historial en la nube. Domina el arte del registro profesional activando tu prueba gratuita hoy mismo en el enlace de abajo. Nos vemos en el próximo tutorial."
            }
        ]
    },
    {
        "id": "tutorial_03",
        "title": "Laboratorio de Backtesting y Simulador de Retiros",
        "summary": "Validación de estrategias pasadas sin arriesgar dinero, auditoría estadística de robustez y simulación de retiros con Profit Split del 80% y 90% en cuentas de fondeo.",
        "scenes": [
            {
                "scene_index": 1,
                "id": "tutorial_03_scene_01",
                "title": "El peligro de arriesgar capital sin validar la estrategia",
                "text_original": "Uno de los errores más costosos cometidos por los traders es arriesgar dinero real en cuentas de evaluación sin haber comprobado antes si su estrategia posee una ventaja estadística verificada. Probar un sistema en vivo sin datos históricos es apostar a ciegas. En este tutorial conocerás el Laboratorio de Backtesting Pro y el Simulador de Retiros con Profit Split de Trading Journal Pro.",
                "text_phonetic": "Uno de los errores más costosos cometidos por los tréiders es arriesgar dinero real en cuentas de evaluación sin haber comprobado antes si su estrategia posee una ventaja estadística verificada. Probar un sistema en vivo sin datos históricos es apostar a ciegas. En este tutorial conocerás el Laboratorio de Bák-tésting Pro y el Simulador de Retiros con Prófit-Split de Tréiding Yórnal Pro."
            },
            {
                "scene_index": 2,
                "id": "tutorial_03_scene_02",
                "title": "Carga de sesiones pasadas y pruebas sin riesgo",
                "text_original": "En el módulo de backtesting puedes recrear sesiones de mercado pasadas y cargar cientos de operaciones simuladas sin arriesgar un solo centavo de tu capital. Ingresas cada setup según las reglas de tu sistema, indicando temporalidad, horario de sesión y contexto del precio. La plataforma almacena cada simulación de manera independiente a tus cuentas de fondeo activas para una auditoría limpia y transparente.",
                "text_phonetic": "En el módulo de bák-tésting puedes recrear sesiones de mercado pasadas y cargar cientos de operaciones simuladas sin arriesgar un solo centavo de tu capital. Ingresas cada sétap según las reglas de tu sistema, indicando temporalidad, horario de sesión y contexto del precio. La plataforma almacena cada simulación de manera independiente a tus cuentas de fondeo activas para una auditoría limpia y transparente."
            },
            {
                "scene_index": 3,
                "id": "tutorial_03_scene_03",
                "title": "Curva simulada y métricas de robustez histórica",
                "text_original": "A medida que completas tu backtesting, el sistema genera una curva de rendimiento proyectada y desglosa tus métricas fundamentales: tasa de acierto, factor de recuperación y el drawdown histórico más severo. Esta información te permite identificar con certeza matemática si tu estrategia resistirá las fases de evaluación de las prop firms o si requiere ajustes en la relación de riesgo y beneficio.",
                "text_phonetic": "A medida que completas tu bák-tésting, el sistema genera una curva de rendimiento proyectada y desglosa tus métricas fundamentales: tasa de acierto, factor de recuperación y el dróudaun histórico más severo. Esta información te permite identificar con certeza matemática si tu estrategia resistirá las fases de evaluación de las prop firms o si requiere ajustes en la relación de riesgo y beneficio."
            },
            {
                "scene_index": 4,
                "id": "tutorial_03_scene_04",
                "title": "Simulador de Retiros y liquidación de fases",
                "text_original": "Una vez validada tu estrategia, pasamos al Simulador de Retiros y Payouts. Esta herramienta te permite planificar la liquidación de las fases de evaluación hasta obtener tu cuenta fondeada. Solo defines el tamaño del capital, el objetivo de ganancia mensual estimado y el ciclo de facturación establecido por tu empresa de fondeo, simulando el crecimiento de tu saldo con precisión.",
                "text_phonetic": "Una vez validada tu estrategia, pasamos al Simulador de Retiros y Péiauts. Esta herramienta te permite planificar la liquidación de las fases de evaluación hasta obtener tu cuenta fondeada. Solo defines el tamaño del capital, el objetivo de ganancia mensual estimado y el ciclo de facturación establecido por tu empresa de fondeo, simulando el crecimiento de tu saldo con precisión."
            },
            {
                "scene_index": 5,
                "id": "tutorial_03_scene_05",
                "title": "Cálculo del Profit Split del 80% y 90%",
                "text_original": "El simulador integra el cálculo del profit split institucional, permitiéndote configurar esquemas estándar del ochenta o noventa por ciento a tu favor. La herramienta desglosa automáticamente la comisión de la firma de fondeo, el monto neto exacto de tu próximo payout y las fechas estimadas para solicitar tus transferencias bancarias o retiros en criptomonedas con total claridad contable.",
                "text_phonetic": "El simulador integra el cálculo del prófit-split institucional, permitiéndote configurar esquemas estándar del ochenta o noventa por ciento a tu favor. La herramienta desglosa automáticamente la comisión de la firma de fondeo, el monto neto exacto de tu próximo péiaut y las fechas estimadas para solicitar tus transferencias bancarias o retiros en criptomonedas con total claridad contable."
            },
            {
                "scene_index": 6,
                "id": "tutorial_03_scene_06",
                "title": "Llamada a la acción y preparación para el Dashboard",
                "text_original": "Comienza a validar tu ventaja estadística hoy mismo y proyecta tus ganancias reales con Trading Journal Pro. Inicia tu prueba gratuita de catorce días desde el enlace que encontrarás en la caja de descripción. En el próximo tutorial analizaremos a fondo el Dashboard Analítico, la curva de equidad y el mapa de calor mensual. Suscríbete y acompáñanos en el siguiente video.",
                "text_phonetic": "Comienza a validar tu ventaja estadística hoy mismo y proyecta tus ganancias reales con Tréiding Yórnal Pro. Inicia tu prueba gratuita de catorce días desde el enlace que encontrarás en la caja de descripción. En el próximo tutorial analizaremos a fondo el Dáshbord Analítico, la curva de equidad y el mapa de calor mensual. Suscríbete y acompáñanos en el siguiente video."
            }
        ]
    },
    {
        "id": "tutorial_04",
        "title": "Dashboard Analítico, Curva de Equidad y Calendario de Rentabilidad",
        "summary": "Análisis cuantitativo de rendimiento: Win Rate, Profit Factor, Expectativa Matemática, Curva de Equidad en tiempo real y Mapa de Calor del Calendario Mensual.",
        "scenes": [
            {
                "scene_index": 1,
                "id": "tutorial_04_scene_01",
                "title": "El poder de las métricas objetivas en el trading",
                "text_original": "En los mercados financieros la intuición no basta; lo que no se mide no se puede mejorar. Los traders profesionales basan cada una de sus decisiones en datos empíricos y análisis estadístico riguroso. En este tutorial exploraremos el Dashboard Analítico de Trading Journal Pro, una central de inteligencia que transforma cada operación registrada en métricas clave para optimizar tu rendimiento.",
                "text_phonetic": "En los mercados financieros la intuición no basta; lo que no se mide no se puede mejorar. Los tréiders profesionales basan cada una de sus decisiones en datos empíricos y análisis estadístico riguroso. En este tutorial exploraremos el Dáshbord Analítico de Tréiding Yórnal Pro, una central de inteligencia que transforma cada operación registrada en métricas clave para optimizar tu rendimiento."
            },
            {
                "scene_index": 2,
                "id": "tutorial_04_scene_02",
                "title": "KPIs vitales: Win Rate, Profit Factor y Expectativa Matemática",
                "text_original": "En la parte superior del dashboard encontrarás tus tres indicadores vitales. Primero, el win rate o porcentaje de operaciones ganadoras. Segundo, el profit factor, que mide la relación entre tus ganancias brutas y tus pérdidas totales; un valor superior a uno punto cinco indica una operativa saludable. Tercero, la expectativa matemática por operación, calculando cuántos dólares ganas en promedio en cada trade ejecutado.",
                "text_phonetic": "En la parte superior del dáshbord encontrarás tus tres indicadores vitales. Primero, el uín-reit o porcentaje de operaciones ganadoras. Segundo, el prófit-fáctor, que mide la relación entre tus ganancias brutas y tus pérdidas totales; un valor superior a uno punto cinco indica una operativa saludable. Tercero, la expectativa matemática por operación, calculando cuántos dólares ganas en promedio en cada tréid ejecutado."
            },
            {
                "scene_index": 3,
                "id": "tutorial_04_scene_03",
                "title": "Curva de Equidad interactiva y control de rachas",
                "text_original": "Justo debajo se despliega la curva de equidad en tiempo real. Este gráfico interactivo te muestra la evolución de tu balance trade tras trade. Aquí puedes identificar si tu crecimiento es constante y equilibrado o si experimentas picos de volatilidad causados por sobreapalancamiento. Además, refleja las fases de drawdown temporal para ayudarte a gestionar rachas negativas sin perder la compostura.",
                "text_phonetic": "Justo debajo se despliega la curva de equidad en tiempo real. Este gráfico interactivo te muestra la evolución de tu balance tréid tras tréid. Aquí puedes identificar si tu crecimiento es constante y equilibrado o si experimentas picos de volatilidad causados por sobreapalancamiento. Además, refleja las fases de dróudaun temporal para ayudarte a gestionar rachas negativas sin perder la compostura."
            },
            {
                "scene_index": 4,
                "id": "tutorial_04_scene_04",
                "title": "Calendario de Rentabilidad y Mapa de Calor mensual",
                "text_original": "Una de las funciones más queridas por nuestra comunidad es el Calendario de Rentabilidad con mapa de calor integrado. Cada día del mes se colorea en verde o rojo según el balance neto obtenido, indicando el porcentaje ganado y el número de operaciones realizadas. Esto te permite evaluar de un vistazo la consistencia de tu semana y detectar patrones de comportamiento en días específicos.",
                "text_phonetic": "Una de las funciones más queridas por nuestra comunidad es el Calendario de Rentabilidad con mapa de calor integrado. Cada día del mes se colorea en verde o rojo según el balance neto obtenido, indicando el porcentaje ganado y el número de operaciones realizadas. Esto te permite evaluar de un vistazo la consistencia de tu semana y detectar patrones de comportamiento en días específicos."
            },
            {
                "scene_index": 5,
                "id": "tutorial_04_scene_05",
                "title": "Filtros analíticos por setup, activo y sesión horaria",
                "text_original": "¿Sabes cuál es tu mejor setup técnico o en qué sesión horaria eres más rentable? Con los filtros avanzados puedes aislar tus estadísticas por activo, tipo de confirmación o sesión operativa, ya sea Londres o Nueva York. Descubrirás de inmediato qué modelos de entrada generan la mayor parte de tus beneficios y cuáles representan pérdidas recurrentes que debes eliminar.",
                "text_phonetic": "¿Sabes cuál es tu mejor sétap técnico o en qué sesión horaria eres más rentable? Con los filtros avanzados puedes aislar tus estadísticas por activo, tipo de confirmación o sesión operativa, ya sea Londres o Nueva York. Descubrirás de inmediato qué modelos de entrada generan la mayor parte de tus beneficios y cuáles representan pérdidas recurrentes que debes eliminar."
            },
            {
                "scene_index": 6,
                "id": "tutorial_04_scene_06",
                "title": "Llamada a la acción hacia la auditoría anti-quiebre",
                "text_original": "Toma el control de tu trading con datos auditados y lleva tu carrera al siguiente nivel profesional. Regístrate en Trading Journal Pro y disfruta de catorce días gratis sin compromiso a través del enlace fijado en la descripción. En el tutorial final aprenderás sobre el sistema de Auditoría Anti-Quiebre y control estricto de drawdown. No olvides suscribirte y nos vemos pronto.",
                "text_phonetic": "Toma el control de tu tréiding con datos auditados y lleva tu carrera al siguiente nivel profesional. Regístrate en Tréiding Yórnal Pro y disfruta de catorce días gratis sin compromiso a través del enlace fijado en la descripción. En el tutorial final aprenderás sobre el sistema de Auditoría Anti-Quiebre y control estricto de dróudaun. No olvides suscribirte y nos vemos pronto."
            }
        ]
    },
    {
        "id": "tutorial_05",
        "title": "Auditoría Anti-Quiebre, Control Estricto de Drawdown y Alertas Preventivas",
        "summary": "Protección de cuentas de fondeo: monitoreo continuo de colchón diario, trailing drawdown dinámico vs estático y alertas de riesgo preventivas.",
        "scenes": [
            {
                "scene_index": 1,
                "id": "tutorial_05_scene_01",
                "title": "La causa principal de quiebre en cuentas de fondeo",
                "text_original": "La razón principal por la que la mayoría de los traders queman sus cuentas de fondeo no es una mala estrategia, sino la pérdida de control del drawdown en días de alta volatilidad emocional. Exceder el límite de pérdida diaria por una fracción o rozar el nivel de trailing drawdown significa la cancelación automática del contrato. En este tutorial aprenderás a utilizar el sistema de Auditoría Anti-Quiebre de Trading Journal Pro.",
                "text_phonetic": "La razón principal por la que la mayoría de los tréiders queman sus cuentas de fondeo no es una mala estrategia, sino la pérdida de control del dróudaun en días de alta volatilidad emocional. Exceder el límite de pérdida diaria por una fracción o rozar el nivel de tréiling dróudaun significa la cancelación automática del contrato. En este tutorial aprenderás a utilizar el sistema de Auditoría Anti-Quiebre de Tréiding Yórnal Pro."
            },
            {
                "scene_index": 2,
                "id": "tutorial_05_scene_02",
                "title": "El motor de Auditoría Anti-Quiebre en tiempo real",
                "text_original": "El motor de Auditoría Anti-Quiebre monitoriza de forma continua cada movimiento de tu operativa. A diferencia de las bitácoras tradicionales que solo registran operaciones cerradas, nuestro sistema evalúa el impacto de tus posiciones flotantes y su correlación con las reglas específicas de tu empresa de fondeo, blindando tu cuenta antes de que cometas una infracción irreparable.",
                "text_phonetic": "El motor de Auditoría Anti-Quiebre monitoriza de forma continua cada movimiento de tu operativa. A diferencia de las bitácoras tradicionales que solo registran operaciones cerradas, nuestro sistema evalúa el impacto de tus posiciones flotantes y su correlación con las reglas específicas de tu empresa de fondeo, blindando tu cuenta antes de que cometas una infracción irreparable."
            },
            {
                "scene_index": 3,
                "id": "tutorial_05_scene_03",
                "title": "Monitoreo del colchón diario del 5% y margen de riesgo",
                "text_original": "En tu barra superior de auditoría se calcula dinámicamente tu colchón de pérdida diaria del cinco por ciento. La plataforma te muestra en tiempo real la cifra exacta en dólares que puedes arriesgar durante el día en curso. Si acumulas pérdidas parciales en la sesión, el margen disponible se reduce visiblemente para recordarte que debes reducir tu exposición o detener tu operativa por hoy.",
                "text_phonetic": "En tu barra superior de auditoría se calcula dinámicamente tu colchón de pérdida diaria del cinco por ciento. La plataforma te muestra en tiempo real la cifra exacta en dólares que puedes arriesgar durante el día en curso. Si acumulas pérdidas parciales en la sesión, el margen disponible se reduce visiblemente para recordarte que debes reducir tu exposición o detener tu operativa por hoy."
            },
            {
                "scene_index": 4,
                "id": "tutorial_05_scene_04",
                "title": "Trailing Drawdown versus Drawdown Estático",
                "text_original": "Muchas firmas de fondeo aplican trailing drawdown, una regla compleja donde el límite de pérdida persigue tu punto más alto de equidad. Trading Journal Pro ajusta automáticamente el umbral crítico según el modelo de tu cuenta: ya sea un drawdown estático fijo sobre el balance de partida o un trailing drawdown dinámico. Así sabrás siempre con precisión quirúrgica dónde está ubicado tu límite de quiebre.",
                "text_phonetic": "Muchas firmas de fondeo aplican tréiling dróudaun, una regla compleja donde el límite de pérdida persigue tu punto más alto de equidad. Tréiding Yórnal Pro ajusta automáticamente el umbral crítico según el modelo de tu cuenta: ya sea un dróudaun estático fijo sobre el balance de partida o un tréiling dróudaun dinámico. Así sabrás siempre con precisión quirúrgica dónde está ubicado tu límite de quiebre."
            },
            {
                "scene_index": 5,
                "id": "tutorial_05_scene_05",
                "title": "Alertas preventivas y barrera contra el trading vengativo",
                "text_original": "Para evitar descuidos fatales, la plataforma activa alertas visuales cuando alcanzas el setenta por ciento de tu límite diario permitido. Si continúas arriesgando y tocas el noventa por ciento del margen crítico, el sistema emite una advertencia de alto riesgo y bloquea las sugerencias de lotaje en la calculadora. Esta barrera psicológica te ayuda a evitar el trading vengativo y salvaguarda tu capital.",
                "text_phonetic": "Para evitar descuidos fatales, la plataforma activa alertas visuales cuando alcanzas el setenta por ciento de tu límite diario permitido. Si continúas arriesgando y tocas el noventa por ciento del margen crítico, el sistema emite una advertencia de alto riesgo y bloquea las sugerencias de lotaje en la calculadora. Esta barrera psicológica te ayuda a evitar el tréiding vengativo y salvaguarda tu capital."
            },
            {
                "scene_index": 6,
                "id": "tutorial_05_scene_06",
                "title": "Conclusión de la serie y llamado a la acción",
                "text_original": "El éxito en el trading de fondeo no se define por ganar un trade aislado, sino por proteger tus cuentas a través de una gestión de riesgo inquebrantable. Con Trading Journal Pro tienes a tu lado un auditor institucional disponible las veinticuatro horas. Empieza hoy tus catorce días de prueba gratuita desde el enlace en la descripción. Suscríbete al canal y nos vemos en la cima de la consistencia.",
                "text_phonetic": "El éxito en el tréiding de fondeo no se define por ganar un tréid aislado, sino por proteger tus cuentas a través de una gestión de riesgo inquebrantable. Con Tréiding Yórnal Pro tienes a tu lado un auditor institucional disponible las veinticuatro horas. Empieza hoy tus catorce días de prueba gratuita desde el enlace en la descripción. Suscríbete al canal y nos vemos en la cima de la consistencia."
            }
        ]
    }
]

def get_audio_duration(file_path):
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    res = subprocess.run([exe, '-i', file_path], capture_output=True, text=True, errors='ignore')
    m = re.search(r'Duration:\s*(\d+):(\d+):(\d+\.\d+)', res.stderr)
    if m:
        hours, mins, secs = m.groups()
        return round(int(hours) * 3600 + int(mins) * 60 + float(secs), 2)
    return 0.0

async def generate_scene_audio(scene, scene_path):
    print(f"  -> Generando locución escena: {scene['id']}...")
    communicate = edge_tts.Communicate(scene['text_phonetic'], VOICE)
    await communicate.save(scene_path)
    dur = get_audio_duration(scene_path)
    size = os.path.getsize(scene_path)
    print(f"     Listo: {dur}s ({size} bytes)")
    return dur

def build_full_audio(scene_paths, full_output_path, pause_sec=0.35):
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    # Create a small silence file
    silence_file = os.path.join(AUDIO_DIR, "silence_temp.mp3")
    cmd_silence = [
        exe, '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono',
        '-t', str(pause_sec), '-q:a', '9', '-acodec', 'libmp3lame', silence_file
    ]
    subprocess.run(cmd_silence, capture_output=True, check=True)

    # Concat list file
    concat_list_file = os.path.join(AUDIO_DIR, "concat_temp.txt")
    with open(concat_list_file, 'w', encoding='utf-8') as f:
        for i, sp in enumerate(scene_paths):
            f.write(f"file '{sp.replace('\\', '/')}'\n")
            if i < len(scene_paths) - 1:
                f.write(f"file '{silence_file.replace('\\', '/')}'\n")

    cmd_concat = [
        exe, '-y', '-f', 'concat', '-safe', '0',
        '-i', concat_list_file, '-c', 'copy', full_output_path
    ]
    subprocess.run(cmd_concat, capture_output=True, check=True)

    # Clean temps
    if os.path.exists(silence_file):
        os.remove(silence_file)
    if os.path.exists(concat_list_file):
        os.remove(concat_list_file)

    return get_audio_duration(full_output_path)

async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    os.makedirs(SCENES_DIR, exist_ok=True)

    manifest = {
        "project": "Trading Journal Pro - Video Tutorials",
        "voice": VOICE,
        "language": "es-MX",
        "generated_at": "2026-11-03",
        "pause_between_scenes_sec": 0.35,
        "tutorials": []
    }

    print(f"=== INICIANDO GENERACIÓN DE LOCUCIONES CON EDGE-TTS [{VOICE}] ===")

    for tut in TUTORIALS:
        tut_id = tut["id"]
        print(f"\n[PROCESANDO] {tut_id}: {tut['title']}")
        scene_paths = []
        tut_scenes_manifest = []
        current_time = 0.0

        for scene in tut["scenes"]:
            scene_filename = f"{scene['id']}.mp3"
            scene_path = os.path.join(SCENES_DIR, scene_filename)
            rel_scene_path = os.path.relpath(scene_path, BASE_DIR).replace('\\', '/')

            dur = await generate_scene_audio(scene, scene_path)
            start_time = round(current_time, 2)
            end_time = round(start_time + dur, 2)
            current_time = end_time + 0.35  # pause

            tut_scenes_manifest.append({
                "scene_index": scene["scene_index"],
                "id": scene["id"],
                "title": scene["title"],
                "word_count": len(scene["text_original"].split()),
                "text_original": scene["text_original"],
                "text_phonetic": scene["text_phonetic"],
                "audio_file": rel_scene_path,
                "duration_seconds": dur,
                "start_time_seconds": start_time,
                "end_time_seconds": end_time
            })
            scene_paths.append(scene_path)

        # Concatenate full video audio
        full_filename = f"{tut_id}_voice.mp3"
        full_path = os.path.join(AUDIO_DIR, full_filename)
        rel_full_path = os.path.relpath(full_path, BASE_DIR).replace('\\', '/')
        
        print(f"  -> Ensamblando audio completo: {full_filename}...")
        total_dur = build_full_audio(scene_paths, full_path, pause_sec=0.35)
        print(f"     Audio completo generado: {total_dur}s ({round(total_dur/60, 2)} min)")

        manifest["tutorials"].append({
            "id": tut_id,
            "title": tut["title"],
            "summary": tut["summary"],
            "total_scenes": len(tut_scenes_manifest),
            "total_words": sum(s["word_count"] for s in tut_scenes_manifest),
            "total_duration_seconds": total_dur,
            "total_duration_formatted": f"{int(total_dur // 60)}m {int(total_dur % 60):02d}s",
            "full_audio_file": rel_full_path,
            "scenes": tut_scenes_manifest
        })

    # Save manifest.json
    manifest_path = os.path.join(AUDIO_DIR, "manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Manifiesto guardado en: {manifest_path}")

    # Summary table
    print("\n" + "="*80)
    print(f"{'TUTORIAL':<15} | {'ESCENAS':<8} | {'PALABRAS':<10} | {'DURACIÓN':<12} | {'ESTADO'}")
    print("="*80)
    for t in manifest["tutorials"]:
        dur_str = t["total_duration_formatted"]
        status = "CUMPLE (2-3 min)" if 120 <= t["total_duration_seconds"] <= 180 else "VERIFICAR"
        print(f"{t['id']:<15} | {t['total_scenes']:<8} | {t['total_words']:<10} | {dur_str:<12} | {status}")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(main())

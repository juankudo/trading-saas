# 🎙️ Guía Fonética y Locución de Audio — AsTrade Tutorials

Esta guía establece el estándar fonético y de procesamiento de audio para todos los videos tutoriales de **AsTrade**, utilizando la voz neuronal institucional de Jorge (`es-ES-JorgeNeural`).

---

## 1. Configuración de Edge-TTS

| Parámetro | Valor Oficial | Notas |
| :--- | :--- | :--- |
| **Voz** | `es-ES-JorgeNeural` | Tono masculino, analítico, seguro e institucional. |
| **Velocidad (Rate)** | `+0%` (o `-2%` para conceptos complejos) | Ritmo pausado que permite asimilar la interfaz. |
| **Tono (Pitch)** | `+0Hz` | Frecuencia natural neutra. |
| **Volumen** | `+0%` | Normalizado. |

---

## 2. Regla de Fonética Dual Estricta

Para mantener coherencia profesional entre la terminología institucional internacional y la naturalidad en español:

### A. Siglas y Acrónimos Operativos (En Español)
Las siglas deben pronunciarse **siempre en español**:
- `TP` ➔ **"Té Pé"**
- `Full TP` ➔ **"Full Té Pé"**
- `BE` ➔ **"Bé E"**
- `SL` ➔ **"Ese Ele"**
- `R:R` ➔ **"Erre Erre"** (o *"Ratio riesgo beneficio"*)

### B. Términos Técnicos Completos (En Inglés Técnico)
Cuando se menciona el concepto completo o la orden técnica, se pronuncia en **inglés técnico con adaptación fonética**:
- `Take Profit` ➔ **"téik prófit"**
- `Break Even` ➔ **"bréik íven"**
- `Stop Loss` ➔ **"stóp los"**
- `Market Buy` ➔ **"Márket Bai"**
- `Market Sell` ➔ **"Márket Sel"**
- `Buy Limit` ➔ **"Bai Límit"**
- `Sell Limit` ➔ **"Sel Límit"**
- `Drawdown` ➔ **"dróudaun"**
- `Trading` ➔ **"tréiding"**
- `Journal` ➔ **"yérnal"**
- `Challenge` ➔ **"chálensh"**

### C. Términos Naturales en Español
- *"Entradas"*, *"Nueva Entrada"*, *"Registro de Trades"*, *"Fase de prueba"*, *"Métricas"* se mantienen en pronunciación española estándar.

---

## 3. Diccionario de Transformación Fonética (`to_phonetic_spanish`)

Función estándar en Python para pre-procesar los guiones antes de enviarlos a `edge-tts`:

```python
import re

def to_phonetic_spanish(text: str) -> str:
    """
    Aplica fonética dual:
    - Siglas en español (TP, BE, SL).
    - Términos completos en inglés (Take Profit, Stop Loss, Break Even, Drawdown).
    - Expresiones numéricas y monetarias naturales.
    """
    # 1. Términos técnicos compuestos en inglés
    text = re.sub(r'\bTake Profit\b', 'téik prófit', text, flags=re.I)
    text = re.sub(r'\bStop Loss\b', 'stóp los', text, flags=re.I)
    text = re.sub(r'\bBreak Even\b', 'bréik íven', text, flags=re.I)
    text = re.sub(r'\bMarket Buy\b', 'Márket Bai', text, flags=re.I)
    text = re.sub(r'\bMarket Sell\b', 'Márket Sel', text, flags=re.I)
    text = re.sub(r'\bDrawdown\b', 'dróudaun', text, flags=re.I)
    text = re.sub(r'\bProp Firms?\b', 'prop férms', text, flags=re.I)
    
    # 2. Siglas técnicas habladas en español
    text = re.sub(r'\bFull TP\b', 'Full Té Pé', text, flags=re.I)
    text = re.sub(r'\bTP\b', 'Té Pé', text)
    text = re.sub(r'\bBE\b', 'Bé E', text)
    text = re.sub(r'\bSL\b', 'Ese Ele', text)
    
    # 3. Ratios y puntuación
    text = re.sub(r'\b1:3(?:\.00)?\b', 'uno a tres', text)
    text = re.sub(r'\b1:2(?:\.00)?\b', 'uno a dos', text)
    text = re.sub(r'\bR:R\b', 'riesgo beneficio', text, flags=re.I)
    
    # 4. Números y unidades
    text = re.sub(r'\$100,?000\b', 'cien mil dólares', text)
    text = re.sub(r'\$103,?000\b', 'ciento tres mil dólares', text)
    text = re.sub(r'\$1,?000\b', 'mil dólares', text)
    text = re.sub(r'\$3,?000\b', 'tres mil dólares', text)
    text = re.sub(r'\$8,?000\b', 'ocho mil dólares', text)
    text = re.sub(r'\$10,?000\b', 'diez mil dólares', text)
    
    text = re.sub(r'20 pips', 'veinte pips', text)
    text = re.sub(r'60 pips', 'sesenta pips', text)
    text = re.sub(r'15 pips', 'quince pips', text)
    text = re.sub(r'5(?:\.00)? lotes', 'cinco lotes', text)
    text = re.sub(r'\+?3(?:\.00)?%', 'tres por ciento', text)
    text = re.sub(r'1(?:\.0)?%', 'uno por ciento', text)
    text = re.sub(r'8%', 'ocho por ciento', text)
    text = re.sub(r'10%', 'diez por ciento', text)
    
    return text
```

---

## 4. Estructura del Manifiesto de Sincronización (`manifest.json`)

El archivo de audio continuo sirve como **reloj maestro** para la toma continua en Playwright. Cada bloque debe definir:

```json
{
  "id": "block3_risk_lots",
  "title": "Paso 2: Stop Loss, Take Profit y Lotaje",
  "start_seconds": 26.42,
  "duration_seconds": 20.14,
  "cumulative_end": 46.56,
  "tag": "PASO 2 · RIESGO Y LOTAJE AUTOMÁTICO",
  "ui_actions": [
    "glideto #inputPipsSL",
    "fill 20",
    "glideto #inputPipsTP",
    "fill 60",
    "glideto #inputRiesgo",
    "fill 1.0",
    "pulse #inputLotajeCalc"
  ]
}
```

Al final de cada bloque en el script de filmación, se calcula el tiempo restante respecto a `b['cumulative_end']` y se ejecuta un `await asyncio.sleep(rem)` para mantener sincronía fonética absoluta.

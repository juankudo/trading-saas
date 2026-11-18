# 📈 Reglas de Realismo y Coherencia en Trading — AsTrade Tutorials

Esta guía define las reglas cuantitativas, horarios de mercado y configuraciones operativas que deben respetarse en todos los videos de **AsTrade** para transmitir máxima credibilidad profesional e institucional ante traders y evaluadores de Prop Firms.

---

## 1. Horarios de Sesión Coherentes

| Sesión | Horario Recomendado | Notas |
| :--- | :--- | :--- |
| **New York** | `09:30 AM` (o `10:00 AM`) | Campana de apertura de Wall Street y volatilidad institucional. **Prohibido colocar horas nocturnas o de madrugada (ej. 02:46 AM).** |
| **London** | `08:00 AM` (o `09:00 AM` GMT) | Apertura europea. |
| **Asia / Tokyo** | `08:00 PM` (o `09:00 PM` EST) | Apertura asiática. |

---

## 2. Tipos de Orden y Dirección de Tendencia

- **Sincronización DOM-Audio**: Si la locución anuncia *"Tomamos una operación a mercado Market Buy"*:
  - Selector `#inputOrden`: debe seleccionarse explícitamente `'Market Buy'`.
  - Selector `#inputTendencia`: debe seleccionarse explícitamente `'Favor'` (A favor de tendencia).
  - Nunca dejar selectores en blanco o con valores desincronizados como *Buy Limit*.

---

## 3. Parámetros de Riesgo y Lotaje Institucional Limpio

> [!CAUTION]
> **Prohibición de Cifras con Carga Popular o Supersticiosa:**
> Nunca presentar en pantalla lotajes o saldos que contengan números asociados al mal o a la mala fortuna (como **6.66** o **13**). Todos los ejemplos deben reflejar números limpios, redondos y profesionales.

### Modelo Matemático Estándar (Cuenta de Evaluación 100K / EURUSD):
- **Balance de Cuenta**: $100,000 USD
- **Riesgo por Operación**: 1.0% ($1,000 USD)
- **Stop Loss (SL)**: 20 pips
- **Take Profit (TP)**: 60 pips
- **Ratio R:R**: 1:3.00 exacto
- **Valor del Pip (EURUSD)**: $10 USD por lote estándar

$$\text{Lotaje Calculado} = \frac{\text{Riesgo en Dólares}}{\text{Pips SL} \times \text{Valor Pip}} = \frac{\$1,000}{20 \times \$10} = \mathbf{5.00\text{ lotes}}$$

$$\text{Ganancia al Cierre (Full TP)} = 60\text{ pips} \times 5.00\text{ lotes} \times \$10/\text{pip} = \mathbf{+\$3,000\text{ USD (+3.00\%)}}$$

$$\text{Nuevo Balance} = \$100,000 + \$3,000 = \mathbf{\$103,000.00\text{ USD}}$$

---

## 4. Proyección Dinámica de Balance en AsTrade

Para evitar el error común donde la gráfica de capital dibuja un arqueo descendente hacia el balance inicial (*parábola invertida con "Balance efectivo"*):

1. **`balanceActual: null` en la Inicialización**:
   ```javascript
   const account = {
       id: 1731800000000,
       name: "Fondeo 100K Challenge",
       balance: 100000,
       balanceActual: null, // Permite que AsTrade sume automáticamente el +3% de los trades
       stage: "prueba",
       // ...
   };
   ```
2. **Resultado Post-Trade en Dashboard**:
   - Curva de capital (`#equityChart`): Sube con pendiente limpia de $100,000 a **$103,000 USD**.
   - Tarjeta KPI Retorno Total (`#kpi-return`): Muestra **+3.00%** en verde esmeralda.
   - Input Balance Actual (`#dashboardBalanceActual`): Refleja **103000**.
   - Pestaña Metas (`#tab-btn-goals`): Muestra **37.5% de Profit Target** ($3,000 / $8,000 USD) y **Drawdown Máximo 100% Intacto** ($10,000 USD de colchón).

---

## 5. Política Estricta de Marca Blanca (Zero Marcas de Terceros)

- **Prohibición Total:** Nunca hacer referencia a marcas registradas de Prop Firms comerciales (FTMO, FundedNext, MyForexFunds, etc.) en locución, textos en pantalla, carátulas, metadatos, tags o nombres de cuentas.
- **Terminología Institucional Obligatoria:**
  - *"Cuenta de Evaluación"* / *"Fase de Challenge"*
  - *"Reglas de Evaluación"* / *"Límites de Drawdown y Target"*
  - *"Firma de Fondeo"* / *"Prop Firms"* (en sentido genérico de industria).

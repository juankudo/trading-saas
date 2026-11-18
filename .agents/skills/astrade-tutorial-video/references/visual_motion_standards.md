# 👁️ Estándares Visuales y Motion Graphics (Zero-Blur Standard)

Esta guía define las reglas de interacción visual, captura y animación en pantalla para que los videos tutoriales de **AsTrade** tengan calidad televisiva e institucional.

---

## 1. Estándar Zero-Blur Global (Cero Desenfoques)

> [!IMPORTANT]
> **Prohibición Total de Desenfoques de Fondo (Blur):**
> Nunca aplicar filtros CSS como `backdrop-filter: blur(...)`, ni velos negros opacos (`rgba(0,0,0,0.85)`) sobre la aplicación. 
> Toda la interfaz de AsTrade (gráficas, tablas, métricas y menús) debe permanecer **100% nítida y legible a 1080p** en todo momento.

Para destacar elementos sin desenfocar el entorno, se utilizan **indicadores vectoriales de alto contraste**:
1. **Anillos de Pulso Esmeralda** (`__pulseRingAround`): Un contorno verde (#10b981) animado con respiración suave que delimita el elemento activo.
2. **Callout Badges Flotantes** (`__showCalloutBadge`): Tarjetas con bordes brillantes, ícono temático, título institucional y descripción concisa.
3. **Lower Thirds de Fase** (`__showLowerThird`): Barra inferior con número de paso, kicker y resumen de la acción en curso.

---

## 2. API de Motion Engine (`motion_engine.js`)

Inyectada en `app.html` antes de iniciar la filmación:

```javascript
// Desplazamiento orgánico del cursor hacia un elemento
window.__glideCursorToElement(selector, durationMs);

// Efecto de clic visual con anillo expansivo
window.__clickRipple();

// Anillo de pulso focal sobre el elemento
window.__pulseRingAround(selector, padding);
window.__removePulseRing();

// Tarjeta flotante explicativa (top, bottom, left, right)
window.__showCalloutBadge(selector, icon, kicker, title, desc, position);
window.__hideCalloutBadge();

// Lower third informativo
window.__showLowerThird(icon, kicker, title);
window.__hideLowerThird();
```

---

## 3. Prevención de Fotogramas Vacíos y Parpadeos

1. **Pre-inicialización Obligatoria de Datos**:
   Antes de iniciar la grabación del flujo en `app.html`, asegurar que los datos estén en memoria y en IndexedDB:
   ```javascript
   await dbSet('trading_journal_real_accounts', [account]);
   await dbSet('trading_journal_data', trades);
   realAccounts.length = 0;
   realAccounts.push(account);
   await loadDataForMode();
   renderGroups(); // Asegura que las tarjetas de cuenta estén visibles desde t = 0
   ```
2. **Estabilización de Contenedores Modales**:
   Para evitar que los modales salten verticalmente al conmutar selectores (como Real vs. Challenge):
   - Anclar el modal con alineación superior (`align-items: flex-start; padding-top: 50px`).
   - Fijar una altura mínima (`min-height: 520px`).
   - Permitir 100-200ms de asentamiento DOM antes de calcular la posición del cursor (`getBoundingClientRect`).

---

## 4. Demostración de Menús y Acciones

Siempre que se presente una funcionalidad recién creada:
- Desplegar el menú de tres puntos o acciones adicionales (`[data-account-action="menu-toggle"]`).
- Resaltar secuencialmente las opciones críticas (ej. *"Editar"* para ajustar saldos/reglas y *"Borrar"* para eliminación segura) antes de cerrar o transicionar.
- Guiar el cursor directamente al elemento de destino sin teletransportaciones instantáneas.

# Reglas y Restricciones del Proyecto — Trading Journal Pro

## 🛡️ Control Estricto de Despliegue y Git

1. **Prohibido desplegar a producción sin autorización explícita:**
   - **NUNCA** ejecutes `git push` o `git push origin main` de forma autónoma.
   - Todo cambio realizado en el código debe permanecer localmente (o en commit local) para que el usuario pueda probarlo y verificarlo visualmente primero.

2. **Flujo de Aprobación Obligatorio:**
   - Realizar la modificación en los archivos locales.
   - Explicar al usuario con precisión qué se cambió y cómo probarlo localmente.
   - Preguntar explícitamente: *¿Deseas que suba y despliegue estos cambios a producción?*
   - Solo ejecutar `git push` tras recibir la confirmación afirmativa del usuario.

3. **Registro Obligatorio de Versiones (Changelog):**
   - Mantener siempre actualizado el archivo `CHANGELOG.md` con cada versión, ajuste o mejora relevante antes de desplegar a producción.
   - Documentar claramente qué se añadió, corrigió o mejoró en formato estándar (Keep a Changelog).

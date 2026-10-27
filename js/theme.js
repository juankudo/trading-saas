// Aplica el tema guardado antes de pintar la página (evita parpadeo)
if (localStorage.getItem('journalTheme') === 'light') {
    document.documentElement.classList.add('light');
}

/**
 * Función global para alternar entre tema claro y oscuro
 */
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem('journalTheme', isLight ? 'light' : 'dark');
    updateThemeIcons(isLight);
    
    // Si existen gráficos de Chart.js activos en la vista (en app.html), actualizarlos
    if (typeof getChartThemeColors === 'function') {
        try {
            const colors = getChartThemeColors();
            if (typeof equityChartInstance !== 'undefined' && equityChartInstance) {
                const scales = equityChartInstance.options.scales;
                if (scales && scales.y && scales.x) {
                    scales.y.ticks.color = colors.tick;
                    scales.y.grid.color = colors.grid;
                    scales.x.ticks.color = colors.tick;
                    equityChartInstance.update();
                }
            }
            if (typeof outcomesChartInstance !== 'undefined' && outcomesChartInstance) {
                if (outcomesChartInstance.options && outcomesChartInstance.options.plugins) {
                    outcomesChartInstance.options.plugins.legend.labels.color = colors.tick;
                    outcomesChartInstance.update();
                }
            }
        } catch (e) { }
    }
}

/**
 * Actualiza los iconos de sol / luna según el tema activo
 */
function updateThemeIcons(isLight) {
    document.querySelectorAll('.theme-icon-moon, .theme-icon-sun, #theme-icon').forEach(icon => {
        if (icon.id === 'theme-icon') {
            icon.className = isLight ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-indigo-400';
        }
    });
}

// Sincronizar iconos cuando el DOM esté listo
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const isLight = document.documentElement.classList.contains('light');
        updateThemeIcons(isLight);
    });
}

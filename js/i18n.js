/**







 * ==============================================================================







 * Módulo de Internacionalización (i18n) — Trading Journal Pro SaaS







 * Soporte Bilingüe Nativo: Español (ES) e Inglés (EN)







 * ==============================================================================







 */















(function () {







    const STORAGE_KEY = 'astrade_lang';
    function getStoredLang() {
        try {
            return localStorage.getItem('astrade_lang') || localStorage.getItem('app_lang');
        } catch(e) {
            return null;
        }
    }















    const MONTHS = {







        es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],







        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]







    };















    const MONTHS_SHORT = {







        es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],







        en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]







    };















    const DAYS_SHORT = {







        es: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],







        en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]







    };















    const DICTIONARY = {







        es: {







            // General / Comunes







            "app.title": "Bitácora de Trading Pro",







            "lang.es": "ES",







            "lang.en": "EN",







            "lang.toggle_title": "Cambiar idioma (Español / English)",







            "common.loading": "Cargando...",







            "common.save": "Guardar",







            "common.cancel": "Cancelar",







            "common.close": "Cerrar",







            "common.delete": "Eliminar",







            "common.edit": "Editar",







            "common.view": "Ver",







            "common.all": "Todas",







            "common.yes": "Sí",







            "common.no": "No",







            "common.actions": "Acciones",







            "common.status": "Estado",







            "common.date": "Fecha",







            "common.time": "Hora",







            "common.pair": "Activo / Par",







            "common.order": "Orden",







            "common.pips": "Pips",







            "common.notes": "Notas",







            "common.screenshots": "Capturas",







            "common.result": "Resultado",















            // Días de la semana







            "day.monday": "Lunes",







            "day.tuesday": "Martes",







            "day.wednesday": "Miércoles",







            "day.thursday": "Jueves",







            "day.friday": "Viernes",







            "day.saturday": "Sábado",







            "day.sunday": "Domingo",















            // Topbar & Announcement







            "topbar.badge": "NUEVO",







            "topbar.text": "Comienza tus 7 días de prueba gratis. Cancela en cualquier momento con 1 clic.",







            "topbar.cta": "Crear cuenta gratis →",















            // Navbar & Modos







            "nav.features": "Características",







            "nav.backtesting": "Backtesting Pro",







            "nav.calculator": "Calculadora Pro",







            "nav.funding": "Cuentas Fondeo",







            "nav.pricing": "Precios",







            "nav.faq": "Preguntas",







            "nav.login": "Iniciar Sesión",







            "nav.trial_btn": "7 Días Gratis",







            "nav.my_journal": "Mi Bitácora",







            "nav.logout": "Cerrar sesión",







            "nav.mode_real": "Cuenta Real",







            "nav.mode_backtesting": "Backtesting",







            "nav.mode_real_title": "Cuentas Reales",







            "nav.mode_backtesting_title": "Backtest Sessions",







            "nav.pro_dashboard": "PRO DASHBOARD",







            "nav.user_connected": "Usuario conectado",







            "nav.trial_active": "Prueba Activa",







            "nav.trial_days": "Prueba 7 días",







            "btn.new_account": "Nueva Cuenta",







            "btn.new_session": "Nueva Sesión",















            // Toolbar Fila 2







            "toolbar.theme_toggle": "Cambiar entre tema claro y oscuro",
        "theme.toggle_title": "Cambiar tema",
        "metrics.title": "Métricas",







            "toolbar.backup_folder": "Carpeta JSON",







            "toolbar.export": "Exportar",







            "toolbar.export_json": "Respaldar (JSON)",







            "toolbar.export_csv": "Data Excel (CSV)",







            "toolbar.import": "Importar",







            "toolbar.guide": "Guía",







            "toolbar.tour_general": "Tour General",







            "toolbar.tour_general_desc": "Recorrido por las pestañas del dashboard",







            "toolbar.trade_lifecycle": "Entrada y Post-Análisis",







            "toolbar.trade_lifecycle_desc": "Cómo registrar la entrada y editar al salir",







            "toolbar.video_tutorials": "Tutoriales en Video",







            "toolbar.video_tutorials_desc": "Canal oficial de YouTube (@tradingjournalpro)",







            "toolbar.calculator": "Calculadora",







            "toolbar.reset_env": "Reiniciar Entorno",







            "toolbar.sync_status": "Sincronizado",







            "toolbar.subscription": "Suscripción",















            // Pestañas Principales (App)







            "tabs.accounts": "Tus Cuentas",







            "tabs.sessions": "Tus Sesiones",







            "tabs.balance_history": "Seguimiento de balances",







            "tabs.dashboard": "Dashboard & Métricas",







            "tabs.goals": "Metas",







            "tabs.journal": "Registro de Trades",







            "tabs.monthly": "Rendimiento por mes",







            "tabs.calendar": "Calendario Diario",







            "tabs.gallery": "Galería & Análisis",







            "tabs.new_trade": "Nueva Entrada",







            "tabs.global_trade": "Entrada múltiple",







            "tabs.global_metrics": "Métricas globales",







            "btn.edit_last_multi": "Editar última entrada múltiple",







            "btn.account_groups": "Grupos",







            "btn.edit_group": "Editar grupo",







            "btn.load_balances": "Cargar balances",







            "btn.view_balances": "Ver balances",















            // Métricas y Tarjetas Dashboard







            "metrics.initial_balance": "Bal. Inicial:",







            "metrics.actual_balance": "Actual (Opcional):",







            "metrics.filter_period": "Filtro Periodo:",







            "metrics.period_all": "Todas (Histórico Completo)",







            "metrics.period_year": "Por Año",







            "metrics.period_month": "Por Mes",







            "metrics.period_week": "Por Semana",







            "metrics.period_custom": "Personalizado",







            "metrics.total_return": "RETORNO TOTAL",







            "metrics.win_rate": "EFECTIVIDAD GLOBAL",







            "metrics.max_drawdown": "MAX DRAWDOWN",







            "metrics.best_worst_trade": "MEJOR / PEOR TRADE",







            "metrics.best": "Mejor:",







            "metrics.worst": "Peor:",







            "metrics.account_growth": "Evolución de la Cuenta ($)",







            "metrics.accumulated_return": "Retorno acumulado (%)",







            "metrics.goals_distribution": "Objetivos & Distribución",







            "metrics.operations": "Operaciones",







            "metrics.profit_factor": "Profit factor",







            "metrics.avg_rr": "R:R medio",







            "metrics.distribution": "Distribución",







            "metrics.wins": "Ganadas",







            "metrics.be": "BE",







            "metrics.losses": "Perdidas",







            "metrics.trades_count": "Operaciones",







            "metrics.win_loss_be": "Ganadas / Perdidas / BE",







            "metrics.effectiveness_by_session": "Efectividad por Sesión",







            "metrics.effectiveness_by_bias": "Efectividad por Sesgo",







            "metrics.effectiveness_by_pair": "Efectividad por Par",







            "metrics.trades_by_day": "Trades por Día de la Semana",















            // Reglas de Simulación de Fondeo (Backtesting & Metas)







            "funding.title": "Simulación de fondeo",







            "funding.phase": "Fase",







            "funding.phase_balance": "BALANCE DE LA FASE",







            "funding.profit_target": "OBJETIVO DE BENEFICIO",







            "funding.daily_drawdown": "DRAWDOWN DIARIO",







            "funding.max_drawdown": "DRAWDOWN MÁXIMO (ESTÁTICO)",







            "funding.trading_days": "DÍAS DE TRADING",







            "funding.profitable_days": "DÍAS RENTABLES",







            "funding.phase_progress": "PROGRESO DE FASES",







            "funding.no_phase_passed": "Aún no superaste ninguna fase.",







            "funding.daily_limit": "Límite diario",







            "funding.max_limit": "Límite de balance",







            "funding.remaining": "Faltan",







            "funding.days_min": "días mín.",







            "prop.phase_balance": "Balance de la fase",







            "prop.profit_target": "Objetivo de beneficio",







            "prop.withdrawable_profit": "Beneficio retirable",







            "prop.daily_drawdown": "Drawdown diario",







            "prop.max_drawdown": "Drawdown máximo",







            "prop.trading_days": "Días de trading",







            "prop.profitable_days": "Días rentables",







            "prop.burned_account": "Cuenta quemada",







            "prop.funded": "Fondeada",







            "prop.last_traded_day": "Último día operado",







            "prop.no_trades_phase": "Sin operaciones en esta fase",







            "prop.target_amount": "de",







            "prop.remaining_days": "Faltan",















            // Calendarios







            "calendar.period": "Periodo",







            "calendar.month": "Mes",







            "calendar.year": "Año",







            "calendar.prev": "< Ant.",







            "calendar.next": "Sig. >",







            "calendar.weeks": "Semanas",







            "calendar.week": "Semana",







            "calendar.today": "Hoy",







            "calendar.no_trades_month": "Sin operaciones en este mes",







            "calendar.return": "Retorno",







            "calendar.ops": "ops",







            "calendar.best_day": "Mejor día",







            "calendar.best_trade": "Mejor trade",







            "calendar.no_trades": "Sin operaciones",







            "calendar.month_be": "Mes BE",















            // Tabla de Trades







            "table.title": "Historial de Operaciones",







            "table.filters": "Filtros:",







            "table.filter_all_time": "Todo el Tiempo",







            "table.filter_by_year": "Por Año",







            "table.filter_by_month": "Por Mes",







            "table.filter_by_week": "Por Semana",







            "table.filter_all_states": "Todos los Estados",







            "table.filter_all_sessions": "Todas las Sesiones",







            "table.filter_all_pairs": "Todos los Activos",







            "table.search_placeholder": "Buscar en notas o par...",







            "table.col_date_time": "Fecha / Hora",







            "table.col_date": "Fecha",







            "table.col_day": "Día",







            "table.col_pair": "Activo",







            "table.col_session": "Sesión",







            "table.col_trend": "Tendencia",







            "table.col_sl_tp": "Pips SL / TP",







            "table.col_order": "Tipo Orden",







            "table.col_rr": "Ratio RR",







            "table.col_risk": "Riesgo",







            "table.col_status": "Estado",







            "table.col_result": "Resultado (%)",







            "table.col_acum": "Acumulado",







            "table.col_balance": "Balance (P/L)",







            "table.col_view_gallery": "Ver Galería",







            "table.col_actions": "Acciones",







            "table.btn_new": "+ Registrar Trade",















            // Modal de Entrada de Trade







            "modal_trade.title_new": "Registrar Nueva Operación",







            "modal_trade.title_edit": "Editar Operación",







            "modal_trade.pair_label": "Activo / Par",







            "modal_trade.type_label": "Tipo de Orden",







            "modal_trade.date_label": "Fecha",







            "modal_trade.time_label": "Hora",







            "modal_trade.status_label": "Estado / Resultado",







            "modal_trade.status_win": "Ganada",







            "modal_trade.status_loss": "Perdida",







            "modal_trade.status_be": "Breakeven",







            "modal_trade.rr_label": "Ratio R:R",







            "modal_trade.risk_pct": "Riesgo (%)",







            "modal_trade.lot_label": "Lotaje Utilizado",







            "modal_trade.partial_result": "Resultado Neto ($ / %)",







            "modal_trade.session_label": "Sesión Operativa",







            "modal_trade.session_asia": "Asia",







            "modal_trade.session_london": "Londres",







            "modal_trade.session_ny": "New York",







            "modal_trade.trend_label": "Tendencia / Sesgo",







            "modal_trade.notes_before": "Notas y Análisis Pre-Trade",







            "modal_trade.notes_after": "Conclusiones y Gestión Post-Trade",







            "modal_trade.screenshot_before": "Captura ANTES de la entrada",







            "modal_trade.screenshot_after": "Captura DESPUÉS del cierre",







            "modal_trade.btn_save": "Guardar Operación",















            // Landing Page (index.html)







            "hero.badge": "Bitácora Pro en la Nube · Backtesting Pro & Simulador de Fondeo",







            "hero.title": "Domina tu operativa con una bitácora profesional en la nube",







            "hero.subtitle": "Métricas de precisión quirúrgica, laboratorio de Backtesting Pro avanzado, control estricto de drawdown diario para prop firms y calculadora de lotaje avanzada.",







            "hero.cta_start": "Comenzar 7 Días Gratis",







            "hero.cta_explore": "Explorar Backtesting Pro",







            "hero.trust_trial": "7 días gratis ($0 hoy)",







            "hero.trust_lab": "Laboratorio Backtesting Pro",







            "hero.trust_payments": "Tarjetas (Global/Latam) y USDT (NOWPayments)",















            // Showcase Demo Landing







            "showcase.tab1": "1. Dashboard & Métricas",







            "showcase.tab2": "2. Registro de Trades",







            "showcase.tab3": "3. Rendimiento Mensual",







            "showcase.tab4": "4. Auditoría de Fondeo",







            "showcase.phase1": "1. A Ciegas - Caos",







            "showcase.phase2": "2. 15 Trades - Filtros",







            "showcase.phase3": "3. Bitácora Pro - Consistencia",







            "showcase.simulate_trade": "Simular Trade (+1.8%)",







            "showcase.auto_btn": "Auto",







            "showcase.current_balance": "Balance Actual",







            "showcase.return_badge": "+4.85% Retorno",







            "showcase.profit_factor_label": "Profit Factor",







            "showcase.win_rate_label": "Win Rate: 68.4%",







            "showcase.drawdown_max_label": "Drawdown Máx",







            "showcase.drawdown_limit": "Límite: -5.0%",







            "showcase.avg_rr_label": "Ratio R:R Medio",







            "showcase.expected_value": "Esperanza Positiva",







            "showcase.growth_curve": "Curva de Crecimiento de Capital",







            "showcase.net_profit_badge": "+$4,850.00 Ganancia Neta",







            "showcase.goal_reached_badge": "Meta Fase 1: 48.5% alcanzado",















            // Pricing Landing







            "pricing.badge": "Precios Simples y Transparentes",







            "pricing.title": "Un Solo Plan con Todo Desbloqueado",







            "pricing.subtitle": "Sin límites artificiales ni características bloqueadas. Elige tu período y ahorra hasta un 30%. Todos los planes incluyen 7 días de prueba gratis ($0 hoy).",







            "pricing.tab_1month": "Mensual",







            "pricing.tab_3months": "Trimestral",







            "pricing.tab_12months": "Anual",







            "pricing.plan_badge": "MEMBRESÍA PRO ILIMITADA",







            "pricing.per_month": "/ mes",







            "pricing.billed_monthly": "Facturado mensualmente",







            "pricing.billed_quarterly": "Facturado $48 cada 3 meses",







            "pricing.billed_annually": "Facturado $156 al año",







            "pricing.f1": "Cuentas Reales y de Fondeo Ilimitadas",







            "pricing.f2": "Laboratorio de Backtesting Pro con auditoría de fondeo",







            "pricing.f3": "Registro y auditoría de trades sin restricciones",







            "pricing.f4": "Control de Drawdown y Reglas de Prop Firms",







            "pricing.f5": "Calculadora de Lotaje Pro completa",







            "pricing.f6": "Calendario interactivo y curva de equidad",







            "pricing.f7": "Almacenamiento ilimitado de capturas de pantalla",







            "pricing.f8": "Sincronización en la nube con Supabase",







            "pricing.cta": "Comenzar 7 Días",







            "pricing.guarantee_trial": "$0 hoy · Cancela cuando quieras",







            "pricing.badge_popular": "⭐ Más Elegido · -15%",







            "pricing.badge_best_value": "🚀 Mejor Valor · -30%",















            // FAQ Landing







            "faq.subtitle": "Resolviendo Dudas",







            "faq.title": "Preguntas Frecuentes",















            // Footer Landing







            "footer.tagline": "· Suite de Analítica en la Nube",







            "footer.community_title": "Canales y Comunidad Oficial:",







            "footer.terms": "Términos de Servicio",







            "footer.privacy": "Política de Privacidad",







            "footer.refund": "Política de Reembolso & Cancelación",







            "footer.disclaimer": "Aviso de Riesgo Financiero",







            "footer.contact": "Contacto:",







            "footer.risk_note_bold": "Descargo de Responsabilidad Financiera:",















            // Chips de Fondeo







            "chip.phase_singular": "fase",







            "chip.phase_plural": "fases",







            "chip.target_f1": "Objetivo F1",







            "chip.daily_dd": "DD diario",







            "chip.no_daily_dd": "Sin DD diario",







            "chip.monthly_dd": "DD mensual",







            "chip.max_dd": "DD max.",







            "chip.no_max_dd": "Sin DD maximo",







            "chip.static": "estatico",







            "chip.risk_per_trade": "Riesgo/trade",







            "chip.min_days": "Min.",







            "chip.days": "dias",







            "chip.min_profit_days": "Min.",







            "chip.profitable_days": "dias rentables",







            "chip.consistency": "Consistencia",







            // Fondeo Panel Extra







            "funding.margin": "Margen",







            "funding.req_met": "Requisito cumplido",







            "funding.best_day_label": "Mejor dia",







            "funding.max_allowed": "maximo permitido",







            "funding.of_profit": "del beneficio",







            "funding.in_this_attempt": "en este intento",







            "funding.phase_passed": "superada",







            "prop.monthly_drawdown": "Drawdown mensual",







            "prop.your_split": "Tu parte",







            // Monthly Performance Extra







            "metrics.win_rate_short": "Efectividad",







            "metrics.goals_reached": "Objetivos alcanzados",







            "monthly.best_session": "Mejor sesion",







            "monthly.effectiveness_short": "efect.",







            "monthly.closed_trades": "operaciones cerradas",







            // Gallery







            "gallery.title": "Bitacora Visual & Analisis Tecnico",







            "gallery.click_hint": "Haz clic en cualquier imagen para verla en pantalla completa",







            // Balance History







            "balance.title": "Seguimiento de balances reales",







            "balance.description": "Cada registro guarda una captura de los balances y su variacion frente al balance inicial.",







            // Banner







            "banner.readonly": "Tu prueba de 7 dias ha finalizado. Tu cuenta esta en Modo Solo Lectura. Tus datos estan a salvo.",







            "banner.renew": "Renovar Acceso Pro",







            // Calendar nav short







            "calendar.prev_short": "Ant.",







            "calendar.next_short": "Sig.",







            // Misc







            "btn.new_group": "Nuevo grupo",















            // Modal Sesión / Cuenta







            "modal_session.title_new_real": "Crear Nueva Cuenta",







            "modal_session.title_new_bt": "Crear Sesión de Backtest",







            "modal_session.title_edit_real": "Editar Cuenta",







            "modal_session.title_edit_bt": "Editar Sesión",







            "modal_session.name": "Nombre (Identificador)",







            "modal_session.pair": "Activo / Par de la sesión",







            "modal_session.pair_hint": "Este activo queda fijo para todas las operaciones de la sesión.",







            "modal_session.start_date": "Fecha de inicio",







            "modal_session.initial_balance": "Balance Inicial ($)",







            "modal_session.actual_balance": "Balance Actual / Cierre (Opcional)",







            "modal_session.account_type": "Tipo de cuenta",







            "modal_session.type_real": "Cuenta real (capital propio)",







            "modal_session.type_challenge": "Fase de prueba (Challenge)",







            "modal_session.type_funded": "Fondeada",







            "modal_session.type_instant": "Instant (fondeo directo)",







            "modal_session.session_type": "Tipo de sesión",







            "modal_session.free_trading": "Trading libre",







            "modal_session.funding_sim": "Simulación de fondeo",







            "modal_session.rules_title": "Reglas del desafío",







            "modal_session.phases": "Fases",







            "modal_session.phase_1": "1 fase",







            "modal_session.phase_2": "2 fases",







            "modal_session.profit_split": "Profit split fondeada (%)",







            "modal_session.target_f1": "Objetivo Fase 1 (%)",







            "modal_session.target_f2": "Objetivo Fase 2 (%)",







            "modal_session.daily_dd": "Drawdown diario (%)",







            "modal_session.monthly_dd": "Drawdown mensual (%)",







            "modal_session.max_dd": "Drawdown máximo (%)",







            "modal_session.risk_per_trade": "Límite de riesgo por trade (%)",







            "modal_session.dd_type": "Tipo de drawdown máx.",







            "modal_session.dd_static": "Estático",







            "modal_session.dd_trailing": "Trailing",







            "modal_session.min_trading_days": "Días mínimos de trading",







            "modal_session.min_profitable_days": "Días mínimos rentables",







            "modal_session.consistency_rule": "Regla de consistencia",







            "modal_session.consistency_hint": "el mejor día ≤",







            "modal_session.consistency_sub": "% del beneficio",







            "modal_session.btn_create": "Crear",







            "modal_session.btn_save": "Guardar Cambios",















            // Modal Trade extra







            "modal_trade.pips_sl": "Pips SL",







            "modal_trade.pips_tp": "Pips TP",







            "modal_trade.lot_calc": "Lotaje estimado (auto)",







            "modal_trade.lot_help": "Estimado; el valor del pip puede variar según el broker.",







            "modal_trade.upload_before": "Subir Captura(s) Antes",







            "modal_trade.upload_after": "Subir Captura(s) Después",







            "modal_trade.link_before": "Link (Antes)",







            "modal_trade.link_after": "Link (Después)",







            "modal_trade.ctrl_v": "(o pega con Ctrl+V)",







            "modal_trade.guide_badge": "Guía Antes / Después",















            // Modal Reset







            "modal_reset.title": "Reiniciar Entorno",







            "modal_reset.desc": "Estás a punto de borrar todos los datos del entorno actual. Se recomienda exportar un respaldo en formato JSON antes de proceder.",







            "modal_reset.backup_and_reset": "Respaldar (JSON) y Reiniciar",







            "modal_reset.delete_all": "Borrar Todo y Empezar de 0",















            // Modal Pair Manager







            "modal_pair.title": "Gestionar Pares",















            // Modal Balance







            "modal_balance.title": "Cargar balances reales",







            "modal_balance.hint": "Actualiza aquí el balance actual de cada cuenta. Al guardar, se actualizarán las cuentas y se registrará una captura histórica.",







            "modal_balance.date": "Fecha del registro",







            "modal_balance.apply_current": "Aplicar también estos balances al Balance Actual de las cuentas",







            "modal_balance.save_and_log": "Guardar y registrar",















            // Modal Withdrawal







            "modal_withdrawal.title": "Registrar retiro",







            "modal_withdrawal.amount": "Monto ($)",







            "modal_withdrawal.date": "Fecha del retiro",







            "modal_withdrawal.btn_save": "Guardar retiro",















            // Modal Account Group







            "modal_group.title_new": "Nuevo grupo de cuentas",







            "modal_group.title_edit": "Editar grupo de cuentas",







            "modal_group.name": "Nombre del grupo",







            "modal_group.icon": "Icono",







            "modal_group.select_accounts": "Seleccionar cuentas",















            // Account Stages







            "stage.real": "Cuenta real",







            "stage.challenge": "Fase de prueba",







            "stage.funded": "Fondeada",







            "stage.instant": "Instant",















            // Account Cards







            "card.account_settings": "Ajustes de cuenta",







            "card.session_settings": "Ajustes de sesión",







            "card.start": "Inicio",







            "card.effective_bal": "Bal. efectivo",







            "card.stage": "Etapa",







            "card.start_btn": "Empezar",







            "card.new_entry": "Nueva entrada",







            "card.metrics": "Métricas",







            "card.accounts_count": "cuentas",







            "card.account_count_single": "cuenta",







            "card.view_accounts": "Ver cuentas",







            "card.no_assigned_accounts": "Sin cuentas asignadas",















            // Goals Panel







            "goals.configure": "Configurar meta",







            "goals.log_withdrawal": "Registrar retiro",







            "goals.advance_phase2": "Pasar a fase 2",







            "goals.advance_funded": "Convertir a Fondeada",







            "goals.reached": "¡Alcanzado!",







            "goals.met": "¡Cumplida!",







            "goals.personal_goal": "Meta personal",







            "goals.your_share": "Tu parte retirable",







            "goals.next_withdrawal": "Próximo retiro",







            "goals.ready_to_withdraw": "Listo para retirar",







            "goals.total_withdrawn": "Total retirado",







            "goals.registered_withdrawals": "Retiros registrados",







            "goals.withdrawable": "Retirable",















            // Daily Analysis Modal







            "daily.analysis_before": "Análisis ANTES de la entrada",







            "daily.no_notes_before": "Sin notas registradas antes de entrar.",







            "daily.analysis_after": "Análisis DESPUÉS del cierre",







            "daily.no_notes_after": "Sin notas registradas después del cierre.",







            "daily.total_day": "Total del día",







            "daily.operations_recorded": "Operaciones registradas",















            // Gallery







            "gallery.open_chart": "Abrir gráfico",







            "gallery.open_chart_tv": "Abrir gráfico en TradingView",







            "gallery.edit_comment": "Editar comentario",







            "gallery.add_comment": "Añadir comentario",







            "gallery.no_comment": "Sin comentario todavía.",







            "gallery.write_comment": "Escribe tu comentario...",







            "gallery.no_trades": "Aún no hay operaciones registradas con análisis.",















            // Metrics extra







            "metrics.no_trades_period": "Sin operaciones en este periodo",







            "metrics.fixed_session_pair": "Activo fijo de la sesión",







            "metrics.bt_pair": "Par de backtesting",







            "footer.risk_note": "Trading Journal Pro es una plataforma tecnológica de software y registro de datos analíticos para la gestión personal de operativa. No provee asesoramiento financiero, gestión de fondos, señales de trading ni recomendaciones de inversión. El trading de activos financieros, Forex, futuros y cuentas de empresas de fondeo (prop firms) conlleva un riesgo sustancial de pérdida de capital y no es adecuado para todos los inversores. Todos los derechos reservados © 2026 Trading Journal Pro.",















            // ==========================================







            // CALCULADORA DE LOTAJE PRO (calc.*)







            // ==========================================







            "calc.back_to_journal": "Volver a Bitácora",







            "calc.title": "Calculadora",







            "calc.lot_calculator": "Lot Calculator",







            "calc.pro": "Pro",







            "calc.rates_loading": "Cargando tasas de cambio...",







            "calc.rates_live": "API conectada: Cálculo cruzado 100% exacto",







            "calc.rates_offline": "Sin conexión - Tasas cruzadas 1:1",







            "calc.instrument": "Instrumento",







            "calc.account_currency": "Moneda Cuenta",







            "calc.balance": "Balance",







            "calc.risk_pct": "Riesgo (%)",







            "calc.stop_loss": "Stop Loss",







            "calc.suggested_lot": "Lotaje Sugerido",







            "calc.risk_at_risk": "en riesgo",







            "calc.copy_lot": "Copiar Lotaje",







            "calc.save_setup": "Guardar Setup",







            "calc.quick_title": "Cálculo Rápido de Setups",







            "calc.quick_desc": "Ingresa los pips y selecciona los setups para calcular",







            "calc.select_all": "Seleccionar Todos",







            "calc.select_none": "Ninguno",







            "calc.clear_copied": "Limpiar Copiados",







            "calc.toggle_hide": "Ocultar calculadora",







            "calc.toggle_show": "Mostrar calculadora",







            "calc.save_modal_title": "Guardar Setup",







            "calc.setup_name": "Nombre del Setup",







            "calc.setup_name_ph": "Ej: Mi Fondeo 100k",







            "calc.group": "Grupo",







            "calc.group_ph": "Ej: Cuentas FTMO",







            "calc.gold_modal_title": "Pips en XAUUSD",







            "calc.gold_modal_desc": "La herramienta de medición del gráfico muestra el último valor 10 veces mayor. <b class=\"text-white\">Divídelo entre 10</b> antes de ingresarlo.",







            "calc.gold_tool_marks": "La herramienta marca",







            "calc.gold_enter_calc": "Ingresa en la calculadora",







            "calc.gold_dont_show": "No volver a mostrar este mensaje",







            "calc.understood": "Entendido",







            "calc.no_setups": "No hay setups guardados",







            "calc.define_balance_first": "Define balance y riesgo primero",







            "calc.name_setup_first": "Ponle un nombre al setup",







            "calc.copied": "Copiado!",







            "calc.copy_action": "COPIAR",







            "calc.points": "Puntos",







            "calc.forex_majors": "Forex Majors",







            "calc.forex_crosses": "Forex Crosses",







            "calc.metals": "Metales",







            "calc.indices": "Índices",







            "calc.crypto": "Crypto",







            "calc.gold": "XAUUSD (ORO)",







            "calc.silver": "XAGUSD (PLATA)",







            "calc.dow": "US30 (DOW JONES)",







            "calc.nasdaq": "NAS100 (NASDAQ)",







            "calc.dax": "GER40 (DAX)",







            "calc.bitcoin": "BTCUSD (BITCOIN)",







            "calc.ethereum": "ETHUSD (ETHEREUM)",















            // ==========================================







            // TOURS INTERACTIVOS (tour.*)







            // ==========================================







            "tour.step_counter": "Paso {0} de {1}",







            "tour.next": "Siguiente",







            "tour.prev": "Anterior",







            "tour.finish": "¡Comenzar!",







            "tour.skip": "Saltar",







            "tour.dont_show": "No volver a mostrar esta guía",







            "tour.step1_title": "Tus Cuentas y Metas de Fondeo",







            "tour.step1_desc": "Aquí administras tus cuentas reales o evaluaciones de fondeo. Puedes configurar reglas de consistencia, límites de pérdida diaria y metas automáticas de fase 1 y 2 con avance en un solo clic.",







            "tour.step2_title": "Registro Inteligente de Operaciones",







            "tour.step2_desc": "Al hacer clic aquí puedes registrar tus trades. La Bitácora calcula automáticamente el lotaje exacto según tu porcentaje de riesgo y te permite adjuntar capturas de pantalla antes y después del trade.",







            "tour.step3_title": "Estadísticas y Curva de Capital",







            "tour.step3_desc": "Analiza tu rendimiento con métricas clave en vivo: Win Rate, Profit Factor, Ratio Riesgo/Beneficio real y el gráfico interactivo de curva de balance y equidad.",







            "tour.step4_title": "Calendario y Consistencia Operativa",







            "tour.step4_desc": "Visualiza tus resultados día por día en un mapa de calor financiero. Identifica tus mejores jornadas y mantén el control de tu consistencia operativa mes a mes.",







            "tour.form_step_counter": "Formulario: {0} de {1}",







            "tour.form_step1_title": "1. Par y Cálculo de Lotaje",







            "tour.form_step1_desc": "Selecciona el par y define los pips de Stop Loss y Take Profit. La Bitácora calcula el ratio R/R y el lotaje exacto para tu riesgo asignado.",







            "tour.form_step2_title": "2. Captura y Análisis (ANTES)",







            "tour.form_step2_desc": "En este bloque documentas tu hipótesis técnica al entrar. Presiona Ctrl+V en la pantalla para pegar la captura del gráfico al instante.",







            "tour.form_step3_title": "3. Estado Inicial y Cierre",







            "tour.form_step3_desc": "Al crear la orden déjalo en 'Pendiente' o 'Activa'. Cuando la operación termine, cámbialo aquí a 'Full TP', 'SL', 'BE' o 'Parcial'.",







            "tour.form_step4_title": "4. Captura y Análisis (DESPUÉS)",







            "tour.form_step4_desc": "Al cerrar el trade, pulsa 'Editar' en la tabla de operaciones y completa aquí tus aprendizajes y la captura final del desarrollo.",















            // ==========================================







            // GUÍA DEL CICLO DEL TRADE (lifecycle.*)







            // ==========================================







            "lifecycle.header_title": "Ciclo de una Operación: Entrada y Post-Análisis",







            "lifecycle.header_subtitle": "Guía práctica paso a paso para documentar tus operaciones como un profesional",







            "lifecycle.tab1": "Entrada (Antes)",







            "lifecycle.tab2": "Durante el Trade",







            "lifecycle.tab3": "Cierre & Edición (Después)",







            "lifecycle.step1_badge": "Momento: Al momento de colocar o planificar la orden",







            "lifecycle.step1_badge_desc": "Registra la operación justo antes de entrar al mercado para tener documentada tu hipótesis técnica sin sesgos emocionales.",







            "lifecycle.step1_risk_title": "1. Datos de Gestión y Riesgo",







            "lifecycle.step1_risk_desc": "Ingresa el <strong>Par</strong>, los pips de <strong>Stop Loss</strong> y <strong>Take Profit</strong>, y tu <strong>Riesgo (%)</strong>. La Bitácora calcula al instante tu ratio <strong>R/R</strong> y el <strong>Lotaje exacto</strong> recomendado para no sobreapalancarte.",







            "lifecycle.step1_status_title": "2. Estado Inicial",







            "lifecycle.step1_status_desc": "Selecciona <span class=\"px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 font-semibold\">Pendiente</span> si es orden Limit/Stop pendiente de ejecución, o <span class=\"px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50 font-semibold\">Activa</span> si entraste por mercado.",







            "lifecycle.step1_analysis_title": "3. Captura y Análisis (ANTES)",







            "lifecycle.step1_analysis_desc": "En la caja izquierda <strong>\"Captura y Análisis (ANTES)\"</strong>:",







            "lifecycle.step1_analysis_li1": "<strong class=\"text-gray-200\">Notas Antes:</strong> Escribe tu tesis (tendencia mayor, soporte/resistencia, liquidez, confirmación de entrada).",







            "lifecycle.step1_analysis_li2": "<strong class=\"text-gray-200\">Captura:</strong> En TradingView pulsa <kbd class=\"px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[11px] text-gray-200\">Alt+S</kbd> (o copia imagen) y en la Bitácora presiona <kbd class=\"px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[11px] text-gray-200\">Ctrl+V</kbd> para pegarla al instante.",







            "lifecycle.step1_analysis_li3": "Guarda la operación con el botón <span class=\"font-bold text-emerald-400\">Guardar Operación</span>.",







            "lifecycle.step2_badge": "Momento: Mientras el trade está abierto en el mercado",







            "lifecycle.step2_badge_desc": "El trade queda almacenado y visible en tu pestaña de Operaciones sin afectar tus estadísticas finales hasta su cierre.",







            "lifecycle.step2_table_title": "Vista en la tabla de operaciones",







            "lifecycle.step2_table_desc": "En la pestaña <strong>Operaciones</strong>, tu trade se mostrará con un chip que indica su estado actual (<span class=\"text-amber-400 font-semibold\">Activa</span> o <span class=\"text-blue-400 font-semibold\">Pendiente</span>). La columna resultado se mantiene neutra hasta que el trade se concluya.",







            "lifecycle.step2_psych_title": "Disciplina Psicológica",







            "lifecycle.step2_psych_desc": "Tener la entrada registrada con su captura previa te permite alejarte de la pantalla y dejar correr tu plan sin micro-gestionar el gráfico por impulso o miedo.",







            "lifecycle.step3_badge": "Momento: Al cerrarse la operación (TP, SL o Salida Manual)",







            "lifecycle.step3_badge_desc": "Esta es la fase más valiosa para tu crecimiento: editar el trade para calificar el resultado y guardar el feedback final.",







            "lifecycle.step3_edit_title": "1. Ir a Operaciones y pulsar Editar",







            "lifecycle.step3_edit_desc": "Ve a la pestaña <strong>Operaciones</strong>, busca la fila del trade terminado y haz clic en el botón de edición <span class=\"px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 rounded font-semibold\"><i class=\"fa-solid fa-pen-to-square mr-1\"></i>Editar</span>. Se abrirá el formulario con todos los datos que ingresaste previamente.",







            "lifecycle.step3_status_title": "2. Actualizar el Estado Final",







            "lifecycle.step3_status_desc": "Cambia el desplegable <strong>Estado</strong> a:",







            "lifecycle.step3_status_tp": "<strong class=\"text-emerald-400\">Full TP:</strong> Ganada (suma el beneficio completo por R/R).",







            "lifecycle.step3_status_sl": "<strong class=\"text-red-400\">SL:</strong> Pérdida controlada (resta el riesgo asumido).",







            "lifecycle.step3_status_be": "<strong class=\"text-gray-400\">BE:</strong> Breakeven (0% de impacto).",







            "lifecycle.step3_status_partial": "<strong class=\"text-teal-400\">Parcial:</strong> Cobro parcial (indicas el % real obtenido).",







            "lifecycle.step3_status_manual": "<strong class=\"text-amber-400\">Cierre manual:</strong> Salida anticipada.",







            "lifecycle.step3_after_title": "3. Captura y Análisis (DESPUÉS)",







            "lifecycle.step3_after_desc": "En la caja derecha <strong>\"Captura y Análisis (DESPUÉS)\"</strong>:",







            "lifecycle.step3_after_li1": "<strong>Notas Después:</strong> ¿Qué aprendiste? ¿Respetaste tu plan? ¿Sentiste ansiedad?",







            "lifecycle.step3_after_li2": "<strong>Captura final:</strong> Pega con <kbd class=\"px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px]\">Ctrl+V</kbd> el gráfico mostrando cómo concluyó el precio.",







            "lifecycle.step3_footer_tip": "Al pulsar \"Guardar\", tu Win Rate, Profit Factor, Curva de Capital y el Calendario Mensual se actualizan automáticamente.",







            "lifecycle.btn_spotlight": "Ver en el Formulario (Spotlight)",







            "lifecycle.dont_show": "No volver a mostrar automáticamente",







            "lifecycle.btn_prev": "Anterior",







            "lifecycle.btn_next": "Siguiente",















            // ==========================================







            // CHECKOUT Y SUSCRIPCIÓN (checkout.*)







            // ==========================================







            "checkout.title": "Membresía Pro Ilimitada",







            "checkout.subtitle": "Desbloquea todas las funciones, cuentas ilimitadas y respaldo en la nube",







            "checkout.sandbox_active": "Modo Sandbox Activo",







            "checkout.month_1": "1 Mes",







            "checkout.month_3": "3 Meses",







            "checkout.month_12": "12 Meses",







            "checkout.badge_discount_15": "-15%",







            "checkout.badge_discount_30": "-30%",







            "checkout.period_month_label": "por 1 Mes",







            "checkout.period_quarter_label": "por 3 Meses",







            "checkout.period_year_label": "por 12 Meses",







            "checkout.trial_desc": "7 días de prueba ($0 cobrados hoy si es primera vez)",







            "checkout.pay_card": "Pagar con Tarjeta (Visa, Mastercard, Apple Pay)",







            "checkout.pay_crypto": "Pagar con Criptomonedas (USDT / Crypto)",







            "checkout.card_sandbox_title": "Simulación Lemon Squeezy Checkout (Sandbox)",







            "checkout.card_sandbox_desc": "Prueba el flujo de suscripción sin tarjeta real. La cuenta se actualizará a Pro de inmediato:",







            "checkout.sim_card": "Tarjeta simulada:",







            "checkout.plan_amount": "Monto del plan:",







            "checkout.sim_success_btn": "Simular Pago Exitoso",







            "checkout.crypto_invoice_title": "Transferencia USDT / USDC",







            "checkout.crypto_instruction": "Envía el monto exacto a una de nuestras billeteras oficiales:",







            "checkout.crypto_note": "Tras enviar tu transferencia, tu cuenta se activará automáticamente al confirmarse en la red. También puedes adjuntar el hash a soporte.",







            "checkout.crypto_sim_btn": "Simular Confirmación de Transferencia (TxHash OK)",







            "checkout.security_badge": "🔒 Pagos 100% seguros y encriptados. Cancela cuando quieras con un solo clic.",







            "checkout.test_tools": "Herramientas de Prueba:",







            "checkout.sim_expired": "Simular Prueba Vencida",







            "checkout.restore_trial": "Restablecer 7 Días",















            // ==========================================







            // CELEBRACIÓN Y MODALES DE ÉXITO (celebrate.*)







            // ==========================================







            "celebrate.sub_title": "¡Membresía Pro Activada!",







            "celebrate.sub_desc": "Tu cuenta ha sido actualizada con acceso total y sincronización continua en la nube.",







            "celebrate.plan_acquired": "Plan Adquirido:",







            "celebrate.valid_until": "Válido hasta:",







            "celebrate.active_no_limits": "Activo (Sin restricciones)",







            "celebrate.continue_btn": "Entendido, Continuar a mi Bitácora",















            // ==========================================







            // PUENTE METATRADER 5 (mt5.*)







            // ==========================================







            "mt5.modal_title": "Puente MetaTrader 5",







            "mt5.modal_desc": "Solo lectura: MT5 llena automáticamente par, tipo, entrada, SL/TP, lotaje, riesgo, RR y estado. Vos completás el análisis del trade y las capturas Antes. Nunca envía operaciones y funciona sin el puente activo.",







            "mt5.bridge_status": "Estado del Puente",







            "mt5.bridge_offline": "Desconectado",







            "mt5.bridge_online": "Conectado",







            "mt5.download_ea": "Descargar Asesor Experto (EA)",







            "mt5.copy_token": "Copiar Token",















            // ==========================================







            // PREGUNTAS FRECUENTES (faq.*)







            // ==========================================







            "faq.q1": "¿Cómo funciona la prueba gratuita de 7 días con tarjeta?",







            "faq.a1": "Para activar tu prueba registras tu tarjeta de forma segura vía Lemon Squeezy (MoR global con cifrado bancario SSL de 256 bits). Hoy se cobran $0.00 USD. Tendrás 7 días para probar la plataforma y, si no deseas continuar, puedes cancelar con un solo clic desde tu panel antes de que termine el plazo sin ningún costo.",







            "faq.q2": "¿Cómo funcionan los pagos en Cripto (USDT / USDC)?",







            "faq.a2": "Procesamos criptomonedas de forma instantánea a través de la pasarela NOWPayments. Puedes pagar en USDT (redes TRON, Binance Smart Chain, Polygon o Solana), Bitcoin o Ethereum con comisiones de red mínimas y sin intermediarios.",







            "faq.q3": "¿El Laboratorio de Backtesting ejecuta simulación automática con datos de mercado o es para registrar mis pruebas?",







            "faq.a3": "<strong>Es una bitácora especializada para registrar, auditar y documentar tus sesiones de backtesting manual</strong> (por ejemplo, las que ejecutas en tu simulador o software de gráficos técnicos). Al registrar tus entradas, la plataforma audita en tiempo real si estás cumpliendo las reglas de las empresas de fondeo (límites de pérdida diaria, drawdown máximo y consistencia) y proyecta el Profit Split de tu cuenta con el simulador de liquidaciones. <em>El motor automatizado con datos históricos de mercado integrados en la nube está actualmente en desarrollo y llegará próximamente como actualización para usuarios Pro.</em>",







            "faq.q4": "¿Qué sucede si expira mi período y no renuevo inmediatamente?",







            "faq.a4": "Tu cuenta pasa automáticamente al <strong>Modo Solo Lectura</strong>. Nunca perderás tus operaciones, cuentas ni historial guardado; podrás seguir consultando todas tus métricas en cualquier momento y volver a cargar operaciones tan pronto reactives tu suscripción.",















            // ==========================================







            // LANDING PAGE SECTIONS (landing.* & nav.*)







            // ==========================================







            "nav.features": "Características",







            "nav.backtesting": "Backtesting Pro",







            "nav.calculator": "Calculadora Pro",







            "nav.funding": "Cuentas Fondeo",







            "nav.mt5": "MT5 Sync",







            "nav.pricing": "Precios",







            "nav.faq": "Preguntas",







            "nav.login": "Iniciar Sesión",







            "nav.start_free": "Empezar Gratis",







            "nav.my_journal": "Mi Bitácora",















            "landing.hero_badge": "Suite Analítica en la Nube · Para Traders Disciplinados",







            "landing.hero_title": "Domina tu operativa con una bitácora profesional en la nube",







            "landing.hero_desc": "Diseñada para traders de Forex, Futuros, Cripto y Cuentas de Fondeo. Audita tu Win Rate, Drawdown y Profit Factor con precisión matemática y sincronización instantánea.",







            "landing.hero_cta_trial": "Iniciar Prueba Gratuita (7 Días)",







            "landing.hero_cta_calc": "Probar Calculadora de Lotaje",







            "landing.hero_guarantee": "✓ 7 días gratis sin compromiso · Cancela en 1 clic · Cifrado SSL 256-bit",















            "landing.feat_badge": "DISEÑADO POR TRADERS PARA TRADERS",







            "landing.feat_title": "Todo lo que necesitas para alcanzar la consistencia",







            "landing.feat_subtitle": "Deja atrás las hojas de cálculo desordenadas. Trading Journal Pro reúne analítica institucional, auditoría de fondeo y gestión de riesgo en una sola suite.",







            "landing.feat1_title": "Métricas Clave en Vivo",







            "landing.feat1_desc": "Win Rate, Profit Factor, Curva de Capital, R:R medio y retorno porcentual calculado automáticamente en tiempo real.",







            "landing.feat2_title": "Auditoría de Fondeo",







            "landing.feat2_desc": "Monitorea límites de pérdida diaria, drawdown total y reglas de consistencia de tus evaluaciones de prop firms.",







            "landing.feat3_title": "Laboratorio de Backtesting",







            "landing.feat3_desc": "Prueba y valida tus estrategias históricas sin arriesgar capital real. Simula escenarios y optimiza tus reglas.",







            "landing.feat4_title": "Calculadora de Lotaje Pro",







            "landing.feat4_desc": "Calcula el tamaño de posición exacto en milisegundos para Forex, Índices, Cripto y Metales con tasas de cambio cruzadas en vivo.",







            "landing.feat5_title": "Calendario y Mapa de Calor",







            "landing.feat5_desc": "Visualiza tus resultados día a día, identifica tus mejores horarios de operativa y mantén el control de tus rachas.",







            "landing.feat6_title": "Galería y Análisis Gráfico",







            "landing.feat6_desc": "Capturas de pantalla del gráfico antes y después de cada trade con notas emocionales y técnicas para aprender de tus errores.",















            "landing.bt_badge": "VALIDA TU ESTRATEGIA ANTES DE ARRIESGAR DINERO REAL",







            "landing.bt_title": "Laboratorio de Backtesting Profesional",







            "landing.bt_subtitle": "Diseña, prueba y optimiza tus hipótesis con rigor estadístico. Documenta cada prueba histórica con métricas comparativas frente a tu operativa en vivo.",







            "landing.bt_bullet1": "Simulación de cuentas demo o evaluaciones de fondeo.",







            "landing.bt_bullet2": "Cálculo instantáneo de Drawdown máximo y racha perdedora.",







            "landing.bt_bullet3": "Comparativa directa entre sistemas de trading y temporalidades.",







            "landing.bt_cta": "Explorar Laboratorio de Backtesting",















            "landing.calc_badge": "INCLUIDA EN TU MEMBRESÍA PRO · NO SE VENDE POR SEPARADO",







            "landing.calc_title": "Calculadora de Lotaje & Tamaño de Posición",







            "landing.calc_subtitle": "Gestión de riesgo militar en milisegundos. Selecciona el activo, ingresa tus pips de Stop Loss y obtén el lotaje sugerido al instante con conversión de divisas en tiempo real.",







            "landing.calc_cta": "Abrir Calculadora Ahora",















            "landing.mt5_badge": "Próximo lanzamiento · En desarrollo activo",







            "landing.mt5_title": "Sincronización Automática con MetaTrader 5",







            "landing.mt5_desc": "Conecta tu terminal MT5 mediante nuestro EA de solo lectura. Tus operaciones se importarán automáticamente para que solo te enfoques en el análisis posterior.",















            "landing.fondeo_badge": "Protección de Cuenta",







            "landing.fondeo_title": "Especializada en Reglas de Empresas de Fondeo (Prop Firms)",







            "landing.fondeo_desc": "Las empresas de fondeo tienen reglas estrictas que pueden costarte tu cuenta en un solo descuido. Nuestra plataforma audita en tiempo real:",







            "landing.fondeo_rule1": "Límite de pérdida diaria (Daily Loss Limit)",







            "landing.fondeo_rule2": "Drawdown máximo permitido (Trailing / Static)",







            "landing.fondeo_rule3": "Regla de consistencia porcentual por día",







            "landing.fondeo_rule4": "Metas de ganancia para Fase 1 y Fase 2 con avance en 1 clic",















            "landing.footer_channels": "Canales y Comunidad Oficial:",







            "landing.footer_terms": "Términos de Servicio",







            "landing.footer_privacy": "Política de Privacidad",







            "landing.footer_refund": "Política de Reembolso & Cancelación",







            "landing.footer_disclaimer": "Aviso de Riesgo Financiero",







            "landing.footer_contact": "Contacto:",







            "landing.legal_modal_title": "Avisos Legales & Políticas",







            "landing.legal_modal_subtitle": "Información contractual y regulatoria oficial de Trading Journal Pro",







            "landing.legal_tab_terms": "Términos",







            "landing.legal_tab_privacy": "Privacidad",







            "landing.legal_tab_refund": "Reembolsos",







            "landing.legal_tab_disclaimer": "Aviso de Riesgo",







            "landing.legal_questions": "¿Dudas legales? Escríbenos a",

            // ==========================================

            // AUTENTICACIÓN Y CUENTAS (auth.*)

            // ==========================================

            "auth.login_title": "Iniciar Sesión",

            "auth.login_subtitle": "Ingresa a tu Bitácora Pro en la nube",

            "auth.email_label": "Correo Electrónico",

            "auth.email_placeholder": "tu@email.com",

            "auth.password_label": "Contraseña",

            "auth.password_placeholder": "••••••••",

            "auth.forgot_password": "¿Olvidaste tu contraseña?",

            "auth.login_btn": "Entrar a mi Bitácora",

            "auth.no_account": "¿No tienes cuenta aún?",

            "auth.start_free_trial": "Empieza tu prueba gratis de 7 días",

            "auth.register_title": "Crear Cuenta Pro",

            "auth.register_subtitle": "7 días de acceso completo sin restricciones",

            "auth.name_label": "Nombre Completo",

            "auth.name_placeholder": "Ej: Alex Trader",

            "auth.register_btn": "Iniciar 7 Días de Prueba Gratis",

            "auth.has_account": "¿Ya tienes cuenta?",

            "auth.forgot_title": "Recuperar Contraseña",

            "auth.forgot_subtitle": "Te enviaremos un enlace seguro para restablecer tu clave",

            "auth.forgot_btn": "Enviar Enlace de Recuperación",

            "auth.back_to_login": "Volver a Iniciar Sesión",



            // ==========================================

            // SHOWCASE Y SIMULADOR INTERACTIVO (showcase.* & evo.*)

            // ==========================================

            "showcase.tab_metrics": "Dashboard & Métricas",

            "showcase.tab_trades": "Registro de Trades",

            "showcase.tab_calendar": "Rendimiento Mensual",

            "showcase.tab_funding": "Auditoría de Fondeo",

            "showcase.live_account_view": "app.tradingjournalpro.com — Vista de Cuenta Fondeada",

            "showcase.interactive_demo": "DEMO INTERACTIVA",

            "showcase.mobile_status": "Fondo $100K • En Vivo",

            "showcase.auto_demo_resume": "Reanudar Auto-Demo",

            "showcase.auto_demo_title": "Reanudar rotación automática",

            "evo.stage1": "1. A Ciegas",

            "evo.stage1_sub": "· Caos",

            "evo.stage2": "2. 15 Trades",

            "evo.stage2_sub": "· Filtros",

            "evo.stage3": "3. Bitácora Pro",

            "evo.stage3_sub": "· Consistencia",

            "evo.sim_trade_btn": "Simular Trade (+1.8%)",

            // ==========================================

            // GRUPOS Y REPLICACIÓN (groups.*)

            // ==========================================

            "groups.modal_title": "Nuevo grupo de cuentas",

            "groups.name_label": "Nombre del grupo",

            "groups.name_ph": "Ej: Fondeo en prueba",

            "groups.icon_label": "Icono",

            "groups.icon_stacked": "Grupos apilados",

            "groups.icon_trial": "Fase de prueba",

            "groups.icon_funded": "Fondeada",

            "groups.icon_instant": "Instant",

            "groups.icon_real": "Cuenta real",

            "groups.icon_prop": "Prop firm",

            "groups.icon_trading": "Trading",

            "groups.icon_challenge": "Desafío",

            "groups.accounts_label": "Cuentas del grupo",

            "groups.accounts_note": "Una cuenta puede pertenecer a más de un grupo.",

            "groups.save_btn": "Guardar grupo",

            "groups.choose_accounts": "Elegir cuentas",

            "groups.replicate_in": "Replicar entrada en:",



            // ==========================================

            // TOASTS Y CONFIRMACIONES (toast.* & confirm.*)

            // ==========================================

            "toast.success": "Operación realizada con éxito",

            "toast.trade_saved": "Operación guardada correctamente",

            "toast.trade_deleted": "Operación eliminada",

            "toast.account_saved": "Cuenta guardada correctamente",

            "toast.group_saved": "Grupo guardado correctamente",

            "toast.group_deleted": "Grupo eliminado",

            "toast.copied": "Copiado al portapapeles",

            "confirm.delete_trade": "¿Estás seguro de que deseas eliminar este trade?",

            "confirm.delete_account": "¿Estás seguro de que deseas eliminar esta cuenta?",

            "confirm.delete_group": "¿Estás seguro de que deseas eliminar este grupo?",
    
        // Comprehensive auto-localization keys (ES)
        "app_auto.por_a_o": "Por Año",
        "app_auto.por_mes": "Por Mes",
        "app_auto.por_semana": "Por Semana",
        "app_auto.full_tp": "Full TP",
        "app_auto.parcial": "Parcial",
        "app_auto.activa": "Activa",
        "app_auto.cierre_manual": "Cierre manual",
        "app_auto.pendiente": "Pendiente",
        "app_auto.sin_activar": "Sin Activar",
        "app_auto.sin_sesi_n": "Sin sesión",
        "app_auto.pre_londres": "Pre Londres",
        "app_auto.londres": "Londres",
        "app_auto.pre_new_york": "Pre New York",
        "app_auto.new_york": "New York",
        "app_auto.asia": "Asia",
        "app_auto.sin_clasificar_mt5": "Sin clasificar (MT5)",
        "app_auto.favor": "Favor",
        "app_auto.contra": "Contra",
        "app_auto.personalizado": "Personalizado…",
        "app_auto.1_fase_al_superarla_pasa_a_fondeada": "1 fase (al superarla pasa a Fondeada)",
        "app_auto.2_fases": "2 fases",
        "app_auto.balance_objetivo": "Balance objetivo ($)",
        "app_auto.retorno_objetivo": "Retorno objetivo (%)",
        "app_auto.del_balance": "% del balance",
        "app_auto.fijo_sobre_el_balance_inicial": "Fijo sobre el balance inicial",
        "app_auto.trailing_sobre_el_pico": "Trailing sobre el pico",
        "app_auto.login_mt5_opcional": "Login MT5 (opcional)",
        "app_auto.n_mero_de_cuenta_que_aparece_en_mt5_si_l": "Número de cuenta que aparece en MT5. Si lo dejas vacío, el puente no sincronizará operaciones de esta cuenta.",
        "app_auto.objetivo_de_beneficio": "Objetivo de beneficio (%)",
        "app_auto.drawdown_m_ximo": "Drawdown máximo (%)",
        "app_auto.fases_del_challenge": "Fases del challenge",
        "app_auto.objetivo_fase_2": "Objetivo fase 2 (%)",
        "app_auto.tipo_de_meta": "Tipo de meta",
        "app_auto.valor_de_la_meta": "Valor de la meta",
        "app_auto.tu_parte": "Tu parte (%)",
        "app_auto.colch_n_inicial": "Colchón (% inicial)",
        "app_auto.m_nimo_a_retirar": "Mínimo a retirar",
        "app_auto.tipo_de_drawdown": "Tipo de drawdown",
        "app_auto.reglas_opcionales_de_la_cuenta": "Reglas opcionales de la cuenta",
        "app_auto.consistencia_m_ximo_por_d_a": "Consistencia: % máximo por día",
        "app_auto.d_as_m_nimos_de_trading": "Días mínimos de trading",
        "app_auto.d_as_rentables_m_nimos": "Días rentables mínimos",
        "app_auto.l_mite_de_p_rdida_diaria": "Límite de pérdida diaria (%)",
        "app_auto.registrar_retiro": "Registrar retiro",
        "app_auto.cuenta": "Cuenta:",
        "app_auto.fecha": "Fecha",
        "app_auto.monto": "Monto ($)",
        "app_auto.descontar_del_balance_actual_de_la_cuent": "Descontar del Balance Actual de la cuenta",
        "app_auto.desmarca_si_solo_quieres_anotarlo_en_el_": "Desmarca si solo quieres anotarlo en el histórico de retiros.",
        "app_auto.m_s_tarde": "Más tarde",
        "app_auto.continuar": "Continuar",
        "app_auto.cuentas_del_grupo": "Cuentas del grupo",
        "app_auto.una_cuenta_puede_pertenecer_a_m_s_de_un_": "Una cuenta puede pertenecer a más de un grupo.",
        "app_auto.guardar_grupo": "Guardar grupo",
        "app_auto.elegir_cuentas": "Elegir cuentas",
        "app_auto.replicar_entrada_en": "Replicar entrada en:",
        "app_auto.todas": "Todas",
        "app_auto.ninguna": "Ninguna",
        "app_auto.aceptar_selecci_n": "Aceptar selección",
        "app_auto.elegir_copias": "Elegir copias",
        "app_auto.aplicar_los_cambios_tambi_n_a": "Aplicar los cambios también a:",
        "app_auto.link_antes": "Link (Antes)",
        "app_auto.subir_captura_s_antes": "Subir Captura(s) Antes",
        "app_auto.o_pega_con_ctrl_v": "(o pega con Ctrl+V)",
        "app_auto.link_despu_s": "Link (Después)",
        "app_auto.subir_captura_s_despu_s": "Subir Captura(s) Después",
        "app_auto.est_s_a_punto_de_borrar": "Estás a punto de borrar",
        "app_auto.todos_los_datos": "todos los datos",
        "app_auto.del_entorno_actual": "del entorno actual (",
        "app_auto.se_recomienda_exportar_un_respaldo_en_fo": "). Se recomienda exportar un respaldo en formato JSON antes de proceder.",
        "app_auto.an_lisis_de_operaciones": "Análisis de Operaciones",
        "app_auto.operaciones_registradas": "Operaciones registradas",
        "app_auto.por_1_mes": "por 1 Mes",
        "app_auto.7_d_as_de_prueba_0_cobrados_hoy_si_es_pr": "7 días de prueba ($0 cobrados hoy si es primera vez)",
        "app_auto.simulaci_n_lemon_squeezy_checkout_sandbo": "Simulación Lemon Squeezy Checkout (Sandbox)",
        "app_auto.test_mode": "TEST MODE",
        "app_auto.prueba_el_flujo_de_suscripci_n_sin_tarje": "Prueba el flujo de suscripción sin tarjeta real. La cuenta se actualizará a Pro de inmediato:",
        "app_auto.tarjeta_simulada": "Tarjeta simulada:",
        "app_auto.monto_del_plan": "Monto del plan:",
        "app_auto.simular_pago_exitoso": "Simular Pago Exitoso",
        "app_auto.transferencia_usdt_usdc": "Transferencia USDT / USDC",
        "app_auto.env_a_el_monto_exacto_a_una_de_nuestras_": "Envía el monto exacto a una de nuestras billeteras oficiales:",
        "app_auto.red_tron_trc_20": "Red TRON (TRC-20)",
        "app_auto.copiar": "Copiar",
        "app_auto.red_bsc_bep_20_binance": "Red BSC (BEP-20 / Binance)",
        "app_auto.tras_enviar_tu_transferencia_tu_cuenta_s": "Tras enviar tu transferencia, tu cuenta se activará automáticamente al confirmarse en la red. También puedes adjuntar el hash a soporte.",
        "app_auto.simular_confirmaci_n_de_transferencia_tx": "Simular Confirmación de Transferencia (TxHash OK)",
        "app_auto.herramientas_de_prueba": "Herramientas de Prueba:",
        "app_auto.simular_prueba_vencida": "Simular Prueba Vencida",
        "app_auto.restablecer_7_d_as": "Restablecer 7 Días",
        "app_auto.1_mes_pro": "1 Mes Pro",
        "app_auto.paso_1_de_4": "Paso 1 de 4",
        "app_auto.tus_cuentas_de_trading": "Tus Cuentas de Trading",
        "app_auto.aqu_administras_tus_cuentas_reales_o_eva": "Aquí administras tus cuentas reales o evaluaciones de fondeo. Puedes configurar reglas de consistencia, límites de pérdida diaria y metas de fase 1 y 2.",
        "app_auto.anterior": "Anterior",
        "app_auto.siguiente": "Siguiente",
        "landing_auto.reanudar_auto_demo": "Reanudar Auto-Demo",
        "landing_auto.auto_11s": "AUTO 11s",
        "landing_auto.caos": "· Caos",
        "landing_auto.filtros": "· Filtros",
        "landing_auto.consistencia": "CONSISTENCIA",
        "landing_auto.balance_neto": "Balance Neto",
        "landing_auto.balance_actual": "Balance Actual",
        "landing_auto.drawdown_m_x": "Drawdown Máx",
        "landing_auto.l_mite_5_0": "Límite: -5.0%",
        "landing_auto.ratio_r_r_medio": "Ratio R:R Medio",
        "landing_auto.esperanza_positiva": "Esperanza Positiva",
        "landing_auto.consistencia_institucional": "Consistencia Institucional:",
        "landing_auto.solo_ejecutas_tus_setups_con_esperanza_m": "Solo ejecutas tus setups con esperanza matemática probada (",
        "landing_auto.riesgo_0_5_por_trade_y_cero_sobreoperati": "). Riesgo 0.5% por trade y cero sobreoperativa.",
        "landing_auto.operativa_quir_rgica_45_entradas_registr": "¡Operativa Quirúrgica! 45 entradas registradas con checklist.",
        "landing_auto.meta_48_5": "Meta: 48.5%",
        "landing_auto.curva_de_crecimiento_de_capital": "Curva de Crecimiento de Capital",
        "landing_auto.4_850_00_ganancia_neta": "+$4,850.00 Ganancia Neta",
        "landing_auto.meta_fase_1": "Meta Fase 1:",
        "landing_auto.48_5_alcanzado": "48.5% alcanzado",
        "landing_auto.xauusd_compra": "XAUUSD Compra:",
        "landing_auto.1_3_2_r_r": "(1:3.2 R:R)",
        "landing_auto.bit_cora_historial_de_trades": "Bitácora & Historial de Trades",
        "landing_auto.datos_reales_app": "DATOS REALES APP",
        "landing_auto.1_oro": "1. Oro",
        "landing_auto.2_eur": "2. EUR",
        "landing_auto.3_gbp": "3. GBP",
        "landing_auto.4_us30": "4. US30",
        "landing_auto.fecha_d_a": "Fecha / Día",
        "landing_auto.activo": "Activo",
        "landing_auto.sesi_n": "Sesión",
        "landing_auto.tendencia": "Tendencia",
        "landing_auto.tipo_orden": "Tipo Orden",
        "landing_auto.pips_sl_tp": "Pips SL / TP",
        "landing_auto.ratio_rr": "Ratio RR",
        "landing_auto.riesgo": "Riesgo",
        "landing_auto.estado": "Estado",
        "landing_auto.resultado": "Resultado (%)",
        "landing_auto.balance_p_l": "Balance (P/L)",
        "landing_auto.galer_a": "Galería",
        "landing_auto.acciones": "Acciones",
        "landing_auto.jueves": "Jueves",
        "landing_auto.mi_rcoles": "Miércoles",
        "landing_auto.martes": "Martes",
        "landing_auto.lunes": "Lunes",
        "landing_auto.viernes": "Viernes",
        "landing_auto.xauusd_buy_limit_an_lisis_t_cnico": "XAUUSD (Buy Limit) · Análisis Técnico",
        "landing_auto.captura_y_setup_antes": "Captura y Setup (ANTES)",
        "landing_auto.ver_gr_fico_t_cnico": "Ver Gráfico Técnico",
        "landing_auto.setup_activo": "Setup Activo",
        "landing_auto.ampliar": "Ampliar",
        "landing_auto.gesti_n_y_cierre_despu_s": "Gestión y Cierre (DESPUÉS)",
        "landing_auto.captura_de_an_lisis": "Captura de Análisis",
        "landing_auto.resumen_anual_calendario_de_rendimiento": "Resumen Anual & Calendario de Rendimiento",
        "landing_auto.a_o_2026_auditado": "AÑO 2026 AUDITADO",
        "landing_auto.tour_auto": "Tour Auto",
        "landing_auto.68_70_anual_68_700": "+68.70% Anual (+$68,700)",
        "landing_auto.retorno_anual": "Retorno Anual:",
        "landing_auto.meses_verde": "Meses Verde:",
        "landing_auto.win_rate_anual": "Win Rate Anual:",
        "landing_auto.enero": "Enero",
        "landing_auto.febrero": "Febrero",
        "landing_auto.marzo": "Marzo",
        "landing_auto.abril": "Abril",
        "landing_auto.mayo": "Mayo",
        "landing_auto.junio": "Junio",
        "landing_auto.julio": "Julio",
        "landing_auto.agosto": "Agosto",
        "landing_auto.septiembre": "Septiembre",
        "landing_auto.octubre": "Octubre",
        "landing_auto.noviembre": "Noviembre",
        "landing_auto.diciembre": "Diciembre",
        "landing_auto.retorno": "Retorno",
        "landing_auto.efect": "Efect.",
        "landing_auto.dd_control": "DD Control",
        "landing_auto.mes_be": "Mes BE",
        "landing_auto.top_mes": "Top Mes ⭐",
        "landing_auto.en_curso": "En Curso",
        "landing_auto.auditor_a_profunda_octubre_2026": "Auditoría Profunda: Octubre 2026",
        "landing_auto.mejor_mes_del_a_o_14_85": "Mejor Mes del Año (+14.85%)",
        "landing_auto.mejor_sesi_n": "⚡ Mejor sesión",
        "landing_auto.distribuci_n": "📊 Distribución",
        "landing_auto.23_operaciones_cerradas": "23 operaciones cerradas",
        "landing_auto.auditor_a_de_reglas_de_empresas_de_fonde": "Auditoría de Reglas de Empresas de Fondeo",
        "landing_auto.configuraci_n_lista": "⚙️ CONFIGURACIÓN LISTA",
        "landing_auto.simular_progreso_auto": "Simular Progreso Auto",
        "landing_auto.1_trade": "+1 Trade",
        "landing_auto.par_metros_de_cuenta_auditados": "Parámetros de Cuenta Auditados:",
        "landing_auto.cuenta_100k_2_fases": "Cuenta 100K (2 Fases)",
        "landing_auto.cuenta_50k_1_fase": "Cuenta 50K (1 Fase)",
        "landing_auto.fondeo_directo_25k": "Fondeo Directo 25K",
        "landing_auto.p_rdida_diaria": "Pérdida Diaria:",
        "landing_auto.p_rdida_m_xima": "Pérdida Máxima:",
        "landing_auto.d_as_m_nimos": "Días Mínimos:",
        "landing_auto.progreso": "Progreso:",
        "landing_auto.l_mite_diario_respetado": "Límite diario respetado",
        "landing_auto.cuenta_blindada": "Cuenta blindada",
        "landing_auto.trade_m_x_bajo_control": "Trade máx bajo control",
        "landing_auto.0_5_d_as": "0 / 5 Días",
        "landing_auto.potencia_anal_tica_rigor_cuantitativo": "POTENCIA ANALÍTICA & RIGOR CUANTITATIVO",
        "landing_auto.todo_lo_que_un_trader_disciplinado_neces": "Todo lo que un trader disciplinado necesita para no quemar cuentas",
        "landing_auto.construida_con_un_nico_objetivo_reemplaz": "Construida con un único objetivo: reemplazar el caos y las hojas de cálculo por un sistema profesional con gráficos en tiempo real, auditoría de reglas de empresas de fondeo y psicología de gestión de riesgo.",
        "landing_auto.tiempo_real": "TIEMPO REAL",
        "landing_auto.curva_de_equidad_m_tricas_pro": "Curva de Equidad & Métricas Pro",
        "landing_auto.comprueba_tu_esperanza_matem_tica_con_wi": "Comprueba tu esperanza matemática con Win Rate, Profit Factor y Drawdown continuo sin trucos visuales.",
        "landing_auto.sin_bit_cora": "Sin Bitácora",
        "landing_auto.bit_cora_pro": "Bitácora Pro",
        "landing_auto.max_dd": "Max DD",
        "landing_auto.interactivo": "INTERACTIVO",
        "landing_auto.calculadora_de_lotaje_precisa": "Calculadora de Lotaje Precisa",
        "landing_auto.nunca_vuelvas_a_sobrelotear_calcula_el_l": "Nunca vuelvas a sobrelotear. Calcula el lote exacto según tu porcentaje de riesgo en 1 segundo.",
        "landing_auto.volumen_calculado": "Volumen Calculado:",
        "landing_auto.lotes": "LOTES",
        "landing_auto.valor_pip": "Valor Pip:",
        "landing_auto.margen": "Margen:",
        "landing_auto.calendario_d_as_de_rendimiento": "Calendario & Días de Rendimiento",
        "landing_auto.visualiza_tus_d_as_verdes_y_rojos_en_un_": "Visualiza tus días verdes y rojos en un heatmap continuo para detectar sobreoperativa y fatiga mental.",
        "landing_auto.lun": "LUN",
        "landing_auto.mar": "MAR",
        "landing_auto.mi": "MIÉ",
        "landing_auto.jue": "JUE ⭐",
        "landing_auto.vie": "VIE",
        "landing_auto.total_semana": "Total Semana:",
        "landing_auto.2_940_00_80_verde": "+$2,940.00 (80% Verde)",
        "landing_auto.prop_firm_ready": "PROP FIRM READY",
        "landing_auto.auditor_a_de_fondeo_en_vivo": "Auditoría de Fondeo en Vivo",
        "landing_auto.auditor_a_estricta_de_p_rdida_diaria_dra": "Auditoría estricta de pérdida diaria, drawdown máximo y regla de consistencia antes de violar la cuenta.",
        "landing_auto.checklist_hd": "CHECKLIST HD",
        "landing_auto.galer_a_antes_despu_s_gr_ficos_t_cnicos": "Galería Antes / Después (Gráficos Técnicos)",
        "landing_auto.sube_el_setup_antes_de_disparar_y_la_ges": "Sube el setup antes de disparar y la gestión final. Audita tus emociones y elimina operaciones impulsivas.",
        "landing_auto.antes": "ANTES",
        "landing_auto.despu_s": "DESPUÉS",
        "landing_auto.checklist_5_reglas": "Checklist 5 reglas",
        "landing_auto.5_5_reglas": "5/5 Reglas ✓",
        "landing_auto.filtro_de_fugas": "FILTRO DE FUGAS",
        "landing_auto.desglose_quir_rgico_por_sesi_n": "Desglose Quirúrgico por Sesión",
        "landing_auto.descubre_a_qu_horas_ganas_dinero_y_en_cu": "Descubre a qué horas ganas dinero y en cuáles lo regalas para operar únicamente en tus ventanas de máxima ventaja.",
        "landing_auto.sesi_n_asia_noche": "Sesión Asia Noche:",
        "landing_auto.filtrada_cero_p_rdidas": "Filtrada (Cero pérdidas)",
        "landing_auto.bit_cora_y_registro_de_sesiones_de_backt": "BITÁCORA Y REGISTRO DE SESIONES DE BACKTESTING",
        "landing_auto.aclaraci_n_importante": "Aclaración Importante:",
        "calc.initial_risk": "$0.00 en riesgo",

        // Full landing localization keys (ES)
        "landing_full.esta_herramienta_est_dise_ada_para": "Esta herramienta está diseñada para",
        "landing_full.registrar_medir_y_auditar": "registrar, medir y auditar",
        "landing_full.tus_sesiones_de_backtesting_pro_manual_e": "tus sesiones de Backtesting Pro manual (ej. realizadas en tu plataforma de gráficos técnicos o simulador).",
        "landing_full.el_motor_automatizado_con_datos_de_merca": "El motor automatizado con datos de mercado históricos está en desarrollo activo y llegará próximamente.",
        "landing_full.registra_tus_sesiones_en_backtesting_pro": "Registra tus Sesiones en Backtesting Pro y Evalúa tus Reglas de Fondeo",
        "landing_full.documenta_tus_pruebas_de_estrategia_manu": "Documenta tus pruebas de estrategia manuales con rigor institucional. Registra cada trade testeado en tu plataforma de gráficos técnicos, audita en tiempo real las reglas de empresas de fondeo (prop firms) y calcula el Profit Split con el simulador de cobros antes de pagar una evaluación real.",
        "landing_full.registro_de_fases_de_fondeo": "Registro de Fases de Fondeo",
        "landing_full.anota_tus_trades_de_backtesting_manual_y": "Anota tus trades de backtesting manual y verifica si tu estrategia cumple las metas (8%, 10%), días mínimos y límites de pérdida antes de pagar $500 por un examen real.",
        "landing_full.auditor_a_seg_n_reglas_de_empresas_de_fo": "Auditoría según reglas de empresas de fondeo",
        "landing_full.simulador_de_retiros_payouts": "Simulador de Retiros (Payouts)",
        "landing_full.no_solo_anotes_pips_simula_tu_dinero_en_": "No solo anotes pips: simula tu dinero en mano. Ajusta el Profit Split (80/20 o 90/10) y deduce el retiro del balance simulado para medir si mantienes el colchón necesario.",
        "landing_full.reparto_80_20_y_90_10_en_usdt": "Reparto 80/20 y 90/10 en USDT",
        "landing_full.drawdown_trailing_consistencia": "Drawdown Trailing & Consistencia",
        "landing_full.descubre_si_tu_estrategia_soporta_el_dra": "Descubre si tu estrategia soporta el drawdown trailing o la pérdida diaria estricta de las prop firms con alertas inmediatas al ingresar tus datos manuales.",
        "landing_full.alertas_de_quiebre_en_tiempo_real": "Alertas de quiebre en tiempo real",
        "landing_full.sesiones_aisladas_por_estrategia": "Sesiones Aisladas por Estrategia",
        "landing_full.crea_sesiones_separadas_para_registrar_t": "Crea sesiones separadas para registrar tus testeos de gráficos técnicos: 'ICT Oro NY', 'Scalping EURUSD', etc. Guarda fotos antes/después y notas de cada setup probado.",
        "landing_full.guarda_fotos_de_antes_y_despu_s": "Guarda fotos de antes y después",
        "landing_full.c_mo_funciona_hoy_vs_pr_ximamente": "¿Cómo funciona hoy vs. Próximamente?",
        "landing_full.en_desarrollo": "EN DESARROLLO",
        "landing_full.hoy": "Hoy:",
        "landing_full.bit_cora_avanzada_para_registrar_auditar": "Bitácora avanzada para registrar, auditar y documentar trades testeados manualmente en tu plataforma de gráficos o simulador.",
        "landing_full.pr_ximamente": "Próximamente:",
        "landing_full.motor_de_simulaci_n_autom_tica_integrado": "Motor de simulación automática integrado con velas históricas y datos tick a tick.",
        "landing_full.motor_con_datos_pr_ximamente": "Motor con Datos · Próximamente",
        "landing_full.simulador_de_registro_de_backtesting_pro": "Simulador de Registro de Backtesting Pro",
        "landing_full.prueba_c_mo_la_bit_cora_audita_tus_entra": "Prueba cómo la bitácora audita tus entradas manuales y liquida retiros según las reglas de cada firma:",
        "landing_full.registro_manual_de_sesiones": "REGISTRO MANUAL DE SESIONES",
        "landing_full.1_selecciona_la_empresa_de_fondeo_a_simu": "1. Selecciona la Empresa de Fondeo a Simular:",
        "landing_full.2_etapa_actual_del_desaf_o_simulado": "2. Etapa Actual del Desafío Simulado:",
        "landing_full.fase_1": "Fase 1",
        "landing_full.fase_2": "Fase 2",
        "landing_full.fondeada": "Fondeada",
        "landing_full.balance_inicial_de_prueba": "Balance Inicial de Prueba:",
        "landing_full.objetivo_de_ganancia_target": "Objetivo de Ganancia (Target):",
        "landing_full.l_mite_p_rdida_diaria": "Límite Pérdida Diaria:",
        "landing_full.drawdown_m_ximo_total": "Drawdown Máximo Total:",
        "landing_full.profit_split_al_fondearte": "Profit Split al Fondearte:",
        "landing_full.estado_de_la_simulaci_n": "Estado de la Simulación",
        "landing_full.100_seguro_en_regla": "✓ 100% SEGURO · EN REGLA",
        "landing_full.meta_para_aprobar": "Meta para Aprobar:",
        "landing_full.p_rdida_diaria_consumida_hoy_5_0_m_x": "Pérdida Diaria Consumida Hoy (-5.0% Máx):",
        "landing_full.drawdown_m_ximo_hist_rico_10_0_m_x": "Drawdown Máximo Histórico (-10.0% Máx):",
        "landing_full.d_as_operados": "Días Operados",
        "landing_full.consistencia": "Consistencia",
        "landing_full.r_r_medio": "R:R Medio",
        "landing_full.ganancia_retirable_total": "Ganancia Retirable Total:",
        "landing_full.tu_pago_neto_a_billetera": "Tu Pago Neto a Billetera:",
        "landing_full.simular_solicitud_de_retiro_payout": "Simular Solicitud de Retiro (Payout)",
        "landing_full.reset": "Reset",
        "landing_full.simulaci_n_de_retiro_procesada_exitosame": "¡Simulación de Retiro Procesada Exitosamente!",
        "landing_full.m_todo_usdt_trc20_polygon": "Método: USDT (TRC20 / Polygon)",
        "landing_full.comisi_n_broker_1_690_00_20": "Comisión Broker: $1,690.00 (20%)",
        "landing_full.incluida_en_tu_membres_a_pro_no_se_vende": "INCLUIDA EN TU MEMBRESÍA PRO · NO SE VENDE POR SEPARADO",
        "landing_full.calculadora_de_lotaje_pro": "Calculadora de Lotaje Pro",
        "landing_full.el_c_lculo_institucional_de_lotaje_m_s_p": "El cálculo institucional de lotaje más preciso del mercado. Diseñada para proteger tu drawdown diario en cuentas reales y evaluaciones de Prop Firms antes de apretar el gatillo.",
        "landing_full.crea_y_guarda_tus_propios_setups_presets": "Crea y Guarda tus Propios Setups & Presets",
        "landing_full.agrupaci_n_inteligente_por_categor_as_de": "Agrupación Inteligente por Categorías de Mercado",
        "landing_full.tipos_de_cambio_en_vivo_y_conversi_n_exa": "Tipos de Cambio en Vivo y Conversión Exacta",
        "landing_full.tolerancia_cero_a_errores_de_sobrelotaje": "Tolerancia Cero a Errores de Sobrelotaje",
        "landing_full.evita_que_un_c_lculo_manual_apresurado_q": "Evita que un cálculo manual apresurado queme tu cuenta de evaluación. La calculadora te muestra el valor exacto de cada punto y el margen requerido antes de entrar a mercado.",
        "landing_full.simulador_de_setups": "SIMULADOR DE SETUPS",
        "landing_full.selecciona_un_setup_preset": "Selecciona un Setup / Preset:",
        "landing_full.balance_de_la_cuenta": "Balance de la Cuenta:",
        "landing_full.instrumento_par": "Instrumento / Par:",
        "landing_full.riesgo_permitido": "Riesgo Permitido:",
        "landing_full.stop_loss_programado": "Stop Loss Programado:",
        "landing_full.lotaje_exacto_recomendado": "Lotaje Exacto Recomendado",
        "landing_full.desbloqueada_de_inmediato_al_iniciar_tu_": "Desbloqueada de inmediato al iniciar tu prueba de 7 días.",
        "landing_full.desbloquear_calculadora_en_la_prueba": "Desbloquear Calculadora en la Prueba",
        "landing_full.pr_ximo_lanzamiento_en_desarrollo_activo": "Próximo lanzamiento · En desarrollo activo",
        "landing_full.mt5_cloud_sync_conexi_n_autom_tica_con_m": "MT5 Cloud Sync: Conexión Automática con MetaTrader 5",
        "landing_full.operas_en_tu_terminal_metatrader_5_como_": "Operas en tu terminal MetaTrader 5 como siempre. Nosotros nos encargamos de que cada entrada, salida, stop loss y comisión viaje a tu Bitácora Pro en la nube de forma automática e invisible.",
        "landing_full.zero_esfuerzo_de_registro": "Zero Esfuerzo de Registro",
        "landing_full.auditor_a_real_de_broker": "Auditoría Real de Broker",
        "landing_full.captura_los_costos_ocultos_que_alteran_t": "Captura los costos ocultos que alteran tu rentabilidad: comisiones de apertura, rollover / swap nocturno y slippage adverso directo desde el servidor de tu broker.",
        "landing_full.acceso_vip_para_miembros_pro": "Acceso VIP para Miembros Pro",
        "landing_full.los_usuarios_con_suscripci_n_activa_tend": "Los usuarios con suscripción activa tendrán pase preferente a la beta cerrada antes del despliegue público, sin cargos sorpresa ni licencias adicionales.",
        "landing_full.operas_en_metatrader_5_a_diario": "¿Operas en MetaTrader 5 a diario?",
        "landing_full.inicia_tu_prueba_de_7_d_as_hoy_y_reserva": "Inicia tu prueba de 7 días hoy y reserva tu lugar preferente para la beta de MT5 Cloud Sync.",
        "landing_full.reservar_mi_acceso_pro": "Reservar Mi Acceso Pro →",
        "landing_full.drawdown_diario_y_m_ximo": "Drawdown Diario y Máximo:",
        "landing_full.alertas_visuales_inmediatas_antes_de_roz": "Alertas visuales inmediatas antes de rozar el límite de pérdida permitido.",
        "landing_full.regla_de_consistencia": "Regla de Consistencia:",
        "landing_full.controla_que_ning_n_trade_individual_rep": "Controla que ningún trade individual represente más porcentaje de tu ganancia del permitido.",
        "landing_full.gesti_n_de_fases": "Gestión de Fases:",
        "landing_full.avanza_con_un_clic_de_fase_1_a_fase_2_y_": "Avanza con un clic de Fase 1 a Fase 2 y de Fase 2 a Cuenta Fondeada con restablecimiento de balance.",
        "landing_full.auditor_a_de_reglas_de_empresas_de_fonde": "Auditoría de Reglas de Empresas de Fondeo (Prop Firms)",
        "landing_full.100_cumplido": "100% CUMPLIDO",
        "landing_full.l_mite_p_rdida_diaria_5": "Límite Pérdida Diaria (-5%)",
        "landing_full.0_8_consumido": "-0.8% consumido",
        "landing_full.p_rdida_m_xima_total_10": "Pérdida Máxima Total (-10%)",
        "landing_full.1_2_m_ximo_visto": "-1.2% máximo visto",
        "landing_full.d_as_m_nimos_de_trading_5_d_as": "Días Mínimos de Trading (5 días)",
        "landing_full.5_5_completados": "5 / 5 completados",
        "landing_full.flexibilidad": "Flexibilidad",
        "landing_full.ideal_para_probar_mes_a_mes_sin_compromi": "Ideal para probar mes a mes sin compromisos ni ataduras.",
        "landing_full.ahorras_9": "Ahorras $9",
        "landing_full.el_ciclo_perfecto_para_preparar_y_pasar_": "El ciclo perfecto para preparar y pasar tus desafíos de fondeo.",
        "landing_full.0_hoy_acceso_pro_total_inmediato": "$0 hoy · Acceso Pro total inmediato",
        "landing_full.ahorras_72": "Ahorras $72",
        "landing_full.para_traders_comprometidos_que_construye": "Para traders comprometidos que construyen consistencia a largo plazo.",
        "landing_full.0_hoy_mayor_ahorro_garantizado": "$0 hoy · Mayor ahorro garantizado",
        "landing_full.todos_los_planes_incluyen_la_membres_a_p": "Todos los planes incluyen la Membresía Pro completa con todo desbloqueado:",
        "landing_full.100_desbloqueado": "100% Desbloqueado",
        "landing_full.copias_en_la_nube_autom_ticas": "Copias en la nube automáticas",
        "landing_full.acceso_prioritario_a_mt5_cloud_sync": "Acceso prioritario a MT5 Cloud Sync",
        "landing_full.prueba_de_7_d_as_con_tarjeta_0_hoy_cance": "Prueba de 7 días con tarjeta ($0 hoy). Cancela antes del día 7 con 1 solo clic desde tu panel sin costo.",
        "landing_full.contacto": "Contacto:",
        "landing_full.descargo_de_responsabilidad_financiera": "Descargo de Responsabilidad Financiera:",
        "landing_full.trading_journal_pro_es_una_plataforma_te": "Trading Journal Pro es una plataforma tecnológica de software y registro de datos analíticos para la gestión personal de operativa. No provee asesoramiento financiero, gestión de fondos, señales de trading ni recomendaciones de inversión. El trading de activos financieros, Forex, futuros y cuentas de empresas de fondeo (prop firms) conlleva un riesgo sustancial de pérdida de capital y no es adecuado para todos los inversores. Todos los derechos reservados © 2026 Trading Journal Pro.",
        "landing_full.avisos_legales_pol_ticas": "Avisos Legales & Políticas",
        // Extra session modal & metrics keys
            "modal_session.current_balance_help": "Si lo dejas vacío, se usa el Balance Inicial como base y se suman las operaciones registradas.",
            "modal_session.real_balance_help": "Es el último cierre informado: al guardar se registra una captura en Seguimiento de balances.",
            "modal_session.mt5_help": "Número de cuenta que aparece en MT5. Si lo dejas vacío, el puente no sincronizará con esta cuenta.",
            "modal_session.goal_help": "Verás el avance hacia el objetivo y el colchón de drawdown restante en las métricas de la cuenta.",
            "modal_session.goal_type": "Tipo de meta",
            "modal_session.goal_target_bal": "Balance objetivo ($)",
            "modal_session.goal_val": "Valor de la meta",
            "modal_session.goal_own_help": "Una meta propia: se mostrará el avance y cuánto falta para alcanzarla.",
            "modal_session.payout_help": "Reglas de retiro: la app calcula tu parte retirable y avisa cuánto falta para el próximo cobro.",
            "modal_session.pct_balance": "% del balance",
            "modal_session.fixed_initial": "Fijo sobre el balance inicial",
            "modal_session.daily_loss_label": "Límite de pérdida diaria (%)",
            "modal_session.rules_help": "Se muestran como tarjetas de progreso en las métricas de la cuenta. Las reglas de drawdown de fondeo se configuran abajo.",
            "modal_session.drawdown_help": "Los drawdowns se calculan sobre el balance inicial. Deja un drawdown vacío para desactivarlo.",
            "metrics.by_month": "Por Mes",
            "metrics.by_week": "Por Semana",
            "daily.modal_title": "Análisis de Operaciones",
            "daily.modal_summary": "Operaciones registradas",,







        },















        en: {







            // General / Common







            "app.title": "Trading Journal Pro",







            "lang.es": "ES",







            "lang.en": "EN",







            "lang.toggle_title": "Switch language (Español / English)",







            "common.loading": "Loading...",







            "common.save": "Save",







            "common.cancel": "Cancel",







            "common.close": "Close",







            "common.delete": "Delete",







            "common.edit": "Edit",







            "common.view": "View",







            "common.all": "All",







            "common.yes": "Yes",







            "common.no": "No",







            "common.actions": "Actions",







            "common.status": "Status",







            "common.date": "Date",







            "common.time": "Time",







            "common.pair": "Asset / Pair",







            "common.order": "Order",







            "common.pips": "Pips",







            "common.notes": "Notes",







            "common.screenshots": "Screenshots",







            "common.result": "Result",















            // Days of the week







            "day.monday": "Monday",







            "day.tuesday": "Tuesday",







            "day.wednesday": "Wednesday",







            "day.thursday": "Thursday",







            "day.friday": "Friday",







            "day.saturday": "Saturday",







            "day.sunday": "Sunday",















            // Topbar & Announcement







            "topbar.badge": "NEW",







            "topbar.text": "Start your 7-day free trial. Cancel anytime with 1 click.",







            "topbar.cta": "Create free account →",















            // Navbar & Modes







            "nav.features": "Features",







            "nav.backtesting": "Backtesting Pro",







            "nav.calculator": "Position Size Calculator",







            "nav.funding": "Prop Firm Accounts",







            "nav.pricing": "Pricing",







            "nav.faq": "FAQ",







            "nav.login": "Sign In",







            "nav.trial_btn": "7 Days Free",







            "nav.my_journal": "My Journal",







            "nav.logout": "Sign Out",







            "nav.mode_real": "Live Account",







            "nav.mode_backtesting": "Backtesting",







            "nav.mode_real_title": "Live Accounts",







            "nav.mode_backtesting_title": "Backtest Sessions",







            "nav.pro_dashboard": "PRO DASHBOARD",







            "nav.user_connected": "Connected user",







            "nav.trial_active": "Trial Active",







            "nav.trial_days": "7-day Trial",







            "btn.new_account": "New Account",







            "btn.new_session": "New Session",















            // Toolbar Fila 2







            "toolbar.theme_toggle": "Switch between light and dark theme",
        "theme.toggle_title": "Toggle theme",
        "metrics.title": "Metrics",







            "toolbar.backup_folder": "JSON Folder",







            "toolbar.export": "Export",







            "toolbar.export_json": "Backup (JSON)",







            "toolbar.export_csv": "Excel Data (CSV)",







            "toolbar.import": "Import",







            "toolbar.guide": "Guide",







            "toolbar.tour_general": "General Tour",







            "toolbar.tour_general_desc": "Walkthrough of dashboard tabs",







            "toolbar.trade_lifecycle": "Entry & Post-Analysis",







            "toolbar.trade_lifecycle_desc": "How to log entry and update at exit",







            "toolbar.video_tutorials": "Video Tutorials",







            "toolbar.video_tutorials_desc": "Official YouTube Channel (@tradingjournalpro)",







            "toolbar.calculator": "Calculator",







            "toolbar.reset_env": "Reset Environment",







            "toolbar.sync_status": "Synced",







            "toolbar.subscription": "Subscription",















            // Main Tabs (App)







            "tabs.accounts": "Your Accounts",







            "tabs.sessions": "Your Sessions",







            "tabs.balance_history": "Balance History",







            "tabs.dashboard": "Dashboard & Metrics",







            "tabs.goals": "Goals",







            "tabs.journal": "Trade Journal",







            "tabs.monthly": "Monthly Performance",







            "tabs.calendar": "Daily Calendar",







            "tabs.gallery": "Gallery & Analysis",







            "tabs.new_trade": "New Trade",







            "tabs.global_trade": "Multi Entry",







            "tabs.global_metrics": "Global Metrics",







            "btn.edit_last_multi": "Edit last multi entry",







            "btn.account_groups": "Groups",







            "btn.edit_group": "Edit group",







            "btn.load_balances": "Load balances",







            "btn.view_balances": "View balances",















            // Metrics & Dashboard Cards







            "metrics.initial_balance": "Initial Bal:",







            "metrics.actual_balance": "Current (Optional):",







            "metrics.filter_period": "Period Filter:",







            "metrics.period_all": "All (Full History)",







            "metrics.period_year": "By Year",







            "metrics.period_month": "By Month",







            "metrics.period_week": "By Week",







            "metrics.period_custom": "Custom",







            "metrics.total_return": "TOTAL RETURN",







            "metrics.win_rate": "WIN RATE",







            "metrics.max_drawdown": "MAX DRAWDOWN",







            "metrics.best_worst_trade": "BEST / WORST TRADE",







            "metrics.best": "Best:",







            "metrics.worst": "Worst:",







            "metrics.account_growth": "Equity Curve Growth ($)",







            "metrics.accumulated_return": "Cumulative Return (%)",







            "metrics.goals_distribution": "Goals & Distribution",







            "metrics.operations": "Trades",







            "metrics.profit_factor": "Profit factor",







            "metrics.avg_rr": "Avg R:R",







            "metrics.distribution": "Distribution",







            "metrics.wins": "Wins",







            "metrics.be": "BE",







            "metrics.losses": "Losses",







            "metrics.trades_count": "Trades",







            "metrics.win_loss_be": "Wins / Losses / BE",







            "metrics.effectiveness_by_session": "Win Rate by Session",







            "metrics.effectiveness_by_bias": "Win Rate by Bias",







            "metrics.effectiveness_by_pair": "Win Rate by Pair",







            "metrics.trades_by_day": "Trades by Day of Week",















            // Prop Firm Simulation Rules







            "funding.title": "Prop firm simulation",







            "funding.phase": "Phase",







            "funding.phase_balance": "PHASE BALANCE",







            "funding.profit_target": "PROFIT TARGET",







            "funding.daily_drawdown": "DAILY DRAWDOWN",







            "funding.max_drawdown": "MAX DRAWDOWN (STATIC)",







            "funding.trading_days": "TRADING DAYS",







            "funding.profitable_days": "PROFITABLE DAYS",







            "funding.phase_progress": "PHASE PROGRESS",







            "funding.no_phase_passed": "No phases passed yet.",







            "funding.daily_limit": "Daily limit",







            "funding.max_limit": "Balance limit",







            "funding.remaining": "Remaining",







            "funding.days_min": "min days",







            "prop.phase_balance": "Phase balance",







            "prop.profit_target": "Profit target",







            "prop.withdrawable_profit": "Withdrawable profit",







            "prop.daily_drawdown": "Daily drawdown",







            "prop.max_drawdown": "Maximum drawdown",







            "prop.trading_days": "Trading days",







            "prop.profitable_days": "Profitable days",







            "prop.burned_account": "Account breached",







            "prop.funded": "Funded",







            "prop.last_traded_day": "Last traded day",







            "prop.no_trades_phase": "No trades in this phase",







            "prop.target_amount": "of",







            "prop.remaining_days": "Remaining",















            // Calendars







            "calendar.period": "Period",







            "calendar.month": "Month",







            "calendar.year": "Year",







            "calendar.prev": "< Prev",







            "calendar.next": "Next >",







            "calendar.weeks": "Weeks",







            "calendar.week": "Week",







            "calendar.today": "Today",







            "calendar.no_trades_month": "No trades this month",







            "calendar.return": "Return",







            "calendar.ops": "trades",







            "calendar.best_day": "Best day",







            "calendar.best_trade": "Best trade",







            "calendar.no_trades": "No trades",







            "calendar.month_be": "BE Month",















            // Trades Table







            "table.title": "Trade History Log",







            "table.filters": "Filters:",







            "table.filter_all_time": "All Time",







            "table.filter_by_year": "By Year",







            "table.filter_by_month": "By Month",







            "table.filter_by_week": "By Week",







            "table.filter_all_states": "All States",







            "table.filter_all_sessions": "All Sessions",







            "table.filter_all_pairs": "All Assets",







            "table.search_placeholder": "Search notes or asset...",







            "table.col_date_time": "Date / Time",







            "table.col_date": "Date",







            "table.col_day": "Day",







            "table.col_pair": "Asset",







            "table.col_session": "Session",







            "table.col_trend": "Trend",







            "table.col_sl_tp": "Pips SL / TP",







            "table.col_order": "Order Type",







            "table.col_rr": "RR Ratio",







            "table.col_risk": "Risk",







            "table.col_status": "Status",







            "table.col_result": "Outcome (%)",







            "table.col_acum": "Cumulative",







            "table.col_balance": "Balance (P/L)",







            "table.col_view_gallery": "View Gallery",







            "table.col_actions": "Actions",







            "table.btn_new": "+ Log Trade",















            // Trade Entry Modal







            "modal_trade.title_new": "Log New Trade",







            "modal_trade.title_edit": "Edit Trade",







            "modal_trade.pair_label": "Asset / Pair",







            "modal_trade.type_label": "Order Type",







            "modal_trade.date_label": "Date",







            "modal_trade.time_label": "Time",







            "modal_trade.status_label": "Outcome / Status",







            "modal_trade.status_win": "Win",







            "modal_trade.status_loss": "Loss",







            "modal_trade.status_be": "Breakeven",







            "modal_trade.rr_label": "R:R Ratio",







            "modal_trade.risk_pct": "Risk (%)",







            "modal_trade.lot_label": "Position Lot Size",







            "modal_trade.partial_result": "Net Profit ($ / %)",







            "modal_trade.session_label": "Trading Session",







            "modal_trade.session_asia": "Asia",







            "modal_trade.session_london": "London",







            "modal_trade.session_ny": "New York",







            "modal_trade.trend_label": "Bias / Trend",







            "modal_trade.notes_before": "Pre-Trade Notes & Analysis",







            "modal_trade.notes_after": "Post-Trade Management & Takeaways",







            "modal_trade.screenshot_before": "BEFORE Entry Screenshot",







            "modal_trade.screenshot_after": "AFTER Close Screenshot",







            "modal_trade.btn_save": "Save Trade",















            // Landing Page (index.html)







            "hero.badge": "Cloud Pro Journal · Backtesting Pro & Prop Firm Audit",







            "hero.title": "Master your trading with a professional cloud journal",







            "hero.subtitle": "Surgical precision metrics, advanced Backtesting Pro lab, strict daily drawdown control for prop firms, and advanced lot size calculator.",







            "hero.cta_start": "Start 7-Day Free Trial",







            "hero.cta_explore": "Explore Backtesting Pro",







            "hero.trust_trial": "7 days free ($0 today)",







            "hero.trust_lab": "Backtesting Pro Lab",







            "hero.trust_payments": "Cards (Global/Latam) & USDT (NOWPayments)",















            // Showcase Demo Landing







            "showcase.tab1": "1. Dashboard & Metrics",







            "showcase.tab2": "2. Trade Journal",







            "showcase.tab3": "3. Monthly Performance",







            "showcase.tab4": "4. Prop Firm Audit",







            "showcase.phase1": "1. Blind - Chaos",







            "showcase.phase2": "2. 15 Trades - Filters",







            "showcase.phase3": "3. Pro Journal - Consistency",







            "showcase.simulate_trade": "Simulate Trade (+1.8%)",







            "showcase.auto_btn": "Auto",







            "showcase.current_balance": "Current Balance",







            "showcase.return_badge": "+4.85% Return",







            "showcase.profit_factor_label": "Profit Factor",







            "showcase.win_rate_label": "Win Rate: 68.4%",







            "showcase.drawdown_max_label": "Max Drawdown",







            "showcase.drawdown_limit": "Limit: -5.0%",







            "showcase.avg_rr_label": "Avg R:R Ratio",







            "showcase.expected_value": "Positive Expectancy",







            "showcase.growth_curve": "Capital Growth Curve",







            "showcase.net_profit_badge": "+$4,850.00 Net Profit",







            "showcase.goal_reached_badge": "Phase 1 Target: 48.5% reached",















            // Pricing Landing







            "pricing.badge": "Simple & Transparent Pricing",







            "pricing.title": "One Single Plan With Everything Unlocked",







            "pricing.subtitle": "No artificial limits or locked features. Pick your billing period and save up to 30%. All plans include a 7-day free trial ($0 today).",







            "pricing.tab_1month": "Monthly",







            "pricing.tab_3months": "Quarterly",







            "pricing.tab_12months": "Annual",







            "pricing.plan_badge": "UNLIMITED PRO MEMBERSHIP",







            "pricing.per_month": "/ month",







            "pricing.billed_monthly": "Billed monthly",







            "pricing.billed_quarterly": "Billed $48 every 3 months",







            "pricing.billed_annually": "Billed $156 per year",







            "pricing.f1": "Unlimited Live & Prop Firm Accounts",







            "pricing.f2": "Backtesting Pro Lab with prop firm evaluation audit",







            "pricing.f3": "Unlimited trade logging & real-time analytics",







            "pricing.f4": "Strict Drawdown Guard & Prop Firm Rule Tracking",







            "pricing.f5": "Full Pro Position Size Calculator",







            "pricing.f6": "Interactive calendar & equity curve",







            "pricing.f7": "Unlimited cloud screenshot storage",







            "pricing.f8": "Real-time cloud sync with Supabase",







            "pricing.cta": "Start 7-Day Trial",







            "pricing.guarantee_trial": "$0 today · Cancel anytime",







            "pricing.badge_popular": "⭐ Most Popular · -15%",







            "pricing.badge_best_value": "🚀 Best Value · -30%",















            // FAQ Landing







            "faq.subtitle": "Got Questions?",







            "faq.title": "Frequently Asked Questions",















            // Footer Landing







            "footer.tagline": "· Cloud Analytics Suite",







            "footer.community_title": "Official Channels & Community:",







            "footer.terms": "Terms of Service",







            "footer.privacy": "Privacy Policy",







            "footer.refund": "Refund & Cancellation Policy",







            "footer.disclaimer": "Financial Risk Disclaimer",







            "footer.contact": "Contact:",







            "footer.risk_note_bold": "Financial Risk Disclaimer:",















            // Funding Chips







            "chip.phase_singular": "phase",







            "chip.phase_plural": "phases",







            "chip.target_f1": "Target F1",







            "chip.daily_dd": "Daily DD",







            "chip.no_daily_dd": "No daily DD",







            "chip.monthly_dd": "Monthly DD",







            "chip.max_dd": "Max DD",







            "chip.no_max_dd": "No max DD",







            "chip.static": "static",







            "chip.risk_per_trade": "Risk/trade",







            "chip.min_days": "Min.",







            "chip.days": "days",







            "chip.min_profit_days": "Min.",







            "chip.profitable_days": "profitable days",







            "chip.consistency": "Consistency",







            // Funding Panel Extra







            "funding.margin": "Margin",







            "funding.req_met": "Requirement met",







            "funding.best_day_label": "Best day",







            "funding.max_allowed": "max allowed",







            "funding.of_profit": "of profit",







            "funding.in_this_attempt": "in this attempt",







            "funding.phase_passed": "passed",







            "prop.monthly_drawdown": "Monthly drawdown",







            "prop.your_split": "Your share",







            // Monthly Performance Extra







            "metrics.win_rate_short": "Win Rate",







            "metrics.goals_reached": "Goals reached",







            "monthly.best_session": "Best session",







            "monthly.effectiveness_short": "win rate",







            "monthly.closed_trades": "closed trades",







            // Gallery







            "gallery.title": "Visual Journal & Technical Analysis",







            "gallery.click_hint": "Click any image to view it fullscreen",







            // Balance History







            "balance.title": "Live balance tracking",







            "balance.description": "Each entry saves a snapshot of balances and their variation from the initial balance.",







            // Banner







            "banner.readonly": "Your 7-day trial has ended. Your account is in Read-Only Mode. Your data is safe.",







            "banner.renew": "Renew Pro Access",







            // Calendar nav short







            "calendar.prev_short": "Prev",







            "calendar.next_short": "Next",







            // Misc







            "btn.new_group": "New group",















            // Modal Session / Account







            "modal_session.title_new_real": "Create New Account",







            "modal_session.title_new_bt": "Create Backtest Session",







            "modal_session.title_edit_real": "Edit Account",







            "modal_session.title_edit_bt": "Edit Session",







            "modal_session.name": "Name (Identifier)",







            "modal_session.pair": "Session Asset / Pair",







            "modal_session.pair_hint": "This asset remains fixed for all trades in this session.",







            "modal_session.start_date": "Start Date",







            "modal_session.initial_balance": "Initial Balance ($)",







            "modal_session.actual_balance": "Current Balance / Close (Optional)",







            "modal_session.account_type": "Account Type",







            "modal_session.type_real": "Live Account (own capital)",







            "modal_session.type_challenge": "Evaluation (Challenge)",







            "modal_session.type_funded": "Funded",







            "modal_session.type_instant": "Instant Funding",







            "modal_session.session_type": "Session Type",







            "modal_session.free_trading": "Free Trading",







            "modal_session.funding_sim": "Prop Firm Simulation",







            "modal_session.rules_title": "Challenge Rules",







            "modal_session.phases": "Phases",







            "modal_session.phase_1": "1 phase",







            "modal_session.phase_2": "2 phases",







            "modal_session.profit_split": "Funded profit split (%)",







            "modal_session.target_f1": "Phase 1 Target (%)",







            "modal_session.target_f2": "Phase 2 Target (%)",







            "modal_session.daily_dd": "Daily Drawdown (%)",







            "modal_session.monthly_dd": "Monthly Drawdown (%)",







            "modal_session.max_dd": "Maximum Drawdown (%)",







            "modal_session.risk_per_trade": "Risk per trade limit (%)",







            "modal_session.dd_type": "Max DD Type",







            "modal_session.dd_static": "Static",







            "modal_session.dd_trailing": "Trailing",







            "modal_session.min_trading_days": "Min Trading Days",







            "modal_session.min_profitable_days": "Min Profitable Days",







            "modal_session.consistency_rule": "Consistency Rule",







            "modal_session.consistency_hint": "best day ≤",







            "modal_session.consistency_sub": "% of profit",







            "modal_session.btn_create": "Create",







            "modal_session.btn_save": "Save Changes",















            // Modal Trade extra







            "modal_trade.pips_sl": "SL Pips",







            "modal_trade.pips_tp": "TP Pips",







            "modal_trade.lot_calc": "Estimated Lot Size (Auto)",







            "modal_trade.lot_help": "Estimate; pip value may vary depending on broker.",







            "modal_trade.upload_before": "Upload BEFORE Screenshot(s)",







            "modal_trade.upload_after": "Upload AFTER Screenshot(s)",







            "modal_trade.link_before": "Link (Before)",







            "modal_trade.link_after": "Link (After)",







            "modal_trade.ctrl_v": "(or paste with Ctrl+V)",







            "modal_trade.guide_badge": "Before / After Guide",















            // Modal Reset







            "modal_reset.title": "Reset Environment",







            "modal_reset.desc": "You are about to delete all data in the current environment. It is recommended to export a JSON backup before proceeding.",







            "modal_reset.backup_and_reset": "Backup (JSON) & Reset",







            "modal_reset.delete_all": "Wipe All & Start Fresh",















            // Modal Pair Manager







            "modal_pair.title": "Manage Assets / Pairs",















            // Modal Balance







            "modal_balance.title": "Load Live Balances",







            "modal_balance.hint": "Update the current balance of each account here. Saving updates accounts and logs a historical snapshot.",







            "modal_balance.date": "Record Date",







            "modal_balance.apply_current": "Also apply these balances to Current Balance of accounts",







            "modal_balance.save_and_log": "Save & Record",















            // Modal Withdrawal







            "modal_withdrawal.title": "Log Withdrawal",







            "modal_withdrawal.amount": "Amount ($)",







            "modal_withdrawal.date": "Withdrawal Date",







            "modal_withdrawal.btn_save": "Save Withdrawal",















            // Modal Account Group







            "modal_group.title_new": "New Account Group",







            "modal_group.title_edit": "Edit Account Group",







            "modal_group.name": "Group Name",







            "modal_group.icon": "Icon",







            "modal_group.select_accounts": "Select Accounts",















            // Account Stages







            "stage.real": "Live Account",







            "stage.challenge": "Evaluation",







            "stage.funded": "Funded",







            "stage.instant": "Instant",















            // Account Cards







            "card.account_settings": "Account settings",







            "card.session_settings": "Session settings",







            "card.start": "Start",







            "card.effective_bal": "Effective bal",







            "card.stage": "Stage",







            "card.start_btn": "Start",







            "card.new_entry": "New trade",







            "card.metrics": "Metrics",







            "card.accounts_count": "accounts",







            "card.account_count_single": "account",







            "card.view_accounts": "View accounts",







            "card.no_assigned_accounts": "No assigned accounts",















            // Goals Panel







            "goals.configure": "Set Goal",







            "goals.log_withdrawal": "Log Withdrawal",







            "goals.advance_phase2": "Advance to Phase 2",







            "goals.advance_funded": "Advance to Funded",







            "goals.reached": "Reached!",







            "goals.met": "Completed!",







            "goals.personal_goal": "Personal Goal",







            "goals.your_share": "Withdrawable Share",







            "goals.next_withdrawal": "Next Withdrawal",







            "goals.ready_to_withdraw": "Ready to withdraw",







            "goals.total_withdrawn": "Total Withdrawn",







            "goals.registered_withdrawals": "Logged Withdrawals",







            "goals.withdrawable": "Withdrawable",















            // Daily Analysis Modal







            "daily.analysis_before": "Analysis BEFORE Entry",







            "daily.no_notes_before": "No notes logged before entry.",







            "daily.analysis_after": "Analysis AFTER Close",







            "daily.no_notes_after": "No notes logged after close.",







            "daily.total_day": "Day Total",







            "daily.operations_recorded": "Logged Trades",















            // Gallery







            "gallery.open_chart": "Open Chart",







            "gallery.open_chart_tv": "Open Chart in TradingView",







            "gallery.edit_comment": "Edit Comment",







            "gallery.add_comment": "Add Comment",







            "gallery.no_comment": "No comments yet.",







            "gallery.write_comment": "Write your comment...",







            "gallery.no_trades": "No trades logged with analysis yet.",















            // Metrics extra







            "metrics.no_trades_period": "No trades in this period",







            "metrics.fixed_session_pair": "Fixed Session Asset",







            "metrics.bt_pair": "Backtest Asset",







            "footer.risk_note": "Trading Journal Pro is a software technology platform for personal trade journaling and analytics. It does not provide financial advice, fund management, trading signals, or investment recommendations. Trading financial assets, Forex, futures, and prop firm accounts carries substantial risk of capital loss and is not suitable for all investors. All rights reserved © 2026 Trading Journal Pro.",















            // ==========================================







            // POSITION SIZE CALCULATOR PRO (calc.*)







            // ==========================================







            "calc.back_to_journal": "Back to Journal",







            "calc.title": "Calculator",







            "calc.lot_calculator": "Lot Calculator",







            "calc.pro": "Pro",







            "calc.rates_loading": "Loading exchange rates...",







            "calc.rates_live": "Live rates: 100% accurate cross-currency",







            "calc.rates_offline": "Offline mode - 1:1 cross rates",







            "calc.instrument": "Instrument",







            "calc.account_currency": "Account Currency",







            "calc.balance": "Balance",







            "calc.risk_pct": "Risk (%)",







            "calc.stop_loss": "Stop Loss",







            "calc.suggested_lot": "Suggested Lot Size",







            "calc.risk_at_risk": "at risk",







            "calc.copy_lot": "Copy Lot Size",







            "calc.save_setup": "Save Setup",







            "calc.quick_title": "Quick Setup Calculation",







            "calc.quick_desc": "Enter pips and select setups to calculate",







            "calc.select_all": "Select All",







            "calc.select_none": "None",







            "calc.clear_copied": "Clear Copied",







            "calc.toggle_hide": "Hide calculator",







            "calc.toggle_show": "Show calculator",







            "calc.save_modal_title": "Save Setup",







            "calc.setup_name": "Setup Name",







            "calc.setup_name_ph": "e.g. My Funded 100k",







            "calc.group": "Group",







            "calc.group_ph": "e.g. FTMO Accounts",







            "calc.gold_modal_title": "Pips on XAUUSD",







            "calc.gold_modal_desc": "The chart measurement tool shows the last digit 10x higher. <b class=\"text-white\">Divide by 10</b> before entering.",







            "calc.gold_tool_marks": "The tool displays",







            "calc.gold_enter_calc": "Enter into calculator",







            "calc.gold_dont_show": "Don't show this message again",







            "calc.understood": "Got it",







            "calc.no_setups": "No saved setups",







            "calc.define_balance_first": "Define balance and risk first",







            "calc.name_setup_first": "Please name the setup",







            "calc.copied": "Copied!",







            "calc.copy_action": "COPY",







            "calc.points": "Points",







            "calc.forex_majors": "Forex Majors",







            "calc.forex_crosses": "Forex Crosses",







            "calc.metals": "Metals",







            "calc.indices": "Indices",







            "calc.crypto": "Crypto",







            "calc.gold": "XAUUSD (GOLD)",







            "calc.silver": "XAGUSD (SILVER)",







            "calc.dow": "US30 (DOW JONES)",







            "calc.nasdaq": "NAS100 (NASDAQ)",







            "calc.dax": "GER40 (DAX)",







            "calc.bitcoin": "BTCUSD (BITCOIN)",







            "calc.ethereum": "ETHUSD (ETHEREUM)",















            // ==========================================







            // INTERACTIVE TOURS (tour.*)







            // ==========================================







            "tour.step_counter": "Step {0} of {1}",







            "tour.next": "Next",







            "tour.prev": "Back",







            "tour.finish": "Get Started!",







            "tour.skip": "Skip",







            "tour.dont_show": "Don't show this guide again",







            "tour.step1_title": "Your Accounts & Funding Goals",







            "tour.step1_desc": "Manage your real accounts or prop firm evaluations here. Configure consistency rules, daily loss limits, and automatic phase 1 & 2 targets with one-click advance.",







            "tour.step2_title": "Smart Trade Journaling",







            "tour.step2_desc": "Click here to log your trades. The Journal automatically calculates the exact lot size based on your risk percentage and lets you attach before & after chart screenshots.",







            "tour.step3_title": "Statistics & Equity Curve",







            "tour.step3_desc": "Analyze your performance with live key metrics: Win Rate, Profit Factor, actual Risk/Reward ratio, and interactive balance & equity curve charts.",







            "tour.step4_title": "Calendar & Operational Consistency",







            "tour.step4_desc": "Visualize daily results on a financial heatmap. Identify your best trading sessions and maintain month-over-month consistency control.",







            "tour.form_step_counter": "Form: {0} of {1}",







            "tour.form_step1_title": "1. Asset & Position Sizing",







            "tour.form_step1_desc": "Select the pair and set Stop Loss and Take Profit pips. The Journal calculates the R:R ratio and exact lot size for your assigned risk.",







            "tour.form_step2_title": "2. Chart Screenshot & Analysis (BEFORE)",







            "tour.form_step2_desc": "Document your technical thesis before entry. Press Ctrl+V anywhere on the screen to instantly paste your chart screenshot.",







            "tour.form_step3_title": "3. Initial & Closing Status",







            "tour.form_step3_desc": "When placing the order set it to 'Pending' or 'Active'. Once concluded, change it here to 'Full TP', 'SL', 'BE', or 'Partial'.",







            "tour.form_step4_title": "4. Final Screenshot & Analysis (AFTER)",







            "tour.form_step4_desc": "When closing the trade, click 'Edit' in the journal table and log your key takeaways and final chart outcome.",















            // ==========================================







            // TRADE LIFECYCLE GUIDE MODAL (lifecycle.*)







            // ==========================================







            "lifecycle.header_title": "Trade Lifecycle: Entry & Post-Analysis",







            "lifecycle.header_subtitle": "Step-by-step practical guide to documenting your trades like an institutional pro",







            "lifecycle.tab1": "Entry (Before)",







            "lifecycle.tab2": "During the Trade",







            "lifecycle.tab3": "Close & Edit (After)",







            "lifecycle.step1_badge": "Timing: When placing or planning the order",







            "lifecycle.step1_badge_desc": "Log the trade right before market entry to document your technical hypothesis free of emotional bias.",







            "lifecycle.step1_risk_title": "1. Risk & Position Sizing Data",







            "lifecycle.step1_risk_desc": "Enter the <strong>Asset</strong>, <strong>Stop Loss</strong> and <strong>Take Profit</strong> pips, and your <strong>Risk (%)</strong>. The Journal instantly calculates your <strong>R:R</strong> ratio and exact recommended <strong>Lot Size</strong> to prevent over-leveraging.",







            "lifecycle.step1_status_title": "2. Initial Status",







            "lifecycle.step1_status_desc": "Select <span class=\"px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50 font-semibold\">Pending</span> if it's a Limit/Stop pending order, or <span class=\"px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50 font-semibold\">Active</span> if executed at market.",







            "lifecycle.step1_analysis_title": "3. Screenshot & Analysis (BEFORE)",







            "lifecycle.step1_analysis_desc": "In the left card <strong>\"Screenshot & Analysis (BEFORE)\"</strong>:",







            "lifecycle.step1_analysis_li1": "<strong class=\"text-gray-200\">Before Notes:</strong> Write your thesis (higher timeframe trend, support/resistance, liquidity, entry trigger).",







            "lifecycle.step1_analysis_li2": "<strong class=\"text-gray-200\">Screenshot:</strong> In TradingView press <kbd class=\"px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[11px] text-gray-200\">Alt+S</kbd> (or copy image) and in the Journal press <kbd class=\"px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[11px] text-gray-200\">Ctrl+V</kbd> to paste it instantly.",







            "lifecycle.step1_analysis_li3": "Save the trade by clicking <span class=\"font-bold text-emerald-400\">Save Trade</span>.",







            "lifecycle.step2_badge": "Timing: While the trade is active in the market",







            "lifecycle.step2_badge_desc": "The trade is safely stored and visible in your Trades table without affecting final metrics until closed.",







            "lifecycle.step2_table_title": "View in Trades Table",







            "lifecycle.step2_table_desc": "In the <strong>Trades</strong> tab, your trade is shown with a status chip (<span class=\"text-amber-400 font-semibold\">Active</span> or <span class=\"text-blue-400 font-semibold\">Pending</span>). The result column stays neutral until closed.",







            "lifecycle.step2_psych_title": "Psychological Discipline",







            "lifecycle.step2_psych_desc": "Having the entry logged with its prior chart allows you to step away from screens and let your plan play out without micro-managing out of impulse or fear.",







            "lifecycle.step3_badge": "Timing: Upon trade closing (TP, SL or Manual Exit)",







            "lifecycle.step3_badge_desc": "This is the most critical phase for growth: editing the trade to grade the outcome and log valuable feedback.",







            "lifecycle.step3_edit_title": "1. Go to Trades and click Edit",







            "lifecycle.step3_edit_desc": "Navigate to the <strong>Trades</strong> tab, locate the closed trade row, and click the edit button <span class=\"px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 rounded font-semibold\"><i class=\"fa-solid fa-pen-to-square mr-1\"></i>Edit</span>. The form opens pre-filled with all previous data.",







            "lifecycle.step3_status_title": "2. Update Closing Status",







            "lifecycle.step3_status_desc": "Change the <strong>Status</strong> dropdown to:",







            "lifecycle.step3_status_tp": "<strong class=\"text-emerald-400\">Full TP:</strong> Win (adds the full profit based on R:R).",







            "lifecycle.step3_status_sl": "<strong class=\"text-red-400\">SL:</strong> Controlled loss (deducts the assumed risk).",







            "lifecycle.step3_status_be": "<strong class=\"text-gray-400\">BE:</strong> Breakeven (0% impact).",







            "lifecycle.step3_status_partial": "<strong class=\"text-teal-400\">Partial:</strong> Partial take profit (specify actual % gained).",







            "lifecycle.step3_status_manual": "<strong class=\"text-amber-400\">Manual Exit:</strong> Early discretionary closure.",







            "lifecycle.step3_after_title": "3. Screenshot & Analysis (AFTER)",







            "lifecycle.step3_after_desc": "In the right card <strong>\"Screenshot & Analysis (AFTER)\"</strong>:",







            "lifecycle.step3_after_li1": "<strong>After Notes:</strong> What did you learn? Did you follow your rules? Did you experience FOMO?",







            "lifecycle.step3_after_li2": "<strong>Final Screenshot:</strong> Press <kbd class=\"px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px]\">Ctrl+V</kbd> to paste the chart showing how price played out.",







            "lifecycle.step3_footer_tip": "When you click \"Save\", your Win Rate, Profit Factor, Equity Curve, and Monthly Calendar update automatically.",







            "lifecycle.btn_spotlight": "View in Form (Spotlight)",







            "lifecycle.dont_show": "Do not show automatically",







            "lifecycle.btn_prev": "Back",







            "lifecycle.btn_next": "Next",















            // ==========================================







            // CHECKOUT AND SUBSCRIPTION (checkout.*)







            // ==========================================







            "checkout.title": "Unlimited Pro Membership",







            "checkout.subtitle": "Unlock all features, unlimited accounts, and automated cloud backup",







            "checkout.sandbox_active": "Sandbox Mode Active",







            "checkout.month_1": "1 Month",







            "checkout.month_3": "3 Months",







            "checkout.month_12": "12 Months",







            "checkout.badge_discount_15": "-15%",







            "checkout.badge_discount_30": "-30%",







            "checkout.period_month_label": "per 1 Month",







            "checkout.period_quarter_label": "per 3 Months",







            "checkout.period_year_label": "per 12 Months",







            "checkout.trial_desc": "7-day free trial ($0 charged today if first time)",







            "checkout.pay_card": "Pay with Card (Visa, Mastercard, Apple Pay)",







            "checkout.pay_crypto": "Pay with Crypto (USDT / Crypto)",







            "checkout.card_sandbox_title": "Lemon Squeezy Checkout Simulation (Sandbox)",







            "checkout.card_sandbox_desc": "Test subscription flow without a real card. Your account updates to Pro immediately:",







            "checkout.sim_card": "Simulated Card:",







            "checkout.plan_amount": "Plan Amount:",







            "checkout.sim_success_btn": "Simulate Successful Payment",







            "checkout.crypto_invoice_title": "USDT / USDC Transfer",







            "checkout.crypto_instruction": "Send the exact amount to one of our official wallets:",







            "checkout.crypto_note": "Upon transfer confirmation on network, your account activates automatically. You can also send the transaction hash to support.",







            "checkout.crypto_sim_btn": "Simulate Transfer Confirmation (TxHash OK)",







            "checkout.security_badge": "🔒 100% secure encrypted payments. Cancel anytime with a single click.",







            "checkout.test_tools": "Testing Tools:",







            "checkout.sim_expired": "Simulate Expired Trial",







            "checkout.restore_trial": "Reset to 7-Day Trial",















            // ==========================================







            // CELEBRATION MODALS (celebrate.*)







            // ==========================================







            "celebrate.sub_title": "Pro Membership Activated!",







            "celebrate.sub_desc": "Your account has been upgraded with full access and continuous cloud synchronization.",







            "celebrate.plan_acquired": "Acquired Plan:",







            "celebrate.valid_until": "Valid until:",







            "celebrate.active_no_limits": "Active (No restrictions)",







            "celebrate.continue_btn": "Got it, Continue to My Journal",















            // ==========================================







            // METATRADER 5 BRIDGE (mt5.*)







            // ==========================================







            "mt5.modal_title": "MetaTrader 5 Bridge",







            "mt5.modal_desc": "Read-only: MT5 automatically syncs pair, order type, entry price, SL/TP, lot size, risk, R:R and status. You complete the trade analysis and Before screenshots. It never executes orders and works without an active bridge.",







            "mt5.bridge_status": "Bridge Status",







            "mt5.bridge_offline": "Disconnected",







            "mt5.bridge_online": "Connected",







            "mt5.download_ea": "Download Expert Advisor (EA)",







            "mt5.copy_token": "Copy Token",















            // ==========================================







            // FREQUENTLY ASKED QUESTIONS (faq.*)







            // ==========================================







            "faq.q1": "How does the 7-day card free trial work?",







            "faq.a1": "To activate your trial, securely register your card via Lemon Squeezy (global MoR with 256-bit bank-grade SSL encryption). You are charged $0.00 USD today. You get 7 full days to test the platform, and if you don't wish to continue, you can cancel with one click from your dashboard before the trial ends at zero cost.",







            "faq.q2": "How do Crypto payments (USDT / USDC) work?",







            "faq.a2": "We process cryptocurrencies instantly via the NOWPayments gateway. You can pay with USDT (TRON, Binance Smart Chain, Polygon, or Solana networks), Bitcoin, or Ethereum with minimal network fees and no intermediaries.",







            "faq.q3": "Does the Backtesting Lab run automated simulations with market data or is it for logging manual tests?",







            "faq.a3": "<strong>It is a specialized journal to record, audit, and document your manual backtesting sessions</strong> (for instance, those run on your chart simulator). As you log trades, the platform audits in real time whether you adhere to prop firm rules (daily loss limits, maximum drawdown, consistency) and projects your account Profit Split with the payout simulator. <em>The cloud-integrated automated historical market data engine is currently in active development and will arrive as an upcoming Pro update.</em>",







            "faq.q4": "What happens if my period expires and I don't renew immediately?",







            "faq.a4": "Your account automatically transitions to <strong>Read-Only Mode</strong>. You will never lose your trades, accounts, or saved history; you can continue reviewing all your analytics at any time and resume logging trades as soon as you reactivate your subscription.",















            // ==========================================







            // LANDING PAGE SECTIONS (landing.* & nav.*)







            // ==========================================







            "nav.features": "Features",







            "nav.backtesting": "Backtesting Pro",







            "nav.calculator": "Calculator Pro",







            "nav.funding": "Prop Firms",







            "nav.mt5": "MT5 Sync",







            "nav.pricing": "Pricing",







            "nav.faq": "FAQ",







            "nav.login": "Sign In",







            "nav.start_free": "Start Free",







            "nav.my_journal": "My Journal",















            "landing.hero_badge": "Cloud Analytics Suite · For Disciplined Traders",







            "landing.hero_title": "Master your trading with an institutional cloud journal",







            "landing.hero_desc": "Built for Forex, Futures, Crypto, and Prop Firm Traders. Audit your Win Rate, Drawdown, and Profit Factor with mathematical precision and instant cloud sync.",







            "landing.hero_cta_trial": "Start 7-Day Free Trial",







            "landing.hero_cta_calc": "Try Lot Calculator",







            "landing.hero_guarantee": "✓ 7 days free with no commitments · Cancel in 1 click · 256-bit SSL encryption",















            "landing.feat_badge": "DESIGNED BY TRADERS FOR TRADERS",







            "landing.feat_title": "Everything you need to reach consistent profitability",







            "landing.feat_subtitle": "Leave disorganized spreadsheets behind. Trading Journal Pro combines institutional analytics, prop firm audits, and risk management into a unified suite.",







            "landing.feat1_title": "Live Key Metrics",







            "landing.feat1_desc": "Win Rate, Profit Factor, Equity Curve, average R:R, and percentage return calculated automatically in real time.",







            "landing.feat2_title": "Prop Firm Audit",







            "landing.feat2_desc": "Monitor daily loss limits, maximum drawdown, and consistency rules across all your prop firm challenges.",







            "landing.feat3_title": "Backtesting Lab",







            "landing.feat3_desc": "Test and validate your historical strategies without risking real capital. Simulate market scenarios and refine your playbook.",







            "landing.feat4_title": "Position Size Calculator Pro",







            "landing.feat4_desc": "Calculate exact lot sizes in milliseconds for Forex, Indices, Crypto, and Metals with live cross-currency rates.",







            "landing.feat5_title": "Calendar & Performance Heatmap",







            "landing.feat5_desc": "Visualize results day by day, identify your top trading sessions, and maintain control over winning and losing streaks.",







            "landing.feat6_title": "Chart Gallery & Visual Review",







            "landing.feat6_desc": "Before and after chart screenshots for every trade with psychological and technical tags to learn from mistakes.",















            "landing.bt_badge": "VALIDATE YOUR EDGE BEFORE RISKING REAL CAPITAL",







            "landing.bt_title": "Institutional Backtesting Lab",







            "landing.bt_subtitle": "Design, backtest, and optimize your trading thesis with mathematical rigor. Document every test with comparative metrics against live performance.",







            "landing.bt_bullet1": "Paper trading and prop firm challenge simulation.",







            "landing.bt_bullet2": "Instant calculation of maximum drawdown and losing streaks.",







            "landing.bt_bullet3": "Direct comparison across strategies and timeframes.",







            "landing.bt_cta": "Explore Backtesting Lab",















            "landing.calc_badge": "INCLUDED IN PRO MEMBERSHIP · NOT SOLD SEPARATELY",







            "landing.calc_title": "Position Size & Lot Calculator",







            "landing.calc_subtitle": "Military-grade risk management in milliseconds. Pick the instrument, enter your Stop Loss pips, and get your suggested lot size with live currency conversion.",







            "landing.calc_cta": "Open Calculator Now",















            "landing.mt5_badge": "Upcoming Release · In Active Development",







            "landing.mt5_title": "Automated MetaTrader 5 Synchronization",







            "landing.mt5_desc": "Connect your MT5 terminal with our read-only EA. Your trades import automatically so you can focus 100% on post-analysis and chart reviews.",















            "landing.fondeo_badge": "Account Capital Protection",







            "landing.fondeo_title": "Specialized in Prop Firm Trading Rules",







            "landing.fondeo_desc": "Prop firms enforce strict rules that can cost your account on a single mistake. Our suite audits in real time:",







            "landing.fondeo_rule1": "Daily Loss Limit",







            "landing.fondeo_rule2": "Maximum Trailing / Static Drawdown",







            "landing.fondeo_rule3": "Daily consistency percentage rule",







            "landing.fondeo_rule4": "Phase 1 & Phase 2 profit targets with 1-click progression",















            "landing.footer_channels": "Official Channels & Community:",







            "landing.footer_terms": "Terms of Service",







            "landing.footer_privacy": "Privacy Policy",







            "landing.footer_refund": "Refund & Cancellation Policy",







            "landing.footer_disclaimer": "Financial Risk Disclaimer",







            "landing.footer_contact": "Contact:",







            "landing.legal_modal_title": "Legal Notices & Policies",







            "landing.legal_modal_subtitle": "Official contractual and regulatory documentation for Trading Journal Pro",







            "landing.legal_tab_terms": "Terms",







            "landing.legal_tab_privacy": "Privacy",







            "landing.legal_tab_refund": "Refunds",







            "landing.legal_tab_disclaimer": "Risk Disclaimer",







            "landing.legal_questions": "Legal inquiries? Email us at",

            // ==========================================

            // AUTHENTICATION & ACCOUNTS (auth.*)

            // ==========================================

            "auth.login_title": "Sign In",

            "auth.login_subtitle": "Access your Pro Journal in the cloud",

            "auth.email_label": "Email Address",

            "auth.email_placeholder": "you@email.com",

            "auth.password_label": "Password",

            "auth.password_placeholder": "••••••••",

            "auth.forgot_password": "Forgot password?",

            "auth.login_btn": "Sign In to My Journal",

            "auth.no_account": "Don't have an account yet?",

            "auth.start_free_trial": "Start your 7-day free trial",

            "auth.register_title": "Create Pro Account",

            "auth.register_subtitle": "7 days of full unrestricted access",

            "auth.name_label": "Full Name",

            "auth.name_placeholder": "e.g. Alex Trader",

            "auth.register_btn": "Start 7-Day Free Trial",

            "auth.has_account": "Already have an account?",

            "auth.forgot_title": "Reset Password",

            "auth.forgot_subtitle": "We will email you a secure password reset link",

            "auth.forgot_btn": "Send Reset Link",

            "auth.back_to_login": "Back to Sign In",



            // ==========================================

            // SHOWCASE & INTERACTIVE SIMULATOR (showcase.* & evo.*)

            // ==========================================

            "showcase.tab_metrics": "Dashboard & Metrics",

            "showcase.tab_trades": "Trade Journal",

            "showcase.tab_calendar": "Monthly Performance",

            "showcase.tab_funding": "Prop Firm Audit",

            "showcase.live_account_view": "app.tradingjournalpro.com — Funded Account View",

            "showcase.interactive_demo": "INTERACTIVE DEMO",

            "showcase.mobile_status": "Funded $100K • Live",

            "showcase.auto_demo_resume": "Resume Auto-Demo",

            "showcase.auto_demo_title": "Resume auto rotation",

            "evo.stage1": "1. Flying Blind",

            "evo.stage1_sub": "· Chaos",

            "evo.stage2": "2. 15 Trades",

            "evo.stage2_sub": "· Filters",

            "evo.stage3": "3. Pro Journal",

            "evo.stage3_sub": "· Consistency",

            "evo.sim_trade_btn": "Simulate Trade (+1.8%)",

            // ==========================================

            // GROUPS & REPLICATION (groups.*)

            // ==========================================

            "groups.modal_title": "New Account Group",

            "groups.name_label": "Group Name",

            "groups.name_ph": "e.g. Funding evaluation",

            "groups.icon_label": "Icon",

            "groups.icon_stacked": "Stacked Groups",

            "groups.icon_trial": "Evaluation Phase",

            "groups.icon_funded": "Funded",

            "groups.icon_instant": "Instant",

            "groups.icon_real": "Live Account",

            "groups.icon_prop": "Prop firm",

            "groups.icon_trading": "Trading",

            "groups.icon_challenge": "Challenge",

            "groups.accounts_label": "Group Accounts",

            "groups.accounts_note": "An account can belong to more than one group.",

            "groups.save_btn": "Save Group",

            "groups.choose_accounts": "Select Accounts",

            "groups.replicate_in": "Replicate trade into:",



            // ==========================================

            // TOASTS & CONFIRMATIONS (toast.* & confirm.*)

            // ==========================================

            "toast.success": "Operation completed successfully",

            "toast.trade_saved": "Trade saved successfully",

            "toast.trade_deleted": "Trade deleted",

            "toast.account_saved": "Account saved successfully",

            "toast.group_saved": "Group saved successfully",

            "toast.group_deleted": "Group deleted",

            "toast.copied": "Copied to clipboard",

            "confirm.delete_trade": "Are you sure you want to delete this trade?",

            "confirm.delete_account": "Are you sure you want to delete this account?",

            "confirm.delete_group": "Are you sure you want to delete this group?",
    
        // Comprehensive auto-localization keys (EN)
        "app_auto.por_a_o": "By Year",
        "app_auto.por_mes": "By Month",
        "app_auto.por_semana": "By Week",
        "app_auto.full_tp": "Full TP",
        "app_auto.parcial": "Partial",
        "app_auto.activa": "Active",
        "app_auto.cierre_manual": "Manual Close",
        "app_auto.pendiente": "Pending",
        "app_auto.sin_activar": "Untriggered",
        "app_auto.sin_sesi_n": "No Session",
        "app_auto.pre_londres": "Pre London",
        "app_auto.londres": "London",
        "app_auto.pre_new_york": "Pre New York",
        "app_auto.new_york": "New York",
        "app_auto.asia": "Asia",
        "app_auto.sin_clasificar_mt5": "Unclassified (MT5)",
        "app_auto.favor": "With Trend",
        "app_auto.contra": "Counter Trend",
        "app_auto.personalizado": "Custom…",
        "app_auto.1_fase_al_superarla_pasa_a_fondeada": "1 Phase (Advances to Funded upon completion)",
        "app_auto.2_fases": "2 Phases",
        "app_auto.balance_objetivo": "Target Balance ($)",
        "app_auto.retorno_objetivo": "Target Return (%)",
        "app_auto.del_balance": "% of balance",
        "app_auto.fijo_sobre_el_balance_inicial": "Fixed on Initial Balance",
        "app_auto.trailing_sobre_el_pico": "Trailing on Peak",
        "app_auto.login_mt5_opcional": "MT5 Login (optional)",
        "app_auto.n_mero_de_cuenta_que_aparece_en_mt5_si_l": "Account number shown in MT5. If left empty, the bridge will not sync trades from this account.",
        "app_auto.objetivo_de_beneficio": "Profit Target (%)",
        "app_auto.drawdown_m_ximo": "Max Drawdown (%)",
        "app_auto.fases_del_challenge": "Challenge Phases",
        "app_auto.objetivo_fase_2": "Phase 2 Target (%)",
        "app_auto.tipo_de_meta": "Goal Type",
        "app_auto.valor_de_la_meta": "Goal Value",
        "app_auto.tu_parte": "Your Profit Split (%)",
        "app_auto.colch_n_inicial": "Buffer (% of initial)",
        "app_auto.m_nimo_a_retirar": "Min Withdrawal",
        "app_auto.tipo_de_drawdown": "Drawdown Type",
        "app_auto.reglas_opcionales_de_la_cuenta": "Optional Account Rules",
        "app_auto.consistencia_m_ximo_por_d_a": "Consistency: Max % per day",
        "app_auto.d_as_m_nimos_de_trading": "Min Trading Days",
        "app_auto.d_as_rentables_m_nimos": "Min Profitable Days",
        "app_auto.l_mite_de_p_rdida_diaria": "Daily Loss Limit (%)",
        "app_auto.registrar_retiro": "Record Withdrawal",
        "app_auto.cuenta": "Account:",
        "app_auto.fecha": "Date",
        "app_auto.monto": "Amount ($)",
        "app_auto.descontar_del_balance_actual_de_la_cuent": "Deduct from Current Account Balance",
        "app_auto.desmarca_si_solo_quieres_anotarlo_en_el_": "Uncheck if you only want to log it in withdrawal history without altering balance.",
        "app_auto.m_s_tarde": "Later",
        "app_auto.continuar": "Continue",
        "app_auto.cuentas_del_grupo": "Group Accounts",
        "app_auto.una_cuenta_puede_pertenecer_a_m_s_de_un_": "An account can belong to more than one group.",
        "app_auto.guardar_grupo": "Save Group",
        "app_auto.elegir_cuentas": "Select Accounts",
        "app_auto.replicar_entrada_en": "Replicate Entry in:",
        "app_auto.todas": "All",
        "app_auto.ninguna": "None",
        "app_auto.aceptar_selecci_n": "Accept Selection",
        "app_auto.elegir_copias": "Choose Copies",
        "app_auto.aplicar_los_cambios_tambi_n_a": "Also Apply Changes to:",
        "app_auto.link_antes": "Link (Before)",
        "app_auto.subir_captura_s_antes": "Upload Screenshot(s) Before",
        "app_auto.o_pega_con_ctrl_v": "(or paste with Ctrl+V)",
        "app_auto.link_despu_s": "Link (After)",
        "app_auto.subir_captura_s_despu_s": "Upload Screenshot(s) After",
        "app_auto.est_s_a_punto_de_borrar": "You are about to delete",
        "app_auto.todos_los_datos": "all data",
        "app_auto.del_entorno_actual": "of the current environment (",
        "app_auto.se_recomienda_exportar_un_respaldo_en_fo": "). We recommend exporting a JSON backup before proceeding.",
        "app_auto.an_lisis_de_operaciones": "Trade Analysis",
        "app_auto.operaciones_registradas": "Logged trades",
        "app_auto.por_1_mes": "for 1 Month",
        "app_auto.7_d_as_de_prueba_0_cobrados_hoy_si_es_pr": "7-day trial ($0 charged today for first time)",
        "app_auto.simulaci_n_lemon_squeezy_checkout_sandbo": "Lemon Squeezy Checkout Simulation (Sandbox)",
        "app_auto.test_mode": "TEST MODE",
        "app_auto.prueba_el_flujo_de_suscripci_n_sin_tarje": "Test the subscription checkout without a real card. Your account will upgrade to Pro immediately:",
        "app_auto.tarjeta_simulada": "Simulated Card:",
        "app_auto.monto_del_plan": "Plan Amount:",
        "app_auto.simular_pago_exitoso": "Simulate Successful Payment",
        "app_auto.transferencia_usdt_usdc": "USDT / USDC Transfer",
        "app_auto.env_a_el_monto_exacto_a_una_de_nuestras_": "Send the exact amount to one of our official wallets:",
        "app_auto.red_tron_trc_20": "TRON Network (TRC-20)",
        "app_auto.copiar": "Copy",
        "app_auto.red_bsc_bep_20_binance": "BSC Network (BEP-20 / Binance)",
        "app_auto.tras_enviar_tu_transferencia_tu_cuenta_s": "After sending your transfer, your account activates automatically once confirmed on the blockchain. You can also provide the TxHash to support.",
        "app_auto.simular_confirmaci_n_de_transferencia_tx": "Simulate Transfer Confirmation (TxHash OK)",
        "app_auto.herramientas_de_prueba": "Testing Tools:",
        "app_auto.simular_prueba_vencida": "Simulate Expired Trial",
        "app_auto.restablecer_7_d_as": "Reset 7-Day Trial",
        "app_auto.1_mes_pro": "1 Month Pro",
        "app_auto.paso_1_de_4": "Step 1 of 4",
        "app_auto.tus_cuentas_de_trading": "Your Trading Accounts",
        "app_auto.aqu_administras_tus_cuentas_reales_o_eva": "Manage your live accounts or prop firm evaluations here. You can set consistency rules, daily drawdown limits, and phase 1 & 2 targets.",
        "app_auto.anterior": "Back",
        "app_auto.siguiente": "Next",
        "landing_auto.reanudar_auto_demo": "Resume Auto-Demo",
        "landing_auto.auto_11s": "AUTO 11s",
        "landing_auto.caos": "· Chaos",
        "landing_auto.filtros": "· Filters",
        "landing_auto.consistencia": "CONSISTENCY",
        "landing_auto.balance_neto": "Net Balance",
        "landing_auto.balance_actual": "Current Balance",
        "landing_auto.drawdown_m_x": "Max Drawdown",
        "landing_auto.l_mite_5_0": "Limit: -5.0%",
        "landing_auto.ratio_r_r_medio": "Avg R:R Ratio",
        "landing_auto.esperanza_positiva": "Positive Expectancy",
        "landing_auto.consistencia_institucional": "Institutional Consistency:",
        "landing_auto.solo_ejecutas_tus_setups_con_esperanza_m": "You only execute setups with verified mathematical expectancy (",
        "landing_auto.riesgo_0_5_por_trade_y_cero_sobreoperati": "). 0.5% risk per trade and zero overtrading.",
        "landing_auto.operativa_quir_rgica_45_entradas_registr": "Surgical execution! 45 logged trades with full checklist.",
        "landing_auto.meta_48_5": "Target: 48.5%",
        "landing_auto.curva_de_crecimiento_de_capital": "Equity Curve Growth",
        "landing_auto.4_850_00_ganancia_neta": "+$4,850.00 Net Profit",
        "landing_auto.meta_fase_1": "Phase 1 Goal:",
        "landing_auto.48_5_alcanzado": "48.5% reached",
        "landing_auto.xauusd_compra": "XAUUSD Long:",
        "landing_auto.1_3_2_r_r": "(1:3.2 R:R)",
        "landing_auto.bit_cora_historial_de_trades": "Journal & Trades History",
        "landing_auto.datos_reales_app": "LIVE APP DATA",
        "landing_auto.1_oro": "1. Gold",
        "landing_auto.2_eur": "2. EUR",
        "landing_auto.3_gbp": "3. GBP",
        "landing_auto.4_us30": "4. US30",
        "landing_auto.fecha_d_a": "Date / Day",
        "landing_auto.activo": "Asset",
        "landing_auto.sesi_n": "Session",
        "landing_auto.tendencia": "Trend Bias",
        "landing_auto.tipo_orden": "Order Type",
        "landing_auto.pips_sl_tp": "SL / TP Pips",
        "landing_auto.ratio_rr": "R:R Ratio",
        "landing_auto.riesgo": "Risk",
        "landing_auto.estado": "Status",
        "landing_auto.resultado": "Result (%)",
        "landing_auto.balance_p_l": "Balance (P&L)",
        "landing_auto.galer_a": "Gallery",
        "landing_auto.acciones": "Actions",
        "landing_auto.jueves": "Thursday",
        "landing_auto.mi_rcoles": "Wednesday",
        "landing_auto.martes": "Tuesday",
        "landing_auto.lunes": "Monday",
        "landing_auto.viernes": "Friday",
        "landing_auto.xauusd_buy_limit_an_lisis_t_cnico": "XAUUSD (Buy Limit) · Technical Analysis",
        "landing_auto.captura_y_setup_antes": "Screenshot & Setup (BEFORE)",
        "landing_auto.ver_gr_fico_t_cnico": "View Technical Chart",
        "landing_auto.setup_activo": "Active Setup",
        "landing_auto.ampliar": "Expand",
        "landing_auto.gesti_n_y_cierre_despu_s": "Management & Close (AFTER)",
        "landing_auto.captura_de_an_lisis": "Analysis Screenshot",
        "landing_auto.resumen_anual_calendario_de_rendimiento": "Annual Summary & Performance Calendar",
        "landing_auto.a_o_2026_auditado": "AUDITED YEAR 2026",
        "landing_auto.tour_auto": "Auto Tour",
        "landing_auto.68_70_anual_68_700": "+68.70% Annual (+$68,700)",
        "landing_auto.retorno_anual": "Annual Return:",
        "landing_auto.meses_verde": "Green Months:",
        "landing_auto.win_rate_anual": "Annual Win Rate:",
        "landing_auto.enero": "January",
        "landing_auto.febrero": "February",
        "landing_auto.marzo": "March",
        "landing_auto.abril": "April",
        "landing_auto.mayo": "May",
        "landing_auto.junio": "June",
        "landing_auto.julio": "July",
        "landing_auto.agosto": "August",
        "landing_auto.septiembre": "September",
        "landing_auto.octubre": "October",
        "landing_auto.noviembre": "November",
        "landing_auto.diciembre": "December",
        "landing_auto.retorno": "Return",
        "landing_auto.efect": "Win Rate",
        "landing_auto.dd_control": "DD Control",
        "landing_auto.mes_be": "BE Month",
        "landing_auto.top_mes": "Top Month ⭐",
        "landing_auto.en_curso": "In Progress",
        "landing_auto.auditor_a_profunda_octubre_2026": "Deep Audit: October 2026",
        "landing_auto.mejor_mes_del_a_o_14_85": "Best Month of the Year (+14.85%)",
        "landing_auto.mejor_sesi_n": "⚡ Best Session",
        "landing_auto.distribuci_n": "📊 Distribution",
        "landing_auto.23_operaciones_cerradas": "23 closed trades",
        "landing_auto.auditor_a_de_reglas_de_empresas_de_fonde": "Prop Firm Rule Audit System",
        "landing_auto.configuraci_n_lista": "⚙️ CONFIGURATION READY",
        "landing_auto.simular_progreso_auto": "Simulate Auto Progress",
        "landing_auto.1_trade": "+1 Trade",
        "landing_auto.par_metros_de_cuenta_auditados": "Audited Account Parameters:",
        "landing_auto.cuenta_100k_2_fases": "100K Account (2 Phases)",
        "landing_auto.cuenta_50k_1_fase": "50K Account (1 Phase)",
        "landing_auto.fondeo_directo_25k": "Instant Funding 25K",
        "landing_auto.p_rdida_diaria": "Daily Loss:",
        "landing_auto.p_rdida_m_xima": "Max Drawdown:",
        "landing_auto.d_as_m_nimos": "Min Days:",
        "landing_auto.progreso": "Progress:",
        "landing_auto.l_mite_diario_respetado": "Daily limit respected",
        "landing_auto.cuenta_blindada": "Account shielded",
        "landing_auto.trade_m_x_bajo_control": "Max trade under control",
        "landing_auto.0_5_d_as": "0 / 5 Days",
        "landing_auto.potencia_anal_tica_rigor_cuantitativo": "ANALYTICAL POWER & QUANTITATIVE RIGOR",
        "landing_auto.todo_lo_que_un_trader_disciplinado_neces": "Everything a disciplined trader needs to stop blowing accounts",
        "landing_auto.construida_con_un_nico_objetivo_reemplaz": "Built with a single goal: replace chaos and spreadsheets with a professional system featuring real-time equity curves, prop firm rule audits, and risk management psychology.",
        "landing_auto.tiempo_real": "REAL TIME",
        "landing_auto.curva_de_equidad_m_tricas_pro": "Equity Curve & Pro Metrics",
        "landing_auto.comprueba_tu_esperanza_matem_tica_con_wi": "Verify your mathematical expectancy with Win Rate, Profit Factor, and continuous Drawdown with zero visual gimmicks.",
        "landing_auto.sin_bit_cora": "Without Journal",
        "landing_auto.bit_cora_pro": "Pro Journal",
        "landing_auto.max_dd": "Max Drawdown",
        "landing_auto.interactivo": "INTERACTIVE",
        "landing_auto.calculadora_de_lotaje_precisa": "Precise Position Size Calculator",
        "landing_auto.nunca_vuelvas_a_sobrelotear_calcula_el_l": "Never over-leverage again. Calculate the exact lot size for your exact risk percentage in one second.",
        "landing_auto.volumen_calculado": "Calculated Volume:",
        "landing_auto.lotes": "LOTS",
        "landing_auto.valor_pip": "Pip Value:",
        "landing_auto.margen": "Margin:",
        "landing_auto.calendario_d_as_de_rendimiento": "Calendar & Daily Performance",
        "landing_auto.visualiza_tus_d_as_verdes_y_rojos_en_un_": "Visualize green and red days in a continuous heatmap to detect overtrading and mental fatigue.",
        "landing_auto.lun": "MON",
        "landing_auto.mar": "TUE",
        "landing_auto.mi": "WED",
        "landing_auto.jue": "THU ⭐",
        "landing_auto.vie": "FRI",
        "landing_auto.total_semana": "Week Total:",
        "landing_auto.2_940_00_80_verde": "+$2,940.00 (80% Green)",
        "landing_auto.prop_firm_ready": "PROP FIRM READY",
        "landing_auto.auditor_a_de_fondeo_en_vivo": "Live Prop Firm Audit",
        "landing_auto.auditor_a_estricta_de_p_rdida_diaria_dra": "Strict real-time tracking of daily drawdown, max trailing loss, and consistency rules before breaching.",
        "landing_auto.checklist_hd": "HD CHECKLIST",
        "landing_auto.galer_a_antes_despu_s_gr_ficos_t_cnicos": "Before / After Gallery (Technical Charts)",
        "landing_auto.sube_el_setup_antes_de_disparar_y_la_ges": "Upload the chart setup before taking the trade and the final close. Audit your psychology and eliminate impulsive entries.",
        "landing_auto.antes": "BEFORE",
        "landing_auto.despu_s": "AFTER",
        "landing_auto.checklist_5_reglas": "5-Rule Checklist",
        "landing_auto.5_5_reglas": "5/5 Rules ✓",
        "landing_auto.filtro_de_fugas": "LEAK DETECTOR",
        "landing_auto.desglose_quir_rgico_por_sesi_n": "Surgical Breakdown by Session",
        "landing_auto.descubre_a_qu_horas_ganas_dinero_y_en_cu": "Discover the trading windows where you produce profits and where you give it back, keeping you strictly focused on high-edge sessions.",
        "landing_auto.sesi_n_asia_noche": "Asia Night Session:",
        "landing_auto.filtrada_cero_p_rdidas": "Filtered Out (Zero losses)",
        "landing_auto.bit_cora_y_registro_de_sesiones_de_backt": "BACKTESTING SESSIONS JOURNAL & LAB",
        "landing_auto.aclaraci_n_importante": "Important Notice:",
        "calc.initial_risk": "$0.00 at risk",

        // Full landing localization keys (EN)
        "landing_full.esta_herramienta_est_dise_ada_para": "This tool is designed to",
        "landing_full.registrar_medir_y_auditar": "log, measure, and audit",
        "landing_full.tus_sesiones_de_backtesting_pro_manual_e": "your manual Backtesting Pro sessions (e.g. conducted on your charting platform or simulator).",
        "landing_full.el_motor_automatizado_con_datos_de_merca": "The automated engine with historical tick data is in active development and launching soon.",
        "landing_full.registra_tus_sesiones_en_backtesting_pro": "Log Your Backtesting Pro Sessions and Audit Prop Firm Rules",
        "landing_full.documenta_tus_pruebas_de_estrategia_manu": "Document your manual strategy backtests with institutional rigor. Log every tested trade from your charting platform, audit prop firm rules in real time, and calculate Profit Split with the payout simulator before paying for a challenge.",
        "landing_full.registro_de_fases_de_fondeo": "Prop Firm Challenge Phases Logging",
        "landing_full.anota_tus_trades_de_backtesting_manual_y": "Log your manual backtested trades and verify whether your strategy hits profit targets (8%, 10%), min trading days, and drawdown caps before spending $500 on an evaluation.",
        "landing_full.auditor_a_seg_n_reglas_de_empresas_de_fo": "Real-time prop firm rule auditing",
        "landing_full.simulador_de_retiros_payouts": "Payout & Profit Split Simulator",
        "landing_full.no_solo_anotes_pips_simula_tu_dinero_en_": "Don't just count pips: simulate take-home cash. Adjust Profit Split (80/20 or 90/10) and deduct payouts from your balance to test if you maintain your cushion.",
        "landing_full.reparto_80_20_y_90_10_en_usdt": "80/20 and 90/10 Profit Split in USDT",
        "landing_full.drawdown_trailing_consistencia": "Trailing Drawdown & Consistency",
        "landing_full.descubre_si_tu_estrategia_soporta_el_dra": "Discover whether your strategy withstands trailing drawdown and strict daily loss caps with instant breach alerts on manual entry.",
        "landing_full.alertas_de_quiebre_en_tiempo_real": "Real-time breach alerts",
        "landing_full.sesiones_aisladas_por_estrategia": "Strategy-Isolated Sessions",
        "landing_full.crea_sesiones_separadas_para_registrar_t": "Create dedicated sessions for separate chart test plans: 'ICT Gold NY', 'Scalping EURUSD', etc. Save before/after screenshots and setup notes.",
        "landing_full.guarda_fotos_de_antes_y_despu_s": "Save Before & After Screenshots",
        "landing_full.c_mo_funciona_hoy_vs_pr_ximamente": "How it works today vs. Coming soon",
        "landing_full.en_desarrollo": "IN DEVELOPMENT",
        "landing_full.hoy": "Today:",
        "landing_full.bit_cora_avanzada_para_registrar_auditar": "Advanced journal to log, audit, and document manually tested trades from your charting software or simulator.",
        "landing_full.pr_ximamente": "Coming Soon:",
        "landing_full.motor_de_simulaci_n_autom_tica_integrado": "Automated backtest engine integrated with tick-by-tick historical candlestick data feeds.",
        "landing_full.motor_con_datos_pr_ximamente": "Tick Data Engine · Coming Soon",
        "landing_full.simulador_de_registro_de_backtesting_pro": "Backtesting Pro Interactive Logging Simulator",
        "landing_full.prueba_c_mo_la_bit_cora_audita_tus_entra": "Test how the journal audits manual entries and settles payouts according to each firm's rules:",
        "landing_full.registro_manual_de_sesiones": "MANUAL SESSIONS LOGGING",
        "landing_full.1_selecciona_la_empresa_de_fondeo_a_simu": "1. Select Prop Firm to Simulate:",
        "landing_full.2_etapa_actual_del_desaf_o_simulado": "2. Current Stage of Simulated Challenge:",
        "landing_full.fase_1": "Phase 1",
        "landing_full.fase_2": "Phase 2",
        "landing_full.fondeada": "Funded",
        "landing_full.balance_inicial_de_prueba": "Test Starting Balance:",
        "landing_full.objetivo_de_ganancia_target": "Profit Target:",
        "landing_full.l_mite_p_rdida_diaria": "Daily Loss Limit:",
        "landing_full.drawdown_m_ximo_total": "Max Total Drawdown:",
        "landing_full.profit_split_al_fondearte": "Funded Profit Split:",
        "landing_full.estado_de_la_simulaci_n": "Simulation Status",
        "landing_full.100_seguro_en_regla": "✓ 100% SAFE · IN COMPLIANCE",
        "landing_full.meta_para_aprobar": "Target to Pass:",
        "landing_full.p_rdida_diaria_consumida_hoy_5_0_m_x": "Daily Drawdown Consumed (-5.0% Max):",
        "landing_full.drawdown_m_ximo_hist_rico_10_0_m_x": "Peak Max Drawdown (-10.0% Max):",
        "landing_full.d_as_operados": "Trading Days",
        "landing_full.consistencia": "Consistency",
        "landing_full.r_r_medio": "Avg R:R",
        "landing_full.ganancia_retirable_total": "Total Withdrawable Profit:",
        "landing_full.tu_pago_neto_a_billetera": "Net Payout to Your Wallet:",
        "landing_full.simular_solicitud_de_retiro_payout": "Simulate Payout Request",
        "landing_full.reset": "Reset",
        "landing_full.simulaci_n_de_retiro_procesada_exitosame": "Payout Simulation Processed Successfully!",
        "landing_full.m_todo_usdt_trc20_polygon": "Method: USDT (TRC20 / Polygon)",
        "landing_full.comisi_n_broker_1_690_00_20": "Broker Split: $1,690.00 (20%)",
        "landing_full.incluida_en_tu_membres_a_pro_no_se_vende": "INCLUDED IN PRO MEMBERSHIP · NOT SOLD SEPARATELY",
        "landing_full.calculadora_de_lotaje_pro": "Position Size Pro Calculator",
        "landing_full.el_c_lculo_institucional_de_lotaje_m_s_p": "The most accurate institutional lot size calculator available. Engineered to protect your daily drawdown on live accounts and Prop Firm evaluations before pulling the trigger.",
        "landing_full.crea_y_guarda_tus_propios_setups_presets": "Create and Save Custom Setups & Presets",
        "landing_full.agrupaci_n_inteligente_por_categor_as_de": "Smart Grouping by Market Categories",
        "landing_full.tipos_de_cambio_en_vivo_y_conversi_n_exa": "Live Exchange Rates & Exact Conversion",
        "landing_full.tolerancia_cero_a_errores_de_sobrelotaje": "Zero Tolerance for Over-Leveraging Errors",
        "landing_full.evita_que_un_c_lculo_manual_apresurado_q": "Prevent rushed manual calculations from blowing your challenge account. The calculator displays the exact tick value and required margin before entering the market.",
        "landing_full.simulador_de_setups": "SETUPS SIMULATOR",
        "landing_full.selecciona_un_setup_preset": "Select a Setup / Preset:",
        "landing_full.balance_de_la_cuenta": "Account Balance:",
        "landing_full.instrumento_par": "Instrument / Pair:",
        "landing_full.riesgo_permitido": "Allowed Risk:",
        "landing_full.stop_loss_programado": "Planned Stop Loss:",
        "landing_full.lotaje_exacto_recomendado": "Recommended Exact Lot Size",
        "landing_full.desbloqueada_de_inmediato_al_iniciar_tu_": "Unlocked immediately upon starting your 7-day trial.",
        "landing_full.desbloquear_calculadora_en_la_prueba": "Unlock Calculator in Free Trial",
        "landing_full.pr_ximo_lanzamiento_en_desarrollo_activo": "Upcoming release · In active development",
        "landing_full.mt5_cloud_sync_conexi_n_autom_tica_con_m": "MT5 Cloud Sync: Automatic MetaTrader 5 Connection",
        "landing_full.operas_en_tu_terminal_metatrader_5_como_": "Trade in MetaTrader 5 as usual. We handle syncing every entry, exit, stop loss, and commission to your cloud Pro Journal automatically and seamlessly.",
        "landing_full.zero_esfuerzo_de_registro": "Zero Manual Logging Effort",
        "landing_full.auditor_a_real_de_broker": "Authentic Broker Audit",
        "landing_full.captura_los_costos_ocultos_que_alteran_t": "Track hidden costs affecting your profitability: commissions, overnight rollover/swap, and adverse slippage straight from your broker's server.",
        "landing_full.acceso_vip_para_miembros_pro": "VIP Access for Pro Members",
        "landing_full.los_usuarios_con_suscripci_n_activa_tend": "Active Pro subscribers receive priority invitations to the closed beta before public launch, with zero surprise fees or license add-ons.",
        "landing_full.operas_en_metatrader_5_a_diario": "Do you trade on MetaTrader 5 daily?",
        "landing_full.inicia_tu_prueba_de_7_d_as_hoy_y_reserva": "Start your 7-day trial today and reserve priority access for the MT5 Cloud Sync beta.",
        "landing_full.reservar_mi_acceso_pro": "Reserve My Pro Access →",
        "landing_full.drawdown_diario_y_m_ximo": "Daily & Max Drawdown:",
        "landing_full.alertas_visuales_inmediatas_antes_de_roz": "Instant visual alerts before approaching your allowed drawdown cap.",
        "landing_full.regla_de_consistencia": "Consistency Rule:",
        "landing_full.controla_que_ning_n_trade_individual_rep": "Ensures no single trade represents a higher percentage of total profit than allowed.",
        "landing_full.gesti_n_de_fases": "Phase Advancement:",
        "landing_full.avanza_con_un_clic_de_fase_1_a_fase_2_y_": "Advance from Phase 1 to Phase 2 and Funded status with 1 click and balance resets.",
        "landing_full.auditor_a_de_reglas_de_empresas_de_fonde": "Prop Firm Rules Live Audit",
        "landing_full.100_cumplido": "100% PASSED",
        "landing_full.l_mite_p_rdida_diaria_5": "Daily Loss Limit (-5%)",
        "landing_full.0_8_consumido": "-0.8% consumed",
        "landing_full.p_rdida_m_xima_total_10": "Total Max Drawdown (-10%)",
        "landing_full.1_2_m_ximo_visto": "-1.2% peak DD seen",
        "landing_full.d_as_m_nimos_de_trading_5_d_as": "Min Trading Days (5 days)",
        "landing_full.5_5_completados": "5 / 5 completed",
        "landing_full.flexibilidad": "Flexibility",
        "landing_full.ideal_para_probar_mes_a_mes_sin_compromi": "Ideal to test month-to-month with no commitments.",
        "landing_full.ahorras_9": "Save $9",
        "landing_full.el_ciclo_perfecto_para_preparar_y_pasar_": "The perfect cycle to prepare and pass prop firm challenges.",
        "landing_full.0_hoy_acceso_pro_total_inmediato": "$0 today · Immediate full Pro access",
        "landing_full.ahorras_72": "Save $72",
        "landing_full.para_traders_comprometidos_que_construye": "For committed traders building long-term institutional consistency.",
        "landing_full.0_hoy_mayor_ahorro_garantizado": "$0 today · Maximum guaranteed savings",
        "landing_full.todos_los_planes_incluyen_la_membres_a_p": "All plans include full Pro Membership with everything unlocked:",
        "landing_full.100_desbloqueado": "100% Unlocked",
        "landing_full.copias_en_la_nube_autom_ticas": "Automatic cloud backups",
        "landing_full.acceso_prioritario_a_mt5_cloud_sync": "Priority access to MT5 Cloud Sync",
        "landing_full.prueba_de_7_d_as_con_tarjeta_0_hoy_cance": "7-day trial with card ($0 charged today). Cancel before day 7 with 1 click in your account at zero cost.",
        "landing_full.contacto": "Contact:",
        "landing_full.descargo_de_responsabilidad_financiera": "Financial Disclaimer:",
        "landing_full.trading_journal_pro_es_una_plataforma_te": "Trading Journal Pro is a software and data analytics platform for personal trading operational management. It does not provide financial advice, fund management, trading signals, or investment recommendations. Trading financial assets, Forex, futures, and prop firm accounts carries substantial risk of capital loss and is not suitable for all investors. All rights reserved © 2026 Trading Journal Pro.",
        "landing_full.avisos_legales_pol_ticas": "Legal Notices & Policies",
        // Extra session modal & metrics keys
            "modal_session.current_balance_help": "If left empty, Initial Balance is used as base and logged trades are added.",
            "modal_session.real_balance_help": "Latest reported closing: on save a snapshot is logged in Balance Tracking.",
            "modal_session.mt5_help": "MT5 account login number. If left empty, the bridge will not sync with this account.",
            "modal_session.goal_help": "You will see target progress and remaining drawdown cushion in account metrics.",
            "modal_session.goal_type": "Goal Type",
            "modal_session.goal_target_bal": "Target Balance ($)",
            "modal_session.goal_val": "Goal Value",
            "modal_session.goal_own_help": "A custom goal: progress and distance to completion will be displayed.",
            "modal_session.payout_help": "Payout rules: the app calculates your withdrawable profit and time remaining until payout.",
            "modal_session.pct_balance": "% of balance",
            "modal_session.fixed_initial": "Fixed on initial balance",
            "modal_session.daily_loss_label": "Daily Loss Limit (%)",
            "modal_session.rules_help": "Displayed as progress cards in account metrics. Prop firm drawdown rules are set below.",
            "modal_session.drawdown_help": "Drawdowns are calculated against initial balance. Leave empty to disable.",
            "metrics.by_month": "By Month",
            "metrics.by_week": "By Week",
            "daily.modal_title": "Trade Analysis",
            "daily.modal_summary": "Logged Trades",,







        }







    };















    /**







     * Determina el idioma inicial







     */







    function detectInitialLanguage() {







        try {







            const stored = getStoredLang();







            if (stored === 'es' || stored === 'en') return stored;















            const browserLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();







            return browserLang.startsWith('en') ? 'en' : 'es';







        } catch (e) {







            return 'es';







        }







    }















    let currentLanguage = detectInitialLanguage();















    /**







     * Devuelve el idioma activo actual ('es' | 'en')







     */







    function getLanguage() {







        return currentLanguage;







    }















    /**







     * Obtiene una traducción por clave







     */







    function t(key, fallback = '') {







        const langDict = DICTIONARY[currentLanguage] || DICTIONARY.es;







        if (langDict && langDict[key] !== undefined) {







            return langDict[key];







        }







        const fallbackDict = DICTIONARY.es;







        if (fallbackDict && fallbackDict[key] !== undefined) {







            return fallbackDict[key];







        }







        return fallback || key;







    }















    /**







     * Nombres de meses según el idioma activo







     */







    function getI18nMonthNames(short = false) {







        const map = short ? MONTHS_SHORT : MONTHS;







        return map[currentLanguage] || map.es;







    }















    /**







     * Nombres de días de la semana según el idioma activo







     */







    function getI18nDayNames() {







        return DAYS_SHORT[currentLanguage] || DAYS_SHORT.es;







    }















    /**







     * Formatea fechas para visualización en tablas e interfaces:







     * - ES: DD/MM/YYYY







     * - EN: MM/DD/YYYY







     */







    function formatDateForDisplay(dateStr) {







        if (!dateStr || typeof dateStr !== 'string') return dateStr || '';







        const parts = dateStr.trim().split('-');







        if (parts.length === 3) {







            const [y, m, d] = parts;







            if (currentLanguage === 'en') {







                return `${m}/${d}/${y}`;







            } else {







                return `${d}/${m}/${y}`;







            }







        }







        return dateStr;







    }















    /**







     * Actualiza todos los elementos del DOM que tengan atributos `data-i18n`







     */







    function updateDOM() {







        // Text content







        document.querySelectorAll('[data-i18n]').forEach(el => {







            const key = el.getAttribute('data-i18n');







            const translation = t(key);







            if (translation) el.textContent = translation;







        });















        // HTML content







        document.querySelectorAll('[data-i18n-html]').forEach(el => {







            const key = el.getAttribute('data-i18n-html');







            const translation = t(key);







            if (translation) el.innerHTML = translation;







        });















        // Placeholders







        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {







            const key = el.getAttribute('data-i18n-placeholder');







            const translation = t(key);







            if (translation) el.placeholder = translation;







        });















        // Titles / Tooltips







        document.querySelectorAll('[data-i18n-title]').forEach(el => {







            const key = el.getAttribute('data-i18n-title');







            const translation = t(key);







            if (translation) el.title = translation;







        });















        // Optgroup / Element labels







        document.querySelectorAll('[data-i18n-label]').forEach(el => {







            const key = el.getAttribute('data-i18n-label');







            const translation = t(key);







            if (translation) el.label = translation;







        });















        // Actualizar estado visual de los botones / pastillas de idioma







        updateLanguageToggleButtons();







    }















    /**







     * Actualiza el diseño visual de la pastilla ES | EN







     */







    function updateLanguageToggleButtons() {
        document.documentElement.lang = currentLanguage;
        const langToggleLabel = document.getElementById('lang-toggle-label');
        if (langToggleLabel) {
            langToggleLabel.textContent = currentLanguage === 'es' ? 'EN' : 'ES';
        }







        const pills = document.querySelectorAll('.lang-toggle-pill');







        pills.forEach(pill => {







            const btnEs = pill.querySelector('.lang-btn-es');







            const btnEn = pill.querySelector('.lang-btn-en');







            if (btnEs && btnEn) {







                if (currentLanguage === 'es') {







                    btnEs.className = "lang-btn-es px-2 py-0.5 rounded text-xs font-black transition-all bg-emerald-500 text-gray-950 shadow-sm";







                    btnEn.className = "lang-btn-en px-2 py-0.5 rounded text-xs font-semibold text-gray-400 hover:text-white transition-all";







                } else {







                    btnEn.className = "lang-btn-en px-2 py-0.5 rounded text-xs font-black transition-all bg-emerald-500 text-gray-950 shadow-sm";







                    btnEs.className = "lang-btn-es px-2 py-0.5 rounded text-xs font-semibold text-gray-400 hover:text-white transition-all";







                }







            }







        });







    }















    /**







     * Cambia el idioma activo y emite evento global







     */







    function setLanguage(lang) {







        if (lang !== 'es' && lang !== 'en') return;







        currentLanguage = lang;







        try {







            try {
        localStorage.setItem('astrade_lang', lang);
        localStorage.setItem('app_lang', lang);
    } catch(e) {}







        } catch (e) { }















        updateDOM();















        // Notificar a toda la aplicación para re-renderizar tablas, calendarios y gráficas







        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));







    }















    /**







     * Alterna entre Español e Inglés







     */







    function toggleLanguage() {







        setLanguage(currentLanguage === 'es' ? 'en' : 'es');







    }















    /**







     * Genera el HTML de la pastilla compacta para insertar en encabezados







     */







    function createLangPillHTML() {







        const isEs = currentLanguage === 'es';







        return `







            <div class="lang-toggle-pill flex items-center bg-gray-900/90 border border-main rounded-lg p-0.5 text-xs select-none shadow-sm" title="${t('lang.toggle_title')}">







                <span class="px-1.5 text-gray-400 text-xs flex items-center"><i class="fa-solid fa-globe text-[11px]"></i></span>







                <button type="button" onclick="setLanguage('es')" class="lang-btn-es px-2 py-0.5 rounded text-xs ${isEs ? 'font-black bg-emerald-500 text-gray-950 shadow-sm' : 'font-semibold text-gray-400 hover:text-white'} transition-all">ES</button>







                <button type="button" onclick="setLanguage('en')" class="lang-btn-en px-2 py-0.5 rounded text-xs ${!isEs ? 'font-black bg-emerald-500 text-gray-950 shadow-sm' : 'font-semibold text-gray-400 hover:text-white'} transition-all">EN</button>







            </div>







        `;







    }















    // Inicialización al cargar el script o el DOM







    if (document.readyState === 'loading') {







        document.addEventListener('DOMContentLoaded', updateDOM);







    } else {







        updateDOM();







    }















    // Exponer API global







    window.i18n = {







        getLanguage,







        setLanguage,







        toggleLanguage,







        t,







        getI18nMonthNames,







        getI18nDayNames,







        formatDateForDisplay,







        updateDOM,







        createLangPillHTML







    };















    // Atajos globales







    window.t = t;







    window.setLanguage = setLanguage;







    window.toggleLanguage = toggleLanguage;







    window.formatDateForDisplay = formatDateForDisplay;







})();








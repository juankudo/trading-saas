/**
 * Payments & Subscriptions Module — AsTrade SaaS
 * Gestiona el Checkout para Tarjetas (Stripe) y Criptomonedas (NOWPayments USDT).
 * Incluye un Modo Sandbox / Test interactivo para probar el flujo completo sin dinero real.
 * Maneja el Modo Solo Lectura para cuentas con período vencido.
 */

// Configuración de Pasarelas y Precios
const PROMO_END_MS = Date.parse('2026-12-06T23:59:59+01:00');

function isLaunchPromoActive() {
    return Date.now() <= PROMO_END_MS;
}

function getEdgeFunctionsBase() {
    if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url) {
        return `${SUPABASE_CONFIG.url}/functions/v1`;
    }
    return 'https://pwkesbkoqrvfrzyjolla.supabase.co/functions/v1';
}

const PAYMENTS_CONFIG = {
    mode: 'live',

    pricing: {
        month: {
            promoPrice: 20,
            regularPrice: 25,
            discountPct: 20,
            standardBadge: null,
            get price() { return isLaunchPromoActive() ? this.promoPrice : this.regularPrice; },
            originalPrice: 25,
            periodDays: 30,
            periodKey: 'checkout.period_month_label',
            periodText: 'por 1 Mes',
            descKey: 'checkout.trial_desc',
            regularDescKey: 'checkout.month_regular_desc',
            desc: 'Black Friday (-20% 1er mes): $20 USD hoy. Luego continúa a $25 USD/mes.',
            regularDesc: 'Cobro mensual recurrente de $25 USD/mes.'
        },
        quarter: {
            promoPrice: 56,
            regularPrice: 70,
            discountPct: 20,
            standardBadge: '-7%',
            get price() { return isLaunchPromoActive() ? this.promoPrice : this.regularPrice; },
            originalPrice: 70,
            periodDays: 90,
            periodKey: 'checkout.period_quarter_label',
            periodText: 'por 3 Meses',
            descKey: 'checkout.quarter_desc',
            regularDescKey: 'checkout.quarter_regular_desc',
            desc: 'Black Friday (-20% pack inicial): $56 USD hoy ($18.67/mes). Luego continúa a $25 USD/mes.',
            regularDesc: 'Pack inicial de 3 meses por $70 USD ($23.33/mes). Luego continúa a $25 USD/mes.'
        },
        semester: {
            promoPrice: 108,
            regularPrice: 135,
            discountPct: 20,
            standardBadge: '-10%',
            get price() { return isLaunchPromoActive() ? this.promoPrice : this.regularPrice; },
            originalPrice: 135,
            periodDays: 180,
            periodKey: 'checkout.period_semester_label',
            periodText: 'por 6 Meses',
            descKey: 'checkout.semester_desc',
            regularDescKey: 'checkout.semester_regular_desc',
            desc: 'Black Friday (-20% pack inicial): $108 USD hoy ($18.00/mes). Luego continúa a $25 USD/mes.',
            regularDesc: 'Pack inicial de 6 meses por $135 USD ($22.50/mes). Luego continúa a $25 USD/mes.'
        },
        year: {
            promoPrice: 200,
            regularPrice: 250,
            discountPct: 20,
            standardBadge: '-17%',
            get price() { return isLaunchPromoActive() ? this.promoPrice : this.regularPrice; },
            originalPrice: 250,
            periodDays: 365,
            periodKey: 'checkout.period_year_label',
            periodText: 'por 12 Meses',
            descKey: 'checkout.year_desc',
            regularDescKey: 'checkout.year_regular_desc',
            desc: 'Black Friday (-20% pack inicial): $200 USD hoy ($16.67/mes). Luego continúa a $25 USD/mes.',
            regularDesc: 'Pack inicial de 12 meses por $250 USD ($20.83/mes). Luego continúa a $25 USD/mes.'
        }
    }
};

function getEffectivePlanPrice(periodKey) {
    const plan = PAYMENTS_CONFIG.pricing[periodKey] || PAYMENTS_CONFIG.pricing.month;
    return isLaunchPromoActive() ? plan.promoPrice : plan.regularPrice;
}

let selectedCheckoutPeriod = localStorage.getItem('preferred_billing_cycle') || 'month';
if (!PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod]) selectedCheckoutPeriod = 'month';
let selectedCryptoCurrency = 'usdttrc20';
let isMandatoryLockdown = false;

/**
 * Determina si la suscripción o período de prueba del usuario actual está vencida
 */
function isSubscriptionExpired() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) return false;

    const sub = user.subscription;
    if (sub) {
        if (sub.status === 'active') {
            const expMs = new Date(sub.current_period_end || 0).getTime();
            return !Number.isFinite(expMs) || expMs <= Date.now();
        }
        if (sub.status === 'expired' || sub.status === 'past_due' || sub.status === 'canceled' || sub.status === 'read_only') {
            return true;
        }
    }

    const trial = (typeof getTrialInfo === 'function') ? getTrialInfo(user) : { expired: false, daysRemaining: 7 };
    return Boolean(trial.expired);
}

/**
 * Aplica o retira el bloqueo Paywall obligatorio (fondo desenfocado + modal obligatorio sin X)
 */
function applyPaywallLockdown(isExpired, details = {}) {
    const wasMandatory = isMandatoryLockdown;
    isMandatoryLockdown = Boolean(isExpired);
    const mainContent = document.getElementById('app-main-content');
    const closeBtn = document.getElementById('checkout-close-btn');
    const lockdownActions = document.querySelectorAll('.checkout-lockdown-actions');
    const titleEl = document.getElementById('checkout-modal-title');
    const subtitleEl = document.getElementById('checkout-modal-subtitle');
    const iconContainer = document.getElementById('checkout-modal-icon');
    const banner = document.getElementById('readonly-warning-banner');

    if (isExpired) {
        // 1. Fondo oscurecido y desenfocado, sin interacción
        if (mainContent) {
            mainContent.classList.add('app-lockdown-dimmed');
        }
        document.body.classList.add('is-subscription-locked');

        // 2. Ocultar banner amarillo (el modal paywall toma el protagonismo completo)
        if (banner) banner.classList.add('hidden');

        // 3. Ajustar modal a modo obligatorio (sin X, con botón cerrar sesión)
        if (closeBtn) closeBtn.classList.add('hidden');
        lockdownActions.forEach(el => el.classList.remove('hidden'));

        // 4. Textos dinámicos del Paywall según tipo de vencimiento
        const isProExpired = details.isProExpired || (details.reason === 'subscription_expired');
        if (titleEl) {
            titleEl.textContent = isProExpired
                ? (typeof window.t === 'function' ? window.t('paywall.title_pro_expired', 'Tu Membresía Pro ha Vencido') : 'Tu Membresía Pro ha Vencido')
                : (typeof window.t === 'function' ? window.t('paywall.title_trial_expired', 'Tu Período de Prueba ha Finalizado') : 'Tu Período de Prueba ha Finalizado');
        }
        if (subtitleEl) {
            subtitleEl.textContent = typeof window.t === 'function'
                ? window.t('paywall.subtitle', 'Tus cuentas y métricas están a salvo. Renueva tu membresía Pro para desbloquear la bitácora completa y continuar operando.')
                : 'Tus cuentas y métricas están a salvo. Renueva tu membresía Pro para desbloquear la bitácora completa y continuar operando.';
        }
        if (iconContainer) {
            iconContainer.className = "w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-gray-950 flex items-center justify-center mx-auto mb-2 text-xl font-black shadow-lg shadow-rose-500/20";
            iconContainer.innerHTML = '<i class="fa-solid fa-lock"></i>';
        }

        // 5. Abrir el modal de checkout forzosamente
        openCheckoutModal(selectedCheckoutPeriod, true);
    } else {
        // 1. Restaurar fondo
        if (mainContent) {
            mainContent.classList.remove('app-lockdown-dimmed');
        }
        document.body.classList.remove('is-subscription-locked');

        // 2. Restaurar modal a modo normal
        if (closeBtn) closeBtn.classList.remove('hidden');
        lockdownActions.forEach(el => el.classList.add('hidden'));

        if (titleEl) {
            titleEl.textContent = typeof window.t === 'function'
                ? window.t('checkout.title', 'Membresía Pro Ilimitada')
                : 'Membresía Pro Ilimitada';
        }
        if (subtitleEl) {
            subtitleEl.textContent = typeof window.t === 'function'
                ? window.t('checkout.subtitle', 'Desbloquea todas las funciones, cuentas ilimitadas y respaldo en la nube')
                : 'Desbloquea todas las funciones, cuentas ilimitadas y respaldo en la nube';
        }
        if (iconContainer) {
            iconContainer.className = "w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-gray-950 flex items-center justify-center mx-auto mb-2 text-xl font-black shadow-lg shadow-emerald-500/20";
            iconContainer.innerHTML = '<i class="fa-solid fa-gem"></i>';
        }

        // Cerrar modal solo si provenía de un bloqueo obligatorio paywall
        if (wasMandatory) {
            closeCheckoutModal(true);
        }
    }
}

/**
 * Verifica si el usuario actual tiene acceso completo o debe estar en Modo Bloqueo Paywall
 */
function checkSubscriptionAccess() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) return { canEdit: false, isReadOnly: true, reason: 'unauthenticated' };

    const sub = user.subscription;

    // 1. Si tiene suscripción de pago (Stripe / NOWPayments)
    if (sub && sub.status === 'active') {
        const expDate = new Date(sub.current_period_end || 0);
        const isStillValid = Number.isFinite(expDate.getTime()) && expDate.getTime() > Date.now();

        if (isStillValid) {
            applyPaywallLockdown(false);
            updateAppSubscriptionUI({
                isPaid: true,
                isTrial: false,
                plan: sub.plan_name || 'Membresía Pro',
                expiresAt: expDate
            });
            return { canEdit: true, isReadOnly: false, isPaid: true, expiresAt: expDate };
        } else {
            applyPaywallLockdown(true, { isProExpired: true, reason: 'subscription_expired', subStatus: 'expired' });
            updateAppSubscriptionUI({
                isPaid: false,
                isTrial: false,
                expired: true,
                subStatus: 'expired',
                plan: 'Membresía Vencida'
            });
            return { canEdit: false, isReadOnly: true, reason: 'subscription_expired' };
        }
    }

    if (sub && (sub.status === 'expired' || sub.status === 'past_due' || sub.status === 'canceled' || sub.status === 'read_only')) {
        applyPaywallLockdown(true, { isProExpired: true, reason: 'subscription_expired', subStatus: sub.status });
        updateAppSubscriptionUI({
            isPaid: false,
            isTrial: false,
            expired: true,
            subStatus: sub.status,
            plan: 'Membresía Vencida'
        });
        return { canEdit: false, isReadOnly: true, reason: 'subscription_expired' };
    }

    // 2. Si está en período de prueba gratuito (7 días)
    const trial = (typeof getTrialInfo === 'function') ? getTrialInfo(user) : { expired: false, daysRemaining: 7 };

    if (trial.expired) {
        applyPaywallLockdown(true, { isTrialExpired: true, reason: 'trial_expired' });
        updateAppSubscriptionUI({
            isPaid: false,
            isTrial: true,
            expired: true,
            daysRemaining: 0
        });
        return { canEdit: false, isReadOnly: true, reason: 'trial_expired' };
    }

    applyPaywallLockdown(false);
    updateAppSubscriptionUI({
        isPaid: false,
        isTrial: true,
        expired: false,
        daysRemaining: trial.daysRemaining
    });
    return { canEdit: true, isReadOnly: false, isTrial: true, daysRemaining: trial.daysRemaining };
}

/**
 * Actualiza los badges e indicadores visuales de suscripción en el header
 */
function updateAppSubscriptionUI(subState) {
    const userBadge = document.getElementById('app-user-badge');
    const userEmail = document.getElementById('app-user-email');
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;

    const userPill = document.getElementById('app-user-pill');
    const userPrefix = (typeof window.t === 'function') ? window.t('nav.user_prefix', 'Usuario') : 'Usuario';
    if (userEmail && user && user.email) {
        userEmail.textContent = user.email;
    }
    if (userPill && user && user.email) {
        userPill.title = `${userPrefix}: ${user.email}`;
    }
    const userContainer = document.getElementById('app-user-menu-container');
    if (userContainer && user && user.email) {
        userContainer.title = `${userPrefix}: ${user.email}`;
    }

    if (userBadge) {
        let iconHtml = '<i class="fa-solid fa-clock text-amber-400 text-xs shrink-0"></i>';
        let badgeText = (typeof window.t === 'function') ? window.t('nav.trial', 'Prueba') : 'Prueba';
        let colorClasses = "bg-emerald-950/90 text-emerald-400 border-emerald-800";

        if (subState.isPaid) {
            const expDateStr = subState.expiresAt instanceof Date
                ? subState.expiresAt.toLocaleDateString()
                : new Date(subState.expiresAt).toLocaleDateString();
            iconHtml = '<i class="fa-solid fa-crown text-amber-400 text-xs shrink-0"></i>';
            badgeText = (typeof window.t === 'function')
                ? window.t('nav.pro_active', 'Pro Activo ({0})').replace('{0}', expDateStr)
                : `Pro Activo (${expDateStr})`;
            colorClasses = "bg-emerald-950/90 text-emerald-300 border-emerald-700/80 shadow-sm";
        } else if (subState.expired) {
            iconHtml = '<i class="fa-solid fa-lock text-rose-400 text-xs shrink-0"></i>';
            if (subState.subStatus === 'past_due') {
                badgeText = (typeof window.t === 'function') ? window.t('paywall.badge_past_due', 'Pago Pendiente') : 'Pago Pendiente';
            } else if (subState.subStatus === 'canceled') {
                badgeText = (typeof window.t === 'function') ? window.t('paywall.badge_canceled', 'Suscripción Cancelada') : 'Suscripción Cancelada';
            } else {
                badgeText = (typeof window.t === 'function') ? window.t('paywall.badge_expired', 'Suscripción Vencida') : 'Suscripción Vencida';
            }
            colorClasses = "bg-rose-950/90 text-rose-300 border-rose-700/80 shadow-sm animate-pulse";
        } else if (subState.isTrial) {
            iconHtml = '<i class="fa-solid fa-clock text-amber-400 text-xs shrink-0"></i>';
            badgeText = (typeof window.t === 'function')
                ? window.t('nav.trial_badge', 'Prueba: {0}d').replace('{0}', subState.daysRemaining)
                : `Prueba: ${subState.daysRemaining}d`;
            colorClasses = subState.daysRemaining <= 3
                ? "bg-amber-950/90 text-amber-400 border-amber-700 animate-pulse"
                : "bg-emerald-950/90 text-emerald-400 border-emerald-800";
        }

        userBadge.innerHTML = `
            ${iconHtml}
            <span class="nav-pill-label text-xs font-bold whitespace-nowrap overflow-hidden">${badgeText}</span>
        `;
        userBadge.className = `nav-pill-expandable border shadow-sm cursor-default select-none ${colorClasses}`;
        userBadge.title = badgeText;
    }
}

/**
 * Aplica o retira el Modo Solo Lectura en la interfaz (Mantenido por compatibilidad)
 */
function applyReadOnlyMode(isReadOnly, message = "") {
    if (isReadOnly) {
        applyPaywallLockdown(true, { message });
    } else {
        applyPaywallLockdown(false);
    }
}

window.addEventListener('languageChanged', () => {
    checkSubscriptionAccess();
    if (isMandatoryLockdown) {
        applyPaywallLockdown(true);
    }
    updateCheckoutPricingDisplay();
    updateSandboxModeBanner();
});

/**
 * Control del Flujo en 2 Pasos del Checkout (Sin scroll vertical)
 */
function showCheckoutStep(step) {
    const stepPlans = document.getElementById('checkout-step-plans');
    const stepPayment = document.getElementById('checkout-step-payment');
    if (!stepPlans || !stepPayment) return;

    if (step === 'payment') {
        stepPlans.classList.add('hidden');
        stepPayment.classList.remove('hidden');
        updateCheckoutPricingDisplay();
    } else {
        stepPayment.classList.add('hidden');
        stepPlans.classList.remove('hidden');
        const sandboxCard = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
        if (sandboxCard) sandboxCard.classList.add('hidden');
        const invoiceDiv = document.getElementById('checkout-crypto-invoice');
        if (invoiceDiv) invoiceDiv.classList.add('hidden');
        setCheckoutDrawerError('checkout-stripe-error', '');
        setCheckoutDrawerError('checkout-crypto-error', '');
    }
}

function backToCheckoutPlans() {
    showCheckoutStep('plans');
}

/**
 * Control del Modal de Checkout
 */
function openCheckoutModal(defaultPeriod = 'month', isMandatory = false) {
    if (isMandatory) {
        isMandatoryLockdown = true;
    }
    if (typeof closeAppTour === 'function') {
        const tourOverlay = document.getElementById('tourOverlay');
        if (tourOverlay && !tourOverlay.classList.contains('hidden')) {
            closeAppTour();
        }
    }
    // Si viene un período explícito válido por parámetro, priorizarlo; si no, consultar localStorage
    if (defaultPeriod && PAYMENTS_CONFIG.pricing[defaultPeriod]) {
        selectedCheckoutPeriod = defaultPeriod;
        try { localStorage.setItem('preferred_billing_cycle', defaultPeriod); } catch(e) {}
    } else {
        const savedPeriod = localStorage.getItem('preferred_billing_cycle');
        selectedCheckoutPeriod = (savedPeriod && PAYMENTS_CONFIG.pricing[savedPeriod]) ? savedPeriod : 'month';
    }
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    selectCheckoutPeriod(selectedCheckoutPeriod);
    showCheckoutStep('plans');
    updateCheckoutPricingDisplay();
    updateSandboxModeBanner();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCheckoutModal(force = false) {
    if (isMandatoryLockdown && !force) return;
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    showCheckoutStep('plans');
}

function selectCheckoutPeriod(period) {
    selectedCheckoutPeriod = PAYMENTS_CONFIG.pricing[period] ? period : 'month';
    try { localStorage.setItem('preferred_billing_cycle', selectedCheckoutPeriod); } catch(e) {}
    ['month', 'quarter', 'semester', 'year'].forEach(p => {
        const btn = document.getElementById('checkout-period-' + p);
        if (btn) {
            if (p === selectedCheckoutPeriod) {
                btn.className = "px-2.5 py-2 text-xs font-extrabold rounded-lg bg-emerald-500 text-gray-950 shadow transition";
            } else {
                btn.className = "px-2.5 py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition";
            }
        }
    });

    updateCheckoutPricingDisplay();
}

function updateCheckoutPricingDisplay() {
    const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
    if (!plan) return;

    const promoActive = isLaunchPromoActive();
    const effectivePrice = getEffectivePlanPrice(selectedCheckoutPeriod);
    const periodText = (typeof window.t === 'function' && plan.periodKey) ? window.t(plan.periodKey, plan.periodText) : plan.periodText;
    const descKey = promoActive ? plan.descKey : plan.regularDescKey;
    const descFallback = promoActive ? plan.desc : plan.regularDesc;
    const descText = (typeof window.t === 'function' && descKey) ? window.t(descKey, descFallback) : descFallback;

    const bfBannerEl = document.getElementById('checkout-black-friday-banner');
    if (bfBannerEl) {
        bfBannerEl.classList.toggle('hidden', !promoActive);
    }

    ['month', 'quarter', 'semester', 'year'].forEach(p => {
        const badgeEl = document.getElementById(`checkout-${p}-promo-badge`);
        const pConfig = PAYMENTS_CONFIG.pricing[p];
        if (!badgeEl || !pConfig) return;

        const isSelected = (p === selectedCheckoutPeriod);
        if (promoActive) {
            badgeEl.textContent = `-${pConfig.discountPct || 20}%`;
            badgeEl.classList.remove('hidden');
            badgeEl.className = isSelected
                ? 'text-[9px] bg-gray-950/20 text-gray-950 px-1 py-0.2 rounded ml-0.5 font-black'
                : 'text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded ml-0.5 font-black';
        } else if (pConfig.standardBadge) {
            badgeEl.textContent = pConfig.standardBadge;
            badgeEl.classList.remove('hidden');
            badgeEl.className = isSelected
                ? 'text-[9px] bg-gray-950/20 text-gray-950 px-1 py-0.2 rounded ml-0.5 font-black'
                : 'text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-700 px-1 py-0.2 rounded ml-0.5';
        } else {
            badgeEl.classList.add('hidden');
        }
    });

    const priceEl = document.getElementById('checkout-price-amount');
    const descEl = document.getElementById('checkout-period-label');
    const subDescEl = document.getElementById('checkout-period-desc');
    const promoRowEl = document.getElementById('checkout-promo-row');
    const savingsPillEl = document.getElementById('checkout-savings-pill');
    const regularWrapEl = document.getElementById('checkout-regular-price-wrap');
    const regularPriceEl = document.getElementById('checkout-regular-price');
    const trialBonusBadge = document.getElementById('checkout-trial-bonus-badge');

    if (priceEl) priceEl.textContent = `$${effectivePrice} USD`;
    if (descEl) descEl.textContent = periodText;
    if (subDescEl) subDescEl.textContent = descText;

    const savingsAmount = Math.max(0, (plan.regularPrice || 0) - (plan.promoPrice || 0));
    const showDiscountBreakdown = promoActive && savingsAmount > 0;
    if (promoRowEl) promoRowEl.classList.toggle('hidden', !showDiscountBreakdown);
    if (regularWrapEl) regularWrapEl.classList.toggle('hidden', !showDiscountBreakdown);
    if (regularPriceEl && plan.regularPrice) {
        regularPriceEl.textContent = `$${plan.regularPrice} USD`;
    }
    if (savingsPillEl && showDiscountBreakdown) {
        const savingsTpl = (typeof window.t === 'function')
            ? window.t('checkout.savings_label', 'Ahorras ${0} USD')
            : 'Ahorras ${0} USD';
        savingsPillEl.textContent = savingsTpl.replace('{0}', String(savingsAmount));
    }

    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    const trial = (user && typeof getTrialInfo === 'function') ? getTrialInfo(user) : null;
    if (trialBonusBadge) {
        const hasCarryover = Boolean(trial && trial.isTrial && !trial.expired && trial.daysRemaining > 0 && (!user.subscription || user.subscription.status !== 'active'));
        if (hasCarryover) {
            const tpl = (typeof window.t === 'function')
                ? window.t('checkout.trial_bonus_note', '+{0}d restantes de tu prueba gratis incluidos')
                : `+{0}d restantes de tu prueba gratis incluidos`;
            trialBonusBadge.innerHTML = `<i class="fa-solid fa-gift text-[9px]"></i> ${tpl.replace('{0}', trial.daysRemaining)}`;
            trialBonusBadge.classList.remove('hidden');
        } else {
            trialBonusBadge.classList.add('hidden');
        }
    }

    const step2Badge = document.getElementById('checkout-step2-plan-badge');
    if (step2Badge) step2Badge.textContent = `${periodText} · $${effectivePrice}.00 USD`;

    const stripeAmt = document.getElementById('stripe-sandbox-amount');
    if (stripeAmt) stripeAmt.textContent = `$${effectivePrice}.00 USD (${periodText})`;

    const recurringNoteEl = document.getElementById('stripe-card-recurring-note');
    if (recurringNoteEl) {
        if (selectedCheckoutPeriod === 'month') {
            recurringNoteEl.textContent = promoActive
                ? ((typeof window.t === 'function')
                    ? window.t('checkout.card_redirect_month_promo', 'Serás redirigido a Stripe seguro. Hoy abonas $20 USD (20% OFF Black Friday 1er mes) y a partir del mes 2 continúa automáticamente a $25 USD/mes.')
                    : 'Serás redirigido a Stripe seguro. Hoy abonas $20 USD (20% OFF Black Friday 1er mes) y a partir del mes 2 continúa automáticamente a $25 USD/mes.')
                : ((typeof window.t === 'function')
                    ? window.t('checkout.card_redirect_month_reg', 'Serás redirigido a Stripe seguro para activar tu suscripción mensual recurrente de $25 USD/mes.')
                    : 'Serás redirigido a Stripe seguro para activar tu suscripción mensual recurrente de $25 USD/mes.');
        } else {
            const baseText = (typeof window.t === 'function')
                ? window.t('checkout.card_redirect_pack', 'Serás redirigido a Stripe seguro para abonar ${0} USD por tu pack inicial ({1}). Al finalizar tu período inicial, tu membresía continúa automáticamente a $25 USD/mes.')
                : 'Serás redirigido a Stripe seguro para abonar ${0} USD por tu pack inicial ({1}). Al finalizar tu período inicial, tu membresía continúa automáticamente a $25 USD/mes.';
            recurringNoteEl.textContent = baseText.replace('{0}', effectivePrice).replace('{1}', periodText);
        }
    }

    const cryptoAmt = document.getElementById('crypto-amount-display');
    if (cryptoAmt) cryptoAmt.textContent = `${effectivePrice}.00 USDT`;
}

function updateSandboxModeBanner() {
    const badge = document.getElementById('checkout-mode-indicator');
    if (badge) {
        const isEn = typeof window.i18n !== 'undefined' && window.i18n.getLanguage() === 'en';
        if (PAYMENTS_CONFIG.mode === 'test') {
            const label = (typeof window.t === 'function') ? window.t('checkout.sandbox_active', 'Modo Sandbox Activo') : (isEn ? 'Sandbox Mode Active' : 'Modo Sandbox Activo');
            badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> ${label}`;
            badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60";
        } else {
            const label = (typeof window.t === 'function') ? window.t('checkout.official_production', 'Producción Oficial') : (isEn ? 'Official Production' : 'Producción Oficial');
            badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ${label}`;
            badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60";
        }
    }
}

async function getCheckoutAuthToken() {
    if (typeof getSupabase !== 'function') return null;
    const sb = getSupabase();
    if (!sb || !sb.auth) return null;
    try {
        const { data } = await sb.auth.getSession();
        let token = data && data.session && data.session.access_token;
        if (!token) {
            const { data: refreshed } = await sb.auth.refreshSession();
            token = refreshed && refreshed.session && refreshed.session.access_token;
        }
        return token || null;
    } catch (err) {
        console.warn('[AsTrade Payments] Error obteniendo token de sesión:', err);
        return null;
    }
}

function setCheckoutBtnLoading(btnId, isLoading, loadingText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        if (!btn.dataset.originalHtml) {
            btn.dataset.originalHtml = btn.innerHTML;
        }
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${loadingText}</span>`;
    } else {
        btn.disabled = false;
        if (btn.dataset.originalHtml) {
            btn.innerHTML = btn.dataset.originalHtml;
        }
    }
}

function setCheckoutDrawerError(boxId, message) {
    const box = document.getElementById(boxId);
    if (!box) return;
    if (!message) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
    }
    box.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-400 mt-0.5 shrink-0"></i><span>${message}</span>`;
    box.classList.remove('hidden');
}

function openPaymentMethodDrawer(method) {
    showCheckoutStep('payment');
    const stripeDiv = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
    const invoiceDiv = document.getElementById('checkout-crypto-invoice');

    setCheckoutDrawerError('checkout-stripe-error', '');
    setCheckoutDrawerError('checkout-crypto-error', '');

    if (method === 'stripe') {
        if (invoiceDiv) invoiceDiv.classList.add('hidden');
        if (stripeDiv) stripeDiv.classList.remove('hidden');
    } else {
        if (stripeDiv) stripeDiv.classList.add('hidden');
        if (invoiceDiv) invoiceDiv.classList.remove('hidden');
    }

    updateCheckoutPricingDisplay();
}

function showCardCheckoutStep() {
    openPaymentMethodDrawer('stripe');
}

function showCryptoCheckout() {
    openPaymentMethodDrawer('crypto');
}

function hideCardSandbox() {
    backToCheckoutPlans();
}
const showCardSandbox = showCardCheckoutStep;
const showStripeSandbox = showCardCheckoutStep;
const hideStripeSandbox = hideCardSandbox;

function hideCryptoInvoice() {
    backToCheckoutPlans();
}

async function startHostedCheckout({ endpoint, btnId, loadingKey, defaultLoading, errorBoxId, urlField, notConfiguredKey, notConfiguredFallback }) {
    setCheckoutDrawerError(errorBoxId, '');
    const loadingText = (typeof window.t === 'function') ? window.t(loadingKey, defaultLoading) : defaultLoading;
    setCheckoutBtnLoading(btnId, true, loadingText);

    try {
        const token = await getCheckoutAuthToken();
        if (!token) {
            const reloginMsg = (typeof window.t === 'function')
                ? window.t('checkout.relogin_required', 'Tu sesión expiró. Inicia sesión nuevamente para continuar al pago.')
                : 'Tu sesión expiró. Inicia sesión nuevamente para continuar al pago.';
            setCheckoutDrawerError(errorBoxId, reloginMsg);
            if (typeof showToast === 'function') showToast(reloginMsg, false);
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.anonKey) {
            headers['apikey'] = SUPABASE_CONFIG.anonKey;
        }

        const res = await fetch(`${getEdgeFunctionsBase()}/${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ plan_interval: selectedCheckoutPeriod })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data[urlField]) {
            let errMsg = data.message || data.error || 'Error iniciando checkout';
            if (res.status === 503 && notConfiguredKey) {
                errMsg = (typeof window.t === 'function')
                    ? window.t(notConfiguredKey, notConfiguredFallback)
                    : notConfiguredFallback;
            }
            setCheckoutDrawerError(errorBoxId, errMsg);
            if (typeof showToast === 'function') showToast(errMsg, false);
            return;
        }

        window.location.assign(data[urlField]);
    } catch (err) {
        const netMsg = (err && err.message) ? err.message : 'Error de conexión con el servidor de pagos.';
        setCheckoutDrawerError(errorBoxId, netMsg);
        if (typeof showToast === 'function') showToast(netMsg, false);
    } finally {
        setCheckoutBtnLoading(btnId, false);
    }
}

/**
 * Procesa el pago con Tarjeta via Supabase Edge Function -> Stripe Checkout Session
 */
function handleStripeCheckout() {
    return startHostedCheckout({
        endpoint: 'create-stripe-checkout',
        btnId: 'btn-stripe-checkout-submit',
        loadingKey: 'checkout.loading_stripe',
        defaultLoading: 'Conectando con Stripe...',
        errorBoxId: 'checkout-stripe-error',
        urlField: 'url',
        notConfiguredKey: 'checkout.gateway_not_ready',
        notConfiguredFallback: 'La pasarela Stripe está pendiente de activación de credenciales Live en el servidor.'
    });
}

/**
 * Procesa el pago con Criptomonedas via Supabase Edge Function -> NOWPayments Hosted Invoice
 */
function handleCryptoCheckout() {
    return startHostedCheckout({
        endpoint: 'create-nowpayments-invoice',
        btnId: 'btn-crypto-checkout-submit',
        loadingKey: 'checkout.loading_crypto',
        defaultLoading: 'Generando factura segura...',
        errorBoxId: 'checkout-crypto-error',
        urlField: 'invoice_url',
        notConfiguredKey: 'checkout.gateway_not_ready_crypto',
        notConfiguredFallback: 'La pasarela NOWPayments está pendiente de activación de credenciales Live en el servidor.'
    });
}

// Aliases para compatibilidad completa
const handleCardCheckout = handleStripeCheckout;
const handleLemonSqueezyCheckout = handleStripeCheckout;

/**
 * Procesa la activación de suscripción autorizada
 */
async function completeSubscriptionPayment(periodKey, provider, transactionId) {
    if (PAYMENTS_CONFIG.mode === 'live') {
        console.warn("[AsTrade Security] Las activaciones de suscripción en cliente están deshabilitadas en producción. Se gestionan exclusivamente por webhooks autenticados.");
        return;
    }
    const plan = PAYMENTS_CONFIG.pricing[periodKey] || PAYMENTS_CONFIG.pricing.month;
    const now = new Date();

    let user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) {
        user = {
            id: 'usr_' + Date.now().toString(36),
            email: 'trader@email.com',
            name: 'Trader Pro'
        };
    }

    // Preservar y acumular días restantes de prueba gratuita si el usuario compra durante su trial
    let remainingTrialMs = 0;
    if (user.trial_ends_at) {
        const trialEnd = new Date(user.trial_ends_at).getTime();
        if (trialEnd > now.getTime()) {
            remainingTrialMs = trialEnd - now.getTime();
        }
    }
    const planDurationMs = plan.periodDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + remainingTrialMs + planDurationMs);
    const bonusTrialDays = Math.ceil(remainingTrialMs / (24 * 60 * 60 * 1000));

    if (bonusTrialDays > 0) {
        console.log(`[AsTrade Payments] Sumando ${bonusTrialDays} días restantes de prueba al plan pagado.`);
    }

    const subData = {
        status: 'active',
        provider: provider, // 'stripe' | 'nowpayments'
        plan: periodKey,
        plan_name: `Membresía Pro (${plan.periodText})`,
        price: plan.price,
        current_period_end: expiresAt.toISOString(),
        bonus_trial_days: bonusTrialDays,
        transaction_id: transactionId || ('sim_' + Date.now()),
        updated_at: now.toISOString()
    };

    user.subscription = subData;

    // 1. Guardar en localStorage de sesión
    if (typeof saveUserSession === 'function') {
        saveUserSession(user);
    } else {
        localStorage.setItem('trading_saas_user_session', JSON.stringify(user));
    }

    // 2. Actualizar interfaz y permisos
    applyPaywallLockdown(false);
    closeCheckoutModal(true);
    checkSubscriptionAccess();

    // 4. Mostrar modal de celebración con confeti
    showSubscriptionCelebration(subData);
}

/**
 * Muestra el modal de felicitación por Membresía Pro activada
 */
function showSubscriptionCelebration(subData) {
    const modal = document.getElementById('subscriptionCelebrationModal');
    if (!modal) {
        alert(`¡Felicitaciones! Tu ${subData.plan_name} ha sido activada con éxito hasta el ${new Date(subData.current_period_end).toLocaleDateString()}.`);
        return;
    }

    const planEl = document.getElementById('sub-success-plan');
    const dateEl = document.getElementById('sub-success-date');
    const transEl = document.getElementById('sub-success-transid');

    if (planEl) planEl.textContent = subData.plan_name;
    if (dateEl) dateEl.textContent = new Date(subData.current_period_end).toLocaleDateString();
    if (transEl) transEl.textContent = subData.transaction_id;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Efecto de confeti visual
    triggerConfettiEffect();
}

function closeSubscriptionCelebration() {
    const modal = document.getElementById('subscriptionCelebrationModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

/**
 * Genera una explosión de confeti suave para celebrar la suscripción
 */
function triggerConfettiEffect() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    }
}

async function sleepMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Escucha parámetros en la URL tras retorno de pasarela de pago
 * Verifica el estado real con el backend haciendo polling breve hasta que el webhook confirme
 */
async function checkUrlPaymentParams() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const checkoutParam = urlParams.get('checkout');
        const providerParam = urlParams.get('provider') || '';
        const hasSessionId = urlParams.has('session_id');

        if (checkoutParam === 'canceled') {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (typeof showToast === 'function') {
                const cancelMsg = (typeof window.t === 'function')
                    ? window.t('checkout.canceled_toast', 'Pago cancelado. Puedes intentarlo nuevamente cuando quieras.')
                    : 'Pago cancelado. Puedes intentarlo nuevamente cuando quieras.';
                showToast(cancelMsg, false);
            }
            return;
        }

        const isPaymentReturn = checkoutParam === 'success' || hasSessionId;
        if (!isPaymentReturn) return;

        window.history.replaceState({}, document.title, window.location.pathname);

        const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        if (!user || typeof apiFetchSubscription !== 'function') return;

        const prevUpdatedAt = user.subscription && user.subscription.updated_at ? user.subscription.updated_at : null;
        const wasAlreadyActive = Boolean(
            user.subscription &&
            user.subscription.status === 'active' &&
            new Date(user.subscription.current_period_end || 0).getTime() > Date.now()
        );

        if (typeof showToast === 'function') {
            const pollMsg = (typeof window.t === 'function')
                ? window.t('checkout.polling_msg', 'Verificando confirmación de suscripción...')
                : 'Verificando confirmación de suscripción...';
            showToast(pollMsg, false);
        }

        let confirmedSub = null;
        const maxAttempts = 10;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const sub = await apiFetchSubscription(user.id);
            const isSubActive = Boolean(
                sub &&
                sub.status === 'active' &&
                new Date(sub.current_period_end || 0).getTime() > Date.now()
            );

            if (isSubActive) {
                if (!wasAlreadyActive || (prevUpdatedAt && sub.updated_at && sub.updated_at !== prevUpdatedAt) || attempt >= 3) {
                    confirmedSub = sub;
                    break;
                }
            }
            if (attempt < maxAttempts - 1) {
                await sleepMs(2500);
            }
        }

        if (confirmedSub) {
            user.subscription = confirmedSub;
            if (typeof saveUserSession === 'function') {
                saveUserSession(user);
            }
            if (typeof applyPaywallLockdown === 'function') {
                applyPaywallLockdown(false);
            }
            if (typeof closeCheckoutModal === 'function') {
                closeCheckoutModal(true);
            }
            checkSubscriptionAccess();
            if (typeof showSubscriptionCelebration === 'function') {
                const planKey = confirmedSub.plan_interval || confirmedSub.plan || 'month';
                const planObj = PAYMENTS_CONFIG.pricing[planKey];
                const periodLabel = planObj
                    ? ((typeof window.t === 'function' && planObj.periodKey) ? window.t(planObj.periodKey, planObj.periodText) : planObj.periodText)
                    : planKey;
                const celebrationData = Object.assign({}, confirmedSub, {
                    plan_name: confirmedSub.plan_name || `AsTrade Pro (${periodLabel})`,
                    transaction_id: confirmedSub.stripe_subscription_id || confirmedSub.nowpayments_payment_id || (providerParam ? providerParam.toUpperCase() : 'PRO')
                });
                showSubscriptionCelebration(celebrationData);
            }
            if (typeof showToast === 'function') {
                const okMsg = (typeof window.t === 'function')
                    ? window.t('checkout.verified_toast', '¡Membresía Pro verificada con éxito!')
                    : '¡Membresía Pro verificada con éxito!';
                showToast(okMsg, true);
            }
        } else if (typeof showToast === 'function') {
            const pendingKey = providerParam === 'nowpayments' ? 'checkout.crypto_pending_msg' : 'checkout.payment_pending_msg';
            const fallbackMsg = providerParam === 'nowpayments'
                ? 'Tu pago cripto está confirmándose en la red. Tu acceso Pro se activará automáticamente en unos momentos.'
                : 'El pago está siendo procesado por Stripe. Tu cuenta se activará automáticamente en segundos.';
            showToast((typeof window.t === 'function') ? window.t(pendingKey, fallbackMsg) : fallbackMsg, false);
        }
    } catch (e) {
        console.warn("Error leyendo parámetros de pago en URL:", e);
    }
}

/**
 * Copiar texto al portapapeles
 */
function copyToClipboard(text, elementId = null) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            if (elementId) {
                const el = document.getElementById(elementId);
                const originalText = el.innerHTML;
                el.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> Copiado!';
                setTimeout(() => { el.innerHTML = originalText; }, 2000);
            }
        });
    }
}

/**
 * Compra directa de plan (salta o conecta tras registro/login)
 */
function openDirectCheckout(periodKey) {
    if (periodKey) {
        selectedCheckoutPeriod = periodKey;
        try {
            localStorage.setItem('preferred_billing_cycle', periodKey);
        } catch (e) {}
    }
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (user) {
        if (typeof openCheckoutModal === 'function') {
            openCheckoutModal(periodKey || 'month');
        } else {
            window.location.href = 'app.html?open_checkout=' + encodeURIComponent(periodKey || 'month');
        }
    } else {
        try {
            localStorage.setItem('direct_checkout_after_login', periodKey || 'month');
        } catch (e) {}
        if (typeof openAuthModal === 'function') {
            openAuthModal('register', true);
        } else {
            window.location.href = 'index.html?action=register';
        }
    }
}

// Prevenir cierre del modal por Escape durante Bloqueo Paywall
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMandatoryLockdown) {
        e.stopPropagation();
        e.preventDefault();
    }
}, true);

// Inicialización automática de escuchas
function initPaymentsAutoCheckout() {
    checkUrlPaymentParams();

    // Auto-abrir checkout si se solicitó compra directa tras login/registro
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const openCheckoutParam = urlParams.get('open_checkout');
        const directPlan = openCheckoutParam || localStorage.getItem('direct_checkout_after_login');
        if (openCheckoutParam) {
            urlParams.delete('open_checkout');
            const remainingSearch = urlParams.toString();
            const cleanUrl = window.location.pathname + (remainingSearch ? '?' + remainingSearch : '') + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        if (directPlan) {
            localStorage.removeItem('direct_checkout_after_login');
            setTimeout(() => {
                if (typeof openCheckoutModal === 'function') {
                    openCheckoutModal(directPlan);
                }
            }, 600);
        }
    } catch (e) {}

    const checkoutModalEl = document.getElementById('checkoutModal');
    if (checkoutModalEl) {
        checkoutModalEl.addEventListener('click', (e) => {
            if (isMandatoryLockdown) {
                e.stopPropagation();
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaymentsAutoCheckout);
} else {
    initPaymentsAutoCheckout();
}

window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.selectCheckoutPeriod = selectCheckoutPeriod;
window.showCardCheckoutStep = showCardCheckoutStep;
window.handleStripeCheckout = handleStripeCheckout;
window.showCryptoCheckout = showCryptoCheckout;
window.handleCryptoCheckout = handleCryptoCheckout;
window.backToCheckoutPlans = backToCheckoutPlans;
window.checkSubscriptionAccess = checkSubscriptionAccess;
window.openDirectCheckout = openDirectCheckout;

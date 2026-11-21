/**
 * Payments & Subscriptions Module — AsTrade SaaS
 * Gestiona el Checkout para Tarjetas (Stripe) y Criptomonedas (NOWPayments USDT).
 * Incluye un Modo Sandbox / Test interactivo para probar el flujo completo sin dinero real.
 * Maneja el Modo Solo Lectura para cuentas con período vencido.
 */

// Configuración de Pasarelas y Precios
const PAYMENTS_CONFIG = {
    // 'test': Modo Sandbox interactivo para pruebas seguras sin cobros reales
    // 'live': Modo Producción oficial con cobros reales
    mode: 'test',

    // Lemon Squeezy (Merchant of Record oficial — opera desde Argentina para todo el mundo)
    lemonsqueezy: {
        storeSlug: "tradingjournalpro",
        // URLs directas de checkout configuradas en Lemon Squeezy Dashboard
        checkoutUrls: {
            month: "https://tradingjournalpro.lemonsqueezy.com/buy/test_month_plan",
            quarter: "https://tradingjournalpro.lemonsqueezy.com/buy/test_quarter_plan",
            year: "https://tradingjournalpro.lemonsqueezy.com/buy/test_year_plan"
        }
    },

    // Respaldo / Compatibilidad Stripe
    stripe: {
        publishableKey: window.ENV_STRIPE_KEY || "pk_test_sample",
        paymentLinks: {
            month: "https://buy.stripe.com/test_month_7days_trial",
            quarter: "https://buy.stripe.com/test_quarter_plan",
            semester: "https://buy.stripe.com/test_semester_plan",
            year: "https://buy.stripe.com/test_year_plan"
        }
    },

    nowpayments: {
        apiKey: window.ENV_NOWPAYMENTS_KEY || "", // Tu API Key de NOWPayments
        apiBase: "https://api.nowpayments.io/v1",
        // Billeteras oficiales para depósitos directos en USDT
        fallbackWallets: {
            "USDT_TRC20": "TYDzsYUb93ExampleTRC20AddressPlaceholder77",
            "USDT_BEP20": "0x71C69446B92ExampleBEP20AddressPlaceholder",
            "USDT_POLYGON": "0x71C69446B92ExampleBEP20AddressPlaceholder"
        }
    },

    pricing: {
        month: { 
            price: 20, 
            originalPrice: 25,
            periodDays: 30, 
            periodKey: 'checkout.period_month_label',
            periodText: 'por 1 Mes', 
            descKey: 'checkout.trial_desc',
            desc: 'Oferta Black Friday (-20% 1er mes): $20 USD · 7 días gratis ($0 hoy)' 
        },
        quarter: { 
            price: 56, 
            originalPrice: 70,
            periodDays: 90, 
            periodKey: 'checkout.period_quarter_label',
            periodText: 'por 3 Meses', 
            descKey: 'checkout.quarter_desc',
            desc: 'Oferta Black Friday (Ahorro congelado $14): $56 USD por 3 meses ($18.67/mes)' 
        },
        semester: { 
            price: 108, 
            originalPrice: 135,
            periodDays: 180, 
            periodKey: 'checkout.period_semester_label',
            periodText: 'por 6 Meses', 
            descKey: 'checkout.semester_desc',
            desc: 'Oferta Black Friday (Ahorro congelado $27): $108 USD por 6 meses ($18.00/mes)' 
        },
        year: { 
            price: 200, 
            originalPrice: 250,
            periodDays: 365, 
            periodKey: 'checkout.period_year_label',
            periodText: 'por 12 Meses', 
            descKey: 'checkout.year_desc',
            desc: 'Oferta Black Friday (Máximo Ahorro congelado $50): $200 USD por 12 meses ($16.67/mes)' 
        }
    }
};

let selectedCheckoutPeriod = 'month';
let selectedCryptoCurrency = 'usdttrc20';
let isMandatoryLockdown = false;

/**
 * Determina si la suscripción o período de prueba del usuario actual está vencida
 */
function isSubscriptionExpired() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) return false;

    // 1. Suscripción de pago (Stripe / NOWPayments)
    if (user.subscription && user.subscription.status === 'active') {
        const expDate = new Date(user.subscription.current_period_end || Date.now());
        return expDate.getTime() <= Date.now();
    }
    if (user.subscription && user.subscription.status === 'expired') {
        return true;
    }

    // 2. Período de prueba
    const trial = (typeof getTrialInfo === 'function') ? getTrialInfo(user) : { expired: false, daysRemaining: 7 };
    return Boolean(trial.expired);
}

/**
 * Aplica o retira el bloqueo Paywall obligatorio (fondo desenfocado + modal obligatorio sin X)
 */
function applyPaywallLockdown(isExpired, details = {}) {
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

        // Cerrar modal si estaba en bloqueo
        closeCheckoutModal(true);
    }
}

/**
 * Verifica si el usuario actual tiene acceso completo o debe estar en Modo Bloqueo Paywall
 */
function checkSubscriptionAccess() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) return { canEdit: false, isReadOnly: true, reason: 'unauthenticated' };

    // 1. Si tiene suscripción de pago (Stripe / NOWPayments)
    if (user.subscription && user.subscription.status === 'active') {
        const expDate = new Date(user.subscription.current_period_end || Date.now());
        const isStillValid = expDate.getTime() > Date.now();

        if (isStillValid) {
            applyPaywallLockdown(false);
            updateAppSubscriptionUI({
                isPaid: true,
                isTrial: false,
                plan: user.subscription.plan_name || 'Membresía Pro',
                expiresAt: expDate
            });
            return { canEdit: true, isReadOnly: false, isPaid: true, expiresAt: expDate };
        } else {
            applyPaywallLockdown(true, { isProExpired: true, reason: 'subscription_expired' });
            updateAppSubscriptionUI({
                isPaid: false,
                isTrial: false,
                expired: true,
                plan: 'Membresía Vencida'
            });
            return { canEdit: false, isReadOnly: true, reason: 'subscription_expired' };
        }
    }

    if (user.subscription && user.subscription.status === 'expired') {
        applyPaywallLockdown(true, { isProExpired: true, reason: 'subscription_expired' });
        updateAppSubscriptionUI({
            isPaid: false,
            isTrial: false,
            expired: true,
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
            badgeText = (typeof window.t === 'function') ? window.t('paywall.badge_expired', 'Suscripción Vencida') : `Suscripción Vencida`;
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
    updateUserNavBadge();
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

        // Actualizar resumen del plan en la barra del Paso 2
        const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
        if (plan) {
            const periodText = (typeof window.t === 'function' && plan.periodKey) ? window.t(plan.periodKey, plan.periodText) : plan.periodText;
            const badge = document.getElementById('checkout-step2-plan-badge');
            if (badge) {
                badge.textContent = `${periodText} · $${plan.price}.00 USD`;
            }
        }
    } else {
        stepPayment.classList.add('hidden');
        stepPlans.classList.remove('hidden');
        const sandboxCard = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
        if (sandboxCard) sandboxCard.classList.add('hidden');
        const invoiceDiv = document.getElementById('checkout-crypto-invoice');
        if (invoiceDiv) invoiceDiv.classList.add('hidden');
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
    const savedPeriod = localStorage.getItem('preferred_billing_cycle');
    if (savedPeriod && PAYMENTS_CONFIG.pricing[savedPeriod]) {
        selectedCheckoutPeriod = savedPeriod;
    } else {
        selectedCheckoutPeriod = defaultPeriod;
    }
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

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
    selectedCheckoutPeriod = period;
    ['month', 'quarter', 'semester', 'year'].forEach(p => {
        const btn = document.getElementById('checkout-period-' + p);
        if (btn) {
            if (p === period) {
                btn.className = "px-3 py-2 text-xs font-extrabold rounded-lg bg-emerald-500 text-gray-950 shadow transition";
            } else {
                btn.className = "px-3 py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition";
            }
        }
    });

    updateCheckoutPricingDisplay();
    hideStripeSandbox();
    hideCryptoInvoice();
}

function updateCheckoutPricingDisplay() {
    const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
    if (!plan) return;

    const priceEl = document.getElementById('checkout-price-amount');
    const descEl = document.getElementById('checkout-period-label');
    const subDescEl = document.getElementById('checkout-period-desc');

    const periodText = (typeof window.t === 'function' && plan.periodKey) ? window.t(plan.periodKey, plan.periodText) : plan.periodText;
    const descText = (typeof window.t === 'function' && plan.descKey) ? window.t(plan.descKey, plan.desc) : plan.desc;

    if (priceEl) priceEl.textContent = `$${plan.price} USD`;
    if (descEl) descEl.textContent = periodText;
    if (subDescEl) subDescEl.textContent = descText;

    // Actualiza monto en drawers si están abiertos
    const stripeAmt = document.getElementById('stripe-sandbox-amount');
    if (stripeAmt) stripeAmt.textContent = `$${plan.price}.00 USD (${periodText})`;

    const cryptoAmt = document.getElementById('crypto-amount-display');
    if (cryptoAmt) cryptoAmt.textContent = `${plan.price}.00 USDT`;
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

/**
 * Procesa el pago con Tarjeta (Stripe como pasarela principal)
 */
function handleStripeCheckout() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    hideCryptoInvoice();

    if (PAYMENTS_CONFIG.mode === 'test') {
        // En Sandbox: abre el panel interactivo de prueba
        showCardSandbox();
        return;
    }

    // En Producción: Redirige al Checkout oficial de Stripe
    const stripeLink = PAYMENTS_CONFIG.stripe && PAYMENTS_CONFIG.stripe.paymentLinks[selectedCheckoutPeriod];
    if (stripeLink && stripeLink.startsWith('http')) {
        const userEmail = encodeURIComponent((user && user.email) || '');
        const clientRef = encodeURIComponent((user && user.id) || '');
        const sep = stripeLink.includes('?') ? '&' : '?';
        window.open(`${stripeLink}${sep}prefilled_email=${userEmail}&client_reference_id=${clientRef}`, '_blank');
    } else {
        // Fallback Lemon Squeezy si estuviese configurado
        const url = PAYMENTS_CONFIG.lemonsqueezy && PAYMENTS_CONFIG.lemonsqueezy.checkoutUrls[selectedCheckoutPeriod];
        if (url && url.startsWith('http')) {
            const userEmail = encodeURIComponent((user && user.email) || '');
            const userId = encodeURIComponent((user && user.id) || '');
            const sep = url.includes('?') ? '&' : '?';
            const targetUrl = `${url}${sep}checkout[email]=${userEmail}&checkout[custom][user_id]=${userId}`;
            window.open(targetUrl, '_blank');
        } else {
            alert("Enlace de Stripe en configuración. Asigna tus URLs en js/payments.js");
        }
    }
}

// Aliases para compatibilidad completa
const handleCardCheckout = handleStripeCheckout;
const handleLemonSqueezyCheckout = handleStripeCheckout;

function showCardSandbox() {
    showCheckoutStep('payment');
    const invoiceDiv = document.getElementById('checkout-crypto-invoice');
    if (invoiceDiv) invoiceDiv.classList.add('hidden');
    const sandboxDiv = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
    if (sandboxDiv) {
        sandboxDiv.classList.remove('hidden');
        updateCheckoutPricingDisplay();
    }
}
const showStripeSandbox = showCardSandbox;

function hideCardSandbox() {
    backToCheckoutPlans();
}
const hideStripeSandbox = hideCardSandbox;

/**
 * Simula la aprobación exitosa de un pago con Tarjeta (Stripe) en Sandbox
 */
async function simulateCardPaymentSuccess() {
    const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
    const transId = 'stripe_sub_test_' + Date.now().toString(36);
    await completeSubscriptionPayment(selectedCheckoutPeriod, 'stripe', transId);
}
const simulateStripePaymentSuccess = simulateCardPaymentSuccess;

/**
 * Muestra las opciones y factura para pago con Criptomonedas (USDT)
 */
function showCryptoCheckout() {
    showCheckoutStep('payment');
    const sandboxDiv = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
    if (sandboxDiv) sandboxDiv.classList.add('hidden');
    const invoiceDiv = document.getElementById('checkout-crypto-invoice');
    if (invoiceDiv) {
        invoiceDiv.classList.remove('hidden');
        const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
        const amountSpan = document.getElementById('crypto-amount-display');
        if (amountSpan && plan) amountSpan.textContent = `${plan.price}.00 USDT`;
    }
}

function hideCryptoInvoice() {
    backToCheckoutPlans();
}

/**
 * Simula la confirmación de una transferencia USDT en blockchain
 */
async function simulateCryptoPaymentSuccess() {
    const transId = 'np_tx_test_' + Date.now().toString(36);
    await completeSubscriptionPayment(selectedCheckoutPeriod, 'nowpayments', transId);
}

/**
 * Ejecuta la activación final de la suscripción (Persistencia en LocalStorage + Supabase)
 */
async function completeSubscriptionPayment(periodKey, provider, transactionId) {
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

    // 2. Sincronizar en Supabase si está disponible
    if (typeof supabase !== 'undefined' && supabase && supabase.from) {
        try {
            await supabase.from('subscriptions').upsert({
                user_id: user.id,
                provider: provider,
                status: 'active',
                plan_interval: periodKey,
                current_period_end: expiresAt.toISOString(),
                stripe_subscription_id: transactionId,
                updated_at: now.toISOString()
            });
            console.log("Suscripción sincronizada en Supabase con éxito.");
        } catch (e) {
            console.warn("No se pudo sincronizar con Supabase (modo offline/local):", e);
        }
    }

    // 3. Actualizar interfaz y permisos
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

/**
 * HELPERS PARA DESARROLLO Y PRUEBAS (Sandbox Toolkit)
 */
function simulateTrialExpired() {
    let user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) {
        user = { id: 'usr_test', email: 'trader@email.com', name: 'Trader Test' };
    }

    user.trial_ends_at = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    user.subscription = { status: 'expired' };

    if (typeof saveUserSession === 'function') {
        saveUserSession(user);
    } else {
        localStorage.setItem('trading_saas_user_session', JSON.stringify(user));
    }

    checkSubscriptionAccess();
}

function simulateRestoreTrial() {
    let user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) {
        user = { id: 'usr_test', email: 'trader@email.com', name: 'Trader Test' };
    }

    user.trial_ends_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    user.subscription = { status: 'trial', plan: 'Pro Trial (7 días)' };

    if (typeof saveUserSession === 'function') {
        saveUserSession(user);
    } else {
        localStorage.setItem('trading_saas_user_session', JSON.stringify(user));
    }

    applyPaywallLockdown(false);
    closeCheckoutModal(true);
    checkSubscriptionAccess();
    if (typeof showToast === 'function') {
        showToast("Prueba de 7 días restablecida con éxito");
    }
}

function togglePaymentsMode() {
    PAYMENTS_CONFIG.mode = (PAYMENTS_CONFIG.mode === 'test') ? 'live' : 'test';
    updateSandboxModeBanner();
}

/**
 * Escucha parámetros en la URL (ej. tras redirección de Stripe Checkout)
 */
function checkUrlPaymentParams() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        // Soporta redirección exitosa de Lemon Squeezy y Stripe
        if (urlParams.get('payment_success') === 'true' || urlParams.get('order_status') === 'paid') {
            const period = urlParams.get('period') || 'month';
            const provider = urlParams.get('provider') || 'lemonsqueezy';
            const sessionId = urlParams.get('order_id') || urlParams.get('session_id') || ('ls_live_' + Date.now());
            completeSubscriptionPayment(period, provider, sessionId);

            // Limpiar la URL sin recargar
            window.history.replaceState({}, document.title, window.location.pathname);
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
            openAuthModal('register');
        } else {
            window.location.href = 'index.html?action=register';
        }
    }
}

/**
 * Inicializa el banner promocional dismissible dentro de app.html para usuarios en prueba gratuita
 */
function initAppPromoBanner() {
    const banner = document.getElementById('app-promo-banner');
    if (!banner) return;

    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) {
        banner.classList.add('hidden');
        return;
    }

    const trial = (typeof getTrialInfo === 'function') ? getTrialInfo(user) : { isTrial: false };
    // Solo se muestra si el usuario está en prueba gratuita activa y no vencida
    if (!trial.isTrial || trial.expired) {
        banner.classList.add('hidden');
        return;
    }

    const LAUNCH_START = new Date('2026-11-30T21:00:00+01:00').getTime();
    const PROMO_END = new Date('2026-12-06T23:59:59+01:00').getTime();
    const now = Date.now();

    // Si ya terminó la promoción
    if (now >= PROMO_END) {
        banner.classList.add('hidden');
        return;
    }

    const isLastDay = (now >= PROMO_END - 24 * 60 * 60 * 1000);
    const dismissedAt = localStorage.getItem('astrade_promo_banner_dismissed');

    // Si fue descartado hace menos de 24 horas y NO es el último día, respetar la decisión
    if (dismissedAt && !isLastDay) {
        const timeSinceDismiss = now - parseInt(dismissedAt, 10);
        if (timeSinceDismiss < 24 * 60 * 60 * 1000) {
            banner.classList.add('hidden');
            return;
        }
    }

    const isEn = (localStorage.getItem('astrade_lang') === 'en') || (document.documentElement.lang === 'en');

    if (now < LAUNCH_START) {
        // Fase 1: Pre-lanzamiento
        banner.className = "app-promo-banner py-2 px-4 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md transition-all duration-300";
        banner.innerHTML = `
            <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-gray-950 shadow-sm animate-pulse">
                    <i class="fa-solid fa-rocket text-[9px]"></i> ${isEn ? 'Launch Deal' : 'Lanzamiento'}
                </span>
                <span class="font-medium">
                    ${isEn 
                        ? 'Official Launch on Nov 30 at 21:00 CET. Your 7-day trial is active and you can lock in <strong>20% OFF</strong> before your trial ends!'
                        : 'Gran Lanzamiento el 30 de Noviembre a las 21:00hs. ¡Tu prueba de 7 días está activa y podrás asegurar tu <strong>20% OFF</strong> antes de que termine!'}
                </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="openCheckoutModal('semester')" class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow transition whitespace-nowrap">
                    ${isEn ? 'Preview Offers &rarr;' : 'Ver Ofertas &rarr;'}
                </button>
                <button onclick="dismissAppPromoBanner()" class="text-gray-400 hover:text-white p-1 transition" title="${isEn ? 'Dismiss' : 'Ocultar'}">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        `;
    } else if (isLastDay) {
        // Fase 2 - Último día (Urgencia)
        banner.className = "app-promo-banner app-promo-urgent py-2.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg transition-all duration-300";
        banner.innerHTML = `
            <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-gray-950 shadow-sm animate-bounce">
                    <i class="fa-solid fa-triangle-exclamation text-[9px]"></i> ${isEn ? 'Last Day' : 'Último Día'}
                </span>
                <span class="font-bold">
                    ${isEn
                        ? '⚠️ <strong>Final Hours!</strong> Today at midnight (23:59 CET) the 20% Black Friday discounts expire. If you upgrade today, your remaining trial days are added to your subscription!'
                        : '⚠️ <strong>¡Últimas horas!</strong> Hoy a medianoche (23:59hs) finalizan los descuentos del 20% de Black Friday. ¡Tus días restantes de prueba se sumarán a tu suscripción!'}
                </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="openCheckoutModal('semester')" class="px-3 py-1 rounded-md text-[11px] font-black bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md transition whitespace-nowrap">
                    ${isEn ? 'Claim 20% OFF Now &rarr;' : 'Aprovechar 20% OFF Ahora &rarr;'}
                </button>
                <button onclick="dismissAppPromoBanner()" class="text-amber-300 hover:text-white p-1 transition" title="${isEn ? 'Dismiss' : 'Ocultar'}">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        `;
    } else {
        // Fase 2 - Promo Activa Regular (30/11 a 05/12)
        banner.className = "app-promo-banner py-2 px-4 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md transition-all duration-300";
        banner.innerHTML = `
            <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-gray-950 shadow-sm animate-pulse">
                    <i class="fa-solid fa-fire text-[9px]"></i> Black Friday
                </span>
                <span class="font-medium">
                    ${isEn
                        ? '🔥 <strong>Launch Deals Active:</strong> 20% OFF on all plans. Lock in your discount today; your remaining trial days are added to your plan!'
                        : '🔥 <strong>Ofertas de Lanzamiento Activas:</strong> 20% OFF en todos los planes. Asegura tu descuento; ¡tus días restantes de prueba se sumarán a tu plan!'}
                </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button onclick="openCheckoutModal('semester')" class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow transition whitespace-nowrap">
                    ${isEn ? 'Lock In 20% OFF &rarr;' : 'Asegurar 20% OFF &rarr;'}
                </button>
                <button onclick="dismissAppPromoBanner()" class="text-gray-400 hover:text-white p-1 transition" title="${isEn ? 'Dismiss' : 'Ocultar'}">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        `;
    }

    banner.classList.remove('hidden');
}

function dismissAppPromoBanner() {
    const banner = document.getElementById('app-promo-banner');
    if (banner) banner.classList.add('hidden');
    try {
        localStorage.setItem('astrade_promo_banner_dismissed', Date.now().toString());
    } catch(e) {}
}

// Prevenir cierre del modal por Escape durante Bloqueo Paywall
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMandatoryLockdown) {
        e.stopPropagation();
        e.preventDefault();
    }
}, true);

// Inicialización automática de escuchas
document.addEventListener('DOMContentLoaded', () => {
    checkUrlPaymentParams();
    initAppPromoBanner();

    // Auto-abrir checkout si se solicitó compra directa tras login/registro
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const directPlan = urlParams.get('open_checkout') || localStorage.getItem('direct_checkout_after_login');
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
});

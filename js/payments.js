/**
 * Payments & Subscriptions Module — Trading Journal Pro SaaS
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
            month: "https://buy.stripe.com/test_month_14days_trial",
            quarter: "https://buy.stripe.com/test_quarter_plan",
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
            price: 19, 
            periodDays: 30, 
            periodText: 'por 1 Mes', 
            desc: '14 días de prueba ($0 cobrados hoy si es primera vez)' 
        },
        quarter: { 
            price: 48, 
            periodDays: 90, 
            periodText: 'por 3 Meses', 
            desc: 'Ahorras 15% ($16/mes) · Facturado cada 3 meses' 
        },
        year: { 
            price: 156, 
            periodDays: 365, 
            periodText: 'por 12 Meses', 
            desc: 'Ahorras 30% ($13/mes) · Facturado anualmente' 
        }
    }
};

let selectedCheckoutPeriod = 'month';
let selectedCryptoCurrency = 'usdttrc20';

/**
 * Verifica si el usuario actual tiene acceso completo o debe estar en Modo Solo Lectura
 */
function checkSubscriptionAccess() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) return { canEdit: false, isReadOnly: true, reason: 'unauthenticated' };

    // 1. Si tiene suscripción activa de pago (Stripe / NOWPayments)
    if (user.subscription && user.subscription.status === 'active') {
        const expDate = new Date(user.subscription.current_period_end || Date.now());
        const isStillValid = expDate.getTime() > Date.now();

        if (isStillValid) {
            applyReadOnlyMode(false);
            updateAppSubscriptionUI({
                isPaid: true,
                isTrial: false,
                plan: user.subscription.plan_name || 'Membresía Pro',
                expiresAt: expDate
            });
            return { canEdit: true, isReadOnly: false, isPaid: true, expiresAt: expDate };
        } else {
            applyReadOnlyMode(true, "Tu membresía Pro ha vencido. Renueva para continuar registrando operaciones.");
            updateAppSubscriptionUI({
                isPaid: false,
                isTrial: false,
                expired: true,
                plan: 'Membresía Vencida'
            });
            return { canEdit: false, isReadOnly: true, reason: 'subscription_expired' };
        }
    }

    // 2. Si está en período de prueba gratuito (14 días)
    const trial = (typeof getTrialInfo === 'function') ? getTrialInfo(user) : { expired: false, daysRemaining: 14 };
    
    if (trial.expired) {
        applyReadOnlyMode(true, "Tu período de prueba de 14 días ha finalizado. Tu cuenta está en Modo Solo Lectura.");
        updateAppSubscriptionUI({
            isPaid: false,
            isTrial: true,
            expired: true,
            daysRemaining: 0
        });
        return { canEdit: false, isReadOnly: true, reason: 'trial_expired' };
    }

    applyReadOnlyMode(false);
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

    if (userEmail && user && user.email) {
        userEmail.textContent = user.email;
    }

    if (userBadge) {
        if (subState.isPaid) {
            const expDateStr = subState.expiresAt instanceof Date 
                ? subState.expiresAt.toLocaleDateString() 
                : new Date(subState.expiresAt).toLocaleDateString();
            userBadge.innerHTML = `<i class="fa-solid fa-crown text-amber-400 mr-1"></i> Pro Activo (${expDateStr})`;
            userBadge.className = "px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow-sm";
        } else if (subState.expired) {
            userBadge.innerHTML = `<i class="fa-solid fa-lock text-rose-400 mr-1"></i> Solo Lectura`;
            userBadge.className = "px-2 py-0.5 rounded font-bold bg-rose-950/80 text-rose-300 border border-rose-700/80 shadow-sm animate-pulse";
        } else if (subState.isTrial) {
            userBadge.innerHTML = `<i class="fa-solid fa-clock text-amber-400 mr-1"></i> Prueba: ${subState.daysRemaining}d`;
            userBadge.className = subState.daysRemaining <= 3 
                ? "px-2 py-0.5 rounded font-bold bg-amber-950 text-amber-400 border border-amber-700 animate-pulse"
                : "px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800";
        }
    }
}

/**
 * Aplica o retira el Modo Solo Lectura en la interfaz
 */
function applyReadOnlyMode(isReadOnly, message = "") {
    const banner = document.getElementById('readonly-warning-banner');
    const newTradeBtn = document.getElementById('btn-new-trade');

    if (isReadOnly) {
        if (banner) {
            banner.classList.remove('hidden');
            const msgEl = document.getElementById('readonly-banner-msg');
            if (msgEl && message) msgEl.innerHTML = message;
        }
        if (newTradeBtn) {
            newTradeBtn.disabled = true;
            newTradeBtn.classList.add('opacity-40', 'cursor-not-allowed');
            newTradeBtn.title = "Modo Solo Lectura: Activa tu membresía Pro para registrar nuevas entradas";
        }
    } else {
        if (banner) banner.classList.add('hidden');
        if (newTradeBtn) {
            newTradeBtn.disabled = false;
            newTradeBtn.classList.remove('opacity-40', 'cursor-not-allowed');
            newTradeBtn.removeAttribute('title');
        }
    }
}

/**
 * Control del Modal de Checkout
 */
function openCheckoutModal(defaultPeriod = 'month') {
    selectedCheckoutPeriod = defaultPeriod;
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    updateCheckoutPricingDisplay();
    hideStripeSandbox();
    hideCryptoInvoice();
    updateSandboxModeBanner();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    hideStripeSandbox();
    hideCryptoInvoice();
}

function selectCheckoutPeriod(period) {
    selectedCheckoutPeriod = period;
    ['month', 'quarter', 'year'].forEach(p => {
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

    if (priceEl) priceEl.textContent = `$${plan.price} USD`;
    if (descEl) descEl.textContent = plan.periodText;
    if (subDescEl) subDescEl.textContent = plan.desc;

    // Actualiza monto en drawers si están abiertos
    const stripeAmt = document.getElementById('stripe-sandbox-amount');
    if (stripeAmt) stripeAmt.textContent = `$${plan.price}.00 USD (${plan.periodText})`;

    const cryptoAmt = document.getElementById('crypto-amount-display');
    if (cryptoAmt) cryptoAmt.textContent = `${plan.price}.00 USDT`;
}

function updateSandboxModeBanner() {
    const badge = document.getElementById('checkout-mode-indicator');
    if (badge) {
        if (PAYMENTS_CONFIG.mode === 'test') {
            badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Modo Sandbox Activo`;
            badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60";
        } else {
            badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Producción Oficial`;
            badge.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60";
        }
    }
}

/**
 * Procesa el pago con Tarjeta (Lemon Squeezy Merchant of Record o Stripe)
 */
function handleLemonSqueezyCheckout() {
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    hideCryptoInvoice();

    if (PAYMENTS_CONFIG.mode === 'test') {
        // En Sandbox: abre el panel interactivo de prueba
        showCardSandbox();
        return;
    }

    // En Producción: Redirige al Checkout oficial de Lemon Squeezy
    const url = PAYMENTS_CONFIG.lemonsqueezy.checkoutUrls[selectedCheckoutPeriod];
    if (url && url.startsWith('http')) {
        const userEmail = encodeURIComponent((user && user.email) || '');
        const userId = encodeURIComponent((user && user.id) || '');
        const sep = url.includes('?') ? '&' : '?';
        const targetUrl = `${url}${sep}checkout[email]=${userEmail}&checkout[custom][user_id]=${userId}`;
        window.open(targetUrl, '_blank');
    } else {
        // Fallback Stripe si estuviese configurado
        const stripeLink = PAYMENTS_CONFIG.stripe && PAYMENTS_CONFIG.stripe.paymentLinks[selectedCheckoutPeriod];
        if (stripeLink && stripeLink.startsWith('http')) {
            const userEmail = encodeURIComponent((user && user.email) || '');
            const clientRef = encodeURIComponent((user && user.id) || '');
            window.open(`${stripeLink}?prefilled_email=${userEmail}&client_reference_id=${clientRef}`, '_blank');
        } else {
            alert("Enlace de Lemon Squeezy en configuración. Asigna tus URLs en js/payments.js");
        }
    }
}

// Aliases para compatibilidad completa
const handleCardCheckout = handleLemonSqueezyCheckout;
const handleStripeCheckout = handleLemonSqueezyCheckout;

function showCardSandbox() {
    const sandboxDiv = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
    if (sandboxDiv) {
        sandboxDiv.classList.remove('hidden');
        updateCheckoutPricingDisplay();
    }
}
const showStripeSandbox = showCardSandbox;

function hideCardSandbox() {
    const sandboxDiv = document.getElementById('checkout-card-sandbox') || document.getElementById('checkout-stripe-sandbox');
    if (sandboxDiv) sandboxDiv.classList.add('hidden');
}
const hideStripeSandbox = hideCardSandbox;

/**
 * Simula la aprobación exitosa de un pago con Tarjeta (Lemon Squeezy) en Sandbox
 */
async function simulateCardPaymentSuccess() {
    const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
    const transId = 'ls_sub_test_' + Date.now().toString(36);
    await completeSubscriptionPayment(selectedCheckoutPeriod, 'lemonsqueezy', transId);
}
const simulateStripePaymentSuccess = simulateCardPaymentSuccess;

/**
 * Muestra las opciones y factura para pago con Criptomonedas (USDT)
 */
function showCryptoCheckout() {
    hideStripeSandbox();
    const invoiceDiv = document.getElementById('checkout-crypto-invoice');
    if (invoiceDiv) invoiceDiv.classList.remove('hidden');

    const plan = PAYMENTS_CONFIG.pricing[selectedCheckoutPeriod];
    const amountSpan = document.getElementById('crypto-amount-display');
    if (amountSpan) amountSpan.textContent = `${plan.price}.00 USDT`;
}

function hideCryptoInvoice() {
    const invoiceDiv = document.getElementById('checkout-crypto-invoice');
    if (invoiceDiv) invoiceDiv.classList.add('hidden');
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
    const expiresAt = new Date(now.getTime() + plan.periodDays * 24 * 60 * 60 * 1000);

    let user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) {
        user = {
            id: 'usr_' + Date.now().toString(36),
            email: 'trader@email.com',
            name: 'Trader Pro'
        };
    }

    const subData = {
        status: 'active',
        provider: provider, // 'stripe' | 'nowpayments'
        plan: periodKey,
        plan_name: `Membresía Pro (${plan.periodText})`,
        price: plan.price,
        current_period_end: expiresAt.toISOString(),
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
    closeCheckoutModal();
    applyReadOnlyMode(false);
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

    closeCheckoutModal();
    checkSubscriptionAccess();
}

function simulateRestoreTrial() {
    let user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (!user) {
        user = { id: 'usr_test', email: 'trader@email.com', name: 'Trader Test' };
    }

    user.trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    user.subscription = { status: 'trial', plan: 'Pro Trial (14 días)' };

    if (typeof saveUserSession === 'function') {
        saveUserSession(user);
    } else {
        localStorage.setItem('trading_saas_user_session', JSON.stringify(user));
    }

    closeCheckoutModal();
    checkSubscriptionAccess();
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

// Inicialización automática de escuchas
document.addEventListener('DOMContentLoaded', () => {
    checkUrlPaymentParams();
});

/**
 * Payments & Subscriptions Module — Trading Journal Pro SaaS
 * Gestiona el Checkout para Tarjetas (Stripe) y Criptomonedas (NOWPayments USDT).
 * Maneja el Modo Solo Lectura para cuentas con período vencido.
 */

// Configuración de Pasarelas (Reemplazar con tus credenciales de producción)
const PAYMENTS_CONFIG = {
    stripe: {
        publishableKey: window.ENV_STRIPE_KEY || "pk_test_sample",
        // Enlaces directos de Stripe Checkout (Payment Links creados en tu dashboard de Stripe)
        paymentLinks: {
            month: "https://buy.stripe.com/test_month_14days_trial",
            quarter: "https://buy.stripe.com/test_quarter_plan",
            year: "https://buy.stripe.com/test_year_plan"
        }
    },
    nowpayments: {
        apiKey: window.ENV_NOWPAYMENTS_KEY || "", // Tu API Key de NOWPayments
        apiBase: "https://api.nowpayments.io/v1",
        // Wallet directa para cobros de respaldo si no se usa webhook en tiempo real
        fallbackWallets: {
            "USDT_TRC20": "TYDzsYUb...TuWalletTRC20Aqui",
            "USDT_BEP20": "0xTuWalletBEP20Aqui...",
            "USDT_POLYGON": "0xTuWalletPolygonAqui..."
        }
    },
    pricing: {
        month: { price: 19, periodText: 'por 1 Mes', desc: '14 días gratis si registras tarjeta' },
        quarter: { price: 48, periodText: 'por 3 Meses', desc: 'Ahorras 15% ($16/mes)' },
        year: { price: 156, periodText: 'por 12 Meses', desc: 'Ahorras 30% ($13/mes)' }
    }
};

let selectedCheckoutPeriod = 'month';
let selectedCryptoCurrency = 'usdttrc20';

/**
 * Verifica si el usuario actual tiene acceso completo o debe estar en Modo Solo Lectura
 */
function checkSubscriptionAccess() {
    const user = getCurrentUser();
    if (!user) return { canEdit: false, isReadOnly: true, reason: 'unauthenticated' };

    const trial = getTrialInfo(user);
    
    // Si la suscripción o prueba expiró
    if (trial.expired) {
        applyReadOnlyMode(true, "Tu período de prueba de 14 días ha finalizado.");
        return { canEdit: false, isReadOnly: true, reason: 'expired' };
    }

    applyReadOnlyMode(false);
    return { canEdit: true, isReadOnly: false, daysRemaining: trial.daysRemaining };
}

/**
 * Aplica o retira el Modo Solo Lectura en la interfaz
 */
function applyReadOnlyMode(isReadOnly, message = "") {
    const banner = document.getElementById('readonly-warning-banner');
    const newTradeBtn = document.getElementById('btn-new-trade');
    const importBtn = document.querySelector("button[onclick='importDataTrigger()']");

    if (isReadOnly) {
        if (banner) {
            banner.classList.remove('hidden');
            const msgEl = document.getElementById('readonly-banner-msg');
            if (msgEl && message) msgEl.textContent = message;
        }
        if (newTradeBtn) {
            newTradeBtn.disabled = true;
            newTradeBtn.classList.add('opacity-40', 'cursor-not-allowed');
            newTradeBtn.title = "Modo Solo Lectura: Renueva tu suscripción para registrar nuevas entradas";
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
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    hideCryptoInvoice();
}

function selectCheckoutPeriod(period) {
    selectedCheckoutPeriod = period;
    ['month', 'quarter', 'year'].forEach(p => {
        const btn = document.getElementById('checkout-period-' + p);
        if (btn) {
            if (p === period) {
                btn.className = "px-4 py-2 text-xs font-extrabold rounded-lg bg-emerald-500 text-gray-950 shadow transition";
            } else {
                btn.className = "px-4 py-2 text-xs font-semibold rounded-lg text-gray-400 hover:text-white transition";
            }
        }
    });

    updateCheckoutPricingDisplay();
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
}

/**
 * Procesa el pago con Tarjeta (Stripe Checkout)
 */
function handleStripeCheckout() {
    const user = getCurrentUser();
    const link = PAYMENTS_CONFIG.stripe.paymentLinks[selectedCheckoutPeriod];
    
    if (link && link.startsWith('http')) {
        // Redirige al checkout de Stripe adjuntando el email y user_id como metadata
        const userEmail = encodeURIComponent((user && user.email) || '');
        const clientRef = encodeURIComponent((user && user.id) || '');
        const targetUrl = `${link}?prefilled_email=${userEmail}&client_reference_id=${clientRef}`;
        window.open(targetUrl, '_blank');
    } else {
        alert("Enlace de Stripe en configuración. Ingresa tu enlace de Stripe en js/payments.js");
    }
}

/**
 * Muestra las opciones y factura para pago con Criptomonedas (USDT)
 */
function showCryptoCheckout() {
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

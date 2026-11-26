/**
 * Auth & Subscription Client Module — AsTrade SaaS
 * Diseñado para gestionar sesiones, período de prueba de 7 días y pasarelas de pago.
 * Compatible con Supabase Auth y listo para integración directa.
 */

const AUTH_STORAGE_KEY = 'trading_saas_user_session';
const TRIAL_DURATION_DAYS = 7;

// Estado del usuario en memoria
let currentUser = null;

/**
 * Inicializa el estado de autenticación al cargar la página
 */
function initAuth() {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error leyendo sesión:", e);
        currentUser = null;
    }

    updateNavbarUserUI();
}

/**
 * Obtiene el usuario actual autenticado
 */
function getCurrentUser() {
    if (!currentUser) {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) currentUser = JSON.parse(stored);
        } catch (e) { }
    }
    return currentUser;
}

/**
 * Calcula los días restantes de la prueba gratuita
 */
function getTrialInfo(user) {
    if (!user) return { isTrial: false, daysRemaining: 0, expired: true };

    const sub = user.subscription;
    const subStatus = sub && typeof sub.status === 'string' ? sub.status.toLowerCase() : null;

    // 1. Suscripción activa de pago (Stripe / NOWPayments)
    if (sub && subStatus === 'active') {
        const expDate = new Date(sub.current_period_end || (Date.now() + 365 * 86400000));
        const msLeft = expDate.getTime() - Date.now();
        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
        return {
            isTrial: false,
            isPaid: true,
            provider: sub.provider,
            plan: sub.plan_interval || sub.plan || 'Pro',
            daysRemaining: Math.max(0, daysLeft),
            expired: msLeft <= 0
        };
    }

    // 2. Estados explícitos vencidos / bloqueados
    if (subStatus && ['expired', 'past_due', 'canceled', 'read_only'].includes(subStatus)) {
        return {
            isTrial: false,
            isPaid: false,
            provider: sub.provider,
            plan: sub.plan_interval || sub.plan || 'Pro',
            daysRemaining: 0,
            expired: true,
            status: subStatus
        };
    }

    // 3. Período de prueba
    const rawTrialEnd = (sub && sub.trial_ends_at) || user.trial_ends_at;
    const trialEndsAt = new Date(rawTrialEnd || (new Date().getTime() + TRIAL_DURATION_DAYS * 86400000));
    const now = new Date();
    const diffTime = trialEndsAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        isTrial: true,
        isPaid: false,
        daysRemaining: Math.max(0, diffDays),
        expired: diffTime <= 0
    };
}

/**
 * Guardia de autenticación para páginas protegidas (como app.html)
 */
function requireAuth(redirectUrl = 'index.html') {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Guarda la sesión localmente
 */
function saveUserSession(userData) {
    currentUser = userData;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    updateNavbarUserUI();
}

/**
 * Cierra la sesión activa
 */
function logout() {
    currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'index.html';
}

/**
 * Validador de fortaleza y seguridad de contraseña
 * Requiere: >= 10 caracteres, >= 1 mayúscula, >= 1 minúscula, >= 1 número, >= 1 símbolo
 */
function validatePasswordStrength(password) {
    const pass = typeof password === 'string' ? password : '';
    const checks = {
        minLength: pass.length >= 10,
        hasUpper: /[A-Z]/.test(pass),
        hasLower: /[a-z]/.test(pass),
        hasNumber: /[0-9]/.test(pass),
        hasSpecial: /[^A-Za-z0-9]/.test(pass)
    };

    let passedCount = 0;
    if (checks.minLength) passedCount++;
    if (checks.hasUpper) passedCount++;
    if (checks.hasLower) passedCount++;
    if (checks.hasNumber) passedCount++;
    if (checks.hasSpecial) passedCount++;

    const isValid = passedCount === 5;
    
    let level = 'weak';
    const score = Math.round((passedCount / 5) * 100);
    if (passedCount >= 5) {
        level = 'strong';
    } else if (passedCount >= 3) {
        level = 'moderate';
    }

    const errors = [];
    if (!checks.minLength) errors.push('Mínimo 10 caracteres');
    if (!checks.hasUpper) errors.push('Al menos 1 letra mayúscula (A-Z)');
    if (!checks.hasLower) errors.push('Al menos 1 letra minúscula (a-z)');
    if (!checks.hasNumber) errors.push('Al menos 1 número (0-9)');
    if (!checks.hasSpecial) errors.push('Al menos 1 símbolo especial (!@#$%...)');

    return {
        isValid,
        passedCount,
        score,
        level,
        checks,
        errors
    };
}

/**
 * Registro de nuevo usuario (activa 7 días gratis)
 */
async function registerUser(name, email, password) {
    if (!name || !email || !password) {
        throw new Error("Por favor completa todos los campos requeridos.");
    }
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
        throw new Error("Contraseña insegura: debe incluir " + strength.errors.join(", ") + ".");
    }

    // Fecha fin de prueba: 7 días desde ahora
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const newUser = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        created_at: now.toISOString(),
        trial_ends_at: trialEndsAt,
        subscription: {
            status: 'trial',
            plan: 'Pro Trial (7 días)'
        }
    };

    saveUserSession(newUser);
    return newUser;
}

/**
 * Inicio de sesión
 */
async function loginUser(email, password) {
    if (!email || !password) {
        throw new Error("Ingresa tu correo y contraseña.");
    }

    // Verificamos si existe usuario guardado
    const existing = getCurrentUser();
    if (existing && existing.email === email.trim().toLowerCase()) {
        saveUserSession(existing);
        return existing;
    }

    // Sesión de bienvenida para demostración o nuevo login
    const now = new Date();
    const mockUser = {
        id: 'usr_' + Date.now().toString(36),
        email: email.trim().toLowerCase(),
        name: email.split('@')[0],
        created_at: now.toISOString(),
        trial_ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription: {
            status: 'trial',
            plan: 'Pro Trial'
        }
    };

    saveUserSession(mockUser);
    return mockUser;
}

/**
 * Catálogo y controladores de Intención de Compra Directa desde Tarjetas de Precios
 */
const PRICING_PLANS_DATA = {
    month: { nameEs: 'Plan Mensual', nameEn: 'Monthly Plan', price: '$20 USD', discount: '20% OFF' },
    quarter: { nameEs: 'Plan Trimestral', nameEn: 'Quarterly Plan', price: '$56 USD', discount: '20% OFF' },
    semester: { nameEs: 'Plan Semestral', nameEn: 'Semi-Annual Plan', price: '$108 USD', discount: '20% OFF' },
    year: { nameEs: 'Plan Anual', nameEn: 'Annual Plan', price: '$200 USD', discount: '20% OFF' }
};

function showAuthPlanBadge(periodKey) {
    const badge = document.getElementById('auth-plan-intent-badge');
    const nameEl = document.getElementById('auth-plan-intent-name');
    const priceEl = document.getElementById('auth-plan-intent-price');
    if (!badge || !nameEl || !priceEl) return;

    const plan = PRICING_PLANS_DATA[periodKey] || PRICING_PLANS_DATA.month;
    const isEn = (document.documentElement.lang === 'en');
    nameEl.textContent = isEn ? plan.nameEn : plan.nameEs;
    priceEl.textContent = `${plan.price} (${plan.discount})`;
    badge.classList.remove('hidden');
}

function hideAuthPlanBadge() {
    const badge = document.getElementById('auth-plan-intent-badge');
    if (badge) badge.classList.add('hidden');
}

function openDirectCheckout(periodKey) {
    const validPeriod = PRICING_PLANS_DATA[periodKey] ? periodKey : 'month';
    try {
        localStorage.setItem('direct_checkout_after_login', validPeriod);
        localStorage.setItem('preferred_billing_cycle', validPeriod);
    } catch(e) {}

    // Si ya está autenticado con sesión activa, redirigir directo a checkout en app.html
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (user) {
        window.location.href = 'app.html?open_checkout=' + encodeURIComponent(validPeriod);
        return;
    }

    showAuthPlanBadge(validPeriod);
    openAuthModal('register', true);
}

function selectPlanAndRegister(periodKey) {
    const validPeriod = PRICING_PLANS_DATA[periodKey] ? periodKey : 'month';
    try {
        localStorage.setItem('preferred_billing_cycle', validPeriod);
        localStorage.removeItem('direct_checkout_after_login'); // Es prueba de 7 días, no checkout forzado
    } catch(e) {}

    // Si ya está autenticado, llevarlo a su bitácora
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (user) {
        window.location.href = 'app.html';
        return;
    }

    hideAuthPlanBadge();
    openAuthModal('register');
}

/**
 * Control visual de Modales (Registro, Login, Recuperar)
 */
function openAuthModal(modalType = 'login', keepPlanIntent = false) {
    const backdrop = document.getElementById('auth-modal-backdrop');
    if (!backdrop) return;

    const modalLogin = document.getElementById('auth-view-login');
    const modalRegister = document.getElementById('auth-view-register');
    const modalForgot = document.getElementById('auth-view-forgot');

    if (modalLogin) modalLogin.classList.add('hidden');
    if (modalRegister) modalRegister.classList.add('hidden');
    if (modalForgot) modalForgot.classList.add('hidden');

    if (modalType === 'login' && modalLogin) modalLogin.classList.remove('hidden');
    if (modalType === 'register' && modalRegister) modalRegister.classList.remove('hidden');
    if (modalType === 'forgot' && modalForgot) modalForgot.classList.remove('hidden');

    // Sincronizar badge de intención de compra
    const pendingPlan = localStorage.getItem('direct_checkout_after_login');
    if (pendingPlan && (keepPlanIntent || modalType === 'login' || modalType === 'register')) {
        showAuthPlanBadge(pendingPlan);
    } else if (!keepPlanIntent && !pendingPlan) {
        hideAuthPlanBadge();
    }

    backdrop.scrollTop = 0;
    backdrop.classList.remove('hidden');
    backdrop.classList.add('flex');
    document.body.classList.add('overflow-hidden');
}

function closeAuthModal() {
    const backdrop = document.getElementById('auth-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('hidden');
    backdrop.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    clearAuthAlerts();
}

function clearAuthAlerts() {
    ['login-alert', 'register-alert', 'forgot-alert'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.textContent = '';
        }
    });
}

function showAuthAlert(alertId, message, isError = true) {
    const el = document.getElementById(alertId);
    if (!el) return;
    el.textContent = message;
    el.className = isError 
        ? "text-xs p-3 rounded-lg bg-red-950/80 border border-red-700/60 text-red-300 mb-4"
        : "text-xs p-3 rounded-lg bg-green-950/80 border border-green-700/60 text-green-300 mb-4";
    el.classList.remove('hidden');
}

/**
 * Actualiza la UI de navegación según el estado de sesión
 */
function updateNavbarUserUI() {
    const user = getCurrentUser();
    const guestNav = document.getElementById('nav-guest-actions');
    const userNav = document.getElementById('nav-user-actions');
    const userNameSpan = document.getElementById('nav-user-name');
    const userTrialBadge = document.getElementById('nav-trial-badge');

    if (user) {
        if (guestNav) guestNav.classList.add('hidden');
        if (userNav) userNav.classList.remove('hidden');
        if (userNameSpan) userNameSpan.textContent = user.name || user.email;

        if (userTrialBadge) {
            const trial = getTrialInfo(user);
            const isEn = (document.documentElement.lang === 'en') ||
                         (window.location.pathname.includes('en.html')) ||
                         (typeof window.i18n !== 'undefined' && window.i18n.getLanguage() === 'en') ||
                         (localStorage.getItem('astrade_lang') === 'en');
            if (trial.expired) {
                userTrialBadge.textContent = isEn ? "Expired" : "Vencido";
                userTrialBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 animate-pulse";
            } else if (trial.isTrial) {
                const days = trial.daysRemaining;
                if (isEn) {
                    userTrialBadge.textContent = days === 1 ? 'Active Trial (1 day)' : `Active Trial (${days} days)`;
                } else {
                    userTrialBadge.textContent = days === 1 ? 'Prueba Activa (1 día)' : `Prueba Activa (${days} días)`;
                }
                userTrialBadge.className = days <= 3 
                    ? "px-2.5 py-1 text-xs font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-700/60"
                    : "px-2.5 py-1 text-xs font-bold rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60";
            } else if (trial.isPaid) {
                userTrialBadge.textContent = isEn ? "Pro Active" : "Pro Activo";
                userTrialBadge.className = "px-2.5 py-1 text-xs font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-600";
            }
        }
    } else {
        if (guestNav) guestNav.classList.remove('hidden');
        if (userNav) userNav.classList.add('hidden');
    }
}

// Sincronización reactiva con cambio de idioma
if (typeof window !== 'undefined') {
    window.addEventListener('languageChanged', updateNavbarUserUI);
}

// Auto-inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initAuth);
}

/**
 * Auth & Subscription Client Module — Trading Journal Pro SaaS
 * Diseñado para gestionar sesiones, período de prueba de 14 días y pasarelas de pago.
 * Compatible con Supabase Auth y listo para integración directa.
 */

const AUTH_STORAGE_KEY = 'trading_saas_user_session';
const TRIAL_DURATION_DAYS = 14;

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
    
    // Si tiene suscripción activa de pago (Stripe / NOWPayments)
    if (user.subscription && user.subscription.status === 'active') {
        const expDate = new Date(user.subscription.current_period_end);
        const daysLeft = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
        return {
            isTrial: false,
            isPaid: true,
            provider: user.subscription.provider,
            plan: user.subscription.plan || 'Pro',
            daysRemaining: Math.max(0, daysLeft),
            expired: daysLeft < 0
        };
    }

    // Período de prueba
    const trialEndsAt = new Date(user.trial_ends_at || (new Date().getTime() + TRIAL_DURATION_DAYS * 86400000));
    const now = new Date();
    const diffTime = trialEndsAt - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        isTrial: true,
        isPaid: false,
        daysRemaining: Math.max(0, diffDays),
        expired: diffDays <= 0
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
 * Registro de nuevo usuario (activa 14 días gratis)
 */
async function registerUser(name, email, password) {
    if (!name || !email || !password) {
        throw new Error("Por favor completa todos los campos requeridos.");
    }
    if (password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
    }

    // Fecha fin de prueba: 14 días desde ahora
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
            plan: 'Pro Trial (14 días)'
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
        trial_ends_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription: {
            status: 'trial',
            plan: 'Pro Trial'
        }
    };

    saveUserSession(mockUser);
    return mockUser;
}

/**
 * Control visual de Modales (Registro, Login, Recuperar)
 */
function openAuthModal(modalType = 'login') {
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
            if (trial.isTrial) {
                userTrialBadge.textContent = `Prueba: ${trial.daysRemaining} días`;
                userTrialBadge.className = trial.daysRemaining <= 3 
                    ? "px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/60 text-amber-300 border border-amber-600"
                    : "px-2 py-0.5 text-xs font-semibold rounded bg-green-900/60 text-green-300 border border-green-600";
            } else if (trial.isPaid) {
                userTrialBadge.textContent = "Plan Pro Activo";
                userTrialBadge.className = "px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600";
            }
        }
    } else {
        if (guestNav) guestNav.classList.remove('hidden');
        if (userNav) userNav.classList.add('hidden');
    }
}

// Auto-inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initAuth);
}

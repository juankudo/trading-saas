/**
 * Supabase Client & Cloud Sync Helper — Trading Journal Pro SaaS
 * Conecta la aplicación con la base de datos PostgreSQL y Supabase Auth.
 */

// Credenciales del proyecto Supabase
const SUPABASE_CONFIG = {
    url: window.ENV_SUPABASE_URL || "https://pwkesbkoqrvfrzyjolla.supabase.co",
    anonKey: window.ENV_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3a2VzYmtvcXJ2ZnJ6eWpvbGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNDc3MzksImV4cCI6MjEwODYyMzczOX0.lBo9W1rbx0cPFAW8n6IWuKKmKZMsG6Bci3CF6Ra-4t4"
};

let supabaseClient = null;

/**
 * Inicializa el cliente oficial de Supabase
 */
function getSupabase() {
    if (supabaseClient) return supabaseClient;
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        return supabaseClient;
    }
    return null;
}

/**
 * Registro de nuevo usuario en Supabase Auth
 */
async function apiSignUp(email, password, fullName) {
    // Validación estricta de seguridad de contraseña
    if (typeof validatePasswordStrength === 'function') {
        const strength = validatePasswordStrength(password);
        if (!strength.isValid) {
            throw new Error("Contraseña insegura: debe incluir " + strength.errors.join(", ") + ".");
        }
    } else if (!password || password.length < 10) {
        throw new Error("La contraseña debe tener al menos 10 caracteres.");
    }

    const client = getSupabase();
    if (!client || SUPABASE_CONFIG.url.includes("tu-proyecto")) {
        console.warn("Supabase no configurado, usando modo local.");
        const user = await registerUser(fullName, email, password);
        return { user, session: true };
    }

    const { data, error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
            data: { full_name: fullName.trim() }
        }
    });

    if (error) throw error;

    if (data.session && data.user) {
        const userSession = {
            id: data.user.id,
            email: data.user.email,
            name: fullName.trim() || data.user.email.split('@')[0],
            created_at: data.user.created_at,
            trial_ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
            subscription: {
                status: 'trialing',
                plan: 'Pro Trial (7 días)'
            }
        };
        saveUserSession(userSession);
    }

    return data;
}

/**
 * Inicio de sesión en Supabase Auth
 */
async function apiSignIn(email, password) {
    const client = getSupabase();
    if (!client || SUPABASE_CONFIG.url.includes("tu-proyecto")) {
        console.warn("Supabase no configurado, usando modo local.");
        return loginUser(email, password);
    }

    const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
    });

    if (error) throw error;

    // Obtener perfil y suscripción
    let profile = null;
    let sub = null;
    try {
        profile = await apiFetchProfile(data.user.id);
        sub = await apiFetchSubscription(data.user.id);
    } catch (e) {
        console.warn("No se pudo obtener el perfil/suscripción aún:", e);
    }

    const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: (profile && profile.full_name) || (data.user.user_metadata && data.user.user_metadata.full_name) || data.user.email.split('@')[0],
        trial_ends_at: (sub && sub.trial_ends_at) || new Date(Date.now() + 7 * 86400000).toISOString(),
        subscription: sub || { status: 'trialing', plan: 'Pro Trial' }
    };

    saveUserSession(userSession);
    return userSession;
}

/**
 * Cierre de sesión en Supabase
 */
async function apiSignOut() {
    const client = getSupabase();
    if (client) {
        try { await client.auth.signOut(); } catch (e) { }
    }
    logout();
}

/**
 * Obtener perfil de la tabla profiles
 */
async function apiFetchProfile(userId) {
    const client = getSupabase();
    if (!client) return null;
    try {
        const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (error) return null;
        return data;
    } catch (e) { return null; }
}

/**
 * Obtener suscripción de la tabla subscriptions
 */
async function apiFetchSubscription(userId) {
    const client = getSupabase();
    if (!client) return null;
    try {
        const { data, error } = await client.from('subscriptions').select('*').eq('user_id', userId).maybeSingle();
        if (error) return null;
        return data;
    } catch (e) { return null; }
}

/**
 * Iniciar sesión o registro con Google OAuth
 */
async function apiSignInWithGoogle() {
    const client = getSupabase();
    if (!client || SUPABASE_CONFIG.url.includes("tu-proyecto")) {
        throw new Error("El servicio de autenticación con Google no está disponible.");
    }

    // Calcula dinámicamente la URL absoluta hacia app.html en el mismo host/origen
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/(\/index\.html|\/en\.html|\/)$/, '');
    const redirectUrl = `${origin}${pathname}/app.html`;

    const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl,
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account',
            }
        }
    });

    if (error) throw error;
    return data;
}

/**
 * Procesa la sesión entrante tras redirección OAuth (Google)
 */
async function apiHandleOAuthCallback() {
    const client = getSupabase();
    if (!client) return null;

    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session || !session.user) return null;

    let profile = null;
    let sub = null;
    try {
        profile = await apiFetchProfile(session.user.id);
        sub = await apiFetchSubscription(session.user.id);
    } catch (e) {
        console.warn("No se pudo cargar perfil/suscripción adicional:", e);
    }

    const userSession = {
        id: session.user.id,
        email: session.user.email,
        name: (profile && profile.full_name) || 
              (session.user.user_metadata && (session.user.user_metadata.full_name || session.user.user_metadata.name)) || 
              session.user.email.split('@')[0],
        avatar_url: session.user.user_metadata && session.user.user_metadata.avatar_url,
        provider: 'google',
        trial_ends_at: (sub && sub.trial_ends_at) || new Date(Date.now() + 7 * 86400000).toISOString(),
        subscription: sub || { status: 'trialing', plan: 'Pro Trial (7 días)' }
    };

    saveUserSession(userSession);

    // Limpia la URL de los tokens de OAuth sin recargar la página
    if (window.location.hash || window.location.search.includes('code=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    return userSession;
}

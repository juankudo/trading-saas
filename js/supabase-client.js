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
            trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
            subscription: {
                status: 'trialing',
                plan: 'Pro Trial (14 días)'
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
        trial_ends_at: (sub && sub.trial_ends_at) || new Date(Date.now() + 14 * 86400000).toISOString(),
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

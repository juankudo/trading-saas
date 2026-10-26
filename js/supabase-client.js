/**
 * Supabase Client & Cloud Sync Helper — Trading Journal Pro SaaS
 * Conecta la aplicación con la base de datos PostgreSQL y Supabase Auth.
 */

// Credenciales del proyecto Supabase (Reemplazar con tus credenciales de Supabase Dashboard -> Project Settings -> API)
const SUPABASE_CONFIG = {
    url: window.ENV_SUPABASE_URL || "https://tu-proyecto.supabase.co",
    anonKey: window.ENV_SUPABASE_ANON_KEY || "tu-clave-anon-publica-aqui"
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
        console.warn("Supabase no configurado aún, usando modo de prueba local.");
        return registerUser(fullName, email, password);
    }

    const { data, error } = await client.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: fullName }
        }
    });

    if (error) throw error;
    return data.user;
}

/**
 * Inicio de sesión en Supabase Auth
 */
async function apiSignIn(email, password) {
    const client = getSupabase();
    if (!client || SUPABASE_CONFIG.url.includes("tu-proyecto")) {
        console.warn("Supabase no configurado aún, usando modo de prueba local.");
        return loginUser(email, password);
    }

    const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) throw error;
    
    // Obtener perfil y suscripción
    const profile = await apiFetchProfile(data.user.id);
    const sub = await apiFetchSubscription(data.user.id);

    const userSession = {
        id: data.user.id,
        email: data.user.email,
        name: (profile && profile.full_name) || data.user.email.split('@')[0],
        trial_ends_at: (sub && sub.trial_ends_at) || null,
        subscription: sub || { status: 'trial', plan: 'Pro Trial' }
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
    const { data } = await client.from('profiles').select('*').eq('id', userId).single();
    return data;
}

/**
 * Obtener suscripción de la tabla subscriptions
 */
async function apiFetchSubscription(userId) {
    const client = getSupabase();
    if (!client) return null;
    const { data } = await client.from('subscriptions').select('*').eq('user_id', userId).single();
    return data;
}

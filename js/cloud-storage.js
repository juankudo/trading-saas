/**
 * Cloud Storage & PostgreSQL Sync Manager — Trading Journal Pro SaaS (v2.0)
 * Sincroniza cuentas, grupos, sesiones de backtest, trades nativos
 * e instantáneas de balance con Supabase. Soporta subida de capturas
 * a Supabase Storage y fusión inteligente por ID.
 */

let isSyncingToCloud = false;
let cloudSyncTimeout = null;

/**
 * Inicializa la sincronización al cargar la aplicación
 */
async function initCloudSync() {
    const user = getCurrentUser();
    if (!user) return;

    updateCloudSyncIndicator('syncing', 'Sincronizando...');

    try {
        await loadFromCloud(user.id);
        
        // Si hay datos locales que no estaban en la nube (ej. importación previa o recién migrado), sincronizarlos
        if ((Array.isArray(realAccounts) && realAccounts.length > 0) || (Array.isArray(trades) && trades.length > 0)) {
            await saveToCloud(user.id);
        }

        updateCloudSyncIndicator('synced', 'Sincronizado');
    } catch (err) {
        console.error("Error sincronizando desde la nube:", err);
        updateCloudSyncIndicator('error', 'Error de sincronización');
    }

    // Verificar estado de suscripción y modo solo lectura
    if (typeof checkSubscriptionAccess === 'function') {
        checkSubscriptionAccess();
    }
}

/**
 * Sube una imagen Base64 a Supabase Storage y retorna la URL pública
 */
async function uploadBase64Image(base64Str, userId, prefix = 'trade') {
    if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
        return base64Str; // Ya es una URL o no es una imagen base64
    }
    const client = getSupabase();
    if (!client) return base64Str;

    try {
        const match = base64Str.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!match) return base64Str;

        const mimeType = match[1];
        const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
        const byteCharacters = atob(match[2]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
        }
        const blob = new Blob(byteArrays, { type: mimeType });
        const fileName = `${userId}/${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

        const { error } = await client.storage
            .from('trade-screenshots')
            .upload(fileName, blob, { contentType: mimeType, upsert: true });

        if (error) {
            console.warn("No se pudo subir la imagen a Supabase Storage, manteniendo original:", error.message || error);
            return base64Str;
        }

        const { data: pubData } = client.storage
            .from('trade-screenshots')
            .getPublicUrl(fileName);

        return pubData && pubData.publicUrl ? pubData.publicUrl : base64Str;
    } catch (e) {
        console.warn("Excepción al subir captura a Storage:", e);
        return base64Str;
    }
}

/**
 * Descarga las cuentas, trades y sesiones del usuario desde Supabase
 */
async function loadFromCloud(userId) {
    const client = getSupabase();
    if (!client) return;

    // 1. Cargar Cuentas Reales
    const { data: dbAccounts, error: accErr } = await client
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
    if (accErr) throw accErr;

    // 2. Cargar Grupos
    const { data: dbGroups, error: grpErr } = await client
        .from('account_groups')
        .select('*')
        .eq('user_id', userId);
    if (grpErr) throw grpErr;

    // 3. Cargar Sesiones de Backtesting
    const { data: dbSessions, error: sessErr } = await client
        .from('backtest_sessions')
        .select('*')
        .eq('user_id', userId);
    if (sessErr && sessErr.code !== 'PGRST116') {
        console.warn("Aviso al consultar backtest_sessions:", sessErr);
    }

    // 4. Cargar Trades (Reales y Backtesting)
    const { data: dbTrades, error: trdErr } = await client
        .from('trades')
        .select('*')
        .eq('user_id', userId);
    if (trdErr) throw trdErr;

    // 5. Cargar Historial de Balances
    const { data: dbSnapshots, error: snpErr } = await client
        .from('balance_snapshots')
        .select('*')
        .eq('user_id', userId);
    if (snpErr) throw snpErr;

    // Reconstruir Cuentas Reales (Fusión inteligente: nube manda si tiene datos)
    if (Array.isArray(dbAccounts) && dbAccounts.length > 0) {
        const cloudAccounts = dbAccounts.map(a => ({
            id: isNaN(a.id) ? a.id : Number(a.id),
            name: a.name,
            stage: a.stage || 'real',
            balance: Number(a.initial_balance) || 0,
            balanceActual: Number(a.balance_actual) || 0,
            balanceActualAt: a.balance_actual_at || null,
            ...(a.config || {})
        }));
        realAccounts = cloudAccounts;
        await dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts);
    }

    // Reconstruir Grupos
    if (Array.isArray(dbGroups) && dbGroups.length > 0) {
        accountGroups = dbGroups.map(g => ({
            id: isNaN(g.id) ? g.id : Number(g.id),
            name: g.name
        }));
        await dbSet(STORAGE_KEY_ACCOUNT_GROUPS, accountGroups);
    }

    // Reconstruir Sesiones de Backtesting
    if (Array.isArray(dbSessions) && dbSessions.length > 0) {
        backtestSessions = dbSessions.map(s => ({
            id: isNaN(s.id) ? s.id : Number(s.id),
            name: s.name,
            balance: Number(s.balance) || 100000,
            startDate: s.start_date || null,
            notes: s.notes || '',
            ...(s.data || {})
        }));
        await dbSet(STORAGE_KEY_SESSIONS, backtestSessions);
    }

    // Reconstruir Trades (Reales y Backtesting)
    if (Array.isArray(dbTrades) && dbTrades.length > 0) {
        const realTradesList = [];
        const backtestTradesList = [];

        dbTrades.forEach(row => {
            const raw = (row.data && typeof row.data === 'object') ? row.data : {};
            const tradeId = isNaN(row.id) ? row.id : Number(row.id);
            const accountId = row.account_id ? (isNaN(row.account_id) ? row.account_id : Number(row.account_id)) : null;
            const sessionId = row.session_id ? (isNaN(row.session_id) ? row.session_id : Number(row.session_id)) : null;

            const tradeObj = {
                ...raw,
                id: tradeId,
                accountId: accountId,
                sessionId: sessionId,
                par: row.par || raw.par || 'EURUSD',
                orden: row.orden || raw.orden || 'Buy',
                fecha: row.fecha || raw.fecha || new Date().toISOString().split('T')[0],
                hora: row.hora || raw.hora || '00:00',
                estado: row.estado || raw.estado || 'Ganada',
                pipsSL: Number(row.pips_sl !== undefined ? row.pips_sl : raw.pipsSL) || 0,
                pipsTP: Number(row.pips_tp !== undefined ? row.pips_tp : raw.pipsTP) || 0,
                rr: Number(row.rr !== undefined ? row.rr : raw.rr) || 0,
                riesgo: Number(row.riesgo !== undefined ? row.riesgo : raw.riesgo) || 0,
                lotaje: Number(row.lotaje !== undefined ? row.lotaje : raw.lotaje) || 0,
                resultadoParcial: Number(row.resultado_parcial !== undefined ? row.resultado_parcial : raw.resultadoParcial) || 0,
                sesion: row.sesion || raw.sesion || '',
                tendencia: row.tendencia || raw.tendencia || '',
                notaAntes: row.nota_antes || raw.notaAntes || '',
                notaDespues: row.nota_despues || raw.notaDespues || '',
                linkAntes: row.link_antes || raw.linkAntes || '',
                linkDespues: row.link_despues || raw.linkDespues || '',
                multiEntryId: row.multi_entry_id || raw.multiEntryId || null,
                imagenesAntes: Array.isArray(row.imagenes_antes) ? row.imagenes_antes : (Array.isArray(raw.imagenesAntes) ? raw.imagenesAntes : []),
                imagenesDespues: Array.isArray(row.imagenes_despues) ? row.imagenes_despues : (Array.isArray(raw.imagenesDespues) ? raw.imagenesDespues : [])
            };

            if (row.mode === 'backtesting' || sessionId) {
                backtestTradesList.push(tradeObj);
            } else {
                realTradesList.push(tradeObj);
            }
        });

        if (realTradesList.length > 0) {
            await dbSet(STORAGE_KEY_REAL, realTradesList);
            if (currentMode === 'real') trades = realTradesList;
        }
        if (backtestTradesList.length > 0) {
            await dbSet(STORAGE_KEY_BACKTESTING, backtestTradesList);
            if (currentMode === 'backtesting') trades = backtestTradesList;
        }
    }

    // Reconstruir Historial de Balances
    if (Array.isArray(dbSnapshots) && dbSnapshots.length > 0) {
        realBalanceHistory = dbSnapshots.map(s => s.snapshot_data || s);
        await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, realBalanceHistory);
    }

    // Refrescar vistas en pantalla
    if (typeof renderGroups === 'function') renderGroups();
    if (typeof renderAll === 'function' && (activeRealAccountId || activeSessionId)) renderAll();
}

/**
 * Guarda y sincroniza las cuentas y trades locales en Supabase (Debounced o Inmediato)
 */
function triggerCloudSave(immediate = false) {
    const user = getCurrentUser();
    if (!user) return;

    updateCloudSyncIndicator('syncing', 'Guardando...');
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);

    if (immediate) {
        return saveToCloud(user.id)
            .then(() => updateCloudSyncIndicator('synced', 'Sincronizado'))
            .catch(err => {
                console.error("Error guardando en la nube:", err);
                updateCloudSyncIndicator('error', 'Error al guardar');
            });
    }

    cloudSyncTimeout = setTimeout(async () => {
        try {
            await saveToCloud(user.id);
            updateCloudSyncIndicator('synced', 'Sincronizado');
        } catch (err) {
            console.error("Error guardando en la nube:", err);
            updateCloudSyncIndicator('error', 'Error al guardar');
        }
    }, 700);
}

/**
 * Ejecuta el envío de cuentas, trades, sesiones e imágenes a Supabase
 */
async function saveToCloud(userId) {
    const client = getSupabase();
    if (!client || isSyncingToCloud) return;

    isSyncingToCloud = true;

    try {
        // 1. Sincronizar Cuentas Reales
        if (Array.isArray(realAccounts) && realAccounts.length > 0) {
            const accPayload = realAccounts.map(a => ({
                id: String(a.id),
                user_id: userId,
                name: a.name || 'Cuenta',
                stage: a.stage || 'real',
                initial_balance: Number(a.balance) || 0,
                balance_actual: Number(a.balanceActual) || 0,
                balance_actual_at: a.balanceActualAt || new Date().toISOString(),
                config: {
                    goal: a.goal,
                    rules: a.rules,
                    withdrawals: a.withdrawals,
                    phase: a.phase,
                    celebratedPhase: a.celebratedPhase,
                    date: a.date
                }
            }));
            const { error: accErr } = await client.from('accounts').upsert(accPayload, { onConflict: 'id' });
            if (accErr) console.error("Error upsert accounts:", accErr);
        }

        // 2. Sincronizar Grupos
        if (Array.isArray(accountGroups) && accountGroups.length > 0) {
            const grpPayload = accountGroups.map(g => ({
                id: String(g.id),
                user_id: userId,
                name: g.name
            }));
            const { error: grpErr } = await client.from('account_groups').upsert(grpPayload, { onConflict: 'id' });
            if (grpErr) console.error("Error upsert account_groups:", grpErr);
        }

        // 3. Sincronizar Sesiones de Backtesting
        if (Array.isArray(backtestSessions) && backtestSessions.length > 0) {
            const sessPayload = backtestSessions.map(s => ({
                id: String(s.id),
                user_id: userId,
                name: s.name || 'Sesión',
                balance: Number(s.balance) || 100000,
                start_date: s.startDate || null,
                notes: s.notes || '',
                data: s
            }));
            const { error: sessErr } = await client.from('backtest_sessions').upsert(sessPayload, { onConflict: 'id' });
            if (sessErr) console.error("Error upsert backtest_sessions:", sessErr);
        }

        // 4. Obtener todos los trades (Reales y Backtest)
        let allTradesToSync = [];
        if (currentMode === 'real') {
            allTradesToSync = [...(trades || [])];
            // Intentar incluir backtesting guardado en DB si existe
            try {
                const storedBacktest = await dbGet(STORAGE_KEY_BACKTESTING);
                if (Array.isArray(storedBacktest)) allTradesToSync.push(...storedBacktest);
            } catch (e) { }
        } else {
            allTradesToSync = [...(trades || [])];
            try {
                const storedReal = await dbGet(STORAGE_KEY_REAL);
                if (Array.isArray(storedReal)) allTradesToSync.push(...storedReal);
            } catch (e) { }
        }

        // 5. Procesar e insertar Trades
        if (allTradesToSync.length > 0) {
            // Procesamiento en lotes de 40 para evitar payloads excesivos
            const BATCH_SIZE = 40;
            for (let i = 0; i < allTradesToSync.length; i += BATCH_SIZE) {
                const batch = allTradesToSync.slice(i, i + BATCH_SIZE);
                
                // Subir capturas Base64 si existen
                for (const t of batch) {
                    if (Array.isArray(t.imagenesAntes) && t.imagenesAntes.some(img => img && img.startsWith('data:image/'))) {
                        const newImgs = [];
                        for (const img of t.imagenesAntes) {
                            newImgs.push(await uploadBase64Image(img, userId, 'antes'));
                        }
                        t.imagenesAntes = newImgs;
                    }
                    if (Array.isArray(t.imagenesDespues) && t.imagenesDespues.some(img => img && img.startsWith('data:image/'))) {
                        const newImgs = [];
                        for (const img of t.imagenesDespues) {
                            newImgs.push(await uploadBase64Image(img, userId, 'despues'));
                        }
                        t.imagenesDespues = newImgs;
                    }
                }

                const trdPayload = batch.map(t => {
                    const isBacktest = Boolean(t.sessionId);
                    return {
                        id: String(t.id),
                        user_id: userId,
                        account_id: (!isBacktest && t.accountId) ? String(t.accountId) : null,
                        session_id: (isBacktest && t.sessionId) ? String(t.sessionId) : null,
                        mode: isBacktest ? 'backtesting' : 'real',
                        par: t.par || 'EURUSD',
                        orden: t.orden || 'Buy',
                        fecha: t.fecha || new Date().toISOString().split('T')[0],
                        hora: t.hora || '00:00',
                        estado: t.estado || 'Ganada',
                        pips_sl: Number(t.pipsSL) || 0,
                        pips_tp: Number(t.pipsTP) || 0,
                        rr: Number(t.rr) || 0,
                        riesgo: Number(t.riesgo) || 0,
                        lotaje: Number(t.lotaje) || 0,
                        resultado_parcial: Number(t.resultadoParcial) || 0,
                        sesion: t.sesion || '',
                        tendencia: t.tendencia || '',
                        nota_antes: t.notaAntes || '',
                        nota_despues: t.notaDespues || '',
                        link_antes: t.linkAntes || '',
                        link_despues: t.linkDespues || '',
                        multi_entry_id: t.multiEntryId || null,
                        imagenes_antes: Array.isArray(t.imagenesAntes) ? t.imagenesAntes : [],
                        imagenes_despues: Array.isArray(t.imagenesDespues) ? t.imagenesDespues : [],
                        data: t
                    };
                });

                const { error: trdErr } = await client.from('trades').upsert(trdPayload, { onConflict: 'id' });
                if (trdErr) console.error(`Error upsert trades batch ${i}:`, trdErr);
            }
        }

        // 6. Sincronizar Historial de Instantáneas de Balance
        if (Array.isArray(realBalanceHistory) && realBalanceHistory.length > 0) {
            const snpPayload = realBalanceHistory.map((s, idx) => ({
                id: s.id ? String(s.id) : `${userId}_snap_${s.date || idx}`,
                user_id: userId,
                date: s.date || new Date().toISOString().split('T')[0],
                snapshot_data: s,
                snapshot_at: s.createdAt || new Date().toISOString()
            }));
            const { error: snpErr } = await client.from('balance_snapshots').upsert(snpPayload, { onConflict: 'id' });
            if (snpErr) console.error("Error upsert balance_snapshots:", snpErr);
        }

    } finally {
        isSyncingToCloud = false;
    }
}

/**
 * Elimina una entidad de Supabase cuando se elimina en la Bitácora
 */
async function deleteFromCloud(type, id) {
    const user = getCurrentUser();
    if (!user || !id) return;
    const client = getSupabase();
    if (!client) return;

    try {
        const idStr = String(id);
        if (type === 'trade') {
            await client.from('trades').delete().eq('id', idStr).eq('user_id', user.id);
        } else if (type === 'account') {
            await client.from('accounts').delete().eq('id', idStr).eq('user_id', user.id);
            // También eliminar trades asociados a esa cuenta
            await client.from('trades').delete().eq('account_id', idStr).eq('user_id', user.id);
        } else if (type === 'group') {
            await client.from('account_groups').delete().eq('id', idStr).eq('user_id', user.id);
        } else if (type === 'session') {
            await client.from('backtest_sessions').delete().eq('id', idStr).eq('user_id', user.id);
            await client.from('trades').delete().eq('session_id', idStr).eq('user_id', user.id);
        }
    } catch (err) {
        console.warn(`Error eliminando ${type} (${id}) de la nube:`, err);
    }
}

/**
 * Indicador visual del estado de sincronización en el Navbar
 */
function updateCloudSyncIndicator(status, text) {
    const indicator = document.getElementById('cloud-sync-status');
    if (!indicator) return;

    if (status === 'syncing') {
        indicator.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin text-blue-400"></i> <span class="hidden sm:inline">${text}</span>`;
        indicator.className = "flex items-center gap-1.5 text-xs text-blue-400 font-medium";
    } else if (status === 'synced') {
        indicator.innerHTML = `<i class="fa-solid fa-cloud-check text-emerald-400"></i> <span class="hidden sm:inline">${text}</span>`;
        indicator.className = "flex items-center gap-1.5 text-xs text-emerald-400 font-medium";
    } else if (status === 'error') {
        indicator.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-400"></i> <span class="hidden sm:inline">${text}</span>`;
        indicator.className = "flex items-center gap-1.5 text-xs text-amber-400 font-medium";
    }
}

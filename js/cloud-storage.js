/**
 * Cloud Storage & PostgreSQL Sync Manager — Trading Journal Pro SaaS
 * Sincroniza cuentas, trades e instantáneas de balance con Supabase.
 */

let isSyncingToCloud = false;
let cloudSyncTimeout = null;

/**
 * Inicializa la sincronización al cargar la aplicación
 */
async function initCloudSync() {
    const user = getCurrentUser();
    if (!user) return;

    updateCloudSyncIndicator('syncing', 'Descargando datos...');

    try {
        await loadFromCloud(user.id);
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
 * Descarga las cuentas y operaciones del usuario desde PostgreSQL
 */
async function loadFromCloud(userId) {
    const client = getSupabase();
    if (!client) return;

    // 1. Cargar Cuentas
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

    // 3. Cargar Trades
    const { data: dbTrades, error: trdErr } = await client
        .from('trades')
        .select('*')
        .eq('user_id', userId);

    if (trdErr) throw trdErr;

    // 4. Cargar Historial de Balances
    const { data: dbSnapshots, error: snpErr } = await client
        .from('balance_snapshots')
        .select('*')
        .eq('user_id', userId);

    if (snpErr) throw snpErr;

    // Si existen datos en la nube, reemplazar estado local
    if (dbAccounts && dbAccounts.length > 0) {
        realAccounts = dbAccounts.map(a => ({
            id: a.id,
            name: a.name,
            stage: a.stage || 'real',
            balance: Number(a.initial_balance) || 0,
            balanceActual: Number(a.balance_actual) || 0,
            balanceActualAt: a.balance_actual_at || null,
            ...(a.config || {})
        }));
        await dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts);
    }

    if (dbGroups && dbGroups.length > 0) {
        accountGroups = dbGroups.map(g => ({
            id: g.id,
            name: g.name
        }));
        await dbSet(STORAGE_KEY_ACCOUNT_GROUPS, accountGroups);
    }

    if (dbTrades && dbTrades.length > 0) {
        trades = dbTrades.map(t => ({
            id: t.id,
            accountId: t.account_id,
            pair: t.symbol,
            type: t.direction,
            entryPrice: Number(t.entry_price) || 0,
            exitPrice: Number(t.exit_price) || 0,
            stopLoss: Number(t.stop_loss) || 0,
            takeProfit: Number(t.take_profit) || 0,
            lotSize: Number(t.lot_size) || 0,
            pnl: Number(t.pnl) || 0,
            resultPct: Number(t.result_pct) || 0,
            date: t.open_time,
            closeDate: t.close_time,
            status: t.status || 'closed',
            notes: t.notes || '',
            tags: t.tags || [],
            ...(t.details || {})
        }));
        await dbSet(STORAGE_KEY_REAL, trades);
    }

    if (dbSnapshots && dbSnapshots.length > 0) {
        realBalanceHistory = dbSnapshots.map(s => s.snapshot_data);
        await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, realBalanceHistory);
    }

    // Refrescar vistas
    if (typeof renderGroups === 'function') renderGroups();
    if (typeof renderAll === 'function' && activeRealAccountId) renderAll();
}

/**
 * Guarda y sincroniza las cuentas y trades locales en Supabase (Debounced)
 */
function triggerCloudSave() {
    const user = getCurrentUser();
    if (!user) return;

    updateCloudSyncIndicator('syncing', 'Guardando en la nube...');
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);

    cloudSyncTimeout = setTimeout(async () => {
        try {
            await saveToCloud(user.id);
            updateCloudSyncIndicator('synced', 'Sincronizado');
        } catch (err) {
            console.error("Error guardando en la nube:", err);
            updateCloudSyncIndicator('error', 'Error al guardar');
        }
    }, 600);
}

/**
 * Ejecuta el envío de cuentas y trades a PostgreSQL
 */
async function saveToCloud(userId) {
    const client = getSupabase();
    if (!client || isSyncingToCloud) return;

    isSyncingToCloud = true;

    try {
        // 1. Sincronizar Cuentas
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
                    phase: a.phase
                }
            }));
            await client.from('accounts').upsert(accPayload);
        }

        // 2. Sincronizar Grupos
        if (Array.isArray(accountGroups) && accountGroups.length > 0) {
            const grpPayload = accountGroups.map(g => ({
                id: String(g.id),
                user_id: userId,
                name: g.name
            }));
            await client.from('account_groups').upsert(grpPayload);
        }

        // 3. Sincronizar Trades
        if (Array.isArray(trades) && trades.length > 0) {
            const trdPayload = trades.map(t => ({
                id: String(t.id),
                user_id: userId,
                account_id: String(t.accountId || (realAccounts[0] && realAccounts[0].id) || '1'),
                symbol: t.pair || 'EURUSD',
                direction: (t.type && t.type.toLowerCase().includes('sell')) ? 'sell' : 'buy',
                entry_price: Number(t.entryPrice) || 0,
                exit_price: Number(t.exitPrice) || 0,
                stop_loss: Number(t.stopLoss) || 0,
                take_profit: Number(t.takeProfit) || 0,
                lot_size: Number(t.lotSize) || 0,
                pnl: Number(t.pnl) || 0,
                result_pct: Number(t.resultPct) || 0,
                open_time: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
                close_time: t.closeDate ? new Date(t.closeDate).toISOString() : null,
                status: t.status || 'closed',
                notes: t.notes || '',
                tags: Array.isArray(t.tags) ? t.tags : [],
                details: {
                    pips: t.pips,
                    riskPct: t.riskPct,
                    rr: t.rr,
                    session: t.session,
                    strategy: t.strategy,
                    img: t.img
                }
            }));
            await client.from('trades').upsert(trdPayload);
        }

    } finally {
        isSyncingToCloud = false;
    }
}

/**
 * Indicador visual del estado de sincronización en el Navbar
 */
function updateCloudSyncIndicator(status, text) {
    const indicator = document.getElementById('cloud-sync-status');
    if (!indicator) return;

    if (status === 'syncing') {
        indicator.innerHTML = `<i class="fa-solid fa-rotate fa-spin text-blue-400"></i> <span class="hidden sm:inline">${text}</span>`;
        indicator.className = "flex items-center gap-1.5 text-xs text-blue-400 font-medium";
    } else if (status === 'synced') {
        indicator.innerHTML = `<i class="fa-solid fa-cloud-check text-emerald-400"></i> <span class="hidden sm:inline">${text}</span>`;
        indicator.className = "flex items-center gap-1.5 text-xs text-emerald-400 font-medium";
    } else if (status === 'error') {
        indicator.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-400"></i> <span class="hidden sm:inline">${text}</span>`;
        indicator.className = "flex items-center gap-1.5 text-xs text-amber-400 font-medium";
    }
}

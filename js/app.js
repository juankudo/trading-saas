const initialTrades = [];

        let currentMode = 'real'; 
        let isGlobalTradeContext = false;
        let globalTradeAccountIds = [];
        let globalTradeSelectionConfirmed = true;
        let editReplicatedSourceId = null;
        let editReplicatedMembers = [];
        let editReplicatedSelectedIds = [];
        let editReplicatedSelectionConfirmed = true;
        let editingLatestMultiEntryId = null;
        
        const DB_NAME = "TradingJournalProDB";
        const DB_VERSION = 1;
        const STORE_NAME = "app_data";

        function openAppDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
                    if (!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
                };
            });
        }

        async function dbGet(key) {
            try {
                const db = await openAppDB();
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, "readonly");
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.get(key);
                    req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
                    req.onerror = () => reject(req.error);
                });
            } catch (e) { return null; }
        }

        async function dbSet(key, value) {
            const db = await openAppDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                const req = store.put(value, key);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
        }

        async function dbSetMany(entries) {
            const db = await openAppDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
                tx.onabort = () => reject(tx.error || new Error("La transacción de IndexedDB fue cancelada."));
                entries.forEach(([key, value]) => store.put(value, key));
            });
        }

        const STORAGE_KEY_REAL = "trading_journal_data";
        const STORAGE_KEY_REAL_ACCOUNTS = "trading_journal_real_accounts";
        const STORAGE_KEY_ACCOUNT_GROUPS = "trading_journal_account_groups";
        const STORAGE_KEY_REAL_BALANCE_HISTORY = "trading_journal_real_balance_history";
        const STORAGE_KEY_BACKTESTING = "trading_journal_backtesting_data";
        const STORAGE_KEY_SESSIONS = "trading_journal_backtesting_sessions";
        const STORAGE_KEY_BACKTEST_PAIRS = "trading_journal_backtesting_pairs";
        const STORAGE_KEY_GLOBAL_METRICS = "trading_journal_global_metrics";
        const STORAGE_KEY_MT5_CONFIG = "trading_journal_mt5_bridge_config";
        const STORAGE_KEY_MT5_STATE = "trading_journal_mt5_bridge_state";
        const MT5_POLL_MILLIS = 2500;
        
        let trades = [];
        let globalMetricsEntries = [];
        let globalMetricsDeletedSourceKeys = [];
        let globalMetricsLoaded = false;
        let globalMetricsEditingEntryId = null;
        let isGlobalMetricsView = false;
        let realBalanceHistory = [];
        let realAccounts = [];
        let accountGroups = [];
        let backtestSessions = [];
        
        let activeRealAccountId = null;
        let activeAccountGroupId = null;
        let groupBalancesVisible = false;
        let editingBalanceSnapshotId = null;
        let activeSessionId = null;
        let editingAccountGroupId = null;
        let quickTradeContextId = null; 

        let directoryHandle = null;
        let currentUploadedImagesAntes = [];
        let currentUploadedImagesDespues = [];
        let equityChartInstance = null;
        let outcomesChartInstance = null;
        let groupBalanceChartInstance = null;
        let monthlyCalendarSessionContextId = null;
        let currentTabName = "sessions";

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        let customPairsList = [];
        let backtestPairsList = [];
        const baseDefaultPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "GBPJPY", "XAUUSD", "USDCHF", "NZDUSD", "US30", "US100", "BTCUSD"];

        async function loadCustomPairs() {
            const stored = await dbGet("trading_journal_custom_pairs");
            if (stored && stored.length > 0) customPairsList = stored;
            else customPairsList = [...baseDefaultPairs];

            const storedBacktestPairs = await dbGet(STORAGE_KEY_BACKTEST_PAIRS);
            if (storedBacktestPairs && storedBacktestPairs.length > 0) backtestPairsList = storedBacktestPairs;
            else backtestPairsList = [...baseDefaultPairs];
        }

        async function saveCustomPairs() {
            const isBacktesting = currentMode === "backtesting";
            await dbSet(isBacktesting ? STORAGE_KEY_BACKTEST_PAIRS : "trading_journal_custom_pairs", isBacktesting ? backtestPairsList : customPairsList);
            populatePairDropdowns();
            populateSessionPairDropdown();
        }

        function getCurrentPairsList() {
            return currentMode === "backtesting" ? backtestPairsList : customPairsList;
        }

        function openPairManager() {
            const isBacktesting = currentMode === "backtesting";
            document.getElementById("pairManagerTitle").innerHTML = isBacktesting
                ? '<i class="fa-solid fa-list-ul text-blue-400"></i> Pares de Backtesting'
                : '<i class="fa-solid fa-list-ul text-amber-400"></i> Pares de Cuentas Reales';
            document.getElementById("pairManagerModal").classList.remove("hidden");
            renderPairManagerList();
        }

        function closePairManager() {
            document.getElementById("pairManagerModal").classList.add("hidden");
        }

        function renderPairManagerList() {
            const container = document.getElementById("pairListContainer");
            const pairs = getCurrentPairsList();
            container.innerHTML = pairs.map((p, i) => `
                <div class="flex justify-between items-center bg-gray-800 px-3 py-2 rounded border border-gray-700">
                    <span class="text-white font-bold text-sm">${p}</span>
                    <button type="button" onclick="removePair(${i})" class="text-gray-400 hover:text-red-400 transition" title="Eliminar Par"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
        }

        async function addPair() {
            const val = document.getElementById("newPairInput").value.toUpperCase().trim();
            const pairs = getCurrentPairsList();
            if (val && !pairs.includes(val)) {
                pairs.push(val);
                pairs.sort();
                await saveCustomPairs();
                document.getElementById("newPairInput").value = "";
                renderPairManagerList();
                showToast("Par agregado");
            } else if (val) {
                showToast("El par ya existe", true);
            }
        }

        async function removePair(idx) {
            getCurrentPairsList().splice(idx, 1);
            await saveCustomPairs();
            renderPairManagerList();
            showToast("Par eliminado");
        }

        function getChartThemeColors() {
            const isLight = document.documentElement.classList.contains('light');
            return { tick: isLight ? '#4b5563' : '#9ca3af', grid: isLight ? '#e5e7eb' : '#30363d' };
        }

        function toggleTheme() {
            const isLight = document.documentElement.classList.toggle('light');
            localStorage.setItem('journalTheme', isLight ? 'light' : 'dark');
            const colors = getChartThemeColors();
            if (equityChartInstance) {
                const scales = equityChartInstance.options.scales;
                scales.y.ticks.color = colors.tick;
                scales.y.grid.color = colors.grid;
                scales.x.ticks.color = colors.tick;
                equityChartInstance.update();
            }
            if (outcomesChartInstance) {
                outcomesChartInstance.options.plugins.legend.labels.color = colors.tick;
                outcomesChartInstance.update();
            }
        }

        document.addEventListener("DOMContentLoaded", async () => {
            await loadCustomPairs();
            await initDirectoryHandle();
            setupTradeTimeSessionListeners();
            await setMode('real'); 
            await initMt5Bridge();
        });

        // WebP en alta calidad conserva mejor textos y líneas finas de los gráficos que JPEG.
        // Se guarda igual como data URL, así que es compatible con imágenes y respaldos anteriores.
        function compressImage(file, maxWidth = 1920, quality = 0.92) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);
                        const webp = canvas.toDataURL('image/webp', quality);
                        // Si el navegador no soporta WebP devuelve PNG; en ese caso se usa JPEG de alta calidad
                        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality));
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        async function initDirectoryHandle() {
            try {
                if ('showDirectoryPicker' in window) {
                    const db = await openAppDB();
                    directoryHandle = await getStoredDirHandle(db);
                    updateFolderButtonLabel();
                }
            } catch (e) { }
        }

        function storeDirHandle(db, handle) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction("handles", "readwrite");
                const store = transaction.objectStore("handles");
                const request = store.put(handle, "backupDirectory");
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        function getStoredDirHandle(db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction("handles", "readonly");
                const store = transaction.objectStore("handles");
                const request = store.get("backupDirectory");
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });
        }

        async function changeBackupFolder() {
            if (!('showDirectoryPicker' in window)) { alert("Navegador no soportado para guardado automático."); return; }
            try {
                directoryHandle = await window.showDirectoryPicker();
                const db = await openAppDB();
                await storeDirHandle(db, directoryHandle);
                updateFolderButtonLabel();
                showToast("Carpeta configurada con éxito");
                await autoSaveJSONToFolder();
            if (typeof triggerCloudSave === 'function') triggerCloudSave();
            } catch (err) {}
        }

        function updateFolderButtonLabel() {
            const label = document.getElementById("folder-btn-label");
            if (directoryHandle) label.textContent = `Carpeta: ${directoryHandle.name}`;
            else label.textContent = "Carpeta JSON";
        }

        async function autoSaveJSONToFolder(forceFullRealBackup = false) {
            if (!directoryHandle) return;
            try {
                let permission = await directoryHandle.queryPermission({ mode: 'readwrite' });
                if (permission !== 'granted') permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
                if (permission !== 'granted') return;

                let fileName, dataToExport;
                if (currentMode === 'real') {
                    if (activeRealAccountId && !forceFullRealBackup) {
                        const acc = realAccounts.find(s => s.id === activeRealAccountId);
                        fileName = `real_cuenta_${acc ? acc.name.replace(/[^a-zA-Z0-9]/g, '_') : activeRealAccountId}.json`;
                        const accountBalanceHistory = realBalanceHistory
                            .filter(snapshot => snapshot.accounts && snapshot.accounts.some(account => String(account.accountId) === String(activeRealAccountId)))
                            .map(snapshot => ({
                                ...snapshot,
                                accounts: snapshot.accounts.filter(account => String(account.accountId) === String(activeRealAccountId))
                            }));
                        dataToExport = {
                            account: acc,
                            trades: trades.filter(t => t.accountId === activeRealAccountId),
                            balanceHistory: accountBalanceHistory
                        };
                    } else {
                        fileName = `bitacora_real_backup_completo.json`;
                        dataToExport = { accounts: realAccounts, accountGroups, realPairs: customPairsList, balanceHistory: realBalanceHistory, trades };
                    }
                } else {
                    if (activeSessionId) {
                        const sessionObj = backtestSessions.find(s => s.id === activeSessionId);
                        fileName = `backtest_session_${sessionObj ? sessionObj.name.replace(/[^a-zA-Z0-9]/g, '_') : activeSessionId}.json`;
                        dataToExport = { session: sessionObj, trades: trades.filter(t => t.sessionId === activeSessionId), backtestPairs: backtestPairsList };
                    } else {
                        fileName = `bitacora_backtesting_all.json`;
                        dataToExport = { trades, sessions: backtestSessions, backtestPairs: backtestPairsList };
                    }
                }

                const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(dataToExport, null, 2));
                await writable.close();
            } catch (e) { }
        }

        async function loadDataForMode() {
            if (currentMode === 'real') {
                const storedTrades = await dbGet(STORAGE_KEY_REAL);
                trades = storedTrades !== null ? storedTrades : initialTrades;
                
                const storedAccounts = await dbGet(STORAGE_KEY_REAL_ACCOUNTS);
                if (Array.isArray(storedAccounts) && storedAccounts.length > 0) {
                    realAccounts = storedAccounts;
                } else if (trades.length > 0) {
                    const balanceRealAntiguo = await dbGet("trading_journal_initial_balance_real") || 100000;
                    realAccounts = [{ id: 1, name: "Cuenta Principal", balance: balanceRealAntiguo, date: new Date().toLocaleString() }];
                    trades.forEach(t => { if(!t.accountId) t.accountId = 1; });
                    await dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts);
                    await dbSet(STORAGE_KEY_REAL, trades);
                } else {
                    realAccounts = Array.isArray(storedAccounts) ? storedAccounts : [];
                }
                const storedAccountGroups = await dbGet(STORAGE_KEY_ACCOUNT_GROUPS);
                accountGroups = Array.isArray(storedAccountGroups) ? storedAccountGroups : [];
                const storedBalanceHistory = await dbGet(STORAGE_KEY_REAL_BALANCE_HISTORY);
                realBalanceHistory = Array.isArray(storedBalanceHistory) ? storedBalanceHistory : [];
                await migrateLegacyBalanceActualDates();
            } else {
                const storedTrades = await dbGet(STORAGE_KEY_BACKTESTING);
                trades = storedTrades !== null ? storedTrades : [];
                const storedSessions = await dbGet(STORAGE_KEY_SESSIONS);
                backtestSessions = storedSessions !== null ? storedSessions : [];
            }
        }

        async function setMode(mode) {
            setGlobalMetricsView(false);
            currentMode = mode;
            activeRealAccountId = null; 
            activeAccountGroupId = null;
            activeSessionId = null; 
            await loadDataForMode();

            const btnReal = document.getElementById('btn-mode-real');
            const btnBack = document.getElementById('btn-mode-backtesting');
            const titleBadge = document.getElementById('title-mode-badge');
            const mainIcon = document.getElementById('main-header-icon');
            const btnNewTrade = document.getElementById('btn-new-trade');
            const btnSubmitTrade = document.getElementById('btn-submit-trade');
            
            const tabBtnSessions = document.getElementById('tab-btn-sessions');
            const tabIconSessions = document.getElementById('tab-icon-sessions');
            const tabTextSessions = document.getElementById('tab-text-sessions');
            
            if (mode === 'real') {
                btnReal.className = "px-3 py-1.5 rounded-md text-xs font-bold bg-green-900/60 text-green-400 shadow-sm transition-all";
                btnBack.className = "px-3 py-1.5 rounded-md text-xs font-bold text-gray-500 hover:text-gray-300 transition-all";
                titleBadge.textContent = "PRO DASHBOARD";
                titleBadge.className = "text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-0.5 rounded ml-2";
                document.getElementById('reset-mode-text').textContent = "Real";
                mainIcon.className = "fa-solid fa-chart-line text-2xl text-green-500";
                
                btnNewTrade.className = "mb-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-all";
                btnSubmitTrade.className = "bg-green-600 hover:bg-green-700 px-5 py-2 rounded font-semibold text-white transition";
                
                document.getElementById('sessions-title').textContent = "Cuentas Reales";
                document.getElementById('btn-new-session').className = "bg-gray-800 hover:bg-green-900/30 text-green-400 border border-green-900/50 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center shadow-sm";
                document.getElementById('btn-new-session').innerHTML = 'Nueva Cuenta <i class="fa-solid fa-plus ml-2"></i>';
                
                tabBtnSessions.className = "pb-3 border-b-2 border-green-500 text-green-400 flex items-center gap-2 font-bold whitespace-nowrap";
                tabIconSessions.className = "fa-solid fa-wallet";
                tabTextSessions.textContent = "Tus Cuentas";
                
            } else {
                btnBack.className = "px-3 py-1.5 rounded-md text-xs font-bold bg-blue-900/60 text-blue-400 shadow-sm transition-all";
                btnReal.className = "px-3 py-1.5 rounded-md text-xs font-bold text-gray-500 hover:text-gray-300 transition-all";
                titleBadge.textContent = "BACKTESTING";
                titleBadge.className = "text-xs bg-blue-900/50 text-blue-400 border border-blue-700 px-2 py-0.5 rounded ml-2";
                document.getElementById('reset-mode-text').textContent = "Backtesting";
                mainIcon.className = "fa-solid fa-chart-line text-2xl text-blue-500";
                
                btnNewTrade.className = "mb-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-all";
                btnSubmitTrade.className = "bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded font-semibold text-white transition";
                
                document.getElementById('sessions-title').textContent = "Backtest Sessions";
                document.getElementById('btn-new-session').className = "bg-gray-800 hover:bg-blue-900/30 text-blue-400 border border-blue-900/50 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center shadow-sm";
                document.getElementById('btn-new-session').innerHTML = 'Nueva Sesión <i class="fa-solid fa-plus ml-2"></i>';
                
                tabBtnSessions.className = "pb-3 border-b-2 border-blue-500 text-blue-400 flex items-center gap-2 font-bold whitespace-nowrap";
                tabIconSessions.className = "fa-solid fa-flask";
                tabTextSessions.textContent = "Tus Sesiones";
            }

            document.getElementById('btn-global-trade').classList.toggle('hidden', mode === 'backtesting');
            document.getElementById('btn-global-metrics').classList.toggle('hidden', mode === 'backtesting');
            document.getElementById('btn-new-account-group').classList.toggle('hidden', mode === 'backtesting');
            document.getElementById('btn-back-account-groups').classList.add('hidden');
            document.getElementById('btn-edit-active-account-group').classList.add('hidden');
            document.getElementById('dashboardActualBalanceGroup').classList.toggle('hidden', mode === 'backtesting');
            document.getElementById('sessionActualBalanceContainer').classList.toggle('hidden', mode === 'backtesting');
            document.getElementById('tab-btn-dashboard').classList.add('hidden');
            document.getElementById('tab-btn-journal').classList.add('hidden');
            document.getElementById('tab-btn-gallery').classList.add('hidden');
            document.getElementById('tab-btn-monthly').classList.add('hidden');
            document.getElementById('tab-btn-balance-history').classList.toggle('hidden', mode !== 'real');
            updateBalanceHistoryTabVisibility();
            btnNewTrade.style.display = 'none'; 
            
            switchTab('sessions');
            renderGroups();
            populatePairDropdowns();
            onDashboardPeriodTypeChange();
            onJournalPeriodTypeChange();
            await syncMt5AfterModeChange();
        }

        async function updateInitialBalance() {
            const val = parseFloat(document.getElementById("dashboardBalance").value) || 0;
            if (currentMode === 'real' && activeRealAccountId) {
                const acc = realAccounts.find(x => x.id === activeRealAccountId);
                if (!(val > 0)) {
                    document.getElementById("dashboardBalance").value = getRealInitialBalance(acc);
                    showToast("El Balance Inicial debe ser mayor a 0");
                    return;
                }
                if(acc) { acc.balance = val; await saveToStorage(); }
            } else if (currentMode === 'backtesting' && activeSessionId) {
                const s = backtestSessions.find(x => x.id === activeSessionId);
                if(s) { s.balance = val; await saveToStorage(); }
            }
            renderAll();
            showToast("Balance Inicial Actualizado");
        }

        async function updateActualBalance() {
            const input = document.getElementById("dashboardBalanceActual");
            const val = parseOptionalBalance(input.value);
            if (val === null) input.value = "";
            if (currentMode === 'real' && activeRealAccountId) {
                const acc = realAccounts.find(x => x.id === activeRealAccountId);
                if (acc) {
                    const previous = parseOptionalBalance(acc.balanceActual);
                    const now = new Date();
                    acc.balanceActual = val;
                    acc.balanceActualAt = val === null ? null : now.toISOString();
                    if (val !== null && val !== previous) {
                        try {
                            await appendBalanceSnapshot(acc.id, val, now);
                        } catch (error) {
                            console.error("No se pudo registrar la captura automática", error);
                        }
                    }
                    await saveToStorage();
                }
            }
            renderAll();
            showToast(val === null ? "Balance Actual vacío: se usa el Balance Inicial como base" : "Balance Actual actualizado y registrado");
        }

        function setGlobalMetricsView(enabled) {
            isGlobalMetricsView = enabled;
            document.getElementById("dashboard-balance-controls").classList.toggle("hidden", enabled);
            document.getElementById("dashboardActualBalanceGroup").classList.toggle("hidden", enabled || currentMode === "backtesting");
            const chartIcon = document.getElementById("dashboard-chart-icon");
            if (chartIcon && chartIcon.nextSibling) {
                chartIcon.nextSibling.textContent = enabled ? " Retorno acumulado (%)" : " Evoluci\u00f3n de la Cuenta ($)";
            }
            const badge = document.getElementById("active-account-badge");
            const name = document.getElementById("active-account-name");
            if (enabled) {
                name.textContent = "M\u00e9tricas globales";
                badge.classList.remove("hidden");
            } else if (name) {
                const selected = currentMode === "real"
                    ? realAccounts.find(item => item.id === activeRealAccountId)
                    : backtestSessions.find(item => item.id === activeSessionId);
                name.textContent = selected ? selected.name : "";
            }
            document.getElementById("btn-new-trade").style.display = enabled
                ? "none"
                : (activeRealAccountId || activeSessionId ? "flex" : "none");
            updateBalanceHistoryTabVisibility();
        }

        function getActiveInitialBalance() {
            if (isGlobalMetricsView) return 0;
            if (currentMode === 'real' && activeRealAccountId) {
                return getRealInitialBalance(realAccounts.find(x => x.id === activeRealAccountId));
            }
            if (currentMode === 'backtesting' && activeSessionId) {
                const s = backtestSessions.find(x => x.id === activeSessionId);
                return s ? (s.balance || 10000) : 10000;
            }
            return parseFloat(document.getElementById("dashboardBalance").value) || 100000;
        }

        function getActiveActualBalance() {
            if (isGlobalMetricsView) return null;
            if (currentMode === 'real' && activeRealAccountId) {
                const acc = realAccounts.find(x => x.id === activeRealAccountId);
                return acc ? parseOptionalBalance(acc.balanceActual) : null;
            }
            if (currentMode === 'backtesting') return null;
            return parseOptionalBalance(document.getElementById("dashboardBalanceActual").value);
        }

        // Balance Actual opcional: null, undefined, "" o valores no numéricos se tratan como "no informado".
        function parseOptionalBalance(value) {
            if (value === null || value === undefined) return null;
            if (typeof value === "string" && value.trim() === "") return null;
            const num = parseFloat(value);
            return Number.isFinite(num) ? num : null;
        }

        // Balance Inicial de cuenta real: referencia fija para riesgo y métricas. Nunca 0/NaN.
        function getRealInitialBalance(account) {
            const num = parseFloat(account && account.balance);
            return num > 0 ? num : 100000;
        }

        // Retorno de cuenta real: balance efectivo (último cierre + operaciones) contra el inicial.
        function calculateAccountReturnPct(initialBalance, effectiveBalance) {
            const initial = parseFloat(initialBalance);
            const balance = parseFloat(effectiveBalance);
            if (!(initial > 0) || !Number.isFinite(balance)) return 0;
            return ((balance - initial) / initial) * 100;
        }

        function getBaseTrades() {
            if (isGlobalMetricsView) {
                return [...globalMetricsEntries].sort((a, b) => new Date((a.fecha || "") + "T" + (a.hora || "00:00")) - new Date((b.fecha || "") + "T" + (b.hora || "00:00")));
            }
            if (currentMode === 'real') return activeRealAccountId ? trades.filter(t => t.accountId === activeRealAccountId) : [];
            if (currentMode === 'backtesting') return activeSessionId ? trades.filter(t => t.sessionId === activeSessionId) : [];
            return [];
        }

        async function ensureGlobalMetricsLoaded() {
            if (globalMetricsLoaded) return;
            const stored = await dbGet(STORAGE_KEY_GLOBAL_METRICS);
            if (Array.isArray(stored)) {
                globalMetricsEntries = stored;
                globalMetricsDeletedSourceKeys = [];
            } else {
                globalMetricsEntries = stored && Array.isArray(stored.entries) ? stored.entries : [];
                globalMetricsDeletedSourceKeys = stored && Array.isArray(stored.deletedSourceKeys) ? stored.deletedSourceKeys : [];
            }
            let nextId = Math.max(0, ...globalMetricsEntries.map(entry => Number(entry.globalId) || 0)) + 1;
            globalMetricsEntries = globalMetricsEntries.map(entry => {
                const normalized = {
                    ...entry,
                    globalId: Number(entry.globalId) || nextId++,
                    sourceKey: entry.sourceKey || getGlobalMetricsSourceKey(entry)
                };
                delete normalized.sourceAccountIds;
                delete normalized.sourceAccountNames;
                delete normalized.sourceTradeIds;
                return normalized;
            });
            globalMetricsLoaded = true;
        }

        async function saveGlobalMetricsStore() {
            await ensureGlobalMetricsLoaded();
            await dbSet(STORAGE_KEY_GLOBAL_METRICS, {
                entries: globalMetricsEntries,
                deletedSourceKeys: globalMetricsDeletedSourceKeys
            });
        }

        function getGlobalMetricsLegacySignature(trade) {
            const date = String(trade.fecha || "").trim();
            const time = String(trade.hora || "").trim();
            const asset = String(trade.par || "").trim().toUpperCase();
            if (String(trade.pipsSL ?? "").trim() === "" || String(trade.pipsTP ?? "").trim() === "") return "";
            const pipsSL = Number(trade.pipsSL);
            const pipsTP = Number(trade.pipsTP);
            if (!date || !time || !asset || !Number.isFinite(pipsSL) || !Number.isFinite(pipsTP)) return "";
            return JSON.stringify([date, time, asset, pipsSL, pipsTP]);
        }

        function getGlobalMetricsTradeLocator(trade) {
            return JSON.stringify([String(trade.accountId), String(trade.id)]);
        }

        function getGlobalMetricsSourceKey(trade, legacySourceKeys = null) {
            if (trade.multiEntryId !== undefined && trade.multiEntryId !== null && String(trade.multiEntryId) !== "") {
                return "multi:" + String(trade.multiEntryId);
            }
            const legacySourceKey = legacySourceKeys && legacySourceKeys.get(getGlobalMetricsTradeLocator(trade));
            if (legacySourceKey) return legacySourceKey;
            return "trade:" + String(trade.accountId) + ":" + String(trade.id);
        }

        async function syncGlobalMetricsFromTrades() {
            await ensureGlobalMetricsLoaded();
            const realTrades = trades.filter(trade => trade.accountId !== undefined && trade.accountId !== null);
            const legacyAccountsBySignature = new Map();
            realTrades.forEach(trade => {
                if (trade.multiEntryId !== undefined && trade.multiEntryId !== null && String(trade.multiEntryId) !== "") return;
                const signature = getGlobalMetricsLegacySignature(trade);
                if (!signature) return;
                if (!legacyAccountsBySignature.has(signature)) legacyAccountsBySignature.set(signature, new Map());
                const tradesByAccount = legacyAccountsBySignature.get(signature);
                const accountId = String(trade.accountId);
                if (!tradesByAccount.has(accountId)) tradesByAccount.set(accountId, []);
                tradesByAccount.get(accountId).push(trade);
            });
            const legacySourceKeys = new Map();
            legacyAccountsBySignature.forEach((tradesByAccount, signature) => {
                if (tradesByAccount.size < 2) return;
                tradesByAccount.forEach((accountTrades, accountId) => {
                    accountTrades.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
                    accountTrades.forEach((trade, index) => {
                        legacySourceKeys.set(
                            getGlobalMetricsTradeLocator(trade),
                            `legacy:${signature}:${index}`
                        );
                    });
                });
            });

            let changed = false;
            const uniqueEntriesBySource = new Map();
            globalMetricsEntries.forEach(entry => {
                const sourceKey = getGlobalMetricsSourceKey(entry, legacySourceKeys);
                const normalizedEntry = entry.sourceKey === sourceKey ? entry : { ...entry, sourceKey };
                if (normalizedEntry !== entry) changed = true;

                const existing = uniqueEntriesBySource.get(sourceKey);
                if (!existing) {
                    uniqueEntriesBySource.set(sourceKey, normalizedEntry);
                    return;
                }

                const preferredEntry = existing.globalEdited || !normalizedEntry.globalEdited ? existing : normalizedEntry;
                const existingId = Number(existing.globalId) || Number.MAX_SAFE_INTEGER;
                const duplicateId = Number(normalizedEntry.globalId) || Number.MAX_SAFE_INTEGER;
                uniqueEntriesBySource.set(sourceKey, {
                    ...preferredEntry,
                    globalId: Math.min(existingId, duplicateId),
                    sourceKey
                });
                changed = true;
            });
            globalMetricsEntries = Array.from(uniqueEntriesBySource.values());

            const groups = new Map();
            realTrades.forEach(trade => {
                const sourceKey = getGlobalMetricsSourceKey(trade, legacySourceKeys);
                if (!groups.has(sourceKey)) groups.set(sourceKey, []);
                groups.get(sourceKey).push(trade);
            });

            groups.forEach((members, sourceKey) => {
                const currentIndex = globalMetricsEntries.findIndex(entry => entry.sourceKey === sourceKey);

                if (currentIndex !== -1) {
                    const current = globalMetricsEntries[currentIndex];
                    const before = JSON.stringify(current);
                    const sourceMetadata = { sourceKey };
                    if (current.globalEdited) {
                        Object.assign(current, sourceMetadata);
                    } else {
                        const snapshot = JSON.parse(JSON.stringify(members[0]));
                        globalMetricsEntries[currentIndex] = {
                            ...snapshot,
                            ...sourceMetadata,
                            globalId: current.globalId,
                            globalEdited: false
                        };
                    }
                    if (JSON.stringify(globalMetricsEntries[currentIndex]) !== before) changed = true;
                    return;
                }

                if (globalMetricsDeletedSourceKeys.includes(sourceKey)) return;
                const snapshot = JSON.parse(JSON.stringify(members[0]));
                const nextId = Math.max(0, ...globalMetricsEntries.map(entry => Number(entry.globalId) || 0)) + 1;
                globalMetricsEntries.push({
                    ...snapshot,
                    globalId: nextId,
                    sourceKey,
                    globalEdited: false
                });
                changed = true;
            });

            if (changed) await saveGlobalMetricsStore();
        }

        async function openGlobalMetrics() {
            if (currentMode !== "real") {
                showToast("Las m\u00e9tricas globales est\u00e1n disponibles en cuentas reales", true);
                return;
            }
            await syncGlobalMetricsFromTrades();
            setGlobalMetricsView(true);
            ["dashboard", "journal", "monthly", "gallery"].forEach(tab => {
                document.getElementById(`tab-btn-${tab}`).classList.remove("hidden");
            });
            document.getElementById("dashboardPeriodType").value = "ALL";
            document.getElementById("filterPeriodoType").value = "ALL";
            document.getElementById("filterEstado").value = "ALL";
            document.getElementById("filterSesion").value = "ALL";
            document.getElementById("filterSearch").value = "";
            populatePairDropdowns();
            document.getElementById("filterPar").value = "ALL";
            onDashboardPeriodTypeChange();
            onJournalPeriodTypeChange();
            renderAll();
            switchTab("dashboard");
        }

        function editGlobalMetricEntry(id) {
            const entry = globalMetricsEntries.find(item => Number(item.globalId) === Number(id));
            if (!entry) return;
            globalMetricsEditingEntryId = Number(entry.globalId);
            openTradeModal();

            document.getElementById("tradeId").value = "";
            document.getElementById("modalTitle").innerHTML = '<i class="fa-solid fa-pen-to-square text-teal-400"></i> Editar copia global';
            document.getElementById("inputFecha").value = entry.fecha || "";
            document.getElementById("inputHora").value = entry.hora || "";
            const pairInput = document.getElementById("inputPar");
            const pair = String(entry.par || "EURUSD").toUpperCase();
            if (!Array.from(pairInput.options).some(option => option.value === pair)) {
                pairInput.insertAdjacentHTML("beforeend", '<option value="' + escapeGalleryHtml(pair) + '">' + escapeGalleryHtml(pair) + '</option>');
            }
            pairInput.value = pair;
            document.getElementById("inputSesion").value = entry.sesion || "";
            document.getElementById("inputTendencia").value = entry.tendencia || "";
            document.getElementById("inputPipsSL").value = entry.pipsSL === undefined ? "" : entry.pipsSL;
            document.getElementById("inputPipsTP").value = entry.pipsTP === undefined ? "" : entry.pipsTP;
            document.getElementById("inputRR").value = entry.rr === undefined ? "" : entry.rr;
            document.getElementById("inputOrden").value = entry.orden || "";
            setTradeRiskValue(entry.riesgo);
            document.getElementById("inputEstado").value = entry.estado || "Sin Activar";
            document.getElementById("inputNotaAntes").value = entry.notaAntes || "";
            document.getElementById("inputNotaDespues").value = entry.notaDespues || "";
            document.getElementById("inputLinkAntes").value = entry.linkAntes || "";
            document.getElementById("inputLinkDespues").value = entry.linkDespues || "";
            document.getElementById("inputResultadoParcial").value = entry.resultadoParcial === undefined ? "" : entry.resultadoParcial;
            document.getElementById("parcialCustomContainer").classList.toggle("hidden", entry.estado !== "Parcial");
            currentUploadedImagesAntes = Array.isArray(entry.imagenesAntes) ? [...entry.imagenesAntes] : [];
            currentUploadedImagesDespues = Array.isArray(entry.imagenesDespues) ? [...entry.imagenesDespues] : [];
            renderImagePreviewsAntes();
            renderImagePreviewsDespues();
            calculatePositionSize();
        }

        async function deleteGlobalMetricEntry(id) {
            const entry = globalMetricsEntries.find(item => Number(item.globalId) === Number(id));
            if (!entry) return;
            if (!confirm("\u00bfEliminar esta copia solo del registro global? La operaci\u00f3n original seguir\u00e1 en su cuenta.")) return;
            globalMetricsEntries = globalMetricsEntries.filter(item => Number(item.globalId) !== Number(id));
            if (entry.sourceKey && !globalMetricsDeletedSourceKeys.includes(entry.sourceKey)) {
                globalMetricsDeletedSourceKeys.push(entry.sourceKey);
            }
            await saveGlobalMetricsStore();
            renderAll();
            showToast("Copia eliminada del registro global");
        }

        async function saveToStorage() {
            const keyTrades = currentMode === 'real' ? STORAGE_KEY_REAL : STORAGE_KEY_BACKTESTING;
            try {
                await dbSet(keyTrades, trades);
                if (currentMode === 'real') {
                    await dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts);
                    await dbSet(STORAGE_KEY_ACCOUNT_GROUPS, accountGroups);
                }
                if (currentMode === 'backtesting') await dbSet(STORAGE_KEY_SESSIONS, backtestSessions);
            } catch (err) { }

            if (currentMode === 'real') {
                try { await syncGlobalMetricsFromTrades(); } catch (err) { console.error(err); }
            }
            
            populatePairDropdowns();
            await autoSaveJSONToFolder();
            if (typeof triggerCloudSave === 'function') triggerCloudSave();
            
            if ((currentMode === 'real' && !activeRealAccountId) || (currentMode === 'backtesting' && !activeSessionId)) {
                renderGroups();
            } else {
                renderAll();
            }
        }

        document.addEventListener('paste', async (e) => {
            const tradeModal = document.getElementById('tradeModal');
            if (tradeModal.classList.contains('hidden')) return;
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            let imagePasted = false;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    imagePasted = true;
                    const activeId = document.activeElement ? document.activeElement.id : '';
                    const isDespues = activeId === 'inputNotaDespues' || activeId === 'inputCapturasDespues';
                    const compressed = await compressImage(file);
                    
                    if (isDespues) { currentUploadedImagesDespues.push(compressed); renderImagePreviewsDespues(); showToast("Imagen pegada en DESPUÉS"); } 
                    else { currentUploadedImagesAntes.push(compressed); renderImagePreviewsAntes(); showToast("Imagen pegada en ANTES"); }
                }
            }
            if (imagePasted && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) e.preventDefault();
        });

        function getAccountGroupAccounts(group) {
            const memberIds = Array.isArray(group?.accountIds) ? group.accountIds.map(String) : [];
            return realAccounts.filter(account => memberIds.includes(String(account.id)));
        }

        function getAccountGroupIconClass(icon) {
            const allowed = [
                "fa-solid fa-layer-group", "fa-solid fa-graduation-cap", "fa-solid fa-award",
                "fa-solid fa-bolt", "fa-solid fa-wallet", "fa-solid fa-building",
                "fa-solid fa-chart-line", "fa-solid fa-rocket"
            ];
            return allowed.includes(icon) ? icon : "fa-solid fa-layer-group";
        }

        function openAccountGroupView(groupId) {
            const group = accountGroups.find(item => String(item.id) === String(groupId));
            if (!group) return;
            activeAccountGroupId = group.id;
            groupBalancesVisible = false;
            document.getElementById("sessions-title").innerHTML = `<i class="${getAccountGroupIconClass(group.icon)} mr-2 text-indigo-300"></i>${escapeGalleryHtml(group.name)}`;
            document.getElementById("btn-back-account-groups").classList.remove("hidden");
            document.getElementById("btn-edit-active-account-group").classList.remove("hidden");
            renderGroups();
        }

        function returnToAccountGroups() {
            activeAccountGroupId = null;
            groupBalancesVisible = false;
            document.getElementById("sessions-title").textContent = "Cuentas Reales";
            document.getElementById("btn-back-account-groups").classList.add("hidden");
            document.getElementById("btn-edit-active-account-group").classList.add("hidden");
            renderGroups();
        }

        function editActiveAccountGroup() {
            if (activeAccountGroupId !== null) openAccountGroupModal(activeAccountGroupId);
        }

        function updateGroupBalancesToggleButton() {
            const text = document.getElementById("btn-group-toggle-balances-text");
            const icon = document.getElementById("btn-group-toggle-balances-icon");
            if (text) text.textContent = groupBalancesVisible ? "Ocultar balances" : "Ver balances";
            if (icon) icon.className = groupBalancesVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
        }

        function openActiveGroupBalancesModal() {
            if (activeAccountGroupId === null) return;
            openRealBalanceEntryModal(activeAccountGroupId);
        }

        function toggleGroupBalancesPanel() {
            if (activeAccountGroupId === null) return;
            groupBalancesVisible = !groupBalancesVisible;
            renderGroups();
        }

                function appendAccountCard(grid, item, isBT) {
            const itemTrades = trades.filter(trade => (isBT ? trade.sessionId === item.id : trade.accountId === item.id) && trade.estado !== "Sin Activar");
            const initialBal = isBT ? (item.balance || 10000) : getRealInitialBalance(item);
            const effectiveBal = isBT ? null : getAccountEffectiveBalance(item);
            const tradesNetPct = itemTrades.reduce((sum, trade) => sum + getTradeOutcome(trade), 0);
            const ret = isBT ? tradesNetPct : calculateAccountReturnPct(effectiveBal.initial, effectiveBal.balance);
            const displayedActual = effectiveBal ? Number(effectiveBal.balance.toFixed(2)) : null;
            const balanceBaseLabel = effectiveBal ? getBalanceBaseLabel(effectiveBal) : "";
            const balanceTitle = effectiveBal
                ? (!effectiveBal.informed
                    ? "Sin Balance Actual: se usa el Balance Inicial como base; incluye las operaciones registradas. No incluye comisiones."
                    : (effectiveBal.projected
                        ? "Último cierre + operaciones posteriores. No incluye comisiones."
                        : "Último cierre informado."))
                : "";
            const actualBalanceClass = effectiveBal && effectiveBal.informed ? "text-blue-300" : "text-gray-400";

            const retClass = ret > 0 ? "text-emerald-400" : (ret < 0 ? "text-red-400" : "text-gray-400");
            const card = document.createElement("div");
            const accountStage = getAccountStage(item);
            const accountGoalMini = isBT ? "" : buildAccountGoalMiniHtml(item);

            // Sin justify-between: el bloque de datos debe quedar arriba para alinear
            // las barras de progreso entre tarjetas con más o menos contenido.
            card.className = "bg-[#161b22] p-5 rounded-xl border border-main shadow relative hover:bg-[#1a2129] transition group flex flex-col";
            card.innerHTML = `
                <div class="flex justify-end gap-1 -mt-2 -mr-2 mb-1">
                    <button type="button" data-account-action="edit" title="Editar ${isBT ? "sesión" : "cuenta"}" class="text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition p-2"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" data-account-action="delete" title="Borrar ${isBT ? "sesión" : "cuenta"}" class="text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition p-2"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-12 pr-4">
                    <div class="text-gray-400 font-semibold text-left">Nombre:</div><div class="text-white text-right truncate font-medium">${escapeGalleryHtml(item.name)}</div>
                    ${isBT ? `<div class="text-gray-400 font-semibold text-left">Activo/Par:</div><div class="text-white text-right font-medium">${escapeGalleryHtml(item.pair || "-")}</div>` : ""}
                    ${isBT ? `<div class="text-gray-400 font-semibold text-left">Inicio:</div><div class="text-white text-right font-medium">${item.startDate ? new Date(item.startDate + "T00:00:00").toLocaleDateString("es-AR") : "-"}</div>` : ""}
                    ${isBT ? renderSessionModeRow(item) : ""}
                    <div class="text-gray-400 font-semibold text-left">Bal. Inicial:</div><div class="text-white text-right font-medium">${initialBal}</div>
                    ${isBT ? "" : `<div class="text-gray-400 font-semibold text-left">Bal. efectivo:</div><div class="${actualBalanceClass} text-right font-medium" title="${balanceTitle}">${displayedActual}${balanceBaseLabel ? `<span class="text-[10px] font-normal text-gray-500">${balanceBaseLabel}</span>` : ""}</div>`}
                    <div class="text-gray-400 font-semibold text-left">Return:</div><div class="${retClass} text-right font-bold font-mono">${ret > 0 ? "+" : ""}${ret.toFixed(2)}%</div>
                    ${isBT ? "" : `<div class="text-gray-400 font-semibold text-left">Etapa:</div><div class="text-right"><span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${ACCOUNT_STAGE_BADGES[accountStage]}"><i class="${ACCOUNT_STAGE_ICONS[accountStage]}"></i>${ACCOUNT_STAGE_LABELS[accountStage]}</span></div>`}
                    ${accountGoalMini ? `<div class="col-span-2 mt-1">${accountGoalMini}</div>` : ""}
                </div>
                ${isBT ? `
                    <div class="absolute bottom-5 left-5 right-5 flex gap-2">
                        <button type="button" data-account-action="start" class="flex-1 min-w-0 bg-blue-600 text-white border border-blue-500/50 rounded-lg px-1 py-2.5 flex items-center justify-center gap-2 hover:bg-blue-500 transition shadow-lg text-[11px] font-bold whitespace-nowrap">
                            <i class="fa-solid fa-play"></i><span>Empezar</span>
                        </button>
                    </div>
                ` : `
                <div class="absolute bottom-5 left-5 right-5 flex gap-2">
                    <button type="button" data-account-action="quick" class="flex-1 min-w-0 bg-gray-800 text-amber-300 border border-amber-900/50 rounded-lg px-1 py-2.5 flex items-center justify-center gap-1 hover:bg-amber-500 hover:text-black transition shadow-lg text-[11px] font-bold whitespace-nowrap">
                        <i class="fa-solid fa-plus"></i><span>Nueva entrada</span>
                    </button>
                    <button type="button" data-account-action="metrics" class="flex-1 min-w-0 bg-[#112130] text-green-400 hover:bg-green-600 border border-green-900/50 rounded-lg px-1 py-2.5 flex items-center justify-center gap-1 hover:text-white border transition shadow-lg text-[11px] font-bold whitespace-nowrap">
                        <i class="fa-solid fa-chart-line"></i><span>Métricas</span>
                    </button>
                </div>`}
            `;
            card.querySelector('[data-account-action="edit"]').addEventListener("click", () => editGroup(item.id));
            card.querySelector('[data-account-action="delete"]').addEventListener("click", () => deleteGroup(item.id));
            const quickButton = card.querySelector('[data-account-action="quick"]');
            const metricsButton = card.querySelector('[data-account-action="metrics"]');
            const startButton = card.querySelector('[data-account-action="start"]');
            if (quickButton) quickButton.addEventListener("click", () => quickAddTrade(item.id, item.name));
            if (metricsButton) metricsButton.addEventListener("click", () => enterGroup(item.id));
            if (startButton) startButton.addEventListener("click", () => enterGroup(item.id));
            grid.appendChild(card);
        }

        function appendAccountGroupCard(grid, group) {
            const groupAccounts = getAccountGroupAccounts(group);
            const iconClass = getAccountGroupIconClass(group.icon);
            const previewNames = groupAccounts.length
                ? `${groupAccounts.slice(0, 3).map(account => escapeGalleryHtml(account.name)).join(" · ")}${groupAccounts.length > 3 ? ` · +${groupAccounts.length - 3}` : ""}`
                : "Sin cuentas asignadas";
            let groupBalanceSummaryHtml = "";
            if (groupAccounts.length) {
                const groupSummary = getGroupBalanceSummary(groupAccounts);
                const pnlTone = groupSummary.pnl > 0 ? "text-emerald-400" : (groupSummary.pnl < 0 ? "text-red-400" : "text-gray-300");
                const pnlText = `${groupSummary.pnl > 0 ? "+" : ""}${formatBalanceHistoryMoney(groupSummary.pnl)} (${groupSummary.pnlPct > 0 ? "+" : ""}${groupSummary.pnlPct.toFixed(2)}%)`;
                const initialChip = groupSummary.usingInitial.length
                    ? `<span class="rounded border border-amber-800 bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300" title="${groupSummary.usingInitial.length} cuenta(s) sin Balance Actual: se usa el Balance Inicial como base">${groupSummary.usingInitial.length} con inicial</span>`
                    : "";
                groupBalanceSummaryHtml = `<div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span class="font-bold text-white" title="Total proyectado de todas las cuentas; no incluye comisiones">${formatBalanceHistoryMoney(groupSummary.actual)}</span>
                        <span class="${pnlTone} font-semibold" title="P/L proyectado; no incluye comisiones">${pnlText}</span>
                        ${initialChip}
                    </div>`;
            }
            const card = document.createElement("article");
            card.className = "account-group-card focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl";
            card.tabIndex = 0;
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", `Abrir grupo ${group.name}, ${groupAccounts.length} cuentas`);
            card.innerHTML = `
                <div class="account-group-stack account-group-stack-back"></div>
                <div class="account-group-stack"></div>
                <div class="account-group-face bg-[#161b22] rounded-xl border border-indigo-500/50 p-5 shadow-lg flex flex-col justify-between">
                    <div>
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-indigo-400/30 bg-indigo-950/60 text-indigo-300"><i class="${iconClass} text-lg"></i></span>
                                <div class="min-w-0"><h3 class="truncate text-base font-bold text-white">${escapeGalleryHtml(group.name)}</h3><p class="mt-1 text-xs text-indigo-200/80">${groupAccounts.length} ${groupAccounts.length === 1 ? "cuenta" : "cuentas"}</p></div>
                            </div>
                            <div class="flex shrink-0 gap-1">
                                <button type="button" data-group-action="edit" title="Editar grupo" class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-blue-400"><i class="fa-solid fa-pen"></i></button>
                                <button type="button" data-group-action="delete" title="Borrar grupo" class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-red-400"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                        <p class="mt-4 truncate text-xs text-gray-400">${previewNames}</p>
                        ${groupBalanceSummaryHtml}
                    </div>
                    <div class="mt-5 flex gap-2">
                        <button type="button" data-group-action="open" class="flex-1 rounded-lg border border-main bg-gray-800 px-2 py-2.5 text-xs font-bold text-gray-200 transition hover:bg-gray-700"><i class="fa-solid fa-folder-open mr-1.5"></i>Ver cuentas</button>
                        <button type="button" data-group-action="trade" ${groupAccounts.length ? "" : "disabled"} class="flex-1 rounded-lg border border-purple-800/70 bg-purple-950/60 px-2 py-2.5 text-xs font-bold text-purple-200 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"><i class="fa-solid fa-layer-group mr-1.5"></i>Entrada múltiple</button>
                    </div>
                </div>`;
            card.addEventListener("click", () => openAccountGroupView(group.id));
            card.addEventListener("keydown", event => {
                if (event.target === card && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    openAccountGroupView(group.id);
                }
            });
            card.querySelectorAll("[data-group-action]").forEach(button => button.addEventListener("click", event => {
                event.stopPropagation();
                const action = button.dataset.groupAction;
                if (action === "edit") openAccountGroupModal(group.id);
                if (action === "delete") deleteAccountGroup(group.id);
                if (action === "open") openAccountGroupView(group.id);
                if (action === "trade") openGlobalTradeModal(group.id);
            }));
            grid.appendChild(card);
        }

        function renderGroups() {
            const grid = document.getElementById("sessions-grid");
            grid.innerHTML = "";
            grid.classList.remove("hidden");
            updateLatestMultiEntryButton();
            updateBalanceHistoryTabVisibility();
            const globalTradeButton = document.getElementById("btn-global-trade");
            const globalMetricsButton = document.getElementById("btn-global-metrics");
            const hideGlobalButtons = currentMode === "backtesting" || activeAccountGroupId !== null;
            if (globalTradeButton) globalTradeButton.classList.toggle("hidden", hideGlobalButtons);
            if (globalMetricsButton) globalMetricsButton.classList.toggle("hidden", hideGlobalButtons);
            const isBT = currentMode === "backtesting";
            const backButton = document.getElementById("btn-back-account-groups");
            const editActiveGroupButton = document.getElementById("btn-edit-active-account-group");
            const groupLoadButton = document.getElementById("btn-group-load-balances");
            const groupToggleButton = document.getElementById("btn-group-toggle-balances");
            const summaryPanel = document.getElementById("group-summary-panel");
            if (groupLoadButton) groupLoadButton.classList.add("hidden");
            if (groupToggleButton) groupToggleButton.classList.add("hidden");
            if (summaryPanel) {
                summaryPanel.classList.add("hidden");
                summaryPanel.innerHTML = "";
            }
            if (groupBalanceChartInstance) {
                groupBalanceChartInstance.destroy();
                groupBalanceChartInstance = null;
            }

            if (isBT) {
                activeAccountGroupId = null;
                backButton.classList.add("hidden");
                editActiveGroupButton.classList.add("hidden");
                if (!backtestSessions.length) {
                    grid.innerHTML = `<div class="col-span-full rounded-xl border border-main bg-[#161b22] py-12 text-center text-gray-500 shadow"><i class="fa-regular fa-folder-open mb-3 block text-4xl text-gray-600"></i>No hay sesiones creadas.</div>`;
                    return;
                }
                [...backtestSessions].sort((a, b) => b.id - a.id).forEach(item => appendAccountCard(grid, item, true));
                return;
            }

            const activeGroup = activeAccountGroupId === null ? null : accountGroups.find(group => String(group.id) === String(activeAccountGroupId));
            if (activeAccountGroupId !== null && !activeGroup) activeAccountGroupId = null;
            if (activeGroup) {
                document.getElementById("sessions-title").innerHTML = `<i class="${getAccountGroupIconClass(activeGroup.icon)} mr-2 text-indigo-300"></i>${escapeGalleryHtml(activeGroup.name)}`;
                backButton.classList.remove("hidden");
                editActiveGroupButton.classList.remove("hidden");
                const groupAccounts = getAccountGroupAccounts(activeGroup).sort((a, b) => b.id - a.id);
                if (!groupAccounts.length) {
                    grid.innerHTML = `<div class="col-span-full rounded-xl border border-main bg-[#161b22] p-8 text-center text-gray-400"><i class="fa-regular fa-folder-open mb-3 block text-3xl text-gray-500"></i>Este grupo aún no tiene cuentas.<br><span class="mt-1 block text-xs text-gray-500">Edita el grupo para agregar cuentas.</span></div>`;
                    return;
                }
                if (groupLoadButton) groupLoadButton.classList.remove("hidden");
                if (groupToggleButton) groupToggleButton.classList.remove("hidden");
                updateGroupBalancesToggleButton();
                if (groupBalancesVisible) {
                    if (summaryPanel) {
                        summaryPanel.classList.remove("hidden");
                        renderGroupSummaryPanel(activeGroup, groupAccounts);
                    }
                    grid.classList.add("hidden");
                    return;
                }
                groupAccounts.forEach(account => appendAccountCard(grid, account, false));
                return;
            }

            document.getElementById("sessions-title").textContent = "Cuentas Reales";
            backButton.classList.add("hidden");
            editActiveGroupButton.classList.add("hidden");
            const sortedGroups = [...accountGroups].sort((a, b) => Number(b.id) - Number(a.id));
            sortedGroups.forEach(group => appendAccountGroupCard(grid, group));

            const groupedIds = new Set(accountGroups.flatMap(group => Array.isArray(group.accountIds) ? group.accountIds.map(String) : []));
            const ungroupedAccounts = realAccounts.filter(account => !groupedIds.has(String(account.id))).sort((a, b) => b.id - a.id);
            if (ungroupedAccounts.length) {
                const heading = document.createElement("h3");
                heading.className = "col-span-full mt-1 text-xs font-bold uppercase tracking-wider text-gray-500";
                heading.textContent = "Cuentas sin agrupar";
                grid.appendChild(heading);
                ungroupedAccounts.forEach(account => appendAccountCard(grid, account, false));
            }

            if (!accountGroups.length && !realAccounts.length) {
                grid.innerHTML = `<div class="col-span-full rounded-xl border border-main bg-[#161b22] py-12 text-center text-gray-500 shadow"><i class="fa-regular fa-folder-open mb-3 block text-4xl text-gray-600"></i>No hay cuentas creadas. Puedes crear una cuenta o un grupo.</div>`;
            }
        }
        function renderAccountGroupAccountPicker(selectedIds = []) {
            const container = document.getElementById("accountGroupAccountList");
            const selected = new Set(selectedIds.map(String));
            container.innerHTML = "";
            if (!realAccounts.length) {
                container.innerHTML = `<p class="p-3 text-xs text-gray-500">Crea cuentas reales para agregarlas a este grupo.</p>`;
                updateAccountGroupSelectionCount();
                return;
            }

            [...realAccounts].sort((a, b) => String(a.name).localeCompare(String(b.name), "es")).forEach(account => {
                const label = document.createElement("label");
                label.className = "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-200 transition hover:bg-gray-800";
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = String(account.id);
                checkbox.checked = selected.has(String(account.id));
                checkbox.className = "h-4 w-4 accent-indigo-500";
                checkbox.addEventListener("change", updateAccountGroupSelectionCount);
                const name = document.createElement("span");
                name.className = "min-w-0 flex-1 truncate";
                name.textContent = account.name || "Cuenta sin nombre";
                const balance = document.createElement("span");
                balance.className = "shrink-0 text-[10px] text-gray-500";
                balance.textContent = `$${Number(account.balance) || 0}`;
                label.append(checkbox, name, balance);
                container.appendChild(label);
            });
            updateAccountGroupSelectionCount();
        }

        function updateAccountGroupSelectionCount() {
            const selectedCount = document.querySelectorAll("#accountGroupAccountList input[type='checkbox']:checked").length;
            document.getElementById("accountGroupSelectionCount").textContent = `${selectedCount} ${selectedCount === 1 ? "cuenta" : "cuentas"}`;
        }

        function openAccountGroupModal(groupId = null) {
            const group = groupId === null ? null : accountGroups.find(item => String(item.id) === String(groupId));
            if (groupId !== null && !group) return;
            editingAccountGroupId = group ? group.id : null;
            document.getElementById("accountGroupForm").reset();
            document.getElementById("inputAccountGroupId").value = group ? group.id : "";
            document.getElementById("inputAccountGroupName").value = group?.name || "";
            document.getElementById("inputAccountGroupIcon").value = getAccountGroupIconClass(group?.icon);
            document.getElementById("accountGroupModalTitle").innerHTML = `<i class="fa-solid fa-layer-group text-indigo-400 mr-2"></i>${group ? "Editar grupo de cuentas" : "Nuevo grupo de cuentas"}`;
            renderAccountGroupAccountPicker(group?.accountIds || []);
            document.getElementById("accountGroupModal").classList.remove("hidden");
        }

        function closeAccountGroupModal() {
            document.getElementById("accountGroupModal").classList.add("hidden");
            editingAccountGroupId = null;
        }

        async function saveAccountGroup(event) {
            event.preventDefault();
            const idInput = document.getElementById("inputAccountGroupId").value;
            const isEdit = idInput !== "";
            const id = isEdit ? editingAccountGroupId : Date.now();
            const selectedAccountIds = [...document.querySelectorAll("#accountGroupAccountList input[type='checkbox']:checked")]
                .map(input => realAccounts.find(account => String(account.id) === input.value)?.id)
                .filter(accountId => accountId !== undefined);
            const existingIndex = accountGroups.findIndex(group => String(group.id) === String(id));
            const existing = existingIndex >= 0 ? accountGroups[existingIndex] : null;
            const savedGroup = {
                ...(existing || {}),
                id,
                name: document.getElementById("inputAccountGroupName").value.trim(),
                icon: getAccountGroupIconClass(document.getElementById("inputAccountGroupIcon").value),
                accountIds: [...new Set(selectedAccountIds.map(String))]
                    .map(accountId => realAccounts.find(account => String(account.id) === accountId)?.id)
                    .filter(accountId => accountId !== undefined),
                date: existing?.date || new Date().toLocaleString("es-ES")
            };
            if (existingIndex >= 0) accountGroups[existingIndex] = savedGroup;
            else accountGroups.push(savedGroup);

            await saveToStorage();
            closeAccountGroupModal();
            renderGroups();
            showToast(isEdit ? "Grupo actualizado" : "Grupo creado");
        }

        async function deleteAccountGroup(groupId) {
            const group = accountGroups.find(item => String(item.id) === String(groupId));
            if (!group) return;
            if (!confirm(`¿Eliminar el grupo "${group.name}"? Las cuentas y sus operaciones se conservarán.`)) return;
            accountGroups = accountGroups.filter(item => String(item.id) !== String(groupId));
            if (String(activeAccountGroupId) === String(groupId)) activeAccountGroupId = null;
            if (typeof deleteFromCloud === "function") deleteFromCloud("group", groupId);
            await saveToStorage();
            renderGroups();
            showToast("Grupo eliminado; las cuentas se conservaron");
        }

        function openSessionModal() {
            document.getElementById("sessionForm").reset();
            document.getElementById("inputIdSession").value = "";
            document.getElementById("sessionActualBalanceContainer").classList.toggle("hidden", currentMode === "backtesting");
            const btn = document.getElementById("btn-submit-session");
            const sessionPairInput = document.getElementById("inputSessionPair");
            const sessionStartDateInput = document.getElementById("inputSessionStartDate");
            btn.textContent = "Crear";
            
            if (currentMode === 'real') {
                document.getElementById("modalSessionTitle").textContent = "Crear Nueva Cuenta";
                document.getElementById("inputSessionBalance").value = 100000;
                document.getElementById("sessionPairContainer").classList.add("hidden");
                sessionPairInput.required = false;
                document.getElementById("sessionStartDateContainer").classList.add("hidden");
                sessionStartDateInput.required = false;
                document.getElementById("sessionModeContainer").classList.add("hidden");
                document.getElementById("accountStageContainer").classList.remove("hidden");
                fillAccountStageForm(null);
                btn.className = "bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg";
            } else {
                document.getElementById("accountStageContainer").classList.add("hidden");
                document.getElementById("sessionModeContainer").classList.remove("hidden");
                fillFondeoForm(null);
                document.getElementById("modalSessionTitle").textContent = "Crear Sesión de Backtest";
                document.getElementById("inputSessionBalance").value = 10000;
                document.getElementById("sessionPairContainer").classList.remove("hidden");
                sessionPairInput.required = true;
                populateSessionPairDropdown();
                document.getElementById("sessionStartDateContainer").classList.remove("hidden");
                sessionStartDateInput.required = true;
                btn.className = "bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg";
            }
            document.getElementById("sessionModal").classList.remove("hidden");
        }

        function editGroup(id) {
            const isBT = currentMode === 'backtesting';
            const list = isBT ? backtestSessions : realAccounts;
            const item = list.find(x => x.id === id);
            if(!item) return;

            document.getElementById("sessionForm").reset();
            document.getElementById("inputIdSession").value = item.id;
            document.getElementById("inputSessionName").value = item.name;
            if (isBT) populateSessionPairDropdown(item.pair || '');
            document.getElementById("inputSessionStartDate").value = item.startDate || '';
            document.getElementById("inputSessionBalance").value = item.balance || (isBT ? 10000 : 100000);
            const editActualBal = isBT ? null : parseOptionalBalance(item.balanceActual);
            document.getElementById("inputSessionBalanceActual").value = editActualBal !== null ? editActualBal : '';
            document.getElementById("sessionActualBalanceContainer").classList.toggle("hidden", isBT);
            
            document.getElementById("modalSessionTitle").textContent = isBT ? "Editar Sesión" : "Editar Cuenta";
            if (isBT) {
                document.getElementById("sessionPairContainer").classList.remove("hidden");
                document.getElementById("inputSessionPair").required = true;
                document.getElementById("sessionStartDateContainer").classList.remove("hidden");
                document.getElementById("inputSessionStartDate").required = true;
                const sessionHasTrades = trades.some(trade => String(trade.sessionId) === String(item.id));
                document.getElementById("inputSessionPair").disabled = sessionHasTrades;
                document.getElementById("sessionModeContainer").classList.remove("hidden");
                document.getElementById("accountStageContainer").classList.add("hidden");
                fillFondeoForm(item);
            } else {
                document.getElementById("sessionPairContainer").classList.add("hidden");
                document.getElementById("inputSessionPair").required = false;
                document.getElementById("sessionStartDateContainer").classList.add("hidden");
                document.getElementById("inputSessionStartDate").required = false;
                document.getElementById("sessionModeContainer").classList.add("hidden");
                document.getElementById("accountStageContainer").classList.remove("hidden");
                fillAccountStageForm(item);
            }

            const btn = document.getElementById("btn-submit-session");
            btn.textContent = "Guardar Cambios";
            btn.className = isBT ? "bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg" : "bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg";
            
            document.getElementById("sessionModal").classList.remove("hidden");
        }

        function closeSessionModal() { document.getElementById("sessionModal").classList.add("hidden"); }
        
        async function saveSession(e) {
            e.preventDefault();
            const idVal = document.getElementById("inputIdSession").value;
            const isEdit = idVal !== "";
            const id = isEdit ? parseInt(idVal) : Date.now();
            
            const balAct = currentMode === 'real' ? parseOptionalBalance(document.getElementById("inputSessionBalanceActual").value) : null;
            const balInitRaw = parseFloat(document.getElementById("inputSessionBalance").value);
            if (currentMode === 'real' && !(balInitRaw > 0)) {
                showToast("El Balance Inicial debe ser mayor a 0");
                return;
            }

            const newItem = {
                id: id,
                name: document.getElementById("inputSessionName").value,
                pair: currentMode === 'backtesting' ? document.getElementById("inputSessionPair").value.toUpperCase() : '',
                startDate: currentMode === 'backtesting' ? document.getElementById("inputSessionStartDate").value : null,
                balance: currentMode === 'real' ? balInitRaw : (balInitRaw || 10000),
                balanceActual: balAct,
                date: isEdit ? (currentMode === 'real' ? realAccounts.find(x=>x.id==id).date : backtestSessions.find(x=>x.id==id).date) : new Date().toLocaleString('es-ES')
            };
            let mt5MappingChanged = false;
            if (currentMode === 'backtesting') applyFondeoFormToSession(newItem, isEdit ? backtestSessions.find(x => x.id === id) : null);

            if (currentMode === 'real') {
                const existingAccount = isEdit ? realAccounts.find(x => x.id === id) : null;
                const previousActual = existingAccount ? parseOptionalBalance(existingAccount.balanceActual) : null;
                const actualChanged = balAct !== previousActual;
                const now = new Date();
                const previousBaseAt = existingAccount && parseBalanceTimestamp(existingAccount.balanceActualAt) !== null
                    ? existingAccount.balanceActualAt
                    : null;
                newItem.balanceActualAt = balAct === null
                    ? null
                    : ((!actualChanged && previousBaseAt) ? previousBaseAt : now.toISOString());
                const stageForm = readAccountStageForm(existingAccount);
                newItem.stage = stageForm.stage;
                newItem.goal = stageForm.goal;
                newItem.mt5Login = stageForm.mt5Login;
                mt5MappingChanged = existingAccount ? String(existingAccount.mt5Login || "") !== String(stageForm.mt5Login || "") : true;
                newItem.withdrawals = getAccountWithdrawals(existingAccount);
                if(isEdit) {
                    const idx = realAccounts.findIndex(x => x.id === id);
                    if(idx !== -1) realAccounts[idx] = newItem;
                } else {
                    realAccounts.push(newItem);
                }
                // Captura automática: al crear la cuenta (con o sin Balance Actual) y al cambiarlo en la edición.
                if (!isEdit || (actualChanged && balAct !== null)) {
                    const snapshotBalance = balAct !== null ? balAct : getRealInitialBalance(newItem);
                    try {
                        const snapshot = await appendBalanceSnapshot(newItem.id, snapshotBalance, now);
                        if (snapshot && balAct !== null) {
                            const idx = realAccounts.findIndex(x => x.id === id);
                            if (idx !== -1) realAccounts[idx] = { ...realAccounts[idx], balanceActualAt: snapshot.recordedAt };
                        }
                    } catch (error) {
                        console.error("No se pudo registrar la captura automática de la cuenta", error);
                    }
                }
            } else {
                if(isEdit) {
                    const idx = backtestSessions.findIndex(x => x.id === id);
                    if(idx !== -1) backtestSessions[idx] = newItem;
                } else {
                    backtestSessions.push(newItem);
                }
                monthlyCalendarSessionContextId = null;
            }
            
            await saveToStorage();
            renderGroups();
            closeSessionModal(); 
            showToast(currentMode === 'real' ? (isEdit ? "Cuenta actualizada" : "Cuenta creada") : (isEdit ? "Sesión actualizada" : "Sesión creada"));
            if (mt5MappingChanged) await mt5ProcessInboxPersisted();
        }
        
        async function deleteGroup(id) {
            if(confirm(`¿Seguro de eliminar esta ${currentMode==='real'?'cuenta':'sesión'} y todas sus operaciones?`)) {
                if(currentMode === 'real') {
                    realAccounts = realAccounts.filter(s => s.id !== id);
                    trades = trades.filter(t => t.accountId !== id);
                    accountGroups = accountGroups.map(group => ({
                        ...group,
                        accountIds: (Array.isArray(group.accountIds) ? group.accountIds : []).filter(accountId => String(accountId) !== String(id))
                    }));
                    if (typeof deleteFromCloud === "function") deleteFromCloud("account", id);
                } else {
                    backtestSessions = backtestSessions.filter(s => s.id !== id);
                    trades = trades.filter(t => t.sessionId !== id);
                    if (typeof deleteFromCloud === "function") deleteFromCloud("session", id);
                }
                await saveToStorage();
                renderGroups();
            }
        }
        
        function enterGroup(id) {
            setGlobalMetricsView(false);
            if (currentMode === 'real') activeRealAccountId = id;
            else activeSessionId = id;
            if (currentMode === 'backtesting') monthlyCalendarSessionContextId = null;
            populatePairDropdowns();

            document.getElementById('tab-btn-dashboard').classList.remove('hidden');
            document.getElementById('tab-btn-journal').classList.remove('hidden');
            document.getElementById('tab-btn-gallery').classList.remove('hidden');
            document.getElementById('tab-btn-monthly').classList.remove('hidden');
            document.getElementById('btn-new-trade').style.display = 'flex';
            
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            const item = list.find(x => x.id === id);
            
            if (item) {
                if(item.pair && currentMode !== 'real') document.getElementById('inputPar').value = item.pair;
                document.getElementById('dashboardBalance').value = currentMode === 'real' ? getRealInitialBalance(item) : (item.balance || 10000);
                const enterActualBal = currentMode === 'real' ? parseOptionalBalance(item.balanceActual) : null;
                document.getElementById('dashboardBalanceActual').value = enterActualBal !== null ? enterActualBal : '';
                
                const badge = document.getElementById('active-account-badge');
                badge.classList.remove('hidden');
                document.getElementById('active-account-name').textContent = item.name;
            }

            onDashboardPeriodTypeChange();
            onJournalPeriodTypeChange();
            renderAll(); 
            switchTab('dashboard');
        }

        function clearEditReplicatedContext() {
            editReplicatedSourceId = null;
            editReplicatedMembers = [];
            editReplicatedSelectedIds = [];
            editReplicatedSelectionConfirmed = true;
            document.getElementById("editReplicatedAlert").classList.add("hidden");
            document.getElementById("editReplicatedPanel").classList.add("hidden");
            document.getElementById("editReplicatedList").innerHTML = "";
        }

        function getLatestMultiEntryGroup() {
            const trackedTrades = trades.filter(trade => trade.multiEntryId && trade.multiEntryCreatedAt !== undefined && trade.multiEntryCreatedAt !== null && Number.isFinite(Number(trade.multiEntryCreatedAt)));
            if (!trackedTrades.length) return null;

            const latestTrade = trackedTrades.reduce((latest, trade) => Number(trade.multiEntryCreatedAt) > Number(latest.multiEntryCreatedAt) ? trade : latest, trackedTrades[0]);
            const members = trades.filter(trade => trade.multiEntryId === latestTrade.multiEntryId);
            return {
                id: latestTrade.multiEntryId,
                members,
                completed: members.length > 0 && members.every(trade => trade.multiEntryEditCompleted === true)
            };
        }

        function updateLatestMultiEntryButton() {
            const button = document.getElementById("btn-edit-latest-multi");
            if (!button) return;
            const latestGroup = getLatestMultiEntryGroup();
            const shouldShow = currentMode === "real" && activeAccountGroupId === null && latestGroup && latestGroup.members.length > 0 && !latestGroup.completed;
            button.classList.toggle("hidden", !shouldShow);
        }

        function editLatestMultiEntry() {
            const latestGroup = getLatestMultiEntryGroup();
            if (currentMode !== "real" || !latestGroup || latestGroup.completed || latestGroup.members.length === 0) {
                updateLatestMultiEntryButton();
                return;
            }

            const sourceTrade = latestGroup.members.find(trade => String(trade.accountId) === String(activeRealAccountId)) || latestGroup.members[0];
            openTradeModal(sourceTrade.id, latestGroup.id);
        }

        function getEditMatchSignature(trade) {
            const numericValue = value => {
                if (value === undefined || value === null || value === "") return "";
                const parsed = Number(value);
                return Number.isFinite(parsed) ? parsed : String(value);
            };
            const beforeImages = (Array.isArray(trade.imagenesAntes) ? trade.imagenesAntes : []).map(source => {
                const image = String(source || "");
                return `${image.length}:${image.slice(0, 48)}:${image.slice(-48)}`;
            });
            return JSON.stringify([
                trade.fecha || "", trade.hora || "", (trade.par || "").toUpperCase(),
                trade.sesion || "", trade.tendencia || "", numericValue(trade.pipsSL),
                numericValue(trade.pipsTP), numericValue(trade.rr), trade.orden || "",
                numericValue(trade.riesgo), trade.notaAntes || "", trade.linkAntes || "", beforeImages
            ]);
        }

        function getEditReplicatedMembers(sourceTrade) {
            const sourceGroupId = currentMode === "real" ? sourceTrade.accountId : sourceTrade.sessionId;
            if (sourceGroupId === undefined || sourceGroupId === null) return [sourceTrade];

            const signature = getEditMatchSignature(sourceTrade);
            const candidates = trades.filter(candidate => {
                const candidateGroupId = currentMode === "real" ? candidate.accountId : candidate.sessionId;
                if (candidateGroupId === undefined || candidateGroupId === null) return false;
                const belongsToMode = currentMode === "real" ? candidate.accountId != null : candidate.sessionId != null;
                if (!belongsToMode) return false;

                const isSource = String(candidate.id) === String(sourceTrade.id);
                if (isSource) return true;
                if (String(candidateGroupId) === String(sourceGroupId)) return false;

                if (sourceTrade.multiEntryId !== undefined && sourceTrade.multiEntryId !== null) {
                    return candidate.multiEntryId === sourceTrade.multiEntryId;
                }
                return getEditMatchSignature(candidate) === signature;
            });

            const groups = currentMode === "real" ? realAccounts : backtestSessions;
            candidates.sort((a, b) => {
                const aId = currentMode === "real" ? a.accountId : a.sessionId;
                const bId = currentMode === "real" ? b.accountId : b.sessionId;
                return groups.findIndex(group => String(group.id) === String(aId)) - groups.findIndex(group => String(group.id) === String(bId));
            });
            return candidates;
        }

        function renderEditReplicatedSelector() {
            const container = document.getElementById("editReplicatedList");
            container.innerHTML = "";
            const groups = currentMode === "real" ? realAccounts : backtestSessions;

            editReplicatedMembers.forEach(trade => {
                const tradeId = String(trade.id);
                const isSource = tradeId === editReplicatedSourceId;
                const groupId = currentMode === "real" ? trade.accountId : trade.sessionId;
                const group = groups.find(item => String(item.id) === String(groupId));
                const label = document.createElement("label");
                label.className = "flex items-center gap-2 rounded px-2 py-1.5 text-gray-200" + (isSource ? " opacity-70" : " cursor-pointer hover:bg-gray-800");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = editReplicatedSelectedIds.includes(tradeId);
                checkbox.disabled = isSource;
                checkbox.className = "h-4 w-4 accent-indigo-500";
                checkbox.addEventListener("change", () => {
                    if (checkbox.checked) {
                        if (!editReplicatedSelectedIds.includes(tradeId)) editReplicatedSelectedIds.push(tradeId);
                    } else {
                        editReplicatedSelectedIds = editReplicatedSelectedIds.filter(id => id !== tradeId);
                    }
                    editReplicatedSelectionConfirmed = false;
                    updateEditReplicatedSummary();
                });

                const description = document.createElement("span");
                description.className = "min-w-0 flex-1 truncate";
                const groupLabel = currentMode === "real" ? "Cuenta" : "Sesión";
                description.textContent = isSource
                    ? `Esta entrada · ${groupLabel}: ${group?.name || "sin nombre"}`
                    : `${groupLabel}: ${group?.name || "sin nombre"} · ${trade.fecha || ""} ${trade.hora || ""}`;
                label.append(checkbox, description);
                container.appendChild(label);
            });
        }

        function updateEditReplicatedSummary() {
            const extraTotal = Math.max(0, editReplicatedMembers.length - 1);
            const selectedExtra = editReplicatedSelectedIds.filter(id => id !== editReplicatedSourceId).length;
            let message = `Hay ${extraTotal} ${extraTotal === 1 ? "copia vinculada" : "copias vinculadas"}. Puedes aplicar también el resultado y el análisis posterior.`;
            if (!editReplicatedSelectionConfirmed) message += " Confirma la selección antes de guardar.";
            document.getElementById("editReplicatedAlertText").textContent = message;
            const selectorOpen = !document.getElementById("editReplicatedPanel").classList.contains("hidden");
            document.getElementById("editReplicatedToggleButton").textContent = `${selectorOpen ? "Cerrar lista" : "Elegir copias"} (${selectedExtra}/${extraTotal})`;
            const selectedCount = editReplicatedSelectedIds.length;
            document.getElementById("editReplicatedSelectionCount").textContent = `${selectedCount} ${selectedCount === 1 ? "operación seleccionada" : "operaciones seleccionadas"}`;
        }

        function toggleEditReplicatedSelector() {
            const panel = document.getElementById("editReplicatedPanel");
            const opening = panel.classList.contains("hidden");
            if (opening) renderEditReplicatedSelector();
            panel.classList.toggle("hidden", !opening);
            updateEditReplicatedSummary();
        }

        function selectEditReplicatedCopies(shouldSelect) {
            editReplicatedSelectedIds = shouldSelect
                ? editReplicatedMembers.map(trade => String(trade.id))
                : [editReplicatedSourceId];
            editReplicatedSelectionConfirmed = false;
            renderEditReplicatedSelector();
            updateEditReplicatedSummary();
        }

        function acceptEditReplicatedSelection() {
            editReplicatedSelectionConfirmed = true;
            document.getElementById("editReplicatedPanel").classList.add("hidden");
            updateEditReplicatedSummary();
        }

        function getMarketMinutes(timeZone, date = new Date()) {
            const parts = new Intl.DateTimeFormat("en-GB", {
                timeZone,
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23"
            }).formatToParts(date);
            const hour = Number(parts.find(part => part.type === "hour")?.value);
            const minute = Number(parts.find(part => part.type === "minute")?.value);
            return hour * 60 + minute;
        }

        function getSuggestedRealSession(date = new Date()) {
            try {
                const newYork = getMarketMinutes("America/New_York", date);
                const london = getMarketMinutes("Europe/London", date);

                if (newYork >= 8 * 60 && newYork < 17 * 60) return "New York";
                if (newYork >= 7 * 60 && newYork < 8 * 60) return "Pre New York";
                if (london >= 8 * 60 && london < 16 * 60) return "Londres";
                if (london >= 7 * 60 && london < 8 * 60) return "Pre Londres";
                return "Asia";
            } catch (error) {
                // Respaldo sin Intl: usamos UTC con desplazamientos fijos para que el resultado
                // no dependa de la zona horaria del equipo (NY ≈ UTC-4, Londres ≈ UTC-1).
                const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
                const newYork = (utcMinutes - 4 * 60 + 1440) % 1440;
                const london = (utcMinutes - 1 * 60 + 1440) % 1440;
                if (newYork >= 8 * 60 && newYork < 17 * 60) return "New York";
                if (newYork >= 7 * 60 && newYork < 8 * 60) return "Pre New York";
                if (london >= 8 * 60 && london < 16 * 60) return "Londres";
                if (london >= 7 * 60 && london < 8 * 60) return "Pre Londres";
                return "Asia";
            }
        }

        function setRealTradeTimeDefaults() {
            if (currentMode !== "real") return;
            const now = new Date();
            const pad = value => String(value).padStart(2, "0");
            document.getElementById("inputFecha").value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
            document.getElementById("inputHora").value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
            document.getElementById("inputSesion").value = getSuggestedRealSession(now);
        }

        // En cuentas reales la sesión se sugiere al abrir el modal y no se recalcula.
        // En backtesting se sugiere a partir de la fecha y hora cargadas por el usuario.
        let sessionFieldManuallyEdited = false;

        function getSuggestedSessionForDateTime(fechaISO, horaHHMM) {
            if (!fechaISO || !horaHHMM) return null;
            const normalizedTime = horaHHMM.length === 5 ? `${horaHHMM}:00` : horaHHMM;
            const date = new Date(`${fechaISO}T${normalizedTime}`);
            if (Number.isNaN(date.getTime())) return null;
            return getSuggestedRealSession(date);
        }

        function applyBacktestSessionSuggestion() {
            if (currentMode !== "backtesting") return;
            if (sessionFieldManuallyEdited) return;
            const suggestion = getSuggestedSessionForDateTime(
                document.getElementById("inputFecha").value,
                document.getElementById("inputHora").value
            );
            if (suggestion) document.getElementById("inputSesion").value = suggestion;
        }

        function setupTradeTimeSessionListeners() {
            const fechaInput = document.getElementById("inputFecha");
            const horaInput = document.getElementById("inputHora");
            const sesionInput = document.getElementById("inputSesion");
            if (!fechaInput || !horaInput || !sesionInput) return;
            ["input", "change"].forEach(eventName => {
                fechaInput.addEventListener(eventName, applyBacktestSessionSuggestion);
                horaInput.addEventListener(eventName, applyBacktestSessionSuggestion);
            });
            sesionInput.addEventListener("change", () => { sessionFieldManuallyEdited = true; });
        }

        function openGlobalTradeModal(groupId = null) {
            clearEditReplicatedContext();
            editingLatestMultiEntryId = null;
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            if (list.length === 0) {
                showToast("Debes crear al menos una cuenta primero", true);
                return;
            }

            let initialSelection = list.map(account => account.id);
            if (groupId !== null && currentMode === 'real') {
                const selectedGroup = accountGroups.find(group => String(group.id) === String(groupId));
                if (!selectedGroup) return;
                initialSelection = getAccountGroupAccounts(selectedGroup).map(account => account.id);
                if (!initialSelection.length) {
                    showToast("Este grupo no tiene cuentas asignadas", true);
                    return;
                }
            }

            isGlobalTradeContext = true;
            globalTradeAccountIds = initialSelection;
            globalTradeSelectionConfirmed = true;
            quickTradeContextId = null; 
            sessionFieldManuallyEdited = false;
            
            document.getElementById("tradeForm").reset();
            document.getElementById("tradeId").value = "";
            configureRiskInputForMode();
            document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-layer-group text-purple-500"></i> Nueva entrada múltiple`;
            
            const alertBox = document.getElementById("quickTradeAlert");
            alertBox.classList.remove('hidden');
            alertBox.className = "shrink-0 mx-4 sm:mx-6 mb-3 bg-purple-900/40 border border-purple-500/50 text-purple-300 px-3 py-2 rounded text-xs font-bold flex items-center justify-between gap-3";
            document.getElementById("quickTradeAlertIcon").className = "fa-solid fa-layer-group text-purple-300";
            document.getElementById("globalTradeSelectButton").classList.remove("hidden");
            document.getElementById("globalTradeAccountPanel").classList.add("hidden");
            renderGlobalTradeAccountSelector();
            updateGlobalTradeAccountSummary();
            
            currentUploadedImagesAntes = []; currentUploadedImagesDespues = [];
            document.getElementById("imagesPreviewAntes").innerHTML = ""; document.getElementById("imagesPreviewDespues").innerHTML = "";
            document.getElementById("parcialCustomContainer").classList.add("hidden");
            
            document.getElementById("inputFecha").value = currentMode === "backtesting"
                ? (getBacktestEntryReferenceDate(activeSessionId) || new Date().toISOString().split('T')[0])
                : new Date().toISOString().split('T')[0];
            document.getElementById("inputHora").value = "09:00";
            if (currentMode === "real") setRealTradeTimeDefaults();
            else applyBacktestSessionSuggestion();
            populatePairDropdowns();
            calculateRR();
            
            document.getElementById("tradeModal").classList.remove("hidden");
        }

        function renderGlobalTradeAccountSelector() {
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            const container = document.getElementById("globalTradeAccountList");
            container.innerHTML = "";

            const appendCheckboxRow = (title, subtitle, checked, disabled, onChange, indeterminate = false, iconClass = null) => {
                const label = document.createElement("label");
                label.className = `flex items-center gap-2 rounded px-2 py-1.5 ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer text-gray-200 hover:bg-gray-800"}`;
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = checked;
                checkbox.indeterminate = indeterminate;
                checkbox.disabled = disabled;
                checkbox.className = "h-4 w-4 shrink-0 accent-purple-500";
                checkbox.addEventListener("change", onChange);
                const text = document.createElement("span");
                text.className = "min-w-0 flex-1 truncate";
                text.textContent = title;
                label.appendChild(checkbox);
                if (iconClass) {
                    const icon = document.createElement("i");
                    icon.className = `${getAccountGroupIconClass(iconClass)} shrink-0 text-indigo-300`;
                    label.appendChild(icon);
                }
                label.appendChild(text);
                if (subtitle) {
                    const detail = document.createElement("span");
                    detail.className = "shrink-0 text-[10px] text-gray-500";
                    detail.textContent = subtitle;
                    label.appendChild(detail);
                }
                container.appendChild(label);
            };

            if (currentMode === 'real' && accountGroups.length) {
                const groupsHeading = document.createElement("p");
                groupsHeading.className = "px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300";
                groupsHeading.textContent = "Grupos";
                container.appendChild(groupsHeading);

                [...accountGroups].sort((a, b) => String(a.name).localeCompare(String(b.name), "es")).forEach(group => {
                    const members = getAccountGroupAccounts(group);
                    const selectedCount = members.filter(account => globalTradeAccountIds.some(id => String(id) === String(account.id))).length;
                    appendCheckboxRow(
                        group.name || "Grupo sin nombre",
                        `${members.length} ${members.length === 1 ? "cuenta" : "cuentas"}`,
                        members.length > 0 && selectedCount === members.length,
                        members.length === 0,
                        event => {
                            const nextSelected = new Set(globalTradeAccountIds.map(String));
                            members.forEach(account => {
                                if (event.target.checked) nextSelected.add(String(account.id));
                                else nextSelected.delete(String(account.id));
                            });
                            globalTradeAccountIds = realAccounts.filter(account => nextSelected.has(String(account.id))).map(account => account.id);
                            globalTradeSelectionConfirmed = false;
                            renderGlobalTradeAccountSelector();
                            updateGlobalTradeAccountSummary();
                        },
                        selectedCount > 0 && selectedCount < members.length,
                        group.icon
                    );
                });

                const accountsHeading = document.createElement("p");
                accountsHeading.className = "mt-1 border-t border-gray-700 px-2 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400";
                accountsHeading.textContent = "Cuentas individuales";
                container.appendChild(accountsHeading);
            }

            list.forEach(account => {
                appendCheckboxRow(
                    account.name || "Cuenta sin nombre",
                    "",
                    globalTradeAccountIds.some(id => String(id) === String(account.id)),
                    false,
                    event => {
                        if (event.target.checked) {
                            if (!globalTradeAccountIds.some(id => String(id) === String(account.id))) globalTradeAccountIds.push(account.id);
                        } else {
                            globalTradeAccountIds = globalTradeAccountIds.filter(id => String(id) !== String(account.id));
                        }
                        globalTradeSelectionConfirmed = false;
                        renderGlobalTradeAccountSelector();
                        updateGlobalTradeAccountSummary();
                    }
                );
            });
        }

        function updateGlobalTradeAccountSummary() {
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            const count = globalTradeAccountIds.filter(id => list.some(account => String(account.id) === String(id))).length;
            const total = list.length;
            const allSelected = total > 0 && count === total;
            let message = count === 0
                ? "Selecciona al menos una cuenta para replicar la entrada."
                : allSelected
                    ? `La entrada se replicará en todas las cuentas (${total}).`
                    : `La entrada se replicará en ${count} de ${total} cuentas.`;
            if (!globalTradeSelectionConfirmed) message += " Confirma la selección antes de guardar.";

            document.getElementById("quickTradeAlertText").textContent = message;
            const selectorOpen = !document.getElementById("globalTradeAccountPanel").classList.contains("hidden");
            document.getElementById("globalTradeSelectButton").textContent = `${selectorOpen ? "Cerrar lista" : "Elegir cuentas"} (${count}/${total})`;
            document.getElementById("globalTradeSelectionCount").textContent = `${count} ${count === 1 ? "cuenta seleccionada" : "cuentas seleccionadas"}`;
            document.getElementById("globalTradeAcceptButton").disabled = count === 0;
        }

        function toggleGlobalTradeAccountSelector() {
            const panel = document.getElementById("globalTradeAccountPanel");
            const opening = panel.classList.contains("hidden");
            if (opening) renderGlobalTradeAccountSelector();
            panel.classList.toggle("hidden", !opening);
            updateGlobalTradeAccountSummary();
        }

        function selectAllGlobalTradeAccounts(shouldSelect) {
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            globalTradeAccountIds = shouldSelect ? list.map(account => account.id) : [];
            globalTradeSelectionConfirmed = false;
            renderGlobalTradeAccountSelector();
            updateGlobalTradeAccountSummary();
        }

        function acceptGlobalTradeAccountSelection() {
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            const count = globalTradeAccountIds.filter(id => list.some(account => String(account.id) === String(id))).length;
            if (count === 0) {
                showToast("Selecciona al menos una cuenta", true);
                return;
            }
            globalTradeSelectionConfirmed = true;
            document.getElementById("globalTradeAccountPanel").classList.add("hidden");
            updateGlobalTradeAccountSummary();
        }

        function quickAddTrade(groupId, groupName) {
            clearEditReplicatedContext();
            isGlobalTradeContext = false;
            globalTradeAccountIds = [];
            globalTradeSelectionConfirmed = true;
            quickTradeContextId = groupId; 
            
            document.getElementById("tradeForm").reset();
            document.getElementById("tradeId").value = "";
            configureRiskInputForMode();
            configureTradePairField();
            
            document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-plus text-yellow-400"></i> Operación Rápida`;
            
            const alertBox = document.getElementById("quickTradeAlert");
            alertBox.classList.remove('hidden');
            alertBox.className = "shrink-0 mx-4 sm:mx-6 mb-3 bg-blue-900/40 border border-blue-500/50 text-blue-300 px-3 py-2 rounded text-xs font-bold flex items-center justify-between gap-3";
            document.getElementById("quickTradeAlertIcon").className = "fa-solid fa-plus text-yellow-400";
            document.getElementById("quickTradeAlertText").textContent = `Añadiendo operación rápida a: ${groupName}`;
            document.getElementById("globalTradeSelectButton").classList.add("hidden");
            document.getElementById("globalTradeAccountPanel").classList.add("hidden");

            currentUploadedImagesAntes = []; currentUploadedImagesDespues = [];
            document.getElementById("imagesPreviewAntes").innerHTML = ""; document.getElementById("imagesPreviewDespues").innerHTML = "";
            document.getElementById("parcialCustomContainer").classList.add("hidden");
            
            document.getElementById("inputFecha").value = currentMode === "backtesting"
                ? (getBacktestEntryReferenceDate(groupId) || new Date().toISOString().split('T')[0])
                : new Date().toISOString().split('T')[0];
            document.getElementById("inputHora").value = "09:00";
            if (currentMode === "real") setRealTradeTimeDefaults();
            
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            const item = list.find(x => x.id === groupId);
            if (item && item.pair) {
                const parEl = document.getElementById("inputPar");
                if(!Array.from(parEl.options).some(o => o.value === item.pair)) {
                    parEl.innerHTML += `<option value="${item.pair}">${item.pair}</option>`;
                }
                parEl.value = item.pair;
            }
            
            calculateRR();
            document.getElementById("tradeModal").classList.remove("hidden");
        }

        function toggleExportMenu() { document.getElementById("exportMenu").classList.toggle("hidden"); }
        document.addEventListener('click', (e) => { if (!e.target.closest('.relative.inline-block')) document.getElementById("exportMenu").classList.add("hidden"); });

        function exportData(format) {
            const dataToExport = {
                accounts: realAccounts,
                accountGroups,
                balanceHistory: realBalanceHistory,
                sessions: backtestSessions,
                realPairs: customPairsList,
                backtestPairs: backtestPairsList,
                trades: trades
            };
            
            if (format === 'json') {
                const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `bitacora_completa_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            } else if (format === 'csv') {
                let csvContent = "data:text/csv;charset=utf-8,ID,Modo,GrupoID,Fecha,Hora,Activo,Sesion,Tendencia,Orden,Estado,Riesgo(%),Lotaje_auto,Pips SL,Pips TP,RR,Nota Antes,Nota Despues,Link Antes,Link Despues\n";
                trades.forEach(t => {
                    const row = [t.id, t.accountId ? 'Real' : 'Backtest', t.accountId || t.sessionId, t.fecha, t.hora, t.par, t.sesion, t.tendencia, t.orden, t.estado, t.riesgo, t.lotaje, t.pipsSL, t.pipsTP, t.rr, `"${(t.notaAntes || '').replace(/"/g, '""')}"`, `"${(t.notaDespues || '').replace(/"/g, '""')}"`, `"${(t.linkAntes || '').replace(/"/g, '""')}"`, `"${(t.linkDespues || '').replace(/"/g, '""')}"`];
                    csvContent += row.join(",") + "\n";
                });
                const a = document.createElement("a"); a.href = encodeURI(csvContent); a.download = `trades_data_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
            }
        }

        function importDataTrigger() { document.getElementById("importInput").click(); }
        
        function importData(e) {
            const file = e.target.files[0];
            if (!file) return;
            const r = new FileReader();
            r.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    
                    if (Array.isArray(data)) {
                        const defaultId = Date.now();
                        realAccounts.push({ id: defaultId, name: "Cuenta Migrada (Antigua)", balance: 100000, date: new Date().toLocaleString() });
                        const mappedTrades = data.map(t => ({ ...t, accountId: defaultId, sessionId: null }));
                        trades = trades.concat(mappedTrades);
                    } else {
                        if (Array.isArray(data.accounts)) {
                            realAccounts = data.accounts;
                            accountGroups = Array.isArray(data.accountGroups) ? data.accountGroups : [];
                        } else if (Array.isArray(data.accountGroups)) {
                            accountGroups = data.accountGroups;
                        }
                        if (data.sessions) backtestSessions = data.sessions;
                        if (Array.isArray(data.realPairs)) customPairsList = data.realPairs;
                        if (Array.isArray(data.backtestPairs)) backtestPairsList = data.backtestPairs;
                        if (Array.isArray(data.balanceHistory)) {
                            const historyById = new Map(realBalanceHistory.map(snapshot => [String(snapshot.id), snapshot]));
                            let historyChanged = false;
                            data.balanceHistory.forEach(snapshot => {
                                const key = String(snapshot.id);
                                const existing = historyById.get(key);
                                if (!existing) {
                                    historyById.set(key, snapshot);
                                    historyChanged = true;
                                    return;
                                }
                                const existingAccounts = Array.isArray(existing.accounts) ? existing.accounts : [];
                                const knownAccountIds = new Set(existingAccounts.map(account => String(account.accountId)));
                                const addedAccounts = (Array.isArray(snapshot.accounts) ? snapshot.accounts : [])
                                    .filter(account => !knownAccountIds.has(String(account.accountId)));
                                if (addedAccounts.length) {
                                    historyById.set(key, { ...existing, accounts: existingAccounts.concat(addedAccounts) });
                                    historyChanged = true;
                                }
                            });
                            if (historyChanged) {
                                realBalanceHistory = Array.from(historyById.values());
                                await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, realBalanceHistory);
                            }
                        }
                        
                        let importedTrades = data.trades || [];
                        
                        if (importedTrades.length > 0 && !importedTrades[0].accountId && !importedTrades[0].sessionId) {
                            const defaultId = Date.now();
                            realAccounts.push({ id: defaultId, name: "Cuenta Migrada (V2)", balance: 100000, date: new Date().toLocaleString() });
                            importedTrades = importedTrades.map(t => ({ ...t, accountId: defaultId }));
                        }
                        
                        importedTrades.forEach(newTrade => {
                            if(!trades.some(t => t.id === newTrade.id)) {
                                trades.push(newTrade);
                            }
                        });

                        if (Array.isArray(data.accounts)) await dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts);
                        if (Array.isArray(data.accounts) || Array.isArray(data.accountGroups)) await dbSet(STORAGE_KEY_ACCOUNT_GROUPS, accountGroups);
                        if (Array.isArray(data.sessions)) await dbSet(STORAGE_KEY_SESSIONS, backtestSessions);
                        if (Array.isArray(data.realPairs)) await dbSet("trading_journal_custom_pairs", customPairsList);
                        if (Array.isArray(data.backtestPairs)) await dbSet(STORAGE_KEY_BACKTEST_PAIRS, backtestPairsList);
                    }
                    
                    await saveToStorage();
                    if (typeof triggerCloudSave === "function") await triggerCloudSave(true);
                    showToast("Datos Importados y Migrados Correctamente");
                    await setMode(currentMode);
                } catch (err) { 
                    console.error(err);
                    showToast("Error al importar el archivo JSON", true); 
                }
            };
            r.readAsText(file); 
            e.target.value = ''; 
        }

        function getAvailableYears() {
            const years = new Set([new Date().getFullYear()]);
            const backtestStartYear = getBacktestStartYear();
            if (backtestStartYear) years.add(backtestStartYear);
            getBaseTrades().forEach(t => {
                if (!t.fecha) return;
                const date = new Date(t.fecha + "T00:00:00");
                if (!Number.isNaN(date.getTime())) years.add(date.getFullYear());
            });
            return Array.from(years).sort((a, b) => b - a);
        }

        function getBacktestStartDate() {
            if (currentMode !== "backtesting" || !activeSessionId) return null;
            const startDate = backtestSessions.find(session => String(session.id) === String(activeSessionId))?.startDate;
            if (!startDate) return null;
            const date = new Date(`${startDate}T00:00:00`);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        function getBacktestEntryReferenceDate(sessionId = activeSessionId) {
            const session = backtestSessions.find(item => String(item.id) === String(sessionId));
            const isValidDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
            if (!session) return null;
            const sessionTrades = trades
                .map((trade, index) => ({ trade, index }))
                .filter(({ trade }) => String(trade.sessionId) === String(sessionId) && isValidDate(trade.fecha));

            if (sessionTrades.length) {
                const getEntryOrder = item => {
                    const storedOrder = Number(item.trade.entryCreatedAt ?? item.trade.createdAt ?? item.trade.id);
                    return Number.isFinite(storedOrder) ? storedOrder : item.index;
                };
                const lastEnteredTrade = sessionTrades.reduce((latest, candidate) =>
                    getEntryOrder(candidate) >= getEntryOrder(latest) ? candidate : latest
                );
                return lastEnteredTrade.trade.fecha;
            }

            return isValidDate(session.startDate) ? session.startDate : null;
        }

        function getBacktestStartYear() {
            return getBacktestStartDate()?.getFullYear() || null;
        }

        function getReferencePeriodYear() {
            return getBacktestStartYear() || new Date().getFullYear();
        }

        function getReferencePeriodMonth() {
            return getBacktestStartDate()?.getMonth() ?? new Date().getMonth();
        }

                function getWeeksForMonth(year, month) {
            const totalDays = new Date(year, month + 1, 0).getDate();
            let weeks = [], startDay = 1, weekNum = 1;
            while (startDay <= totalDays) {
                let endDay = Math.min(startDay + 6, totalDays);
                weeks.push({ weekNum, startDay, endDay, label: `Semana ${weekNum} (${startDay} - ${endDay})` });
                startDay = endDay + 1; weekNum++;
            }
            return weeks;
        }

        function onDashboardPeriodTypeChange() {
            const type = document.getElementById("dashboardPeriodType").value;
            const yearSel = document.getElementById("dashboardPeriodYear");
            const monthSel = document.getElementById("dashboardPeriodMonth");
            const subSel = document.getElementById("dashboardPeriodSub");
            
            yearSel.classList.add("hidden");
            monthSel.classList.add("hidden");
            subSel.classList.add("hidden");
            
            if (type === 'ALL') {
                updateMetricsAndCharts();
                return;
            }
            
            const years = getAvailableYears();
            const refYear = getReferencePeriodYear();
            const refMonth = getReferencePeriodMonth();
            
            yearSel.innerHTML = years.map(y => `<option value="${y}">Año ${y}</option>`).join("");
            yearSel.value = years.includes(refYear) ? refYear : (years[0] || new Date().getFullYear());
            yearSel.classList.remove("hidden");
            
            if (type === 'MONTH') {
                monthSel.innerHTML = monthNames.map((m, i) => `<option value="${i}">${m}</option>`).join("");
                monthSel.value = refMonth;
                monthSel.classList.remove("hidden");
            } else if (type === 'WEEK') {
                monthSel.innerHTML = monthNames.map((m, i) => `<option value="${i}">${m}</option>`).join("");
                monthSel.value = refMonth;
                monthSel.classList.remove("hidden");
                onDashboardYearOrMonthChange();
                subSel.classList.remove("hidden");
            }
            updateMetricsAndCharts();
        }

        function onDashboardYearOrMonthChange() {
            const type = document.getElementById("dashboardPeriodType").value;
            if (type === 'WEEK') {
                const year = parseInt(document.getElementById("dashboardPeriodYear").value);
                const month = parseInt(document.getElementById("dashboardPeriodMonth").value);
                const subSel = document.getElementById("dashboardPeriodSub");
                const weeks = getWeeksForMonth(year, month);
                subSel.innerHTML = weeks.map(w => `<option value="${w.weekNum}">${w.label}</option>`).join("");
            }
            updateMetricsAndCharts();
        }

        function onJournalPeriodTypeChange() {
            const type = document.getElementById("filterPeriodoType").value;
            const yearSel = document.getElementById("filterPeriodoYear");
            const monthSel = document.getElementById("filterPeriodoMonth");
            const subSel = document.getElementById("filterPeriodoSub");
            
            yearSel.classList.add("hidden");
            monthSel.classList.add("hidden");
            subSel.classList.add("hidden");
            
            if (type === 'ALL') {
                applyFilters();
                return;
            }
            
            const years = getAvailableYears();
            const refYear = getReferencePeriodYear();
            const refMonth = getReferencePeriodMonth();
            
            yearSel.innerHTML = years.map(y => `<option value="${y}">Año ${y}</option>`).join("");
            yearSel.value = years.includes(refYear) ? refYear : (years[0] || new Date().getFullYear());
            yearSel.classList.remove("hidden");
            
            if (type === 'MONTH') {
                monthSel.innerHTML = monthNames.map((m, i) => `<option value="${i}">${m}</option>`).join("");
                monthSel.value = refMonth;
                monthSel.classList.remove("hidden");
            } else if (type === 'WEEK') {
                monthSel.innerHTML = monthNames.map((m, i) => `<option value="${i}">${m}</option>`).join("");
                monthSel.value = refMonth;
                monthSel.classList.remove("hidden");
                onJournalYearOrMonthChange();
                subSel.classList.remove("hidden");
            }
            applyFilters();
        }

        function onJournalYearOrMonthChange() {
            const type = document.getElementById("filterPeriodoType").value;
            if (type === 'WEEK') {
                const year = parseInt(document.getElementById("filterPeriodoYear").value);
                const month = parseInt(document.getElementById("filterPeriodoMonth").value);
                const subSel = document.getElementById("filterPeriodoSub");
                const weeks = getWeeksForMonth(year, month);
                subSel.innerHTML = weeks.map(w => `<option value="${w.weekNum}">${w.label}</option>`).join("");
            }
            applyFilters();
        }

        function checkPeriodMatch(dateStr, type, yearVal, monthVal, subVal) {
            if (type === 'ALL' || !dateStr) return true;
            const d = new Date(dateStr + "T00:00:00");
            const y = d.getFullYear();
            const m = d.getMonth();
            const day = d.getDate();
            
            if (type === 'YEAR') return y === parseInt(yearVal);
            if (type === 'MONTH') return y === parseInt(yearVal) && m === parseInt(monthVal);
            if (type === 'WEEK') {
                if (y !== parseInt(yearVal) || m !== parseInt(monthVal)) return false;
                const weeks = getWeeksForMonth(parseInt(yearVal), parseInt(monthVal));
                const week = weeks.find(w => w.weekNum === parseInt(subVal));
                return week ? (day >= week.startDay && day <= week.endDay) : true;
            }
            return true;
        }

        function openResetModal() { document.getElementById("resetModal").classList.remove("hidden"); }
        function closeResetModal() { document.getElementById("resetModal").classList.add("hidden"); }

        async function exportAndReset() {
            exportData('json');
            if (currentMode === 'real') { trades = trades.filter(t=>!t.accountId); realAccounts = []; accountGroups = []; realBalanceHistory = []; await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, realBalanceHistory); activeRealAccountId = null; activeAccountGroupId = null; } 
            else { trades = trades.filter(t=>!t.sessionId); backtestSessions = []; activeSessionId = null; }
            await saveToStorage(); closeResetModal(); showToast(`Entorno reiniciado`);
        }

        async function confirmReset() {
            if (confirm(`¿Borrar TODO en modo ${currentMode.toUpperCase()}?`)) {
                if (currentMode === 'real') { trades = trades.filter(t=>!t.accountId); realAccounts = []; accountGroups = []; realBalanceHistory = []; await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, realBalanceHistory); activeRealAccountId = null; activeAccountGroupId = null; } 
                else { trades = trades.filter(t=>!t.sessionId); backtestSessions = []; activeSessionId = null; }
                await saveToStorage(); closeResetModal(); showToast("Reiniciado", true);
            }
        }

        function showToast(message, isError = false) {
            const toast = document.getElementById("toast"), toastMsg = document.getElementById("toastMsg"), toastIcon = document.getElementById("toastIcon");
            toastMsg.textContent = message;
            toast.className = `fixed bottom-5 right-5 bg-gray-800 text-white border ${isError ? 'border-red-500' : 'border-green-500'} px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 opacity-100 translate-y-0 transition-all`;
            toastIcon.className = `fa-solid ${isError ? 'fa-circle-exclamation text-red-400' : 'fa-circle-check text-green-400'} text-lg`;
            setTimeout(() => toast.classList.replace("opacity-100", "opacity-0"), 3000);
        }

        function formatBalanceHistoryMoney(value) {
            const amount = Number(value);
            if (!Number.isFinite(amount)) return "—";
            const sign = amount < 0 ? "-$" : "$";
            return `${sign}${Math.abs(amount).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        function getRealBalanceHistoryAccounts() {
            const accounts = new Map();
            realAccounts.forEach(account => accounts.set(String(account.id), { id: account.id, name: account.name }));
            realBalanceHistory.forEach(snapshot => {
                (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).forEach(account => {
                    const key = String(account.accountId);
                    if (!accounts.has(key)) accounts.set(key, { id: account.accountId, name: account.accountName });
                });
            });
            return Array.from(accounts.values());
        }

        // ===================== HISTORIAL DE BALANCES AGRUPADO =====================
        function compareBalanceSnapshots(a, b) {
            const dateCompare = String(a.date || a.recordedAt || "").localeCompare(String(b.date || b.recordedAt || ""));
            if (dateCompare !== 0) return dateCompare;
            return String(a.recordedAt || "").localeCompare(String(b.recordedAt || ""));
        }

        // Último balance registrado de una cuenta (para completar capturas automáticas).
        // informedOnly ignora los valores arrastrados de otras cuentas.
        function getLatestRecordedBalance(accountId, options = {}) {
            const informedOnly = options.informedOnly === true;
            const sorted = [...realBalanceHistory].sort(compareBalanceSnapshots);
            for (let index = sorted.length - 1; index >= 0; index -= 1) {
                const snapshot = sorted[index];
                const entry = (Array.isArray(snapshot.accounts) ? snapshot.accounts : [])
                    .find(item => String(item.accountId) === String(accountId));
                if (!entry) continue;
                if (informedOnly && entry.informed === false) continue;
                const balance = parseOptionalBalance(entry.balanceActual);
                if (balance !== null) return { balance, snapshot };
            }
            return null;
        }

        function getCarryForwardBalance(account) {
            const latest = getLatestRecordedBalance(account.id);
            if (latest) return latest.balance;
            const actual = parseOptionalBalance(account.balanceActual);
            return actual !== null ? actual : getRealInitialBalance(account);
        }

        // Captura completa: la cuenta indicada con su valor y las demás con su último registro.
        function buildBalanceSnapshot(accountId, balance, date = getLocalDateISO(), now = new Date()) {
            return {
                id: `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
                date,
                recordedAt: now.toISOString(),
                accounts: realAccounts.map(account => {
                    const isTarget = String(account.id) === String(accountId);
                    const value = isTarget ? balance : getCarryForwardBalance(account);
                    return {
                        accountId: account.id,
                        accountName: account.name,
                        initialBalance: getRealInitialBalance(account),
                        balanceActual: Math.round(Number(value) * 100) / 100,
                        informed: isTarget
                    };
                })
            };
        }

        async function appendBalanceSnapshot(accountId, balance, now = new Date()) {
            if (!realAccounts.length || !Number.isFinite(Number(balance))) return null;
            const snapshot = buildBalanceSnapshot(accountId, Number(balance), getLocalDateISO(now), now);
            realBalanceHistory = [...realBalanceHistory, snapshot];
            await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, realBalanceHistory);
            renderRealBalanceHistory();
            return snapshot;
        }

        // Migración: las cuentas viejas con Balance Actual no tienen fecha base. Si su último
        // snapshot coincide con el actual, usamos esa fecha; si no, sellamos ahora para no duplicar.
        async function migrateLegacyBalanceActualDates() {
            let changed = false;
            const nowIso = new Date().toISOString();
            realAccounts = realAccounts.map(account => {
                const actual = parseOptionalBalance(account && account.balanceActual);
                if (actual === null || parseBalanceTimestamp(account && account.balanceActualAt) !== null) return account;
                const latest = getLatestRecordedBalance(account.id, { informedOnly: true });
                const matchesLatest = latest && Math.abs(latest.balance - actual) < 0.01;
                const baseAt = matchesLatest
                    ? (latest.snapshot.recordedAt || `${latest.snapshot.date || ""}T23:59:59.999Z`)
                    : nowIso;
                changed = true;
                return { ...account, balanceActualAt: baseAt };
            });
            if (!changed) return;
            try {
                await dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts);
            } catch (error) {
                console.error("No se pudo migrar la fecha del Balance Actual", error);
            }
        }

        function getBalanceCollapsedGroups() {
            try {
                const raw = localStorage.getItem("journalBalanceCollapsedGroups");
                const parsed = raw ? JSON.parse(raw) : [];
                return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
            } catch (error) {
                return new Set();
            }
        }

        function saveBalanceCollapsedGroups(collapsed) {
            try {
                localStorage.setItem("journalBalanceCollapsedGroups", JSON.stringify(Array.from(collapsed)));
            } catch (error) {
                // Preferencia de UI: si no se puede guardar, seguimos con el estado por defecto.
            }
        }

        let balanceGroupHighlightTimer = null;

        // Resalta el grupo implicado con un barrido suave de izquierda a derecha (encabezado + columnas),
        // para que el ojo siga el cambio aunque la tabla se haya reordenado.
        function highlightBalanceGroup(groupKey) {
            const container = document.getElementById("balance-history-table-container");
            if (!container) return;
            const key = String(groupKey);
            container.querySelectorAll(".balance-group-glow").forEach(cell => {
                cell.classList.remove("balance-group-glow");
                cell.style.animationDelay = "";
            });
            const cells = Array.from(container.querySelectorAll("[data-balance-group-cell]"))
                .filter(cell => cell.dataset.balanceGroupCell === key);
            cells.forEach((cell, index) => {
                cell.style.animationDelay = `${Math.min(index * 25, 225)}ms`;
                cell.classList.add("balance-group-glow");
            });
            clearTimeout(balanceGroupHighlightTimer);
            balanceGroupHighlightTimer = setTimeout(() => {
                cells.forEach(cell => {
                    cell.classList.remove("balance-group-glow");
                    cell.style.animationDelay = "";
                });
            }, 1400);
        }

        function toggleBalanceGroupCollapse(groupKey) {
            const collapsed = getBalanceCollapsedGroups();
            const key = String(groupKey);
            if (collapsed.has(key)) collapsed.delete(key);
            else collapsed.add(key);
            saveBalanceCollapsedGroups(collapsed);
            if (typeof document.startViewTransition === "function") {
                const transition = document.startViewTransition(() => renderRealBalanceHistory());
                // El brillo entra al terminar el fundido, cuando la tabla ya es interactiva otra vez.
                transition.finished.then(() => highlightBalanceGroup(key)).catch(() => {});
                return;
            }
            renderRealBalanceHistory();
            highlightBalanceGroup(key);
        }

        // Reparte una lista de cuentas en cubos por grupo (primera coincidencia) más "Sin grupo".
        function groupAccountsForBalanceView(accounts) {
            const assigned = new Set();
            const buckets = [];
            [...accountGroups]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .forEach(group => {
                    const memberIds = new Set((Array.isArray(group.accountIds) ? group.accountIds : []).map(String));
                    const members = accounts.filter(account => memberIds.has(String(account.id)) && !assigned.has(String(account.id)));
                    members.forEach(account => assigned.add(String(account.id)));
                    if (members.length) buckets.push({ key: String(group.id), name: group.name || "Grupo", icon: getAccountGroupIconClass(group.icon), accounts: members });
                });
            const rest = accounts.filter(account => !assigned.has(String(account.id)));
            if (rest.length) buckets.push({ key: "ungrouped", name: "Sin grupo", icon: "fa-solid fa-layer-group", accounts: rest });
            return buckets;
        }

        function computeBalanceGroupTotals(snapshotAccounts, bucketAccounts) {
            let informed = 0;
            let initial = 0;
            let actual = 0;
            bucketAccounts.forEach(account => {
                const entry = snapshotAccounts.get(String(account.id));
                const balance = entry ? parseOptionalBalance(entry.balanceActual) : null;
                if (!entry || balance === null) return;
                informed += 1;
                actual += balance;
                const entryInitial = parseOptionalBalance(entry.initialBalance);
                if (Number.isFinite(entryInitial) && entryInitial > 0) initial += entryInitial;
            });
            const pnl = informed && initial > 0 ? actual - initial : null;
            const pct = pnl === null ? null : (pnl / initial) * 100;
            return { informed, total: bucketAccounts.length, initial, actual, pnl, pct };
        }

        function formatBalancePnlText(value) {
            if (value === null || !Number.isFinite(value)) return { text: "—", cls: "text-gray-500" };
            const cls = value > 0 ? "text-emerald-400" : (value < 0 ? "text-red-400" : "text-gray-300");
            return { text: `${value > 0 ? "+" : ""}${formatBalanceHistoryMoney(value)}`, cls };
        }

        function formatBalancePctText(value) {
            if (value === null || !Number.isFinite(value)) return { text: "—", cls: "text-gray-500" };
            const cls = value > 0 ? "text-emerald-400" : (value < 0 ? "text-red-400" : "text-gray-300");
            return { text: `${value > 0 ? "+" : ""}${value.toFixed(2)}%`, cls };
        }

        function renderRealBalanceHistory() {
            const container = document.getElementById("balance-history-table-container");
            if (!realBalanceHistory.length) {
                container.innerHTML = `<p class="p-6 text-sm text-gray-400">Todavía no hay registros. Usa “Cargar balances” para actualizar todas tus cuentas reales y guardar una captura histórica.</p>`;
                document.getElementById("btn-record-balance-snapshot").disabled = realAccounts.length === 0;
                return;
            }

            const buckets = groupAccountsForBalanceView(getRealBalanceHistoryAccounts());
            if (!buckets.length) {
                container.innerHTML = `<p class="p-6 text-sm text-gray-400">No hay cuentas asociadas a los registros históricos.</p>`;
                document.getElementById("btn-record-balance-snapshot").disabled = realAccounts.length === 0;
                return;
            }
            const previousScrollLeft = container.scrollLeft || 0;
            const collapsed = getBalanceCollapsedGroups();
            const accountCount = buckets.reduce((sum, bucket) => sum + bucket.accounts.length, 0);
            const groupHeaderSpan = bucket => Math.max(1, bucket.accounts.length);
            const tableColumns = Math.max(2, 2 + accountCount);
            const dateColumnWidth = 76;
            const actionColumnWidth = 60;
            const availableWidth = (container.clientWidth || 0) - dateColumnWidth - actionColumnWidth;
            const valueColumnWidth = availableWidth > 0 && accountCount > 0
                ? Math.max(96, Math.min(150, Math.floor(availableWidth / accountCount) - 2))
                : 116;
            const colgroup = `<colgroup><col style="width:${dateColumnWidth}px">${Array.from({ length: accountCount }, () => `<col style="width:${valueColumnWidth}px">`).join("")}<col style="width:${actionColumnWidth}px"></colgroup>`;
            const groupHeaders = buckets.map(bucket => {
                const isCollapsed = collapsed.has(bucket.key);
                const chevron = isCollapsed ? "fa-chevron-right" : "fa-chevron-down";
                const action = isCollapsed ? "Expandir" : "Colapsar";
                const label = `<button type="button" data-balance-group-toggle="${escapeGalleryHtml(bucket.key)}" title="${action} ${escapeGalleryHtml(bucket.name)}" class="inline-flex items-center gap-1.5 text-white transition hover:text-indigo-200"><i class="fa-solid ${chevron} text-[9px] text-indigo-300"></i>${escapeGalleryHtml(bucket.name)}<span class="normal-case font-normal text-gray-500">· ${bucket.accounts.length}</span></button>`;
                return `<th colspan="${groupHeaderSpan(bucket)}" data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="border-l border-main px-2 py-2 text-center">${label}</th>`;
            }).join("");
            const accountHeaders = `<tr>${buckets.map(bucket => {
                if (collapsed.has(bucket.key)) return `<th colspan="${groupHeaderSpan(bucket)}" data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="border-l border-main px-2 py-3 text-center align-middle normal-case tracking-normal font-normal text-indigo-300/80">Total del grupo</th>`;
                return bucket.accounts.map(account => `
                    <th data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="border-l border-main px-2 py-2 text-center align-middle text-[11px] font-bold text-white">${escapeGalleryHtml(account.name || "Cuenta")}</th>
                `).join("");
            }).join("")}</tr>`;
            const rows = [...realBalanceHistory]
                .sort(compareBalanceSnapshots)
                .map(snapshot => {
                    const snapshotAccounts = new Map(
                        (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).map(account => [String(account.accountId), account])
                    );
                    const date = snapshot.date
                        ? new Date(`${snapshot.date}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })
                        : "—";
                    const values = buckets.map(bucket => {
                        if (collapsed.has(bucket.key)) {
                            const totals = computeBalanceGroupTotals(snapshotAccounts, bucket.accounts);
                            if (!totals.informed) return `<td colspan="${groupHeaderSpan(bucket)}" data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="border-l border-main px-2 py-2 text-center text-gray-500">—</td>`;
                            const pnlFmt = formatBalancePnlText(totals.pnl);
                            const pctFmt = formatBalancePctText(totals.pct);
                            const partialNote = totals.informed < totals.total
                                ? ` <span class="text-gray-500" title="Solo se suman las cuentas informadas (${totals.informed}/${totals.total})">(parcial)</span>`
                                : "";
                            return `<td colspan="${groupHeaderSpan(bucket)}" data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="border-l border-main px-2 py-2 text-center whitespace-nowrap">
                                <span class="block font-semibold text-white">${formatBalanceHistoryMoney(totals.actual)}</span>
                                <span class="block text-[10px] ${pnlFmt.cls}">${pnlFmt.text}${partialNote} <span class="text-gray-500">·</span> <span class="${pctFmt.cls}">${pctFmt.text}</span></span>
                            </td>`;
                        }
                        return bucket.accounts.map((account, accountIndex) => {
                            const entry = snapshotAccounts.get(String(account.id));
                            const balance = entry ? parseOptionalBalance(entry.balanceActual) : null;
                            const accountDivider = accountIndex === 0 ? " border-l border-main" : "";
                            if (!entry || balance === null) {
                                return `<td data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="px-2 py-2 text-center text-gray-500${accountDivider}">—</td>`;
                            }
                            const initial = parseOptionalBalance(entry.initialBalance);
                            const hasInitial = Number.isFinite(initial) && initial > 0;
                            const pnl = hasInitial ? balance - initial : null;
                            const pct = hasInitial ? (pnl / initial) * 100 : null;
                            const pnlColor = pnl > 0 ? "text-emerald-400" : (pnl < 0 ? "text-red-400" : "text-gray-300");
                            const pctColor = pct > 0 ? "text-emerald-400" : (pct < 0 ? "text-red-400" : "text-gray-300");
                            const pnlText = pnl === null ? '<span class="text-gray-500">—</span>' : `<span class="${pnlColor}">${formatBalanceHistoryMoney(pnl)}</span>`;
                            const pctText = pct === null ? '<span class="text-gray-500">—</span>' : `<span class="${pctColor}">${pct > 0 ? "+" : ""}${pct.toFixed(2)}%</span>`;
                            return `<td data-balance-group-cell="${escapeGalleryHtml(bucket.key)}" class="px-2 py-2 text-center whitespace-nowrap${accountDivider}">
                                <span class="block font-semibold text-white">${formatBalanceHistoryMoney(balance)}</span>
                                <span class="block text-[10px]">${pnlText} <span class="text-gray-500">·</span> ${pctText}</span>
                            </td>`;
                        }).join("");
                    }).join("");
                    return `<tr class="border-b border-main hover:bg-gray-800/40">
                        <td class="px-2 py-2 whitespace-nowrap font-medium text-white">${date}</td>
                        ${values}
                        <td class="border-l border-main px-2 py-2 text-center whitespace-nowrap"><button type="button" data-snapshot-edit="${escapeGalleryHtml(snapshot.id)}" class="text-gray-500 hover:text-blue-400 transition mr-2" title="Editar registro"><i class="fa-solid fa-pen"></i></button><button type="button" data-snapshot-id="${escapeGalleryHtml(snapshot.id)}" class="text-gray-500 hover:text-red-400 transition" title="Eliminar registro"><i class="fa-solid fa-trash"></i></button></td>
                    </tr>`;
                }).join("");

            container.innerHTML = `<table class="journal-table w-full text-left text-xs text-gray-300">
                ${colgroup}
                <thead class="bg-gray-900 uppercase text-[10px] text-gray-400 border-b border-main font-semibold sticky top-0 z-10">
                    <tr><th rowspan="2" class="px-2 py-2 align-middle">Fecha</th>${groupHeaders}<th rowspan="2" class="border-l border-main px-2 py-2 text-center align-middle">Acciones</th></tr>
                    ${accountHeaders}
                </thead>
                <tbody class="divide-y divide-main">${rows || `<tr><td colspan="${tableColumns}" class="p-6 text-center text-gray-400">No hay balances registrados.</td></tr>`}</tbody>
            </table>`;
            container.scrollLeft = previousScrollLeft;
            container.querySelectorAll("[data-balance-group-toggle]").forEach(button => {
                button.addEventListener("click", () => toggleBalanceGroupCollapse(button.dataset.balanceGroupToggle));
            });
            container.querySelectorAll("[data-snapshot-edit]").forEach(button => {
                button.addEventListener("click", () => editRealBalanceSnapshot(button.dataset.snapshotEdit));
            });
            container.querySelectorAll("[data-snapshot-id]").forEach(button => {
                button.addEventListener("click", () => deleteRealBalanceSnapshot(button.dataset.snapshotId));
            });
            document.getElementById("btn-record-balance-snapshot").disabled = realAccounts.length === 0;
        }

        function getLocalDateISO(date = new Date()) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        function openRealBalanceEntryModal(groupId = null, accountIds = null) {
            if (currentMode !== "real") return;
            if (!realAccounts.length) {
                showToast("Crea una cuenta real antes de registrar balances", true);
                return;
            }
            let targetAccounts = [...realAccounts];
            let contextLabel = "";
            if (Array.isArray(accountIds) && accountIds.length) {
                const wanted = accountIds.map(String);
                targetAccounts = realAccounts.filter(account => wanted.includes(String(account.id)));
                if (targetAccounts.length === 1) contextLabel = ` · ${targetAccounts[0].name}`;
            } else if (groupId !== null && groupId !== undefined) {
                const group = accountGroups.find(item => String(item.id) === String(groupId));
                if (group) {
                    targetAccounts = getAccountGroupAccounts(group);
                    contextLabel = ` · ${group.name}`;
                }
            }
            if (!targetAccounts.length) {
                showToast("No hay cuentas para registrar balances", true);
                return;
            }

            editingBalanceSnapshotId = null;
            const applyCurrentRow = document.getElementById("realBalanceApplyCurrentRow");
            applyCurrentRow.classList.add("hidden");
            applyCurrentRow.classList.remove("flex");
            document.getElementById("realBalanceApplyCurrent").checked = false;
            document.getElementById("realBalanceEntryDateRow").classList.add("hidden");
            document.getElementById("btn-submit-real-balances").textContent = "Guardar y registrar";
            document.getElementById("realBalanceEntryTitle").innerHTML = `<i class="fa-solid fa-money-bill-transfer text-emerald-400 mr-2"></i>Cargar balances reales${escapeGalleryHtml(contextLabel)}`;
            document.getElementById("realBalanceEntryHint").textContent = contextLabel
                ? "Se actualizarán solo las cuentas listadas y se registrará una captura histórica con ellas. El valor será la base para proyectar operaciones posteriores; no incluye comisiones."
                : "Actualiza aquí el último cierre de cada cuenta. Al guardar, se registrará una captura histórica y ese valor será la base para proyectar operaciones posteriores. No incluye comisiones.";

            document.getElementById("realBalanceEntryList").innerHTML = targetAccounts.map(account => {
                const actualBalance = parseOptionalBalance(account.balanceActual);
                return `<label class="block rounded-lg border border-main bg-gray-900/60 p-3">
                    <span class="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span class="font-semibold text-white">${escapeGalleryHtml(account.name || "Cuenta")}</span>
                        <span class="text-[11px] text-gray-400">Inicial: ${formatBalanceHistoryMoney(getRealInitialBalance(account))}</span>
                    </span>
                    <span class="relative block">
                        <span class="absolute left-3 top-2.5 text-gray-400">$</span>
                        <input type="number" step="0.01" required data-balance-account-id="${escapeGalleryHtml(account.id)}" value="${actualBalance === null ? "" : actualBalance}" placeholder="Balance actual" aria-label="Balance actual de ${escapeGalleryHtml(account.name || "cuenta")}" class="w-full rounded-lg border border-main bg-[#161b22] py-2 pl-8 pr-3 text-white focus:border-emerald-500 focus:outline-none">
                    </span>
                </label>`;
            }).join("");
            document.getElementById("realBalanceEntryModal").classList.remove("hidden");
            const firstInput = document.querySelector("#realBalanceEntryList input");
            if (firstInput) firstInput.focus();
        }

        function editRealBalanceSnapshot(id) {
            if (currentMode !== "real") return;
            const snapshot = realBalanceHistory.find(item => String(item.id) === String(id));
            if (!snapshot) {
                showToast("No se encontró el registro de balances", true);
                return;
            }
            const entries = Array.isArray(snapshot.accounts) ? snapshot.accounts : [];
            if (!entries.length) {
                showToast("Este registro no tiene balances para editar", true);
                return;
            }
            editingBalanceSnapshotId = snapshot.id;
            document.getElementById("realBalanceEntryTitle").innerHTML = `<i class="fa-solid fa-pen-to-square text-emerald-400 mr-2"></i>Editar registro de balances`;
            document.getElementById("realBalanceEntryHint").textContent = "Ajusta la fecha o los balances de este registro histórico. Si marcas la casilla, también se actualizará el balance actual de cada cuenta y su fecha base para proyectar operaciones posteriores.";
            document.getElementById("realBalanceEntryDateRow").classList.remove("hidden");
            document.getElementById("realBalanceEntryDate").value = snapshot.date || getLocalDateISO();
            const applyCurrentRow = document.getElementById("realBalanceApplyCurrentRow");
            applyCurrentRow.classList.remove("hidden");
            applyCurrentRow.classList.add("flex");
            document.getElementById("realBalanceApplyCurrent").checked = false;
            document.getElementById("realBalanceEntryList").innerHTML = entries.map(entry => {
                const balance = parseOptionalBalance(entry.balanceActual);
                const initial = parseOptionalBalance(entry.initialBalance);
                const accountExists = realAccounts.some(account => String(account.id) === String(entry.accountId));
                return `<label class="block rounded-lg border border-main bg-gray-900/60 p-3">
                    <span class="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span class="font-semibold text-white">${escapeGalleryHtml(entry.accountName || "Cuenta")}</span>
                        <span class="text-[11px] text-gray-400">Inicial: ${Number.isFinite(initial) && initial > 0 ? formatBalanceHistoryMoney(initial) : "—"}${accountExists ? "" : ' · <span class="text-amber-300">cuenta eliminada</span>'}</span>
                    </span>
                    <span class="relative block">
                        <span class="absolute left-3 top-2.5 text-gray-400">$</span>
                        <input type="number" step="0.01" required data-balance-account-id="${escapeGalleryHtml(entry.accountId)}" value="${balance === null ? "" : balance}" placeholder="Balance del registro" aria-label="Balance del registro para ${escapeGalleryHtml(entry.accountName || "cuenta")}" class="w-full rounded-lg border border-main bg-[#161b22] py-2 pl-8 pr-3 text-white focus:border-emerald-500 focus:outline-none">
                    </span>
                </label>`;
            }).join("");
            document.getElementById("btn-submit-real-balances").textContent = "Guardar cambios";
            document.getElementById("realBalanceEntryModal").classList.remove("hidden");
            const firstInput = document.querySelector("#realBalanceEntryList input");
            if (firstInput) firstInput.focus();
        }

        function closeRealBalanceEntryModal() {
            editingBalanceSnapshotId = null;
            document.getElementById("realBalanceEntryModal").classList.add("hidden");
        }

        async function saveRealBalanceEntry(event) {
            event.preventDefault();
            if (editingBalanceSnapshotId !== null) return saveRealBalanceSnapshotEdit();
            if (currentMode !== "real" || !realAccounts.length) return;
            const inputs = Array.from(document.querySelectorAll("#realBalanceEntryList [data-balance-account-id]"));
            const balances = new Map();
            for (const input of inputs) {
                const balance = parseOptionalBalance(input.value);
                if (balance === null) {
                    input.focus();
                    showToast("Ingresa un balance válido para cada cuenta", true);
                    return;
                }
                balances.set(String(input.dataset.balanceAccountId), balance);
            }

            const targetAccounts = realAccounts.filter(account => balances.has(String(account.id)));
            if (!targetAccounts.length || balances.size !== targetAccounts.length) {
                showToast("No se pudieron leer todos los balances. Vuelve a abrir el formulario.", true);
                return;
            }

            const button = document.getElementById("btn-submit-real-balances");
            button.disabled = true;
            try {
                const now = new Date();
                const nextAccounts = realAccounts.map(account => {
                    if (!balances.has(String(account.id))) return account;
                    return { ...account, balanceActual: balances.get(String(account.id)), balanceActualAt: now.toISOString() };
                });
                const snapshot = {
                    id: `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
                    date: getLocalDateISO(now),
                    recordedAt: now.toISOString(),
                    accounts: targetAccounts.map(account => ({
                        accountId: account.id,
                        accountName: account.name,
                        initialBalance: getRealInitialBalance(account),
                        balanceActual: balances.get(String(account.id)),
                        informed: true
                    }))
                };
                const nextHistory = [...realBalanceHistory, snapshot];
                await dbSetMany([
                    [STORAGE_KEY_REAL_ACCOUNTS, nextAccounts],
                    [STORAGE_KEY_REAL_BALANCE_HISTORY, nextHistory]
                ]);
                realAccounts = nextAccounts;
                realBalanceHistory = nextHistory;
                closeRealBalanceEntryModal();
                if (activeAccountGroupId !== null) groupBalancesVisible = true;
                renderGroups();
                if (activeRealAccountId) renderAll();
                renderRealBalanceHistory();
                await autoSaveJSONToFolder(true);
                showToast("Balances actualizados y registrados correctamente");
            } catch (error) {
                console.error("No se pudieron guardar los balances reales", error);
                showToast("No se pudieron guardar los balances. Inténtalo de nuevo.", true);
            } finally {
                button.disabled = false;
            }
        }

        async function saveRealBalanceSnapshotEdit() {
            const snapshot = realBalanceHistory.find(item => String(item.id) === String(editingBalanceSnapshotId));
            if (!snapshot) {
                showToast("El registro ya no existe", true);
                closeRealBalanceEntryModal();
                return;
            }
            const inputs = Array.from(document.querySelectorAll("#realBalanceEntryList [data-balance-account-id]"));
            const balances = new Map();
            for (const input of inputs) {
                const balance = parseOptionalBalance(input.value);
                if (balance === null) {
                    input.focus();
                    showToast("Ingresa un balance válido para cada cuenta", true);
                    return;
                }
                balances.set(String(input.dataset.balanceAccountId), balance);
            }
            if (!balances.size) return;
            const dateValue = document.getElementById("realBalanceEntryDate").value;
            const applyCurrent = document.getElementById("realBalanceApplyCurrent").checked;
            const button = document.getElementById("btn-submit-real-balances");
            button.disabled = true;
            try {
                const editedSnapshot = {
                    ...snapshot,
                    date: dateValue || snapshot.date || getLocalDateISO(),
                    accounts: (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).map(entry => {
                        const key = String(entry.accountId);
                        if (!balances.has(key)) return entry;
                        return { ...entry, balanceActual: balances.get(key), informed: true };
                    })
                };
                const nextHistory = realBalanceHistory.map(item => String(item.id) === String(editedSnapshot.id) ? editedSnapshot : item);
                const operations = [[STORAGE_KEY_REAL_BALANCE_HISTORY, nextHistory]];
                let nextAccounts = realAccounts;
                if (applyCurrent) {
                    const appliedAt = new Date().toISOString();
                    nextAccounts = realAccounts.map(account => {
                        const key = String(account.id);
                        if (!balances.has(key)) return account;
                        return { ...account, balanceActual: balances.get(key), balanceActualAt: appliedAt };
                    });
                    operations.push([STORAGE_KEY_REAL_ACCOUNTS, nextAccounts]);
                }
                await dbSetMany(operations);
                realBalanceHistory = nextHistory;
                realAccounts = nextAccounts;
                closeRealBalanceEntryModal();
                renderRealBalanceHistory();
                if (applyCurrent) {
                    renderGroups();
                    if (activeRealAccountId) renderAll();
                }
                await autoSaveJSONToFolder(true);
                showToast("Registro de balances actualizado");
            } catch (error) {
                console.error("No se pudo editar el registro de balances", error);
                showToast("No se pudo actualizar el registro. Inténtalo de nuevo.", true);
            } finally {
                button.disabled = false;
            }
        }

        async function deleteRealBalanceSnapshot(id) {
            const snapshot = realBalanceHistory.find(item => String(item.id) === String(id));
            if (!snapshot || !confirm("¿Eliminar este registro histórico de balances?")) return;
            const nextHistory = realBalanceHistory.filter(item => String(item.id) !== String(id));
            try {
                await dbSet(STORAGE_KEY_REAL_BALANCE_HISTORY, nextHistory);
                realBalanceHistory = nextHistory;
                await autoSaveJSONToFolder(true);
                renderRealBalanceHistory();
                showToast("Registro de balances eliminado");
            } catch (error) {
                console.error("No se pudo eliminar el registro histórico de balances", error);
                showToast("No se pudo eliminar el registro de balances", true);
            }
        }

        // ===================== RESUMEN DE BALANCES POR GRUPO =====================
        // El total usa el balance efectivo de todas las cuentas: último cierre (o inicial) + operaciones.
        function getGroupBalanceSummary(accounts) {
            const usingInitial = [];
            let initial = 0;
            let actual = 0;
            accounts.forEach(account => {
                const effective = getAccountEffectiveBalance(account);
                initial += effective.initial;
                actual += effective.balance;
                if (!effective.informed) usingInitial.push(account);
            });
            const pnl = actual - initial;
            const pnlPct = initial > 0 ? (pnl / initial) * 100 : 0;
            return { usingInitial, initial, actual, pnl, pnlPct };
        }

        function getGroupBalanceSeries(accounts) {
            const ids = new Set(accounts.map(account => String(account.id)));
            const points = [];
            [...realBalanceHistory]
                .sort(compareBalanceSnapshots)
                .forEach(snapshot => {
                    let total = 0;
                    let count = 0;
                    (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).forEach(entry => {
                        if (!ids.has(String(entry.accountId))) return;
                        const balance = parseOptionalBalance(entry.balanceActual);
                        if (balance === null) return;
                        total += balance;
                        count += 1;
                    });
                    if (!count) return;
                    const label = snapshot.date
                        ? new Date(`${snapshot.date}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
                        : "";
                    points.push({ label, value: total });
                });
            return points;
        }

        function getAccountLatestBalanceDate(accountId) {
            let latestDate = "";
            [...realBalanceHistory]
                .sort(compareBalanceSnapshots)
                .forEach(snapshot => {
                    const match = (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).find(entry => String(entry.accountId) === String(accountId));
                    if (match && match.informed !== false && parseOptionalBalance(match.balanceActual) !== null) {
                        latestDate = snapshot.date
                            ? new Date(`${snapshot.date}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
                            : "";
                    }
                });
            return latestDate;
        }

        function getAccountGoalReached(account) {
            const stage = getAccountStage(account);
            if (stage === "prueba") {
                const status = getPruebaGoalStatus(account);
                return status.targetReached;
            }
            if (stage === "real") return getRealGoalStatus(account).reached;
            if (stage === "instant") return getInstantGoalStatus(account).readyToWithdraw;
            return getFondeadaGoalStatus(account).readyToWithdraw;
        }

        function renderGroupSummaryPanel(group, accounts) {
            const panel = document.getElementById("group-summary-panel");
            if (!panel) return;
            const summary = getGroupBalanceSummary(accounts);
            const series = getGroupBalanceSeries(accounts);
            const goalsReached = accounts.filter(getAccountGoalReached).length;
            const pnlTone = summary.pnl > 0 ? "text-emerald-400" : (summary.pnl < 0 ? "text-red-400" : "text-white");
            const kpi = (label, value, sub, toneClass) => `
                <div class="rounded-lg border border-main bg-gray-900/60 p-3">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">${label}</p>
                    <p class="mt-1 text-lg font-bold ${toneClass || "text-white"}">${value}</p>
                    <p class="mt-1.5 text-xs text-gray-500">${sub || ""}</p>
                </div>`;
            const usingInitialBanner = summary.usingInitial.length
                ? `<div class="flex flex-wrap items-center gap-2 rounded-lg border border-amber-800 bg-amber-900/20 px-3 py-2 text-xs text-amber-300">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>${summary.usingInitial.length} ${summary.usingInitial.length === 1 ? "cuenta no tiene" : "cuentas no tienen"} Balance Actual informado: se usa el Balance Inicial como base. ${summary.usingInitial.map(account => escapeGalleryHtml(account.name || "Cuenta")).join(" · ")}</span>
                    </div>`
                : "";
            const rows = accounts.map(account => {
                const stage = getAccountStage(account);
                const effective = getAccountEffectiveBalance(account);
                const initial = effective.initial;
                const actual = effective.balance;
                const pnl = actual - initial;
                const pnlPct = initial > 0 ? (pnl / initial) * 100 : 0;
                const mini = buildAccountGoalMiniHtml(account);
                const pnlColor = pnl > 0 ? "text-emerald-400" : (pnl < 0 ? "text-red-400" : "text-gray-300");
                const balanceSuffix = !effective.informed
                    ? ' <span class="text-[10px] font-normal text-amber-300">· inicial</span>'
                    : (effective.projected ? ' <span class="text-[10px] font-normal text-gray-500">· proy.</span>' : "");
                return `<tr class="border-b border-main align-middle hover:bg-gray-800/40">
                    <td class="px-2 py-2 whitespace-nowrap text-[11px] text-gray-400">${getAccountLatestBalanceDate(account.id) || "—"}</td>
                    <td class="px-2 py-2">
                        <div class="font-semibold text-white leading-tight">${escapeGalleryHtml(account.name || "Cuenta")}</div>
                        <span class="mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${ACCOUNT_STAGE_BADGES[stage]}"><i class="${ACCOUNT_STAGE_ICONS[stage]}"></i>${ACCOUNT_STAGE_LABELS[stage]}</span>
                    </td>
                    <td class="px-2 py-2 text-right whitespace-nowrap text-gray-300">${formatBalanceHistoryMoney(initial)}</td>
                    <td class="px-2 py-2 text-right whitespace-nowrap text-white">${formatBalanceHistoryMoney(actual)}${balanceSuffix}</td>
                    <td class="px-2 py-2 text-right whitespace-nowrap ${pnlColor}">${formatBalanceHistoryMoney(pnl)}</td>
                    <td class="px-2 py-2 text-right whitespace-nowrap ${pnlColor}">${pnlPct > 0 ? "+" : ""}${pnlPct.toFixed(2)}%</td>
                    <td class="px-2 py-2">${mini || '<span class="text-gray-500">—</span>'}</td>
                    <td class="px-2 py-2 text-center">
                        <button type="button" data-group-balance-account="${escapeGalleryHtml(account.id)}" class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-emerald-400" title="Cargar balance de esta cuenta"><i class="fa-solid fa-money-bill-transfer"></i></button>
                    </td>
                </tr>`;
            }).join("");
            panel.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="text-sm font-bold text-gray-200"><i class="fa-solid fa-layer-group mr-2 text-indigo-300"></i>Balances del grupo</h3>
                    <button type="button" data-group-balance-action="load" class="rounded-lg border border-emerald-800 bg-emerald-900/40 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-700 hover:text-white"><i class="fa-solid fa-money-bill-transfer mr-1.5"></i>Cargar balances del grupo</button>
                </div>
                <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                    ${kpi("Balance inicial", formatBalanceHistoryMoney(summary.initial), `${accounts.length} ${accounts.length === 1 ? "cuenta" : "cuentas"}`)}
                    ${kpi("Balance efectivo", formatBalanceHistoryMoney(summary.actual), summary.usingInitial.length ? `${summary.usingInitial.length} con base inicial` : "Último cierre + operaciones", "text-white")}
                    ${kpi("P/L proyectado", `${summary.pnl > 0 ? "+" : ""}${formatBalanceHistoryMoney(summary.pnl)}`, `${summary.pnlPct > 0 ? "+" : ""}${summary.pnlPct.toFixed(2)}% sobre el inicial`, pnlTone)}
                    ${kpi("Metas cumplidas", `${goalsReached} / ${accounts.length}`, "Objetivo alcanzado o retiro listo")}
                </div>
                <p class="text-[10px] text-gray-500">El balance efectivo usa el último cierre (o el Balance Inicial) + operaciones posteriores. No incluye comisiones.</p>
                ${usingInitialBanner}
                <div class="rounded-xl border border-main bg-card shadow">
                    <table class="journal-table w-full text-left text-xs text-gray-300">
                        <thead class="border-b border-main bg-gray-900/90 text-[10px] font-semibold uppercase text-gray-400">
                            <tr>
                                <th class="px-2 py-2">Fecha</th>
                                <th class="px-2 py-2">Cuenta</th>
                                <th class="px-2 py-2 text-right">Inicial</th>
                                <th class="px-2 py-2 text-right">Efectivo</th>
                                <th class="px-2 py-2 text-right">P/L $</th>
                                <th class="px-2 py-2 text-right">P/L %</th>
                                <th class="px-2 py-2">Progreso</th>
                                <th class="px-2 py-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-main">${rows}</tbody>
                    </table>
                </div>
                <div class="rounded-xl border border-main bg-card p-4 shadow">
                    <h4 class="mb-3 text-sm font-bold text-gray-200"><i class="fa-solid fa-chart-line mr-2 text-emerald-400"></i>Evolución del balance del grupo</h4>
                    ${series.length
                        ? '<div class="h-48"><canvas id="group-balance-chart"></canvas></div>'
                        : '<p class="py-10 text-center text-xs text-gray-500">Aún no hay snapshots de balances para este grupo. Usa “Cargar balances del grupo”.</p>'}
                </div>`;
            panel.querySelectorAll("[data-group-balance-action]").forEach(button => button.addEventListener("click", () => {
                if (button.dataset.groupBalanceAction === "load") openRealBalanceEntryModal(group.id);
            }));
            panel.querySelectorAll("[data-group-balance-account]").forEach(button => button.addEventListener("click", () => {
                openRealBalanceEntryModal(null, [button.dataset.groupBalanceAccount]);
            }));
            if (series.length) {
                const canvas = document.getElementById("group-balance-chart");
                if (canvas) {
                    const colors = getChartThemeColors();
                    if (groupBalanceChartInstance) {
                        groupBalanceChartInstance.destroy();
                        groupBalanceChartInstance = null;
                    }
                    groupBalanceChartInstance = new Chart(canvas.getContext("2d"), {
                        type: "line",
                        data: {
                            labels: series.map(point => point.label),
                            datasets: [{
                                label: "Balance total",
                                data: series.map(point => point.value),
                                borderColor: "#10b981",
                                backgroundColor: "rgba(16, 185, 129, 0.12)",
                                fill: true,
                                tension: 0.3,
                                pointRadius: 3,
                                pointBackgroundColor: "#10b981"
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
                                y: { ticks: { color: colors.tick, callback: value => `$${Number(value).toLocaleString("es-AR")}` }, grid: { color: colors.grid } }
                            }
                        }
                    });
                }
            }
        }

        // ===================== ETAPAS Y METAS DE CUENTAS REALES =====================
        const ACCOUNT_STAGES = ["real", "prueba", "fondeada", "instant"];
        const ACCOUNT_STAGE_LABELS = { real: "Cuenta real", prueba: "Fase de prueba", fondeada: "Fondeada", instant: "Instant" };
        const ACCOUNT_STAGE_ICONS = { real: "fa-solid fa-wallet", prueba: "fa-solid fa-graduation-cap", fondeada: "fa-solid fa-award", instant: "fa-solid fa-bolt" };
        const ACCOUNT_STAGE_BADGES = {
            real: "border-gray-700 bg-gray-800 text-gray-300",
            prueba: "border-blue-700 bg-blue-900/40 text-blue-300",
            fondeada: "border-emerald-700 bg-emerald-900/40 text-emerald-300",
            instant: "border-purple-700 bg-purple-900/40 text-purple-300"
        };
        const ACCOUNT_GOAL_DEFAULTS = {
            prueba: { targetPct: 8, maxDDPct: 10, phases: 1, phase: 1, target2Pct: 5, phaseStartDate: null, celebratedPhase: 0 },
            real: { mode: "amount", value: 0 },
            fondeada: { splitPct: 80, bufferPct: 0, minWithdrawal: 0 },
            instant: { splitPct: 80, bufferPct: 0, minWithdrawal: 0, minWithdrawalMode: "amount", maxDDPct: 0, ddType: "static" },
            rules: { consistencyPct: 0, minTradingDays: 0, minProfitableDays: 0, maxDailyLossPct: 0 }
        };

        function getAccountStage(account) {
            const stage = account && account.stage;
            return ACCOUNT_STAGES.includes(stage) ? stage : "real";
        }

        function getAccountGoalConfig(account) {
            const stored = account && typeof account.goal === "object" && account.goal ? account.goal : {};
            const merge = key => ({ ...ACCOUNT_GOAL_DEFAULTS[key], ...(stored[key] || {}) });
            return { prueba: merge("prueba"), real: merge("real"), fondeada: merge("fondeada"), instant: merge("instant"), rules: merge("rules") };
        }

        function getAccountWithdrawals(account) {
            return Array.isArray(account && account.withdrawals) ? account.withdrawals : [];
        }

        // Fecha/hora de la operación, para saber si ocurrió después del último cierre.
        // Para operaciones MT5 ya cerradas se usa la fecha de cierre (el P/L real
        // se materializó ahí y los parciales abiertos no deben duplicarse).
        function getTradeTimestamp(trade) {
            const closeAt = trade && trade.mt5 && trade.mt5.auto ? trade.mt5.cierreAt : null;
            if (closeAt) {
                const closeStamp = parseBalanceTimestamp(closeAt);
                if (closeStamp !== null) return closeStamp;
            }
            const fecha = String((trade && trade.fecha) || "").trim();
            if (!fecha) return null;
            const hora = String((trade && trade.hora) || "").trim() || "00:00";
            const stamp = new Date(`${fecha}T${hora}`).getTime();
            return Number.isFinite(stamp) ? stamp : null;
        }

        function parseBalanceTimestamp(value) {
            if (value === null || value === undefined || value === "") return null;
            const stamp = new Date(value).getTime();
            return Number.isFinite(stamp) ? stamp : null;
        }

        function getAccountTradesNetPct(accountId, sinceTimestamp = null) {
            return trades
                .filter(trade => {
                    if (String(trade.accountId) !== String(accountId) || trade.estado === "Sin Activar") return false;
                    if (sinceTimestamp === null) return true;
                    const stamp = getTradeTimestamp(trade);
                    return stamp !== null && stamp > sinceTimestamp;
                })
                .reduce((sum, trade) => sum + getTradeOutcome(trade), 0);
        }

        // Balance efectivo: base del último cierre (o el inicial si no hay) + operaciones posteriores.
        function getAccountEffectiveBalance(account) {
            const initial = getRealInitialBalance(account);
            const actual = parseOptionalBalance(account && account.balanceActual);
            const informed = actual !== null;
            const base = informed ? actual : initial;
            const baseAt = informed ? parseBalanceTimestamp(account && account.balanceActualAt) : null;
            // Sin cierre informado se aplican todas las operaciones sobre el inicial.
            // Con cierre, solo las posteriores; si la cuenta vieja no tiene fecha, no se proyecta.
            const appliedPct = informed && baseAt === null
                ? 0
                : getAccountTradesNetPct(account && account.id, informed ? baseAt : null);
            const balance = base + initial * (appliedPct / 100);
            return {
                balance: Math.round(balance * 100) / 100,
                initial,
                base,
                baseAt,
                appliedPct,
                informed,
                projected: appliedPct !== 0,
                baseSource: informed ? "actual" : "initial"
            };
        }

        // Texto de ayuda para el balance efectivo y la aclaración de comisiones.
        function getBalanceProjectionHint(status) {
            if (!status) return "";
            if (!status.informed) {
                return "Sin Balance Actual: se usa el Balance Inicial como base y se suman las operaciones registradas. No incluye comisiones.";
            }
            if (status.projected) {
                return "Balance proyectado: último cierre + operaciones posteriores. No incluye comisiones.";
            }
            return "";
        }

        function getBalanceBaseLabel(status) {
            if (!status) return "";
            if (!status.informed) return " · base inicial";
            if (status.projected) return " · proyectado";
            return "";
        }

        function getBalanceHintLabel(status) {
            if (!status) return "";
            if (!status.informed) return "Base inicial · sin comisiones";
            if (status.projected) return "Balance proyectado · sin comisiones";
            return "";
        }

        // Peor balance histórico registrado en los snapshots (para el colchón de drawdown).
        function getAccountWorstSnapshotBalance(accountId, sinceDate = null) {
            let worst = null;
            realBalanceHistory.forEach(snapshot => {
                if (sinceDate && String(snapshot.date || "") < String(sinceDate)) return;
                (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).forEach(entry => {
                    if (String(entry.accountId) !== String(accountId)) return;
                    const balance = parseOptionalBalance(entry.balanceActual);
                    if (balance === null) return;
                    if (worst === null || balance < worst) worst = balance;
                });
            });
            return worst;
        }

        function getPruebaGoalStatus(account) {
            const config = getAccountGoalConfig(account).prueba;
            const phases = config.phases === 2 ? 2 : 1;
            const phase = Math.min(Math.max(1, Math.round(config.phase) || 1), phases);
            const currentTargetPct = phase === 2 ? config.target2Pct : config.targetPct;
            const phaseStartDate = config.phaseStartDate || null;
            const { balance, initial, base, baseAt, appliedPct, informed, projected, baseSource } = getAccountEffectiveBalance(account);
            const profit = balance - initial;
            const profitPct = initial > 0 ? (profit / initial) * 100 : 0;
            const targetAmount = currentTargetPct > 0 ? initial * currentTargetPct / 100 : 0;
            // "Alcanzado" usa el mejor balance visto en la fase (actual o capturas), no solo el actual.
            let bestBalance = balance;
            realBalanceHistory.forEach(snapshot => {
                if (phaseStartDate && String(snapshot.date || "") < String(phaseStartDate)) return;
                (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).forEach(entry => {
                    if (String(entry.accountId) !== String(account.id)) return;
                    const entryBalance = parseOptionalBalance(entry.balanceActual);
                    if (entryBalance !== null) bestBalance = Math.max(bestBalance, entryBalance);
                });
            });
            const bestProfit = bestBalance - initial;
            const targetProgress = targetAmount > 0 ? Math.min(100, Math.max(0, (Math.max(0, bestProfit) / targetAmount) * 100)) : null;
            const targetRemaining = targetAmount > 0 ? Math.max(0, targetAmount - bestProfit) : null;
            const targetReached = targetAmount > 0 && bestProfit >= targetAmount - 1e-6;
            let ddUsed = Math.max(0, initial - balance);
            // El drawdown de la fase solo cuenta las capturas desde que arrancó (evita falsos DD tras un reset).
            const worst = getAccountWorstSnapshotBalance(account.id, phaseStartDate);
            if (worst !== null) ddUsed = Math.max(ddUsed, Math.max(0, initial - worst));
            const ddLimit = config.maxDDPct > 0 ? initial * config.maxDDPct / 100 : null;
            const ddRemaining = ddLimit === null ? null : Math.max(0, ddLimit - ddUsed);
            const ddUsedPct = ddLimit ? (ddUsed / ddLimit) * 100 : null;
            const ddBusted = ddLimit !== null && ddUsed >= ddLimit - 1e-6;
            const nextAction = targetReached && !ddBusted
                ? (phases === 2 && phase === 1 ? "fase2" : "fondeada")
                : null;
            return { config, phases, phase, currentTargetPct, phaseStartDate, balance, initial, base, baseAt, appliedPct, informed, projected, baseSource, profit, profitPct, targetAmount, targetProgress, targetRemaining, targetReached, bestBalance, nextAction, ddUsed, ddLimit, ddRemaining, ddUsedPct, ddBusted };
        }

        function getRealGoalStatus(account) {
            const config = getAccountGoalConfig(account).real;
            const { balance, initial, base, baseAt, appliedPct, informed, projected, baseSource } = getAccountEffectiveBalance(account);
            const hasMeta = config.value > 0;
            const target = hasMeta ? (config.mode === "percent" ? initial * (1 + config.value / 100) : config.value) : null;
            const profit = balance - initial;
            const remaining = target !== null ? Math.max(0, target - balance) : null;
            const reached = target !== null && balance >= target - 1e-6;
            const span = target !== null ? target - initial : 0;
            const progress = target !== null ? (span > 0 ? Math.min(100, Math.max(0, ((balance - initial) / span) * 100)) : (reached ? 100 : 0)) : null;
            const targetPct = target !== null && initial > 0 ? ((target - initial) / initial) * 100 : null;
            return { config, balance, initial, base, baseAt, appliedPct, informed, projected, baseSource, hasMeta, target, targetPct, profit, remaining, reached, progress };
        }

        function getFondeadaGoalStatus(account) {
            const config = getAccountGoalConfig(account).fondeada;
            const { balance, initial, base, baseAt, appliedPct, informed, projected, baseSource } = getAccountEffectiveBalance(account);
            const buffer = initial * config.bufferPct / 100;
            const availableProfit = Math.max(0, balance - initial - buffer);
            const yourShare = availableProfit * config.splitPct / 100;
            const minWithdrawal = config.minWithdrawal > 0 ? config.minWithdrawal : 0;
            const missingForMin = minWithdrawal > 0 ? Math.max(0, minWithdrawal - yourShare) : 0;
            const readyToWithdraw = minWithdrawal > 0 ? yourShare >= minWithdrawal - 1e-6 : yourShare > 0;
            const progress = minWithdrawal > 0 ? Math.min(100, (yourShare / minWithdrawal) * 100) : (yourShare > 0 ? 100 : 0);
            const withdrawals = getAccountWithdrawals(account);
            const totalWithdrawn = withdrawals.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            return { config, balance, initial, base, baseAt, appliedPct, informed, projected, baseSource, buffer, availableProfit, yourShare, minWithdrawal, missingForMin, readyToWithdraw, progress, withdrawals, totalWithdrawn };
        }

        // Resultado diario (en % de riesgo) por fecha, para evaluar las reglas opcionales.
        function getAccountDailyResults(accountId) {
            const byDay = new Map();
            trades.forEach(trade => {
                if (String(trade.accountId) !== String(accountId)) return;
                if (trade.estado === "Sin Activar") return;
                const key = String(trade.fecha || "");
                if (!key) return;
                byDay.set(key, (byDay.get(key) || 0) + getTradeOutcome(trade));
            });
            return Array.from(byDay.entries())
                .map(([fecha, pct]) => ({ fecha, pct }))
                .sort((a, b) => a.fecha.localeCompare(b.fecha));
        }

        function getAccountRulesStatus(account) {
            const config = getAccountGoalConfig(account).rules;
            const days = getAccountDailyResults(account && account.id);
            const profitable = days.filter(day => day.pct > 1e-9);
            const totalProfitPct = days.reduce((sum, day) => sum + day.pct, 0);
            const bestDayPct = profitable.reduce((best, day) => Math.max(best, day.pct), 0);
            const worstDayPct = days.reduce((worst, day) => Math.min(worst, day.pct), 0);
            const consistencyEnabled = config.consistencyPct > 0;
            // La consistencia solo es evaluable con beneficio real: sin operaciones, con la cuenta
            // en pérdidas o con menos del 1% del inicial en trades, el ratio no es representativo.
            const { balance, initial } = getAccountEffectiveBalance(account);
            const effectiveProfit = balance - initial;
            const minProfitPct = initial > 0 ? 1 : 0;
            let consistencyState = "deshabilitada";
            let consistencyRatio = null;
            if (consistencyEnabled) {
                if (!days.length) consistencyState = "sin-operaciones";
                else if (effectiveProfit <= 1e-9) consistencyState = "en-perdidas";
                else if (totalProfitPct < minProfitPct - 1e-9 || totalProfitPct <= 1e-9) consistencyState = "sin-base";
                else {
                    consistencyState = "evaluada";
                    consistencyRatio = (bestDayPct / totalProfitPct) * 100;
                }
            }
            const dailyLossEnabled = config.maxDailyLossPct > 0;
            const dailyLossUsedPct = Math.max(0, -worstDayPct);
            return {
                config,
                days: days.length,
                totalProfitPct,
                consistency: {
                    enabled: consistencyEnabled,
                    state: consistencyState,
                    ratio: consistencyRatio,
                    limit: config.consistencyPct,
                    ok: !consistencyEnabled || consistencyRatio === null || consistencyRatio <= config.consistencyPct + 1e-9
                },
                tradingDays: {
                    enabled: config.minTradingDays > 0,
                    count: days.length,
                    min: config.minTradingDays,
                    ok: !(config.minTradingDays > 0) || days.length >= config.minTradingDays
                },
                profitableDays: {
                    enabled: config.minProfitableDays > 0,
                    count: profitable.length,
                    min: config.minProfitableDays,
                    ok: !(config.minProfitableDays > 0) || profitable.length >= config.minProfitableDays
                },
                dailyLoss: {
                    enabled: dailyLossEnabled,
                    usedPct: dailyLossUsedPct,
                    limit: config.maxDailyLossPct,
                    ok: !dailyLossEnabled || dailyLossUsedPct <= config.maxDailyLossPct + 1e-9
                }
            };
        }

        function getInstantGoalStatus(account) {
            const config = getAccountGoalConfig(account).instant;
            const { balance, initial, base, baseAt, appliedPct, informed, projected, baseSource } = getAccountEffectiveBalance(account);
            const buffer = initial * config.bufferPct / 100;
            const availableProfit = Math.max(0, balance - initial - buffer);
            const yourShare = availableProfit * config.splitPct / 100;
            const minWithdrawalPctMode = config.minWithdrawalMode === "percent";
            const minWithdrawal = config.minWithdrawal > 0
                ? (minWithdrawalPctMode ? initial * config.minWithdrawal / 100 : config.minWithdrawal)
                : 0;
            const missingForMin = minWithdrawal > 0 ? Math.max(0, minWithdrawal - yourShare) : 0;
            const readyToWithdraw = minWithdrawal > 0 ? yourShare >= minWithdrawal - 1e-6 : yourShare > 0;
            const progress = minWithdrawal > 0 ? Math.min(100, (yourShare / minWithdrawal) * 100) : (yourShare > 0 ? 100 : 0);
            // Drawdown: fijo sobre el inicial o trailing sobre el pico histórico (inicial, balance y snapshots).
            let peak = Math.max(initial, balance);
            realBalanceHistory.forEach(snapshot => {
                (Array.isArray(snapshot.accounts) ? snapshot.accounts : []).forEach(entry => {
                    if (String(entry.accountId) !== String(account.id)) return;
                    const entryBalance = parseOptionalBalance(entry.balanceActual);
                    if (entryBalance !== null) peak = Math.max(peak, entryBalance);
                });
            });
            const trailing = config.ddType === "trailing";
            const ddLimit = config.maxDDPct > 0 ? initial * config.maxDDPct / 100 : null;
            let ddUsed = trailing ? Math.max(0, peak - balance) : Math.max(0, initial - balance);
            if (!trailing) {
                const worst = getAccountWorstSnapshotBalance(account.id);
                if (worst !== null) ddUsed = Math.max(ddUsed, Math.max(0, initial - worst));
            }
            const ddRemaining = ddLimit === null ? null : Math.max(0, ddLimit - ddUsed);
            const ddUsedPct = ddLimit ? (ddUsed / ddLimit) * 100 : null;
            const withdrawals = getAccountWithdrawals(account);
            const totalWithdrawn = withdrawals.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            return {
                config, balance, initial, base, baseAt, appliedPct, informed, projected, baseSource, buffer, availableProfit, yourShare,
                minWithdrawal, minWithdrawalPctMode, missingForMin, readyToWithdraw, progress,
                peak, trailing, ddLimit, ddUsed, ddRemaining, ddUsedPct,
                ddBusted: ddLimit !== null && ddUsed >= ddLimit - 1e-6,
                withdrawals, totalWithdrawn,
                rules: getAccountRulesStatus(account)
            };
        }

        // Chips compactos de reglas activas para las tarjetas de cuenta.
        function buildAccountRulesMiniHtml(account) {
            if (getAccountStage(account) === "real") return "";
            const rules = getAccountRulesStatus(account);
            const chipStyles = {
                ok: "border-emerald-800 bg-emerald-900/30 text-emerald-300",
                bad: "border-red-800 bg-red-900/30 text-red-300",
                muted: "border-gray-700 bg-gray-800/60 text-gray-400"
            };
            const chipIcons = { ok: "fa-check", bad: "fa-xmark", muted: "fa-minus" };
            const chip = (ok, text, tone = null) => {
                const finalTone = tone || (ok ? "ok" : "bad");
                return `<span class="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 ${chipStyles[finalTone]}"><i class="fa-solid ${chipIcons[finalTone]} text-[8px]"></i>${text}</span>`;
            };
            const chips = [];
            if (rules.consistency.enabled) {
                const evaluable = rules.consistency.state === "evaluada";
                const ratioText = rules.consistency.ratio === null ? "—" : `${Math.round(rules.consistency.ratio)}%`;
                chips.push(chip(rules.consistency.ok, `Cons. ${ratioText}/${rules.consistency.limit}%`, evaluable ? null : "muted"));
            }
            if (rules.tradingDays.enabled) chips.push(chip(rules.tradingDays.ok, `Días ${rules.tradingDays.count}/${rules.tradingDays.min}`));
            if (rules.profitableDays.enabled) chips.push(chip(rules.profitableDays.ok, `Rentables ${rules.profitableDays.count}/${rules.profitableDays.min}`));
            if (rules.dailyLoss.enabled) chips.push(chip(rules.dailyLoss.ok, `Pérdida diaria ${rules.dailyLoss.usedPct.toFixed(1)}%/${rules.dailyLoss.limit}%`));
            if (!chips.length) return "";
            return `<div class="flex flex-wrap items-center gap-1"><span class="text-[9px] uppercase tracking-wide text-gray-500">Reglas:</span>${chips.join("")}</div>`;
        }

        function buildAccountGoalMiniHtml(account) {
            const stage = getAccountStage(account);
            let label = "", detail = "", progress = null, fill = "bg-gray-500";
            if (stage === "prueba") {
                const status = getPruebaGoalStatus(account);
                if (status.targetAmount > 0) {
                    const phaseSuffix = status.phases === 2 ? ` · F${status.phase}` : "";
                    label = `Objetivo ${status.currentTargetPct}%${phaseSuffix}`;
                    detail = `${status.profitPct >= 0 ? "+" : ""}${status.profitPct.toFixed(2)}% / ${status.currentTargetPct}%`;
                    progress = status.targetProgress;
                    fill = status.targetReached ? "bg-emerald-500" : "bg-blue-500";
                } else if (status.ddLimit !== null) {
                    label = `DD máx ${status.config.maxDDPct}%`;
                    detail = `${status.ddUsedPct.toFixed(0)}% usado`;
                    progress = status.ddUsedPct;
                    fill = status.ddUsedPct >= 80 ? "bg-red-500" : (status.ddUsedPct >= 50 ? "bg-amber-500" : "bg-emerald-500");
                }
            } else if (stage === "real") {
                const status = getRealGoalStatus(account);
                if (status.hasMeta) {
                    label = `Meta ${status.config.mode === "percent" ? `${status.config.value}%` : formatBalanceHistoryMoney(status.target)}`;
                    detail = `${Math.round(status.progress)}%`;
                    progress = status.progress;
                    fill = status.reached ? "bg-emerald-500" : "bg-teal-500";
                }
            } else if (stage === "fondeada") {
                const status = getFondeadaGoalStatus(account);
                label = "Retirable";
                detail = formatBalanceHistoryMoney(status.yourShare);
                progress = status.progress;
                fill = status.readyToWithdraw ? "bg-emerald-500" : "bg-indigo-500";
            } else {
                const status = getInstantGoalStatus(account);
                label = "Retirable";
                detail = formatBalanceHistoryMoney(status.yourShare);
                progress = status.progress;
                fill = status.readyToWithdraw ? "bg-emerald-500" : "bg-purple-500";
            }
            const rulesHtml = buildAccountRulesMiniHtml(account);
            if (progress === null && !rulesHtml) return "";
            const progressHtml = progress === null ? "" : `<div class="space-y-1">
                <div class="flex items-center justify-between gap-2 text-[10px] font-semibold"><span class="text-gray-500">${label}</span><span class="text-gray-300">${detail}</span></div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-800"><div class="h-full rounded-full ${fill}" style="width:${Math.max(0, Math.min(100, progress)).toFixed(1)}%"></div></div>
            </div>`;
            return `<div class="space-y-1.5">${progressHtml}${rulesHtml}</div>`;
        }

        function toggleAccountStageFields() {
            const stageInput = document.getElementById("inputAccountStage");
            if (!stageInput) return;
            const stage = stageInput.value;
            document.getElementById("accountGoalFieldsPrueba").classList.toggle("hidden", stage !== "prueba");
            document.getElementById("accountGoalFieldsReal").classList.toggle("hidden", stage !== "real");
            document.getElementById("accountGoalFieldsFondeada").classList.toggle("hidden", stage !== "fondeada");
            document.getElementById("accountGoalFieldsInstant").classList.toggle("hidden", stage !== "instant");
            document.getElementById("accountRulesSection").classList.toggle("hidden", stage === "real");
            togglePruebaPhaseFields();
            toggleAccountRuleInputs();
        }

        function togglePruebaPhaseFields() {
            const phasesSelect = document.getElementById("inputPruebaPhases");
            const phase2Field = document.getElementById("pruebaPhase2Field");
            if (!phasesSelect || !phase2Field) return;
            phase2Field.classList.toggle("hidden", phasesSelect.value !== "2");
        }

        function toggleAccountRuleInputs() {
            const master = document.getElementById("inputRulesEnabled");
            const fields = document.getElementById("accountRulesFields");
            const rulesEnabled = !master || master.checked;
            if (fields) fields.classList.toggle("hidden", !rulesEnabled);
            const pairs = [
                ["inputRuleConsistency", "inputRuleConsistencyPct"],
                ["inputRuleMinTradingDays", "inputRuleMinTradingDaysValue"],
                ["inputRuleMinProfitableDays", "inputRuleMinProfitableDaysValue"],
                ["inputRuleDailyLoss", "inputRuleDailyLossPct"]
            ];
            pairs.forEach(([checkboxId, valueId]) => {
                const checkbox = document.getElementById(checkboxId);
                const input = document.getElementById(valueId);
                if (!checkbox || !input) return;
                input.disabled = !rulesEnabled || !checkbox.checked;
                input.classList.toggle("opacity-40", input.disabled);
            });
        }

        function fillAccountStageForm(account) {
            const config = getAccountGoalConfig(account);
            document.getElementById("inputAccountStage").value = getAccountStage(account);
            const setValue = (id, value) => { document.getElementById(id).value = value === null || value === undefined || value === 0 ? "" : value; };
            setValue("inputAccountGoalTargetPct", config.prueba.targetPct);
            setValue("inputAccountGoalMaxDD", config.prueba.maxDDPct);
            document.getElementById("inputPruebaPhases").value = config.prueba.phases === 2 ? "2" : "1";
            setValue("inputPruebaTarget2", config.prueba.target2Pct);
            document.getElementById("inputAccountGoalMode").value = config.real.mode === "percent" ? "percent" : "amount";
            setValue("inputAccountGoalValue", config.real.value);
            setValue("inputAccountSplitPct", config.fondeada.splitPct);
            setValue("inputAccountBufferPct", config.fondeada.bufferPct);
            setValue("inputAccountMinWithdrawal", config.fondeada.minWithdrawal);
            setValue("inputAccountInstantSplitPct", config.instant.splitPct);
            setValue("inputAccountInstantBufferPct", config.instant.bufferPct);
            setValue("inputAccountInstantMinWithdrawal", config.instant.minWithdrawal);
            document.getElementById("inputAccountInstantMinWithdrawalMode").value = config.instant.minWithdrawalMode === "percent" ? "percent" : "amount";
            setValue("inputAccountInstantMaxDD", config.instant.maxDDPct);
            document.getElementById("inputAccountInstantDDType").value = config.instant.ddType === "trailing" ? "trailing" : "static";
            const setRule = (checkboxId, valueId, value) => {
                document.getElementById(checkboxId).checked = value > 0;
                document.getElementById(valueId).value = value > 0 ? value : "";
            };
            setRule("inputRuleConsistency", "inputRuleConsistencyPct", config.rules.consistencyPct);
            setRule("inputRuleMinTradingDays", "inputRuleMinTradingDaysValue", config.rules.minTradingDays);
            setRule("inputRuleMinProfitableDays", "inputRuleMinProfitableDaysValue", config.rules.minProfitableDays);
            setRule("inputRuleDailyLoss", "inputRuleDailyLossPct", config.rules.maxDailyLossPct);
            document.getElementById("inputRulesEnabled").checked = config.rules.consistencyPct > 0 || config.rules.minTradingDays > 0 || config.rules.minProfitableDays > 0 || config.rules.maxDailyLossPct > 0;
            const mt5LoginInput = document.getElementById("inputAccountMt5Login");
            if (mt5LoginInput) mt5LoginInput.value = account && account.mt5Login ? String(account.mt5Login) : "";
            toggleAccountStageFields();
        }

        function mt5LoginFromForm() {
            const input = document.getElementById("inputAccountMt5Login");
            return input ? input.value.trim() : "";
        }

        function readAccountStageForm(existing) {
            const num = (id, fallback) => {
                const raw = document.getElementById(id).value;
                const value = parseFloat(raw);
                if (raw === "" || !Number.isFinite(value)) return fallback;
                return Math.max(0, value);
            };
            const stageValue = document.getElementById("inputAccountStage").value;
            const stage = ACCOUNT_STAGES.includes(stageValue) ? stageValue : "real";
            const previous = getAccountGoalConfig(existing);
            const readRule = (checkboxId, valueId, fallback, max) => {
                const master = document.getElementById("inputRulesEnabled");
                if (master && !master.checked) return 0;
                const checkbox = document.getElementById(checkboxId);
                if (!checkbox || !checkbox.checked) return 0;
                const value = num(valueId, fallback);
                if (!(value > 0)) return fallback;
                return Math.min(max, value);
            };
            return {
                stage,
                mt5Login: mt5LoginFromForm(),
                goal: {
                    prueba: {
                        targetPct: num("inputAccountGoalTargetPct", 0),
                        maxDDPct: num("inputAccountGoalMaxDD", 0),
                        phases: document.getElementById("inputPruebaPhases").value === "2" ? 2 : 1,
                        target2Pct: num("inputPruebaTarget2", previous.prueba.target2Pct || 5),
                        // El avance de fases no se reinicia al editar la cuenta.
                        phase: Math.min(Math.max(1, previous.prueba.phase || 1), document.getElementById("inputPruebaPhases").value === "2" ? 2 : 1),
                        phaseStartDate: previous.prueba.phaseStartDate,
                        celebratedPhase: previous.prueba.celebratedPhase
                    },
                    real: {
                        mode: document.getElementById("inputAccountGoalMode").value === "percent" ? "percent" : "amount",
                        value: num("inputAccountGoalValue", 0)
                    },
                    fondeada: {
                        splitPct: Math.min(100, num("inputAccountSplitPct", previous.fondeada.splitPct)),
                        bufferPct: num("inputAccountBufferPct", 0),
                        minWithdrawal: num("inputAccountMinWithdrawal", 0)
                    },
                    instant: {
                        splitPct: Math.min(100, num("inputAccountInstantSplitPct", previous.instant.splitPct)),
                        bufferPct: num("inputAccountInstantBufferPct", 0),
                        minWithdrawal: num("inputAccountInstantMinWithdrawal", 0),
                        minWithdrawalMode: document.getElementById("inputAccountInstantMinWithdrawalMode").value === "percent" ? "percent" : "amount",
                        maxDDPct: num("inputAccountInstantMaxDD", 0),
                        ddType: document.getElementById("inputAccountInstantDDType").value === "trailing" ? "trailing" : "static"
                    },
                    rules: {
                        consistencyPct: readRule("inputRuleConsistency", "inputRuleConsistencyPct", 30, 100),
                        minTradingDays: readRule("inputRuleMinTradingDays", "inputRuleMinTradingDaysValue", 5, 365),
                        minProfitableDays: readRule("inputRuleMinProfitableDays", "inputRuleMinProfitableDaysValue", 3, 365),
                        maxDailyLossPct: readRule("inputRuleDailyLoss", "inputRuleDailyLossPct", 5, 100)
                    }
                }
            };
        }

        function getActiveGoalAccount() {
            if (currentMode !== "real" || isGlobalMetricsView || !activeRealAccountId) return null;
            return realAccounts.find(item => String(item.id) === String(activeRealAccountId)) || null;
        }

        function renderAccountGoalPanel() {
            const panel = document.getElementById("account-goal-panel");
            if (!panel) return;
            const account = getActiveGoalAccount();
            if (!account) {
                panel.classList.add("hidden");
                panel.innerHTML = "";
                return;
            }
            panel.classList.remove("hidden");
            panel.innerHTML = buildAccountGoalPanelHtml(account);
            panel.querySelectorAll("[data-goal-action]").forEach(button => button.addEventListener("click", () => {
                const action = button.dataset.goalAction;
                if (action === "edit") editGroup(account.id);
                if (action === "withdraw") openWithdrawalModal(account.id);
                if (action === "delete-withdrawal") deleteAccountWithdrawal(account.id, button.dataset.withdrawalId);
                if (action === "advance-phase") advancePruebaPhase(account.id);
            }));
            maybeCelebratePruebaPhase(account);
        }

        // ===================== CELEBRACIÓN DE FASE SUPERADA =====================

        let celebrationAccountId = null;
        let confettiAnimationId = null;
        let confettiParticles = [];
        let confettiStopAt = 0;

        function prefersReducedMotion() {
            return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }

        // Confeti propio sobre canvas (sin dependencias) para celebrar la fase superada.
        function launchConfetti() {
            const canvas = document.getElementById("confettiCanvas");
            if (!canvas) return;
            stopConfetti();
            if (prefersReducedMotion()) return;
            const ctx = canvas.getContext && canvas.getContext("2d");
            if (!ctx || typeof ctx.clearRect !== "function" || typeof ctx.fillRect !== "function") return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            canvas.classList.remove("hidden");
            const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#22d3ee"];
            confettiParticles = Array.from({ length: 150 }, () => ({
                x: Math.random() * canvas.width,
                y: -30 * dpr - Math.random() * canvas.height * 0.35,
                vx: (Math.random() - 0.5) * 2.4 * dpr,
                vy: (1.8 + Math.random() * 2.8) * dpr,
                size: (5 + Math.random() * 6) * dpr,
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 0.28,
                color: colors[Math.floor(Math.random() * colors.length)]
            }));
            confettiStopAt = performance.now() + 3800;
            const step = now => {
                if (!confettiParticles.length) {
                    stopConfetti();
                    return;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const remaining = confettiStopAt - now;
                confettiParticles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.05 * dpr;
                    particle.rotation += particle.spin;
                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    ctx.globalAlpha = remaining < 700 ? Math.max(0, remaining / 700) : 1;
                    ctx.fillStyle = particle.color;
                    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.62);
                    ctx.restore();
                });
                confettiParticles = confettiParticles.filter(particle => particle.y < canvas.height + 40);
                if (now < confettiStopAt && confettiParticles.length) confettiAnimationId = requestAnimationFrame(step);
                else stopConfetti();
            };
            confettiAnimationId = requestAnimationFrame(step);
        }

        function stopConfetti() {
            if (confettiAnimationId !== null) {
                cancelAnimationFrame(confettiAnimationId);
                confettiAnimationId = null;
            }
            confettiParticles = [];
            const canvas = document.getElementById("confettiCanvas");
            if (!canvas) return;
            const ctx = canvas.getContext && canvas.getContext("2d");
            if (ctx && typeof ctx.clearRect === "function") ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.classList.add("hidden");
        }

        // Muestra la celebración una sola vez por fase (queda registrada en la cuenta).
        function maybeCelebratePruebaPhase(account) {
            if (currentMode !== "real" || !account || celebrationAccountId !== null) return;
            if (getAccountStage(account) !== "prueba") return;
            const status = getPruebaGoalStatus(account);
            if (!status.targetReached || status.ddBusted) return;
            if (Number(status.config.celebratedPhase) === status.phase) return;
            const nextAccounts = realAccounts.map(item => String(item.id) === String(account.id)
                ? { ...item, goal: { ...(item.goal || {}), prueba: { ...((item.goal && item.goal.prueba) || {}), celebratedPhase: status.phase } } }
                : item);
            realAccounts = nextAccounts;
            dbSet(STORAGE_KEY_REAL_ACCOUNTS, realAccounts).catch(() => {});
            openPhaseCelebrationModal(account, status);
        }

        function openPhaseCelebrationModal(account, status) {
            const modal = document.getElementById("phaseCelebrationModal");
            if (!modal) return;
            celebrationAccountId = String(account.id);
            const toPhase2 = status.nextAction === "fase2";
            document.getElementById("phaseCelebrationTitle").innerHTML = `<i class="fa-solid fa-trophy text-amber-400 mr-2"></i>¡Felicidades! Superaste la fase ${status.phase}`;
            document.getElementById("phaseCelebrationAccount").textContent = account.name || "Cuenta";
            document.getElementById("phaseCelebrationSummary").innerHTML = [
                `Objetivo alcanzado: <strong class="text-white">${formatBalanceHistoryMoney(status.targetAmount)}</strong> (${status.currentTargetPct}% del inicial).`,
                `Mejor balance visto: <strong class="text-emerald-400">${formatBalanceHistoryMoney(status.bestBalance)}</strong>.`,
                toPhase2
                    ? `Si aceptás, el balance vuelve al inicial y arranca la <strong class="text-white">fase 2</strong> con un objetivo de ${status.config.target2Pct}%.`
                    : `Si aceptás, la cuenta pasa a tipo <strong class="text-white">Fondeada</strong> y el balance vuelve al inicial.`
            ].join("<br>");
            document.getElementById("btn-phase-celebration-continue").textContent = toPhase2 ? "Sí, pasar a fase 2" : "Sí, convertir a Fondeada";
            modal.classList.remove("hidden");
            launchConfetti();
        }

        function closePhaseCelebrationModal() {
            const modal = document.getElementById("phaseCelebrationModal");
            if (modal) modal.classList.add("hidden");
            stopConfetti();
            celebrationAccountId = null;
        }

        function resolvePhaseCelebration(accept) {
            const accountId = celebrationAccountId;
            closePhaseCelebrationModal();
            if (accept && accountId !== null) advancePruebaPhase(accountId);
        }

        async function advancePruebaPhase(accountId) {
            const account = realAccounts.find(item => String(item.id) === String(accountId));
            if (!account || getAccountStage(account) !== "prueba") return;
            const status = getPruebaGoalStatus(account);
            if (!status.targetReached || status.ddBusted) return;
            const toFondeada = !(status.phases === 2 && status.phase === 1);
            const nextPhase = status.phase + 1;
            const today = getLocalDateISO();
            const now = new Date();
            // Captura automática completa con el balance logrado, antes de resetear la cuenta.
            const snapshot = buildBalanceSnapshot(account.id, status.balance, today, now);
            const nextAccounts = realAccounts.map(item => {
                if (String(item.id) !== String(account.id)) return item;
                const goal = { ...(item.goal || {}) };
                const prueba = { ...(goal.prueba || {}), phaseStartDate: today };
                if (!toFondeada) prueba.phase = nextPhase;
                goal.prueba = prueba;
                return {
                    ...item,
                    stage: toFondeada ? "fondeada" : item.stage,
                    balanceActual: status.initial,
                    balanceActualAt: now.toISOString(),
                    goal
                };
            });
            const nextHistory = [...realBalanceHistory, snapshot];
            await dbSetMany([
                [STORAGE_KEY_REAL_ACCOUNTS, nextAccounts],
                [STORAGE_KEY_REAL_BALANCE_HISTORY, nextHistory]
            ]);
            realAccounts = nextAccounts;
            realBalanceHistory = nextHistory;
            renderGroups();
            if (activeRealAccountId) renderAll();
            renderRealBalanceHistory();
            await autoSaveJSONToFolder(true);
            showToast(toFondeada ? "Cuenta convertida a Fondeada: balance reiniciado" : `Fase ${nextPhase} iniciada: balance reiniciado`);
        }

        function buildAccountGoalPanelHtml(account) {
            const stage = getAccountStage(account);
            const stageBadge = `<span class="rounded-full border px-3 py-1 text-xs font-bold ${ACCOUNT_STAGE_BADGES[stage]}"><i class="${ACCOUNT_STAGE_ICONS[stage]} mr-1"></i>${ACCOUNT_STAGE_LABELS[stage]}</span>`;
            const toneText = { ok: "text-emerald-400", warn: "text-amber-300", bad: "text-red-400", info: "text-blue-300", muted: "text-gray-300" };
            const toneFill = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-red-500", info: "bg-blue-500", muted: "bg-gray-500" };
            const usageTone = pct => (pct >= 80 ? "bad" : (pct >= 50 ? "warn" : "ok"));
            const card = (title, value, sub, pct = null, tone = "muted") => `
                <div class="rounded-lg border border-main bg-gray-900/60 p-3">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">${title}</p>
                    <p class="mt-1 text-lg font-bold ${toneText[tone]}">${value}</p>
                    ${pct === null ? "" : `<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-800"><div class="h-full rounded-full ${toneFill[tone]}" style="width:${Math.max(0, Math.min(100, pct)).toFixed(1)}%"></div></div>`}
                    <p class="mt-1.5 text-xs text-gray-500">${sub}</p>
                </div>`;
            const emptyHint = message => `
                <div class="rounded-lg border border-dashed border-main bg-gray-900/40 p-4 md:col-span-2">
                    <p class="text-sm font-semibold text-gray-300"><i class="fa-solid fa-bullseye mr-2 text-teal-400"></i>${message}</p>
                    <button type="button" data-goal-action="edit" class="mt-3 rounded-lg border border-main bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-gray-700"><i class="fa-solid fa-pen mr-1"></i>Configurar meta</button>
                </div>`;

            const editButton = `<button type="button" data-goal-action="edit" class="rounded-lg border border-main bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-gray-700"><i class="fa-solid fa-pen mr-1"></i>Configurar meta</button>`;
            const withdrawButton = (stage === "fondeada" || stage === "instant")
                ? `<button type="button" data-goal-action="withdraw" class="rounded-lg border border-emerald-800 bg-emerald-900/40 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-700 hover:text-white"><i class="fa-solid fa-hand-holding-dollar mr-1"></i>Registrar retiro</button>`
                : "";

            const cards = [];
            let headerHint = "";
            let headerHintLabel = "";
            let extraHtml = "";
            let advanceHeaderButton = "";

            if (stage === "prueba") {
                const status = getPruebaGoalStatus(account);
                headerHint = getBalanceProjectionHint(status);
                headerHintLabel = getBalanceHintLabel(status);
                const profitTone = status.profit > 0 ? "ok" : (status.profit < 0 ? "bad" : "muted");
                cards.push(card(
                    "Balance efectivo",
                    formatBalanceHistoryMoney(status.balance),
                    `Inicial ${formatBalanceHistoryMoney(status.initial)} · ${status.profit >= 0 ? "+" : ""}${formatBalanceHistoryMoney(status.profit)} (${status.profitPct >= 0 ? "+" : ""}${status.profitPct.toFixed(2)}%)${getBalanceBaseLabel(status)}`,
                    null,
                    profitTone
                ));
                if (status.targetAmount > 0) {
                    const progressText = status.targetReached ? "¡Alcanzado!" : `${Math.min(100, status.targetProgress).toFixed(0)}%`;
                    const reachedProfit = Math.max(status.profit, status.bestBalance - status.initial);
                    const subText = status.targetReached
                        ? `+${formatBalanceHistoryMoney(reachedProfit)} sobre el objetivo de ${formatBalanceHistoryMoney(status.targetAmount)} (${status.currentTargetPct}%)`
                        : `Faltan ${formatBalanceHistoryMoney(status.targetRemaining)} para ${formatBalanceHistoryMoney(status.targetAmount)} (${status.currentTargetPct}% del inicial)`;
                    const phaseTitle = status.phases === 2 ? ` · Fase ${status.phase} de ${status.phases}` : "";
                    cards.push(card(`Objetivo de beneficio${phaseTitle}`, progressText, subText, status.targetProgress, status.targetReached ? "ok" : "info"));
                }
                if (status.nextAction) {
                    const advanceLabel = status.nextAction === "fase2" ? "Pasar a fase 2" : "Convertir a Fondeada";
                    advanceHeaderButton = `<button type="button" data-goal-action="advance-phase" class="rounded-lg border border-amber-600 bg-amber-900/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-600 hover:text-white"><i class="fa-solid fa-flag-checkered mr-1"></i>${advanceLabel}</button>`;
                }
                if (status.ddLimit !== null) {
                    const tone = usageTone(status.ddUsedPct);
                    const subText = status.ddBusted
                        ? `Drawdown agotado (límite ${status.config.maxDDPct}%)`
                        : `Colchón restante ${formatBalanceHistoryMoney(status.ddRemaining)} · límite ${status.config.maxDDPct}%`;
                    cards.push(card("Drawdown máximo", `${formatBalanceHistoryMoney(status.ddUsed)} / ${formatBalanceHistoryMoney(status.ddLimit)}`, subText, status.ddUsedPct, status.ddBusted ? "bad" : tone));
                }
                if (status.targetAmount === 0 && status.ddLimit === null) {
                    cards.push(emptyHint("Configura el objetivo de tu challenge para seguir el avance"));
                }
            } else if (stage === "real") {
                const status = getRealGoalStatus(account);
                headerHint = getBalanceProjectionHint(status);
                headerHintLabel = getBalanceHintLabel(status);
                cards.push(card(
                    "Balance efectivo",
                    formatBalanceHistoryMoney(status.balance),
                    `Inicial ${formatBalanceHistoryMoney(status.initial)} · ${status.profit >= 0 ? "+" : ""}${formatBalanceHistoryMoney(status.profit)}${getBalanceBaseLabel(status)}`,
                    null,
                    status.profit > 0 ? "ok" : (status.profit < 0 ? "bad" : "muted")
                ));
                if (status.hasMeta) {
                    const subText = status.reached
                        ? `¡Meta alcanzada! ${formatBalanceHistoryMoney(status.balance)} de ${formatBalanceHistoryMoney(status.target)}`
                        : `Faltan ${formatBalanceHistoryMoney(status.remaining)} para ${formatBalanceHistoryMoney(status.target)}${status.targetPct !== null ? ` (+${status.targetPct.toFixed(2)}% del inicial)` : ""}`;
                    cards.push(card("Meta personal", status.reached ? "¡Cumplida!" : `${Math.round(status.progress)}%`, subText, status.progress, status.reached ? "ok" : "info"));
                } else {
                    cards.push(emptyHint("Fija una meta personal para esta cuenta"));
                }
            } else if (stage === "fondeada") {
                const status = getFondeadaGoalStatus(account);
                headerHint = getBalanceProjectionHint(status);
                headerHintLabel = getBalanceHintLabel(status);
                cards.push(card(
                    "Balance efectivo",
                    formatBalanceHistoryMoney(status.balance),
                    `Inicial ${formatBalanceHistoryMoney(status.initial)}${getBalanceBaseLabel(status)}`,
                    null,
                    status.balance >= status.initial ? "ok" : "muted"
                ));
                cards.push(card(
                    "Tu parte retirable",
                    formatBalanceHistoryMoney(status.yourShare),
                    `Beneficio retirable ${formatBalanceHistoryMoney(status.availableProfit)} · Split ${status.config.splitPct}% · Colchón ${formatBalanceHistoryMoney(status.buffer)}`,
                    null,
                    status.yourShare > 0 ? "ok" : "muted"
                ));
                if (status.minWithdrawal > 0) {
                    const subText = status.readyToWithdraw
                        ? `Listo: tu parte ${formatBalanceHistoryMoney(status.yourShare)} supera el mínimo de ${formatBalanceHistoryMoney(status.minWithdrawal)}`
                        : `Faltan ${formatBalanceHistoryMoney(status.missingForMin)} para el mínimo de ${formatBalanceHistoryMoney(status.minWithdrawal)}`;
                    cards.push(card("Próximo retiro", status.readyToWithdraw ? "Listo para retirar" : `${Math.round(status.progress)}%`, subText, status.progress, status.readyToWithdraw ? "ok" : "info"));
                }
                cards.push(card(
                    "Total retirado",
                    formatBalanceHistoryMoney(status.totalWithdrawn),
                    `${status.withdrawals.length} ${status.withdrawals.length === 1 ? "retiro registrado" : "retiros registrados"}`,
                    null,
                    status.totalWithdrawn > 0 ? "ok" : "muted"
                ));
                if (status.withdrawals.length) {
                    const rows = [...status.withdrawals]
                        .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))
                        .map(item => `
                            <div class="flex items-center justify-between gap-2 rounded border border-main bg-gray-900/60 px-2.5 py-1.5 text-xs">
                                <span class="text-gray-400">${formatFondeoDate(item.fecha)}</span>
                                <span class="font-semibold text-white">${formatBalanceHistoryMoney(item.amount)}</span>
                                <button type="button" data-goal-action="delete-withdrawal" data-withdrawal-id="${escapeGalleryHtml(item.id)}" class="text-gray-500 transition hover:text-red-400" title="Eliminar retiro"><i class="fa-solid fa-trash"></i></button>
                            </div>`).join("");
                    extraHtml = `<div class="border-t border-main pt-3">
                        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Retiros registrados</p>
                        <div class="max-h-40 space-y-1 overflow-y-auto pr-1">${rows}</div>
                    </div>`;
                }
            } else {
                const status = getInstantGoalStatus(account);
                headerHint = getBalanceProjectionHint(status);
                headerHintLabel = getBalanceHintLabel(status);
                cards.push(card(
                    "Balance efectivo",
                    formatBalanceHistoryMoney(status.balance),
                    `Inicial ${formatBalanceHistoryMoney(status.initial)}${getBalanceBaseLabel(status)}`,
                    null,
                    status.balance >= status.initial ? "ok" : "muted"
                ));
                cards.push(card(
                    "Tu parte retirable",
                    formatBalanceHistoryMoney(status.yourShare),
                    `Beneficio retirable ${formatBalanceHistoryMoney(status.availableProfit)} · Split ${status.config.splitPct}% · Colchón ${formatBalanceHistoryMoney(status.buffer)}`,
                    null,
                    status.yourShare > 0 ? "ok" : "muted"
                ));
                if (status.minWithdrawal > 0) {
                    const minLabel = status.minWithdrawalPctMode
                        ? `${status.config.minWithdrawal}% del inicial (${formatBalanceHistoryMoney(status.minWithdrawal)})`
                        : formatBalanceHistoryMoney(status.minWithdrawal);
                    const subText = status.readyToWithdraw
                        ? `Listo: tu parte ${formatBalanceHistoryMoney(status.yourShare)} supera el mínimo de ${minLabel}`
                        : `Faltan ${formatBalanceHistoryMoney(status.missingForMin)} para el mínimo de ${minLabel}`;
                    cards.push(card("Próximo retiro", status.readyToWithdraw ? "Listo para retirar" : `${Math.round(status.progress)}%`, subText, status.progress, status.readyToWithdraw ? "ok" : "info"));
                }
                if (status.ddLimit !== null) {
                    const tone = usageTone(status.ddUsedPct);
                    const ddTypeLabel = status.trailing ? "trailing sobre el pico" : "fijo sobre el inicial";
                    const subText = status.ddBusted
                        ? `Drawdown agotado (${ddTypeLabel}, límite ${status.config.maxDDPct}%)`
                        : `Colchón restante ${formatBalanceHistoryMoney(status.ddRemaining)} · ${ddTypeLabel} · límite ${status.config.maxDDPct}%`;
                    cards.push(card("Drawdown máximo", `${formatBalanceHistoryMoney(status.ddUsed)} / ${formatBalanceHistoryMoney(status.ddLimit)}`, subText, status.ddUsedPct, status.ddBusted ? "bad" : tone));
                }
                cards.push(card(
                    "Total retirado",
                    formatBalanceHistoryMoney(status.totalWithdrawn),
                    `${status.withdrawals.length} ${status.withdrawals.length === 1 ? "retiro registrado" : "retiros registrados"}`,
                    null,
                    status.totalWithdrawn > 0 ? "ok" : "muted"
                ));
                if (status.withdrawals.length) {
                    const rows = [...status.withdrawals]
                        .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))
                        .map(item => `
                            <div class="flex items-center justify-between gap-2 rounded border border-main bg-gray-900/60 px-2.5 py-1.5 text-xs">
                                <span class="text-gray-400">${formatFondeoDate(item.fecha)}</span>
                                <span class="font-semibold text-white">${formatBalanceHistoryMoney(item.amount)}</span>
                                <button type="button" data-goal-action="delete-withdrawal" data-withdrawal-id="${escapeGalleryHtml(item.id)}" class="text-gray-500 transition hover:text-red-400" title="Eliminar retiro"><i class="fa-solid fa-trash"></i></button>
                            </div>`).join("");
                    extraHtml = `<div class="border-t border-main pt-3">
                        <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Retiros registrados</p>
                        <div class="max-h-40 space-y-1 overflow-y-auto pr-1">${rows}</div>
                    </div>`;
                }
            }

            // Reglas opcionales: aplican a fase de prueba, fondeada e instant (no a cuentas reales).
            if (stage !== "real") {
                const rules = getAccountRulesStatus(account);
                if (rules.consistency.enabled) {
                    const ratioText = rules.consistency.ratio === null ? "—" : `${rules.consistency.ratio.toFixed(0)}%`;
                    let subText = "";
                    let tone = "muted";
                    if (rules.consistency.state === "sin-operaciones") {
                        subText = "Sin datos suficientes para comprobar ahora: la cuenta todavía no tiene operaciones registradas.";
                    } else if (rules.consistency.state === "en-perdidas") {
                        subText = "La cuenta está en pérdidas: la consistencia se evalúa cuando haya beneficio.";
                    } else if (rules.consistency.state === "sin-base") {
                        subText = "Sin datos suficientes: las operaciones suman menos del 1% del inicial, el ratio no es representativo todavía.";
                    } else {
                        subText = `El mejor día representa ${rules.consistency.ratio.toFixed(0)}% del beneficio total · límite ${rules.consistency.limit}%`;
                        tone = rules.consistency.ok ? "ok" : "bad";
                    }
                    cards.push(card("Consistencia", `${ratioText} / ${rules.consistency.limit}%`, subText, null, tone));
                }
                if (rules.tradingDays.enabled) {
                    const pct = Math.min(100, (rules.tradingDays.count / rules.tradingDays.min) * 100);
                    cards.push(card("Días de trading", `${rules.tradingDays.count} / ${rules.tradingDays.min}`, "Días con operaciones cargadas en la cuenta", pct, rules.tradingDays.ok ? "ok" : "warn"));
                }
                if (rules.profitableDays.enabled) {
                    const pct = Math.min(100, (rules.profitableDays.count / rules.profitableDays.min) * 100);
                    cards.push(card("Días rentables", `${rules.profitableDays.count} / ${rules.profitableDays.min}`, "Días con resultado neto positivo", pct, rules.profitableDays.ok ? "ok" : "warn"));
                }
                if (rules.dailyLoss.enabled) {
                    const pct = rules.dailyLoss.limit > 0 ? Math.min(100, (rules.dailyLoss.usedPct / rules.dailyLoss.limit) * 100) : 0;
                    cards.push(card("Límite de pérdida diaria", `${rules.dailyLoss.usedPct.toFixed(2)}% / ${rules.dailyLoss.limit}%`, "Peor día registrado en la cuenta", null, rules.dailyLoss.ok ? (pct >= 60 ? "warn" : "ok") : "bad"));
                }
            }

            const hintHtml = headerHintLabel
                ? `<span class="rounded-full border border-amber-800 bg-amber-900/30 px-3 py-1 text-[11px] font-semibold text-amber-300" title="${escapeGalleryHtml(headerHint)}"><i class="fa-solid fa-circle-info mr-1"></i>${escapeGalleryHtml(headerHintLabel)}</span>`
                : "";
            return `<div class="space-y-3 rounded-xl border border-main bg-card p-4 shadow">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">${stageBadge}${hintHtml}</div>
                    <div class="flex flex-wrap gap-2">${editButton}${advanceHeaderButton}${withdrawButton}</div>
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">${cards.join("")}</div>
                ${extraHtml}
            </div>`;
        }

        function openWithdrawalModal(accountId) {
            const account = realAccounts.find(item => String(item.id) === String(accountId));
            if (!account) return;
            document.getElementById("withdrawalModalAccount").textContent = account.name || "Cuenta";
            document.getElementById("inputWithdrawalAccountId").value = String(account.id);
            document.getElementById("inputWithdrawalDate").value = getLocalDateISO();
            const status = getAccountStage(account) === "instant" ? getInstantGoalStatus(account) : getFondeadaGoalStatus(account);
            document.getElementById("inputWithdrawalAmount").value = status.yourShare > 0 ? status.yourShare.toFixed(2) : "";
            document.getElementById("inputWithdrawalDeduct").checked = parseOptionalBalance(account.balanceActual) !== null;
            document.getElementById("withdrawalModal").classList.remove("hidden");
        }

        function closeWithdrawalModal() {
            document.getElementById("withdrawalModal").classList.add("hidden");
        }

        async function saveAccountWithdrawal(event) {
            event.preventDefault();
            const accountId = document.getElementById("inputWithdrawalAccountId").value;
            const account = realAccounts.find(item => String(item.id) === String(accountId));
            if (!account) return;
            const amount = parseFloat(document.getElementById("inputWithdrawalAmount").value);
            if (!(amount > 0)) {
                showToast("Ingresa un monto mayor a 0", true);
                return;
            }
            const fecha = document.getElementById("inputWithdrawalDate").value || getLocalDateISO();
            const deduct = document.getElementById("inputWithdrawalDeduct").checked;
            const nextAccounts = realAccounts.map(item => {
                if (String(item.id) !== String(account.id)) return item;
                const updated = {
                    ...item,
                    withdrawals: [...getAccountWithdrawals(item), { id: Date.now(), fecha, amount: Math.round(amount * 100) / 100 }]
                };
                if (deduct) {
                    const actual = parseOptionalBalance(item.balanceActual);
                    if (actual !== null) updated.balanceActual = Math.round((actual - amount) * 100) / 100;
                }
                return updated;
            });
            await dbSet(STORAGE_KEY_REAL_ACCOUNTS, nextAccounts);
            realAccounts = nextAccounts;
            closeWithdrawalModal();
            renderGroups();
            if (activeRealAccountId) renderAll();
            const updatedAccount = realAccounts.find(item => String(item.id) === String(account.id));
            const actualInput = document.getElementById("dashboardBalanceActual");
            if (updatedAccount && actualInput && String(activeRealAccountId) === String(account.id)) {
                const actual = parseOptionalBalance(updatedAccount.balanceActual);
                actualInput.value = actual === null ? "" : actual;
            }
            await autoSaveJSONToFolder();
            if (typeof triggerCloudSave === 'function') triggerCloudSave();
            showToast("Retiro registrado");
        }

        async function deleteAccountWithdrawal(accountId, withdrawalId) {
            const account = realAccounts.find(item => String(item.id) === String(accountId));
            if (!account) return;
            if (!confirm("¿Eliminar este retiro del histórico? El balance de la cuenta no se modificará.")) return;
            const nextAccounts = realAccounts.map(item => String(item.id) === String(accountId)
                ? { ...item, withdrawals: getAccountWithdrawals(item).filter(entry => String(entry.id) !== String(withdrawalId)) }
                : item);
            await dbSet(STORAGE_KEY_REAL_ACCOUNTS, nextAccounts);
            realAccounts = nextAccounts;
            renderGroups();
            if (activeRealAccountId) renderAll();
            await autoSaveJSONToFolder();
            if (typeof triggerCloudSave === 'function') triggerCloudSave();
            showToast("Retiro eliminado del histórico");
        }

        // "Seguimiento de balances" es global: no se muestra dentro de las métricas de una cuenta
        // ni dentro de la vista de un grupo de cuentas (ahí hay panel de balances propio).
        function isBalanceHistoryTabVisible() {
            if (currentMode !== "real") return false;
            if (activeAccountGroupId !== null) return false;
            const inAccountMetrics = Boolean(activeRealAccountId) && !isGlobalMetricsView && currentTabName !== "sessions" && currentTabName !== "balance-history";
            return !inAccountMetrics;
        }

        function updateBalanceHistoryTabVisibility() {
            const button = document.getElementById("tab-btn-balance-history");
            if (!button) return;
            button.classList.toggle("hidden", !isBalanceHistoryTabVisible());
        }

        function switchTab(tab) {
            if (tab === "balance-history" && !isBalanceHistoryTabVisible()) {
                showToast(currentMode !== "real" ? "El seguimiento de balances solo está disponible en cuentas reales" : "El seguimiento de balances es global: volvé a Cuentas Reales para verlo", true);
                switchTab("sessions");
                return;
            }
            if (tab === 'sessions' && isGlobalMetricsView) setGlobalMetricsView(false);
            ['sessions', 'balance-history', 'dashboard', 'journal', 'gallery', 'monthly'].forEach(t => {
                document.getElementById(`section-${t}`).classList.add('hidden');
                const btn = document.getElementById(`tab-btn-${t}`);
                if (btn) {
                    btn.classList.remove('border-green-500', 'border-blue-500', 'text-green-400', 'text-blue-400', 'font-bold');
                    btn.classList.add('border-transparent', 'text-gray-400');
                }
            });
            document.getElementById(`section-${tab}`).classList.remove('hidden');
            const activeBtn = document.getElementById(`tab-btn-${tab}`);
            const isBT = currentMode === 'backtesting';
            activeBtn.classList.remove('border-transparent', 'text-gray-400');
            activeBtn.classList.add(isBT ? 'border-blue-500' : 'border-green-500', isBT ? 'text-blue-400' : 'text-green-400', 'font-bold');
            
            if(tab === 'sessions' || tab === 'balance-history') {
                const badge = document.getElementById('active-account-badge');
                if (badge) badge.classList.add('hidden');
            } else {
                if (isGlobalMetricsView || activeRealAccountId || activeSessionId) {
                    const badge = document.getElementById('active-account-badge');
                    if (badge) badge.classList.remove('hidden');
                }
            }
            
            if(tab !== 'sessions' && tab !== 'balance-history' && !isGlobalMetricsView && (!activeRealAccountId && !activeSessionId)) { switchTab('sessions'); showToast("Entra a una cuenta primero", true); return; }
            if (tab === "balance-history") renderRealBalanceHistory();
            if (tab === 'monthly') {
                const root = document.documentElement;
                const previousScrollBehavior = root.style.scrollBehavior;
                root.style.scrollBehavior = "auto";
                window.scrollTo(0, 0);
                root.style.scrollBehavior = previousScrollBehavior;
                requestAnimationFrame(fitMonthlyCalendarGrid);
            }
            if (tab === 'sessions' && groupBalanceChartInstance) {
                requestAnimationFrame(() => { if (groupBalanceChartInstance) groupBalanceChartInstance.resize(); });
            }
            currentTabName = tab;
            updateBalanceHistoryTabVisibility();
        }

        function configureTradePairField(sessionId = null, fallbackPair = "") {
            const input = document.getElementById("inputPar");
            const label = document.getElementById("tradePairLabel");
            const managerButton = document.getElementById("tradePairManagerButton");
            if (currentMode !== "backtesting") {
                input.disabled = false;
                label.textContent = "Activo / Par";
                managerButton.classList.remove("hidden");
                return;
            }

            const session = backtestSessions.find(item => String(item.id) === String(sessionId));
            const pair = String(session?.pair || fallbackPair || "").toUpperCase();
            if (pair && !Array.from(input.options).some(option => option.value === pair)) {
                input.innerHTML += `<option value="${pair}">${pair}</option>`;
            }
            if (pair) input.value = pair;
            input.disabled = true;
            label.textContent = "Activo / Par (fijo de la sesión)";
            managerButton.classList.add("hidden");
        }

        function openTradeModal(id = null, latestMultiEntryId = null) {
            editingLatestMultiEntryId = latestMultiEntryId;
            clearEditReplicatedContext();
            isGlobalTradeContext = false;
            sessionFieldManuallyEdited = false;
            
            document.getElementById("tradeForm").reset();
            document.getElementById("tradeId").value = "";
            configureRiskInputForMode();
            document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-pen-to-square ${currentMode === 'backtesting' ? 'text-blue-500' : 'text-green-500'}"></i> Nueva Entrada de Trading`;
            document.getElementById("quickTradeAlert").classList.add('hidden');
            document.getElementById("globalTradeSelectButton").classList.add("hidden");
            document.getElementById("globalTradeAccountPanel").classList.add("hidden");
            updateMt5TradeHint(null);
            currentUploadedImagesAntes = []; currentUploadedImagesDespues = [];
            document.getElementById("imagesPreviewAntes").innerHTML = ""; document.getElementById("imagesPreviewDespues").innerHTML = "";
            document.getElementById("parcialCustomContainer").classList.add("hidden");
            quickTradeContextId = null;
            configureTradePairField();

            if (id) {
                const t = latestMultiEntryId
                    ? trades.find(x => String(x.id) === String(id) && x.multiEntryId === latestMultiEntryId)
                    : getBaseTrades().find(x => String(x.id) === String(id));
                if (t) {
                    document.getElementById("tradeId").value = t.id;
                    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-pen-to-square text-amber-500"></i> Editar Operación`;
                    document.getElementById("inputFecha").value = t.fecha;
                    document.getElementById("inputHora").value = t.hora;
                    
                    const parEl = document.getElementById("inputPar");
                    if(t.par && !Array.from(parEl.options).some(o => o.value === t.par)) {
                        parEl.innerHTML += `<option value="${t.par}">${t.par}</option>`;
                    }
                    parEl.value = t.par || "EURUSD";
                    if (currentMode === "backtesting") configureTradePairField(t.sessionId, t.par);
                    
                    document.getElementById("inputSesion").value = t.sesion;
                    document.getElementById("inputTendencia").value = t.tendencia;
                    document.getElementById("inputPipsSL").value = t.pipsSL;
                    document.getElementById("inputPipsTP").value = t.pipsTP;
                    document.getElementById("inputRR").value = t.rr;
                    document.getElementById("inputOrden").value = t.orden;
                    setTradeRiskValue(t.riesgo);
                    document.getElementById("inputEstado").value = t.estado;
                    document.getElementById("inputNotaAntes").value = t.notaAntes || "";
                    document.getElementById("inputNotaDespues").value = t.notaDespues || "";
                    document.getElementById("inputLinkAntes").value = t.linkAntes || "";
                    document.getElementById("inputLinkDespues").value = t.linkDespues || "";
                    updateMt5TradeHint(t.mt5);

                    if(t.estado === 'Parcial' && t.resultadoParcial !== undefined) {
                        document.getElementById("parcialCustomContainer").classList.remove("hidden");
                        document.getElementById("inputResultadoParcial").value = t.resultadoParcial;
                    }
                    if (t.imagenesAntes) { currentUploadedImagesAntes = [...t.imagenesAntes]; renderImagePreviewsAntes(); }
                    if (t.imagenesDespues) { currentUploadedImagesDespues = [...t.imagenesDespues]; renderImagePreviewsDespues(); }

                    const linkedTrades = getEditReplicatedMembers(t);
                    if (linkedTrades.length > 1) {
                        editReplicatedSourceId = String(t.id);
                        editReplicatedMembers = linkedTrades;
                        editReplicatedSelectedIds = latestMultiEntryId
                            ? linkedTrades.map(trade => String(trade.id))
                            : [editReplicatedSourceId];
                        editReplicatedSelectionConfirmed = true;
                        document.getElementById("editReplicatedAlert").classList.remove("hidden");
                        renderEditReplicatedSelector();
                        updateEditReplicatedSummary();
                    }
                }
            } else {
                if (currentMode === "backtesting") {
                    document.getElementById("inputFecha").value = getBacktestEntryReferenceDate(activeSessionId) || new Date().toISOString().split('T')[0];
                    document.getElementById("inputHora").value = "09:00";
                    applyBacktestSessionSuggestion();
                } else {
                    setRealTradeTimeDefaults();
                }
                
                const list = currentMode === 'real' ? realAccounts : backtestSessions;
                const item = list.find(x => x.id === (currentMode === 'real' ? activeRealAccountId : activeSessionId));
                if (item && item.pair) document.getElementById("inputPar").value = item.pair;
                if (currentMode === "backtesting") configureTradePairField(activeSessionId, item?.pair);
            }
            calculateRR();
            calculatePositionSize();
            document.getElementById("tradeModal").classList.remove("hidden");
        }

        function closeTradeModal() { 
            document.getElementById("tradeModal").classList.add("hidden"); 
            isGlobalTradeContext = false;
            editingLatestMultiEntryId = null;
            globalMetricsEditingEntryId = null;
            clearEditReplicatedContext();
        }

        function toggleParcialInput() { document.getElementById("parcialCustomContainer").classList.toggle("hidden", document.getElementById("inputEstado").value !== "Parcial"); }

        function getTradeRiskValue() {
            const selectedRisk = document.getElementById("inputRiesgo").value;
            const riskValue = currentMode === "real" && selectedRisk === "custom"
                ? parseFloat(document.getElementById("inputRiesgoPersonalizado").value)
                : parseFloat(selectedRisk);
            return Number.isFinite(riskValue) ? riskValue : 0;
        }

        function handleRiskSelection() {
            const isCustomRisk = currentMode === "real" && document.getElementById("inputRiesgo").value === "custom";
            const customContainer = document.getElementById("customRiskContainer");
            const customInput = document.getElementById("inputRiesgoPersonalizado");
            customContainer.classList.toggle("hidden", !isCustomRisk);
            customInput.required = isCustomRisk;
            calculatePositionSize();
        }

        function configureRiskInputForMode() {
            const isReal = currentMode === "real";
            const riskSelect = document.getElementById("inputRiesgo");
            document.getElementById("customRiskOption").hidden = !isReal;
            if (!isReal && riskSelect.value === "custom") riskSelect.value = "1.0";
            if (!isReal) document.getElementById("inputRiesgoPersonalizado").value = "";
            handleRiskSelection();
        }

        function setTradeRiskValue(value) {
            const riskSelect = document.getElementById("inputRiesgo");
            const customInput = document.getElementById("inputRiesgoPersonalizado");
            const parsedRisk = Number(value);
            const matchingOption = Array.from(riskSelect.options).find(option => Number(option.value) === parsedRisk);
            if (currentMode === "real" && parsedRisk > 0 && !matchingOption) {
                riskSelect.value = "custom";
                customInput.value = parsedRisk;
            } else {
                riskSelect.value = matchingOption ? matchingOption.value : "1.0";
                customInput.value = "";
            }
            handleRiskSelection();
        }

        function calculateRR() {
            const sl = parseFloat(document.getElementById("inputPipsSL").value), tp = parseFloat(document.getElementById("inputPipsTP").value);
            document.getElementById("inputRR").value = (sl > 0 && tp > 0) ? (tp / sl).toFixed(2) : "0.00";
            calculatePositionSize();
        }

        function getPipValuePerLot(pair) {
            const symbol = (pair || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
            const commonValues = {
                EURUSD: 10, GBPUSD: 10, AUDUSD: 10, NZDUSD: 10,
                USDJPY: 6.7, GBPJPY: 6.7, USDCAD: 7.4, USDCHF: 11.2,
                XAUUSD: 1, US30: 1, US100: 1, BTCUSD: 1
            };
            if (commonValues[symbol]) return commonValues[symbol];
            if (symbol.endsWith("USD") && symbol.length === 6) return 10;
            return null;
        }

        function getEntrySizingBalance(groupId = null) {
            const selectedId = groupId || quickTradeContextId || (currentMode === "real" ? activeRealAccountId : activeSessionId);
            const groups = currentMode === "real" ? realAccounts : backtestSessions;
            const group = groups.find(item => item.id === selectedId);
            if (!group) return getActiveInitialBalance();
            // El riesgo (%) siempre se calcula sobre el Balance Inicial, nunca sobre el Balance Actual.
            return currentMode === "real" ? getRealInitialBalance(group) : (parseFloat(group.balance) || 10000);
        }

        function calculateLotSize(pair, stopPips, riskPct, balance) {
            const sl = parseFloat(stopPips), risk = parseFloat(riskPct), accountBalance = parseFloat(balance);
            const pipValue = getPipValuePerLot(pair);
            if (!pipValue || !(sl > 0) || !(risk > 0) || !(accountBalance > 0)) return null;
            const rawLots = (accountBalance * (risk / 100)) / (sl * pipValue);
            const roundedLots = Math.floor((rawLots + 1e-9) * 100) / 100;
            return roundedLots >= 0.01 ? roundedLots : null;
        }

        function calculatePositionSize() {
            const output = document.getElementById("inputLotajeCalc");
            const help = document.getElementById("inputLotajeHelp");
            if (!output || !help) return null;
            if (isGlobalTradeContext) {
                output.textContent = "Por cuenta";
                help.textContent = "La cantidad se calcula por separado usando el balance de cada cuenta.";
                return null;
            }
            const pair = document.getElementById("inputPar").value;
            const sl = parseFloat(document.getElementById("inputPipsSL").value);
            const risk = getTradeRiskValue();
            const balance = getEntrySizingBalance();
            const pipValue = getPipValuePerLot(pair);
            const lotSize = calculateLotSize(pair, sl, risk, balance);
            if (!pipValue) {
                output.textContent = "N/D";
                help.textContent = "No hay una especificación automática para este activo.";
            } else if (!(sl > 0)) {
                output.textContent = "—";
                help.textContent = "Ingresa el stop loss para calcular el tamaño.";
            } else if (!lotSize) {
                output.textContent = "< 0.01";
                help.textContent = `El tamaño mínimo calculado es menor a 0.01 lotes. Riesgo: $${(balance * risk / 100).toFixed(2)}.`;
            } else {
                output.textContent = `${lotSize.toFixed(2)} lotes`;
                help.textContent = `Riesgo aprox. $${(balance * risk / 100).toFixed(2)} · valor pip asumido: $${pipValue}/lote.`;
            }
            return lotSize;
        }

        async function previewImagesAntes(e) {
            const files = e.target.files;
            for (let f of files) { const comp = await compressImage(f); currentUploadedImagesAntes.push(comp); }
            renderImagePreviewsAntes();
        }
        function renderImagePreviewsAntes() {
            document.getElementById("imagesPreviewAntes").innerHTML = currentUploadedImagesAntes.map((src, i) => `
                <div class="relative inline-block mt-2 group">
                    <img src="${src}" class="w-16 h-16 object-cover rounded border border-gray-600 cursor-pointer" onclick="openLightbox('${src}')">
                    <button type="button" onclick="removeImgAntes(${i})" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `).join('');
        }
        function removeImgAntes(i) { currentUploadedImagesAntes.splice(i, 1); renderImagePreviewsAntes(); }

        async function previewImagesDespues(e) {
            const files = e.target.files;
            for (let f of files) { const comp = await compressImage(f); currentUploadedImagesDespues.push(comp); }
            renderImagePreviewsDespues();
        }
        function renderImagePreviewsDespues() {
            document.getElementById("imagesPreviewDespues").innerHTML = currentUploadedImagesDespues.map((src, i) => `
                <div class="relative inline-block mt-2 group">
                    <img src="${src}" class="w-16 h-16 object-cover rounded border border-gray-600 cursor-pointer" onclick="openLightbox('${src}')">
                    <button type="button" onclick="removeImgDespues(${i})" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `).join('');
        }
        function removeImgDespues(i) { currentUploadedImagesDespues.splice(i, 1); renderImagePreviewsDespues(); }

        async function saveTrade(e) {
            e.preventDefault();
            const wasGlobalTradeContext = isGlobalTradeContext;
            const finishingLatestMultiEntryId = editingLatestMultiEntryId;
            const list = currentMode === 'real' ? realAccounts : backtestSessions;
            const selectedAccounts = wasGlobalTradeContext
                ? list.filter(account => globalTradeAccountIds.some(id => String(id) === String(account.id)))
                : [];
            if (wasGlobalTradeContext && !globalTradeSelectionConfirmed) {
                document.getElementById("globalTradeAccountPanel").classList.remove("hidden");
                showToast("Acepta la selección de cuentas antes de guardar", true);
                return;
            }
            if (wasGlobalTradeContext && selectedAccounts.length === 0) {
                document.getElementById("globalTradeAccountPanel").classList.remove("hidden");
                showToast("Selecciona al menos una cuenta para replicar la entrada", true);
                return;
            }
            const idVal = document.getElementById("tradeId").value;
            const existingTradeForPair = idVal ? trades.find(trade => String(trade.id) === String(idVal)) : null;
            const mt5KeepMeta = existingTradeForPair && existingTradeForPair.mt5 && existingTradeForPair.mt5.auto ? existingTradeForPair.mt5 : null;
            if (mt5KeepMeta) {
                // Los datosMT2 son la verdad para estas operaciones: el usuario solo
                // edita análisis/capturas, el registro conserva lotaje/pips/precios reales.
                if (mt5KeepMeta.par) baseTrade.par = mt5KeepMeta.par;
                if (mt5KeepMeta.orden) baseTrade.orden = mt5KeepMeta.orden;
                if (Number(mt5KeepMeta.lotaje) > 0) baseTrade.lotaje = Number(mt5KeepMeta.lotaje);
                if (Number.isFinite(Number(mt5KeepMeta.pipsSL))) baseTrade.pipsSL = Number(mt5KeepMeta.pipsSL);
                if (Number.isFinite(Number(mt5KeepMeta.pipsTP))) baseTrade.pipsTP = Number(mt5KeepMeta.pipsTP);
                if (Number.isFinite(Number(mt5KeepMeta.rr))) baseTrade.rr = Number(mt5KeepMeta.rr);
                if (Number.isFinite(Number(mt5KeepMeta.riesgo))) baseTrade.riesgo = Number(mt5KeepMeta.riesgo);
                if (mt5KeepMeta.fecha) baseTrade.fecha = mt5KeepMeta.fecha;
                if (mt5KeepMeta.hora) baseTrade.hora = mt5KeepMeta.hora;
            }
            const backtestSessionId = existingTradeForPair?.sessionId || quickTradeContextId || activeSessionId;
            const backtestPair = currentMode === "backtesting"
                ? String(backtestSessions.find(session => String(session.id) === String(backtestSessionId))?.pair || "").toUpperCase()
                : "";
            if (currentMode === "backtesting" && !backtestPair) {
                showToast("Selecciona un activo al crear la sesión antes de registrar operaciones", true);
                return;
            }
            const isReplicatedEdit = !wasGlobalTradeContext && Boolean(idVal) && editReplicatedSourceId === String(idVal) && editReplicatedMembers.length > 1;
            const selectedReplicatedTrades = isReplicatedEdit
                ? trades.filter(trade => editReplicatedSelectedIds.includes(String(trade.id)))
                : [];
            if (isReplicatedEdit && !editReplicatedSelectionConfirmed) {
                document.getElementById("editReplicatedPanel").classList.remove("hidden");
                showToast("Acepta la selección de copias antes de guardar", true);
                return;
            }
            
            const baseTrade = {
                fecha: document.getElementById("inputFecha").value,
                hora: document.getElementById("inputHora").value,
                par: currentMode === "backtesting" ? backtestPair : document.getElementById("inputPar").value.toUpperCase(),
                sesion: document.getElementById("inputSesion").value,
                tendencia: document.getElementById("inputTendencia").value,
                pipsSL: parseFloat(document.getElementById("inputPipsSL").value),
                pipsTP: parseFloat(document.getElementById("inputPipsTP").value),
                rr: parseFloat(document.getElementById("inputRR").value),
                orden: document.getElementById("inputOrden").value,
                riesgo: getTradeRiskValue(),
                estado: document.getElementById("inputEstado").value,
                lotaje: calculatePositionSize(),
                notaAntes: document.getElementById("inputNotaAntes").value,
                notaDespues: document.getElementById("inputNotaDespues").value,
                linkAntes: document.getElementById("inputLinkAntes").value.trim(),
                linkDespues: document.getElementById("inputLinkDespues").value.trim(),
            };
            if(baseTrade.estado === 'Parcial') baseTrade.resultadoParcial = parseFloat(document.getElementById("inputResultadoParcial").value) || 0;

            if (globalMetricsEditingEntryId !== null) {
                const globalIndex = globalMetricsEntries.findIndex(entry => Number(entry.globalId) === Number(globalMetricsEditingEntryId));
                if (globalIndex === -1) {
                    globalMetricsEditingEntryId = null;
                    closeTradeModal();
                    showToast("No se encontró la copia global", true);
                    return;
                }
                const existingGlobalEntry = globalMetricsEntries[globalIndex];
                const updatedGlobalEntry = {
                    ...existingGlobalEntry,
                    ...baseTrade,
                    id: existingGlobalEntry.id,
                    accountId: existingGlobalEntry.accountId,
                    sessionId: existingGlobalEntry.sessionId,
                    lotaje: existingGlobalEntry.lotaje,
                    globalId: existingGlobalEntry.globalId,
                    sourceKey: existingGlobalEntry.sourceKey,
                    globalEdited: true,
                    imagenesAntes: [...currentUploadedImagesAntes],
                    imagenesDespues: [...currentUploadedImagesDespues]
                };
                if (baseTrade.estado !== "Parcial") delete updatedGlobalEntry.resultadoParcial;
                globalMetricsEntries[globalIndex] = updatedGlobalEntry;
                await saveGlobalMetricsStore();
                globalMetricsEditingEntryId = null;
                closeTradeModal();
                renderAll();
                showToast("Copia global actualizada sin cambiar las cuentas de origen");
                return;
            }

            let replicatedEditCount = 0;
            if (wasGlobalTradeContext) {
                const baseId = Date.now();
                const multiEntryId = `multi-${baseId}`;
                
                selectedAccounts.forEach((account, index) => {
                    const newTrade = {
                        ...baseTrade,
                        id: baseId + index,
                        multiEntryId,
                        multiEntryCreatedAt: baseId,
                        multiEntryEditCompleted: false,
                        accountId: currentMode === 'real' ? account.id : null,
                        sessionId: currentMode === 'backtesting' ? account.id : null,
                        lotaje: calculateLotSize(baseTrade.par, baseTrade.pipsSL, baseTrade.riesgo, getEntrySizingBalance(account.id)),
                        imagenesAntes: [...currentUploadedImagesAntes],
                        imagenesDespues: [...currentUploadedImagesDespues]
                    };
                    trades.push(newTrade);
                });
            } else {
                const existingTrade = idVal ? trades.find(trade => String(trade.id) === String(idVal)) : null;
                const hasSelectedCopies = isReplicatedEdit && selectedReplicatedTrades.some(trade => String(trade.id) !== editReplicatedSourceId);

                if (hasSelectedCopies && existingTrade) {
                    const multiEntryId = existingTrade.multiEntryId || `multi-${Date.now()}-${existingTrade.id}`;
                    selectedReplicatedTrades.forEach(target => {
                        const idx = trades.findIndex(trade => String(trade.id) === String(target.id));
                        if (idx === -1) return;
                        const current = trades[idx];
                        const targetGroupId = currentMode === "real" ? current.accountId : current.sessionId;
                        const updatedTrade = {
                            ...current,
                            ...baseTrade,
                            id: current.id,
                            multiEntryId,
                            accountId: current.accountId,
                            sessionId: current.sessionId,
                            lotaje: calculateLotSize(baseTrade.par, baseTrade.pipsSL, baseTrade.riesgo, getEntrySizingBalance(targetGroupId)),
                            imagenesAntes: [...currentUploadedImagesAntes],
                            imagenesDespues: [...currentUploadedImagesDespues]
                        };
                        if (baseTrade.estado === "Parcial") updatedTrade.resultadoParcial = baseTrade.resultadoParcial;
                        else delete updatedTrade.resultadoParcial;
                        trades[idx] = updatedTrade;
                    });
                    // En operaciones antiguas sin identificador, vincula las copias que se seleccionaron.
                    editReplicatedMembers.forEach(member => {
                        if (!editReplicatedSelectedIds.includes(String(member.id))) return;
                        const idx = trades.findIndex(trade => String(trade.id) === String(member.id));
                        if (idx !== -1) trades[idx].multiEntryId = multiEntryId;
                    });
                    replicatedEditCount = selectedReplicatedTrades.length;
                } else {
                    const newTrade = {
                        ...(existingTrade || {}),
                        ...baseTrade,
                        id: existingTrade ? existingTrade.id : (idVal ? parseInt(idVal) : Date.now()),
                        accountId: existingTrade ? existingTrade.accountId : (currentMode === 'real' ? (quickTradeContextId || activeRealAccountId) : null),
                        sessionId: existingTrade ? existingTrade.sessionId : (currentMode === 'backtesting' ? (quickTradeContextId || activeSessionId) : null),
                        imagenesAntes: [...currentUploadedImagesAntes],
                        imagenesDespues: [...currentUploadedImagesDespues]
                    };
                    if (baseTrade.estado !== "Parcial") delete newTrade.resultadoParcial;

                    if (idVal) {
                        const idx = trades.findIndex(t => String(t.id) === String(newTrade.id));
                        if (idx !== -1) trades[idx] = newTrade;
                    } else {
                        trades.push(newTrade);
                    }
                }
            }

            if (finishingLatestMultiEntryId) {
                const latestGroupMembers = trades.filter(trade => trade.multiEntryId === finishingLatestMultiEntryId);
                const allCopiesSelected = latestGroupMembers.length === 1
                    ? String(latestGroupMembers[0].id) === String(idVal)
                    : isReplicatedEdit && latestGroupMembers.length > 1 && latestGroupMembers.every(trade => editReplicatedSelectedIds.includes(String(trade.id)));
                if (allCopiesSelected) latestGroupMembers.forEach(trade => { trade.multiEntryEditCompleted = true; });
            }

            await saveToStorage();
            closeTradeModal();
            showToast(wasGlobalTradeContext
                ? `Entrada múltiple guardada en ${selectedAccounts.length} cuentas`
                : (replicatedEditCount > 1 ? `Cambios aplicados a ${replicatedEditCount} operaciones` : "Operación Guardada"));
            
            if (wasGlobalTradeContext || (quickTradeContextId && ((currentMode === 'real' && !activeRealAccountId) || (currentMode === 'backtesting' && !activeSessionId)))) {
                renderGroups(); 
            }
        }

        async function deleteTrade(id) {
            if (confirm("¿Estás seguro de eliminar esta operación?")) {
                const removedTrade = trades.find(trade => String(trade.id) === String(id));
                trades = trades.filter(t => t.id !== id);
                addMt5TombstoneFromTrade(removedTrade);
                await saveMt5Runtime();
                if (typeof deleteFromCloud === "function") deleteFromCloud("trade", id);
                await saveToStorage();
                showToast("Operación Eliminada");
            }
        }

        function getTradeOutcome(t) {
            const r = parseFloat(t.riesgo) || 1.0, rr = parseFloat(t.rr) || 0;
            // Prioridad: P/L neto real medido por MT5 (profit + comisiones + swap)
            // sobre Balance Inicial. Cubre Full TP, SL, Parcial y Cierre manual.
            const mt5Outcome = t && t.mt5 ? parseFloat(t.mt5.resultPct) : NaN;
            if (Number.isFinite(mt5Outcome) && ["Full TP", "SL", "BE", "Parcial", "Cierre manual"].includes(t.estado)) {
                return mt5Outcome;
            }
            if (t.estado === "Full TP") return r * rr;
            if (t.estado === "SL") return -r;
            if (t.estado === "Cierre manual") return 0;
            if (t.estado === "Parcial") {
                const partialOutcome = t.resultadoParcial !== undefined ? parseFloat(t.resultadoParcial) : 1.0;
                return Number.isFinite(partialOutcome) ? partialOutcome : 0.0;
            }
            return 0.0;
        }

        function isResolvedTrade(t) {
            return ["Full TP", "SL", "BE", "Parcial", "Cierre manual"].includes(t.estado);
        }

        function populatePairDropdowns() {
            const configuredPairs = currentMode === "backtesting" ? backtestPairsList : customPairsList;
            const activeSessionPair = currentMode === "backtesting" && activeSessionId
                ? backtestSessions.find(session => String(session.id) === String(activeSessionId))?.pair
                : "";
            const allPairs = [...new Set([...configuredPairs, ...getBaseTrades().map(t => (t.par || "EURUSD").toUpperCase()), activeSessionPair].filter(Boolean))].sort();
            
            const filter = document.getElementById("filterPar"), currentF = filter.value;
            filter.innerHTML = '<option value="ALL">Todos los Activos</option>' + allPairs.map(p => `<option value="${p}">${p}</option>`).join('');
            if(allPairs.includes(currentF) || currentF === "ALL") filter.value = currentF;

            const input = document.getElementById("inputPar"), currentI = input ? input.value : "";
            if (input) {
                input.innerHTML = allPairs.map(p => `<option value="${p}">${p}</option>`).join('');
                input.value = allPairs.includes(currentI) ? currentI : (allPairs.includes("EURUSD") ? "EURUSD" : allPairs[0]);
            }
        }

        function populateSessionPairDropdown(selectedPair = "") {
            const input = document.getElementById("inputSessionPair");
            if (!input) return;
            const selected = String(selectedPair || input.value || "").toUpperCase();
            const pairs = [...new Set([...backtestPairsList, selected].filter(Boolean))].sort();
            input.innerHTML = pairs.map(pair => `<option value="${pair}">${pair}</option>`).join('');
            input.value = pairs.includes(selected) ? selected : (pairs.includes("EURUSD") ? "EURUSD" : pairs[0] || "");
            input.disabled = false;
        }

        function applyFilters() { renderTable(); }

        // ACTUALIZACIÓN DE MÉTRICAS Y GRÁFICOS (Reglas de % y Saldo Exacto)
        function updateMetricsAndCharts() {
                        const type = document.getElementById("dashboardPeriodType").value;
            const yearVal = document.getElementById("dashboardPeriodYear").value;
            const monthVal = document.getElementById("dashboardPeriodMonth").value;
            const subVal = document.getElementById("dashboardPeriodSub").value;
            const activeTrades = getBaseTrades().filter(t => isResolvedTrade(t) && checkPeriodMatch(t.fecha, type, yearVal, monthVal, subVal));
            const isGlobal = isGlobalMetricsView;

            let initialBalance = isGlobal ? 0 : getActiveInitialBalance();
            const activeRealAccount = !isGlobal && currentMode === 'real' && activeRealAccountId
                ? realAccounts.find(account => String(account.id) === String(activeRealAccountId))
                : null;
            const effectiveStatus = activeRealAccount ? getAccountEffectiveBalance(activeRealAccount) : null;
            
            let calculatedCurrentBalance = initialBalance;
            let totalAcumPct = 0;
            
            let wins = 0, losses = 0, breakeven = 0;
            let grossProfit = 0, grossLoss = 0;
            let peak = initialBalance;
            let maxDrawdownDollar = 0;
            let peakReturnPct = 0;
            let maxDrawdownGlobalPct = 0;
            let bestPct = -Infinity, worstPct = Infinity;
            let totalRR = 0, countRR = 0;
            
            let equityData = [initialBalance];
            let equityLabels = ["Inicio"];
            
            let pairsData = {}, daysData = {}, sessionsData = {}, trendsData = {};
            // Efectividad: ganadoras / operaciones cerradas, incluyendo los BE en el denominador.
            const addBreakdown = (data, key, outcomePct) => {
                const label = (key == null || String(key).trim() === "") ? "N/A" : String(key).trim();
                if (!data[label]) data[label] = { wins: 0, losses: 0, breakeven: 0, total: 0 };
                const item = data[label];
                item.total++;
                if (outcomePct > 0) item.wins++;
                else if (outcomePct < 0) item.losses++;
                else item.breakeven++;
            };

            activeTrades.forEach(t => {
                let outcomePct = getTradeOutcome(t);
                totalAcumPct += outcomePct;
                
                let plDollar = initialBalance * (outcomePct / 100);
                if (isGlobal) {
                    calculatedCurrentBalance = totalAcumPct;
                    peakReturnPct = Math.max(peakReturnPct, calculatedCurrentBalance);
                    maxDrawdownGlobalPct = Math.max(maxDrawdownGlobalPct, peakReturnPct - calculatedCurrentBalance);
                } else {
                    calculatedCurrentBalance += plDollar;
                    if (calculatedCurrentBalance > peak) peak = calculatedCurrentBalance;
                    let ddDollar = peak - calculatedCurrentBalance;
                    if (ddDollar > maxDrawdownDollar) maxDrawdownDollar = ddDollar;
                }

                if (outcomePct > bestPct) bestPct = outcomePct;
                if (outcomePct < worstPct) worstPct = outcomePct;

                if (outcomePct > 0) wins++;
                else if (outcomePct < 0) losses++;
                else breakeven++;
                if (outcomePct > 0) grossProfit += outcomePct;
                else if (outcomePct < 0) grossLoss += Math.abs(outcomePct);

                if (t.rr > 0) { totalRR += t.rr; countRR++; }

                equityData.push(isGlobal ? totalAcumPct : calculatedCurrentBalance);
                equityLabels.push(t.fecha);

                // Acumulación en Porcentajes para las listas
                addBreakdown(pairsData, (t.par || "N/A").toUpperCase(), outcomePct);

                let d = new Date(t.fecha+"T00:00:00").getDay();
                let dayName = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d];
                addBreakdown(daysData, dayName, outcomePct);

                addBreakdown(sessionsData, t.sesion, outcomePct);

                addBreakdown(trendsData, t.tendencia, outcomePct);
            });

            // Cuenta real sin filtro de periodo: retorno del balance efectivo contra el inicial.
            const useEffectiveBalance = !isGlobal && currentMode === 'real' && effectiveStatus && type === 'ALL';
            let finalReturnPct = useEffectiveBalance
                ? calculateAccountReturnPct(effectiveStatus.initial, effectiveStatus.balance)
                : totalAcumPct;

            // El balance efectivo se añade como último punto de la gráfica.
            if (useEffectiveBalance && Math.abs(effectiveStatus.balance - calculatedCurrentBalance) > 0.01) {
                equityData.push(effectiveStatus.balance);
                equityLabels.push("Balance efectivo");
            }

            let maxDrawdownPct = isGlobal ? maxDrawdownGlobalPct : (peak > 0 ? (maxDrawdownDollar / peak) * 100 : 0);

            // --- ACTUALIZACIÓN DE TARJETAS KPI (Todo en % puro) ---
            document.getElementById("kpi-return").textContent = (finalReturnPct > 0 ? "+" : "") + finalReturnPct.toFixed(2) + "%";
            document.getElementById("kpi-return").className = "text-2xl font-bold mt-1 " + (finalReturnPct > 0 ? "text-emerald-400" : (finalReturnPct < 0 ? "text-red-400" : "text-white"));

            let total = activeTrades.length;
            let winRate = total > 0 ? (wins / total) * 100 : 0;
            document.getElementById("kpi-winrate").textContent = winRate.toFixed(1) + "%";
            document.getElementById("kpi-trades-count").textContent = `${activeTrades.length} trades · ${wins}G / ${losses}P / ${breakeven}BE`;

            // Profit Factor = ganancias brutas / pérdidas brutas; los BE no alteran el cociente.
            let avgRR = countRR > 0 ? (totalRR / countRR) : 0;
            const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : null);
            const profitFactorEl = document.getElementById("kpi-edge");
            profitFactorEl.textContent = profitFactor === null ? "—" : (Number.isFinite(profitFactor) ? `${profitFactor.toFixed(2)}x` : "∞");
            profitFactorEl.className = "text-2xl font-bold mt-1 " + (profitFactor === null ? "text-gray-200" : (profitFactor >= 1 ? "text-emerald-400" : "text-red-400"));
            document.getElementById("kpi-avg-rr").textContent = "1:" + avgRR.toFixed(1);

            document.getElementById("kpi-drawdown").textContent = maxDrawdownPct.toFixed(2) + "%";
            document.getElementById("kpi-drawdown-dollar").textContent = ""; // Se eliminó la etiqueta de dólares del drawdown

            document.getElementById("kpi-best-trade").textContent = bestPct !== -Infinity ? "+" + bestPct.toFixed(2) + "%" : "0.00%";
            document.getElementById("kpi-worst-trade").textContent = worstPct !== Infinity ? "Peor: " + worstPct.toFixed(2) + "%" : "Peor: 0.00%";

            // Función para renderizar listas en %
            function renderList(dataObj, elementId) {
                let html = "";
                const sorted = Object.keys(dataObj).sort((a, b) => {
                    const aN = dataObj[a].total;
                    const bN = dataObj[b].total;
                    const aRate = aN ? dataObj[a].wins / aN : -1;
                    const bRate = bN ? dataObj[b].wins / bN : -1;
                    return bRate - aRate || dataObj[b].total - dataObj[a].total;
                });
                sorted.forEach(k => {
                    const item = dataObj[k];
                    const rate = item.total ? (item.wins / item.total) * 100 : 0;
                    const color = item.wins + item.losses === 0 ? "text-amber-300" : (rate >= 50 ? "text-emerald-400" : "text-red-400");
                    html += `<div class="flex justify-between items-center gap-3 bg-gray-900/60 border border-main rounded-lg px-4 py-2.5 text-sm">
                                <span class="font-semibold text-gray-200 truncate">${k}</span>
                                <span class="flex items-center gap-3 shrink-0 text-right"><span class="text-xs text-gray-500">${item.wins}G/${item.losses}P${item.breakeven ? `/${item.breakeven}BE` : ''} · ${item.total} ops</span><strong class="font-mono ${color}">${rate.toFixed(1)}%</strong></span>
                             </div>`;
                });
                document.getElementById(elementId).innerHTML = html || '<div class="text-xs text-gray-500">Sin operaciones en este periodo</div>';
            }

            const pairMetricsTitle = document.getElementById("metrics-pair-title");
            const pairMetricsList = document.getElementById("metrics-pair-list");
            if (currentMode === "backtesting" && !isGlobal) {
                const activeSession = backtestSessions.find(session => String(session.id) === String(activeSessionId));
                const fixedPair = String(activeSession?.pair || "Sin definir").toUpperCase();
                pairMetricsTitle.innerHTML = '<i class="fa-solid fa-lock text-blue-400"></i> Activo fijo de la sesión';
                pairMetricsList.innerHTML = `
                    <div class="rounded-lg border border-blue-900/50 bg-blue-950/20 px-3 py-2">
                        <div class="text-[10px] uppercase tracking-wide text-blue-300">Par de backtesting</div>
                        <div class="mt-1 text-base font-bold text-white">${escapeGalleryHtml(fixedPair)}</div>
                    </div>
                    <p class="text-xs leading-relaxed text-gray-500">Las métricas corresponden a este único activo; no se compara un “mejor par”.</p>`;
            } else {
                pairMetricsTitle.innerHTML = '<i class="fa-solid fa-coins text-yellow-400"></i> Efectividad por Activo / Par';
                renderList(pairsData, "metrics-pair-list");
            }
            renderList(daysData, "metrics-day-list");
            renderList(sessionsData, "metrics-session-list");
            renderList(trendsData, "metrics-trend-list");

            // Gráfico mantenido en dólares como excepción solicitada
            const chartColors = getChartThemeColors();
            if(equityChartInstance) equityChartInstance.destroy();
            const ctxEq = document.getElementById('equityChart').getContext('2d');
            equityChartInstance = new Chart(ctxEq, {
                type: 'line',
                data: { labels: equityLabels, datasets: [{ label: isGlobal ? 'Retorno acumulado (%)' : 'Balance ($)', data: equityData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: chartColors.tick, callback: value => isGlobal ? `${Number(value).toFixed(1)}%` : value }, grid: { color: chartColors.grid } }, x: { ticks: { color: chartColors.tick, maxTicksLimit: 10 }, grid: { display: false } } } }
            });

            if(outcomesChartInstance) outcomesChartInstance.destroy();
            const ctxOut = document.getElementById('outcomesChart').getContext('2d');
            outcomesChartInstance = new Chart(ctxOut, {
                type: 'doughnut',
                data: { labels: ['Ganadas', 'Perdidas', 'BE'], datasets: [{ data: [wins, losses, breakeven], backgroundColor: ['#10b981', '#ef4444', '#6b7280'], borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartColors.tick } } }, cutout: '75%' }
            });
        }

        function fitMonthlyCalendarGrid() {
            const section = document.getElementById("section-monthly");
            const grid = document.getElementById("monthly-grid");
            if (!section || !grid || section.classList.contains("hidden")) return;

            grid.style.removeProperty("width");
            grid.style.removeProperty("height");
            grid.style.removeProperty("min-height");
            grid.style.removeProperty("aspect-ratio");
            if (!window.matchMedia("(min-width: 1024px)").matches) {
                return;
            }

            const availableWidth = Math.min(grid.getBoundingClientRect().width, 1400);
            const gridTop = grid.getBoundingClientRect().top + window.scrollY;
            const bottomReserve = 48;
            const availableHeight = Math.max(0, document.documentElement.clientHeight - gridTop - bottomReserve);
            const calendarRatio = 2.05;

            // Altura mínima segura para 3 filas sin comprimir tarjetas ni desbordar texto
            const minGridHeight = 490;
            const effectiveHeight = Math.max(availableHeight, minGridHeight);
            const width = Math.min(availableWidth, effectiveHeight * calendarRatio);

            grid.style.width = `${width}px`;
            if (availableHeight >= minGridHeight) {
                grid.style.height = `${width / calendarRatio}px`;
                grid.style.aspectRatio = "auto";
            } else {
                grid.style.minHeight = `${minGridHeight}px`;
                grid.style.height = "auto";
            }
        }

        function renderMonthlyPerformance() {
            const yearSelect = document.getElementById("monthlyYear");
            if (!yearSelect) return;
            const previousYear = yearSelect.value;
            const backtestStartDate = currentMode === "backtesting" ? getBacktestStartDate() : null;
            const backtestSessionContextId = backtestStartDate ? String(activeSessionId) : null;
            const shouldUseBacktestStartYear = Boolean(backtestStartDate) && monthlyCalendarSessionContextId !== backtestSessionContextId;
            const years = getAvailableYears();
            yearSelect.innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join("");
            yearSelect.value = shouldUseBacktestStartYear
                ? String(backtestStartDate.getFullYear())
                : (years.includes(parseInt(previousYear, 10)) ? previousYear : String(new Date().getFullYear()));
            monthlyCalendarSessionContextId = backtestSessionContextId;
            const year = parseInt(yearSelect.value, 10);
            const months = monthNames.map(name => ({
                name, wins: 0, losses: 0, breakeven: 0, total: 0, netPct: 0,
                grossProfit: 0, grossLoss: 0, dailyStats: {}, sessionStats: {}, bestTrade: null
            }));

            getBaseTrades().forEach(trade => {
                if (!isResolvedTrade(trade) || !trade.fecha) return;
                const date = new Date(trade.fecha + "T00:00:00");
                if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) return;
                const month = months[date.getMonth()];
                const outcome = getTradeOutcome(trade);
                month.total++;
                month.netPct += outcome;
                if (outcome > 0) {
                    month.wins++;
                    month.grossProfit += outcome;
                } else if (outcome < 0) {
                    month.losses++;
                    month.grossLoss += Math.abs(outcome);
                } else month.breakeven++;

                if (!month.bestTrade || outcome > month.bestTrade.outcome) month.bestTrade = { trade, outcome };

                const dayKey = trade.fecha;
                if (!month.dailyStats[dayKey]) month.dailyStats[dayKey] = { total: 0, netPct: 0 };
                month.dailyStats[dayKey].total++;
                month.dailyStats[dayKey].netPct += outcome;

                const sessionKey = trade.sesion || "Sin sesión";
                if (!month.sessionStats[sessionKey]) month.sessionStats[sessionKey] = { total: 0, wins: 0, losses: 0, breakeven: 0, netPct: 0 };
                const session = month.sessionStats[sessionKey];
                session.total++;
                session.netPct += outcome;
                if (outcome > 0) session.wins++;
                else if (outcome < 0) session.losses++;
                else session.breakeven++;
            });

            const tradedMonths = months.filter(month => month.total > 0);
            const hasEnoughMonths = tradedMonths.length >= 3;
            let bestMonth = hasEnoughMonths ? tradedMonths.reduce((best, month) => month.netPct > best.netPct ? month : best) : null;
            let worstMonth = hasEnoughMonths ? tradedMonths.reduce((worst, month) => month.netPct < worst.netPct ? month : worst) : null;
            if (bestMonth === worstMonth) {
                bestMonth = null;
                worstMonth = null;
            }
            const now = new Date();
            const highlightedYear = backtestStartDate ? backtestStartDate.getFullYear() : now.getFullYear();
            const highlightedMonthIndex = backtestStartDate ? backtestStartDate.getMonth() : now.getMonth();
            const formatPct = value => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

            document.getElementById("monthly-grid").innerHTML = months.map((month, monthIndex) => {
                const isMonthBE = month.total > 0 && Math.abs(month.netPct) < 0.005;
                const isBest = month === bestMonth;
                const isWorst = month === worstMonth;
                const isCurrentFallback = (!hasEnoughMonths || !bestMonth || !worstMonth) && year === highlightedYear && monthIndex === highlightedMonthIndex;
                const cardTone = isBest ? "monthly-month-best" : (isWorst ? "monthly-month-worst" : (isCurrentFallback ? "monthly-month-current" : (isMonthBE ? "monthly-month-be" : "monthly-month-empty")));
                const badge = (text, color) => `<span class="rounded-full border px-2 py-1 text-xs font-bold ${color}">${text}</span>`;
                let badges = "";
                if (isMonthBE) badges += badge("Mes BE", "border-amber-500/50 text-amber-300 bg-amber-900/30");
                const rate = month.total ? (month.wins / month.total) * 100 : 0;
                const netColor = month.netPct > 0.004 ? "text-emerald-400" : (month.netPct < -0.004 ? "text-red-400" : "text-amber-300");
                const netValue = month.total ? formatPct(month.netPct) : "—";
                const profitFactor = month.grossLoss > 0 ? month.grossProfit / month.grossLoss : (month.grossProfit > 0 ? Infinity : null);
                const profitFactorLabel = profitFactor === null ? "—" : (Number.isFinite(profitFactor) ? `${profitFactor.toFixed(2)}x` : "∞");
                const bestDay = Object.entries(month.dailyStats).reduce((best, [date, stats]) => !best || stats.netPct > best.stats.netPct ? { date, stats } : best, null);
                const bestSession = Object.entries(month.sessionStats).reduce((best, [name, stats]) => !best || stats.netPct > best.stats.netPct || (stats.netPct === best.stats.netPct && stats.total > best.stats.total) ? { name, stats } : best, null);
                const bestTradeValue = month.bestTrade ? formatPct(month.bestTrade.outcome) : "—";
                const bestTradeAsset = month.bestTrade && currentMode !== "backtesting" ? `${escapeGalleryHtml(month.bestTrade.trade.par || "Activo")} · ` : "";
                const bestTradeDate = month.bestTrade ? new Date(month.bestTrade.trade.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "";
                const bestTradeColor = month.bestTrade && month.bestTrade.outcome > 0 ? "text-emerald-300" : (month.bestTrade && month.bestTrade.outcome < 0 ? "text-red-300" : "text-amber-300");
                const bestDayLabel = bestDay ? new Date(bestDay.date + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "—";
                const bestSessionName = bestSession ? escapeGalleryHtml(bestSession.name) : "—";
                const bestSessionRate = bestSession && bestSession.stats.total ? (bestSession.stats.wins / bestSession.stats.total) * 100 : 0;
                                return `<article onclick="goToJournalMonth(${monthIndex}, ${year})" tabindex="0" aria-label="${month.name}: ${month.total} operaciones, retorno ${netValue}, efectividad ${rate.toFixed(1)} por ciento" class="monthly-month-card flex min-h-0 flex-col justify-between ${cardTone} border rounded-xl p-3 sm:p-3.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">

                    <div class="flex min-h-6 items-start justify-between gap-1.5 mb-1">
                        <h3 class="whitespace-nowrap text-base sm:text-lg font-bold text-white">${month.name}</h3>
                        <div class="flex max-w-[55%] flex-wrap justify-end gap-1">${badges}</div>
                    </div>
                    <div class="monthly-primary-metrics grid grid-cols-2 gap-x-3 gap-y-1 border-t border-gray-800/80 pt-1.5">
                        <div class="min-w-0">
                            <p class="text-[10px] sm:text-xs uppercase tracking-wide text-gray-400 font-medium">Retorno</p>
                            <p class="monthly-primary-value truncate text-xl sm:text-2xl font-bold ${netColor}">${netValue}</p>
                        </div>
                        <div class="min-w-0 text-right">
                            <p class="text-[10px] sm:text-xs uppercase tracking-wide text-gray-400 font-medium">Efectividad</p>
                            <p class="text-base sm:text-lg font-bold text-white">${month.total ? `${rate.toFixed(1)}%` : "—"}</p>
                        </div>
                        <div class="flex items-center justify-between gap-1 text-xs text-gray-400 pt-0.5">
                            <span>Operaciones</span><strong class="text-gray-200">${month.total}</strong>
                        </div>
                        <div class="flex items-center justify-end gap-1.5 text-xs text-gray-400 pt-0.5">
                            <span>PF</span><strong class="${profitFactor === null ? "text-gray-400" : "text-gray-200"}">${profitFactorLabel}</strong>
                        </div>
                    </div>
                    <div class="monthly-month-details text-sm text-gray-300">
                        <div class="grid grid-cols-2 gap-3">
                            <div class="rounded-lg border border-gray-700 bg-gray-950 p-3">
                                <span class="block text-xs uppercase tracking-wide text-gray-500">Mejor trade</span>
                                <strong class="block truncate text-base ${bestTradeColor}">${bestTradeValue}</strong>
                                <span class="block truncate text-xs text-gray-400">${bestTradeDate ? `${bestTradeAsset}${bestTradeDate} · ${escapeGalleryHtml(month.bestTrade.trade.estado || "")}` : "Sin operaciones"}</span>
                            </div>
                            <div class="rounded-lg border border-gray-700 bg-gray-950 p-3">
                                <span class="block text-xs uppercase tracking-wide text-gray-500">Mejor día</span>
                                <strong class="block truncate text-base ${bestDay && bestDay.stats.netPct < 0 ? "text-red-300" : "text-emerald-300"}">${bestDay ? formatPct(bestDay.stats.netPct) : "—"}</strong>
                                <span class="block truncate text-xs text-gray-400">${bestDay ? `${bestDayLabel} · ${bestDay.stats.total} ops` : "Sin operaciones"}</span>
                            </div>
                            <div class="rounded-lg border border-gray-700 bg-gray-950 p-3">
                                <span class="block text-xs uppercase tracking-wide text-gray-500">Mejor sesión</span>
                                <strong class="block truncate text-base text-indigo-200">${bestSessionName}</strong>
                                <span class="block truncate text-xs text-gray-400">${bestSession ? `${formatPct(bestSession.stats.netPct)} · ${bestSessionRate.toFixed(0)}% efect.` : "Sin operaciones"}</span>
                            </div>
                            <div class="rounded-lg border border-gray-700 bg-gray-950 p-3">
                                <span class="block text-xs uppercase tracking-wide text-gray-500">Distribución</span>
                                <strong class="block truncate text-base"><span class="text-emerald-400">${month.wins}G</span> / <span class="text-red-400">${month.losses}P</span> / <span class="text-amber-300">${month.breakeven}BE</span></strong>
                                <span class="block truncate text-xs text-gray-400">${month.total} operaciones cerradas</span>
                            </div>
                        </div>
                    </div>
                </article>`;
            }).join("");
            requestAnimationFrame(fitMonthlyCalendarGrid);
        }

        window.addEventListener("resize", fitMonthlyCalendarGrid, { passive: true });

        let balanceHistoryResizeTimer = null;
        window.addEventListener("resize", () => {
            const section = document.getElementById("section-balance-history");
            if (!realBalanceHistory.length || !section || section.classList.contains("hidden")) return;
            clearTimeout(balanceHistoryResizeTimer);
            balanceHistoryResizeTimer = setTimeout(() => renderRealBalanceHistory(), 120);
        }, { passive: true });

                function goToJournalMonth(monthIndex, year) {
            document.getElementById("filterPeriodoType").value = "MONTH";
            onJournalPeriodTypeChange();
            document.getElementById("filterPeriodoYear").value = year;
            document.getElementById("filterPeriodoMonth").value = monthIndex;
            applyFilters();
            switchTab('journal');
            showToast(`Mostrando operaciones de ${monthNames[monthIndex]} ${year}`);
        }

        function renderAll() {

            trades.sort((a, b) => new Date(a.fecha + "T" + a.hora) - new Date(b.fecha + "T" + b.hora));
            renderTable(); renderGallery(); updateMetricsAndCharts(); renderMonthlyPerformance();
            renderFondeoPanel();
            renderAccountGoalPanel();
            updateLatestMultiEntryButton();
        }

        // ===================== SIMULACIÓN DE FONDEO (solo backtesting) =====================
        const FONDEO_DEFAULTS = {
            phases: 2, target1: 8, target2: 5,
            dailyDD: 5, monthlyDD: null, maxDD: 10, riskPerTrade: null, ddType: "static",
            minTradingDays: 4, minProfitDays: 0,
            consistency: false, consistencyPct: 30,
            profitSplit: 80
        };

        function isFondeoSession(session) {
            return Boolean(session) && session.mode === "fondeo";
        }

        function getFondeoRules(session) {
            return { ...FONDEO_DEFAULTS, ...(session?.fondeo || {}) };
        }

        function getSelectedSessionMode() {
            const checked = document.querySelector('input[name="sessionMode"]:checked');
            return checked ? checked.value : "libre";
        }

        function toggleFondeoRules() {
            const isFondeo = getSelectedSessionMode() === "fondeo";
            document.getElementById("fondeoRulesContainer").classList.toggle("hidden", !isFondeo);
            document.getElementById("fondeoTarget2Container").classList.toggle("hidden", document.getElementById("inputFondeoPhases").value !== "2");
            document.getElementById("inputFondeoConsistencyPct").disabled = !document.getElementById("inputFondeoConsistency").checked;
        }

        function fillFondeoForm(session) {
            const rules = getFondeoRules(session);
            const setValue = (id, value) => { document.getElementById(id).value = value === null || value === undefined ? "" : value; };
            const mode = isFondeoSession(session) ? "fondeo" : "libre";
            document.querySelectorAll('input[name="sessionMode"]').forEach(input => { input.checked = input.value === mode; });
            setValue("inputFondeoPhases", String(rules.phases));
            setValue("inputFondeoSplit", rules.profitSplit);
            setValue("inputFondeoTarget1", rules.target1);
            setValue("inputFondeoTarget2", rules.target2);
            setValue("inputFondeoDailyDD", rules.dailyDD);
            setValue("inputFondeoMonthlyDD", rules.monthlyDD);
            setValue("inputFondeoMaxDD", rules.maxDD);
            setValue("inputFondeoRiskPerTrade", rules.riskPerTrade);
            setValue("inputFondeoDDType", rules.ddType);
            setValue("inputFondeoMinDays", rules.minTradingDays);
            setValue("inputFondeoMinProfitDays", rules.minProfitDays);
            document.getElementById("inputFondeoConsistency").checked = Boolean(rules.consistency);
            setValue("inputFondeoConsistencyPct", rules.consistencyPct);
            toggleFondeoRules();
        }

        function readFondeoForm() {
            const num = (id, fallback) => {
                const raw = document.getElementById(id).value;
                const value = parseFloat(raw);
                return raw === "" || !Number.isFinite(value) ? fallback : value;
            };
            const optionalLimit = id => {
                const value = num(id, null);
                return value !== null && value > 0 ? value : null;
            };
            return {
                phases: document.getElementById("inputFondeoPhases").value === "1" ? 1 : 2,
                target1: Math.max(0, num("inputFondeoTarget1", FONDEO_DEFAULTS.target1)),
                target2: Math.max(0, num("inputFondeoTarget2", FONDEO_DEFAULTS.target2)),
                dailyDD: optionalLimit("inputFondeoDailyDD"),
                monthlyDD: optionalLimit("inputFondeoMonthlyDD"),
                maxDD: optionalLimit("inputFondeoMaxDD"),
                riskPerTrade: optionalLimit("inputFondeoRiskPerTrade"),
                ddType: document.getElementById("inputFondeoDDType").value === "trailing" ? "trailing" : "static",
                minTradingDays: Math.max(0, Math.round(num("inputFondeoMinDays", 0))),
                minProfitDays: Math.max(0, Math.round(num("inputFondeoMinProfitDays", 0))),
                consistency: document.getElementById("inputFondeoConsistency").checked,
                consistencyPct: Math.min(100, Math.max(1, num("inputFondeoConsistencyPct", FONDEO_DEFAULTS.consistencyPct))),
                profitSplit: Math.min(100, Math.max(0, num("inputFondeoSplit", FONDEO_DEFAULTS.profitSplit)))
            };
        }

        function applyFondeoFormToSession(newItem, existing) {
            // Conserva el estado de la simulación (retiros, reinicios, celebraciones) al editar la sesión
            ["withdrawals", "celebratedPhases", "fondeoStartAfter", "notifiedFailureKey"].forEach(key => {
                if (existing && existing[key] !== undefined) newItem[key] = existing[key];
            });
            newItem.mode = getSelectedSessionMode();
            if (newItem.mode === "fondeo") {
                newItem.fondeo = readFondeoForm();
                if (!existing || !isFondeoSession(existing)) newItem.celebratedPhases = 0;
            }
        }

        function fondeoEventKey(fecha, hora) {
            return `${fecha || ""}T${hora || "00:00"}`;
        }

        function formatFondeoMoney(value) {
            return `$${(Number(value) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        function formatFondeoDate(fecha) {
            if (!fecha) return "—";
            const date = new Date(`${fecha}T00:00:00`);
            return Number.isNaN(date.getTime()) ? fecha : date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
        }

        function getFondeoPhaseLabel(index, rules) {
            return index < rules.phases ? `Fase ${index + 1}` : "Fondeada";
        }

        // Reproduce las operaciones de la sesión en orden y aplica las reglas del desafío.
        function simulateFondeo(session) {
            const rules = getFondeoRules(session);
            const base = Number(session.balance) || 10000;
            const startAfter = session.fondeoStartAfter || "";

            const events = [];
            trades.forEach(trade => {
                if (String(trade.sessionId) !== String(session.id) || !isResolvedTrade(trade) || !trade.fecha) return;
                events.push({ type: "trade", key: fondeoEventKey(trade.fecha, trade.hora), fecha: trade.fecha, trade, pnl: base * (getTradeOutcome(trade) / 100) });
            });
            (Array.isArray(session.withdrawals) ? session.withdrawals : []).forEach(withdrawal => {
                events.push({ type: "withdrawal", key: fondeoEventKey(withdrawal.fecha, "23:59:59"), fecha: withdrawal.fecha, withdrawal });
            });
            events.sort((a, b) => a.key.localeCompare(b.key) || (a.type === "withdrawal") - (b.type === "withdrawal"));

            const newPhase = (index, fecha = null) => ({ index, balance: base, hwm: base, days: {}, trades: 0, startFecha: fecha });
            let phase = newPhase(0);
            let currentDay = null, dayStartBalance = base, currentMonth = null, monthStartBalance = base;
            let status = "active", failure = null;
            const history = [];
            const withdrawals = [];

            const getTarget = index => (index === 0 ? rules.target1 : rules.target2);
            const getFloor = () => {
                if (!rules.maxDD) return null;
                const limit = base * rules.maxDD / 100;
                // Trailing: sigue al máximo alcanzado, pero nunca sube por encima del saldo base
                return rules.ddType === "trailing" ? Math.min(phase.hwm - limit, base) : base - limit;
            };
            const evaluate = () => {
                const profit = phase.balance - base;
                const dayValues = Object.values(phase.days);
                const tradingDays = dayValues.length;
                const profitDays = dayValues.filter(value => value > 0.004).length;
                const bestDay = dayValues.length ? Math.max(0, ...dayValues) : 0;
                const consistencyRatio = profit > 0 ? (bestDay / profit) * 100 : null;
                const consistencyOk = !rules.consistency || (consistencyRatio !== null && consistencyRatio <= rules.consistencyPct + 1e-9);
                const isFunded = phase.index >= rules.phases;
                const targetAmount = isFunded ? null : base * getTarget(phase.index) / 100;
                const targetOk = isFunded || profit >= targetAmount - 1e-9;
                const daysOk = tradingDays >= rules.minTradingDays;
                const profitDaysOk = profitDays >= rules.minProfitDays;
                return {
                    profit, profitPct: (profit / base) * 100, targetAmount, targetOk,
                    tradingDays, profitDays, bestDay, consistencyRatio, consistencyOk, daysOk, profitDaysOk,
                    passed: !isFunded && targetOk && daysOk && profitDaysOk && consistencyOk
                };
            };

            for (const event of events) {
                if (startAfter && event.key <= startAfter) continue;

                if (event.type === "withdrawal") {
                    const item = { ...event.withdrawal, applied: false, reason: "" };
                    const available = phase.balance - base;
                    if (status !== "active") item.reason = "La cuenta estaba quemada";
                    else if (phase.index < rules.phases) item.reason = "La cuenta aún no estaba fondeada";
                    else if (!(item.amount > 0) || item.amount > available + 0.005) item.reason = "Monto mayor al beneficio disponible";
                    else {
                        item.applied = true;
                        phase.balance -= item.amount;
                        phase.hwm = phase.balance;
                        // El retiro no cuenta como pérdida para los drawdowns diario/mensual
                        if (currentDay === event.fecha) dayStartBalance -= item.amount;
                        if (currentMonth === event.fecha.slice(0, 7)) monthStartBalance -= item.amount;
                    }
                    withdrawals.push(item);
                    continue;
                }
                if (status !== "active") continue;

                const tradeRisk = Number(event.trade.riesgo) || 0;
                if (rules.riskPerTrade && tradeRisk > rules.riskPerTrade + 1e-9) {
                    status = "failed";
                    failure = {
                        reason: `Límite de riesgo por trade (${rules.riskPerTrade}%)`,
                        key: event.key,
                        fecha: event.fecha,
                        phaseIndex: phase.index,
                        balance: phase.balance
                    };
                    continue;
                }

                if (!phase.startFecha) phase.startFecha = event.fecha;
                if (event.fecha !== currentDay) { currentDay = event.fecha; dayStartBalance = phase.balance; }
                const month = event.fecha.slice(0, 7);
                if (month !== currentMonth) { currentMonth = month; monthStartBalance = phase.balance; }

                phase.balance += event.pnl;
                phase.hwm = Math.max(phase.hwm, phase.balance);
                phase.days[event.fecha] = (phase.days[event.fecha] || 0) + event.pnl;
                phase.trades++;

                let reason = null;
                const floor = getFloor();
                if (rules.dailyDD && phase.balance <= dayStartBalance - base * rules.dailyDD / 100 + 1e-9) reason = "Drawdown diario";
                else if (rules.monthlyDD && phase.balance <= monthStartBalance - base * rules.monthlyDD / 100 + 1e-9) reason = "Drawdown mensual";
                else if (floor !== null && phase.balance <= floor + 1e-9) reason = rules.ddType === "trailing" ? "Drawdown máximo (trailing)" : "Drawdown máximo";
                if (reason) {
                    status = "failed";
                    failure = { reason, key: event.key, fecha: event.fecha, phaseIndex: phase.index, balance: phase.balance };
                    continue;
                }

                const result = evaluate();
                if (result.passed) {
                    history.push({ index: phase.index, startFecha: phase.startFecha, endFecha: event.fecha, profit: result.profit, profitPct: result.profitPct, tradingDays: result.tradingDays, trades: phase.trades });
                    phase = newPhase(phase.index + 1);
                    currentDay = null;
                    currentMonth = null;
                }
            }

            const dailyUsed = currentDay ? Math.max(0, dayStartBalance - phase.balance) : 0;
            const monthlyUsed = currentMonth ? Math.max(0, monthStartBalance - phase.balance) : 0;
            return {
                rules, base, status, failure, history, withdrawals,
                phase, metrics: evaluate(), floor: getFloor(),
                funded: phase.index >= rules.phases,
                currentDay, dailyUsed, currentMonth, monthlyUsed,
                lastFecha: events.length ? events[events.length - 1].fecha : null,
                totalWithdrawn: withdrawals.filter(item => item.applied).reduce((sum, item) => sum + item.amount, 0)
            };
        }

        function renderSessionModeRow(session) {
            if (!isFondeoSession(session)) {
                return `<div class="text-gray-400 font-semibold text-left">Modo:</div><div class="text-gray-300 text-right font-medium">Trading libre</div>`;
            }
            const sim = simulateFondeo(session);
            const label = sim.status === "failed" ? "Quemada" : getFondeoPhaseLabel(sim.phase.index, sim.rules);
            const color = sim.status === "failed" ? "text-red-400" : (sim.funded ? "text-emerald-400" : "text-amber-300");
            return `<div class="text-gray-400 font-semibold text-left">Modo:</div><div class="${color} text-right font-bold"><i class="fa-solid fa-trophy mr-1"></i>Fondeo · ${label}</div>`;
        }

        function getActiveFondeoSession() {
            if (currentMode !== "backtesting" || isGlobalMetricsView || !activeSessionId) return null;
            const session = backtestSessions.find(item => String(item.id) === String(activeSessionId));
            return isFondeoSession(session) ? session : null;
        }

        function persistBacktestSessionsQuietly() {
            dbSet(STORAGE_KEY_SESSIONS, backtestSessions).catch(() => {});
        }

        // Felicita al superar una fase y avisa si la cuenta se quema (una sola vez por evento)
        function checkFondeoMilestones(session, sim) {
            let changed = false;
            const passed = sim.history.length;
            if (session.celebratedPhases === undefined) {
                session.celebratedPhases = passed;
                changed = true;
            } else if (passed > session.celebratedPhases) {
                const funded = passed >= sim.rules.phases;
                const last = sim.history[passed - 1];
                showFondeoCelebration(
                    funded ? "¡Cuenta fondeada!" : `¡Fase ${passed} superada!`,
                    funded
                        ? `Superaste todas las fases con +${last.profitPct.toFixed(2)}%. El balance vuelve a ${formatFondeoMoney(sim.base)} y ya puedes simular retiros.`
                        : `Lograste +${last.profitPct.toFixed(2)}% en ${last.tradingDays} ${last.tradingDays === 1 ? "día" : "días"} de trading. Empieza la Fase ${passed + 1} con ${formatFondeoMoney(sim.base)}.`,
                    funded
                );
                session.celebratedPhases = passed;
                changed = true;
            } else if (passed < session.celebratedPhases) {
                session.celebratedPhases = passed;
                changed = true;
            }

            const failureKey = sim.failure ? `${sim.failure.key}|${sim.failure.reason}` : null;
            if (failureKey && session.notifiedFailureKey !== failureKey) {
                showToast(`Cuenta quemada: ${sim.failure.reason} (${formatFondeoDate(sim.failure.fecha)})`, true);
                session.notifiedFailureKey = failureKey;
                changed = true;
            } else if (!failureKey && session.notifiedFailureKey) {
                delete session.notifiedFailureKey;
                changed = true;
            }
            if (changed) persistBacktestSessionsQuietly();
        }

        function showFondeoCelebration(title, message, isFunded) {
            document.querySelectorAll(".fondeo-celebration").forEach(element => element.remove());
            const overlay = document.createElement("div");
            overlay.className = "fondeo-celebration";
            const colors = ["#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ef4444", "#facc15", "#14b8a6"];
            let confetti = "";
            for (let i = 0; i < 140; i++) {
                const style = [
                    `left:${Math.random() * 100}%`,
                    `background:${colors[i % colors.length]}`,
                    `animation-duration:${2.6 + Math.random() * 2.4}s`,
                    `animation-delay:${Math.random() * 0.9}s`,
                    `--drift:${Math.round(Math.random() * 240 - 120)}px`,
                    `--spin:${Math.round(Math.random() * 1080 - 540)}deg`,
                    `width:${6 + Math.random() * 7}px`,
                    `height:${10 + Math.random() * 10}px`
                ].join(";");
                confetti += `<span class="fondeo-confetti" style="${style}"></span>`;
            }
            overlay.innerHTML = `${confetti}
                <div class="fondeo-celebration-card bg-card w-full max-w-sm rounded-2xl border ${isFunded ? "border-emerald-500/50" : "border-amber-500/50"} p-7 text-center shadow-2xl">
                    <div class="fondeo-celebration-trophy mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full ${isFunded ? "bg-emerald-900/40" : "bg-amber-900/30"}">
                        <i class="fa-solid ${isFunded ? "fa-sack-dollar text-emerald-400" : "fa-trophy text-amber-400"} text-4xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-white">${escapeGalleryHtml(title)}</h3>
                    <p class="mt-3 text-sm leading-relaxed text-gray-300">${escapeGalleryHtml(message)}</p>
                    <button type="button" data-fondeo-close class="mt-6 rounded-lg ${isFunded ? "bg-green-600 hover:bg-green-500" : "bg-amber-600 hover:bg-amber-500"} px-6 py-2.5 text-sm font-bold text-white transition">¡Vamos! <i class="fa-solid fa-rocket ml-1"></i></button>
                </div>`;
            const close = () => overlay.remove();
            overlay.addEventListener("click", event => {
                if (event.target === overlay || event.target.closest("[data-fondeo-close]")) close();
            });
            document.body.appendChild(overlay);
            setTimeout(() => overlay.querySelectorAll(".fondeo-confetti").forEach(piece => piece.remove()), 6500);
        }

        function renderFondeoPanel() {
            const panel = document.getElementById("fondeo-panel");
            if (!panel) return;
            const session = getActiveFondeoSession();
            if (!session) {
                panel.classList.add("hidden");
                panel.innerHTML = "";
                return;
            }
            const sim = simulateFondeo(session);
            checkFondeoMilestones(session, sim);
            panel.classList.remove("hidden");
            panel.innerHTML = buildFondeoPanelHtml(session, sim);
        }

        function buildFondeoPanelHtml(session, sim) {
            const { rules, base, metrics } = sim;
            const toneText = { ok: "text-emerald-400", warn: "text-amber-300", bad: "text-red-400", info: "text-blue-300", muted: "text-gray-300" };
            const toneFill = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-red-500", info: "bg-blue-500", muted: "bg-gray-500" };
            const usageTone = pct => (pct >= 80 ? "bad" : (pct >= 50 ? "warn" : "ok"));
            const card = (title, value, sub, pct = null, tone = "muted") => `
                <div class="rounded-lg border border-main bg-gray-900/60 p-3">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">${title}</p>
                    <p class="mt-1 text-lg font-bold ${toneText[tone]}">${value}</p>
                    ${pct === null ? "" : `<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-800"><div class="h-full rounded-full ${toneFill[tone]}" style="width:${Math.max(0, Math.min(100, pct)).toFixed(1)}%"></div></div>`}
                    <p class="mt-1.5 text-xs text-gray-500">${sub}</p>
                </div>`;

            const failed = sim.status === "failed";
            const phaseLabel = getFondeoPhaseLabel(sim.phase.index, rules);
            const statusBadge = failed
                ? `<span class="rounded-full border border-red-700 bg-red-900/40 px-3 py-1 text-xs font-bold text-red-400"><i class="fa-solid fa-fire mr-1"></i>Cuenta quemada · ${phaseLabel}</span>`
                : (sim.funded
                    ? `<span class="rounded-full border border-emerald-700 bg-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-400"><i class="fa-solid fa-sack-dollar mr-1"></i>Fondeada</span>`
                    : `<span class="rounded-full border border-amber-700 bg-amber-900/30 px-3 py-1 text-xs font-bold text-amber-300"><i class="fa-solid fa-flag-checkered mr-1"></i>${phaseLabel} de ${rules.phases}</span>`);

            const ruleChips = [
                `${rules.phases} ${rules.phases === 1 ? "fase" : "fases"}`,
                `Objetivo F1 ${rules.target1}%` + (rules.phases === 2 ? ` · F2 ${rules.target2}%` : ""),
                rules.dailyDD ? `DD diario ${rules.dailyDD}%` : "Sin DD diario",
                rules.monthlyDD ? `DD mensual ${rules.monthlyDD}%` : null,
                rules.maxDD ? `DD máx. ${rules.maxDD}% ${rules.ddType === "trailing" ? "trailing" : "estático"}` : "Sin DD máximo",
                rules.riskPerTrade ? `Riesgo/trade ≤ ${rules.riskPerTrade}%` : null,
                rules.minTradingDays ? `Mín. ${rules.minTradingDays} días` : null,
                rules.minProfitDays ? `Mín. ${rules.minProfitDays} días rentables` : null,
                rules.consistency ? `Consistencia ≤ ${rules.consistencyPct}%` : null,
                `Split ${rules.profitSplit}%`
            ].filter(Boolean).map(text => `<span class="rounded border border-main bg-gray-900/60 px-2 py-0.5 text-[11px] text-gray-400">${text}</span>`).join("");

            // Tarjetas de métricas de la fase actual
            const cards = [];
            cards.push(card(
                "Balance de la fase",
                formatFondeoMoney(sim.phase.balance),
                `${metrics.profit >= 0 ? "+" : ""}${formatFondeoMoney(metrics.profit)} (${metrics.profitPct >= 0 ? "+" : ""}${metrics.profitPct.toFixed(2)}%) · base ${formatFondeoMoney(base)}`,
                null,
                metrics.profit > 0 ? "ok" : (metrics.profit < 0 ? "bad" : "muted")
            ));
            if (!sim.funded) {
                const progress = metrics.targetAmount > 0 ? (Math.max(0, metrics.profit) / metrics.targetAmount) * 100 : 100;
                cards.push(card("Objetivo de beneficio", `${Math.min(100, progress).toFixed(0)}%`, `${formatFondeoMoney(Math.max(0, metrics.profit))} de ${formatFondeoMoney(metrics.targetAmount)} (${(sim.phase.index === 0 ? rules.target1 : rules.target2)}%)`, progress, metrics.targetOk ? "ok" : "info"));
            } else {
                cards.push(card("Beneficio retirable", formatFondeoMoney(Math.max(0, metrics.profit)), `Tu parte (${rules.profitSplit}%): ${formatFondeoMoney(Math.max(0, metrics.profit) * rules.profitSplit / 100)}`, null, metrics.profit > 0 ? "ok" : "muted"));
            }
            if (rules.dailyDD) {
                const limit = base * rules.dailyDD / 100;
                const pct = (sim.dailyUsed / limit) * 100;
                cards.push(card("Drawdown diario", `${formatFondeoMoney(sim.dailyUsed)} / ${formatFondeoMoney(limit)}`, sim.currentDay ? `Último día operado: ${formatFondeoDate(sim.currentDay)}` : "Sin operaciones en esta fase", pct, usageTone(pct)));
            }
            if (rules.monthlyDD) {
                const limit = base * rules.monthlyDD / 100;
                const pct = (sim.monthlyUsed / limit) * 100;
                cards.push(card("Drawdown mensual", `${formatFondeoMoney(sim.monthlyUsed)} / ${formatFondeoMoney(limit)}`, sim.currentMonth ? `Mes: ${sim.currentMonth}` : "Sin operaciones en esta fase", pct, usageTone(pct)));
            }
            if (sim.floor !== null) {
                const limit = base * rules.maxDD / 100;
                const room = Math.max(0, sim.phase.balance - sim.floor);
                const usedPct = ((limit - Math.min(limit, room)) / limit) * 100;
                cards.push(card(`Drawdown máximo ${rules.ddType === "trailing" ? "(trailing)" : "(estático)"}`, `Margen ${formatFondeoMoney(room)}`, `Límite de balance: ${formatFondeoMoney(sim.floor)}`, usedPct, usageTone(usedPct)));
            }
            // Los requisitos de días y consistencia solo aplican a las fases de evaluación
            if (rules.minTradingDays && !sim.funded) {
                cards.push(card("Días de trading", `${metrics.tradingDays} / ${rules.minTradingDays}`, metrics.daysOk ? "Requisito cumplido" : `Faltan ${rules.minTradingDays - metrics.tradingDays}`, (metrics.tradingDays / rules.minTradingDays) * 100, metrics.daysOk ? "ok" : "info"));
            }
            if (rules.minProfitDays && !sim.funded) {
                cards.push(card("Días rentables", `${metrics.profitDays} / ${rules.minProfitDays}`, metrics.profitDaysOk ? "Requisito cumplido" : `Faltan ${rules.minProfitDays - metrics.profitDays}`, (metrics.profitDays / rules.minProfitDays) * 100, metrics.profitDaysOk ? "ok" : "info"));
            }
            if (rules.consistency && !sim.funded) {
                const ratio = metrics.consistencyRatio;
                cards.push(card("Consistencia", ratio === null ? "—" : `${ratio.toFixed(1)}%`, `Mejor día ${formatFondeoMoney(metrics.bestDay)} · máximo permitido ${rules.consistencyPct}% del beneficio`, ratio === null ? null : (ratio / rules.consistencyPct) * 100, ratio === null ? "muted" : (metrics.consistencyOk ? "ok" : "bad")));
            }

            // Historial de fases superadas
            const timeline = sim.history.length
                ? sim.history.map(item => `
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-emerald-900/50 bg-emerald-900/20 px-3 py-2 text-xs">
                        <span class="font-bold text-emerald-400"><i class="fa-solid fa-circle-check mr-1"></i>Fase ${item.index + 1} superada</span>
                        <span class="text-gray-400">${formatFondeoDate(item.startFecha)} → ${formatFondeoDate(item.endFecha)}</span>
                        <span class="text-gray-300">+${item.profitPct.toFixed(2)}% · ${item.tradingDays} días · ${item.trades} ops</span>
                    </div>`).join("")
                : `<p class="text-xs text-gray-500">Aún no superaste ninguna fase${session.fondeoStartAfter ? " en este intento" : ""}.</p>`;

            const failureBox = failed ? `
                <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-900/20 p-3 text-sm">
                    <div>
                        <p class="font-bold text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Se incumplió la regla: ${sim.failure.reason}</p>
                        <p class="mt-1 text-xs text-gray-400">${getFondeoPhaseLabel(sim.failure.phaseIndex, rules)} · ${formatFondeoDate(sim.failure.fecha)} · balance ${formatFondeoMoney(sim.failure.balance)}. Las operaciones posteriores no cuentan para este intento.</p>
                    </div>
                    <button type="button" onclick="restartFondeoAttempt()" class="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition"><i class="fa-solid fa-rotate-right mr-1"></i>Nuevo intento desde aquí</button>
                </div>` : "";

            const restartNote = session.fondeoStartAfter ? `
                <p class="text-xs text-gray-500"><i class="fa-solid fa-circle-info mr-1"></i>Intento reiniciado: solo cuentan las operaciones posteriores a ${formatFondeoDate(session.fondeoStartAfter.slice(0, 10))}.
                <button type="button" onclick="undoFondeoRestart()" class="ml-1 font-semibold text-blue-300 hover:text-blue-200">Deshacer reinicio</button></p>` : "";

            // Retiros simulados
            let withdrawalsHtml = "";
            if (sim.funded || sim.withdrawals.length) {
                const available = Math.max(0, metrics.profit);
                const rows = sim.withdrawals.length
                    ? sim.withdrawals.map(item => `
                        <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-main bg-gray-900/60 px-3 py-2 text-xs">
                            <span class="text-gray-400">${formatFondeoDate(item.fecha)}</span>
                            <span class="font-bold ${item.applied ? "text-white" : "text-gray-500 line-through"}">${formatFondeoMoney(item.amount)}</span>
                            <span class="${item.applied ? "text-emerald-400" : "text-red-400"}">${item.applied ? `Recibes ${formatFondeoMoney(item.amount * rules.profitSplit / 100)}` : escapeGalleryHtml(item.reason)}</span>
                            <button type="button" onclick="deleteFondeoWithdrawal(${Number(item.id)})" class="text-gray-500 hover:text-red-400 transition" title="Eliminar retiro"><i class="fa-solid fa-trash"></i></button>
                        </div>`).join("")
                    : `<p class="text-xs text-gray-500">Todavía no simulaste retiros.</p>`;
                const canWithdraw = sim.funded && !failed && available > 0;
                withdrawalsHtml = `
                    <div class="space-y-3 rounded-lg border border-emerald-900/50 bg-emerald-900/20 p-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <h4 class="text-sm font-bold text-emerald-400"><i class="fa-solid fa-money-bill-transfer mr-1"></i>Retiros simulados</h4>
                            <span class="text-xs text-gray-400">Total retirado: <strong class="text-white">${formatFondeoMoney(sim.totalWithdrawn)}</strong> · cobrado (${rules.profitSplit}%): <strong class="text-emerald-400">${formatFondeoMoney(sim.totalWithdrawn * rules.profitSplit / 100)}</strong></span>
                        </div>
                        <div class="flex flex-wrap items-end gap-2 text-xs">
                            <div>
                                <label class="block font-semibold text-gray-300 mb-1">Fecha</label>
                                <input type="date" id="fondeoWithdrawalDate" value="${sim.lastFecha || new Date().toISOString().split("T")[0]}" ${canWithdraw ? "" : "disabled"} class="bg-gray-900 border border-main rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-gray-500 disabled:opacity-40">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-300 mb-1">Monto ($)</label>
                                <input type="number" step="0.01" min="0" id="fondeoWithdrawalAmount" value="${available > 0 ? available.toFixed(2) : ""}" ${canWithdraw ? "" : "disabled"} class="w-32 bg-gray-900 border border-main rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-gray-500 disabled:opacity-40">
                            </div>
                            <button type="button" onclick="addFondeoWithdrawal()" ${canWithdraw ? "" : "disabled"} class="rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"><i class="fa-solid fa-hand-holding-dollar mr-1"></i>Simular retiro</button>
                            <span class="pb-2 text-gray-500">${canWithdraw ? `Disponible: ${formatFondeoMoney(available)}` : (failed ? "La cuenta está quemada." : (sim.funded ? "No hay beneficio para retirar." : "Disponible al estar fondeada."))}</span>
                        </div>
                        <div class="space-y-2">${rows}</div>
                    </div>`;
            }

            return `
                <div class="bg-card border ${failed ? "border-red-900/50" : (sim.funded ? "border-emerald-900/50" : "border-amber-900/50")} rounded-xl p-5 shadow space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <h2 class="flex items-center gap-2 text-base font-bold text-white"><i class="fa-solid fa-trophy text-amber-400"></i> Simulación de fondeo</h2>
                        ${statusBadge}
                    </div>
                    <div class="flex flex-wrap gap-1.5">${ruleChips}</div>
                    ${failureBox}
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">${cards.join("")}</div>
                    <div class="space-y-2">
                        <h4 class="text-xs font-bold uppercase tracking-wide text-gray-400">Progreso de fases</h4>
                        ${timeline}
                        ${restartNote}
                    </div>
                    ${withdrawalsHtml}
                </div>`;
        }

        async function addFondeoWithdrawal() {
            const session = getActiveFondeoSession();
            if (!session) return;
            const sim = simulateFondeo(session);
            const amount = parseFloat(document.getElementById("fondeoWithdrawalAmount").value);
            const fecha = document.getElementById("fondeoWithdrawalDate").value;
            const available = Math.max(0, sim.metrics.profit);
            if (!sim.funded || sim.status === "failed") { showToast("Solo puedes retirar con la cuenta fondeada", true); return; }
            if (!fecha) { showToast("Elige la fecha del retiro", true); return; }
            if (!(amount > 0)) { showToast("Ingresa un monto válido", true); return; }
            if (amount > available + 0.005) { showToast(`El máximo disponible es ${formatFondeoMoney(available)}`, true); return; }
            if (sim.lastFecha && fecha < sim.lastFecha) { showToast("La fecha no puede ser anterior a la última operación", true); return; }
            session.withdrawals = [...(Array.isArray(session.withdrawals) ? session.withdrawals : []), { id: Date.now(), fecha, amount: Math.round(amount * 100) / 100 }];
            await saveToStorage();
            showToast(`Retiro simulado: recibes ${formatFondeoMoney(amount * sim.rules.profitSplit / 100)} (${sim.rules.profitSplit}%)`);
        }

        async function deleteFondeoWithdrawal(id) {
            const session = getActiveFondeoSession();
            if (!session || !confirm("¿Eliminar este retiro simulado?")) return;
            session.withdrawals = (session.withdrawals || []).filter(item => Number(item.id) !== Number(id));
            await saveToStorage();
            showToast("Retiro eliminado");
        }

        async function restartFondeoAttempt() {
            const session = getActiveFondeoSession();
            if (!session) return;
            const sim = simulateFondeo(session);
            if (!sim.failure) return;
            if (!confirm("¿Empezar un nuevo intento desde la Fase 1? Las operaciones anteriores se conservan, pero no contarán para la simulación.")) return;
            session.fondeoStartAfter = sim.failure.key;
            session.celebratedPhases = 0;
            await saveToStorage();
            showToast("Nuevo intento iniciado desde la Fase 1");
        }

        async function undoFondeoRestart() {
            const session = getActiveFondeoSession();
            if (!session) return;
            delete session.fondeoStartAfter;
            session.celebratedPhases = simulateFondeo(session).history.length;
            await saveToStorage();
            showToast("Reinicio deshecho");
        }

        function goToGallery(id) {
            switchTab('gallery');
            setTimeout(() => {
                const el = document.getElementById(`gallery-card-${id}`);
                if(el) { el.scrollIntoView({ behavior: 'smooth' }); el.classList.add('ring-2', 'ring-green-500'); setTimeout(() => el.classList.remove('ring-2'), 2000); }
            }, 50);
        }

        function renderTable() {
            const tbody = document.getElementById("journal-table-body"); tbody.innerHTML = "";
            const showPairColumn = currentMode !== "backtesting";
            const showBalanceColumn = !isGlobalMetricsView;
            document.getElementById("journal-head-pair").classList.toggle("hidden", !showPairColumn);
            document.getElementById("journal-head-balance").classList.toggle("hidden", !showBalanceColumn);
            document.getElementById("filterParContainer").classList.toggle("hidden", !showPairColumn);
            const emptyRowColspan = 15 - (showPairColumn ? 0 : 1) - (showBalanceColumn ? 0 : 1);
            const textSearch = document.getElementById("filterSearch").value.toLowerCase();
                        const fList = getBaseTrades().filter(t => 
                checkPeriodMatch(t.fecha, document.getElementById("filterPeriodoType").value, 
                    document.getElementById("filterPeriodoYear").value,
                    document.getElementById("filterPeriodoMonth").value,
                    document.getElementById("filterPeriodoSub").value) &&
                (document.getElementById("filterEstado").value === "ALL" || t.estado === document.getElementById("filterEstado").value) &&
                (document.getElementById("filterSesion").value === "ALL" || t.sesion === document.getElementById("filterSesion").value) &&
                (!showPairColumn || document.getElementById("filterPar").value === "ALL" || (t.par||"").toUpperCase() === document.getElementById("filterPar").value) &&
                (!textSearch || ((t.notaAntes||'')+" "+(t.notaDespues||'')+(showPairColumn ? " "+(t.par||'') : "")).toLowerCase().includes(textSearch))
            );

            if (!fList.length) { tbody.innerHTML = `<tr><td colspan="${emptyRowColspan}" class="p-8 text-center text-gray-500"><i class="fa-solid fa-search text-2xl mb-2 block"></i>No se encontraron operaciones</td></tr>`; return; }

            let initialBalance = getActiveInitialBalance();
            let currentBalance = initialBalance;
            let acumPct = 0;

            fList.forEach(t => {
                const outcomePct = getTradeOutcome(t);
                const plDollar = initialBalance * (outcomePct / 100);
                currentBalance += plDollar;
                acumPct += outcomePct;

                const stColors = {
                    "Full TP":"bg-emerald-900/60 text-emerald-400 border-emerald-700",
                    "SL":"bg-red-900/60 text-red-400 border-red-700",
                    "BE":"bg-gray-800 text-gray-300 border-gray-600",
                    "Parcial":"bg-amber-900/60 text-amber-400 border-amber-700",
                    "Cierre manual":"bg-sky-900/60 text-sky-300 border-sky-700",
                    "Pendiente":"bg-purple-900/60 text-purple-400 border-purple-700",
                    "Activa":"bg-blue-900/60 text-blue-400 border-blue-700"
                };
                const st = `<span class="inline-block px-2 py-0.5 rounded font-semibold text-[11px] border ${stColors[t.estado] || 'bg-gray-900 text-gray-500 border-gray-800'}">${t.estado || 'Sin Activar'}</span>${t.mt5 ? `<span class="inline-block ml-1 px-1 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800 text-[9px] font-bold align-middle" title="Sincronizada con MetaTrader 5">MT5</span>` : ""}`;
                const ord = (t.orden||'').toLowerCase().includes("buy") ? `<span class="text-emerald-400 font-semibold"><i class="fa-solid fa-arrow-trend-up"></i> ${t.orden}</span>` : `<span class="text-red-400 font-semibold"><i class="fa-solid fa-arrow-trend-down"></i> ${t.orden}</span>`;
                
                const outColor = outcomePct > 0 ? "text-emerald-400" : (outcomePct < 0 ? "text-red-400" : "text-gray-400");
                const acumColor = acumPct > 0 ? "text-emerald-400" : (acumPct < 0 ? "text-red-400" : "text-gray-400");

                const dayName = t.fecha
                    ? new Date(`${t.fecha}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'long' })
                    : '';
                const risk = Number(t.riesgo);
                const rr = Number(t.rr);
                const tradeKey = isGlobalMetricsView ? Number(t.globalId) : Number(t.id);

                tbody.innerHTML += `
                    <tr class="bg-card-hover transition">
                        <td class="px-2 py-2 font-mono whitespace-nowrap">${t.fecha}<br><span class="text-gray-500 text-[11px]">${t.hora}</span></td>
                        <td class="px-2 py-2 text-gray-300 capitalize">${dayName}</td>
                        ${showPairColumn ? `<td class="px-2 py-2 font-bold text-white"><span class="bg-gray-800 px-2 py-0.5 rounded border border-main">${(t.par || '-').toUpperCase()}</span></td>` : ""}
                        <td class="px-2 py-2"><span class="bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-800">${t.sesion || '-'}</span></td>
                        <td class="px-2 py-2 text-gray-400">${t.tendencia || '-'}</td>
                        <td class="px-2 py-2 font-mono whitespace-nowrap"><span class="text-red-400">${t.pipsSL}</span> / <span class="text-emerald-400">${t.pipsTP}</span></td>
                        <td class="px-2 py-2 whitespace-nowrap">${ord}</td>
                        <td class="px-2 py-2 font-bold text-yellow-400 font-mono whitespace-nowrap">1:${Number.isFinite(rr) ? rr.toFixed(1) : '0.0'}</td>
                        <td class="px-2 py-2 font-mono whitespace-nowrap">${Number.isFinite(risk) ? risk.toFixed(1) : '0.0'}%</td>
                        <td class="px-2 py-2">${st}</td>
                        <td class="px-2 py-2 font-mono whitespace-nowrap"><div class="${outColor} font-bold">${outcomePct > 0 ? '+' : ''}${outcomePct.toFixed(2)}%</div></td>
                        <td class="px-2 py-2 font-mono ${acumColor} font-bold whitespace-nowrap">${acumPct >= 0 ? '+' : ''}${acumPct.toFixed(2)}%</td>
                        ${showBalanceColumn ? `<td class="px-2 py-2 font-mono whitespace-nowrap"><div class="font-bold text-white">$${currentBalance.toFixed(2)}</div><div class="${plDollar > 0 ? 'text-emerald-400' : (plDollar < 0 ? 'text-red-400' : 'text-gray-500')} text-[10px]">P/L: $${plDollar.toFixed(2)}</div></td>` : ""}
                        <td class="px-2 py-2 text-center">
                            <button onclick="goToGallery(${tradeKey})" class="text-indigo-400 hover:text-indigo-300 transition" title="Ver Galería y Links"><i class="fa-solid fa-images text-lg"></i></button>
                        </td>
                        <td class="px-2 py-2 text-center whitespace-nowrap">
                            <button onclick="${isGlobalMetricsView ? `editGlobalMetricEntry(${tradeKey})` : `openTradeModal(${tradeKey})`}" class="text-gray-400 hover:text-white p-1 mr-1 transition" title="Editar"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="${isGlobalMetricsView ? `deleteGlobalMetricEntry(${tradeKey})` : `deleteTrade(${tradeKey})`}" class="text-gray-500 hover:text-red-400 p-1 transition" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        }

        // FUNCIONES DE LA GALERÍA Y LIGHTBOX COMPLETADAS
        function escapeGalleryHtml(value) {
            return String(value ?? "").replace(/[&<>"']/g, character => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
            })[character]);
        }

        function getSafeGalleryUrl(value) {
            try {
                const url = new URL(String(value || "").trim());
                return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
            } catch (error) {
                return "";
            }
        }

        function getGalleryTradeKey(trade) {
            return isGlobalMetricsView ? Number(trade.globalId) : Number(trade.id);
        }

        function renderGalleryCommentEditor(trade, side) {
            const isBefore = side === "antes";
            const field = isBefore ? "notaAntes" : "notaDespues";
            const note = String(trade[field] || "");
            const galleryKey = getGalleryTradeKey(trade);
            const editorId = `gallery-note-${galleryKey}-${side}`;
            const escapedNote = escapeGalleryHtml(note);
            const buttonColor = isBefore ? "text-blue-300 hover:text-blue-200" : "text-purple-300 hover:text-purple-200";
            const buttonText = note ? "Editar comentario" : "Añadir comentario";

            return `<div class="space-y-2">
                <div id="${editorId}-display" class="space-y-2">
                    ${note ? `<p class="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-lg whitespace-pre-wrap break-words">${escapedNote}</p>` : `<p class="text-xs text-gray-500 italic">Sin comentario todavía.</p>`}
                    <button type="button" onclick="toggleGalleryCommentEditor(${galleryKey}, '${side}', true)" class="inline-flex items-center gap-1.5 text-xs font-semibold ${buttonColor}"><i class="fa-solid fa-pen-to-square"></i>${buttonText}</button>
                </div>
                <div id="${editorId}-editor" class="hidden space-y-2">
                    <textarea id="${editorId}-input" rows="3" class="w-full resize-y rounded-lg border border-gray-700 bg-gray-950 p-3 text-xs text-white focus:border-indigo-400 focus:outline-none" placeholder="Escribe tu comentario...">${escapedNote}</textarea>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="toggleGalleryCommentEditor(${galleryKey}, '${side}', false)" class="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800">Cancelar</button>
                        <button type="button" onclick="saveGalleryComment(${galleryKey}, '${side}')" class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"><i class="fa-solid fa-floppy-disk"></i>Guardar</button>
                    </div>
                </div>
            </div>`;
        }

        function renderTradingViewButton(value, isBefore) {
            const safeUrl = getSafeGalleryUrl(value);
            if (!safeUrl) return "";
            const color = isBefore
                ? "border-blue-500/30 bg-blue-950/50 text-blue-200 hover:bg-blue-900/70"
                : "border-purple-500/30 bg-purple-950/50 text-purple-200 hover:bg-purple-900/70";
            const buttonText = currentMode === "backtesting" ? "Abrir gráfico" : "Abrir gráfico en TradingView";
            return `<a href="${escapeGalleryHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex w-fit items-center gap-2 rounded-lg border ${color} px-3 py-2 text-xs font-semibold transition"><i class="fa-solid fa-arrow-up-right-from-square"></i><span>${buttonText}</span></a>`;
        }

        function toggleGalleryCommentEditor(id, side, editing) {
            const trade = isGlobalMetricsView
                ? globalMetricsEntries.find(item => String(item.globalId) === String(id))
                : trades.find(item => String(item.id) === String(id));
            if (!trade || !["antes", "despues"].includes(side)) return;
            const editorId = `gallery-note-${id}-${side}`;
            document.getElementById(`${editorId}-display`).classList.toggle("hidden", editing);
            document.getElementById(`${editorId}-editor`).classList.toggle("hidden", !editing);
            if (!editing) document.getElementById(`${editorId}-input`).value = trade[side === "antes" ? "notaAntes" : "notaDespues"] || "";
        }

        async function saveGalleryComment(id, side) {
            if (!["antes", "despues"].includes(side)) return;
            const trade = isGlobalMetricsView
                ? globalMetricsEntries.find(item => String(item.globalId) === String(id))
                : trades.find(item => String(item.id) === String(id));
            if (!trade) return;

            const field = side === "antes" ? "notaAntes" : "notaDespues";
            const editorId = `gallery-note-${id}-${side}`;
            const note = document.getElementById(`${editorId}-input`).value.trim();
            if (isGlobalMetricsView) {
                trade[field] = note;
                trade.globalEdited = true;
                await saveGlobalMetricsStore();
                renderAll();
                showToast("Comentario actualizado en la copia global");
                return;
            }
            const linkedTrades = getEditReplicatedMembers(trade);
            const multiEntryId = trade.multiEntryId || (linkedTrades.length > 1 ? `multi-${Date.now()}-${trade.id}` : null);

            linkedTrades.forEach(linkedTrade => {
                const linkedIndex = trades.findIndex(item => String(item.id) === String(linkedTrade.id));
                if (linkedIndex === -1) return;
                trades[linkedIndex][field] = note;
                if (multiEntryId) trades[linkedIndex].multiEntryId = multiEntryId;
            });

            await saveToStorage();
            showToast(linkedTrades.length > 1 ? `Comentario actualizado en ${linkedTrades.length} operaciones` : "Comentario actualizado");
        }

        function renderGallery() {
            const container = document.getElementById("gallery-cards-container"); container.innerHTML = "";
            const activeTrades = getBaseTrades().filter(t => t.estado !== "Sin Activar");

            if (!activeTrades.length) { container.innerHTML = `<p class="text-gray-500 text-sm">Aún no hay operaciones registradas con análisis.</p>`; return; }

            [...activeTrades].reverse().forEach(t => {
                const out = getTradeOutcome(t);
                const galleryKey = getGalleryTradeKey(t);
                const hasA = t.imagenesAntes && t.imagenesAntes.length > 0;
                const hasD = t.imagenesDespues && t.imagenesDespues.length > 0;
                if(!hasA && !hasD && !t.notaAntes && !t.notaDespues && !t.linkAntes && !t.linkDespues) return;

                const borderColor = out > 0 ? 'border-emerald-900/50' : (out < 0 ? 'border-red-900/50' : 'border-main');
                const badgeColor = out > 0 ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800' : (out < 0 ? 'bg-red-900/40 text-red-400 border-red-800' : 'bg-gray-800 text-gray-300 border-gray-600');

                let html = `<div id="gallery-card-${galleryKey}" class="bg-card border ${borderColor} rounded-xl p-5 shadow-lg relative transition-all">`;
                
                html += `<div class="flex flex-wrap justify-between items-center mb-4 border-b border-main pb-2">
                    <div class="flex items-center gap-3"><span class="font-bold text-white">${t.par}</span><span class="text-xs text-gray-400"><i class="fa-regular fa-clock"></i> ${t.fecha} ${t.hora}</span><span class="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-700">${t.sesion} / ${t.tendencia}</span></div>
                    <div class="font-bold font-mono px-3 py-1 rounded ${badgeColor}">${out > 0 ? '+' : ''}${out.toFixed(2)}%</div>
                </div>`;
                
                html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
                
                // ANTES
                html += `<div class="space-y-2">
                    <h4 class="text-sm font-bold text-gray-300 border-b border-gray-700 pb-1">Análisis ANTES</h4>
                    ${renderGalleryCommentEditor(t, "antes")}
                    ${renderTradingViewButton(t.linkAntes, true)}
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${(t.imagenesAntes || []).map(src => `<img src="${src}" class="h-24 w-auto rounded cursor-pointer border border-gray-600 hover:border-gray-400 transition" onclick="openLightbox('${src}')">`).join('')}
                    </div>
                </div>`;
                
                // DESPUÉS
                html += `<div class="space-y-2">
                    <h4 class="text-sm font-bold text-gray-300 border-b border-gray-700 pb-1">Análisis DESPUÉS</h4>
                    ${renderGalleryCommentEditor(t, "despues")}
                    ${renderTradingViewButton(t.linkDespues, false)}
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${(t.imagenesDespues || []).map(src => `<img src="${src}" class="h-24 w-auto rounded cursor-pointer border border-gray-600 hover:border-gray-400 transition" onclick="openLightbox('${src}')">`).join('')}
                    </div>
                </div>`;

                html += `</div></div>`;
                container.innerHTML += html;
            });
        }

        function openLightbox(src) {
            document.getElementById("lightboxImg").src = src;
            document.getElementById("imageLightbox").classList.remove("hidden");
        }

        function closeLightbox() {
            document.getElementById("imageLightbox").classList.add("hidden");
            document.getElementById("lightboxImg").src = "";
        }

        /* =========================================================================
           PUENTE META TRADER 5 (opcional, solo lectura)
           Un script Python en `mt5_bridge/` lee posiciones/órdenes del terminal
           MetaTrader 5 abierto y las expone por HTTP local. Esta app pregunta por
           los eventos, los guarda en una bandeja persistente (IndexedDB) y recién
           después los convierte en operaciones. Si el puente está apagado, nada
           cambia: la Bitácora sigue funcionando 100% offline.
           ========================================================================= */

        function defaultMt5Config() {
            return {
                enabled: false,
                endpoint: "http://127.0.0.1:8765",
                token: "",
                symbolMap: {},  // { "US100M": "US100" } mapeo manual símbolo→par
                notifyOpen: true
            };
        }

        function defaultMt5Runtime() {
            return {
                lastEventId: 0,
                inbox: [],          // [{ receivedAt, event: { id, type, account, trade } }]
                newTradeIds: [],    // para el aviso en el chip (no autoabre el modal)
                unmappedLogins: [],
                tombstones: [],     // trades borrados que el puente no debe recrear
                connected: null,    // null = aún sin verificar
                lastError: "",
                lastAccount: null,
                lastSyncAt: null,
                processedCount: 0
            };
        }

        let mt5Config = null;
        let mt5Runtime = null;
        let mt5PollTimer = null;
        let mt5PollInFlight = false;
        let mt5TradeIdCounter = 0;

        function mt5NormalizeConfig(raw) {
            const config = defaultMt5Config();
            if (raw && typeof raw === "object") {
                if (typeof raw.enabled === "boolean") config.enabled = raw.enabled;
                if (typeof raw.endpoint === "string" && raw.endpoint.trim()) config.endpoint = raw.endpoint.trim().replace(/\/+$/, "");
                if (typeof raw.token === "string") config.token = raw.token.trim();
                if (typeof raw.symbolMap === "object" && raw.symbolMap && !Array.isArray(raw.symbolMap)) {
                    Object.entries(raw.symbolMap).forEach(([symbol, pair]) => {
                        if (symbol && pair) config.symbolMap[String(symbol).toUpperCase()] = String(pair).toUpperCase();
                    });
                }
                if (typeof raw.notifyOpen === "boolean") config.notifyOpen = raw.notifyOpen;
            }
            return config;
        }

        function mt5NormalizeRuntime(raw) {
            const runtime = defaultMt5Runtime();
            if (raw && typeof raw === "object") {
                runtime.lastEventId = Math.max(0, parseInt(raw.lastEventId, 10) || 0);
                if (Array.isArray(raw.inbox)) runtime.inbox = raw.inbox;
                if (Array.isArray(raw.newTradeIds)) runtime.newTradeIds = raw.newTradeIds;
                if (Array.isArray(raw.unmappedLogins)) runtime.unmappedLogins = raw.unmappedLogins;
                if (Array.isArray(raw.tombstones)) runtime.tombstones = raw.tombstones;
                if (typeof raw.connected === "boolean" || raw.connected === null) runtime.connected = raw.connected;
                if (typeof raw.lastError === "string") runtime.lastError = raw.lastError;
                if (typeof raw.lastAccount === "object" && raw.lastAccount !== null) runtime.lastAccount = raw.lastAccount;
                if (typeof raw.lastSyncAt === "string") runtime.lastSyncAt = raw.lastSyncAt;
                runtime.processedCount = Math.max(0, parseInt(raw.processedCount, 10) || 0);
            }
            return runtime;
        }

        async function initMt5Bridge() {
            if (mt5Config === null) {
                const storedConfig = await dbGet(STORAGE_KEY_MT5_CONFIG);
                mt5Config = mt5NormalizeConfig(storedConfig);
            }
            if (mt5Runtime === null) {
                const storedRuntime = await dbGet(STORAGE_KEY_MT5_STATE);
                mt5Runtime = mt5NormalizeRuntime(storedRuntime);
            }
            document.addEventListener("visibilitychange", () => {
                if (!document.hidden) requestMt5Poll();
            });
            if (mt5PollTimer === null) {
                mt5PollTimer = setInterval(() => { requestMt5Poll(); }, MT5_POLL_MILLIS);
            }
            await syncMt5AfterModeChange();
        }

        async function syncMt5AfterModeChange() {
            updateMt5HeaderBadge();
            await mt5ProcessInboxPersisted();
        }

        function saveMt5Config() {
            return dbSet(STORAGE_KEY_MT5_CONFIG, mt5Config).catch(() => {});
        }

        function saveMt5Runtime() {
            if (!mt5Runtime) return Promise.resolve();
            // La bandeja puede llegar grande si la app estuvo cerrada unos días:
            // solo se recorta cuando supera el límite razonable.
            if (mt5Runtime.inbox.length > 2000) mt5Runtime.inbox = mt5Runtime.inbox.slice(-2000);
            return dbSet(STORAGE_KEY_MT5_STATE, mt5Runtime).catch(() => {});
        }

        function mt5DescribeFetchError(error) {
            if (!error) return "Error desconocido del puente MT5";
            if (error.name === "AbortError") {
                return "Sin respuesta del puente (timeout de 6 s): revisá que la ventana del puente diga 'HTTP listo'";
            }
            const message = String((error && error.message) || error);
            if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
                return "El navegador bloqueó la conexión: probá el permiso de red local del navegador o abrí la Bitácora en Firefox";
            }
            return message;
        }

        async function mt5Fetch(path, options = {}) {
            if (typeof window.fetch !== "function") return null;
            const endpoint = mt5Config.endpoint || "http://127.0.0.1:8765";
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);
            try {
                const headers = { "Authorization": `Bearer ${mt5Config.token || ""}` };
                if (options.body) headers["Content-Type"] = "application/json";
                const response = await fetch(`${endpoint}${path}`, {
                    method: options.method || "GET",
                    headers,
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    signal: controller.signal
                });
                if (response.status === 401) throw new Error("Token inválido o ausente en el puente MT5");
                if (!response.ok) throw new Error(`HTTP ${response.status} en el puente MT5`);
                return await response.json();
            } finally {
                clearTimeout(timer);
            }
        }

        async function requestMt5Poll(force = false) {
            if (!mt5Config || !mt5Runtime) return;
            if (!mt5Config.enabled) return;
            if (!force && document.hidden) return; // Sólo pestaña activa sincroniza.
            if (typeof window.fetch !== "function") return;
            if (mt5PollInFlight) return;
            mt5PollInFlight = true;
            try {
                const data = await mt5Fetch(`/events?since=${mt5Runtime.lastEventId}`);
                if (data === null) return;
                const events = Array.isArray(data.events) ? data.events : [];
                mt5Runtime.connected = true;
                mt5Runtime.lastError = "";
                mt5Runtime.lastAccount = data.account || mt5Runtime.lastAccount;
                mt5Runtime.lastSyncAt = new Date().toISOString();
                // 1) Persistimos la bandeja ANTES de ack al puente: nada se pierde.
                if (events.length) {
                    mt5Runtime.lastEventId = Math.max(mt5Runtime.lastEventId, parseInt(data.lastEventId, 10) || 0);
                    mt5Runtime.inbox = mt5Runtime.inbox.concat(events.map(event => ({ receivedAt: new Date().toISOString(), event })));
                    await saveMt5Runtime();
                    await mt5Ack(data.lastEventId);
                    updateMt5HeaderBadge();
                }
                // 2) En modo Real convertimos lo de la bandeja en operaciones.
                await mt5ProcessInboxPersisted();
            } catch (error) {
                mt5Runtime.connected = false;
                mt5Runtime.lastError = mt5DescribeFetchError(error);
                updateMt5HeaderBadge();
            } finally {
                mt5PollInFlight = false;
                if (force) updateMt5HeaderBadge();
            }
        }

        async function mt5Ack(lastEventId) {
            try {
                const payload = { since: parseInt(lastEventId, 10) || 0 };
                await mt5Fetch("/ack", { method: "POST", body: payload });
            } catch (error) {
                // Sin ack, el puente vuelve a enviar los eventos: el apply es
                // idempotente (mezcla por ticket, no duplica).
            }
        }

        function getMt5SymbolMap() {
            const map = {};
            Object.entries((mt5Config && mt5Config.symbolMap) || {}).forEach(([symbol, pair]) => {
                if (symbol && pair) map[String(symbol).toUpperCase()] = String(pair).toUpperCase();
            });
            return map;
        }

        function getMt5ParFromEvent(tradePayload) {
            const symbol = String(tradePayload.mt5Symbol || tradePayload.symbol || "").toUpperCase();
            const overrides = getMt5SymbolMap();
            if (overrides[symbol]) return overrides[symbol];
            const base = String(tradePayload.symbol || symbol).toUpperCase();
            return base.replace(/^(XAU|XAG|EUR|GBP|USD|JPY|CHF|AUD|NZD|CAD)[A-Z]{3}[A-Z0-9]+$/g, "$1");
        }

        function mt5IsoToParts(value, fallback = null) {
            try {
                const date = new Date(value);
                if (!Number.isFinite(date.getTime())) return fallback;
                const pad = n => String(n).padStart(2, "0");
                return {
                    fecha: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
                    hora: `${pad(date.getHours())}:${pad(date.getMinutes())}`
                };
            } catch (error) {
                return fallback;
            }
        }

        function findMt5Account(eventPayload) {
            const login = String(eventPayload.account && (eventPayload.account.login || "") || "");
            if (!login) return null;
            return realAccounts.find(account => String(account.mt5Login || "").trim() === login) || null;
        }

        function findMt5Trade(eventPayload) {
            const info = eventPayload.trade || {};
            const positionId = parseInt(info.mt5PositionId, 10) || 0;
            const orderTicket = parseInt(info.mt5OrderTicket, 10) || 0;
            // Se busca en el array global de trades, no en la vista filtrada por
            // cuenta activa (getBaseTrades): el mapeo debe funcionar aunque esté
            // abierta la vista global o sin cuenta activa.
            return trades.find(trade => {
                const meta = trade.mt5;
                if (!meta) return false;
                if (String(meta.login) !== String(eventPayload.account && eventPayload.account.login || "")) return false;
                if (positionId && parseInt(meta.positionId, 10) === positionId) return true;
                if (orderTicket && parseInt(meta.orderTicket, 10) === orderTicket) return true;
                return false;
            });
        }

        function isMt5EventTombstoned(eventPayload) {
            const info = eventPayload.trade || {};
            const login = String(eventPayload.account && eventPayload.account.login || "");
            const key = `${login}:${parseInt(info.mt5PositionId, 10) || parseInt(info.mt5OrderTicket, 10) || 0}`;
            return mt5Runtime.tombstones.includes(key);
        }

        function addMt5TombstoneFromTrade(trade) {
            if (!trade || !trade.mt5 || !mt5Runtime) return;
            const meta = trade.mt5;
            const key = `${meta.login || ""}:${parseInt(meta.positionId, 10) || parseInt(meta.orderTicket, 10) || 0}`;
            if (!key.endsWith(":0") && !mt5Runtime.tombstones.includes(key)) {
                mt5Runtime.tombstones.push(key);
                // AAC: el corte de los más viejos nunca supera los 200 registros.
                if (mt5Runtime.tombstones.length > 200) mt5Runtime.tombstones = mt5Runtime.tombstones.slice(-200);
            }
        }

        function markMt5UnmappedLogin(eventPayload) {
            const login = String(eventPayload.account && eventPayload.account.login || "");
            if (login && !mt5Runtime.unmappedLogins.includes(login)) {
                mt5Runtime.unmappedLogins.push(login);
                showToast(`MT5: cuenta ${login} sin vincular. Cargale el Login MT5 a una cuenta Real.`, true);
            }
        }

        function mt5EventTradeInfo(eventPayload) {
            return eventPayload && typeof eventPayload.trade === "object" ? eventPayload.trade : {};
        }

        function mt5OrdenLabel(typeName) {
            const normalized = String(typeName || "").trim();
            if (["Buy Limit", "Sell Limit", "Buy Stop", "Sell Stop", "Market Buy", "Market Sell"].includes(normalized)) return normalized;
            if (normalized.toLowerCase() === "buy stop limit") return "Buy Stop";
            if (normalized.toLowerCase() === "sell stop limit") return "Sell Stop";
            return "Market Buy";
        }

        function mt5EstadoForEvent(eventPayload, info, fallbackEstado) {
            if (eventPayload.type === "order_placed") return "Pendiente";
            if (eventPayload.type === "order_filled" || eventPayload.type === "position_opened") return "Activa";
            if (eventPayload.type === "order_cancelled") return "Sin Activar";
            if (eventPayload.type === "position_partial") return "Parcial";
            if (eventPayload.type === "position_closed") {
                const label = String(info.mt5CloseState || "").trim();
                if (label === "Full TP" || label === "SL") return label;
                return "Cierre manual";
            }
            return fallbackEstado || "Activa";
        }

        function buildMt5Trade(eventPayload, account) {
            const info = mt5EventTradeInfo(eventPayload);
            const login = String(eventPayload.account && eventPayload.account.login || "");
            const defaultDate = mt5IsoToParts(new Date().toISOString(), {});
            const { fecha, hora } = { ...defaultDate, ...(mt5IsoToParts(info.mt5OpenedAt, {}) || {}) };
            const estado = mt5EstadoForEvent(eventPayload, info, "Activa");
            const initial = getRealInitialBalance(account);
            const riskMoney = Number(info.riskMoney) || 0;
            const riesgo = riskMoney > 0 && initial > 0 ? Math.round((riskMoney / initial) * 1000) / 10 : 0;
            const base = {
                fecha,
                hora,
                par: getMt5ParFromEvent(info),
                sesion: "Sin clasificar",
                tendencia: "Sin clasificar",
                pipsSL: Number(info.pipsSl) || 0,
                pipsTP: Number(info.pipsTp) || 0,
                rr: Number(info.rr) || 0,
                orden: mt5OrdenLabel(info.mt5OrderType),
                riesgo,
                estado,
                lotaje: Number(info.mt5Volume) > 0 ? Number(info.mt5Volume) : Number(info.mt5VolumeInitial) || 0,
                notaAntes: "",
                notaDespues: "",
                linkAntes: "",
                linkDespues: "",
                imagenesAntes: [],
                imagenesDespues: []
            };
            if (estado === "Parcial") {
                const initialBal = getRealInitialBalance(account);
                const netProfit = (Number(info.mt5Profit) || 0) + (Number(info.mt5Commission) || 0) + (Number(info.mt5Swap) || 0);
                base.resultadoParcial = initialBal > 0 ? Math.round((netProfit / initialBal) * 1000) / 10 : 0;
            }
            base.mt5 = buildMt5Meta(eventPayload, account);
            return base;
        }

        function buildMt5Meta(eventPayload, account) {
            const info = mt5EventTradeInfo(eventPayload);
            const netProfit = (Number(info.mt5Profit) || 0) + (Number(info.mt5Commission) || 0) + (Number(info.mt5Swap) || 0);
            const initial = getRealInitialBalance(account);
            const closeReasonLabel = String(info.mt5CloseState || "").trim() || "Cierre manual";
            return {
                auto: true,
                login: String(eventPayload.account && eventPayload.account.login || ""),
                server: String(eventPayload.account && eventPayload.account.server || ""),
                symbol: info.mt5Symbol || info.symbol || "",
                positionId: parseInt(info.mt5PositionId, 10) || 0,
                orderTicket: parseInt(info.mt5OrderTicket, 10) || 0,
                magic: parseInt(info.mt5Magic, 10) || 0,
                comment: String(info.mt5Comment || ""),
                openedAt: info.mt5OpenedAt || "",
                cierreAt: info.mt5ClosedAt || "",
                status: eventPayload.type === "position_closed" ? "closed" : info.mt5Status || "open",
                entryPrice: Number(info.mt5PriceOpen) || 0,
                slPrice: Number(info.mt5Sl) || 0,
                tpPrice: Number(info.mt5Tp) || 0,
                closePrice: Number(info.mt5ClosePrice) || 0,
                volume: Number(info.mt5Volume) > 0 ? Number(info.mt5Volume) : Number(info.mt5VolumeInitial) || 0,
                netProfit: Math.round(netProfit * 100) / 100,
                grossProfit: Number(info.mt5Profit) || 0,
                commission: Number(info.mt5Commission) || 0,
                swap: Number(info.mt5Swap) || 0,
                closeReason: eventPayload.type === "position_closed" ? closeReasonLabel : "",
                riskMoney: Number(info.riskMoney) || 0,
                resultPct: calculateMt5ResultPct(eventPayload, account)
            };
        }

        function calculateMt5ResultPct(eventPayload, account) {
            if (eventPayload.type !== "position_closed") return null;
            const info = mt5EventTradeInfo(eventPayload);
            const netProfit = (Number(info.mt5Profit) || 0) + (Number(info.mt5Commission) || 0) + (Number(info.mt5Swap) || 0);
            const initial = getRealInitialBalance(account);
            if (!(initial > 0)) return 0;
            return Math.round((netProfit / initial) * 10000) / 100;
        }

        function syncMt5TradeFromEvent(existing, eventPayload, account) {
            const info = mt5EventTradeInfo(eventPayload);
            const initial = getRealInitialBalance(account);
            const eventType = eventPayload.type;
            const gestion = mt5EstadoForEvent(eventPayload, info, existing.estado || "Activa");
            let changed = false;
            // Estado: siempre responde al evento salvo que el trade tenga estado
            // final ya marcado y llegue un update superficial.
            if (existing.estado !== gestion) {
                existing.estado = gestion;
                changed = true;
            }
            if (eventType === "order_filled") {
                const parts = mt5IsoToParts(info.mt5OpenedAt, {}) || {};
                if (parts.fecha) { existing.fecha = parts.fecha; existing.hora = parts.hora || existing.hora; }
            }
            // Datos que el evento completa si el registro no los tenía (duplicado o
            // trade parcialmente construido): nunca pisan datos reales actuales.
            [
                ["pipsSL", Number(info.pipsSl) || 0],
                ["pipsTP", Number(info.pipsTp) || 0],
                ["rr", Number(info.rr) || 0],
                ["lotaje", Number(info.mt5Volume) > 0 ? Number(info.mt5Volume) : Number(info.mt5VolumeInitial) || 0]
            ].forEach(([field, value]) => {
                if (!(value > 0)) return;
                const current = Number(existing[field]);
                if (!Number.isFinite(current) || current === 0) {
                    existing[field] = value;
                    changed = true;
                }
            });
            const riskMoney = Number(info.riskMoney) || 0;
            const riesgoActual = Number(existing.riesgo);
            if (riskMoney > 0 && initial > 0 && (!Number.isFinite(riesgoActual) || riesgoActual === 0)) {
                existing.riesgo = Math.round((riskMoney / initial) * 1000) / 10;
                changed = true;
            }
            if (eventType === "position_partial") {
                const netProfit = (Number(info.mt5Profit) || 0) + (Number(info.mt5Commission) || 0) + (Number(info.mt5Swap) || 0);
                const partialPct = initial > 0 ? Math.round((netProfit / initial) * 1000) / 10 : 0;
                if (existing.resultadoParcial !== partialPct) {
                    existing.resultadoParcial = partialPct;
                    changed = true;
                }
            }
            if (eventType === "position_closed" && "resultadoParcial" in existing) {
                delete existing.resultadoParcial;
                changed = true;
            }
            // El espejo MT5 se refresca con cada evento y conserva nota/links/capturas.
            existing.mt5 = buildMt5Meta(eventPayload, account);
            return true;
        }

        function mt5NewTradeId() {
            mt5TradeIdCounter = (mt5TradeIdCounter + 1) % 1000;
            return Date.now() * 1000 + mt5TradeIdCounter;
        }

        function applyMt5Event(eventPayload, account) {
            const info = mt5EventTradeInfo(eventPayload);
            if (!info || !Object.keys(info).length) return "skipped";
            const existing = findMt5Trade(eventPayload);
            if (existing) {
                const changed = syncMt5TradeFromEvent(existing, eventPayload, account);
                return changed ? "updated" : "skipped";
            }
            if (["order_placed", "position_opened", "position_partial", "position_closed", "order_cancelled"].includes(eventPayload.type)) {
                const built = buildMt5Trade(eventPayload, account);
                const trade = {
                    ...built,
                    id: mt5NewTradeId(),
                    accountId: account.id,
                    sessionId: null
                };
                trades.push(trade);
                return "created";
            }
            // position_updated sobre una fila que no llegó a crearse: no tiene
            // sentido crear una operación a mitad, el user la vería vacía.
            return "skipped";
        }

        function mt5ProcessInbox() {
            if (!mt5Runtime) return 0;
            if (currentMode !== "real" || !mt5Runtime.inbox.length) {
                updateMt5HeaderBadge();
                return 0;
            }
            const stillPending = [];
            const createdIds = [];
            let changedCount = 0;
            for (const item of mt5Runtime.inbox) {
                const eventPayload = item.event || item;
                if (isMt5EventTombstoned(eventPayload)) continue;
                const account = findMt5Account(eventPayload);
                if (!account) {
                    markMt5UnmappedLogin(eventPayload);
                    stillPending.push(item);
                    continue;
                }
                try {
                    const action = applyMt5Event(eventPayload, account);
                    if (action === "created") {
                        changedCount += 1;
                        const info = mt5EventTradeInfo(eventPayload);
                        const created = trades.find(trade => {
                            const meta = trade.mt5;
                            if (!meta) return false;
                            if (String(meta.login) !== String(eventPayload.account && eventPayload.account.login || "")) return false;
                            return parseInt(meta.positionId, 10) === parseInt(info.mt5PositionId, 10) || parseInt(meta.orderTicket, 10) === parseInt(info.mt5OrderTicket, 10);
                        });
                        if (created && !createdIds.includes(Number(created.id))) createdIds.push(Number(created.id));
                    } else if (action === "updated") {
                        changedCount += 1;
                    }
                } catch (error) {
                    console.error("MT5 apply error", error);
                }
            }
            if (changedCount > 0) {
                mt5Runtime.newTradeIds = createdIds.length
                    ? [...mt5Runtime.newTradeIds, ...createdIds].slice(-20)
                    : mt5Runtime.newTradeIds;
            }
            mt5Runtime.inbox = stillPending;
            mt5Runtime.unmappedLogins = Array.from(new Set(
                stillPending
                    .map(item => String((item.event || {}).account && ((item.event || {}).account).login || ""))
                    .filter(Boolean)
            ));
            mt5Runtime.processedCount += changedCount;
            return changedCount;
        }

        // Flujo: apply (sync) → persistir runtime y trades → render → toast.
        async function mt5ProcessInboxPersisted() {
            const changedCount = mt5ProcessInbox();
            await saveMt5Runtime();
            if (changedCount > 0) {
                await saveToStorage();
                showToast(changedCount === 1
                    ? "MT5: 1 operación sincronizada"
                    : `MT5: ${changedCount} operaciones sincronizadas`);
            }
            updateMt5HeaderBadge();
            return changedCount;
        }

        /* --------- UI: chip del header y modal de configuración --------- */

        function updateMt5HeaderBadge() {
            const chip = document.getElementById("btn-mt5-sync");
            const label = document.getElementById("mt5StatusText");
            if (!chip || !label || !mt5Runtime || !mt5Config) return;
            const pending = mt5Runtime.inbox.length;
            const unmapped = mt5Runtime.unmappedLogins.length;
            let text = "MT5";
            let chipClass = "flex items-center gap-1.5 text-xs font-bold rounded-md px-3 py-1.5 border shadow-sm transition-all ";
            if (!mt5Config.enabled) {
                chipClass += "bg-gray-900/60 text-gray-400 border-main hover:bg-gray-800";
            } else if (mt5Runtime.connected === false) {
                text = "MT5!";
                chipClass += "bg-red-950/60 text-red-300 border-red-800 hover:bg-red-900/60";
            } else if (unmapped > 0) {
                text = `MT5 · ${unmapped} sin vincular`;
                chipClass += "bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/50";
            } else if (pending > 0) {
                text = `MT5 · ${pending}`;
                chipClass += "bg-blue-950/40 text-blue-300 border-blue-800 hover:bg-blue-900/50";
            } else {
                chipClass += "bg-green-950/50 text-green-300 border-green-800 hover:bg-green-900/40";
            }
            const hints = [];
            if (mt5Runtime.lastAccount) hints.push(`Cuenta MT5: ${mt5Runtime.lastAccount.login} (${mt5Runtime.lastAccount.server})`);
            if (mt5Runtime.lastSyncAt) hints.push(`Últ. sync: ${new Date(mt5Runtime.lastSyncAt).toLocaleString("es-AR")}`);
            if (mt5Runtime.lastError) hints.push(mt5Runtime.lastError);
            label.textContent = text;
            chip.className = chipClass;
            chip.title = hints.length ? hints.join("\n") : "Puente MT5 (solo lectura)";
        }

        function openMt5Modal() {
            if (!mt5Runtime) { showToast("El puente MT5 todavía se está inicializando…", true); return; }
            renderMt5ModalBody();
            document.getElementById("mt5Modal").classList.remove("hidden");
        }

        function closeMt5Modal() {
            document.getElementById("mt5Modal").classList.add("hidden");
        }

        function renderMt5ModalBody() {
            const container = document.getElementById("mt5ModalBody");
            if (!container) return;
            const status = [];
            let statusClass = "text-gray-400";
            if (!mt5Config.enabled) {
                status.push("Puente apagado. La Bitácora sigue funcionando normal.");
            } else if (mt5Runtime.connected === true) {
                statusClass = "text-green-400";
                status.push(mt5Runtime.lastAccount
                    ? `Conectado a MT5: cuenta ${mt5Runtime.lastAccount.login} — ${mt5Runtime.lastAccount.server || "servidor n/d"} (${mt5Runtime.lastAccount.currency || "?"})`
                    : "Conectado al puente MT5.");
            } else if (mt5Runtime.connected === false) {
                statusClass = "text-red-400";
                status.push(`Sin conexión: ${mt5Runtime.lastError || "no responde"}`);
            } else {
                status.push("Estado sin verificar todavía.");
            }
            const accountRows = realAccounts.filter(account => getAccountStage(account) !== "backtest").map(account => `
                    <div class="flex items-center justify-between gap-2 rounded border border-main bg-[#161b22] px-2 py-1.5">
                        <span class="text-xs text-gray-300 truncate">${escapeGalleryHtml(account.name)}</span>
                        <input type="text" inputmode="numeric" data-mt5-login="${account.id}" value="${escapeGalleryHtml(String(account.mt5Login || ""))}" placeholder="Login MT5" class="w-32 bg-gray-900 border border-main rounded p-1.5 text-xs text-white focus:border-blue-500 focus:outline-none">
                    </div>`).join("");
            const eventRows = buildMt5EventLogHtml();
            container.innerHTML = `
                <div class="rounded-lg border border-main bg-gray-900/60 p-3">
                    <p class="text-xs font-semibold ${statusClass}">${escapeGalleryHtml(status.join(" "))}</p>
                    ${mt5Runtime.lastError && !mt5Runtime.lastError.includes("MT5") ? `<p class="mt-1 text-[10px] text-red-400">${escapeGalleryHtml(mt5Runtime.lastError)}</p>` : ""}
                    <p class="mt-1 text-[10px] text-gray-500">Últimos eventos procesados: ${mt5Runtime.processedCount} · Bandeja pendiente: ${mt5Runtime.inbox.length}</p>
                </div>
                <label class="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <input type="checkbox" id="mt5EnabledInput" ${mt5Config.enabled ? "checked" : ""} class="h-4 w-4 accent-green-500">
                    <span><i class="fa-solid fa-plug-circle-bolt mr-1 text-green-400"></i>Activar puente MT5 (solo lectura)</span>
                </label>
                <div class="grid grid-cols-1 gap-2">
                    <div>
                        <label for="mt5EndpointInput" class="block text-[10px] font-semibold text-gray-400 mb-1">Endpoint del puente</label>
                        <input type="url" id="mt5EndpointInput" value="${escapeGalleryHtml(mt5Config.endpoint)}" class="w-full bg-gray-900 border border-main rounded p-2 text-xs text-white focus:border-blue-500 focus:outline-none" placeholder="http://127.0.0.1:8765">
                    </div>
                    <div>
                        <label for="mt5TokenInput" class="block text-[10px] font-semibold text-gray-400 mb-1">Token (vacío si no configuraste uno)</label>
                        <input type="text" id="mt5TokenInput" value="${escapeGalleryHtml(mt5Config.token)}" class="w-full bg-gray-900 border border-main rounded p-2 text-xs text-white focus:border-blue-500 focus:outline-none" placeholder="clave del config.json del puente">
                    </div>
                    <div>
                        <label for="mt5SymbolMapInput" class="block text-[10px] font-semibold text-gray-400 mb-1">Símbolo MT5 → Par (una línea por mapeo: US100m=US100)</label>
                        <textarea id="mt5SymbolMapInput" rows="3" class="w-full bg-gray-900 border border-main rounded p-2 text-xs text-white focus:border-blue-500 focus:outline-none" placeholder="XAUUSDm=XAUUSD">${escapeGalleryHtml(Object.entries(mt5Config.symbolMap || {}).map(([symbol, pair]) => `${symbol}=${pair}`).join("\n"))}</textarea>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="saveMt5ConfigForm()" class="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition"><i class="fa-solid fa-floppy-disk mr-1"></i>Guardar configuración</button>
                    <button type="button" onclick="testMt5Connection()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition"><i class="fa-solid fa-satellite-dish mr-1"></i>Probar conexión</button>
                    <button type="button" onclick="requestMt5Poll(true)" class="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2 px-3 rounded-lg transition"><i class="fa-solid fa-rotate mr-1"></i>Sincronizar ahora</button>
                </div>
                <div class="rounded-lg border border-main bg-gray-900/60 p-3">
                    <h4 class="text-xs font-bold text-gray-200 mb-2"><i class="fa-solid fa-link mr-1 text-blue-400"></i>Vincular cuentas Reales con MT5</h4>
                    <p class="text-[10px] text-gray-500 mb-2">El login de MT5 (número de cuenta). Los eventos esperan en la bandeja hasta que esté vinculado.</p>
                    <div class="space-y-1.5">${accountRows || '<p class="text-[10px] text-gray-500">No hay cuentas reales cargadas.</p>'}</div>
                    <button type="button" onclick="saveMt5LoginsPanel()" class="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg transition">Guardar logins MT5</button>
                </div>
                ${unmappedBlockHtml()}
                <div>
                    <h4 class="text-xs font-bold text-gray-200 mb-1"><i class="fa-solid fa-list-check mr-1 text-blue-400"></i>Nuevas operaciones para revisar</h4>
                    <div class="flex flex-wrap gap-1.5">
                        ${(mt5Runtime.newTradeIds.length
                            ? mt5Runtime.newTradeIds.map(tradeId => `<button type="button" onclick="openTradeModal(${Number(tradeId)})" class="bg-blue-950/60 hover:bg-blue-900/60 text-blue-200 text-[11px] font-semibold px-2 py-1 rounded border border-blue-800 transition"><i class="fa-solid fa-eye mr-1"></i>Revisar operación</button>`).join("")
                            : '<p class="text-[10px] text-gray-500">Sin novedades pendientes de revisión.</p>')}
                    </div>
                </div>
                ${eventRows}
                <div class="flex flex-wrap gap-2 pt-1">
                    <button type="button" onclick="importMt5EventsFromButton()" class="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold py-1.5 px-3 rounded-lg transition"><i class="fa-solid fa-file-import mr-1"></i>Importar eventos desde archivo</button>
                    <button type="button" onclick="clearMt5Inbox()" class="bg-red-950/60 hover:bg-red-900/60 text-red-300 text-[11px] font-semibold py-1.5 px-3 rounded-lg border border-red-900/60 transition"><i class="fa-solid fa-trash-can mr-1"></i>Vaciar bandeja</button>
                </div>
            `;
        }

        function unmappedBlockHtml() {
            const unmapped = mt5Runtime.unmappedLogins || [];
            if (!unmapped.length) return "";
            return `
                <div class="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3">
                    <h4 class="text-xs font-bold text-amber-300 mb-1.5"><i class="fa-solid fa-id-card-clip mr-1"></i>Cuentas MT5 sin vincular</h4>
                    <p class="text-[10px] text-gray-400">Estos logins llegaron con eventos y no coinciden con ninguna cuenta. Cargales el Login MT5 arriba.</p>
                    <div class="flex flex-wrap gap-1.5 mt-1.5">${unmapped.map(login => `<span class="bg-amber-900/40 text-amber-200 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-800">${escapeGalleryHtml(String(login))}</span>`).join("")}</div>
                </div>`;
        }

        function buildMt5EventLogHtml() {
            // Los últimos 8 eventos de la bandeja sin procesar + info de los procesados.
            const pending = mt5Runtime.inbox.slice(-8).reverse();
            if (!pending.length) return "";
            const rows = pending.map(item => {
                const eventPayload = item.event || item;
                const info = mt5EventTradeInfo(eventPayload);
                const at = mt5IsoToParts(info.mt5OpenedAt || (item.receivedAt || ""), {}) || { fecha: "", hora: "" };
                const account = findMt5Account(eventPayload);
                return `<li class="text-[10px] text-gray-400 truncate">${eventPayload.type || "?"} · ${escapeGalleryHtml(String(info.symbol || ""))} · ${escapeGalleryHtml(String(info.mt5OrderType || ""))} · ${escapeGalleryHtml(at.fecha)} ${escapeGalleryHtml(at.hora)} · ${account ? escapeGalleryHtml(account.name) : `<span class="text-amber-300">cuenta ${escapeGalleryHtml(String(eventPayload.account && eventPayload.account.login || "?"))} sin vincular</span>`}</li>`;
            }).join("");
            return `
                <div>
                    <h4 class="text-xs font-bold text-gray-200 mb-1"><i class="fa-solid fa-inbox mr-1 text-blue-400"></i>Bandeja (eventos sin procesar)</h4>
                    <ul class="space-y-1">${rows}</ul>
                </div>`;
        }

        function saveMt5ConfigForm() {
            const enabled = document.getElementById("mt5EnabledInput").checked;
            const endpoint = (document.getElementById("mt5EndpointInput").value || "").trim().replace(/\/+$/, "");
            const token = (document.getElementById("mt5TokenInput").value || "").trim();
            const mapRaw = (document.getElementById("mt5SymbolMapInput").value || "");
            const nextMap = {};
            mapRaw.split(/\r?\n/).forEach(line => {
                const [mt5, par] = line.split("=");
                if (mt5 && par && par.trim()) nextMap[mt5.trim().toUpperCase()] = par.trim().toUpperCase();
            });
            mt5Config.enabled = enabled;
            mt5Config.endpoint = endpoint || "http://127.0.0.1:8765";
            mt5Config.token = token;
            mt5Config.symbolMap = nextMap;
            if (enabled) mt5Runtime.connected = null;
            saveMt5Config().then(() => {
                showToast("Configuración del puente guardada");
                renderMt5ModalBody();
                updateMt5HeaderBadge();
                requestMt5Poll(true);
            });
        }

        function saveMt5LoginsPanel() {
            const inputs = document.querySelectorAll("[data-mt5-login]");
            let changed = 0;
            inputs.forEach(input => {
                const accountId = input.getAttribute("data-mt5-login");
                const account = realAccounts.find(acc => String(acc.id) === String(accountId));
                const value = (input.value || "").trim();
                if (!account) return;
                const previous = String(account.mt5Login || "");
                if (previous === value) return;
                account.mt5Login = value;
                changed += 1;
            });
            if (changed === 0) { showToast("Sin cambios en los logins MT5"); return; }
            saveToStorage().then(() => {
                showToast(`Logins MT5 guardados (${changed})`);
                requestMt5Poll(true);
            });
        }

        async function testMt5Connection() {
            showToast("Probando conexión con el puente MT5…");
            try {
                const health = await mt5Fetch("/health");
                if (!health) { showToast("fetch no disponible en este entorno", true); return; }
                mt5Runtime.connected = Boolean(health.connected);
                mt5Runtime.lastAccount = health.account || mt5Runtime.lastAccount;
                mt5Runtime.lastError = health.connected ? "" : (health.lastError || "");
                mt5Runtime.lastSyncAt = new Date().toISOString();
                await saveMt5Runtime();
                updateMt5HeaderBadge();
                renderMt5ModalBody();
                showToast(health.connected
                    ? `Conectado al puente. Terminal MT5: cuenta ${health.account ? health.account.login : "?"}`
                    : (health.lastError ? `Puente responde pero MT5 no: ${health.lastError}` : "Conectado al puente (sin MT5 abierto/logueado)"));
            } catch (error) {
                mt5Runtime.connected = false;
                mt5Runtime.lastError = mt5DescribeFetchError(error);
                await saveMt5Runtime();
                updateMt5HeaderBadge();
                renderMt5ModalBody();
                showToast(`No se pudo conectar: ${mt5Runtime.lastError}`, true);
            }
        }

        function importMt5EventsFromButton() {
            const input = document.getElementById("mt5ImportInput");
            if (input) { input.value = ""; input.click(); }
        }

        async function importMt5Events(event) {
            const file = event && event.target && event.target.files && event.target.files[0];
            if (!file) return;
            try {
                const raw = await file.text();
                let parsed = JSON.parse(raw);
                if (!Array.isArray(parsed) && Array.isArray(parsed.events)) parsed = parsed.events;
                if (!Array.isArray(parsed)) throw new Error("El archivo no contiene una lista de eventos");
                const valid = parsed.filter(item => item && typeof item === "object" && item.account && item.trade).map(event => ({ receivedAt: new Date().toISOString(), event }));
                if (!valid.length) throw new Error("Sin eventos válidos en el archivo");
                mt5Runtime.inbox = mt5Runtime.inbox.concat(valid);
                await saveMt5Runtime();
                await mt5ProcessInboxPersisted();
                showToast(`MT5: importados ${valid.length} eventos`);
            } catch (error) {
                showToast(`Archivo inválido: ${(error && error.message) || error}`, true);
            }
        }

        function clearMt5Inbox() {
            if (!mt5Runtime.inbox.length) { showToast("La bandeja ya está vacía"); return; }
            const count = mt5Runtime.inbox.length;
            mt5Runtime.inbox = [];
            saveMt5Runtime().then(() => {
                updateMt5HeaderBadge();
                renderMt5ModalBody();
                showToast(`Bandeja vaciada (${count} eventos descartados)`);
            });
        }

        function updateMt5TradeHint(meta) {
            const container = document.getElementById("mt5TradeHint");
            if (!container) return;
            if (!meta || !meta.auto) {
                container.classList.add("hidden");
                container.innerHTML = "";
                return;
            }
            const estado = String(meta.status || "open").toUpperCase();
            const price = Number(meta.entryPrice) || 0;
            const sl = Number(meta.slPrice) || 0;
            const tp = Number(meta.tpPrice) || 0;
            const net = Number(meta.netProfit);
            container.classList.remove("hidden");
            container.innerHTML = `
                <p class="font-semibold"><i class="fa-solid fa-robot mr-1 text-blue-400"></i>Sincronizada con MT5 (${escapeGalleryHtml(estado)})</p>
                <p class="text-blue-300/80">Entrada ${price || "—"}${sl ? ` · SL ${sl}` : ""}${tp ? ` · TP ${tp}` : ""}${Number(meta.volume) ? ` · ${(Number(meta.volume))} lot` : ""}${Number.isFinite(net) && meta.closeReason ? ` · P/L neto: ${net}` : ""}${meta.closeReason ? ` · ${escapeGalleryHtml(String(meta.closeReason))}` : ""}</p>
                <p class="text-[10px] text-blue-200/70">Al guardar, la Bitácora conserva los datos reales de MT5 (lote, pips, riesgo, RR y fecha/hora). Tu análisis y tus capturas no se tocan.</p>`;
        }


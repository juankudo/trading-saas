let presets = [];
        let selectedPresetIds = new Set();
        let collapsedGroups = new Set();
        let copiedPresets = new Map(); // id del preset -> lote copiado
        let mainCopiedValue = null;
        let exchangeRates = { USD: 1, EUR: 1, GBP: 1, JPY: 1, AUD: 1, CAD: 1, CHF: 1 }; 
        let calculatorPanelCollapsed = false;
        const COLLAPSED_GROUPS_STORAGE_KEY = 'lot_calc_collapsed_groups_v1';

        const INSTRUMENTS = {
            fx: { pipVal: 10, label: "Pips" },       // 10 unidades de la moneda cotizada
            fx_jpy: { pipVal: 1000, label: "Pips" }, // 1000 JPY
            gold: { pipVal: 10, label: "Pips" },     // 10 USD (1 lote = 100 oz, 1 pip = 0.10)
            silver: { pipVal: 50, label: "Pips" },   // 50 USD
            nas100: { pipVal: 1, label: "Puntos" },
            us30: { pipVal: 1, label: "Puntos" },
            dax: { pipVal: 1, label: "Puntos" },
            btc: { pipVal: 1, label: "USD" },
            eth: { pipVal: 1, label: "USD" }
        };

        const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$', CHF: '₣' };

        function formatCurrency(amount, currency) {
            const sym = SYMBOLS[currency] || '$';
            return `${sym}${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }

        // Abrevia montos de 4 cifras o más: 1500 -> 1.5k, 2000000 -> 2M
        function formatShortAmount(amount) {
            if (amount >= 1e6) return `${parseFloat((amount / 1e6).toFixed(1))}M`;
            if (amount >= 1000) return `${parseFloat((amount / 1000).toFixed(1))}k`;
            return amount.toFixed(2);
        }

        async function fetchExchangeRates() {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                if(!res.ok) throw new Error("Error en la Red");
                const data = await res.json();
                if(data && data.rates) {
                    exchangeRates = data.rates;
                    const statusIcon = document.getElementById('apiStatus');
                    if(statusIcon) statusIcon.innerHTML = '<i class="fa-solid fa-bolt text-amber-400" title="API conectada: Cálculo cruzado 100% exacto"></i>';
                    calculateMain();
                    renderPresets();
                }
            } catch(e) {
                console.warn("Modo offline: Las tasas cruzadas se calcularán 1:1", e);
                const statusIcon = document.getElementById('apiStatus');
                if(statusIcon) statusIcon.innerHTML = '<i class="fa-solid fa-wifi-slash text-red-500" title="Sin conexión - Tasas cruzadas 1:1"></i>';
            }
        }

        function getPipValueInAccountCurrency(pipValInQuote, quoteCurrency, accountCurrency) {
            if (quoteCurrency === accountCurrency) return pipValInQuote;
            if (!exchangeRates[quoteCurrency] || !exchangeRates[accountCurrency]) return pipValInQuote;
            
            // Primero convertimos de la moneda del par (quote) a Dólar USD, y luego de Dólar a la Moneda de la Cuenta
            const valueInUSD = pipValInQuote / exchangeRates[quoteCurrency];
            return valueInUSD * exchangeRates[accountCurrency];
        }

        function toggleTheme() {
            const isLight = document.documentElement.classList.toggle('light');
            localStorage.setItem('calcTheme', isLight ? 'light' : 'dark');
        }

        function setCalculatorPanelCollapsed(collapsed, persist = true) {
            calculatorPanelCollapsed = collapsed;

            const layout = document.getElementById('dashboardLayout');
            const button = document.getElementById('calculatorToggle');
            const icon = document.getElementById('calculatorToggleIcon');
            const text = document.getElementById('calculatorToggleText');
            if (!layout || !button || !icon || !text) return;

            layout.classList.toggle('calculator-collapsed', collapsed);
            button.setAttribute('aria-expanded', String(!collapsed));
            button.title = collapsed ? 'Mostrar calculadora' : 'Ocultar calculadora';
            icon.className = `fa-solid ${collapsed ? 'fa-angles-right' : 'fa-angles-left'} text-blue-500`;
            text.textContent = collapsed ? 'Mostrar calculadora' : 'Ocultar calculadora';

            if (persist) localStorage.setItem('calculatorPanelCollapsed', collapsed ? '1' : '0');
        }

        function toggleCalculatorPanel() {
            setCalculatorPanelCollapsed(!calculatorPanelCollapsed);
        }

        function calculateMain() {
            const balance = parseFloat(document.getElementById('balance').value) || 0;
            const riskPct = parseFloat(document.getElementById('riskPct').value) || 0;
            const slPips = parseFloat(document.getElementById('slPips').value) || 0;
            
            const instSelect = document.getElementById('instrument');
            const instKey = instSelect.value;
            const quoteCur = instSelect.options[instSelect.selectedIndex].dataset.quote || 'USD';
            const acctCur = document.getElementById('accountCurrency').value;

            document.getElementById('unitLabel').textContent = INSTRUMENTS[instKey].label;

            if (balance <= 0 || riskPct <= 0 || slPips <= 0) {
                document.getElementById('resultLot').textContent = "0.00";
                document.getElementById('riskAmount').textContent = `${SYMBOLS[acctCur] || '$'}0.00 ${acctCur} en riesgo`;
                if (mainCopiedValue !== null) resetMainCopyBtn();
                return;
            }

            if (instKey === 'gold') maybeShowGoldPipsModal();

            const riskAmount = balance * (riskPct / 100);
            const pipValAcct = getPipValueInAccountCurrency(INSTRUMENTS[instKey].pipVal, quoteCur, acctCur);
            const lot = riskAmount / (slPips * pipValAcct);

            document.getElementById('resultLot').textContent = lot.toFixed(2);
            if (mainCopiedValue !== null && mainCopiedValue !== lot.toFixed(2)) resetMainCopyBtn();
            document.getElementById('riskAmount').textContent = `${formatCurrency(riskAmount, acctCur)} ${acctCur} en riesgo`;
            
            // Guardar en memoria
            localStorage.setItem('last_calc_balance', balance);
            localStorage.setItem('last_calc_risk', riskPct);
            localStorage.setItem('last_calc_inst', instKey);
            localStorage.setItem('last_calc_currency', acctCur);
        }

        // El estado "copiado" se mantiene hasta que cambie el valor del lote (o el SL de los setups)
        function copyLotage(btnElement, textToCopy, presetId) {
            if(!textToCopy || textToCopy === "0.00" || textToCopy === "---") return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                if (presetId !== undefined) copiedPresets.set(presetId, textToCopy);
                else mainCopiedValue = textToCopy;

                btnElement.innerHTML = `<i class="fa-solid fa-check"></i> ${textToCopy}`;
                btnElement.classList.add('copy-done');
            });
        }

        function resetMainCopyBtn() {
            mainCopiedValue = null;
            const btn = document.getElementById('mainCopyBtn');
            btn.classList.remove('copy-done');
            btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar Lotaje';
        }

        // Se muestra una vez por sesión al calcular oro, salvo que se haya marcado "no volver a mostrar"
        let goldPipsModalShown = false;

        function maybeShowGoldPipsModal() {
            if (goldPipsModalShown || localStorage.getItem('hideGoldPipsTip') === '1') return;
            goldPipsModalShown = true;
            document.getElementById('goldPipsModal').classList.remove('hidden');
        }

        function closeGoldPipsModal() {
            if (document.getElementById('goldPipsDontShow').checked) localStorage.setItem('hideGoldPipsTip', '1');
            document.getElementById('goldPipsModal').classList.add('hidden');
            document.getElementById('slPips').focus();
        }

        function saveCurrentAsPreset() {
            const balance = parseFloat(document.getElementById('balance').value) || 0;
            const riskPct = parseFloat(document.getElementById('riskPct').value) || 0;

            if (balance <= 0 || riskPct <= 0) return alert("Define balance y riesgo primero");

            document.getElementById('setupName').value = `Cuenta ${balance/1000}k | ${riskPct}%`;
            
            const groups = [...new Set(presets.map(p => p.group))];
            document.getElementById('existingGroupsList').innerHTML = groups.map(g => `<option value="${g}">`).join('');
            
            document.getElementById('saveSetupModal').classList.remove('hidden');
        }

        function closeSaveModal() {
            document.getElementById('saveSetupModal').classList.add('hidden');
        }

        function confirmSaveSetup() {
            const name = document.getElementById('setupName').value.trim();
            const group = document.getElementById('setupGroup').value.trim() || 'General';
            const balance = parseFloat(document.getElementById('balance').value);
            const riskPct = parseFloat(document.getElementById('riskPct').value);
            
            const instSelect = document.getElementById('instrument');
            const instKey = instSelect.value;
            const quoteCur = instSelect.options[instSelect.selectedIndex].dataset.quote || 'USD';
            const instNameFull = instSelect.options[instSelect.selectedIndex].text;
            const instName = instNameFull.split(' ')[0];

            if (!name) return alert("Ponle un nombre al setup");

            const accountCurrency = document.getElementById('accountCurrency').value;
            const newPreset = { id: Date.now(), name, balance, riskPct, instKey, instName, group, quoteCurrency: quoteCur, accountCurrency };
            presets.push(newPreset);
            localStorage.setItem('lot_calc_presets_v3', JSON.stringify(presets));
            
            closeSaveModal();
            renderPresets();
        }

        function deletePreset(id, e) {
            e.stopPropagation();
            presets = presets.filter(p => p.id !== id);
            selectedPresetIds.delete(id);
            localStorage.setItem('lot_calc_presets_v3', JSON.stringify(presets));
            renderPresets();
        }

        function togglePresetSelect(id) {
            if (selectedPresetIds.has(id)) {
                selectedPresetIds.delete(id);
                copiedPresets.delete(id);
            }
            else selectedPresetIds.add(id);
            renderPresets();
        }

        function saveCollapsedGroups() {
            localStorage.setItem(COLLAPSED_GROUPS_STORAGE_KEY, JSON.stringify([...collapsedGroups]));
        }

        function restoreCollapsedGroups() {
            try {
                const savedGroups = JSON.parse(localStorage.getItem(COLLAPSED_GROUPS_STORAGE_KEY) || '[]');
                const existingGroups = new Set(presets.map(p => p.group));
                if (Array.isArray(savedGroups)) {
                    collapsedGroups = new Set(savedGroups.filter(group => typeof group === 'string' && existingGroups.has(group)));
                }
            } catch (error) {
                console.warn('No se pudo restaurar el estado de los grupos', error);
            }
        }

        function toggleGroupCollapse(groupName, event) {
            event.stopPropagation();
            if (collapsedGroups.has(groupName)) collapsedGroups.delete(groupName);
            else collapsedGroups.add(groupName);
            saveCollapsedGroups();
            renderPresets();
        }

        function toggleGroup(groupName) {
            const groupPresets = presets.filter(p => p.group === groupName);
            const allSelected = groupPresets.every(p => selectedPresetIds.has(p.id));
            
            groupPresets.forEach(p => {
                if (allSelected) selectedPresetIds.delete(p.id);
                else selectedPresetIds.add(p.id);
            });

            // Los grupos seleccionados se muestran; al quitarles la selección se contraen.
            if (allSelected) collapsedGroups.add(groupName);
            else collapsedGroups.delete(groupName);
            saveCollapsedGroups();
            renderPresets();
        }

        function selectAllPresets() {
            presets.forEach(p => selectedPresetIds.add(p.id));
            renderPresets();
        }

        function clearPresetSelection() {
            selectedPresetIds.clear();
            copiedPresets.clear();
            renderPresets();
        }

        function clearCopiedMarks() {
            copiedPresets.clear();
            if (mainCopiedValue !== null) resetMainCopyBtn();
            renderPresets();
        }

        function getPresetQuoteCurrency(preset) {
            if (preset.quoteCurrency) return preset.quoteCurrency;
            
            // Fallback para presets antiguos si tenías alguno guardado
            if (preset.instKey === 'fx_jpy') return 'JPY';
            if (preset.instKey === 'dax') return 'EUR';
            if (['gold', 'silver', 'us30', 'nas100', 'btc', 'eth'].includes(preset.instKey)) return 'USD';
            
            if (preset.instName && preset.instName.length >= 6) {
                const q = preset.instName.substring(3, 6);
                if (['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].includes(q)) return q;
            }
            return 'USD';
        }

        function renderPresets() {
            const container = document.getElementById('presetsGrid');
            if (presets.length === 0) {
                container.innerHTML = `<div class="col-span-full py-8 text-center border-2 border-dashed border-main rounded-xl text-gray-500 bg-gray-900/10"><p class="text-xs">No hay setups guardados</p></div>`;
                return;
            }

            const groups = {};
            presets.forEach(p => {
                if (!groups[p.group]) groups[p.group] = [];
                groups[p.group].push(p);
            });

            const presetPips = parseFloat(document.getElementById('presetSlPips').value) || 0;
            const acctCur = document.getElementById('accountCurrency').value;

            container.innerHTML = Object.entries(groups).map(([groupName, groupPresets]) => {
                const allSelected = groupPresets.every(p => selectedPresetIds.has(p.id));
                const someSelected = groupPresets.some(p => selectedPresetIds.has(p.id));
                const isCollapsed = collapsedGroups.has(groupName);

                return `
                    <div class="col-span-full mb-1">
                        <div class="flex items-center justify-between mb-2 bg-gray-800/30 p-1.5 rounded-lg border border-main/50">
                            <div onclick="toggleGroup('${groupName}')" class="flex items-center gap-2 cursor-pointer group">
                                <i class="fa-solid ${allSelected ? 'fa-square-check text-blue-500' : (someSelected ? 'fa-square-minus text-blue-400' : 'fa-square text-gray-700')} text-sm"></i>
                                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">${groupName}</span>
                                <span class="text-[9px] bg-gray-800 text-gray-500 px-1.5 rounded-full">${groupPresets.length}</span>
                            </div>
                            <button onclick="toggleGroupCollapse('${groupName}', event)" class="text-gray-500 hover:text-white transition px-2">
                                <i class="fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-[10px]"></i>
                            </button>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 ${isCollapsed ? 'hidden' : ''}">
                            ${groupPresets.map(p => {
                                const isSelected = selectedPresetIds.has(p.id);
                                let lotResult = "---";
                                let copyButtonHTML = "";
                                const presetCur = p.accountCurrency || acctCur;
                                const riskAmount = p.balance * (p.riskPct / 100);
                                const riskLabel = `${SYMBOLS[presetCur] || '$'}${formatShortAmount(riskAmount)}<span class="text-[7px] font-bold ml-0.5">${presetCur} (riesgo)</span>`;

                                if (presetPips > 0 && isSelected) {
                                    const quoteCur = getPresetQuoteCurrency(p);
                                    const pipValQuote = INSTRUMENTS[p.instKey].pipVal;
                                    const pipValAcct = getPipValueInAccountCurrency(pipValQuote, quoteCur, presetCur);

                                    lotResult = (riskAmount / (presetPips * pipValAcct)).toFixed(2);
                                    
                                    const isCopied = copiedPresets.get(p.id) === lotResult;
                                    copyButtonHTML = `
                                        <button onclick="copyLotage(this, '${lotResult}', ${p.id}); event.stopPropagation();" class="text-[9px] font-black bg-blue-600 hover:bg-blue-500 text-white border border-transparent px-2 py-1 rounded shadow-sm transition-all flex items-center gap-1 active:scale-95 ${isCopied ? 'copy-done' : ''}">
                                            ${isCopied ? `<i class="fa-solid fa-check"></i> ${lotResult}` : '<i class="fa-regular fa-copy"></i> COPIAR'}
                                        </button>
                                    `;
                                }

                                const displayName = p.instName || p.instKey.toUpperCase();

                                return `
                                    <div onclick="togglePresetSelect(${p.id})" class="preset-card bg-gray-900/40 p-2 border border-main flex flex-col group/item transition-all ${isSelected ? 'active border-blue-500/50 ring-1 ring-blue-500/20' : ''}">
                                        <div class="flex justify-between items-start mb-1.5 min-w-0">
                                            <div class="min-w-0 w-full">
                                                <p class="text-[11px] font-bold text-white truncate leading-none mb-1">${p.name}</p>
                                                <div class="flex items-center gap-0.5 text-[9px] text-gray-500 font-semibold min-w-0 whitespace-nowrap">
                                                    <span class="text-blue-400/80 shrink-0">${displayName}</span>
                                                    ${presetPips > 0 ? `
                                                    <span class="shrink-0">•</span>
                                                    <span class="text-red-500 font-black truncate" title="${formatCurrency(riskAmount, presetCur)} ${presetCur} (riesgo)">${riskLabel}</span>` : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex items-center justify-between gap-2 mt-auto">
                                            <div class="flex flex-col">
                                                <span class="text-lg font-black leading-none ${isSelected ? 'text-blue-400' : 'text-gray-700'}">${lotResult}</span>
                                            </div>
                                            ${copyButtonHTML}
                                        </div>

                                        <button onclick="deletePreset(${p.id}, event)" class="absolute -top-1.5 -right-1.5 bg-red-900/90 text-red-100 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-lg border border-red-700 z-10">
                                            <i class="fa-solid fa-xmark text-[8px]"></i>
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function calculateSelectedPresets() {
            copiedPresets.clear(); // Nuevo SL = nueva operación, se reinician los copiados
            renderPresets();
        }

        window.onload = () => {
            setCalculatorPanelCollapsed(localStorage.getItem('calculatorPanelCollapsed') === '1', false);

            const savedV3 = localStorage.getItem('lot_calc_presets_v3');
            const savedV2 = localStorage.getItem('lot_calc_presets_v2'); 
            
            if (savedV3) {
                presets = JSON.parse(savedV3);
            } else if (savedV2) {
                presets = JSON.parse(savedV2);
                localStorage.setItem('lot_calc_presets_v3', JSON.stringify(presets));
            }

            restoreCollapsedGroups();
            
            const lastBal = localStorage.getItem('last_calc_balance');
            const lastRisk = localStorage.getItem('last_calc_risk');
            const lastInst = localStorage.getItem('last_calc_inst');
            const lastCur = localStorage.getItem('last_calc_currency');
            
            if (lastBal) document.getElementById('balance').value = lastBal;
            if (lastRisk) document.getElementById('riskPct').value = lastRisk;
            if (lastInst) document.getElementById('instrument').value = lastInst;
            if (lastCur) document.getElementById('accountCurrency').value = lastCur;
            
            // Inicia la carga de precios al abrir (y luego calcula automáticamente)
            fetchExchangeRates(); 
        };

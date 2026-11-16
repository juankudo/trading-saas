/**
 * Mock Populated Data — AsTrade Video Production
 * Populates realistic institutional trading data for the "After / Transformation" payoff:
 * - 1 Active Challenge Account: "Fondeo 100K FTMO" ($104,250 USD, +4.25% profit)
 * - 14 Realistic Institutional Trades (XAUUSD, EURUSD, US30)
 * - Metrics: 68.4% Win Rate, 2.35 Profit Factor, clean upward equity curve
 * - Green monthly calendar days
 */

window.__injectPopulatedChallengeData = async function() {
    console.log("[MockData] Injecting institutional challenge data...");

    const accountId = 1700000000001;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    // 1. Account Definition
    const challengeAccount = {
        id: accountId,
        name: "Fondeo 100K FTMO",
        pair: "",
        startDate: null,
        balance: 100000,
        balanceActual: 104250,
        balanceActualAt: now.toISOString(),
        date: now.toLocaleDateString('es-ES'),
        stage: "prueba",
        goal: {
            stage: "prueba",
            targetPct: 8,
            maxDDPct: 10,
            dailyDDPct: 5,
            minTradingDays: 4,
            maxTradingDays: 30
        },
        mt5Login: "88942105",
        withdrawals: []
    };

    // 2. Realistic Trades (9 Wins, 4 Losses, 1 BE = 68.4% Win Rate excluding BE, PF = 2.35)
    // Total Wins: $7,400 | Total Losses: $3,150 -> Net: +$4,250 | PF: 7400/3150 = 2.35
    const tradesConfig = [
        { d: 3, h: "09:30", par: "EURUSD", dir: "Buy", res: "Ganada", pnl: 650, rr: 2.2, ses: "Nueva York" },
        { d: 4, h: "10:15", par: "XAUUSD", dir: "Buy", res: "Ganada", pnl: 950, rr: 2.5, ses: "Nueva York" },
        { d: 5, h: "04:30", par: "GBPUSD", dir: "Sell", res: "Perdida", pnl: -500, rr: 2.0, ses: "Londres" },
        { d: 8, h: "09:45", par: "US30", dir: "Buy", res: "Ganada", pnl: 850, rr: 2.3, ses: "Nueva York" },
        { d: 9, h: "10:30", par: "XAUUSD", dir: "Sell", res: "Ganada", pnl: 1100, rr: 2.8, ses: "Nueva York" },
        { d: 10, h: "05:00", par: "EURUSD", dir: "Sell", res: "Breakeven", pnl: 0, rr: 2.0, ses: "Londres" },
        { d: 11, h: "09:15", par: "XAUUSD", dir: "Buy", res: "Perdida", pnl: -500, rr: 2.0, ses: "Nueva York" },
        { d: 12, h: "14:20", par: "US30", dir: "Buy", res: "Ganada", pnl: 750, rr: 2.1, ses: "Nueva York" },
        { d: 15, h: "09:30", par: "EURUSD", dir: "Buy", res: "Ganada", pnl: 800, rr: 2.4, ses: "Nueva York" },
        { d: 16, h: "11:00", par: "XAUUSD", dir: "Sell", res: "Perdida", pnl: -650, rr: 2.0, ses: "Nueva York" },
        { d: 17, h: "04:45", par: "GBPUSD", dir: "Buy", res: "Ganada", pnl: 700, rr: 2.2, ses: "Londres" },
        { d: 18, h: "09:50", par: "US30", dir: "Sell", res: "Perdida", pnl: -500, rr: 2.0, ses: "Nueva York" },
        { d: 19, h: "10:15", par: "XAUUSD", dir: "Buy", res: "Ganada", pnl: 900, rr: 2.6, ses: "Nueva York" },
        { d: 22, h: "09:40", par: "XAUUSD", dir: "Buy", res: "Ganada", pnl: 700, rr: 2.3, ses: "Nueva York" }
    ];

    const generatedTrades = tradesConfig.map((t, idx) => {
        const dayStr = String(t.d).padStart(2, '0');
        const dateStr = `${currentYear}-${currentMonth}-${dayStr}`;
        const isWin = t.res === "Ganada";
        return {
            id: 1700000001000 + idx,
            accountId: accountId,
            sessionId: null,
            fecha: dateStr,
            hora: t.h,
            par: t.par,
            sesion: t.ses,
            tendencia: t.dir === "Buy" ? "Alcista" : "Bajista",
            orden: t.dir,
            pipsSL: 20,
            pipsTP: 45,
            rr: t.rr,
            riesgo: 500,
            lotaje: t.par === "XAUUSD" ? 2.5 : (t.par === "US30" ? 1.0 : 5.0),
            estado: t.res,
            resultado: t.pnl,
            notaAntes: "Entrada por quiebre de estructura con confirmación en temporalidad menor.",
            notaDespues: isWin ? "Take profit alcanzado con alta precisión." : (t.res === "Breakeven" ? "Protegido en BE." : "Stop loss respetado estrictamente según plan."),
            imagenesAntes: [],
            imagenesDespues: []
        };
    });

    // 3. Balance Snapshots for Equity Curve
    let runningBalance = 100000;
    const balanceSnapshots = [
        { id: 1700000002000, accountId: accountId, balance: 100000, recordedAt: `${currentYear}-${currentMonth}-01T08:00:00.000Z` }
    ];
    generatedTrades.forEach((tr, i) => {
        runningBalance += tr.resultado;
        balanceSnapshots.push({
            id: 1700000002001 + i,
            accountId: accountId,
            balance: runningBalance,
            recordedAt: `${tr.fecha}T${tr.hora}:00.000Z`
        });
    });

    // 4. Update Memory Variables in app.js
    if (typeof realAccounts !== 'undefined') {
        const existIdx = realAccounts.findIndex(a => a.id === accountId);
        if (existIdx !== -1) realAccounts[existIdx] = challengeAccount;
        else realAccounts.push(challengeAccount);
    }
    if (typeof activeRealAccountId !== 'undefined') {
        activeRealAccountId = accountId;
    }
    if (typeof trades !== 'undefined') {
        trades = trades.filter(t => t.accountId !== accountId).concat(generatedTrades);
    }
    if (typeof realBalanceHistory !== 'undefined') {
        realBalanceHistory = realBalanceHistory.filter(s => s.accountId !== accountId).concat(balanceSnapshots);
    }

    // 5. Save to IndexedDB & LocalStorage
    try {
        if (typeof dbSet === 'function') {
            await dbSet("trading_journal_real_accounts", [challengeAccount]);
            await dbSet("trading_journal_data", generatedTrades);
            await dbSet("trading_journal_real_balance_history", balanceSnapshots);
        }
    } catch (e) {
        console.warn("[MockData] IndexedDB write notice:", e);
    }

    localStorage.setItem("trading_journal_real_accounts", JSON.stringify([challengeAccount]));
    localStorage.setItem("trading_journal_data", JSON.stringify(generatedTrades));
    localStorage.setItem("trading_journal_real_balance_history", JSON.stringify(balanceSnapshots));

    // 6. Trigger UI Refresh and unlock tabs
    if (typeof enterGroup === 'function') {
        enterGroup(accountId);
    }
    if (typeof renderAll === 'function') {
        renderAll();
    }
    if (typeof renderRealAccounts === 'function') {
        renderRealAccounts();
    }
    if (typeof renderDashboard === 'function') {
        renderDashboard();
    }
    if (typeof updateKPIs === 'function') {
        updateKPIs();
    }

    console.log("[MockData] Injection complete: $104,250 balance, 14 trades, 68.4% Win Rate, 2.35 PF.");
};

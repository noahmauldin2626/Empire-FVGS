// ═══════════════════════════════════════════════════════════════
// EMPIRE — crypto.js  (NEW in Update 3)
// Crypto investments — buy coins, watch prices swing wildly.
//
// HOW CRYPTO DIFFERS FROM STOCKS:
//   • Higher volatility — prices swing much more each tick
//   • Floor is 10% of base price (stocks: 20%) — can nearly go to zero
//   • Ceiling is 1000% / 10× of base price (stocks: 500%) — can moon
//   • Fluctuates every 3 seconds (stocks: every 2 seconds)
//   • Lives in the "🪙 Crypto" tab in the right panel
//
// NEW gameState KEYS:
//   ownedCoins:   {} — { coinId: numberOfCoinsOwned }
//   cryptoPrices: {} — { coinId: currentPrice }
//
// FUNCTIONS CALLED FROM OUTSIDE THIS FILE:
//   initCryptoPrices()        — called by selectCharacter() and
//                               fillMissingFields() in game.js
//   fluctuateCryptoPrices()   — called by setInterval in startGame()
//   calculateCryptoDividends()— called by recalculateStats() in game.js
//   calculateCryptoNetWorth() — called by recalculateStats() in game.js
//   renderCrypto()            — called by updateUI() in game.js
//   switchTab(tab)            — called by onclick on tab buttons in index.html
// ═══════════════════════════════════════════════════════════════

// The 5 crypto coins available to buy and sell.
const CRYPTOS = [
  {
    id: "bytecoin",
    name: "ByteCoin",
    ticker: "BTC",
    emoji: "₿",
    description: "The original. Grandpa of crypto. Very dignified.",
    basePrice: 500,
    dividendPerCoin: 0.50,
    volatility: 0.25          // swings up to ±25% per tick
  },
  {
    id: "ethereal",
    name: "Ethereal",
    ticker: "ETH",
    emoji: "💎",
    description: "It's like ByteCoin but with more feelings.",
    basePrice: 350,
    dividendPerCoin: 0.35,
    volatility: 0.22
  },
  {
    id: "dojocoin",
    name: "DojoCoin",
    ticker: "DOJO",
    emoji: "🐕",
    description: "Started as a joke. Nobody is laughing anymore.",
    basePrice: 80,
    dividendPerCoin: 0.08,
    volatility: 0.35
  },
  {
    id: "shibinu",
    name: "Shibi-Nu",
    ticker: "SHBN",
    emoji: "🐾",
    description: "Much coin. Very wealth. Wow.",
    basePrice: 25,
    dividendPerCoin: 0.02,
    volatility: 0.40          // most volatile — can nearly go to zero or 10x
  },
  {
    id: "solara",
    name: "Solara",
    ticker: "SOL",
    emoji: "☀️",
    description: "Fast, cheap, and somehow still standing. Impressive.",
    basePrice: 180,
    dividendPerCoin: 0.18,
    volatility: 0.28
  },

  // ── UPDATE 5.5: NEW COINS ─────────────────────────────────────
  {
    id: "vaultcoin",
    name: "VaultCoin",
    ticker: "VLT",
    emoji: "🔒",
    description: "Backed by a promise, a handshake, and aggressive optimism.",
    basePrice: 620,
    dividendPerCoin: 0.62,
    volatility: 0.20
  },
  {
    id: "lunex",
    name: "LuneX",
    ticker: "LNX",
    emoji: "🌙",
    description: "They said it would moon. It's trying. It's really trying.",
    basePrice: 140,
    dividendPerCoin: 0.14,
    volatility: 0.32
  },
  {
    id: "pepetoken",
    name: "PepeToken",
    ticker: "PEPE",
    emoji: "🐸",
    description: "A frog. On a blockchain. Uncle Funds bought 10,000. Don't ask.",
    basePrice: 8,
    dividendPerCoin: 0.006,
    volatility: 0.45
  },
  {
    id: "ironchain",
    name: "IronChain",
    ticker: "IRON",
    emoji: "⛓️",
    description: "Industrial-grade blockchain for people who mean business.",
    basePrice: 890,
    dividendPerCoin: 0.90,
    volatility: 0.15
  },
  {
    id: "flashcoin",
    name: "FlashCoin",
    ticker: "FLSH",
    emoji: "⚡",
    description: "Transactions so fast they might have already happened.",
    basePrice: 310,
    dividendPerCoin: 0.30,
    volatility: 0.38
  }
];

// ── INIT ──────────────────────────────────────────────────────

// Seeds the starting price for every coin when a brand new game begins.
// Also called from fillMissingFields() in game.js for old saves that
// load after Update 3 for the first time (cryptoPrices would be empty).
function initCryptoPrices() {
  CRYPTOS.forEach(coin => {
    // Start near the base price with a tiny random nudge so they feel alive
    const nudge = 1 + (Math.random() * 0.1 - 0.05); // ±5%
    gameState.cryptoPrices[coin.id] =
      Math.round(coin.basePrice * nudge * 100) / 100;
  });
}

// ── PRICE FLUCTUATION ─────────────────────────────────────────

// Called every 3 seconds by the game loop (set up in startGame() in game.js).
// Crypto swings much harder than stocks — higher volatility AND wider range.
// Floor: 10% of base price.  Ceiling: 1000% (10×) of base price.
function fluctuateCryptoPrices() {
  CRYPTOS.forEach(coin => {
    const currentPrice  = gameState.cryptoPrices[coin.id] || coin.basePrice;
    const changePercent = (Math.random() * coin.volatility * 2) - coin.volatility;
    let   newPrice      = currentPrice * (1 + changePercent);

    // Wider range than stocks — crypto can nearly collapse or moon
    const floor   = coin.basePrice * 0.10;   // 10% floor (nearly zero)
    const ceiling = coin.basePrice * 10.00;  // 1000% ceiling (10×)
    newPrice = Math.max(floor, Math.min(ceiling, newPrice));

    gameState.cryptoPrices[coin.id] = Math.round(newPrice * 100) / 100;
  });

  // Refresh the crypto tab so the player sees updated prices
  renderCrypto();

  // If Portfolio tab is active, keep it fresh too
  const portfolioEl = document.getElementById("portfolio-list");
  if (portfolioEl && portfolioEl.style.display !== "none") {
    renderPortfolio();
  }
}

// ── INCOME CALCULATIONS ───────────────────────────────────────

// Total dividend income per second from all coins owned.
// This is called by recalculateStats() in game.js and added to passiveIncome.
function calculateCryptoDividends() {
  let total = 0;
  CRYPTOS.forEach(coin => {
    const coins = gameState.ownedCoins[coin.id] || 0;
    total += coins * coin.dividendPerCoin;
  });
  return total;
}

// Total market value of all coins owned (for net worth calculation).
// This is called by recalculateStats() in game.js and added to netWorth.
function calculateCryptoNetWorth() {
  let total = 0;
  CRYPTOS.forEach(coin => {
    const coins        = gameState.ownedCoins[coin.id] || 0;
    const currentPrice = gameState.cryptoPrices[coin.id] || coin.basePrice;
    total += coins * currentPrice;
  });
  return total;
}

// ── BUY FUNCTIONS ─────────────────────────────────────────────

// Buys exactly 'amount' coins of the given type.
// If the player can't afford the full amount, shows a toast and does nothing.
function buyCoins(coinId, amount) {
  const coin = CRYPTOS.find(c => c.id === coinId);
  if (!coin || amount <= 0) return false;

  const price     = gameState.cryptoPrices[coinId] || coin.basePrice;
  const totalCost = price * amount;

  if (gameState.cash < totalCost) {
    showToast(`Need ${formatMoney(totalCost)} to buy ${amount} coins! 📉`);
    return false;
  }

  gameState.cash -= totalCost;
  gameState.ownedCoins[coinId] = (gameState.ownedCoins[coinId] || 0) + amount;

  // Track cumulative spend for profit/loss calculation (Update 5.5)
  gameState.coinSpent[coinId] = (gameState.coinSpent[coinId] || 0) + totalCost;

  recalculateStats();
  saveGame();
  renderCrypto();
  updateUI();

  // Update 5.1: first crypto purchase triggers Uncle Funds dialogue
  if (!gameState.hasSeenFirstCrypto) {
    gameState.hasSeenFirstCrypto = true;
    triggerDialogue("first_crypto");
  }

  return true;
}

// Buys as many coins as the player can currently afford.
function buyCoinMax(coinId) {
  const coin = CRYPTOS.find(c => c.id === coinId);
  if (!coin) return;

  const price    = gameState.cryptoPrices[coinId] || coin.basePrice;
  const maxCoins = Math.floor(gameState.cash / price);

  if (maxCoins === 0) {
    showToast("Not enough cash to buy any coins! 📉");
    return;
  }

  buyCoins(coinId, maxCoins);

  const portfolioEl = document.getElementById("portfolio-list");
  if (portfolioEl && portfolioEl.style.display !== "none") {
    renderPortfolio();
  }
}

// ── SELL FUNCTIONS ────────────────────────────────────────────

// Sells exactly 'amount' coins.
// If the player owns FEWER than 'amount', sells all they have (graceful partial sell).
function sellCoins(coinId, amount) {
  const coin = CRYPTOS.find(c => c.id === coinId);
  if (!coin || amount <= 0) return false;

  const coinsOwned = gameState.ownedCoins[coinId] || 0;
  if (coinsOwned <= 0) {
    showToast("You don't own any of that coin!");
    return false;
  }

  const coinsToSell = Math.min(amount, coinsOwned);
  const price       = gameState.cryptoPrices[coinId] || coin.basePrice;
  const proceeds    = price * coinsToSell;

  gameState.cash        += proceeds;
  gameState.totalEarned += proceeds; // selling crypto counts as earnings

  // Reduce cost basis proportionally so break-even stays correct after partial sells
  const spent = gameState.coinSpent[coinId] || 0;
  if (spent > 0 && coinsOwned > 0) {
    gameState.coinSpent[coinId] = spent * (coinsOwned - coinsToSell) / coinsOwned;
  }

  gameState.ownedCoins[coinId] = coinsOwned - coinsToSell;

  recalculateStats();
  saveGame();
  renderCrypto();
  updateUI();

  if (coinsToSell < amount) {
    showToast(`Only had ${coinsToSell} — sold all for ${formatMoney(proceeds)}! 🎉`);
  }

  return true;
}

// Sells every coin of a given type at once.
function sellAllCoins(coinId) {
  const coin = CRYPTOS.find(c => c.id === coinId);
  if (!coin) return false;

  const coins = gameState.ownedCoins[coinId] || 0;
  if (coins <= 0) {
    showToast("You don't own any of that coin!");
    return false;
  }

  const price    = gameState.cryptoPrices[coinId] || coin.basePrice;
  const proceeds = price * coins;

  gameState.cash        += proceeds;
  gameState.totalEarned += proceeds;
  gameState.ownedCoins[coinId] = 0;
  gameState.coinSpent[coinId]  = 0; // full sell wipes cost basis

  recalculateStats();
  saveGame();
  renderCrypto();
  updateUI();

  showToast(`Sold all ${coins} coins for ${formatMoney(proceeds)}! 🎉`);

  const portfolioEl = document.getElementById("portfolio-list");
  if (portfolioEl && portfolioEl.style.display !== "none") {
    renderPortfolio();
  }

  return true;
}

// ── TAB SWITCHING ─────────────────────────────────────────────

// Switches between the Stocks, Crypto, and Portfolio tabs in the right panel.
// Called by onclick on the tab buttons in index.html.
// 'tab' should be "stocks", "crypto", or "portfolio".
function switchTab(tab) {
  const stocksList    = document.getElementById("stocks-list");
  const cryptoList    = document.getElementById("crypto-list");
  const portfolioList = document.getElementById("portfolio-list");
  const tabStocks     = document.getElementById("tab-stocks");
  const tabCrypto     = document.getElementById("tab-crypto");
  const tabPortfolio  = document.getElementById("tab-portfolio");

  if (!stocksList || !cryptoList) return;

  // Hide all, deactivate all
  stocksList.style.display    = "none";
  cryptoList.style.display    = "none";
  if (portfolioList) portfolioList.style.display = "none";
  if (tabStocks)    tabStocks.classList.remove("tab-active");
  if (tabCrypto)    tabCrypto.classList.remove("tab-active");
  if (tabPortfolio) tabPortfolio.classList.remove("tab-active");

  if (tab === "stocks") {
    stocksList.style.display = "";
    if (tabStocks) tabStocks.classList.add("tab-active");

  } else if (tab === "crypto") {
    cryptoList.style.display = "";
    if (tabCrypto) tabCrypto.classList.add("tab-active");
    renderCrypto();

  } else if (tab === "portfolio") {
    if (portfolioList) portfolioList.style.display = "";
    if (tabPortfolio)  tabPortfolio.classList.add("tab-active");
    renderPortfolio();
  }
}

// ── PORTFOLIO TAB ─────────────────────────────────────────────

function renderPortfolio() {
  const container = document.getElementById("portfolio-list");
  if (!container) return;

  // ── Gather stock holdings ──
  const stockHoldings = [];
  let totalStockValue    = 0;
  let totalStockInvested = 0;
  let totalStockDivSec   = 0;

  STOCKS.forEach(stock => {
    const shares = gameState.ownedStocks[stock.id] || 0;
    if (shares <= 0) return;
    const price   = gameState.stockPrices[stock.id] || stock.basePrice;
    const spent   = gameState.stockSpent[stock.id]  || 0;
    const value   = shares * price;
    const pnl     = value - spent;
    const pnlPct  = spent > 0 ? (pnl / spent) * 100 : 0;
    const divSec  = shares * stock.dividendPerShare;
    totalStockValue    += value;
    totalStockInvested += spent;
    totalStockDivSec   += divSec;
    stockHoldings.push({ stock, shares, price, spent, value, pnl, pnlPct, divSec });
  });

  // ── Gather crypto holdings ──
  const cryptoHoldings = [];
  let totalCryptoValue    = 0;
  let totalCryptoInvested = 0;
  let totalCryptoDivSec   = 0;

  CRYPTOS.forEach(coin => {
    const coins = gameState.ownedCoins[coin.id] || 0;
    if (coins <= 0) return;
    const price   = gameState.cryptoPrices[coin.id] || coin.basePrice;
    const spent   = gameState.coinSpent[coin.id]    || 0;
    const value   = coins * price;
    const pnl     = value - spent;
    const pnlPct  = spent > 0 ? (pnl / spent) * 100 : 0;
    const divSec  = coins * coin.dividendPerCoin;
    totalCryptoValue    += value;
    totalCryptoInvested += spent;
    totalCryptoDivSec   += divSec;
    cryptoHoldings.push({ coin, coins, price, spent, value, pnl, pnlPct, divSec });
  });

  const totalValue    = totalStockValue    + totalCryptoValue;
  const totalInvested = totalStockInvested + totalCryptoInvested;
  const totalPnl      = totalValue - totalInvested;
  const totalPnlPct   = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const totalDivSec   = totalStockDivSec  + totalCryptoDivSec;

  const nothingOwned = stockHoldings.length === 0 && cryptoHoldings.length === 0;

  if (nothingOwned) {
    container.innerHTML = `
      <div class="portfolio-empty">
        <div class="portfolio-empty-icon">📭</div>
        <div class="portfolio-empty-title">No Holdings Yet</div>
        <div class="portfolio-empty-msg">
          Buy stocks or crypto and they will appear here
          with live P&amp;L tracking.
        </div>
      </div>`;
    return;
  }

  // ── Summary card ──
  const pnlColor  = totalPnl >= 0 ? "#2e7d32" : "#c62828";
  const pnlArrow  = totalPnl >= 0 ? "▲" : "▼";
  const pnlSign   = totalPnl >= 0 ? "+" : "";

  let html = `
    <div class="portfolio-summary">
      <div class="portfolio-summary-title">📊 Portfolio Overview</div>
      <div class="portfolio-summary-grid">
        <div class="portfolio-stat">
          <span class="portfolio-stat-label">Total Value</span>
          <span class="portfolio-stat-value">${formatMoney(totalValue)}</span>
        </div>
        <div class="portfolio-stat">
          <span class="portfolio-stat-label">Total Invested</span>
          <span class="portfolio-stat-value">${formatMoney(totalInvested)}</span>
        </div>
        <div class="portfolio-stat">
          <span class="portfolio-stat-label">Overall P&amp;L</span>
          <span class="portfolio-stat-value" style="color:${pnlColor};">
            ${pnlArrow} ${pnlSign}${formatMoney(Math.abs(totalPnl))}
            <span style="font-size:0.8em;">(${pnlSign}${totalPnlPct.toFixed(1)}%)</span>
          </span>
        </div>
        <div class="portfolio-stat">
          <span class="portfolio-stat-label">Dividends/sec</span>
          <span class="portfolio-stat-value" style="color:#2e7d32;">${formatMoney(totalDivSec)}/s</span>
        </div>
      </div>
    </div>`;

  // ── Stock rows ──
  if (stockHoldings.length > 0) {
    html += `<div class="portfolio-section-label">📈 Stocks</div>`;
    stockHoldings.forEach(({ stock, shares, price, spent, value, pnl, pnlPct, divSec }) => {
      const color = pnl >= 0 ? "#2e7d32" : "#c62828";
      const arrow = pnl >= 0 ? "▲" : "▼";
      const sign  = pnl >= 0 ? "+" : "";
      html += `
        <div class="portfolio-row">
          <div class="portfolio-row-left">
            <span class="portfolio-row-emoji">${stock.emoji}</span>
            <div>
              <div class="portfolio-row-name">${stock.name} <span class="portfolio-row-ticker">${stock.ticker}</span></div>
              <div class="portfolio-row-sub">${shares} share${shares !== 1 ? "s" : ""} · ${formatMoney(divSec)}/s dividends</div>
            </div>
          </div>
          <div class="portfolio-row-right">
            <div class="portfolio-row-value">${formatMoney(value)}</div>
            <div class="portfolio-row-pnl" style="color:${color};">${arrow} ${sign}${formatMoney(Math.abs(pnl))} (${sign}${pnlPct.toFixed(1)}%)</div>
            <div class="portfolio-row-sub">@ ${formatStockPrice(price)} · avg cost ${formatStockPrice(shares > 0 ? spent / shares : 0)}</div>
          </div>
          <div class="portfolio-row-actions">
            <button class="btn stock-qty-btn btn-buy-max"
                    onclick="buyStockMax('${stock.id}')">Max Buy</button>
            <button class="btn stock-qty-btn btn-sell-all"
                    onclick="sellAllStock('${stock.id}')">Max Sell</button>
          </div>
        </div>`;
    });
  }

  // ── Crypto rows ──
  if (cryptoHoldings.length > 0) {
    html += `<div class="portfolio-section-label">🪙 Crypto</div>`;
    cryptoHoldings.forEach(({ coin, coins, price, spent, value, pnl, pnlPct, divSec }) => {
      const color = pnl >= 0 ? "#2e7d32" : "#c62828";
      const arrow = pnl >= 0 ? "▲" : "▼";
      const sign  = pnl >= 0 ? "+" : "";
      html += `
        <div class="portfolio-row">
          <div class="portfolio-row-left">
            <span class="portfolio-row-emoji">${coin.emoji}</span>
            <div>
              <div class="portfolio-row-name">${coin.name} <span class="portfolio-row-ticker">${coin.ticker}</span></div>
              <div class="portfolio-row-sub">${coins} coin${coins !== 1 ? "s" : ""} · ${formatMoney(divSec)}/s dividends</div>
            </div>
          </div>
          <div class="portfolio-row-right">
            <div class="portfolio-row-value">${formatMoney(value)}</div>
            <div class="portfolio-row-pnl" style="color:${color};">${arrow} ${sign}${formatMoney(Math.abs(pnl))} (${sign}${pnlPct.toFixed(1)}%)</div>
            <div class="portfolio-row-sub">@ ${formatCoinPrice(price)} · avg cost ${formatCoinPrice(coins > 0 ? spent / coins : 0)}</div>
          </div>
          <div class="portfolio-row-actions">
            <button class="btn stock-qty-btn btn-buy-max"
                    onclick="buyCoinMax('${coin.id}')">Max Buy</button>
            <button class="btn stock-qty-btn btn-sell-all"
                    onclick="sellAllCoins('${coin.id}')">Max Sell</button>
          </div>
        </div>`;
    });
  }

  container.innerHTML = html;
}

// ── PORTFOLIO STATS ───────────────────────────────────────────

// Returns portfolio intelligence stats for a single crypto coin.
// Mirrors getStockPortfolioStats() in stocks.js.
//
// breakEvenPrice = totalSpent / coinsCurrentlyOwned
//   = price needed to fully recover all spending if player sells everything now
function getCoinPortfolioStats(coinId, coinsOwned, currentPrice) {
  const totalSpent   = gameState.coinSpent[coinId] || 0;
  const currentValue = coinsOwned * currentPrice;
  const sellOutcome  = currentValue - totalSpent;
  const breakEvenPrice = (coinsOwned > 0 && totalSpent > 0)
    ? totalSpent / coinsOwned
    : 0;
  return { totalSpent, currentValue, sellOutcome, breakEvenPrice };
}

// ── RENDERING ─────────────────────────────────────────────────

// Formats a coin price with exactly 2 decimal places (e.g. $123.45).
function formatCoinPrice(price) {
  return "$" + price.toFixed(2);
}

// Builds (or rebuilds) the Crypto tab HTML.
// Layout mirrors the Stocks panel: cards with price, buy/sell buttons.
// Called by updateUI() in game.js and by fluctuateCryptoPrices() every 3s.
function renderCrypto() {
  const container = document.getElementById("crypto-list");
  if (!container) return;

  // If chapter 2 isn't unlocked yet, show a locked placeholder message.
  // (The container is hidden behind the stocks tab anyway, but this is clean.)
  if (!gameState || gameState.chapter < 2) {
    container.innerHTML = `
      <p style="color:#9e9e9e; font-size:0.85rem; text-align:center; padding:1rem;">
        Earn $2,000 total to unlock the crypto market!
      </p>
    `;
    return;
  }

  container.innerHTML = ""; // wipe and rebuild

  CRYPTOS.forEach(coin => {
    const currentPrice = gameState.cryptoPrices[coin.id] || coin.basePrice;
    const coinsOwned   = gameState.ownedCoins[coin.id]   || 0;

    // ── Trend indicator ──────────────────────────────────────
    const priceDiff  = currentPrice - coin.basePrice;
    const trendIcon  = priceDiff > 0 ? "📈" : priceDiff < 0 ? "📉" : "➡️";
    const trendClass = priceDiff > 0 ? "price-up" : priceDiff < 0 ? "price-down" : "";

    // ── Buy button affordability ─────────────────────────────
    const canAfford1   = gameState.cash >= currentPrice * 1;
    const canAfford10  = gameState.cash >= currentPrice * 10;
    const canAfford100 = gameState.cash >= currentPrice * 100;
    const canAffordMax = canAfford1;

    // ── Sell button availability ─────────────────────────────
    const canSell1   = coinsOwned >= 1;
    const canSell10  = coinsOwned >= 10;
    const canSell100 = coinsOwned >= 100;
    const canSellAll = coinsOwned >= 1;

    const card = document.createElement("div");
    card.className = "asset-card" + (coinsOwned > 0 ? " owned" : "");

    card.innerHTML = `
      <!-- Coin name and ticker -->
      <div class="asset-header">
        <span class="asset-emoji">${coin.emoji}</span>
        <div class="asset-name-block">
          <strong>${coin.name}</strong>
          <span class="stock-ticker">[${coin.ticker}]</span>
        </div>
      </div>

      <!-- Current price with trend arrow -->
      <div class="stock-price-row">
        <span class="stock-price ${trendClass}">${formatCoinPrice(currentPrice)}</span>
        <span class="stock-trend">${trendIcon}</span>
      </div>

      <!-- Stats: coins + portfolio intelligence if owned, or dividend rate if not -->
      ${coinsOwned > 0 ? (() => {
        const stats         = getCoinPortfolioStats(coin.id, coinsOwned, currentPrice);
        const outcomePos    = stats.sellOutcome >= 0;
        const outcomeColor  = outcomePos ? "#2e7d32" : "#c62828";
        const outcomePrefix = outcomePos ? "+" : "";
        const outcomeLabel  = outcomePos ? "Profit if sold now" : "Loss if sold now";
        return `
          <div class="asset-stats">
            <span>Coins: <strong>${coinsOwned.toLocaleString()}</strong></span>
            &nbsp;&nbsp;
            <span>Div: <strong>+${formatMoney(coinsOwned * coin.dividendPerCoin)}/sec</strong></span>
          </div>
          <div class="portfolio-stats-block">
            <div class="portfolio-stat-row">
              <span class="pstat-label">Current Value</span>
              <span class="pstat-value">${formatMoney(stats.currentValue)}</span>
            </div>
            <div class="portfolio-stat-row">
              <span class="pstat-label">Total Spent</span>
              <span class="pstat-value">${formatMoney(stats.totalSpent)}</span>
            </div>
            <div class="portfolio-stat-row">
              <span class="pstat-label">Break-Even Price</span>
              <span class="pstat-value">$${stats.breakEvenPrice.toFixed(2)}/coin</span>
            </div>
            <div class="portfolio-stat-row">
              <span class="pstat-label">${outcomeLabel}</span>
              <span class="pstat-value pstat-outcome"
                    style="color:${outcomeColor}; font-weight:900;">
                ${outcomePrefix}${formatMoney(stats.sellOutcome)}
              </span>
            </div>
          </div>
        `;
      })() : `
        <div class="asset-stats">
          Dividend: <strong>${formatMoney(coin.dividendPerCoin)}</strong>/coin/sec
        </div>
        <div class="asset-desc" style="font-size:0.75rem;color:#757575;margin-bottom:0.4rem;">
          ${coin.description}
        </div>
      `}

      <!-- BUY BUTTONS: x1, x10, x100, Max -->
      <div class="stock-btn-label">🪙 Buy:</div>
      <div class="stock-qty-row">
        <button class="btn stock-qty-btn ${canAfford1   ? 'btn-buy'     : 'btn-locked'}"
                onclick="buyCoins('${coin.id}', 1)"
                ${canAfford1   ? '' : 'disabled'}>x1</button>

        <button class="btn stock-qty-btn ${canAfford10  ? 'btn-buy'     : 'btn-locked'}"
                onclick="buyCoins('${coin.id}', 10)"
                ${canAfford10  ? '' : 'disabled'}>x10</button>

        <button class="btn stock-qty-btn ${canAfford100 ? 'btn-buy'     : 'btn-locked'}"
                onclick="buyCoins('${coin.id}', 100)"
                ${canAfford100 ? '' : 'disabled'}>x100</button>

        <button class="btn stock-qty-btn ${canAffordMax ? 'btn-buy-max' : 'btn-locked'}"
                onclick="buyCoinMax('${coin.id}')"
                ${canAffordMax ? '' : 'disabled'}>Max</button>
      </div>

      <!-- SELL BUTTONS: only shown if player owns at least 1 coin -->
      ${coinsOwned > 0 ? `
        <div class="stock-btn-label">💰 Sell:</div>
        <div class="stock-qty-row">
          <button class="btn stock-qty-btn ${canSell1   ? 'btn-sell'     : 'btn-locked'}"
                  onclick="sellCoins('${coin.id}', 1)"
                  ${canSell1   ? '' : 'disabled'}>x1</button>

          <button class="btn stock-qty-btn ${canSell10  ? 'btn-sell'     : 'btn-locked'}"
                  onclick="sellCoins('${coin.id}', 10)"
                  ${canSell10  ? '' : 'disabled'}>x10</button>

          <button class="btn stock-qty-btn ${canSell100 ? 'btn-sell'     : 'btn-locked'}"
                  onclick="sellCoins('${coin.id}', 100)"
                  ${canSell100 ? '' : 'disabled'}>x100</button>

          <button class="btn stock-qty-btn ${canSellAll ? 'btn-sell-all' : 'btn-locked'}"
                  onclick="sellAllCoins('${coin.id}')"
                  ${canSellAll ? '' : 'disabled'}>All</button>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

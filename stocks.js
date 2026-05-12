// ═══════════════════════════════════════════════════════════════
// EMPIRE — stocks.js
// All stock market data + buy/sell logic + price fluctuation.
//
// HOW STOCKS WORK:
//   • Each stock has a current price that fluctuates every 2 seconds
//     (changed from 5 seconds in Update 3 — markets are faster now)
//   • Buy low, sell high to make profit
//   • Each share you own also pays a small dividend ($/sec)
//
// UPDATE 3: Added 2 new stocks:
//   • SpaceyCo  [SPC]  — rocket company, decent volatility
//   • TrendTok  [TRTK] — viral video platform, high volatility
// ═══════════════════════════════════════════════════════════════

// Stock definitions.
// 'basePrice'        — starting price before any market movement
// 'dividendPerShare' — passive dollars per second earned per share you own
// 'volatility'       — how wildly the price swings each tick
// The current price lives in gameState.stockPrices[id]
const STOCKS = [
  {
    id: "pineapple",
    name: "Pineapple Inc",
    ticker: "PINE",
    emoji: "🍍",
    description: "They make a fruit-shaped phone. It's weirdly popular.",
    basePrice: 45,
    dividendPerShare: 0.05,   // $0.05/sec per share
    volatility: 0.12          // price swings up to ±12% each tick
  },
  {
    id: "goggle",
    name: "Goggle",
    ticker: "GGLE",
    emoji: "🔍",
    description: "You can search anything. Anything at all. Even embarrassing stuff.",
    basePrice: 120,
    dividendPerShare: 0.15,
    volatility: 0.10
  },
  {
    id: "amazin",
    name: "Amazin.com",
    ticker: "AMZN",
    emoji: "📦",
    description: "They'll deliver a single sock to your door in two hours. Amazing.",
    basePrice: 200,
    dividendPerShare: 0.28,
    volatility: 0.14
  },
  {
    id: "facenovel",
    name: "Facenovel",
    ticker: "FACE",
    emoji: "📱",
    description: "Your aunt's favourite place to share casserole photos.",
    basePrice: 80,
    dividendPerShare: 0.10,
    volatility: 0.18          // drama-prone — more volatile
  },
  {
    id: "microserve",
    name: "MicroSoft Serve",
    ticker: "MSFT",
    emoji: "💻",
    description: "Makes the thing that makes the thing that runs everything.",
    basePrice: 310,
    dividendPerShare: 0.45,
    volatility: 0.08          // boring but reliable — least volatile
  },

  // ── UPDATE 3: NEW STOCKS ──────────────────────────────────────

  {
    id: "spaceyco",
    name: "SpaceyCo",
    ticker: "SPC",
    emoji: "🚀",
    description: "They launch rockets. Some of them even land again.",
    basePrice: 420,
    dividendPerShare: 0.60,
    volatility: 0.16
  },
  {
    id: "trendtok",
    name: "TrendTok",
    ticker: "TRTK",
    emoji: "📹",
    description: "90% dance videos. 10% people falling. 100% addictive.",
    basePrice: 95,
    dividendPerShare: 0.12,
    volatility: 0.20
  }
];

// ── INIT ──────────────────────────────────────────────────────

// Called once when a NEW game starts (not when loading a save).
// Seeds the starting price for every stock in gameState.
function initStockPrices() {
  STOCKS.forEach(stock => {
    // Start near the base price with a tiny random nudge so they feel alive
    const nudge = 1 + (Math.random() * 0.1 - 0.05); // ±5%
    gameState.stockPrices[stock.id] = Math.round(stock.basePrice * nudge * 100) / 100;
  });
}

// ── PRICE FLUCTUATION ─────────────────────────────────────────

// Called every 2 seconds by the game loop (was 5 seconds before Update 3).
// Randomly shifts each stock price up or down within its volatility range.
function fluctuateStockPrices() {
  STOCKS.forEach(stock => {
    const currentPrice = gameState.stockPrices[stock.id] || stock.basePrice;

    // Random change between -volatility and +volatility
    const changePercent = (Math.random() * stock.volatility * 2) - stock.volatility;
    let newPrice = currentPrice * (1 + changePercent);

    // Keep prices in a sane range: 20% floor, 500% ceiling of base price
    const floor   = stock.basePrice * 0.20;
    const ceiling = stock.basePrice * 5.00;
    newPrice = Math.max(floor, Math.min(ceiling, newPrice));

    // Round to 2 decimal places
    gameState.stockPrices[stock.id] = Math.round(newPrice * 100) / 100;
  });

  // Refresh the stocks panel so the player sees the new prices
  renderStocks();
}

// ── INCOME CALCULATIONS ───────────────────────────────────────

// Returns total dividend income per second from all owned shares.
function calculateStockDividends() {
  let total = 0;
  STOCKS.forEach(stock => {
    const shares = gameState.ownedStocks[stock.id] || 0;
    total += shares * stock.dividendPerShare;
  });
  return total;
}

// Returns the total market value of all stocks the player owns.
// This contributes to net worth.
function calculateStockNetWorth() {
  let total = 0;
  STOCKS.forEach(stock => {
    const shares       = gameState.ownedStocks[stock.id] || 0;
    const currentPrice = gameState.stockPrices[stock.id] || stock.basePrice;
    total += shares * currentPrice;
  });
  return total;
}

// ── BUY FUNCTIONS ─────────────────────────────────────────────

// Buys exactly 'amount' shares of a stock.
// If the player can't afford the full amount, shows a toast and does nothing.
function buyStockAmount(stockId, amount) {
  const stock = STOCKS.find(s => s.id === stockId);
  if (!stock || amount <= 0) return false;

  const price     = gameState.stockPrices[stockId] || stock.basePrice;
  const totalCost = price * amount;

  if (gameState.cash < totalCost) {
    showToast(`Need ${formatMoney(totalCost)} to buy ${amount} shares! 📉`);
    return false;
  }

  // Deduct cost and add shares
  gameState.cash -= totalCost;
  gameState.ownedStocks[stockId] = (gameState.ownedStocks[stockId] || 0) + amount;

  // Track cumulative spend for profit/loss calculation (Update 5.5)
  gameState.stockSpent[stockId] = (gameState.stockSpent[stockId] || 0) + totalCost;

  recalculateStats();
  saveGame();
  renderStocks();
  updateUI();

  // Fire Uncle Funds' first-stock tutorial exactly once, ever.
  //
  // BUG FIX (Update 3.5): The old code checked whether total shares went
  // from 0 → >0, which re-triggered every time a player sold all their
  // stocks and bought again. We now use a persistent flag (hasSeenFirstStock)
  // so the tutorial plays on the very first purchase and never again —
  // even if the player later sells everything and starts buying again.
  if (!gameState.hasSeenFirstStock) {
    gameState.hasSeenFirstStock = true;
    saveGame(); // persist the flag so it survives a refresh
    triggerDialogue("first_stock");
  }

  return true;
}

// Buys as many shares as the player can currently afford.
// Calculates the max quantity and calls buyStockAmount().
function buyStockMax(stockId) {
  const stock = STOCKS.find(s => s.id === stockId);
  if (!stock) return;

  const price     = gameState.stockPrices[stockId] || stock.basePrice;
  // Math.floor rounds down — player can only buy whole shares
  const maxShares = Math.floor(gameState.cash / price);

  if (maxShares === 0) {
    showToast("Not enough cash to buy any shares! 📉");
    return;
  }

  buyStockAmount(stockId, maxShares);
}

// ── SELL FUNCTIONS ────────────────────────────────────────────

// Sells exactly 'amount' shares of a stock.
// If the player owns FEWER shares than 'amount', sells all they have
// rather than throwing an error — so "x10" gracefully sells 7 if
// the player only has 7.
function sellStockAmount(stockId, amount) {
  const stock = STOCKS.find(s => s.id === stockId);
  if (!stock || amount <= 0) return false;

  const sharesOwned = gameState.ownedStocks[stockId] || 0;
  if (sharesOwned <= 0) {
    showToast("You don't own any shares of that stock!");
    return false;
  }

  // Sell whatever is smaller: the requested amount or what's actually owned
  const sharesToSell = Math.min(amount, sharesOwned);
  const price        = gameState.stockPrices[stockId] || stock.basePrice;
  const proceeds     = price * sharesToSell;

  gameState.cash        += proceeds;
  gameState.totalEarned += proceeds;
  gameState.ownedStocks[stockId] = sharesOwned - sharesToSell;

  recalculateStats();
  saveGame();
  renderStocks();
  updateUI();

  // Let the player know if we sold fewer shares than they asked for
  if (sharesToSell < amount) {
    showToast(`Only had ${sharesToSell} — sold all for ${formatMoney(proceeds)}! 🎉`);
  }

  return true;
}

// Sells every single share of a stock at once.
// Called by the "All" sell button.
function sellAllStock(stockId) {
  const stock = STOCKS.find(s => s.id === stockId);
  if (!stock) return false;

  const shares = gameState.ownedStocks[stockId] || 0;
  if (shares <= 0) {
    showToast("You don't own any shares of that stock!");
    return false;
  }

  const price    = gameState.stockPrices[stockId] || stock.basePrice;
  const proceeds = price * shares;

  gameState.cash        += proceeds;
  gameState.totalEarned += proceeds;
  gameState.ownedStocks[stockId] = 0;

  recalculateStats();
  saveGame();
  renderStocks();
  updateUI();

  showToast(`Sold all ${shares} shares for ${formatMoney(proceeds)}! 🎉`);
  return true;
}

// ── PORTFOLIO STATS ───────────────────────────────────────────

// Returns portfolio intelligence stats for a single stock.
// Called inside renderStocks() for every card that has shares owned.
//
// Returns an object with:
//   totalSpent     — total cash ever spent buying this stock
//   currentValue   — value of current holdings at current price
//   sellOutcome    — currentValue - totalSpent (positive = profit, negative = loss)
//   breakEvenPrice — totalSpent / sharesCurrentlyOwned
//                    (price needed to recover full spend if player sells everything now)
function getStockPortfolioStats(stockId, sharesOwned, currentPrice) {
  const totalSpent   = gameState.stockSpent[stockId] || 0;
  const currentValue = sharesOwned * currentPrice;
  const sellOutcome  = currentValue - totalSpent;
  const breakEvenPrice = (sharesOwned > 0 && totalSpent > 0)
    ? totalSpent / sharesOwned
    : 0;
  return { totalSpent, currentValue, sellOutcome, breakEvenPrice };
}

// ── RENDERING ─────────────────────────────────────────────────

// Formats a stock price with exactly 2 decimal places (e.g. $52.34).
function formatStockPrice(price) {
  return "$" + price.toFixed(2);
}

// Builds (or rebuilds) the entire Stocks panel HTML.
// Each stock card shows:
//   • Name, ticker, current price, trend arrow
//   • Shares owned + dividend income (if owned)
//   • Four buy buttons: x1, x10, x100, Max
//   • Four sell buttons: x1, x10, x100, All (only shown if player has shares)
function renderStocks() {
  const container = document.getElementById("stocks-list");
  if (!container) return;

  container.innerHTML = ""; // wipe and rebuild

  STOCKS.forEach(stock => {
    const currentPrice = gameState.stockPrices[stock.id] || stock.basePrice;
    const sharesOwned  = gameState.ownedStocks[stock.id] || 0;

    // ── Trend indicator ──────────────────────────────────────
    // Compare current price to the base price to show trend direction
    const priceDiff  = currentPrice - stock.basePrice;
    const trendIcon  = priceDiff > 0 ? "📈" : priceDiff < 0 ? "📉" : "➡️";
    const trendClass = priceDiff > 0 ? "price-up" : priceDiff < 0 ? "price-down" : "";

    // ── Buy button affordability checks ─────────────────────
    const canAfford1   = gameState.cash >= currentPrice * 1;
    const canAfford10  = gameState.cash >= currentPrice * 10;
    const canAfford100 = gameState.cash >= currentPrice * 100;
    const canAffordMax = canAfford1;

    // ── Sell button availability checks ─────────────────────
    const canSell1   = sharesOwned >= 1;
    const canSell10  = sharesOwned >= 10;
    const canSell100 = sharesOwned >= 100;
    const canSellAll = sharesOwned >= 1;

    const card = document.createElement("div");
    card.className = "asset-card" + (sharesOwned > 0 ? " owned" : "");

    card.innerHTML = `
      <!-- Stock name and ticker -->
      <div class="asset-header">
        <span class="asset-emoji">${stock.emoji}</span>
        <div class="asset-name-block">
          <strong>${stock.name}</strong>
          <span class="stock-ticker">[${stock.ticker}]</span>
        </div>
      </div>

      <!-- Current price with trend arrow -->
      <div class="stock-price-row">
        <span class="stock-price ${trendClass}">${formatStockPrice(currentPrice)}</span>
        <span class="stock-trend">${trendIcon}</span>
      </div>

      <!-- Stats: shares + portfolio intelligence if owned, or dividend rate if not -->
      ${sharesOwned > 0 ? (() => {
        const stats         = getStockPortfolioStats(stock.id, sharesOwned, currentPrice);
        const outcomePos    = stats.sellOutcome >= 0;
        const outcomeColor  = outcomePos ? "#2e7d32" : "#c62828";
        const outcomePrefix = outcomePos ? "+" : "";
        const outcomeLabel  = outcomePos ? "Profit if sold now" : "Loss if sold now";
        return `
          <div class="asset-stats">
            <span>Shares: <strong>${sharesOwned.toLocaleString()}</strong></span>
            &nbsp;&nbsp;
            <span>Div: <strong>+${formatMoney(sharesOwned * stock.dividendPerShare)}/sec</strong></span>
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
              <span class="pstat-value">$${stats.breakEvenPrice.toFixed(2)}/share</span>
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
          Dividend: <strong>${formatMoney(stock.dividendPerShare)}</strong>/share/sec
        </div>
      `}

      <!-- BUY BUTTONS: x1, x10, x100, Max -->
      <div class="stock-btn-label">📈 Buy:</div>
      <div class="stock-qty-row">
        <button class="btn stock-qty-btn ${canAfford1   ? 'btn-buy'     : 'btn-locked'}"
                onclick="buyStockAmount('${stock.id}', 1)"
                ${canAfford1   ? '' : 'disabled'}>x1</button>

        <button class="btn stock-qty-btn ${canAfford10  ? 'btn-buy'     : 'btn-locked'}"
                onclick="buyStockAmount('${stock.id}', 10)"
                ${canAfford10  ? '' : 'disabled'}>x10</button>

        <button class="btn stock-qty-btn ${canAfford100 ? 'btn-buy'     : 'btn-locked'}"
                onclick="buyStockAmount('${stock.id}', 100)"
                ${canAfford100 ? '' : 'disabled'}>x100</button>

        <button class="btn stock-qty-btn ${canAffordMax ? 'btn-buy-max' : 'btn-locked'}"
                onclick="buyStockMax('${stock.id}')"
                ${canAffordMax ? '' : 'disabled'}>Max</button>
      </div>

      <!-- SELL BUTTONS: only shown if player owns at least 1 share -->
      ${sharesOwned > 0 ? `
        <div class="stock-btn-label">📉 Sell:</div>
        <div class="stock-qty-row">
          <button class="btn stock-qty-btn ${canSell1   ? 'btn-sell'     : 'btn-locked'}"
                  onclick="sellStockAmount('${stock.id}', 1)"
                  ${canSell1   ? '' : 'disabled'}>x1</button>

          <button class="btn stock-qty-btn ${canSell10  ? 'btn-sell'     : 'btn-locked'}"
                  onclick="sellStockAmount('${stock.id}', 10)"
                  ${canSell10  ? '' : 'disabled'}>x10</button>

          <button class="btn stock-qty-btn ${canSell100 ? 'btn-sell'     : 'btn-locked'}"
                  onclick="sellStockAmount('${stock.id}', 100)"
                  ${canSell100 ? '' : 'disabled'}>x100</button>

          <button class="btn stock-qty-btn ${canSellAll ? 'btn-sell-all' : 'btn-locked'}"
                  onclick="sellAllStock('${stock.id}')"
                  ${canSellAll ? '' : 'disabled'}>All</button>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

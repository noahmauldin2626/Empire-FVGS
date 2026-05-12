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

  recalculateStats();
  saveGame();
  renderCrypto();
  updateUI();

  showToast(`Sold all ${coins} coins for ${formatMoney(proceeds)}! 🎉`);
  return true;
}

// ── TAB SWITCHING ─────────────────────────────────────────────

// Switches between the Stocks tab and the Crypto tab in the right panel.
// Called by onclick on the tab buttons in index.html.
// 'tab' should be either "stocks" or "crypto".
function switchTab(tab) {
  const stocksList = document.getElementById("stocks-list");
  const cryptoList = document.getElementById("crypto-list");
  const tabStocks  = document.getElementById("tab-stocks");
  const tabCrypto  = document.getElementById("tab-crypto");

  if (!stocksList || !cryptoList) return; // elements not in DOM yet

  if (tab === "stocks") {
    // Show stocks content, hide crypto content
    stocksList.style.display = "";
    cryptoList.style.display = "none";

    // Highlight the stocks tab button
    if (tabStocks) tabStocks.classList.add("tab-active");
    if (tabCrypto) tabCrypto.classList.remove("tab-active");

  } else {
    // Show crypto content, hide stocks content
    stocksList.style.display = "none";
    cryptoList.style.display = "";

    // Highlight the crypto tab button
    if (tabStocks) tabStocks.classList.remove("tab-active");
    if (tabCrypto) tabCrypto.classList.add("tab-active");

    // Render fresh content when the player switches to this tab
    renderCrypto();
  }
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

      <!-- Stats: coins + dividends if owned, or dividend rate if not -->
      ${coinsOwned > 0 ? `
        <div class="asset-stats">
          🪙 <strong>${coinsOwned.toLocaleString()}</strong> coins &nbsp;
          💰 +${formatMoney(coinsOwned * coin.dividendPerCoin)}/sec
        </div>
        <div class="stock-value-row">
          Portfolio value: <strong>${formatMoney(coinsOwned * currentPrice)}</strong>
        </div>
      ` : `
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

// ═══════════════════════════════════════════════════════════════
// EMPIRE — game.js
// The main brain of the game.
// Loads last in index.html so all other files are available.
//
// WHAT THIS FILE DOES:
//   1. Defines gameState (all live game data)
//   2. Runs the main game loop every second
//   3. Handles clicks on the money button
//   4. Saves / loads progress (localStorage + Firebase cloud)
//   5. Checks for chapter unlocks and rich list rank changes
//   6. Updates all the numbers on screen
//
// UPDATE 3 CHANGES IN THIS FILE:
//   • New gameState keys: ownedCoins, cryptoPrices, ownedCars,
//     homeTier, lastSeenChangelog
//   • CHANGELOG_VERSION constant — auto-shows changelog once per update
//   • recalculateStats() now includes crypto dividends + net worth
//   • selectCharacter() now calls initCryptoPrices() for new games
//   • startGame() — manager panel is no longer locked, always renders;
//     stock interval changed from 5s → 2s; crypto interval added at 3s;
//     changelog auto-shows if player hasn't seen Update 3 yet
//   • updateUI() — always calls renderManager(); calls renderCrypto()
//   • unlockChapter(2) now also calls renderCrypto()
//   • unlockChapter(4) no longer locks/unlocks manager panel
//     (manager is available from the very start now)
//   • fillMissingFields() covers all new Update 3 gameState keys
//   • playAgain() resets all new keys
//   • showChangelog() and dismissChangelog() functions
// ═══════════════════════════════════════════════════════════════

// ── CHANGELOG VERSION ──────────────────────────────────────────
// Update this string each time you ship a new update.
// The changelog modal auto-shows once when this doesn't match
// what's stored in gameState.lastSeenChangelog.
const CHANGELOG_VERSION = "5_8_1";

// ── ACTIVE USERNAME ────────────────────────────────────────────
// Holds the name the player typed on the username screen.
// Set in handleUsernameSubmit() before anything else runs.
// Every save/load uses this name so each player has their own slot.
let activeUsername = "";

// ── LOGIN STATE ─────────────────────────────────────────────────
// handleUsernameSubmit() is single-pass: username + password are
// submitted together, Firebase is checked once, and the player
// proceeds immediately. The password is persisted in localStorage
// so returning players have the field pre-filled on next visit.

// ── GAME STATE ─────────────────────────────────────────────────
// This one object holds ALL the live data for the current game.
// Everything reads from and writes to this object.
const gameState = {
  // --- Money ---
  cash:          0,      // what the player currently has in their pocket
  totalEarned:   0,      // lifetime earnings — used to unlock Chapter 2
  netWorth:      0,      // cash + all asset values — determines Rich List rank
  clickValue:    1,      // how much one click/tap earns
  passiveIncome: 0,      // dollars per second from all sources combined

  // --- Player ---
  playerName:   "",
  playerGender: "",      // "male" or "female"

  // --- Progress ---
  chapter: 0,            // 0=intro, 1=properties, 2=stocks+crypto, 3=business, 4=milestone, 5=yachts

  // --- Owned Assets (Investments — affect net worth and income) ---
  ownedProperties: {},   // { propertyId: tierNumber }  e.g. { funky_flats: 2 }
  ownedStocks:     {},   // { stockId: sharesOwned }    e.g. { pineapple: 5 }
  ownedBusinesses: {},   // { businessId: level }       e.g. { burger_royale: 3 }
  stockPrices:     {},   // { stockId: currentPrice }   changes over time

  // --- Crypto (Update 3 — Investment: affects net worth and income) ---
  ownedCoins:   {},      // { coinId: coinsOwned }       e.g. { bytecoin: 2 }
  cryptoPrices: {},      // { coinId: currentPrice }     changes over time

  // --- Airline Fleet (Update 5.6) ---
  ownedAirlines: {},       // { assetId: tierNumber }
  airlineFleetUnlocked: false, // true once $50M net worth reached (Update 5.6.2)

  // --- Sector Managers (Update 5.6) ---
  // { managerId: level }  e.g. { real_estate: 2, market: 1 }
  // 0 or missing = not hired
  sectorManagers: {},

  // --- Portfolio Cost Basis (Update 5.5) ---
  // Tracks total cash spent on each stock/coin across all buy transactions.
  // Used to calculate profit/loss on the stats display in each card.
  // Keys are asset IDs (e.g. "pineapple", "bytecoin").
  // Values are cumulative dollar amounts spent, reduced proportionally on sell.
  stockSpent: {},        // { stockId: totalCashSpent }
  coinSpent:  {},        // { coinId:  totalCashSpent }

  // --- Yachts (Update 4 — Investment: affects net worth and income) ---
  yachtBusinessLevel: 0, // 0 = not purchased, 1–4 = current level
  ownedYachts:        {}, // { yachtId: tierNumber }     e.g. { sea_biscuit: 2 }

  // --- One-time tutorial flags (Update 3.5 / 5.1) ---
  // Using a saved flag instead of a share-count check means selling all
  // stocks and re-buying will never replay the first-stock tutorial.
  hasSeenFirstStock:   false,
  hasSeenFirstCrypto:  false, // Update 5.1: first crypto coin tutorial
  hasSeenFirstHypercar: false, // Update 5.1: first hypercar reaction

  // --- Audio volume settings (Update 5.1) ---
  // Placeholder values — audio system coming in a future update.
  volume_master: 80,   // master volume 0-100
  volume_click:  100,  // click sound volume 0-100
  volume_music:  60,   // music volume 0-100

  // --- Vanity Purchases (Update 3 — do NOT affect net worth or income) ---
  ownedCars: [],         // array of car id strings      e.g. ["civic", "mustang"]
  homeTier:  0,          // 0 = no home, 1–5 = current home tier

  // --- Manager ---
  managerLevel:            0,   // 0 = not hired
  managerTimerAccumulator: 0,   // seconds accumulated toward next auto-tap

  // --- Rich List ---
  currentRank:    11,    // 11 = unranked (below #10)
  ranksAchieved:  [],    // which rank numbers have already triggered dialogue

  // --- Tracking ---
  startTime:              null,  // timestamp when the game was started (for stats)
  totalClicks:            0,     // lifetime manual clicks
  hasSeenIntro:           false, // true after the Uncle Funds intro has played once
  totalManagerSalaryPaid: 0,     // lifetime total paid to the manager

  // --- Changelog (Update 3) ---
  lastSeenChangelog: "",  // set to CHANGELOG_VERSION after the player sees the modal

  // --- Bills (Update 5.6.4) ---
  totalBillsPaid:   0,    // lifetime total cash deducted by operating bills
  hasSeenFirstBill: false, // true after the first-bill tutorial fires

  // --- Lifestyle & Silly Purchases (Update 5.8 — vanity only, no income effect) ---
  lifestylePurchases:       [],    // array of purchased item id strings (lifestyle + silly)
  hasSeenFirstLifestyle:    false,
  hasSeenFirstSilly:        false,
  hasSeenFirstVacation:     false,

  // --- Theme (Update 5.8) ---
  theme: "dark",   // "dark" or "light"
};

// ── POWER CLICK STATE ──────────────────────────────────────────
// Tracks whether Power Click is currently active or cooling down.
// Hold Enter or Space to activate — fires clicks automatically for 15s.
let powerClickActive    = false; // true while the key is held and firing
let powerClickCooldown  = false; // true during the 3-sec cooldown
let powerClickInterval  = null;  // the setInterval handle for rapid clicks
let powerClickTimeout   = null;  // the setTimeout handle for the 10-sec limit
let powerClickCoolTimer = null;  // the setTimeout handle for cooldown expiry
let mouseHoldTimer      = null;  // setTimeout before mouse-hold activates Power Click
let mouseHoldActivated  = false; // true if mouse hold triggered Power Click this press

// ── FORMATTING ─────────────────────────────────────────────────

// Turns a big number into a readable string with a suffix.
// e.g. 1500 → "$1.5K"  |  2000000 → "$2.0M"
function formatMoney(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0";
  amount = Math.floor(amount);
  if (amount >= 1_000_000_000) return "$" + (amount / 1_000_000_000).toFixed(1) + "B";
  if (amount >= 1_000_000)     return "$" + (amount / 1_000_000).toFixed(1)     + "M";
  if (amount >= 1_000)         return "$" + (amount / 1_000).toFixed(1)         + "K";
  return "$" + amount.toLocaleString();
}

// ── SAVE KEY ───────────────────────────────────────────────────

// Returns the localStorage key for the current player's save.
// Each username gets a unique key so saves never collide.
// Example: username "flaco" → key "empire_save_v1_flaco"
function getSaveKey() {
  return "empire_save_v1_" + (activeUsername || "default");
}

// ── SAVE INDICATOR ─────────────────────────────────────────────

// Updates the small pill in the top bar: ☁️ Saved or 💾 Local.
function showSaveIndicator(status) {
  const el = document.getElementById("save-indicator");
  if (!el) return;

  if (status === "cloud") {
    el.textContent = "☁️ Saved";
    el.className   = "save-indicator save-cloud";
  } else if (status === "local") {
    el.textContent = "💾 Local";
    el.className   = "save-indicator save-local";
  } else if (status === "saving") {
    el.textContent = "⏳ Saving...";
    el.className   = "save-indicator save-saving";
  }
}

// ── SAVE TO LOCALSTORAGE ───────────────────────────────────────

// Saves to the browser's built-in storage. Instant, always works,
// even with no internet. Only available on this specific browser/device.
function saveToLocal() {
  try {
    localStorage.setItem(getSaveKey(), JSON.stringify(gameState));
  } catch (e) {
    console.warn("Local save failed:", e);
  }
}

// ── SAVE TO FIREBASE (CLOUD) ────────────────────────────────────

// Saves to Firebase so the player can access progress on any device.
// Runs in the background — the game never waits for it to finish.
// If Firebase isn't set up or the player is offline, fails silently.
function saveToCloud() {
  if (!window.db || !activeUsername) {
    showSaveIndicator("local");
    return;
  }

  showSaveIndicator("saving");

  window.db
    .ref("saves/" + activeUsername + "/saveData")
    .set(JSON.stringify(gameState))
    .then(function () {
      showSaveIndicator("cloud");
    })
    .catch(function (err) {
      console.warn("Cloud save failed (offline?):", err.message);
      showSaveIndicator("local");
    });
}

// ── MAIN SAVE FUNCTION ─────────────────────────────────────────

// Saves locally (instant) AND to the cloud (background).
// Call this any time something important changes.
function saveGame() {
  saveToLocal();
  saveToCloud();
}

// ── MISSING FIELD SAFETY NET ───────────────────────────────────

// After loading any save — cloud or local — we call this to fill
// in any fields that are missing from older saves.
//
// WHY THIS IS NEEDED:
// When a new field is added to gameState (like ownedCoins in Update 3),
// any save created before that update simply won't have that key.
// Object.assign() leaves missing keys at whatever the gameState default
// was. This function guarantees every field exists with a safe value,
// no matter how old the save is.
function fillMissingFields() {
  // --- Fields added before Update 3 ---
  if (gameState.totalManagerSalaryPaid === undefined) gameState.totalManagerSalaryPaid = 0;
  if (gameState.hasSeenIntro    === undefined) gameState.hasSeenIntro    = false;
  if (gameState.totalClicks     === undefined) gameState.totalClicks     = 0;
  if (gameState.ranksAchieved   === undefined) gameState.ranksAchieved   = [];
  if (gameState.stockPrices     === undefined) gameState.stockPrices     = {};
  if (gameState.ownedBusinesses === undefined) gameState.ownedBusinesses = {};
  if (gameState.ownedStocks     === undefined) gameState.ownedStocks     = {};
  if (gameState.ownedProperties === undefined) gameState.ownedProperties = {};

  // --- Fields added in Update 3 ---
  if (!gameState.ownedCoins)                            gameState.ownedCoins   = {};

  // --- Fields added in Update 3.5 ---
  // Guard for saves created before this flag existed — treat as "not seen yet"
  // so the tutorial still plays on first purchase for truly new players.
  if (gameState.hasSeenFirstStock === undefined)        gameState.hasSeenFirstStock = false;
  if (!gameState.ownedCars)                             gameState.ownedCars    = [];
  if (gameState.homeTier         === undefined)         gameState.homeTier     = 0;
  if (gameState.lastSeenChangelog === undefined ||
      gameState.lastSeenChangelog === null)             gameState.lastSeenChangelog = "";

  // Seed crypto prices if this is the first time this save is loaded
  // after Update 3 (cryptoPrices would be empty or missing).
  if (!gameState.cryptoPrices ||
      Object.keys(gameState.cryptoPrices).length === 0) {
    gameState.cryptoPrices = {};
    // initCryptoPrices() is defined in crypto.js which loads before game.js
    if (typeof initCryptoPrices === "function") {
      initCryptoPrices();
    }
  }

  // --- Fields added in Update 4 ---
  if (gameState.yachtBusinessLevel === undefined) gameState.yachtBusinessLevel = 0;
  if (gameState.ownedYachts        === undefined) gameState.ownedYachts        = {};

  // --- Fields added in Update 5.1 ---
  if (gameState.hasSeenFirstCrypto   === undefined) gameState.hasSeenFirstCrypto   = false;
  if (gameState.hasSeenFirstHypercar === undefined) gameState.hasSeenFirstHypercar = false;
  if (gameState.volume_master        === undefined) gameState.volume_master        = 80;
  if (gameState.volume_click         === undefined) gameState.volume_click         = 100;
  if (gameState.volume_music         === undefined) gameState.volume_music         = 60;

  // --- Fields added in Update 5.5 ---
  if (!gameState.stockSpent) gameState.stockSpent = {};
  if (!gameState.coinSpent)  gameState.coinSpent  = {};

  // --- Fields added in Update 5.6 ---
  if (!gameState.ownedAirlines)                    gameState.ownedAirlines        = {};
  if (!gameState.sectorManagers)                   gameState.sectorManagers       = {};
  if (gameState.airlineFleetUnlocked === undefined) gameState.airlineFleetUnlocked = false;

  // --- Fields added in Update 5.6.4 ---
  if (gameState.totalBillsPaid  === undefined) gameState.totalBillsPaid  = 0;
  if (gameState.hasSeenFirstBill === undefined) gameState.hasSeenFirstBill = false;

  // --- Fields added in Update 5.8 ---
  if (!gameState.lifestylePurchases)                   gameState.lifestylePurchases    = [];
  if (gameState.hasSeenFirstLifestyle === undefined)   gameState.hasSeenFirstLifestyle  = false;
  if (gameState.hasSeenFirstSilly     === undefined)   gameState.hasSeenFirstSilly      = false;
  if (gameState.hasSeenFirstVacation  === undefined)   gameState.hasSeenFirstVacation   = false;
  if (!gameState.theme)                                gameState.theme                  = "dark";

  // Update 5.5 guard — seeds prices for any NEW coins added to CRYPTOS
  // that are missing from an existing save's cryptoPrices object.
  // Runs for returning players whose saves pre-date the new coins.
  if (typeof CRYPTOS !== "undefined") {
    CRYPTOS.forEach(coin => {
      if (gameState.cryptoPrices[coin.id] === undefined) {
        const nudge = 1 + (Math.random() * 0.1 - 0.05);
        gameState.cryptoPrices[coin.id] =
          Math.round(coin.basePrice * nudge * 100) / 100;
      }
    });
  }
}

// ── LOAD GAME ──────────────────────────────────────────────────

// Tries to load the player's save. Returns true if a save was found.
//
// Checks in this order:
//   1. Firebase cloud (most up-to-date — works on any device)
//   2. localStorage with the username-based key (offline fallback)
//   3. localStorage with the OLD pre-username key "empire_save_v1"
//      (catches saves created before the username system was added)
//
// After every successful load, fillMissingFields() is called to
// safely handle any fields that didn't exist in older save files.
async function loadGame() {

  // ── 1. Try Firebase first ───────────────────────────────────
  if (window.db && activeUsername) {
    try {
      const snapshot = await window.db
        .ref("saves/" + activeUsername + "/saveData")
        .get();

      if (snapshot.exists()) {
        const parsed = JSON.parse(snapshot.val());
        Object.assign(gameState, parsed);
        fillMissingFields(); // fill any new fields missing from old saves
        console.log("✅ Loaded from Firebase cloud!");
        showSaveIndicator("cloud");
        return true;
      }
    } catch (err) {
      console.warn("Cloud load failed, trying local save...", err.message);
    }
  }

  // ── 2. Try localStorage with the username-based key ─────────
  try {
    const localData = localStorage.getItem(getSaveKey());
    if (localData) {
      const parsed = JSON.parse(localData);
      Object.assign(gameState, parsed);
      fillMissingFields();
      console.log("✅ Loaded from localStorage (username key)!");
      showSaveIndicator("local");
      return true;
    }
  } catch (err) {
    console.warn("Local save load failed:", err);
  }

  // ── 3. Try the old pre-username save key ─────────────────────
  // Saves created before the username system used the plain key
  // "empire_save_v1". If found, we migrate it to the new key.
  try {
    const legacyData = localStorage.getItem("empire_save_v1");
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      Object.assign(gameState, parsed);
      fillMissingFields();
      // Migrate: write under the new username key right away
      saveToLocal();
      console.log("✅ Migrated legacy save to new username key!");
      showSaveIndicator("local");
      return true;
    }
  } catch (err) {
    console.warn("Legacy save check failed:", err);
  }

  return false; // no save found anywhere — this is a brand new player
}

// ── RESET GAME ─────────────────────────────────────────────────

// Wipes the current player's save (local + cloud) and reloads the page.
function resetGame() {
  const confirmMsg = activeUsername
    ? `Are you sure? This will DELETE all progress for "${activeUsername}"!`
    : "Are you sure? This will DELETE all your progress!";

  if (!confirm(confirmMsg)) return;

  localStorage.removeItem(getSaveKey());

  if (window.db && activeUsername) {
    window.db.ref("saves/" + activeUsername).remove();
  }

  location.reload();
}

// ── PLAY AGAIN (after winning) ─────────────────────────────────

// Clears the save and goes back to character select.
// Same username is kept — the player just starts a new run.
// lastSeenChangelog is preserved so the changelog doesn't re-show.
function playAgain() {
  localStorage.removeItem(getSaveKey());

  if (window.db && activeUsername) {
    window.db.ref("saves/" + activeUsername).remove();
  }

  // Preserve the changelog flag so the update notes don't pop up again
  const savedChangelog = gameState.lastSeenChangelog;

  Object.assign(gameState, {
    cash: 0, totalEarned: 0, netWorth: 0, clickValue: 1,
    passiveIncome: 0, playerName: "", playerGender: "",
    chapter: 0, ownedProperties: {}, ownedStocks: {},
    ownedBusinesses: {}, stockPrices: {}, managerLevel: 0,
    managerTimerAccumulator: 0, currentRank: 11,
    ranksAchieved: [], startTime: null, totalClicks: 0,
    hasSeenIntro: false, totalManagerSalaryPaid: 0,
    // Update 3 keys:
    ownedCoins: {}, cryptoPrices: {}, ownedCars: [], homeTier: 0,
    lastSeenChangelog: savedChangelog, // keep this — player already saw the changelog

    // Update 3.5 keys: reset tutorial flag so a brand new run gets the tutorial
    hasSeenFirstStock: false,

    // Update 4 keys:
    yachtBusinessLevel: 0,
    ownedYachts: {},

    // Update 5.1 keys: reset tutorial flags; keep volume settings
    hasSeenFirstCrypto:   false,
    hasSeenFirstHypercar: false,

    // Update 5.5 keys: reset cost basis tracking for new run
    stockSpent: {},
    coinSpent:  {},

    // Update 5.6 keys:
    ownedAirlines:        {},
    sectorManagers:       {},
    airlineFleetUnlocked: false,

    // Update 5.6.4 keys:
    totalBillsPaid:   0,
    hasSeenFirstBill: false,

    // Update 5.8 keys:
    lifestylePurchases:    [],
    hasSeenFirstLifestyle: false,
    hasSeenFirstSilly:     false,
    hasSeenFirstVacation:  false,
    theme:                 "dark",
  });

  document.getElementById("win-screen").style.display   = "none";
  document.getElementById("game-screen").style.display  = "none";
  document.getElementById("intro-screen").style.display = "flex";
}

// ── STATS RECALCULATION ────────────────────────────────────────

// Recalculates click value, passive income, and net worth from scratch.
// Call this any time an asset is bought or upgraded.
// NOTE: Cars and Home are vanity — they are NOT included here.
function recalculateStats() {
  // --- Click Value ---
  const propClickBonus     = calculatePropertyClickBonus();
  const businessClickBonus = calculateBusinessClickBonus();
  const yachtClickBonus    = calculateYachtBusinessClickBonus(); // Update 4
  gameState.clickValue = 1 + propClickBonus + businessClickBonus + yachtClickBonus;

  // --- Sector Manager Multipliers (Update 5.6) ---
  const mProp    = getSectorMultiplier("real_estate");
  const mMarket  = getSectorMultiplier("market");
  const mBiz     = getSectorMultiplier("business");
  const mAirline = getSectorMultiplier("airline");
  const mYacht   = getSectorMultiplier("yacht");

  // --- Passive Income Per Second (multiplied by sector managers) ---
  const propIncome       = calculatePropertyIncome()       * mProp;
  const stockDividends   = calculateStockDividends()       * mMarket;
  const bizIncome        = calculateBusinessIncome()       * mBiz;
  const cryptoDividends  = calculateCryptoDividends()      * mMarket; // shares market multiplier
  const yachtBizIncome   = calculateYachtBusinessIncome()  * mBiz;    // yacht biz = business sector
  const yachtFleetIncome = calculateYachtFleetIncome()     * mYacht;
  const airlineFleetIncome = calculateAirlineFleetIncome() * mAirline; // Update 5.6
  gameState.passiveIncome = propIncome + stockDividends + bizIncome
                          + cryptoDividends + yachtBizIncome + yachtFleetIncome
                          + airlineFleetIncome;

  // --- Net Worth (no multipliers — asset value not inflated by managers) ---
  const propNetWorth   = calculatePropertyNetWorth();
  const stockValue     = calculateStockNetWorth();
  const bizNetWorth    = calculateBusinessNetWorth();
  const cryptoValue    = calculateCryptoNetWorth();        // Update 3
  const yachtBizNW     = calculateYachtBusinessNetWorth(); // Update 4
  const yachtFleetNW   = calculateYachtFleetNetWorth();    // Update 4
  const airlineFleetNW = calculateAirlineFleetNetWorth();  // Update 5.6
  gameState.netWorth   = gameState.cash + propNetWorth + stockValue + bizNetWorth
                       + cryptoValue + yachtBizNW + yachtFleetNW + airlineFleetNW;
  // Note: Cars (ownedCars) and Home (homeTier) are intentionally excluded — vanity only.
}

// ── BILLS SYSTEM (Update 5.6.4) ────────────────────────────────

// Returns the total operating bills per second across all sectors.
// Deducted from cash each tick in mainGameLoop — cash never goes below 0.
function calculateTotalBills() {
  const mProp    = getSectorMultiplier("real_estate");
  const mMarket  = getSectorMultiplier("market");
  const mBiz     = getSectorMultiplier("business");
  const mAirline = getSectorMultiplier("airline");
  const mYacht   = getSectorMultiplier("yacht");

  // Property taxes & maintenance (15% of property income)
  const propBills     = calculatePropertyIncome()      * mProp    * 0.15;
  // Brokerage & trading fees (8% of stock dividends)
  const stockBills    = calculateStockDividends()      * mMarket  * 0.08;
  // Exchange fees (5% of crypto dividends)
  const cryptoBills   = calculateCryptoDividends()     * mMarket  * 0.05;
  // Business operating costs (20% of business income)
  const bizBills      = calculateBusinessIncome()      * mBiz     * 0.20;
  // Yacht business overhead (18% of yacht business income)
  const yachtBizBills = calculateYachtBusinessIncome() * mBiz     * 0.18;
  // Yacht fleet maintenance (25% of yacht fleet income)
  const yachtBills    = calculateYachtFleetIncome()    * mYacht   * 0.25;
  // Airline fleet operations (22% of airline fleet income)
  const airlineBills  = calculateAirlineFleetIncome()  * mAirline * 0.22;

  return propBills + stockBills + cryptoBills + bizBills + yachtBizBills + yachtBills + airlineBills;
}

// ── MAIN GAME LOOP ─────────────────────────────────────────────

// Runs every second. Handles passive income, manager, unlocks, UI.
function mainGameLoop() {
  if (gameState.chapter === 0) return; // don't run during intro

  if (gameState.passiveIncome > 0) {
    gameState.cash        += gameState.passiveIncome;
    gameState.totalEarned += gameState.passiveIncome;
  }

  // Deduct operating bills each second (Update 5.6.4)
  const bills = calculateTotalBills();
  if (bills > 0) {
    gameState.cash = Math.max(0, gameState.cash - bills);
    gameState.totalBillsPaid = (gameState.totalBillsPaid || 0) + bills;

    // Fire the first-bill tutorial once bills are non-trivial and intro is done
    if (!gameState.hasSeenFirstBill && bills >= 1 && gameState.hasSeenIntro) {
      gameState.hasSeenFirstBill = true;
      triggerDialogue("first_bill");
    }
  }

  processManagerTap(1);
  processSectorManagerSalaries();   // Update 5.6 — sector manager salaries
  recalculateStats();
  checkChapterUnlocks();
  checkRichListRank();
  updateUI();
}

// ── CHAPTER UNLOCK CHECKS ──────────────────────────────────────

function checkChapterUnlocks() {
  if (gameState.chapter < 2 && gameState.totalEarned >= 2000)      unlockChapter(2);
  if (gameState.chapter < 3 && gameState.netWorth   >= 10000)      unlockChapter(3);
  if (gameState.chapter < 4 && gameState.netWorth   >= 25000)      unlockChapter(4);
  if (gameState.chapter < 5 && gameState.netWorth   >= 100000000)  unlockChapter(5); // Update 4: $100M

  // Update 5.6.2: Airline Fleet unlocks independently at $50M (before Yacht Fleet at $100M)
  if (!gameState.airlineFleetUnlocked && gameState.netWorth >= 50000000) {
    gameState.airlineFleetUnlocked = true;
    saveGame();
    const airlineEl = document.getElementById("airline-fleet-section");
    if (airlineEl) {
      airlineEl.classList.remove("panel-locked");
      const airlineHeader = airlineEl.querySelector(".panel-header");
      if (airlineHeader) airlineHeader.removeAttribute("data-locked-reason");
      renderAirlineFleet();
    }
  }
}

function unlockChapter(chapterNum) {
  gameState.chapter = chapterNum;
  saveGame();

  if (chapterNum === 2) {
    // Unlock the Stocks + Crypto panel
    const el = document.getElementById("right-panel");
    if (el) {
      el.classList.remove("panel-locked");
      const header = el.querySelector(".panel-header");
      if (header) header.removeAttribute("data-locked-reason");
      renderStocks();
      renderCrypto(); // Update 3: render crypto tab content too
    }
    triggerDialogue("ch2_unlock");
    // Update 5.1: crypto intro queues right after ch2_unlock dialogue.
    // The dialogue engine appends these lines to the end of the current queue.
    triggerDialogue("crypto_intro");
  }

  if (chapterNum === 3) {
    const el = document.getElementById("businesses-section");
    if (el) {
      el.classList.remove("panel-locked");
      const header = el.querySelector(".panel-header");
      if (header) header.removeAttribute("data-locked-reason");
      renderBusinesses();
    }
    triggerDialogue("ch3_unlock");
  }

  if (chapterNum === 4) {
    // Update 3: Manager panel is now always visible from game start —
    // no panel lock/unlock needed. Just refresh the manager display
    // so the hire button reflects the latest cash amount, then
    // fire the congratulations dialogue for hitting $25K.
    renderManager();
    triggerDialogue("ch4_unlock");
  }

  // Update 4: Yacht Fleet panel unlocks at $100M net worth
  if (chapterNum === 5) {
    const yachtEl = document.getElementById("yacht-fleet-section");
    if (yachtEl) {
      yachtEl.classList.remove("panel-locked");
      const header = yachtEl.querySelector(".panel-header");
      if (header) header.removeAttribute("data-locked-reason");
      renderYachtFleet();
    }
    // Note: Airline Fleet has its own $50M unlock via checkChapterUnlocks() — not here
    triggerDialogue("ch5_unlock");
  }
}

// ── RICH LIST RANK CHECKS ──────────────────────────────────────

const RANK_DIALOGUES = {
  10: "rank_10", 9: "rank_9", 8: "rank_8", 7: "rank_7",
  6: "rank_6",   5: "rank_5", 4: "rank_4", 3: "rank_3",
  2: "rank_2",   0: "win",
  // Update 4: Super-Tier ranks use string keys (JS coerces negative ints to strings)
  "-1": "rank_-1", "-2": "rank_-2",
  "-3": "rank_-3", "-4": "rank_-4",
  // Update 5.6.4: THE MONEY GHOST milestone + Apex Tier ranks A1–A4
  // (beating rank -10 / THE ARCHITECT returns rank 0 = "win" — handled above)
  "-5": "rank_-5",
  "-6": "rank_-6", "-7": "rank_-7",
  "-8": "rank_-8", "-9": "rank_-9"
};

function checkRichListRank() {
  const newRank = getPlayerRank(gameState.netWorth);

  if (newRank !== gameState.currentRank) {
    gameState.currentRank = newRank;

    if (!gameState.ranksAchieved.includes(newRank)) {
      gameState.ranksAchieved.push(newRank);
      if (RANK_DIALOGUES[newRank]) triggerDialogue(RANK_DIALOGUES[newRank]);
    }

    if (newRank === 0) setTimeout(showWinScreen, 3000);

    renderRichList();
  }
}

// ── CLICK HANDLER ──────────────────────────────────────────────

function handleMoneyClick(event) {
  if (gameState.chapter === 0) return;

  const earned = gameState.clickValue;
  gameState.cash        += earned;
  gameState.totalEarned += earned;
  gameState.totalClicks++;

  recalculateStats();
  updateUI();

  showFloatingMoney(earned, event.clientX, event.clientY, "click-float");

  const btn = document.getElementById("money-btn");
  if (btn) {
    btn.classList.add("btn-pulse");
    setTimeout(() => btn.classList.remove("btn-pulse"), 150);
  }
}

// ── POWER CLICK ─────────────────────────────────────────────────
// Hold Enter or Space to fire 10 clicks/sec for up to 15 seconds,
// then a 3-second cooldown. Releasing early also starts the cooldown.
// All clicks go through handleMoneyClick() so stats are correctly tracked.

function startPowerClick() {
  if (powerClickActive || powerClickCooldown || gameState.chapter === 0) return;
  powerClickActive = true;
  updatePowerClickUI();

  powerClickInterval = setInterval(function () {
    const btn = document.getElementById("money-btn");
    if (btn) {
      const rect      = btn.getBoundingClientRect();
      const fakeEvent = {
        clientX: rect.left + rect.width  / 2,
        clientY: rect.top  + rect.height / 2
      };
      handleMoneyClick(fakeEvent);
    }
  }, 100);

  // Auto-stop after 10 seconds
  powerClickTimeout = setTimeout(function () {
    stopPowerClick(true);
  }, 10000);
}

function stopPowerClick(triggerCooldown) {
  if (!powerClickActive) return;
  powerClickActive = false;
  clearInterval(powerClickInterval);
  clearTimeout(powerClickTimeout);
  powerClickInterval = null;
  powerClickTimeout  = null;

  // Always enter a 3-second cooldown after stopping (whether 15s expired or key released)
  powerClickCooldown = true;
  updatePowerClickUI();
  powerClickCoolTimer = setTimeout(function () {
    powerClickCooldown = false;
    updatePowerClickUI();
  }, 3000);
}

function updatePowerClickUI() {
  const indicator = document.getElementById("power-click-indicator");
  if (!indicator) return;
  if (powerClickActive) {
    indicator.textContent = "⚡ POWER CLICK ACTIVE";
    indicator.className   = "power-click-indicator power-click-on";
  } else if (powerClickCooldown) {
    indicator.textContent = "❄️ POWER CLICK COOLING DOWN...";
    indicator.className   = "power-click-indicator power-click-cooldown";
  } else {
    indicator.textContent = "Hold ENTER, SPACE or the button for Power Click";
    indicator.className   = "power-click-indicator power-click-ready";
  }
}

// ── FLOATING MONEY ANIMATION ────────────────────────────────────

function showFloatingMoney(amount, x, y, className = "click-float") {
  const el = document.createElement("div");
  el.className   = "floating-money " + className;
  el.textContent = "+" + formatMoney(amount);
  el.style.left  = x + "px";
  el.style.top   = y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ── TOAST NOTIFICATION ─────────────────────────────────────────

function showToast(message) {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id          = "toast";
  toast.className   = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// ── UI UPDATES ─────────────────────────────────────────────────

function updateUI() {
  setText("display-cash",         formatMoney(gameState.cash));
  setText("display-networth",     formatMoney(gameState.netWorth));
  setText("display-income",       formatMoney(gameState.passiveIncome) + "/sec");
  setText("display-click",        formatMoney(gameState.clickValue) + "/click");
  setText("display-click-center", formatMoney(gameState.clickValue));

  // Update 5.6.4: Bills display (red, shows operating costs per second)
  const bills = calculateTotalBills();
  setText("display-bills", "−" + formatMoney(bills) + "/sec");

  const rank = gameState.currentRank;
  const rankDisplay = rank === 11 ? "Unranked"
    : rank === 0 ? "👑 #1!"
    : rank < -5  ? "A" + Math.abs(rank + 5)  // Update 5.6.4: Apex-Tier A1–A5
    : rank < 0   ? "S" + Math.abs(rank)       // Update 4: Super-Tier S1–S5
    : "#" + rank;
  setText("display-rank", rankDisplay);

  if (activeUsername) {
    const nameParts = [activeUsername];
    if (gameState.playerName) nameParts.push("· " + gameState.playerName);
    setText("display-name", nameParts.join(" "));
  }

  // Render game panels based on chapter progress
  if (gameState.chapter >= 1) renderProperties();
  if (gameState.chapter >= 2) renderStocks();
  if (gameState.chapter >= 2) renderCrypto();   // Update 3: crypto lives alongside stocks
  if (gameState.chapter >= 3) renderBusinesses(); // also calls renderYachtBusiness() at end
  if (gameState.chapter >= 5)           renderYachtFleet();          // Update 4
  if (gameState.airlineFleetUnlocked)   renderAirlineFleet();         // Update 5.6.2: $50M unlock

  // Update 3: Manager is always visible from game start — render it every tick
  renderManager();

  renderRichList();
  renderFlex();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── CHANGELOG SYSTEM ───────────────────────────────────────────

// Shows the Update 3 changelog modal.
// If the player hasn't seen it yet, marks it as seen so it doesn't
// auto-show again. (Manually clicking the Changelog button also
// calls this function but the flag is already set, so it just shows.)
function showChangelog() {
  // Only update the flag if the player hasn't seen this version yet.
  // This way, manually reopening the changelog doesn't do anything extra.
  if (gameState.lastSeenChangelog !== CHANGELOG_VERSION) {
    gameState.lastSeenChangelog = CHANGELOG_VERSION;
    saveGame(); // save immediately so the flag persists on next load
  }

  const modal = document.getElementById("changelog-modal");
  if (modal) modal.style.display = "flex";
}

// Hides the changelog modal.
function dismissChangelog() {
  const modal = document.getElementById("changelog-modal");
  if (modal) modal.style.display = "none";
}

// ── PASSWORD MANAGEMENT ────────────────────────────────────────
// Passwords stored as plain text (no hashing — acceptable at this scale).
// Stored in both Firebase (saves/{username}/password) and localStorage
// (empire_password_{username}) for offline fallback.

async function savePassword(username, password) {
  localStorage.setItem("empire_password_" + username, password);
  if (window.db && username) {
    try {
      await window.db.ref("saves/" + username + "/password").set(password);
    } catch (err) {
      console.warn("Cloud password save failed:", err.message);
    }
  }
}

async function loadPassword(username) {
  if (window.db && username) {
    try {
      const snap = await window.db.ref("saves/" + username + "/password").get();
      if (snap.exists() && snap.val()) return snap.val();
    } catch (err) {
      console.warn("Cloud password load failed, checking local...", err.message);
    }
  }
  return localStorage.getItem("empire_password_" + username) || null;
}

async function deletePassword(username) {
  localStorage.removeItem("empire_password_" + username);
  if (window.db && username) {
    try {
      await window.db.ref("saves/" + username + "/password").remove();
    } catch (err) {
      console.warn("Cloud password delete failed:", err.message);
    }
  }
}

async function deleteAccount(username) {
  localStorage.removeItem("empire_save_v1_" + username);
  localStorage.removeItem("empire_password_" + username);
  if (window.db && username) {
    try {
      await window.db.ref("saves/" + username).remove();
    } catch (err) {
      console.warn("Cloud account delete failed:", err.message);
    }
  }
}

// ── SETTINGS MODAL ─────────────────────────────────────────────

function openSettings() {
  const display = document.getElementById("settings-username-display");
  if (display) display.textContent = activeUsername || "Unknown";

  // Restore saved volume slider positions
  ["master", "click", "music"].forEach(type => {
    const saved = gameState["volume_" + type];
    if (saved !== undefined) {
      const slider = document.getElementById("slider-" + type);
      const num    = document.getElementById("vol-" + type + "-display");
      if (slider) slider.value    = saved;
      if (num)    num.textContent = saved;
    }
  });

  // Sync theme button active state
  const darkBtn  = document.getElementById("theme-btn-dark");
  const lightBtn = document.getElementById("theme-btn-light");
  if (darkBtn)  darkBtn.classList.toggle("theme-btn-active",  gameState.theme === "dark");
  if (lightBtn) lightBtn.classList.toggle("theme-btn-active", gameState.theme !== "dark");

  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "flex";
}

function closeSettings() {
  const modal = document.getElementById("settings-modal");
  if (modal) modal.style.display = "none";
}

// ── THEME SYSTEM (Update 5.8) ────────────────────────────────────
function setTheme(themeName) {
  gameState.theme = themeName;
  applyTheme(themeName);
  saveGame();

  const darkBtn  = document.getElementById("theme-btn-dark");
  const lightBtn = document.getElementById("theme-btn-light");
  if (darkBtn)  darkBtn.classList.toggle("theme-btn-active",  themeName === "dark");
  if (lightBtn) lightBtn.classList.toggle("theme-btn-active", themeName === "light");
}

function applyTheme(themeName) {
  if (themeName === "light") {
    document.body.classList.add("theme-light");
    document.body.classList.remove("theme-dark");
  } else {
    document.body.classList.add("theme-dark");
    document.body.classList.remove("theme-light");
  }
}

// Called by each slider's oninput handler. Saves value immediately.
// TODO: when audio system launches, apply value to audio engine here.
function updateVolume(type, value) {
  const num = document.getElementById("vol-" + type + "-display");
  if (num) num.textContent = value;
  gameState["volume_" + type] = parseInt(value, 10);
  saveToLocal();
}

async function changePassword() {
  const input    = document.getElementById("settings-new-password");
  const feedback = document.getElementById("settings-pw-feedback");
  if (!input || !activeUsername) return;

  const newPw = input.value.trim();
  if (!newPw) {
    if (feedback) { feedback.textContent = "Password cannot be blank."; feedback.style.color = "#c62828"; }
    setTimeout(() => { if (feedback) feedback.textContent = ""; }, 3000);
    return;
  }
  await savePassword(activeUsername, newPw);
  if (feedback) { feedback.textContent = "Password updated successfully!"; feedback.style.color = "#388e3c"; }
  input.value = "";
  setTimeout(() => { if (feedback) feedback.textContent = ""; }, 3000);
}

function confirmDeleteAccount() {
  const confirmed = window.confirm(
    "DELETE ACCOUNT?\n\n" +
    "This will permanently erase ALL save data for '" + activeUsername + "'.\n" +
    "This cannot be undone.\n\n" +
    "A second confirmation will follow."
  );
  if (!confirmed) return;

  const typed = window.prompt("Type your username exactly to confirm: " + activeUsername);
  if (typed !== activeUsername) {
    alert("Username did not match. Account NOT deleted.");
    return;
  }

  deleteAccount(activeUsername).then(() => {
    alert("Account deleted. Returning to the start screen.");
    activeUsername = "";
    localStorage.removeItem("empire_username");
    location.reload();
  });
}

// ── USERNAME SCREEN ────────────────────────────────────────────

function showUsernameError(message) {
  const el = document.getElementById("username-error");
  if (el) el.textContent = message;
}

// Handles transition from username screen to intro or game.
function proceedToGame(hasSave) {
  if (hasSave && gameState.hasSeenIntro) {
    startGame();
  } else {
    document.getElementById("username-screen").style.display = "none";
    document.getElementById("intro-screen").style.display    = "flex";
  }
}

async function handleUsernameSubmit() {
  const input = document.getElementById("username-input");
  if (!input) return;

  const rawName = input.value.trim();
  const clean   = rawName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20);

  if (clean.length === 0) {
    showUsernameError("Please enter a name! Even 'player1' works!");
    return;
  }
  if (clean.length < 2) {
    showUsernameError("Name must be at least 2 characters. Try again!");
    return;
  }

  const passwordInput = document.getElementById("password-input");
  const enteredPw     = passwordInput ? passwordInput.value.trim() : "";

  showUsernameError("");
  const loadingEl = document.getElementById("username-loading");
  const submitBtn = document.getElementById("username-submit-btn");
  if (loadingEl) loadingEl.style.display = "block";
  if (submitBtn) submitBtn.disabled = true;

  activeUsername = clean;
  localStorage.setItem("empire_username", clean);

  const hasSave = await loadGame();
  const savedPw = await loadPassword(clean);

  if (loadingEl) loadingEl.style.display = "none";
  if (submitBtn) submitBtn.disabled = false;

  if (hasSave && savedPw) {
    // Scenario C — returning player WITH a saved password: require it
    if (!enteredPw) {
      showUsernameError("This account has a password. Please enter it.");
      if (passwordInput) passwordInput.focus();
      return;
    }
    if (enteredPw !== savedPw) {
      showUsernameError("Incorrect password. Try again.");
      if (passwordInput) { passwordInput.value = ""; passwordInput.focus(); }
      return;
    }
    // Correct — persist locally so the field auto-fills next visit
    localStorage.setItem("empire_password_" + clean, enteredPw);

  } else if (hasSave && !savedPw) {
    // Scenario B — returning player, no password on file yet: require one now
    if (!enteredPw) {
      showUsernameError("Please set a password to protect your account.");
      if (passwordInput) passwordInput.focus();
      return;
    }
    await savePassword(clean, enteredPw);
    showToast("Password set! Your account is now protected.");

  } else {
    // Scenario A — new player: require a password before entering
    if (!enteredPw) {
      showUsernameError("Please choose a password to protect your new account.");
      if (passwordInput) passwordInput.focus();
      return;
    }
    await savePassword(clean, enteredPw);
  }

  proceedToGame(hasSave);
}

// ── CHARACTER SELECT ───────────────────────────────────────────

function selectCharacter(gender) {
  const character = CHARACTERS[gender];
  gameState.playerName   = character.name;
  gameState.playerGender = gender;
  gameState.cash         = 500;
  gameState.totalEarned  = 500;
  gameState.chapter      = 1;
  gameState.startTime    = Date.now();

  initStockPrices();      // seed stock prices for a new game
  initCryptoPrices();     // Update 3: seed crypto prices for a new game

  saveGame();
  startGame();
}

// ── START GAME ─────────────────────────────────────────────────

// Transitions from any intro/select screen into the actual game.
// Applies all chapter-based panel states, starts game loops, and
// shows the changelog to players who haven't seen Update 3 yet.
function startGame() {
  document.getElementById("intro-screen").style.display    = "none";
  document.getElementById("username-screen").style.display = "none";
  document.getElementById("game-screen").style.display     = "block";

  // Show the player's username + character name in the top bar
  const nameParts = [activeUsername];
  if (gameState.playerName) nameParts.push("· " + gameState.playerName);
  setText("display-name", nameParts.join(" "));

  // Update player portrait emoji
  const portraitEl = document.getElementById("player-portrait-emoji");
  if (portraitEl) {
    const ch = CHARACTERS[gameState.playerGender];
    portraitEl.textContent = ch ? ch.portraitFallback : "🤵";
  }

  // Properties are always visible from Chapter 1 onward
  renderProperties();
  renderRichList();

  // ── Stocks + Crypto panel (Chapter 2) ────────────────────────
  const rightPanel = document.getElementById("right-panel");
  if (rightPanel) {
    if (gameState.chapter < 2) {
      // Not yet unlocked — keep the lock class on
      rightPanel.classList.add("panel-locked");
    } else {
      // Unlocked — remove the lock class, strip stale tooltip attr, render tabs
      rightPanel.classList.remove("panel-locked");
      const rpHeader = rightPanel.querySelector(".panel-header");
      if (rpHeader) rpHeader.removeAttribute("data-locked-reason");
      renderStocks();
      renderCrypto(); // Update 3: render crypto content alongside stocks
    }
  }

  // ── Businesses panel (Chapter 3) ──────────────────────────────
  const bizPanel = document.getElementById("businesses-section");
  if (bizPanel) {
    if (gameState.chapter < 3) {
      bizPanel.classList.add("panel-locked");
    } else {
      bizPanel.classList.remove("panel-locked");
      const bizHeader = bizPanel.querySelector(".panel-header");
      if (bizHeader) bizHeader.removeAttribute("data-locked-reason");
      renderBusinesses();
    }
  }

  // ── Manager panel — always visible from game start (Update 3) ─
  // The manager section is no longer locked behind chapter 4.
  // We simply render it so the hire button is ready immediately.
  const managerPanel = document.getElementById("manager-section");
  if (managerPanel) {
    managerPanel.classList.remove("panel-locked"); // ensure it's never locked
    renderManager();
  }

  // ── Yacht Fleet panel (Update 4, Chapter 5) ───────────────
  const yachtPanel = document.getElementById("yacht-fleet-section");
  if (yachtPanel) {
    if (gameState.chapter < 5) {
      yachtPanel.classList.add("panel-locked");
    } else {
      yachtPanel.classList.remove("panel-locked");
      const yachtHeader = yachtPanel.querySelector(".panel-header");
      if (yachtHeader) yachtHeader.removeAttribute("data-locked-reason");
      renderYachtFleet();
    }
  }

  // ── Airline Fleet panel (Update 5.6.2: unlocks at $50M independently) ──
  const airlinePanel = document.getElementById("airline-fleet-section");
  if (airlinePanel) {
    if (!gameState.airlineFleetUnlocked) {
      airlinePanel.classList.add("panel-locked");
    } else {
      airlinePanel.classList.remove("panel-locked");
      const airlineHeader = airlinePanel.querySelector(".panel-header");
      if (airlineHeader) airlineHeader.removeAttribute("data-locked-reason");
      renderAirlineFleet();
    }
  }

  recalculateStats();
  updateUI();

  // Update 5.1: initialise Power Click indicator to "ready" state
  updatePowerClickUI();
  applyTheme(gameState.theme);

  // ── Game loops ───────────────────────────────────────────────
  setInterval(mainGameLoop, 1000);             // main loop: every 1 second

  // Update 3: stocks now fluctuate every 2s (was 5s before Update 3)
  setInterval(fluctuateStockPrices, 2000);

  // Update 3: crypto fluctuates every 3s (separate, more frequent ticker)
  setInterval(fluctuateCryptoPrices, 3000);

  setInterval(saveGame, 30000);               // auto-save every 30 seconds

  // ── Intro dialogue (new games only) ──────────────────────────
  if (!gameState.hasSeenIntro) {
    gameState.hasSeenIntro = true;
    triggerDialogue("intro");
    setTimeout(() => triggerDialogue("ch1_unlock"), 500);
  }

  // ── Changelog auto-show (Update 3) ───────────────────────────
  // Show the changelog modal once to any player who loads the game
  // for the first time after Update 3. After they dismiss it,
  // lastSeenChangelog is saved and it never auto-shows again.
  if (gameState.lastSeenChangelog !== CHANGELOG_VERSION) {
    // Small delay so the game finishes painting before the modal appears
    setTimeout(showChangelog, 800);
  }
}

// ── WIN SCREEN ─────────────────────────────────────────────────

function showWinScreen() {
  const winScreen = document.getElementById("win-screen");
  if (!winScreen) return;

  const elapsedMs      = Date.now() - (gameState.startTime || Date.now());
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

  setText("win-player-name",   gameState.playerName);
  setText("win-net-worth",     formatMoney(gameState.netWorth));
  setText("win-total-earned",  formatMoney(gameState.totalEarned));
  setText("win-total-clicks",  gameState.totalClicks.toLocaleString());
  setText("win-time-played",   `${elapsedMinutes}m ${elapsedSeconds}s`);
  setText("win-salary-paid",   formatMoney(gameState.totalManagerSalaryPaid || 0));

  winScreen.style.display = "flex";
}

// ── BOOT ───────────────────────────────────────────────────────

// Runs as soon as the page finishes loading.
window.addEventListener("DOMContentLoaded", function () {

  // Wire up all button handlers
  const moneyBtn = document.getElementById("money-btn");
  if (moneyBtn) {
    // Regular click — skip if a mouse-hold just ended (Power Click already fired the earns)
    moneyBtn.addEventListener("click", function (e) {
      if (mouseHoldActivated) { mouseHoldActivated = false; return; }
      handleMoneyClick(e);
    });

    // ── MOUSE HOLD = POWER CLICK ──────────────────────────────
    // Holding the button > 150ms activates Power Click, same as Enter/Space.
    // Quick taps bypass this entirely so normal single clicks are unaffected.
    moneyBtn.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return; // left button only
      mouseHoldActivated = false;
      mouseHoldTimer = setTimeout(function () {
        mouseHoldTimer     = null;
        mouseHoldActivated = true;
        startPowerClick();
      }, 150);
    });

    function cancelMouseHold() {
      if (mouseHoldTimer !== null) {
        clearTimeout(mouseHoldTimer);
        mouseHoldTimer = null;
        // Held < 150ms — Power Click never started; let the click event fire normally
      } else if (powerClickActive) {
        stopPowerClick(true);
      }
    }

    moneyBtn.addEventListener("mouseup",    cancelMouseHold);
    moneyBtn.addEventListener("mouseleave", cancelMouseHold);
  }

  const nextBtn = document.getElementById("uncle-next-btn");
  if (nextBtn) nextBtn.addEventListener("click", advanceDialogue);

  const playAgainBtn = document.getElementById("play-again-btn");
  if (playAgainBtn) playAgainBtn.addEventListener("click", playAgain);

  const usernameInput = document.getElementById("username-input");
  const submitBtn     = document.getElementById("username-submit-btn");

  if (usernameInput) {
    usernameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleUsernameSubmit();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", handleUsernameSubmit);
  }

  // Pre-fill username (and password) if we recognise this browser
  const savedUsername = localStorage.getItem("empire_username");
  const passwordInput = document.getElementById("password-input");
  if (savedUsername && usernameInput) {
    usernameInput.value = savedUsername;
    const hint = document.getElementById("username-hint");
    if (hint) hint.textContent = "Welcome back! Press Enter to continue, or type a new name.";

    // Pre-fill saved password — returning player just presses Enter
    const savedPwLocal = localStorage.getItem("empire_password_" + savedUsername);
    if (savedPwLocal && passwordInput) {
      passwordInput.value = savedPwLocal;
      const pwHint = document.getElementById("password-hint");
      if (pwHint) pwHint.textContent = "Password saved — just press Enter to jump back in!";
    }
  }

  // Password input — pressing Enter submits the form
  if (passwordInput) {
    passwordInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleUsernameSubmit();
    });
  }

  // ── POWER CLICK KEYBOARD LISTENERS ──────────────────────────
  // Track held keys to prevent repeat-fire from keydown auto-repeat.
  const heldKeys = new Set();

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // prevent page scroll from Space

      // Ignore auto-repeat events (held key fires keydown repeatedly)
      if (heldKeys.has(e.key)) return;
      heldKeys.add(e.key);

      // Don't activate if typing in an input or textarea
      if (document.activeElement &&
          (document.activeElement.tagName === "INPUT" ||
           document.activeElement.tagName === "TEXTAREA")) return;

      startPowerClick();
    }
  });

  document.addEventListener("keyup", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      heldKeys.delete(e.key);
      stopPowerClick(true); // releasing key triggers cooldown
    }
  });

  // ── LOCK TOOLTIP SYSTEM (Update 5.6) ──────────────────────────
  // Shows a tooltip when the player hovers any element with
  // a data-locked-reason attribute. One global listener handles everything.
  const lockTooltip = document.createElement("div");
  lockTooltip.id        = "lock-tooltip";
  lockTooltip.className = "lock-tooltip";
  document.body.appendChild(lockTooltip);

  document.addEventListener("mouseover", function (e) {
    let target = e.target;
    let reason = null;

    while (target && target !== document.body) {

      // Case 1: Element is inside a panel that is currently locked
      const isInsideLockedPanel = target.closest(".panel-locked") !== null;

      // Case 2: Element is a locked asset card
      const isLockedCard = target.classList &&
        (target.classList.contains("yacht-card-locked") ||
         target.classList.contains("sector-mgr-locked") ||
         target.classList.contains("asset-card-locked"));

      if (isInsideLockedPanel || isLockedCard) {
        reason = target.getAttribute("data-locked-reason");
        if (reason) break;
      }

      // Case 3: Element is a disabled button with a lock reason
      // (e.g. cannot afford upgrade — valid regardless of panel lock state)
      if (target.tagName === "BUTTON" && target.disabled) {
        reason = target.getAttribute("data-locked-reason");
        if (reason) break;
      }

      target = target.parentElement;
    }

    if (reason) {
      lockTooltip.textContent   = "🔒 " + reason;
      lockTooltip.style.display = "block";
    } else {
      lockTooltip.style.display = "none";
    }
  });

  document.addEventListener("mousemove", function (e) {
    if (lockTooltip.style.display === "block") {
      const x = Math.min(e.clientX + 14, window.innerWidth  - 240);
      const y = Math.min(e.clientY + 14, window.innerHeight - 60);
      lockTooltip.style.left = x + "px";
      lockTooltip.style.top  = y + "px";
    }
  });

  document.addEventListener("mouseout", function (e) {
    lockTooltip.style.display = "none";
  });

  // Always start on the username screen
  document.getElementById("username-screen").style.display = "flex";
  document.getElementById("intro-screen").style.display    = "none";
  document.getElementById("game-screen").style.display     = "none";
});

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
const CHANGELOG_VERSION = "5";

// ── ACTIVE USERNAME ────────────────────────────────────────────
// Holds the name the player typed on the username screen.
// Set in handleUsernameSubmit() before anything else runs.
// Every save/load uses this name so each player has their own slot.
let activeUsername = "";

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

  // --- Yachts (Update 5 — Investment: affects net worth and income) ---
  yachtBusinessLevel: 0, // 0 = not purchased, 1–4 = current level
  ownedYachts:        {}, // { yachtId: tierNumber }     e.g. { sea_biscuit: 2 }

  // --- One-time tutorial flags (Update 3.5) ---
  // Using a saved flag instead of a share-count check means selling all
  // stocks and re-buying will never replay the first-stock tutorial.
  hasSeenFirstStock: false,

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
};

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

  // --- Fields added in Update 5 ---
  if (gameState.yachtBusinessLevel === undefined) gameState.yachtBusinessLevel = 0;
  if (gameState.ownedYachts        === undefined) gameState.ownedYachts        = {};
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

    // Update 5 keys:
    yachtBusinessLevel: 0,
    ownedYachts: {}
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
  const yachtClickBonus    = calculateYachtBusinessClickBonus(); // Update 5
  gameState.clickValue = 1 + propClickBonus + businessClickBonus + yachtClickBonus;

  // --- Passive Income Per Second ---
  const propIncome       = calculatePropertyIncome();
  const stockDividends   = calculateStockDividends();
  const bizIncome        = calculateBusinessIncome();
  const cryptoDividends  = calculateCryptoDividends();  // Update 3
  const yachtBizIncome   = calculateYachtBusinessIncome();  // Update 5
  const yachtFleetIncome = calculateYachtFleetIncome();     // Update 5
  gameState.passiveIncome = propIncome + stockDividends + bizIncome
                          + cryptoDividends + yachtBizIncome + yachtFleetIncome;

  // --- Net Worth ---
  const propNetWorth  = calculatePropertyNetWorth();
  const stockValue    = calculateStockNetWorth();
  const bizNetWorth   = calculateBusinessNetWorth();
  const cryptoValue   = calculateCryptoNetWorth();       // Update 3
  const yachtBizNW    = calculateYachtBusinessNetWorth(); // Update 5
  const yachtFleetNW  = calculateYachtFleetNetWorth();    // Update 5
  gameState.netWorth  = gameState.cash + propNetWorth + stockValue + bizNetWorth
                      + cryptoValue + yachtBizNW + yachtFleetNW;
  // Note: Cars (ownedCars) and Home (homeTier) are intentionally excluded — vanity only.
}

// ── MAIN GAME LOOP ─────────────────────────────────────────────

// Runs every second. Handles passive income, manager, unlocks, UI.
function mainGameLoop() {
  if (gameState.chapter === 0) return; // don't run during intro

  if (gameState.passiveIncome > 0) {
    gameState.cash        += gameState.passiveIncome;
    gameState.totalEarned += gameState.passiveIncome;
  }

  processManagerTap(1);
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
  if (gameState.chapter < 5 && gameState.netWorth   >= 100000000)  unlockChapter(5); // Update 5: $100M
}

function unlockChapter(chapterNum) {
  gameState.chapter = chapterNum;
  saveGame();

  if (chapterNum === 2) {
    // Unlock the Stocks + Crypto panel
    const el = document.getElementById("right-panel");
    if (el) {
      el.classList.remove("panel-locked");
      renderStocks();
      renderCrypto(); // Update 3: render crypto tab content too
    }
    triggerDialogue("ch2_unlock");
  }

  if (chapterNum === 3) {
    const el = document.getElementById("businesses-section");
    if (el) { el.classList.remove("panel-locked"); renderBusinesses(); }
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

  // Update 5: Yacht Fleet panel unlocks at $100M net worth
  if (chapterNum === 5) {
    const el = document.getElementById("yacht-fleet-section");
    if (el) { el.classList.remove("panel-locked"); renderYachtFleet(); }
    triggerDialogue("ch5_unlock");
  }
}

// ── RICH LIST RANK CHECKS ──────────────────────────────────────

const RANK_DIALOGUES = {
  10: "rank_10", 9: "rank_9", 8: "rank_8", 7: "rank_7",
  6: "rank_6",   5: "rank_5", 4: "rank_4", 3: "rank_3",
  2: "rank_2",   0: "win",
  // Update 5: Super-Tier ranks use string keys (JS coerces negative ints to strings)
  "-1": "rank_-1", "-2": "rank_-2",
  "-3": "rank_-3", "-4": "rank_-4"
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

  const rank = gameState.currentRank;
  const rankDisplay = rank === 11 ? "Unranked"
    : rank === 0 ? "👑 #1!"
    : rank < 0   ? "S" + Math.abs(rank)  // Update 5: Super-Tier display
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
  if (gameState.chapter >= 5) renderYachtFleet(); // Update 5: yacht fleet panel

  // Update 3: Manager is always visible from game start — render it every tick
  renderManager();

  renderRichList();
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

// ── USERNAME SCREEN ────────────────────────────────────────────

function showUsernameError(message) {
  const el = document.getElementById("username-error");
  if (el) el.textContent = message;
}

async function handleUsernameSubmit() {
  const input = document.getElementById("username-input");
  if (!input) return;

  const rawName = input.value.trim();

  const clean = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  if (clean.length === 0) {
    showUsernameError("Please enter a name! Even 'player1' works!");
    return;
  }
  if (clean.length < 2) {
    showUsernameError("Name must be at least 2 characters. Try again!");
    return;
  }

  showUsernameError("");
  document.getElementById("username-loading").style.display = "block";
  document.getElementById("username-submit-btn").disabled   = true;

  activeUsername = clean;
  localStorage.setItem("empire_username", clean);

  const hasSave = await loadGame();

  document.getElementById("username-loading").style.display = "none";
  document.getElementById("username-submit-btn").disabled   = false;

  document.getElementById("username-screen").style.display = "none";

  if (hasSave && gameState.chapter > 0) {
    startGame();
  } else {
    document.getElementById("intro-screen").style.display = "flex";
  }
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
      // Unlocked — remove the lock class and render both tabs
      rightPanel.classList.remove("panel-locked");
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

  // ── Yacht Fleet panel (Update 5, Chapter 5) ───────────────
  const yachtPanel = document.getElementById("yacht-fleet-section");
  if (yachtPanel) {
    if (gameState.chapter < 5) {
      yachtPanel.classList.add("panel-locked");
    } else {
      yachtPanel.classList.remove("panel-locked");
      renderYachtFleet();
    }
  }

  recalculateStats();
  updateUI();

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
  if (moneyBtn) moneyBtn.addEventListener("click", handleMoneyClick);

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

  // Pre-fill username if we recognise this browser from a previous visit
  const savedUsername = localStorage.getItem("empire_username");
  if (savedUsername && usernameInput) {
    usernameInput.value = savedUsername;
    const hint = document.getElementById("username-hint");
    if (hint) hint.textContent = "Welcome back! Press Enter to continue, or type a new name.";
  }

  // Always start on the username screen
  document.getElementById("username-screen").style.display = "flex";
  document.getElementById("intro-screen").style.display    = "none";
  document.getElementById("game-screen").style.display     = "none";
});

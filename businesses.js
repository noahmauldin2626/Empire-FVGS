// ═══════════════════════════════════════════════════════════════
// EMPIRE — businesses.js
// All business data + buy/upgrade logic + rendering.
// Businesses generate passive income per second, like properties,
// but with bigger numbers and a different flavour.
// Each business can be upgraded 3 times (4 levels total including base).
//
// UPDATE 3: Added 2 new businesses:
//   • Fleek Fitness     — gym chain, Health category
//   • Galactic Airlines — airline, Transport category
// ═══════════════════════════════════════════════════════════════

// Business definitions.
// 'cost'     — price to start the business (Level 1)
// 'levels[]' — 3 upgrade levels beyond the starting level:
//   incomePerSecond — passive cash added every second
//   clickBonus      — flat bonus added to click value
//   value           — contribution to net worth
//   upgradeCost     — cost to reach next level (null = max)

const BUSINESSES = [
  {
    id: "burger_royale",
    name: "Burger Royale",
    emoji: "🍔",
    category: "Food",
    description: "Not the royale with cheese. Just royale.",
    cost: 5000,
    levels: [
      { levelNum: 1, levelName: "Hole in the Wall",  incomePerSecond: 5,    clickBonus: 2,    value: 5000,    upgradeCost: 12000  },
      { levelNum: 2, levelName: "Local Favourite",   incomePerSecond: 18,   clickBonus: 8,    value: 17000,   upgradeCost: 40000  },
      { levelNum: 3, levelName: "Chain Empire",      incomePerSecond: 55,   clickBonus: 25,   value: 57000,   upgradeCost: 130000 },
      { levelNum: 4, levelName: "Global Franchise",  incomePerSecond: 150,  clickBonus: 70,   value: 187000,  upgradeCost: null   }
    ]
  },
  {
    id: "swagg_boutique",
    name: "Swagg Boutique",
    emoji: "👗",
    category: "Fashion",
    description: "High fashion at medium prices. The logo is very swooshy.",
    cost: 8000,
    levels: [
      { levelNum: 1, levelName: "Pop-Up Stall",      incomePerSecond: 8,    clickBonus: 3,    value: 8000,    upgradeCost: 20000  },
      { levelNum: 2, levelName: "Boutique Store",    incomePerSecond: 28,   clickBonus: 12,   value: 28000,   upgradeCost: 65000  },
      { levelNum: 3, levelName: "Fashion Label",     incomePerSecond: 85,   clickBonus: 38,   value: 93000,   upgradeCost: 200000 },
      { levelNum: 4, levelName: "Luxury Empire",     incomePerSecond: 230,  clickBonus: 105,  value: 293000,  upgradeCost: null   }
    ]
  },
  {
    id: "byteme_tech",
    name: "ByteMe Tech",
    emoji: "💾",
    category: "Tech",
    description: "They made an app that does... something. Everyone uses it.",
    cost: 15000,
    levels: [
      { levelNum: 1, levelName: "Garage Startup",    incomePerSecond: 18,   clickBonus: 8,    value: 15000,   upgradeCost: 40000  },
      { levelNum: 2, levelName: "Funded Startup",    incomePerSecond: 60,   clickBonus: 28,   value: 55000,   upgradeCost: 120000 },
      { levelNum: 3, levelName: "Tech Unicorn",      incomePerSecond: 175,  clickBonus: 80,   value: 175000,  upgradeCost: 400000 },
      { levelNum: 4, levelName: "Big Tech Titan",    incomePerSecond: 500,  clickBonus: 230,  value: 575000,  upgradeCost: null   }
    ]
  },
  {
    id: "funtime_studios",
    name: "Funtime Studios",
    emoji: "🎬",
    category: "Entertainment",
    description: "They make movies, games, and theme parks shaped like money bags.",
    cost: 35000,
    levels: [
      { levelNum: 1, levelName: "Indie Studio",       incomePerSecond: 45,   clickBonus: 20,   value: 35000,   upgradeCost: 100000 },
      { levelNum: 2, levelName: "Media Company",      incomePerSecond: 140,  clickBonus: 65,   value: 135000,  upgradeCost: 300000 },
      { levelNum: 3, levelName: "Entertainment Mogul",incomePerSecond: 400,  clickBonus: 185,  value: 435000,  upgradeCost: 900000 },
      { levelNum: 4, levelName: "Global Empire",      incomePerSecond: 1100, clickBonus: 510,  value: 1335000, upgradeCost: null   }
    ]
  },

  // ── UPDATE 3: NEW BUSINESSES ──────────────────────────────────

  {
    id: "fleek_fitness",
    name: "Fleek Fitness",
    emoji: "💪",
    category: "Health",
    description: "Spin classes, protein shakes, and a very loud playlist.",
    cost: 60000,
    levels: [
      { levelNum: 1, levelName: "Single Gym",      incomePerSecond: 75,   clickBonus: 35,  value: 60000,   upgradeCost: 150000  },
      { levelNum: 2, levelName: "City Chain",       incomePerSecond: 220,  clickBonus: 100, value: 210000,  upgradeCost: 500000  },
      { levelNum: 3, levelName: "National Brand",   incomePerSecond: 600,  clickBonus: 280, value: 710000,  upgradeCost: 1500000 },
      { levelNum: 4, levelName: "Global Wellness",  incomePerSecond: 1600, clickBonus: 750, value: 2210000, upgradeCost: null    }
    ]
  },
  {
    id: "galactic_airlines",
    name: "Galactic Airlines",
    emoji: "✈️",
    category: "Transport",
    description: "Budget seats, champagne prices, zero legroom. Perfection.",
    cost: 200000,
    levels: [
      { levelNum: 1, levelName: "Regional Carrier",  incomePerSecond: 250,  clickBonus: 120,  value: 200000,  upgradeCost: 500000  },
      { levelNum: 2, levelName: "National Airline",  incomePerSecond: 700,  clickBonus: 330,  value: 700000,  upgradeCost: 1500000 },
      { levelNum: 3, levelName: "International Hub", incomePerSecond: 1800, clickBonus: 850,  value: 2200000, upgradeCost: 5000000 },
      { levelNum: 4, levelName: "Global Fleet",      incomePerSecond: 5000, clickBonus: 2300, value: 7200000, upgradeCost: null    }
    ]
  }
];

// ── INCOME CALCULATIONS ───────────────────────────────────────

// Adds up income per second from all owned businesses.
function calculateBusinessIncome() {
  let total = 0;
  for (const id in gameState.ownedBusinesses) {
    const business   = BUSINESSES.find(b => b.id === id);
    const levelIndex = gameState.ownedBusinesses[id] - 1; // levels[] is 0-indexed
    total += business.levels[levelIndex].incomePerSecond;
  }
  return total;
}

// Adds up the click bonus from all owned businesses.
function calculateBusinessClickBonus() {
  let total = 0;
  for (const id in gameState.ownedBusinesses) {
    const business   = BUSINESSES.find(b => b.id === id);
    const levelIndex = gameState.ownedBusinesses[id] - 1;
    total += business.levels[levelIndex].clickBonus;
  }
  return total;
}

// Adds up the net worth value of all owned businesses.
function calculateBusinessNetWorth() {
  let total = 0;
  for (const id in gameState.ownedBusinesses) {
    const business   = BUSINESSES.find(b => b.id === id);
    const levelIndex = gameState.ownedBusinesses[id] - 1;
    total += business.levels[levelIndex].value;
  }
  return total;
}

// ── BUY & UPGRADE ─────────────────────────────────────────────

// Attempts to start (buy) a business. Returns true if successful.
function buyBusiness(businessId) {
  const business = BUSINESSES.find(b => b.id === businessId);
  if (!business) return false;
  if (gameState.ownedBusinesses[businessId]) return false; // already own it

  if (gameState.cash < business.cost) {
    showToast("Not enough cash! Keep hustling! 💸");
    return false;
  }

  gameState.cash -= business.cost;
  gameState.ownedBusinesses[businessId] = 1; // start at Level 1

  recalculateStats();
  saveGame();
  renderBusinesses();
  updateUI();

  // First business ever? Trigger Uncle Funds reaction
  if (Object.keys(gameState.ownedBusinesses).length === 1) {
    triggerDialogue("first_business");
  }

  return true;
}

// Attempts to upgrade an owned business to the next level. Returns true if successful.
function upgradeBusiness(businessId) {
  const currentLevel = gameState.ownedBusinesses[businessId];
  if (!currentLevel) return false;

  const business  = BUSINESSES.find(b => b.id === businessId);
  const levelData = business.levels[currentLevel - 1];

  if (!levelData.upgradeCost) {
    showToast("Already at max level! 🌟");
    return false;
  }
  if (gameState.cash < levelData.upgradeCost) {
    showToast("Not enough cash to upgrade! 💸");
    return false;
  }

  gameState.cash -= levelData.upgradeCost;
  gameState.ownedBusinesses[businessId] = currentLevel + 1;

  recalculateStats();
  saveGame();
  renderBusinesses();
  updateUI();

  return true;
}

// ── RENDERING ─────────────────────────────────────────────────

// Builds (or rebuilds) the Businesses panel HTML.
function renderBusinesses() {
  const container = document.getElementById("businesses-list");
  if (!container) return;

  container.innerHTML = "";

  BUSINESSES.forEach(business => {
    const ownedLevel  = gameState.ownedBusinesses[business.id] || 0;
    const isOwned     = ownedLevel > 0;
    const levelData   = isOwned ? business.levels[ownedLevel - 1] : null;
    const isMaxLevel  = isOwned && levelData.upgradeCost === null;
    const nextLevel   = isOwned && !isMaxLevel ? business.levels[ownedLevel] : null;

    const canAffordBuy     = !isOwned && gameState.cash >= business.cost;
    const canAffordUpgrade = isOwned && !isMaxLevel && gameState.cash >= levelData.upgradeCost;

    const card = document.createElement("div");
    card.className = "asset-card business-card" + (isOwned ? " owned" : "");

    if (isOwned) {
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${business.emoji}</span>
          <div class="asset-name-block">
            <strong>${business.name}</strong>
            <span class="tier-badge tier-${levelData.levelNum}">${levelData.levelName} · Lv ${ownedLevel}/4</span>
          </div>
        </div>
        <div class="asset-stats">
          💰 <strong>${levelData.incomePerSecond}</strong>/sec &nbsp;
          🖱️ +<strong>${levelData.clickBonus}</strong>/click
        </div>
        ${isMaxLevel
          ? `<button class="btn btn-maxed" disabled>✨ MAXED OUT!</button>`
          : `<button class="btn ${canAffordUpgrade ? "btn-upgrade" : "btn-locked"}"
                     onclick="upgradeBusiness('${business.id}')"
                     ${canAffordUpgrade ? "" : "disabled"}>
               ⬆️ Upgrade → ${nextLevel.levelName}
               &nbsp; ${formatMoney(levelData.upgradeCost)}
             </button>`
        }
      `;
    } else {
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${business.emoji}</span>
          <div class="asset-name-block">
            <strong>${business.name}</strong>
            <span class="asset-desc">${business.description}</span>
          </div>
        </div>
        <div class="asset-stats">
          After starting: 💰 <strong>${business.levels[0].incomePerSecond}</strong>/sec
        </div>
        <button class="btn ${canAffordBuy ? "btn-buy" : "btn-locked"}"
                onclick="buyBusiness('${business.id}')"
                ${canAffordBuy ? "" : "disabled"}>
          🚀 Start Business — ${formatMoney(business.cost)}
        </button>
      `;
    }

    container.appendChild(card);
  });

  // Update 4: Always render the Yacht Empire card after the regular businesses.
  // renderYachtBusiness() is defined in yachts.js (loads before game.js).
  if (typeof renderYachtBusiness === "function") renderYachtBusiness();
}

// ═══════════════════════════════════════════════════════════════
// EMPIRE — yachts.js
// UPDATE 5: Yacht Empire
//
// TWO CONNECTED SYSTEMS:
//   System A — Yacht Empire Business (single upgradeable business,
//               like those in businesses.js, lives in businesses panel)
//   System B — Yacht Fleet (5 rentable yacht models, like properties,
//               live in the new Yacht Fleet panel, unlocked at $100M)
//
// Fleet access is gated by Yacht Empire level:
//   Level 1 (Harbor Hustler)  → Fleet Tier 1 (Sea Biscuit, Cash Cruiser)
//   Level 2 (Marina Mogul)    → Fleet Tier 2 (+Golden Wake)
//   Level 3 (Ocean Operator)  → Fleet Tier 3 (+Neptune's Folly)
//   Level 4 (Fleet Overlord)  → Fleet Tier 4 (+The Obsidian)
//
// INCOME / NET WORTH:
//   Both the business and fleet yachts are INVESTMENTS —
//   they are included in recalculateStats() (unlike cars/home).
// ═══════════════════════════════════════════════════════════════

// ── SYSTEM A: YACHT EMPIRE BUSINESS ──────────────────────────

const YACHT_BUSINESS = {
  id:          "yacht_empire",
  name:        "Yacht Empire",
  emoji:       "🚤",
  category:    "Luxury",
  description: "You own boats. Rich people rent them. Simple. Brilliant. Wet.",
  cost: 500000,
  levels: [
    {
      levelNum: 1, levelName: "Harbor Hustler",
      incomePerSecond: 800,   clickBonus: 350,   value: 500000,
      upgradeCost: 1500000,   unlocksFleetTier: 1
    },
    {
      levelNum: 2, levelName: "Marina Mogul",
      incomePerSecond: 2500,  clickBonus: 1100,  value: 2000000,
      upgradeCost: 6000000,   unlocksFleetTier: 2
    },
    {
      levelNum: 3, levelName: "Ocean Operator",
      incomePerSecond: 8000,  clickBonus: 3500,  value: 8000000,
      upgradeCost: 20000000,  unlocksFleetTier: 3
    },
    {
      levelNum: 4, levelName: "Fleet Overlord",
      incomePerSecond: 25000, clickBonus: 11000, value: 30000000,
      upgradeCost: null,      unlocksFleetTier: 4
    }
  ]
};

// ── SYSTEM B: YACHT FLEET ─────────────────────────────────────

// Five yacht models the player can buy and rent out.
// fleetTierRequired — must have reached this fleet tier via YACHT_BUSINESS level.
const YACHT_FLEET = [
  {
    id: "sea_biscuit",
    name: "The Sea Biscuit",
    emoji: "🚤",
    description: "Technically a yacht. Technically.",
    fleetTierRequired: 1,
    buyCost: 250000,
    tiers: [
      { tierNum: 1, tierName: "Basic Rental",   rentPerSecond: 200,  value: 250000,   upgradeCost: 600000   },
      { tierNum: 2, tierName: "Premium Berth",  rentPerSecond: 650,  value: 850000,   upgradeCost: 2000000  },
      { tierNum: 3, tierName: "Luxury Charter", rentPerSecond: 1800, value: 2850000,  upgradeCost: null     }
    ]
  },
  {
    id: "cash_cruiser",
    name: "Cash Cruiser",
    emoji: "🛥️",
    description: "Faster than your accountant can count.",
    fleetTierRequired: 1,
    buyCost: 750000,
    tiers: [
      { tierNum: 1, tierName: "Basic Rental",   rentPerSecond: 600,  value: 750000,   upgradeCost: 1800000  },
      { tierNum: 2, tierName: "Premium Berth",  rentPerSecond: 1900, value: 2550000,  upgradeCost: 6000000  },
      { tierNum: 3, tierName: "Luxury Charter", rentPerSecond: 5500, value: 8550000,  upgradeCost: null     }
    ]
  },
  {
    id: "golden_wake",
    name: "Golden Wake",
    emoji: "✨🛳️",
    description: "The wake it leaves is literally made of envy.",
    fleetTierRequired: 2,
    buyCost: 3000000,
    tiers: [
      { tierNum: 1, tierName: "Basic Rental",   rentPerSecond: 2200,  value: 3000000,   upgradeCost: 7500000   },
      { tierNum: 2, tierName: "Premium Berth",  rentPerSecond: 7000,  value: 10500000,  upgradeCost: 25000000  },
      { tierNum: 3, tierName: "Luxury Charter", rentPerSecond: 20000, value: 35500000,  upgradeCost: null      }
    ]
  },
  {
    id: "neptunes_folly",
    name: "Neptune's Folly",
    emoji: "⚓🛳️",
    description: "Named after the god of the sea, who frankly cannot afford it.",
    fleetTierRequired: 3,
    buyCost: 15000000,
    tiers: [
      { tierNum: 1, tierName: "Basic Rental",   rentPerSecond: 10000, value: 15000000,  upgradeCost: 40000000   },
      { tierNum: 2, tierName: "Premium Berth",  rentPerSecond: 32000, value: 55000000,  upgradeCost: 130000000  },
      { tierNum: 3, tierName: "Luxury Charter", rentPerSecond: 90000, value: 185000000, upgradeCost: null       }
    ]
  },
  {
    id: "the_obsidian",
    name: "The Obsidian",
    emoji: "🖤🚢",
    description: "Matte black. No logo. Everyone knows who owns it.",
    fleetTierRequired: 4,
    buyCost: 75000000,
    tiers: [
      { tierNum: 1, tierName: "Basic Rental",   rentPerSecond: 50000,  value: 75000000,  upgradeCost: 200000000  },
      { tierNum: 2, tierName: "Premium Berth",  rentPerSecond: 160000, value: 275000000, upgradeCost: 650000000  },
      { tierNum: 3, tierName: "Luxury Charter", rentPerSecond: 450000, value: 925000000, upgradeCost: null       }
    ]
  }
];

// ── CALCULATION FUNCTIONS (called by recalculateStats in game.js) ──

// Returns passive income/sec from the Yacht Empire business level.
function calculateYachtBusinessIncome() {
  if (!gameState.yachtBusinessLevel || gameState.yachtBusinessLevel === 0) return 0;
  return YACHT_BUSINESS.levels[gameState.yachtBusinessLevel - 1].incomePerSecond;
}

// Returns click bonus from the Yacht Empire business level.
function calculateYachtBusinessClickBonus() {
  if (!gameState.yachtBusinessLevel || gameState.yachtBusinessLevel === 0) return 0;
  return YACHT_BUSINESS.levels[gameState.yachtBusinessLevel - 1].clickBonus;
}

// Returns net worth contribution from the Yacht Empire business.
function calculateYachtBusinessNetWorth() {
  if (!gameState.yachtBusinessLevel || gameState.yachtBusinessLevel === 0) return 0;
  return YACHT_BUSINESS.levels[gameState.yachtBusinessLevel - 1].value;
}

// Returns total passive income/sec from all owned fleet yachts.
function calculateYachtFleetIncome() {
  let total = 0;
  for (const id in gameState.ownedYachts) {
    const yacht     = YACHT_FLEET.find(y => y.id === id);
    const tierIndex = gameState.ownedYachts[id] - 1;
    if (yacht && yacht.tiers[tierIndex]) total += yacht.tiers[tierIndex].rentPerSecond;
  }
  return total;
}

// Returns total net worth from all owned fleet yachts.
function calculateYachtFleetNetWorth() {
  let total = 0;
  for (const id in gameState.ownedYachts) {
    const yacht     = YACHT_FLEET.find(y => y.id === id);
    const tierIndex = gameState.ownedYachts[id] - 1;
    if (yacht && yacht.tiers[tierIndex]) total += yacht.tiers[tierIndex].value;
  }
  return total;
}

// ── HELPER ────────────────────────────────────────────────────

// Returns the fleet tier the player currently has access to (0 if no business).
function getUnlockedFleetTier() {
  if (!gameState.yachtBusinessLevel || gameState.yachtBusinessLevel === 0) return 0;
  return YACHT_BUSINESS.levels[gameState.yachtBusinessLevel - 1].unlocksFleetTier;
}

// Returns the level name of the first business level that unlocks a given fleet tier.
function getLevelNameForFleetTier(tierRequired) {
  const level = YACHT_BUSINESS.levels.find(l => l.unlocksFleetTier === tierRequired);
  return level ? level.levelName : "a higher level";
}

// ── BUY & UPGRADE FUNCTIONS ───────────────────────────────────

// Purchases the Yacht Empire business at Level 1.
function buyYachtBusiness() {
  if (gameState.yachtBusinessLevel > 0) return; // already owned
  if (gameState.cash < YACHT_BUSINESS.cost) {
    showToast("Need " + formatMoney(YACHT_BUSINESS.cost) + " to launch Yacht Empire!");
    return;
  }
  gameState.cash -= YACHT_BUSINESS.cost;
  gameState.yachtBusinessLevel = 1;
  recalculateStats();
  saveGame();
  renderYachtBusiness();
  renderYachtFleet();
  updateUI();
  triggerDialogue("first_yacht_business");
}

// Upgrades the Yacht Empire business to the next level.
function upgradeYachtBusiness() {
  const current = gameState.yachtBusinessLevel;
  if (current === 0) return;
  if (current >= YACHT_BUSINESS.levels.length) {
    showToast("Yacht Empire is already maxed out!");
    return;
  }
  const currentLevelData = YACHT_BUSINESS.levels[current - 1];
  if (!currentLevelData.upgradeCost) {
    showToast("Already maxed!");
    return;
  }
  if (gameState.cash < currentLevelData.upgradeCost) {
    showToast("Not enough cash to upgrade Yacht Empire!");
    return;
  }
  gameState.cash -= currentLevelData.upgradeCost;
  gameState.yachtBusinessLevel = current + 1;
  recalculateStats();
  saveGame();
  renderYachtBusiness();
  renderYachtFleet(); // fleet cards refresh because new tier may be unlocked
  updateUI();
  const newLevel = YACHT_BUSINESS.levels[gameState.yachtBusinessLevel - 1];
  showToast("Yacht Empire upgraded to " + newLevel.levelName + "!");
  if (gameState.yachtBusinessLevel === YACHT_BUSINESS.levels.length) {
    triggerDialogue("yacht_empire_maxed");
  }
}

// Purchases a fleet yacht at Tier 1.
function buyYacht(yachtId) {
  const yacht = YACHT_FLEET.find(y => y.id === yachtId);
  if (!yacht) return;
  if (gameState.ownedYachts[yachtId]) return; // already owned
  if (getUnlockedFleetTier() < yacht.fleetTierRequired) {
    showToast("Upgrade Yacht Empire to unlock this vessel!");
    return;
  }
  if (gameState.cash < yacht.buyCost) {
    showToast("Not enough cash to acquire " + yacht.name + "!");
    return;
  }
  const isFirst = Object.keys(gameState.ownedYachts).length === 0;
  gameState.cash -= yacht.buyCost;
  gameState.ownedYachts[yachtId] = 1;
  recalculateStats();
  saveGame();
  renderYachtFleet();
  updateUI();
  if (isFirst) triggerDialogue("first_yacht");
}

// Upgrades a fleet yacht to the next tier.
function upgradeYacht(yachtId) {
  const currentTier = gameState.ownedYachts[yachtId];
  if (!currentTier) return;
  const yacht    = YACHT_FLEET.find(y => y.id === yachtId);
  const tierData = yacht.tiers[currentTier - 1];
  if (!tierData.upgradeCost) {
    showToast("This yacht is already maxed out!");
    return;
  }
  if (gameState.cash < tierData.upgradeCost) {
    showToast("Not enough cash to upgrade " + yacht.name + "!");
    return;
  }
  gameState.cash -= tierData.upgradeCost;
  gameState.ownedYachts[yachtId] = currentTier + 1;
  recalculateStats();
  saveGame();
  renderYachtFleet();
  updateUI();
}

// ── RENDERING ─────────────────────────────────────────────────

// Renders (or re-renders) the Yacht Empire business card inside #businesses-list.
// Appended after the regular businesses. Modelled exactly after renderBusinesses().
function renderYachtBusiness() {
  const container = document.getElementById("businesses-list");
  if (!container) return;

  // Remove any existing yacht business card to avoid duplicates
  const existing = document.getElementById("yacht-business-card");
  if (existing) existing.remove();

  const level        = gameState.yachtBusinessLevel;
  const isOwned      = level > 0;
  const levelData    = isOwned ? YACHT_BUSINESS.levels[level - 1] : null;
  const isMax        = isOwned && levelData.upgradeCost === null;
  const nextLevel    = isOwned && !isMax ? YACHT_BUSINESS.levels[level] : null;
  const fleetTier    = isOwned ? levelData.unlocksFleetTier : 0;

  const canAffordBuy     = !isOwned && gameState.cash >= YACHT_BUSINESS.cost;
  const canAffordUpgrade = isOwned && !isMax && gameState.cash >= levelData.upgradeCost;

  const card = document.createElement("div");
  card.id        = "yacht-business-card";
  card.className = "asset-card business-card" + (isOwned ? " owned" : "");

  if (isOwned) {
    card.innerHTML = `
      <div class="asset-header">
        <span class="asset-emoji">${YACHT_BUSINESS.emoji}</span>
        <div class="asset-name-block">
          <strong>${YACHT_BUSINESS.name}</strong>
          <span class="tier-badge tier-${levelData.levelNum}">${levelData.levelName} · Lv ${level}/4</span>
        </div>
      </div>
      <div class="asset-stats">
        💰 <strong>${levelData.incomePerSecond}</strong>/sec &nbsp;
        🖱️ +<strong>${levelData.clickBonus}</strong>/click
      </div>
      <div class="asset-stats">
        ⚓ Fleet Tier: <strong>${fleetTier}/4</strong> unlocked
      </div>
      ${isMax
        ? `<button class="btn btn-maxed" disabled>✨ MAXED OUT!</button>`
        : `<button class="btn ${canAffordUpgrade ? "btn-upgrade" : "btn-locked"}"
                   onclick="upgradeYachtBusiness()"
                   ${canAffordUpgrade ? "" : "disabled"}>
             ⬆️ Upgrade → ${nextLevel.levelName}
             &nbsp; ${formatMoney(levelData.upgradeCost)}
           </button>`
      }
    `;
  } else {
    card.innerHTML = `
      <div class="asset-header">
        <span class="asset-emoji">${YACHT_BUSINESS.emoji}</span>
        <div class="asset-name-block">
          <strong>${YACHT_BUSINESS.name}</strong>
          <span class="asset-desc">${YACHT_BUSINESS.description}</span>
        </div>
      </div>
      <div class="asset-stats">
        After starting: 💰 <strong>${YACHT_BUSINESS.levels[0].incomePerSecond}</strong>/sec
      </div>
      <button class="btn ${canAffordBuy ? "btn-buy" : "btn-locked"}"
              onclick="buyYachtBusiness()"
              ${canAffordBuy ? "" : "disabled"}>
        🚤 Launch Yacht Empire — ${formatMoney(YACHT_BUSINESS.cost)}
      </button>
    `;
  }

  container.appendChild(card);
}

// Renders (or re-renders) the Yacht Fleet panel (#yacht-fleet-list).
// Each card has three states: owned, available, locked.
// Modelled exactly after renderProperties() in properties.js.
function renderYachtFleet() {
  const container = document.getElementById("yacht-fleet-list");
  if (!container) return;
  container.innerHTML = "";

  const unlockedTier = getUnlockedFleetTier();

  YACHT_FLEET.forEach(yacht => {
    const ownedTier      = gameState.ownedYachts[yacht.id] || 0;
    const isOwned        = ownedTier > 0;
    const tierData       = isOwned ? yacht.tiers[ownedTier - 1] : null;
    const isMax          = isOwned && tierData.upgradeCost === null;
    const nextTierData   = isOwned && !isMax ? yacht.tiers[ownedTier] : null;
    const tierLocked     = !isOwned && unlockedTier < yacht.fleetTierRequired;

    const canAffordBuy     = !isOwned && !tierLocked && gameState.cash >= yacht.buyCost;
    const canAffordUpgrade = isOwned && !isMax && gameState.cash >= tierData.upgradeCost;

    const card = document.createElement("div");
    card.className = "asset-card"
      + (isOwned    ? " owned"            : "")
      + (tierLocked ? " yacht-card-locked" : "");

    if (isOwned) {
      // ── OWNED CARD ──
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${yacht.emoji}</span>
          <div class="asset-name-block">
            <strong>${yacht.name}</strong>
            <span class="tier-badge yacht-tier-${tierData.tierNum}">${tierData.tierName} · Tier ${ownedTier}/3</span>
          </div>
        </div>
        <div class="asset-stats">
          💰 <strong>${tierData.rentPerSecond}</strong>/sec &nbsp;
          💎 Worth ${formatMoney(tierData.value)}
        </div>
        ${isMax
          ? `<button class="btn btn-maxed" disabled>✨ MAXED OUT!</button>`
          : `<button class="btn ${canAffordUpgrade ? "btn-upgrade" : "btn-locked"}"
                     onclick="upgradeYacht('${yacht.id}')"
                     ${canAffordUpgrade ? "" : "disabled"}>
               ⬆️ Upgrade → ${nextTierData.tierName}
               &nbsp; ${formatMoney(tierData.upgradeCost)}
             </button>`
        }
      `;
    } else if (tierLocked) {
      // ── LOCKED CARD — fleet tier not yet unlocked ──
      const requiredLevelName = getLevelNameForFleetTier(yacht.fleetTierRequired);
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${yacht.emoji}</span>
          <div class="asset-name-block">
            <strong>${yacht.name}</strong>
            <span class="asset-desc">${yacht.description}</span>
          </div>
        </div>
        <p class="yacht-lock-notice">
          🔒 Requires Fleet Tier ${yacht.fleetTierRequired}
          — upgrade Yacht Empire to ${requiredLevelName}
        </p>
      `;
    } else {
      // ── AVAILABLE CARD — not owned but tier is sufficient ──
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${yacht.emoji}</span>
          <div class="asset-name-block">
            <strong>${yacht.name}</strong>
            <span class="asset-desc">${yacht.description}</span>
          </div>
        </div>
        <div class="asset-stats">
          After buying: 💰 <strong>${yacht.tiers[0].rentPerSecond}</strong>/sec
        </div>
        <button class="btn ${canAffordBuy ? "btn-buy" : "btn-locked"}"
                onclick="buyYacht('${yacht.id}')"
                ${canAffordBuy ? "" : "disabled"}>
          🚤 Acquire — ${formatMoney(yacht.buyCost)}
        </button>
      `;
    }

    container.appendChild(card);
  });
}

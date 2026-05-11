// ═══════════════════════════════════════════════════════════════
// EMPIRE — properties.js
// All property data + buy/upgrade logic + rendering.
// Properties generate passive rent income every second.
// Each property has 3 upgrade tiers: Rundown → Decent → Luxury.
//
// UPDATE 3: Added 2 new high-tier properties:
//   • Sky Residences  — unlocks at $250K buy cost
//   • Resort Island   — unlocks at $1M buy cost
// ═══════════════════════════════════════════════════════════════

// Each property entry has:
//   buyCost        — what the player pays to first acquire it (Tier 1)
//   tiers[]        — array of 3 tiers, each with:
//     rentPerSecond  — passive income added to the game every second
//     clickBonus     — flat bonus added to the player's click value
//     value          — how much this contributes to net worth
//     upgradeCost    — cost to reach the NEXT tier (null = already max)

const PROPERTIES = [
  {
    id: "funky_flats",
    name: "Funky Flats",
    emoji: "🏚️",
    description: "Smells a bit weird, but the rent is very real.",
    buyCost: 500,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 1,    clickBonus: 0.5,  value: 500,    upgradeCost: 750   },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 3,    clickBonus: 1.5,  value: 1250,   upgradeCost: 2000  },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 8,    clickBonus: 4,    value: 3250,   upgradeCost: null  }
    ]
  },
  {
    id: "crusty_condo",
    name: "The Crusty Condo",
    emoji: "🏢",
    description: "It's standing. That's something.",
    buyCost: 2000,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 4,    clickBonus: 2,    value: 2000,   upgradeCost: 3000  },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 12,   clickBonus: 6,    value: 5000,   upgradeCost: 8000  },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 30,   clickBonus: 15,   value: 13000,  upgradeCost: null  }
    ]
  },
  {
    id: "bougie_towers",
    name: "Bougie Towers",
    emoji: "🏙️",
    description: "For the person who wants to look rich before they are rich.",
    buyCost: 8000,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 15,   clickBonus: 7,    value: 8000,   upgradeCost: 12000 },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 45,   clickBonus: 20,   value: 20000,  upgradeCost: 30000 },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 110,  clickBonus: 50,   value: 50000,  upgradeCost: null  }
    ]
  },
  {
    id: "lavish_lair",
    name: "Lavish Lair",
    emoji: "🏰",
    description: "This is where real tycoons hang their hats. Multiple hats.",
    buyCost: 30000,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 50,   clickBonus: 25,   value: 30000,  upgradeCost: 45000  },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 150,  clickBonus: 75,   value: 75000,  upgradeCost: 120000 },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 375,  clickBonus: 185,  value: 195000, upgradeCost: null   }
    ]
  },
  {
    id: "gold_manor",
    name: "Gold Manor",
    emoji: "✨🏯✨",
    description: "Everything is gold. The walls, floors, chandelier. Even the toilet.",
    buyCost: 100000,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 175,  clickBonus: 85,   value: 100000, upgradeCost: 150000 },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 500,  clickBonus: 250,  value: 250000, upgradeCost: 400000 },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 1250, clickBonus: 600,  value: 650000, upgradeCost: null   }
    ]
  },

  // ── UPDATE 3: NEW PROPERTIES ──────────────────────────────────

  {
    id: "sky_residences",
    name: "Sky Residences",
    emoji: "🌤️🏢",
    description: "So high up the tenants think they're above the law.",
    buyCost: 250000,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 400,  clickBonus: 200,  value: 250000,  upgradeCost: 375000  },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 1100, clickBonus: 550,  value: 625000,  upgradeCost: 1000000 },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 2800, clickBonus: 1400, value: 1625000, upgradeCost: null    }
    ]
  },
  {
    id: "resort_island",
    name: "Resort Island",
    emoji: "🏝️",
    description: "You own an island. Just let that sink in.",
    buyCost: 1000000,
    tiers: [
      { tierNum: 1, tierName: "Rundown",  rentPerSecond: 1500,  clickBonus: 750,  value: 1000000,  upgradeCost: 1500000 },
      { tierNum: 2, tierName: "Decent",   rentPerSecond: 4000,  clickBonus: 2000, value: 2500000,  upgradeCost: 4000000 },
      { tierNum: 3, tierName: "Luxury",   rentPerSecond: 10000, clickBonus: 5000, value: 6500000,  upgradeCost: null    }
    ]
  }
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────

// Returns the current tier data object for an owned property,
// or null if the player doesn't own it.
function getPropertyTierData(propertyId) {
  const tier = gameState.ownedProperties[propertyId];
  if (!tier) return null;
  const property = PROPERTIES.find(p => p.id === propertyId);
  return property.tiers[tier - 1]; // tiers array is 0-indexed
}

// Adds up the rent/sec from every property the player owns.
function calculatePropertyIncome() {
  let total = 0;
  for (const id in gameState.ownedProperties) {
    const tierData = getPropertyTierData(id);
    if (tierData) total += tierData.rentPerSecond;
  }
  return total;
}

// Adds up the click bonus from every property the player owns.
function calculatePropertyClickBonus() {
  let total = 0;
  for (const id in gameState.ownedProperties) {
    const tierData = getPropertyTierData(id);
    if (tierData) total += tierData.clickBonus;
  }
  return total;
}

// Adds up the net worth value of every owned property.
function calculatePropertyNetWorth() {
  let total = 0;
  for (const id in gameState.ownedProperties) {
    const tierData = getPropertyTierData(id);
    if (tierData) total += tierData.value;
  }
  return total;
}

// ── BUY & UPGRADE ─────────────────────────────────────────────

// Attempts to buy a property. Returns true if purchase succeeded.
function buyProperty(propertyId) {
  const property = PROPERTIES.find(p => p.id === propertyId);
  if (!property) return false;
  if (gameState.ownedProperties[propertyId]) return false; // already own it
  if (gameState.cash < property.buyCost) {
    showToast("Not enough cash! Keep clicking! 💸");
    return false;
  }

  gameState.cash -= property.buyCost;
  gameState.ownedProperties[propertyId] = 1; // start at Tier 1

  recalculateStats();
  saveGame();
  renderProperties();
  updateUI();

  // First property ever? Trigger special Uncle Funds line
  if (Object.keys(gameState.ownedProperties).length === 1) {
    triggerDialogue("first_property");
  }

  return true;
}

// Attempts to upgrade a property to the next tier. Returns true if it worked.
function upgradeProperty(propertyId) {
  const currentTier = gameState.ownedProperties[propertyId];
  if (!currentTier) return false; // don't own it

  const property  = PROPERTIES.find(p => p.id === propertyId);
  const tierData  = property.tiers[currentTier - 1];

  if (!tierData.upgradeCost) {
    showToast("Already maxed out! 🌟");
    return false;
  }
  if (gameState.cash < tierData.upgradeCost) {
    showToast("Not enough cash to upgrade! Keep earning! 💸");
    return false;
  }

  gameState.cash -= tierData.upgradeCost;
  gameState.ownedProperties[propertyId] = currentTier + 1; // move to next tier

  recalculateStats();
  saveGame();
  renderProperties();
  updateUI();

  return true;
}

// ── RENDERING ─────────────────────────────────────────────────

// Builds (or rebuilds) the entire Properties panel HTML.
// Called whenever a property is bought, upgraded, or cash changes.
function renderProperties() {
  const container = document.getElementById("properties-list");
  if (!container) return;

  container.innerHTML = ""; // wipe old content

  PROPERTIES.forEach(property => {
    const ownedTier     = gameState.ownedProperties[property.id] || 0;
    const isOwned       = ownedTier > 0;
    const tierData      = isOwned ? property.tiers[ownedTier - 1] : null;
    const isMaxTier     = isOwned && tierData.upgradeCost === null;
    const nextTierData  = isOwned && !isMaxTier ? property.tiers[ownedTier] : null;

    // Can the player afford to buy / upgrade?
    const canAffordBuy     = !isOwned && gameState.cash >= property.buyCost;
    const canAffordUpgrade = isOwned && !isMaxTier && gameState.cash >= tierData.upgradeCost;

    const card = document.createElement("div");
    card.className = "asset-card" + (isOwned ? " owned" : "");

    if (isOwned) {
      // ── OWNED CARD ──
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${property.emoji}</span>
          <div class="asset-name-block">
            <strong>${property.name}</strong>
            <span class="tier-badge tier-${tierData.tierNum}">${tierData.tierName} · Tier ${ownedTier}/3</span>
          </div>
        </div>
        <div class="asset-stats">
          💰 <strong>${tierData.rentPerSecond}</strong>/sec &nbsp; 🖱️ +<strong>${tierData.clickBonus}</strong>/click
        </div>
        ${isMaxTier
          ? `<button class="btn btn-maxed" disabled>✨ MAXED OUT!</button>`
          : `<button class="btn ${canAffordUpgrade ? "btn-upgrade" : "btn-locked"}"
                     onclick="upgradeProperty('${property.id}')"
                     ${canAffordUpgrade ? "" : "disabled"}>
               ⬆️ Upgrade → ${nextTierData.tierName}
               &nbsp; ${formatMoney(tierData.upgradeCost)}
             </button>`
        }
      `;
    } else {
      // ── NOT OWNED CARD ──
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${property.emoji}</span>
          <div class="asset-name-block">
            <strong>${property.name}</strong>
            <span class="asset-desc">${property.description}</span>
          </div>
        </div>
        <div class="asset-stats">
          After buying: 💰 <strong>${property.tiers[0].rentPerSecond}</strong>/sec
        </div>
        <button class="btn ${canAffordBuy ? "btn-buy" : "btn-locked"}"
                onclick="buyProperty('${property.id}')"
                ${canAffordBuy ? "" : "disabled"}>
          🏠 Buy — ${formatMoney(property.buyCost)}
        </button>
      `;
    }

    container.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
// EMPIRE — airlines.js  (NEW in Update 5.6)
// Galactic Airlines Fleet — buy routes/planes that generate
// passive income. Fleet tier gated by Galactic Airlines level.
//
// HOW IT WORKS (mirrors yachts.js exactly):
//   gameState.ownedBusinesses.galactic_airlines holds the biz level (1-4).
//   getUnlockedAirlineTier() reads that level to determine which
//   fleet assets are available.
//   All fleet assets are investments — added to recalculateStats().
//
// NEW gameState KEY:
//   ownedAirlines: {}  — { assetId: tierNumber }
// ═══════════════════════════════════════════════════════════════

// Five airline fleet assets, tiered by Galactic Airlines business level.
// fleetTierRequired matches the business levelNum needed to unlock.
const AIRLINE_FLEET = [
  {
    id: "puddle_jumper",
    name: "Puddle Jumper",
    emoji: "🛩️",
    description: "18 seats. Technically a plane. The pilot is also the flight attendant.",
    fleetTierRequired: 1,
    buyCost: 800000,
    tiers: [
      { tierNum: 1, tierName: "Regional Route",   rentPerSecond: 700,     value: 800000,     upgradeCost: 2000000   },
      { tierNum: 2, tierName: "Commuter Circuit",  rentPerSecond: 2200,    value: 2800000,    upgradeCost: 7000000   },
      { tierNum: 3, tierName: "Premium Regional",  rentPerSecond: 6500,    value: 9800000,    upgradeCost: null      }
    ]
  },
  {
    id: "sky_express",
    name: "Sky Express",
    emoji: "✈️",
    description: "No frills. No legroom. Somehow always packed.",
    fleetTierRequired: 1,
    buyCost: 2500000,
    tiers: [
      { tierNum: 1, tierName: "Budget Service",    rentPerSecond: 2000,    value: 2500000,    upgradeCost: 6500000   },
      { tierNum: 2, tierName: "Economy Plus",      rentPerSecond: 6500,    value: 9000000,    upgradeCost: 22000000  },
      { tierNum: 3, tierName: "Charter Line",      rentPerSecond: 19000,   value: 31000000,   upgradeCost: null      }
    ]
  },
  {
    id: "golden_wing",
    name: "Golden Wing",
    emoji: "🌟✈️",
    description: "Business class only. The champagne is included. So is the price.",
    fleetTierRequired: 2,
    buyCost: 12000000,
    tiers: [
      { tierNum: 1, tierName: "Business Route",    rentPerSecond: 9000,    value: 12000000,   upgradeCost: 32000000  },
      { tierNum: 2, tierName: "Trans-Atlantic",    rentPerSecond: 28000,   value: 44000000,   upgradeCost: 100000000 },
      { tierNum: 3, tierName: "Global Circuit",    rentPerSecond: 80000,   value: 144000000,  upgradeCost: null      }
    ]
  },
  {
    id: "orbit_express",
    name: "Orbit Express",
    emoji: "🚀✈️",
    description: "Technically still in the atmosphere. Technically.",
    fleetTierRequired: 3,
    buyCost: 60000000,
    tiers: [
      { tierNum: 1, tierName: "Sub-Orbital Hop",   rentPerSecond: 45000,   value: 60000000,   upgradeCost: 160000000  },
      { tierNum: 2, tierName: "Hypersonic Route",  rentPerSecond: 140000,  value: 220000000,  upgradeCost: 550000000  },
      { tierNum: 3, tierName: "Space Adjacent",    rentPerSecond: 400000,  value: 770000000,  upgradeCost: null       }
    ]
  },
  {
    id: "galactic_one",
    name: "Galactic One",
    emoji: "🌌✈️",
    description: "Your personal galaxy-class vessel. Uncle Funds upgraded to first class.",
    fleetTierRequired: 4,
    buyCost: 300000000,
    tiers: [
      { tierNum: 1, tierName: "Private Charter",   rentPerSecond: 200000,  value: 300000000,  upgradeCost: 800000000   },
      { tierNum: 2, tierName: "Elite Fleet",       rentPerSecond: 640000,  value: 1100000000, upgradeCost: 2500000000  },
      { tierNum: 3, tierName: "Galactic Network",  rentPerSecond: 1800000, value: 3600000000, upgradeCost: null        }
    ]
  }
];

// ── HELPERS ───────────────────────────────────────────────────

// Returns the airline fleet tier the player has unlocked.
// Mirrors getUnlockedFleetTier() in yachts.js exactly.
// Tier = current Galactic Airlines business level (1-4), or 0 if not purchased.
function getUnlockedAirlineTier() {
  const level = gameState.ownedBusinesses["galactic_airlines"] || 0;
  return level; // business levelNum == fleet tier (1=1, 2=2, etc.)
}

// ── INCOME / NET WORTH CALCULATIONS ──────────────────────────

// Returns total passive income/sec from all owned airline fleet assets.
// Called by recalculateStats() in game.js.
function calculateAirlineFleetIncome() {
  let total = 0;
  for (const id in gameState.ownedAirlines) {
    const asset     = AIRLINE_FLEET.find(a => a.id === id);
    const tierIndex = gameState.ownedAirlines[id] - 1;
    if (asset && asset.tiers[tierIndex]) total += asset.tiers[tierIndex].rentPerSecond;
  }
  return total;
}

// Returns total net worth from all owned airline fleet assets.
// Called by recalculateStats() in game.js.
function calculateAirlineFleetNetWorth() {
  let total = 0;
  for (const id in gameState.ownedAirlines) {
    const asset     = AIRLINE_FLEET.find(a => a.id === id);
    const tierIndex = gameState.ownedAirlines[id] - 1;
    if (asset && asset.tiers[tierIndex]) total += asset.tiers[tierIndex].value;
  }
  return total;
}

// ── BUY & UPGRADE ─────────────────────────────────────────────

function buyAirlineAsset(assetId) {
  const asset = AIRLINE_FLEET.find(a => a.id === assetId);
  if (!asset) return;
  if (gameState.ownedAirlines[assetId]) return; // already owned
  if (getUnlockedAirlineTier() < asset.fleetTierRequired) {
    showToast("Upgrade Galactic Airlines to unlock this route!");
    return;
  }
  if (gameState.cash < asset.buyCost) {
    showToast("Not enough cash for " + asset.name + "!");
    return;
  }
  gameState.cash -= asset.buyCost;
  gameState.ownedAirlines[assetId] = 1;
  recalculateStats();
  saveGame();
  renderAirlineFleet();
  updateUI();
}

function upgradeAirlineAsset(assetId) {
  const currentTier = gameState.ownedAirlines[assetId];
  if (!currentTier) return;
  const asset    = AIRLINE_FLEET.find(a => a.id === assetId);
  const tierData = asset.tiers[currentTier - 1];
  if (!tierData.upgradeCost) { showToast("Already maxed!"); return; }
  if (gameState.cash < tierData.upgradeCost) {
    showToast("Not enough cash to upgrade " + asset.name + "!");
    return;
  }
  gameState.cash -= tierData.upgradeCost;
  gameState.ownedAirlines[assetId] = currentTier + 1;
  recalculateStats();
  saveGame();
  renderAirlineFleet();
  updateUI();
}

// ── RENDERING ─────────────────────────────────────────────────

// Builds the Airline Fleet panel. Mirrors renderYachtFleet() exactly.
// Three card states: owned, available (tier sufficient), locked (tier insufficient).
function renderAirlineFleet() {
  const container = document.getElementById("airline-fleet-list");
  if (!container) return;
  container.innerHTML = "";
  const unlockedTier = getUnlockedAirlineTier();

  // If Galactic Airlines has never been purchased, show a prompt
  if (unlockedTier === 0) {
    container.innerHTML = `
      <p style="color:#9e9e9e;font-size:0.85rem;text-align:center;padding:1rem;width:100%;">
        Purchase Galactic Airlines to unlock the fleet!
      </p>`;
    return;
  }

  AIRLINE_FLEET.forEach(asset => {
    const ownedTier    = gameState.ownedAirlines[asset.id] || 0;
    const isOwned      = ownedTier > 0;
    const tierData     = isOwned ? asset.tiers[ownedTier - 1] : null;
    const isMax        = isOwned && tierData.upgradeCost === null;
    const tierLocked   = !isOwned && unlockedTier < asset.fleetTierRequired;
    const canAffordBuy = !isOwned && !tierLocked && gameState.cash >= asset.buyCost;
    const canAffordUpg = isOwned && !isMax && gameState.cash >= tierData.upgradeCost;

    const card = document.createElement("div");
    card.className = "asset-card"
      + (isOwned    ? " owned"            : "")
      + (tierLocked ? " yacht-card-locked" : ""); // reuse yacht locked style

    // Add unlock tooltip data attribute for locked cards
    if (tierLocked) {
      const neededLevelName = ["Regional Carrier", "National Airline", "International Hub", "Global Fleet"][asset.fleetTierRequired - 1];
      card.setAttribute("data-locked-reason",
        "Upgrade Galactic Airlines to " + neededLevelName + " (Level " + asset.fleetTierRequired + ")");
    }

    if (isOwned) {
      const nextTierData = !isMax ? asset.tiers[ownedTier] : null;
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${asset.emoji}</span>
          <div class="asset-name-block">
            <strong>${asset.name}</strong>
            <span class="tier-badge airline-tier-${ownedTier}">${tierData.tierName} · Tier ${ownedTier}/3</span>
          </div>
        </div>
        <div class="asset-stats">
          ✈️ +${formatMoney(tierData.rentPerSecond)}/sec &nbsp; Net worth: ${formatMoney(tierData.value)}
        </div>
        ${isMax
          ? '<button class="btn btn-maxed" disabled>MAXED</button>'
          : `<button class="btn ${canAffordUpg ? 'btn-upgrade' : 'btn-locked'}"
                     onclick="upgradeAirlineAsset('${asset.id}')"
                     ${canAffordUpg ? '' : 'disabled'}
                     data-locked-reason="Need ${formatMoney(tierData.upgradeCost)} to upgrade">
               Upgrade → ${nextTierData.tierName} — ${formatMoney(tierData.upgradeCost)}
             </button>`
        }`;
    } else if (tierLocked) {
      const neededName = ["Regional Carrier", "National Airline", "International Hub", "Global Fleet"][asset.fleetTierRequired - 1];
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji" style="opacity:0.4">${asset.emoji}</span>
          <div class="asset-name-block">
            <strong style="color:#9e9e9e">${asset.name}</strong>
          </div>
        </div>
        <div class="yacht-lock-notice">
          Requires Galactic Airlines Level ${asset.fleetTierRequired} (${neededName})
        </div>`;
    } else {
      card.innerHTML = `
        <div class="asset-header">
          <span class="asset-emoji">${asset.emoji}</span>
          <div class="asset-name-block">
            <strong>${asset.name}</strong>
            <span style="font-size:0.75rem;color:#757575">${asset.description}</span>
          </div>
        </div>
        <div class="asset-stats">
          ✈️ +${formatMoney(asset.tiers[0].rentPerSecond)}/sec (Tier 1)
        </div>
        <button class="btn ${canAffordBuy ? 'btn-buy' : 'btn-locked'}"
                onclick="buyAirlineAsset('${asset.id}')"
                ${canAffordBuy ? '' : 'disabled'}
                data-locked-reason="Need ${formatMoney(asset.buyCost)}">
          Buy — ${formatMoney(asset.buyCost)}
        </button>`;
    }

    container.appendChild(card);
  });
}

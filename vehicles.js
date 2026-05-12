// ═══════════════════════════════════════════════════════════════
// EMPIRE — vehicles.js  (NEW in Update 3)
// Handles the Dealership, Garage, and Personal Home.
//
// IMPORTANT — THESE ARE VANITY SYSTEMS:
//   Cars and the home do NOT earn income, do NOT give click bonuses,
//   and do NOT contribute to net worth. They are pure money sinks
//   that let the player flex their wealth. No recalculateStats()
//   call is needed when buying — only updateUI() for cash display.
//
// NEW gameState KEYS:
//   ownedCars: []   — array of car id strings (e.g. ["civic", "mustang"])
//   homeTier:  0    — 0 = no home, 1 through 5 = current tier owned
//
// FUNCTIONS CALLED FROM OUTSIDE THIS FILE:
//   openDealership() / closeDealership() — wired to top bar buttons
//   openGarage()     / closeGarage()     — wired to top bar buttons
//   openHome()       / closeHome()       — wired to top bar button
// ═══════════════════════════════════════════════════════════════

// ── CAR DATA ─────────────────────────────────────────────────

// All purchasable vehicles — 5 originals + 15 new in Update 5.1.
// Each car has a 'category' field for the dealership filter tabs.
const VEHICLES = [
  // ── ORIGINAL 5 (Update 3) ───────────────────────────────────
  {
    id: "civic",
    name: "2003 Honda Civic",
    emoji: "🚗",
    description: "It runs. Most of the time. The AC is a suggestion.",
    price: 3000,
    rarity: "Common",
    category: "Starter"
  },
  {
    id: "mustang",
    name: "Ford Mustang GT",
    emoji: "🐎",
    description: "Loud, proud, and parks diagonally at every opportunity.",
    price: 35000,
    rarity: "Uncommon",
    category: "Starter"
  },
  {
    id: "bmw_m3",
    name: "BMW M3",
    emoji: "🏎️",
    description: "For when you need everyone at the coffee shop to know.",
    price: 85000,
    rarity: "Rare",
    category: "Sport"
  },
  {
    id: "rolls",
    name: "Rolls-Royce Ghost",
    emoji: "👻🚘",
    description: "You don't drive it. It glides. On air. On money.",
    price: 350000,
    rarity: "Elite",
    category: "Luxury"
  },
  {
    id: "lambo",
    name: "Lamborghini Aventador",
    emoji: "🟡🏎️",
    description: "You bought it. Uncle Funds fainted. Worth it.",
    price: 750000,
    rarity: "Legendary",
    category: "Super"
  },

  // ── UPDATE 5.1: 3 NEW STARTER CARS ─────────────────────────
  {
    id: "beater_truck",
    name: "1998 Ford F-150",
    emoji: "🛻",
    description: "Three dents, zero regrets. That bumper sticker is load-bearing.",
    price: 1500,
    rarity: "Common",
    category: "Starter"
  },
  {
    id: "moped",
    name: "Razor Moped Pro",
    emoji: "🛵",
    description: "Technically motorized. Technically a vehicle. Technically yours.",
    price: 800,
    rarity: "Common",
    category: "Starter"
  },
  {
    id: "minivan",
    name: "2009 Dodge Grand Caravan",
    emoji: "🚐",
    description: "Seven seats. None of them comfortable. All of them sticky.",
    price: 4500,
    rarity: "Uncommon",
    category: "Starter"
  },

  // ── UPDATE 5.1: 3 NEW SPORT CARS ───────────────────────────
  {
    id: "corvette",
    name: "Chevrolet Corvette Z06",
    emoji: "🏎️",
    description: "American muscle with a midlife crisis baked in. Glorious.",
    price: 120000,
    rarity: "Sport",
    category: "Sport"
  },
  {
    id: "porsche_911",
    name: "Porsche 911 Turbo S",
    emoji: "🚗",
    description: "Engineered by people who consider fun a scientific principle.",
    price: 220000,
    rarity: "Sport",
    category: "Sport"
  },
  {
    id: "ferrari_roma",
    name: "Ferrari Roma",
    emoji: "🏎️",
    description: "Italy decided to bottle passion and sell it for $200K. You bought it.",
    price: 280000,
    rarity: "Sport",
    category: "Sport"
  },

  // ── UPDATE 5.1: 3 NEW LUXURY CARS ──────────────────────────
  {
    id: "bentley",
    name: "Bentley Continental GT",
    emoji: "🚙",
    description: "Hand-stitched leather. Hand-buffed walnut. Hand-delivered shame at nothing.",
    price: 600000,
    rarity: "Elite",
    category: "Luxury"
  },
  {
    id: "maybach",
    name: "Mercedes-Maybach S680",
    emoji: "🚗",
    description: "The back seat reclines fully flat. Your accountant sits up front.",
    price: 850000,
    rarity: "Elite",
    category: "Luxury"
  },
  {
    id: "aston_dbs",
    name: "Aston Martin DBS",
    emoji: "🚘",
    description: "James Bond drives one. You drive one now. No missions required.",
    price: 750000,
    rarity: "Elite",
    category: "Luxury"
  },

  // ── UPDATE 5.1: 3 NEW SUPER CARS ───────────────────────────
  {
    id: "mclaren_720",
    name: "McLaren 720S",
    emoji: "🏎️",
    description: "720 horsepower. 0 to 60 in 2.9 seconds. 100% worth it.",
    price: 2000000,
    rarity: "Super",
    category: "Super"
  },
  {
    id: "bugatti_chiron",
    name: "Bugatti Chiron",
    emoji: "🏎️",
    description: "1,479 horsepower. Top speed: yes. Price: also yes.",
    price: 4500000,
    rarity: "Super",
    category: "Super"
  },
  {
    id: "pagani_huayra",
    name: "Pagani Huayra",
    emoji: "🏎️",
    description: "Handmade in Italy by people who believe cars are art. They are right.",
    price: 3500000,
    rarity: "Super",
    category: "Super"
  },

  // ── UPDATE 5.1: 3 NEW HYPERCARS ────────────────────────────
  {
    id: "rimac_nevera",
    name: "Rimac Nevera",
    emoji: "⚡🏎️",
    description: "Electric. 1,914 hp. It will beat anything on the planet. Silently.",
    price: 12000000,
    rarity: "Hypercar",
    category: "Hypercar"
  },
  {
    id: "koenigsegg_jesko",
    name: "Koenigsegg Jesko Absolut",
    emoji: "🏎️",
    description: "Top speed: 330 mph. Roads fast enough for it: 0. Worth it: yes.",
    price: 20000000,
    rarity: "Hypercar",
    category: "Hypercar"
  },
  {
    id: "ssc_tuatara",
    name: "SSC Tuatara",
    emoji: "🏎️",
    description: "The fastest production car on Earth. Uncle Funds just fainted again.",
    price: 18000000,
    rarity: "Hypercar",
    category: "Hypercar"
  }
];

// Maps each rarity name to a CSS class for the coloured rarity badge.
// Common=grey, Uncommon=green, Rare=blue, Elite=purple, Legendary=gold
// Update 5.1: Sport=bold blue, Super=deep purple, Hypercar=animated gradient
const RARITY_CLASS = {
  "Common":    "rarity-common",
  "Uncommon":  "rarity-uncommon",
  "Rare":      "rarity-rare",
  "Elite":     "rarity-elite",
  "Legendary": "rarity-legendary",
  // New in Update 5.1:
  "Sport":     "rarity-sport",
  "Super":     "rarity-super",
  "Hypercar":  "rarity-hypercar"
};

// ── DEALERSHIP FILTER STATE ───────────────────────────────────
// Tracks the active category tab in the Dealership modal.
// "All" shows every car; other values filter by car.category.
let dealershipFilter = "All";

// ── HOME DATA ─────────────────────────────────────────────────

// The 5 home upgrade tiers. Player starts at tier 0 (no home).
// Each entry's 'cost' is what it costs to move FROM the previous tier TO this one.
//   Tier 0 → Tier 1: costs HOME_TIERS[0].cost
//   Tier 1 → Tier 2: costs HOME_TIERS[1].cost
//   ...and so on.
const HOME_TIERS = [
  { tier: 1, name: "The Dump",       emoji: "🏚️",   description: "It has four walls. Two of them are load-bearing.",               cost: 1000    },
  { tier: 2, name: "Decent Digs",    emoji: "🏠",    description: "The neighbors no longer feel sorry for you.",                   cost: 15000   },
  { tier: 3, name: "Suburban Dream", emoji: "🏡",    description: "A lawn. A driveway. A mortgage that haunts you.",               cost: 75000   },
  { tier: 4, name: "City Penthouse", emoji: "🌆",    description: "37 floors up. The elevator has a mirror. You look good.",        cost: 500000  },
  { tier: 5, name: "Mega Mansion",   emoji: "🏰✨",  description: "12 bedrooms. A bowling alley. Uncle Funds moved in uninvited.", cost: 2000000 }
];

// ── DEALERSHIP FUNCTIONS ──────────────────────────────────────

// Opens the Dealership modal and renders the current car list.
function openDealership() {
  renderDealership();
  const modal = document.getElementById("dealership-modal");
  if (modal) modal.style.display = "flex";
}

// Closes the Dealership modal.
function closeDealership() {
  const modal = document.getElementById("dealership-modal");
  if (modal) modal.style.display = "none";
}

// Purchases a car. Cars cannot be sold.
// Only deducts cash — cars are purely cosmetic and do NOT affect
// net worth, income, or click value.
function buyCar(carId) {
  const car = VEHICLES.find(v => v.id === carId);
  if (!car) return;

  // Guard: player already owns this car (button should be hidden, but just in case)
  if (gameState.ownedCars && gameState.ownedCars.includes(carId)) {
    showToast("You already own this car! 🚗");
    return;
  }

  if (gameState.cash < car.price) {
    showToast(`Need ${formatMoney(car.price)} to buy this! 💸`);
    return;
  }

  // Deduct cash and record the purchase
  gameState.cash -= car.price;
  if (!gameState.ownedCars) gameState.ownedCars = [];
  gameState.ownedCars.push(carId);

  // Cars are vanity — no recalculateStats() needed.
  // updateUI() refreshes the cash display in the top bar.
  saveGame();
  renderDealership(); // refresh so the bought car now shows "✅ Owned"
  updateUI();

  showToast(`${car.emoji} ${car.name} added to your garage!`);

  // Update 5.1: first Hypercar triggers Uncle Funds dialogue
  if (car.rarity === "Hypercar" && !gameState.hasSeenFirstHypercar) {
    gameState.hasSeenFirstHypercar = true;
    triggerDialogue("first_hypercar");
  }
}

// Updates the active tab highlight and re-renders the dealership list.
// Called by the tab buttons in the dealership modal (index.html).
function setDealerFilter(category) {
  dealershipFilter = category;
  // Update active tab style
  document.querySelectorAll(".dealer-tab").forEach(btn => {
    btn.classList.toggle("dealer-tab-active", btn.textContent.trim() === category);
  });
  renderDealership();
}

// Renders car cards inside the Dealership modal, filtered by dealershipFilter.
// Shows "✅ Owned" badge for already-purchased cars.
// Disables the Buy button when the player can't afford it.
function renderDealership() {
  const container = document.getElementById("dealership-content");
  if (!container) return;

  container.innerHTML = ""; // wipe and rebuild

  // Filter by active category (show all if "All" is selected)
  const filtered = dealershipFilter === "All"
    ? VEHICLES
    : VEHICLES.filter(v => v.category === dealershipFilter);

  filtered.forEach(car => {
    const owned       = gameState.ownedCars && gameState.ownedCars.includes(car.id);
    const canAfford   = gameState.cash >= car.price;
    const rarityClass = RARITY_CLASS[car.rarity] || "rarity-common";

    const card = document.createElement("div");
    card.className = "vehicle-card" + (owned ? " vehicle-owned" : "");

    card.innerHTML = `
      <div class="vehicle-card-inner">
        <span class="vehicle-emoji">${car.emoji}</span>
        <div class="vehicle-info">
          <div class="vehicle-name">${car.name}</div>
          <div class="vehicle-desc">${car.description}</div>
          <span class="rarity-badge ${rarityClass}">${car.rarity}</span>
        </div>
        <div class="vehicle-action">
          ${owned
            ? `<div class="vehicle-owned-badge">✅ Owned</div>`
            : `<div class="vehicle-price">${formatMoney(car.price)}</div>
               <button class="btn ${canAfford ? 'btn-buy' : 'btn-locked'}"
                       onclick="buyCar('${car.id}')"
                       ${canAfford ? '' : 'disabled'}>
                 Buy
               </button>`
          }
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ── GARAGE FUNCTIONS ──────────────────────────────────────────

// Opens the Garage modal showing only owned cars.
function openGarage() {
  renderGarage();
  const modal = document.getElementById("garage-modal");
  if (modal) modal.style.display = "flex";
}

// Closes the Garage modal.
function closeGarage() {
  const modal = document.getElementById("garage-modal");
  if (modal) modal.style.display = "none";
}

// Renders only the cars the player has already purchased.
// Shows an empty-state message if the player has no cars yet.
function renderGarage() {
  const container = document.getElementById("garage-content");
  if (!container) return;

  container.innerHTML = "";

  // Get full data for each owned car id, filtering out any unknown ids
  const owned = (gameState.ownedCars || [])
    .map(id => VEHICLES.find(v => v.id === id))
    .filter(Boolean);

  if (owned.length === 0) {
    container.innerHTML = `
      <div class="garage-empty">
        Your garage is empty. Go buy something nice. 🚗
      </div>
    `;
    return;
  }

  owned.forEach(car => {
    const rarityClass = RARITY_CLASS[car.rarity] || "rarity-common";

    const card = document.createElement("div");
    card.className = "vehicle-card vehicle-owned";

    card.innerHTML = `
      <div class="vehicle-card-inner">
        <span class="vehicle-emoji">${car.emoji}</span>
        <div class="vehicle-info">
          <div class="vehicle-name">${car.name}</div>
          <div class="vehicle-desc">${car.description}</div>
          <span class="rarity-badge ${rarityClass}">${car.rarity}</span>
        </div>
        <div class="vehicle-action">
          <div class="vehicle-owned-badge">✅ Owned</div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ── HOME FUNCTIONS ────────────────────────────────────────────

// Opens the My Home modal and renders current home status.
function openHome() {
  renderHome();
  const modal = document.getElementById("home-modal");
  if (modal) modal.style.display = "flex";
}

// Closes the My Home modal.
function closeHome() {
  const modal = document.getElementById("home-modal");
  if (modal) modal.style.display = "none";
}

// Buys or upgrades the player's home.
//   homeTier 0 → 1: buys Tier 1 (The Dump)
//   homeTier 1 → 2: upgrades to Tier 2 (Decent Digs)
//   ...and so on up to Tier 5.
// The home is a vanity item — no recalculateStats() needed.
function upgradeHome() {
  const currentTier = gameState.homeTier || 0;

  if (currentTier >= HOME_TIERS.length) {
    showToast("Your mansion is already maxed out! 👑");
    return;
  }

  // HOME_TIERS is 0-indexed:
  //   HOME_TIERS[0] is Tier 1, costing $1,000  (buy from tier 0)
  //   HOME_TIERS[1] is Tier 2, costing $15,000 (upgrade from tier 1)
  //   etc.
  const nextTierData = HOME_TIERS[currentTier]; // index matches the current tier number

  if (gameState.cash < nextTierData.cost) {
    showToast(`Need ${formatMoney(nextTierData.cost)} for this upgrade! 💸`);
    return;
  }

  gameState.cash -= nextTierData.cost;
  gameState.homeTier = currentTier + 1;

  // Vanity only — just save and refresh cash display
  saveGame();
  renderHome(); // refresh the modal to show the new tier
  updateUI();

  showToast(`Welcome to your ${nextTierData.name}! ${nextTierData.emoji}`);
}

// Renders the current home tier inside the My Home modal.
// Shows upgrade button with cost to next tier, or a MAXED message at tier 5.
function renderHome() {
  const container = document.getElementById("home-content");
  if (!container) return;

  const currentTier = gameState.homeTier || 0;
  const isMaxed     = currentTier >= HOME_TIERS.length;

  if (currentTier === 0) {
    // Player has no home yet — show the first purchase option
    const firstTier = HOME_TIERS[0];
    const canAfford = gameState.cash >= firstTier.cost;

    container.innerHTML = `
      <div class="home-display">
        <div class="home-emoji">🏠</div>
        <div class="home-name">No Home Yet</div>
        <div class="home-desc">
          You don't even own a place to sleep.<br>That's honestly impressive.
        </div>
      </div>
      <button class="btn ${canAfford ? 'btn-buy' : 'btn-locked'}"
              onclick="upgradeHome()"
              ${canAfford ? '' : 'disabled'}>
        🏚️ Buy ${firstTier.name} — ${formatMoney(firstTier.cost)}
      </button>
    `;

  } else {
    // Player has a home — show current tier + upgrade option
    const tierData  = HOME_TIERS[currentTier - 1]; // 0-indexed
    const nextTier  = isMaxed ? null : HOME_TIERS[currentTier];
    const canAfford = nextTier ? gameState.cash >= nextTier.cost : false;

    container.innerHTML = `
      <div class="home-display">
        <div class="home-emoji">${tierData.emoji}</div>
        <div class="home-name">${tierData.name}</div>
        <div class="home-desc">${tierData.description}</div>
        <div class="home-tier-label">Tier ${currentTier} / ${HOME_TIERS.length}</div>
      </div>
      ${isMaxed
        ? `<button class="btn btn-maxed" disabled>
             👑 MAXED — You live like a king!
           </button>`
        : `<button class="btn ${canAfford ? 'btn-upgrade' : 'btn-locked'}"
                   onclick="upgradeHome()"
                   ${canAfford ? '' : 'disabled'}>
             ⬆️ Upgrade → ${nextTier.name} ${nextTier.emoji} — ${formatMoney(nextTier.cost)}
           </button>`
      }
    `;
  }
}

// ═══════════════════════════════════════════════════════════════
// EMPIRE — lifestyle.js  (New in Update 5.8)
// Lifestyle Modal, Silly Shop, Trophy Room.
// All purely vanity — no income, no net worth effect.
// ═══════════════════════════════════════════════════════════════

// ── LIFESTYLE DATA ─────────────────────────────────────────────
const LIFESTYLE_DATA = {
  vacations: [
    { id: "beach_weekend",   name: "Beach Weekend",            emoji: "🏖️", description: "Three days. Sun, sand, and zero emails. Bliss.",                                           price: 5000,      badge: "Beach Bum" },
    { id: "vegas_trip",      name: "Vegas Trip",               emoji: "🎰", description: "What happens in Vegas gets posted anyway.",                                                  price: 15000,     badge: "High Roller" },
    { id: "europe_tour",     name: "European Tour",            emoji: "🗼", description: "Paris, Rome, London. You ate croissants professionally.",                                    price: 50000,     badge: "Jet Setter" },
    { id: "private_island",  name: "Private Island Getaway",   emoji: "🏝️", description: "Your island. Your rules. No Wi-Fi unless you want it.",                                    price: 500000,    badge: "Island Lord" },
    { id: "space_tourism",   name: "Space Tourism",            emoji: "🚀", description: "You went to space. For fun. Uncle Funds is still on Earth.",                               price: 5000000,   badge: "Astronaut (kind of)" }
  ],
  staff: [
    { id: "personal_chef",   name: "Personal Chef",            emoji: "👨‍🍳", description: "Michelin-trained. Makes Tuesday feel like a gala.",                                       price: 25000,     badge: "Well Fed" },
    { id: "butler",          name: "Personal Butler",          emoji: "🤵", description: "Anticipates your needs. Never judges. Slightly terrifying.",                               price: 75000,     badge: "Attended" },
    { id: "personal_trainer",name: "Personal Trainer",         emoji: "💪", description: "You pay them to yell at you. Apparently this is luxury.",                                  price: 20000,     badge: "Gains" },
    { id: "stylist",         name: "Personal Stylist",         emoji: "👗", description: "You no longer pick your own outfits. Thank goodness.",                                     price: 40000,     badge: "Dressed" },
    { id: "security_team",   name: "Security Detail",          emoji: "🕴️", description: "Six guards. Earpieces. Sunglasses indoors. You are important.",                           price: 200000,    badge: "Protected" },
    { id: "private_doctor",  name: "Private Doctor",           emoji: "🩺", description: "On call 24/7. Has your blood type memorized. Slightly obsessive.",                         price: 150000,    badge: "Healthy" }
  ],
  experiences: [
    { id: "formula1_race",   name: "Formula 1 VIP Experience", emoji: "🏎️", description: "Pit lane access. Podium seats. You touched a real F1 car.",                               price: 30000,     badge: "Speed Demon" },
    { id: "superbowl_suite", name: "Super Bowl Suite",         emoji: "🏈", description: "A private suite. All the food. Zero idea what a blitz is.",                               price: 80000,     badge: "Suite Life" },
    { id: "met_gala",        name: "Met Gala Ticket",          emoji: "🎭", description: "The theme was confusing. Your outfit was not. Cameras everywhere.",                        price: 250000,    badge: "Fashion Icon" },
    { id: "everest_climb",   name: "Everest Expedition",       emoji: "🏔️", description: "You climbed the tallest mountain on Earth. Mostly to say you did.",                       price: 100000,    badge: "Mountaineer" },
    { id: "buy_a_star",      name: "Name a Star",              emoji: "⭐", description: "You named a star after yourself. Astronomers disagree. Whatever.",                         price: 500,       badge: "Stargazer" },
    { id: "nft_purchase",    name: "Buy an NFT",               emoji: "🖼️", description: "You own a JPEG. Legally. Uncle Funds is speechless.",                                     price: 50000,     badge: "Web3 Victim" },
    { id: "movie_cameo",     name: "Movie Cameo",              emoji: "🎬", description: "Two seconds of screen time. You nailed it.",                                               price: 1000000,   badge: "Hollywood" },
    { id: "buy_a_country",   name: "Buy a Country (Kind Of)",  emoji: "🌍", description: "You did not buy a country. You did buy naming rights to a small town.",                    price: 50000000,  badge: "World Leader" }
  ]
};

// ── SILLY ITEMS DATA ────────────────────────────────────────────
const SILLY_ITEMS = [
  { id: "emotional_support_accountant", name: "Emotional Support Accountant", emoji: "😭💼", description: "He doesn't do your taxes. He just listens. $800/hour.",                                                     price: 10000,     uncleReaction: "That is the most unhinged financial decision I have ever seen. I respect it." },
  { id: "pet_dinosaur",                 name: "Pet Dinosaur (Clone)",          emoji: "🦕",   description: "Legally questionable. Scientifically impressive. Eats a lot.",                                               price: 5000000,   uncleReaction: "You bought a DINOSAUR. A CLONED DINOSAUR. I have no words. Many emotions." },
  { id: "gold_toilet",                  name: "24K Gold Toilet",               emoji: "🚽",   description: "Fully functional. Completely unnecessary. Absolutely mandatory.",                                            price: 100000,    uncleReaction: "A gold toilet. You bought a GOLD TOILET. Uncle Funds is not surprised. Uncle Funds is a little jealous." },
  { id: "moon_plot",                    name: "Plot of Land on the Moon",      emoji: "🌕",   description: "Certificate of ownership included. Legally meaningless. Spiritually powerful.",                             price: 250000,    uncleReaction: "You own the MOON. Part of it. A certificate says so. This is either genius or nonsense. Both." },
  { id: "doomsday_bunker",              name: "Personal Doomsday Bunker",      emoji: "🏚️",  description: "10 years of supplies. A pool table. No windows. Just in case.",                                            price: 2000000,   uncleReaction: "Smart. Very smart actually. Uncle Funds wants one. Does it have a snack room?" },
  { id: "rename_city",                  name: "Rename a City After Yourself",  emoji: "🏙️",  description: "A small city in rural Nevada is now named after you. Population: 47.",                                     price: 10000000,  uncleReaction: "A CITY. Named after YOU. Those 47 people will tell their grandchildren. Probably." },
  { id: "diamond_toothbrush",           name: "Diamond-Encrusted Toothbrush", emoji: "💎🪥", description: "Your dentist said this was unnecessary. You said goodbye to that dentist.",                                price: 50000,     uncleReaction: "Your teeth will be the richest teeth on the planet. Uncle Funds has no notes." },
  { id: "submarine",                    name: "Personal Submarine",            emoji: "🤿",   description: "Yellow. Fully operational. You have been to the bottom of the ocean once.",                                price: 8000000,   uncleReaction: "A SUBMARINE. For fun. You go UNDER the ocean for fun now. Incredible. Unhinged. Perfect." },
  { id: "statue_of_self",               name: "Commission a Statue of Yourself", emoji: "🗿", description: "Bronze. Life-size. In your front yard. Neighbors have opinions.",                                         price: 500000,    uncleReaction: "A statue. Of YOU. In YOUR yard. Uncle Funds is ordering one of himself immediately." },
  { id: "buy_a_cloud",                  name: "Name a Cloud Formation",        emoji: "☁️",   description: "Meteorologists refused. A guy on Etsy agreed. It is named after you now.",                                price: 200,       uncleReaction: "You named a CLOUD. For two hundred dollars. That might be the best deal you have ever made." }
];

// ── LIFESTYLE MODAL ─────────────────────────────────────────────

function openLifestyle() {
  switchLifestyleTab('vacations');
  const modal = document.getElementById("lifestyle-modal");
  if (modal) modal.style.display = "flex";
}

function closeLifestyle() {
  const modal = document.getElementById("lifestyle-modal");
  if (modal) modal.style.display = "none";
}

function switchLifestyleTab(tabName) {
  // Update tab button active state
  document.querySelectorAll(".lifestyle-tab").forEach(btn => {
    btn.classList.remove("lifestyle-tab-active");
  });
  // Find the clicked tab by its onclick attribute content
  document.querySelectorAll(".lifestyle-tab").forEach(btn => {
    if (btn.getAttribute("onclick") && btn.getAttribute("onclick").includes("'" + tabName + "'")) {
      btn.classList.add("lifestyle-tab-active");
    }
  });
  renderLifestyleTab(tabName);
}

function renderLifestyleTab(tabName) {
  const content = document.getElementById("lifestyle-content");
  if (!content) return;

  const items = LIFESTYLE_DATA[tabName];
  if (!items) { content.innerHTML = ""; return; }

  const purchases = gameState.lifestylePurchases || [];
  let html = "";

  items.forEach(item => {
    const owned = purchases.includes(item.id);
    if (owned) {
      html += `
        <div class="lifestyle-card owned">
          <div class="lifestyle-card-emoji">${item.emoji}</div>
          <div class="lifestyle-card-body">
            <div class="lifestyle-card-name">${item.name}</div>
            <div class="lifestyle-card-desc">${item.description}</div>
            <span class="lifestyle-badge">✓ ${item.badge}</span>
            <div class="lifestyle-owned-label">Owned</div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="lifestyle-card">
          <div class="lifestyle-card-emoji">${item.emoji}</div>
          <div class="lifestyle-card-body">
            <div class="lifestyle-card-name">${item.name}</div>
            <div class="lifestyle-card-desc">${item.description}</div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.3rem;">
              <span style="font-weight:800; font-size:0.85rem; color:#1b5e20;">${formatMoney(item.price)}</span>
              <button class="btn btn-buy" style="padding:0.25rem 0.7rem; font-size:0.8rem;"
                      onclick="buyLifestyleItem('${item.id}', '${tabName}')">Buy</button>
            </div>
          </div>
        </div>`;
    }
  });

  content.innerHTML = html;
}

function buyLifestyleItem(itemId, tabName) {
  // Find item across all categories
  let foundItem = null;
  let foundCategory = null;
  for (const [cat, items] of Object.entries(LIFESTYLE_DATA)) {
    const item = items.find(i => i.id === itemId);
    if (item) { foundItem = item; foundCategory = cat; break; }
  }
  if (!foundItem) return;

  if ((gameState.lifestylePurchases || []).includes(itemId)) {
    showToast("Already purchased!"); return;
  }
  if (gameState.cash < foundItem.price) {
    showToast("Not enough cash! Need " + formatMoney(foundItem.price)); return;
  }

  gameState.cash = Math.max(0, gameState.cash - foundItem.price);
  if (!gameState.lifestylePurchases) gameState.lifestylePurchases = [];
  gameState.lifestylePurchases.push(itemId);

  saveGame();
  updateUI();
  renderLifestyleTab(tabName || foundCategory);
  showToast(foundItem.emoji + " " + foundItem.name + " purchased! Badge earned: " + foundItem.badge);

  // Dialogue triggers
  if (!gameState.hasSeenFirstLifestyle) {
    gameState.hasSeenFirstLifestyle = true;
    triggerDialogue("first_lifestyle");
  }
  if (!gameState.hasSeenFirstVacation && foundCategory === "vacations") {
    gameState.hasSeenFirstVacation = true;
    triggerDialogue("first_vacation");
  }
}

// ── SILLY SHOP ──────────────────────────────────────────────────

function openSillyShop() {
  renderSillyShop();
  const modal = document.getElementById("silly-shop-modal");
  if (modal) modal.style.display = "flex";
}

function closeSillyShop() {
  const modal = document.getElementById("silly-shop-modal");
  if (modal) modal.style.display = "none";
}

function renderSillyShop() {
  const content = document.getElementById("silly-shop-content");
  if (!content) return;

  const purchases = gameState.lifestylePurchases || [];
  let html = "";

  SILLY_ITEMS.forEach(item => {
    const owned = purchases.includes(item.id);
    if (owned) {
      html += `
        <div class="lifestyle-card owned" style="margin-bottom:0.5rem;">
          <div class="lifestyle-card-emoji">${item.emoji}</div>
          <div class="lifestyle-card-body">
            <div class="lifestyle-card-name">${item.name}</div>
            <div class="lifestyle-card-desc">${item.description}</div>
            <div class="lifestyle-owned-label">✓ Owned</div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="lifestyle-card" style="margin-bottom:0.5rem;">
          <div class="lifestyle-card-emoji">${item.emoji}</div>
          <div class="lifestyle-card-body">
            <div class="lifestyle-card-name">${item.name}</div>
            <div class="lifestyle-card-desc">${item.description}</div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.3rem;">
              <span style="font-weight:800; font-size:0.85rem; color:#1b5e20;">${formatMoney(item.price)}</span>
              <button class="btn btn-buy" style="padding:0.25rem 0.7rem; font-size:0.8rem;"
                      onclick="buySillyItem('${item.id}')">Buy</button>
            </div>
          </div>
        </div>`;
    }
  });

  content.innerHTML = html;
}

function buySillyItem(itemId) {
  const item = SILLY_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if ((gameState.lifestylePurchases || []).includes(itemId)) {
    showToast("You already have this."); return;
  }
  if (gameState.cash < item.price) {
    showToast("Not enough cash! Need " + formatMoney(item.price)); return;
  }

  gameState.cash = Math.max(0, gameState.cash - item.price);
  if (!gameState.lifestylePurchases) gameState.lifestylePurchases = [];
  gameState.lifestylePurchases.push(itemId);

  saveGame();
  updateUI();
  renderSillyShop();
  renderFlex();
  showToast(item.emoji + " " + item.name + " — yours forever.");

  // Show uncle reaction as a one-off dialogue line
  // triggerDialogue supports dynamic arrays — push the reaction directly
  const tempKey = "__silly_reaction__";
  DIALOGUE_TRIGGERS[tempKey] = [item.uncleReaction];
  triggerDialogue(tempKey);
  delete DIALOGUE_TRIGGERS[tempKey];

  if (!gameState.hasSeenFirstSilly) {
    gameState.hasSeenFirstSilly = true;
    triggerDialogue("first_silly");
  }
}

// ── TROPHY ROOM (Flex Section) ──────────────────────────────────

function toggleFlex() {
  const content = document.getElementById("flex-content");
  const arrow   = document.getElementById("flex-toggle-arrow");
  if (!content) return;
  if (content.style.display === "none" || content.style.display === "") {
    content.style.display = "block";
    if (arrow) arrow.textContent = "▲";
    renderFlex();
  } else {
    content.style.display = "none";
    if (arrow) arrow.textContent = "▼";
  }
}

function renderFlex() {
  const content = document.getElementById("flex-content");
  if (!content || content.style.display === "none") return;

  let html = "";

  // ── VEHICLES ──────────────────────────────────────────────
  html += '<div class="flex-section-label">🚗 Vehicles</div>';
  const cars = gameState.ownedCars || [];
  if (cars.length === 0) {
    html += '<div class="flex-empty">No vehicles yet.</div>';
  } else {
    cars.forEach(carId => {
      const car = (typeof VEHICLES !== "undefined") ? VEHICLES.find(v => v.id === carId) : null;
      if (car) {
        html += `<div class="flex-item-row">${car.emoji} <span>${car.name}</span></div>`;
      }
    });
  }

  // ── HOME ──────────────────────────────────────────────────
  html += '<div class="flex-section-label">🏠 Home</div>';
  const tier = gameState.homeTier || 0;
  if (tier === 0) {
    html += '<div class="flex-empty">No home yet.</div>';
  } else {
    const homeNames = ["", "Studio Apartment", "Townhouse", "Suburban House", "Penthouse", "Mansion"];
    const homeEmojis = ["", "🛏️", "🏠", "🏡", "🏙️", "🏰"];
    html += `<div class="flex-item-row">${homeEmojis[tier] || "🏠"} <span>${homeNames[tier] || "Home Tier " + tier}</span></div>`;
  }

  // ── LIFESTYLE PURCHASES ───────────────────────────────────
  html += '<div class="flex-section-label">🌴 Lifestyle</div>';
  const purchases = (gameState.lifestylePurchases || []).filter(id => {
    return Object.values(LIFESTYLE_DATA).some(arr => arr.some(i => i.id === id));
  });
  if (purchases.length === 0) {
    html += '<div class="flex-empty">No lifestyle purchases yet.</div>';
  } else {
    purchases.forEach(id => {
      let found = null;
      for (const arr of Object.values(LIFESTYLE_DATA)) {
        found = arr.find(i => i.id === id);
        if (found) break;
      }
      if (found) {
        html += `<div class="flex-item-row">${found.emoji} <span>${found.name}</span> <span class="lifestyle-badge" style="font-size:0.65rem;">${found.badge}</span></div>`;
      }
    });
  }

  // ── SILLY PURCHASES ───────────────────────────────────────
  html += '<div class="flex-section-label">🎉 Silly Purchases</div>';
  const sillies = (gameState.lifestylePurchases || []).filter(id =>
    SILLY_ITEMS.some(i => i.id === id)
  );
  if (sillies.length === 0) {
    html += '<div class="flex-empty">No silly purchases yet.</div>';
  } else {
    sillies.forEach(id => {
      const item = SILLY_ITEMS.find(i => i.id === id);
      if (item) {
        html += `<div class="flex-item-row">${item.emoji} <span>${item.name}</span></div>`;
      }
    });
  }

  content.innerHTML = html;
}


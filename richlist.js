// ═══════════════════════════════════════════════════════════════
// EMPIRE — richlist.js
// The NPC tycoons the player must outrank.
// Also handles calculating and displaying the player's current rank.
// ═══════════════════════════════════════════════════════════════

// The World Rich List — sorted from lowest to highest net worth.
// The player starts unranked and climbs by growing their net worth.
// UPDATE 4: Expanded from 10 to 15 entries. Five new Super-Tier rivals
// (negative ranks) sit above Bill Naire.
// UPDATE 5.6.4: Expanded from 15 to 20 entries. Five new Apex-Tier rivals
// (ranks -6 to -10) sit above THE MONEY GHOST. Win condition = beat THE ARCHITECT ($500B).
// Apex Tier displays as A1–A5 (rank -6 = A1, rank -10 = A5).
const RICH_LIST = [
  { rank: 10, name: "Penny Pincher",       netWorth: 50000,           emoji: "😤" },
  { rank: 9,  name: "Nick L. Dime",        netWorth: 150000,          emoji: "🙄" },
  { rank: 8,  name: "Richie Poorman",      netWorth: 400000,          emoji: "😒" },
  { rank: 7,  name: "Cashy McKashface",    netWorth: 900000,          emoji: "😬" },
  { rank: 6,  name: "Dolly Billions",      netWorth: 2000000,         emoji: "😠" },
  { rank: 5,  name: "Hugh Mungus Wealth",  netWorth: 5000000,         emoji: "😤" },
  { rank: 4,  name: "Warren Buffet-Table", netWorth: 12000000,        emoji: "😰" },
  { rank: 3,  name: "Jeff Beezos",         netWorth: 30000000,        emoji: "😨" },
  { rank: 2,  name: "Elon Muskrat",        netWorth: 75000000,        emoji: "😱" },
  { rank: 1,  name: "Bill Naire",          netWorth: 200000000,       emoji: "🏆" },
  // ── Super-Tier rivals (Update 4) — negative ranks display as S1–S5 ──
  { rank: -1, name: "Sir Spendsalot",       netWorth: 500000000,      emoji: "🎩" },
  { rank: -2, name: "Goldie Vaultsworth",   netWorth: 1000000000,     emoji: "💰" },
  { rank: -3, name: "The Yacht Lord",       netWorth: 2500000000,     emoji: "🚤" },
  { rank: -4, name: "Madame Trillionaire",  netWorth: 5000000000,     emoji: "👑" },
  { rank: -5, name: "THE MONEY GHOST",      netWorth: 10000000000,    emoji: "👻" },
  // ── Apex-Tier rivals (Update 5.6.4) — ranks display as A1–A5 ──
  { rank: -6,  name: "Quincy Quintillion",  netWorth: 15000000000,    emoji: "💎" },
  { rank: -7,  name: "Dame Fortune IV",     netWorth: 50000000000,    emoji: "🏛️" },
  { rank: -8,  name: "The Algorithm",       netWorth: 100000000000,   emoji: "🤖" },
  { rank: -9,  name: "Sovereign",           netWorth: 250000000000,   emoji: "🌐" },
  { rank: -10, name: "THE ARCHITECT",       netWorth: 500000000000,   emoji: "🏗️" }
];

// Returns the player's current rank number on the World Rich List.
// Returns 11 if the player hasn't cracked the top 10 yet.
// Returns 0 if the player has beaten everyone (win condition!).
function getPlayerRank(netWorth) {
  // Check from top to bottom — find the highest rank the player has beaten
  let rank = 11; // unranked to start
  for (let i = 0; i < RICH_LIST.length; i++) {
    if (netWorth > RICH_LIST[i].netWorth) {
      rank = RICH_LIST[i].rank; // player has beaten this person
    }
  }

  // If player has beaten the last entry (THE ARCHITECT, $500B), they've won!
  if (netWorth > RICH_LIST[RICH_LIST.length - 1].netWorth) {
    return 0; // 0 = WIN
  }

  return rank;
}

// Returns the Rich List entry for the person just ahead of the player.
// This is the "next target" the player needs to beat.
// Returns null if the player is already #1 or has won.
function getNextTarget(netWorth) {
  // Walk the list from poorest to richest and find the first person
  // whose net worth is higher than the player's.
  for (let i = 0; i < RICH_LIST.length; i++) {
    if (netWorth <= RICH_LIST[i].netWorth) {
      return RICH_LIST[i]; // this is the next person to beat
    }
  }
  return null; // player has beaten everyone
}

// Builds and updates the Rich List panel in the center of the screen.
function renderRichList() {
  const container = document.getElementById("rich-list-display");
  if (!container) return;

  const playerNetWorth = gameState ? gameState.netWorth : 0;
  const playerRank     = getPlayerRank(playerNetWorth);

  let html = `<div class="richlist-title">🌍 World Rich List</div>`;

  // Show all NPC entries, highlighting which ones the player has beaten.
  // Update 4: Super-Tier (rank -1 to -5) display as "S1"–"S5".
  // Update 5.6.4: Apex-Tier (rank -6 to -10) display as "A1"–"A5".
  [...RICH_LIST].reverse().forEach(entry => {
    const beaten = playerNetWorth > entry.netWorth;
    const isNext = !beaten && getNextTarget(playerNetWorth) &&
                   getNextTarget(playerNetWorth).rank === entry.rank;

    const isApexTier  = entry.rank < -5;
    const isSuperTier = entry.rank < 0 && entry.rank >= -5;
    const rankLabel   = isApexTier  ? "A" + Math.abs(entry.rank + 5)
                      : isSuperTier ? "S" + Math.abs(entry.rank)
                      : "#" + entry.rank;
    const extraClass  = isApexTier  ? "apex-tier"
                      : isSuperTier ? "super-tier"
                      : "";
    const isArchitect = entry.rank === -10;

    html += `
      <div class="richlist-entry ${extraClass} ${beaten ? "beaten" : ""} ${isNext ? "next-target" : ""}">
        <span class="richlist-rank">${rankLabel}</span>
        <span class="richlist-emoji">${entry.emoji}</span>
        <span class="richlist-name ${isArchitect ? "architect-name" : ""}">${entry.name}</span>
        <span class="richlist-worth">${formatMoney(entry.netWorth)}</span>
        ${beaten ? '<span class="richlist-check">✅</span>' : ''}
        ${isNext ? '<span class="richlist-arrow">👈 YOU</span>' : ''}
      </div>
    `;
  });

  // Show the player's own entry at the bottom.
  // Handle super-tier (S1–S5) and apex-tier (A1–A5) ranks gracefully.
  const playerRankLabel = playerRank === 11 ? "??"
    : playerRank === 0  ? "👑"
    : playerRank < -5   ? "A" + Math.abs(playerRank + 5)
    : playerRank < 0    ? "S" + Math.abs(playerRank)
    : "#" + playerRank;

  html += `
    <div class="richlist-entry player-entry">
      <span class="richlist-rank">${playerRankLabel}</span>
      <span class="richlist-emoji">${gameState && gameState.playerGender === "female" ? "👩‍💼" : "🤵"}</span>
      <span class="richlist-name">${gameState ? gameState.playerName : "YOU"}</span>
      <span class="richlist-worth">${formatMoney(playerNetWorth)}</span>
    </div>
  `;

  container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// EMPIRE — richlist.js
// The NPC tycoons the player must outrank.
// Also handles calculating and displaying the player's current rank.
// UPDATE 5.9: Complete overhaul — 50 unified rivals, all positive ranks.
// No tier splits. Win condition = beat Elon Muskrat at $1 Trillion.
// ═══════════════════════════════════════════════════════════════

// The World Rich List — sorted from lowest to highest net worth.
// 50 rivals. Ranks 50 (poorest) down to 1 (richest). All real-world
// billionaire parodies scaled to actual net worth figures.
const RICH_LIST = [
  { rank: 50, name: "Barry Fencer",         netWorth: 50000,          emoji: "😤" },
  { rank: 49, name: "Chip Moneybags",        netWorth: 120000,         emoji: "🙄" },
  { rank: 48, name: "Sandra Fundsworth",     netWorth: 280000,         emoji: "😒" },
  { rank: 47, name: "Pete Cashdrop",         netWorth: 500000,         emoji: "😬" },
  { rank: 46, name: "Donna Richfield",       netWorth: 900000,         emoji: "😠" },
  { rank: 45, name: "Greg Wealthmore",       netWorth: 1500000,        emoji: "😤" },
  { rank: 44, name: "Tammy Silverstone",     netWorth: 2500000,        emoji: "😒" },
  { rank: 43, name: "Hank Profiteer",        netWorth: 4000000,        emoji: "😬" },
  { rank: 42, name: "Cynthia Goldrush",      netWorth: 6000000,        emoji: "😠" },
  { rank: 41, name: "Doug Earnsworth",       netWorth: 9000000,        emoji: "😤" },
  { rank: 40, name: "Phyllis Bankerton",     netWorth: 13000000,       emoji: "🙄" },
  { rank: 39, name: "Rupert Dividends",      netWorth: 18000000,       emoji: "😒" },
  { rank: 38, name: "Marge Capitala",        netWorth: 25000000,       emoji: "😬" },
  { rank: 37, name: "Steve Yieldman",        netWorth: 35000000,       emoji: "😠" },
  { rank: 36, name: "Connie Grossworth",     netWorth: 50000000,       emoji: "😤" },
  { rank: 35, name: "Phil Fortunado",        netWorth: 70000000,       emoji: "🙄" },
  { rank: 34, name: "Debra Interestington",  netWorth: 100000000,      emoji: "😒" },
  { rank: 33, name: "Gus Accumulsworth",     netWorth: 140000000,      emoji: "😬" },
  { rank: 32, name: "Priya Fundament",       netWorth: 200000000,      emoji: "😠" },
  { rank: 31, name: "Walt Netsworth Jr.",    netWorth: 280000000,      emoji: "😤" },
  { rank: 30, name: "Abigail Bullmarket",    netWorth: 400000000,      emoji: "😰" },
  { rank: 29, name: "Rex Assetton",          netWorth: 600000000,      emoji: "😰" },
  { rank: 28, name: "Lorraine Coupona",      netWorth: 850000000,      emoji: "😰" },
  { rank: 27, name: "Niles Banksworth",      netWorth: 1200000000,     emoji: "😰" },
  { rank: 26, name: "Harriet Liquidsworth",  netWorth: 1700000000,     emoji: "😨" },
  { rank: 25, name: "Chuck Mergely",         netWorth: 2500000000,     emoji: "😨" },
  { rank: 24, name: "Vivienne Yieldhart",    netWorth: 3500000000,     emoji: "😨" },
  { rank: 23, name: "Bern Munger",           netWorth: 5000000000,     emoji: "😨" },
  { rank: 22, name: "Francois Arno",         netWorth: 7000000000,     emoji: "😱" },
  { rank: 21, name: "Gautam Ambrosia",       netWorth: 10000000000,    emoji: "😱" },
  { rank: 20, name: "Mukesh Ambrosia",       netWorth: 14000000000,    emoji: "😱" },
  { rank: 19, name: "Steve Balmerd",         netWorth: 18000000000,    emoji: "😱" },
  { rank: 18, name: "Larry Elliswood",       netWorth: 24000000000,    emoji: "😱" },
  { rank: 17, name: "Mike Bloomingberg",     netWorth: 30000000000,    emoji: "😱" },
  { rank: 16, name: "Sergei Brine",          netWorth: 40000000000,    emoji: "😱" },
  { rank: 15, name: "Larry Pager",           netWorth: 50000000000,    emoji: "😱" },
  { rank: 14, name: "Slim Carlosito",        netWorth: 65000000000,    emoji: "😱" },
  { rank: 13, name: "Mukesh Ambrosia Sr.",   netWorth: 80000000000,    emoji: "😱" },
  { rank: 12, name: "Warren Buffet-Table",   netWorth: 100000000000,   emoji: "😱" },
  { rank: 11, name: "Bill Naire",            netWorth: 130000000000,   emoji: "😱" },
  { rank: 10, name: "Amancio Ortego",        netWorth: 160000000000,   emoji: "😰" },
  { rank:  9, name: "Jensen Hwang",          netWorth: 200000000000,   emoji: "😰" },
  { rank:  8, name: "Mark Zuckerbucks",      netWorth: 250000000000,   emoji: "😱" },
  { rank:  7, name: "Larry Elliswood Sr.",   netWorth: 300000000000,   emoji: "😱" },
  { rank:  6, name: "Larry Pager Sr.",       netWorth: 350000000000,   emoji: "😱" },
  { rank:  5, name: "Jeff Beezos",           netWorth: 400000000000,   emoji: "😱" },
  { rank:  4, name: "Bernard Arno",          netWorth: 500000000000,   emoji: "😱" },
  { rank:  3, name: "Mark Zuckerbucks Sr.",  netWorth: 600000000000,   emoji: "😱" },
  { rank:  2, name: "Jeff Beezos Sr.",       netWorth: 800000000000,   emoji: "😱" },
  { rank:  1, name: "Elon Muskrat",          netWorth: 1000000000000,  emoji: "👑" }
];

// Returns the player's current rank number on the World Rich List.
// Returns 51 if the player hasn't beaten rank 50 yet (unranked).
// Returns 0 if the player has beaten rank 1 (Elon Muskrat — win condition!).
function getPlayerRank(netWorth) {
  let rank = 51; // unranked sentinel

  for (let i = 0; i < RICH_LIST.length; i++) {
    if (netWorth > RICH_LIST[i].netWorth) {
      rank = RICH_LIST[i].rank; // player has beaten this person
    }
  }

  // If player has beaten rank 1 (Elon Muskrat, $1T), they've won!
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

  // Show all NPC entries, top to bottom (rank 1 first).
  [...RICH_LIST].reverse().forEach(entry => {
    const isConquered = gameState && gameState.legacyMode && entry.rank === 1;
    const beaten      = isConquered || playerNetWorth > entry.netWorth;
    const isNext      = !beaten && getNextTarget(playerNetWorth) &&
                        getNextTarget(playerNetWorth).rank === entry.rank;

    const rankLabel  = "#" + entry.rank;
    const extraClass = "";

    const displayName  = isConquered ? "👑 " + entry.name : entry.name;
    const displayWorth = isConquered ? "CONQUERED" : formatMoney(entry.netWorth);

    html += `
      <div class="richlist-entry ${extraClass} ${beaten ? "beaten" : ""} ${isNext ? "next-target" : ""}">
        <span class="richlist-rank">${rankLabel}</span>
        <span class="richlist-emoji">${entry.emoji}</span>
        <span class="richlist-name">${displayName}</span>
        <span class="richlist-worth">${displayWorth}</span>
        ${beaten ? '<span class="richlist-check">✅</span>' : ''}
        ${isNext ? '<span class="richlist-arrow">👈 YOU</span>' : ''}
      </div>
    `;
  });

  // Show the player's own entry at the bottom.
  const playerRankLabel = playerRank === 51 || playerRank > 50 ? "??"
    : playerRank === 0 ? "👑"
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

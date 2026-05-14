// ═══════════════════════════════════════════════════════════════
// EMPIRE — characters.js
// Defines the two playable characters and the Uncle Funds mentor.
// ═══════════════════════════════════════════════════════════════

// The two characters the player can pick at the start.
// 'pronoun' lets Uncle Funds address the player correctly in dialogue.
const CHARACTERS = {
  male: {
    id: "rich",
    name: "RICH",
    pronoun: "nephew",        // Uncle Funds calls the player "nephew"
    emoji: "🤵",
    description: "A regular dude with big dreams and an even bigger appetite for success.",
    portraitSrc: "assets/rich.png",
    portraitFallback: "🤵"   // shown if image file is missing
  },
  female: {
    id: "miss_posh",
    name: "MISS POSH",
    pronoun: "niece",         // Uncle Funds calls the player "niece"
    emoji: "👩‍💼",
    description: "Stylish, sharp, and ready to run circles around every tycoon on the list.",
    portraitSrc: "assets/miss-posh.png",
    portraitFallback: "👩‍💼"
  }
};

// Uncle Funds — the player's goofy mentor.
// He pops up throughout the game to teach, celebrate, and roast the player.
const UNCLE_FUNDS = {
  name: "Uncle Funds",
  emoji: "🤑",
  portraitSrc: "assets/uncle-funds.png",
  portraitFallback: "🤑",   // shown if image file is missing
  catchphrase: "UNCLE FUNDS IS ALWAYS RIGHT... mostly."
};


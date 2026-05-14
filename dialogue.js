// ═══════════════════════════════════════════════════════════════
// EMPIRE — dialogue.js
// All of Uncle Funds' dialogue lines and the system for
// showing them as a popup at the right moments.
//
// HOW IT WORKS:
//   • DIALOGUE_TRIGGERS is a list of triggers, each with:
//       id       — unique name used to fire the trigger
//       lines    — array of strings Uncle Funds says (shown one at a time)
//   • triggerDialogue(id) queues up a dialogue by its id
//   • The popup shows lines one at a time; player clicks "Next" to advance
//   • Once all lines are shown, the popup closes
// ═══════════════════════════════════════════════════════════════

// All of Uncle Funds' dialogue, organized by trigger event.
// {pronoun} is replaced at runtime with "nephew" or "niece".
const DIALOGUE_TRIGGERS = {

  // ── INTRO & CHARACTER SELECT ──────────────────────────────
  intro: [
    "OH HO HO! Is that my favourite {pronoun}?! Come here, come HERE!",
    "So. You've got a little cash and absolutely NO idea what to do with it. Story of your life, eh?",
    "Lucky for you, Uncle Funds is HERE. And Uncle Funds knows EVERYTHING about money. Mostly.",
    "I'm going to teach you to build an EMPIRE. Properties, stocks, businesses — the whole enchilada.",
    "Now listen close, because I only explain things once. Or twice. Sometimes three times. But that's IT.",
    "Here's your starting cash: FIVE HUNDRED DOLLARS. Don't spend it on sandwiches. Let's BUILD!"
  ],

  // ── CHAPTER 1: PROPERTIES ─────────────────────────────────
  ch1_unlock: [
    "FIRST LESSON: Real estate! You know what they say — buy land, they ain't making any more of it!",
    "...Actually I think somebody IS making more land somewhere. Anyway.",
    "Look over there on the LEFT — your Property portfolio! You can afford Funky Flats right now.",
    "Buy it. Own it. Collect that sweet sweet RENT every single second. Passive income, baby!",
    "You make money while you SLEEP. While you eat. While you do whatever it is you do. Beautiful, isn't it?"
  ],

  first_property: [
    "YES! That's it! Your FIRST property! Uncle Funds is getting emotional right now, I won't lie.",
    "Every second, that property sends money straight to your pocket. Like magic, but legal!",
    "Keep earning, keep upgrading. Three tiers: Rundown → Decent → Luxury. Go ALL the way, {pronoun}!"
  ],

  // ── CHAPTER 2: STOCKS ─────────────────────────────────────
  ch2_unlock: [
    "HEY HEY HEY! You've been hustling! Look at that cash! Are you CRYING? Because I am.",
    "Time for LESSON TWO: The Stock Market! Check the right side panel!",
    "You buy little pieces of companies called SHARES. If the price goes up, you made money!",
    "If the price goes down... well. We don't talk about that.",
    "Also — every share pays you a DIVIDEND. That's fancy talk for 'money for doing nothing.' My favourite kind.",
    "Buy low. Sell high. Simple! Even Uncle Funds figured it out and I failed basic maths twice."
  ],

  first_stock: [
    "You just bought your first stock! Uncle Funds is WEEPING with pride right now.",
    "Keep an eye on that price! When it shoots up, you SELL and pocket the difference. That's called being a GENIUS.",
    "Prices go up AND down every few seconds. The market never sleeps. Neither does Uncle Funds, but that's unrelated."
  ],

  // Fires automatically after ch2_unlock — introduces the Crypto tab (Update 5.1)
  crypto_intro: [
    "Oh! Before I forget — you see those TWO tabs on the right panel?",
    "STOCKS on the left. That's what we just talked about. Nice and boring. RELIABLE.",
    "CRYPTO on the right. That is a COMPLETELY different animal. A feral one.",
    "Crypto prices move MORE. Much more. Up to TEN TIMES the base price on a good day.",
    "On a BAD day... it can lose ninety percent of its value. While you're watching. Crying.",
    "But here's the thing, {pronoun} — the DIVIDENDS still pay out no matter what the price does.",
    "High risk. High reward. Classic Uncle Funds approved investment strategy.",
    "Click the Crypto tab. Take a peek. Just... maybe don't put EVERYTHING in there. Maybe."
  ],

  first_crypto: [
    "YOUR FIRST CRYPTO COIN! Uncle Funds is equal parts proud and terrified.",
    "Keep an eye on that price ticker. When it moons — and it WILL moon — you SELL.",
    "Or hold forever and pray. That's also a valid strategy apparently."
  ],

  // ── CHAPTER 3: BUSINESSES ─────────────────────────────────
  ch3_unlock: [
    "TEN THOUSAND DOLLARS net worth! Do you know how many sandwiches that is?! DON'T BUY SANDWICHES.",
    "LESSON THREE, {pronoun}! It's time to start your OWN business!",
    "Look at the BOTTOM panel — four incredible business opportunities waiting for you!",
    "A business is like a property, but BETTER. More income, more upgrades, more PRESTIGE.",
    "You're not just a landlord anymore. You're an ENTREPRENEUR. Say it with me. Entre-pre-NEUR.",
    "Okay you don't have to say it. Just click the buy button."
  ],

  first_business: [
    "BOOM! You are now officially a business owner! Call your mum. She'll be thrilled.",
    "That business prints money every second. Layer it on top of your properties and stocks.",
    "It all stacks, {pronoun}! Properties + Stocks + Business = EMPIRE. This is the way."
  ],

  // ── CHAPTER 4: THE MANAGER ────────────────────────────────
  ch4_unlock: [
    "Twenty-five THOUSAND dollars net worth! You are COMING FOR THEM, {pronoun}!",
    "FINAL LESSON: The Manager. Check the bottom right.",
    "This legend will click the money button FOR YOU. Automatically. While you do NOTHING.",
    "You can still click yourself — your clicks stack ON TOP of the manager's taps.",
    "The manager gets stronger the more you upgrade everything else. They're a team player.",
    "This is what wealth looks like, {pronoun}. Other people doing the work."
  ],

  hired_manager: [
    "OH. The manager is ON THE CLOCK. Listen, can you hear that? That's the sound of PASSIVE INCOME.",
    "Every tap is worth exactly what your click is worth. So upgrade EVERYTHING to make every tap fatter.",
    "You're basically a CEO now. Welcome to the club. The jacket is in the mail."
  ],

  // ── RICH LIST RANK MILESTONES ─────────────────────────────
  rank_10: [
    "RANK TEN! You cracked the top 10! Penny Pincher is absolutely fuming right now.",
    "She spent YEARS getting to $50K and you just walked right past her. Legendary. Rude. But legendary."
  ],

  rank_9: [
    "Nick L. Dime is GONE! Passed like he was standing still! Because he was standing still.",
    "Top 9, {pronoun}! The Rich List is shaking! Well. Slightly trembling. But still!"
  ],

  rank_8: [
    "Richie Poorman is having a MELTDOWN. He's rich but poorly named, and now he's poorly RANKED.",
    "Top 8! Keep going! The real money is at the top!"
  ],

  rank_7: [
    "Cashy McKashface! Defeated! That name was always suspicious, frankly.",
    "Top 7! You are now officially in the upper half of the World Rich List!"
  ],

  rank_6: [
    "DOLLY BILLIONS. DOWN. A BILLION was not enough to save her today!",
    "Top 6, {pronoun}! Bill Naire is starting to notice you. He doesn't look happy."
  ],

  rank_5: [
    "HUGH MUNGUS WEALTH is HUMBLED! Five million was not enough! Nothing is ever enough!",
    "Top FIVE! You cracked it! Bill Naire is shaking in his Italian loafers!"
  ],

  rank_4: [
    "Warren Buffet-TABLE! Knocked flat off his chair! A table! Get it?! Because his name is—",
    "Top 4! Twelve million dollars in his pocket and it still wasn't enough. More is always more, {pronoun}."
  ],

  rank_3: [
    "JEFF BEEZOS! THE DELIVERY MAN! DELIVERED... A LOSS! To himself! Ha!",
    "Third place! You are thirty million dollars closer to the top than when you started. INCREDIBLE."
  ],

  rank_2: [
    "Elon MUSKRAT! Sent to the moon! The BAD moon! The moon where you LOSE!",
    "SECOND PLACE! Seventy-five million dollars and he's BEHIND YOU.",
    "Bill Naire is all that stands between you and the crown. One final push, {pronoun}. ONE FINAL PUSH."
  ],

  // ── SUPER-TIER RANK MILESTONES (Update 4) ─────────────────
  "rank_-1": [
    "BILL NAIRE IS DETHRONED! But wait... there are people ABOVE him?!",
    "Sir Spendsalot is looking down at you, {pronoun}. LOOKING DOWN. That ends TODAY.",
    "Half a BILLION dollars to beat him. You've come so far. Don't stop now."
  ],

  "rank_-2": [
    "Goldie Vaultsworth hoards gold like a dragon hoards treasure. TAKE IT ALL.",
    "One BILLION dollars. That's ten with eight zeroes. You just passed it, {pronoun}.",
    "Uncle Funds is literally shaking right now. SHAKING."
  ],

  "rank_-3": [
    "THE YACHT LORD. The person who NAMED themselves The Yacht Lord.",
    "Two and a half BILLION. And you sailed right past them like it was nothing.",
    "Their yachts are now YOUR yachts. Metaphorically. Actually. BOTH."
  ],

  "rank_-4": [
    "Madame Trillionaire is calling her lawyers. SEVENTEEN of them.",
    "FIVE BILLION DOLLARS net worth, {pronoun}. Do you understand what you've DONE?",
    "THE MONEY GHOST awaits above you. And beyond that? The Apex Tier. The final frontier."
  ],

  // ── SUPER-TIER: THE MONEY GHOST (Update 5.6.4 — no longer the win) ──
  "rank_-5": [
    "THE MONEY GHOST. GONE. Vanished into the ether from whence it came.",
    "Ten BILLION dollars and it STILL wasn't enough to stop you.",
    "But wait... the Rich List doesn't end there. There are FIVE MORE above you.",
    "The Apex Tier, {pronoun}. The rarest titans on Earth. Welcome to their radar."
  ],

  // ── APEX-TIER RANK MILESTONES (Update 5.6.4) — display as A1–A5 ──
  "rank_-6": [
    "The Apex Tier! You're IN it, {pronoun}! Quincy Quintillion is DONE!",
    "Fifteen BILLION dollars in the rearview mirror. These rivals make the Super-Tier look like PENNY PINCHER.",
    "Four more apex titans to topple. Keep building. Keep clicking. KEEP GOING."
  ],

  "rank_-7": [
    "Dame Fortune the FOURTH! The title meant nothing! FIFTY BILLION and she's GONE!",
    "Uncle Funds is HYPERVENTILATING right now. Legally. Medically. Both.",
    "You are now the third richest entity on the PLANET. Three. More. To. Go."
  ],

  "rank_-8": [
    "THE ALGORITHM. Outsmarted. By a HUMAN. By MY {pronoun}!",
    "One hundred BILLION dollars. You are in territory most people cannot even COMPREHEND.",
    "Two apex titans remain. They have never lost. Until today. Well — almost today.",
    "THE ARCHITECT is watching you, {pronoun}. And for the first time... they look nervous."
  ],

  "rank_-9": [
    "SOVEREIGN. DETHRONED. Two hundred and fifty BILLION dollars, and it wasn't ENOUGH.",
    "Uncle Funds needs a new word. 'Rich' stopped covering it three tiers ago.",
    "ONE. TITAN. LEFT. THE ARCHITECT. Five hundred billion dollars.",
    "This is the final boss, {pronoun}. The Empire ends here — or it doesn't end at all."
  ],

  // ── WIN ────────────────────────────────────────────────────
  win: [
    "...THE ARCHITECT. FIVE HUNDRED BILLION DOLLARS. DESTROYED.",
    "You didn't build a fortune. You built the single greatest EMPIRE this world has ever seen.",
    "I taught you EVERYTHING. The properties, stocks, businesses, airlines, yachts — ALL ME.",
    "Well. You did the clicking. But I was VERY encouraging, {pronoun}.",
    "THE ARCHITECT. Five. Hundred. Billion. And you ate them for BREAKFAST.",
    "EMPIRE. The word. The myth. The legend. That's YOU now. Check your win screen!"
  ],

  // ── BILLS & TAXES (Update 5.6.4) ──────────────────────────
  first_bill: [
    "Ah, {pronoun}! A word about... expenses.",
    "Real empires have COSTS. Maintenance, operating fees, brokerage charges — the works.",
    "Your bills are deducted from your cash automatically every second. No late fees.",
    "Uncle Funds is NOT the IRS. But the bills are real. Keep that income HIGHER than your bills!"
  ],

  bills_growing: [
    "Bills going UP, {pronoun}! That's what happens when you own HALF THE WORLD.",
    "More assets = more maintenance = more bills. This is economics. Uncle Funds learned it the hard way.",
    "Keep that passive income GROWING and you'll barely notice. Probably."
  ],

  // ── CHAPTER 5: YACHT FLEET (Update 4) ────────────────────
  ch5_unlock: [
    "ONE HUNDRED MILLION DOLLARS. {pronoun}. I need to sit down. I AM SITTING DOWN.",
    "The Yacht Fleet is NOW OPEN. Look at the bottom panel. LOOK AT IT.",
    "You can buy actual YACHTS. And rent them to rich people. WHO ARE LESS RICH THAN YOU.",
    "The ocean is yours now, {pronoun}. The whole thing. Uncle Funds says so."
  ],

  first_yacht_business: [
    "FIVE HUNDRED THOUSAND DOLLARS on a yacht BUSINESS?! That's not spending. That's INVESTING.",
    "You now own a company that owns boats that rich people pay to borrow. This is the DREAM.",
    "Upgrade that business, {pronoun}. Every level unlocks BIGGER boats. BETTER money."
  ],

  first_yacht: [
    "YOU BOUGHT A YACHT. An actual YACHT. For RENTING. For PROFIT.",
    "Uncle Funds once rented a paddleboat. This is slightly more impressive.",
    "The money rolls in whether you're watching or not, {pronoun}. That's the nautical way."
  ],

  yacht_empire_maxed: [
    "FLEET OVERLORD. The title. The myth. The LEGEND. That's YOU now.",
    "Every ocean on Earth has one of your boats in it. Probably. The math works out.",
    "There is nowhere higher to climb in the yacht world, {pronoun}. You ARE the yacht world."
  ],

  // ── GENERAL TIPS (random encouragement) ───────────────────
  tip_keep_clicking: [
    "Keep clicking! Every dollar counts! Probably! The maths checks out!"
  ],

  tip_upgrade_reminder: [
    "Don't forget to UPGRADE your properties and businesses! Tier 3 is where the REAL money lives!"
  ],

  // ── UPDATE 5.1: HYPERCAR REACTION ─────────────────────────
  first_hypercar: [
    "A HYPERCAR. You just spent MILLIONS on a car that cannot legally use its top speed ANYWHERE.",
    "That is the most unhinged thing you have ever done. Uncle Funds has NEVER been more proud.",
    "The road isn't ready for you, {pronoun}. The road is not WORTHY of you."
  ]

};

// ── DIALOGUE ENGINE ────────────────────────────────────────────

// The current queue of lines to show in the popup.
let dialogueQueue       = [];
let currentDialogueLine = 0;

// Shows a dialogue by its trigger id.
// If dialogue is already showing, it queues up and plays after.
function triggerDialogue(triggerId) {
  const lines = DIALOGUE_TRIGGERS[triggerId];
  if (!lines || lines.length === 0) return;

  // Replace {pronoun} with the player's actual pronoun
  const pronoun = (gameState && gameState.playerGender === "female") ? "niece" : "nephew";
  const resolved = lines.map(line => line.replace(/\{pronoun\}/g, pronoun));

  // If nothing is showing right now, start immediately
  if (dialogueQueue.length === 0) {
    dialogueQueue       = resolved;
    currentDialogueLine = 0;
    showCurrentDialogueLine();
  } else {
    // Something is already showing — append these lines so they play next.
    // This lets the intro speech flow straight into the Chapter 1 tutorial.
    dialogueQueue = dialogueQueue.concat(resolved);
  }
}

// Shows the current line from the queue in the popup.
function showCurrentDialogueLine() {
  if (dialogueQueue.length === 0) return;

  const popup    = document.getElementById("uncle-popup");
  const textEl   = document.getElementById("uncle-dialogue-text");
  const nextBtn  = document.getElementById("uncle-next-btn");

  if (!popup || !textEl) return;

  // Update text
  textEl.textContent = dialogueQueue[currentDialogueLine];

  // Update button label depending on whether more lines remain
  const isLastLine = currentDialogueLine >= dialogueQueue.length - 1;
  nextBtn.textContent = isLastLine ? "Got it, Uncle Funds! 👍" : "Next ➡️";

  // Show the popup
  popup.style.display = "flex";
}

// Advances to the next line when the player clicks the button.
// Closes the popup when all lines have been shown.
function advanceDialogue() {
  currentDialogueLine++;

  if (currentDialogueLine >= dialogueQueue.length) {
    // All lines shown — close the popup and clear the queue
    closeDialogue();
  } else {
    // Show the next line
    showCurrentDialogueLine();
  }
}

// Closes the Uncle Funds popup.
function closeDialogue() {
  const popup = document.getElementById("uncle-popup");
  if (popup) popup.style.display = "none";
  dialogueQueue       = [];
  currentDialogueLine = 0;
}

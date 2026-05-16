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

  // ── RICH LIST RANK MILESTONES (Update 5.9) ────────────────
  // Only milestone ranks fire dialogue. Most rank changes are intentionally silent.
  rank_50: [
    "You just knocked BARRY FENCER off the list. Barry who? EXACTLY.",
    "Fifty people used to be richer than you. Now it is forty-nine.",
    "The climb begins, {pronoun}. Uncle Funds believes in you. Mostly."
  ],

  rank_40: [
    "Top 40! You are in the charts, {pronoun}! The RICH charts!",
    "Doug Earnsworth is out. He was not even that impressive honestly.",
    "Keep going. Thirty-nine more people to humiliate financially."
  ],

  rank_30: [
    "TOP THIRTY. You are in the upper third of this list.",
    "Abigail Bullmarket did not see you coming. Nobody does.",
    "The names are getting MORE impressive from here. Buckle up."
  ],

  rank_20: [
    "TOP TWENTY. These are ACTUAL billionaires you are overtaking.",
    "Mukesh Ambrosia is SHAKING. A little. He has a lot of money still.",
    "{pronoun} is no longer playing around. This is REAL wealth now."
  ],

  rank_15: [
    "Top FIFTEEN! You are in the room where it happens, {pronoun}!",
    "Larry Pager had sixty BILLION dollars. You just passed him.",
    "Uncle Funds needs to lie down. This is a LOT."
  ],

  rank_10: [
    "TOP TEN. The actual global elite. You belong here now.",
    "Amancio Ortego built a fashion empire. You built THIS.",
    "Three hundred billion net worth territory. Let that sink in."
  ],

  rank_5: [
    "TOP FIVE ON EARTH. Jeff Beezos is RIGHT THERE.",
    "Five people. On the entire PLANET. Are richer than {pronoun}.",
    "Uncle Funds is filing this moment under GREATEST OF ALL TIME."
  ],

  rank_4: [
    "Bernard Arno. Five hundred BILLION. Gone. You took it.",
    "Four left. Four people between you and the top of the world.",
    "The air is thin up here, {pronoun}. You were built for it."
  ],

  rank_3: [
    "THREE. You are the third richest person on the planet.",
    "Six hundred BILLION dollars. Uncle Funds cannot count this high.",
    "Two rivals. One throne. Elon Muskrat is watching."
  ],

  rank_2: [
    "SECOND. You are SECOND. Jeff Beezos Sr. just lost his spot.",
    "Eight hundred billion dollars. One person left.",
    "Elon Muskrat at ONE TRILLION. That is what stands between you and EVERYTHING."
  ],

  // ── WIN ────────────────────────────────────────────────────
  win: [
    "ONE. TRILLION. DOLLARS.",
    "Elon Muskrat is DETHRONED. By YOU. By {pronoun}.",
    "There is no one left. You are the richest being on Earth. Possibly in history.",
    "Uncle Funds is retired. Weeping. Proud. Mostly weeping.",
    "EMPIRE. You built one. A real one. Congratulations."
  ],

  // ── LEGACY MODE (Update 5.9) ───────────────────────────────
  legacy_mode: [
    "You chose to KEEP GOING. Uncle Funds respects this immensely.",
    "There is no one left to beat, {pronoun}. So we beat OURSELVES.",
    "How much can one person accumulate? Let us find out. TOGETHER.",
    "The scoreboard is yours now. Write whatever number you want on it."
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
  ],

  // ── UPDATE 5.8: LIFESTYLE & SILLY TRIGGERS ─────────────────
  first_lifestyle: [
    "A LIFESTYLE PURCHASE. Not an investment. Not income. Just... FUN.",
    "{pronoun} is spending money on LIVING. Uncle Funds approves FULLY.",
    "The point of being rich is THIS. Remember that."
  ],

  first_silly: [
    "I... what. WHAT did you just buy.",
    "Uncle Funds has helped build many empires. Never seen THIS.",
    "I respect it. I do not understand it. I RESPECT it."
  ],

  first_vacation: [
    "A vacation! Genius! The passive income runs while you're GONE.",
    "You are getting paid to relax, {pronoun}. This is the DREAM."
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

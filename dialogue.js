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

  // ── SUPER-TIER RANK MILESTONES (Update 5) ─────────────────
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
    "One more. Just ONE more rival stands between you and total domination. THE MONEY GHOST."
  ],

  // ── WIN ────────────────────────────────────────────────────
  win: [
    "...Is this real? Am I dreaming? PINCH ME. ...OW. Okay it's real.",
    "THE MONEY GHOST. TEN BILLION DOLLARS. GONE. Defeated by my {pronoun}!",
    "You didn't just build an empire. You became a LEGEND. A MYTH. A GHOST STORY.",
    "I taught you EVERYTHING. The properties, stocks, businesses, yachts — ALL ME.",
    "Well. You did the clicking. But I was VERY encouraging.",
    "EMPIRE. You built one. Uncle Funds has NEVER been more proud. Check your win screen!"
  ],

  // ── CHAPTER 5: YACHT FLEET (Update 5) ────────────────────
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

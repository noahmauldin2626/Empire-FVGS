// ═══════════════════════════════════════════════════════════════
// EMPIRE — manager.js
// The Manager auto-taps the money button on the player's behalf.
//
// WHAT CHANGED IN UPDATE 3:
//   • Manager is available from game start — no chapter lock
//   • Level 1 hire cost raised to $10,000 (was $5,000)
//   • Old flat $1/tap salary replaced with 5% of tap earnings
//     This means: the higher your click value, the more the
//     manager earns per tap — and the more salary costs too.
//     Net per tap is always 95% of your click value.
//   • renderManager() shows the live 5% salary in dollars
//     so the player always knows exactly what they're paying
// ═══════════════════════════════════════════════════════════════

// Manager upgrade levels.
// 'tapIntervalSeconds' — how many seconds between each auto-tap
// 'cost'               — how much it costs to hire/upgrade to this level
const MANAGER_LEVELS = [
  {
    level: 1,
    name: "Intern Irving",
    emoji: "👶",
    description: "Enthusiastic. Mostly useless. Bless his heart.",
    tapIntervalSeconds: 3,    // taps every 3 seconds
    cost: 10000               // raised from $5,000 in Update 3
  },
  {
    level: 2,
    name: "Assistant Alex",
    emoji: "🧑‍💼",
    description: "Two years of experience and one very firm handshake.",
    tapIntervalSeconds: 2,    // taps every 2 seconds
    cost: 20000
  },
  {
    level: 3,
    name: "Manager Max",
    emoji: "👔",
    description: "Has a briefcase and everything. Very intimidating.",
    tapIntervalSeconds: 1,    // taps every 1 second
    cost: 75000
  },
  {
    level: 4,
    name: "Executive Emma",
    emoji: "💎",
    description: "She runs three companies simultaneously. You're just a hobby.",
    tapIntervalSeconds: 0.5,  // taps twice per second
    cost: 200000
  }
];

// ── HIRE & UPGRADE ────────────────────────────────────────────

// Hires the manager at Level 1. Only works if no manager is hired yet.
function hireManager() {
  if (gameState.managerLevel > 0) return; // already have one

  const level1 = MANAGER_LEVELS[0];
  if (gameState.cash < level1.cost) {
    showToast("Can't afford the manager yet! 💸");
    return;
  }

  gameState.cash -= level1.cost;
  gameState.managerLevel = 1;
  gameState.managerTimerAccumulator = 0; // reset tap timer

  recalculateStats();
  saveGame();
  renderManager();
  updateUI();

  triggerDialogue("hired_manager");
}

// Upgrades the manager to the next level.
function upgradeManager() {
  const currentLevel = gameState.managerLevel;
  if (currentLevel === 0) return;                   // not hired yet
  if (currentLevel >= MANAGER_LEVELS.length) {      // already at max
    showToast("Manager is already maxed out! 💎");
    return;
  }

  // MANAGER_LEVELS is 0-indexed, so the NEXT level is at index currentLevel
  const nextLevelData = MANAGER_LEVELS[currentLevel];
  if (gameState.cash < nextLevelData.cost) {
    showToast("Not enough cash to upgrade the manager! 💸");
    return;
  }

  gameState.cash -= nextLevelData.cost;
  gameState.managerLevel = currentLevel + 1;
  gameState.managerTimerAccumulator = 0; // reset so it doesn't immediately multi-tap

  recalculateStats();
  saveGame();
  renderManager();
  updateUI();

  showToast(`Manager upgraded to ${nextLevelData.name}! ${nextLevelData.emoji}`);
}

// ── AUTO-TAP LOGIC ────────────────────────────────────────────

// Called every second by the main game loop.
// Accumulates time and fires taps when the interval is reached.
//
// SALARY FORMULA (Update 3):
//   earnedPerTap = gameState.clickValue
//   salaryPerTap = earnedPerTap × 5%
//   netPerTap    = earnedPerTap × 95%
//
// Because salary is a percentage, upgrading click value makes
// both the earnings AND the salary grow together — always 95/5 split.
//
// 'deltaSeconds' is how many seconds have passed since last call (usually 1).
function processManagerTap(deltaSeconds) {
  if (gameState.managerLevel === 0) return; // no manager hired

  const managerData = MANAGER_LEVELS[gameState.managerLevel - 1];

  // Add the elapsed time to the accumulator
  gameState.managerTimerAccumulator =
    (gameState.managerTimerAccumulator || 0) + deltaSeconds;

  // Calculate how many taps should fire in this time window
  const tapsToFire = Math.floor(
    gameState.managerTimerAccumulator / managerData.tapIntervalSeconds
  );

  if (tapsToFire <= 0) return; // not time yet

  // Remove the consumed time from the accumulator so it carries over cleanly
  gameState.managerTimerAccumulator -=
    tapsToFire * managerData.tapIntervalSeconds;

  // ── 5% salary calculation ────────────────────────────────────
  // Salary is exactly 5% of what each tap earns.
  // Net going into the player's pocket is the remaining 95%.
  const earnedPerTap = gameState.clickValue;
  const salaryPerTap = earnedPerTap * 0.05;
  const netPerTap    = earnedPerTap - salaryPerTap; // = clickValue × 0.95

  // Apply earnings and track salary paid
  const totalNet    = netPerTap    * tapsToFire;
  const totalSalary = salaryPerTap * tapsToFire;

  gameState.cash                   += totalNet;
  gameState.totalEarned            += totalNet;
  gameState.totalManagerSalaryPaid  =
    (gameState.totalManagerSalaryPaid || 0) + totalSalary;

  // ── Show animation ───────────────────────────────────────────
  // Show the net-per-tap value (after salary) so it reflects what
  // the player actually received in their pocket.
  showManagerTapAnimation(netPerTap);
}

// Shows a small animated "+$X" near the money button to show manager activity.
function showManagerTapAnimation(amount) {
  const btn = document.getElementById("money-btn");
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  // Offset to the side so it doesn't overlap the player's own click floats
  showFloatingMoney(amount, rect.right - 20, rect.top + rect.height / 2, "manager-float");
}

// ── RENDERING ─────────────────────────────────────────────────

// Builds the Manager section HTML.
// Shows hire button (if not hired), or current manager info + upgrade button.
// The salary display shows the live dollar amount based on current click value.
function renderManager() {
  const container = document.getElementById("manager-status");
  if (!container) return;

  const currentLevel  = gameState.managerLevel;
  const isHired       = currentLevel > 0;
  const currentData   = isHired ? MANAGER_LEVELS[currentLevel - 1] : null;
  const isMaxLevel    = isHired && currentLevel >= MANAGER_LEVELS.length;
  const nextLevelData = isHired && !isMaxLevel ? MANAGER_LEVELS[currentLevel] : null;

  // Calculate current salary in dollars for display.
  // With 5% salary: net per tap is always 95% of click value.
  const salaryPerTap = gameState.clickValue * 0.05;
  const netPerTap    = gameState.clickValue * 0.95;

  if (!isHired) {
    // ── Not hired yet: show hire button ─────────────────────
    const level1    = MANAGER_LEVELS[0];
    const canAfford = gameState.cash >= level1.cost;

    container.innerHTML = `
      <div class="manager-intro">
        <div class="manager-emoji">🤖</div>
        <p>Hire a manager to click for you automatically while you sit back and look rich.</p>
        <p class="manager-salary-note">
          💼 Salary: 5% of tap earnings — upgrade your click value
          and the manager earns (and costs) more proportionally!
        </p>
        <button class="btn ${canAfford ? 'btn-buy' : 'btn-locked'}"
                onclick="hireManager()"
                ${canAfford ? '' : 'disabled'}>
          👔 Hire ${level1.name} — ${formatMoney(level1.cost)}
        </button>
      </div>
    `;
  } else {
    // ── Hired: show current manager + upgrade option ─────────
    container.innerHTML = `
      <div class="manager-active">
        <div class="manager-portrait">${currentData.emoji}</div>
        <div class="manager-info">
          <strong>${currentData.name}</strong>
          <span class="tier-badge tier-${currentData.level}">${currentData.description}</span>
          <span class="manager-speed">
            ⚡ Every ${currentData.tapIntervalSeconds}s
            · Earns ${formatMoney(gameState.clickValue)}/tap
          </span>
          <span class="manager-salary">
            💼 Salary: 5% per tap
            (currently ${formatMoney(salaryPerTap)}/tap)
            · Net: <span class="salary-positive">+${formatMoney(netPerTap)}</span>/tap
          </span>
        </div>
      </div>
      ${isMaxLevel
        ? `<button class="btn btn-maxed" disabled>✨ MAX MANAGER!</button>`
        : `<button class="btn ${gameState.cash >= nextLevelData.cost ? 'btn-upgrade' : 'btn-locked'}"
                   onclick="upgradeManager()"
                   ${gameState.cash >= nextLevelData.cost ? '' : 'disabled'}>
             ⬆️ Upgrade → ${nextLevelData.name} — ${formatMoney(nextLevelData.cost)}
           </button>`
      }
    `;
  }
}

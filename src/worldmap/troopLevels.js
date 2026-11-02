/**
 * troopLevels — in-memory per-roster-key troop level, backing
 * `TroopDetailScreen`'s own UPGRADE button (the player's own explicit
 * ask: "the actual button... where players can actually click it to
 * increase selected troop level"). No save system exists anywhere in this
 * codebase yet (see ARCHITECTURE.md) — this resets on page reload, the
 * same honesty scope `levelPlaceholder` already had before it. The real
 * `UnitStats` rows stay untouched; `TroopStatsList` reads the level back
 * and applies `StarTiers.levelMultiplier()` — the SAME formula the real
 * level-growth model already defines — only to its own displayed values.
 */
const levels = new Map();

/** @param {string} key roster key @returns {number} current level, 1 if never upgraded */
export function troopLevel(key) { return levels.get(key) ?? 1; }

/**
 * @param {string} key roster key @param {number} cap the highest level allowed
 * @returns {number} the level after upgrading (unchanged if already at `cap`)
 */
export function upgradeTroop(key, cap) {
  const next = Math.min(cap, troopLevel(key) + 1);
  levels.set(key, next);
  return next;
}

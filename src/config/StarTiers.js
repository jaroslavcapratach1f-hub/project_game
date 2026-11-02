/**
 * StarTiers — rarity multiplier applied to a unit's BASE stats, the display
 * ladder, and the troop level-growth model.
 *
 * LADDER (matches GDD 08 + GDD 10 kill-stat names):
 *   3      scrap / disassembly fodder, never levelled
 *   4      -> 4.5 (4★+) -> 5 -> 5.5 (5★+)          Silver Route (Assembly)
 *   6      Gold I -> 6.5 Gold I+ -> 7 Gold II -> 7.5 Gold II+ -> 8 Gold II++
 *   8.5..10  FUTURE gold tiers, provisional multipliers, no recipe yet
 *
 * DRAFT: multiplier values are proposals. REVIEW.
 */

/** Multiplier vs the 4-star baseline (UnitStats rows are 4-star, level 1). */
export const STAR_MULTIPLIER = {
  '3': 0.7,
  '4': 1.0,
  '4.5': 1.18,
  '5': 1.4,
  '5.5': 1.65,
  '6': 1.95,   // Gold Route begins
  '6.5': 2.25,
  '7': 2.6,
  '7.5': 3.0,
  '8': 3.45,
  '8.5': 3.95, // FUTURE
  '9': 4.5,    // FUTURE
  '9.5': 5.1,  // FUTURE
  '10': 5.8,   // FUTURE
};

/** Human labels for UI and profile kill stats. */
export const STAR_LABELS = {
  '3': '3★', '4': '4★', '4.5': '4★+', '5': '5★', '5.5': '5★+',
  '6': 'Gold I', '6.5': 'Gold I+', '7': 'Gold II', '7.5': 'Gold II+', '8': 'Gold II++',
  '8.5': 'Gold III', '9': 'Gold III+', '9.5': 'Gold IV', '10': 'Gold IV+',
};

export const STAR_ORDER = ['3', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];
export const FUTURE_TIERS = new Set(['8.5', '9', '9.5', '10']);

/** GDD 10 profile ledger buckets -> ladder key. */
export const KILL_TIER_KEYS = {
  '4star': '4', '4starPlus': '4.5', '5star': '5', '5starPlus': '5.5',
  '1gold': '6', '1goldPlus': '6.5', '2gold': '7', '2goldPlus': '7.5', '2goldPlusPlus': '8',
};

/**
 * Troop levelling. Levels run 1..hardCap. The PLAYABLE cap is set by
 * headquarters level and raised by Military research (see playableLevelCap).
 * Ammunition is required from `ammoFromLevel`; upgrades gate every `band`.
 */
export const LEVEL = {
  hardCap: 200,
  band: 10,
  ammoFromLevel: 11,
  perLevelStatGain: 0.009, // linear on base: ~x2.79 at L200. REVIEW.
  boostedStats: ['hp', 'dmg', 'def', 'armor', 'pen'], // rof/rng/spd/acc/dodge do NOT scale
  hqContribPerLevel: 5,    // playable cap contribution: 5 * hqLevel
  researchCapBonusMax: 25, // Military research adds up to +25 playable levels
};

/**
 * @param {number} hqLevel
 * @param {number} researchBonus  playable-cap levels granted by Military research
 * @returns {number} the highest level a troop can currently be pushed to
 */
export function playableLevelCap(hqLevel, researchBonus = 0) {
  const fromHq = Math.max(0, hqLevel) * LEVEL.hqContribPerLevel;
  const bonus = Math.min(LEVEL.researchCapBonusMax, Math.max(0, researchBonus));
  return Math.min(LEVEL.hardCap, fromHq + bonus);
}

/**
 * Multiplier applied to LEVEL.boostedStats for a troop level.
 * @param {number} level 1..LEVEL.hardCap
 * @returns {number}
 */
export function levelMultiplier(level) {
  const clamped = Math.max(1, Math.min(LEVEL.hardCap, level));
  return 1 + LEVEL.perLevelStatGain * (clamped - 1);
}

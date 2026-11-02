/**
 * StatResolution — the ONE place that defines how a troop's final combat
 * stats are computed from its many modifier layers.
 *
 * DRAFT: the ORDER OF OPERATIONS below is a proposal. Confirm it before any
 * combat code depends on it — changing it later rebalances the whole game.
 *
 * ORDER:
 *   final = base
 *     x STAR_MULTIPLIER[tier]
 *     x levelMultiplier(level)            (only for LEVEL.boostedStats:
 *                                          hp, dmg, def, armor, pen)
 *     x (1 + research + nation + officer + modify + equipmentPct)
 *                                          <- ONE additive bucket, each layer
 *                                             clamped to its BONUS_CAPS entry
 *     + equipmentFlat[statKey]             <- flat part adds, after the bucket
 *   then, in combat (NOT here): x officer active-skill buffs x unit Fury bonus,
 *   so those always feel impactful regardless of gear.
 *
 * armor is an array [front, side, rear]; call resolveStat once per facing with
 * statKey 'armor'. rof / rng / spd / acc / dodge are FLAT (no level scaling).
 */

import { STAR_MULTIPLIER, levelMultiplier, LEVEL } from './StarTiers.js';

/** Caps on each bonus layer, as fractions. REVIEW. */
export const BONUS_CAPS = {
  // The Military + Doctrine research trees stack many small nodes.
  research: { dmg: 0.5, def: 0.5, armor: 0.5, hp: 0.5, pen: 0.35, spd: 0.2, rof: 0.2, rng: 0.15, acc: 0.15 },
  nation: 0.24,        // GDD 10, reached at 5 same-nation barracks
  officerTotal: 0.6,   // primary + secondary + duo, hard ceiling
  modify: 0.25,        // Parts Workshop "Modify" flat-percent adds
  equipmentPct: { dmg: 0.45, def: 0.45, armor: 0.4, hp: 0.4, pen: 0.3, rof: 0.25, rng: 0.2, spd: 0.2, acc: 0.2, dodge: 0.2 },
};

/**
 * Resolve a single stat for a troop.
 * @param {number} base   unit base value (4-star, level 1) from UnitStats
 * @param {string} statKey 'hp'|'dmg'|'def'|'armor'|'pen'|'rof'|'rng'|'spd'|'acc'|'dodge'
 * @param {object} ctx    { tier, level, research:{}, nation, officer, modify,
 *                          equipmentPct:{}, equipmentFlat:{} }
 * @returns {number}
 */
export function resolveStat(base, statKey, ctx) {
  const star = STAR_MULTIPLIER[ctx.tier] ?? 1;
  const lvl = LEVEL.boostedStats.includes(statKey)
    ? levelMultiplier(ctx.level ?? 1)
    : 1;
  const research = clamp(ctx.research?.[statKey] ?? 0, BONUS_CAPS.research[statKey]);
  const nation = clamp(ctx.nation ?? 0, BONUS_CAPS.nation);
  const officer = clamp(ctx.officer ?? 0, BONUS_CAPS.officerTotal);
  const modify = clamp(ctx.modify ?? 0, BONUS_CAPS.modify);
  const equipPct = clamp(ctx.equipmentPct?.[statKey] ?? 0, BONUS_CAPS.equipmentPct[statKey]);
  const equipFlat = ctx.equipmentFlat?.[statKey] ?? 0;
  return base * star * lvl * (1 + research + nation + officer + modify + equipPct) + equipFlat;
}

/**
 * @param {number} value
 * @param {number} [max]  undefined -> no cap
 * @returns {number}
 */
function clamp(value, max) {
  if (max === undefined || max === null) return value;
  return value < max ? value : max;
}

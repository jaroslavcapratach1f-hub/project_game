/**
 * ProgressionConfig — troop level-band cost curve, the Assembly star-up
 * recipes, the Nation Bonus table (Camp Prestige), and disassembly yields.
 *
 * Levels 1..200; playable cap set in StarTiers.playableLevelCap. Arms EXP is
 * spent every band; Ammunition additionally from band 2 (level 11) onward.
 * DRAFT: every curve is a placeholder. REVIEW.
 */

import { LEVEL } from './StarTiers.js';

export const UPGRADE_BANDS = LEVEL.hardCap / LEVEL.band; // 20 bands of 10

export const BAND_GROWTH = { armsExp: 1.42, ammunition: 1.45, money: 1.5, seconds: 1.42 };

/**
 * Resources to take a troop from (band-1)*10 up to band*10.
 * @param {number} band 1..UPGRADE_BANDS
 * @returns {{ armsExp:number, ammunition:number, money:number, seconds:number }}
 */
export function bandCost(band) {
  const b = Math.max(1, Math.min(UPGRADE_BANDS, band));
  return {
    armsExp: Math.round(400 * Math.pow(BAND_GROWTH.armsExp, b - 1)),      // 400 .. ~312k
    ammunition: b < 2 ? 0 : Math.round(30 * Math.pow(BAND_GROWTH.ammunition, b - 2)),
    money: Math.round(200 * Math.pow(BAND_GROWTH.money, b - 1)),
    seconds: Math.round(120 * Math.pow(BAND_GROWTH.seconds, b - 1)),      // 2 min .. ~26 h
  };
}

/**
 * Assembly star-up recipes. `mode`:
 *   'exact'   -> consume `copies` EXACT copies of this unit
 *   'faction' -> consume `copies` units of the SAME FACTION (any type)
 * `route`: silver = 4 -> 5.5, gold = 6 -> 8 (8.5+ are future, no recipe live).
 */
export const ASSEMBLY = {
  '4->4.5':  { copies: 1, mode: 'exact',   route: 'silver' },
  '4.5->5':  { copies: 2, mode: 'faction', route: 'silver' },
  '5->5.5':  { copies: 2, mode: 'exact',   route: 'silver' },
  '5.5->6':  { copies: 3, mode: 'faction', route: 'silver' },
  '6->6.5':  { copies: 2, mode: 'exact',   route: 'gold' },
  '6.5->7':  { copies: 3, mode: 'faction', route: 'gold' },
  '7->7.5':  { copies: 3, mode: 'exact',   route: 'gold' },
  '7.5->8':  { copies: 4, mode: 'faction', route: 'gold' },
  '8->8.5':  { copies: 4, mode: 'exact',   route: 'gold', future: true },
  '8.5->9':  { copies: 5, mode: 'faction', route: 'gold', future: true },
  '9->9.5':  { copies: 5, mode: 'exact',   route: 'gold', future: true },
  '9.5->10': { copies: 6, mode: 'faction', route: 'gold', future: true },
};

/** Resource + time cost of running one Assembly step (on top of the copies). */
export const ASSEMBLY_STEP_COST = {
  silver: { money: 3000, troopParts: 40, specialItems: 0, seconds: 1800 },
  gold:   { money: 12000, troopParts: 120, specialItems: 6, seconds: 7200 },
};

/**
 * Nation Bonus (Camp Prestige, GDD 10). Same-nation Military Barracks count
 * -> additive fraction applied to that nation's troops only.
 */
export const NATION_BONUS = [
  { barracks: 1, bonus: 0.0,  name: 'None' },
  { barracks: 2, bonus: 0.03, name: 'Cooperation' },
  { barracks: 3, bonus: 0.07, name: 'Battalion' },
  { barracks: 4, bonus: 0.12, name: 'Division' },
  { barracks: 5, bonus: 0.24, name: 'Full Army Corps' },
];

/** @param {number} sameNationBarracks 0..5 @returns {number} fraction */
export function nationBonus(sameNationBarracks) {
  const row = NATION_BONUS[Math.max(0, Math.min(NATION_BONUS.length, sameNationBarracks)) - 1];
  return row ? row.bonus : 0;
}

/** Disassembly yield by star (GDD 04: 3-star best, higher = diminishing). */
export const DISASSEMBLE_YIELD = {
  '3': { component: 100, seconds: 300 },
  '4': { component: 60, seconds: 900 },
  '4.5': { component: 45, seconds: 1500 },
  '5': { component: 30, seconds: 2700 },
  '5.5': { component: 22, seconds: 3600 },
  '6': { component: 16, seconds: 5400 },
};

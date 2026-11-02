/**
 * ResourceBuildingCurve — the ONE real per-level production + power curve
 * shared by all 3 resource buildings (Treasury/money, Crude Oil/oil,
 * Steelworks/steel — the player's own explicit rule: identical numbers,
 * only the resource differs), levels 1-36. Bypasses the generic `'pow'`/
 * `geoSeries` formulas `BuildingConfig.buildingEffect`/`PowerConfig.
 * buildingPower` use for every other building — those are still fine
 * placeholders for buildings not yet designed (the player's own words:
 * "other buildings... we will build one by one"), but these 3 now have
 * real, player-authored numbers instead of a formula guess.
 *
 * `CURVE[level-1]` for levels 1-32 is the player's own exact reference
 * table (hand-tuned, not a single closed-form formula — verified: the
 * production column IS a clean quadratic for L1-9, `30*(L+1)*(L+2)`, then
 * shifts to rounded, progressively-accelerating hand-tuned values from
 * L10 on; power accelerates even harder late, consistent with a
 * deliberate "endgame" curve). Levels 33-35 are Claude's own extrapolation
 * of that same accelerating trend (the player's explicit instruction: "if
 * these numbers look random... slightly change the numbers as they do not
 * have to be exactly as in this example" — flag for the player's review,
 * not guaranteed to match their own spreadsheet if one exists for these 3
 * levels). Level 36 = exactly 2x level 35 (the player's own explicit
 * rule — the final, unique-design tier).
 */

export const RESOURCE_BUILDING_IDS = new Set(['treasury', 'crude_oil', 'steelworks']);

/** @type {{production:number, power:number}[]} index 0 = level 1 */
export const CURVE = [
  { production: 180, power: 5 },
  { production: 360, power: 15 },
  { production: 600, power: 30 },
  { production: 900, power: 55 },
  { production: 1260, power: 95 },
  { production: 1680, power: 170 },
  { production: 2160, power: 320 },
  { production: 2700, power: 515 },
  { production: 3300, power: 765 },
  { production: 4000, power: 1065 },
  { production: 4750, power: 1420 },
  { production: 5500, power: 1825 },
  { production: 6250, power: 2335 },
  { production: 7000, power: 3120 },
  { production: 8500, power: 4200 },
  { production: 10000, power: 5540 },
  { production: 11500, power: 7145 },
  { production: 13000, power: 9095 },
  { production: 14500, power: 11320 },
  { production: 16500, power: 13820 },
  { production: 18500, power: 16600 },
  { production: 20500, power: 19640 },
  { production: 23000, power: 23090 },
  { production: 25500, power: 29320 },
  { production: 28000, power: 38320 },
  { production: 31000, power: 49950 },
  { production: 34000, power: 74320 },
  { production: 38000, power: 109480 },
  { production: 43000, power: 167370 },
  { production: 50000, power: 226340 },
  { production: 60000, power: 286530 },
  { production: 75000, power: 347460 }, // L32 — the player's own reference table ends here
  { production: 100000, power: 410000 }, // L33 — Claude extrapolation, REVIEW
  { production: 135000, power: 470000 }, // L34 — Claude extrapolation, REVIEW
  { production: 190000, power: 530000 }, // L35 — Claude extrapolation, REVIEW
  { production: 380000, power: 1060000 }, // L36 — exactly 2x L35 (player's own rule)
];

/** @param {number} level @returns {number} production/hour at this level, clamped into range */
export function resourceProductionAt(level) {
  return CURVE[clampIdx(level)].production;
}

/** @param {number} level @returns {number} Power at this level, clamped into range */
export function resourcePowerAt(level) {
  return CURVE[clampIdx(level)].power;
}

/** @private @param {number} level @returns {number} */
function clampIdx(level) {
  return Math.max(0, Math.min(CURVE.length - 1, Math.round(level) - 1));
}

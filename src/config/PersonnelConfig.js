/**
 * PersonnelConfig — reserve pool capacity and recovery by Reserves Barracks
 * level (1..35), personnel cost per map entity, and squad-size rules.
 *
 * CAPACITY and RECOVERY are the GDD 06 curves, extended to level 35. The
 * RECOVERY UNIT is a REVIEW item: GDD says "in percentage" without a base or
 * period. Assumed here = percent of CAPACITY restored per DAY.
 */

/** Reserves Barracks L1..L35 -> max personnel pool. */
export const CAPACITY = [
  300, 400, 500, 600, 700, 800, 900, 1000, 1150, 1300, 1450, 1600, 1750,
  1900, 2050, 2200, 2350, 2500, 2700, 2900, 3100, 3300, 3500, 3700, 3900,
  4100, 4300, 4500, 4700, 4900, 5100, 5300, 5500, 5700, 5900,
];

/** Reserves Barracks L1..L35 -> recovery figure (percent of cap per day). */
export const RECOVERY_PCT_PER_DAY = [
  0, 50, 100, 150, 200, 250, 300, 350, 400, 425, 450, 475, 500, 525, 550,
  575, 600, 625, 650, 675, 700, 715, 730, 745, 760, 775, 790, 805, 820,
  835, 850, 875, 900, 925, 950,
];

export const REGEN_TICK_SECONDS = 60;

/**
 * Personnel restored per regen tick at a given Reserves Barracks level.
 * @param {number} level 1..35
 * @returns {number}
 */
export function regenPerTick(level) {
  const i = Math.max(1, Math.min(CAPACITY.length, level)) - 1;
  const perDay = CAPACITY[i] * (RECOVERY_PCT_PER_DAY[i] / 100);
  return (perDay / 86400) * REGEN_TICK_SECONDS;
}

/**
 * Personnel spent per single map entity. Keyed by UnitStats `cls`.
 * Squad size on deploy = floor(personnelAssigned / cost). Keep in sync with
 * UnitStats `cost`.
 */
export const ENTITY_COST = {
  infantry: 2,
  lightTank: 3,
  mediumTank: 4,
  tankHunter: 5,
  howitzer: 5,
  launcher: 6,
  atGun: 4,
  heavyTank: 7,
  superHeavyTank: 12,
  gatherTruck: 0,
};

/**
 * SQUAD RENDERING CONTRACT
 * Every number squadSize() returns is a REAL unit on the map: its own sprite,
 * position, facing, HP bar and target. There is no abstract stack and no
 * on-screen count standing in for hidden units — invest more personnel, see
 * more individual vehicles/soldiers drive out (GDD 06).
 *
 * SQUAD_BASE_CAP is the starting ceiling per class. Barracks level and the
 * Military "Rally" research raise it toward SQUAD_HARD_CEILING (a performance
 * bound, not a design one). Below the cap, squad size is purely personnel/cost.
 */
export const SQUAD_BASE_CAP = {
  infantry: 10,
  lightTank: 6,
  mediumTank: 6,
  tankHunter: 6,
  howitzer: 4,
  launcher: 4,
  atGun: 4,
  heavyTank: 5,
  superHeavyTank: 3,
  gatherTruck: 1,
};

export const SQUAD_HARD_CEILING = {
  infantry: 20,
  lightTank: 12,
  mediumTank: 12,
  tankHunter: 12,
  howitzer: 8,
  launcher: 8,
  atGun: 8,
  heavyTank: 10,
  superHeavyTank: 6,
  gatherTruck: 1,
};

/**
 * @param {number} personnelAssigned
 * @param {string} cls  UnitStats class key
 * @param {number} capBonus  extra slots from Barracks level + Rally research
 * @returns {number} individually rendered entities that deploy (>= 1)
 */
export function squadSize(personnelAssigned, cls, capBonus = 0) {
  const cost = ENTITY_COST[cls] ?? 1;
  if (cost === 0) return 1;
  const ceiling = SQUAD_HARD_CEILING[cls] ?? 1;
  const cap = Math.min(ceiling, (SQUAD_BASE_CAP[cls] ?? 1) + Math.max(0, capBonus));
  return Math.max(1, Math.min(cap, Math.floor(personnelAssigned / cost)));
}

/** GDD 06 lifecycle: destroyed = personnel deducted (not returned), pool
 *  regens; voluntary dismantle outside combat = personnel returned. */
export const RETURN_ON_DISMANTLE = true;
export const RETURN_ON_DESTROY = false;

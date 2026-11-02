/**
 * BuildingLevelOverrides — exact, player-confirmed per-level upgrade data
 * (resource cost, construction materials, Build Points, and any extra
 * prerequisite) that REPLACES BuildingConfig's generic placeholder formula
 * for the specific building+level pairs the player has supplied real
 * reference numbers for. Every level NOT listed here still falls back to
 * the existing formula (`BuildingConfig.upgradeCost`) exactly as before —
 * this table is additive, never a blanket redesign.
 *
 * Master-task anti-fabrication rule: a level missing here is unconfigured,
 * not guessed. This file grows as the player supplies more screenshots;
 * nothing else needs to change shape when it does.
 *
 * `requiresHqLevel`: a confirmed headquarters-level prerequisite for this
 * specific upgrade/construction (Watchtower L1->2 and Steelworks L3->4 both
 * show "Upgrade Command Center to Lv5 first"; Engineering Center's own
 * construction needs Lv4) — checked generically by buildingUpgrade.js /
 * BaseManager.place(), never special-cased per building.
 *
 * `capacityDelta`: only barracks carries this — ArmyMenuConfig.reserveCapacity
 * reads it directly (that system has no generic "effects" table of its own).
 *
 * An entry may confirm Build Points ALONE, with no `resourceCost`/
 * `materialCost` at all (Treasury: the player gave exact construction/
 * upgrade Build-Point numbers but no cost figures) — `upgradeCost()` checks
 * for `resourceCost` specifically and falls back to the formula for cost
 * when it's absent, so an under-specified entry never accidentally makes an
 * upgrade free.
 *
 * `baseHpDelta`: only `defence_wall` carries this — the player's own rule
 * is that Wall level IS the game's single whole-base HP pool (BaseHealth,
 * onslaught runs), not a separate per-building stat. `baseHpAt()` below
 * sums it onto the configured floor HP the same way Build Points sum.
 */

/** @typedef {{buildPoints:number, resourceCost?:Object<string,number>, materialCost?:Object<string,number>, requiresHqLevel?:number, capacityDelta?:number, baseHpDelta?:number}} LevelOverride */

/** @type {Object<string, Object<number, LevelOverride>>} building id -> level reached -> confirmed data */
export const BUILDING_LEVEL_OVERRIDES = {
  // Steelworks stat/power curve is already exact in ResourceBuildingCurve.js
  // (verified: its L1-4 deltas are 180/240/300 /hr and 10/15/25 power — a
  // precise match to the confirmed values below) — only cost + materials +
  // Build Points were missing, so that's all this table adds for it.
  steelworks: {
    2: { buildPoints: 15, resourceCost: { money: 1350, steel: 1620, oil: 1080 }, materialCost: { woodPlanks: 1 } },
    3: { buildPoints: 20, resourceCost: { money: 2020, steel: 2430, oil: 1620 }, materialCost: { woodPlanks: 2 } },
    4: { buildPoints: 30, resourceCost: { money: 2700, steel: 3240, oil: 2160 }, materialCost: { woodPlanks: 2, bricks: 1 }, requiresHqLevel: 5 },
  },
  // Confirmed from "No.2 Barracks" reference screenshots; applied to the
  // single shared `barracks` BUILDINGS entry since all 5 barracks slots in
  // this codebase already use one economy table, not 5 independent ones.
  barracks: {
    2: { buildPoints: 30, resourceCost: { money: 5400, steel: 6480, oil: 4320 }, materialCost: { woodPlanks: 2 }, capacityDelta: 3 },
    3: { buildPoints: 50, resourceCost: { money: 8100, steel: 9720, oil: 6480 }, materialCost: { woodPlanks: 2, bricks: 1 }, capacityDelta: 3 },
    // Lv4 unlocks a new Officer Slot per the reference — NOT implemented
    // yet (no officer roster exists anywhere in this codebase either).
  },
  defence_wall: {
    3: { buildPoints: 45, resourceCost: { money: 4050, steel: 4860, oil: 3240 }, materialCost: { woodPlanks: 2 }, baseHpDelta: 35000 },
  },
  attack_towers: {
    2: { buildPoints: 15, resourceCost: { money: 1350, steel: 1620, oil: 1080 }, materialCost: { woodPlanks: 3 }, requiresHqLevel: 5 },
  },
  // Construction only (level 1) — the player's reference shows it becoming
  // placeable once the Command Center reaches Lv4. No confirmed resource
  // cost for building it exists yet (TODO_UNCONFIRMED): BaseManager.place()
  // charges nothing for ANY building today, so leaving this empty changes
  // nothing about that — only the Build Points + prerequisite are real here.
  engineering: {
    1: { buildPoints: 15, requiresHqLevel: 4 },
  },
  // Confirmed directly by the player: BUILD (construction, reaching level
  // 1) awards +5; the Lv1->Lv2 UPGRADE awards +15. No cost figures exist
  // for Treasury yet, so cost stays on the existing formula (see the
  // `resourceCost`-absent note above) — only the Build Points are real.
  treasury: {
    1: { buildPoints: 5 },
    2: { buildPoints: 15 },
  },
};

/**
 * @param {string} id BuildingConfig key @param {number} level the level being reached
 * @returns {?LevelOverride} the confirmed override entry, or null if unconfigured
 */
export function levelOverride(id, level) {
  return BUILDING_LEVEL_OVERRIDES[id]?.[level] ?? null;
}

/**
 * Build Points one building INSTANCE has earned so far — the sum of every
 * confirmed `buildPoints` entry from level 1 up to its current level.
 * Unconfigured levels contribute 0 (never fabricated), so this is always a
 * true floor, never an invented number.
 * @param {string} id @param {number} currentLevel
 * @returns {number}
 */
export function buildPointsThroughLevel(id, currentLevel) {
  let sum = 0;
  for (let lvl = 1; lvl <= currentLevel; lvl++) sum += levelOverride(id, lvl)?.buildPoints ?? 0;
  return sum;
}

/**
 * Every confirmed Build Point earned across the whole base — a PURE
 * derivation off live building state, never a separately-stored counter.
 * This is what makes "never award Build Points twice" and "survives
 * save/load" true for free: there is no ledger to desync or double-credit.
 * @param {{id:string,level:number}[]} buildings BaseManager.buildings
 * @returns {number}
 */
export function totalBuildPoints(buildings) {
  let sum = 0;
  for (const b of buildings) sum += buildPointsThroughLevel(b.id, b.level);
  return sum;
}

/**
 * @param {string} id @param {number} level the level being reached
 * @returns {number} headquarters level required first, or 0 if none configured
 */
export function requiredHqLevel(id, level) {
  return levelOverride(id, level)?.requiresHqLevel ?? 0;
}

/**
 * The whole-base HP pool (BaseHealth, onslaught runs) at a given Wall
 * level — `floorHp` is the level-1 floor (ONSLAUGHT.baseHp.max); every
 * confirmed `baseHpDelta` from level 2 up adds on top. Unconfigured levels
 * add nothing (never fabricated), so the pool stays flat until more wall
 * levels are confirmed.
 * @param {number} floorHp @param {number} wallLevel
 * @returns {number}
 */
export function baseHpAt(floorHp, wallLevel) {
  let hp = floorHp;
  for (let l = 2; l <= wallLevel; l++) hp += levelOverride('defence_wall', l)?.baseHpDelta ?? 0;
  return hp;
}

/**
 * PowerConfig — "Power" is the single public number that ranks players on the
 * world map. It only ever grows with investment and is the SUM of every
 * source below. Used for the profile score, leaderboard, and target-picking.
 *
 * Every upgrade path must feed exactly one of these functions so the total
 * moves whenever the player progresses. DRAFT: all weights are proposals.
 * REVIEW — tune so a fresh account reads ~1-2k and a maxed one reads millions.
 */
import { RESOURCE_BUILDING_IDS, resourcePowerAt } from './ResourceBuildingCurve.js';

/** Shortcut: sum a geometric series base * g^0 .. g^(n-1). */
function geoSeries(base, g, n) {
  if (n <= 0) return 0;
  if (g === 1) return base * n;
  return base * (Math.pow(g, n) - 1) / (g - 1);
}

// --- Buildings -------------------------------------------------------------
export const BUILDING_POWER = {
  perLevel: 60,
  growth: 1.16,
  categoryMult: {
    core: 2.0, military: 1.4, defense: 1.3, workshop: 1.05,
    strategic: 1.1, acquisition: 1.0, economy: 1.0, support: 1.0,
  },
};

/**
 * @param {string} category  BUILDINGS[id].category
 * @param {number} level      current building level
 * @returns {number}
 */
export function buildingPower(category, level) {
  const m = BUILDING_POWER.categoryMult[category] ?? 1;
  return Math.round(geoSeries(BUILDING_POWER.perLevel, BUILDING_POWER.growth, Math.max(0, level)) * m);
}

/**
 * Power for ONE building, by id — the 3 resource buildings (Treasury/Crude
 * Oil/Steelworks) read their real player-authored curve
 * (`ResourceBuildingCurve.js`), every other building still uses the generic
 * `buildingPower` formula above (a placeholder until that building gets its
 * own real design — the player's own words: "we will build one by one").
 * @param {string} id BUILDINGS key @param {string} category @param {number} level
 * @returns {number}
 */
export function buildingPowerFor(id, category, level) {
  return RESOURCE_BUILDING_IDS.has(id) ? resourcePowerAt(level) : buildingPower(category, level);
}

/**
 * TotalBuildingPower = SUM(power of current level of every active building) —
 * the source feeding TopBar's PWR field and (once those exist) the overall
 * `totalPower()` roll-up below. Takes `BaseManager.buildings` directly
 * (`{id, level, isActive}`) + a `category` lookup so this file stays free of
 * a BuildingConfig.js import — callers already have both.
 * @param {{id:string,level:number,isActive?:boolean}[]} buildings
 * @param {(id:string)=>?string} categoryOf e.g. `(id) => BUILDINGS[id]?.category`
 * @returns {number}
 */
export function totalBuildingPower(buildings, categoryOf) {
  let sum = 0;
  for (const b of buildings) {
    if (b.isActive === false) continue;
    sum += buildingPowerFor(b.id, categoryOf(b.id), b.level);
  }
  return Math.round(sum);
}

// --- Troops --------------------------------------------------------------
/** Weights apply to RESOLVED stats (post StatResolution). dmg term is DPS. */
export const TROOP_POWER = {
  weights: { hp: 0.04, dps: 1.1, def: 0.5, pen: 0.7, armorAvg: 0.6, rng: 10, spd: 6, acc: 40 },
  perEntity: 0.9, // every extra rendered squad member adds 90% of a single's power
};

/**
 * @param {object} r  resolved stats { hp, dmg, rof, def, pen?, armor?[], rng, spd, acc }
 * @param {number} entities  rendered units in the squad (each is real, see PersonnelConfig)
 * @returns {number}
 */
export function troopPower(r, entities = 1) {
  const w = TROOP_POWER.weights;
  const armorAvg = r.armor ? (r.armor[0] + r.armor[1] + r.armor[2]) / 3 : 0;
  const single =
    r.hp * w.hp +
    r.dmg * (r.rof || 0) * w.dps +
    (r.def || 0) * w.def +
    (r.pen || 0) * w.pen +
    armorAvg * w.armorAvg +
    (r.rng || 0) * w.rng +
    (r.spd || 0) * w.spd +
    (r.acc || 0) * w.acc;
  const squad = 1 + (Math.max(1, entities) - 1) * TROOP_POWER.perEntity;
  return Math.round(single * squad);
}

// --- Research ----------------------------------------------------------
export const RESEARCH_POWER = {
  perRank: 120,
  trackMult: { development: 0.8, military: 1.5, doctrine: 1.3, defense: 1.2, support: 0.9 },
};

/** @param {string} track @param {number} ranksCompleted @returns {number} */
export function researchPower(track, ranksCompleted) {
  return Math.round(RESEARCH_POWER.perRank * Math.max(0, ranksCompleted) * (RESEARCH_POWER.trackMult[track] ?? 1));
}

// --- Officers --------------------------------------------------------
export const OFFICER_POWER = { perStar: 800, perLevel: 45, perSkill: 300, perTalentNode: 120 };

/** @param {object} o { star, level, skillsUnlocked, talentNodes } @returns {number} */
export function officerPower(o) {
  return Math.round(
    OFFICER_POWER.perStar * (o.star || 0) +
    OFFICER_POWER.perLevel * (o.level || 0) +
    OFFICER_POWER.perSkill * (o.skillsUnlocked || 0) +
    OFFICER_POWER.perTalentNode * (o.talentNodes || 0),
  );
}

// --- Equipment ------------------------------------------------------
export const EQUIPMENT_POWER = {
  perRarity: { common: 60, uncommon: 140, rare: 320, epic: 700, legendary: 1500 },
  perLevel: 55,
  perCompleteSet: 400,
};

/** @param {string} rarity @param {number} level @param {number} completeSets @returns {number} */
export function equipmentPower(rarity, level, completeSets = 0) {
  return Math.round(
    (EQUIPMENT_POWER.perRarity[rarity] ?? 0) +
    EQUIPMENT_POWER.perLevel * Math.max(0, level) +
    EQUIPMENT_POWER.perCompleteSet * completeSets,
  );
}

// --- Total ----------------------------------------------------------
export const POWER_SOURCES = ['buildings', 'troops', 'research', 'officers', 'equipment'];

/**
 * @param {object} parts { buildings, troops, research, officers, equipment }
 * @returns {number} the number shown on the player's profile
 */
export function totalPower(parts) {
  let sum = 0;
  for (const key of POWER_SOURCES) sum += parts[key] ?? 0;
  return Math.round(sum);
}

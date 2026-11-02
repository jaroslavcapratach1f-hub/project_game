/**
 * BuildingConfig — the 19 buildings from GDD 04, their level caps, their
 * formula-driven per-level effects, and their geometric upgrade cost
 * (resources + construction materials — no real time; see below).
 *
 * NO buildings exist beyond this list. Every non-HQ building is also hard-
 * capped at the current headquarters level (see effectiveMaxLevel).
 *
 * Building upgrades are INSTANT once paid — no timer (corrected S48; a
 * real-time queue was built in S47 and was wrong for this). Real time in
 * this economy belongs to two OTHER systems: Research (docs/gdd/12-research.md
 * "cost is Money/Steel/Oil + time"; `research_center` above has a
 * `researchSpeed` effect — `src/config/research/` has the real node data,
 * `ResearchManager.js` runs it) and material crafting at the Engineering
 * Center (`MaterialsConfig.materialCraftSeconds` — `baseSeconds` per
 * material, shortened by `engineering`'s `materialCraftSpeed` effect). A
 * building upgrade just spends whatever materials are already sitting in
 * inventory — the wait already happened when they were crafted.
 *
 * effect tuple: [base, perLevel, mode]
 *   'add'   -> base + perLevel * (level - 1)
 *   'pow'   -> base * level ^ (1 + perLevel)
 *   'table' -> resolved by the owning system (e.g. PersonnelConfig)
 *
 * DRAFT: GDD 04 gives only "level increases X". Every number is a proposal.
 * REVIEW all.
 */

import { materialCost } from './MaterialsConfig.js';
import { HQ } from './GameConfig.js';
import { levelOverride } from './BuildingLevelOverrides.js';

export const COST_GROWTH = 1.28;

/** Effect keys that represent whole-number counts; resolveEffect() floors them. */
export const INT_EFFECT_KEYS = new Set([
  'buildingSlots', 'deploySquadSlots', 'garrisonSlots', 'towerCount',
  'scoutPlanes', 'repairSlots', 'reinforcementSlots', 'officerSlots',
  'trainingSlots', 'marketSlots', 'blueprintSlots', 'parallelSlots',
  'parallelResearch', 'productionQueueCapacity', 'assistCount',
]);

export const BUILDINGS = {
  headquarters: { max: HQ.maxLevel, unique: 1, category: 'core', baseCost: { money: 2000, steel: 1500, oil: 800 }, materialBudget: 40, effects: { buildingSlots: [10, 0.6, 'add'], baseGunDamage: [520, 0.12, 'pow'], baseGunRangeTiles: [7, 0.05, 'add'], baseHpPct: [0, 0.03, 'add'], deploySquadSlots: [3, 0.09, 'add'], garrisonSlots: [4, 0.12, 'add'] } },
  // moneyPerHour/steelPerHour/oilPerHour: 'table' — the player's own real
  // 36-level curve (ResourceBuildingCurve.js), identical for all 3 resource
  // buildings, NOT this generic 'pow' formula (see PowerConfig.buildingPowerFor
  // / BaseManager.productionByResource / BuildingStatsConfig.buildingStatsAt,
  // which all special-case RESOURCE_BUILDING_IDS before ever reaching here).
  treasury: { max: HQ.maxLevel, unique: 4, category: 'economy', baseCost: { money: 400 }, materialBudget: 12, effects: { moneyPerHour: [0, 0, 'table'], moneyStorageMult: [1, 0.04, 'add'] } },
  steelworks: { max: HQ.maxLevel, unique: 4, category: 'economy', baseCost: { money: 400, steel: 200 }, materialBudget: 12, effects: { steelPerHour: [0, 0, 'table'], steelStorageMult: [1, 0.04, 'add'] } },
  crude_oil: { max: HQ.maxLevel, unique: 4, category: 'economy', baseCost: { money: 400, oil: 200 }, materialBudget: 12, effects: { oilPerHour: [0, 0, 'table'], oilStorageMult: [1, 0.04, 'add'] } },
  engineering: { max: HQ.maxLevel, unique: 2, category: 'economy', baseCost: { money: 600, steel: 400 }, materialBudget: 16, effects: { materialCraftSpeed: [1, 0.03, 'add'], materialTierUnlock: [1, 0, 'table'] } },
  barracks: { max: HQ.maxLevel, unique: 5, category: 'military', baseCost: { money: 500, steel: 300 }, materialBudget: 14, effects: { productionSpeed: [1, 0.02, 'add'], productionQueueCapacity: [1, 0.02, 'add'], rallySquadSize: [1, 0.015, 'add'] } },
  armory: { max: 25, unique: 1, category: 'acquisition', baseCost: { money: 1200, steel: 600 }, materialBudget: 18, effects: { bonusPullPct: [0, 0.008, 'add'], pityBankExtra: [0, 0, 'table'] } },
  parts_workshop: { max: HQ.maxLevel, unique: 1, category: 'workshop', baseCost: { money: 800, steel: 700 }, materialBudget: 16, effects: { modifyCapPct: [0.05, 0.006, 'add'], equipmentCraftSpeed: [1, 0.025, 'add'], conversionRate: [1, 0.02, 'add'] } },
  disassemble: { max: 30, unique: 1, category: 'workshop', baseCost: { money: 600, steel: 500 }, materialBudget: 14, effects: { processSpeed: [1, 0.03, 'add'], componentYieldPct: [0, 0.01, 'add'], parallelSlots: [1, 0.06, 'add'] } },
  assembly: { max: HQ.maxLevel, unique: 1, category: 'workshop', baseCost: { money: 900, steel: 800 }, materialBudget: 16, effects: { assemblySpeed: [1, 0.025, 'add'], campPrestigeGain: [1, 0.02, 'add'], blueprintSlots: [2, 0.08, 'add'] } },
  defence_wall: { max: HQ.maxLevel, unique: 1, category: 'defense', baseCost: { money: 700, steel: 900 }, materialBudget: 18, effects: { baseHpPct: [0, 0.025, 'add'], wallArmor: [20, 0.08, 'pow'] } },
  attack_towers: { max: HQ.maxLevel, unique: 1, category: 'defense', baseCost: { money: 800, steel: 700 }, materialBudget: 18, effects: { towerDamage: [420, 0.1, 'pow'], towerRof: [0.5, 0.01, 'add'], towerCount: [2, 0.09, 'add'] } },
  research_center: { max: HQ.maxLevel, unique: 1, category: 'strategic', baseCost: { money: 1500, steel: 900, oil: 600 }, materialBudget: 20, effects: { researchSpeed: [1, 0.02, 'add'], parallelResearch: [1, 0.03, 'add'] } },
  airbase: { max: 20, unique: 1, category: 'strategic', baseCost: { money: 1000, steel: 600, oil: 500 }, materialBudget: 16, effects: { scoutPlanes: [1, 0.3, 'add'], scoutRangeTiles: [8, 0.4, 'add'], scoutDurationSeconds: [300, 0.06, 'pow'] } },
  hospital: { max: HQ.maxLevel, unique: 1, category: 'support', baseCost: { money: 700, steel: 400 }, materialBudget: 14, effects: { repairPctPerMin: [0.2, 0.015, 'add'], hospitalCapacity: [400, 0.14, 'pow'], repairSlots: [3, 0.06, 'add'] } },
  alliance_hall: { max: 25, unique: 1, category: 'support', baseCost: { money: 900, steel: 500 }, materialBudget: 16, effects: { assistCount: [1, 0.22, 'add'], assistCapacity: [300, 0.12, 'pow'], reinforcementSlots: [1, 0.12, 'add'] } },
  reserves_barracks: { max: HQ.maxLevel, unique: 1, category: 'support', baseCost: { money: 800, steel: 400 }, materialBudget: 14, effects: { personnelCap: [0, 0, 'table'], personnelRegen: [0, 0, 'table'] } },
  officer_barracks: { max: 25, unique: 1, category: 'support', baseCost: { money: 900, steel: 500 }, materialBudget: 16, effects: { officerSlots: [6, 0.4, 'add'], officerTrainingSpeed: [1, 0.03, 'add'], trainingSlots: [2, 0.1, 'add'] } },
  black_market: { max: 15, unique: 1, category: 'strategic', baseCost: { money: 1000 }, materialBudget: 12, effects: { refreshMinutes: [240, -12, 'add'], rareStockChance: [0.05, 0.01, 'add'], marketSlots: [4, 0.2, 'add'] } },
};

/**
 * Dynamic Barracks (GDD 04): a Military Barracks re-skins by what it produces,
 * instantly and reversibly. All three variants share BUILDINGS.barracks.effects;
 * only the label / tint / queueable classes change. DRAFT.
 */
export const BARRACKS_VARIANTS = {
  militaryBarracks: { label: 'Military Barracks', tint: 0x4a5d23, classes: ['infantry'] },
  tankFactory: { label: 'Tank Factory', tint: 0x5c4033, classes: ['lightTank', 'mediumTank', 'heavyTank', 'superHeavyTank', 'tankHunter'] },
  artilleryFactory: { label: 'Artillery Factory', tint: 0x6b6b6b, classes: ['howitzer', 'atGun', 'launcher'] },
};

/**
 * @param {string} cls combat class the barracks is set to produce
 * @returns {string} BARRACKS_VARIANTS key (defaults to militaryBarracks)
 */
export function barracksVariantForClass(cls) {
  for (const key in BARRACKS_VARIANTS) {
    if (BARRACKS_VARIANTS[key].classes.includes(cls)) return key;
  }
  return 'militaryBarracks';
}

/**
 * @param {string} id  BUILDINGS key
 * @param {number} hqLevel  current headquarters level
 * @returns {number} the level this building can actually reach right now
 */
export function effectiveMaxLevel(id, hqLevel) {
  const b = BUILDINGS[id];
  if (!b) return 0;
  if (id === 'headquarters') return b.max;
  return Math.min(b.max, hqLevel);
}

/**
 * @param {object} b  a BUILDINGS entry
 * @param {string} key  effect key
 * @param {number} level
 * @returns {number} raw effect value (see mode in header)
 */
export function buildingEffect(b, key, level) {
  const tuple = b.effects[key];
  if (!tuple) return 0;
  const [base, perLevel, mode] = tuple;
  const n = Math.max(1, level);
  if (mode === 'pow') return base * Math.pow(n, 1 + perLevel);
  if (mode === 'add') return base + perLevel * (n - 1);
  return base; // 'table' -> resolved by the owning system
}

/**
 * Like buildingEffect but floors count-type keys (INT_EFFECT_KEYS).
 * @returns {number}
 */
export function resolveEffect(b, key, level) {
  const v = buildingEffect(b, key, level);
  return INT_EFFECT_KEYS.has(key) ? Math.floor(v) : v;
}

/**
 * Instant — no timer (see file header). Confirmed real-world levels
 * (BuildingLevelOverrides) take priority over the placeholder formula.
 * @param {string} id a BUILDINGS key
 * @param {number} level the level being purchased
 * @returns {object} { money?, steel?, oil?, materials:{} }
 */
export function upgradeCost(id, level) {
  const override = levelOverride(id, level);
  if (override?.resourceCost) return { ...override.resourceCost, materials: { ...override.materialCost } };
  const b = BUILDINGS[id];
  const f = Math.pow(COST_GROWTH, level - 1);
  const out = {};
  for (const k in b.baseCost) out[k] = Math.round(b.baseCost[k] * f);
  out.materials = materialCost(level, b.materialBudget);
  return out;
}

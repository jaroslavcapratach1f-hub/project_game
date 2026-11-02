/**
 * BuildingStatsConfig — the SINGLE SOURCE OF TRUTH behind `BuildingInfoScreen`,
 * `BuildingLevelInfoScreen`, and `BuildingUpgradeScreen`: every number these
 * three screens show is read straight off `BuildingConfig.BUILDINGS[id]`
 * (via `buildingEffect`/`resolveEffect`) and `PowerConfig.buildingPower` —
 * nothing here duplicates a value, it only decides WHICH of a building's
 * real effect keys is its "headline" stat and how to FORMAT it. No Max
 * Storage anywhere (the player's own explicit rule) — `*StorageMult`
 * effects are the player's global wallet cap, a different system
 * (ResourceConfig.storageCap), never surfaced by these screens.
 */
import { BUILDINGS, resolveEffect } from './BuildingConfig.js';
import { buildingPowerFor } from './PowerConfig.js';
import { RESOURCE_BUILDING_IDS, resourceProductionAt } from './ResourceBuildingCurve.js';
import { levelOverride } from './BuildingLevelOverrides.js';
import { workshopsUnlockedAt } from './MaterialsConfig.js';

const ENGINEERING_ID = 'engineering';

const PCT_SCALE = 100;

/** Value formatters, keyed by the `fmt` tag each HEADLINE_STAT entry picks. */
const FORMAT = {
  perHour: (v) => `${Math.round(v).toLocaleString('en-US')}/h`,
  percent: (v) => `${(v * PCT_SCALE).toFixed(1).replace(/\.0$/, '')}%`,
  percentBonus: (v) => `+${((v - 1) * PCT_SCALE).toFixed(1).replace(/\.0$/, '')}%`,
  count: (v) => `${Math.round(v)}`,
  plain: (v) => `${Math.round(v).toLocaleString('en-US')}`,
};

/** One real effect key per building — its single "headline" production/benefit stat. Power is always appended separately. */
const HEADLINE_EFFECT = {
  headquarters: { key: 'buildingSlots', label: 'Building Slots', fmt: 'count' },
  treasury: { key: 'moneyPerHour', label: 'Military Funds Production', fmt: 'perHour' },
  steelworks: { key: 'steelPerHour', label: 'Steel Production', fmt: 'perHour' },
  crude_oil: { key: 'oilPerHour', label: 'Oil Production', fmt: 'perHour' },
  engineering: { key: 'materialCraftSpeed', label: 'Material Craft Speed', fmt: 'percentBonus' },
  barracks: { key: 'productionSpeed', label: 'Troop Training Speed', fmt: 'percentBonus' },
  armory: { key: 'bonusPullPct', label: 'Bonus Pull Chance', fmt: 'percent' },
  parts_workshop: { key: 'equipmentCraftSpeed', label: 'Equipment Craft Speed', fmt: 'percentBonus' },
  disassemble: { key: 'processSpeed', label: 'Disassembly Speed', fmt: 'percentBonus' },
  assembly: { key: 'assemblySpeed', label: 'Assembly Speed', fmt: 'percentBonus' },
  defence_wall: { key: 'wallArmor', label: 'Wall Armor', fmt: 'plain' },
  attack_towers: { key: 'towerDamage', label: 'Tower Damage', fmt: 'plain' },
  research_center: { key: 'researchSpeed', label: 'Research Speed', fmt: 'percentBonus' },
  airbase: { key: 'scoutPlanes', label: 'Scout Planes', fmt: 'count' },
  hospital: { key: 'repairPctPerMin', label: 'Repair Rate', fmt: 'percent' },
  alliance_hall: { key: 'assistCapacity', label: 'Assist Capacity', fmt: 'plain' },
  // reserves_barracks: no clean numeric headline (its effects are both
  // 'table'-resolved, owned by PersonnelConfig) — Power is its only
  // headline stat, which is real, not a gap papered over with a fake one.
  officer_barracks: { key: 'officerSlots', label: 'Officer Slots', fmt: 'count' },
  black_market: { key: 'rareStockChance', label: 'Rare Stock Chance', fmt: 'percent' },
};

/** Short, real flavour text — `BuildingInfoScreen`'s right-side description. */
export const BUILDING_DESCRIPTIONS = {
  headquarters: 'Command center of your base. Its level gates every other building and grows your build-slot capacity.',
  treasury: 'Continuously generates Military Funds for your base. Upgrade it to increase Funds production and Power.',
  steelworks: 'Continuously generates Steel for construction and production. Upgrade it to increase Steel output and Power.',
  crude_oil: 'Continuously generates Oil to fuel vehicle production and research. Upgrade it to increase Oil output and Power.',
  engineering: 'Crafts the construction materials every building upgrade consumes. Upgrade it to craft faster and unlock higher material tiers.',
  barracks: 'Trains and houses your ground troops. Upgrade it to speed up training and grow your rally squad size.',
  armory: 'Pulls new troop blueprints from crates. Upgrade it to improve your odds of a bonus pull.',
  parts_workshop: 'Crafts and converts equipment for your troops. Upgrade it to craft faster and raise the modify cap.',
  disassemble: 'Breaks down surplus gear into components. Upgrade it to process faster and recover more components.',
  assembly: 'Assembles troop blueprints into fielded units. Upgrade it to assemble faster and open more blueprint slots.',
  defence_wall: 'Shields your base from direct assault. Upgrade it to raise wall armor and base HP.',
  attack_towers: 'Automatically fires on enemies near your base. Upgrade it to raise tower damage and field more towers.',
  research_center: 'Unlocks and speeds up your research tree. Upgrade it to research faster and run more projects in parallel.',
  airbase: 'Launches scout planes to reveal the map. Upgrade it to field more planes with greater range and endurance.',
  hospital: 'Heals wounded troops after battle. Upgrade it to heal faster and treat more at once.',
  alliance_hall: 'Coordinates alliance assistance and reinforcements. Upgrade it to raise assist capacity and reinforcement slots.',
  reserves_barracks: 'Holds your reserve personnel pool. Upgrade it to raise the pool’s cap and regeneration rate.',
  officer_barracks: 'Trains and houses your officers. Upgrade it to open more officer slots and train faster.',
  black_market: 'A rotating black-market stock of rare goods. Upgrade it to see rarer stock more often and more market slots.',
};

/**
 * The CURRENT-level display stats for one building — headline effect (if
 * this building has one) + Power, always in that order. The single source
 * of truth `BuildingInfoScreen`, `BuildingLevelInfoScreen`, and
 * `BuildingUpgradeScreen` all read.
 * @param {string} id BUILDINGS key @param {number} level
 * @returns {{key:string,label:string,value:number,display:string}[]}
 */
export function buildingStatsAt(id, level) {
  const b = BUILDINGS[id];
  if (!b) return [];
  const out = [];
  const h = HEADLINE_EFFECT[id];
  if (h) {
    const value = RESOURCE_BUILDING_IDS.has(id) ? resourceProductionAt(level) : resolveEffect(b, h.key, level);
    out.push({ key: h.key, label: h.label, value, display: FORMAT[h.fmt](value) });
  }
  const power = buildingPowerFor(id, b.category, level);
  out.push({ key: 'power', label: 'Power', value: power, display: FORMAT.plain(power) });
  // Factory only — workshop count is level-gated (Lv1/4/18/22, the player's
  // own confirmed thresholds), shown as its own column/tile alongside Power.
  if (id === ENGINEERING_ID) {
    const w = workshopsUnlockedAt(level);
    out.push({ key: 'workshops', label: 'Workshops', value: w, display: FORMAT.count(w) });
  }
  return out;
}

/** Delta formatters — a DIFFERENCE between two levels, always sign-prefixed (never a next-level total, the player's own explicit rule). */
const DELTA_FORMAT = {
  perHour: (d) => `${d >= 0 ? '+' : ''}${Math.round(d).toLocaleString('en-US')}/h`,
  // `percent`'s own stored values are already fractions (0.05 = 5%); a
  // `percentBonus` stat's stored values are multipliers (1.03), but the
  // RAW DIFFERENCE between two of those multipliers (0.03) is itself
  // exactly the fraction to display — same formula as `percent` either way.
  percent: (d) => `${d >= 0 ? '+' : ''}${(d * PCT_SCALE).toFixed(1).replace(/\.0$/, '')}%`,
  percentBonus: (d) => DELTA_FORMAT.percent(d),
  count: (d) => `${d >= 0 ? '+' : ''}${Math.round(d)}`,
  plain: (d) => `${d >= 0 ? '+' : ''}${Math.round(d).toLocaleString('en-US')}`,
};

/**
 * Upgrade-screen deltas: next-level stat minus current-level stat, for
 * every headline stat this building has (never the next-level TOTAL — the
 * player's own explicit rule). Appends a Build Points tile whenever the
 * target level has a confirmed award (BuildingLevelOverrides) — real,
 * never-fabricated data, never shown for an unconfigured level.
 * @param {string} id @param {number} currentLevel @param {number} nextLevel
 * @returns {{key:string,label:string,delta:number,display:string}[]}
 */
export function buildingStatDeltas(id, currentLevel, nextLevel) {
  const cur = buildingStatsAt(id, currentLevel);
  const next = buildingStatsAt(id, nextLevel);
  const h = HEADLINE_EFFECT[id];
  const out = next.map((n, i) => {
    const delta = n.value - cur[i].value;
    const fmtTag = (n.key === 'power' || n.key === 'workshops') ? 'plain' : (h?.fmt ?? 'plain');
    return { key: n.key, label: n.label, delta, display: DELTA_FORMAT[fmtTag](delta) };
  }).filter((d) => d.key !== 'workshops' || d.delta !== 0); // only show the tile on the levels that actually unlock one
  const override = levelOverride(id, nextLevel);
  if (override?.baseHpDelta) out.push({ key: 'baseHp', label: 'Base HP', delta: override.baseHpDelta, display: `+${override.baseHpDelta.toLocaleString('en-US')}` });
  if (override?.buildPoints) out.push({ key: 'buildPoints', label: 'Build Points', delta: override.buildPoints, display: `+${override.buildPoints}` });
  return out;
}

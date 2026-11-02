/**
 * UnitStats — BASE stats for every unit at 4-star, level 1, no bonuses.
 * Final numbers = these run through StatResolution, then the CombatConfig
 * damage model.
 *
 * The rows are NOT hand-typed — each is `deriveRow(key, [faction, cls, star])`
 * (see UnitModel.js) over the tuning tables in unitRoles.js, anchored to a
 * single dial: a 4★ Medium Tank mirror match lasts `MIRROR_TTK_SECONDS`. Retune
 * balance by editing unitRoles.js; every unit re-derives consistently.
 *
 * The four exported groups keep their historical membership (entity subclasses
 * import `INFANTRY` / `TANKS` / `TANK_HUNTERS` / `UNIQUE` by name). The Gather
 * Truck is non-combat and stays hand-specified.
 *
 * DRAFT: magnitudes are a balance proposal. REVIEW.
 */
import { deriveRow } from './UnitModel.js';

const DE = 'germany';
const US = 'usa';
const RU = 'russia';

/** Per-class traits shared by every unit of that class. */
export const CLASS_TRAITS = {
  infantry:       { armored: false, deployable: false, furyChargePerSec: 6.0 },
  lightTank:      { armored: true,  deployable: false, furyChargePerSec: 5.0 },
  mediumTank:     { armored: true,  deployable: false, furyChargePerSec: 4.0 },
  heavyTank:      { armored: true,  deployable: false, furyChargePerSec: 3.5 },
  superHeavyTank: { armored: true,  deployable: false, furyChargePerSec: 2.5 },
  tankHunter:     { armored: true,  deployable: false, furyChargePerSec: 4.5 },
  howitzer:       { armored: false, deployable: true,  furyChargePerSec: 3.0 },
  launcher:       { armored: false, deployable: false, furyChargePerSec: 3.5 },
  atGun:          { armored: false, deployable: true,  furyChargePerSec: 3.0 },
  gatherTruck:    { armored: false, deployable: false, furyChargePerSec: 0.0 },
};

export const UNIT_CLASSES = Object.keys(CLASS_TRAITS);

/** roster manifest: key -> [faction, class, star]. Groups match the old file. */
const REGISTRY = {
  INFANTRY: {
    kar98k_squad: [DE, 'infantry', 4.0], gewehr43_squad: [DE, 'infantry', 4.5], stg44_squad: [DE, 'infantry', 5.0],
    springfield_squad: [US, 'infantry', 4.0], m1garand_squad: [US, 'infantry', 4.5], m2carbine_squad: [US, 'infantry', 5.0],
    mosin_squad: [RU, 'infantry', 4.0], mosin_carbine_squad: [RU, 'infantry', 4.5], svt40_squad: [RU, 'infantry', 5.0],
  },
  TANKS: {
    panzer_iv: [DE, 'mediumTank', 4], m4_sherman: [US, 'mediumTank', 4], t34_85: [RU, 'mediumTank', 4],
    tiger_i: [DE, 'heavyTank', 4], m26_pershing: [US, 'heavyTank', 4], is2: [RU, 'heavyTank', 4],
  },
  TANK_HUNTERS: {
    jagdpanther: [DE, 'tankHunter', 4], m18_hellcat: [US, 'tankHunter', 4], su100: [RU, 'tankHunter', 4],
  },
  UNIQUE: {
    m24_chaffee: [US, 'lightTank', 4], maus: [DE, 'superHeavyTank', 4], pak40: [DE, 'atGun', 4],
    m12_gmc: [US, 'howitzer', 4], isu152: [RU, 'howitzer', 4], bm13_katyusha: [RU, 'launcher', 4],
  },
};

/** @param {Object<string,[string,string,number]>} group @returns {Object<string,object>} */
function build(group) {
  const out = {};
  for (const key of Object.keys(group)) out[key] = deriveRow(key, group[key]);
  return out;
}

export const INFANTRY = build(REGISTRY.INFANTRY);
export const TANKS = build(REGISTRY.TANKS);
export const TANK_HUNTERS = build(REGISTRY.TANK_HUNTERS);
export const UNIQUE = build(REGISTRY.UNIQUE);

/** Non-combat. Faction is a cosmetic skin only (GDD 07). Hand-specified. */
export const GATHER_TRUCK = {
  gather_truck: { faction: 'any', cls: 'gatherTruck', star: 3, hp: 700, dmg: 0, def: 6, rof: 0, rng: 0, spd: 2.6, cost: 0, aoe: 0, acc: 0, dodge: 0.05, nonCombat: true, carryCapacity: 5000, gatherPerSecond: 50 },
};

export const ALL_COMBAT_UNITS = { ...INFANTRY, ...TANKS, ...TANK_HUNTERS, ...UNIQUE };
export const ALL_UNITS = { ...ALL_COMBAT_UNITS, ...GATHER_TRUCK };

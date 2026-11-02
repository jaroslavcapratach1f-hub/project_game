/**
 * EconomyConfig — resource generation, world gathering, hospital repair,
 * research pacing, and the master list of real-time timers.
 *
 * Three core resources only (Money / Steel / Oil); construction materials are
 * in MaterialsConfig. DRAFT: GDD 07 / 11 leave most of this "TBD". REVIEW.
 */

export const BASE_HP = {
  regenPctPerHour: 0.125,   // full in ~8 h at base level 1 (GDD 09)
  regenTickSeconds: 60,
  scalesWithBaseLevel: true, // higher HQ level -> faster absolute regen
};

export const GATHER = {
  truckCarryCapacity: 5000,  // matches UnitStats.gather_truck
  ratePerSecondAtNode: 50,
  trucksBase: 1,             // before Industry research
  trucksPerIndustryTier: 1,  // GDD 04: Industry track unlocks trucks
  travelSpeedTiles: 2.8,
  nodeTierYieldMult: [1, 1.4, 1.9, 2.5, 3.2, 4.0], // WORLD.gatherNodeTiers entries
};

/** Base production time (seconds) at factory speed x1, 4-star. Keyed by class. */
export const PRODUCTION_SECONDS = {
  infantry: 180,
  lightTank: 360,
  mediumTank: 720,
  tankHunter: 900,
  atGun: 1200,
  howitzer: 1500,
  launcher: 1500,
  heavyTank: 1800,
  superHeavyTank: 5400,
};

/** Multiply PRODUCTION_SECONDS by this for higher acquisition rarity. */
export const PRODUCTION_TIER_MULT = { '4': 1, '4.5': 1.4, '5': 2.0 };

export const HOSPITAL = {
  repairPctPerMinL1: 0.2,   // BuildingConfig.hospital scales this
  slotsBase: 3,
  slotsPerLevel: 0.5,
  fieldRepairAllowed: false, // GDD: units walk home to heal
};

export const RESEARCH = {
  firstNodeSeconds: 600,
  nodeGrowth: 1.6,           // each subsequent rank in a track (see research/)
};

/**
 * Resource accrual cadence: ResourceManager banks fractional per-second income
 * every frame but only folds whole units into the balances + emits
 * RESOURCE_CHANGED this often (keeps the HUD from thrashing). Same style as
 * TIMERS — one number, in seconds.
 */
export const RESOURCE_ACCRUAL = {
  tickSeconds: 5,
};

/**
 * What ResourceManager starts with. `materialEach` seeds every construction
 * material — Engineering Center material *production* is FORWARD, so this stock
 * is all the upgrade headroom the dev scene has. DRAFT / REVIEW.
 */
export const STARTING_STOCK = {
  money: 8000,
  steel: 5000,
  oil: 3000,
  materialEach: 200,
};

/** Every real-time duration in the game, in seconds, in one place. */
export const TIMERS = {
  personnelRegenTick: 60,
  baseHpRegenTick: 60,
  baseFuryLinger: 120,       // GDD 02
  airdropChargeRegen: 8 * 3600,   // GDD 09
  offlineTroopKill: 30 * 86400,   // GDD 06 / 09
  blackMarketRefresh: 240 * 60,   // BuildingConfig.black_market shortens this
  caravanForcedRelocateGrace: 0,  // GDD 09: HP zero = immediate random move
};

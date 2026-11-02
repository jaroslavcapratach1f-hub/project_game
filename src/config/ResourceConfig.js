/**
 * ResourceConfig — the single source of truth for every resource, currency,
 * and progression token, plus resource-storage behaviour.
 *
 * SCOPE LOCK: exactly three core resources (Money / Steel / Oil). No premium
 * hard currency, no universal star-up token — star-ups are copy-based (GDD 08).
 *
 * DRAFT: storage numbers are proposals. REVIEW.
 */

/**
 * Core resources: produced by resource buildings, spent on nearly everything.
 * PvP NEVER transfers resources (GDD 01 pillar 8) -> `lootable: false` always.
 */
export const CORE_RESOURCES = {
  money: { name: 'Money', building: 'treasury',   spentOn: ['research', 'building upgrades', 'production', 'assembly'] },
  steel: { name: 'Steel', building: 'steelworks', spentOn: ['research', 'building upgrades', 'production', 'defense'] },
  oil:   { name: 'Oil',   building: 'crude_oil',  spentOn: ['research', 'building upgrades', 'vehicle production'] },
};

export const CORE_RESOURCE_KEYS = Object.keys(CORE_RESOURCES);
export const RESOURCE_LOOTABLE = false;

/** Construction materials — Engineering Center only; spent ONLY on building
 *  upgrades (GDD 07). Full definitions in MaterialsConfig. */
export const MATERIAL_KEYS = ['woodPlanks', 'bricks', 'cement', 'metalBeams', 'asphalt', 'concrete'];

/** Soft currencies and progression tokens (GDD 07). */
export const CURRENCIES = {
  armsCoupons:     { name: 'Arms Coupons',     use: 'Armory troop crate pulls' },
  officerVouchers: { name: 'Officer Vouchers', use: 'Officer crate pulls' },
  officerShards:   { name: 'Officer Shards',   use: 'Officer star promotion' },
  armsExp:         { name: 'Arms EXP',         use: 'Troop level-up, every band' },
  ammunition:      { name: 'Ammunition',       use: 'Troop level-up, from level 11' },
  troopParts:      { name: 'Troop Parts',      use: 'Assembly of 4-star+ troops' },
  troopComponent:  { name: 'Troop Component',  use: 'Modify, equipment crafting, conversion' },
  specialItems:    { name: 'Special Items',    use: 'Assembly recipes, high-tier conversion' },
  blueprintFrag:   { name: 'Blueprint Fragments', use: 'Assemble a unit blueprint (see PartsConfig)' },
  conversionToken: { name: 'Conversion Token', use: 'Parts Workshop conversion store' },
};

/**
 * Resource storage. Overflow production is discarded (GDD 07). Cap grows with
 * the summed level of that resource's buildings (each nation has up to 4).
 */
export const STORAGE = {
  money: { base: 60000, perBuildingLevel: 0.16 },
  steel: { base: 48000, perBuildingLevel: 0.16 },
  oil:   { base: 36000, perBuildingLevel: 0.16 },
};

/**
 * @param {string} key   'money' | 'steel' | 'oil'
 * @param {number} summedLevel  sum of that resource's building levels
 * @returns {number} storage cap
 */
export function storageCap(key, summedLevel) {
  const s = STORAGE[key];
  if (!s) return 0;
  return Math.round(s.base * Math.pow(1 + s.perBuildingLevel, Math.max(0, summedLevel - 1)));
}

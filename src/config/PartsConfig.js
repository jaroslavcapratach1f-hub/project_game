/**
 * PartsConfig — the manufacturing economy that sits behind the Assembly
 * Workshop, Disassemble Factory and Parts Workshop (GDD 04): unit parts,
 * blueprints, components, the Modify system, and the conversion store.
 *
 * Not equipment — that is src/config/equipment/. DRAFT — REVIEW every number.
 */

/** Part categories produced by disassembly and spent on assembly. */
export const PART_CATEGORIES = {
  infantryParts: { name: 'Infantry Parts', classes: ['infantry'] },
  vehicleParts: { name: 'Vehicle Parts', classes: ['lightTank', 'mediumTank', 'heavyTank', 'superHeavyTank', 'tankHunter'] },
  ordnanceParts: { name: 'Ordnance Parts', classes: ['howitzer', 'launcher', 'atGun'] },
  universalParts: { name: 'Universal Parts', classes: 'any' },
};

/** @param {string} cls @returns {string} part category key */
export function partCategoryFor(cls) {
  for (const key in PART_CATEGORIES) {
    const c = PART_CATEGORIES[key].classes;
    if (Array.isArray(c) && c.includes(cls)) return key;
  }
  return 'universalParts';
}

/**
 * Blueprints. A unit is manufactured from a complete blueprint + parts + cash.
 * Fragments drop from crates (ArmoryConfig.BLUEPRINT_FRAGMENTS) and the market.
 */
export const BLUEPRINT = {
  fragmentsPerBlueprint: { '4': 20, '4.5': 45, '5': 90 }, // by target star
  manufactureCost: {
    '4': { parts: 60, universalParts: 10, money: 4000, seconds: 1800 },
    '4.5': { parts: 140, universalParts: 30, money: 12000, seconds: 5400 },
    '5': { parts: 320, universalParts: 80, money: 32000, seconds: 14400 },
  },
};

/**
 * Components (Disassemble Factory output) fuel Modify + equipment enhancement +
 * conversion. Yield by star is in ProgressionConfig.DISASSEMBLE_YIELD.
 */
export const COMPONENT = { key: 'troopComponent', name: 'Troop Component' };

/**
 * MODIFY — permanent flat-percent stat adds bought with Components. Capped by
 * parts_workshop.modifyCapPct (BuildingConfig). Disassembling the troop
 * refunds nothing and clears all Modify (GDD 04).
 */
export const MODIFY = {
  stats: ['hp', 'dmg', 'def', 'armor', 'pen'],
  stepPct: 0.01,            // each purchase adds +1% (feeds StatResolution.modify)
  componentPerStep: 40,
  componentStepGrowth: 1.15,
  moneyPerStep: 1500,
};

/** @param {number} stepIndex 0-based purchase number @returns {number} components */
export function modifyStepCost(stepIndex) {
  return Math.round(MODIFY.componentPerStep * Math.pow(MODIFY.componentStepGrowth, Math.max(0, stepIndex)));
}

/**
 * CONVERSION store — turn surplus blueprints/parts into Conversion Tokens, then
 * spend tokens on wanted blueprints or on materials to forge equipment parts.
 */
export const CONVERSION = {
  tokenPerSurplusBlueprintStar: { '3': 1, '4': 4, '4.5': 9, '5': 20 },
  tokenPer100Parts: 3,
  store: {
    blueprintFragment: 2,   // tokens per fragment
    equipmentPartRoll: 12,  // tokens per random part of the shop's current tier
    universalParts50: 5,
  },
};

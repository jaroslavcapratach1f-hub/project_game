/**
 * EquipmentModel — rarity scaling, enhancement levels + cost, and the resolver
 * that turns a troop's three equipped parts into the { equipmentPct,
 * equipmentFlat } object StatResolution expects.
 *
 * Enhancement spends Troop Component (Disassemble Factory output) + Money and
 * is sped up by parts_workshop.equipmentCraftSpeed. DRAFT — REVIEW.
 */

import { PARTS } from './EquipmentParts.js';
import { activeSetBonuses } from './EquipmentSets.js';

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY = {
  common: { mult: 1.0, maxLevel: 10 },
  uncommon: { mult: 1.35, maxLevel: 15 },
  rare: { mult: 1.8, maxLevel: 20 },
  epic: { mult: 2.4, maxLevel: 25 },
  legendary: { mult: 3.2, maxLevel: 30 },
};

export const ENHANCE = { componentBase: 20, componentGrowth: 1.18, moneyBase: 500, moneyGrowth: 1.2, secondsBase: 60, secondsGrowth: 1.15 };

/**
 * Cost to enhance a part from `level` to `level + 1`.
 * @param {string} rarity @param {number} level
 * @returns {{ troopComponent:number, money:number, seconds:number }}
 */
export function enhanceCost(rarity, level) {
  const r = RARITY[rarity]?.mult ?? 1;
  const l = Math.max(0, level - 1);
  return {
    troopComponent: Math.round(ENHANCE.componentBase * r * Math.pow(ENHANCE.componentGrowth, l)),
    money: Math.round(ENHANCE.moneyBase * r * Math.pow(ENHANCE.moneyGrowth, l)),
    seconds: Math.round(ENHANCE.secondsBase * Math.pow(ENHANCE.secondsGrowth, l)),
  };
}

/** Single part's stat value at a rarity + level. */
export function partValue(partId, rarity, level) {
  const p = PARTS[partId];
  if (!p) return null;
  const cap = RARITY[rarity]?.maxLevel ?? 1;
  const lvl = Math.max(1, Math.min(cap, level));
  const raw = (p.base + p.perLevel * (lvl - 1)) * (RARITY[rarity]?.mult ?? 1);
  return { statKey: p.statKey, mode: p.mode, value: raw, family: p.family };
}

/**
 * Resolve a full loadout (up to 3 parts) into stat buckets, set bonuses folded in.
 * @param {Array<{partId:string, rarity:string, level:number}>} loadout
 * @returns {{ equipmentPct:Object<string,number>, equipmentFlat:Object<string,number> }}
 */
export function resolveEquipment(loadout) {
  const pct = {};
  const flat = {};
  const families = [];
  const add = (b) => {
    const bucket = b.mode === 'flat' ? flat : pct;
    bucket[b.statKey] = (bucket[b.statKey] ?? 0) + b.value;
  };
  for (const item of loadout) {
    const v = partValue(item.partId, item.rarity, item.level);
    if (!v) continue;
    families.push(v.family);
    add(v);
  }
  for (const set of activeSetBonuses(families)) {
    for (const b of set.bonuses) add(b);
  }
  return { equipmentPct: pct, equipmentFlat: flat };
}

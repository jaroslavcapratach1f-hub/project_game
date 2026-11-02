/**
 * EquipmentParts — the part catalog. Each part belongs to a `family` (which
 * drives set bonuses), sits in one slot, and modifies one stat.
 *
 * part: { id, family, slot, statKey, mode, base, perLevel }
 *   mode 'pct'  -> value is an additive fraction (feeds equipmentPct, capped)
 *   mode 'flat' -> value is a flat add after the multiplier bucket
 * Final value = (base + perLevel * (level - 1)) * rarityMult  (EquipmentModel).
 * DRAFT — REVIEW every number.
 */

export const FAMILIES = ['blitz', 'bulwark', 'marksman', 'assault', 'hunter', 'siege'];

export const PARTS = {
  // blitz — mobility & aggression
  blitz_engine: { id: 'blitz_engine', family: 'blitz', slot: 'support', statKey: 'spd', mode: 'pct', base: 0.05, perLevel: 0.006 },
  blitz_autoloader: { id: 'blitz_autoloader', family: 'blitz', slot: 'firepower', statKey: 'rof', mode: 'pct', base: 0.04, perLevel: 0.005 },
  // bulwark — protection
  bulwark_plating: { id: 'bulwark_plating', family: 'bulwark', slot: 'protection', statKey: 'armor', mode: 'pct', base: 0.06, perLevel: 0.006 },
  bulwark_hull: { id: 'bulwark_hull', family: 'bulwark', slot: 'protection', statKey: 'hp', mode: 'pct', base: 0.05, perLevel: 0.006 },
  bulwark_bracing: { id: 'bulwark_bracing', family: 'bulwark', slot: 'protection', statKey: 'def', mode: 'flat', base: 6, perLevel: 1.2 },
  // marksman — range & accuracy
  marksman_optics: { id: 'marksman_optics', family: 'marksman', slot: 'support', statKey: 'acc', mode: 'pct', base: 0.04, perLevel: 0.004 },
  marksman_rangefinder: { id: 'marksman_rangefinder', family: 'marksman', slot: 'support', statKey: 'rng', mode: 'pct', base: 0.04, perLevel: 0.005 },
  // assault — raw damage
  assault_barrel: { id: 'assault_barrel', family: 'assault', slot: 'firepower', statKey: 'dmg', mode: 'pct', base: 0.06, perLevel: 0.007 },
  assault_breech: { id: 'assault_breech', family: 'assault', slot: 'firepower', statKey: 'dmg', mode: 'flat', base: 8, perLevel: 1.6 },
  // hunter — armour penetration
  hunter_shell: { id: 'hunter_shell', family: 'hunter', slot: 'firepower', statKey: 'pen', mode: 'pct', base: 0.05, perLevel: 0.006 },
  hunter_core: { id: 'hunter_core', family: 'hunter', slot: 'firepower', statKey: 'pen', mode: 'flat', base: 6, perLevel: 1.1 },
  // siege — evasion & durability for exposed guns
  siege_suspension: { id: 'siege_suspension', family: 'siege', slot: 'support', statKey: 'dodge', mode: 'pct', base: 0.03, perLevel: 0.003 },
  siege_spade: { id: 'siege_spade', family: 'siege', slot: 'protection', statKey: 'hp', mode: 'flat', base: 40, perLevel: 8 },
};

export const PART_IDS = Object.keys(PARTS);

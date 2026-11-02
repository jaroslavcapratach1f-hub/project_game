/**
 * EquipmentSlots — every combat troop has three equipment slots. Each slot
 * accepts parts whose `statKey` belongs to that slot's stat group. The Gather
 * Truck has no slots (GATHER_TRUCK, non-combat).
 *
 * Parts are crafted / enhanced at the Parts Workshop and dropped by crates and
 * the Black Market. A part's contribution is resolved in EquipmentModel and
 * fed to StatResolution as `equipmentPct` (mode 'pct') or `equipmentFlat`
 * (mode 'flat'). DRAFT — REVIEW.
 */

export const SLOTS = [
  { id: 'firepower', name: 'Firepower', statGroup: ['dmg', 'pen', 'rof'] },
  { id: 'protection', name: 'Protection', statGroup: ['armor', 'hp', 'def'] },
  { id: 'support', name: 'Support', statGroup: ['rng', 'spd', 'acc', 'dodge'] },
];

export const SLOT_COUNT = SLOTS.length;

/** @param {string} statKey @returns {string|undefined} slot id that accepts it */
export function slotForStat(statKey) {
  const s = SLOTS.find((slot) => slot.statGroup.includes(statKey));
  return s ? s.id : undefined;
}

/** Classes that cannot equip anything. */
export const NO_EQUIPMENT_CLASSES = new Set(['gatherTruck']);

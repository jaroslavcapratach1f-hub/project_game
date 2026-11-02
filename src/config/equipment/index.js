/**
 * equipment/ barrel — the troop equipment system. Import from here.
 *
 * FLOW: parts are crafted / dropped -> slotted (EquipmentSlots) -> enhanced
 * (EquipmentModel) -> resolved to { equipmentPct, equipmentFlat } and passed
 * into StatResolution.resolveStat as the `equipmentPct` / `equipmentFlat`
 * layers. Family matches across slots trigger EquipmentSets bonuses.
 */

export * from './EquipmentSlots.js';
export * from './EquipmentParts.js';
export * from './EquipmentSets.js';
export * from './EquipmentModel.js';

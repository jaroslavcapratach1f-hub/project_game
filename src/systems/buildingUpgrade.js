/**
 * buildingUpgrade — pure upgrade preview/apply logic for BaseManager.upgrade
 * (GDD 04). Building upgrades are INSTANT — no timer; see BuildingConfig.js's
 * header for where real time actually belongs in this economy (Research,
 * material crafting). Split into preview (validate + quote, no mutation) and
 * complete (apply, already paid for) purely to keep BaseManager under the
 * 150-line cap — operates on a `buildings` array + `hqLevel` rather than
 * owning them, the `DynamicBarracks.js` pattern, no class of its own.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { effectiveMaxLevel, upgradeCost } from '../config/BuildingConfig.js';
import { requiredHqLevel, totalBuildPoints } from '../config/BuildingLevelOverrides.js';
import { commandCenterBpRequired } from '../config/CommandCenterConfig.js';

const HQ_ID = 'headquarters';

/** @param {object[]} buildings @param {string|number} ref @returns {?object} */
function resolve(buildings, ref) {
  if (typeof ref === 'number') return buildings[ref] ?? null;
  return buildings.find((b) => b.id === ref) ?? null;
}

/**
 * Quote + validate an upgrade without charging or applying it. The
 * headquarters ("Command Center") is additionally gated by Build Points
 * once a confirmed threshold exists for the target level (master-task
 * section 21: e.g. 785/805 cannot advance, 805/805 can) — any other
 * building only needs its own confirmed prerequisite, if any.
 * @param {object[]} buildings @param {number} hqLevel @param {string|number} ref
 * @returns {?{building:object,nextLevel:number,cost:object}} null if invalid
 */
export function previewUpgrade(buildings, hqLevel, ref) {
  const b = resolve(buildings, ref);
  if (!b) return null;
  const nextLevel = b.level + 1;
  if (nextLevel > effectiveMaxLevel(b.id, hqLevel)) return null;
  if (requiredHqLevel(b.id, nextLevel) > hqLevel) return null;
  if (b.id === HQ_ID) {
    const bpRequired = commandCenterBpRequired(nextLevel);
    if (bpRequired !== null && totalBuildPoints(buildings) < bpRequired) return null;
  }
  return { building: b, nextLevel, cost: upgradeCost(b.id, nextLevel) };
}

/**
 * Apply a level bump already paid for (BaseManager.upgrade, right after
 * `spend`). Does not check cost or the level cap — call `previewUpgrade`
 * first. @param {object[]} buildings
 * @param {import('../utils/EventEmitter.js').EventEmitter} events
 * @param {string|number} ref @returns {boolean}
 */
export function completeUpgrade(buildings, events, ref) {
  const b = resolve(buildings, ref);
  if (!b) return false;
  b.level += 1;
  events.emit(EVENTS.BUILDING_UPGRADED, { id: b.id, index: buildings.indexOf(b), level: b.level });
  return true;
}

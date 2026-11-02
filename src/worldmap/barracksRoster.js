/**
 * barracksRoster — the domain layer behind `ArmyMenu`: reads the live
 * Military Barracks instances off `BaseManager`, pairs each with its
 * `barracksTroops.js` counter and the personnel pool, and owns the two
 * mutations the panel can cause (train a replacement, free a slot on a
 * death). Split out of `ArmyMenu.js` purely to keep that file under the
 * 150-line cap — the panel stays view + tap routing.
 */
import { reserveCapacity } from '../config/ArmyMenuConfig.js';
import { ENTITY_COST } from '../config/PersonnelConfig.js';
import { trainingCost, trainingDuration } from '../config/TrainingConfig.js';
import { troopsTrained, trainTroop, loseTroop } from './barracksTroops.js';
import { startTrainingJob, activeTrainingJob, settleTrainingJob } from './trainingJobs.js';

const BARRACKS_ID = 'barracks';

/**
 * @param {object} site a `BaseSite`
 * @returns {object[]} the live Military Barracks instances, in build order
 */
export function barracksList(site) {
  return site.base.buildings.filter((b) => b.id === BARRACKS_ID);
}

/**
 * One barrack section's full display state.
 * @param {object} site a `BaseSite` @param {number} i slot index (0-based)
 * @returns {{built:boolean, cls?:string, trained?:number, capacity?:number, canTrain?:boolean, trainingRemainingMs?:number}}
 */
export function slotState(site, i) {
  const b = barracksList(site)[i];
  if (!b) return { built: false };
  const capacity = reserveCapacity(b.level);
  settleTrainingJob(i, capacity); // resolve any finished timer into a fielded troop before reading state
  const trained = troopsTrained(i, capacity);
  const job = activeTrainingJob(i);
  const cost = trainingCost(b.produces);
  const affordable = site.personnel.current >= (ENTITY_COST[b.produces] ?? 1) && site.resources.canAfford({ money: cost.money });
  return { built: true, cls: b.produces, trained, capacity, canTrain: !job && trained < capacity && affordable, trainingRemainingMs: job?.remainingMs ?? 0 };
}

/**
 * Pay the training cost (personnel + the confirmed Military Funds figure,
 * where one exists) and start a real timer (TrainingConfig.trainingDuration
 * — 0/instant for any class without a confirmed duration yet) for one more
 * troop at this barracks.
 * @param {object} site a `BaseSite` @param {number} i slot index
 * @returns {boolean} true if training was actually started/completed
 */
export function trainAt(site, i) {
  const b = barracksList(site)[i];
  if (!b) return false;
  const capacity = reserveCapacity(b.level);
  settleTrainingJob(i, capacity);
  if (activeTrainingJob(i)) return false;
  if (troopsTrained(i, capacity) >= capacity) return false;
  const cost = trainingCost(b.produces);
  if (!site.resources.canAfford({ money: cost.money })) return false;
  if (!site.personnel.consume(ENTITY_COST[b.produces] ?? 1)) return false;
  site.resources.spend({ money: cost.money });
  const duration = trainingDuration(b.produces);
  if (duration > 0) startTrainingJob(i, duration);
  else trainTroop(i, capacity);
  return true;
}

/**
 * A player unit died — free one barracks slot so its TRAIN button appears.
 * The death payload carries no barracks origin (no production pipeline links
 * a live Entity back to the barracks that built it), so this frees the first
 * barracks still holding troops.
 * @param {object} site a `BaseSite` @returns {boolean} true if a slot was freed
 */
export function freeOneSlot(site) {
  const list = barracksList(site);
  for (let i = 0; i < list.length; i++) {
    const capacity = reserveCapacity(list[i].level);
    if (troopsTrained(i, capacity) > 0) { loseTroop(i, capacity); return true; }
  }
  return false;
}

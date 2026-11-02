/**
 * trainingJobs — in-memory active-training-timer state, keyed by barracks
 * index (mirrors `barracksTroops.js`'s own Map pattern — no save system
 * exists anywhere in this codebase yet, so this resets on reload same as
 * everything else here). A real TimedJob sits between "cost paid" and
 * "troop actually fielded" (master-task section 12) — `settle` must run
 * before any read of trained-troop state so a finished job's troop shows
 * up without needing a live per-frame tick.
 */
import { remainingMs, isJobDone } from '../systems/TimedJob.js';
import { trainTroop } from './barracksTroops.js';

const MS_PER_SECOND = 1000;

/** @type {Map<number, {startedAt:number, durationMs:number}>} */
const jobs = new Map();

/** @param {number} index @param {number} durationSeconds @returns {void} */
export function startTrainingJob(index, durationSeconds) {
  jobs.set(index, { startedAt: Date.now(), durationMs: Math.max(0, durationSeconds) * MS_PER_SECOND });
}

/** @param {number} index @returns {?{remainingMs:number}} live job state, or null if none running */
export function activeTrainingJob(index) {
  const j = jobs.get(index);
  return j ? { remainingMs: remainingMs(j) } : null;
}

/**
 * Resolve a finished job for this slot into an actual fielded troop.
 * @param {number} index @param {number} capacity @returns {void}
 */
export function settleTrainingJob(index, capacity) {
  const j = jobs.get(index);
  if (j && isJobDone(j)) { jobs.delete(index); trainTroop(index, capacity); }
}

/** @returns {void} drop every running training timer */
export function resetTrainingJobs() { jobs.clear(); }

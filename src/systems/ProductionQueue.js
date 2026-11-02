/**
 * ProductionQueue — ONE Factory workshop's own material-crafting queue
 * (master-task section 10): up to `ENGINEERING.queueCapacityBase` jobs may
 * sit queued at once, but only the FIRST one actually crafts (timed) — a
 * workshop is always a single serial slot (confirmed: "Production
 * Workshop: 1" at Level 1 means exactly one concurrent craft, never
 * several); a 2nd/3rd/4th workshop is a wholly separate `ProductionQueue`
 * instance (see `EngineeringCenter`), not more concurrency within this
 * one. Timestamp-based (TimedJob) so progress survives background tabs /
 * frame hitches. NOT yet survived by a page reload — no save system exists
 * anywhere in this codebase yet, same honesty scope every other in-memory
 * system here already has.
 */
import { remainingMs, isJobDone, jobProgress } from './TimedJob.js';
import { ENGINEERING, materialCraftSeconds } from '../config/MaterialsConfig.js';

const MS_PER_SECOND = 1000;

export class ProductionQueue {
  /** @param {number} [engineeringLevel=1] */
  constructor(engineeringLevel = 1) {
    /** @private */ this._level = engineeringLevel;
    /** @private @type {{materialKey:string, startedAt:?number, durationMs:number}[]} */
    this._jobs = [];
  }

  /** @param {number} level @returns {void} */ setLevel(level) { this._level = level; }
  /** @returns {number} */ get capacity() { return ENGINEERING.queueCapacityBase; }
  /** @returns {number} jobs queued right now (crafting + waiting) */ get length() { return this._jobs.length; }

  /**
   * @param {string} materialKey @returns {boolean} enqueued (false if the queue is already full)
   */
  enqueue(materialKey) {
    if (this._jobs.length >= this.capacity) return false;
    const durationMs = materialCraftSeconds(materialKey, this._level) * MS_PER_SECOND;
    this._jobs.push({ materialKey, startedAt: null, durationMs });
    this._activateSlots();
    return true;
  }

  /**
   * Pop every finished job, crediting `onComplete` once each (in FIFO
   * order), then promote waiting jobs into any slot that just freed up.
   * @param {(materialKey:string)=>void} onComplete
   * @returns {void}
   */
  collect(onComplete) {
    while (this._jobs.length && this._jobs[0].startedAt !== null && isJobDone(this._jobs[0])) {
      onComplete(this._jobs.shift().materialKey);
    }
    this._activateSlots();
  }

  /** @returns {{materialKey:string, active:boolean, remainingMs:number, progress:number}[]} oldest first */
  snapshot() {
    return this._jobs.map((j) => ({
      materialKey: j.materialKey,
      active: j.startedAt !== null,
      remainingMs: j.startedAt !== null ? remainingMs(j) : j.durationMs,
      progress: j.startedAt !== null ? jobProgress(j) : 0,
    }));
  }

  /**
   * Drop one queued job by its position in `snapshot()` — the player
   * tapping a queued (not-yet-crafting) icon to cancel it.
   * @param {number} i @returns {boolean} removed
   */
  removeAt(i) {
    if (i < 0 || i >= this._jobs.length) return false;
    this._jobs.splice(i, 1);
    this._activateSlots();
    return true;
  }

  /** @returns {void} drop every queued job, crafting or waiting */
  clear() { this._jobs.length = 0; }

  /**
   * Force the active (index 0) job to finish right now — no Gold/cost model
   * exists yet (master-task anti-fabrication rule), so this is a free
   * placeholder until a real Rush economy is specified.
   * @returns {boolean} true if a job was actually rushed
   */
  rushActive() {
    if (!this._jobs.length || this._jobs[0].startedAt === null) return false;
    this._jobs[0].durationMs = 0;
    return true;
  }

  /** @private a workshop is always a single serial slot — start the timer on the front job only */
  _activateSlots() {
    if (this._jobs.length && this._jobs[0].startedAt === null) this._jobs[0].startedAt = Date.now();
  }
}

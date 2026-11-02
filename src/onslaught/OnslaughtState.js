/**
 * OnslaughtState — plain-data run state for one Onslaught event run (GDD 16).
 * The OnslaughtDirector owns the phase machine + event wiring; this just holds
 * the bookkeeping. No PixiJS. Mirrors the old src/skirmish/SkirmishState.js.
 */

/** @enum {string} idle -> incoming -> fighting -> pause -> ended */
export const ONSLAUGHT_PHASE = Object.freeze({
  IDLE: 'idle', INCOMING: 'incoming', FIGHTING: 'fighting', PAUSE: 'pause', ENDED: 'ended',
});

export class OnslaughtState {
  constructor() {
    /** @type {string} */ this.phase = ONSLAUGHT_PHASE.IDLE;
    /** @type {number} chosen alliance difficulty level (ONSLAUGHT_LEVELS id) */ this.levelId = 1;
    /** @type {number} 1-based wave being spawned / fought; 0 before the first */ this.waveNumber = 0;
    /** @type {number} ms left on the current phase timer (lead-in / pause) */ this.timerMs = 0;
    /** @type {number} waves whose last raider has died */ this.wavesCleared = 0;
    /** @type {?boolean} null until ENDED; true = full clear */ this.outcome = null;
    /** @private live raider ids for the current wave */ this._enemies = new Set();
  }

  /** @param {string} id @returns {void} */ addEnemy(id) { this._enemies.add(id); }
  /** @param {string} id @returns {void} */ remove(id) { this._enemies.delete(id); }
  /** @returns {number} live raiders left in the current wave */ get enemiesLeft() { return this._enemies.size; }
  /** @param {(id:string)=>void} cb @returns {void} */ forEachEnemy(cb) { this._enemies.forEach(cb); }
  /** Clear the current wave's raider roster (between waves). @returns {void} */ clearEnemies() { this._enemies.clear(); }

  /** Full reset for a fresh run. @returns {void} */
  reset() {
    this.phase = ONSLAUGHT_PHASE.IDLE;
    this.levelId = 1;
    this.waveNumber = 0;
    this.timerMs = 0;
    this.wavesCleared = 0;
    this.outcome = null;
    this._enemies.clear();
  }
}

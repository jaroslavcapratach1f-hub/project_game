/**
 * PersonnelManager — the global reserve personnel pool (GDD 06). Loop system.
 * Consumed on deploy, refunded on a VOLUNTARY dismantle (outside combat only),
 * deducted-never-refunded on a combat death, and regenerated over time from the
 * injected Reserves Barracks level. State is surfaced via events only — there
 * is no HUD yet.
 *
 * FORWARD: a Support/Doctrine "reserve recovery" research multiplier on the
 * regen rate; 30-day offline troop culling.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { CAPACITY, REGEN_TICK_SECONDS, regenPerTick } from '../config/PersonnelConfig.js';

const DEFAULT_LEVEL = 1;

export class PersonnelManager {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {{reservesBarracksLevel?:(number|(()=>number)), isInCombat?:()=>boolean}} [opts]
   *   reservesBarracksLevel: a fixed level or a getter (default 1);
   *   isInCombat: gate for refund() (default () => false).
   */
  constructor(events, opts = {}) {
    /** @private */ this._events = events;
    /** @private */ this._level = opts.reservesBarracksLevel ?? DEFAULT_LEVEL;
    /** @private */ this._isInCombat = opts.isInCombat ?? (() => false);
    /** @private resolved + clamped level */ this._lvl = this._readLevel();
    this.max = CAPACITY[this._lvl - 1];
    this.current = this.max;
    /** @private seconds banked toward the next regen tick */ this._acc = 0;
  }

  /**
   * Adopt the seeded Reserves Barracks level. The pool is constructed before the
   * base seeds its buildings, so the level read in the constructor can be stale
   * (level 1). Re-read it here; an untouched pool starts full at that capacity.
   * @returns {void}
   */
  enable() {
    this._acc = 0;
    this._lvl = this._readLevel();
    const cap = CAPACITY[this._lvl - 1];
    if (this.current === this.max) this.current = cap; // pristine → start full
    this.max = cap;
    this._emitChanged();
  }

  /** @returns {void} */
  disable() {}

  /** @returns {number} personnel added per REGEN_TICK_SECONDS at the current level */
  getRegenPerTick() { return regenPerTick(this._lvl); }

  /**
   * Spend personnel to deploy. Emits PERSONNEL_DENIED and returns false when the
   * pool is short; otherwise debits and emits PERSONNEL_CHANGED.
   * @param {number} amount @returns {boolean}
   */
  consume(amount) {
    if (this.current < amount) {
      this._events.emit(EVENTS.PERSONNEL_DENIED, { requested: amount, available: this.current });
      return false;
    }
    this.current -= amount;
    this._emitChanged();
    return true;
  }

  /**
   * Return personnel from a VOLUNTARY dismantle (GDD 06 RETURN_ON_DISMANTLE).
   * No-op (and warns) while isInCombat() — troops cannot be banked mid-fight.
   * @param {number} amount @returns {boolean} true if credited
   */
  refund(amount) {
    if (this._isInCombat()) {
      console.warn('[PersonnelManager] refund ignored — in combat');
      return false;
    }
    this.current = Math.min(this.max, this.current + amount);
    this._emitChanged();
    return true;
  }

  /**
   * Remove personnel for a COMBAT DEATH — never refunded (GDD 06
   * RETURN_ON_DESTROY = false); the pool keeps regenerating.
   * @param {number} amount @returns {void}
   */
  deduct(amount) {
    this.current = Math.max(0, this.current - amount);
    this._emitChanged();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._syncLevel();
    this._acc += dt;
    let changed = false;
    while (this._acc >= REGEN_TICK_SECONDS) {
      this._acc -= REGEN_TICK_SECONDS;
      if (this.current >= this.max) continue;
      this.current = Math.min(this.max, this.current + regenPerTick(this._lvl));
      changed = true;
    }
    if (changed) this._emitChanged();
  }

  /** @private injected level, clamped to 1..CAPACITY.length */
  _readLevel() {
    const raw = typeof this._level === 'function' ? this._level() : this._level;
    return Math.max(1, Math.min(CAPACITY.length, Math.round(raw)));
  }

  /** @private raise max (keep current) when the injected level goes up */
  _syncLevel() {
    const lvl = this._readLevel();
    if (lvl === this._lvl) return;
    this._lvl = lvl;
    if (CAPACITY[lvl - 1] > this.max) {
      this.max = CAPACITY[lvl - 1];
      this._emitChanged();
    }
  }

  /** @private */
  _emitChanged() {
    this._events.emit(EVENTS.PERSONNEL_CHANGED, {
      current: this.current, max: this.max, regenPerTick: this.getRegenPerTick(),
    });
  }
}

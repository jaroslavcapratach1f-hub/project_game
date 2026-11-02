/**
 * BaseHealth — the player base's hit points during an Onslaught run (GDD 16:
 * "Base HP reaching 0 just ends the run at the wave reached; HP regenerates
 * afterward"). Every live enemy standing inside the base compound sieges it for
 * `siegeDpsPerRaider`; with the footprint clear for `regenDelayMs` the base
 * heals at `regenPerSec`. Emits `ONSLAUGHT_BASE_HP` when the rounded percent
 * changes. Owned + ticked by OnslaughtDirector; no PixiJS.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { ONSLAUGHT } from '../config/OnslaughtConfig.js';
import { inBase } from '../systems/furyZone.js';

const MS_PER_SECOND = 1000;
const PLAYER = 'player';
const PERCENT = 100;

export class BaseHealth {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('../worldmap/WorldField.js').WorldField} field
   */
  constructor(events, entityManager, field) {
    this._events = events;
    this._em = entityManager;
    this._field = field;
    this._max = 0;
    this._hp = 0;
    this._calmMs = 0;
    this._lastPct = -1;
  }

  /** @returns {number} 0..1 */ get fraction() { return this._max > 0 ? this._hp / this._max : 1; }
  /** @returns {boolean} */ get depleted() { return this._max > 0 && this._hp <= 0; }

  /** Arm for a fresh run. @param {number} [maxHp=ONSLAUGHT.baseHp.max] @returns {void} */
  reset(maxHp = ONSLAUGHT.baseHp.max) {
    this._max = maxHp;
    this._hp = maxHp;
    this._calmMs = 0;
    this._lastPct = PERCENT;
  }

  /** Clear (run over). @returns {void} */
  stop() {
    this._max = 0;
    this._hp = 0;
    this._lastPct = -1;
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (this._max <= 0) return;
    const cfg = ONSLAUGHT.baseHp;
    let sieging = 0;
    this._em.forEach((e) => {
      if (e.team !== PLAYER && e.isAlive && !e.nonCombat && inBase(this._field, e, PLAYER)) sieging += 1;
    });
    if (sieging > 0) {
      this._hp = Math.max(0, this._hp - sieging * cfg.siegeDpsPerRaider * dt);
      this._calmMs = 0;
    } else {
      this._calmMs += dt * MS_PER_SECOND;
      if (this._calmMs >= cfg.regenDelayMs && this._hp < this._max) {
        this._hp = Math.min(this._max, this._hp + cfg.regenPerSec * dt);
      }
    }
    const pct = Math.round(this.fraction * PERCENT);
    if (pct !== this._lastPct) {
      this._lastPct = pct;
      this._events.emit(EVENTS.ONSLAUGHT_BASE_HP, { hp: Math.round(this._hp), maxHp: this._max, frac: this.fraction });
    }
  }
}

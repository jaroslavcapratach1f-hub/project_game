/**
 * BaseFury — the Base Fury aggro state (GDD 02), independent of Field Fury.
 * Trips ONLY when a unit standing inside a base footprint takes damage: that
 * base's garrison (every in-base unit of the defender's team) flips to
 * STANCE.BASE_FURY and focus-fires the first attacker until it dies or leaves,
 * then picks another at random (FURY.targetSwitchOnClear === 'random'). Stays
 * active FURY.baseFuryLingerSeconds after the last enemy leaves the footprint,
 * then emits FURY_BASE_ENDED. Field Fury skips in-base units, so a field-only
 * Fury never makes the garrison shoot. Never emits COMBAT_SHOT.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { STANCE } from '../entities/Entity.js';
import { FURY } from '../config/CombatConfig.js';
import { randomInt } from '../utils/MathUtils.js';
import { inBase } from './furyZone.js';

export class BaseFury {
  /**
   * @param {import('../entities/EntityManager.js').EntityManager} em
   * @param {import('../worldmap/WorldField.js').WorldField} bf
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(em, bf, events) {
    /** @private */ this._em = em;
    /** @private */ this._bf = bf;
    /** @private */ this._events = events;
    /** @private */ this._active = false;
    /** @private 'player' | 'enemy' — whose base is defending */ this._defender = null;
    /** @private */ this._attackerId = null;
    /** @private */ this._linger = 0;
    /** @private reused: live opposing units still in the footprint */ this._enemies = [];
    /** @private */ this._man = (e) => this._manOne(e);
    /** @private */ this._scanEnemy = (e) => this._scanEnemyOne(e);
    /** @private */ this._standDown = (e) => this._standDownOne(e);
  }

  /** @returns {boolean} */ get active() { return this._active; }

  /**
   * ENTITY_DAMAGED hook — trip if the victim stands in its own base footprint.
   * `victim.lastAttackerId` is stamped by FuryManager from COMBAT_SHOT.
   * @param {object} dmg @returns {void}
   */
  onDamage(dmg) {
    if (this._active) return;
    const v = this._em.get(dmg.id);
    if (!v || !inBase(this._bf, v)) return;
    this._active = true;
    this._defender = v.team;
    this._attackerId = v.lastAttackerId;
    this._linger = FURY.baseFuryLingerSeconds;
    this._em.forEach(this._man);
    this._events.emit(EVENTS.FURY_BASE_TRIGGERED, { attackerId: this._attackerId });
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this._active) return;
    this._refreshEnemies();
    if (!this._focusValid()) this._reassign();
    if (this._enemies.length > 0) this._linger = FURY.baseFuryLingerSeconds;
    else this._linger -= dt;
    if (this._linger <= 0) this._end();
  }

  /** @returns {void} */ reset() { if (this._active) this._end(); }

  /** @private flip one in-base defender into Base Fury, aimed at the current attacker */
  _manOne(e) {
    if (!e.isAlive || e.nonCombat || e.team !== this._defender || !inBase(this._bf, e)) return;
    e.stance = STANCE.BASE_FURY;
    const a = this._attackerId ? this._em.get(this._attackerId) : null;
    if (a && a.isAlive) e.setTarget(a);
  }

  /** @private rebuild the reused list of opposing units still inside the base */
  _refreshEnemies() {
    this._enemies.length = 0;
    this._em.forEach(this._scanEnemy);
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _scanEnemyOne(e) {
    if (e.isAlive && !e.nonCombat && e.team !== this._defender && inBase(this._bf, e, this._defender)) {
      this._enemies.push(e);
    }
  }

  /** @private is the focused attacker still a live enemy inside the base? */
  _focusValid() {
    const a = this._attackerId ? this._em.get(this._attackerId) : null;
    return Boolean(a && a.isAlive && this._enemies.includes(a));
  }

  /** @private focus lost — pick another attacker at random and re-aim the garrison */
  _reassign() {
    const next = this._enemies.length > 0
      ? this._enemies[randomInt(0, this._enemies.length - 1)]
      : null;
    this._attackerId = next ? next.id : null;
    this._em.forEach(this._man);
  }

  /** @private linger elapsed with the footprint clear — stand the garrison down */
  _end() {
    this._em.forEach(this._standDown);
    this._active = false;
    this._defender = null;
    this._attackerId = null;
    this._events.emit(EVENTS.FURY_BASE_ENDED, {});
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _standDownOne(e) {
    if (e.stance !== STANCE.BASE_FURY) return;
    e.stance = STANCE.CALM;
    e.clearTarget();
    e.aimPoint = null;
  }
}

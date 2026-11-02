/**
 * FuryManager — loop system composing the two independent aggro states from
 * GDD 02: FieldFury (out-of-base units, trips on the first shot) and BaseFury
 * (in-base units, trips when the base itself is hit). It owns the event
 * subscriptions, stamps each victim's `lastAttackerId` from COMBAT_SHOT, and
 * ticks both states every sim step. It sets stance + target on entities; it
 * never emits COMBAT_SHOT. Durations come from CombatConfig.FURY — nothing is
 * hardcoded here. Registered via loop.addSystem().
 */
import { EVENTS } from '../engine/GameEvents.js';
import { FieldFury } from './FieldFury.js';
import { BaseFury } from './BaseFury.js';

export class FuryManager {
  /**
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('../worldmap/WorldField.js').WorldField} battlefield
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(entityManager, battlefield, events) {
    /** @private */ this._em = entityManager;
    /** @private */ this._events = events;
    /** @private */ this._field = new FieldFury(entityManager, battlefield, events);
    /** @private */ this._base = new BaseFury(entityManager, battlefield, events);
    /** @private */ this._onShot = (s) => this._handleShot(s);
    /** @private */ this._onDamage = (d) => this._base.onDamage(d);
  }

  /** @returns {boolean} */ get fieldFuryActive() { return this._field.active; }
  /** @returns {boolean} */ get baseFuryActive() { return this._base.active; }

  /** @returns {void} */
  enable() {
    this._events.on(EVENTS.COMBAT_SHOT, this._onShot);
    this._events.on(EVENTS.ENTITY_DAMAGED, this._onDamage);
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._field.update(dt);
    this._base.update(dt);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.COMBAT_SHOT, this._onShot);
    this._events.off(EVENTS.ENTITY_DAMAGED, this._onDamage);
    this._field.reset();
    this._base.reset();
  }

  /** @private stamp the victim's last attacker, then let Field Fury try to trip */
  _handleShot(shot) {
    if (shot.targetId) {
      const victim = this._em.get(shot.targetId);
      if (victim) victim.lastAttackerId = shot.shooterId;
    }
    this._field.onShot(shot);
  }
}

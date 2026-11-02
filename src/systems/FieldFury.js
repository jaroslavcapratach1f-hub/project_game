/**
 * FieldFury — the Field Fury aggro state (GDD 02), independent of Base Fury.
 * Trips the moment ANY out-of-base unit fires its first CALM-stance shot: every
 * field unit of BOTH teams flips to STANCE.FIELD_FURY and points at the
 * initiator (allies skip the initiator per alliance immunity and take the
 * nearest enemy). While active, a unit with no valid target retargets via
 * Behaviors.pickTarget; a live already-set target (player drag-aim) is left
 * alone. Clears after FURY.fieldFuryLingerSeconds with no field-fury unit
 * holding a target in range. Never emits COMBAT_SHOT.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { STANCE } from '../entities/Entity.js';
import { FURY } from '../config/CombatConfig.js';
import { pickTarget } from '../ai/Behaviors.js';
import { inBase } from './furyZone.js';

export class FieldFury {
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
    /** @private */ this._linger = 0;
    /** @private */ this._shooter = null;
    /** @private */ this._held = false;
    /** @private reused candidate list */ this._list = [];
    /** @private */ this._pick = { id: null };
    /** @private */ this._gather = (e) => { if (e.isAlive) this._list.push(e); };
    /** @private */ this._flip = (e) => this._flipOne(e);
    /** @private */ this._service = (e) => this._serviceOne(e);
    /** @private */ this._standDown = (e) => this._standDownOne(e);
  }

  /** @returns {boolean} */ get active() { return this._active; }

  /**
   * COMBAT_SHOT hook — trip on the first CALM-stance shot from a field unit.
   * @param {object} shot @returns {void}
   */
  onShot(shot) {
    if (this._active) return;
    const shooter = this._em.get(shot.shooterId);
    if (!shooter || shooter.stance !== STANCE.CALM || inBase(this._bf, shooter)) return;
    this._active = true;
    this._linger = FURY.fieldFuryLingerSeconds;
    this._shooter = shooter;
    this._refillCandidates();
    this._em.forEach(this._flip);
    this._events.emit(EVENTS.FURY_FIELD_TRIGGERED, {
      initiatorId: shot.shooterId, targetId: shot.shooterId,
    });
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this._active) return;
    this._held = false;
    this._refillCandidates();
    this._em.forEach(this._service);
    this._linger = this._held ? FURY.fieldFuryLingerSeconds : this._linger - dt;
    if (this._linger <= 0) this._clear();
  }

  /** @returns {void} */ reset() { if (this._active) this._clear(); }

  /** @private every live combat unit -> the reused candidate list */
  _refillCandidates() {
    this._list.length = 0;
    this._em.forEach(this._gather);
  }

  /** @private trip-time: flip one field unit and give it its first target */
  _flipOne(e) {
    if (!e.isAlive || e.nonCombat || inBase(this._bf, e)) return;
    e.stance = STANCE.FIELD_FURY;
    if (e.team !== this._shooter.team) { e.setTarget(this._shooter); return; }
    const t = pickTarget(e, this._list, this._pick); // ally: nearest enemy, skips the initiator
    if (t) e.setTarget(t);
  }

  /** @private per-tick: keep a field-fury unit on a valid target; note if it holds one in range */
  _serviceOne(e) {
    if (e.stance !== STANCE.FIELD_FURY || !e.isAlive) return;
    const t = e.target;
    if (!t || !t.isAlive || t.team === e.team) e.setTarget(pickTarget(e, this._list, this._pick) || null);
    const cur = e.target;
    if (cur && cur.isAlive && e.getDistanceTo(cur) <= (e.rangePx ?? Infinity)) this._held = true;
  }

  /** @private linger elapsed — stand every field-fury unit down */
  _clear() {
    this._em.forEach(this._standDown);
    this._active = false;
    this._shooter = null;
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _standDownOne(e) {
    if (e.stance !== STANCE.FIELD_FURY) return;
    e.stance = STANCE.CALM;
    e.clearTarget();
    e.aimPoint = null;
  }
}

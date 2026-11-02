/**
 * AIController — per-enemy-unit state machine. Owns NO PixiJS. Drives MOVEMENT
 * and POSTURE only: it never calls fire() and never sets a firing target of its
 * own accord (CALM rule, GDD 02). ENGAGE is entered only while FuryManager
 * holds the entity at STANCE.FIELD_FURY; the unit's own _tryFire shoots.
 *
 *   IDLE    stationary; turret sweeps; re-scans for player units
 *   PATROL  walks injected waypoints at AI.PATROL.speedMult
 *   ALERT   player unit sighted: freeze recognitionDelayMs, raise "!", relax
 *   ENGAGE  Fury-gated: track a target, hold at idealRangeFrac * rangePx
 *   RETREAT hp fraction below AI.RETREAT.hpFrac: run home, stay until dead/home
 *
 * The state bodies live in AIStates.js (line cap); this file is the skeleton.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { STANCE } from '../entities/Entity.js';
import { resolvePath } from '../entities/entityMotion.js';
import { AI } from '../config/AIConfig.js';
import { AI_STATE } from './aiState.js';
import * as States from './AIStates.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;

const SPEED_MULT = {
  [AI_STATE.IDLE]: 1,
  [AI_STATE.PATROL]: AI.PATROL.speedMult,
  [AI_STATE.ALERT]: 1,
  [AI_STATE.ENGAGE]: 1,
  [AI_STATE.RETREAT]: AI.RETREAT.speedMult,
};

export class AIController {
  /**
   * @param {import('../entities/Entity.js').Entity} entity live enemy unit
   * @param {import('../worldmap/WorldField.js').WorldField} battlefield
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(entity, battlefield, events) {
    this.entity = entity;
    this.state = AI_STATE.IDLE;
    this.waypoints = [];
    this.wpIndex = 0;
    this.scanAcc = 0;
    this.alertAcc = 0;
    this.cooldownAcc = 0;
    this.sweepAcc = 0;
    /** reused Behaviors scratch */
    this.pick = { id: null };
    this.pos = { x: 0, y: 0 };
    this.aim = { x: 0, y: 0 };
    /** @private */ this._bf = battlefield;
    /** @private */ this._events = events;
    /** @private */ this._home = null;
    /** @private reused move-target for the no-battlefield fallback */ this._mt = { x: 0, y: 0 };
    /** @private last goTo() destination — A* only re-runs when it shifts */ this._dest = { x: Infinity, y: Infinity };
  }

  /**
   * Inject / replace the patrol route. A non-empty route promotes a plain IDLE
   * unit to PATROL.
   * @param {{x:number,y:number}[]} waypoints @returns {void}
   */
  setWaypoints(waypoints) {
    this.waypoints = waypoints || [];
    this.wpIndex = 0;
    if (this.state === AI_STATE.IDLE && this.waypoints.length > 0) this.enter(AI_STATE.PATROL);
  }

  /**
   * @param {number} dt seconds
   * @param {import('../entities/Entity.js').Entity[]} players live player-team units
   * @returns {void}
   */
  update(dt, players) {
    if (!this.entity.isAlive) return;
    if (this.cooldownAcc > 0) this.cooldownAcc -= dt * MS_PER_SECOND;
    this._gate();
    switch (this.state) {
      case AI_STATE.IDLE: States.idle(this, dt, players); break;
      case AI_STATE.PATROL: States.patrol(this, dt, players); break;
      case AI_STATE.ALERT: States.alert(this, dt); break;
      case AI_STATE.ENGAGE: States.engage(this, players); break;
      case AI_STATE.RETREAT: States.retreat(this); break;
      default: break;
    }
  }

  /** @private RETREAT + ENGAGE stance gates, evaluated before every state body */
  _gate() {
    const e = this.entity;
    if (this.state !== AI_STATE.RETREAT && e.hp / e.maxHp < AI.RETREAT.hpFrac) {
      this.enter(AI_STATE.RETREAT);
      return;
    }
    if (this.state === AI_STATE.RETREAT) return;
    const fury = e.stance === STANCE.FIELD_FURY;
    if (fury && this.state !== AI_STATE.ENGAGE) this.enter(AI_STATE.ENGAGE);
    else if (!fury && this.state === AI_STATE.ENGAGE) {
      this.enter(this.waypoints.length ? AI_STATE.PATROL : AI_STATE.IDLE);
    }
  }

  /** @param {string} next @returns {void} */
  enter(next) {
    if (next === this.state) return;
    const from = this.state;
    this.state = next;
    this.alertAcc = 0;
    this._dest.x = Infinity; // a new state must re-issue its own A* route

    const e = this.entity;
    e.moveSpeedMult = SPEED_MULT[next] ?? 1;
    if (next === AI_STATE.IDLE || next === AI_STATE.ALERT) e.stop();
    if (next !== AI_STATE.IDLE) e.lookAngle = null;
    if (next !== AI_STATE.ENGAGE && next !== AI_STATE.RETREAT) e.aimPoint = null;
    if (next === AI_STATE.PATROL || next === AI_STATE.IDLE) e.clearTarget();
    if (next === AI_STATE.RETREAT) this._beginRetreat();
    this._events.emit(EVENTS.AI_STATE_CHANGED, { id: e.id, from, to: next });
  }

  /** @private break contact: drop the fight, run for the enemy spawn centre */
  _beginRetreat() {
    const e = this.entity;
    e.clearTarget();
    e.aimPoint = null;
    e.stance = STANCE.CALM;
    const h = this.homePoint();
    this.goTo(h.x, h.y);
  }

  /** @returns {{x:number,y:number}} enemy spawn-zone centre in world px (cached) */
  homePoint() {
    if (this._home) return this._home;
    const r = this._bf.spawnColumns('enemy');
    this._home = this._bf.grid.axialToPixel((r.x0 + r.x1) * HALF, (r.y0 + r.y1) * HALF);
    return this._home;
  }

  /**
   * Send the entity to a world position via a terrain-aware A* route (the
   * Pathfinder — so patrols / retreats / repositioning route AROUND buildings,
   * trees and water instead of stalling on them). A* re-runs only when the
   * destination shifts past `repathMinDeltaPx` or the current route is spent,
   * so steady following stays alloc-free. Straight-line fallback with no
   * battlefield.
   * @param {number} x @param {number} y @returns {void}
   */
  goTo(x, y) {
    const e = this.entity;
    const moved = Math.abs(x - this._dest.x) + Math.abs(y - this._dest.y) > AI.movement.repathMinDeltaPx;
    if (!moved && e._path) return;
    this._dest.x = x;
    this._dest.y = y;
    if (e.battlefield) { resolvePath(e, x, y); return; }
    this._mt.x = x;
    this._mt.y = y;
    e.moveTarget = this._mt;
  }
}

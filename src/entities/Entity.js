/**
 * Entity — base field object: identity + combat data + lifecycle + a simple
 * straight-line move toward moveTarget. NO PixiJS: the visual is a separate
 * EntityView. The full damage pipeline (CombatConfig) belongs to a later
 * session; takeDamage() here just applies a final number.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { FACING } from '../config/CombatConfig.js';
import { ENTITY, VEHICLE } from '../config/EntityConfig.js';
import { DAMAGE_NUMBERS } from '../config/FeedbackConfig.js';
import { clamp, distance, angleBetween, degToRad } from '../utils/MathUtils.js';
import { resolvePath, pivotAndDrive, clearRoute } from './entityMotion.js';

const MS_PER_SECOND = 1000;
const HALF_TURN_DEG = 180;
const HALF = 0.5;

/** @enum {string} */
export const STANCE = { CALM: 'CALM', FIELD_FURY: 'FIELD_FURY', BASE_FURY: 'BASE_FURY' };

export class Entity {
  /**
   * @param {object} cfg { id, team, faction, cls, x, y, rotation?, hp, def,
   *   armor?, speedPx?, sightRangePx?, nonCombat?, events?, battlefield? }
   */
  constructor(cfg) {
    this.id = cfg.id;
    this.team = cfg.team; // 'player' | 'enemy'
    this.faction = cfg.faction;
    this.cls = cfg.cls;
    this.nonCombat = cfg.nonCombat ?? false; // no turret / target / fire path
    this.x = cfg.x;
    this.y = cfg.y;
    this.rotation = cfg.rotation ?? 0; // hull heading, radians (0 = +X)
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.def = cfg.def;
    this.armor = cfg.armor ?? [0, 0, 0];
    this.speed = cfg.speedPx ?? 0; // px/sec (already resolved + converted)
    this.moveSpeedMult = 1; // transient scalar on move speed (AI patrol / retreat; FORWARD: Fury meter)
    this.sightRangePx = cfg.sightRangePx ?? 0;
    // placeholder size multiplier (heavier armour reads bigger); single source
    // of truth for EntityView scale, the muzzle origin, and the hit radius.
    this.bodyScale = VEHICLE.body.scaleByClass[cfg.cls] ?? 1;
    this.isAlive = true;
    this.selected = false; // set by EntityManager; the ring is drawn by OrderIndicator
    this.stance = STANCE.CALM;
    /** @type {?string} id of the last unit whose shot targeted this one (AI self-defense) */
    this.lastAttackerId = null;
    /** @type {?Entity} */ this.target = null;
    /** @type {?{x:number,y:number}} */ this.moveTarget = null;
    // body pivot rate for the generic entity step (tanks use TankMotor instead)
    this.turnRateRadPerSec = degToRad(cfg.turnRateDegPerSec ?? VEHICLE.entityTurnDegPerSec);
    /** @package current Pathfinder route (world-px waypoints), or null — owned by entityMotion.js */
    this._path = null;
    /** @package index of the live waypoint within `_path` */
    this._pathIdx = 0;
    /** @package ms until entityMotion may re-path again after a blocked step */
    this._repathCoolMs = 0;
    /** @package S81: ms spent waiting for another unit's claim on the current waypoint's hex — owned by entityMotion.js */
    this._waitMs = 0;
    this.hitReactionRemaining = 0; // seconds
    /** @private */ this._events = cfg.events ?? null;
    /** @private */ this._battlefield = cfg.battlefield ?? null;
  }

  /**
   * Advance timers + straight-line movement.
   * @param {number} dt seconds @returns {void}
   */
  update(dt) {
    if (!this.isAlive) return;
    this._tickTimers(dt);
    this._stepMovement(dt);
  }

  /** @protected @param {number} dt seconds */
  _tickTimers(dt) {
    if (this.hitReactionRemaining > 0) this.hitReactionRemaining -= dt;
  }

  /** @private rotate-in-place toward the travel bearing, then drive straight;
   *  follows the stored Pathfinder route waypoint-by-waypoint (entityMotion.js) */
  _stepMovement(dt) {
    pivotAndDrive(this, dt);
  }

  /** @returns {?import('../worldmap/WorldField.js').WorldField} terrain source, if any */
  get battlefield() { return this._battlefield; }

  /**
   * Issue a move order. Resolves a terrain-aware Pathfinder route (when a
   * battlefield is attached) and drives it waypoint-by-waypoint; falls back to
   * a straight line with no battlefield; stays put if the goal is unreachable.
   * @param {number} x @param {number} y world px @returns {void}
   */
  moveTo(x, y) { resolvePath(this, x, y); }

  /** @returns {void} */
  stop() { clearRoute(this); }

  /** @param {?Entity} entity @returns {void} */
  setTarget(entity) { this.target = entity ?? null; }

  /** @returns {void} */
  clearTarget() { this.target = null; }

  /**
   * Apply an already-resolved damage number.
   * @param {number} finalAmount @param {string} [type] @param {?{x:number,y:number}} [sourcePos]
   * @returns {void}
   */
  takeDamage(finalAmount, type = 'generic', sourcePos = null) {
    if (!this.isAlive) return;
    this.hp = clamp(this.hp - finalAmount, 0, this.maxHp);
    this.hitReactionRemaining = ENTITY.hitReactionMs / MS_PER_SECOND;
    this._emit(EVENTS.ENTITY_DAMAGED, {
      id: this.id, amount: finalAmount, type, hp: this.hp,
      facing: sourcePos ? this.facingOf(sourcePos) : 'front',
      x: this.x, y: this.y, team: this.team,
      crit: finalAmount / this.maxHp >= DAMAGE_NUMBERS.critFrac,
    });
    if (this.hp <= 0) this.die();
  }

  /** @returns {void} */
  die() {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.target = null;
    clearRoute(this);
    this._battlefield?.occupancy.release(this.id);
    this._emit(EVENTS.ENTITY_DIED, {
      id: this.id, team: this.team, x: this.x, y: this.y, killerId: this.lastAttackerId,
    });
  }

  /**
   * Which armour facing a shot from sourcePos strikes (future damage model).
   * @param {{x:number,y:number}} sourcePos @returns {'front'|'side'|'rear'}
   */
  facingOf(sourcePos) {
    const rel = angleBetween(this.x, this.y, sourcePos.x, sourcePos.y) - this.rotation;
    const deg = Math.abs(Math.atan2(Math.sin(rel), Math.cos(rel))) * HALF_TURN_DEG / Math.PI;
    if (deg <= FACING.frontArc * HALF) return 'front';
    if (deg >= HALF_TURN_DEG - FACING.rearArc * HALF) return 'rear';
    return 'side';
  }

  /** @param {{x:number,y:number}} t @returns {number} px */
  getDistanceTo(t) { return distance(this.x, this.y, t.x, t.y); }

  /** @private @param {string} evt @param {object} payload */
  _emit(evt, payload) {
    if (this._events) this._events.emit(evt, payload);
  }
}

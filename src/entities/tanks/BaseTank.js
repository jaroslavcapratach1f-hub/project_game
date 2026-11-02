/**
 * BaseTank — an Entity that drives (TankMotor) and aims (TankTurret) and can
 * fire on cadence. CALM rule (GDD 02): it only ever fires at a `target` that
 * was set by an explicit ORDER_ATTACK — nothing here auto-acquires. fire()
 * emits COMBAT_SHOT + a placeholder muzzle flash; no projectile this session.
 */
import { Entity } from '../Entity.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { VEHICLE } from '../../config/EntityConfig.js';
import { WEAPON_ARCHETYPE_BY_CLASS } from '../../config/ProjectileConfig.js';
import { TankMotor } from './TankMotor.js';
import { TankTurret } from './TankTurret.js';

const MS_PER_SECOND = 1000;
const MUZZLE_FLASH_MS = 55;

export class BaseTank extends Entity {
  /**
   * @param {object} cfg Entity cfg + { rofShotsPerSec, rangePx, dmg, pen, aoe?,
   *   noTurret?, camoSightMult?,
   *   tuning:{ hullTurnDegPerSec, turretTurnDegPerSec, sightRangeTiles } }
   */
  constructor(cfg) {
    super(cfg);
    this.rof = cfg.rofShotsPerSec;
    this.rangePx = cfg.rangePx;
    this.dmg = cfg.dmg;
    this.pen = cfg.pen;
    this.aoe = cfg.aoe ?? 0; // splash radius, tiles (0 for a single-target gun)
    this.noTurret = cfg.noTurret ?? false; // fixed casemate gun — the hull aims
    this.camoSightMult = cfg.camoSightMult ?? 1; // FORWARD: future detection system
    this.furyChargePerSec = cfg.furyChargePerSec ?? 0; // FORWARD: unit Fury meter
    this.turretAngle = this.rotation; // radians, world space
    this.reloadRemaining = 0; // seconds
    this.muzzleFlashRemaining = 0; // seconds
    this.recoilOffsetPx = 0;
    /** @type {?number} world-space bearing to hold the barrel on with no target (AI IDLE sweep) */
    this.lookAngle = null;
    /** @type {?{x:number,y:number}} explicit aim point written by a controller (AI scatter); fire() emits it as targetX/Y */
    this.aimPoint = null;
    /** @private latched once the turret has recentred to hull-front for the CURRENT move order — re-armed when the move ends */
    this._hullReleased = false;
    /** @private */ this._motor = new TankMotor(cfg.tuning.hullTurnDegPerSec);
    /** @private */ this._turret = new TankTurret(this.noTurret ? 0 : cfg.tuning.turretTurnDegPerSec);
    /** @private reused COMBAT_SHOT payload — consumers read it synchronously */
    this._shot = {
      shooterId: null, targetId: null, originX: 0, originY: 0,
      dmg: 0, pen: 0, attackerCls: this.cls, aoePx: 0, weapon: 'shell', angle: 0,
      targetX: undefined, targetY: undefined,
    };
  }

  /**
   * @param {number} dt seconds @returns {void}
   */
  update(dt) {
    if (!this.isAlive) return;
    if (this.target && !this.target.isAlive) this.target = null;
    this._tickTimers(dt);
    // turret first: on a move order (target already cleared by ORDER_MOVE) it
    // recentres to hull-front; the hull stays frozen until it reports aligned
    // ONCE — then `_hullReleased` latches so the drive isn't choppy if the
    // turret lags the pivoting hull. The latch re-arms when the move ends.
    this._turret.update(dt, this);
    if (!this.moveTarget) this._hullReleased = false;
    else if (!this.target && this._turret.isFrontAligned(this, VEHICLE.turretFrontLockDeg)) {
      this._hullReleased = true;
    }
    const hullFree = !this.moveTarget || Boolean(this.target) || this._hullReleased;
    this._motor.update(dt, this, hullFree);
    this._tryFire();
    this.recoilOffsetPx = this._turret.recoilOffsetPx;
  }

  /** @protected @param {number} dt seconds */
  _tickTimers(dt) {
    super._tickTimers(dt);
    if (this.reloadRemaining > 0) this.reloadRemaining -= dt;
    if (this.muzzleFlashRemaining > 0) this.muzzleFlashRemaining -= dt;
  }

  /** @private fire only when ordered, in range, aligned, and reloaded */
  _tryFire() {
    const t = this.target;
    if (!t || !t.isAlive) return;
    if (this.getDistanceTo(t) > this.rangePx) return; // motor is closing the gap
    if (!this._turret.isOnTarget(VEHICLE.fireArcDeg)) return;
    if (this.reloadRemaining > 0) return;
    // The first CALM-stance shot on the field is what FuryManager watches for to
    // trip Field Fury (it subscribes to COMBAT_SHOT) — nothing to do here.
    this.fire();
  }

  /**
   * Discharge the main gun: reload, recoil, muzzle flash, and a COMBAT_SHOT
   * carrying the barrel-tip origin + this weapon's damage / archetype so the
   * ProjectileSystem can spawn a travelling shot. @returns {void}
   */
  fire() {
    this.reloadRemaining = 1 / this.rof;
    this.muzzleFlashRemaining = MUZZLE_FLASH_MS / MS_PER_SECOND;
    this._turret.fireRecoil();
    const len = VEHICLE.body.barrelLenPx * this.bodyScale; // muzzle at the scaled barrel tip
    const s = this._shot;
    s.shooterId = this.id;
    s.targetId = this.target ? this.target.id : null;
    s.originX = this.x + Math.cos(this.turretAngle) * len;
    s.originY = this.y + Math.sin(this.turretAngle) * len;
    s.dmg = this.dmg;
    s.pen = this.pen;
    s.aoePx = this.aoe * TILE_SIZE;
    s.weapon = WEAPON_ARCHETYPE_BY_CLASS[this.cls] ?? 'shell';
    s.angle = this.turretAngle;
    // a controller-supplied aim point (AI accuracy scatter) overrides unit tracking
    s.targetX = this.aimPoint ? this.aimPoint.x : undefined;
    s.targetY = this.aimPoint ? this.aimPoint.y : undefined;
    this._emit(EVENTS.COMBAT_SHOT, s);
  }
}

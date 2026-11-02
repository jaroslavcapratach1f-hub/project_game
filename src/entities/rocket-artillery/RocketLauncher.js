/**
 * RocketLauncher — a MOBILE (no-deploy) Entity that saturates a target area: on
 * an ORDER_ATTACK it slews the hull onto the target, and once aimed + in range
 * it empties its whole rack in a staggered salvo (one COMBAT_SHOT per rocket,
 * each scattered around the aim point via the optional `targetX/targetY`), then
 * sits through a long reload. CALM rule (GDD 02): never fires without a target
 * set by an explicit ORDER_ATTACK. Written generically; Katyusha is the only
 * subclass (Rocket Launcher is a Russia exclusive).
 */
import { Entity } from '../Entity.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { VEHICLE } from '../../config/EntityConfig.js';
import { ROCKET } from '../../config/ArtilleryConfig.js';
import { WEAPON_ARCHETYPE_BY_CLASS } from '../../config/ProjectileConfig.js';
import { WORLDMAP } from '../../config/WorldMapConfig.js';
import { hexCentreAt } from '../../engine/HexTargeting.js';
import { angleBetween, degToRad, randomRange } from '../../utils/MathUtils.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;

export class RocketLauncher extends Entity {
  /** @param {object} cfg rocketConfigFromRow output (Entity fields + weapon fields) */
  constructor(cfg) {
    super(cfg);
    this.dmg = cfg.dmg;
    this.rangePx = cfg.rangePx;
    this.aoe = cfg.aoe; // splash radius, tiles
    this.salvoSize = cfg.salvoSize;
    this.reloadSeconds = cfg.reloadSeconds;
    this.reloadRemaining = 0;
    this.backblastRemaining = 0;
    /** @private rockets still to launch this salvo */ this._salvoRemaining = 0;
    /** @private seconds until the next rocket */ this._salvoTimer = 0;
    /** @private next rack cell to fire from */ this._rackIndex = 0;
    /** @private one COMBAT_SHOT scratch reused across the whole salvo */
    this._shot = {
      shooterId: this.id, targetId: null, originX: 0, originY: 0,
      dmg: 0, pen: 0, attackerCls: this.cls, aoePx: 0,
      weapon: WEAPON_ARCHETYPE_BY_CLASS[this.cls] ?? 'rocket',
      angle: 0, targetX: null, targetY: null, hexSplash: true,
    };
  }

  /** @returns {number} rockets left to launch in the current salvo (0 = idle / reloading) */
  get salvoRemaining() { return this._salvoRemaining; }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this.isAlive) return;
    if (this.target && !this.target.isAlive) this.target = null;
    super.update(dt); // fully mobile — no deploy step
    this._faceTarget(dt);
    this._advanceSalvo(dt);
    if (this.reloadRemaining > 0) this.reloadRemaining -= dt;
    if (this.backblastRemaining > 0) this.backblastRemaining -= dt;
  }

  /** @private slew the hull toward the target at ROCKET.turnRateDegPerSec;
   *  a move order owns the heading (super.update) — don't fight it */
  _faceTarget(dt) {
    const t = this.target;
    if (!t || this.moveTarget) return;
    const rel = angleBetween(this.x, this.y, t.x, t.y) - this.rotation;
    const err = Math.atan2(Math.sin(rel), Math.cos(rel));
    const step = degToRad(ROCKET.turnRateDegPerSec) * dt;
    this.rotation += Math.abs(err) <= step ? err : Math.sign(err) * step;
  }

  /** @private fire the salvo rocket-by-rocket, then start the long reload */
  _advanceSalvo(dt) {
    if (this._salvoRemaining > 0) {
      if (!this.target || !this.target.isAlive) { this._endSalvo(); return; }
      this._salvoTimer -= dt;
      if (this._salvoTimer > 0) return;
      this._fireRocket();
      // += (not =) carries the sub-tick residual forward so a dt that doesn't
      // divide the stagger evenly can't stretch the salvo (fixed 20 Hz sim).
      this._salvoTimer += ROCKET.salvoStaggerMs / MS_PER_SECOND;
      this._salvoRemaining -= 1;
      if (this._salvoRemaining === 0) this.reloadRemaining = this.reloadSeconds;
      return;
    }
    const t = this.target;
    if (t && t.isAlive && this.reloadRemaining <= 0
      && this.getDistanceTo(t) <= this.rangePx && this._isAimed(t)) {
      this._salvoRemaining = this.salvoSize;
      this._salvoTimer = 0;
      this._rackIndex = 0;
    }
  }

  /** @private target within VEHICLE.fireArcDeg of the current hull facing? */
  _isAimed(t) {
    const err = angleBetween(this.x, this.y, t.x, t.y) - this.rotation;
    return Math.abs(Math.atan2(Math.sin(err), Math.cos(err))) <= degToRad(VEHICLE.fireArcDeg);
  }

  /** @private target lost mid-salvo — stop firing and pay the reload anyway */
  _endSalvo() {
    this._salvoRemaining = 0;
    this.reloadRemaining = this.reloadSeconds;
  }

  /** @private emit one rocket COMBAT_SHOT from the next rack cell, scattered */
  _fireRocket() {
    const t = this.target;
    const s = this._shot;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const fwd = VEHICLE.body.hullPx * HALF * this.bodyScale;
    const lane = (this._rackIndex - (this.salvoSize - 1) * HALF) * (ROCKET.rack.cellPx + ROCKET.rack.gapPx);
    s.shooterId = this.id;
    s.targetId = t.id;
    s.originX = this.x + cos * fwd - sin * lane;
    s.originY = this.y + sin * fwd + cos * lane;
    s.dmg = this.dmg;
    s.aoePx = this.aoe * TILE_SIZE;
    s.angle = this.rotation;
    // S71: saturate the target's HEX, same semantic as DeployableWeapon's
    // indirect fire — ProjectileImpact resolves against whoever is actually
    // standing in whichever hex each rocket lands in.
    const hex = hexCentreAt(t.x, t.y, WORLDMAP.hexSize);
    s.targetX = hex.x + randomRange(-ROCKET.scatterPx, ROCKET.scatterPx);
    s.targetY = hex.y + randomRange(-ROCKET.scatterPx, ROCKET.scatterPx);
    this.backblastRemaining = ROCKET.backblast.ms / MS_PER_SECOND;
    this._rackIndex += 1;
    this._emit(EVENTS.COMBAT_SHOT, s);
  }
}

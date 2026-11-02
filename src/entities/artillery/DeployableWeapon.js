/**
 * DeployableWeapon — an Entity that must SET UP before it can fire (GDD 02
 * DEPLOY). LIMBERED → (attack order) DEPLOYING → DEPLOYED → (move order)
 * UNDEPLOYING → LIMBERED. It only crawls while LIMBERED and only fires while
 * DEPLOYED. Howitzers (`indirect`) lob an arcing shell at a scattered ground
 * point; the AT gun fires a direct shell only within ±AT_GUN.firingArcDeg of its
 * set-up facing and gets a front-arc gun shield. CALM rule: fires only at an
 * ORDER_ATTACK `target`.
 */
import { Entity } from '../Entity.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { DEPLOY } from '../../config/CombatConfig.js';
import { DEPLOYABLE, HOWITZER, AT_GUN } from '../../config/ArtilleryConfig.js';
import { WEAPON_ARCHETYPE_BY_CLASS } from '../../config/ProjectileConfig.js';
import { WORLDMAP } from '../../config/WorldMapConfig.js';
import { hexCentreAt } from '../../engine/HexTargeting.js';
import { angleBetween, degToRad, randomRange } from '../../utils/MathUtils.js';

const MS_PER_SECOND = 1000;
const MUZZLE_FLASH_MS = 55;

/** @enum {string} */
export const DEPLOY_STATE = {
  LIMBERED: 'LIMBERED', DEPLOYING: 'DEPLOYING',
  DEPLOYED: 'DEPLOYED', UNDEPLOYING: 'UNDEPLOYING',
};

export class DeployableWeapon extends Entity {
  /** @param {object} cfg artilleryConfigFromRow output (Entity fields + weapon fields) */
  constructor(cfg) {
    super(cfg);
    this.rof = cfg.rofShotsPerSec;
    this.rangePx = cfg.rangePx;
    this.minRngPx = cfg.minRngPx;
    this.dmg = cfg.dmg;
    this.pen = cfg.pen;
    this.aoe = cfg.aoe; // splash radius, tiles
    this.indirect = cfg.indirect;
    this.shieldFrontMult = cfg.shieldFrontMult;
    this.deployState = DEPLOY_STATE.LIMBERED;
    this.deployProgress = 0; // 0..1
    this.reloadRemaining = 0;
    this.muzzleFlashRemaining = 0;
    /** @private queued move order, applied once fully undeployed */ this._pendingMove = null;
    /** @private reused COMBAT_SHOT payload */
    this._shot = {
      shooterId: this.id, targetId: null, originX: 0, originY: 0,
      dmg: 0, pen: 0, attackerCls: this.cls, aoePx: 0,
      weapon: WEAPON_ARCHETYPE_BY_CLASS[this.cls] ?? 'shell',
      angle: 0, targetX: null, targetY: null, hexSplash: false,
    };
  }

  /** Move orders: crawl if limbered, else pack up first. @param {number} x @param {number} y */
  moveTo(x, y) {
    if (this.deployState === DEPLOY_STATE.LIMBERED) { super.moveTo(x, y); return; }
    this._pendingMove = { x, y };
    this.clearTarget();
    if (this.deployState !== DEPLOY_STATE.UNDEPLOYING) this.deployState = DEPLOY_STATE.UNDEPLOYING;
  }

  /** Attack order: from LIMBERED, face the target and start setting up. @param {?Entity} t */
  setTarget(t) {
    super.setTarget(t);
    if (t && this.deployState === DEPLOY_STATE.LIMBERED) {
      this.rotation = angleBetween(this.x, this.y, t.x, t.y);
      this.stop();
      this.deployState = DEPLOY_STATE.DEPLOYING;
      this.deployProgress = 0;
    }
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this.isAlive) return;
    if (this.target && !this.target.isAlive) this.clearTarget();
    this._advanceDeploy(dt);
    if (this.deployState === DEPLOY_STATE.LIMBERED) super.update(dt);
    else this._tickTimers(dt);
    if (this.reloadRemaining > 0) this.reloadRemaining -= dt;
    if (this.muzzleFlashRemaining > 0) this.muzzleFlashRemaining -= dt;
    if (this.deployState === DEPLOY_STATE.DEPLOYED) this._tryFire();
  }

  /** @private drive deployProgress and the state transitions at its ends */
  _advanceDeploy(dt) {
    if (this.deployState === DEPLOY_STATE.DEPLOYING) {
      this.deployProgress += dt / DEPLOY.setupSeconds;
      if (this.deployProgress >= 1) { this.deployProgress = 1; this.deployState = DEPLOY_STATE.DEPLOYED; }
    } else if (this.deployState === DEPLOY_STATE.UNDEPLOYING) {
      this.deployProgress -= dt / DEPLOY.teardownSeconds;
      if (this.deployProgress <= 0) {
        this.deployProgress = 0;
        this.deployState = DEPLOY_STATE.LIMBERED;
        if (this._pendingMove) { super.moveTo(this._pendingMove.x, this._pendingMove.y); this._pendingMove = null; }
      }
    }
  }

  /** @private target alive, reloaded, in the min..max band, and (direct fire) in arc */
  _tryFire() {
    const t = this.target;
    if (!t || !t.isAlive || this.reloadRemaining > 0) return;
    const dist = this.getDistanceTo(t);
    if (dist < this.minRngPx || dist > this.rangePx) return;
    if (!this.indirect && !this._withinArc(t)) return;
    this.fire();
  }

  /** @private is the target within ±AT_GUN.firingArcDeg of the set-up facing? */
  _withinArc(t) {
    const rel = angleBetween(this.x, this.y, t.x, t.y) - this.rotation;
    const wrapped = Math.atan2(Math.sin(rel), Math.cos(rel));
    return Math.abs(wrapped) <= degToRad(AT_GUN.firingArcDeg);
  }

  /** Discharge: reload, muzzle flash, and a COMBAT_SHOT from the barrel tip.
   *  Indirect fire scatters an explicit ground aim point; direct fire tracks the
   *  unit (targetX/Y left null). @returns {void} */
  fire() {
    this.reloadRemaining = 1 / this.rof;
    this.muzzleFlashRemaining = MUZZLE_FLASH_MS / MS_PER_SECOND;
    const len = DEPLOYABLE.barrelLenPx[this.cls] * this.bodyScale;
    const s = this._shot;
    s.shooterId = this.id;
    s.targetId = this.target.id;
    s.originX = this.x + Math.cos(this.rotation) * len;
    s.originY = this.y + Math.sin(this.rotation) * len;
    s.dmg = this.dmg;
    s.pen = this.pen;
    s.aoePx = this.aoe * TILE_SIZE;
    s.angle = this.rotation;
    s.hexSplash = this.indirect;
    if (this.indirect) {
      // S71: lob at the target's HEX centre (not its raw live point) + scatter —
      // "targets specific hex territory"; ProjectileImpact resolves damage
      // against whoever is actually standing in whichever hex the shell lands
      // in, so a target that drives out before it lands takes no damage.
      const hex = hexCentreAt(this.target.x, this.target.y, WORLDMAP.hexSize);
      s.targetX = hex.x + randomRange(-HOWITZER.scatterPx, HOWITZER.scatterPx);
      s.targetY = hex.y + randomRange(-HOWITZER.scatterPx, HOWITZER.scatterPx);
    } else {
      s.targetX = s.targetY = null;
    }
    this._emit(EVENTS.COMBAT_SHOT, s);
  }

  /**
   * A deployed gun's shield halves a hit that lands in the front arc.
   * @param {number} amount @param {string} [type] @param {?{x:number,y:number}} [src]
   * @returns {void}
   */
  takeDamage(amount, type = 'generic', src = null) {
    let final = amount;
    if (src && this.deployState === DEPLOY_STATE.DEPLOYED
      && this.shieldFrontMult < 1 && this.facingOf(src) === 'front') {
      final *= this.shieldFrontMult;
    }
    super.takeDamage(final, type, src);
  }
}

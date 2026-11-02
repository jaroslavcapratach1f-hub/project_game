/**
 * InfantrySquad — an infantry-only COMPOSITE Entity that owns N Soldier structs.
 * The centroid (this.x/this.y) drives under Entity's straight-line move; each
 * soldier lerps toward its heading-rotated formation slot, so the group walks as
 * a loose block and re-forms after turns. CALM rule (GDD 02): soldiers fire only
 * at a `target` set by an explicit ORDER_ATTACK, in range, at staggered
 * intervals. Squad HP = sum of soldier HP; as it drops, soldiers die one-by-one.
 *
 * NOT a change to EntityManager / ProjectileSystem: a projectile hits the SQUAD
 * (bodyScale 1.4), damage is dealt to the squad, and takeDamage() culls soldiers
 * to match. FORWARD: garrison buildings, prone stance, walk-cycle animation,
 * per-soldier ballistic hit detection, personnel-driven count.
 */
import { Entity } from '../Entity.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { SQUAD } from '../../config/InfantryConfig.js';
import { angleBetween, randomRange, rotateToward } from '../../utils/MathUtils.js';
import { buildSoldiers } from './buildSoldiers.js';

export class InfantrySquad extends Entity {
  /**
   * @param {object} cfg squadConfigFromRow output: Entity fields + { soldierHp,
   *   dmg, rofShotsPerSec, rangePx, count }
   */
  constructor(cfg) {
    super({ ...cfg, hp: cfg.count * cfg.soldierHp });
    this.soldierHp = cfg.soldierHp;
    this.dmg = cfg.dmg;
    this.rofShotsPerSec = cfg.rofShotsPerSec;
    this.rangePx = cfg.rangePx;
    /** @type {import('./Soldier.js').Soldier[]} */
    this.soldiers = buildSoldiers({
      idPrefix: this.id, cx: this.x, cy: this.y, count: cfg.count,
      rotation: this.rotation, hp: cfg.soldierHp, rofShotsPerSec: cfg.rofShotsPerSec,
    });
    /** @private living-soldier counter (kept in sync, alloc-free reads) */
    this._living = cfg.count;
    /** @private reused COMBAT_SHOT payload — consumers read it synchronously */
    this._shot = {
      shooterId: this.id, targetId: null, originX: 0, originY: 0,
      dmg: cfg.dmg, pen: 0, attackerCls: this.cls, aoePx: 0, weapon: 'bullet', angle: 0,
    };
  }

  /** @returns {number} soldiers still alive */
  get livingCount() { return this._living; }

  /**
   * @param {number} dt seconds @returns {void}
   */
  update(dt) {
    if (!this.isAlive) return;
    if (this.target && !this.target.isAlive) this.target = null;
    super.update(dt); // centroid pivot-then-drive along the path + timers
    this._updateHeading(dt);
    this._followStep();
    this._faceStep(dt);
    this._fireStep(dt);
  }

  /** @private face a live target while stationary; on a move order the pivot-
   *  then-drive step (super.update) owns the heading — don't fight it */
  _updateHeading(dt) {
    const t = this.target;
    if (!t || !t.isAlive || this.moveTarget) return;
    const bearing = angleBetween(this.x, this.y, t.x, t.y);
    this.rotation = rotateToward(this.rotation, bearing, this.turnRateRadPerSec * dt);
  }

  /** @private lerp every living soldier toward its rotated formation slot, each at its OWN moveLerp (S56 — see Soldier.js's own doc) */
  _followStep() {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    for (let i = 0; i < this.soldiers.length; i++) {
      const s = this.soldiers[i];
      if (!s.isAlive) continue;
      const tx = this.x + s.slotX * cos - s.slotY * sin;
      const ty = this.y + s.slotX * sin + s.slotY * cos;
      const oldX = s.x, oldY = s.y;
      s.x += (tx - s.x) * s.moveLerp;
      s.y += (ty - s.y) * s.moveLerp;
      const dx = s.x - oldX, dy = s.y - oldY;
      const distance = Math.hypot(dx, dy);
      s.isWalking = distance > SQUAD.walkCycle.minStepPx;
      if (s.isWalking) {
        s.travelRotation = Math.atan2(dy, dx);
        s.walkPhase += distance / SQUAD.walkCycle.stridePx * Math.PI * 2;
      }
    }
  }

  /** @private each soldier eases its OWN displayed facing toward the squad heading at its own turn rate (S56) — not every soldier snapping to the identical value */
  _faceStep(dt) {
    for (let i = 0; i < this.soldiers.length; i++) {
      const s = this.soldiers[i];
      if (!s.isAlive) continue;
      const target = s.isWalking ? s.travelRotation : this.rotation;
      s.rotation = rotateToward(s.rotation, target, s.turnRateRadPerSec * dt);
    }
  }

  /** @private staggered per-soldier firing while an ORDER_ATTACK target is in range */
  _fireStep(dt) {
    const t = this.target;
    if (!t || !t.isAlive || this.getDistanceTo(t) > this.rangePx) return;
    const base = 1 / this.rofShotsPerSec;
    const fs = SQUAD.fireStagger;
    for (let i = 0; i < this.soldiers.length; i++) {
      const s = this.soldiers[i];
      if (!s.isAlive) continue;
      s.fireCooldown -= dt;
      if (s.fireCooldown <= 0) {
        this._fire(s);
        s.fireCooldown = base * randomRange(fs.min, fs.max);
      }
    }
  }

  /** @private emit one bullet COMBAT_SHOT from a soldier's muzzle */
  _fire(soldier) {
    const sh = this._shot;
    sh.targetId = this.target.id;
    sh.originX = soldier.x;
    sh.originY = soldier.y;
    sh.dmg = this.dmg;
    sh.angle = this.rotation;
    this._emit(EVENTS.COMBAT_SHOT, sh);
  }

  /**
   * Deal squad damage, then cull soldiers so the drawn count matches HP.
   * @param {number} amount @param {string} [type] @param {?{x:number,y:number}} [src]
   * @returns {void}
   */
  takeDamage(amount, type = 'generic', src = null) {
    super.takeDamage(amount, type, src); // clamps hp, emits ENTITY_DAMAGED, may die()
    const wantLiving = Math.max(0, Math.ceil(this.hp / this.soldierHp));
    while (this._living > wantLiving && this._killOne(src)) { /* cull to match HP */ }
  }

  /** @private kill the living soldier nearest `src` (or the last one); false if none */
  _killOne(src) {
    let victim = null;
    let bestD = Infinity;
    for (let i = this.soldiers.length - 1; i >= 0; i--) {
      const s = this.soldiers[i];
      if (!s.isAlive) continue;
      if (!src) { victim = s; break; } // no source: drop the last living soldier
      const d = (s.x - src.x) * (s.x - src.x) + (s.y - src.y) * (s.y - src.y);
      if (d < bestD) { bestD = d; victim = s; }
    }
    if (victim === null) return false;
    victim.isAlive = false;
    victim.hp = 0;
    this._living -= 1;
    return true;
  }
}

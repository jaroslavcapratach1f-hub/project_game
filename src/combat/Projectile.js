/**
 * Projectile — plain pooled data for one travelling shot. No PixiJS. The
 * matching body Graphics lives in ProjectileView; ProjectileMotion advances
 * this, ProjectileSystem owns the pool + collision.
 *
 * `baseX/baseY` are the pure-path position (straight line, or the arc's ground
 * track); `x/y` are the rendered position (wobble offset applied). `prevX/prevY`
 * are last frame's `x/y`, for swept collision. `heightPx` is the arc's visual
 * lift, read by the view.
 */
export class Projectile {
  constructor() {
    this.reset();
  }

  /** Zero every field and mark inactive. @returns {void} */
  reset() {
    this.active = false;
    this.weapon = 'shell';
    this.motion = 'straight';
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.baseX = 0;
    this.baseY = 0;
    this.vx = 0;
    this.vy = 0;
    this.speedPx = 0;
    this.originX = 0;
    this.originY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.heightPx = 0;
    this.elapsedSec = 0;
    this.dmg = 0;
    this.pen = 0;
    this.attackerCls = null; // shooter's UnitStats class — DamageResolver counters + pen
    this.aoePx = 0;
    this.hexSplash = false; // S71: indirect fire resolves splash by exact hex, not aoePx radius
    this.shooterId = null;
    this.targetId = null;
    this.arcT = 0;
    this.wobblePhase = 0;
  }
}

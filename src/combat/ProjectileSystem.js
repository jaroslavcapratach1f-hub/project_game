/**
 * ProjectileSystem — loop system that turns every COMBAT_SHOT into a pooled
 * travelling Projectile, integrates it (ProjectileMotion), tests it against
 * live entities (EntityManager.firstHitAlong) then blocked terrain, and hands
 * a reached shot to ProjectileImpact. Pools: Projectile + body/flash/shadow
 * Graphics (ProjectileView). The steady-state per-frame loop allocates nothing.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { TILE_SIZE } from '../config/GameConfig.js';
import { PROJECTILE, TRAIL } from '../config/ProjectileConfig.js';
import { Projectile } from './Projectile.js';
import { ProjectileView } from './ProjectileView.js';
import { ProjectileImpact } from './ProjectileImpact.js';
import { step as stepMotion } from './ProjectileMotion.js';

export class ProjectileSystem {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../effects/ParticleSystem.js').ParticleSystem} particles shared FX pool (trails)
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('../worldmap/WorldField.js').WorldField} battlefield
   */
  constructor(events, renderer, particles, entityManager, battlefield) {
    /** @private */ this._events = events;
    /** @private */ this._renderer = renderer;
    /** @private */ this._particles = particles;
    /** @private */ this._em = entityManager;
    /** @private */ this._bf = battlefield;
    /** @private */ this._view = new ProjectileView();
    /** @private */ this._impact = new ProjectileImpact(events, entityManager, this._view);
    /** @private @type {?ObjectPool} */ this._pool = null;
    /** @private @type {{proj:Projectile, body:object, shadow:?object}[]} */ this._active = [];
    /** @private reused segment-query for EntityManager.firstHitAlong */
    this._hitQuery = { excludeId: null, radiusPx: PROJECTILE.hitRadiusPx };
    /** @private trail-emission frame counter */ this._frame = 0;
    /** @private */ this._onShot = (shot) => this._spawn(shot);
  }

  /** @returns {number} projectiles currently travelling */
  get activeCount() { return this._active.length; }

  /** @returns {number} projectiles the pool has ever created (≈ poolSize ceiling in steady state) */
  get poolTotal() { return this._pool ? this._pool.getTotalCount() : 0; }

  /** @returns {void} */
  enable() {
    this._view.enable(this._renderer);
    this._pool = new ObjectPool(() => new Projectile(), resetProjectile, PROJECTILE.poolSize);
    this._events.on(EVENTS.COMBAT_SHOT, this._onShot);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.COMBAT_SHOT, this._onShot);
    for (let i = 0; i < this._active.length; i++) this._retire(this._active[i]);
    this._active.length = 0;
    this._view.clear();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._view.update(dt);
    this._frame++;
    let write = 0;
    for (let i = 0; i < this._active.length; i++) {
      const slot = this._active[i];
      const p = slot.proj;
      const reachedAim = stepMotion(p, dt);
      this._hitQuery.excludeId = p.shooterId;
      const hit = this._em.firstHitAlong(p.prevX, p.prevY, p.x, p.y, this._hitQuery);
      const terrain = PROJECTILE.terrainStopsProjectile && !this._bf.isPassable(p.x, p.y);
      const expired = p.elapsedSec > PROJECTILE.maxLifetimeSec;
      if (hit || terrain || reachedAim || expired) {
        this._impact.resolve(p, hit);
        this._retire(slot);
      } else {
        this._syncSlot(slot);
        this._active[write++] = slot;
      }
    }
    this._active.length = write;
  }

  /** @private position the body / shadow, drip fire + smoke trail particles */
  _syncSlot(slot) {
    const p = slot.proj;
    this._view.syncBody(slot.body, p, p.heightPx);
    if (slot.shadow) this._view.syncShadow(slot.shadow, p);
    const arch = PROJECTILE.archetypes[p.weapon];
    if ((arch.fireTrail || arch.smokeTrail) && this._frame % TRAIL.emitEveryFrames === 0) {
      const ty = p.y - p.heightPx;
      if (arch.fireTrail) this._particles.emitBurst(TRAIL.fire, p.x, ty, 1, TRAIL.fire.layer);
      if (arch.smokeTrail) this._particles.emitBurst(TRAIL.smoke, p.x, ty, 1, TRAIL.smoke.layer);
    }
  }

  /** @private @param {object} shot the COMBAT_SHOT payload (read synchronously) */
  _spawn(shot) {
    if (this._active.length >= PROJECTILE.poolSize) this._retire(this._active.shift());
    const arch = PROJECTILE.archetypes[shot.weapon] || PROJECTILE.archetypes.shell;
    const p = this._pool.acquire();
    this._configure(p, shot, arch);
    const body = this._view.acquireBody(p.weapon);
    const shadow = arch.groundShadow ? this._view.acquireShadow() : null;
    this._active.push({ proj: p, body, shadow });
  }

  /** @private write position + velocity + aim point into the pooled Projectile */
  _configure(p, shot, arch) {
    p.active = true;
    p.weapon = shot.weapon;
    p.motion = arch.motion;
    p.dmg = shot.dmg;
    p.pen = shot.pen;
    p.attackerCls = shot.attackerCls ?? null;
    p.aoePx = shot.aoePx;
    p.hexSplash = shot.hexSplash ?? false;
    p.shooterId = shot.shooterId;
    p.targetId = shot.targetId;
    p.originX = p.x = p.prevX = p.baseX = shot.originX;
    p.originY = p.y = p.prevY = p.baseY = shot.originY;
    p.speedPx = arch.speedTilesPerSec * TILE_SIZE;
    this._aimAt(p, shot);
    const dx = p.targetX - p.originX;
    const dy = p.targetY - p.originY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    p.vx = (dx / len) * p.speedPx;
    p.vy = (dy / len) * p.speedPx;
  }

  /** @private explicit aim point (indirect fire / scatter) wins; else chase the
   *  live target's pos (straight/wobble) or lock it (arc); else the angle fallback */
  _aimAt(p, shot) {
    if (typeof shot.targetX === 'number') {
      p.targetX = shot.targetX;
      p.targetY = shot.targetY;
      return;
    }
    const tgt = shot.targetId ? this._em.get(shot.targetId) : null;
    if (tgt && tgt.isAlive) {
      p.targetX = tgt.x;
      p.targetY = tgt.y;
      return;
    }
    const reach = p.aoePx > 0 ? p.aoePx : PROJECTILE.hitRadiusPx;
    p.targetX = shot.originX + Math.cos(shot.angle) * reach;
    p.targetY = shot.originY + Math.sin(shot.angle) * reach;
  }

  /** @private return the Projectile + its Graphics to their pools */
  _retire(slot) {
    this._view.releaseBody(slot.body);
    if (slot.shadow) this._view.releaseShadow(slot.shadow);
    this._pool.release(slot.proj);
  }
}

/** @param {Projectile} p */
function resetProjectile(p) {
  p.reset();
}

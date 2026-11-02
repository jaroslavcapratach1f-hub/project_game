/**
 * ProjectileView — the pooled placeholder Graphics behind projectiles: body
 * tracers on PROJECTILES, additive impact flashes on PARTICLES_HIGH, and arc
 * ground shadows on SHADOWS. Fire / smoke trails are emitted by ProjectileSystem
 * through the shared ParticleSystem. Every Graphics is pre-allocated in
 * enable(); acquire/sync/flash never allocate.
 */
import { Graphics } from 'pixi.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { PROJECTILE } from '../config/ProjectileConfig.js';

const HALF = 0.5;
const MS_PER_SECOND = 1000;

export class ProjectileView {
  constructor() {
    /** @private @type {Graphics[]} */ this._all = [];
    /** @private */ this._bodies = null;
    /** @private */ this._flashes = null;
    /** @private */ this._shadows = null;
    /** @private @type {{g:Graphics,ageMs:number}[]} */ this._activeFlashes = [];
    /** @private */ this._tick = 0;
  }

  /** @param {import('../engine/Renderer.js').Renderer} renderer @returns {void} */
  enable(renderer) {
    this._bodies = this._pool(renderer.layer('PROJECTILES'), PROJECTILE.poolSize);
    this._flashes = this._pool(renderer.layer('PARTICLES_HIGH'), PROJECTILE.flashPoolSize);
    this._shadows = this._pool(renderer.layer('SHADOWS'), PROJECTILE.shadowPoolSize);
  }

  /** @private @param {import('pixi.js').Container} layer @param {number} size */
  _pool(layer, size) {
    const mk = () => {
      const g = new Graphics();
      g.visible = false;
      layer.addChild(g);
      this._all.push(g);
      return g;
    };
    return new ObjectPool(mk, hide, size);
  }

  /** @param {string} weapon @returns {Graphics} a visible body tracer */
  acquireBody(weapon) {
    const a = PROJECTILE.archetypes[weapon];
    const g = this._bodies.acquire();
    g.clear();
    if (a.shape === 'oval') g.ellipse(0, 0, a.lenPx * HALF, a.widPx * HALF).fill(a.color);
    else g.rect(-a.lenPx * HALF, -a.widPx * HALF, a.lenPx, a.widPx).fill(a.color);
    g.blendMode = a.blendAdd ? 'add' : 'normal';
    g.visible = true;
    g.alpha = 1;
    return g;
  }

  /** @param {Graphics} g @returns {void} */
  releaseBody(g) { this._bodies.release(g); }

  /** @returns {Graphics} a visible ground shadow */
  acquireShadow() {
    const s = PROJECTILE.groundShadow;
    const g = this._shadows.acquire();
    g.clear().circle(0, 0, s.radiusPx).fill({ color: s.color, alpha: s.alpha });
    g.visible = true;
    return g;
  }

  /** @param {Graphics} g @returns {void} */
  releaseShadow(g) { this._shadows.release(g); }

  /**
   * @param {Graphics} g @param {import('./Projectile.js').Projectile} proj
   * @param {number} heightPx arc lift (0 for flat weapons) @returns {void}
   */
  syncBody(g, proj, heightPx) {
    g.position.set(proj.x, proj.y - heightPx);
    g.rotation = Math.atan2(proj.vy, proj.vx);
    const n = PROJECTILE.archetypes[proj.weapon].tracerEveryN;
    g.visible = n <= 1 || this._tick % n === 0;
  }

  /** @param {Graphics} g @param {import('./Projectile.js').Projectile} proj @returns {void} */
  syncShadow(g, proj) { g.position.set(proj.x, proj.y); }

  /** @param {number} x @param {number} y @returns {void} */
  flashAt(x, y) {
    const f = PROJECTILE.impactFlash;
    if (this._activeFlashes.length >= PROJECTILE.flashPoolSize) this._endFlash(0);
    const g = this._flashes.acquire();
    g.clear().circle(0, 0, f.radiusPx).fill({ color: f.color, alpha: 1 });
    if (f.blendAdd) g.blendMode = 'add';
    g.position.set(x, y);
    g.visible = true;
    g.alpha = 1;
    this._activeFlashes.push({ g, ageMs: 0 });
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._tick++;
    const ms = dt * MS_PER_SECOND;
    for (let i = this._activeFlashes.length - 1; i >= 0; i--) {
      const e = this._activeFlashes[i];
      e.ageMs += ms;
      if (e.ageMs >= PROJECTILE.impactFlash.ms) this._endFlash(i);
      else e.g.alpha = 1 - e.ageMs / PROJECTILE.impactFlash.ms;
    }
  }

  /** Release live flashes. @returns {void} */
  clear() {
    for (let i = 0; i < this._activeFlashes.length; i++) this._flashes.release(this._activeFlashes[i].g);
    this._activeFlashes.length = 0;
  }

  /** Destroy every pooled Graphics. @returns {void} */
  destroy() {
    this.clear();
    for (let i = 0; i < this._all.length; i++) {
      this._all[i].parent?.removeChild(this._all[i]);
      this._all[i].destroy();
    }
    this._all.length = 0;
  }

  /** @private swap-pop so update() stays allocation-free @param {number} i */
  _endFlash(i) {
    this._flashes.release(this._activeFlashes[i].g);
    this._activeFlashes[i] = this._activeFlashes[this._activeFlashes.length - 1];
    this._activeFlashes.pop();
  }
}

/** @param {Graphics} g */
function hide(g) {
  g.visible = false;
  g.alpha = 1;
  g.blendMode = 'normal';
}

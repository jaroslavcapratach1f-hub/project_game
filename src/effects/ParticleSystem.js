/**
 * ParticleSystem — a general pooled particle layer (loop system). Pre-allocates
 * PARTICLES.poolSize { Particle, Graphics } entries in enable(); emitBurst /
 * Emitter draw from the free list, update() integrates + redraws the active set
 * and returns finished entries to the pool. Zero allocation in update() after
 * enable(). Placeholder Graphics discs / rings — a ParticleContainer of tinted
 * sprites is the optimisation once a texture atlas exists (Sessions 30-33).
 */
import { Graphics } from 'pixi.js';
import { PARTICLES } from '../config/EffectsConfig.js';
import { randomRange } from '../utils/MathUtils.js';
import { Particle } from './Particle.js';
import { Emitter } from './Emitter.js';
import { stepParticle, drawParticle, initParticle } from './particleStep.js';

const TWO_PI = Math.PI * 2;
const FALLBACK_LAYER = 'PARTICLES_HIGH';
const UNIT_RADIUS = 1;
const WHITE = 0xffffff;
/** reused spawn scratch — no per-particle allocation */
const _pos = { x: 0, y: 0, vx: 0, vy: 0 };

export class ParticleSystem {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    /** @private */ this._renderer = renderer;
    /** @private @type {?Record<string,import('pixi.js').Container>} */ this._layers = null;
    /** @private @type {{p:Particle,g:Graphics}[]} */ this._pool = [];
    /** @private @type {{p:Particle,g:Graphics}[]} */ this._free = [];
    /** @private @type {{p:Particle,g:Graphics}[]} */ this._active = [];
    /** @private @type {Emitter[]} */ this._emitters = [];
    /** @private */ this._spawnFromEmitter = (cfg, x, y, vx, vy) => {
      _pos.x = x; _pos.y = y; _pos.vx = vx; _pos.vy = vy;
      this._spawn(cfg, _pos, cfg.layer);
    };
  }

  /** @returns {number} live particles */ get activeCount() { return this._active.length; }
  /** @returns {number} live continuous emitters */ get emitterCount() { return this._emitters.length; }

  /** Pre-allocate the pool onto the two particle layers. @returns {void} */
  enable() {
    this._layers = {
      PARTICLES_LOW: this._renderer.layer('PARTICLES_LOW'),
      PARTICLES_HIGH: this._renderer.layer('PARTICLES_HIGH'),
    };
    for (let i = 0; i < PARTICLES.poolSize; i++) {
      const g = new Graphics();
      g.visible = false;
      const entry = { p: new Particle(), g };
      this._pool.push(entry);
      this._free.push(entry);
    }
  }

  /**
   * Fire `count` one-shot particles from (x, y), each on a random dir at the
   * cfg's `speedPx` range (or still if it has none).
   * @param {object} cfg stage cfg @param {number} x @param {number} y
   * @param {number} count @param {string} layerName
   * @returns {void}
   */
  emitBurst(cfg, x, y, count, layerName) {
    const sp = cfg.speedPx;
    for (let i = 0; i < count; i++) {
      const dir = randomRange(0, TWO_PI);
      const speed = sp ? randomRange(sp[0], sp[1]) : 0;
      _pos.x = x; _pos.y = y;
      _pos.vx = Math.cos(dir) * speed;
      _pos.vy = Math.sin(dir) * speed;
      this._spawn(cfg, _pos, layerName);
    }
  }

  /** @param {object} emitterCfg @returns {void} */
  addEmitter(emitterCfg) {
    if (this._emitters.length < PARTICLES.maxEmitters) this._emitters.push(new Emitter(emitterCfg));
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    for (let i = this._emitters.length - 1; i >= 0; i--) {
      this._emitters[i].step(dt, this._spawnFromEmitter);
      if (this._emitters[i].done) this._emitters.splice(i, 1);
    }
    let w = 0;
    for (let i = 0; i < this._active.length; i++) {
      const e = this._active[i];
      if (stepParticle(e.p, dt)) {
        drawParticle(e.g, e.p);
        this._active[w++] = e;
      } else {
        this._release(e);
      }
    }
    this._active.length = w;
  }

  /** @private acquire + init one particle from `pos` scratch; honours PARTICLES.onFull when dry */
  _spawn(cfg, pos, layerName) {
    let entry = this._free.pop();
    if (!entry) {
      if (PARTICLES.onFull !== 'evictOldest' || this._active.length === 0) return;
      this._release(this._active.shift());
      entry = this._free.pop();
    }
    initParticle(entry.p, cfg, pos);
    // prime the Graphics ONCE per spawn: rings redraw per frame, discs are a
    // unit circle we only scale + tint afterwards (see drawParticle).
    if (entry.p.drawMode === 'ring') entry.g.clear();
    else entry.g.clear().circle(0, 0, UNIT_RADIUS).fill(WHITE);
    entry.g.visible = true;
    const layer = this._layers[layerName] || this._layers[cfg.layer] || this._layers[FALLBACK_LAYER];
    layer.addChild(entry.g);
    this._active.push(entry);
  }

  /** @private return one entry to the pool (reset the shared Graphics too) */
  _release(entry) {
    entry.g.parent?.removeChild(entry.g);
    entry.g.visible = false;
    entry.g.scale.set(UNIT_RADIUS);
    entry.g.tint = WHITE;
    entry.g.alpha = 1;
    entry.p.reset();
    this._free.push(entry);
  }

  /** Release every active particle + drop all emitters. @returns {void} */
  clear() {
    for (let i = 0; i < this._active.length; i++) this._release(this._active[i]);
    this._active.length = 0;
    this._emitters.length = 0;
  }

  /** Destroy every pooled Graphics. @returns {void} */
  destroy() {
    this.clear();
    for (let i = 0; i < this._pool.length; i++) {
      this._pool[i].g.parent?.removeChild(this._pool[i].g);
      this._pool[i].g.destroy();
    }
    this._pool.length = 0;
    this._free.length = 0;
    this._layers = null;
  }
}

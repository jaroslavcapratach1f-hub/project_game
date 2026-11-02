/**
 * DecalField — pooled ground decals (tracks / craters / scorch) on the DECALS
 * layer. The pool is pre-allocated in enable(); add() never allocates beyond
 * that fixed pool and evicts the oldest decal when the pool is exhausted.
 */
import { Graphics } from 'pixi.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { DECAL } from '../config/TerrainConfig.js';

const HALF = 0.5;
const ROUND_TYPES = { crater: true, scorch: true };

export class DecalField {
  constructor() {
    /** @private @type {?import('pixi.js').Container} */ this._layer = null;
    /** @private @type {Graphics[]} every pooled Graphics */ this._all = [];
    /** @private @type {Graphics[]} active decals, oldest first */ this._active = [];
    /** @private @type {?ObjectPool} */ this._pool = null;
  }

  /**
   * Pre-allocate DECAL.poolSize hidden Graphics onto `layer`.
   * @param {import('pixi.js').Container} layer the DECALS layer container
   * @returns {void}
   */
  enable(layer) {
    this._layer = layer;
    const mk = () => {
      const g = new Graphics();
      g.visible = false;
      layer.addChild(g);
      this._all.push(g);
      return g;
    };
    this._pool = new ObjectPool(mk, resetDecal, DECAL.poolSize);
  }

  /**
   * Stamp a decal at a WORLD-pixel point.
   * @param {string} type 'track' | 'crater' | 'scorch'
   * @param {number} worldX @param {number} worldY
   * @param {number} sizePx @param {number} [rotationRad=0]
   * @returns {void}
   */
  add(type, worldX, worldY, sizePx, rotationRad = 0) {
    if (!this._pool) return;
    if (this._active.length >= DECAL.poolSize) this._pool.release(this._active.shift());
    const g = this._pool.acquire();
    paint(g, type, sizePx);
    g.position.set(worldX, worldY);
    g.rotation = rotationRad;
    g.visible = true;
    this._active.push(g);
  }

  /** Release every active decal back to the pool. @returns {void} */
  clear() {
    if (!this._pool) return;
    for (let i = 0; i < this._active.length; i++) this._pool.release(this._active[i]);
    this._active.length = 0;
  }

  /** Stamp a projected wheel/tread/foot quad from reusable coordinates.
   * @param {string} type @param {Float32Array} corners @returns {void} */
  addGroundMark(type, corners) {
    if (!this._pool) return;
    if (this._active.length >= DECAL.poolSize) this._pool.release(this._active.shift());
    const g = this._pool.acquire();
    g.position.set(0, 0);
    g.poly(Array.from(corners)).fill(DECAL[type] ?? DECAL.track);
    g.visible = true;
    this._active.push(g);
  }

  /** Destroy every pooled Graphics. @returns {void} */
  destroy() {
    this.clear();
    for (let i = 0; i < this._all.length; i++) {
      this._all[i].parent?.removeChild(this._all[i]);
      this._all[i].destroy();
    }
    this._all.length = 0;
    this._pool = null;
    this._layer = null;
  }
}

/** @param {Graphics} g */
function resetDecal(g) {
  g.clear();
  g.visible = false;
  g.rotation = 0;
}

/**
 * Draw the decal shape centred on the local origin.
 * @param {Graphics} g @param {string} type @param {number} sizePx
 */
function paint(g, type, sizePx) {
  const style = DECAL[type] || DECAL.track;
  const half = sizePx * HALF;
  if (ROUND_TYPES[type]) g.ellipse(0, 0, half, half * HALF).fill(style);
  else g.rect(-half, -half * HALF, sizePx, sizePx * HALF).fill(style);
}

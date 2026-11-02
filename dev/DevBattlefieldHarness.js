/**
 * DevBattlefieldHarness — dev-only, deletable probe (gated by
 * RENDER.devBattlefield, mounted by Game like DevOrderHarness). Generates the
 * placeholder battle arena, mounts it on the TERRAIN / DECALS layers, fits the
 * camera bounds to it, centres on it, and drops a few demo decals. Also exposes
 * `window.bf` for the Session-4 console checks.
 */
import { WORLD, TILE_SIZE, BATTLEFIELD } from '../config/GameConfig.js';
import { generate } from '../world/MapGenerator.js';

const HALF = 0.5;
// A handful of demo decals so the DECALS layer is visibly populated (tile coords).
const DEMO_DECALS = [
  { type: 'track', tx: 12, ty: 30, size: 48, rot: 0.2 },
  { type: 'track', tx: 16, ty: 31, size: 48, rot: 0.2 },
  { type: 'crater', tx: 42, ty: 26, size: 40, rot: 0 },
  { type: 'scorch', tx: 55, ty: 34, size: 44, rot: 0.6 },
];

export class DevBattlefieldHarness {
  constructor() {
    /** @private @type {?import('../world/Battlefield.js').Battlefield} */ this._bf = null;
    /** @private @type {?import('./Camera.js').Camera} */ this._camera = null;
  }

  /** @returns {?import('../world/Battlefield.js').Battlefield} the mounted arena, if any */
  get battlefield() { return this._bf; }

  /**
   * Generate + mount the arena and centre the camera on it.
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('./Camera.js').Camera} camera
   * @returns {void}
   */
  enable(renderer, camera) {
    this._camera = camera;
    const bf = generate(BATTLEFIELD.seed);
    bf.mount(renderer);
    bf.redraw();
    camera.setWorldBounds(bf.widthPx, bf.heightPx);
    camera.moveTo(bf.widthPx * HALF, bf.heightPx * HALF, 0);
    for (let i = 0; i < DEMO_DECALS.length; i++) {
      const d = DEMO_DECALS[i];
      bf.addDecal(d.type, d.tx * TILE_SIZE, d.ty * TILE_SIZE, d.size, d.rot);
    }
    this._bf = bf;
    if (typeof window !== 'undefined') window.bf = bf;
  }

  /** Unmount the arena and restore the persistent-world camera bounds. @returns {void} */
  disable() {
    if (this._bf) {
      this._bf.unmount();
      this._bf.destroy();
      this._bf = null;
    }
    if (this._camera) {
      this._camera.setWorldBounds(WORLD.widthTiles * TILE_SIZE, WORLD.heightTiles * TILE_SIZE);
      this._camera = null;
    }
    if (typeof window !== 'undefined') delete window.bf;
  }
}

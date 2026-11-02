/**
 * DevHarness — dev-only probe for the camera + input work. Self-contained and
 * deletable: gated behind RENDER.devHarness, mounted by Game only while state
 * is MENU / BASE / WORLD. Drops a placeholder rect on the VEHICLES layer,
 * drifts it on a Lissajous path, has the camera follow it, and maps debug
 * triggers (keys 1/2/3, key f to re-follow, two-finger tap) to camera.shake.
 */
import { Graphics } from 'pixi.js';
import { TILE_SIZE, WORLD } from '../config/GameConfig.js';
import { EVENTS } from './GameEvents.js';
import { randomRange } from '../utils/MathUtils.js';

const RECT_PX = 48;
const RECT_HALF = 24;
const RECT_COLOR = 0xff6b35;
const HALF = 0.5;
const TWO_PI = Math.PI * 2;
const TWO_FINGERS = 2;
// Slow, centred Lissajous orbit tuned to stay within the eased follow's lag.
const PATH = { speed: 0.045, amplitudeTiles: 85, freqX: 1, freqY: 1.15, phaseY: 1 };

export class DevHarness {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('./Camera.js').Camera} camera
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(renderer, camera, events) {
    /** @private */ this._renderer = renderer;
    /** @private */ this._camera = camera;
    /** @private */ this._events = events;
    /** @private @type {?Graphics} */ this._rect = null;
    /** @private */ this._t = 0;
    /** @private */ this._cx = 0;
    /** @private */ this._cy = 0;
    /** @private */ this._ampX = 0;
    /** @private */ this._ampY = 0;
    this._onKey = this._onKey.bind(this);
    this._onTap = this._onTap.bind(this);
  }

  /** Mount the probe rect, start following it, and bind debug triggers. @returns {void} */
  enable() {
    this._cx = WORLD.widthTiles * TILE_SIZE * HALF;
    this._cy = WORLD.heightTiles * TILE_SIZE * HALF;
    this._ampX = PATH.amplitudeTiles * TILE_SIZE;
    this._ampY = PATH.amplitudeTiles * TILE_SIZE;
    const g = new Graphics().rect(-RECT_HALF, -RECT_HALF, RECT_PX, RECT_PX).fill(RECT_COLOR);
    g.position.set(this._cx, this._cy);
    this._renderer.layer('VEHICLES').addChild(g);
    this._rect = g;
    this._camera.follow(g);
    window.addEventListener('keydown', this._onKey);
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
  }

  /** Unmount and unbind everything. @returns {void} */
  disable() {
    if (this._rect) {
      this._rect.parent?.removeChild(this._rect);
      this._rect.destroy();
      this._rect = null;
    }
    window.removeEventListener('keydown', this._onKey);
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
  }

  /**
   * Advance the Lissajous path.
   * @param {number} dt seconds
   * @returns {void}
   */
  update(dt) {
    if (!this._rect) return;
    this._t += dt * PATH.speed;
    this._rect.position.set(
      this._cx + Math.sin(this._t * PATH.freqX) * this._ampX,
      this._cy + Math.sin(this._t * PATH.freqY + PATH.phaseY) * this._ampY,
    );
  }

  /** @private @param {KeyboardEvent} e */
  _onKey(e) {
    if (e.key === '1') this._camera.shake(1, 0, 'impact');
    else if (e.key === '2') this._camera.shake(1, 0, 'rumble');
    else if (e.key === '3') this._recoil();
    else if (e.key === 'f' && this._rect) this._camera.follow(this._rect);
  }

  /** @private random-direction recoil shake */
  _recoil() {
    const a = randomRange(0, TWO_PI);
    this._camera.shake(1, 0, 'recoil', Math.cos(a), Math.sin(a));
  }

  /** @private @param {{pointers:number}} p */
  _onTap(p) {
    if (p.pointers >= TWO_FINGERS) this._camera.shake(1, 0, 'impact');
  }
}

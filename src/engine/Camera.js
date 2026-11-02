/**
 * Camera — world-space viewport as plain data: {x,y} is the world-pixel point
 * shown at the screen centre, `zoom` is the linear scale, {offsetX,offsetY} is
 * the current shake displacement (read by the Renderer). It is NOT a PIXI
 * container — the Renderer folds these fields into its worldRoot transform.
 *
 * Each update resolves, by priority: eased move → follow-lerp → pan-target
 * lerp → eased zoom → world clamp → shake offset.
 */
import { TILE_SIZE, WORLD, CAMERA } from '../config/GameConfig.js';
import { clamp, lerp } from '../utils/MathUtils.js';
import { ScalarTween } from '../utils/ScalarTween.js';
import { CameraShake } from './CameraShake.js';

const HALF = 0.5;

export class Camera {
  constructor() {
    /** @type {number} world-pixel point shown at screen centre */ this.x = 0;
    /** @type {number} */ this.y = 0;
    /** @type {number} linear scale */ this.zoom = CAMERA.defaultZoom;
    /** @type {number} shake displacement, applied by the Renderer */ this.offsetX = 0;
    /** @type {number} */ this.offsetY = 0;
    /** @private */ this._targetX = 0;
    /** @private */ this._targetY = 0;
    /** @private */ this._viewW = 1;
    /** @private */ this._viewH = 1;
    /** @private world extent clampToWorld() keeps in view (see setWorldBounds) */
    this._boundsW = WORLD.widthTiles * TILE_SIZE;
    /** @private */ this._boundsH = WORLD.heightTiles * TILE_SIZE;
    /** @private pinch/zoom clamp range — CAMERA defaults, widened by setZoomLimits */
    this._zoomMin = CAMERA.minZoom;
    /** @private */ this._zoomMax = CAMERA.maxZoom;
    /** @private @type {?{x:number,y:number}} */ this._follow = null;
    /** @private */ this._followSmoothing = CAMERA.followSmoothing;
    /** @private */ this._tx = new ScalarTween();
    /** @private */ this._ty = new ScalarTween();
    /** @private */ this._tz = new ScalarTween();
    /** @private */ this._shake = new CameraShake();
    /** @private */ this._shakeOut = { x: 0, y: 0 };
  }

  /**
   * Set viewport size in CSS px (Renderer, on init + resize).
   * @param {number} w @param {number} h @returns {void}
   */
  setViewport(w, h) {
    this._viewW = w;
    this._viewH = h;
  }

  /** @returns {number} current viewport width, CSS px (`setViewport`) */ get viewW() { return this._viewW; }
  /** @returns {number} current viewport height, CSS px (`setViewport`) */ get viewH() { return this._viewH; }

  /** @returns {boolean} an eased `moveTo`/`setZoom` tween is still running */
  get isMoving() { return this._tx.active || this._ty.active || this._tz.active; }

  /**
   * Override the world extent clampToWorld() keeps the viewport inside.
   * Defaults to the persistent WORLD size; a bounded battle arena calls this
   * on load and restores WORLD on exit. Default behaviour is unchanged when
   * never called.
   * @param {number} widthPx @param {number} heightPx @returns {void}
   */
  setWorldBounds(widthPx, heightPx) {
    this._boundsW = widthPx;
    this._boundsH = heightPx;
    this.clampToWorld();
  }

  /**
   * Widen (or restore) the pinch/zoom clamp range. The single world map calls
   * this so the overview + "inside the base" zooms are reachable; the CAMERA
   * config values are the defaults.
   * @param {number} min @param {number} max @returns {void}
   */
  setZoomLimits(min, max) {
    this._zoomMin = min;
    this._zoomMax = max;
    this.zoom = clamp(this.zoom, min, max);
  }

  /**
   * Follow an object with numeric world-pixel .x/.y; null stops following.
   * @param {?{x:number,y:number}} target
   * @param {number} [smoothing=CAMERA.followSmoothing] @returns {void}
   */
  follow(target, smoothing = CAMERA.followSmoothing) {
    this._follow = target;
    this._followSmoothing = smoothing;
  }

  /**
   * Eased move to a world-pixel point; cancels follow.
   * @param {number} x @param {number} y
   * @param {number} [durationMs=CAMERA.moveDefaultMs] @returns {void}
   */
  moveTo(x, y, durationMs = CAMERA.moveDefaultMs) {
    this._follow = null;
    this._tx.start(this.x, x, durationMs);
    this._ty.start(this.y, y, durationMs);
    this._targetX = x;
    this._targetY = y;
  }

  /**
   * Eased zoom to a clamped level.
   * @param {number} level @param {number} [durationMs=CAMERA.zoomDefaultMs] @returns {void}
   */
  setZoom(level, durationMs = CAMERA.zoomDefaultMs) {
    this._tz.start(this.zoom, clamp(level, this._zoomMin, this._zoomMax), durationMs);
  }

  /**
   * Immediate zoom step that keeps a screen point fixed in world space.
   * @param {number} delta @param {number} focalScreenX @param {number} focalScreenY
   * @returns {void}
   */
  nudgeZoom(delta, focalScreenX, focalScreenY) {
    const old = this.zoom;
    const next = clamp(old + delta, this._zoomMin, this._zoomMax);
    if (next === old) return;
    const fx = focalScreenX - this._viewW * HALF;
    const fy = focalScreenY - this._viewH * HALF;
    const worldX = this.x + fx / old;
    const worldY = this.y + fy / old;
    this.zoom = next;
    this._tz.cancel();
    this.x = worldX - fx / next;
    this.y = worldY - fy / next;
    this._targetX = this.x;
    this._targetY = this.y;
    this.clampToWorld();
  }

  /**
   * Pan the target by a screen-pixel delta (drag gesture); cancels follow.
   * @param {number} screenDx @param {number} screenDy @returns {void}
   */
  panBy(screenDx, screenDy) {
    this._follow = null;
    this._tx.cancel();
    this._ty.cancel();
    this._targetX -= screenDx / this.zoom;
    this._targetY -= screenDy / this.zoom;
    this.clampToWorld();
  }

  /**
   * Trigger a shake (delegates to the owned CameraShake).
   * @param {number} [intensity=1] @param {number} [durationMs=0] @param {string} [type='impact']
   * @param {number} [dirX=0] @param {number} [dirY=0] @returns {void}
   */
  shake(intensity = 1, durationMs = 0, type = 'impact', dirX = 0, dirY = 0) {
    this._shake.trigger(intensity, durationMs, type, dirX, dirY);
  }

  /**
   * World-pixel -> screen-pixel (honours zoom + viewport centre).
   * @param {number} wx @param {number} wy @param {{x:number,y:number}} [out] @returns {{x:number,y:number}}
   */
  worldToScreen(wx, wy, out = { x: 0, y: 0 }) {
    out.x = (wx - this.x) * this.zoom + this._viewW * HALF;
    out.y = (wy - this.y) * this.zoom + this._viewH * HALF;
    return out;
  }

  /**
   * Screen-pixel -> world-pixel (honours zoom + viewport centre).
   * @param {number} sx @param {number} sy @param {{x:number,y:number}} [out] @returns {{x:number,y:number}}
   */
  screenToWorld(sx, sy, out = { x: 0, y: 0 }) {
    out.x = this.x + (sx - this._viewW * HALF) / this.zoom;
    out.y = this.y + (sy - this._viewH * HALF) / this.zoom;
    return out;
  }

  /**
   * Clamp position + pan-target so the viewport never shows past the world
   * edge; a world smaller than the view on an axis stays centred.
   * @returns {void}
   */
  clampToWorld() {
    const worldW = this._boundsW;
    const worldH = this._boundsH;
    const halfW = this._viewW * HALF / this.zoom;
    const halfH = this._viewH * HALF / this.zoom;
    const cx = worldW * HALF;
    const cy = worldH * HALF;
    const minX = Math.min(halfW, cx);
    const minY = Math.min(halfH, cy);
    this._targetX = clamp(this._targetX, minX, Math.max(worldW - halfW, cx));
    this._targetY = clamp(this._targetY, minY, Math.max(worldH - halfH, cy));
    this.x = clamp(this.x, minX, Math.max(worldW - halfW, cx));
    this.y = clamp(this.y, minY, Math.max(worldH - halfH, cy));
  }

  /**
   * Per-sim-step integration: position, zoom, clamp, then shake offset.
   * @param {number} dt seconds @returns {void}
   */
  update(dt) {
    this._integratePosition(dt);
    if (this._tz.active) this.zoom = this._tz.step(dt);
    this.clampToWorld();
    this._shake.update(dt, this._shakeOut);
    this.offsetX = this._shakeOut.x;
    this.offsetY = this._shakeOut.y;
  }

  /**
   * Resolve position from the highest-priority active source.
   * @private @param {number} dt seconds
   */
  _integratePosition(dt) {
    if (this._tx.active) {
      this.x = this._tx.step(dt);
      this.y = this._ty.step(dt);
    } else if (this._follow) {
      this.x = lerp(this.x, this._follow.x, this._followSmoothing);
      this.y = lerp(this.y, this._follow.y, this._followSmoothing);
    } else {
      this.x = lerp(this.x, this._targetX, CAMERA.panLerp);
      this.y = lerp(this.y, this._targetY, CAMERA.panLerp);
      return;
    }
    this._targetX = this.x;
    this._targetY = this.y;
  }
}

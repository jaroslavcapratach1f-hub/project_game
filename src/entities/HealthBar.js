/**
 * HealthBar — one world-space placeholder bar Graphics on a caller layer
 * (WORLD_UI). Stateful + ticked: the true fraction drops instantly on a hit
 * while a white "ghost" slice trails behind and slides down to meet it; the
 * whole bar alpha-pulses when critical; visibility follows hideAtFull /
 * showWhenSelected. All colours / sizes from ENTITY.healthBar. Created once;
 * setters + tick() mutate only.
 */
import { Graphics } from 'pixi.js';
import { ENTITY } from '../config/EntityConfig.js';
import { clamp, lerp } from '../utils/MathUtils.js';

const HALF = 0.5;
const MS_PER_SECOND = 1000;
const TWO_PI = Math.PI * 2;

export class HealthBar {
  /** @param {import('pixi.js').Container} layer usually renderer.layer('WORLD_UI') */
  constructor(layer) {
    /** @private */ this._g = new Graphics();
    layer.addChild(this._g);
    /** @private true fraction 0..1 */ this._real = 1;
    /** @private trailing white fraction (>= real while a hit lags) */ this._ghost = 1;
    /** @private */ this._ghostDelayMs = 0;
    /** @private */ this._selected = false;
    /** @private */ this._critPhase = 0;
    this._redraw();
  }

  /**
   * Set the true fraction. A drop seeds the ghost at the pre-hit level; a rise
   * (heal / regen) snaps the ghost with it.
   * @param {number} f 0..1 @returns {void}
   */
  setFraction(f) {
    const k = clamp(f, 0, 1);
    if (k < this._real) {
      if (this._ghost <= this._real) {
        this._ghost = this._real;
        this._ghostDelayMs = ENTITY.healthBar.ghost.delayMs;
      }
    } else if (k > this._real) {
      this._ghost = k;
    }
    this._real = k;
    if (this._ghost < this._real) this._ghost = this._real;
  }

  /** @param {boolean} on @returns {void} */
  setSelected(on) { this._selected = on; }

  /** @param {number} x @param {number} y @returns {void} */
  setPosition(x, y) { this._g.position.set(x, y); }

  /** @param {boolean} hidden hard override (used by the wreck fade) @returns {void} */
  setHidden(hidden) { this._g.visible = !hidden; }

  /**
   * Advance the ghost catch-up + critical pulse, then redraw.
   * @param {number} dtSeconds @returns {void}
   */
  tick(dtSeconds) {
    const ms = dtSeconds * MS_PER_SECOND;
    if (this._ghostDelayMs > 0) {
      this._ghostDelayMs -= ms;
    } else if (this._ghost > this._real) {
      const step = ms / ENTITY.healthBar.ghost.catchUpMs;
      this._ghost = Math.max(this._real, this._ghost - step);
    }
    this._critPhase = (this._critPhase + TWO_PI * ENTITY.healthBar.critical.pulseHz * dtSeconds) % TWO_PI;
    this._redraw();
  }

  /** @private bg -> ghost slice -> fill -> dividers -> visibility + crit alpha */
  _redraw() {
    const hb = ENTITY.healthBar;
    const g = this._g.clear();
    const x0 = -hb.widthPx * HALF;
    g.rect(x0, 0, hb.widthPx, hb.heightPx).fill(hb.bg);
    if (this._ghost > this._real) {
      const gx = x0 + hb.widthPx * this._real;
      g.rect(gx, 0, hb.widthPx * (this._ghost - this._real), hb.heightPx).fill(hb.ghost.color);
    }
    g.rect(x0, 0, hb.widthPx * this._real, hb.heightPx).fill(bandColor(this._real, hb));
    drawDividers(g, x0, hb);
    this._applyVisibility(hb);
  }

  /** @private visibility rule + sub-critical alpha oscillation */
  _applyVisibility(hb) {
    this._g.visible = !hb.hideAtFull || this._real < 1 || (hb.showWhenSelected && this._selected);
    const crit = hb.critical;
    if (this._real < crit.belowFrac) {
      this._g.alpha = lerp(crit.minAlpha, 1, HALF + HALF * Math.sin(this._critPhase));
    } else {
      this._g.alpha = 1;
    }
  }

  /** @returns {void} */
  destroy() {
    this._g.parent?.removeChild(this._g);
    this._g.destroy();
  }
}

/** @param {number} frac @param {object} hb ENTITY.healthBar @returns {number} colour */
function bandColor(frac, hb) {
  if (frac >= hb.midFrac) return hb.fill;
  if (frac >= hb.lowFrac) return hb.midColor;
  return hb.low;
}

/** @param {Graphics} g @param {number} x0 @param {object} hb */
function drawDividers(g, x0, hb) {
  if (hb.segments <= 1) return;
  for (let i = 1; i < hb.segments; i++) {
    const x = x0 + (hb.widthPx * i) / hb.segments - hb.dividerPx * HALF;
    g.rect(x, 0, hb.dividerPx, hb.heightPx).fill(hb.dividerColor);
  }
}

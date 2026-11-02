/**
 * ReloadCountdown — one world-space Text label showing the seconds left
 * before a weapon can fire again (`e.reloadRemaining`). A digit countdown,
 * not a progress bar — the user's own explicit call. Visible only while
 * the unit is SELECTED and actually reloading, mirroring HealthBar's own
 * showWhenSelected convention so a battlefield of simultaneously-reloading
 * units doesn't clutter up with floating numbers. Shared by every vehicle/
 * artillery/launcher view — created once; update() mutates only.
 */
import { Text, TextStyle } from 'pixi.js';
import { ENTITY } from '../config/EntityConfig.js';

const HALF = 0.5;
const DECIMAL_PLACES = 1;

export class ReloadCountdown {
  /** @param {import('pixi.js').Container} layer usually renderer.layer('WORLD_UI') */
  constructor(layer) {
    const c = ENTITY.reloadCountdown;
    this._t = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: c.fontFamily, fontSize: c.fontSizePx, fill: c.color,
        stroke: { color: c.strokeColor, width: c.strokeWidthPx },
      }),
    });
    this._t.anchor.set(HALF, 1);
    this._t.visible = false;
    layer.addChild(this._t);
  }

  /** @param {number} x @param {number} y entity position — offsetY is applied internally @returns {void} */
  setPosition(x, y) { this._t.position.set(x, y + ENTITY.reloadCountdown.offsetY); }

  /** @param {number} remaining seconds left, `e.reloadRemaining` @param {boolean} selected @returns {void} */
  update(remaining, selected) {
    const show = selected && remaining > 0;
    this._t.visible = show;
    if (show) this._t.text = remaining.toFixed(DECIMAL_PLACES);
  }

  /** @param {boolean} hidden hard override (used by the wreck fade) @returns {void} */
  setHidden(hidden) { if (hidden) this._t.visible = false; }

  /** @returns {void} */
  destroy() {
    this._t.parent?.removeChild(this._t);
    this._t.destroy();
  }
}

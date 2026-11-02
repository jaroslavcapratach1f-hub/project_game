/**
 * RadialOption — one circular button in the long-press RadialMenu. Screen-
 * space (lives on the HUD layer). Placeholder art: a coloured disc with a
 * single-letter label until real icons exist.
 */
import { Container, Graphics, Text } from 'pixi.js';
import { ORDERS } from '../config/OrdersConfig.js';

const STROKE_PX = 2;
const STROKE_COLOR = 0x0a0a08;   // near-black outline (matches RENDER.backgroundColor)
const LABEL_COLOR = 0xffffff;    // REVIEW: placeholder letter icon
const LABEL_SIZE_PX = 14;
const ANCHOR_CENTER = 0.5;

export class RadialOption {
  /**
   * @param {number} color disc fill colour (ORDERS.radial.<verb>.color)
   * @param {string} letter single-character placeholder icon
   */
  constructor(color, letter) {
    const r = ORDERS.radial.optionRadiusPx;
    /** @private */ this._root = new Container();
    /** @private */ this._x = 0;
    /** @private */ this._y = 0;
    const disc = new Graphics().circle(0, 0, r).fill({ color }).stroke({ width: STROKE_PX, color: STROKE_COLOR });
    const label = new Text({ text: letter, style: { fill: LABEL_COLOR, fontSize: LABEL_SIZE_PX, fontFamily: 'monospace' } });
    label.anchor.set(ANCHOR_CENTER);
    this._root.addChild(disc, label);
  }

  /** @returns {Container} display root (target for GSAP scale tweens) */
  get view() {
    return this._root;
  }

  /** @param {Container} parent @returns {void} */
  mount(parent) {
    parent.addChild(this._root);
  }

  /**
   * @param {number} x @param {number} y position within the menu root (screen px)
   * @returns {void}
   */
  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._root.position.set(x, y);
  }

  /**
   * @param {number} x @param {number} y menu-local screen px
   * @returns {boolean} inside the option's hit radius
   */
  contains(x, y) {
    const dx = x - this._x;
    const dy = y - this._y;
    const r = ORDERS.radial.optionRadiusPx;
    return dx * dx + dy * dy <= r * r;
  }

  /** @returns {void} */
  destroy() {
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }
}

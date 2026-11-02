/**
 * RadialMenu — long-press tactical menu (GDD 02). Screen-space: lives on the
 * HUD layer, works in raw SCREEN px, no camera conversion. Three options —
 * Recall (top), Hold (left), Follow (right) — scale in from the centre with
 * GSAP. A tap on an option fires its handler and closes; a tap elsewhere
 * (routed in by OrderController) closes with no order.
 */
import { Container } from 'pixi.js';
import gsap from 'gsap';
import { ORDERS } from '../config/OrdersConfig.js';
import { RadialOption } from './RadialOption.js';

const MS_PER_SECOND = 1000;

export class RadialMenu {
  /** @param {Container} hudLayer the HUD (screen-space) layer container */
  constructor(hudLayer) {
    /** @private */ this._root = new Container();
    this._root.visible = false;
    hudLayer.addChild(this._root);
    /** @private */ this._open = false;
    /** @private @type {?object} */ this._handlers = null;
    /** @private */ this._recall = new RadialOption(ORDERS.radial.recall.color, 'R');
    /** @private */ this._hold = new RadialOption(ORDERS.radial.hold.color, 'H');
    /** @private */ this._follow = new RadialOption(ORDERS.radial.follow.color, 'F');
    /** @private */ this._options = [this._recall, this._hold, this._follow];
    for (let i = 0; i < this._options.length; i++) this._options[i].mount(this._root);
  }

  /** @returns {boolean} */
  get isOpen() {
    return this._open;
  }

  /**
   * Open the menu centred at a screen point.
   * @param {number} sx @param {number} sy SCREEN px
   * @param {{onRecall:Function,onHold:Function,onFollow:Function}} handlers
   * @returns {void}
   */
  open(sx, sy, handlers) {
    this._handlers = handlers;
    this._root.position.set(sx, sy);
    const r = ORDERS.radial.menuRadiusPx;
    this._recall.setPosition(0, -r);
    this._hold.setPosition(-r, 0);
    this._follow.setPosition(r, 0);
    this._root.visible = true;
    this._open = true;
    for (let i = 0; i < this._options.length; i++) {
      const scale = this._options[i].view.scale;
      gsap.killTweensOf(scale);
      gsap.fromTo(scale, { x: 0, y: 0 }, {
        x: 1, y: 1, duration: ORDERS.radial.scaleInMs / MS_PER_SECOND, ease: ORDERS.radial.ease,
      });
    }
  }

  /**
   * Route a tap. Fires the matching option handler (if any) then closes.
   * @param {number} sx @param {number} sy SCREEN px
   * @returns {boolean} true if an option was hit
   */
  handleTap(sx, sy) {
    if (!this._open) return false;
    const lx = sx - this._root.position.x;
    const ly = sy - this._root.position.y;
    const hit = this._pick(lx, ly);
    if (hit) hit();
    this.close();
    return Boolean(hit);
  }

  /** @private @param {number} lx @param {number} ly menu-local px @returns {?Function} */
  _pick(lx, ly) {
    if (this._recall.contains(lx, ly)) return this._handlers.onRecall;
    if (this._hold.contains(lx, ly)) return this._handlers.onHold;
    if (this._follow.contains(lx, ly)) return this._handlers.onFollow;
    return null;
  }

  /** Close the menu. Idempotent. @returns {void} */
  close() {
    if (!this._open) return;
    this._open = false;
    this._handlers = null;
    for (let i = 0; i < this._options.length; i++) gsap.killTweensOf(this._options[i].view.scale);
    this._root.visible = false;
  }

  /** @returns {void} */
  destroy() {
    this.close();
    for (let i = 0; i < this._options.length; i++) this._options[i].destroy();
    this._root.parent?.removeChild(this._root);
    this._root.destroy();
  }
}

/**
 * Button — reusable rectangular control for the front-end screens: rounded
 * background + centred label, a GSAP press-punch (scale 1 -> MENU.pressScale ->
 * 1, spring ease on the return) that then fires `onPress`. Self-subscribes to
 * INPUT_TAP and hit-tests its own rect. Screen-space — the owner parents `view`
 * onto an OVERLAY container and calls `setPosition`. Callbacks are pre-bound;
 * only GSAP's internal tween allocates per press.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { EVENTS } from '../../engine/GameEvents.js';
import { MENU } from '../../config/MenuConfig.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;
const DANGER = 'danger'; // tone → combat-orange stroke + label (QUIT / CONFIRM)

export class Button {
  /**
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events shared bus
   * @param {string} label initial label
   * @param {Function} onPress fired once the press-punch settles
   * @param {string} [tone] 'danger' for a combat-orange destructive button, else gold
   */
  constructor(events, label, onPress, tone) {
    /** @private */ this._events = events;
    /** @private */ this._label = label;
    /** @private */ this._onPress = onPress;
    /** @private */ this._danger = tone === DANGER;
    /** @private */ this._enabled = true;
    /** @private */ this._w = MENU.button.widthPx;
    /** @private */ this._h = MENU.button.heightPx;
    /** @private */ this._x = 0;
    /** @private */ this._y = 0;
    /** @private */ this._root = new Container();
    /** @private */ this._box = new Container();
    /** @private */ this._bg = new Graphics();
    /** @private @type {?Text} */ this._text = null;
    /** @private */ this._onTap = (p) => this._tryPress(p.x, p.y);
    /** @private */ this._release = () => this._springBack();
    /** @private */ this._fire = () => { if (this._onPress) this._onPress(); };
  }

  /** @returns {Container} display root — parent it, position it via setPosition */
  get view() { return this._root; }
  /** @returns {boolean} */ get enabled() { return this._enabled; }

  /** @returns {void} build graphics + subscribe to taps */
  enable() {
    const b = MENU.button;
    this._text = new Text({
      text: this._label,
      style: new TextStyle({
        fontFamily: MENU.fontFamily, fontSize: b.textPx,
        fill: this._danger ? MENU.color.quit : MENU.color.goldBright,
      }),
    });
    this._text.anchor.set(HALF);
    this._text.position.set(this._w * HALF, this._h * HALF);
    this._box.addChild(this._bg, this._text);
    this._box.pivot.set(this._w * HALF, this._h * HALF); // scale-punch from centre
    this._box.position.set(this._w * HALF, this._h * HALF);
    this._root.addChild(this._box);
    this._redraw();
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    gsap.killTweensOf(this._box.scale);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} x @param {number} y top-left, SCREEN px @returns {void} */
  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._root.position.set(x, y);
  }

  /** @param {string} label @returns {void} */
  setLabel(label) {
    this._label = label;
    if (this._text) this._text.text = label;
  }

  /** @param {boolean} on when false: dimmed + non-interactive @returns {void} */
  setEnabled(on) {
    this._enabled = on;
    this._root.alpha = on ? 1 : MENU.button.disabledAlpha;
  }

  /** @param {number} sx @param {number} sy SCREEN px @returns {boolean} inside the rect */
  contains(sx, sy) {
    return sx >= this._x && sx <= this._x + this._w && sy >= this._y && sy <= this._y + this._h;
  }

  /** @param {number} _dt @returns {void} */
  update(_dt) { /* event-driven — no per-frame work */ }

  /** @private @param {number} sx @param {number} sy */
  _tryPress(sx, sy) {
    if (!this._enabled || !this._root.visible || !this.contains(sx, sy)) return;
    gsap.killTweensOf(this._box.scale);
    gsap.to(this._box.scale, {
      x: MENU.pressScale, y: MENU.pressScale,
      duration: MENU.pressMs / MS_PER_SECOND, ease: 'power1.out', onComplete: this._release,
    });
  }

  /** @private return from the pressed scale, then fire onPress */
  _springBack() {
    gsap.to(this._box.scale, {
      x: 1, y: 1, duration: MENU.pressMs / MS_PER_SECOND, ease: MENU.springEase, onComplete: this._fire,
    });
  }

  /** @private */
  _redraw() {
    const b = MENU.button;
    this._bg.clear()
      .roundRect(0, 0, this._w, this._h, b.radiusPx)
      .fill({ color: b.bg, alpha: b.bgAlpha })
      .stroke({ color: this._danger ? MENU.color.quit : MENU.color.gold, width: b.strokeWidthPx });
  }
}

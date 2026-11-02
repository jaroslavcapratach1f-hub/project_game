/**
 * Toggle — reusable on/off pill for the front-end screens: a rounded track and a
 * knob that GSAP-slides between ends on change (spring ease). Self-subscribes to
 * INPUT_TAP and hit-tests its own rect. Emits `onChange(bool)` on a user tap
 * only, not on a programmatic `setValue`. Zero per-frame work.
 */
import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { EVENTS } from '../../engine/GameEvents.js';
import { MENU } from '../../config/MenuConfig.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;

export class Toggle {
  /**
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events shared bus
   * @param {Function} onChange fired with the new boolean on a user tap
   */
  constructor(events, onChange) {
    /** @private */ this._events = events;
    /** @private */ this._onChange = onChange;
    /** @private */ this._on = false;
    /** @private */ this._x = 0;
    /** @private */ this._y = 0;
    /** @private */ this._root = new Container();
    /** @private */ this._track = new Graphics();
    /** @private */ this._knob = new Graphics();
    /** @private */ this._onTap = (p) => { if (this._root.visible && this.contains(p.x, p.y)) this._set(!this._on, true); };
  }

  /** @returns {Container} display root */ get view() { return this._root; }
  /** @returns {boolean} */ get value() { return this._on; }

  /** @returns {void} */
  enable() {
    const c = MENU.control;
    this._knob.circle(0, 0, c.toggleKnobPx * HALF).fill(MENU.color.knob);
    this._knob.position.set(this._knobX(false), c.toggleHeightPx * HALF);
    this._root.addChild(this._track, this._knob);
    this._redraw();
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    gsap.killTweensOf(this._knob.position);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} x @param {number} y top-left, SCREEN px @returns {void} */
  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._root.position.set(x, y);
  }

  /**
   * Set state programmatically (no `onChange`); snaps the knob without a tween.
   * @param {boolean} on @returns {void}
   */
  setValue(on) {
    this._on = Boolean(on);
    this._knob.position.x = this._knobX(this._on);
    this._redraw();
  }

  /** @param {number} sx @param {number} sy SCREEN px @returns {boolean} */
  contains(sx, sy) {
    const c = MENU.control;
    return sx >= this._x && sx <= this._x + c.toggleWidthPx && sy >= this._y && sy <= this._y + c.toggleHeightPx;
  }

  /** @param {number} _dt @returns {void} */
  update(_dt) { /* event-driven */ }

  /** @private @param {boolean} on @param {boolean} emit */
  _set(on, emit) {
    if (on === this._on) return;
    this._on = on;
    this._redraw();
    gsap.killTweensOf(this._knob.position);
    gsap.to(this._knob.position, {
      x: this._knobX(on), duration: MENU.control.slideMs / MS_PER_SECOND, ease: MENU.springEase,
    });
    if (emit && this._onChange) this._onChange(on);
  }

  /** @private @param {boolean} on @returns {number} knob centre x for a state */
  _knobX(on) {
    const c = MENU.control;
    const travel = c.toggleWidthPx - c.toggleKnobPx - c.togglePadPx * 2;
    return c.togglePadPx + c.toggleKnobPx * HALF + (on ? travel : 0);
  }

  /** @private */
  _redraw() {
    const c = MENU.control;
    this._track.clear()
      .roundRect(0, 0, c.toggleWidthPx, c.toggleHeightPx, c.toggleHeightPx * HALF)
      .fill({ color: this._on ? MENU.color.confirm : MENU.color.track });
  }
}

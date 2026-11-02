/**
 * Slider — reusable horizontal range control for the front-end screens: a track,
 * a filled portion, a draggable knob, and a value label on the right. Grabs a
 * gesture that starts on its hit-rect (INPUT_DRAG_START/MOVE/END) and also
 * accepts an INPUT_TAP on the track; every value is quantised to `step`.
 * Emits `onChange(quantisedValue)` on a user change only. Zero per-frame work.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { MENU } from '../../config/MenuConfig.js';
import { clamp } from '../../utils/MathUtils.js';

const HALF = 0.5;
const SUB_ONE_DECIMALS = 1;

export class Slider {
  /**
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events shared bus
   * @param {{min:number,max:number,step:number}} range
   * @param {Function} onChange fired with the quantised value on a user change
   */
  constructor(events, range, onChange) {
    /** @private */ this._events = events;
    /** @private */ this._min = range.min;
    /** @private */ this._max = range.max;
    /** @private */ this._step = range.step;
    /** @private */ this._onChange = onChange;
    /** @private */ this._value = range.min;
    /** @private */ this._x = 0;
    /** @private */ this._y = 0;
    /** @private */ this._dragging = false;
    /** @private */ this._root = new Container();
    /** @private */ this._track = new Graphics();
    /** @private */ this._fill = new Graphics();
    /** @private */ this._knob = new Graphics();
    /** @private @type {?Text} */ this._valueText = null;
    /** @private */ this._onDragStart = (p) => this._grab(p.x, p.y);
    /** @private */ this._onDragMove = (p) => { if (this._dragging) this._setFromX(p.x); };
    /** @private */ this._onDragEnd = () => { this._dragging = false; };
    /** @private */ this._onTap = (p) => { if (this._root.visible && this._hit(p.x, p.y)) this._setFromX(p.x); };
  }

  /** @returns {Container} display root */ get view() { return this._root; }
  /** @returns {number} current quantised value */ get value() { return this._value; }

  /** @returns {void} */
  enable() {
    const c = MENU.control;
    this._valueText = new Text({
      text: '', style: new TextStyle({ fontFamily: MENU.fontFamily, fontSize: c.valueLabelPx, fill: MENU.color.text }),
    });
    this._valueText.anchor.set(0, HALF);
    this._valueText.position.set(c.trackWidthPx + c.valueGapPx, c.knobRadiusPx);
    this._knob.circle(0, 0, c.knobRadiusPx).fill(MENU.color.knob);
    this._knob.position.y = c.knobRadiusPx;
    this._root.addChild(this._track, this._fill, this._knob, this._valueText);
    this._redrawTrack();
    this._reflow();
    this._events.on(EVENTS.INPUT_DRAG_START, this._onDragStart);
    this._events.on(EVENTS.INPUT_DRAG_MOVE, this._onDragMove);
    this._events.on(EVENTS.INPUT_DRAG_END, this._onDragEnd);
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_DRAG_START, this._onDragStart);
    this._events.off(EVENTS.INPUT_DRAG_MOVE, this._onDragMove);
    this._events.off(EVENTS.INPUT_DRAG_END, this._onDragEnd);
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} x @param {number} y top-left of the track box, SCREEN px @returns {void} */
  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._root.position.set(x, y);
  }

  /**
   * Set the value programmatically (no `onChange`). Quantised + reflowed.
   * @param {number} v @returns {void}
   */
  setValue(v) {
    this._value = quantise(v, this._min, this._max, this._step);
    this._reflow();
  }

  /** @param {number} _dt @returns {void} */
  update(_dt) { /* event-driven */ }

  /** @private @param {number} sx @param {number} sy */
  _grab(sx, sy) {
    if (!this._root.visible || !this._hit(sx, sy)) return;
    this._dragging = true;
    this._setFromX(sx);
  }

  /** @private set the value from a screen-x, emitting onChange if it moved */
  _setFromX(sx) {
    const c = MENU.control;
    const span = c.trackWidthPx - c.knobRadiusPx * 2;
    const f = clamp((sx - this._x - c.knobRadiusPx) / span, 0, 1);
    const next = quantise(this._min + f * (this._max - this._min), this._min, this._max, this._step);
    if (next === this._value) return;
    this._value = next;
    this._reflow();
    if (this._onChange) this._onChange(next);
  }

  /** @private @param {number} sx @param {number} sy @returns {boolean} */
  _hit(sx, sy) {
    const c = MENU.control;
    return sx >= this._x - c.hitPadPx && sx <= this._x + c.trackWidthPx + c.hitPadPx
      && sy >= this._y - c.hitPadPx && sy <= this._y + c.knobRadiusPx * 2 + c.hitPadPx;
  }

  /** @private */
  _redrawTrack() {
    const c = MENU.control;
    this._track.clear()
      .roundRect(0, c.knobRadiusPx - c.trackHeightPx * HALF, c.trackWidthPx, c.trackHeightPx, c.trackRadiusPx)
      .fill({ color: MENU.color.track });
  }

  /** @private reposition knob + fill + value label for the current value */
  _reflow() {
    const c = MENU.control;
    const f = (this._value - this._min) / (this._max - this._min);
    const knobX = c.knobRadiusPx + f * (c.trackWidthPx - c.knobRadiusPx * 2);
    this._knob.position.x = knobX;
    this._fill.clear()
      .roundRect(0, c.knobRadiusPx - c.trackHeightPx * HALF, Math.max(knobX, c.trackRadiusPx), c.trackHeightPx, c.trackRadiusPx)
      .fill({ color: MENU.color.fill });
    if (this._valueText) this._valueText.text = this._step < 1 ? this._value.toFixed(SUB_ONE_DECIMALS) : String(this._value);
  }
}

/**
 * @param {number} v @param {number} min @param {number} max @param {number} step
 * @returns {number} v clamped to [min,max], snapped to step, float dust trimmed
 */
function quantise(v, min, max, step) {
  const decimals = step < 1 ? SUB_ONE_DECIMALS : 0;
  const snapped = min + Math.round((clamp(Number(v), min, max) - min) / step) * step;
  return Number(snapped.toFixed(decimals));
}

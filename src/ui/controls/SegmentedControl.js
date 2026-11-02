/**
 * SegmentedControl — a small N-way enum picker (used for `graphicsQuality`):
 * evenly-split rounded segments, the selected one filled olive. Self-subscribes
 * to INPUT_TAP and hit-tests each segment. Emits `onChange(value)` on a user tap
 * only; `setValue` is silent. Spans `MENU.settings.controlColPx`. Zero per-frame
 * work.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { MENU } from '../../config/MenuConfig.js';

const HALF = 0.5;

export class SegmentedControl {
  /**
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events shared bus
   * @param {string[]} options ordered choices
   * @param {Function} onChange fired with the chosen value on a user tap
   */
  constructor(events, options, onChange) {
    this._events = events;
    this._options = options.slice();
    this._onChange = onChange;
    this._value = options[0];
    this._x = 0;
    this._y = 0;
    this._root = new Container();
    /** @private @type {{g:Graphics,t:Text,x:number,w:number}[]} */ this._segs = [];
    this._onTap = (p) => this._tap(p.x, p.y);
  }

  /** @returns {Container} */ get view() { return this._root; }
  /** @returns {string} */ get value() { return this._value; }

  /** @returns {void} */
  enable() {
    const s = MENU.segmented;
    const n = this._options.length;
    const segW = (MENU.settings.controlColPx - s.gapPx * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const g = new Graphics();
      const t = new Text({ text: this._options[i], style: new TextStyle({ fontFamily: MENU.fontFamily, fontSize: s.textPx, fill: s.offTextColor }) });
      t.anchor.set(HALF);
      const x = i * (segW + s.gapPx);
      g.position.x = x;
      t.position.set(x + segW * HALF, s.heightPx * HALF);
      this._root.addChild(g, t);
      this._segs.push({ g, t, x, w: segW });
    }
    this._redraw();
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} x @param {number} y top-left, SCREEN px @returns {void} */
  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._root.position.set(x, y);
  }

  /** @param {string} v @returns {void} silent */
  setValue(v) {
    if (this._options.includes(v)) { this._value = v; this._redraw(); }
  }

  /** @param {number} _dt @returns {void} */
  update(_dt) { /* event-driven */ }

  /** @private @param {number} sx @param {number} sy */
  _tap(sx, sy) {
    if (!this._root.visible || sy < this._y || sy > this._y + MENU.segmented.heightPx) return;
    for (let i = 0; i < this._segs.length; i++) {
      const seg = this._segs[i];
      if (sx < this._x + seg.x || sx > this._x + seg.x + seg.w) continue;
      if (this._options[i] !== this._value) {
        this._value = this._options[i];
        this._redraw();
        if (this._onChange) this._onChange(this._value);
      }
      return;
    }
  }

  /** @private */
  _redraw() {
    const s = MENU.segmented;
    for (let i = 0; i < this._segs.length; i++) {
      const on = this._options[i] === this._value;
      const seg = this._segs[i];
      seg.g.clear().roundRect(0, 0, seg.w, s.heightPx, s.radiusPx).fill(on ? s.onColor : s.offColor);
      seg.t.style.fill = on ? s.onTextColor : s.offTextColor;
    }
  }
}

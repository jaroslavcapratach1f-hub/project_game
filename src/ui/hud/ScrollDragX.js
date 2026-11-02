/**
 * ScrollDragX — horizontal drag-to-scroll, the exact same shape as
 * `ScrollDrag.js` (claims INPUT_DRAG_* directly, pure state + math, owner
 * applies `.x` to its own content) but tracking the X axis instead of Y —
 * `ProductionMaterialPicker`'s own scrollable row is the first horizontal
 * use case in this codebase, so this is a sibling file rather than
 * parameterizing the proven, already-shipped vertical one.
 */
import { EVENTS } from '../../engine/GameEvents.js';

export class ScrollDragX {
  /**
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events
   * @param {() => ?{x:number,y:number,w:number,h:number}} getViewport
   * @param {(x:number) => void} [onChange] called with the new `.x` on every drag move
   */
  constructor(events, getViewport, onChange) {
    this._events = events;
    this._getViewport = getViewport;
    this._onChange = onChange;
    this._x = 0; this._minX = 0;
    this._dragging = false; this._lastX = 0;
    this._onStart = (p) => this._start(p);
    this._onMove = (p) => this._move(p);
    this._onEnd = () => { this._dragging = false; };
  }

  /** @returns {number} current scroll offset (<= 0) */ get x() { return this._x; }
  /** @returns {boolean} a drag is in progress — Game suppresses camera-pan */ get isDragging() { return this._dragging; }

  /** @returns {void} */
  enable() {
    this._events.on(EVENTS.INPUT_DRAG_START, this._onStart);
    this._events.on(EVENTS.INPUT_DRAG_MOVE, this._onMove);
    this._events.on(EVENTS.INPUT_DRAG_END, this._onEnd);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_DRAG_START, this._onStart);
    this._events.off(EVENTS.INPUT_DRAG_MOVE, this._onMove);
    this._events.off(EVENTS.INPUT_DRAG_END, this._onEnd);
  }

  /** @param {number} minX the most negative valid scroll (content width - viewport width, or 0) @returns {void} */
  setBounds(minX) { this._minX = minX; this._x = Math.max(minX, Math.min(0, this._x)); }

  /** @returns {void} snap to start — call on a filter switch or similar content reset */
  reset() { this._x = 0; }

  /** @private @param {{x:number,y:number}} p */
  _start(p) {
    const v = this._getViewport();
    if (!v || p.x < v.x || p.x > v.x + v.w || p.y < v.y || p.y > v.y + v.h) return void (this._dragging = false);
    this._dragging = true;
    this._lastX = p.x;
  }

  /** @private @param {{x:number,y:number}} p */
  _move(p) {
    if (!this._dragging) return;
    this._x = Math.max(this._minX, Math.min(0, this._x + (p.x - this._lastX)));
    this._lastX = p.x;
    this._onChange?.(this._x);
  }
}

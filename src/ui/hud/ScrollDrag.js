/**
 * ScrollDrag — drag-to-scroll for a masked content container, claimed
 * directly off INPUT_DRAG_* (the same gesture channel
 * `BuildingDragController` uses) so the owning screen can tell
 * `Game._wireInput` to skip its own camera-pan fallback while a scroll is
 * in progress (`WorldScene.isDraggingHud()`). Pure state + math — the
 * owner supplies the current viewport rect (or `null` to refuse the drag,
 * e.g. while a screen on top is open) and applies the resulting offset to
 * its own content.
 *
 * VERTICAL by default (every existing caller) — the viewport descriptor
 * may optionally carry `axis: 'x'`, read fresh on every drag start, to
 * scroll that ONE drag horizontally instead (`ResearchScreen`'s own
 * landscape tree view, the player's own reference: "scrollable menu to the
 * left and right"). The public `.y`/`setBounds`/`onChange` names stay as
 * "the scroll offset" either way — renaming them to generic axis-neutral
 * names would ripple through every other caller for no real benefit.
 */
import { EVENTS } from '../../engine/GameEvents.js';

export class ScrollDrag {
  /**
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events
   * @param {() => ?{x:number,y:number,w:number,h:number,axis?:'x'|'y'}} getViewport
   * @param {(offset:number) => void} [onChange] called with the new scroll offset on every drag move
   */
  constructor(events, getViewport, onChange) {
    this._events = events;
    this._getViewport = getViewport;
    this._onChange = onChange;
    this._y = 0; this._minY = 0;
    this._dragging = false; this._lastY = 0; this._axis = 'y';
    this._onStart = (p) => this._start(p);
    this._onMove = (p) => this._move(p);
    this._onEnd = () => { this._dragging = false; };
  }

  /** @returns {number} current scroll offset (<= 0) */ get y() { return this._y; }
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

  /** @param {number} minY the most negative valid scroll (content height - viewport height, or 0) @returns {void} */
  setBounds(minY) { this._minY = minY; this._y = Math.max(minY, Math.min(0, this._y)); }

  /** @returns {void} snap to top — call on a filter switch or similar content reset */
  reset() { this._y = 0; }

  /** @private @param {{x:number,y:number}} p */
  _start(p) {
    const v = this._getViewport();
    if (!v || p.x < v.x || p.x > v.x + v.w || p.y < v.y || p.y > v.y + v.h) return void (this._dragging = false);
    this._dragging = true;
    this._axis = v.axis ?? 'y';
    this._lastY = this._axis === 'x' ? p.x : p.y;
  }

  /** @private @param {{x:number,y:number}} p */
  _move(p) {
    if (!this._dragging) return;
    const cur = this._axis === 'x' ? p.x : p.y;
    this._y = Math.max(this._minY, Math.min(0, this._y + (cur - this._lastY)));
    this._lastY = cur;
    this._onChange?.(this._y);
  }
}

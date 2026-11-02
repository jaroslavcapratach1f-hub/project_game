/**
 * InputManager — turns raw pointer / wheel events on the Pixi canvas into
 * semantic gesture events on the shared bus (GDD 02 tactical control):
 *   tap · double-tap · long-press · order-drag (start/move/end) · swipe ·
 *   1-finger pan · 2-finger pinch-zoom · wheel-zoom.
 * Pointers live in a PointerPool; classification is delegated to
 * GestureRecognizer / PinchRecognizer; payload plumbing to GestureEmitter.
 * All output is SCREEN px and reused objects — a pointermove never allocates.
 * A single-finger gesture emits INPUT_PAN until it arms as a drag, then
 * switches to INPUT_DRAG_* only (mutually exclusive per gesture).
 */
import { INPUT } from '../config/GameConfig.js';
import { PointerPool } from './PointerPool.js';
import { GestureRecognizer } from './GestureRecognizer.js';
import { PinchRecognizer } from './PinchRecognizer.js';
import { GestureEmitter } from './GestureEmitter.js';

export class InputManager {
  /** @param {import('../utils/EventEmitter.js').EventEmitter} emitter shared bus */
  constructor(emitter) {
    /** @private @type {HTMLCanvasElement|null} */ this._canvas = null;
    /** @private */ this._ptr = new PointerPool(INPUT.maxPointers);
    /** @private */ this._gesture = new GestureRecognizer();
    /** @private */ this._pinch = new PinchRecognizer();
    /** @private */ this._out = new GestureEmitter(emitter);
    /** @private id of the pointer owning the single-finger gesture */ this._activeId = -1;
    /** @private */ this._panning = false;
    /** @private */ this._dragArmed = false;
    /** @private */ this._longPressId = 0;
    this._bind();
  }

  /** @private bind handlers once so add/removeEventListener match */
  _bind() {
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
  }

  /**
   * Attach pointer + wheel listeners to a canvas.
   * @param {HTMLCanvasElement} canvas @returns {void}
   */
  attach(canvas) {
    this._canvas = canvas;
    canvas.addEventListener('pointerdown', this._onDown);
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerup', this._onUp);
    canvas.addEventListener('pointercancel', this._onUp);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
  }

  /** @param {number} m pan/drag delta multiplier (the `touchSensitivity` setting). @returns {void} */
  setSensitivity(m) {
    this._out.setSensitivity(m);
  }

  /** Detach all listeners. @returns {void} */
  detach() {
    const c = this._canvas;
    if (!c) return;
    c.removeEventListener('pointerdown', this._onDown);
    c.removeEventListener('pointermove', this._onMove);
    c.removeEventListener('pointerup', this._onUp);
    c.removeEventListener('pointercancel', this._onUp);
    c.removeEventListener('wheel', this._onWheel);
    this._canvas = null;
  }

  /** @private @param {PointerEvent} e */
  _onDown(e) {
    const now = performance.now();
    if (!this._ptr.add(e.pointerId, e.clientX, e.clientY, now)) return;
    this._cancelLongPress();
    if (this._ptr.size === 1) {
      this._activeId = e.pointerId;
      this._panning = false;
      this._dragArmed = false;
      this._longPressId = setTimeout(() => this._fireLongPress(), INPUT.longPressMs);
    } else {
      this._activeId = -1;
      this._ptr.firstTwo();
      if (this._ptr.b) this._pinch.begin(this._ptr.a, this._ptr.b);
    }
  }

  /** @private @param {PointerEvent} e */
  _onMove(e) {
    const now = performance.now();
    if (this._ptr.size >= 2) return this._onPinchMove(e, now);
    const s = this._ptr.get(e.pointerId);
    if (!s || e.pointerId !== this._activeId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    this._ptr.updateKinematics(e.pointerId, e.clientX, e.clientY, now);
    if (this._dragArmed) return this._out.dragMove(s.x, s.y, dx, dy);
    if (this._gesture.dragArmed(s)) return this._armDrag(s, dx, dy);
    if (this._gesture.travel(s) > INPUT.dragThresholdPx) {
      this._panning = true;
      this._cancelLongPress();
      this._out.pan(dx, dy);
    }
  }

  /** @private arm the order drag and emit its first two events @param {object} s */
  _armDrag(s, dx, dy) {
    this._dragArmed = true;
    this._panning = false;
    this._cancelLongPress();
    this._out.dragStart(s.startX, s.startY);
    this._out.dragMove(s.x, s.y, dx, dy);
  }

  /** @private @param {PointerEvent} e @param {number} now */
  _onPinchMove(e, now) {
    this._cancelLongPress();
    this._ptr.updateKinematics(e.pointerId, e.clientX, e.clientY, now);
    this._ptr.firstTwo();
    if (!this._ptr.b) return;
    const r = this._pinch.update(this._ptr.a, this._ptr.b);
    if (r) this._out.zoom(r.delta, r.focalX, r.focalY);
  }

  /** @private @param {PointerEvent} e */
  _onUp(e) {
    this._cancelLongPress();
    const s = this._ptr.get(e.pointerId);
    const now = performance.now();
    if (s && e.pointerId === this._activeId) {
      if (this._dragArmed) this._out.dragEnd(s);
      else if (!this._panning) this._release(s, now);
    }
    this._ptr.remove(e.pointerId);
    if (this._ptr.size === 0) {
      this._activeId = -1;
      this._panning = false;
      this._dragArmed = false;
    }
  }

  /** @private @param {object} s @param {number} now */
  _release(s, now) {
    const r = this._gesture.classifyRelease(s, now);
    if (r) this._out.release(r);
  }

  /** @private @param {WheelEvent} e */
  _onWheel(e) {
    e.preventDefault();
    this._out.wheelZoom(e.deltaY, e.clientX, e.clientY);
  }

  /** @private long-press timer fired: emit only if still a stationary 1-finger hold */
  _fireLongPress() {
    this._longPressId = 0;
    const s = this._ptr.get(this._activeId);
    if (!s || this._ptr.size !== 1 || this._dragArmed) return;
    if (this._gesture.longPressHolds(s)) this._out.longPress(s.x, s.y);
  }

  /** @private */
  _cancelLongPress() {
    if (this._longPressId) clearTimeout(this._longPressId);
    this._longPressId = 0;
  }
}

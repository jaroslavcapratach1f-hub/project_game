/**
 * GestureEmitter — owns every InputManager output payload and the emit calls,
 * so InputManager itself stays a lean pointer state machine. All payloads are
 * SCREEN px and are reused objects: nothing here allocates per pointermove.
 */
import { INPUT } from '../config/GameConfig.js';
import { EVENTS } from './GameEvents.js';
import { GESTURE } from './GestureRecognizer.js';

export class GestureEmitter {
  /** @param {import('../utils/EventEmitter.js').EventEmitter} emitter shared bus */
  constructor(emitter) {
    /** @private */ this._e = emitter;
    /** @private pan/drag delta multiplier — the `touchSensitivity` setting */
    this._sensitivity = 1;
    /** @private */ this._pan = { dx: 0, dy: 0 };
    /** @private */ this._zoom = { delta: 0, focalX: 0, focalY: 0 };
    /** @private */ this._tap = { x: 0, y: 0, pointers: 1 };
    /** @private */ this._xy = { x: 0, y: 0 };
    /** @private */ this._drag = { x: 0, y: 0, dx: 0, dy: 0 };
    /** @private */ this._dragEnd = { x: 0, y: 0, startX: 0, startY: 0, vx: 0, vy: 0 };
    /** @private */ this._swipe = { dirX: 0, dirY: 0, speed: 0 };
  }

  /**
   * @param {number} m delta multiplier (> 0); falls back to 1 when invalid
   * @returns {void}
   */
  setSensitivity(m) {
    const n = Number(m);
    this._sensitivity = Number.isFinite(n) && n > 0 ? n : 1;
  }

  /** @param {number} dx @param {number} dy @returns {void} */
  pan(dx, dy) {
    this._pan.dx = dx * this._sensitivity;
    this._pan.dy = dy * this._sensitivity;
    this._e.emit(EVENTS.INPUT_PAN, this._pan);
  }

  /**
   * Emit INPUT_ZOOM with an explicit delta + focal point (pinch path).
   * @param {number} delta @param {number} focalX @param {number} focalY @returns {void}
   */
  zoom(delta, focalX, focalY) {
    this._zoom.delta = delta;
    this._zoom.focalX = focalX;
    this._zoom.focalY = focalY;
    this._e.emit(EVENTS.INPUT_ZOOM, this._zoom);
  }

  /** Wheel-zoom: convert wheel deltaY into a zoom delta at the cursor.
   * @param {number} deltaY @param {number} x @param {number} y @returns {void} */
  wheelZoom(deltaY, x, y) {
    this.zoom(-deltaY * INPUT.wheelZoomStep, x, y);
  }

  /** @param {number} x @param {number} y @returns {void} */
  dragStart(x, y) {
    this._xy.x = x;
    this._xy.y = y;
    this._e.emit(EVENTS.INPUT_DRAG_START, this._xy);
  }

  /** @param {number} x @param {number} y @param {number} dx @param {number} dy @returns {void} */
  dragMove(x, y, dx, dy) {
    this._drag.x = x;
    this._drag.y = y;
    this._drag.dx = dx * this._sensitivity;
    this._drag.dy = dy * this._sensitivity;
    this._e.emit(EVENTS.INPUT_DRAG_MOVE, this._drag);
  }

  /** @param {object} slot pointer slot carrying x, y, start and velocity fields @returns {void} */
  dragEnd(slot) {
    const d = this._dragEnd;
    d.x = slot.x;
    d.y = slot.y;
    d.startX = slot.startX;
    d.startY = slot.startY;
    d.vx = slot.vx;
    d.vy = slot.vy;
    this._e.emit(EVENTS.INPUT_DRAG_END, d);
  }

  /**
   * Emit tap / double-tap / swipe from a GestureRecognizer result.
   * @param {{type:string,x:number,y:number,dirX:number,dirY:number,speed:number}} r
   * @returns {void}
   */
  release(r) {
    if (r.type === GESTURE.SWIPE) {
      this._swipe.dirX = r.dirX;
      this._swipe.dirY = r.dirY;
      this._swipe.speed = r.speed;
      this._e.emit(EVENTS.INPUT_SWIPE, this._swipe);
    } else if (r.type === GESTURE.DOUBLE_TAP) {
      this._xy.x = r.x;
      this._xy.y = r.y;
      this._e.emit(EVENTS.INPUT_DOUBLE_TAP, this._xy);
    } else {
      this._tap.x = r.x;
      this._tap.y = r.y;
      this._tap.pointers = 1;
      this._e.emit(EVENTS.INPUT_TAP, this._tap);
    }
  }

  /** @param {number} x @param {number} y @returns {void} */
  longPress(x, y) {
    this._xy.x = x;
    this._xy.y = y;
    this._e.emit(EVENTS.INPUT_LONGPRESS, this._xy);
  }
}

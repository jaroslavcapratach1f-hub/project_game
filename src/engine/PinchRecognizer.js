/**
 * PinchRecognizer — two-pointer span classifier. Kept separate so
 * InputManager stays under the line cap. Pure: no DOM, no emitter.
 * Emits nothing until the span moves past INPUT.dragThresholdPx, then
 * reports a zoom delta and the pinch midpoint (focal point).
 */
import { INPUT } from '../config/GameConfig.js';

export class PinchRecognizer {
  constructor() {
    /** @private */ this._dist = 0;
    /** @private */ this._armed = false;
    /** @private reused result object */
    this._out = { delta: 0, focalX: 0, focalY: 0 };
  }

  /**
   * Seed the reference span when the second pointer lands.
   * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
   * @returns {void}
   */
  begin(a, b) {
    this._dist = Math.hypot(b.x - a.x, b.y - a.y);
    this._armed = false;
  }

  /**
   * Update from the two live pointers.
   * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
   * @returns {?{delta:number,focalX:number,focalY:number}} reused, or null
   */
  update(a, b) {
    const next = Math.hypot(b.x - a.x, b.y - a.y);
    if (!this._armed && Math.abs(next - this._dist) < INPUT.dragThresholdPx) return null;
    this._armed = true;
    this._out.delta = (next - this._dist) * INPUT.pinchZoomStep;
    this._out.focalX = (a.x + b.x) / 2;
    this._out.focalY = (a.y + b.y) / 2;
    this._dist = next;
    return this._out;
  }
}

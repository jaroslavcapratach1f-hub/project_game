/**
 * GestureRecognizer — pure single-pointer gesture classifier used by
 * InputManager. Given a PointerPool slot (which carries down position + time
 * and an EMA velocity) plus INPUT thresholds, it decides tap / double-tap /
 * swipe on release, and answers the "armed a drag?" / "long-press still
 * holds?" questions during a hold. No DOM, no emitter, no per-move alloc:
 * results come back in one reused object.
 */
import { INPUT } from '../config/GameConfig.js';

/** Classification tags shared with InputManager. */
export const GESTURE = { TAP: 'tap', DOUBLE_TAP: 'doubleTap', SWIPE: 'swipe' };

export class GestureRecognizer {
  constructor() {
    /** @private */ this._lastTapTime = 0;
    /** @private */ this._lastTapX = 0;
    /** @private */ this._lastTapY = 0;
    /** @private reused result */
    this._out = { type: '', x: 0, y: 0, dirX: 0, dirY: 0, speed: 0 };
  }

  /**
   * Straight-line distance the pointer has moved from its down point.
   * @param {object} slot @returns {number}
   */
  travel(slot) {
    return Math.hypot(slot.x - slot.startX, slot.y - slot.startY);
  }

  /**
   * Has the pointer moved far enough to arm a tactical-order drag?
   * @param {object} slot @returns {boolean}
   */
  dragArmed(slot) {
    return this.travel(slot) > INPUT.orderDragArmPx;
  }

  /**
   * Is a held pointer still inside the long-press jitter tolerance?
   * @param {object} slot @returns {boolean}
   */
  longPressHolds(slot) {
    return this.travel(slot) <= INPUT.longPressMoveTolerancePx;
  }

  /**
   * Classify a completed gesture on pointer-up.
   * @param {object} slot pointer slot (start*, v*, live x/y)
   * @param {number} now performance.now() at release
   * @returns {?{type:string,x:number,y:number,dirX:number,dirY:number,speed:number}}
   *   a reused result object, or null if the gesture is nothing notable
   */
  classifyRelease(slot, now) {
    const dur = now - slot.startTime;
    const speed = Math.hypot(slot.vx, slot.vy);
    if (dur <= INPUT.swipeMaxMs && speed >= INPUT.swipeMinSpeedPxPerMs) {
      const inv = speed > 0 ? 1 / speed : 0;
      this._out.type = GESTURE.SWIPE;
      this._out.dirX = slot.vx * inv;
      this._out.dirY = slot.vy * inv;
      this._out.speed = speed;
      return this._out;
    }
    if (dur <= INPUT.tapMaxMs && this.travel(slot) <= INPUT.tapMoveTolerancePx) {
      return this._classifyTap(slot, now);
    }
    return null;
  }

  /**
   * @private tap vs double-tap against the remembered previous tap
   * @param {object} slot @param {number} now
   */
  _classifyTap(slot, now) {
    const withinTime = now - this._lastTapTime <= INPUT.doubleTapMaxMs;
    const withinGap = Math.hypot(slot.x - this._lastTapX, slot.y - this._lastTapY) <= INPUT.doubleTapMaxGapPx;
    const isDouble = withinTime && withinGap;
    this._lastTapTime = isDouble ? 0 : now; // reset on double so triples don't chain
    this._lastTapX = slot.x;
    this._lastTapY = slot.y;
    this._out.type = isDouble ? GESTURE.DOUBLE_TAP : GESTURE.TAP;
    this._out.x = slot.x;
    this._out.y = slot.y;
    return this._out;
  }
}

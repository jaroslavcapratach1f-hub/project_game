/**
 * ScalarTween — a single eased number interpolation. Used by Camera for
 * position and zoom moves. Allocation-free once constructed; step() is safe
 * to call every frame and self-deactivates when it reaches the end.
 */
import { clamp, easeInOutQuad } from './MathUtils.js';

const MS_PER_SECOND = 1000;

export class ScalarTween {
  constructor() {
    /** @private */ this._from = 0;
    /** @private */ this._to = 0;
    /** @private */ this._elapsedMs = 0;
    /** @private */ this._durationMs = 1;
    /** @private */ this._active = false;
    /** @private */ this._value = 0;
  }

  /** @returns {boolean} true while the tween is running */
  get active() {
    return this._active;
  }

  /** @returns {number} the most recent stepped value */
  get value() {
    return this._value;
  }

  /**
   * (Re)start the tween. A non-positive duration snaps instantly to `to`.
   * @param {number} from start value
   * @param {number} to end value
   * @param {number} durationMs tween length in milliseconds
   * @returns {void}
   */
  start(from, to, durationMs) {
    this._from = from;
    this._to = to;
    this._elapsedMs = 0;
    this._durationMs = Math.max(durationMs, 1);
    this._active = durationMs > 0;
    this._value = this._active ? from : to;
  }

  /**
   * Advance the tween and return the current eased value.
   * @param {number} dtSeconds elapsed time since the last step
   * @returns {number}
   */
  step(dtSeconds) {
    if (!this._active) return this._value;
    this._elapsedMs += dtSeconds * MS_PER_SECOND;
    const t = clamp(this._elapsedMs / this._durationMs, 0, 1);
    this._value = this._from + (this._to - this._from) * easeInOutQuad(t);
    if (t >= 1) this._active = false;
    return this._value;
  }

  /** Stop the tween where it is. @returns {void} */
  cancel() {
    this._active = false;
  }
}

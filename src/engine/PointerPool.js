/**
 * PointerPool — fixed-size, allocation-free registry of active pointers for
 * InputManager. Slots are pre-created; add()/remove() only flip an id and
 * touch a Map. Each slot also carries gesture kinematics: the down position
 * and time, the previous sample, and an EMA velocity (px/ms).
 * firstTwo() caches the two oldest live slots on `a` / `b` for pinch math.
 */
import { INPUT } from '../config/GameConfig.js';
import { lerp } from '../utils/MathUtils.js';

const MIN_DT_MS = 1;

/** @returns {object} a blank, unused pointer slot */
function makeSlot() {
  return {
    id: -1, x: 0, y: 0,
    startX: 0, startY: 0, startTime: 0,
    prevX: 0, prevY: 0, prevTime: 0,
    vx: 0, vy: 0,
  };
}

export class PointerPool {
  /** @param {number} size maximum simultaneous pointers to track */
  constructor(size) {
    /** @private @type {object[]} */
    this._slots = [];
    for (let i = 0; i < size; i++) this._slots.push(makeSlot());
    /** @private @type {Map<number,object>} */
    this._active = new Map();
    /** @type {?object} */ this.a = null;
    /** @type {?object} */ this.b = null;
  }

  /** @returns {number} live pointer count */
  get size() {
    return this._active.size;
  }

  /**
   * Register a pointer, seeding its start + previous sample and zero velocity.
   * @param {number} id @param {number} x @param {number} y @param {number} now
   * @returns {?object} the slot, or null if the pool is full
   */
  add(id, x, y, now) {
    for (let i = 0; i < this._slots.length; i++) {
      const s = this._slots[i];
      if (s.id === -1) {
        s.id = id;
        s.x = s.startX = s.prevX = x;
        s.y = s.startY = s.prevY = y;
        s.startTime = s.prevTime = now;
        s.vx = s.vy = 0;
        this._active.set(id, s);
        return s;
      }
    }
    return null;
  }

  /** @param {number} id @returns {object|undefined} */
  get(id) {
    return this._active.get(id);
  }

  /** @param {number} id @returns {void} */
  remove(id) {
    const s = this._active.get(id);
    if (s) s.id = -1;
    this._active.delete(id);
  }

  /**
   * Update a slot's position and EMA velocity, then roll the previous sample.
   * @param {number} id @param {number} x @param {number} y @param {number} now
   * @returns {void}
   */
  updateKinematics(id, x, y, now) {
    const s = this._active.get(id);
    if (!s) return;
    const dt = Math.max(now - s.prevTime, MIN_DT_MS);
    s.vx = lerp(s.vx, (x - s.prevX) / dt, INPUT.velocitySmoothing);
    s.vy = lerp(s.vy, (y - s.prevY) / dt, INPUT.velocitySmoothing);
    s.x = s.prevX = x;
    s.y = s.prevY = y;
    s.prevTime = now;
  }

  /** Cache the first two live slots on `a` / `b` (either may stay null). @returns {void} */
  firstTwo() {
    this.a = null;
    this.b = null;
    for (const s of this._active.values()) {
      if (!this.a) this.a = s;
      else { this.b = s; return; }
    }
  }
}

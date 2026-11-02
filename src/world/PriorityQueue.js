/**
 * PriorityQueue — a binary min-heap keyed by a numeric priority. Purpose-built
 * for Pathfinder's A* open set: push(item, priority) / pop() -> lowest-priority
 * item / size. No PixiJS. Steady-state pop/push do not allocate.
 */
export class PriorityQueue {
  constructor() {
    /** @private @type {any[]} */ this._items = [];
    /** @private @type {number[]} */ this._prio = [];
  }

  /** @returns {number} entries currently queued */
  get size() { return this._items.length; }

  /**
   * @param {any} item @param {number} priority lower = popped sooner
   * @returns {void}
   */
  push(item, priority) {
    this._items.push(item);
    this._prio.push(priority);
    this._siftUp(this._items.length - 1);
  }

  /** @returns {any} the lowest-priority item, or undefined when empty */
  pop() {
    const n = this._items.length;
    if (n === 0) return undefined;
    const top = this._items[0];
    const lastItem = this._items.pop();
    const lastPrio = this._prio.pop();
    if (n > 1) {
      this._items[0] = lastItem;
      this._prio[0] = lastPrio;
      this._siftDown(0);
    }
    return top;
  }

  /** @private @param {number} i */
  _siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this._prio[parent] <= this._prio[i]) break;
      this._swap(i, parent);
      i = parent;
    }
  }

  /** @private @param {number} i */
  _siftDown(i) {
    const n = this._items.length;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      let small = i;
      if (l < n && this._prio[l] < this._prio[small]) small = l;
      if (r < n && this._prio[r] < this._prio[small]) small = r;
      if (small === i) break;
      this._swap(i, small);
      i = small;
    }
  }

  /** @private @param {number} a @param {number} b */
  _swap(a, b) {
    const ti = this._items[a];
    this._items[a] = this._items[b];
    this._items[b] = ti;
    const tp = this._prio[a];
    this._prio[a] = this._prio[b];
    this._prio[b] = tp;
  }
}

/**
 * ObjectPool — reuse container for objects that are created and destroyed
 * repeatedly (particles, projectiles, damage numbers). Acquire never
 * allocates while the free list is non-empty; the pool only grows when it
 * runs dry. CLAUDE.md rules #8 / #9.
 */
export class ObjectPool {
  /**
   * @param {() => object} createFn builds one fresh pooled object
   * @param {(obj: object) => void} resetFn clears an object before reuse
   * @param {number} [initialSize=0] objects to pre-allocate on construction
   */
  constructor(createFn, resetFn, initialSize = 0) {
    /** @private */ this._createFn = createFn;
    /** @private */ this._resetFn = resetFn;
    /** @private @type {object[]} */ this._free = [];
    /** @private */ this._activeCount = 0;
    /** @private */ this._totalCount = 0;
    for (let i = 0; i < initialSize; i++) {
      this._free.push(this._createFn());
      this._totalCount++;
    }
  }

  /**
   * Take an object from the pool, growing it by one if the free list is empty.
   * @returns {object}
   */
  acquire() {
    let obj;
    if (this._free.length > 0) {
      obj = this._free.pop();
    } else {
      obj = this._createFn();
      this._totalCount++;
    }
    this._activeCount++;
    return obj;
  }

  /**
   * Reset an object and return it to the free list.
   * @param {object} obj an object previously returned by acquire()
   * @returns {void}
   */
  release(obj) {
    this._resetFn(obj);
    this._free.push(obj);
    if (this._activeCount > 0) this._activeCount--;
  }

  /**
   * Objects currently checked out.
   * @returns {number}
   */
  getActiveCount() {
    return this._activeCount;
  }

  /**
   * Objects the pool has ever created (free + active).
   * @returns {number}
   */
  getTotalCount() {
    return this._totalCount;
  }
}

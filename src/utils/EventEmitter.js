/**
 * EventEmitter — the one cross-system communication channel (CLAUDE.md #7).
 * Systems never call each other directly; they emit and subscribe here.
 *
 * emit() iterates a snapshot of the listener list so a handler may safely
 * unsubscribe (or subscribe) during dispatch. The snapshot is only taken
 * when an event actually has listeners, so idle events cost nothing.
 */
export class EventEmitter {
  constructor() {
    /** @private @type {Map<string, Function[]>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe cb to event.
   * @param {string} event
   * @param {Function} cb
   * @returns {void}
   */
  on(event, cb) {
    const list = this._listeners.get(event);
    if (list) list.push(cb);
    else this._listeners.set(event, [cb]);
  }

  /**
   * Unsubscribe a specific callback from event.
   * @param {string} event
   * @param {Function} cb
   * @returns {void}
   */
  off(event, cb) {
    const list = this._listeners.get(event);
    if (!list) return;
    const i = list.indexOf(cb);
    if (i !== -1) list.splice(i, 1);
    if (list.length === 0) this._listeners.delete(event);
  }

  /**
   * Subscribe cb to fire at most once.
   * @param {string} event
   * @param {Function} cb
   * @returns {void}
   */
  once(event, cb) {
    const wrap = (...args) => {
      this.off(event, wrap);
      cb(...args);
    };
    this.on(event, wrap);
  }

  /**
   * Invoke every listener for event with args.
   * @param {string} event
   * @param {...*} args
   * @returns {void}
   */
  emit(event, ...args) {
    const list = this._listeners.get(event);
    if (!list || list.length === 0) return;
    const snapshot = list.slice();
    for (let i = 0; i < snapshot.length; i++) snapshot[i](...args);
  }

  /**
   * Remove listeners for one event, or all events when event is omitted.
   * @param {string} [event]
   * @returns {void}
   */
  clear(event) {
    if (event === undefined) this._listeners.clear();
    else this._listeners.delete(event);
  }
}

/**
 * EngineeringCenter — every built Factory instance (`BUILDINGS.engineering`
 * allows 2), each with its OWN set of up to 4 workshop queues unlocked by
 * THAT instance's own level (`workshopsUnlockedAt` — Lv1/4/18/22, the
 * player's own confirmed thresholds). Each workshop is an independent
 * `ProductionQueue` (building index + workshop slot composite key).
 * Finished jobs credit ResourceManager's material balances.
 */
import { ProductionQueue } from './ProductionQueue.js';
import { ENGINEERING, workshopsUnlockedAt } from '../config/MaterialsConfig.js';

const ENGINEERING_ID = 'engineering';

export class EngineeringCenter {
  /**
   * @param {import('./BaseManager.js').BaseManager} baseManager
   * @param {import('./ResourceManager.js').ResourceManager} resourceManager
   */
  constructor(baseManager, resourceManager) {
    /** @private */ this._base = baseManager;
    /** @private */ this._rm = resourceManager;
    /** @private @type {Map<string, ProductionQueue>} `${buildingIndex}:${workshopSlot}` -> its own queue */
    this._queues = new Map();
  }

  /** @returns {{index:number, level:number}[]} every built Factory, in build order */
  instances() {
    const out = [];
    const list = this._base.buildings;
    for (let i = 0; i < list.length; i++) if (list[i].id === ENGINEERING_ID) out.push({ index: i, level: list[i].level });
    return out;
  }

  /** @param {number} index @returns {number} workshop slots unlocked at this Factory's current level (0..4) */
  workshopCount(index) {
    const b = this._base.buildings[index];
    return b?.id === ENGINEERING_ID ? workshopsUnlockedAt(b.level) : 0;
  }

  /** @param {number} index @returns {number} this Factory instance's own live building level, 0 if not a Factory */
  levelOf(index) {
    const b = this._base.buildings[index];
    return b?.id === ENGINEERING_ID ? b.level : 0;
  }

  /** @param {number} index @param {number} slot @returns {number} queue capacity */
  capacity(index, slot) { return this._queueFor(index, slot)?.capacity ?? 0; }

  /** @param {number} index @param {number} slot @returns {{materialKey:string,active:boolean,remainingMs:number,progress:number}[]} */
  snapshot(index, slot) { return this._queueFor(index, slot)?.snapshot() ?? []; }

  /** @param {number} index @param {number} slot @param {string} materialKey @returns {boolean} enqueued */
  enqueue(index, slot, materialKey) { return this._queueFor(index, slot)?.enqueue(materialKey) ?? false; }

  /** @param {number} index @param {number} slot @param {number} queuePos @returns {boolean} removed */
  removeAt(index, slot, queuePos) { return this._queueFor(index, slot)?.removeAt(queuePos) ?? false; }

  /** @param {number} index @param {number} slot @returns {void} */
  clear(index, slot) { this._queueFor(index, slot)?.clear(); }

  /** @param {number} index @param {number} slot @returns {boolean} true if the active job was rushed (no cost yet — see ProductionQueue.rushActive) */
  rush(index, slot) { return this._queueFor(index, slot)?.rushActive() ?? false; }

  /** @param {number} _dt unused — TimedJob is timestamp-based, not tick-accumulated @returns {void} */
  update(_dt) {
    for (const q of this._queues.values()) q.collect((materialKey) => this._rm.addMaterial(materialKey, ENGINEERING.outputPerBatch));
  }

  /** @private get-or-create one workshop's queue, kept synced to its Factory's live level @returns {?ProductionQueue} */
  _queueFor(index, slot) {
    const b = this._base.buildings[index];
    if (!b || b.id !== ENGINEERING_ID || slot >= workshopsUnlockedAt(b.level)) return null;
    const key = `${index}:${slot}`;
    let q = this._queues.get(key);
    if (!q) { q = new ProductionQueue(b.level); this._queues.set(key, q); }
    else q.setLevel(b.level);
    return q;
  }
}

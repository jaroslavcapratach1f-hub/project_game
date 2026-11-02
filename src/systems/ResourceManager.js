/**
 * ResourceManager — the three core resource balances (Money / Steel / Oil) plus
 * a construction-materials map (MATERIAL_KEYS — Engineering Center output, spent
 * only on building upgrades; NOT a 4th resource). Loop system, no PixiJS.
 *
 * Each frame it banks fractional per-second income from BaseManager's per-hour
 * production; every RESOURCE_ACCRUAL.tickSeconds it folds whole units into the
 * balances (clamped to storageCap — overflow discarded) and emits
 * RESOURCE_CHANGED. `canAfford` / `spend` take `upgradeCost(...)` output.
 *
 * GDD 01 pillar 8: resources are never looted in PvP (ResourceConfig
 * RESOURCE_LOOTABLE === false) — no raid / transfer path is modelled here.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { CORE_RESOURCE_KEYS, MATERIAL_KEYS, storageCap } from '../config/ResourceConfig.js';
import { RESOURCE_ACCRUAL, STARTING_STOCK } from '../config/EconomyConfig.js';

const SECONDS_PER_HOUR = 3600;

export class ResourceManager {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('./BaseManager.js').BaseManager} baseManager
   */
  constructor(events, baseManager) {
    /** @private */ this._events = events;
    /** @private */ this._base = baseManager;
    /** @private */ this._bal = { money: STARTING_STOCK.money, steel: STARTING_STOCK.steel, oil: STARTING_STOCK.oil };
    /** @private */ this._materials = {};
    for (let i = 0; i < MATERIAL_KEYS.length; i++) this._materials[MATERIAL_KEYS[i]] = STARTING_STOCK.materialEach;
    /** @private fractional income not yet folded into a balance */ this._bank = { money: 0, steel: 0, oil: 0 };
    /** @private per-hour rate, reused */ this._rates = { money: 0, steel: 0, oil: 0 };
    /** @private productionByResource scratch — no per-frame alloc */ this._prod = { money: 0, steel: 0, oil: 0 };
    /** @private seconds toward the next fold */ this._acc = 0;
  }

  /** @returns {void} */
  enable() { this._acc = 0; this._emit(); }

  /** @returns {void} */
  disable() {}

  /** @returns {{money:number,steel:number,oil:number}} snapshot */
  get balances() { return { ...this._bal }; }

  /** @returns {Object<string,number>} construction-material balances snapshot */
  get materials() { return { ...this._materials }; }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    const prod = this._base.productionByResource(this._prod);
    for (let i = 0; i < CORE_RESOURCE_KEYS.length; i++) {
      const k = CORE_RESOURCE_KEYS[i];
      this._rates[k] = prod[k];
      this._bank[k] += (prod[k] / SECONDS_PER_HOUR) * dt;
    }
    this._acc += dt;
    if (this._acc < RESOURCE_ACCRUAL.tickSeconds) return;
    this._acc -= RESOURCE_ACCRUAL.tickSeconds;
    this._fold();
  }

  /**
   * @param {{money?:number,steel?:number,oil?:number,materials?:object}} cost
   * @returns {boolean} can every line item be paid right now
   */
  canAfford(cost) {
    if (!cost) return true;
    for (let i = 0; i < CORE_RESOURCE_KEYS.length; i++) {
      const k = CORE_RESOURCE_KEYS[i];
      if ((cost[k] || 0) > this._bal[k]) return false;
    }
    const m = cost.materials || {};
    for (const key in m) if ((m[key] || 0) > (this._materials[key] || 0)) return false;
    return true;
  }

  /**
   * Pay a cost if affordable. @param {object} cost @returns {boolean} paid
   */
  spend(cost) {
    if (!this.canAfford(cost)) return false;
    for (let i = 0; i < CORE_RESOURCE_KEYS.length; i++) {
      const k = CORE_RESOURCE_KEYS[i];
      this._bal[k] -= cost[k] || 0;
    }
    const m = cost.materials || {};
    for (const key in m) this._materials[key] -= m[key] || 0;
    this._emit();
    return true;
  }

  /**
   * Credit a crafted material (Engineering Center production completing).
   * @param {string} key @param {number} qty @returns {void}
   */
  addMaterial(key, qty) {
    this._materials[key] = (this._materials[key] ?? 0) + qty;
    this._emit();
  }

  /** @private fold banked whole units into the balances, clamped to storage */
  _fold() {
    for (let i = 0; i < CORE_RESOURCE_KEYS.length; i++) {
      const k = CORE_RESOURCE_KEYS[i];
      const whole = Math.floor(this._bank[k]);
      if (whole <= 0) continue;
      this._bank[k] -= whole;
      const cap = storageCap(k, this._base.summedLevel(k));
      this._bal[k] = Math.min(cap, this._bal[k] + whole); // overflow discarded (GDD 07)
    }
    this._emit();
  }

  /** @private */
  _emit() {
    this._events.emit(EVENTS.RESOURCE_CHANGED, {
      money: Math.round(this._bal.money),
      steel: Math.round(this._bal.steel),
      oil: Math.round(this._bal.oil),
      materials: { ...this._materials },
      rates: { ...this._rates },
    });
  }
}

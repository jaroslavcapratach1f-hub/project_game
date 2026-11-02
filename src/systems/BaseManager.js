/**
 * BaseManager — the persistent home base (GDD 04). Loop system, no PixiJS.
 * Owns the square placement grid (BaseGridConfig — plot size grows with HQ
 * level) and an array of building instances `{ id, level, cx, cy, isActive,
 * produces?, variant? }` (cell-unit centre offsets from the plot centre).
 * Seeds BASE.STARTING_LAYOUT (headquarters first — it gates every other
 * level), validates placement against the CURRENT plot size + each
 * building's own footprint, and serves production / storage queries to
 * ResourceManager.
 *
 * Upgrades are INSTANT — pay `upgradeCost` (resources + materials), apply the
 * level, done; no timer (GDD 04, corrected — see BuildingConfig.js's header
 * for where real time actually belongs: Research, material crafting).
 * `upgrade()` composes `buildingUpgrade.js`'s preview/complete pair, split out
 * purely to keep this file under the 150-line cap.
 *
 * Per-building HP is deliberately NOT a field: GDD 04 / 09 model a single
 * whole-base HP pool — individual buildings are never damaged or destroyed.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { STARTING_LAYOUT } from '../config/BaseConfig.js';
import { BUILDINGS, effectiveMaxLevel, buildingEffect } from '../config/BuildingConfig.js';
import { CORE_RESOURCES, CORE_RESOURCE_KEYS } from '../config/ResourceConfig.js';
import { totalBuildingPower } from '../config/PowerConfig.js';
import { RESOURCE_BUILDING_IDS, resourceProductionAt } from '../config/ResourceBuildingCurve.js';
import { requiredHqLevel } from '../config/BuildingLevelOverrides.js';
import { variantFor } from './DynamicBarracks.js';
import { previewUpgrade, completeUpgrade } from './buildingUpgrade.js';
import { fitsAt, warnIfMisaligned } from './basePlacement.js';

const HQ_ID = 'headquarters';
const BARRACKS_ID = 'barracks';
const DEFAULT_PRODUCES = 'infantry';
const PER_HOUR_KEY = { money: 'moneyPerHour', steel: 'steelPerHour', oil: 'oilPerHour' };
const RESOURCE_KEY_OF_BUILDING = { treasury: 'money', steelworks: 'steel', crude_oil: 'oil' };

export class BaseManager {
  /** @param {import('../utils/EventEmitter.js').EventEmitter} events */
  constructor(events) {
    /** @private */ this._events = events;
    /** @private @type {?import('./ResourceManager.js').ResourceManager} */ this._rm = null;
    /** @private @type {{id:string,level:number,cx:number,cy:number,isActive:boolean,produces?:string,variant?:string}[]} */
    this._buildings = [];
  }

  /** @returns {number} current headquarters level (0 if none) */
  get hqLevel() {
    const hq = this._buildings.find((b) => b.id === HQ_ID);
    return hq ? hq.level : 0;
  }

  /** @returns {object[]} the live building instances (read-only use) */
  get buildings() { return this._buildings; }

  /** @returns {number} TotalBuildingPower — SUM(power of current level of every active building) */
  get totalPower() { return totalBuildingPower(this._buildings, (id) => BUILDINGS[id]?.category); }

  /** Inject the ResourceManager used to pay for upgrades. @param {object} rm @returns {void} */
  setResources(rm) { this._rm = rm; }

  /** @returns {void} seed STARTING_LAYOUT, headquarters first */
  enable() {
    const seed = [...STARTING_LAYOUT].sort((a, b) => Number(b.id === HQ_ID) - Number(a.id === HQ_ID));
    for (let i = 0; i < seed.length; i++) {
      const s = seed[i];
      warnIfMisaligned(s.id, s.cx, s.cy);
      this._add(s.id, s.cx, s.cy, s.level);
    }
  }

  /** @returns {void} */
  disable() { this._buildings.length = 0; }

  /** @param {number} _dt @returns {void} no per-frame work — upgrades are instant */
  update(_dt) {}

  /**
   * Place a new building at a free (cx,cy) cell-unit centre. Respects the
   * per-id `unique` count cap, the headquarters level gate, the current
   * plot's bounds (BaseGridConfig.plotCells), and doesn't overlap another
   * building's own footprint.
   * @param {string} id @param {number} cx @param {number} cy @returns {boolean}
   */
  place(id, cx, cy) {
    if (!BUILDINGS[id] || !this._fits(id, cx, cy)) return false;
    if (this._countOf(id) >= BUILDINGS[id].unique) return false;
    if (effectiveMaxLevel(id, this.hqLevel) < 1) return false;
    if (requiredHqLevel(id, 1) > this.hqLevel) return false;
    this._add(id, cx, cy, 1);
    return true;
  }

  /**
   * Can `id` legally sit at `(cx,cy)` if relocated there — same rule
   * `place()` uses, but excluding the building's OWN current footprint from
   * the overlap check (otherwise it would always collide with itself).
   * @param {string} id @param {number} cx @param {number} cy @returns {boolean}
   */
  canRelocate(id, cx, cy) {
    const b = this._buildings.find((x) => x.id === id);
    return Boolean(b) && this._fits(id, cx, cy, b);
  }

  /**
   * Drag-relocate an already-placed building to a new cell (S54) — instant,
   * no cost (same "no timer" ethos as `upgrade()`). Emits `BUILDING_MOVED`.
   * @param {string} id @param {number} cx @param {number} cy @returns {boolean}
   */
  relocate(id, cx, cy) {
    const b = this._buildings.find((x) => x.id === id);
    if (!b || !this._fits(id, cx, cy, b)) return false;
    b.cx = cx; b.cy = cy;
    this._events.emit(EVENTS.BUILDING_MOVED, { id, index: this._buildings.indexOf(b), cx, cy });
    return true;
  }

  /**
   * Upgrade a building one level — instant: pay `upgradeCost` (resources +
   * materials), apply, emit `BUILDING_UPGRADED`. No timer (see file header).
   * @param {string|number} ref building id, or its index in `buildings`
   * @returns {boolean}
   */
  upgrade(ref) {
    const p = previewUpgrade(this._buildings, this.hqLevel, ref);
    if (!p || !this._rm || !this._rm.spend(p.cost)) return false;
    const ok = completeUpgrade(this._buildings, this._events, ref);
    if (ok) this._emitPower();
    return ok;
  }

  /**
   * Set what a barracks produces — re-derives the variant, instant + reversible
   * (GDD 04). No cost, no timer.
   * @param {number} index barracks index in `buildings`
   * @param {string} cls combat class @returns {boolean}
   */
  setBarracksProduction(index, cls) {
    const b = this._buildings[index];
    if (!b || b.id !== BARRACKS_ID) return false;
    b.produces = cls;
    b.variant = variantFor(cls);
    this._events.emit(EVENTS.BARRACKS_TRANSFORMED, { id: b.id, index, variant: b.variant, cls });
    return true;
  }

  /**
   * Per-hour production of each core resource, summed over active buildings.
   * @param {{money:number,steel:number,oil:number}} out reused scratch
   * @returns {{money:number,steel:number,oil:number}} `out`
   */
  productionByResource(out) {
    out.money = 0; out.steel = 0; out.oil = 0;
    for (let i = 0; i < this._buildings.length; i++) {
      const b = this._buildings[i];
      if (!b.isActive) continue;
      if (RESOURCE_BUILDING_IDS.has(b.id)) {
        out[RESOURCE_KEY_OF_BUILDING[b.id]] += resourceProductionAt(b.level);
        continue;
      }
      const def = BUILDINGS[b.id];
      for (let r = 0; r < CORE_RESOURCE_KEYS.length; r++) {
        const k = CORE_RESOURCE_KEYS[r];
        out[k] += buildingEffect(def, PER_HOUR_KEY[k], b.level);
      }
    }
    return out;
  }

  /**
   * Summed level of the buildings feeding one resource's storage cap.
   * @param {string} key 'money' | 'steel' | 'oil' @returns {number}
   */
  summedLevel(key) {
    const bid = CORE_RESOURCES[key].building;
    let sum = 0;
    for (let i = 0; i < this._buildings.length; i++) {
      if (this._buildings[i].id === bid) sum += this._buildings[i].level;
    }
    return sum;
  }

  /** @private register + announce one building */
  _add(id, cx, cy, level) {
    const b = { id, level, cx, cy, isActive: true };
    if (id === BARRACKS_ID) { b.produces = DEFAULT_PRODUCES; b.variant = variantFor(DEFAULT_PRODUCES); }
    this._buildings.push(b);
    this._events.emit(EVENTS.BUILDING_PLACED, { id, index: this._buildings.length - 1, cx, cy, level, produces: b.produces });
    this._emitPower();
  }

  /** @private TotalBuildingPower moved — tell whoever displays it (TopBar) */
  _emitPower() { this._events.emit(EVENTS.POWER_CHANGED, { total: this.totalPower }); }

  /** @private @param {string} id @param {number} cx @param {number} cy @param {?object} [exclude] see basePlacement.fitsAt @returns {boolean} */
  _fits(id, cx, cy, exclude) { return fitsAt(this._buildings, this.hqLevel, id, { cx, cy }, exclude); }

  /** @private */ _countOf(id) { return this._buildings.filter((b) => b.id === id).length; }
}

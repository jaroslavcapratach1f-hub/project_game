/**
 * DeployedSquad — bookkeeping for one deployed group (GDD 06): a named set of
 * individually-rendered entities that all share ONE UnitStats key. Holds each
 * member's UNIT_STATE; SquadManager owns the event wiring + personnel
 * accounting. Not an Entity, no PixiJS.
 */
import { UNIT_STATE } from '../config/SquadStateConfig.js';

export class DeployedSquad {
  /**
   * @param {string} id
   * @param {string} unitKey UnitStats key (e.g. 'panzer_iv')
   * @param {string} cls UnitStats class (e.g. 'mediumTank')
   */
  constructor(id, unitKey, cls) {
    this.id = id;
    this.unitKey = unitKey;
    this.cls = cls;
    /** @type {?{type:string, targetId?:string}} last order issued to any member (recall CATCH) */
    this.order = null;
    /** @private @type {Map<string,string>} unitId -> UNIT_STATE */
    this._members = new Map();
  }

  /** Register a new member in ACTIVE state (idempotent). @param {string} unitId @returns {void} */
  add(unitId) {
    if (!this._members.has(unitId)) this._members.set(unitId, UNIT_STATE.ACTIVE);
  }

  /** @param {string} unitId @returns {void} */
  remove(unitId) { this._members.delete(unitId); }

  /** @param {string} unitId @returns {?string} current UNIT_STATE, or null if not a member */
  stateOf(unitId) { return this._members.get(unitId) ?? null; }

  /**
   * @param {string} unitId @param {string} to a UNIT_STATE
   * @returns {?string} the previous state, or null if the unit is unknown or unchanged
   */
  setState(unitId, to) {
    const from = this._members.get(unitId);
    if (from === undefined || from === to) return null;
    this._members.set(unitId, to);
    return from;
  }

  /** @returns {number} total members, any state (0 = squad is spent) */
  get size() { return this._members.size; }

  /** @returns {number} members currently ACTIVE */
  activeCount() {
    let n = 0;
    this._members.forEach((s) => { if (s === UNIT_STATE.ACTIVE) n += 1; });
    return n;
  }

  /** @param {(unitId:string, state:string)=>void} cb @returns {void} */
  forEach(cb) { this._members.forEach((state, unitId) => cb(unitId, state)); }
}

/**
 * SquadManager — manages DeployedSquads (GDD 06): named groups of individually
 * rendered entities of ONE UnitStats key. Loop system. It bookkeeps membership
 * + per-unit UNIT_STATE, drives recall/attack through ORDER_* events
 * (EntityManager owns the actual movement), runs the GDD-02 recall CATCH
 * mechanic, and reconciles the personnel pool on death. Spawning entities is
 * the caller's job (a future deploy flow / the dev harness).
 */
import { EVENTS } from '../engine/GameEvents.js';
import { UNIT_STATE, SQUAD_LIFECYCLE } from '../config/SquadStateConfig.js';
import { ALL_UNITS } from '../config/UnitStats.js';
import { ENTITY_COST, squadSize } from '../config/PersonnelConfig.js';
import { DeployedSquad } from './DeployedSquad.js';

export class SquadManager {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('./PersonnelManager.js').PersonnelManager} personnelManager
   */
  constructor(events, entityManager, personnelManager) {
    /** @private */ this._events = events;
    /** @private */ this._em = entityManager;
    /** @private */ this._pm = personnelManager;
    /** @private @type {Map<string,DeployedSquad>} */ this._squads = new Map();
    /** @private @type {Map<string,string>} unitId -> squadId */ this._squadOf = new Map();
    /** @private unitIds currently RECALLED (scanned each tick, alloc-free) */ this._recalled = [];
    /** @private */ this._seq = 0;
    /** @private re-entrancy guard for the recall CATCH */ this._catching = false;
    /** @private cached player base anchor */ this._base = null;
    /** @private */ this._onAttack = (p) => this._catch(p);
    /** @private */ this._onDied = (p) => this._destroy(p);
  }

  /** @returns {void} */
  enable() {
    this._events.on(EVENTS.ORDER_ATTACK, this._onAttack);
    this._events.on(EVENTS.ENTITY_DIED, this._onDied);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.ORDER_ATTACK, this._onAttack);
    this._events.off(EVENTS.ENTITY_DIED, this._onDied);
    this._squads.clear();
    this._squadOf.clear();
    this._recalled.length = 0;
    this._base = null;
  }

  /**
   * Reserve personnel for a new squad and register its member unit ids; the
   * caller then spawns one entity per returned id. Returns `{ squadId: null }`
   * when the pool can't cover it (PERSONNEL_DENIED already emitted).
   * @param {string} unitKey UnitStats key (e.g. 'panzer_iv')
   * @param {number} personnelInvested
   * @returns {{squadId:?string, unitIds:string[]}}
   */
  createSquad(unitKey, personnelInvested) {
    const row = ALL_UNITS[unitKey];
    const cls = row ? row.cls : null;
    const n = cls ? squadSize(personnelInvested, cls, 0) : 0;
    if (!cls || !this._pm.consume(n * (ENTITY_COST[cls] ?? 0))) {
      return { squadId: null, unitIds: [] };
    }
    const squadId = `dsq-${(this._seq += 1)}`;
    const squad = new DeployedSquad(squadId, unitKey, cls);
    this._squads.set(squadId, squad);
    const unitIds = [];
    for (let i = 0; i < n; i += 1) {
      const unitId = `${squadId}-u${i + 1}`;
      unitIds.push(unitId);
      this._register(squad, unitId);
    }
    return { squadId, unitIds };
  }

  /** @param {string} squadId @param {string} unitId @returns {void} */
  addUnit(squadId, unitId) {
    const squad = this._squads.get(squadId);
    if (squad) this._register(squad, unitId);
  }

  /** @param {string} squadId @param {string} unitId @returns {void} */
  removeUnit(squadId, unitId) {
    const squad = this._squads.get(squadId);
    if (!squad) return;
    if (squad.stateOf(unitId) === UNIT_STATE.RECALLED) this._dropRecalled(unitId);
    squad.remove(unitId);
    this._squadOf.delete(unitId);
    if (squad.size === 0) this._squads.delete(squadId); // spent squad — don't leak
  }

  /** @param {string} squadId @returns {number} count of ACTIVE members */
  getSquadSize(squadId) {
    const squad = this._squads.get(squadId);
    return squad ? squad.activeCount() : 0;
  }

  /**
   * Send one unit home: mark RECALLED and emit ORDER_RECALL (EntityManager
   * walks it to base; update() promotes it to HEALING on arrival).
   * @param {string} unitId @returns {void}
   */
  recallUnit(unitId) {
    const squad = this._squadFor(unitId);
    if (!squad || this._transition(squad, unitId, UNIT_STATE.RECALLED) === null) return;
    this._events.emit(EVENTS.ORDER_RECALL, { unitId });
  }

  /** @param {number} _dt seconds (unused — pure state scan) @returns {void} */
  update(_dt) {
    if (this._recalled.length === 0) return;
    const base = this._baseAnchor();
    for (let i = this._recalled.length - 1; i >= 0; i -= 1) {
      const unitId = this._recalled[i];
      const squad = this._squadFor(unitId);
      const e = squad && this._em.get(unitId);
      if (!e || !e.isAlive) { this._dropRecalled(unitId); continue; }
      if (e.moveTarget) continue; // still walking home
      if (e.getDistanceTo(base) <= SQUAD_LIFECYCLE.arriveRadiusPx) {
        this._transition(squad, unitId, UNIT_STATE.HEALING);
      }
    }
  }

  /**
   * Recall CATCH (GDD 02 / CombatConfig.RECALL.followSquadOnAttackOrder): when
   * ANY squad member is ordered to attack, every RECALLED member of that squad
   * flips back to ACTIVE and is re-issued the order — it follows the squad into
   * combat. The player must re-select + re-recall to send it home again.
   * @private @param {{unitId:string, targetId:string}} p ORDER_ATTACK payload
   */
  _catch(p) {
    if (this._catching) return;
    const squad = this._squadFor(p.unitId);
    if (!squad) return;
    squad.order = { type: 'attack', targetId: p.targetId };
    this._catching = true;
    squad.forEach((unitId, state) => {
      if (state !== UNIT_STATE.RECALLED) return;
      this._transition(squad, unitId, UNIT_STATE.ACTIVE);
      this._events.emit(EVENTS.ORDER_HOLD, { unitId }); // drop the walk-home
      this._events.emit(EVENTS.ORDER_ATTACK, { unitId, targetId: p.targetId });
    });
    this._catching = false;
  }

  /** @private @param {{id:string}} p ENTITY_DIED payload */
  _destroy(p) {
    const squad = this._squadFor(p.id);
    if (!squad) return;
    this._transition(squad, p.id, UNIT_STATE.DESTROYED);
    this._pm.deduct(ENTITY_COST[squad.cls] ?? 0);
    this.removeUnit(squad.id, p.id);
  }

  /** @private register a member ACTIVE + announce the null -> ACTIVE transition */
  _register(squad, unitId) {
    squad.add(unitId);
    this._squadOf.set(unitId, squad.id);
    this._emitState(unitId, squad.id, null, UNIT_STATE.ACTIVE);
  }

  /**
   * @private apply a state change, keep `_recalled` in sync, emit SQUAD_UNIT_STATE
   * @returns {?string} previous state, or null if nothing changed
   */
  _transition(squad, unitId, to) {
    const from = squad.setState(unitId, to);
    if (from === null) return null;
    if (from === UNIT_STATE.RECALLED) this._dropRecalled(unitId);
    if (to === UNIT_STATE.RECALLED) this._recalled.push(unitId);
    this._emitState(unitId, squad.id, from, to);
    return from;
  }

  /** @private @param {string} unitId */
  _dropRecalled(unitId) {
    const i = this._recalled.indexOf(unitId);
    if (i !== -1) this._recalled.splice(i, 1);
  }

  /** @private @param {string} unitId @returns {?DeployedSquad} */
  _squadFor(unitId) {
    const id = this._squadOf.get(unitId);
    return id ? this._squads.get(id) ?? null : null;
  }

  /** @private cached player base anchor (world px) */
  _baseAnchor() {
    if (!this._base) this._base = this._em.baseAnchor();
    return this._base;
  }

  /** @private @param {string} unitId @param {string} squadId @param {?string} from @param {string} to */
  _emitState(unitId, squadId, from, to) {
    this._events.emit(EVENTS.SQUAD_UNIT_STATE, { unitId, squadId, from, to });
  }
}

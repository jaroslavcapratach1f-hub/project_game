/**
 * DevPersonnelHarness — dev-only, deletable (gated by RENDER.devPersonnel,
 * composed by DevEntityHarness). Stands up PersonnelManager + SquadManager,
 * deploys one `panzer_iv` DeployedSquad (8 personnel -> 2 tanks) down the
 * player column, and logs PERSONNEL_CHANGED / SQUAD_UNIT_STATE. Split from
 * DevEntityHarness for that file's line cap. Exposes window.pm / window.sm.
 */
import { EVENTS } from './GameEvents.js';
import { PersonnelManager } from '../systems/PersonnelManager.js';
import { SquadManager } from '../systems/SquadManager.js';
import { EntityView } from '../entities/EntityView.js';
import { PanzerIV } from '../entities/tanks/PanzerIV.js';
import { spawnCentre } from './devParade.js';

const RESERVES_BARRACKS_LEVEL = 1;
const DEPLOY_KEY = 'panzer_iv';
const DEPLOY_PERSONNEL = 8; // -> squadSize(8, mediumTank) = 2 tanks
// spawn just LEFT of the base anchor so a recall is a straight +x walk home
// (hull faces +x by default — no start-up turn arc) inside the passable column.
const DEPLOY_SPACING_PX = 60;

export class DevPersonnelHarness {
  constructor() {
    /** @private */ this._pm = null;
    /** @private */ this._sm = null;
    /** @private */ this._loop = null;
    /** @private */ this._events = null;
    /** @private */ this._log = (e) => console.debug('[Personnel]', JSON.stringify(e));
  }

  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../world/Battlefield.js').Battlefield} battlefield
   * @param {import('./GameLoop.js').GameLoop} loop
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @returns {void}
   */
  enable(renderer, events, battlefield, loop, entityManager) {
    this._loop = loop;
    this._events = events;
    this._pm = new PersonnelManager(events, { reservesBarracksLevel: RESERVES_BARRACKS_LEVEL });
    this._pm.enable();
    this._sm = new SquadManager(events, entityManager, this._pm);
    this._sm.enable();
    loop.addSystem(this._pm);
    loop.addSystem(this._sm);
    events.on(EVENTS.PERSONNEL_CHANGED, this._log);
    events.on(EVENTS.SQUAD_UNIT_STATE, this._log);
    this._deploy(renderer, events, battlefield, entityManager);
    if (typeof window !== 'undefined') { window.pm = this._pm; window.sm = this._sm; }
  }

  /** @returns {void} */
  disable() {
    this._loop.removeSystem(this._pm);
    this._loop.removeSystem(this._sm);
    this._events.off(EVENTS.PERSONNEL_CHANGED, this._log);
    this._events.off(EVENTS.SQUAD_UNIT_STATE, this._log);
    this._sm.disable();
    this._pm.disable();
    if (typeof window !== 'undefined') { delete window.pm; delete window.sm; }
    this._pm = this._sm = this._loop = this._events = null;
  }

  /** @private deploy the demo squad: one PanzerIV entity per SquadManager-issued id */
  _deploy(renderer, events, battlefield, entityManager) {
    const { squadId, unitIds } = this._sm.createSquad(DEPLOY_KEY, DEPLOY_PERSONNEL);
    if (!squadId) return;
    const c = spawnCentre(battlefield, 'player');
    for (let i = 0; i < unitIds.length; i += 1) {
      const tank = new PanzerIV({
        id: unitIds[i], team: 'player',
        x: c.x - DEPLOY_SPACING_PX * (i + 1), y: c.y,
        events, battlefield,
      });
      const view = new EntityView(tank);
      view.mount(renderer);
      entityManager.add(tank, view);
    }
  }
}

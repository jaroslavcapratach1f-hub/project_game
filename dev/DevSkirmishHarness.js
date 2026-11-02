/**
 * DevSkirmishHarness — dev-only, deletable (gated by RENDER.devSkirmish,
 * composed by DevEntityHarness like DevAIHarness / DevPersonnelHarness). Stands
 * up the Solo Skirmish stack — a DeploymentScreen, FuryManager + AIManager +
 * SkirmishDirector, and a SkirmishBanner — then opens the deployment screen for
 * a Germany force. Picking a lineup + BEGIN emits SKIRMISH_FORCE_CONFIRMED,
 * which the director consumes and Game turns into the SKIRMISH state. Logs
 * every SKIRMISH_* event, exposes window.sk. Split from DevEntityHarness for
 * that file's line cap.
 */
import { EVENTS } from './GameEvents.js';
import { AIManager } from '../ai/AIManager.js';
import { FuryManager } from '../systems/FuryManager.js';
import { SkirmishDirector } from '../skirmish/SkirmishDirector.js';
import { DeploymentScreen } from '../ui/DeploymentScreen.js';
import { SkirmishBanner } from '../ui/SkirmishBanner.js';
import { EntityView } from '../entities/EntityView.js';
import { InfantrySquadView } from '../entities/infantry/InfantrySquadView.js';
import { DeployableView } from '../entities/artillery/DeployableView.js';
import { RocketLauncherView } from '../entities/rocket-artillery/RocketLauncherView.js';

const DEV_FORCE_FACTION = 'germany'; // Test B roster: SH tank / AT gun time-gated, launcher/howitzer/light gone
const LOG_EVENTS = [
  EVENTS.SKIRMISH_FORCE_CONFIRMED, EVENTS.SKIRMISH_STARTED, EVENTS.SKIRMISH_WAVE_INCOMING,
  EVENTS.SKIRMISH_WAVE_STARTED, EVENTS.SKIRMISH_WAVE_CLEARED, EVENTS.SKIRMISH_ENDED,
];

export class DevSkirmishHarness {
  constructor() {
    /** @private */ this._ai = this._fury = this._director = null;
    /** @private */ this._screen = this._banner = this._loop = null;
    /** @private */ this._log = (e) => console.debug('[Skirmish]', JSON.stringify(e));
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
    this._fury = new FuryManager(entityManager, battlefield, events);
    this._fury.enable();
    this._ai = new AIManager(entityManager, battlefield);
    this._ai.enable(events);
    this._director = new SkirmishDirector(events, entityManager, this._ai, battlefield);
    this._director.setSpawner((e) => this._mount(renderer, entityManager, e));
    this._director.enable();
    this._screen = new DeploymentScreen(renderer, events);
    this._screen.enable();
    this._banner = new SkirmishBanner(renderer, events);
    this._banner.enable();
    for (const sys of [this._fury, this._ai, this._director, this._screen, this._banner]) loop.addSystem(sys);
    for (let i = 0; i < LOG_EVENTS.length; i++) events.on(LOG_EVENTS[i], this._log);
    if (typeof window !== 'undefined') window.sk = this._director;
    this._screen.open(DEV_FORCE_FACTION);
  }

  /** @param {import('../utils/EventEmitter.js').EventEmitter} events @returns {void} */
  disable(events) {
    for (let i = 0; i < LOG_EVENTS.length; i++) events.off(LOG_EVENTS[i], this._log);
    for (const sys of [this._director, this._ai, this._fury, this._screen, this._banner]) this._loop.removeSystem(sys);
    this._director.disable();
    this._ai.disable(events);
    this._fury.disable();
    this._screen.disable();
    this._banner.disable();
    if (typeof window !== 'undefined') delete window.sk;
    this._ai = this._fury = this._director = this._screen = this._banner = this._loop = null;
  }

  /** @private mount the right placeholder view for an entity + register it */
  _mount(renderer, entityManager, entity) {
    const view = viewFor(entity);
    view.mount(renderer);
    entityManager.add(entity, view);
  }
}

/** @param {import('../entities/Entity.js').Entity} e @returns {object} the placeholder view */
function viewFor(e) {
  if (e.cls === 'infantry') return new InfantrySquadView(e);
  if (e.cls === 'howitzer' || e.cls === 'atGun') return new DeployableView(e);
  if (e.cls === 'launcher') return new RocketLauncherView(e);
  return new EntityView(e);
}

/**
 * DevEntityHarness — dev-only, deletable probe (gated by RENDER.devEntities).
 * Builds the entity-backed tactical stack (EntityManager + OrderController +
 * OrderIndicator + RadialMenu + ProjectileSystem + DamageNumbers), then parades
 * one faction's tanks (`DEV.parade`: three or four) + its Gather Truck + one
 * lone 4★ infantry squad down the player spawn column, with one enemy dummy
 * opposite. Replaces DevOrderHarness as the OrderController unit source. Exposes
 * window.em / window.ps / window.dn. Roster data lives in devParade.js.
 */
import { DEV } from '../config/EntityConfig.js';
import { RENDER } from '../config/GameConfig.js';
import { EVENTS } from './GameEvents.js';
import { DevAIHarness } from './DevAIHarness.js';
import { DevPersonnelHarness } from './DevPersonnelHarness.js';
import { DevSkirmishHarness } from './DevSkirmishHarness.js';
import { DevScreensHarness } from './DevScreensHarness.js';
import { HUD } from '../ui/HUD.js';
import { EntityManager } from '../entities/EntityManager.js';
import { EntityView } from '../entities/EntityView.js';
import { Entity } from '../entities/Entity.js';
import { GatherTruck } from '../entities/GatherTruck.js';
import { InfantrySquadView } from '../entities/infantry/InfantrySquadView.js';
import { DeployableView } from '../entities/artillery/DeployableView.js';
import { Katyusha } from '../entities/rocket-artillery/Katyusha.js';
import { RocketLauncherView } from '../entities/rocket-artillery/RocketLauncherView.js';
import { OrderIndicator } from '../ui/OrderIndicator.js';
import { DamageNumbers } from '../ui/DamageNumbers.js';
import { RadialMenu } from '../ui/RadialMenu.js';
import { OrderController } from './OrderController.js';
import { ProjectileSystem } from '../combat/ProjectileSystem.js';
import { EffectsSystem } from '../effects/EffectsSystem.js';
import { VehicleDust } from '../effects/VehicleDust.js';
import {
  PARADE_SPACING_PX, GERMAN_ARMOR, PARADE_BY_FACTION, SQUAD_BY_FACTION,
  ARTY_BY_FACTION, spawnCentre,
} from './devParade.js';

const HALF = 0.5;
const ENEMY_ID = 'enemy-1';
const PARADE_ZOOM = 0.85; // eased out so the whole centred column frames on a phone
const LOG_EVENTS = [
  EVENTS.COMBAT_SHOT, EVENTS.ENTITY_DAMAGED, EVENTS.ENTITY_DIED, EVENTS.PROJECTILE_IMPACT,
];

export class DevEntityHarness {
  constructor() {
    /** @private */ this._mgr = this._indicator = this._menu = this._ctl = null;
    /** @private */ this._ps = this._dmgNums = this._fx = this._dust = null;
    /** @private */ this._devAI = this._devPersonnel = this._devSkirmish = this._hud = null;
    /** @private */ this._devScreens = null;
    /** @private @type {object[]} loop-registered systems */ this._sys = [];
    /** @private */ this._loop = this._events = null;
    /** @private */ this._log = (e) => console.debug('[Entity]', JSON.stringify(e));
  }

  /** @returns {?OrderController} the live controller (Game reads it for pan-suppression) */
  get orderController() { return this._ctl; }

  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('./Camera.js').Camera} camera
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../world/Battlefield.js').Battlefield} battlefield
   * @param {import('./GameLoop.js').GameLoop} loop
   * @returns {void}
   */
  enable(renderer, camera, events, battlefield, loop) {
    this._events = events;
    this._loop = loop;
    this._mgr = new EntityManager(battlefield);
    this._mgr.enable(events);
    this._indicator = new OrderIndicator(renderer);
    this._indicator.enable();
    this._menu = new RadialMenu(renderer.layer('HUD'));
    this._hud = RENDER.devHud ? new HUD(renderer, camera, events, this._mgr) : null;
    this._hud?.enable();
    this._ctl = new OrderController(events, camera, this._indicator, this._menu, this._mgr);
    if (this._hud) this._ctl.setHudHitTest((x, y) => this._hud.isPointOnHud(x, y));
    this._ctl.enable();
    this._fx = new EffectsSystem(renderer, camera, battlefield, events);
    this._fx.enable();
    this._ps = new ProjectileSystem(events, renderer, this._fx.particles, this._mgr, battlefield);
    this._ps.enable();
    this._dmgNums = new DamageNumbers(renderer, events);
    this._dmgNums.enable();
    this._dust = new VehicleDust(this._mgr, this._fx.particles);
    this._dust.enable();
    const list = PARADE_BY_FACTION[DEV.parade] ?? GERMAN_ARMOR;
    const player = this._spawnArmor(renderer, battlefield, list);
    const enemy = this._spawnEnemy(renderer, battlefield);
    this._sys = [this._mgr, this._indicator, this._ps, this._dmgNums, this._fx, this._dust];
    if (this._hud) this._sys.push(this._hud);
    for (let i = 0; i < this._sys.length; i++) loop.addSystem(this._sys[i]);
    this._composeDevHarnesses(renderer, events, battlefield, loop);
    for (let i = 0; i < LOG_EVENTS.length; i++) events.on(LOG_EVENTS[i], this._log);
    camera.zoom = PARADE_ZOOM;
    camera.moveTo((player.x + enemy.x) * HALF, player.y, 0);
    if (typeof window !== 'undefined') Object.assign(window, { em: this._mgr, ps: this._ps, dn: this._dmgNums });
  }

  /**
   * @private Compose the optional dev sub-harnesses (AI / personnel / skirmish /
   * front-end screens) per their RENDER.dev* flags. Split from enable() to keep
   * that method under the complexity cap.
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../world/Battlefield.js').Battlefield} battlefield
   * @param {import('./GameLoop.js').GameLoop} loop
   * @returns {void}
   */
  _composeDevHarnesses(renderer, events, battlefield, loop) {
    this._devAI = RENDER.devAI ? new DevAIHarness() : null;
    this._devAI?.enable(renderer, events, battlefield, loop, this._mgr);
    this._devPersonnel = RENDER.devPersonnel ? new DevPersonnelHarness() : null;
    this._devPersonnel?.enable(renderer, events, battlefield, loop, this._mgr);
    this._devSkirmish = RENDER.devSkirmish ? new DevSkirmishHarness() : null;
    this._devSkirmish?.enable(renderer, events, battlefield, loop, this._mgr);
    this._devScreens = RENDER.devScreens ? new DevScreensHarness() : null;
    this._devScreens?.enable(renderer, events);
  }

  /** @returns {void} */
  disable() {
    for (let i = 0; i < LOG_EVENTS.length; i++) this._events.off(LOG_EVENTS[i], this._log);
    if (this._devAI) { this._devAI.disable(this._events); this._devAI = null; }
    if (this._devPersonnel) { this._devPersonnel.disable(); this._devPersonnel = null; }
    if (this._devSkirmish) { this._devSkirmish.disable(this._events); this._devSkirmish = null; }
    if (this._devScreens) { this._devScreens.disable(); this._devScreens = null; }
    for (let i = 0; i < this._sys.length; i++) this._loop.removeSystem(this._sys[i]);
    this._sys.length = 0;
    this._ctl.disable();
    this._hud?.disable();
    this._ps.disable();
    this._dmgNums.disable();
    this._fx.disable();
    this._dust.disable();
    this._mgr.disable(this._events);
    this._mgr.clear();
    this._menu.destroy();
    this._indicator.disable();
    this._hud = null;
    if (typeof window !== 'undefined') { delete window.em; delete window.ps; delete window.dn; }
    this._mgr = this._indicator = this._menu = this._ctl = null;
    this._ps = this._dmgNums = this._fx = this._dust = null;
  }

  /**
   * @private Spawn the parade as ONE column centred on the player spawn point:
   * tanks, then the Gather Truck, a lone 4★ infantry squad, a lone deployable
   * weapon, and (Russia only) the Katyusha — every unit evenly spaced so the
   * whole column frames around the camera anchor.
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('../world/Battlefield.js').Battlefield} battlefield
   * @param {{Ctor:Function,id:string}[]} list
   * @returns {{x:number,y:number}} the column centre (camera anchor)
   */
  _spawnArmor(renderer, battlefield, list) {
    const c = spawnCentre(battlefield, 'player');
    const specs = this._paradeSpecs(list, battlefield);
    const mid = (specs.length - 1) * HALF;
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const entity = s.make(c.x, c.y + (i - mid) * PARADE_SPACING_PX);
      this._add(renderer, entity, s.view ? s.view(entity) : undefined);
    }
    return { x: c.x, y: c.y };
  }

  /**
   * @private The ordered parade roster as `{ make(x,y), view? }` factories.
   * @param {{Ctor:Function,id:string}[]} list the faction tank column
   * @param {import('../world/Battlefield.js').Battlefield} bf
   * @returns {{make:Function, view?:Function}[]}
   */
  _paradeSpecs(list, bf) {
    const ev = this._events;
    const spawn = (id, x, y, extra) => ({ id, team: 'player', x, y, events: ev, battlefield: bf, ...extra });
    const specs = list.map((t) => ({ make: (x, y) => new t.Ctor(spawn(t.id, x, y)) }));
    const Squad = SQUAD_BY_FACTION[DEV.parade] ?? SQUAD_BY_FACTION.germany;
    const Arty = ARTY_BY_FACTION[DEV.parade] ?? ARTY_BY_FACTION.germany;
    specs.push({ make: (x, y) => new GatherTruck(spawn('truck-1', x, y, { faction: DEV.parade })) });
    specs.push({ make: (x, y) => new Squad(spawn('squad-1', x, y)), view: (e) => new InfantrySquadView(e) });
    specs.push({ make: (x, y) => new Arty(spawn('arty-1', x, y)), view: (e) => new DeployableView(e) });
    if (DEV.parade === 'russia') { // Rocket Launcher is a Russia exclusive
      specs.push({ make: (x, y) => new Katyusha(spawn('katyusha-1', x, y)), view: (e) => new RocketLauncherView(e) });
    }
    return specs;
  }

  /** @private @returns {import('../entities/Entity.js').Entity} */
  _spawnEnemy(renderer, battlefield) {
    const c = spawnCentre(battlefield, 'enemy');
    const d = DEV.enemyDummy;
    const e = new Entity({
      id: ENEMY_ID, team: 'enemy', faction: 'none', cls: 'mediumTank',
      x: c.x, y: c.y, hp: d.hp, def: d.def, armor: d.armor, events: this._events,
    });
    this._add(renderer, e);
    return e;
  }

  /** @private mount an entity's view (default EntityView) + register it */
  _add(renderer, entity, view = new EntityView(entity)) {
    view.mount(renderer);
    this._mgr.add(entity, view);
  }
}

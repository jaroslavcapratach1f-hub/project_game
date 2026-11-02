/**
 * BaseArmy — the player's forces on the world map: a marchable platoon mustered
 * outside the gate + a garrison ringed inside the compound. Owns the shared
 * EntityManager + WorldField + OrderController + RadialMenu (`field` / `em` are
 * shared with WorldCombat + OnslaughtDirector), and a SquadManager that reserves
 * personnel per unit and frees it on death (GDD 06). Routes gestures to orders
 * (tap = select, drag = march, drag onto an enemy = attack). Units are the real
 * Entity stack, keyed from the BASE.army / BASE.garrison rosters through
 * worldmap/unitRoster.js; the platoon is capped at BASE.army.deploySlots and by
 * what the personnel pool can afford.
 */
import { EntityManager } from '../entities/EntityManager.js';
import { SquadManager } from '../systems/SquadManager.js';
import { OrderController } from '../engine/OrderController.js';
import { OrderHexFlow } from '../engine/OrderHexFlow.js';
import { OrderIndicator } from '../ui/OrderIndicator.js';
import { RadialMenu } from '../ui/RadialMenu.js';
import { WorldField } from './WorldField.js';
import { makeUnit } from './unitRoster.js';
import { BASE, STARTING_PLOT_HALF, STARTING_GATE_ANCHOR } from '../config/BaseConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { ALL_UNITS } from '../config/UnitStats.js';
import { ENTITY_COST } from '../config/PersonnelConfig.js';

const HALF = 0.5;
const TWO = 2;
const TWO_PI = Math.PI * 2;
const GARRISON_RING_FRAC = 0.5; // garrison ring radius as a fraction of the plot's smaller half-extent

export class BaseArmy {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../systems/PersonnelManager.js').PersonnelManager} personnel
   * @param {import('../engine/Unit3DLayer.js').Unit3DLayer} unit3D live 3D unit models (S55)
   */
  constructor(renderer, camera, events, personnel, unit3D) {
    this._renderer = renderer;
    this._unit3D = unit3D;
    this._events = events;
    this._field = new WorldField();
    this._em = new EntityManager(this._field);
    this._sm = new SquadManager(events, this._em, personnel);
    this._ind = new OrderIndicator(renderer);
    this._menu = new RadialMenu(renderer.layer('HUD')); // long-press Recall / Hold / Follow
    // S71 hex-lock drag/tap-Go targeting; S74 adds worldEntities so a drag onto
    // any of a base's 7 territory cells locks to its anchor and reads as an attack
    this._hexFlow = new OrderHexFlow(renderer, this._em, this._field.worldEntities, WORLDMAP.hexSize);
    this._order = new OrderController(events, camera, { indicator: this._ind, menu: this._menu, hexFlow: this._hexFlow }, this._em);
    /** @private units deployed inside the compound */ this._garrisonCount = 0;
    /** @private @type {{unitKey:string,id:string}[]} the platoon's own deploy slots, in order (S54 — squad-slot HUD buttons) */
    this._platoon = [];
  }

  /** @returns {WorldField} shared collision / pathing grid */ get field() { return this._field; }
  /** @returns {EntityManager} shared unit registry */ get em() { return this._em; }
  /** @returns {number} garrison units placed (zoomed-out pip count) */ get garrisonCount() { return this._garrisonCount; }
  /** @returns {{unitKey:string,id:string}[]} the platoon's deploy slots, in order (S54 SquadBar) */
  get platoon() { return this._platoon; }

  /**
   * Select a platoon slot's squad — same effect as tapping it on the map
   * (S54 SquadBar). No-op if the slot is empty (never deployed).
   * @param {number} index @returns {void}
   */
  selectSlot(index) {
    const slot = this._platoon[index];
    if (slot) this._order.selectById(slot.id);
  }
  /** @returns {boolean} a squad is being drag-marched (Game suppresses pan) */
  isDraggingUnit() { return this._order.isDraggingUnit(); }

  /** @param {?(sx:number,sy:number)=>boolean} fn HUD tap predicate @returns {void} */
  setHudHitTest(fn) { this._order.setHudHitTest(fn); }

  /** @param {?(sx:number,sy:number)=>?object} fn squad-bar slot under a screen point -> live unit handle @returns {void} */
  setSquadBarSource(fn) { this._order.setSquadBarSource(fn); }

  /** @param {boolean} enabled @returns {void} S78 — suspend/resume unit selection + hex-order targeting while the base's buildings are interactive */
  setOrdersEnabled(enabled) { this._order.setOrdersEnabled(enabled); }

  /** @returns {void} */
  enable() {
    const m = this._musterCentre();
    const c = WORLDMAP.baseCentre;
    this._field.setSpawn('player', m.x, m.y);
    const compoundR = Math.hypot(STARTING_PLOT_HALF.hw, STARTING_PLOT_HALF.hh);
    this._field.setBaseFootprint(c.x, c.y, compoundR); // Base Fury zone
    this._ind.enable();
    this._hexFlow.enable();
    this._em.enable(this._events);
    this._sm.enable();
    this._order.enable();
    this._spawnPlatoon(m);
    this._garrisonCount = this._spawnGarrison(c);
    if (typeof window !== 'undefined') { window.army = this; window.sm = this._sm; }
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._em.update(dt);
    this._sm.update(dt);
    this._ind.update(dt);
  }

  /** @returns {void} */
  disable() {
    this._order.disable();
    this._menu.destroy();
    this._hexFlow.disable();
    this._sm.disable();
    this._em.disable(this._events);
    this._em.clear();
    this._ind.disable();
    if (typeof window !== 'undefined') { delete window.army; delete window.sm; }
  }

  /** @private @returns {{x:number,y:number}} muster ground centre, world px — just outside the gate */
  _musterCentre() {
    const c = WORLDMAP.baseCentre;
    const g = STARTING_GATE_ANCHOR;
    const len = Math.hypot(g.x, g.y);
    const push = (len + BASE.army.musterDropPx) / len;
    return { x: c.x + g.x * push, y: c.y + g.y * push };
  }

  /** @private deploy the platoon in two rows on the muster ground, capped by
   *  BASE.army.deploySlots and the personnel pool; records each slot's id
   *  into `_platoon` (S54 SquadBar) */
  _spawnPlatoon(m) {
    const a = BASE.army;
    const want = Math.min(a.deploySlots, a.roster.length);
    const perRow = Math.ceil(want / TWO);
    for (let i = 0; i < want; i++) {
      const col = i % perRow;
      const row = (i / perRow) | 0;
      const id = this._deploy(a.roster[i],
        m.x + (col - (perRow - 1) * HALF) * a.squadGapPx,
        m.y + row * a.rowGapPx);
      if (!id) break; // personnel pool exhausted
      this._platoon.push({ unitKey: a.roster[i], id });
    }
  }

  /** @private ring the garrison inside the compound (GDD 09 base defense) */
  _spawnGarrison(centre) {
    const g = BASE.garrison;
    const want = Math.min(g.slots, g.roster.length);
    const r = Math.min(STARTING_PLOT_HALF.hw, STARTING_PLOT_HALF.hh) * GARRISON_RING_FRAC;
    let placed = 0;
    for (let i = 0; i < want; i++) {
      const ang = (i / want) * TWO_PI;
      if (!this._deploy(g.roster[i], centre.x + Math.cos(ang) * r, centre.y + Math.sin(ang) * r)) break;
      placed += 1;
    }
    return placed;
  }

  /**
   * @private Reserve personnel for one roster entry and field it. v1 invests a
   * single unit's worth per slot (SquadManager returns one member id); FORWARD:
   * the deploy flow (Phase C) picks personnel per squad, spawning N vehicles.
   * @returns {?string} the deployed entity's id, or null when the pool can't cover it (loop stops)
   */
  _deploy(unitKey, x, y) {
    const cls = ALL_UNITS[unitKey]?.cls;
    if (!cls) { console.warn(`BaseArmy: unknown roster key "${unitKey}"`); return null; }
    const { squadId, unitIds } = this._sm.createSquad(unitKey, ENTITY_COST[cls] ?? 0);
    if (!squadId) return null;
    const { entity, view } = makeUnit(unitKey, {
      id: unitIds[0], team: 'player', x, y, events: this._events, battlefield: this._field,
    });
    view.mount(this._renderer, this._unit3D);
    this._em.add(entity, view);
    return unitIds[0];
  }
}

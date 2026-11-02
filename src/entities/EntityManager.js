/**
 * EntityManager — the field-unit registry. It is a loop system (update every
 * entity + sync every view), the OrderController unit source (unitAt /
 * baseAnchor), and the first consumer of ORDER_* events. Dead views are swept
 * once their wreck fade finishes.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { TILE_SIZE } from '../config/GameConfig.js';
import { resolveHexTarget, placeOnNearestFreeHex } from '../world/HexOccupancy.js';

const HALF = 0.5;
// S57: doubled from 26 alongside every unit's own visual size
// (EntityConfig.js VEHICLE.body, InfantryConfig.js SQUAD.soldier) — a tank's
// sprite grew a lot more than this fixed radius did, so tapping/dragging
// near its edges (turret, barrel) started missing on phone screens even
// though infantry, being visually smaller, still fell comfortably inside
// the old radius either way.
const HIT_RADIUS_PX = 52;

export class EntityManager {
  /** @param {import('../worldmap/WorldField.js').WorldField} battlefield */
  constructor(battlefield) {
    /** @private */ this._bf = battlefield;
    /** @private @type {{entity:object,view:object,handle:object}[]} */ this._rows = [];
    /** @private @type {Map<string,object>} id -> row */ this._byId = new Map();
    /** @private */ this._events = null;
    /** @private @type {?Object<string,Function>} */ this._bound = null;
    this._bf.setUnitQuery(this.forEachWithin.bind(this)); // S80: entityMotion/TankMotor crossing-path avoidance
  }

  /**
   * @param {import('./Entity.js').Entity} entity
   * @param {import('./EntityView.js').EntityView} view
   * @returns {void}
   */
  add(entity, view) {
    placeOnNearestFreeHex(this._bf, entity);
    const handle = {
      id: entity.id, x: entity.x, y: entity.y, isOwn: entity.team === 'player',
      rotation: entity.rotation ?? 0, noTurret: entity.noTurret ?? false,
      // S57: OrderIndicator's selection ring reads rangePx for the
      // weapon-range ring (nonCombat units have neither dmg nor a real
      // range, so this is null for them) and stance to flip the ring
      // green<->red on Entity.STANCE (FuryManager sets this directly on
      // the entity — see Entity.js/FieldFury.js).
      rangePx: entity.rangePx ?? null, stance: entity.stance,
    };
    const row = { entity, view, handle };
    this._rows.push(row);
    this._byId.set(entity.id, row);
    if (this._events) this._events.emit(EVENTS.ENTITY_SPAWNED, { id: entity.id, team: entity.team });
  }

  /** @param {string} id @returns {void} */
  remove(id) {
    const row = this._byId.get(id);
    if (!row) return;
    row.view.unmount();
    this._byId.delete(id);
    const i = this._rows.indexOf(row);
    if (i !== -1) this._rows.splice(i, 1);
  }

  /** Unmount every view and drop all entities. @returns {void} */
  clear() {
    for (let i = 0; i < this._rows.length; i++) this._rows[i].view.unmount();
    this._rows.length = 0;
    this._byId.clear();
  }

  /** @param {string} id @returns {?import('./Entity.js').Entity} */
  get(id) {
    const row = this._byId.get(id);
    return row ? row.entity : null;
  }

  /** @returns {import('../worldmap/WorldField.js').WorldField} the terrain / pathing grid this manager queries */
  get battlefield() { return this._bf; }

  /** @param {(e:import('./Entity.js').Entity)=>void} cb @returns {void} */
  forEach(cb) {
    for (let i = 0; i < this._rows.length; i++) cb(this._rows[i].entity);
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    for (let i = 0; i < this._rows.length; i++) {
      const e = this._rows[i].entity;
      if (e.isAlive) e.update(dt);
    }
    for (let i = this._rows.length - 1; i >= 0; i--) {
      const row = this._rows[i];
      row.handle.x = row.entity.x;
      row.handle.y = row.entity.y;
      row.handle.rotation = row.entity.rotation;
      row.handle.stance = row.entity.stance; // S57: Fury tripping mid-selection
      row.view.sync(row.entity, dt);
      if (!row.entity.isAlive && row.view.wreckDone) this.remove(row.entity.id);
    }
  }

  /**
   * OrderController unit source: entity handle under a world point, or null.
   * The handle is live — its x/y track the entity every tick.
   * @param {number} wx @param {number} wy
   * @returns {?{id:string,x:number,y:number,isOwn:boolean}}
   */
  unitAt(wx, wy) {
    for (let i = 0; i < this._rows.length; i++) {
      const row = this._rows[i];
      if (!row.entity.isAlive) continue;
      const dx = row.entity.x - wx;
      const dy = row.entity.y - wy;
      if (dx * dx + dy * dy <= HIT_RADIUS_PX * HIT_RADIUS_PX) return row.handle;
    }
    return null;
  }

  /**
   * The same live handle `unitAt` returns, looked up directly by id instead
   * of a screen/world point (S54 — a squad-slot HUD button selecting its own
   * unit directly, not via a map tap).
   * @param {string} id @returns {?{id:string,x:number,y:number,isOwn:boolean}}
   */
  handleOf(id) {
    const row = this._byId.get(id);
    return row && row.entity.isAlive ? row.handle : null;
  }

  /**
   * Nearest live entity whose centre is within `q.radiusPx` (scaled by that
   * entity's `bodyScale`, so a bigger tank is a bigger target) of the swept
   * segment (x0,y0)-(x1,y1), earliest along the segment first. Alloc-free —
   * pass a reused `q`.
   * @param {number} x0 @param {number} y0 @param {number} x1 @param {number} y1
   * @param {{excludeId:?string, radiusPx:number}} q
   * @returns {?import('./Entity.js').Entity}
   */
  firstHitAlong(x0, y0, x1, y1, q) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const segLen2 = dx * dx + dy * dy || 1;
    let best = null;
    let bestT = Infinity;
    for (let i = 0; i < this._rows.length; i++) {
      const e = this._rows[i].entity;
      if (!e.isAlive || e.id === q.excludeId) continue;
      let t = ((e.x - x0) * dx + (e.y - y0) * dy) / segLen2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const gx = e.x - (x0 + t * dx);
      const gy = e.y - (y0 + t * dy);
      const r = q.radiusPx * (e.bodyScale ?? 1);
      if (gx * gx + gy * gy <= r * r && t < bestT) {
        best = e;
        bestT = t;
      }
    }
    return best;
  }

  /**
   * Invoke `cb` for every live entity whose centre is within `radiusPx` of
   * (x,y). Alloc-free (no array built).
   * @param {number} x @param {number} y @param {number} radiusPx
   * @param {(e:import('./Entity.js').Entity)=>void} cb
   * @returns {void}
   */
  forEachWithin(x, y, radiusPx, cb) {
    const r2 = radiusPx * radiusPx;
    for (let i = 0; i < this._rows.length; i++) {
      const e = this._rows[i].entity;
      if (!e.isAlive) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) cb(e);
    }
  }

  /** @returns {{x:number,y:number}} player spawn-zone centre, world px */
  baseAnchor() {
    const r = this._bf.spawnColumns('player');
    return {
      x: (r.x0 + r.x1 + 1) * HALF * TILE_SIZE,
      y: (r.y0 + r.y1 + 1) * HALF * TILE_SIZE,
    };
  }

  /** @param {import('../utils/EventEmitter.js').EventEmitter} events @returns {void} */
  enable(events) {
    this._events = events;
    this._bound = {
      // resolveHexTarget: snaps out of solids (nearestOpen) AND off any hex
      // a different unit already rests in (HexOccupancy.nearestFree) — the
      // single chokepoint that keeps every unit on its own unique hex (S71).
      [EVENTS.ORDER_MOVE]: (p) => this._withUnit(p.unitId, (e) => {
        const t = resolveHexTarget(this._bf, p.x, p.y, e.id);
        e.moveTo(t.x, t.y);
        e.clearTarget();
      }),
      // non-combat units (Gather Truck) have no fire path — ignore attack orders
      [EVENTS.ORDER_ATTACK]: (p) => this._withUnit(p.unitId, (e) => {
        if (!e.nonCombat) e.setTarget(this.get(p.targetId));
      }),
      [EVENTS.ORDER_HOLD]: (p) => this._withUnit(p.unitId, (e) => { e.stop(); e.clearTarget(); }),
      [EVENTS.ORDER_RECALL]: (p) => this._withUnit(p.unitId, (e) => {
        const b = this.baseAnchor();
        const t = resolveHexTarget(this._bf, b.x, b.y, e.id);
        e.moveTo(t.x, t.y);
        e.clearTarget();
      }),
    };
    for (const k in this._bound) events.on(k, this._bound[k]);
  }

  /** @param {import('../utils/EventEmitter.js').EventEmitter} events @returns {void} */
  disable(events) {
    if (this._bound) for (const k in this._bound) events.off(k, this._bound[k]);
    this._bound = null;
    this._events = null;
  }

  /** @private @param {string} id @param {(e:import('./Entity.js').Entity)=>void} fn */
  _withUnit(id, fn) {
    const e = this.get(id);
    if (e) fn(e);
  }
}

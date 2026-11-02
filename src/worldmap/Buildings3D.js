/**
 * Buildings3D — owns every live-3D building's `Building3DView`
 * (`Building3DConfig.BUILDING_3D`), subscribes to `BUILDING_PLACED` to learn
 * each one's real grid slot (HQ is always (0,0); every other building's cell
 * comes from `BaseManager`'s seeded layout, same as the 2D buildings), and
 * answers `buildingAt` hit-tests for them — mirrors `BaseGridView`'s own
 * placement/hit-test shape, generalized for buildings that have moved off
 * its 2D `BuildingSprite` path entirely (`BaseGridView._place` skips any id
 * in `BUILDING_3D`).
 *
 * `_entries` is keyed by each building's own TRUE index in
 * `BaseManager.buildings` (every event payload now carries it), not by the
 * bare config id — a multi-unique building (e.g. 5 Military Barracks) gets
 * its own independent `Building3DView` per instance, built reactively the
 * first time its own `BUILDING_PLACED` arrives. Before this, every building
 * sharing one config id collapsed onto a SINGLE pre-created view — placing
 * a 2nd barracks silently repositioned the first one's model instead of
 * adding a second (confirmed live) — because `Base3DLayer`'s own id-keyed
 * Maps would otherwise collide too, `Building3DView` gets a per-instance key
 * (`` `${id}#${index}` ``) distinct from the config id it still uses for
 * type checks (see its own doc). `beginDrag`/`updateDrag`/`endDrag`/
 * `visualPositionOf` stay id-addressed (drag-relocate threading real
 * per-instance identity through `BuildingDragController` is a separate,
 * already-documented gap — see `BuildingContext.js`'s own "Multi-instance
 * limitation" comment) — `_firstFor` resolves "the" instance for a given id
 * the same way `.find()` already did everywhere else, so drag keeps today's
 * exact behaviour, not a regression.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { BUILDING_3D } from '../config/Building3DConfig.js';
import { BASE } from '../config/BaseConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { pxToCellCentre } from '../utils/SquareGrid.js';
import { Building3DView } from './Building3DView.js';

const HALF = 0.5, VIS_EPS = 0.02;

export class Buildings3D {
  /** @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D @param {import('../utils/EventEmitter.js').EventEmitter} events */
  constructor(base3D, events) {
    this._base3D = base3D;
    this._events = events;
    /** @private @type {Map<number,{view:Building3DView, id:string, cx:number, cy:number, level:number}>} keyed by BaseManager.buildings index */
    this._entries = new Map();
    this._onTransformed = (p) => this._entries.get(p.index)?.view.setProduction(p.cls);
    this._onPlaced = (p) => this._place(p);
    this._onUpgraded = (p) => { const e = this._entries.get(p.index); if (e) e.level = p.level; };
    this._onMoved = (p) => { const e = this._entries.get(p.index); if (e) { e.cx = p.cx; e.cy = p.cy; e.view.reposition(p.cx, p.cy); } };
  }

  /** @returns {void} */
  enable() {
    this._events.on(EVENTS.BARRACKS_TRANSFORMED, this._onTransformed);
    this._events.on(EVENTS.BUILDING_PLACED, this._onPlaced);
    this._events.on(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    this._events.on(EVENTS.BUILDING_MOVED, this._onMoved);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.BARRACKS_TRANSFORMED, this._onTransformed);
    this._events.off(EVENTS.BUILDING_PLACED, this._onPlaced);
    this._events.off(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    this._events.off(EVENTS.BUILDING_MOVED, this._onMoved);
    this._entries.forEach((e) => e.view.disable());
  }

  /** @param {string} id @returns {void} no-op if `id` isn't one of ours (S54 BuildingDragController — see BaseSite's dual-owner dispatch) */
  beginDrag(id) { this._firstFor(id)?.view.beginDrag(); }

  /** @param {string} id @param {number} cx @param {number} cy @param {boolean} valid @returns {void} */
  updateDrag(id, cx, cy, valid) { this._firstFor(id)?.view.updateDrag(cx, cy, valid); }

  /** @param {string} id @returns {void} */
  endDrag(id) { this._firstFor(id)?.view.endDrag(); }

  /** @param {number} dt seconds @returns {void} */
  update(dt) { this._entries.forEach((e) => e.view.update(dt)); }

  /** @param {number} reveal 0..1 across `WORLDMAP.lod.buildingBand` @returns {void} */
  setBlend(reveal) { this._entries.forEach((e) => e.view.setBlend(reveal)); }

  /** @param {boolean} hidden @returns {void} force every building (HQ included) hidden regardless of its own reveal (S57 pin-mode swap — see BaseLodPin.js) */
  setForceHidden(hidden) { this._entries.forEach((e) => e.view.setForceHidden(hidden)); }

  /**
   * @param {number} wx @param {number} wy world px @returns {?{id:string,level:number,index:number}} the tapped 3D building, if any
   * Hit-tests against each building's `visualPosition` (S54) — its TRUE
   * `(cx,cy)` for every building except HQ, whose far-zoom stand-in visually
   * sits elsewhere (lerped toward the plot centre) whenever it isn't at full
   * reveal; testing against the true position there would miss every tap
   * that lands where HQ is actually SEEN.
   */
  buildingAt(wx, wy) {
    const c = WORLDMAP.baseCentre;
    const { cx, cy } = pxToCellCentre(wx - c.x, wy - c.y, BASE.grid.cellPx);
    for (const [index, e] of this._entries) {
      if (e.view.scale < VIS_EPS) continue;
      const fp = BUILDING_3D[e.id].footprint;
      const v = e.view.visualPosition;
      if (Math.abs(cx - v.cx) < fp.w * HALF && Math.abs(cy - v.cy) < fp.h * HALF) return { id: e.id, level: e.level, index };
    }
    return null;
  }

  /** @param {string} id @returns {?{cx:number,cy:number}} that id's CURRENTLY RENDERED position (see buildingAt) — for `BuildingContext`'s menu anchor; null if `id` isn't one of ours. Resolves to the FIRST matching instance, same as today's pre-multi-instance behaviour (see this class's own doc) */
  visualPositionOf(id) { return this._firstFor(id)?.view.visualPosition ?? null; }

  /** @private the first known instance for a config id — drag/anchor's existing "just pick one" semantics, not index-aware @param {string} id @returns {?{view:Building3DView,id:string}} */
  _firstFor(id) {
    for (const e of this._entries.values()) if (e.id === id) return e;
    return undefined;
  }

  /** @private @param {{id:string,index:number,cx:number,cy:number,level:number,produces?:string}} p */
  _place(p) {
    if (!BUILDING_3D[p.id]) return;
    let e = this._entries.get(p.index);
    if (!e) {
      const view = new Building3DView(this._base3D, `${p.id}#${p.index}`, p.id, BUILDING_3D[p.id]);
      e = { view, id: p.id, cx: 0, cy: 0, level: 1 };
      this._entries.set(p.index, e);
    }
    e.cx = p.cx; e.cy = p.cy; e.level = p.level;
    e.view.setProduction(p.produces);
    e.view.enable(p.cx, p.cy);
  }
}

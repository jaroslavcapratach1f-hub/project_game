/**
 * BuildingDragController — press-hold-drag base decoration (S54): pick up
 * any relocatable building (Headquarters included — see `Building3DView`'s
 * far-zoom recentre for how it stays visually anchored at far zoom), drag
 * it as a translucent green/red "glass" silhouette (green over a free,
 * grid-legal slot; red otherwise), drop to relocate or release over red to
 * snap back. `defence_wall`/`attack_towers` are perimeter/corner systems
 * with no single position and are never draggable (`NO_GRID_IDS`).
 *
 * Mirrors `OrderController.js`'s shape exactly, but for buildings instead
 * of army units — reuses the SAME drag gesture
 * (`INPUT_DRAG_START`/`MOVE`/`END`, `GestureEmitter.js`) OrderController
 * already uses to drag units, no new input plumbing.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { CELL_PX, footprintOf, snapToFootprintGrid } from '../config/BaseGridConfig.js';
import { pxToCellCentre } from '../utils/SquareGrid.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { NO_GRID_IDS } from '../systems/basePlacement.js';

export class BuildingDragController {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {import('./BaseSite.js').BaseSite} base
   */
  constructor(events, camera, base) {
    this._events = events;
    this._camera = camera;
    this._base = base;
    /** @private @type {?string} */ this._dragId = null;
    /** @private reused world-point scratch */ this._w = { x: 0, y: 0 };
    this._map = [
      [EVENTS.INPUT_DRAG_START, (p) => this._onDragStart(p)],
      [EVENTS.INPUT_DRAG_MOVE, (p) => this._onDragMove(p)],
      [EVENTS.INPUT_DRAG_END, (p) => this._onDragEnd(p)],
    ];
  }

  /** Subscribe to gesture events. @returns {void} */
  enable() {
    for (let i = 0; i < this._map.length; i++) this._events.on(this._map[i][0], this._map[i][1]);
  }

  /** Unsubscribe and reset. @returns {void} */
  disable() {
    for (let i = 0; i < this._map.length; i++) this._events.off(this._map[i][0], this._map[i][1]);
    this._dragId = null;
  }

  /** @returns {boolean} dragging a building (Game suppresses camera-pan, mirrors OrderController.isDraggingUnit) */
  isDraggingBuilding() {
    return Boolean(this._dragId);
  }

  /** @private @param {{x:number,y:number}} p SCREEN px @returns {?{cx:number,cy:number}} snapped compound-local cell centre */
  _cellAt(p) {
    this._camera.screenToWorld(p.x, p.y, this._w);
    const c = WORLDMAP.baseCentre;
    return pxToCellCentre(this._w.x - c.x, this._w.y - c.y, CELL_PX);
  }

  /** @private @param {{x:number,y:number}} p */
  _onDragStart(p) {
    this._camera.screenToWorld(p.x, p.y, this._w);
    const hit = this._base.buildingAt(this._w.x, this._w.y);
    // S63: only the building the player already TAPPED (BuildingContext's
    // relocateArmedId — showing the move-arrows) can actually be picked up.
    // A drag that merely starts over some other, unselected building falls
    // through untouched — Game._wireInput then pans the camera with it
    // instead, exactly like a drag anywhere else on the map. NO_GRID_IDS
    // stays as a defensive second check — BuildingContext never arms one,
    // but nothing here should trust that invariant blindly.
    if (!hit || hit.id !== this._base.relocateArmedId || NO_GRID_IDS.has(hit.id)) return void (this._dragId = null);
    this._dragId = hit.id;
    this._base.beginBuildingDrag(hit.id);
    this._events.emit(EVENTS.BUILDING_DRAG_STARTED, {}); // BuildingContext closes any open menu/panel (S54)
  }

  /** @private @param {{x:number,y:number}} p */
  _onDragMove(p) {
    if (!this._dragId) return;
    const raw = this._cellAt(p);
    const { cx, cy } = snapToFootprintGrid(raw.cx, raw.cy, footprintOf(this._dragId));
    const valid = this._base.base.canRelocate(this._dragId, cx, cy);
    this._base.updateBuildingDrag(this._dragId, cx, cy, valid);
  }

  /** @private @param {{x:number,y:number}} p */
  _onDragEnd(p) {
    const id = this._dragId;
    this._dragId = null;
    if (!id) return;
    const raw = this._cellAt(p);
    const { cx, cy } = snapToFootprintGrid(raw.cx, raw.cy, footprintOf(id));
    this._base.base.relocate(id, cx, cy); // no-op (invalid) if the dropped slot isn't legal — view snaps back either way
    this._base.endBuildingDrag(id);
  }
}

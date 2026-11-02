/** Eight matching timber towers: a pair at every chamfered corner. */
import { EVENTS } from '../engine/GameEvents.js';
import { DefenceInstances } from '../engine/DefenceInstances.js';
import { DEFENCE_KIT_TIERS } from '../config/DefenceKitConfig.js';
import { DEFENCE } from '../config/DefencePerimeterConfig.js';
import { tierOf } from '../config/BuildingArtConfig.js';
import { defenceTowers } from '../systems/DefenceFootprint.js';
import { CELL_PX, footprintOf } from '../config/BaseGridConfig.js';
import { pxToCellCentre, cellCentreToPx, footprintFrontAnchor } from '../utils/SquareGrid.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
const HALF = 0.5, ID = 'attack_towers';

export class AttackTowers3D {
  /** @param {object} base3D @param {object} events @param {string} [idPrefix] @param {object} [originCell] */
  constructor(base3D, events, idPrefix = '', originCell = { cx: 0, cy: 0 }) {
    this._events = events; this._origin = originCell; this._level = 1; this._corners = [];
    this._instances = new DefenceInstances(base3D, originCell);
    this._instances.root.name = `${idPrefix}defence_towers`;
    this._onUpgraded = (p) => { if (p.id === ID) { this._level = p.level; this._rebuild(); } };
  }

  /** @param {number} hqLevel @param {number} [level=1] @returns {Promise<void>} */
  async enable(hqLevel, level = 1) {
    this._level = level; this._corners = defenceTowers(hqLevel);
    this._events.on(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    await this._rebuild();
  }

  /** @private keep independent tower upgrade level; future tier kit swaps preserve placements */
  async _rebuild() {
    const registry = DEFENCE_KIT_TIERS[tierOf(this._level)] ?? DEFENCE_KIT_TIERS[1];
    await this._instances.rebuild(registry, this._corners.map((p) => ({ ...p, asset: 'watchtower', scale: DEFENCE.towerScale })));
  }

  /** @param {number} _reveal towers retain size until pin LOD hides them */
  setBlend(_reveal) {}
  /** @param {boolean} hidden */
  setForceHidden(hidden) { this._instances.root.visible = !hidden; }

  /** @param {number} wx @param {number} wy @returns {?object} existing shared building id and simple footprint hit region */
  buildingAt(wx, wy) {
    const c = WORLDMAP.baseCentre, p = pxToCellCentre(wx - c.x, wy - c.y, CELL_PX), fp = footprintOf(ID);
    const hit = this._corners.find((t) => Math.abs(p.cx - this._origin.cx - t.cx) < fp.w * HALF
      && Math.abs(p.cy - this._origin.cy - t.cy) < fp.h * HALF);
    if (!hit) return null;
    const front = footprintFrontAnchor(fp.w, fp.h, CELL_PX);
    const centre = cellCentreToPx(hit.cx + this._origin.cx, hit.cy + this._origin.cy, CELL_PX);
    return { id: ID, level: this._level, anchor: { x: c.x + centre.x, y: c.y + centre.y + front.frontY } };
  }

  /** @returns {void} */
  disable() { this._events.off(EVENTS.BUILDING_UPGRADED, this._onUpgraded); this._instances.dispose(); }
}

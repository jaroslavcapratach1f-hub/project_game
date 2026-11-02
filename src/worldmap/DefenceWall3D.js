/** Shared modular perimeter owner: layout state, tier assets and instanced dressing. */
import { EVENTS } from '../engine/GameEvents.js';
import { DefenceInstances } from '../engine/DefenceInstances.js';
import { buildDefenceShadows } from '../engine/DefenceContactShadows.js';
import { buildGateApron } from '../engine/DefenceGateApron.js';
import { buildDefenceGround } from '../engine/DefenceGround.js';
import { buildDefenceCables } from '../engine/DefenceCables.js';
import { DefenceLayout } from '../systems/DefenceLayout.js';
import { buildDefenceTrench, disposeDefenceTrench } from '../engine/DefenceTrenchMesh.js';
import { trenchLayout } from '../systems/DefenceTrenches.js';
import { defenceDressing, offsetDefenceRing } from '../systems/DefenceDressing.js';
import { defenceCorners, defenceTowers } from '../systems/DefenceFootprint.js';
import { DEFENCE_WALL_3D } from '../config/DefenceWall3DConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { DEFENCE as C } from '../config/DefencePerimeterConfig.js';
import { tierOf } from '../config/BuildingArtConfig.js';
import { pxToCellCentre } from '../utils/SquareGrid.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
const ID = 'defence_wall';

export class DefenceWall3D {
  /** @param {object} base3D @param {object} events @param {object} [originCell] */
  constructor(base3D, events, originCell = { cx: 0, cy: 0 }) {
    this._events = events; this._origin = originCell;
    this._instances = new DefenceInstances(base3D, originCell);
    this._group = this._instances.root; this._cables = null;
    this._tier = 1; this._level = 1; this._hqLevel = 1; this._active = false; this._revision = 0;
    this._onUpgraded = (p) => {
      if (p.id !== ID) return;
      this._level = p.level; this.layout.level = p.level;
      this._tier = tierOf(p.level); this.rebuild();
    };
  }

  /** @param {number} hqLevel @param {number} [level=1] @returns {Promise<void>} */
  async enable(hqLevel, level = 1) {
    this._active = true; this._hqLevel = hqLevel; this._level = level; this._tier = tierOf(level);
    this.layout = DefenceLayout.perimeter(hqLevel, level);
    this._events.on(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    await this.rebuild();
  }

  /** @returns {Promise<void>} call after layout edits; upgrades keep all existing grid nodes */
  async rebuild() {
    const revision = ++this._revision, corners = defenceCorners(this._hqLevel), towers = defenceTowers(this._hqLevel);
    const gateX = corners[C.gateEdge].cx;
    const walls = this.layout.resolve().filter((p) =>
      !(p.cx === gateX && Math.abs(p.cy) <= C.gateHalfWidth)
      && !towers.some((t) => t.cx === p.cx && t.cy === p.cy));
    walls.push({ asset: 'gate', cx: gateX, cy: 0, rotation: 0 });
    const { props, poles } = defenceDressing(this._hqLevel);
    this._clearCables();
    if (this._apron) { this._apron.removeFromParent(); this._apron.geometry.dispose(); this._apron = null; }
    disposeDefenceTrench(this._trench); this._trench = null;
    this._clearShadows();
    if (this._ground) this._group.remove(this._ground);
    await this._instances.rebuild(DEFENCE_WALL_3D[this._tier] ?? DEFENCE_WALL_3D[1], [...walls, ...props]);
    if (!this._active || revision !== this._revision) return;
    this._cables = buildDefenceCables(poles); this._group.add(this._cables);
    this._shadows = buildDefenceShadows([...walls, ...props.filter((p) => p.asset.startsWith('pine'))]);
    this._group.add(this._shadows);
    this._ground = buildDefenceGround(this._hqLevel); this._group.add(this._ground);
    this._trench = buildDefenceTrench(trenchLayout(offsetDefenceRing(corners, C.trenchOffset)));
    this._group.add(this._trench);
    this._apron = buildGateApron(this._hqLevel); this._group.add(this._apron);
  }

  /** @returns {object} saveable visual state; no independent gameplay persistence backend */
  snapshot() { return this.layout.snapshot(); }

  /** @param {object} snapshot @returns {Promise<void>} replace validated visual state */
  async restore(snapshot) {
    const layout = DefenceLayout.restore(snapshot);
    this.layout = layout; this._level = layout.level; this._tier = tierOf(layout.level);
    await this.rebuild();
  }

  /** @param {number} _reveal existing base LOD interface */
  setBlend(_reveal) {}
  /** @param {boolean} hidden pin-mode culls the whole compound batch */
  setForceHidden(hidden) { this._group.visible = !hidden; }

  /** @param {number} wx @param {number} wy @returns {?object} gate selection uses new shared footprint */
  buildingAt(wx, wy) {
    const c = WORLDMAP.baseCentre, p = pxToCellCentre(wx - c.x, wy - c.y, CELL_PX);
    const gateX = defenceCorners(this._hqLevel)[C.gateEdge].cx;
    return Math.abs(p.cx - this._origin.cx - gateX) < 1 && Math.abs(p.cy - this._origin.cy) < C.gateHalfWidth
      ? { id: ID, level: this._level } : null;
  }

  /** @private */
  _clearCables() {
    if (!this._cables) return;
    this._group.remove(this._cables); this._cables.geometry.dispose(); this._cables.material.dispose(); this._cables = null;
  }

  /** @private */
  _clearShadows() {
    if (!this._shadows) return;
    this._group.remove(this._shadows); this._shadows.dispose(); this._shadows = null;
  }

  /** @returns {void} */
  disable() {
    if (this._apron) { this._apron.removeFromParent(); this._apron.geometry.dispose(); this._apron = null; }
    this._active = false; this._revision++; this._events.off(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    disposeDefenceTrench(this._trench); this._trench = null;
    this._clearCables(); this._clearShadows(); if (this._ground) this._group.remove(this._ground); this._instances.dispose();
  }
}

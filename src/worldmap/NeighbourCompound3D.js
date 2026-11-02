/**
 * NeighbourCompound3D — a neighbour base's real 3D compound (S58), the
 * user's own call: other bases render "exactly as player base," not a flat
 * placeholder icon, mirroring STARTING_LAYOUT (the same seed the player's
 * own compound uses — BaseManager.enable()) since no real per-player
 * persistence/backend exists yet to hold a distinct saved layout. Buildings
 * + wall + corner towers — everything the player's own BaseSite renders,
 * including the same grass and traffic presentation; the relocation grid
 * remains hidden in these read-only neighbour compounds.
 *
 * Reuses the ONE shared `Base3DLayer` scene directly (`setBuildingModel`)
 * for buildings, not a second `Buildings3D` instance — `Buildings3D`'s
 * event-driven `BUILDING_PLACED` flow is wired to the GLOBAL event bus (the
 * player's own `BaseManager`'s events), so a second instance listening on
 * the same bus would also react to the player's own building changes.
 * `DefenceWall3D`/`AttackTowers3D` are reused AS INSTANCES (own class,
 * S58-extended with an optional `idPrefix`/`originCell`), each given a
 * throwaway, never-wired `EventEmitter` so they can't hear the player's own
 * `BUILDING_UPGRADED` events either — a static, read-only "scouting view"
 * never needs any of that live-upgrade wiring.
 *
 * Placement: `Base3DLayer`'s one Three.js scene has ONE coordinate origin,
 * fixed to WORLDMAP.baseCentre (`Base3DLayer.setBaseOrigin`) — every
 * building's grid cell (cx,cy) is relative to THAT point, converted to
 * scene units by the origin-free `cellToScene`. To plant a neighbour
 * compound at ITS OWN world location, its world-px offset from baseCentre
 * is inverse-projected into cell units via the SAME diamond projection
 * `Base3DLayer.update()`'s camera-follow already uses (`pxToCellCentre`) —
 * using a different (e.g. plain axis-divide) conversion here would
 * misplace it relative to where the camera pans, the exact "Unit3D depth/
 * origin bug" class of mistake this project has hit before. S58 also found
 * and fixed a related depth-clipping bug for compounds far from scene
 * origin — see Base3DConfig.js's nearPlane/farPlane doc.
 */
import { CELL_PX } from '../config/BaseGridConfig.js';
import { pxToCellCentre } from '../utils/SquareGrid.js';
import { STARTING_LAYOUT, STARTING_HQ_LEVEL } from '../config/BaseConfig.js';
import { BUILDING_3D } from '../config/Building3DConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { DefenceWall3D } from './DefenceWall3D.js';
import { BaseGround3D } from './BaseGround3D.js';
import { AttackTowers3D } from './AttackTowers3D.js';

export class NeighbourCompound3D {
  /**
   * @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D
   * @param {string} idPrefix unique per neighbour — keeps its building /
   *   tower ids from colliding with the player's own (bare) ids in
   *   Base3DLayer's shared `_models` map
   */
  constructor(base3D, idPrefix) {
    /** @private */ this._base3D = base3D;
    /** @private */ this._prefix = idPrefix;
    /** @private @type {string[]} */ this._ids = [];
    /** @private @type {?DefenceWall3D} constructed in enable(), once its origin is known */ this._wall = null;
    /** @private @type {?AttackTowers3D} */ this._towers = null;
  }

  /**
   * @param {number} worldX @param {number} worldY the neighbour's own compound centre, world px
   * @returns {Promise<void>}
   */
  async enable(worldX, worldY) {
    const c = WORLDMAP.baseCentre;
    const origin = pxToCellCentre(worldX - c.x, worldY - c.y, CELL_PX);
    this._wall = new DefenceWall3D(this._base3D, new EventEmitter(), origin);
    this._towers = new AttackTowers3D(this._base3D, new EventEmitter(), this._prefix, origin);
    this._ground = new BaseGround3D(this._base3D, origin);
    this._ground.enable(STARTING_HQ_LEVEL);
    const loads = [this._wall.enable(STARTING_HQ_LEVEL), this._towers.enable(STARTING_HQ_LEVEL)];
    for (const b of STARTING_LAYOUT) {
      const cfg = BUILDING_3D[b.id];
      if (!cfg) continue; // defence_wall/attack_towers: handled above, not BUILDING_3D entries
      const id = this._prefix + b.id;
      this._ids.push(id);
      loads.push(this._base3D.setBuildingModel(id, cfg.url, origin.cx + b.cx, origin.cy + b.cy, {
        footprint: cfg.footprint, rotationYDeg: cfg.rotationYDeg,
      }));
    }
    await Promise.all(loads);
  }

  /** @param {boolean} visible @returns {void} */
  setVisible(visible) {
    for (let i = 0; i < this._ids.length; i++) this._base3D.setModelScale(this._ids[i], visible ? 1 : 0);
    this._wall.setForceHidden(!visible);
    this._ground.setForceHidden(!visible);
    this._towers.setForceHidden(!visible);
  }

  /** @returns {void} */
  disable() {
    for (let i = 0; i < this._ids.length; i++) this._base3D.removeBuildingModel(this._ids[i]);
    this._ids.length = 0;
    this._wall.disable();
    this._ground.disable();
    this._towers.disable();
  }
}

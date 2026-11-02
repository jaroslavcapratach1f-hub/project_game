/**
 * BaseTerritoryGround — a filled, single continuous outline for every
 * registered base-type WorldEntity's 7-hex territory (S75): the player's
 * own base, and every neighbour. Fixes a real readability problem — the
 * compound's own 3D ground/platform doesn't reach every outer corner of
 * its locked 7-hex territory (the platform is a rounded compound shape,
 * the territory is a hex cluster — different shapes), so WorldHexGrid's
 * ordinary per-tile grid lines were visible poking through the gaps,
 * making one locked territory read as "7 separate hex sections" instead
 * of one cohesive plot. Draws the UNION boundary of the cluster
 * (HexClusterOutline — never 7 individually-outlined hexagons; the shared
 * internal edges are never drawn) as one filled shape, on DECALS same as
 * WorldHexGrid but added AFTER it, so it paves over the grid lines within
 * a base's own territory specifically, without touching the grid anywhere
 * else on the map. Static, like WorldHexGrid — every base here is already
 * placed by the time WorldScene.enable() builds this.
 */
import { Graphics } from 'pixi.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { clusterBoundary } from '../world/HexClusterOutline.js';

const BASE_TYPE = 'base';

export class BaseTerritoryGround {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('./WorldField.js').WorldField} field
   */
  constructor(renderer, field) {
    this._renderer = renderer;
    this._field = field;
    this._g = new Graphics();
  }

  /** @returns {void} draw every currently-registered base entity's territory as one filled shape */
  enable() {
    this._renderer.layer('DECALS').addChild(this._g);
    const t = WORLDMAP.baseTerritoryGround;
    for (const entity of this._field.worldEntities.all()) {
      if (entity.type !== BASE_TYPE) continue;
      const pts = clusterBoundary(entity.cells, WORLDMAP.hexSize);
      if (pts.length === 0) continue;
      this._g.poly(pts.flatMap((p) => [p.x, p.y]));
      this._g.fill({ color: t.fillColor, alpha: t.fillAlpha });
      this._g.stroke({ color: t.strokeColor, width: t.strokeWidthPx, alpha: t.strokeAlpha });
    }
  }

  /** @returns {void} */
  disable() {
    this._g.parent?.removeChild(this._g);
    this._g.destroy();
  }
}

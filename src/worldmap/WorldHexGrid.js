/**
 * WorldHexGrid — every hex tile outline on the world map, always visible
 * (the player's own explicit ask: "make all grids visible in world map" —
 * superseding the earlier base-territory-only version of this feature).
 * Ground level (DECALS, same as TerritoryRing/ground decals) — naturally
 * hidden under the base compound's own 3D composite where it stands, same
 * as any other ground decal a building sits on top of, fully visible
 * everywhere else. Drawn once (static reference grid, not per-tile game
 * state), outline only — no fill, so it reads as a plain reference grid
 * rather than competing with the terrain's own colour.
 */
import { Graphics } from 'pixi.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { hexPolygon } from '../utils/Hex.js';

const HEX_POLY_LEN = 12;

export class WorldHexGrid {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('./WorldField.js').WorldField} field shared world-map hex grid
   */
  constructor(renderer, field) {
    this._renderer = renderer; this._field = field;
    this._g = new Graphics();
  }

  /** @returns {void} */
  enable() {
    this._renderer.layer('DECALS').addChild(this._g);
    const t = WORLDMAP.worldHexGrid;
    this._field.grid.forEach((tile) => {
      const p = this._field.grid.axialToPixel(tile.q, tile.r);
      this._g.poly(hexPolygon(p.x, p.y, WORLDMAP.hexSize, new Array(HEX_POLY_LEN)));
    });
    this._g.stroke({ color: t.strokeColor, width: t.strokeWidthPx, alpha: t.strokeAlpha });
  }

  /** @returns {void} */
  disable() {
    this._g.parent?.removeChild(this._g);
    this._g.destroy();
  }
}

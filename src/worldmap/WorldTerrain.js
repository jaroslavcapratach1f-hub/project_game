/**
 * WorldTerrain — the persistent world map's ground (GDD 17). A flat backdrop
 * rect on LAYERS.SKY (oversized so panning to the edge never shows black), then
 * one batched Graphics per terrain type covering WorldField's hex grid — each
 * hexagon drawn into its tile's type layer and filled from TERRAIN_TYPES.
 * Built once from the painted grid (worldTerrainGen); no per-frame work.
 * FORWARD: roads / sectors / resource fields / camps as map objects.
 */
import { Graphics } from 'pixi.js';
import { hexPolygon } from '../utils/Hex.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { TERRAIN_TYPES } from '../config/TerrainConfig.js';

const BACKDROP_SPAN = 3; // ground rect = this many map-widths, centred on the map
const HEX_POLY_LEN = 12;
const HALF = 0.5;

export class WorldTerrain {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    /** @private */ this._ground = new Graphics();
    /** @private @type {Graphics[]} one per terrain type used */ this._layers = [];
  }

  /**
   * @param {import('../world/TerrainGrid.js').TerrainGrid} grid the painted grid
   * @returns {void}
   */
  enable(grid) {
    const w = WORLDMAP;
    const span = BACKDROP_SPAN;
    this._ground
      .rect(-w.widthPx * (span - 1) * HALF, -w.heightPx * (span - 1) * HALF, w.widthPx * span, w.heightPx * span)
      .fill(w.ground.color);
    this._renderer.layer('SKY').addChild(this._ground);

    /** @type {Map<string, Graphics>} */
    const byType = new Map();
    const c = { x: 0, y: 0 };
    const pts = new Array(HEX_POLY_LEN);
    grid.forEach((tile, q, r) => {
      const type = tile.type;
      let g = byType.get(type);
      if (!g) { g = new Graphics(); byType.set(type, g); }
      grid.axialToPixel(q, r, c);
      hexPolygon(c.x, c.y, grid.size, pts);
      g.poly(pts.slice());
    });

    const layer = this._renderer.layer('TERRAIN');
    for (const [type, g] of byType) {
      g.fill((TERRAIN_TYPES[type] ?? TERRAIN_TYPES.grass).color);
      layer.addChild(g);
      this._layers.push(g);
    }
  }

  /** @returns {void} */
  disable() {
    this._ground.parent?.removeChild(this._ground);
    this._ground.destroy();
    for (let i = 0; i < this._layers.length; i++) {
      this._layers[i].parent?.removeChild(this._layers[i]);
      this._layers[i].destroy();
    }
    this._layers.length = 0;
  }

  /** @param {number} _dt @returns {void} */
  update(_dt) { /* static */ }
}

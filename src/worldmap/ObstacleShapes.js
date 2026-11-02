/**
 * ObstacleShapes — the exact (non-tile-quantized) obstacle shapes WorldField
 * blocks: polygons (the player base's diamond wall) and discs (neighbour-
 * base placeholders). WorldField still flags whole hex tiles `blocked` for
 * Pathfinder's coarse route planning, but a hex tile (~200px) is far
 * coarser than these shapes' own edges — testing a CONTINUOUS point (a
 * march order, a drive-time collision check) against the tile flag it
 * happens to land in either blocks ground that's genuinely clear just
 * outside an edge (S55: "certain spots around the base ignored" even
 * though the map is empty there), or lets a point just past a corner
 * sneak through as open when its tile's own centre tested clear (the
 * earlier "tanks visually get inside the base" bug). `contains` tests the
 * real shape directly, so any exact point is judged correctly regardless
 * of which coarse tile it happens to share with the shape's edge.
 */
import { pointInPolygon } from '../utils/MathUtils.js';

export class ObstacleShapes {
  constructor() {
    /** @private @type {{x:number,y:number}[][]} */ this._polygons = [];
    /** @private @type {{cx:number,cy:number,r2:number}[]} */ this._discs = [];
  }

  /** @param {{x:number,y:number}[]} corners world px, any simple polygon @returns {void} */
  addPolygon(corners) { this._polygons.push(corners); }

  /** @param {number} cx @param {number} cy @param {number} radiusPx @returns {void} */
  addDisc(cx, cy, radiusPx) { this._discs.push({ cx, cy, r2: radiusPx * radiusPx }); }

  /** @param {number} x @param {number} y world px @returns {boolean} true if (x,y) sits inside any registered shape */
  contains(x, y) {
    for (let i = 0; i < this._polygons.length; i++) if (pointInPolygon(x, y, this._polygons[i])) return true;
    for (let i = 0; i < this._discs.length; i++) {
      const d = this._discs[i];
      const dx = x - d.cx, dy = y - d.cy;
      if (dx * dx + dy * dy <= d.r2) return true;
    }
    return false;
  }
}

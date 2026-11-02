/**
 * TerrainGrid — owns the TerrainTiles for a flat-top HEX map: an axial
 * rectangle q∈[0,cols), r∈[0,rows), stored in a Map keyed by utils/Hex.axialKey.
 * Pure data + traversal + world-px⇄axial conversion; no rendering.
 */
import { TerrainTile } from './TerrainTile.js';
import { BATTLEFIELD } from '../config/GameConfig.js';
import { TERRAIN } from '../config/TerrainConfig.js';
import { axialKey, axialToPixel, pixelToAxial, axialRectPixelBounds, rOffset } from '../utils/Hex.js';

export class TerrainGrid {
  /**
   * @param {number} [cols=BATTLEFIELD.hexCols]
   * @param {number} [rows=BATTLEFIELD.hexRows]
   * @param {number} [size=BATTLEFIELD.hexSize] hexagon centre-to-corner px
   */
  constructor(cols = BATTLEFIELD.hexCols, rows = BATTLEFIELD.hexRows, size = BATTLEFIELD.hexSize) {
    /** @type {number} axial q extent */ this.cols = cols;
    /** @type {number} axial r extent */ this.rows = rows;
    /** @type {number} */ this.size = size;
    /** @private @type {Map<number, TerrainTile>} axialKey -> tile */ this._tiles = new Map();
    this.fill(TERRAIN.defaultType);
  }

  /** @returns {number} hex-count width (alias of cols) */ get width() { return this.cols; }
  /** @returns {number} hex-count height (alias of rows) */ get height() { return this.rows; }
  /** @returns {number} world-px extent, x */ get widthPx() { return axialRectPixelBounds(this.cols, this.rows, this.size).width; }
  /** @returns {number} world-px extent, y */ get heightPx() { return axialRectPixelBounds(this.cols, this.rows, this.size).height; }

  /**
   * (Re)create every hex as `type`.
   * @param {string} type a key of TERRAIN_TYPES @returns {void}
   */
  fill(type) {
    this._tiles.clear();
    for (let q = 0; q < this.cols; q++) {
      const off = rOffset(q);
      for (let r = off; r < off + this.rows; r++) this._tiles.set(axialKey(q, r), new TerrainTile(type, q, r));
    }
  }

  /** @param {number} q @param {number} r @returns {boolean} inside the rectangular hex layout */
  inBounds(q, r) {
    if (q < 0 || q >= this.cols) return false;
    const off = rOffset(q);
    return r >= off && r < off + this.rows;
  }

  /** @param {number} q @param {number} r @returns {?TerrainTile} the hex, or null out of bounds */
  tileAt(q, r) { return this._tiles.get(axialKey(q, r)) ?? null; }

  /**
   * Set one hex's terrain type (no-op out of bounds).
   * @param {number} q @param {number} r @param {string} type @returns {void}
   */
  setType(q, r, type) {
    const t = this.tileAt(q, r);
    if (t) t.setType(type);
  }

  /**
   * Visit every hex in (q, r) order.
   * @param {(tile: TerrainTile, q: number, r: number) => void} cb @returns {void}
   */
  forEach(cb) {
    for (let q = 0; q < this.cols; q++) {
      const off = rOffset(q);
      for (let r = off; r < off + this.rows; r++) cb(this._tiles.get(axialKey(q, r)), q, r);
    }
  }

  /**
   * @param {number} q @param {number} r @param {{x:number,y:number}} [out]
   * @returns {{x:number,y:number}} hex centre, world px
   */
  axialToPixel(q, r, out) { return axialToPixel(q, r, this.size, out); }

  /**
   * @param {number} px @param {number} py @param {{q:number,r:number}} [out]
   * @returns {{q:number,r:number}} nearest hex
   */
  pixelToAxial(px, py, out) { return pixelToAxial(px, py, this.size, out); }
}

/**
 * WorldSpawns — team home anchors (retreat/recall targets) + the player
 * base compound's Fury-zone footprint. Split out of WorldField.js (which
 * delegates to an owned instance) to keep it under the 150-line cap now
 * that ObstacleShapes also owns its own file — pure bookkeeping, no
 * grid/pathing logic of its own.
 */
const HALF = 0.5;

export class WorldSpawns {
  /** @param {number} tileSize world px per tile — spawnColumns/isInSpawn work in tile coords */
  constructor(tileSize) {
    /** @private */ this._tileSize = tileSize;
    /** @private team -> world-px anchor (retreat / recall home) */ this._home = {};
    /** @private player base compound {cx, cy, r2} world px, or null (Base Fury zone) */ this._base = null;
  }

  /**
   * Record the player's base compound footprint (world px, circular) — the
   * Fury systems test it via `isInSpawn('player', ...)` so Base Fury trips
   * when an in-compound unit is hit.
   * @param {number} cx @param {number} cy @param {number} radiusPx @returns {void}
   */
  setBaseFootprint(cx, cy, radiusPx) {
    this._base = { cx, cy, r2: radiusPx * radiusPx };
  }

  /**
   * Record a team's home point (world px) — retreat / recall targets read
   * it through `spawnColumns()`'s ×tileSize math.
   * @param {string} side @param {number} wx @param {number} wy @returns {void}
   */
  setSpawn(side, wx, wy) {
    const tx = wx / this._tileSize - HALF;
    const ty = wy / this._tileSize - HALF;
    this._home[side] = { x0: tx, y0: ty, x1: tx, y1: ty };
  }

  /** @param {string} side @returns {{x0:number,y0:number,x1:number,y1:number}} tile rect */
  spawnColumns(side) { return this._home[side] ?? { x0: 0, y0: 0, x1: 0, y1: 0 }; }

  /**
   * @param {string} side @param {number} tx @param {number} ty tile coords
   *   (furyZone passes Math.floor(px / tileSize))
   * @returns {boolean} the tile centre lies inside the player base compound
   */
  isInSpawn(side, tx, ty) {
    if (side !== 'player' || !this._base) return false;
    const dx = (tx + HALF) * this._tileSize - this._base.cx;
    const dy = (ty + HALF) * this._tileSize - this._base.cy;
    return dx * dx + dy * dy <= this._base.r2;
  }
}

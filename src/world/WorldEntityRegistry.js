/**
 * WorldEntityRegistry — the single source of truth for which world-map hex
 * cells are occupied by which STATIC map entity (a base, a future building,
 * a resource node...), keyed through the SAME hex grid every other world
 * system already shares (TerrainGrid/Hex.js) — no second grid, no visual-
 * only coordinates. An entity claims one or more CORE cells atomically from
 * a footprint pattern (HexFootprint.js) resolved around an anchor hex;
 * every CORE cell is stamped `blocked` on the shared TerrainGrid, which is
 * all the existing Pathfinder needs (TerrainTile.movementCost already reads
 * `blocked`) to route around it with no changes of its own.
 *
 * S77: placing an entity ALSO reserves a one-hex-wide BUFFER ring around its
 * core (HexFootprint.bufferCells) — "lock one additional line of hex all
 * the way around... ensuring players don't build bases too close together."
 * The buffer is placement-exclusion ONLY: it is never stamped `blocked`
 * (troops/pathfinding pass through it freely) and never resolves through
 * `entityAt` (a drag/tap in the buffer is NOT the base — only its 7 core
 * cells are). It exists purely so `canPlace` rejects a SECOND entity whose
 * own core would land inside it. Automatic for every caller of `place()` —
 * no per-building opt-in, which is the point: every future map building
 * gets the same minimum spacing for free, same as the 7-cell base territory
 * itself is just one footprint among others, not special-cased here.
 *
 * Deliberately NOT used for live troops/units: those are continuously
 * moving and already have their own correctly-scoped mechanism,
 * `HexOccupancy` (claim-on-arrival, release-on-departure, never blocks
 * Pathfinder, no buffer). This registry is for things that occupy a cell
 * PERMANENTLY once placed — merging the two would make a standing unit a
 * permanent wall. A future 1-hex map object (resource node, small
 * structure) belongs here; a troop does not.
 */
import { axialKey } from '../utils/Hex.js';
import { bufferCells } from './HexFootprint.js';

export class WorldEntityRegistry {
  /** @param {import('./TerrainGrid.js').TerrainGrid} grid the shared world hex grid */
  constructor(grid) {
    /** @private */ this._grid = grid;
    /** @private @type {Map<number,string>} axialKey -> entityId (CORE cells) */ this._byHex = new Map();
    /** @private @type {Map<number,Set<string>>} axialKey -> entityIds whose buffer covers this cell (BUFFER cells — may overlap between entities, that's fine) */
    this._bufferByHex = new Map();
    /** @private @type {Map<string,{id:string,type:string,ownerId:string,anchor:{q:number,r:number},cells:{q:number,r:number}[],buffer:{q:number,r:number}[]}>} */
    this._byId = new Map();
  }

  /**
   * @param {{q:number,r:number}} anchor @param {{dq:number,dr:number}[]} offsets
   * @returns {boolean} every required CORE cell exists, is passable terrain, and is free of both another entity's core AND its buffer
   */
  canPlace(anchor, offsets) {
    for (let i = 0; i < offsets.length; i++) {
      const q = anchor.q + offsets[i].dq, r = anchor.r + offsets[i].dr;
      const tile = this._grid.tileAt(q, r);
      const key = axialKey(q, r);
      if (!tile || !tile.passable || tile.blocked || this._byHex.has(key) || this._bufferByHex.has(key)) return false;
    }
    return true;
  }

  /**
   * Resolve `offsets` around `anchor`, validate every CORE cell, and — only
   * if ALL are free — register them atomically to `id`, stamp each CORE
   * tile `blocked`, and reserve its buffer ring (S77).
   * @param {{id:string,type:string,ownerId:string,anchor:{q:number,r:number},offsets:{dq:number,dr:number}[]}} spec
   * @returns {?object} the placed entity record, or null if any CORE cell was unavailable (nothing is registered on failure)
   */
  place({ id, type, ownerId, anchor, offsets }) {
    if (!this.canPlace(anchor, offsets)) return null;
    const cells = offsets.map((o) => ({ q: anchor.q + o.dq, r: anchor.r + o.dr }));
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      this._byHex.set(axialKey(c.q, c.r), id);
      const tile = this._grid.tileAt(c.q, c.r);
      tile.blocked = true;
      tile.feature = tile.feature ?? type;
    }
    const buffer = bufferCells(cells);
    for (let i = 0; i < buffer.length; i++) this._addBufferOwner(buffer[i], id);
    const entity = { id, type, ownerId, anchor, cells, buffer };
    this._byId.set(id, entity);
    return entity;
  }

  /** Free every CORE + buffer cell `id` holds and drop the record (no-op if unknown). @param {string} id @returns {void} */
  remove(id) {
    const e = this._byId.get(id);
    if (!e) return;
    for (let i = 0; i < e.cells.length; i++) {
      const c = e.cells[i];
      this._byHex.delete(axialKey(c.q, c.r));
      const tile = this._grid.tileAt(c.q, c.r);
      if (tile) { tile.blocked = false; tile.feature = null; }
    }
    for (let i = 0; i < e.buffer.length; i++) this._removeBufferOwner(e.buffer[i], id);
    this._byId.delete(id);
  }

  /** @private @param {{q:number,r:number}} c @param {string} id */
  _addBufferOwner(c, id) {
    const key = axialKey(c.q, c.r);
    let owners = this._bufferByHex.get(key);
    if (!owners) { owners = new Set(); this._bufferByHex.set(key, owners); }
    owners.add(id);
  }

  /** @private @param {{q:number,r:number}} c @param {string} id */
  _removeBufferOwner(c, id) {
    const key = axialKey(c.q, c.r);
    const owners = this._bufferByHex.get(key);
    if (!owners) return;
    owners.delete(id);
    if (owners.size === 0) this._bufferByHex.delete(key);
  }

  /** @param {number} q @param {number} r @returns {?string} the entity id occupying this CORE cell, or null */
  entityIdAt(q, r) { return this._byHex.get(axialKey(q, r)) ?? null; }

  /** @param {number} q @param {number} r @returns {?object} the full entity record occupying this CORE cell, or null */
  entityAt(q, r) {
    const id = this.entityIdAt(q, r);
    return id ? this._byId.get(id) : null;
  }

  /** @param {string} id @returns {?object} the entity record, or null if not registered */
  get(id) { return this._byId.get(id) ?? null; }

  /** @param {number} q @param {number} r @returns {boolean} a CORE cell is occupied here */
  isOccupied(q, r) { return this._byHex.has(axialKey(q, r)); }

  /** @param {number} q @param {number} r @returns {boolean} this cell sits in some entity's BUFFER ring (S77) — never true for a CORE cell of that same entity */
  isBuffered(q, r) { return this._bufferByHex.has(axialKey(q, r)); }

  /** @returns {IterableIterator<object>} every registered entity record (debug viz, inspection) */
  all() { return this._byId.values(); }
}

/**
 * HexOccupancy — one exclusive hex per RESTING live entity (S71 extension,
 * the player's own spec: "each troop on the map should stay on its unique
 * hex, all troops on the map should have his hex"). A pure axial-key
 * registry, owned by WorldField alongside its grid. Only a unit at rest
 * (arrived, or stopped) holds a claim — entityMotion claims on
 * `clearRoute` and releases on a fresh `resolvePath` — so a unit mid-march
 * holds no claim at all, which is exactly what lets a squad straddle two
 * hexes while half of it is still walking (the howitzer splash spec:
 * ProjectileImpact checks live position directly, not this registry).
 */
import { axialKey, axialDistance } from '../utils/Hex.js';

const RING_MAX = 6;

export class HexOccupancy {
  constructor() {
    /** @private @type {Map<number,string>} axialKey -> entityId */ this._byHex = new Map();
    /** @private @type {Map<string,{q:number,r:number}>} entityId -> its claimed hex */ this._byId = new Map();
  }

  /**
   * @param {number} q @param {number} r @param {?string} [exceptId] treat this id's own claim as free
   * @returns {boolean}
   */
  isFree(q, r, exceptId = null) {
    const h = this._byHex.get(axialKey(q, r));
    return h === undefined || h === exceptId;
  }

  /** @param {number} q @param {number} r @returns {?string} occupant id, or null */
  occupantAt(q, r) { return this._byHex.get(axialKey(q, r)) ?? null; }

  /** @param {string} id @returns {?{q:number,r:number}} the hex `id` currently holds, or null */
  hexOf(id) { return this._byId.get(id) ?? null; }

  /**
   * Release `id`'s current claim (no-op if none), then claim (q,r) if free.
   * @param {string} id @param {number} q @param {number} r
   * @returns {boolean} whether the claim is now held by `id`
   */
  claim(id, q, r) {
    const cur = this._byId.get(id);
    if (cur && cur.q === q && cur.r === r) return true;
    if (!this.isFree(q, r, id)) return false;
    this.release(id);
    this._byHex.set(axialKey(q, r), id);
    this._byId.set(id, { q, r });
    return true;
  }

  /** @param {string} id @returns {void} */
  release(id) {
    const cur = this._byId.get(id);
    if (!cur) return;
    this._byHex.delete(axialKey(cur.q, cur.r));
    this._byId.delete(id);
  }

  /**
   * Nearest hex to (q,r) free for `id` — (q,r) itself first, then outward
   * ring by ring. Gives up (returns (q,r) unchanged, letting the caller
   * stack rather than freeze) past RING_MAX.
   * @param {number} q @param {number} r @param {string} id
   * @returns {{q:number,r:number}}
   */
  nearestFree(q, r, id) {
    if (this.isFree(q, r, id)) return { q, r };
    for (let ring = 1; ring <= RING_MAX; ring++) {
      for (let dq = -ring; dq <= ring; dq++) {
        for (let dr = -ring; dr <= ring; dr++) {
          if (axialDistance(0, 0, dq, dr) !== ring) continue;
          if (this.isFree(q + dq, r + dr, id)) return { q: q + dq, r: r + dr };
        }
      }
    }
    return { q, r };
  }
}

/**
 * Resolve an order's raw world-px destination into one that's both on open
 * terrain (WorldField.nearestOpen) AND not another unit's already-claimed
 * hex (HexOccupancy.nearestFree) — the single chokepoint ORDER_MOVE/
 * ORDER_RECALL both resolve through so two units ordered to the same spot
 * fan out instead of stacking.
 * @param {import('../worldmap/WorldField.js').WorldField} field
 * @param {number} wx @param {number} wy @param {string} id
 * @returns {{x:number,y:number}}
 */
export function resolveHexTarget(field, wx, wy, id) {
  const open = field.nearestOpen(wx, wy);
  const a = field.grid.pixelToAxial(open.x, open.y);
  const hex = field.occupancy.nearestFree(a.q, a.r, id);
  return field.grid.axialToPixel(hex.q, hex.r);
}

/**
 * Snap a freshly-spawned entity onto its own exclusive hex, nearest to the
 * spawn point it was already given (so a formation's overall shape — rows,
 * ring — is preserved, just spread to real hex spacing). EntityManager.add's
 * one chokepoint for every spawn path (muster platoon, garrison ring, enemy
 * camp, Onslaught waves) — none of their px-offset placement math is
 * hex-aware on its own.
 * @param {import('../worldmap/WorldField.js').WorldField} field
 * @param {import('../entities/Entity.js').Entity} entity mutated in place
 * @returns {void}
 */
export function placeOnNearestFreeHex(field, entity) {
  const a = field.grid.pixelToAxial(entity.x, entity.y);
  const hex = field.occupancy.nearestFree(a.q, a.r, entity.id);
  const p = field.grid.axialToPixel(hex.q, hex.r);
  entity.x = p.x;
  entity.y = p.y;
  field.occupancy.claim(entity.id, hex.q, hex.r);
}

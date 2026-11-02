/**
 * WorldField — the world map's collision + pathing substrate for marching
 * troops. Wraps a hex `TerrainGrid` sized + aligned to the world map (same
 * BATTLEFIELD.hex* defaults WORLDMAP uses, axial 0,0 at pixel 0,0). All tiles
 * are the default passable terrain for now — FORWARD: real terrain types,
 * roads, water, sectors (GDD 17). Exposes the `Battlefield`-shaped surface that
 * Pathfinder / entityMotion / EntityManager expect.
 */
import { TerrainGrid } from '../world/TerrainGrid.js';
import { TERRAIN } from '../config/TerrainConfig.js';
import { TILE_SIZE } from '../config/GameConfig.js';
import { axialDistance } from '../utils/Hex.js';
import { pointInPolygon } from '../utils/MathUtils.js';
import { ObstacleShapes } from './ObstacleShapes.js';
import { WorldSpawns } from './WorldSpawns.js';
import { HexOccupancy } from '../world/HexOccupancy.js';
import { WorldEntityRegistry } from '../world/WorldEntityRegistry.js';

const GROUND = 'ground';

export class WorldField {
  constructor() {
    /** @type {TerrainGrid} the shared hex terrain grid */
    this.grid = new TerrainGrid();
    /** @private reused px->axial scratch */ this._a = { q: 0, r: 0 };
    /** @private {DecalField|null} ground-decal sink (WorldScene injects it) */ this._decals = null;
    /** @private {?(x:number,y:number,radiusPx:number,cb:(e:object)=>void)=>void} live-unit query (EntityManager injects it, S80) */ this._unitQuery = null;
    /** @private reused axial->px scratch */ this._p = { x: 0, y: 0 };
    /** @private exact obstacle shapes — see isPassable's own doc for why this exists alongside the coarse per-tile `blocked` flag */
    this._shapes = new ObstacleShapes();
    /** @private team home anchors + the base's Fury-zone footprint */ this._spawns = new WorldSpawns(TILE_SIZE);
    /** @type {HexOccupancy} one exclusive hex per resting MOBILE unit (S71) — not for static map entities, see WorldEntityRegistry's own doc */
    this.occupancy = new HexOccupancy();
    /** @type {WorldEntityRegistry} multi-hex occupancy for STATIC map entities — bases, future buildings/resource nodes (S72) */
    this.worldEntities = new WorldEntityRegistry(this.grid);
  }

  /**
   * Stamp every grid tile within `radiusPx` of (cx,cy) `blocked` — a solid
   * circular map object (neighbour base placeholder, later resource field
   * / camp) that Pathfinder routes around, entityMotion won't step onto,
   * `nearestOpen` snaps out of.
   * @param {number} cx @param {number} cy @param {number} radiusPx @returns {void}
   */
  blockDisc(cx, cy, radiusPx) {
    const r2 = radiusPx * radiusPx;
    this.grid.forEach((t) => {
      const p = this.grid.axialToPixel(t.q, t.r, this._p);
      const dx = p.x - cx;
      const dy = p.y - cy;
      if (dx * dx + dy * dy > r2) return;
      t.blocked = true;
      t.feature = t.feature ?? 'obstacle';
    });
    this._shapes.addDisc(cx, cy, radiusPx);
  }

  /**
   * Stamp every grid tile inside polygon `corners` (world px) `blocked` —
   * a solid map object with a non-circular footprint. Built for the player
   * compound's own diamond wall (`SquareGrid.plotCorners`, world-px
   * translated): a circular approximation of that shape either left gaps
   * at the diamond's corners troops could walk straight through into the
   * base, or bulged past its flat edges, blocking open ground outside the
   * wall that should be walkable — both real, reported bugs (S55). The
   * gate is NOT an opening here — it's a locked, visual-only door (the
   * user's own call): the whole perimeter blocks, no exception, matching
   * how player/garrison units are actually placed (direct math, not a
   * march through the gate — see `BaseArmy._spawnPlatoon`/`_spawnGarrison`).
   * @param {{x:number,y:number}[]} corners world px, any simple polygon
   * @returns {void}
   */
  blockPolygon(corners) {
    this.grid.forEach((t) => {
      const p = this.grid.axialToPixel(t.q, t.r, this._p);
      if (!pointInPolygon(p.x, p.y, corners)) return;
      t.blocked = true;
      t.feature = t.feature ?? 'obstacle';
    });
    this._shapes.addPolygon(corners);
  }

  /**
   * Nearest passable tile centre to (wx,wy) — snaps a march drop out of a
   * building / base / obstacle; returns (wx,wy) unchanged when already open.
   * Rings outward, gives up after `maxRings`.
   * @param {number} wx @param {number} wy @param {number} [maxRings=6] @returns {{x:number,y:number}}
   */
  nearestOpen(wx, wy, maxRings = 6) {
    if (this.isPassable(wx, wy)) return { x: wx, y: wy };
    const c = this.grid.pixelToAxial(wx, wy, this._a);
    for (let ring = 1; ring <= maxRings; ring++) {
      for (let dq = -ring; dq <= ring; dq++) {
        for (let dr = -ring; dr <= ring; dr++) {
          if (axialDistance(0, 0, dq, dr) !== ring) continue;
          const t = this.grid.tileAt(c.q + dq, c.r + dr);
          if (!t || t.movementCost === Infinity) continue;
          const p = this.grid.axialToPixel(c.q + dq, c.r + dr);
          return { x: p.x, y: p.y };
        }
      }
    }
    return { x: wx, y: wy };
  }

  /**
   * Wire the ground-decal sink (a `DecalField`). Until set, `addDecal` is inert.
   * @param {?import('../world/DecalField.js').DecalField} sink @returns {void}
   */
  setDecalSink(sink) { this._decals = sink; }

  /**
   * Wire the live-unit query (`EntityManager.forEachWithin`, bound) — S80:
   * lets entityMotion.js/TankMotor check "is another live unit already
   * standing here" for crossing-path avoidance, without WorldField holding
   * a direct EntityManager reference (same injected-callback shape as
   * `setDecalSink`, avoiding a circular import — EntityManager already
   * depends on WorldField, not the other way around).
   * @param {(x:number,y:number,radiusPx:number,cb:(e:object)=>void)=>void} fn
   * @returns {void}
   */
  setUnitQuery(fn) { this._unitQuery = fn; }

  /**
   * Invoke `cb` for every live unit within `radiusPx` of (x,y). No-op until
   * `setUnitQuery` wires it.
   * @param {number} x @param {number} y @param {number} radiusPx @param {(e:object)=>void} cb
   * @returns {void}
   */
  forEachUnitWithin(x, y, radiusPx, cb) { this._unitQuery?.(x, y, radiusPx, cb); }

  /**
   * Record the player's base compound footprint (world px, circular) — the Fury
   * systems test it via `isInSpawn('player', ...)` so Base Fury trips when an
   * in-compound unit is hit. The Legion camp is only a spawn point, not a
   * defended base, so it never registers one.
   * @param {number} cx @param {number} cy @param {number} radiusPx @returns {void}
   */
  setBaseFootprint(cx, cy, radiusPx) { this._spawns.setBaseFootprint(cx, cy, radiusPx); }

  /**
   * Record a team's home point (world px) — retreat / recall targets read it
   * through `spawnColumns()`'s tile math.
   * @param {string} side @param {number} wx @param {number} wy @returns {void}
   */
  setSpawn(side, wx, wy) { this._spawns.setSpawn(side, wx, wy); }

  /** @param {string} side @returns {{x0:number,y0:number,x1:number,y1:number}} tile rect */
  spawnColumns(side) { return this._spawns.spawnColumns(side); }

  /**
   * @param {string} side @param {number} tx @param {number} ty tile coords
   *   (furyZone passes Math.floor(px / TILE_SIZE))
   * @returns {boolean} the tile centre lies inside the player base compound
   */
  isInSpawn(side, tx, ty) { return this._spawns.isInSpawn(side, tx, ty); }

  /**
   * Stamp a ground decal (EffectsSystem passes 'scorch' from an explosion;
   * VehicleDust passes 'track'). No-op until `setDecalSink` wires a `DecalField`.
   * @param {string} type 'track' | 'crater' | 'scorch'
   * @param {number} wx @param {number} wy @param {number} sizePx
   * @param {number} [rotationRad=0] @returns {void}
   */
  addDecal(type, wx, wy, sizePx, rotationRad = 0) {
    this._decals?.add(type, wx, wy, sizePx, rotationRad);
  }

  /** @param {string} type @param {Float32Array} corners four world-space corners */
  addGroundMark(type, corners) { this._decals?.addGroundMark(type, corners); }

  /** @param {number} wx @param {number} wy @returns {?import('../world/TerrainTile.js').TerrainTile} */
  getTileAt(wx, wy) {
    const a = this.grid.pixelToAxial(wx, wy, this._a);
    return this.grid.tileAt(a.q, a.r);
  }

  /**
   * World point -> hex -> WorldEntityRegistry lookup, in one call (the
   * screen-input -> WorldToHex -> registry -> entity pipeline every
   * selection/targeting system should resolve a map entity through).
   * @param {number} wx @param {number} wy @returns {?object} the WorldEntity occupying this point's hex, or null
   */
  entityAt(wx, wy) {
    const a = this.grid.pixelToAxial(wx, wy, this._a);
    return this.worldEntities.entityAt(a.q, a.r);
  }

  /**
   * @param {number} wx @param {number} wy @param {string} [unitDomain='ground']
   * @returns {number} cost to enter the tile under (wx, wy); Infinity off-map
   */
  getMovementCost(wx, wy, unitDomain = GROUND) {
    const t = this.getTileAt(wx, wy);
    if (!t) return TERRAIN.impassableCost;
    if (t.blocksGround && unitDomain === GROUND) return TERRAIN.impassableCost;
    return t.movementCost;
  }

  /**
   * Exact obstacle test at the real point (wx,wy) — NOT the coarse per-tile
   * `blocked` flag (a ~200px hex tile is far coarser than the wall/disc
   * edges it's flagged against; testing the tile instead of the point
   * either blocks ground that's genuinely clear just past an edge, or lets
   * a point just past a corner sneak through — see ObstacleShapes' own
   * doc). `t.blocked` stays the coarse flag Pathfinder's A* plans routes
   * on; this is the precise, continuous answer for any single point —
   * march orders (via nearestOpen/findPath's goal check) and every drive-
   * time step both need the real answer, not the tile-quantized one.
   * @param {number} wx @param {number} wy @param {string} [unitDomain='ground']
   * @returns {boolean}
   */
  isPassable(wx, wy, unitDomain = GROUND) {
    const t = this.getTileAt(wx, wy);
    if (!t || !t.passable) return false;
    if (t.blocksGround && unitDomain === GROUND) return false;
    return !this._shapes.contains(wx, wy);
  }
}

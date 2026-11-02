/**
 * TerrainTile — one hex of the world map. Carries the movement / cover profile
 * pulled from TERRAIN_TYPES plus generator-set flags, and its own axial coord.
 * No PixiJS import: placeholder visuals are batched by the terrain renderer, and
 * `sprite` is reserved for the eventual Blender asset swap.
 */
import { TERRAIN_TYPES, TERRAIN } from '../config/TerrainConfig.js';

export class TerrainTile {
  /**
   * @param {string} type a key of TERRAIN_TYPES
   * @param {number} [q=0] axial coord @param {number} [r=0] axial coord
   */
  constructor(type, q = 0, r = 0) {
    /** @type {number} */ this.q = q;
    /** @type {number} */ this.r = r;
    /** @type {string} */ this.type = type;
    /** @type {boolean} */ this.passable = true;
    /** @type {number} move-speed multiplier */ this.speedMult = 1;
    /** @type {number} 0..1 hit-chance reduction */ this.cover = 0;
    /** @type {boolean} ground units barred even if otherwise passable */ this.blocksGround = false;
    /** @type {boolean} true once a FEATURES prop occupies the tile */ this.blocked = false;
    /** @type {?string} which FEATURES prop blocks this tile */ this.feature = null;
    /** @type {?object} reserved for the Blender asset swap */ this.sprite = null;
    this.setType(type);
  }

  /**
   * Re-pull the type-derived fields (used by generator passes). Leaves
   * `blocked` / `feature` / `sprite` untouched.
   * @param {string} type a key of TERRAIN_TYPES
   * @returns {void}
   */
  setType(type) {
    const def = TERRAIN_TYPES[type] || TERRAIN_TYPES[TERRAIN.defaultType];
    this.type = type;
    this.passable = def.passable;
    this.speedMult = def.speedMult;
    this.cover = def.cover;
    this.blocksGround = def.blocksGround === true;
  }

  /**
   * Cost to enter this tile; Infinity when blocked or impassable.
   * @returns {number}
   */
  get movementCost() {
    if (this.blocked || !this.passable) return TERRAIN.impassableCost;
    return TERRAIN.baseMoveCost / this.speedMult;
  }
}

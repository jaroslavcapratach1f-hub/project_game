/**
 * TerrainConfig — the tactical BATTLE ARENA terrain model: per-type movement
 * and cover, blocking feature props, decal styling, and map-generation tuning.
 *
 * DRAFT: every value is a proposal pending balance sign-off. Grep "REVIEW".
 * Colours reference the CLAUDE.md "VISUAL STYLE" palette where one fits; the
 * road grey and water blue are flagged REVIEW — no such palette entry exists.
 */

/**
 * Per-terrain movement + cover profile. `speedMult` scales unit move speed;
 * `cover` is a 0..1 hit-chance reduction (FORWARD: not yet read by combat);
 * `blocksGround` bars ground units even when the tile reads "passable".
 * @type {Readonly<Record<string, object>>}
 */
export const TERRAIN_TYPES = {
  grass: { passable: true, speedMult: 1.0, cover: 0.1, color: 0x4a5d23 },
  dirt: { passable: true, speedMult: 0.9, cover: 0.05, color: 0x6b4423 },
  road: { passable: true, speedMult: 1.3, cover: 0.0, color: 0x6b6b6b }, // REVIEW: grey, not in CLAUDE.md palette
  concrete: { passable: true, speedMult: 1.1, cover: 0.0, color: 0x8a8a8a },
  mud: { passable: true, speedMult: 0.6, cover: 0.0, color: 0x5c4033 },
  sand: { passable: true, speedMult: 0.8, cover: 0.0, color: 0x8b7355 },
  forest: { passable: true, speedMult: 0.55, cover: 0.3, color: 0x35482a }, // GDD 17 — slow, high cover
  hills: { passable: true, speedMult: 0.7, cover: 0.15, color: 0x6a6238 },  // GDD 17 — slow rising ground
  water: { passable: false, speedMult: 0.0, cover: 0.0, color: 0x2e4a5c, blocksGround: true }, // REVIEW: blue, not in palette
};

/** Global terrain rules shared by every tile. */
export const TERRAIN = {
  defaultType: 'grass',
  baseMoveCost: 1.0, // movementCost = baseMoveCost / speedMult
  impassableCost: Infinity,
  coverReducesHitChance: true, // FORWARD: not yet read by the CombatConfig hit roll
};

/** Blocking props stamped onto tiles (set tile.blocked + tile.feature). */
export const FEATURES = {
  tree: { blocks: true, color: 0x3b5323 },
  building: { blocks: true, color: 0x4a4a4a },
};

/** Pooled ground-decal styling (tracks / craters / scorch). The pool is a ring —
 *  the oldest decal is recycled once `poolSize` is live, so it caps the on-map
 *  count and, at the track stamp cadence, the visible trail length. */
export const DECAL = {
  poolSize: 1200, // bounded pool shared by paired contact strips and combat decals
  tread: { color: 0x282319, alpha: 0.18 },
  wheel: { color: 0x282319, alpha: 0.14 },
  foot: { color: 0x282319, alpha: 0.13 },
  track: { color: 0x000000, alpha: 0.16 },
  crater: { color: 0x000000, alpha: 0.3 },
  scorch: { color: 0x000000, alpha: 0.4 },
};

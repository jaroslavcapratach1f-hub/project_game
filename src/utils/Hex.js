/**
 * Hex — flat-top hexagonal grid math for the world map. Axial coords (q, r) for
 * storage and iteration; cube coords for distance and fractional rounding.
 * `size` is the hexagon's centre-to-corner distance in world px (X axis only —
 * see HEX_HEIGHT_RATIO). Every function is pure; the hot ones take an
 * out-param and allocate nothing.
 *
 * Flat-top layout (Red Blob Games):
 *   x = size · 3/2 · q
 *   y = size · √3 · (r + q/2) · HEX_HEIGHT_RATIO
 * One coordinate system for the whole game — world-map marches, troop movement
 * and AI movement all path on this grid so everything moves the same way.
 *
 * S73: every hex is vertically squashed by HEX_HEIGHT_RATIO (the player's own
 * explicit call: "change hex shape, reduce its height") — a flattened hex
 * reads less tall/pointy and lets the player base's own wide, short wall
 * footprint (DefenceFootprint.defencePolygon) actually fill most of its
 * locked 7-hex territory (WorldMapConfig.baseTerritoryHexes) instead of
 * sitting small in the middle of a much taller cluster — a plain uniform
 * SCALE (CELL_PX) can't fix that: the wall and an UNsquashed 7-hex cluster
 * have fundamentally different aspect ratios (wall ~2:1 wide; a regular-hex
 * cluster ~1:1), so the wall was always bottlenecked by its own east/west
 * corners long before using the available north/south room. 0.46 is not
 * arbitrary — a bisection across ratios (a one-off script, not guessed)
 * found it maximizes the wall's fill of the cluster's bounding box (~64%,
 * vs ~29% unsquashed) without the achievable wall SIZE (CELL_PX) actually
 * shrinking from today's fit. This is a UNIFORM affine transform of the
 * whole coordinate system (both hex centres AND each hex's own corner
 * polygon scale together) — the tiling stays exactly gapless/non-
 * overlapping, same as any uniform scale; only axial (q,r) distance/
 * adjacency math (axialDistance, HEX_DIRS, Pathfinder, A*) is already
 * ratio-independent (pure integer axial coords, never pixels), so nothing
 * about movement/pathfinding topology changes — only pixel-space rendering
 * and world-point↔hex conversion do. Lives here (not a config file, despite
 * CLAUDE.md's usual "tunables live in config") because WorldMapConfig.js
 * already imports FROM this file — importing back would be circular; this
 * is the one deliberate, narrow exception, and the constant is exported so
 * it's still easy to find and retune.
 */

const TWO = 2;
const THREE = 3;
const SIX = 6;
const SQRT3 = Math.sqrt(THREE);
const TWO_THIRDS = TWO / THREE;
const ONE_THIRD = 1 / THREE;
const COL_PITCH = THREE / TWO; // flat-top: adjacent columns are size·3/2 apart
const HALF = 0.5;
const SIXTH_TURN = Math.PI / THREE; // 60° between flat-top hexagon corners

/** S73: vertical squash applied to every hex (<1 flattens; 1 = a regular hexagon) — see this file's own doc. */
export const HEX_HEIGHT_RATIO = 0.46;

/** 6 axial neighbour deltas, clockwise from the east-south-east neighbour. */
export const HEX_DIRS = [
  [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1],
];

/** Flat-top hexagon corner unit offsets (× size), 12 numbers, corner 0 due-east. */
export const HEX_CORNER_UNITS = [];
for (let i = 0; i < SIX; i++) HEX_CORNER_UNITS.push(Math.cos(SIXTH_TURN * i), Math.sin(SIXTH_TURN * i));

/**
 * Fill `out` (length 12) with a flat-top hexagon outline centred on (cx, cy);
 * `size` is centre-to-corner. For Graphics.poly.
 * @param {number} cx @param {number} cy @param {number} size @param {number[]} out
 * @returns {number[]} out
 */
export function hexPolygon(cx, cy, size, out) {
  for (let i = 0; i < SIX; i++) {
    out[i * TWO] = cx + HEX_CORNER_UNITS[i * TWO] * size;
    out[i * TWO + 1] = cy + HEX_CORNER_UNITS[i * TWO + 1] * size * HEX_HEIGHT_RATIO;
  }
  return out;
}

/** The 6 neighbour directions as world-pixel unit vectors (same order as HEX_DIRS; squashed, same as every other pixel-space direction here). */
export const HEX_PX_DIRS = HEX_DIRS.map(([dq, dr]) => {
  const x = COL_PITCH * dq;
  const y = SQRT3 * (dr + dq * HALF) * HEX_HEIGHT_RATIO;
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
});

/**
 * Axial hex → world-pixel centre.
 * @param {number} q @param {number} r @param {number} size centre-to-corner px
 * @param {{x:number,y:number}} [out]
 * @returns {{x:number,y:number}}
 */
export function axialToPixel(q, r, size, out = { x: 0, y: 0 }) {
  out.x = size * COL_PITCH * q;
  out.y = size * SQRT3 * (r + q * HALF) * HEX_HEIGHT_RATIO;
  return out;
}

/**
 * World pixel → nearest axial hex.
 * @param {number} px @param {number} py @param {number} size
 * @param {{q:number,r:number}} [out]
 * @returns {{q:number,r:number}}
 */
export function pixelToAxial(px, py, size, out = { q: 0, r: 0 }) {
  const py2 = py / HEX_HEIGHT_RATIO; // undo the squash before the normal (regular-hex) axial solve
  const qf = (TWO_THIRDS * px) / size;
  const rf = ((-ONE_THIRD * px) + (SQRT3 * ONE_THIRD * py2)) / size;
  return axialRound(qf, rf, out);
}

/**
 * Round fractional axial coords to the nearest hex (via cube rounding).
 * @param {number} qf @param {number} rf @param {{q:number,r:number}} [out]
 * @returns {{q:number,r:number}}
 */
export function axialRound(qf, rf, out = { q: 0, r: 0 }) {
  const xf = qf;
  const zf = rf;
  const yf = -xf - zf;
  let rx = Math.round(xf);
  let ry = Math.round(yf);
  let rz = Math.round(zf);
  const dx = Math.abs(rx - xf);
  const dy = Math.abs(ry - yf);
  const dz = Math.abs(rz - zf);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  out.q = rx;
  out.r = rz;
  return out;
}

/**
 * Grid distance in hex steps between two axial cells.
 * @param {number} q1 @param {number} r1 @param {number} q2 @param {number} r2
 * @returns {number}
 */
export function axialDistance(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) * HALF;
}

/** `axialKey` is collision-free while |q| and |r| stay below this. */
export const HEX_KEY_BOUND = 4096;
const HEX_KEY_STRIDE = HEX_KEY_BOUND * 2;

/**
 * Collision-free integer key for a Map, valid while |q|,|r| < HEX_KEY_BOUND.
 * @param {number} q @param {number} r @returns {number}
 */
export function axialKey(q, r) {
  return (q + HEX_KEY_BOUND) * HEX_KEY_STRIDE + (r + HEX_KEY_BOUND);
}

/**
 * The r-range offset for column `q` in the "rectangular" hex layout: valid r for
 * a column runs [rOffset(q), rOffset(q) + rows). This shifts each column up as q
 * grows so every column's pixel-y span matches — the tiled region is a rectangle
 * rather than a sheared rhombus. `q`, `r`, marches, everything else stay plain
 * axial; this only bounds which hexes exist.
 * @param {number} q @returns {number}
 */
export function rOffset(q) {
  return -Math.floor(q / TWO);
}

/**
 * World-pixel size of the rectangular hex layout, origin at (0,0).
 * @param {number} cols @param {number} rows @param {number} size
 * @returns {{width:number,height:number}}
 */
export function axialRectPixelBounds(cols, rows, size) {
  const width = size * COL_PITCH * (cols - 1);
  const height = size * SQRT3 * (rows - HALF) * HEX_HEIGHT_RATIO;
  return { width, height };
}

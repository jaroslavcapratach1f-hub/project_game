/**
 * HexFootprint — reusable gameplay-footprint PATTERNS for world-map entities
 * (WorldEntityRegistry): a list of relative axial offsets from an anchor
 * hex. Pure data/math, no entity-specific knowledge — a base, a future
 * fortress, a resource node all just pick one of these and hand it to the
 * registry; the registry resolves offsets -> absolute cells around whatever
 * anchor it's given. No footprint here knows or cares what occupies it.
 */
import { HEX_DIRS, axialKey } from '../utils/Hex.js';

const ROTATION_STEPS = 6; // 60° each, a full turn

/** @returns {{dq:number,dr:number}[]} the anchor hex alone — 1 cell (a troop, a resource node, a small building) */
export function singleHex() { return [{ dq: 0, dr: 0 }]; }

/** @returns {{dq:number,dr:number}[]} the anchor + its 6 immediate neighbours — 7 cells total (the player base) */
export function radius1Hex() {
  return [{ dq: 0, dr: 0 }, ...HEX_DIRS.map(([dq, dr]) => ({ dq, dr }))];
}

/**
 * A caller-defined set of relative offsets for an irregular future
 * footprint — returned as-is; the named entry point callers reach for
 * instead of hand-rolling an offset array inline elsewhere.
 * @param {{dq:number,dr:number}[]} offsets
 * @returns {{dq:number,dr:number}[]}
 */
export function customPattern(offsets) { return offsets; }

/**
 * Rotate a footprint pattern by `steps` * 60° (axial cube-coordinate
 * rotation) — groundwork for a future oriented multi-cell structure; no
 * footprint here needs it yet (Radius1Hex is symmetric under rotation).
 * @param {{dq:number,dr:number}[]} offsets @param {number} steps 0-5
 * @returns {{dq:number,dr:number}[]}
 */
export function rotatePattern(offsets, steps) {
  const n = ((steps % ROTATION_STEPS) + ROTATION_STEPS) % ROTATION_STEPS;
  return offsets.map(({ dq, dr }) => {
    let x = dq, z = dr, y = -x - z;
    for (let i = 0; i < n; i++) { const nx = -z, ny = -x, nz = -y; x = nx; y = ny; z = nz; }
    return { dq: x, dr: z };
  });
}

/**
 * Resolve a pattern's relative offsets into absolute axial hexes around `anchor`.
 * @param {{q:number,r:number}} anchor @param {{dq:number,dr:number}[]} offsets
 * @returns {{q:number,r:number}[]}
 */
export function resolvePattern(anchor, offsets) {
  return offsets.map(({ dq, dr }) => ({ q: anchor.q + dq, r: anchor.r + dr }));
}

/**
 * Every hex adjacent to any cell in `cells` but not itself one of `cells` —
 * the minimum-spacing buffer ring around a resolved footprint (S77: "lock
 * one additional line of hex all the way around... ensuring players don't
 * build bases too close together"). Generic over any footprint SHAPE, not
 * just Radius1Hex — a single hex gets its own 6-cell buffer, an irregular
 * custom pattern gets a correctly-shaped one, with no special-casing.
 * Verified (a one-off script, not guessed): for Radius1Hex this gives
 * exactly the 12 cells at hex-distance 2 from the anchor, no duplicates,
 * no overlap with the 7 core cells.
 * @param {{q:number,r:number}[]} cells absolute axial cells (an already-resolved footprint)
 * @returns {{q:number,r:number}[]}
 */
export function bufferCells(cells) {
  const core = new Set(cells.map((c) => axialKey(c.q, c.r)));
  const seen = new Set();
  const out = [];
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    for (let d = 0; d < HEX_DIRS.length; d++) {
      const q = c.q + HEX_DIRS[d][0], r = c.r + HEX_DIRS[d][1];
      const key = axialKey(q, r);
      if (core.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push({ q, r });
    }
  }
  return out;
}

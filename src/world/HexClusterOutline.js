/**
 * HexClusterOutline — the single continuous OUTER boundary of a set of hex
 * cells (axial {q,r}), as one stitched polygon — NOT each cell's own
 * individual hexagon outline. An edge between two cells that are BOTH in
 * the set is internal and never drawn; only edges facing a cell outside
 * the set become part of the boundary. For a Radius1Hex (7-cell) base
 * territory this correctly skips the 3 internal edges every ring cell
 * shares (1 with the centre, 2 with its ring neighbours), leaving exactly
 * 18 outer edges that stitch into one closed 18-gon (verified against the
 * real hex math, not guessed). Pure math, no PixiJS — `BaseTerritoryGround`
 * draws the result.
 */
import { HEX_DIRS, HEX_CORNER_UNITS, HEX_HEIGHT_RATIO, axialKey, axialToPixel } from '../utils/Hex.js';

const SIX = 6;
const TWO = 2;
const EPS = 0.5; // px — endpoint-matching tolerance when stitching

/**
 * @param {{q:number,r:number}[]} cells
 * @param {number} hexSize
 * @returns {{x:number,y:number}[]} one closed loop, world px (not repeating the start point — callers close it themselves, e.g. Graphics.poly does)
 */
export function clusterBoundary(cells, hexSize) {
  const set = new Set(cells.map((c) => axialKey(c.q, c.r)));
  const segments = [];
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    const centre = axialToPixel(c.q, c.r, hexSize);
    for (let d = 0; d < SIX; d++) {
      const [dq, dr] = HEX_DIRS[d];
      if (set.has(axialKey(c.q + dq, c.r + dr))) continue; // shared internal edge — skip
      const e = (SIX - d) % SIX; // HEX_DIRS[d] faces the edge between polygon corners [e, e+1] — see this file's own doc history
      segments.push([corner(centre, e, hexSize), corner(centre, (e + 1) % SIX, hexSize)]);
    }
  }
  return stitch(segments);
}

/** @private flat-top hexagon corner `i` (0-5, corner 0 due east), squashed the same as every other hex-pixel conversion @param {{x:number,y:number}} centre @param {number} i @param {number} size */
function corner(centre, i, size) {
  return { x: centre.x + HEX_CORNER_UNITS[i * TWO] * size, y: centre.y + HEX_CORNER_UNITS[i * TWO + 1] * size * HEX_HEIGHT_RATIO };
}

/** @private walk `segments` end-to-end into one closed loop, by matching each next start point to the loop's last point @param {[{x:number,y:number},{x:number,y:number}][]} segments */
function stitch(segments) {
  if (segments.length === 0) return [];
  const remaining = segments.slice();
  const first = remaining.shift();
  const loop = [first[0], first[1]];
  while (remaining.length > 0) {
    const last = loop[loop.length - 1];
    const idx = remaining.findIndex(([a]) => Math.abs(a.x - last.x) < EPS && Math.abs(a.y - last.y) < EPS);
    if (idx === -1) break; // disconnected input (shouldn't happen for a simply-connected cluster) — return what stitched so far
    loop.push(remaining.splice(idx, 1)[0][1]);
  }
  const last = loop[loop.length - 1];
  if (Math.abs(last.x - loop[0].x) < EPS && Math.abs(last.y - loop[0].y) < EPS) loop.pop(); // last point duplicates the first
  return loop;
}

/**
 * SquareGrid — pure square-cell math for the base's OWN internal build grid
 * (GDD 24 "VISUAL TIER SYSTEM" / GDD 18 base-on-map). The world map stays a
 * flat-top HEX grid (Hex.js) end to end and renders flat top-down — this
 * module projects the base's square grid into the SAME oblique diamond
 * convention every pre-rendered building sprite is captured in (GDD 24
 * locked frame: camera pitched 30° from horizontal — ISO_RATIO = sin(30°)),
 * so the plot's wall/grid visually reads as facing the same way the
 * buildings do, not as a flat top-down rectangle sitting under angled art.
 * No PixiJS.
 */

const HALF = 0.5;
export const ISO_RATIO = 0.5; // screen-Y compression vs screen-X; sin(30°) — matches the locked building camera pitch

/**
 * @param {number} cx @param {number} cy centre offset, cell units (may be
 *   fractional — a building with an even footprint centres between cells)
 * @param {number} cellPx one cell's side, world px (screen WIDTH of one diamond tile)
 * @param {{x:number,y:number}} [out] reused
 * @returns {{x:number,y:number}} compound-local px, diamond-projected
 */
export function cellCentreToPx(cx, cy, cellPx, out = { x: 0, y: 0 }) {
  const hw = cellPx * HALF, hh = cellPx * ISO_RATIO * HALF;
  out.x = (cx - cy) * hw;
  out.y = (cx + cy) * hh;
  return out;
}

/**
 * Inverse of `cellCentreToPx` — a compound-local px point back to cell units.
 * @param {number} x @param {number} y @param {number} cellPx
 * @param {{cx:number,cy:number}} [out] reused
 * @returns {{cx:number,cy:number}}
 */
export function pxToCellCentre(x, y, cellPx, out = { cx: 0, cy: 0 }) {
  const hw = cellPx * HALF, hh = cellPx * ISO_RATIO * HALF;
  const u = x / hw, v = y / hh;
  out.cx = (u + v) * HALF;
  out.cy = (v - u) * HALF;
  return out;
}

/**
 * The diamond's 4 corners, compound-local px, in N,E,S,W order (screen-space:
 * N is topmost, S is bottommost). A `cols` x `rows` plot centred on 0,0.
 * @param {number} cols @param {number} rows @param {number} cellPx
 * @returns {{x:number,y:number}[]}
 */
export function plotCorners(cols, rows, cellPx) {
  const a = cols * HALF, b = rows * HALF;
  const p = (cx, cy) => cellCentreToPx(cx, cy, cellPx);
  return [p(-a, -b), p(a, -b), p(a, b), p(-a, b)]; // N, E, S, W
}

/**
 * Half-width / half-height of the diamond's screen-space bounding box for a
 * `cols` x `rows` plot centred on 0,0.
 * @param {number} cols @param {number} rows @param {number} cellPx
 * @returns {{hw:number,hh:number}} px
 */
export function plotHalfExtents(cols, rows, cellPx) {
  const s = (cols + rows) * HALF;
  return { hw: s * cellPx * HALF, hh: s * cellPx * ISO_RATIO * HALF };
}

/**
 * A single `w` x `h` footprint's own ground-contact geometry, relative to
 * its own centre (i.e. relative to `cellCentreToPx(cx,cy,...)`, wherever
 * that footprint is actually placed) — what a pre-rendered sprite needs to
 * exactly fill its footprint edge-to-edge (CLAUDE.md "BUILDING VISUAL
 * GUARDRAILS"): the footprint diamond's E-to-W span (every sprite's alpha-
 * cropped width scales to this) and how far below the footprint's own
 * centre its bottommost point (the S corner — the frontmost, closest-to-
 * viewer vertex, GDD 24 "Ground contact") sits (every sprite's alpha-
 * cropped bottom edge lands here). No horizontal offset: the diamond's E
 * and W corners are always mirror-symmetric about the footprint's own
 * centre x (`E.x === -W.x`, for ANY w,h — verified against `plotCorners`'s
 * corner formula), so a sprite's own bounding-box centre already lines up
 * with the footprint centre horizontally, even for an oblong (w !== h)
 * footprint whose S corner itself sits off-centre.
 * @param {number} w @param {number} h cell units @param {number} cellPx
 * @returns {{frontY:number,width:number}} px, relative to the footprint centre
 */
export function footprintFrontAnchor(w, h, cellPx) {
  const a = w * HALF, b = h * HALF;
  const hw = cellPx * HALF, hh = cellPx * ISO_RATIO * HALF;
  return { frontY: (a + b) * hh, width: (a + b) * hw * 2 };
}

export const SEG_STRIDE = 4; // x1,y1,x2,y2 per grid line — iterate gridLineSegments() by this

/**
 * Every interior grid line, diamond-projected, as flat [x1,y1,x2,y2, ...]
 * endpoint pairs (constant-cx lines first, then constant-cy), compound-local
 * px, centred on 0,0 — feed SEG_STRIDE numbers at a time to `Graphics.moveTo/lineTo`.
 * @param {number} cols @param {number} rows @param {number} cellPx
 * @returns {number[]}
 */
export function gridLineSegments(cols, rows, cellPx) {
  const a = cols * HALF, b = rows * HALF;
  const segs = [];
  for (let i = 0; i <= cols; i++) {
    const cx = -a + i;
    const p1 = cellCentreToPx(cx, -b, cellPx), p2 = cellCentreToPx(cx, b, cellPx);
    segs.push(p1.x, p1.y, p2.x, p2.y);
  }
  for (let j = 0; j <= rows; j++) {
    const cy = -b + j;
    const p1 = cellCentreToPx(-a, cy, cellPx), p2 = cellCentreToPx(a, cy, cellPx);
    segs.push(p1.x, p1.y, p2.x, p2.y);
  }
  return segs;
}

/**
 * Does footprint `fp` ({cx,cy,w,h}, cell units) fit inside a `cols` x `rows`
 * plot centred on 0,0? Pure grid-unit math — unaffected by projection.
 * @param {{cx:number,cy:number,w:number,h:number}} fp @param {number} cols @param {number} rows
 * @returns {boolean}
 */
export function footprintInPlot(fp, cols, rows) {
  const hw = cols * HALF, hh = rows * HALF;
  return Math.abs(fp.cx) + fp.w * HALF <= hw && Math.abs(fp.cy) + fp.h * HALF <= hh;
}

/**
 * Do two axis-aligned footprints ({cx,cy,w,h}, cell units) overlap? Pure
 * grid-unit math — unaffected by projection.
 * @param {{cx:number,cy:number,w:number,h:number}} a @param {{cx:number,cy:number,w:number,h:number}} b
 * @returns {boolean}
 */
export function footprintsOverlap(a, b) {
  return Math.abs(a.cx - b.cx) < (a.w + b.w) * HALF && Math.abs(a.cy - b.cy) < (a.h + b.h) * HALF;
}

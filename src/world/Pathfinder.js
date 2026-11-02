/**
 * Pathfinder — 6-neighbour hex A* over a Battlefield's TerrainGrid, using
 * TerrainTile.movementCost (Infinity = impassable: water, buildings, blocked
 * features). Pure: no PixiJS, no per-frame cost — call it ONCE per move order,
 * never from update(dt). Input world px; output a world-px waypoint array (hex
 * centres, collinear runs removed, last point = the exact goal) or null when the
 * goal hex is unreachable / off-map.
 *
 * Marches, troop movement and AI movement all resolve through here, so the whole
 * game moves on the same hex grid. Static terrain only — unit-to-unit avoidance
 * is a separate future session.
 */
import { TERRAIN, TERRAIN_TYPES } from '../config/TerrainConfig.js';
import { HEX_DIRS, axialDistance, axialKey } from '../utils/Hex.js';
import { PriorityQueue } from './PriorityQueue.js';

const COLLINEAR_EPS = 1e-6;
// admissible heuristic weight = the cheapest a single hex step can ever cost
const MAX_SPEED_MULT = Math.max(...Object.values(TERRAIN_TYPES).map((t) => t.speedMult || 1));
const MIN_STEP_COST = TERRAIN.baseMoveCost / MAX_SPEED_MULT;

/**
 * @param {import('../worldmap/WorldField.js').WorldField} battlefield
 * @param {number} sx @param {number} sy start, world px
 * @param {number} gx @param {number} gy goal, world px
 * @returns {?Array<{x:number,y:number}>} waypoints (start excluded), or null
 */
export function findPath(battlefield, sx, sy, gx, gy) {
  const grid = battlefield.grid;
  const s = grid.pixelToAxial(sx, sy);
  const g = grid.pixelToAxial(gx, gy);
  // The EXACT goal point, not its containing hex tile's own centre (S55: a
  // hex tile is ~200px across, far coarser than the wall it's flagged
  // against — a goal that's genuinely clear ground could still share a
  // tile with the wall's edge and get its centre flagged `blocked`; battle-
  // field.isPassable checks the real point against the real obstacle
  // shape, see its own doc, so a visually-open tap is never rejected here).
  if (!grid.tileAt(g.q, g.r) || !battlefield.isPassable(gx, gy)) return null;
  if (s.q === g.q && s.r === g.r) return [{ x: gx, y: gy }];

  // search state, bundled into one object so expandNeighbors stays under
  // the file's own param-count lint cap
  const st = {
    grid, g, cameFrom: new Map(), gScore: new Map([[axialKey(s.q, s.r), 0]]), open: new PriorityQueue(),
  };
  st.open.push({ q: s.q, r: s.r }, axialDistance(s.q, s.r, g.q, g.r) * MIN_STEP_COST);
  const cap = grid.cols * grid.rows;

  const start = { x: sx, y: sy };
  const goalPx = { x: gx, y: gy };
  for (let seen = 0; st.open.size > 0 && seen < cap; seen++) {
    const cur = st.open.pop();
    if (cur.q === g.q && cur.r === g.r) return rebuild(st.cameFrom, grid, cur, start, goalPx);
    expandNeighbors(st, cur);
  }
  return null;
}

/**
 * @private push every open, in-budget neighbour of `cur` onto `st.open`,
 * updating `st.gScore`/`st.cameFrom` — the goal's OWN hex (`st.g`) is a
 * special case: its coarse `blocked` flag can be true (its hex shares
 * ground with the wall) even though findPath already proved the EXACT goal
 * point sits outside every real obstacle shape (battlefield.isPassable,
 * not this tile-quantized flag). Every other tile whose flag is set stays
 * rejected (real terrain-block, or genuinely deep in an obstacle) — only
 * the specific hex already proved reachable gets waved through, at
 * ordinary terrain cost instead of the Infinity its coarse flag would
 * otherwise carry.
 * @param {{grid:object,g:{q:number,r:number},gScore:Map,cameFrom:Map,open:PriorityQueue}} st
 * @param {{q:number,r:number}} cur @returns {void}
 */
function expandNeighbors(st, cur) {
  const { grid, g, gScore, cameFrom, open } = st;
  const curG = gScore.get(axialKey(cur.q, cur.r));
  for (let n = 0; n < HEX_DIRS.length; n++) {
    const nq = cur.q + HEX_DIRS[n][0];
    const nr = cur.r + HEX_DIRS[n][1];
    const tile = grid.tileAt(nq, nr);
    if (!tile) continue;
    const isGoalTile = nq === g.q && nr === g.r;
    if (tile.movementCost === Infinity && !isGoalTile) continue;
    const stepCost = isGoalTile && tile.movementCost === Infinity ? TERRAIN.baseMoveCost : tile.movementCost;
    const nKey = axialKey(nq, nr);
    const tentative = curG + stepCost;
    if (tentative >= (gScore.get(nKey) ?? Infinity)) continue;
    gScore.set(nKey, tentative);
    cameFrom.set(nKey, cur);
    open.push({ q: nq, r: nr }, tentative + axialDistance(nq, nr, g.q, g.r) * MIN_STEP_COST);
  }
}

/**
 * Walk cameFrom back to the start, emit forward world-px waypoints (hex
 * centres), strip collinear runs (anchored on the real start), drop the start,
 * and pin the final point to the exact goal.
 * @param {Map} cameFrom @param {object} grid @param {{q:number,r:number}} goalNode
 * @param {{x:number,y:number}} start @param {{x:number,y:number}} goalPx
 * @returns {Array<{x:number,y:number}>}
 */
function rebuild(cameFrom, grid, goalNode, start, goalPx) {
  const cells = [];
  let cur = goalNode;
  while (cur) {
    cells.push(cur);
    cur = cameFrom.get(axialKey(cur.q, cur.r));
  }
  const pts = [{ x: start.x, y: start.y }]; // start anchor for the collinear collapse
  const c = { x: 0, y: 0 };
  for (let i = cells.length - 2; i >= 0; i--) { // reverse; cells[len-1] is the start hex
    grid.axialToPixel(cells[i].q, cells[i].r, c);
    pts.push({ x: c.x, y: c.y });
  }
  simplify(pts);
  pts.shift(); // drop the start anchor
  const last = pts[pts.length - 1];
  last.x = goalPx.x;
  last.y = goalPx.y;
  return pts;
}

/** @private in-place removal of interior points collinear with their neighbours */
function simplify(pts) {
  if (pts.length <= 2) return;
  let write = 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[write - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (Math.abs(cross) > COLLINEAR_EPS) pts[write++] = b;
  }
  pts[write++] = pts[pts.length - 1];
  pts.length = write;
}

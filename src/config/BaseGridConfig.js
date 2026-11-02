/**
 * BaseGridConfig — the base's own square build grid (GDD 18/24; split out of
 * BaseConfig.js for the 150-line cap). The world map stays a flat-top HEX
 * grid end to end (utils/Hex.js) — this is only what the player sees once
 * zoomed into their base. The plot grows in fixed stages as the Headquarters
 * levels (every 6 levels, PLOT_STAGES); every building has a fixed footprint
 * in squares (FOOTPRINT) — both its physical size on the grid and its visual
 * prominence; level TIER (BuildingArtConfig) scales the art WITHIN that
 * footprint, it never changes the footprint itself.
 *
 * Sizing is resolved once, from the seeded starting HQ level
 * (BaseConfig.STARTING_LAYOUT) — re-growing the LIVE plot when HQ crosses a
 * stage boundary mid-session (re-blocking world-map obstacles, moving the
 * muster ground, re-tuning LOD) is NOT wired yet. FORWARD. DRAFT / REVIEW.
 */
import { DEFENCE } from './DefencePerimeterConfig.js';
import { plotHalfExtents, plotCorners } from '../utils/SquareGrid.js';

const HALF = 0.5;

// S72: one square build cell, world px — the single global lever for the
// compound's whole physical size on the world map (every 3D/2D base system
// derives its own unit scale from this one constant, grep CELL_PX). Tuned
// (not guessed — a bisection script against the real hex/wall math) so
// `defencePolygon(STARTING_HQ_LEVEL)`'s outline sits exactly inside
// WORLDMAP.baseTerritoryHexes' 7-hex cluster, touching its boundary on the
// east/west edges — the player's own explicit call to shrink the whole base
// to fit a fixed 7-hex territory, wall border at the hex line. Was 42
// (pre-S72); CELL_COUNT per plot stage (PLOT_STAGES below) is untouched, so
// every footprint/gameplay number is unaffected — only the compound's
// absolute on-screen size changed.
export const CELL_PX = 22;

// One wall segment/gate slot's NOMINAL length, grid cells — `DefenceWall3D`
// tiles the live perimeter at this granularity (the gate always lands on
// its own true-centre slot); `WorldField`'s own obstacle-blocking (S55)
// reuses it for the gate's PATHING opening width, so the walkable gap
// always matches the wall's own rendered one instead of drifting apart as
// two separately-hand-picked numbers.
export const WALL_SEGMENT_CELLS = 4;

/** The plot grows every 6 HQ levels, same ~9:11 ratio throughout. */
export const PLOT_STAGES = [
  { upToLevel: 5, cols: 18, rows: 22 },
  { upToLevel: 11, cols: 22, rows: 26 },
  { upToLevel: 17, cols: 26, rows: 30 },
  { upToLevel: 23, cols: 30, rows: 34 },
  { upToLevel: 29, cols: 34, rows: 38 },
  { upToLevel: Infinity, cols: 38, rows: 42 },
];

/** @param {number} hqLevel @returns {{cols:number,rows:number}} the plot's size, in cells, for this HQ level */
export function plotCells(hqLevel) {
  for (const s of PLOT_STAGES) if (hqLevel <= s.upToLevel) return { cols: s.cols, rows: s.rows };
  return PLOT_STAGES[PLOT_STAGES.length - 1];
}

/** @param {number} hqLevel @returns {{w:number,h:number}} the plot's size, world px, for this HQ level */
export function plotSizePx(hqLevel) {
  const c = plotCells(hqLevel);
  return { w: c.cols * CELL_PX, h: c.rows * CELL_PX };
}

/** @param {number} hqLevel @returns {{hw:number,hh:number}} the plot's half-extents, world px, for this HQ level */
export function plotHalfExtentsAt(hqLevel) {
  const c = plotCells(hqLevel);
  return plotHalfExtents(c.cols, c.rows, CELL_PX);
}

/**
 * The gate anchor — the midpoint of the diamond's E->S edge (the same edge
 * `DefenceWall3D`'s own `GATE_EDGE` places its gate slot on), compound-local
 * px. Muster ground / the world-map obstacle gate wedge both anchor here so
 * the gate, the wall opening, and where troops actually walk out all agree.
 * @param {number} hqLevel @returns {{x:number,y:number}}
 */
export function gateAnchorAt(hqLevel) {
  const c = plotCells(hqLevel);
  const [, e, s] = plotCorners(c.cols + DEFENCE.wallSetback * 2, c.rows + DEFENCE.wallSetback * 2, CELL_PX);
  return { x: (e.x + s.x) * HALF, y: (e.y + s.y) * HALF };
}

/**
 * The plot rectangle's own 4 corners in CELL units (unprojected) — what
 * `DefenceWall3D` tiles the live-3D perimeter along. N,E,S,W order, same as
 * `plotCorners`'s projected-px version (`DefenceWall3D`'s own `GATE_EDGE`
 * indexes into this same order either way).
 * @param {number} cols @param {number} rows @returns {{cx:number,cy:number}[]}
 */
export function cellCorners(cols, rows) {
  const a = cols * HALF, b = rows * HALF;
  return [{ cx: -a, cy: -b }, { cx: a, cy: -b }, { cx: a, cy: b }, { cx: -a, cy: b }];
}

/**
 * Per-building footprint, in squares (CLAUDE.md "BUILDING VISUAL GUARDRAILS").
 * `defence_wall` has none — it IS the plot's perimeter, not an interior
 * building (BaseGridView skips it, same as headquarters).
 */
export const FOOTPRINT = {
  headquarters: { w: 7, h: 8 },
  barracks: { w: 4, h: 4 },
  engineering: { w: 3, h: 4 },
  research_center: { w: 3, h: 3 },
  armory: { w: 3, h: 3 },
  parts_workshop: { w: 3, h: 3 },
  disassemble: { w: 3, h: 3 },
  assembly: { w: 3, h: 3 },
  alliance_hall: { w: 3, h: 3 },
  officer_barracks: { w: 3, h: 3 },
  airbase: { w: 3, h: 3 },
  hospital: { w: 3, h: 3 },
  treasury: { w: 2, h: 2 },
  steelworks: { w: 2, h: 2 },
  crude_oil: { w: 2, h: 2 },
  reserves_barracks: { w: 2, h: 2 },
  black_market: { w: 2, h: 2 },
  // 2x2, not 1x1 — matches the defence wall's own SEGMENT_CELLS module
  // size (S54) now that the tower sits at a wall corner, not a normal grid
  // slot; a 1x1 fit read as a small box, dwarfed by the wall either side.
  attack_towers: { w: 2, h: 2 },
};

/** @param {string} id @returns {{w:number,h:number}} footprint in squares (1x1 fallback) */
export function footprintOf(id) { return FOOTPRINT[id] ?? { w: 1, h: 1 }; }

/**
 * Does `(cx,cy)` sit exactly on whole grid-cell boundaries for `footprint`?
 * Grid lines are always at whole integers (every `PLOT_STAGES` cols/rows is
 * even, so `cellCorners`'s half-extent is a whole number) — an EVEN
 * footprint dimension must therefore centre on a whole integer to span
 * whole cells edge-to-edge, and an ODD dimension must centre on a
 * half-integer (X.5). `DefenceWall3D`/`AttackTowers3D` get this right by
 * construction (positions computed from `cellCorners`); any hand-typed
 * position (`BaseConfig.STARTING_LAYOUT` today, any future "place a new
 * building" flow) does not automatically — call this on every one (see
 * `BaseManager.js`) so a bad position fails loudly instead of silently
 * sitting half a cell off the grid on whichever axis has the wrong parity
 * (S54 — this exact bug shipped invisibly on all 6 starting buildings
 * until real 3D meshes made it visible; see docs/SESSION_LOG.md).
 * @param {number} cx @param {number} cy @param {{w:number,h:number}} footprint
 * @returns {boolean}
 */
export function isGridAligned(cx, cy, footprint) {
  const parityOk = (v, size) => Number.isInteger(v) === (size % 2 === 0);
  return parityOk(cx, footprint.w) && parityOk(cy, footprint.h);
}

/**
 * Round a raw (fractional) cell-unit point to the nearest `isGridAligned`
 * position for `footprint` — an even dimension snaps to the nearest whole
 * integer, an odd one to the nearest half-integer. Used to keep a drag
 * ghost (`BuildingDragController`, S54) always sitting on a legal slot
 * instead of following the pointer to an off-grid position.
 * @param {number} cx @param {number} cy @param {{w:number,h:number}} footprint
 * @returns {{cx:number,cy:number}}
 */
export function snapToFootprintGrid(cx, cy, footprint) {
  const snapAxis = (v, size) => (size % 2 === 0 ? Math.round(v) : Math.round(v - HALF) + HALF);
  return { cx: snapAxis(cx, footprint.w), cy: snapAxis(cy, footprint.h) };
}

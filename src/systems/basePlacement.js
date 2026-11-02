/**
 * basePlacement — pure placement-validation helpers for BaseManager, split
 * out purely to keep BaseManager.js under the 150-line cap (mirrors
 * buildingUpgrade.js's preview/complete split for `upgrade()`).
 */
import { plotCells, footprintOf, isGridAligned } from '../config/BaseGridConfig.js';
import { footprintInPlot, footprintsOverlap } from '../utils/SquareGrid.js';

// No real grid position (BaseConfig.STARTING_LAYOUT's own comment) — skip
// the grid-alignment check; also excluded from drag-relocate (S54,
// BuildingDragController) since neither has a single (cx,cy) to move.
export const NO_GRID_IDS = new Set(['attack_towers', 'defence_wall']);

/**
 * On-grid (BaseGridConfig.isGridAligned), in the current plot bounds,
 * footprint clear of every other building's own.
 * @param {object[]} buildings @param {number} hqLevel @param {string} id
 * @param {{cx:number,cy:number}} at the candidate cell-unit centre
 * @param {?object} [exclude] a building record to skip in the overlap scan
 * (S54 `BaseManager.relocate`/`canRelocate`: a building being moved must not
 * collide with its OWN current footprint) @returns {boolean}
 */
export function fitsAt(buildings, hqLevel, id, at, exclude) {
  const fp = footprintOf(id);
  if (!isGridAligned(at.cx, at.cy, fp)) return false;
  const { cols, rows } = plotCells(hqLevel);
  const here = { cx: at.cx, cy: at.cy, w: fp.w, h: fp.h };
  if (!footprintInPlot(here, cols, rows)) return false;
  return !buildings.some((b) => {
    // NO_GRID_IDS carry a placeholder (0,0) — never real grid occupants, so
    // they must never block a real placement/relocate near the plot centre
    // (S54 bug: nothing could be placed/relocated there — the wall/towers'
    // own phantom (0,0) records were silently "occupying" it)
    if (b === exclude || NO_GRID_IDS.has(b.id)) return false;
    const bfp = footprintOf(b.id);
    return footprintsOverlap(here, { cx: b.cx, cy: b.cy, w: bfp.w, h: bfp.h });
  });
}

/**
 * Loud, non-fatal — a hand-typed STARTING_LAYOUT entry with the wrong
 * cx/cy parity (S54).
 * @param {string} id @param {number} cx @param {number} cy @returns {void}
 */
export function warnIfMisaligned(id, cx, cy) {
  if (NO_GRID_IDS.has(id)) return;
  const fp = footprintOf(id);
  if (isGridAligned(cx, cy, fp)) return;
  console.error(`BaseManager: STARTING_LAYOUT '${id}' at (${cx},${cy}) is off-grid for its ${fp.w}x${fp.h} footprint — see BaseGridConfig.isGridAligned / BaseConfig.STARTING_LAYOUT's parity comment`);
}

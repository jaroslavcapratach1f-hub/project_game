/**
 * BaseDraw — pure builders for BaseGridView: the base is a square grid
 * (BaseGridConfig) diamond-projected (utils/SquareGrid — ISO_RATIO) so its
 * wall/grid visually faces the same oblique way every pre-rendered building
 * sprite does, instead of sitting as a flat top-down rectangle under angled
 * art. The world map itself stays flat-top HEX and flat top-down
 * (utils/Hex.js) — only the base's own interior projects. No state.
 * Placeholder art.
 */
import { cellCentreToPx, gridLineSegments, plotCorners, SEG_STRIDE } from '../utils/SquareGrid.js';
import { BASE } from '../config/BaseConfig.js';
import { plotCells } from '../config/BaseGridConfig.js';

const HALF = 0.5;

/** @param {number} cx @param {number} cy @param {{x:number,y:number}} [out] @returns {{x:number,y:number}} centre, compound-local px */
export function cellToPx(cx, cy, out) {
  return cellCentreToPx(cx, cy, BASE.grid.cellPx, out);
}

/** @returns {{x:number,y:number}} compound centre — the origin */
export function compoundCentreLocal() { return { x: 0, y: 0 }; }

/** @private flat [x,y, x,y, ...] from corner objects, offset + scaled from the centre */
function cornersFlat(corners, dx = 0, dy = 0, scale = 1) {
  const out = [];
  for (const c of corners) out.push(c.x * scale + dx, c.y * scale + dy);
  return out;
}

/**
 * The whole diamond-projected compound onto `g` (cleared first): berm outline
 * + faint interior grid lines. S54 (later): no cast shadow (read as the whole
 * compound hovering above the ground), no corner nubs, no 2D wall stroke, and
 * — now that `BaseGround3D` fills the interior with a real live-3D floor —
 * no packed-earth pad fill either, so the flat 2D colour and the 3D ground
 * mesh never show at the same time / clash ("2 models mixing"). The berm
 * outline + grid lines stay: both end up fully hidden behind the opaque 3D
 * ground once it loads anyway, but they're a reasonable fallback silhouette
 * during its brief async GLB load.
 * @param {import('pixi.js').Graphics} g @param {number} hqLevel @returns {void}
 */
export function buildPlatform(g, hqLevel) {
  const P = BASE.platform;
  const { cols, rows } = plotCells(hqLevel);
  const cs = BASE.grid.cellPx;
  const corners = plotCorners(cols, rows, cs); // N, E, S, W
  const bermScale = 1 - P.wallWidthPx / (cols * cs * HALF + rows * cs * HALF);
  g.clear()
    .poly(cornersFlat(corners, 0, 0, bermScale)).stroke({ color: P.bermColor, width: 3, alpha: P.bermAlpha });
  const segs = gridLineSegments(cols, rows, cs);
  for (let i = 0; i < segs.length; i += SEG_STRIDE) {
    g.moveTo(segs[i], segs[i + 1]).lineTo(segs[i + SEG_STRIDE - 2], segs[i + SEG_STRIDE - 1]);
  }
  g.stroke({ color: P.cellLineColor, width: P.cellLineWidthPx, alpha: P.cellLineAlpha });
}

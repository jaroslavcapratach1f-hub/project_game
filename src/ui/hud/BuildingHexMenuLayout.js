/**
 * BuildingHexMenuLayout — screen-visibility helpers `BuildingHexMenu.open()`
 * and `BuildingContext._openMenu()` need, both built on the SAME on-screen
 * bounding box (title above, hex fan + backdrop skirt below, at the menu's
 * fixed `BUILDING_MENU.scale` on-screen size — never changes with zoom, see
 * `BuildingHexMenu.open()`'s own doc):
 * - `needsRecentre(...)`: does the RAW anchor's bounding box already fit
 *   on screen, unclamped? If not, `BuildingContext` pans the camera to
 *   recentre on the building first (the player's own design — "if the
 *   view [is] slightly on the side the game automatically relocates the
 *   screen").
 * - `clampedMenuWorldPos(...)`: belt-and-suspenders on top of that — nudges
 *   the anchor back on-screen regardless, in case the recentre pan hasn't
 *   finished yet or some edge case the margin math doesn't fully cover.
 * Split out purely to keep `BuildingHexMenu.js` under the 150-line cap.
 */
import { BUILDING_MENU } from '../../config/BuildingMenuConfig.js';

const HALF = 0.5;

/**
 * @private @param {number} n action count (the fan can be wider than the backdrop panel)
 * @returns {{halfW:number,top:number,bottom:number}} the menu's own on-screen
 *   bounding-box extents from its anchor, at its fixed `BUILDING_MENU.scale`
 */
function bounds(n) {
  const M = BUILDING_MENU, s = M.scale;
  const fanHalfW = ((n - 1) * HALF) * M.spacingPx + M.hexRadiusPx;
  return {
    halfW: Math.max(M.panel.halfWidth, fanHalfW) * s,
    top: (M.titleGapPx + M.titleHeightPx) * s,
    bottom: Math.max(M.dropPx + M.hexRadiusPx, M.panel.outerBottom) * s,
  };
}

/**
 * @param {{x:number,y:number}} pos WORLD px — the RAW (unclamped) anchor
 * @param {import('../../engine/Camera.js').Camera} camera
 * @param {number} n action count
 * @returns {boolean} true if the menu would NOT fully fit on screen as-is
 */
export function needsRecentre(pos, camera, n) {
  const { halfW, top, bottom } = bounds(n), margin = BUILDING_MENU.screenEdgeMarginPx;
  const screen = camera.worldToScreen(pos.x, pos.y);
  return screen.x < halfW + margin || screen.x > camera.viewW - halfW - margin
    || screen.y < top + margin || screen.y > camera.viewH - bottom - margin;
}

/**
 * Nudge the WORLD anchor so the menu's own on-screen bounding box stays
 * fully inside the viewport, clamped `screenEdgeMarginPx` from every edge.
 * @param {{x:number,y:number}} pos WORLD px
 * @param {import('../../engine/Camera.js').Camera} camera
 * @param {number} n action count
 * @returns {{x:number,y:number}} WORLD px
 */
export function clampedMenuWorldPos(pos, camera, n) {
  const { halfW, top, bottom } = bounds(n), margin = BUILDING_MENU.screenEdgeMarginPx;
  const screen = camera.worldToScreen(pos.x, pos.y);
  screen.x = Math.min(Math.max(screen.x, halfW + margin), camera.viewW - halfW - margin);
  screen.y = Math.min(Math.max(screen.y, top + margin), camera.viewH - bottom - margin);
  return camera.screenToWorld(screen.x, screen.y);
}

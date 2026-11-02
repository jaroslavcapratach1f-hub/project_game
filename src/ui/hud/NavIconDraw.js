/**
 * NavIconDraw — small vector icons for NavBar's 5 tabs, same convention as
 * `ActionIconDraw.js` (hand-drawn PixiJS Graphics shapes, one builder per
 * tab, centred on (0,0), sized off a half-size `s` so they scale with the
 * bar). Pure builders, no state.
 */
const HALF = 0.5;

/** Proportions as a fraction of the icon's own half-size — pure shape data, not gameplay tuning. */
const OFFICER = { crownW: 0.86, crownH: 0.5, crownTopY: -0.7, crownRadius: 0.16, brimW: 1.05, brimHalfH: 0.11, brimY: 0.05, bandH: 0.1, bandY: -0.24 };
const TANK = {
  hullHalfW: 0.55, hullH: 0.36, hullY: 0.08, hullRadius: 0.08,
  turretW: 0.6, turretH: 0.32, turretY: -0.28, turretRadius: 0.06,
  barrelStartFrac: 0.1, barrelLen: 0.55, barrelW: 0.1, barrelY: -0.32,
  trackW: 1.5, trackH: 0.2, trackY: 0.42, trackRadiusFrac: 0.4,
};
const BOX = { bodyW: 0.95, bodyH: 0.62, bodyY: 0.22, radius: 0.05, flapOutX: 0.18, flapUpY: 0.42, flapInX: 0.32, flapInFrac: 0.35 };
const SHIELD = {
  halfW: 0.55, topY: -0.72, shoulderY: -0.12, botY: 0.78,
  wingSpan: 0.42, wingY: -0.42, wingUpY: 0.06, wingInFrac: 0.55, wingDownY: 0.3,
};
const BADGE = { lightenAmt: 70, wideW: 0.48, wideH: 0.16, wideRadius: 0.03, tallW: 0.24, tallH: 0.13, tallRadius: 0.02 };
const SOLDIER = { headR: 0.15, bodyHalfW: 0.17, bodyH: 0.46, insetFrac: 0.65 };
const ARMY_LAYOUT = { sideX: 0.4, sideY: 0.12, sideScale: 0.78, frontY: -0.05 };

const RGB_BYTE = 0xff, GREEN_SHIFT = 8, RED_SHIFT = 16;

/** @private @param {number} color @param {number} amt @returns {number} a lighter tint of `color`, for contrast without a 2nd param */
function lighten(color, amt) {
  const max = RGB_BYTE;
  const r = Math.min(max, ((color >> RED_SHIFT) & max) + amt);
  const g = Math.min(max, ((color >> GREEN_SHIFT) & max) + amt);
  const b = Math.min(max, (color & max) + amt);
  return (r << RED_SHIFT) | (g << GREEN_SHIFT) | b;
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} a peaked officer's cap — crown + band + brim */
export function drawOfficersIcon(g, sizePx, color) {
  const s = sizePx * HALF, o = OFFICER;
  g.roundRect(-s * o.crownW * HALF, s * o.crownTopY, s * o.crownW, s * o.crownH, s * o.crownRadius).fill(color);
  g.rect(-s * o.crownW * HALF, s * o.bandY, s * o.crownW, s * o.bandH).fill(color);
  g.ellipse(0, s * o.brimY, s * o.brimW * HALF, s * o.brimHalfH).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} a side-view tank — tracks, hull, turret, barrel */
export function drawUnitsIcon(g, sizePx, color) {
  const s = sizePx * HALF, t = TANK;
  g.roundRect(-s * t.trackW * HALF, s * t.trackY - s * t.trackH * HALF, s * t.trackW, s * t.trackH, s * t.trackH * t.trackRadiusFrac).fill(color);
  g.roundRect(-s * t.hullHalfW, s * t.hullY - s * t.hullH * HALF, s * t.hullHalfW * 2, s * t.hullH, s * t.hullRadius).fill(color);
  g.roundRect(-s * t.turretW * HALF, s * t.turretY - s * t.turretH * HALF, s * t.turretW, s * t.turretH, s * t.turretRadius).fill(color);
  g.rect(s * t.turretW * t.barrelStartFrac, s * t.barrelY - s * t.barrelW * HALF, s * t.barrelLen, s * t.barrelW).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} a half-open supply crate — body + one raised flap */
export function drawSuppliesIcon(g, sizePx, color) {
  const s = sizePx * HALF, b = BOX;
  const topY = s * b.bodyY - s * b.bodyH * HALF;
  g.roundRect(-s * b.bodyW * HALF, topY, s * b.bodyW, s * b.bodyH, s * b.radius).fill(color);
  g.poly([
    -s * b.bodyW * HALF, topY,
    -s * b.bodyW * HALF - s * b.flapOutX, topY - s * b.flapUpY,
    -s * b.bodyW * HALF + s * b.flapInX, topY - s * b.flapUpY * b.flapInFrac,
  ]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} a winged shield with a small tank badge — Alliance */
export function drawAllianceIcon(g, sizePx, color) {
  const s = sizePx * HALF, sh = SHIELD;
  g.poly([
    -s * sh.halfW, s * sh.topY,
    s * sh.halfW, s * sh.topY,
    s * sh.halfW, s * sh.shoulderY,
    0, s * sh.botY,
    -s * sh.halfW, s * sh.shoulderY,
  ]).fill(color);
  g.poly([
    -s * sh.halfW, s * sh.wingY,
    -s * sh.halfW - s * sh.wingSpan, s * sh.wingY - s * sh.wingUpY,
    -s * sh.halfW - s * sh.wingSpan * sh.wingInFrac, s * sh.wingY + s * sh.wingDownY,
  ]).fill(color);
  g.poly([
    s * sh.halfW, s * sh.wingY,
    s * sh.halfW + s * sh.wingSpan, s * sh.wingY - s * sh.wingUpY,
    s * sh.halfW + s * sh.wingSpan * sh.wingInFrac, s * sh.wingY + s * sh.wingDownY,
  ]).fill(color);
  const badge = lighten(color, BADGE.lightenAmt);
  g.roundRect(-s * BADGE.wideW * HALF, -s * BADGE.wideH, s * BADGE.wideW, s * BADGE.wideH, s * BADGE.wideRadius).fill(badge);
  g.roundRect(-s * BADGE.tallW * HALF, -s * BADGE.wideH * 2, s * BADGE.tallW, s * BADGE.tallH, s * BADGE.tallRadius).fill(badge);
}

/** @private one simplified standing figure @param {import('pixi.js').Graphics} g @param {number} s @param {{x:number,y:number,scale:number}} at @param {number} color */
function drawSoldier(g, s, at, color) {
  const so = SOLDIER;
  const headR = s * so.headR * at.scale;
  const bodyHalfW = s * so.bodyHalfW * at.scale, bodyH = s * so.bodyH * at.scale;
  g.circle(at.x, at.y - bodyH * HALF - headR, headR).fill(color);
  g.poly([
    at.x - bodyHalfW, at.y + bodyH * HALF,
    at.x - bodyHalfW * so.insetFrac, at.y - bodyH * HALF,
    at.x + bodyHalfW * so.insetFrac, at.y - bodyH * HALF,
    at.x + bodyHalfW, at.y + bodyH * HALF,
  ]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} 3 overlapping soldier silhouettes — Army */
export function drawArmyIcon(g, sizePx, color) {
  const s = sizePx * HALF, a = ARMY_LAYOUT;
  drawSoldier(g, s, { x: -s * a.sideX, y: s * a.sideY, scale: a.sideScale }, color);
  drawSoldier(g, s, { x: s * a.sideX, y: s * a.sideY, scale: a.sideScale }, color);
  drawSoldier(g, s, { x: 0, y: s * a.frontY, scale: 1 }, color);
}

/** @type {Record<string,(g:import('pixi.js').Graphics, sizePx:number, color:number)=>void>} */
export const NAV_ICON_DRAW = {
  officers: drawOfficersIcon,
  units: drawUnitsIcon,
  supplies: drawSuppliesIcon,
  alliance: drawAllianceIcon,
  army: drawArmyIcon,
};

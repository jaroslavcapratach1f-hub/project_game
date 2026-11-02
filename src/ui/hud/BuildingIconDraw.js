/**
 * BuildingIconDraw — the glyphs the Building Info/Level-Info/Upgrade
 * screens draw from for stat keys with NO real art: Power, and a generic
 * upgrade-Material swatch for everything else (troop capacity, speeds,
 * ...). Money/Steel/Oil used to live here too, but every caller now gets
 * those from `ResourceStatIcon.js`'s own real-art Sprite instead (the
 * player's own explicit ask: "use same resources icons in every building
 * upgrade menu... no more generated models") — this file keeps only the
 * glyphs that still have no real-art equivalent. Plain `Graphics`
 * primitives, matching every other `*IconDraw.js` in this folder.
 */
const HALF = 0.5;

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} Power — a lightning bolt */
export function drawPowerIcon(g, cx, cy, r, color) {
  g.poly([
    cx + r * 0.15, cy - r, cx - r * 0.5, cy + r * 0.12, cx - r * 0.05, cy + r * 0.12,
    cx - r * 0.15, cy + r, cx + r * 0.5, cy - r * 0.12, cx + r * 0.05, cy - r * 0.12,
  ]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a generic upgrade-material swatch — a faceted crate */
export function drawMaterialIcon(g, cx, cy, r, color) {
  g.poly([cx, cy - r, cx + r * 0.87, cy - r * HALF, cx + r * 0.87, cy + r * HALF, cx, cy + r, cx - r * 0.87, cy + r * HALF, cx - r * 0.87, cy - r * HALF])
    .fill({ color, alpha: 0.85 });
  g.moveTo(cx, cy - r).lineTo(cx, cy).moveTo(cx - r * 0.87, cy - r * HALF).lineTo(cx, cy).lineTo(cx + r * 0.87, cy - r * HALF)
    .stroke({ color: 0x000000, width: 1, alpha: 0.25 });
}

const STAT_ICON = { power: drawPowerIcon };

/**
 * Pick the right icon drawer for a `BuildingStatsConfig` stat key with no
 * real art (money/steel/oil are intercepted earlier, by `ResourceStatIcon`
 * — this is never even called for those) — power gets its own glyph, any
 * other headline stat (building slots, training speed, research speed,
 * ...) falls back to the generic material swatch.
 * @param {string} key @returns {(g:import('pixi.js').Graphics,cx:number,cy:number,r:number,color:number)=>void}
 */
export function pickStatIcon(key) { return STAT_ICON[key] ?? drawMaterialIcon; }

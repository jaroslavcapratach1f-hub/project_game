/**
 * GlassHexDraw — the 3-layer silver-rim/bevel/glass-face hex recipe,
 * extracted so a bigger category-select hex (this screen needs TWO new
 * sizes: a hero hex + smaller column hexes) isn't a THIRD copy-paste of the
 * same drawing code — it's already duplicated once, verbatim, between
 * `BuildingHexOption.js` (small hex-menu action buttons) and
 * `HexGoButton.js` (the world-map move/attack confirm button), each with
 * their own inline radius/color constants. Both of those stay untouched
 * (zero risk to currently-working code); migrating them onto this helper
 * is a safe, separate follow-up, not part of this feature.
 */
import { MENU_ICON } from '../../config/BuildingMenuConfig.js';

const HEX = MENU_ICON.hex;

/**
 * @param {import('pixi.js').Graphics} g cleared by the caller if reused
 * @param {number} radius px
 * @param {{fill:number,fillAlpha:number,stroke:number,strokeWidthPx:number,bevelInset:number,innerInset:number,bevelColor:number}} colors
 * @param {number} [alpha=1] overall dim multiplier (e.g. a "coming soon" tile)
 * @returns {void}
 */
export function drawGlassHex(g, radius, colors, alpha = 1) {
  const r = radius;
  g.poly(HEX.map((v) => v * r)).fill({ color: colors.bevelColor, alpha })
    .stroke({ color: colors.stroke, width: colors.strokeWidthPx, alpha });
  g.poly(HEX.map((v) => v * r * colors.bevelInset)).fill({ color: colors.stroke, alpha });
  g.poly(HEX.map((v) => v * r * colors.innerInset))
    .fill({ color: colors.fill, alpha: colors.fillAlpha * alpha })
    .stroke({ color: colors.bevelColor, width: colors.strokeWidthPx * 0.5, alpha });
}

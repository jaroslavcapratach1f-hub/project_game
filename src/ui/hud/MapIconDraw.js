/**
 * MapIconDraw — the Home / World corner buttons' own icons (S58 — the
 * user's own icon design), same hand-drawn-Graphics convention as
 * `NavIconDraw.js` (centred on (0,0), proportions as fractions of a
 * half-size / radius so they scale cleanly). Pure builders, no state.
 */
const HALF = 0.5;

/** Proportions as fractions of the icon's own half-size — pure shape data. */
const HOME = {
  roofHalfW: 0.5, roofTopY: -0.55, roofBaseY: -0.05,
  wallHalfW: 0.36, wallBottomY: 0.55,
  doorHalfW: 0.12, doorTopY: 0.12,
};

/**
 * A simple house pictogram — triangular roof, square walls, a door cut out
 * in a contrasting colour.
 * @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @param {number} doorColor
 * @returns {void}
 */
export function drawHomeIcon(g, sizePx, color, doorColor) {
  const s = sizePx * HALF, h = HOME;
  g.poly([0, s * h.roofTopY, s * h.roofHalfW, s * h.roofBaseY, -s * h.roofHalfW, s * h.roofBaseY]).fill(color);
  g.rect(-s * h.wallHalfW, s * h.roofBaseY, s * h.wallHalfW * 2, s * h.wallBottomY - s * h.roofBaseY).fill(color);
  g.rect(-s * h.doorHalfW, s * h.doorTopY, s * h.doorHalfW * 2, s * h.wallBottomY - s * h.doorTopY).fill(doorColor);
}

const GLOBE = { meridianHalfWFrac: 0.32, latitudeYFrac: 0.42, latitudeHalfWFrac: 0.85, latitudeHalfHFrac: 0.16 };

/**
 * A globe — filled/stroked circle + one meridian ellipse + the equator +
 * two latitude arcs, so it reads as a globe rather than a plain disc.
 * @param {import('pixi.js').Graphics} g @param {number} radiusPx
 * @param {{fill:number,fillAlpha:number,stroke:number,strokeWidthPx:number,line:number,lineAlpha:number,lineWidthPx:number}} o
 * @returns {void}
 */
export function drawGlobeIcon(g, radiusPx, o) {
  const gl = GLOBE;
  g.circle(0, 0, radiusPx).fill({ color: o.fill, alpha: o.fillAlpha }).stroke({ color: o.stroke, width: o.strokeWidthPx });
  const line = { color: o.line, alpha: o.lineAlpha, width: o.lineWidthPx };
  g.ellipse(0, 0, radiusPx * gl.meridianHalfWFrac, radiusPx).stroke(line);
  g.moveTo(-radiusPx, 0).lineTo(radiusPx, 0).stroke(line);
  g.ellipse(0, -radiusPx * gl.latitudeYFrac, radiusPx * gl.latitudeHalfWFrac, radiusPx * gl.latitudeHalfHFrac).stroke(line);
  g.ellipse(0, radiusPx * gl.latitudeYFrac, radiusPx * gl.latitudeHalfWFrac, radiusPx * gl.latitudeHalfHFrac).stroke(line);
}

/**
 * TopBarIconDraw — small hand-drawn TopBar glyphs that no existing module
 * draws: a generic commander silhouette (head + shoulders) for the player-
 * avatar spot, shown until a real player-photo/portrait system exists (the
 * player's own words: "player menu appears which we will build later" —
 * deliberately just a placeholder glyph, not a fake avatar photo); and a
 * map-pin for the Location badge — hand-drawn vector rather than extracted
 * photo art, since the player's own reference image is a gray pin on a
 * near-identical gray checkerboard background that no colour-threshold
 * background removal could cleanly separate (confirmed after several
 * attempts) — a clean vector glyph sidesteps that entirely and keeps the
 * icon crisp at any size, same as every other glyph in this file.
 */

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} */
export function drawAvatarIcon(g, cx, cy, r, color) {
  g.circle(cx, cy - r * 0.32, r * 0.38).fill(color); // head
  // shoulders — a half-ellipse, clipped by the caller's own circular mask/bg
  g.moveTo(cx - r * 0.75, cy + r * 0.62)
    .bezierCurveTo(cx - r * 0.75, cy + r * 0.05, cx - r * 0.42, cy + r * 0.18, cx, cy + r * 0.18)
    .bezierCurveTo(cx + r * 0.42, cy + r * 0.18, cx + r * 0.75, cy + r * 0.05, cx + r * 0.75, cy + r * 0.62)
    .fill(color);
}

/**
 * Map-pin — round head + tapered tail, a darker inner hole, a small
 * coloured tip accent (the reference's own red). Flat-shaded, same
 * minimal-silhouette convention as `drawAvatarIcon` above.
 * @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy
 * @param {number} r @param {number} color @param {number} holeColor @param {number} tipColor
 * @returns {void}
 */
export function drawLocationPinIcon(g, cx, cy, r, color, holeColor, tipColor) {
  const headR = r * 0.6, headCy = cy - r * 0.3, tailTipY = cy + r, tailHalfW = headR * 0.52;
  g.moveTo(cx - tailHalfW, headCy + headR * 0.7).lineTo(cx, tailTipY).lineTo(cx + tailHalfW, headCy + headR * 0.7).fill(color);
  g.circle(cx, headCy, headR).fill(color);
  g.circle(cx, headCy, headR * 0.42).fill(holeColor);
  g.circle(cx, tailTipY - r * 0.06, r * 0.1).fill(tipColor);
}

/**
 * HexTargetIconDraw — the green "go" chevron and red "attack" burst drawn
 * at a locked hex (OrderController's drag-lock + tap-Go flows), AND reused
 * for the tap-to-confirm Go button itself (the player's own explicit ask:
 * "same icon as green one") — one drawing of each, not near-duplicates.
 */
const HALF = 0.5;

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} a downward chevron — "move/go here" */
export function drawGoIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  g.poly([-s * 0.7, -s * 0.5, 0, s * 0.35, s * 0.7, -s * 0.5, s * 0.7, -s * 0.05, 0, s * 0.8, -s * 0.7, -s * 0.05]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} an explosion/war burst — "attack here" */
export function drawAttackIcon(g, sizePx, color) {
  const s = sizePx * HALF, spikes = 8, turns = spikes * 2;
  const pts = [];
  for (let i = 0; i < turns; i++) {
    const r = i % 2 === 0 ? s : s * 0.45;
    const a = (i / turns) * Math.PI * 2;
    pts.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.poly(pts).fill(color);
}

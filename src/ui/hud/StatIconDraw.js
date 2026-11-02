/**
 * StatIconDraw — small line-glyph icons for `TroopStatsList` rows and
 * `StatMedallion`'s own big icon, drawn from plain `Graphics` primitives
 * (no icon font/atlas exists in this codebase) so every stat gets a real
 * silhouette instead of the rejected flat colour-bar chips. One function
 * per stat key, each centred on (cx, cy) inside radius r.
 */
const HALF = 0.5;

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a flame (Firepower/dmg) */
function flame(g, cx, cy, r, color) {
  g.moveTo(cx, cy - r).bezierCurveTo(cx + r * 0.9, cy - r * 0.2, cx + r * 0.5, cy + r * 0.5, cx, cy + r)
    .bezierCurveTo(cx - r * 0.5, cy + r * 0.5, cx - r * 0.9, cy - r * 0.2, cx, cy - r).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a heart (HP) */
function heart(g, cx, cy, r, color) {
  const lobeR = r * 0.55;
  g.circle(cx - lobeR * HALF, cy - lobeR * HALF, lobeR).circle(cx + lobeR * HALF, cy - lobeR * HALF, lobeR)
    .poly([cx - r, cy - lobeR * HALF, cx + r, cy - lobeR * HALF, cx, cy + r]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a shield (Defense/Armor) */
function shield(g, cx, cy, r, color) {
  g.poly([cx, cy - r, cx + r, cy - r * 0.5, cx + r, cy + r * 0.2, cx, cy + r, cx - r, cy + r * 0.2, cx - r, cy - r * 0.5])
    .stroke({ color, width: 1.6 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a downward arrow (Penetration) */
function arrowDown(g, cx, cy, r, color) {
  g.moveTo(cx, cy - r).lineTo(cx, cy + r * 0.4).moveTo(cx - r * 0.5, cy).lineTo(cx, cy + r * 0.9).lineTo(cx + r * 0.5, cy)
    .stroke({ color, width: 1.8 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a clock (Rate of Fire) */
function clock(g, cx, cy, r, color) {
  g.circle(cx, cy, r).stroke({ color, width: 1.6 });
  g.moveTo(cx, cy).lineTo(cx, cy - r * 0.6).moveTo(cx, cy).lineTo(cx + r * 0.4, cy).stroke({ color, width: 1.6 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a target ring (Range/Accuracy) */
function target(g, cx, cy, r, color) {
  g.circle(cx, cy, r).stroke({ color, width: 1.6 }).circle(cx, cy, r * 0.4).stroke({ color, width: 1.6 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a forward chevron (Speed) */
function chevron(g, cx, cy, r, color) {
  g.moveTo(cx - r * 0.5, cy - r).lineTo(cx + r * 0.5, cy).lineTo(cx - r * 0.5, cy + r).stroke({ color, width: 1.8 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a burst (AoE) */
function burst(g, cx, cy, r, color) {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.moveTo(cx + Math.cos(a) * r * 0.35, cy + Math.sin(a) * r * 0.35).lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.stroke({ color, width: 1.6 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a footstep swirl (Dodge) */
function dodge(g, cx, cy, r, color) {
  const radius = r * 0.7, startAngle = Math.PI * 0.15;
  // Explicit moveTo to the arc's own start point — `arc()` otherwise
  // connects from whatever the path's last point was (see ArmyIconDraw's
  // drawLockIcon, which hit this same bug as a stray line across the screen).
  g.moveTo(cx + radius * Math.cos(startAngle), cy + radius * Math.sin(startAngle))
    .arc(cx, cy, radius, startAngle, Math.PI * 1.6).stroke({ color, width: 1.8 });
  g.moveTo(cx + r * 0.5, cy - r * 0.35).lineTo(cx + r * 0.75, cy - r * 0.1).lineTo(cx + r * 0.35, cy - r * 0.15).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a coin (Cost) */
function coin(g, cx, cy, r, color) {
  g.circle(cx, cy, r).stroke({ color, width: 1.6 }).circle(cx, cy, r * 0.45).fill({ color, alpha: 0.5 });
}

const DRAWERS = { hp: heart, dmg: flame, def: shield, armor: shield, pen: arrowDown, rof: clock, rng: target,
  acc: target, spd: chevron, dodge, aoe: burst, cost: coin };

/**
 * @param {import('pixi.js').Graphics} g @param {string} statKey @param {{x:number,y:number}} pt centre
 * @param {number} r @param {number} color @returns {void}
 */
export function drawStatIcon(g, statKey, pt, r, color) {
  (DRAWERS[statKey] ?? target)(g, pt.x, pt.y, r, color);
}

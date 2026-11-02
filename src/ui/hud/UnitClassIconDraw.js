/**
 * UnitClassIconDraw — the small unit-type glyph `UnitCard` shows beside its
 * star row (the reference screenshot's own bottom-left type icon: a tank,
 * truck, or helmet silhouette next to the stars). One simple silhouette per
 * `CLASS_TRAITS` bucket — tank hulls, towed/deployed guns, infantry, the
 * gather truck — drawn from plain `Graphics` primitives.
 */
const TANK_CLASSES = new Set(['lightTank', 'mediumTank', 'heavyTank', 'superHeavyTank', 'tankHunter']);
const ARTILLERY_CLASSES = new Set(['howitzer', 'atGun', 'launcher']);

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a tank hull + turret + barrel */
function tank(g, cx, cy, r, color) {
  g.rect(cx - r, cy, r * 2, r * 0.7).fill(color);
  g.circle(cx - r * 0.1, cy, r * 0.5).fill(color);
  g.rect(cx - r * 0.1, cy - r * 0.15, r * 1.3, r * 0.22).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a towed-gun wheel + barrel */
function artillery(g, cx, cy, r, color) {
  g.circle(cx - r * 0.4, cy + r * 0.3, r * 0.4).stroke({ color, width: 1.4 });
  g.moveTo(cx - r * 0.4, cy).lineTo(cx + r, cy - r * 0.5).stroke({ color, width: 1.8 });
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} an infantry helmet */
function helmet(g, cx, cy, r, color) {
  // an ellipse dome + a brim bar: `arc(...).fill()` leaves the dome unfilled here.
  g.ellipse(cx, cy - r * 0.08, r * 0.72, r * 0.6).fill(color);
  g.roundRect(cx - r * 0.95, cy + r * 0.34, r * 1.9, r * 0.26, r * 0.12).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} a truck cab + bed */
function truck(g, cx, cy, r, color) {
  g.rect(cx - r, cy - r * 0.1, r * 1.3, r * 0.5).fill(color);
  g.rect(cx + r * 0.3, cy - r * 0.4, r * 0.7, r * 0.8).fill(color);
  g.circle(cx - r * 0.6, cy + r * 0.4, r * 0.25).fill(color).circle(cx + r * 0.5, cy + r * 0.4, r * 0.25).fill(color);
}

/**
 * @param {import('pixi.js').Graphics} g @param {string} cls a `CLASS_TRAITS` key
 * @param {{x:number,y:number}} pt centre @param {number} r @param {number} color @returns {void}
 */
export function drawUnitClassIcon(g, cls, pt, r, color) {
  const { x: cx, y: cy } = pt;
  if (TANK_CLASSES.has(cls)) return tank(g, cx, cy, r, color);
  if (ARTILLERY_CLASSES.has(cls)) return artillery(g, cx, cy, r, color);
  if (cls === 'gatherTruck') return truck(g, cx, cy, r, color);
  return helmet(g, cx, cy, r, color); // infantry, and any future class
}

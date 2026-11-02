/**
 * ArmyIconDraw — the two glyphs `ArmyBarrackRow` needs that no existing icon
 * module already draws: a padlock (a locked barracks, or a locked officer
 * slot on one) and an empty officer-slot "+" marker. Plain `Graphics`
 * primitives — there is no icon font or atlas anywhere in this codebase.
 */
const SHACKLE_FRAC = 0.42;
const BODY_FRAC = 0.52;

/**
 * A closed padlock centred on (pt.x, pt.y), `size` tall overall.
 * @param {import('pixi.js').Graphics} g @param {{x:number,y:number}} pt
 * @param {number} size @param {number} color @returns {void}
 */
export function drawLockIcon(g, pt, size, color) {
  const h = size, bodyH = h * BODY_FRAC, bodyW = h * 0.72;
  const bodyY = pt.y + h * 0.5 - bodyH;
  const r = h * SHACKLE_FRAC * 0.62;
  // `arc()` behaves like Canvas2D: with no explicit moveTo, it connects from
  // whatever the path's last point was (stale state from an earlier shape,
  // or the Graphics' own local origin on a fresh path) to the arc's start —
  // that stray connector is exactly the "line to the corner" bug. An
  // explicit moveTo to the arc's own start point makes that connector
  // zero-length, i.e. invisible, regardless of prior path state.
  g.moveTo(pt.x - r, bodyY).arc(pt.x, bodyY, r, Math.PI, 0).stroke({ color, width: Math.max(1.2, h * 0.11) });
  g.roundRect(pt.x - bodyW * 0.5, bodyY, bodyW, bodyH, h * 0.1).fill(color);
}

/**
 * An empty officer slot's "+" marker centred on (pt.x, pt.y).
 * @param {import('pixi.js').Graphics} g @param {{x:number,y:number}} pt
 * @param {number} size arm length across @param {number} color @returns {void}
 */
export function drawOfficerPlus(g, pt, size, color) {
  const r = size * 0.5, w = Math.max(1.4, size * 0.14);
  g.moveTo(pt.x - r, pt.y).lineTo(pt.x + r, pt.y)
    .moveTo(pt.x, pt.y - r).lineTo(pt.x, pt.y + r)
    .stroke({ color, width: w });
}

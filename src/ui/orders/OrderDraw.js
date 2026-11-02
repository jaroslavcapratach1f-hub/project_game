/**
 * OrderDraw — pure PixiJS 8 Graphics shape builders for order feedback.
 * Each function takes a Graphics plus WORLD-px endpoints ({x,y} objects) and
 * a config block, clears the Graphics, redraws it, and returns nothing.
 * Called once per order (never per frame, except the live drag preview).
 * Alpha and position animation are the caller's job (g.alpha / g.position).
 */
const MIN_LEN = 1;
const HALF_TURN_DEG = 180;

/**
 * Selection ring centred on the Graphics origin (caller positions it).
 * @param {import('pixi.js').Graphics} g
 * @param {{radiusPx:number,widthPx:number,color:number}} cfg
 * @returns {void}
 */
export function buildRing(g, cfg) {
  g.clear().circle(0, 0, cfg.radiusPx).stroke({ width: cfg.widthPx, color: cfg.color });
}

/**
 * Arrow from a to b with a V head at the b end.
 * @param {import('pixi.js').Graphics} g
 * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
 * @param {{color:number,widthPx:number,headPx:number,headSpreadRad:number}} cfg
 * @returns {void}
 */
export function buildArrow(g, a, b, cfg) {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const s = cfg.headSpreadRad;
  g.clear().moveTo(a.x, a.y).lineTo(b.x, b.y);
  g.moveTo(b.x + Math.cos(ang + s) * cfg.headPx, b.y + Math.sin(ang + s) * cfg.headPx).lineTo(b.x, b.y);
  g.lineTo(b.x + Math.cos(ang - s) * cfg.headPx, b.y + Math.sin(ang - s) * cfg.headPx);
  g.stroke({ width: cfg.widthPx, color: cfg.color });
}

/**
 * Crosshair (ring + 4 ticks) centred at (cx,cy). Does NOT clear — safe to
 * compose after other strokes on the same Graphics.
 * @param {import('pixi.js').Graphics} g
 * @param {number} cx @param {number} cy @param {number} size tick reach in px
 * @returns {void}
 */
export function buildCrosshair(g, cx, cy, size) {
  const h = size / 2;
  g.circle(cx, cy, h);
  g.moveTo(cx - size, cy).lineTo(cx - h, cy).moveTo(cx + h, cy).lineTo(cx + size, cy);
  g.moveTo(cx, cy - size).lineTo(cx, cy - h).moveTo(cx, cy + h).lineTo(cx, cy + size);
}

/**
 * Attack line from a to b with a crosshair at the b end.
 * @param {import('pixi.js').Graphics} g
 * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
 * @param {{color:number,widthPx:number,crosshairPx:number}} cfg
 * @returns {void}
 */
export function buildAttackLine(g, a, b, cfg) {
  g.clear().moveTo(a.x, a.y).lineTo(b.x, b.y);
  buildCrosshair(g, b.x, b.y, cfg.crosshairPx);
  g.stroke({ width: cfg.widthPx, color: cfg.color });
}

/**
 * Dashed line from a to b plus a small home-marker square at b.
 * @param {import('pixi.js').Graphics} g
 * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
 * @param {{color:number,widthPx:number,dashPx:number,gapPx:number,markerPx:number}} cfg
 * @returns {void}
 */
export function buildDashedLine(g, a, b, cfg) {
  g.clear();
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < MIN_LEN) return;
  const ux = dx / len;
  const uy = dy / len;
  const step = cfg.dashPx + cfg.gapPx;
  for (let d = 0; d < len; d += step) {
    const e = Math.min(d + cfg.dashPx, len);
    g.moveTo(a.x + ux * d, a.y + uy * d).lineTo(a.x + ux * e, a.y + uy * e);
  }
  g.stroke({ width: cfg.widthPx, color: cfg.color });
  const m = cfg.markerPx / 2;
  g.rect(b.x - m, b.y - m, cfg.markerPx, cfg.markerPx).fill({ color: cfg.color });
}

/**
 * Live drag-preview line from a to b.
 * @param {import('pixi.js').Graphics} g
 * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
 * @param {{color:number,widthPx:number}} cfg
 * @returns {void}
 */
export function buildDragLine(g, a, b, cfg) {
  g.clear().moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: cfg.widthPx, color: cfg.color });
}

/**
 * Filled aim wedge from the Graphics origin, `±cfg.halfAngleDeg` wide and
 * `cfg.radiusPx` long, centred on `angleRad` in local space (the caller
 * usually keeps angleRad 0 and rotates the Graphics to the unit's facing).
 * @param {import('pixi.js').Graphics} g
 * @param {number} angleRad centre direction, radians
 * @param {{halfAngleDeg:number,radiusPx:number,color:number,alpha:number}} cfg
 * @returns {void}
 */
export function buildAimCone(g, angleRad, cfg) {
  const half = (cfg.halfAngleDeg * Math.PI) / HALF_TURN_DEG;
  g.clear()
    .moveTo(0, 0)
    .arc(0, 0, cfg.radiusPx, angleRad - half, angleRad + half)
    .lineTo(0, 0)
    .fill({ color: cfg.color, alpha: cfg.alpha });
}

/**
 * TroopDraw — pure PixiJS builders for the placeholder garrison tokens on the
 * world map (BaseTroops). Simple shapes: an infantry huddle, a tank, a towed
 * gun, and a tight pip cluster. No state; each draws into a fresh Graphics
 * centred on (0,0). The OrderDraw / MinimapDraw pattern.
 */
import { Graphics } from 'pixi.js';

const HALF = 0.5;
const RING_W = 2;
const TURRET_FRAC = 0.42;

/** @param {object} c infantry cfg @returns {Graphics} a small huddle of dots */
export function buildInfantry(c) {
  const g = new Graphics();
  const w = (c.cols - 1) * c.gapPx;
  const h = (c.rows - 1) * c.gapPx;
  for (let i = 0; i < c.rows * c.cols; i++) {
    const x = -w * HALF + (i % c.cols) * c.gapPx;
    const y = -h * HALF + ((i / c.cols) | 0) * c.gapPx;
    g.circle(x, y, c.dotR).fill(c.color).stroke({ color: c.ring, width: RING_W });
  }
  return g;
}

/** @param {object} c tank cfg @returns {Graphics} hull + turret + barrel */
export function buildTank(c) {
  const g = new Graphics()
    .roundRect(-c.w * HALF, -c.h * HALF, c.w, c.h, RING_W * 2)
    .fill(c.color).stroke({ color: c.ring, width: RING_W });
  const tr = c.h * TURRET_FRAC;
  g.circle(0, 0, tr).fill(c.ring);
  g.rect(0, -RING_W, c.w * HALF, RING_W * 2).fill(c.ring);
  return g;
}

/** @param {object} c gun cfg @returns {Graphics} low body + a long barrel */
export function buildArty(c) {
  const g = new Graphics()
    .roundRect(-c.w * HALF, -c.h * HALF, c.w, c.h, RING_W)
    .fill(c.color).stroke({ color: c.ring, width: RING_W });
  g.rect(0, -RING_W, c.w * HALF + c.barrelPx, RING_W * 2).fill(c.ring);
  return g;
}

/** @param {object} c pip-cluster cfg @returns {Graphics} a tight grid of dots */
export function buildPipCluster(c) {
  const g = new Graphics();
  const w = (c.cols - 1) * c.gapPx;
  for (let i = 0; i < c.pips; i++) {
    const x = -w * HALF + (i % c.cols) * c.gapPx;
    const y = ((i / c.cols) | 0) * c.gapPx;
    g.circle(x, y, c.dotR).fill(c.color).stroke({ color: c.ring, width: RING_W });
  }
  return g;
}

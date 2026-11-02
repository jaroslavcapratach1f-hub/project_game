/**
 * worldTerrainGen — paints real terrain types onto WorldField's hex grid
 * (GDD 17). Pure + deterministic: two fbm layers sampled in WORLD pixels at
 * each hex centre — an elevation field (low → water, high → hills) and a forest
 * field — plus keep-clear circles that force grass so the base, muster ground,
 * Onslaught approach and the Legion camp never sit on impassable ground.
 * Runs once from WorldScene.enable(); no per-frame work, no PixiJS.
 */
import { fbm } from '../utils/Noise.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';

const FOREST_OCTAVES = 3;

/**
 * @param {import('../world/TerrainGrid.js').TerrainGrid} grid
 * @param {{x:number,y:number,r:number}[]} clears world-px keep-clear circles
 * @returns {void}
 */
export function paintTerrain(grid, clears) {
  const t = WORLDMAP.terrain;
  const p = { x: 0, y: 0 };
  const circles = clears.map((c) => ({ x: c.x, y: c.y, r2: c.r * c.r }));
  grid.forEach((tile, q, r) => {
    grid.axialToPixel(q, r, p);
    if (inAnyCircle(p.x, p.y, circles)) { tile.setType('grass'); return; }
    const elev = fbm(p.x * t.elevFreq, p.y * t.elevFreq, t.seed, { octaves: t.elevOctaves });
    if (elev < t.waterBelow) { tile.setType('water'); return; }
    const base = elev > t.hillsAbove ? 'hills' : 'grass';
    const forest = fbm(p.x * t.forestFreq, p.y * t.forestFreq, t.forestSeed, { octaves: FOREST_OCTAVES });
    tile.setType(forest > t.forestAbove ? 'forest' : base);
  });
}

/** @private @returns {boolean} is (x,y) inside any keep-clear circle */
function inAnyCircle(x, y, circles) {
  for (let i = 0; i < circles.length; i++) {
    const dx = x - circles[i].x;
    const dy = y - circles[i].y;
    if (dx * dx + dy * dy <= circles[i].r2) return true;
  }
  return false;
}

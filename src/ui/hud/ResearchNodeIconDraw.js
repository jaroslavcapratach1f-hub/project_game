/**
 * ResearchNodeIconDraw — picks a real icon for one research node, in order:
 * (1) any `troops_cap` id (Military's own Troops Cap milestones — a rank
 * chevron, distinct from every other glyph since the player's own explicit
 * ask was for these to read as the most important nodes in the tree); (2) a
 * real `StatIconDraw` glyph when `effect.key`'s own suffix matches a real
 * stat key (most Military/Doctrine nodes literally use `unit.all.hp`/
 * `unit.russian.dmg`/etc — the SAME vocabulary `StatIconDraw` already draws
 * for troop stats elsewhere, faction-specific or not, since only the FINAL
 * dotted segment is checked); (3) a small hand-drawn glyph for a handful of
 * recurring economy/support suffixes (any "...Speed" key, `trucks`,
 * `siteTier`, `reservesCapacity`/`reservesRecovery`); (4) the node's own
 * TRACK category icon (`ResearchCategoryIconDraw`) as the final fallback.
 * All mechanical dispatch — nothing here is a hand-picked icon per node id.
 */
import { drawStatIcon } from './StatIconDraw.js';
import { CATEGORY_ICON_DRAW } from './ResearchCategoryIconDraw.js';

const STAT_KEYS = new Set(['hp', 'dmg', 'def', 'armor', 'pen', 'rof', 'rng', 'acc', 'spd', 'dodge', 'aoe', 'cost']);
const HALF = 0.5;

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color an upward chevron-arrow — any economy "...Speed" effect (gather/production/research) */
function drawSpeedIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  g.poly([0, -s, s * 0.7, s * 0.15, s * 0.25, s * 0.15, s * 0.25, s, -s * 0.25, s, -s * 0.25, s * 0.15, -s * 0.7, s * 0.15]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color a simple truck silhouette — gather.trucks */
function drawTruckIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  g.roundRect(-s * 0.9, -s * 0.3, s * 1.2, s * 0.7, s * 0.1).fill(color);
  g.poly([s * 0.3, -s * 0.3, s * 0.75, -s * 0.3, s * 0.95, s * 0.05, s * 0.95, s * 0.4, s * 0.3, s * 0.4]).fill(color);
  g.circle(-s * 0.5, s * 0.55, s * 0.22).fill(color);
  g.circle(s * 0.5, s * 0.55, s * 0.22).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color a map-pin flag — gather.siteTier */
function drawSiteIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  g.circle(0, -s * 0.15, s * 0.7).fill(color);
  g.poly([0, s * 0.5, -s * 0.4, -s * 0.1, s * 0.4, -s * 0.1]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color 3 stacked rank chevrons — the Military tree's own Troops Cap milestones, the player's own explicit ask: "most important researches... outstanding and well visible" needs a glyph distinct from every other node, dispatched off `node.id` (not `effect.key` — the key's own suffix is a faction name, not a stat) */
function drawLevelCapIcon(g, sizePx, color) {
  const s = sizePx * HALF, w = s * 0.7, lw = s * 0.22;
  for (let i = 0; i < 3; i++) {
    const cy = -s * 0.5 + i * lw * 1.6;
    g.moveTo(-w, cy + lw).lineTo(0, cy).lineTo(w, cy + lw).stroke({ color, width: lw * 0.55, cap: 'round', join: 'round' });
  }
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color two overlapping figures — support.reserves* (the shared personnel pool) */
function drawReservesIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  for (const dx of [-0.26, 0.26]) {
    g.circle(s * dx, -s * 0.42, s * 0.26).fill(color);
    g.roundRect(s * dx - s * 0.3, -s * 0.08, s * 0.6, s * 0.7, s * 0.2).fill(color);
  }
}

const KEY_ICON_DRAW = {
  speed: drawSpeedIcon, moneySpeed: drawSpeedIcon, steelSpeed: drawSpeedIcon, oilSpeed: drawSpeedIcon, productionSpeed: drawSpeedIcon,
  trucks: drawTruckIcon, siteTier: drawSiteIcon,
  reservesCapacity: drawReservesIcon, reservesRecovery: drawReservesIcon,
};

/** @param {import('pixi.js').Graphics} g @param {object} node a RESEARCH_NODES entry @param {number} sizePx @param {number} color @returns {void} */
export function drawNodeIcon(g, node, sizePx, color) {
  if (node.id.includes('troops_cap')) { drawLevelCapIcon(g, sizePx, color); return; }
  const suffix = node.effect.key.split('.').pop();
  if (STAT_KEYS.has(suffix)) { drawStatIcon(g, suffix, { x: 0, y: 0 }, sizePx * 0.5, color); return; }
  const draw = KEY_ICON_DRAW[suffix];
  if (draw) { draw(g, sizePx, color); return; }
  (CATEGORY_ICON_DRAW[node.track] ?? CATEGORY_ICON_DRAW.placeholder)(g, sizePx, color);
}

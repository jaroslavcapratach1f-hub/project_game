/**
 * ResearchCategoryIconDraw — one small hand-drawn vector glyph per research
 * track, same convention `ActionIconDraw.js` already established (pure
 * builders, centred on (0,0), sized off the caller's own `sizePx`). The
 * "Coming Soon" slot reuses `ArmyIconDraw.drawLockIcon` directly rather
 * than inventing a new locked glyph — same visual language the rest of
 * this game already uses for "not available yet."
 */
import { drawLockIcon } from './ArmyIconDraw.js';

const HALF = 0.5;

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color 3 ascending bars — output/industry growth */
export function drawDevelopmentIcon(g, sizePx, color) {
  const s = sizePx * HALF, w = s * 0.38, gap = s * 0.2, heights = [0.45, 0.75, 1.05];
  for (let i = 0; i < 3; i++) {
    const h = heights[i] * s, x = -s * 0.75 + i * (w + gap);
    g.rect(x, s * 0.7 - h, w, h).fill(color);
  }
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color crossed blades — combat stats */
export function drawMilitaryIcon(g, sizePx, color) {
  const s = sizePx * HALF, w = s * 0.16;
  for (const flip of [1, -1]) {
    g.moveTo(-s * 0.75 * flip, -s * 0.75).lineTo(s * 0.75 * flip, s * 0.75).stroke({ color, width: w, cap: 'round' });
    g.circle(s * 0.75 * flip, s * 0.75, w * 0.9).fill(color);
  }
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color a stem forking 3 ways — per-branch specialisation */
export function drawDoctrineIcon(g, sizePx, color) {
  const s = sizePx * HALF, w = s * 0.14;
  g.moveTo(0, -s * 0.85).lineTo(0, 0).stroke({ color, width: w, cap: 'round' });
  for (const dx of [-0.75, 0, 0.75]) g.moveTo(0, 0).lineTo(s * dx, s * 0.85).stroke({ color, width: w, cap: 'round' });
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color shield outline — base defence */
export function drawDefenseIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  g.poly([0, -s, s * 0.78, -s * 0.55, s * 0.78, s * 0.3, 0, s, -s * 0.78, s * 0.3, -s * 0.78, -s * 0.55]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color a medical/support cross */
export function drawSupportIcon(g, sizePx, color) {
  const s = sizePx * HALF, armW = s * 0.42, armLen = s * 1.1;
  g.rect(-armW * HALF, -armLen * HALF, armW, armLen).fill(color);
  g.rect(-armLen * HALF, -armW * HALF, armLen, armW).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color "Coming Soon" — reuses the existing padlock glyph */
export function drawComingSoonIcon(g, sizePx, color) {
  drawLockIcon(g, { x: 0, y: sizePx * 0.1 }, sizePx * 0.9, color);
}

/** @type {Record<string,(g:import('pixi.js').Graphics, sizePx:number, color:number)=>void>} */
export const CATEGORY_ICON_DRAW = {
  development: drawDevelopmentIcon, military: drawMilitaryIcon, doctrine: drawDoctrineIcon,
  defense: drawDefenseIcon, support: drawSupportIcon, placeholder: drawComingSoonIcon,
};

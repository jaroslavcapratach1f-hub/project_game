/** Code-native military surfaces; no new raster UI asset dependencies. */
import { TROOP_MENU as T } from '../../config/TroopMenuTheme.js';
const CHANNEL = 255, RED_SHIFT = 16, GREEN_SHIFT = 8;
function blend(a, b, t) {
  const channel = shift => Math.round(((a >> shift) & CHANNEL) * (1 - t) + ((b >> shift) & CHANNEL) * t);
  return (channel(RED_SHIFT) << RED_SHIFT) | (channel(GREEN_SHIFT) << GREEN_SHIFT) | channel(0);
}
/** @param {Graphics} g @param {number} w @param {number} h @param {boolean} hero */
export function drawTroopSurface(g, w, h, hero = false) {
  g.clear();
  for (let i = 0; i < T.gradientSteps; i++) {
    const y = h * i / T.gradientSteps;
    g.rect(0, y, w, h / T.gradientSteps + 1).fill(blend(hero ? T.heroTop : T.top, hero ? T.heroBottom : T.bottom, i / T.gradientSteps));
  }
  for (let x = 0; x < w; x += T.gridPx) g.moveTo(x, 0).lineTo(x, h);
  for (let y = 0; y < h; y += T.gridPx) g.moveTo(0, y).lineTo(w, y);
  g.stroke({ color: T.grid, width: 1, alpha: T.gridAlpha });
  if (hero) g.rect(T.corner, T.corner, w - T.corner * 2, h - T.corner * 2).stroke({ color: T.brass, width: 1, alpha: T.gridAlpha * 2 });
}
/** @param {Graphics} g @param {number} size @param {number} footer @param {boolean} deployed */
export function drawTroopCard(g, size, footer, deployed) {
  g.clear();
  g.rect(0, size, size, footer).fill(T.plate);
  g.rect(0, 0, size, size + footer).stroke({ color: T.edge, width: 1 });
  g.rect(0, 0, size, T.bandPx).fill(deployed ? T.brass : T.edge);
  g.rect(T.inset, size + footer - T.inset, T.corner, 1).fill(T.brass);
}

/** @param {Graphics} g @param {number} x @param {number} y @param {number} w @param {number} h @param {boolean} active */
export function drawTroopTab(g, x, y, w, h, active) {
  g.clear().roundRect(x, y, w, h, T.tabRadius)
    .fill({ color: active ? T.top : T.ink, alpha: active ? 1 : T.tabIdleAlpha })
    .stroke({ color: active ? T.brass : T.edge, width: 1, alpha: active ? 1 : T.tabIdleAlpha });
  if (active) g.rect(x + T.corner, y + h - T.bandPx, w - T.corner * 2, T.bandPx).fill(T.brass);
}
/** @param {Graphics} g @param {number} size */
export function drawPortraitShade(g, size) {
  g.clear();
  const depth = size * T.vignetteFraction, step = depth / T.gradientSteps;
  for (let i = 0; i < T.gradientSteps; i++) {
    const alpha = T.vignetteAlpha * (1 - i / T.gradientSteps);
    g.rect(0, i * step, size, step).fill({ color: T.ink, alpha });
    g.rect(0, size - (i + 1) * step, size, step).fill({ color: T.ink, alpha });
  }
}

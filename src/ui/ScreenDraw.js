/**
 * ScreenDraw — pure PixiJS 8 Graphics builders shared by the front-end screens
 * (LoadingScreen / MenuScreen; later SettingsScreen / PauseScreen). Each takes a
 * Graphics + primitives, clears and redraws. No state, no allocation of its own
 * — the `ui/orders/OrderDraw.js` pattern.
 */
import { FillGradient } from 'pixi.js';
import { MENU } from '../config/MenuConfig.js';

const HALF = 0.5;

/**
 * Solid full-screen ground — the flash-of-nothing fallback shown for the
 * instant before LoadingScreen's background photo loads.
 * @param {import('pixi.js').Graphics} g @param {number} w @param {number} h
 * @returns {void}
 */
export function buildBackdrop(g, w, h) {
  g.clear().rect(0, 0, w, h).fill(MENU.color.backdrop);
}

/**
 * A dark top-to-bottom gradient scrim (`MENU.backdrop.scrimStops`) drawn
 * over LoadingScreen's background photo so the title/bar/tip text stays
 * legible against a bright, busy image. Creating a `FillGradient` per call
 * is intentional — layout only runs on show()/resize(), not every frame —
 * and each old one is naturally freed via `g.clear()`'s own disposal.
 * @param {import('pixi.js').Graphics} g @param {number} w @param {number} h
 * @returns {void}
 */
export function buildScrim(g, w, h) {
  const b = MENU.backdrop;
  const gradient = new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    colorStops: b.scrimStops.map((s) => ({ offset: s.offset, color: `rgba(${b.scrimColor},${s.alpha})` })),
    textureSpace: 'local',
  });
  g.clear().rect(0, 0, w, h).fill(gradient);
}

/**
 * Cover-fit `sprite`'s current texture into a `w`x`h` box, centred — scales
 * up just enough to cover both dimensions, cropping the overflow (CSS
 * `background-size:cover`), the same convention SquadBar's own portrait fit
 * uses. No-op while the texture isn't loaded yet.
 * @param {import('pixi.js').Sprite} sprite @param {number} w @param {number} h
 * @returns {void}
 */
export function fitCover(sprite, w, h) {
  const tex = sprite.texture;
  if (!tex?.width || !tex?.height) return;
  sprite.anchor.set(HALF, HALF);
  sprite.scale.set(Math.max(w / tex.width, h / tex.height));
  sprite.position.set(w * HALF, h * HALF);
}

/**
 * Contain-fit `sprite`'s current texture into a `w`x`h` box, centred —
 * scales down just enough that both dimensions fit, letterboxing the rest
 * (CSS `background-size:contain`) — unlike `fitCover`, never crops the
 * subject. No-op while the texture isn't loaded yet.
 * @param {import('pixi.js').Sprite} sprite @param {number} w @param {number} h
 * @returns {void}
 */
export function fitContain(sprite, w, h) {
  const tex = sprite.texture;
  if (!tex?.width || !tex?.height) return;
  sprite.anchor.set(HALF, HALF);
  sprite.scale.set(Math.min(w / tex.width, h / tex.height));
  sprite.position.set(w * HALF, h * HALF);
}

/**
 * A rounded horizontal bar (progress-bar track or fill). Caller sets width for
 * the fill; height / radius / colour come from the loading config.
 * @param {import('pixi.js').Graphics} g @param {number} widthPx
 * @param {number} color @param {number} [alpha=1] @returns {void}
 */
export function buildBar(g, widthPx, color, alpha = 1) {
  const l = MENU.loading;
  g.clear()
    .roundRect(0, 0, Math.max(widthPx, l.barRadiusPx * 2), l.barHeightPx, l.barRadiusPx)
    .fill({ color, alpha });
}

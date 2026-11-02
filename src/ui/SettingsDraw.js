/**
 * SettingsDraw — pure builders shared by SettingsScreen and PauseScreen (the
 * `OrderDraw` pattern): a full-screen dimmer, a bordered centred panel, and the
 * geometry of a centred panel for a given content height. No state.
 */
import { MENU } from '../config/MenuConfig.js';

const HALF = 0.5;
const TOP_MIN_PX = 12;

/**
 * @param {import('pixi.js').Graphics} g @param {number} w @param {number} h
 * @returns {void}
 */
export function buildDimmer(g, w, h) {
  g.clear().rect(0, 0, w, h).fill({ color: MENU.panel.dimmer, alpha: MENU.panel.dimmerAlpha });
}

/**
 * Bordered panel drawn at local (0,0)–(w,h).
 * @param {import('pixi.js').Graphics} g @param {number} w @param {number} h
 * @returns {void}
 */
export function buildPanel(g, w, h) {
  const p = MENU.panel;
  g.clear()
    .roundRect(0, 0, w, h, p.radiusPx)
    .fill({ color: p.bg, alpha: p.bgAlpha })
    .stroke({ color: p.stroke, width: p.strokeWidthPx, alpha: p.strokeAlpha });
}

/**
 * Centred panel rect for a given content height (clamped near the top edge).
 * @param {{width:number,height:number}} screen @param {number} contentH
 * @returns {{x:number,y:number,w:number,h:number}}
 */
export function centredPanel(screen, contentH) {
  const p = MENU.panel;
  const w = Math.min(p.widthPx, screen.width * p.maxWidthFrac);
  return {
    x: (screen.width - w) * HALF,
    y: Math.max((screen.height - contentH) * HALF, TOP_MIN_PX),
    w, h: contentH,
  };
}

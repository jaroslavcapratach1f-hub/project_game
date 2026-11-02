/**
 * LoadingDraw — pure helpers for LoadingScreen (the `ui/orders/OrderDraw.js`
 * pattern): a centred-Text factory, the progress-bar width, and the one function
 * that re-anchors every element to the screen centre. No state.
 */
import { Text, TextStyle } from 'pixi.js';
import { MENU } from '../config/MenuConfig.js';
import { buildBackdrop, buildScrim, fitCover, buildBar } from './ScreenDraw.js';

const HALF = 0.5;

/**
 * @param {number} size px @param {number} fill 0xRRGGBB @param {string} value
 * @returns {Text} a centre-anchored Text
 */
export function makeText(size, fill, value) {
  const t = new Text({ text: value, style: new TextStyle({ fontFamily: MENU.fontFamily, fontSize: size, fill }) });
  t.anchor.set(HALF, HALF);
  return t;
}

/** @param {{width:number}} screen @returns {number} progress-bar width, px */
export function barWidth(screen) {
  return Math.min(screen.width * MENU.loading.barWidthFrac, MENU.loading.barMaxWidthPx);
}

/**
 * Re-anchor the whole loading screen to the current size. `r` bundles the
 * display objects `{ bg, image, scrim, title, track, fill, percent, tip,
 * begin }`; `targetFrac` picks the fill colour (gold vs full-gold). `image`
 * is cover-fit as-is — LoadingScreen.js is the one that picks WHICH
 * (horizontal/vertical) texture it currently holds.
 * @param {object} r @param {{width:number,height:number}} screen
 * @param {number} targetFrac @returns {void}
 */
export function layoutLoading(r, screen, targetFrac) {
  const l = MENU.loading;
  const cx = screen.width * HALF;
  const w = barWidth(screen);
  buildBackdrop(r.bg, screen.width, screen.height);
  fitCover(r.image, screen.width, screen.height);
  buildScrim(r.scrim, screen.width, screen.height);
  r.title.position.set(cx, screen.height * l.titleYFrac);
  let y = r.title.y + r.title.height * HALF + l.barGapPx;
  buildBar(r.track, w, l.barBg, l.barBgAlpha);
  buildBar(r.fill, w, targetFrac >= 1 ? l.barFillFull : l.barFill);
  r.track.position.set(cx - w * HALF, y);
  r.fill.position.set(cx - w * HALF, y);
  y += l.barHeightPx + l.percentGapPx;
  r.percent.position.set(cx, y);
  y += r.percent.height + l.tipGapPx;
  r.tip.position.set(cx, y);
  r.begin.position.set(cx, y + r.tip.height + l.beginGapPx);
}

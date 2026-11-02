/**
 * NavBar — the 5-tab bottom navigation cluster (S54 redesign — was a 6-tab
 * text-only strip spanning the full screen width, then one shared bar that
 * still read as a single continuous strip). SEPARATE icon-over-label button
 * cards, own rounded-rect bg/stroke each — same visual language as
 * `MapButtons`' own Home/World buttons — screen-space on LAYERS.HUD, docked
 * bottom-RIGHT and capped at `WORLD_HUD.navBar.widthFracMax` of the screen
 * (user's own hard cap — see HudConfig.js's header comment on the block).
 * Icons: `NavIconDraw.js`. It does no input routing itself — Hud hit-tests
 * it via `rect` / `tabIdAt` and calls `setActive`. Tabs come from
 * WORLD_HUD.navBar.tabs.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, navEdgePad } from '../../config/HudConfig.js';
import { NAV_ICON_DRAW } from './NavIconDraw.js';

const HALF = 0.5;

export class NavBar {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    /** @private @type {{bg:import('pixi.js').Graphics,icon:import('pixi.js').Graphics,label:import('pixi.js').Text}[]} */
    this._btns = [];
    /** @private */ this._rect = { x: 0, y: 0, w: 0, h: 0 };
    /** @private */ this._activeId = null;
  }

  /** @returns {{x:number,y:number,w:number,h:number}} bounding bar area, screen px (the row of cards sits inside this) */
  get rect() { return this._rect; }

  /** @returns {void} */
  enable() {
    const n = WORLD_HUD.navBar;
    const style = new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: n.labelPx, fill: n.idleColor });
    for (const tab of n.tabs) {
      const bg = new Graphics();
      const icon = new Graphics();
      const label = new Text({ text: tab.label, style: style.clone() });
      label.anchor.set(HALF, 0);
      this._btns.push({ bg, icon, label });
      this._root.addChild(bg, icon, label);
    }
    this._paintIcons();
    this._renderer.layer('HUD').addChild(this._root);
  }

  /** @returns {void} */
  disable() {
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} screenWidth @param {number} screenHeight @returns {void} */
  layout(screenWidth, screenHeight) {
    const n = WORLD_HUD.navBar;
    // S58: portrait gets its own, much wider fraction (user's own call,
    // 70-80%) — 0.4 was tuned for landscape/desktop and collapsed the row
    // to illegible ~31px cards on a phone in portrait.
    const frac = screenHeight > screenWidth ? n.widthFracMaxPortrait : n.widthFracMax;
    const w = Math.min(screenWidth * frac, n.preferredBtnWidthPx * this._btns.length);
    // Landscape only (the player's own report) — flush-right sat the card
    // right at the physical screen edge, partly clipped on a real device.
    const edgePad = navEdgePad(screenWidth, screenHeight);
    this._rect = { x: screenWidth - w - edgePad, y: screenHeight - n.heightPx, w, h: n.heightPx };
    const cell = w / this._btns.length;
    const btnW = cell - n.btnGapPx, btnH = n.heightPx - n.btnGapPx;
    const by = this._rect.y + n.btnGapPx * HALF;
    for (let i = 0; i < this._btns.length; i++) {
      const bx = this._rect.x + cell * i + n.btnGapPx * HALF;
      const cx = bx + btnW * HALF;
      const iconY = by + btnH * HALF - n.labelGapPx;
      this._btns[i].icon.position.set(cx, iconY);
      this._btns[i].label.position.set(cx, iconY + n.iconPx * HALF + n.labelGapPx);
      this._paintButtonBg(i, bx, by, btnW, btnH);
    }
  }

  /** @param {string} id one of WORLD_HUD.navBar.tabs[].id @returns {void} */
  setActive(id) {
    this._activeId = id;
    this._paintIcons();
    const n = WORLD_HUD.navBar;
    const cell = this._rect.w / this._btns.length;
    const btnW = cell - n.btnGapPx, btnH = n.heightPx - n.btnGapPx;
    const by = this._rect.y + n.btnGapPx * HALF;
    for (let i = 0; i < this._btns.length; i++) {
      this._paintButtonBg(i, this._rect.x + cell * i + n.btnGapPx * HALF, by, btnW, btnH);
    }
  }

  /**
   * @param {number} sx @param {number} sy screen px
   * @returns {?string} the tab id under the point, or null
   */
  tabIdAt(sx, sy) {
    if (!this._hit(sx, sy)) return null;
    const n = WORLD_HUD.navBar;
    const idx = Math.floor((sx - this._rect.x) / (this._rect.w / n.tabs.length));
    return n.tabs[Math.max(0, Math.min(n.tabs.length - 1, idx))].id;
  }

  /** @param {number} sx @param {number} sy @returns {boolean} */
  hitTest(sx, sy) { return this._hit(sx, sy); }

  /** @private */
  _hit(sx, sy) {
    const r = this._rect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }

  /** @private redraw every tab's icon + label in its idle/active colour */
  _paintIcons() {
    const n = WORLD_HUD.navBar;
    for (let i = 0; i < this._btns.length; i++) {
      const tab = n.tabs[i], active = tab.id === this._activeId;
      const color = active ? n.activeColor : n.idleColor;
      this._btns[i].icon.clear();
      NAV_ICON_DRAW[tab.id]?.(this._btns[i].icon, n.iconPx, color);
      this._btns[i].label.style.fill = color;
    }
  }

  /** @private one button's own rounded-rect card @param {number} i @param {number} x @param {number} y @param {number} w @param {number} h */
  _paintButtonBg(i, x, y, w, h) {
    const n = WORLD_HUD.navBar;
    const active = n.tabs[i].id === this._activeId;
    this._btns[i].bg.clear()
      .roundRect(x, y, w, h, n.btnRadiusPx)
      .fill({ color: n.btnBg, alpha: active ? n.activeBtnBgAlpha : n.btnBgAlpha })
      .stroke({
        color: active ? n.activeBtnStroke : n.btnStroke,
        width: active ? n.activeBtnStrokeWidthPx : n.btnStrokeWidthPx,
        alpha: active ? 1 : n.btnStrokeAlpha,
      });
  }
}

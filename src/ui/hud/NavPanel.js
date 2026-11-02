/**
 * NavPanel — one full-screen panel over the running map (GDD 23), on
 * LAYERS.OVERLAY. Opened by NavBar taps; shows the tapped tab's title, a
 * "coming soon" note, and its planned contents. Any tap dismisses it (Hud
 * routes that) — the map keeps simulating behind the scrim. GSAP fade + slide.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { WORLD_HUD } from '../../config/HudConfig.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;
const CARD_ROW_PX = 22; // vertical step between card rows

export class NavPanel {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    this._root.visible = false;
    this._scrim = new Graphics();
    this._card = new Container();
    this._cardBg = new Graphics();
    this._title = null;
    this._soon = null;
    this._hint = null;
    /** @private @type {Text[]} */ this._lines = [];
    this._open = false;
    this._h = 0;
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }

  /** @returns {void} */
  enable() {
    const p = WORLD_HUD.panel;
    const fam = WORLD_HUD.fontFamily;
    const mk = (px, fill) => new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: px, fill }) });
    this._title = mk(p.titlePx, WORLD_HUD.accentColor);
    this._soon = mk(p.linePx, WORLD_HUD.dimColor);
    this._soon.text = p.soon;
    this._hint = mk(p.hintPx, WORLD_HUD.dimColor);
    this._hint.text = p.hint;
    this._hint.anchor.set(HALF, 0);
    this._card.addChild(this._cardBg, this._title, this._soon, this._hint);
    this._root.addChild(this._scrim, this._card);
    this._renderer.layer('OVERLAY').addChild(this._root);
  }

  /** @returns {void} */
  disable() {
    gsap.killTweensOf(this._card);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} screenWidth @param {number} screenHeight @returns {void} */
  layout(screenWidth, screenHeight) {
    this._h = screenHeight;
    this._scrim.clear().rect(0, 0, screenWidth, screenHeight)
      .fill({ color: WORLD_HUD.panel.scrim, alpha: WORLD_HUD.panel.scrimAlpha });
    this._card.position.set(screenWidth * HALF, screenHeight * HALF);
  }

  /**
   * @param {{label:string, lines:string[]}} tab a WORLD_HUD.navBar.tabs entry
   * @returns {void}
   */
  open(tab) {
    const p = WORLD_HUD.panel;
    this._title.text = tab.label;
    for (const t of this._lines) { this._card.removeChild(t); t.destroy(); }
    this._lines = tab.lines.map((s) => new Text({
      text: `•  ${s}`,
      style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: p.linePx, fill: WORLD_HUD.textColor }),
    }));
    for (const t of this._lines) this._card.addChild(t);
    this._reflow();
    this._open = true;
    this._root.visible = true;
    gsap.killTweensOf(this._card);
    gsap.fromTo(this._card,
      { y: this._h * HALF + p.slideFromPx, alpha: 0 },
      { y: this._h * HALF, alpha: 1, duration: p.slideMs / MS_PER_SECOND, ease: 'power2.out' });
  }

  /** @returns {void} */
  close() {
    if (!this._open) return;
    this._open = false;
    this._root.visible = false;
    gsap.killTweensOf(this._card);
  }

  /** @private lay out rows top-to-bottom, size the card box to fit */
  _reflow() {
    const p = WORLD_HUD.panel;
    const rows = 2 + this._lines.length;                 // title + soon + bullets
    const bodyH = p.padPx * 2 + p.titlePx + CARD_ROW_PX * rows + p.hintPx;
    const left = -p.cardWidthPx * HALF + p.padPx;
    let y = -bodyH * HALF + p.padPx;
    this._title.position.set(left, y); y += p.titlePx + p.lineGapPx;
    this._soon.position.set(left, y); y += CARD_ROW_PX;
    for (const t of this._lines) { t.position.set(left, y); y += CARD_ROW_PX; }
    this._hint.position.set(0, bodyH * HALF - p.padPx - p.hintPx);
    this._cardBg.clear()
      .roundRect(-p.cardWidthPx * HALF, -bodyH * HALF, p.cardWidthPx, bodyH, p.cardRadiusPx)
      .fill({ color: p.cardBg })
      .stroke({ color: p.cardStroke, width: p.cardStrokeWidthPx });
  }
}

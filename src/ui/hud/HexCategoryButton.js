/**
 * HexCategoryButton — one hex in the Research hub's 1-2-1-2 column: a glass
 * hex (`GlassHexDraw`, every hex the SAME radius — the player's own
 * explicit correction, no more differently-sized hero/column hexes)
 * tinted with the track's own themed colour wash (no real photo art exists
 * anywhere in this project for these 5 abstract themes — the player's own
 * explicit call: a colour wash from CLAUDE.md's own named palette instead,
 * swappable for real art later) + icon + label + a real per-track progress
 * line ("N/M ranks") BAKED INSIDE the hex (the player's own reference —
 * not below it), for any category in `C.openCategories`. Every other
 * category — the one inert placeholder slot AND any real track not yet
 * opened up (`C.openCategories`) — renders the identical dimmed "Coming
 * Soon" lock-icon treatment (the player's own explicit instruction: match
 * the reference screenshot's own mostly-locked state). Same tiny
 * `setPosition`/`contains`/`destroy` interface `BuildingHexOption` already
 * uses, just bigger and with icon/label/progress stacked inside.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_HUB as C } from '../../config/ResearchScreenConfig.js';
import { drawGlassHex } from './GlassHexDraw.js';
import { CATEGORY_ICON_DRAW } from './ResearchCategoryIconDraw.js';

const HALF = 0.5;

export class HexCategoryButton {
  /** @param {string} category a `C.categories` entry (track id, or 'placeholder') @param {number} radius */
  constructor(category, radius) {
    this._category = category; this._radius = radius;
    this._x = 0; this._y = 0;
    this._isComingSoon = category === 'placeholder' || !C.openCategories.includes(category);
    this.view = new Container();
    this._hex = new Graphics();
    this._icon = new Graphics();
    const fam = WORLD_HUD.fontFamily;
    this._label = new Text({
      text: this._isComingSoon ? C.placeholderLabel : C.trackLabel[category],
      style: new TextStyle({ fontFamily: fam, fontSize: C.labelPx, fill: C.labelColor, fontWeight: 'bold', align: 'center', wordWrap: true, wordWrapWidth: radius * 1.4 }),
    });
    this._label.anchor.set(HALF, 0);
    this._progress = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.progressPx, fill: C.progressColor, fontWeight: 'bold' }) });
    this._progress.anchor.set(HALF, 0);
    this.view.alpha = this._isComingSoon ? C.comingSoonAlpha : 1;
    this._drawHex();
    const draw = CATEGORY_ICON_DRAW[this._isComingSoon ? 'placeholder' : category];
    if (draw) draw(this._icon, radius * C.iconFrac * 2, C.iconColor);
    this._icon.position.set(0, -radius * 0.34);
    this._label.position.set(0, radius * 0.02);
    this._progress.position.set(0, radius * 0.02 + C.labelPx + C.progressGapPx);
    this.view.addChild(this._hex, this._icon, this._label, this._progress);
  }

  /** @returns {string} */ get category() { return this._category; }
  /** @returns {number} */ get radius() { return this._radius; }
  /** @returns {boolean} this tile is inert — never hit-tests true, no progress text (the placeholder slot, or a real track not yet in `C.openCategories`) */ get isComingSoon() { return this._isComingSoon; }

  /** @param {string} text e.g. "4/97 ranks" — real data, caller supplies it @returns {void} */
  setProgress(text) { this._progress.text = text; }

  /** @param {number} x @param {number} y the HEX CENTRE @returns {void} */
  setPosition(x, y) { this._x = x; this._y = y; this.view.position.set(x, y); }

  /** @returns {number} total height from the hex's own centre to its own bottom edge — all content now lives INSIDE the hex, nothing extends below it */
  get totalHeight() { return this._radius; }

  /** @param {number} x @param {number} y @returns {boolean} inert while `isComingSoon` — the player's own explicit "nothing happens" choice */
  contains(x, y) {
    if (this._isComingSoon) return false;
    const dx = x - this._x, dy = y - this._y;
    return Math.sqrt(dx * dx + dy * dy) <= this._radius;
  }

  /** @returns {void} */
  destroy() { this.view.parent?.removeChild(this.view); this.view.destroy({ children: true }); }

  /** @private */
  _drawHex() {
    const fill = this._isComingSoon ? C.glass.bevelColor : C.trackColor[this._category];
    drawGlassHex(this._hex, this._radius, { ...C.glass, fill });
  }
}

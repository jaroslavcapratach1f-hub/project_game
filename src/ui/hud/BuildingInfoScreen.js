/**
 * BuildingInfoScreen — ONE reusable centered panel for EVERY building (the
 * player's own explicit rule — no per-building screen classes). Shows the
 * CURRENT level only: header (name + level, a "?" to drill into
 * `BuildingLevelInfoScreen`, an "X" to close), a left preview swatch
 * (`BuildingArtConfig.buildingArt(id).tint` — the building's own REAL art
 * tint, not an invented colour), a short real description
 * (`BuildingStatsConfig.BUILDING_DESCRIPTIONS`), and the building's own
 * real current-level stats (`buildingStatsAt` — the single source of truth
 * also driving the Level-Info table and the Upgrade screen). NO Max
 * Storage row, ever (the player's own explicit, repeated rule).
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BUILDING_INFO as C } from '../../config/BuildingScreenConfig.js';
import { buildingArt } from '../../config/BuildingArtConfig.js';
import { BUILDING_DESCRIPTIONS, buildingStatsAt } from '../../config/BuildingStatsConfig.js';
import { ResourceStatIcon } from './ResourceStatIcon.js';

const STAT_ICON_COLOR = { moneyPerHour: 0xc9c9c2, steelPerHour: 0x9aa0a6, oilPerHour: 0x6f8f35, power: 0xffd23c };
const DEFAULT_STAT_ICON_COLOR = 0xc9c9c2;

const HALF = 0.5;

export class BuildingInfoScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._open = false;
    this._id = null; this._level = 1;
    this._onQuestion = null;
    this._w = 0; this._h = 0;
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._root = new Container();
    this._root.visible = false;
    this._scrim = new Graphics();
    this._card = new Container();
    this._cardBg = new Graphics();
    const fam = WORLD_HUD.fontFamily;
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.titlePx, fill: C.titleColor, fontWeight: 'bold' }) });
    this._title.anchor.set(0, HALF);
    this._questionBg = new Graphics(); this._xBg = new Graphics();
    this._questionLabel = new Text({ text: '?', style: new TextStyle({ fontFamily: fam, fontSize: 16, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._xLabel = new Text({ text: '✕', style: new TextStyle({ fontFamily: fam, fontSize: 13, fill: WORLD_HUD.dimColor }) });
    this._questionLabel.anchor.set(HALF); this._xLabel.anchor.set(HALF);
    this._preview = new Graphics();
    this._desc = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.descPx, fill: WORLD_HUD.dimColor, wordWrap: true, lineHeight: C.descLineHeightPx }) });
    /** @private @type {{icon:ResourceStatIcon,label:Text,value:Text}[]} */
    this._statRows = [];
    this._card.addChild(this._cardBg, this._title, this._questionBg, this._questionLabel, this._xBg, this._xLabel, this._preview, this._desc);
    this._root.addChild(this._scrim, this._card);
    this._questionRect = { x: 0, y: 0, w: 0, h: 0 }; this._xRect = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }

  /** @returns {void} */
  enable() { this._renderer.layer('OVERLAY').addChild(this._root); }
  /** @returns {void} */
  disable() { this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /** @param {number} w @param {number} h @returns {void} */
  layout(w, h) {
    this._w = w; this._h = h;
    this._scrim.clear().rect(0, 0, w, h).fill({ color: WORLD_HUD.panel.scrim, alpha: WORLD_HUD.panel.scrimAlpha });
    this._card.position.set(w * HALF, h * HALF);
    if (this._id) this._reflow();
  }

  /**
   * @param {string} id BUILDINGS key @param {number} level @param {string} name
   *   display name — barracks-variant-aware, the SAME one `BuildingScreensController._nameOf`
   *   resolves for every one of these 3 screens (the single source of truth)
   * @param {(id:string,level:number)=>void} onQuestion
   * @returns {void}
   */
  open(id, level, name, onQuestion) {
    this._id = id; this._level = level; this._onQuestion = onQuestion;
    this._title.text = `${name} — Lvl ${level}`;
    this._desc.text = BUILDING_DESCRIPTIONS[id] ?? '';
    this._rebuildStats();
    this._reflow();
    this._open = true;
    this._root.visible = true;
  }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} true if this tap was consumed */
  handleTap(sx, sy) {
    if (!this._open) return false;
    if (!within(this._rect, sx, sy)) { this.close(); return true; } // tap outside the card closes it
    // the button rects are LOCAL to the card Container — translate the
    // incoming absolute screen tap into that same space before testing
    const lx = sx - this._w * HALF, ly = sy - this._h * HALF;
    if (within(this._questionRect, lx, ly)) { this._onQuestion?.(this._id, this._level); return true; }
    if (within(this._xRect, lx, ly)) { this.close(); return true; }
    return true; // swallow every tap inside the card, even on blank space
  }

  /** @private rebuild the stat rows from the single source of truth */
  _rebuildStats() {
    for (const r of this._statRows) { r.icon.destroy(); r.label.destroy(); r.value.destroy(); }
    this._statRows = [];
    const fam = WORLD_HUD.fontFamily;
    for (const s of buildingStatsAt(this._id, this._level)) {
      const icon = new ResourceStatIcon();
      const label = new Text({ text: s.label, style: new TextStyle({ fontFamily: fam, fontSize: C.statLabelPx, fill: WORLD_HUD.dimColor }) });
      const value = new Text({ text: s.display, style: new TextStyle({ fontFamily: fam, fontSize: C.statValuePx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
      value.anchor.set(1, 0);
      this._statRows.push({ icon, label, value, key: s.key });
      this._card.addChild(icon.view, label, value);
    }
  }

  /** @private position everything + size the card to fit */
  _reflow() {
    const bodyH = C.headerPx + C.previewSizePx + C.descGapPx + this._statRows.length * (C.statRowH + C.statGapPx);
    const left = -C.widthPx * HALF + C.padPx, top = -bodyH * HALF;
    this._cardBg.clear().roundRect(-C.widthPx * HALF, top, C.widthPx, bodyH, C.radiusPx)
      .fill({ color: WORLD_HUD.panel.cardBg }).stroke({ color: WORLD_HUD.panel.cardStroke, width: WORLD_HUD.panel.cardStrokeWidthPx });
    this._title.position.set(left, top + C.headerPx * HALF);
    const xCx = C.widthPx * HALF - C.padPx - C.btnSizePx * HALF, qCx = xCx - C.btnSizePx - C.btnGapPx;
    const btnCy = top + C.headerPx * HALF;
    // LOCAL card-space rects (the card itself is a Container positioned at
    // this._w/2,this._h/2 — see layout()) — drawn as-is via paintRoundBtn,
    // and compared against in handleTap() after translating the incoming
    // ABSOLUTE screen tap into this same local space.
    this._xRect = { x: xCx - C.btnSizePx * HALF, y: btnCy - C.btnSizePx * HALF, w: C.btnSizePx, h: C.btnSizePx };
    this._questionRect = { x: qCx - C.btnSizePx * HALF, y: btnCy - C.btnSizePx * HALF, w: C.btnSizePx, h: C.btnSizePx };
    paintRoundBtn(this._xBg, this._xRect, C.btnRadiusPx); this._xLabel.position.set(xCx, btnCy);
    paintRoundBtn(this._questionBg, this._questionRect, C.btnRadiusPx); this._questionLabel.position.set(qCx, btnCy);
    const previewY = top + C.headerPx;
    this._preview.clear().roundRect(left, previewY, C.previewSizePx, C.previewSizePx, C.previewRadiusPx).fill(buildingArt(this._id).tint);
    this._desc.position.set(left + C.previewSizePx + C.padPx, previewY);
    this._desc.style.wordWrapWidth = C.widthPx - C.padPx * 2 - C.previewSizePx - C.padPx;
    let y = previewY + C.previewSizePx + C.descGapPx;
    const statsLeft = left, statsRight = C.widthPx * HALF - C.padPx;
    for (const r of this._statRows) {
      const cy = y + C.statRowH * HALF;
      r.icon.draw(r.key, statsLeft + C.iconR, cy, C.iconR, STAT_ICON_COLOR[r.key] ?? DEFAULT_STAT_ICON_COLOR);
      r.label.position.set(statsLeft + C.iconR * 2 + 8, cy - C.statLabelPx * HALF);
      r.value.position.set(statsRight, cy - C.statValuePx * HALF);
      y += C.statRowH + C.statGapPx;
    }
    this._rect = { x: this._w * HALF - C.widthPx * HALF, y: this._h * HALF + top, w: C.widthPx, h: bodyH };
  }
}

/** @param {{x:number,y:number,w:number,h:number}} r @param {number} sx @param {number} sy @returns {boolean} */
function within(r, sx, sy) { return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h; }

/** @param {import('pixi.js').Graphics} g @param {{x:number,y:number,w:number,h:number}} r @param {number} radius @returns {void} */
function paintRoundBtn(g, r, radius) {
  g.clear().roundRect(r.x, r.y, r.w, r.h, radius)
    .fill({ color: WORLD_HUD.navBar.btnBg, alpha: WORLD_HUD.navBar.btnBgAlpha })
    .stroke({ color: WORLD_HUD.navBar.btnStroke, width: 1, alpha: WORLD_HUD.navBar.btnStrokeAlpha });
}

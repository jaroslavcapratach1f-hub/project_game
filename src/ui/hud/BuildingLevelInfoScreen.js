/**
 * BuildingLevelInfoScreen — ONE reusable centered, scrollable table of
 * EVERY level for the selected building (opened by `BuildingInfoScreen`'s
 * own "?" button). Columns are whatever `buildingStatsAt(id, level)` (the
 * same single source of truth every one of these 3 screens reads) actually
 * returns for this building — no hard-coded Treasury-shaped table, no Max
 * Storage column. Rows run 1..`BUILDINGS[id].max` — this building's REAL,
 * ABSOLUTE level ceiling (`HQ.maxLevel` = 36), DELIBERATELY NOT
 * `effectiveMaxLevel(id, hqLevel)` (that's the player's CURRENT
 * upgrade-eligibility gate, used by the Upgrade screen's own button — a
 * reference/preview table showing "every level's stats" must show every
 * level that EXISTS, not just the ones already reachable, or a player on a
 * low HQ sees a 3-row table and reasonably assumes the building only HAS 3
 * levels). Current level highlighted, `ScrollDrag` for the vertical list
 * since even 36 rows don't fit one screen.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BUILDING_LEVEL_INFO as C } from '../../config/BuildingScreenConfig.js';
import { BUILDINGS } from '../../config/BuildingConfig.js';
import { buildingStatsAt } from '../../config/BuildingStatsConfig.js';
import { ScrollDrag } from './ScrollDrag.js';

const HALF = 0.5;

export class BuildingLevelInfoScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._open = false;
    this._id = null; this._currentLevel = 1;
    this._w = 0; this._h = 0;
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._xRect = { x: 0, y: 0, w: 0, h: 0 };
    this._root = new Container();
    this._root.visible = false;
    this._scrim = new Graphics();
    this._card = new Container();
    this._cardBg = new Graphics();
    const fam = WORLD_HUD.fontFamily;
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.titlePx, fill: C.titleColor, fontWeight: 'bold' }) });
    this._title.anchor.set(0, HALF);
    this._xBg = new Graphics();
    this._xLabel = new Text({ text: '✕', style: new TextStyle({ fontFamily: fam, fontSize: 13, fill: WORLD_HUD.dimColor }) });
    this._xLabel.anchor.set(HALF);
    /** @private @type {Text[]} */ this._colHeaders = [];
    this._listMask = new Graphics();
    this._listInner = new Container();
    this._listInner.mask = this._listMask;
    /** @private @type {{bg:Graphics,level:Text,values:Text[]}[]} */ this._rows = [];
    this._card.addChild(this._cardBg, this._title, this._xBg, this._xLabel, this._listMask, this._listInner);
    this._root.addChild(this._scrim, this._card);
    this._listRect = { x: 0, y: 0, w: 0, h: 0 };
    // _listRect is kept in ABSOLUTE screen px (ScrollDrag compares it
    // against raw drag-event coords) but _listInner is a child of the
    // LOCALLY-offset `_card` Container — its own position needs the local
    // list origin, tracked separately via _listLocalX/_listLocalY, not
    // _listRect itself (reusing _listRect here double-offsets it
    // off-screen — the exact bug that left the row table rendering empty).
    this._listLocalX = 0; this._listLocalY = 0;
    this._scroll = new ScrollDrag(events,
      () => (this._open ? this._listRect : null),
      (y) => { this._listInner.position.y = this._listLocalY + y; });
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }

  /** @returns {void} */
  enable() { this._renderer.layer('OVERLAY').addChild(this._root); this._scroll.enable(); }
  /** @returns {void} */
  disable() { this._scroll.disable(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */
  isDraggingScroll() { return this._scroll.isDragging; }

  /** @param {number} w @param {number} h @returns {void} */
  layout(w, h) {
    this._w = w; this._h = h;
    this._scrim.clear().rect(0, 0, w, h).fill({ color: WORLD_HUD.panel.scrim, alpha: WORLD_HUD.panel.scrimAlpha });
    this._card.position.set(w * HALF, h * HALF);
    if (this._id) this._reflow();
  }

  /**
   * @param {string} id BUILDINGS key @param {number} currentLevel @param {number} hqLevel
   * @param {string} name display name — see `BuildingInfoScreen.open`'s own doc on this param
   * @returns {void}
   */
  open(id, currentLevel, hqLevel, name) {
    this._id = id; this._currentLevel = currentLevel; this._hqLevel = hqLevel;
    this._title.text = `${name} — Level Info`;
    this._buildColumns();
    this._buildRows();
    this._scroll.reset();
    this._reflow();
    this._open = true;
    this._root.visible = true;
  }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} */
  handleTap(sx, sy) {
    if (!this._open) return false;
    if (!within(this._rect, sx, sy)) { this.close(); return true; }
    // _xRect is LOCAL to the card Container (see _reflow) — translate the
    // incoming absolute screen tap into that same space before testing,
    // same fix as BuildingInfoScreen.handleTap.
    const lx = sx - this._w * HALF, ly = sy - this._h * HALF;
    if (within(this._xRect, lx, ly)) { this.close(); return true; }
    return true;
  }

  /** @private one Text per stat column, rebuilt per open() (count/labels vary by building) */
  _buildColumns() {
    for (const t of this._colHeaders) t.destroy();
    this._colHeaders = [];
    const fam = WORLD_HUD.fontFamily;
    const cols = ['Level', ...buildingStatsAt(this._id, 1).map((s) => s.label)];
    for (const label of cols) {
      const t = new Text({ text: label.toUpperCase(), style: new TextStyle({ fontFamily: fam, fontSize: C.colHeaderPx, fill: C.colHeaderColor }) });
      this._colHeaders.push(t);
      this._card.addChild(t);
    }
  }

  /** @private one row per level, 1..this building's own absolute max (see this file's own doc — NOT HQ-gated) */
  _buildRows() {
    for (const r of this._rows) { r.bg.destroy(); r.level.destroy(); for (const v of r.values) v.destroy(); }
    this._rows = [];
    const fam = WORLD_HUD.fontFamily;
    const maxLevel = BUILDINGS[this._id]?.max ?? 1;
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      const bg = new Graphics();
      const level = new Text({ text: `${lvl}`, style: new TextStyle({ fontFamily: fam, fontSize: C.valuePx, fill: C.valueColor, fontWeight: 'bold' }) });
      const stats = buildingStatsAt(this._id, lvl);
      const values = stats.map((s) => new Text({ text: s.display, style: new TextStyle({ fontFamily: fam, fontSize: C.valuePx, fill: C.valueColor }) }));
      this._listInner.addChild(bg, level, ...values);
      this._rows.push({ bg, level, values });
    }
  }

  /** @private */
  _reflow() {
    const h = this._h * C.heightFrac;
    const top = -h * HALF, left = -C.widthPx * HALF + C.padPx;
    this._cardBg.clear().roundRect(-C.widthPx * HALF, top, C.widthPx, h, C.radiusPx)
      .fill({ color: WORLD_HUD.panel.cardBg }).stroke({ color: WORLD_HUD.panel.cardStroke, width: WORLD_HUD.panel.cardStrokeWidthPx });
    this._title.position.set(left, top + C.headerPx * HALF);
    const xCx = C.widthPx * HALF - C.padPx - C.btnSizePx * HALF, xCy = top + C.headerPx * HALF;
    this._xRect = { x: xCx - C.btnSizePx * HALF, y: xCy - C.btnSizePx * HALF, w: C.btnSizePx, h: C.btnSizePx };
    this._xBg.clear().roundRect(this._xRect.x, this._xRect.y, C.btnSizePx, C.btnSizePx, C.btnRadiusPx)
      .fill({ color: WORLD_HUD.navBar.btnBg, alpha: WORLD_HUD.navBar.btnBgAlpha }).stroke({ color: WORLD_HUD.navBar.btnStroke, width: 1, alpha: WORLD_HUD.navBar.btnStrokeAlpha });
    this._xLabel.position.set(xCx, xCy);
    const colY = top + C.headerPx;
    const colW = (C.widthPx - C.padPx * 2 - C.levelColWidthPx) / Math.max(1, this._colHeaders.length - 1);
    this._colHeaders[0].position.set(left, colY);
    for (let i = 1; i < this._colHeaders.length; i++) this._colHeaders[i].position.set(left + C.levelColWidthPx + (i - 1) * colW, colY);
    const listY = colY + C.colHeaderPx + 6;
    this._listLocalX = left; this._listLocalY = listY;
    // bottom edge of the card (local coords) is `top + h` (top is negative,
    // the card is centred on its own local origin) — the list's real
    // available height runs from listY down to THAT, not to `h * HALF`
    // (half the card height), which is what was actually here before: it
    // left ~2/3 of a tall card as dead space below only 2-3 visible rows,
    // forcing a scroll for content that had plenty of room to just show.
    this._listRect = { x: this._w * HALF + left, y: this._h * HALF + listY, w: C.widthPx - C.padPx * 2, h: h - (listY - top) - C.padPx };
    this._listMask.clear().rect(left, listY, C.widthPx - C.padPx * 2, this._listRect.h).fill(0xffffff);
    this._layoutRows(colW);
    this._rect = { x: this._w * HALF - C.widthPx * HALF, y: this._h * HALF + top, w: C.widthPx, h };
    this._scroll.setBounds(Math.min(0, this._listRect.h - this._rows.length * C.rowH));
    this._listInner.position.set(this._listLocalX, this._listLocalY + this._scroll.y);
  }

  /** @private rows are children of `_listInner`, so these are LOCAL coords (0..listRect.w) @param {number} colW */
  _layoutRows(colW) {
    for (let i = 0; i < this._rows.length; i++) {
      const r = this._rows[i], lvl = i + 1, y = i * C.rowH, cy = y + C.rowH * HALF;
      const current = lvl === this._currentLevel;
      r.bg.clear().roundRect(0, y, this._listRect.w, C.rowH - 2, C.rowRadiusPx)
        .fill({ color: current ? C.currentBg : C.rowBg, alpha: current ? C.currentBgAlpha : C.rowBgAlpha });
      if (current) r.bg.roundRect(0, y, this._listRect.w, C.rowH - 2, C.rowRadiusPx).stroke({ color: C.currentStroke, width: 1.5 });
      r.level.position.set(0, cy - C.valuePx * HALF);
      r.level.style.fill = current ? C.currentStroke : C.valueColor;
      for (let c = 0; c < r.values.length; c++) {
        r.values[c].position.set(C.levelColWidthPx + c * colW, cy - C.valuePx * HALF);
        r.values[c].style.fill = current ? C.valueColor : C.dimValueColor;
      }
    }
  }
}

/** @param {{x:number,y:number,w:number,h:number}} r @param {number} sx @param {number} sy @returns {boolean} */
function within(r, sx, sy) { return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h; }

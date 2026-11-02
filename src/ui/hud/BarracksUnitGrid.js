/**
 * BarracksUnitGrid — "UNIT SELECTION": the player's real "Units" inventory
 * (`BASE.army.roster`) as the SAME square icon-card grid the Units nav-tab
 * screen renders (`UnitCard`, `WORLD_HUD.unitsMenu`'s own column/size math,
 * `UnitsMenu._reflowGrid`'s own algorithm) — the reference screenshot's own
 * card-grid look, not a bespoke row style. Also owns the compact stats
 * panel (`BarracksUnitStats` — medallion Firepower/HP + every remaining
 * real stat 2-per-row) for whichever card is highlighted, inserted as a
 * gap directly BELOW that card's own row, pushing every row after it down
 * (the player's own call: stats must "appear right below selected troops",
 * splitting the grid from the rest — not sit after the whole grid).
 * Pure layout + hit-test; no scrolling of its own — `BarracksDetailScreen`
 * scrolls this whole column, same as `TroopDetailScreen`'s mid area.
 */
import { Container, Graphics } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BASE } from '../../config/BaseConfig.js';
import { ALL_UNITS } from '../../config/UnitStats.js';
import { BARRACKS_DETAIL as C } from '../../config/BuildingScreenConfig.js';
import { troopLevel } from '../../worldmap/troopLevels.js';
import { UnitCard } from './UnitCard.js';
import { BarracksUnitStats } from './BarracksUnitStats.js';
import { loadFactionTextures } from './SquadBarFactionBg.js';

/** @returns {{key:string,unit:object,deployed:boolean}[]} the player's real owned roster, de-duplicated by unit key */
function rosterEntries() {
  const seen = new Set(), out = [];
  BASE.army.roster.forEach((key, i) => {
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ key, unit: ALL_UNITS[key], deployed: i < BASE.army.deploySlots });
  });
  return out;
}

export class BarracksUnitGrid {
  constructor() {
    this.view = new Container();
    this._ring = new Graphics();
    this._entries = rosterEntries();
    this._cards = this._entries.map((e) => new UnitCard(e));
    this._stats = new BarracksUnitStats();
    this.view.addChild(...this._cards.map((c) => c.view), this._ring, this._stats.view);
    this._highlightKey = null;
    loadFactionTextures()
      .then((tex) => { for (const c of this._cards) if (tex[c.faction]) c.setFactionBg(tex[c.faction]); })
      .catch(() => {});
  }

  /** @returns {void} */
  destroy() { for (const c of this._cards) c.markDestroyed(); }

  /** @param {?string} key the roster key to gold-ring + show stats for, or null @returns {void} */
  setHighlight(key) { this._highlightKey = key; }

  /** @param {?string} key @returns {?{key:string,unit:object,deployed:boolean}} the owned roster entry for this key, if any */
  entryFor(key) { return this._entries.find((e) => e.key === key) ?? null; }

  /**
   * Two-pass: measure the stats panel's own height at a throwaway y=0 first
   * (depends only on the highlighted unit's stat count, never on where
   * it's drawn), THEN place every card with that height reserved as a gap
   * below the highlighted row, THEN redraw the stats panel at its real,
   * now-known y.
   * @param {number} x @param {number} y top-left @param {number} w available width
   * @returns {number} total content height, px
   */
  layout(x, y, w) {
    this.view.position.set(x, y);
    const preview = this.entryFor(this._highlightKey);
    this._stats.view.visible = Boolean(preview);
    let gapH = 0;
    if (preview) {
      this._stats.setUnit(preview.unit, troopLevel(preview.key));
      gapH = this._stats.layout(0, 0, w) + C.grid.gapBelowPx * 2;
    }
    const { totalHeight, statsY } = this._layoutCards(w, gapH);
    if (preview) this._stats.layout(0, statsY + C.grid.gapBelowPx, w);
    return totalHeight;
  }

  /** @param {number} lx @param {number} ly LOCAL to this.view's own (x,y) origin @returns {?{key:string,unit:object,deployed:boolean}} the tapped card's entry, if any */
  entryAt(lx, ly) {
    for (const c of this._cards) {
      const r = c.gridRect;
      if (r && lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) return c.entry;
    }
    return null;
  }

  /** @private places every card, reserving `gapH` below the highlighted row — uses `C.grid`'s own SMALLER min/max width, not `WORLD_HUD.unitsMenu`'s shared ones (the player's own "too bulky" correction) @param {number} w @param {number} gapH @returns {{totalHeight:number, statsY:number}} */
  _layoutCards(w, gapH) {
    const m = WORLD_HUD.unitsMenu, g = C.grid;
    let cols = Math.max(m.minCols, Math.floor((w + m.cardGapPx) / (g.cardMinWidthPx + m.cardGapPx)));
    let cardW = (w - m.cardGapPx * (cols - 1)) / cols;
    if (cardW > g.cardMaxWidthPx) {
      cols = Math.ceil((w + m.cardGapPx) / (g.cardMaxWidthPx + m.cardGapPx));
      cardW = (w - m.cardGapPx * (cols - 1)) / cols;
    }
    const rowH = cardW + m.nameHeightPx;
    const hlIndex = this._cards.findIndex((c) => c.entry.key === this._highlightKey);
    const hlRow = hlIndex >= 0 ? Math.floor(hlIndex / cols) : -1;
    const gap = hlRow >= 0 ? gapH : 0;
    this._ring.clear();
    let statsY = 0;
    this._cards.forEach((card, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      card.resize(cardW);
      const cy = row * (rowH + m.cardGapPx) + (hlRow >= 0 && row > hlRow ? gap : 0);
      const rect = { x: col * (cardW + m.cardGapPx), y: cy, w: cardW, h: cardW };
      card.view.position.set(rect.x, rect.y);
      card.gridRect = { ...rect, h: rowH };
      if (i === hlIndex) {
        this._ring.roundRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4, 8)
          .stroke({ color: C.grid.highlightStroke, width: C.grid.highlightWidthPx });
        statsY = cy + rowH;
      }
    });
    const rows = Math.ceil(this._cards.length / cols);
    const totalHeight = (rows > 0 ? rows * rowH + (rows - 1) * m.cardGapPx : 0) + gap;
    return { totalHeight, statsY };
  }
}

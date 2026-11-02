/**
 * BarracksUnitStats — the compact stats block `BarracksUnitGrid` reveals
 * directly below a selected card's own row. Deliberately TIGHTER than
 * `TroopUpgradeContent` (the Troop Detail screen's own full stat panel,
 * built for a dedicated full screen with room to spare): this is an INLINE
 * reveal inside a scrolling card grid, and a full copy of that panel's
 * class-tag/star-row/"LEVEL N/CAP" header plus a single-column stat list
 * read as "way too much space"/"big gaps" (the player's own report) — that
 * header is redundant here anyway (the unit's name/stars already show on
 * its own grid card, its level in the hero's own badge). Keeps only the
 * real content that ISN'T shown elsewhere: the Firepower/HP medallions
 * (`StatMedallion`, same real glyphs/ring style as Troop Detail, for visual
 * consistency) and every remaining real stat — packed 2-PER-ROW (the
 * player's own explicit ask: "split it in half... 2 sections") instead of
 * Troop Detail's 1-per-row list, so the whole block is a fraction of that
 * screen's own height.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BARRACKS_DETAIL as C } from '../../config/BuildingScreenConfig.js';
import { LEVEL, levelMultiplier } from '../../config/StarTiers.js';
import { StatMedallion } from './StatMedallion.js';
import { drawStatIcon } from './StatIconDraw.js';

const HALF = 0.5;
const PCT_SCALE = 100;
const PCT = (v) => `${Math.round(v * PCT_SCALE)}%`;
const PER_SEC = (v) => `${v}/s`;
const ARMOR = (v) => v.join('/');

const STAT_DEFS = [
  { key: 'def', label: 'Defense' }, { key: 'armor', label: 'Armor', fmt: ARMOR },
  { key: 'pen', label: 'Penetration' }, { key: 'rof', label: 'Rate of Fire', fmt: PER_SEC },
  { key: 'rng', label: 'Range' }, { key: 'spd', label: 'Speed' },
  { key: 'acc', label: 'Accuracy', fmt: PCT }, { key: 'dodge', label: 'Dodge', fmt: PCT },
  { key: 'aoe', label: 'AoE Radius' }, { key: 'cost', label: 'Cost' },
];

/** @param {number} v @returns {string} "1.2k" style compact number for the medallions */
function formatK(v) { return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)); }

export class BarracksUnitStats {
  constructor() {
    this.view = new Container();
    const g = C.statGrid;
    this._firepower = new StatMedallion('dmg', 'Firepower', g.firepowerColor);
    this._hp = new StatMedallion('hp', 'HP', g.hpColor);
    this.view.addChild(this._firepower.view, this._hp.view);
    /** @private @type {{icon:Graphics,label:Text,value:Text}[]} */
    this._cells = [];
  }

  /** @returns {void} */
  destroy() { for (const c of this._cells) { c.icon.destroy(); c.label.destroy(); c.value.destroy(); } this._cells = []; }

  /** @param {object} unitRow an ALL_UNITS[key] row @param {number} level @returns {void} */
  setUnit(unitRow, level) {
    this.destroy();
    const fam = WORLD_HUD.fontFamily, g = C.statGrid;
    const mult = levelMultiplier(level);
    this._fp = unitRow.dmg * mult; this._hpVal = unitRow.hp * mult;
    for (const def of STAT_DEFS) {
      let v = unitRow[def.key];
      if (v === undefined) continue;
      if (LEVEL.boostedStats.includes(def.key)) v = Array.isArray(v) ? v.map((n) => Math.round(n * mult)) : Math.round(v * mult);
      const icon = new Graphics();
      const label = new Text({ text: def.label, style: new TextStyle({ fontFamily: fam, fontSize: g.labelPx, fill: WORLD_HUD.dimColor }) });
      const value = new Text({ text: def.fmt ? def.fmt(v) : String(v), style: new TextStyle({ fontFamily: fam, fontSize: g.valuePx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
      value.anchor.set(1, 0);
      this._cells.push({ icon, label, value, key: def.key });
      this.view.addChild(icon, label, value);
    }
  }

  /** @param {number} x @param {number} y top-left @param {number} w @returns {number} total height used, px */
  layout(x, y, w) {
    const g = C.statGrid, md = WORLD_HUD.troopDetail; // medallion geometry stays with StatMedallion's own values — it reads them internally, never from a param
    this.view.position.set(x, y);
    const r = md.medallionRadiusPx, pairW = r * 4 + md.medallionGapPx, c0 = (w - pairW) * HALF + r;
    this._firepower.layout(c0, r, formatK(this._fp ?? 0));
    this._hp.layout(c0 + r * 2 + md.medallionGapPx, r, formatK(this._hpVal ?? 0));
    let cy = r * 2 + md.medallionLabelPx + g.padYPx;
    const colW = (w - g.colGapPx) * HALF;
    this._cells.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i * HALF);
      const cx0 = col * (colW + g.colGapPx), rowCy = cy + row * g.rowHeightPx + g.rowHeightPx * HALF;
      c.icon.clear();
      drawStatIcon(c.icon, c.key, { x: cx0 + g.iconR, y: rowCy }, g.iconR, WORLD_HUD.dimColor);
      c.label.position.set(cx0 + g.iconR * 2 + 6, rowCy - g.labelPx * HALF);
      c.value.position.set(cx0 + colW, rowCy - g.valuePx * HALF);
    });
    const rows = Math.ceil(this._cells.length * HALF);
    return cy + rows * g.rowHeightPx;
  }
}

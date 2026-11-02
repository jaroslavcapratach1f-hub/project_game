/**
 * TroopStatsList — every remaining troop statistic (hp/dmg are promoted to
 * `StatMedallion`'s own big circular readouts instead) as a PLAIN row: a
 * small line-glyph icon (`StatIconDraw`) + label on the left, the value
 * right-aligned, a hairline divider between rows — no chip background, no
 * coloured accent bar. The S66 pass's coloured-chip treatment was the
 * player's own explicit rejection ("adding small parts with different
 * colours does not add visuality at all"); this instead matches the
 * reference screenshot's own clean attribute-list style. `level` (from
 * `troopLevels.js`, the UPGRADE button's own state) scales
 * `LEVEL.boostedStats` by the SAME `levelMultiplier()` the real
 * level-growth model already defines, so pressing UPGRADE visibly moves
 * the numbers here even though no live-combat stat resolution reads it.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { LEVEL, levelMultiplier } from '../../config/StarTiers.js';
import { drawStatIcon } from './StatIconDraw.js';

const HALF = 0.5;
const ICON_LABEL_GAP_PX = 10;

const PCT_SCALE = 100;
const PCT = (v) => `${Math.round(v * PCT_SCALE)}%`;
const PER_SEC = (v) => `${v}/s`;
const ARMOR = (v) => v.join(' / ');

/** Display order + label + optional formatter. hp/dmg live in `StatMedallion` instead. */
const STAT_DEFS = [
  { key: 'def', label: 'Defense' },
  { key: 'armor', label: 'Armor (F/S/R)', fmt: ARMOR },
  { key: 'pen', label: 'Penetration' },
  { key: 'rof', label: 'Rate of Fire', fmt: PER_SEC },
  { key: 'rng', label: 'Range' },
  { key: 'spd', label: 'Speed' },
  { key: 'acc', label: 'Accuracy', fmt: PCT },
  { key: 'dodge', label: 'Dodge', fmt: PCT },
  { key: 'aoe', label: 'AoE Radius' },
  { key: 'cost', label: 'Cost' },
];

export class TroopStatsList {
  constructor() {
    this.view = new Container();
    /** @private @type {{icon:import('pixi.js').Graphics,label:import('pixi.js').Text,value:import('pixi.js').Text,rule:import('pixi.js').Graphics,key:string}[]} */
    this._rows = [];
  }

  /** @param {object} unitRow an ALL_UNITS[key] row @param {number} [level=1] @returns {void} rebuild every stat row from scratch */
  setUnit(unitRow, level = 1) {
    for (const r of this._rows) { r.icon.destroy(); r.label.destroy(); r.value.destroy(); r.rule.destroy(); }
    this._rows = [];
    const fam = WORLD_HUD.fontFamily, m = WORLD_HUD.troopDetail;
    const mult = levelMultiplier(level);
    for (const def of STAT_DEFS) {
      let v = unitRow[def.key];
      if (v === undefined) continue;
      if (LEVEL.boostedStats.includes(def.key)) v = Array.isArray(v) ? v.map((n) => Math.round(n * mult)) : Math.round(v * mult);
      const icon = new Graphics();
      const rule = new Graphics();
      const label = new Text({ text: def.label, style: new TextStyle({ fontFamily: fam, fontSize: m.statLabelPx, fill: WORLD_HUD.dimColor }) });
      const value = new Text({ text: def.fmt ? def.fmt(v) : String(v), style: new TextStyle({ fontFamily: fam, fontSize: m.statValuePx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
      value.anchor.set(1, 0);
      this._rows.push({ icon, label, value, rule, key: def.key });
      this.view.addChild(icon, rule, label, value);
    }
  }

  /** @param {number} w row width (value right-aligns to this) @returns {number} total height used, px */
  layout(w) {
    const m = WORLD_HUD.troopDetail;
    const iconCx = m.statIconR, textX = m.statIconR * 2 + ICON_LABEL_GAP_PX;
    let y = 0;
    for (const r of this._rows) {
      const cy = y + m.statRowH * HALF;
      r.icon.clear();
      drawStatIcon(r.icon, r.key, { x: iconCx, y: cy }, m.statIconR, WORLD_HUD.dimColor);
      r.label.position.set(textX, cy - m.statLabelPx * HALF);
      r.value.position.set(w, cy - m.statValuePx * HALF);
      r.rule.clear().rect(0, y + m.statRowH, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: m.statDividerAlpha });
      y += m.statRowH;
    }
    return this._rows.length > 0 ? y - 1 : 0; // drop the last row's own trailing rule from the total
  }
}

/**
 * StatMedallion — a big circular "headline stat" readout (the reference
 * upgrade screen's own Firepower/HP treatment: a ringed icon circle with a
 * bold number and label under it), replacing the rejected small coloured
 * chip rows for the unit's two most important stats. Pure view + layout.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { drawStatIcon } from './StatIconDraw.js';

const HALF = 0.5;

export class StatMedallion {
  /** @param {string} statKey `StatIconDraw` key (e.g. 'dmg', 'hp') @param {string} label @param {number} ringColor */
  constructor(statKey, label, ringColor) {
    this._statKey = statKey;
    this._ringColor = ringColor;
    this.view = new Container();
    this._ring = new Graphics();
    const fam = WORLD_HUD.fontFamily, m = WORLD_HUD.troopDetail;
    this._value = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.medallionValuePx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
    this._label = new Text({ text: label, style: new TextStyle({ fontFamily: fam, fontSize: m.medallionLabelPx, fill: WORLD_HUD.dimColor }) });
    this._value.anchor.set(HALF); this._label.anchor.set(HALF);
    this.view.addChild(this._ring, this._value, this._label);
  }

  /** @param {number} cx @param {number} cy centre of the ring circle @param {string} valueText @returns {void} */
  layout(cx, cy, valueText) {
    const m = WORLD_HUD.troopDetail, r = m.medallionRadiusPx;
    this._ring.clear().circle(cx, cy, r).stroke({ color: 0x33342a, width: m.medallionRingWidthPx });
    this._ring.circle(cx, cy, r).stroke({ color: this._ringColor, width: m.medallionRingWidthPx, alpha: 0.9 });
    drawStatIcon(this._ring, this._statKey, { x: cx, y: cy - r * 0.32 }, r * 0.28, this._ringColor);
    this._value.text = valueText;
    this._value.position.set(cx, cy + r * 0.18);
    this._label.position.set(cx, cy + r + m.medallionLabelPx * HALF + 4);
  }
}

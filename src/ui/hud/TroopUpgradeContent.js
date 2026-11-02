/** Scrollable unit statistics; the fixed action belongs to TroopUpgradeDock. */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, unitLabel } from '../../config/HudConfig.js';
import { levelMultiplier } from '../../config/StarTiers.js';
import { StarRow } from './StarRow.js';
import { StatMedallion } from './StatMedallion.js';
import { TroopStatsList } from './TroopStatsList.js';

const HALF = 0.5;

export class TroopUpgradeContent {
  constructor() {
    this.view = new Container();
    const fam = WORLD_HUD.fontFamily, m = WORLD_HUD.troopDetail;
    this._classTagBg = new Graphics();
    this._classTagLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.classTagPx, fill: WORLD_HUD.textColor }) });
    this._stars = new StarRow({ sizePx: m.starPx, gapPx: m.starGapPx, max: 5, filledColor: WORLD_HUD.accentColor, emptyColor: 0x5a5b52 });
    this._starPlus = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.starPx * 2, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._divider1 = new Graphics(); this._divider2 = new Graphics();
    this._levelText = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.levelPx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
    this._firepower = new StatMedallion('dmg', 'Firepower', m.medallionColorFirepower);
    this._hp = new StatMedallion('hp', 'HP', m.medallionColorHp);
    this._stats = new TroopStatsList();
    this.view.addChild(this._classTagBg, this._classTagLabel, this._stars.view, this._starPlus,
      this._divider1, this._levelText, this._divider2, this._firepower.view, this._hp.view,
      this._stats.view);
  }

  /** @param {{unit:object}} entry @param {number} level @returns {void} */
  setUnit(entry, level) {
    this._classTagLabel.text = unitLabel(entry.unit.cls, null).toUpperCase();
    const star = entry.unit.star;
    this._stars.setFilled(Math.max(0, Math.min(5, Math.floor(star))));
    this._starPlus.text = star % 1 !== 0 ? '+' : '';
    this._stats.setUnit(entry.unit, level);
    const mult = levelMultiplier(level); // dmg/hp are both LEVEL.boostedStats — match the plain rows' own scaling
    this._firepowerValue = entry.unit.dmg * mult; this._hpValue = entry.unit.hp * mult;
  }

  /** @param {{x:number,y:number,w:number}} rect @param {{level:number,cap:number}} progress @returns {number} total height used, px */
  layout(rect, progress) {
    const { x, w } = rect;
    const m = WORLD_HUD.troopDetail;
    let y = rect.y;
    const tagW = this._classTagLabel.width + m.classTagPadXPx * 2;
    this._classTagBg.clear().roundRect(x, y, tagW, m.classTagPx + m.classTagPadYPx * 2, m.classTagRadiusPx).fill({ color: m.classTagBg, alpha: m.classTagBgAlpha });
    this._classTagLabel.position.set(x + m.classTagPadXPx, y + m.classTagPadYPx);
    y += m.classTagPx + m.classTagPadYPx * 2 + m.contentGapPx * HALF;
    this._stars.view.position.set(x, y);
    this._starPlus.position.set(x + this._stars.width + 3, y - m.starPx * HALF);
    y += m.starPx * 2 + m.contentGapPx;
    this._divider1.clear().rect(x, y, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: m.dividerAlpha });
    y += m.contentGapPx;
    this._levelText.text = `LEVEL ${progress.level}/${progress.cap}`;
    this._levelText.position.set(x, y);
    y += m.levelPx + m.contentGapPx;
    this._divider2.clear().rect(x, y, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: m.dividerAlpha });
    y += m.contentGapPx + m.medallionRadiusPx;
    const pairW = m.medallionRadiusPx * 4 + m.medallionGapPx;
    const c0 = x + (w - pairW) * HALF + m.medallionRadiusPx;
    this._firepower.layout(c0, y, formatK(this._firepowerValue));
    this._hp.layout(c0 + m.medallionRadiusPx * 2 + m.medallionGapPx, y, formatK(this._hpValue));
    y += m.medallionRadiusPx + m.medallionLabelPx + m.contentGapPx * 2;
    this._stats.view.position.set(x, y);
    y += this._stats.layout(w) + m.contentGapPx;
    return y - rect.y;
  }
}

/** @param {number} v @returns {string} "1.2k" style compact number for the two medallions */
function formatK(v) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v));
}

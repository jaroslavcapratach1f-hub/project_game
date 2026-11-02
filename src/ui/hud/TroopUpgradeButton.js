/** Fixed upgrade action, separate from the navigation tab. */
import { Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';

const HALF = 0.5;
const STROKE_PX = 2;
const SHEEN_ALPHA = 0.12;

export class TroopUpgradeButton {
  constructor() {
    this.bg = new Graphics();
    this.sheen = new Graphics();
    this.caption = new Text({ text: '', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: WORLD_HUD.troopDetail.upgradeCaptionPx, fill: WORLD_HUD.dimColor }) });
    this.caption.anchor.set(HALF, 0);
    const m = WORLD_HUD.troopDetail;
    this.label = new Text({ text: m.upgradeLabel, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: m.upgradeLabelPx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this.label.anchor.set(HALF);
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @param {number} x @param {number} y @param {number} w @param {boolean} atMax @param {number} nextLevel @returns {void} */
  layout(x, y, w, atMax, nextLevel) {
    const m = WORLD_HUD.troopDetail, p = WORLD_HUD.buildingPanel;
    this.caption.text = atMax ? '' : `${m.upgradeCaptionPrefix}${nextLevel}`;
    this.caption.position.set(x + w * HALF, y);
    const btnY = y + (atMax ? 0 : m.upgradeCaptionPx + 4);
    this._rect = { x, y: btnY, w, h: m.upgradeHeightPx };
    this.bg.clear().roundRect(x, btnY, w, m.upgradeHeightPx, m.upgradeRadiusPx)
      .fill({ color: atMax ? p.maxColor : m.upgradeColor, alpha: atMax ? m.upgradeDisabledAlpha : 1 })
      .stroke({ color: atMax ? p.maxColor : m.upgradeStroke, width: STROKE_PX });
    this.sheen.clear();
    if (!atMax) {
      const h = m.upgradeHeightPx;
      this.sheen.roundRect(x + STROKE_PX, btnY + STROKE_PX, w - STROKE_PX * 2, h * HALF - STROKE_PX, m.upgradeRadiusPx)
        .fill({ color: 0xffffff, alpha: SHEEN_ALPHA });
    }
    this.label.text = atMax ? p.maxLabel : m.upgradeLabel;
    this.label.style.fill = atMax ? p.maxColor : WORLD_HUD.accentColor;
    this.label.position.set(x + w * HALF, btnY + m.upgradeHeightPx * HALF);
  }

  /** @returns {number} total height this component occupies once laid out (caption + gap + button) */
  get height() {
    const m = WORLD_HUD.troopDetail;
    return this.caption.text ? m.upgradeCaptionPx + 4 + m.upgradeHeightPx : m.upgradeHeightPx;
  }

  /** @param {number} sx @param {number} sy local coords (caller offsets for scroll) @returns {boolean} */
  hit(sx, sy) {
    const r = this._rect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }
}

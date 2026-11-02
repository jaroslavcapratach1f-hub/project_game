/**
 * ProductionMaterialDetail — the selected material's name, description,
 * base-vs-current craft duration (base = Factory level 1, current = this
 * Factory's real live level — `materialCraftSeconds`, never fabricated),
 * and the PRODUCE button that enqueues it.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { PRODUCTION_SCREEN as S } from '../../config/ProductionScreenConfig.js';
import { MATERIALS, MATERIAL_DESCRIPTIONS, materialCraftSeconds } from '../../config/MaterialsConfig.js';
import { fmtDuration } from './ProductionQueuePanel.js';

const HALF = 0.5;

export class ProductionMaterialDetail {
  constructor() {
    this.view = new Container();
    const fam = WORLD_HUD.fontFamily, d = S.detail;
    this._name = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: d.namePx, fill: d.nameColor, fontWeight: 'bold' }) });
    this._desc = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: d.descPx, fill: d.descColor, wordWrap: true, lineHeight: d.descLineHeightPx }) });
    this._baseTime = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: d.timePx, fill: d.baseTimeColor }) });
    this._currentTime = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: d.timePx, fill: d.currentTimeColor, fontWeight: 'bold' }) });
    this._strike = new Graphics();
    this._btnBg = new Graphics();
    this._btnLabel = new Text({ text: d.btnLabel, style: new TextStyle({ fontFamily: fam, fontSize: d.btnLabelPx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._btnLabel.anchor.set(HALF);
    this.view.addChild(this._name, this._desc, this._baseTime, this._strike, this._currentTime, this._btnBg, this._btnLabel);
    this._btnRect = { x: 0, y: 0, w: 0, h: 0 };
    this._canProduce = false;
  }

  /** @param {string} materialKey @param {number} engineeringLevel @param {boolean} queueFull @returns {void} */
  setMaterial(materialKey, engineeringLevel, queueFull) {
    const m = MATERIALS[materialKey];
    this._name.text = m.name;
    this._desc.text = MATERIAL_DESCRIPTIONS[materialKey] ?? '';
    this._baseTime.text = fmtDuration(materialCraftSeconds(materialKey, 1) * 1000);
    this._currentTime.text = fmtDuration(materialCraftSeconds(materialKey, engineeringLevel) * 1000);
    this._canProduce = !queueFull;
    this._reflow();
  }

  /** @param {number} absX @param {number} absY @param {number} w @returns {number} bottom Y */
  layout(absX, absY, w) {
    this._x = absX; this._y = absY; this._w = w;
    this._reflow();
    return absY + this._height;
  }

  /** @param {number} sx @param {number} sy @returns {boolean} PRODUCE was tapped (and is currently allowed) */
  hitTest(sx, sy) {
    const r = this._btnRect;
    return this._canProduce && sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }

  /** @private */
  _reflow() {
    if (this._x === undefined) return;
    const d = S.detail;
    let y = this._y;
    this._name.position.set(this._x, y); y += this._name.height + 4;
    this._desc.style.wordWrapWidth = this._w;
    this._desc.position.set(this._x, y); y += this._desc.height + d.descGapPx;
    this._baseTime.position.set(this._x, y);
    this._strike.clear().rect(this._x - 1, y + this._baseTime.height * HALF, this._baseTime.width + 2, 1.5).fill(d.baseTimeColor);
    this._currentTime.position.set(this._x + this._baseTime.width + d.timeGapPx, y);
    y += this._baseTime.height + 10;
    this._btnRect = { x: this._x, y, w: this._w, h: d.btnHeightPx };
    this._btnBg.clear().roundRect(this._x, y, this._w, d.btnHeightPx, d.btnRadiusPx)
      .fill({ color: d.btnColor, alpha: this._canProduce ? 1 : d.btnDisabledAlpha }).stroke({ color: d.btnStroke, width: 1.5, alpha: this._canProduce ? 1 : d.btnDisabledAlpha });
    this._btnLabel.position.set(this._x + this._w * HALF, y + d.btnHeightPx * HALF);
    this._btnLabel.alpha = this._canProduce ? 1 : d.btnDisabledAlpha;
    this._height = y + d.btnHeightPx - this._y;
  }
}

/**
 * BarracksOfficerSlots — two stacked officer cards (reference: "Captain" /
 * "Aide"), right column beside the hero. A two-tone header bar (brass /
 * steel, the reference's own two colours) over an empty body — no officer
 * roster/portraits/skills exist anywhere in this codebase yet
 * (`OfficerConfig.js` has real bonus math, zero actual officer instances),
 * so the body stays a bare "+" placeholder (the player's own earlier call)
 * while the CARD's own header-bar shape matches the reference exactly.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BARRACKS_DETAIL as C } from '../../config/BuildingScreenConfig.js';
import { drawOfficerPlus } from './ArmyIconDraw.js';

export class BarracksOfficerSlots {
  constructor() {
    this.view = new Container();
    const o = C.officer, fam = WORLD_HUD.fontFamily;
    this._bg = [new Graphics(), new Graphics()];
    this._headerBg = [new Graphics(), new Graphics()];
    this._glyph = [new Graphics(), new Graphics()];
    this._label = [o.primaryLabel, o.secondaryLabel].map((text) =>
      new Text({ text, style: new TextStyle({ fontFamily: fam, fontSize: o.headerLabelPx, fill: o.headerLabelColor, fontWeight: 'bold' }) }));
    this.view.addChild(
      this._bg[0], this._headerBg[0], this._label[0], this._glyph[0],
      this._bg[1], this._headerBg[1], this._label[1], this._glyph[1],
    );
  }

  /**
   * @param {number} x @param {number} y top-left @param {number} w @param {number} totalH
   * @param {boolean} [horizontal=false] side-by-side ("Captain | Aide", the reference's own landscape row) instead of stacked (the reference's own portrait column)
   * @returns {void}
   */
  layout(x, y, w, totalH, horizontal = false) {
    const o = C.officer;
    this.view.position.set(x, y);
    const cardW = horizontal ? (w - o.gapPx) * 0.5 : w;
    const cardH = Math.min(o.cardCapPx, horizontal ? totalH : (totalH - o.gapPx) * 0.5);
    const colors = [o.primaryColor, o.secondaryColor];
    for (let i = 0; i < 2; i++) {
      const cx = horizontal ? i * (cardW + o.gapPx) : 0;
      const cy = horizontal ? 0 : i * (cardH + o.gapPx);
      this._bg[i].clear().roundRect(cx, cy, cardW, cardH, o.radiusPx)
        .fill({ color: o.bg, alpha: o.bgAlpha }).stroke({ color: o.stroke, width: 1, alpha: o.strokeAlpha });
      this._headerBg[i].clear().roundRect(cx, cy, cardW, o.headerHPx, o.radiusPx).fill(colors[i]);
      this._headerBg[i].rect(cx, cy + o.headerHPx - o.radiusPx, cardW, o.radiusPx).fill(colors[i]);
      this._label[i].position.set(cx + 8, cy + (o.headerHPx - o.headerLabelPx) * 0.5);
      this._glyph[i].clear();
      drawOfficerPlus(this._glyph[i], { x: cx + cardW * 0.5, y: cy + o.headerHPx + (cardH - o.headerHPx) * 0.5 }, o.plusPx, o.plusColor);
    }
  }
}

/**
 * ArmyBarrackRow — one of `ArmyMenu`'s 5 barrack sections. The troop tile
 * itself is `ArmyBarrackTile` (locked number+padlock, or the actual troop's
 * own render); this file lays out what surrounds it: 2 officer slots on
 * EVERY row (built ones show an empty "+" assign slot, locked ones show a
 * padlock in the same slot — the player's own correction), a small
 * "trained/capacity" badge in the row's own top-right corner (no label
 * text), and — built rows only — a TRAIN button centred in the gap between
 * the officer slots and the row's own edge, sized off that gap rather than
 * stretched or fixed-tiny (the player's own corrections). Pure view +
 * layout + hit-test; `ArmyMenu` owns the data and what a TRAIN press does.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { ARMY_MENU } from '../../config/ArmyMenuConfig.js';
import { ArmyBarrackTile } from './ArmyBarrackTile.js';
import { drawLockIcon, drawOfficerPlus } from './ArmyIconDraw.js';

const HALF = 0.5;

export class ArmyBarrackRow {
  /** @param {number} number this section's 1-based barracks number */
  constructor(number) {
    this._state = { built: false, cls: null, trained: 0, capacity: 0, canTrain: false };
    this._trainRect = { x: 0, y: 0, w: 0, h: 0 };
    this.view = new Container();
    const fam = WORLD_HUD.fontFamily, m = ARMY_MENU;
    this._bg = new Graphics();
    this._tile = new ArmyBarrackTile(number);
    this._officers = new Graphics();
    this._badgeBg = new Graphics();
    this._badge = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.badgePx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
    this._badge.anchor.set(1, 0);
    this._trainBg = new Graphics();
    this._trainLabel = new Text({ text: m.trainLabel, style: new TextStyle({ fontFamily: fam, fontSize: m.trainLabelPx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._trainLabel.anchor.set(HALF);
    this.view.addChild(this._bg, this._tile.view, this._officers,
      this._trainBg, this._trainLabel, this._badgeBg, this._badge);
  }

  /**
   * @param {{built:boolean, cls?:string, trained?:number, capacity?:number, canTrain?:boolean}} s
   * @returns {void}
   */
  setState(s) {
    this._state = { built: Boolean(s.built), cls: s.cls ?? null,
      trained: s.trained ?? 0, capacity: s.capacity ?? 0, canTrain: Boolean(s.canTrain) };
    this._tile.setState(this._state.built, this._state.cls);
    this._badge.text = this._state.built ? `${this._state.trained}/${this._state.capacity}` : '';
    this._badge.style.fill = this._state.trained < this._state.capacity ? ARMY_MENU.reserveLowColor : WORLD_HUD.textColor;
  }

  /** @param {{x:number,y:number,w:number,h:number}} rect @returns {void} */
  layout(rect) {
    const m = ARMY_MENU, { x, y, w, h } = rect;
    const built = this._state.built;
    this._bg.clear().roundRect(x, y, w, h, m.rowRadiusPx)
      .fill({ color: m.rowBg, alpha: built ? m.rowBgAlpha : m.rowBgAlpha * m.lockedAlpha })
      .stroke({ color: m.rowStroke, width: m.rowStrokeWidthPx, alpha: built ? m.rowStrokeAlpha : m.rowStrokeAlpha * m.lockedAlpha });
    const pad = m.rowPadPx, innerH = h - pad * 2;
    const tileW = innerH * m.tileAspect;
    this._tile.layout(x + pad, y + pad, tileW, innerH);
    const officersX = x + pad + tileW + m.rowPadPx;
    const officersRight = this._layoutOfficers(officersX, y + h * HALF, innerH, built);
    this._badgeBg.visible = built; this._badge.visible = built;
    if (!built) { this._trainBg.visible = false; this._trainLabel.visible = false; return; }
    this._layoutBadge(x + w - m.badgeInsetPx, y + m.badgeInsetPx);
    // TRAIN centres in the gap between the officer slots and the row's own
    // right edge, on the SAME vertical centreline the officer slots use.
    this._layoutTrain(officersRight + pad, x + w - pad, y + h * HALF, innerH);
  }

  /** @param {number} sx @param {number} sy @returns {boolean} the TRAIN button is showing and holds this point */
  hitTrain(sx, sy) {
    if (!this._trainBg.visible) return false;
    const r = this._trainRect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }

  /** @returns {void} stop a late-resolving troop-art load from touching a torn-down row */
  markDestroyed() { this._tile.markDestroyed(); }

  /** @private 2 officer slots — "+" when built, a padlock when locked @returns {number} right edge x of the last slot */
  _layoutOfficers(x0, cy, innerH, built) {
    const m = ARMY_MENU, size = innerH * m.officerSizeFrac;
    this._officers.clear();
    for (let i = 0; i < m.officerCount; i++) {
      const bx = x0 + i * (size + m.officerGapPx), by = cy - size * HALF;
      this._officers.roundRect(bx, by, size, size, m.officerRadiusPx)
        .fill({ color: m.officerBg, alpha: m.officerBgAlpha })
        .stroke({ color: m.officerStroke, width: 1, alpha: m.officerStrokeAlpha });
      const pt = { x: bx + size * HALF, y: cy };
      if (built) drawOfficerPlus(this._officers, pt, m.officerPlusPx, m.officerPlusColor);
      else drawLockIcon(this._officers, pt, size * 0.5, m.officerLockColor);
    }
    return x0 + m.officerCount * size + (m.officerCount - 1) * m.officerGapPx;
  }

  /**
   * @private TRAIN button, centred in the gap [gapX0, gapX1] AND on `cy` —
   * the SAME vertical centreline the officer slots use, so it reads as
   * centred in the row, not just in some leftover band. Sized off the gap
   * rather than fixed, clamped to stay readable at either extreme.
   */
  _layoutTrain(gapX0, gapX1, cy, innerH) {
    const m = ARMY_MENU;
    const w = Math.max(m.trainMinWidthPx, Math.min(m.trainMaxWidthPx, (gapX1 - gapX0) * m.trainWidthFrac));
    const h = Math.max(m.trainMinHeightPx, Math.min(m.trainMaxHeightPx, innerH));
    const x0 = gapX0 + (gapX1 - gapX0 - w) * HALF, y0 = cy - h * HALF;
    const atLimit = !this._state.canTrain;
    this._trainBg.visible = true; this._trainLabel.visible = true;
    this._trainRect = { x: x0, y: y0, w, h };
    this._trainBg.clear().roundRect(x0, y0, w, h, m.trainRadiusPx)
      .fill({ color: m.trainColor, alpha: atLimit ? m.trainDisabledAlpha : 1 })
      .stroke({ color: m.trainStroke, width: 1, alpha: atLimit ? m.trainDisabledAlpha : 1 });
    this._trainLabel.style.fill = atLimit ? WORLD_HUD.dimColor : WORLD_HUD.accentColor;
    this._trainLabel.position.set(x0 + w * HALF, cy);
  }

  /** @private the top-right "trained/capacity" corner chip @param {number} rightX @param {number} topY @returns {void} */
  _layoutBadge(rightX, topY) {
    const m = ARMY_MENU;
    const bw = this._badge.width + m.badgePadXPx * 2, bh = m.badgePx + m.badgePadYPx * 2;
    this._badgeBg.clear().roundRect(rightX - bw, topY, bw, bh, m.badgeRadiusPx).fill({ color: m.badgeBg, alpha: m.badgeBgAlpha });
    this._badge.position.set(rightX - m.badgePadXPx, topY + m.badgePadYPx);
  }
}

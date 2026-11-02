/**
 * ResearchHubView — the category hub, laid out two different ways
 * depending on device orientation (the player's own explicit correction:
 * the portrait column "looked a mess" stretched into landscape). Portrait:
 * the 1-big/2/1/2 hex column (Development hero -> Military + Doctrine pair
 * -> Defense single -> Support + "Coming Soon" pair). Landscape: a 2-row
 * honeycomb reading left-to-right (even index top row, odd index bottom
 * row, each bottom hex interlocking half a column left of its own column's
 * top hex) — the player's own landscape reference screenshot's exact
 * structure, which has no "hero" concept at all, just a flowing tessellated
 * grid. Pure layout + hit-test; `ResearchScreen` scrolls this whole view,
 * same role `BarracksUnitGrid` plays inside `BarracksDetailScreen`.
 */
import { Container } from 'pixi.js';
import { RESEARCH_HUB as C } from '../../config/ResearchScreenConfig.js';
import { HexCategoryButton } from './HexCategoryButton.js';

const HALF = 0.5;
const HEX_HALF_W = 0.866; // MENU_ICON.hex's own flat-side half-width factor

export class ResearchHubView {
  constructor() {
    this.view = new Container();
    this._buttons = C.categories.map((cat) => new HexCategoryButton(cat, C.radiusPx));
    this.view.addChild(...this._buttons.map((b) => b.view));
  }

  /** @returns {void} */
  destroy() { for (const b of this._buttons) b.destroy(); }

  /** @param {import('../../systems/ResearchManager.js').ResearchManager} research @returns {void} real per-track progress text */
  refresh(research) {
    for (const b of this._buttons) {
      if (b.isComingSoon) continue;
      const p = research.trackProgress(b.category);
      b.setProgress(`${p.ranksDone}/${p.ranksTotal} ranks`);
    }
  }

  /** @param {number} w available width @param {boolean} landscape @returns {number} total content height */
  layout(w, landscape) {
    return landscape ? this._layoutHoneycomb(w) : this._layoutColumn(w);
  }

  /** @param {number} lx @param {number} ly LOCAL to this.view's own (0,0) origin @returns {?string} the tapped track id, or null (incl. a tap on the inert placeholder) */
  tapAt(lx, ly) {
    for (const b of this._buttons) if (b.contains(lx, ly)) return b.category;
    return null;
  }

  /** @private portrait: 1-2-1-2 vertical column @param {number} w @returns {number} total content height */
  _layoutColumn(w) {
    const cx = w * HALF;
    let y = C.topGapPx;
    y = this._placeRow([this._buttons[0]], cx, y) + C.rowGapPx;
    y = this._placeRow([this._buttons[1], this._buttons[2]], cx, y) + C.rowGapPx;
    y = this._placeRow([this._buttons[3]], cx, y) + C.rowGapPx;
    y = this._placeRow([this._buttons[4], this._buttons[5]], cx, y) + C.bottomGapPx;
    return y;
  }

  /** @private places one row (1 or 2 same-radius hexes) centred on `cx`, top edge at `topY` @returns {number} the row's own bottom Y (bottom of its label/progress text) */
  _placeRow(buttons, cx, topY) {
    const r = buttons[0].radius, cy = topY + r;
    if (buttons.length === 1) {
      buttons[0].setPosition(cx, cy);
    } else {
      const dist = HEX_HALF_W * r * 2 + C.colGapPx;
      buttons[0].setPosition(cx - dist * HALF, cy);
      buttons[1].setPosition(cx + dist * HALF, cy);
    }
    return cy + buttons[0].totalHeight; // `totalHeight` is already measured FROM the hex's own centre (includes the radius once) — don't subtract r again
  }

  /**
   * @private landscape: a 2-row honeycomb, even index -> top row, odd index
   * -> bottom row, each column pitch `colW` apart; the bottom row of each
   * column pair sits half a pitch to the LEFT of its own column (so it
   * interlocks in the gap between that column and the previous one) —
   * exactly the reference screenshot's own tessellation. Centred as a whole
   * within `w`.
   * @param {number} w @returns {number} total content height
   */
  _layoutHoneycomb(w) {
    const r = C.radiusPx, halfW = r * HEX_HALF_W;
    const colW = halfW * 2 + C.colGapPx;
    const cols = Math.ceil(this._buttons.length / 2);
    const gridW = (cols - 1) * colW + halfW * 2 + colW * HALF;
    const xOffset = Math.max(0, (w - gridW) * HALF) + colW * HALF + halfW;
    const topY = C.topGapPx + r;
    const bottomY = topY + r * 2 + C.rowGapPx;
    for (let i = 0; i < this._buttons.length; i++) {
      const col = Math.floor(i / 2), isTop = i % 2 === 0;
      const cx = xOffset + col * colW - (isTop ? 0 : colW * HALF);
      this._buttons[i].setPosition(cx, isTop ? topY : bottomY);
    }
    return bottomY + r + C.bottomGapPx;
  }
}

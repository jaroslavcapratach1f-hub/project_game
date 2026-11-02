/**
 * TopBarRightCluster — TopBar's top-RIGHT group: Personnel, Money, Oil,
 * Steel, then Gold, each its own icon-overlaps-a-glass-pill badge
 * (`glassPill()`, shared so all five stay pixel-identical — "same glass
 * structure... to keep it consistent"). Gold adds its own "+" purchase
 * button just outside the glass (`setGoldTap`, stubbed by `Hud.js`).
 *
 * Portrait: this row's natural width doesn't fit beside the avatar on a
 * narrow screen, so `layout()` takes a `maxWidthPx` budget (TopBar.js
 * works it out from the avatar cluster's own width) and shrinks the whole
 * row via `Container.scale` to fit it — single row, right-anchored,
 * beside the avatar, never its own separate full-width row (the player's
 * own corrections, in order: fix the overlap, then "resources at the top
 * not below", then "beside the player icon... not above everything").
 */
import { Assets, Container, FillGradient, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { formatAbbr, abbrSlotWidth } from '../../utils/FormatNumber.js';
import goldBarsUrl from '../../../assets/ui/topbar/gold_bars.png';
import goldPlusBtnUrl from '../../../assets/ui/topbar/gold_plus_button.png';
import personnelIconUrl from '../../../assets/ui/topbar/personnel_icon.png';
import moneyIconUrl from '../../../assets/ui/topbar/money_icon.png';
import oilIconUrl from '../../../assets/ui/topbar/oil_icon.png';
import steelIconUrl from '../../../assets/ui/topbar/steel_icon.png';

const HALF = 0.5;
const ICON_GAP = 2; // icon-to-text gap, every badge
const GOLD = {
  pillGapPx: 6, iconSizePx: 26, valuePx: 16, btnGapPx: 3, btnSizePx: 28,
  textFill: 0xfff6d9, textStroke: 0xd4af37, strokeWidthPx: 2, glowColor: 0xffb300, glowBlur: 3,
};
// Shared "black glass" pill look every non-Gold badge in this file uses.
// `pillPadRightPx` trimmed snug (the player's own call: "reduce glass
// section width as it's too big") now that `FormatNumber.js`'s own
// reserved slot is also much narrower.
const GLASS = {
  pillHeightPx: 26, pillRadiusPx: 13, pillPadRightPx: 5, textPx: 15, textColor: 0xf4f4f0,
  pillColor: '10,10,8', pillAlphaNear: 0.9, pillAlphaFar: 0.15,
};
const PERSONNEL = { iconHeightPx: 26, aspect: 115 / 160, warnFrac: 0.15, warnColor: 0xff6b35 };
const RESOURCE = {
  iconHeightPx: 26, gapPx: 4,
  icons: {
    money: { url: moneyIconUrl, aspect: 170 / 160 },
    oil: { url: oilIconUrl, aspect: 127 / 160 },
    steel: { url: steelIconUrl, aspect: 148 / 160 },
  },
};

/** @param {Graphics} g @param {number} left @param {number} cy @param {number} w @returns {void} */
function glassPill(g, left, cy, w) {
  const gradient = new FillGradient({
    type: 'linear', start: { x: 0, y: 0 }, end: { x: 1, y: 0 }, textureSpace: 'local',
    colorStops: [
      { offset: 0, color: `rgba(${GLASS.pillColor},${GLASS.pillAlphaNear})` },
      { offset: 1, color: `rgba(${GLASS.pillColor},${GLASS.pillAlphaFar})` },
    ],
  });
  g.clear().roundRect(left, cy - GLASS.pillHeightPx * HALF, w, GLASS.pillHeightPx, GLASS.pillRadiusPx).fill(gradient);
}

/** Fixed footprint (not the live text width — see FormatNumber.js's own doc on why). @param {number} iconHeightPx @param {number} aspect @param {number} slotW @returns {number} */
function badgeWidth(iconHeightPx, aspect, slotW) {
  return iconHeightPx * aspect + ICON_GAP + slotW + GLASS.pillPadRightPx;
}

export class TopBarRightCluster {
  constructor() {
    const fam = WORLD_HUD.fontFamily;
    this.view = new Container();
    this._persPill = new Graphics();
    this._persIcon = new Sprite(); this._persIcon.anchor.set(HALF);
    this._persValue = new Text({ text: '0', style: new TextStyle({
      fontFamily: fam, fontSize: GLASS.textPx, fontWeight: 'bold', fill: GLASS.textColor,
      dropShadow: { color: 0x000000, alpha: 0.5, blur: 1.5, distance: 1, angle: Math.PI / 4 },
    }) });
    this._persValue.anchor.set(0, HALF);
    this._persSlotW = abbrSlotWidth(this._persValue);
    Assets.load(personnelIconUrl).then((tex) => { this._persIcon.texture = tex; });
    this._goldPill = new Graphics();
    this._goldIcon = new Sprite(); this._goldIcon.anchor.set(HALF);
    this._goldValue = new Text({ text: '0', style: new TextStyle({
      fontFamily: fam, fontSize: GOLD.valuePx, fontWeight: 'bold', fill: GOLD.textFill,
      stroke: { color: GOLD.textStroke, width: GOLD.strokeWidthPx },
      dropShadow: { color: GOLD.glowColor, alpha: 0.85, blur: GOLD.glowBlur, distance: 0 },
    }) });
    this._goldValue.anchor.set(0, HALF);
    this._goldSlotW = abbrSlotWidth(this._goldValue);
    this._goldBtn = new Sprite(); this._goldBtn.anchor.set(HALF);
    Assets.load(goldBarsUrl).then((tex) => { this._goldIcon.texture = tex; });
    Assets.load(goldPlusBtnUrl).then((tex) => { this._goldBtn.texture = tex; });
    this.view.addChild(this._persPill, this._persIcon, this._persValue, this._goldPill, this._goldIcon, this._goldValue, this._goldBtn);
    /** @private @type {Object<string,{icon:Sprite,value:Text,pill:Graphics,slotW:number}>} */
    this._items = {};
    for (const key of WORLD_HUD.topBar.resourceKeys) {
      const icon = new Sprite(); icon.anchor.set(HALF);
      const value = new Text({ text: '0', style: new TextStyle({
        fontFamily: fam, fontSize: GLASS.textPx, fontWeight: 'bold', fill: GLASS.textColor,
        dropShadow: { color: 0x000000, alpha: 0.5, blur: 1.5, distance: 1, angle: Math.PI / 4 },
      }) });
      value.anchor.set(0, HALF);
      const pill = new Graphics();
      Assets.load(RESOURCE.icons[key].url).then((tex) => { icon.texture = tex; });
      this._items[key] = { icon, value, pill, slotW: abbrSlotWidth(value) };
      this.view.addChild(pill, icon, value);
    }
    this._goldBtnRect = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @param {number} current @param {number} max @returns {void} */
  setPersonnel(current, max) {
    this._persValue.text = formatAbbr(current);
    this._persValue.style.fill = max > 0 && current / max < PERSONNEL.warnFrac ? PERSONNEL.warnColor : GLASS.textColor;
  }
  /** @param {{money:number,steel:number,oil:number}} p @returns {void} */
  setResources(p) {
    for (const k of WORLD_HUD.topBar.resourceKeys) this._items[k].value.text = formatAbbr(p[k]);
  }
  /** @param {number} v @returns {void} */
  setGold(v) { this._goldValue.text = formatAbbr(v); }

  /** @param {number} sx @param {number} sy @returns {boolean} tapped the Gold "+" purchase button */
  hitTestGoldButton(sx, sy) {
    const r = this._goldBtnRect, cx = r.x + r.w * HALF, cy = r.y + r.h * HALF, dx = sx - cx, dy = sy - cy;
    return dx * dx + dy * dy <= (r.w * HALF) * (r.w * HALF);
  }

  /**
   * @param {number} screenWidth @param {number} topInsetPx @param {number} edgeInsetPx
   * @param {number} [maxWidthPx] available on-screen width — shrinks the whole row to fit when its natural width is wider
   * @returns {void}
   */
  layout(screenWidth, topInsetPx, edgeInsetPx, maxWidthPx = Infinity) {
    const t = WORLD_HUD.topBar;
    let groupW = 0;
    for (const key of t.resourceKeys) groupW += badgeWidth(RESOURCE.iconHeightPx, RESOURCE.icons[key].aspect, this._items[key].slotW);
    groupW += RESOURCE.gapPx * (t.resourceKeys.length - 1);
    const persW = badgeWidth(PERSONNEL.iconHeightPx, PERSONNEL.aspect, this._persSlotW);
    const goldPillW = badgeWidth(GOLD.iconSizePx, 1, this._goldSlotW);
    const natural = persW + GOLD.pillGapPx + groupW + GOLD.pillGapPx + goldPillW + GOLD.btnGapPx + GOLD.btnSizePx;
    const k = Math.min(1, maxWidthPx / natural);
    this.view.scale.set(k);
    // Everything below computes in this PRE-scale space off `sw/sTop/sEdge`
    // (screenWidth etc. divided back out by `k`) so the final on-screen
    // result lands exactly where the caller asked, just shrunk as a whole.
    const sw = screenWidth / k, sTop = topInsetPx / k, sEdge = edgeInsetPx / k;
    const cy = sTop + GLASS.pillHeightPx * HALF;
    const btnCx = sw - sEdge - GOLD.btnSizePx * HALF;
    this._goldBtn.position.set(btnCx, cy);
    this._goldBtn.width = this._goldBtn.height = GOLD.btnSizePx;
    // Hit-test rect is stored in real screen px (tap coords aren't scaled).
    this._goldBtnRect = { x: (btnCx - GOLD.btnSizePx * HALF) * k, y: (cy - GOLD.btnSizePx * HALF) * k, w: GOLD.btnSizePx * k, h: GOLD.btnSizePx * k };
    const goldPillRight = btnCx - GOLD.btnSizePx * HALF - GOLD.btnGapPx;
    const goldLeft = goldPillRight - this._layoutGoldPill(goldPillRight, cy);
    const groupLeft = goldLeft - GOLD.pillGapPx - groupW;
    let bx = groupLeft;
    for (const key of t.resourceKeys) {
      bx += this._layoutResource(this._items[key], RESOURCE.icons[key].aspect, bx, cy) + RESOURCE.gapPx;
    }
    this._layoutPersonnel(groupLeft - GOLD.pillGapPx, cy);
  }

  /** @private pill's RIGHT edge pinned at `rightX`, icon overlaps its left edge — same structure as every other badge @param {number} rightX @param {number} cy @returns {number} footprint width */
  _layoutGoldPill(rightX, cy) {
    const iconW = GOLD.iconSizePx;
    const w = badgeWidth(iconW, 1, this._goldSlotW);
    const iconCx = rightX - w + iconW * HALF;
    this._goldIcon.position.set(iconCx, cy);
    this._goldIcon.width = iconW; this._goldIcon.height = iconW;
    this._goldValue.position.set(iconCx + iconW * HALF + ICON_GAP, cy);
    glassPill(this._goldPill, iconCx, cy, rightX - iconCx);
    return rightX - iconCx + iconW * HALF;
  }

  /** @private icon overlaps the pill's left edge, pill grows rightward from `leftX` @param {{icon:Sprite,value:Text,pill:Graphics,slotW:number}} item @param {number} aspect @param {number} leftX @param {number} cy @returns {number} footprint width */
  _layoutResource(item, aspect, leftX, cy) {
    const iconW = RESOURCE.iconHeightPx * aspect;
    const iconCx = leftX + iconW * HALF;
    item.icon.position.set(iconCx, cy);
    item.icon.width = iconW; item.icon.height = RESOURCE.iconHeightPx;
    item.value.position.set(iconCx + iconW * HALF + ICON_GAP, cy);
    const w = badgeWidth(RESOURCE.iconHeightPx, aspect, item.slotW);
    glassPill(item.pill, iconCx, cy, w - iconW * HALF);
    return w;
  }

  /** @private pill's RIGHT edge pinned at `rightX`, icon overlaps its left edge @param {number} rightX @param {number} cy */
  _layoutPersonnel(rightX, cy) {
    const iconW = PERSONNEL.iconHeightPx * PERSONNEL.aspect;
    const w = badgeWidth(iconW, 1, this._persSlotW);
    const iconCx = rightX - w + iconW * HALF;
    this._persIcon.position.set(iconCx, cy);
    this._persIcon.width = iconW; this._persIcon.height = PERSONNEL.iconHeightPx;
    this._persValue.position.set(iconCx + iconW * HALF + ICON_GAP, cy);
    glassPill(this._persPill, iconCx, cy, rightX - iconCx);
  }
}

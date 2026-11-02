/**
 * PowerBadge — the Power readout as a star-overlapping-a-glass-pill badge
 * (the player's own reference image): real star art (background-removed
 * via a geometric regular-star polygon mask, not raw colour thresholding —
 * the source composite had the star's own cast shadow blended into the
 * glass pill behind it, which no colour threshold could cleanly separate;
 * fitting a true 5-point star polygon to the art's own measured centre/
 * radii/rotation sidesteps that entirely) overlapping the pill's left
 * edge, a black-to-transparent gradient glass pill behind the number
 * (`FillGradient`, same technique `ui/ScreenDraw.js` already uses for its
 * own scrim), and the number in plain white — the player's own two-step
 * correction: first away from an overly shiny gold, then from the
 * reference's literal dark to white (matching `LocationBadge`'s own
 * number colour, the player's own call once both badges sat side by side).
 */
import { Assets, Container, Graphics, Sprite, Text, TextStyle, FillGradient } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { formatAbbr } from '../../utils/FormatNumber.js';
import powerStarUrl from '../../../assets/ui/topbar/power_star.png';

const HALF = 0.5;
const STAR_ASPECT = 160 / 153; // source art's own natural width/height ratio
const CFG = {
  starHeightPx: 20, pillHeightPx: 26, pillRadiusPx: 13, pillPadRightPx: 10,
  textPx: 15, textFill: 0xf4f4f0, textShadowColor: 0x000000, shadowAlpha: 0.5, shadowBlur: 1.5, shadowDistance: 1,
  pillColor: '10,10,8', pillAlphaNear: 0.9, pillAlphaFar: 0.15,
};

export class PowerBadge {
  constructor() {
    this.view = new Container();
    this._pillBg = new Graphics();
    this._star = new Sprite();
    this._star.anchor.set(HALF);
    this._value = new Text({ text: '0', style: new TextStyle({
      fontFamily: WORLD_HUD.fontFamily, fontSize: CFG.textPx, fontWeight: 'bold', fill: CFG.textFill,
      dropShadow: { color: CFG.textShadowColor, alpha: CFG.shadowAlpha, blur: CFG.shadowBlur, distance: CFG.shadowDistance, angle: Math.PI / 4 },
    }) });
    this._value.anchor.set(0, HALF);
    Assets.load(powerStarUrl).then((tex) => { this._star.texture = tex; });
    this.view.addChild(this._pillBg, this._star, this._value);
  }

  /** @param {number} total @returns {void} */
  setValue(total) { this._value.text = formatAbbr(total, 10000); }

  /**
   * @param {number} leftX the star's own left-most extent (screen px)
   * @param {number} cy vertical centre
   * @returns {{width:number, height:number}} footprint, so the caller can flow on from it
   */
  layout(leftX, cy) {
    const starW = CFG.starHeightPx * STAR_ASPECT;
    const starCx = leftX + starW * HALF;
    this._star.position.set(starCx, cy);
    this._star.width = starW;
    this._star.height = CFG.starHeightPx;
    const pillLeft = starCx; // star's own centre — overlaps the pill's left half, matching the reference
    const textX = pillLeft + starW * HALF + 4;
    this._value.position.set(textX, cy);
    const pillW = (textX - pillLeft) + this._value.width + CFG.pillPadRightPx;
    const gradient = new FillGradient({
      type: 'linear', start: { x: 0, y: 0 }, end: { x: 1, y: 0 }, textureSpace: 'local',
      colorStops: [
        { offset: 0, color: `rgba(${CFG.pillColor},${CFG.pillAlphaNear})` },
        { offset: 1, color: `rgba(${CFG.pillColor},${CFG.pillAlphaFar})` },
      ],
    });
    this._pillBg.clear().roundRect(pillLeft, cy - CFG.pillHeightPx * HALF, pillW, CFG.pillHeightPx, CFG.pillRadiusPx).fill(gradient);
    return { width: (pillLeft + pillW) - leftX, height: Math.max(CFG.starHeightPx, CFG.pillHeightPx) };
  }
}

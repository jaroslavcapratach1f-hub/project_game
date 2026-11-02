/**
 * LocationBadge — the base's own map coordinates as a pin-overlapping-a-
 * glass-pill badge, the same structure `PowerBadge.js` uses (the player's
 * own explicit ask: "same like a star") but sized modestly — a small
 * hand-drawn map-pin (`TopBarIconDraw.drawLocationPinIcon`) overlapping a
 * gray-to-transparent gradient pill (`FillGradient`, matching the
 * reference image's own gray glass, not Power's black) with the
 * coordinate text in plain white.
 */
import { Container, Graphics, Text, TextStyle, FillGradient } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { drawLocationPinIcon } from './TopBarIconDraw.js';

const HALF = 0.5;
const CFG = {
  pinHeightPx: 16, pillHeightPx: 18, pillRadiusPx: 9, pillPadRightPx: 8,
  pinColor: 0xd4d4d2, pinHoleColor: 0x6d6e68, pinTipColor: 0xc23b2c,
  textPx: 11, textColor: 0xf4f4f0,
  pillColor: '110,110,112', pillAlphaNear: 0.75, pillAlphaFar: 0.1,
};
/** Fixed row height (never depends on live content) — callers use this to pick `layout()`'s `cy` before the row is actually drawn. */
export const LOCATION_BADGE_HEIGHT = Math.max(CFG.pinHeightPx, CFG.pillHeightPx);

export class LocationBadge {
  constructor() {
    this.view = new Container();
    this._pillBg = new Graphics();
    this._pin = new Graphics();
    this._value = new Text({ text: '', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: CFG.textPx, fontWeight: 'bold', fill: CFG.textColor }) });
    this._value.anchor.set(0, HALF);
    this.view.addChild(this._pillBg, this._pin, this._value);
  }

  /** @param {number} q @param {number} r @returns {void} */
  setCoord(q, r) { this._value.text = `X:${q} Y:${r}`; }

  /**
   * @param {number} leftX the pin's own left-most extent (screen px)
   * @param {number} cy vertical centre
   * @returns {{width:number, height:number}} footprint, so the caller can flow on from it
   */
  layout(leftX, cy) {
    const pinR = CFG.pinHeightPx * HALF;
    const pinCx = leftX + pinR;
    this._pin.clear();
    drawLocationPinIcon(this._pin, pinCx, cy, pinR, CFG.pinColor, CFG.pinHoleColor, CFG.pinTipColor);
    const pillLeft = pinCx; // pin's own centre — overlaps the pill's left half, matching the reference
    const textX = pillLeft + pinR + 4;
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
    return { width: (pillLeft + pillW) - leftX, height: Math.max(CFG.pinHeightPx, CFG.pillHeightPx) };
  }
}

/**
 * BuildingHexOption — one "glass" hex button in `BuildingHexMenu` (Warpath
 * reference: GAME_DESIGN.md/Headquarter.jpeg). World-space, WORLD_UI layer. Icon
 * is a small hand-drawn vector shape (`ActionIconDraw`) — a plain Unicode
 * glyph read as cheap placeholder text at this size — plus a text label
 * underneath, same convention as `ui/RadialOption.js`'s letter-on-a-disc.
 */
import { Container, Graphics, Text } from 'pixi.js';
import { BUILDING_MENU, ACTION_LABEL, MENU_ICON } from '../../config/BuildingMenuConfig.js';
import { ACTION_ICON_DRAW } from './ActionIconDraw.js';

const HALF = 0.5;
const HEX = MENU_ICON.hex;

export class BuildingHexOption {
  /** @param {string} action 'info' | 'upgrade' | 'manage' */
  constructor(action) {
    const M = BUILDING_MENU;
    this._action = action;
    this._x = 0; this._y = 0;
    this._root = new Container();
    this._hex = new Graphics();
    const primary = action === 'upgrade';
    const icon = new Graphics();
    const drawIcon = ACTION_ICON_DRAW[action];
    if (drawIcon) drawIcon(icon, M.iconPx, primary ? M.iconPrimaryColor : M.iconColor);
    const label = new Text({
      text: ACTION_LABEL[action] ?? action,
      style: { fill: M.labelColor, fontSize: M.labelPx, fontFamily: M.fontFamily, fontWeight: 'bold', stroke: { color: M.strokeColor, width: M.strokePx * 2 } },
    });
    label.anchor.set(HALF, 0);
    label.position.set(0, M.hexRadiusPx + M.labelGapPx);
    this._draw();
    this._root.addChild(this._hex, icon, label);
  }

  /** @returns {Container} */ get view() { return this._root; }
  /** @returns {string} */ get action() { return this._action; }

  /** @param {number} x @param {number} y menu-local world px @returns {void} */
  setPosition(x, y) { this._x = x; this._y = y; this._root.position.set(x, y); }

  /** @param {number} x @param {number} y menu-local world px @returns {boolean} */
  contains(x, y) {
    const dx = x - this._x, dy = y - this._y;
    const r = BUILDING_MENU.hexRadiusPx;
    return Math.abs(dx) <= r && dy >= -r && dy <= r + BUILDING_MENU.labelPx;
  }

  /** @returns {void} */
  destroy() { this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /** @private Silver outer rim, recessed bevel and translucent glass face. */
  _draw() {
    const M = BUILDING_MENU, r = M.hexRadiusPx;
    this._hex.clear().poly(HEX.map((v) => v * r)).fill(M.bevelColor)
      .stroke({ color: M.glass.stroke, width: M.glass.strokeWidthPx });
    this._hex.poly(HEX.map((v) => v * r * M.bevelInset)).fill(M.glass.stroke);
    this._hex.poly(HEX.map((v) => v * r * M.innerInset))
      .fill({ color: M.glass.fill, alpha: M.glass.fillAlpha })
      .stroke({ color: M.bevelColor, width: M.glass.strokeWidthPx * HALF });
  }
}

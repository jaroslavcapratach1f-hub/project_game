/**
 * HexGoButton — the single "GO" confirm button shown at a tap-selected
 * destination hex (`OrderHexFlow`). Visually matches `BuildingHexOption`'s
 * own glass-hex button (the player's own explicit ask: "hex button we have
 * build in base buildings menu with same icon as green one") — same hex
 * polygon + bevel/glass recipe, reusing `BuildingMenuConfig.MENU_ICON.hex`
 * and `BUILDING_MENU`'s own glass colours directly rather than copying the
 * numbers — but kept as its OWN component so troop movement doesn't leak
 * into the Building menu's action vocabulary (info/upgrade/manage/view).
 */
import { Container, Graphics, Text } from 'pixi.js';
import { BUILDING_MENU, MENU_ICON } from '../config/BuildingMenuConfig.js';
import { ORDERS } from '../config/OrdersConfig.js';
import { drawGoIcon, drawAttackIcon } from './HexTargetIconDraw.js';

const HALF = 0.5;
const HEX = MENU_ICON.hex;

export class HexGoButton {
  constructor() {
    this._root = new Container();
    this._root.visible = false;
    this._hex = new Graphics();
    this._icon = new Graphics();
    this._label = new Text({ text: 'GO', style: { fill: ORDERS.goButton.labelColor, fontSize: ORDERS.goButton.labelPx, fontFamily: BUILDING_MENU.fontFamily, fontWeight: 'bold', stroke: { color: BUILDING_MENU.strokeColor, width: BUILDING_MENU.strokePx * 2 } } });
    this._label.anchor.set(HALF, 0);
    this._label.position.set(0, ORDERS.goButton.hexRadiusPx + ORDERS.goButton.labelGapPx);
    this._root.addChild(this._hex, this._icon, this._label);
    this._x = 0; this._y = 0; this._kind = null;
  }

  /** @returns {Container} */ get view() { return this._root; }

  /** @param {number} x @param {number} y world px @param {'empty'|'enemy'} kind @returns {void} */
  show(x, y, kind) {
    this._x = x; this._y = y;
    this._root.position.set(x, y);
    this._root.visible = true;
    if (kind === this._kind) return;
    this._kind = kind;
    const g = ORDERS.goButton, color = kind === 'enemy' ? ORDERS.hexTarget.attackColor : ORDERS.hexTarget.moveColor;
    const r = g.hexRadiusPx;
    this._hex.clear().poly(HEX.map((v) => v * r)).fill(BUILDING_MENU.bevelColor)
      .stroke({ color: BUILDING_MENU.glass.stroke, width: BUILDING_MENU.glass.strokeWidthPx });
    this._hex.poly(HEX.map((v) => v * r * BUILDING_MENU.bevelInset)).fill(BUILDING_MENU.glass.stroke);
    this._hex.poly(HEX.map((v) => v * r * BUILDING_MENU.innerInset))
      .fill({ color: BUILDING_MENU.glass.fill, alpha: BUILDING_MENU.glass.fillAlpha })
      .stroke({ color: BUILDING_MENU.bevelColor, width: BUILDING_MENU.glass.strokeWidthPx * HALF });
    this._icon.clear();
    (kind === 'enemy' ? drawAttackIcon : drawGoIcon)(this._icon, g.iconPx, color);
    this._label.text = kind === 'enemy' ? 'ATTACK' : 'GO';
  }

  /** @returns {void} */
  hide() { this._root.visible = false; this._kind = null; }

  /** @param {number} wx @param {number} wy world px @returns {boolean} */
  contains(wx, wy) {
    if (!this._root.visible) return false;
    const dx = wx - this._x, dy = wy - this._y, r = ORDERS.goButton.hexRadiusPx;
    return Math.abs(dx) <= r && dy >= -r && dy <= r + ORDERS.goButton.labelPx + ORDERS.goButton.labelGapPx;
  }

  /** @returns {void} */
  destroy() { this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }
}

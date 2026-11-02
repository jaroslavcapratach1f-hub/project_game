/**
 * ResearchResourceBar — `ResearchScreen`'s own live Money/Steel/Oil readout
 * (the player's own explicit correction: not the global HUD TopBar peeking
 * through a gap below it — this screen's own resources, present "in all
 * screens in Research Center under Research button"). Same real icons
 * `ResourceStatIcon` already uses everywhere else (Upgrade cost rows, this
 * screen's own node-detail cost row). SCOPE LOCK (`ResourceConfig.js`): no
 * Gold here — exactly the 3 resources research costs are ever paid in.
 *
 * Two layouts, orientation-driven (the player's own landscape reference):
 * `layoutBar` — portrait's own full-width dark strip, the very first thing
 * drawn on screen, icons reading left-to-right from the left edge.
 * `layoutInline` — landscape's single combined header row (back+title on
 * the left, resources right-aligned on the SAME row, no separate strip —
 * `ResearchScreen` draws the header's own shared background).
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_HUB as C } from '../../config/ResearchScreenConfig.js';
import { CORE_RESOURCE_KEYS } from '../../config/ResourceConfig.js';
import { formatAbbr } from '../../utils/FormatNumber.js';
import { ResourceStatIcon } from './ResourceStatIcon.js';

const HALF = 0.5;
const ICON_VALUE_GAP = 4;

export class ResearchResourceBar {
  constructor() {
    this.view = new Container();
    this._bg = new Graphics();
    this.view.addChild(this._bg);
    /** @private @type {{key:string,icon:ResourceStatIcon,value:Text}[]} */
    this._items = CORE_RESOURCE_KEYS.map((key) => {
      const icon = new ResourceStatIcon();
      const value = new Text({
        text: '0',
        style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.resourceBar.valuePx, fill: C.resourceBar.textColor, fontWeight: 'bold' }),
      });
      value.anchor.set(0, HALF);
      this.view.addChild(icon.view, value);
      return { key, icon, value };
    });
  }

  /** @returns {void} */
  destroy() { for (const it of this._items) it.icon.destroy(); }

  /** @param {{money:number,steel:number,oil:number}} balances live `ResourceManager.balances` @returns {void} */
  refresh(balances) {
    for (const it of this._items) it.value.text = formatAbbr(balances[it.key]);
  }

  /** @param {number} w screen width @returns {number} this bar's own height, for the caller to offset everything below it */
  layoutBar(w) {
    const b = C.resourceBar;
    this._bg.visible = true;
    this._bg.clear().rect(0, 0, w, b.heightPx).fill({ color: b.bg, alpha: b.bgAlpha });
    const cy = b.heightPx * HALF, r = b.iconHeightPx * HALF;
    let x = b.padXPx;
    for (const it of this._items) {
      it.icon.draw(it.key, x + r, cy, r, b.iconColor);
      x += b.iconHeightPx + ICON_VALUE_GAP;
      it.value.position.set(x, cy);
      x += it.value.width + b.gapPx;
    }
    return b.heightPx;
  }

  /** @param {number} rightX right edge the whole group ends flush with @param {number} cy vertical centre @returns {void} no own background — the caller's shared header row already draws one */
  layoutInline(rightX, cy) {
    const b = C.resourceBar, r = b.iconHeightPx * HALF;
    this._bg.visible = false;
    let cursor = rightX;
    for (let i = this._items.length - 1; i >= 0; i--) {
      const it = this._items[i];
      cursor -= it.value.width;
      it.value.position.set(cursor, cy);
      cursor -= ICON_VALUE_GAP;
      it.icon.draw(it.key, cursor - r, cy, r, b.iconColor);
      cursor -= b.iconHeightPx + b.gapPx;
    }
  }
}

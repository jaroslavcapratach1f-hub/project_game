/** Fixed action above the detail tabs: stats can scroll without hiding Upgrade. */
import { Container, Graphics } from 'pixi.js';
import { TroopUpgradeButton } from './TroopUpgradeButton.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
export class TroopUpgradeDock {
  constructor() {
    this.view = new Container(); this._bg = new Graphics(); this.button = new TroopUpgradeButton();
    const b = this.button; this.view.addChild(this._bg, b.bg, b.sheen, b.caption, b.label);
  }
  /** @param {number} x @param {number} bottom @param {number} width @param {number} level @param {number} cap @returns {number} reserved height */
  layout(x, bottom, width, level, cap) {
    const pad = WORLD_HUD.troopDetail.contentGapPx;
    this.button.layout(pad, pad, width - pad * 2, level >= cap, Math.min(cap, level + 1));
    const height = this.button.height + pad * 2;
    this.view.position.set(x, bottom - height);
    this._bg.clear().rect(0, 0, width, height).fill({ color: WORLD_HUD.unitsMenu.bg });
    return height;
  }
  /** @param {number} x @param {number} y @returns {boolean} screen-space visible action hit */
  hit(x, y) { return this.view.visible && this.button.hit(x - this.view.x, y - this.view.y); }
}

/** Military tab row; navigation state remains owned by the parent screen. */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { drawTroopTab } from './TroopMenuDraw.js';
import { TROOP_MENU as T } from '../../config/TroopMenuTheme.js';
import { WORLD_HUD } from '../../config/HudConfig.js';

const HALF = 0.5;

export class TroopActionBar {
  constructor() {
    this.view = new Container();
    /** @private @type {{bg:import('pixi.js').Graphics,label:import('pixi.js').Text}[]} */
    this._btns = [];
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._activeId = WORLD_HUD.troopDetail.actions[0].id;
    const fam = WORLD_HUD.fontFamily, m = WORLD_HUD.troopDetail;
    const style = new TextStyle({ fontFamily: fam, fontSize: m.actionLabelPx, fill: T.text });
    for (const a of m.actions) {
      const bg = new Graphics();
      const label = new Text({ text: a.label, style: style.clone() });
      label.anchor.set(HALF);
      this._btns.push({ bg, label });
      this.view.addChild(bg, label);
    }
  }

  /** @returns {string} the currently active tab id */
  get activeId() { return this._activeId; }

  /** @param {number} x @param {number} y @param {number} w @returns {void} lay the row out left-aligned at (x,y), full width w */
  layout(x, y, w) {
    const m = WORLD_HUD.troopDetail;
    this._rect = { x, y, w, h: m.actionBarPx };
    const count = this._btns.length;
    const cell = w / count;
    const btnW = cell - m.actionGapPx, btnH = m.actionBarPx - m.actionGapPx;
    const by = y + m.actionGapPx * HALF;
    for (let i = 0; i < count; i++) {
      const bx = x + cell * i + m.actionGapPx * HALF;
      this._btns[i].label.position.set(bx + btnW * HALF, by + btnH * HALF);
      this._paintBg(i, bx, by, btnW, btnH);
    }
  }

  /** @param {string} id @returns {void} */
  setActive(id) {
    this._activeId = id;
    const actions = WORLD_HUD.troopDetail.actions;
    for (let i = 0; i < this._btns.length; i++) {
      this._btns[i].label.style.fill = actions[i].id === id ? T.brass : T.text;
    }
    this.layout(this._rect.x, this._rect.y, this._rect.w); // repaint every bg's active state
  }

  /** @param {number} sx @param {number} sy @returns {?string} the tab id under the point, or null */
  idAt(sx, sy) {
    const r = this._rect;
    if (sx < r.x || sx > r.x + r.w || sy < r.y || sy > r.y + r.h) return null;
    const idx = Math.floor((sx - r.x) / (r.w / this._btns.length));
    return WORLD_HUD.troopDetail.actions[Math.max(0, Math.min(this._btns.length - 1, idx))].id;
  }

  /** @private one tab's own rounded-rect card @param {number} i @param {number} x @param {number} y @param {number} w @param {number} h */
  _paintBg(i, x, y, w, h) {
    const active = WORLD_HUD.troopDetail.actions[i].id === this._activeId;
    drawTroopTab(this._btns[i].bg, x, y, w, h, active);
  }
}

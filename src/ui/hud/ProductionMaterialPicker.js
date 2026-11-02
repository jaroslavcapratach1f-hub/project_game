/**
 * ProductionMaterialPicker — horizontal-scroll row of every construction
 * material (`MaterialsConfig.MATERIALS`), each showing its current stock.
 * A material whose tier isn't unlocked at the Factory's current level
 * (`MATERIALS[key].fromLevel`) draws dim/grey and can't be selected — the
 * player's own rule: "those not unlocked will be shown gray."
 *
 * Every child is drawn at ABSOLUTE screen coordinates and redrawn on every
 * scroll tick (`ScrollDragX`'s offset is baked into each swatch's own x at
 * draw time) rather than moving a transformed container — simpler to keep
 * correct than juggling a second local/absolute coordinate space.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { PRODUCTION_SCREEN as S } from '../../config/ProductionScreenConfig.js';
import { MATERIALS, MATERIAL_TIER_COLOR } from '../../config/MaterialsConfig.js';
import { drawMaterialIcon } from './BuildingIconDraw.js';
import { ScrollDragX } from './ScrollDragX.js';

const HALF = 0.5;
const KEYS = Object.keys(MATERIALS);

export class ProductionMaterialPicker {
  /** @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(events) {
    this.view = new Container();
    this._mask = new Graphics();
    this._content = new Container();
    this._content.mask = this._mask;
    this.view.addChild(this._mask, this._content);
    const fam = WORLD_HUD.fontFamily, p = S.picker;
    this._swatches = KEYS.map((key) => {
      const bg = new Graphics(), icon = new Graphics();
      const stock = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: p.stockPx, fill: p.stockColor }) });
      stock.anchor.set(HALF, 1);
      this._content.addChild(bg, icon, stock);
      return { key, bg, icon, stock, locked: true, rect: { x: 0, y: 0, w: p.iconSizePx, h: p.iconSizePx } };
    });
    this._selected = KEYS[0];
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._scroll = new ScrollDragX(events, () => this._rect, () => this._draw());
  }

  /** @returns {void} */ enable() { this._scroll.enable(); }
  /** @returns {void} */ disable() { this._scroll.disable(); }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */ get isDragging() { return this._scroll.isDragging; }
  /** @returns {string} the selected material key */ get selected() { return this._selected; }

  /** @param {string} key @returns {void} */
  select(key) { this._selected = key; this._draw(); }

  /** @param {number} engineeringLevel @param {Object<string,number>} materials ResourceManager.materials @returns {void} */
  setState(engineeringLevel, materials) {
    this._stocks = materials;
    for (const s of this._swatches) s.locked = MATERIALS[s.key].fromLevel > engineeringLevel;
    if (this._swatches.find((s) => s.key === this._selected)?.locked) {
      this._selected = this._swatches.find((s) => !s.locked)?.key ?? this._selected;
    }
    this._draw();
  }

  /** @param {number} absX @param {number} absY @param {number} w @returns {void} */
  layout(absX, absY, w) {
    this._originX = absX; this._originY = absY;
    this._rect = { x: absX, y: absY, w, h: S.picker.heightPx };
    this._mask.clear().rect(absX, absY, w, S.picker.heightPx).fill(0xffffff);
    const p = S.picker;
    const contentW = this._swatches.length * (p.iconSizePx + p.gapPx) - p.gapPx;
    this._scroll.setBounds(Math.min(0, w - contentW));
    this._draw();
  }

  /** @param {number} sx @param {number} sy ABSOLUTE @returns {?string} the tapped UNLOCKED material's key, or null */
  hitTest(sx, sy) {
    for (const s of this._swatches) {
      const r = s.rect;
      if (!s.locked && sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) return s.key;
    }
    return null;
  }

  /** @private */
  _draw() {
    if (this._originX === undefined) return;
    const p = S.picker, scrollX = this._scroll.x;
    for (let i = 0; i < this._swatches.length; i++) {
      const s = this._swatches[i];
      const x = this._originX + i * (p.iconSizePx + p.gapPx) + scrollX;
      s.rect.x = x; s.rect.y = this._originY;
      const visible = x + p.iconSizePx >= this._originX && x <= this._originX + this._rect.w;
      s.bg.visible = s.icon.visible = s.stock.visible = visible;
      if (!visible) continue;
      const selected = s.key === this._selected, tier = MATERIALS[s.key].tier;
      s.bg.clear().roundRect(x, this._originY, p.iconSizePx, p.iconSizePx, p.radiusPx)
        .fill({ color: p.bg, alpha: s.locked ? p.lockedAlpha : p.bgAlpha })
        .stroke({ color: selected ? p.selectedStroke : p.stroke, width: selected ? p.selectedStrokeWidthPx : 1, alpha: selected ? 1 : p.strokeAlpha });
      s.icon.clear();
      s.icon.alpha = s.locked ? p.lockedAlpha : 1;
      drawMaterialIcon(s.icon, x + p.iconSizePx * HALF, this._originY + p.iconSizePx * 0.42, p.iconSizePx * 0.26, MATERIAL_TIER_COLOR[(tier - 1) % MATERIAL_TIER_COLOR.length]);
      s.stock.text = s.locked ? '—' : `${this._stocks?.[s.key] ?? 0}`;
      s.stock.alpha = s.locked ? p.lockedAlpha : 1;
      s.stock.position.set(x + p.iconSizePx * HALF, this._originY + p.iconSizePx - 4);
    }
  }
}

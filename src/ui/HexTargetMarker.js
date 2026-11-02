/**
 * HexTargetMarker — the plain green/red icon shown at the locked hex WHILE
 * actively dragging (no "GO" label — that's `HexGoButton`, shown only once
 * the player has tap-selected a destination and is confirming it). World-
 * space, WORLD_UI layer (needs to read clearly above ground/buildings,
 * same reasoning as `BuildingHexMenu`/`RelocateArrows`). One pre-allocated
 * Graphics pair, no per-frame allocation.
 */
import { Container, Graphics } from 'pixi.js';
import { ORDERS } from '../config/OrdersConfig.js';
import { drawGoIcon, drawAttackIcon } from './HexTargetIconDraw.js';

export class HexTargetMarker {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    this._root.visible = false;
    this._bg = new Graphics();
    this._icon = new Graphics();
    this._root.addChild(this._bg, this._icon);
    this._kind = null;
  }

  /** @returns {void} */ enable() { this._renderer.layer('WORLD_UI').addChild(this._root); }
  /** @returns {void} */ disable() { this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /** @param {number} x @param {number} y world px @param {'empty'|'enemy'} kind @returns {void} */
  show(x, y, kind) {
    this._root.position.set(x, y);
    this._root.visible = true;
    if (kind === this._kind) return;
    this._kind = kind;
    const t = ORDERS.hexTarget, color = kind === 'enemy' ? t.attackColor : t.moveColor;
    this._bg.clear().circle(0, 0, t.radiusPx).fill({ color, alpha: t.bgAlpha }).stroke({ color, width: t.strokeWidthPx, alpha: t.strokeAlpha });
    this._icon.clear();
    (kind === 'enemy' ? drawAttackIcon : drawGoIcon)(this._icon, t.iconPx, color);
  }

  /** @returns {void} */ hide() { this._root.visible = false; this._kind = null; }
}

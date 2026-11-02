/**
 * BackButton — the small square "back" card (chevron icon, NavBar's own
 * card colours) used by every UNITS-family screen (`UnitsMenu`,
 * `TroopDetailScreen`) to return to the previous screen. Shared so every
 * such screen looks and hit-tests identically by construction.
 */
import { Graphics } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';

const HALF = 0.5;

export class BackButton {
  constructor() {
    this.bg = new Graphics();
    this.icon = new Graphics();
    /** @private */ this._rect = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @param {number} x @param {number} y top-left @returns {void} */
  layout(x, y) {
    const u = WORLD_HUD.unitsMenu, n = WORLD_HUD.navBar, s = u.backSizePx;
    this._rect = { x, y, w: s, h: s };
    this.bg.clear().roundRect(x, y, s, s, u.backRadiusPx)
      .fill({ color: n.btnBg, alpha: n.btnBgAlpha })
      .stroke({ color: n.btnStroke, width: n.btnStrokeWidthPx, alpha: n.btnStrokeAlpha });
    const cx = x + s * HALF, cy = y + s * HALF, r = s * u.backIconInset, a = u.backIconAspect;
    this.icon.clear().moveTo(cx + r, cy - r * a).lineTo(cx - r, cy).lineTo(cx + r, cy + r * a)
      .stroke({ color: WORLD_HUD.accentColor, width: u.backIconStrokeWidthPx });
  }

  /** @param {number} sx @param {number} sy @returns {boolean} */
  hit(sx, sy) {
    const r = this._rect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }
}

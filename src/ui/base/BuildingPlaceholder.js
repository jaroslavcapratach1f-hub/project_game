/**
 * BuildingPlaceholder — the procedural stand-in a BuildingSprite shows until a
 * real atlas ships (GDD 24). A faux-3D rectangular block (the BaseDraw style)
 * sized to the building's own footprint (BaseGridConfig.FOOTPRINT) scaled by
 * its level tier, plus one signature moving part (radar sweep / nodding pump /
 * sliding crane / cycling shutter) so the building is never a static rectangle.
 */
import { Container, Graphics } from 'pixi.js';
import { degToRad } from '../../utils/MathUtils.js';
import { BASE } from '../../config/BaseConfig.js';
import { footprintOf } from '../../config/BaseGridConfig.js';
import { ANIM, PLH, tierOf, tierScale, BUILDING_STATE } from '../../config/BuildingArtConfig.js';
import { tint as barracksTint } from '../../systems/DynamicBarracks.js';

const HALF = 0.5;
const TWO_PI = Math.PI * 2;
const CH = 0xff, R_SHIFT = 16, G_SHIFT = 8;
const BARRACKS_ID = 'barracks';
const SHUTTER_TINT = 0x14140f;

/** blend `color` toward white by `amt` (0..1) */
function lighten(color, amt) {
  const r = (color >> R_SHIFT) & CH;
  const g = (color >> G_SHIFT) & CH;
  const b = color & CH;
  const mix = (c) => Math.round(c + (CH - c) * amt);
  return (mix(r) << R_SHIFT) | (mix(g) << G_SHIFT) | mix(b);
}

export class BuildingPlaceholder {
  /** @param {string} id building id */
  constructor(id) {
    this._id = id;
    this._root = new Container();
    this._body = new Graphics();
    this._elem = new Graphics();     // the signature moving part
    this._root.addChild(this._body, this._elem);
    this._art = null;
    this._level = 1;
    this._variant = undefined;
    this._phase = 0;
    this._spin = ANIM.spinIdleDegPerSec;
    this._h = 0;
  }

  /** @returns {Container} */
  get view() { return this._root; }

  /** @returns {number} the drawn block's current height, px (for label placement) */
  get height() { return this._h; }

  /** @param {object} art BuildingArtConfig entry @returns {void} */
  attach(art) { this._art = art; this._redraw(); }

  /** @param {number} n @returns {void} */
  setLevel(n) { this._level = n; this._redraw(); }

  /** @param {?string} v barracks variant @returns {void} */
  setVariant(v) { this._variant = v; this._redraw(); }

  /** @param {string} state BUILDING_STATE @returns {void} */
  setState(state) {
    this._spin = state === BUILDING_STATE.WORKING ? ANIM.spinWorkDegPerSec : ANIM.spinIdleDegPerSec;
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._phase += dt;
    const e = this._art && this._art.element;
    if (!e) return;
    const p = this._phase;
    if (e.kind === 'radar') this._elem.rotation = degToRad(p * this._spin);
    else if (e.kind === 'pump') this._elem.rotation = Math.sin(p * ANIM.pumpHz * TWO_PI) * PLH.pumpSwingRad;
    else if (e.kind === 'crane') this._elem.x = e.at[0] + Math.sin(p * ANIM.craneHz * TWO_PI) * e.size;
    else if (e.kind === 'doors') {
      this._elem.scale.y = PLH.doorMinScaleY
        + PLH.doorRangeScaleY * (PLH.half + PLH.half * Math.sin(p * ANIM.doorsHz * TWO_PI));
    }
  }

  /** @private redraw the block + signature element for the current footprint + tier */
  _redraw() {
    if (!this._art) return;
    const B = BASE.building;
    const fp = footprintOf(this._id);
    const scale = tierScale(tierOf(this._level));
    const w = (fp.w * BASE.grid.cellPx - B.insetPx * 2) * scale;
    const h = (fp.h * BASE.grid.cellPx - B.insetPx * 2) * scale;
    const body = this._id === BARRACKS_ID ? barracksTint(this._variant) : this._art.tint;
    this._body.clear()
      .rect(-w * HALF + B.shadowDX, -h * HALF + B.shadowDY, w, h).fill({ color: B.shadowColor, alpha: B.shadowAlpha })
      .rect(-w * HALF, -h * HALF, w, h).fill(body).stroke({ color: B.outlineColor, width: B.outlineWidthPx })
      .rect(-w * HALF + B.roofInsetPx * HALF, -h * HALF + B.roofInsetPx * HALF - B.roofDropPx,
        w - B.roofInsetPx, h - B.roofInsetPx).fill(lighten(body, B.roofLighten));
    this._drawElement(lighten(body, PLH.elemLighten));
    this._h = h; // exposed for the label anchor (BuildingSprite)
  }

  /** @private draw the signature part at rest; update() animates it */
  _drawElement(color) {
    const e = this._art.element;
    const g = this._elem;
    const w = PLH.barThickPx;
    const h = PLH.barHalfPx;
    g.clear();
    g.pivot.set(0, 0);
    g.scale.set(1);
    g.position.set(e.at ? e.at[0] : 0, e.at ? e.at[1] : 0);
    if (e.kind === 'radar') g.rect(-e.size, -h, e.size * 2, w).fill(color);
    else if (e.kind === 'pump') g.rect(-h, -e.size, w, e.size).fill(color).circle(0, 0, PLH.jointRPx).fill(color);
    else if (e.kind === 'crane') {
      g.rect(-e.size, -h, e.size * 2, w).fill(color)
        .rect(-h, 0, PLH.cranePostWpx, PLH.cranePostHpx).fill(color);
    } else if (e.kind === 'doors') {
      g.rect(-e.size * PLH.half, -e.size, e.size, e.size).fill({ color: SHUTTER_TINT, alpha: PLH.doorAlpha });
      g.pivot.set(0, -e.size);
    }
  }

  /** @returns {void} */
  destroy() { this._root.destroy({ children: true }); }
}

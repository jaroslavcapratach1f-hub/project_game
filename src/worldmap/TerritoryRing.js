/**
 * TerritoryRing — the dotted circle marking a base's claimed territory (GDD 24
 * "Base zoom" reference). World-space, drawn at its true radius so it scales
 * with the camera like the compound itself — no independent rescaling. Purely
 * a visual read; `worldmap/territory.js` owns the actual placement rule this
 * illustrates (nothing else may be placed inside it).
 */
import { Container, Graphics } from 'pixi.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';

const TWO_PI = Math.PI * 2;
const VIS_EPS = 0.001;

/** @param {Graphics} g cleared + redrawn @param {number} r radius px @returns {void} */
function drawDashedCircle(g, r) {
  const t = WORLDMAP.territory;
  g.clear();
  const step = (t.dashPx + t.gapPx) / r; // radians per dash+gap at this radius
  const dashRad = t.dashPx / r;
  for (let a = 0; a < TWO_PI; a += step) {
    const b = Math.min(a + dashRad, TWO_PI);
    g.moveTo(Math.cos(a) * r, Math.sin(a) * r).lineTo(Math.cos(b) * r, Math.sin(b) * r);
  }
  g.stroke({ width: t.widthPx, color: t.color, alpha: t.alpha });
}

export class TerritoryRing {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    this._g = new Graphics();
    this._root.addChild(this._g);
    /** @private S57 pin-mode override (BaseLodPin.js) */ this._forceHidden = false;
  }

  /** @returns {Container} */ get view() { return this._root; }

  /**
   * @param {number} cx @param {number} cy world px centre
   * @param {number} [radiusPx=WORLDMAP.territoryRadiusPx]
   * @returns {void}
   */
  enable(cx, cy, radiusPx = WORLDMAP.territoryRadiusPx) {
    drawDashedCircle(this._g, radiusPx);
    this._root.position.set(cx, cy);
    this._renderer.layer('DECALS').addChild(this._root);
  }

  /** @param {number} alpha 0..1 @returns {void} */
  setBlend(alpha) {
    this._root.alpha = alpha;
    this._root.renderable = !this._forceHidden && alpha > VIS_EPS;
  }

  /** @param {boolean} hidden @returns {void} force-hide regardless of alpha (S57 pin-mode swap — see BaseLodPin.js) */
  setForceHidden(hidden) {
    this._forceHidden = hidden;
    this._root.renderable = !hidden && this._root.alpha > VIS_EPS;
  }

  /** @returns {void} */
  disable() {
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }
}

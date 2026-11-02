/**
 * BaseTroops — the zoomed-out garrison hint: a tight pip blob just below the
 * compound centre (WORLDMAP.baseCentre), one pip per real garrison unit
 * (BaseArmy.garrisonCount, pushed in via setCount). Fades out via the LOD blend
 * `t` as the camera zooms in and the real marchable squads take over.
 */
import { Container } from 'pixi.js';
import { clamp, easeInOutQuad } from '../utils/MathUtils.js';
import { BASE } from '../config/BaseConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { buildPipCluster } from '../ui/TroopDraw.js';

const VIS_EPS = 0.002;
const FADE = { from: 0.18, span: 0.34 }; // pip blob gone by from+span
const FAR_ANCHOR_PX = 40; // drop point below centre while the HQ still reads "far" (GDD 24)

export class BaseTroops {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    /** @private pip count — overridden by the real garrison size */
    this._count = BASE.garrison.compact.pips;
    /** @private @type {?import('pixi.js').Graphics} */ this._cluster = null;
    /** @private S57 pin-mode override (BaseLodPin.js) */ this._forceHidden = false;
  }

  /** @returns {void} */
  enable() {
    const c = WORLDMAP.baseCentre;
    this._renderer.layer('GROUND_UNITS').addChild(this._root);
    this._root.position.set(c.x, c.y);
    this._rebuild();
  }

  /** @param {number} n real garrison unit count @returns {void} */
  setCount(n) {
    const next = Math.max(0, Math.round(n));
    if (next === this._count) return;
    this._count = next;
    if (this._root.parent) this._rebuild();
  }

  /** @private (re)draw the pip cluster at the current count */
  _rebuild() {
    const G = BASE.garrison.compact;
    this._cluster?.destroy();
    this._cluster = buildPipCluster({ ...G, pips: this._count });
    this._cluster.position.set(0, FAR_ANCHOR_PX + G.dropPx);
    this._root.addChild(this._cluster);
  }

  /** @param {number} t 0..1 zoom blend @returns {void} */
  setBlend(t) {
    const a = 1 - easeInOutQuad(clamp((clamp(t, 0, 1) - FADE.from) / FADE.span, 0, 1));
    this._root.alpha = a;
    this._root.renderable = !this._forceHidden && a > VIS_EPS;
  }

  /** @param {boolean} hidden @returns {void} force-hide regardless of the blend (S57 pin-mode swap — see BaseLodPin.js) */
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

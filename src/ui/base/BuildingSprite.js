/**
 * BuildingSprite — one base building's view (GDD 24). Owns its level, state and
 * variant, and renders through a BuildingPlaceholder + BuildingFx today. When a
 * real atlas ships for `id`, the load path swaps in an AnimatedSprite per
 * band/state with no change to this API or to BaseGridView.
 *
 *   setLevel(n)   → band-appropriate silhouette
 *   setState(s)   → idle / working / upgrading … drives animation + FX intensity
 *   update(dt)    → advance the animation
 */
import { Container, Sprite, Assets } from 'pixi.js';
import { buildingArt, tierOf, BUILDING_STATE } from '../../config/BuildingArtConfig.js';
import { footprintOf, CELL_PX } from '../../config/BaseGridConfig.js';
import { footprintFrontAnchor } from '../../utils/SquareGrid.js';
import { BuildingPlaceholder } from './BuildingPlaceholder.js';
import { BuildingFx } from './BuildingFx.js';

const GROUND_ANCHOR = { x: 0.5, y: 1 }; // image bbox centre + bottom edge = its ground contact

export class BuildingSprite {
  /**
   * @param {string} id building id (BuildingConfig.BUILDINGS key)
   * @param {{level?:number, variant?:string, state?:string}} [opts]
   */
  constructor(id, opts = {}) {
    this._id = id;
    this._art = buildingArt(id);
    this._root = new Container();
    this._level = opts.level ?? 1;
    this._variant = opts.variant;
    this._state = opts.state ?? this._art.defaultState ?? BUILDING_STATE.IDLE;
    this._phase = 0;
    // FORWARD: BuildingAtlas.has(id) → AnimatedSprite path; else placeholder.
    this._ph = new BuildingPlaceholder(id);
    this._ph.attach(this._art);
    this._fx = new BuildingFx(this._art);
    this._root.addChild(this._ph.view, this._fx.view);
    /** @private {?Sprite} real art, once BuildingArtConfig ships one and it loads */
    this._sprite = null;
    this._apply();
    this._loadSprite();
  }

  /** @returns {Container} scene node — add to the build layer */
  get view() { return this._root; }
  /** @returns {string} */
  get id() { return this._id; }
  /** @returns {number} current level tier, 1..MAX_TIER (GDD 24 "VISUAL TIER SYSTEM") */
  get tier() { return tierOf(this._level); }

  /** @param {Container} parent @param {number} x @param {number} y compound-local px @returns {void} */
  mount(parent, x, y) { this._root.position.set(x, y); parent.addChild(this._root); }

  /** @param {number} n @returns {void} */
  setLevel(n) { if (n === this._level) return; this._level = n; this._ph.setLevel(n); }

  /** @param {?string} v barracks variant @returns {void} */
  setVariant(v) { if (v === this._variant) return; this._variant = v; this._ph.setVariant(v); }

  /** @param {string} s BUILDING_STATE @returns {void} */
  setState(s) { if (s === this._state) return; this._state = s; this._apply(); }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._phase += dt;
    this._ph.update(dt);
    this._fx.update(dt, this._phase);
  }

  /** @private push current level/variant/state into the placeholder + FX */
  _apply() {
    this._ph.setLevel(this._level);
    this._ph.setVariant(this._variant);
    this._ph.setState(this._state);
    this._fx.setState(this._state);
  }

  /**
   * @private One-shot: if `BuildingArtConfig` ships a `sprite` for this id,
   * load it and swap it in for the procedural placeholder (GDD 24 — same spot
   * every real atlas will land in later). FX stays layered on top throughout.
   * Sized/positioned purely from this building's own footprint (BaseGridConfig
   * FOOTPRINT + SquareGrid.footprintFrontAnchor) — NOT from any hand-picked
   * anchor/widthPx — so the art fills exactly its allocated squares, edge to
   * edge, with no overlap or hover (CLAUDE.md "BUILDING VISUAL GUARDRAILS").
   * Assumes the source image is alpha-cropped tight to its own silhouette,
   * captured with the locked-frame camera convention (GDD 24) so its bbox
   * centre and bottom edge line up with the footprint's own diamond.
   */
  _loadSprite() {
    const s = this._art.sprite;
    if (!s) return;
    const { w, h } = footprintOf(this._id);
    const front = footprintFrontAnchor(w, h, CELL_PX);
    Assets.load(s.url).then((tex) => {
      if (this._root.destroyed) return; // torn down before this resolved
      const spr = new Sprite(tex);
      spr.anchor.set(GROUND_ANCHOR.x, GROUND_ANCHOR.y);
      spr.scale.set(front.width / tex.width); // exact footprint diamond width, uniform scale
      spr.position.set(0, front.frontY); // ground the ROI at the footprint's own frontmost point
      this._root.addChildAt(spr, 0); // under the placeholder + FX
      this._ph.view.visible = false;
      this._sprite = spr;
    });
  }

  /** @returns {void} */
  destroy() {
    this._ph.destroy();
    this._fx.destroy();
    this._sprite?.destroy();
    this._root.destroy({ children: true });
  }
}

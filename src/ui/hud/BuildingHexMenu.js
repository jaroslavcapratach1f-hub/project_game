/**
 * BuildingHexMenu — the GDD-23 building tap menu: `BuildingHexOption`s fanned
 * in a row below a title label, anchored on the BUILDING's own world position
 * (Warpath reference: GAME_DESIGN.md/Headquarter.jpeg). WORLD-space, WORLD_UI
 * layer — S54 fix: this used to live on the screen-space HUD layer at a
 * SCREEN point captured once at open(), so panning the camera dragged the
 * menu along with the screen instead of leaving it locked to the building.
 * `BuildingContext` opens this FIRST on a building tap (replacing the old
 * straight-to-Upgrade behaviour); picking an option is up to the caller.
 */
import { Container, Graphics, Text, BlurFilter } from 'pixi.js';
import gsap from 'gsap';
import { BUILDING_MENU } from '../../config/BuildingMenuConfig.js';
import { BuildingHexOption } from './BuildingHexOption.js';
import { clampedMenuWorldPos } from './BuildingHexMenuLayout.js';

const MS = 1000;
const HALF = 0.5;

export class BuildingHexMenu {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    this._root.visible = false;
    // Real scale is set per-open() (divides out zoom — see open()'s own doc);
    // this is just a safe pre-first-open default.
    this._root.scale.set(BUILDING_MENU.scale);
    this._title = new Text({ text: '', style: { fill: BUILDING_MENU.titleColor, fontSize: BUILDING_MENU.titlePx, fontFamily: BUILDING_MENU.fontFamily, fontWeight: 'bold', stroke: { color: BUILDING_MENU.strokeColor, width: BUILDING_MENU.strokePx } } });
    this._title.anchor.set(HALF, 1);
    this._title.position.set(0, -BUILDING_MENU.titleGapPx);
    this._backdrop = new Graphics();
    this._backdrop.filters = [new BlurFilter({ strength: BUILDING_MENU.backdropBlurPx, quality: BUILDING_MENU.backdropBlurQuality })];
    this._root.addChild(this._backdrop, this._title);
    /** @private @type {BuildingHexOption[]} */ this._options = [];
    this._open = false;
    this._onPick = null;
  }

  /** @returns {void} */ enable() { this._renderer.layer('WORLD_UI').addChild(this._root); }
  /** @returns {void} */ disable() { this._clearOptions(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }
  /** @returns {boolean} */ get isOpen() { return this._open; }

  /**
   * @param {{x:number,y:number}} pos WORLD px — the building's own anchor, not the tap
   * @param {string} title e.g. "Lvl 2 Treasury"
   * @param {string[]} actions e.g. ['info','upgrade','manage']
   * @param {(action:string)=>void} onPick
   * @param {import('../../engine/Camera.js').Camera} camera the LIVE camera —
   *   this world-space layer folds `cam.zoom` into its own scale every frame
   *   (Renderer._applyCamera), so a fixed local scale here would make the
   *   menu grow WITH zoom (the original bug, worse the closer in you got).
   *   Dividing zoom back out keeps the menu's SCREEN SIZE at one constant,
   *   always-legible size (`BUILDING_MENU.scale`) regardless of zoom — the
   *   player's own correction: a version of this that SHRUNK at high zoom
   *   stayed technically on-screen but read as "barely visible" illegible
   *   text, which isn't actually visible in any useful sense. A SEPARATE
   *   clamp (`clampedMenuWorldPos`) handles SCREEN POSITION — a
   *   big-footprint building (the HQ) zoomed in close can put the raw world
   *   anchor itself past the viewport edge even at this fixed size; that's
   *   the actual "always visible" fix. Neither the hex fan's own layout nor
   *   the backdrop shape changes here — only this whole-menu scale factor.
   *   Both only need to be right at the moment the menu opens, never
   *   tracked live — `BuildingContext.update()` already closes it the
   *   instant the camera moves at all while it's open. The clamp lives in
   *   `BuildingHexMenuLayout.js` (kept this file under the 150-line cap).
   * @returns {void}
   */
  open(pos, title, actions, onPick, camera) {
    this._clearOptions();
    this._onPick = onPick;
    this._root.scale.set(BUILDING_MENU.scale / camera.zoom);
    this._title.text = title;
    this._title.scale.set(1);
    this._title.scale.set(Math.min(1, (BUILDING_MENU.panel.halfWidth * 2 - BUILDING_MENU.titlePadPx * 2) / this._title.width));
    this._drawBackdrop();
    const M = BUILDING_MENU;
    const n = actions.length;
    const centreIdx = (n - 1) * HALF;
    for (let i = 0; i < n; i++) {
      const opt = new BuildingHexOption(actions[i]);
      // U shape (GAME_DESIGN.md/Headquarter.jpeg): the centre option sits
      // lowest, options curve back UP toward the building the further they
      // are from centre — not the other way round (S54: the first version
      // had this inverted, an upside-down U/arch instead of a U).
      opt.setPosition((i - centreIdx) * M.spacingPx, M.dropPx + (centreIdx - Math.abs(i - centreIdx)) * M.vSpreadPx);
      opt.view.scale.set(0);
      this._root.addChild(opt.view);
      this._options.push(opt);
      gsap.to(opt.view.scale, {
        x: 1, y: 1, duration: M.scaleInMs / MS, delay: (i * M.staggerMs) / MS, ease: M.ease,
      });
    }
    const onScreen = clampedMenuWorldPos(pos, camera, n);
    this._root.position.set(onScreen.x, onScreen.y);
    this._root.visible = true;
    this._open = true;
  }

  /**
   * Route a tap. Fires the matching option's action then closes.
   * @param {number} sx @param {number} sy SCREEN px @returns {boolean} true if an option was hit
   */
  handleTap(sx, sy) {
    if (!this._open) return false;
    // _root sits in WORLD space now (tracks the building as the camera pans
    // AND zooms) — toLocal() runs the tap back through that live transform
    // (position + scale) into the same local units `opt.setPosition` and
    // `hexRadiusPx` are defined in; a plain screen-position subtraction
    // would ignore the zoom factor and mis-hit at anything but zoom 1.
    const local = this._root.toLocal({ x: sx, y: sy });
    const hit = this._options.find((o) => o.contains(local.x, local.y));
    const action = hit?.action;
    const onPick = this._onPick; // close() clears _onPick — capture it first
    this.close();
    if (action) onPick?.(action);
    return Boolean(hit);
  }

  /** @returns {void} */
  close() {
    if (!this._open) return;
    this._open = false;
    this._onPick = null;
    this._root.visible = false;
    this._clearOptions();
  }

  /** @private Curved smoked-glass skirt and a separate dark nameplate. */
  _drawBackdrop() {
    const M = BUILDING_MENU, p = M.panel, w = p.halfWidth;
    this._backdrop.clear().moveTo(-w, p.top)
      .quadraticCurveTo(0, p.innerBottom * 2, w, p.top)
      .lineTo(w, p.top + M.hexRadiusPx * 2)
      .quadraticCurveTo(0, p.outerBottom * 2, -w, p.top + M.hexRadiusPx * 2)
      .closePath().fill({ color: p.color, alpha: p.alpha });
    const tw = this._title.width + M.titlePadPx * 2;
    this._backdrop.rect(-tw * HALF, -M.titleGapPx - M.titleHeightPx, tw, M.titleHeightPx)
      .fill({ color: p.color, alpha: p.alpha });
  }

  /** @private */
  _clearOptions() {
    for (const o of this._options) { gsap.killTweensOf(o.view.scale); o.destroy(); }
    this._options.length = 0;
  }
}

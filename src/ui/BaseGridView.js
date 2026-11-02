/**
 * BaseGridView — the player's base render: a walled SQUARE compound (LAYERS.
 * TERRAIN) + one BuildingSprite per building except live-3D buildings (owned
 * by worldmap/Buildings3D.js — see config/Building3DConfig.js) and the
 * Defence Wall + its corner Attack Towers (owned by DefenceWall3D.js /
 * AttackTowers3D.js — neither IS a single grid cell) on LAYERS.GROUND_UNITS,
 * each anchored at its own footprint centre (BaseGridConfig.FOOTPRINT). The
 * footprint never rescales — `setBlend(t)` is a pure crossfade from
 * BaseSite's camera-zoom LOD. Buildings spring-pop on first reveal and pulse
 * on upgrade (instant, GDD 04). `buildingAt` hit-tests for BuildingContext.
 */
import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { EVENTS } from '../engine/GameEvents.js';
import { clamp, easeInOutQuad } from '../utils/MathUtils.js';
import { BASE } from '../config/BaseConfig.js';
import { footprintOf } from '../config/BaseGridConfig.js';
import { ANIM } from '../config/BuildingArtConfig.js';
import { BUILDING_3D } from '../config/Building3DConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { pxToCellCentre, plotCorners } from '../utils/SquareGrid.js';
import { buildPlatform, cellToPx } from './BaseDraw.js';
import { BuildingSprite } from './base/BuildingSprite.js';

const MS = 1000, HALF = 0.5;
const VIS_EPS = 0.001, REVEAL_AT = 0.04;
// the perimeter + its corner towers — neither is a single grid cell here (own live-3D owners, see BaseSite) — live-3D BUILDING_3D buildings are skipped below too
const PERIMETER_IDS = new Set(['defence_wall', 'attack_towers']);

export class BaseGridView {
  /** @param {import('../engine/Renderer.js').Renderer} renderer @param {import('../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._events = events;
    this._platform = new Graphics();
    this._buildRoot = new Container();
    /** @private @type {Map<string,{box:Container,sprite:BuildingSprite,data:object,idx:number,fp:{w:number,h:number},cx:number,cy:number}>} */
    this._views = new Map();
    this._revealed = false;
    this._onPlaced = (p) => this._place(p);
    this._onUpgraded = (p) => this._patch(p.id, { level: p.level });
    this._onTransformed = (p) => this._patch(p.id, { variant: p.variant });
    this._onMoved = (p) => { const v = this._views.get(p.id); if (v) { v.cx = p.cx; v.cy = p.cy; } };
  }

  /** @param {number} [originX=0] @param {number} [originY=0] world px compound centre @param {number} [hqLevel=1] @returns {void} */
  enable(originX = 0, originY = 0, hqLevel = 1) {
    buildPlatform(this._platform, hqLevel);
    for (const root of [this._platform, this._buildRoot]) root.position.set(originX, originY);
    this._renderer.layer('TERRAIN').addChild(this._platform);
    this._renderer.layer('GROUND_UNITS').addChild(this._buildRoot);
    this._events.on(EVENTS.BUILDING_PLACED, this._onPlaced);
    this._events.on(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    this._events.on(EVENTS.BARRACKS_TRANSFORMED, this._onTransformed);
    this._events.on(EVENTS.BUILDING_MOVED, this._onMoved);
    this.setBlend(0);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.BUILDING_PLACED, this._onPlaced);
    this._events.off(EVENTS.BUILDING_UPGRADED, this._onUpgraded);
    this._events.off(EVENTS.BARRACKS_TRANSFORMED, this._onTransformed);
    this._events.off(EVENTS.BUILDING_MOVED, this._onMoved);
    this._views.forEach((v) => { gsap.killTweensOf(v.box.scale); v.sprite.destroy(); });
    this._platform.parent?.removeChild(this._platform);
    this._platform.destroy();
    this._buildRoot.parent?.removeChild(this._buildRoot);
    this._buildRoot.destroy({ children: true });
    this._views.clear();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this._buildRoot.renderable) return; // zoomed out — nothing to animate
    this._views.forEach((v) => v.sprite.update(dt));
  }

  /** Continuous zoom LOD: no rescale, only alpha; each building's own start point staggers the reveal. @param {number} t 0..1 @returns {void} */
  setBlend(t) {
    const k = clamp(t, 0, 1);
    const L = WORLDMAP.lod;
    const pa = easeInOutQuad(clamp(k / L.wallRevealFrac, 0, 1));
    this._platform.alpha = pa;
    this._platform.renderable = pa > VIS_EPS;
    const n = Math.max(this._views.size, 1);
    this._views.forEach((v) => {
      const start = L.buildingStart + (v.idx / n) * L.buildingSpread;
      const ba = easeInOutQuad(clamp((k - start) / Math.max(1 - start, VIS_EPS), 0, 1));
      v.box.alpha = ba;
      v.box.renderable = ba > VIS_EPS;
    });
    this._buildRoot.renderable = k > VIS_EPS;
    if (!this._revealed && k > REVEAL_AT) { this._revealed = true; this._revealAll(); }
  }

  /** @private @param {{id:string,cx:number,cy:number,level:number}} p */
  _place(p) {
    if (p.id in BUILDING_3D || PERIMETER_IDS.has(p.id)) return; // owned by Buildings3D / DefenceWall3D / AttackTowers3D
    const box = new Container();
    const c = cellToPx(p.cx, p.cy);
    box.position.set(c.x, c.y);
    const fp = footprintOf(p.id);
    const sprite = new BuildingSprite(p.id, { level: p.level });
    box.addChild(sprite.view);
    this._buildRoot.addChild(box);
    const data = { id: p.id, level: p.level, variant: undefined };
    const view = { box, sprite, data, idx: this._views.size, fp, cx: p.cx, cy: p.cy };
    this._views.set(p.id, view);
    box.scale.set(0);
    if (this._revealed) this._popIn(view, 0);
  }
  /** @private staggered scale-in of every building on first reveal */
  _revealAll() {
    this._views.forEach((v) => this._popIn(v, v.idx * ANIM.revealStaggerMs));
  }
  /** @private @param {object} v @param {number} delayMs */
  _popIn(v, delayMs) {
    gsap.killTweensOf(v.box.scale);
    gsap.fromTo(v.box.scale, { x: 0, y: 0 },
      { x: 1, y: 1, duration: ANIM.revealPopMs / MS, delay: delayMs / MS, ease: 'back.out(1.7)' });
  }

  /** @private merge a field into a building, push to its sprite, pulse */
  _patch(id, fields) {
    const v = this._views.get(id);
    if (!v) return;
    Object.assign(v.data, fields);
    if (fields.level !== undefined) v.sprite.setLevel(fields.level);
    if (fields.variant !== undefined) v.sprite.setVariant(fields.variant);
    gsap.killTweensOf(v.box.scale);
    gsap.fromTo(v.box.scale, { x: 1, y: 1 },
      { x: 1.12, y: 1.12, duration: ANIM.upgradePulseMs / MS / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' });
  }

  /** @param {number} wx @param {number} wy world px @returns {?{id:string,level:number}} the tapped building, if any */
  buildingAt(wx, wy) {
    if (!this._buildRoot.renderable) return null;
    const ox = this._buildRoot.position.x, oy = this._buildRoot.position.y;
    const { cx, cy } = pxToCellCentre(wx - ox, wy - oy, BASE.grid.cellPx);
    for (const v of this._views.values()) {
      if (!v.box.renderable) continue;
      if (Math.abs(cx - v.cx) < v.fp.w * HALF && Math.abs(cy - v.cy) < v.fp.h * HALF) {
        return { id: v.data.id, level: v.data.level };
      }
    }
    return null;
  }

  /** @param {string} id @returns {void} no-op if `id` isn't one of ours (S54 BuildingDragController — see BaseSite's dual-owner dispatch). Begin the drag-ghost look: a translucent footprint-diamond overlay, starts "valid" (the current position is always legal) — the lift happens on the first `updateDrag` glide, below */
  beginDrag(id) {
    const v = this._views.get(id);
    if (!v) return;
    v.ghost = new Graphics();
    this._paintGhost(v, true);
    v.box.addChild(v.ghost);
  }

  /** @param {string} id @param {number} cx @param {number} cy @param {boolean} valid @returns {void} eased glide between grid-snapped cells — an instant position.set() on every drag-move read as a teleport, not a hover */
  updateDrag(id, cx, cy, valid) {
    const v = this._views.get(id);
    if (!v?.ghost) return;
    const c = cellToPx(cx, cy);
    gsap.killTweensOf(v.box.position);
    gsap.to(v.box.position, { x: c.x, y: c.y - BASE.dragGhost.liftPx, duration: BASE.dragGhost.easeMs / MS, ease: 'power2.out' });
    this._paintGhost(v, valid);
  }

  /** @param {string} id @returns {void} drop — settle at the true (possibly reverted) position, remove the ghost overlay */
  endDrag(id) {
    const v = this._views.get(id);
    if (!v?.ghost) return;
    gsap.killTweensOf(v.box.position);
    v.box.removeChild(v.ghost);
    v.ghost.destroy();
    v.ghost = null;
    const c = cellToPx(v.cx, v.cy);
    v.box.position.set(c.x, c.y);
  }

  /** @private redraw a view's ghost overlay to its own footprint diamond, green/red @param {object} v @param {boolean} valid */
  _paintGhost(v, valid) {
    const pts = plotCorners(v.fp.w, v.fp.h, BASE.grid.cellPx).flatMap((c) => [c.x, c.y]);
    const color = valid ? BASE.dragGhost.validColor : BASE.dragGhost.invalidColor;
    v.ghost.clear().poly(pts).fill({ color, alpha: BASE.dragGhost.alpha });
  }
}

/**
 * SquadBar — the platoon's 5 deploy-slot buttons (S54), a second row of
 * SEPARATE button cards directly above `NavBar` — same card size/gap/radius
 * (reads `WORLD_HUD.navBar`'s own geometry directly, not a duplicate copy),
 * same right-aligned dock, so it reads as one continuous cluster with it.
 * Each card shows that slot's live unit as a portrait + a weight-class-style
 * short label (`unitShortLabel` — S58, "L"/"M"/"H"/"SH" etc., the user's own
 * call, not the full display name); tapping one selects that squad for orders exactly like
 * tapping it on the map (`BaseArmy.selectSlot`). Screen-space on
 * LAYERS.HUD. No input routing of its own — Hud hit-tests it via `rect` /
 * `slotIndexAt` and calls the army.
 *
 * The portrait fills nearly the WHOLE card (not a small icon-sized disc —
 * that read as barely visible; the player wants to actually recognize the
 * troop at a glance) — a live render of the unit's OWN in-game 3D model
 * (`UnitIconRenderer`, S55: a real snapshot of the SAME asset `Unit3DBody`
 * uses, transparent background — not a separate 2D concept-art photo,
 * which read as an inconsistent flat white square) when the class has a
 * `UNIT_3D` entry, rounded-rect-masked and cover-fit; a flat placeholder
 * colour (`portraitColor`) for every class that doesn't have a 3D model yet.
 * S58: that snapshot is transparent, so `bgImage` (same mask) shows the
 * unit's own faction photo behind it — a glance tells you the country.
 *
 * Selection sync is two-way (S55): tapping a card selects that squad, but
 * selecting the SAME squad a different way (tapping it directly on the
 * map) has to highlight the matching card too — both paths end up calling
 * `OrderController._select`, which emits `ORDER_SELECT`/`ORDER_DESELECT`
 * regardless of how the selection started, so listening for those here
 * keeps the highlight correct no matter which UI (or the map) drove it.
 */
import { Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { EVENTS } from '../../engine/GameEvents.js';
import { WORLD_HUD, portraitColor, unitShortLabel } from '../../config/HudConfig.js';
import { UNIT_3D } from '../../config/Unit3DConfig.js';
import { loadFactionTextures } from './SquadBarFactionBg.js';
import { getUnitIconDataURL } from '../../entities/UnitIconRenderer.js';
import { ALL_UNITS } from '../../config/UnitStats.js';

const HALF = 0.5;
const MS = 1000;
const SLOT_COUNT = 5;
const MASK_FILL = 0xffffff; // opaque — a mask's own colour is irrelevant, only its alpha shape matters
const NOT_FOUND = -1;

export class SquadBar {
  /**
   * @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {import('../../worldmap/BaseArmy.js').BaseArmy} army
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(renderer, army, events) {
    this._renderer = renderer;
    this._army = army;
    this._events = events;
    this._root = new Container();
    /** @private @type {{bg:import('pixi.js').Graphics,bgImage:import('pixi.js').Sprite,
     *   portrait:import('pixi.js').Graphics,mask:import('pixi.js').Graphics,image:import('pixi.js').Sprite,
     *   label:import('pixi.js').Text,color:number,hasImage:boolean}[]} */
    this._btns = [];
    /** @private @type {Object<string,import('pixi.js').Texture>} faction -> loaded bg photo */
    this._factionTex = {};
    /** @private */ this._rect = { x: 0, y: 0, w: 0, h: 0 };
    /** @private */ this._selectedIndex = -1;
    /** @private S78: rolled down + hidden while the base's buildings are interactive */ this._collapsed = false;
    /** @private guards a resolved Assets.load from touching a torn-down button */ this._destroyed = false;
    this._onOrderSelect = (p) => this._syncSelection(p.unitId);
    this._onOrderDeselect = () => this._syncSelection(null);
  }

  /** @returns {{x:number,y:number,w:number,h:number}} bounding row area, screen px */
  get rect() { return this._rect; }

  /** @returns {void} repaint every slot's portrait/label from the live platoon (e.g. once BaseArmy has deployed it) */
  refresh() { this._paintPortraits(); }

  /** @returns {void} */
  enable() {
    const n = WORLD_HUD.navBar, s = WORLD_HUD.squadBar;
    const style = new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: n.labelPx, fill: n.idleColor });
    for (let i = 0; i < SLOT_COUNT; i++) {
      const bg = new Graphics();
      const portrait = new Graphics(); // flat-colour fallback fill, classes with no real art yet
      const mask = new Graphics(); // crops `bgImage`/`image` to the portrait area's rounded rect
      const bgImage = new Sprite(), image = new Sprite(); // faction photo (behind), live 3D snapshot (front)
      bgImage.anchor.set(HALF); bgImage.mask = mask; bgImage.visible = false;
      image.anchor.set(HALF); image.mask = mask; image.visible = false;
      const label = new Text({ text: '', style: style.clone() });
      label.anchor.set(HALF, 0);
      this._btns.push({ bg, bgImage, portrait, mask, image, label, color: s.emptyColor, hasImage: false });
      this._root.addChild(bg, bgImage, portrait, mask, image, label);
    }
    loadFactionTextures()
      .then((tex) => { if (!this._destroyed) { this._factionTex = tex; this._paintPortraits(); } })
      .catch((err) => console.warn('[SquadBar] faction background photos failed to load', err));
    this._paintPortraits();
    this._renderer.layer('HUD').addChild(this._root);
    this._events.on(EVENTS.ORDER_SELECT, this._onOrderSelect);
    this._events.on(EVENTS.ORDER_DESELECT, this._onOrderDeselect);
  }

  /** @returns {void} */
  disable() {
    this._destroyed = true; gsap.killTweensOf(this._root);
    this._events.off(EVENTS.ORDER_SELECT, this._onOrderSelect);
    this._events.off(EVENTS.ORDER_DESELECT, this._onOrderDeselect);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /**
   * @param {{x:number,y:number,w:number,h:number}} navBarRect the row directly below — same x/w, stacked above it
   * @returns {void}
   */
  layout(navBarRect) {
    const n = WORLD_HUD.navBar, s = WORLD_HUD.squadBar;
    this._rect = { x: navBarRect.x, y: navBarRect.y - s.rowGapPx - n.heightPx, w: navBarRect.w, h: n.heightPx };
    this._redrawCards();
  }

  /** @param {number} sx @param {number} sy screen px @returns {number} slot index under the point, or -1 */
  slotIndexAt(sx, sy) {
    if (!this._hit(sx, sy)) return -1;
    const idx = Math.floor((sx - this._rect.x) / (this._rect.w / SLOT_COUNT));
    return Math.max(0, Math.min(SLOT_COUNT - 1, idx));
  }

  /**
   * Select a platoon slot — delegates to `BaseArmy.selectSlot` (same effect
   * as tapping the unit on the map) and highlights that slot's own card.
   * @param {number} index @returns {void}
   */
  selectSlot(index) {
    this._selectedIndex = index;
    this._army.selectSlot(index);
    this._redrawCards();
  }

  /** @param {number} sx @param {number} sy @returns {boolean} */
  hitTest(sx, sy) { return this._hit(sx, sy); }

  /** @param {boolean} collapsed @returns {void} S78: roll down + fade out (or back + fade in) — WorldScene drives this off BaseSite.buildingsInteractive every frame; idempotent, stops hit-testing while collapsed */
  setCollapsed(collapsed) {
    if (this._collapsed === collapsed) return; this._collapsed = collapsed;
    const s = WORLD_HUD.squadBar; gsap.killTweensOf(this._root);
    gsap.to(this._root, { alpha: collapsed ? 0 : 1, y: collapsed ? s.collapseDropPx : 0, duration: s.collapseMs / MS, ease: collapsed ? 'power2.in' : 'power2.out' });
  }

  /** @private */
  _hit(sx, sy) {
    if (this._collapsed) return false;
    const r = this._rect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }

  /**
   * @private a selection changed somewhere (map tap or this bar) — find the
   * matching platoon slot (if the newly selected unit is even IN the
   * platoon; a garrison/enemy unit isn't, and clears the highlight same as
   * a deselect) and repaint if it's actually different from what's shown.
   * @param {?string} unitId
   */
  _syncSelection(unitId) {
    const idx = unitId ? this._army.platoon.findIndex((slot) => slot.id === unitId) : NOT_FOUND;
    if (idx === this._selectedIndex) return;
    this._selectedIndex = idx;
    this._redrawCards();
  }

  /** @private pick which texture/colour each slot's portrait should show (geometry-independent) + its label, from the live platoon */
  _paintPortraits() {
    const s = WORLD_HUD.squadBar;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const slot = this._army.platoon[i], unit = slot && ALL_UNITS[slot.unitKey];
      const b = this._btns[i];
      b.color = unit ? portraitColor(unit.cls) : s.emptyColor;
      b.hasImage = false; b.image.visible = false;
      b.label.text = unit ? unitShortLabel(unit.cls) : s.emptyLabel;
      const bgTex = unit && this._factionTex[unit.faction];
      b.bgImage.visible = !!bgTex; if (bgTex) b.bgImage.texture = bgTex;
      b.portrait.visible = !bgTex; // the faction photo IS the card once it's loaded — flat swatch only while it isn't (or an empty slot)
      const unit3D = unit && UNIT_3D[`${unit.faction}:${unit.cls}`];
      if (unit3D) this._loadPortrait(i, unit3D);
    }
    this._redrawCards();
  }

  /** @private a live snapshot of the unit's OWN 3D model (UnitIconRenderer), not a separate art asset @param {number} i @param {object} unit3D a `UNIT_3D` entry */
  _loadPortrait(i, unit3D) {
    getUnitIconDataURL(unit3D).then((dataUrl) => Assets.load(dataUrl)).then((tex) => {
      if (this._destroyed) return; // torn down before this resolved
      const b = this._btns[i];
      b.image.texture = tex; b.hasImage = true; b.image.visible = true; b.portrait.visible = false;
      this._redrawCards(); // fresh geometry now the texture's real size is known
    });
  }

  /**
   * @private reposition + repaint every card from the current `_rect`
   * (layout, a selection change, or a portrait texture resolving). The
   * portrait fills the card from its own top padding down to a label
   * strip at the bottom — rounded-rect masked, cover-fit (scaled up just
   * enough to cover both dimensions, cropping the overflow) so a real
   * image reads as a proper photo, not a stretched or letterboxed one.
   */
  _redrawCards() {
    const n = WORLD_HUD.navBar, s = WORLD_HUD.squadBar;
    const cell = this._rect.w / SLOT_COUNT, btnW = cell - n.btnGapPx, btnH = n.heightPx - n.btnGapPx;
    const by = this._rect.y + n.btnGapPx * HALF, labelStripH = n.labelPx + n.labelGapPx, imgW = btnW - s.portraitPadPx * 2;
    const imgH = btnH - labelStripH - s.portraitPadPx * 2, imgCy = by + s.portraitPadPx + imgH * HALF, labelY = by + s.portraitPadPx + imgH + n.labelGapPx;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const bx = this._rect.x + cell * i + n.btnGapPx * HALF;
      const cx = bx + btnW * HALF;
      const b = this._btns[i];
      b.mask.clear().roundRect(-imgW * HALF, -imgH * HALF, imgW, imgH, s.portraitRadiusPx).fill(MASK_FILL);
      b.mask.position.set(cx, imgCy);
      b.portrait.clear().roundRect(-imgW * HALF, -imgH * HALF, imgW, imgH, s.portraitRadiusPx).fill(b.color);
      b.portrait.position.set(cx, imgCy);
      b.bgImage.position.set(cx, imgCy);
      if (b.bgImage.visible) b.bgImage.scale.set(Math.max(imgW / b.bgImage.texture.width, imgH / b.bgImage.texture.height));
      b.image.position.set(cx, imgCy);
      if (b.hasImage) b.image.scale.set(Math.max(imgW / b.image.texture.width, imgH / b.image.texture.height));
      b.label.position.set(cx, labelY);
      this._paintButtonBg(i, bx, by, btnW, btnH);
    }
  }

  /** @private one button's own rounded-rect card, highlighted if selected @param {number} i @param {number} x @param {number} y @param {number} w @param {number} h */
  _paintButtonBg(i, x, y, w, h) {
    const n = WORLD_HUD.navBar;
    const active = i === this._selectedIndex;
    this._btns[i].bg.clear()
      .roundRect(x, y, w, h, n.btnRadiusPx)
      .fill({ color: n.btnBg, alpha: active ? n.activeBtnBgAlpha : n.btnBgAlpha })
      .stroke({
        color: active ? n.activeBtnStroke : n.btnStroke,
        width: active ? n.activeBtnStrokeWidthPx : n.btnStrokeWidthPx,
        alpha: active ? 1 : n.btnStrokeAlpha,
      });
  }
}

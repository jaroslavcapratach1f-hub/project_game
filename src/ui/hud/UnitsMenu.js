/**
 * UnitsMenu — the NavBar "UNITS" tab's own full-screen "Ground Force" style
 * card grid (the player's own reference screenshot): a back button (top
 * left — the ONLY way to close it; more functions live on this screen, so
 * an anywhere-tap-closes gesture would fight them), a row of filter tabs
 * (`UnitsFilterBar` — All / USA / German / Russian Troops / Blueprints &
 * Materials, the player's own explicit ask) docked at the BOTTOM like
 * NavBar itself, and a scrollable grid of every matching roster entry
 * (`BASE.army.roster`) as a `UnitCard`, sorted by star tier highest-first.
 * Tapping a card opens `TroopDetailScreen` for that troop (drawn on top,
 * this screen's own taps are skipped while it's open). Full-screen on
 * LAYERS.OVERLAY; a drag that STARTS inside the grid scrolls it (claimed
 * here directly off INPUT_DRAG_*, the same gesture channel
 * `BuildingDragController` uses — `WorldScene.isDraggingHud()` tells
 * `Game._wireInput` to skip its own camera-pan fallback while a scroll is
 * in progress).
 */
import { drawTroopSurface } from './TroopMenuDraw.js';
import { TROOP_MENU as T } from '../../config/TroopMenuTheme.js';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, screenSidePad } from '../../config/HudConfig.js';
import { BASE } from '../../config/BaseConfig.js';
import { ALL_UNITS } from '../../config/UnitStats.js';
import { loadFactionTextures } from './SquadBarFactionBg.js';
import { UnitCard } from './UnitCard.js';
import { UnitsFilterBar } from './UnitsFilterBar.js';
import { BackButton } from './BackButton.js';
import { TroopDetailScreen } from './TroopDetailScreen.js';
import { ScrollDrag } from './ScrollDrag.js';

const HALF = 0.5;
const MASK_FILL = 0xffffff; // opaque — a mask's own colour is irrelevant, only its alpha shape matters

/** @returns {{key:string,unit:object,deployed:boolean}[]} the player's roster, highest star first */
function rosterEntries() {
  const list = BASE.army.roster.map((key, i) => ({ key, unit: ALL_UNITS[key], deployed: i < BASE.army.deploySlots }));
  return list.sort((a, b) => b.unit.star - a.unit.star);
}

export class UnitsMenu {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._events = events;
    this._root = new Container();
    this._root.visible = false;
    this._bg = new Graphics();
    this._headerLine = new Graphics();
    this._back = new BackButton();
    this._title = null;
    this._placeholder = null;
    this._filterBar = new UnitsFilterBar();
    this._gridMask = new Graphics();
    this._gridInner = new Container();
    this._gridInner.mask = this._gridMask;
    /** @private @type {UnitCard[]} */ this._cards = [];
    this._detail = new TroopDetailScreen(renderer, events);
    this._filterId = WORLD_HUD.unitsMenu.filters[0].id;
    this._open = false;
    this._w = 0; this._h = 0;
    this._viewport = { x: 0, y: 0, w: 0, h: 0 };
    this._scroll = new ScrollDrag(events,
      () => (this._open && !this._detail.isOpen ? this._viewport : null),
      (y) => this._gridInner.position.set(this._viewport.x, this._viewport.y + y));
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */
  isDraggingScroll() { return this._scroll.isDragging || this._detail.isDraggingScroll(); }

  /** @returns {void} */
  enable() {
    const m = WORLD_HUD.unitsMenu, fam = WORLD_HUD.fontFamily;
    this._title = new Text({ text: 'GROUND FORCES', style: new TextStyle({ fontFamily: fam, fontSize: m.titlePx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._title.anchor.set(0, HALF);
    this._subtitle = new Text({ text: `${this._cards.length || BASE.army.roster.length} UNITS  /  COMMAND ROSTER`, style: new TextStyle({ fontFamily: fam, fontSize: T.subtitlePx, fill: T.brass, letterSpacing: 1 }) });
    this._placeholder = new Text({ text: m.placeholderText, style: new TextStyle({ fontFamily: fam, fontSize: m.titlePx, fill: WORLD_HUD.dimColor }) });
    this._placeholder.anchor.set(HALF);
    this._cards = rosterEntries().map((e) => new UnitCard(e));
    this._gridInner.addChild(...this._cards.map((c) => c.view));
    this._root.addChild(this._bg, this._headerLine, this._back.bg, this._back.icon, this._title, this._subtitle,
      this._filterBar.view, this._gridMask, this._gridInner, this._placeholder);
    this._renderer.layer('OVERLAY').addChild(this._root);
    this._detail.enable();
    this._scroll.enable();
    loadFactionTextures()
      .then((tex) => { for (const c of this._cards) if (tex[c.faction]) c.setFactionBg(tex[c.faction]); })
      .catch((err) => console.warn('[UnitsMenu] faction background photos failed to load', err));
  }

  /** @returns {void} */
  disable() {
    this._scroll.disable();
    this._detail.disable();
    for (const c of this._cards) c.markDestroyed();
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} screenWidth @param {number} screenHeight @returns {void} */
  layout(screenWidth, screenHeight) {
    this._w = screenWidth; this._h = screenHeight;
    const m = WORLD_HUD.unitsMenu;
    // LEFT/RIGHT only — wider in landscape so a phone's camera cutout
    // can't cover the first card or the back button (the player's own
    // report); top/bottom keep the plain gridPadPx gap.
    const sidePad = screenSidePad(screenWidth, screenHeight);
    drawTroopSurface(this._bg, screenWidth, screenHeight);
    this._headerLine.clear().rect(0, m.headerPx, screenWidth, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: 0.5 });
    this._back.layout(sidePad, (m.headerPx - m.backSizePx) * HALF);
    this._title.position.set(sidePad + m.backSizePx + m.titleGapPx, T.titleY);
    this._subtitle.position.set(sidePad + m.backSizePx + m.titleGapPx, T.subtitleY);
    // Filter tabs dock at the BOTTOM (the player's own call — same dock
    // edge NavBar itself uses "on the map"), not under the header — the
    // grid fills everything between the header and this bottom bar.
    const tabY = screenHeight - m.gridPadPx - m.tabBarPx;
    this._filterBar.layout(sidePad, tabY, screenWidth - sidePad * 2);
    const gridY = m.headerPx + m.gridPadPx;
    this._viewport = { x: sidePad, y: gridY, w: screenWidth - sidePad * 2, h: tabY - m.tabBarPadTopPx - gridY };
    this._gridMask.clear().rect(this._viewport.x, this._viewport.y, this._viewport.w, this._viewport.h).fill(MASK_FILL);
    this._reflowGrid();
    this._detail.layout(screenWidth, screenHeight);
  }

  /** @returns {void} */
  open() { this._open = true; this._root.visible = true; }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; this._detail.close(); }

  /**
   * Route a tap: `TroopDetailScreen` (if open) takes every tap first; else
   * the back button closes the screen, a filter tab switches the grid, and
   * a card opens its detail screen.
   * @param {number} sx @param {number} sy @returns {void}
   */
  handleTap(sx, sy) {
    if (!this._open) return;
    if (this._detail.isOpen) {
      this._detail.handleTap(sx, sy);
      this._root.visible = !this._detail.isOpen;
      if (this._root.visible) this._reflowGrid(); // it just closed itself (back button) — show the grid again
      return;
    }
    if (this._back.hit(sx, sy)) { this.close(); return; }
    const filterId = this._filterBar.idAt(sx, sy);
    if (filterId && filterId !== this._filterId) {
      this._filterId = filterId;
      this._filterBar.setActive(filterId);
      this._scroll.reset();
      this._reflowGrid();
      return;
    }
    const card = this._cardAt(sx, sy);
    if (card) { this._detail.open(card.entry); this._root.visible = false; } // TroopDetailScreen is its own sibling screen, not a child — hide the grid so it doesn't ghost through underneath
  }

  /** @private @param {number} sx @param {number} sy @returns {?UnitCard} the visible card under this screen point, if any */
  _cardAt(sx, sy) {
    const v = this._viewport;
    if (sx < v.x || sx > v.x + v.w || sy < v.y || sy > v.y + v.h) return null;
    const lx = sx - this._gridInner.position.x, ly = sy - this._gridInner.position.y;
    for (const c of this._cards) {
      if (!c.view.visible || !c.gridRect) continue;
      const r = c.gridRect;
      if (lx >= r.x && lx <= r.x + r.w && ly >= r.y && ly <= r.y + r.h) return c;
    }
    return null;
  }

  /** @private size + place every VISIBLE card in the grid, clamp scroll to the new content height */
  _reflowGrid() {
    const m = WORLD_HUD.unitsMenu, v = this._viewport;
    const filter = m.filters.find((f) => f.id === this._filterId);
    this._placeholder.visible = Boolean(filter.placeholder);
    if (filter.placeholder) this._placeholder.position.set(v.x + v.w * HALF, v.y + v.h * HALF);
    const visible = filter.placeholder ? [] : this._cards.filter((c) => filter.faction === null || c.faction === filter.faction);
    for (const c of this._cards) c.view.visible = visible.includes(c);
    let cols = Math.max(m.minCols, Math.floor((v.w + m.cardGapPx) / (m.cardMinWidthPx + m.cardGapPx)));
    let cardW = (v.w - m.cardGapPx * (cols - 1)) / cols;
    if (cardW > m.cardMaxWidthPx) {
      cols = Math.ceil((v.w + m.cardGapPx) / (m.cardMaxWidthPx + m.cardGapPx));
      cardW = (v.w - m.cardGapPx * (cols - 1)) / cols;
    }
    const rowH = cardW + m.nameHeightPx;
    for (let i = 0; i < visible.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      visible[i].resize(cardW);
      const rect = { x: col * (cardW + m.cardGapPx), y: row * (rowH + m.cardGapPx), w: cardW, h: rowH };
      visible[i].view.position.set(rect.x, rect.y);
      visible[i].gridRect = rect;
    }
    const rows = Math.ceil(visible.length / cols);
    const contentH = rows > 0 ? rows * rowH + (rows - 1) * m.cardGapPx : 0;
    this._scroll.setBounds(Math.min(0, v.h - contentH));
    this._gridInner.position.set(v.x, v.y + this._scroll.y);
  }
}

/**
 * BarracksDetailScreen — opened by the map's "View" action on a Military
 * Barracks (replaces the old small "Change Production" blind-cycle panel).
 * Rebuilt against the player's own 2 Warpath reference screenshots (see
 * `BuildingScreenConfig.js`'s own doc on this rebuild) — FULL-SCREEN on
 * `LAYERS.OVERLAY` (`TroopDetailScreen`'s own shell: `drawTroopSurface` +
 * a docked header, not a centered scrim+card dialog), header + hero/officer
 * row fixed-height, only the grid+stats column below scrolls — so the
 * screen's own size never changes switching between troops (the player's
 * own standing correction).
 *
 * Two-step assign flow (the player's own standing design): a barracks
 * always shows its CURRENTLY ASSIGNED unit with a red REMOVE button.
 * Tapping REMOVE only clears this screen's own LOCAL state (`_emptied`) —
 * it never touches `BaseManager` — showing an empty hero and a green,
 * disabled ASSIGN button. Tapping a unit card while emptied marks it the
 * pending candidate (enables ASSIGN); tapping ASSIGN is the one moment
 * `BaseManager.setBarracksProduction` is actually called. Outside that
 * flow, tapping ANY card just previews its real stats below the grid
 * (`_previewKey`) without disturbing the committed assignment.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, screenSidePad } from '../../config/HudConfig.js';
import { BARRACKS_DETAIL as C } from '../../config/BuildingScreenConfig.js';
import { drawTroopSurface } from './TroopMenuDraw.js';
import { label as barracksLabel } from '../../systems/DynamicBarracks.js';
import { rosterEntryFor } from './ArmyBarrackTile.js';
import { BackButton } from './BackButton.js';
import { BarracksHeroPreview } from './BarracksHeroPreview.js';
import { BarracksOfficerSlots } from './BarracksOfficerSlots.js';
import { BarracksUnitGrid } from './BarracksUnitGrid.js';
import { ScrollDrag } from './ScrollDrag.js';

const HALF = 0.5;
const BARRACKS_ID = 'barracks';
const MASK_FILL = 0xffffff;

export class BarracksDetailScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._open = false;
    this._index = null; this._mgr = null;
    this._emptied = false; this._previewKey = null;
    this._w = 0; this._h = 0;
    this._gridX = 0; this._contentH = 0;
    this._midRect = { x: 0, y: 0, w: 0, h: 0 };
    this._root = new Container(); this._root.visible = false;
    this._bg = new Graphics();
    this._back = new BackButton();
    const fam = WORLD_HUD.fontFamily, hd = C.header;
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: hd.titlePx, fill: hd.titleColor, fontWeight: 'bold' }) });
    this._headerLine = new Graphics();
    this._hero = new BarracksHeroPreview();
    this._officers = new BarracksOfficerSlots();
    this._sectionTitle = new Text({ text: 'UNIT SELECTION', style: new TextStyle({ fontFamily: fam, fontSize: C.sectionTitlePx, fill: C.sectionTitleColor, fontWeight: 'bold' }) });
    this._rule = new Graphics();
    this._midMask = new Graphics();
    this._midInner = new Container(); this._midInner.mask = this._midMask;
    this._grid = new BarracksUnitGrid();
    this._midInner.addChild(this._grid.view);
    this._root.addChild(this._bg, this._back.bg, this._back.icon, this._title, this._headerLine,
      this._hero.view, this._officers.view, this._sectionTitle, this._rule, this._midMask, this._midInner);
    this._scroll = new ScrollDrag(events, () => (this._open ? this._midRect : null), (y) => { this._midInner.position.y = this._midRect.y + y; });
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }
  /** @returns {boolean} the mid column is mid-scroll-drag — Game suppresses camera-pan */
  isDraggingScroll() { return this._scroll.isDragging; }

  /** @returns {void} */
  enable() { this._renderer.layer('OVERLAY').addChild(this._root); this._scroll.enable(); }
  /** @returns {void} */
  disable() { this._scroll.disable(); this._grid.destroy(); this._hero.markDestroyed(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /** @param {number} w @param {number} h @returns {void} */
  layout(w, h) {
    this._w = w; this._h = h;
    if (this._index !== null) this._reflow();
  }

  /** @param {number} index this barracks' own TRUE index in BaseManager.buildings @param {object} mgr a BaseManager @returns {void} */
  open(index, mgr) {
    this._index = index; this._mgr = mgr;
    const committed = this._committed();
    this._emptied = false; this._previewKey = committed?.key ?? null;
    this._scroll.reset();
    this._reflow();
    this._open = true; this._root.visible = true;
  }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} true if this tap was consumed */
  handleTap(sx, sy) {
    if (!this._open) return false;
    if (this._back.hit(sx, sy)) { this.close(); return true; }
    if (this._hero.hitAction(sx, sy)) { this._pressAction(); return true; }
    const v = this._midRect;
    if (sx >= v.x && sx <= v.x + v.w && sy >= v.y && sy <= v.y + v.h) {
      const lx = sx - this._gridX, ly = sy - (v.y + this._scroll.y);
      const tapped = this._grid.entryAt(lx, ly);
      if (tapped) { this._previewKey = tapped.key; this._reflow(); }
    }
    return true;
  }

  /** @private REMOVE (local-only) or ASSIGN (commits the pending preview pick) */
  _pressAction() {
    if (!this._emptied) { this._emptied = true; this._previewKey = null; this._reflow(); return; }
    const picked = this._previewKey ? this._grid.entryFor(this._previewKey) : null;
    if (!picked) return; // ASSIGN shown but disabled until a pick exists — hitAction already guards this, belt and braces
    this._mgr.setBarracksProduction(this._index, picked.unit.cls);
    this._emptied = false;
    this._reflow();
  }

  /** @private @returns {?{key:string,unit:object}} the barracks' real current assignment */
  _committed() {
    const b = this._mgr.buildings[this._index];
    return b ? rosterEntryFor(b.produces) : null;
  }

  /** @private rebuild everything from the barracks' CURRENT real state + this screen's own local pick state */
  _reflow() {
    const committed = this._committed();
    const preview = this._previewKey ? this._grid.entryFor(this._previewKey) : null;
    this._title.text = `No. ${this._barracksNumber()} ${barracksLabel(this._mgr.buildings[this._index]?.variant)}`;
    this._hero.setEntry(this._emptied ? preview : committed);
    this._hero.setAction(this._emptied ? 'assign' : 'remove', Boolean(preview));
    this._grid.setHighlight(this._previewKey);
    this._layoutScreen();
  }

  /** @private @returns {number} this barracks' own 1-based position among barracks only */
  _barracksNumber() {
    return this._mgr.buildings.slice(0, this._index + 1).filter((x) => x.id === BARRACKS_ID).length;
  }

  /** @private shared header chrome, then dispatches to the landscape/portrait body (the reference's own two different splits — see each branch's own doc) */
  _layoutScreen() {
    const w = this._w, h = this._h, hd = C.header, um = WORLD_HUD.unitsMenu;
    drawTroopSurface(this._bg, w, h);
    const sidePad = screenSidePad(w, h);
    this._headerLine.clear().rect(0, hd.heightPx, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: 0.5 });
    this._back.layout(sidePad, (hd.heightPx - um.backSizePx) * HALF);
    this._title.position.set(sidePad + um.backSizePx + hd.badgeGapPx, (hd.heightPx - hd.titlePx) * HALF);
    const top = hd.heightPx + 14;
    if (w > h) this._layoutLandscape(sidePad, top, w, h);
    else this._layoutPortrait(sidePad, top, w, h);
  }

  /** @private LEFT: hero stacked above a side-by-side officer row. RIGHT: its own "UNIT SELECTION" + scrolling grid/stats column, top-aligned with the hero. @param {number} sidePad @param {number} top @param {number} w @param {number} h */
  _layoutLandscape(sidePad, top, w, h) {
    const heroW = Math.min(C.hero.maxWidthPx, w * C.hero.widthFracLandscape);
    const heroH = this._hero.layout(sidePad, top, heroW);
    const offY = top + heroH + 16;
    this._officers.layout(sidePad, offY, heroW, Math.min(h - offY - 16, C.officer.landscapeHPx), true);
    const rightX = sidePad + heroW + 20, rightW = w - rightX - sidePad;
    this._sectionTitle.position.set(rightX, top);
    const ruleY = top + C.sectionTitlePx + C.sectionGapPx;
    this._rule.clear().rect(rightX, ruleY, rightW, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha });
    this._finishMid(rightX, ruleY + 12, rightW, h - (ruleY + 12) - 16);
  }

  /** @private hero + officer row side by side; "UNIT SELECTION" + the scrolling grid/stats column full-width below both. @param {number} sidePad @param {number} top @param {number} w @param {number} h */
  _layoutPortrait(sidePad, top, w, h) {
    const heroW = Math.min(C.hero.maxWidthPx, w * C.hero.widthFrac);
    const heroH = this._hero.layout(sidePad, top, heroW);
    const officersX = sidePad + heroW + 14;
    this._officers.layout(officersX, top, w - sidePad - officersX, heroH, false);
    const y = top + heroH + 16;
    this._sectionTitle.position.set(sidePad, y);
    const ruleY = y + C.sectionTitlePx + C.sectionGapPx;
    this._rule.clear().rect(sidePad, ruleY, w - sidePad * 2, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha });
    this._finishMid(sidePad, ruleY + 12, w - sidePad * 2, h - (ruleY + 12));
  }

  /** @private lay out the grid+stats column inside the given scroll viewport @param {number} x @param {number} y @param {number} w @param {number} h */
  _finishMid(x, y, w, h) {
    this._midRect = { x, y, w, h };
    this._midMask.clear().rect(x, y, w, h).fill(MASK_FILL);
    this._gridX = x;
    this._contentH = this._grid.layout(x, 0, w) + 24;
    this._scroll.setBounds(Math.min(0, h - this._contentH));
    this._midInner.position.set(0, y + this._scroll.y);
  }
}

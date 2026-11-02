/** Troop detail, scrollable stats and a fixed Upgrade action above the tab bar. */
import { drawTroopSurface } from './TroopMenuDraw.js';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, screenSidePad, unitLabel } from '../../config/HudConfig.js';
import { troopLevel, upgradeTroop } from '../../worldmap/troopLevels.js';
import { TroopDetailHeader } from './TroopDetailHeader.js';
import { TroopHeroImage } from './TroopHeroImage.js';
import { TroopUpgradeDock } from './TroopUpgradeDock.js';
import { TroopUpgradeContent } from './TroopUpgradeContent.js';
import { TroopActionBar } from './TroopActionBar.js';
import { ScrollDrag } from './ScrollDrag.js';

const HALF = 0.5;
const MASK_FILL = 0xffffff; // opaque — a mask's own colour is irrelevant, only its alpha shape matters
const UPGRADE_TAB = 'upgrade';

export class TroopDetailScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._root = new Container();
    this._root.visible = false;
    this._open = false;
    this._bg = new Graphics();
    this._header = new TroopDetailHeader();
    this._hero = new TroopHeroImage();
    this._midMask = new Graphics();
    this._midInner = new Container();
    this._midInner.mask = this._midMask;
    this._content = new TroopUpgradeContent();
    this._upgrade = new TroopUpgradeDock();
    this._placeholder = null;
    this._actions = new TroopActionBar();
    this._entry = null;
    this._tab = UPGRADE_TAB;
    this._heroH = 0; this._midRect = { x: 0, y: 0, w: 0, h: 0 };
    this._w = 0; this._h = 0;
    this._scroll = new ScrollDrag(events,
      () => (this._open ? this._midRect : null),
      (y) => { this._midInner.position.y = this._midRect.y + y; });
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */
  isDraggingScroll() { return this._scroll.isDragging; }
  /** @returns {void} */
  enable() {
    const fam = WORLD_HUD.fontFamily, u = WORLD_HUD.unitsMenu;
    this._placeholder = new Text({ text: u.placeholderText, style: new TextStyle({ fontFamily: fam, fontSize: u.titlePx, fill: WORLD_HUD.dimColor }) });
    this._placeholder.anchor.set(HALF, 0);
    this._midInner.addChild(this._content.view, this._placeholder);
    this._root.addChild(this._bg, this._header.view, this._hero.view, this._midMask, this._midInner, this._upgrade.view, this._actions.view);
    this._renderer.layer('OVERLAY').addChild(this._root);
    this._scroll.enable();
  }

  /** @returns {void} */
  disable() { this._scroll.disable(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }
  /** @param {number} w @param {number} h @returns {void} */
  layout(w, h) {
    this._w = w; this._h = h;
    const u = WORLD_HUD.unitsMenu, m = WORLD_HUD.troopDetail;
    const sidePad = screenSidePad(w, h);
    drawTroopSurface(this._bg, w, h);
    this._header.layout(w, sidePad);
    const barY = h - u.gridPadPx - m.actionBarPx;
    this._actions.layout(sidePad, barY, w - sidePad * 2);
    this._upgrade.view.visible = this._tab === UPGRADE_TAB;
    const dockH = this._upgrade.view.visible ? this._upgrade.layout(sidePad, barY - u.tabBarPadTopPx,
      w - sidePad * 2, this._entry ? troopLevel(this._entry.key) : 1, m.levelCapPlaceholder) : 0;
    const contentBottom = barY - u.tabBarPadTopPx - dockH, heroTop = m.headerPx;
    const landscape = w > h;
    let contentH = 0;
    if (landscape) {
      const heroW = w * m.heroFracLandscape;
      this._heroH = contentBottom - heroTop;
      this._hero.resize(heroW, this._heroH);
      this._hero.view.position.set(0, heroTop);
      this._midRect = { x: heroW + m.midGapPx, y: heroTop, w: w - heroW - m.midGapPx - sidePad, h: this._heroH };
      if (this._entry) contentH = this._layoutContent(this._midRect.w);
    } else {
      const avail = contentBottom - heroTop, maxHeroH = h * m.heroFracPortrait;
      contentH = this._entry ? this._layoutContent(w) : 0;
      this._heroH = this._entry ? Math.max(m.heroMinPx, Math.min(maxHeroH, avail - contentH)) : maxHeroH;
      this._hero.resize(w, this._heroH);
      this._hero.view.position.set(0, heroTop);
      this._midRect = { x: 0, y: heroTop + this._heroH, w, h: avail - this._heroH };
    }
    this._midMask.clear().rect(this._midRect.x, this._midRect.y, this._midRect.w, this._midRect.h).fill(MASK_FILL);
    this._scroll.setBounds(Math.min(0, this._midRect.h - contentH));
    this._midInner.position.set(this._midRect.x, this._midRect.y + this._scroll.y);
  }

  /** @param {{key:string,unit:object,deployed:boolean}} entry @returns {void} */
  open(entry) {
    this._entry = entry;
    this._tab = UPGRADE_TAB;
    this._actions.setActive(UPGRADE_TAB);
    this._header.setName(unitLabel(entry.unit.cls, entry.unit.faction));
    this._hero.load(entry);
    this._content.setUnit(entry, troopLevel(entry.key));
    this._open = true;
    this._root.visible = true;
    this._scroll.reset();
    this.layout(this._w, this._h);
  }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }
  /** @param {number} sx @param {number} sy @returns {void} back closes, a tab switches content, Upgrade's own button bumps level */
  handleTap(sx, sy) {
    if (this._header.hit(sx, sy)) { this.close(); return; }
    if (this._tab === UPGRADE_TAB && this._upgrade.hit(sx, sy)) { this._pressUpgrade(); return; }
    const id = this._actions.idAt(sx, sy);
    if (!id || id === this._tab) return;
    this._tab = id;
    this._actions.setActive(id);
    this._scroll.reset();
    this.layout(this._w, this._h);
  }

  /** @private bump the troop's level (capped) and refresh what's on screen */
  _pressUpgrade() {
    const m = WORLD_HUD.troopDetail;
    if (troopLevel(this._entry.key) >= m.levelCapPlaceholder) return;
    const level = upgradeTroop(this._entry.key, m.levelCapPlaceholder);
    this._content.setUnit(this._entry, level);
    this.layout(this._w, this._h);
  }
  /** @private show/hide the active tab's content and lay it out @param {number} w screen width (portrait) or right column width (landscape) @returns {number} content height needed */
  _layoutContent(w) {
    const u = WORLD_HUD.unitsMenu, m = WORLD_HUD.troopDetail;
    const padX = u.gridPadPx;
    const isUpgrade = this._tab === UPGRADE_TAB;
    this._content.view.visible = isUpgrade;
    this._placeholder.visible = !isUpgrade;
    if (!isUpgrade) {
      this._placeholder.position.set(w * HALF, m.contentGapPx);
      return m.contentGapPx + u.titlePx + m.contentGapPx;
    }
    const level = troopLevel(this._entry.key);
    return this._content.layout({ x: padX, y: m.contentGapPx, w: w - padX * 2 }, { level, cap: m.levelCapPlaceholder });
  }
}

/**
 * ProductionScreen — the Factory's full Production menu (master-task:
 * "that's how production menu should look like"). Centered scrim+card
 * shell, same convention as `BuildingLevelInfoScreen` (title + ✕ close).
 * One Workshop tab per unlocked slot (`EngineeringCenter.workshopCount` —
 * Lv1/4/18/22), each its own independent queue; a scrollable material
 * picker (locked tiers greyed); the selected material's detail + Produce.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { PRODUCTION_SCREEN as S } from '../../config/ProductionScreenConfig.js';
import { ProductionQueuePanel } from './ProductionQueuePanel.js';
import { ProductionMaterialPicker } from './ProductionMaterialPicker.js';
import { ProductionMaterialDetail } from './ProductionMaterialDetail.js';

const HALF = 0.5;

export class ProductionScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._open = false;
    this._w = 0; this._h = 0;
    this._root = new Container(); this._root.visible = false;
    this._scrim = new Graphics();
    this._card = new Container();
    this._cardBg = new Graphics();
    const fam = WORLD_HUD.fontFamily;
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: S.titlePx, fill: S.titleColor, fontWeight: 'bold' }) });
    this._xBg = new Graphics();
    this._xLabel = new Text({ text: '✕', style: new TextStyle({ fontFamily: fam, fontSize: 13, fill: WORLD_HUD.dimColor }) });
    this._xLabel.anchor.set(HALF);
    /** @private @type {{bg:Graphics,label:Text}[]} */ this._tabs = [];
    this._queue = new ProductionQueuePanel(events);
    this._picker = new ProductionMaterialPicker(events);
    this._detail = new ProductionMaterialDetail();
    this._card.addChild(this._cardBg, this._title, this._xBg, this._xLabel);
    // _queue/_picker/_detail each draw themselves in TRUE absolute screen
    // coordinates (their own hit-testing — and ScrollDragX's real pointer
    // events — need that), so they're siblings of `_card` here, NOT its
    // children: `_card` carries its own centering transform, and nesting
    // them inside it double-applies that offset on top of their own math.
    this._root.addChild(this._scrim, this._card, this._queue.view, this._picker.view, this._detail.view);
    this._rect = { x: 0, y: 0, w: 0, h: 0 }; this._xRect = { x: 0, y: 0, w: 0, h: 0 };
    this._activeSlot = 0;
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }
  /** @returns {boolean} a sub-scroll drag is in progress — Game suppresses camera-pan */
  isDraggingScroll() { return this._picker.isDragging || this._queue.isDragging; }

  /** @returns {void} */
  enable() { this._renderer.layer('OVERLAY').addChild(this._root); this._picker.enable(); this._queue.enable(); }
  /** @returns {void} */
  disable() { this._picker.disable(); this._queue.disable(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /** @param {number} w @param {number} h @returns {void} */
  layout(w, h) { this._w = w; this._h = h; this._scrim.clear().rect(0, 0, w, h).fill({ color: WORLD_HUD.panel.scrim, alpha: WORLD_HUD.panel.scrimAlpha }); this._card.position.set(w * HALF, h * HALF); if (this._open) this._reflow(); }

  /**
   * @param {number} index Factory's own index in BaseManager.buildings
   * @param {string} name display name
   * @param {import('../../systems/EngineeringCenter.js').EngineeringCenter} engineering
   * @param {import('../../systems/ResourceManager.js').ResourceManager} resources
   * @returns {void}
   */
  open(index, name, engineering, resources) {
    this._index = index; this._name = name; this._engineering = engineering; this._resources = resources;
    this._activeSlot = 0;
    this._open = true; this._root.visible = true;
    this._reflow();
  }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /** @returns {void} live countdown + queue-completion — call every frame while open */
  refresh() { if (this._open) this._reflow(); }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} */
  handleTap(sx, sy) {
    if (!this._open) return false;
    if (!within(this._rect, sx, sy) || within(this._xRect, sx, sy)) { this.close(); return true; }
    const tab = this._tabs.findIndex((_, i) => within(this._tabRect(i), sx, sy));
    if (tab >= 0) { this._activeSlot = tab; this._reflow(); return true; }
    const strip = this._queue.hitTest(sx, sy);
    if (strip === 'clear') this._engineering.clear(this._index, this._activeSlot);
    else if (strip === 'rush') this._engineering.rush(this._index, this._activeSlot);
    else if (typeof strip === 'number') this._engineering.removeAt(this._index, this._activeSlot, strip);
    const picked = this._picker.hitTest(sx, sy);
    if (picked) this._picker.select(picked);
    if (this._detail.hitTest(sx, sy)) this._engineering.enqueue(this._index, this._activeSlot, this._picker.selected);
    this._reflow();
    return true;
  }

  /**
   * @private Landscape (wider than tall — a real phone turned sideways,
   * the player's own explicit check) uses a genuinely different TWO-COLUMN
   * layout — queue on the left, material picker + detail stacked on the
   * right — matching the player's own landscape reference exactly, not
   * just a squashed copy of the portrait stack (which doesn't fit a short
   * landscape viewport at all).
   */
  _reflow() {
    const landscape = this._w > this._h;
    const widthPx = landscape ? Math.min(this._w - 32, 680) : S.widthPx;
    const h = this._h * (landscape ? 0.9 : S.heightFrac);
    const top = -h * HALF, left = -widthPx * HALF + S.padPx, w = widthPx - S.padPx * 2;
    this._cardBg.clear().roundRect(-widthPx * HALF, top, widthPx, h, S.radiusPx).fill({ color: WORLD_HUD.panel.cardBg }).stroke({ color: WORLD_HUD.panel.cardStroke, width: WORLD_HUD.panel.cardStrokeWidthPx });
    this._title.text = `${this._name} — Production`;
    this._title.position.set(left, top + S.headerPx * HALF - this._title.height * HALF);
    const xCx = widthPx * HALF - S.padPx - S.btnSizePx * HALF, xCy = top + S.headerPx * HALF;
    this._xRect = { x: this._w * HALF + xCx - S.btnSizePx * HALF, y: this._h * HALF + xCy - S.btnSizePx * HALF, w: S.btnSizePx, h: S.btnSizePx };
    this._xBg.clear().roundRect(xCx - S.btnSizePx * HALF, xCy - S.btnSizePx * HALF, S.btnSizePx, S.btnSizePx, S.btnRadiusPx).fill({ color: WORLD_HUD.navBar.btnBg, alpha: WORLD_HUD.navBar.btnBgAlpha }).stroke({ color: WORLD_HUD.navBar.btnStroke, width: 1, alpha: WORLD_HUD.navBar.btnStrokeAlpha });
    this._xLabel.position.set(xCx, xCy);
    this._rect = { x: this._w * HALF - widthPx * HALF, y: this._h * HALF + top, w: widthPx, h };
    let y = top + S.headerPx;
    y = this._layoutTabs(left, y, w) + S.sectionGapPx;
    const full = this._engineering.snapshot(this._index, this._activeSlot).length >= this._engineering.capacity(this._index, this._activeSlot);
    const level = this._engineering.levelOf(this._index);
    if (landscape) this._reflowColumns(left, y, w, level, full);
    else this._reflowStack(left, y, w, level, full);
  }

  /** @private portrait: queue, then picker, then detail, stacked top to bottom */
  _reflowStack(left, y, w, level, full) {
    this._queue.layout(this._w * HALF + left, this._h * HALF + y, w); y += S.queue.heightPx + S.sectionGapPx;
    this._refreshQueue();
    this._picker.layout(this._w * HALF + left, this._h * HALF + y, w);
    this._picker.setState(level, this._resources.materials);
    y += S.picker.heightPx + S.sectionGapPx;
    this._detail.setMaterial(this._picker.selected, level, full);
    this._detail.layout(this._w * HALF + left, this._h * HALF + y, w);
  }

  /** @private landscape: queue fills the left column; picker + detail stack in the right column */
  _reflowColumns(left, y, w, level, full) {
    const colGapPx = 16, leftW = w * 0.42, rightW = w - leftW - colGapPx;
    const absY = this._h * HALF + y, rightX = this._w * HALF + left + leftW + colGapPx;
    this._queue.layout(this._w * HALF + left, absY, leftW);
    this._refreshQueue();
    this._picker.layout(rightX, absY, rightW);
    this._picker.setState(level, this._resources.materials);
    this._detail.setMaterial(this._picker.selected, level, full);
    this._detail.layout(rightX, absY + S.picker.heightPx + S.sectionGapPx, rightW);
  }

  /** @private @returns {void} */
  _refreshQueue() {
    const jobs = this._engineering.snapshot(this._index, this._activeSlot);
    this._queue.setJobs(jobs, this._engineering.capacity(this._index, this._activeSlot));
  }

  /** @private rebuild + layout the per-workshop tab row; returns bottom Y @param {number} left @param {number} y @param {number} w */
  _layoutTabs(left, y, w) {
    const count = this._engineering.workshopCount(this._index);
    if (this._activeSlot >= count) this._activeSlot = Math.max(0, count - 1);
    while (this._tabs.length < count) {
      const bg = new Graphics();
      const label = new Text({ text: `Workshop ${this._tabs.length + 1}`, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: S.tab.labelPx, fontWeight: 'bold' }) });
      label.anchor.set(HALF);
      this._card.addChild(bg, label);
      this._tabs.push({ bg, label });
    }
    for (let i = 0; i < this._tabs.length; i++) this._tabs[i].bg.visible = this._tabs[i].label.visible = count > 1 && i < count;
    this._tabCount = count;
    if (count <= 1) return y; // single workshop — no tab row needed
    const tabW = (w - S.tab.gapPx * (count - 1)) / count;
    this._tabW = tabW; this._tabAbsX = this._w * HALF + left; this._tabAbsY = this._h * HALF + y;
    for (let i = 0; i < count; i++) {
      const t = this._tabs[i], x = left + i * (tabW + S.tab.gapPx), active = i === this._activeSlot;
      t.bg.clear().roundRect(x, y, tabW, S.tab.heightPx, S.tab.radiusPx).fill({ color: active ? S.tab.activeBg : S.tab.bg, alpha: active ? S.tab.activeBgAlpha : S.tab.bgAlpha }).stroke({ color: active ? S.tab.activeStroke : S.tab.stroke, width: 1, alpha: active ? 1 : S.tab.strokeAlpha });
      t.label.style.fill = active ? S.tab.activeLabelColor : S.tab.labelColor;
      t.label.position.set(x + tabW * HALF, y + S.tab.heightPx * HALF);
    }
    return y + S.tab.heightPx;
  }

  /** @private ABSOLUTE rect for tab `i`, cached from the last `_layoutTabs` call @param {number} i @returns {{x:number,y:number,w:number,h:number}} */
  _tabRect(i) {
    if (this._tabCount <= 1 || i >= this._tabCount) return { x: -1, y: -1, w: 0, h: 0 };
    return { x: this._tabAbsX + i * (this._tabW + S.tab.gapPx), y: this._tabAbsY, w: this._tabW, h: S.tab.heightPx };
  }
}

/** @param {{x:number,y:number,w:number,h:number}} r @param {number} sx @param {number} sy @returns {boolean} */
function within(r, sx, sy) { return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h; }

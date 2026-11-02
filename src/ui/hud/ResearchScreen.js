/**
 * ResearchScreen — opened by the Research Center's own "Research" hex-menu
 * action (replaces the generic "View"). Same full-screen shell
 * `BarracksDetailScreen` uses (`drawTroopSurface` + docked header +
 * `ScrollDrag` content, not a centered modal), but a genuine full screen
 * starting at y=0: its own `ResearchResourceBar` (live Money/Steel/Oil)
 * is the very first thing drawn, on EVERY page this screen shows — the
 * player's own explicit correction, replacing an earlier approach that
 * just reserved a gap for the global HUD TopBar to show through
 * underneath. Internally switches between a HUB mode (the 1-2-1-2
 * category hexes, `ResearchHubView`) and a TREE mode (one track's real
 * connected node graph, `ResearchTreeView`) — ONE screen, not two. A
 * tapped node opens `ResearchNodeDetail`'s own popup on top of either
 * mode; closing it returns to whichever mode was open, same as the back
 * button does for tree->hub (this screen stays open — the player bounces
 * between tracks and nodes, this isn't a one-shot detail popup).
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, screenSidePad } from '../../config/HudConfig.js';
import { RESEARCH_HUB as C } from '../../config/ResearchScreenConfig.js';
import { researchNode } from '../../config/research/index.js';
import { drawTroopSurface } from './TroopMenuDraw.js';
import { BackButton } from './BackButton.js';
import { ResearchResourceBar } from './ResearchResourceBar.js';
import { ResearchHubView } from './ResearchHubView.js';
import { ResearchTreeView } from './ResearchTreeView.js';
import { ResearchNodeDetail } from './ResearchNodeDetail.js';
import { trackLabel } from '../../systems/researchLabels.js';
import { ScrollDrag } from './ScrollDrag.js';

const HALF = 0.5;
const MASK_FILL = 0xffffff;

export class ResearchScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._open = false;
    this._mode = 'hub'; this._track = null;
    this._research = null; this._resources = null;
    this._w = 0; this._h = 0;
    this._contentX = 0; this._contentH = 0;
    this._midRect = { x: 0, y: 0, w: 0, h: 0 };
    this._headerReservePx = C.resourceBar.heightPx;
    this._root = new Container(); this._root.visible = false;
    this._bg = new Graphics();
    this._headerBg = new Graphics();
    this._resourceBar = new ResearchResourceBar();
    this._back = new BackButton();
    const fam = WORLD_HUD.fontFamily, hd = C.header;
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: hd.titlePx, fill: hd.titleColor, fontWeight: 'bold' }) });
    this._headerLine = new Graphics();
    this._midMask = new Graphics();
    this._midInner = new Container(); this._midInner.mask = this._midMask;
    this._hub = new ResearchHubView();
    this._tree = new ResearchTreeView();
    this._midInner.addChild(this._hub.view, this._tree.view);
    this._detail = new ResearchNodeDetail((nodeId) => this._pressStart(nodeId));
    this._root.addChild(this._bg, this._headerBg, this._resourceBar.view, this._back.bg, this._back.icon, this._title, this._headerLine, this._midMask, this._midInner, this._detail.view);
    this._landscape = false;
    // Landscape's tree is horizontally scrollable (the player's own
    // reference: "scrollable menu to the left and right") — every other
    // mode/orientation stays the original vertical scroll.
    this._scroll = new ScrollDrag(
      events,
      () => {
        if (!this._open || this._detail.isOpen) return null;
        return this._landscape && this._mode === 'tree' ? { ...this._midRect, axis: 'x' } : this._midRect;
      },
      (off) => {
        if (this._landscape && this._mode === 'tree') this._midInner.position.set(this._contentX + off, this._midRect.y);
        else this._midInner.position.set(this._contentX, this._midRect.y + off);
      },
    );
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }
  /** @returns {boolean} the mid column is mid-scroll-drag — Game suppresses camera-pan */
  isDraggingScroll() { return this._scroll.isDragging; }

  /** @returns {void} */
  enable() { this._renderer.layer('OVERLAY').addChild(this._root); this._scroll.enable(); }
  /** @returns {void} */
  disable() { this._scroll.disable(); this._hub.destroy(); this._tree.destroy(); this._detail.destroy(); this._resourceBar.destroy(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /** @param {number} w @param {number} h @returns {void} */
  layout(w, h) {
    this._w = w; this._h = h;
    if (this._open) this._reflow();
    if (this._detail.isOpen) this._detail.layout(w, h, this._headerReservePx);
  }

  /**
   * @param {import('../../systems/ResearchManager.js').ResearchManager} research
   * @param {import('../../systems/ResourceManager.js').ResourceManager} resources
   * @returns {void}
   */
  open(research, resources) {
    this._research = research; this._resources = resources;
    this._mode = 'hub'; this._track = null;
    this._detail.close();
    this._scroll.reset();
    this._open = true; this._root.visible = true;
    this._reflow();
  }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /** @returns {void} live countdown + rank-completion — call every frame while open (poll-and-redraw, same as ProductionScreen.refresh) */
  refresh() {
    if (!this._open) return;
    this._reflow();
    if (this._detail.isOpen) this._openDetail(this._detail.nodeId); // keep its own live countdown/state current
  }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} true if this tap was consumed */
  handleTap(sx, sy) {
    if (!this._open) return false;
    if (this._detail.isOpen) return this._detail.handleTap(sx, sy);
    if (this._back.hit(sx, sy)) {
      if (this._mode === 'tree') { this._mode = 'hub'; this._track = null; this._scroll.reset(); this._reflow(); }
      else this.close();
      return true;
    }
    const v = this._midRect;
    if (sx >= v.x && sx <= v.x + v.w && sy >= v.y && sy <= v.y + v.h) {
      const treeHorizontal = this._landscape && this._mode === 'tree';
      const lx = sx - (this._contentX + (treeHorizontal ? this._scroll.y : 0));
      const ly = sy - (v.y + (treeHorizontal ? 0 : this._scroll.y));
      if (this._mode === 'hub') {
        const track = this._hub.tapAt(lx, ly);
        if (track) { this._mode = 'tree'; this._track = track; this._scroll.reset(); this._reflow(); }
      } else {
        const nodeId = this._tree.tapAt(lx, ly);
        if (nodeId) this._openDetail(nodeId);
      }
    }
    return true;
  }

  /** @private open (or refresh) the detail popup for one node — explicit layout call, not relying on `open`'s own "only if already sized once" internal trigger (true on a screen resize, false on the very first tap) @param {string} nodeId */
  _openDetail(nodeId) {
    const node = researchNode(nodeId), state = this._tree.stateFor(nodeId);
    if (!node || !state) return;
    this._detail.open(node, state, this._resources, this._research.speedMult);
    this._detail.layout(this._w, this._h, this._headerReservePx);
  }

  /** @private RESEARCH pressed inside the popup — the one place `ResearchManager.start` is ever called @param {string} nodeId */
  _pressStart(nodeId) {
    this._research.start(nodeId);
    this._reflow();
    this._openDetail(nodeId); // reopen refreshed — now shows the live countdown
  }

  /** @private */
  _reflow() {
    const w = this._w, h = this._h, hd = C.header, um = WORLD_HUD.unitsMenu;
    // Landscape (the player's own reference): resources fold INTO the
    // same single header row as back+title, right-aligned — not their own
    // full-width strip above it (portrait only — narrow enough that
    // resources need their own row).
    const landscape = w > h;
    this._landscape = landscape;
    const sidePad = screenSidePad(w, h);
    const headerTop = landscape ? 0 : this._resourceBar.layoutBar(w);
    const top = headerTop + hd.heightPx;
    if (landscape) this._resourceBar.layoutInline(w - sidePad, headerTop + hd.heightPx * HALF);
    this._resourceBar.refresh(this._resources.balances);
    this._headerReservePx = top;
    // The back/title row's own background — `drawTroopSurface` below only
    // ever covers the CONTENT area (y >= top), so without this the world
    // scene bled through behind the header row (a real bug this layout
    // rework introduced, caught on the first landscape screenshot).
    this._headerBg.clear().rect(0, headerTop, w, hd.heightPx).fill({ color: C.resourceBar.bg, alpha: C.resourceBar.bgAlpha });
    drawTroopSurface(this._bg, w, h - top); this._bg.position.set(0, top);
    this._headerLine.clear().rect(0, top, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: 0.5 });
    this._back.layout(sidePad, headerTop + (hd.heightPx - um.backSizePx) * HALF);
    this._title.text = this._mode === 'tree' ? trackLabel(this._track) : 'Research Center';
    this._title.position.set(sidePad + um.backSizePx + hd.badgeGapPx, headerTop + (hd.heightPx - hd.titlePx) * HALF);

    const innerW = w - sidePad * 2;
    this._hub.view.visible = this._mode === 'hub';
    this._tree.view.visible = this._mode === 'tree';
    if (this._mode === 'hub') this._hub.refresh(this._research);
    else { this._tree.setTrack(this._track); this._tree.refresh(this._research); }

    const y = top + 14;
    this._contentX = sidePad;
    this._midRect = { x: 0, y, w, h: h - y };
    this._midMask.clear().rect(0, y, w, h - y).fill(MASK_FILL);
    const treeHorizontal = landscape && this._mode === 'tree';
    if (this._mode === 'hub') {
      this._contentH = this._hub.layout(innerW, landscape) + 24;
      this._scroll.setBounds(Math.min(0, this._midRect.h - this._contentH));
    } else if (treeHorizontal) {
      const contentW = this._tree.layout(innerW, this._midRect.h, true) + 24;
      this._scroll.setBounds(Math.min(0, innerW - contentW));
    } else {
      this._contentH = this._tree.layout(innerW, this._midRect.h, false) + 24;
      this._scroll.setBounds(Math.min(0, this._midRect.h - this._contentH));
    }
    this._midInner.position.set(sidePad + (treeHorizontal ? this._scroll.y : 0), y + (treeHorizontal ? 0 : this._scroll.y));
  }
}

/**
 * BuildingUpgradeScreen — the Army-shell-SIZED right-side panel (the
 * player's own explicit, repeated instruction: reuse `ArmyMenu`'s exact
 * outer MEASUREMENTS — not an independent estimate that happens to be
 * similar). `layout()` calls the SAME `armyShellRect()` formula
 * `ArmyMenu.layout()` itself calls (`ArmyMenuConfig.js`), with
 * `ARMY_MENU.barrackSlots` standing in for "row count" — so this panel's
 * rect is PIXEL-IDENTICAL to the Army panel's own, not merely similar, and
 * the two can never silently drift apart. Shell chrome (bg/stroke/radius/
 * pad/top-inset) is read straight from `ARMY_MENU` for the same reason —
 * no second copy of those numbers to go stale. The game world stays
 * visible everywhere the panel doesn't cover (it's a panel, not a
 * scrim+modal like `BuildingInfoScreen`). Header (name, "Lvl N >>> N+1", a
 * "?" back into `BuildingInfoScreen`) lives here; the Features/Material/
 * Resource/Upgrade body is `BuildingUpgradeContent` (kept separate purely
 * for the 150-line cap, same split `TroopDetailScreen`/
 * `TroopUpgradeContent` already use). This screen never scrolls (the
 * player's own explicit instruction) — with the full Army-sized shell
 * there is comfortably enough room for every section at once.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BUILDING_UPGRADE as C } from '../../config/BuildingScreenConfig.js';
import { ARMY_MENU, armyShellRect } from '../../config/ArmyMenuConfig.js';
import { BuildingUpgradeContent } from './BuildingUpgradeContent.js';

const HALF = 0.5;

export class BuildingUpgradeScreen {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    this._open = false;
    this._id = null;
    this._navRect = null;
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._bodyRect = { x: 0, y: 0, w: 0, h: 0 };
    this._onQuestion = null; this._onUpgrade = null;
    this._root = new Container();
    this._root.visible = false;
    this._bg = new Graphics();
    this._headerBg = new Graphics();
    const fam = WORLD_HUD.fontFamily, h = C.header;
    this._name = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: h.namePx, fill: h.nameColor, fontWeight: 'bold' }) });
    this._levelText = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: h.levelPx, fill: h.levelColor }) });
    this._questionBg = new Graphics();
    this._questionLabel = new Text({ text: '?', style: new TextStyle({ fontFamily: fam, fontSize: 14, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._questionLabel.anchor.set(HALF);
    this._content = new BuildingUpgradeContent(events);
    this._root.addChild(this._bg, this._headerBg, this._name, this._levelText, this._questionBg, this._questionLabel, this._content.view);
    this._questionRect = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */
  isDraggingScroll() { return this._content.isDraggingScroll(); }

  /** @returns {void} */
  enable() { this._renderer.layer('OVERLAY').addChild(this._root); this._content.enable(); }
  /** @returns {void} */
  disable() { this._content.disable(); this._root.parent?.removeChild(this._root); this._root.destroy({ children: true }); }

  /**
   * @param {{x:number,y:number,w:number,h:number}} navBarRect NavBar's own bar area — PIXEL-IDENTICAL
   *   shell to `ArmyMenu.layout()` (same `armyShellRect()` call, see this
   *   class's own doc).
   * @returns {void}
   */
  layout(navBarRect) {
    const m = ARMY_MENU;
    this._navRect = navBarRect;
    this._rect = armyShellRect(navBarRect, m.barrackSlots).rect;
    // armyShellRect's own row-minimum clamp can, on a short landscape phone,
    // push this shell's bottom edge PAST the nav bar's own top edge (a
    // trade-off that formula accepts for Army's row content) — pixel-
    // identical sizing is the goal everywhere else, but never past the nav
    // bar. A no-op whenever there's enough room (the normal case).
    this._rect.h = Math.min(this._rect.h, navBarRect.y - this._rect.y);
    this._bg.clear().roundRect(this._rect.x, this._rect.y, this._rect.w, this._rect.h, m.radiusPx)
      .fill({ color: m.bg, alpha: m.bgAlpha }).stroke({ color: m.stroke, width: m.strokeWidthPx, alpha: m.strokeAlpha });
    this._layoutHeader();
    if (!this._id) return;
    this._bodyRect = { x: this._rect.x + m.padPx, y: this._rect.y + C.header.heightPx + m.padPx, w: this._rect.w - m.padPx * 2, h: this._rect.h - C.header.heightPx - m.padPx * 2 };
    this._content.view.scale.set(1);
    const naturalH = this._content.layout(this._bodyRect);
    // This screen never scrolls (by design — see this class's own doc), so
    // on a screen too short for every section at once, shrink the WHOLE
    // body as one unit instead of letting the UPGRADE button run off the
    // bottom (the player's own report, phone landscape).
    if (this._bodyRect.h > 0 && naturalH > this._bodyRect.h) {
      const s = this._bodyRect.h / naturalH;
      this._content.view.scale.set(s);
      this._content.layout({ x: this._bodyRect.x / s, y: this._bodyRect.y / s, w: this._bodyRect.w / s, h: this._bodyRect.h / s });
    }
  }

  /**
   * @param {string} id BUILDINGS key @param {number} level
   * @param {{name:string, hqLevel:number, resources:object, onQuestion:(id:string,level:number)=>void, onUpgradeComplete:()=>void}} ctx
   *   bundled to keep this method's own param count under the lint cap —
   *   `name` is the SAME barracks-variant-aware display name every one of
   *   the 3 screens gets from `BuildingScreensController._nameOf`
   * @returns {void}
   */
  open(id, level, ctx) {
    this._id = id; this._onQuestion = ctx.onQuestion;
    this._name.text = ctx.name;
    this._content.setBuilding(id, level, ctx.hqLevel, ctx.resources, ctx.onUpgradeComplete);
    if (this._navRect) this.layout(this._navRect);
    this._open = true;
    this._root.visible = true;
  }

  /**
   * @returns {void} re-pull the building's current level + afford state
   * (after an upgrade, or a resource tick — RESOURCE_CHANGED fires
   * continuously since production is live, never a collect/claim). `_pull`
   * REBUILDS fresh icon/label/value children (`_rebuildFeatures`,
   * `BuildingCostSections.setCost`) but never positions or draws them
   * itself — re-running `layout()` here is what actually places + redraws
   * them, the same way `open()` does right after its own first `setBuilding`
   * call. Skipping this left every section blank within a frame or two of
   * opening (a real, screenshot-caught bug, not a hypothetical).
   */
  refresh() { if (this._id) { this._content.refresh(); if (this._navRect) this.layout(this._navRect); } }

  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} */
  handleTap(sx, sy) {
    if (!this._open) return false;
    if (within(this._questionRect, sx, sy)) { this._onQuestion?.(this._id, this._content.level); return true; }
    if (!within(this._rect, sx, sy)) { this.close(); return true; }
    // `_content.view` may be shrunk to fit (see layout()) — toLocal() maps
    // this real screen tap through that same scale so `_btnRect` (computed
    // in the view's own, possibly pre-scale, coordinate space) still lines
    // up with where the button actually renders.
    const local = this._content.view.toLocal({ x: sx, y: sy });
    this._content.handleTap(local.x, local.y);
    return true;
  }

  /** @private */
  _layoutHeader() {
    const m = ARMY_MENU, h = C.header, r = this._rect;
    this._headerBg.clear().roundRect(r.x, r.y, r.w, h.heightPx, m.radiusPx).fill({ color: h.bg, alpha: h.bgAlpha })
      .rect(r.x, r.y + h.heightPx - m.radiusPx, r.w, m.radiusPx).fill({ color: h.bg, alpha: h.bgAlpha });
    const left = r.x + m.padPx;
    this._name.position.set(left, r.y + m.padPx);
    const level = this._content.level, cap = this._content.cap, atMax = level >= cap;
    this._levelText.text = atMax ? `Lvl ${level}` : `Lvl ${level}  »»»  ${level + 1}`;
    // stack BELOW the name's own REAL measured height (no anchor is set on
    // either Text, so both are top-left — the old `namePx * HALF` offset
    // never actually centred _name, it just under-shot the real line
    // height, leaving only ~4px before _levelText instead of a full line).
    this._levelText.position.set(left, r.y + m.padPx + this._name.height + 2);
    const qCx = r.x + r.w - m.padPx - h.btnSizePx * HALF, qCy = r.y + h.heightPx * HALF;
    this._questionRect = { x: qCx - h.btnSizePx * HALF, y: qCy - h.btnSizePx * HALF, w: h.btnSizePx, h: h.btnSizePx };
    this._questionBg.clear().roundRect(this._questionRect.x, this._questionRect.y, h.btnSizePx, h.btnSizePx, h.btnRadiusPx)
      .fill({ color: WORLD_HUD.navBar.btnBg, alpha: WORLD_HUD.navBar.btnBgAlpha }).stroke({ color: WORLD_HUD.navBar.btnStroke, width: 1, alpha: WORLD_HUD.navBar.btnStrokeAlpha });
    this._questionLabel.position.set(qCx, qCy);
  }
}

/** @param {{x:number,y:number,w:number,h:number}} r @param {number} sx @param {number} sy @returns {boolean} */
function within(r, sx, sy) { return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h; }

/**
 * Building selection controller: shared Info / Upgrade / View menu for every
 * building, anchored to its footprint. View (barracks only) now opens
 * `BarracksDetailScreen` addressed by this building's own true index (see
 * `_barracksNumber`/`Buildings3D.js`'s own doc on why that matters); Info
 * and Upgrade open the 3 reusable screens `BuildingScreensController` owns
 * (`BuildingInfoScreen` / `BuildingLevelInfoScreen` / `BuildingUpgradeScreen`
 * — split out purely to keep this file under the 150-line cap). The old
 * small `BuildingPanel`/"Change Production" blind-cycle flow this replaced
 * is now unreachable (nothing calls `panel.open` any more) — its wiring is
 * left in place rather than torn out in the same pass as this feature;
 * flagged as a known follow-up cleanup, not touched here. Selection arms
 * relocation only for grid buildings and consumes taps before army orders.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { effectiveMaxLevel, upgradeCost } from '../config/BuildingConfig.js';
import { BUILDING_ACTIONS, BUILDING_MENU, BUILDING_MENU_NAMES } from '../config/BuildingMenuConfig.js';
import { BASE } from '../config/BaseConfig.js';
import { footprintOf, gateAnchorAt } from '../config/BaseGridConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { cellCentreToPx, plotCorners } from '../utils/SquareGrid.js';
import { label as barracksLabel } from '../systems/DynamicBarracks.js';
import { NO_GRID_IDS } from '../systems/basePlacement.js';
import { needsRecentre } from '../ui/hud/BuildingHexMenuLayout.js';
import { BuildingScreensController } from './BuildingScreensController.js';

const BARRACKS_ID = 'barracks', ENGINEERING_ID = 'engineering', RESEARCH_CENTER_ID = 'research_center'; // Factory is displayed name only — id unrenamed internally
const WALL_ID = 'defence_wall'; // no footprint cell — anchors the menu on the gate, not a building slot

export class BuildingContext {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {{menu:import('../ui/hud/BuildingHexMenu.js').BuildingHexMenu, panel:import('../ui/hud/BuildingPanel.js').BuildingPanel,
   *   arrows:import('../ui/hud/RelocateArrows.js').RelocateArrows, info:import('../ui/hud/BuildingInfoScreen.js').BuildingInfoScreen,
   *   levelInfo:import('../ui/hud/BuildingLevelInfoScreen.js').BuildingLevelInfoScreen,
   *   upgrade:import('../ui/hud/BuildingUpgradeScreen.js').BuildingUpgradeScreen,
   *   production:import('../ui/hud/ProductionScreen.js').ProductionScreen,
   *   barracksDetail:import('../ui/hud/BarracksDetailScreen.js').BarracksDetailScreen,
   *   researchScreen:import('../ui/hud/ResearchScreen.js').ResearchScreen}} ui bundled to keep this constructor's own param count under the lint cap
   * @param {import('./BaseSite.js').BaseSite} base
   */
  constructor(events, camera, { menu, panel, arrows, info, levelInfo, upgrade, production, barracksDetail, researchScreen }, base) {
    this._events = events; this._camera = camera; this._menu = menu;
    this._panel = panel; this._arrows = arrows; this._base = base;
    this._screens = new BuildingScreensController({ info, levelInfo, upgrade, production, barracksDetail, researchScreen }, base);
    /** @private @type {(sx:number,sy:number)=>boolean} taps the HUD already owns — see setHudHitTest */
    this._hud = () => false;
    this._openId = null;
    this._w = { x: 0, y: 0 };
    // S54: a stale-anchored menu/panel (open on a building that's since been
    // dragged elsewhere, or left behind by a camera pan/zoom) reads as broken
    // — reset+close on any of the three, rather than trying to keep it
    // live-tracking a moving target.
    this._camX = camera.x; this._camY = camera.y; this._camZoom = camera.zoom;
    /** @private true while a menu-open recentre pan (`_openMenu`) is running — `update()` tracks the camera but skips its own close-on-move check until it settles */
    this._autoPanning = false;
    this._onTap = (p) => this._handleTap(p.x, p.y);
    this._onResource = () => this._refresh();
    this._onDragStarted = () => this._closeAll();
  }

  /** @param {(sx:number,sy:number)=>boolean} fn @returns {void} mirrors OrderController.setHudHitTest */
  setHudHitTest(fn) { this._hud = fn; }

  /** @returns {void} */
  enable() {
    this._events.on(EVENTS.INPUT_TAP, this._onTap); this._events.on(EVENTS.RESOURCE_CHANGED, this._onResource);
    this._events.on(EVENTS.BUILDING_DRAG_STARTED, this._onDragStarted);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    this._events.off(EVENTS.RESOURCE_CHANGED, this._onResource);
    this._events.off(EVENTS.BUILDING_DRAG_STARTED, this._onDragStarted);
    this._openId = null;
  }

  /**
   * S54: close any open menu/panel the instant the camera pans or zooms —
   * polled (not event-driven) so every trigger (pinch, wheel, the drag-pan
   * gesture, the Home/World nav buttons) is caught uniformly with one check,
   * instead of chasing each gesture path individually.
   *
   * THRESHOLD, not exact equality (`BUILDING_MENU.stillEpsPx/stillEpsZoom`)
   * — `Camera._integratePosition`'s continuous lerp toward its target never
   * becomes exactly bit-identical for several real seconds after any pan
   * (float64 precision vs. the camera's large absolute world-px
   * coordinates), so an exact-equality check saw "still moving" and closed
   * a just-opened menu every frame for that whole tail — reported as the
   * menu taking 5-10s to "start appearing" after relocating a building; it
   * was actually opening and being closed again instantly, over and over.
   *
   * `_autoPanning` is the ONE deliberate exception: `_openMenu`'s own
   * recentre pan (the player's own design) is camera movement WE caused
   * to KEEP the menu visible, not a reason to close it — skip the
   * close-on-move check for as long as that pan is still running
   * (`camera.isMoving`), but keep tracking the live position every frame
   * so the eps-check has a fresh, settled baseline the instant it ends.
   * @returns {void}
   */
  update() {
    this._screens.update(); // live countdown tick for the Production screen, if open
    const c = this._camera;
    if (this._autoPanning) {
      this._camX = c.x; this._camY = c.y; this._camZoom = c.zoom;
      this._autoPanning = c.isMoving;
      return;
    }
    const moved = Math.abs(c.x - this._camX) > BUILDING_MENU.stillEpsPx
      || Math.abs(c.y - this._camY) > BUILDING_MENU.stillEpsPx
      || Math.abs(c.zoom - this._camZoom) > BUILDING_MENU.stillEpsZoom;
    if ((this._menu.isOpen || this._panel.isOpen) && moved) this._closeAll();
    this._camX = c.x; this._camY = c.y; this._camZoom = c.zoom;
  }

  /** @param {number} sx @param {number} sy SCREEN px @returns {boolean} claims this tap (OrderController defers) */
  hitTest(sx, sy) {
    if (this._menu.isOpen || this._panel.isOpen || this._screens.anyOpen()) return true;
    this._camera.screenToWorld(sx, sy, this._w);
    return Boolean(this._base.buildingAt(this._w.x, this._w.y));
  }

  /** @returns {boolean} any hex menu or building screen is open — position-independent, used ONLY to gate TAP routing (`Hud._routeTap`'s own doc): the small hex menu is a tap-consuming popup, not a blocking overlay, so it must NOT also gate camera pan/zoom — see `isAnyScreenOpen` for that */
  isAnyOpen() { return this._menu.isOpen || this._panel.isOpen || this._screens.anyOpen(); }

  /** @returns {boolean} a real full-screen/modal building SCREEN is open (Info/LevelInfo/Upgrade/Production/BarracksDetail) — excludes the small hex menu on purpose (the player's own report: opening it was freezing camera pan/zoom until it closed again). This is what `Game._wireInput` gates pan/zoom by. */
  isAnyScreenOpen() { return this._screens.anyOpen(); }

  /** @private @param {number} sx @param {number} sy SCREEN px */
  _handleTap(sx, sy) {
    // A full-screen building screen (BarracksDetailScreen) can visually sit
    // exactly where the HUD's own hit regions are (TopBar's avatar circle
    // docks top-left, same corner a full-screen screen's own back button
    // does) — an open screen must win that tap regardless, the same
    // priority `Hud.hitTest` itself already gives its own full-screen
    // UnitsMenu over TopBar/NavBar. Checked before `this._hud` for that
    // reason (previously after — the back button's own tap in that corner
    // was silently swallowed by the avatar's hit circle underneath it).
    if (this._screens.anyOpen()) return void this._screens.handleTap(sx, sy);
    if (this._hud(sx, sy)) return;
    if (this._menu.isOpen) return this._tapMenu(sx, sy);
    if (this._panel.isOpen && this._panel.hitTest(sx, sy)) return; // the panel's own button handles it
    this._camera.screenToWorld(sx, sy, this._w);
    const b = this._base.buildingAt(this._w.x, this._w.y);
    if (b) return this._openMenu(b);
    if (this._panel.isOpen) this._closePanel();
  }

  /**
   * @private `BuildingHexMenu.handleTap` always closes itself (hit or miss)
   * — S63: a MISS (tap elsewhere) must disarm relocate too, but a HIT that
   * opens the info/upgrade panel must NOT (still the same selected
   * building — `_cycleProduction`'s own 'manage' path already disarms
   * itself, since it never opens a panel).
   * @param {number} sx @param {number} sy
   */
  _tapMenu(sx, sy) {
    this._menu.handleTap(sx, sy);
    if (!this._menu.isOpen && !this._panel.isOpen && !this._screens.anyOpen()) {
      this._base.setRelocateArmed(null);
      this._arrows.hide();
    }
  }

  /** @private the fan of hex actions, anchored on the BUILDING's own true footprint centre, not the tap @param {{id:string,index?:number,anchor?:{x:number,y:number}}} b */
  _openMenu(b) {
    this._openId = b.id;
    this._openIndex = b.index; // this building's own true BaseManager.buildings index (3D buildings only, see Buildings3D's own doc) — undefined for a 2D-path building, fine: only barracks' 'view'/'manage' actions read it, and barracks is always 3D
    const info = this._describe(b.id);
    const actions = BUILDING_ACTIONS[b.id] ?? BUILDING_ACTIONS.default;
    const a = b.anchor ?? this._buildingAnchor(b.id);
    if (needsRecentre(a, this._camera, actions.length)) { this._autoPanning = true; this._camera.moveTo(a.x, a.y, BUILDING_MENU.recentreMs); }
    const title = b.id === BARRACKS_ID ? `No. ${this._barracksNumber(this._openIndex)} Barracks` : info.name;
    this._menu.open(a, `Lvl ${info.level} ${title}`, actions, (action) => this._onAction(action), this._camera);
    // S63: arm relocate + show the move-arrows at the building's OWN true
    // grid-footprint edges (`plotCorners` supplies the same diamond math the
    // grid/plot outline itself is drawn with) — NOT a hand-rolled
    // symmetric diamond, which drifts off the real plot edges for any
    // non-square (w!==h) footprint, landing the arrows somewhere that
    // doesn't match where the building can actually be dragged to.
    // NO_GRID_IDS (wall/towers) have no single grid slot to relocate, so
    // they open the menu but never arm a drag.
    if (!NO_GRID_IDS.has(b.id)) {
      this._base.setRelocateArmed(b.id);
      const centre = this._visualCentreWorld(b.id);
      const fp = footprintOf(b.id);
      const corners = plotCorners(fp.w, fp.h, BASE.grid.cellPx); // [N,E,S,W], relative to centre
      this._arrows.show(centre.x, centre.y, corners);
    }
  }

  /**
   * @private the building's own TRUE footprint centre, WORLD px — the
   * single source of truth `BuildingHexMenu`'s whole root anchors on (its
   * title/hex-fan children keep their own existing LOCAL offsets from
   * there; nothing here hard-codes a screen position or a per-building
   * offset). `_visualCentreWorld` is exactly "centre of the grid cells
   * occupied by the selected building" — the same footprint-centre math
   * `RelocateArrows`/the plot outline already use, so this agrees with
   * where the building visibly sits by construction. Only for
   * single-position buildings — one id at several positions (the corner
   * towers) instead returns its own `anchor` straight from `buildingAt`,
   * see `_openMenu`.
   * @param {string} id @returns {{x:number,y:number}} world px
   */
  _buildingAnchor(id) {
    if (id === WALL_ID) {
      const c = WORLDMAP.baseCentre;
      const gate = gateAnchorAt(this._base.hqLevel);
      return { x: c.x + gate.x, y: c.y + gate.y };
    }
    return this._visualCentreWorld(id);
  }

  /**
   * @private the building's footprint-centre in WORLD px, preferring its
   * CURRENTLY RENDERED position (S54 `Buildings3D.visualPositionOf`) over
   * the true (cx,cy) — HQ's far-zoom stand-in visually sits elsewhere
   * (lerped toward the plot centre) below full reveal; anchoring on the
   * true position there would pop the menu/arrows away from where the
   * building is actually seen. null for a 2D-placeholder id, where the
   * true position IS what's shown. WALL_ID has no single footprint — never
   * call this for it (see `_buildingAnchor`'s own gate case).
   * @param {string} id @returns {{x:number,y:number}}
   */
  _visualCentreWorld(id) {
    const c = WORLDMAP.baseCentre;
    const visual = this._base.visualPositionOf(id);
    const b = visual ?? this._base.base.buildings.find((x) => x.id === id);
    const centre = cellCentreToPx(b.cx, b.cy, BASE.grid.cellPx);
    return { x: c.x + centre.x, y: c.y + centre.y };
  }

  /** @private this barracks' own 1-based position among barracks only (same order `ArmyMenu`'s own rows use — `barracksRoster.barracksList`) — real per-instance numbering, not the old hardcoded "No. 1" every barracks used to share @param {number} index true `buildings` index @returns {number} */
  _barracksNumber(index) {
    return this._base.base.buildings.slice(0, index + 1).filter((x) => x.id === BARRACKS_ID).length;
  }

  /** @private @param {string} action */
  _onAction(action) {
    // Barracks' own 'view' opens the real per-instance detail screen (not
    // the old blind-cycle panel it replaced) — addressed by this building's
    // own true index, same as every other barracks action below it now.
    if (action === 'view' && this._openId === BARRACKS_ID) {
      this._openId = null; this._base.setRelocateArmed(null); this._arrows.hide(); // S63 — bypasses _closeAll, disarm explicitly
      return this._screens.openBarracksDetail(this._openIndex);
    }
    // Research Center's own 'research' action (replaces its generic 'view')
    // — opens the category-hub/tree screen. unique:1 (BuildingConfig), so
    // unlike Factory/Barracks there's only ever one instance to address.
    if (action === 'research' && this._openId === RESEARCH_CENTER_ID) {
      this._openId = null; this._base.setRelocateArmed(null); this._arrows.hide(); return this._screens.openResearch();
    }
    // Multi-instance limitation shared with every other multi-unique building here (_describe below does the same):
    // always the FIRST built Factory — a 2nd one (BUILDINGS.engineering.unique: 2) isn't individually addressable yet.
    if (action === 'produce' && this._openId === ENGINEERING_ID) return this._screens.openProduction(this._base.base.buildings.findIndex((b) => b.id === ENGINEERING_ID));
    const level = this._base.base.buildings.find((b) => b.id === this._openId)?.level ?? 1;
    if (action === 'info') return this._screens.openInfo(this._openId, level);
    this._screens.openUpgrade(this._openId, level); // 'upgrade' — the Army-shell-sized screen, not the old small panel
  }

  /** @private */
  _closePanel() {
    this._panel.close();
    this._openId = null;
    this._base.setRelocateArmed(null); // S63
    this._arrows.hide();
  }

  /** @private close whichever of the menu/panel/new-screens is open (S54 — see `update`/`_onDragStarted`), and disarm relocate (S63) */
  _closeAll() {
    if (this._menu.isOpen) this._menu.close();
    if (this._panel.isOpen) this._closePanel();
    this._screens.closeAll();
    this._base.setRelocateArmed(null);
    this._arrows.hide();
  }

  /** @private re-check affordability for the open panel/upgrade-screen on every resource tick — production is continuous, so this can flip every few seconds without the player doing anything */
  _refresh() {
    if (this._openId && this._panel.isOpen) this._panel.refreshAfford(this._describe(this._openId).afford);
    this._screens.refreshAfford();
  }

  /**
   * @private @param {string} id
   * @returns {{name:string,level:number,nextLevel:number,cost:?object,maxed:boolean,afford:boolean}}
   */
  _describe(id) {
    const b = this._base.base.buildings.find((x) => x.id === id);
    const name = id === BARRACKS_ID ? barracksLabel(b.variant) : (BUILDING_MENU_NAMES[id] ?? BASE.labels[id] ?? id);
    const maxed = b.level >= effectiveMaxLevel(id, this._base.hqLevel);
    const cost = maxed ? null : upgradeCost(id, b.level + 1);
    const afford = !maxed && this._base.resources.canAfford(cost);
    return { name, level: b.level, nextLevel: b.level + 1, cost, maxed, afford };
  }
}

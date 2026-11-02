/**
 * BaseSite — the player's base as a PLACE on the world map (GDD 18/24). The
 * compound's footprint (`BaseGridView`'s walls + every building not in
 * `Building3DConfig.BUILDING_3D`) is drawn at its true, fixed world size
 * always — the camera zooming in is what makes it bigger, same as any world
 * object. `Buildings3D` owns every live-3D building (the HQ renders at every
 * zoom instead of being swapped for an icon: oversized far, shrinking to
 * true size across `WORLDMAP.lod.buildingBand` as the rest reveals around
 * it; every other 3D building grows in with the rest). `TerritoryRing` — the
 * same fixed footprint — fades out as the walls take over. The economy
 * substrate (`BaseManager` + `ResourceManager` — upgrades are instant, GDD
 * 04) runs regardless, as does `BuildingContext`: tap a building →
 * `BuildingHexMenu` (glass hex actions) → one of `BuildingScreensController`'s
 * 5 reusable screens (Info / Level-Info / Upgrade / Factory Production /
 * `BarracksDetailScreen` — barracks' own "View", addressed by its real
 * index since multiple barracks share one id, see `Buildings3D.js`'s own
 * doc). `window.base` / `.rm`.
 */
import { BaseManager } from '../systems/BaseManager.js';
import { ResourceManager } from '../systems/ResourceManager.js';
import { PersonnelManager } from '../systems/PersonnelManager.js';
import { BaseGridView } from '../ui/BaseGridView.js';
import { Buildings3D } from './Buildings3D.js';
import { BaseGround3D } from './BaseGround3D.js';
import { DefenceWall3D } from './DefenceWall3D.js';
import { AttackTowers3D } from './AttackTowers3D.js';
import { BuildingDragController } from './BuildingDragController.js';
import { BaseTroops } from './BaseTroops.js';
import { TerritoryRing } from './TerritoryRing.js';
import { BaseLodPin } from './BaseLodPin.js';
import { BuildingContext } from './BuildingContext.js';
import { BuildingPanel } from '../ui/hud/BuildingPanel.js';
import { BuildingHexMenu } from '../ui/hud/BuildingHexMenu.js';
import { BuildingInfoScreen } from '../ui/hud/BuildingInfoScreen.js';
import { BuildingLevelInfoScreen } from '../ui/hud/BuildingLevelInfoScreen.js';
import { BuildingUpgradeScreen } from '../ui/hud/BuildingUpgradeScreen.js';
import { ProductionScreen } from '../ui/hud/ProductionScreen.js';
import { BarracksDetailScreen } from '../ui/hud/BarracksDetailScreen.js';
import { ResearchScreen } from '../ui/hud/ResearchScreen.js';
import { RelocateArrows } from '../ui/hud/RelocateArrows.js';
import { EVENTS } from '../engine/GameEvents.js';
import { clamp, easeInOutQuad } from '../utils/MathUtils.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { STARTING_HQ_LEVEL } from '../config/BaseConfig.js';

export class BaseSite {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D live 3D building models
   */
  constructor(renderer, camera, events, base3D) {
    this._renderer = renderer;
    this._events = events;
    this._camera = camera;
    this._base3D = base3D;
    this._base = new BaseManager(events);
    this._rm = new ResourceManager(events, this._base);
    // Reserves Barracks doesn't exist in STARTING_LAYOUT yet — HQ level is the
    // v1 proxy for the personnel-pool level (GDD 06). FORWARD: the real building.
    this._personnel = new PersonnelManager(events, { reservesBarracksLevel: () => this._base.hqLevel });
    this._view = new BaseGridView(renderer, events);
    this._buildings3D = new Buildings3D(base3D, events);
    this._ground3D = new BaseGround3D(base3D);
    this._wall3D = new DefenceWall3D(base3D, events);
    this._towers3D = new AttackTowers3D(base3D, events);
    this._troops = new BaseTroops(renderer);
    this._territory = new TerritoryRing(renderer);
    // S57: the locked battlefield-vs-map pin swap — see BaseLodPin.js's own doc.
    this._homePin = new BaseLodPin(renderer, {
      buildings3D: this._buildings3D, wall3D: this._wall3D, ground3D: this._ground3D, towers3D: this._towers3D,
      troops: this._troops, territory: this._territory,
    });
    this._panel = new BuildingPanel(renderer, events);
    this._menu = new BuildingHexMenu(renderer);
    this._info = new BuildingInfoScreen(renderer);
    this._levelInfo = new BuildingLevelInfoScreen(renderer, events);
    this._upgrade = new BuildingUpgradeScreen(renderer, events);
    this._production = new ProductionScreen(renderer, events);
    this._barracksDetail = new BarracksDetailScreen(renderer, events);
    this._researchScreen = new ResearchScreen(renderer, events); this._arrows = new RelocateArrows(renderer);
    this._ctx = new BuildingContext(events, camera,
      { menu: this._menu, panel: this._panel, arrows: this._arrows, info: this._info, levelInfo: this._levelInfo, upgrade: this._upgrade, production: this._production, barracksDetail: this._barracksDetail, researchScreen: this._researchScreen }, this);
    this._drag = new BuildingDragController(events, camera, this);
    this._onResize = () => this._layoutPanel();
    /** @private @type {?()=>{x:number,y:number,w:number,h:number}} Hud.navBarRect — BuildingUpgradeScreen's shell anchors to it, same as ArmyMenu (see WorldScene.enable) */
    this._navBarRectSource = null;
    this._base.setResources(this._rm);
    // S63: the building a tap has PRIMED for relocate (shows the 4-side move
    // arrows) — BuildingDragController only ever picks up THIS id, never
    // whatever a drag gesture happens to start on top of. Without this gate,
    // panning the base map with a finger that starts on a building silently
    // relocated it on the slightest touch — the user's own reported bug.
    /** @private @type {?string} */ this._relocateArmedId = null;
    /** @private @type {?import('../systems/EngineeringCenter.js').EngineeringCenter} set once by WorldScene — BuildingContext's Production button */
    /** @private @type {?import('../systems/ResearchManager.js').ResearchManager} set once by WorldScene — BuildingContext's Research button */
    this._engineering = null; this._research = null;
  }

  /** @param {import('../systems/EngineeringCenter.js').EngineeringCenter} ec @returns {void} */
  setEngineering(ec) { this._engineering = ec; }
  /** @param {import('../systems/ResearchManager.js').ResearchManager} rm @returns {void} */
  setResearch(rm) { this._research = rm; }

  /** @returns {?import('../systems/EngineeringCenter.js').EngineeringCenter} for BuildingContext's Production button */
  /** @returns {?import('../systems/ResearchManager.js').ResearchManager} for BuildingContext's Research button */
  get engineering() { return this._engineering; } get research() { return this._research; }

  /** @returns {?string} the building currently primed for relocate (tap-selected, showing move arrows) */
  get relocateArmedId() { return this._relocateArmedId; }

  /** @param {?string} id @returns {void} BuildingContext arms/disarms this alongside its own menu open/close */
  setRelocateArmed(id) { this._relocateArmedId = id; }

  /** @returns {number} live headquarters level */
  get hqLevel() { return this._base.hqLevel; }
  /** @returns {import('../systems/PersonnelManager.js').PersonnelManager} shared with BaseArmy */
  get personnel() { return this._personnel; }
  /** @returns {import('../systems/BaseManager.js').BaseManager} for BuildingContext */
  get base() { return this._base; }
  /** @returns {import('../systems/ResourceManager.js').ResourceManager} for BuildingContext */
  get resources() { return this._rm; }

  /** @param {number} n real garrison unit count (from BaseArmy) @returns {void} */
  setGarrisonPips(n) { this._troops.setCount(n); }

  /** @param {(sx:number,sy:number)=>boolean} fn taps the top bar / nav / map buttons already own @returns {void} */
  setHudHitTest(fn) { this._ctx.setHudHitTest(fn); }

  /** @param {()=>{x:number,y:number,w:number,h:number}} fn reads Hud's live NavBar rect @returns {void} */
  setNavBarRectSource(fn) { this._navBarRectSource = fn; this._layoutPanel(); }

  /** @returns {boolean} a building screen (Level-Info, Upgrade, or Production's material picker) is mid-scroll-drag — Game suppresses camera-pan */
  isDraggingBuildingScreen() { return this._levelInfo.isDraggingScroll() || this._upgrade.isDraggingScroll() || this._production.isDraggingScroll() || this._barracksDetail.isDraggingScroll() || this._researchScreen.isDraggingScroll(); }

  /** @returns {boolean} the hex menu or any building screen is open — used only to gate TAP routing, NOT camera pan/zoom (see `BuildingContext.isAnyOpen`'s own doc) */
  isAnyMenuOpen() { return this._ctx.isAnyOpen(); }

  /** @returns {boolean} a real full-screen/modal building screen is open — excludes the small hex menu on purpose; this is what gates camera pan/zoom (see `BuildingContext.isAnyScreenOpen`'s own doc) */
  isAnyScreenOpen() { return this._ctx.isAnyScreenOpen(); }

  /** @param {number} sx @param {number} sy SCREEN px @returns {boolean} the building panel claims this tap */
  hitTest(sx, sy) { return this._ctx.hitTest(sx, sy); }

  /** @param {number} wx @param {number} wy world px @returns {?{id:string,level:number}} the tapped building (HQ included), if any */
  buildingAt(wx, wy) {
    return this._buildings3D.buildingAt(wx, wy) ?? this._wall3D.buildingAt(wx, wy)
      ?? this._towers3D.buildingAt(wx, wy) ?? this._view.buildingAt(wx, wy);
  }

  /** @param {string} id @returns {?{cx:number,cy:number}} the CURRENTLY RENDERED cell-unit position (S54 — see Building3DView.visualPosition), for BuildingContext's menu anchor; null for a 2D-placeholder id (its true position never diverges from what's on screen) */
  visualPositionOf(id) { return this._buildings3D.visualPositionOf(id); }

  /** @returns {boolean} dragging a building right now (WorldScene/Game suppress camera-pan while true) */
  isDraggingBuilding() { return this._drag.isDraggingBuilding(); }

  /** @param {string} id @returns {void} S54 BuildingDragController — dispatches to whichever owner (3D or 2D) actually has `id`; the other no-ops */
  beginBuildingDrag(id) { this._buildings3D.beginDrag(id); this._view.beginDrag(id); this._ground3D.setPlacementVisible(true); }

  /** @param {string} id @param {number} cx @param {number} cy @param {boolean} valid @returns {void} */
  updateBuildingDrag(id, cx, cy, valid) { this._buildings3D.updateDrag(id, cx, cy, valid); this._view.updateDrag(id, cx, cy, valid); }

  /** @param {string} id @returns {void} */
  endBuildingDrag(id) { this._buildings3D.endDrag(id); this._view.endDrag(id); this._ground3D.setPlacementVisible(false); }

  /** @returns {void} build the render, seed the base, start the economy */
  enable() {
    const c = WORLDMAP.baseCentre;
    this._base3D.setBaseOrigin(c.x, c.y);
    // subscribe before _base.enable() seeds — its BUILDING_PLACED emits are
    // what both _view and _buildings3D react to for every starting building
    this._view.enable(c.x, c.y, STARTING_HQ_LEVEL);
    this._buildings3D.enable();
    this._wall3D.enable(STARTING_HQ_LEVEL);
    this._towers3D.enable(STARTING_HQ_LEVEL);
    this._base.enable();
    this._ground3D.enable(STARTING_HQ_LEVEL);
    this._rm.enable();
    this._personnel.enable();
    this._troops.enable();
    this._territory.enable(c.x, c.y);
    this._homePin.enable(c.x, c.y);
    this._panel.enable(); this._arrows.enable(); this._menu.enable();
    this._info.enable(); this._levelInfo.enable(); this._upgrade.enable(); this._production.enable(); this._barracksDetail.enable(); this._researchScreen.enable();
    this._ctx.enable(); this._drag.enable(); this._layoutPanel();
    this._events.on(EVENTS.RESIZE, this._onResize);
    this._syncLod();
    if (typeof window !== 'undefined') { window.base = this._base; window.rm = this._rm; }
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.RESIZE, this._onResize);
    this._drag.disable(); this._ctx.disable(); this._arrows.disable(); this._menu.disable();
    this._upgrade.disable(); this._production.disable(); this._levelInfo.disable(); this._info.disable(); this._panel.disable(); this._barracksDetail.disable(); this._researchScreen.disable();
    this._troops.disable(); this._buildings3D.disable(); this._ground3D.disable(); this._wall3D.disable();
    this._towers3D.disable(); this._territory.disable(); this._homePin.disable(); this._view.disable();
    this._base.disable(); this._rm.disable(); this._personnel.disable();
    if (typeof window !== 'undefined') { delete window.base; delete window.rm; }
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._base.update(dt);
    this._rm.update(dt);
    this._personnel.update(dt);
    this._view.update(dt);
    this._buildings3D.update(dt);
    this._ctx.update();
    this._syncLod();
  }

  /** @private re-layout the docked building panel + the 4 new screens on boot + resize */
  _layoutPanel() {
    const { width, height } = this._renderer.app.screen;
    this._panel.layout(width, height);
    this._info.layout(width, height);
    this._levelInfo.layout(width, height);
    this._production.layout(width, height);
    this._barracksDetail.layout(width, height); this._researchScreen.layout(width, height);
    if (this._navBarRectSource) this._upgrade.layout(this._navBarRectSource());
  }

  /**
   * @private continuous zoom LOD (GDD 24 "Base zoom" reference). `pin` is the
   * garrison-pip-hint <-> real-troops crossfade; `reveal` shrinks the HQ in
   * place and staggers the walls / buildings / territory ring in as you zoom.
   */
  _syncLod() {
    const z = this._camera.zoom;
    this._homePin.update(z); // S57 hard pin-mode swap — forces buildings3D/troops/territory hidden while active
    const L = WORLDMAP.lod;
    const pin = easeInOutQuad(clamp((z - L.pinBand[0]) / (L.pinBand[1] - L.pinBand[0]), 0, 1));
    const reveal = easeInOutQuad(clamp((z - L.buildingBand[0]) / (L.buildingBand[1] - L.buildingBand[0]), 0, 1));
    this._buildings3D.setBlend(reveal);
    this._wall3D.setBlend(reveal);
    this._towers3D.setBlend(reveal);
    this._view.setBlend(reveal);
    this._troops.setBlend(pin);
    this._territory.setBlend(WORLDMAP.territory.alpha * clamp(1 - reveal / L.ringFadeFrac, 0, 1));
  }
}

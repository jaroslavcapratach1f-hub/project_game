/**
 * WorldScene — the single, always-on scene: the persistent world map. Built once
 * in Game.init() and registered as the loop system that replaces the old
 * ScreenManager. Owns the world terrain, the player BaseSite at map centre, a
 * ring of neighbour PlotMarkers, and the persistent world-map HUD (GDD 23: top
 * resource bar, 6-tab bottom nav, Home / World buttons). Navigation is pan +
 * pinch-zoom on this one scene — there is no screen swap and no per-state
 * mount/unmount.
 */
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { BASE, STARTING_HQ_LEVEL } from '../config/BaseConfig.js';
import { defencePolygon } from '../systems/DefenceFootprint.js';
import { axialToPixel } from '../utils/Hex.js';
import { clamp } from '../utils/MathUtils.js';
import { WorldTerrain } from './WorldTerrain.js';
import { paintTerrain } from './worldTerrainGen.js';
import { DecalField } from '../world/DecalField.js';
import { BaseSite } from './BaseSite.js';
import { BaseArmy } from './BaseArmy.js';
import { WorldCombat } from './WorldCombat.js';
import { NeighbourBases } from './NeighbourBases.js';
import { WorldHexGrid } from './WorldHexGrid.js';
import { BaseTerritoryGround } from './BaseTerritoryGround.js';
import { WorldEntityDebug } from './WorldEntityDebug.js';
import { radius1Hex } from '../world/HexFootprint.js';
import { Hud } from '../ui/hud/Hud.js';
import { OnslaughtDirector } from '../onslaught/OnslaughtDirector.js';
import { EngineeringCenter } from '../systems/EngineeringCenter.js';
import { ResearchManager } from '../systems/ResearchManager.js';

const UI_FADE_EPS = 0.01; // below this WORLD_UI alpha, skip rendering the layer

export class WorldScene {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D live 3D building models
   * @param {import('../engine/Unit3DLayer.js').Unit3DLayer} unit3D live 3D unit models (S55)
   */
  constructor(renderer, camera, events, base3D, unit3D) {
    this._renderer = renderer;
    this._camera = camera;
    this._terrain = new WorldTerrain(renderer);
    this._decals = new DecalField(); // tank tracks + shell scorch on LAYERS.DECALS
    this._base = new BaseSite(renderer, camera, events, base3D);
    this._army = new BaseArmy(renderer, camera, events, this._base.personnel, unit3D);
    this._combat = new WorldCombat(renderer, camera, events, { field: this._army.field, em: this._army.em, unit3D });
    this._hud = new Hud(renderer, camera, events, this._army, this._base);
    // Dormant until window.onslaught.start(levelId) — the alliance-scheduled kickoff.
    this._onslaught = new OnslaughtDirector(renderer, events, this._army.em, this._army.field, unit3D, this._base.base);
    this._neighbours = new NeighbourBases(renderer, base3D);
    this._hexGrid = new WorldHexGrid(renderer, this._army.field);
    this._territoryGround = new BaseTerritoryGround(renderer, this._army.field);
    this._entityDebug = new WorldEntityDebug(renderer, this._army.field);
    this._engineering = new EngineeringCenter(this._base.base, this._base.resources);
    this._base.setEngineering(this._engineering);
    this._research = new ResearchManager(this._base.base, this._base.resources);
    this._base.setResearch(this._research);
  }

  /** @returns {import('../systems/EngineeringCenter.js').EngineeringCenter} material production queue */
  get engineering() { return this._engineering; }

  /** @returns {boolean} a squad is being drag-marched — Game suppresses camera-pan */
  isDraggingUnit() { return this._army.isDraggingUnit(); }

  /** @returns {boolean} a base building is being drag-relocated (S54) — Game suppresses camera-pan */
  isDraggingBuilding() { return this._base.isDraggingBuilding(); }

  /** @returns {boolean} a HUD overlay (the UNITS grid) is mid-scroll-drag — Game suppresses camera-pan */
  isDraggingHud() { return this._hud.isDraggingUnitsMenu(); }

  /** @returns {boolean} a building screen (Level-Info/Upgrade) is mid-scroll-drag — Game suppresses camera-pan */
  isDraggingBuildingScreen() { return this._base.isDraggingBuildingScreen(); }

  /**
   * @returns {boolean} a full HUD overlay (UnitsMenu/ArmyMenu/NavPanel) or a
   * building hex-menu/screen (BarracksDetailScreen included) is open RIGHT
   * NOW — position-independent, unlike `hitTest`/`isDragging*` (`INPUT_PAN`
   * carries no x,y to test, and a gesture that starts on a non-scrollable
   * part of an open full-screen overlay — the hero art, an officer card,
   * empty chrome — is still "on the overlay": `Game._wireInput` gates
   * `INPUT_PAN`/`INPUT_ZOOM` by this so such a gesture can never leak
   * through and pan/zoom the map underneath (the player's own report: open
   * menus could be "clicked and dragged through" to whatever was behind
   * them). Deliberately `isAnyScreenOpen` (the 5 real full-screen/modal
   * screens), NOT `isAnyMenuOpen` — the small hex menu a building tap opens
   * is a tap-consuming popup, not a blocking overlay; including it here
   * froze camera pan/zoom on every ordinary building tap until the menu
   * was closed again (the player's own report, a regression from when
   * this method was first added).
   */
  isUiOpen() { return this._hud.isAnyOverlayOpen() || this._base.isAnyScreenOpen(); }

  /** @returns {void} build the map, frame the camera on the player base */
  enable() {
    const base = WORLDMAP.baseHex;
    // WORLDMAP.baseCentre, NOT a fresh axialToPixel(base.q,base.r,...) —
    // every OTHER system (BaseArmy, Buildings3D, walls, towers, ...) already
    // reads baseCentre directly; recomputing it here instead would desync
    // the moment the two definitions ever drift apart.
    const centre = WORLDMAP.baseCentre;
    const t = WORLDMAP.terrain;
    const camp = BASE.enemy.campHexOffset;
    const campPx = axialToPixel(base.q + camp.dq, base.r + camp.dr, WORLDMAP.hexSize);
    paintTerrain(this._army.field.grid, [
      { x: centre.x, y: centre.y, r: t.clearBaseRadiusPx },
      { x: campPx.x, y: campPx.y, r: t.clearCampRadiusPx },
    ]);
    this._terrain.enable(this._army.field.grid);
    this._decals.enable(this._renderer.layer('DECALS'));
    this._army.field.setDecalSink(this._decals); // scorch (EffectsSystem) + tracks (VehicleDust)
    this._blockObstacles(centre, base); // registers every base's 7-hex territory FIRST — the ground fill below reads it
    this._neighbours.enable(base, centre); // GDD 24 territory-conflict check lives in NeighbourBases now
    this._hexGrid.enable();
    this._territoryGround.enable(); // drawn AFTER the grid so it paves over the grid lines within each base's own territory (S75)
    this._hud.enable();                         // subscribe the TopBar first so it
    this._base.enable();                        // catches every RESOURCE_CHANGED /
    this._hud.setCommander(this._base.hqLevel); // PERSONNEL_CHANGED from here on
    this._army.enable();
    this._hud.refreshSquadBar(); // platoon only exists once _army.enable() has deployed it (S54)
    this._base.setGarrisonPips(this._army.garrisonCount); // pip blob = real garrison
    this._base.setHudHitTest((sx, sy) => this._hud.hitTest(sx, sy));
    // BuildingUpgradeScreen reuses ArmyMenu's own shell formula, anchored to
    // NavBar's own rect — NavBar lives in Hud, BuildingContext/BaseSite
    // don't, so this is the same cross-system callback bridge
    // setHudHitTest already uses, just for a rect instead of a hit-test fn.
    this._base.setNavBarRectSource(() => this._hud.navBarRect);
    this._army.setHudHitTest((sx, sy) => this._hud.hitTest(sx, sy) || this._base.hitTest(sx, sy));
    // S71 drag-from-squad-bar: a drag starting on a slot behaves exactly
    // like starting it on that unit's own map position.
    this._army.setSquadBarSource((sx, sy) => {
      const idx = this._hud.squadBarSlotAt(sx, sy);
      const slot = idx >= 0 ? this._army.platoon[idx] : null;
      return slot ? this._army.em.handleOf(slot.id) : null;
    });
    this._combat.enable();
    this._onslaught.enable();
    this._camera.setZoomLimits(WORLDMAP.minZoom, WORLDMAP.maxZoom);
    this._camera.zoom = WORLDMAP.startZoom;
    this._camera.setWorldBounds(WORLDMAP.widthPx, WORLDMAP.heightPx);
    this._camera.moveTo(centre.x, centre.y, 0);
    // S72 dev tool: window.debugHex.enable() highlights every registered
    // WorldEntity's occupied hexes (base territory, future buildings) over
    // the real grid — see WorldEntityDebug's own doc. Off by default.
    if (typeof window !== 'undefined') window.debugHex = this._entityDebug;
    if (typeof window !== 'undefined') { window.engineering = this._engineering; window.research = this._research; }
  }

  /** @returns {void} */
  disable() {
    this._entityDebug.disable();
    this._territoryGround.disable();
    this._hexGrid.disable();
    this._neighbours.disable();
    this._onslaught.disable();
    this._combat.disable();
    this._army.disable();
    this._base.disable();
    this._hud.disable();
    this._decals.destroy();
    this._terrain.disable();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._base.update(dt);
    this._engineering.update(dt); // settles any finished material-craft jobs
    this._research.update(dt);  // settles any finished research jobs, credits ranks — runs regardless of whether ResearchScreen is open
    this._army.update(dt);      // ticks the shared EntityManager (player + enemy units)
    this._onslaught.update(dt); // event wave director (dormant until started)
    this._combat.update(dt);    // AI + Fury + projectiles + effects
    this._hud.update(dt);
    this._lodDetail();
    this._neighbours.update(this._camera.zoom); // S57 hard pin-mode swap
    // S78: troop squad bar + hex-order targeting are only suspended once
    // the base is zoomed in close enough to fill the whole screen
    // (WORLDMAP.nearZoom — "Home" button's own target, "stand in the
    // compound") — the player's own correction: tying this to the FAR
    // pin-icon-swap threshold (WORLDMAP.pin.zoomThreshold, far below
    // nearZoom) left troops reachable only in a thin sliver at the very
    // edge of zoom-out, nowhere near normal play. Below nearZoom (more
    // land visible — the war view) troops come back; at/above it
    // (building-management close-up) they roll away. Idempotent no-ops
    // once already in the requested state.
    const buildingsFocus = this._camera.zoom >= WORLDMAP.nearZoom;
    this._hud.setSquadBarCollapsed(buildingsFocus);
    this._army.setOrdersEnabled(!buildingsFocus);
  }

  /**
   * @private LOD-fade the world-space unit UI (health bars, order rings, damage
   * numbers on LAYERS.WORLD_UI) so the strategic map isn't littered with tiny
   * bars — fully in past `lod.pinBand[1]`, gone below `pinBand[0]`.
   */
  _lodDetail() {
    const L = WORLDMAP.lod;
    const a = clamp((this._camera.zoom - L.pinBand[0]) / (L.pinBand[1] - L.pinBand[0]), 0, 1);
    const layer = this._renderer.layer('WORLD_UI');
    layer.alpha = a;
    layer.renderable = a > UI_FADE_EPS;
  }

  /**
   * @private Stamp solid map objects impassable so marches route around them and
   * a drag-drop onto one snaps out (WorldField.nearestOpen): the player compound
   * — its TRUE diamond wall footprint, not a circle (S55: a circular
   * approximation either left corner gaps troops could walk through into
   * the base, or bulged past the flat edges, blocking open ground outside
   * the wall that should be walkable) — the gate is locked, visual-only,
   * no walkable opening (the user's own call — player/garrison units are
   * placed directly, never march in through it) — + each neighbour base.
   * S72: each base ALSO registers its 7-hex territory in
   * `field.worldEntities` (WorldEntityRegistry) FIRST, before the exact-
   * shape blockPolygon pass — registering first means canPlace sees a
   * clean, unblocked grid; blockPolygon's own pass only re-confirms the
   * same cells after. The registry's hex-exact blocking is what guarantees
   * EVERY one of the 7 cells routes around (not just whichever the wall's
   * continuous polygon happens to geometrically cover) — blockPolygon
   * still runs too, for the wall's own fine continuous-space edge.
   * @param {{x:number,y:number}} centre base compound centre, world px
   * @param {{q:number,r:number}} base baseHex axial
   */
  _blockObstacles(centre, base) {
    const field = this._army.field;
    this._registerBaseTerritory(field, 'base_player', 'player', base);
    const corners = defencePolygon(STARTING_HQ_LEVEL)
      .map((p) => ({ x: p.x + centre.x, y: p.y + centre.y }));
    field.blockPolygon(corners);
    for (const n of WORLDMAP.neighbourHexes) {
      const anchor = { q: base.q + n.dq, r: base.r + n.dr };
      this._registerBaseTerritory(field, `base_${n.name}`, 'neutral', anchor);
      const p = axialToPixel(anchor.q, anchor.r, WORLDMAP.hexSize);
      field.blockPolygon(defencePolygon(STARTING_HQ_LEVEL).map((corner) => ({ x: corner.x + p.x, y: corner.y + p.y })));
    }
  }

  /**
   * @private register a base's Radius1Hex (7-cell) territory in the shared
   * WorldEntityRegistry — logs rather than throws on failure (a neighbour
   * hex placement conflict shouldn't take the whole map down).
   * @param {import('./WorldField.js').WorldField} field
   * @param {string} id @param {string} ownerId @param {{q:number,r:number}} anchor
   */
  _registerBaseTerritory(field, id, ownerId, anchor) {
    const placed = field.worldEntities.place({ id, type: 'base', ownerId, anchor, offsets: radius1Hex() });
    if (!placed) console.warn(`WorldScene: base territory placement failed for "${id}" — a cell was already occupied`);
  }
}

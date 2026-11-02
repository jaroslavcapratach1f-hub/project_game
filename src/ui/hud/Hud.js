/**
 * Hud — the persistent world-map HUD frame (GDD 23). Composes the top resource
 * bar, the 6-tab bottom nav + its full-screen panels, and the Home / World map
 * buttons. It owns tap routing for its own widgets (subscribes to INPUT_TAP)
 * and exposes `hitTest` so OrderController can ignore taps the HUD consumed.
 * World-space combat feedback (DamageNumbers) lives in WorldCombat, not here.
 */
import { EVENTS } from '../../engine/GameEvents.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { TopBar } from './TopBar.js';
import { NavBar } from './NavBar.js';
import { SquadBar } from './SquadBar.js';
import { NavPanel } from './NavPanel.js';
import { UnitsMenu } from './UnitsMenu.js';
import { ArmyMenu } from './ArmyMenu.js';
import { MapButtons } from './MapButtons.js';

const UNITS_TAB_ID = 'units';
const ARMY_TAB_ID = 'army';

export class Hud {
  /**
   * @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {import('../../engine/Camera.js').Camera} camera
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../../worldmap/BaseArmy.js').BaseArmy} army for SquadBar's deploy-slot buttons (S54)
   * @param {import('../../worldmap/BaseSite.js').BaseSite} site base buildings + personnel, for ArmyMenu's barrack sections
   */
  constructor(renderer, camera, events, army, site) {
    this._renderer = renderer;
    this._events = events;
    this._site = site;
    this._topBar = new TopBar(renderer, camera, events);
    this._navBar = new NavBar(renderer);
    this._squadBar = new SquadBar(renderer, army, events);
    this._navPanel = new NavPanel(renderer);
    this._unitsMenu = new UnitsMenu(renderer, events);
    this._armyMenu = new ArmyMenu(renderer, events, site);
    this._mapButtons = new MapButtons(renderer, camera);
    this._onTap = (p) => this._routeTap(p.x, p.y);
    this._onResize = () => this._layout();
    // The avatar button opens the whole game menu/settings "we will build
    // later" (the player's own words) — same "button exists, no screen
    // yet" stub pattern as the Gold "+" button below.
    this._topBar.setAvatarTap(() => this._navPanel.open({ label: 'Menu', lines: ['Game menu & settings'] }));
    // Gold "+" button: real hit-region + tap routing now, same "button
    // exists, no screen yet" pattern — the purchase-package flow itself
    // is a separate, not-yet-built feature (the player's own words).
    this._topBar.setGoldTap(() => this._navPanel.open({ label: 'Gold', lines: ['Purchase packages to refill Gold'] }));
  }

  /** @returns {void} */
  enable() {
    this._topBar.enable();
    this._navBar.enable();
    this._squadBar.enable();
    this._navPanel.enable();
    this._unitsMenu.enable();
    this._armyMenu.enable();
    this._mapButtons.enable();
    this._layout();
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
    this._events.on(EVENTS.RESIZE, this._onResize);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    this._events.off(EVENTS.RESIZE, this._onResize);
    this._mapButtons.disable();
    this._armyMenu.disable();
    this._unitsMenu.disable();
    this._navPanel.disable();
    this._squadBar.disable();
    this._navBar.disable();
    this._topBar.disable();
  }

  /** @param {number} level HQ / commander level for the top bar @returns {void} */
  setCommander(level) { this._topBar.setCommander(level); }

  /** @returns {void} repaint SquadBar from the live platoon — call once `BaseArmy.enable()` has deployed it (S54: Hud.enable() runs before BaseArmy.enable() in WorldScene) */
  refreshSquadBar() { this._squadBar.refresh(); }

  /** @param {number} sx @param {number} sy screen px @returns {number} SquadBar slot index under the point, or -1 (S71 drag-from-squad-bar) */
  squadBarSlotAt(sx, sy) { return this._squadBar.slotIndexAt(sx, sy); }

  /** @param {boolean} collapsed @returns {void} S78 — roll the squad bar down + hide (or back up + show) while the base's buildings are/aren't interactive */
  setSquadBarCollapsed(collapsed) { this._squadBar.setCollapsed(collapsed); }

  /** @param {number} dt seconds @returns {void} */
  update(dt) { this._topBar.update(dt); }

  /** @returns {boolean} the UNITS grid is mid-scroll-drag — Game suppresses camera-pan */
  isDraggingUnitsMenu() { return this._unitsMenu.isDraggingScroll(); }

  /** @returns {{x:number,y:number,w:number,h:number}} NavBar's own bar area — BuildingUpgradeScreen (owned by BaseSite) anchors its shell to this, same as ArmyMenu */
  get navBarRect() { return this._navBar.rect; }

  /**
   * Does the HUD own this screen point? (OrderController skips such taps.)
   * @param {number} sx @param {number} sy @returns {boolean}
   */
  hitTest(sx, sy) {
    return this._navPanel.isOpen || this._unitsMenu.isOpen || this._armyMenu.hitTest(sx, sy)
      || this._navBar.hitTest(sx, sy) || this._topBar.hitTest(sx, sy)
      || this._squadBar.hitTest(sx, sy) || this._mapButtons.hitTest(sx, sy);
  }

  /**
   * Position-independent: is a full HUD overlay open right now? (`INPUT_PAN`
   * carries no x,y to hit-test against — see `Game._wireInput`'s own doc on
   * why pan/zoom need this instead of `hitTest` — and a full-screen overlay
   * must block a gesture that starts ANYWHERE on it, not just inside one of
   * its own sub-rects.) Deliberately narrower than `hitTest`: NavBar/TopBar/
   * SquadBar/MapButtons are small persistent buttons, not blocking overlays.
   * @returns {boolean}
   */
  isAnyOverlayOpen() { return this._navPanel.isOpen || this._unitsMenu.isOpen || this._armyMenu.isOpen; }

  /** @private */
  _layout() {
    const { width, height } = this._renderer.app.screen;
    this._topBar.layout(width, height);
    this._navBar.layout(width, height);
    this._squadBar.layout(this._navBar.rect); // second row, directly above — same x/w
    this._navPanel.layout(width, height);
    this._unitsMenu.layout(width, height);
    this._armyMenu.layout(this._navBar.rect); // matches NavBar's own x/width — "an extension of the menu"
    this._mapButtons.layout(width, height);
  }

  /**
   * @private INPUT_TAP router: panel dismiss > nav tab > squad slot > map
   * button. `Hud` and `BuildingContext` are two INDEPENDENT `INPUT_TAP`
   * subscribers (`EventEmitter.emit` runs every listener, not just the
   * first that "claims" it) — a tap `BuildingContext` already routed to an
   * open building screen (e.g. its own back button) still reaches this
   * handler too, and without this guard it gets evaluated completely fresh
   * against the HUD's own widgets (TopBar's avatar sits in the same
   * top-left corner a full-screen building screen's own back button does —
   * the player's own report: closing a screen also opened the avatar's
   * menu). `isAnyMenuOpen()` mirrors the same gate `Game._wireInput` uses
   * for pan/zoom — any hex menu or building screen open means this tap
   * already belongs to that system, not the HUD.
   */
  _routeTap(sx, sy) {
    if (this._site.isAnyMenuOpen()) return;
    if (this._navPanel.isOpen) { this._navPanel.close(); return; }
    if (this._unitsMenu.isOpen) { this._unitsMenu.handleTap(sx, sy); return; }
    if (this._topBar.hitTest(sx, sy)) { this._topBar.handleTap(sx, sy); return; }
    // The Army panel takes its own taps, but never swallows a NavBar tap —
    // that's how the player closes it again (tapping ARMY a second time).
    if (this._armyMenu.hitTest(sx, sy) && !this._navBar.hitTest(sx, sy)) {
      this._armyMenu.handleTap(sx, sy);
      return;
    }
    const tabId = this._navBar.tabIdAt(sx, sy);
    if (tabId) {
      const wasArmyOpen = this._armyMenu.isOpen;
      this._armyMenu.close();
      this._navBar.setActive(tabId);
      if (tabId === UNITS_TAB_ID) { this._unitsMenu.open(); return; }
      if (tabId === ARMY_TAB_ID) { if (!wasArmyOpen) this._armyMenu.open(); return; }
      this._navPanel.open(tabById(tabId));
      return;
    }
    if (this._armyMenu.isOpen) { this._armyMenu.close(); return; } // a tap outside closes it
    const slotIndex = this._squadBar.slotIndexAt(sx, sy);
    if (slotIndex >= 0) { this._squadBar.selectSlot(slotIndex); return; }
    this._mapButtons.handleTap(sx, sy);
  }
}

/** @param {string} id @returns {object} the WORLD_HUD.navBar.tabs entry */
function tabById(id) {
  return WORLD_HUD.navBar.tabs.find((t) => t.id === id);
}

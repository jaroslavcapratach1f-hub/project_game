/**
 * BuildingScreensController — owns the 3 new reusable building screens
 * (`BuildingInfoScreen`, `BuildingLevelInfoScreen`, `BuildingUpgradeScreen`)
 * and the small cross-screen flow between them (Info's own "?" opens
 * Level-Info; Upgrade's own "?" does too), so `BuildingContext` itself only
 * needs a few short delegating calls — split out purely to keep
 * `BuildingContext.js` under the 150-line cap. `BaseManager.upgrade(id)`
 * (already validated/atomic — see `buildingUpgrade.js`) is the ONE place an
 * upgrade is actually applied; this file only decides WHEN to call it and
 * which screens to refresh afterward. `_nameOf` is the ONE place all 3
 * screens' display name comes from — the SAME barracks-variant-aware logic
 * `BuildingContext._describe` already uses (barracks cycles
 * Military/Tank/Artillery production and has no static
 * `BUILDING_MENU_NAMES` entry by design), so a screen title never disagrees
 * with the hex menu's own title for the same building.
 */
import { BUILDING_MENU_NAMES } from '../config/BuildingMenuConfig.js';
import { BASE } from '../config/BaseConfig.js';
import { label as barracksLabel } from '../systems/DynamicBarracks.js';

const BARRACKS_ID = 'barracks';

export class BuildingScreensController {
  /**
   * @param {{info:import('../ui/hud/BuildingInfoScreen.js').BuildingInfoScreen,
   *   levelInfo:import('../ui/hud/BuildingLevelInfoScreen.js').BuildingLevelInfoScreen,
   *   upgrade:import('../ui/hud/BuildingUpgradeScreen.js').BuildingUpgradeScreen,
   *   production:import('../ui/hud/ProductionScreen.js').ProductionScreen,
   *   barracksDetail:import('../ui/hud/BarracksDetailScreen.js').BarracksDetailScreen,
   *   researchScreen:import('../ui/hud/ResearchScreen.js').ResearchScreen}} screens
   * @param {import('./BaseSite.js').BaseSite} base
   */
  constructor({ info, levelInfo, upgrade, production, barracksDetail, researchScreen }, base) {
    this._info = info; this._levelInfo = levelInfo; this._upgrade = upgrade; this._production = production;
    this._barracksDetail = barracksDetail; this._researchScreen = researchScreen;
    this._base = base;
    this._onQuestion = (id, level) => this._openLevelInfo(id, level);
  }

  /** @returns {boolean} any of the 6 screens is open — `BuildingContext` treats this like the hex menu/panel for hit-testing + close-on-drag */
  anyOpen() { return this._info.isOpen || this._levelInfo.isOpen || this._upgrade.isOpen || this._production.isOpen || this._barracksDetail.isOpen || this._researchScreen.isOpen; }

  /** @returns {void} close all 6 — mirrors `BuildingContext._closeAll` */
  closeAll() { this._info.close(); this._levelInfo.close(); this._upgrade.close(); this._production.close(); this._barracksDetail.close(); this._researchScreen.close(); }

  /** @returns {void} live countdown tick for the Production/Research screens (TimedJob is timestamp-based — nothing else here needs a per-frame tick) */
  update() { this._production.refresh(); this._researchScreen.refresh(); }

  /** @param {number} sx @param {number} sy @returns {boolean} true if one of the 6 screens owned this tap */
  handleTap(sx, sy) {
    if (this._researchScreen.isOpen) return this._researchScreen.handleTap(sx, sy);
    if (this._barracksDetail.isOpen) return this._barracksDetail.handleTap(sx, sy);
    if (this._upgrade.isOpen) return this._upgrade.handleTap(sx, sy);
    if (this._levelInfo.isOpen) return this._levelInfo.handleTap(sx, sy);
    if (this._production.isOpen) return this._production.handleTap(sx, sy);
    if (this._info.isOpen) return this._info.handleTap(sx, sy);
    return false;
  }

  /** @returns {void} the hex menu's own RESEARCH action, Research Center only (unique:1 — no index needed) */
  openResearch() { this._researchScreen.open(this._base.research, this._base.resources); }

  /**
   * @param {number} index Factory's own index in BaseManager.buildings
   * @returns {void} the hex menu's own PRODUCE action (Factory only)
   */
  openProduction(index) {
    this._production.open(index, this._nameOf('engineering'), this._base.engineering, this._base.resources);
  }

  /** @param {number} index this barracks' own TRUE index in BaseManager.buildings (not a barracks-only sub-index — see Buildings3D.js's own doc) @returns {void} the hex menu's own VIEW action, barracks only */
  openBarracksDetail(index) { this._barracksDetail.open(index, this._base.base); }

  /** @param {string} id @param {number} level @returns {void} the hex menu's own INFO action */
  openInfo(id, level) { this._info.open(id, level, this._nameOf(id), this._onQuestion); }

  /** @param {string} id @param {number} level @returns {void} the hex menu's own UPGRADE action — Army-shell-sized, see BuildingUpgradeScreen's own doc */
  openUpgrade(id, level) {
    this._upgrade.open(id, level, {
      name: this._nameOf(id), hqLevel: this._base.hqLevel, resources: this._base.resources,
      onQuestion: this._onQuestion, onUpgradeComplete: () => this._pressUpgrade(id),
    });
  }

  /** @returns {void} re-check affordability (RESOURCE_CHANGED — production is continuous, so this can flip every few seconds) */
  refreshAfford() { if (this._upgrade.isOpen) this._upgrade.refresh(); }

  /** @private @param {string} id @returns {string} barracks-variant-aware display name — see this class's own doc */
  _nameOf(id) {
    if (id !== BARRACKS_ID) return BUILDING_MENU_NAMES[id] ?? BASE.labels[id] ?? id;
    const b = this._base.base.buildings.find((x) => x.id === id);
    return barracksLabel(b.variant);
  }

  /** @private @param {string} id @param {number} level */
  _openLevelInfo(id, level) {
    this._info.close(); this._upgrade.close();
    this._levelInfo.open(id, level, this._base.hqLevel, this._nameOf(id));
  }

  /**
   * @private pay + apply via the SAME validated path the old small panel
   * already used (`BaseManager.upgrade` re-checks affordability fresh
   * against the CURRENT state — a double-press can't double-spend, the
   * second call just fails if the first already spent the resources), then
   * re-open with the building's new real level — NOT a bare refresh, which
   * would just redraw the same stale level/cost the screen already had.
   * @param {string} id
   */
  _pressUpgrade(id) {
    if (!this._base.base.upgrade(id)) return;
    const b = this._base.base.buildings.find((x) => x.id === id);
    this.openUpgrade(id, b.level);
  }
}

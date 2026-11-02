/**
 * BuildingUpgradeContent — the body of `BuildingUpgradeScreen`: FEATURES
 * UNLOCKED (deltas only, never next-level totals — `buildingStatDeltas`),
 * then `BuildingCostSections` (Material Cost + Resource Cost), then the
 * UPGRADE button. Pressing it calls `BaseManager.upgrade(id)` (already
 * validates level cap + affordability + deducts resources/materials/
 * applies the new level atomically — see `buildingUpgrade.js`; this file
 * adds no second validation path) then re-pulls fresh state via
 * `refresh()`. Split: `BuildingCostSections.js` owns Material/Resource
 * Cost, purely to keep this file under the 150-line cap.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BUILDING_UPGRADE as C } from '../../config/BuildingScreenConfig.js';
import { BUILDINGS, effectiveMaxLevel, upgradeCost } from '../../config/BuildingConfig.js';
import { buildingStatDeltas } from '../../config/BuildingStatsConfig.js';
import { ResourceStatIcon } from './ResourceStatIcon.js';
import { BuildingCostSections } from './BuildingCostSections.js';

const HALF = 0.5;
const STAT_ICON_COLOR = { moneyPerHour: 0xc9c9c2, steelPerHour: 0x9aa0a6, oilPerHour: 0x6f8f35, power: 0xffd23c, buildPoints: 0xc5a55a };

export class BuildingUpgradeContent {
  /** @param {import('../../utils/EventEmitter.js').EventEmitter} _events unused — kept for the sibling-screen constructor shape */
  constructor(_events) {
    this.view = new Container();
    this._id = null; this._level = 1; this._cap = 1; this._hqLevel = 1;
    this._resources = null; this._onUpgradeComplete = null;
    this._cost = null;
    this._featuresTitle = new Text({ text: 'FEATURES UNLOCKED', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.sectionTitlePx, fill: C.sectionTitleColor, fontWeight: 'bold' }) });
    this._featuresRule = new Graphics();
    /** @private @type {{icon:ResourceStatIcon,label:Text,value:Text,key:string}[]} */ this._features = [];
    this._costs = new BuildingCostSections();
    this._btnBg = new Graphics();
    this._btnLabel = new Text({ text: C.btnLabel, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.btnLabelPx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._btnLabel.anchor.set(HALF);
    this._btnRect = { x: 0, y: 0, w: 0, h: 0 };
    this.view.addChild(this._featuresTitle, this._featuresRule, this._costs.view, this._btnBg, this._btnLabel);
  }

  /** @returns {number} */ get level() { return this._level; }
  /** @returns {number} */ get cap() { return this._cap; }
  /** @returns {boolean} no scrollable content in this screen — kept for interface parity with sibling screens */
  isDraggingScroll() { return false; }

  /** @returns {void} */ enable() {}
  /** @returns {void} */ disable() {}

  /**
   * @param {string} id @param {number} level @param {number} hqLevel
   * @param {object} resources `ResourceManager` @param {()=>void} onUpgradeComplete
   * @returns {void}
   */
  setBuilding(id, level, hqLevel, resources, onUpgradeComplete) {
    this._id = id; this._hqLevel = hqLevel; this._resources = resources; this._onUpgradeComplete = onUpgradeComplete;
    this._cap = effectiveMaxLevel(id, hqLevel);
    this._absoluteMax = BUILDINGS[id].max;
    this._pull(level);
  }

  /** @returns {void} re-read the building's current level + affordability (a resource tick, or after upgrading) */
  refresh() { if (this._id) this._pull(this._level); }

  /**
   * @param {{x:number,y:number,w:number,h:number}} rect `rect.h` is unused —
   *   this screen never scrolls (the player's own explicit instruction:
   *   every section must fit on one screen), so the UPGRADE button flows
   *   right after the cost sections rather than pinning to `rect`'s bottom
   *   edge (pinning there clipped/overlapped it whenever real content ran
   *   past the estimated height instead of under it).
   * @returns {number} natural content height from `rect.y` — purely
   *   informational (e.g. for a dev-time "does this fit?" check).
   */
  layout(rect) {
    const y1 = this._layoutFeatures(rect.x, rect.y, rect.w) + C.sectionGapPx;
    const y2 = this._costs.layout(rect.x, y1, rect.w) + C.sectionGapPx;
    this._layoutButton(rect.x, y2, rect.w);
    return y2 + C.btnHeightPx - rect.y;
  }

  /** @param {number} sx @param {number} sy @returns {void} hit-tests the UPGRADE button only; the owner (`BuildingContext`) actually calls `BaseManager.upgrade(id)` and refreshes every open screen */
  handleTap(sx, sy) {
    const r = this._btnRect;
    const hit = sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
    if (hit && this._level < this._cap && this._canUpgrade()) this._onUpgradeComplete?.();
  }

  /**
   * @private re-read level/cost/afford from real data and rebuild every
   * child. `atCap` (can't upgrade RIGHT NOW) splits into two real, distinct
   * reasons the player's own words asked to tell apart: `trueMax` (this
   * building has hit its own absolute ceiling, `BUILDINGS[id].max` —
   * nothing left, ever) vs. HQ-gated (`effectiveMaxLevel` is lower than
   * that ceiling only because the CURRENT headquarters level caps it —
   * upgrading HQ raises this building's own cap immediately, no separate
   * unlock needed).
   */
  _pull(level) {
    this._level = level;
    const atCap = level >= this._cap;
    this._trueMax = atCap && this._cap >= this._absoluteMax;
    this._hqGated = atCap && !this._trueMax;
    this._cost = atCap ? null : upgradeCost(this._id, level + 1);
    this._rebuildFeatures(this._trueMax);
    this._costs.setCost(this._cost, this._resources);
  }

  /** @private @returns {boolean} every resource + material line item is affordable, and not already maxed */
  _canUpgrade() { return Boolean(this._cost) && this._resources.canAfford(this._cost); }

  /** @private @param {boolean} trueMax hide the preview only at the building's real ceiling — an HQ-gated level still shows what upgrading unlocks, the button/caption explains why it's locked for now */
  _rebuildFeatures(trueMax) {
    for (const f of this._features) { f.icon.destroy(); f.label.destroy(); f.value.destroy(); }
    this._features = [];
    this._featuresTitle.text = trueMax ? 'FEATURES UNLOCKED (MAX LEVEL)' : 'FEATURES UNLOCKED';
    if (trueMax) return;
    const fam = WORLD_HUD.fontFamily;
    for (const d of buildingStatDeltas(this._id, this._level, this._level + 1)) {
      const icon = new ResourceStatIcon();
      // wordWrapWidth is a placeholder here — _layoutFeatures sets it to the
      // REAL tile width once known (using the fixed floor constant instead
      // made labels wrap to 2 lines even when the actual tile had plenty of
      // room, e.g. only 1-2 features sharing the full row width).
      const label = new Text({ text: d.label, style: new TextStyle({ fontFamily: fam, fontSize: C.featureLabelPx, fill: WORLD_HUD.dimColor, align: 'center', wordWrap: true, wordWrapWidth: C.featureTileMinWidthPx }) });
      const value = new Text({ text: d.display, style: new TextStyle({ fontFamily: fam, fontSize: C.featureValuePx, fill: C.featureValueColor, fontWeight: 'bold' }) });
      label.anchor.set(HALF, 0); value.anchor.set(HALF, 0);
      this._features.push({ icon, label, value, key: d.key });
      this.view.addChild(icon.view, label, value);
    }
  }

  /** @private @returns {number} bottom y */
  _layoutFeatures(x, y, w) {
    this._featuresTitle.position.set(x, y);
    y += C.sectionTitlePx + 6;
    this._featuresRule.clear().rect(x, y, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha });
    y += 10;
    if (this._features.length === 0) return y;
    const n = this._features.length, tileW = Math.max(C.featureTileMinWidthPx, (w - C.featureTileGapPx * (n - 1)) / n);
    const labelY = y + C.featureIconR * 2 + 6;
    for (let i = 0; i < n; i++) {
      const f = this._features[i], cx = x + i * (tileW + C.featureTileGapPx) + tileW * HALF;
      f.icon.draw(f.key, cx, y + C.featureIconR, C.featureIconR, STAT_ICON_COLOR[f.key] ?? 0xc9c9c2);
      f.label.style.wordWrapWidth = tileW;
      f.label.position.set(cx, labelY);
      // label can wrap to 2 lines inside this narrow tile (e.g. "Military
      // Funds Production") — place the value below its REAL measured
      // height, not a fixed single-line offset, or a wrapped 2nd line
      // overlaps the value text underneath it.
      f.value.position.set(cx, labelY + f.label.height + 2);
    }
    const maxLabelH = Math.max(...this._features.map((f) => f.label.height));
    return labelY + maxLabelH + 2 + C.featureValuePx + 8;
  }

  /** @private */
  _layoutButton(x, y, w) {
    const locked = this._trueMax || this._hqGated, cantAfford = !locked && !this._canUpgrade();
    this._btnRect = { x, y, w, h: C.btnHeightPx };
    this._btnBg.clear().roundRect(x, y, w, C.btnHeightPx, C.btnRadiusPx)
      .fill({ color: locked ? C.btnLockedColor : C.btnColor, alpha: cantAfford ? C.btnDisabledAlpha : 1 })
      .stroke({ color: locked ? C.btnLockedStroke : C.btnStroke, width: 2, alpha: cantAfford ? C.btnDisabledAlpha : 1 });
    this._btnLabel.style.fill = locked ? C.btnLockedLabelColor : WORLD_HUD.accentColor;
    this._btnLabel.text = this._trueMax ? C.maxLabel
      : this._hqGated ? `${C.hqGateLabelPrefix}${this._level + 1}${C.hqGateLabelSuffix}`
      : C.btnLabel;
    this._btnLabel.position.set(x + w * HALF, y + C.btnHeightPx * HALF);
  }
}

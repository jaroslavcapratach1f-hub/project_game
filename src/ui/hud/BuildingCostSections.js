/**
 * BuildingCostSections — MATERIAL COST (one item card per required special
 * material, owned/required — never a storage/collect concept, that doesn't
 * exist here) + RESOURCE COST (plain icon + amount per real core resource)
 * for `BuildingUpgradeContent`. Split out purely to keep that file under
 * the 150-line cap; owns its own child Graphics/Text, `layout()` returns
 * the next section's own start Y so the caller can chain sections.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BUILDING_UPGRADE as C } from '../../config/BuildingScreenConfig.js';
import { MATERIALS, MATERIAL_TIER_COLOR } from '../../config/MaterialsConfig.js';
import { CORE_RESOURCE_KEYS } from '../../config/ResourceConfig.js';
import { drawMaterialIcon } from './BuildingIconDraw.js';
import { ResourceStatIcon } from './ResourceStatIcon.js';

const HALF = 0.5;
const ROW_PAD_PX = 6, TITLE_GAP_PX = 6, RULE_GAP_PX = 10;

export class BuildingCostSections {
  constructor() {
    this.view = new Container();
    this._materialTitle = mkTitle('MATERIAL COST');
    this._resourceTitle = mkTitle('RESOURCE COST');
    this._materialRule = new Graphics(); this._resourceRule = new Graphics();
    /** @private @type {{bg:Graphics,icon:Graphics,qty:Text,key:string,short:boolean}[]} */ this._materials = [];
    /** @private @type {{icon:ResourceStatIcon,value:Text,key:string}[]} */ this._resourceRows = [];
    this.view.addChild(this._materialTitle, this._materialRule, this._resourceTitle, this._resourceRule);
  }

  /** @param {?{materials:Object<string,number>}} cost @param {object} resources `ResourceManager` @returns {void} rebuild both sections from real cost + live balances */
  setCost(cost, resources) {
    for (const m of this._materials) { m.bg.destroy(); m.icon.destroy(); m.qty.destroy(); }
    this._materials = [];
    for (const r of this._resourceRows) { r.icon.destroy(); r.value.destroy(); }
    this._resourceRows = [];
    if (!cost) return;
    const owned = resources.materials;
    for (const key in cost.materials) {
      const bg = new Graphics(), icon = new Graphics();
      const req = cost.materials[key], have = owned[key] ?? 0;
      const qty = new Text({ text: `${Math.min(have, req)}/${req}`, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.materialQtyPx, fill: have >= req ? C.materialOkColor : C.materialShortColor, fontWeight: 'bold' }) });
      qty.anchor.set(1, 1);
      this._materials.push({ bg, icon, qty, key, short: have < req });
      this.view.addChild(bg, icon, qty);
    }
    const bal = resources.balances;
    for (const key of CORE_RESOURCE_KEYS) {
      const amount = cost[key];
      if (!amount) continue;
      const icon = new ResourceStatIcon();
      const short = bal[key] < amount;
      const value = new Text({ text: Math.round(amount).toLocaleString('en-US'), style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.resourceValuePx, fill: short ? C.resourceShortColor : C.resourceOkColor, fontWeight: 'bold' }) });
      this._resourceRows.push({ icon, value, key });
      this.view.addChild(icon.view, value);
    }
  }

  /** @param {number} x @param {number} y @param {number} w @returns {number} the Y just below both sections */
  layout(x, y, w) {
    y = this._layoutMaterials(x, y, w) + C.sectionGapPx;
    return this._layoutResources(x, y, w);
  }

  /** @private @returns {number} bottom y */
  _layoutMaterials(x, y, w) {
    this._materialTitle.position.set(x, y);
    y += C.sectionTitlePx + TITLE_GAP_PX;
    this._materialRule.clear().rect(x, y, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha });
    y += RULE_GAP_PX;
    if (this._materials.length === 0) return y;
    for (let i = 0; i < this._materials.length; i++) {
      const m = this._materials[i], mx = x + i * (C.materialCardSizePx + C.materialCardGapPx);
      const tier = MATERIALS[m.key]?.tier ?? 1;
      m.bg.clear().roundRect(mx, y, C.materialCardSizePx, C.materialCardSizePx, C.materialCardRadiusPx)
        .fill({ color: C.materialCardBg, alpha: C.materialCardBgAlpha })
        .stroke({ color: m.short ? C.materialShortColor : C.materialCardStroke, width: m.short ? 1.5 : 1, alpha: m.short ? 1 : 0.5 });
      m.icon.clear();
      drawMaterialIcon(m.icon, mx + C.materialCardSizePx * HALF, y + C.materialCardSizePx * 0.42, C.materialCardSizePx * 0.26, MATERIAL_TIER_COLOR[(tier - 1) % MATERIAL_TIER_COLOR.length]);
      m.qty.position.set(mx + C.materialCardSizePx - ROW_PAD_PX, y + C.materialCardSizePx - 4);
    }
    return y + C.materialCardSizePx;
  }

  /** @private @returns {number} bottom y */
  _layoutResources(x, y, w) {
    this._resourceTitle.position.set(x, y);
    y += C.sectionTitlePx + TITLE_GAP_PX;
    this._resourceRule.clear().rect(x, y, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha });
    y += RULE_GAP_PX + C.resourceIconR;
    let rx = x + C.resourceIconR;
    for (const r of this._resourceRows) {
      r.icon.draw(r.key, rx, y, C.resourceIconR, 0xc9c9c2);
      r.value.anchor.set(0, HALF);
      r.value.position.set(rx + C.resourceIconR + ROW_PAD_PX, y);
      rx += C.resourceIconR + ROW_PAD_PX + r.value.width + C.resourceGapPx;
    }
    return y + C.resourceIconR + RULE_GAP_PX;
  }
}

/** @param {string} text @returns {Text} a section-title Text, matching BuildingUpgradeContent's own */
function mkTitle(text) {
  return new Text({ text, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.sectionTitlePx, fill: C.sectionTitleColor, fontWeight: 'bold' }) });
}

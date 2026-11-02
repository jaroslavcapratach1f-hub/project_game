/**
 * ResearchNodeAction — one research node's own real cost row
 * (`ResourceStatIcon`, the exact same real-art icons the Upgrade screen's
 * own cost display uses — `BuildingCostSections.js` is the precedent this
 * mirrors) + the Start/Disabled/Active/Maxed control. Split out of
 * `ResearchNodeCard` purely to keep that file focused.
 *
 * The cost row's icons are a PERSISTENT pool (one per `CORE_RESOURCE_KEYS`
 * entry, created once in the constructor), toggled visible/hidden per
 * `setState` call rather than destroyed and recreated — `setState` fires
 * every frame while the detail popup is open (its live countdown refresh),
 * and recreating `ResourceStatIcon`s that often meant a brand-new,
 * untextured `Sprite` every frame while its real-art texture loaded back
 * in (always a real async `Assets.load`, even cache-hit), a visible
 * flicker the player explicitly caught ("resources icons is flickering").
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_TREE as C } from '../../config/ResearchScreenConfig.js';
import { CORE_RESOURCE_KEYS } from '../../config/ResourceConfig.js';
import { ResourceStatIcon } from './ResourceStatIcon.js';
import { fmtDuration } from './ProductionQueuePanel.js';

const HALF = 0.5;
const COST_VALUE_GAP = 4;

export class ResearchNodeAction {
  constructor() {
    this.view = new Container();
    /** @private @type {{key:string,icon:ResourceStatIcon,value:Text,active:boolean}[]} one per possible resource, created ONCE — never destroyed/recreated per setState */
    this._costItems = CORE_RESOURCE_KEYS.map((key) => {
      const icon = new ResourceStatIcon();
      const value = new Text({ text: '', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.costValuePx, fontWeight: 'bold' }) });
      value.anchor.set(0, HALF);
      icon.view.visible = false; value.visible = false;
      this.view.addChild(icon.view, value);
      return { key, icon, value, active: false };
    });
    this._barBg = new Graphics(); this._barFill = new Graphics(); this._btnBg = new Graphics();
    this._btnLabel = new Text({ text: '', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.action.labelPx, fontWeight: 'bold' }) });
    this._btnLabel.anchor.set(HALF);
    this.view.addChild(this._barBg, this._barFill, this._btnBg, this._btnLabel);
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._mode = 'disabled'; this._job = null;
  }

  /** @returns {void} */
  destroy() { for (const c of this._costItems) c.icon.destroy(); }

  /**
   * @param {?{money?:number,steel?:number,oil?:number}} cost null only when maxed (no next rank to buy) — shown even
   * while locked, so the player can see what to save up for (the player's own explicit ask)
   * @param {object} resources a ResourceManager (for live balances)
   * @param {'start'|'disabled'|'active'|'maxed'|'locked'} mode
   * @param {?{remainingMs:number,progress:number}} job only meaningful for 'active'
   * @returns {void}
   */
  setState(cost, resources, mode, job) {
    this._mode = mode; this._job = job;
    const bal = resources.balances;
    for (const c of this._costItems) {
      const amount = cost ? cost[c.key] : undefined;
      c.active = Boolean(amount);
      c.icon.view.visible = c.active; c.value.visible = c.active;
      if (!c.active) continue;
      const short = bal[c.key] < amount;
      c.value.text = Math.round(amount).toLocaleString('en-US');
      c.value.style.fill = short ? 0xff6b35 : 0xc9c9c2;
    }
  }

  /** @returns {boolean} the control is currently tappable */ get interactive() { return this._mode === 'start'; }

  /** @param {number} x @param {number} y @param {number} w @returns {number} the Y just below this control */
  layout(x, y, w) {
    let cy = y;
    const costRow = this._costItems.filter((c) => c.active);
    if (costRow.length) {
      let rx = x + C.resourceIconR;
      for (const c of costRow) {
        c.icon.draw(c.key, rx, cy + C.resourceIconR, C.resourceIconR, 0xc9c9c2);
        c.value.position.set(rx + C.resourceIconR + COST_VALUE_GAP, cy + C.resourceIconR);
        rx += C.resourceIconR + COST_VALUE_GAP + c.value.width + C.resourceGapPx;
      }
      cy += C.resourceIconR * 2 + 6;
    }
    const a = C.action;
    this._rect = { x, y: cy, w, h: a.heightPx };
    this._barBg.clear(); this._barFill.clear(); this._btnBg.clear();
    if (this._mode === 'active' && this._job) {
      this._barBg.roundRect(x, cy, w, a.heightPx, a.radiusPx).fill({ color: a.progressBg });
      this._barFill.roundRect(x, cy, Math.max(0, w * this._job.progress), a.heightPx, a.radiusPx).fill({ color: a.progressFill });
      this._btnLabel.text = fmtDuration(this._job.remainingMs);
      this._btnLabel.style.fill = a.progressLabelColor;
    } else {
      const bg = this._mode === 'start' ? a.startBg : this._mode === 'maxed' ? a.maxedBg : a.disabledBg;
      const color = this._mode === 'start' ? a.startColor : this._mode === 'maxed' ? a.maxedColor : a.disabledColor;
      this._btnBg.roundRect(x, cy, w, a.heightPx, a.radiusPx).fill({ color: bg, alpha: this._mode === 'disabled' ? a.disabledAlpha : 1 });
      this._btnLabel.text = this._mode === 'maxed' ? 'MAXED' : this._mode === 'locked' ? 'LOCKED' : 'RESEARCH';
      this._btnLabel.style.fill = color;
    }
    this._btnLabel.position.set(x + w * HALF, cy + a.heightPx * HALF);
    return cy + a.heightPx;
  }

  /** @param {number} sx @param {number} sy @returns {boolean} the Start control was tapped AND it's currently interactive */
  hit(sx, sy) {
    if (!this.interactive) return false;
    const r = this._rect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }
}

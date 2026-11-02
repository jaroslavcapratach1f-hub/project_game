/**
 * ResearchNodeDetail — the node detail popup (the player's own reference
 * screenshot): icon + "`<Label>` Lvl `<rank>`" title, a real plain-language
 * effect description, real Power gain for the rank about to be bought,
 * real time, the gate/prerequisite lines (`ResearchNodeDetailRows` —
 * moved in from the tree's own former tier header, the player's own
 * explicit instruction), and the real cost row + Start control
 * (`ResearchNodeAction`, reused verbatim — the ONE place cost/action ever
 * render now, always showing cost even while locked so the player can see
 * what to save up for — the player's own explicit ask). Scrim + centred
 * card, same modal language `BuildingInfoScreen` already uses. Deliberately
 * omits the reference's flavour quote (no real quotes exist for any node
 * — inventing one would be fabricated content) and its 2nd "pay Gold to
 * finish instantly" button (no premium-currency economy exists anywhere in
 * this game yet).
 *
 * Power gain prefers the node's own real `powerPerRank[rank-1]` (the
 * Industry tree's own exact, non-linear, per-rank numbers) when present,
 * else falls back to the original constant `PowerConfig.researchPower`
 * (every other, still-linear track). `describeEffect` does the same for
 * the % / flat stat value (`effect.perRankValues[rank-1]` vs the original
 * constant `effect.perRank`).
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_DETAIL as C } from '../../config/ResearchScreenConfig.js';
import { nodeSeconds } from '../../config/research/index.js';
import { researchPower } from '../../config/PowerConfig.js';
import { nodeLabel } from '../../systems/researchLabels.js';
import { drawNodeIcon } from './ResearchNodeIconDraw.js';
import { ResearchNodeAction } from './ResearchNodeAction.js';
import { ResearchNodeDetailRows } from './ResearchNodeDetailRows.js';
import { fmtDuration } from './ProductionQueuePanel.js';

const HALF = 0.5;
const PCT_SCALE = 100;
const MS_PER_SECOND = 1000;

/** @param {number} pct a 'pct' effect's raw fraction (e.g. 0.005) @returns {string} "0.5" not "1" — `Math.round` would lose the Industry tree's own real half-percent ranks (lvl1 is exactly 0.5%) */
function fmtPct(pct) { return (pct * PCT_SCALE).toFixed(1).replace(/\.0$/, ''); }

/** @param {object} node @param {number} rank the rank about to be bought @returns {string} real plain-language description, derived from its own effect — no invented flavor text */
function describeEffect(node, rank) {
  const label = nodeLabel(node);
  const v = node.effect.perRankValues ? node.effect.perRankValues[rank - 1] : node.effect.perRank;
  return node.effect.mode === 'pct'
    ? `Increases ${label} by ${fmtPct(v)}%.`
    : `Grants +${v} ${label}.`;
}

/** @param {object} node @param {number} rank the rank about to be bought @returns {number} real Power gain for buying exactly this rank */
function powerForRank(node, rank) {
  return node.powerPerRank ? node.powerPerRank[rank - 1] : researchPower(node.track, 1);
}

export class ResearchNodeDetail {
  /** @param {(nodeId:string)=>void} onStart called when the player taps RESEARCH */
  constructor(onStart) {
    this._onStart = onStart;
    this.view = new Container(); this.view.visible = false;
    this._scrim = new Graphics();
    this._card = new Graphics();
    this._accent = new Graphics();
    this._iconBox = new Graphics();
    this._icon = new Graphics();
    const fam = WORLD_HUD.fontFamily;
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.titlePx, fill: C.titleColor, fontWeight: 'bold' }) });
    this._closeBg = new Graphics();
    this._closeLabel = new Text({ text: '✕', style: new TextStyle({ fontFamily: fam, fontSize: 13, fill: WORLD_HUD.dimColor }) });
    this._closeLabel.anchor.set(HALF);
    this._desc = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.descPx, fill: C.descColor, wordWrap: true }) });
    this._rule1 = new Graphics(); this._rule2 = new Graphics();
    this._rows = new ResearchNodeDetailRows();
    this._action = new ResearchNodeAction();
    this.view.addChild(this._scrim, this._card, this._accent, this._iconBox, this._icon, this._title, this._closeBg, this._closeLabel,
      this._desc, this._rule1, ...this._rows.children, this._rule2, this._action.view);
    this._rect = { x: 0, y: 0, w: 0, h: 0 }; this._closeRect = { x: 0, y: 0, w: 0, h: 0 };
    this._w = 0; this._h = 0;
  }

  /** @returns {boolean} */ get isOpen() { return this.view.visible; }
  /** @returns {?string} the node this popup is currently showing, if open */ get nodeId() { return this._node?.id ?? null; }

  /** @returns {void} */ destroy() { this._action.destroy(); }

  /**
   * @param {object} node a RESEARCH_NODES entry @param {object} state from `ResearchTreeView.stateFor`
   * @param {object} resources a ResourceManager @param {number} speedMult live Research Center speed multiplier
   * @returns {void}
   */
  open(node, state, resources, speedMult) {
    this._node = node; this._state = state; this._resources = resources;
    const nextRank = Math.min(node.maxRank, state.rank + 1);
    this._title.text = `${nodeLabel(node)} Lvl ${nextRank}`;
    this._icon.clear(); drawNodeIcon(this._icon, node, C.iconBoxPx * 0.55, WORLD_HUD.textColor);
    this._desc.text = describeEffect(node, nextRank);
    const timeText = state.mode === 'maxed' || state.mode === 'active'
      ? '' : `Time: ${fmtDuration((nodeSeconds(node, nextRank) / speedMult) * MS_PER_SECOND)}`;
    this._rows.setState(state, powerForRank(node, nextRank), timeText);
    this._action.setState(state.cost, resources, state.mode, state.job);
    this.view.visible = true;
  }

  /** @returns {void} */ close() { this.view.visible = false; }

  /** @param {number} w @param {number} h @param {number} headerReservePx the screen's own current header height (resource bar + back/title row — differs by orientation, `ResearchScreen` computes it live) @returns {void} */
  layout(w, h, headerReservePx) {
    this._w = w; this._h = h;
    if (!this.view.visible) return;
    this._scrim.clear().rect(0, 0, w, h).fill({ color: C.scrim, alpha: C.scrimAlpha });
    const width = Math.min(C.maxWidthPx, w * C.widthFrac), left = (w - width) * HALF, innerW = width - C.padPx * 2;
    this._desc.style.wordWrapWidth = innerW;
    const descH = this._desc.height;
    // Dry run (relative Y, `_rows`/`_action` both report "Y just below
    // me") to measure total content height before the card's own top edge
    // is known — `_rows`' own height varies (gate/requires lines only
    // while locked), same reason `_action` already did this.
    let dryY = C.headerHPx + C.padPx + C.iconBoxPx + C.descGapPx + descH + C.rowGapPx * 2;
    dryY = this._rows.layout(0, dryY, innerW) + C.actionGapPx;
    const contentH = this._action.layout(0, dryY, innerW) + C.padPx;
    const top = Math.max(headerReservePx + 10, (h - contentH) * HALF);
    this._card.clear().roundRect(left, top, width, contentH, C.radiusPx).fill({ color: C.bg, alpha: C.bgAlpha }).stroke({ color: C.stroke, width: C.strokeWidthPx });
    this._rect = { x: left, y: top, w: width, h: contentH };
    this._accent.clear().rect(left, top, 4, C.headerHPx).fill(WORLD_HUD.accentColor);
    this._title.position.set(left + C.padPx + 8, top + C.headerHPx * HALF - C.titlePx * HALF);
    const closeCx = left + width - C.padPx - C.btnSizePx * HALF, closeCy = top + C.headerHPx * HALF;
    this._closeRect = { x: closeCx - C.btnSizePx * HALF, y: closeCy - C.btnSizePx * HALF, w: C.btnSizePx, h: C.btnSizePx };
    this._closeBg.clear().roundRect(this._closeRect.x, this._closeRect.y, C.btnSizePx, C.btnSizePx, C.btnRadiusPx)
      .fill({ color: WORLD_HUD.navBar.btnBg, alpha: WORLD_HUD.navBar.btnBgAlpha }).stroke({ color: WORLD_HUD.navBar.btnStroke, width: 1, alpha: WORLD_HUD.navBar.btnStrokeAlpha });
    this._closeLabel.position.set(closeCx, closeCy);
    let y = top + C.headerHPx + C.padPx;
    const iconX = left + (width - C.iconBoxPx) * HALF;
    this._iconBox.clear().roundRect(iconX, y, C.iconBoxPx, C.iconBoxPx, C.iconBoxRadiusPx).fill({ color: C.iconBoxBg }).stroke({ color: C.iconBoxStroke, width: 1, alpha: 0.4 });
    this._icon.position.set(iconX + C.iconBoxPx * HALF, y + C.iconBoxPx * HALF);
    y += C.iconBoxPx + C.descGapPx;
    this._desc.position.set(left + C.padPx, y); y += descH + C.rowGapPx;
    this._rule1.clear().rect(left + C.padPx, y, innerW, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha }); y += C.rowGapPx;
    y = this._rows.layout(left + C.padPx, y, innerW);
    this._rule2.clear().rect(left + C.padPx, y, innerW, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: C.ruleAlpha }); y += C.actionGapPx;
    this._action.layout(left + C.padPx, y, innerW);
  }

  /** @param {number} sx @param {number} sy ABSOLUTE screen px @returns {boolean} true if this tap was consumed */
  handleTap(sx, sy) {
    if (!this.isOpen) return false;
    if (within(this._closeRect, sx, sy) || !within(this._rect, sx, sy)) { this.close(); return true; }
    if (this._action.hit(sx, sy)) this._onStart(this._node.id);
    return true;
  }
}

/** @param {{x:number,y:number,w:number,h:number}} r @param {number} sx @param {number} sy @returns {boolean} */
function within(r, sx, sy) { return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h; }

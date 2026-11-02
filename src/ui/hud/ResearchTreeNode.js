/**
 * ResearchTreeNode — one node's own small graph widget (the player's own
 * reference): a circular "gear badge" (icon + Rank X/Y, for incremental
 * nodes) or a framed square (icon only, for one-time unlocks). The style
 * is picked MECHANICALLY from the node's own real `maxRank` — no node has
 * a hand-authored "is this a milestone" flag, so `maxRank === 1` (a single
 * one-time purchase) is the honest, data-driven stand-in for the
 * reference's square "breakthrough" cards. Locked nodes (tier/prereq not
 * met) swap to a muted grey palette instead of their real unlocked blue
 * ring. Tapping opens `ResearchNodeDetail`'s own popup — no inline cost/
 * action lives on the node itself any more.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_TREE as C } from '../../config/ResearchScreenConfig.js';
import { nodeLabel } from '../../systems/researchLabels.js';
import { drawNodeIcon } from './ResearchNodeIconDraw.js';

const HALF = 0.5;

export class ResearchTreeNode {
  constructor() {
    this.view = new Container();
    this._shape = new Graphics();
    this._icon = new Graphics();
    this._rankBg = new Graphics();
    const fam = WORLD_HUD.fontFamily, n = C.node;
    this._rankText = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: n.rankPx, fill: WORLD_HUD.textColor, fontWeight: 'bold' }) });
    this._rankText.anchor.set(HALF);
    this._label = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: n.labelPx, fill: n.labelColor, fontWeight: 'bold', align: 'center', wordWrap: true, wordWrapWidth: n.labelWidthPx }) });
    this._label.anchor.set(HALF, 0);
    this.view.addChild(this._shape, this._icon, this._rankBg, this._rankText, this._label);
    this._x = 0; this._y = 0; this._node = null;
  }

  /** @returns {void} */
  destroy() { this.view.parent?.removeChild(this.view); this.view.destroy({ children: true }); }

  /** @param {object} node a RESEARCH_NODES entry @param {{rank:number, locked:boolean, mode:string}} state @param {number} [wrapWidthPx] overrides the default label wrap width (landscape's own wider columns fit most labels on 1 line at a wider wrap than portrait's tighter 3-per-row columns) @returns {void} */
  setNode(node, state, wrapWidthPx) {
    this._node = node;
    const n = C.node, milestone = node.maxRank === 1;
    this._label.style.wordWrapWidth = wrapWidthPx ?? n.labelWidthPx;
    this._label.text = nodeLabel(node);
    const unlocked = !state.locked;
    const ring = unlocked ? n.ringColor : n.lockedRingColor;
    const fill = unlocked ? n.fillColor : n.lockedFillColor;
    const iconColor = unlocked ? n.iconColor : n.lockedIconColor;
    this._shape.clear();
    if (milestone) {
      this._shape.roundRect(-n.squareHalf, -n.squareHalf, n.squareHalf * 2, n.squareHalf * 2, n.squareRadiusPx)
        .fill(fill).stroke({ color: ring, width: n.ringWidthPx });
    } else {
      this._shape.circle(0, 0, n.circleR).fill(fill).stroke({ color: ring, width: n.ringWidthPx });
    }
    this._icon.clear();
    drawNodeIcon(this._icon, node, n.iconSizePx, iconColor);
    const maxed = state.rank >= node.maxRank;
    this._rankBg.clear();
    this._rankText.visible = !milestone; this._rankBg.visible = !milestone;
    if (!milestone) {
      this._rankText.text = maxed ? 'MAX' : `${state.rank}/${node.maxRank}`;
      const bw = this._rankText.width + n.rankPadXPx * 2;
      this._rankBg.roundRect(-bw * HALF, n.circleR - n.rankHeightPx * HALF, bw, n.rankHeightPx, n.rankRadiusPx)
        .fill({ color: n.rankBg, alpha: 0.95 }).stroke({ color: ring, width: 1 });
      this._rankText.position.set(0, n.circleR);
    }
    this._label.position.set(0, (milestone ? n.squareHalf : n.circleR) + n.labelGapPx);
  }

  /** @param {number} x @param {number} y centre @returns {void} */
  setPosition(x, y) { this._x = x; this._y = y; this.view.position.set(x, y); }

  /** @returns {{x:number,y:number,topY:number,bottomY:number,leftX:number,rightX:number}} for edge-line routing (vertical portrait layout uses top/bottom, horizontal landscape layout uses left/right) */
  get anchor() {
    const r = this._node?.maxRank === 1 ? C.node.squareHalf : C.node.circleR;
    return { x: this._x, y: this._y, topY: this._y - r, bottomY: this._y + r, leftX: this._x - r, rightX: this._x + r };
  }

  /** @returns {number} the ABSOLUTE bottom edge of this node's own (possibly multi-line, wrapped) label — row height must clear this, not just the shape's own radius, or a long label bleeds into the next row */
  get labelBottomY() { return this._y + this._label.y + this._label.height; }

  /** @returns {number} this node's own shape half-size (radius for a circle, half-side for a square) — both measured the same way from centre */
  get shapeHalf() { return this._node?.maxRank === 1 ? C.node.squareHalf : C.node.circleR; }

  /** @returns {number} the label's own measured (possibly multi-line, wrapped) height — valid right after `setNode`, independent of position */
  get labelHeight() { return this._label.height; }

  /** @param {number} sx @param {number} sy @returns {boolean} */
  contains(sx, sy) {
    const r = this._node?.maxRank === 1 ? C.node.squareHalf : C.node.circleR;
    return Math.abs(sx - this._x) <= r && Math.abs(sy - this._y) <= r;
  }
}

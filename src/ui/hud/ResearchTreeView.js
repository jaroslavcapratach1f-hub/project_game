/**
 * ResearchTreeView — one track's REAL nodes as a connected graph (the
 * player's own reference screenshots): grouped by real `tier`, each a
 * `ResearchTreeNode`, connected by dead-straight lines (`ResearchTreeEdges
 * .js`) drawn from every node to its own real `requires` parent(s) once
 * every node's position is known. No node in this codebase requires a
 * SAME-tier node (checked against every real tree file) — tiers process
 * in ascending order so a parent's position is always already known by
 * the time a child needs it; no DAG auto-layout engine was needed.
 * Tapping a node opens `ResearchNodeDetail`'s own popup — this view only
 * lays out + hit-tests. The placeholder "track" (the hub's 6th, inert
 * slot) renders a single centred message instead — same honest
 * placeholder `UnitsMenu`'s own Blueprints filter tab uses.
 *
 * Two layouts, orientation-driven (the player's own 2 reference
 * screenshots): portrait wraps each tier into rows of `maxPerRow`,
 * stacking tiers top-to-bottom (`_layoutColumn`); landscape flows tiers
 * LEFT-TO-RIGHT as columns instead, stacking each tier's own nodes
 * vertically within its column (`_layoutHorizontal`) — the player's own
 * landscape reference's exact structure, horizontally scrollable
 * (`ResearchScreen` drives the actual scroll; this just reports total
 * WIDTH instead of height when landscape).
 *
 * No tier HEADER text renders here any more (the player's own explicit
 * correction: "that tier section and Research Center requirements should
 * be on each research menu when clicked on it, not in research tree") —
 * `_nodeState` still computes the real gate (`gate: {met, label}`,
 * Research-Center-level for the Industry tree, HQ-level for every other
 * track) and hands it through `state` to `ResearchNodeDetail`'s own popup,
 * the one place it shows now.
 *
 * A `requires` entry is either a plain id string (met once that node is
 * fully MAXED — every pre-existing track) or `{id, rank}` (met once that
 * node reaches a SPECIFIC rank, not necessarily maxed — the Industry
 * tree's own real design) — `reqId()` (`ResearchModel.js`) normalizes
 * both shapes wherever a plain id is needed.
 *
 * Node POSITIONS are aligned to their own primary parent wherever there's
 * exactly one (`ResearchTreeRowLayout.js`) — the player's own explicit
 * correction ("move the icons slightly"): a straight line only reads as
 * straight-and-axis-aligned (never diagonal, `ResearchTreeEdges.js`) if
 * the two ends actually share a coordinate.
 *
 * Row/column sizing is size-aware, not a flat `circleR` constant: a group
 * can mix circular "gear" nodes (multi-rank) with the bigger square
 * "milestone" nodes (`maxRank===1` — the player's own explicit ask: the
 * pivotal unlocks like Collection Truck/Collection Sites get a bigger,
 * more prominent button) — the actual tallest/widest node in that
 * specific row/column drives spacing so neither shape ever overlaps.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_TREE as C } from '../../config/ResearchScreenConfig.js';
import { nodesInTrack, researchNode, nodeCost, tierUnlocked, TIER_HQ_GATE, reqId } from '../../config/research/index.js';
import { nodeLabel } from '../../systems/researchLabels.js';
import { ResearchTreeNode } from './ResearchTreeNode.js';
import { drawEdgesVertical, drawEdgesHorizontal } from './ResearchTreeEdges.js';
import { resolveColumnX, resolveColumnY } from './ResearchTreeRowLayout.js';

const HALF = 0.5;

export class ResearchTreeView {
  constructor() {
    this.view = new Container();
    this._lines = new Graphics();
    this._placeholderText = new Text({
      text: 'More research tracks are coming soon.',
      style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: C.placeholderPx, fill: C.placeholderColor }),
    });
    this._placeholderText.anchor.set(HALF, 0);
    this.view.addChild(this._lines, this._placeholderText);
    this._track = null; this._nodes = []; this._tiers = [];
    /** @private @type {Map<string,ResearchTreeNode>} */ this._nodeFor = new Map();
    /** @private @type {Map<string,object>} */ this._states = new Map();
    this._hqLevel = 0; this._centerLevel = 0;
  }

  /** @returns {void} */
  destroy() { this._clear(); }

  /** @param {string} track a TRACKS entry, or 'placeholder' @returns {void} rebuild widgets for the new track */
  setTrack(track) {
    if (track === this._track) return;
    this._clear();
    this._track = track;
    this._nodes = track === 'placeholder' ? [] : nodesInTrack(track);
    this._tiers = [...new Set(this._nodes.map((n) => n.tier))].sort((a, b) => a - b);
    for (const n of this._nodes) { const w = new ResearchTreeNode(); this.view.addChild(w.view); this._nodeFor.set(n.id, w); }
  }

  /**
   * @param {import('../../systems/ResearchManager.js').ResearchManager} research
   * @returns {void}
   */
  refresh(research) {
    this._hqLevel = research.hqLevel;
    this._centerLevel = research.centerLevel;
    for (const n of this._nodes) this._states.set(n.id, this._nodeState(research, n));
  }

  /** @param {number} w @param {number} h @param {boolean} landscape @returns {number} total content extent along the scroll axis (height portrait, width landscape) */
  layout(w, h, landscape) {
    this._placeholderText.visible = this._track === 'placeholder';
    if (this._track === 'placeholder') { this._placeholderText.position.set(w * HALF, 24); return 80; }
    return landscape ? this._layoutHorizontal(w, h) : this._layoutColumn(w);
  }

  /** @param {number} lx @param {number} ly LOCAL to this.view's own (0,0) origin @returns {?string} the tapped node's own id, if any */
  tapAt(lx, ly) {
    for (const n of this._nodes) if (this._nodeFor.get(n.id).contains(lx, ly)) return n.id;
    return null;
  }

  /** @param {string} nodeId @returns {?object} this node's own cached display + action state */
  stateFor(nodeId) { return this._states.get(nodeId) ?? null; }

  /** @private portrait: tiers stack top-to-bottom, each wrapped into rows of `maxPerRow` @param {number} w @returns {number} total content height */
  _layoutColumn(w) {
    const n = C.node, positions = new Map();
    let y = 0;
    for (let ti = 0; ti < this._tiers.length; ti++) {
      const tierNodesAll = this._nodes.filter((nd) => nd.tier === this._tiers[ti]);
      for (let i = 0; i < tierNodesAll.length; i += n.maxPerRow) {
        const row = tierNodesAll.slice(i, i + n.maxPerRow);
        // The column PITCH is the same everywhere (squareHalf — the bigger
        // of the two shapes), never a per-row max. A circle-only tier
        // directly above a square tier would otherwise space its own
        // nodes narrower than the squares below NEED, forcing the square
        // row to push a node off its single parent's exact X — breaking
        // the straight line the player explicitly asked for. Each node's
        // own DRAWN size still varies (`ResearchTreeNode` picks circle vs
        // square itself); only the layout slot width is now constant.
        const rowHalf = n.squareHalf;
        const placed = resolveColumnX(row, positions, (node) => this._primaryParentIds(node), rowHalf, n.colGapPx, w);
        const rowWidgets = [];
        for (const { node, coord } of placed) {
          const widget = this._nodeFor.get(node.id);
          widget.setPosition(coord, y + rowHalf);
          widget.setNode(node, this._states.get(node.id));
          positions.set(node.id, widget.anchor);
          rowWidgets.push(widget);
        }
        // A long WRAPPED label can extend past the shape's own radius — use
        // whichever is actually taller, or the next row starts drawing
        // through this row's own label text.
        const labelBottom = Math.max(...rowWidgets.map((wi) => wi.labelBottomY));
        y = Math.max(y + rowHalf * 2, labelBottom) + n.rowGapPx;
      }
      y += C.tierTopGapPx - n.rowGapPx;
    }
    drawEdgesVertical(this._lines, this._nodes, positions, n);
    return y;
  }

  /**
   * @private landscape: tiers flow left-to-right as columns, each tier's
   * own nodes stacked vertically within it — wrapped into side-by-side
   * SUB-columns of `maxPerRow` (same cap portrait's rows use) when a tier
   * has more nodes than comfortably stack in one landscape-height column
   * (a real bug caught live: Military's own 4-node tier 1 overflowed a
   * single column and clipped against the top of the screen).
   * @param {number} w @param {number} h @returns {number} total content width
   */
  _layoutHorizontal(w, h) {
    const n = C.node, positions = new Map();
    let x = n.hColGapPx * HALF;
    for (let ti = 0; ti < this._tiers.length; ti++) {
      const tierNodesAll = this._nodes.filter((nd) => nd.tier === this._tiers[ti]);
      for (const node of tierNodesAll) this._nodeFor.get(node.id).setNode(node, this._states.get(node.id), n.labelWidthLandscapePx);
      for (let i = 0; i < tierNodesAll.length; i += n.maxPerRow) {
        const col = tierNodesAll.slice(i, i + n.maxPerRow);
        // Same fix as the portrait column pitch above: a constant slot
        // half-size (squareHalf) across every tier, not a per-column max,
        // or a circle-only column sitting directly before/after a square
        // column would use a narrower pitch than the squares need, forcing
        // a square off its single parent's exact Y.
        const colHalf = n.squareHalf;
        const footprintFor = (node) => colHalf * 2 + n.labelGapPx + this._nodeFor.get(node.id).labelHeight;
        const placed = resolveColumnY(col, positions, (node) => this._primaryParentIds(node), colHalf, footprintFor, n.hRowGapPx, h);
        const cx = x + colHalf;
        for (const { node, coord } of placed) {
          const widget = this._nodeFor.get(node.id);
          widget.setPosition(cx, coord);
          positions.set(node.id, widget.anchor);
        }
        x += colHalf * 2 + n.hSubColGapPx;
      }
      x += n.hColGapPx - n.hSubColGapPx;
    }
    drawEdgesHorizontal(this._lines, this._nodes, positions, n);
    return x;
  }

  /** @private @param {object} node @returns {string[]} ids of this node's own IMMEDIATE (tier-adjacent) requires parents — the ones `ResearchTreeEdges.js` actually draws, so position alignment matches what's drawn */
  _primaryParentIds(node) {
    return node.requires.map(reqId).filter((pid) => researchNode(pid)?.tier === node.tier - 1);
  }

  /** @private @param {import('../../systems/ResearchManager.js').ResearchManager} research @param {object} node @returns {object} this node's own display + action state */
  _nodeState(research, node) {
    const rank = research.rankOf(node.id), maxed = rank >= node.maxRank, job = research.jobFor(node.id);
    const tierLocked = node.minCenterLevel !== undefined
      ? research.centerLevel < node.minCenterLevel
      : !tierUnlocked(node.tier, research.hqLevel);
    const gate = {
      met: !tierLocked,
      label: node.minCenterLevel !== undefined ? `Research Center Lvl ${node.minCenterLevel}` : `HQ Lvl ${TIER_HQ_GATE[node.tier]}`,
    };
    let requires = null;
    if (node.requires.length) {
      const met = node.requires.every((r) => {
        const rid = reqId(r), rn = researchNode(rid);
        const needRank = typeof r === 'string' ? (rn?.maxRank ?? 1) : (r.rank ?? rn?.maxRank ?? 1);
        return research.rankOf(rid) >= needRank;
      });
      requires = { label: node.requires.map((r) => nodeLabel(researchNode(reqId(r)))).join(', '), met };
    }
    const prereqLocked = Boolean(requires && !requires.met);
    const locked = tierLocked || prereqLocked;
    if (maxed) return { rank, locked, requires, gate, mode: 'maxed', cost: null, job: null };
    if (job) return { rank, locked, requires, gate, mode: 'active', cost: nodeCost(node, rank + 1), job };
    const cost = nodeCost(node, rank + 1);
    if (locked) return { rank, locked, requires, gate, mode: 'locked', cost, job: null };
    return { rank, locked: false, requires, gate, mode: research.canStart(node.id) ? 'start' : 'disabled', cost, job: null };
  }

  /** @private */
  _clear() {
    for (const w of this._nodeFor.values()) w.destroy();
    this._nodeFor = new Map();
    this._states = new Map();
  }
}

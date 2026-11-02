/**
 * ResearchTreeEdges — groups every tier-transition's PRIMARY edges (parent
 * in the tier immediately before the child's own) into connected
 * components over the parent/child bipartite graph, then draws each
 * component as either a single straight line (1 parent, 1 child — the row
 * layout's own primary-parent alignment, `ResearchTreeRowLayout.js`,
 * already makes this perfectly vertical in portrait / horizontal in
 * landscape) or a bus-bar junction (2+ edges: a straight stub from each
 * parent to one shared bus line, the bus line itself, then a straight
 * stub from the bus to each child). Every segment drawn here is strictly
 * horizontal or strictly vertical, never diagonal and never bent anywhere
 * but the shared bus (the player's own explicit correction: "only
 * straight lines from left to right and from up to down").
 *
 * A `requires` entry that skips a tier (the Military tree's own real
 * design — a node gated on both its immediate-tier sibling AND a
 * generic stat node further back) is still fully enforced for gating and
 * still shown in the popup's "Requires:" line — it's just never part of
 * this graph, since a straight line that far back would necessarily cut
 * through the intermediate tier's own row.
 */
import { reqId } from '../../config/research/index.js';

/** @param {object[]} nodes @returns {{parentId:string,childId:string}[]} every PRIMARY requires edge in this track */
function primaryEdges(nodes) {
  const tierOf = new Map(nodes.map((nd) => [nd.id, nd.tier]));
  const out = [];
  for (const node of nodes) {
    for (const r of node.requires) {
      const pid = reqId(r);
      if (tierOf.get(pid) === node.tier - 1) out.push({ parentId: pid, childId: node.id });
    }
  }
  return out;
}

/** @param {{parentId:string,childId:string}[]} edges @returns {{parents:Set<string>,children:Set<string>}[]} connected components over the bipartite parent/child graph */
function groupEdges(edges) {
  const parentAdj = new Map(), childAdj = new Map();
  for (const e of edges) {
    if (!parentAdj.has(e.parentId)) parentAdj.set(e.parentId, new Set());
    parentAdj.get(e.parentId).add(e.childId);
    if (!childAdj.has(e.childId)) childAdj.set(e.childId, new Set());
    childAdj.get(e.childId).add(e.parentId);
  }
  const seenP = new Set(), seenC = new Set(), groups = [];
  for (const e of edges) {
    if (seenP.has(e.parentId) && seenC.has(e.childId)) continue;
    const parents = new Set(), children = new Set(), queue = [['p', e.parentId]];
    while (queue.length) {
      const [type, id] = queue.pop();
      if (type === 'p') {
        if (seenP.has(id)) continue;
        seenP.add(id); parents.add(id);
        for (const c of parentAdj.get(id) ?? []) if (!seenC.has(c)) queue.push(['c', c]);
      } else {
        if (seenC.has(id)) continue;
        seenC.add(id); children.add(id);
        for (const p of childAdj.get(id) ?? []) if (!seenP.has(p)) queue.push(['p', p]);
      }
    }
    groups.push({ parents, children });
  }
  return groups;
}

/** @param {import('pixi.js').Graphics} lines @param {object[]} nodes @param {Map<string,object>} positions @param {object} n `RESEARCH_TREE.node` @returns {void} */
export function drawEdgesVertical(lines, nodes, positions, n) {
  lines.clear();
  for (const group of groupEdges(primaryEdges(nodes))) {
    const parents = [...group.parents].map((id) => positions.get(id)).filter(Boolean);
    const children = [...group.children].map((id) => positions.get(id)).filter(Boolean);
    if (!parents.length || !children.length) continue;
    if (parents.length === 1 && children.length === 1) {
      lines.moveTo(parents[0].x, parents[0].bottomY).lineTo(children[0].x, children[0].topY).stroke({ color: n.lineColor, width: n.lineWidthPx });
      continue;
    }
    const busY = (Math.max(...parents.map((p) => p.bottomY)) + Math.min(...children.map((c) => c.topY))) * 0.5;
    const xs = [...parents, ...children].map((a) => a.x);
    for (const p of parents) lines.moveTo(p.x, p.bottomY).lineTo(p.x, busY).stroke({ color: n.lineColor, width: n.lineWidthPx });
    lines.moveTo(Math.min(...xs), busY).lineTo(Math.max(...xs), busY).stroke({ color: n.lineColor, width: n.lineWidthPx });
    for (const c of children) lines.moveTo(c.x, busY).lineTo(c.x, c.topY).stroke({ color: n.lineColor, width: n.lineWidthPx });
  }
}

/** @param {import('pixi.js').Graphics} lines @param {object[]} nodes @param {Map<string,object>} positions @param {object} n `RESEARCH_TREE.node` @returns {void} */
export function drawEdgesHorizontal(lines, nodes, positions, n) {
  lines.clear();
  for (const group of groupEdges(primaryEdges(nodes))) {
    const parents = [...group.parents].map((id) => positions.get(id)).filter(Boolean);
    const children = [...group.children].map((id) => positions.get(id)).filter(Boolean);
    if (!parents.length || !children.length) continue;
    if (parents.length === 1 && children.length === 1) {
      lines.moveTo(parents[0].rightX, parents[0].y).lineTo(children[0].leftX, children[0].y).stroke({ color: n.lineColor, width: n.lineWidthPx });
      continue;
    }
    const busX = (Math.max(...parents.map((p) => p.rightX)) + Math.min(...children.map((c) => c.leftX))) * 0.5;
    const ys = [...parents, ...children].map((a) => a.y);
    for (const p of parents) lines.moveTo(p.rightX, p.y).lineTo(busX, p.y).stroke({ color: n.lineColor, width: n.lineWidthPx });
    lines.moveTo(busX, Math.min(...ys)).lineTo(busX, Math.max(...ys)).stroke({ color: n.lineColor, width: n.lineWidthPx });
    for (const c of children) lines.moveTo(busX, c.y).lineTo(c.leftX, c.y).stroke({ color: n.lineColor, width: n.lineWidthPx });
  }
}

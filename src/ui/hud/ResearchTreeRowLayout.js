/**
 * ResearchTreeRowLayout — positions one tier's own nodes along the CROSS
 * axis (X for a portrait row, Y for a landscape column): a node with
 * exactly one immediate (primary, tier-adjacent) parent targets that SAME
 * parent's own cross-axis coordinate — the player's own explicit ask
 * ("move the icons slightly") so the connecting line between them lands
 * dead straight (vertical in portrait, horizontal in landscape), never
 * diagonal. A node with 0 or 2+ immediate parents targets their average
 * instead. Nodes are ordered by this target, overlaps resolved in that
 * order (never reordering past a neighbour), then the whole tier is
 * re-centred within the available span.
 *
 * Portrait rows are symmetric (every node the same `rowHalf`, centred on
 * its own position) — `resolveColumnX`. Landscape columns are NOT: the
 * label sits only BELOW the shape, so each node's own real footprint
 * (shape + label) is asymmetric about its centre — `resolveColumnY` walks
 * top edges, not centres, for the overlap sweep.
 */

/** @param {object[]} tierNodes @param {(node:object)=>string[]} primaryParentIds @param {Map<string,object>} positions @param {'x'|'y'} axis @returns {{node:object,i:number,target:?number}[]} sorted by target (nulls last, original order preserved among them) */
function sortedByTarget(tierNodes, primaryParentIds, positions, axis) {
  const withTarget = tierNodes.map((node, i) => {
    const cs = primaryParentIds(node).map((pid) => positions.get(pid)?.[axis]).filter((c) => c !== undefined);
    return { node, i, target: cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : null };
  });
  const maxT = Math.max(0, ...withTarget.filter((e) => e.target !== null).map((e) => e.target));
  withTarget.sort((a, b) => (a.target ?? maxT + 1 + a.i * 1e-3) - (b.target ?? maxT + 1 + b.i * 1e-3));
  return withTarget;
}

/**
 * @param {object[]} tierNodes @param {Map<string,object>} positions already-placed parent anchors
 * @param {(node:object)=>string[]} primaryParentIds @param {number} halfSize shared row half-size @param {number} gapPx @param {number} span
 * @returns {{node:object,coord:number}[]} final X per node (coord = centre)
 */
export function resolveColumnX(tierNodes, positions, primaryParentIds, halfSize, gapPx, span) {
  const sorted = sortedByTarget(tierNodes, primaryParentIds, positions, 'x');
  const xs = [];
  for (let k = 0; k < sorted.length; k++) {
    let x = sorted[k].target ?? (k === 0 ? 0 : xs[k - 1] + halfSize * 2 + gapPx);
    if (k > 0) x = Math.max(x, xs[k - 1] + halfSize * 2 + gapPx);
    xs.push(x);
  }
  const shift = span * 0.5 - (xs[0] - halfSize + xs[xs.length - 1] + halfSize) * 0.5;
  return sorted.map((e, k) => ({ node: e.node, coord: xs[k] + shift }));
}

/**
 * @param {object[]} tierNodes @param {Map<string,object>} positions already-placed parent anchors
 * @param {(node:object)=>string[]} primaryParentIds @param {number} colHalf shared column half-size (shape only)
 * @param {(node:object)=>number} footprintFor total vertical space (shape + label) this node's own row consumes, from its own top edge
 * @param {number} gapPx @param {number} span @returns {{node:object,coord:number}[]} final Y per node (coord = shape centre)
 */
export function resolveColumnY(tierNodes, positions, primaryParentIds, colHalf, footprintFor, gapPx, span) {
  const sorted = sortedByTarget(tierNodes, primaryParentIds, positions, 'y');
  const tops = [], footprints = sorted.map((e) => footprintFor(e.node));
  for (let k = 0; k < sorted.length; k++) {
    let top = sorted[k].target !== null ? sorted[k].target - colHalf : (k === 0 ? 0 : tops[k - 1] + footprints[k - 1] + gapPx);
    if (k > 0) top = Math.max(top, tops[k - 1] + footprints[k - 1] + gapPx);
    tops.push(top);
  }
  const bottom = tops[tops.length - 1] + footprints[footprints.length - 1];
  const shift = span * 0.5 - (tops[0] + bottom) * 0.5;
  return sorted.map((e, k) => ({ node: e.node, coord: tops[k] + colHalf + shift }));
}

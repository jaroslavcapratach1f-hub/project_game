/** Continuous open trench path; shared joins replace overlapping capped tiles. */
import { DEFENCE as C, DEFENCE_TRENCH as T, DEFENCE_GATE as G } from '../config/DefencePerimeterConfig.js';

/** @param {object[]} ring offset wall polygon @returns {object[]} open path around the gate */
export function trenchPath(ring) {
  const path = [], gate = ring[C.gateEdge];
  path.push({ cx: gate.cx, cy: G.trenchHalfGap, edge: C.gateEdge });
  for (let k = 1; k <= ring.length; k++) {
    const i = (C.gateEdge + k) % ring.length, a = ring[i], b = ring[(i + 1) % ring.length];
    path.push({ ...a, edge: i });
    const dx = b.cx - a.cx, dy = b.cy - a.cy, len = Math.hypot(dx, dy);
    if (len < C.trenchBayMinLength || i === C.gateEdge) continue;
    for (const [t, offset] of [[C.trenchBayStart, 0], [C.trenchBayStart, C.trenchBayDepth],
      [C.trenchBayEnd, C.trenchBayDepth], [C.trenchBayEnd, 0]]) {
      path.push({ cx: a.cx + dx * t + dy / len * offset, cy: a.cy + dy * t - dx / len * offset, edge: i });
    }
  }
  path.push({ cx: gate.cx, cy: -G.trenchHalfGap, edge: C.gateEdge });
  return path;
}

/** @param {object[]} ring @returns {{path:object[],segments:object[],entries:object[],bridges:object[]}} */
export function trenchLayout(ring) {
  const path = trenchPath(ring), segments = path.slice(0, -1).map((a, i) => {
    const b = path[i + 1], len = Math.hypot(b.cx - a.cx, b.cy - a.cy);
    return { a, b, len, dx: (b.cx - a.cx) / len, dy: (b.cy - a.cy) / len, index: i };
  });
  const candidates = segments.filter(s => s.len >= T.featureMinLength), byEdge = new Map();
  for (const s of candidates) {
    if (!byEdge.has(s.a.edge)) byEdge.set(s.a.edge, []);
    byEdge.get(s.a.edge).push(s);
  }
  const entrySegments = [...byEdge.values()].flatMap(rows => rows.length > 1 ? [rows[0], rows.at(-1)] : rows);
  const entries = entrySegments.map(s => ({ segment: s.index, distance: s.len * T.entryFraction }));
  const count = Math.min(T.bridgeCount, candidates.length), bridges = [];
  for (let i = 0; i < count; i++) {
    const s = candidates[Math.floor(i * candidates.length / count)], d = s.len * T.bridgeFraction;
    bridges.push({ asset: 'trench_bridge', cx: s.a.cx + s.dx * d, cy: s.a.cy + s.dy * d,
      rotation: Math.atan2(s.dx, s.dy) + Math.PI / 2, y: T.bankHeight - T.bridgeDeckY });
  }
  return { path, segments, entries, bridges };
}

/** @param {object[]} ring @returns {object[]} instanced plank crossings only */
export function trenchPlacements(ring) { return trenchLayout(ring).bridges; }

/** @param {object[]} path @param {number} index @param {number} distance @returns {object} shared miter */
export function trenchOffset(path, index, distance) {
  const p = path[index], a = path[Math.max(0, index - 1)], b = path[Math.min(path.length - 1, index + 1)];
  const normal = (u, v) => { const len = Math.hypot(v.cx - u.cx, v.cy - u.cy); return [(v.cy - u.cy) / len, -(v.cx - u.cx) / len]; };
  const n = index ? normal(a, p) : normal(p, b), m = index < path.length - 1 ? normal(p, b) : n;
  const divisor = 1 + n[0] * m[0] + n[1] * m[1];
  return { cx: p.cx + distance * (n[0] + m[0]) / divisor, cy: p.cy + distance * (n[1] + m[1]) / divisor };
}

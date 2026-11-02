/** Preserve established interior placements while applying the requested 25% reduction. */
import { DEFENCE_TREES as T } from '../config/DefencePerimeterConfig.js';
const HALF = 0.5;

/** @param {object[]} trees @param {object[]} corners @param {function} allowed @returns {object[]} */
export function rebalanceDefenceTrees(trees, corners, allowed) {
  const inside = trees.filter(p => p.interior), outside = trees.filter(p => !p.interior);
  const keep = Math.round(inside.length * T.interiorRetention), reduced = [];
  for (let i = 0; i < keep; i++) {
    const p = inside[Math.floor(i * inside.length / keep)];
    reduced.push({ ...p, sx: p.sx * T.interiorSize, sy: p.sy * T.interiorSize, sz: p.sz * T.interiorSize });
  }
  const candidates = [];
  corners.forEach((a, edge) => {
    const b = corners[(edge + 1) % corners.length], len = Math.hypot(b.cx - a.cx, b.cy - a.cy);
    const dx = (b.cx - a.cx) / len, dy = (b.cy - a.cy) / len;
    for (let d = T.start; d < len - T.start; d += T.exteriorSpacing) {
      const phase = (Math.sin(d * T.variationFrequency + edge) + 1) * HALF;
      const p = { cx: a.cx + dx * d + dy * T.outerInset, cy: a.cy + dy * d - dx * T.outerInset };
      if (!allowed(p, edge) || outside.some(q => Math.hypot(q.cx - p.cx, q.cy - p.cy) < T.exteriorSpacing)) continue;
      const source = trees[(Math.floor(d) + edge) % trees.length];
      const height = T.outerScale + phase * T.outerScaleVariation;
      const width = Math.min(height * T.widthMin, T.outerWidthMax);
      candidates.push({ ...p, asset: source.asset, interior: false, rotation: phase * Math.PI * 2,
        sx: width, sy: height, sz: width });
    }
  });
  const count = Math.min(candidates.length, Math.ceil(outside.length * T.exteriorMultiplier) - outside.length);
  for (let i = 0; i < count; i++) outside.push(candidates[Math.floor(i * candidates.length / count)]);
  return [...reduced, ...outside];
}

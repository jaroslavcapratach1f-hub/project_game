/** Varied interior clusters and smaller exterior pines, clear of access routes. */
import { DEFENCE as C, DEFENCE_TREES as T, DEFENCE_TRENCH as B } from '../config/DefencePerimeterConfig.js';
import { rebalanceDefenceTrees } from './DefenceTreeDensity.js';
const PINES = ['pine_a', 'pine_b', 'pine_c'];

/** @param {object[]} corners @param {object[]} towers @param {object} trenches @param {object[]} props @returns {object[]} */
export function defenceTrees(corners, towers, trenches, props) {
  let seed = T.seed;
  const random = () => { seed = (Math.imul(seed, T.multiplier) + T.increment) >>> 0; return seed / T.range; };
  const entries = trenches.entries.map(e => {
    const s = trenches.segments[e.segment];
    return { cx: s.a.cx + s.dx * e.distance, cy: s.a.cy + s.dy * e.distance, dx: -s.dy, dy: s.dx };
  });
  const trees = [];
  corners.forEach((a, edge) => {
    const b = corners[(edge + 1) % corners.length], length = Math.hypot(b.cx - a.cx, b.cy - a.cy);
    const dx = (b.cx - a.cx) / length, dy = (b.cy - a.cy) / length;
    for (let d = T.start + random(); d < length - T.start; d += T.spacingMin + random() * T.spacingVariation) {
      for (const outside of [false, true]) {
        if (outside && random() > T.exteriorChance) continue;
        const inset = outside ? T.outerInset + random() * T.outerJitter : -(T.innerInset + random() * T.innerJitter);
        const p = { cx: a.cx + dx * d + dy * inset, cy: a.cy + dy * d - dx * inset };
        if (edge === C.gateEdge && Math.abs(p.cy) < T.gateClearance) continue;
        if (towers.some(t => distance(p, t) < T.towerClearance)) continue;
        if (outside && entries.some(e => entryDistance(p, e) < T.entranceClearance)) continue;
        if (props.some(q => q.asset !== 'sandbag' && distance(p, q) < T.propClearance)) continue;
        const height = outside ? T.outerScale + random() * T.outerScaleVariation : T.innerScale + random() * T.innerScaleVariation;
        const crown = height * (T.widthMin + random() * T.widthVariation);
        const width = outside ? Math.min(crown, T.outerWidthMax) : crown;
        trees.push({ ...p, interior: !outside, asset: PINES[Math.floor(random() * PINES.length)], rotation: random() * Math.PI * 2,
          sx: width, sy: height, sz: width });
      }
    }
  });
  return rebalanceDefenceTrees(trees, corners, (p, edge) =>
    !(edge === C.gateEdge && Math.abs(p.cy) < T.gateClearance)
    && towers.every(t => distance(p, t) >= T.towerClearance)
    && entries.every(e => entryDistance(p, e) >= T.entranceClearance)
    && props.every(q => q.asset === 'sandbag' || distance(p, q) >= T.propClearance));
}
function distance(a, b) { return Math.hypot(a.cx - b.cx, a.cy - b.cy); }

function entryDistance(p, e) {
  const dx = p.cx - e.cx, dy = p.cy - e.cy;
  const along = Math.max(0, Math.min(B.halfWidth + B.entryLength, dx * e.dx + dy * e.dy));
  return Math.hypot(dx - e.dx * along, dy - e.dy * along);
}

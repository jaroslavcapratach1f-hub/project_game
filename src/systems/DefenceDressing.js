/** Deterministic reference dressing; none of these visual props affect navigation. */
import { defenceTrees } from './DefenceTrees.js';
import { barrierPlacements } from './DefenceBarrier.js';
import { trenchBankPlacements } from './DefenceTrenchDressing.js';
import { trenchLayout } from './DefenceTrenches.js';
import { defenceCorners, defenceTowers } from './DefenceFootprint.js';
import { DEFENCE as C, DEFENCE_GATE as G } from '../config/DefencePerimeterConfig.js';
const HALF = 0.5, QUARTER = Math.PI / 2;

/** @param {object[]} corners @param {number} distance @returns {object[]} convex parallel offset polygon */
export function offsetDefenceRing(corners, distance) {
  return corners.map((p, i) => {
    const prev = corners[(i + corners.length - 1) % corners.length], next = corners[(i + 1) % corners.length];
    const a = Math.hypot(p.cx - prev.cx, p.cy - prev.cy), b = Math.hypot(next.cx - p.cx, next.cy - p.cy);
    const ax = (p.cy - prev.cy) / a, ay = -(p.cx - prev.cx) / a;
    const bx = (next.cy - p.cy) / b, by = -(next.cx - p.cx) / b;
    const divisor = 1 + ax * bx + ay * by;
    return { cx: p.cx + distance * (ax + bx) / divisor, cy: p.cy + distance * (ay + by) / divisor };
  });
}

/** @param {number} level HQ plot stage @returns {{props:object[],poles:object[]}} */
export function defenceDressing(level) {
  const corners = defenceCorners(level), towers = defenceTowers(level), props = [], poles = [];
  const nearTower = (x, y) => towers.some((t) => Math.hypot(t.cx - x, t.cy - y) < C.towerClearance);
  corners.forEach((a, edge) => {
    const b = corners[(edge + 1) % corners.length];
    const len = Math.hypot(b.cx - a.cx, b.cy - a.cy), dx = (b.cx - a.cx) / len, dy = (b.cy - a.cy) / len;
    const rotation = Math.atan2(dx, dy), nx = dy, ny = -dx;
    for (let d = HALF; d < len; d += C.bagEvery) {
      const cx = a.cx + dx * d, cy = a.cy + dy * d;
      if (edge === C.gateEdge && Math.abs(cy) < G.clearHalfWidth) continue;
      if (!nearTower(cx, cy)) props.push({ asset: 'sandbag', cx: cx + nx * C.bagEvery, cy: cy + ny * C.bagEvery, rotation: rotation + QUARTER + Math.sin(d * C.bagPhase) * C.bagJitter,
        sy: C.bagHeightScale, sx: 1 + Math.cos(d * C.bagPhase) * C.bagJitter });
    }
    for (let d = 1; d < len - 1; d++) {
      const cx = a.cx + dx * d, cy = a.cy + dy * d;
      if (nearTower(cx, cy) || (edge === C.gateEdge && Math.abs(cy) < C.gateHalfWidth)) continue;
      if (d % C.propEvery === 0) {
        props.push({ asset: 'crate', cx: cx + nx * HALF, cy: cy + ny * HALF, rotation });
        props.push({ asset: 'barrel', cx: cx + nx * HALF + dx * HALF, cy: cy + ny * HALF + dy * HALF });
        props.push({ asset: 'storage_box', cx: cx - nx * HALF, cy: cy - ny * HALF });
      }
      if (d % C.poleEvery === 2 && !(dx && dy)) {
        const pole = { asset: 'power_pole', cx: cx - nx * C.treeInset, cy: cy - ny * C.treeInset, rotation };
        props.push(pole); poles.push(pole);
      }
    }
  });
  for (let i = 1; i < corners.length; i += 2) {
    const a = corners[i], b = corners[(i + 1) % corners.length];
    const len = Math.hypot(b.cx - a.cx, b.cy - a.cy), nx = (b.cy - a.cy) / len, ny = -(b.cx - a.cx) / len;
    const cx = (a.cx + b.cx) * HALF + nx * C.cornerPropOffset, cy = (a.cy + b.cy) * HALF + ny * C.cornerPropOffset;
    props.push({ asset: 'crate', cx, cy }, { asset: 'crate', cx, cy, y: C.crateHeight },
      { asset: 'storage_box', cx: cx + HALF, cy: cy - HALF },
      { asset: 'barrel', cx: a.cx + nx * HALF, cy: a.cy + ny * HALF });
  }
  const trenches = trenchLayout(offsetDefenceRing(corners, C.trenchOffset));
  props.push(...defenceTrees(corners, towers, trenches, props));
  props.push(...trenches.bridges, ...trenchBankPlacements(trenches));
  const gateX = corners[C.gateEdge].cx;
  for (const side of [-1, 1]) {
    props.push({ asset: 'gate_marker', cx: gateX + G.postForward, cy: side * G.sideOffset },
      { asset: 'crate', cx: gateX + G.crateForward, cy: side * (G.sideOffset + HALF) },
      { asset: 'storage_box', cx: gateX + G.caseForward, cy: side * (G.sideOffset + HALF) });
  }
  props.push(...barrierPlacements(offsetDefenceRing(corners, C.wireOffset)));
  return { props, poles };
}


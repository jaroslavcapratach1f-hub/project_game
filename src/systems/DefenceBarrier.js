/** One support post between consecutive steel hedgehogs; wire ends meet those supports. */
import { DEFENCE_BARRIER as C, DEFENCE } from '../config/DefencePerimeterConfig.js';
const HALF = 0.5, QUARTER_TURN = Math.PI / 2;

/** @param {object[]} ring outer perimeter corners @returns {object[]} instanced model placements */
export function barrierPlacements(ring) {
  const props = [], obstacles = new Set();
  ring.forEach((a, edge) => {
    const b = ring[(edge + 1) % ring.length];
    const runs = edge === DEFENCE.gateEdge
      ? [[a, { cx: a.cx, cy: -C.gateClearance }], [{ cx: a.cx, cy: C.gateClearance }, b]] : [[a, b]];
    for (const [start, end] of runs) addRun(props, obstacles, start, end);
  });
  return props;
}

/** @private divide each run into equal bays, deduplicating the shared corner obstacles */
function addRun(props, obstacles, a, b) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, length = Math.hypot(dx, dy);
  if (length <= 0) return;
  const bays = Math.max(1, Math.round(length / C.bayCells)), step = length / bays;
  const rotation = Math.atan2(dx, dy);
  for (let i = 0; i <= bays; i++) {
    const t = i / bays, cx = a.cx + dx * t, cy = a.cy + dy * t;
    const key = `${cx.toFixed(C.keyPrecision)},${cy.toFixed(C.keyPrecision)}`;
    if (!obstacles.has(key)) { props.push({ asset: 'hedgehog', cx, cy, rotation: rotation + QUARTER_TURN }); obstacles.add(key); }
    if (i === bays) continue;
    const middle = (i + HALF) / bays;
    props.push({ asset: 'wire_post', cx: a.cx + dx * middle, cy: a.cy + dy * middle, rotation });
    for (const offset of C.wireCenters) {
      const wireT = (i + offset) / bays;
      props.push({ asset: 'barbed_wire', cx: a.cx + dx * wireT, cy: a.cy + dy * wireT,
        rotation, sz: step * HALF });
    }
  }
}

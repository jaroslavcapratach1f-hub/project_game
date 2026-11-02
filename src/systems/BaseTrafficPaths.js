/** Permanent terrain roads, based only on the perimeter size and gate position. */
import { plotCells } from '../config/BaseGridConfig.js';
import { DEFENCE } from '../config/DefencePerimeterConfig.js';
import { GROUND_3D as C } from '../config/BaseGround3DConfig.js';
/** @param {number} level @returns {object[]} static decorative routes in base cells */
export function baseTrafficPaths(level) {
  const { cols, rows } = plotCells(level);
  const gate = { cx: cols / 2 + DEFENCE.wallSetback, cy: 0 };
  const junction = { cx: cols * C.roadJunction, cy: 0 };
  const farX = -cols * C.roadReach, sideY = rows * C.roadReach;
  return [
    { vehicle: true, points: [gate, junction, { cx: farX, cy: 0 }] },
    ...[-1, 1].map(sign => ({ vehicle: true, points: [junction,
      { cx: junction.cx, cy: sign * sideY }, { cx: farX, cy: sign * sideY }] })),
    { vehicle: false, points: [{ cx: farX, cy: -sideY }, { cx: farX, cy: sideY }] },
  ];
}

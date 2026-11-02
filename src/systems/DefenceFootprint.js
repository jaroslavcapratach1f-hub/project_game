/** Shared visual/collision outline; original construction grid stays inside this belt. */
import { plotCells, CELL_PX } from '../config/BaseGridConfig.js';
import { DEFENCE } from '../config/DefencePerimeterConfig.js';
import { cellCentreToPx } from '../utils/SquareGrid.js';
const HALF = 0.5;
/** @param {number} hqLevel @returns {{cx:number,cy:number}[]} clockwise grid corners */
export function defenceCorners(hqLevel) {
  const { cols, rows } = plotCells(hqLevel);
  const x = cols * HALF + DEFENCE.wallSetback, y = rows * HALF + DEFENCE.wallSetback;
  const cut = DEFENCE.cornerChamfer;
  return [{ cx: -x + cut, cy: -y }, { cx: x - cut, cy: -y },
    { cx: x, cy: -y + cut }, { cx: x, cy: y - cut },
    { cx: x - cut, cy: y }, { cx: -x + cut, cy: y },
    { cx: -x, cy: y - cut }, { cx: -x, cy: -y + cut }];
}
/** @param {number} hqLevel @returns {{x:number,y:number}[]} projected outline, relative to compound */
export function defencePolygon(hqLevel) { return defenceCorners(hqLevel).map((p) => cellCentreToPx(p.cx, p.cy, CELL_PX)); }
/** @param {number} hqLevel @returns {{cx:number,cy:number}[]} two towers at each of four identical chamfered corners */
export function defenceTowers(hqLevel) {
  // Blender ladder lies on +Y, which exports to local -Z in glTF.
  return defenceCorners(hqLevel).map(p => ({ ...p, rotation: Math.atan2(p.cx, p.cy) }));
}

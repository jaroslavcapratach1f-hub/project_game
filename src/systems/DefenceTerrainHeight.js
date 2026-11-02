/** Recess the visual perimeter terrain along the existing connected trench paths. */
import { DEFENCE_TRENCH as T } from '../config/DefencePerimeterConfig.js';

/** @param {object} layout trench path and entries @returns {object[]} excavation centre lines */
export function excavationLines(layout) {
  const lines = layout.segments.map(s => ({ a: s.a, b: s.b, ramp: false }));
  for (const entry of layout.entries) {
    const s = layout.segments[entry.segment];
    const a = { cx: s.a.cx + s.dx * entry.distance, cy: s.a.cy + s.dy * entry.distance };
    lines.push({ a: { cx: a.cx - s.dy * T.halfWidth, cy: a.cy + s.dx * T.halfWidth },
      b: { cx: a.cx - s.dy * (T.halfWidth + T.entryLength),
      cy: a.cy + s.dx * (T.halfWidth + T.entryLength) }, ramp: true });
  }
  return lines;
}

/** @param {number} x @param {number} z @param {object[]} lines @returns {number} grid-cell elevation */
export function defenceTerrainHeight(x, z, lines) {
  let height = 0;
  for (const { a, b, ramp } of lines) {
    const dx = b.cx - a.cx, dz = b.cy - a.cy;
    const t = Math.max(0, Math.min(1, ((x - a.cx) * dx + (z - a.cy) * dz) / (dx * dx + dz * dz)));
    const d = Math.hypot(x - a.cx - dx * t, z - a.cy - dz * t);
    const blend = Math.max(0, Math.min(1, (T.halfWidth + T.bankWidth - d) / (T.bankWidth - T.terrainFloorMargin)));
    const depth = (T.floorY - T.terrainFloorClearance) * blend * (ramp ? 1 - t : 1);
    height = Math.min(height, depth);
  }
  return height || 0;
}

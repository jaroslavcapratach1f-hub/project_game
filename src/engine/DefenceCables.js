/** One opaque line batch for gently sagging utility cables, allocated on rebuild. */
import { BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial } from 'three';
import { DEFENCE as C } from '../config/DefencePerimeterConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
const VECTOR_SIZE = 3;
const UNIT = CELL_PX * BASE3D.cameraScale, SAG_CURVE = 4, WIRE_OFFSETS = C.cableOffsets;
/** @param {object[]} poles @returns {LineSegments} caller owns geometry/material */
export function buildDefenceCables(poles) {
  const points = [];
  poles.forEach((a, i) => {
    const b = poles[(i + 1) % poles.length];
    for (const side of WIRE_OFFSETS) for (let j = 0; j < C.cableSteps; j++) {
      for (const k of [j, j + 1]) {
        const t = k / C.cableSteps;
        const ax = a.cx + Math.cos(a.rotation) * side, ay = a.cy - Math.sin(a.rotation) * side;
        const bx = b.cx + Math.cos(b.rotation) * side, by = b.cy - Math.sin(b.rotation) * side;
        points.push((ax + (bx - ax) * t) * UNIT,
          (C.poleCableHeight - SAG_CURVE * C.cableSag * t * (1 - t)) * UNIT, (ay + (by - ay) * t) * UNIT);
      }
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points, VECTOR_SIZE));
  return new LineSegments(geometry, new LineBasicMaterial({ color: 0x292922 }));
}

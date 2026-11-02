/** A feathered terrain belt with actual recessed trench channels, built once per stage. */
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { defenceCorners } from '../systems/DefenceFootprint.js';
import { offsetDefenceRing } from '../systems/DefenceDressing.js';
import { trenchLayout } from '../systems/DefenceTrenches.js';
import { excavationLines, defenceTerrainHeight } from '../systems/DefenceTerrainHeight.js';
import { DEFENCE, DEFENCE_GROUND as C } from '../config/DefencePerimeterConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { GROUND_3D } from '../config/BaseGround3DConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
const XYZ = 3, RGBA = 4;
const UNIT = CELL_PX * BASE3D.cameraScale;

/** @private signed distance to the convex perimeter, positive outside */
function ringDistance(x, z, corners) {
  let distance = Infinity, inside = true;
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % corners.length], dx = b.cx - a.cx, dz = b.cy - a.cy;
    const t = Math.max(0, Math.min(1, ((x - a.cx) * dx + (z - a.cy) * dz) / (dx * dx + dz * dz)));
    distance = Math.min(distance, Math.hypot(x - a.cx - dx * t, z - a.cy - dz * t));
    if (dx * (z - a.cy) - dz * (x - a.cx) < 0) inside = false;
  });
  return inside ? -distance : distance;
}

/** @param {number} level @returns {BufferGeometry} shared terrain, with no gameplay collision */
export function defenceTerrainGeometry(level) {
  const corners = defenceCorners(level), lines = excavationLines(trenchLayout(offsetDefenceRing(corners, DEFENCE.trenchOffset)));
  const extent = Math.ceil(Math.max(...corners.map(p => Math.max(Math.abs(p.cx), Math.abs(p.cy)))) + C.rings.at(-1).distance);
  const count = Math.ceil(extent * 2 / C.meshStep), stride = count + 1;
  const vertices = [], colors = [], uvs = [], indices = [], alphas = [];
  for (let j = 0; j <= count; j++) for (let i = 0; i <= count; i++) {
    const x = -extent + i / count * extent * 2, z = -extent + j / count * extent * 2;
    const d = ringDistance(x, z, corners), first = C.rings[0], last = C.rings.at(-1);
    const alpha = Math.max(0, Math.min(1, (d - first.distance) / (C.rings[1].distance - first.distance),
      (last.distance - d) / (last.distance - C.rings.at(-2).distance)));
    vertices.push(x * UNIT, (defenceTerrainHeight(x, z, lines) + C.elevation) * UNIT, z * UNIT);
    colors.push(1, 1, 1, alpha); alphas.push(alpha); uvs.push(x / GROUND_3D.tileCells, z / GROUND_3D.tileCells);
    if (i === 0 || j === 0) continue;
    const a = j * stride + i, b = a - 1, c = a - stride, e = c - 1;
    if (alphas[a] + alphas[b] + alphas[c] + alphas[e] > 0) indices.push(a, c, b, b, c, e);
  }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(vertices, XYZ));
  g.setAttribute('color', new Float32BufferAttribute(colors, RGBA)); g.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  g.setIndex(indices); g.computeVertexNormals(); return g;
}

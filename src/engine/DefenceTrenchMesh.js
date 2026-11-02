/** Batched connected trench surfaces: open miters and bank gaps at side accesses. */
import { Group, Mesh, BufferGeometry, Float32BufferAttribute } from 'three';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
import { DEFENCE_TRENCH as T } from '../config/DefencePerimeterConfig.js';
import { trenchOffset } from '../systems/DefenceTrenches.js';
import { trenchMaterial } from './DefenceTrenchMaterials.js';
const STRIDE = 3, LAST = 3, TRIANGLES = [0, 1, 2, 0, 2, LAST];
const UNIT = CELL_PX * BASE3D.cameraScale;
const point = (p, y) => [p.cx, y, p.cy];

/** @param {number[]} data @param {number[][]} points four perimeter vertices */
function quad(data, points) {
  for (const i of TRIANGLES) data.push(...points[i].map(v => v * UNIT));
}

/** Low soil seam underneath the detailed GLB revetments. */
function bank(data, corners, heights = [T.bankHeight, T.bankHeight]) {
  const { earth } = data, [a, b, c, d] = corners, [h0, h1] = heights;
  quad(earth, [point(a, h0 * T.underlayHeight), point(b, h1 * T.underlayHeight), point(d, 0), point(c, 0)]);
}

/** Side branch has no transverse rim; flanking banks descend to ground contact. */
function entrySurfaces(data, s, entry) {
  const middle = { cx: s.a.cx + s.dx * entry.distance, cy: s.a.cy + s.dy * entry.distance };
  const at = (along, inward) => ({ cx: middle.cx + s.dx * along - s.dy * inward,
    cy: middle.cy + s.dy * along + s.dx * inward });
  const w = T.entryWidth / 2, start = T.halfWidth, end = start + T.entryLength;
  const a = at(-w, start), b = at(w, start), c = at(-w, end), d = at(w, end);
  const fade = end - T.entryFeather, lipY = T.floorY * T.entryFeather / T.entryLength;
  const f0 = at(-w, fade), f1 = at(w, fade);
  quad(data.floor, [point(a, T.floorY), point(b, T.floorY), point(f1, lipY), point(f0, lipY)]);
  data.fades.push(data.floor.length / STRIDE);
  quad(data.floor, [point(f0, lipY), point(f1, lipY), point(d, 0), point(c, 0)]);
  bank(data, [a, c, at(-w - T.bankWidth, start), at(-w - T.bankWidth, end)], [T.bankHeight, 0]);
  bank(data, [b, d, at(w + T.bankWidth, start), at(w + T.bankWidth, end)], [T.bankHeight, 0]);
}

/** @param {object} layout pure trenchLayout result @returns {Group} two owned underlay batches */
export function buildDefenceTrench(layout) {
  const data = { floor: [], earth: [], fades: [] }, { path, segments, entries } = layout;
  for (const s of segments) {
    const edge = (offset, t) => t === 0 || t === 1
      ? trenchOffset(path, s.index + t, offset)
      : { cx: s.a.cx + s.dx * s.len * t + s.dy * offset, cy: s.a.cy + s.dy * s.len * t - s.dx * offset };
    const floorWidth = T.halfWidth + T.floorUnderlap;
    quad(data.floor, [point(edge(-floorWidth, 0), T.floorY), point(edge(floorWidth, 0), T.floorY),
      point(edge(floorWidth, 1), T.floorY), point(edge(-floorWidth, 1), T.floorY)]);
    const entry = entries.find(e => e.segment === s.index);
    for (const sign of [-1, 1]) {
      const ranges = sign < 0 && entry ? [[0, (entry.distance - T.entryWidth / 2) / s.len],
        [(entry.distance + T.entryWidth / 2) / s.len, 1]] : [[0, 1]];
      for (const [start, end] of ranges) {
        const count = Math.ceil((end - start) * s.len / T.bankSection);
        for (let j = 0; j < count; j++) {
          const u = start + (end - start) * j / count, v = start + (end - start) * (j + 1) / count;
          const a = edge(sign * T.halfWidth, u), b = edge(sign * T.halfWidth, v);
          const height = p => T.bankHeight + T.bankVariation * Math.sin(p.cx * T.noiseX + p.cy * T.noiseY);
          bank(data, [a, b, edge(sign * (T.halfWidth + T.bankWidth), u), edge(sign * (T.halfWidth + T.bankWidth), v)], [height(a), height(b)]);
        }
      }
    }
    if (entry) entrySurfaces(data, s, entry);
  }
  const group = new Group(); group.name = 'ContinuousTrenches';
  for (const [name, color] of [['floor', T.floorColor], ['earth', T.earthColor]]) {
    const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(data[name], STRIDE));
    const uv = [];
    for (let i = 0; i < data[name].length; i += STRIDE) {
      const [x, , z] = data[name].slice(i, i + STRIDE);
      uv.push((x + z) / UNIT, z / UNIT);
    }
    geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
    const colors = [];
    for (let i = 0; i < data[name].length / STRIDE; i++) {
      const fadeStart = name === 'earth' ? i - i % 6 : data.fades.find(start => i >= start && i < start + 6);
      const alpha = fadeStart === undefined ? 1 : [1, 1, 0, 1, 0, 0][i - fadeStart];
      colors.push(1, 1, 1, alpha);
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
    geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    const material = trenchMaterial(name, color);
    const mesh = new Mesh(geometry, material); mesh.name = `Trench_${name}`; group.add(mesh);
  }
  group.userData.entries = entries.length; group.userData.bridges = layout.bridges.length;
  return group;
}

/** @param {Group} group release only owned trench resources */
export function disposeDefenceTrench(group) {
  if (!group) return;
  group.removeFromParent();
  for (const mesh of group.children) { mesh.geometry.dispose(); mesh.material.dispose(); }
}

/** A shared, feather-edged grass/earth belt under the new perimeter (one draw). */
import { Mesh } from 'three';
import { defenceTerrainGeometry } from './DefenceTerrainGeometry.js';
import { baseGrassMaterial } from './BaseGrassMaterial.js';
const cache = new Map();
/** @param {number} level @returns {Mesh} reusable resources; owner removes mesh without disposing shared data */
export function buildDefenceGround(level) {
  if (!cache.has(level)) cache.set(level, createBelt(level));
  const { geometry, material } = cache.get(level);
  const mesh = new Mesh(geometry, material); mesh.renderOrder = -1;
  return mesh;
}
/** @private build four opacity rings, leaving the existing building grid untouched */
function createBelt(level) {
  const geometry = defenceTerrainGeometry(level);
  const material = baseGrassMaterial();
  material.vertexColors = true; material.transparent = true; material.depthWrite = false; material.side = 2;
  return { geometry, material };
}

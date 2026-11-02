/** A clear, softly worn vehicle approach between the gate and the outer wire opening. */
import { Mesh, PlaneGeometry, DataTexture, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { defenceCorners } from '../systems/DefenceFootprint.js';
import { DEFENCE, DEFENCE_GATE as C } from '../config/DefencePerimeterConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
const UNIT = CELL_PX * BASE3D.cameraScale, HALF = 0.5, RGBA = 4;
let material;
/** @param {number} level @returns {Mesh} shared material and owned simple geometry */
export function buildGateApron(level) {
  if (!material) material = apronMaterial();
  const g = new PlaneGeometry(C.roadLength * UNIT, C.roadHalfWidth * 2 * UNIT); g.rotateX(-Math.PI / 2);
  const mesh = new Mesh(g, material); mesh.name = 'GateApproach';
  mesh.position.set((defenceCorners(level)[DEFENCE.gateEdge].cx + C.roadStart + C.roadLength * HALF) * UNIT, C.roadY * UNIT, 0);
  return mesh;
}
/** @private shared opaque-color texture with feathered alpha */
function apronMaterial() {
  const size = C.roadTextureSize, pixels = new Uint8Array(size * size * RGBA);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / (size - 1), v = y / (size - 1);
    const fade = Math.max(0, Math.min(1, u / C.edgeFade, (1 - u) / C.edgeFade, v / C.edgeFade, (1 - v) / C.edgeFade));
    const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const grain = (noise - Math.floor(noise) - HALF) * C.roadGrain;
    const p = (y * size + x) * RGBA;
    C.roadColor.forEach((c, i) => { pixels[p + i] = c + grain; }); pixels[p + 3] = fade * C.roadAlpha;
  }
  const map = new DataTexture(pixels, size, size); map.colorSpace = SRGBColorSpace; map.needsUpdate = true;
  return new MeshBasicMaterial({ map, transparent: true, depthWrite: false });
}

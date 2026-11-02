/** Shared soft ground-contact decals; no shadow maps or decorative collision. */
import { InstancedMesh, PlaneGeometry, MeshBasicMaterial, CanvasTexture, Matrix4, Quaternion, Vector3 } from 'three';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
import { DEFENCE_SHADOW as C } from '../config/DefencePerimeterConfig.js';
const UNIT = CELL_PX * BASE3D.cameraScale;
let material, geometry;
/** @param {object[]} placements @returns {InstancedMesh} instance buffer owned locally; material/geometry shared */
export function buildDefenceShadows(placements) {
  if (!material) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = C.texturePx;
    const ctx = canvas.getContext('2d'), half = C.texturePx / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, C.center); gradient.addColorStop(1, C.edge);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, C.texturePx, C.texturePx);
    material = new MeshBasicMaterial({ map: new CanvasTexture(canvas), transparent: true, depthWrite: false, opacity: C.opacity });
    geometry = new PlaneGeometry(1, 1);
  }
  const mesh = new InstancedMesh(geometry, material, placements.length), matrix = new Matrix4();
  const q = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
  const position = new Vector3(), scale = new Vector3();
  placements.forEach((p, i) => {
    const size = p.asset.startsWith('pine') ? C.treeSize : C.wallSize;
    position.set(p.cx * UNIT, C.elevation * UNIT, p.cy * UNIT);
    scale.set(size * UNIT * (p.sx ?? p.scale ?? 1), size * UNIT * (p.sz ?? p.scale ?? 1), 1); matrix.compose(position, q, scale); mesh.setMatrixAt(i, matrix);
  });
  mesh.computeBoundingSphere(); mesh.renderOrder = 1;
  return mesh;
}

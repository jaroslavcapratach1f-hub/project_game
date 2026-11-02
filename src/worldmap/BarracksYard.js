/** Static instanced troop display, parented to the barracks so drag/LOD stay in sync. */
import { Group, InstancedMesh, Matrix4, Box3 } from 'three';
import { UNIT_3D } from '../config/Unit3DConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
import { BARRACKS_YARD as C } from '../config/BarracksYardConfig.js';
import { barracksYardLayout } from '../systems/BarracksYardLayout.js';
import { assembleUnitMesh } from '../entities/UnitMeshFactory.js';
import { assembleInfantryMesh } from '../entities/infantry/InfantryMeshFactory.js';
const UNIT = CELL_PX * BASE3D.cameraScale;
export class BarracksYard {
  /** @param {string} [cls] assigned combat class */
  constructor(cls = 'infantry') { this._cls = cls; this._version = 0; this._root = null; this._display = null; }
  /** @param {import('three').Group} root the already-fitted building's outer LOD group */
  attach(root) { this._root = root; this.setProduction(this._cls); }
  /** @param {string} cls @returns {Promise<void>} refresh only when assignment changes */
  async setProduction(cls) {
    this._cls = cls; const version = ++this._version; this._clear();
    if (!this._root) return;
    const faction = cls === 'superHeavyTank' ? C.superHeavyFaction : C.faction;
    const cfg = UNIT_3D[`${faction}:${cls}`] ?? UNIT_3D[cls];
    if (!cfg) return; // An unprovided class model leaves its markers visible, never a wrong class silhouette.
    const assembled = cfg.torsoUrl ? await assembleInfantryMesh(cfg) : await assembleUnitMesh(cfg);
    const materials = []; assembled.root.traverse(n => { if (n.isMesh) materials.push(n.material); });
    if (version !== this._version || !this._root) { for (const m of materials) m.dispose(); assembled.hipGeometry?.dispose(); return; }
    const positions = barracksYardLayout(cls), group = new Group(); group.name = `Barracks yard: ${cls}`;
    group.rotation.y = C.rotationY; assembled.root.updateMatrixWorld(true);
    const scale = (cls === 'infantry' ? C.infantryScale : C.displayScale) * CELL_PX / C.referenceCellPx;
    const floorOffset = -new Box3().setFromObject(assembled.root).min.y * scale;
    assembled.root.traverse(n => {
      if (!n.isMesh) return;
      const mesh = new InstancedMesh(n.geometry, n.material, positions.length);
      positions.forEach((p, i) => {
        const matrix = new Matrix4().makeRotationY(C.facingY).scale({ x: scale, y: scale, z: scale });
        matrix.setPosition(p.x * UNIT, C.floorY * UNIT + floorOffset, p.z * UNIT); matrix.multiply(n.matrixWorld); mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); group.add(mesh);
    });
    group.userData.troopCount = positions.length; group.userData.temporaryArt = false;
    this._display = group; this._materials = materials; this._hipGeometry = assembled.hipGeometry;
    this._root.add(group);
  }
  /** @returns {void} detach and cancel any outstanding asset load */
  dispose() { ++this._version; this._clear(); this._root = null; }
  /** @private shared GLTF geometry/textures remain owned by the asset cache */
  _clear() {
    this._display?.removeFromParent();
    this._display?.traverse(n => { if (n.isInstancedMesh) n.dispose(); });
    for (const material of this._materials ?? []) material.dispose();
    this._hipGeometry?.dispose(); this._display = null; this._materials = []; this._hipGeometry = null;
  }
}

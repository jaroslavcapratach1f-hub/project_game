/** Instanced GLB kit batches; cached source meshes are never disposed by a compound. */
import { Group, InstancedMesh, Matrix4, Vector3, Quaternion, Color } from 'three';
import { refineDefenceMaterial } from './DefenceMaterials.js';
import { loadGltfCached } from './GltfCache.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { DEFENCE, DEFENCE_TINT } from '../config/DefencePerimeterConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
const UP = new Vector3(0, 1, 0), UNIT = CELL_PX * BASE3D.cameraScale;

export class DefenceInstances {
  /** @param {object} base3D @param {{cx:number,cy:number}} origin */
  constructor(base3D, origin) {
    this.root = new Group(); this.root.position.set(origin.cx * UNIT, 0, origin.cy * UNIT);
    this._base3D = base3D; this._materials = []; this._generation = 0;
    base3D.addObject(this.root);
  }

  /** @param {Record<string,string>} registry @param {object[]} placements @returns {Promise<void>} */
  async rebuild(registry, placements) {
    const generation = ++this._generation;
    const groups = new Map();
    for (const p of placements) {
      if (!registry[p.asset]) throw new Error(`Missing defence asset: ${p.asset}`);
      if (!groups.has(p.asset)) groups.set(p.asset, []);
      groups.get(p.asset).push(p);
    }
    const loaded = await Promise.all([...groups].map(async ([asset, rows]) => ({ gltf: await loadGltfCached(registry[asset]), rows })));
    if (generation !== this._generation) return;
    this._clear();
    for (const { gltf, rows } of loaded) this._batch(gltf.scene, rows);
  }

  /** @private build only on load/layout edits, no per-frame allocations */
  _batch(scene, rows) {
    scene.updateMatrixWorld(true);
    const matrix = new Matrix4(), rotation = new Quaternion(), position = new Vector3(), scale = new Vector3();
    scene.traverse((source) => {
      if (!source.isMesh) return;
      const material = source.material.clone();
      // Matte timber/foliage with local exposure compensation; global lights stay unchanged.
      material.metalness = 0; material.roughness = 1;
      material.color.multiplyScalar(DEFENCE.diffuseFactor);
      const tint = DEFENCE_TINT[material.name];
      if (tint) material.color.multiply(new Color(...tint));
      refineDefenceMaterial(material);
      this._materials.push(material);
      const mesh = new InstancedMesh(source.geometry, material, rows.length);
      rows.forEach((p, i) => {
        position.set(p.cx * UNIT, (p.y ?? 0) * UNIT, p.cy * UNIT);
        rotation.setFromAxisAngle(UP, p.rotation ?? 0);
        scale.set((p.sx ?? p.scale ?? 1) * UNIT, (p.sy ?? p.scale ?? 1) * UNIT, (p.sz ?? p.scale ?? 1) * UNIT);
        matrix.compose(position, rotation, scale).multiply(source.matrixWorld);
        mesh.setMatrixAt(i, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      this.root.add(mesh);
    });
  }

  /** @private release instance buffers and owned material clones only */
  _clear() {
    for (const mesh of this.root.children) mesh.dispose();
    this.root.clear();
    for (const material of this._materials) material.dispose();
    this._materials.length = 0;
  }

  /** @returns {void} cancel pending loads and release local resources */
  dispose() { this._generation++; this._clear(); this._base3D.removeObject(this.root); }
}

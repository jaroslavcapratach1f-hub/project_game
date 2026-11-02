/**
 * FitMesh — the "measure once, scale to a target length" fit every tiled
 * live-3D prop (wall segments, the gate) shares: TRELLIS orients each
 * generation arbitrarily, so callers first rotate a loaded GLTF scene until
 * its own long axis sits on local +Z (see `DefenceWall3DConfig`'s
 * `gateAxisFixDeg` for a mesh that needed this), then call `fitAlongZ` to
 * scale that +Z extent to `targetLen`, re-centre on X/Z, and ground it at
 * Y=0 — the same footprint-fit contract `Base3DLayer.setBuildingModel` uses
 * for buildings, just length-based instead of width x height.
 */
import { Box3, Group, Vector3 } from 'three';

/** @param {import('three').Object3D} scene loaded GLTF scene (rotated to its final orientation first) @param {number} targetLen scene units @returns {import('three').Group} centred/grounded, local +Z fit to targetLen */
export function fitAlongZ(scene, targetLen) {
  const raw = new Box3().setFromObject(scene).getSize(new Vector3());
  const s = raw.z > 0 ? targetLen / raw.z : 1;
  scene.scale.setScalar(s);
  const box = new Box3().setFromObject(scene);
  const centre = box.getCenter(new Vector3());
  scene.position.set(-centre.x, -box.min.y, -centre.z);
  const wrap = new Group();
  wrap.add(scene);
  return wrap;
}

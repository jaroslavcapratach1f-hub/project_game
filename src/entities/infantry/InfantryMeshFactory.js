/**
 * InfantryMeshFactory — loads+fits the S56 soldier walk-cycle rig (once per
 * `UNIT_3D` infantry entry, module-level cache): a static torso plus two
 * independently-pivoting leg pieces, cut from the single static-pose GLB
 * along a real gap between the model's own feet/shins (see
 * `Unit3DConfig.js` and the asset packet README). Mirrors `UnitMeshFactory.js`'s load-once/clone-
 * many shape but for this 3-piece rig instead of a tank's hull+turret —
 * kept as its own file rather than folded into that one so the tank path
 * (well tested, shared by every vehicle) stays completely untouched.
 */
import { Group, Mesh, SphereGeometry, Vector3 } from 'three';
import { BASE3D } from '../../config/Base3DConfig.js';
import { cloneWithMaterials } from '../UnitMeshFactory.js';
import { loadGltfCached } from '../../engine/GltfCache.js';

const DEG = Math.PI / BASE3D.degPerHalfTurn;
const UP_AXIS = new Vector3(0, 1, 0);
const HALF = 0.5;
const HIP_WIDTH_SEGMENTS = 10;
const HIP_HEIGHT_SEGMENTS = 8;
/** @type {Map<string, Promise<object>>} */
const templateCache = new Map();

/**
 * @param {object} cfg a `UNIT_3D` entry (torsoUrl/legLUrl/legRUrl/leg*PivotLocal/
 *   bodyCentreX/bodyCentreZ/bodyFloorY/bodyHeightRaw/rotationYDeg/hullLengthWorldPx)
 * @returns {Promise<object>}
 */
async function buildTemplate(cfg) {
  const [torsoGltf, legLGltf, legRGltf] = await Promise.all([
    loadGltfCached(cfg.torsoUrl), loadGltfCached(cfg.legLUrl), loadGltfCached(cfg.legRUrl),
  ]);
  const torso = torsoGltf.scene, legL = legLGltf.scene, legR = legRGltf.scene;
  const rotRad = cfg.rotationYDeg * DEG;
  const scale = (cfg.hullLengthWorldPx * BASE3D.cameraScale) / cfg.bodyHeightRaw;
  torso.scale.setScalar(scale); torso.rotation.y = rotRad;
  for (const leg of [legL, legR]) {
    leg.scale.set(scale, scale * cfg.legHeightScale, scale);
    leg.rotation.y = rotRad;
  }
  // Recentre from the ORIGINAL unsplit mesh's own bounds (torso alone
  // excludes the legs/feet, so its own box can't supply the true floor —
  // see Unit3DConfig.js's own doc). Y-axis rotation never moves a point
  // already on that axis, so the floor only ever needs scaling.
  const recentre = new Vector3(cfg.bodyCentreX, 0, cfg.bodyCentreZ)
    .applyAxisAngle(UP_AXIS, rotRad).multiplyScalar(scale)
    .multiplyScalar(-1);
  recentre.y = -cfg.bodyFloorY * scale;
  torso.position.copy(recentre);
  const pivot = (p) => new Vector3(p.x, p.y, p.z)
    .applyAxisAngle(UP_AXIS, rotRad).multiplyScalar(scale).add(recentre);
  const legLPivot = pivot(cfg.legLPivotLocal);
  const legRPivot = pivot(cfg.legRPivotLocal);
  // The pivot group is placed at the hip. Keep each leg's transformed mesh
  // relative to that group; leaving it in the root frame makes rotation orbit
  // the leg around an offset point and reads as wobbling instead of walking.
  legL.position.copy(recentre).sub(legLPivot);
  legR.position.copy(recentre).sub(legRPivot);
  legL.position.y -= (cfg.legLTopY * cfg.legHeightScale - cfg.legLPivotLocal.y) * scale;
  legR.position.y -= (cfg.legRTopY * cfg.legHeightScale - cfg.legRPivotLocal.y) * scale;
  return { torso, legL, legR, legLPivot, legRPivot };
}

/** @param {object} cfg a `UNIT_3D` entry @returns {Promise<object>} the shared, load-once template (never mutate directly — clone it) */
function getTemplate(cfg) {
  const key = `${cfg.torsoUrl}|${cfg.legLUrl}|${cfg.legRUrl}`;
  if (!templateCache.has(key)) templateCache.set(key, buildTemplate(cfg));
  return templateCache.get(key);
}

/**
 * Assemble a fresh, independently-owned rig from `cfg` — ready to add to
 * any Three.js scene. `torsoMats`/`legLMats`/`legRMats` are this
 * instance's own cloned materials, safe to tint/fade/dispose without
 * touching any other soldier.
 * @param {object} cfg a `UNIT_3D` entry
 * @returns {Promise<{root:import('three').Group, legLPivot:import('three').Group,
 *   legRPivot:import('three').Group, torsoMats:import('three').Material[],
 *   legLMats:import('three').Material[], legRMats:import('three').Material[]}>}
 */
export async function assembleInfantryMesh(cfg) {
  const t = await getTemplate(cfg);
  const torsoMats = [], legLMats = [], legRMats = [];
  const torsoClone = cloneWithMaterials(t.torso, torsoMats);
  const hipMats = [];
  const hip = new Mesh(new SphereGeometry(cfg.hipRadiusWorld, HIP_WIDTH_SEGMENTS, HIP_HEIGHT_SEGMENTS), torsoMats[0].clone());
  hip.scale.set(cfg.hipWidth, cfg.hipHeight, cfg.hipDepth);
  hip.position.copy(t.legLPivot).add(t.legRPivot).multiplyScalar(HALF);
  hipMats.push(hip.material);
  const legLPivot = new Group();
  legLPivot.position.copy(t.legLPivot);
  legLPivot.add(cloneWithMaterials(t.legL, legLMats));
  const legRPivot = new Group();
  legRPivot.position.copy(t.legRPivot);
  legRPivot.add(cloneWithMaterials(t.legR, legRMats));
  const root = new Group();
  root.add(torsoClone, hip, legLPivot, legRPivot);
  return {
    root, legLPivot, legRPivot, torsoMats, legLMats, legRMats, hipMats,
    hipGeometry: hip.geometry,
  };
}

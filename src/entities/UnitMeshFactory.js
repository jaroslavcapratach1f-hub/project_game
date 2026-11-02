/**
 * UnitMeshFactory — loads+fits a `UNIT_3D` hull/turret pair (once per URL
 * pair, module-level cache) and hands out cheap per-instance clones
 * (shared geometry, cloned materials). Shared by `Unit3DBody` (the live
 * in-game unit) and `UnitIconRenderer` (a static portrait snapshot of the
 * SAME assembled mesh, S55) so both always show the exact same model —
 * one source of truth, not a separate 2D concept-art asset that can't
 * help but look inconsistent (different angle/lighting/background) with
 * what the unit actually looks like in the game.
 */
import { Group, Mesh, Box3, Vector3 } from 'three';
import { BASE3D } from '../config/Base3DConfig.js';
import { loadGltfCached } from '../engine/GltfCache.js';

const DEG = Math.PI / BASE3D.degPerHalfTurn;
const UP_AXIS = new Vector3(0, 1, 0);
/** @type {Map<string, Promise<{hull:import('three').Object3D, turret:import('three').Object3D, pivotScene:Vector3}>>} */
const templateCache = new Map();

/**
 * Load+fit the hull/turret pair ONCE per URL pair: scale derived from the
 * hull's own raw extent along `cfg.fitAxis` (default 'z', the hull's long
 * axis — a tank's own natural fit dimension; infantry fits by 'y', its
 * standing height instead) so the fitted body reads at
 * `cfg.hullLengthWorldPx`; baseline `rotationYDeg` baked into both pieces;
 * hull re-centred (XZ centre, floor on Y=0) AFTER scale+rotation
 * (Base3DLayer's own fix for Three's T*R*S composition — measuring before
 * rotating silently swaps axes once a mesh is non-uniformly shaped).
 *
 * `turretUrl`/`turretPivotLocal` are OPTIONAL — a unit with no independent
 * turret (infantry; any future fixed-gun/no-turret vehicle) just omits
 * both and gets a `turret: null` template; `assembleUnitMesh` below then
 * hands back an empty, harmless turretPivot group instead of skipping the
 * field, so every caller keeps the same `{root, turretPivot, ...}` shape
 * regardless of whether the unit actually has a turret.
 *
 * `turretPivotLocal` (offline-computed, see Unit3DConfig.js) is the RAW
 * mesh-space pivot — the SAME frame the hull's own raw vertices live in,
 * BEFORE any scale/rotation. It must go through the EXACT same transform
 * chain a hull vertex does (rotate, scale, then the hull's own recentre
 * offset) to land in the correct spot.
 * @param {object} cfg a `UNIT_3D` entry @returns {Promise<object>}
 */
async function buildTemplate(cfg) {
  const [hullGltf, turretGltf] = await Promise.all([
    loadGltfCached(cfg.hullUrl), cfg.turretUrl ? loadGltfCached(cfg.turretUrl) : null,
  ]);
  const hull = hullGltf.scene, turret = turretGltf?.scene ?? null;
  const rotRad = cfg.rotationYDeg * DEG;
  const fitAxis = cfg.fitAxis ?? 'z';
  const rawHullSize = new Box3().setFromObject(hull).getSize(new Vector3());
  const scale = (cfg.hullLengthWorldPx * BASE3D.cameraScale) / rawHullSize[fitAxis];
  for (const obj of turret ? [hull, turret] : [hull]) { obj.scale.setScalar(scale); obj.rotation.y = rotRad; }
  const hullBox = new Box3().setFromObject(hull);
  const hullCentre = hullBox.getCenter(new Vector3());
  hull.position.set(-hullCentre.x, -hullBox.min.y, -hullCentre.z);
  if (!turret) return { hull, turret: null, pivotScene: new Vector3() };
  const p = cfg.turretPivotLocal;
  const pivotScene = new Vector3(p.x, p.y, p.z)
    .applyAxisAngle(UP_AXIS, rotRad)
    .multiplyScalar(scale)
    .add(hull.position);
  return { hull, turret, pivotScene };
}

/** @param {object} cfg a `UNIT_3D` entry @returns {Promise<object>} the shared, load-once template (never mutate the result directly — clone it) */
export function getUnitTemplate(cfg) {
  const key = `${cfg.hullUrl}|${cfg.turretUrl}`;
  if (!templateCache.has(key)) templateCache.set(key, buildTemplate(cfg));
  return templateCache.get(key);
}

/** @param {import('three').Object3D} template @param {import('three').Material[]} matsOut @returns {import('three').Object3D} */
export function cloneWithMaterials(template, matsOut) {
  const copy = template.clone(true);
  copy.traverse((n) => {
    if (n instanceof Mesh) { n.material = n.material.clone(); matsOut.push(n.material); }
  });
  return copy;
}

/**
 * Assemble a fresh, independently-owned {root, turretPivot} group from
 * `cfg` — ready to add to ANY Three.js scene (a live `Unit3DLayer` scene,
 * or `UnitIconRenderer`'s own one-off snapshot rig). `hullMats`/
 * `turretMats` are this instance's own cloned materials — safe to tint,
 * fade, or dispose without touching any other instance of the same unit.
 * @param {object} cfg a `UNIT_3D` entry
 * @returns {Promise<{root:import('three').Group, turretPivot:import('three').Group,
 *   hullMats:import('three').Material[], turretMats:import('three').Material[]}>}
 */
export async function assembleUnitMesh(cfg) {
  const t = await getUnitTemplate(cfg);
  const hullMats = [], turretMats = [];
  const hullClone = cloneWithMaterials(t.hull, hullMats);
  const turretPivot = new Group();
  if (t.turret) {
    turretPivot.position.copy(t.pivotScene);
    turretPivot.add(cloneWithMaterials(t.turret, turretMats));
  } // else: empty, harmless group — no turret for this unit (see buildTemplate's own doc)
  const root = new Group();
  root.add(hullClone, turretPivot);
  return { root, turretPivot, hullMats, turretMats };
}

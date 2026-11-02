/**
 * UnitIconRenderer — renders a `UNIT_3D` unit's OWN assembled hull+turret
 * mesh (the exact model used in-game, via `UnitMeshFactory`) to a small
 * transparent-background icon, for UI portraits (`SquadBar`, S55) — not a
 * separate 2D concept-art photo, which can't help but look inconsistent
 * (different angle, lighting, and a flat studio background that clashes
 * with the HUD) with what the unit actually looks like in the game. One
 * small offscreen Three.js rig, built once and reused for every icon;
 * results are cached per unit config so a repeat request is instant.
 */
import {
  Scene, OrthographicCamera, WebGLRenderer, DirectionalLight, AmbientLight,
  Box3, Vector3, SRGBColorSpace, ACESFilmicToneMapping,
} from 'three';
import { BASE3D } from '../config/Base3DConfig.js';
import { assembleUnitMesh } from './UnitMeshFactory.js';

const DEG = Math.PI / BASE3D.degPerHalfTurn;
const SIZE_PX = 256; // offscreen render resolution — small, plenty for a HUD card
const AZIMUTH_DEG = 35; // camera angle around the vehicle — a natural 3/4 "hero" view of its front
const ELEVATION_DEG = 22;
const FRAME_MARGIN = 1.3; // headroom multiplier so the vehicle doesn't touch the frame edge
const DISTANCE_MULT = 4; // camera distance, as a multiple of the vehicle's own bounding radius
const NEAR_PLANE = 0.01;
const FAR_MULT = 2; // far plane, as a multiple of (radius * DISTANCE_MULT) — comfortable headroom past the camera
const HALF = 0.5;

let rig = null;
/** @type {Map<string, Promise<string>>} */
const iconCache = new Map();

/** @private build the shared offscreen renderer/scene/camera/lights ONCE, lazily */
function ensureRig() {
  if (rig) return rig;
  const renderer3D = new WebGLRenderer({
    canvas: document.createElement('canvas'), alpha: true, antialias: true, preserveDrawingBuffer: true,
  });
  renderer3D.outputColorSpace = SRGBColorSpace;
  renderer3D.toneMapping = ACESFilmicToneMapping;
  renderer3D.toneMappingExposure = BASE3D.toneMappingExposure;
  renderer3D.setSize(SIZE_PX, SIZE_PX, false);
  const scene = new Scene();
  const key = new DirectionalLight(BASE3D.lightColor, BASE3D.lightIntensity);
  const az = BASE3D.lightAzimuthDeg * DEG, el = BASE3D.lightElevationDeg * DEG;
  key.position.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
    .multiplyScalar(BASE3D.lightDistance);
  scene.add(key, new AmbientLight(BASE3D.ambientColor, BASE3D.ambientIntensity));
  const camera = new OrthographicCamera(-1, 1, 1, -1, NEAR_PLANE, BASE3D.farPlane); // frustum + near/far re-set per-icon by frameCamera()
  camera.up.set(0, 1, 0);
  rig = { renderer3D, scene, camera };
  return rig;
}

/**
 * @param {object} cfg a `UNIT_3D` entry @returns {Promise<string>} a PNG data URL, transparent background (cached — safe to call repeatedly for the same cfg)
 */
export function getUnitIconDataURL(cfg) {
  const key = `${cfg.hullUrl}|${cfg.turretUrl}`;
  if (!iconCache.has(key)) iconCache.set(key, renderIcon(cfg));
  return iconCache.get(key);
}

/** @private @param {object} cfg @returns {Promise<string>} */
async function renderIcon(cfg) {
  const { renderer3D, scene, camera } = ensureRig();
  const m = await assembleUnitMesh(cfg);
  m.turretPivot.rotation.y = 0; // straight-ahead pose — an icon isn't mid-aim
  scene.add(m.root);
  frameCamera(camera, m.root);
  renderer3D.setClearColor(0, 0); // transparent
  renderer3D.render(scene, camera);
  const url = renderer3D.domElement.toDataURL('image/png');
  scene.remove(m.root);
  m.root.traverse((n) => n.geometry?.dispose?.());
  for (const mat of [...m.hullMats, ...m.turretMats]) mat.dispose();
  return url;
}

/** @private point `camera` at `object`'s bounding sphere from a fixed 3/4-hero angle, framed with margin @param {import('three').OrthographicCamera} camera @param {import('three').Object3D} object */
function frameCamera(camera, object) {
  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3());
  const centre = box.getCenter(new Vector3());
  const radius = size.length() * HALF;
  const az = AZIMUTH_DEG * DEG, el = ELEVATION_DEG * DEG;
  const dir = new Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  camera.position.copy(centre).addScaledVector(dir, radius * DISTANCE_MULT);
  camera.lookAt(centre);
  const half = radius * FRAME_MARGIN;
  camera.left = -half; camera.right = half; camera.top = half; camera.bottom = -half;
  camera.near = NEAR_PLANE; camera.far = radius * DISTANCE_MULT * FAR_MULT;
  camera.updateProjectionMatrix();
}

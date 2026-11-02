/**
 * ShaderWarmup — pre-compiles shader programs AND pre-uploads textures for
 * everything currently in a live-3D scene (S58), shared by Base3DLayer and
 * Unit3DLayer (both call this every LOADING-state tick — Game.js). Fixes a
 * real, measured stutter: `WebGLRenderer.compile()` alone only pre-builds
 * shader PROGRAMS, and this project's ~95 building materials (all sharing
 * one TRELLIS-exported "recipe" — same feature set, just different texture
 * pixels) turned out to already share a single compiled program, so that
 * part was never the actual cost. The real cost is per-material TEXTURE
 * decode + GPU upload, which `compile()` does NOT touch — confirmed via
 * `WebGLRenderer.info.programs` staying at 1 after `compile()` while a
 * pan-to-reveal-a-neighbour-compound gesture still produced several
 * 100-400ms long tasks and dropped FPS to ~45. `renderer.initTexture()` is
 * Three.js's own documented fix for exactly this ("preloading a texture
 * rather than waiting until first render, which can cause noticeable
 * lags due to decode and GPU upload overhead").
 */
const TEXTURE_KEYS = [
  'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap',
  'bumpMap', 'displacementMap', 'alphaMap', 'envMap', 'lightMap',
  'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
];

/**
 * @param {import('three').WebGLRenderer} renderer3D
 * @param {import('three').Scene} scene
 * @param {import('three').Camera} camera
 * @returns {void}
 */
export function warmupScene(renderer3D, scene, camera) {
  const materials = renderer3D.compile(scene, camera);
  for (const material of materials) {
    for (let i = 0; i < TEXTURE_KEYS.length; i++) {
      const tex = material[TEXTURE_KEYS[i]];
      if (tex) renderer3D.initTexture(tex);
    }
  }
}

/**
 * `warmupScene` plus a real render pass with the camera's lateral frustum
 * bounds temporarily widened to `halfExtent`, so every object gets a real
 * draw call — geometry (vertex/index buffers) only uploads to the GPU on a
 * mesh's first real draw, which neither `compile()` nor `initTexture()`
 * triggers (see this file's own doc for the measured evidence). Restores
 * the camera's original bounds before returning; the stray frame this
 * renders never reaches screen since callers only invoke this while their
 * composited Pixi sprite stays hidden (still LOADING).
 * @param {import('three').WebGLRenderer} renderer3D
 * @param {import('three').Scene} scene
 * @param {import('three').OrthographicCamera} camera
 * @param {number} halfExtent scene units, comfortably past whatever content exists
 * @returns {void}
 */
export function warmupSceneWide(renderer3D, scene, camera, halfExtent) {
  warmupScene(renderer3D, scene, camera);
  const { left, right, top, bottom } = camera;
  camera.left = -halfExtent; camera.right = halfExtent;
  camera.top = halfExtent; camera.bottom = -halfExtent;
  camera.updateProjectionMatrix();
  renderer3D.render(scene, camera);
  camera.left = left; camera.right = right;
  camera.top = top; camera.bottom = bottom;
  camera.updateProjectionMatrix();
}

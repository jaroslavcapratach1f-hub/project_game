/**
 * GltfCache — one shared, memoized GLB fetch+parse per URL (S58). Found
 * live: with 5 full base compounds now on the map (the player's own +
 * NeighbourCompound3D.js's 4 neighbours, all built from the SAME
 * STARTING_LAYOUT / BUILDING_3D urls) and no caching anywhere before this,
 * every one of them independently re-fetched the identical ~16 building/
 * wall/gate/tower GLB files — a burst of concurrent multi-megabyte
 * requests that a fast desktop/loopback test never felt, but that choked a
 * real phone on real Wi-Fi ("loads 2 times then shows a problem with
 * http"). `loadGltfCached(url)` returns the SAME in-flight/resolved
 * promise for a repeated URL, so N callers share ONE network fetch + parse
 * instead of N.
 *
 * The returned `gltf.scene` is SHARED across every caller — each one MUST
 * `.clone()` it before mutating position/rotation/scale or adding it to a
 * scene graph (Three.js reparents on `add()`, so two callers using the
 * same un-cloned Object3D would fight over it). `.clone()` deep-clones the
 * transform hierarchy but shares geometry/material by reference — the
 * exact convention `DefenceWall3D._place()` already uses for wall
 * segments, and confirmed safe for buildings too: `Base3DGhost`'s drag-
 * ghost swap replaces a mesh's `.material` REFERENCE, never mutates a
 * shared material's own properties in place.
 *
 * S58: also the single shared cache for `UnitMeshFactory.js` /
 * `InfantryMeshFactory.js` (tank hull/turret, soldier torso/legs — folded
 * in here rather than kept as 2 more near-duplicate loader+cache pairs),
 * which makes this the one source of truth for "how much of the game's
 * real 3D content has actually finished loading" — `gltfLoadProgress()` /
 * `whenGltfsSettled()` below, which `Game.js`'s loading-screen progress
 * bar reads instead of a fixed handful of animation frames (the old
 * placeholder). The user's own explicit call: "TAP TO BEGIN" has to mean
 * every building/unit/wall/tower model is REALLY ready, not "a moment has
 * passed."
 */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
/** @type {Map<string, Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>>} */
const cache = new Map();
let requested = 0;
let resolved = 0;

/**
 * @param {string} url
 * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>} shared — clone `.scene` before use
 */
export function loadGltfCached(url) {
  let p = cache.get(url);
  if (!p) {
    requested++;
    p = loader.loadAsync(url)
      .then((gltf) => { resolved++; return gltf; })
      .catch((err) => { resolved++; throw err; }); // still counts toward "settled" so progress can't stall on one bad file
    cache.set(url, p);
  }
  return p;
}

/** @returns {number} 0..1 — every URL ever requested vs. every one that has since resolved OR failed; 1 when nothing has been requested yet */
export function gltfLoadProgress() {
  return requested === 0 ? 1 : resolved / requested;
}

/** @returns {Promise<void>} resolves once every GLB requested so far has settled (loaded or failed) — never rejects, so one bad file can't hang the caller */
export function whenGltfsSettled() {
  return Promise.allSettled(cache.values()).then(() => {});
}

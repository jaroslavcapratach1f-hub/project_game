/**
 * Base3DLayer — a live Three.js scene composited into the PixiJS scene
 * graph, replacing pre-rendered building sprites with real GLB models
 * (every building renders as an actual 3D model, not a baked 2D image).
 * Renders into its OWN off-screen canvas (never attached to the DOM) and
 * pushes that canvas into `renderer.buildingsSlot` as one Pixi `Sprite` —
 * a screen-space slot sandwiched between `worldRootBack` (ground/decals/
 * shadows) and `worldRootFront` (units, other buildings, particles, UI) —
 * see `LayerConfig.js` WORLD_BACK/FRONT_LAYERS. That gives 3D buildings a
 * real position in the single Pixi draw order (nothing placed in front of
 * one, e.g. a building south of it, is ever wrongly hidden behind it)
 * without a second visible `<canvas>` element competing for DOM z-index —
 * the old approach, which had no way to sit below `LAYERS.HUD`/`OVERLAY`
 * (it rendered on top of the loading screen) or above ground-layer 2D
 * content by world position.
 *
 * The camera is an orthographic camera locked to GDD 24's frame (30°
 * pitch, 45° azimuth — the same projection `utils/SquareGrid.js` encodes
 * as flat 2D math, see Base3DConfig.js for the derivation) and NEVER
 * changes — direction is fixed, and no building ever rotates or drifts on
 * its own. Every building keeps its own fixed grid slot and fixed facing
 * at all times; panning only ever moves the camera's position in exact
 * lockstep with the game's 2D `Camera`, identically to every 2D layer
 * around it (an earlier "parallax" attempt tilted the camera's angle with
 * pan instead — since an orthographic camera only holds its OWN lookAt
 * target still as its angle changes, that swung every building not
 * exactly at that target out of sync with the grid; removed for good).
 *
 * Coordinate convention: every model is placed in GRID units (cx,cy, the
 * same numbers `BaseGridView`/`HqView` already use), converted to 3D scene
 * units by `cellToScene`. The scene's own origin (0,0,0) always corresponds
 * to the base's `WORLDMAP.baseCentre` — `setBaseOrigin` records that point
 * in 2D world px so panning can be translated between the two spaces.
 */
import gsap from 'gsap';
import { Sprite, Texture } from 'pixi.js';
import {
  Scene, OrthographicCamera, WebGLRenderer, DirectionalLight, AmbientLight,
  Vector3, Box3, Group, SRGBColorSpace, ACESFilmicToneMapping,
} from 'three';
import { loadGltfCached } from './GltfCache.js';
import { BASE3D } from '../config/Base3DConfig.js';
import { BASE } from '../config/BaseConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { pxToCellCentre } from '../utils/SquareGrid.js';
import { enterGhost, exitGhost, setGhostValid } from './Base3DGhost.js';
import { warmupSceneWide } from './ShaderWarmup.js';
import { rebuildCanvasSprite } from './CanvasSprite3D.js';

const MS = 1000;

const DEG = Math.PI / BASE3D.degPerHalfTurn;
const HALF = 0.5;
const QUARTER_TURN_DEG = 90;
// S58 compileScene() warmup only — past the whole map's lateral extent
// (worst case ~17500 scene units, see BASE3D.nearPlane/farPlane's doc) so
// every compound is in-frustum for one warmup render regardless of pan.
const WARMUP_HALF_EXTENT = 30000;

/** @param {number} cx @param {number} cy @returns {{x:number,z:number}} 3D scene units */
export function cellToScene(cx, cy) {
  const s = BASE3D.cameraScale;
  return { x: cx * CELL_PX * s, z: cy * CELL_PX * s };
}

export class Base3DLayer {
  /**
   * @param {import('./Camera.js').Camera} camera2D the shared 2D world camera to mirror
   * @param {import('./Renderer.js').Renderer} renderer owns `buildingsSlot`, the compositing point
   */
  constructor(camera2D, renderer) {
    this._camera2D = camera2D;
    /** @private the Pixi container `resize()` re-parents a fresh Sprite into on every resize — see resize()'s own doc */
    this._slot = renderer.buildingsSlot;
    this._renderer3D = new WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, antialias: true });
    this._renderer3D.outputColorSpace = SRGBColorSpace;
    this._renderer3D.toneMapping = ACESFilmicToneMapping;
    this._renderer3D.toneMappingExposure = BASE3D.toneMappingExposure;
    this._sprite = new Sprite(Texture.from(this._renderer3D.domElement));
    this._slot.addChild(this._sprite);
    this._scene = new Scene();
    this._camera = new OrthographicCamera(-1, 1, 1, -1, BASE3D.nearPlane, BASE3D.farPlane);
    this._buildLights();
    this._models = new Map(); // id -> { root, cx, cy }
    /** @private world-px position this layer's 3D origin (0,0,0) sits at */
    this._originPx = { x: 0, y: 0 };
    this._distance = 1000;
    this._setCameraDirection();
  }

  /**
   * @private the camera's direction is FIXED (GDD 24's locked frame) — it
   * never changes with pan. `update()` only ever moves the camera's
   * position + lookAt TARGET together, exactly mirroring the 2D camera, so
   * every building's screen position tracks pan identically to every other
   * (2D) layer. S54 bug: an earlier version also tilted this direction by
   * the pan amount for a "parallax" effect — since an orthographic camera
   * only holds its OWN lookAt target still as the angle changes, everything
   * NOT at that exact target (i.e. every building whenever the view isn't
   * perfectly centred) swung on screen out of sync with the linear-panning
   * 2D grid around it. Real parallax ("see another side while scrolling")
   * has to rotate each BUILDING in place instead — see `update()`'s wobble.
   */
  _setCameraDirection() {
    const az = BASE3D.azimuthDeg * DEG, pitch = BASE3D.pitchDeg * DEG;
    this._dir = new Vector3(Math.cos(pitch) * Math.cos(az), Math.sin(pitch), Math.cos(pitch) * Math.sin(az));
    this._camera.up.set(0, 1, 0);
  }

  /** @returns {void} size everything to the window; call once the renderer's own canvas exists */
  enable() { this.resize(); }

  /** @param {boolean} visible hide during the loading screen / anywhere off the base view @returns {void} */
  setVisible(visible) { this._sprite.visible = visible; }

  /**
   * Pre-compile every material's shader program, pre-upload its textures,
   * AND force a real render pass (geometry only uploads to the GPU on a
   * mesh's first real draw — neither `compile()` nor `initTexture()`
   * triggers that) so a building that was off camera at boot (any
   * neighbour compound — NeighbourCompound3D.js — not near wherever the 2D
   * camera started) doesn't stay un-warmed until the player later pans/
   * zooms it into view, landing as a real, reproducible stutter (measured:
   * several 100-400ms long tasks, FPS dropping to ~45) exactly when the
   * player is mid-gesture. See `warmupSceneWide`'s own doc (ShaderWarmup.js)
   * for how. `Game.js` calls this every LOADING-state tick, spending the
   * cost behind the loading screen — repeated calls stay cheap (every step
   * skips already-warmed work) so it can just run every tick while
   * neighbour compounds are still loading in.
   * @returns {void}
   */
  compileScene() { warmupSceneWide(this._renderer3D, this._scene, this._camera, WARMUP_HALF_EXTENT); }

  /** @param {number} x @param {number} y world px — the 2D point this layer's (0,0,0) maps to @returns {void} */
  setBaseOrigin(x, y) {
    this._originPx.x = x;
    this._originPx.y = y;
  }

  /** @private one warm key light (upper-left) + cool ambient fill, GDD 24 */
  _buildLights() {
    const key = new DirectionalLight(BASE3D.lightColor, BASE3D.lightIntensity);
    const az = BASE3D.lightAzimuthDeg * DEG, el = BASE3D.lightElevationDeg * DEG;
    key.position.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
      .multiplyScalar(BASE3D.lightDistance);
    this._scene.add(key, new AmbientLight(BASE3D.ambientColor, BASE3D.ambientIntensity));
  }

  /**
   * Load a GLB and place it at grid cell (cx,cy) relative to this layer's
   * origin, auto-fit to its footprint: the mesh's own local units are
   * whatever the source DCC/export used (arbitrary), so its natural
   * bounding box is measured after load and non-uniformly scaled so that
   * box exactly spans `footprint.w` x `footprint.h` grid cells — the same
   * "art fills exactly its allocated squares" contract every 2D sprite
   * already follows (`SquareGrid.footprintFrontAnchor`), just applied to a
   * live 3D model instead of a baked image. Replaces any existing model
   * registered under `id`.
   * @param {string} id @param {string} url @param {number} cx @param {number} cy
   * @param {{footprint:{w:number,h:number}, rotationYDeg?:number}} opts
   * @returns {Promise<void>}
   */
  async setBuildingModel(id, url, cx, cy, opts) {
    const { footprint, rotationYDeg = 0 } = opts;
    this.removeBuildingModel(id);
    const gltf = await loadGltfCached(url);
    const inner = gltf.scene.clone(); // gltf is SHARED across every caller of this url — see GltfCache.js
    // Measure BEFORE rotating. Three.js composes an object's local matrix as
    // T*R*S, so `inner.scale` always stretches the mesh's OWN pre-rotation
    // local axes — measuring the box after rotating (and then fitting to
    // world-aligned targets) silently swaps width/depth for any footprint
    // where w!==h once rotationYDeg is a quarter turn (±90/270), since a
    // quarter turn swaps which local axis ends up aligned with which world
    // axis. Invisible for square footprints or 180°-multiple rotations —
    // real once both a non-square footprint and a quarter turn combine
    // (caught on `engineering`, 4x3 @ -90°; also silently affects HQ's
    // 7x8 @ -90°, just less visibly since 7 and 8 are close).
    const rawSize = new Box3().setFromObject(inner).getSize(new Vector3());
    const quarterTurn = Math.abs(Math.round(rotationYDeg / QUARTER_TURN_DEG)) % 2 === 1;
    const targetLocalX = (quarterTurn ? footprint.h : footprint.w) * CELL_PX * BASE3D.cameraScale;
    const targetLocalZ = (quarterTurn ? footprint.w : footprint.h) * CELL_PX * BASE3D.cameraScale;
    const scaleX = rawSize.x > 0 ? targetLocalX / rawSize.x : 1;
    const scaleZ = rawSize.z > 0 ? targetLocalZ / rawSize.z : 1;
    const scaleY = (scaleX + scaleZ) * HALF; // no separate height target — average keeps proportions sane
    inner.scale.set(scaleX, scaleY, scaleZ);
    inner.rotation.y = rotationYDeg * DEG;
    // re-measure post-fit and re-centre on XZ, sit the base on the ground plane (Y=0) —
    // `inner` carries the footprint fit permanently; `lod` (the outer group) carries ONLY
    // the LOD shrink multiplier, so the two scales never fight each other (S54 bug: a
    // single shared scale meant the LOD blend clobbered the footprint fit back to 1)
    const box2 = new Box3().setFromObject(inner);
    const centre = box2.getCenter(new Vector3());
    inner.position.set(-centre.x, -box2.min.y, -centre.z);
    const lod = new Group();
    lod.add(inner);
    const p = cellToScene(cx, cy);
    lod.position.set(p.x, 0, p.z);
    this._scene.add(lod);
    this._models.set(id, { root: lod, cx, cy });
  }

  /** @param {string} id @param {number} scale uniform LOD scale, multiplied over the footprint fit @returns {void} */
  setModelScale(id, scale) {
    const m = this._models.get(id);
    if (m) m.root.scale.setScalar(scale);
  }

  /**
   * Reposition an already-loaded model WITHOUT reloading its GLB (S54 —
   * `setBuildingModel` reloads from scratch each call, far too slow to run
   * every drag-move frame). Also drives HQ's far-zoom recentre
   * (`Building3DView.setBlend`'s position lerp).
   * @param {string} id @param {number} cx @param {number} cy
   * @param {number} [liftY=0] scene-unit hover offset while drag-ghosted
   * @returns {void}
   */
  setModelPosition(id, cx, cy, liftY = 0) {
    const m = this._models.get(id);
    if (!m) return;
    gsap.killTweensOf(m.root.position); // in case a tweenModelPosition (below) is still gliding
    const p = cellToScene(cx, cy);
    m.root.position.set(p.x, liftY, p.z);
  }

  /**
   * Ease an already-loaded model to a new grid position instead of an
   * instant `setModelPosition` (S54 drag ghost) — a direct position.set()
   * on every drag-move read as a teleport between grid-snapped cells, not a
   * hover.
   * @param {string} id @param {number} cx @param {number} cy @param {number} [liftY=0]
   * @returns {void}
   */
  tweenModelPosition(id, cx, cy, liftY = 0) {
    const m = this._models.get(id);
    if (!m) return;
    const p = cellToScene(cx, cy);
    gsap.killTweensOf(m.root.position);
    gsap.to(m.root.position, { x: p.x, y: liftY, z: p.z, duration: BASE.dragGhost.easeMs / MS, ease: 'power2.out' });
  }

  /**
   * Enter/exit the translucent drag-ghost look (S54 BuildingDragController)
   * — see Base3DGhost.js for the material swap itself.
   * @param {string} id @param {boolean} isGhost @returns {void}
   */
  setModelGhost(id, isGhost) {
    const m = this._models.get(id);
    if (!m) return;
    if (isGhost) enterGhost(m); else exitGhost(m);
  }

  /** @param {string} id @param {boolean} valid @returns {void} recolour the shared ghost material green/red */
  setModelGhostValid(id, valid) {
    if (this._models.has(id)) setGhostValid(valid);
  }

  /** @param {import('three').Object3D} obj a caller-owned object (e.g. DefenceWall3D's segment group) @returns {void} */
  addObject(obj) { this._scene.add(obj); }

  /** @param {import('three').Object3D} obj @returns {void} */
  removeObject(obj) { this._scene.remove(obj); }

  /** @param {string} id @returns {void} */
  removeBuildingModel(id) {
    const m = this._models.get(id);
    if (!m) return;
    this._scene.remove(m.root);
    m.root.traverse((n) => { n.geometry?.dispose?.(); n.material?.dispose?.(); });
    this._models.delete(id);
  }

  /** @returns {void} re-fit the off-screen canvas + camera frustum + composited Sprite to the window — see CanvasSprite3D.js's own doc for why resize rebuilds the Sprite */
  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this._renderer3D.setPixelRatio(dpr);
    this._renderer3D.setSize(w, h, false); // false: canvas is off-screen, no CSS box to size
    this._sprite = rebuildCanvasSprite(this._sprite, this._slot, this._renderer3D.domElement);
    this._sprite.position.set(0, 0);
    // Not sprite.width/height: those bake in a scale relative to the
    // texture's *current* reported size, which drifts once the canvas's
    // real pixel buffer (w*dpr) is read back after `source.update()` — a
    // direct 1/dpr scale on the raw canvas pixels is exact regardless.
    this._sprite.scale.set(1 / dpr, 1 / dpr);
    const hw = w / 2, hh = h / 2;
    this._camera.left = -hw; this._camera.right = hw; this._camera.top = hh; this._camera.bottom = -hh;
    this._camera.updateProjectionMatrix();
  }

  /**
   * Mirror the 2D camera's pan + zoom exactly — camera direction is FIXED
   * (see `_setCameraDirection`) and no building ever rotates or shifts on
   * its own, so every building tracks pan identically to the 2D grid
   * around it: same fixed grid slot, same fixed facing, always. Render,
   * then push the result into the composited Sprite's texture. Must run
   * every frame the base 3D layer is visible.
   *
   * S54 bug: a raw (pan.x, 0, pan.z) target isn't perpendicular to the
   * tilted `_dir` (30deg pitch has a non-zero Y), so panning drifted every
   * building's DEPTH, not just its screen position — ~600px of scroll was
   * enough to clip the whole base behind the near plane (worse zoomed out:
   * `panBy` divides by zoom). Stripping `_dir`'s component from `target`
   * fixes it: doesn't touch screen X/Y (only perpendicular components do
   * for an ortho camera), but depth of every static building is now
   * constant regardless of pan.
   * @returns {void}
   */
  update() {
    const cam = this._camera2D;
    const dx = cam.x - this._originPx.x, dy = cam.y - this._originPx.y;
    const { cx, cy } = pxToCellCentre(dx, dy, CELL_PX);
    const pan = cellToScene(cx, cy);
    const target = new Vector3(pan.x, 0, pan.z);
    target.addScaledVector(this._dir, -target.dot(this._dir));

    this._camera.position.copy(target).addScaledVector(this._dir, this._distance);
    this._camera.lookAt(target);
    this._camera.zoom = cam.zoom;
    this._camera.updateProjectionMatrix();
    this._renderer3D.render(this._scene, this._camera);
    this._sprite.texture.source.update();
  }

  /** @returns {void} */
  disable() {
    this._sprite.destroy();
    this._renderer3D.dispose();
  }
}

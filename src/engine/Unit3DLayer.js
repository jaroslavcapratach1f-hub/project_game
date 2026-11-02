/**
 * Unit3DLayer — the live-3D UNITS counterpart to `Base3DLayer.js` (S55,
 * first live-3D troop). Same locked GDD-24 camera frame and lighting
 * (`BASE3D`), same "own off-screen WebGLRenderer, composited as a Pixi
 * Sprite" technique — but simpler: no grid/footprint fitting (units move
 * continuously in world px, not grid cells) and no drag-ghosting. Composites
 * into `renderer.unitsSlot`, a SEPARATE screen-space slot from
 * `buildingsSlot` sitting one layer later (LayerConfig.js
 * `WORLD_UNITS_BACK_LAYERS`/`WORLD_FRONT_LAYERS`) so a 3D unit draws in
 * front of 2D infantry but behind 2D vehicles, rather than reusing
 * `buildingsSlot`'s position (which would bury it under both).
 *
 * `Unit3DBody` (one per live 3D-bodied unit) owns its own Three.js
 * Object3D — `addObject`/`removeObject` add/remove it from the scene,
 * `registerBody`/`unregisterBody` add/remove the body itself from the set
 * `update()` reprojects every render frame (see `update()`'s own doc for
 * why position needs that and rotation doesn't). An empty set skips the
 * render pass entirely — this feature costs nothing until a 3D-bodied
 * unit actually exists.
 */
import { Sprite, Texture } from 'pixi.js';
import {
  Scene, OrthographicCamera, WebGLRenderer, DirectionalLight, AmbientLight,
  Vector3, SRGBColorSpace, ACESFilmicToneMapping,
} from 'three';
import { BASE3D } from '../config/Base3DConfig.js';
import { CELL_PX } from '../config/BaseGridConfig.js';
import { pxToCellCentre } from '../utils/SquareGrid.js';
import { cellToScene } from './Base3DLayer.js';
import { warmupScene } from './ShaderWarmup.js';
import { rebuildCanvasSprite } from './CanvasSprite3D.js';

const DEG = Math.PI / BASE3D.degPerHalfTurn;
const CAMERA_DISTANCE = 1000; // how far back along `_dir` the camera sits — matches Base3DLayer's own building camera

export class Unit3DLayer {
  /**
   * @param {import('./Camera.js').Camera} camera2D the shared 2D world camera to mirror
   * @param {import('./Renderer.js').Renderer} renderer owns `unitsSlot`, the compositing point
   */
  constructor(camera2D, renderer) {
    this._camera2D = camera2D;
    /** @private the Pixi container `resize()` re-parents a fresh Sprite into — see CanvasSprite3D.js */
    this._slot = renderer.unitsSlot;
    this._renderer3D = new WebGLRenderer({ canvas: document.createElement('canvas'), alpha: true, antialias: true });
    this._renderer3D.outputColorSpace = SRGBColorSpace;
    this._renderer3D.toneMapping = ACESFilmicToneMapping;
    this._renderer3D.toneMappingExposure = BASE3D.toneMappingExposure;
    this._sprite = new Sprite(Texture.from(this._renderer3D.domElement));
    this._slot.addChild(this._sprite);
    this._scene = new Scene();
    // S58: was a local fixed NEAR_PLANE=0.1/FAR_PLANE=4000 ("depth is
    // bounded by the VIEWPORT, not by map distance, so a modest budget is
    // enough") — true, but the viewport's WORLD-PX SIZE itself grows as
    // zoom drops (an orthographic camera shows more area at low zoom), so a
    // unit's worst-case depth grows right along with it; a fixed small
    // budget clipped units zoomed out far enough, same root cause as the
    // building far-plane bug this session already found and fixed. Now
    // shares BASE3D's own (deliberately generous, map-wide) nearPlane/
    // farPlane — one budget for both live-3D layers instead of two that can
    // silently drift out of sync.
    this._camera = new OrthographicCamera(-1, 1, 1, -1, BASE3D.nearPlane, BASE3D.farPlane);
    this._buildLights();
    /** @private live Unit3DBody instances — reprojected every render frame, see `update()` */
    this._bodies = new Set();
    this._forceHidden = false;
    /**
     * @private world-px position this layer's 3D origin (0,0,0) sits at —
     * re-anchored to the 2D camera's OWN position every RENDER frame (see
     * `update()`), not a fixed point. A unit's depth (its scene position
     * dotted with `_dir`) only needs to stay small RELATIVE TO WHATEVER'S
     * ON SCREEN — re-anchoring to the live camera makes that automatic,
     * bounded by the viewport size, regardless of how far the unit or the
     * camera have travelled from the base. A fixed base-centre origin
     * (S55 bug #1) only worked near the base; a fixed `_distance` (S55 bug
     * #2, "tanks can't move far from base without disappearing") was
     * really the same root cause — depth grows with distance from a FIXED
     * point, not with distance the tank has actually travelled. With the
     * origin re-pinned every RENDER frame, the camera's own scene
     * position/orientation are CONSTANT (computed once below) — no
     * per-frame depth-drift math is needed at all, and there is no longer
     * any map-distance limit.
     *
     * MUST be refreshed at render cadence, not sim-tick cadence (S55 bug
     * #3 — tried refreshing it from `BaseArmy.update()`, once per sim
     * tick, right before `EntityManager.update()` -> every body's
     * `Unit3DBody.sync()`: looked consistent in isolation, but `WorldScene`
     * — and so `BaseArmy` — runs BEFORE `Game.update()` advances the
     * camera in the system-registration order (`Game.init()`:
     * `loop.addSystem(this._world)` before `loop.addSystem(this)`), so
     * that read was always one full sim tick behind the camera's TRUE
     * current position — a lag that compounds every tick during
     * continuous panning, not a one-frame blip. Camera zoom can ALSO jump
     * immediately mid-tick, outside the sim cadence entirely
     * (`Camera.nudgeZoom`, a raw pinch, mutates `cam.x/y/zoom` the instant
     * the input event fires — unlike `panBy`/`setZoom`, which only ever
     * move an eased target that `Camera.update(dt)` steps toward at the
     * sim rate). Both cases need the same fix: recompute EVERY live
     * unit's scene position fresh at RENDER time (`update()`, via each
     * body's own `reprojectPosition()`), using whatever the camera's
     * actual current state is at that instant — never derived from, or
     * cached across, a sim tick.
     */
    this._originPx = { x: 0, y: 0 };
    this._setCameraDirection();
  }

  /**
   * Continuous world px -> 3D scene units, relative to `_originPx` (the
   * live camera's own current world position — see the constructor's own
   * comment; refreshed at the top of every `update()`). `Unit3DBody` calls
   * this to place each unit every frame, so a unit's scene position is
   * always expressed relative to WHERE THE CAMERA CURRENTLY IS, not a
   * fixed point — that's what makes depth bounded by the viewport instead
   * of by distance travelled.
   *
   * NOT a plain `* cameraScale` (S55 bug: that drifted a fixed unit's
   * on-screen position further and further from correct as the camera
   * panned — "flies all over the map" — because the base's own interior
   * grid is diamond-projected 45° off flat world px, see SquareGrid.js's
   * own header comment). `Base3DLayer.update()`'s camera-follow already
   * solves this for buildings — `pxToCellCentre` undoes that diamond skew
   * (an EXACT inverse, not a grid-snap — the "cell" units it returns are
   * plain floats), `cellToScene` re-projects into 3D scene units the same
   * way a building's own (cx,cy) does. Units have no native cell — this
   * round-trips their world px through the exact same two steps so they
   * share ONE consistent reference frame with both buildings and the
   * camera-follow target.
   * @param {number} wx @param {number} wy @returns {{x:number,z:number}} scene units
   */
  worldToScene(wx, wy) {
    const { cx, cy } = pxToCellCentre(wx - this._originPx.x, wy - this._originPx.y, CELL_PX);
    return cellToScene(cx, cy);
  }

  /**
   * World-space heading (radians, 0=+X — `Entity.rotation`'s own
   * convention) -> the scene-space Y-axis rotation a unit's hull must use
   * to actually FACE that direction once rendered through `worldToScene`.
   * NOT the same number, and NOT a constant offset (S55 bug: "the tank
   * slides sideways while moving" — its hull rotation didn't track its
   * direction of travel). `worldToScene` isn't a pure rotation — the
   * base's diamond projection (`SquareGrid.js`, `ISO_RATIO`) is a SHEAR,
   * so a fixed angular offset is only ever correct at 4 cardinal headings.
   * Transforming a real direction vector through the exact same pipeline
   * position uses is the only way this can't drift out of sync with it.
   * @param {number} worldRotationRad @returns {number} radians
   */
  headingToSceneY(worldRotationRad) {
    const ox = this._originPx.x, oy = this._originPx.y;
    const tip = this.worldToScene(ox + Math.cos(worldRotationRad), oy + Math.sin(worldRotationRad));
    // Three's positive Y rotation sends +X toward -Z, not +Z. Models are
    // normalized to +X forward by their registry's rotationYDeg first.
    return Math.atan2(-tip.z, tip.x);
  }

  /**
   * @private the camera's direction, position AND orientation are ALL
   * fixed for this layer's whole lifetime — unlike `Base3DLayer` (whose
   * building content sits at varying scene positions around a moving
   * camera), here the ORIGIN moves to the camera instead (`update()`), so
   * the camera itself never needs to translate or re-target at all: it
   * always sits at `_dir * CAMERA_DISTANCE` looking at the scene origin.
   */
  _setCameraDirection() {
    const az = BASE3D.azimuthDeg * DEG, pitch = BASE3D.pitchDeg * DEG;
    this._dir = new Vector3(Math.cos(pitch) * Math.cos(az), Math.sin(pitch), Math.cos(pitch) * Math.sin(az));
    this._camera.up.set(0, 1, 0);
    this._camera.position.copy(this._dir).multiplyScalar(CAMERA_DISTANCE);
    this._camera.lookAt(0, 0, 0);
  }

  /** @returns {void} size everything to the window; call once the renderer's own canvas exists */
  enable() { this.resize(); }

  /** @param {boolean} visible hide during the loading screen @returns {void} */
  setVisible(visible) { this._forceHidden = !visible; }

  /**
   * Pre-compile every material's shader program AND pre-upload its
   * textures against the current camera (S58) — see ShaderWarmup.js's own
   * doc for why this matters; `Game.js` calls both layers' version every
   * LOADING-state tick.
   * @returns {void}
   */
  compileScene() { warmupScene(this._renderer3D, this._scene, this._camera); }

  /** @private one warm key light (upper-left) + cool ambient fill, matches Base3DLayer exactly */
  _buildLights() {
    const key = new DirectionalLight(BASE3D.lightColor, BASE3D.lightIntensity);
    const az = BASE3D.lightAzimuthDeg * DEG, el = BASE3D.lightElevationDeg * DEG;
    key.position.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
      .multiplyScalar(BASE3D.lightDistance);
    this._scene.add(key, new AmbientLight(BASE3D.ambientColor, BASE3D.ambientIntensity));
  }

  /** @param {import('three').Object3D} obj a caller-owned object (Unit3DBody's hull/turret group) @returns {void} */
  addObject(obj) { this._scene.add(obj); }

  /** @param {import('three').Object3D} obj @returns {void} */
  removeObject(obj) { this._scene.remove(obj); }

  /** @param {import('../entities/Unit3DBody.js').Unit3DBody} body @returns {void} reprojected every render frame, see `update()` */
  registerBody(body) { this._bodies.add(body); }

  /** @param {import('../entities/Unit3DBody.js').Unit3DBody} body @returns {void} */
  unregisterBody(body) { this._bodies.delete(body); }

  /** @returns {void} re-fit the off-screen canvas + camera frustum + composited Sprite to the window — see CanvasSprite3D.js's own doc for why resize rebuilds the Sprite */
  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this._renderer3D.setPixelRatio(dpr);
    this._renderer3D.setSize(w, h, false);
    this._sprite = rebuildCanvasSprite(this._sprite, this._slot, this._renderer3D.domElement);
    this._sprite.position.set(0, 0);
    this._sprite.scale.set(1 / dpr, 1 / dpr);
    const hw = w / 2, hh = h / 2;
    this._camera.left = -hw; this._camera.right = hw; this._camera.top = hh; this._camera.bottom = -hh;
    this._camera.updateProjectionMatrix();
  }

  /**
   * Re-anchor the origin to the live 2D camera, reproject every live
   * body's position against it, mirror zoom, render — ALL at render
   * cadence, all from the SAME live camera read (see the constructor's
   * own comment for why sim-tick cadence doesn't work for this). Rotation
   * doesn't need reprojecting here: `headingToSceneY` (see its own doc)
   * cancels `_originPx` out algebraically, so it's already exact
   * regardless of when it last ran — only POSITION depends on the origin
   * staying fresh, which is why only that gets a per-render-frame pass.
   * @returns {void}
   */
  update() {
    this._sprite.visible = !this._forceHidden && this._bodies.size > 0;
    if (!this._sprite.visible) return; // nothing 3D-bodied on screen — skip the render pass
    const cam = this._camera2D;
    this._originPx.x = cam.x;
    this._originPx.y = cam.y;
    for (const body of this._bodies) body.reprojectPosition();
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

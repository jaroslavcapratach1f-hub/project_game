/**
 * Renderer — owns the PixiJS Application and the 13-layer container stack.
 * World layers sit under a single worldRoot that is transformed every frame
 * by the Camera (position + zoom + shake offset). Screen layers (HUD,
 * overlay) are stage siblings and are never transformed.
 */
import { Application, Container, Text } from 'pixi.js';
import {
  LAYER_ORDER, WORLD_BACK_LAYERS, WORLD_UNITS_BACK_LAYERS, WORLD_FRONT_LAYERS,
} from '../config/LayerConfig.js';
import { RENDER } from '../config/GameConfig.js';

const FPS_MARGIN = 8;
const HALF = 0.5;
const FPS_STYLE = { fill: 0xc5a55a, fontSize: 14, fontFamily: 'monospace' };

/**
 * @param {number} cap max devicePixelRatio (graphicsQuality preset). Also
 *   clamped by RENDER.maxResolution and floored at 1 so a bad cap can never
 *   produce a degenerate render resolution.
 * @returns {number} render resolution
 */
function pickResolution(cap) {
  const ceiling = Math.min(cap || RENDER.maxResolution, RENDER.maxResolution);
  return Math.max(1, Math.min(window.devicePixelRatio || 1, ceiling));
}

export class Renderer {
  constructor() {
    /** @type {Application} */ this.app = new Application();
    // (S54, extended S55) worldRoot splits in three so two screen-space slots
    // can sit between the pieces, one for live-3D buildings and one for live-3D
    // units — see LayerConfig.js WORLD_BACK/WORLD_UNITS_BACK/FRONT_LAYERS.
    /** @private @type {Container} */ this.worldRootBack = new Container();
    /** @private @type {Container} GROUND_UNITS only — between buildingsSlot and unitsSlot */
    this.worldRootUnitsBack = new Container();
    /** @private @type {Container} */ this.worldRootFront = new Container();
    /** @private @type {Container} screen-space; Base3DLayer puts its canvas-backed Sprite here */
    this.buildingsSlot = new Container();
    /** @private @type {Container} screen-space; Unit3DLayer puts its canvas-backed Sprite here */
    this.unitsSlot = new Container();
    /** @private @type {Map<string, Container>} */ this._layers = new Map();
    /** @private @type {Text|null} */ this._fpsText = null;
    /** @private @type {?import('./Camera.js').Camera} */ this._camera = null;
    /** @private dpr ceiling — RENDER.maxResolution, overridden by graphicsQuality */
    this._dprCap = RENDER.maxResolution;
  }

  /**
   * Boot the Pixi Application, attach its canvas, build the layer stack, and
   * seed the camera viewport.
   * @param {import('./Camera.js').Camera} camera the shared camera
   * @returns {Promise<void>}
   */
  async init(camera) {
    this._camera = camera;
    await this.app.init({
      resizeTo: window,
      backgroundColor: RENDER.backgroundColor,
      antialias: true,
      autoDensity: true,
      resolution: pickResolution(this._dprCap),
    });
    document.body.appendChild(this.app.canvas);
    this.app.ticker.stop(); // GameLoop drives render(); Pixi does not self-tick
    this._buildLayers();
    if (RENDER.showDebugFps) this._buildFpsText();
    camera.setViewport(this.app.screen.width, this.app.screen.height);
  }

  /**
   * Look up a layer container by its LayerConfig name.
   * @param {string} name
   * @returns {Container|undefined}
   */
  layer(name) {
    return this._layers.get(name);
  }

  /**
   * Create one container per layer, ascending index order. World layers
   * split three ways: `worldRootBack` (behind the 3D buildings slot),
   * `worldRootUnitsBack` (between the buildings and units slots — just
   * GROUND_UNITS today), `worldRootFront` (in front of the units slot);
   * screen layers go straight on the stage. Stage order: back root ->
   * buildings slot -> units-back root -> units slot -> front root -> screen
   * layers — see LayerConfig.js WORLD_BACK/WORLD_UNITS_BACK/FRONT_LAYERS.
   * @private
   */
  _buildLayers() {
    this.worldRootBack.label = 'worldRootBack';
    this.worldRootUnitsBack.label = 'worldRootUnitsBack';
    this.worldRootFront.label = 'worldRootFront';
    this.buildingsSlot.label = 'buildingsSlot';
    this.unitsSlot.label = 'unitsSlot';
    this.app.stage.addChild(
      this.worldRootBack, this.buildingsSlot,
      this.worldRootUnitsBack, this.unitsSlot,
      this.worldRootFront,
    );
    for (const name of LAYER_ORDER) {
      const c = new Container();
      c.label = name;
      this._layers.set(name, c);
      if (WORLD_BACK_LAYERS.includes(name)) this.worldRootBack.addChild(c);
      else if (WORLD_UNITS_BACK_LAYERS.includes(name)) this.worldRootUnitsBack.addChild(c);
      else if (WORLD_FRONT_LAYERS.includes(name)) this.worldRootFront.addChild(c);
      else this.app.stage.addChild(c);
    }
  }

  /**
   * Debug FPS readout, pinned to the HUD layer at the top-left.
   * @private
   */
  _buildFpsText() {
    this._fpsText = new Text({ text: 'FPS: --', style: FPS_STYLE });
    this._fpsText.position.set(FPS_MARGIN, FPS_MARGIN);
    this.layer('HUD').addChild(this._fpsText);
  }

  /**
   * Update the debug FPS readout.
   * @param {number} n
   * @returns {void}
   */
  setFps(n) {
    if (this._fpsText) this._fpsText.text = `FPS: ${n}`;
  }

  /**
   * Show / hide the debug FPS readout (the `fpsCounter` setting). Builds it
   * lazily the first time it is turned on.
   * @param {boolean} on @returns {void}
   */
  setFpsVisible(on) {
    if (on && !this._fpsText) this._buildFpsText();
    if (this._fpsText) this._fpsText.visible = Boolean(on);
  }

  /**
   * Set the devicePixelRatio ceiling (graphicsQuality preset) and re-apply it.
   * @param {number} cap @returns {void}
   */
  setDprCap(cap) {
    const n = Number(cap);
    if (!Number.isFinite(n) || n === this._dprCap) return;
    this._dprCap = n;
    this.resize();
  }

  /**
   * Re-sync the canvas to the window and the camera viewport, and re-pin
   * screen-space UI. One atomic `renderer.resize(w, h, resolution)` — the
   * Pixi-v8 way — rather than mutating `renderer.resolution` then calling
   * `app.resize()` separately (that two-step could leave autoDensity's canvas
   * CSS box sized against a transient state — the "tall strip" bug).
   * @returns {void}
   */
  resize() {
    if (!this.app?.renderer) return;
    this.app.renderer.resize(window.innerWidth, window.innerHeight, pickResolution(this._dprCap));
    if (this._camera) this._camera.setViewport(this.app.screen.width, this.app.screen.height);
    if (this._fpsText) this._fpsText.position.set(FPS_MARGIN, FPS_MARGIN);
  }

  /**
   * Fold the camera transform (centre + zoom + shake offset) into worldRoot.
   * Screen layers are untouched, so the HUD never shakes.
   * @param {number} _alpha interpolation factor (reserved for entity lerp)
   * @returns {void}
   */
  render(_alpha) {
    const cam = this._camera;
    const halfW = this.app.screen.width * HALF;
    const halfH = this.app.screen.height * HALF;
    const x = -cam.x * cam.zoom + halfW + cam.offsetX;
    const y = -cam.y * cam.zoom + halfH + cam.offsetY;
    for (const root of [this.worldRootBack, this.worldRootUnitsBack, this.worldRootFront]) {
      root.scale.set(cam.zoom);
      root.position.set(x, y);
    }
    this.app.render();
  }

  /**
   * Pixi stage, for later systems that add display objects.
   * @returns {Container}
   */
  get stage() {
    return this.app.stage;
  }
}

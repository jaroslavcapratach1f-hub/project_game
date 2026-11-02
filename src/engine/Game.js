/**
 * Game — master object. Owns the shared event bus and the four engine pieces
 * (loop, renderer, camera, input), the SettingsStore, and the one always-on
 * WorldScene. There is NO screen-swap state machine: the game is a single
 * persistent world map. `state` is just a boot lifecycle — BOOT -> LOADING ->
 * RUNNING. Navigation is pan + pinch-zoom on the world map; the base is a place
 * on it (BaseSite), not a mode.
 *
 * FORWARD: PAUSED overlay + settings overlay (Slice 5); combat on the map
 * (Slice 4) revives the entity / AI / Fury stack as permanent world-map systems.
 */
import { EventEmitter } from '../utils/EventEmitter.js';
import { GameLoop } from './GameLoop.js';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { InputManager } from './InputManager.js';
import { SettingsStore } from '../systems/SettingsStore.js';
import { setHapticsEnabled } from '../systems/haptics.js';
import { GRAPHICS_PRESETS } from '../config/SettingsConfig.js';
import { WorldScene } from '../worldmap/WorldScene.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { Base3DLayer } from './Base3DLayer.js';
import { Unit3DLayer } from './Unit3DLayer.js';
import { EVENTS } from './GameEvents.js';
import { gltfLoadProgress } from './GltfCache.js';

const LOAD_POLL_MS = 100; // how often _load() re-checks real GLB progress
const LOAD_MAX_WAIT_MS = 30000; // safety cap — one stuck request can't strand the player here forever

/** @enum {string} boot lifecycle only — not a screen router */
export const GAME_STATES = { BOOT: 'BOOT', LOADING: 'LOADING', RUNNING: 'RUNNING' };

export class Game {
  constructor() {
    /** @type {EventEmitter} */ this.events = new EventEmitter();
    /** @type {GameLoop} */ this.loop = new GameLoop(this.events);
    /** @type {Renderer} */ this.renderer = new Renderer();
    /** @type {Camera} */ this.camera = new Camera();
    /** @type {InputManager} */ this.input = new InputManager(this.events);
    /** @type {string} */ this.state = GAME_STATES.BOOT;
    /** @type {?SettingsStore} */ this.settings = null;
    /** @private @type {?WorldScene} */ this._world = null;
    /** @private @type {?LoadingScreen} */ this._loading = null;
    /** @type {Base3DLayer} live 3D buildings, composited into the PixiJS scene graph */
    this.base3D = new Base3DLayer(this.camera, this.renderer);
    /** @type {Unit3DLayer} live 3D units (S55), a second/separate compositing slot */
    this.unit3D = new Unit3DLayer(this.camera, this.renderer);
    /** @private */ this._fps = 0;
  }

  /**
   * BOOT: build the renderer, the settings store, and the world map (behind the
   * loading screen), wire everything, start the loop, run the LOADING stage. The
   * game holds in LOADING until LOADING_DISMISSED ("TAP TO BEGIN") reveals the map.
   * @returns {Promise<void>}
   */
  async init() {
    await this.renderer.init(this.camera);
    this.base3D.enable();
    this.base3D.setVisible(false); // hidden until RUNNING — never shows over the loading screen
    this.unit3D.enable();
    this.unit3D.setVisible(false);
    this.input.attach(this.renderer.app.canvas);
    this._wireInput();
    this.settings = new SettingsStore(this.events);
    // S58: constructed + enabled (kicking off its own background-photo
    // fetch) BEFORE WorldScene, so that fetch is queued ahead of
    // WorldScene.enable()'s own flood of multi-MB building/unit GLB
    // downloads — a real, measured bug where the two ~90KB loading-screen
    // images landed several seconds late, queued behind ~20 GLB requests
    // on a connection-limited network. index.html's own
    // <link rel="preload" fetchpriority="high"> is the PRIMARY fix (it
    // starts fetching before any JS has even run); this ordering is the
    // JS-side backstop for wherever that request actually gets reused.
    this._loading = new LoadingScreen(this.renderer, this.events);
    this._loading.enable();
    this.renderer.layer('OVERLAY').addChild(this._loading.view);
    this._world = new WorldScene(this.renderer, this.camera, this.events, this.base3D, this.unit3D);
    this._world.enable(); // warm the map up while the loader is on top
    this._wireEvents();
    this.loop.addSystem(this._world);
    this.loop.addSystem(this);
    this.changeState(GAME_STATES.LOADING);
    this.loop.start();
    // The loading screen stays hidden (never shown with a flat-colour
    // stand-in) until its real background photo has actually loaded — a
    // visible pop-in a beat later read as a real bug on a real phone's
    // slower network. compileScene()'s shader/texture warmup (LOADING-state
    // ticks, see update() below) still runs during this wait.
    await this._loading.waitForBackground();
    this._loading.show();
    await this._load();
  }

  /** @private lifecycle + settings subscriptions (input wiring is separate) */
  _wireEvents() {
    const bus = this.events;
    bus.on(EVENTS.LOOP_FPS, (fps) => { this._fps = fps; });
    bus.on(EVENTS.LOADING_DISMISSED, () => this._enterWorld());
    bus.on(EVENTS.SETTINGS_CHANGED, (p) => this._applySetting(p.key, p.value));
    this.settings.broadcast(); // push current values to the engine consumers just wired
  }

  /** @private "TAP TO BEGIN" — go live on the world map, drop the loader */
  _enterWorld() {
    if (this.state === GAME_STATES.RUNNING) return;
    this.changeState(GAME_STATES.RUNNING);
    this.base3D.setVisible(true);
    this.unit3D.setVisible(true);
    this._loading.disable();
    this._loading = null;
  }

  /** @private route a changed setting to its engine consumer @param {string} key @param {*} value */
  _applySetting(key, value) {
    if (key === 'fpsCounter') this.renderer.setFpsVisible(value);
    else if (key === 'touchSensitivity') this.input.setSensitivity(value);
    else if (key === 'graphicsQuality') this.renderer.setDprCap(GRAPHICS_PRESETS[value].dprCap);
    else if (key === 'vibration') setHapticsEnabled(value);
    // musicVolume / sfxVolume: FORWARD — persisted by SettingsStore, no audio system yet
  }

  /**
   * @private LOADING stage — real asset-loading progress (S58, the user's
   * own explicit call). WorldScene.enable() already ran synchronously
   * earlier in init() — every building/unit/wall/tower GLB fetch it needs
   * is already registered in GltfCache by the time this runs — so this
   * just polls that real resolved/requested count until it reaches 1,
   * emitting LOADING_PROGRESS as it climbs. The bar (and "TAP TO BEGIN")
   * now reflect the game's actual 3D content actually being ready, not a
   * fixed handful of animation frames (the old placeholder). Capped at
   * LOAD_MAX_WAIT_MS so one stuck request can't strand the player here
   * forever — GltfCache counts a failed fetch as settled too, so this is
   * really just a backstop for a request that never even errors.
   * @returns {Promise<void>}
   */
  async _load() {
    const start = performance.now();
    let frac = gltfLoadProgress();
    this.events.emit(EVENTS.LOADING_PROGRESS, { frac });
    while (frac < 1 && performance.now() - start < LOAD_MAX_WAIT_MS) {
      await new Promise((resolve) => { setTimeout(resolve, LOAD_POLL_MS); });
      frac = gltfLoadProgress();
      this.events.emit(EVENTS.LOADING_PROGRESS, { frac });
    }
    if (frac < 1) this.events.emit(EVENTS.LOADING_PROGRESS, { frac: 1 });
  }

  /**
   * @private forward pan + pinch-zoom to the camera while the map is live;
   * a drag that grabbed a squad is an order-drag, and a drag that grabbed a
   * base building is a relocate-drag (S54) — neither is a camera-pan.
   *
   * `INPUT_PAN` also fires for the first few px of EVERY single-finger
   * gesture, before it "arms" into `INPUT_DRAG_*` (`GestureEmitter`'s own
   * doc) — so `INPUT_PAN`/`INPUT_ZOOM` (pinch) need the SAME open-UI gate
   * `INPUT_DRAG_MOVE` already had, or a gesture that starts on an open
   * menu/screen still pans/zooms the map underneath for that first instant,
   * every time (the player's own report: open menus could be "clicked and
   * dragged through"). `isUiOpen()` is checked for all three — it's
   * position-independent (`INPUT_PAN` carries no x,y at all to hit-test
   * against) and covers every HUD overlay + building menu/screen, not just
   * the narrower per-screen `isDragging*` scroll-ownership checks below.
   */
  _wireInput() {
    const bus = this.events;
    const blocked = () => !this._running() || this._world?.isUiOpen();
    bus.on(EVENTS.INPUT_PAN, (p) => { if (!blocked()) this.camera.panBy(p.dx, p.dy); });
    bus.on(EVENTS.INPUT_ZOOM, (p) => { if (!blocked()) this.camera.nudgeZoom(p.delta, p.focalX, p.focalY); });
    bus.on(EVENTS.INPUT_DRAG_MOVE, (p) => {
      if (!blocked() && !this._world?.isDraggingUnit() && !this._world?.isDraggingBuilding() && !this._world?.isDraggingHud() && !this._world?.isDraggingBuildingScreen()) this.camera.panBy(p.dx, p.dy);
    });
  }

  /** @private @returns {boolean} is the world map live and interactive */
  _running() { return this.state === GAME_STATES.RUNNING; }

  /**
   * Advance the boot lifecycle; logs + emits STATE_CHANGED.
   * @param {string} next one of GAME_STATES @returns {void}
   */
  changeState(next) {
    if (next === this.state) return;
    const prev = this.state;
    this.state = next;
    console.log(`[Game] ${prev} -> ${next}`);
    this.events.emit(EVENTS.STATE_CHANGED, { prev, next });
  }

  /**
   * Per-sim-step update: the camera integrates here; the loading-screen tip
   * timer runs while it is up (and spends the S58 shader pre-compile cost
   * behind it — see Base3DLayer.compileScene's own doc — every tick, since
   * neighbour compounds are still loading in on their own schedule and
   * repeat calls are cheap); the WorldScene ticks as its own loop system.
   * @param {number} dt seconds @returns {void}
   */
  update(dt) {
    if (this.state === GAME_STATES.LOADING && this._loading) {
      this._loading.update(dt);
      this.base3D.compileScene();
      this.unit3D.compileScene();
    }
    this.camera.update(dt);
  }

  /**
   * `base3D`/`unit3D` MUST render before `renderer` does: they draw into
   * their own off-screen canvases that `renderer`'s own Pixi frame then
   * composites as textures, so rendering Pixi first would always paint
   * LAST frame's 3D image — a one-frame lag invisible at rest but a
   * visible drift relative to every (current-frame) 2D layer while the
   * camera is actively panning.
   * @param {number} alpha accumulator / stepMs @returns {void}
   */
  render(alpha) {
    this.base3D.update();
    this.unit3D.update();
    this.renderer.render(alpha);
    this.renderer.setFps(this._fps);
  }

  /** Viewport resized. @returns {void} */
  onResize() {
    this.renderer.resize();
    this.base3D.resize();
    this.unit3D.resize();
    this.events.emit(EVENTS.RESIZE);
  }

  /**
   * Tab visibility changed: pause the loop when hidden, resume when shown.
   * @param {boolean} hidden @returns {void}
   */
  onVisibilityChange(hidden) {
    if (hidden) this.loop.pause();
    else this.loop.resume();
    this.events.emit(EVENTS.VISIBILITY, { hidden });
  }

  /** Start the game loop. @returns {void} */
  start() {
    this.loop.start();
  }
}

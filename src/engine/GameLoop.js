/**
 * GameLoop — fixed-timestep simulation with a variable-rate interpolated
 * render. Simulation advances in whole steps of stepMs (1000 / logicHz);
 * render is called once per animation frame with alpha = leftover / stepMs
 * so systems can interpolate between the last two sim states.
 */
import { LOOP, RENDER } from '../config/GameConfig.js';
import { EVENTS } from './GameEvents.js';

const MS_PER_SECOND = 1000;

export class GameLoop {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} emitter shared bus
   */
  constructor(emitter) {
    /** @private */ this._emitter = emitter;
    /** @private */ this._stepMs = MS_PER_SECOND / LOOP.logicHz;
    /** @private @type {{update?:Function, render?:Function}[]} */ this._systems = [];
    /** @private */ this._running = false;
    /** @private full stop while the tab is hidden (Game.onVisibilityChange) */
    this._paused = false;
    /** @private */ this._rafId = 0;
    /** @private */ this._lastTime = 0;
    /** @private */ this._accumulator = 0;
    /** @private @type {number[]} */ this._frameSamples = [];
    /** @private */ this._sampleCursor = 0;
    /** @private */ this._fps = LOOP.renderFps;
    /** @private */ this._fpsEmitAcc = 0;
    /** @private */ this._tick = this._tick.bind(this);
  }

  /** @returns {number} rolling average frames-per-second */
  get fps() {
    return this._fps;
  }

  /** @returns {boolean} true while started and not paused */
  get isRunning() {
    return this._running && !this._paused;
  }

  /**
   * Register a system. It may expose update(dtSeconds) and/or render(alpha).
   * @param {{update?:Function, render?:Function}} system
   * @returns {void}
   */
  addSystem(system) {
    if (!this._systems.includes(system)) this._systems.push(system);
  }

  /**
   * Unregister a previously added system.
   * @param {{update?:Function, render?:Function}} system
   * @returns {void}
   */
  removeSystem(system) {
    const i = this._systems.indexOf(system);
    if (i !== -1) this._systems.splice(i, 1);
  }

  /** Begin the loop. @returns {void} */
  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._rafId = requestAnimationFrame(this._tick);
    console.log(`[GameLoop] running (sim ${LOOP.logicHz} Hz / render target ${LOOP.renderFps} fps)`);
  }

  /** Stop the loop entirely. @returns {void} */
  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = 0;
  }

  /** Suspend updates/renders without tearing down. @returns {void} */
  pause() {
    this._paused = true;
  }

  /** Resume after pause(); re-baselines the clock to avoid a delta spike. @returns {void} */
  resume() {
    if (!this._paused) return;
    this._paused = false;
    this._lastTime = performance.now();
    this._accumulator = 0;
  }

  /**
   * requestAnimationFrame callback: clamp delta, drain the sim accumulator,
   * render once with the interpolation alpha, update FPS bookkeeping.
   * @private
   * @param {number} now high-res timestamp from rAF
   */
  _tick(now) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(this._tick);
    if (this._paused) return;

    let delta = now - this._lastTime;
    this._lastTime = now;
    if (delta > RENDER.maxFrameMs) delta = RENDER.maxFrameMs;

    this._accumulator += delta;
    const dtSeconds = this._stepMs / MS_PER_SECOND;
    while (this._accumulator >= this._stepMs) {
      for (let i = 0; i < this._systems.length; i++) {
        if (this._systems[i].update) this._systems[i].update(dtSeconds);
      }
      this._emitter.emit(EVENTS.LOOP_TICK, dtSeconds);
      this._accumulator -= this._stepMs;
    }

    const alpha = this._accumulator / this._stepMs;
    for (let i = 0; i < this._systems.length; i++) {
      if (this._systems[i].render) this._systems[i].render(alpha);
    }
    this._recordFrame(delta);
  }

  /**
   * Push a frame delta into the ring buffer, recompute the rolling average,
   * and emit EVENTS.LOOP_FPS about once per second.
   * @private
   * @param {number} delta frame time in ms
   */
  _recordFrame(delta) {
    if (delta > 0) {
      this._frameSamples[this._sampleCursor] = MS_PER_SECOND / delta;
      this._sampleCursor = (this._sampleCursor + 1) % RENDER.fpsSampleFrames;
    }
    let sum = 0;
    for (let i = 0; i < this._frameSamples.length; i++) sum += this._frameSamples[i];
    this._fps = Math.round(sum / this._frameSamples.length);

    this._fpsEmitAcc += delta;
    if (this._fpsEmitAcc >= RENDER.fpsEmitIntervalMs) {
      this._fpsEmitAcc = 0;
      this._emitter.emit(EVENTS.LOOP_FPS, this._fps);
    }
  }
}

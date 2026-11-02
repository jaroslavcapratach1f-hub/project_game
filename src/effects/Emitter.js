/**
 * Emitter — a continuous particle source (smoke plumes). ParticleSystem owns a
 * bounded list of these and calls `step(dt, spawn)` each frame; `spawn` is
 * ParticleSystem's pooled-particle factory. Alloc-free per step: origin /
 * velocity are written into module scratch, not new objects.
 */
import { randomRange } from '../utils/MathUtils.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;
const TWO_PI = Math.PI * 2;
const _origin = { x: 0, y: 0 };
const _vel = { x: 0, y: 0 };

export class Emitter {
  /**
   * @param {object} cfg { x, y, shape:'point'|'circle'|'cone', shapeRadiusPx?,
   *   coneAngleRad?, coneSpreadRad?, ratePerSec?, burstCount?, particleCfg,
   *   durationMs, windX?, windY? }
   */
  constructor(cfg) {
    /** @private */ this._cfg = cfg;
    /** @private */ this._elapsedMs = 0;
    /** @private fractional particle accumulator */ this._acc = 0;
    /** @private */ this._firstStep = true;
    /** @private */ this._done = false;
  }

  /** @returns {boolean} finished — ParticleSystem drops it next frame */
  get done() { return this._done; }

  /**
   * @param {number} dtSeconds
   * @param {(cfg:object,x:number,y:number,vx:number,vy:number)=>void} spawn
   * @returns {void}
   */
  step(dtSeconds, spawn) {
    if (this._done) return;
    const cfg = this._cfg;
    if (this._firstStep) {
      this._firstStep = false;
      for (let i = 0; i < (cfg.burstCount || 0); i++) this._emitOne(spawn);
    }
    this._acc += (cfg.ratePerSec || 0) * dtSeconds;
    while (this._acc >= 1) { this._acc -= 1; this._emitOne(spawn); }
    this._elapsedMs += dtSeconds * MS_PER_SECOND;
    if (this._elapsedMs >= cfg.durationMs) this._done = true;
  }

  /** @private sample one origin + velocity and hand it to spawn */
  _emitOne(spawn) {
    this._sampleOrigin(_origin);
    this._sampleVelocity(_vel);
    spawn(this._cfg.particleCfg, _origin.x, _origin.y, _vel.x, _vel.y);
  }

  /** @private @param {{x:number,y:number}} out */
  _sampleOrigin(out) {
    const cfg = this._cfg;
    if (cfg.shape === 'circle') {
      const a = randomRange(0, TWO_PI);
      const r = randomRange(0, cfg.shapeRadiusPx || 0);
      out.x = cfg.x + Math.cos(a) * r;
      out.y = cfg.y + Math.sin(a) * r;
      return;
    }
    out.x = cfg.x;
    out.y = cfg.y;
  }

  /** @private @param {{x:number,y:number}} out */
  _sampleVelocity(out) {
    const cfg = this._cfg;
    const sp = cfg.particleCfg.speedPx;
    const speed = sp ? randomRange(sp[0], sp[1]) : 0;
    const ang = cfg.shape === 'cone'
      ? cfg.coneAngleRad + randomRange(-cfg.coneSpreadRad * HALF, cfg.coneSpreadRad * HALF)
      : randomRange(0, TWO_PI);
    out.x = Math.cos(ang) * speed + (cfg.windX || 0);
    out.y = Math.sin(ang) * speed + (cfg.windY || 0);
  }
}

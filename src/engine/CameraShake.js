/**
 * CameraShake — additive screen-shake offset generator owned by the Camera.
 * Sources are pre-allocated (CAMERA.maxSources) and reused, so triggering a
 * shake never allocates. Each source decays on its configured curve; the
 * summed offset is clamped to CAMERA.shake.maxOffsetPx.
 */
import { CAMERA } from '../config/GameConfig.js';

const MS_PER_SECOND = 1000;
const TWO_PI = Math.PI * 2;
const MAX_OFFSET = CAMERA.shake.maxOffsetPx;

/** @returns {object} a blank, inactive shake-source slot */
function makeSource() {
  return {
    active: false, intensity: 0, elapsedMs: 0, durationMs: 1, freqHz: 0,
    expo: false, directional: false, dirX: 0, dirY: 0, phaseX: 0, phaseY: 0,
  };
}

export class CameraShake {
  constructor() {
    /** @private @type {object[]} */
    this._sources = [];
    for (let i = 0; i < CAMERA.maxSources; i++) this._sources.push(makeSource());
  }

  /**
   * Start a shake. Reuses a free source slot; a full pool drops the request.
   * @param {number} intensity 0..1+ scale on the offset amplitude
   * @param {number} durationMs lifetime; <=0 uses the type's configured decayMs
   * @param {string} type key into CAMERA.shake ('impact' | 'rumble' | 'recoil')
   * @param {number} [dirX=0] unit-vector x for directional types
   * @param {number} [dirY=0] unit-vector y for directional types
   * @returns {void}
   */
  trigger(intensity, durationMs, type, dirX = 0, dirY = 0) {
    const cfg = CAMERA.shake[type];
    if (!cfg) return;
    let s = null;
    for (let i = 0; i < this._sources.length; i++) {
      if (!this._sources[i].active) { s = this._sources[i]; break; }
    }
    if (!s) return;
    s.active = true;
    s.intensity = intensity;
    s.elapsedMs = 0;
    s.durationMs = durationMs > 0 ? durationMs : cfg.decayMs;
    s.freqHz = cfg.frequencyHz;
    s.expo = cfg.curve === 'expo';
    s.directional = cfg.directional === true;
    s.dirX = dirX;
    s.dirY = dirY;
    s.phaseX = Math.random() * TWO_PI;
    s.phaseY = Math.random() * TWO_PI;
  }

  /**
   * Advance every active source and write the summed, clamped offset to `out`.
   * @param {number} dtSeconds elapsed time since the last update
   * @param {{x:number,y:number}} out reused offset target
   * @returns {void}
   */
  update(dtSeconds, out) {
    out.x = 0;
    out.y = 0;
    const ms = dtSeconds * MS_PER_SECOND;
    for (let i = 0; i < this._sources.length; i++) {
      this._accumulate(this._sources[i], ms, out);
    }
    const mag = Math.sqrt(out.x * out.x + out.y * out.y);
    if (mag > MAX_OFFSET) {
      const f = MAX_OFFSET / mag;
      out.x *= f;
      out.y *= f;
    }
  }

  /**
   * Step one source and add its contribution to `out`.
   * @private
   * @param {object} s source slot
   * @param {number} ms milliseconds elapsed this frame
   * @param {{x:number,y:number}} out
   */
  _accumulate(s, ms, out) {
    if (!s.active) return;
    s.elapsedMs += ms;
    if (s.elapsedMs >= s.durationMs) { s.active = false; return; }
    const k = s.elapsedMs / s.durationMs;
    const env = s.expo ? (1 - k) * (1 - k) : 1 - k;
    const w = TWO_PI * s.freqHz * (s.elapsedMs / MS_PER_SECOND);
    const amp = MAX_OFFSET * s.intensity * env;
    if (s.directional) {
      const o = amp * Math.sin(w);
      out.x += s.dirX * o;
      out.y += s.dirY * o;
    } else {
      out.x += amp * Math.sin(w + s.phaseX);
      out.y += amp * Math.cos(w + s.phaseY);
    }
  }

  /** @returns {number} count of currently running sources */
  getActiveCount() {
    let n = 0;
    for (let i = 0; i < this._sources.length; i++) if (this._sources[i].active) n++;
    return n;
  }
}

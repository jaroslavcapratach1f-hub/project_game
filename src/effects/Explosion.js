/**
 * Explosion — a data-driven 5-stage blast (flash · fireball · shockwave ·
 * debris · smoke) plus an optional OVERLAY screen-flash, a scorch decal, and a
 * camera shake. `fx` is the EffectsSystem: { particles, camera, battlefield,
 * screenFlash(ms) }. Called from event handlers / keybinds, never per-frame, so
 * building the small stage-cfg objects here is fine.
 */
import { EXPLOSION } from '../config/EffectsConfig.js';

const FULL_ALPHA = 1;

/**
 * @param {{particles:object,camera:object,battlefield:?object,screenFlash:Function}} fx
 * @param {number} x @param {number} y
 * @param {string} presetKey 'small' | 'medium' | 'large' | 'massive'
 * @param {boolean} [withShake=true] false to suppress the camera shake
 * @returns {void}
 */
export function spawnExplosion(fx, x, y, presetKey, withShake = true) {
  const size = EXPLOSION.presets[presetKey];
  flashStage(fx, x, y, size);
  if (size >= EXPLOSION.screenFlash.minSize) fx.screenFlash(EXPLOSION.screenFlash.ms);
  fireballStage(fx, x, y, size);
  shockwaveStage(fx, x, y, size);
  debrisStage(fx, x, y, size);
  dirtStage(fx, x, y, size);
  if (size >= EXPLOSION.smoke.minSize) smokeStage(fx, x, y);
  if (fx.battlefield) {
    fx.battlefield.addDecal(EXPLOSION.decal.type, x, y, EXPLOSION.decal.pxPerSize * size);
  }
  if (withShake) {
    const s = EXPLOSION.shake[presetKey];
    fx.camera.shake(s.i, 0, s.type);
  }
}

/** @private one bright disc that snaps out and fades */
function flashStage(fx, x, y, size) {
  const f = EXPLOSION.flash;
  fx.particles.emitBurst({
    drawMode: 'disc', blend: f.blend, ms: f.ms,
    radiusStartPx: f.radiusPx * size, radiusEndPx: 1,
    alphaStart: FULL_ALPHA, alphaEnd: 0, colorStart: f.color, colorEnd: f.color,
  }, x, y, 1, f.layer);
}

/** @private additive sparks that cool yellow → red */
function fireballStage(fx, x, y, size) {
  const f = EXPLOSION.fireball;
  fx.particles.emitBurst({
    drawMode: 'disc', blend: f.blend, ms: f.ms,
    radiusStartPx: f.radiusStartPx, radiusEndPx: f.radiusEndPx,
    colorStart: f.colorStart, colorEnd: f.colorEnd,
    alphaStart: FULL_ALPHA, alphaEnd: 0, speedPx: f.speedPx,
  }, x, y, Math.round(f.countPerSize * size), f.layer);
}

/** @private one easeOutCubic ring, spawned with the flash */
function shockwaveStage(fx, x, y, size) {
  const s = EXPLOSION.shockwave;
  fx.particles.emitBurst({
    drawMode: 'ring', blend: s.blend, ms: s.ms, ease: s.ease,
    ringWidthPx: s.ringWidthPx, radiusStartPx: s.radiusStartPx,
    radiusEndPx: s.radiusPxPerSize * size,
    alphaStart: s.alphaStart, alphaEnd: 0, colorStart: s.color, colorEnd: s.color,
  }, x, y, 1, s.layer);
}

/** @private dark chunks thrown out and pulled down by gravity */
function debrisStage(fx, x, y, size) {
  const d = EXPLOSION.debris;
  fx.particles.emitBurst({
    drawMode: 'disc', blend: d.blend, ms: d.ms,
    radiusStartPx: d.radiusPx, radiusEndPx: d.radiusPx,
    colorStart: d.color, colorEnd: d.color, alphaStart: FULL_ALPHA, alphaEnd: 0,
    speedPx: d.speedPx, gravityY: d.gravityPxPerS2,
  }, x, y, Math.round(d.countPerSize * size), d.layer);
}

/** @private low tan dirt kicked outward and pulled back down */
function dirtStage(fx, x, y, size) {
  const d = EXPLOSION.dirt;
  fx.particles.emitBurst({
    drawMode: 'disc', blend: d.blend, ms: d.ms,
    radiusStartPx: d.radiusStartPx, radiusEndPx: d.radiusEndPx,
    colorStart: d.colorStart, colorEnd: d.colorEnd,
    alphaStart: FULL_ALPHA, alphaEnd: 0, speedPx: d.speedPx, gravityY: d.gravityY,
  }, x, y, Math.round(d.countPerSize * size), d.layer);
}

/** @private a rising, drifting smoke plume for ~durationMs */
function smokeStage(fx, x, y) {
  const s = EXPLOSION.smoke;
  fx.particles.addEmitter({
    x, y, shape: 'point', burstCount: 0,
    ratePerSec: s.ratePerSec, durationMs: s.durationMs,
    particleCfg: {
      drawMode: 'disc', blend: s.blend, layer: s.layer, ms: s.ms,
      radiusStartPx: s.radiusStartPx, radiusEndPx: s.radiusEndPx,
      colorStart: s.colors[0], colorEnd: s.colors[1],
      alphaStart: s.alphaStart, alphaEnd: 0,
      windX: s.windPxPerSec, gravityY: s.risePxPerSec,
    },
  });
}

/** @param {object} fx @param {number} x @param {number} y @param {boolean} [ws] */
export const explosionSmall = (fx, x, y, ws) => spawnExplosion(fx, x, y, 'small', ws);
/** @param {object} fx @param {number} x @param {number} y @param {boolean} [ws] */
export const explosionMedium = (fx, x, y, ws) => spawnExplosion(fx, x, y, 'medium', ws);
/** @param {object} fx @param {number} x @param {number} y @param {boolean} [ws] */
export const explosionLarge = (fx, x, y, ws) => spawnExplosion(fx, x, y, 'large', ws);
/** @param {object} fx @param {number} x @param {number} y @param {boolean} [ws] */
export const explosionMassive = (fx, x, y, ws) => spawnExplosion(fx, x, y, 'massive', ws);

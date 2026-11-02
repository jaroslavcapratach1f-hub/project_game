/**
 * particleStep — pure integration + draw for one Particle, plus the init that
 * copies a stage cfg onto a pooled instance. No allocation: `stepParticle` and
 * `drawParticle` run every frame for up to PARTICLES.poolSize particles.
 */
import { lerp, easeOutCubic } from '../utils/MathUtils.js';

const MS_PER_SECOND = 1000;
const DEFAULT_MS = 300;
const WHITE = 0xffffff;
const BYTE = 0xff;
const R_SHIFT = 16;
const G_SHIFT = 8;

/** @type {Record<string,(t:number)=>number>} */
const EASE = { linear: (t) => t, easeOutCubic };

/**
 * Advance one particle by dt.
 * @param {import('./Particle.js').Particle} p @param {number} dt seconds
 * @returns {boolean} true while the particle is still alive
 */
export function stepParticle(p, dt) {
  p.vx += (p.ax + p.windX) * dt;
  p.vy += (p.ay + p.gravityY) * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
  if (p.life <= 0) return false;
  const raw = 1 - p.life / p.maxLife;
  const t = (EASE[p.ease] || EASE.linear)(raw);
  p.radius = lerp(p.radiusStart, p.radiusEnd, t);
  p.alpha = lerp(p.alphaStart, p.alphaEnd, t);
  p.color = lerpColor(p.colorStart, p.colorEnd, t);
  p.rotation += p.rotationSpeed * dt;
  return true;
}

/**
 * Sync a particle's Graphics to its current state. A ring (rare — 1 per blast)
 * is cleared + restroked; a disc is a pre-primed unit circle that we only
 * scale + tint + fade each frame (no clear/redraw for the ~500× hot path).
 * @param {import('pixi.js').Graphics} g @param {import('./Particle.js').Particle} p
 * @returns {void}
 */
export function drawParticle(g, p) {
  if (p.drawMode === 'ring') {
    g.clear();
    g.circle(0, 0, p.radius).stroke({ width: p.ringWidthPx, color: p.color, alpha: p.alpha });
  } else {
    g.scale.set(p.radius);
    g.tint = p.color;
    g.alpha = p.alpha;
  }
  g.position.set(p.x, p.y);
  g.rotation = p.rotation;
  g.blendMode = p.blend === 'add' ? 'add' : 'normal';
}

/**
 * Copy a stage cfg onto a pooled particle and arm it.
 * @param {import('./Particle.js').Particle} p
 * @param {object} cfg stage cfg (EXPLOSION.* or a smoke particleCfg)
 * @param {{x:number,y:number,vx:number,vy:number}} pos reused spawn scratch
 * @returns {void}
 */
export function initParticle(p, cfg, pos) {
  p.active = true;
  p.x = pos.x; p.y = pos.y;
  p.vx = pos.vx; p.vy = pos.vy;
  p.ax = cfg.ax || 0; p.ay = cfg.ay || 0;
  p.windX = cfg.windX || 0;
  p.gravityY = cfg.gravityY || 0;
  const life = (cfg.ms || DEFAULT_MS) / MS_PER_SECOND;
  p.life = life; p.maxLife = life;
  p.rotation = 0;
  p.rotationSpeed = cfg.rotationSpeed || 0;
  initParticleVisual(p, cfg);
}

/** @private radius / alpha / colour / draw-mode ramps @param {object} p @param {object} cfg */
function initParticleVisual(p, cfg) {
  p.radiusStart = cfg.radiusStartPx ?? 1;
  p.radiusEnd = cfg.radiusEndPx ?? p.radiusStart;
  p.radius = p.radiusStart;
  p.alphaStart = cfg.alphaStart ?? 1;
  p.alphaEnd = cfg.alphaEnd ?? 0;
  p.alpha = p.alphaStart;
  p.colorStart = cfg.colorStart ?? WHITE;
  p.colorEnd = cfg.colorEnd ?? p.colorStart;
  p.color = p.colorStart;
  p.drawMode = cfg.drawMode || 'disc';
  p.ringWidthPx = cfg.ringWidthPx || 1;
  p.blend = cfg.blend === 'add' ? 'add' : 'normal';
  p.ease = cfg.ease || null;
}

/**
 * Channel-wise RGB interpolation of two 0xRRGGBB colours.
 * @param {number} a @param {number} b @param {number} t 0..1 @returns {number}
 */
function lerpColor(a, b, t) {
  const ar = (a >> R_SHIFT) & BYTE;
  const ag = (a >> G_SHIFT) & BYTE;
  const ab = a & BYTE;
  const r = (ar + (((b >> R_SHIFT) & BYTE) - ar) * t) | 0;
  const g = (ag + (((b >> G_SHIFT) & BYTE) - ag) * t) | 0;
  const bl = (ab + ((b & BYTE) - ab) * t) | 0;
  return (r << R_SHIFT) | (g << G_SHIFT) | bl;
}

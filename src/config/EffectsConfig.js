/**
 * EffectsConfig — tuneables for the placeholder particle FX layer (src/effects/).
 * The particle cap matches LIMITS.maxActiveParticles (CLAUDE.md PERFORMANCE).
 * A real sprite-atlas particle pipeline is Sessions 30-33; everything here draws
 * with pooled Graphics circles / rings.
 *
 * Palette (desaturated military, CLAUDE.md VISUAL STYLE):
 *   fire   0xffd54a / 0xff6b35 / 0xff4500
 *   smoke  0x6b6b6b / 0x4a4a4a
 *   debris 0x3a3128
 *
 * DRAFT: every value is a proposal. REVIEW.
 */

export const PARTICLES = {
  poolSize: 500, // == LIMITS.maxActiveParticles (CLAUDE.md hard cap)
  maxEmitters: 24, // continuous emitters (smoke plumes) alive at once
  onFull: 'skip', // 'skip' | 'evictOldest' when the pool is exhausted
};

/**
 * A data-driven 5-stage explosion. `spawnExplosion` takes a preset KEY;
 * `presets[key]` is the `size` scalar that particle counts / radii scale off.
 * `shake[key]` is applied verbatim. Stage cfgs are copied field-by-field onto a
 * pooled Particle by ParticleSystem.
 */
export const EXPLOSION = {
  presets: { small: 0.7, medium: 1.2, large: 2.0, massive: 3.0 },
  flash: { ms: 60, color: 0xffffff, radiusPx: 26, blend: 'add', layer: 'PARTICLES_HIGH' },
  // full-screen white kick on the OVERLAY layer — massive blasts only.
  screenFlash: { minSize: 2.6, ms: 90, fromAlpha: 0.45, color: 0xffffff },
  fireball: {
    countPerSize: 18, ms: 400, blend: 'add', layer: 'PARTICLES_HIGH',
    colorStart: 0xffd54a, colorEnd: 0xff4500,
    radiusStartPx: 10, radiusEndPx: 2, speedPx: [40, 160],
  },
  shockwave: {
    ms: 220, ease: 'easeOutCubic', blend: 'add', layer: 'PARTICLES_HIGH',
    color: 0xffe0a0, alphaStart: 0.9,
    radiusStartPx: 6, radiusPxPerSize: 60, ringWidthPx: 3,
  },
  debris: {
    countPerSize: 10, ms: 800, blend: 'normal', layer: 'PARTICLES_LOW',
    color: 0x3a3128, radiusPx: 3, speedPx: [60, 200], gravityPxPerS2: 520,
  },
  // low tan dirt kicked outward and pulled back down — ground blasts on top of debris.
  dirt: {
    countPerSize: 8, ms: 500, blend: 'normal', layer: 'PARTICLES_LOW',
    colorStart: 0x6b4423, colorEnd: 0x4a3218,
    radiusStartPx: 4, radiusEndPx: 16, speedPx: [30, 100], gravityY: 240,
  },
  smoke: {
    minSize: 1.0, durationMs: 2000, ratePerSec: 12,
    ms: 1400, blend: 'normal', layer: 'PARTICLES_HIGH', alphaStart: 0.55,
    colors: [0x6b6b6b, 0x4a4a4a], radiusStartPx: 6, radiusEndPx: 22,
    risePxPerSec: -24, windPxPerSec: 8,
  },
  decal: { type: 'scorch', pxPerSize: 20 },
  // applied verbatim (no × size) — spawnExplosion(fx, x, y, presetKey) keys straight in.
  shake: {
    small: { i: 0.6, type: 'impact' }, medium: { i: 0.9, type: 'impact' },
    large: { i: 1.2, type: 'rumble' }, massive: { i: 1.6, type: 'rumble' },
  },
};

/** PROJECTILE_IMPACT `weapon` → explosion preset key (null = no explosion). */
export const IMPACT_EXPLOSION = {
  bullet: null, shell: 'small', howitzer_shell: 'large', rocket: 'medium',
};

/** ENTITY_DIED → explosion preset key. */
export const DEATH_EXPLOSION = 'medium';

/** One small kick per destruction; weapon impacts remain shake-free. */
export const DEATH_SHAKE = { intensity: 0.22, durationMs: 180, type: 'impact' };

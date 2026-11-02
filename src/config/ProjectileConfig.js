/**
 * ProjectileConfig — travelling-shot tuneables: pool sizes, collision radius,
 * impact FX, and one motion/visual archetype per weapon family, keyed off unit
 * `cls`. Placeholder shapes only; real muzzle flashes + particle trails land in
 * Sessions 11-12.
 *
 * DRAFT: every value is a proposal. Grep "REVIEW".
 * CONVENTIONS: speed in tiles/sec (× TILE_SIZE at the edge), lengths in px.
 */

export const PROJECTILE = {
  poolSize: 96, // travelling projectile bodies (Projectile + body Graphics)
  flashPoolSize: 24, // additive impact flashes on PARTICLES_HIGH
  shadowPoolSize: 16, // arc-shell ground shadows on SHADOWS
  hitRadiusPx: 14, // projectile vs entity centre
  maxLifetimeSec: 6, // safety despawn
  terrainStopsProjectile: true, // water / blocked tiles halt a shot
  // impact camera shake is EffectsSystem's job now (off PROJECTILE_IMPACT)
  impactFlash: { radiusPx: 18, ms: 120, color: 0xffd37a, blendAdd: true },
  groundShadow: { color: 0x000000, alpha: 0.28, radiusPx: 5 },

  archetypes: {
    shell: {
      speedTilesPerSec: 9.5, motion: 'straight', lenPx: 20, widPx: 4,
      color: 0xffffcc, tracerEveryN: 1, blendAdd: true, smokeTrail: true,
    },
    bullet: { speedTilesPerSec: 14.0, motion: 'straight', lenPx: 12, widPx: 2, color: 0xffff66, tracerEveryN: 3 },
    rocket: {
      speedTilesPerSec: 6.25, motion: 'wobble', lenPx: 12, widPx: 3, color: 0xff7a3c,
      tracerEveryN: 1, wobbleAmpPx: 4, wobbleHz: 6, fireTrail: true, smokeTrail: true,
    },
    howitzer_shell: {
      speedTilesPerSec: 4.7, motion: 'arc', lenPx: 9, widPx: 5, color: 0x2a2a2a,
      tracerEveryN: 1, arcApexPx: 90, groundShadow: true, shape: 'oval',
    },
  },
};

/**
 * TRAIL — the particle configs a trailing projectile emits through the shared
 * ParticleSystem (replaces the old TrailField). `fire` is a hot additive spark
 * on PARTICLES_LOW; `smoke` a slow grey puff that rises on PARTICLES_HIGH.
 */
export const TRAIL = {
  emitEveryFrames: 2,
  fire: {
    drawMode: 'disc', blend: 'add', ms: 260, layer: 'PARTICLES_LOW',
    radiusStartPx: 3, radiusEndPx: 1, alphaStart: 1, alphaEnd: 0,
    colorStart: 0xffb066, colorEnd: 0xff5a2a,
  },
  smoke: {
    drawMode: 'disc', blend: 'normal', ms: 900, layer: 'PARTICLES_HIGH',
    radiusStartPx: 3, radiusEndPx: 12, alphaStart: 0.5, alphaEnd: 0,
    colorStart: 0x8a8a8a, colorEnd: 0x4a4a4a, gravityY: -14,
  },
};

/** unit `cls` -> archetype key. Missing class falls back to 'shell'. */
export const WEAPON_ARCHETYPE_BY_CLASS = {
  infantry: 'bullet',
  lightTank: 'shell',
  mediumTank: 'shell',
  heavyTank: 'shell',
  superHeavyTank: 'shell',
  tankHunter: 'shell',
  atGun: 'shell',
  howitzer: 'howitzer_shell',
  launcher: 'rocket',
};

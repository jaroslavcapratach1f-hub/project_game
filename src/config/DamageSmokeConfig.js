/** Remaining-health thresholds; living units never receive a damage tint. */
const PARTICLE = {
  drawMode: 'disc', blend: 'normal', ms: 1800,
  colorStart: 0x4a4843, colorEnd: 0x85817a, alphaEnd: 0,
  gravityY: -26, windX: 5, speedPx: [0, 3],
};
export const DAMAGE_SMOKE = {
  layer: 'PARTICLES_HIGH', rearFraction: 0.45, heightPx: 12,
  maxTickSeconds: 0.1, reserveParticles: 120,
  stages: [
    { atFrac: 0.75, rate: 3, particle: { ...PARTICLE, radiusStartPx: 3, radiusEndPx: 11, alphaStart: 0.28 } },
    { atFrac: 0.50, rate: 7, particle: { ...PARTICLE, radiusStartPx: 4, radiusEndPx: 17, alphaStart: 0.42 } },
    { atFrac: 0.25, rate: 14, particle: { ...PARTICLE, radiusStartPx: 5, radiusEndPx: 23, alphaStart: 0.58 } },
  ],
};

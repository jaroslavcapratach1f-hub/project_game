/**
 * Noise — deterministic, seed-driven value noise for map generation. Pure and
 * allocation-free; does NOT use MathUtils' RNG (that one is Math.random-based
 * and not seedable). Named exports only.
 *
 * `valueNoise2D` and `fbm` both return a float in [0, 1].
 */

// Algorithmic constants (mulberry32 + integer hash). Not tuneables — kept in a
// module object so they read as named values without tripping no-magic-numbers.
const K = {
  norm: 4294967296, // 2^32
  inc: 0x6d2b79f5,
  rotA: 15,
  orB: 61,
  rotC: 7,
  rotD: 14,
  h1: 374761393,
  h2: 668265263,
  h3: 1274126177,
  hrA: 13,
  hrB: 16,
  smoothA: 3,
  smoothB: 2,
};

/**
 * Build a mulberry32 pseudo-random generator.
 * @param {number} seed any integer
 * @returns {() => number} next() -> float in [0, 1)
 */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + K.inc) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> K.rotA), t | 1);
    t ^= t + Math.imul(t ^ (t >>> K.rotC), t | K.orB);
    return ((t ^ (t >>> K.rotD)) >>> 0) / K.norm;
  };
}

/**
 * Hash an integer lattice point to a stable float in [0, 1).
 * @param {number} ix @param {number} iy @param {number} seed
 * @returns {number}
 */
function hash2D(ix, iy, seed) {
  let h = (seed >>> 0) ^ Math.imul(ix | 0, K.h1) ^ Math.imul(iy | 0, K.h2);
  h = Math.imul(h ^ (h >>> K.hrA), K.h3);
  h ^= h >>> K.hrB;
  return (h >>> 0) / K.norm;
}

/**
 * Smoothstep fade curve.
 * @param {number} t 0..1
 * @returns {number}
 */
function fade(t) {
  return t * t * (K.smoothA - K.smoothB * t);
}

/**
 * Bilinear value noise at (x, y). Deterministic for a given seed.
 * @param {number} x @param {number} y @param {number} seed
 * @returns {number} float in [0, 1]
 */
export function valueNoise2D(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = fade(x - x0);
  const fy = fade(y - y0);
  const n00 = hash2D(x0, y0, seed);
  const n10 = hash2D(x0 + 1, y0, seed);
  const n01 = hash2D(x0, y0 + 1, seed);
  const n11 = hash2D(x0 + 1, y0 + 1, seed);
  const top = n00 + fx * (n10 - n00);
  const bottom = n01 + fx * (n11 - n01);
  return top + fy * (bottom - top);
}

/**
 * Fractal Brownian motion — summed octaves of valueNoise2D, normalised back to
 * [0, 1]. Deterministic for a given seed.
 * @param {number} x @param {number} y @param {number} seed
 * @param {{octaves?:number, lacunarity?:number, gain?:number}} [opts]
 * @returns {number} float in [0, 1]
 */
export function fbm(x, y, seed, opts = {}) {
  const { octaves = 4, lacunarity = 2, gain = 0.5 } = opts;
  let sum = 0;
  let norm = 0;
  let amp = 1;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, seed + i);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return norm > 0 ? sum / norm : 0;
}

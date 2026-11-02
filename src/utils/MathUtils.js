/**
 * MathUtils — pure math helpers for tweening, geometry, and RNG.
 *
 * Hot-path functions (distance, normalize) take plain numbers and either
 * return a number or write into a caller-supplied out object, so they never
 * allocate. Easing curves follow the standard Penner / easings.net forms.
 */

const HALF = 0.5;
const TWO = 2;
const THREE = 3;
const DEG_PER_RAD = 180;
const ELASTIC_PERIOD = (TWO * Math.PI) / THREE;
const ELASTIC_DECAY = 10;
const ELASTIC_SHIFT = 0.75;

/**
 * Linear interpolation from a to b.
 * @param {number} a @param {number} b @param {number} t 0..1
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Constrain n to the inclusive range [min, max].
 * @param {number} n @param {number} min @param {number} max
 * @returns {number}
 */
export function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/**
 * Euclidean distance between two points.
 * @param {number} ax @param {number} ay @param {number} bx @param {number} by
 * @returns {number}
 */
export function distance(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Angle in radians from point A to point B (atan2 convention).
 * @param {number} ax @param {number} ay @param {number} bx @param {number} by
 * @returns {number}
 */
export function angleBetween(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

/**
 * Wrap an angle (radians) into the (-PI, PI] range.
 * @param {number} a @returns {number}
 */
export function wrapAngle(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/**
 * Rotate `current` toward `target` by at most `maxDelta`, along the shortest
 * arc. All angles in radians; the result is wrapped to (-PI, PI]. Shared by
 * TankMotor (hull steer), TankTurret (turret slew), and entityMotion (generic
 * body facing) so the wrap/clamp trig lives in one place.
 * @param {number} current @param {number} target @param {number} maxDelta >= 0
 * @returns {number}
 */
export function rotateToward(current, target, maxDelta) {
  const d = wrapAngle(target - current);
  const step = d > maxDelta ? maxDelta : d < -maxDelta ? -maxDelta : d;
  return wrapAngle(current + step);
}

/**
 * Normalize the vector (x, y) into out as { x, y }; zero-length stays zero.
 * @param {number} x @param {number} y
 * @param {{x:number,y:number}} [out] reused target (default a fresh object)
 * @returns {{x:number,y:number}}
 */
export function normalize(x, y, out = { x: 0, y: 0 }) {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) {
    out.x = 0;
    out.y = 0;
  } else {
    out.x = x / len;
    out.y = y / len;
  }
  return out;
}

/**
 * Point-in-polygon test (ray casting) — `points` any simple polygon, in
 * order (winding direction doesn't matter). Used for non-circular
 * obstacle footprints (`WorldField.blockPolygon`) where a circle would
 * either leave gaps at the shape's corners or bulge past its straight
 * edges — exactly the player base's own diamond wall (S55).
 * @param {number} x @param {number} y
 * @param {{x:number,y:number}[]} points
 * @returns {boolean}
 */
export function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    const crossesY = (yi > y) !== (yj > y);
    if (crossesY && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Uniform random float in [min, max).
 * @param {number} min @param {number} max
 * @returns {number}
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Uniform random integer in [min, max] inclusive.
 * @param {number} min @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Degrees to radians.
 * @param {number} deg @returns {number}
 */
export function degToRad(deg) {
  return (deg * Math.PI) / DEG_PER_RAD;
}

/**
 * Radians to degrees.
 * @param {number} rad @returns {number}
 */
export function radToDeg(rad) {
  return (rad * DEG_PER_RAD) / Math.PI;
}

/**
 * Quadratic ease-out.
 * @param {number} t 0..1 @returns {number}
 */
export function easeOutQuad(t) {
  const inv = 1 - t;
  return 1 - inv * inv;
}

/**
 * Cubic ease-out.
 * @param {number} t 0..1 @returns {number}
 */
export function easeOutCubic(t) {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

/**
 * Elastic ease-out (overshoot-and-settle).
 * @param {number} t 0..1 @returns {number}
 */
export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(TWO, -ELASTIC_DECAY * t) * Math.sin((t * ELASTIC_DECAY - ELASTIC_SHIFT) * ELASTIC_PERIOD) + 1;
}

/**
 * Quadratic ease-in-out.
 * @param {number} t 0..1 @returns {number}
 */
export function easeInOutQuad(t) {
  if (t < HALF) return TWO * t * t;
  const inv = -TWO * t + TWO;
  return 1 - (inv * inv) / TWO;
}

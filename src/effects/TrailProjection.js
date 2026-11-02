/** Ground-plane contact projection shared by trail generation and tests. */
import { ISO_RATIO } from '../utils/SquareGrid.js';
const HALF = 0.5;

/** Write the world offset of a model's local forward/side point, allocation free.
 * @param {number} heading @param {number} forward @param {number} side
 * @param {boolean} projected @param {object} out @returns {void} */
export function contactOffset(heading, forward, side, projected, out) {
  const dx = Math.cos(heading), dy = Math.sin(heading);
  if (!projected) {
    out.x = dx * forward - dy * side;
    out.y = dy * forward + dx * side;
    return;
  }
  // Invert the same diamond projection used by Unit3DLayer, rotate in its
  // ground plane, then project back. cameraScale cancels with model fitting.
  const ax = dx + dy / ISO_RATIO, az = dy / ISO_RATIO - dx;
  const n = Math.hypot(ax, az), ux = ax / n, uz = az / n;
  const x = ux * forward - uz * side, z = uz * forward + ux * side;
  out.x = (x - z) * HALF;
  out.y = (x + z) * HALF * ISO_RATIO;
}

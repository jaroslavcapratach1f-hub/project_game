/**
 * ProjectileMotion — pure per-archetype integration. `step(proj, dt)` advances
 * one Projectile and returns true once it has reached its impact point. No
 * PixiJS, no allocation.
 *   straight : base += v·dt
 *   wobble   : straight + lateral sin(phase)·wobbleAmpPx, phase += 2π·hz·dt
 *   arc      : lerp origin→impact by arcT (arcT += speed/length·dt); the visual
 *              lift is sin(arcT·π)·arcApexPx, written to proj.heightPx
 */
import { PROJECTILE } from '../config/ProjectileConfig.js';

const TWO_PI = Math.PI * 2;

/**
 * @param {import('./Projectile.js').Projectile} proj
 * @param {number} dt seconds
 * @returns {boolean} true when the projectile has reached its impact point
 */
export function step(proj, dt) {
  proj.prevX = proj.x;
  proj.prevY = proj.y;
  proj.elapsedSec += dt;
  if (proj.motion === 'arc') return stepArc(proj, dt);
  proj.baseX += proj.vx * dt;
  proj.baseY += proj.vy * dt;
  if (proj.motion === 'wobble') applyWobble(proj, dt);
  else {
    proj.x = proj.baseX;
    proj.y = proj.baseY;
  }
  return overshot(proj);
}

/** @private lateral sine offset perpendicular to the velocity */
function applyWobble(proj, dt) {
  const arch = PROJECTILE.archetypes[proj.weapon];
  proj.wobblePhase += TWO_PI * arch.wobbleHz * dt;
  const speed = proj.speedPx || 1;
  const perpX = -proj.vy / speed;
  const perpY = proj.vx / speed;
  const offset = Math.sin(proj.wobblePhase) * arch.wobbleAmpPx;
  proj.x = proj.baseX + perpX * offset;
  proj.y = proj.baseY + perpY * offset;
}

/** @private true once the base position has passed the aim point */
function overshot(proj) {
  const toAimX = proj.targetX - proj.baseX;
  const toAimY = proj.targetY - proj.baseY;
  return toAimX * proj.vx + toAimY * proj.vy <= 0;
}

/** @private straight ground track between origin and the locked impact point */
function stepArc(proj, dt) {
  const arch = PROJECTILE.archetypes[proj.weapon];
  const dx = proj.targetX - proj.originX;
  const dy = proj.targetY - proj.originY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  proj.arcT += (proj.speedPx / length) * dt;
  const t = proj.arcT < 1 ? proj.arcT : 1;
  proj.baseX = proj.originX + dx * t;
  proj.baseY = proj.originY + dy * t;
  proj.x = proj.baseX;
  proj.y = proj.baseY;
  proj.heightPx = Math.sin(t * Math.PI) * arch.arcApexPx;
  return proj.arcT >= 1;
}

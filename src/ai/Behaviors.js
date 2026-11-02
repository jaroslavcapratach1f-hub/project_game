/**
 * Behaviors — pure, stateless helpers for the enemy AI: choose a target, choose
 * a hold position, scatter an aim point. No PixiJS. No per-call allocation:
 * callers pass a reused `out`, and module scratch is reused internally. All
 * angles radians, all distances world px.
 */
import { AI } from '../config/AIConfig.js';
import { TILE_SIZE } from '../config/GameConfig.js';
import { angleBetween, degToRad, randomRange } from '../utils/MathUtils.js';

/** @param {import('../entities/Entity.js').Entity} e @returns {number} threat score, capped */
function threatOf(e) {
  const tp = AI.targetPriority;
  const raw = (e.dmg ?? 0) * tp.threatPerDmg + ((e.rangePx ?? 0) / TILE_SIZE) * tp.threatPerRangeTile;
  return raw < tp.threatCap ? raw : tp.threatCap;
}

/** @param {string} id @returns {number} +1 / -1 — a stable side so 'flank'/'strafe' don't jitter */
function sideOf(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) | 0;
  return h % 2 === 0 ? 1 : -1;
}

/**
 * Best enemy target for `self`, or null. Strict priority (tiers an order of
 * magnitude apart): last attacker (self-defense) > nearest inside rangePx >
 * highest threat score. Skips dead / self / same-team units — alliance immunity
 * (FORWARD: a real alliance graph later).
 * @param {import('../entities/Entity.js').Entity} self
 * @param {import('../entities/Entity.js').Entity[]} candidates
 * @param {{id:?string}} out reused holder — `out.id` is set to the pick's id
 * @returns {?import('../entities/Entity.js').Entity}
 */
export function pickTarget(self, candidates, out) {
  const tp = AI.targetPriority;
  const range = self.rangePx ?? 0;
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (c === self || !c.isAlive || c.team === self.team) continue;
    const d = self.getDistanceTo(c);
    let score = threatOf(c);
    if (range > 0 && d <= range) score += tp.inRange + tp.proximity * (1 - d / range);
    if (self.lastAttackerId && c.id === self.lastAttackerId) score += tp.selfDefense;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  out.id = best ? best.id : null;
  return best;
}

/**
 * World point `self` should move toward while engaging `target`, per its class
 * movement profile (AI.movement.byClass[self.cls], falling back to `default`).
 * @param {import('../entities/Entity.js').Entity} self
 * @param {import('../entities/Entity.js').Entity} target
 * @param {{x:number,y:number}} out reused
 * @returns {{x:number,y:number}}
 */
export function desiredPosition(self, target, out) {
  const m = AI.movement;
  const prof = m.byClass[self.cls] ?? m.default;
  const range = self.rangePx ?? 0;
  const dist = self.getDistanceTo(target);
  const bearing = angleBetween(target.x, target.y, self.x, self.y); // target -> self
  let ang = bearing;
  let radius = range * (prof.idealRangeFrac ?? m.default.idealRangeFrac);
  switch (prof.profile) {
    case 'flank': ang = bearing + sideOf(self.id) * degToRad(m.flankDeg); break;
    case 'strafe': ang = bearing + sideOf(self.id) * degToRad(m.strafeDeg); break;
    case 'deployAtRange':
      if (dist <= range) { out.x = self.x; out.y = self.y; return out; }
      break;
    case 'maxRangeSalvoRetreat':
      radius = range * m.retreatFrac;
      if (dist >= radius) { out.x = self.x; out.y = self.y; return out; }
      break;
    default: break; // 'advance' / 'coverAdvance' / 'ambushCover' — close on the direct line
  }
  out.x = target.x + Math.cos(ang) * radius;
  out.y = target.y + Math.sin(ang) * radius;
  return out;
}

/**
 * A scattered aim point for an AI shot — the unit passes this as COMBAT_SHOT
 * targetX/targetY. Cone widens while the shooter is moving and with target
 * range past half of rangePx (see AI.accuracy).
 * @param {import('../entities/Entity.js').Entity} self
 * @param {import('../entities/Entity.js').Entity} target
 * @param {{x:number,y:number}} out reused
 * @returns {{x:number,y:number}}
 */
export function aimScatter(self, target, out) {
  const a = AI.accuracy;
  const dist = self.getDistanceTo(target);
  let coneDeg = a.baseDeg + (self.moveTarget ? a.movingDeg : 0);
  const pastHalf = dist - (self.rangePx ?? 0) * a.pastRangeHalfFrac;
  if (pastHalf > 0) {
    coneDeg += Math.floor(pastHalf / a.pxPerSpreadStep) * a.perHundredPxPastHalfRangeDeg;
  }
  const ang = angleBetween(self.x, self.y, target.x, target.y) + degToRad(randomRange(-coneDeg, coneDeg));
  out.x = self.x + Math.cos(ang) * dist;
  out.y = self.y + Math.sin(ang) * dist;
  return out;
}

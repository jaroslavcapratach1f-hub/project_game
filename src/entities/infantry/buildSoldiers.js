/**
 * buildSoldiers — spawns `count` Soldier structs on a cols-wide grid
 * centred on (cx,cy), each with its own randomized formation pace,
 * turn-rate and gait phase. Split out of InfantrySquad.js to keep it under
 * the 150-line cap.
 */
import { SQUAD } from '../../config/InfantryConfig.js';
import { degToRad, randomRange } from '../../utils/MathUtils.js';
import { Soldier } from './Soldier.js';

const HALF = 0.5;

/**
 * @param {{idPrefix:string, cx:number, cy:number, count:number, rotation:number,
 *   hp:number, rofShotsPerSec:number}} o cx/cy centroid world px, rotation
 *   initial facing radians, hp per soldier
 * @returns {Soldier[]}
 */
export function buildSoldiers(o) {
  const { idPrefix, cx, cy, count, rotation, hp, rofShotsPerSec } = o;
  const f = SQUAD.formation;
  const s = SQUAD.soldier;
  const rows = Math.ceil(count / f.cols);
  const soldiers = [];
  for (let i = 0; i < count; i++) {
    const slotX = ((i % f.cols) - (f.cols - 1) * HALF) * f.spacingPx + jitter(f.jitterPx);
    const slotY = (Math.floor(i / f.cols) - (rows - 1) * HALF) * f.spacingPx + jitter(f.jitterPx);
    soldiers.push(new Soldier({
      id: `${idPrefix}:${i}`,
      x: cx + slotX, y: cy + slotY,
      slotX, slotY, hp, rotation,
      fireCooldown: randomRange(0, (1 / rofShotsPerSec) * SQUAD.fireStagger.max),
      moveLerp: SQUAD.moveLerp * jitterFrac(SQUAD.moveLerpJitterFrac),
      turnRateRadPerSec: degToRad(s.turnRateDegPerSec) * jitterFrac(s.turnRateJitterFrac),
      swingPhase: Math.random() * Math.PI * 2,
    }));
  }
  return soldiers;
}

/** @param {number} amt @returns {number} random offset in [-amt, amt) */
function jitter(amt) {
  return (Math.random() * 2 - 1) * amt;
}

/** @param {number} frac @returns {number} random multiplier in [1-frac, 1+frac) — a per-soldier variance factor */
function jitterFrac(frac) {
  return 1 + jitter(frac);
}

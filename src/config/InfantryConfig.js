/**
 * InfantryConfig — tuneables for the infantry SQUAD composite (GDD 06): a
 * first-class field unit made of N individually-drawn soldiers that move in
 * formation, fire in a staggered crackle, and die one-by-one as squad HP drops.
 *
 * DRAFT: every value is a proposal. REVIEW.
 */

export const SQUAD = {
  // Dev spawn count. FORWARD: PersonnelConfig.squadSize(personnel, 'infantry')
  // once the personnel economy lands. S57: 10 -> 4, the user's own call.
  defaultCount: 4,
  // 2-wide grid; rows = ceil(count / cols). spacing between slot centres,
  // plus a small per-soldier random offset so the block reads as loose.
  // S57: spacingPx doubled alongside radiusPx below (units were barely
  // visible zoomed out) — left at the old ratio (4x diameter) so bigger
  // soldiers still don't visually overlap in formation.
  formation: { cols: 2, spacingPx: 32, jitterPx: 8 },
  soldier: {
    radiusPx: 8, // S57: doubled from 4 — see EntityConfig.js VEHICLE.body's own doc
    facingTickPx: 10, // stub barrel: a short tick pointing along squad heading
    color: 0x6b8e23, // olive (player)
    enemyColor: 0x8b4a2f, // rust (enemy)
    deathFadeMs: 350,
    // S56: each soldier eases its OWN displayed facing toward the squad's
    // heading at its own randomized rate, instead of every soldier
    // snapping to the exact same `squad.rotation` value every tick — that
    // read as one rigid block pivoting, not individual troops.
    turnRateDegPerSec: 260,
    turnRateJitterFrac: 0.3, // +/- range, randomized once per soldier at spawn
  },
  moveLerp: 0.18, // per-tick soldier -> formation-slot follow fraction (base)
  moveLerpJitterFrac: 0.35, // +/- range on moveLerp, randomized once per soldier — so the formation closes up at visibly different rates per soldier, not in lockstep
  // × (1 / rof) per soldier, so the squad crackles instead of volleying.
  fireStagger: { min: 0.6, max: 1.6 },
  sightRangeTiles: 8,
  // 3D-only walk-cycle (S56, real leg movement — see Unit3DConfig.js's own
  // doc for the trimesh leg split this drives): each leg pivot swings
  // +/-swingDeg from its rest pose, in opposite phase (one leg forward
  // while the other's back), with phase advanced from each soldier's travel — a
  // genuine alternating stride, not a whole-body bounce (that read as
  // "jumping," not walking, and was replaced by this).
  walkCycle: { swingDeg: 30, crossoverDeg: 6, stridePx: 18, minStepPx: 0.15 },
};

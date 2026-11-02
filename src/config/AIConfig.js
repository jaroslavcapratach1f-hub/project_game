/**
 * AIConfig — every tuneable for the enemy-unit AI (src/ai/): the IDLE / PATROL
 * / ALERT / ENGAGE / RETREAT state machine, target-priority weights, the
 * per-class movement profile, and the AI-only accuracy spread.
 *
 * The AI drives MOVEMENT + POSTURE only — it never fires (CALM rule, GDD 02).
 * A unit only auto-fires once FuryManager flips its stance (see CombatConfig
 * FURY). ENGAGE is the AI mirror of that stance, nothing more.
 *
 * DRAFT: every value is a proposal. Grep "REVIEW".
 */

/**
 * State-machine tuning. `sweepPeriodMs` is the full oscillation period of the
 * IDLE turret sweep; `recooldownMs` stops a lingering player unit re-triggering
 * ALERT every scan.
 */
export const AI = {
  IDLE: {
    turretSweepDeg: 30,   // turret oscillates +/- this off the hull heading
    sweepPeriodMs: 4000,  // one full left-right-left sweep
    scanIntervalMs: 500,  // re-check sightRangePx for player units this often
  },
  PATROL: {
    speedMult: 0.70,      // fraction of entity.speed while walking the route
    waypointArrivePx: 28, // advance to the next waypoint within this distance
  },
  ALERT: {
    recognitionDelayMs: 500, // freeze this long, raise "!", then relax
    recooldownMs: 4000,      // min gap before the same unit can re-ALERT
  },
  RETREAT: {
    hpFrac: 0.25,   // hp/maxHp below this -> break contact and run home
    speedMult: 1.0, // full tilt (hard cap)
  },

  /**
   * Target-priority weights for Behaviors.pickTarget. Additive tiers, strictly
   * ordered: last attacker (selfDefense) > any in-range target > nearer of two
   * in-range > raw threat (only ever a tie-breaker — capped below `proximity`).
   * threat = min(dmg * threatPerDmg + rangePx/TILE * threatPerRangeTile, threatCap).
   */
  targetPriority: {
    selfDefense: 1000,
    inRange: 100,             // flat bonus for a target inside rangePx
    proximity: 50,            // extra, scaled by (1 - dist/rangePx), for in-range targets
    threatPerDmg: 0.02,
    threatPerRangeTile: 0.4,
    threatCap: 20,            // keep threat strictly under `proximity`
  },

  /**
   * Per-class movement profile + idealRangeFrac (fraction of rangePx the unit
   * tries to hold from its target while engaging). `profile` selects a
   * Behaviors.desiredPosition branch. Missing keys fall back to `default`.
   */
  movement: {
    default: { profile: 'advance', idealRangeFrac: 0.85 },
    flankDeg: 42,   // 'flank' offset around the target
    strafeDeg: 90,  // 'strafe' offset (perpendicular circling)
    retreatFrac: 0.95, // 'maxRangeSalvoRetreat' kite distance as a frac of range
    repathMinDeltaPx: 40, // re-run A* from goTo() only when the destination shifts more than this
    byClass: {
      heavyTank: { profile: 'advance' },
      superHeavyTank: { profile: 'advance' },
      mediumTank: { profile: 'flank' },
      lightTank: { profile: 'strafe', idealRangeFrac: 0.80 },
      tankHunter: { profile: 'ambushCover' },
      infantry: { profile: 'coverAdvance' },
      howitzer: { profile: 'deployAtRange' },
      atGun: { profile: 'deployAtRange' },
      launcher: { profile: 'maxRangeSalvoRetreat' },
    },
  },

  /**
   * Accuracy spread — AI shots ONLY. Behaviors.aimScatter turns this into a
   * COMBAT_SHOT targetX/targetY offset. Total cone (deg) =
   *   baseDeg + (moving ? movingDeg : 0)
   *          + perHundredPxPastHalfRangeDeg * floor(pastHalf / pxPerSpreadStep)
   * where pastHalf = max(0, dist - rangePx * pastRangeHalfFrac).
   */
  accuracy: {
    baseDeg: 3,
    movingDeg: 5,
    perHundredPxPastHalfRangeDeg: 1,
    pastRangeHalfFrac: 0.5,
    pxPerSpreadStep: 100,
  },

  // S81: unit-to-unit collision avoidance is a discrete hex claim on each
  // unit's own current waypoint (HexOccupancy, via entityMotion.js's
  // claimWaypoint) — no distance-threshold tunable lives here any more.
};

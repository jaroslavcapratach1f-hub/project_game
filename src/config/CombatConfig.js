/**
 * CombatConfig — the damage-exchange model, targeting, the Fury systems, and
 * base-defence rules.
 *
 * DAMAGE PIPELINE (per shot that lands):
 *   1. hit roll   — hits if rand() < clamp(attackerAcc - targetDodge, minHit, maxHit)
 *   2. raw        = attackerDmg
 *   3. x typeCounter   — COUNTERS[attackerCls][targetCls] or 1
 *   4. x penMult       — armoured target only; explosive weapons use explosiveVsArmour
 *   5. x (1 - defMitigation)   — defMitigation = def / (def + DEF_K)
 *   6. x splashFactor  — 1 at centre -> SPLASH.edgeFalloff at the aoe edge
 *   7. x variance      — 1 +/- DAMAGE_VARIANCE
 *   floored at (step 3 result) x SOFT.minDamageFrac
 *
 * DRAFT: every constant is a proposal. REVIEW.
 */

export const HIT = { minHit: 0.35, maxHit: 0.98 };
export const DEF_K = 220;           // defense value at which mitigation = 50%
export const DAMAGE_VARIANCE = 0.1; // +/- per shot

/**
 * PENETRATION vs DEPTH — only when the TARGET class is armoured
 * (CLASS_TRAITS.armored). `depth` = the facing that was hit (front by default;
 * side / rear when the shot lands in that arc — positioning skill).
 *   pen  <  depth            -> RICOCHET  (ricochetMult)
 *   depth <= pen < 2 * depth -> PENETRATE (penMult)
 *   pen  >= 2 * depth        -> OVERMATCH (overmatchMult)
 * RICOCHET is upgraded to PENETRATE when EITHER the attacker is `noOverpen`
 * (purpose-built AT: tank hunters, AT gun) OR a COUNTERS entry exists for
 * attacker-class -> target-class.
 */
export const PEN = {
  ricochetMult: 0.35,
  penMult: 1.0,
  overmatchMult: 1.15,
  overmatchRatio: 2.0,
  penJitter: 0.12, // +/- on the attacker's displayed (average) pen per shot
};

export const FACING = { frontArc: 120, rearArc: 90 }; // remainder = side

/**
 * Soft targets (non-armoured classes): penetration is ignored. Explosive
 * weapons (howitzers, launchers) skip the PEN table against armoured targets
 * and use explosiveVsArmour instead. `VS_INFANTRY` (below) stacks on top when
 * the target is infantry (howitzers squad-wipe; AT gun poor).
 */
export const SOFT = {
  softDamageMult: 1.0,
  explosiveVsArmour: 1.0,
  minDamageFrac: 0.05,
  // an attacker with no `pen` at all (rifle squads) barely scratches armour —
  // a flat chip instead of the 0.35 ricochet band, so a lone tank isn't swarmed
  // down by small arms (GDD 03: "infantry can't fight tanks").
  smallArmsVsArmour: 0.035,
};

/** Attacker classes whose shots skip the PEN table vs armoured targets and use
 *  SOFT.explosiveVsArmour instead (howitzers, rocket launchers). */
export const EXPLOSIVE_CLASSES = new Set(['howitzer', 'launcher']);
/** Attacker classes that never ricochet — a marginal (pen < depth) hit still
 *  penetrates (purpose-built AT: tank hunters, towed AT guns). */
export const NO_OVERPEN_CLASSES = new Set(['tankHunter', 'atGun']);

export const SPLASH = { edgeFalloff: 0.5 };

/**
 * Class counter multiplier: COUNTERS[attackerClass][defenderClass]. Missing
 * pair = 1.0. This is GDD 02's "TYPE COUNTERS" chain verbatim — every pair is
 * SOFT (1.2) unless the GDD marks it "(hard)", and artillery → infantry is the
 * dedicated 2.0. Do not add pairs the GDD doesn't list; the damage model's
 * penetration bands already make e.g. an AT gun shred a medium tank.
 */
export const SOFT_COUNTER = 1.2;
export const HARD_COUNTER = 1.35;
export const ARTY_VS_INFANTRY = 2.0;
export const COUNTERS = {
  infantry: { atGun: SOFT_COUNTER, tankHunter: SOFT_COUNTER },
  lightTank: { atGun: SOFT_COUNTER, howitzer: SOFT_COUNTER, tankHunter: SOFT_COUNTER },
  mediumTank: { lightTank: SOFT_COUNTER, tankHunter: SOFT_COUNTER },
  heavyTank: { mediumTank: SOFT_COUNTER, lightTank: SOFT_COUNTER },
  superHeavyTank: { heavyTank: SOFT_COUNTER },
  tankHunter: { heavyTank: HARD_COUNTER },
  atGun: { superHeavyTank: HARD_COUNTER },
};

/**
 * Anti-infantry effectiveness by attacker class (target class infantry only).
 * Replaces the old COUNTERS arty-vs-infantry rows — it's a property of the
 * weapon, not the rock-paper-scissors chain. Artillery shreds a squad;
 * solid-shot AT / no-turret hunters are poor at it. Missing class = 1.0.
 */
export const VS_INFANTRY = {
  lightTank: 1.7,
  mediumTank: 1.5,
  heavyTank: 1.6,
  superHeavyTank: 1.35,
  tankHunter: 0.7,
  howitzer: ARTY_VS_INFANTRY,
  launcher: 1.8,
  atGun: 0.4,
};

/**
 * Per-unit Fury meter: charges during combat, then grants a timed offensive
 * boost. SEPARATE from the Base Fury / Field Fury aggro states below.
 * Charge rate per class is CLASS_TRAITS.furyChargePerSec (UnitStats).
 */
export const UNIT_FURY = {
  fullAtPoints: 100,
  chargePerShotFired: 8,
  chargePerHitTaken: 6,
  damageBonusAtFull: 0.35,
  moveSpeedBonusAtFull: 0.15,
  durationSeconds: 10,
  cooldownSeconds: 20,
};

/** Aggro states (GDD 02). Independent of each other and of UNIT_FURY. */
export const FURY = {
  baseFuryLingerSeconds: 120,    // GDD 02
  fieldFuryLingerSeconds: 8,     // REVIEW: not in GDD
  baseGunRangeMult: 1.25,        // base guns out-range the longest troop by 25%
  targetSwitchOnClear: 'random', // GDD 02
};

export const DEPLOY = { setupSeconds: 3, teardownSeconds: 2, cannotFireWhileMoving: true };
export const RECALL = { followSquadOnAttackOrder: true, walkHomeSpeedMult: 1.0 };

/** Shared base-defence rules; the numbers live in BuildingConfig effects. */
export const BASE_DEFENSE = {
  gunsDormantUntilAttacked: true,
  focusFireFirstAttacker: true,
  towersActiveOnlyInBaseFury: true,
  garrisonAddsFirepower: true,
  garrisonAddsHp: true,
};

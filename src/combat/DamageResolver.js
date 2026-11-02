/**
 * DamageResolver — turns one impact into a final damage number (GDD 02 / the
 * CombatConfig DAMAGE PIPELINE). Pure: no PixiJS, no events, no entity mutation.
 *
 *   raw = shot.dmg
 *     x typeCounter        COUNTERS[attackerCls][target.cls]  (or 1)
 *     x vsInfantry         VS_INFANTRY[attackerCls] when target is infantry (or 1)
 *     x penMult            armoured target, non-explosive: PEN band from
 *                          shot.pen vs target.armor[facing]; a RICOCHET is
 *                          upgraded to PENETRATE for a noOverpen attacker or a
 *                          real counter. Explosive attacker -> explosiveVsArmour.
 *                          Attacker with no pen at all (rifles) -> smallArmsVsArmour.
 *                          Soft target -> softDamageMult (pen ignored).
 *     x (1 - def/(def+DEF_K))         def mitigation
 *     x splashFactor                  1 at centre -> SPLASH.edgeFalloff at edge
 *     x (1 +/- DAMAGE_VARIANCE)       per-shot variance
 *   floored at  shot.dmg * typeCounter * SOFT.minDamageFrac
 *
 * `facing` (front / side / rear, from the shot origin vs the target's hull) is
 * returned for the kill feed / damage numbers.
 */
import { CLASS_TRAITS } from '../config/UnitStats.js';
import {
  DEF_K, DAMAGE_VARIANCE, SOFT, PEN, COUNTERS, VS_INFANTRY,
  EXPLOSIVE_CLASSES, NO_OVERPEN_CLASSES,
} from '../config/CombatConfig.js';

const SIGNED = 2; // Math.random() [0,1) -> [-1,1) for symmetric jitter
const FACING_INDEX = { front: 0, side: 1, rear: 2 };

/**
 * @param {object} shot COMBAT_SHOT / Projectile payload — uses `dmg`, `pen`,
 *   `attackerCls`, `originX`, `originY`
 * @param {import('../entities/Entity.js').Entity} target
 * @param {number} [splashFactor=1] 1 at the blast centre -> SPLASH.edgeFalloff at the edge
 * @param {{final:number, facing:string}} [out] reused result object (alloc-free)
 * @returns {{final:number, facing:'front'|'side'|'rear'}}
 */
export function resolveDamage(shot, target, splashFactor = 1, out = { final: 0, facing: 'front' }) {
  const facing = target.facingOf({ x: shot.originX, y: shot.originY });
  const counter = COUNTERS[shot.attackerCls]?.[target.cls] ?? 1;
  const vsInf = target.cls === 'infantry' ? (VS_INFANTRY[shot.attackerCls] ?? 1) : 1;
  const penMult = penetrationMult(shot, target, facing, counter);
  const base = shot.dmg * counter * vsInf;
  const mitigation = 1 - target.def / (target.def + DEF_K);
  const variance = 1 + (Math.random() * SIGNED - 1) * DAMAGE_VARIANCE;
  const scaled = base * penMult * mitigation * splashFactor * variance;
  const floor = base * SOFT.minDamageFrac;
  out.final = scaled > floor ? scaled : floor;
  out.facing = facing;
  return out;
}

/**
 * @private Penetration multiplier. 1 (softDamageMult) for a non-armoured target;
 * for an armoured target either the explosive bypass or the pen-vs-depth band.
 * @param {object} shot @param {import('../entities/Entity.js').Entity} target
 * @param {'front'|'side'|'rear'} facing @param {number} counter typeCounter (1 = none)
 * @returns {number}
 */
function penetrationMult(shot, target, facing, counter) {
  if (!CLASS_TRAITS[target.cls]?.armored) return SOFT.softDamageMult;
  if (EXPLOSIVE_CLASSES.has(shot.attackerCls)) return SOFT.explosiveVsArmour;
  if (!shot.pen) return SOFT.smallArmsVsArmour; // no armour-piercing capability at all
  const depth = target.armor[FACING_INDEX[facing]] ?? target.armor[0];
  const pen = shot.pen * (1 + (Math.random() * SIGNED - 1) * PEN.penJitter);
  if (pen >= depth * PEN.overmatchRatio) return PEN.overmatchMult;
  if (pen >= depth) return PEN.penMult;
  // marginal hit: purpose-built AT and hard/soft counters still bite through
  const upgraded = NO_OVERPEN_CLASSES.has(shot.attackerCls) || counter !== 1;
  return upgraded ? PEN.penMult : PEN.ricochetMult;
}

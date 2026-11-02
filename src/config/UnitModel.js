/**
 * UnitModel — derives one base unit row (4★, level 1, no bonuses) from the
 * tuning tables in unitRoles.js. `deriveRow(key, spec)` is the ONLY place a base
 * stat is computed; UnitStats.js just calls it over the roster registry.
 *
 * REFERENCE.dmg is solved here at load from MIRROR_TTK_SECONDS so a Medium Tank
 * mirror match lasts exactly that long:
 *   TTK = hp / (dmg · rof · (acc − dodge) · defMit)   ⇒   dmg = hp / (TTK · …)
 */
import {
  REFERENCE, MIRROR_TTK_SECONDS, CLASS_ROLE, FACTION_DOCTRINE,
  INFANTRY_TIER, UNIT_OVERRIDE,
} from './unitRoles.js';
import { DEF_K } from './CombatConfig.js';

const REF_HIT = REFERENCE.acc - REFERENCE.dodge;
const REF_DEF_MIT = 1 - REFERENCE.def / (REFERENCE.def + DEF_K);
/** solved reference damage-per-shot — the anchor for every dmg in the game */
const REF_DMG = REFERENCE.hp / (MIRROR_TTK_SECONDS * REFERENCE.rof * REF_HIT * REF_DEF_MIT);

const FLAGS = ['deploy', 'indirect', 'explosive', 'noTurret', 'noOverpen'];

const r0 = (n) => Math.round(n);
const r2 = (n) => Math.round(n * 100) / 100;
const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
const fac = (faction, stat) => 1 + (FACTION_DOCTRINE[faction]?.[stat] ?? 0);

/**
 * @param {string} key roster key (e.g. 'panzer_iv') — selects any UNIT_OVERRIDE
 * @param {[string, string, number]} spec `[faction, cls, star]`
 * @returns {object} a UnitStats base row (same shape as the old hand-typed rows)
 */
export function deriveRow(key, [faction, cls, star]) {
  const role = CLASS_ROLE[cls];
  const tier = cls === 'infantry' ? INFANTRY_TIER[star.toFixed(1)] : null;
  const rofMul = tier ? tier.rofMul : 1; // infantry weapon character; DPS-neutral

  const row = { faction, cls, star };
  row.hp = r0(REFERENCE.hp * role.hpM * fac(faction, 'hp'));
  row.dmg = r0(REF_DMG * role.dmgM * fac(faction, 'dmg') / rofMul);
  row.def = r0(REFERENCE.def * role.defM);
  row.rof = r2(REFERENCE.rof * role.rofM * fac(faction, 'rof') * rofMul);
  row.rng = r2(role.rngT * fac(faction, 'rng'));
  row.spd = r2(role.spdT * fac(faction, 'spd'));
  row.acc = r2(clamp(role.acc * fac(faction, 'acc'), 0.5, 0.98));
  row.dodge = r2(clamp(role.dodge * fac(faction, 'dodge'), 0, 0.3));
  row.cost = role.costP;
  row.aoe = r2(role.aoeT * fac(faction, 'aoe'));

  if (role.armorM) {
    row.armor = role.armorM.map((m, i) => r0(REFERENCE.armor[i] * m * fac(faction, 'armor')) || 1);
  }
  if (role.penM !== undefined) row.pen = r0(REFERENCE.pen * role.penM);
  if (role.minRngT !== undefined) row.minRng = r2(role.minRngT);
  for (const f of FLAGS) if (role[f]) row[f] = true;
  if (role.salvo !== undefined) { row.salvo = role.salvo; row.reloadSeconds = role.reloadSeconds; }

  return Object.assign(row, UNIT_OVERRIDE[key] ?? {});
}

/** exposed for tests / balance read-outs */
export const MODEL_INFO = { REF_DMG, REF_HIT, REF_DEF_MIT };

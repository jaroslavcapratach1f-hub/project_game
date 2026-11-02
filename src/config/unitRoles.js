/**
 * unitRoles — the tuning tables the unit stat model derives from. Every base row
 * in UnitStats.js is `REFERENCE × CLASS_ROLE[cls] × (1 + FACTION_DOCTRINE) ×
 * star`, so a stat is never hand-typed — it traces to a rule here.
 *
 * ONE anchor: a 4★ Medium Tank mirror match lasts MIRROR_TTK_SECONDS. REFERENCE
 * .dmg is solved from it at load (see UnitModel.js); everything else is a
 * multiple of the reference on that axis. Retune by editing a number here — all
 * 24 units re-derive consistently.
 *
 * DRAFT: magnitudes are a proposal. The relationships track GDD 02 / 03.
 */

/** Mirror-match time-to-kill for the reference unit, seconds. The single dial. */
export const MIRROR_TTK_SECONDS = 13;

/** 4★ / level-1 Medium Tank — the 1.0 on every axis. `dmg` is derived. */
export const REFERENCE = {
  hp: 560,
  def: 32,
  rof: 0.75,          // shots/sec (~1.33 s/shot)
  armor: [32, 15, 8], // front / side / rear depth
  pen: 38,            // ~1.19 × own front armour → clean self-penetrate in a mirror
  acc: 0.85,
  dodge: 0.04,
};

/**
 * Per-class role shape — firepower / durability / mobility intent.
 *  ·M   multiplier on the REFERENCE value (hp, dmg, def, rof, pen)
 *  armorM  per-facing multiplier on REFERENCE.armor (armoured classes only)
 *  rngT / spdT   absolute tiles and tiles/sec
 *  acc / dodge   absolute 0..1
 *  costP  personnel per entity ·  aoeT  splash tiles
 *  flags: deploy, indirect, explosive, noTurret, noOverpen ·  vsInfantry mult
 */
export const CLASS_ROLE = {
  infantry: {
    hpM: 0.42, dmgM: 0.40, defM: 0.38, rofM: 1.65,
    rngT: 1.6, spdT: 2.6, acc: 0.90, dodge: 0.08, costP: 2, aoeT: 0,
  },
  lightTank: {
    hpM: 0.78, dmgM: 0.46, defM: 0.62, rofM: 1.55, penM: 0.82,
    armorM: [0.56, 0.60, 0.62],
    rngT: 4.0, spdT: 3.8, acc: 0.86, dodge: 0.12, costP: 3, aoeT: 0,
  },
  mediumTank: {
    hpM: 1.0, dmgM: 1.0, defM: 1.0, rofM: 1.0, penM: 1.0,
    armorM: [1.0, 1.0, 1.0],
    rngT: 5.0, spdT: 2.2, acc: 0.85, dodge: 0.04, costP: 4, aoeT: 0,
  },
  heavyTank: {
    hpM: 1.70, dmgM: 1.92, defM: 1.62, rofM: 0.78, penM: 1.95,
    armorM: [1.80, 1.78, 2.10],
    rngT: 5.5, spdT: 1.5, acc: 0.82, dodge: 0.02, costP: 7, aoeT: 0,
  },
  superHeavyTank: {
    hpM: 5.0, dmgM: 2.15, defM: 2.90, rofM: 0.60, penM: 2.55,
    armorM: [3.10, 4.00, 5.60],
    rngT: 4.5, spdT: 1.1, acc: 0.80, dodge: 0.0, costP: 12, aoeT: 0.6,
  },
  tankHunter: {
    hpM: 1.15, dmgM: 2.20, defM: 0.70, rofM: 0.72, penM: 2.80,
    armorM: [1.10, 1.05, 0.80],
    rngT: 7.0, spdT: 2.1, acc: 0.86, dodge: 0.06, costP: 5, aoeT: 0,
    noTurret: true, noOverpen: true,
  },
  howitzer: {
    hpM: 2.20, dmgM: 6.0, defM: 0.32, rofM: 0.44,
    rngT: 14.0, minRngT: 4.0, spdT: 1.1, acc: 0.70, dodge: 0.0, costP: 5, aoeT: 1.7,
    deploy: true, indirect: true, explosive: true,
  },
  atGun: {
    hpM: 0.68, dmgM: 3.10, defM: 0.25, rofM: 0.64, penM: 3.60,
    rngT: 9.0, spdT: 1.0, acc: 0.84, dodge: 0.0, costP: 4, aoeT: 0,
    deploy: true, noOverpen: true,
  },
  launcher: {
    hpM: 0.92, dmgM: 1.05, defM: 0.32, rofM: 1.0,
    rngT: 6.0, spdT: 3.4, acc: 0.60, dodge: 0.12, costP: 6, aoeT: 2.4,
    explosive: true, salvo: 16, reloadSeconds: 6,
  },
};

/** Faction doctrine (GDD 03) — fractional deltas on the class shape. */
export const FACTION_DOCTRINE = {
  germany: { hp: 0.06, armor: 0.15, dmg: 0.03, rof: -0.05, spd: -0.12, dodge: -0.01 },
  usa: { hp: -0.04, dmg: -0.02, rof: 0.12, rng: 0.06, spd: 0.10, acc: 0.02, dodge: 0.02, armor: -0.06 },
  russia: { hp: 0.11, dmg: 0.05, rof: -0.06, spd: -0.03, rng: -0.05, acc: -0.03, armor: 0.04, aoe: 0.12 },
};

/**
 * Infantry weapon tier (GDD 03: bolt-action → semi-auto → assault). This only
 * sets the *character* — `rofMul` spreads the same 4★ DPS across more, smaller
 * shots. The actual tier power gain comes from `STAR_MULTIPLIER` downstream
 * (StatResolution, applied at the row's own `star`), so it is NOT re-applied
 * here — doing both double-counted it.
 */
export const INFANTRY_TIER = {
  '4.0': { rofMul: 1.00 },
  '4.5': { rofMul: 1.35 },
  '5.0': { rofMul: 1.90 },
};

/**
 * Per-unit overrides — the handful of GDD-03 callouts where a unit deviates
 * from its class shape. Absolute final values, merged last. Keep this short.
 */
export const UNIT_OVERRIDE = {
  t34_85: { hp: 660 },                        // "highly durable medium"
  m18_hellcat: { spd: 3.3, dodge: 0.14 },     // "fastest tank hunter, glass cannon"
  su100: { pen: 118 },                        // "excellent at cracking heavy armor"
  m24_chaffee: { aoe: 0.2 },                  // minor HE shell
  isu152: { rng: 12.5, hp: 1500, def: 13 },   // "lower range, higher HP/Def than M12"
};

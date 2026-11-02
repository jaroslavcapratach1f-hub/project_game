/**
 * DoctrineTree — the "Modern Warfare" research track (GDD 04): per-branch stat
 * lines that let the player specialise in Infantry, Armour, or Fire Support,
 * plus reserve recovery.
 *
 * `effect.key` scopes: 'unit.infantry.*', 'unit.armor.*' (light/medium/heavy/
 * super-heavy tanks + tank hunters), 'unit.artillery.*' (howitzer/launcher/
 * atGun). These feed StatResolution's `research` layer for matching classes
 * only. See DevelopmentTree header for node shape. DRAFT — REVIEW.
 */

const T = 'doctrine';

export const DOCTRINE_NODES = [
  { id: 'doc_inf_hp', track: T, tier: 3, maxRank: 8, effect: { key: 'unit.infantry.hp', perRank: 0.03, mode: 'pct' }, baseCost: { money: 16000, steel: 9000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_inf_dmg', track: T, tier: 3, maxRank: 8, effect: { key: 'unit.infantry.dmg', perRank: 0.03, mode: 'pct' }, baseCost: { money: 16000, steel: 9000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_inf_speed', track: T, tier: 3, maxRank: 6, effect: { key: 'unit.infantry.spd', perRank: 0.02, mode: 'pct' }, baseCost: { money: 14000, oil: 6000 }, baseSeconds: 4800, requires: [] },
  { id: 'doc_inf_antiarmor', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.infantry.pen', perRank: 0.04, mode: 'pct' }, baseCost: { money: 34000, steel: 22000 }, baseSeconds: 12600, requires: ['doc_inf_dmg'] },
  { id: 'doc_armor_hp', track: T, tier: 3, maxRank: 8, effect: { key: 'unit.armor.hp', perRank: 0.03, mode: 'pct' }, baseCost: { money: 18000, steel: 12000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_armor_pen', track: T, tier: 3, maxRank: 8, effect: { key: 'unit.armor.pen', perRank: 0.03, mode: 'pct' }, baseCost: { money: 18000, steel: 12000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_armor_plating', track: T, tier: 3, maxRank: 8, effect: { key: 'unit.armor.armor', perRank: 0.03, mode: 'pct' }, baseCost: { money: 18000, steel: 12000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_armor_rof', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.armor.rof', perRank: 0.025, mode: 'pct' }, baseCost: { money: 36000, steel: 24000 }, baseSeconds: 12600, requires: ['doc_armor_pen'] },
  { id: 'doc_arty_range', track: T, tier: 3, maxRank: 6, effect: { key: 'unit.artillery.rng', perRank: 0.025, mode: 'pct' }, baseCost: { money: 17000, steel: 10000, oil: 4000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_arty_dmg', track: T, tier: 3, maxRank: 8, effect: { key: 'unit.artillery.dmg', perRank: 0.03, mode: 'pct' }, baseCost: { money: 17000, steel: 10000, oil: 4000 }, baseSeconds: 5400, requires: [] },
  { id: 'doc_arty_aoe', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.artillery.aoe', perRank: 0.03, mode: 'pct' }, baseCost: { money: 34000, steel: 20000, oil: 10000 }, baseSeconds: 12600, requires: ['doc_arty_dmg'] },
  { id: 'doc_arty_deploy', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.artillery.deploySpeed', perRank: 0.05, mode: 'pct' }, baseCost: { money: 30000, steel: 18000 }, baseSeconds: 10800, requires: ['doc_arty_range'] },
  { id: 'doc_reserve_recovery', track: T, tier: 3, maxRank: 6, effect: { key: 'support.reserveRecovery', perRank: 0.04, mode: 'pct' }, baseCost: { money: 20000, steel: 8000 }, baseSeconds: 7200, requires: [] },
];

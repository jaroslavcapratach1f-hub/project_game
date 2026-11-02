/**
 * DefenseTree — the "Defense" research track (GDD 04): wall HP, tower damage,
 * base HP regen, base-gun performance, garrison capacity, and Base Fury.
 *
 * `effect.key` 'defense.*' feeds base-defence tuning (BuildingConfig effects +
 * CombatConfig.BASE_DEFENSE). See DevelopmentTree header for node shape.
 * DRAFT — REVIEW.
 */

const T = 'defense';

export const DEFENSE_NODES = [
  { id: 'def_wall_hp', track: T, tier: 1, maxRank: 10, effect: { key: 'defense.wallHp', perRank: 0.03, mode: 'pct' }, baseCost: { money: 4000, steel: 3000 }, baseSeconds: 1080, requires: [] },
  { id: 'def_tower_damage', track: T, tier: 1, maxRank: 10, effect: { key: 'defense.towerDamage', perRank: 0.03, mode: 'pct' }, baseCost: { money: 4000, steel: 3000 }, baseSeconds: 1080, requires: [] },
  { id: 'def_base_regen', track: T, tier: 2, maxRank: 6, effect: { key: 'defense.baseHpRegen', perRank: 0.05, mode: 'pct' }, baseCost: { money: 8000, steel: 5000 }, baseSeconds: 1800, requires: ['def_wall_hp'] },
  { id: 'def_tower_rof', track: T, tier: 2, maxRank: 6, effect: { key: 'defense.towerRof', perRank: 0.03, mode: 'pct' }, baseCost: { money: 8000, steel: 5000 }, baseSeconds: 1800, requires: ['def_tower_damage'] },
  { id: 'def_base_gun_damage', track: T, tier: 2, maxRank: 8, effect: { key: 'defense.baseGunDamage', perRank: 0.03, mode: 'pct' }, baseCost: { money: 9000, steel: 6000 }, baseSeconds: 2100, requires: [] },
  { id: 'def_base_gun_range', track: T, tier: 3, maxRank: 4, effect: { key: 'defense.baseGunRange', perRank: 0.5, mode: 'flat' }, baseCost: { money: 20000, steel: 12000 }, baseSeconds: 7200, requires: ['def_base_gun_damage'] },
  { id: 'def_garrison_capacity', track: T, tier: 3, maxRank: 3, effect: { key: 'defense.garrisonCapacity', perRank: 1, mode: 'flat' }, baseCost: { money: 22000, steel: 14000 }, baseSeconds: 9000, requires: [] },
  { id: 'def_fury_duration', track: T, tier: 3, maxRank: 4, effect: { key: 'defense.baseFuryLinger', perRank: 15, mode: 'flat' }, baseCost: { money: 18000, steel: 11000 }, baseSeconds: 7200, requires: [] },
  { id: 'def_tower_count', track: T, tier: 4, maxRank: 3, effect: { key: 'defense.towerCount', perRank: 1, mode: 'flat' }, baseCost: { money: 40000, steel: 28000 }, baseSeconds: 14400, requires: ['def_tower_rof'] },
];

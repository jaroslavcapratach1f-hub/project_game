/**
 * SupportTree — the logistics research track (GDD 04: "additional research
 * sections unlock with game progress"): hospital, alliance reinforcement,
 * reserve recovery, officer EXP, and scout planes.
 *
 * `effect.key` 'support.*' feeds Hospital / Alliance Hall / Reserves Barracks /
 * Officer Barracks / AirBase tuning. See DevelopmentTree header for node shape.
 * DRAFT — REVIEW.
 */

const T = 'support';

export const SUPPORT_NODES = [
  { id: 'sup_hospital_capacity', track: T, tier: 1, maxRank: 8, effect: { key: 'support.hospitalCapacity', perRank: 0.04, mode: 'pct' }, baseCost: { money: 3500, steel: 2000 }, baseSeconds: 900, requires: [] },
  { id: 'sup_hospital_speed', track: T, tier: 1, maxRank: 8, effect: { key: 'support.repairSpeed', perRank: 0.04, mode: 'pct' }, baseCost: { money: 3500, steel: 2000 }, baseSeconds: 900, requires: [] },
  { id: 'sup_reserve_recovery', track: T, tier: 2, maxRank: 6, effect: { key: 'support.reserveRecovery', perRank: 0.04, mode: 'pct' }, baseCost: { money: 8000, steel: 3500 }, baseSeconds: 1800, requires: [] },
  { id: 'sup_reinforcement_capacity', track: T, tier: 2, maxRank: 6, effect: { key: 'support.assistCapacity', perRank: 0.05, mode: 'pct' }, baseCost: { money: 9000, steel: 5000 }, baseSeconds: 1800, requires: [] },
  { id: 'sup_officer_exp', track: T, tier: 2, maxRank: 5, effect: { key: 'support.officerExpGain', perRank: 0.05, mode: 'pct' }, baseCost: { money: 10000, oil: 4000 }, baseSeconds: 2100, requires: [] },
  { id: 'sup_scout_range', track: T, tier: 2, maxRank: 4, effect: { key: 'support.scoutRange', perRank: 1, mode: 'flat' }, baseCost: { money: 9000, oil: 5000 }, baseSeconds: 2100, requires: [] },
  { id: 'sup_reinforcement_slots', track: T, tier: 3, maxRank: 3, effect: { key: 'support.reinforcementSlots', perRank: 1, mode: 'flat' }, baseCost: { money: 24000, steel: 15000 }, baseSeconds: 9000, requires: ['sup_reinforcement_capacity'] },
  { id: 'sup_scout_duration', track: T, tier: 3, maxRank: 4, effect: { key: 'support.scoutDuration', perRank: 0.06, mode: 'pct' }, baseCost: { money: 20000, oil: 9000 }, baseSeconds: 7200, requires: ['sup_scout_range'] },
];

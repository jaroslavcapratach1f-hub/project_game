/**
 * OnslaughtConfig — the Onslaught alliance base-defense event (GDD 16 / 19).
 * Onslaught appears as an EVENT (not a mode): the alliance leader picks ONE
 * difficulty level for the whole alliance and schedules a start time; members
 * RSVP and join at kickoff, defending their own base on the world map against
 * escalating Legion waves. Score sums into an alliance bracket.
 *
 * This file is the tuning + the wave table. Spawning / the phase machine is the
 * (retargeted) src/skirmish director; nothing here touches PixiJS or state.
 * DRAFT — wave rosters use REAL UnitStats keys only.
 */

const DE = 'germany'; // the Legion fields German-pattern units for now (GDD 20)

/** Master event tuning — pacing + how the CALM waves reach the base. */
export const ONSLAUGHT = {
  legionFaction: DE,
  interWavePauseMs: 9000,      // lull between a cleared wave and the next "incoming"
  bannerLeadMs: 1600,          // "WAVE N INCOMING" holds this long before the spawn
  fieldRepairChargesBase: 2,   // limited between-wave repairs (scaled per level)
  // Base HP (GDD 16). Every enemy inside the compound sieges it; a clear
  // footprint heals after regenDelayMs. Run ends the wave HP hits 0. Flat
  // across difficulty for v1 (siege dps is not the raider's dmg). REVIEW.
  baseHp: { max: 6000, siegeDpsPerRaider: 60, regenPerSec: 120, regenDelayMs: 4000 },
  // Waves spawn CALM `approachTiles` north of the base and march on it.
  // FORWARD: spawn from real map edges / roads on the far side of the frontier.
  spawn: { approachTiles: 14, perRow: 4, colGapPx: 150, rowGapPx: 130, jitterPx: 20 },
  convergeInsetPx: 240,        // stop this far short of the base centre; Base Fury takes over
  bossWaves: [5, 10],          // milestone waves flagged to the HUD banner
};

/**
 * Difficulty levels — the alliance LEADER selects one for every member's run
 * (ONSLAUGHT_EVENT.levelSetBy). `powerScalar` multiplies every Legion unit's
 * combat stats at spawn; `countScalar` multiplies each wave group's count
 * (rounded, min 1); `commanderGate` is the min HQ level to be eligible.
 */
export const ONSLAUGHT_LEVELS = [
  { id: 1, name: 'Skirmish Line',    powerScalar: 1.0, countScalar: 1.0,  commanderGate: 5,  rewardMult: 1.0 },
  { id: 2, name: 'Firestorm',        powerScalar: 1.35, countScalar: 1.15, commanderGate: 10, rewardMult: 1.6 },
  { id: 3, name: 'Iron Tide',        powerScalar: 1.8,  countScalar: 1.3,  commanderGate: 16, rewardMult: 2.4 },
  { id: 4, name: 'Steel Reckoning',  powerScalar: 2.4,  countScalar: 1.5,  commanderGate: 22, rewardMult: 3.4 },
  { id: 5, name: 'Last Line',        powerScalar: 3.2,  countScalar: 1.75, commanderGate: 28, rewardMult: 4.8 },
];

/** Alliance-coordination rules for one event instance (GDD 19). */
export const ONSLAUGHT_EVENT = {
  windowDays: 4,                 // server calendar window the run must fall inside
  minMembers: 5,                 // alliance participation floor for bracket credit
  maxMembers: 50,
  levelSetBy: 'allianceLeader',  // one level for the whole alliance
  startTimeSetBy: 'allianceLeader', // leader schedules a kickoff inside the window
  rsvpLeadHours: 24,             // members confirm attendance ahead of kickoff
  syncCountdownMinutes: 15,      // shared countdown so members start together
  graceJoinMinutes: 30,          // latecomers may still start after kickoff
  oneRunPerMemberPerWindow: true,
  allianceBracket: true,         // summed member scores rank alliances
};

/**
 * The 10 waves (v1 — GDD 16 grows this to 15-20 later). `groups` counts are the
 * LEVEL-1 baseline; `resolveWave` applies the level's countScalar. Wave 1 is a
 * single-type probe; count and variety climb; bosses at 5 and 10.
 */
export const ONSLAUGHT_WAVES = [
  { number: 1,  groups: [{ unitKey: 'kar98k_squad', count: 2 }] },
  { number: 2,  groups: [{ unitKey: 'kar98k_squad', count: 3 }] },
  { number: 3,  groups: [{ unitKey: 'kar98k_squad', count: 4 }] },
  { number: 4,  groups: [{ unitKey: 'kar98k_squad', count: 4 }, { unitKey: 'gewehr43_squad', count: 2 }] },
  { number: 5,  groups: [{ unitKey: 'tiger_i', count: 1 }, { unitKey: 'panzer_iv', count: 2 }, { unitKey: 'kar98k_squad', count: 3 }] },
  { number: 6,  groups: [{ unitKey: 'panzer_iv', count: 3 }, { unitKey: 'gewehr43_squad', count: 3 }, { unitKey: 'pak40', count: 1 }] },
  { number: 7,  groups: [{ unitKey: 'tiger_i', count: 2 }, { unitKey: 'panzer_iv', count: 3 }, { unitKey: 'jagdpanther', count: 1 }] },
  { number: 8,  groups: [{ unitKey: 'stg44_squad', count: 5 }, { unitKey: 'jagdpanther', count: 2 }, { unitKey: 'pak40', count: 1 }] },
  { number: 9,  groups: [{ unitKey: 'tiger_i', count: 2 }, { unitKey: 'jagdpanther', count: 3 }, { unitKey: 'stg44_squad', count: 4 }] },
  { number: 10, groups: [{ unitKey: 'maus', count: 1 }, { unitKey: 'tiger_i', count: 2 }, { unitKey: 'jagdpanther', count: 2 }, { unitKey: 'stg44_squad', count: 3 }] },
];

export const ONSLAUGHT_WAVE_COUNT = ONSLAUGHT_WAVES.length;

/** @param {number} id @returns {object} the ONSLAUGHT_LEVELS entry (defaults to level 1) */
export function onslaughtLevel(id) {
  return ONSLAUGHT_LEVELS.find((l) => l.id === id) ?? ONSLAUGHT_LEVELS[0];
}

/**
 * The wave the director should spawn, scaled to the chosen alliance level.
 * @param {number} levelId ONSLAUGHT_LEVELS id
 * @param {number} waveNumber 1..ONSLAUGHT_WAVE_COUNT
 * @returns {{number:number, boss:boolean, powerScalar:number,
 *   groups:{unitKey:string,count:number}[]}}
 */
export function resolveWave(levelId, waveNumber) {
  const level = onslaughtLevel(levelId);
  const wave = ONSLAUGHT_WAVES.find((w) => w.number === waveNumber) ?? ONSLAUGHT_WAVES[0];
  return {
    number: wave.number,
    boss: ONSLAUGHT.bossWaves.includes(wave.number),
    powerScalar: level.powerScalar,
    groups: wave.groups.map((g) => ({
      unitKey: g.unitKey,
      count: Math.max(1, Math.round(g.count * level.countScalar)),
    })),
  };
}

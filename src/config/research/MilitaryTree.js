/**
 * MilitaryTree — the "Military" research track (the player's own real,
 * hand-specified tree, same shape `DevelopmentTree.js`'s own Industry tree
 * already established): a shared Reserves/Troop-stat trunk branching into
 * 3 parallel per-faction (Russian/German/US) lines — level cap, a faction
 * stat boost, firepower, then a shared Reserve Capacity node gating one
 * final per-faction level-cap tier. Every node carries real
 * `effect.perRankValues`/`powerPerRank` (the player's own exact, non-
 * linear numbers) and `minCenterLevel` (Research Center level, not HQ) —
 * see `DevelopmentTree.js`'s own header for the full model explanation;
 * `nodeCost`/`nodeSeconds` (`ResearchModel.js`) derive straight from each
 * rank's own real Power for any node carrying `powerPerRank`, track-
 * agnostic, so this tree automatically uses the exact same calibration
 * Industry's own tree does.
 *
 * Troops Cap nodes (`mil_<faction>_troops_cap_<40|60|80>`) are
 * deliberately `maxRank: 1` (the player's own explicit ask: "most
 * important researches so structure them in square... take example of
 * Industry research tree" — `ResearchTreeNode`'s own mechanical
 * maxRank===1 rule renders them as the bigger square milestone button,
 * plus a dedicated rank-chevron icon, `ResearchNodeIconDraw.js`).
 *
 * Every `powerPerRank` value is rounded to a clean "0"/"00" ending, always
 * UP (`DevelopmentTree.js`'s own header has the full rule) — almost every
 * number the player gave here already landed clean; only the root's own
 * 160 needed it (-> 200).
 */

const T = 'military';

export const MILITARY_NODES = [
  { id: 'mil_reserves_capacity', track: T, tier: 1, maxRank: 1, effect: { key: 'support.reservesCapacity', perRank: 400, mode: 'flat' }, powerPerRank: [200], minCenterLevel: 1, requires: [] },
  { id: 'mil_troop_hp', track: T, tier: 2, maxRank: 5, effect: { key: 'unit.all.hp', perRankValues: [0.005, 0.01, 0.02, 0.03, 0.05], mode: 'pct' }, powerPerRank: [260, 800, 1600, 2900, 5600], minCenterLevel: 1, requires: ['mil_reserves_capacity'] },
  { id: 'mil_troop_speed', track: T, tier: 2, maxRank: 5, effect: { key: 'unit.all.spd', perRankValues: [0.005, 0.01, 0.02, 0.03, 0.05], mode: 'pct' }, powerPerRank: [260, 800, 1600, 2900, 5600], minCenterLevel: 1, requires: ['mil_reserves_capacity'] },
  { id: 'mil_troop_firepower', track: T, tier: 2, maxRank: 5, effect: { key: 'unit.all.dmg', perRankValues: [0.005, 0.01, 0.02, 0.03, 0.05], mode: 'pct' }, powerPerRank: [260, 800, 1600, 2900, 5600], minCenterLevel: 1, requires: ['mil_reserves_capacity'] },
  { id: 'mil_russian_troops_cap_40', track: T, tier: 3, maxRank: 1, effect: { key: 'cap.levelCap.russian', perRank: 40, mode: 'flat' }, powerPerRank: [2700], minCenterLevel: 4, requires: [{ id: 'mil_troop_hp', rank: 2 }] },
  { id: 'mil_german_troops_cap_40', track: T, tier: 3, maxRank: 1, effect: { key: 'cap.levelCap.german', perRank: 40, mode: 'flat' }, powerPerRank: [2700], minCenterLevel: 4, requires: [{ id: 'mil_troop_speed', rank: 2 }] },
  { id: 'mil_us_troops_cap_40', track: T, tier: 3, maxRank: 1, effect: { key: 'cap.levelCap.us', perRank: 40, mode: 'flat' }, powerPerRank: [2700], minCenterLevel: 4, requires: [{ id: 'mil_troop_firepower', rank: 2 }] },
  { id: 'mil_russian_troops_hp', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.russian.hp', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [1000, 3000, 6000, 11000, 21000], minCenterLevel: 9, requires: [{ id: 'mil_russian_troops_cap_40', rank: 1 }, { id: 'mil_troop_hp', rank: 3 }] },
  { id: 'mil_german_troops_hp', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.german.hp', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [1000, 3000, 6000, 11000, 21000], minCenterLevel: 9, requires: [{ id: 'mil_german_troops_cap_40', rank: 1 }, { id: 'mil_troop_hp', rank: 3 }] },
  { id: 'mil_us_troops_hp', track: T, tier: 4, maxRank: 5, effect: { key: 'unit.us.hp', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [1000, 3000, 6000, 11000, 21000], minCenterLevel: 9, requires: [{ id: 'mil_us_troops_cap_40', rank: 1 }, { id: 'mil_troop_hp', rank: 3 }] },
  { id: 'mil_reserves_recovery_rate', track: T, tier: 5, maxRank: 5, effect: { key: 'support.reservesRecovery', perRankValues: [0.01, 0.03, 0.06, 0.10, 0.15], mode: 'pct' }, powerPerRank: [1000, 3000, 6000, 11000, 21000], minCenterLevel: 9, requires: [{ id: 'mil_russian_troops_hp', rank: 1 }, { id: 'mil_german_troops_hp', rank: 1 }, { id: 'mil_us_troops_hp', rank: 1 }] },
  { id: 'mil_russian_troops_cap_60', track: T, tier: 6, maxRank: 1, effect: { key: 'cap.levelCap.russian', perRank: 60, mode: 'flat' }, powerPerRank: [8500], minCenterLevel: 14, requires: [{ id: 'mil_reserves_recovery_rate', rank: 3 }] },
  { id: 'mil_german_troops_cap_60', track: T, tier: 6, maxRank: 1, effect: { key: 'cap.levelCap.german', perRank: 60, mode: 'flat' }, powerPerRank: [8500], minCenterLevel: 14, requires: [{ id: 'mil_reserves_recovery_rate', rank: 3 }] },
  { id: 'mil_us_troops_cap_60', track: T, tier: 6, maxRank: 1, effect: { key: 'cap.levelCap.us', perRank: 60, mode: 'flat' }, powerPerRank: [8500], minCenterLevel: 14, requires: [{ id: 'mil_reserves_recovery_rate', rank: 3 }] },
  { id: 'mil_russian_firepower', track: T, tier: 7, maxRank: 5, effect: { key: 'unit.russian.dmg', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [2500, 7500, 15000, 26000, 50000], minCenterLevel: 17, requires: [{ id: 'mil_russian_troops_cap_60', rank: 1 }] },
  { id: 'mil_german_firepower', track: T, tier: 7, maxRank: 5, effect: { key: 'unit.german.dmg', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [2500, 7500, 15000, 26000, 50000], minCenterLevel: 17, requires: [{ id: 'mil_german_troops_cap_60', rank: 1 }] },
  { id: 'mil_us_firepower', track: T, tier: 7, maxRank: 5, effect: { key: 'unit.us.dmg', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [2500, 7500, 15000, 26000, 50000], minCenterLevel: 17, requires: [{ id: 'mil_us_troops_cap_60', rank: 1 }] },
  { id: 'mil_reserves_capacity_2', track: T, tier: 8, maxRank: 10, effect: { key: 'support.reservesCapacity', perRankValues: [20, 40, 60, 80, 120, 160, 240, 320, 440, 600], mode: 'flat' }, powerPerRank: [700, 1500, 2800, 4700, 7800, 12500, 19000, 28000, 45000, 70000], minCenterLevel: 18, requires: [{ id: 'mil_russian_firepower', rank: 4 }, { id: 'mil_german_firepower', rank: 4 }, { id: 'mil_us_firepower', rank: 4 }] },
  { id: 'mil_russian_troops_cap_80', track: T, tier: 9, maxRank: 1, effect: { key: 'cap.levelCap.russian', perRank: 80, mode: 'flat' }, powerPerRank: [55000], minCenterLevel: 21, requires: [{ id: 'mil_reserves_capacity_2', rank: 4 }] },
  { id: 'mil_german_troops_cap_80', track: T, tier: 9, maxRank: 1, effect: { key: 'cap.levelCap.german', perRank: 80, mode: 'flat' }, powerPerRank: [55000], minCenterLevel: 21, requires: [{ id: 'mil_reserves_capacity_2', rank: 4 }] },
  { id: 'mil_us_troops_cap_80', track: T, tier: 9, maxRank: 1, effect: { key: 'cap.levelCap.us', perRank: 80, mode: 'flat' }, powerPerRank: [55000], minCenterLevel: 21, requires: [{ id: 'mil_reserves_capacity_2', rank: 4 }] },
];

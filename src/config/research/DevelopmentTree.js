/**
 * DevelopmentTree — the "Industry" research track (the player's own real,
 * hand-specified tree): resource collection site tiers, collection trucks,
 * and gather/production/research speed, branching from one root all the
 * way to Research Center level 20. Every node's own exact % (or flat)
 * value and Power gain PER RANK is the player's own given number
 * (`effect.perRankValues`/`powerPerRank`, index 0 = rank 1) — NOT the
 * generic linear `PowerConfig.researchPower`/constant-`effect.perRank`
 * model every other track still uses. `nodeCost`/`nodeSeconds`
 * (`ResearchModel.js`) derive straight from each rank's own real Power for
 * any node carrying `powerPerRank` — the player's own explicit
 * instruction ("time required... depends on the power... structure it
 * properly according to first given research time"), calibrated off this
 * tree's own very first research (15 min) — see `ResearchModel.js`'s own
 * `SECONDS_PER_POWER`.
 *
 * Gated by the live RESEARCH CENTER building level (`minCenterLevel`), NOT
 * headquarters level — `tier` here is purely a visual depth number for
 * `ResearchTreeView`'s own row layout, not an HQ-level gate (every node
 * sets its own `minCenterLevel` explicitly, so none of them ever fall back
 * to the shared `TIER_HQ_GATE` table). A `requires` entry is `{id, rank}`
 * where the player's own description names a SPECIFIC rank (e.g. "After
 * Resource Collection Speed lvl1" — not the full 5 ranks); a plain id
 * string still means "fully maxed", same as every other track.
 *
 * Collection Truck / Resource Collection Sites are deliberately `maxRank:
 * 1` (the player's own explicit ask: these pivotal unlocks render as the
 * bigger square "milestone" button — `ResearchTreeNode`'s own mechanical
 * maxRank===1 rule, no hand-authored flag needed).
 *
 * Every `powerPerRank` value is rounded to a clean "0" (2-digit) or "00"
 * (3+ digit) ending (the player's own explicit instruction: "each number
 * ends with either 0 on small numbers or 00 on bigger numbers") — always
 * rounded UP, never down ("always use higher number to convert"), so the
 * ORIGINAL given numbers (e.g. 29, 2949, 18180) are superseded here.
 */

const T = 'development';

export const DEVELOPMENT_NODES = [
  { id: 'dev_resource_collection_sites_2', track: T, tier: 1, maxRank: 1, effect: { key: 'gather.siteTier', perRank: 1, mode: 'flat' }, powerPerRank: [30], minCenterLevel: 1, requires: [] },
  { id: 'dev_resource_collection_speed', track: T, tier: 2, maxRank: 5, effect: { key: 'gather.speed', perRankValues: [0.005, 0.01, 0.02, 0.03, 0.05], mode: 'pct' }, powerPerRank: [30, 90, 200, 400, 700], minCenterLevel: 1, requires: ['dev_resource_collection_sites_2'] },
  { id: 'dev_tech_research_speed', track: T, tier: 2, maxRank: 5, effect: { key: 'research.speed', perRankValues: [0.005, 0.01, 0.02, 0.03, 0.05], mode: 'pct' }, powerPerRank: [30, 90, 200, 400, 700], minCenterLevel: 1, requires: ['dev_resource_collection_sites_2'] },
  { id: 'dev_collection_truck', track: T, tier: 3, maxRank: 1, effect: { key: 'gather.trucks', perRank: 1, mode: 'flat' }, powerPerRank: [3000], minCenterLevel: 6, requires: [{ id: 'dev_resource_collection_speed', rank: 1 }] },
  { id: 'dev_resource_collection_sites_3', track: T, tier: 3, maxRank: 1, effect: { key: 'gather.siteTier', perRank: 1, mode: 'flat' }, powerPerRank: [3000], minCenterLevel: 6, requires: [{ id: 'dev_tech_research_speed', rank: 1 }] },
  { id: 'dev_resource_collection_speed_2', track: T, tier: 4, maxRank: 5, effect: { key: 'gather.speed', perRankValues: [0.01, 0.02, 0.03, 0.05, 0.08], mode: 'pct' }, powerPerRank: [200, 500, 1000, 1900, 3500], minCenterLevel: 7, requires: ['dev_collection_truck', 'dev_resource_collection_sites_3'] },
  { id: 'dev_money_gathering_speed', track: T, tier: 5, maxRank: 5, effect: { key: 'gather.moneySpeed', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [70, 200, 400, 800, 1400], minCenterLevel: 8, requires: [{ id: 'dev_resource_collection_speed_2', rank: 1 }] },
  { id: 'dev_steel_gathering_speed', track: T, tier: 5, maxRank: 5, effect: { key: 'gather.steelSpeed', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [70, 200, 400, 800, 1400], minCenterLevel: 8, requires: [{ id: 'dev_resource_collection_speed_2', rank: 1 }] },
  { id: 'dev_oil_gathering_speed', track: T, tier: 5, maxRank: 5, effect: { key: 'gather.oilSpeed', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [70, 200, 400, 800, 1400], minCenterLevel: 8, requires: [{ id: 'dev_resource_collection_speed_2', rank: 1 }] },
  { id: 'dev_resources_production_speed', track: T, tier: 6, maxRank: 5, effect: { key: 'econ.productionSpeed', perRankValues: [0.01, 0.02, 0.04, 0.06, 0.10], mode: 'pct' }, powerPerRank: [500, 1500, 3000, 5500, 10500], minCenterLevel: 11, requires: [{ id: 'dev_money_gathering_speed', rank: 2 }, { id: 'dev_steel_gathering_speed', rank: 2 }, { id: 'dev_oil_gathering_speed', rank: 2 }] },
  { id: 'dev_collection_truck_2', track: T, tier: 7, maxRank: 1, effect: { key: 'gather.trucks', perRank: 1, mode: 'flat' }, powerPerRank: [3600], minCenterLevel: 13, requires: [{ id: 'dev_resources_production_speed', rank: 2 }] },
  { id: 'dev_resource_collection_sites_4', track: T, tier: 7, maxRank: 1, effect: { key: 'gather.siteTier', perRank: 1, mode: 'flat' }, powerPerRank: [3600], minCenterLevel: 13, requires: [{ id: 'dev_resources_production_speed', rank: 2 }] },
  { id: 'dev_money_gathering_speed_2', track: T, tier: 8, maxRank: 5, effect: { key: 'gather.moneySpeed', perRankValues: [0.01, 0.03, 0.06, 0.10, 0.15], mode: 'pct' }, powerPerRank: [600, 1700, 3300, 6000, 11400], minCenterLevel: 15, requires: ['dev_collection_truck_2', 'dev_resource_collection_sites_4'] },
  { id: 'dev_steel_gathering_speed_2', track: T, tier: 8, maxRank: 5, effect: { key: 'gather.steelSpeed', perRankValues: [0.01, 0.03, 0.06, 0.10, 0.15], mode: 'pct' }, powerPerRank: [600, 1700, 3300, 6000, 11400], minCenterLevel: 15, requires: ['dev_collection_truck_2', 'dev_resource_collection_sites_4'] },
  { id: 'dev_oil_gathering_speed_2', track: T, tier: 8, maxRank: 5, effect: { key: 'gather.oilSpeed', perRankValues: [0.01, 0.03, 0.06, 0.10, 0.15], mode: 'pct' }, powerPerRank: [600, 1700, 3300, 6000, 11400], minCenterLevel: 15, requires: ['dev_collection_truck_2', 'dev_resource_collection_sites_4'] },
  { id: 'dev_collection_speed_3', track: T, tier: 9, maxRank: 5, effect: { key: 'gather.speed', perRankValues: [0.01, 0.03, 0.05, 0.08, 0.13], mode: 'pct' }, powerPerRank: [1000, 2900, 5700, 10400, 19800], minCenterLevel: 16, requires: [{ id: 'dev_money_gathering_speed_2', rank: 3 }, { id: 'dev_steel_gathering_speed_2', rank: 3 }, { id: 'dev_oil_gathering_speed_2', rank: 3 }] },
  { id: 'dev_collection_truck_3', track: T, tier: 10, maxRank: 1, effect: { key: 'gather.trucks', perRank: 1, mode: 'flat' }, powerPerRank: [18200], minCenterLevel: 16, requires: [{ id: 'dev_collection_speed_3', rank: 3 }] },
  { id: 'dev_resource_collection_sites_5', track: T, tier: 10, maxRank: 1, effect: { key: 'gather.siteTier', perRank: 1, mode: 'flat' }, powerPerRank: [18200], minCenterLevel: 16, requires: [{ id: 'dev_collection_speed_3', rank: 3 }] },
  { id: 'dev_resources_production_speed_2', track: T, tier: 11, maxRank: 10, effect: { key: 'econ.productionSpeed', perRankValues: [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10, 0.12, 0.15], mode: 'pct' }, powerPerRank: [300, 800, 1300, 2200, 3600, 5700, 8500, 12800, 19800, 31100], minCenterLevel: 19, requires: [{ id: 'dev_collection_truck_3', rank: 1 }] },
  { id: 'dev_tech_research_speed_2', track: T, tier: 11, maxRank: 10, effect: { key: 'research.speed', perRankValues: [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.10, 0.12, 0.15], mode: 'pct' }, powerPerRank: [300, 800, 1300, 2200, 3600, 5700, 8500, 12800, 19800, 31100], minCenterLevel: 19, requires: [{ id: 'dev_resource_collection_sites_5', rank: 1 }] },
  { id: 'dev_collection_speed_4', track: T, tier: 12, maxRank: 10, effect: { key: 'gather.speed', perRankValues: [0.01, 0.02, 0.03, 0.04, 0.06, 0.08, 0.10, 0.12, 0.15, 0.20], mode: 'pct' }, powerPerRank: [500, 1200, 2100, 3500, 5700, 9100, 13700, 20500, 31800, 50000], minCenterLevel: 20, requires: [{ id: 'dev_resources_production_speed_2', rank: 4 }, { id: 'dev_tech_research_speed_2', rank: 4 }] },
];

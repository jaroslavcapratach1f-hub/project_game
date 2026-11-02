/**
 * research/ barrel — merges the five research trees into one lookup and
 * re-exports the shared model. Import from here.
 *
 * EFFECT-KEY ROUTING (which system consumes a completed node's effect):
 *   econ.*      -> EconomyConfig production / ResourceConfig storage
 *   gather.*    -> EconomyConfig.GATHER
 *   build.* / material.* -> BuildingConfig / MaterialsConfig
 *   research.*  -> Research Center speed
 *   field.*     -> world-map movement
 *   unit.all.*  -> StatResolution `research` layer, every class
 *   unit.<branch>.* -> StatResolution `research` layer, matching classes only
 *   unit.<faction>.* -> StatResolution `research` layer, that faction's own roster only (russian/german/us)
 *   cap.*       -> StarTiers.playableLevelCap / GameConfig.LIMITS
 *   cap.levelCap.<faction> -> that faction's own playable level cap
 *   defense.*   -> BuildingConfig defence effects + CombatConfig.BASE_DEFENSE
 *   support.*   -> Hospital / Alliance Hall / Reserves / Officer Barracks / AirBase
 *   support.reservesCapacity / support.reservesRecovery -> PersonnelManager (the shared reserve pool)
 */

export * from './ResearchModel.js';

import { TIER_HQ_GATE, reqId } from './ResearchModel.js';
import { DEVELOPMENT_NODES } from './DevelopmentTree.js';
import { MILITARY_NODES } from './MilitaryTree.js';
import { DOCTRINE_NODES } from './DoctrineTree.js';
import { DEFENSE_NODES } from './DefenseTree.js';
import { SUPPORT_NODES } from './SupportTree.js';

export const RESEARCH_NODES = [
  ...DEVELOPMENT_NODES,
  ...MILITARY_NODES,
  ...DOCTRINE_NODES,
  ...DEFENSE_NODES,
  ...SUPPORT_NODES,
];

/** Doctrine branch -> the unit classes it applies to. */
export const DOCTRINE_BRANCH_CLASSES = {
  infantry: ['infantry'],
  armor: ['lightTank', 'mediumTank', 'heavyTank', 'superHeavyTank', 'tankHunter'],
  artillery: ['howitzer', 'launcher', 'atGun'],
};

const BY_ID = new Map(RESEARCH_NODES.map((n) => [n.id, n]));

/** @param {string} id @returns {object|undefined} */
export function researchNode(id) {
  return BY_ID.get(id);
}

/** @param {string} track @returns {object[]} */
export function nodesInTrack(track) {
  return RESEARCH_NODES.filter((n) => n.track === track);
}

/**
 * @param {string} id
 * @param {(nodeId:string)=>number} rankOf live rank lookup (0 if never started) — e.g. `ResearchManager.rankOf`
 * @param {number} hqLevel
 * @param {number} [centerLevel] live Research Center building level — only read for nodes carrying their own `minCenterLevel`
 * @returns {boolean} whether this node can be started now
 */
export function canResearch(id, rankOf, hqLevel, centerLevel = 0) {
  const node = BY_ID.get(id);
  if (!node) return false;
  const gateOk = node.minCenterLevel !== undefined
    ? centerLevel >= node.minCenterLevel
    : hqLevel >= (TIER_HQ_GATE[node.tier] ?? Infinity);
  if (!gateOk) return false;
  return node.requires.every((r) => {
    const id2 = reqId(r), req = BY_ID.get(id2);
    const needRank = typeof r === 'string' ? (req?.maxRank ?? 1) : (r.rank ?? req?.maxRank ?? 1);
    return rankOf(id2) >= needRank;
  });
}

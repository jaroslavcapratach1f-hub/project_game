/**
 * CommandCenterProgression — pure read-only helpers over BaseManager's live
 * `buildings` array: how many Build Points the base has actually earned
 * (always derived off real building state — see BuildingLevelOverrides'
 * `totalBuildPoints`, never a separately-stored counter) and whether the
 * headquarters can advance to the next level right now. No class of its
 * own — same "plain functions over data I don't own" shape as
 * buildingUpgrade.js, for the same reason (keep BaseManager thin).
 */
import { effectiveMaxLevel } from '../config/BuildingConfig.js';
import { levelOverride, totalBuildPoints } from '../config/BuildingLevelOverrides.js';
import { commandCenterBpRequired } from '../config/CommandCenterConfig.js';

/**
 * @param {{id:string,level:number}[]} buildings BaseManager.buildings
 * @param {number} hqLevel current headquarters level
 * @returns {{current:number, next:number, bp:number, required:?number, canAdvance:boolean}}
 */
export function commandCenterProgress(buildings, hqLevel) {
  const bp = totalBuildPoints(buildings);
  const required = commandCenterBpRequired(hqLevel + 1);
  return {
    current: hqLevel,
    next: hqLevel + 1,
    bp,
    required, // null = not yet configured for this transition — no gate yet
    canAdvance: required !== null && bp >= required,
  };
}

/**
 * Buildings whose NEXT level is both reachable right now (HQ-level capped,
 * same rule as the real upgrade path) and has a confirmed Build Point
 * award — the Command Center screen's "recommended actions" list. Only
 * ever surfaces confirmed data; a building with no configured next-level
 * award simply doesn't appear (never a guessed entry).
 * @param {{id:string,level:number}[]} buildings @param {number} hqLevel
 * @returns {{id:string,level:number,nextLevel:number,buildPoints:number}[]}
 */
export function recommendedBuildPointActions(buildings, hqLevel) {
  const out = [];
  for (const b of buildings) {
    const nextLevel = b.level + 1;
    if (nextLevel > effectiveMaxLevel(b.id, hqLevel)) continue;
    const bp = levelOverride(b.id, nextLevel)?.buildPoints;
    if (bp) out.push({ id: b.id, level: b.level, nextLevel, buildPoints: bp });
  }
  return out;
}

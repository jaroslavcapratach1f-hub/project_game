/**
 * OfficerConfig — commander numbers: star tiers, skill-unlock milestones, the
 * talent layer, the EXP curve, and the additive stat-bonus math.
 *
 * Officers add a percentage buff to ALL stats of their assigned troop, feed
 * the ONE additive bucket in StatResolution, and are hard-capped there by
 * BONUS_CAPS.officerTotal. DRAFT: caps and curves are proposals. REVIEW.
 */

export const OFFICER_TIER = {
  '3': { maxLevel: 60, actives: 1, passives: 1, talentNodes: 3 },
  '4': { maxLevel: 80, actives: 2, passives: 2, talentNodes: 6 },
  '5': { maxLevel: 100, actives: 2, passives: 3, talentNodes: 10 },
};

/** Each officer level grants this fraction to ALL stats of the assigned troop. */
export const PER_LEVEL_ALL_STATS = 0.005;

export const SLOT_EFFECTIVENESS = { primary: 1.0, secondary: 0.7 };
export const FACTION_MATCH = { same: 1.0, different: 0.5 };
export const TWO_SAME_FACTION_BONUS = 0.1;  // both officers same faction, flat
export const SPECIALTY_BONUS = 0.08;        // officer's best-for class matches troop
export const PROMOTE_SHARDS = { '3->4': 50, '4->5': 150 };

/** Skill unlock levels by star tier. */
export const SKILL_UNLOCKS = {
  '3': { active1: 1, passive1: 10 },
  '4': { active1: 1, passive1: 5, active2: 20, passive2: 40 },
  '5': { active1: 1, passive1: 5, active2: 20, passive2: 45, passive3: 70 },
};

/**
 * Talent layer — small single-stat nodes unlocked past the skill milestones.
 * Node catalog ships with the officer system; this is the shape and pacing.
 */
export const TALENTS = {
  firstNodeLevel: 15,
  nodeEveryLevels: 10,
  maxNodeBonus: 0.04,
  categories: ['firepower', 'protection', 'mobility', 'support'],
};

/** Officer EXP required to go from `level` to `level + 1`. */
export const OFFICER_EXP = { base: 120, growth: 1.08 };

/** @param {number} level @returns {number} */
export function officerExpToNext(level) {
  return Math.round(OFFICER_EXP.base * Math.pow(OFFICER_EXP.growth, Math.max(0, level - 1)));
}

/**
 * Total additive officer bonus for a troop, BEFORE the officerTotal cap in
 * StatResolution.BONUS_CAPS.
 * @param {object} p { primaryLevel, primaryMatch, secondaryLevel, secondaryMatch,
 *                      bothSameFaction, primarySpecialtyMatch }
 * @returns {number} fraction, e.g. 0.35
 */
export function officerBonus(p) {
  const prim =
    (p.primaryLevel ?? 0) * PER_LEVEL_ALL_STATS * SLOT_EFFECTIVENESS.primary *
    (p.primaryMatch ? FACTION_MATCH.same : FACTION_MATCH.different);
  const sec =
    (p.secondaryLevel ?? 0) * PER_LEVEL_ALL_STATS * SLOT_EFFECTIVENESS.secondary *
    (p.secondaryMatch ? FACTION_MATCH.same : FACTION_MATCH.different);
  const duo = p.bothSameFaction ? TWO_SAME_FACTION_BONUS : 0;
  const specialty = p.primarySpecialtyMatch ? SPECIALTY_BONUS : 0;
  return prim + sec + duo + specialty;
}

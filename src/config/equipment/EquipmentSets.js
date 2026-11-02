/**
 * EquipmentSets — wearing multiple parts of one family grants a set bonus.
 * With only 3 slots, 2-piece and 3-piece are the meaningful breakpoints.
 *
 * Each bonus entry is { statKey, mode, value }. 'pct' bonuses feed
 * equipmentPct (capped in StatResolution); 'flat' feed equipmentFlat.
 * A troop can complete at most one 3-piece set. DRAFT — REVIEW.
 */

export const SETS = {
  blitz: {
    name: 'Blitz Doctrine',
    2: [{ statKey: 'spd', mode: 'pct', value: 0.08 }],
    3: [{ statKey: 'dmg', mode: 'pct', value: 0.1 }, { statKey: 'rof', mode: 'pct', value: 0.06 }],
  },
  bulwark: {
    name: 'Bulwark',
    2: [{ statKey: 'hp', mode: 'pct', value: 0.08 }],
    3: [{ statKey: 'armor', mode: 'pct', value: 0.12 }, { statKey: 'def', mode: 'flat', value: 12 }],
  },
  marksman: {
    name: 'Marksman',
    2: [{ statKey: 'rng', mode: 'pct', value: 0.06 }],
    3: [{ statKey: 'acc', mode: 'pct', value: 0.1 }, { statKey: 'dmg', mode: 'pct', value: 0.06 }],
  },
  assault: {
    name: 'Assault',
    2: [{ statKey: 'dmg', mode: 'pct', value: 0.09 }],
    3: [{ statKey: 'dmg', mode: 'pct', value: 0.12 }, { statKey: 'rof', mode: 'pct', value: 0.05 }],
  },
  hunter: {
    name: 'Tank Hunter',
    2: [{ statKey: 'pen', mode: 'pct', value: 0.1 }],
    3: [{ statKey: 'pen', mode: 'pct', value: 0.15 }, { statKey: 'dmg', mode: 'pct', value: 0.05 }],
  },
  siege: {
    name: 'Siege Crew',
    2: [{ statKey: 'hp', mode: 'pct', value: 0.06 }],
    3: [{ statKey: 'dodge', mode: 'pct', value: 0.06 }, { statKey: 'rng', mode: 'pct', value: 0.06 }],
  },
};

/**
 * @param {string[]} equippedFamilies  the family of each equipped part (0..3)
 * @returns {Array<{family:string,pieces:number,bonuses:object[]}>}
 */
export function activeSetBonuses(equippedFamilies) {
  const counts = {};
  for (const f of equippedFamilies) counts[f] = (counts[f] ?? 0) + 1;
  const out = [];
  for (const family in counts) {
    const n = counts[family];
    const set = SETS[family];
    if (!set) continue;
    if (n >= 3 && set[3]) out.push({ family, pieces: 3, bonuses: set[3] });
    else if (n >= 2 && set[2]) out.push({ family, pieces: 2, bonuses: set[2] });
  }
  return out;
}

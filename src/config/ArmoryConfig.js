/**
 * ArmoryConfig — troop crate rates, officer crate rates, pity, the time-gated
 * drop pool, and blueprint-fragment payouts.
 *
 * PITY and DROP_POOL follow GDD 08. DROP_RATES, OFFICER_* and CRATE_UNLOCK are
 * proposals (GDD 08 "milestones TBD"). REVIEW.
 */

export const PITY = {
  threshold: 100,   // pulls to guarantee a 5-star (GDD 08)
  maxBanked: 300,   // 300/100 hoarding allowed (GDD 08)
  countryCratePicksNation: true, // late-game 100/100 in a country crate: choose nation
};

/** Troop crate per-pull probability. Keys are StarTiers ladder keys. Sums to 1. */
export const DROP_RATES = {
  '5': 0.02,
  '4.5': 0.08,
  '4': 0.30,
  '3': 0.60,
};

export const OFFICER_PITY = { threshold: 60, maxBanked: 120 };
export const OFFICER_DROP_RATES = { '5': 0.02, '4': 0.14, '3': 0.84 };

/** Duplicate pulls auto-convert to shards. */
export const DUPLICATE_TO_SHARDS = { officer: { '3': 20, '4': 40, '5': 80 } };

/** Blueprint fragments awarded alongside each open (see PartsConfig.BLUEPRINT). */
export const BLUEPRINT_FRAGMENTS = { perSingle: 2, perTen: 25 };

export const CRATES = ['general', 'germany', 'usa', 'russia'];

/** Country-crate unlock gates. REVIEW — GDD 08 leaves these TBD. */
export const CRATE_UNLOCK = {
  general: { serverDay: 1, baseLevel: 1 },
  germany: { serverDay: 4, baseLevel: 6 },
  usa: { serverDay: 4, baseLevel: 6 },
  russia: { serverDay: 4, baseLevel: 6 },
};

/** GDD 08 time gate — drop-pool categories (class keys), not individual units. */
export const DROP_POOL = {
  day1to9: ['infantry', 'mediumTank', 'heavyTank', 'tankHunter'],
  day10plus: ['superHeavyTank', 'howitzer', 'atGun', 'lightTank', 'launcher'],
};

/** Arms Coupons per crate open. REVIEW — GDD 07: "Source TBD". */
export const PULL_COST = { single: 1, ten: 10 };

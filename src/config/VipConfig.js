/**
 * VipConfig — VIP is permanently active (master-task section 14): no
 * tokens, no countdown, no renewal. `VIP_LEVELS[n]` lists ONLY the
 * modifiers/unlocks the player's own reference confirms AT level n — NOT a
 * cumulative total. A modifier not re-listed at a later level is not reset;
 * `VipProgression.vipModifier`/`vipFlag` look backward for the most
 * recently defined value (section 18: VIP11's Steel Collection Speed +25%
 * is the CURRENT total, never 5+10+15+20+25 summed together).
 *
 * VIP 10 is confirmed UNKNOWN (section 15) — kept as an empty placeholder
 * so level IDs stay sequential; it contributes nothing of its own but
 * never drops anything already confirmed at VIP 9.
 *
 * VIP 14 and 15 each have one further CONFIRMED-to-exist-but-obscured
 * benefit the player could not read off their own reference — left out
 * rather than guessed (master-task section 27).
 *
 * Percent fields are fractions (0.05 = 5%), matching GameConfig's own
 * convention. Flag fields are `true` once unlocked and OR together across
 * every level up to the player's current one (an unlock is never lost).
 */
export const VIP_LEVELS = {
  0: { moneyCollectionSpeed: 0.05, steelCollectionSpeed: 0.05, oilCollectionSpeed: 0.05, unlockInvestments: true },
  1: { moneyCollectionSpeed: 0.10, steelCollectionSpeed: 0.05, oilCollectionSpeed: 0.05, energyRecoveryRate: 0.05, unlockMayhemSpecial: true, unlockDailySpecials: true, unlockInvestments: true },
  2: { moneyCollectionSpeed: 0.10, steelCollectionSpeed: 0.10, oilCollectionSpeed: 0.05, energyRecoveryRate: 0.05, unitCapacity: 30, partsCapacity: 50, unlockInvestments: true },
  3: { moneyCollectionSpeed: 0.10, steelCollectionSpeed: 0.10, oilCollectionSpeed: 0.10, energyRecoveryRate: 0.05, unitCapacity: 30, productionSpeed: 0.02, unlockTrainingRegimen: true },
  4: { moneyCollectionSpeed: 0.15, steelCollectionSpeed: 0.10, energyRecoveryRate: 0.10, industryResearchSpeed: 0.05, dailyRapidResupplyLimit: 2, navalRapidResupplyLimit: 2, unlockClaimAllOfficerMission: true },
  5: { moneyCollectionSpeed: 0.15, steelCollectionSpeed: 0.15, productionSpeed: 0.04, militaryResearchSpeed: 0.05, productionQueueLength: 5, dailyArenaChallenges: 1, unlockMayhemSpecialReload: true },
  6: { oilCollectionSpeed: 0.15, unitCapacity: 50, partsCapacity: 100, industryResearchSpeed: 0.07, officerMissionExp: 0.05, campPrestige: 0.05, unlockQuickSelectionOfficerMissions: true },
  7: { moneyCollectionSpeed: 0.20, productionSpeed: 0.06, militaryResearchSpeed: 0.07, productionQueueLength: 10, troopSpeed: 0.05, unlockQuickUpgrade: true, unlockSmartAssembly: true },
  8: { steelCollectionSpeed: 0.20, energyRecoveryRate: 0.15, dailyRapidResupplyLimit: 3, airliftLimit: 1, covertMasonsPactReady: true, unlockQuickModify: true, unlockQuickDeployOfficerMissions: true },
  9: { oilCollectionSpeed: 0.20, industryResearchSpeed: 0.10, productionSpeed: 0.08, officerMissionExp: 0.07, campPrestige: 0.07, troopFirepower: 0.05, dailyArenaChallenges: 2 },
  10: {}, // UNKNOWN — do not invent (section 15)
  11: { steelCollectionSpeed: 0.25, energyRecoveryRate: 0.20, productionSpeed: 0.10, troopSpeed: 0.07, troopHp: 0.05, unlockSingleTapProduction: true, unlockGiftCardGifting: true },
  12: { oilCollectionSpeed: 0.25, industryResearchSpeed: 0.15, dailyRapidResupplyLimit: 4, navalRapidResupplyLimit: 4, officerMissionExp: 0.10, campPrestige: 0.10, damageIntensity: 0.05 },
  13: { moneyCollectionSpeed: 0.30, unitCapacity: 100, militaryResearchSpeed: 0.15, productionQueueLength: 60, reservesCapacity: 2000, dailyArenaChallenges: 3, monthlyGiftCardSendLimit: 20000 },
  14: { steelCollectionSpeed: 0.30, energyRecoveryRate: 0.25, partsCapacity: 200, troopSpeed: 0.10, damageResistance: 0.05, airdropStorageCapacity: 2 }, // one further benefit is obscured in the reference — not guessed
  15: { oilCollectionSpeed: 0.30, unitCapacity: 150, partsCapacity: 250, dailyRapidResupplyLimit: 5, airliftLimit: 2, reservesRecoveryRate: 1.0 }, // a further Naval Resupply benefit is partially obscured — not guessed
};

/** Highest VIP level with any confirmed data — lookups never scan past this. */
export const VIP_MAX_CONFIRMED_LEVEL = 15;

/** Boolean-flag keys — OR'd across every level up to current, never "most recent only" (an unlock is permanent, never dropped). */
export const VIP_FLAG_KEYS = new Set([
  'unlockInvestments', 'unlockMayhemSpecial', 'unlockDailySpecials', 'unlockTrainingRegimen',
  'unlockClaimAllOfficerMission', 'unlockMayhemSpecialReload', 'unlockQuickSelectionOfficerMissions',
  'unlockQuickUpgrade', 'unlockSmartAssembly', 'unlockQuickModify', 'unlockQuickDeployOfficerMissions',
  'unlockSingleTapProduction', 'unlockGiftCardGifting', 'covertMasonsPactReady',
]);

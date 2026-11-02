/**
 * VipPackagesConfig — one-time purchase packages tied to a VIP level,
 * wholly separate from the permanent benefits in VipConfig.js (master-task
 * section 16: reaching a VIP level is permanent; its package is a single
 * optional purchase, tracked independently). Only the player's own
 * confirmed reference data lives here — every other VIP level's package,
 * and the VIP11-15 prices, are unconfigured (`price: null`) until real
 * numbers are supplied; never guessed (master-task section 27).
 */

/** @typedef {{price:?number, currency:?string, purchaseLimit:number, rewards:{item:string,qty:number}[]}} VipPackage */

/** @type {Object<number, VipPackage>} VIP level -> its one-time purchase package */
export const VIP_PACKAGES = {
  1: {
    price: 2.99, currency: 'AED', purchaseLimit: 1,
    rewards: [{ item: 'guardianOfTruthStatue', qty: 10 }, { item: 'basicOfficerExp', qty: 20 }],
  },
  11: {
    price: null, currency: null, purchaseLimit: 1, // price NOT confirmed
    rewards: [{ item: 'lowe', qty: 2 }, { item: 'random5StarVanguardUnit', qty: 4 }, { item: '105mmKwkL52', qty: 1 }, { item: 'advancedOfficerExp', qty: 20 }],
  },
  12: {
    price: null, currency: null, purchaseLimit: 1,
    rewards: [{ item: 'lowe', qty: 2 }, { item: 'random5StarVanguardUnit', qty: 4 }, { item: 'couplerLock', qty: 1 }, { item: 'advancedOfficerExp', qty: 20 }],
  },
  13: {
    price: null, currency: null, purchaseLimit: 1,
    rewards: [{ item: 'lowe', qty: 2 }, { item: 'random5StarVanguardUnit', qty: 20 }, { item: 'weldedArmorPlate25mm', qty: 1 }, { item: 'expertOfficerExp', qty: 10 }],
  },
  14: {
    price: null, currency: null, purchaseLimit: 1,
    rewards: [{ item: 'lowe', qty: 2 }, { item: 'random5StarVanguardUnit', qty: 30 }, { item: 'campCoupon', qty: 50 }, { item: 'e100Suspension', qty: 1 }, { item: 'expertOfficerExp', qty: 20 }],
  },
  15: {
    price: null, currency: null, purchaseLimit: 1,
    rewards: [{ item: 'lowe', qty: 2 }, { item: 'random5StarVanguardUnit', qty: 30 }, { item: 'campCoupon', qty: 50 }, { item: 'kwkL50_128mm', qty: 1 }, { item: 'expertOfficerExp', qty: 20 }],
  },
};

/** @param {number} vipLevel @returns {?VipPackage} the confirmed package, or null if unconfigured */
export function vipPackage(vipLevel) {
  return VIP_PACKAGES[vipLevel] ?? null;
}

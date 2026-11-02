/**
 * VipProgression — the central VIP modifier/flag resolver (master-task
 * section 18): every gameplay system should ask `vipModifier`/`vipFlag`
 * instead of independently checking `if (vipLevel >= X)` scattered through
 * the codebase. VIP is permanently active and never decays (section 14) —
 * `VipState` holds only a current level, never an activation/countdown.
 *
 * VIP POINTS (how a player actually climbs levels) are NOT implemented:
 * the player's own reference explicitly labels "Today's Points" / "1,505 /
 * 6,000" as PLAYER-STATE examples, not configuration (section 17) — no
 * level-up point thresholds exist anywhere to build from. `setLevel` is
 * the only way to move a player right now; wiring real VIP-point accrual
 * is a separate, still-unconfigured system.
 *
 * NOTE: nothing in the game actually CONSUMES these modifiers yet (no
 * ResourceManager/combat/training call site reads them) — this file is the
 * correct, centralized resolver so that wiring, when it happens, never
 * needs a second `if (vip >= X)` pattern anywhere else.
 */
import { VIP_LEVELS, VIP_FLAG_KEYS, VIP_MAX_CONFIRMED_LEVEL } from '../config/VipConfig.js';
import { vipPackage } from '../config/VipPackagesConfig.js';

export class VipState {
  constructor() {
    /** @private */ this._level = 0;
    /** @private @type {Set<number>} VIP levels whose one-time package has been bought */
    this._purchasedPackages = new Set();
  }

  /** @returns {number} current VIP level — permanent, never decays */
  get level() { return this._level; }

  /** @param {number} level @returns {void} */
  setLevel(level) { this._level = Math.max(0, Math.round(level)); }

  /** @param {number} vipLevel @returns {boolean} already bought (single-purchase packages must never double-claim) */
  hasPurchasedPackage(vipLevel) { return this._purchasedPackages.has(vipLevel); }

  /**
   * Record a package purchase. @param {number} vipLevel
   * @returns {boolean} true if newly recorded; false if already claimed or unconfigured
   */
  purchasePackage(vipLevel) {
    if (!vipPackage(vipLevel) || this._purchasedPackages.has(vipLevel)) return false;
    this._purchasedPackages.add(vipLevel);
    return true;
  }
}

/**
 * Current effective value of a numeric VIP modifier — the most recently
 * CONFIRMED level at or below `vipLevel` that defines `key` (never a sum
 * across every level that mentions it — master-task section 18).
 * @param {number} vipLevel @param {string} key @param {number} [fallback=0]
 * @returns {number}
 */
export function vipModifier(vipLevel, key, fallback = 0) {
  for (let lvl = Math.min(vipLevel, VIP_MAX_CONFIRMED_LEVEL); lvl >= 0; lvl--) {
    const v = VIP_LEVELS[lvl]?.[key];
    if (typeof v === 'number') return v;
  }
  return fallback;
}

/**
 * Whether a VIP feature-unlock flag is active — true once ANY level up to
 * `vipLevel` grants it (an unlock is permanent, unlike a numeric modifier
 * which only reflects the most recent level that redefined it).
 * @param {number} vipLevel @param {string} key @returns {boolean}
 */
export function vipFlag(vipLevel, key) {
  if (!VIP_FLAG_KEYS.has(key)) return false;
  for (let lvl = 0; lvl <= Math.min(vipLevel, VIP_MAX_CONFIRMED_LEVEL); lvl++) {
    if (VIP_LEVELS[lvl]?.[key]) return true;
  }
  return false;
}

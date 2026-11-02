/**
 * FeedbackConfig — combat-legibility tuneables pulled forward from the HUD
 * block (Sessions 17-20). Currently just the floating damage numbers; the
 * HUD-space selected-unit panel (armor bar, HP text, reload bar) stays deferred.
 *
 * DRAFT: every value is a proposal. Grep "REVIEW".
 * CONVENTIONS: speeds in world px/sec, distances in world px, times in ms.
 */

export const DAMAGE_NUMBERS = {
  poolSize: 30,
  riseSpeedPx: 60, // upward for enemy hits
  fallSpeedPx: 60, // downward for player-unit hits
  travelPx: 60, // total vertical travel before despawn
  jitterXPx: 14, // random horizontal offset so stacked hits don't overlap
  scaleIn: { to: 1.3, settle: 1.0, ms: 200 }, // 0 -> to -> settle
  fadeMs: { min: 400, max: 600 },
  spawnOffsetY: -20, // above the hit point
  style: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    stroke: 0x000000,
    strokeThickness: 3,
  },
  critFrac: 0.18, // amount / maxHp >= this -> crit (yellow + "!")
  critPrefix: '!',
  healPrefix: '+', // FORWARD: no healing source yet (fieldRepairAllowed:false)
  colors: {
    normal: 0xffffff,
    crit: 0xffd700,
    playerHit: 0xff4500,
    heal: 0x8fbf4d,
  },
};

/**
 * ArtilleryConfig — placeholder-era tuneables for the deployable weapons
 * (PaK 40 AT gun, M12 GMC + ISU-152 howitzers). Setup / teardown seconds are
 * NOT here — they come from `CombatConfig.DEPLOY`. Per-row stats live in
 * `UnitStats.UNIQUE`; this file only covers what has no home there.
 *
 * DRAFT: every value is a proposal. REVIEW.
 */

export const DEPLOYABLE = {
  // decoration only — no HP, no sim. Circles orbit the gun once deployed.
  crew: { count: 3, radiusPx: 3, orbitPx: 15, color: 0x6b8e23, enemyColor: 0x8b4a2f },
  // the deploy / undeploy progress readout, drawn below the gun.
  progressBar: { widthPx: 34, heightPx: 4, offsetY: 22, fill: 0xffd37a, bg: 0x1a1a1a },
  // muzzle origin along the (deployed) barrel, before bodyScale.
  barrelLenPx: { howitzer: 20, atGun: 16 },
};

/** Indirect fire: the shell aim point is jittered by ±scatterPx (minRng from the row). */
export const HOWITZER = { scatterPx: 24 };

/** A deployed AT gun cannot traverse: it fires only within ±firingArcDeg of its
 *  set-up facing, and its gun shield halves a hit that lands in the front arc. */
export const AT_GUN = { firingArcDeg: 45, shieldFrontMult: 0.5 };

/** Rocket artillery (BM-13 Katyusha): a mobile, non-deploying launcher that
 *  empties its whole rack in a staggered salvo, then reloads for a long time.
 *  `salvo` count + `reloadSeconds` come from the UnitStats row, not here. */
export const ROCKET = {
  salvoStaggerMs: 200, // gap between rockets within one salvo
  scatterPx: 60, // each rocket lands within this of the aim point (area saturation)
  turnRateDegPerSec: 100, // fast raider — slews the hull onto the target quickly
  rack: { color: 0xff7a3c, cellPx: 3, gapPx: 2, offsetY: -10 }, // placeholder rocket rack
  backblast: { ms: 120, color: 0xffb066, lenPx: 12 }, // brief launch flash (real FX deferred)
  sightRangeTiles: 9,
};

/** Per-row sight range (tiles). REVIEW: no home in UnitStats yet. FORWARD — not
 *  consumed by combat this session. */
export const ARTILLERY_TUNING = {
  m12_gmc: { sightRangeTiles: 11 },
  isu152: { sightRangeTiles: 9 },
  pak40: { sightRangeTiles: 8 },
};

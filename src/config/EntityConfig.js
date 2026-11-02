/**
 * EntityConfig — placeholder-era tuneables for field entities: the base entity
 * (hit reaction, wreck fade, health bar) and the vehicle layer (accel ramps,
 * fire arc, recoil, wreck appearance, placeholder body geometry + colours),
 * plus per-unit slew / sight tuning that has no home in UnitStats yet.
 *
 * DRAFT: every value is a proposal. Grep "REVIEW".
 */

export const ENTITY = {
  hitReactionMs: 120,
  wreck: { fadeMs: 3000, color: 0x2a2a2a },
  healthBar: {
    widthPx: 40,
    heightPx: 5,
    offsetY: -36,
    bg: 0x1a1a1a,
    fill: 0x6b8e23, // >= midFrac
    midColor: 0xffd37a, // lowFrac..midFrac (gold, palette)
    low: 0xff4500, // < lowFrac (palette combat)
    lowFrac: 0.3,
    midFrac: 0.6,
    segments: 10, // <=1 -> solid bar (no dividers)
    dividerPx: 1,
    dividerColor: 0x1a1a1a,
    ghost: { color: 0xffffff, delayMs: 120, catchUpMs: 500 }, // white bar trails a hit, then catches up
    critical: { belowFrac: 0.2, pulseHz: 3, minAlpha: 0.35 }, // whole bar alpha-oscillates
    showWhenSelected: true, // visible when (frac < 1) OR entity.selected
    hideAtFull: true,
  },
  // A seconds-remaining number above a selected unit while its weapon is
  // reloading (`e.reloadRemaining`) — the user's own explicit call: a
  // digit countdown, not another progress bar. Selected-only, same
  // decluttering convention as healthBar.showWhenSelected above.
  reloadCountdown: {
    offsetY: -48, fontFamily: 'monospace', fontSizePx: 11,
    color: 0xffd37a, strokeColor: 0x14140f, strokeWidthPx: 3,
  },
};

export const VEHICLE = {
  accelRampMs: 500,
  decelRampMs: 300,
  fireArcDeg: 8, // turret must be within this of the target bearing to fire
  arrivalPx: 6, // move-order "close enough" radius
  // --- Session 19: rotate-in-place movement + sequential turret-front-lock ---
  entityTurnDegPerSec: 140, // body pivot rate for non-tank entities (truck, limbered gun, launcher, infantry blob)
  headingAlignDeg: 6, // within this of the travel heading -> stop pivoting, drive straight
  turretFrontLockDeg: 10, // on a move order the turret must recentre to within this of hull-front before the hull may turn/advance
  repathCooldownMs: 500, // min gap between recovery A* re-paths when a step is blocked (never per frame)
  recoil: { retractPx: 4, outMs: 50, returnMs: 200 },
  // track dust kicked up behind a moving vehicle (not infantry), emitted through
  // the shared ParticleSystem by src/effects/VehicleDust.js.
  dust: {
    emitIntervalMs: 140, minSpeedPxPerSec: 55, offsetPx: 16, layer: 'PARTICLES_LOW',
    particle: {
      drawMode: 'disc', blend: 'normal', ms: 520,
      radiusStartPx: 3, radiusEndPx: 9, alphaStart: 0.45, alphaEnd: 0,
      colorStart: 0x8b7355, colorEnd: 0x6b5a3f, gravityY: -8,
    },
  },
  body: {
    hull: 0x556b2f,
    turret: 0x3b4a1e,
    barrel: 0x2e2e2e,
    enemyHull: 0x8b4a2f,
    // S57: doubled from 34/20/22/4 — units were barely visible at typical
    // zoomed-out battle framing, especially on phone screens. scaleByClass
    // below is a per-class RATIO on top of this base, so doubling here
    // doubles every class's on-map size uniformly without re-tuning each one.
    hullPx: 68,
    turretPx: 40,
    barrelLenPx: 44,
    barrelWidPx: 8,
    // one shared geometry scaled per class so heavier armour reads bigger;
    // resolved once as entity.bodyScale, which also scales the muzzle origin
    // (BaseTank.fire) and the projectile hit radius (EntityManager.firstHitAlong)
    scaleByClass: {
      lightTank: 0.85, mediumTank: 1.0, heavyTank: 1.25, superHeavyTank: 1.6,
      tankHunter: 1.1, gatherTruck: 0.7, // small, low-profile hauler
      // the 2-wide formation is a wider target than a tank for
      // EntityManager.firstHitAlong — projectiles hit the squad, not a soldier.
      infantry: 1.4,
      howitzer: 1.2, atGun: 0.8, // big gun-carriage vs low-profile AT gun
      launcher: 1.15, // rocket-truck bed
    },
  },
};

/** The Gather Truck (in-game "Armored Car") — one non-combat vehicle, three
 *  cosmetic faction skins (GDD 07). DRAFT / REVIEW. */
export const TRUCK = {
  sightRangeTiles: 14, // best on-map vision — it's a scout / hauler
  bodyColor: 0x6b6b6b, // neutral metal; a skin tint overrides per faction
};

export const TRUCK_SKINS = {
  germany: { name: 'SdKfz 251 Hanomag', tint: 0x5c5138 },
  usa: { name: 'M3 Half-track', tint: 0x4b5320 },
  russia: { name: 'GAZ-AA', tint: 0x3d4a2a },
};

/** Per-unit hull/turret slew (deg/sec) + sight range (tiles). REVIEW: sight
 *  has no home in UnitStats yet. `turretTurnDegPerSec: 0` = fixed barrel. */
export const TANKS_TUNING = {
  // Germany — Defense & Armor: slower slew, shorter sight than the US peers.
  panzer_iv: { hullTurnDegPerSec: 35, turretTurnDegPerSec: 30, sightRangeTiles: 8 },
  tiger_i: { hullTurnDegPerSec: 24, turretTurnDegPerSec: 20, sightRangeTiles: 8 },
  maus: { hullTurnDegPerSec: 16, turretTurnDegPerSec: 14, sightRangeTiles: 7 },
  jagdpanther: {
    hullTurnDegPerSec: 30, turretTurnDegPerSec: 0, sightRangeTiles: 9,
    camoSightMult: 0.6, // FORWARD: no detection system yet — a spotter detects this TD at 60% of its normal sight range
  },
  // USA — Speed & Range: a touch faster slew, longer sight than the German peers.
  m24_chaffee: { hullTurnDegPerSec: 50, turretTurnDegPerSec: 44, sightRangeTiles: 9 },
  m4_sherman: { hullTurnDegPerSec: 40, turretTurnDegPerSec: 34, sightRangeTiles: 9 },
  m26_pershing: { hullTurnDegPerSec: 28, turretTurnDegPerSec: 24, sightRangeTiles: 9 },
  m18_hellcat: {
    hullTurnDegPerSec: 42, turretTurnDegPerSec: 0, sightRangeTiles: 10,
    camoSightMult: 0.65, // FORWARD: no detection system yet
  },
  // Russia — AoE & Durability: slew between the German and US peers; the IS-2's
  // heavy gun slews its turret slowly.
  t34_85: { hullTurnDegPerSec: 38, turretTurnDegPerSec: 30, sightRangeTiles: 8 },
  is2: { hullTurnDegPerSec: 22, turretTurnDegPerSec: 16, sightRangeTiles: 8 },
  su100: {
    hullTurnDegPerSec: 26, turretTurnDegPerSec: 0, sightRangeTiles: 9,
    camoSightMult: 0.6, // FORWARD: no detection system yet
  },
};

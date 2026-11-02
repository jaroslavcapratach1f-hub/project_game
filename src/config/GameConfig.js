/**
 * GameConfig — global scale, timing, and the unit conventions every other
 * config file follows.
 *
 * DRAFT: all values are proposals pending sign-off. Grep "REVIEW".
 *
 * CONVENTIONS (used everywhere in src/config/):
 *   distance   -> map tiles           (1 tile = TILE_SIZE px)
 *   speed      -> tiles per second
 *   fire rate  -> shots per second ("rof"); salvo weapons use salvo + reloadSeconds
 *   time       -> seconds, unless the key ends in Minutes / Hours / Days
 *   rates      -> per hour, unless the key says otherwise
 *   bonuses    -> fractions (0.24), never percent points (24)
 *   armour     -> [front, side, rear] depth; penetration is a flat value
 */

export const TILE_SIZE = 64; // px. REVIEW: locked once art pipeline is set.

export const WORLD = {
  widthTiles: 240,
  heightTiles: 240,
  playersPerMap: 240,   // REVIEW: GDD 11 "map structure TBD"
  gatherNodeTiers: 6,   // world resource-node quality tiers, unlocked by research
};

/**
 * BATTLEFIELD — the hex terrain-grid defaults (utils/Hex.js). `WorldField`
 * wraps a `TerrainGrid` sized from these. The square-arena generator that used
 * the legacy `*Tiles` fields was deleted in the post-audit rebuild; GDD-17
 * world terrain is a fresh hex build. All values REVIEW / placeholder.
 */
export const BATTLEFIELD = {
  hexCols: 100,   // axial q extent of the terrain grid
  hexRows: 100,   // axial r extent
  hexSize: 110,   // hexagon centre-to-corner, world px (matches WORLDMAP)
};

export const LOOP = {
  renderFps: 60,        // PixiJS ticker target (CLAUDE.md PERFORMANCE)
  logicHz: 20,          // fixed combat/sim step (50 ms)
  fogThrottleMs: 500,   // CLAUDE.md
  minimapThrottleMs: 250,
};

/**
 * Headquarters is the spine of base progression: its level is the hard ceiling
 * for every other building and a major contributor to the troop level cap.
 */
export const HQ = {
  maxLevel: 36,             // headquarters hard ceiling — level 36 is the final, unique-design tier (player's own explicit rule, S49)
  gatesEveryBuilding: true, // no other building may exceed the current HQ level
  unitLevelPerHqLevel: 5,   // troop playable-cap contribution: 5 * hqLevel
};

export const LIMITS = {
  maxActiveParticles: 500,     // CLAUDE.md
  maxMilitaryBarracks: 5,      // GDD 01
  maxResourceBuildingsEach: 4, // 4 each of Treasury / Steelworks / Crude Oil
  headquartersMaxLevel: HQ.maxLevel, // back-compat alias; prefer HQ.maxLevel
  maxDeployedSquads: 6,        // field squads out at once; +via Military research
  maxSquadEntities: 12,        // absolute; per-class caps in PersonnelConfig
  garrisonSquads: 8,           // troops parked inside the base for Base Fury
  offlineTroopKillDays: 30,    // GDD 06 / 09
  allianceImmunity: true,      // GDD 02: allied units never damage each other
};

/**
 * Camera — pinch-zoom / swipe-pan of the world view (GDD 02 touch controls).
 * Distances here are world pixels; zoom is a linear scale factor.
 */
export const CAMERA = {
  defaultZoom: 1.0,
  minZoom: 0.5,   // startup clamp; WorldScene widens it via Camera.setZoomLimits
  maxZoom: 2.0,
  panLerp: 0.2,                     // per-update lerp toward the target position
  followSmoothing: 0.12,            // lerp factor while follow(target) is active
  moveDefaultMs: 400,              // default moveTo() eased-tween duration
  zoomDefaultMs: 250,              // default setZoom() eased-tween duration
  maxSources: 8,                  // concurrent CameraShake sources (pre-allocated)
  shake: {
    maxOffsetPx: 20,                                       // total world displacement cap
    impact: { decayMs: 350, frequencyHz: 40, curve: 'expo' },
    rumble: { decayMs: 900, frequencyHz: 12, curve: 'linear' },
    recoil: { decayMs: 300, frequencyHz: 22, curve: 'expo', directional: true },
  },
};

/**
 * Render — PixiJS application surface + the one surviving dev keybind.
 */
export const RENDER = {
  backgroundColor: 0x0a0a08, // near-black (matches css/game.css)
  showDebugFps: true,
  devEffects: true,          // EffectsSystem keys 5/6/7/8 → explosions at camera centre
  maxResolution: 2,          // cap on devicePixelRatio for the Pixi renderer
  maxFrameMs: 250,           // anti death-spiral clamp on a single frame delta
  fpsSampleFrames: 60,       // rolling-average window for the FPS readout
  fpsEmitIntervalMs: 1000,   // how often GameLoop emits EVENTS.LOOP_FPS
};

/**
 * Input — gesture recognition thresholds for InputManager (GDD 02).
 */
export const INPUT = {
  longPressMs: 500,     // hold with no movement -> radial menu
  dragThresholdPx: 8,   // pointer travel before a press becomes a drag/pan
  wheelZoomStep: 0.0015, // zoom delta per wheel unit (deltaY)
  pinchZoomStep: 0.005,  // zoom delta per pixel of two-pointer distance change
  // --- Session 3: tactical-order gesture recognition (all REVIEW / DRAFT) ---
  maxPointers: 5,               // simultaneous pointers tracked by the pool
  tapMaxMs: 200,                // down->up under this = tap candidate
  tapMoveTolerancePx: 10,       // max travel for a tap
  doubleTapMaxMs: 400,          // gap between two taps to count as a double-tap
  doubleTapMaxGapPx: 24,        // max distance between the two tap points
  longPressMoveTolerancePx: 10, // jitter allowed during the hold
  orderDragArmPx: 20,           // finger travel before a unit-drag arms as an order
  swipeMinSpeedPxPerMs: 0.5,    // release speed for a swipe
  swipeMaxMs: 300,              // max gesture duration for a swipe
  velocitySmoothing: 0.2,       // EMA factor for per-pointer velocity
};

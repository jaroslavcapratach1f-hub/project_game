/**
 * LayerConfig — the 13 render layers from CLAUDE.md as an ordered, named
 * registry. The renderer builds one PixiJS Container per entry, stacked in
 * ascending index order on app.stage.
 *
 * DRAFT: layer set matches CLAUDE.md "RENDERING LAYERS". Grep "REVIEW".
 */

/** @type {Readonly<Record<string, number>>} name -> stage child index */
export const LAYERS = {
  SKY: 0,            // sky / background gradient
  TERRAIN: 1,        // terrain tiles
  DECALS: 2,         // ground decals: tracks, craters, scorch marks
  SHADOWS: 3,        // blob shadows and selection indicators
  GROUND_UNITS: 4,   // infantry, deployed artillery
  VEHICLES: 5,       // tanks, armored cars, mobile artillery
  PROJECTILES: 6,    // shells, rockets, tracers
  PARTICLES_LOW: 7,  // dust, dirt kicked up at ground level
  PARTICLES_HIGH: 8, // explosions, fire, smoke
  WEATHER: 9,        // weather effects and fog of war
  WORLD_UI: 10,      // world-space UI: health bars, labels, damage numbers
  HUD: 11,           // screen-space HUD: fixed buttons, panels
  OVERLAY: 12,       // overlay effects: vignette, flash, menus
};

/** Ordered layer names, ascending by index. */
export const LAYER_ORDER = Object.keys(LAYERS).sort((a, b) => LAYERS[a] - LAYERS[b]);

/**
 * World layers live under a single worldRoot container that the Camera
 * transforms each frame. Everything at or below WORLD_UI is world-space.
 */
export const WORLD_LAYERS = LAYER_ORDER.filter((name) => LAYERS[name] <= LAYERS.WORLD_UI);

/**
 * Screen layers are siblings of worldRoot and are never camera-transformed.
 */
export const SCREEN_LAYERS = LAYER_ORDER.filter((name) => LAYERS[name] > LAYERS.WORLD_UI);

/**
 * (S54) worldRoot itself splits so live-3D content can sit between 2D
 * layers as screen-space Sprites of their own off-screen canvas — not a
 * per-object depth sort, see Renderer.js / Base3DLayer.js / Unit3DLayer.js.
 * Two cuts now (S55 added the second, for live-3D units):
 *  - `buildingsSlot` sits at the SHADOWS/GROUND_UNITS boundary: everything
 *    through SHADOWS (ground, decals, blob shadows) draws behind 3D
 *    buildings, everything from GROUND_UNITS on draws in front of them.
 *  - `unitsSlot` sits one boundary later, at GROUND_UNITS/VEHICLES: 3D
 *    units draw in front of 2D infantry/deployed guns (GROUND_UNITS) but
 *    behind 2D vehicles (other tanks not yet converted) — sits among
 *    vehicles rather than underneath everything, the closest a coarse
 *    layer-order split can get without true per-object Y-sort.
 */
export const WORLD_BACK_LAYERS = LAYER_ORDER.filter((name) => LAYERS[name] <= LAYERS.SHADOWS);
export const WORLD_UNITS_BACK_LAYERS = LAYER_ORDER.filter(
  (name) => LAYERS[name] > LAYERS.SHADOWS && LAYERS[name] <= LAYERS.GROUND_UNITS,
);
export const WORLD_FRONT_LAYERS = WORLD_LAYERS.filter(
  (name) => LAYERS[name] > LAYERS.GROUND_UNITS,
);

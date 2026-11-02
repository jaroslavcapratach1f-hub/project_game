/** L1 reference proportions, measured in existing 42px base cells. */
export const DEFENCE = {
  wallSetback: 2, cornerChamfer: 4, gateEdge: 2, trenchOffset: 2.1, wireOffset: 4,
  treeInset: 0.85, towerInset: 0, gateHalfWidth: 1,
  treeEvery: 3, propEvery: 7, poleEvery: 12,
  scale: 1, towerWidth: 1.65, towerScale: 0.94, diffuseFactor: 0.18, poleCableHeight: 4.23, cableSag: 0.5, cableSteps: 10,
  treeScale: 0.88, treeVariationDivisor: 10, cableOffsets: [-0.49, 0.49],
  trenchBayDepth: 1.25, trenchBayStart: 0.38, trenchBayEnd: 0.62, trenchBayMinLength: 4, bagEvery: 0.32, bagHeightScale: 1.3, bagJitter: 0.12, bagPhase: 5, cornerPropOffset: 0.9, crateHeight: 0.4, towerClearance: 0.8,
};
export const DEFENCE_GROUND = {
  rings: [{ distance: -2.1, alpha: 0 }, { distance: -1.3, alpha: 1 },
    { distance: 3.8, alpha: 1 }, { distance: 4.6, alpha: 0 }],
  elevation: -0.002, meshStep: 0.22, texturePx: 1024, seed: 1939, multiplier: 1664525,
  increment: 1013904223, uintRange: 4294967296, coarseX: 0.021, coarseY: 0.017,
  color: [98, 108, 60], mottle: 9, grain: 18, alpha: 255,
};
export const DEFENCE_SHADOW = {
  texturePx: 64, center: 'rgba(20,18,10,0.7)', edge: 'rgba(20,18,10,0)',
  opacity: 0.65, treeSize: 2.5, wallSize: 1.15, elevation: 0.002,
};
export const DEFENCE_BARRIER = {
  bayCells: 4, gateClearance: 2.2, keyPrecision: 6, wireCenters: [0.25, 0.75],
};

/** Continuous shallow trench section and access spacing, in base cells. */
export const DEFENCE_TRENCH = {
  halfWidth: 0.34, bankWidth: 0.40, floorY: -0.245, bankHeight: 0.035,
  terrainFloorMargin: 0.18, terrainFloorClearance: 0.075, floorUnderlap: 0.06,
  underlayHeight: 0.55, entryEndScale: 0.12, entryFeather: 0.15, entryWidth: 0.82, entryLength: 0.95, entryFraction: 0.72,
  bridgeDeckY: 0.025, bridgeCount: 10, bridgeFraction: 0.28, featureMinLength: 3.2,
  bankSection: 0.4, bankVariation: 0.012, textureSize: 128, textureBase: 170, textureGrain: 38, soilCloudScale: 0.16, soilCloudContrast: 38,
  noiseX: 12.9898, noiseY: 78.233, noiseSeed: 43758.5453, textureAlpha: 255,
  floorColor: [0.059, 0.029, 0.009], earthColor: [0.17, 0.08, 0.025],
};
/** Linear multipliers preserve authored grain while strengthening material separation. */
export const DEFENCE_TINT = {
  'Weathered timber': [0.78, 0.55, 0.35], 'Timber worn edges': [0.85, 0.64, 0.42],
  'Dark endgrain': [0.77, 0.56, 0.37], 'Olive canvas': [0.70, 0.80, 0.42],
  'Earth revetment': [0.78, 0.60, 0.36], 'Trench dark earth': [0.72, 0.55, 0.35],
  'Pine needles': [0.66, 0.90, 0.47], 'Sunlit pine tips': [0.76, 0.96, 0.50],
  'Oxide red drums': [0.95, 0.67, 0.48], 'Military green cases': [0.62, 0.86, 0.55],
  'Oxidized dark steel': [0.65, 0.72, 0.78],
};

/** Stable natural variation; no random changes when rebuilding/upgrading the base. */
export const DEFENCE_TREES = {
  interiorRetention: 0.75, interiorSize: 0.75, exteriorMultiplier: 2, exteriorSpacing: 1.35, variationFrequency: 7.13,
  seed: 1945, multiplier: 1664525, increment: 1013904223, range: 4294967296,
  spacingMin: 1.7, spacingVariation: 1.8, start: 1.2,
  innerInset: 1.1, innerJitter: 0.35, outerInset: 1.02, outerJitter: 0.12,
  innerScale: 0.65, innerScaleVariation: 0.58, outerScale: 0.42, outerScaleVariation: 0.62, outerWidthMax: 0.60,
  widthMin: 0.78, widthVariation: 0.25, exteriorChance: 0.48,
  towerClearance: 1.9, entranceClearance: 1.15, propClearance: 0.65, gateClearance: 2.3,
};

/** Gate apron is visual dressing only; whole-base navigation remains unchanged. */
export const DEFENCE_GATE = {
  clearHalfWidth: 1.72, trenchHalfGap: 2.05, roadHalfWidth: 1.55,
  roadStart: -0.12, roadLength: 5.5, roadY: 0.003, roadTextureSize: 128,
  roadColor: [112, 103, 78], roadAlpha: 145, roadGrain: 12, edgeFade: 0.18,
  sideOffset: 2.05, postForward: 0.65, crateForward: 0.45, caseForward: 1.15,
};

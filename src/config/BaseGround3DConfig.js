/** Ground presentation uses shared 1K CC0 grass maps and one low-opacity traffic overlay. */
export const GROUND_3D = {
  tileCells: 4, color: [0.12, 0.34, 0.105], roughness: 0.96, normalScale: 0.38,
  elevation: -0.003, trafficElevation: 0.002, texturePx: 384,
  roadJunction: 0.28, roadReach: 0.36,
  footWidth: 0.23, vehicleWearWidth: 1.25, wearVariation: 0.16,
  vehicleWearAlpha: 185, footWearAlpha: 48, wearFrequency: 3.7,
  wearColor: [112, 103, 78], wearGrain: 20, grainOpacity: 0.65,
  noiseX: 12.9898, noiseY: 78.233, noiseSeed: 43758.5453,
  gridColor: 0xd8d8c0, gridOpacity: 0.32, gridElevation: 0.008,
};

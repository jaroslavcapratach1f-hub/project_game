/** Small shared opaque texture maps for trench soil underlays. */
import { DataTexture, RepeatWrapping, SRGBColorSpace, MeshStandardMaterial, Color, DoubleSide } from 'three';
import { DEFENCE, DEFENCE_TRENCH as T } from '../config/DefencePerimeterConfig.js';
const RGBA = 4, ALPHA = 3;
const maps = new Map();

/** @param {string} name @param {number[]} color @returns {MeshStandardMaterial} owned material, shared map */
export function trenchMaterial(name, color) {
  if (!maps.has(name)) {
    const size = T.textureSize, pixels = new Uint8Array(size * size * RGBA);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const noise = Math.sin(x * T.noiseX + y * T.noiseY) * T.noiseSeed;
      const grain = noise - Math.floor(noise);
      const cloud = Math.sin(x * T.soilCloudScale + Math.sin(y * T.soilCloudScale)) * Math.sin(y * T.soilCloudScale);
      const value = T.textureBase + T.textureGrain * grain + T.soilCloudContrast * cloud;
      const i = (y * size + x) * RGBA;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = value; pixels[i + ALPHA] = T.textureAlpha;
    }
    const map = new DataTexture(pixels, size, size); map.colorSpace = SRGBColorSpace;
    map.wrapS = map.wrapT = RepeatWrapping; map.needsUpdate = true; maps.set(name, map);
  }
  return new MeshStandardMaterial({ color: new Color(...color).multiplyScalar(DEFENCE.diffuseFactor),
    roughness: 1, side: DoubleSide, map: maps.get(name),
    vertexColors: true, transparent: true, depthWrite: name !== 'earth' });
}

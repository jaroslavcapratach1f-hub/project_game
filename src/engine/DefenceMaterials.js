/** Shared PBR maps load once for all instanced perimeter modules. */
import { TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import woodColor from '../../assets/buildings/hq/levels01-06/source/refinement/textures/wood_diff.jpg?url';
import woodNormal from '../../assets/buildings/hq/levels01-06/source/refinement/textures/wood_nor_gl.jpg?url';
import woodRough from '../../assets/buildings/hq/levels01-06/source/refinement/textures/wood_rough.jpg?url';
import { DEFENCE_MATERIAL as C, DEFENCE_FOLIAGE } from '../config/DefenceMaterialConfig.js';
let maps;

/** @param {import('three').Material} material local clone @returns {void} */
export function refineDefenceMaterial(material) {
  const wood = C.wood[material.name];
  if (wood) {
    if (!maps) {
      const loader = new TextureLoader(); maps = [woodColor, woodNormal, woodRough].map(url => loader.load(url));
      maps.forEach(map => { map.wrapS = map.wrapT = RepeatWrapping; }); maps[0].colorSpace = SRGBColorSpace;
    }
    [material.map, material.normalMap, material.roughnessMap] = maps;
    material.color.setRGB(...wood); material.normalScale.setScalar(C.woodNormal);
    material.roughness = C.woodRoughness;
  } else if (DEFENCE_FOLIAGE[material.name]) {
    material.color.setRGB(...DEFENCE_FOLIAGE[material.name]);
  } else if (material.name === 'Olive canvas') {
    material.color.setRGB(...C.canvas); material.roughness = C.canvasRoughness;
  } else if (material.name === 'Oxidized dark steel') {
    material.color.setRGB(...C.steel); material.roughness = C.steelRoughness; material.metalness = C.steelMetalness;
  }
}

/** Shared photographed grass, with local compensation for the existing daylight. */
import { TextureLoader, RepeatWrapping, SRGBColorSpace, MeshStandardMaterial, Color } from 'three';
import diffuse from '../../assets/base/ground/textures/grass_diff.jpg?url';
import normal from '../../assets/base/ground/textures/grass_normal.jpg?url';
import rough from '../../assets/base/ground/textures/grass_rough.jpg?url';
import { GROUND_3D as C } from '../config/BaseGround3DConfig.js';
let maps;
/** @returns {MeshStandardMaterial} owned material, shared texture resources */
export function baseGrassMaterial() {
  if (!maps) {
    const loader = new TextureLoader(); maps = [diffuse, normal, rough].map(url => loader.load(url));
    for (const map of maps) map.wrapS = map.wrapT = RepeatWrapping;
    maps[0].colorSpace = SRGBColorSpace;
  }
  const m = new MeshStandardMaterial({ map: maps[0], normalMap: maps[1], roughnessMap: maps[2],
    color: new Color(...C.color), roughness: C.roughness, metalness: 0 });
  m.normalScale.setScalar(C.normalScale); return m;
}

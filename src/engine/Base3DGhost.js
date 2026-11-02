/**
 * Base3DGhost — the translucent drag-ghost material swap for one of
 * `Base3DLayer`'s already-loaded models (S54 `BuildingDragController`),
 * split out purely to keep Base3DLayer.js under the 150-line cap. Only one
 * building is ever dragged at a time, so a single shared material (lazily
 * created, recoloured green/red in place) is safe and avoids a per-model
 * material.
 */
import { MeshBasicMaterial } from 'three';
import { BASE } from '../config/BaseConfig.js';

let sharedMaterial = null;

/** @private @returns {import('three').MeshBasicMaterial} */
function ghostMaterial() {
  if (!sharedMaterial) {
    sharedMaterial = new MeshBasicMaterial({
      color: BASE.dragGhost.validColor, transparent: true, opacity: BASE.dragGhost.alpha, depthWrite: false,
    });
  }
  return sharedMaterial;
}

/**
 * Swap every mesh's own material for the shared ghost one, remembering the
 * originals on `model` for `exitGhost` to restore.
 * @param {{root:import('three').Object3D, originalMaterials?:Array}} model
 * @returns {void}
 */
export function enterGhost(model) {
  const mat = ghostMaterial();
  model.originalMaterials = [];
  model.root.traverse((n) => {
    if (!n.isMesh) return;
    model.originalMaterials.push([n, n.material]);
    n.material = mat;
  });
}

/** @param {{root:import('three').Object3D, originalMaterials?:Array}} model @returns {void} */
export function exitGhost(model) {
  if (!model.originalMaterials) return;
  for (const [n, mat] of model.originalMaterials) n.material = mat;
  model.originalMaterials = null;
}

/** @param {boolean} valid @returns {void} recolour the shared ghost material — cheap, no mesh traversal */
export function setGhostValid(valid) {
  if (sharedMaterial) sharedMaterial.color.set(valid ? BASE.dragGhost.validColor : BASE.dragGhost.invalidColor);
}

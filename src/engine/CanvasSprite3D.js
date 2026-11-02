/** Recreate the canvas source as well as its sprite after a 3D viewport resize. */
import { Sprite, Texture, CanvasSource } from 'pixi.js';

/** Cached Texture.from(canvas) retains GPU state across orientation changes.
 * A fresh source owns the resized upload; destroying the old source releases
 * its GPU allocation without destroying the Three renderer's canvas.
 * @param {import('pixi.js').Sprite} oldSprite previous composite
 * @param {import('pixi.js').Container} slot composite layer
 * @param {HTMLCanvasElement} canvasEl live offscreen canvas
 * @returns {import('pixi.js').Sprite} fresh composite sprite */
export function rebuildCanvasSprite(oldSprite, slot, canvasEl) {
  const source = new CanvasSource({ resource: canvasEl, resolution: 1 });
  const sprite = new Sprite(new Texture({ source }));
  slot.addChild(sprite);
  oldSprite.parent?.removeChild(oldSprite);
  oldSprite.destroy({ texture: true, textureSource: true });
  return sprite;
}

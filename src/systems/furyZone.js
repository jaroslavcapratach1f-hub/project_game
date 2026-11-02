/**
 * furyZone — shared helper for the Fury systems: is an entity standing inside a
 * base footprint? Until real base buildings exist the footprint is the team's
 * spawn zone (Battlefield.isInSpawn). FORWARD: a real base polygon later.
 */
import { TILE_SIZE } from '../config/GameConfig.js';

/**
 * @param {import('../worldmap/WorldField.js').WorldField} bf
 * @param {import('../entities/Entity.js').Entity} e
 * @param {string} [side] which base to test against (default: the entity's own team)
 * @returns {boolean}
 */
export function inBase(bf, e, side = e.team) {
  const tx = Math.floor(e.x / TILE_SIZE);
  const ty = Math.floor(e.y / TILE_SIZE);
  return bf.isInSpawn(side, tx, ty);
}

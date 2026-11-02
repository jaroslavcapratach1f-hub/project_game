/**
 * HexTargeting — pure hex math for the player-facing order system (S71):
 * snap a world point to its nearest hex centre, and classify that hex as
 * empty (march there) or enemy-occupied (attack whatever's there) — the
 * green/red distinction the player's own drag-lock and tap-Go flows both
 * need. No PixiJS; shared by `OrderController` and `OrderHexFlow`.
 *
 * S74/S76: a hex that's any of a base's 7 locked territory cells
 * (WorldEntityRegistry, S72) — ANY base, including the player's own — locks
 * to that base's ANCHOR (centre) hex instead of whichever of its 7 cells was
 * actually under the finger, same as every other multi-hex entity already
 * does: "drag/send troops to any of the 7 base grids, it centres that lock
 * to the middle base grid" (the player's own spec, generalized in S76 to
 * the player's OWN base too — groundwork for the future troop-garrison
 * function, sending your own troops back into your own base). A non-player
 * base still classifies 'enemy' (red, attack); the player's own base
 * classifies 'empty' (green, march/garrison there) — marching into your
 * own base isn't an attack, but the hex-lock behaves identically either way.
 */
import { pixelToAxial, axialToPixel } from '../utils/Hex.js';

const PLAYER_TEAM = 'player';
const BASE_TYPE = 'base';

/**
 * @param {number} wx @param {number} wy world px @param {number} hexSize
 * @returns {{q:number,r:number,x:number,y:number}} the nearest hex's axial coords + its own centre, world px
 */
export function hexCentreAt(wx, wy, hexSize) {
  const a = pixelToAxial(wx, wy, hexSize);
  const p = axialToPixel(a.q, a.r, hexSize);
  return { q: a.q, r: a.r, x: p.x, y: p.y };
}

/**
 * @param {import('../entities/EntityManager.js').EntityManager} em
 * @param {import('../world/WorldEntityRegistry.js').WorldEntityRegistry} worldEntities
 * @param {{q:number,r:number,x:number,y:number}} hex the already hex-locked point (hexCentreAt's own result)
 * @param {number} hexSize
 * @returns {{kind:'empty'|'enemy', entity:?object, hex:{x:number,y:number}}} `hex` is the point every caller should actually show/commit the lock at — the base's anchor when `entity` is a base, otherwise the same point passed in
 */
export function classifyHex(em, worldEntities, hex, hexSize) {
  const base = worldEntities.entityAt(hex.q, hex.r);
  if (base && base.type === BASE_TYPE) {
    const kind = base.ownerId === PLAYER_TEAM ? 'empty' : 'enemy';
    return { kind, entity: base, hex: axialToPixel(base.anchor.q, base.anchor.r, hexSize) };
  }
  let found = null;
  em.forEachWithin(hex.x, hex.y, hexSize, (e) => { if (!found && e.team !== PLAYER_TEAM) found = e; });
  return found
    ? { kind: 'enemy', entity: found, hex: { x: hex.x, y: hex.y } }
    : { kind: 'empty', entity: null, hex: { x: hex.x, y: hex.y } };
}

/**
 * territory — the placement rule a base's claimed circle enforces (GDD 24):
 * no other base, and no other map object, may be placed inside it. Pure
 * geometry, no rendering (see TerritoryRing.js) and no scene wiring — reused
 * both as a dev-time check on the static neighbour layout (WorldScene.enable)
 * and, later, by the Airlift/relocation flow before it allows a placement.
 */

/**
 * @param {{x:number,y:number,r:number}} a @param {{x:number,y:number,r:number}} b
 * @returns {boolean} the two claim circles intersect
 */
export function territoriesOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const rSum = a.r + b.r;
  return dx * dx + dy * dy < rSum * rSum;
}

/**
 * @param {{x:number,y:number,r:number}} candidate a proposed placement
 * @param {{x:number,y:number,r:number,name?:string}[]} claimed existing territories
 * @returns {?{x:number,y:number,r:number,name?:string}} the first claim it violates, or null
 */
export function findTerritoryConflict(candidate, claimed) {
  for (const c of claimed) {
    if (territoriesOverlap(candidate, c)) return c;
  }
  return null;
}

/**
 * entityMotion — the shared movement step for plain Entities (Gather Truck,
 * limbered DeployableWeapon, RocketLauncher, InfantrySquad centroid). Rotate
 * the body in place toward the travel bearing, then — once within
 * VEHICLE.headingAlignDeg — drive straight along that facing; follow a
 * Pathfinder route waypoint-by-waypoint. Tanks use TankMotor instead, but it
 * shares `arriveAtWaypoint` / `clearRoute` / `claimWaypoint` so path
 * progression and collision avoidance are identical. Pure: no PixiJS.
 *
 * S81b (replaces S80's continuous proximity scan AND S81's single-hex
 * reroute — that one remembered only the ONE hex it last bumped, forgot it
 * on the next attempt, and so could dodge obstacle A into obstacle B, then
 * dodge B by walking back toward A: exactly the "circling, doesn't know
 * which direction to move" the player reported). Every route — the FIRST
 * one a unit ever plans, and any later re-route — is computed with EVERY
 * other live unit's current hex temporarily marked impassable AT ONCE
 * (`findPathAroundUnits`), so A* has complete knowledge of every obstacle
 * in a single call and can't produce a path that only dodges some of them.
 * Unit-to-unit collision is still a discrete HEX CLAIM on a unit's own
 * current waypoint (HexOccupancy, the same registry that already governs
 * resting units) — a hex can only ever have one claimant, so a unit may
 * only advance toward a waypoint once it holds that claim; if another unit
 * already holds it (ordered there after this route was planned), this one
 * waits in place, and past WAIT_TIMEOUT_MS re-plans the full route (again
 * with every current unit blocked at once). "Stop, recalculate, drive."
 */
import { VEHICLE } from '../config/EntityConfig.js';
import { degToRad, rotateToward, wrapAngle } from '../utils/MathUtils.js';
import { HEX_PX_DIRS } from '../utils/Hex.js';
import { findPath } from '../world/Pathfinder.js';

const MS_PER_SECOND = 1000;
const HEX_SIDES = HEX_PX_DIRS.length;
// try the hex direction best aligned with the goal, then ±1, ±2, then reverse
const SLIDE_ORDER = [0, 1, HEX_SIDES - 1, 2, HEX_SIDES - 2, HEX_SIDES / 2];
const WAIT_TIMEOUT_MS = 1000; // how long a unit waits for a contested waypoint before re-planning around every current unit

/**
 * Resolve a move order into a route — planned with every OTHER live unit's
 * current hex temporarily blocked (`findPathAroundUnits`), so the route
 * already avoids all of them from the start, not just static terrain.
 * Unreachable goal (even around everyone) -> the unit stays put.
 * @param {import('./Entity.js').Entity} e @param {number} x @param {number} y world px
 * @returns {void}
 */
export function resolvePath(e, x, y) {
  e.battlefield?.occupancy.release(e.id); // departing — no longer resting in its old hex
  e._path = null;
  e._pathIdx = 0;
  e._waitMs = 0;
  const bf = e.battlefield;
  if (!bf) { e.moveTarget = { x, y }; return; }
  const path = findPathAroundUnits(e, x, y);
  if (!path || path.length === 0) { e.moveTarget = null; return; } // unreachable
  e._path = path;
  e.moveTarget = path[0];
}

/**
 * A* from `e`'s current position to (gx,gy) with every OTHER live unit's
 * current hex temporarily marked `blocked` for the duration of this ONE
 * call, then restored — complete knowledge of every obstacle at once, so
 * the result genuinely clears all of them instead of trading one for
 * another. Cheap: the live unit count is small and this only runs on a
 * fresh order or an actual stuck re-plan, never every tick.
 * @param {import('./Entity.js').Entity} e @param {number} gx @param {number} gy
 * @returns {?Array<{x:number,y:number}>}
 */
function findPathAroundUnits(e, gx, gy) {
  const bf = e.battlefield;
  const tiles = [];
  const prevBlocked = [];
  bf.forEachUnitWithin(e.x, e.y, Infinity, (other) => {
    if (other === e || !other.isAlive) return;
    const a = bf.grid.pixelToAxial(other.x, other.y);
    const t = bf.grid.tileAt(a.q, a.r);
    if (t && tiles.indexOf(t) === -1) { tiles.push(t); prevBlocked.push(t.blocked); t.blocked = true; }
  });
  const path = findPath(bf, e.x, e.y, gx, gy);
  for (let i = 0; i < tiles.length; i++) tiles[i].blocked = prevBlocked[i];
  return path;
}

/**
 * One movement tick: hold (or wait for) the claim on the current waypoint's
 * own hex before advancing toward it; pivot toward it; drive straight along
 * the facing once aligned; advance the stored path on arrival; refuse a
 * step into an impassable tile.
 * @param {import('./Entity.js').Entity} e @param {number} dt seconds @returns {void}
 */
export function pivotAndDrive(e, dt) {
  const mt = e.moveTarget;
  if (!mt) return;
  if (!claimWaypoint(e, mt, dt)) return; // someone else holds this hex — wait (or we just re-routed)
  const dx = mt.x - e.x;
  const dy = mt.y - e.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= VEHICLE.arrivalPx) { arriveAtWaypoint(e); return; }
  const bearing = Math.atan2(dy, dx);
  e.rotation = rotateToward(e.rotation, bearing, e.turnRateRadPerSec * dt);
  if (Math.abs(wrapAngle(bearing - e.rotation)) > degToRad(VEHICLE.headingAlignDeg)) return;
  const tmult = e.battlefield ? e.battlefield.getTileAt(e.x, e.y)?.speedMult ?? 1 : 1;
  const step = Math.min(e.speed * e.moveSpeedMult * tmult * dt, dist);
  const nx = e.x + Math.cos(e.rotation) * step;
  const ny = e.y + Math.sin(e.rotation) * step;
  if (e.battlefield && !e.battlefield.isPassable(nx, ny)) { blockedStep(e, step, dt * MS_PER_SECOND); return; }
  e.x = nx;
  e.y = ny;
}

/**
 * Hold (or acquire) the claim on waypoint `mt`'s own hex — the caller may
 * only advance toward it once this returns true. `HexOccupancy.claim`
 * already releases the entity's own previous claim when it succeeds, so
 * this is also how a unit's reservation moves forward hex-by-hex as its
 * `moveTarget` advances, with no extra bookkeeping here. Past
 * WAIT_TIMEOUT_MS of waiting on the SAME contested hex, gives up and
 * re-routes around whoever holds it instead of waiting indefinitely.
 * @param {import('./Entity.js').Entity} e @param {{x:number,y:number}} mt @param {number} dt seconds
 * @returns {boolean} true once the claim is held (safe to advance)
 */
export function claimWaypoint(e, mt, dt) {
  const bf = e.battlefield;
  if (!bf) return true;
  const a = bf.grid.pixelToAxial(mt.x, mt.y);
  if (bf.occupancy.claim(e.id, a.q, a.r)) { e._waitMs = 0; return true; }
  e._waitMs = (e._waitMs || 0) + dt * MS_PER_SECOND;
  if (e._waitMs >= WAIT_TIMEOUT_MS) { e._waitMs = 0; replanAroundEveryone(e); }
  return false;
}

/**
 * @private After waiting too long for a contested waypoint, re-plan the
 * WHOLE route to the final goal with every current live unit blocked at
 * once (`findPathAroundUnits` — not just the one hex this unit happens to
 * be touching: a partial, one-hex-at-a-time reroute is what caused the
 * dodge-A-into-B-into-A "circling" bug this replaces).
 * @param {import('./Entity.js').Entity} e @returns {void}
 */
function replanAroundEveryone(e) {
  const goal = e._path ? e._path[e._path.length - 1] : e.moveTarget;
  if (!goal) return;
  const path = findPathAroundUnits(e, goal.x, goal.y);
  if (path && path.length > 0) { e._path = path; e._pathIdx = 0; e.moveTarget = path[0]; return; }
  clearRoute(e); // no route exists even around everyone — settle where it is
}

/**
 * Recover from a blocked forward step instead of stopping dead (TERRAIN
 * only — walls, obstacles; unit-to-unit is `claimWaypoint`'s job, above).
 * Two parts: 1. immediate unstick — slide one full step along the passable
 * hex direction closest to the bearing toward the current waypoint;
 * 2. recompute the A* route to the goal (throttled by
 * VEHICLE.repathCooldownMs, never per frame) so the unit stops grinding
 * the wall and follows a clean path around it. Shared by pivotAndDrive and
 * TankMotor. A unit only truly stops when it can neither slide nor find
 * any route to the goal.
 * @param {import('./Entity.js').Entity} e @param {number} stepMag px this tick
 * @param {number} dtMs elapsed ms this tick @returns {void}
 */
export function blockedStep(e, stepMag, dtMs) {
  const bf = e.battlefield;
  if (e._repathCoolMs > 0) e._repathCoolMs -= dtMs;
  const mt = e.moveTarget;
  const mag = stepMag > 0 ? stepMag : 1;
  const slid = mt ? slideAlongHex(e, bf, mag) : false;
  if (e._repathCoolMs > 0) return;
  e._repathCoolMs = VEHICLE.repathCooldownMs;
  const goal = e._path ? e._path[e._path.length - 1] : mt;
  const path = goal && findPath(bf, e.x, e.y, goal.x, goal.y);
  if (path && path.length > 0) { e._path = path; e._pathIdx = 0; e.moveTarget = path[0]; }
  else if (!slid) clearRoute(e);
}

/**
 * Slide one step (px `mag`) along the passable hex direction whose bearing is
 * closest to the vector toward moveTarget; widen the search off-axis until one
 * is clear. Mutates e.x/e.y. @returns {boolean} whether it moved.
 * @param {import('./Entity.js').Entity} e
 * @param {import('../worldmap/WorldField.js').WorldField} bf @param {number} mag
 */
function slideAlongHex(e, bf, mag) {
  const tdx = e.moveTarget.x - e.x;
  const tdy = e.moveTarget.y - e.y;
  const tlen = Math.hypot(tdx, tdy) || 1;
  const ux = tdx / tlen;
  const uy = tdy / tlen;
  let best = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < HEX_PX_DIRS.length; i++) {
    const dot = HEX_PX_DIRS[i].x * ux + HEX_PX_DIRS[i].y * uy;
    if (dot > bestDot) { bestDot = dot; best = i; }
  }
  for (let k = 0; k < SLIDE_ORDER.length; k++) {
    const d = HEX_PX_DIRS[(best + SLIDE_ORDER[k]) % HEX_PX_DIRS.length];
    const nx = e.x + d.x * mag;
    const ny = e.y + d.y * mag;
    if (bf.isPassable(nx, ny)) { e.x = nx; e.y = ny; return true; }
  }
  return false;
}

/**
 * Waypoint reached: step to the next point on the stored path, or finish the
 * move. Only advances a path whose current waypoint is still the live
 * moveTarget (so a controller that set moveTarget directly is left alone).
 * @param {import('./Entity.js').Entity} e @returns {void}
 */
export function arriveAtWaypoint(e) {
  const path = e._path;
  const idx = e._pathIdx;
  if (path && e.moveTarget === path[idx] && idx < path.length - 1) {
    e._pathIdx = idx + 1;
    e.moveTarget = path[idx + 1];
    return;
  }
  clearRoute(e);
}

/**
 * Settle into a rest hex, claiming it. In normal operation this is already
 * held (claimWaypoint secures the final waypoint's hex before the unit can
 * even approach it), so this mostly just confirms it; the fallback (hop to
 * the nearest free neighbour) remains as a defensive catch-all.
 * @param {import('./Entity.js').Entity} e @returns {void}
 */
export function clearRoute(e) {
  e._path = null;
  e._pathIdx = 0;
  e.moveTarget = null;
  if (!e.isAlive || !e.battlefield) return;
  const bf = e.battlefield;
  const a = bf.grid.pixelToAxial(e.x, e.y);
  if (bf.occupancy.claim(e.id, a.q, a.r)) return;
  const free = bf.occupancy.nearestFree(a.q, a.r, e.id);
  const p = bf.grid.axialToPixel(free.q, free.r);
  resolvePath(e, p.x, p.y);
}

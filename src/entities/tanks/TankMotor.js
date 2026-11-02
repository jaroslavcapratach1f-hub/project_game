/**
 * TankMotor — hull movement for a tank: steer the hull toward the move/attack
 * heading at hullTurnDegPerSec, and only ramp speed + advance once the hull is
 * aligned to that heading (within VEHICLE.headingAlignDeg) AND `hullFree` — so
 * the tank pivots in place first, then drives straight, and holds fully still
 * while the turret recentres on a fresh move order. Refuses a step into an
 * impassable tile; shares path progression with entityMotion.js. No Graphics.
 */
import { VEHICLE } from '../../config/EntityConfig.js';
import { degToRad, rotateToward, wrapAngle } from '../../utils/MathUtils.js';
import { arriveAtWaypoint, blockedStep, claimWaypoint } from '../entityMotion.js';

const MS_PER_SECOND = 1000;

export class TankMotor {
  /** @param {number} hullTurnDegPerSec */
  constructor(hullTurnDegPerSec) {
    /** @private rad/sec */ this._turnRate = degToRad(hullTurnDegPerSec);
    /** @private px/sec */ this._speed = 0;
    /** @private */ this._distToGoal = Infinity;
  }

  /** @returns {number} current hull speed, px/sec */
  get speed() { return this._speed; }

  /**
   * @param {number} dt seconds
   * @param {import('./BaseTank.js').BaseTank} tank
   * @param {boolean} [hullFree=true] false while the turret is still recentring
   *   to hull-front on a fresh move order — hull must not turn or advance
   * @returns {void}
   */
  update(dt, tank, hullFree = true) {
    this._checkArrival(tank);
    // S81: hold the claim on the CURRENT waypoint's own hex before driving
    // toward it — another unit already holding it means waiting in place
    // (still free to steer/align, just not advance) instead of pushing in.
    const waiting = tank.moveTarget ? !claimWaypoint(tank, tank.moveTarget, dt) : false;
    const heading = this._desiredHeading(tank);
    if (heading !== null && hullFree) this._steer(dt, tank, heading);
    const canDrive = hullFree && !waiting && (heading === null || this._aligned(tank, heading));
    this._rampSpeed(dt, tank, canDrive);
    if (canDrive) this._advance(dt, tank);
  }

  /** @private advance the path (or finish) once inside VEHICLE.arrivalPx */
  _checkArrival(tank) {
    this._distToGoal = Infinity;
    const mt = tank.moveTarget;
    if (!mt) return;
    const dx = mt.x - tank.x;
    const dy = mt.y - tank.y;
    this._distToGoal = Math.sqrt(dx * dx + dy * dy);
    if (this._distToGoal <= VEHICLE.arrivalPx) {
      arriveAtWaypoint(tank); // -> next waypoint, or clears moveTarget
      this._distToGoal = Infinity; // drive through interior waypoints, no brake
    }
  }

  /** @private @returns {boolean} hull within VEHICLE.headingAlignDeg of `heading` */
  _aligned(tank, heading) {
    return Math.abs(wrapAngle(heading - tank.rotation)) <= degToRad(VEHICLE.headingAlignDeg);
  }

  /**
   * @private Heading (radians) to steer the hull toward, or null to hold the
   * current heading. Rules: face a move target; else face an attack target only
   * while chasing it into range, OR always if `noTurret` (the whole body aims).
   * A turreted tank in range holds its heading and lets the turret do the work.
   * @param {import('./BaseTank.js').BaseTank} tank
   */
  _desiredHeading(tank) {
    if (tank.moveTarget) return Math.atan2(tank.moveTarget.y - tank.y, tank.moveTarget.x - tank.x);
    const t = tank.target;
    if (t && t.isAlive && (tank.noTurret || tank.getDistanceTo(t) > tank.rangePx)) {
      return Math.atan2(t.y - tank.y, t.x - tank.x);
    }
    return null;
  }

  /** @private shortest-arc hull steer, capped at turnRate * dt */
  _steer(dt, tank, heading) {
    tank.rotation = rotateToward(tank.rotation, heading, this._turnRate * dt);
  }

  /** @private ramp _speed toward the wanted speed, braking near the goal */
  _rampSpeed(dt, tank, canDrive) {
    const chase = tank.target && tank.target.isAlive && tank.getDistanceTo(tank.target) > tank.rangePx;
    let want = canDrive && (tank.moveTarget || chase) ? tank.speed * (tank.moveSpeedMult ?? 1) : 0;
    if (canDrive && tank.moveTarget) {
      const brakeDist = tank.speed * (VEHICLE.decelRampMs / MS_PER_SECOND);
      if (this._distToGoal < brakeDist) want *= this._distToGoal / brakeDist;
    }
    const accel = want > this._speed;
    const rampMs = accel ? VEHICLE.accelRampMs : VEHICLE.decelRampMs;
    const dv = (tank.speed / (rampMs / MS_PER_SECOND)) * dt;
    this._speed = accel ? Math.min(want, this._speed + dv) : Math.max(want, this._speed - dv);
  }

  /** @private move along the hull heading; recover (slide / re-path) at an impassable tile */
  _advance(dt, tank) {
    if (this._speed <= 0) return;
    const bf = tank.battlefield;
    const mult = bf ? bf.getTileAt(tank.x, tank.y)?.speedMult ?? 1 : 1;
    const step = this._speed * dt * mult;
    const nx = tank.x + Math.cos(tank.rotation) * step;
    const ny = tank.y + Math.sin(tank.rotation) * step;
    if (bf && !bf.isPassable(nx, ny)) {
      blockedStep(tank, step, dt * MS_PER_SECOND); // slide toward the waypoint / re-path — momentum kept
      return;
    }
    tank.x = nx;
    tank.y = ny;
  }
}

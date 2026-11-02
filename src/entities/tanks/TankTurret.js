/**
 * TankTurret — turret aiming for a tank: slew tank.turretAngle toward the
 * bearing to tank.target (fallback: the hull heading) at turretTurnDegPerSec,
 * shortest arc. Also owns the recoil phase: a fast retract over recoil.outMs
 * then a slower return over recoil.returnMs. Pure logic, no Graphics.
 */
import { VEHICLE } from '../../config/EntityConfig.js';
import { degToRad, rotateToward, wrapAngle } from '../../utils/MathUtils.js';

const MS_PER_SECOND = 1000;

export class TankTurret {
  /** @param {number} turretTurnDegPerSec */
  constructor(turretTurnDegPerSec) {
    /** @private rad/sec */ this._turnRate = degToRad(turretTurnDegPerSec);
    /** @private signed aim error after the last slew, radians */ this._error = Math.PI;
    /** @private ms into the recoil cycle, or -1 when at rest */ this._recoilMs = -1;
  }

  /**
   * @param {number} dt seconds
   * @param {import('./BaseTank.js').BaseTank} tank
   * @returns {void}
   */
  update(dt, tank) {
    const bearing = this._bearing(tank);
    if (this._turnRate === 0) {
      // fixed barrel: lock to the hull, so isOnTarget() measures HULL alignment
      tank.turretAngle = tank.rotation;
      this._error = wrapAngle(bearing - tank.rotation);
    } else {
      tank.turretAngle = rotateToward(tank.turretAngle, bearing, this._turnRate * dt);
      this._error = wrapAngle(bearing - tank.turretAngle);
    }
    if (this._recoilMs >= 0) {
      this._recoilMs += dt * MS_PER_SECOND;
      if (this._recoilMs >= VEHICLE.recoil.outMs + VEHICLE.recoil.returnMs) this._recoilMs = -1;
    }
  }

  /** @private @returns {number} radians */
  _bearing(tank) {
    const t = tank.target;
    if (t && t.isAlive) return Math.atan2(t.y - tank.y, t.x - tank.x);
    if (typeof tank.lookAngle === 'number') return tank.lookAngle; // AI IDLE sweep
    return tank.rotation;
  }

  /** Begin a recoil cycle. @returns {void} */
  fireRecoil() { this._recoilMs = 0; }

  /**
   * @param {number} toleranceDeg
   * @returns {boolean} turret is aligned to the bearing within tolerance
   */
  isOnTarget(toleranceDeg) {
    return Math.abs(this._error) <= degToRad(toleranceDeg);
  }

  /**
   * Whether the barrel points within `toleranceDeg` of the hull's forward axis
   * — the sequential-move gate: the hull stays frozen until this reads true.
   * Independent of `_bearing`, so it holds during a target-less recentring; a
   * fixed barrel (turnRate 0) is trivially front-aligned.
   * @param {import('./BaseTank.js').BaseTank} tank @param {number} toleranceDeg
   * @returns {boolean}
   */
  isFrontAligned(tank, toleranceDeg) {
    return Math.abs(wrapAngle(tank.rotation - tank.turretAngle)) <= degToRad(toleranceDeg);
  }

  /** @returns {number} barrel retract distance in px for the current phase (0 at rest) */
  get recoilOffsetPx() {
    const r = VEHICLE.recoil;
    if (this._recoilMs < 0) return 0;
    if (this._recoilMs < r.outMs) return r.retractPx * (this._recoilMs / r.outMs);
    const k = (this._recoilMs - r.outMs) / r.returnMs;
    return r.retractPx * Math.max(0, 1 - k);
  }
}
